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
      const res: AiFeedbackResponse = { feedback: "不正な domain（diet 以外）" };
      return NextResponse.json(res, { status: 200 });
    }

    // ✅ ここで遅延import（import時クラッシュをtryで捕まえる）
    const { getDietFeedback } = await import("@/lib/server/getDietFeedback");

    const result = await getDietFeedback(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("diet feedback error:", error);
    const fallback: AiFeedbackResponse = { feedback: "fallback..." };
   return NextResponse.json(
    { feedback: "", error: "OPENAI_ERROR" },
    { status: 500 }
  );
  }
}

