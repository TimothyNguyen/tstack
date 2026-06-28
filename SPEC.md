# TStack Governance Engine Specification

## Purpose

TStack Governance Engine is a machine-readable governance system that enforces repository standards automatically. It provides three layers of governance:

1. **Policy Document** (REPO_CHANGE_GOVERNANCE_WORKFLOW.md) — Human-readable rules
2. **Machine Specification** (governance-spec.yaml) — Automated validation rules
3. **CLI Tool** (bin/governance.js) — Executable validation engine

## Inputs

- `governance-spec.yaml` — Specification with hard gates, soft gates, maturity levels, scorecard dimensions
- `governance-component-manifest.schema.json` — JSON Schema for component metadata validation
- Component `GOVERNANCE.yaml` files — Per-component metadata and requirements
- Repository structure — Required files and directory layouts
- Git repository — Commit history, dependencies, build outputs

## Outputs

- **Validation Report** — Pass/fail status for hard and soft gates
- **Health Dashboard** — Metrics on documentation, coverage, dependencies
- **Quality Scorecard** — 7-dimension scorecard with ≥8/10 threshold
- **Component Inventory** — Maturity distribution, test coverage, documentation status
- **Exception Report** — Tracked soft gate overrides with expiration dates

## Dependencies

- **Node.js 18+** — Runtime for CLI tool
- **js-yaml ^4.1.0** — YAML parsing for governance-spec.yaml
- **git** — Repository analysis (built-in)
- **npm** — Package management

## Failure Modes

1. **Hard Gate Failure** — Build fails, tests fail, circular dependency detected
   - Action: Block commit/PR merge, no override allowed
   - Resolution: Fix underlying issue and revalidate

2. **Soft Gate Violation** — Coverage <80%, README <200 words
   - Action: Warn, allow documented override
   - Resolution: Fix issue OR document exception with tracking issue + expiration

3. **Scorecard Below Threshold** — Any dimension <8/10
   - Action: Require staff SWE approval for merge
   - Resolution: Improve dimension score OR approve for non-standard reasons

4. **Component Not Registered** — Component missing from registry, orphaned
   - Action: Hard gate failure
   - Resolution: Register component in appropriate registry

## Performance

- **Validation Time** — <1 second for typical repository
- **Memory Usage** — <50MB for repositories up to 1000 components
- **Scalability** — Linear with number of components
- **Health Dashboard** — Generated in <2 seconds

## Security

- No external network calls required
- All validation local to repository
- No credentials or secrets required
- Safe to run in CI/CD pipelines
- Read-only access to repository structure

## Extension Points

1. **Custom Hard Gates** — Add in `validateHardGate()` method in bin/governance.js
2. **Custom Soft Gates** — Add in `validateSoftGate()` method in bin/governance.js
3. **Custom Metrics** — Extend `generateScorecard()` with new dimensions
4. **Custom Validation** — Add checks in `validateComponentStructure()` method
5. **Custom Maturity Levels** — Define in governance-spec.yaml

## Integration

### Pre-Commit Hook
```bash
npm run governance:check:hard
```

### CI/CD (GitHub Actions)
```yaml
- name: Governance Check
  run: npm run governance:check
```

### Agent-Based
```
@governance-agent review this work
```

## Versioning

Governance Engine follows semantic versioning:
- **v1.0** — Initial release with hard gates, soft gates, scorecard
- **v1.1** (planned) — Custom rules, extended metrics
- **v2.0** (future) — Multi-language support, cloud integrations
