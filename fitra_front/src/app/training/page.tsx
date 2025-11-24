// src/app/training/page.tsx
"use client";

import { useState, FormEvent } from "react";

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

export default function TrainingPage() {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<TrainingAnalysis>(initialAnalysis);
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001";

      const res = await fetch(`${baseUrl}/training/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const text: string =
        data.result_text ?? data.text ?? JSON.stringify(data, null, 2);

      setRawText(text);
      setAnalysis(parseTrainingText(text));
    } catch (err) {
      console.error(err);
      setError("トレーニング分析APIの呼び出しに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="max-w-5xl w-full bg-slate-900/70 rounded-2xl shadow-xl border border-slate-800 px-6 py-6 md:px-10 md:py-8 space-y-8">
        {/* ヘッダー（食事ページ寄せ） */}
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/80">
            FITRA / TRAINING ANALYZER
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold">
            トレーニングAIアナリスト
            <span className="text-sm font-normal text-slate-400 align-middle ml-2">
              （筋トレ・有酸素の振り返り用）
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-300">
            その日のトレーニング内容を入力すると、AIが
            <span className="text-emerald-300">
              {" "}
              スコア・良かった点・改善ポイント・次の一手
            </span>
            を整理してくれます。
          </p>
        </header>

        {/* 入力エリア（食事ページとトーン合わせ） */}
        <section className="space-y-3">
          <label className="block text-sm font-medium text-slate-200">
            トレーニング内容
          </label>
          <textarea
            className="w-full h-32 md:h-40 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm md:text-base text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="例：インクラインベンチプレス 50kg × 10回 × 2セット、ラットプルダウン 45kg × 12回 × 3セット、有酸素20分 など"
          />

          {/* ボタンの存在感アップ＆位置も右寄せで統一 */}
          <div className="flex justify-end">
            <button
              type="submit"
              onClick={(e) => {
                // form をやめているので直接ハンドラ呼び出し
                // 既存のロジックを流用するためにダミーイベントを作る
                handleSubmit(e as unknown as FormEvent);
              }}
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white 
                         shadow-sm shadow-emerald-500/40 hover:bg-emerald-400 
                         disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "AIが分析中…" : "AIにトレーニング評価してもらう"}
            </button>
          </div>
        </section>

        {/* 分析結果エリア（構造はほぼ既存・見た目だけ食事ページ寄せ） */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-slate-200">分析結果</h2>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">
              {error}
            </div>
          )}

          {!error && !rawText && (
            <p className="text-sm text-slate-500">
              トレーニング内容を入力して「AIにトレーニング評価してもらう」を押すと、ここに結果が表示されます。
            </p>
          )}

          {rawText && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* スコアカード */}
                <TrainingScoreCard analysis={analysis} />

                {/* リスト群 */}
                <div className="space-y-4">
                  <CardList
                    title="良い点"
                    items={analysis.goodPoints}
                    emptyText="今回は特にピックアップされた良い点はありません。"
                  />
                  <CardList
                    title="改善ポイント"
                    items={analysis.improvementPoints}
                    emptyText="大きな改善ポイントは特に出ていません。"
                  />
                  <CardList
                    title="次にやるべきこと"
                    items={analysis.nextActions}
                    emptyText="次のアクション提案はありません。もう少し具体的に入力してもOKです。"
                  />
                </div>

                {/* 生レスポンス（デバッグ用） */}
                <div className="md:col-span-2">
                  <details className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-400">
                    <summary className="cursor-pointer text-slate-300">
                      生のAIレスポンスを表示（デバッグ用）
                    </summary>
                    <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap text-[10px]">
                      {rawText}
                    </pre>
                  </details>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* --- 見た目寄せしたスコアカード --- */
function TrainingScoreCard({ analysis }: { analysis: TrainingAnalysis }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 flex flex-col justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-300">
          トレーニング評価スコア
        </p>
        {analysis.score !== null ? (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400">
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
              className="h-full bg-emerald-400 transition-[width]"
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
              <span className="mt-[3px] h-[6px] w-[6px] rounded-full bg-emerald-400" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* 解析の簡易パーサ（バックエンドが整ったら共通化） */
function parseTrainingText(text: string): TrainingAnalysis {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const good: string[] = [];
  const bad: string[] = [];
  const next: string[] = [];
  const summary: string[] = [];
  let section: "good" | "bad" | "next" | "other" = "other";

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.includes("良い") || lower.includes("good")) {
      section = "good";
      continue;
    }
    if (
      lower.includes("改善") ||
      lower.includes("bad") ||
      lower.includes("improve")
    ) {
      section = "bad";
      continue;
    }
    if (lower.includes("次") || lower.includes("next")) {
      section = "next";
      continue;
    }

    if (section === "good") good.push(clean(line));
    else if (section === "bad") bad.push(clean(line));
    else if (section === "next") next.push(clean(line));
    else summary.push(line);
  }

  const scoreMatch = text.match(/(\d{1,3})\s*点|score[:：]\s*(\d{1,3})/i);
  const score = scoreMatch ? Number(scoreMatch[1] ?? scoreMatch[2]) : null;

  return {
    score,
    summary: summary.join(" "),
    goodPoints: good,
    improvementPoints: bad,
    nextActions: next,
  };
}

const clean = (t: string) => t.replace(/^[-・◆●]/, "").trim();
