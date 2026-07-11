# Claude Hooks Runbook

Use hooks for policy checks, environment setup, notifications, or logging. Keep hooks small, deterministic, and easy to disable.

## What Matters Most

Common high-value events:

- `SessionStart`: bootstrap environment or reminders
- `PreToolUse`: block or inspect risky tool calls
- `PostToolUse` / `PostToolUseFailure`: logging and follow-up
- `Stop`: final cleanup or summary side effects
- `SubagentStart` / `SubagentStop`: subagent tracing
- `PreCompact` / `PostCompact`: compact-time state handling
- `UserPromptSubmit`: prompt linting or expansion guards

Full event catalog lives in Claude docs. This runbook covers operational use, not exhaustive reference.

## Configuration Surfaces

Typical files:

- `.claude/settings.json`: shared project hooks
- `.claude/settings.local.json`: local overrides
- `.claude/hooks/config/hooks-config.json`: script-level shared toggles
- `.claude/hooks/config/hooks-config.local.json`: script-level local toggles

Prefer project-level settings for team behavior. Prefer local overrides for personal noise reduction.

## Safe Defaults

- keep handlers fast
- prefer `async: true` for non-blocking side effects
- use explicit matchers for tool-scoped hooks
- log minimal data
- avoid network calls unless policy requires them

## Disable Paths

Disable all hooks:

```json
{
  "disableAllHooks": true
}
```

Disable selected script behaviors with local config overrides, for example:

```json
{
  "disableLogging": true,
  "disableSessionStartHook": true
}
```

## Agent Hooks

Claude supports hooks in agent frontmatter. Treat this as narrower than global hooks:

- scope behavior to one agent lifecycle
- use for agent-specific guardrails
- re-test after Claude upgrades because support surface changes faster than core settings hooks

## Failure Triage

If hooks cause broken sessions:

1. set `disableAllHooks: true`
2. rerun failing workflow
3. re-enable one hook family at a time
4. check script logs and exit codes
5. convert noisy synchronous hooks to async where possible

If compaction or subagent workflows fail unexpectedly, inspect hook handlers on:

- `PreCompact`
- `PostCompact`
- `SubagentStop`
- `Stop`

These are common places for fragile side effects.

## Design Rules

- hook should enforce policy or add clear signal
- hook should not become second application runtime
- blocking hooks must fail loudly and explain reason
- local developer convenience hooks should remain optional

## When Not To Use Hooks

Do not use hooks for:

- core business logic
- long-running orchestration
- large report generation
- anything that must succeed for normal editing to continue

Keep that work in explicit scripts or skills instead.
