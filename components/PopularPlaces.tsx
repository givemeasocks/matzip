"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface PopularPlace {
  place_id: string;
  place_name: string;
  save_count: number;
}

export default function PopularPlaces() {
  const [places, setPlaces] = useState<PopularPlace[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    supabase
      .rpc("get_popular_places", { limit_count: 5 })
      .then(({ data }) => {
        if (cancelled) return;
        setPlaces((data as PopularPlace[] | null) ?? []);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!places || places.length === 0) {
    return null;
  }

  return (
    <section className="flex w-full max-w-5xl flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground">지금 인기 맛집 Top 5</h2>
      <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-2 shadow-sm">
        {places.map((place, index) => (
          <a
            key={place.place_id}
            href={`https://map.kakao.com/?q=${encodeURIComponent(place.place_name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-background"
          >
            <span
              className={
                index < 3
                  ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
                  : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary"
              }
            >
              {index + 1}
            </span>
            <span className="flex-1 font-semibold text-foreground">{place.place_name}</span>
            <span className="text-sm text-foreground-tertiary">{place.save_count}번 담김</span>
          </a>
        ))}
      </div>
    </section>
  );
}
