# Graphify — Mapping Spec for codebase-understander Integration

Reference: `../../../graphify/` (local clone, gitignored)  
Version audited: `0.8.44` (`pyproject.toml`)

---

## High-Level Overview

Graphify is a Python library + AI coding skill that converts a local codebase
(code, docs, PDFs, images, videos) into a queryable knowledge graph stored in
`graphify-out/`. The output is three files:

```
graphify-out/
├── graph.json       NetworkX node-link JSON — queryable without re-reading files
├── GRAPH_REPORT.md  Key concepts, surprising connections, suggested questions
└── graph.html       Interactive browser visualization (click, filter, search)
```

**Default pipeline** (when used as a skill, not `--backend` mode):

```
detect()  →  extract()  →  build_graph()  →  cluster()  →  analyze()  →  report()  →  export()
```

All stages are pure functions communicating via plain Python dicts and
NetworkX graphs. No shared mutable state. All output goes to `graphify-out/`.

---

## Module Map

| File | Purpose | Egress? |
|---|---|---|
| `__main__.py` | CLI entry point; dispatches subcommands (`install`, `extract`, `query`, `watch`, `serve`, `ingest`, `update`) | None |
| `detect.py` | `collect_files(root)` — walks dir, applies ignore rules, returns filtered `[Path]` list | None |
| `extract.py` | Dispatches to per-language AST extractors (tree-sitter) + optional semantic pass via Claude Code subagent | None (AST); agent call via skill (semantic) |
| `build.py` | `build_graph(extractions)` — assembles node+edge dicts into `nx.DiGraph`; deduplication in 3 layers | None |
| `cluster.py` | `cluster(G)` — community detection (Leiden algorithm via `graspologic` if installed, else greedy modularity) | None |
| `analyze.py` | `analyze(G)` — finds god nodes (highest degree), surprising cross-community edges, suggests questions | None |
| `report.py` | `render_report(G, analysis)` — produces `GRAPH_REPORT.md` string | None |
| `export.py` | Writes `graph.json`, `graph.html`, Obsidian vault, optional SVG | None |
| `callflow_html.py` | Generates Mermaid call-flow HTML from existing `graphify-out/` files | None |
| `cache.py` | `check_semantic_cache / save_semantic_cache` — file-hash-keyed cache for LLM extraction results | None (local disk) |
| `security.py` | URL validation, SSRF-guarded fetch, path guards, label sanitization | None (defensive only) |
| `validate.py` | `validate_extraction(data)` — enforces `{nodes, edges}` schema before `build_graph()` | None |
| `ids.py` | `normalize_id(label)` — stable, deterministic node IDs | None |
| `dedup.py` | MinHash-based near-duplicate node detection | None |
| `_minhash.py` | MinHash implementation (no deps) | None |
| `semantic_cleanup.py` | Post-processing: merge near-duplicate semantic nodes | None |
| `symbol_resolution.py` | Cross-file symbol resolution for INFERRED call edges | None |
| `multigraph_compat.py` | Handles both `nx.Graph` and `nx.MultiDiGraph` transparently | None |
| `affected.py` | `affected_nodes(G, changed_files)` — used by `--update` to scope re-extraction | None |
| `watch.py` | `watch(root)` — `watchdog`-based file watcher; writes flag file on change, triggers `--update` | None |
| `serve.py` | `start_server(graph_path)` — MCP stdio server exposing graph query as MCP tool | Local stdio only |
| `querylog.py` | Append-only JSONL query log at `~/.cache/graphify-queries.log` | **Local disk only** |
| `ingest.py` | Fetches external URLs (arxiv, tweets, PDFs, web pages) into corpus dir | **External HTTP** — user-initiated only |
| `llm.py` | Direct API client for Claude/Kimi/Ollama/Gemini/OpenAI/Bedrock backends | **External API** — only via `--backend` flag |
| `benchmark.py` | Token comparison: full corpus vs. subgraph | None |
| `manifest.py` | Reads/writes `graphify-out/manifest.json` (tracks extracted files) | None |
| `manifest_ingest.py` | Tracks ingested URLs in manifest | None |
| `mcp_ingest.py` | Ingests from MCP tool output | Local stdio only |
| `scip_ingest.py` | Ingests SCIP index (from `scip-typescript`, `rust-analyzer`, etc.) for precise symbol resolution | None (local file) |
| `cargo_introspect.py` | Runs `cargo metadata` for Rust workspace graph | Local subprocess |
| `pg_introspect.py` | Introspects PostgreSQL schema | **Local DB connection** — user-configured |
| `prs.py` | Fetches GitHub PR diffs | **External HTTP** — user-initiated, `gh` CLI |
| `google_workspace.py` | Connects to Google Drive/Docs/Sheets | **External API** — optional, requires Google credentials |
| `wiki.py` | Fetches Wikipedia/MediaWiki pages | **External HTTP** — user-initiated via `ingest` |
| `transcribe.py` | Video/audio transcription via `faster-whisper` (local model) | None (local model) |
| `file_slice.py` | Slices large files for LLM batching (used by `llm.py` backends) | None |
| `global_graph.py` | Cross-project global graph merge | None |
| `diagnostics.py` | Self-diagnostics: checks installed deps, tree-sitter grammars | None |
| `skill.md` | Skill body for Claude Code (default integration path) | Via agent |
| `skill-*.md` | Skill bodies for Codex, Copilot, Aider, etc. | Via respective agent |
| `always_on/*.md` | Injected into `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, etc. by `graphify install` | None |

---

## Egress Audit

### Enterprise-safe by default (no external calls)

When used **as a Claude Code skill** (the default `/graphify` path), graphify
makes **zero direct network calls**. The agent itself handles extraction; all
graph construction, clustering, analysis, and export are local Python.

Confirmed local-only:
- AST extraction (tree-sitter, fully local compiled grammars)
- Graph construction (`networkx`)
- Community detection (`graspologic` or built-in)
- Query answering from `graph.json` (file read, no API)
- MCP server (stdio, local process)
- Cache (`graphify-out/.semantic_cache/`)
- Query log (`~/.cache/graphify-queries.log`) — local JSONL, no upload

### External egress surfaces (all opt-in, not default)

| Surface | Module | Trigger | Control |
|---|---|---|---|
| LLM API (Claude/Gemini/OpenAI/Kimi/Bedrock) | `llm.py` | `--backend <name>` flag | Don't pass `--backend`; use skill (default) |
| Ollama | `llm.py` | `--backend ollama` | Safe if Ollama runs on localhost |
| URL ingestion (arxiv, PDF, web) | `ingest.py` | `graphify ingest <url>` subcommand | Don't use `ingest` with external URLs |
| GitHub PR diffs | `prs.py` | explicit PR subcommand | Don't use; or point `gh` at internal GitHub |
| Google Workspace | `google_workspace.py` | explicit import/subcommand | Don't use |
| Wikipedia | `wiki.py` | `graphify ingest <wiki-url>` | Don't use |
| PostgreSQL | `pg_introspect.py` | `graphify ingest --postgres` | Internal DB only |
| tiktoken model download | `llm.py` | first `--backend` use | Only applies to `--backend` path |

### Query log

`querylog.py` writes to `~/.cache/graphify-queries.log` (local file only).  
Disable entirely: `GRAPHIFY_QUERY_LOG_DISABLE=1`  
Redirect: `GRAPHIFY_QUERY_LOG=/path/to/local.log`  
Responses not logged unless: `GRAPHIFY_QUERY_LOG_RESPONSES=1` (off by default)

---

## Extraction Schema

Every extractor (AST or semantic) returns:

```json
{
  "nodes": [
    {
      "id": "unique_string",
      "label": "human name",
      "source_file": "relative/path",
      "source_location": "L42"
    }
  ],
  "edges": [
    {
      "source": "id_a",
      "target": "id_b",
      "relation": "calls|imports|uses|defines|extends|implements",
      "confidence": "EXTRACTED|INFERRED|AMBIGUOUS"
    }
  ]
}
```

Confidence labels:
- `EXTRACTED` — explicit in source (import statement, direct call)
- `INFERRED` — reasonable deduction (call-graph second pass, co-occurrence)
- `AMBIGUOUS` — uncertain; flagged in `GRAPH_REPORT.md`

---

## Integration Plan for `codebase-understander`

### What graphify enables

Without graphify, `codebase-understander` reads files directly (Grep + Read).
With a pre-built `graphify-out/graph.json`, it can:

1. Answer "what calls X?" / "what does Y depend on?" from graph edges — no file reads.
2. Find cross-module dependency paths via graph traversal.
3. Surface "god nodes" (highest-degree symbols) as architecture hotspots.
4. Identify community clusters = module ownership boundaries.
5. Query `graph.json` for symbols without grepping across thousands of files.

### Enterprise-safe integration approach

```
Prerequisite: graphify-out/graph.json must exist (built by prior /graphify run)
No: direct API calls, no external URLs, no --backend flag
Yes: read graph.json locally, query via graphify query subcommand (local)
```

Skill logic additions to `codebase-understander/SKILL.md.tmpl`:

1. **Graph presence check** — before any file search, check `graphify-out/graph.json`.
2. **Graph-first query** — if graph exists, run `graphify query "<question>"` first.
3. **File-read fallback** — if graph absent or query insufficient, fall back to Grep+Read.
4. **No graph build during skill** — never run `graphify .` during `codebase-understander`
   (graph build runs LLM subagents; that is a separate user-triggered step).

### Commands safe for enterprise use

```bash
# Query from existing graph (local only, no egress)
graphify query "what calls authenticate()" graphify-out/graph.json
graphify query "which modules depend on database.py" graphify-out/graph.json

# Export callflow diagram (local only)
graphify callflow graphify-out/graph.json

# Check what changed (local only)
graphify affected graphify-out/graph.json --files src/auth.py
```

### Commands to avoid in enterprise

```bash
# These make external calls:
graphify extract . --backend claude    # direct Anthropic API
graphify extract . --backend gemini    # direct Google API
graphify ingest https://...            # external URL fetch
graphify ingest --postgres             # only if DB is external
graphify install                       # modifies CLAUDE.md (fine, but external fetch risk if auto-updating)
```

---

## Security Properties (from `security.py`)

| Guard | What it protects |
|---|---|
| `validate_url()` | HTTP/HTTPS only; blocks `file://`, `ftp://`, `data:` |
| `_SSRFGuardedHTTPConnection/S` | DNS resolved once, connects to validated IP — no DNS-rebind TOCTOU |
| `_NoFileRedirectHandler` | Re-validates every redirect target; blocks `file://` redirects |
| `validate_graph_path()` | Path must resolve inside `graphify-out/`; blocks path traversal |
| `check_graph_file_size_cap()` | Rejects `graph.json` > 512 MiB by default (env: `GRAPHIFY_MAX_GRAPH_BYTES`) |
| `sanitize_label()` | Strips control chars, caps at 256 chars |
| `sanitize_metadata()` | Recursive sanitization of node metadata before HTML export |

These guards apply to the `ingest` code path (URL fetching). AST extraction
and graph construction do not fetch external URLs.

---

## Dependencies Requiring Corporate Approval

Core (always installed):

| Package | Purpose | Network? |
|---|---|---|
| `networkx` | Graph data structure and algorithms | No |
| `tree-sitter-*` | AST parsers for 20+ languages | No (compiled grammars) |
| `rapidfuzz` | Fuzzy string matching for dedup | No |
| `numpy` | Array ops for clustering | No |

Optional (install only if needed):

| Package | Purpose | Network? | Enterprise concern |
|---|---|---|---|
| `graspologic` | Leiden community detection | No | None |
| `watchdog` | File watcher | No | None |
| `mcp` | MCP stdio server | Local stdio | None |
| `pypdf` + `markdownify` | PDF ingestion | No | None |
| `faster-whisper` | Local audio transcription | Downloads model on first use | Model download once |
| `anthropic` | Direct Claude API | **Yes** | Skip; use skill instead |
| `openai` + `tiktoken` | Direct OpenAI/Gemini/Kimi API | **Yes** | Skip unless internal proxy |
| `boto3` | AWS Bedrock | **Yes** | Only if using Bedrock internally |
| `neo4j` / `falkordb` | Graph DB export | **Yes** (to DB server) | Internal DB only |
| `psycopg` | PostgreSQL introspection | **Yes** (to DB server) | Internal DB only |
| `yt-dlp` | Video download | **Yes** | Skip |
| `openpyxl` | Excel/Google Sheets | No (local) / **Yes** (Google) | Local Excel: fine |

**Minimum safe install for enterprise (no egress, AST + graph only):**

```bash
pip install graphifyy
# No optional deps needed for codebase-understander integration
```

---

## Host Integration: Claude + Copilot

This org uses Claude Code and GitHub Copilot. Integration differs per host.

### Claude Code

| Item | Detail |
|---|---|
| Skill file | `graphify/graphify/skill.md` (installed by `graphify install`) |
| Always-on injection | `graphify/graphify/always_on/claude-md.md` → appended to project `CLAUDE.md` |
| Invocation | `/graphify` in Claude Code session |
| Graph query | `graphify query "<q>"` from terminal or Bash tool |
| Enterprise adapter | `agent-architecture/claude/SKILL.md` |

`graphify install` writes a `## graphify` section to the project's `CLAUDE.md`.
Local file write only — no external calls. The injected block tells Claude to
prefer `graphify query` over grep for codebase questions.

### GitHub Copilot (VS Code)

| Item | Detail |
|---|---|
| Skill file | `graphify/graphify/skill-copilot.md` (installed by `graphify install`) |
| Always-on injection | `graphify/graphify/always_on/vscode-instructions.md` → `.github/copilot-instructions.md` |
| Invocation | `/graphify` in Copilot Chat |
| Graph query | Terminal only (`graphify query` — Copilot Chat cannot run arbitrary Bash) |
| Enterprise adapter | `agent-architecture/copilot/SKILL.md` |

`graphify install` writes a `## graphify` section to
`.github/copilot-instructions.md`. Local file write only, no external calls.

### What `graphify install` Does (both hosts)

Writes to (local only):
- `CLAUDE.md` — Claude Code always-on block
- `.github/copilot-instructions.md` — Copilot always-on block
- `.claude/skills/graphify/SKILL.md` — Claude skill entrypoint

Does NOT:
- Make external network calls
- Send code to any API
- Set up telemetry
- Modify global config outside the project directory

Corporate review: inspect the three written files before committing, especially
`CLAUDE.md` (read by every Claude Code session in the project).

---

## Tasks for Integration

| Task | Status |
|---|---|
| Update `codebase-understanding/SKILL.md.tmpl` to check for `graphify-out/graph.json` | Done |
| Add graph-first query path to skill steps | Done |
| Add file-read fallback when graph absent | Done |
| Document `GRAPHIFY_QUERY_LOG_DISABLE=1` in enterprise install notes | Done |
| Expand `claude/SKILL.md.tmpl` with graphify + enterprise instructions | Done |
| Expand `copilot/SKILL.md.tmpl` with graphify + enterprise instructions | Done |
| Add graphify adapter note to `docs/skill-catalog.md` deferred packs | Done |
