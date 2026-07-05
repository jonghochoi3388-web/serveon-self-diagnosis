import { D2KeywordEntry, D4ChannelEntry, D5FunnelStep } from "./types";

/**
 * PRD 8장 진단 판정 기준 수치 — 컨설팅팀이 실제 사전진단에 사용한 논리.
 * 절대 임의로 바꾸지 말 것. 조정이 필요하면 이 상수만 수정하면 프롬프트 전체를 건드리지 않아도 됩니다.
 */
export const DIAGNOSIS_THRESHOLDS = {
  // D1 노출: 제목 검색 노출 비율 70% 이상 → 색인 정상
  TITLE_INDEXED_RATIO: 0.7,
  // D3 콘텐츠: 최근 1개월 발행 3건 이상 → 발행량 문제 아님
  RECENT_MONTH_MIN_POSTS: 3,
  // D3 콘텐츠: CTA 포함 비율 50% 미만 → 전환 유도 부족
  CTA_MIN_RATIO: 0.5,
  // D3 콘텐츠: 권장 목적 배분과 10%p 이상 차이 → 불균형
  PURPOSE_BALANCE_TOLERANCE: 0.1,
  // D4 채널: 최근 활동 30일 이내 → "높음", 90일 이내 → "보통", 그 외 → "낮음"
  CHANNEL_ACTIVE_DAYS_HIGH: 30,
  CHANNEL_ACTIVE_DAYS_MID: 90,
  // D4 채널: targetStrength 7 이상 & 운영 낮음 → 최우선 보강 대상
  CHANNEL_PRIORITY_STRENGTH: 7,
} as const;

/** 권장 콘텐츠 목적 배분 (노출40/공감25/신뢰25/전환10) */
export const RECOMMENDED_PURPOSE_BALANCE = {
  노출: 0.4,
  공감: 0.25,
  신뢰: 0.25,
  전환: 0.1,
} as const;

/** CTA 키워드 탐지 대상 (PRD 8.1) */
export const CTA_KEYWORDS = ["문의", "전화", "카카오", "상담", "신청"] as const;

/** D2 키워드 3층 전략 기본표 (편집 가능) */
export const DEFAULT_D2_KEYWORDS: D2KeywordEntry[] = [
  { keyword: "병원동행 서비스", tier: "1층_핵심전환" },
  { keyword: "병원동행 비용", tier: "1층_핵심전환" },
  { keyword: "수면내시경 보호자", tier: "2층_상황검사" },
  { keyword: "치매검사 동행", tier: "2층_상황검사" },
  { keyword: "항암 병원동행", tier: "2층_상황검사" },
  { keyword: "서초 병원동행", tier: "3층_지역B2B" },
  { keyword: "임직원 부모돌봄 복지", tier: "3층_지역B2B" },
];

/** D4 채널 기본표 — targetStrength는 고정 기본값(수정 가능) */
export const DEFAULT_D4_CHANNELS: D4ChannelEntry[] = [
  { channel: "네이버 블로그", isOperating: true, lastActivityDaysAgo: 0, targetStrength: 9 },
  { channel: "네이버 플레이스", isOperating: false, lastActivityDaysAgo: 999, targetStrength: 9 },
  { channel: "카카오 채널", isOperating: true, lastActivityDaysAgo: 0, targetStrength: 8.5 },
  { channel: "당근 비즈프로필", isOperating: true, lastActivityDaysAgo: 0, targetStrength: 7 },
  { channel: "네이버 카페/지식iN", isOperating: false, lastActivityDaysAgo: 999, targetStrength: 7.5 },
  { channel: "유튜브", isOperating: true, lastActivityDaysAgo: 0, targetStrength: 6 },
  { channel: "인스타그램", isOperating: true, lastActivityDaysAgo: 0, targetStrength: 3.5 },
  { channel: "페이스북", isOperating: true, lastActivityDaysAgo: 0, targetStrength: 3 },
];

/** D5 전환 동선 기본 단계 (편집 가능) */
export const DEFAULT_D5_STEPS: D5FunnelStep[] = [
  { stepName: "블로그 글에서 CTA 확인", passed: null },
  { stepName: "홈페이지 서비스 목록 → 동행 신청하기 클릭", passed: null },
  { stepName: "시간/가격 선택 모달 진입", passed: null },
  { stepName: "비로그인 상태로 신청 진행", passed: null },
];

/** 네이버 모바일 검색 URL 생성 (D1 반자동) */
export function buildNaverSearchUrl(query: string): string {
  return `https://m.search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
}
