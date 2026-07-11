# Runbook: Subagent Failure

Diagnose and recover from a failed subagent invocation.

## Failure Modes

### 1. Manifest validation error

**Symptom:** `createSubagentManifest` throws at dispatch time.

**Common causes:**

| Error message | Fix |
|---------------|-----|
| `Unknown subagent role: X` | Use a valid role from `ROLE_DEFAULTS` in `core/subagents.mjs` |
| `X requires at least one allowed path` | Add `allowedPaths` for write-capable roles |
| `X cannot use write tool Y` | Remove write tools from read-only roles (`explorer`, `reviewer`) |
| `Subagent manifest contains forbidden field X` | Remove sensitive fields (`token`, `password`, etc.) from manifest |
| `Invalid subagent id: X` | Use lowercase alphanumeric + hyphens only, 2–63 chars |

### 2. Path scope violation

**Symptom:** `verifySubagentPaths` returns `ok: false` with violations.

**Diagnosis:**

```js
import { verifySubagentPaths } from './core/subagents.mjs';
const result = verifySubagentPaths(manifest, changedFiles);
console.log(result.violations);
```

**Fix options:**

- Expand `allowedPaths` in the manifest if the file should be allowed.
- Move the file operation to a different subagent with broader scope.
- Split the task so only the correct subagent touches each path.

### 3. Artifact directory escape

**Symptom:** `Subagent artifact path escapes declared directory` error.

**Cause:** A path was constructed that traverses above `.agent-pack/subagents/<id>/`.

**Fix:** Do not accept subagent IDs from untrusted input. Validate with `validateId`
before constructing paths.

### 4. Result redaction

**Symptom:** Result JSON shows `"[REDACTED]"` for expected fields.

**Cause:** The result object contained a field in `FORBIDDEN_FIELDS`
(`token`, `cookie`, `apiKey`, `password`, `secret`, `credential`, `fullPrompt`, `fileContents`).

**Fix:** Do not pass sensitive data through subagent results. Credentials stay in
environment variables; file contents are referenced by path, not embedded.

### 5. Stale manifest or result

**Symptom:** Coordinator reads a manifest that does not match the current task.

**Fix:**

```bash
rm -rf .agent-pack/subagents/<id>/
```

Re-dispatch the subagent. The coordinator writes a fresh manifest before dispatch.

## Audit Log Recovery

If a subagent failure left a partial audit trail:

```bash
ls .agent-pack/audit/
```

Audit events are append-only JSONL. A failed run's events remain and can be reviewed:

```bash
cat .agent-pack/audit/audit.jsonl | tail -20
```

## Escalation

If the failure cannot be resolved locally:

1. Capture the manifest: `cat .agent-pack/subagents/<id>/manifest.json`
2. Capture the partial result (if any): `cat .agent-pack/subagents/<id>/result.json`
3. Note the error message and stack trace.
4. File an issue or escalate via `humanEscalation` tool if available.
