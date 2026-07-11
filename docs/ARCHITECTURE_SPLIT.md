# TStack Repo Split

This repository is a transition workspace. Canonical organization is [REPO_ORGANIZATION.md](REPO_ORGANIZATION.md).

## Current Folders And Target Names

| Target Repo | Current Folder | Role |
| --- | --- | --- |
| `agent-registry` | `C:\Users\quynh\OneDrive\Desktop\tregistry` | Definitions, contracts, discovery, registry/control-plane APIs. |
| `agent-harness` | `C:\Users\quynh\OneDrive\Desktop\tstack-harness` | Runtime execution, policy gates, events, audit, CLI, SDK. |
| `tstack` | this repo | Migration workspace with legacy governance and embedded `agent-architecture`. |

## Target Boundary

```text
agent-registry
  owns skills, agents, workflows, adapters, tool-providers, stacks,
  domains, profiles, schemas, generated/registry.json, docs

agent-harness
  owns loader, planner, workflow-engine, policy-engine, approval-gates,
  mcp-client, adapter-runtime, event-bus, audit-log, test-runner, cli, sdk

tstack
  owns transition notes and compatibility exports only, then becomes archive or umbrella docs
```

## Product Spine

```text
agent-harness loads agent-registry.
Planner selects workflow.
Workflow engine runs steps.
Skills use adapter runtime and MCP client.
Policy engine and approval gates validate each risky step.
Event bus emits traces.
Audit log records decisions.
Test runner verifies outputs.
```

## Move Map

| Current Path | Target | Notes |
| --- | --- | --- |
| `agent-architecture/skills` | `agent-registry/skills` | Main skill definition catalog. |
| `agent-architecture/agents` | `agent-registry/agents` | Role definitions; collapse specialized roles later. |
| `agent-architecture/docs/workflows` | `agent-registry/workflows` | Workflow definitions only. |
| `agent-architecture/adapters` | split | Definitions in `agent-registry/adapters`; execution in `agent-harness/adapter-runtime`. |
| MCP/server package metadata | `agent-registry/tool-providers` | Tool providers are definitions; calls happen in harness. |
| `agent-architecture/stacks` | `agent-registry/stacks` | Curated bundles. |
| domain packs | `agent-registry/domains` | Business/domain bundles. |
| `agent-architecture/profiles` | `agent-registry/profiles` | Profiles compose definitions and policies. |
| metadata schemas | `agent-registry/schemas` | Registry record contracts. |
| `agent-architecture/core`, `hooks`, `hosts`, `policies` | `agent-harness` | Runtime-adjacent behavior. |
| root `bin/`, `scripts/`, governance docs | `agent-harness/policy-engine`, `agent-harness/approval-gates` | Wrap Node first, port after parity tests. |
| `agent-architecture/generated`, `codebase-out`, `coverage`, `test-results`, `.agent` | generated/ignored | Never source truth. |

## Consumption Contract

`agent-harness` should consume one registry artifact:

```text
agent-registry/generated/registry.json
```

It should resolve by IDs, versions, and lockfile entries. It should not require legacy `agent-architecture` directory conventions.

This transition repo now has a bridge command:

```bash
npm run registry:export
```

It writes:

```text
generated/agent-registry/registry.json
```

The output is migration input for `agent-registry`, not final source truth.

## Migration Order

1. Export legacy `agent-architecture` content to `generated/agent-registry/registry.json`.
2. Make `agent-registry` import/export the same shape from real source directories.
3. Make `agent-harness` load that registry shape and run one workflow path.
4. Move definitions into `agent-registry`.
5. Wrap root governance from `agent-harness` as policy/approval gates.
6. Delete `agent-architecture` source after parity checks pass.

## Cleanup Rules

- Do not add runtime execution to `agent-registry`.
- Do not add catalogs or stacks to `agent-harness`.
- Do not add new product primitives to `tstack`.
- Do not add new specialized agents in `agent-architecture`.
- Move by contract, not directory copy.
