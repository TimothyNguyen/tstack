---
name: graphify
version: 0.1.0
description: |
  Enterprise-safe knowledge graph builder. Maps any local codebase (code, docs,
  PDFs) into a queryable graph at graphify-out/. Queries run locally with no
  external egress. Use for codebase questions, architecture mapping, dependency
  tracing, and impact analysis.
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

# Graphify — Enterprise Knowledge Graph

Turn any local folder of code and docs into a queryable knowledge graph stored
in `graphify-out/`. All operations below are local — no data leaves the machine.

## Enterprise Rules (non-negotiable)

- Never pass `--backend <name>` — sends code to external LLM APIs.
- Never run `graphify add <external-url>` — fetches and stores external content.
- Never run `graphify <github-url>` — clones a remote repo (requires internet).
- Never run `graphify serve --host 0.0.0.0` — exposes MCP server externally.
- Disable query log if required by policy: `GRAPHIFY_QUERY_LOG_DISABLE=1`

## Usage

```
/graphify .                       # full pipeline on current directory
/graphify <local-path>            # full pipeline on a specific local path
/graphify . --update              # incremental — re-extract only changed files
/graphify . --mode deep           # richer INFERRED edges
/graphify . --no-viz              # skip HTML, report + JSON only
/graphify query "<question>"      # query existing graph (no re-extraction)
/graphify path "<A>" "<B>"        # shortest dependency path between two concepts
/graphify explain "<concept>"     # focused explanation of one node
/graphify callflow                # generate Mermaid call-flow diagram
/graphify . --watch               # watch for file changes, auto-update (AST only)
/graphify . --mcp                 # start local MCP stdio server
```

## Fast Path — Existing Graph

Before anything else, check for `graphify-out/graph.json` in the project root.

If it exists AND the request is a codebase question ("how does X work?", "what
calls Y?", "where is Z?", "what depends on W?") and NOT an explicit rebuild:
**skip to `## Query` below and run `graphify query` immediately.**

Do not re-extract if the graph exists and the files have not changed.

## Step 1 — Check Installation

```bash
graphify --version 2>/dev/null || echo "NOT_INSTALLED"
```

If not installed, tell the user:

```
graphify is not installed. Install with:
  pip install graphifyy
  # or: uv tool install graphifyy
```

Do not auto-install. Do not run `curl | sh`. Policy must approve the install
method first.

## Step 2 — Build Graph (local path only)

```bash
# AST extraction (local, no egress, no API key needed)
graphify <path>
```

This runs: detect → AST extract → semantic extract (Claude subagents, local)
→ cluster → analyze → report → export.

Output written to `graphify-out/`:
- `graph.json` — queryable graph (networkx node-link JSON)
- `GRAPH_REPORT.md` — key concepts, surprising connections, suggested questions
- `graph.html` — interactive browser visualization

After the build, run `graphify update .` for subsequent changes (AST-only,
no API cost):

```bash
graphify update .
```

## Query

Use these for any codebase question when `graphify-out/graph.json` exists.

### Broad question (BFS)

```bash
graphify query "<question>"
```

### Trace a specific path (DFS)

```bash
graphify query "<question>" --dfs
```

### Token-budget cap

```bash
graphify query "<question>" --budget 1500
```

### Shortest path between two concepts

```bash
graphify path "<SymbolA>" "<SymbolB>"
```

### Explain one node in plain language

```bash
graphify explain "<ConceptName>"
```

### What changed impact

```bash
graphify affected graphify-out/graph.json --files <modified-file>
```

If the `graphify` CLI is not available but `graphify-out/graph.json` exists,
read the file and answer from its node/edge data directly — do not re-extract.

## Query Expansion (required before traversal)

Before running `graphify query`, expand the question against the graph's actual
vocabulary to avoid zero-match results from vocabulary mismatch:

```bash
python3 -c "
import json, re
from pathlib import Path
data = json.loads(Path('graphify-out/graph.json').read_text())
vocab = set()
for n in data['nodes']:
    for c in re.findall(r'[^\W\d_]+', n.get('label','') or '', re.UNICODE):
        for p in re.findall(r'[A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+|[A-Z]+', c) or [c]:
            t = p.lower()
            if 3 <= len(t) <= 30:
                vocab.add(t)
print('\n'.join(sorted(vocab)[:100]))
"
```

Select up to 12 tokens from the vocabulary that match the question intent. Use
only tokens that appear in the vocabulary. Join selected tokens as the query
string. If no vocabulary tokens match, say so — do not fabricate a search.

## Output Format

After any query, path, or explain:

1. State which nodes and edges answered the question.
2. Cite `source_file` and `source_location` for each claim.
3. Flag edges with `AMBIGUOUS` confidence for human review.
4. Note if the answer is incomplete due to graph coverage gaps.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
