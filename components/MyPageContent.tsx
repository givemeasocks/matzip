"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase/client";
import { useAuthModal } from "./AuthModalProvider";

interface SavedPlaceRow {
  id: string;
  place_name: string;
  category: string | null;
  address: string | null;
  memo: string | null;
  visited: boolean;
  review: string | null;
  created_at: string;
}

function googleMapsLink(name: string, address: string | null) {
  const query = [name, address].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

export default function MyPageContent() {
  const { user, isLoading: isUserLoading } = useUser();
  const { openAuthModal } = useAuthModal();
  const [places, setPlaces] = useState<SavedPlaceRow[] | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    supabase
      .from("saved_places")
      .select("id, place_name, category, address, memo, visited, review, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setPlaces(data ?? []);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleDelete = async (id: string) => {
    setPlaces((prev) => prev?.filter((place) => place.id !== id) ?? null);
    await supabase.from("saved_places").delete().eq("id", id);
  };

  const handleSaveMemo = async (id: string, memo: string) => {
    const trimmed = memo.trim();
    const previousMemo = places?.find((place) => place.id === id)?.memo ?? null;

    setPlaces((prev) =>
      prev ? prev.map((place) => (place.id === id ? { ...place, memo: trimmed || null } : place)) : prev
    );

    const { error } = await supabase
      .from("saved_places")
      .update({ memo: trimmed || null })
      .eq("id", id);

    if (error) {
      setPlaces((prev) =>
        prev ? prev.map((place) => (place.id === id ? { ...place, memo: previousMemo } : place)) : prev
      );
    }
  };

  const handleSetVisited = async (id: string, visited: boolean) => {
    const previous = places?.find((place) => place.id === id);
    if (!previous || previous.visited === visited) return;

    setPlaces((prev) =>
      prev ? prev.map((place) => (place.id === id ? { ...place, visited } : place)) : prev
    );

    const { error } = await supabase.from("saved_places").update({ visited }).eq("id", id);

    if (error) {
      setPlaces((prev) => (prev ? prev.map((place) => (place.id === id ? previous : place)) : prev));
    }
  };

  const handleSaveReview = async (id: string, review: string) => {
    const trimmed = review.trim();
    const previousReview = places?.find((place) => place.id === id)?.review ?? null;

    setPlaces((prev) =>
      prev
        ? prev.map((place) => (place.id === id ? { ...place, review: trimmed || null } : place))
        : prev
    );

    const { error } = await supabase
      .from("saved_places")
      .update({ review: trimmed || null })
      .eq("id", id);

    if (error) {
      setPlaces((prev) =>
        prev ? prev.map((place) => (place.id === id ? { ...place, review: previousReview } : place)) : prev
      );
    }
  };

  if (isUserLoading) {
    return null;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-foreground-secondary">로그인하면 담은 맛집을 볼 수 있어요.</p>
        <button
          type="button"
          onClick={openAuthModal}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          로그인
        </button>
      </div>
    );
  }

  if (places === null) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-foreground-tertiary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-foreground-secondary">아직 담은 맛집이 없어요, 검색하러 가볼까요?</p>
        <Link
          href="/"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          검색하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((place) => (
        <SavedPlaceCard
          key={place.id}
          place={place}
          onDelete={handleDelete}
          onSaveMemo={handleSaveMemo}
          onSetVisited={handleSetVisited}
          onSaveReview={handleSaveReview}
        />
      ))}
    </div>
  );
}

interface SavedPlaceCardProps {
  place: SavedPlaceRow;
  onDelete: (id: string) => void;
  onSaveMemo: (id: string, memo: string) => void;
  onSetVisited: (id: string, visited: boolean) => void;
  onSaveReview: (id: string, review: string) => void;
}

function SavedPlaceCard({ place, onDelete, onSaveMemo, onSetVisited, onSaveReview }: SavedPlaceCardProps) {
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [draftMemo, setDraftMemo] = useState(place.memo ?? "");
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [draftReview, setDraftReview] = useState(place.review ?? "");

  const startEditMemo = () => {
    setDraftMemo(place.memo ?? "");
    setIsEditingMemo(true);
  };

  const saveMemo = () => {
    onSaveMemo(place.id, draftMemo);
    setIsEditingMemo(false);
  };

  const startEditReview = () => {
    setDraftReview(place.review ?? "");
    setIsEditingReview(true);
  };

  const saveReview = () => {
    onSaveReview(place.id, draftReview);
    setIsEditingReview(false);
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="w-fit rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
            {place.category || "맛집"}
          </span>
          <h3 className="text-lg font-bold text-foreground">{place.place_name}</h3>
        </div>
        <button
          type="button"
          aria-label="삭제"
          onClick={() => onDelete(place.id)}
          className="shrink-0 rounded-full border border-border p-2 text-foreground-tertiary transition-colors hover:border-rose-400 hover:text-rose-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <p className="text-sm text-foreground-secondary">{place.address}</p>
      <p className="text-xs text-foreground-tertiary">{formatDate(place.created_at)} 담음</p>

      {/* 방문 상태 토글 */}
      <div className="flex w-fit rounded-full bg-background p-1">
        <button
          type="button"
          onClick={() => onSetVisited(place.id, false)}
          className={
            !place.visited
              ? "rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm"
              : "rounded-full px-3 py-1.5 text-xs font-semibold text-foreground-tertiary"
          }
        >
          가기 전
        </button>
        <button
          type="button"
          onClick={() => onSetVisited(place.id, true)}
          className={
            place.visited
              ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
              : "rounded-full px-3 py-1.5 text-xs font-semibold text-foreground-tertiary"
          }
        >
          다녀옴
        </button>
      </div>

      {isEditingMemo ? (
        <div className="flex flex-col gap-2">
          <textarea
            autoFocus
            value={draftMemo}
            onChange={(event) => setDraftMemo(event.target.value)}
            placeholder="이 가게에 대한 메모를 남겨보세요"
            className="min-h-[64px] w-full rounded-xl border border-primary px-3 py-2 text-sm text-foreground outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditingMemo(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground-tertiary hover:text-foreground"
            >
              취소
            </button>
            <button
              type="button"
              onClick={saveMemo}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover"
            >
              저장
            </button>
          </div>
        </div>
      ) : place.memo ? (
        <button
          type="button"
          onClick={startEditMemo}
          className="rounded-xl bg-background px-3 py-2 text-left text-sm text-foreground-secondary transition-colors hover:bg-primary-soft"
        >
          {place.memo}
        </button>
      ) : (
        <button
          type="button"
          onClick={startEditMemo}
          className="w-fit rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-foreground-tertiary transition-colors hover:border-primary hover:text-primary"
        >
          + 메모 추가
        </button>
      )}

      {/* 다녀온 경우에만 방문 후기 */}
      {place.visited && (
        <div className="flex flex-col gap-1.5 border-t border-border pt-3">
          <span className="text-xs font-semibold text-foreground-secondary">방문 후기</span>
          {isEditingReview ? (
            <div className="flex flex-col gap-2">
              <textarea
                autoFocus
                value={draftReview}
                onChange={(event) => setDraftReview(event.target.value)}
                placeholder="어땠나요? 다녀온 후기를 남겨보세요"
                className="min-h-[64px] w-full rounded-xl border border-primary px-3 py-2 text-sm text-foreground outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingReview(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground-tertiary hover:text-foreground"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={saveReview}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover"
                >
                  저장
                </button>
              </div>
            </div>
          ) : place.review ? (
            <button
              type="button"
              onClick={startEditReview}
              className="rounded-xl bg-primary-soft px-3 py-2 text-left text-sm text-foreground transition-colors hover:brightness-95"
            >
              {place.review}
            </button>
          ) : (
            <button
              type="button"
              onClick={startEditReview}
              className="w-fit rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-foreground-tertiary transition-colors hover:border-primary hover:text-primary"
            >
              + 후기 남기기
            </button>
          )}
        </div>
      )}

      <a
        href={googleMapsLink(place.place_name, place.address)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 w-fit text-sm font-semibold text-primary hover:underline"
      >
        구글맵에서 보기 →
      </a>
    </div>
  );
}
