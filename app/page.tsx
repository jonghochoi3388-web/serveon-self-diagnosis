"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import InfoBanner from "@/components/InfoBanner";
import TabNav, { TabKey } from "@/components/TabNav";
import D1ExposureTab from "@/components/tabs/D1ExposureTab";
import D2KeywordTab from "@/components/tabs/D2KeywordTab";
import D3ContentAuditTab from "@/components/tabs/D3ContentAuditTab";
import D4ChannelTab from "@/components/tabs/D4ChannelTab";
import D5FunnelTab from "@/components/tabs/D5FunnelTab";
import ReportTab from "@/components/ReportTab";
import {
  DEFAULT_D2_KEYWORDS,
  DEFAULT_D4_CHANNELS,
  DEFAULT_D5_STEPS,
} from "@/lib/constants";
import {
  AuditedPost,
  D1ExposureResult,
  D2KeywordEntry,
  D4ChannelEntry,
  D5FunnelStep,
  DiagnosisReport,
  DiagnosisSnapshot,
} from "@/lib/types";
import { loadSnapshots, saveSnapshot } from "@/lib/storage";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("D3");

  const [rssUrl, setRssUrl] = useState("");
  const [posts, setPosts] = useState<AuditedPost[]>([]);
  const [auditDone, setAuditDone] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [d1, setD1] = useState<D1ExposureResult[]>([]);
  const [d2, setD2] = useState<D2KeywordEntry[]>(DEFAULT_D2_KEYWORDS);
  const [d4, setD4] = useState<D4ChannelEntry[]>(DEFAULT_D4_CHANNELS);
  const [d5, setD5] = useState<D5FunnelStep[]>(DEFAULT_D5_STEPS);

  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const [snapshots, setSnapshots] = useState<DiagnosisSnapshot[]>([]);
  const [isSampleLoading, setIsSampleLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSnapshots(loadSnapshots());
  }, []);

  const handleFetchRss = async () => {
    setIsFetching(true);
    setFetchError(null);
    setAuditDone(false);
    try {
      const res = await fetch("/api/fetch-rss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rssUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "RSS 수집에 실패했습니다.");
      setPosts(
        (data.posts as { title: string; pubDate: string; excerpt: string }[]).map((p) => ({
          ...p,
          titleFormat: "기타",
          purposeTag: "노출",
          category: "서비스_이용_안내",
          hasCTA: false,
          ctaKeywordsFound: [],
          safetyFlags: [],
        }))
      );
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/audit-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: posts.map((p) => ({ title: p.title, pubDate: p.pubDate, excerpt: p.excerpt })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "콘텐츠 감사에 실패했습니다.");
      setPosts(data.auditedPosts as AuditedPost[]);
      setAuditDone(true);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReportError(null);
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ d1, d2, d3: posts, d4, d5 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "리포트 생성에 실패했습니다.");
      setReport(data as DiagnosisReport);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSnapshot = () => {
    if (!report) return;
    const snapshot: DiagnosisSnapshot = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      d1,
      d2,
      d3: posts,
      d4,
      d5,
      report,
    };
    setSnapshots(saveSnapshot(snapshot));
  };

  const handleLoadSnapshot = (id: string) => {
    const snap = snapshots.find((s) => s.id === id);
    if (!snap) return;
    setD1(snap.d1);
    setD2(snap.d2);
    setPosts(snap.d3);
    setAuditDone(true);
    setD4(snap.d4);
    setD5(snap.d5);
    setReport(snap.report);
    setActiveTab("REPORT");
  };

  const handleLoadSample = async () => {
    setIsSampleLoading(true);
    try {
      const res = await fetch("/diagnosis_sample.json");
      const data = await res.json();
      const snap = data.snapshot as DiagnosisSnapshot;
      setD1(snap.d1);
      setD2(snap.d2);
      setPosts(snap.d3);
      setAuditDone(true);
      setD4(snap.d4);
      setD5(snap.d5);
      setReport(snap.report);
      setRssUrl("https://rss.blog.naver.com/serveon0818.xml");
      setSnapshots(saveSnapshot({ ...snap, id: crypto.randomUUID(), createdAt: new Date().toISOString() }));
      setActiveTab("REPORT");
    } catch {
      setFetchError("샘플 데이터를 불러오지 못했습니다.");
    } finally {
      setIsSampleLoading(false);
    }
  };

  const d1Answered = d1.filter((r) => r.titleFoundInSearch !== null || r.keywordTopPageFound !== null).length;
  const d5Answered = d5.filter((s) => s.passed !== null).length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header onLoadSample={handleLoadSample} isSampleLoading={isSampleLoading} />
      <InfoBanner />
      <TabNav active={activeTab} onChange={setActiveTab} />

      <main className="mx-auto w-full max-w-6xl flex-1 p-6">
        {activeTab === "D1" && (
          <D1ExposureTab results={d1} onChange={setD1} auditedTitles={posts.map((p) => p.title)} />
        )}
        {activeTab === "D2" && <D2KeywordTab entries={d2} onChange={setD2} />}
        {activeTab === "D3" && (
          <D3ContentAuditTab
            rssUrl={rssUrl}
            onRssUrlChange={setRssUrl}
            onFetchRss={handleFetchRss}
            onAudit={handleAudit}
            posts={posts}
            isFetching={isFetching}
            isAuditing={isAuditing}
            fetchError={fetchError}
            auditDone={auditDone}
          />
        )}
        {activeTab === "D4" && <D4ChannelTab entries={d4} onChange={setD4} />}
        {activeTab === "D5" && <D5FunnelTab steps={d5} onChange={setD5} />}
        {activeTab === "REPORT" && (
          <ReportTab
            report={report}
            onGenerate={handleGenerateReport}
            isGenerating={isGenerating}
            error={reportError}
            onSave={handleSaveSnapshot}
            onPrint={() => window.print()}
            snapshots={snapshots}
            onLoadSnapshot={handleLoadSnapshot}
            d1Answered={d1Answered}
            d1Total={d1.length}
            d5Answered={d5Answered}
            d5Total={d5.length}
          />
        )}
      </main>
    </div>
  );
}
