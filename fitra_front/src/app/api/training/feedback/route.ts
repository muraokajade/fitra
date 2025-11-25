import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
type TrainingRow = {
  name: string;
  weight: number;
  reps: number;
  sets: number;
  volume: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      totalVolume,
      totalSets,
      totalReps,
      rows,
      // nutrition, // 食事データをあとで足してもOK
    } = body;

    const exercisesText = (rows as TrainingRow[])
      .map(
        (r) =>
          `${r.name}: ${r.weight}kg × ${r.reps}rep × ${r.sets}set（ボリューム:${r.volume}kg）`
      )
      .join("\n");

    const prompt = `
あなたは筋トレと栄養管理のコーチです。
以下のトレーニング内容を踏まえて、日本語で丁寧にフィードバックを出してください。

### トレーニングサマリー
- 総ボリューム: ${totalVolume} kg
- 総セット数: ${totalSets}
- 総レップ数: ${totalReps}

### 種目の詳細
${exercisesText}

### フィードバック方針
- 1〜2文で「全体の評価」（軽め / 標準 / 重め / 攻めすぎなど）
- 2〜4文で「トレーニング内容に対するコメント」
- 2〜4文で「食事や休養に関するアドバイス（食事データがなくても、一般的なアドバイスでOK）」
- 最後に1文、「次回の目標や意識ポイント」を提案してください。
- 全体で6〜10文程度に収めてください。
- 口調は、優しいがストイックな日本語で、「です・ます」調。
    `.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini", // 環境に合わせて変更
      messages: [
        {
          role: "system",
          content:
            "あなたはトレーニングと栄養管理に詳しいオンラインコーチです。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const feedback =
      completion.choices[0]?.message?.content ??
      "フィードバックを生成できませんでした。";

    return NextResponse.json({ feedback });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "failed to generate feedback" },
      { status: 500 }
    );
  }
}
