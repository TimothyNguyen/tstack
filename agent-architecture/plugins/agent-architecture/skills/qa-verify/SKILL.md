---
name: qa-verify
version: 1.0.0
description: |
  Proof-of-done verification gate for AI coding agents. Scans changed files
  for unfinished markers, silent failures, unsafe patterns, and hardcoded
  credentials. Runs your verification command and writes a timestamped
  QA-RECEIPT.md with machine-readable evidence. Invoke before any completion
  claim, commit, or PR.
allowed-tools:
  - Read
  - Bash
agents: [qa-agent, swe, security, release-agent]
---

## Enterprise Preamble

- Stay inside the current project unless the user explicitly names another path.
- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.
- Use policy-gated tools only when the active profile allows them.
- Commit after each discrete behavior change — do not accumulate unrelated edits across multiple files before committing.
- Each commit message must follow Conventional Commits: `<type>[scope]: <description>` (types: feat, fix, docs, refactor, test, chore, perf, ci).
- Never use `--no-verify`, `--force` (use `--force-with-lease`), or `--no-gpg-sign` unless explicitly instructed.
- Sequence for rebasing: stage → commit → fetch → rebase → push.

# QA Verify

Proof-of-done gate. No completion claim without a passing receipt.

## Usage

Run before claiming work complete, committing, or creating a PR:

```bash
python .agent/skills/qa-verify/qa_verify.py --cmd "<project test command>"
```

Examples:

```bash
python .agent/skills/qa-verify/qa_verify.py --cmd "pytest -q"
python .agent/skills/qa-verify/qa_verify.py --cmd "npm test"
python .agent/skills/qa-verify/qa_verify.py --cmd "go test ./..."
```

Read the receipt:

```bash
cat QA-RECEIPT.md
```

If receipt shows `FAIL`:
1. Read each flagged finding
2. Fix the issue in source
3. Re-run `qa_verify.py`
4. Only proceed when receipt shows `PASS`

If no test command applies, document the reason:

```bash
python .agent/skills/qa-verify/qa_verify.py --skip-reason "DATABASE_URL not available in CI"
```

Scan every tracked file instead of just changed files:

```bash
python .agent/skills/qa-verify/qa_verify.py --all --cmd "pytest -q"
```

## What It Detects

| Rule | Pattern |
|------|---------|
| `unfinished_marker` | `TODO`, `FIXME`, `XXX`, `HACK`, `not implemented`, `coming soon`, `stub` |
| `python_silent_failure` | `except ...: pass` or `except ...: return None` |
| `js_silent_failure` | `catch(...) {}` — empty catch block |
| `unsafe_eval` | `eval(...)`, `exec(...)` |
| `secret_literal` | `api_key = "..."`, `password = "..."` in source |
| `thin_proof_file` | Proof file claims tests passed without command output, exit code, or timestamp |
| `stale_proof` | `QA-RECEIPT.md` hash doesn't match current files/commands |
| `missing_path_evidence` | Changed file not covered by a narrow verification command |

## Gate Rule

**QA-RECEIPT.md shows FAIL = work is not done. No exceptions.**

```
✅ qa-verify PASS → attach QA-RECEIPT.md → claim complete
❌ "Should be fine" / "Looks good" without running qa-verify
```

## QA-RECEIPT.md in PRs

Paste the `QA-RECEIPT.md` status line and timestamp in the PR body as
machine-readable proof. Reviewers verify the receipt timestamp is after the
final commit.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
