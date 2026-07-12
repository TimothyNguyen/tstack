# Agent Platform Blueprint

This document records the target platform split for `agent-pack`,
`agent-registry`, `agent-harness`, and later supporting repositories.

The current repo already contains the right conceptual split. The main issue is
that the old `agent-architecture` shape mixed five concerns:

1. Content authoring repository
2. Package registry
3. Runtime harness
4. Installer/compiler
5. Generated host artifacts

The current direction is to treat this repo as TStack governance plus the
current `agent-pack` source while extracting the registry and harness contracts.

## Target Repositories

```text
agent-registry       Declarative catalog and dependency resolution
agent-harness        Execution engine, policies, checkpoints, adapters
agent-pack           Authored skills, agents, workflows, stacks, domains
agent-evals          Evaluation of individual runs and loop convergence
agent-control-plane  Optional hosted UI/API for remote and team execution
```

`agent-pack` is the renamed successor to the old `agent-architecture` authoring
source. It should stay focused on authored content and generated host artifacts.

## Platform Boundary

```text
                          +-------------------------+
                          |      agent-registry     |
                          |                         |
                          | catalog                 |
                          | schemas                 |
                          | dependency resolver     |
                          | package indexes         |
                          | lockfile generation     |
                          +------------+------------+
                                       |
                                       | resolved graph
                                       | agent.lock.json
                                       v
+-----------------------+   +-------------------------+
|      agent-pack       |-->|      agent-harness      |
|                       |   |                         |
| skills                |   | workflow executor       |
| agents                |   | model/host adapters     |
| workflows             |   | tool runtime            |
| stacks                |   | policy enforcement      |
| domains               |   | checkpoints/recovery    |
| profiles              |   | worktrees/sandboxes     |
| tool definitions      |   | traces/events           |
+-----------------------+   +------------+------------+
                                         |
                    +--------------------+--------------------+
                    v                    v                    v
             Claude Code             Codex CLI          Copilot CLI
             local tmux              local CLI          local CLI
             AgentCore               LangGraph          Google ADK
```

Most important rule:

```text
Registry decides what should run.
Harness decides how it runs.
Packs define reusable behavior.
```

Adjustment from earlier transition notes: `agent-pack` owns authored Markdown,
templates, packs, and source definitions. `agent-registry` owns normalized
catalog records, schemas, indexes, compatibility metadata, and lockfiles.

## Loop Engineering

Loop Engineering is a first-class abstraction across registry and harness,
positioned above individual workflows.

```text
Prompt -> Skill -> Workflow -> Harness -> Loop
```

A workflow describes a bounded sequence of steps. A loop repeatedly invokes one
or more workflows until verification succeeds, a stopping condition is reached,
or human intervention is required.

Do not create a separate loop-engineering repo initially. Loop Engineering is a
core contract shared by `agent-registry`, `agent-harness`, `agent-pack`, and
`agent-evals`.

Updated ownership:

```text
agent-registry  Skills, agents, workflows, loops, profiles, metadata
agent-harness   Executes workflows and manages loop lifecycles
agent-pack      Reusable implementation, review, testing, and repair loops
agent-evals     Evaluates individual runs and loop convergence
```

### Loop Entity

Registry entity hierarchy:

```text
Skill
Agent
Workflow
Loop
Profile
Pack
Tool
ToolProvider
PolicyBundle
Verifier
```

Entity purposes:

| Entity | Purpose |
| --- | --- |
| Skill | Reusable instructions for one type of work. |
| Agent | Role, model preferences, tools, and behavioral constraints. |
| Workflow | Directed execution graph with defined beginning and end. |
| Loop | Repeated workflow execution driven by verification feedback. |
| Profile | Environment-specific composition of packages and providers. |
| Pack | Installable collection of registry entities. |
| Verifier | Deterministic, model, human, or composite verification contract. |

A loop is not:

```python
while tests_fail:
    ask_agent_to_fix()
```

A loop is a versioned, policy-controlled execution specification.

### Loop Specification

Add `schemas/loop.schema.json`:

```yaml
apiVersion: tstack.dev/v1alpha1
kind: Loop
metadata:
  id: tstack/verified-implementation
  version: 0.1.0
  description: >
    Iteratively implement, review, test, and repair a feature until
    acceptance criteria are satisfied.
spec:
  trigger:
    type: manual
  objective:
    input: task
    successCriteria:
      - acceptance-criteria-satisfied
      - required-tests-pass
      - no-blocking-review-findings
  workflow:
    uses: workflow:tstack/feature-delivery@^1
  feedback:
    sources:
      - step:test
      - step:review
      - step:security-review
    mapping:
      test-failure: workflow:tstack/test-repair
      review-finding: workflow:tstack/review-repair
      security-finding: workflow:tstack/security-repair
  verification:
    strategy: all
    checks:
      - uses: verifier:tstack/test-suite
      - uses: verifier:tstack/acceptance-criteria
      - uses: verifier:tstack/code-review
      - uses: verifier:tstack/security-policy
  termination:
    success:
      when: verification.passed
    failure:
      maxIterations: 8
      maxDuration: 2h
      maxTokens: 500000
      maxCostUsd: 20
      noProgressIterations: 2
    escalation:
      when:
        - conflicting-verifiers
        - repeated-failure
        - policy-blocked
        - ambiguous-requirement
  memory:
    strategy: structured
    retain:
      - decisions
      - failed-attempts
      - verifier-results
      - changed-files
      - unresolved-findings
  isolation:
    workspace: git-worktree
    resetBetweenIterations: false
  policy:
    required:
      - enterprise-default
      - no-production-deploy
```

### Canonical Loop Anatomy

Every loop has eight explicit elements:

1. Trigger
2. Goal
3. Work unit
4. Feedback
5. Verification
6. Memory
7. Stopping rules
8. Terminal state

Triggers:

```yaml
trigger:
  type: manual
```

```yaml
trigger:
  type: github-issue
  filters:
    labels: [agent-ready]
```

```yaml
trigger:
  type: schedule
  cron: "0 7 * * 1-5"
```

```yaml
trigger:
  type: event
  event: ci.failed
```

Goals must be testable:

```yaml
objective:
  successCriteria:
    - all-tests-pass
    - no-critical-vulnerabilities
    - latency-regression-below-5-percent
```

Avoid vague goals like:

```yaml
goal: improve the code
```

Work units should usually be workflows:

```yaml
workflow:
  uses: workflow:tstack/investigate-fix-verify@1.2.0
```

Loops may route to different workflows:

```yaml
routing:
  test-failure: workflow:tstack/test-repair
  architecture-failure: workflow:tstack/redesign
  requirement-failure: workflow:tstack/spec-refinement
```

### Verification Ladder

Verification is the center of Loop Engineering. Autonomous loops are only as
reliable as their verifiers.

```text
Level 0: Agent claims completion
Level 1: Format/static validation
Level 2: Deterministic tests
Level 3: Behavioral/integration tests
Level 4: Independent evaluator or external system
Level 5: Human or production outcome
```

Prefer levels 2-4 for autonomous coding loops.

### Loop Memory

Do not forward complete history on every iteration. Maintain structured loop
memory:

```json
{
  "iteration": 4,
  "objective": "Implement pagination",
  "decisions": [
    {
      "decision": "Use cursor pagination",
      "reason": "Stable ordering required"
    }
  ],
  "failedApproaches": [
    {
      "approach": "Offset pagination",
      "failure": "Duplicate records under concurrent writes"
    }
  ],
  "openFindings": [
    {
      "id": "review-17",
      "severity": "high",
      "description": "Cursor is not cryptographically signed"
    }
  ],
  "verificationHistory": [
    {
      "iteration": 3,
      "passed": 84,
      "failed": 2
    }
  ]
}
```

Every loop must have bounded stopping rules:

```yaml
termination:
  maxIterations: 6
  maxTokens: 300000
  maxDuration: 90m
  noProgressIterations: 2
```

Never allow this without resource limits and a no-progress detector:

```yaml
while: objective-not-complete
```

### Registry Loop Additions

Extend `agent-registry`:

```text
agent-registry/
  schemas/
    loop.schema.json
    verifier.schema.json
    loop-lock.schema.json
  catalog/
    loops/
    verifiers/
  src/
    resolver/
      loop-resolver.ts
      verifier-resolver.ts
      feedback-routing.ts
    validation/
      termination-validator.ts
      verification-validator.ts
```

Registry validation rejects loops that:

- Have no verification mechanism
- Have no maximum iterations, time, tokens, or cost
- Use the same agent as producer and sole verifier for high-risk work
- Reference unavailable capabilities
- Cannot produce a terminal state
- Allow write or deployment actions without policies
- Have circular feedback routing without progress criteria
- Use mutable, unpinned workflow versions
- Have no strategy for repeated failures
- Store secrets or raw credentials in memory

Example validation:

```text
areg validate loop:tstack/verified-implementation
ERROR LE104:
Loop has no independent verification source.
Producer:
  agent:tstack/implementation-agent
Verifier:
  agent:tstack/implementation-agent
Recommended:
  Use agent:tstack/reviewer or verifier:tstack/test-suite.
```

### Loop Lockfile

The lockfile preserves the complete loop graph:

```json
{
  "lockfileVersion": 1,
  "loop": {
    "id": "tstack/verified-implementation",
    "version": "0.1.0",
    "digest": "sha256:..."
  },
  "workflow": {
    "id": "tstack/feature-delivery",
    "version": "1.3.0",
    "digest": "sha256:..."
  },
  "verifiers": {
    "test-suite": {
      "version": "1.1.0",
      "digest": "sha256:..."
    },
    "code-review": {
      "version": "0.8.2",
      "digest": "sha256:..."
    }
  },
  "termination": {
    "maxIterations": 8,
    "maxTokens": 500000
  },
  "providers": {
    "implementation.model": "claude-code",
    "review.model": "codex",
    "workspace": "git-worktree"
  }
}
```

This makes a loop reproducible, not merely repeatable.

### Harness Loop Engine

Add a dedicated layer above the workflow executor:

```text
agent-harness/
  src/
    loop/
      loop-controller.ts
      loop-state-machine.ts
      progress-evaluator.ts
      feedback-router.ts
      termination-engine.ts
      memory-manager.ts
      escalation-manager.ts
    verification/
      verifier.ts
      deterministic-verifier.ts
      model-verifier.ts
      human-verifier.ts
      composite-verifier.ts
```

Execution:

```text
Loop controller
  -> Resolve current objective
  -> Execute workflow
  -> Collect evidence
  -> Run independent verification
  -> Classify findings
  -> Measure progress
  -> Route feedback
  -> Continue / succeed / fail / escalate
```

Loop state machine:

```text
CREATED
  -> VALIDATING
  -> READY
  -> ITERATION_PLANNING
  -> WORKFLOW_RUNNING
  -> VERIFYING
  -> PASSED        -> SUCCEEDED
  -> REPAIRABLE    -> FEEDBACK_ROUTING -> ITERATION_PLANNING
  -> BLOCKED       -> WAITING_FOR_HUMAN
  -> NO_PROGRESS   -> ESCALATED
  -> LIMIT_HIT     -> EXHAUSTED
  -> POLICY_DENY   -> BLOCKED
```

Terminal states:

```text
SUCCEEDED
EXHAUSTED
BLOCKED
ESCALATED
CANCELLED
FAILED
```

Do not collapse terminal states into `FAILED`. `EXHAUSTED` is different from a
runtime crash.

### Progress Detection

A loop should not count activity as progress. Track measurable signals:

```json
{
  "iteration": 4,
  "progress": {
    "testsPassing": {
      "previous": 82,
      "current": 91,
      "delta": 9
    },
    "blockingFindings": {
      "previous": 5,
      "current": 2,
      "delta": -3
    },
    "coverage": {
      "previous": 74.1,
      "current": 76.3,
      "delta": 2.2
    },
    "acceptanceCriteriaMet": {
      "previous": 3,
      "current": 4,
      "total": 5
    }
  }
}
```

Simple progress score:

```text
progress =
    test-improvement
  + finding-reduction
  + acceptance-criteria-improvement
  - regression-penalty
  - repeated-failure-penalty
```

Stop or escalate when progress stays below threshold for N iterations.

### Reward-Hacking Prevention

Implementation agent should generally not control its own success metric.

Preferred separation:

```text
Implementation agent
  -> produces patch
Deterministic verifier
  -> runs tests/lints/security
Independent review agent
  -> reviews behavior and design
Harness
  -> decides whether loop terminates
```

Bad:

```text
Claude implements code
Claude reviews its own code
Claude declares success
```

Better:

```text
Claude implements
Tests verify behavior
Codex performs independent review
Harness evaluates both
```

For high-risk changes:

```text
Claude implementation
Codex review
Deterministic tests
Security scanner
Human approval
```

### Loop Library

Add reusable loops to `agent-pack`:

```text
agent-pack/
  loops/
    feature-delivery/
    bug-repair/
    ci-repair/
    test-coverage/
    dependency-upgrade/
    security-remediation/
    migration/
    performance-optimization/
    documentation-drift/
    architecture-convergence/
```

Feature-delivery loop:

```text
spec
  -> implement
  -> test
  -> review
  -> repair
  -> verify
```

Exit when:

- Acceptance tests pass
- No blocking review findings remain
- Policy checks pass
- Change is inside scope

Bug-repair loop:

```text
reproduce
  -> localize
  -> hypothesize
  -> patch
  -> regression-test
  -> verify original reproduction no longer fails
```

Rule: bug-repair cannot succeed unless it first reproduces the failure, unless
the loop explicitly records why reproduction was impossible.

CI-repair loop:

```text
fetch failing check
  -> classify failure
  -> apply minimal repair
  -> run relevant checks locally
  -> rerun CI
  -> repeat or escalate
```

Stop when:

- Same failure repeats twice
- Failure appears infrastructure-related
- Repair would modify unrelated scope
- Required secret/environment is unavailable

Architecture-convergence loop:

```text
proposal
  -> architecture review
  -> threat review
  -> cost/reliability review
  -> revise
  -> decision record
```

This loop is useful for AgentCore, AWS serverless, EKS, data, and ML
architecture work.

### Loop Profiles

Add Loop Engineering defaults to profiles:

```yaml
apiVersion: tstack.dev/v1alpha1
kind: Profile
metadata:
  id: tstack/local-loop-engineering
  version: 0.1.0
spec:
  runtime:
    type: tmux
  models:
    implementation: claude-code
    review: codex
    fallback: copilot
  workspace:
    type: git-worktree
    onePerWorker: true
  loops:
    defaults:
      maxIterations: 6
      noProgressIterations: 2
      checkpointEveryIteration: true
  policies:
    - enterprise-default
    - no-production-deploy
  observability:
    eventLog: .agent/runs
    retainPrompts: false
    retainArtifacts: true
```

### Loop CLI

Registry commands:

```bash
areg loop validate loops/feature-delivery
areg loop inspect tstack/feature-delivery
areg loop graph tstack/feature-delivery
areg loop lock tstack/feature-delivery
areg loop publish loops/feature-delivery
```

Harness commands:

```bash
ah loop plan tstack/feature-delivery
ah loop run tstack/feature-delivery --task issue.md
ah loop status run_123
ah loop pause run_123
ah loop resume run_123
ah loop approve run_123 --gate production-like-test
ah loop stop run_123
ah loop fork run_123 --from-iteration 3 --model codex
```

Inspection:

```bash
ah loop explain run_123
```

Output shape:

```text
Loop stopped: NO_PROGRESS
Iterations completed: 5
Last measurable improvement: iteration 3
Repeated failure:
  Integration test expects cursor expiration handling.
Attempts:
  1. Added expiration validation.
  2. Reworked token parser.
  3. Changed test fixture.
Recommended escalation:
  Requirement ambiguity regarding expired cursor behavior.
```

### Loop Observability

Metrics:

```text
loop_iterations_total
loop_convergence_rate
loop_success_rate
loop_exhaustion_rate
loop_human_escalation_rate
loop_no_progress_iterations
loop_regressions_introduced
loop_findings_resolved
loop_tokens_per_success
loop_time_to_verified_success
loop_cost_per_verified_success
```

Trace hierarchy:

```text
Loop run
  Iteration 1
    Planning workflow
    Implementation workflow
    Verification workflow
  Iteration 2
    Feedback routing
    Repair workflow
    Verification workflow
  Terminal decision
```

### Loop Evals

`agent-evals` should score more than final success:

- Correctness
- Convergence
- Efficiency
- Stability
- Scope discipline
- Regression rate
- Verifier reliability
- Human intervention rate
- Comprehension debt

A loop that succeeds after 15 noisy iterations can be worse than one that
escalates correctly after three.

Example scorecard:

```json
{
  "loop": "tstack/bug-repair@0.3.0",
  "scenario": "pagination-duplicate-records",
  "result": "succeeded",
  "iterations": 4,
  "testsPassed": true,
  "regressions": 0,
  "scopeViolations": 0,
  "tokens": 182000,
  "humanInterventions": 0,
  "convergenceScore": 0.91,
  "verificationConfidence": 0.95
}
```

### Loop Implementation Order

Phase 1: contracts.

- `Loop`
- `Verifier`
- `LoopState`
- `LoopMemory`
- `TerminationRule`
- `ProgressSignal`
- `FeedbackRoute`
- `TerminalState`

Phase 2: sequential loop engine.

- One loop
- One workflow
- One implementation agent
- Deterministic verification
- Maximum iterations
- JSONL state
- Checkpoint/resume

Phase 3: independent review.

- Producer model
- Reviewer model
- Deterministic verifier
- Feedback classification

Phase 4: tmux workers.

- Isolated worktrees
- Parallel workers
- Worker heartbeats
- Structured inbox/outbox
- Review and merge loop

Phase 5: event-triggered loops.

- GitHub issue trigger
- CI failure trigger
- Scheduled maintenance
- Dependency update trigger
- Documentation drift trigger

Phase 6: remote execution.

- AgentCore
- ECS
- Kubernetes
- Remote SSH workers

Final Loop Engineering architecture:

```text
+----------------------------------------------+
|                agent-registry                |
| Skills, Agents, Workflows, Loops             |
| Verifiers, Profiles, Packs, Policies         |
| Dependency resolution, Lockfiles             |
+----------------------+-----------------------+
                       |
                       | resolved loop graph
                       v
+----------------------------------------------+
|                 agent-harness                |
| Loop controller                              |
| Workflow executor                            |
| Feedback router                              |
| Verification engine                          |
| Progress and termination engine              |
| Memory and checkpoints                       |
| Policy and approval gates                    |
| Runtime/model/tool/workspace adapters        |
+----------------------+-----------------------+
                       |
          +------------+---------------+
          v            v               v
       Claude        Codex          Copilot
       tmux           CLI            CLI
          |            |               |
          +------------+---------------+
                       v
              Verified artifacts
```

Revised first end-to-end target:

```bash
areg loop lock tstack/verified-feature-delivery \
  --profile tstack/local-loop-engineering \
  --output agent.lock.json

ah loop run \
  --lock agent.lock.json \
  --task issue.md
```

The key product is not an agent that can perform a task. It is a bounded
engineering loop that can produce evidence, recognize progress, stop safely,
and explain why it succeeded or failed.

## `agent-registry`

`agent-registry` is a declarative package catalog and resolver, not an
execution service.

It answers:

- What skills, agents, workflows, tools, adapters, and profiles exist?
- Which versions are compatible?
- What does a workflow require?
- What policies are required?
- Which runtime capabilities are needed?
- Which package versions should be installed?
- What exact immutable graph should the harness execute?

It must not:

- Invoke models
- Execute shell commands
- Create worktrees
- Call MCP servers
- Run workflow steps
- Store runtime checkpoints
- Enforce runtime approval prompts

Suggested layout:

```text
agent-registry/
  README.md
  package.json
  schemas/
    package.schema.json
    skill.schema.json
    agent.schema.json
    workflow.schema.json
    adapter.schema.json
    tool-provider.schema.json
    profile.schema.json
    policy-requirement.schema.json
    lockfile.schema.json
  catalog/
    skills/
    agents/
    workflows/
    adapters/
    tool-providers/
    stacks/
    domains/
    profiles/
  src/
    discovery/
    validation/
    indexing/
    resolver/
    compatibility/
    lockfile/
    search/
    cli/
  generated/
    registry.json
    registry.compact.json
    search-index.json
    catalog.md
  tests/
    schemas/
    resolver/
    compatibility/
    fixtures/
  examples/
```

### Registry Entity Envelope

Do not make skills the only root abstraction. Use a generic package envelope:

```json
{
  "apiVersion": "tstack.dev/v1alpha1",
  "kind": "Skill",
  "metadata": {
    "id": "tstack/spec",
    "name": "spec",
    "version": "0.3.0",
    "description": "Create an implementation-ready engineering specification.",
    "labels": {
      "category": "core",
      "tier": "essential"
    },
    "owners": ["platform-engineering"],
    "status": "active"
  },
  "spec": {
    "entrypoint": "SKILL.md",
    "sourceEntrypoint": "SKILL.md.tmpl",
    "compatibleHosts": ["claude-code", "codex", "copilot"],
    "compatibleHarness": ">=0.1.0 <1.0.0",
    "requires": {
      "skills": [],
      "tools": ["filesystem.read", "repository.search"],
      "capabilities": ["workspace.read"],
      "policies": []
    },
    "optional": {
      "skills": ["tstack/diagram"]
    }
  },
  "artifact": {
    "type": "git",
    "repository": "TimothyNguyen/agent-pack",
    "revision": "sha-or-commit",
    "path": "skills/spec",
    "integrity": "sha256:..."
  }
}
```

Current metadata is a good seed. It already covers categories, domains, tiers,
MCP and skill dependencies, compatibility bounds, training metadata, discovery
relationships, policy gates, maintenance status, ownership, and review dates.

### Schema Changes

Replace host-shaped `allowed-tools` with host-neutral capabilities:

```yaml
capabilities:
  required:
    - workspace.read
    - repository.search
  optional:
    - shell.execute
```

The harness maps capabilities to host tools:

```text
workspace.read
  Claude Code -> Read
  Codex       -> filesystem tool
  Copilot     -> repository read capability
  AgentCore   -> gateway action
```

Separate tool requirements from providers:

```yaml
tools:
  - issue.search
  - diagram.render
```

Profiles or lockfiles choose providers:

```yaml
providers:
  issue.search: github-connector
  diagram.render: drawio-mcp
```

Replace package-specific framework versions with contract versions:

```yaml
contracts:
  registry: "^1.0"
  harness: "^1.0"
  skill: "^1.0"
```

### Workflow Entity

Treat workflow as a first-class type with structured steps:

```yaml
apiVersion: tstack.dev/v1alpha1
kind: Workflow
metadata:
  id: tstack/feature-delivery
  version: 0.1.0
spec:
  inputs:
    task:
      type: string
  steps:
    - id: investigate
      uses: skill:tstack/investigate@^1
      output: investigation
    - id: spec
      uses: skill:tstack/spec@^1
      with:
        context: "${steps.investigate.output}"
      output: specification
    - id: implement
      uses: agent:tstack/implementation-agent@^1
      checkpoint: true
    - id: review
      uses: skill:tstack/pre-commit-review@^1
      gate:
        type: approval
        when: "${steps.review.output.risk == 'high'}"
    - id: test
      uses: skill:tstack/test@^1
    - id: ship
      uses: skill:tstack/ship@^1
```

### Lockfile

The registry's most important output is `agent.lock.json`:

```json
{
  "lockfileVersion": 1,
  "profile": "tstack/aws-serverless-swe@1.2.0",
  "harness": {
    "version": "0.4.1"
  },
  "packages": {
    "tstack/spec": {
      "kind": "Skill",
      "version": "1.3.2",
      "digest": "sha256:..."
    },
    "tstack/aws": {
      "kind": "Stack",
      "version": "0.8.0",
      "digest": "sha256:..."
    }
  },
  "providers": {
    "repository.read": "builtin-filesystem",
    "repository.write": "builtin-git",
    "issue.search": "github-connector"
  },
  "policy": {
    "bundle": "tstack/enterprise-default@1.0.0"
  }
}
```

The lockfile makes runs reproducible and prevents content from changing during
execution.

### Registry CLI

Start with:

```bash
areg validate
areg build
areg search "AWS migration"
areg inspect skill:tstack/spec
areg resolve profile:tstack/aws-swe
areg lock profile:tstack/aws-swe
areg install --lock agent.lock.json
areg diff-lock old.lock.json new.lock.json
```

Do not start with a server. A Git-backed static registry plus CLI is enough.

## `agent-harness`

`agent-harness` executes resolved workflows deterministically and safely.

Core responsibilities:

- Run lifecycle
- Workflow state machine
- Model and host invocation
- Tool invocation
- Policy checks
- Approval gates
- Workspace/worktree management
- Retry and timeout behavior
- Checkpoints
- Context budgeting
- Trace/event generation
- Artifact collection
- Resume and cancellation
- Parallel workers
- Adapter runtime

Suggested layout:

```text
agent-harness/
  README.md
  package.json
  src/
    engine/
      run-controller.ts
      workflow-executor.ts
      step-executor.ts
      state-machine.ts
      scheduler.ts
    contracts/
      registry.ts
      events.ts
      tools.ts
      models.ts
      checkpoints.ts
    workspace/
      local-workspace.ts
      git-worktree.ts
      sandbox-workspace.ts
    adapters/
      model/
        claude-code/
        codex/
        copilot/
        ollama/
        bedrock/
      tool/
        filesystem/
        git/
        github/
        mcp/
        openapi/
      runtime/
        local-process/
        tmux/
        docker/
        agentcore/
        ecs/
    policy/
      engine.ts
      approval.ts
      redaction.ts
      audit.ts
    context/
      budget.ts
      compression.ts
      handoff.ts
      memory.ts
    checkpoints/
    observability/
    artifacts/
    cli/
  schemas/
  tests/
    contract/
    integration/
    conformance/
    fixtures/
  examples/
```

### Step State Machine

The harness should run state, not prompt prose:

```text
PENDING
  -> RESOLVING
  -> POLICY_CHECK
  -> WAITING_FOR_APPROVAL -> REJECTED
  -> RUNNING
  -> VALIDATING
  -> SUCCEEDED
```

Failure paths:

```text
RUNNING -> RETRYING -> RUNNING
RUNNING -> FAILED
RUNNING -> TIMED_OUT
RUNNING -> CANCELLED
RUNNING -> CHECKPOINTED
```

Persist state records:

```json
{
  "runId": "run_01...",
  "workflow": "tstack/feature-delivery@0.1.0",
  "lockDigest": "sha256:...",
  "status": "running",
  "currentStep": "review",
  "steps": {
    "investigate": {
      "status": "succeeded",
      "attempt": 1,
      "outputArtifact": "artifact://investigation.json"
    },
    "implement": {
      "status": "succeeded",
      "checkpoint": "checkpoint://implement-1"
    },
    "review": {
      "status": "running",
      "attempt": 2
    }
  }
}
```

### Adapter Contracts

Model adapter:

```ts
interface ModelAdapter {
  capabilities(): Promise<ModelCapabilities>;
  invoke(request: ModelRequest): AsyncIterable<ModelEvent>;
  cancel(runId: string): Promise<void>;
}
```

Tool adapter:

```ts
interface ToolAdapter {
  descriptor(): ToolDescriptor;
  invoke(
    request: ToolRequest,
    context: ToolExecutionContext
  ): Promise<ToolResult>;
}
```

Workspace adapter:

```ts
interface WorkspaceAdapter {
  prepare(spec: WorkspaceSpec): Promise<WorkspaceHandle>;
  checkpoint(handle: WorkspaceHandle): Promise<Checkpoint>;
  restore(checkpoint: Checkpoint): Promise<WorkspaceHandle>;
  dispose(handle: WorkspaceHandle): Promise<void>;
}
```

Runtime adapter:

```ts
interface RuntimeAdapter {
  start(request: RuntimeStartRequest): Promise<RuntimeHandle>;
  send(handle: RuntimeHandle, message: RuntimeMessage): Promise<void>;
  events(handle: RuntimeHandle): AsyncIterable<RuntimeEvent>;
  stop(handle: RuntimeHandle): Promise<void>;
}
```

This lets local tmux and AgentCore share one workflow engine.

### Runtime Priority

Prioritize local-first runtime modes:

1. `local-process`
2. `tmux`
3. `docker`
4. `remote-ssh`
5. `agentcore`
6. `ecs-fargate`

Example commands:

```bash
ah run feature-delivery \
  --runtime tmux \
  --model claude-code \
  --workspace git-worktree

ah run feature-delivery \
  --runtime agentcore \
  --model bedrock \
  --workspace sandbox
```

### Tmux Harness Protocol

```text
harness controller
  |
  +-- tmux session: run-123
  |     +-- window: planner
  |     +-- window: backend
  |     +-- window: frontend
  |     +-- window: tests
  |     +-- window: reviewer
  |
  +-- filesystem inbox/outbox
  +-- structured event parser
  +-- worktree manager
  +-- checkpoint state
```

Do not treat terminal text as the only protocol. Workers should write structured
envelopes:

```text
.run/run-123/workers/backend/outbox/events.jsonl
.run/run-123/workers/backend/outbox/result.json
.run/run-123/workers/backend/outbox/artifacts.json
```

Example event:

```json
{
  "type": "worker.completed",
  "runId": "run-123",
  "workerId": "backend",
  "timestamp": "2026-07-11T13:00:00Z",
  "result": {
    "status": "success",
    "summary": "Implemented filtering API",
    "changedFiles": ["src/api/filter.ts"]
  }
}
```

## `agent-pack`

`agent-pack` is the home for authored content currently in this repo.

Target shape:

```text
agent-pack/
  skills/
  agents/
  workflows/
  stacks/
  domains/
  profiles/
  tools/
  policies/
  packs/
    core-swe/
    aws-serverless/
    agentcore/
    databricks-ml/
    modernization/
    interview-stack/
  tests/
  scripts/
  registry-export/
```

This directory should contain source content and thin manifests, but no
execution engine.

Pack example:

```yaml
apiVersion: tstack.dev/v1alpha1
kind: Pack
metadata:
  id: tstack/aws-agentic-swe
  version: 0.1.0
spec:
  includes:
    skills:
      - tstack/spec@^1
      - tstack/investigate@^1
      - tstack/review@^1
      - tstack/test@^1
      - tstack/ship@^1
    stacks:
      - tstack/aws@^1
      - tstack/python@^1
    domains:
      - tstack/agentcore@^1
    workflows:
      - tstack/feature-delivery@^1
    agents:
      - tstack/aws-architect@^1
  defaults:
    profile: enterprise-local
```

Keep templates and rendered outputs separate:

```text
skills/spec/
  skill.yaml
  prompt.md.tmpl
  references/
  examples/
  tests/

dist/
  claude-code/spec/SKILL.md
  codex/spec/AGENTS.md
  copilot/spec/copilot-instructions.md
```

Host output stays derived.

## Registry Features

Build in this order:

1. Schema and validation
2. Dependency graph resolver
3. Compatibility scoring
4. Registry search
5. Pack publishing

Validation should cover:

- Unique IDs
- Semantic versions
- Dependency existence
- Dependency cycles
- Version compatibility
- Capability availability
- Policy compatibility
- Host compatibility
- Missing artifact paths
- Integrity digests
- Deprecated dependencies

Resolver graph:

```text
profile
  -> workflows
  -> agents
  -> skills
  -> tools
  -> providers
  -> policies
  -> host/runtime capability requirements
```

Resolver failures should explain cause and fix:

```text
Cannot resolve tstack/diagram@1.2.0
Reason:
  diagram requires capability diagram.render
  selected profile has no provider for diagram.render
Available providers:
  drawio-mcp@1.0.0
  mermaid-cli@2.1.0
Suggested fix:
  areg profile add-provider diagram.render=mermaid-cli
```

Compatibility can return warnings, not only pass/fail:

```json
{
  "status": "compatible-with-warnings",
  "score": 0.82,
  "warnings": [
    "Skill was tested with Claude Code and Codex, but not Copilot.",
    "MCP provider requires outbound egress."
  ]
}
```

Registry search should support natural-language purpose, capability, stack,
domain, host, maintenance status, policy posture, tool requirement, and workflow
stage.

Initial publishing should use immutable Git tags and generated indexes:

```bash
areg publish ./skills/spec
areg publish-pack ./packs/aws-agentic-swe
```

Later, consider OCI artifacts for immutable digests, authentication, private
registries, mirroring, signing, provenance, and distribution.

## Harness Features

### Dry-Run Planning

```bash
ah plan workflow:tstack/feature-delivery
```

Expected output shape:

```text
Workflow: feature-delivery@0.1.0
Runtime: tmux
Workspace: git-worktree
Workers: 4
Required capabilities:
  ok workspace.read
  ok workspace.write
  ok shell.execute
  approval github.pull-request.create
Estimated execution graph:
  investigate
      |
  spec
      |
  backend --+
  frontend -+-> review -> test -> ship
  tests ----+
```

### Policy Engine

Convert default posture into action-oriented rules:

```yaml
rules:
  - action: workspace.read
    effect: allow
  - action: workspace.write
    effect: allow
    conditions:
      pathWithinWorkspace: true
  - action: shell.execute
    effect: approval
    when:
      commandRisk: high
  - action: network.egress
    effect: deny
    unless:
      destinationInAllowlist: true
  - action: git.push
    effect: approval
  - action: deployment.execute
    effect: deny
    environments: [production]
```

### Context Contracts

Use bounded handoff structures:

```json
{
  "objective": "...",
  "constraints": [],
  "decisions": [],
  "relevantFiles": [],
  "artifacts": [],
  "openQuestions": [],
  "acceptanceCriteria": [],
  "tokenBudget": 12000
}
```

Do not pass complete chat transcripts between agents by default.

### Checkpoint And Resume

```bash
ah resume run_123
ah retry run_123 --step test
ah fork run_123 --from implement
```

Checkpoint:

- Workflow state
- Resolved lockfile
- Workspace commit SHA
- Agent handoff package
- Tool results
- Approval decisions
- Artifact references

Avoid storing secrets or full prompts.

### Event Protocol

Use one event format across local and cloud runtimes:

```json
{
  "specVersion": "1.0",
  "id": "evt_123",
  "type": "step.completed",
  "timestamp": "2026-07-11T13:45:00Z",
  "runId": "run_123",
  "workflowId": "feature-delivery",
  "stepId": "review",
  "workerId": "reviewer",
  "data": {
    "status": "success"
  }
}
```

Important event types:

- `run.created`
- `run.started`
- `run.completed`
- `run.failed`
- `step.resolving`
- `step.started`
- `step.output`
- `step.completed`
- `step.failed`
- `tool.requested`
- `tool.approved`
- `tool.denied`
- `tool.completed`
- `model.started`
- `model.token_usage`
- `artifact.created`
- `checkpoint.created`
- `worker.started`
- `worker.heartbeat`
- `worker.completed`
- `policy.evaluated`
- `approval.requested`
- `approval.resolved`

### Conformance Suite

Every adapter should pass the same suite:

- Model adapter conformance
- Tool adapter conformance
- Runtime adapter conformance
- Workspace adapter conformance
- Checkpoint conformance
- Cancellation conformance
- Redaction conformance

## Additional Repositories

### `agent-evals`

Build after minimal registry and harness work.

```text
agent-evals/
  scenarios/
  datasets/
  rubrics/
  judges/
  replay/
  regression/
  reports/
```

Responsibilities:

- Golden tasks
- Workflow regression
- Skill quality scoring
- Cross-model comparisons
- Tool-use correctness
- Security-policy testing
- Cost/token comparisons
- Run replay
- Failure taxonomy

Example:

```bash
aeval run suite:swe-core \
  --models claude-code,codex \
  --harness-version 0.3.0
```

### `agent-observability`

Keep observability inside the harness until the event protocol stabilizes. Split
later if it becomes independently reusable.

Possible scope:

- Local trace viewer
- AG-UI event stream
- OpenTelemetry exporter
- Run timeline
- Tool-call graph
- Token/cost dashboard
- Retry and failure analytics
- Worker utilization
- Context-size evolution

### `agent-control-plane`

Build last.

Responsibilities:

- Web UI
- Run submission
- Approval inbox
- Registry browsing
- Run history
- Policy administration
- Remote worker coordination
- Team/RBAC
- Secrets references
- Environment management
- Mobile interface

Do not put execution logic here. It submits jobs to a harness worker.

```text
Web/mobile
  -> Control-plane API
  -> Queue
  -> Harness worker
  -> Local tmux / AgentCore / ECS / Kubernetes
```

### `agent-project-template`

Template repo for consumers:

```text
.agent/
  profile.yaml
  agent.lock.json
  policy.yaml
  workflows/
  overrides/
CLAUDE.md
AGENTS.md
.github/copilot-instructions.md
```

## Repos Not To Create Yet

Avoid premature standalone repos:

- `agent-policies`
- `agent-adapters`
- `agent-tools`
- `agent-memory`
- `agent-events`
- `agent-workflows`
- `agent-skills`
- `agent-model-gateway`
- `agent-context`

These are good packages or modules, but not initial repos.

Start with:

```text
agent-registry
agent-harness
agent-pack
```

Then add:

```text
agent-evals
```

Add control plane only when remote/team use needs it.

## Migration Plan

### Phase 0: Freeze Boundaries

In `agent-pack`, avoid new long-lived runtime features. Do not add a new
execution engine, registry API, control plane, or external service integrations
there.

Use ownership markers:

```text
@registry
@harness
@packs
@generated
@legacy
```

Machine-readable migration manifest:

```json
{
  "core": "agent-harness",
  "hooks": "agent-harness",
  "hosts": "agent-registry",
  "policies": "agent-harness",
  "skills": "agent-pack",
  "agents": "agent-pack",
  "adapters/definitions": "agent-pack",
  "adapters/runtime": "agent-harness",
  "tool-providers/definitions": "agent-pack",
  "stacks": "agent-pack",
  "domains": "agent-pack",
  "profiles": "agent-pack"
}
```

### Phase 1: Extract Contracts

Create `@tstack/contracts` with:

- Registry entity types
- Workflow types
- Event envelopes
- Capability identifiers
- Policy decision types
- Lockfile schema
- Adapter interfaces

Move by contract, not by directory copy.

### Phase 2: Build `agent-registry`

First milestone:

```bash
areg import ../tstack/agent-pack
areg validate
areg build
areg resolve profile:enterprise-modernization
areg lock profile:enterprise-modernization
```

Use current generated registry-shaped artifacts as import sources. Do not
rewrite every skill directory first.

### Phase 3: Build Thin `agent-harness`

Initial execution support:

- Single workflow
- Sequential steps
- Local workspace
- Local process adapter
- Claude/Codex host adapter
- Filesystem and shell tools
- JSONL events
- Local checkpoint file
- Policy allow/deny/approval

Do not begin with distributed multi-agent execution.

### Phase 4: Add Tmux Parallelism

Add:

- Worker leases
- Git worktrees
- Parallel DAG steps
- Inbox/outbox protocol
- Heartbeats
- Cancellation
- Merge staging
- Review/test gates

### Phase 5: Move Source Content Into `agent-pack`

Move one category at a time. Update discovery, installation, and tests before
moving directories.

Recommended order:

1. Profiles
2. Workflows
3. Agents
4. Stacks/domains
5. Skills
6. Adapter definitions
7. Tool-provider definitions

Skills move last because they have the most legacy build and generated-output
coupling.

## First Release Scope

### `agent-registry` v0.1

- JSON schemas
- Importer for current `agent-pack`
- Validation
- Static registry generator
- Search CLI
- Dependency graph
- Lockfile generation
- One profile resolver
- Git artifact support
- Integrity hashes

### `agent-harness` v0.1

- Load lockfile
- Load workflow
- Sequential step executor
- Claude Code adapter
- Codex adapter
- Local process runtime
- Local workspace
- Filesystem, shell, and git tools
- Policy checks
- JSONL traces
- Checkpoint/resume
- Dry run

### `agent-pack` v0.1 Extraction Target

Start with 10-15 canonical components:

```text
skills:
  brainstorming
  investigate
  spec
  review
  test
  qa
  ship
  context-save
  context-restore
  verification-before-completion

agents:
  planner
  implementer
  reviewer
  tester

workflows:
  investigate-and-fix
  feature-delivery
  pre-commit-review
```

Do not migrate every skill before proving the contract.

## High-Value Features

After the basic split, prioritize:

1. Workflow replay: rerun from recorded model/tool outputs without spending tokens.
2. Capability-based tool routing: skills request capabilities, profiles select providers.
3. Policy simulation: show allow/deny/approval before a run.
4. Run fork: branch from a checkpoint with a different model or strategy.
5. Cross-model review: implement with Claude, review with Codex, or reverse.
6. Prompt and skill provenance: record exact package digest per step.
7. Evaluation gates: block skill publication on benchmark regression.
8. Context-budget enforcement: per-workflow and per-step token caps.
9. Structured agent handoffs: schema-bound outputs instead of transcript forwarding.
10. Local/mobile control surface: submit and approve tmux runs through lightweight UI.

## Strong Recommendation

Do not make `agent-registry` a website first. Do not make `agent-harness` a
large LangGraph application first.

Build:

```text
agent-registry = schemas + resolver + lockfile CLI
agent-harness  = state machine + adapter contracts + local executor
agent-pack     = versioned content
```

This foundation supports:

- Claude Code subscription sessions through tmux
- Codex CLI
- Copilot CLI
- Ollama/local models
- Bedrock and AgentCore
- LangGraph workflows
- MCP and native tools
- Local-only and enterprise-safe execution
- Later remote/cloud execution

First end-to-end success criterion:

```bash
areg loop lock tstack/verified-feature-delivery \
  --profile tstack/local-loop-engineering \
  --output agent.lock.json

ah loop run \
  --lock agent.lock.json \
  --task issue.md
```

That flow forces the right contracts between authored content, registry
resolution, policy, tools, runtime adapters, workspaces, checkpoints, and traces
without prematurely building a control plane.
