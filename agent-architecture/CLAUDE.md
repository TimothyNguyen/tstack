# CLAUDE.md

Claude Code guidance for `agent-architecture/`.

## What This Is

This directory is a reusable architecture-agent skill pack. It borrows the
gstack skill structure but is not gstack.

Use `../gstack/` only as reference material. Do not modify it.

## Work Style

- Keep commits scoped.
- Prefer editing templates over generated files.
- Preserve no-egress enterprise defaults.
- Do not add public telemetry, public update checks, public tunnels, cookie
  import, public scraping, or credential reads.
- Do not make Claude-specific assumptions in core logic; Claude is one host
  target among several.

## Skill Workflow

When changing a skill:

1. Edit `<skill>/SKILL.md.tmpl`.
2. Edit section templates under `<skill>/sections/*.md.tmpl` if needed.
3. Run:

```bash
npm run build:skills
npm run check:skills
npm test
```

4. Commit the template and generated Markdown together.

Generated files are intentionally committed so the pack can be installed in
repos that do not run the generator.

## Current Skill Shape

Top-level skill folders are intentional:

```text
review/SKILL.md.tmpl
review/SKILL.md
test/SKILL.md.tmpl
test/SKILL.md
health/SKILL.md.tmpl
health/SKILL.md
```

Do not move skills into `skills/`.

## Install Direction

Other repos should install this pack using the contract in:

```text
docs/install-spec.md
```

Default install target is repo-local:

```text
<repo>/.architecture-agent/
```

The upgrade workflow is:

```text
architecture-agent-upgrade
```

Do not reintroduce `tstack-upgrade`.

## Before Completion

Before reporting work complete, run:

```bash
npm run check:skills
npm test
```

If a command cannot run, report why and what remains unverified.
