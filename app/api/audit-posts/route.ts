import { NextRequest, NextResponse } from "next/server";
import { AUDIT_SYSTEM_PROMPT, buildAuditUserMessage } from "@/lib/prompts/audit";
import { callClaudeJson, getClient, getModel } from "@/lib/anthropic";
import { AuditedPost } from "@/lib/types";

export async function POST(request: NextRequest) {
  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: "서버에 ANTHROPIC_API_KEY가 설정되지 않았습니다. .env.local을 확인해주세요." },
      { status: 500 }
    );
  }

  let posts: { title: string; pubDate: string; excerpt: string }[];
  try {
    const body = await request.json();
    posts = body.posts;
  } catch {
    return NextResponse.json({ error: "요청 본문을 읽을 수 없습니다." }, { status: 400 });
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return NextResponse.json({ error: "감사할 게시물이 없습니다. 먼저 RSS를 수집해주세요." }, { status: 400 });
  }

  try {
    const result = await callClaudeJson<{ auditedPosts: AuditedPost[] }>(
      client,
      getModel(),
      AUDIT_SYSTEM_PROMPT,
      buildAuditUserMessage(posts)
    );

    // 원본 pubDate/excerpt 보존 (AI가 누락할 수 있으므로 title 기준으로 병합)
    const merged = result.auditedPosts.map((audited) => {
      const original = posts.find((p) => p.title === audited.title) ?? posts[0];
      return {
        ...audited,
        pubDate: audited.pubDate ?? original.pubDate,
        excerpt: original.excerpt,
        ctaKeywordsFound: audited.ctaKeywordsFound ?? [],
        safetyFlags: audited.safetyFlags ?? [],
      };
    });

    return NextResponse.json({ auditedPosts: merged }, { status: 200 });
  } catch (err) {
    console.error("audit-posts 실패:", err);
    return NextResponse.json({ error: "콘텐츠 감사에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 502 });
  }
}
