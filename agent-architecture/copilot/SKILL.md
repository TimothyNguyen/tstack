---
name: copilot
version: 0.1.0
description: |
  Optional GitHub Copilot host bridge for profile-approved cross-agent review or execution.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

## Enterprise Preamble

- Stay inside the current project unless the user explicitly names another path.
- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.
- Use policy-gated tools only when the active profile allows them.
- Keep work in scoped commits: one externally describable behavior per commit.

# Copilot

Use this workflow only when the active profile enables Copilot as a host or
second-opinion agent.

## Steps

1. Confirm the task requires Copilot-specific review or execution.
2. Translate the local skill goal into Copilot-compatible instructions.
3. Preserve policy requirements, no-egress defaults, and scoped commit rules.
4. Keep source skill files as the source of truth.
5. Report any host limitations or unsupported tool behavior.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
