# mcp-atlassian Enterprise Safety

Use this reference when configuring or reviewing `mcp-atlassian` for the `atlassian-docs` skill.

## Reviewed Source

- Repository: `https://github.com/sooperset/mcp-atlassian`
- Local clone: `mcp-atlassian/`
- Reviewed commit: `ba72540`

## Safe As

- Optional external MCP connector.
- Read-only product documentation source.
- Explicitly approved Atlassian Cloud or Data Center egress.
- Separate process managed by the user, profile, or enterprise connector registry.

## Not Safe As

- A `codebase-engine` core dependency.
- A default-enabled skill pack dependency.
- A write-capable Jira or Confluence automation surface.
- A credential, OAuth, browser-session, or attachment-management helper.

## Required Defaults

```text
READ_ONLY_MODE=true
ATLASSIAN_OAUTH_PROXY_ENABLE=false
JIRA_SSL_VERIFY=true
CONFLUENCE_SSL_VERIFY=true
MCP_ALLOWED_URL_DOMAINS=<approved Atlassian domains only>
```

Prefer a narrow `ENABLED_TOOLS` allowlist containing only Confluence/Jira search and get/read tools needed for the question. Avoid broad toolsets.

Validate proposed profiles with:

```bash
python atlassian-docs/scripts/validate_mcp_atlassian_profile.py --env-file <profile.env> --print-summary
```

## Reviewed Safety Controls

- `READ_ONLY_MODE=true` blocks write tools through the server and write-access decorator.
- Header-provided Jira and Confluence URLs are validated for SSRF risk.
- Logging masks common sensitive headers such as authorization and cookies.
- Docker runtime uses a non-root user.
- Helm security context drops capabilities and disables privilege escalation.

## Reviewed Risks

- The default examples are not read-only unless `READ_ONLY_MODE=true` is set.
- OAuth setup can persist tokens through keyring and fallback files under the user home.
- Optional OAuth proxy and HTTP transport increase exposure and require separate gateway controls.
- SSL verification can be disabled by environment variables and must remain enabled in enterprise use.
- Attachment upload tools can read arbitrary local file paths and upload them to Atlassian if enabled.
- Toolsets can expose write tools unless constrained by read-only mode and a tool allowlist.

## Recommended Tool Policy

Allow only:

- Confluence search.
- Confluence page read/get.
- Jira search.
- Jira issue read/get.

Deny:

- Jira create/update/delete/comment/transition/worklog/link/watch operations.
- Confluence create/update/delete/comment/label/move operations.
- Attachment upload/download/read-file operations.
- OAuth setup, OAuth proxy configuration, and credential discovery.

## MCP Best Practices

- Run the connector as a separate MCP server process, not inside `codebase-engine`.
- Prefer stdio transport inside a trusted agent boundary. If HTTP is required, put it behind enterprise auth, TLS, request logging, and network policy.
- Keep egress default-deny and allow only approved Atlassian domains.
- Inject credentials through approved secret management. Do not let the agent read keyring, token files, browser cookies, or session stores.
- Record audit events with tool name, Atlassian object key, URL, and decision outcome. Do not log prompt bodies, credentials, tokens, cookies, or document bodies.
- Keep read-only Jira/Confluence scopes. Avoid write scopes and `offline_access` unless a separate approved workflow requires them.
- Re-run the profile validator after connector upgrades because upstream defaults may change.

## Answering Rules

- Retrieve the smallest relevant set of pages or issues.
- Do not quote secrets, credentials, private customer data, or large document excerpts.
- Prefer concise summaries with source titles, issue keys, and URLs.
- If Atlassian content conflicts with local code, say so and identify both sources.
