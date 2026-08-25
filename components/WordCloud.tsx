"use client";

import { useEffect, useRef } from "react";

interface WordCloudProps {
  keywords: Array<{ word: string; weight: number; sentiment: "positive" | "negative" }>;
}

const POSITIVE_COLOR = "#22c55e";
const NEGATIVE_COLOR = "#ef4444";

export default function WordCloud({ keywords }: WordCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || keywords.length === 0) return;

    let cancelled = false;

    import("wordcloud").then(({ default: WordCloudLib }) => {
      if (cancelled || !WordCloudLib.isSupported) return;

      const sentimentByWord = new Map(keywords.map((k) => [k.word, k.sentiment]));
      const width = canvas.parentElement?.clientWidth ?? 320;
      canvas.width = width;
      canvas.height = 220;

      WordCloudLib(canvas, {
        list: keywords.map((k) => [k.word, k.weight] as [string, number]),
        weightFactor: (weight: number) => 6 + weight * 3.2,
        fontFamily: "var(--font-pretendard), sans-serif",
        fontWeight: "700",
        color: (word: string) =>
          sentimentByWord.get(word) === "negative" ? NEGATIVE_COLOR : POSITIVE_COLOR,
        backgroundColor: "transparent",
        rotateRatio: 0,
        gridSize: 8,
        shape: "circle",
      });
    });

    return () => {
      cancelled = true;
    };
  }, [keywords]);

  return <canvas ref={canvasRef} className="w-full" style={{ height: 220 }} />;
}
