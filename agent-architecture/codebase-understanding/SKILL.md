---
name: codebase-understanding
version: 0.1.0
description: |
  Codebase understanding workflow. Maps architecture, finds ownership boundaries, traces dependencies,
  and builds implementation context using local project files or approved index adapters.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

## Enterprise Preamble

- Stay inside the current project unless the user explicitly names another path.
- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.
- Use policy-gated tools only when the active profile allows them.
- Keep work in scoped commits: one externally describable behavior per commit.

# Codebase Understanding

Use this workflow when a user asks how a system works, where behavior is
implemented, what code depends on a module, or what context is needed before a
change.

## Steps

1. Identify the target behavior, symbol, module, or workflow.
2. Check for a pre-built graphify graph:
   - If `graphify-out/graph.json` exists, run `graphify query "<question>" graphify-out/graph.json` first.
   - Never run `graphify .` or `graphify extract . --backend <name>` — graph builds are a separate user-initiated step and may send data to external APIs.
   - Enterprise-safe graphify query commands (local only, no egress):
     - `graphify query "what calls <symbol>" graphify-out/graph.json`
     - `graphify query "what does <module> depend on" graphify-out/graph.json`
     - `graphify callflow graphify-out/graph.json`
     - `graphify affected graphify-out/graph.json --files <path>`
3. If no graph or query insufficient, fall back to local file search (Grep + Read).
4. Summarize entrypoints, data flow, dependencies, and ownership boundaries.
5. Identify tests and docs that verify the behavior.
6. Note uncertainty explicitly.

## Adapter Boundary

This skill can use graphify (local `graphify-out/graph.json`), CodeGraph, MCP,
or an internal embedding/index service. The core skill remains useful without
any adapter — Grep + Read is always the fallback.

See `graphify-mapping-spec.md` in this directory for the full enterprise egress
audit and integration plan before enabling any graphify feature.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
