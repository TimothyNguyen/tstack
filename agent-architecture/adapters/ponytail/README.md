# Ponytail Adapter

Optional Ponytail runtime integration for hosts that support hooks or MCP.

The adapter is disabled by default. It uses only local files and writes state to
`.architecture-agent/state/ponytail` unless the host provides `PLUGIN_DATA` or
`COPILOT_PLUGIN_DATA`. External state paths require
`PONYTAIL_ALLOW_EXTERNAL_STATE=1`.

## Entrypoints

- `hooks/ponytail-activate.cjs`: session-start instruction injection.
- `hooks/ponytail-mode-tracker.cjs`: `/ponytail` mode tracking.
- `mcp/index.js`: optional MCP prompt/tool server.

The MCP package owns its SDK dependencies so the core package stays dependency
free.
