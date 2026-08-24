import { NextRequest, NextResponse } from "next/server";
import { searchKakaoPlaces } from "@/lib/kakao";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { places: [], message: "검색어를 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    const places = await searchKakaoPlaces(q);

    return NextResponse.json({
      places,
      message: places.length === 0 ? `"${q}"에 대한 검색 결과가 없어요.` : null,
    });
  } catch (error) {
    console.error("카카오 검색 실패:", error);
    return NextResponse.json(
      { places: [], message: "잠시 후 다시 시도해주세요." },
      { status: 502 }
    );
  }
}
