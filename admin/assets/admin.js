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

  const activeList = services.filter(s => s.status === 'active');

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
    ${activeList.length ? `
    <div class="ov-active-wrap mt-24">
      <div class="ov-active-label">현재 분석 중</div>
      ${activeList.map(s => `
        <div class="ov-active-row">
          <div class="ov-active-name">${s.displayName}</div>
          ${s.currentFocus ? `<div class="ov-active-focus">${s.currentFocus}</div>` : ''}
          ${s.nextAction   ? `<div class="ov-active-action">→ ${s.nextAction}</div>` : ''}
        </div>`).join('')}
    </div>` : ''}`;
}

// ── 조직도 ──
function renderOrgChart() {
  const groups = D().agentGroups || [];
  if (!groups.length) return '';

  const leadership    = groups.find(g => g.id === 'leadership');
  const orchestration = groups.find(g => g.id === 'orchestration');
  const shared        = groups.find(g => g.id === 'shared');
  const expConsistency = groups.find(g => g.id === 'experience-consistency');
  const serviceTeams  = groups.find(g => g.id === 'service-teams');

  const leadAgent = (leadership?.agents || [])[0] || {};
  const orchAgent = (orchestration?.agents || [])[0] || {};

  const sharedCards = (shared?.agents || []).map(a => {
    const displayName = AGENT_NAME_MAP[a.name] || a.name;
    const shortRole   = (a.role || '').split('. ')[0];
    return `
    <div class="mini-agent-card status-${a.status}">
      <div class="mini-agent-header">
        <div class="mini-agent-name">${displayName}</div>
        ${badge(a.status)}
      </div>
      <div class="mini-agent-role">${shortRole}</div>
    </div>`;
  }).join('');

  const teams = serviceTeams?.teams || [];
  const serviceCards = teams.map(t => {
    const isActive   = t.teamStatus === 'active';
    const agentNames = (t.agents || []).map(a => a.name);
    return `
      <div class="service-team-card ${isActive ? 'svc-active' : 'svc-planned'}">
        <div class="stc-header">
          <div class="stc-name">${t.displayName || t.teamName}</div>
          ${badge(t.teamStatus)}
        </div>
        <div class="stc-section">
          <div class="stc-section-label">Leader</div>
          <div class="stc-manager-chip ${isActive ? 'stc-manager-active' : ''}">UX 통합관리 에이전트</div>
        </div>
        <div class="stc-section">
          <div class="stc-section-label">상세 에이전트</div>
          <div class="stc-agents">
            ${agentNames.map(n => `<div class="stc-agent-row">${n}</div>`).join('')}
          </div>
        </div>
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

      <section class="org-section experience-consistency-review">
        <div class="org-section-header">
          <h3>경험 정합성 리뷰</h3>
          <p class="org-section-sub">서비스별 UX 통합관리자의 분석 결과를 수집·관리·연결하여 전체 SaaS 정합성 기준을 정리하는 역할 <span style="font-size:10px;color:var(--gray-400)">Experience Consistency Review</span></p>
        </div>
        <div class="exp-consistency-wrap">
          ${(() => {
            const a = (expConsistency?.agents || [])[0];
            if (!a) return '';
            return `
            <div class="exp-consistency-card">
              <div class="mini-agent-header">
                <div class="mini-agent-name">Experience Consistency Lead</div>
                ${badge(a.status)}
              </div>
              <div class="mini-agent-role">통합 SaaS 정합성 리뷰</div>
            </div>`;
          })()}
        </div>
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
      <strong>UX 통합관리자</strong>는 각 서비스군 카드 안에서 동작하는 역할입니다. 상세 에이전트들의 분석 결과를 바탕으로 서비스군 내 화면 구조·사용 흐름·시각 표현의 불일치와 공통화 후보를 정리합니다. 원본 화면을 다시 분석하지 않으며 상세 에이전트를 대체하지 않습니다.
      <strong>Experience Consistency Lead</strong>는 미래 통합 SaaS 전환 단계에서 활성화되는 예정 역할입니다. 서비스군별 UX 통합관리 결과를 바탕으로 전체 SaaS 관점의 화면 구조, 사용 흐름, 시각 표현 기준을 정리합니다. UX 통합관리자(서비스군 내부)와 역할 범위가 다릅니다.
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
// ── 이미지 모달 ──
function openImageModal(src, title) {
  let modal = document.getElementById('sn-image-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'sn-image-modal';
    modal.className = 'sn-modal-overlay';
    modal.innerHTML = `
      <div class="sn-modal-box">
        <div class="sn-modal-header">
          <span class="sn-modal-title"></span>
          <button class="sn-modal-close" aria-label="닫기">✕</button>
        </div>
        <div class="sn-modal-body">
          <img class="sn-modal-img" src="" alt="">
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.sn-modal-close').addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('open'); });
  }
  modal.querySelector('.sn-modal-title').textContent = title;
  modal.querySelector('.sn-modal-img').src = src;
  modal.querySelector('.sn-modal-img').alt = title;
  modal.classList.add('open');
}

// ── 공유 자료 ──
function renderSharedNotes() {
  const el = document.getElementById('shared-notes-content');
  if (!el) return;

  const notes = [
    {
      tag: '기획 자료',
      title: '통합 관리, 어디까지 하나?',
      desc: '왜 하나의 에이전트가 모든 것을 관리하면 안 되는가, 그리고 이상적인 운영 방향',
      date: '2026-05-21',
      image: 'assets/images/shared-01.png',
    },
  ];

  el.innerHTML = `
    <div class="sn-grid">
      ${notes.map(n => `
        <div class="sn-card${n.image ? ' sn-card-clickable' : ''}" ${n.image ? `data-image="${n.image}" data-title="${n.title}"` : ''}>
          <div class="sn-card-tag">${n.tag}</div>
          <div class="sn-card-title">${n.title}</div>
          <div class="sn-card-desc">${n.desc}</div>
          <div class="sn-card-date">${n.date}${n.image ? '<span class="sn-card-view-hint">클릭하여 보기 →</span>' : ''}</div>
        </div>`).join('')}
      <div class="sn-card sn-card-empty">
        <div class="sn-empty-icon">+</div>
        <div class="sn-empty-label">자료를 추가하려면<br>admin.js의 notes 배열에 항목을 추가하세요.</div>
      </div>
    </div>`;

  el.querySelectorAll('.sn-card-clickable').forEach(card => {
    card.addEventListener('click', () => openImageModal(card.dataset.image, card.dataset.title));
  });
}

function renderServiceIntelligence() {
  const domains = D().serviceDomains || [];
  const el = document.getElementById('service-intelligence-content');
  if (!el) return;
  if (!domains.length) {
    el.innerHTML = `<div class="card" style="text-align:center;padding:48px;color:var(--gray-400)">데이터가 없습니다. 관리자에게 데이터 갱신을 요청하세요.</div>`;
    return;
  }
  const sortedDomains = [...domains].sort((a, b) =>
    (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1)
  );
  el.innerHTML = sortedDomains.map(domain => {
    const rawSvcs = domain.services || [];
    const svcs = [...rawSvcs].sort((a, b) =>
      (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1)
    );
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

// ── 서비스 서머리 렌더링 ──
function renderSSSections(ss, keys) {
  const bl = (items, cls='') =>
    `<ul class="ss-bullet ${cls}">${(items||[]).map(i=>`<li>${i}</li>`).join('')}</ul>`;
  const blk = (n, title, content) =>
    `<div class="ss-block"><div class="ss-block-title">${n}. ${title}</div>${content}</div>`;
  const modeCls   = { install:'ss-mode-install', user:'ss-mode-user', admin:'ss-mode-admin' };
  const modeTagCls= { install:'ss-tag-install',  user:'ss-tag-user',  admin:'ss-tag-admin'  };
  const priCls    = { high:'ss-pri-high', medium:'ss-pri-medium', low:'ss-pri-low' };
  const priLabel  = { high:'우선확인', medium:'검토필요', low:'참고' };
  const rmColor   = { blue:'ss-rm-blue', green:'ss-rm-green', purple:'ss-rm-purple' };
  const featColor = { blue:'ss-feat-blue', purple:'ss-feat-purple', orange:'ss-feat-orange', green:'ss-feat-green', gray:'ss-feat-gray' };

  const R = {
    background: n => blk(n, '기획 배경', `
      <div class="ss-2col">
        <div class="ss-panel">
          <div class="ss-panel-title">현황 및 문제</div>
          ${bl(ss.background?.situation)}
        </div>
        <div class="ss-panel ss-panel-blue">
          <div class="ss-panel-title">핵심 전략 방향</div>
          ${bl(ss.background?.strategy)}
        </div>
      </div>`),

    goals: n => blk(n, '서비스 목표', `
      <div class="ss-goal-list">
        ${(ss.goals||[]).map((g,i)=>`<div class="ss-goal-item"><span class="ss-goal-num">${String(i+1).padStart(2,'0')}</span><span>${g}</span></div>`).join('')}
      </div>`),

    targets: n => {
      const t = ss.targets || {};
      return blk(n, '타겟 사용자', `
        <div class="ss-2col">
          <div class="ss-panel ss-panel-blue">
            <div class="ss-panel-title">${t.primary?.label||'핵심 타겟'}</div>
            <div class="ss-target-name">${t.primary?.name||''}</div>
            <div class="ss-tag-row">${(t.primary?.examples||[]).map(e=>`<span class="ss-tag">${e}</span>`).join('')}</div>
            ${bl(t.primary?.traits,'ss-mt8')}
          </div>
          <div class="ss-panel">
            <div class="ss-panel-title">보조 타겟</div>
            <table class="ss-table"><tbody>
              ${(t.secondary||[]).map(s=>`<tr><td class="ss-td-b">${s.name}</td><td>${s.role}</td></tr>`).join('')}
            </tbody></table>
          </div>
        </div>`);
    },

    vmsComparison: n => blk(n, '기존 VMS vs 신규 클라우드영상시스템', `
      <table class="ss-table">
        <thead><tr><th>구분</th><th>기존 VMS</th><th class="ss-th-new">신규 클라우드영상시스템</th></tr></thead>
        <tbody>
          ${(ss.vmsComparison||[]).map(r=>`
            <tr>
              <td class="ss-td-b">${r.item}</td>
              <td class="ss-td-old">${r.existing}</td>
              <td class="ss-td-new">${r.new}</td>
            </tr>`).join('')}
        </tbody>
      </table>`),

    modes: n => blk(n, '전체 서비스 모드 구조', `
      <p class="ss-mode-why">서비스는 사용 시점과 역할에 따라 세 가지 독립 모드로 분리됩니다. 설치 기사·일반 사용자·서비스 관리자가 각자 필요한 화면에만 집중할 수 있어 혼선 없이 간결한 경험을 제공합니다.</p>
      <div class="ss-3col">
        ${(ss.modes||[]).map(m=>`
          <div class="ss-mode-card ${modeCls[m.id]||''}">
            <div class="ss-mode-title">
              <span class="${modeTagCls[m.id]||'ss-tag-install'} ss-mode-badge">${m.name}</span>
            </div>
            <div class="ss-mode-row"><span class="ss-mode-key">사용 시점</span><span>${m.timing}</span></div>
            <div class="ss-mode-row"><span class="ss-mode-key">주 사용자</span><span>${m.users?.join(', ')||''}</span></div>
            <div class="ss-mode-row"><span class="ss-mode-key">접속 방식</span><span>${m.access}</span></div>
            <div class="ss-mode-row"><span class="ss-mode-key">목적</span><span>${m.purpose}</span></div>
            <div class="ss-mode-menus">
              ${(m.menus||[]).map((mn,i)=>`<span class="ss-menu-chip">${String(i+1).padStart(2,'0')} ${mn}</span>`).join('')}
            </div>
          </div>`).join('')}
      </div>`),

    userJourney: n => blk(n, '전체 유저저니', `
      <div class="ss-table-scroll">
      <table class="ss-table ss-journey-table">
        <thead><tr><th style="width:36px">#</th><th>단계</th><th>모드</th><th>주 사용자</th><th>주요 액션</th><th>결과</th></tr></thead>
        <tbody>
          ${(ss.userJourney||[]).map(j=>{
            const iMode = j.mode.includes('설치') ? 'install' : j.mode.includes('사용') ? 'user' : j.mode.includes('관리') ? 'admin' : '';
            const modeBadge = iMode ? `<span class="ss-jrn-badge ${modeTagCls[iMode]}">${j.mode}</span>` : `<span class="ss-jrn-badge ss-tag-none">${j.mode}</span>`;
            return `<tr>
              <td class="ss-step-num">${j.step}</td>
              <td class="ss-td-b">${j.title}</td>
              <td style="white-space:nowrap">${modeBadge}</td>
              <td>${j.users?.join('<br>')||''}</td>
              <td>${bl(j.actions)}</td>
              <td class="ss-td-result">${j.result}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      </div>`),

    userModeIA: n => {
      const ai = ss.aiSafeService || {};
      const menus = ss.userModeIA || [];
      const diagramHtml = `
        <div class="ss-iad-wrap">
          <div class="ss-iad-root ss-iad-root-user">
            <span class="ss-iad-root-label">사용자 모드</span>
            <span class="ss-iad-root-sub">PC 웹뷰어 · 모바일 앱 / 관제원 · 운영자 · 담당자</span>
          </div>
          <div class="ss-iad-stem"></div>
          <div class="ss-iad-grid">
            ${menus.map(m=>`
              <div class="ss-iad-card">
                <div class="ss-iad-vline"></div>
                <div class="ss-iad-card-head">
                  <span class="ss-iad-num">${m.num}</span>
                  <span class="ss-iad-name">${m.name}</span>
                </div>
                <div class="ss-iad-role">${m.role}</div>
                <div class="ss-iad-items">
                  ${(m.contents||[]).map(c=>`<span class="ss-iad-item">${c}</span>`).join('')}
                </div>
                ${m.aiExamples ? `
                  <div class="ss-iad-ai-label">업종별 AI 추천</div>
                  ${m.aiExamples.map(ex=>`<div class="ss-iad-ai-row"><span class="ss-ai-type">${ex.type}</span><span>${ex.ai.join(' · ')}</span></div>`).join('')}` : ''}
                ${m.extra ? `
                  <div class="ss-iad-ai-label">${m.extra.label}</div>
                  <div class="ss-tag-row">${m.extra.items.map(i=>`<span class="ss-tag">${i}</span>`).join('')}</div>` : ''}
              </div>`).join('')}
          </div>
        </div>`;
      const aiInsetHtml = ai.concept ? `
        <div class="ss-ai-inset">
          <div class="ss-ai-inset-title">AI 안심 서비스 구조</div>
          <div class="ss-ai-concept">${ai.concept}</div>
          <div class="ss-2col ss-mt12">
            <div>
              <div class="ss-sub-label">기술 용어 → 사용자 표현</div>
              <table class="ss-table">
                <thead><tr><th>기술 용어</th><th>사용자 표현</th></tr></thead>
                <tbody>${(ai.termMapping||[]).map(t=>`<tr><td class="ss-td-old">${t.tech}</td><td class="ss-td-new">${t.user}</td></tr>`).join('')}</tbody>
              </table>
            </div>
            <div>
              <div class="ss-sub-label">서비스 흐름</div>
              <div class="ss-flow-list">
                ${(ai.flow||[]).map((f,i)=>`<div class="ss-flow-item"><span class="ss-flow-num">${i+1}</span><span>${f}</span></div>`).join('')}
              </div>
            </div>
          </div>
        </div>` : '';
      const summaryHtml = `
        <div class="ss-mt16">
          <div class="ss-sub-label">메뉴별 주요 제공 기능</div>
          <table class="ss-table">
            <thead><tr><th style="width:110px">메뉴</th><th>주요 기능</th></tr></thead>
            <tbody>
              ${menus.map(m=>`<tr><td class="ss-td-b">${m.name}</td><td>${(m.contents||[]).join(' · ')}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>`;
      return blk(n, '사용자 모드 IA', diagramHtml + aiInsetHtml + summaryHtml);
    },

    installModeIA: n => {
      const menus = ss.installModeIA || [];
      const diagramHtml = `
        <div class="ss-iad-wrap">
          <div class="ss-iad-root ss-iad-root-install">
            <span class="ss-iad-root-label">설치 모드</span>
            <span class="ss-iad-root-sub">태블릿 앱 · 현장 설치 기사 전용</span>
          </div>
          <div class="ss-iad-stem"></div>
          <div class="ss-iad-grid">
            ${menus.map(m=>`
              <div class="ss-iad-card">
                <div class="ss-iad-vline"></div>
                <div class="ss-iad-card-head">
                  <span class="ss-iad-num ss-iad-num-install">${m.num}</span>
                  <span class="ss-iad-name">${m.name}</span>
                </div>
                <div class="ss-iad-items">
                  ${(m.contents||[]).map(c=>`<span class="ss-iad-item">${c}</span>`).join('')}
                </div>
              </div>`).join('')}
          </div>
        </div>`;
      const summaryHtml = `
        <div class="ss-mt16">
          <div class="ss-sub-label">메뉴별 주요 제공 기능</div>
          <table class="ss-table">
            <thead><tr><th style="width:110px">메뉴</th><th>주요 기능</th></tr></thead>
            <tbody>
              ${menus.map(m=>`<tr><td class="ss-td-b">${m.name}</td><td>${(m.contents||[]).join(' · ')}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>`;
      return blk(n, '설치 모드 IA', diagramHtml + summaryHtml);
    },

    aiSafeService: n => {
      const ai = ss.aiSafeService || {};
      return blk(n, 'AI 안심 서비스 구조', `
        <div class="ss-ai-concept">${ai.concept||''}</div>
        <div class="ss-2col ss-mt16">
          <div>
            <div class="ss-sub-label">사용자 표현 변환</div>
            <table class="ss-table">
              <thead><tr><th>기술 용어</th><th>사용자 표현</th></tr></thead>
              <tbody>${(ai.termMapping||[]).map(t=>`<tr><td class="ss-td-old">${t.tech}</td><td class="ss-td-new">${t.user}</td></tr>`).join('')}</tbody>
            </table>
          </div>
          <div>
            <div class="ss-sub-label">AI 안심 서비스 흐름</div>
            <div class="ss-flow-list">
              ${(ai.flow||[]).map((f,i)=>`<div class="ss-flow-item"><span class="ss-flow-num">${i+1}</span><span>${f}</span></div>`).join('')}
            </div>
          </div>
        </div>`);
    },

    algorithmPolicy: n => {
      const ap = ss.algorithmPolicy || {};
      return blk(n, 'AI 알고리즘 설정 정책', `
        <div class="ss-3col">
          ${['installer','user','system'].map(key => {
            const p = ap[key] || {};
            const cls = key==='installer' ? 'ss-pol-install' : key==='user' ? 'ss-pol-user' : 'ss-pol-system';
            return `<div class="ss-pol-card ${cls}">
              <div class="ss-pol-title">${p.label||key}</div>
              <div class="ss-pol-desc">${p.desc||''}</div>
              ${bl(p.tasks)}
            </div>`;
          }).join('')}
        </div>`);
    },

    features: n => blk(n, '주요 제공 기능', `
      <div class="ss-feat-grid">
        ${(ss.features||[]).map(f=>`
          <div class="ss-feat-card ${featColor[f.color]||''}">
            <div class="ss-feat-title">${f.category}</div>
            ${bl(f.items)}
          </div>`).join('')}
      </div>`),

    specs: n => blk(n, '주요 사양', `
      <div class="ss-3col">
        ${(ss.specs||[]).map(s=>`
          <div class="ss-spec-card">
            <div class="ss-spec-title">${s.category}</div>
            ${bl(s.items)}
          </div>`).join('')}
      </div>`),

    strengths: n => blk(n, '특장점', `
      <div class="ss-strength-grid">
        ${(ss.strengths||[]).map(s=>`
          <div class="ss-strength-card">
            <div class="ss-strength-header">
              <span class="ss-strength-num">${s.num}</span>
              <span class="ss-strength-title">${s.title}</span>
              <span class="ss-strength-point">${s.point}</span>
            </div>
            <div class="ss-strength-desc">${s.desc}</div>
          </div>`).join('')}
      </div>`),

    benchmark: n => {
      const bm = ss.benchmark || {};
      return blk(n, '버카다·롬버스 참고점', `
        <div class="ss-3col">
          <div class="ss-panel">
            <div class="ss-panel-title">${bm.verkada?.label||'Verkada'}</div>
            ${bl(bm.verkada?.items)}
          </div>
          <div class="ss-panel">
            <div class="ss-panel-title">${bm.rhombus?.label||'Rhombus'}</div>
            ${bl(bm.rhombus?.items)}
          </div>
          <div class="ss-panel ss-panel-blue">
            <div class="ss-panel-title">당사 적용 방향</div>
            ${bl(bm.adaptation)}
          </div>
        </div>`);
    },

    roadmap: n => blk(n, '단계별 로드맵', `
      <div class="ss-3col">
        ${(ss.roadmap||[]).map(r=>`
          <div class="ss-rm-card ${rmColor[r.color]||'ss-rm-blue'}">
            <div class="ss-rm-phase">${r.phase} <span class="ss-rm-period">${r.period}</span></div>
            <div class="ss-rm-goal">${r.goal}</div>
            <div class="ss-rm-section-title">주요 타겟</div>
            ${bl(r.targets)}
            <div class="ss-rm-section-title">주요 기능</div>
            ${bl(r.features)}
            <div class="ss-rm-biz">${r.bizModel}</div>
          </div>`).join('')}
      </div>`),

    openIssues: n => blk(n, '향후 검토 과제', `
      <div class="ss-issue-list">
        ${(ss.openIssues||[]).map(i=>`
          <div class="ss-issue-item ${priCls[i.priority]||''}">
            <div class="ss-issue-header">
              <span class="ss-issue-id">${i.id}</span>
              <span class="ss-issue-topic">${i.topic}</span>
              <span class="ss-issue-pri ss-pri-badge-${i.priority}">${priLabel[i.priority]||i.priority}</span>
            </div>
            <div class="ss-issue-desc">${i.desc}</div>
          </div>`).join('')}
      </div>`),

    conclusion: () => ss.conclusion ? `<div class="ss-conclusion">${ss.conclusion}</div>` : '',
  };

  let num = 1;
  return keys.map(key => {
    const fn = R[key];
    if (!fn) return '';
    if (key === 'conclusion') return fn();
    return fn(num++);
  }).join('');
}

// ── IA 제안 렌더링 ──
function renderIAProposalSection(ia) {
  const decisionBadge = d => {
    const map = { keep:'ia-dec-keep', add:'ia-dec-add', adapt:'ia-dec-adapt', defer:'ia-dec-defer', reject:'ia-dec-reject', 'needs-review':'ia-dec-hold' };
    const label = { keep:'유지', add:'추가', adapt:'변형', defer:'보류', reject:'제외', 'needs-review':'검토' };
    return `<span class="ia-dec-badge ${map[d]||'ia-dec-defer'}">${label[d]||d}</span>`;
  };
  const prioColor = { P0:'ia-p0', P1:'ia-p1', P2:'ia-p2', Hold:'ia-hold', Reject:'ia-reject' };

  // ── 요약 바 ──
  const ss = ia.specSummary || {};
  const summaryHtml = `
    <div class="ia-summary">
      <div class="ia-summary-left">
        <div class="ia-summary-title">작업 목적</div>
        <div class="ia-summary-desc">기획안(Figma 10장)과 Verkada 벤치마크를 비교해 초기 PC 웹뷰어 IA를 제안합니다.</div>
        <div class="ia-summary-premise">전제: ${ia.premise || ''}</div>
      </div>
      <div class="ia-summary-right">
        <div class="ia-summary-stat-row">
          <span class="ia-stat ia-dec-keep">유지 ${ss.keep||0}</span>
          <span class="ia-stat ia-dec-add">추가 ${ss.add||0}</span>
          <span class="ia-stat ia-dec-adapt">변형 ${ss.adapt||0}</span>
          <span class="ia-stat ia-dec-defer">보류 ${ss.defer||0}</span>
          <span class="ia-stat ia-dec-reject">제외 ${ss.reject||0}</span>
          <span class="ia-stat ia-dec-hold">검토 ${ss.needsReview||0}</span>
        </div>
      </div>
    </div>`;

  // ── IA 트리 렌더러 ──
  const renderIATree = (iaData, colorClass) => {
    if (!iaData) return '';
    const menus = iaData.menus || [];
    return `
      <div class="ia-tree-block">
        <div class="ia-tree-header ${colorClass}">${iaData.label}</div>
        <div class="ia-tree-desc">${iaData.desc || ''}</div>
        <div class="ia-tree-menus">
          ${menus.map((m, mi) => `
            <div class="ia-tree-menu">
              <div class="ia-tree-menu-name">
                <span class="ia-tree-num">${String(mi+1).padStart(2,'0')}</span>
                <span>${m.name}</span>
                <span class="ia-menu-prio ${prioColor[m.priority]||''}">${m.priority}</span>
              </div>
              ${m.note ? `<div class="ia-tree-menu-note">${m.note}</div>` : ''}
              <div class="ia-tree-sub-list">
                ${(m.items||[]).map(item => `<div class="ia-tree-sub">↳ ${item}</div>`).join('')}
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  };

  // ── 고도화 IA (추가 메뉴 목록) ──
  const advancedHtml = (() => {
    const adv = ia.advancedIA;
    if (!adv) return '';
    return `
      <div class="ia-tree-block">
        <div class="ia-tree-header ia-hdr-advanced">${adv.label}</div>
        <div class="ia-tree-desc">${adv.desc || ''}</div>
        <div class="ia-adv-list">
          ${(adv.additions||[]).map(a => `
            <div class="ia-adv-item">
              <div class="ia-adv-menu">${a.menu} <span class="ia-adv-cond">${a.condition}</span></div>
              ${(a.items||[]).map(i => `<div class="ia-tree-sub">↳ ${i}</div>`).join('')}
            </div>`).join('')}
        </div>
      </div>`;
  })();

  // ── 사양 우선순위 테이블 ──
  const specPrio = ia.specPriority || {};
  const renderSpecTable = (prio, items, headerCls) => {
    if (!items || !items.length) return '';
    const rows = items.map(s => `
      <tr>
        <td class="ia-spec-td">${s.spec}</td>
        <td>${decisionBadge(s.decision)}</td>
        <td class="ia-spec-reason">${s.reason}</td>
      </tr>`).join('');
    return `
      <div class="ia-spec-group">
        <div class="ia-spec-group-hdr ${headerCls}">${prio} <span class="ia-spec-count">${items.length}개</span></div>
        <table class="ia-spec-table"><tbody>${rows}</tbody></table>
      </div>`;
  };

  const specHtml = `
    <div class="insight-section">
      <div class="insight-section-title">사양 우선순위</div>
      ${renderSpecTable('P0 — 초기 필수', specPrio.P0, 'ia-p0-hdr')}
      ${renderSpecTable('P1 — 초기 권장', specPrio.P1, 'ia-p1-hdr')}
      ${renderSpecTable('P2 — 고도화', specPrio.P2, 'ia-p2-hdr')}
      ${renderSpecTable('Hold — 정책·기술 확인', specPrio.Hold, 'ia-hold-hdr')}
      ${renderSpecTable('Reject — 제외', specPrio.Reject, 'ia-reject-hdr')}
    </div>`;

  // ── 추가 확인 질문 ──
  const qMap = { critical:'ia-q-critical', high:'ia-q-high', medium:'ia-q-medium' };
  const oqHtml = `
    <div class="insight-section">
      <div class="insight-section-title">추가 확인 질문</div>
      <div class="ia-oq-list">
        ${(ia.openQuestions||[]).map(q => `
          <div class="ia-oq-item ${qMap[q.priority]||''}">
            <div class="ia-oq-hdr">
              <span class="ia-oq-id">${q.id}</span>
              <span class="ia-oq-badge ia-q-badge-${q.priority}">${q.priority==='critical'?'필수확인':q.priority==='high'?'중요':'보통'}</span>
            </div>
            <div class="ia-oq-question">${q.question}</div>
            <div class="ia-oq-impact">→ ${q.impact}</div>
          </div>`).join('')}
      </div>
    </div>`;

  return `
    ${summaryHtml}
    <div class="insight-section">
      <div class="insight-section-title">IA 구조 (3단계)</div>
      <div class="ia-three-col">
        ${renderIATree(ia.minimalIA, 'ia-hdr-minimal')}
        ${renderIATree(ia.recommendedIA, 'ia-hdr-recommended')}
        ${advancedHtml}
      </div>
    </div>
    ${specHtml}
    ${oqHtml}`;
}

// ── 버카다 벤치마크 렌더링 ──
function renderBenchmarkSection(benchmark) {
  const decisionMeta = {
    adopt:  { label: 'adopt',  ko: '채택',    cls: 'bm-adopt'  },
    adapt:  { label: 'adapt',  ko: '조정',    cls: 'bm-adapt'  },
    defer:  { label: 'defer',  ko: '보류',    cls: 'bm-defer'  },
    reject: { label: 'reject', ko: '제외',    cls: 'bm-reject' },
  };

  // summary counts
  const allItems = (benchmark.clusters || []).flatMap(c => c.items || []);
  const counts = { adopt: 0, adapt: 0, defer: 0, reject: 0 };
  allItems.forEach(it => { if (counts[it.decision] !== undefined) counts[it.decision]++; });

  const summaryBar = `
    <div class="bm-summary">
      <div class="bm-summary-desc">${benchmark.summary || ''}</div>
      <div class="bm-summary-pills">
        <span class="bm-pill bm-adopt">${counts.adopt} 채택</span>
        <span class="bm-pill bm-adapt">${counts.adapt} 조정</span>
        <span class="bm-pill bm-defer">${counts.defer} 보류</span>
        <span class="bm-pill bm-reject">${counts.reject} 제외</span>
      </div>
    </div>`;

  const clustersHtml = (benchmark.clusters || []).map(cluster => {
    const rows = (cluster.items || []).map(item => {
      const dm = decisionMeta[item.decision] || decisionMeta.defer;
      return `
        <tr>
          <td class="bm-td-feature">${item.feature}</td>
          <td class="bm-td-spec">${item.verkadaSpec}</td>
          <td class="bm-td-decision"><span class="bm-badge ${dm.cls}">${dm.ko}</span></td>
          <td class="bm-td-rationale">${item.rationale}</td>
        </tr>`;
    }).join('');

    return `
      <div class="insight-section">
        <div class="insight-section-title">${cluster.title}
          ${cluster.note ? `<span class="bm-cluster-note">${cluster.note}</span>` : ''}
        </div>
        <div class="bm-table-scroll">
          <table class="bm-table">
            <thead>
              <tr>
                <th class="bm-th-feature">Verkada 기능</th>
                <th class="bm-th-spec">스펙 요약</th>
                <th class="bm-th-decision">판단</th>
                <th class="bm-th-rationale">S1 적용 근거</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  }).join('');

  return summaryBar + clustersHtml;
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

  const kvTable = (items) => `
    <table class="insight-table"><tbody>
      ${items.map(item => `
        <tr>
          <td class="insight-label">${item.label}</td>
          <td class="insight-value">${item.value}</td>
          <td>${insightBadge(item.status)}</td>
        </tr>`).join('')}
    </tbody></table>`;

  const overview = sec('overview');
  const overviewHtml = overview ? wrap(overview.title, '', kvTable(overview.items)) : '';

  const purpose = sec('purpose');
  const purposeHtml = purpose ? wrap(purpose.title, '', kvTable(purpose.items)) : '';

  const characteristics = sec('characteristics');
  const characteristicsHtml = characteristics ? wrap(characteristics.title, '', kvTable(characteristics.items)) : '';

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
        ${(role.tasks||[]).length ? `<ul class="insight-role-tasks">${role.tasks.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
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

  const features = sec('features');
  const featuresHtml = features ? wrap(features.title, '', `
    <div class="insight-features-grid">
      ${features.items.map(item => `
        <div class="insight-feature-item">
          <div class="insight-feature-name">${item.name} ${insightBadge(item.status)}</div>
          <div class="insight-feature-desc">${item.description}</div>
        </div>`).join('')}
    </div>`) : '';

  const openQuestions = sec('openQuestions');
  const openQuestionsHtml = openQuestions ? wrap(openQuestions.title, '', `
    <div class="insight-oq-list">
      ${openQuestions.items.map(item => `
        <div class="insight-oq-item insight-oq-${item.priority}">
          <div class="insight-oq-header">
            <span class="insight-oq-id">${item.id}</span>
            <span class="insight-oq-topic">${item.topic}</span>
            <span class="insight-oq-badge insight-oq-badge-${item.priority}">${item.priority === 'high' ? '우선' : item.priority === 'mid' ? '중간' : '낮음'}</span>
          </div>
          <div class="insight-oq-question">${item.question}</div>
        </div>`).join('')}
    </div>`) : '';

  // ── 서비스 가이드 패널 컨텐츠 ──
  const serviceGuideContent = `${overviewHtml}${purposeHtml}${usersHtml}${scenariosHtml}${featuresHtml}${characteristicsHtml}${iaHtml}${uxHtml}${openQuestionsHtml}`;

  // ── UX 컨셉 섹션 ──
  const uxConcept = insight.uxConcept || null;
  const uxConceptContent = uxConcept ? `
    ${uxConcept.subtitle ? `<div class="ux-concept-desc">${uxConcept.subtitle}</div>` : ''}
    <div class="ux-concept-figure sn-card-clickable" data-image="${uxConcept.image}" data-title="${uxConcept.title}">
      <img class="ux-concept-img" src="${uxConcept.image}" alt="${uxConcept.title}">
      <div class="ux-concept-hint">클릭하여 크게 보기 →</div>
    </div>` : '';

  // ── 서비스 서머리 섹션 ──
  const svcSummary = sec('serviceSummary');

  // ── DS 적용 계획 섹션 ──
  const dsApp = sec('dsApplication');

  // ── IA 제안 섹션 ──
  const iaProposal = sec('iaProposal');
  const iaProposalContent = iaProposal ? renderIAProposalSection(iaProposal) : '';

  // ── 버카다 벤치마크 섹션 ──
  const benchmark = sec('benchmark');
  const benchmarkPanelContent = benchmark ? renderBenchmarkSection(benchmark) : '';

  if (!svcSummary && !dsApp && !iaProposal && !benchmark && !uxConcept) {
    // 탭 불필요 — 단일 컨테이너
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
        ${serviceGuideContent}
      </div>`;
  }

  const tabGroup = `insight-${insight.serviceId}`;

  // ── svcSummary 있으면 기획방향/UX컨셉/개발사양/향후검토 탭 구조 ──
  if (svcSummary) {
    const planHtml   = renderSSSections(svcSummary, ['background', 'goals', 'roadmap']);
    const uxHtml     = renderSSSections(svcSummary, ['targets', 'vmsComparison', 'modes', 'userJourney', 'userModeIA', 'installModeIA', 'algorithmPolicy']);
    const specBasic  = renderSSSections(svcSummary, ['features', 'specs', 'benchmark']);
    const futureHtml = renderSSSections(svcSummary, ['openIssues', 'conclusion']);
    const journeyImg = svcSummary.journeyImage
      ? `<div class="ss-journey-img-wrap sn-card-clickable" data-image="${svcSummary.journeyImage}" data-title="클라우드 영상시스템 전체 유저저니">
           <img src="${svcSummary.journeyImage}" alt="클라우드 영상시스템 전체 유저저니" class="ss-journey-img">
           <div class="ux-concept-hint">클릭하여 크게 보기 →</div>
         </div>` : '';

    const dsAppPanelContent = dsApp ? `
      ${wrap('적용 범위 요약', '', `
        ${dsApp.summary ? `<div class="dsa-summary">${dsApp.summary}</div>` : ''}
        <table class="insight-table"><tbody>
          ${(dsApp.stats || []).map(item => `
            <tr>
              <td class="insight-label">${item.label}</td>
              <td class="insight-value">${item.value}</td>
              <td><span class="dsa-badge dsa-badge-${item.status}">${item.status === 'confirmed' ? 'applicable' : item.status === 'candidate' ? 'candidate' : 'gap'}</span></td>
            </tr>`).join('')}
        </tbody></table>`)}` : '';

    return `
      <div class="insight-tabs-wrapper">
        <div class="tabs insight-service-tabs" data-group="${tabGroup}">
          <div class="tab active" data-group="${tabGroup}" data-target="plan">기획방향</div>
          <div class="tab" data-group="${tabGroup}" data-target="ux-concept">UX컨셉</div>
          <div class="tab" data-group="${tabGroup}" data-target="spec">개발사양</div>
          <div class="tab" data-group="${tabGroup}" data-target="future">향후검토</div>
          ${iaProposal ? `<div class="tab" data-group="${tabGroup}" data-target="ia-proposal">IA 제안</div>` : ''}
          ${dsApp ? `<div class="tab" data-group="${tabGroup}" data-target="ds-application">DS 적용 계획</div>` : ''}
        </div>

        <div class="tab-panel active" data-group="${tabGroup}" data-panel="plan">
          <div class="insight-container">
            <div class="insight-header">
              <div class="insight-header-title">기획방향</div>
              <div class="insight-header-meta">
                <span>${insight.serviceName}</span>
                <span>작성: ${svcSummary.updatedAt}</span>
              </div>
            </div>
            ${planHtml}
          </div>
        </div>

        <div class="tab-panel" data-group="${tabGroup}" data-panel="ux-concept">
          <div class="insight-container">
            <div class="insight-header">
              <div class="insight-header-title">UX컨셉</div>
              <div class="insight-header-meta">
                <span>${insight.serviceName}</span>
                <span>작성: ${svcSummary.updatedAt}</span>
              </div>
            </div>
            ${journeyImg}
            ${uxHtml}
          </div>
        </div>

        <div class="tab-panel" data-group="${tabGroup}" data-panel="spec">
          <div class="insight-container">
            <div class="insight-header">
              <div class="insight-header-title">개발사양</div>
              <div class="insight-header-meta">
                <span>${insight.serviceName}</span>
                <span>작성: ${svcSummary.updatedAt}</span>
              </div>
            </div>
            <div class="ss-sub-nav">
              <button class="ss-sub-chip active" data-sub="basic">기본정보</button>
              ${benchmark ? `<button class="ss-sub-chip" data-sub="bm">선진사참고</button>` : ''}
            </div>
            <div class="ss-sub-panel active" data-sub="basic">${specBasic}</div>
            ${benchmark ? `<div class="ss-sub-panel" data-sub="bm">${benchmarkPanelContent}</div>` : ''}
          </div>
        </div>

        <div class="tab-panel" data-group="${tabGroup}" data-panel="future">
          <div class="insight-container">
            <div class="insight-header">
              <div class="insight-header-title">향후검토</div>
              <div class="insight-header-meta">
                <span>${insight.serviceName}</span>
                <span>작성: ${svcSummary.updatedAt}</span>
              </div>
            </div>
            ${futureHtml}
          </div>
        </div>

        ${iaProposal ? `
        <div class="tab-panel" data-group="${tabGroup}" data-panel="ia-proposal">
          <div class="insight-container">
            <div class="insight-header">
              <div class="insight-header-title">IA 제안</div>
              <div class="insight-header-meta">
                <span>${iaProposal.basis}</span>
                <span>분석: ${iaProposal.analyzedAt}</span>
              </div>
            </div>
            ${iaProposalContent}
          </div>
        </div>` : ''}

        ${dsApp ? `
        <div class="tab-panel" data-group="${tabGroup}" data-panel="ds-application">
          <div class="insight-container">
            <div class="insight-header">
              <div class="insight-header-title">DS 적용 계획</div>
              <div class="insight-header-meta">
                <span>${insight.serviceName}</span>
                <span>정리: ${dsApp.updatedAt || insight.curatedAt}</span>
                <span>S1_AI_DESIGN_GUIDE V2.4</span>
              </div>
            </div>
            ${dsAppPanelContent}
          </div>
        </div>` : ''}
      </div>`;
  }

  // ── svcSummary 없는 서비스의 기존 탭 구조 ──
  const dsAppPanelContent = dsApp ? `
    ${wrap('적용 범위 요약', '', `
      ${dsApp.summary ? `<div class="dsa-summary">${dsApp.summary}</div>` : ''}
      <table class="insight-table"><tbody>
        ${(dsApp.stats || []).map(item => `
          <tr>
            <td class="insight-label">${item.label}</td>
            <td class="insight-value">${item.value}</td>
            <td><span class="dsa-badge dsa-badge-${item.status}">${item.status === 'confirmed' ? 'applicable' : item.status === 'candidate' ? 'candidate' : 'gap'}</span></td>
          </tr>`).join('')}
      </tbody></table>`)}
    ${wrap('Gap 목록', '', `
      <div class="dsa-gap-list">
        ${(dsApp.gaps || []).map(item => `
          <div class="dsa-gap-item dsa-gap-${item.priority.toLowerCase()}">
            <div class="dsa-gap-header">
              <span class="dsa-gap-id">${item.id}</span>
              <span class="dsa-gap-cat">${item.category}</span>
              <span class="dsa-gap-priority dsa-p-${item.priority.toLowerCase()}">${item.priority}</span>
            </div>
            <div class="dsa-gap-item-name">${item.item}</div>
            <div class="dsa-gap-desc">${item.description}</div>
          </div>`).join('')}
      </div>`)}
    ${wrap('Candidate 검증 필요 항목', '', `
      <div class="dsa-cv-list">
        ${(dsApp.candidates || []).map(item => `
          <div class="dsa-cv-item">
            <div class="dsa-cv-header">
              <span class="dsa-gap-id">${item.id}</span>
              <span class="dsa-cv-item-name">${item.item}</span>
              <span class="dsa-cv-screen">${item.screen}</span>
            </div>
            <div class="dsa-cv-check">→ ${item.checkPoint}</div>
          </div>`).join('')}
      </div>`)}` : '';

  return `
    <div class="insight-tabs-wrapper">
      <div class="tabs insight-service-tabs" data-group="${tabGroup}">
        <div class="tab active" data-group="${tabGroup}" data-target="service-guide">서비스 가이드</div>
        ${uxConcept ? `<div class="tab" data-group="${tabGroup}" data-target="ux-concept">UX 컨셉</div>` : ''}
        ${dsApp ? `<div class="tab" data-group="${tabGroup}" data-target="ds-application">DS 적용 계획</div>` : ''}
        ${iaProposal ? `<div class="tab" data-group="${tabGroup}" data-target="ia-proposal">IA 제안</div>` : ''}
        ${benchmark ? `<div class="tab" data-group="${tabGroup}" data-target="benchmark">버카다 벤치마크</div>` : ''}
      </div>
      <div class="tab-panel active" data-group="${tabGroup}" data-panel="service-guide">
        <div class="insight-container">
          <div class="insight-header">
            <div class="insight-header-title">서비스 가이드</div>
            <div class="insight-header-meta">
              <span>${insight.serviceName}</span>
              <span>정리: ${insight.curatedAt}</span>
              ${insight.sourceRefs?.length ? `<span>${insight.sourceRefs[0]}</span>` : ''}
            </div>
          </div>
          ${serviceGuideContent}
        </div>
      </div>
      ${uxConcept ? `
      <div class="tab-panel" data-group="${tabGroup}" data-panel="ux-concept">
        <div class="insight-container">
          <div class="insight-header">
            <div class="insight-header-title">UX 컨셉 — ${uxConcept.title}</div>
            <div class="insight-header-meta">
              <span>${insight.serviceName}</span>
              <span>정리: ${uxConcept.updatedAt || insight.curatedAt}</span>
            </div>
          </div>
          ${uxConceptContent}
        </div>
      </div>` : ''}
      ${dsApp ? `
      <div class="tab-panel" data-group="${tabGroup}" data-panel="ds-application">
        <div class="insight-container">
          <div class="insight-header">
            <div class="insight-header-title">DS 적용 계획</div>
            <div class="insight-header-meta">
              <span>${insight.serviceName}</span>
              <span>정리: ${dsApp.updatedAt || insight.curatedAt}</span>
              <span>S1_AI_DESIGN_GUIDE V2.4</span>
            </div>
          </div>
          ${dsAppPanelContent}
        </div>
      </div>` : ''}
      ${iaProposal ? `
      <div class="tab-panel" data-group="${tabGroup}" data-panel="ia-proposal">
        <div class="insight-container">
          <div class="insight-header">
            <div class="insight-header-title">IA 제안</div>
            <div class="insight-header-meta">
              <span>${iaProposal.basis}</span>
              <span>분석: ${iaProposal.analyzedAt}</span>
            </div>
          </div>
          ${iaProposalContent}
        </div>
      </div>` : ''}
      ${benchmark ? `
      <div class="tab-panel" data-group="${tabGroup}" data-panel="benchmark">
        <div class="insight-container">
          <div class="insight-header">
            <div class="insight-header-title">버카다 벤치마크</div>
            <div class="insight-header-meta">
              <span>${benchmark.source}</span>
              <span>분석: ${benchmark.analyzedAt}</span>
            </div>
          </div>
          ${benchmarkPanelContent}
        </div>
      </div>` : ''}
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

  // 동적으로 생성된 insight 탭 이벤트 연결
  el.querySelectorAll('.insight-service-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const group = tab.dataset.group;
      const target = tab.dataset.target;
      el.querySelectorAll(`.insight-service-tabs[data-group="${group}"] .tab`).forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      el.querySelectorAll(`.tab-panel[data-group="${group}"]`).forEach(p => p.classList.remove('active'));
      el.querySelector(`.tab-panel[data-group="${group}"][data-panel="${target}"]`)?.classList.add('active');
    });
  });

  // 개발사양 하위 서브칩 탭 전환
  el.querySelectorAll('.ss-sub-nav .ss-sub-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const nav = chip.closest('.ss-sub-nav');
      const container = chip.closest('.insight-container');
      const sub = chip.dataset.sub;
      nav.querySelectorAll('.ss-sub-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      container.querySelectorAll('.ss-sub-panel').forEach(p => p.classList.remove('active'));
      container.querySelector(`.ss-sub-panel[data-sub="${sub}"]`)?.classList.add('active');
    });
  });

  // UX 컨셉 이미지 클릭 시 확대 모달
  el.querySelectorAll('.sn-card-clickable[data-image]').forEach(card => {
    card.addEventListener('click', () => openImageModal(card.dataset.image, card.dataset.title));
  });
}

function renderAllServiceSections() {
  const domains = D().serviceDomains || [];
  domains.forEach(domain => {
    (domain.services || []).forEach(svc => {
      renderServiceDetail(svc, domain, `svc-${svc.serviceId}-content`);
    });
  });
}
// ── 에이전트 활동보고서 ──
function renderAgentActivityReport() {
  const el = document.getElementById('agent-activity-content');
  if (!el) return;

  const REPORT = {
    generatedAt: '2026-05-21',
    summary: { totalAgents: 26, high: 4, medium: 2, low: 20, totalOutputFiles: 85 },
    agents: [
      { id: 'main-orchestrator',             displayName: '실무 오케스트레이터',        layer: 'orchestration', service: '전체',       status: 'active',   roleDesc: '작업 흐름·단계 관리, Gate Check, 다음 액션 결정',            outputCount: 1,  usageLevel: 'high',   usageType: 'role_reflected',  evidenceSummary: 'service-intelligence-status.md',             issues: null,                                                                       recommendation: 'keep'    },
      { id: 's1-service-intelligence-lead',  displayName: '서비스 통합 리더',           layer: 'leadership',    service: '전체',       status: 'standby',  roleDesc: '복수 서비스 맥락 통합 이해, 공통화 판단',                   outputCount: 0,  usageLevel: 'low',    usageType: 'documented_only', evidenceSummary: '활성화 조건 미충족 (현재 서비스 1개)',               issues: null,                                                                       recommendation: 'keep'    },
      { id: 'ui-reader',                     displayName: '화면 구조 분석',             layer: 'shared',        service: '전체',       status: 'active',   roleDesc: '화면 구조·레이아웃·컴포넌트·정보 밀도 분석',               outputCount: 22, usageLevel: 'high',   usageType: 'explicit_prompt', evidenceSummary: 'screen-analysis/ 14개, menu-understanding/ 8개', issues: null,                                                                       recommendation: 'keep'    },
      { id: 'ux-checker',                    displayName: 'UX 검수',                    layer: 'shared',        service: '전체',       status: 'active',   roleDesc: '관제 업무 흐름·사용성·리스크 검수',                         outputCount: 12, usageLevel: 'high',   usageType: 'explicit_prompt', evidenceSummary: 'validation-reports/ 12개',                        issues: 'ux-check/ 폴더 미생성 — 검수 결과가 분석 문서 안에 혼재',                 recommendation: 'clarify' },
      { id: 'ds-mapper',                     displayName: 'DS 매핑',                    layer: 'shared',        service: '전체',       status: 'standby',  roleDesc: '기존 UI 요소를 디자인시스템 컴포넌트·토큰 기준으로 매핑',  outputCount: 2,  usageLevel: 'low',    usageType: 'documented_only', evidenceSummary: '산출물 내 "진행 필요" 언급 23회, 실행 0회',        issues: 'A5 디자이너 검증 완료 전까지 실행 보류 (deferred)',                        recommendation: 'clarify' },
      { id: 'research-synthesizer',          displayName: '분석 결과 종합',             layer: 'shared',        service: '전체',       status: 'standby',  roleDesc: '복수 화면·자료 교차 분석 결과 종합',                        outputCount: 0,  usageLevel: 'low',    usageType: 'documented_only', evidenceSummary: '복수 서비스 분석 완료 후 활성화 예정',               issues: null,                                                                       recommendation: 'keep'    },
      { id: 'pattern-librarian',             displayName: '패턴 관리',                  layer: 'shared',        service: '전체',       status: 'standby',  roleDesc: '서비스 간 공통 패턴 비교·승격 조건 추적',                  outputCount: 0,  usageLevel: 'low',    usageType: 'documented_only', evidenceSummary: 'pattern-candidates.json 구조만 준비',               issues: null,                                                                       recommendation: 'keep'    },
      { id: 'service-guide-curator',         displayName: '서비스 가이드 정리',         layer: 'shared',        service: '전체',       status: 'active',   roleDesc: '분석 결과를 바탕으로 서비스 가이드 작성',                  outputCount: 3,  usageLevel: 'medium', usageType: 'explicit_prompt', evidenceSummary: 'cloud-video/service-guide/ 3개',                  issues: null,                                                                       recommendation: 'keep'    },
      { id: 'mobility-reader',               displayName: '이동체관제 화면 분석',       layer: 'service',       service: '이동체서비스', status: 'active',  roleDesc: '지도·차량·이벤트·이상상황·조치 흐름 중심 화면 분석',       outputCount: 22, usageLevel: 'high',   usageType: 'explicit_prompt', evidenceSummary: 'screen-analysis/ 10개, menu-understanding/ 6개',  issues: null,                                                                       recommendation: 'keep'    },
      { id: 'pattern-finder',                displayName: '이동체 패턴 추출',           layer: 'service',       service: '이동체서비스', status: 'standby', roleDesc: '반복 레이아웃·패널 구성·알림 표현 패턴 추출',              outputCount: 3,  usageLevel: 'medium', usageType: 'role_reflected',  evidenceSummary: 'comparison/ 2개, pattern-candidates 1건 등록',    issues: '산출물에 generatedBy 필드 없어 추적성 약함',                               recommendation: 'clarify' },
      { id: 'screen-maker',                  displayName: '이동체 화면 제안',           layer: 'service',       service: '이동체서비스', status: 'planned', roleDesc: '신규 화면 구조·컴포넌트 트리·토큰 매핑 초안 생성',         outputCount: 0,  usageLevel: 'low',    usageType: 'documented_only', evidenceSummary: 'DS 매핑 완료 후 활성화 예정',                      issues: 'ds-mapper 활성화 대기로 이중 블로킹',                                      recommendation: 'keep'    },
      { id: 'video-service-reader',          displayName: '영상서비스 화면 분석',       layer: 'service',       service: '영상서비스',  status: 'planned',  roleDesc: '영상서비스 화면 구조 분석',                                 outputCount: 0,  usageLevel: 'low',    usageType: 'documented_only', evidenceSummary: '화면 자료 제공 및 승인 대기',                      issues: null,                                                                       recommendation: 'keep'    },
      { id: 'video-legacy-component-extractor', displayName: '레거시 컴포넌트 추출',   layer: 'service',       service: '영상서비스',  status: 'planned',  roleDesc: 'SW(Thick Client) 컴포넌트 추출·Web 전환 후보 목록',        outputCount: 0,  usageLevel: 'low',    usageType: 'documented_only', evidenceSummary: '선행 에이전트 활성화 대기',                         issues: null,                                                                       recommendation: 'keep'    },
      { id: 'video-layout-workflow-mapper',  displayName: '영상 레이아웃·업무흐름 매핑', layer: 'service',     service: '영상서비스',  status: 'planned',  roleDesc: '레이아웃 패턴 추출, 운영자 업무 흐름 분석',                outputCount: 0,  usageLevel: 'low',    usageType: 'documented_only', evidenceSummary: '선행 에이전트 활성화 대기',                         issues: null,                                                                       recommendation: 'keep'    },
      { id: 'video-pattern-finder',          displayName: '영상 패턴 추출',             layer: 'service',       service: '영상서비스',  status: 'planned',  roleDesc: '영상서비스 반복 패턴 탐색 및 service-candidate 등록',       outputCount: 0,  usageLevel: 'low',    usageType: 'documented_only', evidenceSummary: '선행 에이전트 활성화 대기',                         issues: null,                                                                       recommendation: 'keep'    },
      { id: 'video-web-transition-designer', displayName: '웹전환 설계',                layer: 'service',       service: '영상서비스',  status: 'planned',  roleDesc: 'SW→Web 전환 방향 제안, 레거시 컴포넌트 대응 방안',         outputCount: 0,  usageLevel: 'low',    usageType: 'documented_only', evidenceSummary: '웹 전환 방향 확정 후 활성화',                       issues: null,                                                                       recommendation: 'keep'    },
      { id: 'video-screen-maker',            displayName: '영상 화면 제안',             layer: 'service',       service: '영상서비스',  status: 'planned',  roleDesc: '영상서비스 신규 화면 구성안 작성',                          outputCount: 0,  usageLevel: 'low',    usageType: 'documented_only', evidenceSummary: '선행 단계 전부 완료 후 활성화',                     issues: null,                                                                       recommendation: 'keep'    },
    ],
    futureGroups: [
      { service: '출입관리서비스',      count: 4 },
      { service: '빌딩관리서비스',      count: 4 },
      { service: '통합앱서비스 (모두앱)', count: 5 },
      { service: '경험 정합성 리뷰',    count: 1 },
    ],
    projects: [
      { name: '이동체서비스 (UVIS)',    phase: 'A5 디자이너 검증 중',    outputCount: 78, status: 'active',  progress: 85 },
      { name: '클라우드영상시스템',     phase: '서비스 가이드 작성 중',   outputCount: 3,  status: 'active',  progress: 20 },
      { name: '영상서비스 (SVMS)',      phase: '화면 자료 제공 대기',     outputCount: 0,  status: 'planned', progress: 0  },
      { name: '출입·빌딩·통합앱',       phase: '분석 미시작',             outputCount: 0,  status: 'planned', progress: 0  },
    ],
    analysisNotes: [
      { type: 'gap',     title: 'UX 검수 산출물 공백',  desc: 'ux-checker가 active 상태이나 전용 폴더(ux-check/)가 미생성. 검수 결과가 분석 문서 안에 혼재되어 독립 이력 추적이 어려움.' },
      { type: 'gap',     title: 'DS 매핑 진행 지연',    desc: 'ds-mapper가 산출물 내 "다음 단계"로 23회 언급됐으나 A5 검증 대기로 한 번도 실행되지 않음. 완료 일정 확정 필요.' },
      { type: 'overlap', title: '화면 분석 역할 분화',  desc: 'ui-reader(범용)와 mobility-reader(이동체관제 특화)는 의도적 분화. 겹침이 아닌 계층적 전문화 구조.' },
      { type: 'overlap', title: '패턴 역할 분화',       desc: 'pattern-finder(서비스 내 발견)와 pattern-librarian(서비스 간 관리)은 의도적 분화. 현재는 pattern-finder만 활동 중.' },
    ],
    nextActions: [
      { priority: 'high',   label: 'ux-checker 산출물 폴더 생성',      desc: 'outputs/mobility/ux-check/ 폴더 생성 후 기존 검수 결과 독립 파일로 정리', owner: 'ux-checker'          },
      { priority: 'high',   label: 'A5 디자이너 검증 완료 일정 확정',  desc: 'ds-mapper 활성화 선행 조건. 완료 후 DS 매핑 재개 및 screen-maker 블로킹 해제', owner: 'ds-mapper'         },
      { priority: 'medium', label: '영상서비스 화면 자료 수령 협의',    desc: 'video-service-reader 활성화를 위한 화면 자료 및 사용자 승인 필요', owner: 'video-service-reader' },
      { priority: 'low',    label: 'pattern-finder 산출물 메타데이터 보강', desc: 'comparison/, validation-reports/ 파일에 generatedBy 필드 추가', owner: 'pattern-finder'      },
    ],
  };

  // ── 헬퍼 ──
  const usageLevelBadge = lvl => {
    const m = { high: ['ar-badge-high', '활발히 활용 중'], medium: ['ar-badge-medium', '일부 활용 중'], low: ['ar-badge-low', '활용 근거 약함'], unclear: ['ar-badge-unclear', '판단 불명확'] };
    const [cls, label] = m[lvl] || m.unclear;
    return `<span class="ar-badge ${cls}">${label}</span>`;
  };
  const usageTypeBadge = t => {
    const m = { explicit_prompt: ['ar-type-ep', '프롬프트 명시'], role_reflected: ['ar-type-rr', '산출물 반영'], documented_only: ['ar-type-do', '문서 정의만'], unclear: ['ar-type-uc', '불명확'] };
    const [cls, label] = m[t] || m.unclear;
    return `<span class="ar-type-badge ${cls}">${label}</span>`;
  };
  const recoBadge = r => {
    const m = { keep: ['ar-rec-keep', '유지'], merge: ['ar-rec-merge', '통합 검토'], rename: ['ar-rec-rename', '이름 조정'], clarify: ['ar-rec-clarify', '역할 보강'], archive: ['ar-rec-archive', '보관'], promote: ['ar-rec-promote', '승격'] };
    const [cls, label] = m[r] || ['ar-rec-keep', r];
    return `<span class="ar-rec-badge ${cls}">${label}</span>`;
  };
  const priorityBadge = p => {
    const m = { high: ['ar-pri-high', '우선'], medium: ['ar-pri-med', '권장'], low: ['ar-pri-low', '선택'] };
    const [cls, label] = m[p] || ['ar-pri-low', p];
    return `<span class="ar-pri-badge ${cls}">${label}</span>`;
  };
  const layerLabel = l => ({ orchestration: '총괄', leadership: '리더십', shared: '공통', service: '서비스' }[l] || l);

  const { summary, agents, futureGroups, projects, analysisNotes, nextActions } = REPORT;
  const futureTotal = futureGroups.reduce((s, g) => s + g.count, 0);

  // ── 에이전트 테이블 행 생성 (레이어별) ──
  const layers = ['orchestration', 'leadership', 'shared', 'service'];
  const layerNames = { orchestration: '총괄 (Orchestration)', leadership: '리더십 (Leadership)', shared: '공통 분석 역할 (Shared)', service: '서비스별 분석 팀 (Service)' };

  const agentRows = layers.map(layer => {
    const group = agents.filter(a => a.layer === layer);
    if (!group.length) return '';
    return `
      <tr class="ar-table-group-row">
        <td colspan="7" class="ar-table-group-label">${layerNames[layer]}</td>
      </tr>
      ${group.map(a => `
      <tr class="ar-table-row ${a.issues ? 'ar-has-issue' : ''}">
        <td class="ar-td-name">
          <div class="ar-agent-name">${a.displayName}</div>
          <div class="ar-agent-role-short">${a.roleDesc}</div>
          ${a.issues ? `<div class="ar-agent-issue">⚠ ${a.issues}</div>` : ''}
        </td>
        <td>${badge(a.status)}</td>
        <td><span class="ar-service-tag">${a.service}</span></td>
        <td class="ar-td-center">${a.outputCount > 0 ? `<strong>${a.outputCount}</strong>` : '<span class="ar-zero">0</span>'}</td>
        <td>${usageLevelBadge(a.usageLevel)}</td>
        <td>${usageTypeBadge(a.usageType)}</td>
        <td>${recoBadge(a.recommendation)}</td>
      </tr>`).join('')}`;
  }).join('');

  // ── 프로젝트 카드 ──
  const projectCards = projects.map(p => `
    <div class="ar-project-card ${p.status === 'active' ? 'ar-proj-active' : 'ar-proj-planned'}">
      <div class="ar-project-header">
        <span class="ar-project-name">${p.name}</span>
        ${badge(p.status)}
      </div>
      <div class="ar-project-phase">${p.phase}</div>
      <div class="ar-progress-bar-wrap">
        <div class="ar-progress-bar" style="width:${p.progress}%"></div>
      </div>
      <div class="ar-project-meta">
        <span>산출물 ${p.outputCount}개</span>
        <span class="ar-progress-pct">${p.progress}%</span>
      </div>
    </div>`).join('');

  // ── 분석 노트 (역할 공백·겹침) ──
  const noteCards = analysisNotes.map(n => `
    <div class="ar-note-card ar-note-${n.type}">
      <div class="ar-note-type">${n.type === 'gap' ? '역할 공백' : '역할 분화'}</div>
      <div class="ar-note-title">${n.title}</div>
      <div class="ar-note-desc">${n.desc}</div>
    </div>`).join('');

  // ── 다음 액션 ──
  const actionItems = nextActions.map(a => `
    <div class="ar-action-item">
      <div class="ar-action-header">
        ${priorityBadge(a.priority)}
        <span class="ar-action-label">${a.label}</span>
      </div>
      <div class="ar-action-desc">${a.desc}</div>
      <div class="ar-action-owner">담당: ${a.owner}</div>
    </div>`).join('');

  el.innerHTML = `
    <div class="ar-disclaimer">
      현재 파일 기준 진단 · 호출 로그가 없으므로 산출물 파일과 프롬프트 정의를 근거로 판단했습니다 · ${REPORT.generatedAt} 기준
    </div>

    <!-- 요약 카드 -->
    <div class="ar-summary-grid">
      <div class="ar-summary-card">
        <div class="ar-summary-label">정의된 에이전트</div>
        <div class="ar-summary-value">${summary.totalAgents + futureTotal}</div>
        <div class="ar-summary-sub">현재 운영 ${summary.totalAgents}개 · 미래 계획 ${futureTotal}개</div>
      </div>
      <div class="ar-summary-card ar-summary-high">
        <div class="ar-summary-label">활발히 활용 중</div>
        <div class="ar-summary-value">${summary.high}</div>
        <div class="ar-summary-sub">산출물·프롬프트에서 역할 확인됨</div>
      </div>
      <div class="ar-summary-card ar-summary-medium">
        <div class="ar-summary-label">일부 활용 중</div>
        <div class="ar-summary-value">${summary.medium}</div>
        <div class="ar-summary-sub">제한적 산출물 또는 대기 중</div>
      </div>
      <div class="ar-summary-card ar-summary-low">
        <div class="ar-summary-label">활용 근거 약함</div>
        <div class="ar-summary-value">${summary.low}</div>
        <div class="ar-summary-sub">문서 정의만 존재 또는 미시작</div>
      </div>
      <div class="ar-summary-card">
        <div class="ar-summary-label">총 산출물 파일</div>
        <div class="ar-summary-value">${summary.totalOutputFiles}</div>
        <div class="ar-summary-sub">분석 문서·메타데이터·검수 리포트</div>
      </div>
    </div>

    <!-- 프로젝트별 진행 현황 -->
    <div class="ar-section-title">프로젝트별 진행 현황</div>
    <div class="ar-project-grid">${projectCards}</div>

    <!-- 에이전트별 활동 현황 -->
    <div class="ar-section-title" style="margin-top:32px">에이전트별 활동 현황</div>
    <div class="ar-table-wrap">
      <table class="ar-table">
        <thead>
          <tr>
            <th>에이전트</th>
            <th>상태</th>
            <th>서비스</th>
            <th class="ar-td-center">산출물</th>
            <th>활용도</th>
            <th>활용 유형</th>
            <th>추천</th>
          </tr>
        </thead>
        <tbody>${agentRows}</tbody>
      </table>
    </div>

    <!-- 미래 계획 에이전트 -->
    <div class="ar-future-wrap">
      <div class="ar-future-label">미래 계획 에이전트 (총 ${futureTotal}개) — 분석 미시작</div>
      <div class="ar-future-chips">
        ${futureGroups.map(g => `<span class="ar-future-chip">${g.service} <strong>${g.count}명</strong></span>`).join('')}
      </div>
    </div>

    <!-- 역할 공백·분화 분석 -->
    <div class="ar-section-title" style="margin-top:32px">역할 공백 · 분화 분석</div>
    <div class="ar-notes-grid">${noteCards}</div>

    <!-- 다음 개선 액션 -->
    <div class="ar-section-title" style="margin-top:32px">다음 개선 액션</div>
    <div class="ar-actions-list">${actionItems}</div>
  `;
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initTabs();

  renderOverview();
  renderAgentTeams();
  renderAgentActivityReport();
  renderSharedNotes();
  renderServiceIntelligence();
  renderAllServiceSections();
});
