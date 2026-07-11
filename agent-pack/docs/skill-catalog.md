# Skill Catalog

agent-pack catalogs 71 reusable skills. Agents, workflows, stacks, domains, adapters, and tool providers live in sibling package directories.

**[Contributing?](./CONTRIBUTING.md)** See submission process and validation checklist.

---

## By Category

### Core Workflows

- **[`autoplan`](./skills/autoplan/SKILL.md)** - Runs the plan review pipeline before coding begins, then a post-implementation critic gate before surfacing results. *(swe, orchestrate)*
- **[`benchmark`](./skills/benchmark/SKILL.md)** - Local benchmark and regression-check workflow for performance or quality *(qa-agent, swe)*
- **[`brainstorming`](./skills/brainstorming/SKILL.md)** - Design-space exploration before coding. Explores user intent, requirements and design through collaborative dialogue. *(swe, orchestrate)*
- **[`canary`](./skills/canary/SKILL.md)** - Privacy-safe canary planning for post-deploy monitoring, rollback signals, *(qa-agent, cloud)*
- **[`careful`](./skills/careful/SKILL.md)** - Destructive command guardrails. Warns before rm -rf, DROP TABLE, force-push, *(migration, cloud)*
- **[`change-router`](./skills/change-router/SKILL.md)** - Routes changed files to the appropriate agent roles using agents/routing.json. *(orchestrate)*
- **[`chrome-devtools`](./skills/chrome-devtools/SKILL.md)** - Chrome DevTools MCP integration for browser automation, debugging, performance analysis, *(qa-agent, design-agent)*
- **[`claude`](./skills/claude/SKILL.md)** - Claude Code host adapter. Covers enterprise-safe tool use, knowledge graph
- **[`codebase-engine`](./skills/codebase-engine/SKILL.md)** - Enterprise-safe AST knowledge graph for local codebases. Indexes source *(swe, migration)*
- **[`codex`](./skills/codex/SKILL.md)** - OpenAI Codex host adapter. Covers how to use this agent pack inside a
- **[`commit`](./skills/commit/SKILL.md)** - Atomic commit discipline for any code change. Enforces Conventional Commits *(swe, migration)*
- **[`context-restore`](./skills/context-restore/SKILL.md)** - Restores previously saved local working context without relying on external services. *(swe, orchestrate)*
- **[`context-save`](./skills/context-save/SKILL.md)** - Captures local working context so a future agent session can resume safely. *(swe, orchestrate)*
- **[`copilot`](./skills/copilot/SKILL.md)** - GitHub Copilot host adapter. Covers how to install this agent pack into a
- **[`design-html`](./skills/design-html/SKILL.md)** - Turns approved UI design direction into implementation-ready HTML guidance. *(design-agent, swe)*
- **[`design-review`](./skills/design-review/SKILL.md)** - Reviews product UI and interaction quality for practical design issues. *(design-agent, swe)*
- **[`diagram`](./skills/diagram/SKILL.md)** - Creates text-first architecture and workflow diagrams from local project context. *(spec-agent, design-agent)*
- **[`diagram-export`](./skills/diagram-export/SKILL.md)** - Export Draw.io diagrams to PNG, SVG, PDF with styling options. *(design-agent, diagram-agent)*
- **[`diagram-generate`](./skills/diagram-generate/SKILL.md)** - Generate Draw.io diagrams from text descriptions. *(design-agent, diagram-agent)*
- **[`diagram-search`](./skills/diagram-search/SKILL.md)** - Search Draw.io shape library for icons, shapes, and templates. *(design-agent, diagram-agent)*
- **[`diagram-style`](./skills/diagram-style/SKILL.md)** - Apply consistent styling to diagrams. Colors, fonts, themes. *(design-agent, diagram-agent)*
- **[`diagram-validate`](./skills/diagram-validate/SKILL.md)** - Validate diagram completeness and design patterns. *(diagram-agent, qa-agent)*
- **[`document-generate`](./skills/document-generate/SKILL.md)** - Generates missing local project documentation from code-backed evidence. *(spec-agent, pm)*
- **[`document-release`](./skills/document-release/SKILL.md)** - Updates documentation after shipped behavior changes. *(pm, swe)*
- **[`documentation`](./skills/documentation/SKILL.md)** - Documentation workflow for generating, updating, and reviewing project docs after implementation. *(qa-agent, pm)*
- **[`doubt-driven-development`](./skills/doubt-driven-development/SKILL.md)** - Challenge assumptions before and during implementation. Surface load-bearing doubts *(swe, qa-agent)*
- **[`guard`](./skills/guard/SKILL.md)** - Applies stricter local safety posture for risky tools and filesystem boundaries. *(swe, migration)*
- **[`health`](./skills/health/SKILL.md)** - Enterprise-safe code health dashboard. Detects and runs approved local quality checks *(swe, qa-agent)*
- **[`investigate`](./skills/investigate/SKILL.md)** - Root-cause investigation workflow for bugs, failing tests, broken integrations, and unexpected behavior. *(swe, qa-agent)*
- **[`learn`](./skills/learn/SKILL.md)** - Knowledge capture workflow. Extracts Q&A flashcards from agent session context. *(swe, qa-agent)*
- **[`learnings`](./skills/learnings/SKILL.md)** - Local project learning workflow. Captures reusable project conventions, pitfalls, decisions, *(swe, orchestrate)*
- **[`migration-dotnet-sqlserver-modernization`](./skills/migration-dotnet-sqlserver-modernization/SKILL.md)** - Plan .NET Framework and SQL Server modernization using compatibility *(migration)*
- **[`migration-review`](./skills/migration-review/SKILL.md)** - Review modernization and migration plans for sequencing, rollback, *(migration, swe)*
- **[`migration-sqlserver-assess`](./skills/migration-sqlserver-assess/SKILL.md)** - Assess SQL Server database for Postgres migration readiness. *(migration-engineer, swe)*
- **[`migration-sqlserver-data`](./skills/migration-sqlserver-data/SKILL.md)** - Execute data migration from SQL Server to Postgres. *(migration-engineer, swe)*
- **[`migration-sqlserver-perf`](./skills/migration-sqlserver-perf/SKILL.md)** - Performance tune PostgreSQL after migration. *(migration-engineer, swe)*
- **[`migration-sqlserver-schema`](./skills/migration-sqlserver-schema/SKILL.md)** - Convert SQL Server T-SQL DDL to PostgreSQL schema. *(migration-engineer, swe)*
- **[`migration-sqlserver-test`](./skills/migration-sqlserver-test/SKILL.md)** - Validate migrated data matches source. *(migration-engineer, qa-agent)*
- **[`observability-and-instrumentation`](./skills/observability-and-instrumentation/SKILL.md)** - Add structured observability to code and agent outputs: tracing, structured logging, *(swe, cloud)*
- **[`plan-design-review`](./skills/plan-design-review/SKILL.md)** - Reviews plans for user experience, UI quality, and product interaction risk. *(design-agent, spec-agent)*
- **[`plan-devex-review`](./skills/plan-devex-review/SKILL.md)** - Reviews plans for developer experience, APIs, onboarding, and operability. *(qa-agent, swe)*
- **[`plan-director-review`](./skills/plan-director-review/SKILL.md)** - Director or senior-principal plan review. Reviews scope, sequencing, architecture risk, *(orchestrate, pm)*
- **[`plan-eng-review`](./skills/plan-eng-review/SKILL.md)** - Reviews plans for architecture, data flow, reliability, and testability. *(swe, migration)*
- **[`plan-pm-review`](./skills/plan-pm-review/SKILL.md)** - Product manager plan review. Reviews user value, requirements clarity, acceptance *(pm, spec-agent)*
- **[`plan-review`](./skills/plan-review/SKILL.md)** - Enterprise-safe plan review workflow. Reviews a proposed implementation plan for scope, *(swe, qa-agent)*
- **[`pre-commit-review`](./skills/pre-commit-review/SKILL.md)** - Executable skill that runs pre-commit hooks on code to catch style issues *(swe, qa-agent)*
- **[`qa`](./skills/qa/SKILL.md)** - Enterprise-safe QA workflow. Plans and verifies user-facing or service behavior using *(qa-agent, swe)*
- **[`qa-verify`](./skills/qa-verify/SKILL.md)** - Proof-of-done verification gate for AI coding agents. Scans changed files *(qa-agent, swe)*
- **[`receiving-code-review`](./skills/receiving-code-review/SKILL.md)** - Handle code review feedback with technical rigor. Verify before implementing. *(swe, qa-agent)*
- **[`reference-agent-pack-patterns`](./skills/reference-agent-pack-patterns/SKILL.md)** - Quick reference for the agent-pack repo conventions. Covers *(swe, orchestrate)*
- **[`release`](./skills/release/SKILL.md)** - Policy-gated release preparation workflow. Checks readiness, tests, docs, risk, and rollback *(pm, cloud)*
- **[`release-notes`](./skills/release-notes/SKILL.md)** - Generate privacy-safe release notes from local changes, tests, and docs *(pm, swe)*
- **[`retro`](./skills/retro/SKILL.md)** - Produces a local project retrospective from commits, incidents, decisions, and outcomes. *(pm, orchestrate)*
- **[`review`](./skills/review/SKILL.md)** - Enterprise-safe code review workflow. Reviews diffs and code paths for correctness, *(swe, qa-agent)*
- **[`security-review`](./skills/security-review/SKILL.md)** - Enterprise security and governance review for application code, data access, agent *(swe, qa-agent)*
- **[`seniorswe-concise`](./skills/seniorswe-concise/SKILL.md)** - Senior SWE concise mode: forces the laziest solution that actually works. *(swe, data)*
- **[`seniorswe-concise-audit`](./skills/seniorswe-concise-audit/SKILL.md)** - Whole-repo audit for over-engineering. Like /seniorswe-concise-review but *(swe)*
- **[`seniorswe-concise-debt`](./skills/seniorswe-concise-debt/SKILL.md)** - Harvest every `seniorswe-concise:` comment in the codebase into a debt ledger *(swe)*
- **[`seniorswe-concise-gain`](./skills/seniorswe-concise-gain/SKILL.md)** - Show measured impact of concise/lazy-mode coding as a compact scoreboard: *(swe)*
- **[`seniorswe-concise-help`](./skills/seniorswe-concise-help/SKILL.md)** - Quick-reference card for Senior SWE Concise mode: all levels, skills, and *(swe)*
- **[`seniorswe-concise-review`](./skills/seniorswe-concise-review/SKILL.md)** - Code review focused exclusively on over-engineering. Finds what to delete: *(swe, orchestrate)*
- **[`ship`](./skills/ship/SKILL.md)** - Prepares a human-approved PR, merge, or release handoff. Runs parallel specialist *(swe, cloud)*
- **[`skillify`](./skills/skillify/SKILL.md)** - Turns a repeated local workflow into a reusable skill folder with template files. *(swe, orchestrate)*
- **[`spec`](./skills/spec/SKILL.md)** - Converts product or engineering intent into a scoped, reviewable specification with *(spec-agent, pm)*
- **[`subagent-orchestrator`](./skills/subagent-orchestrator/SKILL.md)** - Plans and materializes local-only subagent manifests for scoped parallel work. *(orchestrate)*
- **[`systematic-debugging`](./skills/systematic-debugging/SKILL.md)** - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts. *(swe, qa-agent)*
- **[`test`](./skills/test/SKILL.md)** - Designs and runs approved automated tests, including Playwright or Selenium when enabled by policy. *(swe, qa-agent)*
- **[`token-optimizer`](./skills/token-optimizer/SKILL.md)** - Token reduction for Python objects, API responses, logs, diffs, and code *(swe, qa-agent)*
- **[`using-agent-skills`](./skills/using-agent-skills/SKILL.md)** - Use when starting any conversation - establishes how to find and use agent-pack skills, *(swe, orchestrate)*
- **[`verification-before-completion`](./skills/verification-before-completion/SKILL.md)** - Ship-readiness verification workflow. Run verification commands and confirm output *(swe, qa-agent)*
- **[`writing-skills`](./skills/writing-skills/SKILL.md)** - Skill creation and editing using test-driven development. Write test cases first, *(orchestrate)*

---

## By Agent

### `/swe`

47 skills

- [`autoplan`](./skills/autoplan/SKILL.md) - Runs the plan review pipeline before coding begins, then a post-implementation critic gate before surfacing results.
- [`benchmark`](./skills/benchmark/SKILL.md) - Local benchmark and regression-check workflow for performance or quality
- [`brainstorming`](./skills/brainstorming/SKILL.md) - Design-space exploration before coding. Explores user intent, requirements and design through collaborative dialogue.
- [`chrome-devtools`](./skills/chrome-devtools/SKILL.md) - Chrome DevTools MCP integration for browser automation, debugging, performance analysis,
- [`codebase-engine`](./skills/codebase-engine/SKILL.md) - Enterprise-safe AST knowledge graph for local codebases. Indexes source
- [`commit`](./skills/commit/SKILL.md) - Atomic commit discipline for any code change. Enforces Conventional Commits
- [`context-restore`](./skills/context-restore/SKILL.md) - Restores previously saved local working context without relying on external services.
- [`context-save`](./skills/context-save/SKILL.md) - Captures local working context so a future agent session can resume safely.
- [`design-html`](./skills/design-html/SKILL.md) - Turns approved UI design direction into implementation-ready HTML guidance.
- [`design-review`](./skills/design-review/SKILL.md) - Reviews product UI and interaction quality for practical design issues.
- [`document-release`](./skills/document-release/SKILL.md) - Updates documentation after shipped behavior changes.
- [`doubt-driven-development`](./skills/doubt-driven-development/SKILL.md) - Challenge assumptions before and during implementation. Surface load-bearing doubts
- [`guard`](./skills/guard/SKILL.md) - Applies stricter local safety posture for risky tools and filesystem boundaries.
- [`health`](./skills/health/SKILL.md) - Enterprise-safe code health dashboard. Detects and runs approved local quality checks
- [`investigate`](./skills/investigate/SKILL.md) - Root-cause investigation workflow for bugs, failing tests, broken integrations, and unexpected behavior.
- [`learn`](./skills/learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`learnings`](./skills/learnings/SKILL.md) - Local project learning workflow. Captures reusable project conventions, pitfalls, decisions,
- [`migration-review`](./skills/migration-review/SKILL.md) - Review modernization and migration plans for sequencing, rollback,
- [`migration-sqlserver-assess`](./skills/migration-sqlserver-assess/SKILL.md) - Assess SQL Server database for Postgres migration readiness.
- [`migration-sqlserver-data`](./skills/migration-sqlserver-data/SKILL.md) - Execute data migration from SQL Server to Postgres.
- [`migration-sqlserver-perf`](./skills/migration-sqlserver-perf/SKILL.md) - Performance tune PostgreSQL after migration.
- [`migration-sqlserver-schema`](./skills/migration-sqlserver-schema/SKILL.md) - Convert SQL Server T-SQL DDL to PostgreSQL schema.
- [`observability-and-instrumentation`](./skills/observability-and-instrumentation/SKILL.md) - Add structured observability to code and agent outputs: tracing, structured logging,
- [`plan-devex-review`](./skills/plan-devex-review/SKILL.md) - Reviews plans for developer experience, APIs, onboarding, and operability.
- [`plan-eng-review`](./skills/plan-eng-review/SKILL.md) - Reviews plans for architecture, data flow, reliability, and testability.
- [`plan-review`](./skills/plan-review/SKILL.md) - Enterprise-safe plan review workflow. Reviews a proposed implementation plan for scope,
- [`pre-commit-review`](./skills/pre-commit-review/SKILL.md) - Executable skill that runs pre-commit hooks on code to catch style issues
- [`qa`](./skills/qa/SKILL.md) - Enterprise-safe QA workflow. Plans and verifies user-facing or service behavior using
- [`qa-verify`](./skills/qa-verify/SKILL.md) - Proof-of-done verification gate for AI coding agents. Scans changed files
- [`receiving-code-review`](./skills/receiving-code-review/SKILL.md) - Handle code review feedback with technical rigor. Verify before implementing.
- [`reference-agent-pack-patterns`](./skills/reference-agent-pack-patterns/SKILL.md) - Quick reference for the agent-pack repo conventions. Covers
- [`release-notes`](./skills/release-notes/SKILL.md) - Generate privacy-safe release notes from local changes, tests, and docs
- [`review`](./skills/review/SKILL.md) - Enterprise-safe code review workflow. Reviews diffs and code paths for correctness,
- [`security-review`](./skills/security-review/SKILL.md) - Enterprise security and governance review for application code, data access, agent
- [`seniorswe-concise`](./skills/seniorswe-concise/SKILL.md) - Senior SWE concise mode: forces the laziest solution that actually works.
- [`seniorswe-concise-audit`](./skills/seniorswe-concise-audit/SKILL.md) - Whole-repo audit for over-engineering. Like /seniorswe-concise-review but
- [`seniorswe-concise-debt`](./skills/seniorswe-concise-debt/SKILL.md) - Harvest every `seniorswe-concise:` comment in the codebase into a debt ledger
- [`seniorswe-concise-gain`](./skills/seniorswe-concise-gain/SKILL.md) - Show measured impact of concise/lazy-mode coding as a compact scoreboard:
- [`seniorswe-concise-help`](./skills/seniorswe-concise-help/SKILL.md) - Quick-reference card for Senior SWE Concise mode: all levels, skills, and
- [`seniorswe-concise-review`](./skills/seniorswe-concise-review/SKILL.md) - Code review focused exclusively on over-engineering. Finds what to delete:
- [`ship`](./skills/ship/SKILL.md) - Prepares a human-approved PR, merge, or release handoff. Runs parallel specialist
- [`skillify`](./skills/skillify/SKILL.md) - Turns a repeated local workflow into a reusable skill folder with template files.
- [`systematic-debugging`](./skills/systematic-debugging/SKILL.md) - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts.
- [`test`](./skills/test/SKILL.md) - Designs and runs approved automated tests, including Playwright or Selenium when enabled by policy.
- [`token-optimizer`](./skills/token-optimizer/SKILL.md) - Token reduction for Python objects, API responses, logs, diffs, and code
- [`using-agent-skills`](./skills/using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-pack skills,
- [`verification-before-completion`](./skills/verification-before-completion/SKILL.md) - Ship-readiness verification workflow. Run verification commands and confirm output

### `/qa-agent`

27 skills

- [`benchmark`](./skills/benchmark/SKILL.md) - Local benchmark and regression-check workflow for performance or quality
- [`canary`](./skills/canary/SKILL.md) - Privacy-safe canary planning for post-deploy monitoring, rollback signals,
- [`chrome-devtools`](./skills/chrome-devtools/SKILL.md) - Chrome DevTools MCP integration for browser automation, debugging, performance analysis,
- [`codebase-engine`](./skills/codebase-engine/SKILL.md) - Enterprise-safe AST knowledge graph for local codebases. Indexes source
- [`design-review`](./skills/design-review/SKILL.md) - Reviews product UI and interaction quality for practical design issues.
- [`diagram-validate`](./skills/diagram-validate/SKILL.md) - Validate diagram completeness and design patterns.
- [`documentation`](./skills/documentation/SKILL.md) - Documentation workflow for generating, updating, and reviewing project docs after implementation.
- [`doubt-driven-development`](./skills/doubt-driven-development/SKILL.md) - Challenge assumptions before and during implementation. Surface load-bearing doubts
- [`health`](./skills/health/SKILL.md) - Enterprise-safe code health dashboard. Detects and runs approved local quality checks
- [`investigate`](./skills/investigate/SKILL.md) - Root-cause investigation workflow for bugs, failing tests, broken integrations, and unexpected behavior.
- [`learn`](./skills/learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`migration-sqlserver-test`](./skills/migration-sqlserver-test/SKILL.md) - Validate migrated data matches source.
- [`observability-and-instrumentation`](./skills/observability-and-instrumentation/SKILL.md) - Add structured observability to code and agent outputs: tracing, structured logging,
- [`plan-devex-review`](./skills/plan-devex-review/SKILL.md) - Reviews plans for developer experience, APIs, onboarding, and operability.
- [`plan-review`](./skills/plan-review/SKILL.md) - Enterprise-safe plan review workflow. Reviews a proposed implementation plan for scope,
- [`pre-commit-review`](./skills/pre-commit-review/SKILL.md) - Executable skill that runs pre-commit hooks on code to catch style issues
- [`qa`](./skills/qa/SKILL.md) - Enterprise-safe QA workflow. Plans and verifies user-facing or service behavior using
- [`qa-verify`](./skills/qa-verify/SKILL.md) - Proof-of-done verification gate for AI coding agents. Scans changed files
- [`receiving-code-review`](./skills/receiving-code-review/SKILL.md) - Handle code review feedback with technical rigor. Verify before implementing.
- [`reference-agent-pack-patterns`](./skills/reference-agent-pack-patterns/SKILL.md) - Quick reference for the agent-pack repo conventions. Covers
- [`review`](./skills/review/SKILL.md) - Enterprise-safe code review workflow. Reviews diffs and code paths for correctness,
- [`security-review`](./skills/security-review/SKILL.md) - Enterprise security and governance review for application code, data access, agent
- [`systematic-debugging`](./skills/systematic-debugging/SKILL.md) - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts.
- [`test`](./skills/test/SKILL.md) - Designs and runs approved automated tests, including Playwright or Selenium when enabled by policy.
- [`token-optimizer`](./skills/token-optimizer/SKILL.md) - Token reduction for Python objects, API responses, logs, diffs, and code
- [`using-agent-skills`](./skills/using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-pack skills,
- [`verification-before-completion`](./skills/verification-before-completion/SKILL.md) - Ship-readiness verification workflow. Run verification commands and confirm output

### `/spec-agent`

19 skills

- [`autoplan`](./skills/autoplan/SKILL.md) - Runs the plan review pipeline before coding begins, then a post-implementation critic gate before surfacing results.
- [`brainstorming`](./skills/brainstorming/SKILL.md) - Design-space exploration before coding. Explores user intent, requirements and design through collaborative dialogue.
- [`codebase-engine`](./skills/codebase-engine/SKILL.md) - Enterprise-safe AST knowledge graph for local codebases. Indexes source
- [`diagram`](./skills/diagram/SKILL.md) - Creates text-first architecture and workflow diagrams from local project context.
- [`diagram-export`](./skills/diagram-export/SKILL.md) - Export Draw.io diagrams to PNG, SVG, PDF with styling options.
- [`diagram-generate`](./skills/diagram-generate/SKILL.md) - Generate Draw.io diagrams from text descriptions.
- [`diagram-search`](./skills/diagram-search/SKILL.md) - Search Draw.io shape library for icons, shapes, and templates.
- [`diagram-validate`](./skills/diagram-validate/SKILL.md) - Validate diagram completeness and design patterns.
- [`document-generate`](./skills/document-generate/SKILL.md) - Generates missing local project documentation from code-backed evidence.
- [`document-release`](./skills/document-release/SKILL.md) - Updates documentation after shipped behavior changes.
- [`documentation`](./skills/documentation/SKILL.md) - Documentation workflow for generating, updating, and reviewing project docs after implementation.
- [`doubt-driven-development`](./skills/doubt-driven-development/SKILL.md) - Challenge assumptions before and during implementation. Surface load-bearing doubts
- [`learn`](./skills/learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`plan-design-review`](./skills/plan-design-review/SKILL.md) - Reviews plans for user experience, UI quality, and product interaction risk.
- [`plan-devex-review`](./skills/plan-devex-review/SKILL.md) - Reviews plans for developer experience, APIs, onboarding, and operability.
- [`plan-pm-review`](./skills/plan-pm-review/SKILL.md) - Product manager plan review. Reviews user value, requirements clarity, acceptance
- [`plan-review`](./skills/plan-review/SKILL.md) - Enterprise-safe plan review workflow. Reviews a proposed implementation plan for scope,
- [`spec`](./skills/spec/SKILL.md) - Converts product or engineering intent into a scoped, reviewable specification with
- [`using-agent-skills`](./skills/using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-pack skills,

### `/pm`

14 skills

- [`diagram-export`](./skills/diagram-export/SKILL.md) - Export Draw.io diagrams to PNG, SVG, PDF with styling options.
- [`document-generate`](./skills/document-generate/SKILL.md) - Generates missing local project documentation from code-backed evidence.
- [`document-release`](./skills/document-release/SKILL.md) - Updates documentation after shipped behavior changes.
- [`documentation`](./skills/documentation/SKILL.md) - Documentation workflow for generating, updating, and reviewing project docs after implementation.
- [`learn`](./skills/learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`learnings`](./skills/learnings/SKILL.md) - Local project learning workflow. Captures reusable project conventions, pitfalls, decisions,
- [`plan-design-review`](./skills/plan-design-review/SKILL.md) - Reviews plans for user experience, UI quality, and product interaction risk.
- [`plan-director-review`](./skills/plan-director-review/SKILL.md) - Director or senior-principal plan review. Reviews scope, sequencing, architecture risk,
- [`plan-pm-review`](./skills/plan-pm-review/SKILL.md) - Product manager plan review. Reviews user value, requirements clarity, acceptance
- [`release`](./skills/release/SKILL.md) - Policy-gated release preparation workflow. Checks readiness, tests, docs, risk, and rollback
- [`release-notes`](./skills/release-notes/SKILL.md) - Generate privacy-safe release notes from local changes, tests, and docs
- [`retro`](./skills/retro/SKILL.md) - Produces a local project retrospective from commits, incidents, decisions, and outcomes.
- [`spec`](./skills/spec/SKILL.md) - Converts product or engineering intent into a scoped, reviewable specification with
- [`using-agent-skills`](./skills/using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-pack skills,

### `/design-agent`

14 skills

- [`brainstorming`](./skills/brainstorming/SKILL.md) - Design-space exploration before coding. Explores user intent, requirements and design through collaborative dialogue.
- [`chrome-devtools`](./skills/chrome-devtools/SKILL.md) - Chrome DevTools MCP integration for browser automation, debugging, performance analysis,
- [`codebase-engine`](./skills/codebase-engine/SKILL.md) - Enterprise-safe AST knowledge graph for local codebases. Indexes source
- [`design-html`](./skills/design-html/SKILL.md) - Turns approved UI design direction into implementation-ready HTML guidance.
- [`design-review`](./skills/design-review/SKILL.md) - Reviews product UI and interaction quality for practical design issues.
- [`diagram`](./skills/diagram/SKILL.md) - Creates text-first architecture and workflow diagrams from local project context.
- [`diagram-export`](./skills/diagram-export/SKILL.md) - Export Draw.io diagrams to PNG, SVG, PDF with styling options.
- [`diagram-generate`](./skills/diagram-generate/SKILL.md) - Generate Draw.io diagrams from text descriptions.
- [`diagram-search`](./skills/diagram-search/SKILL.md) - Search Draw.io shape library for icons, shapes, and templates.
- [`diagram-style`](./skills/diagram-style/SKILL.md) - Apply consistent styling to diagrams. Colors, fonts, themes.
- [`diagram-validate`](./skills/diagram-validate/SKILL.md) - Validate diagram completeness and design patterns.
- [`learn`](./skills/learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`plan-design-review`](./skills/plan-design-review/SKILL.md) - Reviews plans for user experience, UI quality, and product interaction risk.
- [`using-agent-skills`](./skills/using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-pack skills,

### `/diagram-agent`

5 skills

- [`diagram-export`](./skills/diagram-export/SKILL.md) - Export Draw.io diagrams to PNG, SVG, PDF with styling options.
- [`diagram-generate`](./skills/diagram-generate/SKILL.md) - Generate Draw.io diagrams from text descriptions.
- [`diagram-search`](./skills/diagram-search/SKILL.md) - Search Draw.io shape library for icons, shapes, and templates.
- [`diagram-style`](./skills/diagram-style/SKILL.md) - Apply consistent styling to diagrams. Colors, fonts, themes.
- [`diagram-validate`](./skills/diagram-validate/SKILL.md) - Validate diagram completeness and design patterns.

### `/orchestrate`

22 skills

- [`autoplan`](./skills/autoplan/SKILL.md) - Runs the plan review pipeline before coding begins, then a post-implementation critic gate before surfacing results.
- [`brainstorming`](./skills/brainstorming/SKILL.md) - Design-space exploration before coding. Explores user intent, requirements and design through collaborative dialogue.
- [`change-router`](./skills/change-router/SKILL.md) - Routes changed files to the appropriate agent roles using agents/routing.json.
- [`codebase-engine`](./skills/codebase-engine/SKILL.md) - Enterprise-safe AST knowledge graph for local codebases. Indexes source
- [`context-restore`](./skills/context-restore/SKILL.md) - Restores previously saved local working context without relying on external services.
- [`context-save`](./skills/context-save/SKILL.md) - Captures local working context so a future agent session can resume safely.
- [`diagram`](./skills/diagram/SKILL.md) - Creates text-first architecture and workflow diagrams from local project context.
- [`diagram-generate`](./skills/diagram-generate/SKILL.md) - Generate Draw.io diagrams from text descriptions.
- [`diagram-search`](./skills/diagram-search/SKILL.md) - Search Draw.io shape library for icons, shapes, and templates.
- [`learn`](./skills/learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`learnings`](./skills/learnings/SKILL.md) - Local project learning workflow. Captures reusable project conventions, pitfalls, decisions,
- [`plan-director-review`](./skills/plan-director-review/SKILL.md) - Director or senior-principal plan review. Reviews scope, sequencing, architecture risk,
- [`plan-review`](./skills/plan-review/SKILL.md) - Enterprise-safe plan review workflow. Reviews a proposed implementation plan for scope,
- [`pre-commit-review`](./skills/pre-commit-review/SKILL.md) - Executable skill that runs pre-commit hooks on code to catch style issues
- [`reference-agent-pack-patterns`](./skills/reference-agent-pack-patterns/SKILL.md) - Quick reference for the agent-pack repo conventions. Covers
- [`retro`](./skills/retro/SKILL.md) - Produces a local project retrospective from commits, incidents, decisions, and outcomes.
- [`seniorswe-concise-review`](./skills/seniorswe-concise-review/SKILL.md) - Code review focused exclusively on over-engineering. Finds what to delete:
- [`skillify`](./skills/skillify/SKILL.md) - Turns a repeated local workflow into a reusable skill folder with template files.
- [`subagent-orchestrator`](./skills/subagent-orchestrator/SKILL.md) - Plans and materializes local-only subagent manifests for scoped parallel work.
- [`token-optimizer`](./skills/token-optimizer/SKILL.md) - Token reduction for Python objects, API responses, logs, diffs, and code
- [`using-agent-skills`](./skills/using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-pack skills,
- [`writing-skills`](./skills/writing-skills/SKILL.md) - Skill creation and editing using test-driven development. Write test cases first,

### `/security`

12 skills

- [`careful`](./skills/careful/SKILL.md) - Destructive command guardrails. Warns before rm -rf, DROP TABLE, force-push,
- [`codebase-engine`](./skills/codebase-engine/SKILL.md) - Enterprise-safe AST knowledge graph for local codebases. Indexes source
- [`guard`](./skills/guard/SKILL.md) - Applies stricter local safety posture for risky tools and filesystem boundaries.
- [`health`](./skills/health/SKILL.md) - Enterprise-safe code health dashboard. Detects and runs approved local quality checks
- [`investigate`](./skills/investigate/SKILL.md) - Root-cause investigation workflow for bugs, failing tests, broken integrations, and unexpected behavior.
- [`learn`](./skills/learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`qa-verify`](./skills/qa-verify/SKILL.md) - Proof-of-done verification gate for AI coding agents. Scans changed files
- [`receiving-code-review`](./skills/receiving-code-review/SKILL.md) - Handle code review feedback with technical rigor. Verify before implementing.
- [`security-review`](./skills/security-review/SKILL.md) - Enterprise security and governance review for application code, data access, agent
- [`systematic-debugging`](./skills/systematic-debugging/SKILL.md) - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts.
- [`using-agent-skills`](./skills/using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-pack skills,
- [`verification-before-completion`](./skills/verification-before-completion/SKILL.md) - Ship-readiness verification workflow. Run verification commands and confirm output

### `/migration`

12 skills

- [`careful`](./skills/careful/SKILL.md) - Destructive command guardrails. Warns before rm -rf, DROP TABLE, force-push,
- [`codebase-engine`](./skills/codebase-engine/SKILL.md) - Enterprise-safe AST knowledge graph for local codebases. Indexes source
- [`commit`](./skills/commit/SKILL.md) - Atomic commit discipline for any code change. Enforces Conventional Commits
- [`context-restore`](./skills/context-restore/SKILL.md) - Restores previously saved local working context without relying on external services.
- [`context-save`](./skills/context-save/SKILL.md) - Captures local working context so a future agent session can resume safely.
- [`guard`](./skills/guard/SKILL.md) - Applies stricter local safety posture for risky tools and filesystem boundaries.
- [`learn`](./skills/learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`migration-dotnet-sqlserver-modernization`](./skills/migration-dotnet-sqlserver-modernization/SKILL.md) - Plan .NET Framework and SQL Server modernization using compatibility
- [`migration-review`](./skills/migration-review/SKILL.md) - Review modernization and migration plans for sequencing, rollback,
- [`plan-eng-review`](./skills/plan-eng-review/SKILL.md) - Reviews plans for architecture, data flow, reliability, and testability.
- [`systematic-debugging`](./skills/systematic-debugging/SKILL.md) - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts.
- [`using-agent-skills`](./skills/using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-pack skills,

### `/migration-engineer`

5 skills

- [`migration-sqlserver-assess`](./skills/migration-sqlserver-assess/SKILL.md) - Assess SQL Server database for Postgres migration readiness.
- [`migration-sqlserver-data`](./skills/migration-sqlserver-data/SKILL.md) - Execute data migration from SQL Server to Postgres.
- [`migration-sqlserver-perf`](./skills/migration-sqlserver-perf/SKILL.md) - Performance tune PostgreSQL after migration.
- [`migration-sqlserver-schema`](./skills/migration-sqlserver-schema/SKILL.md) - Convert SQL Server T-SQL DDL to PostgreSQL schema.
- [`migration-sqlserver-test`](./skills/migration-sqlserver-test/SKILL.md) - Validate migrated data matches source.

### `/data`

9 skills

- [`benchmark`](./skills/benchmark/SKILL.md) - Local benchmark and regression-check workflow for performance or quality
- [`codebase-engine`](./skills/codebase-engine/SKILL.md) - Enterprise-safe AST knowledge graph for local codebases. Indexes source
- [`commit`](./skills/commit/SKILL.md) - Atomic commit discipline for any code change. Enforces Conventional Commits
- [`learn`](./skills/learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`plan-eng-review`](./skills/plan-eng-review/SKILL.md) - Reviews plans for architecture, data flow, reliability, and testability.
- [`seniorswe-concise`](./skills/seniorswe-concise/SKILL.md) - Senior SWE concise mode: forces the laziest solution that actually works.
- [`systematic-debugging`](./skills/systematic-debugging/SKILL.md) - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts.
- [`token-optimizer`](./skills/token-optimizer/SKILL.md) - Token reduction for Python objects, API responses, logs, diffs, and code
- [`using-agent-skills`](./skills/using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-pack skills,

### `/cloud`

15 skills

- [`canary`](./skills/canary/SKILL.md) - Privacy-safe canary planning for post-deploy monitoring, rollback signals,
- [`careful`](./skills/careful/SKILL.md) - Destructive command guardrails. Warns before rm -rf, DROP TABLE, force-push,
- [`codebase-engine`](./skills/codebase-engine/SKILL.md) - Enterprise-safe AST knowledge graph for local codebases. Indexes source
- [`commit`](./skills/commit/SKILL.md) - Atomic commit discipline for any code change. Enforces Conventional Commits
- [`guard`](./skills/guard/SKILL.md) - Applies stricter local safety posture for risky tools and filesystem boundaries.
- [`health`](./skills/health/SKILL.md) - Enterprise-safe code health dashboard. Detects and runs approved local quality checks
- [`learn`](./skills/learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`migration-review`](./skills/migration-review/SKILL.md) - Review modernization and migration plans for sequencing, rollback,
- [`observability-and-instrumentation`](./skills/observability-and-instrumentation/SKILL.md) - Add structured observability to code and agent outputs: tracing, structured logging,
- [`plan-eng-review`](./skills/plan-eng-review/SKILL.md) - Reviews plans for architecture, data flow, reliability, and testability.
- [`release`](./skills/release/SKILL.md) - Policy-gated release preparation workflow. Checks readiness, tests, docs, risk, and rollback
- [`security-review`](./skills/security-review/SKILL.md) - Enterprise security and governance review for application code, data access, agent
- [`ship`](./skills/ship/SKILL.md) - Prepares a human-approved PR, merge, or release handoff. Runs parallel specialist
- [`systematic-debugging`](./skills/systematic-debugging/SKILL.md) - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts.
- [`using-agent-skills`](./skills/using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-pack skills,

### `/release-agent`

14 skills

- [`canary`](./skills/canary/SKILL.md) - Privacy-safe canary planning for post-deploy monitoring, rollback signals,
- [`careful`](./skills/careful/SKILL.md) - Destructive command guardrails. Warns before rm -rf, DROP TABLE, force-push,
- [`codebase-engine`](./skills/codebase-engine/SKILL.md) - Enterprise-safe AST knowledge graph for local codebases. Indexes source
- [`commit`](./skills/commit/SKILL.md) - Atomic commit discipline for any code change. Enforces Conventional Commits
- [`document-release`](./skills/document-release/SKILL.md) - Updates documentation after shipped behavior changes.
- [`learn`](./skills/learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`pre-commit-review`](./skills/pre-commit-review/SKILL.md) - Executable skill that runs pre-commit hooks on code to catch style issues
- [`qa-verify`](./skills/qa-verify/SKILL.md) - Proof-of-done verification gate for AI coding agents. Scans changed files
- [`release`](./skills/release/SKILL.md) - Policy-gated release preparation workflow. Checks readiness, tests, docs, risk, and rollback
- [`release-notes`](./skills/release-notes/SKILL.md) - Generate privacy-safe release notes from local changes, tests, and docs
- [`retro`](./skills/retro/SKILL.md) - Produces a local project retrospective from commits, incidents, decisions, and outcomes.
- [`ship`](./skills/ship/SKILL.md) - Prepares a human-approved PR, merge, or release handoff. Runs parallel specialist
- [`using-agent-skills`](./skills/using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-pack skills,
- [`verification-before-completion`](./skills/verification-before-completion/SKILL.md) - Ship-readiness verification workflow. Run verification commands and confirm output

### `/interviewer`

4 skills

- [`codebase-engine`](./skills/codebase-engine/SKILL.md) - Enterprise-safe AST knowledge graph for local codebases. Indexes source
- [`diagram`](./skills/diagram/SKILL.md) - Creates text-first architecture and workflow diagrams from local project context.
- [`learn`](./skills/learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`using-agent-skills`](./skills/using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-pack skills,

---

## Statistics

| Category | Count |
|----------|-------|
| Core Workflows | 71 |
| **Total** | **71** |

See [METADATA-SCHEMA.md](./METADATA-SCHEMA.md) for skill development and metadata reference.
