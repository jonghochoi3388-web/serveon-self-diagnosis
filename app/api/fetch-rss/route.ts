import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export async function POST(request: NextRequest) {
  let rssUrl: string;
  try {
    const body = await request.json();
    rssUrl = body.rssUrl;
  } catch {
    return NextResponse.json({ error: "요청 본문을 읽을 수 없습니다." }, { status: 400 });
  }

  if (!rssUrl || !/^https?:\/\//.test(rssUrl)) {
    return NextResponse.json({ error: "올바른 RSS 주소(http/https)를 입력해주세요." }, { status: 400 });
  }

  let xml: string;
  try {
    const res = await fetch(rssUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ServeonSelfDiagnosis/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `RSS 주소에서 응답을 받지 못했습니다 (HTTP ${res.status}).` }, { status: 502 });
    }
    xml = await res.text();
  } catch {
    return NextResponse.json(
      { error: "RSS 주소에 연결하지 못했습니다. 주소를 확인하거나 잠시 후 다시 시도해주세요." },
      { status: 502 }
    );
  }

  try {
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);
    const items = toArray(parsed?.rss?.channel?.item);
    if (items.length === 0) {
      return NextResponse.json({ error: "RSS에서 게시물을 찾을 수 없습니다. 주소가 블로그 RSS가 맞는지 확인해주세요." }, { status: 422 });
    }

    const posts = items.slice(0, 20).map((item: Record<string, unknown>) => {
      const rawDesc = String(item.description ?? item["content:encoded"] ?? "");
      const excerpt = stripHtml(rawDesc).slice(0, 200);
      return {
        title: stripHtml(String(item.title ?? "")),
        pubDate: String(item.pubDate ?? item["dc:date"] ?? "").trim(),
        excerpt,
      };
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "RSS 파싱에 실패했습니다. 올바른 RSS 형식이 아닐 수 있습니다." }, { status: 422 });
  }
}
