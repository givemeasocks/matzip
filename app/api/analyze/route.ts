import { NextRequest, NextResponse } from "next/server";
import { analyzeReviews } from "@/lib/gemini";

interface AnalyzeRequestBody {
  placeName?: string;
  reviews?: Array<{ author: string; rating: number; text: string }>;
}

export async function POST(request: NextRequest) {
  const body: AnalyzeRequestBody = await request.json().catch(() => ({}));
  const placeName = body.placeName?.trim();
  const reviews = body.reviews ?? [];

  if (!placeName || reviews.length === 0) {
    return NextResponse.json(
      { analysis: null, message: "분석할 리뷰가 없습니다." },
      { status: 400 }
    );
  }

  try {
    const analysis = await analyzeReviews(placeName, reviews);
    return NextResponse.json({ analysis, message: null });
  } catch (error) {
    console.error("AI 리뷰 분석 실패:", error);
    return NextResponse.json(
      { analysis: null, message: "잠시 후 다시 시도해주세요." },
      { status: 502 }
    );
  }
}
