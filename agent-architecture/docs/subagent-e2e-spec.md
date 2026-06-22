# Subagent E2E Spec

This spec defines the minimum end-to-end behavior for local subagent
orchestration. It covers the implemented slice, not future browser or remote
agent execution.

## Goal

A coordinator can deploy a scoped subagent plan, allocate isolated worktrees for
write-capable agents, accept or reject subagent output, and keep all artifacts
inside the target repository.

## Covered Flow

```text
fresh git repo
  -> write subagents.json
  -> npm run subagents:deploy -- subagents.json <repo> allocate-worktrees
  -> subagent edits allowed file inside allocated worktree
  -> npm run subagents:import -- apply <agent-id> <repo>
  -> coordinator repo contains accepted change
  -> artifacts remain under .architecture-agent/subagents/
```

## Reject Flow

```text
fresh git repo
  -> allocate write-capable subagent worktree
  -> subagent edits assigned file
  -> npm run subagents:import -- reject <agent-id> <repo> "reason"
  -> coordinator repo remains unchanged
  -> rejection.json records decision under subagent artifact directory
```

## Boundary Flow

```text
fresh git repo
  -> allocate subagent with allowedPaths ["src/**"]
  -> subagent edits file outside allowedPaths
  -> npm run subagents:import -- apply <agent-id> <repo>
  -> import fails before patch application
  -> coordinator repo remains unchanged
```

## Assertions

- Plan accepts both `{ "agents": [...] }` and bare `[...]` JSON.
- CLI accepts npm-safe positional args.
- Explorer, reviewer, and QA roles do not receive worktrees by default.
- Write-capable roles require explicit `allowedPaths`.
- Egress is disabled unless explicitly enabled by policy.
- Manifest, allocation, patch, result, and rejection artifacts stay under
  `.architecture-agent/subagents/`.
- Secret-like fields are rejected or redacted.
- Accepted patches pass `git apply --check` before mutation.
- Rejected patches do not mutate coordinator checkout.

## Current Automated Coverage

| Spec area | Test file |
|---|---|
| Manifest shape, path boundaries, secret-field rejection | `tests/subagent-manifest.test.mjs` |
| Deploy CLI and npm-safe positional args | `tests/subagent-deployment.test.mjs` |
| Worktree allocation and result collection | `tests/subagent-worktree.test.mjs` |
| Apply, reject, and out-of-scope path handling | `tests/subagent-import.test.mjs` |
| Import CLI and npm-safe positional args | `tests/subagent-import-cli.test.mjs` |
| This spec stays linked to tests | `tests/subagent-e2e-spec.test.mjs` |

## Pros

- Local-first and private by default.
- Git worktrees isolate write-capable agents from coordinator checkout.
- Path allowlists make subagent output easier to review and reject.
- JSON artifacts give future UI, AG-UI, and audit integrations stable inputs.
- Npm-safe commands work on Windows shells.
- No model, browser, network, or paid service required for default tests.

## Cons

- This is orchestration plumbing, not true autonomous multi-agent runtime yet.
- No host adapter parity for Codex, Claude, or Copilot generated artifacts.
- No Playwright/browser QA subagent yet.
- No install/doctor command wiring this into a fresh repo.
- Conflict handling is still coordinator/manual; no merge queue or patch stack.
- Result quality depends on caller/subagent process writing meaningful changes.

## Not Yet Covered

- Browser screenshots, console/network evidence, and accessibility snapshots.
- Full `install -> doctor -> spec -> build -> review -> test -> qa -> ship`.
- Remote subagent execution.
- Model-backed subagent prompt quality.
- Multi-agent concurrent conflict resolution.
