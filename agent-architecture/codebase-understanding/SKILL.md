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
2. Check for a knowledge graph index (`.codegraph/` dir or equivalent local index).
   - If present, use graph queries for symbol lookup, call tracing, and impact analysis.
   - Spawn an Explore agent for broad questions — never call explore tools directly in the main session.
   - Local graph queries only. No external API calls, no external egress.
3. If no index or query insufficient, fall back to local file search (Grep + Read).
4. Summarize entrypoints, data flow, dependencies, and ownership boundaries.
5. Identify tests and docs that verify the behavior.
6. Note uncertainty explicitly.

## Knowledge Graph (when index exists)

Prefer graph queries over raw file reads for:
- Symbol lookup by name
- Call tracing (callers / callees)
- Impact analysis before edits
- File-level dependency survey

Fall back to Grep + Read when the index is absent, stale, or returns no results.

## Adapter Boundary

Core skill works without any adapter — Grep + Read is always the fallback.
Supported adapters: CodeGraph MCP, any local embedding/index service.
No external APIs, no third-party egress.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
