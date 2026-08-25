"use client";

import { useEffect, useState } from "react";
import type { GooglePlaceReviews } from "@/lib/google-places";

interface ReviewPanelProps {
  placeId: string;
  placeName: string;
  lat: number;
  lng: number;
}

interface ReviewsResponse {
  place: GooglePlaceReviews | null;
  message: string | null;
}

const sessionCache = new Map<string, ReviewsResponse>();
const cacheKey = (placeId: string) => `google-reviews:${placeId}`;

function readCache(placeId: string): ReviewsResponse | null {
  if (sessionCache.has(placeId)) {
    return sessionCache.get(placeId) ?? null;
  }
  try {
    const raw = sessionStorage.getItem(cacheKey(placeId));
    if (!raw) return null;
    const parsed: ReviewsResponse = JSON.parse(raw);
    sessionCache.set(placeId, parsed);
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(placeId: string, data: ReviewsResponse) {
  sessionCache.set(placeId, data);
  try {
    sessionStorage.setItem(cacheKey(placeId), JSON.stringify(data));
  } catch {
    // sessionStorage 사용 불가(프라이빗 모드 등) 시 메모리 캐시만 사용
  }
}

export default function ReviewPanel({ placeId, placeName, lat, lng }: ReviewPanelProps) {
  const [data, setData] = useState<ReviewsResponse | null>(() => readCache(placeId));

  useEffect(() => {
    if (data) return;

    let cancelled = false;

    const params = new URLSearchParams({
      name: placeName,
      lat: String(lat),
      lng: String(lng),
    });

    fetch(`/api/reviews?${params.toString()}`)
      .then((res) => res.json())
      .then((result: ReviewsResponse) => {
        if (cancelled) return;
        writeCache(placeId, result);
        setData(result);
      })
      .catch(() => {
        if (cancelled) return;
        setData({ place: null, message: "잠시 후 다시 시도해주세요." });
      });

    return () => {
      cancelled = true;
    };
  }, [placeId, placeName, lat, lng, data]);

  if (!data) {
    return (
      <div className="flex items-center gap-2 border-t border-border px-5 py-6 text-sm text-foreground-tertiary">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
        리뷰를 불러오는 중..
      </div>
    );
  }

  if (!data || !data.place) {
    return (
      <div className="border-t border-border px-5 py-6 text-sm text-foreground-secondary">
        {data?.message ?? "가게를 찾지 못했습니다."}
      </div>
    );
  }

  const { place } = data;

  return (
    <div className="flex flex-col gap-4 border-t border-border px-5 py-5">
      <div className="flex items-center gap-2 text-sm">
        {place.rating !== null && (
          <span className="font-bold text-foreground">★ {place.rating.toFixed(1)}</span>
        )}
        <span className="text-foreground-tertiary">리뷰 {place.userRatingCount}개</span>
      </div>

      {place.reviews.length === 0 ? (
        <p className="text-sm text-foreground-tertiary">아직 구글 리뷰가 없어요.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {place.reviews.map((review, index) => (
            <li key={index} className="flex flex-col gap-1 rounded-xl bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{review.author}</span>
                <span className="text-xs text-foreground-tertiary">{review.relativeTime}</span>
              </div>
              <span className="text-xs text-primary">★ {review.rating}</span>
              <p className="text-sm text-foreground-secondary">{review.text}</p>
            </li>
          ))}
        </ul>
      )}

      {place.googleMapsUri && (
        <a
          href={place.googleMapsUri}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-sm font-semibold text-primary hover:underline"
        >
          구글 맵에서 전체 리뷰 보기 →
        </a>
      )}
    </div>
  );
}
