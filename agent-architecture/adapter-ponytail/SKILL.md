---
name: adapter-ponytail
version: 0.1.0
description: |
  Optional Ponytail hook and MCP adapter for YAGNI mode injection across
  Claude, Codex, Copilot, and MCP hosts.
---

## Enterprise Preamble

- Stay inside the current project unless the user explicitly names another path.
- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.
- Use policy-gated tools only when the active profile allows them.
- Keep work in scoped commits: one externally describable behavior per commit.

# Ponytail Adapter

Use when installing, testing, or modifying Ponytail hook/MCP integration.

## Runtime

- Hook code lives in `adapters/ponytail/hooks`.
- MCP code lives in `adapters/ponytail/mcp`.
- State defaults to `.architecture-agent/state/ponytail`.
- Config defaults to `.architecture-agent/ponytail/config.json`.

## Rules

- Keep Ponytail adapter optional; core skills remain plain Markdown.
- Do not mutate global host config unless the user/admin explicitly chooses that install target.
- Keep the MCP server closed-world and instruction-only.
- Run `npm test -- tests/ponytail-adapter.test.mjs` after changes.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
