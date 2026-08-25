"use client";

import { useState } from "react";
import type { KakaoPlace } from "@/lib/kakao";
import { useSavedPlaces } from "@/hooks/useSavedPlaces";
import SearchBar from "./SearchBar";
import ResultList from "./ResultList";

interface SearchResponse {
  places: KakaoPlace[];
  message: string | null;
}

export default function SearchSection() {
  const [places, setPlaces] = useState<KakaoPlace[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { savedIds, toggleSave, saveMemo } = useSavedPlaces();

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data: SearchResponse = await response.json();
      setPlaces(data.places);
      setMessage(data.message);
    } catch {
      setPlaces([]);
      setMessage("잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="w-full max-w-2xl">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>
      <div className="w-full max-w-5xl">
        <ResultList
          places={places}
          isLoading={isLoading}
          message={message}
          hasSearched={hasSearched}
          savedIds={savedIds}
          onToggleSave={toggleSave}
          onSaveMemo={saveMemo}
        />
      </div>
    </div>
  );
}
