"use client";

import { D5FunnelStep } from "@/lib/types";

interface Props {
  steps: D5FunnelStep[];
  onChange: (steps: D5FunnelStep[]) => void;
}

export default function D5FunnelTab({ steps, onChange }: Props) {
  const update = (i: number, patch: Partial<D5FunnelStep>) => {
    onChange(steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };
  const addStep = () => onChange([...steps, { stepName: "", passed: null }]);
  const removeStep = (i: number) => onChange(steps.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">D5 · 전환 동선 체크리스트</h2>
        <p className="mt-1 text-sm text-slate-500">
          글 → CTA → 신청 → 완료 각 단계의 통과/차단 여부를 확인해 입력하세요. 확인하지 않은 단계는 &quot;미입력&quot;으로 두면 진단에서 제외됩니다.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
            <span className="w-6 text-center text-sm font-semibold text-slate-400">{i + 1}</span>
            <input
              value={s.stepName}
              onChange={(ev) => update(i, { stepName: ev.target.value })}
              placeholder="단계 이름 (예: 블로그 글에서 CTA 확인)"
              className="min-w-[220px] flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
            />
            <div className="flex items-center gap-1 text-sm">
              {(["통과", "차단", "미입력"] as const).map((label) => {
                const value = label === "통과" ? true : label === "차단" ? false : null;
                const selected = s.passed === value;
                return (
                  <button
                    key={label}
                    onClick={() => update(i, { passed: value })}
                    className={`rounded px-3 py-1 ${
                      selected
                        ? label === "통과"
                          ? "bg-emerald-600 text-white"
                          : label === "차단"
                          ? "bg-red-600 text-white"
                          : "bg-slate-400 text-white"
                        : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <input
              value={s.note ?? ""}
              onChange={(ev) => update(i, { note: ev.target.value })}
              placeholder="메모(선택)"
              className="min-w-[160px] flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
            />
            <button onClick={() => removeStep(i)} className="text-xs text-slate-400 hover:text-red-500">
              삭제
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addStep}
        className="self-start rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        + 단계 추가
      </button>
    </div>
  );
}
