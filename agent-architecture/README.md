# Agent Architecture

Enterprise-safe skill/plugin source for Claude, Codex, and Copilot style coding agents.

This package is legacy transition surface for the TStack split. It still authors and builds skills, but target runtime work belongs in `agent-harness` and target catalog/registry work belongs in `agent-registry`.

## Start

- new here: [docs/START_HERE.md](docs/START_HERE.md)
- split boundary: [docs/TRANSITION_SPLIT.md](docs/TRANSITION_SPLIT.md)
- full docs map: [docs/DOCS_INDEX.md](docs/DOCS_INDEX.md)
- install into another repo: [../docs/INSTALLATION.md](../docs/INSTALLATION.md)
- contribute skills: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

## Package Structure

This repo is now organized as a plugin/catalog source. Definitions live in first-class buckets instead of nested optional packages.

| Path | What's here |
|---|---|
| `skills/` | Reusable skills shipped with the plugin/catalog. |
| `agents/` | Role agent definitions. |
| `adapters/` | Framework adapter definitions and local adapter assets. |
| `tool-providers/` | MCP/tool-provider definitions such as Atlassian, draw.io, and scanners. |
| `stacks/` | Technology stack packs. |
| `domains/` | Domain packs. |
| `profiles/` | Profile composition inputs. |
| `plugins/agent-architecture/` | Consumer-facing plugin bundle with `plugin.json`, mirrored skills, and registry export. |
| `core/`, `hooks/`, `hosts/`, `policies/` | Runtime-adjacent behavior that should migrate to `agent-harness`. |
| `generated/` | Committed generated index/registry artifacts. |
| `scripts/`, `tests/`, `docs/` | Build, validation, and reference surface. |

Catalog-like pieces under `agents/`, `skills/`, `stacks/`, `domains/`, `tool-providers/`, and most `adapters/` are migration candidates for `agent-registry`.

## Core Commands

```bash
npm run build:skills    # regenerate all skill docs + registry
npm run check:skills    # verify nothing is stale
npm run gen:hosts       # regenerate CLAUDE.md / AGENTS.md / copilot-instructions.md
npm test                # run full test suite
```

For split migration from the root repo:

```bash
npm run registry:export # writes generated/agent-registry/registry.json
```

## Repo Shape

```text
agent-architecture/
  agents/
  skills/
  adapters/
  tool-providers/
  stacks/
  domains/
  profiles/
  plugins/agent-architecture/
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
- transition boundary: [docs/TRANSITION_SPLIT.md](docs/TRANSITION_SPLIT.md)
- architecture map: [docs/module-map.md](docs/module-map.md)
- metadata/build rules: [docs/METADATA-SCHEMA.md](docs/METADATA-SCHEMA.md)
- install contract: [docs/install-spec.md](docs/install-spec.md)
