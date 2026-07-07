import { NextRequest, NextResponse } from "next/server";
import { REPORT_SYSTEM_PROMPT, buildReportUserMessage } from "@/lib/prompts/report";
import { callClaudeJson, getClient, getModel, isOverloaded } from "@/lib/anthropic";
import { DiagnosisReport } from "@/lib/types";

// Vercel 서버리스 함수 실행 시간을 늘려 리포트 생성 중 타임아웃을 방지
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: "서버에 ANTHROPIC_API_KEY가 설정되지 않았습니다. .env.local을 확인해주세요." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 본문을 읽을 수 없습니다." }, { status: 400 });
  }

  const { d1 = [], d2 = [], d3 = [], d4 = [], d5 = [] } = body ?? {};

  try {
    const report = await callClaudeJson<DiagnosisReport>(
      client,
      getModel(),
      REPORT_SYSTEM_PROMPT,
      buildReportUserMessage({ d1, d2, d3, d4, d5 }),
      4096
    );
    return NextResponse.json(report, { status: 200 });
  } catch (err) {
    console.error("generate-report 실패:", err);
    if (isOverloaded(err)) {
      return NextResponse.json(
        { error: "지금 AI 서버가 혼잡합니다. 20~30초 후 다시 시도해주세요. (급하면 '샘플 진단 불러오기'로 흐름을 확인하실 수 있습니다.)" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "진단 리포트 생성에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 502 });
  }
}
