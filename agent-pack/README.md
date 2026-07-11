# Agent Pack

Enterprise-safe agent-pack source for Claude, Codex, and Copilot style coding agents.

This package authors reusable skills, agents, workflows, stacks, domains, adapters, and tool-provider definitions. Runtime work belongs in `agent-harness`; registry/catalog publishing flows through `agent-registry`.

## Start

- new here: [docs/START_HERE.md](docs/START_HERE.md)
- split boundary: [docs/TRANSITION_SPLIT.md](docs/TRANSITION_SPLIT.md)
- full docs map: [docs/DOCS_INDEX.md](docs/DOCS_INDEX.md)
- install into another repo: [../docs/INSTALLATION.md](../docs/INSTALLATION.md)
- contribute skills: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

## Package Structure

This repo is organized as an agent-pack source. Definitions live in first-class buckets.

| Path | What's here |
|---|---|
| `skills/` | Reusable skills shipped with the agent pack. |
| `agents/` | Role agent definitions. |
| `workflows/` | Workflow definitions and generated workflow indexes. |
| `adapters/` | Framework adapter definitions and local adapter assets. |
| `tool-providers/` | MCP/tool-provider definitions such as Atlassian, draw.io, and scanners. |
| `stacks/` | Technology stack packs. |
| `domains/` | Domain packs. |
| `profiles/` | Profile composition inputs. |
| `plugins/agent-pack/` | Consumer-facing plugin bundle with `plugin.json`, mirrored skills, and registry export. |
| `core/`, `hooks/`, `hosts/`, `policies/` | Runtime-adjacent behavior that should migrate to `agent-harness`. |
| `generated/` | Committed generated index/registry artifacts. |
| `scripts/`, `tests/`, `docs/` | Build, validation, and reference surface. |

Definitions under `agents/`, `skills/`, `workflows/`, `stacks/`, `domains/`, `tool-providers/`, and most `adapters/` are exported for `agent-registry`.

## Core Commands

```bash
npm run build:skills    # regenerate all skill docs + registry
npm run check:skills    # verify nothing is stale
npm run gen:hosts       # regenerate CLAUDE.md / AGENTS.md / copilot-instructions.md
npm test                # run full test suite
```

For registry export from the root repo:

```bash
npm run registry:export # writes generated/agent-registry/registry.json
```

## Repo Shape

```text
agent-pack/
  agents/
  skills/
  workflows/
  adapters/
  tool-providers/
  stacks/
  domains/
  profiles/
  plugins/agent-pack/
  core/
  hooks/
  hosts/
  policies/
  generated/
  scripts/
  tests/
  docs/
```

## Read Next

- contribution flow: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)
- split boundary: [docs/TRANSITION_SPLIT.md](docs/TRANSITION_SPLIT.md)
- package map: [docs/module-map.md](docs/module-map.md)
- metadata/build rules: [docs/METADATA-SCHEMA.md](docs/METADATA-SCHEMA.md)
- install contract: [docs/install-spec.md](docs/install-spec.md)
