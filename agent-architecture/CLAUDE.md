# CLAUDE.md

Claude Code guidance for `agent-architecture/`.

## Knowledge Graph

A knowledge graph of this codebase lives at `codebase-out/GRAPH_REPORT.md`.

**Read `codebase-out/GRAPH_REPORT.md` BEFORE reading individual files.** It maps
the 300+ communities, god nodes, and surprising connections across the 5 000+ node
graph. Use it to orient exploration and reduce token usage — one report read replaces
reading dozens of files.

To rebuild after major changes:
```bash
codebase-engine extract .
```

## What This Is

This directory is a reusable enterprise-safe agent skill pack for Claude Code,
Codex, and Copilot CLI. It provides 102 skills organized by role-based agents
with no default public egress.

## Role-Based Agents

Twelve role-based agents live in `agents/`. Each owns a cluster of skills:

| Agent | Role | Key Skills |
|---|---|---|
| `/orchestrate` | Coordinator | `subagent-orchestrator`, `autoplan`, `context-save` |
| `/swe` | Software Engineer | `seniorswe-concise`, `commit`, `investigate`, `ship` |
| `/qa-agent` | QA Engineer | `qa`, `test`, `benchmark`, `canary` |
| `/pm` | Product Manager | `spec`, `retro`, `release-notes`, `atlassian-docs` |
| `/spec-agent` | Spec Writer | `spec`, `autoplan`, `diagram`, `atlassian-docs` |
| `/design-agent` | UI/Design | `design-review`, `design-html`, `plan-design-review` |
| `/migration` | Migration Eng | `migration-review`, `stack-sqlserver-to-postgres`, `careful` |
| `/data` | Data/MLOps | `stack-databricks`, `domain-mlops-databricks`, `commit` |
| `/cloud` | Cloud/DevOps | `stack-aws`, `stack-aws-dms`, `canary`, `careful` |
| `/interviewer` | Tech Interviewer | `codebase-engine`, `atlassian-docs`, `diagram` |
| `/release-agent` | Release Eng | `release`, `ship`, `release-notes`, `canary`, `retro` |
| `/security` | Security Eng | `security-review`, `guard`, `investigate`, `health` |

Every skill declares `agents:` in its frontmatter. Orphan check runs in `npm test`.

## Install Into Another Repo

```bash
npx agent-architecture install        # private mode, auto-detects config
npx agent-architecture install --target .agent --hosts claude,codex
npx agent-architecture doctor         # verify install health
```

Reads `.agent-config.json` from the repo root. Example:

```json
{
  "private": true,
  "hosts": ["claude", "codex", "copilot"],
  "agents": ["swe", "qa-agent", "spec-agent", "pm"],
  "mcps": [{ "name": "db", "command": "uvx", "args": ["mcp-server-postgres"], "credentialEnvVars": ["DATABASE_URL"] }]
}
```

## Work Style

- Keep commits scoped.
- Prefer editing templates over generated files.
- Preserve no-egress enterprise defaults.
- Do not add public telemetry, public update checks, public tunnels, cookie
  import, public scraping, or credential reads.
- Do not make Claude-specific assumptions in core logic; Claude is one host
  target among several.

## Skill Workflow

When changing a skill:

1. Edit `<skill>/SKILL.md.tmpl`.
2. Edit section templates under `<skill>/sections/*.md.tmpl` if needed.
3. Run:

```bash
npm run build:skills
npm run check:skills
npm test
```

4. Commit the template and generated Markdown together.

Generated files are intentionally committed so the pack can be installed in
repos that do not run the generator.

## Current Skill Shape

Top-level skill folders are intentional:

```text
review/SKILL.md.tmpl
review/SKILL.md
test/SKILL.md.tmpl
test/SKILL.md
health/SKILL.md.tmpl
health/SKILL.md
```

Do not move skills into `skills/`.

## Install Direction

Other repos should install this pack using the contract in:

```text
docs/install-spec.md
```

Default install target is repo-local:

```text
<repo>/.architecture-agent/
```

The upgrade workflow is:

```text
architecture-agent-upgrade
```

Do not reintroduce `tstack-upgrade`.

## Anti-Bloat Skills

Six seniorswe-concise skills live alongside the architecture skills:

- `/seniorswe-concise` — lazy-senior-dev mode. Use whenever generating new code.
- `/seniorswe-concise-review` — diff review focused exclusively on over-engineering.
- `/seniorswe-concise-audit` — whole-repo audit for what to delete.
- `/seniorswe-concise-debt` — harvests `seniorswe-concise:` comments into a tracked debt ledger.
- `/seniorswe-concise-gain` — scoreboard of measured impact (lines, cost, speed).
- `/seniorswe-concise-help` — quick-reference card for all seniorswe-concise modes and skills.

Activate `/seniorswe-concise` at the start of any development session so the code we
generate is never over-built.

## Before Completion

Before reporting work complete, run:

```bash
npm run check:skills
npm test
```

If a command cannot run, report why and what remains unverified.
