# Module Map

This package is split by responsibility so teams can adopt the core without
pulling in project-specific domains, optional browser tooling, or external
integrations.

## Core Modules

| Module | Responsibility | May depend on | Must not depend on |
|---|---|---|---|
| `core/host-config` | Validate host adapter definitions and expose the host registry contract. | Standard library, shared types | Skills, profiles, cloud stacks |
| `core/skill-compiler` | Render top-level `SKILL.md.tmpl` sources and `sections/*.md.tmpl` sources into generated Markdown. | Host configs, policy metadata, shared types | Network, telemetry, global config |
| `core/policy` | Load and evaluate local policy for tools, egress, install paths, and audit events. | Shared types | Host runtime internals |
| `core/install` | Install generated artifacts into declared local targets. | Host configs, policy | Public update checks, global mutation by default |
| `core/audit` | Write local audit events for privileged actions and policy decisions. | Policy, shared types | Secrets, full prompts, file contents |

## Host Modules

Host modules describe where generated skills go and how content must be shaped
for each agent runtime.

Initial host targets:

- `hosts/claude`
- `hosts/codex`
- `hosts/copilot`
- `hosts/strands`
- `hosts/agentcore`
- `hosts/google-adk`

Host modules should stay declarative. Runtime-specific logic belongs in
adapters only when a declarative rewrite is insufficient.

## Skill Modules

Generic skills follow the gstack layout and live as top-level directories. Each
skill or agent workflow owns a directory with a required `SKILL.md.tmpl` source
and generated `SKILL.md` output:

```text
<skill-name>/SKILL.md.tmpl
<skill-name>/SKILL.md
```

Optional supporting files live beside that entrypoint:

```text
<skill-name>/commands.md
<skill-name>/references/
<skill-name>/templates/
<skill-name>/tests/
<skill-name>/sections/manifest.json
<skill-name>/sections/*.md.tmpl
<skill-name>/sections/*.md
```

This preserves the gstack ergonomics while keeping the new package generic.

- `spec`
- `autoplan`
- `plan-review`
- `plan-director-review`
- `plan-pm-review`
- `plan-eng-review`
- `plan-design-review`
- `plan-devex-review`
- `investigate`
- `review`
- `qa`
- `test`
- `health`
- `security-review`
- `documentation`
- `document-generate`
- `document-release`
- `learnings`
- `release`
- `ship`
- `codebase-understanding`
- `rtk-token-optimizer`

Each skill owns its instructions, examples, policy requirements, and generated
host variants. Skills must not assume a specific project stack unless they live
in a domain or stack pack.

## Policy Modules

Policies define what a local install can do. The default policy must be safe for
company environments:

- No public egress.
- No telemetry.
- No public update checks.
- No public tunnels.
- No cookie/session import.
- No privileged shell, git write, deploy, credential, or database write without
  explicit allowlist and audit event.

## Profiles

Profiles compose generic skills, optional skill packs, host targets, and policy
overrides for a project.

Profiles may name technologies or domains. Core modules must not.

Example profile families:

- `profiles/enterprise-default`
- `profiles/marketing-measurement`
- `profiles/data-platform`
- `profiles/frontend-app`
- `profiles/backend-service`

## Optional Adapters

Adapters integrate external runtimes or tools. They are optional and disabled
unless a profile and policy enable them.

Candidate adapters:

- `adapters/ag-ui`
- `adapters/mcp`
- `adapters/codegraph`
- `adapters/browser`
- `adapters/agentcore`
- `adapters/strands`
- `adapters/google-adk`

Adapters must expose narrow interfaces to core. Core should not import a heavy
runtime SDK directly.

## First Implementation Order

1. Host config schema and registry.
2. Default no-egress policy.
3. Skill directory and metadata shape.
4. Skill compiler skeleton.
5. Local installer skeleton.
6. Starter generic skills.
7. Optional profiles and adapters.
