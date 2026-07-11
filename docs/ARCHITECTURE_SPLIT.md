# TStack Architecture

Canonical organization is [REPO_ORGANIZATION.md](REPO_ORGANIZATION.md).
This repo currently hosts `agent-pack` plus governance tooling.

## Current Folders And Target Names

| Target Repo | Current Folder | Role |
| --- | --- | --- |
| `agent-pack` | `agent-pack/` in this repo | Authored skills, agents, workflows, stacks, domains, adapters, tool providers, profiles, generated host artifacts. |
| `agent-registry` | `C:\Users\quynh\OneDrive\Desktop\tregistry` | Definitions, contracts, discovery, registry/control-plane APIs. |
| `agent-harness` | `C:\Users\quynh\OneDrive\Desktop\tstack-harness` | Runtime execution, policy gates, events, audit, CLI, SDK. |
| `tstack` | this repo | Governance workspace and current `agent-pack` source location. |

## Boundary

```text
agent-pack
  owns authored definitions: skills, agents, workflows, adapters,
  tool-providers, stacks, domains, profiles, host artifacts, package docs

agent-registry
  owns published registry records, contracts, discovery, schemas,
  registry APIs, generated/registry.json

agent-harness
  owns loader, planner, workflow-engine, policy-engine, approval-gates,
  mcp-client, adapter-runtime, event-bus, audit-log, test-runner, cli, sdk

tstack
  owns governance checks, repo docs, compatibility exports, and split coordination
```

## Product Spine

```text
agent-pack authors definitions.
agent-pack exports registry-shaped artifacts.
agent-registry publishes versioned registry records.
agent-harness loads registry records.
Planner selects workflow.
Workflow engine runs steps.
Skills use adapter runtime and MCP client.
Policy engine and approval gates validate risky steps.
Event bus emits traces.
Audit log records decisions.
Test runner verifies outputs.
```

## Move Map

| Current Path | Target | Notes |
| --- | --- | --- |
| Current Path | Owner | Notes |
| --- | --- | --- |
| `agent-pack/skills` | `agent-pack` -> `agent-registry/skills` | Authored skill source; registry receives exported records. |
| `agent-pack/agents` | `agent-pack` -> `agent-registry/agents` | Role definitions and agent entrypoints. |
| `agent-pack/workflows` and `agent-pack/docs/workflows` | `agent-pack` -> `agent-registry/workflows` | Declarative workflow definitions only. |
| `agent-pack/adapters` | split | Definitions authored in `agent-pack`; runtime execution belongs in `agent-harness/adapter-runtime`. |
| `agent-pack/tool-providers` | `agent-pack` -> `agent-registry/tool-providers` | Tool-provider definitions; calls happen in harness. |
| `agent-pack/stacks` | `agent-pack` -> `agent-registry/stacks` | Curated technology bundles. |
| `agent-pack/domains` | `agent-pack` -> `agent-registry/domains` | Business/domain bundles. |
| `agent-pack/profiles` | `agent-pack` -> `agent-registry/profiles` | Profiles compose definitions and policies. |
| metadata schemas | `agent-registry/schemas` | Registry record contracts. |
| `agent-pack/core`, `hooks`, `hosts`, `policies` | `agent-harness` candidate | Runtime-adjacent behavior kept here only for current compatibility. |
| root `bin/`, `scripts/`, governance docs | `tstack` then `agent-harness` candidate | Current governance implementation; may later become harness policy/approval gates. |
| `agent-pack/generated`, `codebase-out`, `coverage`, `test-results`, `.agent` | generated/ignored | Never authored source. |

## Consumption Contract

`agent-harness` should consume one registry artifact:

```text
agent-registry/generated/registry.json
```

It should resolve by IDs, versions, and lockfile entries. It should not require
local `agent-pack` directory conventions.

This repo has a bridge command:

```bash
npm run registry:export
```

It writes:

```text
generated/agent-registry/registry.json
```

The output is registry input for `agent-registry`. Source truth remains in
`agent-pack/` until `agent-pack` moves to its own repo.

## Split Order

1. Keep authoring definitions in `agent-pack/`.
2. Make `agent-registry` import/export the same shape from real source directories.
3. Make `agent-harness` load that registry shape and run one workflow path.
4. Move `agent-pack` to its own repo when parity checks pass.
5. Wrap root governance from `agent-harness` as policy/approval gates where useful.
6. Keep `tstack` as governance/docs umbrella or archive after split.

## Cleanup Rules

- Do not add runtime execution to `agent-registry`.
- Do not add catalogs or stacks to `agent-harness`.
- Do not add new product primitives to `tstack`.
- Add reusable definitions to `agent-pack`; avoid one-off project-specific agents.
- Move by contract, not directory copy.
