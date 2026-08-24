export interface KakaoPlace {
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  phone: string;
  lat: number;
  lng: number;
  placeUrl: string;
}

interface KakaoDocument {
  id: string;
  place_name: string;
  category_name: string;
  category_group_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  x: string;
  y: string;
  place_url: string;
}

interface KakaoKeywordResponse {
  documents: KakaoDocument[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

const KAKAO_KEYWORD_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

export async function searchKakaoPlaces(query: string): Promise<KakaoPlace[]> {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    throw new Error("KAKAO_REST_API_KEY가 설정되지 않았습니다.");
  }

  // 필터 UI 없이 검색 지역을 서울로 고정
  const seoulBiasedQuery = query.includes("서울") ? query : `서울 ${query}`;

  const url = new URL(KAKAO_KEYWORD_SEARCH_URL);
  url.searchParams.set("query", seoulBiasedQuery);
  url.searchParams.set("size", "15");
  url.searchParams.set("sort", "accuracy");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `KakaoAK ${apiKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`카카오 API 오류: ${response.status}`);
  }

  const data: KakaoKeywordResponse = await response.json();

  return data.documents.map((doc) => ({
    id: doc.id,
    name: doc.place_name,
    category: doc.category_name.split(" > ").pop() ?? doc.category_group_name ?? "",
    address: doc.address_name,
    roadAddress: doc.road_address_name,
    phone: doc.phone,
    lat: Number.parseFloat(doc.y),
    lng: Number.parseFloat(doc.x),
    placeUrl: doc.place_url,
  }));
}
