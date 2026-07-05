"use client";

import { DiagnosisReport, DiagnosisSnapshot } from "@/lib/types";
import ReportCharts from "./ReportCharts";

interface Props {
  report: DiagnosisReport | null;
  onGenerate: () => void;
  isGenerating: boolean;
  error: string | null;
  onSave: () => void;
  onPrint: () => void;
  snapshots: DiagnosisSnapshot[];
  onLoadSnapshot: (id: string) => void;
  d1Answered: number;
  d1Total: number;
  d5Answered: number;
  d5Total: number;
}

const STATUS_COLOR: Record<string, string> = {
  정상: "bg-emerald-100 text-emerald-700",
  주의: "bg-amber-100 text-amber-700",
  취약: "bg-red-100 text-red-700",
};

export default function ReportTab({
  report,
  onGenerate,
  isGenerating,
  error,
  onSave,
  onPrint,
  snapshots,
  onLoadSnapshot,
  d1Answered,
  d1Total,
  d5Answered,
  d5Total,
}: Props) {
  return (
    <div className="flex flex-col gap-5 print-area">
      <div className="no-print flex flex-wrap items-center gap-2">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:bg-slate-300"
        >
          {isGenerating ? "진단 생성 중... (최대 15초)" : "진단 리포트 생성"}
        </button>
        {report && (
          <>
            <button onClick={onPrint} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              🖨 인쇄/PDF로 저장
            </button>
            <button onClick={onSave} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              💾 이 진단 저장
            </button>
          </>
        )}
      </div>

      {error && <div className="no-print rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">⚠ {error}</div>}

      {(d1Answered < d1Total || d5Answered < d5Total) && (
        <div className="no-print rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          {d1Answered < d1Total && `D1 노출 테스트 ${d1Total}건 중 ${d1Answered}건만 확인됨. `}
          {d5Answered < d5Total && `D5 전환 동선 ${d5Total}단계 중 ${d5Answered}단계만 확인됨. `}
          미입력 항목은 리포트에서 &quot;미입력 — 진단 제외&quot;로 표시됩니다.
        </div>
      )}

      {!report ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
          D1~D5 입력을 마친 뒤 &quot;진단 리포트 생성&quot;을 누르면 종합 판정표·차트·개선과제가 여기에 표시됩니다.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 print-break-avoid">
            이 진단은 참고용이며, 중요한 의사결정 전에는 실제 데이터를 재확인하십시오.
          </div>

          <section className="print-break-avoid">
            <h3 className="mb-2 text-base font-bold text-slate-800">종합 진단</h3>
            <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
              {report.overallVerdict}
            </p>
          </section>

          <section className="print-break-avoid">
            <h3 className="mb-2 text-base font-bold text-slate-800">진단 판정표</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2">항목</th>
                    <th className="px-3 py-2">판정 근거</th>
                    <th className="px-3 py-2">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {report.verdictTable.map((row, i) => (
                    <tr key={i} className="border-t border-slate-100 align-top">
                      <td className="whitespace-nowrap px-3 py-2 font-medium">{row.item}</td>
                      <td className="px-3 py-2 text-slate-600">{row.result}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[row.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <ReportCharts report={report} />

          <section className="print-break-avoid">
            <h3 className="mb-2 text-base font-bold text-slate-800">우선순위 개선과제</h3>
            <ol className="flex flex-col gap-2">
              {report.priorityActions.map((a, i) => (
                <li key={i} className="flex gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm">
                  <span className="font-bold text-sky-700">{i + 1}.</span>
                  <span>{a}</span>
                </li>
              ))}
            </ol>
          </section>

          {report.safetyFlagsFound.length > 0 && (
            <section className="print-break-avoid">
              <h3 className="mb-2 text-base font-bold text-red-700">발행 콘텐츠 위험 표현 (즉시 수정 권장)</h3>
              <ul className="flex flex-col gap-2">
                {report.safetyFlagsFound.map((f, i) => (
                  <li key={i} className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
                    <p className="font-semibold text-red-700">[{f.postTitle}]</p>
                    <p className="text-red-600">원문: {f.phrase}</p>
                    <p className="text-red-600">대체: {f.suggestion}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="print-break-avoid">
            <h3 className="mb-2 text-base font-bold text-slate-800">다음 확인 질문</h3>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-slate-700">
              {report.followUpQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {snapshots.length > 0 && (
        <section className="no-print">
          <h3 className="mb-2 text-base font-bold text-slate-800">📜 지난 진단 이력</h3>
          <ul className="flex flex-col gap-1">
            {snapshots.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => onLoadSnapshot(s.id)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-600 hover:bg-sky-50"
                >
                  {new Date(s.createdAt).toLocaleString("ko-KR")} · 게시물 {s.d3.length}건 · 개선과제 {s.report.priorityActions.length}개
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
