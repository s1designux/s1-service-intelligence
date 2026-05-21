# 클라우드영상시스템 웹뷰어 — DS 후보 매핑표

> **문서 유형:** Draft  
> **작성일:** 2026-05-21  
> **분류 기준:** applicable · candidate · gap · service-specific · do-not-map-yet

---

## 범례

| 상태 | 의미 |
|------|------|
| `applicable` | DS 기준으로 바로 적용 가능 |
| `candidate` | 적용 가능하지만 검증/결정 필요 |
| `gap` | 필요하지만 DS에 기준 없음 |
| `service-specific` | 클라우드 영상 웹뷰어 전용. DS로 올리지 않음 |
| `do-not-map-yet` | 정보 부족. 지금 연결하면 안 됨 |

---

## 화면별 요소 매핑표

### 1. 로그인 화면

| 화면 요소 | DS 대응 | 상태 | 비고 |
|----------|---------|------|------|
| 페이지 배경 | `--color-bg-default` | `applicable` | |
| 로그인 카드 표면 | `--color-surface-default` | `applicable` | |
| 카드 테두리 | `--color-border-subtle` / `--border-width-default` | `applicable` | |
| 카드 모서리 | `--radius-card-md` (10px) | `applicable` | |
| 이메일·비밀번호 입력 | Input 컴포넌트 | `applicable` | |
| 로그인 버튼 | Button / primary | `applicable` | |
| 에러 메시지 | `--color-text-danger` | `applicable` | |
| 헬퍼 텍스트 | `--color-text-helper` | `applicable` | |
| 브랜드 로고 영역 | `--color-brand-ci` 참조 가능하나 로고 에셋 필요 | `candidate` | 로고 에셋 별도 관리 |
| 히어로 이미지 영역 | — | `service-specific` | DS 토큰 적용 불가 (이미지 에셋) |

---

### 2. 모니터링 화면 (메인 — 카메라 그리드)

| 화면 요소 | DS 대응 | 상태 | 비고 |
|----------|---------|------|------|
| 전체 배경 | `--color-bg-default` | `applicable` | 다크모드 우선 |
| 사이드바 배경 | `--color-surface-default` | `applicable` | |
| 사이드바 테두리 | `--color-border-subtle` | `applicable` | |
| 내비게이션 아이템 (기본) | `--color-text-tertiary` + `--color-icon-default` | `applicable` | |
| 내비게이션 아이템 (활성) | `--color-action-primary-default` + `--color-bg-selected` | `candidate` | bg/selected 검증 필요 |
| 카메라 그리드 레이아웃 (2×2·4×4 등) | — | `gap` | DS에 그리드 기준 없음 |
| 카메라 셀 — 표면 | `--color-gray-dark-0` 또는 `#000` | `gap` | 영상 배경 전용 토큰 없음 |
| 카메라 셀 — 테두리 | `--color-border-default` | `applicable` | |
| 카메라 셀 — 선택 상태 테두리 | `--color-border-focus` | `candidate` | 선택 강조 의미로 활용 가능 |
| 카메라 이름 오버레이 텍스트 | `--color-text-inverse` | `applicable` | 영상 위 흰색 텍스트 |
| 영상 오버레이 배경 | `--color-overlay` (rgba) | `applicable` | 영상 아래 그라디언트 overlay |
| Live 배지 | — | `service-specific` | DS에 Live 상태 표시 없음 |
| 카메라 없음 / 연결 안됨 상태 | — | `gap` | Empty/Error 영상 상태 UI 기준 없음 |
| 레이아웃 전환 버튼 (2×2 / 4×4) | Button 또는 Radio | `candidate` | Radio/Button 중 UX 결정 필요 |
| 사이트 선택 Dropdown | Select 컴포넌트 | `applicable` | |

---

### 3. 알림 / 이벤트 화면

| 화면 요소 | DS 대응 | 상태 | 비고 |
|----------|---------|------|------|
| 페이지 배경 | `--color-bg-default` | `applicable` | |
| 이벤트 목록 테이블 | Table 컴포넌트 | `applicable` | |
| 테이블 페이지네이션 | Pagination 컴포넌트 | `applicable` | |
| 이벤트 분류 필터 (Chip) | Chip 컴포넌트 | `candidate` | 다크모드 미검증 |
| 날짜 필터 | Date Picker | `candidate` | 착수 전 HD 결정 필요 |
| AI 이벤트 태그 (침입·화재·배회·라인크로스·피플카운트) | Chip 또는 — | `gap` | AI 이벤트별 색상 기준 없음 |
| 심각도 배지 (위험·경고·정보) | `--color-status-error/warning/info` | `applicable` | |
| 이벤트 썸네일 이미지 | — | `service-specific` | 영상 스냅샷, DS 적용 불가 |
| 이벤트 확인/미확인 상태 | Toggle 또는 Checkbox | `applicable` | |
| 출동 요청 버튼 | Button / primary | `applicable` | |

---

### 4. AI 영상 검색 화면

| 화면 요소 | DS 대응 | 상태 | 비고 |
|----------|---------|------|------|
| 문장 검색 입력창 | Input 컴포넌트 | `applicable` | 크기·스타일 기준은 Input 따름 |
| 문장 검색 힌트 텍스트 | `--color-text-placeholder` | `applicable` | |
| 검색 결과 — 영상 카드 | — | `service-specific` | 영상 썸네일 + 타임스탬프 카드 |
| 검색 결과 — 하이라이팅 | — | `service-specific` | 영상 구간 강조 방식 별도 정의 |
| 카메라 / 기간 필터 | Select + Date Picker | `applicable` / `candidate` | |
| 결과 없음 (Empty State) | — | `gap` | DS에 Empty State 컴포넌트 없음 |

---

### 5. 카메라 설정 화면

| 화면 요소 | DS 대응 | 상태 | 비고 |
|----------|---------|------|------|
| 설정 폼 레이아웃 | Input + Select + Toggle | `applicable` | |
| 저장 / 취소 버튼 | Button | `applicable` | |
| 탭 (기본정보 / AI설정 / 알림설정) | Nav 또는 — | `candidate` | Tab 패턴 DS에 별도 정의 없음 |
| AI 알고리즘 옵션 ON/OFF | Toggle 컴포넌트 | `applicable` | |
| 구독 옵션 표시 (유료/기본) | — | `gap` | 구독 티어 구분 UI 기준 없음 |
| 카메라 상태 (온라인/오프라인) | `--color-status-success` / `--color-status-error` | `applicable` | |

---

### 6. 대시보드 / 현황 화면

| 화면 요소 | DS 대응 | 상태 | 비고 |
|----------|---------|------|------|
| 배경 | `--color-bg-home` | `candidate` | home 토큰 Figma 검증 필요 |
| 집계 수치 카드 | `--color-surface-default` + `--radius-card-md` | `applicable` | |
| 카드 내 주요 숫자 | font-size-32 + font-weight-bold | `applicable` | |
| 상태 요약 (정상·오류 수) | `--color-status-success/error` | `applicable` | |
| 최근 이벤트 리스트 | Table 컴포넌트 | `applicable` | |
| 차트·그래프 | — | `do-not-map-yet` | 차트 라이브러리 미결정 |

---

### 7. 사이트 관리 화면

| 화면 요소 | DS 대응 | 상태 | 비고 |
|----------|---------|------|------|
| 사이트 카드 | `--color-surface-default` + `--radius-card-md` | `applicable` | |
| 카드 내 건물 이미지 | — | `service-specific` | |
| 카메라 수 배지 | — | `gap` | 수량 표시 배지 컴포넌트 없음 |
| 사이트 추가 버튼 | Button / primary | `applicable` | |
| 사이트 상태 (정상/오류) | `--color-status-*` | `applicable` | |

---

### 8. 공통 UI 요소

| 화면 요소 | DS 대응 | 상태 | 비고 |
|----------|---------|------|------|
| GNB (상단 바) | `--color-surface-default` + `--color-border-subtle` | `applicable` | |
| 다크모드 토글 | Toggle 컴포넌트 | `applicable` | |
| 사이드바 너비·구조 | Sizing 토큰 (custom) | `gap` | Sidebar 너비 토큰 DS에 없음 |
| 페이지 헤더 | `--color-text-primary` + font-size-20/24 | `applicable` | |
| 로딩 스피너 | — | `gap` | Loading 상태 컴포넌트 없음 |
| 토스트 / 알림 팝업 | — | `gap` | Toast/Snackbar 컴포넌트 없음 |
| 모달 / 다이얼로그 | `--radius-modal-md` + `--color-surface-raised` | `applicable` (구조만) | Modal 컴포넌트 미등록 |
| 에러 상태 페이지 | — | `gap` | Error State 컴포넌트 없음 |

---

*이 문서는 draft입니다. 화면 구체화 후 업데이트 필요.*
