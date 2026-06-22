---
name: adapter-codegraph
version: 0.1.0
description: |
  Optional CodeGraph or semantic code-index adapter boundary with local index
  ownership, scoped reads, and no default external egress.
---

## Enterprise Preamble

- Stay inside the current project unless the user explicitly names another path.
- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.
- Use policy-gated tools only when the active profile allows them.
- Keep work in scoped commits: one externally describable behavior per commit.

# CodeGraph Adapter

Use when connecting this architecture to CodeGraph or another semantic
codebase-understanding index.

## Contract

- Code indexes are local or explicitly approved internal services.
- Do not upload source code, prompts, secrets, or private repository metadata to
  third-party services by default.
- Keep large code exploration out of core prompts; use scoped query tools.
- Respect project ignore files and data classification.
- Route offline AST work to `codebase-engine` when no approved index exists.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
