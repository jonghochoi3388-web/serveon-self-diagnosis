"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { DiagnosisReport } from "@/lib/types";
import { RECOMMENDED_PURPOSE_BALANCE } from "@/lib/constants";
import ChartBox from "./ChartBox";

const PURPOSE_COLORS: Record<string, string> = {
  노출: "#0ea5e9",
  공감: "#14b8a6",
  신뢰: "#6366f1",
  전환: "#f59e0b",
};

export default function ReportCharts({ report }: { report: DiagnosisReport }) {
  const balance = report.contentPurposeBalance;

  const purposeData = (["노출", "공감", "신뢰", "전환"] as const).map((k) => ({
    name: k,
    실제: Math.round((balance[k] ?? 0) * 100),
    권장: Math.round((RECOMMENDED_PURPOSE_BALANCE[k] ?? 0) * 100),
    unbalanced: balance.unbalancedTags?.includes(k),
  }));

  const pieData = purposeData.filter((d) => d.실제 > 0);

  const operationScore: Record<string, number> = { 높음: 3, 보통: 2, 낮음: 1 };
  const quadrantData = report.channelQuadrant.map((c) => ({
    x: operationScore[c.operationLevel] ?? 0,
    y: c.targetStrength,
    z: c.priority ? 260 : 120,
    channel: c.channel,
    priority: c.priority,
  }));

  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 print-break-avoid">
      {/* 콘텐츠 목적 배분 파이 */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="mb-2 text-sm font-bold text-slate-700">콘텐츠 목적 배분</h4>
        <ChartBox height={240}>
          {(w, h) => (
            <PieChart width={w} height={h}>
              <Pie
                data={pieData}
                dataKey="실제"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                isAnimationActive={false}
                label={(e: { name?: string; 실제?: number }) => `${e.name} ${e.실제}%`}
              >
                {pieData.map((d) => (
                  <Cell key={d.name} fill={PURPOSE_COLORS[d.name]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          )}
        </ChartBox>
        <p className="text-center text-xs text-slate-400">권장 배분: 노출40 / 공감25 / 신뢰25 / 전환10</p>
      </div>

      {/* 실제 vs 권장 배분 막대 */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="mb-2 text-sm font-bold text-slate-700">실제 vs 권장 배분 (%)</h4>
        <ChartBox height={240}>
          {(w, h) => (
            <BarChart width={w} height={h} data={purposeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend />
              <Bar dataKey="실제" fill="#0ea5e9" isAnimationActive={false} />
              <Bar dataKey="권장" fill="#cbd5e1" isAnimationActive={false} />
            </BarChart>
          )}
        </ChartBox>
      </div>

      {/* 채널 사분면 산점도 */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="mb-2 text-sm font-bold text-slate-700">채널 사분면 (타깃 강도 × 운영 수준)</h4>
        <ChartBox height={260}>
          {(w, h) => (
            <ScatterChart width={w} height={h} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name="운영수준"
                domain={[0, 4]}
                ticks={[1, 2, 3]}
                tickFormatter={(v: number) => (({ 1: "낮음", 2: "보통", 3: "높음" } as Record<number, string>)[v] ?? "")}
                fontSize={12}
              />
              <YAxis type="number" dataKey="y" name="타깃강도" domain={[0, 10]} fontSize={12} />
              <ZAxis type="number" dataKey="z" range={[80, 300]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ payload }) => {
                  if (!payload || payload.length === 0) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rounded border border-slate-200 bg-white px-2 py-1 text-xs shadow">
                      <p className="font-semibold">{d.channel}</p>
                      <p>타깃강도 {d.y} / 운영 {["", "낮음", "보통", "높음"][d.x]}</p>
                      {d.priority && <p className="text-red-600">최우선 보강 대상</p>}
                    </div>
                  );
                }}
              />
              <Scatter data={quadrantData} isAnimationActive={false}>
                {quadrantData.map((d, i) => (
                  <Cell key={i} fill={d.priority ? "#dc2626" : "#0ea5e9"} />
                ))}
              </Scatter>
            </ScatterChart>
          )}
        </ChartBox>
        <p className="text-center text-xs text-slate-400">빨간 점 = 타깃 강도 높으나 운영 낮은 최우선 보강 대상</p>
      </div>

      {/* 채널별 운영 수준 막대 */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="mb-2 text-sm font-bold text-slate-700">채널별 운영 수준</h4>
        <ChartBox height={260}>
          {(w, h) => (
            <BarChart width={w} height={h} data={report.channelQuadrant} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 10]} fontSize={12} />
              <YAxis type="category" dataKey="channel" width={100} fontSize={11} />
              <Tooltip />
              <Bar dataKey="targetStrength" name="타깃 강도" isAnimationActive={false}>
                {report.channelQuadrant.map((c, i) => (
                  <Cell key={i} fill={c.priority ? "#dc2626" : "#38bdf8"} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ChartBox>
      </div>
    </section>
  );
}
