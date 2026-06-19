---
name: copilot
version: 0.1.0
description: |
  GitHub Copilot host adapter. Covers graphify graph-first codebase queries
  via Copilot Chat, VS Code instructions injection, and enterprise-safe defaults.
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

# Copilot Host Adapter

Use this adapter when targeting GitHub Copilot (VS Code or GitHub.com) as the
primary agent host.

## Graphify Integration (local, no egress)

Copilot users invoke graphify via `/graphify` in Copilot Chat. The graph is
built once locally and queried from `graphify-out/graph.json`.

For codebase questions in Copilot Chat, prefer graph queries when
`graphify-out/graph.json` exists:

```bash
graphify query "<question>"
graphify path "<SymbolA>" "<SymbolB>"
graphify explain "<Concept>"
```

After modifying code:

```bash
graphify update .     # AST-only, no API cost, no egress
```

**Never run these** — they send code to external LLM APIs:

```bash
graphify extract . --backend claude
graphify extract . --backend gemini
graphify extract . --backend openai
graphify add <external-url>
```

## VS Code / Copilot Instructions Install Block

`graphify install` injects the following block into
`.github/copilot-instructions.md` (or `.vscode/` equivalent). Local file
write only — no external network calls:

```markdown
## graphify

For any question about this repo's architecture, structure, components, or how
to add/modify/find code, your first action should be
`graphify query "<question>"` when `graphify-out/graph.json` exists. Use
`graphify path "<A>" "<B>"` for relationship questions and
`graphify explain "<concept>"` for focused-concept questions.

Triggers: "how do I…", "where is…", "what does … do", "add/modify a
<component>", "explain the architecture", or anything that depends on how
files or classes relate.

If `graphify-out/wiki/index.md` exists, use it for broad navigation. Read
`graphify-out/GRAPH_REPORT.md` only for broad architecture review. Only read
source files when modifying/debugging specific code or the graph is missing.

Type `/graphify` in Copilot Chat to build or update the graph.
```

## Copilot Limitations vs. Claude Code

| Capability | Claude Code | Copilot Chat |
|---|---|---|
| Subagent extraction (`/graphify .`) | Native via skill | Via `/graphify` in chat |
| Graph query (`graphify query`) | Terminal + in-session | Terminal only |
| Tool use (Bash, Read, Grep) | Full | Limited to Copilot tools |
| Policy enforcement | Via enterprise-default.json | Via org Copilot policy |
| `--backend` flag | Blocked by enterprise policy | Blocked by enterprise policy |

## Enterprise Settings

```bash
export GRAPHIFY_QUERY_LOG_DISABLE=1
export GRAPHIFY_MAX_GRAPH_BYTES=1GB
```

## Steps

1. Confirm the task requires Copilot-specific context or the user is in a
   Copilot Chat session.
2. Check `graphify-out/graph.json` before reading source files.
3. Use graph queries for codebase questions.
4. Fall back to Grep + Read when graph absent.
5. Preserve policy requirements, no-egress defaults, and scoped commit rules.
6. Keep source skill templates as the source of truth for skill behavior.
7. Report any host limitations or unsupported tool behavior.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
