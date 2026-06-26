# End-to-End Workflows

Master patterns for brainstorming, debugging, implementation, testing, and release using agent-architecture skills.

## Workflow 1: Brainstorm → Design → Implement

Start with orchestrate agent for collaborative exploration, route to specialists.

### Step 1: Facilitated Brainstorming

```
/orchestrate

I want to build a feature that lets users export reports in 5 formats:
- CSV (structured data)
- PDF (print-friendly)
- Excel (for analysis)
- JSON (for integration)
- HTML (for embedding)

What's the best architecture? Should we use a plugin system or built-in handlers?
What about async processing for large exports?
```

**Orchestrate agent:**
1. Invokes `/brainstorming` skill
2. Facilitates dialogue through design-space exploration
3. Documents constraints, tradeoffs, assumptions
4. Identifies parallelizable work streams

**Output:** Refined requirements + architecture direction

### Step 2: Formal Spec

```
/spec-agent

Based on our brainstorming, write a formal spec for the export feature.

Goals:
- Support 5 export formats
- Handle up to 100k rows
- Complete within 30s

Constraints:
- Use existing database queries
- No new dependencies
- Must work offline
```

**Spec-agent:**
1. Invokes `/spec` skill
2. Writes requirements document with invariants
3. Breaks down into 3-5 scoped tasks
4. Identifies risks and dependencies

**Output:** Formal spec + task breakdown

### Step 3: UI Design (Design Agent)

```
/design-agent

Design the export UI based on this spec: [spec details]

User workflow:
1. Click "Export" button
2. Select format (checkboxes for multi-select)
3. Choose columns to include
4. Click "Download" or "Email"
```

**Design-agent:**
1. Invokes `/design-html` skill
2. Creates HTML mockups
3. Provides implementation-ready code
4. Documents interaction patterns

**Output:** HTML, CSS, interaction spec

### Step 4: Implementation (SWE Agent)

```
/swe

Implement the export feature from the spec: [spec details]
HTML reference: [html from design-agent]

Scope: 300 lines max including comments. Lazy implementation — 
no over-engineering, use existing patterns.
```

**SWE agent:**
1. Invokes `/seniorswe-concise` skill (lazy mode)
2. Implements minimal, correct solution
3. Uses `/commit` skill for 3-4 atomic commits
4. Invokes `/verification-before-completion` checklist:
   - Tests pass
   - Code review approved
   - Spec requirements met
   - No tech debt introduced

**Output:** Working feature, committed, ready for QA

### Step 5: Testing (QA Agent)

```
/qa-agent

Test the export feature. Create a plan for:
- Functionality testing (all 5 formats)
- Performance (100k row dataset)
- Edge cases (special characters, large values)
```

**QA-agent:**
1. Invokes `/qa` skill for test planning
2. Invokes `/test` skill for test automation (Playwright)
3. Uses `/benchmark` for performance regression
4. Applies `/canary` for safe rollout monitoring

**Output:** Test suite, performance baseline, rollout plan

## Workflow 2: Bug → Investigation → Fix → Verification

Systematic debugging for complex, elusive bugs.

### Step 1: Bug Report

```
/swe

Users report: "Login fails randomly. Works sometimes, but 60% of attempts fail.
Most common between 2-4pm EST. Error 500, no message in logs."

Debug this systematically.
```

**SWE agent:**
1. Checks registry: does systematic-debugging apply?
   → Persists 2+ days, affects production, unclear root cause → 100% YES
2. Invokes `/systematic-debugging` skill FIRST (before exploring)

### Step 2: Systematic Investigation (Skill Workflow)

Skill executes 6-step investigation:

```
1. EVIDENCE GATHERING
   - Collect error logs (2-4pm EST, 60% failure rate)
   - Monitor database connection pool
   - Check auth service latency
   - Review failed request patterns

2. HYPOTHESIS GENERATION
   - Connection pool exhaustion during peak?
   - Auth service timeout?
   - Race condition in session creation?
   - Downstream API rate limiting?

3. TARGETED TESTING
   - Load test connection pool
   - Simulate auth service delays (add 500ms)
   - Check concurrent session creation
   - Monitor downstream API calls

4. ROOT CAUSE IDENTIFICATION
   - Connection pool maxed at 2-4pm peak traffic
   - Auth service times out after 5s
   - New request hangs waiting for connection
   - Returns 500 error to user

5. FIX VERIFICATION
   - Increase pool size 2x
   - Add connection timeout fallback
   - Test under simulated peak load
   - Verify 99.9% login success

6. DEPLOYMENT STRATEGY
   - Roll out to canary group (5%)
   - Monitor error rate for 24h
   - Full deployment if stable
```

**Output:** Root cause + verified fix

### Step 3: Code Review Discipline

```
/swe

I fixed the login bug by increasing the connection pool size and adding
a timeout fallback. Review this fix before I land it.

Changes:
- db/config.ts: pool.max 50 → 100
- auth/service.ts: add 5s timeout + retry logic
- tests/auth.test.ts: add load test (500 concurrent logins)
```

**SWE agent:**
1. Invokes `/receiving-code-review` skill
2. Validates fix against root cause
3. Checks for unintended side effects
4. Verifies test coverage
5. Confirms no tech debt introduced

**Output:** Code review approved, ready to land

### Step 4: Verification Before Landing

```
✓ Root cause documented
✓ Fix addresses root cause (not just symptom)
✓ Tests pass (unit + load)
✓ No regressions in related code
✓ Deployment plan created
✓ Canary rollout strategy defined
```

**SWE agent:**
1. Invokes `/verification-before-completion` checklist
2. Signs off that work is truly complete
3. Creates commit with `/commit` skill

**Output:** Production-ready fix, deployed safely

## Workflow 3: Feature Implementation (Fast Track)

When spec is clear, move fast with lazy discipline.

### Prerequisites

- Spec written and approved
- Design complete
- No uncertain requirements

### Fast Track (SWE)

```
/swe

Implement the export feature from the attached spec.
Goal: 250 lines, done in 1 hour.

Constraints:
- Use existing database queries
- Copy CSS patterns from similar features
- No new dependencies
- Code must pass existing tests
```

**SWE agent workflow:**

1. **Apply lazy mode** → `/seniorswe-concise`
   - YAGNI: no abstraction, no premature optimization
   - Stdlib first: use built-in APIs before packages
   - Shortest diff: solve problem in minimal code
   - Delete before you add: remove dead code first

2. **Implement + atomic commits** → `/commit`
   ```
   feat(export): support CSV export format
   
   - Add ExportService.toCSV()
   - Wire into ExportController
   - Add test for CSV format
   - 45 lines added
   
   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

3. **Quality checklist** → `/verification-before-completion`
   ```
   ✓ Spec requirements 100% met
   ✓ All tests pass
   ✓ No tech debt added
   ✓ Code review approved
   ✓ Performance acceptable
   ✓ Ready for QA
   ```

4. **Ship** → `/ship`
   - Ready for merge
   - Documented for release notes
   - QA handoff complete

## Workflow 4: Codebase Analysis

Understand an unfamiliar codebase for onboarding, feature planning, or bug investigation.

### Step 1: Codebase Mapping

```
/swe

I'm new to this project. Explain the architecture:
- What are the main services?
- How do they communicate?
- What's the data model?
```

**SWE agent:**
1. Invokes `codebase-engine` skill (automatic)
2. Indexes all symbols, files, dependencies
3. Creates knowledge graph
4. Queries graph to explain architecture

**Output:** Architecture overview, data flow diagram

### Step 2: Stack Detection

```
The system is:
- TypeScript + Express backend
- React + Redux frontend
- PostgreSQL database
- Docker deployment
- Jest + Playwright testing
```

**Agent automatically:**
1. Queries registry for stack-specific skills:
   - `stack-react-typescript`
   - `stack-postgres`
   - (others auto-detected)
2. Loads stack skills in context
3. Future questions use stack expertise

### Step 3: Deep Dive

```
/swe

Walk me through the authentication flow:
1. How are sessions stored?
2. Where's the session validation?
3. What happens if a token expires?
```

**SWE agent:**
1. Queries codebase-engine knowledge graph
2. Traces code paths
3. Explains with actual code references
4. Identifies potential issues (e.g., the login bug from Workflow 2)

**Output:** Deep understanding of feature, ready to implement or debug

## Workflow 5: Testing Strategy

Comprehensive test planning and automation.

### Step 1: Test Planning (QA Agent)

```
/qa-agent

Create a test plan for the export feature.

Spec: Support 5 formats (CSV, PDF, Excel, JSON, HTML).
Handle up to 100k rows. Complete within 30s.
```

**QA-agent:**
1. Invokes `/qa` skill
2. Identifies test categories:
   - Functional (all 5 formats work)
   - Boundary (0 rows, 100k rows, huge values)
   - Performance (30s timeout)
   - Integration (with database)
   - Security (SQL injection, XSS)
3. Prioritizes by risk

**Output:** Test plan, prioritized test cases

### Step 2: Test Automation

```
/qa-agent

Implement the export feature tests using Playwright.
```

**QA-agent:**
1. Invokes `/test` skill
2. Generates Playwright tests for:
   - UI workflows (click export, select format, download)
   - API integration (backend export endpoints)
   - Edge cases (large datasets, special characters)
3. Adds performance assertions

**Output:** Test suite, automated CI/CD integration

### Step 3: Performance Regression

```
/qa-agent

Run performance benchmarks for export.
Set baseline: CSV export of 100k rows should complete in < 5s.
```

**QA-agent:**
1. Invokes `/benchmark` skill
2. Measures performance (time, memory, CPU)
3. Compares to baseline
4. Alerts if regression detected

**Output:** Performance baseline, regression detection

### Step 4: Canary Rollout

```
/qa-agent

Plan safe rollout of export feature to production.
```

**QA-agent:**
1. Invokes `/canary` skill
2. Plans phased rollout:
   - 5% internal users (day 1)
   - 25% beta users (day 2)
   - 100% all users (day 3)
3. Monitors error rate, latency, success rate
4. Defines rollback criteria

**Output:** Rollout plan, monitoring dashboards

## Workflow 6: Release & Deployment

Coordinate multiple features, bugs, and improvements into a release.

### Step 1: Release Planning

```
/release-agent

Prepare v2.1.0 release:

Features:
- Export feature (5 formats)
- User preferences (new)

Bug fixes:
- Login random failure
- Report pagination
- PDF generation timeout

Performance:
- 30% faster data loading
```

**Release-agent:**
1. Invokes `/release` skill
2. Collects all commits and PRs since v2.0.0
3. Categorizes (features, bugs, performance)
4. Checks for API breaking changes
5. Identifies documentation needed

**Output:** Release checklist, migration guide

### Step 2: Release Notes

```
/release-agent

Generate release notes for v2.1.0.
```

**Release-agent:**
1. Invokes `/release-notes` skill
2. Creates privacy-safe notes:
   - User-facing features (Export 5 formats)
   - Bug fixes (Login reliability)
   - Performance improvements (30% faster)
   - Migration guide (if breaking changes)
3. Omits internal refactors, test additions

**Output:** Release notes for website, changelog

### Step 3: Deployment

```
/release-agent

Deploy v2.1.0 to production.
```

**Release-agent:**
1. Invokes `/ship` skill
2. Verifies all checks pass:
   - Tests green
   - Security scans pass
   - Performance baseline met
3. Invokes `/canary` skill for phased rollout
4. Monitors production metrics

**Output:** Feature live, users see release notes

## Workflow Selection Guide

| Goal | Agent | Primary Skill | Approx. Time |
|------|-------|---------------|--------------|
| Explore new feature | orchestrate | brainstorming | 30min-2h |
| Write formal spec | spec-agent | spec | 1-4h |
| Design UI | design-agent | design-html | 1-3h |
| Implement feature | swe | seniorswe-concise | 2-8h |
| Debug elusive bug | swe | systematic-debugging | 2-8h |
| Test feature | qa-agent | qa + test | 4-16h |
| Release version | release-agent | release + ship | 1-2h |
| Analyze codebase | swe | codebase-engine | 30min-2h |

## Tips for Success

### 1. Follow Skill Discipline

✓ Do invoke skills when they apply (1% chance rule)
✗ Don't rationalize away process skills (brainstorming, debugging)

### 2. Stay Scoped

✓ Do break work into focused sessions (brainstorm → spec → implement → test)
✗ Don't mix brainstorming and coding in same session

### 3. Use Agent Coordination

✓ Do use `/orchestrate` to parallelize work (3+ agents on same feature)
✗ Don't have one agent try to do everything alone

### 4. Verify Before Moving On

✓ Do invoke `/verification-before-completion` before claiming done
✗ Don't skip verification to move "faster"

### 5. Query Registry

✓ Do check registry for available skills before starting
✗ Don't assume which skills are available to which agents

## Next Steps

- Try Workflow 1 (Brainstorm) with `/orchestrate`
- Try Workflow 2 (Debug) with `/swe` on a real bug
- Read [INSTALLATION.md](./INSTALLATION.md) for setup
- Read [SKILL_INVOCATION.md](./SKILL_INVOCATION.md) for technical details
