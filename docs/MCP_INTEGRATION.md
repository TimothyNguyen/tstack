# MCP Integration Guide

Wire Model Context Protocols (MCPs) to extend agent capabilities without rebuilding skills.

## What Are MCPs?

MCPs are protocols that connect agents to external data sources and tools:

```
Agent → MCP Client → MCP Server → Database / API / Tool
```

Examples:
- `mcp-server-postgres`: Query and modify databases
- `mcp-server-github`: Access GitHub issues, PRs, repos
- `mcp-server-slack`: Read/send Slack messages
- Docker MCP: Manage containers and images

## Installation & Configuration

### Step 1: Add MCP to `.agent-config.json`

```json
{
  "private": true,
  "hosts": ["claude", "codex"],
  "agents": ["swe", "qa-agent"],
  "mcps": [
    {
      "name": "database",
      "command": "uvx",
      "args": ["mcp-server-postgres"],
      "credentialEnvVars": ["DATABASE_URL", "PGHOST", "PGPORT", "PGUSER", "PGPASSWORD"]
    },
    {
      "name": "github",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "credentialEnvVars": ["GITHUB_TOKEN"]
    }
  ]
}
```

### Step 2: Set Environment Variables

```bash
# Database MCP
export DATABASE_URL="postgresql://user:pass@localhost/dbname"
export PGHOST="localhost"
export PGPORT="5432"
export PGUSER="user"
export PGPASSWORD="pass"

# GitHub MCP
export GITHUB_TOKEN="ghp_your_token_here"
```

### Step 3: Reinstall

```bash
npx agent-architecture install --upgrade
```

Verify:
```bash
npx agent-architecture doctor
# ✓ Database MCP connected
# ✓ GitHub MCP connected
```

## Common MCPs

### Database: PostgreSQL

```json
{
  "name": "postgres",
  "command": "uvx",
  "args": ["mcp-server-postgres"],
  "credentialEnvVars": ["DATABASE_URL"]
}
```

**Capabilities:**
- `query_schema`: Inspect tables, columns, constraints
- `query_sql`: Execute SELECT queries
- `execute_sql`: Execute INSERT/UPDATE/DELETE (with warnings)
- `get_table_schema`: Get CREATE TABLE definition

**Example usage in skill:**
```
/swe

Explain the user authentication schema using the database MCP.
Show tables, relationships, and key constraints.
```

Agent queries: `database.query_schema()`
→ Returns table definitions for auth, users, sessions

### GitHub Integration

```json
{
  "name": "github",
  "command": "npx",
  "args": ["@modelcontextprotocol/server-github"],
  "credentialEnvVars": ["GITHUB_TOKEN"]
}
```

**Capabilities:**
- `list_issues`: Search open/closed issues
- `get_issue`: Read issue details + comments
- `create_issue`: Create new issue
- `list_pull_requests`: Search PRs
- `get_pull_request`: Read PR details
- `create_pull_request`: Create new PR
- `search_repositories`: Find repos by topic
- `get_repository`: Get repo metadata

**Example usage in skill:**
```
/swe

Find unresolved bugs in open issues related to export feature.
```

Agent queries: `github.list_issues(query="label:bug label:export")`
→ Returns 3 open bugs with details

### Docker Operations

```json
{
  "name": "docker",
  "command": "npx",
  "args": ["@modelcontextprotocol/server-docker"],
  "credentialEnvVars": []
}
```

**Capabilities:**
- `list_containers`: List running/stopped containers
- `get_container`: Get container details + logs
- `execute_command`: Run command inside container
- `list_images`: List built images
- `build_image`: Build Docker image

**Example usage:**
```
/swe

Check if postgres database is running. 
Show me the current error logs.
```

Agent queries: `docker.list_containers()`
→ Returns postgres container is running, shows logs

### Slack Communication

```json
{
  "name": "slack",
  "command": "npx",
  "args": ["@modelcontextprotocol/server-slack"],
  "credentialEnvVars": ["SLACK_BOT_TOKEN"]
}
```

**Capabilities:**
- `get_messages`: Read messages from channel
- `send_message`: Post message to channel
- `get_channels`: List channels
- `get_users`: List workspace users

**Example usage in release workflow:**
```
/release-agent

Notify #engineering channel that v2.1.0 is shipping in 30 minutes.
```

Agent: `slack.send_message(channel="engineering", text="v2.1.0 release → ...)")`

## Skills That Use MCPs

### `stack-postgres` Skill

```
/swe

The export feature needs to query user preferences.
Design the schema using database MCP.
```

Skill workflow:
1. Uses `stack-postgres` skill
2. Queries `postgres` MCP for existing schema
3. Proposes new tables/columns
4. Tests queries against actual database

### `systematic-debugging` + Database

```
/swe

Login keeps timing out. Debug using database MCP.
```

Skill workflow (via systematic-debugging):
1. Evidence: Query database for slow queries
   → `database.query_sql("SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10")`
2. Hypothesis: Login query is slow
3. Testing: Check indexes, query plan
   → `database.query_sql("EXPLAIN ANALYZE SELECT * FROM users WHERE email = ..."`
4. Fix: Add index on email column

### `investigate` + GitHub

```
/swe

User reported: "Can't export data. Works for admin but not regular users."
Investigate using GitHub MCP to find similar issues.
```

Skill workflow:
1. Search GitHub issues: `github.list_issues(query="label:export label:permission")`
2. Find related issue #427 (permission bug)
3. Discover root cause from discussion
4. Apply same fix

## Security & Credentials

### Principles

- **Explicit:** Credentials specified via env vars only
- **Scoped:** Each MCP declares which env vars it needs
- **Audited:** All MCP calls logged locally
- **Policy-gated:** Read-only by default; writes require skill discipline

### Environment Variable Safety

```bash
# ✓ GOOD: Set before running agent
export DATABASE_URL="postgresql://..."
export GITHUB_TOKEN="ghp_..."
/swe

# ✓ GOOD: Set in .env file (committed to .gitignore)
cat > .env.local <<EOF
DATABASE_URL=postgresql://...
GITHUB_TOKEN=ghp_...
EOF
export $(cat .env.local | xargs)
/swe

# ✗ BAD: Hardcoded in config
{
  "mcps": [{
    "name": "database",
    "connectionString": "postgresql://user:EXPOSED_PASS@host/db"  // ✗ NEVER
  }]
}

# ✗ BAD: Committed to repo
git add .agent-config.json  # containing credentials ✗
```

### Policy: Read-Only Default

Most MCPs are read-only:
- Database queries (SELECT) — allowed
- Database modifications (INSERT/UPDATE) — skill discipline required
- GitHub read issues — allowed
- GitHub create issues — skill discipline required

When skill invokes write operation:

```
/systematic-debugging

I found the root cause: session pool exhausted.
I need to run this migration to increase pool size.

CREATE TABLE sessions (...);
ALTER TABLE users ...;
```

Skill presents human-readable confirmation:
```
This skill wants to execute 2 database migrations.
Your approval: type "yes" to proceed
```

Agent must get explicit approval before mutations.

## Custom MCP Development

Build MCPs for domain-specific tools:

### Template: Custom MCP Server

```javascript
// mcp-server-example.mjs
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  TextContent,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server({
  name: "example",
  version: "1.0.0",
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "check_database_health",
      description: "Check if database is healthy",
      inputSchema: {
        type: "object",
        properties: {
          database: { type: "string" },
        },
        required: ["database"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "check_database_health") {
    const db = request.params.arguments.database;
    // Implement health check
    return {
      content: [
        new TextContent({
          text: `Database ${db} is healthy: 99.9% uptime`,
        }),
      ],
    };
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Register Custom MCP

```json
{
  "mcps": [{
    "name": "example",
    "command": "node",
    "args": ["./mcp-server-example.mjs"],
    "credentialEnvVars": []
  }]
}
```

## Troubleshooting

### "MCP connection failed"

```bash
# Test MCP manually
npx agent-architecture doctor --verbose

# Output:
# MCP: postgres — CONNECTED
# MCP: github — FAILED (GITHUB_TOKEN not set)

# Fix: set env var and retry
export GITHUB_TOKEN="ghp_..."
npx agent-architecture doctor
```

### "Permission denied" on database

Likely MCP user doesn't have permission for operation:

```bash
# Check MCP user
echo "SELECT current_user;" | psql $DATABASE_URL

# Grant permissions
psql $DATABASE_URL <<EOF
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO mcp_user;
EOF
```

### "Skill can't access MCP"

MCPs are globally available to all agents/skills:

```javascript
// In any skill:
// If postgres MCP is registered, all agents can use it

/swe
// Can query database

/qa-agent
// Can also query database

/orchestrate
// Can also query database
```

If MCP not found:
1. Check `.agent-config.json` has MCP listed
2. Check env vars are set
3. Run `npx agent-architecture doctor`
4. Reinstall: `npx agent-architecture install --upgrade`

## MCP + Skill Patterns

### Pattern 1: Diagnostic + Fix

```
Database: Slow query detected
Skill: stack-postgres + systematic-debugging

1. /systematic-debugging
   → Query database for slow queries
   → Identify missing index
   
2. /stack-postgres
   → Design index definition
   → Test query plan
   
3. /commit
   → Create atomic commit with index creation
```

### Pattern 2: Cross-System Issue

```
GitHub issue: "Export fails for users in EU"
MCPs: github, database, docker

1. /investigate
   → GitHub: Read issue, find error message
   → Database: Query EU users, export logs
   → Docker: Check container timezone config
   
2. Root cause identified
3. /receiving-code-review
   → Fix applied
```

### Pattern 3: Parallel Work Coordination

```
/orchestrate

Release preparation: need to update docs, close issues, merge PRs.
Parallelize using MCPs.

1. swe agent
   → GitHub MCP: Close related issues
   
2. pm agent
   → GitHub MCP: Create release issue
   
3. design-agent
   → Query docs via MCP (if available)
   
All agents coordinate via /orchestrate → /autoplan
```

## Next Steps

- Configure your first MCP: `npx agent-architecture install --upgrade`
- Try `database` MCP with `/swe` for codebase queries
- Try `github` MCP with `/qa-agent` for issue discovery
- Read [WORKFLOWS.md](./WORKFLOWS.md) for skill + MCP patterns
