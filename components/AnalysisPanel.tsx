"use client";

import { useEffect, useState } from "react";
import type { ReviewAnalysis } from "@/lib/gemini";
import WordCloud from "./WordCloud";

interface AnalysisPanelProps {
  placeId: string;
  placeName: string;
  reviews: Array<{ author: string; rating: number; text: string }>;
}

interface AnalyzeResponse {
  analysis: ReviewAnalysis | null;
  message: string | null;
}

const sessionCache = new Map<string, AnalyzeResponse>();
const cacheKey = (placeId: string) => `ai-analysis:${placeId}`;

function readCache(placeId: string): AnalyzeResponse | null {
  if (sessionCache.has(placeId)) {
    return sessionCache.get(placeId) ?? null;
  }
  try {
    const raw = sessionStorage.getItem(cacheKey(placeId));
    if (!raw) return null;
    const parsed: AnalyzeResponse = JSON.parse(raw);
    sessionCache.set(placeId, parsed);
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(placeId: string, data: AnalyzeResponse) {
  sessionCache.set(placeId, data);
  try {
    sessionStorage.setItem(cacheKey(placeId), JSON.stringify(data));
  } catch {
    // sessionStorage 사용 불가 시 메모리 캐시만 사용
  }
}

export default function AnalysisPanel({ placeId, placeName, reviews }: AnalysisPanelProps) {
  const [data, setData] = useState<AnalyzeResponse | null>(() => readCache(placeId));

  useEffect(() => {
    if (data || reviews.length === 0) return;

    let cancelled = false;

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeName, reviews }),
    })
      .then((res) => res.json())
      .then((result: AnalyzeResponse) => {
        if (cancelled) return;
        writeCache(placeId, result);
        setData(result);
      })
      .catch(() => {
        if (cancelled) return;
        setData({ analysis: null, message: "잠시 후 다시 시도해주세요." });
      });

    return () => {
      cancelled = true;
    };
  }, [placeId, placeName, reviews, data]);

  if (reviews.length === 0) {
    return null;
  }

  if (!data) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        AI가 리뷰를 분석하는 중
      </div>
    );
  }

  if (!data.analysis) {
    return <p className="text-sm text-foreground-tertiary">{data.message}</p>;
  }

  const { sentiment, keywords, summary } = data.analysis;
  const total = sentiment.positive + sentiment.neutral + sentiment.negative || 1;
  const pct = (n: number) => (n / total) * 100;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-border">
          <div className="bg-emerald-500" style={{ width: `${pct(sentiment.positive)}%` }} />
          <div className="bg-amber-400" style={{ width: `${pct(sentiment.neutral)}%` }} />
          <div className="bg-rose-500" style={{ width: `${pct(sentiment.negative)}%` }} />
        </div>
        <div className="flex gap-4 text-xs text-foreground-secondary">
          <span>😊 긍정 {sentiment.positive}</span>
          <span>😐 보통 {sentiment.neutral}</span>
          <span>😞 부정 {sentiment.negative}</span>
        </div>
      </div>

      {keywords.length > 0 && <WordCloud keywords={keywords} />}

      <div className="relative w-fit max-w-full rounded-2xl rounded-tl-sm bg-primary-soft px-4 py-3 text-sm font-medium text-foreground">
        🤖 {summary}
      </div>
    </div>
  );
}
