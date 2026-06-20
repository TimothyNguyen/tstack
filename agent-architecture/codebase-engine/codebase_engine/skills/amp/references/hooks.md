# codebase-engine reference: commit hook and native AGENTS.md integration

Load this when the user asked to install the post-commit hook or wire codebase-engine into a project's AGENTS.md.

## For git commit hook

Install a post-commit hook that auto-rebuilds the graph after every commit. No background process needed - triggers once per commit, works with any editor.

```bash
codebase-engine hook install    # install
codebase-engine hook uninstall  # remove
codebase-engine hook status     # check
```

After every `git commit`, the hook detects which code files changed (via `git diff HEAD~1`), re-runs AST extraction on those files, and rebuilds `graph.json` and `GRAPH_REPORT.md`. Doc/image changes are ignored by the hook - run `/codebase-engine --update` manually for those.

If a post-commit hook already exists, codebase-engine appends to it rather than replacing it.

---

## For native AGENTS.md integration

Run once per project to make codebase-engine always-on in Amp sessions:

```bash
codebase-engine amp install
```

This writes a `## codebase-engine` section to the local `AGENTS.md` that instructs Amp to check the graph before answering codebase questions and rebuild it after code changes. No manual `/codebase-engine` needed in future sessions.

```bash
codebase-engine amp uninstall  # remove the section
```
