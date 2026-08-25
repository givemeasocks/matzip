"use client";

import { useState } from "react";
import type { KakaoPlace } from "@/lib/kakao";
import type { ToggleSaveResult } from "@/hooks/useSavedPlaces";
import { useAuthModal } from "./AuthModalProvider";
import ReviewPanel from "./ReviewPanel";

interface PlaceCardProps {
  place: KakaoPlace;
  isSaved: boolean;
  onToggleSave: (place: KakaoPlace) => Promise<ToggleSaveResult>;
  onSaveMemo: (placeId: string, memo: string) => Promise<void>;
}

export default function PlaceCard({ place, isSaved, onToggleSave, onSaveMemo }: PlaceCardProps) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(false);
  const [showMemoComposer, setShowMemoComposer] = useState(false);
  const [memoDraft, setMemoDraft] = useState("");
  const { openAuthModal } = useAuthModal();

  const handleToggleSave = async (event: React.MouseEvent) => {
    event.stopPropagation();
    const result = await onToggleSave(place);
    if (result.requiresLogin) {
      setShowLoginHint(true);
      openAuthModal();
      setTimeout(() => setShowLoginHint(false), 2500);
      return;
    }
    if (result.saved) {
      setMemoDraft("");
      setShowMemoComposer(true);
    } else {
      setShowMemoComposer(false);
    }
  };

  const handleSaveMemoDraft = async (event: React.MouseEvent) => {
    event.stopPropagation();
    await onSaveMemo(place.id, memoDraft);
    setShowMemoComposer(false);
  };

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

          <div className="relative shrink-0">
            <span
              role="button"
              aria-label={isSaved ? "담기 취소" : "담기"}
              onClick={handleToggleSave}
              className={
                isSaved
                  ? "flex h-11 w-11 items-center justify-center rounded-full border border-primary bg-primary text-white transition-colors"
                  : "flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground-tertiary transition-colors hover:border-primary hover:text-primary"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isSaved ? "currentColor" : "none"}
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

            {showLoginHint && (
              <div className="absolute right-0 top-12 z-10 w-max rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-white shadow-lg">
                로그인하면 담을 수 있어요
              </div>
            )}

            {showMemoComposer && (
              <div
                onClick={(event) => event.stopPropagation()}
                className="absolute right-0 top-12 z-10 w-56 rounded-xl border border-border bg-surface p-3 shadow-lg"
              >
                <p className="mb-2 text-xs font-semibold text-foreground-secondary">
                  담았어요! 메모를 남겨볼까요?
                </p>
                <textarea
                  autoFocus
                  value={memoDraft}
                  onChange={(event) => setMemoDraft(event.target.value)}
                  placeholder="예: 회식 장소, 친구 추천"
                  className="mb-2 h-16 w-full resize-none rounded-lg border border-border px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowMemoComposer(false);
                    }}
                    className="text-xs font-semibold text-foreground-tertiary hover:text-foreground"
                  >
                    닫기
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMemoDraft}
                    className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white hover:bg-primary-hover"
                  >
                    저장
                  </button>
                </div>
              </div>
            )}
          </div>
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
