# Test Coverage Map

This map translates useful `gstack/test` coverage patterns into
`agent-architecture/` tests.

The goal is not to copy every gstack test. The goal is to carry over the test
classes that protect this package's behavior: gstack-style skill templates,
safe defaults, installability in other repos, host portability, and automation
support.

## Carry Over Now

| gstack test family | What it protects | Architecture-agent equivalent |
|---|---|---|
| `gen-skill-docs*` | Generated skills are fresh, placeholders resolve, templates produce outputs. | `tests/skill-generation.test.mjs` |
| `discover-section-templates`, `section-manifest-consistency` | Carved sections are discoverable and manifest references are valid. | Section manifest tests for `*/sections/manifest.json`. |
| `skill-parser`, `skill-validation` | Skill Markdown has valid frontmatter and expected shape. | Frontmatter and required-field tests for every generated `SKILL.md`. |
| `host-config` | Hosts are declarative, validated, unique, and safe. | Future `tests/host-config.test.mjs` after host configs are added. |
| `test-free-shards` | Free test discovery, sharding, and Windows-safe curation. | `scripts/test-free-shards.mjs` plus tests around discovery output. |
| `telemetry-repo-strip`, `document-skills-redaction`, `secret-sink-harness` | Secrets and telemetry do not leak. | Forbidden-string and policy tests over generated skills/docs. |
| `setup-*`, `uninstall`, `upgrade-*` | Install, upgrade, migration, and cleanup safety. | Install spec tests now; installer tests when implementation exists. |
| `template-context-parity`, `parity-suite` | Generated outputs are consistent across targets. | Host parity tests after Claude/Codex/Copilot/ADK generation exists. |

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

- Expand `tests/skill-generation.test.mjs` with dynamic template discovery.
- Add section manifest consistency checks.
- Add forbidden default string checks.
- Add frontmatter required-field checks.
- Add test-free-shards smoke checks.

These are high signal and run without external services.
