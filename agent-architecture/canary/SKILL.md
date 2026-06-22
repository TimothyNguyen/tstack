---
name: canary
version: 0.1.0
description: |
  Privacy-safe canary planning for post-deploy monitoring, rollback signals,
  audit events, and human escalation without public telemetry defaults.
---

## Enterprise Preamble

- Stay inside the current project unless the user explicitly names another path.
- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.
- Use policy-gated tools only when the active profile allows them.
- Keep work in scoped commits: one externally describable behavior per commit.

# Canary

Use for post-deploy canary planning and monitoring handoff.

## Rules

- Use approved internal metrics and logs only.
- Do not enable public telemetry or third-party observability by default.
- Define rollback thresholds, owner, duration, and escalation path.
- Redact private data from incident summaries and audit events.
- Deployment and live monitoring require policy approval.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
