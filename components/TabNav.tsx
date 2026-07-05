"use client";

export const TAB_KEYS = ["D1", "D2", "D3", "D4", "D5", "REPORT"] as const;
export type TabKey = (typeof TAB_KEYS)[number];

const TAB_LABELS: Record<TabKey, string> = {
  D1: "D1 노출",
  D2: "D2 키워드",
  D3: "D3 콘텐츠감사",
  D4: "D4 채널",
  D5: "D5 전환동선",
  REPORT: "📊 리포트",
};

interface TabNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export default function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav className="no-print flex flex-wrap gap-1 border-b border-slate-200 bg-white px-4">
      {TAB_KEYS.map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            active === key
              ? "border-b-2 border-sky-700 text-sky-800"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {TAB_LABELS[key]}
        </button>
      ))}
    </nav>
  );
}
