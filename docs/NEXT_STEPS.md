# TStack Next Steps

Source planning note: https://chatgpt.com/share/6a539034-1cf8-83ea-b299-9a962c1a05c1

This plan adapts the shared repo analysis to the current `agent-pack` naming and
the post-2.0 split direction.

## Direction

TStack should keep three boundaries clean:

- `agent-pack` defines reusable behavior: skills, agents, workflows, loops,
  stacks, domains, adapters, tool providers, profiles, and host artifacts.
- `agent-registry` publishes and resolves definitions: schemas, catalogs,
  dependency metadata, registry indexes, lockfiles, and compatibility contracts.
- `agent-harness` executes resolved definitions: workflow runtime, loop runtime,
  policy gates, approvals, MCP/tool calls, checkpoints, events, traces, and
  audit records.

Core rule:

```text
agent-pack defines what exists.
agent-registry decides what should run.
agent-harness decides how it runs.
```

A future `agent-control-plane` can add hosted UI/API, teams, RBAC, run history,
and managed registries after local registry and harness contracts are stable.

## Loop Engineering

Loop engineering should be first-class, not hidden inside workflow prose.

```text
Prompt -> Skill -> Workflow -> Harness -> Loop
```

- Skill: single reusable capability.
- Agent: role plus defaults, tools, policies, and model preferences.
- Workflow: bounded graph of skills and agents.
- Harness: execution runtime for workflows and loops.
- Loop: repeated workflow execution with feedback, verification, memory,
  termination rules, and repair routing.

Workflows should remain finite. Loops own repetition.

## Registry Entities

`agent-registry` should eventually publish these entity kinds:

- `Skill`
- `Agent`
- `Workflow`
- `Loop`
- `Profile`
- `Pack`
- `Stack`
- `Domain`
- `Tool`
- `ToolProvider`
- `PolicyBundle`
- `Evaluator`
- `Verifier`

Each entity should have:

- stable `id`
- semantic `version`
- declared dependencies
- host compatibility
- policy requirements
- input/output contract
- provenance metadata

## Loop Schema

Add `Loop` as a registry schema. Suggested starting shape:

```yaml
apiVersion: agent.tstack.dev/v1
kind: Loop
metadata:
  id: tstack/verified-implementation
  version: 0.1.0
  description: Run implementation workflow until verification succeeds or stop policy triggers.
spec:
  trigger:
    type: manual
  objective:
    summary: Implement requested change and prove it with checks.
    successCriteria:
      - tests_pass
      - governance_passes
      - no_unreviewed_contract_drift
  workflow:
    uses: tstack/implementation-workflow@^1.0.0
  feedback:
    sources:
      - tests
      - governance
      - static_analysis
      - human_review
    mapping:
      test_failure: repair
      lint_failure: repair
      governance_failure: repair_or_escalate
      unclear_requirement: ask_human
  verification:
    checks:
      - npm test
      - npm run governance:check
  termination:
    success:
      when: all_success_criteria_met
    failure:
      maxIterations: 5
      maxDurationMinutes: 60
      maxTokens: 200000
      stagnationIterations: 2
  memory:
    checkpoint: per_iteration
    persist:
      - plan
      - changed_files
      - test_results
      - failure_classification
      - reviewer_notes
  policy:
    humanApprovalFor:
      - destructive_filesystem_change
      - credential_change
      - production_deploy
```

Every loop must have bounded termination. No open-ended repair loops.

## Harness Responsibilities

`agent-harness` should own loop execution mechanics:

1. Load registry artifact or registry URL.
2. Resolve workflow, agents, skills, tools, and policy bundles.
3. Create deterministic run lockfile.
4. Execute one workflow iteration.
5. Collect checks, events, artifacts, and traces.
6. Classify failures into repair, retry, escalate, or stop.
7. Route repair workflow when policy allows.
8. Stop on success, failure policy, budget, or human gate.
9. Emit JSONL events and audit records.

Harness should not hand-author catalog content. It consumes registry records.

## Eval Repo

Add `agent-evals` once loop traces exist.

Purpose:

- score run quality
- score loop convergence
- compare agent/profile/model choices
- detect regressions in skills, workflows, and harness behavior
- store fixture tasks and expected traces

Useful metrics:

- pass rate
- iterations to success
- time to success
- token cost
- tool-call count
- human intervention count
- failure-classification accuracy
- repair success rate
- policy violation count

## Roadmap

### Phase 1: Stabilize `agent-pack`

- Keep `agent-pack` as authored source of skills, agents, workflows, stacks,
  domains, adapters, tool providers, profiles, and plugin artifacts.
- Keep package major at `2.0.0` for the agent-pack rename.
- Keep generated registry artifact canonical for downstream repos.
- Add authored loop examples under `agent-pack/loops/` or
  `agent-pack/workflows/loops/`.

### Phase 2: Build `agent-registry`

- Add schemas for skills, agents, workflows, loops, tools, policy bundles,
  evaluators, and verifiers.
- Import `generated/agent-registry/registry.json`.
- Export stable registry indexes.
- Add resolver that produces `agent.lock.json`.
- Add compatibility checks for host, model, tool, policy, and version ranges.

### Phase 3: Build `agent-harness`

- Load registry artifact and lockfile.
- Run one workflow from registry definitions.
- Add dry-run mode.
- Add policy evaluation and approval gates.
- Emit JSONL events, traces, artifacts, and audit logs.
- Support local worktree/sandbox execution.

### Phase 4: Add Loop Runtime

- Execute `Loop` records from registry.
- Persist per-iteration checkpoints.
- Classify failures.
- Route repair workflows.
- Enforce iteration, duration, token, stagnation, and approval limits.
- Add replay from checkpoint.

### Phase 5: Add `agent-evals`

- Consume harness traces.
- Score loop convergence and run quality.
- Add fixture tasks for implementation, review, migration, docs, and release.
- Add regression reports for packs, registry resolver, and harness runtime.

### Phase 6: Add Control Plane Later

- Add UI/API only after local registry and harness workflows are stable.
- Manage teams, RBAC, registry publishing, run history, and dashboards.
- Keep CLI/local execution independent from hosted services.

## Immediate Tasks

- Add `Loop` schema to future `agent-registry`.
- Add loop examples to `agent-pack`.
- Extend registry export to include loops, evaluators, verifiers, and policies.
- Define `agent.lock.json`.
- Implement registry resolver fixture tests.
- Implement harness loader for `generated/agent-registry/registry.json`.
- Implement first dry-run workflow execution.
- Implement first loop runner for verified implementation.
- Emit JSONL event stream for each run.
- Add tests for schema validation, lockfile determinism, loop termination,
  dry-run execution, and audit output.

## Guardrails

- Do not put execution logic in `agent-registry`.
- Do not put catalogs, stacks, or domains in `agent-harness`.
- Do not require hosted control plane for local use.
- Do not preserve stale `agent-architecture` names except explicit migration
  notes.
- Do not let loops run without hard stop policy.
- Do not make workflow prose the only source of execution semantics.

## Next Milestone Done Means

- `agent-pack` exports skills, agents, workflows, loops, stacks, domains,
  profiles, tools, and policies.
- `agent-registry` imports the artifact and resolves deterministic lockfiles.
- `agent-harness` runs one local loop from registry definitions.
- `agent-evals` scores convergence from harness traces.
- Docs explain split boundaries and loop engineering without stale names.
