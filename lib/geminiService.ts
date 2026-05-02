import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite-001",
].filter(Boolean) as string[];

type GeminiResult = {
  summary: string;
  score: -1 | 0 | 1;
  quotaExceeded?: boolean;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function summarizeWithGemini(title: string): Promise<GeminiResult> {
  const prompt = `
      너는 금융 전문가야. 다음 뉴스 제목을 보고 3줄 내외로 핵심 내용을 요약하고, 
      시장에 미칠 영향을 점수(-1: 부정, 0: 중립, 1: 긍정)로 매겨줘.
      응답은 반드시 아래 JSON 형식으로만 해줘 (Markdown 코드 블록 없이 순수 JSON만):
      { "summary": "요약 내용", "score": 0 }
      
      뉴스 제목: ${title}
    `;

  for (const modelName of MODEL_CANDIDATES) {
    let waitMs = 1000;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(text);
        const score = parsed?.score === -1 || parsed?.score === 1 ? parsed.score : 0;

        return {
          summary: String(parsed?.summary ?? "요약 없음"),
          score,
        };
      } catch (error: any) {
        const message = String(error?.message ?? "");
        const isRateLimit =
          message.includes("429") ||
          message.toLowerCase().includes("quota exceeded");

        console.error(
          `❌ Gemini 에러 (${modelName}, 시도 ${attempt}/3, ${title.substring(0, 5)}...):`,
          message
        );

        if (isRateLimit && attempt < 3) {
          await sleep(waitMs);
          waitMs *= 2;
          continue;
        }

        if (isRateLimit) {
          return { summary: "분석 일시 불가", score: 0, quotaExceeded: true };
        }

        break;
      }
    }
  }

  return { summary: "분석 모델 연결 오류", score: 0 };
}