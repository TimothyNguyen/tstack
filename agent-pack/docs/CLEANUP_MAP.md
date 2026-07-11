# Agent Pack Cleanup Map

`agent-pack` is now the authored-definition package. Keep it focused on
definitions and generated distribution artifacts.

The problem is not size on disk. The problem is that root folders mix four different concerns:

- authored agent-pack definitions
- registry export artifacts
- runtime harness behavior
- generated/install compatibility output

## Target Shape

`agent-pack` should remain an agent-pack source, not a runtime platform.

Preferred shape:

```text
agent-pack/
  README.md
  package.json
  plugin.json
  registry.json
  skills/
  agents/
  workflows/
  adapters/
  tool-providers/
  stacks/
  domains/
  profiles/
  schemas/
  docs/
  scripts/
  tests/
  generated/
```

Current clean consumer surface:

```text
agent-pack/plugins/agent-pack/
  plugin.json
  registry.json
  skills/
```

`agent-registry` and `agent-harness` should consume exported contracts, not
private directory assumptions.

## Root Folder Classification

### Move Under `skills/`

These are skill source folders currently cluttering root:

```text
autoplan/
brainstorming/
canary/
careful/
change-router/
claude/
codex/
commit/
context-restore/
context-save/
copilot/
doubt-driven-development/
guard/
health/
investigate/
learn/
learnings/
pre-commit-review/
qa/
qa-verify/
receiving-code-review/
reference-agent-pack-patterns/
release/
release-notes/
retro/
review/
ship/
skillify/
spec/
subagent-orchestrator/
systematic-debugging/
test/
using-agent-skills/
verification-before-completion/
writing-skills/
```

### Move Under `agents/`

Already exists:

```text
agents/
```

Specialty role agents now live in `agents/`:

```text
cloud
data
design-agent
diagram-agent
interviewer
migration
migration-engineer
orchestrate
release-agent
security
```

### Move Under `tool-providers/`

These are tool/MCP providers, not plain skills:

```text
tool-providers/atlassian-docs/
tool-providers/drawio-mcp-python/
tool-providers/security-scanner/
tool-providers/diagram-cloudformation/
tool-providers/diagram-helm/
tool-providers/diagram-iac/
tool-providers/diagram-infrastructure/
```

### Move Under `adapters/`

Current:

```text
adapters/
```

Target:

```text
adapters/
```

Definitions stay here. Runtime implementations belong in `agent-harness/adapter-runtime`.

### Move Under `stacks/`

Current:

```text
stacks/
```

Target:

```text
stacks/
```

Domain packs should move to `domains/`:

```text
domain-data-governance
domain-experiment-design
domain-mlops-databricks
domain-model-interpretation
```

### Move To `agent-harness`

These are runtime/harness concerns and should stay compatibility-only here:

```text
core/
hooks/
hosts/
policies/
bin/
scripts/install.mjs
scripts/subagent-*.mjs
```

Keep compatibility wrappers only until `agent-harness` owns install and execution.

### Keep In Plugin Package

```text
docs/
scripts/
tests/
plugins/agent-pack/
generated/
README.md
package.json
SKILL.md.tmpl
SKILL.md
```

But `generated/` should remain derived output, not authored source.

### Generated Or Local Runtime Noise

These should not be authored source:

```text
.agents/
.agent-pack/
.claude-plugin/
.cursor-plugin/
generated/
plugins/agent-pack/skills/
plugins/agent-pack/registry.json
```

Exception: plugin output may stay committed so consumers can use it without building.

## Cleanup Order

1. Keep `plugins/agent-pack/` as consumer surface.
2. Teach build scripts to read from both old and new paths.
3. Move root skill folders into `skills/`.
4. Keep `adapters/` as the adapter definition bucket.
5. Keep `stacks/` and `domains/` as separate registry buckets.
6. Move tool/MCP providers to `tool-providers`.
7. Move runtime pieces to `agent-harness`.
8. Delete compatibility path support after `agent-registry` and `agent-harness` consume exported contracts directly.

Do not perform steps 3-7 as raw directory moves. Update discovery/install/tests first, then move one category at a time.
