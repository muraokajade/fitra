"use client";

// Next.jsのルーティング系フック
import { useRouter, useSearchParams } from "next/navigation";
// React
import * as React from "react";
// UI
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Step2で扱う1行の型
// name = 種目名（固定）
// weight/reps/sets = 入力中のdraft（文字列で保持）
type ExerciseInput = {
  name: string;
  weight: string;
  reps: string;
  sets: string;
};

export default function TrainingStep2() {
  // ページ遷移
  const router = useRouter();
  // URLクエリ取得（step1から ?exercises=... が来る想定）
  const params = useSearchParams();

  // ---------------------------------------------
  // ① Step1のクエリから「種目リスト」を作る（初期行）
  // ---------------------------------------------
  const initialRows: ExerciseInput[] = React.useMemo(() => {
    // step1が渡す exercises を読む
    const raw = params.get("exercises");
    // 無ければ空
    if (!raw) return [];

    try {
      // ["スクワット","リアレイズ"] みたいな配列を想定
      const list = JSON.parse(raw) as string[];

      // 種目ごとの行を作る（入力欄は空）
      return list.map((name) => ({
        name,        // 種目（固定）
        weight: "",  // draft
        reps: "",    // draft
        sets: "",    // draft
      }));
    } catch {
      // 壊れてても落ちないように空にする
      return [];
    }
  }, [params]);

  // ---------------------------------------------
  // ② 画面で編集される「現在のrows」
  // ---------------------------------------------
  const [rows, setRows] = React.useState<ExerciseInput[]>(initialRows);

  // ★ 注意：initialRowsが変わってもuseStateは一度しか効かないので同期
  //（step1から来た種目が変わった時など）
  React.useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  // ---------------------------------------------
  // ③ DBから「最新1回分」を取得して rows にマージ
  //    - rowsのname一覧をAPIへ送る
  //    - 戻りは nameMap（名前→ {weight,reps,sets}）
  //    - 空欄だけDBで埋める（最小差分で安全）
  // ---------------------------------------------
  React.useEffect(() => {
    // 種目が無ければ何もしない
    if (rows.length === 0) return;

    // names配列を作る
    const names = rows.map((r) => r.name);

    const fetchLatestFromDb = async () => {
      try {
        const res = await fetch("/api/training/latest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ names }),
        });

        if (!res.ok) throw new Error("failed to fetch latest");

        // 例: { "スクワット":{weight:"60",reps:"8",sets:"3"}, ... }
        const nameMap = (await res.json()) as Record<
          string,
          { weight: string; reps: string; sets: string }
        >;

        // rowsにマージ
        setRows((prev) =>
          prev.map((row) => {
            const db = nameMap[row.name];
            if (!db) return row;

            // ★「空欄だけ」DBで埋める（ユーザー入力を上書きしない）
            return {
              ...row,
              weight: row.weight || db.weight || "",
              reps: row.reps || db.reps || "",
              sets: row.sets || db.sets || "",
            };
          })
        );
      } catch (e) {
        // 失敗しても画面は動く（最小差分）
        console.error(e);
      }
    };

    fetchLatestFromDb();
    // rowsを依存にすると入力のたびに叩くので、namesを固定したい
    // まずは初回だけの挙動でOKなら initialRows を依存にするのが安全
    // ここは最小で「initialRowsベースで叩く」にするのもアリ
  }, [initialRows]); // ★ ここがポイント：入力中に再フェッチしない

  // ---------------------------------------------
  // ④ input変更（draft更新）
  // ---------------------------------------------
  const handleChange = (
    index: number,
    key: keyof Omit<ExerciseInput, "name">,
    value: string
  ) => {
    // 対象indexだけ更新
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    );
  };

  // ---------------------------------------------
  // ⑤ 次へ（Step3へクエリで渡す）
  // ---------------------------------------------
  const handleNext = () => {
    // Step3へ渡すためURLクエリ化
    const query = new URLSearchParams({
      training: JSON.stringify(rows),
    }).toString();

    router.push(`/training/step3?${query}`);
  };

  // ---------------------------------------------
  // ⑥ バリデーション（全部空なら進めない）
  // ---------------------------------------------
  const isDisabled =
    rows.length === 0 || rows.every((r) => !r.weight && !r.reps && !r.sets);

  // ---------------------------------------------
  // ⑦ UI
  // ---------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4">
        <Card className="w-full max-w-3xl mx-auto bg-slate-900/80 border-slate-700">
          <CardContent className="p-6 sm:p-8">
            <Button
              type="button"
              onClick={() => router.back()}
              className="mb-4 w-auto px-3 py-1 text-xs bg-transparent hover:bg-slate-800 text-slate-300"
            >
              ← 戻る
            </Button>

            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-1">
              FITRA / TRAINING ANALYZER
            </p>
            <p className="text-[11px] text-slate-400 mb-3">Step 2 / 3</p>

            <h1 className="text-2xl font-bold mb-2">重量・レップ・セットを入力</h1>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              さきほど選んだ種目ごとに、今日のメインセットの情報を入力してください。
              正確でなくてOK。トレーニングの大まかな強度が分かればAIが解析できます。
            </p>

            {rows.length === 0 ? (
              <p className="text-sm text-slate-500">
                種目が取得できませんでした。ステップ1に戻って種目を選び直してください。
              </p>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {rows.map((row, index) => (
                  <div
                    key={row.name}
                    className="rounded-lg border border-slate-700 bg-slate-900/60 p-4"
                  >
                    {/* ★ これが種目 */}
                    <p className="text-sm font-semibold mb-3">{row.name}</p>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-slate-300">重量 (kg)</label>
                        {/* ★ これがdraft（入力内容） */}
                        <Input
                          type="number"
                          value={row.weight}
                          onChange={(e) => handleChange(index, "weight", e.target.value)}
                          placeholder="例：60"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-300">レップ数</label>
                        <Input
                          type="number"
                          value={row.reps}
                          onChange={(e) => handleChange(index, "reps", e.target.value)}
                          placeholder="例：8"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-300">セット数</label>
                        <Input
                          type="number"
                          value={row.sets}
                          onChange={(e) => handleChange(index, "sets", e.target.value)}
                          placeholder="例：3"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button className="w-full mt-6" disabled={isDisabled} onClick={handleNext}>
              次へ
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
