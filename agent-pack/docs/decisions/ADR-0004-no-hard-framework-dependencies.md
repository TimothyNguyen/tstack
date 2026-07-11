# ADR-0004 — No Hard Framework Dependencies

**Status:** Accepted  
**Date:** 2026-06-25  
**SPEC refs:** V18, I11

## Context

Many agent packs couple themselves tightly to one host platform (LangChain,
CrewAI, AutoGen, Claude SDK, etc.). This creates adoption friction:

- Teams locked to a different framework cannot use the pack without a rewrite.
- Framework upgrades break the pack independently of skill logic.
- Testing requires the full framework runtime even for pure-logic tests.
- Enterprise environments may prohibit specific framework packages.

## Decision

The `agent-pack` pack has **no hard runtime dependencies** on any agent
framework, LLM SDK, or orchestration library.

Concretely:

- `package.json` has zero `dependencies`. `devDependencies` covers Playwright for
  integration tests only.
- All generator scripts (`scripts/*.mjs`) use only Node.js built-ins (`node:fs`,
  `node:path`, `node:url`).
- All tests use only Node.js built-in test runner (`node:test`, `node:assert`).
- Skills are plain Markdown files; hosts read them without any pack-provided runtime.
- Adapters in `adapters/registry.json` reference external tools by name only; the
  adapter mechanism is a metadata annotation, not a library import.
- Host-specific artifacts (AGENTS.md, copilot-instructions.md) are pre-generated
  Markdown; no host SDK is required to consume them.

Optional framework integration (LangGraph, Strands, Google ADK, Databricks) is
expressed via adapter annotations and install-time configuration, not hard imports.
A team that never uses Databricks installs zero Databricks dependencies.

## Consequences

- `npm ci` in a fresh environment installs only Playwright (dev); production install
  has nothing to install.
- The pack works in repos using any LLM framework or no framework at all.
- Skill logic changes never require framework compatibility testing.
- Adding support for a new host is a documentation + script change, not a dependency
  addition.
- Vendored stacks (`stack-csharp/`, `stack-databricks/`) may carry their own
  dependencies; these are scanned and validated by `npm run vet:vendored` before merge.
