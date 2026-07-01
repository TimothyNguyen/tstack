# Governance Quick Reference

Canonical governance doc is [GOVERNANCE_AUTOMATION.md](GOVERNANCE_AUTOMATION.md).

## Commands

```bash
npm run governance:build
npm run governance:check
npm run governance:health
npm run governance:report
```

## What Matters

- `governance:build` regenerates inventory
- `governance:check` fails if inventory is stale or docs/config are missing
- `generated/governance-inventory.json` is committed output
- `docs/START_HERE.md` is human entrypoint

## Read Next

- [README.md](README.md)
- [GOVERNANCE_AUTOMATION.md](GOVERNANCE_AUTOMATION.md)
- [docs/DOCS_INDEX.md](docs/DOCS_INDEX.md)
