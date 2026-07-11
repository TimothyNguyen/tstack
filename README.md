# TStack

This repo is the TStack governance workspace plus the `agent-pack` authoring package.

- `agent-harness` currently in `tstack-harness`: runtime, workflow execution, governance gates, observability
- `agent-registry` currently in `tregistry`: definitions, contracts, discovery, catalog/control plane
- `agent-pack/`: authored skills, agents, workflows, stacks, domains, adapters, and tool providers

Use this file as entrypoint, not as full reference.

## Start

- New here: [docs/START_HERE.md](docs/START_HERE.md)
- Need target repo layout: [docs/REPO_ORGANIZATION.md](docs/REPO_ORGANIZATION.md)
- Need repo split map: [docs/ARCHITECTURE_SPLIT.md](docs/ARCHITECTURE_SPLIT.md)
- Need Confluence env files: [docs/CONFLUENCE_ENV.md](docs/CONFLUENCE_ENV.md)
- Need full doc map: [docs/DOCS_INDEX.md](docs/DOCS_INDEX.md)
- Need governance flow: [GOVERNANCE_AUTOMATION.md](GOVERNANCE_AUTOMATION.md)
- Need install flow: [docs/INSTALLATION.md](docs/INSTALLATION.md)
- Need workflow examples: [docs/WORKFLOWS.md](docs/WORKFLOWS.md)

## Governance Commands

```bash
npm install
npm run governance:build
npm run governance:check
```

Useful commands:

- `npm run governance:build` rebuilds component inventory
- `npm run governance:check` validates repo and generated governance artifacts
- `npm run governance:health` prints current inventory counts
- `npm run governance:report` prints grouped component report

## Repo Shape

- `bin/` CLI entrypoints
- `scripts/` maintained governance scripts
- `generated/` generated governance inventory
- `docs/` human navigation docs
- `agents/` top-level governance agent
- `agent-pack/` authored agent-pack content plus package-specific docs

## Split Direction

```text
Harness runs Workflows.
Workflows load Skills.
Skills use Adapters.
Governance validates every step.
Observability records every step.
```

Runtime work belongs in `agent-harness`. Reusable skills, workflows, stacks, adapters, tool providers, domains, profiles, and agent roles are authored in `agent-pack/` and exported for `agent-registry`.

## Canonical Docs

- [docs/ARCHITECTURE_SPLIT.md](docs/ARCHITECTURE_SPLIT.md): source of truth for package, registry, and harness boundaries
- [docs/REPO_ORGANIZATION.md](docs/REPO_ORGANIZATION.md): target repo layout and consumption contract
- [GOVERNANCE_AUTOMATION.md](GOVERNANCE_AUTOMATION.md): source of truth for governance automation
- [docs/INSTALLATION.md](docs/INSTALLATION.md): install and first run
- [docs/WORKFLOWS.md](docs/WORKFLOWS.md): common user flows
- [docs/MCP_INTEGRATION.md](docs/MCP_INTEGRATION.md): MCP-only setup
- [docs/CONFLUENCE_ENV.md](docs/CONFLUENCE_ENV.md): Confluence/Jira MCP env files
- [docs/SKILL_INVOCATION.md](docs/SKILL_INVOCATION.md): skill routing and invocation
- [docs/VERIFICATION.md](docs/VERIFICATION.md): post-install verification

## Legacy Docs

These still exist for compatibility, but they are no longer best starting points:

- `GOVERNANCE_ENGINE_INSTALL.md`
- `GOVERNANCE_QUICK_REF.md`
- `REPO_CHANGE_GOVERNANCE_WORKFLOW.md`
- `docs/OPUS47_HANDOFF.md`
