# S1 Service Intelligence

S1 전체 서비스 워크스페이스를 연결하는 통합 Admin 허브입니다.

## 역할

- 여러 서비스 워크스페이스를 참조/연결하는 S1 레벨 Admin
- 서비스별 분석 상태 index 및 에이전트 팀 status 관리
- Cross-service 후보 패턴 관리 (service-candidate / common-candidate 분리)
- Review Queue 통합 관리
- Publishing 상태 관리 (User Portal 노출 가능 여부)
- Generated admin summary 관리

## 폴더 구조

```
s1-service-intelligence/
├── admin/                          ← 통합 Admin HTML SPA
│   ├── index.html
│   └── assets/
│       ├── admin.css
│       └── admin.js
├── registry/
│   ├── service-index/              ← 서비스/에이전트 인덱스 (편집 가능)
│   │   ├── services.json
│   │   ├── service-workspaces.json
│   │   └── agent-teams.json
│   └── cross-service/              ← Cross-service 데이터 (single source of truth)
│       ├── service-agent-index.json
│       ├── service-context-map.json
│       ├── user-role-map.json
│       ├── task-flow-map.json
│       ├── pattern-candidates.json
│       ├── service-specific-patterns.json
│       └── ds-mapping-candidates.json
├── generated/
│   └── admin/
│       └── admin-data.bundle.js    ← sync 스크립트가 생성 (직접 편집 금지)
├── reports/                        ← 분석 리포트 (향후 추가)
├── scripts/
│   └── admin/
│       ├── sync-admin-data.mjs     ← UVIS 원본 읽어 bundle 갱신
│       └── check-admin-data.mjs    ← 무결성 검증
└── package.json
```

## 연결된 워크스페이스

| 서비스 | 경로 | 상태 |
|---|---|---|
| Mobility / UVIS | `../s1-mobility-uvis-workspace/` | active |
| 영상서비스 | TBD | planned |

## 핵심 원칙

- **UVIS 데이터를 복사하지 않습니다.** 상대 경로로 참조합니다.
- **cross-service 데이터의 단일 source of truth는 이 폴더입니다.**
- **map-list-detail-workspace는 아직 common pattern이 아닙니다.** mobility service-candidate 상태입니다.
- **Video Service는 planned 상태입니다.** 자료 제공 + 승인 후 분석 시작합니다.

## 사용 방법

### Admin 화면 열기
`admin/index.html`을 브라우저에서 직접 열기

### 데이터 동기화 (Node.js 18+ 필요)
```bash
npm run admin:sync    # UVIS 원본 → bundle 갱신
npm run admin:check   # 무결성 검증
npm run admin:build   # sync + check
```

### 로컬 서버로 열기 (선택)
```bash
npm start             # http://localhost:8080
```
