# Privacy-First Adapter Contract

Adapters and MCP servers are optional boundaries around the core skill pack.
They must preserve the enterprise default posture.

## Defaults

- No public telemetry.
- No public update checks.
- No public tunnels.
- No public web scraping.
- No cookie/session import.
- No credential reads.
- No global host config mutation.
- No raw prompt, source, secret, customer data, or full file-content export.

## Adapter Requirements

Every adapter must document:

- Runtime dependency and install mode.
- `adapters/registry.json` id, skill, module, runtime, egress, writes, and state.
- Local state paths.
- External network behavior.
- Tool read/write surface.
- Approval requirements.
- Audit event shape.
- Secret and data redaction rules.
- Disable/uninstall path.

## MCP Requirements

MCP servers must default to:

- `readOnlyHint: true` for instruction or context tools.
- `openWorldHint: false` unless an approved connector requires otherwise.
- Narrow JSON schemas.
- No credential acquisition.
- No third-party egress without explicit profile and policy approval.

## Event Requirements

AG-UI or other UI adapters must emit local events first and transform at the
adapter boundary. Events may include paths, action categories, policy decisions,
and summaries. Events must not include secrets, full prompts, raw datasets, or
full file contents.

## Review Gate

New adapters require `security-review`, `adapter-mcp` or the matching adapter
skill, and a focused test that proves unsafe defaults remain disabled.
