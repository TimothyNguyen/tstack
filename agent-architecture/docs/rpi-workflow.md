# RPI Workflow

`RPI` means `Research -> Plan -> Implement`.

Use it when request vague, risk non-trivial, or repo messy enough that coding first wastes time.

## Goal

Force decision gates before implementation:

- research asks "should this be built?"
- plan asks "what exact sequence should ship?"
- implement asks "did code match plan?"

## Canonical Artifact Layout

```text
work/{feature-slug}/
|-- REQUEST.md
|-- research/
|   `-- RESEARCH.md
|-- plan/
|   |-- PLAN.md
|   |-- product.md
|   |-- ux.md
|   `-- eng.md
`-- implement/
    `-- IMPLEMENT.md
```

Names can vary. Structure matters more than exact filenames.

## Phase 1: Research

Inputs:

- user request
- current repo state
- constraints

Outputs:

- feasibility
- risks
- dependencies
- open questions
- go / no-go recommendation

Good local fits:

- `investigate`
- `brainstorming`
- lightweight CodeGraph lookups

Exit gate:

- clear verdict
- no critical unknown hidden

## Phase 2: Plan

Convert research into execution artifact:

- scope
- acceptance criteria
- rollout phases
- tests
- migration / rollback steps

Good local fits:

- `spec`
- `autoplan`
- `plan-eng-review`
- `plan-devex-review`
- `plan-design-review`

Exit gate:

- phase order defensible
- acceptance criteria testable
- owners and dependencies explicit

## Phase 3: Implement

Deliver phase by phase:

- code
- tests
- docs
- implementation notes

Good local fits:

- `swe`
- `review`
- `qa-agent`
- `ship`

Exit gate:

- plan satisfied or updated
- tests passing
- residual risks documented

## Mapping To This Package

- research: orchestrator or investigator-style flow
- plan: spec-first workflow
- implement: swe + review + qa
- cross-host verification: see [cross-model-workflows.md](cross-model-workflows.md)

## Common Failure Modes

- research skipped because request sounds easy
- plan written as vague essay, not execution order
- implementation changes scope without updating plan
- docs and validation left for end, then dropped
