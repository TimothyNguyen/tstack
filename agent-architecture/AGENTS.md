# AGENTS.md

Instructions for AI coding agents working in `agent-architecture/`.

## Purpose

`agent-architecture/` is a reusable, enterprise-safe skill pack for software
engineering agents.

`../gstack/` is reference material only. Do not edit it when working on this
package.

## Commit Discipline

Every commit is one externally describable behavior change. Invoke the
`commit` skill when committing, or follow these rules directly:

- Format: `<type>[scope]: <description>` (Conventional Commits).
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`.
- Never use `--no-verify`, `--force` (use `--force-with-lease`).
- Sequence for rebasing: stage → commit → fetch → rebase → push.

For Codex: reference skills by task purpose, not slash commands:
```
Use the spec skill to convert this requirement into scoped tasks.
Use the commit skill to stage and commit only the authentication fix.
```

## Architecture Pattern

Follow the gstack-style skill layout:

```text
<skill-name>/
  SKILL.md.tmpl   # source
  SKILL.md        # generated output
  sections/
    manifest.json
    *.md.tmpl
    *.md
```

Rules:

- Edit `SKILL.md.tmpl`, not `SKILL.md`, unless debugging generated output.
- Run `npm run build:skills` after changing templates.
- Run `npm run check:skills` before committing.
- Commit generated `SKILL.md` files with their templates.
- Keep skill folders top-level, like gstack. Do not move them under `skills/`.

## Safety Defaults

The default posture is enterprise-safe:

- No public telemetry.
- No public update checks.
- No public tunnels.
- No cookie/session import.
- No public internet scraping.
- No credential reads.
- No global config mutation unless explicitly requested.
- Privileged tools require policy approval and audit events.

Do not introduce behavior that violates these defaults.

## Scope Rules

Each commit must change one behavior surface.

Good examples:

- `skills: add health check skill`
- `tests: verify generated skill freshness`
- `docs: define install contract`
- `policies: disable public egress by default`

Bad examples:

- `misc`
- `enterprise hardening`
- `add a bunch of skills`
- `cleanup`

## Tests

Run from `agent-architecture/`:

```bash
npm run check:skills
npm test
```

Useful additional checks:

```bash
npm run test:free:list
npm run test:free:windows
```

## Current Important Files

- `README.md`: package overview.
- `SPEC.md`: migration and architecture spec.
- `docs/install-spec.md`: install contract for other repos.
- `docs/skill-catalog.md`: current skill list.
- `policies/enterprise-default.json`: default no-egress policy.
- `scripts/gen-skill-docs.mjs`: template renderer.
- `scripts/discover-skills.mjs`: gstack-style template discovery.
- `tests/skill-generation.test.mjs`: generator and policy smoke tests.

## Host And Adapter Direction

Host and adapter support should stay generated or declarative where possible.

Current targets include:

- Claude
- Codex
- Copilot
- Google ADK
- Strands
- AgentCore
- AG-UI
- MCP
- codebase-engine (local AST knowledge graph, no external egress)
- CodeGraph or another codebase-understanding adapter

Do not make any of these a hard dependency of the core package.

## Handling Project-Specific Work

Core skills must stay domain-neutral.

Put project-specific or stack-specific behavior in optional packs such as:

- `stack-aws`
- `stack-spring-boot`
- `stack-databricks`
- `stack-python`
- `stack-react`
- `stack-csharp`
- `stack-postgres`
- `stack-sql-server`

These packs should follow the same `SKILL.md.tmpl` plus generated `SKILL.md`
pattern.
