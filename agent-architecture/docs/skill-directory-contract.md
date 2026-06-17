# Skill Directory Contract

Skills are stored as directories. This keeps each agent workflow self-contained
and close to its supporting references, commands, templates, and tests.

## Required Shape

```text
skills/<skill-name>/SKILL.md
```

`SKILL.md` is the required entrypoint. It contains:

- Skill name.
- Short description.
- When to invoke it.
- Required policy capabilities.
- Step-by-step behavior.
- Expected outputs.
- References to local supporting files when needed.

## Optional Files

```text
skills/<skill-name>/commands.md
skills/<skill-name>/references/
skills/<skill-name>/templates/
skills/<skill-name>/tests/
skills/<skill-name>/manifest.json
```

Use optional files only when they have a clear purpose:

- `commands.md`: approved command recipes or host-specific command notes.
- `references/`: longer instructions, checklists, schemas, or examples.
- `templates/`: generated report, ticket, plan, or prompt templates.
- `tests/`: validation fixtures for generated skills or tool behavior.
- `manifest.json`: metadata used by the compiler when frontmatter is not enough.

## Domain And Stack Packs

Domain and stack packs use nested directories:

```text
skills/domain/causal-inference/SKILL.md
skills/domain/experiment-design/SKILL.md
skills/domain/uplift-modeling/SKILL.md
skills/stack/aws/SKILL.md
skills/stack/spring-boot/SKILL.md
skills/stack/databricks/SKILL.md
skills/stack/python/SKILL.md
skills/stack/react/SKILL.md
skills/stack/csharp/SKILL.md
skills/stack/postgres/SKILL.md
skills/stack/sql-server/SKILL.md
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
