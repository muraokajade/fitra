"use client";

/** -------------------------------------------------
 * Step2 UX最短改善版（警告潰し強化）
 * - inputは常に「文字列」( "" or "123" ) をvalueに渡して controlled固定
 * - onChangeで NaN/Infinity を "" に潰す
 * ------------------------------------------------- */

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useTrainingDraft, type TrainingInputs } from "@/hooks/useTrainingDraft";

type Field = "weight" | "reps" | "sets";

const toInputValue = (v: number | "" | undefined | null) => {
  // Inputのvalueは「常にstring」に固定（undefined禁止）
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return "";
};

const toDraftNumber = (raw: string): number | "" => {
  // number inputでも "e" や "-" などでNaNが出る瞬間があるので潰す
  if (raw === "") return "";
  const n = Number(raw);
  return Number.isFinite(n) ? n : "";
};

export default function TrainingStep2() {
  const router = useRouter();
  const params = useSearchParams();

  const selectedExerciseKeys = React.useMemo(() => {
    const raw = params.get("exercises");
    if (!raw) return [];
    try {
      const list = JSON.parse(raw) as string[];
      return list.filter(Boolean);
    } catch {
      return [];
    }
  }, [params]);

  const userId = "demo";

  const dateKey = React.useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const fetchLatestFromDb = React.useCallback(async (): Promise<TrainingInputs | null> => {
    if (selectedExerciseKeys.length === 0) return null;

    const res = await fetch("/api/training/latest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names: selectedExerciseKeys }),
    });

    if (!res.ok) return null;

    const nameMap = (await res.json()) as Record<
      string,
      { weight: string; reps: string; sets: string }
    >;

    const converted: TrainingInputs = {};
    for (const key of selectedExerciseKeys) {
      const db = nameMap[key];
      if (!db) continue;

      const w = Number(db.weight);
      const r = Number(db.reps);
      const s = Number(db.sets);

      converted[key] = {
        weight: Number.isFinite(w) && w > 0 ? w : "",
        reps: Number.isFinite(r) && r > 0 ? r : "",
        sets: Number.isFinite(s) && s > 0 ? s : "",
      };
    }

    return Object.keys(converted).length ? converted : null;
  }, [selectedExerciseKeys]);

  const { draft, updateField, hydrating, resetToEmpty } = useTrainingDraft({
    userId,
    dateKey,
    selectedExerciseKeys,
    fetchLatestFromDb,
  });

  const [activeKey, setActiveKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!activeKey && selectedExerciseKeys.length > 0) {
      setActiveKey(selectedExerciseKeys[0]);
    }
  }, [activeKey, selectedExerciseKeys]);

  const refs = React.useRef<Record<string, HTMLInputElement | null>>({});

  const setRef =
    (k: string, field: Field) => (el: HTMLInputElement | null) => {
      refs.current[`${k}:${field}`] = el;
    };

  const focusField = (k: string, field: Field) => {
    refs.current[`${k}:${field}`]?.focus();
  };

  const focusNext = (k: string, field: Field) => {
    const idx = selectedExerciseKeys.indexOf(k);
    if (idx === -1) return;

    if (field === "weight") return focusField(k, "reps");
    if (field === "reps") return focusField(k, "sets");

    const nextKey = selectedExerciseKeys[idx + 1];
    if (nextKey) {
      setActiveKey(nextKey);
      requestAnimationFrame(() => focusField(nextKey, "weight"));
    }
  };

  const handleNext = () => {
    const rows = selectedExerciseKeys.map((name) => {
      const v = draft[name] ?? { weight: "", reps: "", sets: "" };
      return {
        name,
        weight: v.weight === "" ? "" : String(v.weight),
        reps: v.reps === "" ? "" : String(v.reps),
        sets: v.sets === "" ? "" : String(v.sets),
      };
    });

    const query = new URLSearchParams({
      training: JSON.stringify(rows),
    }).toString();

    router.push(`/training/step3?${query}`);
  };

  const isDisabled =
    selectedExerciseKeys.length === 0 ||
    selectedExerciseKeys.every((k) => {
      const v = draft[k];
      return !v || (v.weight === "" && v.reps === "" && v.sets === "");
    });

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
              触った瞬間に保存されます（localStorageが真実）。未入力なら前回値を自動補完します。
            </p>

            {hydrating && (
              <p className="text-xs text-slate-400 mb-3">
                入力状態を復元中（localStorage → 必要ならDB）…
              </p>
            )}

            <Button
              type="button"
              onClick={resetToEmpty}
              className="mb-4 w-auto px-3 py-1 text-xs bg-transparent hover:bg-slate-800 text-slate-300"
            >
              全部クリア
            </Button>

            {selectedExerciseKeys.length === 0 ? (
              <p className="text-sm text-slate-500">
                種目が取得できませんでした。ステップ1に戻って選び直してください。
              </p>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {selectedExerciseKeys.map((key) => {
                  const v = draft[key] ?? { weight: "", reps: "", sets: "" };
                  const opened = activeKey === key;

                  return (
                    <div
                      key={key}
                      className="rounded-lg border border-slate-700 bg-slate-900/60"
                    >
                      <button
                        type="button"
                        className="w-full text-left p-4 flex items-center justify-between"
                        onClick={() => setActiveKey(opened ? null : key)}
                      >
                        <span className="text-sm font-semibold">{key}</span>
                        <span className="text-xs text-slate-400">
                          {opened ? "▲" : "▼"}
                        </span>
                      </button>

                      {opened && (
                        <div className="px-4 pb-4">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs text-slate-300">重量 (kg)</label>
                              <Input
                                ref={setRef(key, "weight")}
                                inputMode="numeric"
                                type="number"
                                value={toInputValue(v.weight)}
                                onFocus={() => setActiveKey(key)}
                                onChange={(e) =>
                                  updateField(key, "weight", toDraftNumber(e.target.value))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    focusNext(key, "weight");
                                  }
                                }}
                                placeholder="例：60"
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <label className="text-xs text-slate-300">レップ数</label>
                              <Input
                                ref={setRef(key, "reps")}
                                inputMode="numeric"
                                type="number"
                                value={toInputValue(v.reps)}
                                onFocus={() => setActiveKey(key)}
                                onChange={(e) =>
                                  updateField(key, "reps", toDraftNumber(e.target.value))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    focusNext(key, "reps");
                                  }
                                }}
                                placeholder="例：8"
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <label className="text-xs text-slate-300">セット数</label>
                              <Input
                                ref={setRef(key, "sets")}
                                inputMode="numeric"
                                type="number"
                                value={toInputValue(v.sets)}
                                onFocus={() => setActiveKey(key)}
                                onChange={(e) =>
                                  updateField(key, "sets", toDraftNumber(e.target.value))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    focusNext(key, "sets");
                                  }
                                }}
                                placeholder="例：3"
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <div className="mt-3 flex justify-end">
                            <Button
                              type="button"
                              className="px-3 py-1 text-xs bg-transparent border border-slate-700 hover:bg-slate-800"
                              onClick={() => focusNext(key, "sets")}
                            >
                              次の種目へ →
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
