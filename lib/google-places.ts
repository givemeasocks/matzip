export interface GoogleReview {
  author: string;
  rating: number;
  relativeTime: string;
  text: string;
}

export interface GooglePlaceReviews {
  name: string;
  rating: number | null;
  userRatingCount: number;
  reviews: GoogleReview[];
  googleMapsUri: string;
}

interface PlacesSearchTextResponse {
  places?: Array<{
    id: string;
    displayName?: { text: string };
    location?: { latitude: number; longitude: number };
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    reviews?: Array<{
      authorAttribution?: { displayName?: string };
      rating?: number;
      relativePublishTimeDescription?: string;
      text?: { text?: string };
    }>;
  }>;
}

const PLACES_SEARCH_TEXT_URL = "https://places.googleapis.com/v1/places:searchText";
const NEARBY_RADIUS_METERS = 150;
const EARTH_RADIUS_METERS = 6371000;

// Text Search(New)의 locationRestriction은 rectangle만 지원해 circle을 쓸 수 없다.
// locationBias.circle로 검색 지역을 유도한 뒤, 반환된 좌표로 실제 반경(150m)을 직접 검증한다.
function distanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function findGoogleReviews(
  placeName: string,
  lat: number,
  lng: number
): Promise<GooglePlaceReviews | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY가 설정되지 않았습니다.");
  }

  const response = await fetch(PLACES_SEARCH_TEXT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.reviews,places.googleMapsUri",
    },
    body: JSON.stringify({
      textQuery: placeName,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: NEARBY_RADIUS_METERS,
        },
      },
      pageSize: 1,
      languageCode: "ko",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google Places API 오류: ${response.status}`);
  }

  const data: PlacesSearchTextResponse = await response.json();
  const place = data.places?.[0];

  if (!place) {
    return null;
  }

  if (
    place.location &&
    distanceInMeters(lat, lng, place.location.latitude, place.location.longitude) >
      NEARBY_RADIUS_METERS
  ) {
    return null;
  }

  return {
    name: place.displayName?.text ?? placeName,
    rating: place.rating ?? null,
    userRatingCount: place.userRatingCount ?? 0,
    googleMapsUri: place.googleMapsUri ?? "",
    reviews: (place.reviews ?? []).map((review) => ({
      author: review.authorAttribution?.displayName ?? "익명",
      rating: review.rating ?? 0,
      relativeTime: review.relativePublishTimeDescription ?? "",
      text: review.text?.text ?? "",
    })),
  };
}
