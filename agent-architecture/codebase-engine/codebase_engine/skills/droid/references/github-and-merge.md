# codebase-engine reference: GitHub clone and cross-repo merge

Load this when the user passed one or more `https://github.com/...` URLs, or named several local subfolders to merge into one graph.

### Step 0 - Clone GitHub repo(s) (only if a GitHub URL was given)

**Single repo:**
```bash
LOCAL_PATH=$(codebase-engine clone <github-url> [--branch <branch>])
# Use LOCAL_PATH as the target for all subsequent steps
```

**Multiple repos (cross-repo graph):**
```bash
# Clone each repo, run the full pipeline on each, then merge
codebase-engine clone <url1>   # → ~/.codebase-engine/repos/<owner1>/<repo1>
codebase-engine clone <url2>   # → ~/.codebase-engine/repos/<owner2>/<repo2>
# Run /codebase-engine on each local path to produce their graph.json files
# Then merge:
codebase-engine merge-graphs \
  ~/.codebase-engine/repos/<owner1>/<repo1>/codebase-out/graph.json \
  ~/.codebase-engine/repos/<owner2>/<repo2>/codebase-out/graph.json \
  --out codebase-out/cross-repo-graph.json
```

codebase-engine clones into `~/.codebase-engine/repos/<owner>/<repo>` and reuses existing clones on repeat runs. Each node in the merged graph carries a `repo` attribute so you can filter by origin.

**Multiple local subfolders (monorepo or multi-service layout):**

The skill pipeline writes all intermediate and final outputs to `codebase-out/` in the current working directory. Running the skill on each subfolder separately will clobber the same output dir. Instead, use the CLI directly for each subfolder — it places `codebase-out/` *inside* the scanned path:

```bash
codebase-engine extract ./core/     # → ./core/codebase-out/graph.json
codebase-engine extract ./service/  # → ./service/codebase-out/graph.json
codebase-engine extract ./platform/ # → ./platform/codebase-out/graph.json
# Add --backend gemini|kimi|openai|deepseek|claude-cli depending on which API key you have set

# Then merge at the project root:
codebase-engine merge-graphs \
  ./core/codebase-out/graph.json \
  ./service/codebase-out/graph.json \
  ./platform/codebase-out/graph.json \
  --out codebase-out/graph.json
```

Once `codebase-out/graph.json` exists, the fast path above takes over: any codebase question runs `codebase-engine query` directly on the merged graph — no re-extraction, no size gate.
