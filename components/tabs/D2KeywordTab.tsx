"use client";

import { CompetitionLevel, D2KeywordEntry, KeywordTier } from "@/lib/types";

const TIERS: KeywordTier[] = ["1층_핵심전환", "2층_상황검사", "3층_지역B2B"];
const COMPETITION: CompetitionLevel[] = ["낮음", "보통", "높음"];

interface Props {
  entries: D2KeywordEntry[];
  onChange: (entries: D2KeywordEntry[]) => void;
}

export default function D2KeywordTab({ entries, onChange }: Props) {
  const update = (i: number, patch: Partial<D2KeywordEntry>) => {
    onChange(entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  };
  const addRow = () => {
    onChange([...entries, { keyword: "", tier: "2층_상황검사" }]);
  };
  const removeRow = (i: number) => {
    onChange(entries.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">D2 · 키워드 3층 전략</h2>
        <p className="mt-1 text-sm text-slate-500">
          키워드별 층위와 (선택) 월 검색량·경쟁도를 입력하세요. 검색량·경쟁도는 미입력해도 되며, 진단 시 &quot;미입력&quot;으로 처리됩니다.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2">키워드</th>
              <th className="px-3 py-2">층위</th>
              <th className="px-3 py-2">월 검색량</th>
              <th className="px-3 py-2">경쟁도</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <input
                    value={e.keyword}
                    onChange={(ev) => update(i, { keyword: ev.target.value })}
                    placeholder="키워드"
                    className="w-full rounded border border-slate-300 px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={e.tier}
                    onChange={(ev) => update(i, { tier: ev.target.value as KeywordTier })}
                    className="rounded border border-slate-300 px-2 py-1"
                  >
                    {TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={e.monthlySearchVolume ?? ""}
                    onChange={(ev) =>
                      update(i, {
                        monthlySearchVolume: ev.target.value === "" ? undefined : Number(ev.target.value),
                      })
                    }
                    placeholder="미입력"
                    className="w-24 rounded border border-slate-300 px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={e.competitionLevel ?? ""}
                    onChange={(ev) =>
                      update(i, {
                        competitionLevel: ev.target.value === "" ? undefined : (ev.target.value as CompetitionLevel),
                      })
                    }
                    className="rounded border border-slate-300 px-2 py-1"
                  >
                    <option value="">미입력</option>
                    {COMPETITION.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => removeRow(i)}
                    className="text-xs text-slate-400 hover:text-red-500"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addRow}
        className="self-start rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        + 키워드 추가
      </button>
    </div>
  );
}
