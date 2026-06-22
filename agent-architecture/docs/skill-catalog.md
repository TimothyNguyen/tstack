# Skill Catalog

This catalog tracks the reusable gstack-style skills carried into
`agent-architecture/`.

Each skill is a top-level folder with:

```text
<skill>/SKILL.md.tmpl
<skill>/SKILL.md
```

## Core Skills

| Skill | Purpose | Source |
|---|---|---|
| `spec` | Convert intent into scoped requirements, invariants, and tasks. | `spec/SKILL.md.tmpl` |
| `autoplan` | Run a composed plan-review pipeline before implementation. | `autoplan/SKILL.md.tmpl` |
| `subagent-orchestrator` | Plan and materialize local-only subagent manifests for scoped parallel work. | `subagent-orchestrator/SKILL.md.tmpl` |
| `plan-review` | Review implementation plans before code changes. | `plan-review/SKILL.md.tmpl` |
| `plan-director-review` | Review plans from a director or senior-principal engineering perspective. | `plan-director-review/SKILL.md.tmpl` |
| `plan-pm-review` | Review plans from a product manager perspective. | `plan-pm-review/SKILL.md.tmpl` |
| `plan-eng-review` | Review plans for architecture and testability. | `plan-eng-review/SKILL.md.tmpl` |
| `plan-design-review` | Review plans for UI and interaction quality. | `plan-design-review/SKILL.md.tmpl` |
| `plan-devex-review` | Review plans for developer experience and operability. | `plan-devex-review/SKILL.md.tmpl` |
| `investigate` | Debug failures through evidence and root-cause analysis. | `investigate/SKILL.md.tmpl` |
| `review` | Review code, diffs, and PRs before landing. | `review/SKILL.md.tmpl` |
| `qa` | Verify behavior with tests and approved local tools. | `qa/SKILL.md.tmpl` |
| `test` | Design and run approved test automation, including Playwright/Selenium when enabled. | `test/SKILL.md.tmpl` |
| `health` | Run a read-only local code health dashboard. | `health/SKILL.md.tmpl` |
| `security-review` | Review security, governance, data access, and agent-tool risk. | `security-review/SKILL.md.tmpl` |
| `documentation` | Generic documentation workflow. | `documentation/SKILL.md.tmpl` |
| `atlassian-docs` | Read approved Jira and Confluence product documentation through a read-only connector. | `atlassian-docs/SKILL.md.tmpl` |
| `document-generate` | Generate missing local project documentation. | `document-generate/SKILL.md.tmpl` |
| `document-release` | Update docs after shipped behavior changes. | `document-release/SKILL.md.tmpl` |
| `learnings` | Capture local project conventions and lessons safely. | `learnings/SKILL.md.tmpl` |
| `release` | Prepare human-approved merge/deploy handoff. | `release/SKILL.md.tmpl` |
| `ship` | Prepare PR, merge, or release handoff. | `ship/SKILL.md.tmpl` |
| `codebase-engine` | Enterprise-safe AST knowledge graph — index, query, explain, path, affected, and codebase understanding workflow. No external egress. | `codebase-engine/SKILL.md.tmpl` |
| `rtk-token-optimizer` | Optional Rust Token Killer guidance for reducing noisy shell output. | `rtk-token-optimizer/SKILL.md.tmpl` |
| `context-save` | Save local working context for future sessions. | `context-save/SKILL.md.tmpl` |
| `context-restore` | Restore saved local working context. | `context-restore/SKILL.md.tmpl` |
| `design-html` | Produce implementation-ready HTML guidance from approved design direction. | `design-html/SKILL.md.tmpl` |
| `design-review` | Review UI and interaction quality. | `design-review/SKILL.md.tmpl` |
| `diagram` | Create architecture and workflow diagrams. | `diagram/SKILL.md.tmpl` |
| `retro` | Produce local project retrospectives. | `retro/SKILL.md.tmpl` |
| `skillify` | Convert repeated workflows into reusable skills. | `skillify/SKILL.md.tmpl` |
| `guard` | Apply stricter local safety posture. | `guard/SKILL.md.tmpl` |
| `claude` | Optional Claude host bridge. | `claude/SKILL.md.tmpl` |
| `codex` | Optional Codex host bridge. | `codex/SKILL.md.tmpl` |
| `copilot` | Optional GitHub Copilot host bridge. | `copilot/SKILL.md.tmpl` |
| `careful` | Destructive command guardrails for production and shared environments. | `careful/SKILL.md.tmpl` |
| `architecture-agent-upgrade` | Policy-approved local upgrade workflow. | `architecture-agent-upgrade/SKILL.md.tmpl` |

## Anti-Bloat Skills

| Skill | Purpose | Source |
|---|---|---|
| `ponytail` | Lazy-senior-dev mode — enforce YAGNI ladder, stdlib-first, shortest diff. | `ponytail/SKILL.md.tmpl` |
| `ponytail-review` | Diff review for over-engineering: delete/stdlib/native/yagni/shrink tags. | `ponytail-review/SKILL.md.tmpl` |
| `ponytail-audit` | Whole-repo audit ranked by cut size. | `ponytail-audit/SKILL.md.tmpl` |
| `ponytail-debt` | Harvest `ponytail:` comments into a debt ledger. | `ponytail-debt/SKILL.md.tmpl` |
| `ponytail-gain` | Scoreboard of measured ponytail impact (lines, cost, speed). | `ponytail-gain/SKILL.md.tmpl` |
| `ponytail-help` | Quick-reference card for all ponytail modes and skills. | `ponytail-help/SKILL.md.tmpl` |

## Modernization Profile And Optional Packs

These follow the same folder pattern but should be installed only when the
project profile needs them:

| Skill | Purpose | Source |
|---|---|
| `migration-dotnet-sqlserver-modernization` | Plan .NET Framework and SQL Server modernization. | `migration-dotnet-sqlserver-modernization/SKILL.md.tmpl` |
| `stack-legacy-frontend` | Migrate Knockout, YUI, and legacy browser UI toward modern frontend patterns. | `stack-legacy-frontend/SKILL.md.tmpl` |
| `stack-react-typescript` | React/TypeScript modernization with codemods and Redux Toolkit patterns. | `stack-react-typescript/SKILL.md.tmpl` |
| `stack-sqlserver-to-postgres` | SQL Server to Postgres migration planning and compatibility checks. | `stack-sqlserver-to-postgres/SKILL.md.tmpl` |
| `stack-aws-dms` | AWS DMS/SCT migration experiment and cutover planning. | `stack-aws-dms/SKILL.md.tmpl` |
| `stack-spring-boot` | Spring Boot upgrade and API modernization. | `stack-spring-boot/SKILL.md.tmpl` |
| `stack-spring-ai` | Spring-native AI app integration patterns. | `stack-spring-ai/SKILL.md.tmpl` |
| `stack-databricks` | Databricks jobs, notebooks, Asset Bundles, and SDK-aware workflows. Bundles vendored `databricks/databricks-agent-skills` (10 stable + 21 experimental packs), `databricks/databricks-sdk-py` reference subset (examples + docs), and `databricks/bundle-examples` Asset Bundle templates. | `stack-databricks/SKILL.md.tmpl` |
| `domain-mlops-databricks` | Production ML lifecycle and MLOps structure on Databricks. | `domain-mlops-databricks/SKILL.md.tmpl` |
| `stack-databricks-dbt` | dbt on Databricks transformations, tests, docs, and lineage. | `stack-databricks-dbt/SKILL.md.tmpl` |
| `adapter-mcp` | Optional MCP server/client adapter design. | `adapter-mcp/SKILL.md.tmpl` |
| `adapter-github` | Optional GitHub MCP/CLI adapter guidance. | `adapter-github/SKILL.md.tmpl` |
| `adapter-ag-ui` | AG-UI-compatible event adapter guidance. | `adapter-ag-ui/SKILL.md.tmpl` |
| `adapter-openapi` | OpenAPI generator adapter and contract boundary guidance. | `adapter-openapi/SKILL.md.tmpl` |
| `adapter-langgraph` | Optional LangGraph orchestration boundary guidance. | `adapter-langgraph/SKILL.md.tmpl` |
| `adapter-databricks` | Optional Databricks SDK connector boundary guidance. | `adapter-databricks/SKILL.md.tmpl` |
| `adapter-ponytail` | Optional Ponytail hook and MCP runtime integration. | `adapter-ponytail/SKILL.md.tmpl` |
| `reference-gstack-patterns` | Mine gstack role/workflow patterns without unsafe carry-over. | `reference-gstack-patterns/SKILL.md.tmpl` |
| `stack-aws` | AWS application modernization with least-privilege local validation. | `stack-aws/SKILL.md.tmpl` |
| `stack-python` | Python service, library, and data workflow modernization. | `stack-python/SKILL.md.tmpl` |
| `stack-csharp` | C#/.NET projects, services, tests, and framework modernization. Bundles vendored `dotnet/skills` plugins under `stack-csharp/dotnet-skills/plugins/` for ASP.NET Core, Blazor, EF Core, MSBuild, NuGet, MAUI, test, AI, diagnostics, upgrades, templates. | `stack-csharp/SKILL.md.tmpl` |
| `stack-postgres` | Postgres schema, query, migration, and data-governance workflows. | `stack-postgres/SKILL.md.tmpl` |
| `stack-sql-server` | SQL Server schema, T-SQL, jobs, and data-access modernization. | `stack-sql-server/SKILL.md.tmpl` |
| `domain-experiment-design` | Experiment design, power, metrics, guardrails, and rollout risk. | `domain-experiment-design/SKILL.md.tmpl` |
| `domain-data-governance` | Data classification, lineage, permissions, retention, and privacy review. | `domain-data-governance/SKILL.md.tmpl` |
| `domain-model-interpretation` | Model explanation, calibration, drift, and recommendation-risk review. | `domain-model-interpretation/SKILL.md.tmpl` |
| `adapter-google-adk` | Optional Google ADK host adapter boundary. | `adapter-google-adk/SKILL.md.tmpl` |
| `adapter-agentcore` | Optional AgentCore adapter boundary. | `adapter-agentcore/SKILL.md.tmpl` |
| `adapter-strands` | Optional Strands adapter boundary. | `adapter-strands/SKILL.md.tmpl` |
| `adapter-codegraph` | Optional CodeGraph or semantic code-index adapter boundary. | `adapter-codegraph/SKILL.md.tmpl` |
| `migration-review` | Review migration plans for sequencing, rollback, privacy, and readiness. | `migration-review/SKILL.md.tmpl` |
| `release-notes` | Generate privacy-safe release notes from local changes. | `release-notes/SKILL.md.tmpl` |
| `benchmark` | Local benchmark and regression workflow without public uploads. | `benchmark/SKILL.md.tmpl` |
| `canary` | Privacy-safe canary planning and monitoring handoff. | `canary/SKILL.md.tmpl` |

## Vendored Third-Party Skill Packs

Upstream skills copied into `agent-architecture/<stack>/` and gated by the
parent stack's Enterprise Preamble. Update by re-pulling from upstream and
re-vetting any guidance that calls public telemetry or unscoped credential
reads.

| Pack | Source | Vendored Path |
|---|---|---|
| `dotnet/skills` (14 plugins / ~99 skills) | <https://github.com/dotnet/skills> | `stack-csharp/dotnet-skills/plugins/` |
| `databricks/databricks-agent-skills` (10 stable + 21 experimental skill packs) | <https://github.com/databricks/databricks-agent-skills> | `stack-databricks/databricks-agent-skills/` |
| `databricks/databricks-sdk-py` (reference subset: examples + curated docs; library installed via pip) | <https://github.com/databricks/databricks-sdk-py> | `stack-databricks/databricks-sdk-py/` |
| `databricks/bundle-examples` (Asset Bundle templates) | <https://github.com/databricks/bundle-examples> | `stack-databricks/bundle-examples/` |

## Deferred Optional Packs

These are still planned but not yet added:

| Pack | Candidate skills |
|---|---|
| Domain pack | Additional industry-specific measurement and governance skills. |
| Stack pack | Additional stack packs discovered during project migrations. |
| Adapter pack | Additional approved internal connectors. |
| Delivery pack | Additional internal release and operations workflows. |

## Excluded From Default Pack

- Mobile/iOS QA.
- Public internet scraping.
- Public tunnels or ngrok.
- Cookie/session import.
- Public telemetry.
- Public update checks.
- Social/browser automation.
- Personal-productivity flows.
