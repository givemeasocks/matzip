"use client";

import { useState } from "react";
import type { KakaoPlace } from "@/lib/kakao";
import ReviewPanel from "./ReviewPanel";

interface PlaceCardProps {
  place: KakaoPlace;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsReviewOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsReviewOpen((prev) => !prev);
          }
        }}
        aria-expanded={isReviewOpen}
        className="flex cursor-pointer flex-col gap-3 p-5 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="w-fit rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
              {place.category || "맛집"}
            </span>
            <h3 className="text-lg font-bold text-foreground">{place.name}</h3>
          </div>
          {/* 담기 버튼 — 모양만, 기능은 로그인/담기 Phase에서 연결 */}
          <span
            role="button"
            aria-label="담기"
            onClick={(event) => event.stopPropagation()}
            className="shrink-0 rounded-full border border-border p-2 text-foreground-tertiary transition-colors hover:border-primary hover:text-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z"
              />
            </svg>
          </span>
        </div>

        <div className="flex flex-col gap-1 text-sm text-foreground-secondary">
          <p>{place.roadAddress || place.address}</p>
          {place.phone && <p>{place.phone}</p>}
        </div>

        <a
          href={place.placeUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="mt-1 w-fit text-sm font-semibold text-primary hover:underline"
        >
          카카오맵에서 보기 →
        </a>
      </div>

      {isReviewOpen && (
        <ReviewPanel placeId={place.id} placeName={place.name} lat={place.lat} lng={place.lng} />
      )}
    </div>
  );
}
