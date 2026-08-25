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
      .select("id, place_name, category, address, created_at")
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
        <div
          key={place.id}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm"
        >
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
              onClick={() => handleDelete(place.id)}
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

          <a
            href={googleMapsLink(place.place_name, place.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 w-fit text-sm font-semibold text-primary hover:underline"
          >
            구글맵에서 보기 →
          </a>
        </div>
      ))}
    </div>
  );
}
