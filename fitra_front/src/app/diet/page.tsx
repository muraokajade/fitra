"use client";

import * as React from "react";
import Link from "next/link";

import type { AiFeedbackRequest } from "@/types/ai";
import type { DietSummary } from "@/types/diet";
import type { UserLevel, UserGoal } from "@/types/user";

export default function DietPage() {
  const [input, setInput] = React.useState("");
  const [feedback, setFeedback] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 仮ユーザー設定（あとで /mypage と連動）
  const userLevel: UserLevel = "beginner";
  const userGoal: UserGoal = "health";

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);
    setFeedback("");

    try {
      const summary: DietSummary = {
        text: input,
      };

      const body: AiFeedbackRequest<DietSummary> = {
        domain: "diet",
        level: userLevel,
        goal: userGoal,
        summary,
      };

      const res = await fetch("/api/diet/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("diet feedback api error");
      }

      const data = await res.json();
      setFeedback(data.feedback ?? "");
    } catch (e) {
      console.error(e);
      setError(
        "AIによる食事評価の取得に失敗しました。時間をおいて再度お試しください。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="max-w-3xl w-full bg-slate-900/70 rounded-2xl shadow-xl border border-slate-800 px-6 py-6 md:px-10 md:py-8 space-y-8">
        {/* ヘッダー + ホームへ戻る */}
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-400/80">
              FITRA / DIET ANALYZER
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold">
              食事AIアナリスト{" "}
              <span className="text-sm font-normal text-slate-400 align-middle">
                （MVP版：テキスト評価のみ）
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-300">
              今日食べたものをそのまま入力すると、AIが{" "}
              <span className="text-blue-300">ダイエット目線でコメント</span>
              を返します。
            </p>
          </div>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-blue-400 hover:text-blue-200 transition"
          >
            ← ホームへ戻る
          </Link>
        </header>

        {/* 入力エリア */}
        <section className="space-y-3">
          <label className="block text-sm font-medium text-slate-200">
            食事内容（1日の食事をざっくりでOK）
          </label>
          <textarea
            className="w-full h-32 md:h-40 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm md:text-base text-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="例：朝はプロテインだけ、昼はコンビニのサラダチキンとおにぎり1個、夜は焼肉食べ放題…"
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
              {isLoading ? "AIが分析中…" : "AIに食事評価してもらう"}
            </button>
          </div>
        </section>

        {/* 分析結果 */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-slate-200">AIコメント</h2>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">
              {error}
            </div>
          )}

          {!error && !feedback && (
            <p className="text-sm text-slate-500">
              食事内容を入力して「AIに食事評価してもらう」を押すと、ここに結果が表示されます。
            </p>
          )}

          {feedback && !error && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm whitespace-pre-wrap text-slate-100">
              {feedback}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
