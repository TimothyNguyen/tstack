# atlassian-docs MCP Servers

Three FastMCP 3 servers: **Jira**, **Confluence**, **Bitbucket**.
Each runs as an independent process over stdio.

## Install

```bash
pip install -e .
# or
uv pip install -e .
```

## Start servers

```bash
mcp-jira        # Jira MCP server (stdio)
mcp-confluence  # Confluence MCP server (stdio)
mcp-bitbucket   # Bitbucket MCP server (stdio)
```

## Environment variables

### Jira (`JIRA_MCP_*`)

| Variable | Required | Description |
|---|---|---|
| `JIRA_MCP_URL` | Yes | Jira instance URL |
| `JIRA_MCP_TOKEN` | PAT/Cloud | API token or personal access token |
| `JIRA_MCP_EMAIL` | Cloud only | Atlassian account email |
| `JIRA_MCP_USERNAME` | Basic only | Username |
| `JIRA_MCP_PASSWORD` | Basic only | Password |
| `JIRA_MCP_AUTH_TYPE` | No | `pat`, `cloud`, or `basic` (auto-detected) |
| `JIRA_MCP_VERIFY_SSL` | No | `true` (default) |
| `JIRA_MCP_TIMEOUT` | No | Seconds (default 30) |
| `JIRA_MCP_DEFAULT_DETAIL` | No | `summary` (default) or `full` |

### Confluence (`CONFLUENCE_MCP_*`)

| Variable | Required | Description |
|---|---|---|
| `CONFLUENCE_MCP_URL` | Yes | Confluence instance URL |
| `CONFLUENCE_MCP_TOKEN` | PAT/Cloud | API token |
| `CONFLUENCE_MCP_EMAIL` | Cloud only | Atlassian account email |
| `CONFLUENCE_MCP_USERNAME` | Basic only | Username |
| `CONFLUENCE_MCP_PASSWORD` | Basic only | Password |
| `CONFLUENCE_MCP_AUTH_TYPE` | No | `pat`, `cloud`, or `basic` |
| `CONFLUENCE_MCP_VERIFY_SSL` | No | `true` (default) |
| `CONFLUENCE_MCP_TIMEOUT` | No | Seconds (default 30) |
| `CONFLUENCE_MCP_DEFAULT_DETAIL` | No | `summary` (default) or `full` |

### Bitbucket (`BITBUCKET_MCP_*`)

| Variable | Required | Description |
|---|---|---|
| `BITBUCKET_MCP_URL` | Yes | Bitbucket instance URL |
| `BITBUCKET_MCP_TOKEN` | PAT/Cloud | API token |
| `BITBUCKET_MCP_EMAIL` | Cloud only | Atlassian account email |
| `BITBUCKET_MCP_USERNAME` | Basic only | Username |
| `BITBUCKET_MCP_PASSWORD` | Basic only | Password |
| `BITBUCKET_MCP_AUTH_TYPE` | No | `pat`, `cloud`, or `basic` |
| `BITBUCKET_MCP_WORKSPACE` | Cloud only | Workspace slug |
| `BITBUCKET_MCP_VERIFY_SSL` | No | `true` (default) |
| `BITBUCKET_MCP_TIMEOUT` | No | Seconds (default 30) |
| `BITBUCKET_MCP_DEFAULT_DETAIL` | No | `summary` (default) or `full` |

## Auth auto-detection

All three servers share the same logic:

- `EMAIL` set → Cloud mode (Basic auth with `email:token`)
- `USERNAME` + `PASSWORD` → Basic mode
- `TOKEN` only → PAT mode (Bearer)
- Explicit `AUTH_TYPE` overrides detection

## MCP client config (Claude Desktop / Claude Code)

```json
{
  "mcpServers": {
    "jira": {
      "command": "mcp-jira",
      "env": {
        "JIRA_MCP_URL": "https://company.atlassian.net",
        "JIRA_MCP_EMAIL": "user@company.com",
        "JIRA_MCP_TOKEN": "<api-token>"
      }
    },
    "confluence": {
      "command": "mcp-confluence",
      "env": {
        "CONFLUENCE_MCP_URL": "https://company.atlassian.net/wiki",
        "CONFLUENCE_MCP_EMAIL": "user@company.com",
        "CONFLUENCE_MCP_TOKEN": "<api-token>"
      }
    },
    "bitbucket": {
      "command": "mcp-bitbucket",
      "env": {
        "BITBUCKET_MCP_URL": "https://api.bitbucket.org/2.0",
        "BITBUCKET_MCP_EMAIL": "user@company.com",
        "BITBUCKET_MCP_TOKEN": "<api-token>"
      }
    }
  }
}
```
