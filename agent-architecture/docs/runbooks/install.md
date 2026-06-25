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

### 2. Create `.agent-config.json` (optional)

Without a config file the installer uses defaults: `hosts: [claude, codex, copilot]`,
`agents: [swe, qa-agent, spec-agent, pm]`, no MCPs.

```json
{
  "private": true,
  "hosts": ["claude", "codex"],
  "agents": ["swe", "qa-agent"],
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
| `--private` | off | Enable private mode (no telemetry, no cloud memory) |
| `--dry-run` | off | Print what would be written without writing |

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
