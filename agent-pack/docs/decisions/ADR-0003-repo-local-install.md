# ADR-0003 — Repo-Local Install Only

**Status:** Accepted  
**Date:** 2026-06-25  
**SPEC refs:** C2, V3

## Context

Agent packs often require a "global install" step that mutates the developer's
home directory, VS Code user settings, or a system-wide config store. In enterprise
environments this creates several problems:

- Security teams cannot audit what changed or when.
- Multiple project configurations conflict in the global store.
- Uninstalling the pack does not cleanly undo global mutations.
- CI runners start with a clean environment and cannot rely on developer global state.

## Decision

All installation artifacts are written to a directory **inside the consuming repository**,
defaulting to `.agent/`. No global config files, no home-directory writes, no system
paths, no VS Code `settings.json` mutations.

Concretely:

- `scripts/install.mjs` writes only to the `--target` directory (default `.agent/`).
- The `--target` path is always resolved relative to `process.cwd()` (the consuming repo root).
- No write is ever issued outside of the resolved target directory.
- Runtime artifacts (subagent worktrees, audit logs) go to `.agent-pack/`
  inside the consuming repo, not to the pack source tree.
- `doctor` validates only paths inside the target directory.
- The upgrade workflow (`agent-pack-upgrade`) replaces target-directory files
  in place; it does not touch anything outside the target.

## Consequences

- Installing two different agent packs (or two versions) in the same machine never
  conflicts — they occupy separate repo directories.
- Uninstalling is `rm -rf .agent/` — zero residue.
- CI picks up the exact installed state from the committed `.agent/` directory,
  or re-installs fresh from `package-lock.json`.
- Developers can inspect every installed file without special tooling.
- Adding a new host target requires no changes to install scope — only new files
  appear inside the target directory.
