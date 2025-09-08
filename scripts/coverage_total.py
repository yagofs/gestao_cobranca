import os
import sys
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(__file__))
cov_dir = os.path.join(ROOT, 'coverage')
reports_dir = os.path.join(ROOT, 'reports')
os.makedirs(reports_dir, exist_ok=True)

py_reports = [
    os.path.join(cov_dir, 'coverage-unit.xml'),
    os.path.join(cov_dir, 'coverage.xml'),
]
lcov_file = os.path.join(cov_dir, 'lcov.info')

def sum_py(xml_path):
    if not os.path.exists(xml_path):
        return 0, 0
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()
        covered = 0
        total = 0
        # Sum over all line elements
        for line in root.findall('.//line'):
            total += 1
            hits = int(line.get('hits', '0'))
            if hits > 0:
                covered += 1
        return covered, total
    except Exception as e:
        print(f"[warn] Falha ao ler {xml_path}: {e}")
        return 0, 0

def sum_lcov(path):
    if not os.path.exists(path):
        return 0, 0
    covered = 0
    total = 0
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                if line.startswith('DA:'):
                    # DA,<line>,<count>
                    parts = line.strip().split(':', 1)[1].split(',')
                    if len(parts) >= 2:
                        count = int(parts[1])
                        total += 1
                        if count > 0:
                            covered += 1
        return covered, total
    except Exception as e:
        print(f"[warn] Falha ao ler {path}: {e}")
        return 0, 0

py_cov = [sum_py(p) for p in py_reports]
py_cov_covered = sum(c for c, t in py_cov)
py_cov_total = sum(t for c, t in py_cov)

js_cov_covered, js_cov_total = sum_lcov(lcov_file)

total_covered = py_cov_covered + js_cov_covered
total_lines = py_cov_total + js_cov_total
pct = (total_covered / total_lines * 100.0) if total_lines else 0.0

def fmt(c, t):
    return f"{c}/{t} ({(c/t*100.0):.2f}%)" if t else "0/0 (n/a)"

summary = []
summary.append("Resumo de Cobertura (linhas):\n")
summary.append(f"- Python (unit + functional): {fmt(py_cov_covered, py_cov_total)}\n")
summary.append(f"- JavaScript/TypeScript (Jest): {fmt(js_cov_covered, js_cov_total)}\n")
summary.append(f"- Total combinado: {total_covered}/{total_lines} ({pct:.2f}%)\n")

text = ''.join(summary)
print(text)

# Grava em arquivo
out_file = os.path.join(reports_dir, 'coverage-summary.txt')
with open(out_file, 'w', encoding='utf-8') as f:
    f.write(text)

# Publica no summary do GitHub Actions, quando disponível
gha_summary = os.environ.get('GITHUB_STEP_SUMMARY')
if gha_summary:
    try:
        with open(gha_summary, 'a', encoding='utf-8') as f:
            f.write('## Cobertura total (Python + JS)\n\n')
            f.write(text)
    except Exception as e:
        print(f"[warn] Falha ao escrever GITHUB_STEP_SUMMARY: {e}")
