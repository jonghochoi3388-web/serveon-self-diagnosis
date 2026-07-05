"use client";

import { D1ExposureResult } from "@/lib/types";
import { buildNaverSearchUrl } from "@/lib/constants";

interface Props {
  results: D1ExposureResult[];
  onChange: (results: D1ExposureResult[]) => void;
  auditedTitles: string[]; // D3에서 수집된 제목 (자동 채우기용)
}

function emptyRow(): D1ExposureResult {
  return {
    checkedTitle: "",
    titleSearchUrl: "",
    keywordSearchUrl: "",
    titleFoundInSearch: null,
    keywordTopPageFound: null,
  };
}

export default function D1ExposureTab({ results, onChange, auditedTitles }: Props) {
  const update = (i: number, patch: Partial<D1ExposureResult>) => {
    onChange(results.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const setTitle = (i: number, title: string, keyword: string) => {
    update(i, {
      checkedTitle: title,
      titleSearchUrl: title ? buildNaverSearchUrl(title) : "",
      keywordSearchUrl: keyword ? buildNaverSearchUrl(keyword) : results[i].keywordSearchUrl,
    });
  };

  const addRow = () => onChange([...results, emptyRow()]);
  const removeRow = (i: number) => onChange(results.filter((_, idx) => idx !== i));

  const importFromAudit = () => {
    const rows = auditedTitles.map((title) => ({
      checkedTitle: title,
      titleSearchUrl: buildNaverSearchUrl(title),
      keywordSearchUrl: "",
      titleFoundInSearch: null,
      keywordTopPageFound: null,
    }));
    onChange(rows.length > 0 ? rows : [emptyRow()]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">D1 · 노출 테스트 (반자동)</h2>
        <p className="mt-1 text-sm text-slate-500">
          제목을 입력하면 네이버 모바일 검색 링크가 자동 생성됩니다. 새 탭에서 열어 실제 노출 여부를 확인한 뒤 결과를 체크하세요.
          확인하지 않은 항목은 &quot;미확인&quot;으로 두면 진단에서 제외됩니다.
        </p>
      </div>

      {auditedTitles.length > 0 && (
        <button
          onClick={importFromAudit}
          className="self-start rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-100"
        >
          D3 수집 제목 {auditedTitles.length}건 자동 채우기
        </button>
      )}

      <div className="flex flex-col gap-3">
        {results.map((r, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="mt-2 w-6 text-center text-sm font-semibold text-slate-400">{i + 1}</span>
              <div className="flex-1">
                <input
                  value={r.checkedTitle}
                  onChange={(ev) => setTitle(i, ev.target.value, "")}
                  placeholder="검색해볼 게시물 제목"
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                />
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input
                    value={r.keywordSearchUrl ? decodeURIComponent(r.keywordSearchUrl.split("query=")[1] ?? "") : ""}
                    onChange={(ev) =>
                      update(i, {
                        keywordSearchUrl: ev.target.value ? buildNaverSearchUrl(ev.target.value) : "",
                      })
                    }
                    placeholder="핵심 키워드 (예: 병원동행)"
                    className="rounded border border-slate-300 px-2 py-1 text-sm"
                  />
                  <div className="flex items-center gap-2 text-xs">
                    {r.titleSearchUrl && (
                      <a href={r.titleSearchUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 underline">
                        제목검색 열기 ↗
                      </a>
                    )}
                    {r.keywordSearchUrl && (
                      <a href={r.keywordSearchUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 underline">
                        키워드검색 열기 ↗
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={r.titleFoundInSearch === true}
                      onChange={(ev) => update(i, { titleFoundInSearch: ev.target.checked ? true : null })}
                    />
                    제목이 검색결과에 노출됨
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={r.keywordTopPageFound === true}
                      onChange={(ev) => update(i, { keywordTopPageFound: ev.target.checked ? true : null })}
                    />
                    핵심 키워드 상위 페이지에 노출됨
                  </label>
                </div>
              </div>
              <button onClick={() => removeRow(i)} className="text-xs text-slate-400 hover:text-red-500">
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="self-start rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        + 항목 추가
      </button>
    </div>
  );
}
