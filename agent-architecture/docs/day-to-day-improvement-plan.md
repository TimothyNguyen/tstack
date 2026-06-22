# Day-To-Day Improvement Plan

This plan tracks what must improve before `agent-architecture/` can replace
upstream `garrytan/gstack` for daily development.

## Current Assessment

`agent-architecture/` is stronger than upstream gstack for enterprise-safe
defaults, policy boundaries, local auditability, and optional stack/domain
packs. It is not yet as useful for daily development because gstack already has
a complete operational loop: install, skill routing, browser QA, review, ship,
upgrade, memory, and real-world command ergonomics.

Use upstream gstack today when speed and complete workflows matter. Use
`agent-architecture/` when privacy, no-default-egress, policy gates, and
company-safe install boundaries matter more.

## What Is Good

| Area | Strength |
|---|---|
| Safety posture | Default policy denies public egress, telemetry, public tunnels, cookie import, credential reads, and browser writes. |
| Skill coverage | Core workflows exist for spec, planning, review, QA, tests, security, docs, release, retros, codebase understanding, and stack/domain packs. |
| Test coverage | Local suite passed `258/258` tests and covers skill generation, policy, adapter registry, audit redaction, profiles, MCP manifests, and codebase-engine contracts. |
| Enterprise fit | Migration inventory explicitly keeps useful gstack patterns while dropping public telemetry, update checks, ngrok, cookie import, public scraping, and iOS/mobile workflows. |
| Extensibility | Host registry, adapter registry, profiles, policies, and skill templates provide clean extension boundaries. |

## What Is Bad

| Area | Gap |
|---|---|
| Installer | `docs/install-spec.md` still defines a dry-run contract; no write-capable repo-local installer is implemented. |
| Daily command loop | No concise "think -> plan -> build -> review -> test -> ship" user path equivalent to gstack's sprint flow. |
| Browser QA | Browser automation is disabled/deferred. No local replacement for gstack `/browse`, `/qa`, screenshots, console/network checks, or handoff. |
| Operational runtime | Skills are mostly instructions and templates, not an integrated runtime with install, invoke, verify, and release behavior. |
| Surface area | Many optional packs exist before the default core experience is tight. This makes first-use harder. |
| Repository noise | Generated outputs and vendored reference packs increase repo size and can distract from core package work. |
| Upgrade story | Offline/internal upgrade policy exists, but no complete upgrade command path is implemented. |
| Host parity | Host registry exists, but generated host artifacts and parity tests are still deferred. |

## Required Improvements

### P0: Make It Installable

Build a write-capable installer:

```text
architecture-agent install --repo <path> --host codex --profile privacy-default
architecture-agent install --repo <path> --host claude --profile enterprise-modernization
architecture-agent uninstall --repo <path>
architecture-agent doctor --repo <path>
```

Acceptance criteria:

- Writes only declared repo-local paths by default.
- Creates `.architecture-agent/install-manifest.json`.
- Generates host artifacts for Codex, Claude, and Copilot.
- Runs `npm run check:skills` before reporting success.
- Refuses paths outside repo or approved user directory.
- Has tests for install, uninstall, idempotency, and path containment.

### P0: Define Daily Core

Ship a small default command set:

| Command | Purpose |
|---|---|
| `spec` | Turn intent into executable requirements. |
| `plan-review` | Check plan quality before edits. |
| `investigate` | Debug with evidence before fixes. |
| `review` | Review local diff before commit. |
| `test` | Run approved local tests and record results. |
| `qa` | Verify behavior with local test/browser tools when enabled. |
| `security-review` | Check security, data, and tool risk. |
| `ship` | Prepare PR/release handoff after tests pass. |
| `learnings` | Save local project conventions safely. |

Acceptance criteria:

- README has "Daily Development Flow" with exact commands.
- Root skill router maps common natural-language requests to these commands.
- Optional packs do not appear in default quick start unless profile enables them.

### P0: Add Local Codebase Understanding Path

Make `codebase-engine` first-class:

```text
codebase-engine init --repo <path>
codebase-engine index --repo <path>
codebase-engine query "where is auth implemented?"
codebase-engine affected --path src/foo.ts
```

Acceptance criteria:

- One install command for Python package.
- One index command creates declared local output only.
- No network needed for AST graph operations.
- Skill instructions tell agents when to use it instead of grep.
- Tests cover CLI smoke paths on Windows.

### P1: Add Optional Local Browser QA

Rebuild only the safe subset of gstack browser value:

- Local Chromium/Playwright control.
- Screenshots.
- Console errors.
- Network failures.
- Accessibility/interactivity snapshots.
- No cookie import by default.
- No public tunnels.
- No remote pairing.

Acceptance criteria:

- Browser adapter is disabled by default.
- Enabling browser requires profile + policy.
- QA can run unauthenticated local app checks.
- Every browser write/action emits local audit event.

### P1: Build Upgrade And Version Flow

Acceptance criteria:

- Manual source path or internal mirror only by default.
- Upgrade preserves local profile and policy.
- Upgrade reports changed skill folders.
- Upgrade runs generation and tests.
- No public update check unless policy explicitly enables it.

### P1: Reduce Default Noise

Acceptance criteria:

- Default profile installs only core daily skills.
- Stack/domain packs are opt-in.
- Vendored third-party references stay behind stack profiles.
- Generated caches are ignored unless intentionally published.

### P2: Add E2E Skill Invocation Tests

Acceptance criteria:

- Codex, Claude, and Copilot host artifacts have parity tests.
- At least one local no-model skill invocation smoke test exists.
- Optional model/paid evals are separated from default local suite.

## Success Definition

This repo becomes day-to-day ready when a fresh project can run:

```text
architecture-agent install --repo .
architecture-agent doctor
```

Then use this loop without manual wiring:

```text
spec -> plan-review -> build -> review -> test -> qa -> ship
```

The loop must work locally, preserve no-default-egress, and produce auditable
artifacts without requiring upstream gstack.
