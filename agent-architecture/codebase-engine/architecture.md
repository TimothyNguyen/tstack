# codebase-engine — Architecture

Offline AST knowledge graph for local codebases. Extracts nodes and edges from source code,
builds a graph, clusters it into communities, and answers structural questions — no cloud API required.

---

## Pipeline

```
Source files
    │
    ▼
detect.py          ← file discovery, type classification, change detection
    │
    ▼
extract.py         ← tree-sitter AST → raw nodes + edges per file
    │
    ▼
build.py           ← assemble NetworkX graph, deduplicate nodes, resolve cross-file edges
    │
    ▼
cluster.py         ← Leiden community detection (Louvain fallback), cohesion scoring
    │
    ▼
analyze.py         ← god nodes, surprising connections, import cycles, suggested questions
    │
    ▼
report.py          ← GRAPH_REPORT.md (human-readable audit trail)
export.py          ← graph.json, graph.html (D3 viewer), Obsidian canvas
```

Semantic extraction (LLM-based) is **optional** — the AST pipeline alone produces a useful graph.
When a backend is configured (`CODEBASE_ENGINE_LLM_*`), semantic extraction runs on top of AST output
to add `INFERRED` edges for things tree-sitter cannot see (implicit contracts, runtime polymorphism).

---

## Module Map

| File | Role |
|------|------|
| `__main__.py` | CLI entry point — routes all `codebase-engine <cmd>` subcommands |
| `detect.py` | File discovery, FileType classification, corpus health checks, incremental manifest |
| `extract.py` | Per-file AST extraction via tree-sitter; outputs `{nodes, edges}` dicts |
| `build.py` | Assembles extracted dicts into a NetworkX `MultiDiGraph`; three-layer dedup |
| `cluster.py` | Community detection (Leiden → Louvain → connected-components fallback) |
| `analyze.py` | God nodes, cross-community surprise edges, import cycle detection, question seeding |
| `report.py` | Renders `GRAPH_REPORT.md` — god nodes, communities, gaps, suggested questions |
| `export.py` | Writes `graph.json`, `graph.html` (D3), `graph.svg`, Obsidian canvas, Neo4j/FalkorDB |
| `serve.py` | MCP stdio server — exposes graph query tools to Claude and other agents |
| `watch.py` | File-system watcher; triggers incremental `--update` on change |
| `affected.py` | Reverse-reachability: given a changed file, compute blast-radius node set |
| `ingest.py` | Fetch URLs (tweets, arXiv, webpages) as Markdown corpus members |
| `transcribe.py` | Transcribe video/audio (local Whisper, no cloud) → `.txt` corpus members |
| `llm.py` | LLM adapter — Anthropic, OpenAI, Bedrock; used only when backend is configured |
| `security.py` | SSRF guard, URL allow-list, path traversal guard, label sanitisation |
| `cache.py` | Per-file extraction cache keyed on content hash; skips unchanged files on re-run |
| `ids.py` | Deterministic node-ID normalisation; stable across renames within a file |
| `dedup.py` | Cross-file semantic dedup pipeline (MinHash LSH + LLM confirmation) |
| `semantic_cleanup.py` | Converts sentence-like rationale nodes into node attributes |
| `validate.py` | Schema validation of raw extraction JSON before graph assembly |
| `manifest.py` | Re-export shim for manifest helpers in `detect.py` |
| `manifest_ingest.py` | Ingests `package.json`, `pyproject.toml`, `go.mod` as dependency nodes |
| `mcp_ingest.py` | Ingests MCP config files as tool/server nodes |
| `scip_ingest.py` | Ingests SCIP JSON (language-server-generated) as precise call-graph nodes |
| `cargo_introspect.py` | Reads `Cargo.toml` to add crate-level dependency edges |
| `pg_introspect.py` | Introspects live PostgreSQL schema via psycopg3, feeds into graph |
| `global_graph.py` | Cross-repo graph registry in `~/.codebase-engine/`; local only |
| `affected.py` | Blast-radius analysis via reverse BFS from changed file node |
| `hooks.py` | Installs/removes git `post-commit` and `post-checkout` hooks |
| `querylog.py` | Append-only JSONL log of all queries (for memory/learning loops) |
| `benchmark.py` | Token-reduction benchmark for extraction quality |
| `diagnostics.py` | Read-only health checks: graph size cap, corpus stats |
| `file_slice.py` | Extracts line-range slices of source files for context windows |
| `symbol_resolution.py` | Resolves import paths and call targets across file boundaries |
| `multigraph_compat.py` | Runtime compatibility probe for NetworkX MultiDiGraph API changes |
| `_minhash.py` | MinHash + LSH implementation (no datasketch dependency) |
| `callflow_html.py` | Renders interactive call-flow HTML from a subgraph |
| `tree_html.py` | Renders D3 collapsible-tree HTML for community drill-down |

---

## Install

```bash
# Core (AST extraction only, no LLM)
pip install codebase-engine

# With community detection (recommended)
pip install 'codebase-engine[leiden]'

# With PDF reading
pip install 'codebase-engine[pdf]'

# With file-system watcher
pip install 'codebase-engine[watch]'

# With video transcription (local Whisper, Python 3.11+)
pip install 'codebase-engine[video]'

# With MCP server
pip install 'codebase-engine[mcp]'

# Everything
pip install 'codebase-engine[all]'
```

---

## Run

### First extraction

```bash
# Run from the repo you want to understand
codebase-engine extract .
```

Outputs written to `./codebase-out/`:
- `graph.json` — full graph
- `GRAPH_REPORT.md` — god nodes, communities, surprising connections
- `graph.html` — interactive D3 viewer (open in browser)

### Query

```bash
codebase-engine query "how does authentication work?"
codebase-engine query "what calls the payment service?"
```

### Explain a symbol

```bash
codebase-engine explain AuthService
codebase-engine explain process_payment
```

### Trace a path between two nodes

```bash
codebase-engine path AuthMiddleware PaymentHandler
```

### Blast-radius analysis

```bash
# Which graph nodes are affected if this file changes?
codebase-engine affected src/auth/middleware.py
```

### Incremental update (fast, no LLM)

```bash
# Re-run AST extraction only on changed files
codebase-engine update .
```

### Auto-update on file changes

```bash
# Watch the folder and run --update on every save
codebase-engine watch .
```

### MCP server (for agent tool-calling)

```bash
# Stdio server — configure in your agent's MCP settings
codebase-engine-mcp
```

---

## Configuration

| Env var | Default | Purpose |
|---------|---------|---------|
| `CODEBASE_OUT` | `<root>/codebase-out` | Output directory override |
| `CODEBASE_ENGINE_LLM_BACKEND` | *(unset)* | LLM provider: `anthropic`, `openai`, `bedrock` |
| `CODEBASE_ENGINE_LLM_API_KEY` | *(unset)* | API key for LLM backend (internal endpoints only) |
| `CODEBASE_ENGINE_LLM_MODEL` | Provider default | Model name override |
| `CODEBASE_ENGINE_LLM_BASE_URL` | *(unset)* | Base URL for internal LLM proxy |
| `CODEBASE_ENGINE_WHISPER_MODEL` | `base` | Whisper model size (`tiny`, `base`, `small`, `medium`) |
| `CODEBASE_ENGINE_WHISPER_PROMPT` | *(auto)* | Domain hint for Whisper transcription |

LLM extraction is **optional**. Without `CODEBASE_ENGINE_LLM_BACKEND`, the pipeline runs
AST-only and produces a graph from structure alone. Set the backend only when connecting
to an approved internal endpoint.

---

## Output Layout

```
codebase-out/
├── graph.json              ← full graph (nodes, edges, communities, metadata)
├── GRAPH_REPORT.md         ← human-readable: god nodes, communities, gaps, questions
├── graph.html              ← interactive D3 viewer
├── graph.svg               ← static SVG (requires [svg] extra)
├── graph.canvas            ← Obsidian canvas format
├── manifest.json           ← file-hash manifest for incremental runs
├── _COMMUNITY_*.md         ← per-community Obsidian hub notes (wikilinked from GRAPH_REPORT)
├── transcripts/            ← .txt transcripts from video/audio files
│   └── downloads/          ← cached audio downloads (yt-dlp)
├── ingested/               ← fetched URL content as .md files
└── memory/                 ← saved Q&A results (feeds back into graph on next --update)
```

---

## Agent Skill

The `SKILL.md` co-located in this folder is the agent skill that teaches Claude (and other agents)
how to use `codebase-engine`. Agents follow the skill to:

1. Check if `codebase-out/` exists (extraction already ran).
2. Run `codebase-engine extract .` if not.
3. Read `GRAPH_REPORT.md` to orient.
4. Use `codebase-engine query` / `explain` / `path` / `affected` to answer questions.
5. Run `codebase-engine update .` after code changes (no API cost, AST-only).

The skill is installed via `codebase-engine install --host <name>` (e.g. `--host claude`, `--host amp`).

---

## Enterprise Constraints

- No network calls during extraction (AST pipeline is fully offline).
- No Google Workspace, GitHub PR, or wiki egress in this build.
- LLM backend, if configured, must be an approved internal endpoint (`CODEBASE_ENGINE_LLM_BASE_URL`).
- Graph files stay in `codebase-out/` (local). Do not upload or sync externally.
- `always_on/` host-injection is absent from this build. Use the `SKILL.md` agent skill instead.
