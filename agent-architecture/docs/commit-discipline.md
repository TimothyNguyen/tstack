# Commit Discipline

Every commit in this package should change one behavior surface.

The goal is not small commits for their own sake. The goal is reviewable,
rollbackable migration work where each commit has a clear reason to exist.

## Rule

A commit may touch multiple files only when all touched files support the same
externally describable behavior.

If a reviewer cannot summarize the commit as "this commit adds/changes/removes
one thing," split it.

## Good Commit Shapes

| Commit | Why it is scoped |
|---|---|
| `docs: define agent architecture module map` | Adds one architecture decision document. |
| `core: add host config schema` | Adds one core contract and tests for that contract. |
| `hosts: add codex host adapter` | Adds one host target. |
| `policies: disable public egress by default` | Adds one policy behavior and tests. |
| `skills: add review skill skeleton` | Adds one generic skill. |
| `profiles: add marketing measurement profile` | Adds one optional profile composition. |

## Bad Commit Shapes

| Commit | Problem |
|---|---|
| `initial migration` | Hides many behavior changes in one review. |
| `enterprise hardening` | Too broad; could include policy, installer, telemetry, browser, and docs. |
| `add skills and policies` | Mixes user-facing instructions with enforcement behavior. |
| `cleanup` | No behavior boundary. |
| `misc fixes` | No reviewable scope. |

## Split Examples

Do not commit this as one change:

```text
Add host config schema, add Claude adapter, add default policy, add review skill.
```

Split it into:

```text
core: add host config schema
hosts: add claude host adapter
policies: add default local policy
skills: add review skill skeleton
```

Do not commit this as one change:

```text
Remove telemetry and add audit logging.
```

Split it into:

```text
policies: disable public telemetry by default
core: add local audit event writer
```

## Commit Checklist

Before committing:

- The diff is inside `agent-architecture/` unless the task explicitly says
  otherwise.
- The commit does not modify upstream `agent-architecture/`.
- The commit has one behavior surface.
- The commit message names that behavior surface.
- New privileged behavior has a policy or audit requirement.
- New generated output has a source file or documented reason.
- No public egress, telemetry, tunnel, cookie import, or credential access is
  introduced by default.

## Message Format

Use conventional prefixes when they help review:

- `docs:`
- `core:`
- `hosts:`
- `skills:`
- `policies:`
- `profiles:`
- `adapters:`
- `tests:`

Prefer direct messages:

```text
core: add host config schema
policies: add default no-egress policy
docs: inventory agent-architecture migration decisions
```

Avoid vague messages:

```text
update files
fix stuff
enterprise work
```
