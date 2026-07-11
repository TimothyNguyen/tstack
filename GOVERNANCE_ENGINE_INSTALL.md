# Governance Engine Install

This file used to be a long install playbook. It is now a compatibility pointer.

## Canonical Docs

- Start here: [README.md](README.md)
- Repo split: [docs/ARCHITECTURE_SPLIT.md](docs/ARCHITECTURE_SPLIT.md)
- Governance source of truth: [GOVERNANCE_AUTOMATION.md](GOVERNANCE_AUTOMATION.md)
- Full docs map: [docs/DOCS_INDEX.md](docs/DOCS_INDEX.md)
- User onboarding path: [docs/START_HERE.md](docs/START_HERE.md)

## Minimal Setup

```bash
npm install
npm run governance:build
npm run governance:check
```

## What This Repo Actually Uses

- `scripts/governance-lib.js` for discovery and validation
- `scripts/build-governance.js` for generated inventory
- `scripts/check-governance.js` for consistency checks
- `bin/governance.js` for CLI access

## If You Are Installing Agent-Architecture

Use [docs/INSTALLATION.md](docs/INSTALLATION.md), not this file.
