# Extensibility Guide: Adding New Skill Families

How to add new agents, skills, workflows, and training data to agent-architecture without tribal knowledge.

## Overview

Agent-architecture is designed for principal engineers to extend systematically. This guide walks through adding a new **skill family** (set of related skills + coordination agent) end-to-end.

**Example:** You want to add database migration skills (SQL Server → Postgres). This guide shows exactly how.

---

## Phase 1: Planning

### Step 1: Write Skill Charter

Before coding, document what you're building:

```markdown
## Skill Family: Database Migration (SQL Server → Postgres)

**Scope:** 5 skills for SQL Server to Postgres migration
**Primary Agent:** migration-engineer (new agent)
**Secondary Agents:** swe, qa-agent, release-agent
**External Dependencies:** 
  - MCPs: postgres-mcp, mssql-mcp
  - CLI tools: pgbench (perf testing), aws-dms (if AWS)
**Estimated Timeline:** 3 weeks (Phase 2 work)

**Skills to Build:**
1. migration-sqlserver-assess — Analyze SQL Server database (schema, dependencies, data volume)
2. migration-sqlserver-schema — Convert T-SQL schema to PostgreSQL DDL
3. migration-sqlserver-data — Execute data migration with validation
4. migration-sqlserver-test — Validate migrated data matches source
5. migration-sqlserver-perf — Performance tune migrated database

**Success Criteria:**
- All 5 skills have TDD tests passing
- Metadata complete (dependencies, policies, training data)
- Workflow: assess → schema → data → test → perf → done
- Workflow runs end-to-end without errors
```

**File this as GitHub issue with label `skill-family:database-migration`**

### Step 2: Get Approval

Tag:
- `@swe-lead` for architecture review
- `@security-team` for policy/MCP approval
- `@qa-lead` for test strategy

Wait for review comments before proceeding.

---

## Phase 2: Build Skills

### Step 2a: Create Migration Agent

Create `agents/migration-engineer/SKILL.md.tmpl`:

```yaml
---
name: migration-engineer
version: 0.1.0
description: |
  Specialize in SQL Server → Postgres migrations.
  Assesses, plans, migrates, tests, and optimizes large-scale databases.
agents: [_infrastructure]
allowed-tools:
  - Read
  - Bash
  - Grep

metadata:
  category: "infrastructure"
  domain: "data-migration"
  tier: "essential"
  dependencies:
    mcps:
      - name: postgres-mcp
        min-version: "1.0.0"
      - name: mssql-mcp
        min-version: "1.0.0"
    skills:
      - migration-sqlserver-assess
      - migration-sqlserver-schema
      - migration-sqlserver-data
      - migration-sqlserver-test
  support:
    maintenance-status: "active"
    owner-team: "data-engineering"
    last-reviewed: "2026-06-26"
---

{{PREAMBLE}}

# SQL Server → Postgres Migration Agent

Specialist for database migration from SQL Server to PostgreSQL.

[... workflow documentation, routing logic, etc. ...]
```

### Step 2b: Create Core Skills (One at a Time)

For each skill, follow the TDD pattern:

**Workflow:**

1. **Create test file** (`tests/migration-sqlserver-assess.test.mjs`)
   ```javascript
   test("migration-sqlserver-assess: RED phase", () => {
     // Agent must ask:
     // - SQL Server version, connection string?
     // - Database size? Table count?
     // - Special features (CLR, service broker, full-text search)?
   });
   ```

2. **Create skill template** (`migration-sqlserver-assess/SKILL.md.tmpl`)
   ```yaml
   ---
   name: migration-sqlserver-assess
   version: 0.1.0
   description: Assess SQL Server database for Postgres migration readiness
   agents: [migration-engineer, swe]
   metadata: [...]
   ---
   
   {{PREAMBLE}}
   
   # SQL Server Assessment
   
   Analyze SQL Server database for Postgres migration.
   
   ## Checklist
   - [ ] Connect to SQL Server
   - [ ] Scan schema (tables, views, stored procedures)
   - [ ] Identify incompatibilities (CLR, XML, spatial types)
   - [ ] Measure data volume and complexity
   - [ ] Output assessment report
   ```

3. **Build skill body** (follow CONTRIBUTING.md template)

4. **Test:** `npm test -- tests/migration-sqlserver-assess.test.mjs`

5. **Validate:** `npm run validate:metadata -- migration-sqlserver-assess/SKILL.md.tmpl`

6. **Repeat for each skill in family**

### Step 2c: Update Agent to Reference All Skills

Edit `agents/migration-engineer/SKILL.md.tmpl`:

```yaml
optional-skills:
  - migration-sqlserver-assess
  - migration-sqlserver-schema
  - migration-sqlserver-data
  - migration-sqlserver-test
  - migration-sqlserver-perf
```

---

## Phase 3: Define Workflows

### Step 3a: Add to Workflows Registry

Edit `docs/workflows/registry.json`:

```json
{
  "id": "sqlserver-to-postgres-migration",
  "name": "SQL Server → Postgres Migration",
  "category": "data-migration",
  "phases": [
    {
      "phase": 1,
      "name": "Assess",
      "agent": "migration-engineer",
      "skill": "migration-sqlserver-assess",
      "duration_minutes": 60
    },
    {
      "phase": 2,
      "name": "Schema Conversion",
      "agent": "migration-engineer",
      "skill": "migration-sqlserver-schema",
      "duration_minutes": 120
    },
    ...
  ],
  "dependencies": [
    "migration-sqlserver-assess",
    "migration-sqlserver-schema",
    "migration-sqlserver-data",
    "migration-sqlserver-test",
    "migration-sqlserver-perf"
  ]
}
```

### Step 3b: Create Workflow Documentation

Create `docs/workflows/SQLSERVER-TO-POSTGRES.md`:

```markdown
# SQL Server → Postgres Migration Workflow

Complete workflow for migrating SQL Server databases to PostgreSQL.

## Workflow Steps

1. **Assess** (60 min)
   - Invoke `/migration-engineer`
   - Run assessment: schema, incompatibilities, data volume
   - Generate assessment report

2. **Schema Conversion** (120 min)
   - Convert T-SQL DDL to PostgreSQL
   - Handle incompatibilities (CLR → functions, XML → JSONB)
   - Validate schema conversion

... [full workflow]
```

---

## Phase 4: Testing & Validation

### Step 4a: Run Tests

```bash
npm test
```

All tests should pass (including existing 100+ tests).

### Step 4b: Validate Skills

```bash
npm run validate:metadata -- "migration-sqlserver-*"
```

Check:
- ✅ Metadata complete
- ✅ Agent names valid
- ✅ Dependencies listed
- ✅ Policy gates set

### Step 4c: Generate Artifacts

```bash
npm run build:skills
```

Verifies:
- ✅ SKILL.md.tmpl renders without errors
- ✅ Registry updated with new skills
- ✅ Training data generated
- ✅ Catalog refreshed

---

## Phase 5: Documentation & Training

### Step 5a: Extract Examples

For each skill, add `references/examples.md`:

```markdown
# Migration Examples

## Example 1: Small Database (< 100GB)

**Input:** 42 tables, 2.3B rows, T-SQL stored procedures
**Output:** Assessment report + schema conversion + data validation
**Time:** 4 hours total
```

### Step 5b: Generate Training Data

Training data auto-generates via `npm run build:skills`:

```jsonl
{"name":"migration-sqlserver-assess","description":"Assess SQL Server database for Postgres migration readiness","agents":["migration-engineer","swe"],"keywords":["migration","assessment","sql-server"],...}
```

Used for LLM skill discovery + fine-tuning.

---

## Phase 6: Package & Release

### Step 6a: Update package.json

Add to `files` array:

```json
{
  "files": [
    ...,
    "agents/migration-engineer/",
    "migration-sqlserver-assess/",
    "migration-sqlserver-schema/",
    ...
  ]
}
```

### Step 6b: Create Release Notes

Add entry to `docs/RELEASE-NOTES.md`:

```markdown
## v0.2.0 (2026-06-30)

### New: SQL Server → Postgres Migration Skills
- 5 new skills for database migration
- 1 new agent: migration-engineer
- Full workflow: assess → schema → data → test → perf
- Test coverage: 28 new tests
```

### Step 6c: Update Main README

Edit `agent-architecture/README.md`:

```markdown
- **Migrate:** `/migration-engineer` for database migrations
```

---

## Checklist: What Gets Committed

When ready to PR, verify these are staged and tested:

**Core Skills:**
- [ ] `migration-sqlserver-assess/SKILL.md.tmpl` + generated SKILL.md
- [ ] `migration-sqlserver-schema/SKILL.md.tmpl` + generated SKILL.md
- [ ] (repeat for all skills)

**Agent:**
- [ ] `agents/migration-engineer/SKILL.md.tmpl` + generated SKILL.md

**Tests:**
- [ ] `tests/migration-sqlserver-*.test.mjs` (5+ test files)
- [ ] All tests passing: `npm test`

**Documentation:**
- [ ] `docs/workflows/SQLSERVER-TO-POSTGRES.md`
- [ ] `references/migration-examples.md`
- [ ] `docs/CONTRIBUTING.md` updated (if new patterns)

**Generated (auto-commit):**
- [ ] `generated/registry.json` (includes new skills + agent)
- [ ] `generated/skills.index.json` (updated)
- [ ] `docs/skill-catalog.md` (regenerated with new skills)
- [ ] `docs/TRAINING-DATA.jsonl` (updated)
- [ ] `plugins/agent-architecture/skills/migration-*/*.md` (host distros)

**Package:**
- [ ] `package.json` updated (new skills in `files` array)

---

## Pro Tips

### 1. Reuse Existing Patterns
Don't invent new formats. Copy from similar skills:
- Database work → use patterns from `stack-postgres/`
- Migration work → use patterns from `migration-review/`
- Testing work → use patterns from `qa/` or `test/`

### 2. Metadata-First Development
Define metadata in frontmatter BEFORE writing skill body:
```yaml
metadata:
  dependencies:
    mcps: [postgres-mcp, mssql-mcp]
    skills: [migration-sqlserver-assess]
  approval-gates:
    policy-required: [mcp-egress, database-access]
```

This forces you to think about dependencies early.

### 3. Test Early, Test Often
Don't wait until skill is "complete". Write tests after each checklist item:
```javascript
test("Skill forces agent to ask about SQL Server version", () => {
  // Test that skill redirects to this question
});
```

### 4. Security-First
Add policy gates for any external access:
```yaml
approval-gates:
  policy-required: [mcp-egress, database-access]
```

### 5. Small PRs
Don't submit all 5 skills at once. Do 1-2 skills per PR:
- PR 1: Agent + migration-sqlserver-assess
- PR 2: migration-sqlserver-schema + migration-sqlserver-data
- PR 3: migration-sqlserver-test + migration-sqlserver-perf

This makes review easier and catches issues faster.

---

## Common Pitfalls

❌ **"I'll add the tests after"** → Tests first (TDD)
❌ **"This MCP doesn't need a policy gate"** → All external access needs approval
❌ **"Let me explore the codebase first"** → Use existing patterns first
❌ **"I'll document this later"** → Document as you build
❌ **"5 skills in one PR"** → Small, reviewable PRs (1-2 skills)

---

## Success Criteria

Your skill family is production-ready when:

✅ All tests passing (both new + existing 100+ tests)
✅ Metadata complete (no optional fields missing)
✅ Security review complete (all policy gates documented)
✅ Documentation complete (examples, patterns, workflow)
✅ Generated artifacts fresh (catalog, registry, training data)
✅ Code review approved by tech lead
✅ Committed to main branch

---

## Support

**Questions?** See:
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Skill submission process
- [`METADATA-SCHEMA.md`](./METADATA-SCHEMA.md) — Metadata field reference
- [`SKILL-VALIDATION-CHECKLIST.md`](./SKILL-VALIDATION-CHECKLIST.md) — QA gate checklist
- [`SECURITY-REVIEW-CHECKLIST.md`](./SECURITY-REVIEW-CHECKLIST.md) — Security requirements

**Get Help:**
- File GitHub issue with label `skill-family:*`
- Tag `@swe-lead` for architecture questions
- Tag `@security-team` for policy questions

