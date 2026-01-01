"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Row = { name: string; weight: string; reps: string; sets: string };

const nf = new Intl.NumberFormat("ja-JP");

const toNum = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function TrainingStep3() {
  const router = useRouter();
  const params = useSearchParams();

  const rows = React.useMemo<Row[]>(() => {
    const raw = params.get("training");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as Row[];
      return Array.isArray(parsed) ? parsed.filter((r) => r?.name) : [];
    } catch {
      return [];
    }
  }, [params]);

  const summary = React.useMemo(() => {
    const perExercise = rows.map((r) => {
      const w = toNum(r.weight);
      const reps = toNum(r.reps);
      const sets = toNum(r.sets);
      const totalReps = reps * sets;
      const volume = w * totalReps; // kg * 回
      return { name: r.name, w, reps, sets, totalReps, volume };
    });

    const totalVolume = perExercise.reduce((a, x) => a + x.volume, 0);
    const totalSets = perExercise.reduce((a, x) => a + x.sets, 0);
    const totalReps = perExercise.reduce((a, x) => a + x.totalReps, 0);

    return { perExercise, totalVolume, totalSets, totalReps };
  }, [rows]);

  const canSave = rows.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4">
        <Card className="w-full max-w-3xl mx-auto bg-slate-900/80 border-slate-700">
          <CardContent className="p-6 sm:p-8">
            {/* 戻る */}
            <Button
              type="button"
              onClick={() => router.back()}
              className="mb-4 w-auto px-3 py-1 text-xs bg-transparent hover:bg-slate-800 text-slate-300"
            >
              ← 戻る
            </Button>

            {/* 見出し（Step2と同じ） */}
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-1">
              FITRA / TRAINING ANALYZER
            </p>
            <p className="text-[11px] text-slate-400 mb-3">Step 3 / 3</p>

            <h1 className="text-2xl font-bold mb-2">今日のトレーニング結果</h1>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              入力内容から総ボリュームと合計を算出しました。問題なければ記録を確定してください。
            </p>

            {/* KPI（ここが一番“それっぽく”見える） */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
                <p className="text-xs text-slate-400">総ボリューム (kg)</p>
                <p className="text-2xl font-bold mt-1">{nf.format(summary.totalVolume)}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
                <p className="text-xs text-slate-400">総セット数</p>
                <p className="text-2xl font-bold mt-1">{nf.format(summary.totalSets)}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
                <p className="text-xs text-slate-400">総レップ数</p>
                <p className="text-2xl font-bold mt-1">{nf.format(summary.totalReps)}</p>
              </div>
            </div>

            {/* 種目詳細（“文章の羅列”をやめてブロック化） */}
            <div className="space-y-2 mb-6">
              {summary.perExercise.map((x) => (
                <div
                  key={x.name}
                  className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{x.name}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {x.w}kg × {x.reps}rep × {x.sets}set（計{x.totalReps}rep）
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">ボリューム</p>
                    <p className="text-lg font-bold">{nf.format(x.volume)}</p>
                  </div>
                </div>
              ))}

              {!rows.length && (
                <p className="text-sm text-slate-500">
                  データが取得できませんでした。Step2からやり直してください。
                </p>
              )}
            </div>

            {/* コメント（長文はここで“別枠”にして読みやすく） */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 mb-6">
              <p className="text-sm font-semibold mb-1">一言フィードバック</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                今日もお疲れ様でした！次回はフォームの安定と、最後の1〜2repの質を意識すると伸びます。
              </p>
            </div>

            {/* ボタン（Step2と揃える：左=サブ、右=メイン） */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                type="button"
                onClick={() => router.push(`/training/step2?${new URLSearchParams({ exercises: JSON.stringify(rows.map(r => r.name)) })}`)}
                className="w-full sm:w-auto bg-transparent border border-slate-700 hover:bg-slate-800"
              >
                修正
              </Button>
              <Button
                type="button"
                disabled={!canSave}
                onClick={async () => {
                  // ここで保存API叩くならここ（例）
                  // await fetch("/api/training/save", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ rows }) });
                  router.push("/training"); // 完了後遷移
                }}
                className="w-full sm:w-auto"
              >
                記録完了
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
