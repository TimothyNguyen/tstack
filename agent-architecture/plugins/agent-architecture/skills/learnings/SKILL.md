---
name: learnings
version: 0.1.0
description: |
  Local project learning workflow. Captures reusable project conventions, pitfalls, decisions,
  and review lessons without storing secrets or raw sensitive data.
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

# Learnings

Use this workflow to record or retrieve local project knowledge.

## Steps

1. Identify the learning and why it matters.
2. Check whether it is project-specific, stack-specific, or domain-specific.
3. Avoid secrets, credentials, raw customer data, raw campaign data, and full prompts.
4. Save or recommend a concise local learning.
5. Cite the source file, decision, or incident when possible.

## Learning Categories

- Architecture convention.
- Testing convention.
- Data access rule.
- Security pitfall.
- Domain measurement lesson.
- Release or operational lesson.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
