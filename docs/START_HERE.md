# Start Here

This repo is the TStack governance workspace plus the `agent-pack` authoring package.

`agent-pack/` owns authored skills, agents, workflows, stacks, domains, adapters, and tool-provider definitions. Governance scripts validate and export those definitions.

If you are new, ignore most markdown at first.

## Fast Path

1. Read [README.md](../README.md)
2. If your goal is repo layout or split boundaries, read [REPO_ORGANIZATION.md](REPO_ORGANIZATION.md), then [ARCHITECTURE_SPLIT.md](ARCHITECTURE_SPLIT.md), then [PLATFORM_BLUEPRINT.md](PLATFORM_BLUEPRINT.md)
3. If your goal is governance, read [GOVERNANCE_AUTOMATION.md](../GOVERNANCE_AUTOMATION.md)
4. If your goal is installing/using agent-pack, read [INSTALLATION.md](INSTALLATION.md)
5. If your goal is workflow usage, read [WORKFLOWS.md](WORKFLOWS.md)
6. If your goal is roadmap planning, read [NEXT_STEPS.md](NEXT_STEPS.md)

## What Lives Where

- Root `README.md`: repo overview and navigation
- `docs/REPO_ORGANIZATION.md`: `agent-pack`, `agent-registry`, and `agent-harness` layout
- `docs/ARCHITECTURE_SPLIT.md`: split boundary between `tstack`, `agent-registry`, and `agent-harness`
- `docs/PLATFORM_BLUEPRINT.md`: deeper target architecture, contracts, repo split, and migration plan
- `docs/NEXT_STEPS.md`: next-step roadmap for registry, harness, loops, and evals
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
- most deep `agent-pack/**/README.md`
- generated files under `generated/`

## Canonical Docs

- Governance: [GOVERNANCE_AUTOMATION.md](../GOVERNANCE_AUTOMATION.md)
- Organization: [REPO_ORGANIZATION.md](REPO_ORGANIZATION.md)
- Split: [ARCHITECTURE_SPLIT.md](ARCHITECTURE_SPLIT.md)
- Platform Blueprint: [PLATFORM_BLUEPRINT.md](PLATFORM_BLUEPRINT.md)
- Install: [INSTALLATION.md](INSTALLATION.md)
- Workflows: [WORKFLOWS.md](WORKFLOWS.md)
- Next Steps: [NEXT_STEPS.md](NEXT_STEPS.md)
- Docs map: [DOCS_INDEX.md](DOCS_INDEX.md)
