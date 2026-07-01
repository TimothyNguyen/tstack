# TStack

This repo is currently two things in one:

- governance tooling for this repository
- an embedded `agent-architecture` package with its own large doc surface

That makes first contact confusing. Use this file as entrypoint, not as full reference.

## Start

- New here: [docs/START_HERE.md](docs/START_HERE.md)
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

## Canonical Docs

- [GOVERNANCE_AUTOMATION.md](GOVERNANCE_AUTOMATION.md): source of truth for governance automation
- [docs/INSTALLATION.md](docs/INSTALLATION.md): install and first run
- [docs/WORKFLOWS.md](docs/WORKFLOWS.md): common user flows
- [docs/MCP_INTEGRATION.md](docs/MCP_INTEGRATION.md): MCP-only setup
- [docs/SKILL_INVOCATION.md](docs/SKILL_INVOCATION.md): skill routing and invocation
- [docs/VERIFICATION.md](docs/VERIFICATION.md): post-install verification

## Legacy Docs

These still exist for compatibility, but they are no longer best starting points:

- `GOVERNANCE_ENGINE_INSTALL.md`
- `GOVERNANCE_QUICK_REF.md`
- `REPO_CHANGE_GOVERNANCE_WORKFLOW.md`
- `docs/OPUS47_HANDOFF.md`
