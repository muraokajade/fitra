"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ExerciseInput = {
  name: string;
  weight: string;
  reps: string;
  sets: string;
};

export default function TrainingStep2() {
  const router = useRouter();
  const params = useSearchParams();

  const initialRows: ExerciseInput[] = React.useMemo(() => {
    const raw = params.get("exercises");
    if (!raw) return [];

    try {
      const list = JSON.parse(raw) as string[];
      return list.map((name) => ({
        name,
        weight: "",
        reps: "",
        sets: "",
      }));
    } catch {
      return [];
    }
  }, [params]);

  const [rows, setRows] = React.useState<ExerciseInput[]>(initialRows);

  const handleChange = (
    index: number,
    key: keyof Omit<ExerciseInput, "name">,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    );
  };

  const handleNext = () => {
    const query = new URLSearchParams({
      training: JSON.stringify(rows),
    }).toString();

    router.push(`/training/step3?${query}`);
  };

  const isDisabled =
    rows.length === 0 || rows.every((r) => !r.weight && !r.reps && !r.sets);

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

            {/* 新しいヘッダー */}
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-1">
              FITRA / TRAINING ANALYZER
            </p>
            <p className="text-[11px] text-slate-400 mb-3">Step 2 / 3</p>

            <h1 className="text-2xl font-bold mb-2">
              重量・レップ・セットを入力
            </h1>
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
                    <p className="text-sm font-semibold mb-3">{row.name}</p>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-slate-300">
                          重量 (kg)
                        </label>
                        <Input
                          type="number"
                          value={row.weight}
                          onChange={(e) =>
                            handleChange(index, "weight", e.target.value)
                          }
                          placeholder="例：60"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-300">
                          レップ数
                        </label>
                        <Input
                          type="number"
                          value={row.reps}
                          onChange={(e) =>
                            handleChange(index, "reps", e.target.value)
                          }
                          placeholder="例：8"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-300">
                          セット数
                        </label>
                        <Input
                          type="number"
                          value={row.sets}
                          onChange={(e) =>
                            handleChange(index, "sets", e.target.value)
                          }
                          placeholder="例：3"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              className="w-full mt-6"
              disabled={isDisabled}
              onClick={handleNext}
            >
              次へ
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
