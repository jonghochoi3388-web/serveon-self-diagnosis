"use client";

import { D4ChannelEntry } from "@/lib/types";
import { DIAGNOSIS_THRESHOLDS } from "@/lib/constants";

interface Props {
  entries: D4ChannelEntry[];
  onChange: (entries: D4ChannelEntry[]) => void;
}

function operationLabel(daysAgo: number, isOperating: boolean): string {
  if (!isOperating) return "미운영";
  if (daysAgo <= DIAGNOSIS_THRESHOLDS.CHANNEL_ACTIVE_DAYS_HIGH) return "운영 높음";
  if (daysAgo <= DIAGNOSIS_THRESHOLDS.CHANNEL_ACTIVE_DAYS_MID) return "운영 보통";
  return "운영 낮음";
}

export default function D4ChannelTab({ entries, onChange }: Props) {
  const update = (i: number, patch: Partial<D4ChannelEntry>) => {
    onChange(entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">D4 · 채널 정합성 체크리스트</h2>
        <p className="mt-1 text-sm text-slate-500">
          채널별 운영 여부·최근 활동일을 입력하세요. 타깃 존재 강도(0~10)는 기본값이 채워져 있으며 필요 시 조정할 수 있습니다.
          최근 활동 {DIAGNOSIS_THRESHOLDS.CHANNEL_ACTIVE_DAYS_HIGH}일 이내는 운영 높음, {DIAGNOSIS_THRESHOLDS.CHANNEL_ACTIVE_DAYS_MID}일 이내는 보통으로 자동 판정됩니다.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2">채널</th>
              <th className="px-3 py-2">운영 중</th>
              <th className="px-3 py-2">최근 활동(일 전)</th>
              <th className="px-3 py-2">타깃 강도(0~10)</th>
              <th className="px-3 py-2">자동 판정</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{e.channel}</td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={e.isOperating}
                    onChange={(ev) => update(i, { isOperating: ev.target.checked })}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={e.lastActivityDaysAgo}
                    onChange={(ev) => update(i, { lastActivityDaysAgo: Number(ev.target.value) })}
                    disabled={!e.isOperating}
                    className="w-24 rounded border border-slate-300 px-2 py-1 disabled:bg-slate-100"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={e.targetStrength}
                    onChange={(ev) => update(i, { targetStrength: Number(ev.target.value) })}
                    className="w-20 rounded border border-slate-300 px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      !e.isOperating
                        ? "bg-slate-100 text-slate-500"
                        : operationLabel(e.lastActivityDaysAgo, e.isOperating) === "운영 높음"
                        ? "bg-emerald-100 text-emerald-700"
                        : operationLabel(e.lastActivityDaysAgo, e.isOperating) === "운영 보통"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {operationLabel(e.lastActivityDaysAgo, e.isOperating)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
