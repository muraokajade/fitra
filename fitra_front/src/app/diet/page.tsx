"use client";

import { useState } from "react";

const API_URL = "http://localhost:8001/diet/analyze";

type PFC = {
  protein: number | null;
  fat: number | null;
  carb: number | null;
};

type DietAnalysis = {
  score: number | null;
  goodPoints: string[];
  improvements: string[];
  lackingNutrients: string[];
  nextChoices: string[];
  pfc: PFC | null;
  calories: number | null;
  rawText: string;
};

export default function DietPage() {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<DietAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal: input }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("API error:", res.status, text);
        throw new Error("API error");
      }

      const data = await res.json();
      console.log("API raw diet:", data);

      // 将来 JSON で返す場合を想定（例）
      // {
      //   "score": 72,
      //   "good_points": [...],
      //   "improvements": [...],
      //   "lacking_nutrients": [...],
      //   "next_choices": [...],
      //   "pfc": { "protein": 25, "fat": 15, "carb": 60 },
      //   "calories": 520,
      //   "rawText": "..."
      // }
      if (data.score !== undefined) {
        const parsed: DietAnalysis = {
          score:
            typeof data.score === "number"
              ? data.score
              : Number(data.score) || null,
          goodPoints: data.good_points ?? data.goodPoints ?? [],
          improvements: data.improvements ?? [],
          lackingNutrients:
            data.lacking_nutrients ?? data.lackingNutrients ?? [],
          nextChoices: data.next_choices ?? data.nextChoices ?? [],
          pfc: data.pfc
            ? {
                protein:
                  typeof data.pfc.protein === "number"
                    ? data.pfc.protein
                    : Number(data.pfc.protein) || null,
                fat:
                  typeof data.pfc.fat === "number"
                    ? data.pfc.fat
                    : Number(data.pfc.fat) || null,
                carb:
                  typeof data.pfc.carb === "number"
                    ? data.pfc.carb
                    : Number(data.pfc.carb) || null,
              }
            : null,
          calories:
            typeof data.calories === "number"
              ? data.calories
              : data.calories !== undefined
              ? Number(data.calories) || null
              : null,
          rawText: data.rawText ?? data.result ?? data.message ?? "",
        };
        setAnalysis(parsed);
        return;
      }

      // 今の「テキスト1本」レスポンスをパース
      const rawText: string =
        data.result ||
        data.message ||
        (typeof data === "string" ? data : JSON.stringify(data));
      const parsed = parseDietText(rawText);
      setAnalysis(parsed);
    } catch (e) {
      console.error(e);
      setError("分析に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="max-w-5xl w-full bg-slate-900/70 rounded-2xl shadow-xl border border-slate-800 px-6 py-6 md:px-10 md:py-8 space-y-8">
        {/* ヘッダー */}
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-400/80">
            FITRA / DIET ANALYZER
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold">
            食事AIアナリスト{" "}
            <span className="text-sm font-normal text-slate-400 align-middle">
              （ダイエット用）
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-300">
            食べたものをそのまま入力すると、AIがダイエット目線で
            <span className="text-blue-300"> スコア・PFCバランス・改善点</span>
            を整理してくれます。
          </p>
        </header>

        {/* 入力エリア */}
        <section className="space-y-3">
          <label className="block text-sm font-medium text-slate-200">
            食事内容
          </label>
          <textarea
            className="w-full h-32 md:h-40 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm md:text-base text-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="例：カレーライス（白米200g、ルー、じゃがいも、にんじん、玉ねぎ、豚肉少し）"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isLoading || !input.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-500/40 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "AIが分析中…" : "AIにダイエット評価してもらう"}
            </button>
          </div>
        </section>

        {/* 分析結果 */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-slate-200">分析結果</h2>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">
              {error}
            </div>
          )}

          {!error && !analysis && (
            <p className="text-sm text-slate-500">
              食事内容を入力して「AIにダイエット評価してもらう」を押すと、ここに結果が表示されます。
            </p>
          )}

          {analysis && (
            <div className="space-y-4">
              {/* 軽ノリまとめカード */}
              <SummaryCard analysis={analysis} />

              {/* スコア + PFC + 不足栄養素 */}
              <div className="grid gap-4 md:grid-cols-3">
                <ScoreCard analysis={analysis} />
                <PfcCard pfc={analysis.pfc} calories={analysis.calories} />
                <LackingCard lackingNutrients={analysis.lackingNutrients} />
              </div>

              {/* 良い点 / 改善点 */}
              <div className="grid gap-4 md:grid-cols-2">
                <GoodPointsCard points={analysis.goodPoints} />
                <ImprovePointsCard points={analysis.improvements} />
              </div>

              {/* 次に食べるべきもの */}
              <NextChoicesCard choices={analysis.nextChoices} />

              {/* 生レスポンス（デバッグ用） */}
              <details className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-xs text-slate-400">
                <summary className="cursor-pointer select-none text-[11px] uppercase tracking-wide text-slate-500">
                  生のAIレスポンスを表示（デバッグ用）
                </summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {analysis.rawText || "テキストレスポンスはありません。"}
                </pre>
              </details>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* ---------- UIコンポーネント群 ---------- */

function SummaryCard({ analysis }: { analysis: DietAnalysis }) {
  const mood = getMood(analysis.score);

  return (
    <div className="rounded-2xl border border-sky-500/30 bg-sky-950/40 px-5 py-4 flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-sky-300">
          今日のざっくりダイエット判定
        </p>
        <p className="text-lg font-semibold text-slate-50 flex items-center gap-2">
          <span className="text-2xl">{mood.emoji}</span>
          <span>{mood.label}</span>
        </p>
        <p className="text-xs text-slate-200">{mood.message}</p>
      </div>
      {analysis.score !== null && (
        <div className="flex flex-col items-end text-right">
          <span className="text-[11px] uppercase tracking-wide text-slate-400">
            Score
          </span>
          <span className="text-xl font-semibold text-slate-50">
            {analysis.score}
          </span>
          <span className="text-[11px] text-slate-500">/ 100</span>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ analysis }: { analysis: DietAnalysis }) {
  return (
    <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-300">
          ダイエット評価スコア
        </p>
        <p className="text-lg font-semibold text-slate-50">
          {analysis.score !== null ? `${analysis.score} / 100` : "—"}
        </p>
        <p className="text-xs text-slate-400">
          80点以上：かなり良い / 60〜79点：まずまず / 59点以下：改善余地あり
        </p>
      </div>
      {analysis.score !== null && (
        <div className="flex flex-col items-end gap-2 w-32">
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                analysis.score >= 80
                  ? "bg-emerald-400"
                  : analysis.score >= 60
                  ? "bg-amber-400"
                  : "bg-rose-500"
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, analysis.score))}%`,
              }}
            />
          </div>
          <span className="text-xs text-slate-400">
            体感でいうと{" "}
            {analysis.score >= 80
              ? "かなり良い日 👌"
              : analysis.score >= 60
              ? "そこそこ良いけど一歩物足りない日 🤏"
              : "おいしさ全振りの日（たまにはアリ）😋"}
          </span>
        </div>
      )}
    </div>
  );
}

function PfcCard({
  pfc,
  calories,
}: {
  pfc: PFC | null;
  calories: number | null;
}) {
  if (!pfc || (pfc.protein == null && pfc.fat == null && pfc.carb == null)) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 space-y-2">
        <p className="text-xs font-medium text-slate-300">PFCバランス</p>
        <p className="text-xs text-slate-500">
          バックエンドで
          PFC（タンパク質・脂質・糖質）を返すようにするとここが埋まります。
        </p>
      </div>
    );
  }

  const total = (pfc.protein ?? 0) + (pfc.fat ?? 0) + (pfc.carb ?? 0) || 1; // 0割り防止
  const ratio = {
    protein: ((pfc.protein ?? 0) / total) * 100,
    fat: ((pfc.fat ?? 0) / total) * 100,
    carb: ((pfc.carb ?? 0) / total) * 100,
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-300">PFCバランス</p>
        {calories != null && (
          <p className="text-[11px] text-slate-400">
            {Math.round(calories)} kcal
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
          <div
            className="h-full bg-emerald-400"
            style={{ width: `${ratio.protein}%` }}
            title="タンパク質"
          />
          <div
            className="h-full bg-amber-400"
            style={{ width: `${ratio.fat}%` }}
            title="脂質"
          />
          <div
            className="h-full bg-sky-400"
            style={{ width: `${ratio.carb}%` }}
            title="糖質"
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>タンパク質: {pfc.protein ?? "-"} g</span>
          <span>脂質: {pfc.fat ?? "-"} g</span>
          <span>糖質: {pfc.carb ?? "-"} g</span>
        </div>
      </div>
    </div>
  );
}

function LackingCard({ lackingNutrients }: { lackingNutrients: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 space-y-2">
      <p className="text-xs font-medium text-slate-300">
        不足していそうな栄養素
      </p>
      {lackingNutrients.length === 0 ? (
        <p className="text-xs text-slate-500">
          特に大きな不足は指摘されていません。
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {lackingNutrients.map((n, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300 border border-amber-400/40"
            >
              {n}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function GoodPointsCard({ points }: { points: string[] }) {
  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-5 py-4 space-y-2">
      <p className="text-xs font-medium text-emerald-300">良い点</p>
      {points.length === 0 ? (
        <p className="text-sm text-emerald-50">
          今回の食事の良い点は特に抽出されていません。
        </p>
      ) : (
        <ul className="space-y-1 text-sm text-emerald-50">
          {points.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ImprovePointsCard({ points }: { points: string[] }) {
  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 px-5 py-4 space-y-2">
      <p className="text-xs font-medium text-rose-300">改善ポイント</p>
      {points.length === 0 ? (
        <p className="text-sm text-rose-50">
          今回は大きな改善ポイントは出ていません。
        </p>
      ) : (
        <ul className="space-y-1 text-sm text-rose-50">
          {points.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-400" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NextChoicesCard({ choices }: { choices: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 space-y-2">
      <p className="text-xs font-medium text-slate-300">
        次に食べると良いもの（提案）
      </p>
      {choices.length === 0 ? (
        <p className="text-sm text-slate-400">
          今回の分析結果からの具体的な提案はありません。もう少し詳しく入力してもOKです。
        </p>
      ) : (
        <ul className="space-y-1 text-sm text-slate-100 list-disc list-inside">
          {choices.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- ロジック系 ---------- */

function getMood(score: number | null) {
  if (score === null) {
    return {
      label: "様子見",
      emoji: "🤔",
      message: "データがまだ足りないみたい。もう一度送ってみて！",
    };
  }
  if (score >= 80) {
    return {
      label: "神ごはん",
      emoji: "🔥",
      message:
        "かなり優等生な食事！この調子でいけば体脂肪落ちつつ筋肉も守れるライン。",
    };
  }
  if (score >= 60) {
    return {
      label: "まあまあ優秀",
      emoji: "👌",
      message:
        "悪くないけど、タンパク質か野菜をもう一品足せると“減量飯”として完成度アップ。",
    };
  }
  return {
    label: "ちょい改善",
    emoji: "🛠",
    message:
      "おいしさ寄りの構成。タンパク質と食物繊維でバランスを取りにいこう。",
  };
}

/**
 * いまの「カレーで返ってきたテキスト」を想定してパースする関数
 */
function parseDietText(text: string): DietAnalysis {
  const normalized = text.replace(/\r\n/g, "\n");

  const scoreMatch = normalized.match(/栄養評価（点数 0〜100）：(\d+)/);
  const score = scoreMatch ? Number(scoreMatch[1]) : null;

  const section = (start: string, end?: string): string => {
    const sIdx = normalized.indexOf(start);
    if (sIdx === -1) return "";
    const from = sIdx + start.length;
    if (!end) return normalized.slice(from).trim();
    const eIdx = normalized.indexOf(end, from);
    if (eIdx === -1) return normalized.slice(from).trim();
    return normalized.slice(from, eIdx).trim();
  };

  const goodRaw = section("2. 良い点：", "3. 改善点：");
  const improvementsRaw = section("3. 改善点：", "4. 不足している栄養素：");
  const lackingRaw = section(
    "4. 不足している栄養素：",
    "5. 次に食べるべきもの"
  );
  const nextRaw = section("5. 次に食べるべきもの");

  const toList = (block: string): string[] =>
    block
      .split("\n")
      .map((line) => line.replace(/^[-・\s]+/, "").trim())
      .filter((line) => line.length > 0);

  return {
    score,
    goodPoints: toList(goodRaw),
    improvements: toList(improvementsRaw),
    lackingNutrients: toList(lackingRaw),
    nextChoices: toList(nextRaw),
    pfc: null,
    calories: null,
    rawText: text,
  };
}
