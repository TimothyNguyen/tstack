# Verification

Use this after install. Keep it short.

## Checklist

- `npx agent-architecture doctor` passes
- `.agent/generated/registry.json` exists
- session-start hook exists
- Claude, Codex, or Copilot opens without bootstrap errors
- one agent can invoke one skill successfully

## Minimal Smoke Test

```text
/swe

Use the /health skill and confirm skill loading works.
```

## If Using MCPs

Also verify:

- credentials are set
- MCP appears connected in doctor output
- one MCP-backed workflow works

See [MCP_INTEGRATION.md](MCP_INTEGRATION.md).
