---
name: agent-pack-upgrade
version: 0.1.1
description: |
  Upgrades an installed agent pack through a policy-approved internal,
  mirrored, or manual flow. Public update checks are disabled by default.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
agents: [_infrastructure]
---

## Enterprise Preamble

- Stay inside the current project unless the user explicitly names another path.
- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.
- Use policy-gated tools only when the active profile allows them.
- Commit after each discrete behavior change — do not accumulate unrelated edits across multiple files before committing.
- Each commit message must follow Conventional Commits: `<type>[scope]: <description>` (types: feat, fix, docs, refactor, test, chore, perf, ci).
- Never use `--no-verify`, `--force` (use `--force-with-lease`), or `--no-gpg-sign` unless explicitly instructed.
- Sequence for rebasing: stage → commit → fetch → rebase → push.

# Agent Pack Upgrade

Use this workflow to upgrade an installed agent pack in a
project or approved local install directory.

## Rules

- Do not call public update endpoints by default.
- Do not mutate global agent config unless the active policy and user allow it.
- Prefer internal mirrors, pinned artifacts, or manual copy workflows.
- Verify generated skills after upgrade.
- Preserve project-local profiles and policy overrides.

## Steps

1. Identify the installed agent-pack root.
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
