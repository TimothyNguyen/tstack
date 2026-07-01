# MCP Integration

Read this only if you need external tool/server integration.

## Minimal Pattern

Add MCPs to `.agent-config.json`:

```json
{
  "mcps": [
    {
      "name": "github",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "credentialEnvVars": ["GITHUB_TOKEN"]
    }
  ]
}
```

Then:

```bash
npx agent-architecture install --upgrade
npx agent-architecture doctor
```

## Typical MCPs

- GitHub
- Postgres
- Docker
- Slack

## Related

- Install flow: [INSTALLATION.md](INSTALLATION.md)
- Verify flow: [VERIFICATION.md](VERIFICATION.md)
