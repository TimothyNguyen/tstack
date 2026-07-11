# Changelog

All notable changes to TStack Governance Engine are documented in this file.

## [1.1.0] - 2026-07-11

### Changed
- Renamed the agent definition package and plugin identity from `agent-architecture` to `agent-pack`.
- Moved the consumer plugin boundary to `agent-architecture/plugins/agent-pack`.
- Reorganized agent definitions into top-level `agents`, `adapters`, `skills`, `stacks`, `domains`, and `tool-providers` buckets for agent-registry and agent-harness consumption.

### Fixed
- Export stack-embedded `.agent.md` files as agent resources instead of stack resources.
- Added the missing `drawio-mcp-python` tool-provider skill template and generated registry artifacts.

## [1.0.0] - 2026-06-27

### Added
- Machine-readable governance specification (governance-spec.yaml)
- CLI validation tool (bin/governance.js) with 6 commands
- Component manifest schema (governance-component-manifest.schema.json)
- Governance Agent (agents/governance/SKILL.md) for automatic enforcement
- Hard gates: Build, tests, dependencies, documentation, no artifacts
- Soft gates: Coverage, README length, completeness, changelog
- Maturity levels: Draft, Experimental, Beta, Stable, Deprecated, Archived
- Health dashboard with metrics (components, coverage, dependencies)
- Quality scorecard with 7 dimensions (Architecture, Documentation, Testing, etc.)
- Pre-commit hook integration
- GitHub Actions CI/CD integration example
- Escape hatch system for documented exceptions
- Installation guide (GOVERNANCE_ENGINE_INSTALL.md)
- Policy document (REPO_CHANGE_GOVERNANCE_WORKFLOW.md)
- Component registration validation
- Dependency cycle detection
- Code duplication detection (>80%)
- Orphaned component detection

### Features
- ✓ No override for hard gates (must fix)
- ✓ Documented override for soft gates (with issue + expiration)
- ✓ Scorecard threshold enforcement (≥8/10 all dimensions)
- ✓ Proportionate governance by maturity level
- ✓ Machine-readable validation rules
- ✓ Color-coded CLI output
- ✓ Extensible architecture

## Future Releases

### [1.1.0] - Planned
- Custom validation rules
- Extended metrics
- Performance profiling
- Advanced dependency analysis

### [2.0.0] - Future
- Multi-language support
- Cloud integrations
- Advanced reporting
- Web dashboard
