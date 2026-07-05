"use client";

import { AuditedPost } from "@/lib/types";

interface Props {
  rssUrl: string;
  onRssUrlChange: (url: string) => void;
  onFetchRss: () => void;
  onAudit: () => void;
  posts: AuditedPost[];
  isFetching: boolean;
  isAuditing: boolean;
  fetchError: string | null;
  auditDone: boolean;
}

export default function D3ContentAuditTab({
  rssUrl,
  onRssUrlChange,
  onFetchRss,
  onAudit,
  posts,
  isFetching,
  isAuditing,
  fetchError,
  auditDone,
}: Props) {
  const hasSafety = posts.some((p) => p.safetyFlags.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">D3 · 콘텐츠 감사 (자동)</h2>
        <p className="mt-1 text-sm text-slate-500">
          블로그 RSS 주소를 입력해 최근 게시물을 수집한 뒤, AI 콘텐츠 감사로 제목형식·목적·카테고리·CTA·안전성을 자동 분류합니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={rssUrl}
          onChange={(e) => onRssUrlChange(e.target.value)}
          placeholder="https://rss.blog.naver.com/아이디.xml"
          className="min-w-[280px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          onClick={onFetchRss}
          disabled={isFetching || rssUrl.trim() === ""}
          className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:bg-slate-300"
        >
          {isFetching ? "수집 중..." : "수집"}
        </button>
        <button
          onClick={onAudit}
          disabled={isAuditing || posts.length === 0}
          className="rounded-md border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-100 disabled:opacity-50"
        >
          {isAuditing ? "감사 중..." : "콘텐츠 감사 실행"}
        </button>
      </div>

      {fetchError && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">⚠ {fetchError}</div>
      )}

      {hasSafety && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700">
          ⚠ 발행된 콘텐츠에서 위험 표현이 발견되었습니다. 아래 표에서 &quot;즉시 수정 권장&quot; 항목을 확인하세요.
        </div>
      )}

      {posts.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2">제목</th>
                <th className="px-3 py-2">발행일</th>
                <th className="px-3 py-2">형식</th>
                <th className="px-3 py-2">목적</th>
                <th className="px-3 py-2">카테고리</th>
                <th className="px-3 py-2">CTA</th>
                <th className="px-3 py-2">안전</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p, i) => (
                <tr key={i} className="border-t border-slate-100 align-top">
                  <td className="max-w-xs px-3 py-2">
                    <span className="line-clamp-2">{p.title}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-500">{p.pubDate}</td>
                  <td className="px-3 py-2">{auditDone ? p.titleFormat : "—"}</td>
                  <td className="px-3 py-2">{auditDone ? p.purposeTag : "—"}</td>
                  <td className="px-3 py-2">{auditDone ? p.category : "—"}</td>
                  <td className="px-3 py-2">
                    {!auditDone ? (
                      "—"
                    ) : p.hasCTA ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                        {p.ctaKeywordsFound.join(", ") || "있음"}
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">없음</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {!auditDone ? (
                      "—"
                    ) : p.safetyFlags.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {p.safetyFlags.map((f, fi) => (
                          <span
                            key={fi}
                            className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700"
                            title={`대체: ${f.suggestion}`}
                          >
                            즉시 수정 권장: {f.phrase}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">이상 없음</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {posts.length === 0 && !isFetching && (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
          아직 수집된 게시물이 없습니다. RSS 주소를 입력하고 &quot;수집&quot;을 눌러주세요.
        </p>
      )}
    </div>
  );
}
