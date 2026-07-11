# Start Here

This repo is a transition workspace while `agent-harness` and `agent-registry` become the source-of-truth repos.

It currently mixes top-level governance tooling with embedded `agent-architecture` package docs.

If you are new, ignore most markdown at first.

## Fast Path

1. Read [README.md](../README.md)
2. If your goal is repo cleanup or migration, read [REPO_ORGANIZATION.md](REPO_ORGANIZATION.md), then [ARCHITECTURE_SPLIT.md](ARCHITECTURE_SPLIT.md)
3. If your goal is governance, read [GOVERNANCE_AUTOMATION.md](../GOVERNANCE_AUTOMATION.md)
4. If your goal is installing/using agent-architecture, read [INSTALLATION.md](INSTALLATION.md)
5. If your goal is workflow usage, read [WORKFLOWS.md](WORKFLOWS.md)

## What Lives Where

- Root `README.md`: repo overview and navigation
- `docs/REPO_ORGANIZATION.md`: target `agent-registry` and `agent-harness` layout
- `docs/ARCHITECTURE_SPLIT.md`: split boundary between `tstack`, `agent-registry`, and `agent-harness`
- Root `GOVERNANCE_AUTOMATION.md`: actual governance build/check flow
- `docs/INSTALLATION.md`: install and first-run flow
- `docs/WORKFLOWS.md`: common user workflows
- `docs/CONFLUENCE_ENV.md`: Confluence/Jira MCP env files
- `docs/MCP_INTEGRATION.md`: MCP setup only
- `docs/SKILL_INVOCATION.md`: how skills are discovered/invoked
- `docs/VERIFICATION.md`: validation checklist after install

## What To Ignore Initially

You usually do not need these on day one:

- `docs/OPUS47_HANDOFF.md`
- future authoring output under `docs/plans/` or `docs/specs/`
- most deep `agent-architecture/**/README.md`
- generated files under `generated/`

## Canonical Docs

- Governance: [GOVERNANCE_AUTOMATION.md](../GOVERNANCE_AUTOMATION.md)
- Organization: [REPO_ORGANIZATION.md](REPO_ORGANIZATION.md)
- Split: [ARCHITECTURE_SPLIT.md](ARCHITECTURE_SPLIT.md)
- Install: [INSTALLATION.md](INSTALLATION.md)
- Workflows: [WORKFLOWS.md](WORKFLOWS.md)
- Docs map: [DOCS_INDEX.md](DOCS_INDEX.md)
