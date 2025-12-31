// lib/server/getDietFeedback.ts
import { callOpenAi } from "./openai";
import type { AiFeedbackRequest, AiFeedbackResponse } from "@/types/ai";

type DietSummary = {
  text: string; // 1日の食事をそのまま入れる
};

function buildDietPrompt(req: AiFeedbackRequest<DietSummary>): string {
  const { level, goal, summary } = req;

  const levelText =
    level === "beginner"
      ? "初心者向けに、やさしい言葉で、褒め多めで。"
      : level === "intermediate"
      ? "中級者向けに、専門用語も少し使ってOK。"
      : "上級者向けに、厳しく、具体的なアドバイスを。";

  const goalText =
    goal === "bulk"
      ? "目的は増量。筋肥大と十分なカロリー摂取を意識したコメントを。"
      : goal === "cut"
      ? "目的は減量。カロリーコントロールとPFCバランスを意識したコメントを。"
      : "目的は健康維持。バランス重視でコメントを。";

  return `
あなたはプロの栄養コーチです。

${levelText}
${goalText}

### 今日の食事内容
${summary.text}

### 出力条件
- 日本語で回答してください。
- まず最初に「今日の食事スコア（0〜100点）」を1行で書いてください。
- 次に、良かった点を1〜2文でまとめてください。
- そのあと、改善点を1〜2文でまとめてください。
- 最後に、「次に追加すると良い食材」を1つ提案してください。
- 全体としては4〜8文程度に収めてください。

# ★ここから追加
- 入力が「食事内容として解釈できない」場合（例: ランダム文字、短すぎる、食材・量・回数が無い等）は評価しない。
- その場合は「不足している情報」を箇条書きで返し、スコアは出さない。
- 判定は厳しめにする（迷ったら不足扱い）。
`;
}

export async function getDietFeedback(
  req: AiFeedbackRequest<DietSummary>
): Promise<AiFeedbackResponse> {
  const prompt = buildDietPrompt(req);
  const text = await callOpenAi(prompt);
  return { feedback: text };
}
