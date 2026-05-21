# 클라우드영상시스템 기획안 vs Verkada 비교

> **역할:** planning-reader + benchmark-analyst  
> **작성일:** 2026-05-21  
> **기획안 출처:** Figma 기획문서 10장 (에스원 가람 영상 UX 기획)  
> **비교 기준:** 판단값 keep / add / adapt / defer / reject / needs-review

---

## 1. 우리 기획안 요약

### 서비스 목적
에스원이 자체 클라우드로 직접 운영하는 AI 영상관제 구독 서비스.  
카메라 설치 후 별도 서버 없이 에스원이 영상 모니터링·AI 분석·출동까지 원스톱 제공.

### 주요 사용자 (미확정 → 확인 필요)
- **에스원 내부 관제 직원** (유력 — 기획문서에서 웹뷰어는 내부 도구로 묘사)
- **계약 고객(SOHO 사업자)** (모두App 중심이나 웹뷰어 접근 여부 불명확)

### 초기 타깃 고객
SOHO (1~4인) — 무인매장, 가두매장, 음식점/카페, 미용실

### 핵심 사용 시나리오 (기획문서 확인)
1. AI 이상감지 → 관제서버 연동 → 출동 요청
2. 실시간 영상 모니터링 (웹뷰어에서 다수 고객사 카메라 확인)
3. AI 문장 검색으로 영상 구간 조회
4. AI 알고리즘 구독 추가 (유료 옵션)

### 기획문서에 명시된 기능 (클라우드 S/W 핵심 기능)
| 기능 | 상태 |
|---|---|
| 영상 저장 | 확인 |
| 장비이상감지 | 확인 |
| 영상 모니터링 | 확인 |
| 녹화영상 전송 | 확인 |
| 영상 검색 (문장 검색 포함) | 확인 |
| 솔루션 연동 (통합계정·관제서버·모두App) | 확인 |
| AI 알고리즘 구독 (화재·배회·라인크로스·피플카운트) | 유료 옵션 |

### 아직 모호한 부분
| 항목 | 이유 |
|---|---|
| A-01. 웹뷰어 접근 주체 | 내부 전용 vs 고객 접근 여부 미결 |
| A-02. 모두App vs 웹뷰어 기능 경계 | 채널 분리 기준 미결 |
| B-01. 웹뷰어 화면 구조(IA) | 이 문서가 해결하는 핵심 질문 |
| B-02. 영상 검색 결과 화면 구성 | UX 상세 미결 |
| C-01. 요청출동 처리 흐름 | 관제서버 연동 상세 미결 |

---

## 2. 기획안 vs Verkada 기능 비교표

| 기능/사양 | 우리 기획안 | Verkada | 판단 | 우선순위 | 이유 |
|---|---|---|---|---|---|
| **영상 모니터링** |||||
| 라이브 그리드 (멀티 카메라) | 명시 (영상 모니터링) | Live Grid (1x1~4x3, 드래그 재배치) | keep | P0 | 기획 명시 + 웹뷰어 핵심 화면 |
| 단일 카메라 상세 보기 | 묵시 (모니터링 기능에 포함) | Single Camera Live (PTZ, 모션존) | add | P0 | 필수 화면 — 개별 카메라 상세 확인 |
| 24h 재생 타임라인 | 명시 (녹화영상 전송) | 24h Scrub Timeline (1x/2x/4x/8x) | keep | P0 | 기획 명시 + 핵심 UX 패턴 |
| 날짜별 녹화 영상 탐색 | 명시 (녹화영상 전송) | Date Picker + HQ/SQ 전환 | keep | P0 | 녹화 조회 기본 기능 |
| 얼굴 블러 토글 | 미명시 | Face Blur toggle | add | P0 | 개인정보보호법 대응 필수 |
| 영상 스냅샷·다운로드 | 묵시 | Archive·Download·Share | adapt | P1 | 공유 방식은 에스원 보안 정책 기준으로 조정 |
| 멀티캠 동기화 재생 | 미명시 | Multi-cam Synchronized Playback | defer | P2 | Phase 1 SOHO 8대 이하 — 단일 재생으로 충분 |
| **AI 이상감지 & 알림** |||||
| 이상감지 이벤트 수신 | 명시 (관제서버 연동) | Alert Inbox (읽음·안읽음·음소거) | keep | P0 | 관제 핵심 업무 흐름 |
| 침입·화재·배회 감지 | 명시 (기본 AI) | Motion·Intrusion·Fire 감지 | keep | P0 | 기획 기본 AI 알고리즘 명시 |
| 라인크로스·피플카운트 | 명시 (유료 옵션) | Line Crossing·People Count | keep | P0 | 구독 옵션 — 활성화 제어 필요 |
| 알림 음소거·스누즈 | 미명시 | Mute·Snooze | add | P1 | 무인매장 야간 운영 시 과잉 알림 방지 |
| 알림 규칙 커스텀 | 미명시 | Alert Rule Builder (조건 조합) | adapt | P1 | 기본 규칙 제공 → 커스텀은 Phase 2 |
| 알림 채널 선택 | 묵시 (모두App) | Push·Email·Slack | adapt | P1 | 모두App 푸시 + 이메일 우선, Slack은 Phase 2 |
| POI 얼굴 인식 알림 | 미명시 | POI Face Match Alert | needs-review | Hold | 개보법 — 얼굴 생체정보 저장 법적 검토 후 결정 |
| **AI 영상 검색** |||||
| 자연어 문장 검색 | 명시 (핵심 차별점) | Natural Language Search | keep | P0 | 기획 핵심 차별점 — 타사 未제공 명시 |
| 검색 필터 (카메라·날짜) | 묵시 | Filter Chips (사이트·카메라·날짜) | add | P0 | 검색 정확도 필수 |
| 검색 결과 클립 뷰어 | 묵시 (영상 구간 조회) | Clip Viewer (썸네일·인라인 재생) | keep | P0 | 검색 후 영상 확인이 핵심 UX |
| 최근 검색·추천 검색 | 미명시 | Recent & Suggested Searches | add | P1 | 비전문 SOHO 사용자 편의성 |
| 검색 → 알림 규칙 변환 | 미명시 | Create Alert from Search | defer | P2 | Phase 2 — 기본 알림 구성 후 |
| **관제 운영** |||||
| 이벤트·출동 처리 흐름 | 명시 (관제서버 연동) | Operator Ticket Queue | adapt | P0 | 에스원 관제 흐름(요청출동 월 2회)에 맞게 재설계 |
| 다수 고객사 현황 모니터링 | 묵시 | SOC Console (사이트 그리드) | adapt | P0 | 에스원 내부 관제 화면 핵심 — 사이트별 상태 |
| 사건 이력 관리 | 묵시 | Incident History | add | P1 | 출동 결과 기록 및 이력 관리 |
| 영상확인 관제서비스 | 명시 (유료 옵션) | Professional Monitoring | adapt | P1 | 에스원 유료 옵션(10円)과 연동 방식 검토 |
| 양방향 음성 | 미명시 | Talkdown | reject | - | S1 AI 카메라 H/W 미확인 |
| **장치 관리** |||||
| 카메라 목록·상태 | 명시 (장비이상감지) | Device List & Health | keep | P0 | 장비이상감지 기획 명시 |
| 카메라 온보딩 등록 | 묵시 (다이렉트몰 판매) | Add Device Wizard (QR/Serial) | add | P0 | 다이렉트몰 셀프 온보딩 핵심 |
| 카메라 기본 설정 | 묵시 | Camera Settings (7탭) | adapt | P0 | General·Events 우선, 나머지는 사양 확인 후 |
| 원격 펌웨어 업데이트 | 묵시 | Remote Firmware Update | add | P1 | AI 알고리즘 업데이트와 연계 |
| 장치 통계 (CPU·대역폭) | 미명시 | Device Stats | defer | P2 | 운영 안정화 후 |
| **관리자·설정** |||||
| SSO / 통합계정 연동 | 명시 (확인항목 C-02) | SSO / SCIM | keep | P0 | 기획 명시 — 연동 방식 확인 필요 |
| 사용자·권한 관리 | 묵시 | Users·Roles Matrix | adapt | P0 | 에스원 내부 역할 구분(관제원·운영자·관리자) |
| AI 알고리즘 구독 관리 | 명시 (유료 옵션) | Licensing·Feature Flags | adapt | P0 | 에스원 구독 플랜과 연동 방식 검토 |
| 감사 로그 | 미명시 | Audit Log | add | P1 | 운영 보안·개보법 대응 필수 |
| 데이터 내보내기·컴플라이언스 | 미명시 | Data Export & Compliance | add | P1 | 개보법 보관·삭제 정책 시행 |
| API Keys·Webhook | 미명시 | API Keys·Webhook | defer | P2 | Phase 2 — 관제서버 연동 고도화 시 |
| Slack·Teams 연동 | 미명시 | Slack·Teams Integration | reject | - | SOHO 서비스 불필요 |
| **인물·차량 분석** |||||
| 인물 감지 그리드 | 미명시 | People Face Crop Grid | needs-review | Hold | 개보법 얼굴 저장 방식 검토 필수 |
| 차량 번호판 인식 | 미명시 | LPR | needs-review | Hold | S1 AI 카메라 LPR 사양 확인 후 |
| 동선 추적·POI 프로필 | 미명시 | Person Trajectory | defer | P2 | 법적 검토 후 Phase 2 이후 |
| **분석·트렌드** |||||
| 이상감지 빈도 통계 | 미명시 | Alert Frequency Chart | add | P1 | 운영 리포트 기본 — 이상 패턴 파악 |
| 재실 인원 트렌드 | 미명시 | Occupancy Trends | defer | P2 | SOHO 니즈 있으나 Phase 2 |
| 대기열 분석 | 미명시 | Queue Trends | defer | P2 | 음식점·카페 SOHO 적합 — Phase 2 |
| 동선 히트맵 | 미명시 | Helix Heatmap | defer | P2 | 개보법 검토 후 비식별 방식으로 |
| **플로어 플랜** |||||
| 평면도 기반 카메라 보기 | 미명시 | Floor Plan + Camera Pins | adapt | P2 | SOHO 단일 매장 — 단순화 버전 검토 |

---

## 3. 요약 집계

| 판단 | 개수 | 비고 |
|---|---|---|
| keep | 12 | 기획 명시 + 반드시 가져갈 사양 |
| add | 9 | 기획에 없지만 추가 가치 높음 |
| adapt | 9 | 변형·조정 후 도입 |
| defer | 9 | Phase 2 이후 검토 |
| reject | 3 | 현재 방향 부적합 |
| needs-review | 3 | 정책·법적 검토 필요 |

---

*이 문서는 planning-reader + benchmark-analyst 역할로 작성됐습니다.*
