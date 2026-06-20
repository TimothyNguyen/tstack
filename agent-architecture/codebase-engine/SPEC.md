# SPEC — codebase-engine

## G
G1: Enterprise-safe, fully offline AST knowledge graph for AI coding agents. Extracts source with tree-sitter, builds a NetworkX graph, clusters by Leiden community detection, and answers symbol/path/dependency queries via CLI or MCP server. No external egress.

## C
C1: No network calls during extraction or query. DNS, HTTP, and socket connections are forbidden outside explicitly approved internal LLM backends.
C2: Google Workspace API, GitHub PR API, and wiki egress are removed at build time — not runtime-flagged.
C3: LLM backends are optional. AST extraction (tree-sitter) and graph queries run without any API key.
C4: `always_on/` host-injection directory is excluded. Skill is delivered as `codebase-engine/SKILL.md`, not injected into host config files.
C5: Graph size is capped before JSON parsing. `CODEBASE_ENGINE_MAX_GRAPH_BYTES` (default 512 MiB) prevents memory-bomb via crafted graph.json.
C6: All output stays under `codebase-out/` (or `CODEBASE_OUT`). Installer may not write to global config or system paths.
C7: Enterprise policy: no telemetry, no public update checks, no public tunnels, no cookie import.

## I
I1: Source trees — any mix of Python, TS/JS, Go, Rust, Java, C/C++, Ruby, Swift, Kotlin, Scala, PHP, C#, Lua, Zig, PowerShell, Elixir, ObjC, Julia, Verilog, Fortran, Bash, JSON, SQL.
I2: Document corpus — Markdown, RST, HTML, YAML, PDF (via `[pdf]` extra), Office files (via `[office]` extra).
I3: LLM backend (optional) — Anthropic Claude, Google Gemini, OpenAI, AWS Bedrock, configured via `CODEBASE_ENGINE_LLM_*` env vars.
I4: PostgreSQL schema — via `pg_introspect` when `[postgres]` extra is installed.
I5: SCIP JSON — external language servers can emit simplified SCIP and feed it in via `scip_ingest`.
I6: MCP server configs — `.mcp.json`, `claude_desktop_config.json`, etc. indexed as graph nodes.

## V
V1: Extraction is local. `codebase-engine extract` never opens a socket to a public host.
V2: Query is local. `codebase-engine query/explain/path/affected` reads only `codebase-out/graph.json`.
V3: Graph cap enforced before parse. `check_graph_file_size_cap` raises `ValueError` before `json.loads`; callers must not bypass it.
V4: Egress stubs return error strings, not exceptions. MCP protocol requires a JSON response; PR/wiki stubs use `"Error: ... not available in enterprise build."` so callers receive a valid tool result.
V5: Brand is `codebase_engine` / `codebase-engine` throughout. No `graphify` references remain in source, tests, or markdown.
V6: Module import does not trigger heavy deps. `__init__.py` uses `__getattr__` lazy-import so `import codebase_engine` succeeds even when optional extras are absent.
V7: Graph output path is configurable without code changes. `CODEBASE_OUT` env var overrides `codebase-out/` for CI, worktrees, and shared-output setups.
V8: Security helpers are not bypassable. `sanitize_label` and `check_graph_file_size_cap` live in `security.py` and are called at every ingestion boundary.

## T
id|status|task|cites
T1|x|Port graphify core: copy source, rename module (graphify → codebase_engine), stub egress modules|C1,C2,V5
T2|x|Remove always_on/ directory and install injection blocks|C4
T3|x|Stub google_workspace.py: empty frozenset, always-False enabled(), None-returning converter|C2,V4
T4|x|Stub prs.py and wiki.py callers in serve.py with enterprise-build error strings|C2,V4
T5|x|Complete brand rename across all .py source files (445+ graphify refs → 0)|V5
T6|x|Port test suite (98 files) and apply same brand rename|V5
T7|x|Add codebase-engine/SKILL.md.tmpl agent skill co-located with Python package|C4
T8|x|Add codebase-engine to agent-architecture skill catalog and root router|C4
T9|x|Add tests/codebase-engine.test.mjs contract suite (18 tests)|V1,V3,V4,V5
T10|x|Complete brand rename in 104 skill reference markdown files (13 hosts × 8 topics)|V5
T11|.|Add integration tests that run extract + query against a fixture codebase|V1,V2
T12|.|Add graph size cap test with a crafted oversized fixture|V3
T13|.|Add LLM backend config validation: reject non-internal endpoints at startup|C3,V1

## B
id|date|cause|fix
B1|2026-06-19|6 Python files retained graphify refs in docstrings and JS plugin export names|Fixed in tests: add codebase-engine.test.mjs brand test; fix survivors
B2|2026-06-19|104 skill reference .md files retained .graphify_* dotfile names and CLI invocations|Fixed by bulk PowerShell replace across all host/topic combinations
