const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'coverage', 'coverage-final.json');
if (!fs.existsSync(file)) {
  console.error('coverage-final.json not found at', file);
  process.exit(2);
}

const raw = fs.readFileSync(file, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error('Failed to parse coverage-final.json:', e.message);
  process.exit(2);
}

let totals = {
  statements: { total: 0, covered: 0 },
  functions: { total: 0, covered: 0 },
  branches: { total: 0, covered: 0 },
  lines: { total: 0, covered: 0 },
};

for (const key of Object.keys(data)) {
  const item = data[key];
  const filepath = item.path || key;
  if (!filepath.includes('/src/') && !filepath.includes('\\src\\') && !filepath.endsWith('/src') && !filepath.includes('/src' + path.sep)) continue;

  const s = item.s || {};
  const f = item.f || {};
  const b = item.b || {};

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

  // lines approximate to statements coverage in this report
  totals.lines.total += stmtKeys.length;
  totals.lines.covered += stmtKeys.reduce((acc, k) => acc + (s[k] > 0 ? 1 : 0), 0);
}

function pct(covered, total) {
  if (total === 0) return 'n/a';
  return ((covered / total) * 100).toFixed(2) + '%';
}

console.log('Coverage for files under src/ (aggregated):');
console.log(`Statements: ${totals.statements.covered}/${totals.statements.total} -> ${pct(totals.statements.covered, totals.statements.total)}`);
console.log(`Functions:  ${totals.functions.covered}/${totals.functions.total} -> ${pct(totals.functions.covered, totals.functions.total)}`);
console.log(`Branches:   ${totals.branches.covered}/${totals.branches.total} -> ${pct(totals.branches.covered, totals.branches.total)}`);
console.log(`Lines:      ${totals.lines.covered}/${totals.lines.total} -> ${pct(totals.lines.covered, totals.lines.total)}`);

process.exit(0);
