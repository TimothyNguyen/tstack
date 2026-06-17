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
| `plan-review` | Review implementation plans before code changes. | `plan-review/SKILL.md.tmpl` |
| `investigate` | Debug failures through evidence and root-cause analysis. | `investigate/SKILL.md.tmpl` |
| `review` | Review code, diffs, and PRs before landing. | `review/SKILL.md.tmpl` |
| `qa` | Verify behavior with tests and approved local tools. | `qa/SKILL.md.tmpl` |
| `security-review` | Review security, governance, data access, and agent-tool risk. | `security-review/SKILL.md.tmpl` |
| `documentation` | Generate or update local project documentation. | `documentation/SKILL.md.tmpl` |
| `learnings` | Capture local project conventions and lessons safely. | `learnings/SKILL.md.tmpl` |
| `release` | Prepare human-approved merge/deploy handoff. | `release/SKILL.md.tmpl` |
| `codebase-understanding` | Map architecture, dependencies, and implementation context. | `codebase-understanding/SKILL.md.tmpl` |

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
