"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type TrainingRow = {
  name: string;
  weight: number;
  reps: number;
  sets: number;
  volume: number;
};

type TrainingRecord = {
  id: string;
  date: string;
  rows: TrainingRow[];
  totalVolume: number;
  totalSets: number;
  totalReps: number;
};

const STORAGE_KEY = "fitra_training_records";

export default function TrainingHistoryPage() {
  const router = useRouter();
  const [records, setRecords] = React.useState<TrainingRecord[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: TrainingRecord[] = raw ? JSON.parse(raw) : [];
      // 新しい順にソート
      list.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecords(list);
    } catch (e) {
      console.error("failed to load training records", e);
    }
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
        <Card className="w-full max-w-4xl mx-auto bg-slate-900/80 border-slate-700">
          <CardContent className="p-6 sm:p-8">
            <Button
              type="button"
              onClick={() => router.push("/")}
              className="mb-4 w-auto px-3 py-1 text-xs bg-transparent hover:bg-slate-800 text-slate-300"
            >
              ← ホームに戻る
            </Button>

            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-2">
              FITRA / TRAINING HISTORY
            </p>

            <h1 className="text-2xl font-bold mb-4">トレーニング履歴</h1>
            <p className="text-sm text-slate-300 mb-4">
              これまでに記録したトレーニングの一覧です。
            </p>

            {records.length === 0 ? (
              <p className="text-sm text-slate-500">
                まだトレーニング記録がありません。まずは今日のトレーニングを記録してみましょう。
              </p>
            ) : (
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-lg border border-slate-700 bg-slate-900/60 p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-semibold">
                          {formatDate(record.date)}
                        </p>
                        <p className="text-xs text-slate-400">
                          種目数：{record.rows.length} 種目
                        </p>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span>
                          総ボリューム：{" "}
                          <span className="font-semibold">
                            {record.totalVolume.toLocaleString()} kg
                          </span>
                        </span>
                        <span>セット：{record.totalSets}</span>
                        <span>レップ：{record.totalReps}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {record.rows.map((row) => (
                        <span
                          key={row.name}
                          className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-100"
                        >
                          {row.name} / {row.weight}kg × {row.reps}rep ×{" "}
                          {row.sets}set
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button onClick={() => router.push("/training/step1")}>
                今日のトレーニングを記録する
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
