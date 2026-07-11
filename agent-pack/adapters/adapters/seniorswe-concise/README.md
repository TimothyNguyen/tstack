# Seniorswe-Concise Adapter

Optional Seniorswe-Concise runtime integration for hosts that support hooks or MCP.

The adapter is disabled by default. It uses only local files and writes state to
`.agent-pack/state/seniorswe-concise` unless the host provides `PLUGIN_DATA` or
`COPILOT_PLUGIN_DATA`. External state paths require
`SENIORSWE_CONCISE_ALLOW_EXTERNAL_STATE=1`.

## Entrypoints

- `hooks/seniorswe-concise-activate.cjs`: session-start instruction injection.
- `hooks/seniorswe-concise-mode-tracker.cjs`: `/seniorswe-concise` mode tracking.
- `mcp/index.js`: optional MCP prompt/tool server.

The MCP package owns its SDK dependencies so the core package stays dependency
free.
