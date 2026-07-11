# Module Map

This package is split by authored definition type so teams can install only the
agents, skills, workflows, stacks, domains, adapters, and tool providers they
need.

For the TStack split, see [TRANSITION_SPLIT.md](TRANSITION_SPLIT.md). Runtime
execution belongs in `agent-harness`; published registry records belong in
`agent-registry`; authored source lives here in `agent-pack`.

## Core Modules

| Module | Responsibility | May depend on | Must not depend on |
|---|---|---|---|
| `core/host-config` | Validate host adapter definitions and expose the host registry contract. | Standard library, shared types | Skills, profiles, cloud stacks |
| `core/skill-compiler` | Render top-level `SKILL.md.tmpl` sources and `sections/*.md.tmpl` sources into generated Markdown. | Host configs, policy metadata, shared types | Network, telemetry, global config |
| `core/policy` | Load and evaluate local policy for tools, egress, install paths, and audit events. | Shared types | Host runtime internals |
| `core/install` | Install generated artifacts into declared local targets. | Host configs, policy | Public update checks, global mutation by default |
| `core/audit` | Write local audit events for privileged actions and policy decisions. | Policy, shared types | Secrets, full prompts, file contents |
| `core/events` | Create AG-UI-compatible local event envelopes with redacted payloads. | Audit redaction helper | External telemetry transports |

These runtime-adjacent modules remain here for current package compatibility.
New execution, gate, checkpoint, and trace behavior belongs in `agent-harness`.

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

`hosts/registry.json` declares the current host targets, generated paths, and
default privacy posture.

Host modules should stay declarative. Runtime-specific logic belongs in
adapters only when a declarative rewrite is insufficient.

## Skill Modules

Generic skills follow the agent-pack layout and live under `skills/`. Each skill
owns a directory with a required `SKILL.md.tmpl` source and generated `SKILL.md`
output:

```text
skills/<skill-name>/SKILL.md.tmpl
skills/<skill-name>/SKILL.md
```

Optional supporting files live beside that entrypoint:

```text
skills/<skill-name>/commands.md
skills/<skill-name>/references/
skills/<skill-name>/templates/
skills/<skill-name>/tests/
skills/<skill-name>/sections/manifest.json
skills/<skill-name>/sections/*.md.tmpl
skills/<skill-name>/sections/*.md
```

Registry export converts these into `agent-registry` records with source paths,
generated host variants, policy requirements, and agent compatibility.

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
- `codebase-engine`
- `context-save`
- `context-restore`
- `design-html`
- `design-review`
- `diagram`
- `retro`
- `skillify`
- `guard`
- `careful`
- `claude`
- `codex`
- `copilot`
- `agent-pack-upgrade`
- `migration-dotnet-sqlserver-modernization`
- `stack-legacy-frontend`
- `stack-react-typescript`
- `stack-sqlserver-to-postgres`
- `stack-aws-dms`
- `stack-spring-boot`
- `stack-spring-ai`
- `stack-databricks`
- `domain-mlops-databricks`
- `stack-databricks-dbt`
- `adapter-mcp`
- `adapter-github`
- `adapter-ag-ui`
- `adapter-openapi`
- `adapter-langgraph`
- `adapter-databricks`
- `adapter-seniorswe-concise`
- `reference-agent-pack-patterns`
- `stack-aws`
- `stack-python`
- `stack-csharp`
- `stack-postgres`
- `stack-sql-server`
- `domain-experiment-design`
- `domain-data-governance`
- `domain-model-interpretation`
- `adapter-google-adk`
- `adapter-agentcore`
- `adapter-strands`
- `migration-review`
- `release-notes`
- `benchmark`
- `canary`

Each skill owns its instructions, examples, policy requirements, and generated
host variants. Skills must not assume a specific project stack unless they live
in a domain or stack pack.

## Agent Modules

Agents live under `agents/`. They are role entrypoints such as `swe`,
`qa-agent`, `spec-agent`, `pm`, `orchestrate`, and domain-specific roles.

Agent definitions may route work to skills, stacks, domains, adapters, and
tool providers, but they should not perform runtime execution themselves.

## Workflow Modules

Workflows live under `workflows/` when they are source definitions and under
`docs/workflows/` when they are generated or documentation-oriented indexes.

Workflows should be declarative:

- inputs and required context
- ordered skill/agent steps
- approval and policy checkpoints
- expected outputs
- verification hooks

Execution belongs in `agent-harness`.

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

Profiles compose skills, agents, workflows, stacks, domains, host targets, and policy
overrides for a project.

Profiles may name technologies or domains. Core modules must not.

Example profile families:

- `profiles/enterprise-default`
- `profiles/marketing-measurement`
- `profiles/data-platform`
- `profiles/frontend-app`
- `profiles/backend-service`

Current profile manifests:

- `profiles/privacy-default.json`
- `profiles/enterprise-modernization.json`

## Optional Adapters

Adapters integrate external runtimes or tools. They are optional and disabled
unless a profile and policy enable them.

Adapter catalog metadata belongs in `agent-registry`; executable adapter interfaces
and runtime calls belong in `agent-harness`.

Candidate adapters:

- `adapters/ag-ui`
- `adapters/mcp`
- `adapters/browser`
- `adapters/agentcore`
- `adapters/strands`
- `adapters/google-adk`
- `adapters/seniorswe-concise`

Adapters must expose narrow interfaces to core. Core should not import a heavy
runtime SDK directly.

`adapters/registry.json` is the source of truth for optional adapter id, skill,
policy module, runtime type, egress posture, write posture, and state posture.

## First Implementation Order

1. Host config schema and registry.
2. Default no-egress policy.
3. Skill directory and metadata shape.
4. Skill compiler skeleton.
5. Local installer skeleton.
6. Starter generic skills.
7. Optional profiles and adapters.
