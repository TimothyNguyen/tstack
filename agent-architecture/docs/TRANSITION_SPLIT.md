# Agent Architecture Transition Boundary

`agent-architecture` is the legacy content-authoring package during the TStack split.

It should not keep growing into another all-in-one platform. New work should land in the repo that owns the responsibility.

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
| Host generated artifacts | generated output | Keep generated files derived, not hand-authored source truth. |
| Skill source templates | `agent-registry` eventually | Keep here only until registry export/import is lossless. |

## What This Package May Still Own During Transition

- `SKILL.md.tmpl` source files until `agent-registry` can preserve their metadata losslessly.
- Build scripts that render `SKILL.md`, host variants, catalog files, and training data.
- Compatibility installer for existing consumers using `npx agent-architecture install`.
- Tests protecting legacy generated output while migration is in progress.

## What Should Not Be Added Here

- New runtime execution engine.
- New long-lived registry API.
- New deployment control plane.
- New specialized agent roles unless they are temporary catalog content.
- New external service integrations unless they are packaged as registry content or examples.

## Current Bridge

The root repo provides:

```bash
npm run registry:export
```

That command converts `agent-architecture/generated/skills.index.json` into `generated/agent-registry/registry.json`, a migration artifact shaped for `agent-registry`.

## Migration Rule

Move by contract, not by directory copy.

For folder-by-folder cleanup, see [CLEANUP_MAP.md](CLEANUP_MAP.md).

Before moving source out of `agent-architecture`, make sure the target repo preserves:

- source subfolder
- generated host outputs
- category: `skill`, `stack`, `adapter`, or `agent`
- compatible agents
- policy/tool requirements
- source entrypoint: `SKILL.md.tmpl`
- rendered entrypoint: `SKILL.md`
