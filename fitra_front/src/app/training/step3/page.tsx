"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrainingRow,
  TrainingRowRaw,
  TrainingRecord,
  TrainingFeedbackRequest,
  TrainingFeedbackResponse,
} from "@/types/training";

const STORAGE_KEY = "fitra_training_records";

// URLクエリから rows / totals を取り出すユーティリティ
function parseTrainingFromParams(params: URLSearchParams): {
  validRows: TrainingRow[];
  totalVolume: number;
  totalSets: number;
  totalReps: number;
} {
  const raw = params.get("training");
  if (!raw) {
    return {
      validRows: [],
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
    };
  }

  try {
    const list = JSON.parse(raw) as TrainingRowRaw[];

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

    const totalVolume = rows.reduce((sum, r) => sum + r.volume, 0);
    const totalSets = rows.reduce((sum, r) => sum + r.sets, 0);
    const totalReps = rows.reduce((sum, r) => sum + r.reps * r.sets, 0);

    return { validRows: rows, totalVolume, totalSets, totalReps };
  } catch (e) {
    console.error("failed to parse training", e);
    return {
      validRows: [],
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
    };
  }
}

export default function TrainingStep3() {
  const router = useRouter();
  const params = useSearchParams();
  const [feedback, setFeedback] = React.useState("");
  const [loadingFeedback, setLoadingFeedback] = React.useState(false);
  const [feedbackError, setFeedbackError] = React.useState<string | null>(null);

  const { validRows, totalVolume, totalSets, totalReps } = React.useMemo(
    () => parseTrainingFromParams(params),
    [params]
  );

  const hasData = validRows.length > 0;

  const handleBack = () => {
    router.back();
  };

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

  React.useEffect(() => {
    if (!hasData) return;

    const fetchFeedback = async () => {
      try {
        setLoadingFeedback(true);
        setFeedbackError(null);

        const body: TrainingFeedbackRequest = {
          totalVolume,
          totalSets,
          totalReps,
          rows: validRows,
        };

        const res = await fetch("/api/training/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error("failed to fetch feedback");

        const data: TrainingFeedbackResponse = await res.json();
        setFeedback(data.feedback ?? "");
      } catch (e) {
        console.error(e);
        setFeedbackError(
          "AIコメントの取得に失敗しました。しばらくしてからもう一度お試しください。"
        );
      } finally {
        setLoadingFeedback(false);
      }
    };

    fetchFeedback();
  }, [hasData, totalVolume, totalSets, totalReps, validRows]);

  // JSX 部分はそのままでOK（略）
  // ↓ここに今の JSX をそのまま貼り戻しで動く

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

            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-2">
              FITRA / TRAINING ANALYZER
            </p>

            <h1 className="text-2xl font-bold mb-2">
              ステップ3：今日のトレーニング結果
            </h1>
            <p className="text-sm text-slate-300 mb-4">
              今日入力した内容から、総ボリュームとざっくり評価を表示します。
            </p>

            {!hasData ? (
              <p className="text-sm text-slate-500">
                有効なトレーニングデータがありません。Step2に戻って重量・レップ・セットを入力してください。
              </p>
            ) : (
              <>
                {/* 集計サマリー */}
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

                {/* 強度ラベル */}
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
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {feedback}
                    </p>
                  )}
                </div>

                {/* 種目ごとの詳細 */}
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
