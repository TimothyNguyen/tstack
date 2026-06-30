# codebase-engine — Code Structure

Per-file, per-method breakdown of the Python package.

---

## `__init__.py`
Lazy-import facade. `__getattr__` maps top-level names (`extract`, `build_from_json`,
`cluster`, `god_nodes`, etc.) to their submodule locations so the package is importable
without loading heavy deps (tree-sitter, numpy) until they are actually used.

---

## `__main__.py`
CLI entry point. `main()` dispatches all `codebase-engine <subcommand>` invocations.

| Subcommand | What it does |
|---|---|
| `extract` | Full corpus scan → AST extraction → graph build → cluster → report → export |
| `update` | Incremental AST-only re-extraction for changed files (no LLM cost) |
| `query` | IDF-weighted BFS query over graph nodes |
| `explain` | Explain a named symbol using its local subgraph |
| `path` | Find the shortest path between two nodes |
| `affected` | Reverse-BFS blast-radius from a changed file |
| `watch` | File-system watcher; triggers `update` on save |
| `serve` | Start MCP stdio server |
| `install` | Write host-specific skill reference markdown |
| `global add/remove/list/path` | Cross-repo global graph management |
| `hooks install/uninstall/status` | Git post-commit/post-checkout hook management |
| `ingest` | Fetch a URL into the corpus |
| `transcribe` | Transcribe a video/audio file to text |
| `benchmark` | Token-reduction benchmark |
| `diagnostics` | Graph health checks |

---

## `detect.py`
File discovery, type classification, and corpus health checks.

| Function | What it does |
|---|---|
| `classify_file(path)` | Maps a file path to a `FileType` by extension; routes package manifests to CODE |
| `count_words(path)` | Estimates word count for corpus-size threshold checks |
| `detect(root)` | Walks `root`, classifies files, applies ignore rules, returns corpus description dict |
| `detect_incremental(root)` | Like `detect()` but returns only files changed since last manifest |
| `save_manifest(root, files)` | Persists file-hash manifest to `codebase-out/manifest.json` |
| `load_manifest(path)` | Loads and normalises a manifest JSON file (handles legacy formats) |
| `extract_pdf_text(path)` | Extracts plain text from a PDF via pypdf |
| `xlsx_to_markdown_sidecar(path)` | Converts an Excel file to Markdown for LLM extraction |
| `extract_xlsx_graph(path)` | Extracts sheet/column/header nodes from Excel into graph dicts |
| `_nid(*parts)` | (inner) Builds a safe lowercase node ID |
| `_add(nid, label)` | (inner) Appends a document node to the extraction accumulator |
| `_edge(src, tgt, relation)` | (inner) Appends an EXTRACTED edge to the accumulator |
| `_matches(rel, p, anchored)` | (inner) Glob-matches a path against a .codebaseinclude pattern |
| `_normalise_entry(entry)` | (inner) Coerces legacy manifest entry formats to current dict shape |

---

## `extract.py`
Per-file AST extraction via tree-sitter. Produces `{nodes, edges}` dicts.

Supports 20+ languages: Python, JavaScript/TypeScript, Go, Rust, Java, Kotlin, Scala,
C/C++, C#, Ruby, PHP, Swift, Lua, Zig, PowerShell, Elixir, Objective-C, Julia, Verilog,
Fortran, SQL, Groovy.

Key functions:

| Function | What it does |
|---|---|
| `extract(files, root)` | Entry point: runs all files through per-language extractors, returns merged nodes+edges |
| `collect_files(root)` | Re-exports from detect for backwards compatibility |
| `_safe_extract(path, lang)` | Wraps per-language extractor in error handling |
| `_source_location(node)` | Formats a tree-sitter node's byte range to `Lstart-end` |
| `_semantic_reference_edge(...)` | Creates cross-file reference edges from import statements |
| `_find_workspace_root(path)` | Locates nearest package.json/tsconfig for workspace imports |
| `_pnpm_workspace_globs(root)` | Reads pnpm-workspace.yaml globs |
| `_workspace_globs(root)` | Reads yarn/npm workspaces globs |
| `_load_workspace_packages(root)` | Resolves workspace member package names → paths |

Each language has its own extractor function (e.g. `_extract_python`, `_extract_go`,
`_extract_typescript`) that returns `{nodes, edges}` from a tree-sitter parse tree.

---

## `build.py`
Assembles per-file extraction dicts into a single NetworkX `MultiDiGraph`.

| Function | What it does |
|---|---|
| `build_from_json(payloads, root)` | Main entry: merges payloads, deduplicates, builds graph |
| `build_graph(nodes, edges)` | Constructs NetworkX graph from normalised node/edge lists |
| `prefix_graph_for_global(G, tag)` | Prefixes all node IDs with a repo tag for cross-repo merge |
| `prune_repo_from_graph(G, tag)` | Removes all nodes with a given repo tag prefix |
| `_kept(item)` | (inner) Filter predicate: keeps items NOT in the newly-extracted file set |

**Three-layer deduplication:**
1. Within-file dedup via `seen_ids` set in each extractor
2. Cross-file label dedup via MinHash LSH (dedup.py)
3. Post-build canonical ID normalisation (ids.py)

---

## `cluster.py`
Community detection on a NetworkX graph.

| Function | What it does |
|---|---|
| `cluster(G)` | Runs Leiden (graspologic) → Louvain fallback → connected-components fallback |
| `cohesion_score(G, nodes)` | Fraction of internal edges vs total possible edges in a community |
| `score_all(G, communities)` | Computes cohesion for every community in one pass |
| `remap_communities_to_previous(...)` | Greedy ID remapping to minimise churn across incremental runs |
| `label_communities(G, communities)` | Picks a representative label for each community from its top god node |
| `split_oversized(communities, max_size)` | Splits communities that exceed `max_size` into subcommunities |

---

## `analyze.py`
Graph analytics: god nodes, surprising connections, import cycles, suggested questions.

| Function | What it does |
|---|---|
| `god_nodes(G, top_n)` | Returns the N highest-degree non-file nodes with degree counts |
| `surprising_connections(G, communities)` | Finds cross-community edges (unexpected coupling) |
| `suggest_questions(G, communities, god_nodes)` | Generates seed questions the graph is uniquely positioned to answer |
| `find_import_cycles(G)` | Detects circular import chains in the file-level dependency subgraph |
| `diff_graphs(G_old, G_new)` | Returns added/removed nodes and edges between two graph snapshots |
| `_is_file_node(G, n)` | True if a node represents a source file rather than a symbol |
| `_is_concept_node(G, n)` | True if a node is a concept/rationale rather than code |
| `_is_json_key_node(G, n)` | True if a node is a low-signal JSON config key |
| `_file_category(path)` | Classifies a file path as code/paper/image/document |
| `edge_key(G, u, v, data)` | (inner) Canonical edge key for diff comparison |
| `_endpoint_source_file(node_id)` | (inner) Returns source_file attr for cycle detection |

---

## `report.py`
Renders `GRAPH_REPORT.md`.

| Function | What it does |
|---|---|
| `generate(G, communities, ...)` | Renders all report sections to a Markdown string |
| `_safe_community_name(label)` | Strips Obsidian-illegal chars from community labels for wikilinks |

**Report sections:** Corpus Check → Summary → Graph Freshness → Community Hubs (nav) →
God Nodes → Surprising Connections → Import Cycles → Hyperedges → Communities →
Ambiguous Edges → Knowledge Gaps → Suggested Questions

---

## `export.py`
Writes graph outputs: JSON, HTML viewer, SVG, Obsidian canvas, Neo4j/FalkorDB Cypher.

| Function | What it does |
|---|---|
| `to_json(G, communities, path)` | Writes `graph.json` in node-link format; refuses to silently shrink existing file |
| `to_html(G, communities, path)` | Writes interactive D3 force-graph HTML viewer |
| `to_svg(G, communities, path)` | Writes static SVG via matplotlib |
| `to_canvas(G, communities, path)` | Writes Obsidian canvas JSON |
| `to_cypher(G, path)` | Writes Neo4j Cypher CREATE statements |
| `to_falkordb(G, path)` | Writes FalkorDB Cypher CREATE statements |
| `to_obsidian(G, communities, dir)` | Writes per-node `.md` files with wikilinks |
| `safe_name(label)` | (inner) Strips Obsidian-illegal chars and .md suffixes from node labels |
| `_dominant_confidence(node_id)` | (inner) Most frequent edge confidence for a node |
| `_community_reach(node_id)` | (inner) Count of distinct communities a node touches |
| `_js_safe(obj)` | (inner) JSON-serialise and escape `</script>` for safe HTML embedding |
| `_html_styles()` | Returns CSS block for the D3 viewer |
| `_html_script(...)` | Returns D3 force-graph JavaScript block |
| `_hyperedge_script(...)` | Returns hyperedge shading JavaScript block |
| `_strip_diacritics(text)` | NFKD-removes combining chars for ASCII-safe filenames |

---

## `serve.py`
MCP stdio server. Exposes graph query tools to Claude Code and other agents.

| Tool exposed | What it does |
|---|---|
| `codebase_engine_query` | IDF-weighted BFS query over graph nodes |
| `codebase_engine_explain` | Explain a symbol using its local subgraph |
| `codebase_engine_path` | Shortest path between two nodes |
| `codebase_engine_affected` | Reverse-BFS blast-radius from a file |
| `codebase_engine_update` | Trigger incremental graph update |
| `_tool_list_prs` | Enterprise stub: returns error (PR egress removed) |
| `_tool_get_pr_impact` | Enterprise stub: returns error |
| `_tool_triage_prs` | Enterprise stub: returns error |

---

## `watch.py`
File-system watcher for incremental auto-update.

| Function | What it does |
|---|---|
| `watch(path)` | Entry point: watches directory and calls `_rebuild_code` on changes |
| `_rebuild_code(path, changed_paths)` | Runs incremental extract+build+cluster+report+export |
| `_report_root_label(path)` | Human-readable label for the watched directory |
| `_is_relative_to(path, root)` | Python 3.9 `is_relative_to` backport |
| `_relativize_source_files(payload, root)` | Rewrites absolute source_file paths to relative |
| `_node_community_map(graph_data)` | Builds `{node_id: community_id}` from raw JSON |
| `_canonical_graph_for_compare(data)` | Sorted/normalised copy for equality diffing |
| `_canonical_topology_for_compare(data)` | Same but also strips community/confidence fields |
| `_topology_from_graph(G)` | Serialises NetworkX graph to node-link dict |
| `_check_shrink(...)` | Refuses to write a graph smaller than existing (anti-corruption) |
| `_report_for_compare(text)` | Strips commit SHA line so reports diff cleanly |
| `_json_text(data)` | Indented JSON with trailing newline |

---

## `affected.py`
Reverse-reachability analysis (blast-radius).

| Function | What it does |
|---|---|
| `resolve_seed(G, query)` | Finds the best-match node for a query string (ID → label → bare name → source → substring) |
| `affected_nodes(G, seed, ...)` | BFS backwards over incoming edges; returns `AffectedHit` list |
| `format_affected(G, query, ...)` | Resolves query, runs BFS, formats result as plain text |
| `load_graph(path)` | Loads `graph.json` as a directed NetworkX graph |
| `_node_label(G, id)` | Node label with ID fallback |
| `_format_location(data)` | `file:line` display string |
| `_normalize_label(label)` | NFC + casefold for locale-safe comparison |
| `_bare_name(label)` | Strips trailing `()` from callable labels |

---

## `llm.py`
LLM adapter for semantic extraction.

| Function/class | What it does |
|---|---|
| `LLMClient` | Base class for LLM provider adapters |
| `AnthropicClient` | Claude API (Anthropic) — primary backend |
| `OpenAIClient` | OpenAI-compatible API — for internal proxies |
| `BedrockClient` | AWS Bedrock (boto3) — for enterprise AWS deployments |
| `get_client(backend)` | Factory: returns correct client from `CODEBASE_ENGINE_LLM_BACKEND` |
| `extract_semantic(file, graph, client)` | Runs LLM extraction on one file chunk, returns nodes+edges |
| `_custom_providers_path()` | Path to user's custom provider config JSON |
| `_load_custom_providers()` | Loads extra provider configs from `~/.codebase-engine/providers.json` |
| `_is_vision_image(path)` | True if file is an image the LLM can process visually |
| `_with_image_notes(content, paths)` | Attaches base64 image data to a prompt |
| `_placeholder_community_labels(communities)` | Returns stub labels when no LLM is available |
| `_merge_two(a, b)` | Merges two extraction dicts (nodes+edges) deduplicating by ID |

---

## `security.py`
URL validation, SSRF guard, safe fetch, path/label sanitisation.

| Function/class | What it does |
|---|---|
| `validate_url(url)` | Rejects non-http(s) schemes and private/localhost IPs |
| `safe_fetch(url)` | Fetches a URL as bytes through the SSRF-guarded opener |
| `safe_fetch_text(url)` | Fetches a URL as UTF-8 text |
| `check_graph_file_size_cap(path)` | Raises if a graph.json exceeds the load size cap |
| `sanitize_label(label)` | Strips HTML special chars from node labels |
| `_resolve_and_validate(host, port)` | DNS-resolves a hostname and blocks private IPs (SSRF guard) |
| `_build_opener()` | Builds urllib opener with SSRF-guarded HTTP(S) handlers |
| `_SSRFGuardedHTTPConnection` | HTTPConnection subclass — validates IP before connecting |
| `_SSRFGuardedHTTPSConnection` | HTTPSConnection subclass — validates IP, preserves SNI |
| `_SSRFGuardedHTTPHandler` | Routes http:// through guarded connection |
| `_SSRFGuardedHTTPSHandler` | Routes https:// through guarded connection |
| `_NoFileRedirectHandler` | Re-validates every redirect target to block open-redirect SSRF |

---

## `ingest.py`
Fetches URLs and saves them as Markdown corpus members.

| Function | What it does |
|---|---|
| `ingest(url, target_dir, ...)` | Fetches a URL and saves to target_dir (dispatches by type) |
| `save_query_result(question, answer, ...)` | Saves a Q&A result as Markdown for graph feedback loop |
| `_detect_url_type(url)` | Classifies URL as tweet/arxiv/github/youtube/pdf/image/webpage |
| `_fetch_tweet(url, ...)` | Fetches tweet via oEmbed API |
| `_fetch_webpage(url, ...)` | Fetches generic webpage, converts to Markdown |
| `_fetch_arxiv(url, ...)` | Fetches arXiv abstract page |
| `_fetch_html(url)` | Raw HTML fetch through security.safe_fetch_text |
| `_html_to_markdown(html, url)` | Strips scripts/styles, converts HTML to Markdown (markdownify or fallback) |
| `_download_binary(url, suffix, dir)` | Downloads a binary file (PDF/image) directly |
| `_safe_filename(url, suffix)` | Turns a URL into a filesystem-safe filename |
| `_yaml_str(s)` | Escapes a string for YAML double-quoted scalar embedding |

---

## `transcribe.py`
Transcribes video/audio to text using local Whisper (no cloud API).

| Function | What it does |
|---|---|
| `transcribe(path, output_dir, ...)` | Transcribes one file/URL; returns path to .txt transcript |
| `transcribe_all(files, ...)` | Transcribes a list of files, returns transcript paths |
| `download_audio(url, output_dir)` | Downloads audio-only stream from a URL via yt-dlp |
| `build_whisper_prompt(god_nodes)` | Builds a domain hint for Whisper from corpus god nodes |
| `is_url(path)` | True if the string looks like a URL |
| `_model_name()` | Returns Whisper model name from env var |
| `_get_whisper()` | Imports WhisperModel with helpful ImportError if missing |
| `_get_yt_dlp()` | Imports yt_dlp with helpful ImportError if missing |

---

## `cache.py`
Per-file extraction cache keyed on content hash.

| Function | What it does |
|---|---|
| `get_cached(path, root)` | Returns cached extraction dict for a file, or None on miss |
| `set_cached(path, root, data)` | Writes extraction dict to cache (JSON file) |
| `cache_key(path)` | SHA-256 hash of file content — cache key |
| `_stat_index_file(root)` | Path to `codebase-out/cache/stat-index.json` |
| `_ensure_stat_index(root)` | Lazy-loads the stat index from disk; registers atexit flush |
| `_flush_stat_index()` | Atomically writes stat-index to disk using temp-file + os.replace |

---

## `dedup.py`
Cross-file semantic deduplication of nodes.

| Function/class | What it does |
|---|---|
| `dedup_nodes(nodes, edges, ...)` | Full dedup pipeline: MinHash LSH candidates → Jaro-Winkler filter → union-find merge |
| `_make_minhash(text)` | Builds MinHash sketch from char-4-shingles |
| `_is_variant_pair(a, b)` | True if two short labels are model/SKU variants (same stem) |
| `_short_label_blocked(a, b, score)` | Blocks fuzzy merge for short labels unless single-char substitution |
| `_numeric_tokens_differ(a, b)` | True if labels differ in their embedded digit sequences |
| `_crossfile_fileanchored_blocked(...)` | Blocks merging of rationale/document nodes across files |
| `_pick_winner(nodes)` | Picks canonical survivor: prefers no chunk suffix, then shorter ID |
| `_UF` | Path-compressed union-find for grouping duplicate node IDs |
| `_score(n)` | (inner) Sort key for winner selection |

---

## `ids.py`
Deterministic node-ID normalisation.

| Function | What it does |
|---|---|
| `normalize_id(id)` | Normalises a raw node ID to a stable canonical form |
| `stable_node_id(label, source_file, file_type)` | Generates a stable ID from node attributes |

---

## `manifest.py`
Thin re-export shim — `from codebase_engine.manifest import save_manifest` works without
knowing that the implementation lives in `detect.py`.

---

## `manifest_ingest.py`
Ingests package manifests (package.json, pyproject.toml, go.mod, pom.xml) as dependency nodes.

| Function | What it does |
|---|---|
| `ingest_manifests(files, root)` | Entry point: finds manifest files and extracts package + dep nodes |
| `is_package_manifest_path(path)` | True if a path is a recognised package manifest |
| `_parse_apm(text)` | Parses apm.yml (uses PyYAML or fallback) |
| `_parse_pyproject(text)` | Parses pyproject.toml (PEP 621 + Poetry) |
| `_parse_gomod(text)` | Parses go.mod for module name and require dependencies |
| `_parse_pom(text)` | Parses Maven pom.xml for artifactId + dependencies |

---

## `mcp_ingest.py`
Ingests MCP configuration files as tool/server nodes.

| Function | What it does |
|---|---|
| `ingest_mcp_configs(files, root)` | Finds MCP config files and extracts server/tool nodes |

---

## `scip_ingest.py`
Ingests SCIP JSON (language-server-generated precise call graphs).

| Function | What it does |
|---|---|
| `ingest_scip(path, root)` | Loads a SCIP JSON file and emits nodes+edges for all defined symbols |

---

## `cargo_introspect.py`
Rust workspace crate dependency extraction.

| Function | What it does |
|---|---|
| `introspect_cargo(root)` | Returns crate nodes + internal `crate_depends_on` edges from Cargo.toml files |
| `_load_toml(path)` | Parses TOML using tomllib (3.11+) or tomli backport |
| `_member_manifest_paths(root, data)` | Expands workspace.members globs to Cargo.toml paths |

---

## `pg_introspect.py`
PostgreSQL schema introspection.

| Function | What it does |
|---|---|
| `introspect_pg(dsn, root)` | Connects via psycopg3, reads information_schema, returns table/column/FK nodes+edges |

---

## `global_graph.py`
Cross-repo graph registry in `~/.codebase-engine/`.

| Function | What it does |
|---|---|
| `global_add(source_path, tag)` | Merges a repo graph into the global graph; skips if unchanged |
| `global_remove(tag)` | Removes all nodes for a repo from the global graph |
| `global_list()` | Returns the manifest repos dict |
| `global_path()` | Path to `~/.codebase-engine/global-graph.json` |
| `_load_manifest()` | Loads manifest JSON; backs up on parse failure |
| `_save_manifest(manifest)` | Persists manifest to `~/.codebase-engine/global-manifest.json` |
| `_load_global_graph()` | Loads global-graph.json as NetworkX graph |
| `_save_global_graph(G)` | Serialises NetworkX graph to global-graph.json |
| `_file_hash(path)` | 16-char SHA-256 fingerprint for change detection |

---

## `hooks.py`
Git hook integration.

| Function | What it does |
|---|---|
| `install_hooks(path)` | Installs post-commit and post-checkout hooks in a git repo |
| `uninstall_hooks(path)` | Removes codebase-engine lines from hook scripts |
| `hooks_status(path)` | Returns installation status of both hooks |
| `_check(name, marker)` | (inner) Reports installed/not-installed for one hook file |

---

## `affected.py` → see earlier section

---

## `symbol_resolution.py`
Resolves import paths and call targets across file boundaries.

| Function | What it does |
|---|---|
| `resolve_import(source_file, import_path, root)` | Maps an import string to its likely source file |
| `resolve_call_target(call_name, source_file, G)` | Finds the graph node most likely to be the call target |
| `_file_node_id_for_path(path, root)` | Returns the node ID for a file path node |

---

## `diagnostics.py`
Read-only graph health checks (no mutations).

| Function | What it does |
|---|---|
| `scan_extraction_quality(data)` | Checks a single extraction dict for schema violations |
| `scan_producer_suppression_sites(path)` | Finds `seen_*` suppression sets in an extractor file |
| `scan_duplicate_edges(data)` | Counts exact/variant duplicate edges |
| `_safe_text(value)` | Coerces any value to a string |
| `_edge_list(data)` | Returns edge list (accepts 'edges' or 'links' key) |
| `_node_ids(data)` | Set of non-null node IDs |
| `_canonical_edge(edge)` | Normalises edge to canonical dict form |
| `_exact_signature(edge)` | Deterministic JSON signature for dedup |
| `_count_extra(counter)` | Total extra duplicate occurrences |
| `_variant_group_count(...)` | Groups with more than one distinct value for a field |
| `_tuple_arity_from_annotation(line)` | Parses tuple arity from a type annotation line |

---

## `semantic_cleanup.py`
Converts sentence-like rationale nodes into node attributes.

| Function | What it does |
|---|---|
| `cleanup_semantic_fragments(nodes, edges)` | Entry point: applies all cleanup passes |
| `validate_semantic_fragment(fragment)` | Schema-checks a raw semantic extraction fragment |
| `_validate_semantic_id(errors, field, value)` | Validates a single node ID field |

---

## `validate.py`
Schema validation for raw extraction JSON.

| Function | What it does |
|---|---|
| `validate_extraction(data)` | Returns list of error strings; empty = valid |

---

## `querylog.py`
Append-only JSONL query log.

| Function | What it does |
|---|---|
| `log_query(kind, question, corpus, ...)` | Appends one JSONL record to the log; never raises |
| `nodes_from_result(result)` | Parses 'N nodes found' count from a result string |
| `_log_path()` | Returns log file path or None if logging is disabled |
| `_log_responses()` | True if full response text should be logged |

---

## `benchmark.py`
Token-reduction benchmark comparing graph-query vs raw-file context.

| Function | What it does |
|---|---|
| `run_benchmark(G, questions, ...)` | Runs benchmark: estimates tokens for query vs raw-file approaches |
| `_estimate_tokens(text)` | Estimates token count from character length |
| `_query_subgraph_tokens(G, question)` | BFS from best-matching nodes; estimates subgraph context tokens |

---

## `dedup.py` → see earlier section

---

## `multigraph_compat.py`
Runtime compatibility probes for NetworkX `MultiDiGraph` API across versions.

| Function | What it does |
|---|---|
| `probe_multigraph_capabilities()` | Runs all probes, returns cached `MultigraphCapabilityResult` |
| `require_multigraph_capabilities()` | Like probe but raises `RuntimeError` if any check fails |
| `_check(name, func)` | Wraps one probe function in a `CapabilityCheck` dataclass |
| `_build_probe_graph()` | Minimal two-node probe graph |
| `_probe_keyed_parallel_edges()` | Checks parallel edges with distinct keys are preserved |
| `_probe_node_link_round_trip()` | Checks serialise → deserialise round-trip fidelity |
| `_probe_duplicate_key_overwrite_semantics()` | Checks that duplicate-key add overwrites |
| `_probe_reserved_key_attr_rejected()` | Documents Python's duplicate-kwarg TypeError guarantee |
| `_probe_remove_edges_from_two_tuple_semantics()` | Checks 2-tuple removes exactly one edge |
| `_probe_to_undirected_preserves_multigraph_type()` | Checks to_undirected() returns MultiGraph |

---

## `file_slice.py`
Extracts line-range slices from source files for context windows.

| Function | What it does |
|---|---|
| `slice_file(path, start_line, end_line)` | Returns lines start..end from a file |
| `slice_node(G, node_id)` | Returns the source slice for a graph node using its source_location |

---

## `_minhash.py`
Datasketch-compatible MinHash + LSH (no scipy dependency).

| Class/Function | What it does |
|---|---|
| `MinHash` | MinHash sketch — `update(bytes)` hashes one token |
| `MinHashLSH` | Band-hashing LSH — `insert(key, mh)` and `query(mh)` |
| `_mh_coeffs(num_perm)` | Cached (a, b) coefficient arrays for the hash family |
| `_optimal_lsh_params(threshold, num_perm)` | Finds (bands, rows) minimising FP+FN error |
| `_lsh_integrate(f, lo, hi)` | Numerical integration replacing scipy.integrate.quad |

---

## `callflow_html.py`
Renders interactive call-flow HTML from a subgraph.

| Function | What it does |
|---|---|
| `build_callflow(G, root_node, depth)` | Extracts a call-flow subgraph rooted at a node |
| `emit_callflow_html(subgraph, title)` | Renders the subgraph as interactive HTML |
| `_community_text(communities, node_id)` | Community label for a node |
| `_keyword_score(node, terms)` | BM25-style relevance score for query ranking |
| `main()` | CLI entry for standalone invocation |

---

## `tree_html.py`
Renders D3 collapsible-tree HTML from the graph's file structure.

| Function | What it does |
|---|---|
| `build_tree(graph, root, max_children)` | Builds `{name, total_count, children}` hierarchy from graph |
| `emit_html(tree, title, header)` | Renders tree dict to self-contained D3 HTML |
| `write_tree_html(graph_path, output_path)` | Load graph.json → build tree → write HTML |
| `_common_root(paths)` | Longest common directory prefix of a path list |
| `_make_truncation_leaf(extra)` | `(+N more)` placeholder leaf node |
| `_ensure_dir(path)` | (inner) Creates or returns the tree node for a directory |
| `_finalise(node)` | (inner) Sorts children and propagates total_count upward |

---

## `pg_introspect.py`
PostgreSQL schema → knowledge graph nodes.

| Function | What it does |
|---|---|
| `introspect_pg(dsn, root)` | Reads information_schema + pg_indexes via psycopg3; returns table/column/FK nodes+edges |

---

## Key Data Flows

```
detect()
  → files: {code: [...], document: [...], ...}

extract(files)
  → [{nodes:[...], edges:[...]}, ...]   # one dict per file

build_from_json(payloads)
  → nx.MultiDiGraph G                   # deduplicated, cross-file edges resolved

cluster(G)
  → communities: {cid: [node_ids]}

analyze.god_nodes(G)         → [{label, degree}, ...]
analyze.surprising_connections(G, communities) → [{source, target, ...}, ...]
analyze.suggest_questions(G, communities, ...)  → [{question, why}, ...]

report.generate(G, communities, ...)
  → GRAPH_REPORT.md content (str)

export.to_json(G, communities, path)   → graph.json
export.to_html(G, communities, path)   → graph.html
export.to_canvas(G, communities, path) → graph.canvas
export.to_obsidian(G, communities, dir)→ _COMMUNITY_*.md + per-node .md files
```
