"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TrainingStep1() {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [exercises, setExercises] = useState<string[]>([]);

  // 種目マスタ
  const trainingMenu = {
    胸: [
      "ベンチプレス",
      "インクラインベンチプレス",
      "ダンベルベンチプレス",
      "チェストプレス",
      "ケーブルクロスオーバー",
    ],
    背中: [
      "デッドリフト",
      "ベントオーバーロウ",
      "ラットプルダウン",
      "チンニング(懸垂)",
      "シーテッドロウ",
    ],
    肩: ["ショルダープレス", "サイドレイズ", "フロントレイズ", "リアレイズ"],
    脚: [
      "スクワット",
      "ブルガリアンスクワット",
      "レッグプレス",
      "レッグエクステンション",
      "レッグカール",
      "カーフレイズ",
    ],
    腕: [
      "アームカール",
      "ハンマーカール",
      "ケーブルカール",
      "トライセプスプレスダウン",
      "ライイングトライセプス",
      "キックバック",
    ],
    体幹: [
      "プランク",
      "サイドプランク",
      "ロシアンツイスト",
      "アブローラー",
      "レッグレイズ",
    ],
  };

  const addExercise = () => {
    if (!selected) return;
    if (exercises.includes(selected)) return; // 重複防止
    setExercises((prev) => [...prev, selected]);
    setSelected("");
  };

  const removeExercise = (name: string) => {
    setExercises((prev) => prev.filter((e) => e !== name));
  };

  const handleNext = () => {
    const query = new URLSearchParams({
      exercises: JSON.stringify(exercises),
    }).toString();
    router.push(`/training/step2?${query}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4">
        <Card className="w-full max-w-xl mx-auto bg-slate-900/80 border-slate-700">
          <CardContent className="p-6 sm:p-8">
            {/* 戻るボタン */}
            <Button
              type="button"
              onClick={() => router.back()}
              className="mb-4 w-auto px-3 py-1 text-xs bg-transparent hover:bg-slate-800 text-slate-300"
            >
              ← 戻る
            </Button>

            {/* 新しいヘッダーコピー */}
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-1">
              FITRA / TRAINING ANALYZER
            </p>
            <p className="text-[11px] text-slate-400 mb-3">Step 1 / 3</p>

            <h1 className="text-2xl font-bold mb-2">
              今日のメイン種目を選ぼう
            </h1>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              今日はどの部位を攻めましたか？実際に行ったメイン種目をすべて追加してください。
              このあと重量・レップを入力して、AIコーチがあなたのトレーニングを振り返ります。
            </p>

            {/* セレクト */}
            <div className="flex gap-2 mb-4">
              <select
                className="flex-1 rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">種目を選択</option>
                {Object.entries(trainingMenu).map(([category, items]) => (
                  <optgroup key={category} label={`--- ${category} ---`}>
                    {items.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <Button type="button" onClick={addExercise} disabled={!selected}>
                追加
              </Button>
            </div>

            {/* 今日の種目リスト */}
            <div className="mb-6">
              <p className="text-xs text-slate-400 mb-2">
                今日のメニュー（タップで削除）：
              </p>
              {exercises.length === 0 ? (
                <p className="text-sm text-slate-500">
                  まだ種目が追加されていません。
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {exercises.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => removeExercise(name)}
                      className="rounded-full bg-slate-800 px-3 py-1 text-xs hover:bg-red-500/70"
                    >
                      {name} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="w-full"
              disabled={exercises.length === 0}
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
