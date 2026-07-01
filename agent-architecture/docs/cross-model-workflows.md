# Cross-Model Workflows

Use different coding hosts for different jobs. Keep one shared artifact. Avoid parallel drift.

## Best-Fit Split

- host 1 creates plan
- host 2 pressure-tests plan against real code
- host 1 implements approved phases
- host 2 verifies behavior, tests, and gaps

Claude Code + Codex is one example. Same pattern works with other strong planner / reviewer pairs.

## Canonical Artifact

Use one tracked plan file per feature, for example:

```text
plans/{feature-name}.md
```

Rules:

- original planner owns phase structure
- reviewer appends findings, risks, or missing phases
- reviewer does not silently rewrite approved intent
- implementation follows plan deltas, not chat memory

## Recommended Flow

### 1. Plan

Primary host produces:

- problem statement
- constraints
- phased rollout
- test gates
- rollback notes for risky changes

Good local fits:

- `spec`
- `autoplan`
- `plan-*` review skills when design or devex matters

### 2. Adversarial Review

Second host reviews plan against codebase reality:

- missing dependencies
- wrong assumptions
- unsafe sequencing
- missing migration or test steps
- hidden cleanup work

Append findings under explicit headings like:

```markdown
## Codex Finding: Missing Migration Phase
```

Do not replace earlier phases unless plan owner explicitly approves restructure.

### 3. Implement

Execution host works phase by phase:

- change code
- run tests at phase boundaries
- update plan if scope changes

Good local fits:

- `swe`
- `subagent-orchestrator`
- `review`

### 4. Verify

Second host checks delivered result against plan and code:

- acceptance criteria met
- tests added where needed
- docs updated
- no skipped risk items

Good local fits:

- `qa-agent`
- `review`
- `ship`

## Handoff Rules

- use files, not transcript summaries, for cross-host state
- record exact commands, failed tests, and open risks
- keep reviewer findings additive and attributable
- if implementation diverges, update plan before more coding

## Failure Modes

- two hosts edit same plan section without ownership
- reviewer rewrites plan instead of annotating it
- implementation starts before review closes major risks
- verification checks claims, not actual repo state

## When To Use

Use this pattern when:

- feature spans multiple systems
- repo unfamiliar
- failure cost high
- one host stronger at planning, another stronger at repo-grounded critique

Skip it for tiny edits where second-host overhead exceeds risk.
