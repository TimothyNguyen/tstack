# Agent Pack Boundary

`agent-pack` is the authored-definition package for TStack.

It owns reusable definitions and generated host artifacts. It must not grow into
the runtime engine, registry API, deployment control plane, or observability
backend.

## Target Owners

| Concern | Target Owner | Notes |
| --- | --- | --- |
| Workflow runtime, lockfile resolution, step execution, checkpoints | `agent-harness` | Harness owns execution. |
| Governance gates during runs | `agent-harness` | Current Node governance can be wrapped first, then ported. |
| Observability and run traces | `agent-harness` | Runtime traces belong with execution. |
| Skill catalog records | `agent-registry` | Registry owns discovery and installable metadata. |
| Agent definitions | `agent-registry` | Agents are definitions, not runtime loops. |
| Workflow definitions | `agent-registry` | Harness executes resolved workflow records. |
| Adapter definitions | `agent-registry` | Adapter runtime belongs in harness. |
| Tool provider definitions | `agent-registry` | MCP/client calls belong in harness. |
| Stacks, domains, and profiles | `agent-registry` | Treat as catalog content. |
| Host generated artifacts | generated output | Keep generated files derived from `agent-pack` templates. |
| Skill source templates | `agent-pack` | Authored source until `agent-pack` moves to its own repo. |

## What This Package Owns

- `SKILL.md.tmpl` source files.
- Agent role entrypoints.
- Workflow definitions and workflow indexes.
- Stack, domain, adapter, profile, and tool-provider definitions.
- Build scripts that render `SKILL.md`, host variants, catalog files, and training data.
- Installer for consumers using `npx agent-pack install`.
- Tests protecting generated output and registry export contracts.

## What Should Not Be Added Here

- New runtime execution engine.
- New long-lived registry API.
- New deployment control plane.
- New one-off project-specific agent roles.
- New external service integrations unless they are packaged as registry content or examples.

## Current Bridge

The root repo provides:

```bash
npm run registry:export
```

That command converts `agent-pack/generated/skills.index.json` into
`generated/agent-registry/registry.json`, a registry artifact shaped for
`agent-registry`.

## Split Rule

Move by contract, not by directory copy.

For folder-by-folder cleanup, see [CLEANUP_MAP.md](CLEANUP_MAP.md).

Before moving `agent-pack` to its own repo, make sure every consumer preserves:

- source subfolder
- generated host outputs
- category: `skill`, `stack`, `adapter`, or `agent`
- compatible agents
- policy/tool requirements
- source entrypoint: `SKILL.md.tmpl`
- rendered entrypoint: `SKILL.md`
