---
name: stack-postgres
version: 0.1.0
description: |
  Postgres schema, query, migration, performance, and data-governance workflows
  with explicit read/write approvals and privacy-safe summaries.
---

## Enterprise Preamble

- Stay inside the current project unless the user explicitly names another path.
- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.
- Use policy-gated tools only when the active profile allows them.
- Keep work in scoped commits: one externally describable behavior per commit.

# Postgres Stack

Use for Postgres schema, SQL, migrations, query performance, and data
governance.

## References

- `dimitri/pgloader`: optional local migration experiment reference.

## Workflow

- Inventory migrations, schemas, extensions, functions, roles, and application
  query paths from local files first.
- Require approval for live database reads and writes.
- Summarize query results; do not expose raw private rows.
- Require rollback and verification for schema changes.
- Use `stack-sqlserver-to-postgres` for cross-database migration work.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
