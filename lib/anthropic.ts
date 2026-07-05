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

/** 시스템+유저 프롬프트로 호출 후 JSON 파싱. 실패 시 1회 재시도. */
export async function callClaudeJson<T>(
  client: Anthropic,
  model: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens = 4096
): Promise<T> {
  const attempt = async (): Promise<T> => {
    const message = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("AI 응답에서 텍스트를 찾을 수 없습니다.");
    }
    return JSON.parse(stripCodeFence(textBlock.text)) as T;
  };

  try {
    return await attempt();
  } catch {
    return await attempt();
  }
}
