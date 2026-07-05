// PRD 6장 데이터 모델 — DB 스키마로 그대로 옮길 수 있는 형태로 유지

export type PostPurposeTag = "노출" | "공감" | "신뢰" | "전환";
export type TitleFormat =
  | "질문형"
  | "체크리스트형"
  | "사례형"
  | "지역형"
  | "비교형"
  | "기타";
export type Category =
  | "병원동행_사례"
  | "보호자_고민_해결"
  | "검사_진료별_안내"
  | "계절성_건강_콘텐츠"
  | "서비스_이용_안내"
  | "기업복지_콘텐츠"
  | "공공_사회적가치"
  | "매니저_신뢰_콘텐츠";

export type KeywordTier = "1층_핵심전환" | "2층_상황검사" | "3층_지역B2B";
export type CompetitionLevel = "낮음" | "보통" | "높음";
export type OperationLevel = "높음" | "보통" | "낮음";
export type VerdictStatus = "정상" | "취약" | "주의";

export interface SafetyFlag {
  phrase: string;
  suggestion: string;
}

export interface AuditedPost {
  title: string;
  pubDate: string;
  excerpt: string;
  titleFormat: TitleFormat;
  purposeTag: PostPurposeTag;
  category: Category;
  hasCTA: boolean;
  ctaKeywordsFound: string[];
  safetyFlags: SafetyFlag[];
}

/** RSS 파싱 직후(감사 전) 원본 게시물 */
export interface RawPost {
  title: string;
  pubDate: string;
  excerpt: string;
}

export interface D1ExposureResult {
  checkedTitle: string;
  titleSearchUrl: string;
  keywordSearchUrl: string;
  titleFoundInSearch: boolean | null; // null = 미입력
  keywordTopPageFound: boolean | null; // null = 미입력
}

export interface D2KeywordEntry {
  keyword: string;
  tier: KeywordTier;
  monthlySearchVolume?: number;
  competitionLevel?: CompetitionLevel;
}

export interface D4ChannelEntry {
  channel: string;
  isOperating: boolean;
  lastActivityDaysAgo: number;
  targetStrength: number; // 0~10, 고정 기본값(수정 가능)
}

export interface D5FunnelStep {
  stepName: string;
  passed: boolean | null; // null = 미입력
  note?: string;
}

export interface DiagnosisReport {
  overallVerdict: string;
  verdictTable: { item: string; result: string; status: VerdictStatus }[];
  contentPurposeBalance: {
    노출: number;
    공감: number;
    신뢰: number;
    전환: number;
    unbalancedTags: string[];
  };
  priorityActions: string[];
  safetyFlagsFound: { postTitle: string; phrase: string; suggestion: string }[];
  channelQuadrant: {
    channel: string;
    targetStrength: number;
    operationLevel: OperationLevel;
    priority: boolean;
  }[];
  followUpQuestions: string[];
}

export interface DiagnosisSnapshot {
  id: string;
  createdAt: string;
  d1: D1ExposureResult[];
  d2: D2KeywordEntry[];
  d3: AuditedPost[];
  d4: D4ChannelEntry[];
  d5: D5FunnelStep[];
  report: DiagnosisReport;
}
