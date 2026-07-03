---
name: donecheck
version: 0.1.0
description: |
  Proof-of-done gate for AI coding agents. Scans changed files for AI
  anti-patterns (TODOs, placeholders, swallowed exceptions, eval/exec,
  hardcoded credentials) and generates a timestamped DONECHECK.md receipt.
  Invoke before any completion claim, PR creation, or task handoff.
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

# DoneCheck

Proof-of-done gate sourced from [AtharvaMaik/donecheck](https://github.com/AtharvaMaik/donecheck).
No completion claim without a passing receipt.

## Install

```bash
pipx install git+https://github.com/AtharvaMaik/donecheck
```

## Usage

Run before claiming work complete, committing, or creating a PR:

```bash
donecheck --cmd "<project test command>"
# e.g. donecheck --cmd "pytest -q"
# e.g. donecheck --cmd "npm test"
```

Read the receipt:

```bash
cat DONECHECK.md
```

If receipt shows `FAIL`:
1. Read each flagged pattern
2. Fix the finding
3. Re-run `donecheck`
4. Only proceed when receipt shows `PASS`

If no test command exists yet:

```bash
donecheck --all
```

To skip with documented reason:

```bash
donecheck --skip-reason "DATABASE_URL not available in CI"
```

## What It Catches

| Pattern | Example |
|---------|---------|
| Incomplete markers | `TODO`, `FIXME`, `raise NotImplementedError` |
| Placeholder bodies | `...`, stub returns, `pass` |
| Swallowed exceptions | bare `except: pass` |
| Dangerous ops | `eval(...)`, `exec(...)` |
| Hardcoded credentials | API keys, passwords in source |
| Missing test output | Verification command produced no output |
| Outdated receipts | Receipt older than latest change |

## Gate Rule

**DONECHECK.md shows FAIL = work is not done. No exceptions.**

```
✅ donecheck PASS → attach DONECHECK.md → claim complete
❌ "Should be fine" / "Looks good" without running donecheck
```

## PR Evidence

Paste the `DONECHECK.md` receipt (or its status line + timestamp) in the PR body.
Reviewers verify the receipt timestamp is after the final commit.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
