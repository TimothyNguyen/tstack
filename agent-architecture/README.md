# Agent Architecture

Enterprise-safe skill pack for Claude Code, Codex, and Copilot CLI.

**102 skills · 12 role-based agents · No public egress by default**

## Install

```bash
npx agent-architecture install
npx agent-architecture doctor
```

Installs to `.agent/` by default. Reads `.agent-config.json` for customization.

See [INSTALLATION.md](../docs/INSTALLATION.md) for detailed setup, MCP configuration, and cross-repo installation.

## Usage

- **Brainstorm**: `/orchestrate`
- **Implement**: `/swe`
- **Test**: `/qa-agent`
- **Spec**: `/spec-agent`
- **Review**: `/pm`, `/design-agent`
- **Deploy**: `/release-agent`

See [WORKFLOWS.md](../docs/WORKFLOWS.md) for end-to-end examples.

## Development

```bash
npm run build:skills    # Generate SKILL.md from templates
npm run check:skills    # Verify generated files are fresh
npm test                # Run 363 unit + integration tests
```

## Structure

```
agent-architecture/
  agents/              # 12 role-based agents
  <skill>/             # 102 reusable skills
    SKILL.md.tmpl      # Template
    SKILL.md           # Generated (committed)
  hooks/               # Session-start bootstrap
  generated/           # registry.json, skills.index.json
  scripts/             # Build, install, upgrade
  tests/               # 363 unit + integration tests
```

## Security

- ✓ No telemetry, no update checks
- ✓ No public tunnels, no cookie import
- ✓ No credential reads, no scraping
- ✓ All MCPs require explicit env vars
- ✓ Policy-gated tool access (read-only by default)
- ✓ Session files owner-only (0o600)

## Upgrade

```bash
/architecture-agent-upgrade
```

Agents invoke this skill to upgrade agent-architecture to the latest version.

## License

Apache 2.0. See LICENSE file.

## Contributing

1. Edit `<skill>/SKILL.md.tmpl`
2. Run `npm run build:skills`
3. Run `npm test`
4. Commit template + generated `.md` files
