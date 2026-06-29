# agent-architecture: Package Refactor Design

**Date:** 2026-06-29
**Author:** TimothyNguyen
**Status:** Approved

## Problem

`agent-architecture` ships 135+ skill directories as a single npm package. Every consumer downloads everything regardless of what they use. No way to install only adapters, only stacks, or only specialty skills. Difficult to maintain, version, and reason about as a package boundary.

## Decision

Approach B: slim `agent-architecture` core + optional scoped add-on packages. Core install command and package name unchanged. Add-ons opt-in via `npm install @agent-arch/<pkg>`.

## Package Structure

### Workspace layout

```
agent-architecture/
  package.json              # workspace root: {workspaces: ["packages/*"]}
  bin/                      # CLI (unchanged)
  scripts/install.mjs       # installer (updated — scans add-ons)
  core/                     # runtime: audit, events, subagents, worktrees
  hooks/
  policies/
  profiles/
  hosts/
  agents/                   # core agents: swe, qa-agent, spec-agent, pm
  .claude-plugin/           # marketplace.json → core skills (unchanged)
  .cursor-plugin/           # marketplace.json (unchanged)
  [~25 core skill dirs]     # see Core Skills below
  packages/
    adapters/               # → @agent-arch/adapters
    stacks/                 # → @agent-arch/stacks
    skills/                 # → @agent-arch/skills
```

### Core skills (stay in agent-architecture)

Skills universal to all agents regardless of stack or framework:

- `autoplan`, `brainstorming`, `canary`, `careful`, `change-router`
- `commit`, `context-restore`, `context-save`
- `guard`, `health`, `investigate`, `learn`, `learnings`
- `pre-commit-review`, `qa`, `receiving-code-review`, `reference-skill-patterns`
- `release`, `release-notes`, `retro`, `review`
- `ship`, `skillify`, `spec`
- `subagent-orchestrator`, `systematic-debugging`
- `using-agent-skills`, `verification-before-completion`, `writing-skills`

### @agent-arch/adapters

Framework adapters — one dir per integration:

- `adapter-ag-ui`, `adapter-agentcore`, `adapter-databricks`
- `adapter-docker-mcp`, `adapter-github`, `adapter-google-adk`
- `adapter-langgraph`, `adapter-mcp`, `adapter-openapi`
- `adapter-seniorswe-concise`, `adapter-strands`
- `adapters/` registry
- `stack/` adapter registry

Ships own `.claude-plugin/marketplace.json` pointing to its skill dirs.

### @agent-arch/stacks

Tech stack + domain skills:

- `stack-aws`, `stack-aws-dms`, `stack-csharp`
- `stack-databricks`, `stack-databricks-dbt`, `stack-legacy-frontend`
- `stack-postgres`, `stack-python`, `stack-react-typescript`
- `stack-spring-ai`, `stack-spring-boot`
- `stack-sql-server`, `stack-sqlserver-to-postgres`
- `domain-data-governance`, `domain-experiment-design`
- `domain-mlops-databricks`, `domain-model-interpretation`

Ships own `.claude-plugin/marketplace.json`.

### @agent-arch/skills

Specialty skill packs:

- Diagrams: `diagram`, `diagram-cloudformation`, `diagram-export`, `diagram-generate`, `diagram-helm`, `diagram-iac`, `diagram-infrastructure`, `diagram-search`, `diagram-style`, `diagram-validate`
- Migration: `migration-dotnet-sqlserver-modernization`, `migration-review`, `migration-sqlserver-assess`, `migration-sqlserver-data`, `migration-sqlserver-perf`, `migration-sqlserver-schema`, `migration-sqlserver-test`
- Plan reviews: `plan-design-review`, `plan-devex-review`, `plan-director-review`, `plan-eng-review`, `plan-pm-review`, `plan-review`
- SeniorSWE: `seniorswe-concise`, `seniorswe-concise-audit`, `seniorswe-concise-debt`, `seniorswe-concise-gain`, `seniorswe-concise-help`, `seniorswe-concise-review`
- Other: `security-review`, `design-html`, `design-review`, `benchmark`, `token-optimizer`, `rtk-token-optimizer`, `document-generate`, `document-release`, `documentation`, `atlassian-docs`, `chrome-devtools`, `codebase-engine`, `architecture-agent-upgrade`, `drawio-mcp-python`
- Agents: `agents/cloud`, `agents/data`, `agents/design-agent`, `agents/diagram-agent`, `agents/interviewer`, `agents/migration`, `agents/migration-engineer`, `agents/orchestrate`, `agents/release-agent`, `agents/security`

Ships own `.claude-plugin/marketplace.json`.

## Installer Changes

`scripts/install.mjs` — one new function, minimal change:

```js
function discoverAddonPackages() {
  const scope = path.join(ROOT, '..', 'node_modules', '@agent-arch');
  if (!fs.existsSync(scope)) return [];
  return fs.readdirSync(scope, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => path.join(scope, e.name));
}
```

`discoverUtilitySkills()` updated to iterate `[ROOT, ...discoverAddonPackages()]` instead of `ROOT` alone. All other installer logic unchanged.

## Harness Integration

### Happy / Claude Code

Each installed `@agent-arch/*` package ships `.claude-plugin/marketplace.json` → harness auto-discovers all installed packages independently. No coordination between packages required.

### External harnesses (Hermes, Openclaw, OpenHarness)

Install step unchanged:

```bash
npm install agent-architecture @agent-arch/stacks @agent-arch/adapters
npx agent-architecture install --hosts claude
```

Harness reads `.agent/` output as before. Add-on skills appear automatically because installer scans `node_modules/@agent-arch/*`.

## Consumer Install (README)

Minimal:
```bash
npm install agent-architecture
npx agent-architecture install --hosts claude
```

With add-ons:
```bash
npm install agent-architecture @agent-arch/stacks @agent-arch/adapters @agent-arch/skills
npx agent-architecture install --hosts claude,codex
```

Available packages:

| Package | Contents |
|---|---|
| `agent-architecture` | Core runtime, core agents (swe/qa/spec/pm), ~25 universal skills |
| `@agent-arch/adapters` | Framework adapters: MCP, LangGraph, AG-UI, AgentCore, Strands, GitHub, Databricks, OpenAPI, Google ADK, Docker MCP |
| `@agent-arch/stacks` | Tech stacks: AWS, Python, React/TS, Spring Boot, Databricks, C#, Postgres, SQL Server + domain skills |
| `@agent-arch/skills` | Specialty packs: diagrams, migration, plan-reviews, seniorswe-concise, security, design, benchmarks, docs |

## Dead Artifact Cleanup

Archive branch `archive/enrichment-reports` receives (then stripped from master):

- `BATCH2_ENRICHMENT_REPORT.md`, `BATCH3_ENRICHMENT_REPORT.md`, `BATCH4_ENRICHMENT_REPORT.md`
- `DEPENDENCY_ENRICHMENT_REPORT.md`, `MANUAL_ENRICHMENT_REPORT.md`
- `GOVERNANCE_ENGINE_COMPLETION_SUMMARY.md`, `GOVERNANCE_ENRICHMENT_PROGRESS.md`
- `GOVERNANCE_EXCEPTIONS.md`, `GOVERNANCE_MANIFESTS_REPORT.md`
- `dependency-enrichment.log`, `governance-generation.log`, `used-by-enrichment.log`
- `generated/`, `codebase-out/`, `coverage/`, `test-results/`

`.gitignore` updated to exclude `coverage/`, `test-results/`, `codebase-out/`, `generated/`.

## Constraints

- `npx agent-architecture install` CLI unchanged — zero breaking change
- Package name `agent-architecture` unchanged
- Installer add-on discovery is purely additive — no add-ons installed = behavior identical to today
- Each add-on package independently versioned and publishable
- No changes to `.agent/` output dir structure or install-manifest.json schema
