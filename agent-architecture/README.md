# Agent Architecture

Reusable enterprise agent architecture for software engineering workflows.

This package is separate from `agent-architecture/`. The upstream agent-architecture checkout is source
material only. Anything carried forward must be copied, adapted, and reviewed
inside this package.

## What This Builds

This directory is a reusable skill pack for software-engineering agents. It is
intended to be installed into other repositories as a local architecture-agent
toolkit.

It follows agent-architecture's useful shape:

- Top-level folder per skill.
- `SKILL.md.tmpl` as source.
- generated `SKILL.md` committed beside the template.
- optional `sections/*.md.tmpl` and generated `sections/*.md`.
- local generator and tests.

It intentionally does not carry over agent-architecture's public telemetry, public update
checks, ngrok/public tunnels, cookie import, mobile/iOS flows, or public web
scraping.

## Goals

- Install locally per project or in an approved user directory.
- Support multiple agent hosts through declarative host adapters.
- Keep skills as reviewable, versioned directories.
- Disable public egress, telemetry, tunnels, cookie import, and credential access
  by default.
- Let teams add project-specific stacks, domains, and policies without changing
  the core.

## Install (as a plugin marketplace)

This repo ships marketplace manifests so it can be installed as a plugin in
Claude Code, Codex CLI, and Cursor — same shape as `pydantic/skills` and
`dotnet/skills`.

### Claude Code

```text
/plugin marketplace add <owner>/<repo>
/plugin install agent-architecture@agent-architecture
```

Replace `<owner>/<repo>` with the GitHub coordinates of this repo. Restart
Claude Code and run `/skills` to list the installed skills, `/commands` for
slash commands.

### Codex CLI

```bash
codex plugin marketplace add <owner>/<repo>
```

Then open the Codex plugin UI (`/plugins`) and enable
`agent-architecture` from the marketplace.

### Cursor

```bash
git clone https://github.com/<owner>/<repo>
mkdir -p ~/.cursor/plugins/local
cp -R <repo>/agent-architecture/plugins/agent-architecture ~/.cursor/plugins/local/agent-architecture
```

Then **Developer: Reload Window**.

### Manual (any agentskills.io-compatible host)

```bash
# Symlink each top-level skill into your host's skills directory.
# Bash:
for skill in <repo>/agent-architecture/*/; do
  name=$(basename "$skill")
  [ -f "$skill/SKILL.md" ] && ln -s "$(realpath "$skill")" "$HOME/.claude/skills/$name"
done
```

PowerShell equivalent uses `New-Item -ItemType SymbolicLink`.

## Quick Commands

Run from this directory:

```bash
npm run build:skills
npm run check:skills
npm test
```

Useful test discovery commands:

```bash
npm run test:free:list
npm run test:free:windows
```

## Folder Layout

```text
agent-architecture/
  AGENTS.md    # coding-agent instructions
  CLAUDE.md    # Claude Code instructions
  SKILL.md.tmpl
  SKILL.md
  <skill>/     # top-level skill folders, each with SKILL.md.tmpl and SKILL.md
  scripts/     # template generation and test discovery
  policies/    # default and enterprise policy profiles
  docs/        # migration notes, security posture, architecture decisions
  tests/       # no-egress, generation, policy, install, and adapter tests
```

Folders are created when their first scoped change needs them. Empty placeholder
directories are avoided unless a tool requires them.

Future folders may include:

```text
hosts/       # generated host adapter configs
profiles/    # project or stack profiles
adapters/    # AG-UI, MCP, CodeGraph, Google ADK, Strands, AgentCore
core/        # shared compiler/policy/install code if the scripts outgrow scripts/
```

## Core Versus Profiles

Core must stay domain-neutral. It can know about skills, hosts, policies,
install paths, audit events, and generated artifacts. It must not hardcode a
business domain, cloud stack, database, or model framework.

Profiles are where a project composes reusable pieces. A marketing measurement
application can enable AWS, Spring Boot, Databricks, Python, React, C#, Postgres,
SQL Server, causal inference, experiment design, and uplift modeling packs. A
different project can enable a different set without forking core.

## Skill Directory Shape

Skills follow the agent-architecture-style source layout:

```text
review/
  SKILL.md.tmpl
  SKILL.md
  checklist.md
security-review/
  SKILL.md.tmpl
  SKILL.md
  sections/
    manifest.json
    review-sections.md.tmpl
    review-sections.md
domain-experiment-design/
  SKILL.md.tmpl
  SKILL.md
stack-aws/
  SKILL.md.tmpl
  SKILL.md
```

`SKILL.md.tmpl` is the source. `SKILL.md` is generated from it. Supporting files
are optional and live next to the skill so each workflow can be reviewed,
versioned, and installed as a unit.

Current core skills are listed in:

```text
docs/skill-catalog.md
```

Install behavior is specified in:

```text
docs/install-spec.md
```

## Carry-Over Rules

Carry over from `agent-architecture/` only when the behavior is useful after enterprise
hardening:

- Keep: host adapter pattern, skill directory pattern, skill generation concepts,
  workflow taxonomy, policy-aware review lanes.
- Change: installer, generated preambles, review/QA/security/docs skills, browser
  automation, local learning, codebase understanding.
- Drop by default: mobile/iOS workflows, public scraping, ngrok/public tunnels,
  telemetry, public update checks, cookie import, social/browser automation, and
  personal-productivity flows.

## Commit Discipline

Each commit changes one behavior surface. A commit may touch multiple files only
when all edits serve the same externally describable behavior.

Good commit scopes:

- `docs: define package layout`
- `core: add host config schema`
- `hosts: add codex adapter`
- `policies: disable public egress by default`
- `skills: add review skill skeleton`
- `profiles: add marketing measurement profile`

Bad commit scopes:

- `initial migration`
- `enterprise hardening`
- `add skills and policies`
- `misc cleanup`
