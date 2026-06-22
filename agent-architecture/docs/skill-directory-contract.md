# Skill Directory Contract

Skills are stored as directories. This keeps each agent workflow self-contained
and close to its supporting references, commands, templates, and tests.

## Required Shape

```text
<skill-name>/SKILL.md.tmpl
<skill-name>/SKILL.md
```

`SKILL.md.tmpl` is the required source entrypoint. `SKILL.md` is generated from
it. The generated file is committed so agent hosts that cannot run the generator
can still install the skill. The source file contains:

- Skill name.
- Short description.
- When to invoke it.
- Required policy capabilities.
- Step-by-step behavior.
- Expected outputs.
- References to local supporting files when needed.

## Optional Files

```text
<skill-name>/commands.md
<skill-name>/references/
<skill-name>/templates/
<skill-name>/tests/
<skill-name>/sections/manifest.json
<skill-name>/sections/*.md.tmpl
<skill-name>/sections/*.md
```

Use optional files only when they have a clear purpose:

- `commands.md`: approved command recipes or host-specific command notes.
- `references/`: longer instructions, checklists, schemas, or examples.
- `templates/`: generated report, ticket, plan, or prompt templates.
- `tests/`: validation fixtures for generated skills or tool behavior.
- `sections/manifest.json`: section registry for large on-demand references.
- `sections/*.md.tmpl`: source for generated section references.
- `sections/*.md`: generated section references.

## Domain And Stack Packs

Domain and stack packs use nested directories:

```text
domain-experiment-design/SKILL.md.tmpl
domain-data-governance/SKILL.md.tmpl
stack-aws/SKILL.md.tmpl
stack-spring-boot/SKILL.md.tmpl
stack-databricks/SKILL.md.tmpl
stack-python/SKILL.md.tmpl
stack-react/SKILL.md.tmpl
stack-csharp/SKILL.md.tmpl
stack-postgres/SKILL.md.tmpl
stack-sql-server/SKILL.md.tmpl
```

These packs are optional. A project profile chooses which packs to install.

## Generated Host Artifacts

Source skills should not be edited per host. The compiler generates host
artifacts from the same source directory:

```text
generated/claude/<skill-name>/SKILL.md
generated/codex/<skill-name>/SKILL.md
generated/copilot/<skill-name>/SKILL.md
generated/google-adk/<skill-name>/SKILL.md
```

Host adapters may rewrite frontmatter, paths, tool names, metadata, or callback
bindings, but the source skill remains the reviewable contract.

## Rules

- One skill directory maps to one workflow or agent role.
- Supporting files stay inside the skill directory.
- Project-specific details go in domain packs, stack packs, or profiles.
- Core skills must not hardcode a specific cloud, database, UI, or business
  domain.
- Skills must declare required policy capabilities before describing privileged
  actions.
- No skill may assume public egress, cookie import, telemetry, public tunnels,
  or global config mutation.
