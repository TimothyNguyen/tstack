# Security Scanner MCP — Design Spec

**Date:** 2026-07-02
**Status:** Approved
**Source repo:** `aws-samples/sample-mcp-security-scanner` (cloned to `tstack/sample-mcp-security-scanner/`)

---

## Goal

Port the security scanner MCP server into agent-pack as a first-class skill package. Containerise it with Docker. Wire it into the agent skill system so any agent (`/security`, `/swe`, `/qa-agent`) can invoke scanning tools without extra setup.

No external API keys. No Bedrock. No Ollama. No Strands. Pure MCP server + Docker.

---

## What the Source Repo Contains

- **FastMCP server** (`security_scanner_mcp_server/server.py`) — already uses `mcp.server.fastmcp.FastMCP`, no AWS SDK
- **Scanners:** Checkov (IaC), Semgrep (source code), Bandit (Python), ASH (multi-tool)
- **Report generator** (`report_generator.py`) — produces SECURITY.md from scan results
- **No Bedrock/Amazon Q code** — README mentions Amazon Q as a supported IDE consumer, not a dependency
- **ASH is heavy** — pulls Ruby (cfn-nag) + Node (npm-audit); treated as optional

---

## Target Location

```
agent-pack/packages/skills/security-scanner/
```

Installed as an `@agent-pack/security-scanner` workspace package, parallel to `atlassian-docs`, `codebase-engine`, etc.

---

## Architecture

### Package Structure

```
packages/skills/security-scanner/
├── security_scanner/
│   ├── __init__.py
│   ├── server.py              # FastMCP init, tool registration, handle_exceptions
│   ├── report_generator.py   # generate_security_report tool
│   └── scanners/
│       ├── __init__.py
│       ├── checkov.py         # IaC scanner (Terraform, CF, K8s, Dockerfile, …)
│       ├── semgrep.py         # Source code scanner (13 languages)
│       ├── bandit.py          # Python-only scanner
│       └── ash.py             # Multi-tool scanner (optional, ASH must be installed)
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   │   ├── test_checkov.py
│   │   ├── test_semgrep.py
│   │   ├── test_bandit.py
│   │   ├── test_ash.py
│   │   ├── test_report_generator.py
│   │   └── test_server.py
│   └── integration/
│       ├── fixtures/          # sample IaC + Python files with known findings
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

### Refactor: Monolith → Modules

The original `server.py` is ~1200 lines. Split `SecurityScanner` class methods into dedicated scanner modules. Each scanner module exposes a single public function:

```python
# scanners/checkov.py
def run_checkov_scan(code: str, format_type: str) -> List[Dict]: ...

# scanners/semgrep.py
def run_semgrep_scan(code: str, language: str) -> List[Dict]: ...

# scanners/bandit.py
def run_bandit_scan(code: str) -> List[Dict]: ...

# scanners/ash.py
def run_ash_scan(directory_path: str, ...) -> Dict: ...
def check_ash_available() -> Tuple[bool, Optional[str]]: ...
```

`server.py` registers MCP tools and delegates to these functions. `handle_exceptions` decorator stays in `server.py`.

---

## MCP Tools Exposed

| Tool | Scanner | Input | Output |
|---|---|---|---|
| `scan_with_checkov` | Checkov | `code: str`, `format_type: str` | findings list + summary |
| `scan_with_semgrep` | Semgrep | `code: str`, `language: str` | findings list + summary |
| `scan_with_bandit` | Bandit | `code: str` | findings list + summary |
| `scan_directory_with_ash` | ASH | `directory_path: str`, options | summary + output file path |
| `scan_directory_with_checkov` | Checkov | `directory_path: str` | summary + output file path |
| `scan_directory_with_semgrep` | Semgrep | `directory_path: str`, `language: str` | summary + output file path |
| `scan_directory_with_bandit` | Bandit | `directory_path: str` | summary + output file path |
| `generate_security_report` | — | `project_name: str`, `scan_results: str` (JSON) | SECURITY.md content |

Directory scan tools write results to `.security-reports/<tool>/<timestamp>.json` and return a lightweight summary + file path (prevents context overflow).

---

## Docker

### Dockerfile — two build targets

**`base` target:** Python 3.12-slim + checkov + semgrep + bandit + fastmcp. ~800MB image.

**`full` target:** extends base, adds Ruby (cfn-nag) + Node 20 (npm-audit) + ASH. ~2GB image.

```dockerfile
FROM python:3.12-slim AS base
# ... install core deps

FROM base AS full
# ... add Ruby, Node, ASH
```

### docker-compose.yml

```yaml
services:
  security-scanner:
    build:
      context: .
      target: base
    ports: ["8765:8765"]
    environment:
      - MCP_TRANSPORT=sse
    volumes:
      - ${SCAN_TARGET:-./}:/workspace:ro
      - ./.security-reports:/reports

  security-scanner-full:
    profiles: ["full"]
    build:
      context: .
      target: full
    ports: ["8765:8765"]
    environment:
      - MCP_TRANSPORT=sse
    volumes:
      - ${SCAN_TARGET:-./}:/workspace:ro
      - ./.security-reports:/reports
```

### MCP Transport

- **SSE (HTTP)** when `MCP_TRANSPORT=sse` — used in Docker, binds `:8765`
- **stdio** when `MCP_TRANSPORT=stdio` — used for local dev (`uvx security-scanner`)

Controlled by env var, defaulting to stdio for local, SSE for container.

---

## agent-pack Integration

### SKILL.md frontmatter

```yaml
name: security-scanner
description: >
  MCP server providing Checkov (IaC), Semgrep (source), Bandit (Python),
  and ASH (multi-tool) security scanning. Produces SECURITY.md reports.
  Requires Docker or local tool install.
agents: [security, swe, qa-agent]
mcp: security-scanner
disable-model-invocation: false
trigger: scan|checkov|semgrep|bandit|vulnerability|IaC|security report
```

### mcp.json (installed into `.agent/`)

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

### Agent Usage

- `/security` — primary owner: full scan orchestration, report generation
- `/swe` — scan generated IaC or Python before commit
- `/qa-agent` — security gate: scan before marking tests green

Any agent that has the MCP registered can call tools directly. No separate orchestration layer needed — the calling agent (Claude Code) drives the tool chain.

---

## Testing Strategy

### Coverage Gate: 95%

```toml
[tool.pytest.ini_options]
addopts = "--cov=security_scanner --cov-report=term-missing --cov-fail-under=95"
```

### Unit Tests (no external tools required)

Mock `subprocess.run` for all scanner tests. Mock `shutil.which` for ASH availability checks.

| Module | Key test cases |
|---|---|
| `checkov.py` | all IaC formats, unsupported format raises, empty findings, non-zero exit, parse error |
| `semgrep.py` | all 13 languages, no findings (clean), parse error, temp file cleanup |
| `bandit.py` | findings present, clean scan, unsupported file type |
| `ash.py` | ASH available/unavailable, delta scan, full dir, output file save |
| `security_scanner/report_generator.py` | single result, multi-result array, invalid JSON, all severity levels, empty findings |
| `server.py` | tool registration count, tool call round-trip via FastMCP test client, exception propagation |

### Integration Tests (real tools, Docker or local install)

Fixture files in `tests/integration/fixtures/`:
- `insecure.tf` — Terraform with known Checkov findings
- `insecure.py` — Python with known Bandit findings
- `insecure.js` — JS with known Semgrep findings
- `insecure_k8s.yaml` — K8s manifest with known Checkov findings

Integration tests verify real tool output shape, not exact findings (tool versions vary).

### CI

- Unit tests: run without Docker, mocked subprocess
- Integration tests: run in `base` Docker image, `pytest -m integration`

---

## Out of Scope

- SQLite persistence (use timestamped report files)
- Strands agent layer
- Ollama / local LLM
- Amazon Q / Bedrock (no code dependency existed; README references removed)
- Grype / Trivy / SBOM scanning (ASH full profile covers these; not exposed as separate tools)

---

## Success Criteria

1. `docker compose up security-scanner` starts in <30s
2. `scan_with_checkov`, `scan_with_semgrep`, `scan_with_bandit` callable via MCP
3. `generate_security_report` produces valid SECURITY.md
4. `pytest --cov` reports ≥95% coverage
5. `npx agent-pack install` wires `mcp.json` into `.agent/`
6. `/security`, `/swe`, `/qa-agent` agents list `security-scanner` MCP in their configs
