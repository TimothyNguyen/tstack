# Subagent Deployment Plan

This plan defines how `agent-architecture/` should deploy subagents for daily
development while preserving enterprise-safe defaults.

## Goal

Deploy role-based subagents that can divide work across planning, codebase
understanding, implementation, review, testing, documentation, and release
handoff. Subagents must operate inside declared repo-local boundaries, use local
artifacts by default, and report auditable outputs.

## Non-Negotiables

- No public egress by default.
- No credential reads, cookie import, public tunnels, or remote pairing by
  default.
- No global host config mutation unless policy explicitly allows it.
- Every subagent gets a narrow role, bounded files or responsibilities, and a
  clear output contract.
- Write-capable subagents require policy approval and local audit events.
- Subagents must not revert work from other agents.
- Coordinator owns integration, conflict resolution, and final verification.

## Subagent Roles

| Role | Mode | Responsibility | Default write access |
|---|---|---|---|
| Coordinator | Main session | Break down work, assign roles, integrate outputs, run final checks. | Yes, policy-gated |
| Explorer | Read-only | Answer specific codebase questions using CodeGraph/codebase-engine/grep. | No |
| Planner | Read/write docs | Produce specs, plans, task splits, risk lists, and acceptance criteria. | Docs only |
| Implementer | Write scoped code | Implement a bounded task in assigned files/modules. | Assigned paths only |
| Test Engineer | Write scoped tests | Add or repair tests for assigned behavior. | Test paths only |
| Reviewer | Read-only or patch | Find bugs, missing tests, unsafe behavior, and regressions. | No by default |
| QA Agent | Optional browser/test | Run local app/test/browser checks and record evidence. | No by default |
| Devtools Agent | Optional browser/devtools | Use Playwright CLI/MCP-style evidence collection for buttons, console, network, traces, and screenshots. | No |
| Docs Agent | Write docs | Update README, docs, changelog, and release notes. | Docs only |
| Release Agent | Git/release handoff | Prepare branch state, PR body, release checklist, and deployment notes. | Git write approval-required |

## Deployment Architecture

```text
Coordinator
  |
  +-- Planner
  +-- Explorer(s)
  +-- Implementer(s)
  +-- Test Engineer(s)
  +-- Reviewer
  +-- QA Agent
  +-- Docs Agent
  +-- Release Agent
```

Subagents do not directly coordinate with each other in the default model.
Coordinator shares necessary context, assigns non-overlapping ownership, and
collects results.

## Required Runtime Contracts

### Agent Manifest

Each spawned subagent must have a manifest:

```json
{
  "id": "implementer-auth-api",
  "role": "implementer",
  "task": "Add token refresh endpoint",
  "allowedPaths": ["src/auth/**", "tests/auth/**"],
  "disallowedPaths": [".env", "secrets/**"],
  "tools": ["shellRead", "shellWrite", "testExecution"],
  "egress": "disabled",
  "writes": "approval-required",
  "output": "summary-and-changed-files"
}
```

### Output Contract

Each subagent returns:

- Task completed or blocked.
- Files changed.
- Tests run and results.
- Risks or assumptions.
- Follow-up tasks.
- Audit event ids for privileged actions, if any.

### Audit Events

Write-capable or privileged actions emit local events:

```json
{
  "type": "subagent.action",
  "agentId": "implementer-auth-api",
  "role": "implementer",
  "action": "shellWrite",
  "decision": "approved",
  "paths": ["src/auth/routes.ts"],
  "summary": "Added token refresh route"
}
```

No audit event may include secrets, full prompts, raw file contents, or
credential values.

## Workflow

### Phase 1: Single-Machine Subagents

Use host-native subagent support when available. The initial target is local
parallelism inside one repo checkout or isolated worktrees.

Steps:

1. Add `docs/subagent-deployment-plan.md`.
2. Add `profiles/subagents-local.json`.
3. Add `subagent-orchestrator` skill or extend `autoplan` with subagent mode.
4. Add manifest schema for subagent role, paths, tools, and output.
5. Add audit event type `subagent.action`.
6. Add tests for manifest validation and audit redaction.

Acceptance criteria:

- Coordinator can assign Explorer, Planner, Implementer, Test Engineer, and
  Reviewer roles.
- Each role has a bounded prompt template.
- Write scopes are explicit.
- No role has default external egress.
- Tests validate manifest shape and forbidden fields.

### Phase 2: Worktree Isolation

Use separate git worktrees for implementers when tasks touch different modules.

Steps:

1. Add worktree allocation policy.
2. Create `.architecture-agent/subagents/<id>/manifest.json`.
3. Create `.architecture-agent/subagents/<id>/result.json`.
4. Require each implementer to list changed files.
5. Coordinator cherry-picks or manually applies accepted diffs.

Acceptance criteria:

- Two implementers can work on disjoint paths without conflicts.
- Coordinator can reject a subagent result without touching main worktree.
- Worktree cleanup removes only declared paths.

### Phase 3: QA And Browser Subagent

Enable QA Agent only when browser adapter is enabled by profile and policy.

Steps:

1. Define browser read/action policy.
2. Add local-only Playwright adapter.
3. Add screenshot and console/network evidence outputs.
4. Add prompt-injection boundary for page text and external content.

Acceptance criteria:

- QA Agent can test local app URL.
- Browser actions are audited.
- Cookie import and tunnels remain disabled unless policy explicitly enables
  them.

### Phase 4: Release Handoff

Release Agent prepares, but does not force, final ship actions.

Steps:

1. Generate PR body from spec, changes, tests, and audit summary.
2. Verify clean status or report uncommitted files.
3. Run configured test command.
4. Require explicit approval for push/deploy.

Acceptance criteria:

- Release output is deterministic and reviewable.
- Git write remains approval-required.
- Deploy remains approval-required.

## First Subagent Set

Start with five roles:

| Role | Why first |
|---|---|
| Explorer | Saves coordinator context and reduces random grep. |
| Planner | Turns vague requests into bounded implementation tasks. |
| Implementer | Gives parallel coding leverage with explicit file ownership. |
| Test Engineer | Prevents implementation-only parallelism from skipping verification. |
| Reviewer | Catches integration bugs before final commit. |

Defer QA, Docs, and Release until installer and core loop exist.

## Day-To-Day Usage Target

```text
/autoplan --subagents
  Planner drafts tasks
  Explorer maps code
  Implementer(s) patch assigned paths
  Test Engineer adds/runs tests
  Reviewer reports issues
  Coordinator integrates and verifies
```

The user sees one plan, one progress stream, one final summary, and one set of
changed files. Subagent complexity stays behind coordinator.

## Build Order

1. Manifest schema and tests.
2. Role prompt templates.
3. Coordinator skill flow.
4. Local audit event integration.
5. Worktree isolation.
6. Host-specific adapters for Codex, Claude, Copilot.
7. QA/browser subagent.
8. Release handoff subagent.

## Implemented Slice

The first local-only deployment slice is implemented:

- `core/subagents.mjs` validates role manifests and writes repo-local artifacts.
- `core/subagent-worktrees.mjs` allocates, collects, and cleans isolated git
  worktrees for write-capable subagents.
- `scripts/subagent-deploy.mjs` materializes manifests from a JSON plan.
- `scripts/subagent-import.mjs` exports, applies, or rejects subagent worktree
  patches.
- `profiles/subagents-local.json` enables local orchestration without browser,
  tunnel, telemetry, cookie, credential, or public egress defaults.
- `subagent-orchestrator/` provides the user-facing skill entrypoint.
- `subagent.*` event types are available for AG-UI-compatible progress and
  audit envelopes.
- `docs/subagent-e2e-spec.md` defines the implemented happy-path, reject, and
  boundary e2e flows and links them to automated tests.
- `playwright.config.mjs` and `e2e/subagent-devtools.spec.mjs` provide a local
  Playwright CLI smoke for button behavior and console-error checks.

Run:

```bash
npm run subagents:deploy -- path/to/subagents.json <repo>
npm run subagents:deploy -- path/to/subagents.json <repo> allocate-worktrees
npm run subagents:import -- export <agent-id> <repo>
npm run subagents:import -- apply <agent-id> <repo>
npm run subagents:import -- reject <agent-id> <repo> "wrong approach"
```

Artifacts:

```text
.architecture-agent/subagents/<agent-id>/manifest.json
.architecture-agent/subagents/<agent-id>/allocation.json
.architecture-agent/subagents/<agent-id>/worktree/
.architecture-agent/subagents/<agent-id>/patch.diff
.architecture-agent/subagents/<agent-id>/rejection.json
.architecture-agent/subagents/deployment.json
```

## Open Decisions

| Decision | Options | Recommendation |
|---|---|---|
| Default isolation | Same worktree, git worktrees, temp copies | Git worktrees for write-capable agents. |
| Result format | Markdown only, JSON only, both | Both: JSON for tooling, Markdown for humans. |
| Role storage | Hardcoded prompts, skill directories, generated host artifacts | Skill directories with generated host artifacts. |
| Approval model | Per action, per role, per run | Per role + per privileged action. |
| First host | Codex, Claude, Copilot | Codex first because current repo uses Codex session rules. |
