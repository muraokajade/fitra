// TrainingStep3.tsx
// ステップ3：トレーニング結果 + レベル別AIフィードバック + 履歴保存

"use client";

// --- Typescript 型 ---
// 1日分のトレ内容サマリー（AIに渡す用）
import type { TrainingSummary } from "@/types/training";

// --- Next.js navigation フック ---
// useRouter: ページ遷移用
// useSearchParams: Step2 から受け取った ?training=... を読む
import { useRouter, useSearchParams } from "next/navigation";

// --- React Hooks ---
import * as React from "react";

// --- UI components ---
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// --- Training 系の型 ---
// TrainingRowRaw: Step2で入力した“文字列のまま”の行
// TrainingRow: number に変換済みの1行
// TrainingRecord: localStorage に保存する1日分
import type {
  TrainingRow,
  TrainingRowRaw,
  TrainingRecord,
} from "@/types/training";

// --- AI 共通型（ドメインごとに同じ形式でAIに渡す） ---
import type { AiFeedbackRequest } from "@/types/ai";

// --- ユーザー属性（レベル / 目標） ---
import type { UserLevel, UserGoal } from "@/types/user";

// localStorage に保存するキー
const STORAGE_KEY = "fitra_training_records";

// --------------------------------------------------------------
// Step2 から来た URL クエリ (?training=...) を
// TrainingRow[] + 合計値 に変換するユーティリティ関数
// --------------------------------------------------------------
function parseTrainingFromParams(params: URLSearchParams) {
  const raw = params.get("training");
  if (!raw) {
    // クエリがなければ空データ扱い
    return {
      validRows: [],
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
    };
  }

  try {
    // Step2で JSON.stringify した配列を復元
    const list = JSON.parse(raw) as TrainingRowRaw[];

    // 文字列 → number に変換し、volume を計算
    const rows: TrainingRow[] = list
      .map((row) => {
        const weight = Number(row.weight);
        const reps = Number(row.reps);
        const sets = Number(row.sets);
        return {
          name: row.name,
          weight,
          reps,
          sets,
          volume: weight * reps * sets,
        };
      })
      // ゴミ値（空、0、NaN）を除外
      .filter(
        (r) =>
          !!r.name &&
          r.weight > 0 &&
          r.reps > 0 &&
          r.sets > 0 &&
          !Number.isNaN(r.weight) &&
          !Number.isNaN(r.reps) &&
          !Number.isNaN(r.sets)
      );

    // 合計値を計算
    const totalVolume = rows.reduce((s, r) => s + r.volume, 0);
    const totalSets = rows.reduce((s, r) => s + r.sets, 0);
    const totalReps = rows.reduce((s, r) => s + r.reps * r.sets, 0);

    return { validRows: rows, totalVolume, totalSets, totalReps };
  } catch {
    // クエリが壊れていてもアプリが落ちないようにガード
    return {
      validRows: [],
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
    };
  }
}

// =====================================================
// メインコンポーネント（Step3）
// =====================================================
export default function TrainingStep3() {
  const router = useRouter();
  const params = useSearchParams();

  // AI コメント関連の state
  const [feedback, setFeedback] = React.useState("");
  const [loadingFeedback, setLoadingFeedback] = React.useState(false);
  const [feedbackError, setFeedbackError] = React.useState<string | null>(null);

  // Step2 のクエリをパース → 集計結果を得る
  const { validRows, totalVolume, totalSets, totalReps } = React.useMemo(
    () => parseTrainingFromParams(params),
    [params]
  );

  const hasData = validRows.length > 0;

  // 仮ユーザー設定（後で /mypage から取得する想定）
  const userLevel: UserLevel = "beginner";
  const userGoal: UserGoal = "health";

  // 画面表示時に AI へフィードバックを取りに行く
  React.useEffect(() => {
    if (!hasData) return;

    const fetchFeedback = async () => {
      try {
        setLoadingFeedback(true);
        setFeedbackError(null);

        // 1日分のトレサマリー（AIに渡す形）
        const summary: TrainingSummary = {
          totalVolume,
          totalSets,
          totalReps,
          rows: validRows,
        };

        // 全ドメイン共通の AI リクエスト形式
        const body: AiFeedbackRequest<TrainingSummary> = {
          domain: "training",
          level: userLevel,
          goal: userGoal,
          summary,
        };

        const res = await fetch("/api/training/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error("failed");

        const data = await res.json();
        setFeedback(data.feedback ?? "");
      } catch (e) {
        console.error(e);
        setFeedbackError("AIコメント取得に失敗しました");
      } finally {
        setLoadingFeedback(false);
      }
    };

    fetchFeedback();
  }, [hasData, totalVolume, totalSets, totalReps, validRows]);

  // Step2 に戻る
  const handleBack = () => router.back();

  // 「この内容で記録完了」→ localStorage に 1 日分を保存
  const handleFinish = () => {
    if (!hasData) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: TrainingRecord[] = raw ? JSON.parse(raw) : [];

      const newRecord: TrainingRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        rows: validRows,
        totalVolume,
        totalSets,
        totalReps,
      };

      const next = [...list, newRecord];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      router.push("/training/history");
    } catch (e) {
      console.error("failed to save training record", e);
    }
  };

  // =====================================================
  // UI 部分
  // =====================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4">
        <Card className="w-full max-w-3xl mx-auto bg-slate-900/80 border-slate-700">
          <CardContent className="p-6 sm:p-8">
            {/* 戻るボタン */}
            <Button
              type="button"
              onClick={handleBack}
              className="mb-4 w-auto px-3 py-1 text-xs bg-transparent hover:bg-slate-800 text-slate-300"
            >
              ← 戻る
            </Button>

            {/* 見出し */}
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-2">
              FITRA / TRAINING ANALYZER
            </p>

            <h1 className="text-2xl font-bold mb-2">
              ステップ3：今日のトレーニング結果
            </h1>
            <p className="text-sm text-slate-300 mb-4">
              今日入力した内容から、総ボリュームとざっくり評価を表示します。
            </p>

            {/* データが無いときの表示 */}
            {!hasData ? (
              <p className="text-sm text-slate-500">
                有効なデータがありません。Step2に戻って入力してください。
              </p>
            ) : (
              <>
                {/* 集計サマリー（3つのカード） */}
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                    <p className="text-xs text-slate-400 mb-1">総ボリューム</p>
                    <p className="text-xl font-bold">
                      {totalVolume.toLocaleString()}{" "}
                      <span className="text-xs text-slate-400">kg</span>
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                    <p className="text-xs text-slate-400 mb-1">総セット数</p>
                    <p className="text-xl font-bold">{totalSets}</p>
                  </div>

                  <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                    <p className="text-xs text-slate-400 mb-1">総レップ数</p>
                    <p className="text-xl font-bold">{totalReps}</p>
                  </div>
                </div>

                {/* AI コメントカード */}
                <div className="mb-6 rounded-lg border border-sky-600/40 bg-sky-900/20 p-4">
                  <p className="text-xs text-sky-300 mb-1">
                    本日のAIコーチコメント
                  </p>
                  <p className="text-[11px] text-slate-400 mb-2">
                    トレーニング内容（＋今後は食事内容）をもとに、AIがフィードバックします。
                  </p>

                  {loadingFeedback && (
                    <p className="text-sm text-slate-300">解析中です…</p>
                  )}

                  {feedbackError && !loadingFeedback && (
                    <p className="text-sm text-red-300">{feedbackError}</p>
                  )}

                  {!loadingFeedback && !feedbackError && feedback && (
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">
                      {feedback}
                    </p>
                  )}
                </div>

                {/* 種目ごとの詳細リスト */}
                <div className="mb-4 max-h-[260px] overflow-y-auto pr-1 space-y-3">
                  {validRows.map((row) => (
                    <div
                      key={row.name}
                      className="rounded-lg border border-slate-700 bg-slate-900/60 p-3"
                    >
                      <p className="text-sm font-semibold mb-2">{row.name}</p>
                      <p className="text-xs text-slate-300">
                        {row.weight} kg × {row.reps} reps × {row.sets} sets
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        ボリューム：{" "}
                        <span className="font-semibold">
                          {row.volume.toLocaleString()} kg
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 下部ボタン：戻る / 記録完了 */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                className="flex-1 border border-slate-600 bg-transparent hover:bg-slate-800 text-slate-100"
                onClick={handleBack}
              >
                修正する（Step2に戻る）
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={!hasData}
                onClick={handleFinish}
              >
                この内容で記録完了
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
