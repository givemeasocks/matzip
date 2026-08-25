import type { KakaoPlace } from "@/lib/kakao";
import type { ToggleSaveResult } from "@/hooks/useSavedPlaces";
import PlaceCard from "./PlaceCard";

interface ResultListProps {
  places: KakaoPlace[];
  isLoading: boolean;
  message: string | null;
  hasSearched: boolean;
  savedIds: Set<string>;
  onToggleSave: (place: KakaoPlace) => Promise<ToggleSaveResult>;
  onSaveMemo: (placeId: string, memo: string) => Promise<void>;
}

export default function ResultList({
  places,
  isLoading,
  message,
  hasSearched,
  savedIds,
  onToggleSave,
  onSaveMemo,
}: ResultListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-foreground-tertiary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        <p className="text-sm">검색하는 중..</p>
      </div>
    );
  }

  if (!hasSearched) {
    return null;
  }

  if (message) {
    return (
      <div className="flex flex-col items-center gap-2 py-20 text-center text-foreground-secondary">
        <p className="text-base">{message}</p>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          isSaved={savedIds.has(place.id)}
          onToggleSave={onToggleSave}
          onSaveMemo={onSaveMemo}
        />
      ))}
    </div>
  );
}
