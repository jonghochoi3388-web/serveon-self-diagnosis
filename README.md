# 더서브온 AI 자가진단 대시보드 — Claude Code 개발 세트

이 폴더는 컨설턴트가 **Claude Code**로 자가진단 MVP 웹앱을 개발하기 위한 모든 자료입니다. 압축을 풀고 아래 순서대로 진행하면 바로 개발을 시작할 수 있습니다.

## 실행 방법 (개발 완료 후 — 여기부터 읽으세요)

앱 코드는 이미 이 폴더에 구현되어 있습니다. 아래 순서로 실행하십시오.

1. **의존성 설치** (최초 1회)
   ```
   npm install
   ```
2. **API 키 설정** — 프로젝트 루트의 `.env.local` 파일에 `ANTHROPIC_API_KEY` 값을 채웁니다.
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ANTHROPIC_MODEL=claude-sonnet-5
   ```
   - 발급처: `console.anthropic.com`(→ `platform.claude.com`) — claude.ai 구독과는 별개 계정/결제입니다.
   - `.env.local`은 `.gitignore`에 포함되어 Git에 커밋되지 않습니다.
   - 키가 없어도 RSS 수집(D3)과 헤더의 **"샘플 진단 불러오기"**는 동작합니다. 다만 콘텐츠 감사(AI 태깅)와 종합 리포트 생성은 API 키가 필요합니다.
3. **개발 서버 실행**
   ```
   npm run dev
   ```
   브라우저에서 `http://localhost:3000` 접속.
4. **프로덕션 빌드 확인**
   ```
   npm run build
   ```

### 사용 흐름 (매달 반복)

1. **D3 콘텐츠감사** 탭에서 블로그 RSS 주소(예: `https://rss.blog.naver.com/serveon0818.xml`) 입력 → **수집** → **콘텐츠 감사 실행** (AI 자동 태깅·안전 스캔, 위험 표현은 붉은색 "즉시 수정 권장")
2. **D1 노출** 탭: 제목 입력 시 네이버 검색 링크 자동 생성 → 새 탭에서 확인 후 체크 (미확인 항목은 진단 제외)
3. **D2 키워드 / D4 채널 / D5 전환동선** 탭: 체크리스트 입력 (기본표 제공)
4. **📊 리포트** 탭 → **진단 리포트 생성** → 종합 판정표·차트·우선순위 개선과제·확인 질문 자동 생성
5. **🖨 인쇄/PDF로 저장** (Ctrl+P), **💾 이 진단 저장**(이력), 다음 달 진단과 비교

### 데모/온보딩

헤더의 **샘플 진단 불러오기**를 누르면 API 호출 없이 실제 사전진단 데이터로 D1~D5와 리포트가 즉시 채워집니다.

### Vercel 배포

Vercel 대시보드에서 이 폴더를 새 프로젝트로 연결하고 Environment Variables에 `ANTHROPIC_API_KEY`·`ANTHROPIC_MODEL`을 등록하면 배포됩니다. (외부 계정 작업이므로 컨설턴트가 직접 실행하십시오.)

### 판정 기준 수정

진단 판정 기준 수치(70%, 50%, 10%p, 30/90일 등)는 `lib/constants.ts`의 `DIAGNOSIS_THRESHOLDS`에, AI 프롬프트는 `lib/prompts/audit.ts`·`lib/prompts/report.ts`에 분리되어 있습니다. 기준을 바꿔야 하면 이 파일만 수정하십시오.

---

## 이 앱은 무엇인가

컨설팅팀이 사람이 직접 수행했던 5대 진단(노출 테스트, 키워드·경쟁, 콘텐츠 감사, 채널 정합성, 전환 동선)을, 더서브온 담당자가 **컨설팅 종료 후에도 스스로, 반복적으로** 실행할 수 있게 자동화한 도구입니다. "더서브온 AI 콘텐츠 팩토리"(콘텐츠 생성 도구)와는 별개의 자매 제품입니다.

## 폴더 구성

```
.
├── README.md                    (지금 보고 계신 파일)
├── CLAUDE.md                    (Claude Code가 자동으로 읽는 지침)
├── PRD.md                       (제품 요구사항 명세서)
└── demo-assets/
    ├── diagnosis_sample.json    (실제 사전진단 실측 데이터 + 진단 결과 예시, F12용)
    └── 사용가이드.md              (연동 방법 및 활용 시나리오)
```

## 사전 준비물

1. **Node.js 18 이상**: `node -v`
2. **Claude Code**: `claude --version`
3. **Anthropic API 키** — claude.ai 구독과는 별개의 계정/결제
   - `console.anthropic.com` → 개발자 계정 생성 → Billing에 결제수단 등록 → 소액 충전
   - API Keys 메뉴에서 키 생성(`sk-ant-...`), 안전하게 보관

## 개발 시작 방법

1. 폴더 압축 해제 후 이동: `cd 더서브온-자가진단대시보드-ClaudeCode`
2. `claude` 실행
3. 첫 프롬프트 (그대로 복사 가능):
   ```
   CLAUDE.md와 PRD.md를 전체 다 읽고, PRD.md 12장의 마일스톤(M1~M9) 순서대로
   더서브온 AI 자가진단 대시보드 MVP를 개발해줘. Plan 모드로 먼저 계획을 세우고
   TodoWrite로 마일스톤을 등록한 뒤 진행해줘. 8장의 진단 판정 기준 수치는
   절대 임의로 바꾸지 마.
   ```
4. 프로젝트 스캐폴딩 후: `demo-assets/diagnosis_sample.json`을 `public/diagnosis_sample.json`으로 복사하도록 요청
5. `.env.local` 작성:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ANTHROPIC_MODEL=claude-sonnet-5
   ```

## 개발 중 확인 포인트

- RSS 주소로 실제 더서브온 블로그(`rss.blog.naver.com/serveon0818.xml` 등)를 넣어 콘텐츠 감사가 정상 동작하는지 확인
- `demo-assets/diagnosis_sample.json`의 위험 표현 사례가 안전 스캔에서 실제로 잡히는지 확인
- 리포트 탭을 브라우저 인쇄(Ctrl+P)로 열어 레이아웃이 깨지지 않는지 확인

## 문제가 생기면 (참조 위치)

| 궁금한 것 | 참조할 곳 |
|---|---|
| 어떤 기능이 있어야 하는지 | `PRD.md` 4장 |
| 진단 판정 기준 로직 | `PRD.md` 8장 (임의 변경 금지) |
| 왜 검색 순위를 자동 수집하지 않는지 | `PRD.md` 11장 |
| 데모/온보딩 활용법 | `demo-assets/사용가이드.md` |
| 향후 확장 계획 | `PRD.md` 15장 |

## 이 세트와 Codex 세트의 관계

동일한 PRD 기능 요구사항을 컨설턴트 2명이 각각 개발한 뒤 더 나은 결과물을 선택할 예정입니다. 두 세트는 기능 요구사항이 완전히 동일하므로 임의로 기능을 추가/축소하지 마십시오.
