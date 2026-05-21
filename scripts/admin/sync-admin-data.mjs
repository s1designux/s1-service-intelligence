/**
 * sync-admin-data.mjs
 * registry 원본 파일을 읽어 admin/data/admin-data.bundle.js를 갱신합니다.
 * 실행: npm run admin:sync
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../');
const UVIS_ROOT = resolve(ROOT, '../s1-mobility-uvis-workspace');
const OUTPUT_DIR = resolve(ROOT, 'admin/data');
const OUTPUT = resolve(OUTPUT_DIR, 'admin-data.bundle.js');

function readJson(relPath, base = ROOT) {
  const abs = resolve(base, relPath);
  if (!existsSync(abs)) {
    console.warn(`[warn] 파일 없음: ${abs}`);
    return null;
  }
  return JSON.parse(readFileSync(abs, 'utf-8'));
}

function fileExists(relPath, base = ROOT) {
  return existsSync(resolve(base, relPath));
}

function run() {
  console.log('[sync] Admin 데이터 동기화 시작...');

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`[sync] 디렉토리 생성: ${OUTPUT_DIR}`);
  }

  const now = new Date().toISOString().split('T')[0];

  // --- registry 원본 읽기 ---
  const servicesIndex   = readJson('registry/service-index/services.json');
  const workspaces      = readJson('registry/service-index/service-workspaces.json');
  const agentTeamsRaw   = readJson('registry/service-index/agent-teams.json');
  const patternCands    = readJson('registry/cross-service/pattern-candidates.json');
  const insightsRaw     = readJson('generated/admin/service-insights.generated.json');

  // --- UVIS 원본 참조 파일 존재 확인 ---
  const uvmLayoutExists    = fileExists('registry/services/mobility/mobility-layout-modules.json', UVIS_ROOT);
  const uvmPatternsExists  = fileExists('registry/services/mobility/mobility-domain-patterns.json', UVIS_ROOT);
  const uvmMetaExists      = fileExists('outputs/mobility/module-metadata/uvis-vehicle-location-layout-modules.json', UVIS_ROOT);
  const uvmDashboardExists = fileExists('dashboard/index.html', UVIS_ROOT);

  // --- services ---
  const serviceDomains = servicesIndex ? (servicesIndex.serviceDomains || []) : [];
  // flat list for backward compat (overview stats, review queue lookups)
  const services = serviceDomains.flatMap(d =>
    (d.services || []).map(s => ({
      ...s,
      domainId: d.domainId,
      domainName: d.domainName,
      displayName: s.serviceName,
      domain: d.domainId,
    }))
  );

  // --- agent teams: groups 포맷 파싱 ---
  const rawGroups = agentTeamsRaw ? agentTeamsRaw.groups : [];
  const agentGroups = [];
  let totalAgents = 0;
  const statusCounts = {};

  for (const group of rawGroups) {
    if (group.id === 'service-teams') {
      // service-teams는 teams 배열을 가짐
      const teams = (group.teams || []).map(team => {
        const agents = team.agents || [];
        agents.forEach(a => {
          totalAgents++;
          statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
        });
        return { ...team };
      });
      agentGroups.push({ ...group, teams });
    } else {
      const agents = group.agents || [];
      agents.forEach(a => {
        totalAgents++;
        statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
      });
      agentGroups.push({ ...group });
    }
  }

  // flat 에이전트 목록 (Overview 카드용)
  const agentTeamsFlat = [];
  for (const group of rawGroups) {
    if (group.agents) {
      group.agents.forEach(a => agentTeamsFlat.push({ layer: group.id, ...a }));
    }
    if (group.teams) {
      group.teams.forEach(team =>
        team.agents.forEach(a => agentTeamsFlat.push({ layer: `services/${team.teamId}`, teamName: team.teamName, ...a }))
      );
    }
  }

  // --- pattern candidates ---
  const candidates = patternCands ? patternCands.candidates : [];

  // --- review queue ---
  const reviewQueue = [
    {
      reviewId: 'RQ-MOB-001',
      title: 'map-list-detail-workspace 명칭 확인',
      service: 'mobility-uvis-admin',
      menu: '모니터링 > 차량 위치',
      relatedCandidate: 'map-list-detail-workspace',
      type: 'designer-review',
      reason: '레이아웃 패턴 명칭이 적절한지 디자이너 검증 필요',
      priority: 'high',
      status: 'pending',
      owner: 'designer',
      source: 'uvis-vehicle-location-layout-modules.json',
      nextAction: '디자이너에게 map-list-detail 명칭 적합성 확인 요청'
    },
    {
      reviewId: 'RQ-MOB-002',
      title: '좌측 패널 756px 기본 구조 확인',
      service: 'mobility-uvis-admin',
      menu: '모니터링 > 차량 위치',
      relatedCandidate: 'left-list-zone',
      type: 'designer-review',
      reason: '756px이 고정값인지 반응형 기준인지 확인 필요',
      priority: 'high',
      status: 'pending',
      owner: 'designer',
      source: 'uvis-vehicle-location-layout-modules.json',
      nextAction: '디자이너에게 좌측 패널 width 규격 확인 요청'
    },
    {
      reviewId: 'RQ-MOB-003',
      title: '상세 overlay 380px 규격 확인',
      service: 'mobility-uvis-admin',
      menu: '모니터링 > 차량 위치',
      relatedCandidate: 'detail-overlay',
      type: 'designer-review',
      reason: '380px이 디자인 시스템 기준인지 확인 필요',
      priority: 'high',
      status: 'pending',
      owner: 'designer',
      source: 'uvis-vehicle-location-layout-modules.json',
      nextAction: '디자이너에게 상세 overlay width 규격 확인 요청'
    },
    {
      reviewId: 'RQ-MOB-004',
      title: 'VehicleDetailPanel 3탭 구조 확인',
      service: 'mobility-uvis-admin',
      menu: '모니터링 > 차량 위치',
      relatedCandidate: 'VehicleDetailPanel',
      type: 'designer-review',
      reason: '탭 라벨과 각 탭의 내용 구조 검증 필요',
      priority: 'medium',
      status: 'pending',
      owner: 'designer',
      source: 'uvis-vehicle-location-layout-modules.json',
      nextAction: '디자이너에게 VehicleDetailPanel 탭 구조 확인 요청'
    },
    {
      reviewId: 'RQ-MOB-005',
      title: '차량 상태 dot 의미 확인',
      service: 'mobility-uvis-admin',
      menu: '모니터링 > 차량 위치',
      relatedCandidate: 'vehicle-status-dot',
      type: 'source-confirmation',
      reason: '색상별 상태값 정의가 스펙 문서에서 확인 필요',
      priority: 'medium',
      status: 'pending',
      owner: 'designer',
      source: 'UI사양서(PDF)',
      nextAction: 'PDF 사양서에서 차량 상태 색상 정의 확인'
    },
    {
      reviewId: 'RQ-MOB-006',
      title: '지도 SDK 확인',
      service: 'mobility-uvis-admin',
      menu: '모니터링 > 차량 위치',
      relatedCandidate: 'map-zone',
      type: 'source-confirmation',
      reason: '어떤 지도 SDK를 사용하는지 확인 필요 (Kakao / Naver / 자체)',
      priority: 'low',
      status: 'pending',
      owner: 'designer',
      source: '개발팀 문의',
      nextAction: '개발팀에 지도 SDK 확인 요청'
    },
    {
      reviewId: 'RQ-MOB-007',
      title: '진입 경로별 화면 차이 확인',
      service: 'mobility-uvis-admin',
      menu: '모니터링 > 차량 위치',
      relatedCandidate: 'map-list-detail-workspace',
      type: 'designer-review',
      reason: '목록 직접 진입 vs 지도 마커 클릭 진입 시 상세 패널 차이 확인 필요',
      priority: 'medium',
      status: 'pending',
      owner: 'designer',
      source: 'UI사양서(PDF)',
      nextAction: '진입 경로별 상세 패널 동작 차이 디자이너 확인'
    }
  ];

  // --- service library ---
  const library = {
    common: { components: [], patterns: [], guidelines: [] },
    serviceSpecific: {
      'mobility-uvis-admin': {
        patterns: [
          {
            id: 'map-list-detail-workspace',
            title: 'Map-List-Detail Workspace',
            type: 'layout-pattern',
            service: 'mobility-uvis-admin',
            maturity: 'candidate',
            designerReview: 'needed',
            commonPromotion: 'not-yet',
            dsMapping: 'deferred',
            source: '../s1-mobility-uvis-workspace/outputs/mobility/module-metadata/uvis-vehicle-location-layout-modules.json',
            notes: '현재 UVIS 단독 발견. video 서비스 분석 후 비교 필요. 성급한 공통화 금지.'
          }
        ],
        modules: [
          { id: 'VehicleDetailPanel', title: 'Vehicle Detail Panel', type: 'module', service: 'mobility-uvis', maturity: 'candidate', designerReview: 'needed', commonPromotion: 'not-yet', dsMapping: 'deferred', source: '../s1-mobility-uvis-workspace/outputs/mobility/module-metadata/uvis-vehicle-location-layout-modules.json', notes: '3탭 구조 (기본정보 / 운행이력 / 알림). 탭 라벨 검증 필요.' },
          { id: 'left-list-zone', title: 'Left List Zone', type: 'module', service: 'mobility-uvis', maturity: 'candidate', designerReview: 'needed', commonPromotion: 'not-yet', dsMapping: 'deferred', source: '../s1-mobility-uvis-workspace/outputs/mobility/module-metadata/uvis-vehicle-location-layout-modules.json', notes: '756px 고정 좌측 목록 패널. width 규격 검증 필요.' },
          { id: 'map-zone', title: 'Map Zone', type: 'module', service: 'mobility-uvis', maturity: 'candidate', designerReview: 'needed', commonPromotion: 'not-yet', dsMapping: 'deferred', source: '../s1-mobility-uvis-workspace/outputs/mobility/module-metadata/uvis-vehicle-location-layout-modules.json', notes: '중앙 지도 영역. SDK 확인 필요 (RQ-MOB-006).' },
          { id: 'detail-overlay', title: 'Detail Overlay', type: 'module', service: 'mobility-uvis', maturity: 'candidate', designerReview: 'needed', commonPromotion: 'not-yet', dsMapping: 'deferred', source: '../s1-mobility-uvis-workspace/outputs/mobility/module-metadata/uvis-vehicle-location-layout-modules.json', notes: '380px 우측 상세 패널 오버레이. width 규격 검증 필요.' }
        ],
        components: [
          { id: 'vehicle-status-dot', title: 'Vehicle Status Dot', type: 'component', service: 'mobility-uvis', maturity: 'candidate', designerReview: 'needed', commonPromotion: 'not-yet', dsMapping: 'deferred', source: 'UI사양서(PDF)', notes: '색상별 차량 상태 표시 dot. 색상 의미 확인 필요 (RQ-MOB-005).' },
          { id: 'route-indicator', title: 'Route Indicator', type: 'component', service: 'mobility-uvis', maturity: 'candidate', designerReview: 'needed', commonPromotion: 'not-yet', dsMapping: 'deferred', source: '../s1-mobility-uvis-workspace/outputs/mobility/', notes: '노선 표시 컴포넌트.' }
        ]
      },
      'video-svms': { patterns: [], modules: [], components: [] }
    }
  };

  // --- registry files ---
  const registryFiles = [
    { fileId: 'services', path: 'registry/service-index/services.json', role: '전체 서비스 목록 (source of truth)', lastUpdated: servicesIndex?._lastUpdated || '-', status: fileExists('registry/service-index/services.json') ? 'ok' : 'missing' },
    { fileId: 'service-workspaces', path: 'registry/service-index/service-workspaces.json', role: '서비스별 workspace 경로 및 연결 정보', lastUpdated: workspaces?._lastUpdated || '-', status: fileExists('registry/service-index/service-workspaces.json') ? 'ok' : 'missing' },
    { fileId: 'agent-teams', path: 'registry/service-index/agent-teams.json', role: '전체 에이전트 팀 정의', lastUpdated: agentTeamsRaw?._lastUpdated || '-', status: fileExists('registry/service-index/agent-teams.json') ? 'ok' : 'missing' },
    { fileId: 'pattern-candidates', path: 'registry/cross-service/pattern-candidates.json', role: '공통 승격 후보 패턴 목록 (cross-service)', lastUpdated: patternCands?._lastUpdated || '-', status: fileExists('registry/cross-service/pattern-candidates.json') ? 'ok' : 'missing' },
    { fileId: 'service-agent-index', path: 'registry/cross-service/service-agent-index.json', role: '서비스 × 에이전트 연결 인덱스', lastUpdated: '-', status: fileExists('registry/cross-service/service-agent-index.json') ? 'ok' : 'missing' },
    { fileId: 'service-context-map', path: 'registry/cross-service/service-context-map.json', role: '서비스 컨텍스트 맵', lastUpdated: '-', status: fileExists('registry/cross-service/service-context-map.json') ? 'ok' : 'missing' },
    { fileId: 'ds-mapping-candidates', path: 'registry/cross-service/ds-mapping-candidates.json', role: 'DS 매핑 후보 (현재 deferred)', lastUpdated: '-', status: fileExists('registry/cross-service/ds-mapping-candidates.json') ? 'ok' : 'missing' },
    { fileId: 'user-role-map', path: 'registry/cross-service/user-role-map.json', role: '사용자 역할 맵', lastUpdated: '-', status: fileExists('registry/cross-service/user-role-map.json') ? 'ok' : 'missing' },
    { fileId: 'task-flow-map', path: 'registry/cross-service/task-flow-map.json', role: '작업 흐름 맵', lastUpdated: '-', status: fileExists('registry/cross-service/task-flow-map.json') ? 'ok' : 'missing' },
    { fileId: 'uvis-layout-modules', path: 'registry/services/mobility/mobility-layout-modules.json', role: 'UVIS 레이아웃 모듈 정의 (UVIS 원본 참조)', lastUpdated: '-', base: '../s1-mobility-uvis-workspace/', status: uvmLayoutExists ? 'ok' : 'missing' },
    { fileId: 'uvis-vehicle-meta', path: 'outputs/mobility/module-metadata/uvis-vehicle-location-layout-modules.json', role: 'UVIS 차량 위치 모듈 메타데이터 (UVIS 원본 참조)', lastUpdated: '-', base: '../s1-mobility-uvis-workspace/', status: uvmMetaExists ? 'ok' : 'missing' }
  ];

  // --- quality gates ---
  const qualityGates = [
    { gateId: 'admin:sync', name: 'Admin Data Sync', command: 'npm run admin:sync', status: 'ok', lastRun: now, errorCount: 0, warningCount: 0, notes: 'registry → admin/data/admin-data.bundle.js 생성' },
    { gateId: 'admin:check', name: 'Admin Data Check', command: 'npm run admin:check', status: 'unknown', lastRun: null, errorCount: 0, warningCount: 0, notes: '파일 존재 + 일관성 검증. sync 후 별도 실행 필요.' },
    { gateId: 'registry-reference', name: 'Registry Reference Check', command: 'npm run admin:check', status: registryFiles.every(f => f.status === 'ok') ? 'ok' : 'fail', lastRun: now, errorCount: registryFiles.filter(f => f.status === 'missing').length, warningCount: 0, notes: 'registry 파일 존재 여부 확인' },
    { gateId: 'generated-data', name: 'Generated Data Check', command: 'npm run admin:check', status: 'ok', lastRun: now, errorCount: 0, warningCount: 0, notes: 'admin/data/admin-data.bundle.js 존재 확인 (sync 직후 항상 ok)' },
    { gateId: 'uvis-source-reference', name: 'UVIS Source Reference Check', command: 'npm run admin:check', status: (uvmLayoutExists && uvmMetaExists && uvmDashboardExists) ? 'ok' : 'fail', lastRun: now, errorCount: [uvmLayoutExists, uvmMetaExists, uvmDashboardExists].filter(v => !v).length, warningCount: 0, notes: 'UVIS 원본 workspace 참조 경로 존재 확인' },
    { gateId: 'candidate-consistency', name: 'Candidate Status Consistency', command: 'npm run admin:check', status: candidates.every(c => !(c.commonPromotion === 'approved' && c.foundIn.length < 2)) ? 'ok' : 'fail', lastRun: now, errorCount: candidates.filter(c => c.commonPromotion === 'approved' && c.foundIn.length < 2).length, warningCount: 0, notes: '단일 서비스 패턴의 common 승격 금지 규칙 확인' },
    { gateId: 'publish-rules', name: 'Publish Rule Check', command: 'npm run admin:check', status: 'ok', lastRun: now, errorCount: 0, warningCount: 0, notes: 'draft/admin-only 항목 User Portal 노출 금지 확인 (User Portal 미구현 중)' }
  ];

  // --- generated data meta ---
  const generatedData = [
    {
      fileId: 'admin-data.bundle.js',
      path: 'admin/data/admin-data.bundle.js',
      description: 'Admin 화면이 읽는 단일 번들 데이터. sync 스크립트로 생성.',
      lastSynced: now,
      syncStatus: 'ok',
      sourceFiles: [
        'registry/service-index/services.json',
        'registry/service-index/agent-teams.json',
        'registry/cross-service/pattern-candidates.json',
        'generated/admin/service-insights.generated.json'
      ]
    },
    {
      fileId: 'service-insights.generated.json',
      path: 'generated/admin/service-insights.generated.json',
      description: 'Service Guide Curator 산출물. 서비스별 기본 정보 가이드.',
      lastSynced: insightsRaw?._lastUpdated || '-',
      syncStatus: insightsRaw ? 'ok' : 'missing',
      sourceFiles: []
    }
  ];

  // --- bundle 작성 ---
  const bundleContent = `// S1 Service Intelligence — Admin Data Bundle
// Generated by: scripts/admin/sync-admin-data.mjs
// Last synced: ${now}
// DO NOT edit manually — run \`npm run admin:sync\` to regenerate

window.ADMIN_DATA = ${JSON.stringify({
    _meta: {
      generatedAt: now,
      syncScript: 'scripts/admin/sync-admin-data.mjs',
      sourceWorkspace: '../s1-mobility-uvis-workspace/'
    },
    serviceDomains,
    services,
    agentSummary: { totalAgents, ...statusCounts },
    agentGroups,
    agentTeams: agentTeamsFlat,
    reviewQueue,
    serviceInsights: insightsRaw ? insightsRaw.insights : [],
    patternCandidates: candidates,
    library,
    registryFiles,
    qualityGates,
    generatedData
  }, null, 2)};
`;

  writeFileSync(OUTPUT, bundleContent, 'utf-8');

  const missingCount = registryFiles.filter(f => f.status === 'missing').length;
  console.log(`[sync] 완료: ${OUTPUT}`);
  console.log(`[sync] 서비스 도메인: ${serviceDomains.length}, 전체 서비스: ${services.length}, 에이전트(flat): ${agentTeamsFlat.length}, 에이전트 그룹: ${agentGroups.length}`);
  console.log(`[sync] 리뷰 항목: ${reviewQueue.length}, quality gates: ${qualityGates.length}`);
  console.log(`[sync] registry 파일: ${registryFiles.length}개 (없음: ${missingCount}개)`);
  if (missingCount > 0) {
    console.warn(`[warn] ${missingCount}개 파일 미존재 — admin:check 실행 권장`);
  }
}

run();
