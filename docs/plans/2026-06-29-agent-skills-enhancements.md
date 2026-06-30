# agent-architecture: agent-skills Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 enhancements from addyosmani/agent-skills analysis: `references/` checklist dir, `doubt-driven-development` core skill, parallel fan-out `ship`, `observability-and-instrumentation` specialty skill, and OWASP LLM Top 10 in `security-review`.

**Architecture:** Core skills (`doubt-driven-development`) land in `agent-architecture/` root and ship with the base package. Specialty skills (`observability-and-instrumentation`) land in `packages/skills/`. Static reference files go in `agent-architecture/references/`. All skills follow the SKILL.md.tmpl → SKILL.md build pipeline. The `ship` enhancement is an in-place modification to the existing `ship/SKILL.md.tmpl`.

**Tech Stack:** Node.js ESM, `npm run build:skills` (gen-skill-docs.mjs), `npm test` (node:test built-in runner)

## Global Constraints

- All new SKILL.md.tmpl files must declare `agents:` field using only valid agent names: `orchestrate`, `swe`, `qa-agent`, `pm`, `spec-agent`, `design-agent`, `migration`, `data`, `cloud`, `interviewer`, `release-agent`, `security`, `diagram-agent`, `migration-engineer`, `_infrastructure`, `_linter`
- SKILL.md generated body must be >= 200 bytes (enforced by skill-structure.test.mjs)
- SKILL.md description must be <= 1024 chars
- New core skills must be added to `agent-architecture/package.json` `files[]`
- New specialty skills must be added to `agent-architecture/packages/skills/package.json` `files[]`
- After every SKILL.md.tmpl change: run `npm run build:skills` from `agent-architecture/`, then `npm test`
- Do not add public telemetry, public tunnels, credential reads, or egress bypasses to any skill content
- Each commit must follow Conventional Commits: `feat(<scope>): <description>`
- All commands run from `agent-architecture/` directory unless stated otherwise

---

### Task 1: `references/` checklist directory

**Files:**
- Create: `agent-architecture/references/security-checklist.md`
- Create: `agent-architecture/references/definition-of-done.md`
- Create: `agent-architecture/references/test-quality.md`
- Modify: `agent-architecture/package.json` (add `"references/"` to `files[]`)

**Interfaces:**
- Consumes: nothing
- Produces: `agent-architecture/references/` with 3 markdown checklists; Task 5 links to `references/security-checklist.md`

- [ ] **Step 1: Create `references/security-checklist.md`**

Create `agent-architecture/references/security-checklist.md`:

```markdown
# Security Checklist

Use this checklist before shipping any code that handles data, credentials, agent tools, or external integrations.

## Application Security (OWASP Top 10)

- [ ] A01 Broken Access Control — verify auth on every endpoint; no IDOR; enforce least-privilege
- [ ] A02 Cryptographic Failures — no plaintext secrets; TLS enforced; strong key sizes
- [ ] A03 Injection — parameterized queries; no shell interpolation of user input; sanitize prompts
- [ ] A04 Insecure Design — threat-modeled? trust boundaries drawn? fail-safe defaults?
- [ ] A05 Security Misconfiguration — no debug endpoints exposed; headers set; defaults hardened
- [ ] A06 Vulnerable Components — no known CVEs in direct/transitive deps
- [ ] A07 Auth Failures — session expiry; secure cookie flags; no credential logging
- [ ] A08 Software Integrity — deps pinned or hash-verified; no unsigned artifact
- [ ] A09 Logging Failures — security events logged; no secrets in logs
- [ ] A10 SSRF — allowlist outbound targets; no user-controlled URLs to internal hosts

## LLM and Agent Security (OWASP LLM Top 10)

- [ ] LLM01 Prompt Injection — untrusted content fenced or sanitized before entering prompt; no instruction-override from data sources
- [ ] LLM02 Insecure Output Handling — LLM output rendered to HTML? escape it. Executed as code? gate it
- [ ] LLM03 Training Data Poisoning — fine-tune/RAG data pipeline integrity verified? source hash-checked?
- [ ] LLM04 Model DoS — token budget capped; retry loops bounded; rate limits on inference calls enforced
- [ ] LLM05 Supply Chain — model weights, plugins, tool packages from trusted sources? versions pinned?
- [ ] LLM06 Sensitive Info Disclosure — PII, credentials, internal schema in prompt context minimized to what's strictly needed
- [ ] LLM07 Insecure Plugin Design — agent tool plugins declare allowlists? write/delete ops require approval gate?
- [ ] LLM08 Excessive Agency — agent has minimal tool grants for the task; irreversible actions require human-in-loop
- [ ] LLM09 Overreliance — agent output validated before acting on it? fallback if model unavailable?
- [ ] LLM10 Model Theft — model API keys rotated? inference endpoint access-controlled and not exposed publicly?

## Agent Tooling

- [ ] Tool allowlists declared and enforced
- [ ] Approval required for shell/git/deploy/db-write tools
- [ ] Audit events emitted for privileged tool calls
- [ ] Generated instructions cannot bypass policy
```

- [ ] **Step 2: Create `references/definition-of-done.md`**

Create `agent-architecture/references/definition-of-done.md`:

```markdown
# Definition of Done

A task or feature is done when ALL of the following are true.

## Code

- [ ] Implementation matches the spec — no extra features, no missing requirements
- [ ] No TODO/FIXME left behind in changed files
- [ ] No dead code introduced

## Tests

- [ ] Failing test written before implementation (TDD)
- [ ] All new behaviors covered by at least one test
- [ ] All tests pass (`npm test` green)
- [ ] Edge cases documented in test names, not comments

## Build

- [ ] `npm run build:skills` passes (if SKILL.md.tmpl changed)
- [ ] `npm run check:skills` passes
- [ ] No new lint errors

## Documentation

- [ ] README.md updated if new skill added
- [ ] GOVERNANCE.yaml present for new skills
- [ ] Interfaces documented in plan's Produces/Consumes blocks

## Security

- [ ] No secrets in code or committed files
- [ ] No new public egress
- [ ] Security checklist reviewed for code touching auth/data/agent tools

## Git

- [ ] Each commit follows Conventional Commits format
- [ ] Each commit is one describable behavior (no "and" in the description)
- [ ] No `--no-verify`, `--force`, or `--no-gpg-sign` used
```

- [ ] **Step 3: Create `references/test-quality.md`**

Create `agent-architecture/references/test-quality.md`:

```markdown
# Test Quality Checklist

Run this against any test file before merging.

## Test Names

- [ ] Test name states the behavior, not the implementation: `"returns 404 when user not found"` not `"test getUserById"`
- [ ] Negative cases named explicitly: `"throws when input is null"` not `"handles invalid input"`
- [ ] No generic names: no `"works"`, `"test 1"`, `"should work"`

## Structure

- [ ] One assertion per test where possible — one failure = one clear cause
- [ ] Arrange / Act / Assert structure visible in each test
- [ ] No test logic duplicated across tests — extract to helpers
- [ ] No test depends on another test's state (order-independent)

## Coverage

- [ ] Happy path covered
- [ ] Boundary values covered (empty, max, min, null/undefined)
- [ ] Error/failure paths covered
- [ ] New behaviors have at least one test each

## Mocks and Fixtures

- [ ] Mocks reset between tests
- [ ] Fixtures use the minimum data needed — no copy-paste bloat
- [ ] External calls (HTTP, DB) are mocked in unit tests

## Anti-patterns to Delete

- [ ] No `assert(true)` or empty test body
- [ ] No `setTimeout` in tests — use async/await
- [ ] No catching errors to suppress — let them propagate
- [ ] No commented-out tests — delete them
```

- [ ] **Step 4: Add `"references/"` to `package.json` `files[]`**

In `agent-architecture/package.json`, in the `files` array, add `"references/"` between `"reference-skill-patterns/"` and `"release/"`:

```json
"reference-skill-patterns/",
"references/",
"release/",
```

- [ ] **Step 5: Verify all three files exist**

```powershell
Test-Path agent-architecture/references/security-checklist.md
Test-Path agent-architecture/references/definition-of-done.md
Test-Path agent-architecture/references/test-quality.md
```

Expected: `True` for all three.

- [ ] **Step 6: Run tests**

```powershell
cd agent-architecture; npm test
```

Expected: all existing tests pass. No count change (plain markdown files add no new test targets).

- [ ] **Step 7: Commit**

```bash
git add agent-architecture/references/ agent-architecture/package.json
git commit -m "feat(references): add security, DoD, and test-quality checklists"
```

---

### Task 2: `doubt-driven-development` core skill

**Files:**
- Create: `agent-architecture/doubt-driven-development/SKILL.md.tmpl`
- Create: `agent-architecture/doubt-driven-development/GOVERNANCE.yaml`
- Create: `agent-architecture/doubt-driven-development/README.md`
- Generate: `agent-architecture/doubt-driven-development/SKILL.md` (via `npm run build:skills`)
- Modify: `agent-architecture/package.json` (add `"doubt-driven-development/"` to `files[]`)

**Interfaces:**
- Consumes: nothing from prior tasks
- Produces: `doubt-driven-development` skill discoverable by `discoverSkillAgents()` and `discoverTemplates()`, auto-tested by `skill-structure.test.mjs` (body size + description length)

- [ ] **Step 1: Note current test count**

```powershell
cd agent-architecture; npm test 2>&1 | Select-String "pass"
```

Note the number. After this task, count increases by 2 (body size + description tests for the new skill).

- [ ] **Step 2: Create `doubt-driven-development/SKILL.md.tmpl`**

Create `agent-architecture/doubt-driven-development/SKILL.md.tmpl`:

```markdown
---
name: doubt-driven-development
version: 0.1.0
description: |
  Challenge assumptions before and during implementation. Surface load-bearing doubts
  early so they can be resolved with evidence rather than discovered as bugs.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
agents: [swe, qa-agent, spec-agent]
---

{{PREAMBLE}}

# Doubt-Driven Development

Before implementing, surface and challenge assumptions. A doubt raised now is cheaper than a bug found in review.

## When to Use

Invoke when:
- Starting a task with unclear requirements
- The implementation path has multiple plausible interpretations
- A past assumption turned out to be wrong in this codebase
- The reviewer is likely to ask "did you consider X?"

## The Process

### Step 1: List Assumptions

Before writing any code, list every assumption the implementation depends on. One line each:

```
1. The user ID is always a UUID string, never an integer.
2. The API returns 404 (not 200 with empty body) when the resource is missing.
3. Concurrent calls to this function are not possible in the current usage.
4. The config file is always present at startup.
```

### Step 2: Rate Each Assumption

For each assumption, rate confidence and blast radius if wrong:

| # | Assumption | Confidence | Blast Radius if Wrong |
|---|------------|------------|----------------------|
| 1 | User ID is UUID string | High — seen in 12 call sites | Low — easy type fix |
| 2 | API returns 404 for missing | Medium — only tested in staging | High — silent data loss |
| 3 | No concurrent calls | Low — no lock in caller | High — race condition |
| 4 | Config always present | High — startup guard exists | Low — hard crash on start |

### Step 3: Surface Load-Bearing Doubts

Any assumption with **Low confidence AND High blast radius** is a load-bearing doubt. Do not proceed past this step until each is either:

a) **Verified** — point to evidence (file path, test, API doc, code comment)
b) **Mitigated** — implementation handles the failure case explicitly
c) **Accepted** — risk understood and signed off by the human

### Step 4: Implement With Doubt Markers

When writing code, mark unverified assumptions inline:

```js
// DOUBT: concurrent calls assumed impossible — add mutex if usage pattern changes
function processItem(id) { ... }
```

These markers become review hooks: the PR reviewer knows exactly where to focus.

### Step 5: Close Doubts Before Ship

Before marking the task done, resolve all doubt markers:
- Remove the marker and add an evidence comment, OR
- Convert to a tracked issue if the risk is accepted

{{POLICY_REQUIREMENTS}}

{{BASE_OUTPUT_RULES}}
```

- [ ] **Step 3: Create `doubt-driven-development/GOVERNANCE.yaml`**

Create `agent-architecture/doubt-driven-development/GOVERNANCE.yaml`:

```yaml
name: doubt-driven-development
type: skill
status: stable
version: 0.1.0
owner: swe-agent
description: |
  Challenge assumptions before and during implementation. Surface load-bearing doubts
  early so they can be resolved with evidence rather than discovered as bugs.
dependencies:
  skills:
    - spec
    - verification-before-completion
  adapters: []
  tools: []
  mcps: []
testing:
  coverage_target: 80
  types:
    - unit
documentation:
  readme: true
  spec: false
  examples_min: 2
used_by:
  - swe
  - qa-agent
  - spec-agent
governance_version: '1.0'
last_reviewed: '2026-06-29'
```

- [ ] **Step 4: Create `doubt-driven-development/README.md`**

Create `agent-architecture/doubt-driven-development/README.md`:

```markdown
# doubt-driven-development

[See SKILL.md for complete documentation.](./SKILL.md)

## Overview

Challenge assumptions before and during implementation. Surface load-bearing doubts early so they can be resolved with evidence rather than discovered as bugs.

## Quick Start

Refer to [SKILL.md](./SKILL.md) for:
- When to invoke this skill
- The 5-step assumption-surfacing process
- Doubt markers and how to close them before ship

## Related Skills

- [`spec`](../spec/) — define requirements before challenging assumptions
- [`verification-before-completion`](../verification-before-completion/) — final check before marking done
```

- [ ] **Step 5: Add `"doubt-driven-development/"` to `package.json` `files[]`**

In `agent-architecture/package.json`, add `"doubt-driven-development/"` between `"docs/"` and `"guard/"`:

```json
"docs/",
"doubt-driven-development/",
"guard/",
```

- [ ] **Step 6: Build skills to generate `SKILL.md`**

```powershell
cd agent-architecture; npm run build:skills
```

Expected: exits 0. Creates `agent-architecture/doubt-driven-development/SKILL.md`.

Verify:
```powershell
Test-Path agent-architecture/doubt-driven-development/SKILL.md
```
Expected: `True`

- [ ] **Step 7: Run tests**

```powershell
cd agent-architecture; npm test
```

Expected: all tests pass. Count increases by 2 vs Step 1 baseline.

- [ ] **Step 8: Commit**

```bash
git add agent-architecture/doubt-driven-development/ agent-architecture/package.json
git commit -m "feat(doubt-driven-development): add assumption-challenging core skill"
```

---

### Task 3: Parallel fan-out `ship` enhancement

**Files:**
- Modify: `agent-architecture/ship/SKILL.md.tmpl`
- Generate: `agent-architecture/ship/SKILL.md` (via `npm run build:skills`)

**Interfaces:**
- Consumes: existing `ship/SKILL.md.tmpl` (current content: 4-step stub)
- Produces: enhanced `ship` skill with 3-phase structure including parallel QA/Security/PM/DevEx review

- [ ] **Step 1: Replace `ship/SKILL.md.tmpl`**

Write the full new content of `agent-architecture/ship/SKILL.md.tmpl`:

```markdown
---
name: ship
version: 0.1.2
description: |
  Prepares a human-approved PR, merge, or release handoff. Runs parallel specialist
  review (QA, security, PM, DevEx) before producing the handoff artifact.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
agents: [swe, cloud, release-agent]
---

{{PREAMBLE}}

# Ship

Prepares a human-approved PR, merge, or release handoff.

## Phase 1: Confirm Scope

1. Confirm the user goal: what is being shipped, to where, and who approves.
2. Read relevant local project files: changelogs, migrations, config diffs.
3. Check policy requirements before any privileged action.

## Phase 2: Parallel Specialist Review

Before handoff, apply four specialist lenses. Treat each as an independent review — collect all findings before proceeding to Phase 3.

### QA Lens
- Are all acceptance criteria covered by tests?
- Is test coverage adequate for the changed paths?
- Are there regression risks in adjacent unchanged code?
- See `references/test-quality.md` for test quality signals.

### Security Lens
- Does the diff touch auth, credentials, data access, or agent tools?
- Are OWASP LLM Top 10 risks addressed for any LLM/agent code?
- Any new public egress, public endpoint, or privilege escalation?
- See `references/security-checklist.md` for the full checklist.

### PM / Stakeholder Lens
- Does the change match the spec? No undocumented behavior changes?
- Are breaking changes called out in the changelog?
- Is there anything a non-technical stakeholder needs to act on?

### DevEx Lens
- Does the diff introduce friction for the next engineer? (Dead code, magic numbers, missing types)
- Are error messages actionable?
- Is the commit history clean and atomic?

## Phase 3: Consolidate and Ship

1. Collect findings from all four lenses.
2. For any **Critical** finding: block ship, fix it first.
3. For any **Important** finding: document in PR description, assign follow-up.
4. For **Minor** findings: note in PR description.
5. Produce the handoff artifact with:
   - Summary of what changed and why
   - Findings from specialist review with severity
   - Explicit approval request from the human

{{POLICY_REQUIREMENTS}}

{{BASE_OUTPUT_RULES}}
```

- [ ] **Step 2: Build skills**

```powershell
cd agent-architecture; npm run build:skills
```

Expected: exits 0. Regenerates `agent-architecture/ship/SKILL.md`.

- [ ] **Step 3: Verify SKILL.md body length**

```powershell
(Get-Content agent-architecture/ship/SKILL.md -Raw).Length
```

Expected: > 1200 (body well exceeds 200-byte minimum).

- [ ] **Step 4: Run tests**

```powershell
cd agent-architecture; npm test
```

Expected: all tests pass. No count change (ship skill already existed).

- [ ] **Step 5: Commit**

```bash
git add agent-architecture/ship/SKILL.md.tmpl agent-architecture/ship/SKILL.md
git commit -m "feat(ship): add parallel specialist review phase (QA/security/PM/devex)"
```

---

### Task 4: `observability-and-instrumentation` specialty skill

**Files:**
- Create: `agent-architecture/packages/skills/observability-and-instrumentation/SKILL.md.tmpl`
- Create: `agent-architecture/packages/skills/observability-and-instrumentation/GOVERNANCE.yaml`
- Create: `agent-architecture/packages/skills/observability-and-instrumentation/README.md`
- Generate: `agent-architecture/packages/skills/observability-and-instrumentation/SKILL.md` (via `npm run build:skills`)
- Modify: `agent-architecture/packages/skills/package.json` (add `"observability-and-instrumentation/"` to `files[]`)

**Interfaces:**
- Consumes: nothing from prior tasks
- Produces: `packages/skills/observability-and-instrumentation` discoverable by `discoverTemplates(ROOT)` (discover-skills.mjs scans `packages/skills/` subdirs automatically), auto-tested by `skill-structure.test.mjs`

- [ ] **Step 1: Create `SKILL.md.tmpl`**

Create `agent-architecture/packages/skills/observability-and-instrumentation/SKILL.md.tmpl`:

```markdown
---
name: observability-and-instrumentation
version: 0.1.0
description: |
  Add structured observability to code and agent outputs: tracing, structured logging,
  metrics, and AG-UI-compatible event emission. Prevents silent failures in production.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
agents: [swe, cloud, qa-agent]
---

{{PREAMBLE}}

# Observability and Instrumentation

Add structured observability to code and agent outputs so failures are visible, diagnosable, and traceable without SSH access.

## When to Use

Invoke when:
- Adding a new service, endpoint, or agent tool
- A production failure was diagnosed by reading logs manually
- An agent output is consumed by a downstream system
- A background job or migration runs without progress reporting

## Instrumentation Patterns

### Structured Logging

Log at structured key-value pairs, not free-text strings.

**Do:**
```js
logger.info('user.created', { userId, email: redact(email), source });
```

**Don't:**
```js
console.log(`Created user ${email} from ${source}`);
```

Log levels:

| Level | When |
|-------|------|
| `error` | Unrecoverable failure — requires human action |
| `warn` | Recoverable anomaly — should be reviewed |
| `info` | Business event — user action, state change, integration call |
| `debug` | Implementation detail — disabled in prod by default |

Rules:
- Never log credentials, session tokens, PII, or full prompt/response text
- Include a correlation ID (`requestId`, `traceId`) on every log line
- Log at entry and exit of every external call (HTTP, DB, MCP tool)

### Tracing

Wrap external calls in a span:

```js
const span = tracer.startSpan('db.query', { attributes: { 'db.table': 'users', 'db.op': 'select' } });
try {
  const result = await db.query(sql, params);
  span.setStatus({ code: SpanStatusCode.OK });
  return result;
} catch (err) {
  span.recordException(err);
  span.setStatus({ code: SpanStatusCode.ERROR });
  throw err;
} finally {
  span.end();
}
```

Minimum spans:
- Each HTTP call out
- Each DB query
- Each MCP tool invocation
- Each agent sub-task dispatch

### Metrics

Define counters and histograms at module init, not inline:

```js
const requestCounter = meter.createCounter('http.requests', { description: 'Total HTTP requests by route and status' });
const latencyHistogram = meter.createHistogram('http.latency_ms', { description: 'Request latency in ms' });
```

Record at the exit point:

```js
requestCounter.add(1, { route: '/users', status: res.statusCode });
latencyHistogram.record(Date.now() - startMs, { route: '/users' });
```

### Agent Output Events (AG-UI Compatible)

When an agent produces output consumed by another system, emit structured events:

```js
emit({ type: 'tool.result', toolName: 'search', status: 'success', resultCount: hits.length, latencyMs });
emit({ type: 'tool.error', toolName: 'search', error: err.message, retryable: true });
```

Event fields:
- `type` — dot-namespaced string: `<domain>.<event>`
- `status` — `success` | `error` | `partial`
- No raw data, credentials, or full prompt text in event payload

## Review Checklist

Before shipping instrumented code:

- [ ] Every external call has entry/exit log lines with correlation ID
- [ ] No credentials, tokens, PII, or full prompt text in any log/event
- [ ] Error path logs include `error.message` and relevant context (not just `"failed"`)
- [ ] Metrics counters and histograms initialized once at module level
- [ ] Agent output events follow `<domain>.<event>` naming
- [ ] Debug logs are off by default in production config

{{POLICY_REQUIREMENTS}}

{{BASE_OUTPUT_RULES}}
```

- [ ] **Step 2: Create `GOVERNANCE.yaml`**

Create `agent-architecture/packages/skills/observability-and-instrumentation/GOVERNANCE.yaml`:

```yaml
name: observability-and-instrumentation
type: skill
status: stable
version: 0.1.0
owner: cloud-agent
description: |
  Add structured observability to code and agent outputs: tracing, structured logging,
  metrics, and AG-UI-compatible event emission. Prevents silent failures in production.
dependencies:
  skills:
    - security-review
    - health
  adapters: []
  tools: []
  mcps: []
testing:
  coverage_target: 80
  types:
    - unit
documentation:
  readme: true
  spec: false
  examples_min: 2
used_by:
  - swe
  - cloud
  - qa-agent
governance_version: '1.0'
last_reviewed: '2026-06-29'
```

- [ ] **Step 3: Create `README.md`**

Create `agent-architecture/packages/skills/observability-and-instrumentation/README.md`:

```markdown
# observability-and-instrumentation

[See SKILL.md for complete documentation.](./SKILL.md)

## Overview

Add structured observability to code and agent outputs: tracing, structured logging, metrics, and AG-UI-compatible event emission.

## Quick Start

Refer to [SKILL.md](./SKILL.md) for:
- When to invoke this skill
- Structured logging patterns and log level guide
- Tracing span patterns for external calls
- Metrics counter and histogram initialization
- AG-UI-compatible agent output event format and field requirements

## Related Skills

- [`health`](../health/) — health check endpoints and liveness probes
- [`security-review`](../security-review/) — verify logs contain no sensitive data
```

- [ ] **Step 4: Add `"observability-and-instrumentation/"` to `packages/skills/package.json` `files[]`**

In `agent-architecture/packages/skills/package.json`, add `"observability-and-instrumentation/"` between `"migration-sqlserver-test/"` and `"plan-design-review/"` (alphabetically: o comes after m, before p):

```json
"migration-sqlserver-test/",
"observability-and-instrumentation/",
"plan-design-review/",
```

- [ ] **Step 5: Build skills**

```powershell
cd agent-architecture; npm run build:skills
```

Expected: exits 0. Creates `agent-architecture/packages/skills/observability-and-instrumentation/SKILL.md`.

Verify:
```powershell
Test-Path agent-architecture/packages/skills/observability-and-instrumentation/SKILL.md
```
Expected: `True`

- [ ] **Step 6: Run tests**

```powershell
cd agent-architecture; npm test
```

Expected: all tests pass. Count increases by 2 vs Task 3 baseline (body size + description tests for the new skill).

- [ ] **Step 7: Commit**

```bash
git add agent-architecture/packages/skills/observability-and-instrumentation/ agent-architecture/packages/skills/package.json
git commit -m "feat(observability-and-instrumentation): add tracing/logging/metrics/AG-UI events skill"
```

---

### Task 5: OWASP LLM Top 10 in `security-review`

**Files:**
- Modify: `agent-architecture/packages/skills/security-review/sections/review-sections.md.tmpl`
- Generate: `agent-architecture/packages/skills/security-review/sections/review-sections.md` (via `npm run build:skills`)

**Interfaces:**
- Consumes: `references/security-checklist.md` from Task 1 (referenced in the new section's closing line)
- Produces: `security-review` skill with "LLM And Agent Security" section covering all 10 OWASP LLM Top 10 checks

- [ ] **Step 1: Replace `review-sections.md.tmpl` with LLM section added**

The current file has 4 sections: Agent Tooling, Data Access, Network And Egress, Credential And Session Safety. Write the full new content of `agent-architecture/packages/skills/security-review/sections/review-sections.md.tmpl`:

```markdown
# Security Review Sections

## Agent Tooling

- Check tool allowlists.
- Check approval requirements.
- Check audit events.
- Check that generated instructions do not bypass policy.

## Data Access

- Check database read/write boundaries.
- Check customer, campaign, experiment, and model-output access.
- Check that findings do not expose raw sensitive data.

## Network And Egress

- Check for public telemetry.
- Check for public update checks.
- Check for public tunnels.
- Check for public scraping.

## Credential And Session Safety

- Check for credential reads.
- Check for cookie/session import.
- Check for secrets in logs, events, prompts, or generated artifacts.

## LLM And Agent Security (OWASP LLM Top 10)

For any code or config that invokes an LLM, uses agent tools, or processes LLM output:

- LLM01 Prompt Injection — untrusted content fenced or sanitized before entering prompt context? No instruction-override from data sources.
- LLM02 Insecure Output Handling — LLM output rendered to HTML? Must escape. LLM output executed as code or shell? Requires explicit gate.
- LLM03 Training Data Poisoning — fine-tune or RAG data pipeline integrity verified? Source hash-checked?
- LLM04 Model DoS — token budget capped? Retry loops bounded? Rate limits on inference calls enforced?
- LLM05 Supply Chain — model weights, plugins, and tool packages from trusted sources? Versions pinned?
- LLM06 Sensitive Info Disclosure — PII, credentials, or internal schema in prompt context minimized to what's strictly needed?
- LLM07 Insecure Plugin Design — agent tool plugins declare allowlists? Write/delete operations require approval gate?
- LLM08 Excessive Agency — agent has minimal tool grants for the task? Irreversible actions require human-in-loop?
- LLM09 Overreliance — agent output validated before acting on it? Fallback if model unavailable?
- LLM10 Model Theft — model API keys rotated? Inference endpoint access-controlled and not exposed publicly?

See `references/security-checklist.md` for the full AppSec + LLM checklist.

{{BASE_OUTPUT_RULES}}
```

- [ ] **Step 2: Build skills**

```powershell
cd agent-architecture; npm run build:skills
```

Expected: exits 0. Regenerates `agent-architecture/packages/skills/security-review/sections/review-sections.md`.

- [ ] **Step 3: Verify the generated file has the new section**

```powershell
Select-String "LLM And Agent Security" agent-architecture/packages/skills/security-review/sections/review-sections.md
```

Expected: one match with the heading text.

- [ ] **Step 4: Run tests**

```powershell
cd agent-architecture; npm test
```

Expected: all tests pass. No count change (security-review already existed).

- [ ] **Step 5: Commit**

```bash
git add agent-architecture/packages/skills/security-review/sections/
git commit -m "feat(security-review): add OWASP LLM Top 10 section to review checklist"
```
