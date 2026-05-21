# s1sa Admin 개발 가이드

> 이 가이드는 s1sa Admin 화면을 개발하거나 수정할 때 반드시 따라야 할 원칙입니다.
> 비전문가(그룹장, 디자이너, 기획자, 서비스 담당자)도 이해할 수 있는 화면을 목표로 합니다.

---

## 1. 페이지 성격

s1sa Admin은 **개발자용 시스템 콘솔이 아닙니다.**
여러 서비스의 분석 상태와 통합 에이전트 운영 현황을 **쉽게 이해하는 내부 관리 화면**입니다.

---

## 2. 핵심 원칙 (Writing Guide)

1. **사용자는 AI/개발 전문가가 아닐 수 있습니다.**
2. **메뉴와 화면 제목은 한국어를 기본으로 합니다.**
3. **영어 용어는 필요한 경우 작은 보조 라벨로만 사용합니다.**
4. `raw data`, `registry`, `generated`, `sync`, `check` 같은 개발 용어는 사용자 화면에서 쉬운 말로 바꿉니다.
5. **상태값(status)은 한국어 badge로 표시합니다.** 데이터 내부 key는 영어 유지.
6. 각 화면 상단에는 **"이 화면에서 무엇을 보는지"** 한 문장 설명을 둡니다.
7. 테이블에는 내부 값만 나열하지 말고, **사람이 이해할 수 있는 라벨**을 사용합니다.
8. 파일 경로나 작업 공간 경로는 **"원본 위치", "작업 공간 위치"** 처럼 표시합니다.
9. 개발자용 정보(명령어, 경로 등)는 필요할 때만 접어서 보여줍니다.
10. **그룹장이나 비전문가가 봐도 흐름을 이해할 수 있어야 합니다.**

---

## 3. 메뉴명 기준

| 카테고리       | 메뉴명              | 설명 |
|--------------|-------------------|------|
| (단독)        | 전체 현황            | 전반적인 운영 상태 요약 |
| 운영 구조      | 에이전트 팀 구성      | 역할 조직도 및 상태 |
| 서비스         | 서비스 분석 현황      | 전체 서비스 분석 요약 |
| 서비스         | 이동체서비스 / UVIS  | 개별 서비스 상세 |
| 운영 관리      | 검토할 항목          | 사람이 확인해야 할 항목 |
| 운영 관리      | 원본 장부            | 원본 데이터 위치 확인 |
| 운영 관리      | 리포트              | 분석 결과 리포트 |
| 운영 관리      | 공개 관리            | 가이드 공개 예정 항목 |
| 시스템 관리    | 화면 표시용 데이터    | 요약 데이터 갱신 상태 |
| 시스템 관리    | 검증 상태            | 데이터 정합성 확인 결과 |
| 시스템 관리    | 도구 관리            | 내부 도구 운영 현황 |

---

## 4. 용어 치환표

화면에 노출할 때는 아래 기준으로 표현을 바꿉니다. **데이터 key는 변경하지 않습니다.**

| 사용 금지 표현               | 화면 표시 표현           |
|---------------------------|------------------------|
| s1sa                      | 통합 에이전트 (첫 노출 시 병기) |
| Agent / agents            | 에이전트 또는 담당 역할   |
| Main Orchestrator         | 작업 운영 담당           |
| S1 Service Intelligence Lead | 서비스 통합 리더      |
| Shared Capability Team    | 공통 분석 역할           |
| Service Domain Teams      | 서비스별 분석 팀         |
| Service Intelligence      | 서비스 분석 현황         |
| Registry                  | 원본 장부               |
| Generated Data            | 화면 표시용 데이터       |
| Quality Gates             | 검증 상태               |
| Review Queue              | 검토할 항목             |
| Publishing                | 공개 관리               |
| Candidate                 | 후보                   |
| service-candidate         | 서비스 후보             |
| common-candidate          | 공통 후보               |
| common-approved           | 공통 승인               |
| workspacePath / workspace | 작업 공간 위치          |
| source path / registry path | 원본 위치            |
| npm run admin:sync        | 데이터 갱신 (명령어 직접 노출 금지) |
| npm run admin:check       | 검증 실행 (명령어 직접 노출 금지) |
| DS 매핑                   | 디자인 가이드 연결       |
| next action / Next        | 다음 할 일              |
| Pending                   | 검토 대기               |
| sync                      | 갱신                   |
| check                     | 확인                   |

---

## 5. 상태값 badge 한국어 표

데이터 내부 값은 영어로 유지하고, **화면 표시만 한국어**로 합니다.
`admin.js`의 `STATUS_LABEL` 객체를 사용하세요.

| 데이터 값                   | 화면 표시          |
|--------------------------|----------------|
| active                   | 진행 중          |
| standby                  | 대기            |
| planned                  | 예정            |
| blocked                  | 막힘            |
| deprecated               | 사용 중단        |
| pending                  | 검토 대기        |
| ok                       | 정상            |
| fail                     | 실패            |
| unknown                  | 미확인           |
| not-started              | 시작 전          |
| draft                    | 초안            |
| high                     | 높음            |
| medium                   | 보통            |
| low                      | 낮음            |
| service-candidate        | 서비스 후보      |
| common-candidate         | 공통 후보        |
| common-approved          | 공통 승인        |
| review-needed            | 검토 필요        |
| designer-review-needed   | 디자이너 검토 필요 |

---

## 6. 코드 적용 예시

### badge 사용
```js
// 올바른 방법 — badge() 함수가 자동으로 한국어로 변환
badge(item.status)

// 직접 status 값을 텍스트로 쓰지 않기
// ❌ `<span>${item.status}</span>`
// ✅ badge(item.status)
```

### 상태 라벨 텍스트 사용
```js
// STATUS_LABEL 객체로 변환
STATUS_LABEL[item.currentPhase] || item.currentPhase || '-'
```

### 화면 상단 설명
```html
<!-- 각 section에 반드시 section-desc 포함 -->
<div class="section-desc">
  이 화면에서 무엇을 보는지 한 문장으로 설명합니다.
</div>
```

---

## 7. 금지사항

- 데이터 내부 key(JSON field name)를 한글로 바꾸지 않습니다.
- 파일명이나 registry schema를 변경하지 않습니다.
- User Portal은 이 가이드 범위가 아닙니다.
- 기존 UVIS 워크스페이스는 수정하지 않습니다.
- 개발 명령어(`npm run ...`)를 버튼 label이나 설명 문구에 그대로 노출하지 않습니다.

---

## 8. 체크리스트 (PR 전 확인)

- [ ] 새로 추가한 메뉴명이 한국어인가?
- [ ] 상태값이 `badge()` 함수를 통해 한국어로 표시되는가?
- [ ] 화면 상단에 한 줄 설명이 있는가?
- [ ] 테이블 헤더가 이해하기 쉬운 한국어인가?
- [ ] 개발 명령어가 사용자 화면에 직접 노출되지 않는가?
- [ ] `admin:sync` / `admin:check` 통과를 확인했는가?
