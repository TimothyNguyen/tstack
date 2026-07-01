# Claude-Code-Best-Practice Migration

Map `claude-code-best-practice/` content into `agent-architecture/` without importing repo bloat.

## Goal

Keep substance. Drop presentation-heavy repo mechanics.

Source repo has four useful classes of content:

- host-specific best-practice docs
- workflow patterns
- hook/config examples
- research reports and tip dumps

Only first three belong in `agent-architecture` directly.

## Recommendation

Use four buckets:

- `copy`: usable with minimal edits
- `adapt`: useful, but rewrite into existing `agent-architecture` model
- `rewrite`: keep idea only, do not import source file structure
- `ignore`: presentation/demo/archive content

## Bucket Map

### Copy

These fit current package with light cleanup:

- `.claude/hooks/HOOKS-README.md`
  Target: new doc under `docs/` or `docs/runbooks/`
  Why: `agent-architecture/hooks/` already exists but docs are thin.

- `development-workflows/rpi/.claude/agents/*.md`
  Target: `packages/skills/agents/` or examples under `docs/workflows/`
  Why: good role decomposition patterns.

- `development-workflows/rpi/.claude/commands/rpi/*.md`
  Target: examples/reference docs, not top-level production commands
  Why: useful workflow composition examples.

### Adapt

These should become `agent-architecture` docs, skills, or workflow registry entries:

- `best-practice/claude-subagents.md`
  Target: `docs/ADOPTION.md`, `docs/GLOSSARY.md`, maybe `subagent-orchestrator/`
  Why: content overlaps existing subagent docs, but source is Claude-host-specific and presentation-heavy.

- `best-practice/claude-commands.md`
  Target: `claude/SKILL.md` and `docs/skill-catalog.md`
  Why: command concepts matter, but slash-command catalog should not become framework-neutral core truth.

- `best-practice/claude-skills.md`
  Target: `docs/EXTENSIBILITY-GUIDE.md`, `docs/skill-directory-contract.md`
  Why: reinforces packaging model already present.

- `best-practice/claude-mcp.md`
  Target: `docs/policy-defaults.md`, `docs/privacy-first-adapter-contract.md`, `packages/adapters/adapter-mcp/`
  Why: MCP guidance belongs in adapter and policy docs, not as Claude-only article.

- `best-practice/claude-memory.md`
  Target: `context-save/`, `context-restore/`, `learn/`, `learnings/`, plus adoption docs
  Why: idea is useful; raw Claude memory conventions need translation into architecture-neutral patterns.

- `best-practice/claude-settings.md`
  Target: `claude/SKILL.md`, `codex/SKILL.md`, `docs/install-spec.md`
  Why: host config advice should be normalized per host adapter.

- `best-practice/claude-cli-startup-flags.md`
  Target: `claude/SKILL.md`
  Why: host-specific operational guidance.

- `best-practice/claude-power-ups.md`
  Target: `docs/ADOPTION.md` or host notes
  Why: mostly UX/usage patterns, not core architecture.

- `development-workflows/rpi/rpi-workflow.md`
  Target: `docs/workflows/registry.json`, `autoplan/`, `spec/`, `ship/`, `subagent-orchestrator/`
  Why: strongest workflow candidate in source repo.

- `development-workflows/cross-model-workflow/cross-model-workflow.md`
  Target: `codex/SKILL.md`, `claude/SKILL.md`, maybe new doc `docs/cross-model-workflows.md`
  Why: directly relevant to this repo.

### Rewrite

Keep concepts only. Re-express in current architecture voice:

- `reports/claude-agent-command-skill.md`
- `reports/claude-agent-memory.md`
- `reports/claude-agent-sdk-vs-cli-system-prompts.md`
- `reports/claude-global-vs-project-settings.md`
- `reports/claude-in-chrome-v-chrome-devtools-mcp.md`
- `reports/claude-skills-for-larger-mono-repos.md`
- `reports/claude-spinner-verbs-and-tips.md`
- `reports/claude-usage-and-rate-limits.md`
- `reports/why-harness-is-important.md`

Why rewrite:

- high-value observations
- low-value source formatting
- often stale quickly
- usually better as policy/adoption/reference notes than standalone imported reports

### Ignore

Do not migrate:

- `!/**`
- `presentation/**`
- `videos/**`
- `tips/**`
- `tutorial/**`
- `agent-teams/output/**`
- `orchestration-workflow/**` media assets
- generated batch folders / `graphify-out/`

Why:

- mostly presentation layer, demos, screenshots, transcripts, or social proof
- imports repo weight without improving agent-architecture package quality

## Best Landing Zones

Use current package boundaries instead of mirroring source repo:

- host-specific Claude guidance -> `claude/SKILL.md`
- host-specific Codex guidance -> `codex/SKILL.md`
- hook docs -> `docs/runbooks/` plus `hooks/`
- workflow patterns -> `docs/workflows/registry.json`, `autoplan/`, `ship/`, `spec/`, `subagent-orchestrator/`
- memory/context patterns -> `context-save/`, `context-restore/`, `learn/`, `learnings/`
- MCP guidance -> `packages/adapters/adapter-mcp/` and policy docs
- research conclusions -> one compact doc in `docs/`, not many imported reports

## Concrete Migration Plan

### Phase 1

Low-risk, high-signal:

1. Create hook documentation from `.claude/hooks/HOOKS-README.md`
2. Add cross-model workflow doc distilled from `development-workflows/cross-model-workflow/`
3. Add RPI workflow note distilled into `docs/` and workflow registry

### Phase 2

Fold host-specific best practices into existing adapters:

1. extend `claude/SKILL.md`
2. extend `codex/SKILL.md`
3. extend adoption/install docs

### Phase 3

Mine reports for durable findings:

1. extract stable guidance
2. add to one or two canonical docs
3. discard report-by-report structure

## What Not To Do

- do not copy whole source repo into `packages/`
- do not import `reports/` as-is
- do not import media assets unless a doc absolutely needs one
- do not create another parallel docs tree named after source repo
- do not duplicate concepts already covered by `agent-architecture`

## Immediate Next Changes

Best next implementation set:

1. add `docs/cross-model-workflows.md`
2. add `docs/runbooks/claude-hooks.md`
3. add `docs/rpi-workflow.md`
4. patch `claude/SKILL.md` and `codex/SKILL.md` with distilled settings/host guidance

This gets most value with least bloat.
