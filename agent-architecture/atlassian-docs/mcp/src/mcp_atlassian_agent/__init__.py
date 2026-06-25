"""
mcp-atlassian-agent — thin launcher shim.

Three servers are bundled here; run each independently:

    mcp-jira        →  jira_mcp_server.server:main
    mcp-confluence  →  confluence_mcp_server.server:main
    mcp-bitbucket   →  bitbucket_mcp_server.server:main

Each server reads its config from environment variables (see README.md).
"""
