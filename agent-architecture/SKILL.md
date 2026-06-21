---
name: agent-architecture
version: 0.1.0
description: |
  Enterprise-safe software engineering skill pack. Routes work to scoped skills for
  spec writing, code review, QA, security review, documentation, learnings, and release
  workflows. Designed for local project installs and no default public egress.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

## Enterprise Preamble

- Stay inside the current project unless the user explicitly names another path.
- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.
- Use policy-gated tools only when the active profile allows them.
- Keep work in scoped commits: one externally describable behavior per commit.

# Agent Architecture Skill Pack

Use this root skill as the router for project-local software engineering
workflows.

## Routing

- New requirement, design, or issue: invoke `spec`.
- Fully reviewed plan pipeline: invoke `autoplan`.
- Review a plan before implementation: invoke `plan-review`.
- Director/principal plan review: invoke `plan-director-review`.
- Product manager plan review: invoke `plan-pm-review`.
- engineering plan review: invoke `plan-eng-review`.
- design plan review: invoke `plan-design-review`.
- developer-experience plan review: invoke `plan-devex-review`.
- Debug a bug, failure, or unexpected behavior: invoke `investigate`.
- Code or PR review: invoke `review`.
- Cross-model/code-agent second opinion: invoke `codex`, `claude`, or `copilot` only when the host profile enables it.
- Manual or automated test planning: invoke `qa`.
- Test automation design or execution: invoke `test`.
- Code quality dashboard or full local checkup: invoke `health`.
- Security or data-governance review: invoke `security-review`.
- Documentation work: invoke `documentation`, `document-generate`, or `document-release`.
- UI/design implementation review: invoke `design-review` or `design-html`.
- Diagrams or architecture visuals: invoke `diagram`.
- Project memory or lessons: invoke `learnings`.
- Save or restore working context: invoke `context-save` or `context-restore`.
- Release preparation: invoke `release`.
- Ship/PR handoff: invoke `ship`.
- Weekly/project retrospective: invoke `retro`.
- Convert a repeated workflow into a reusable skill: invoke `skillify`.
- Restrict or harden tool use: invoke `guard`.
- Destructive command guardrails, production safety mode: invoke `careful`.
- Upgrade this skill pack: invoke `architecture-agent-upgrade`.
- Codebase map, architecture lookup, dependency tracing, or AST graph indexing: invoke `codebase-engine`.
- Internal Atlassian product docs, requirements, or Jira issue context for coding questions: invoke `atlassian-docs` only when an approved read-only connector is configured.
- Token/cost reduction for noisy shell output: invoke `rtk-token-optimizer`.
- Simplest/laziest solution, YAGNI enforcement: invoke `ponytail`.
- Over-engineering diff review: invoke `ponytail-review`.
- Whole-repo bloat audit: invoke `ponytail-audit`.
- List deferred `ponytail:` shortcuts: invoke `ponytail-debt`.
- Ponytail impact scoreboard: invoke `ponytail-gain`.
- Ponytail quick reference: invoke `ponytail-help`.

When a project profile installs domain or stack packs, route to those skills
only when the user task names that domain or stack.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
