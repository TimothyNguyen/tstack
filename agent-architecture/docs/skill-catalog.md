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

## Deferred Optional Packs

These should follow the same folder pattern when added:

| Pack | Candidate skills |
|---|---|
| Domain pack | `domain-causal-inference`, `domain-experiment-design`, `domain-uplift-modeling`, `domain-campaign-measurement` |
| Stack pack | `stack-aws`, `stack-spring-boot`, `stack-databricks`, `stack-python`, `stack-react`, `stack-csharp`, `stack-postgres`, `stack-sql-server` |
| Adapter pack | `adapter-google-adk`, `adapter-agentcore`, `adapter-strands`, `adapter-ag-ui`, `adapter-codegraph` |
| Delivery pack | `benchmark`, `canary`, `release-notes`, `migration-review` |

## Excluded From Default Pack

- Mobile/iOS QA.
- Public internet scraping.
- Public tunnels or ngrok.
- Cookie/session import.
- Public telemetry.
- Public update checks.
- Social/browser automation.
- Personal-productivity flows.
