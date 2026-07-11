# AG-UI Event Contract

The architecture should produce structured events that can map to AG-UI later
without rewriting skills.

This document defines the package-level event vocabulary. It is not an AG-UI
implementation.

## Event Envelope

Every event should fit this envelope:

```json
{
  "id": "event-uuid",
  "type": "progress",
  "timestamp": "2026-06-17T00:00:00Z",
  "source": {
    "host": "codex",
    "skill": "review",
    "profile": "enterprise-default"
  },
  "correlationId": "run-uuid",
  "payload": {}
}
```

## Event Types

| Type | Purpose |
|---|---|
| `run.started` | A skill or agent run started. |
| `run.completed` | A skill or agent run completed. |
| `run.failed` | A skill or agent run failed. |
| `progress` | Human-readable progress update. |
| `approval.requested` | A policy-gated action needs approval. |
| `approval.resolved` | A requested approval was allowed or denied. |
| `tool.requested` | A tool call was proposed. |
| `tool.completed` | A tool call completed. |
| `tool.failed` | A tool call failed. |
| `artifact.created` | A file, plan, report, or generated artifact was created. |
| `finding.created` | A review, QA, security, or measurement finding was produced. |
| `audit.recorded` | A local audit event was written. |
| `human.escalated` | Work was escalated to a human queue or owner. |

## Approval Payload

```json
{
  "action": "databaseRead",
  "reason": "Skill requested campaign measurement data summary.",
  "risk": "enterprise-data-read",
  "requestedBy": "skills/domain/uplift-modeling",
  "target": "databricks:campaign_measurement",
  "expiresAt": "2026-06-17T01:00:00Z"
}
```

Approval payloads must not include secrets, raw customer records, full prompts,
or full query results.

## Tool Payload

```json
{
  "tool": "runTests",
  "mode": "read",
  "policyDecision": "allow",
  "target": "backend unit tests",
  "summary": "Run Spring Boot unit tests for changed modules."
}
```

Tools that change state must include the policy decision and audit correlation
id.

## Finding Payload

```json
{
  "category": "measurement-validity",
  "severity": "high",
  "title": "Treatment and control windows are misaligned",
  "summary": "The campaign uplift estimate compares users over different exposure windows.",
  "evidenceRefs": ["artifact://review-report#finding-3"],
  "recommendedAction": "Align observation windows before reporting uplift."
}
```

Findings should be specific enough for humans to act on without requiring raw
private data in the event.

## Artifact Payload

```json
{
  "kind": "spec",
  "path": "agent-pack/SPEC.md",
  "summary": "Updated migration spec with Google ADK adapter target."
}
```

Artifact events may include local paths. They must not include full file
contents.

## Design Rules

- Events are append-only.
- Events are local by default.
- Events do not imply external telemetry.
- UI adapters can transform these events into AG-UI later.
- Skills should emit structured summaries instead of relying only on prose.
- State values, secrets, raw datasets, credentials, and full prompts are never
  event payloads.
