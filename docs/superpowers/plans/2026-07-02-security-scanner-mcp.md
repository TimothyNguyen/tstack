# Security Scanner MCP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port `aws-samples/sample-mcp-security-scanner` into `agent-architecture/packages/skills/security-scanner/` as a pure FastMCP server with Docker support, 95% test coverage, and agent-architecture integration for `/security`, `/swe`, and `/qa-agent`.

**Architecture:** Monolithic 1200-line `server.py` split into focused scanner modules (`checkov.py`, `semgrep.py`, `bandit.py`, `ash.py`) and a `report_generator.py`. `server.py` owns only FastMCP init, tool registration, and the `handle_exceptions` decorator. Docker multi-stage build: `base` (core tools) and `full` (+ Ruby/Node for ASH).

**Tech Stack:** Python 3.12, FastMCP (`mcp[cli]>=1.11.0`), Checkov >=3.0.0, Semgrep >=1.45.0, Bandit >=1.7.5, pytest-cov >=95%, Docker (python:3.12-slim base), SSE transport on port 8765 in container / stdio locally.

## Global Constraints

- Python >=3.10
- `mcp[cli]>=1.11.0` (FastMCP from `mcp.server.fastmcp`)
- `checkov>=3.0.0`, `semgrep>=1.45.0`, `bandit>=1.7.5`, `loguru>=0.6.0`, `pydantic>=2.0.0`
- Coverage gate: `--cov-fail-under=95` applied to `security_scanner` package
- No Strands, no Ollama, no Bedrock, no SQLite
- Directory scan tools write results to `.security-reports/<tool>/<timestamp>.json`
- MCP transport: `sse` (port 8765) when `MCP_TRANSPORT=sse`, `stdio` otherwise
- All paths below are relative to `agent-architecture/packages/skills/security-scanner/`
- Conventional Commits: `feat:`, `test:`, `chore:` prefixes

---

## File Map

```
agent-architecture/packages/skills/security-scanner/
├── security_scanner/
│   ├── __init__.py
│   ├── server.py              # FastMCP instance, tool registration, handle_exceptions, main()
│   ├── report_generator.py   # generate_report(project_name, scan_results_json) -> Dict
│   └── scanners/
│       ├── __init__.py
│       ├── checkov.py         # run_checkov_scan, run_directory_checkov_scan, _parse_checkov_output
│       ├── semgrep.py         # run_semgrep_scan, run_directory_semgrep_scan, _parse_semgrep_output
│       ├── bandit.py          # run_bandit_scan, run_directory_bandit_scan, _parse_bandit_output
│       └── ash.py             # check_ash_available, run_ash_scan
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   │   ├── __init__.py
│   │   ├── test_checkov.py
│   │   ├── test_semgrep.py
│   │   ├── test_bandit.py
│   │   ├── test_ash.py
│   │   ├── test_report_generator.py
│   │   └── test_server.py
│   └── integration/
│       ├── __init__.py
│       ├── fixtures/
│       │   ├── insecure.tf
│       │   ├── insecure.py
│       │   ├── insecure.js
│       │   └── insecure_k8s.yaml
│       ├── test_checkov_integration.py
│       ├── test_semgrep_integration.py
│       └── test_bandit_integration.py
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── SKILL.md
├── SKILL.md.tmpl
└── mcp.json
```

Modify:
- `agent-architecture/packages/skills/package.json` — add `"security-scanner/"` to `files[]`

---

### Task 1: Package Scaffold

**Files:**
- Create: `pyproject.toml`
- Create: `security_scanner/__init__.py`
- Create: `security_scanner/scanners/__init__.py`
- Create: `tests/__init__.py`
- Create: `tests/unit/__init__.py`
- Create: `tests/integration/__init__.py`
- Create: `tests/conftest.py`
- Create: `SKILL.md`
- Create: `SKILL.md.tmpl`
- Create: `mcp.json`

**Interfaces:**
- Produces: `pyproject.toml` with `[tool.pytest.ini_options]` coverage gate at 95%; `tests/conftest.py` registering `integration` marker

- [ ] **Step 1: Create package directory**

```bash
mkdir -p agent-architecture/packages/skills/security-scanner/security_scanner/scanners
mkdir -p agent-architecture/packages/skills/security-scanner/tests/unit
mkdir -p agent-architecture/packages/skills/security-scanner/tests/integration/fixtures
```

- [ ] **Step 2: Write pyproject.toml**

Create `pyproject.toml`:

```toml
[project]
name = "security-scanner"
version = "0.1.0"
description = "MCP server for security scanning — Checkov, Semgrep, Bandit, ASH"
requires-python = ">=3.10"
dependencies = [
    "checkov>=3.0.0",
    "semgrep>=1.45.0",
    "bandit>=1.7.5",
    "loguru>=0.6.0",
    "mcp[cli]>=1.11.0",
    "pydantic>=2.0.0",
]

[project.optional-dependencies]
ash = [
    "automated-security-helper @ git+https://github.com/awslabs/automated-security-helper.git@v3.2.7",
]
dev = [
    "pytest>=8.0.0",
    "pytest-cov>=5.0.0",
    "pytest-asyncio>=0.23.0",
]

[project.scripts]
security-scanner = "security_scanner.server:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.metadata]
allow-direct-references = true

[tool.hatch.build.targets.wheel]
packages = ["security_scanner"]

[tool.pytest.ini_options]
addopts = "--cov=security_scanner --cov-report=term-missing --cov-fail-under=95"
asyncio_mode = "auto"
markers = [
    "integration: marks tests as requiring real tool installations (deselect with '-m not integration')",
]

[tool.coverage.run]
source = ["security_scanner"]
omit = ["tests/*"]
```

- [ ] **Step 3: Write __init__ files**

`security_scanner/__init__.py`:
```python
__version__ = "0.1.0"
```

`security_scanner/scanners/__init__.py` — empty file.

`tests/__init__.py` — empty file.

`tests/unit/__init__.py` — empty file.

`tests/integration/__init__.py` — empty file.

- [ ] **Step 4: Write tests/conftest.py**

```python
import pytest


def pytest_configure(config):
    config.addinivalue_line(
        "markers",
        "integration: marks tests as requiring real tool installations",
    )
```

- [ ] **Step 5: Write SKILL.md**

```markdown
---
name: security-scanner
version: 0.1.0
description: |
  MCP server providing Checkov (IaC), Semgrep (source), Bandit (Python), and
  ASH (multi-tool) security scanning. Produces SECURITY.md reports. Requires
  Docker or local tool install. No external API keys required.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
agents: [security, swe, qa-agent]
mcp: security-scanner
trigger: scan|checkov|semgrep|bandit|vulnerability|IaC|security report
---

# Security Scanner MCP

Security scanning via MCP tools. Start with Docker, then invoke tools directly.

## Quick Start

```bash
# Start scanner (base: Checkov + Semgrep + Bandit)
docker compose up security-scanner

# Start scanner with ASH (Ruby/Node, ~2GB image)
docker compose --profile full up security-scanner-full
```

## MCP Tools

| Tool | Input | Output |
|------|-------|--------|
| `scan_with_checkov` | `code: str`, `format_type: str` | findings + summary |
| `scan_with_semgrep` | `code: str`, `language: str` | findings + summary |
| `scan_with_bandit` | `code: str` | findings + summary |
| `scan_directory_with_checkov` | `directory_path: str` | summary + output file |
| `scan_directory_with_semgrep` | `directory_path: str`, `language: str` | summary + output file |
| `scan_directory_with_bandit` | `directory_path: str` | summary + output file |
| `scan_directory_with_ash` | `directory_path: str` | summary + output file |
| `generate_security_report` | `project_name: str`, `scan_results: str` | SECURITY.md content |

Supported `format_type` values: `terraform`, `cloudformation`, `kubernetes`, `dockerfile`, `arm`, `bicep`, `helm`, `kustomize`

Supported `language` values: `python`, `javascript`, `typescript`, `java`, `go`, `ruby`, `php`, `c`, `cpp`, `csharp`, `rust`, `kotlin`, `scala`
```

- [ ] **Step 6: Write SKILL.md.tmpl**

```markdown
---
name: security-scanner
version: 0.1.0
description: |
  MCP server providing Checkov (IaC), Semgrep (source), Bandit (Python), and
  ASH (multi-tool) security scanning. Produces SECURITY.md reports. Requires
  Docker or local tool install. No external API keys required.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
agents: [security, swe, qa-agent]
mcp: security-scanner
trigger: scan|checkov|semgrep|bandit|vulnerability|IaC|security report
---

{{PREAMBLE}}

# Security Scanner MCP

Security scanning via MCP tools. Start with Docker, then invoke tools directly.

## Quick Start

```bash
docker compose up security-scanner
```

## MCP Tools

| Tool | Input |
|------|-------|
| `scan_with_checkov` | `code: str`, `format_type: str` |
| `scan_with_semgrep` | `code: str`, `language: str` |
| `scan_with_bandit` | `code: str` |
| `scan_directory_with_checkov` | `directory_path: str` |
| `scan_directory_with_semgrep` | `directory_path: str`, `language: str` |
| `scan_directory_with_bandit` | `directory_path: str` |
| `scan_directory_with_ash` | `directory_path: str` |
| `generate_security_report` | `project_name: str`, `scan_results: str` |
```

- [ ] **Step 7: Write mcp.json**

```json
{
  "mcpServers": {
    "security-scanner": {
      "url": "http://localhost:8765/sse",
      "description": "Security scanning — Checkov, Semgrep, Bandit, ASH"
    }
  }
}
```

- [ ] **Step 8: Commit scaffold**

```bash
git add agent-architecture/packages/skills/security-scanner/
git commit -m "chore(security-scanner): scaffold package — pyproject, SKILL.md, mcp.json"
```

---

### Task 2: Checkov Scanner Module

**Files:**
- Create: `security_scanner/scanners/checkov.py`
- Create: `tests/unit/test_checkov.py`

**Interfaces:**
- Produces:
  - `run_checkov_scan(code: str, format_type: str) -> Dict` — raises `ValueError` for unsupported formats
  - `run_directory_checkov_scan(directory_path: str) -> Dict`
  - `_parse_checkov_output(stdout: str, format_type: str) -> Dict`
  - `SUPPORTED_FORMATS: dict[str, str]` — maps format name → file extension

- [ ] **Step 1: Write failing tests**

Create `tests/unit/test_checkov.py`:

```python
import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from security_scanner.scanners.checkov import (
    SUPPORTED_FORMATS,
    _parse_checkov_output,
    run_checkov_scan,
    run_directory_checkov_scan,
)

FAILED_OUTPUT = json.dumps({
    "results": {
        "passed_checks": [{"check_id": "CKV_AWS_1"}],
        "failed_checks": [
            {
                "check_id": "CKV_AWS_2",
                "severity": "HIGH",
                "resource": "aws_s3_bucket.test",
                "file_path": "/tmp/foo.tf",
                "file_line_range": [1, 5],
                "guideline": "https://docs.aws.amazon.com/s3",
            }
        ],
    },
    "summary": {"passed": 1, "failed": 1},
})


class TestRunCheckovScan:
    def test_unsupported_format_raises(self):
        with pytest.raises(ValueError, match="Unsupported format"):
            run_checkov_scan("code", "yaml")

    @patch("security_scanner.scanners.checkov.subprocess.run")
    @patch("security_scanner.scanners.checkov.os.unlink")
    def test_returns_findings_for_terraform(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout=FAILED_OUTPUT, returncode=1)
        result = run_checkov_scan("resource aws_s3_bucket test {}", "terraform")
        assert result["tool"] == "checkov"
        assert result["format_type"] == "terraform"
        assert len(result["findings"]) == 1
        assert result["findings"][0]["check_id"] == "CKV_AWS_2"
        assert result["total_issues"] == 1

    @patch("security_scanner.scanners.checkov.subprocess.run")
    @patch("security_scanner.scanners.checkov.os.unlink")
    def test_clean_scan_empty_findings(self, mock_unlink, mock_run):
        clean = json.dumps({"results": {"passed_checks": [{"check_id": "CKV_AWS_1"}], "failed_checks": []}, "summary": {"passed": 1, "failed": 0}})
        mock_run.return_value = MagicMock(stdout=clean, returncode=0)
        result = run_checkov_scan("resource aws_s3_bucket test {}", "terraform")
        assert result["findings"] == []
        assert result["total_issues"] == 0

    @patch("security_scanner.scanners.checkov.subprocess.run")
    @patch("security_scanner.scanners.checkov.os.unlink")
    def test_empty_stdout_returns_empty(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        result = run_checkov_scan("", "kubernetes")
        assert result["findings"] == []
        assert result["total_issues"] == 0

    @patch("security_scanner.scanners.checkov.subprocess.run")
    @patch("security_scanner.scanners.checkov.os.unlink")
    def test_parse_error_returns_empty(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="not json", returncode=1)
        result = run_checkov_scan("", "cloudformation")
        assert result["findings"] == []

    @patch("security_scanner.scanners.checkov.subprocess.run")
    @patch("security_scanner.scanners.checkov.os.unlink")
    def test_all_formats_accepted(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        for fmt in SUPPORTED_FORMATS:
            result = run_checkov_scan("code", fmt)
            assert result["tool"] == "checkov"

    @patch("security_scanner.scanners.checkov.subprocess.run")
    @patch("security_scanner.scanners.checkov.os.unlink")
    def test_tmp_file_deleted_on_success(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        run_checkov_scan("code", "terraform")
        assert mock_unlink.called

    @patch("security_scanner.scanners.checkov.subprocess.run")
    @patch("security_scanner.scanners.checkov.os.unlink")
    def test_multi_framework_output(self, mock_unlink, mock_run):
        multi = json.dumps([
            {"results": {"passed_checks": [], "failed_checks": [{"check_id": "CKV_K8S_1", "severity": "MEDIUM", "resource": "Pod.test"}]}, "summary": {"passed": 0, "failed": 1}},
            {"results": {"passed_checks": [{"check_id": "CKV_K8S_2"}], "failed_checks": []}, "summary": {"passed": 1, "failed": 0}},
        ])
        mock_run.return_value = MagicMock(stdout=multi, returncode=1)
        result = run_checkov_scan("code", "kubernetes")
        assert result["total_issues"] == 1
        assert len(result["findings"]) == 1


class TestRunDirectoryCheckovScan:
    @patch("security_scanner.scanners.checkov.subprocess.run")
    def test_creates_output_file(self, mock_run, tmp_path):
        mock_run.return_value = MagicMock(
            stdout=json.dumps({"summary": {"passed": 2, "failed": 0}}), returncode=0
        )
        result = run_directory_checkov_scan(str(tmp_path))
        assert result["tool"] == "checkov"
        assert Path(result["output_file"]).exists()

    @patch("security_scanner.scanners.checkov.subprocess.run")
    def test_returns_summary_counts(self, mock_run, tmp_path):
        mock_run.return_value = MagicMock(
            stdout=json.dumps({"summary": {"passed": 3, "failed": 2}}), returncode=1
        )
        result = run_directory_checkov_scan(str(tmp_path))
        assert result["summary"]["passed"] == 3
        assert result["summary"]["failed"] == 2

    @patch("security_scanner.scanners.checkov.subprocess.run")
    def test_empty_stdout_writes_empty_json(self, mock_run, tmp_path):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        result = run_directory_checkov_scan(str(tmp_path))
        assert Path(result["output_file"]).exists()
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd agent-architecture/packages/skills/security-scanner
pip install -e ".[dev]"
pytest tests/unit/test_checkov.py -v --no-cov 2>&1 | head -20
```

Expected: `ModuleNotFoundError: No module named 'security_scanner'` or similar (module doesn't exist yet).

- [ ] **Step 3: Write security_scanner/scanners/checkov.py**

```python
import json
import os
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Dict

SUPPORTED_FORMATS = {
    "terraform": ".tf",
    "cloudformation": ".yaml",
    "kubernetes": ".yaml",
    "dockerfile": "Dockerfile",
    "arm": ".json",
    "bicep": ".bicep",
    "helm": ".yaml",
    "kustomize": ".yaml",
}


def run_checkov_scan(code: str, format_type: str) -> Dict:
    """Scan an IaC code string with Checkov."""
    fmt = format_type.lower()
    if fmt not in SUPPORTED_FORMATS:
        raise ValueError(
            f"Unsupported format: {format_type}. Supported: {sorted(SUPPORTED_FORMATS)}"
        )

    ext = SUPPORTED_FORMATS[fmt]
    if ext == "Dockerfile":
        fd, tmp_path = tempfile.mkstemp(prefix="Dockerfile")
        os.close(fd)
    else:
        fd, tmp_path = tempfile.mkstemp(suffix=ext, prefix="checkov_scan_")
        os.close(fd)

    try:
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(code)
        result = subprocess.run(
            ["checkov", "-f", tmp_path, "--output", "json", "--quiet", "--compact"],
            capture_output=True,
            text=True,
        )
        return _parse_checkov_output(result.stdout, format_type)
    finally:
        os.unlink(tmp_path)


def run_directory_checkov_scan(directory_path: str) -> Dict:
    """Scan a directory with Checkov; write results to .security-reports/checkov/<ts>.json."""
    out_dir = Path(directory_path) / ".security-reports" / "checkov"
    out_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = out_dir / f"{timestamp}.json"

    result = subprocess.run(
        ["checkov", "-d", directory_path, "--output", "json", "--quiet", "--compact"],
        capture_output=True,
        text=True,
    )

    raw: object = {}
    if result.stdout.strip():
        try:
            raw = json.loads(result.stdout)
        except json.JSONDecodeError:
            raw = {}

    out_file.write_text(json.dumps(raw, indent=2), encoding="utf-8")

    passed = failed = 0
    checks = raw if isinstance(raw, list) else [raw]
    for check in checks:
        s = check.get("summary", {}) if isinstance(check, dict) else {}
        passed += s.get("passed", 0)
        failed += s.get("failed", 0)

    return {
        "tool": "checkov",
        "directory": directory_path,
        "summary": {"passed": passed, "failed": failed},
        "output_file": str(out_file),
    }


def _parse_checkov_output(stdout: str, format_type: str) -> Dict:
    _empty = {
        "tool": "checkov",
        "format_type": format_type,
        "findings": [],
        "summary": {"passed": 0, "failed": 0, "high": 0, "medium": 0, "low": 0},
        "total_issues": 0,
    }

    if not stdout.strip():
        return _empty

    try:
        data = json.loads(stdout)
    except json.JSONDecodeError:
        return _empty

    findings = []
    passed = failed = 0
    checks = data if isinstance(data, list) else [data]

    for check in checks:
        if not isinstance(check, dict):
            continue
        results = check.get("results", {})
        passed_checks = results.get("passed_checks", [])
        failed_checks = results.get("failed_checks", [])
        passed += len(passed_checks)
        failed += len(failed_checks)
        for fc in failed_checks:
            findings.append({
                "check_id": fc.get("check_id"),
                "check_name": fc.get("check_id"),
                "description": fc.get("check_id"),
                "severity": (fc.get("severity") or "MEDIUM").upper(),
                "resource": fc.get("resource"),
                "file_path": fc.get("file_path"),
                "line_range": fc.get("file_line_range", []),
                "guideline": fc.get("guideline"),
            })

    high = sum(1 for f in findings if f["severity"] in ("HIGH", "CRITICAL"))
    medium = sum(1 for f in findings if f["severity"] == "MEDIUM")
    low = sum(1 for f in findings if f["severity"] == "LOW")

    return {
        "tool": "checkov",
        "format_type": format_type,
        "findings": findings,
        "summary": {"passed": passed, "failed": failed, "high": high, "medium": medium, "low": low},
        "total_issues": failed,
    }
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
pytest tests/unit/test_checkov.py -v --no-cov
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add security_scanner/scanners/checkov.py tests/unit/test_checkov.py
git commit -m "feat(security-scanner): add Checkov scanner module with unit tests"
```

---

### Task 3: Semgrep Scanner Module

**Files:**
- Create: `security_scanner/scanners/semgrep.py`
- Create: `tests/unit/test_semgrep.py`

**Interfaces:**
- Produces:
  - `run_semgrep_scan(code: str, language: str) -> Dict` — raises `ValueError` for unsupported languages
  - `run_directory_semgrep_scan(directory_path: str, language: str) -> Dict`
  - `_parse_semgrep_output(stdout: str, language: str) -> Dict`
  - `SUPPORTED_LANGUAGES: dict[str, str]` — maps language name → file extension

- [ ] **Step 1: Write failing tests**

Create `tests/unit/test_semgrep.py`:

```python
import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from security_scanner.scanners.semgrep import (
    SUPPORTED_LANGUAGES,
    _parse_semgrep_output,
    run_semgrep_scan,
    run_directory_semgrep_scan,
)

SEMGREP_OUTPUT = json.dumps({
    "results": [
        {
            "check_id": "python.lang.security.audit.hardcoded-password",
            "path": "/tmp/foo.py",
            "start": {"line": 5},
            "extra": {
                "severity": "ERROR",
                "message": "Hardcoded password detected",
            },
        }
    ],
    "errors": [],
})


class TestRunSemgrepScan:
    def test_unsupported_language_raises(self):
        with pytest.raises(ValueError, match="Unsupported language"):
            run_semgrep_scan("code", "cobol")

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    @patch("security_scanner.scanners.semgrep.os.unlink")
    def test_returns_findings_for_python(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout=SEMGREP_OUTPUT, returncode=1)
        result = run_semgrep_scan("password = 'secret'", "python")
        assert result["tool"] == "semgrep"
        assert result["language"] == "python"
        assert len(result["findings"]) == 1
        assert result["findings"][0]["rule_id"] == "python.lang.security.audit.hardcoded-password"
        assert result["findings"][0]["severity"] == "ERROR"
        assert result["total_issues"] == 1

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    @patch("security_scanner.scanners.semgrep.os.unlink")
    def test_clean_scan_empty_findings(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(
            stdout=json.dumps({"results": [], "errors": []}), returncode=0
        )
        result = run_semgrep_scan("x = 1", "python")
        assert result["findings"] == []
        assert result["total_issues"] == 0

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    @patch("security_scanner.scanners.semgrep.os.unlink")
    def test_all_languages_accepted(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        for lang in SUPPORTED_LANGUAGES:
            result = run_semgrep_scan("code", lang)
            assert result["tool"] == "semgrep"

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    @patch("security_scanner.scanners.semgrep.os.unlink")
    def test_parse_error_returns_empty(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="invalid json", returncode=1)
        result = run_semgrep_scan("code", "javascript")
        assert result["findings"] == []

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    @patch("security_scanner.scanners.semgrep.os.unlink")
    def test_empty_stdout_returns_empty(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        result = run_semgrep_scan("code", "go")
        assert result["findings"] == []

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    @patch("security_scanner.scanners.semgrep.os.unlink")
    def test_tmp_file_deleted(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        run_semgrep_scan("code", "go")
        assert mock_unlink.called

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    @patch("security_scanner.scanners.semgrep.os.unlink")
    def test_summary_counts_by_severity(self, mock_unlink, mock_run):
        output = json.dumps({"results": [
            {"check_id": "r1", "path": "/f.py", "start": {"line": 1}, "extra": {"severity": "ERROR", "message": "err"}},
            {"check_id": "r2", "path": "/f.py", "start": {"line": 2}, "extra": {"severity": "WARNING", "message": "warn"}},
            {"check_id": "r3", "path": "/f.py", "start": {"line": 3}, "extra": {"severity": "INFO", "message": "info"}},
        ], "errors": []})
        mock_run.return_value = MagicMock(stdout=output, returncode=1)
        result = run_semgrep_scan("code", "python")
        assert result["summary"]["error"] == 1
        assert result["summary"]["warning"] == 1
        assert result["summary"]["info"] == 1


class TestRunDirectorySemgrepScan:
    @patch("security_scanner.scanners.semgrep.subprocess.run")
    def test_creates_output_file(self, mock_run, tmp_path):
        mock_run.return_value = MagicMock(
            stdout=json.dumps({"results": [], "errors": []}), returncode=0
        )
        result = run_directory_semgrep_scan(str(tmp_path), "python")
        assert result["tool"] == "semgrep"
        assert Path(result["output_file"]).exists()

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    def test_returns_total_count(self, mock_run, tmp_path):
        mock_run.return_value = MagicMock(stdout=SEMGREP_OUTPUT, returncode=1)
        result = run_directory_semgrep_scan(str(tmp_path), "python")
        assert result["summary"]["total"] == 1
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
pytest tests/unit/test_semgrep.py -v --no-cov 2>&1 | head -5
```

Expected: `ModuleNotFoundError: No module named 'security_scanner.scanners.semgrep'`

- [ ] **Step 3: Write security_scanner/scanners/semgrep.py**

```python
import json
import os
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Dict

SUPPORTED_LANGUAGES = {
    "python": ".py",
    "javascript": ".js",
    "typescript": ".ts",
    "java": ".java",
    "go": ".go",
    "ruby": ".rb",
    "php": ".php",
    "c": ".c",
    "cpp": ".cpp",
    "csharp": ".cs",
    "rust": ".rs",
    "kotlin": ".kt",
    "scala": ".scala",
}


def run_semgrep_scan(code: str, language: str) -> Dict:
    """Scan a source code string with Semgrep."""
    lang = language.lower()
    if lang not in SUPPORTED_LANGUAGES:
        raise ValueError(
            f"Unsupported language: {language}. Supported: {sorted(SUPPORTED_LANGUAGES)}"
        )

    ext = SUPPORTED_LANGUAGES[lang]
    fd, tmp_path = tempfile.mkstemp(suffix=ext, prefix="semgrep_scan_")
    os.close(fd)

    try:
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(code)
        result = subprocess.run(
            ["semgrep", "--config", "auto", "--json", "--quiet", tmp_path],
            capture_output=True,
            text=True,
        )
        return _parse_semgrep_output(result.stdout, language)
    finally:
        os.unlink(tmp_path)


def run_directory_semgrep_scan(directory_path: str, language: str = "") -> Dict:
    """Scan a directory with Semgrep; write results to .security-reports/semgrep/<ts>.json."""
    out_dir = Path(directory_path) / ".security-reports" / "semgrep"
    out_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = out_dir / f"{timestamp}.json"

    cmd = ["semgrep", "--config", "auto", "--json", "--quiet", directory_path]
    lang = language.lower()
    if lang and lang in SUPPORTED_LANGUAGES:
        cmd.extend(["--lang", lang])

    result = subprocess.run(cmd, capture_output=True, text=True)

    raw: object = {}
    if result.stdout.strip():
        try:
            raw = json.loads(result.stdout)
        except json.JSONDecodeError:
            raw = {}

    out_file.write_text(json.dumps(raw, indent=2), encoding="utf-8")
    results_list = raw.get("results", []) if isinstance(raw, dict) else []

    return {
        "tool": "semgrep",
        "directory": directory_path,
        "language": language,
        "summary": {"total": len(results_list)},
        "output_file": str(out_file),
    }


def _parse_semgrep_output(stdout: str, language: str) -> Dict:
    _empty = {
        "tool": "semgrep",
        "language": language,
        "findings": [],
        "summary": {"total": 0, "error": 0, "warning": 0, "info": 0},
        "total_issues": 0,
    }

    if not stdout.strip():
        return _empty

    try:
        data = json.loads(stdout)
    except json.JSONDecodeError:
        return _empty

    findings = []
    for r in data.get("results", []):
        severity = (r.get("extra", {}).get("severity") or "WARNING").upper()
        findings.append({
            "rule_id": r.get("check_id"),
            "message": r.get("extra", {}).get("message"),
            "severity": severity,
            "line": r.get("start", {}).get("line"),
            "file_path": r.get("path"),
        })

    error = sum(1 for f in findings if f["severity"] == "ERROR")
    warning = sum(1 for f in findings if f["severity"] == "WARNING")
    info = sum(1 for f in findings if f["severity"] == "INFO")

    return {
        "tool": "semgrep",
        "language": language,
        "findings": findings,
        "summary": {"total": len(findings), "error": error, "warning": warning, "info": info},
        "total_issues": len(findings),
    }
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
pytest tests/unit/test_semgrep.py -v --no-cov
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add security_scanner/scanners/semgrep.py tests/unit/test_semgrep.py
git commit -m "feat(security-scanner): add Semgrep scanner module with unit tests"
```

---

### Task 4: Bandit Scanner Module

**Files:**
- Create: `security_scanner/scanners/bandit.py`
- Create: `tests/unit/test_bandit.py`

**Interfaces:**
- Produces:
  - `run_bandit_scan(code: str) -> Dict`
  - `run_directory_bandit_scan(directory_path: str) -> Dict`
  - `_parse_bandit_output(stdout: str) -> Dict`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/test_bandit.py`:

```python
import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from security_scanner.scanners.bandit import (
    _parse_bandit_output,
    run_bandit_scan,
    run_directory_bandit_scan,
)

BANDIT_OUTPUT = json.dumps({
    "results": [
        {
            "test_id": "B105",
            "test_name": "hardcoded_password_string",
            "issue_severity": "HIGH",
            "issue_confidence": "MEDIUM",
            "issue_text": "Possible hardcoded password: 'secret'",
            "line_number": 3,
            "filename": "/tmp/foo.py",
            "code": "password = 'secret'",
        }
    ],
    "metrics": {
        "_totals": {
            "SEVERITY.HIGH": 1,
            "SEVERITY.MEDIUM": 0,
            "SEVERITY.LOW": 0,
        }
    },
})


class TestRunBanditScan:
    @patch("security_scanner.scanners.bandit.subprocess.run")
    @patch("security_scanner.scanners.bandit.os.unlink")
    def test_findings_present(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout=BANDIT_OUTPUT, returncode=1)
        result = run_bandit_scan("password = 'secret'")
        assert result["tool"] == "bandit"
        assert len(result["findings"]) == 1
        assert result["findings"][0]["test_id"] == "B105"
        assert result["findings"][0]["issue_severity"] == "HIGH"
        assert result["total_issues"] == 1

    @patch("security_scanner.scanners.bandit.subprocess.run")
    @patch("security_scanner.scanners.bandit.os.unlink")
    def test_clean_scan_empty_findings(self, mock_unlink, mock_run):
        clean = json.dumps({
            "results": [],
            "metrics": {"_totals": {"SEVERITY.HIGH": 0, "SEVERITY.MEDIUM": 0, "SEVERITY.LOW": 0}},
        })
        mock_run.return_value = MagicMock(stdout=clean, returncode=0)
        result = run_bandit_scan("x = 1")
        assert result["findings"] == []
        assert result["total_issues"] == 0

    @patch("security_scanner.scanners.bandit.subprocess.run")
    @patch("security_scanner.scanners.bandit.os.unlink")
    def test_empty_stdout_returns_empty(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        result = run_bandit_scan("")
        assert result["findings"] == []

    @patch("security_scanner.scanners.bandit.subprocess.run")
    @patch("security_scanner.scanners.bandit.os.unlink")
    def test_parse_error_returns_empty(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="not json", returncode=1)
        result = run_bandit_scan("code")
        assert result["findings"] == []

    @patch("security_scanner.scanners.bandit.subprocess.run")
    @patch("security_scanner.scanners.bandit.os.unlink")
    def test_tmp_file_deleted(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        run_bandit_scan("code")
        assert mock_unlink.called

    @patch("security_scanner.scanners.bandit.subprocess.run")
    @patch("security_scanner.scanners.bandit.os.unlink")
    def test_summary_severity_counts(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout=BANDIT_OUTPUT, returncode=1)
        result = run_bandit_scan("password = 'secret'")
        assert result["summary"]["high"] == 1
        assert result["summary"]["medium"] == 0
        assert result["summary"]["low"] == 0


class TestRunDirectoryBanditScan:
    @patch("security_scanner.scanners.bandit.subprocess.run")
    def test_creates_output_file(self, mock_run, tmp_path):
        mock_run.return_value = MagicMock(
            stdout=json.dumps({"results": [], "metrics": {"_totals": {}}}), returncode=0
        )
        result = run_directory_bandit_scan(str(tmp_path))
        assert result["tool"] == "bandit"
        assert Path(result["output_file"]).exists()

    @patch("security_scanner.scanners.bandit.subprocess.run")
    def test_returns_summary(self, mock_run, tmp_path):
        mock_run.return_value = MagicMock(stdout=BANDIT_OUTPUT, returncode=1)
        result = run_directory_bandit_scan(str(tmp_path))
        assert result["summary"]["high"] == 1
        assert result["summary"]["total"] == 1
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
pytest tests/unit/test_bandit.py -v --no-cov 2>&1 | head -5
```

Expected: `ModuleNotFoundError`

- [ ] **Step 3: Write security_scanner/scanners/bandit.py**

```python
import json
import os
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Dict


def run_bandit_scan(code: str) -> Dict:
    """Scan Python source code string with Bandit."""
    fd, tmp_path = tempfile.mkstemp(suffix=".py", prefix="bandit_scan_")
    os.close(fd)

    try:
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(code)
        result = subprocess.run(
            ["bandit", "-f", "json", "-q", tmp_path],
            capture_output=True,
            text=True,
        )
        return _parse_bandit_output(result.stdout)
    finally:
        os.unlink(tmp_path)


def run_directory_bandit_scan(directory_path: str) -> Dict:
    """Scan a Python directory recursively with Bandit; write results to .security-reports/bandit/<ts>.json."""
    out_dir = Path(directory_path) / ".security-reports" / "bandit"
    out_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = out_dir / f"{timestamp}.json"

    result = subprocess.run(
        ["bandit", "-r", "-f", "json", "-q", directory_path],
        capture_output=True,
        text=True,
    )

    raw: object = {}
    if result.stdout.strip():
        try:
            raw = json.loads(result.stdout)
        except json.JSONDecodeError:
            raw = {}

    out_file.write_text(json.dumps(raw, indent=2), encoding="utf-8")
    metrics = raw.get("metrics", {}).get("_totals", {}) if isinstance(raw, dict) else {}

    return {
        "tool": "bandit",
        "directory": directory_path,
        "summary": {
            "high": int(metrics.get("SEVERITY.HIGH", 0)),
            "medium": int(metrics.get("SEVERITY.MEDIUM", 0)),
            "low": int(metrics.get("SEVERITY.LOW", 0)),
            "total": len(raw.get("results", [])) if isinstance(raw, dict) else 0,
        },
        "output_file": str(out_file),
    }


def _parse_bandit_output(stdout: str) -> Dict:
    _empty = {
        "tool": "bandit",
        "findings": [],
        "summary": {"high": 0, "medium": 0, "low": 0},
        "total_issues": 0,
    }

    if not stdout.strip():
        return _empty

    try:
        data = json.loads(stdout)
    except json.JSONDecodeError:
        return _empty

    findings = []
    for r in data.get("results", []):
        findings.append({
            "test_id": r.get("test_id"),
            "test_name": r.get("test_name"),
            "issue_severity": (r.get("issue_severity") or "MEDIUM").upper(),
            "issue_confidence": (r.get("issue_confidence") or "MEDIUM").upper(),
            "issue_text": r.get("issue_text"),
            "line_number": r.get("line_number"),
            "filename": r.get("filename"),
            "code": r.get("code"),
        })

    metrics = data.get("metrics", {}).get("_totals", {})
    return {
        "tool": "bandit",
        "findings": findings,
        "summary": {
            "high": int(metrics.get("SEVERITY.HIGH", 0)),
            "medium": int(metrics.get("SEVERITY.MEDIUM", 0)),
            "low": int(metrics.get("SEVERITY.LOW", 0)),
        },
        "total_issues": len(findings),
    }
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
pytest tests/unit/test_bandit.py -v --no-cov
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add security_scanner/scanners/bandit.py tests/unit/test_bandit.py
git commit -m "feat(security-scanner): add Bandit scanner module with unit tests"
```

---

### Task 5: ASH Scanner Module

**Files:**
- Create: `security_scanner/scanners/ash.py`
- Create: `tests/unit/test_ash.py`

**Interfaces:**
- Produces:
  - `check_ash_available() -> Tuple[bool, Optional[str]]` — returns `(True, "/path/to/ash")` or `(False, None)`
  - `run_ash_scan(directory_path: str, output_dir: Optional[str] = None, delta_scan: bool = False) -> Dict`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/test_ash.py`:

```python
from unittest.mock import MagicMock, patch
from pathlib import Path

import pytest

from security_scanner.scanners.ash import check_ash_available, run_ash_scan


class TestCheckAshAvailable:
    @patch("security_scanner.scanners.ash.shutil.which", return_value="/usr/local/bin/ash")
    def test_available(self, mock_which):
        available, path = check_ash_available()
        assert available is True
        assert path == "/usr/local/bin/ash"

    @patch("security_scanner.scanners.ash.shutil.which", return_value=None)
    def test_not_available(self, mock_which):
        available, path = check_ash_available()
        assert available is False
        assert path is None


class TestRunAshScan:
    @patch("security_scanner.scanners.ash.check_ash_available", return_value=(False, None))
    def test_ash_not_installed_returns_error(self, mock_check, tmp_path):
        result = run_ash_scan(str(tmp_path))
        assert result["success"] is False
        assert "not installed" in result["error"]

    @patch("security_scanner.scanners.ash.check_ash_available", return_value=(True, "/usr/local/bin/ash"))
    @patch("security_scanner.scanners.ash.subprocess.run")
    def test_successful_scan(self, mock_run, mock_check, tmp_path):
        mock_run.return_value = MagicMock(returncode=0, stdout="Scan complete\n", stderr="")
        result = run_ash_scan(str(tmp_path))
        assert result["success"] is True
        assert result["tool"] == "ash"
        assert "output_file" in result

    @patch("security_scanner.scanners.ash.check_ash_available", return_value=(True, "/usr/local/bin/ash"))
    @patch("security_scanner.scanners.ash.subprocess.run")
    def test_delta_scan_includes_flag(self, mock_run, mock_check, tmp_path):
        mock_run.return_value = MagicMock(returncode=0, stdout="", stderr="")
        run_ash_scan(str(tmp_path), delta_scan=True)
        cmd = mock_run.call_args[0][0]
        assert "--delta-scan" in cmd

    @patch("security_scanner.scanners.ash.check_ash_available", return_value=(True, "/usr/local/bin/ash"))
    @patch("security_scanner.scanners.ash.subprocess.run")
    def test_no_delta_scan_by_default(self, mock_run, mock_check, tmp_path):
        mock_run.return_value = MagicMock(returncode=0, stdout="", stderr="")
        run_ash_scan(str(tmp_path))
        cmd = mock_run.call_args[0][0]
        assert "--delta-scan" not in cmd

    @patch("security_scanner.scanners.ash.check_ash_available", return_value=(True, "/usr/local/bin/ash"))
    @patch("security_scanner.scanners.ash.subprocess.run")
    def test_output_file_contains_stdout(self, mock_run, mock_check, tmp_path):
        mock_run.return_value = MagicMock(returncode=0, stdout="found issues", stderr="")
        result = run_ash_scan(str(tmp_path))
        assert "found issues" in Path(result["output_file"]).read_text()

    @patch("security_scanner.scanners.ash.check_ash_available", return_value=(True, "/usr/local/bin/ash"))
    @patch("security_scanner.scanners.ash.subprocess.run")
    def test_custom_output_dir(self, mock_run, mock_check, tmp_path):
        custom_dir = str(tmp_path / "custom_reports")
        mock_run.return_value = MagicMock(returncode=0, stdout="", stderr="")
        result = run_ash_scan(str(tmp_path), output_dir=custom_dir)
        assert result["output_file"].startswith(custom_dir)

    @patch("security_scanner.scanners.ash.check_ash_available", return_value=(True, "/usr/local/bin/ash"))
    @patch("security_scanner.scanners.ash.subprocess.run")
    def test_nonzero_exit_sets_success_false(self, mock_run, mock_check, tmp_path):
        mock_run.return_value = MagicMock(returncode=1, stdout="issues found", stderr="")
        result = run_ash_scan(str(tmp_path))
        assert result["success"] is False
        assert result["return_code"] == 1
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
pytest tests/unit/test_ash.py -v --no-cov 2>&1 | head -5
```

Expected: `ModuleNotFoundError`

- [ ] **Step 3: Write security_scanner/scanners/ash.py**

```python
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, Tuple


def check_ash_available() -> Tuple[bool, Optional[str]]:
    """Return (True, path) if ASH is on PATH, (False, None) otherwise."""
    path = shutil.which("ash")
    if path:
        return True, path
    return False, None


def run_ash_scan(
    directory_path: str,
    output_dir: Optional[str] = None,
    delta_scan: bool = False,
) -> Dict:
    """Run ASH scan on a directory. Requires ASH installed (use 'full' Docker target)."""
    available, ash_path = check_ash_available()
    if not available:
        return {
            "success": False,
            "error": (
                "ASH (Automated Security Helper) is not installed. "
                "Use the 'full' Docker target or install ASH separately."
            ),
        }

    out_dir = Path(output_dir) if output_dir else Path(directory_path) / ".security-reports" / "ash"
    out_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = out_dir / f"{timestamp}.txt"

    cmd = [ash_path, "--source-dir", directory_path, "--output-dir", str(out_dir)]
    if delta_scan:
        cmd.append("--delta-scan")

    result = subprocess.run(cmd, capture_output=True, text=True)
    out_file.write_text(result.stdout + result.stderr, encoding="utf-8")

    return {
        "success": result.returncode == 0,
        "tool": "ash",
        "directory": directory_path,
        "output_file": str(out_file),
        "return_code": result.returncode,
    }
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
pytest tests/unit/test_ash.py -v --no-cov
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add security_scanner/scanners/ash.py tests/unit/test_ash.py
git commit -m "feat(security-scanner): add ASH scanner module with unit tests"
```

---

### Task 6: Report Generator

**Files:**
- Create: `security_scanner/report_generator.py`
- Create: `tests/unit/test_report_generator.py`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure function)
- Produces: `generate_report(project_name: str, scan_results: str) -> Dict` — returns `{"success": True, "report": str, "summary": {"risk_level": str, "total_findings": int, "scanners_used": list}}`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/test_report_generator.py`:

```python
import json

import pytest

from security_scanner.report_generator import generate_report

CHECKOV_RESULT = {
    "tool": "checkov",
    "format_type": "terraform",
    "findings": [
        {
            "check_id": "CKV_AWS_2",
            "severity": "HIGH",
            "resource": "aws_s3_bucket.test",
            "description": "Ensure S3 Bucket has MFA delete enabled",
            "guideline": "https://docs.aws.amazon.com/s3",
        }
    ],
    "summary": {"high": 1, "medium": 0, "low": 0},
    "total_issues": 1,
}

BANDIT_RESULT = {
    "tool": "bandit",
    "findings": [
        {
            "test_id": "B105",
            "issue_severity": "MEDIUM",
            "issue_text": "Hardcoded password",
            "line_number": 5,
        }
    ],
    "summary": {"high": 0, "medium": 1, "low": 0},
    "total_issues": 1,
}

CRITICAL_RESULT = {
    "tool": "checkov",
    "findings": [
        {"check_id": "CKV_AWS_99", "severity": "CRITICAL", "description": "Critical issue"}
    ],
    "summary": {"critical": 1, "high": 0, "medium": 0, "low": 0},
    "total_issues": 1,
}


class TestGenerateReport:
    def test_invalid_json_returns_error(self):
        result = generate_report("MyProject", "not json")
        assert result["success"] is False
        assert "Invalid JSON" in result["error"]

    def test_single_result_dict_succeeds(self):
        result = generate_report("MyProject", json.dumps(CHECKOV_RESULT))
        assert result["success"] is True
        assert "Security Report" in result["report"]
        assert "MyProject" in result["report"]
        assert result["summary"]["total_findings"] == 1

    def test_multi_result_array(self):
        result = generate_report("MyProject", json.dumps([CHECKOV_RESULT, BANDIT_RESULT]))
        assert result["success"] is True
        assert result["summary"]["total_findings"] == 2
        assert "checkov" in result["summary"]["scanners_used"]
        assert "bandit" in result["summary"]["scanners_used"]

    def test_critical_risk_level(self):
        result = generate_report("MyProject", json.dumps(CRITICAL_RESULT))
        assert result["summary"]["risk_level"] == "CRITICAL"

    def test_high_risk_level(self):
        result = generate_report("MyProject", json.dumps(CHECKOV_RESULT))
        assert result["summary"]["risk_level"] == "HIGH"

    def test_medium_risk_level(self):
        result = generate_report("MyProject", json.dumps(BANDIT_RESULT))
        assert result["summary"]["risk_level"] == "MEDIUM"

    def test_low_risk_level_no_findings(self):
        clean = {"tool": "checkov", "findings": [], "summary": {}, "total_issues": 0}
        result = generate_report("MyProject", json.dumps(clean))
        assert result["summary"]["risk_level"] == "LOW"

    def test_report_contains_stride_table(self):
        result = generate_report("MyProject", json.dumps(CHECKOV_RESULT))
        assert "STRIDE" in result["report"]
        assert "Spoofing" in result["report"]
        assert "Tampering" in result["report"]

    def test_high_severity_section_present(self):
        result = generate_report("MyProject", json.dumps(CHECKOV_RESULT))
        assert "Critical & High Severity Findings" in result["report"]
        assert "CKV_AWS_2" in result["report"]

    def test_medium_severity_table_present(self):
        result = generate_report("MyProject", json.dumps(BANDIT_RESULT))
        assert "Medium & Low Severity Findings" in result["report"]
        assert "B105" in result["report"]

    def test_empty_findings_skips_findings_sections(self):
        clean = {"tool": "checkov", "findings": [], "summary": {}, "total_issues": 0}
        result = generate_report("MyProject", json.dumps(clean))
        assert "Critical & High Severity Findings" not in result["report"]
        assert "Medium & Low Severity Findings" not in result["report"]

    def test_scanner_summary_table_present(self):
        result = generate_report("MyProject", json.dumps(CHECKOV_RESULT))
        assert "| Scanner |" in result["report"]
        assert "Checkov" in result["report"]

    def test_project_name_in_report(self):
        result = generate_report("Acme Corp App", json.dumps(CHECKOV_RESULT))
        assert "Acme Corp App" in result["report"]
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
pytest tests/unit/test_report_generator.py -v --no-cov 2>&1 | head -5
```

Expected: `ModuleNotFoundError`

- [ ] **Step 3: Write security_scanner/report_generator.py**

```python
import json
from datetime import datetime, timezone
from typing import Dict


def generate_report(project_name: str, scan_results: str) -> Dict:
    """Generate SECURITY.md content from JSON scan results string (single dict or array)."""
    try:
        results = json.loads(scan_results)
    except json.JSONDecodeError:
        return {"success": False, "error": "Invalid JSON in scan_results"}

    if isinstance(results, dict):
        results = [results]

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    all_findings: list = []
    scanner_summaries: list = []

    for r in results:
        tool = r.get("tool", "unknown")
        findings = r.get("findings", [])
        summary = r.get("summary", {})

        critical = summary.get("critical", 0)
        high = summary.get("high", summary.get("error", 0))
        medium = summary.get("medium", summary.get("warning", 0))
        low = summary.get("low", summary.get("info", 0))

        scanner_summaries.append({
            "tool": tool,
            "total": r.get("total_issues", len(findings)),
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low,
            "format": r.get("format_type", r.get("language", "N/A")),
        })

        for f in findings:
            f["_tool"] = tool
            f["_severity"] = (
                f.get("severity") or f.get("issue_severity") or "MEDIUM"
            ).upper()
        all_findings.extend(findings)

    total_findings = len(all_findings)
    total_critical = sum(s["critical"] for s in scanner_summaries)
    total_high = sum(s["high"] for s in scanner_summaries)

    if total_critical > 0:
        risk_level = "CRITICAL"
    elif total_high > 0:
        risk_level = "HIGH"
    elif total_findings > 0:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    lines = [
        "# Security Report", "",
        "> Generated by MCP Security Scanner",
        f"> Date: {now}",
        f"> Project: {project_name}", "",
        "## Executive Summary", "",
        f"**Risk Level:** {risk_level}",
        f"**Total Findings:** {total_findings}", "",
        "## Scan Results", "",
        "| Scanner | Format/Language | Findings | Critical | High | Medium | Low |",
        "|---------|----------------|----------|----------|------|--------|-----|",
    ]
    for s in scanner_summaries:
        lines.append(
            f"| {s['tool'].capitalize()} | {s['format']} | {s['total']} "
            f"| {s['critical']} | {s['high']} | {s['medium']} | {s['low']} |"
        )
    lines.append("")

    critical_high = [f for f in all_findings if f["_severity"] in ("CRITICAL", "HIGH", "ERROR")]
    medium_low = [f for f in all_findings if f["_severity"] not in ("CRITICAL", "HIGH", "ERROR")]

    if critical_high:
        lines.extend(["## Critical & High Severity Findings", ""])
        for i, f in enumerate(critical_high, 1):
            fid = f.get("check_id") or f.get("rule_id") or f.get("test_id") or "N/A"
            desc = f.get("description") or f.get("message") or f.get("check_name") or "N/A"
            line_num = (
                f.get("line_number")
                or f.get("line")
                or (f.get("line_range") or [None])[0]
                or "N/A"
            )
            lines.append(f"### {i}. {fid}")
            lines.append(f"- **Severity:** {f['_severity']}")
            lines.append(f"- **Scanner:** {f['_tool']}")
            lines.append(f"- **Line:** {line_num}")
            if f.get("resource"):
                lines.append(f"- **Resource:** {f['resource']}")
            lines.append(f"- **Description:** {desc}")
            if f.get("guideline"):
                lines.append(f"- **Guideline:** {f['guideline']}")
            lines.append("")

    if medium_low:
        lines.extend([
            "## Medium & Low Severity Findings", "",
            "| # | ID | Severity | Scanner | Line | Description |",
            "|---|-----|----------|---------|------|-------------|",
        ])
        for i, f in enumerate(medium_low, 1):
            fid = f.get("check_id") or f.get("rule_id") or f.get("test_id") or "N/A"
            desc = (f.get("description") or f.get("message") or f.get("issue_text") or f.get("check_name") or "N/A")[:80]
            line_num = f.get("line_number") or f.get("line") or "N/A"
            lines.append(f"| {i} | {fid} | {f['_severity']} | {f['_tool']} | {line_num} | {desc} |")
        lines.append("")

    findings_str = str(all_findings)
    lines.extend([
        "## Threat Model Inputs", "", "### STRIDE Classification", "",
        "| Threat | Applicable | Evidence |",
        "|--------|-----------|----------|",
        f"| Spoofing | {'Yes' if any(k in findings_str for k in ['auth', 'credential', 'password', 'token']) else 'Review needed'} | Check authentication mechanisms |",
        f"| Tampering | {'Yes' if any(k in findings_str for k in ['injection', 'input', 'validation', 'sanitiz']) else 'Review needed'} | Check input validation |",
        f"| Repudiation | {'Yes' if any(k in findings_str for k in ['log', 'audit', 'trail']) else 'Review needed'} | Check logging and audit trails |",
        f"| Information Disclosure | {'Yes' if any(k in findings_str for k in ['secret', 'hardcoded', 'password', 'key', 'encrypt']) else 'Review needed'} | Check data protection |",
        f"| Denial of Service | {'Yes' if any(k in findings_str for k in ['resource', 'limit', 'timeout']) else 'Review needed'} | Check resource limits |",
        f"| Elevation of Privilege | {'Yes' if any(k in findings_str for k in ['iam', 'privilege', 'admin', 'wildcard', 'root']) else 'Review needed'} | Check access controls |",
        "", "## Compliance & Regulatory Notes", "",
        "> Review findings against your applicable compliance frameworks.",
        "> Common frameworks: SOC2, PCI-DSS, HIPAA, GDPR.", "",
        "## Recommendations", "",
    ])

    if total_critical > 0:
        lines.append("1. **IMMEDIATE:** Address all CRITICAL severity findings before deployment")
    if total_high > 0:
        n = 2 if total_critical > 0 else 1
        lines.append(f"{n}. **HIGH PRIORITY:** Remediate HIGH severity findings in the current sprint")
    if total_findings > 0:
        lines.append("- Review and triage MEDIUM/LOW findings for backlog prioritization")
    lines.extend([
        "- Re-scan after remediation to verify fixes",
        "- Consider adding pre-commit hooks for continuous scanning", "",
        "## Tool Information", "",
        "- Scanner: [MCP Security Scanner](https://github.com/aws-samples/sample-mcp-security-scanner)",
        "",
    ])

    return {
        "success": True,
        "report": "\n".join(lines),
        "summary": {
            "risk_level": risk_level,
            "total_findings": total_findings,
            "scanners_used": [s["tool"] for s in scanner_summaries],
        },
    }
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
pytest tests/unit/test_report_generator.py -v --no-cov
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add security_scanner/report_generator.py tests/unit/test_report_generator.py
git commit -m "feat(security-scanner): add report generator with unit tests"
```

---

### Task 7: FastMCP Server

**Files:**
- Create: `security_scanner/server.py`
- Create: `tests/unit/test_server.py`

**Interfaces:**
- Consumes:
  - `run_checkov_scan(code, format_type)` from `security_scanner.scanners.checkov`
  - `run_directory_checkov_scan(directory_path)` from `security_scanner.scanners.checkov`
  - `run_semgrep_scan(code, language)` from `security_scanner.scanners.semgrep`
  - `run_directory_semgrep_scan(directory_path, language)` from `security_scanner.scanners.semgrep`
  - `run_bandit_scan(code)` from `security_scanner.scanners.bandit`
  - `run_directory_bandit_scan(directory_path)` from `security_scanner.scanners.bandit`
  - `run_ash_scan(directory_path, output_dir, delta_scan)` from `security_scanner.scanners.ash`
  - `generate_report(project_name, scan_results)` from `security_scanner.report_generator`
- Produces:
  - `mcp: FastMCP` instance at module level with 8 registered tools
  - `handle_exceptions(func) -> Callable` decorator
  - `main()` entry point

- [ ] **Step 1: Write failing tests**

Create `tests/unit/test_server.py`:

```python
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


class TestHandleExceptions:
    @pytest.mark.asyncio
    async def test_exception_returns_error_dict(self):
        from security_scanner.server import handle_exceptions

        @handle_exceptions
        async def failing():
            raise RuntimeError("something broke")

        result = await failing()
        assert result["success"] is False
        assert "something broke" in result["error"]

    @pytest.mark.asyncio
    async def test_success_passes_through(self):
        from security_scanner.server import handle_exceptions

        @handle_exceptions
        async def good():
            return {"success": True, "value": 42}

        result = await good()
        assert result == {"success": True, "value": 42}

    @pytest.mark.asyncio
    async def test_value_error_returns_error_dict(self):
        from security_scanner.server import handle_exceptions

        @handle_exceptions
        async def bad_input():
            raise ValueError("bad format")

        result = await bad_input()
        assert result["success"] is False
        assert "bad format" in result["error"]


class TestServerTools:
    @patch("security_scanner.server.run_checkov_scan", return_value={"tool": "checkov", "findings": []})
    @pytest.mark.asyncio
    async def test_scan_with_checkov_delegates(self, mock_scan):
        from security_scanner.server import scan_with_checkov
        result = await scan_with_checkov(code="code", format_type="terraform")
        mock_scan.assert_called_once_with("code", "terraform")
        assert result["tool"] == "checkov"

    @patch("security_scanner.server.run_semgrep_scan", return_value={"tool": "semgrep", "findings": []})
    @pytest.mark.asyncio
    async def test_scan_with_semgrep_delegates(self, mock_scan):
        from security_scanner.server import scan_with_semgrep
        result = await scan_with_semgrep(code="code", language="python")
        mock_scan.assert_called_once_with("code", "python")
        assert result["tool"] == "semgrep"

    @patch("security_scanner.server.run_bandit_scan", return_value={"tool": "bandit", "findings": []})
    @pytest.mark.asyncio
    async def test_scan_with_bandit_delegates(self, mock_scan):
        from security_scanner.server import scan_with_bandit
        result = await scan_with_bandit(code="x = 1")
        mock_scan.assert_called_once_with("x = 1")
        assert result["tool"] == "bandit"

    @patch("security_scanner.server.run_ash_scan", return_value={"success": True, "tool": "ash"})
    @pytest.mark.asyncio
    async def test_scan_directory_with_ash_delegates(self, mock_scan):
        from security_scanner.server import scan_directory_with_ash
        result = await scan_directory_with_ash(directory_path="/tmp")
        mock_scan.assert_called_once_with("/tmp", None, False)
        assert result["tool"] == "ash"

    @patch("security_scanner.server.run_directory_checkov_scan", return_value={"tool": "checkov"})
    @pytest.mark.asyncio
    async def test_scan_directory_with_checkov_delegates(self, mock_scan):
        from security_scanner.server import scan_directory_with_checkov
        result = await scan_directory_with_checkov(directory_path="/tmp")
        mock_scan.assert_called_once_with("/tmp")

    @patch("security_scanner.server.run_directory_semgrep_scan", return_value={"tool": "semgrep"})
    @pytest.mark.asyncio
    async def test_scan_directory_with_semgrep_delegates(self, mock_scan):
        from security_scanner.server import scan_directory_with_semgrep
        result = await scan_directory_with_semgrep(directory_path="/tmp", language="python")
        mock_scan.assert_called_once_with("/tmp", "python")

    @patch("security_scanner.server.run_directory_bandit_scan", return_value={"tool": "bandit"})
    @pytest.mark.asyncio
    async def test_scan_directory_with_bandit_delegates(self, mock_scan):
        from security_scanner.server import scan_directory_with_bandit
        result = await scan_directory_with_bandit(directory_path="/tmp")
        mock_scan.assert_called_once_with("/tmp")

    @patch("security_scanner.server.generate_report", return_value={"success": True, "report": "# Security Report"})
    @pytest.mark.asyncio
    async def test_generate_security_report_delegates(self, mock_report):
        from security_scanner.server import generate_security_report
        result = await generate_security_report(project_name="MyProject", scan_results='{"tool":"checkov"}')
        mock_report.assert_called_once_with("MyProject", '{"tool":"checkov"}')
        assert result["success"] is True


class TestMainEntryPoint:
    @patch("security_scanner.server.mcp")
    def test_main_stdio_by_default(self, mock_mcp):
        import os
        os.environ.pop("MCP_TRANSPORT", None)
        from security_scanner.server import main
        main()
        mock_mcp.run.assert_called_once_with(transport="stdio")

    @patch.dict("os.environ", {"MCP_TRANSPORT": "sse"})
    @patch("security_scanner.server.mcp")
    def test_main_sse_transport(self, mock_mcp):
        from security_scanner import server
        import importlib
        # reload to re-read env var
        importlib.reload(server)
        server.main()
        mock_mcp.run.assert_called_once_with(transport="sse", host="0.0.0.0", port=8765)
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
pytest tests/unit/test_server.py -v --no-cov 2>&1 | head -5
```

Expected: `ModuleNotFoundError`

- [ ] **Step 3: Write security_scanner/server.py**

```python
import os
from functools import wraps
from typing import Any, Callable

from loguru import logger
from mcp.server.fastmcp import FastMCP

from security_scanner.scanners.ash import run_ash_scan
from security_scanner.scanners.bandit import run_bandit_scan, run_directory_bandit_scan
from security_scanner.scanners.checkov import run_checkov_scan, run_directory_checkov_scan
from security_scanner.scanners.semgrep import run_semgrep_scan, run_directory_semgrep_scan
from security_scanner.report_generator import generate_report

mcp = FastMCP("security-scanner")


def handle_exceptions(func: Callable) -> Callable:
    """Catch exceptions in MCP tool handlers; return error dict instead of raising."""
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            logger.exception(f"Error in {func.__name__}")
            return {"success": False, "error": str(e)}
    return wrapper


@mcp.tool()
@handle_exceptions
async def scan_with_checkov(code: str, format_type: str) -> dict:
    """Scan IaC code with Checkov. format_type: terraform|cloudformation|kubernetes|dockerfile|arm|bicep|helm|kustomize"""
    return run_checkov_scan(code, format_type)


@mcp.tool()
@handle_exceptions
async def scan_with_semgrep(code: str, language: str) -> dict:
    """Scan source code with Semgrep. language: python|javascript|typescript|java|go|ruby|php|c|cpp|csharp|rust|kotlin|scala"""
    return run_semgrep_scan(code, language)


@mcp.tool()
@handle_exceptions
async def scan_with_bandit(code: str) -> dict:
    """Scan Python source code with Bandit."""
    return run_bandit_scan(code)


@mcp.tool()
@handle_exceptions
async def scan_directory_with_ash(
    directory_path: str,
    output_dir: str = "",
    delta_scan: bool = False,
) -> dict:
    """Scan a directory with ASH (multi-tool). Requires 'full' Docker target."""
    return run_ash_scan(directory_path, output_dir or None, delta_scan)


@mcp.tool()
@handle_exceptions
async def scan_directory_with_checkov(directory_path: str) -> dict:
    """Scan a directory with Checkov (all supported IaC formats)."""
    return run_directory_checkov_scan(directory_path)


@mcp.tool()
@handle_exceptions
async def scan_directory_with_semgrep(directory_path: str, language: str = "") -> dict:
    """Scan a directory with Semgrep."""
    return run_directory_semgrep_scan(directory_path, language)


@mcp.tool()
@handle_exceptions
async def scan_directory_with_bandit(directory_path: str) -> dict:
    """Scan a Python directory recursively with Bandit."""
    return run_directory_bandit_scan(directory_path)


@mcp.tool()
@handle_exceptions
async def generate_security_report(project_name: str, scan_results: str) -> dict:
    """Generate SECURITY.md report from scan results JSON (single object or array)."""
    return generate_report(project_name, scan_results)


def main() -> None:
    transport = os.getenv("MCP_TRANSPORT", "stdio")
    if transport == "sse":
        mcp.run(transport="sse", host="0.0.0.0", port=8765)
    else:
        mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run all unit tests — verify they pass and coverage ≥ 95%**

```bash
pytest tests/unit/ -v
```

Expected: all tests PASS, coverage ≥ 95%. If coverage is 93-94%, add tests for any uncovered branches shown in the report (use `--cov-report=term-missing` output to identify them).

- [ ] **Step 5: Commit**

```bash
git add security_scanner/server.py tests/unit/test_server.py
git commit -m "feat(security-scanner): add FastMCP server with tool registration and unit tests"
```

---

### Task 8: Integration Fixtures and Tests

**Files:**
- Create: `tests/integration/fixtures/insecure.tf`
- Create: `tests/integration/fixtures/insecure.py`
- Create: `tests/integration/fixtures/insecure.js`
- Create: `tests/integration/fixtures/insecure_k8s.yaml`
- Create: `tests/integration/test_checkov_integration.py`
- Create: `tests/integration/test_semgrep_integration.py`
- Create: `tests/integration/test_bandit_integration.py`

**Interfaces:**
- Consumes: `run_checkov_scan`, `run_directory_checkov_scan`, `run_semgrep_scan`, `run_bandit_scan` (all from earlier tasks)
- Produces: integration tests marked with `@pytest.mark.integration`

- [ ] **Step 1: Write fixture files**

Create `tests/integration/fixtures/insecure.tf`:

```hcl
# Terraform with known Checkov findings: public S3, unencrypted
resource "aws_s3_bucket" "insecure" {
  bucket = "my-insecure-bucket"
}

resource "aws_s3_bucket_public_access_block" "insecure" {
  bucket = aws_s3_bucket.insecure.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
```

Create `tests/integration/fixtures/insecure.py`:

```python
# Python with known Bandit findings
import subprocess

PASSWORD = "SuperSecret123"  # B105: hardcoded_password_string

def run_cmd(user_input):
    subprocess.call(user_input, shell=True)  # B602: subprocess_popen_with_shell_equals_true
    return eval(user_input)  # B307: use_of_eval
```

Create `tests/integration/fixtures/insecure.js`:

```javascript
// JavaScript with known Semgrep findings
const SECRET = "sk-1234567890abcdef1234567890abcdef";

function executeUserInput(input) {
    eval(input);
}

document.write("<script>alert('xss')</script>");
```

Create `tests/integration/fixtures/insecure_k8s.yaml`:

```yaml
# Kubernetes manifest with known Checkov findings
apiVersion: v1
kind: Pod
metadata:
  name: insecure-pod
spec:
  containers:
  - name: app
    image: nginx:latest
    securityContext:
      privileged: true
      allowPrivilegeEscalation: true
      runAsNonRoot: false
```

- [ ] **Step 2: Write integration tests**

Create `tests/integration/test_checkov_integration.py`:

```python
import pytest
from pathlib import Path

from security_scanner.scanners.checkov import run_checkov_scan, run_directory_checkov_scan

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.mark.integration
class TestCheckovIntegration:
    def test_terraform_scan_returns_correct_shape(self):
        code = (FIXTURES / "insecure.tf").read_text()
        result = run_checkov_scan(code, "terraform")
        assert result["tool"] == "checkov"
        assert result["format_type"] == "terraform"
        assert isinstance(result["findings"], list)
        assert isinstance(result["total_issues"], int)
        for finding in result["findings"]:
            assert "check_id" in finding
            assert "severity" in finding

    def test_kubernetes_scan_returns_correct_shape(self):
        code = (FIXTURES / "insecure_k8s.yaml").read_text()
        result = run_checkov_scan(code, "kubernetes")
        assert result["tool"] == "checkov"
        assert isinstance(result["findings"], list)

    def test_directory_scan_creates_report_file(self, tmp_path):
        import shutil
        shutil.copy(FIXTURES / "insecure.tf", tmp_path / "main.tf")
        result = run_directory_checkov_scan(str(tmp_path))
        assert result["tool"] == "checkov"
        assert Path(result["output_file"]).exists()
        assert Path(result["output_file"]).stat().st_size > 0
```

Create `tests/integration/test_semgrep_integration.py`:

```python
import pytest
from pathlib import Path

from security_scanner.scanners.semgrep import run_semgrep_scan

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.mark.integration
class TestSemgrepIntegration:
    def test_javascript_scan_returns_correct_shape(self):
        code = (FIXTURES / "insecure.js").read_text()
        result = run_semgrep_scan(code, "javascript")
        assert result["tool"] == "semgrep"
        assert result["language"] == "javascript"
        assert isinstance(result["findings"], list)
        assert isinstance(result["total_issues"], int)
        for finding in result["findings"]:
            assert "rule_id" in finding
            assert "severity" in finding

    def test_python_scan_returns_correct_shape(self):
        code = (FIXTURES / "insecure.py").read_text()
        result = run_semgrep_scan(code, "python")
        assert result["tool"] == "semgrep"
        assert isinstance(result["findings"], list)
```

Create `tests/integration/test_bandit_integration.py`:

```python
import pytest
from pathlib import Path

from security_scanner.scanners.bandit import run_bandit_scan

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.mark.integration
class TestBanditIntegration:
    def test_python_finds_known_issues(self):
        code = (FIXTURES / "insecure.py").read_text()
        result = run_bandit_scan(code)
        assert result["tool"] == "bandit"
        assert result["total_issues"] > 0
        for finding in result["findings"]:
            assert "test_id" in finding
            assert "issue_severity" in finding
            assert finding["issue_severity"] in ("HIGH", "MEDIUM", "LOW")

    def test_clean_code_no_findings(self):
        result = run_bandit_scan("x = 1 + 2\nprint(x)\n")
        assert result["tool"] == "bandit"
        assert result["total_issues"] == 0
```

- [ ] **Step 3: Run unit tests to confirm nothing broken**

```bash
pytest tests/unit/ -v --no-cov
```

Expected: all unit tests PASS.

- [ ] **Step 4: Commit**

```bash
git add tests/integration/
git commit -m "test(security-scanner): add integration fixtures and integration tests"
```

---

### Task 9: Docker

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`

**Interfaces:**
- Produces: `docker compose up security-scanner` starts MCP server on port 8765 within 30s

- [ ] **Step 1: Write Dockerfile**

```dockerfile
FROM python:3.12-slim AS base

WORKDIR /app

# Install OS deps for Checkov (git for git-based rules) and Semgrep
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install core security scanners
RUN pip install --no-cache-dir \
    "checkov>=3.0.0" \
    "semgrep>=1.45.0" \
    "bandit>=1.7.5" \
    "loguru>=0.6.0" \
    "mcp[cli]>=1.11.0" \
    "pydantic>=2.0.0"

# Copy and install the package
COPY security_scanner/ ./security_scanner/
COPY pyproject.toml .

RUN pip install --no-cache-dir -e . --no-deps

ENV MCP_TRANSPORT=sse
EXPOSE 8765

CMD ["security-scanner"]

# Full target: adds Ruby (cfn-nag) + Node 20 (npm-audit) + ASH
FROM base AS full

RUN apt-get update && apt-get install -y --no-install-recommends \
    ruby-full \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN gem install cfn-nag

RUN pip install --no-cache-dir \
    "automated-security-helper @ git+https://github.com/awslabs/automated-security-helper.git@v3.2.7"

EXPOSE 8765
CMD ["security-scanner"]
```

- [ ] **Step 2: Write docker-compose.yml**

```yaml
services:
  security-scanner:
    build:
      context: .
      target: base
    ports:
      - "8765:8765"
    environment:
      - MCP_TRANSPORT=sse
    volumes:
      - ${SCAN_TARGET:-./}:/workspace:ro
      - ./.security-reports:/reports

  security-scanner-full:
    profiles:
      - full
    build:
      context: .
      target: full
    ports:
      - "8765:8765"
    environment:
      - MCP_TRANSPORT=sse
    volumes:
      - ${SCAN_TARGET:-./}:/workspace:ro
      - ./.security-reports:/reports
```

- [ ] **Step 3: Build and smoke-test**

```bash
# Build base image
docker compose build security-scanner

# Start and verify it comes up
docker compose up -d security-scanner
sleep 10
curl -f http://localhost:8765/sse || echo "FAIL: server not responding"
docker compose down
```

Expected: curl returns a response (SSE endpoint active).

- [ ] **Step 4: Commit**

```bash
git add Dockerfile docker-compose.yml
git commit -m "feat(security-scanner): add Dockerfile (base+full) and docker-compose"
```

---

### Task 10: Wire into agent-architecture

**Files:**
- Modify: `agent-architecture/packages/skills/package.json` — add `"security-scanner/"` to `files[]`

**Interfaces:**
- Consumes: SKILL.md, mcp.json from Task 1
- Produces: `security-scanner` skill visible in agent-architecture catalog; `npx agent-architecture install` picks up `mcp.json`

- [ ] **Step 1: Add security-scanner to skills package.json**

Edit `agent-architecture/packages/skills/package.json`. Add `"security-scanner/"` to the `files[]` array in alphabetical order (between `"security-review/"` and `"seniorswe-concise/"`):

```json
"security-review/",
"security-scanner/",
"seniorswe-concise/",
```

- [ ] **Step 2: Rebuild governance inventory and run governance check**

```bash
cd agent-architecture/../../   # repo root (tstack/)
npm run governance:build
```

Expected output: `Components discovered: <N>` where N is ≥693 (one more than before).

- [ ] **Step 3: Run agent-architecture metadata validation**

```bash
cd agent-architecture
npm run validate:metadata
```

Expected: PASS (SKILL.md has required `name`, `description`, `agents` fields).

- [ ] **Step 4: Full unit test run with coverage gate**

```bash
cd agent-architecture/packages/skills/security-scanner
pytest tests/unit/ -v
```

Expected: all PASS, coverage ≥ 95%.

- [ ] **Step 5: Commit**

```bash
# From repo root
git add agent-architecture/packages/skills/package.json \
        agent-architecture/packages/skills/security-scanner/ \
        generated/governance-inventory.json \
        generated/governance-summary.md
git commit -m "feat(security-scanner): wire into agent-architecture skills package"
```

---

## Self-Review Checklist

### Spec Coverage

| Spec requirement | Task |
|---|---|
| Target `packages/skills/security-scanner/` | Task 1 scaffold |
| Monolith → modules (checkov/semgrep/bandit/ash) | Tasks 2–5 |
| `report_generator.py` inside `security_scanner/` | Task 6 |
| `server.py` with FastMCP + handle_exceptions | Task 7 |
| 8 MCP tools registered | Task 7 |
| Directory scan tools write to `.security-reports/` | Tasks 2–5 |
| 95% coverage gate | pyproject.toml in Task 1, enforced Task 7 step 4 |
| Unit tests mock subprocess.run | Tasks 2–5 unit tests |
| Integration tests with fixture files | Task 8 |
| Docker base + full targets | Task 9 |
| SSE port 8765 / stdio local | Task 9 + server.py |
| SKILL.md with agents: [security, swe, qa-agent] | Task 1 |
| mcp.json wired via agent-architecture install | Task 1 + Task 10 |
| Wire packages/skills/package.json | Task 10 |

All spec requirements covered. No gaps.
