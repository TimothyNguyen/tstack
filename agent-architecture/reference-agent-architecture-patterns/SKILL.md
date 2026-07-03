---
name: reference-agent-architecture-patterns
version: 0.1.0
description: |
  Quick reference for the agent-architecture repo conventions. Covers
  agents, skills, governance, testing, and proof-of-done workflow.
  Read once when adding, editing, or restructuring any skill or agent.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
agents: [_infrastructure, swe, orchestrate, qa-agent]
---

## Enterprise Preamble

- Stay inside the current project unless the user explicitly names another path.
- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.
- Use policy-gated tools only when the active profile allows them.
- Commit after each discrete behavior change — do not accumulate unrelated edits across multiple files before committing.
- Each commit message must follow Conventional Commits: `<type>[scope]: <description>` (types: feat, fix, docs, refactor, test, chore, perf, ci).
- Never use `--no-verify`, `--force` (use `--force-with-lease`), or `--no-gpg-sign` unless explicitly instructed.
- Sequence for rebasing: stage → commit → fetch → rebase → push.

# Agent Architecture Patterns Reference

## Repo layout

```text
agents/<name>/SKILL.md.tmpl          # role-based agent definition
<skill>/SKILL.md.tmpl                # top-level skills (qa, review, health, …)
packages/skills/<name>/SKILL.md.tmpl # packaged skills (security-scanner, …)
packages/adapters/<name>/            # framework adapters (ag-ui, langgraph, …)
packages/stacks/<name>/              # stack profiles (aws, databricks, …)
plugins/agent-architecture/skills/   # committed mirror of all generated SKILL.md files
```

## Skill folder shape

```text
<skill>/SKILL.md.tmpl          # source — always edit this, never the generated file
<skill>/SKILL.md               # generated: npm run build:skills
<skill>/GOVERNANCE.yaml        # required for governance:check:hard
<skill>/sections/*.md.tmpl     # optional sub-templates
```

`## Enterprise Preamble

- Stay inside the current project unless the user explicitly names another path.
- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.
- Use policy-gated tools only when the active profile allows them.
- Commit after each discrete behavior change — do not accumulate unrelated edits across multiple files before committing.
- Each commit message must follow Conventional Commits: `<type>[scope]: <description>` (types: feat, fix, docs, refactor, test, chore, perf, ci).
- Never use `--no-verify`, `--force` (use `--force-with-lease`), or `--no-gpg-sign` unless explicitly instructed.
- Sequence for rebasing: stage → commit → fetch → rebase → push.`, `## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.`, `## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.` are substituted
by `scripts/gen-skill-docs.mjs` at build time.

## Skill frontmatter (required fields)

```yaml
---
name: my-skill           # matches folder name
version: 0.1.0           # semver
description: |           # multi-line, ends with period
  What the skill does.
agents: [swe, qa-agent]  # which agents declare this skill
---
```

## GOVERNANCE.yaml (required)

```yaml
name: my-skill
type: skill             # skill | adapter | stack | agent
status: stable          # stable | beta | experimental | deprecated
version: 0.1.0
owner: <team>
description: |
  One-line description.
dependencies:
  skills: []
  adapters: []
  tools: [python, npm]
  mcps: []
testing:
  coverage_target: 95
  types: [unit, integration]
documentation:
  readme: true
  spec: false
  examples_min: 2
used_by: []
governance_version: '1.0'
last_reviewed: 'YYYY-MM-DD'
```

## Agent definition shape

```text
agents/<name>/SKILL.md.tmpl    # agent persona + workflow steps + sub-skill routing
```

Agent frontmatter uses `agents: [_infrastructure]`. The `_infrastructure` tag
marks it as an agent definition, not a user-facing skill.

## Build + check workflow

```bash
npm run build:skills      # regenerate all SKILL.md from .tmpl
npm run check:skills      # orphan check, frontmatter lint
npm test                  # governance:check:hard (pre-commit hook also runs this)
```

Always commit `.tmpl` and generated `.md` together.

## Adding a new skill

1. Create `<skill>/SKILL.md.tmpl` and `<skill>/GOVERNANCE.yaml`.
2. Add `agents:` list in frontmatter.
3. Run `npm run build:skills && npm run check:skills && npm test`.
4. Register in `docs/skill-catalog.md` and `docs/module-map.md`.
5. Commit everything (template + generated + governance).

## Python skills: testing pattern

```text
packages/skills/<name>/
  <name>/              # Python package
  tests/unit/          # fast, no external tools
  tests/integration/   # requires real tools; run in Docker
  pyproject.toml       # --cov-fail-under=95 required
```

Run unit tests locally. Run integration tests via Docker:

```bash
docker build -t <name>-test --target base .
docker run --rm <name>-test bash -c "pip install pytest pytest-cov pytest-asyncio -q && python -m pytest tests/ --no-cov"
```

## Proof-of-done gate (qa-verify)

Before any completion claim or PR:

```bash
python .agent/skills/qa-verify/qa_verify.py --cmd "<test command>"
cat QA-RECEIPT.md   # must show PASS
```

Receipt is stale if files, commands, or base commit changes — rerun then.

## Plugin mirrors

`plugins/agent-architecture/skills/` contains committed copies of every
generated `SKILL.md`. The install script reads these mirrors when installing
into another repo. Mirrors are regenerated by `node scripts/install.mjs`.

A mirror with no corresponding `.tmpl` source is an orphan and must be removed.

## Governance check

The pre-commit hook runs `npm run governance:check:hard`. It fails if any
tracked component is missing a valid `GOVERNANCE.yaml`. Fix by adding the
file and running `npm test`.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
