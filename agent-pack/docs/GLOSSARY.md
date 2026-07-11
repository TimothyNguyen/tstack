# Agent Pack Glossary

Key terms and concepts used throughout agent-pack.

## Core Concepts

**Agent**
A role-based coordinator that orchestrates skills. Examples: `/swe` (software engineer), `/qa-agent` (QA), `/orchestrate` (coordinator). Agents route user requests to appropriate skills based on metadata.

**Skill**
A focused, reusable capability that performs one job well. Examples: `/migration-sqlserver-assess`, `/diagram-generate`, `/spec`. Skills are self-contained YAML + Markdown with metadata frontmatter.

**Skill Family**
A set of related skills + coordinator agent addressing one domain. Example: SQL Server → Postgres migration (agent: migration-engineer; skills: assess, schema, data, test, perf). Built using EXTENSIBILITY-GUIDE.md 6-phase process.

**Workflow**
A sequence of agent + skill invocations to solve a larger problem. Example: "brainstorm → diagram → spec → implement → test → deploy" (250 min total). Registered in `docs/workflows/registry.json`.

**MCP (Model Context Protocol)**
External service providing tools/resources. Examples: postgres-mcp (database access), github-mcp (GitHub API), drawio-mcp (diagrams). Declared in skill metadata; requires policy approval.

---

## Metadata & Configuration

**Metadata Schema**
YAML frontmatter structure for skills. Includes: name, version, description, agents, allowed-tools, category, domain, tier, dependencies, approval-gates, support. See METADATA-SCHEMA.md for full reference.

**Approval Gate**
Policy requirement before a skill can be invoked. Example: `approval-gates: [mcp-egress, database-access]`. Gates are declared in skill metadata; policy teams approve. Red flags: hardcoded secrets, destructive git ops, unauthorized egress.

**Category**
Skill grouping for discovery. Examples: "core" (essential), "visual-system" (diagrams), "design" (UI/design), "data" (analytics/data), "infrastructure" (DevOps). Used in auto-generated catalog.

**Domain**
Specialized area within category. Examples: "data-migration", "sql-optimization", "workflow-automation". Helps LLMs discover related skills.

**Tier**
Stability/maturity level. Tiers: "essential" (production-ready), "recommended" (well-tested), "experimental" (new/unproven). Used to filter which skills appear to new users.

**Policy-Gated**
Requires explicit approval before use. Applies to: MCPs, destructive operations (git push, delete), elevated access. Policy teams define which skills need approval; users can't bypass.

---

## Build & Release

**SKILL.md.tmpl**
Template file (authored source). Contains: YAML frontmatter, {{PREAMBLE}} placeholder, skill documentation. Developers edit .tmpl files only.

**SKILL.md**
Generated file (committed). Auto-generated from .tmpl by `npm run build:skills`. Contains: rendered frontmatter + preamble + body. Never edit directly.

**Registry**
Auto-generated `generated/registry.json`. Maps: skill name → metadata (agents, dependencies, category, tier, keywords). Used for discovery & routing.

In the TStack split, `agent-pack` owns authored definitions and `agent-registry` owns published registry/catalog records. This package's generated registry is export input for `agent-registry`, not the registry API.

**Catalog**
Auto-generated `docs/skill-catalog.md`. Human-readable skill directory grouped by category & agent. ~2000 lines, links to each skill.

**Training Data**
Auto-generated `docs/TRAINING-DATA.jsonl`. JSONL export (one skill per line) with: name, version, description, agents, keywords, examples, use-cases. Used for LLM fine-tuning.

**Validation**
Pre-merge verification. Checks: metadata schema compliance, no hardcoded secrets, no unresolved placeholders, all skills registered in package.json, tests passing. See SKILL-VALIDATION-CHECKLIST.md.

---

## Testing

**RED Phase**
Tests fail because skill doesn't exist yet. First step of TDD. Example: test expects SKILL.md to have "description" field; skill not created yet → RED (fail).

**GREEN Phase**
Tests pass. Minimal skill implementation satisfies test requirements. Example: create SKILL.md.tmpl with all required fields → GREEN (pass).

**REFACTOR Phase**
Improve skill without breaking tests. Add examples, clarify checklist, enhance documentation. Tests still pass.

**Test Suite**
401+ tests covering: skill structure (name/version/agents), metadata schema, security (no secrets, no destructive ops), generated files freshness, routing validation.

---

## Security & Governance

**Default-Deny**
Framework principle: skills have no special access by default. All external access (MCPs, git writes) requires explicit declaration in metadata + policy approval.

**No Telemetry**
No automatic data collection, no update checks, no analytics. Enterprise-safe: what happens in your repo stays in your repo.

**Allowed-Tools**
Skill declares which tools it uses: [Read, Bash, Grep, Edit, Bash]. Limits surface area; prevents skills from accessing tools they don't need.

**Destructive Operations**
Operations that can't be undone: `git push --force`, `rm -rf`, `DROP TABLE`, cluster shutdown. Forbidden by default; must be explicitly approved via policy gate.

**Secrets**
Credentials (API keys, passwords, tokens) must NEVER be hardcoded in skills. Must be: env vars at invocation time, loaded from external secret manager, never logged. All skills scanned for hardcoded secrets pre-merge.

---

## Discovery & Learning

**Preamble**
Standard header injected into every skill. Provides: skill purpose, when to use, anti-patterns, related skills, examples. Makes all skills consistent & learnable.

**Keywords**
Metadata field helping LLMs discover related skills. Example: skill "migration-sqlserver-assess" has keywords: [migration, assessment, sql-server, database, postgres]. Used in training data.

**Use Cases**
Metadata field listing scenarios where skill is appropriate. Example: "Use when: migration planned", "Use when: assessing database complexity". Extracted from skill body by gen-training-data.mjs.

**Examples**
Worked examples in skill body showing: user request → skill steps → expected output. Format: Example 1 (simple case), Example 2 (complex case), Example 3 (edge case). Required for discovery.

**Anti-Patterns**
Common mistakes skill tries to prevent. Example: "❌ Migrate without assessing" → leads to surprises. Helps users avoid pitfalls.

---

## Maintenance

**Maintenance Status**
Support level for skill. Values: "active" (actively maintained), "stable" (no planned changes), "deprecated" (phase-out in progress), "archived" (no longer supported). Guides users on reliability.

**Owner Team**
Which team maintains this skill. Example: "data-engineering" for migration skills. Used for escalation & updates.

**Last Reviewed**
Date skill was last reviewed for correctness & security. If >6 months old, flagged for review. Ensures skills stay current.

**Version**
Semantic version (MAJOR.MINOR.PATCH). Breaking changes increment MAJOR. New features increment MINOR. Patches increment PATCH. Helps manage compatibility.

---

## Framework & Architecture

**Extensibility Framework**
The meta-system for adding skills systematically. Includes: metadata schema (what to declare), contribution workflow (how to submit), validation checklist (QA gate), security review (approval gate), documentation (examples/patterns), auto-generation (catalog/training data).

**TDD (Test-Driven Development)**
Write test before code: test RED (fails) → implement → test GREEN (passes) → REFACTOR. Required pattern for all skills. Ensures correctness + discoverability.

**Metadata-Driven**
Skills self-describe via YAML frontmatter. Framework generates: registry, catalog, training data, host distributions. No hardcoded routing; all discovery from metadata.

**Principal Engineer Model**
Target user for extensibility. Can add 150+ skills systematically without tribal knowledge. Armed with: EXTENSIBILITY-GUIDE.md (6 phases), checklists (validation/security/structure), examples (SQL Server migration), auto-tooling (code generation, validation, testing).

**Policy Review**
Two-stage gate: metadata review (does skill declare all dependencies?) + code review (are there secrets?). Approval stamps gate names (mcp-egress, database-access). Prevents policy violations pre-deployment.

---

## Commands

**`npm run build:skills`**
Generate all SKILL.md files from .tmpl templates. Also: builds registry, catalog, and training data. Pre-commit step.

**`npm run check:skills`**
Verify SKILL.md files are current (matches .tmpl). Fails if generated files stale → forces rebuild before commit.

**`npm test`**
Run 401+ tests: structure, metadata, security, routing. Fails if any skill violates requirements.

**`npm run validate:metadata -- <skill>`**
Validate single skill metadata: required fields, schema compliance, agent names valid.

**`npm run gen:training-data`**
Export all skills to TRAINING-DATA.jsonl for LLM fine-tuning. One JSON object per line.

**`npm run gen:catalog`**
Generate skill-catalog.md (human-readable directory). Grouped by category & agent, ~2000 lines.

---

## See Also

- [EXTENSIBILITY-GUIDE.md](./EXTENSIBILITY-GUIDE.md) — 6-phase process for adding skills
- [METADATA-SCHEMA.md](./METADATA-SCHEMA.md) — Full metadata field reference
- [CONTRIBUTING.md](./CONTRIBUTING.md) — 10-step skill submission workflow
- [ADOPTION.md](./ADOPTION.md) — Rolling out skills across your organization
- [SKILL-VALIDATION-CHECKLIST.md](./SKILL-VALIDATION-CHECKLIST.md) — QA gates (8 sections)
- [SECURITY-REVIEW-CHECKLIST.md](./SECURITY-REVIEW-CHECKLIST.md) — Security gates (8 categories)
