// S1 서비스 통합 에이전트 관리 — admin.js

const D = () => window.ADMIN_DATA || {};

// ── 상태 label 변환 ──
const STATUS_LABEL = {
  active:                     '진행 중',
  standby:                    '대기',
  planned:                    '예정',
  blocked:                    '막힘',
  deprecated:                 '사용 중단',
  pending:                    '검토 대기',
  ok:                         '정상',
  unknown:                    '미확인',
  fail:                       '실패',
  'not-started':              '시작 전',
  draft:                      '초안',
  high:                       '높음',
  medium:                     '보통',
  low:                        '낮음',
  'service-candidate':        '서비스 후보',
  'common-candidate':         '공통 후보',
  'common-approved':          '공통 승인',
  'review-needed':            '검토 필요',
  'designer-review-needed':   '디자이너 검토 필요',
};

// ── 그룹 title 변환 ──
const GROUP_TITLE_MAP = {
  'Leadership':               '서비스 통합 리더',
  'Orchestration':            '실무 리더',
  'Shared Capability Agents': '공통 분석 역할',
  'Shared Capabilities':      '공통 분석 역할',
  'Service Teams':            '서비스별 분석 팀',
};

// ── 에이전트 이름 변환 ──
const AGENT_NAME_MAP = {
  'S1 Service Intelligence Lead': '서비스 통합 리더',
  'Main Orchestrator':            '실무 리더',
  'Service Guide Curator':        '서비스 가이드 정리 담당',
};

// ── 유틸 ──
function badge(status) {
  const cls_map = {
    active: 'active', standby: 'standby', planned: 'planned',
    blocked: 'blocked', deprecated: 'deprecated', pending: 'pending',
    ok: 'ok', unknown: 'unknown', fail: 'fail', 'not-started': 'planned',
    draft: 'draft', high: 'high', medium: 'medium', low: 'low',
    'service-candidate': 'standby', 'common-candidate': 'planned',
    'common-approved': 'active', 'review-needed': 'pending',
    'designer-review-needed': 'pending',
  };
  const cls   = cls_map[status] || 'unknown';
  const label = STATUS_LABEL[status] || status;
  return `<span class="badge badge-${cls}">${label}</span>`;
}

function insightBadge(status) {
  const map = {
    confirmed:       ['confirmed',      '확인됨'],
    assumed:         ['assumed',        '추정'],
    'review-needed': ['review-needed',  '검토 필요'],
  };
  const [cls, label] = map[status] || ['unknown', status];
  return `<span class="insight-badge insight-badge-${cls}">${label}</span>`;
}

function iaStatusChip(status) {
  const map = {
    confirmed:       ['ia-chip-confirmed', '확인됨'],
    assumed:         ['ia-chip-assumed',   '추정'],
    'review-needed': ['ia-chip-review',    '확인 필요'],
  };
  const [cls, label] = map[status] || ['ia-chip-review', '확인 필요'];
  return `<span class="ia-status-chip ${cls}">${label}</span>`;
}

function el(tag, cls, html) {
  return `<${tag} class="${cls}">${html}</${tag}>`;
}

// ── 내비게이션 ──
function initNav() {
  const allNavItems = document.querySelectorAll('.nav-item, .nav-sub-item');
  allNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.section;
      allNavItems.forEach(n => n.classList.remove('active'));
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      document.getElementById(`section-${target}`)?.classList.add('active');
      document.querySelector('.breadcrumb strong').textContent = item.querySelector('.nav-label').textContent;
    });
  });

  document.querySelectorAll('.nav-domain-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const domain = toggle.dataset.domain;
      const items = document.querySelector(`.nav-domain-items[data-domain="${domain}"]`);
      toggle.classList.toggle('collapsed');
      items?.classList.toggle('collapsed');
    });
  });
}

// ── 탭 ──
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabsEl => {
    tabsEl.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const group = tab.dataset.group;
        const target = tab.dataset.target;
        tabsEl.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll(`.tab-panel[data-group="${group}"]`).forEach(p => p.classList.remove('active'));
        document.querySelector(`.tab-panel[data-group="${group}"][data-panel="${target}"]`)?.classList.add('active');
      });
    });
  });
}


// ── 전체 현황 ──
function renderOverview() {
  const d = D();
  const services   = d.services || [];
  const agentSummary = d.agentSummary || {};
  const reviews    = d.reviewQueue || [];
  const candidates = d.patternCandidates || [];
  const gates      = d.qualityGates || [];

  const activeServices  = services.filter(s => s.status === 'active').length;
  const pendingReviews  = reviews.filter(r => r.status === 'pending').length;
  const gateFails       = gates.filter(g => g.status === 'fail').length;
  const totalAgents     = agentSummary.totalAgents || 0;
  const activeAgents    = agentSummary.active || 0;
  const el              = document.getElementById('overview-stats');
  if (!el) return;

  if (!totalAgents && !services.length) {
    el.innerHTML = `
      <div class="card" style="text-align:center;padding:48px;color:var(--gray-400)">
        데이터가 없습니다.<br>
        <span style="font-size:12px;margin-top:8px;display:block">관리자에게 데이터 갱신을 요청하거나, 터미널에서 동기화 명령을 실행하세요.</span>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div class="cards cards-4">
      <div class="card">
        <div class="card-label">분석 중인 서비스</div>
        <div class="card-value">${activeServices}</div>
        <div class="card-sub">${services.length}개 서비스 등록됨</div>
      </div>
      <div class="card">
        <div class="card-label">에이전트 역할</div>
        <div class="card-value">${activeAgents} <span style="font-size:16px;color:var(--gray-400)">/ ${totalAgents}</span></div>
        <div class="card-sub">진행 중 / 전체</div>
      </div>
      <div class="card">
        <div class="card-label">검토할 항목</div>
        <div class="card-value" style="color:var(--orange-500)">${pendingReviews}</div>
        <div class="card-sub">디자이너 확인 필요</div>
      </div>
      <div class="card">
        <div class="card-label">서비스 후보</div>
        <div class="card-value">${candidates.length}</div>
        <div class="card-sub">공통화 검토 전 단계</div>
      </div>
    </div>
    <div class="mt-24">
      ${services.filter(s => s.nextAction).map(s => `
        <div class="next-action" style="margin-bottom:8px">
          <span class="next-action-label">${s.displayName}</span>
          <span class="next-action-text">${s.nextAction}</span>
          ${badge(s.status)}
        </div>`).join('')}
    </div>
    <div class="cards cards-2 mt-16">
      <div class="card">
        <div class="card-label" style="margin-bottom:12px">서비스 현황</div>
        ${services.map(s => `
          <div class="flex items-center gap-8" style="margin-bottom:8px">
            ${badge(s.status)}
            <span style="font-weight:600;font-size:13px">${s.displayName}</span>
            <span class="text-muted text-sm" style="margin-left:auto">${STATUS_LABEL[s.currentPhase] || s.currentPhase || '-'}</span>
          </div>`).join('')}
      </div>
      <div class="card">
        <div class="card-label" style="margin-bottom:12px">검증 상태</div>
        ${gateFails > 0
          ? `<div style="font-size:12px;color:var(--red-600);margin-bottom:8px;font-weight:600">${gateFails}개 항목 실패 — 관리자 확인 필요</div>`
          : ''}
        ${gates.slice(0, 5).map(g => `
          <div class="flex items-center gap-8" style="margin-bottom:8px">
            ${badge(g.status)}
            <span style="font-size:13px">${g.name}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

// ── 조직도 ──
function renderOrgChart() {
  const groups = D().agentGroups || [];
  if (!groups.length) return '';

  const leadership    = groups.find(g => g.id === 'leadership');
  const orchestration = groups.find(g => g.id === 'orchestration');
  const shared        = groups.find(g => g.id === 'shared');
  const serviceTeams  = groups.find(g => g.id === 'service-teams');

  const leadAgent = (leadership?.agents || [])[0] || {};
  const orchAgent = (orchestration?.agents || [])[0] || {};

  const sharedCards = (shared?.agents || []).map(a => {
    const displayName = AGENT_NAME_MAP[a.name] || a.name;
    const shortRole   = (a.role || '').split('. ')[0];
    return `
    <div class="mini-agent-card status-${a.status}">
      <div class="mini-agent-name">${displayName}</div>
      <div class="mini-agent-role">${shortRole}</div>
      ${badge(a.status)}
    </div>`;
  }).join('');

  const teams = serviceTeams?.teams || [];
  const serviceCards = teams.map(t => {
    const agentCount  = (t.agents || []).length;
    const activeCount = (t.agents || []).filter(a => a.status === 'active').length;
    const agentNames  = (t.agents || []).map(a => AGENT_NAME_MAP[a.name] || a.name).join(', ');
    return `
      <div class="service-team-card ${t.teamStatus === 'active' ? 'svc-active' : 'svc-planned'}">
        <div class="stc-name">${t.displayName || t.teamName}</div>
        ${t.system ? `<div class="stc-sub">${t.system}</div>` : ''}
        <div class="stc-status">${badge(t.teamStatus)}</div>
        <div style="font-size:10px;color:var(--gray-400)">
          에이전트 ${agentCount}명${activeCount > 0 ? ` · 진행 중 ${activeCount}` : ''}
        </div>
        ${agentNames ? `<div class="stc-agent-list">${agentNames}</div>` : ''}
      </div>`;
  }).join('');

  return `
    <section class="agent-org-chart">

      <div class="org-root">
        <h3>S1 서비스 통합 에이전트</h3>
        <p class="org-root-sub">s1sa · 여러 서비스 분석을 한곳에서 관리하는 내부 운영 체계</p>
      </div>

      <article class="org-card org-lead">
        <div class="org-card-header">
          <div>
            <h3>서비스 통합 리더</h3>
            <div style="font-size:11px;color:var(--gray-400);margin-top:2px">S1 Service Intelligence Lead</div>
          </div>
          ${badge(leadAgent.status || 'standby')}
        </div>
        <p class="org-node-role">여러 서비스의 분석 결과를 모아 큰 방향을 판단합니다.</p>
      </article>

      <div class="org-connector"></div>

      <article class="org-card org-orchestrator">
        <div class="org-card-header">
          <div>
            <h3>실무 리더</h3>
            <div style="font-size:11px;color:var(--gray-400);margin-top:2px">Main Orchestrator</div>
          </div>
          ${badge(orchAgent.status || 'active')}
        </div>
        <p class="org-node-role">현재 작업을 굴리고 다음 할 일을 정리합니다.</p>
      </article>

      <div class="org-connector"></div>

      <section class="org-section shared-capabilities">
        <div class="org-section-header">
          <h3>공통 분석 역할</h3>
          <p class="org-section-sub">모든 서비스에 공통으로 쓰이는 역할 <span style="font-size:10px;color:var(--gray-400)">Shared Capability Team</span></p>
        </div>
        <div class="capability-grid">${sharedCards}</div>
      </section>

      <div class="org-connector"></div>

      <section class="org-section service-domain-teams">
        <div class="org-section-header">
          <h3>서비스별 분석 팀</h3>
          <p class="org-section-sub">각 서비스의 화면과 업무 맥락을 분석하는 팀 <span style="font-size:10px;color:var(--gray-400)">Service Domain Teams</span></p>
        </div>
        <div class="service-team-grid">${serviceCards}</div>
      </section>

      <div class="org-legend">
        <div class="org-legend-title">상태 안내</div>
        <div class="org-legend-grid">
          <div class="org-legend-item"><strong>진행 중</strong>현재 분석에 참여하는 역할</div>
          <div class="org-legend-item"><strong>대기</strong>조건이 맞을 때만 활성화되는 역할</div>
          <div class="org-legend-item"><strong>예정</strong>아직 준비 전인 역할</div>
          <div class="org-legend-item"><strong>서비스 통합 리더</strong>두 번째 서비스 분석이 시작되면 활성화</div>
          <div class="org-legend-item"><strong>실무 리더</strong>항상 진행 중 · 전체 작업 흐름과 다음 할 일 관리</div>
        </div>
      </div>

    </section>`;
}

// ── 에이전트 카드 ──
function agentCard(a) {
  const displayName = AGENT_NAME_MAP[a.name] || a.name;
  const nameSlug    = a.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `
    <div class="agent-card status-${a.status}">
      <div class="agent-card-header">
        <div>
          <div class="agent-card-name">${displayName}</div>
          ${a.id && a.id !== nameSlug ? `<div class="agent-card-id">${a.id}</div>` : ''}
        </div>
        ${badge(a.status)}
      </div>
      <div class="agent-card-role">${a.role}</div>
      ${a.activation ? `
        <div class="agent-card-activation">
          <span class="agent-card-activation-label">활성화 조건</span>
          ${a.activation}
        </div>` : ''}
      <div class="agent-card-meta">
        ${a.relatedService && a.relatedService !== 'all' ? `<span>서비스: ${a.relatedService}</span>` : ''}
        ${a.workspacePath ? `<span class="font-mono">${a.workspacePath}</span>` : ''}
      </div>
      ${a.notes ? `<div class="agent-card-notes">${a.notes}</div>` : ''}
    </div>`;
}

// ── 에이전트 팀 구성 ──
function renderAgentTeams() {
  const groups  = D().agentGroups || [];

  if (!groups.length) {
    document.getElementById('agent-teams-content').innerHTML =
      `<div class="card" style="text-align:center;padding:48px;color:var(--gray-400)">
        에이전트 데이터가 없습니다.<br>
        <span style="font-size:12px;margin-top:8px;display:block">관리자에게 데이터 갱신을 요청하세요.</span>
      </div>`;
    return;
  }

  const roleNotice = `
    <div class="role-notice">
      <strong>역할 구분:</strong>
      <strong>실무 리더</strong>은 전체 작업 흐름과 다음 할 일을 관리합니다(항상 진행 중).
      <strong>서비스 통합 리더</strong>는 여러 서비스 분석 결과를 비교해 공통화 방향을 판단합니다. 두 번째 서비스 분석 이후 활성화 예정입니다(현재 대기).
      <strong>서비스 가이드 정리 담당(Service Guide Curator)</strong>은 서비스 개요·IA·주요 화면/기능·주요 사양을 중심으로 서비스 가이드를 정리합니다. 사용자가 수정한 정리 내용을 우선 기준으로 삼으며, 부족한 정보만 원본 분석에서 보완합니다. UX 평가·공통화 판단·DS 매핑 판단은 담당하지 않습니다.
    </div>`;

  const groupsArr = groups.map((group, i) => {
    let content;
    if (group.id === 'service-teams') {
      const teams = group.teams || [];
      const teamsHtml = teams.map(team => `
        <div class="service-team-block">
          <div class="service-team-header status-${team.teamStatus}">
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <div class="service-team-name">${team.teamName}</div>
                ${badge(team.teamStatus)}
              </div>
              <div class="service-team-meta">
                ${team.currentFocus ? `<span>현재 작업: ${team.currentFocus}</span>` : ''}
                ${team.currentPhase && team.currentPhase !== 'not-started' ? `<span>${STATUS_LABEL[team.currentPhase] || team.currentPhase}</span>` : ''}
                ${team.currentPhase === 'not-started' ? `<span style="color:var(--gray-400)">분석 미시작</span>` : ''}
              </div>
              ${team.context ? `<div style="font-size:11px;color:var(--gray-500);margin-top:4px;max-width:600px">${team.context}</div>` : ''}
            </div>
            ${team.workspacePath ? `<span class="service-team-workspace">${team.workspacePath}</span>` : ''}
          </div>
          <div class="agent-cards">
            ${(team.agents || []).map(agentCard).join('')}
          </div>
        </div>`).join('');
      content = `
        <div class="agent-group">
          <div class="agent-group-header">
            <span class="agent-group-title">${GROUP_TITLE_MAP[group.title] || group.title}</span>
            <span class="agent-group-desc">${group.description || ''}</span>
          </div>
          ${teamsHtml}
        </div>`;
    } else {
      const agents = group.agents || [];
      content = `
        <div class="agent-group">
          <div class="agent-group-header">
            <span class="agent-group-title">${GROUP_TITLE_MAP[group.title] || group.title}</span>
            <span class="agent-group-count">${agents.length}</span>
            <span class="agent-group-desc">${group.description || ''}</span>
          </div>
          <div class="agent-cards">
            ${agents.map(agentCard).join('')}
          </div>
        </div>`;
    }
    const title = GROUP_TITLE_MAP[group.title] || group.title;
    return { id: group.id, title, content, active: i === 0 };
  });

  const detailTabs = `
    <div class="tabs agent-detail-tabs">
      ${groupsArr.map(g => `<div class="tab ${g.active ? 'active' : ''}" data-group="agent-detail" data-target="${g.id}">${g.title}</div>`).join('')}
    </div>
    ${groupsArr.map(g => `<div class="tab-panel ${g.active ? 'active' : ''}" data-group="agent-detail" data-panel="${g.id}"><div class="agent-arch">${g.content}</div></div>`).join('')}`;

  document.getElementById('agent-teams-content').innerHTML =
    renderOrgChart() +
    roleNotice +
    detailTabs;

  initAgentDetailTabs();
}

function initAgentDetailTabs() {
  const tabsEl = document.querySelector('.agent-detail-tabs');
  if (!tabsEl) return;
  tabsEl.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const group = tab.dataset.group;
      const target = tab.dataset.target;
      tabsEl.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll(`.tab-panel[data-group="${group}"]`).forEach(p => p.classList.remove('active'));
      document.querySelector(`.tab-panel[data-group="${group}"][data-panel="${target}"]`)?.classList.add('active');
      const headerH    = document.querySelector('.main-header')?.offsetHeight ?? 0;
      const tabsAbsTop = tabsEl.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, tabsAbsTop - headerH), behavior: 'instant' });
    });
  });
}

// ── 서비스 분석 현황 ──
function renderServiceIntelligence() {
  const domains = D().serviceDomains || [];
  const el = document.getElementById('service-intelligence-content');
  if (!el) return;
  if (!domains.length) {
    el.innerHTML = `<div class="card" style="text-align:center;padding:48px;color:var(--gray-400)">데이터가 없습니다. 관리자에게 데이터 갱신을 요청하세요.</div>`;
    return;
  }
  el.innerHTML = domains.map(domain => {
    const svcs = domain.services || [];
    const activeCount = svcs.filter(s => s.status === 'active').length;
    const isActive = domain.status === 'active';
    return `
      <div class="si-block ${isActive ? 'si-block-active' : 'si-block-planned'}">
        <div class="si-domain-header">
          <span class="si-domain-name">${domain.domainName}</span>
          ${badge(domain.status)}
          <span class="si-domain-meta">${svcs.length}개 서비스${activeCount > 0 ? ` · ${activeCount}개 분석 중` : ''}</span>
        </div>
        <div class="si-rows">
          ${svcs.map(s => {
            const isRowActive = s.status === 'active';
            return `
              <div class="si-row ${isRowActive ? 'si-row-active' : 'si-row-planned'}">
                <div class="si-col-name">
                  <span class="si-svc-name">${s.serviceName}</span>
                  ${s.system ? `<span class="si-svc-system">${s.system}</span>` : ''}
                </div>
                <div class="si-col-focus">${s.currentFocus || '—'}</div>
                <div class="si-col-action">${s.nextAction || '—'}</div>
                <div class="si-col-status">${badge(s.status)}</div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');

}

// ── 서비스 가이드 정리 렌더링 ──
function renderInsightSections(insight) {
  if (!insight) return '';
  const sections = insight.sections || [];
  const sec = id => sections.find(s => s.id === id);

  const wrap = (title, headerBadge, content) => `
    <div class="insight-section">
      <div class="insight-section-title">${title}${headerBadge ? ' ' + headerBadge : ''}</div>
      ${content}
    </div>`;

  const overview = sec('overview');
  const overviewHtml = overview ? wrap(overview.title, '', `
    <table class="insight-table"><tbody>
      ${overview.items.map(item => `
        <tr>
          <td class="insight-label">${item.label}</td>
          <td class="insight-value">${item.value}</td>
          <td>${insightBadge(item.status)}</td>
        </tr>`).join('')}
    </tbody></table>`) : '';

  const users = sec('users');
  const usersHtml = users ? wrap(users.title, '', `
    <div class="insight-role-grid">
    ${users.roles.map(role => `
      <div class="insight-role-card">
        <div class="insight-role-header">
          <span class="insight-role-name">${role.role}</span>
          ${insightBadge(role.status)}
        </div>
        <div class="insight-role-purpose">${role.purpose}</div>
        <ul class="insight-role-tasks">${role.tasks.map(t => `<li>${t}</li>`).join('')}</ul>
        ${role.reviewNote ? `<div class="insight-review-note">검토: ${role.reviewNote}</div>` : ''}
      </div>`).join('')}
    </div>`) : '';

  const ia = sec('ia');
  const iaHtml = ia ? wrap(ia.title, '', (() => {
    const menus = ia.gnbMenus || [];

    // ── 1. 진입 및 공통 영역 ──
    const entryBlock = `
      <div class="ia-block-title">1. 진입 및 공통 영역</div>
      <div class="ia-entry-row">
        <div class="ia-entry-item"><span class="ia-entry-label">인증 / 로그인</span><span class="ia-entry-value">Knox SSO 인증 → 로그인</span></div>
        <div class="ia-entry-item"><span class="ia-entry-label">홈</span><span class="ia-entry-value">HOME 대시보드 (탭 디폴트 표출)</span></div>
        <div class="ia-entry-item"><span class="ia-entry-label">유틸리티</span><span class="ia-entry-value">언어설정 (국문 / 영문) · 내정보 (내 정보 수정 / 로그아웃)</span></div>
      </div>`;

    // ── 2. 메뉴 구조 테이블 ──
    const tableRows = menus.flatMap(menu =>
      (menu.subItems || []).map((item, si) => {
        const count = (menu.subItems || []).length;
        const firstCell = si === 0
          ? `<td class="ia-td-1d" rowspan="${count}">${menu.menu}${menu.note ? `<div class="ia-1d-note">${menu.note}</div>` : ''}</td>`
          : '';
        const subText = item.children?.length
          ? item.children.map(c => `<span class="ia-sub-tag">${c}</span>`).join('')
          : `<span class="ia-sub-empty">-</span>`;
        const noteText = item.note ? `<div class="ia-item-inline-note">${item.note}</div>` : '';
        return `<tr>${firstCell}<td class="ia-td-2d">${item.name}${noteText}</td><td class="ia-td-sub">${subText}</td><td class="ia-td-role">${item.role || '-'}</td><td class="ia-td-status">${iaStatusChip(item.status)}</td></tr>`;
      })
    ).join('');

    const tableBlock = `
      <div class="ia-block-title">2. 메뉴 구조</div>
      <div class="ia-table-scroll">
        <table class="ia-menu-table">
          <thead><tr><th>1Depth</th><th>2Depth / 화면</th><th>하위 항목</th><th>역할</th><th>상태</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>`;

    // ── 3. IA 트리 ──
    const treeBlock = `
      <div class="ia-block-title">3. IA 트리 구조</div>
      <div class="ia-tree-compact">
        <div class="ia-tc-col">
          <div class="ia-tc-root">진입 / 공통</div>
          <div class="ia-tc-d1">Knox SSO 인증</div>
          <div class="ia-tc-d1">로그인</div>
          <div class="ia-tc-d1">HOME 대시보드<div class="ia-tc-d2">탭 디폴트 표출</div></div>
          <div class="ia-tc-d1">유틸리티 메뉴
            <div class="ia-tc-d2">언어설정<div class="ia-tc-d3">국문</div><div class="ia-tc-d3">영문</div></div>
            <div class="ia-tc-d2">내정보<div class="ia-tc-d3">내 정보 수정</div><div class="ia-tc-d3">로그아웃</div></div>
          </div>
        </div>
        ${menus.map(menu => `
          <div class="ia-tc-col">
            <div class="ia-tc-root">${menu.menu}</div>
            ${(menu.subItems || []).map(item => `
              <div class="ia-tc-d1">${item.name}
                ${(item.children || []).map(c => `<div class="ia-tc-d2">${c}</div>`).join('')}
              </div>`).join('')}
          </div>`).join('')}
      </div>`;

    // ── 4. 확인 필요 박스 ──
    const reviewItems = ia.iaReviewNotes || [];
    const reviewBlock = reviewItems.length ? `
      <div class="ia-review-box">
        <div class="ia-review-box-title">구조상 확인 필요 항목</div>
        <ul class="ia-review-list">${reviewItems.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>` : '';

    return `<div class="ia-doc">${entryBlock}${tableBlock}${treeBlock}${reviewBlock}</div>`;
  })()) : '';

  const scenarios = sec('scenarios');
  const scenariosHtml = scenarios ? wrap(scenarios.title, '', `
    ${scenarios.items.map((item, i) => `
      <div class="insight-scenario">
        <div class="insight-scenario-header">
          <span class="insight-scenario-num">시나리오 ${i + 1}</span>
          ${insightBadge(item.status)}
        </div>
        <div class="insight-scenario-title">${item.title}</div>
        <ol class="insight-scenario-steps">${item.steps.map(s => `<li>${s}</li>`).join('')}</ol>
        ${item.reviewNote ? `<div class="insight-review-note">검토: ${item.reviewNote}</div>` : ''}
      </div>`).join('')}`) : '';

  const ux = sec('uxDirection');
  const uxHtml = ux ? wrap(ux.title, insightBadge(ux.status), `
    ${ux.note ? `<div class="insight-source-note">${ux.note}</div>` : ''}
    ${ux.items.map(item => `
      <div class="insight-ux-item">
        <div class="insight-ux-label">${item.label} ${insightBadge(item.status)}</div>
        <div class="insight-ux-value">${item.value}</div>
      </div>`).join('')}`) : '';

  return `
    <div class="insight-container">
      <div class="insight-header">
        <div class="insight-header-title">서비스 가이드</div>
        <div class="insight-header-meta">
          <span>${insight.serviceName}</span>
          <span>정리: ${insight.curatedAt}</span>
          ${insight.sourceRefs?.length ? `<span>${insight.sourceRefs[0]}</span>` : ''}
        </div>
      </div>
      ${overviewHtml}${usersHtml}${iaHtml}${scenariosHtml}${uxHtml}
    </div>`;
}

// ── 서비스별 상세 섹션 ──
function renderServiceDetail(svc, domain, contentId) {
  const el = document.getElementById(contentId);
  if (!el) return;

  if (svc.dashboardLink) {
    const section = el.closest('.section');
    const header = section?.querySelector('.section-header');
    if (header && !header.querySelector('.section-header-action')) {
      const textDiv = document.createElement('div');
      [...header.childNodes].forEach(n => textDiv.appendChild(n));
      header.style.cssText = 'display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:24px';
      header.appendChild(textDiv);
      const actionDiv = document.createElement('div');
      actionDiv.className = 'section-header-action';
      actionDiv.innerHTML = `<a href="${svc.dashboardLink}" target="_blank" class="btn btn-ghost">워크스페이스 열기 ↗</a>`;
      header.appendChild(actionDiv);
    }
  }

  const insightsAll = D().serviceInsights || [];
  const insight = insightsAll.find(ins => ins.serviceId === svc.serviceId) || null;

  el.innerHTML = `
    ${svc.status === 'planned' && !svc.currentFocus ? `
      <div class="card" style="text-align:center;padding:40px;color:var(--gray-400)">
        분석 예정 — 자료 제공 후 시작합니다.
      </div>` : ''}
    ${insight ? renderInsightSections(insight) : ''}`;
}

function renderAllServiceSections() {
  const domains = D().serviceDomains || [];
  domains.forEach(domain => {
    (domain.services || []).forEach(svc => {
      renderServiceDetail(svc, domain, `svc-${svc.serviceId}-content`);
    });
  });
}
// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initTabs();

  renderOverview();
  renderAgentTeams();
  renderServiceIntelligence();
  renderAllServiceSections();
});
