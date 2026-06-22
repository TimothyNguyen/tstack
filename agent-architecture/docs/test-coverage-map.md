# Test Coverage Map

This map translates useful `gstack/test` coverage patterns into
`agent-architecture/` tests.

The goal is not to copy every gstack test. The goal is to carry over the test
classes that protect this package's behavior: gstack-style skill templates,
safe defaults, installability in other repos, host portability, and automation
support.

## Coverage Status

| gstack test family | What it protects | Architecture-agent equivalent | Status |
|---|---|---|---|
| `gen-skill-docs*` | Generated skills are fresh, placeholders resolve, templates produce outputs. | `tests/skill-generation.test.mjs` | Done |
| `discover-section-templates`, `section-manifest-consistency` | Carved sections are discoverable, PASSIVE contract, orphan detection, id uniqueness. | `tests/section-manifest.test.mjs` | Done |
| `skill-coverage-floor` | Skill body non-trivial, description within size cap. | `tests/skill-structure.test.mjs` | Done |
| `test-free-shards` | Free test discovery, sharding, and Windows-safe curation. | `tests/test-free-shards.test.mjs` | Done |
| `telemetry-repo-strip`, `document-skills-redaction`, `secret-sink-harness` | Secrets and telemetry do not leak. | Policy contract + forbidden-string checks in `tests/skill-generation.test.mjs` | Done |
| `setup-*`, `uninstall`, `upgrade-*` | Install, upgrade, migration, and cleanup safety. | `tests/install-contract.test.mjs` | Done |
| `enterprise-policy` | Policy file has correct defaults, egress disabled, repo-local install. | `tests/policy-contract.test.mjs` | Done |
| `skill-catalog-integrity` | Catalog lists every skill folder; no orphans. | `tests/skill-catalog.test.mjs` | Done |
| `codebase-engine-contract` | Package name, entry points, brand rename, enterprise egress stubs, skill co-location. | `tests/codebase-engine.test.mjs` | Done |
| `adapter-registry` | Optional adapters are registered, default-deny, and point to real skills/modules. | `tests/adapter-registry.test.mjs` | Done |
| `profile-contract` | Profiles reference existing skills and optional modules while preserving privacy-disabled defaults. | `tests/profile-contract.test.mjs` | Done |
| `mcp-manifest` | MCP tools stay read-only, closed-world, no secrets, and no default egress. | `tests/mcp-manifest.test.mjs` | Done |
| `install-dry-run` | Installer write plan stays repo-local and contains no secret-like fields. | `tests/install-dry-run.test.mjs` | Done |
| `audit-writer` | Audit events are local JSONL and redacted. | `tests/audit-writer.test.mjs` | Done |
| `event-contract` | AG-UI-compatible event envelopes redact sensitive payload fields. | `tests/event-contract.test.mjs` | Done |
| `host-config` | Hosts are declarative, validated, unique, and safe. | `tests/host-registry.test.mjs` | Done |
| `template-context-parity`, `parity-suite` | Generated outputs are consistent across targets. | Host parity tests after Claude/Codex/Copilot/ADK generation exists. | Deferred |

## Defer

| gstack test family | Reason to defer |
|---|---|
| `skill-e2e-*` | Requires agent harness and model calls; add after host adapters exist. |
| `llm-judge*`, `redact-semantic-pass.eval` | Paid/model-dependent; not part of local default. |
| `gbrain-*` | Replace with CodeGraph/internal codebase-understanding adapter tests later. |
| `ios-*`, browser daemon tests | Mobile and browser daemon are excluded or optional. |
| `telemetry*`, Supabase tests | Public telemetry is dropped by default. |

## Required Local Test Classes

The local suite should cover:

1. Every `SKILL.md.tmpl` has a generated `SKILL.md`.
2. Every generated skill has valid frontmatter with `name`, `version`, and `description`.
3. No generated skill contains unresolved `{{PLACEHOLDER}}` tokens.
4. Every `sections/manifest.json` references files that exist.
5. Every `sections/*.md.tmpl` has generated `sections/*.md`.
6. No generated skill or doc reintroduces public telemetry, public update checks,
   ngrok, cookie import, mobile/iOS workflows, or public scraping as defaults.
7. The default policy denies sensitive capabilities.
8. The install spec names repo-local install and safe defaults.
9. Test discovery can list local tests and curate Windows-fragile tests.
10. Future host configs validate names, paths, generated outputs, and duplicate
    detection.

## Near-Term Test Work

- Add host parity tests once Claude/Codex/Copilot/ADK adapters generate output.
- Add E2E skill invocation tests once the agent harness is wired.

These require implementation work before tests can be written.
