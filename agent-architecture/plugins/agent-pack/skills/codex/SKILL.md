---
name: codex
version: 0.1.1
description: |
  OpenAI Codex host adapter. Covers how to use this skill pack inside a
  Codex-managed repo: AGENTS.md-driven skill invocation, tool availability,
  environment variables, and enterprise-safe defaults.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
agents: [_infrastructure]
---

## Enterprise Preamble

- Stay inside the current project unless the user explicitly names another path.
- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.
- Use policy-gated tools only when the active profile allows them.
- Commit after each discrete behavior change — do not accumulate unrelated edits across multiple files before committing.
- Each commit message must follow Conventional Commits: `<type>[scope]: <description>` (types: feat, fix, docs, refactor, test, chore, perf, ci).
- Never use `--no-verify`, `--force` (use `--force-with-lease`), or `--no-gpg-sign` unless explicitly instructed.
- Sequence for rebasing: stage → commit → fetch → rebase → push.

# Codex Host Adapter

Use this adapter when this skill pack runs inside an OpenAI Codex agent
environment. Codex discovers instructions through `AGENTS.md` files in the
repo tree — not via slash commands.

## How Skills Work in Codex

Codex does not support `/skill-name` invocation. Skills are activated by
referencing their purpose in the task description or via `AGENTS.md`:

```
# Use the spec skill
Run the spec workflow on the following requirement: ...

# Use the review skill
Review the diff in PR #42 using the review skill.
```

The generated skill pack for Codex lives at:

```
.architecture-agent/generated/codex/AGENTS.md
```

Install that file (or symlink it) into the target repo's root or merge its
contents into the existing `AGENTS.md`.

## Tool Availability in Codex

| Tool | Available | Notes |
|------|-----------|-------|
| Shell (Bash) | Yes | Full shell access in sandbox |
| Python | Yes | Via shell |
| Node.js | Yes | Via shell |
| File read/write | Yes | Within sandbox |
| Network | Sandbox-gated | Outbound blocked by default |
| Git | Yes | Local only, no push without explicit approval |

## Environment Variables

The seniorswe-concise adapter reads these in Codex:

| Variable | Purpose |
|----------|---------|
| `PLUGIN_DATA` | State directory for mode persistence |
| `SENIORSWE_CONCISE_DEFAULT_MODE` | Default concise mode (lite/full/ultra) |
| `ARCHITECTURE_AGENT_ROOT` | Root of the installed skill pack |

## Activating the seniorswe-concise Adapter

Install the hook runner by adding to your Codex startup script:

```bash
node "${ARCHITECTURE_AGENT_ROOT}/adapters/seniorswe-concise/hooks/seniorswe-concise-activate.cjs"
```

Mode tracking hook for each prompt:

```bash
echo '{"prompt":"'"$USER_PROMPT"'"}' | \
  node "${ARCHITECTURE_AGENT_ROOT}/adapters/seniorswe-concise/hooks/seniorswe-concise-mode-tracker.cjs"
```

Reference hook config: `adapters/seniorswe-concise/hooks/claude-codex-hooks.json`.

## Codex Limitations vs. Claude Code

| Capability | Claude Code | Codex |
|---|---|---|
| Slash command skill routing | Native | Not supported — use AGENTS.md |
| Persistent hook state | Via Claude hooks | Via `PLUGIN_DATA` + shell |
| Subagent worktrees | Native | Manual git worktree setup |
| MCP server | Yes | Not supported |

## Steps

1. Verify `ARCHITECTURE_AGENT_ROOT` points to the installed pack.
2. Read `AGENTS.md` to confirm skill pack instructions are loaded.
3. Identify the relevant skill by task type (spec, review, qa, commit, etc.).
4. Follow the matching skill's instructions from the `generated/codex/` dir.
5. Check policy requirements before any privileged shell or git action.
6. Commit after each discrete behavior change per the commit skill rules.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
