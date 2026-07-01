# Runbook: Install

Install `agent-architecture` into a consuming repository.

## Prerequisites

- Node.js 20+
- Repository has a `package.json` (or is otherwise a valid project root)
- Optional: `.agent-config.json` at the repo root (auto-detected)

## Steps

### 1. Add dependency (recommended)

```bash
npm install --save-dev agent-architecture
```

Or use `npx` without installing:

```bash
npx agent-architecture install
```

List what installer can wire:

```bash
npx agent-architecture list-agents
npx agent-architecture list-mcp-profiles
npx agent-architecture list-hosts
```

### 2. Create `.agent-config.json` (optional)

Without a config file the installer uses defaults: `hosts: [claude, codex, copilot]`,
all installable agents, no MCPs.

```json
{
  "private": true,
  "hosts": ["claude", "codex"],
  "agents": ["swe", "qa-agent"],
  "mcpProfiles": ["github"],
  "mcps": [
    {
      "name": "db",
      "command": "uvx",
      "args": ["mcp-server-postgres"],
      "credentialEnvVars": ["DATABASE_URL"]
    }
  ]
}
```

What each field does:

- `hosts`: generate host entry files like `CLAUDE.md` and `AGENTS.md`
- `agents`: install those agent skills into `.agent/skills/`
- `mcpProfiles`: expand built-in MCP templates
- `mcps`: write MCP server definitions into `.agent/settings.json`

Important:

- agent selection drives most skill installation
- if `agents` is omitted, all installable agent entrypoints are installed
- MCPs are configured here, then wired during install
- credentials stay as env-var references, not raw secrets

### 3. Run install

```bash
npx agent-architecture install
```

Default target: `.agent/` in the current working directory.

Options:

| Flag | Default | Description |
|------|---------|-------------|
| `--target <dir>` | `.agent` | Install directory |
| `--hosts <list>` | `claude,codex,copilot` | Comma-separated host targets |
| `--mcp-profile <list>` | none | Built-in MCP profiles: `github`, `postgres`, `slack` |
| `--private` | off | Enable private mode (no telemetry, no cloud memory) |
| `--dry-run` | off | Print what would be written without writing |

Host names are validated. Unknown or future-only host ids fail fast instead of
silently degrading install behavior.

Install writes:

- `.agent/skills/<agent>/SKILL.md` for selected agents
- `.agent/settings.json` with configured MCP servers
- `.agent/CLAUDE.md`, `.agent/AGENTS.md`, or `.agent/copilot-instructions.md` based on hosts
- `.agent/install-manifest.json` with installed agents, skills, and hosts

### 4. Verify install

```bash
npx agent-architecture doctor
```

Expected output: `doctor: OK (.agent)`

### 5. Commit installed files

```bash
git add .agent/
git commit -m "chore: install agent-architecture v$(cat .agent/VERSION)"
```

## Troubleshooting

| Error | Fix |
|-------|-----|
| `VERSION missing` | Run `install` first |
| `agent "X" declared in manifest but skills/X/SKILL.md missing` | Check `.agent-config.json` agents list matches available agents |
| `settings.json missing` | Run `install` again |

## Notes

- Private mode (`--private`) sets `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` and strips
  telemetry MCPs.
- Credential env vars in `credentialEnvVars` are written as `"$VAR_NAME"` references,
  not literal values — never commit real credentials.
- The `.agent/` directory is repo-local; no global config is mutated.
- To add more agents or MCPs later, update `.agent-config.json` and rerun
  `npx agent-architecture upgrade`.
