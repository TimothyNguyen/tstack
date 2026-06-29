---
name: tstack
type: repository
description: TStack - Repository governance engine with automated enforcement
version: "1.0.0"
---

# TStack Repository

Governance engine for automating repository standards enforcement. Includes machine-readable specifications, CLI tools, and integration with CI/CD pipelines.

## What's Included

- **governance-spec.yaml** — Machine-readable specification
- **bin/governance.js** — CLI validation tool
- **agents/governance/SKILL.md** — Governance Agent
- **GOVERNANCE_ENGINE_INSTALL.md** — Installation guide
- **REPO_CHANGE_GOVERNANCE_WORKFLOW.md** — Policy document

## Key Features

✓ Hard gates (no override, must pass)
✓ Soft gates (warn, documented override allowed)
✓ Maturity levels (Draft → Stable → Deprecated)
✓ Component registration validation
✓ Dependency cycle detection
✓ Code duplication detection
✓ Quality scorecard (7 dimensions, ≥8/10)
✓ Health dashboard with metrics
✓ Escape hatch system (documented exceptions)
✓ Pre-commit hook integration
✓ GitHub Actions CI/CD integration
✓ Agent-based enforcement

## Quick Start

```bash
# Install
npm install

# Validate locally
npm run governance:check

# View health
npm run governance:health

# View scorecard
npm run governance:report
```

## Documentation

- [GOVERNANCE_ENGINE_INSTALL.md](GOVERNANCE_ENGINE_INSTALL.md)
- [REPO_CHANGE_GOVERNANCE_WORKFLOW.md](REPO_CHANGE_GOVERNANCE_WORKFLOW.md)
- [README.md](README.md)
- [SPEC.md](SPEC.md)
