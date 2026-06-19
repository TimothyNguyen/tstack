---
name: claude
version: 0.1.0
description: |
  Claude Code host adapter. Covers graphify graph-first codebase queries,
  enterprise-safe tool use, and cross-agent review when profile-approved.
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

# Claude Host Adapter

Use this adapter when targeting Claude Code as the primary agent host.

## Graphify Integration (local, no egress)

If `graphify-out/graph.json` exists in the project root, Claude should prefer
graph queries over raw file reads for codebase questions:

```bash
graphify query "<question>"                    # broad BFS traversal
graphify path "<SymbolA>" "<SymbolB>"          # shortest dependency path
graphify explain "<Concept>"                   # scoped explanation
graphify affected graphify-out/graph.json --files <changed-file>   # impact scope
```

After modifying code, update the graph (AST-only, no API cost, no egress):

```bash
graphify update .
```

**Never run these from within agent tasks** — they make external API calls:

```bash
# Forbidden in enterprise: sends code to external LLM APIs
graphify extract . --backend claude
graphify extract . --backend gemini
graphify extract . --backend openai
graphify add <external-url>
```

Graph build (`/graphify .`) is a separate user-initiated step. Do not trigger
it automatically.

## CLAUDE.md Install Block

`graphify install` injects the following block into the project's `CLAUDE.md`.
This is a local file modification — no external network calls:

```markdown
## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community
structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when
  graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for
  relationships and `graphify explain "<concept>"` for focused concepts.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead
  of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or
  when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current
  (AST-only, no API cost).
```

## Enterprise Settings

```bash
# Disable local query log (default: ~/.cache/graphify-queries.log)
export GRAPHIFY_QUERY_LOG_DISABLE=1

# Raise graph.json memory cap for large codebases
export GRAPHIFY_MAX_GRAPH_BYTES=1GB
```

## Steps

1. Confirm the user goal and scope.
2. Check `graphify-out/graph.json` before reading source files.
3. Use graph queries for symbol lookup, dependency tracing, and impact analysis.
4. Fall back to Grep + Read when graph absent or query insufficient.
5. Check policy requirements before any privileged action.
6. Produce a concise result with evidence, risks, and next actions.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
