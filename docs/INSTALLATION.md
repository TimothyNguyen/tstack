# Agent-Architecture Installation Guide

Install `agent-architecture` skill pack into your project for enterprise-safe agent-based workflows across Claude Code, Codex, and Copilot CLI.

## Quick Start

### Option 1: Auto-Detect Configuration (Recommended)

```bash
# Install to .agent/ directory with default hosts
npx agent-architecture install

# Verify installation health
npx agent-architecture doctor
```

### Option 2: Custom Configuration

```bash
# Create .agent-config.json in project root
cat > .agent-config.json <<EOF
{
  "private": true,
  "hosts": ["claude", "codex"],
  "agents": ["swe", "qa-agent", "spec-agent"],
  "mcps": [
    {
      "name": "codebase",
      "command": "npx",
      "args": ["codebase-engine", "serve"],
      "credentialEnvVars": []
    }
  ]
}
EOF

# Install with custom config
npx agent-architecture install
```

## Installation Options

### Flags

| Flag | Purpose | Example |
|------|---------|---------|
| `--target <dir>` | Install location (default: `.agent/`) | `--target ./.skills` |
| `--hosts <list>` | Target platforms (default: claude,codex,copilot) | `--hosts claude,codex` |
| `--private` | Enterprise-safe mode (no telemetry, no external egress) | `--private` |
| `--dry-run` | Preview without writing files | `--dry-run` |
| `--upgrade` | Upgrade existing installation | `--upgrade` |
| `--doctor` | Verify installation health | `--doctor` |

### Agent Selection

Install only the agents your team uses:

```json
{
  "agents": [
    "swe",
    "qa-agent",
    "spec-agent",
    "pm",
    "design-agent",
    "orchestrate",
    "security",
    "migration",
    "data",
    "cloud",
    "release-agent",
    "interviewer"
  ]
}
```

### MCP Configuration

Wire MCPs (Model Context Protocols) to extend agent capabilities:

```json
{
  "mcps": [
    {
      "name": "database",
      "command": "uvx",
      "args": ["mcp-server-postgres"],
      "credentialEnvVars": ["DATABASE_URL", "PGHOST"]
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

## Installation Location

### Default: `.agent/`

```
project/
├── .agent/
│   ├── agents/                    # Role-based agents
│   │   ├── swe/SKILL.md          # Software Engineer
│   │   ├── qa-agent/SKILL.md     # QA Engineer
│   │   └── ...
│   ├── skills/                    # 102 reusable skills
│   │   ├── brainstorming/
│   │   ├── systematic-debugging/
│   │   ├── receiving-code-review/
│   │   └── ...
│   ├── hooks/                     # Session-start bootstrap
│   │   └── session-start          # Injects using-agent-skills
│   ├── generated/
│   │   ├── registry.json          # Skill-to-agent mappings
│   │   └── skills.index.json      # Skill metadata
│   ├── settings.json              # Host-specific config
│   └── .agent-config.json         # Installation config
```

### Custom Location

```bash
npx agent-architecture install --target ./.brainstorm-skills
```

## After Installation

### 1. Verify Health

```bash
npx agent-architecture doctor
```

Expected output:
```
✓ Skills registry found (102 skills)
✓ All 12 role agents present
✓ Session-start hook configured
✓ MCP connections verified
```

### 2. Open in Claude Code / Codex

The session-start hook automatically injects `using-agent-skills` context into every agent at startup. This teaches agents how to:
- Find and invoke skills via Skill tool
- Query registry for available skills
- Understand agent-to-skill routing
- Apply skill priority and discipline

### 3. Start a Workflow

#### Brainstorming (Orchestrate Agent)

```
/orchestrate

I want to build a feature that lets users export reports in multiple formats.
Let's brainstorm the architecture, UX, and API design.
```

The orchestrate agent:
1. Invokes `brainstorming` skill to facilitate dialogue
2. Queries registry for `spec` and `diagram` skills
3. Routes to spec-agent and design-agent for deep dives
4. Coordinates using `subagent-orchestrator` for parallel work

#### Code Analysis (SWE Agent)

```
/swe

Explain the authentication flow in src/auth.ts
```

The swe agent:
1. Invokes `codebase-engine` to map code structure
2. Uses `health` skill for code quality review
3. Applies `seniorswe-concise` to avoid over-engineering

#### Bug Investigation (SWE Agent)

```
/swe

I found a bug: login fails randomly. Help me systematize the debugging.
```

The swe agent:
1. Invokes `systematic-debugging` skill for structured investigation
2. Uses `investigate` skill for evidence gathering
3. Applies `receiving-code-review` discipline to proposed fixes
4. Uses `verification-before-completion` before marking done

#### Feature Implementation (SWE Agent)

```
/swe

Implement the export feature from the spec we wrote earlier.
Scope it to CSV + PDF formats, 200 lines max.
```

The swe agent:
1. Reads spec from context or files
2. Invokes `seniorswe-concise` for lazy, minimal implementation
3. Uses `commit` skill for atomic, scoped commits
4. Applies `verification-before-completion` checklist

#### Testing & QA (QA Agent)

```
/qa-agent

We just shipped the export feature. Create a test plan.
```

The qa-agent:
1. Invokes `qa` skill for test planning
2. Uses `test` skill for automation (Playwright, etc.)
3. Applies `benchmark` for performance regression detection
4. Uses `canary` for safe rollout monitoring

#### Release (Release Agent)

```
/release-agent

Prepare v2.1.0 release: export feature, three bug fixes, one perf improvement.
```

The release-agent:
1. Invokes `release` skill for release readiness
2. Uses `release-notes` to generate privacy-safe notes
3. Applies `ship` skill for merge/deploy coordination
4. Uses `canary` for phased rollout strategy

## Skill Registry

After installation, query available skills:

```javascript
// In Claude Code or any host environment
import registry from '.agent/generated/registry.json';

// List all skills for swe agent
const sweSkills = registry.byAgent.swe;
// ["brainstorming", "commit", "investigate", "ship", "systematic-debugging", ...]

// Find skills by name
const brainstorm = registry.skills.find(s => s.name === 'brainstorming');
// {
//   name: 'brainstorming',
//   agents: ['orchestrate', 'swe', 'spec-agent'],
//   allowedTools: ['Read', 'Grep', 'Glob', 'Bash'],
//   description: '...'
// }
```

## Environment Variables

Control agent-architecture behavior:

| Variable | Purpose | Default |
|----------|---------|---------|
| `AGENT_ARCHITECTURE_DIR` | Installation directory | `.agent/` |
| `AGENT_ARCHITECTURE_REGISTRY_PATH` | Registry location | `.agent/generated/registry.json` |
| `BRAINSTORM_IDLE_TIMEOUT_MS` | Brainstorm server idle timeout | `14400000` (4h) |
| `BRAINSTORM_HOST` | Brainstorm server bind address | `127.0.0.1` |
| `BRAINSTORM_OPEN` | Auto-open browser on first screen | unset (requires approval) |

## Troubleshooting

### "Skills registry not found"

```bash
# Ensure registry.json was generated during build
ls -la .agent/generated/registry.json

# If missing, rebuild
npx agent-architecture install --upgrade
```

### "Session-start hook not firing"

**Claude Code:**
- Check `.claude/hooks/session-start` exists and is executable
- Verify hooks are enabled: Claude Code → Settings → Hooks

**Codex:**
- Check `.codex/hooks/session-start` exists
- Verify Codex hooks setting

**Copilot CLI:**
- Check hooks are configured in Copilot settings
- Verify `$COPILOT_CLI=1` environment variable

### "MCP connection failed"

```bash
# Test MCP manually
npx agent-architecture doctor --verbose

# Check credentials
echo $DATABASE_URL   # verify env vars are set
echo $GITHUB_TOKEN
```

## Security & Enterprise Compliance

- ✓ No public telemetry
- ✓ No external egress by default
- ✓ No cookie import, credential reads, or scraping
- ✓ Policy-gated tool use (read-only by default)
- ✓ Private mode: no public tunnels, no update checks
- ✓ All MCPs require explicit credential env vars
- ✓ Session files owner-only (brainstorm server)

## Next Steps

1. Run `/orchestrate` to start a skill-guided workflow
2. Run `/swe` to analyze code with skill guidance
3. Read [SKILL_INVOCATION.md](./SKILL_INVOCATION.md) for detailed skill patterns
4. Read [WORKFLOWS.md](./WORKFLOWS.md) for end-to-end examples
