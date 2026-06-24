---
name: copilot
version: 0.1.0
description: |
  GitHub Copilot host adapter. Covers how to install this skill pack into a
  Copilot-enabled repo: copilot-instructions.md injection, hook configuration,
  tool availability, environment variables, and enterprise-safe defaults.
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

# Copilot Host Adapter

Use this adapter when this skill pack runs inside GitHub Copilot (VS Code,
GitHub.com, or Copilot Workspace).

## How Skills Work in Copilot

Copilot does not support `/skill-name` slash invocation from Claude Code.
Skills are activated by referencing their purpose in the task description or
via `.github/copilot-instructions.md`:

```
# Use the spec skill
Run the spec workflow on the following requirement: ...

# Use the review skill
Review the diff in PR #42 using the review skill.
```

The generated instructions file for Copilot lives at:

```
.architecture-agent/generated/copilot/copilot-instructions.md
```

Install by copying (or symlinking) it to the repo's Copilot instructions file:

```bash
cp .architecture-agent/generated/copilot/copilot-instructions.md \
   .github/copilot-instructions.md
```

Or merge its contents into an existing `.github/copilot-instructions.md`.

## Hook Configuration

The `seniorswe-concise` adapter ships a Copilot-compatible hook config at:

```
.architecture-agent/adapters/seniorswe-concise/hooks/copilot-hooks.json
```

Install into VS Code settings (`.vscode/settings.json`):

```json
{
  "github.copilot.advanced": {
    "hooksConfig": ".architecture-agent/adapters/seniorswe-concise/hooks/copilot-hooks.json"
  }
}
```

Hook schema (Copilot v1, camelCase events):

| Event | Hook | Purpose |
|-------|------|---------|
| `sessionStart` | `seniorswe-concise-activate.cjs` | Load saved mode on session open |
| `userPromptSubmitted` | `seniorswe-concise-mode-tracker.cjs` | Track mode switches per prompt |

## Tool Availability in Copilot

| Tool | Available | Notes |
|------|-----------|-------|
| Terminal (Bash/PowerShell) | Yes | Via VS Code integrated terminal |
| File read/write | Yes | Within repo sandbox |
| Network | Policy-gated | Org Copilot policy controls egress |
| Git | Yes | Local only, no push without explicit approval |
| MCP server | Policy-gated | Requires org-level MCP approval |

## Environment Variables

The seniorswe-concise adapter reads these in Copilot:

| Variable | Purpose |
|----------|---------|
| `COPILOT_PLUGIN_DATA` | State directory for mode persistence (Copilot-specific) |
| `PLUGIN_DATA` | Fallback state directory |
| `SENIORSWE_CONCISE_DEFAULT_MODE` | Default concise mode (lite/full/ultra) |
| `ARCHITECTURE_AGENT_ROOT` | Root of the installed skill pack |

Set these in `.vscode/settings.json` or a `.env` file loaded by the workspace.

## Copilot Limitations vs. Claude Code

| Capability | Claude Code | Copilot Chat |
|---|---|---|
| Slash command skill routing | Native | Not supported — use copilot-instructions.md |
| Persistent hook state | Via Claude hooks | Via `COPILOT_PLUGIN_DATA` + shell |
| Subagent worktrees | Native | Manual git worktree setup |
| MCP server | Yes | Policy-gated, org approval required |
| In-session tool execution | Full | Limited to Copilot tool set |

## Steps

1. Verify `ARCHITECTURE_AGENT_ROOT` points to the installed pack.
2. Check `.github/copilot-instructions.md` is in place and loaded.
3. Identify the relevant skill by task type (spec, review, qa, commit, etc.).
4. Follow the matching skill's instructions from the `generated/copilot/` dir.
5. Run code-graph queries or file searches from the terminal; paste results into chat.
6. Check policy requirements before any privileged shell or git action.
7. Commit after each discrete behavior change per the commit skill rules.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
