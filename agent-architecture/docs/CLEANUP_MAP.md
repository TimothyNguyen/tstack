# Agent Architecture Cleanup Map

Yes: `agent-architecture` is too bloated as a root-level package.

The problem is not size on disk. The problem is that root folders mix four different concerns:

- plugin content
- registry definitions
- runtime harness behavior
- generated/install compatibility output

## Target Shape

`agent-architecture` should become a plugin source, not a mini monorepo.

Preferred shape:

```text
agent-architecture/
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
agent-architecture/plugins/agent-architecture/
  plugin.json
  registry.json
  skills/
```

`agent-registry` and `agent-harness` should consume that surface, not the legacy root.

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
reference-agent-architecture-patterns/
reference-skill-patterns/
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

These are runtime/harness concerns and should not stay in the plugin long-term:

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
plugins/agent-architecture/
generated/
README.md
package.json
SKILL.md.tmpl
SKILL.md
```

But `generated/` should remain derived output, not source truth.

### Generated Or Local Runtime Noise

These should not be source truth:

```text
.agents/
.architecture-agent/
.claude-plugin/
.cursor-plugin/
generated/
plugins/agent-architecture/skills/
plugins/agent-architecture/registry.json
```

Exception: plugin output may stay committed during transition so consumers can use it without building.

## Migration Order

1. Keep `plugins/agent-architecture/` as consumer surface.
2. Teach build scripts to read from both old and new paths.
3. Move root skill folders into `skills/`.
4. Keep `adapters/` as the adapter definition bucket.
5. Keep `stacks/` and `domains/` as separate registry buckets.
6. Move tool/MCP providers to `tool-providers`.
7. Move runtime pieces to `agent-harness`.
8. Delete compatibility path support after `agent-registry` and `agent-harness` consume the plugin registry directly.

Do not perform steps 3-7 as raw directory moves. Update discovery/install/tests first, then move one category at a time.
