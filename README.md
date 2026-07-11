# TStack

This repo is now a transition workspace. The cleaner product shape lives across sibling repos:

- `agent-harness` currently in `tstack-harness`: runtime, workflow execution, governance gates, observability
- `agent-registry` currently in `tregistry`: definitions, contracts, discovery, catalog/control plane
- `tstack`: legacy governance tooling plus embedded `agent-architecture` content while migration finishes

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
- `agent-architecture/` embedded package, examples, and package-specific docs

## Split Direction

```text
Harness runs Workflows.
Workflows load Skills.
Skills use Adapters.
Governance validates every step.
Observability records every step.
```

Runtime work belongs in `agent-harness`. Reusable skills, workflows, stacks, adapters, tool providers, domains, profiles, and agent roles belong in `agent-registry`. This repo should shrink until it can become archive or umbrella docs.

## Canonical Docs

- [docs/ARCHITECTURE_SPLIT.md](docs/ARCHITECTURE_SPLIT.md): source of truth for repo cleanup and migration
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
