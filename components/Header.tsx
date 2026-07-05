"use client";

interface HeaderProps {
  onLoadSample: () => void;
  isSampleLoading?: boolean;
}

export default function Header({ onLoadSample, isSampleLoading }: HeaderProps) {
  return (
    <header className="no-print flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4">
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-sky-900 sm:text-xl">더서브온 AI 자가진단 대시보드</h1>
        <p className="hidden text-sm text-slate-500 sm:block">
          5대 진단 로직으로 온라인 노출·전환 상태를 스스로 점검하는 셀프 진단 도구
        </p>
      </div>
      <button
        onClick={onLoadSample}
        disabled={isSampleLoading}
        className="shrink-0 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 transition-colors hover:bg-sky-100 disabled:opacity-60 sm:px-4 sm:text-sm"
      >
        {isSampleLoading ? "불러오는 중..." : "샘플 진단 불러오기"}
      </button>
    </header>
  );
}
