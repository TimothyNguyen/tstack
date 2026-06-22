---
name: architecture-agent-upgrade
version: 0.1.0
description: |
  Upgrades an installed architecture-agent skill pack through a policy-approved internal,
  mirrored, or manual flow. Public update checks are disabled by default.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

## Enterprise Preamble

- Stay inside the current project unless the user explicitly names another path.
- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.
- Use policy-gated tools only when the active profile allows them.
- Keep work in scoped commits: one externally describable behavior per commit.

# Architecture Agent Upgrade

Use this workflow to upgrade an installed architecture-agent skill pack in a
project or approved local install directory.

## Rules

- Do not call public update endpoints by default.
- Do not mutate global agent config unless the active policy and user allow it.
- Prefer internal mirrors, pinned artifacts, or manual copy workflows.
- Verify generated skills after upgrade.
- Preserve project-local profiles and policy overrides.

## Steps

1. Identify the installed architecture-agent root.
2. Identify the approved upgrade source: internal mirror, local path, or manual artifact.
3. Check policy before any file write.
4. Compare versions and changed files.
5. Run `npm run check:skills` after applying the upgrade.
6. Report changed skill folders, generated files, and required follow-up actions.

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
