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
  -> artifacts remain under .agent-pack/subagents/
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

## Playwright CLI Flow

```text
npm run test:e2e
  -> Playwright opens local smoke page fixture
  -> clicks Deploy button
  -> verifies status changes to deployed
  -> clicks Inspect button
  -> verifies status changes to inspected
  -> fails on console errors
```

This validates the repo has a working Playwright CLI path for button and console
checks even before a product UI exists.

## Devtools Agent Flow

```text
devtools-agent
  -> uses browserRead, playwrightCli, and devtoolsInspect only after policy gate
  -> collects screenshots, traces, console errors, network failures, and button evidence
  -> writes summary-and-evidence output
  -> never imports cookies, opens public tunnels, or mutates page state by default
```

The devtools agent is read-only by role. Browser and devtools modules remain
optional and policy-gated.

## Assertions

- Plan accepts both `{ "agents": [...] }` and bare `[...]` JSON.
- CLI accepts npm-safe positional args.
- Explorer, reviewer, QA, and devtools roles do not receive worktrees by default.
- Write-capable roles require explicit `allowedPaths`.
- Egress is disabled unless explicitly enabled by policy.
- Manifest, allocation, patch, result, and rejection artifacts stay under
  `.agent-pack/subagents/`.
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
| Playwright CLI smoke fixture and scripts | `tests/playwright-contract.test.mjs` |
| This spec stays linked to tests | `tests/subagent-e2e-spec.test.mjs` |

## Pros

- Local-first and private by default.
- Git worktrees isolate write-capable agents from coordinator checkout.
- Path allowlists make subagent output easier to review and reject.
- JSON artifacts give future UI, AG-UI, and audit integrations stable inputs.
- Npm-safe commands work on Windows shells.
- Playwright CLI checks prove buttons respond and console errors fail tests.
- No model, network, or paid service required for default tests.

## Cons

- This is orchestration plumbing, not true autonomous multi-agent runtime yet.
- No host adapter parity for Codex, Claude, or Copilot generated artifacts.
- Playwright smoke exists, but no product app/browser QA subagent yet.
- No install/doctor command wiring this into a fresh repo.
- Conflict handling is still coordinator/manual; no merge queue or patch stack.
- Result quality depends on caller/subagent process writing meaningful changes.

## Not Yet Covered

- Product-app browser screenshots, console/network evidence, and accessibility snapshots.
- Full `install -> doctor -> spec -> build -> review -> test -> qa -> ship`.
- Remote subagent execution.
- Model-backed subagent prompt quality.
- Multi-agent concurrent conflict resolution.
