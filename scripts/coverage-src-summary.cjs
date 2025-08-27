const fs = require('fs');
const path = require('path');

const coverageFile = path.resolve(__dirname, '..', 'coverage', 'coverage-final.json');
if (!fs.existsSync(coverageFile)) {
  console.error('coverage-final.json não encontrado. Rode: npm test -- --coverage');
  process.exit(1);
}

const raw = fs.readFileSync(coverageFile, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error('Falha ao parsear coverage-final.json:', e && e.message ? e.message : e);
  process.exit(2);
}

const entries = Object.entries(data || {});

const totals = {
  lines: { total: 0, covered: 0 },
  statements: { total: 0, covered: 0 },
  branches: { total: 0, covered: 0 },
  functions: { total: 0, covered: 0 }
};

function isInSrc(filePath) {
  if (!filePath) return false;
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.includes('/src/');
}

for (const [key, item] of entries) {
  // item can be either a metrics object (with .lines/.statements) or the detailed map format (with s/f/b)
  const filepath = (item && item.path) || key;
  if (!isInSrc(filepath)) continue;

  // Case A: already summarized metrics (jest Istanbul summary)
  if (item && item.lines && item.statements && item.branches && item.functions) {
    totals.lines.total += item.lines.total || 0;
    totals.lines.covered += item.lines.covered || 0;
    totals.statements.total += item.statements.total || 0;
    totals.statements.covered += item.statements.covered || 0;
    totals.branches.total += item.branches.total || 0;
    totals.branches.covered += item.branches.covered || 0;
    totals.functions.total += item.functions.total || 0;
    totals.functions.covered += item.functions.covered || 0;
    continue;
  }

  // Case B: detailed maps (s/f/b) from istanbul's raw report
  const s = (item && item.s) || {};
  const f = (item && item.f) || {};
  const b = (item && item.b) || {};

  const stmtKeys = Object.keys(s);
  totals.statements.total += stmtKeys.length;
  totals.statements.covered += stmtKeys.reduce((acc, k) => acc + (s[k] > 0 ? 1 : 0), 0);

  const fnKeys = Object.keys(f);
  totals.functions.total += fnKeys.length;
  totals.functions.covered += fnKeys.reduce((acc, k) => acc + (f[k] > 0 ? 1 : 0), 0);

  const branchKeys = Object.keys(b);
  branchKeys.forEach((bk) => {
    const counts = b[bk] || [];
    totals.branches.total += counts.length;
    totals.branches.covered += counts.reduce((acc, c) => acc + (c > 0 ? 1 : 0), 0);
  });

  // lines approximation: use statements as proxy if explicit lines not present
  totals.lines.total += stmtKeys.length;
  totals.lines.covered += stmtKeys.reduce((acc, k) => acc + (s[k] > 0 ? 1 : 0), 0);
}

function pct(covered, total) {
  if (total === 0) return 'n/a';
  return `${((covered / total) * 100).toFixed(2)}% (${covered}/${total})`;
}

console.log('Coverage for files under src/ (aggregated):');
console.log(`Lines:      ${pct(totals.lines.covered, totals.lines.total)}`);
console.log(`Statements: ${pct(totals.statements.covered, totals.statements.total)}`);
console.log(`Branches:   ${pct(totals.branches.covered, totals.branches.total)}`);
console.log(`Functions:  ${pct(totals.functions.covered, totals.functions.total)}`);

process.exit(0);
