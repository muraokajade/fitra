// src/app/api/diet/feedback/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { AiFeedbackRequest, AiFeedbackResponse } from "@/types/ai";
import type { DietSummary } from "@/types/diet";
import { getDietFeedback } from "@/lib/server/getDietFeedback";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AiFeedbackRequest<DietSummary>;

    if (body.domain !== "diet") {
      const res: AiFeedbackResponse = {
        feedback: "不正な domain が指定されています。（diet 以外）",
      };
      return NextResponse.json(res, { status: 200 });
    }

    const result = await getDietFeedback(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("diet feedback error:", error);

    const fallback: AiFeedbackResponse = {
      feedback:
        "今日は食事AIコーチが少し混雑しているようです。\n" +
        "タンパク質・野菜・炭水化物のバランスを意識して、無理のない範囲で続けていきましょう。",
    };

    return NextResponse.json(fallback, { status: 200 });
  }
}
