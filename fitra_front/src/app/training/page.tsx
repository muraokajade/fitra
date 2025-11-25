"use client";

import { useState } from "react";
import Link from "next/link";

/* ============================================================
   種目カテゴリ + 100種目データ
   ============================================================ */
type ExerciseOption = { value: string; label: string };

const EXERCISE_GROUPS: { group: string; options: ExerciseOption[] }[] = [
  {
    group: "胸（Chest）",
    options: [
      { value: "bench_press", label: "ベンチプレス" },
      { value: "incline_bench_press", label: "インクラインベンチプレス" },
      { value: "decline_bench_press", label: "デクラインベンチプレス" },
      { value: "dumbbell_press", label: "ダンベルプレス" },
      { value: "incline_dumbbell_press", label: "インクラインダンベルプレス" },
      { value: "dumbbell_fly", label: "ダンベルフライ" },
      { value: "cable_fly", label: "ケーブルフライ" },
      { value: "pec_deck_fly", label: "ペックデックフライ" },
      { value: "push_up", label: "プッシュアップ" },
      { value: "weighted_push_up", label: "加重プッシュアップ" },
      { value: "machine_chest_press", label: "チェストプレス（マシン）" },
      { value: "smith_bench_press", label: "スミスベンチプレス" },
    ],
  },
  {
    group: "背中（Back）",
    options: [
      { value: "deadlift", label: "デッドリフト" },
      { value: "roman_deadlift", label: "ルーマニアンデッドリフト" },
      { value: "sumo_deadlift", label: "相撲デッドリフト" },
      { value: "lat_pulldown", label: "ラットプルダウン" },
      { value: "reverse_grip_pulldown", label: "リバースグリップラットプル" },
      { value: "vbar_pulldown", label: "Vバーラットプル" },
      { value: "seated_row", label: "シーテッドロー" },
      { value: "tbar_row", label: "Tバーロー" },
      { value: "barbell_row", label: "バーベルロー" },
      { value: "dumbbell_row", label: "ワンハンドダンベルロー" },
      { value: "machine_row", label: "ローイング（マシン）" },
      { value: "face_pull", label: "フェイスプル" },
      { value: "pull_up", label: "懸垂" },
      { value: "chin_up", label: "チンニング" },
      { value: "good_morning", label: "グッドモーニング" },
      { value: "back_extension", label: "バックエクステンション" },
    ],
  },
  {
    group: "脚（Legs）",
    options: [
      { value: "squat", label: "スクワット" },
      { value: "front_squat", label: "フロントスクワット" },
      { value: "hack_squat", label: "ハックスクワット" },
      { value: "leg_press", label: "レッグプレス" },
      { value: "lunges", label: "ランジ" },
      { value: "bulgarian_split_squat", label: "ブルガリアンスクワット" },
      { value: "leg_extension", label: "レッグエクステンション" },
      { value: "leg_curl", label: "レッグカール" },
      { value: "romanian_deadlift", label: "ルーマニアンデッドリフト" },
      { value: "hip_thrust", label: "ヒップスラスト" },
      { value: "glute_bridge", label: "グルートブリッジ" },
      { value: "calf_raise", label: "カーフレイズ" },
      { value: "seated_calf_raise", label: "シーテッドカーフレイズ" },
      { value: "sumo_squat", label: "相撲スクワット" },
      { value: "box_squat", label: "ボックススクワット" },
      { value: "step_up", label: "ステップアップ" },
      { value: "machine_adductor", label: "内転筋マシン" },
      { value: "machine_abductor", label: "外転筋マシン" },
    ],
  },
  {
    group: "肩（Shoulders）",
    options: [
      { value: "shoulder_press", label: "ショルダープレス" },
      { value: "smith_shoulder_press", label: "スミスショルダープレス" },
      { value: "military_press", label: "ミリタリープレス" },
      { value: "arnold_press", label: "アーノルドプレス" },
      { value: "side_raise", label: "サイドレイズ" },
      { value: "front_raise", label: "フロントレイズ" },
      { value: "rear_delt_fly", label: "リアデルトフライ" },
      { value: "cable_lateral_raise", label: "ケーブルサイドレイズ" },
      { value: "upright_row", label: "アップライトロー" },
      { value: "face_pull", label: "フェイスプル（肩後部）" },
      { value: "dumbbell_shoulder_press", label: "ダンベルショルダープレス" },
      { value: "machine_shoulder_press", label: "ショルダープレス（マシン）" },
      { value: "machine_rear_delt", label: "リアデルトマシン" },
      { value: "plate_raise", label: "プレートレイズ" },
      { value: "shrug", label: "シュラッグ" },
    ],
  },
  {
    group: "腕（Arms）",
    options: [
      { value: "barbell_curl", label: "バーベルカール" },
      { value: "dumbbell_curl", label: "ダンベルカール" },
      { value: "hammer_curl", label: "ハンマーカール" },
      { value: "preacher_curl", label: "プリーチャーカール" },
      { value: "cable_curl", label: "ケーブルカール" },
      { value: "triceps_pushdown", label: "トライセプスプッシュダウン" },
      { value: "rope_pushdown", label: "ローププッシュダウン" },
      { value: "french_press", label: "フレンチプレス" },
      { value: "skull_crusher", label: "スカルクラッシャー" },
      { value: "dips", label: "ディップス" },
      { value: "close_grip_bench", label: "ナローベンチプレス" },
      { value: "kickback", label: "キックバック" },
      { value: "reverse_curl", label: "リバースカール" },
      { value: "concentration_curl", label: "コンセントレーションカール" },
      { value: "overhead_extension", label: "オーバーヘッドエクステンション" },
      { value: "machine_arm_curl", label: "アームカール（マシン）" },
    ],
  },
];

/* ============================================================
   型
   ============================================================ */
type TrainingExercise = {
  name: string;
  weight: number;
  reps: number;
  sets: number;
};

type TrainingAnalysis = {
  score: number | null;
  summary: string;
  goodPoints: string[];
  improvementPoints: string[];
  nextActions: string[];
};

const initialAnalysis: TrainingAnalysis = {
  score: null,
  summary: "",
  goodPoints: [],
  improvementPoints: [],
  nextActions: [],
};

/* ============================================================
   メインコンポーネント
   ============================================================ */
export default function TrainingPage() {
  const [notes, setNotes] = useState(""); // AI用コメント

  const [selectedExercise, setSelectedExercise] = useState("bench_press");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");

  const [exerciseList, setExerciseList] = useState<TrainingExercise[]>([]);
  const [analysis, setAnalysis] = useState<TrainingAnalysis>(initialAnalysis);
  const [rawText, setRawText] = useState("");

  const [loading, setLoading] = useState(false);

  /* ---------------------------- */
  /* 種目追加 */
  /* ---------------------------- */
  const addExercise = () => {
    if (!weight || !reps || !sets) return;

    const ex = {
      name: selectedExercise,
      weight: Number(weight),
      reps: Number(reps),
      sets: Number(sets),
    };

    setExerciseList((prev) => [...prev, ex]);

    setWeight("");
    setReps("");
    setSets("");
  };

  /* ---------------------------- */
  /* API 呼び出し */
  /* ---------------------------- */
  const analyzeTraining = async () => {
    if (exerciseList.length === 0) return;

    setLoading(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001";

      const res = await fetch(`${baseUrl}/training/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: notes,
          exercises: exerciseList,
        }),
      });

      const data = await res.json();

      const text =
        data.result_text ?? data.text ?? JSON.stringify(data, null, 2);

      setRawText(text);
      setAnalysis(parseTrainingText(text));
    } catch (e) {
      console.error(e);
      alert("AIサーバー接続エラー");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     UI
     ============================================================ */
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="max-w-5xl w-full bg-slate-900/70 rounded-2xl shadow-xl border border-slate-800 px-6 py-6 md:px-10 md:py-8 space-y-8">
        {/* ヘッダー + ホームへ戻る */}
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-400/80">
              FITRA / TRAINING ANALYZER
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold">
              トレーニングAIアナリスト{" "}
              <span className="text-sm font-normal text-slate-400 align-middle">
                （筋トレ用）
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-300">
              種目・重量・レップ・セットを入力すると、AIが
              <span className="text-blue-300">
                {" "}
                スコア・良い点・改善ポイント・次の一手
              </span>
              を整理してくれます。
            </p>
          </div>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-blue-400 hover:text-blue-200 transition"
          >
            ← ホームへ戻る
          </Link>
        </header>

        {/* ----------------------------
            種目入力エリア
        ---------------------------- */}
        <section className="space-y-6">
          <h2 className="text-sm font-medium text-slate-200">種目を追加</h2>

          {/* 種目セレクト */}
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {EXERCISE_GROUPS.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.options.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* 数値入力3つ */}
          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="重量 (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="レップ"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="セット"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              className="rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={addExercise}
            className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-500/30 hover:bg-blue-500 transition"
          >
            種目をリストに追加
          </button>

          {/* 追加済みの種目リスト */}
          {exerciseList.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-slate-400">今日のメニュー：</p>
              <ul className="space-y-1 text-sm text-slate-200">
                {exerciseList.map((ex, i) => (
                  <li
                    key={i}
                    className="border-b border-slate-800 pb-1 flex items-center justify-between"
                  >
                    <span className="truncate">
                      {ex.name} / {ex.weight}kg / {ex.reps}回 / {ex.sets}セット
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ----------------------------
            コメント（AI用）
        ---------------------------- */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-slate-200">
            自由コメント（任意）
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="例：今日は疲れていたけどスクワットを頑張った、ベンチのフォームを意識した 等"
          />
        </section>

        {/* ----------------------------
            AI分析
        ---------------------------- */}
        <button
          disabled={exerciseList.length === 0 || loading}
          onClick={analyzeTraining}
          className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/40 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? "AIが解析中…" : "AIにトレーニング評価をしてもらう"}
        </button>

        {/* ----------------------------
            結果表示
        ---------------------------- */}
        {rawText && (
          <section className="space-y-6 mt-4">
            <TrainingScoreCard analysis={analysis} />

            <div className="grid gap-4 md:grid-cols-2">
              <CardList
                title="良い点"
                items={analysis.goodPoints}
                emptyText="良い点は特にありません。"
              />
              <CardList
                title="改善ポイント"
                items={analysis.improvementPoints}
                emptyText="改善ポイントは特に出ていません。"
              />
            </div>

            <CardList
              title="次にやるべきこと"
              items={analysis.nextActions}
              emptyText="次のアクション提案はありません。"
            />

            {/* 生ログ（デバッグ） */}
            <details className="text-xs text-slate-400 border border-slate-800 rounded-xl bg-slate-900/80 p-3">
              <summary className="cursor-pointer select-none text-[11px] uppercase tracking-wide text-slate-500">
                生のAIレスポンスを表示（デバッグ用）
              </summary>
              <pre className="whitespace-pre-wrap mt-2 text-[10px]">
                {rawText}
              </pre>
            </details>
          </section>
        )}
      </div>
    </main>
  );
}

/* ============================================================
   スコアカード
   ============================================================ */
function TrainingScoreCard({ analysis }: { analysis: TrainingAnalysis }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 flex flex-col justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-300">
          トレーニング評価スコア
        </p>
        {analysis.score !== null ? (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-400">
              {analysis.score}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
        ) : (
          <p className="text-sm text-slate-500">スコアなし</p>
        )}
        {analysis.summary && (
          <p className="text-xs text-slate-300 mt-2">{analysis.summary}</p>
        )}
      </div>

      {analysis.score !== null && (
        <div className="mt-3 space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-blue-500 transition-[width]"
              style={{
                width: `${Math.min(100, Math.max(0, analysis.score))}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            80点以上：かなり良い / 60〜79点：まずまず /
            59点以下：メニューかボリュームを調整したいライン
          </p>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   カードリスト（良い点/改善点/次アクション）
   ============================================================ */
function CardList({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <h3 className="mb-2 text-xs font-semibold text-slate-200">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500">{emptyText}</p>
      ) : (
        <ul className="space-y-1 text-xs text-slate-300">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[3px] h-[6px] w-[6px] rounded-full bg-blue-400" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ============================================================
   AIテキスト解析（スコア・良い点など抽出）
   ============================================================ */
function parseTrainingText(text: string): TrainingAnalysis {
  const lines = text.split("\n").map((l) => l.trim());

  const good: string[] = [];
  const bad: string[] = [];
  const next: string[] = [];
  const summary: string[] = [];

  let section: "good" | "bad" | "next" | "summary" = "summary";

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.includes("良い点")) {
      section = "good";
      continue;
    }
    if (lower.includes("改善点")) {
      section = "bad";
      continue;
    }
    if (lower.includes("次にやるべき")) {
      section = "next";
      continue;
    }

    if (section === "good") good.push(line.replace(/^[-・◆●]/, ""));
    else if (section === "bad") bad.push(line.replace(/^[-・◆●]/, ""));
    else if (section === "next") next.push(line.replace(/^[-・◆●]/, ""));
    else summary.push(line);
  }

  const scoreMatch = text.match(/score[:：]\s*(\d{1,3})/i);
  const score = scoreMatch ? Number(scoreMatch[1]) : null;

  return {
    score,
    summary: summary.join(" "),
    goodPoints: good,
    improvementPoints: bad,
    nextActions: next,
  };
}
