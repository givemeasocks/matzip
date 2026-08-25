"use client";

import { useEffect, useState } from "react";
import type { KakaoPlace } from "@/lib/kakao";
import { useUser } from "@/hooks/useUser";
import { useSavedPlaces } from "@/hooks/useSavedPlaces";
import { supabase } from "@/lib/supabase/client";
import PlaceCard from "./PlaceCard";

interface SearchResponse {
  places: KakaoPlace[];
}

export default function RecommendedPlaces() {
  const { user } = useUser();
  const { savedIds, toggleSave } = useSavedPlaces();
  const [category, setCategory] = useState<string | null>(null);
  const [places, setPlaces] = useState<KakaoPlace[]>([]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    supabase
      .from("saved_places")
      .select("category")
      .then(({ data }) => {
        if (cancelled || !data) return;

        const counts = new Map<string, number>();
        for (const row of data) {
          if (!row.category) continue;
          counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
        }

        let topCategory: string | null = null;
        let topCount = 0;
        for (const [cat, count] of counts) {
          if (count > topCount) {
            topCount = count;
            topCategory = cat;
          }
        }

        setCategory(topCategory);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!category) return;

    let cancelled = false;

    fetch(`/api/search?q=${encodeURIComponent(category)}`)
      .then((res) => res.json())
      .then((data: SearchResponse) => {
        if (cancelled) return;
        setPlaces(data.places ?? []);
      });

    return () => {
      cancelled = true;
    };
  }, [category]);

  if (!user || !category) {
    return null;
  }

  const recommendations = places.filter((place) => !savedIds.has(place.id)).slice(0, 6);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="flex w-full max-w-5xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-foreground">나를 위한 추천</h2>
        <p className="text-sm text-foreground-secondary">
          자주 담은 &apos;{category}&apos; 카테고리의 다른 맛집이에요
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            isSaved={savedIds.has(place.id)}
            onToggleSave={toggleSave}
          />
        ))}
      </div>
    </section>
  );
}
