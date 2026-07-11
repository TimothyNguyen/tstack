# git-quality — Spec

Agent-callable quality gates for git commits, pushes, linting, bug detection, and security scanning.
Runs 100% local. No credential reads. No external egress.

---

## G

G1: Agent can produce well-formed commits (conventional format, atomic scope, no secrets) via MCP tools.
G2: Agent can run pre-push quality gate (lint + type check + tests + secret scan) before any `git push`.
G3: Agent can surface security issues (SAST, dependency audit) without leaving the local machine.
G4: Gate tools pluggable per project via config file — no hard-coded linters.
G5: Skills (`git-commit`, `git-push`) orchestrate tools in defined order; human approves push.

---

## C

C1: ⊥ external egress from MCP server. Tools run as local subprocesses only.
C2: ⊥ credential reads from keychain, `.env`, or system config. Tools receive no auth tokens.
C3: ⊥ global git config mutation. No `git config --global` writes.
C4: ⊥ force push to protected branches (`main`, `master`, `release/*`) without explicit user confirmation.
C5: ⊥ silent pass on security findings — findings always surface, agent cannot override them without user acknowledgment.
C6: All tool binaries must be on `$PATH` at invocation time; missing binary → clean error + install hint, not traceback.
C7: MCP server must be runnable offline/air-gapped (no npm install at runtime, no pip HTTP fallback).
C8: Each MCP tool call is idempotent — safe to retry on partial failure.
C9: Config file (`.git-quality.json`) is project-local only; global user config ignored without explicit opt-in.

---

## I

### MCP Server

```
cmd: `git-quality-mcp` → stdio MCP server (JSON-RPC 2.0)
lang: Python 3.10+  (matches codebase-engine floor)
install: `pip install git-quality-mcp`  or  `uv tool install git-quality-mcp`
config: `.git-quality.json` at project root (optional; falls back to auto-detect)
```

### MCP Tools

```
tool: git_lint(staged: bool = True) → {passed: bool, output: str, tool: str}
  - runs configured linter (ruff/eslint/flake8/etc.) on staged or all files
  - auto-detect: ruff if pyproject.toml, eslint if package.json, else skip

tool: git_type_check(staged: bool = False) → {passed: bool, output: str, tool: str}
  - runs configured type checker (mypy/tsc/pyright)
  - auto-detect: mypy if pyproject.toml, tsc if tsconfig.json, else skip

tool: git_test(scope: "staged" | "all" | "none" = "staged") → {passed: bool, output: str, duration_s: float}
  - runs project test suite; "staged" infers affected test files via git diff

tool: git_secret_scan(staged: bool = True) → {passed: bool, findings: list[{file, line, pattern}]}
  - runs detect-secrets or trufflehog-local on staged diff
  - findings → agent must surface ALL; user must acknowledge before push

tool: git_sast(paths: list[str] | None = None) → {passed: bool, findings: list[{file, line, rule, severity}]}
  - runs semgrep (if installed) or bandit (Python) on specified paths or git diff
  - severity: critical | high | medium | low
  - critical/high → block commit unless user overrides

tool: git_dep_audit() → {passed: bool, findings: list[{package, severity, advisory_id, installed, fixed}]}
  - runs pip-audit (Python) or npm audit (JS) locally
  - ⊥ sends data to external registries not already configured for the package manager

tool: git_commit_validate(message: str) → {passed: bool, issues: list[str]}
  - validates against conventional commits spec (type, scope, subject length)
  - configurable max_subject_len (default 72), required_types list

tool: git_diff_summary(staged: bool = True) → {files_changed: int, insertions: int, deletions: int, summary: str}
  - lightweight diff stat; used by agent to draft commit message context
```

### Config Schema (`.git-quality.json`)

```json
{
  "lint": {"tool": "ruff", "args": ["check", "--fix"], "on": ["staged"]},
  "type_check": {"tool": "mypy", "args": ["--strict"], "on": ["pre-push"]},
  "test": {"tool": "pytest", "args": ["-x", "-q"], "on": ["pre-push"]},
  "secret_scan": {"tool": "detect-secrets", "on": ["staged", "pre-push"]},
  "sast": {"tool": "semgrep", "ruleset": "auto", "on": ["pre-push"]},
  "dep_audit": {"tool": "pip-audit", "on": ["pre-push"]},
  "commit_message": {"style": "conventional", "max_subject_len": 72},
  "protected_branches": ["main", "master", "release/*"],
  "allow_force_push": false
}
```

### Skills

```
skill: git-commit  →  SKILL.md.tmpl at agent-pack/git-commit/
  trigger: user says "commit", "stage and commit", "/git-commit"
  workflow:
    1. git_diff_summary(staged=True) → get context
    2. git_lint(staged=True) → fix or surface issues
    3. git_secret_scan(staged=True) → block if findings
    4. git_commit_validate(draft_message) → iterate until valid
    5. present staged diff + message → wait for human approval
    6. execute `git commit` → never auto-execute without approval

skill: git-push  →  SKILL.md.tmpl at agent-pack/git-push/
  trigger: user says "push", "ship to remote", "/git-push"
  workflow:
    1. check current branch against protected_branches → warn if protected
    2. git_lint(staged=False) → full repo lint
    3. git_type_check(staged=False)
    4. git_test(scope="all")
    5. git_secret_scan(staged=False) → full repo scan
    6. git_sast() → surface critical/high; user must acknowledge
    7. git_dep_audit() → surface findings
    8. present gate summary → wait for human approval
    9. execute `git push` → never auto-push without approval
```

---

## V

V1: ∀ MCP tool call → binary resolved via `shutil.which`; missing → `RuntimeError("X not found on $PATH. Install: <url>")`
V2: ∀ `git_secret_scan` finding → agent surfaces to user; ⊥ silent suppress
V3: `git_sast` severity=critical|high → `passed=False`; agent ⊥ proceed without user acknowledgment
V4: ∀ push to branch matching `protected_branches` pattern → agent prompts for confirmation; ⊥ auto-push
V5: `allow_force_push=false` (default) → MCP rejects `--force` flag suggestion; user must set true in config
V6: ∀ tool → timeout honoured via `CODEBASE_ENGINE_API_TIMEOUT` pattern (`GIT_QUALITY_TOOL_TIMEOUT`, default 120s)
V7: Config loaded from project-local `.git-quality.json` only; ⊥ read from `~/.git-quality.json` without `GIT_QUALITY_ALLOW_GLOBAL_CONFIG=1`
V8: ∀ tool result → `passed` key always present; agent uses `passed=False` to block, never parses raw output for pass/fail

---

## T

| id | status | task | cites |
|----|--------|------|-------|
| T1 | . | create `git-quality-mcp/` Python package skeleton (pyproject.toml, entry points) | I.MCP |
| T2 | . | implement `git_lint` tool with ruff/eslint auto-detect | I.tools, V1 |
| T3 | . | implement `git_secret_scan` tool with detect-secrets | I.tools, V2 |
| T4 | . | implement `git_sast` tool with semgrep + bandit fallback | I.tools, V3 |
| T5 | . | implement `git_commit_validate` tool (conventional commits parser) | I.tools |
| T6 | . | implement `git_diff_summary` tool | I.tools |
| T7 | . | implement `git_type_check` tool (mypy/tsc auto-detect) | I.tools, V1 |
| T8 | . | implement `git_test` tool (staged scope via git diff) | I.tools |
| T9 | . | implement `git_dep_audit` tool (pip-audit / npm audit) | I.tools |
| T10 | . | `.git-quality.json` loader + schema validation | I.config, V7 |
| T11 | . | `git-commit/SKILL.md.tmpl` skill | I.skills |
| T12 | . | `git-push/SKILL.md.tmpl` skill | I.skills, V4, V5 |
| T13 | . | tests: unit for each MCP tool (missing binary, passing, failing, timeout) | V1–V8 |
| T14 | . | tests: skill-catalog + skill-generation coverage for git-commit, git-push | — |
| T15 | . | add `git-commit` + `git-push` to `docs/skill-catalog.md` + root router | — |

Status: `x` done, `~` wip, `.` todo.

---

## B

| id | date | cause | fix |
|----|------|-------|-----|
| (none yet) | — | — | — |

---

## Open Questions

Q1: Secret scanner — `detect-secrets` (Python) or `trufflehog` (Go binary, harder to install)? Recommend detect-secrets as lighter dep; trufflehog as opt-in via config.
Q2: Should `git_test` infer affected tests from AST impact (codebase-engine `affected`) or simple git-diff path matching? Start with path matching; upgrade to codebase-engine integration in T8 v2.
Q3: MCP server auth — stdio transport (no auth needed, local process only) or HTTP with bearer? Stdio is simpler and matches enterprise no-egress policy. HTTP only if remote-agent use case emerges.
Q4: Should `git-commit` and `git-push` be separate skills or merged into `ship`? Recommend separate — cleaner trigger, easier to test, matches single-behavior-per-skill constraint (C1 in SPEC.md).
