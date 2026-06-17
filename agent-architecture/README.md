# Agent Architecture

Reusable enterprise agent architecture for software engineering workflows.

This package is separate from `gstack/`. The upstream gstack checkout is source
material only. Anything carried forward must be copied, adapted, and reviewed
inside this package.

## Goals

- Install locally per project or in an approved user directory.
- Support multiple agent hosts through declarative host adapters.
- Keep skills as reviewable, versioned directories.
- Disable public egress, telemetry, tunnels, cookie import, and credential access
  by default.
- Let teams add project-specific stacks, domains, and policies without changing
  the core.

## Folder Layout

```text
agent-architecture/
  core/        # host-neutral compiler, policy loader, shared types
  hosts/       # Claude, Codex, Copilot, Strands, AgentCore, Google ADK host adapters
  skills/      # generic reusable skill packs
  policies/    # default and enterprise policy profiles
  profiles/    # project or stack profiles that compose skills and policies
  adapters/    # optional integrations such as AG-UI, MCP, CodeGraph, Google ADK
  docs/        # migration notes, security posture, architecture decisions
  tests/       # no-egress, generation, policy, install, and adapter tests
```

Folders are created when their first scoped change needs them. Empty placeholder
directories are avoided unless a tool requires them.

## Core Versus Profiles

Core must stay domain-neutral. It can know about skills, hosts, policies,
install paths, audit events, and generated artifacts. It must not hardcode a
business domain, cloud stack, database, or model framework.

Profiles are where a project composes reusable pieces. A marketing measurement
application can enable AWS, Spring Boot, Databricks, Python, React, C#, Postgres,
SQL Server, causal inference, experiment design, and uplift modeling packs. A
different project can enable a different set without forking core.

## Carry-Over Rules

Carry over from `gstack/` only when the behavior is useful after enterprise
hardening:

- Keep: host adapter pattern, skill directory pattern, skill generation concepts,
  workflow taxonomy, policy-aware review lanes.
- Change: installer, generated preambles, review/QA/security/docs skills, browser
  automation, local learning, codebase understanding.
- Drop by default: mobile/iOS workflows, public scraping, ngrok/public tunnels,
  telemetry, public update checks, cookie import, social/browser automation, and
  personal-productivity flows.

## Commit Discipline

Each commit changes one behavior surface. A commit may touch multiple files only
when all edits serve the same externally describable behavior.

Good commit scopes:

- `docs: define package layout`
- `core: add host config schema`
- `hosts: add codex adapter`
- `policies: disable public egress by default`
- `skills: add review skill skeleton`
- `profiles: add marketing measurement profile`

Bad commit scopes:

- `initial migration`
- `enterprise hardening`
- `add skills and policies`
- `misc cleanup`
