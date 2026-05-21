# 클라우드영상시스템 웹뷰어 — DS 적용 계획서

> **문서 유형:** Draft / 작업 기준  
> **작성일:** 2026-05-21  
> **참조 DS:** S1_AI_DESIGN_GUIDE (SW Design System V2.4)  
> **참조 서비스 가이드:** cloud-video-webviewer-service-guide.md  
> **원칙:** 디자인가이드를 완성된 DS처럼 가정하지 않는다. 있는 것만 쓴다.

---

## 1. 전제 조건

이 문서는 다음 상황을 전제로 작성됐다.

- **디자인가이드(DS)는 미완성 상태다.** 토큰·컴포넌트 일부는 stable, 일부는 candidate / in-progress.
- **클라우드영상시스템 웹뷰어는 영상 도메인 특화 서비스다.** DS에 없는 요소가 다수 존재할 수밖에 없다.
- **없는 기준을 억지로 만들지 않는다.** 없으면 gap으로 기록하고 서비스 전용(service-specific)으로 분리한다.
- **헥스값이나 임의 스타일을 새로 만들지 않는다.** DS 토큰을 우선 사용하고, 없으면 gap으로 남긴다.

---

## 2. DS 적용 가능 범위 요약

### 2-1. Foundation (기반 토큰) — 전체 applicable

| 카테고리 | 상태 | 클라우드 영상 웹뷰어 적용 방향 |
|---------|------|-------------------------------|
| Foundation Colors (gray / blue / red / yellow / green 팔레트) | stable | 모든 색상 사용의 기반. 직접 참조 금지, semantic을 경유 |
| Gray Dark 스케일 (dark-0 ~ dark-900) | stable | 다크모드 전용. 영상 모니터링 화면의 기본 배경 계열 |
| Brand (brand-blue, brand-red, brand-ci) | stable | 로고·CI 전용. UI 색상에 직접 사용 금지 |
| Typography (10~32px / regular·medium·bold / line-height 130%) | stable | 전 화면 텍스트 스타일에 적용 |
| Spacing (padding-block·inline / section / stack / cluster) | stable | 레이아웃 여백, 카드 내 여백 |
| Border Width (default 1px / strong 2px) | stable | 카드 테두리, 입력 테두리 |
| Radius (control-xs 2px / control-sm 4px / button-md 4px / card-md 10px / modal-md 8px) | stable | 카드·버튼·입력 등 모서리 |

### 2-2. Semantic Color 토큰 — 대부분 applicable, 일부 candidate

| 토큰 그룹 | 상태 | 클라우드 영상 웹뷰어 적용 방향 |
|----------|------|-------------------------------|
| bg (default·subtle·muted·elevated) | stable | 페이지 배경·카드·패널 배경 4단계 위계 |
| surface (default·raised) | stable | 카메라 카드 표면·모달 표면 |
| text (primary·secondary·tertiary·caption·placeholder·link·danger·inverse) | stable | 전 화면 텍스트 |
| border (subtle·default·strong·emphasis·focus·danger) | stable | 구분선·카드 테두리·입력 포커스 |
| icon (default·muted·emphasis·accent·danger) | stable | 아이콘 색상 전체 |
| action/primary (default·hover·pressed·text·subtle) | stable | 주요 액션 버튼 |
| status (success·error·warning·info) | stable | AI 이벤트·알림·카메라 상태 배지 |
| overlay | stable | 영상 위 반투명 레이어 (rgba only) |
| bg/home (#F5F6FB) | candidate | 대시보드 배경 후보 — Figma 검증 후 확정 |
| bg/selected (blue-50) | candidate | 선택된 카메라·행 배경 — 검증 필요 |

### 2-3. 컴포넌트 — 구현 완료 컴포넌트는 즉시 참조 가능

| 컴포넌트 | DS 상태 | 클라우드 영상 웹뷰어 사용 시나리오 |
|---------|---------|----------------------------------|
| Button | implemented | CTA(검색·저장·확인), 영상 다운로드, 출동 요청 |
| Checkbox | implemented | 카메라 다중 선택, 알림 필터 |
| Radio | implemented | 영상 레이아웃 선택 (2x2 / 3x3 등) |
| Toggle | implemented | 카메라 활성화/비활성화, 알림 on/off |
| Input | implemented | 문장 검색 입력, 카메라 이름 입력 |
| Select / Dropdown | implemented | 사이트 선택, 기간 필터, 정렬 |
| Textarea | implemented | 이벤트 메모 입력 |
| Table | implemented | 이벤트 목록, 카메라 목록, 사용자 목록 |
| Pagination | implemented | 이벤트·카메라 목록 페이지 이동 |
| Chip | implemented (dark pending) | AI 이벤트 분류 태그 (침입·화재·배회) — 다크모드 검증 후 사용 |
| Date Picker | candidate | 녹화 영상 검색 기간 선택 — 착수 전 HD 결정 필요 |
| Time Picker | candidate | 녹화 구간 탐색 시간 입력 — 착수 전 HD 결정 필요 |
| Nav (Sidebar) | in-progress | 전체 앱 내비게이션 — 클라우드 영상 메뉴 구성에 활용 |

---

## 3. 적용 판단 흐름

```
화면 요소를 정의할 때
  └─ DS에 해당 semantic 토큰이 있는가?
       ├─ YES (stable) → applicable: 바로 사용
       ├─ YES (candidate) → candidate: 후보로 명시하고 검증 필요 표기
       ├─ 토큰은 없지만 Foundation 팔레트에는 있는가?
       │    ├─ YES → gap 기록 후 임시로 Foundation 참조 (semantic 추가 요청)
       │    └─ NO → gap 기록. 헥스 직접 사용 금지
       └─ 컴포넌트가 있는가?
            ├─ implemented → applicable
            ├─ candidate → candidate (착수 전 결정 필요)
            └─ 없음 → service-specific으로 분리 설계
```

---

## 4. 다음 작업 순서

1. **GUI 가이드 초안 작성** — 적용 가능한 토큰·컴포넌트 기준으로 화면별 기준 작성
2. **gap 목록 정리** — DS에 없는 요소 목록화 및 우선순위 부여
3. **candidate 검증** — bg/home, bg/selected, Chip 다크모드 검증 요청
4. **service-specific 요소 설계** — 영상 플레이어·카메라 카드 등 별도 정의
5. **DS gap 피드백** — gap 목록을 S1_AI_DESIGN_GUIDE로 되돌려 개선 요청

---

*이 문서는 draft입니다. 디자이너 검토 후 확정하세요.*
