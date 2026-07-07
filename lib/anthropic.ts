import Anthropic from "@anthropic-ai/sdk";

export function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export function getModel(): string {
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
}

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

/** Anthropic 일시 과부하(429/529) 또는 5xx 계열인지 판별 */
export function isOverloaded(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  return status === 429 || status === 529 || (typeof status === "number" && status >= 500);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 시스템+유저 프롬프트로 호출 후 JSON 파싱.
 * - 사고(thinking) 비활성화: 구조화 JSON 생성엔 불필요하며, Sonnet 5는 미지정 시
 *   적응형 사고가 켜져 응답이 느려지고 출력 토큰 예산을 잠식한다.
 * - 최대 3회 시도: 파싱 실패나 일시 과부하 대비. 과부하 시 점증 백오프.
 */
export async function callClaudeJson<T>(
  client: Anthropic,
  model: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens = 8192
): Promise<T> {
  const attempt = async (): Promise<T> => {
    const message = await client.messages.create({
      model,
      max_tokens: maxTokens,
      thinking: { type: "disabled" },
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("AI 응답에서 텍스트를 찾을 수 없습니다.");
    }
    return JSON.parse(stripCodeFence(textBlock.text)) as T;
  };

  let lastError: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      return await attempt();
    } catch (err) {
      lastError = err;
      if (i < 2) {
        await sleep(isOverloaded(err) ? 1500 * (i + 1) : 400);
      }
    }
  }
  throw lastError;
}
