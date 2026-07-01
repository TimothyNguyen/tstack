# AGENTS.md

Instructions for AI coding agents working inside `agent-architecture/`.

## Read First

- [README.md](README.md)
- [docs/START_HERE.md](docs/START_HERE.md)
- [docs/DOCS_INDEX.md](docs/DOCS_INDEX.md)

## Critical Rules

- edit `SKILL.md.tmpl`, not generated `SKILL.md`, unless debugging generation
- run `npm run build:skills` after template changes
- run `npm run check:skills` before completion
- keep commits scoped to one behavior surface
- preserve enterprise-safe defaults: no public telemetry, no default egress, no credential scraping

## When Working On

- skill content:
  read `docs/CONTRIBUTING.md`
- metadata/build logic:
  read `docs/METADATA-SCHEMA.md`
- package structure:
  read `docs/module-map.md`
- install behavior:
  read `docs/install-spec.md`

## Important Files

- `README.md`
- `SPEC.md`
- `docs/CONTRIBUTING.md`
- `docs/METADATA-SCHEMA.md`
- `docs/module-map.md`
- `scripts/gen-skill-docs.mjs`
- `scripts/discover-skills.mjs`
