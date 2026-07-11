# Confluence Env Files

Confluence and Jira MCP profiles live under:

```text
agent-architecture/tool-providers/atlassian-docs/
```

The relevant env files are:

| File | Purpose |
| --- | --- |
| `agent-architecture/tool-providers/atlassian-docs/references/safe-profile.env.example` | Safe read-only profile template. Real URLs and secrets should come from approved secret management. |
| `agent-architecture/tool-providers/atlassian-docs/.env.dummy` | Dummy local placeholder values for examples/tests. Do not put real tokens here. |

Expected variables:

```env
READ_ONLY_MODE=true
ATLASSIAN_OAUTH_PROXY_ENABLE=false
JIRA_SSL_VERIFY=true
CONFLUENCE_SSL_VERIFY=true
MCP_ALLOWED_URL_DOMAINS=atlassian.net
TOOLSETS=default
ENABLED_TOOLS=confluence_search,confluence_get_page,jira_search,jira_get_issue
CONFLUENCE_URL=https://example.atlassian.net/wiki
CONFLUENCE_USERNAME=
CONFLUENCE_API_TOKEN=
JIRA_URL=https://example.atlassian.net
JIRA_USERNAME=
JIRA_API_TOKEN=
```

Use `safe-profile.env.example` as the template. Keep `.env.dummy` non-secret.
