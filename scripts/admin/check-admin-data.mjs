/**
 * check-admin-data.mjs
 * generated 파일 무결성, 경로 참조, 후보 상태 일관성을 확인합니다.
 * 실행: npm run admin:check
 */

import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../');
const UVIS_ROOT = resolve(ROOT, '../s1-mobility-uvis-workspace');

let errors = 0;
let warnings = 0;

function ok(msg) { console.log(`  [OK] ${msg}`); }
function warn(msg) { console.warn(`  [WARN] ${msg}`); warnings++; }
function fail(msg) { console.error(`  [FAIL] ${msg}`); errors++; }

function checkFile(relPath, base = ROOT, required = true) {
  const abs = resolve(base, relPath);
  if (existsSync(abs)) { ok(relPath); return true; }
  if (required) fail(`파일 없음: ${relPath}`);
  else warn(`파일 없음 (optional): ${relPath}`);
  return false;
}

function run() {
  console.log('\n[check] S1 Service Intelligence Admin 데이터 검증 시작\n');

  console.log('── Registry 파일 존재 확인 ──');
  checkFile('registry/service-index/services.json');
  checkFile('registry/service-index/service-workspaces.json');
  checkFile('registry/service-index/agent-teams.json');
  checkFile('registry/cross-service/service-agent-index.json');
  checkFile('registry/cross-service/service-context-map.json');
  checkFile('registry/cross-service/pattern-candidates.json');
  checkFile('registry/cross-service/user-role-map.json');
  checkFile('registry/cross-service/task-flow-map.json');

  console.log('\n── Generated 파일 존재 확인 ──');
  checkFile('admin/data/admin-data.bundle.js');
  checkFile('generated/admin/admin-data.bundle.js', ROOT, false);

  console.log('\n── UVIS 원본 파일 참조 확인 ──');
  checkFile('registry/services/mobility/mobility-layout-modules.json', UVIS_ROOT);
  checkFile('registry/services/mobility/mobility-domain-patterns.json', UVIS_ROOT);
  checkFile('outputs/mobility/module-metadata/uvis-vehicle-location-layout-modules.json', UVIS_ROOT);
  checkFile('dashboard/index.html', UVIS_ROOT);

  console.log('\n── UVIS cross-service README 확인 (이동 안내) ──');
  checkFile('registry/cross-service/README.md', UVIS_ROOT);

  console.log('\n── Pattern Candidate 상태 일관성 ──');
  const pcPath = resolve(ROOT, 'registry/cross-service/pattern-candidates.json');
  if (existsSync(pcPath)) {
    const pc = JSON.parse(readFileSync(pcPath, 'utf-8'));
    for (const c of pc.candidates || []) {
      if (c.commonPromotion === 'approved' && c.foundIn.length < 2) {
        fail(`[pattern] ${c.id}: 단일 서비스에서 common-approved — 근거 부족`);
      } else {
        ok(`[pattern] ${c.id}: status=${c.status}, commonPromotion=${c.commonPromotion}`);
      }
    }
  }

  console.log('\n── 결과 ──');
  console.log(`  errors: ${errors}, warnings: ${warnings}`);
  if (errors > 0) { console.error('\n[FAIL] 검증 실패'); process.exit(1); }
  else if (warnings > 0) { console.warn('\n[WARN] 경고 있음 — 검토 권장'); }
  else { console.log('\n[OK] 모든 검증 통과'); }
}

run();
