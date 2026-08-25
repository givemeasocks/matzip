export interface ReviewAnalysis {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keywords: Array<{
    word: string;
    weight: number;
    sentiment: "positive" | "negative";
  }>;
  summary: string;
}

interface GenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    sentiment: {
      type: "OBJECT",
      properties: {
        positive: { type: "INTEGER" },
        neutral: { type: "INTEGER" },
        negative: { type: "INTEGER" },
      },
      required: ["positive", "neutral", "negative"],
    },
    keywords: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          word: { type: "STRING" },
          weight: { type: "INTEGER" },
          sentiment: { type: "STRING", enum: ["positive", "negative"] },
        },
        required: ["word", "weight", "sentiment"],
      },
    },
    summary: { type: "STRING" },
  },
  required: ["sentiment", "keywords", "summary"],
};

export async function analyzeReviews(
  placeName: string,
  reviews: Array<{ author: string; rating: number; text: string }>
): Promise<ReviewAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  const reviewLines = reviews
    .map((review, index) => `${index + 1}) (별점 ${review.rating}) ${review.text}`)
    .join("\n");

  const prompt = `"${placeName}"의 구글 리뷰 목록이다. 아래 기준으로 분석해서 JSON으로만 답하라.
1. 각 리뷰를 긍정/보통/부정으로 분류하고 개수를 센다.
2. 리뷰에 자주 등장하는 핵심 단어를 8~15개 추출한다. 음식 이름, 맛, 분위기, 서비스 위주로 뽑고 각 단어가 좋은 맥락인지 나쁜 맥락인지 표시한다. weight는 1~10 사이 중요도.
3. 리뷰 전체를 한 문장으로 요약한다.

리뷰 목록:
${reviewLines}`;

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Gemini API 오류: ${response.status}`);
  }

  const data: GenerateContentResponse = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini 응답이 비어 있습니다.");
  }

  return JSON.parse(text) as ReviewAnalysis;
}
