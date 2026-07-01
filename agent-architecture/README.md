# Agent Architecture

Enterprise-safe skill pack for Claude, Codex, and Copilot style coding agents.

This package has a lot of surface area. Do not use this file as a full manual.

## Start

- new here: [docs/START_HERE.md](docs/START_HERE.md)
- full docs map: [docs/DOCS_INDEX.md](docs/DOCS_INDEX.md)
- install into another repo: [../docs/INSTALLATION.md](../docs/INSTALLATION.md)
- contribute skills: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

## What This Package Contains

- role-based agents
- reusable skills
- optional adapters
- optional stacks
- generated registries and catalogs

## Core Commands

```bash
npm run build:skills
npm run check:skills
npm test
```

## Repo Shape

- `agents/` role agents
- top-level skill folders like `review/`, `spec/`, `qa/`
- `packages/skills/` optional skill packs
- `packages/adapters/` framework adapters
- `packages/stacks/` tech/domain stacks
- `plugins/` packaged skill/plugin bundles
- `docs/` package-level reference docs

## Read Next

- contribution flow: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)
- architecture map: [docs/module-map.md](docs/module-map.md)
- metadata/build rules: [docs/METADATA-SCHEMA.md](docs/METADATA-SCHEMA.md)
- install contract: [docs/install-spec.md](docs/install-spec.md)
