// lib/server/openai.ts

// OpenAI SDK を読み込む。
// これにより「OpenAI APIを TypeScript から簡単に呼び出す」ことができる。
import OpenAI from "openai";

// OpenAI クライアントのインスタンスを作成。
// API キーは、環境変数（.env.local）から取得している。
// この client を使って API を呼ぶ。
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // 「!」は「絶対に存在するはず」という意味のノンヌル断言
});

// OpenAI に text prompt を投げて、文字列のレスポンスを返す関数。
// FITRA 内のどこからでも共通で使える “AI 呼び出しの窓口”。
export async function callOpenAi(prompt: string): Promise<string> {
  // OpenAI の Chat Completions API を叩く。
  // 第1引数にモデル名、第2引数にユーザーのメッセージを渡す。
  // max_tokens は返す文章の長さ（上限）。
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini", // 使用するモデル（軽量で速い）
    messages: [{ role: "user", content: prompt }], // ChatGPT に投げるメッセージ
    max_tokens: 300, // 最大300tokenの返答に制限
  });

  // ChatGPT の返答（content 部分）を返す。
  // 万が一空だった場合は空文字 "" を返す。
  return res.choices[0].message.content ?? "";
}
