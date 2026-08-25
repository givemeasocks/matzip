import { NextRequest, NextResponse } from "next/server";
import { findGoogleReviews } from "@/lib/google-places";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name")?.trim();
  const lat = Number.parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lng = Number.parseFloat(request.nextUrl.searchParams.get("lng") ?? "");

  if (!name || Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { place: null, message: "가게 정보가 올바르지 않습니다." },
      { status: 400 }
    );
  }

  try {
    const place = await findGoogleReviews(name, lat, lng);

    return NextResponse.json({
      place,
      message: place ? null : "가게를 찾지 못했습니다.",
    });
  } catch (error) {
    console.error("구글 리뷰 조회 실패:", error);
    return NextResponse.json(
      { place: null, message: "잠시 후 다시 시도해주세요." },
      { status: 502 }
    );
  }
}
