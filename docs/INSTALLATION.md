# Installation

This installs `agent-pack` into a project. `agent-pack` supplies authored skills,
agents, workflows, stacks, domains, adapters, and tool-provider definitions.

Runtime execution belongs to the active host today. `agent-harness` is the
future dedicated runtime. Registry publishing flows through `agent-registry`.

## Quick Start

```bash
npx agent-pack install
npx agent-pack doctor
```

Install covers:

- host files for Claude / Codex / Copilot
- agent skills selected in `.agent-config.json`, or all canonical agents by default
- supporting skills needed by those agents
- generated registry artifacts for discovery
- MCP server wiring selected in `.agent-config.json`

Inspect available install surfaces:

```bash
npx agent-pack list-agents
npx agent-pack list-mcp-profiles
npx agent-pack list-hosts
```

## If You Need More

- MCP setup: [MCP_INTEGRATION.md](MCP_INTEGRATION.md)
- Skill routing details: [SKILL_INVOCATION.md](SKILL_INVOCATION.md)
- Workflow examples: [WORKFLOWS.md](WORKFLOWS.md)
- Validation checklist: [VERIFICATION.md](VERIFICATION.md)

## First Session

1. Install package.
2. Run doctor.
3. Open Claude, Codex, or Copilot in repo.
4. Start with one agent:
   - `/swe`
   - `/qa-agent`
   - `/spec-agent`
   - `/orchestrate`

## Minimal Config Example

```json
{
  "private": true,
  "hosts": ["claude", "codex", "copilot"],
  "agents": ["swe", "qa-agent", "spec-agent"],
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

## How Install Decides What To Add

- `hosts`: which host entry files get generated
- `agents`: which agent skills get installed into `.agent/skills/`
- `profiles`: which curated pack/profile defaults apply
- `mcps`: which MCP servers get written into `.agent/settings.json`
- `mcpProfiles`: built-in MCP shortcuts like `github` and `postgres`

You usually do not add individual skills one by one during install. Pick agents
in config, then installer adds:

- selected agent skills from `agents/*`
- matching utility skills relevant to those agents

If `agents` is omitted, installer installs all canonical agent entrypoints.
If `hosts` includes unsupported or future-only host ids, install fails fast.

## After Install

- verify `.agent/generated/registry.json` exists
- verify `.agent/install-manifest.json` exists when repo-local mode is used
- verify session-start hook is present
- verify at least one agent starts cleanly
- verify enabled MCPs appear in doctor output

## Deep Details

Deep installer contract details live in
[`agent-pack/docs/install-spec.md`](../agent-pack/docs/install-spec.md).
