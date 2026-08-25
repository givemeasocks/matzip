"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "./useUser";
import { supabase } from "@/lib/supabase/client";
import type { KakaoPlace } from "@/lib/kakao";

export interface ToggleSaveResult {
  requiresLogin: boolean;
  saved: boolean;
}

const EMPTY_SET: Set<string> = new Set();

export function useSavedPlaces() {
  const { user } = useUser();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    supabase
      .from("saved_places")
      .select("place_id")
      .then(({ data }) => {
        if (cancelled || !data) return;
        setSavedIds(new Set(data.map((row) => row.place_id as string)));
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleSave = useCallback(
    async (place: KakaoPlace): Promise<ToggleSaveResult> => {
      if (!user) {
        return { requiresLogin: true, saved: false };
      }

      const isSaved = savedIds.has(place.id);

      if (isSaved) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(place.id);
          return next;
        });

        const { error } = await supabase
          .from("saved_places")
          .delete()
          .eq("place_id", place.id);

        if (error) {
          setSavedIds((prev) => new Set(prev).add(place.id));
        }
      } else {
        setSavedIds((prev) => new Set(prev).add(place.id));

        const { error } = await supabase.from("saved_places").insert({
          user_id: user.id,
          place_id: place.id,
          place_name: place.name,
          category: place.category,
          address: place.roadAddress || place.address,
          lat: place.lat,
          lng: place.lng,
        });

        if (error) {
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(place.id);
            return next;
          });
        }
      }

      return { requiresLogin: false, saved: !isSaved };
    },
    [user, savedIds]
  );

  const saveMemo = useCallback(async (placeId: string, memo: string) => {
    const trimmed = memo.trim();
    await supabase
      .from("saved_places")
      .update({ memo: trimmed || null })
      .eq("place_id", placeId);
  }, []);

  return { savedIds: user ? savedIds : EMPTY_SET, toggleSave, saveMemo };
}
