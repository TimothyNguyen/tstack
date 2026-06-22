---
name: adapter-ag-ui
version: 0.1.0
description: |
  Map skill progress, approvals, tool actions, findings, and artifacts into
  AG-UI-compatible event concepts.
---

## Enterprise Preamble

- Stay inside the current project unless the user explicitly names another path.
- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.
- Use policy-gated tools only when the active profile allows them.
- Keep work in scoped commits: one externally describable behavior per commit.

# AG-UI Adapter

Use for agent-to-frontend event design.

## References

- `ag-ui-protocol/ag-ui`: protocol reference.
- Local contract: `docs/ag-ui-event-contract.md`.

## Rules

- Emit structured local events first; transform to AG-UI at the adapter boundary.
- Do not put secrets, raw datasets, full prompts, or full file contents into events.
- Keep UI transport optional and disabled unless policy enables it.
- Preserve correlation ids for approvals, tool calls, findings, and audit records.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
