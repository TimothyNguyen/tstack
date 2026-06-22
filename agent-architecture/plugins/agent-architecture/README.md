# agent-architecture (plugin)

Enterprise-safe agent skill pack. Generated layout — the canonical source lives
at the top of the `agent-architecture/` directory. `skills/` here is a mirror
written by `scripts/gen-skill-docs.mjs`.

Do not hand-edit `skills/*/SKILL.md` in this folder. Edit
`<skill>/SKILL.md.tmpl` at the repo root and rerun:

```bash
npm run build:skills
```

## Install

See the parent repo's [README](../../README.md) for marketplace + manual
install paths for Claude Code, Codex CLI, and Cursor.

## What's inside

Skills grouped by concern:

| Group | Skills |
|---|---|
| Core workflow | `spec`, `autoplan`, `plan-review`, `plan-*-review`, `investigate`, `review`, `qa`, `test`, `health`, `security-review`, `documentation`, `document-generate`, `document-release`, `learnings`, `release`, `ship`, `codebase-engine`, `context-save`, `context-restore`, `design-html`, `design-review`, `diagram`, `retro`, `skillify` |
| Anti-bloat | `seniorswe-concise`, `seniorswe-concise-review`, `seniorswe-concise-audit`, `seniorswe-concise-debt`, `seniorswe-concise-gain`, `seniorswe-concise-help` |
| Host bridges | `claude`, `codex`, `copilot` |
| Safety | `guard`, `careful` |
| Stacks | `stack-csharp` (vendored .NET skills), `stack-databricks` (vendored Databricks agent skills + bundle examples + SDK docs), `stack-postgres`, `stack-sql-server`, `stack-python`, `stack-aws`, `stack-aws-dms`, `stack-sqlserver-to-postgres`, `stack-react-typescript`, `stack-legacy-frontend`, `stack-spring-boot`, `stack-spring-ai`, `stack-databricks-dbt` |
| Domain | `domain-mlops-databricks`, `domain-experiment-design`, `domain-data-governance`, `domain-model-interpretation` |
| Adapters | `adapter-mcp`, `adapter-github`, `adapter-ag-ui`, `adapter-openapi`, `adapter-langgraph`, `adapter-databricks`, `adapter-seniorswe-concise`, `adapter-google-adk`, `adapter-agentcore`, `adapter-strands`, `adapter-codegraph` |
| Migrations / references | `migration-dotnet-sqlserver-modernization`, `migration-review`, `reference-gstack-patterns`, `release-notes`, `benchmark`, `canary`, `atlassian-docs`, `architecture-agent-upgrade`, `rtk-token-optimizer` |

## Policy

Every skill inherits the same Enterprise Preamble:

- Stay inside the current project unless explicitly directed elsewhere.
- No public telemetry, update checks, tunnels, cookie import, or scraping.
- Policy-gated tools only.
- Scoped commits — one externally describable behavior per commit.
