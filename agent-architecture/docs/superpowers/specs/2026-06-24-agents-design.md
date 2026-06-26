# Design: Role-Based Agent Layer for agent-architecture

**Date:** 2026-06-24
**Status:** Draft — pending implementation plan

---

## Problem

agent-architecture has 70+ skills and stacks. No developer knows which to
invoke for which task. Skills go unused. New team members have no entry point.

## Solution

Ten role-based agents, each a SKILL.md that knows which sub-skills to chain,
which stacks to auto-detect, and which MCP credentials to expect. Installed
privately into internal repos — no telemetry, no cloud storage, data leaves
only through explicitly configured credentials.

---

## Architecture

```
agent-architecture/             ← this repo
├── agents/                     ← NEW: one folder per agent
│   ├── orchestrate/SKILL.md
│   ├── swe/SKILL.md
│   ├── qa-agent/SKILL.md
│   ├── pm/SKILL.md
│   ├── spec-agent/SKILL.md
│   ├── design-agent/SKILL.md
│   ├── migration/SKILL.md
│   ├── data/SKILL.md
│   ├── cloud/SKILL.md
│   └── interviewer/SKILL.md
├── scripts/install.mjs         ← gains --private flag
├── generated/
│   ├── claude/CLAUDE.md        ← host artifact: Claude Code
│   ├── codex/AGENTS.md         ← host artifact: Codex CLI
│   └── copilot/copilot-instructions.md
└── ... existing skills ...

Internal repo (install target)
├── .agent-config.json          ← committed: which agents + MCPs + hosts
├── .agent/                     ← gitignored install output
│   ├── CLAUDE.md / AGENTS.md / copilot-instructions.md
│   ├── skills/
│   └── VERSION
└── .env.agent                  ← gitignored: credential env vars
```

---

## Private Install Mode

### Install story — one command per repo

A developer joining a new internal repo runs:

```bash
npx agent-architecture install
```

That's it. The installer:
1. Detects the repo root (walks up from cwd until it finds `.git`).
2. Reads `.agent-config.json` if present; generates a template if missing.
3. Detects which host CLIs are installed (claude, codex, copilot) and enables
   only those.
4. Generates `.agent/` with all host artifacts and skills.
5. Prints a summary of what was installed and any missing MCP credentials.

For teams that prefer an explicit path:

```bash
npx agent-architecture install --target ./.agent --hosts claude,codex
```

Upgrade an existing install:

```bash
npx agent-architecture upgrade
```

Check install health (runs `npm run check:skills` against installed artifacts):

```bash
npx agent-architecture doctor
```

### Publishing (internal npm registry)

agent-architecture is published to the team's private npm registry:

```bash
npm publish --registry https://npm.internal.company.com
```

Developers install once globally or run via `npx` — no cloning required.

For teams without an internal registry, clone once to a shared location and
point `package.json` scripts at it:

```json
"scripts": {
  "agent:install": "node /shared/agent-architecture/scripts/install.mjs",
  "agent:upgrade": "node /shared/agent-architecture/scripts/install.mjs --upgrade"
}
```

### Command (underlying)

```bash
node scripts/install.mjs --private --target ./.agent --hosts claude,codex,copilot
```

### What `--private` strips

| Removed | Reason |
|---|---|
| `agent-architecture-update-check` | phones home to check for updates |
| `agent-architecture-analytics` | telemetry |
| gbrain sync | cloud memory |
| cavemem MCP | third-party memory storage |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` | prevent ambient cloud sync |

### What stays

- All skill SKILL.md files (local instructions only)
- Local JSONL decision store (`~/.agent-architecture/projects/<slug>/decisions.jsonl`)
- Explicitly configured MCP servers (from `.agent-config.json`)
- LLM API calls (Anthropic/Bedrock via provided key)

### `.agent-config.json` (committed to target repo)

```json
{
  "private": true,
  "hosts": ["claude", "codex", "copilot"],
  "agents": ["orchestrate", "swe", "qa-agent", "pm", "spec-agent",
             "design-agent", "migration", "data", "cloud", "interviewer"],
  "mcps": [
    {
      "name": "splunk",
      "command": "uvx",
      "args": ["splunk-mcp"],
      "credentialEnvVars": ["SPLUNK_TOKEN", "SPLUNK_URL"]
    },
    {
      "name": "confluence",
      "command": "npx",
      "args": ["-y", "@confluence/mcp"],
      "credentialEnvVars": ["CONFLUENCE_TOKEN", "CONFLUENCE_URL"]
    },
    {
      "name": "db",
      "command": "uvx",
      "args": ["mcp-server-postgres"],
      "credentialEnvVars": ["DATABASE_URL"]
    }
  ]
}
```

Installer reads this, generates `settings.json` wiring MCP servers to env vars
declared in `.env.agent`. Missing cred → warn, continue.

### Host artifacts generated

All three artifacts are generated from the same agent + skill definitions:
- `CLAUDE.md` — slash-command routing, private-mode settings
- `AGENTS.md` — Codex task-description routing (already exists, gains agent section)
- `copilot-instructions.md` — Copilot CLI routing

---

## Adding New Skills

### Skill declares its own agent routing

Every skill SKILL.md frontmatter gains an `agents:` field:

```yaml
---
name: incident-response
version: 0.1.0
description: |
  Triage and resolve production incidents.
agents: [swe, cloud]
---
```

The installer reads `agents:` from every skill it installs and routes the skill
into the matching agent's SKILL.md and host artifacts automatically. No manual
edits to agent files required.

### Guardrail: orphan check in `npm test`

`skill-catalog.test.mjs` gains an orphan assertion:
- Every skill must declare `agents:` with at least one valid agent name, OR
  be explicitly listed in the infrastructure layer allowlist.
- Any skill missing `agents:` → test fails with "orphan skill: <name>".
- Any skill naming an unknown agent → test fails with "unknown agent: <name>".

### `/skillify` updated

When creating a new skill via `/skillify`, it prompts:
> "Which agents should this skill belong to? (e.g. swe, qa-agent, cloud)"

and writes the `agents:` field automatically.

### Workflow for adding a new skill

1. Create `<skill>/SKILL.md.tmpl` with `agents:` field.
2. Run `npm run build:skills` → generates `SKILL.md`.
3. Run `npm test` → orphan check passes.
4. Run installer → new skill appears in the right agent(s).

No other files need editing.

---

## Stack / Domain Context Loading

Agents do not have per-stack variants. Instead, a `/stack` meta-loader activates
the right `stack-*` skill on detection:

```
/swe detects repo tech → auto-loads stack-python / stack-react-typescript / etc.
User can override: /stack aws  or  /stack databricks
```

Detection order:
1. Check `package.json` → React/TS
2. Check `pyproject.toml` / `setup.py` → Python
3. Check `pom.xml` / `build.gradle` → Spring Boot / Spring AI
4. Check `*.csproj` / `*.sln` → C#
5. Check `databricks.yml` / `dbt_project.yml` → Databricks / dbt
6. Check `*.tf` / `serverless.yml` / `cdk.json` → AWS
7. Check `schema.sql` / `*.sql` (T-SQL patterns) → SQL Server / Postgres

---

## The 10 Agents

### `/orchestrate` — Coordinator
Entry point for large features. Decomposes into parallel subagents per
`docs/subagent-deployment-plan.md` roles (Explorer, Planner, Implementer, etc.).

**Skills:** `subagent-orchestrator`, `autoplan`, `plan-review`,
`plan-director-review`, `context-save`, `context-restore`

**Adapter hooks (install-time):** `adapter-ag-ui`, `adapter-agentcore`,
`adapter-langgraph`, `adapter-strands`, `adapter-google-adk`

---

### `/swe` — Software Engineer
General implementation, debug, review, ship. Default agent for coding tasks.

**Always-on:** `seniorswe-concise` + `adapter-seniorswe-concise`, `commit`
(after every behavior change)

**Workflow chain:**
`autoplan` → `codebase-engine` + `adapter-codegraph` → `investigate` →
`review` → `plan-eng-review` → `security-review` → `test` → `health` → `ship`

**Anti-bloat suite:** `seniorswe-concise-review`, `seniorswe-concise-audit`,
`seniorswe-concise-debt`, `seniorswe-concise-gain`, `seniorswe-concise-help`

**Integration:** `adapter-github`, `adapter-openapi`, `diagram`

**Stack (auto-detected):** `stack-python`, `stack-react-typescript`,
`stack-spring-boot`, `stack-spring-ai`, `stack-csharp`, `stack-postgres`,
`stack-sql-server`, `stack-legacy-frontend`

**MCPs:** `db` (schema lookup), `splunk` (runtime errors)

---

### `/qa-agent` — QA Engineer
Tests, validates, benchmarks, monitors post-deploy.

**Workflow:** `qa` → `test` → `benchmark` → `canary`

**Review:** `plan-devex-review`, `health`, `security-review`

**Docs:** `documentation` (post-QA evidence capture)

**MCPs:** `splunk` (error monitoring), `confluence` (acceptance criteria)

---

### `/pm` — Product Manager
Strategy, prioritization, retrospectives, release communication.

**Workflow:** `spec` → `plan-pm-review` → `plan-director-review` → `retro`

**Docs:** `release-notes`, `document-release`, `release`, `documentation`

**Domain (auto-detected):** `domain-data-governance`, `domain-experiment-design`,
`domain-mlops-databricks`, `domain-model-interpretation`

**MCPs:** `confluence` (PRDs, roadmap), `atlassian-docs` (Jira lookup)

---

### `/spec-agent` — Spec Writer / Planner
Converts vague intent into precise, reviewable specs. Pulls existing docs as
context before writing. Multi-angle review built in.

**Workflow:** `atlassian-docs` (context) → `spec` → `autoplan` →
`plan-pm-review` + `plan-eng-review` + `plan-design-review` + `plan-review`

**Output:** `diagram`, `document-generate`

**MCPs:** `confluence` (existing docs), `atlassian-docs` (Jira tickets)

---

### `/design-agent` — UI / Design
UI quality review, implementation-ready HTML guidance, design audit on plans.

**Workflow:** `design-review` → `design-html` → `plan-design-review` →
`diagram` → `document-generate`

---

### `/migration` — Migration Engineer
.NET/SQL Server modernization, SQL-to-Postgres, AWS DMS migrations.
Destructive-command guardrails always active.

**Workflow:** `migration-review` → `migration-dotnet-sqlserver-modernization` →
`plan-eng-review` → `plan-director-review` → `commit` → `ship`

**Stack:** `stack-sqlserver-to-postgres`, `stack-aws-dms`,
`stack-legacy-frontend`, `stack-csharp`, `stack-postgres`, `stack-sql-server`

**Safety:** `careful`, `guard` (always-on)

**MCPs:** `db` (schema inspection)

---

### `/data` — Data / MLOps Engineer
Databricks jobs, dbt transformations, ML lifecycle, data governance, experiment
design.

**Workflow:** `plan-eng-review` → `plan-pm-review` → `codebase-engine` →
`commit` → `health`

**Stack:** `stack-databricks`, `stack-databricks-dbt`, `adapter-databricks`

**Domain:** `domain-mlops-databricks`, `domain-data-governance`,
`domain-experiment-design`, `domain-model-interpretation`

**Anti-bloat:** `seniorswe-concise` (always-on)

**MCPs:** `db`, `confluence` (data governance docs)

---

### `/cloud` — Cloud / DevOps Engineer
AWS infrastructure, DMS migrations, post-deploy monitoring, release readiness.
Destructive-command guardrails always active.

**Workflow:** `plan-eng-review` → `stack-aws` + `stack-aws-dms` → `canary` →
`release` → `ship` → `commit`

**Safety:** `careful`, `guard` (always-on)

**MCPs:** `splunk` (monitoring), `confluence` (runbooks)

---

### `/interviewer` — Technical Interviewer
Conducts technical interviews grounded in the actual codebase and tech stack.
Generates questions from real code, evaluates answers.

**Workflow:** `codebase-engine` + auto-detected `stack-*` → `health` →
generate question set → evaluate responses → `diagram` (system design rounds)

**MCPs:** `confluence` (architecture docs), `db` (schema for SQL rounds)

---

## Infrastructure Layer (not user-invoked)

| Skill / Module | Role |
|---|---|
| `claude`, `codex`, `copilot` | Host bridge skills — generated artifacts |
| `architecture-agent-upgrade` | Policy-approved self-upgrade |
| `skillify` | Convert repeated workflows into new skills |
| `reference-gstack-patterns` | Internal pattern reference |
| `rtk-token-optimizer` | Optional: reduce noisy shell output |
| `context-save` / `context-restore` | Cross-cutting session continuity |
| `learnings` | Cross-cutting convention + pitfall capture |
| `atlassian-docs` | Cross-cutting Confluence/Jira read-only MCP |
| `careful` / `guard` | Cross-cutting destructive command guardrails |
| `adapter-mcp` | MCP server/client design guidance |
| `adapter-ag-ui` | AG-UI event stream (via orchestrate) |
| `adapter-langgraph`, `adapter-agentcore`, `adapter-strands`, `adapter-google-adk` | Runtime integration hooks |
| `seniorswe-concise-help` | Quick-reference card (cross-cutting) |

---

## Data Flow (private mode)

```
Developer machine
  ↓ invoke /swe
Claude Code / Codex / Copilot CLI
  ↓ reads .agent/CLAUDE.md (or AGENTS.md or copilot-instructions.md)
  ↓ loads skills from .agent/skills/
  ↓ LLM call → Anthropic API / AWS Bedrock (dev's key)
  ↓ MCP call → splunk / confluence / db (dev's creds in .env.agent)
  ↓ writes memory → ~/.agent-architecture/projects/<slug>/decisions.jsonl (local only)
  ↓ NO telemetry, NO cloud sync, NO update checks
```

---

## Open Questions (resolved)

| Question | Decision |
|---|---|
| agent-architecture vs agent-architecture ownership | agent-architecture owns agents + install; agent-architecture is reference only |
| Stack variants vs auto-detection | Auto-detect via `/stack` meta-loader; no per-stack agent variants |
| New skill routing | `agents:` frontmatter field; orphan check in `npm test`; `/skillify` writes it automatically |
| Install UX | `npx agent-architecture install` — auto-detects repo, hosts, config; one command |
| Cloud separate agent? | Yes — AWS infra is a distinct DevOps role |
| Migration separate agent? | Yes — large enough skill cluster |
| Data separate agent? | Yes — Databricks/MLOps is a distinct role |
| Design separate agent? | Yes — design-html + design-review + plan-design-review is a full role |
| Orchestrator separate agent? | Yes — maps to Coordinator in subagent-deployment-plan.md |
| Telemetry / cloud memory | Stripped by --private flag; local JSONL only |
| Multi-host support | Claude + Codex + Copilot CLI all generated from same sources |
