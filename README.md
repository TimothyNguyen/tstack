# TStack - Repository Governance Engine

TStack is a comprehensive repository governance system that enforces standards across skills, adapters, agents, and MCPs through machine-readable specifications and automated validation.

## Overview

This repository implements a three-layer governance system:

1. **REPO_CHANGE_GOVERNANCE_WORKFLOW.md** — Policy document with governance phases
2. **governance-spec.yaml** — Machine-readable specification with gates and requirements
3. **bin/governance.js** — CLI tool for validation and reporting

## Core Concepts

### Hard Gates (Must Pass)
- Build succeeds
- All tests pass
- No circular dependencies
- No orphaned components
- Required files exist
- SPEC.md complete
- No template artifacts

### Soft Gates (Should Pass)
- Code coverage ≥80%
- README.md ≥200 words
- Complete documentation
- Changelog exists

### Maturity Levels
- Draft: 0 days, relaxed governance
- Experimental: 90 days, relaxed governance
- Beta: Normal governance
- Stable: Strict (90%+ coverage)
- Deprecated: Maintenance mode
- Archived: Read-only

## Installation

See [GOVERNANCE_ENGINE_INSTALL.md](GOVERNANCE_ENGINE_INSTALL.md) for complete installation instructions.

Quick start:
```bash
npm install
npm run governance:check
```

## Commands

- `npm run governance:check` — Run all checks (hard + soft gates)
- `npm run governance:check:hard` — Hard gates only (required)
- `npm run governance:check:soft` — Soft gates only (warnings)
- `npm run governance:health` — Generate health report
- `npm run governance:validate` — Validate repository structure
- `npm run governance:report` — Generate quality scorecard

## Documentation

- [GOVERNANCE_ENGINE_INSTALL.md](GOVERNANCE_ENGINE_INSTALL.md) — Installation & configuration
- [REPO_CHANGE_GOVERNANCE_WORKFLOW.md](REPO_CHANGE_GOVERNANCE_WORKFLOW.md) — Policy document
- [governance-spec.yaml](governance-spec.yaml) — Machine-readable specification
- [agents/governance/SKILL.md](agents/governance/SKILL.md) — Governance Agent documentation
- [GOVERNANCE_EXCEPTIONS.md](GOVERNANCE_EXCEPTIONS.md) — Documented exceptions & overrides

## Next Steps

1. Read GOVERNANCE_ENGINE_INSTALL.md for full setup
2. Create GOVERNANCE.yaml for each component
3. Run governance:check to validate
4. Fix hard gate failures (no override)
5. Document soft gate exceptions if needed
