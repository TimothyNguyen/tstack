# Governance Automation

Use this file as operational source for Claude, Codex, Copilot, and humans working in this repo.

## Purpose

Governance automation keeps inventory of repository components in sync whenever new skills, agents, adapters, plugins, stacks, or MCP implementations are added.

Tracked artifact:

- `generated/governance-inventory.json` — machine-readable inventory
- `generated/governance-summary.md` — human-readable snapshot

## Commands

```bash
npm run governance:build
npm run governance:check
```

Use `governance:build` after adding, renaming, or deleting:

- `SKILL.md` skills
- `*.agent.md` agents
- `agents/**/SKILL.md` agents
- `packages/adapters/**/SKILL.md` adapters
- `packages/stacks/**/SKILL.md` stacks
- directories under any `plugins/`
- directories named `mcp-*` that contain runnable/package markers

Use `governance:check` before commit or in CI. It fails when:

- inventory file is missing
- inventory file is stale
- duplicate component ids exist
- required governance doc is missing

## Detection Rules

Classification is path-based and deterministic.

| Pattern | Type |
| --- | --- |
| `**/SKILL.md` | `skill` by default |
| `agents/**/SKILL.md` | `agent` |
| `**/agents/**/SKILL.md` | `agent` |
| `**/packages/skills/agents/**/SKILL.md` | `agent` |
| `**/packages/adapters/**/SKILL.md` | `adapter` |
| `**/packages/stacks/**/SKILL.md` | `stack` |
| `**/*.agent.md` | `agent` |
| `**/plugins/<name>/...` | `plugin` directory inventory item |
| `**/mcp-*` dir with `package.json`, `pyproject.toml`, `setup.py`, `Cargo.toml`, `src/`, or `server.py` | `mcp` |

## Required Workflow

1. Add or change component files.
2. Run `npm run governance:build`.
3. Review `generated/governance-inventory.json`.
4. Commit source changes plus generated governance artifacts.
5. Run `npm run governance:check`.

## Guidance For Coding Agents

- Do not hand-edit `generated/governance-inventory.json` unless debugging generator output.
- Prefer changing detection logic in `scripts/governance-lib.js`.
- If component layout changes, update `governance.config.json` and this file in same change.
- If a new component type is introduced, extend build + check flow before adding large batches of content.
- Keep generated artifacts committed so other agents can diff inventory drift quickly.

## Supported Files

- `scripts/governance-lib.js` — discovery + validation logic
- `scripts/build-governance.js` — writes artifacts
- `scripts/check-governance.js` — verifies artifacts and repo state
- `bin/governance.js` — CLI entrypoint
- `governance.config.json` — repo-level settings
