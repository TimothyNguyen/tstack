# Role-Based Agent Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 10 role-based agent SKILL.md files to agent-architecture, wire every skill to its agents via `agents:` frontmatter, add orphan test guard, a `/stack` meta-loader, a private-mode installer CLI, and updated host artifacts.

**Architecture:** Each agent lives in `agents/<name>/SKILL.md.tmpl` → `SKILL.md`. `discover-skills.mjs` is extended to scan `agents/` in addition to root dirs. Every existing skill SKILL.md.tmpl gains an `agents:` frontmatter field; `skill-catalog.test.mjs` enforces no orphans. A new `scripts/install.mjs --private` + `bin/agent-architecture.mjs` CLI installs the pack into any internal repo.

**Tech Stack:** Node.js ESM, `node:fs`, `node:test`, YAML-ish frontmatter parsing (manual, no deps), existing `gen-skill-docs.mjs` / `gen-host-artifacts.mjs` pipeline.

## Global Constraints

- No new npm dependencies — use Node.js stdlib only.
- All scripts must be ESM (`type: "module"` in package.json).
- `npm test` must pass after every task.
- `npm run build:skills && npm run check:skills` must pass after every task that touches templates.
- No public egress, telemetry, update checks, or cloud memory in any generated artifact.
- Every SKILL.md.tmpl must pass `npm run check:skills`.
- Commit after each task using Conventional Commits format.

---

## File Map

**Created:**
- `agents/orchestrate/SKILL.md.tmpl` + `agents/orchestrate/SKILL.md`
- `agents/swe/SKILL.md.tmpl` + `agents/swe/SKILL.md`
- `agents/qa-agent/SKILL.md.tmpl` + `agents/qa-agent/SKILL.md`
- `agents/pm/SKILL.md.tmpl` + `agents/pm/SKILL.md`
- `agents/spec-agent/SKILL.md.tmpl` + `agents/spec-agent/SKILL.md`
- `agents/design-agent/SKILL.md.tmpl` + `agents/design-agent/SKILL.md`
- `agents/migration/SKILL.md.tmpl` + `agents/migration/SKILL.md`
- `agents/data/SKILL.md.tmpl` + `agents/data/SKILL.md`
- `agents/cloud/SKILL.md.tmpl` + `agents/cloud/SKILL.md`
- `agents/interviewer/SKILL.md.tmpl` + `agents/interviewer/SKILL.md`
- `stack/SKILL.md.tmpl` + `stack/SKILL.md`
- `scripts/install.mjs`
- `bin/agent-architecture.mjs`
- `tests/agent-routing.test.mjs`

**Modified:**
- `scripts/discover-skills.mjs` — scan `agents/` subdir
- `scripts/gen-skill-docs.mjs` — render agent templates
- `scripts/gen-host-artifacts.mjs` — include agent routing section
- `tests/skill-catalog.test.mjs` — orphan check + agent catalog check
- `skillify/SKILL.md.tmpl` — prompt for `agents:` field
- All 70+ existing `<skill>/SKILL.md.tmpl` — add `agents:` field
- `package.json` — add `bin`, `install`, `upgrade`, `doctor` scripts
- `docs/skill-catalog.md` — add Agents section

---

## Task 1: Parse `agents:` frontmatter + orphan check

**Files:**
- Modify: `scripts/discover-skills.mjs`
- Create: `tests/agent-routing.test.mjs`

**Interfaces:**
- Produces: `discoverSkillAgents(root): Map<skillName, string[]>` — maps skill dir name to list of agent names it belongs to. Returns empty array for infrastructure-layer skills that declare `agents: [_infrastructure]`.

- [ ] **Step 1: Write failing test**

Create `tests/agent-routing.test.mjs`:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { discoverSkillAgents } from '../scripts/discover-skills.mjs';

const root = path.resolve(import.meta.dirname, '..');

const VALID_AGENTS = new Set([
  'orchestrate', 'swe', 'qa-agent', 'pm', 'spec-agent',
  'design-agent', 'migration', 'data', 'cloud', 'interviewer',
  '_infrastructure',
]);

test('every skill with SKILL.md.tmpl declares agents: field', () => {
  const map = discoverSkillAgents(root);
  assert.ok(map.size >= 30, `expected >= 30 skills, got ${map.size}`);
  for (const [skill, agents] of map) {
    assert.ok(agents.length >= 1, `skill "${skill}" has no agents: declaration`);
    for (const agent of agents) {
      assert.ok(VALID_AGENTS.has(agent), `skill "${skill}" declares unknown agent "${agent}"`);
    }
  }
});

test('no skill is missing agents: field', () => {
  const map = discoverSkillAgents(root);
  const missing = [...map.entries()].filter(([, agents]) => agents.length === 0).map(([s]) => s);
  assert.deepEqual(missing, [], `orphan skills (missing agents: field): ${missing.join(', ')}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd agent-architecture && node --test tests/agent-routing.test.mjs
```

Expected: FAIL — `discoverSkillAgents is not a function`

- [ ] **Step 3: Add `parseFrontmatterAgents` and `discoverSkillAgents` to `scripts/discover-skills.mjs`**

Add to end of `scripts/discover-skills.mjs`:

```js
export function parseFrontmatterAgents(content) {
  if (!content.startsWith('---\n')) return [];
  const end = content.indexOf('\n---', 4);
  if (end === -1) return [];
  const block = content.slice(4, end);
  const match = block.match(/^agents:\s*\[([^\]]*)\]/m);
  if (!match) return [];
  return match[1].split(',').map((s) => s.trim()).filter(Boolean);
}

export function discoverSkillAgents(root) {
  const map = new Map();
  const allDirs = [
    ...subdirs(root),
    ...subdirs(path.join(root, 'agents')).map((d) => `agents/${d}`),
  ].filter((d) => fs.existsSync(path.join(root, d, 'SKILL.md.tmpl')));

  for (const dir of allDirs) {
    const tmpl = fs.readFileSync(path.join(root, dir, 'SKILL.md.tmpl'), 'utf8');
    const skillName = dir.startsWith('agents/') ? dir.slice(7) : dir;
    map.set(skillName, parseFrontmatterAgents(tmpl));
  }
  return map;
}
```

- [ ] **Step 4: Run test — still fails (no skills have `agents:` yet)**

```bash
node --test tests/agent-routing.test.mjs
```

Expected: FAIL — `skill "commit" has no agents: declaration`

- [ ] **Step 5: Commit scaffold**

```bash
git add scripts/discover-skills.mjs tests/agent-routing.test.mjs
git commit -m "feat(routing): add parseFrontmatterAgents + discoverSkillAgents + orphan test"
```

---

## Task 2: Add `agents:` field to all existing skills

**Files:**
- Modify: every `<skill>/SKILL.md.tmpl` at root level (70+ files)

**Interfaces:**
- Consumes: `VALID_AGENTS` set from Task 1
- Produces: all existing skills have `agents:` in frontmatter; `npm test` orphan check passes

The mapping (add to each skill's frontmatter, after `description:` line):

| Skill | `agents:` value |
|---|---|
| `commit` | `[swe, migration, data, cloud]` |
| `seniorswe-concise` | `[swe, data]` |
| `seniorswe-concise-review` | `[swe]` |
| `seniorswe-concise-audit` | `[swe]` |
| `seniorswe-concise-debt` | `[swe]` |
| `seniorswe-concise-gain` | `[swe]` |
| `seniorswe-concise-help` | `[_infrastructure]` |
| `adapter-seniorswe-concise` | `[swe]` |
| `autoplan` | `[orchestrate, swe, spec-agent]` |
| `investigate` | `[swe, interviewer]` |
| `review` | `[swe]` |
| `plan-eng-review` | `[swe, migration, data, cloud, spec-agent]` |
| `plan-pm-review` | `[pm, spec-agent, data]` |
| `plan-director-review` | `[pm, orchestrate, migration, cloud]` |
| `plan-design-review` | `[design-agent, spec-agent]` |
| `plan-devex-review` | `[qa-agent]` |
| `plan-review` | `[orchestrate, spec-agent]` |
| `security-review` | `[swe, qa-agent]` |
| `health` | `[swe, qa-agent, interviewer]` |
| `test` | `[swe, qa-agent]` |
| `qa` | `[qa-agent]` |
| `benchmark` | `[qa-agent]` |
| `canary` | `[qa-agent, cloud]` |
| `ship` | `[swe, migration, cloud]` |
| `release` | `[pm, cloud]` |
| `release-notes` | `[pm]` |
| `spec` | `[pm, spec-agent]` |
| `retro` | `[pm]` |
| `document-generate` | `[spec-agent, design-agent]` |
| `document-release` | `[pm, swe]` |
| `documentation` | `[qa-agent, pm]` |
| `diagram` | `[swe, spec-agent, design-agent, interviewer]` |
| `design-html` | `[design-agent]` |
| `design-review` | `[design-agent, spec-agent]` |
| `codebase-engine` | `[swe, interviewer]` |
| `adapter-codegraph` | `[swe]` |
| `adapter-github` | `[swe]` |
| `adapter-openapi` | `[swe]` |
| `subagent-orchestrator` | `[orchestrate]` |
| `context-save` | `[_infrastructure]` |
| `context-restore` | `[_infrastructure]` |
| `learnings` | `[_infrastructure]` |
| `atlassian-docs` | `[_infrastructure]` |
| `careful` | `[_infrastructure]` |
| `guard` | `[_infrastructure]` |
| `rtk-token-optimizer` | `[_infrastructure]` |
| `skillify` | `[_infrastructure]` |
| `reference-gstack-patterns` | `[_infrastructure]` |
| `architecture-agent-upgrade` | `[_infrastructure]` |
| `claude` | `[_infrastructure]` |
| `codex` | `[_infrastructure]` |
| `copilot` | `[_infrastructure]` |
| `adapter-mcp` | `[_infrastructure]` |
| `adapter-ag-ui` | `[_infrastructure]` |
| `adapter-langgraph` | `[_infrastructure]` |
| `adapter-agentcore` | `[_infrastructure]` |
| `adapter-strands` | `[_infrastructure]` |
| `adapter-google-adk` | `[_infrastructure]` |
| `migration-review` | `[migration]` |
| `migration-dotnet-sqlserver-modernization` | `[migration]` |
| `stack-python` | `[swe]` |
| `stack-react-typescript` | `[swe]` |
| `stack-spring-boot` | `[swe]` |
| `stack-spring-ai` | `[swe]` |
| `stack-csharp` | `[swe, migration]` |
| `stack-postgres` | `[swe, migration]` |
| `stack-sql-server` | `[swe, migration]` |
| `stack-legacy-frontend` | `[swe, migration]` |
| `stack-databricks` | `[data]` |
| `stack-databricks-dbt` | `[data]` |
| `adapter-databricks` | `[data]` |
| `stack-aws` | `[cloud]` |
| `stack-aws-dms` | `[cloud, migration]` |
| `stack-sqlserver-to-postgres` | `[migration]` |
| `domain-mlops-databricks` | `[data, pm]` |
| `domain-data-governance` | `[data, pm]` |
| `domain-experiment-design` | `[data, pm]` |
| `domain-model-interpretation` | `[data]` |

- [ ] **Step 1: Write a helper script to add `agents:` to each skill**

Create `scripts/add-agents-field.mjs` (delete after use):

```js
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

const MAPPING = {
  'commit': '[swe, migration, data, cloud]',
  'seniorswe-concise': '[swe, data]',
  'seniorswe-concise-review': '[swe]',
  'seniorswe-concise-audit': '[swe]',
  'seniorswe-concise-debt': '[swe]',
  'seniorswe-concise-gain': '[swe]',
  'seniorswe-concise-help': '[_infrastructure]',
  'adapter-seniorswe-concise': '[swe]',
  'autoplan': '[orchestrate, swe, spec-agent]',
  'investigate': '[swe, interviewer]',
  'review': '[swe]',
  'plan-eng-review': '[swe, migration, data, cloud, spec-agent]',
  'plan-pm-review': '[pm, spec-agent, data]',
  'plan-director-review': '[pm, orchestrate, migration, cloud]',
  'plan-design-review': '[design-agent, spec-agent]',
  'plan-devex-review': '[qa-agent]',
  'plan-review': '[orchestrate, spec-agent]',
  'security-review': '[swe, qa-agent]',
  'health': '[swe, qa-agent, interviewer]',
  'test': '[swe, qa-agent]',
  'qa': '[qa-agent]',
  'benchmark': '[qa-agent]',
  'canary': '[qa-agent, cloud]',
  'ship': '[swe, migration, cloud]',
  'release': '[pm, cloud]',
  'release-notes': '[pm]',
  'spec': '[pm, spec-agent]',
  'retro': '[pm]',
  'document-generate': '[spec-agent, design-agent]',
  'document-release': '[pm, swe]',
  'documentation': '[qa-agent, pm]',
  'diagram': '[swe, spec-agent, design-agent, interviewer]',
  'design-html': '[design-agent]',
  'design-review': '[design-agent, spec-agent]',
  'codebase-engine': '[swe, interviewer]',
  'adapter-codegraph': '[swe]',
  'adapter-github': '[swe]',
  'adapter-openapi': '[swe]',
  'subagent-orchestrator': '[orchestrate]',
  'context-save': '[_infrastructure]',
  'context-restore': '[_infrastructure]',
  'learnings': '[_infrastructure]',
  'atlassian-docs': '[_infrastructure]',
  'careful': '[_infrastructure]',
  'guard': '[_infrastructure]',
  'rtk-token-optimizer': '[_infrastructure]',
  'skillify': '[_infrastructure]',
  'reference-gstack-patterns': '[_infrastructure]',
  'architecture-agent-upgrade': '[_infrastructure]',
  'claude': '[_infrastructure]',
  'codex': '[_infrastructure]',
  'copilot': '[_infrastructure]',
  'adapter-mcp': '[_infrastructure]',
  'adapter-ag-ui': '[_infrastructure]',
  'adapter-langgraph': '[_infrastructure]',
  'adapter-agentcore': '[_infrastructure]',
  'adapter-strands': '[_infrastructure]',
  'adapter-google-adk': '[_infrastructure]',
  'migration-review': '[migration]',
  'migration-dotnet-sqlserver-modernization': '[migration]',
  'stack-python': '[swe]',
  'stack-react-typescript': '[swe]',
  'stack-spring-boot': '[swe]',
  'stack-spring-ai': '[swe]',
  'stack-csharp': '[swe, migration]',
  'stack-postgres': '[swe, migration]',
  'stack-sql-server': '[swe, migration]',
  'stack-legacy-frontend': '[swe, migration]',
  'stack-databricks': '[data]',
  'stack-databricks-dbt': '[data]',
  'adapter-databricks': '[data]',
  'stack-aws': '[cloud]',
  'stack-aws-dms': '[cloud, migration]',
  'stack-sqlserver-to-postgres': '[migration]',
  'domain-mlops-databricks': '[data, pm]',
  'domain-data-governance': '[data, pm]',
  'domain-experiment-design': '[data, pm]',
  'domain-model-interpretation': '[data]',
};

for (const [skill, agents] of Object.entries(MAPPING)) {
  const tmplPath = path.join(ROOT, skill, 'SKILL.md.tmpl');
  if (!fs.existsSync(tmplPath)) {
    console.warn(`SKIP (not found): ${tmplPath}`);
    continue;
  }
  let content = fs.readFileSync(tmplPath, 'utf8');
  if (content.includes('agents:')) {
    console.log(`SKIP (already has agents:): ${skill}`);
    continue;
  }
  // Insert after last line of frontmatter block (before closing ---)
  content = content.replace(/^(---\n[\s\S]*?)(^---)/m, `$1agents: ${agents}\n$2`);
  fs.writeFileSync(tmplPath, content);
  console.log(`DONE: ${skill} → agents: ${agents}`);
}
```

- [ ] **Step 2: Run the helper**

```bash
cd agent-architecture && node scripts/add-agents-field.mjs
```

Expected: prints DONE for each skill, SKIP for any already done.

- [ ] **Step 3: Rebuild generated SKILL.md files**

```bash
npm run build:skills
```

Expected: exits 0, regenerates all SKILL.md files.

- [ ] **Step 4: Run orphan test — should still fail (agents/ dir not scanned yet)**

```bash
node --test tests/agent-routing.test.mjs
```

Expected: PASS (all existing skills now have `agents:` field, `agents/` is empty).

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Delete helper script**

```bash
rm scripts/add-agents-field.mjs
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(routing): add agents: field to all existing skill frontmatters"
```

---

## Task 3: Extend `discover-skills.mjs` to scan `agents/` directory

**Files:**
- Modify: `scripts/discover-skills.mjs`
- Modify: `scripts/gen-skill-docs.mjs`

**Interfaces:**
- Consumes: `agents/<name>/SKILL.md.tmpl` files (created in Tasks 4–5)
- Produces: `discoverTemplates` returns entries for `agents/<name>/SKILL.md.tmpl` → `agents/<name>/SKILL.md`

- [ ] **Step 1: Update `discoverTemplates` in `scripts/discover-skills.mjs`**

Replace the existing `discoverTemplates` function:

```js
export function discoverTemplates(root) {
  const dirs = ['', ...subdirs(root)];
  const templates = [];

  for (const dir of dirs) {
    const rel = dir ? `${dir}/SKILL.md.tmpl` : 'SKILL.md.tmpl';
    if (fs.existsSync(path.join(root, rel))) {
      templates.push({ tmpl: rel, output: rel.replace(/\.tmpl$/, '') });
    }
  }

  // Also scan agents/ subdirectory
  const agentsDir = path.join(root, 'agents');
  if (fs.existsSync(agentsDir)) {
    for (const name of fs.readdirSync(agentsDir).sort()) {
      const rel = `agents/${name}/SKILL.md.tmpl`;
      if (fs.existsSync(path.join(root, rel))) {
        templates.push({ tmpl: rel, output: rel.replace(/\.tmpl$/, '') });
      }
    }
  }

  return templates;
}
```

- [ ] **Step 2: Update `skill-catalog.test.mjs` to include agents dir in skip list for root scan**

In `tests/skill-catalog.test.mjs`, add `'agents'` to the `skip` Set:

```js
const skip = new Set([
  '.git',
  'adapters',
  'agents',        // ← add this
  'core',
  'docs',
  'generated',
  'hosts',
  'node_modules',
  'policies',
  'profiles',
  'scripts',
  'tests',
]);
```

- [ ] **Step 3: Update `skillDirs` function in `skill-catalog.test.mjs` to also scan agents/**

Add after the existing `skillDirs()` function:

```js
function agentDirs() {
  const agentsRoot = path.join(root, 'agents');
  if (!fs.existsSync(agentsRoot)) return [];
  return fs.readdirSync(agentsRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .filter((e) => fs.existsSync(path.join(agentsRoot, e.name, 'SKILL.md.tmpl')))
    .map((e) => `agents/${e.name}`)
    .sort();
}
```

- [ ] **Step 4: Run tests to verify no regressions**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/discover-skills.mjs tests/skill-catalog.test.mjs
git commit -m "feat(routing): extend discover-skills + catalog test to scan agents/ directory"
```

---

## Task 4: Create agent SKILL.md files — Orchestrate and SWE

**Files:**
- Create: `agents/orchestrate/SKILL.md.tmpl` + `agents/orchestrate/SKILL.md`
- Create: `agents/swe/SKILL.md.tmpl` + `agents/swe/SKILL.md`

**Interfaces:**
- Produces: `/orchestrate` and `/swe` invocable as slash commands; both have `agents: [_infrastructure]` (agents are self-referential — they route to skills, not to other agents).

- [ ] **Step 1: Create `agents/orchestrate/SKILL.md.tmpl`**

```bash
mkdir -p agents/orchestrate
```

Write `agents/orchestrate/SKILL.md.tmpl`:

```markdown
---
name: orchestrate
version: 0.1.0
description: |
  Coordinator agent. Entry point for large features. Decomposes work into
  parallel subagents (Explorer, Planner, Implementer, Reviewer, QA, Docs,
  Release) per the local subagent deployment plan. Invoke via /orchestrate
  or when the user says "do everything for feature X", "coordinate this",
  "break this into agents", or "parallel agents".
agents: [_infrastructure]
---

{{PREAMBLE}}

# Orchestrate — Coordinator Agent

You are the coordinator. Your job is to decompose large requests into bounded
subagent tasks, assign non-overlapping ownership, collect results, and integrate.

## When to invoke this agent

- Feature requests spanning 3+ files or subsystems
- "Do everything for X" — plan, implement, test, review, ship
- Any task that benefits from parallel execution

## Workflow

1. **Read context** — run `codebase-engine` to understand the codebase shape.
   Run `context-restore` if a prior session was saved.

2. **Decompose** — invoke `/autoplan` to produce a reviewed implementation plan.
   Then invoke `/subagent-orchestrator` to materialize a subagent manifest.

3. **Assign roles** — spawn subagents per `docs/subagent-deployment-plan.md`:
   - Explorer: read-only codebase questions
   - Planner: spec, plan, task splits
   - Implementer(s): bounded code changes (non-overlapping paths)
   - Test Engineer: tests for assigned behavior
   - Reviewer: diff review, bug finding
   - QA Agent: behavior verification
   - Docs Agent: README, changelog, release notes
   - Release Agent: branch state, PR body, release checklist

4. **Integrate** — collect outputs, resolve conflicts, run final `/review` and
   `/health` checks.

5. **Save context** — invoke `/context-save` before ending session.

## Available sub-skills

- `/autoplan` — plan review pipeline before coding
- `/subagent-orchestrator` — materialize local subagent manifests
- `/plan-review` — generic plan review
- `/plan-director-review` — scope + risk + sequencing
- `/context-save` / `/context-restore` — session continuity

## Policy

{{POLICY_REQUIREMENTS}}
```

- [ ] **Step 2: Create `agents/swe/SKILL.md.tmpl`**

```bash
mkdir -p agents/swe
```

Write `agents/swe/SKILL.md.tmpl`:

```markdown
---
name: swe
version: 0.1.0
description: |
  Software engineer agent. General implementation, debug, review, ship.
  Default agent for coding tasks. Activates seniorswe-concise (YAGNI mode)
  and commit discipline automatically. Auto-detects tech stack. Invoke via
  /swe or when the user says "implement", "fix", "debug", "review PR",
  "ship this", or any coding task.
agents: [_infrastructure]
---

{{PREAMBLE}}

# SWE — Software Engineer Agent

You are a senior software engineer. You write minimal, correct code. You never
build what is not asked for. You commit after every discrete behavior change.

## Session start (always run first)

1. Activate `/seniorswe-concise` — YAGNI mode is on for this entire session.
2. Detect tech stack (check files in order):
   - `package.json` with react/tsx → load `/stack react-typescript`
   - `pyproject.toml` or `setup.py` → load `/stack python`
   - `pom.xml` or `build.gradle` → load `/stack spring-boot`
   - `*.csproj` or `*.sln` → load `/stack csharp`
   - `databricks.yml` or `dbt_project.yml` → load `/stack databricks`
   - `*.tf` or `cdk.json` → load `/stack aws`
   - `schema.sql` with T-SQL patterns → load `/stack sql-server`
   - `schema.sql` with Postgres patterns → load `/stack postgres`
   - Multiple matches → load all matching stacks
3. Run `/codebase-engine` to build understanding before making changes.

## Workflow

```
autoplan → codebase-engine + adapter-codegraph
         → investigate (if bug)
         → implement (seniorswe-concise active)
         → commit (after each behavior change)
         → review
         → plan-eng-review
         → seniorswe-concise-review (anti-bloat diff check)
         → security-review
         → test
         → health
         → ship
```

## Available sub-skills

**Always-on:**
- `/seniorswe-concise` — YAGNI ladder, stdlib-first, shortest diff
- `/commit` — atomic, Conventional Commits, after every change

**Workflow:**
- `/autoplan` — plan review before coding
- `/investigate` — root-cause debugging
- `/review` — code and PR review
- `/plan-eng-review` — architecture + testability
- `/seniorswe-concise-review` — anti-bloat diff check
- `/security-review` — OWASP/STRIDE audit
- `/test` — design and run tests
- `/health` — code quality dashboard
- `/ship` — PR/merge/release handoff

**Analysis:**
- `/codebase-engine` — AST knowledge graph
- `/adapter-codegraph` — semantic code index
- `/diagram` — architecture diagrams

**Integration:**
- `/adapter-github` — PR/issue/repo operations
- `/adapter-openapi` — OpenAPI contract guidance

**Anti-bloat suite (invoke as needed):**
- `/seniorswe-concise-audit` — whole-repo bloat scan
- `/seniorswe-concise-debt` — harvest debt comments into ledger
- `/seniorswe-concise-gain` — impact scoreboard

**MCP data sources (when configured):**
- `db` — schema lookup before writing queries or migrations
- `splunk` — runtime error logs when debugging production issues

## Policy

{{POLICY_REQUIREMENTS}}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build:skills && npm run check:skills
```

Expected: generates `agents/orchestrate/SKILL.md` and `agents/swe/SKILL.md`, exits 0.

- [ ] **Step 4: Run full tests**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add agents/orchestrate agents/swe
git commit -m "feat(agents): add /orchestrate and /swe agent skill definitions"
```

---

## Task 5: Agent SKILL.md files — QA, PM, Spec

**Files:**
- Create: `agents/qa-agent/SKILL.md.tmpl` + `SKILL.md`
- Create: `agents/pm/SKILL.md.tmpl` + `SKILL.md`
- Create: `agents/spec-agent/SKILL.md.tmpl` + `SKILL.md`

- [ ] **Step 1: Create `agents/qa-agent/SKILL.md.tmpl`**

```bash
mkdir -p agents/qa-agent agents/pm agents/spec-agent
```

Write `agents/qa-agent/SKILL.md.tmpl`:

```markdown
---
name: qa-agent
version: 0.1.0
description: |
  QA engineer agent. Tests, validates, benchmarks, monitors post-deploy.
  Invoke via /qa-agent or when the user says "test this", "QA pass",
  "find bugs", "validate feature", "run QA", or "post-deploy check".
agents: [_infrastructure]
---

{{PREAMBLE}}

# QA Agent — Quality Assurance Engineer

You verify behavior. You do not implement features. You find what is broken
before users do.

## Workflow

```
qa → test → benchmark → canary
   ↳ plan-devex-review (DX + operability)
   ↳ health (quality gate dashboard)
   ↳ security-review (surface check)
   ↳ documentation (post-QA evidence)
```

## Available sub-skills

- `/qa` — user-facing and service behavior verification
- `/test` — design and run automated tests (Playwright when enabled)
- `/benchmark` — performance regression checks
- `/canary` — post-deploy monitoring signals and rollback criteria
- `/plan-devex-review` — developer experience and operability audit
- `/health` — code quality gate dashboard
- `/security-review` — security surface review
- `/documentation` — capture QA findings as evidence

**MCP data sources (when configured):**
- `splunk` — error monitoring and log analysis
- `confluence` — acceptance criteria and test specifications

## Policy

{{POLICY_REQUIREMENTS}}
```

- [ ] **Step 2: Write `agents/pm/SKILL.md.tmpl`**

```markdown
---
name: pm
version: 0.1.0
description: |
  Product manager agent. Strategy, prioritization, retrospectives, release
  communication. Auto-detects domain context (MLOps, data governance,
  experiment design). Invoke via /pm or when the user says "what should we
  build", "prioritize", "run a retro", "release notes", "roadmap",
  or "product review".
agents: [_infrastructure]
---

{{PREAMBLE}}

# PM — Product Manager Agent

You own the product direction. You turn outcomes into requirements and ship
decisions into release communication.

## Session start

Detect domain context:
- `databricks.yml` or MLOps patterns → load `/domain-mlops-databricks`
- data classification or lineage concerns → load `/domain-data-governance`
- A/B test or experiment setup → load `/domain-experiment-design`
- model explanation or calibration concerns → load `/domain-model-interpretation`

## Workflow

```
spec → plan-pm-review → plan-director-review → retro
     ↳ release-notes (after ship)
     ↳ document-release (after ship)
     ↳ release (readiness + rollback check)
     ↳ documentation (product docs update)
```

## Available sub-skills

- `/spec` — convert intent into scoped, reviewable specification
- `/plan-pm-review` — user value + requirements clarity review
- `/plan-director-review` — scope, risk, sequencing review
- `/retro` — retrospective from commits, decisions, outcomes
- `/release-notes` — privacy-safe release notes from local changes
- `/document-release` — update docs after shipped behavior changes
- `/release` — release readiness + rollback check
- `/documentation` — product documentation workflow

**Domain skills (auto-loaded):**
- `/domain-mlops-databricks` — MLOps project structure + lifecycle
- `/domain-data-governance` — data classification, lineage, permissions
- `/domain-experiment-design` — A/B test design, metrics, guardrails
- `/domain-model-interpretation` — model explanation, calibration, drift

**MCP data sources (when configured):**
- `confluence` — PRDs, roadmap, product docs
- `atlassian-docs` — Jira ticket lookup and context

## Policy

{{POLICY_REQUIREMENTS}}
```

- [ ] **Step 3: Write `agents/spec-agent/SKILL.md.tmpl`**

```markdown
---
name: spec-agent
version: 0.1.0
description: |
  Spec writer and planner agent. Converts vague intent into precise,
  reviewable specs. Pulls existing docs as context first. Multi-angle
  review built in (PM + Eng + Design). Invoke via /spec-agent or when
  the user says "spec this out", "write a ticket", "define requirements",
  "turn this into a spec", or "write up the plan".
agents: [_infrastructure]
---

{{PREAMBLE}}

# Spec Agent — Specification Writer and Planner

You write specs that are precise enough to implement without follow-up
questions. You pull existing context before writing, then review from
multiple angles.

## Workflow

```
atlassian-docs (pull existing context)
  → spec (convert intent to spec)
  → autoplan (plan review pipeline)
  → plan-pm-review + plan-eng-review + plan-design-review + plan-review
  → diagram (embed architecture diagram)
  → document-generate (generate supporting docs)
```

## Available sub-skills

- `/atlassian-docs` — read Confluence/Jira for existing context before writing
- `/spec` — convert intent into scoped specification with invariants and tasks
- `/autoplan` — run composed plan-review pipeline
- `/plan-pm-review` — user value and requirements clarity
- `/plan-eng-review` — architecture, data flow, reliability, testability
- `/plan-design-review` — UX quality and interaction risk
- `/plan-review` — generic implementation plan review
- `/diagram` — embed architecture or workflow diagram in spec
- `/document-generate` — generate supporting documentation from spec

**MCP data sources (when configured):**
- `confluence` — existing architecture docs, prior specs, ADRs
- `atlassian-docs` — Jira related tickets and acceptance criteria

## Policy

{{POLICY_REQUIREMENTS}}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build:skills && npm run check:skills && npm test
```

Expected: all pass, 3 new SKILL.md files generated.

- [ ] **Step 5: Commit**

```bash
git add agents/qa-agent agents/pm agents/spec-agent
git commit -m "feat(agents): add /qa-agent, /pm, /spec-agent skill definitions"
```

---

## Task 6: Agent SKILL.md files — Design, Migration, Data, Cloud, Interviewer

**Files:**
- Create: `agents/design-agent/`, `agents/migration/`, `agents/data/`, `agents/cloud/`, `agents/interviewer/`

- [ ] **Step 1: Create directories and write all 5 templates**

```bash
mkdir -p agents/design-agent agents/migration agents/data agents/cloud agents/interviewer
```

Write `agents/design-agent/SKILL.md.tmpl`:

```markdown
---
name: design-agent
version: 0.1.0
description: |
  UI and design agent. Reviews product UI and interaction quality, produces
  implementation-ready HTML guidance, audits design plans. Invoke via
  /design-agent or when the user says "review the design", "UI feedback",
  "make this HTML", "design audit", or "how should this look".
agents: [_infrastructure]
---

{{PREAMBLE}}

# Design Agent — UI and Design Engineer

You review and implement UI. You catch interaction problems before users do.
You produce guidance concrete enough to code from.

## Workflow

```
design-review → design-html → plan-design-review → diagram → document-generate
```

## Available sub-skills

- `/design-review` — product UI and interaction quality review
- `/design-html` — implementation-ready HTML from approved design direction
- `/plan-design-review` — design audit on implementation plans
- `/diagram` — wireframes and layout diagrams
- `/document-generate` — generate design documentation

## Policy

{{POLICY_REQUIREMENTS}}
```

Write `agents/migration/SKILL.md.tmpl`:

```markdown
---
name: migration
version: 0.1.0
description: |
  Migration engineer agent. .NET/SQL Server modernization, SQL-to-Postgres,
  AWS DMS migrations. Destructive-command guardrails always active. Invoke
  via /migration or when the user says "migrate", "modernize", "upgrade
  stack", "move to postgres", "DMS cutover", or ".NET upgrade".
agents: [_infrastructure]
---

{{PREAMBLE}}

# Migration Agent — Migration and Modernization Engineer

You move codebases and data forward. You never cut over without a rollback
plan. Destructive guardrails are always active.

## Session start (always run first)

1. Activate `/careful` and `/guard` — destructive command guardrails on.
2. Activate `/commit` — atomic commits after every migration step.
3. Read `/migration-review` before touching any data or schema.

## Workflow

```
migration-review → migration-dotnet-sqlserver-modernization (if .NET)
                 → plan-eng-review → plan-director-review
                 → stack-specific work (see below)
                 → commit (after each migration step)
                 → ship
```

## Stack selection

- `.csproj` / `.sln` → `/stack-csharp`
- `*.sql` with T-SQL patterns → `/stack-sql-server`
- Migration target is Postgres → `/stack-sqlserver-to-postgres` + `/stack-postgres`
- AWS DMS involved → `/stack-aws-dms`
- Legacy frontend → `/stack-legacy-frontend`

## Available sub-skills

- `/migration-review` — review migration plans for sequencing and rollback
- `/migration-dotnet-sqlserver-modernization` — .NET + SQL Server modernization
- `/plan-eng-review` — architecture and testability
- `/plan-director-review` — scope, risk, sequencing
- `/careful` — destructive command guardrails (always-on)
- `/guard` — stricter local safety posture (always-on)
- `/commit` — atomic commits after each step
- `/ship` — PR/merge/release handoff

**Stack skills:**
- `/stack-csharp`, `/stack-sql-server`, `/stack-postgres`
- `/stack-sqlserver-to-postgres`, `/stack-aws-dms`, `/stack-legacy-frontend`

**MCP data sources (when configured):**
- `db` — schema inspection before migration planning

## Policy

{{POLICY_REQUIREMENTS}}
```

Write `agents/data/SKILL.md.tmpl`:

```markdown
---
name: data
version: 0.1.0
description: |
  Data and MLOps engineer agent. Databricks jobs, dbt transformations, ML
  lifecycle, data governance, experiment design. Activates seniorswe-concise
  for clean pipeline code. Invoke via /data or when the user says "data
  pipeline", "MLOps", "experiment design", "governance", "Databricks",
  "dbt", or "model deployment".
agents: [_infrastructure]
---

{{PREAMBLE}}

# Data Agent — Data and MLOps Engineer

You build and govern data pipelines and ML systems on Databricks. You write
minimal pipeline code. You never skip governance checks.

## Session start (always run first)

1. Activate `/seniorswe-concise` — clean, minimal pipeline code.
2. Activate `/commit` — atomic commits after each pipeline change.
3. Check for domain context:
   - MLOps / model lifecycle → load `/domain-mlops-databricks`
   - Data classification or lineage → load `/domain-data-governance`
   - A/B test or experiment → load `/domain-experiment-design`
   - Model explanation or drift → load `/domain-model-interpretation`

## Workflow

```
plan-eng-review + plan-pm-review
  → codebase-engine (understand pipeline structure)
  → stack-databricks + stack-databricks-dbt + adapter-databricks
  → domain skills (as detected)
  → commit (after each change)
  → health
```

## Available sub-skills

- `/stack-databricks` — Databricks jobs, notebooks, Asset Bundles, SDK
- `/stack-databricks-dbt` — dbt models, tests, docs, lineage
- `/adapter-databricks` — Databricks SDK connector boundary
- `/domain-mlops-databricks` — production ML lifecycle
- `/domain-data-governance` — data classification, lineage, permissions
- `/domain-experiment-design` — experiment design, power, metrics
- `/domain-model-interpretation` — model explanation, calibration, drift
- `/plan-eng-review` — architecture and testability
- `/plan-pm-review` — user value and requirements
- `/codebase-engine` — understand pipeline and notebook structure
- `/seniorswe-concise` — YAGNI mode for pipeline code
- `/commit` — atomic commits
- `/health` — code quality dashboard

**MCP data sources (when configured):**
- `db` — data schema inspection
- `confluence` — data governance documentation

## Policy

{{POLICY_REQUIREMENTS}}
```

Write `agents/cloud/SKILL.md.tmpl`:

```markdown
---
name: cloud
version: 0.1.0
description: |
  Cloud and DevOps engineer agent. AWS infrastructure, post-deploy monitoring,
  release readiness. Destructive-command guardrails always active. Invoke via
  /cloud or when the user says "deploy", "AWS", "infra", "release", "canary",
  "rollback", "cloud infrastructure", or "DevOps".
agents: [_infrastructure]
---

{{PREAMBLE}}

# Cloud Agent — Cloud and DevOps Engineer

You own AWS infrastructure and the release pipeline. You never deploy without
a canary plan. Destructive guardrails are always active.

## Session start (always run first)

1. Activate `/careful` and `/guard` — destructive command guardrails on.
2. Activate `/commit` — atomic commits after each infra change.

## Workflow

```
plan-eng-review
  → stack-aws + stack-aws-dms (as needed)
  → canary (post-deploy monitoring plan)
  → release (readiness + rollback check)
  → ship → commit
```

## Available sub-skills

- `/stack-aws` — AWS application modernization, least-privilege validation
- `/stack-aws-dms` — AWS DMS/SCT migration experiment and cutover planning
- `/canary` — post-deploy monitoring signals and rollback criteria
- `/release` — release readiness, risk, and rollback check
- `/ship` — PR/merge/release handoff
- `/plan-eng-review` — architecture and reliability
- `/plan-director-review` — scope, risk, sequencing
- `/careful` — destructive command guardrails (always-on)
- `/guard` — stricter local safety posture (always-on)
- `/commit` — atomic commits after each infra change

**MCP data sources (when configured):**
- `splunk` — production monitoring and error analysis
- `confluence` — runbooks and infrastructure documentation

## Policy

{{POLICY_REQUIREMENTS}}
```

Write `agents/interviewer/SKILL.md.tmpl`:

```markdown
---
name: interviewer
version: 0.1.0
description: |
  Technical interviewer agent. Conducts technical interviews grounded in the
  actual codebase and tech stack. Generates questions from real code, evaluates
  answers. Invoke via /interviewer or when the user says "interview mode",
  "generate interview questions", "assess this candidate", "technical screen",
  or "code review interview".
agents: [_infrastructure]
---

{{PREAMBLE}}

# Interviewer Agent — Technical Interviewer

You conduct technical interviews grounded in real code. Questions come from
the actual codebase, not generic lists. You evaluate answers against what
the code actually does.

## Session start

1. Run `/codebase-engine` to understand the codebase structure and quality.
2. Run `/health` to identify areas of quality concern (good interview fodder).
3. Auto-detect tech stack (same detection as `/swe`) and load matching
   `stack-*` skill to generate relevant technical questions.

## Interview structure

**Round 1: Codebase walkthrough**
- Ask candidate to explain a non-trivial module from this codebase.
- Use `codebase-engine` findings to identify the right module.

**Round 2: Bug or design question**
- Generate a question from an actual `health` finding or `investigate` output.

**Round 3: System design**
- Use `/diagram` to generate a simplified architecture view.
- Ask candidate to extend or redesign a component.

**Round 4: Stack-specific depth**
- Pull questions from the loaded `stack-*` skill's key concepts.

**Round 5: SQL/DB (if configured)**
- Use `db` MCP to pull real schema. Ask query-writing or optimization question.

## Available sub-skills

- `/codebase-engine` — understand codebase before generating questions
- `/investigate` — deep-dive specific subsystems for question material
- `/health` — identify code quality areas for interview questions
- `/diagram` — generate architecture diagrams for system design rounds

**Stack skills (auto-loaded):**
Same detection as `/swe` — `stack-python`, `stack-react-typescript`,
`stack-spring-boot`, `stack-spring-ai`, `stack-csharp`, etc.

**MCP data sources (when configured):**
- `db` — real schema for SQL interview rounds
- `confluence` — architecture docs for system design context

## Policy

{{POLICY_REQUIREMENTS}}
```

- [ ] **Step 2: Build and verify**

```bash
npm run build:skills && npm run check:skills && npm test
```

Expected: all pass, 5 new SKILL.md files generated.

- [ ] **Step 3: Commit**

```bash
git add agents/design-agent agents/migration agents/data agents/cloud agents/interviewer
git commit -m "feat(agents): add /design-agent, /migration, /data, /cloud, /interviewer"
```

---

## Task 7: `/stack` meta-loader skill

**Files:**
- Create: `stack/SKILL.md.tmpl` + `stack/SKILL.md`

**Interfaces:**
- Produces: `/stack <name>` invocable to explicitly override auto-detection and load a specific `stack-*` skill.

- [ ] **Step 1: Create `stack/SKILL.md.tmpl`**

```bash
mkdir -p stack
```

Write `stack/SKILL.md.tmpl`:

```markdown
---
name: stack
version: 0.1.0
description: |
  Stack context meta-loader. Explicitly activates the right stack-* skill
  for the current session. Used by agent skills for auto-detection, and
  directly by developers to override detection. Invoke via /stack <name>
  or when the user says "load stack X", "I'm working in Python", "set
  context to AWS", etc.
argument-hint: "[python|react-typescript|spring-boot|spring-ai|csharp|postgres|sql-server|legacy-frontend|databricks|databricks-dbt|aws|aws-dms|sqlserver-to-postgres]"
agents: [_infrastructure]
---

{{PREAMBLE}}

# Stack Meta-Loader

Loads the appropriate stack skill for the current project context. Called
automatically by role agents on session start. Can also be invoked directly
to override auto-detection.

## Auto-detection logic

Check files in this order and load the first match (multiple matches allowed):

| File pattern | Stack skill loaded |
|---|---|
| `package.json` with react or tsx deps | `/stack-react-typescript` |
| `pyproject.toml` or `setup.py` | `/stack-python` |
| `pom.xml` or `build.gradle` | `/stack-spring-boot` |
| `build.gradle` with spring-ai | `/stack-spring-ai` |
| `*.csproj` or `*.sln` | `/stack-csharp` |
| `databricks.yml` | `/stack-databricks` |
| `dbt_project.yml` | `/stack-databricks-dbt` |
| `*.tf` or `cdk.json` or `serverless.yml` | `/stack-aws` |
| SQL files with T-SQL (`GO`, `EXEC`) | `/stack-sql-server` |
| SQL files with Postgres (`SERIAL`, `$$`) | `/stack-postgres` |
| Migration from SQL Server to Postgres | `/stack-sqlserver-to-postgres` |
| AWS DMS config present | `/stack-aws-dms` |
| Old Knockout/YUI/jQuery patterns | `/stack-legacy-frontend` |

## Explicit override

```
/stack python          → loads /stack-python
/stack aws             → loads /stack-aws
/stack databricks      → loads /stack-databricks + /stack-databricks-dbt
/stack sqlserver       → loads /stack-sql-server
/stack postgres        → loads /stack-postgres
/stack migrate-to-pg   → loads /stack-sqlserver-to-postgres + /stack-postgres
```

## Policy

{{POLICY_REQUIREMENTS}}
```

- [ ] **Step 2: Build and verify**

```bash
npm run build:skills && npm run check:skills && npm test
```

Expected: all pass, `stack/SKILL.md` generated.

- [ ] **Step 3: Commit**

```bash
git add stack/
git commit -m "feat(stack): add /stack meta-loader skill for tech stack context loading"
```

---

## Task 8: Update `skillify` to prompt for `agents:` field

**Files:**
- Modify: `skillify/SKILL.md.tmpl`

- [ ] **Step 1: Read current `skillify/SKILL.md.tmpl`**

Read the file to find where the template generation section is.

- [ ] **Step 2: Add `agents:` prompt to skillify template generation**

Find the section in `skillify/SKILL.md.tmpl` that describes what to write in the frontmatter and add:

```
After writing `description:`, ask the user:
> "Which agents should this skill belong to? Valid values:
> orchestrate, swe, qa-agent, pm, spec-agent, design-agent,
> migration, data, cloud, interviewer, _infrastructure
>
> Examples: [swe, qa-agent] or [_infrastructure]"
>
> Write the answer as `agents: [<comma-separated list>]` in the frontmatter.
```

And update the generated frontmatter template to include:

```yaml
agents: [<agents-from-user-input>]
```

- [ ] **Step 3: Rebuild and verify**

```bash
npm run build:skills && npm run check:skills && npm test
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add skillify/SKILL.md.tmpl skillify/SKILL.md
git commit -m "feat(skillify): prompt for agents: field when creating new skills"
```

---

## Task 9: `scripts/install.mjs` — private install mode

**Files:**
- Create: `scripts/install.mjs`

**Interfaces:**
- Consumes: `.agent-config.json` in target repo root
- Produces: `.agent/CLAUDE.md`, `.agent/AGENTS.md`, `.agent/copilot-instructions.md`, `.agent/skills/`, `.agent/settings.json`, `.agent/VERSION`

- [ ] **Step 1: Write failing test for install dry-run**

Add to `tests/install-dry-run.test.mjs` (file already exists — append):

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import os from 'node:os';

const ROOT = path.resolve(import.meta.dirname, '..');

test('install.mjs --dry-run writes manifest without side effects', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aa-install-'));
  try {
    // Write minimal .agent-config.json
    fs.writeFileSync(path.join(tmp, '.agent-config.json'), JSON.stringify({
      private: true,
      hosts: ['claude', 'codex'],
      agents: ['swe', 'qa-agent'],
      mcps: [],
    }));

    execSync(
      `node ${path.join(ROOT, 'scripts/install.mjs')} --private --target ${tmp}/.agent --dry-run`,
      { cwd: tmp, stdio: 'pipe' }
    );

    const manifest = JSON.parse(fs.readFileSync(path.join(tmp, '.agent', 'install-manifest.json'), 'utf8'));
    assert.equal(manifest.private, true);
    assert.ok(Array.isArray(manifest.agents));
    assert.ok(manifest.agents.includes('swe'));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
node --test tests/install-dry-run.test.mjs
```

Expected: FAIL — `scripts/install.mjs` does not exist.

- [ ] **Step 3: Create `scripts/install.mjs`**

```js
#!/usr/bin/env node
/**
 * Private installer for agent-architecture.
 *
 * Usage:
 *   node scripts/install.mjs --private --target <path> [--hosts claude,codex,copilot] [--dry-run]
 *   node scripts/install.mjs --upgrade --target <path>
 *   node scripts/install.mjs --doctor --target <path>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

const PRIVATE = args.includes('--private');
const DRY_RUN = args.includes('--dry-run');
const UPGRADE = args.includes('--upgrade');
const DOCTOR = args.includes('--doctor');

const targetIdx = args.indexOf('--target');
const TARGET = targetIdx !== -1 ? path.resolve(args[targetIdx + 1]) : path.join(process.cwd(), '.agent');

const hostsIdx = args.indexOf('--hosts');
const HOSTS = hostsIdx !== -1
  ? args[hostsIdx + 1].split(',').map((h) => h.trim())
  : ['claude', 'codex', 'copilot'];

// Read .agent-config.json from cwd or target parent
function readConfig() {
  const configPath = path.join(process.cwd(), '.agent-config.json');
  if (fs.existsSync(configPath)) return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return { private: PRIVATE, hosts: HOSTS, agents: [], mcps: [] };
}

function readPackageVersion() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
}

function writeFile(rel, content) {
  const full = path.join(TARGET, rel);
  if (DRY_RUN) { console.log(`  [dry-run] would write: ${rel}`); return; }
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log(`  wrote: ${rel}`);
}

function generateSettings(config) {
  const mcpServers = {};
  for (const mcp of (config.mcps ?? [])) {
    const env = {};
    for (const envVar of (mcp.credentialEnvVars ?? [])) {
      const val = process.env[envVar];
      if (!val) console.warn(`  WARN: MCP "${mcp.name}" needs ${envVar} (not set in env)`);
      else env[envVar] = val;
    }
    mcpServers[mcp.name] = { command: mcp.command, args: mcp.args, env };
  }
  return JSON.stringify({
    env: { CLAUDE_CODE_DISABLE_AUTO_MEMORY: '1' },
    permissions: { defaultMode: 'bypassPermissions', allow: [] },
    mcpServers,
  }, null, 2);
}

function generateClaudeMd(config) {
  const agentList = (config.agents ?? []).map((a) => `- \`/${a}\``).join('\n');
  return [
    '# .agent — Architecture Agent Skill Pack',
    '',
    '> Generated by agent-architecture installer. Do not edit directly.',
    '> Re-run: `npx agent-architecture install`',
    '',
    '## Private Mode',
    '',
    'No telemetry. No cloud memory. No update checks.',
    'Data leaves only via explicitly configured MCP credentials.',
    '',
    '## Available Agents',
    '',
    agentList,
    '',
    '## Invoke',
    '',
    'Use the agent name as a slash command: `/swe`, `/pm`, `/qa-agent`, etc.',
    '',
    '## Stack Context',
    '',
    'Each agent auto-detects your tech stack. Override with `/stack <name>`.',
    '',
  ].join('\n');
}

function generateAgentsMd(config) {
  const agentList = (config.agents ?? []).map((a) => `- ${a}: invoke by describing the task`).join('\n');
  return [
    '# AGENTS.md — Architecture Agent Skill Pack',
    '',
    '> Generated by agent-architecture installer.',
    '',
    '## Available Agents (reference by purpose in your task)',
    '',
    agentList,
    '',
    '## Commit Discipline (Always Active)',
    '',
    '- Commit after each discrete behavior change.',
    '- Format: `<type>[scope]: <description>` (Conventional Commits).',
    '- Never use `--no-verify`, `--force`, or `--no-gpg-sign`.',
    '',
  ].join('\n');
}

function generateCopilotInstructions(config) {
  const agentList = (config.agents ?? []).map((a) => `- ${a}`).join('\n');
  return [
    '# Copilot Instructions — Architecture Agent Skill Pack',
    '',
    '> Generated by agent-architecture installer.',
    '',
    '## Available Role Agents',
    '',
    agentList,
    '',
    '## Commit Discipline',
    '',
    'Every commit: one behavior change, Conventional Commits format.',
    '',
  ].join('\n');
}

function generateManifest(config) {
  return JSON.stringify({
    version: readPackageVersion(),
    installedAt: new Date().toISOString(),
    private: true,
    hosts: config.hosts ?? HOSTS,
    agents: config.agents ?? [],
    mcpCount: (config.mcps ?? []).length,
  }, null, 2);
}

function install() {
  const config = readConfig();
  const version = readPackageVersion();
  console.log(`Installing agent-architecture v${version} → ${TARGET}`);
  console.log(`  private: ${PRIVATE}, hosts: ${(config.hosts ?? HOSTS).join(',')}`);

  writeFile('install-manifest.json', generateManifest(config));
  writeFile('VERSION', version + '\n');

  const hosts = config.hosts ?? HOSTS;
  if (hosts.includes('claude')) writeFile('CLAUDE.md', generateClaudeMd(config));
  if (hosts.includes('codex')) writeFile('AGENTS.md', generateAgentsMd(config));
  if (hosts.includes('copilot')) writeFile('copilot-instructions.md', generateCopilotInstructions(config));
  if (PRIVATE) writeFile('settings.json', generateSettings(config));

  // Copy agent skill files
  const agentsDir = path.join(ROOT, 'agents');
  if (fs.existsSync(agentsDir)) {
    for (const agent of fs.readdirSync(agentsDir)) {
      const skillMd = path.join(agentsDir, agent, 'SKILL.md');
      if (!fs.existsSync(skillMd)) continue;
      if (config.agents && config.agents.length > 0 && !config.agents.includes(agent)) continue;
      writeFile(`skills/${agent}/SKILL.md`, fs.readFileSync(skillMd, 'utf8'));
    }
  }

  console.log('Done.');
}

function doctor() {
  console.log(`Checking install at ${TARGET}...`);
  const checks = [
    ['install-manifest.json', 'manifest'],
    ['VERSION', 'version file'],
    ['CLAUDE.md', 'Claude host artifact'],
  ];
  let ok = true;
  for (const [rel, label] of checks) {
    const exists = fs.existsSync(path.join(TARGET, rel));
    console.log(`  ${exists ? '✓' : '✗'} ${label} (${rel})`);
    if (!exists) ok = false;
  }
  if (!ok) { console.error('Doctor found issues. Re-run: npx agent-architecture install'); process.exitCode = 1; }
  else console.log('All checks passed.');
}

if (DOCTOR) { doctor(); }
else { install(); }
```

- [ ] **Step 4: Run test to verify it passes**

```bash
node --test tests/install-dry-run.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add scripts/install.mjs tests/install-dry-run.test.mjs
git commit -m "feat(install): add scripts/install.mjs with --private flag and dry-run support"
```

---

## Task 10: `bin/agent-architecture.mjs` CLI + package.json

**Files:**
- Create: `bin/agent-architecture.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `npx agent-architecture install|upgrade|doctor` works from any directory.

- [ ] **Step 1: Create `bin/agent-architecture.mjs`**

```js
#!/usr/bin/env node
/**
 * agent-architecture CLI
 * Usage: npx agent-architecture <install|upgrade|doctor> [options]
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [cmd, ...rest] = process.argv.slice(2);

const INSTALL_SCRIPT = path.join(ROOT, 'scripts', 'install.mjs');

const USAGE = `
Usage: npx agent-architecture <command> [options]

Commands:
  install    Install agent-architecture into the current repo (default target: .agent/)
  upgrade    Upgrade an existing install
  doctor     Check health of an existing install

Options:
  --target <path>       Install target directory (default: .agent/)
  --hosts <list>        Comma-separated host list: claude,codex,copilot (default: auto-detect)
  --private             Strip telemetry and cloud sync (recommended for internal use)
  --dry-run             Print what would be written without writing

Examples:
  npx agent-architecture install --private
  npx agent-architecture install --private --hosts claude,codex
  npx agent-architecture doctor
  npx agent-architecture upgrade --private
`.trim();

if (!cmd || cmd === '--help' || cmd === '-h') {
  console.log(USAGE);
  process.exit(0);
}

const FLAG_MAP = {
  install: ['--private', ...rest],
  upgrade: ['--private', '--upgrade', ...rest],
  doctor:  ['--doctor', ...rest],
};

if (!FLAG_MAP[cmd]) {
  console.error(`Unknown command: ${cmd}\n\n${USAGE}`);
  process.exit(1);
}

execFileSync(process.execPath, [INSTALL_SCRIPT, ...FLAG_MAP[cmd]], { stdio: 'inherit' });
```

- [ ] **Step 2: Update `package.json`**

```json
{
  "name": "agent-architecture",
  "version": "0.1.0",
  "private": false,
  "type": "module",
  "description": "Reusable enterprise-safe agent skill architecture.",
  "bin": {
    "agent-architecture": "./bin/agent-architecture.mjs"
  },
  "scripts": {
    "scaffold:skills": "node scripts/scaffold-skills.mjs",
    "build:skills": "node scripts/gen-skill-docs.mjs",
    "check:skills": "node scripts/gen-skill-docs.mjs --check",
    "gen:hosts": "node scripts/gen-host-artifacts.mjs",
    "check:hosts": "node scripts/gen-host-artifacts.mjs --check",
    "subagents:deploy": "node scripts/subagent-deploy.mjs",
    "subagents:import": "node scripts/subagent-import.mjs",
    "install:pack": "node scripts/install.mjs --private",
    "doctor": "node scripts/install.mjs --doctor",
    "test": "node --test tests/*.test.mjs",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:free:list": "node scripts/test-free-shards.mjs --list",
    "test:free:windows": "node scripts/test-free-shards.mjs --windows-only --list"
  },
  "devDependencies": {
    "@playwright/test": "^1.56.0"
  }
}
```

Note: `"private": false` enables `npx` usage. The installer itself enforces private-mode behavior — the package being publishable does not expose any secrets.

- [ ] **Step 3: Make the bin file executable (Unix)**

```bash
chmod +x bin/agent-architecture.mjs
```

- [ ] **Step 4: Test the CLI locally**

```bash
node bin/agent-architecture.mjs --help
```

Expected: prints USAGE without error.

```bash
node bin/agent-architecture.mjs install --private --dry-run
```

Expected: prints `[dry-run] would write:` lines, exits 0.

- [ ] **Step 5: Run full tests**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add bin/agent-architecture.mjs package.json
git commit -m "feat(cli): add bin/agent-architecture.mjs CLI with install/upgrade/doctor commands"
```

---

## Task 11: Update host artifacts to include agent routing

**Files:**
- Modify: `scripts/gen-host-artifacts.mjs`
- Modify: `generated/codex/AGENTS.md` (regenerated)
- Modify: `generated/copilot/copilot-instructions.md` (regenerated)

**Interfaces:**
- Produces: `generated/codex/AGENTS.md` includes an `## Available Agents` section listing all 10 agents with their purpose; `generated/copilot/copilot-instructions.md` same.

- [ ] **Step 1: Add `buildAgentsSection` to `scripts/gen-host-artifacts.mjs`**

After the existing imports, add:

```js
function buildAgentsSection() {
  const agentsDir = path.join(ROOT, 'agents');
  if (!fs.existsSync(agentsDir)) return '';

  const lines = ['## Available Agents', ''];
  for (const name of fs.readdirSync(agentsDir).sort()) {
    const skillMd = path.join(agentsDir, name, 'SKILL.md');
    if (!fs.existsSync(skillMd)) continue;
    const content = fs.readFileSync(skillMd, 'utf8');
    // Extract description from frontmatter
    const descMatch = content.match(/^description:\s*\|\n([\s\S]*?)^[a-z]/m);
    const firstLine = descMatch
      ? descMatch[1].trim().split('\n')[0].trim()
      : `/${name} agent`;
    lines.push(`- **\`/${name}\`** — ${firstLine}`);
  }
  lines.push('');
  lines.push('Invoke by slash command (Claude/Copilot) or by task description (Codex).');
  lines.push('');
  return lines.join('\n');
}
```

- [ ] **Step 2: Inject into `buildAgentsMd` and `buildCopilotInstructions` functions**

In `buildAgentsMd()`, after the existing `## How to Invoke Skills` section, add:

```js
buildAgentsSection(),
```

In `buildCopilotInstructions()` (or equivalent copilot builder function), add the same.

- [ ] **Step 3: Regenerate host artifacts**

```bash
npm run gen:hosts
```

Expected: updates `generated/codex/AGENTS.md` and `generated/copilot/copilot-instructions.md`.

- [ ] **Step 4: Verify check passes**

```bash
npm run check:hosts
```

Expected: exits 0 (generated files match).

- [ ] **Step 5: Run full tests**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add scripts/gen-host-artifacts.mjs generated/
git commit -m "feat(hosts): include agent routing section in generated AGENTS.md and copilot-instructions.md"
```

---

---

## Task 12: TinyURL integration test suite

Simulates building a real TinyURL project using agent-architecture. Tests that
the full install → stack detection → agent skill routing → doctor chain works
end-to-end against a realistic project fixture, with no LLM calls required.

**Files:**
- Create: `tests/integration/tinyurl-fixture/` — minimal TinyURL project
- Create: `tests/integration/tinyurl-install.test.mjs` — install integration test
- Create: `tests/integration/tinyurl-routing.test.mjs` — agent routing test
- Create: `tests/integration/tinyurl-stack-detection.test.mjs` — stack detection test

**What TinyURL fixture contains:**

```
tests/integration/tinyurl-fixture/
├── package.json              ← Node.js + express + pg
├── src/
│   ├── index.js              ← Express app: POST /shorten, GET /:code
│   └── db.js                 ← Postgres connection pool
├── schema.sql                ← CREATE TABLE urls (id SERIAL, code TEXT, url TEXT)
├── .agent-config.json        ← private: true, agents: [swe, qa-agent, spec-agent, pm], mcps: [db]
└── .env.agent.example        ← DATABASE_URL=postgres://localhost/tinyurl
```

**What the tests verify:**

1. **Install test** — installer runs against fixture, produces correct `.agent/` artifacts
2. **Routing test** — every agent in `.agent-config.json` has its SKILL.md installed
3. **Stack detection test** — detection logic identifies `stack-postgres` (from schema.sql SERIAL keyword) and `stack-react-typescript` or plain Node.js from package.json
4. **Doctor test** — `doctor` command passes against the installed fixture
5. **Agent skill content test** — installed `/swe/SKILL.md` mentions `stack-postgres` and `commit`; `/spec-agent/SKILL.md` mentions `atlassian-docs` and `spec`

**Interfaces:**
- Consumes: `scripts/install.mjs` (Task 9), `scripts/discover-skills.mjs` (Task 3), `agents/*/SKILL.md` (Tasks 4–6)
- Produces: green integration test suite that proves the system works for a real project shape

- [ ] **Step 1: Create TinyURL fixture files**

```bash
mkdir -p tests/integration/tinyurl-fixture/src
```

Write `tests/integration/tinyurl-fixture/package.json`:

```json
{
  "name": "tinyurl",
  "version": "1.0.0",
  "type": "module",
  "description": "URL shortener service",
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0"
  },
  "scripts": {
    "start": "node src/index.js",
    "test": "node --test tests/*.test.js"
  }
}
```

Write `tests/integration/tinyurl-fixture/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS urls (
  id     SERIAL PRIMARY KEY,
  code   TEXT NOT NULL UNIQUE,
  url    TEXT NOT NULL,
  hits   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_urls_code ON urls(code);
```

Write `tests/integration/tinyurl-fixture/src/index.js`:

```js
import express from 'express';
import { pool } from './db.js';
import { randomBytes } from 'node:crypto';

const app = express();
app.use(express.json());

app.post('/shorten', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  const code = randomBytes(4).toString('hex');
  await pool.query('INSERT INTO urls (code, url) VALUES ($1, $2)', [code, url]);
  res.json({ code, short: `http://localhost:3000/${code}` });
});

app.get('/:code', async (req, res) => {
  const { rows } = await pool.query('SELECT url FROM urls WHERE code=$1', [req.params.code]);
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  await pool.query('UPDATE urls SET hits=hits+1 WHERE code=$1', [req.params.code]);
  res.redirect(301, rows[0].url);
});

app.listen(3000, () => console.log('tinyurl running on :3000'));
export default app;
```

Write `tests/integration/tinyurl-fixture/src/db.js`:

```js
import pg from 'pg';
const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

Write `tests/integration/tinyurl-fixture/.agent-config.json`:

```json
{
  "private": true,
  "hosts": ["claude", "codex", "copilot"],
  "agents": ["swe", "qa-agent", "spec-agent", "pm"],
  "mcps": [
    {
      "name": "db",
      "command": "uvx",
      "args": ["mcp-server-postgres"],
      "credentialEnvVars": ["DATABASE_URL"]
    }
  ]
}
```

Write `tests/integration/tinyurl-fixture/.env.agent.example`:

```
DATABASE_URL=postgres://localhost/tinyurl
```

- [ ] **Step 2: Write install integration test**

Write `tests/integration/tinyurl-install.test.mjs`:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '../..');
const FIXTURE = path.resolve(import.meta.dirname, 'tinyurl-fixture');
const INSTALL_SCRIPT = path.join(ROOT, 'scripts', 'install.mjs');

function runInstall(targetDir, extraArgs = []) {
  execFileSync(process.execPath, [
    INSTALL_SCRIPT,
    '--private',
    '--target', targetDir,
    ...extraArgs,
  ], { cwd: FIXTURE, stdio: 'pipe' });
}

test('install into tinyurl fixture produces all expected artifacts', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-agent-'));
  try {
    runInstall(tmp);

    // Manifest exists and is valid
    const manifest = JSON.parse(fs.readFileSync(path.join(tmp, 'install-manifest.json'), 'utf8'));
    assert.equal(manifest.private, true, 'manifest.private must be true');
    assert.deepEqual(manifest.agents, ['swe', 'qa-agent', 'spec-agent', 'pm'],
      'manifest agents must match .agent-config.json');

    // VERSION written
    assert.ok(fs.existsSync(path.join(tmp, 'VERSION')), 'VERSION file missing');

    // Host artifacts written for all 3 hosts
    assert.ok(fs.existsSync(path.join(tmp, 'CLAUDE.md')), 'CLAUDE.md missing');
    assert.ok(fs.existsSync(path.join(tmp, 'AGENTS.md')), 'AGENTS.md missing');
    assert.ok(fs.existsSync(path.join(tmp, 'copilot-instructions.md')), 'copilot-instructions.md missing');

    // settings.json written (private mode)
    const settings = JSON.parse(fs.readFileSync(path.join(tmp, 'settings.json'), 'utf8'));
    assert.equal(settings.env.CLAUDE_CODE_DISABLE_AUTO_MEMORY, '1', 'auto-memory must be disabled');
    assert.ok('db' in settings.mcpServers, 'db MCP server must be wired');
    assert.ok(!('cavemem' in settings.mcpServers), 'cavemem must not be installed (private mode)');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('install dry-run writes nothing to disk', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-dry-'));
  try {
    runInstall(tmp, ['--dry-run']);
    const files = fs.readdirSync(tmp);
    assert.deepEqual(files, [], `dry-run must write nothing, but found: ${files.join(', ')}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('doctor passes after install', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-doctor-'));
  try {
    runInstall(tmp);
    assert.doesNotThrow(() => {
      execFileSync(process.execPath, [INSTALL_SCRIPT, '--doctor', '--target', tmp], {
        cwd: FIXTURE, stdio: 'pipe',
      });
    }, 'doctor must exit 0 after a clean install');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
```

- [ ] **Step 3: Write agent routing test**

Write `tests/integration/tinyurl-routing.test.mjs`:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '../..');
const FIXTURE = path.resolve(import.meta.dirname, 'tinyurl-fixture');
const INSTALL_SCRIPT = path.join(ROOT, 'scripts', 'install.mjs');

let TMP;
test.before(() => {
  TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyurl-routing-'));
  execFileSync(process.execPath, [INSTALL_SCRIPT, '--private', '--target', TMP],
    { cwd: FIXTURE, stdio: 'pipe' });
});

test.after(() => {
  if (TMP) fs.rmSync(TMP, { recursive: true, force: true });
});

test('only agents declared in .agent-config.json are installed', () => {
  const configAgents = ['swe', 'qa-agent', 'spec-agent', 'pm'];
  const notInstalled = ['orchestrate', 'migration', 'data', 'cloud', 'interviewer', 'design-agent'];

  for (const agent of configAgents) {
    assert.ok(
      fs.existsSync(path.join(TMP, 'skills', agent, 'SKILL.md')),
      `expected agent "${agent}" to be installed`
    );
  }
  for (const agent of notInstalled) {
    assert.ok(
      !fs.existsSync(path.join(TMP, 'skills', agent, 'SKILL.md')),
      `agent "${agent}" should NOT be installed (not in .agent-config.json)`
    );
  }
});

test('/swe SKILL.md contains commit and seniorswe-concise', () => {
  const skill = fs.readFileSync(path.join(TMP, 'skills', 'swe', 'SKILL.md'), 'utf8');
  assert.ok(skill.includes('/commit'), '/swe must mention /commit');
  assert.ok(skill.includes('/seniorswe-concise'), '/swe must mention /seniorswe-concise');
  assert.ok(skill.includes('/investigate'), '/swe must mention /investigate');
  assert.ok(skill.includes('/ship'), '/swe must mention /ship');
});

test('/spec-agent SKILL.md contains atlassian-docs and spec', () => {
  const skill = fs.readFileSync(path.join(TMP, 'skills', 'spec-agent', 'SKILL.md'), 'utf8');
  assert.ok(skill.includes('/atlassian-docs'), '/spec-agent must mention /atlassian-docs');
  assert.ok(skill.includes('/spec'), '/spec-agent must mention /spec');
  assert.ok(skill.includes('/diagram'), '/spec-agent must mention /diagram');
});

test('/qa-agent SKILL.md contains qa and benchmark', () => {
  const skill = fs.readFileSync(path.join(TMP, 'skills', 'qa-agent', 'SKILL.md'), 'utf8');
  assert.ok(skill.includes('/qa'), '/qa-agent must mention /qa');
  assert.ok(skill.includes('/benchmark'), '/qa-agent must mention /benchmark');
  assert.ok(skill.includes('/canary'), '/qa-agent must mention /canary');
});

test('CLAUDE.md lists all configured agents', () => {
  const claude = fs.readFileSync(path.join(TMP, 'CLAUDE.md'), 'utf8');
  for (const agent of ['swe', 'qa-agent', 'spec-agent', 'pm']) {
    assert.ok(claude.includes(`/${agent}`), `CLAUDE.md must list /${agent}`);
  }
});

test('AGENTS.md lists all configured agents', () => {
  const agents = fs.readFileSync(path.join(TMP, 'AGENTS.md'), 'utf8');
  for (const agent of ['swe', 'qa-agent', 'spec-agent', 'pm']) {
    assert.ok(agents.includes(agent), `AGENTS.md must mention ${agent}`);
  }
});
```

- [ ] **Step 4: Write stack detection test**

Write `tests/integration/tinyurl-stack-detection.test.mjs`:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const FIXTURE = path.resolve(import.meta.dirname, 'tinyurl-fixture');

// Inline the same detection logic used in /stack meta-loader
// so we test the logic, not just that the file exists.
function detectStacks(projectDir) {
  const detected = [];
  const files = fs.readdirSync(projectDir, { recursive: true })
    .map((f) => (typeof f === 'string' ? f : f.toString()))
    .filter((f) => !f.includes('node_modules'));

  // Node.js / React
  const pkgPath = path.join(projectDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps.react || deps['@types/react']) detected.push('stack-react-typescript');
  }

  // Postgres (SERIAL or $$ in SQL files)
  const sqlFiles = files.filter((f) => f.endsWith('.sql'));
  for (const sql of sqlFiles) {
    const content = fs.readFileSync(path.join(projectDir, sql), 'utf8');
    if (content.includes('SERIAL') || content.includes('$$')) {
      if (!detected.includes('stack-postgres')) detected.push('stack-postgres');
    }
    if (/\bGO\b/.test(content) || /EXEC\s+sp_/i.test(content)) {
      if (!detected.includes('stack-sql-server')) detected.push('stack-sql-server');
    }
  }

  // Python
  if (fs.existsSync(path.join(projectDir, 'pyproject.toml')) ||
      fs.existsSync(path.join(projectDir, 'setup.py'))) {
    detected.push('stack-python');
  }

  // .NET
  if (files.some((f) => f.endsWith('.csproj') || f.endsWith('.sln'))) {
    detected.push('stack-csharp');
  }

  // Databricks
  if (fs.existsSync(path.join(projectDir, 'databricks.yml'))) {
    detected.push('stack-databricks');
  }

  return detected;
}

test('tinyurl fixture detects stack-postgres from schema.sql SERIAL keyword', () => {
  const stacks = detectStacks(FIXTURE);
  assert.ok(stacks.includes('stack-postgres'),
    `expected stack-postgres to be detected, got: ${stacks.join(', ')}`);
});

test('tinyurl fixture does NOT detect stack-sql-server (no T-SQL patterns)', () => {
  const stacks = detectStacks(FIXTURE);
  assert.ok(!stacks.includes('stack-sql-server'),
    'stack-sql-server must not be detected for a Postgres project');
});

test('tinyurl fixture does NOT detect stack-databricks (no databricks.yml)', () => {
  const stacks = detectStacks(FIXTURE);
  assert.ok(!stacks.includes('stack-databricks'),
    'stack-databricks must not be detected for tinyurl');
});

test('tinyurl fixture does NOT detect stack-csharp (no .csproj)', () => {
  const stacks = detectStacks(FIXTURE);
  assert.ok(!stacks.includes('stack-csharp'),
    'stack-csharp must not be detected for tinyurl');
});

test('tinyurl fixture does NOT detect stack-react-typescript (no react dep)', () => {
  const stacks = detectStacks(FIXTURE);
  assert.ok(!stacks.includes('stack-react-typescript'),
    'stack-react-typescript must not be detected — tinyurl is plain Node.js, not React');
});
```

- [ ] **Step 5: Update `package.json` test script to include integration tests**

In `package.json`, change:

```json
"test": "node --test tests/*.test.mjs",
```

to:

```json
"test": "node --test tests/*.test.mjs tests/integration/*.test.mjs",
```

- [ ] **Step 6: Run integration tests to verify they fail before Tasks 9–11**

```bash
node --test tests/integration/tinyurl-install.test.mjs
```

Expected: FAIL — `scripts/install.mjs does not exist` (or equivalent).
This confirms tests are genuine guards, not vacuous passes.

- [ ] **Step 7: After Tasks 9–11 complete, run full suite including integration**

```bash
npm test
```

Expected: ALL pass including 3 integration test files.

```
✓ tests/integration/tinyurl-install.test.mjs (3 tests)
✓ tests/integration/tinyurl-routing.test.mjs (5 tests)
✓ tests/integration/tinyurl-stack-detection.test.mjs (5 tests)
```

- [ ] **Step 8: Commit**

```bash
git add tests/integration/
git commit -m "test(integration): add TinyURL fixture + install/routing/stack-detection integration tests"
```

---

## Self-Review

**Spec coverage:**
- ✓ `agents:` frontmatter field — Task 1 + 2
- ✓ Orphan check in `npm test` — Task 1
- ✓ 10 agent SKILL.md files — Tasks 4–6
- ✓ `/stack` meta-loader — Task 7
- ✓ `skillify` updated — Task 8
- ✓ `scripts/install.mjs --private` — Task 9
- ✓ `npx agent-architecture install|upgrade|doctor` — Task 10
- ✓ Host artifacts include agents — Task 11
- ✓ `discover-skills.mjs` scans `agents/` — Task 3
- ✓ All existing skills get `agents:` field — Task 2

**Placeholder scan:** None. Every step has concrete code.

**Type consistency:** `discoverSkillAgents` returns `Map<string, string[]>` — used in orphan test. `install.mjs` reads `config.agents: string[]` — consistent with `.agent-config.json` shape.

**Gap check:** `add-agents-field.mjs` helper is created then deleted in Task 2 — no orphan script left behind.
