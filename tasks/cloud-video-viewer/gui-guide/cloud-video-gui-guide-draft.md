# 클라우드영상시스템 웹뷰어 — GUI 가이드 초안

> **문서 유형:** Draft  
> **작성일:** 2026-05-21  
> **참조 DS:** S1_AI_DESIGN_GUIDE (SW Design System V2.4)  
> **원칙:** DS에 있는 것만 명시한다. 없는 것은 gap으로 표기하고 임시 대응 방법만 제시한다.  
> **상태 표기:** `stable` · `candidate` · `gap` · `service-specific`

---

## 0. 공통 원칙

### 테마
- 다크모드 우선 설계. 영상 모니터링 환경(어두운 실내·야간)을 기본 맥락으로 삼는다.
- 라이트/다크 모두 지원. DS `data-theme` 속성 기반 토큰 자동 전환.

### 색상 사용 규칙
- **Semantic 토큰 우선.** `--color-bg-default`, `--color-text-primary` 등 semantic을 먼저 쓴다.
- Foundation 팔레트(gray-XXX, blue-XXX 등) 직접 참조는 semantic 토큰이 없는 gap 영역에서만 허용한다.
- hex 값 직접 사용 금지.

### 타이포그래피
- DS 폰트 스케일(10 / 12 / 14 / 16 / 18 / 20 / 24 / 32px) + 웨이트(regular 400 / medium 500 / bold 700) + line-height 130% 기준.
- 영상 오버레이 텍스트는 `--color-text-inverse` (다크모드에서 흰색 계열).

---

## 1. 전체 레이아웃

### 1-1. 셸 구조

```
┌────────────────────────────────────────────┐
│  Topbar (GNB)                              │  height: [gap — --topbar-height 토큰 없음]
├────────┬───────────────────────────────────┤
│        │                                   │
│ Side-  │  Main Content Area                │
│ bar    │                                   │
│        │                                   │
└────────┴───────────────────────────────────┘
```

| 영역 | 토큰 | 상태 |
|------|------|------|
| Topbar 배경 | `--color-surface-default` | `stable` |
| Topbar 하단 구분선 | `--color-border-subtle` / `--border-width-default` | `stable` |
| Topbar 높이 | 임시: 56px | `gap` — `--topbar-height` 토큰 없음 |
| Sidebar 배경 | `--color-surface-default` | `stable` |
| Sidebar 우측 구분선 | `--color-border-subtle` | `stable` |
| Sidebar 너비 | 임시: 240px | `gap` — `--sidebar-width-default` 토큰 없음 |
| Main Content 배경 | `--color-bg-default` | `stable` |

---

## 2. 로그인 화면

### 2-1. 레이아웃

- 2단 구성: 좌측 Hero 이미지 영역 + 우측 로그인 폼 카드
- Hero 이미지 영역: `service-specific` — DS 적용 불가 (이미지 에셋)

### 2-2. 로그인 카드

| 요소 | 토큰 / 컴포넌트 | 상태 |
|------|----------------|------|
| 카드 배경 | `--color-surface-default` | `stable` |
| 카드 테두리 | `--color-border-subtle` / `--border-width-default` | `stable` |
| 카드 모서리 | `--radius-card-md` (10px) | `stable` |
| 카드 내부 여백 | `--spacing-section-md` | `stable` |
| 이메일 입력 | Input 컴포넌트 | `stable` |
| 비밀번호 입력 | Input 컴포넌트 (type=password) | `stable` |
| 로그인 버튼 | Button / variant=primary, size=lg | `stable` |
| 에러 메시지 | `--color-text-danger` / font-size-14 | `stable` |
| 헬퍼 텍스트 | `--color-text-helper` / font-size-12 | `stable` |
| 로고 | `--color-brand-ci` 참조 가능. 로고 에셋 별도 | `candidate` |
| 페이지 배경 | `--color-bg-default` | `stable` |

---

## 3. 모니터링 화면 (카메라 그리드)

### 3-1. 사이드바 내비게이션

| 요소 | 토큰 / 컴포넌트 | 상태 |
|------|----------------|------|
| 내비게이션 아이템 텍스트 (기본) | `--color-text-tertiary` | `stable` |
| 내비게이션 아이콘 (기본) | `--color-icon-default` | `stable` |
| 내비게이션 아이템 텍스트 (활성) | `--color-action-primary-default` | `stable` |
| 내비게이션 활성 배경 | `--color-bg-selected` (blue-50) | `candidate` — Figma 검증 필요 |
| 내비게이션 아이템 내부 여백 | `--spacing-padding-block-sm` / `--spacing-padding-inline-md` | `stable` |
| 내비게이션 아이템 간격 | `--spacing-stack-xs` | `stable` |
| 사이트 선택 Dropdown | Select 컴포넌트 | `stable` |

### 3-2. 카메라 그리드 영역

| 요소 | 토큰 / 컴포넌트 | 상태 |
|------|----------------|------|
| 그리드 레이아웃 (2×2, 4×4 등) | — | `gap` — `service-specific` 설계 필요 |
| 그리드 간격 | 임시: 4px | `gap` — `--camera-grid-gap` 토큰 없음 |
| 카메라 셀 영상 배경 | 임시: gray-dark-0 (#000) | `gap` — `--color-video-bg` 토큰 없음 |
| 카메라 셀 테두리 | `--color-border-default` / `--border-width-default` | `stable` |
| 카메라 셀 선택 상태 테두리 | `--color-border-focus` / `--border-width-strong` | `candidate` |
| 카메라 셀 모서리 | `--radius-card-md` (10px) | `stable` |
| 카메라 이름 오버레이 텍스트 | `--color-text-inverse` / font-size-12 / font-weight-medium | `stable` |
| 영상 오버레이 배경 | `--color-overlay` | `stable` |
| Live 배지 | — | `gap` / `service-specific` — 전용 디자인 필요 |
| 카메라 없음 / 연결 안됨 상태 | — | `gap` — EmptyState 컴포넌트 없음 |
| 레이아웃 전환 버튼 (2×2 / 4×4) | Radio 컴포넌트 (아이콘 버전) 또는 Button | `candidate` — UX 결정 후 확정 |

---

## 4. 알림 / 이벤트 화면

| 요소 | 토큰 / 컴포넌트 | 상태 |
|------|----------------|------|
| 페이지 배경 | `--color-bg-default` | `stable` |
| 페이지 제목 | `--color-text-primary` / font-size-20 / font-weight-bold | `stable` |
| 이벤트 목록 테이블 | Table 컴포넌트 | `stable` |
| 테이블 페이지네이션 | Pagination 컴포넌트 | `stable` |
| 이벤트 분류 필터 Chip | Chip 컴포넌트 | `candidate` — 다크모드 검증 후 확정 |
| 날짜 필터 | Date Picker 컴포넌트 | `candidate` — HD 결정 필요 |
| 심각도 배지 — 위험 | `--color-status-error` | `stable` |
| 심각도 배지 — 경고 | `--color-status-warning` | `stable` |
| 심각도 배지 — 정보 | `--color-status-info` | `stable` |
| AI 이벤트 태그 색상 | 임시: status-* 계열 매핑 | `gap` — AI 이벤트별 전용 색상 토큰 없음 |
| 이벤트 확인/미확인 상태 | Checkbox 또는 Toggle | `stable` |
| 출동 요청 버튼 | Button / variant=primary | `stable` |
| 이벤트 썸네일 | — | `service-specific` — 영상 스냅샷 |

---

## 5. AI 영상 검색 화면

| 요소 | 토큰 / 컴포넌트 | 상태 |
|------|----------------|------|
| 페이지 배경 | `--color-bg-default` | `stable` |
| 문장 검색 입력창 | Input 컴포넌트 (size=lg, 확장) | `stable` |
| 검색 힌트 텍스트 | `--color-text-placeholder` | `stable` |
| 카메라 필터 | Select 컴포넌트 | `stable` |
| 기간 필터 | Date Picker 컴포넌트 | `candidate` |
| 검색 실행 버튼 | Button / variant=primary | `stable` |
| 검색 결과 영상 카드 | — | `service-specific` — 썸네일 + 타임스탬프 전용 |
| 영상 구간 하이라이팅 | — | `service-specific` |
| 결과 없음 (Empty State) | — | `gap` — EmptyState 컴포넌트 없음 |

---

## 6. 카메라 설정 화면

### 6-1. 탭 내비게이션

| 요소 | 토큰 / 컴포넌트 | 상태 |
|------|----------------|------|
| 탭 컴포넌트 (기본정보 / AI설정 / 알림설정) | — | `gap` — Tab 컴포넌트 없음 |
| 임시 탭 대안 | Button (active/default 상태 조합) 또는 Radio | `candidate` |
| 활성 탭 텍스트 | `--color-action-primary-default` / font-weight-bold | `stable` |
| 탭 하단 인디케이터 | `--color-action-primary-default` / `--border-width-strong` | `stable` |

### 6-2. 설정 폼

| 요소 | 토큰 / 컴포넌트 | 상태 |
|------|----------------|------|
| 폼 레이아웃 배경 | `--color-bg-default` | `stable` |
| 섹션 카드 배경 | `--color-surface-default` | `stable` |
| 섹션 카드 모서리 | `--radius-card-md` | `stable` |
| 텍스트 입력 | Input 컴포넌트 | `stable` |
| Select 입력 | Select 컴포넌트 | `stable` |
| AI 알고리즘 ON/OFF | Toggle 컴포넌트 | `stable` |
| 카메라 온라인 상태 | `--color-status-success` | `stable` |
| 카메라 오프라인 상태 | `--color-status-error` | `stable` |
| 저장 버튼 | Button / variant=primary | `stable` |
| 취소 버튼 | Button / variant=secondary | `stable` |
| 구독 옵션 표시 | — | `gap` — 구독 티어 UI 패턴 없음 |
| 섹션 제목 | `--color-text-primary` / font-size-16 / font-weight-bold | `stable` |
| 레이블 | `--color-text-secondary` / font-size-14 | `stable` |

---

## 7. 대시보드 / 현황 화면

| 요소 | 토큰 / 컴포넌트 | 상태 |
|------|----------------|------|
| 페이지 배경 | `--color-bg-home` (#F5F6FB) | `candidate` — Figma 검증 필요 |
| 집계 수치 카드 배경 | `--color-surface-default` | `stable` |
| 집계 카드 모서리 | `--radius-card-md` | `stable` |
| 집계 카드 그림자 | DS 미정의 | `gap` — shadow/elevation 토큰 없음 |
| 카드 내 주요 숫자 | font-size-32 / font-weight-bold / `--color-text-primary` | `stable` |
| 카드 내 설명 텍스트 | font-size-14 / `--color-text-secondary` | `stable` |
| 정상 상태 | `--color-status-success` | `stable` |
| 오류 상태 | `--color-status-error` | `stable` |
| 최근 이벤트 리스트 | Table 컴포넌트 | `stable` |
| 차트 / 그래프 | — | `do-not-map-yet` — 라이브러리 미결정 |

---

## 8. 사이트 관리 화면

| 요소 | 토큰 / 컴포넌트 | 상태 |
|------|----------------|------|
| 사이트 카드 배경 | `--color-surface-default` | `stable` |
| 사이트 카드 모서리 | `--radius-card-md` | `stable` |
| 카드 내 건물 이미지 | — | `service-specific` |
| 카메라 수 배지 | Chip 컴포넌트 (임시) | `candidate` — 전용 Badge 없음 |
| 사이트 이름 | `--color-text-primary` / font-size-16 / font-weight-medium | `stable` |
| 사이트 상태 — 정상 | `--color-status-success` | `stable` |
| 사이트 상태 — 오류 | `--color-status-error` | `stable` |
| 사이트 추가 버튼 | Button / variant=primary | `stable` |
| 카드 그리드 레이아웃 | CSS grid — DS 기준 없음 | `gap` |

---

## 9. 공통 UI 요소

### 9-1. 피드백 / 상태 컴포넌트

| 컴포넌트 | 임시 대응 | 상태 |
|---------|---------|------|
| Toast / Snackbar | 서비스 전용 구현. `--color-surface-raised` + `--color-status-*` + `--radius-card-md` | `gap` |
| Modal / Dialog | 서비스 전용. `--radius-modal-md` + `--color-surface-raised` + `--color-overlay` | `gap` |
| Loading Spinner | 서비스 전용. `--color-action-primary-default` | `gap` |
| Empty State | 서비스 전용. `--color-text-tertiary` + `--color-icon-muted` | `gap` |
| Error State Page | 서비스 전용. `--color-status-error` + `--color-text-primary` | `gap` |

### 9-2. 인터랙션 토큰

| 상태 | 토큰 | 상태 |
|------|------|------|
| Focus Ring | `--color-border-focus` / `--border-width-strong` | `stable` |
| Hover (배경) | `--color-bg-subtle` | `stable` |
| Hover (텍스트) | `--color-text-primary` | `stable` |
| Pressed | `--color-action-primary-pressed` | `stable` |
| Disabled | `--color-text-caption` / opacity 0.4 | `stable` |

---

## 10. Candidate 검증 체크리스트

> 이 항목들은 DS candidate 상태이므로 Figma 시각 검증 후 최종 반영 여부를 결정한다.

- [ ] `--color-bg-home` (#F5F6FB) — 대시보드 배경. 라이트/다크 토큰 값 확인 필요.
- [ ] `--color-bg-selected` (blue-50) — 선택 내비게이션 배경. 다크모드 충분한 대비 확인 필요.
- [ ] Chip 다크모드 — 이벤트 필터 Chip 다크모드 시각 검증 필요.
- [ ] Date Picker — HD 결정 후 착수. 녹화 영상 검색에서 핵심.
- [ ] Nav(Sidebar) in-progress 상태 — 클라우드 영상 메뉴 구조 반영 가능 여부 확인 필요.
- [ ] Radio vs Button — 레이아웃 전환 (2×2/4×4) UX 패턴 확정 필요.

---

*이 문서는 draft입니다. 화면 목업 구체화 후 업데이트 필요. gap 항목은 `cloud-video-ds-gap-list.md` 참조.*
