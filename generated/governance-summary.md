# Governance Inventory

Generated from `governance.config.json`.

## Counts

- adapter: 12
- agent: 31
- mcp: 1
- plugin: 15
- skill: 247
- stack: 146
- total: 452

## Components

### adapter

- `adapter-ag-ui` :: `agent-architecture/packages/adapters/adapter-ag-ui/SKILL.md` - Map skill progress, approvals, tool actions, findings, and artifacts into
AG-UI-compatible event concepts.

- `adapter-agentcore` :: `agent-architecture/packages/adapters/adapter-agentcore/SKILL.md` - Optional AgentCore adapter boundary for skills, tools, approvals, audit
events, and local privacy controls.

- `adapter-databricks` :: `agent-architecture/packages/adapters/adapter-databricks/SKILL.md` - Optional Databricks SDK adapter boundary for workspace, job, and bundle
operations with explicit policy gates.

- `adapter-docker-mcp` :: `agent-architecture/packages/adapters/adapter-docker-mcp/SKILL.md` - Docker MCP Registry and Toolkit adapter. Wires 300+ pre-built containerized
MCP servers (GitHub, Postgres, Playwright, Slack, Stripe, Docker ops, etc.)
through the Docker MCP Gateway — one stdio multiplexer replaces N individual
server configs. Use when deploying via Docker or consuming tools from the
official docker/mcp-registry catalog.

- `adapter-github` :: `agent-architecture/packages/adapters/adapter-github/SKILL.md` - Optional GitHub MCP/CLI adapter guidance for repo, issue, and PR context
with read-only/default-deny safety.

- `adapter-google-adk` :: `agent-architecture/packages/adapters/adapter-google-adk/SKILL.md` - Optional Google ADK host adapter boundary for invoking skills and tools
without making core architecture depend on ADK runtime packages.

- `adapter-langgraph` :: `agent-architecture/packages/adapters/adapter-langgraph/SKILL.md` - Optional LangGraph orchestration boundary for durable app-level agents
without expanding the core runtime dependency surface.

- `adapter-mcp` :: `agent-architecture/packages/adapters/adapter-mcp/SKILL.md` - Design optional Model Context Protocol adapters with default-deny tools,
narrow schemas, and local audit boundaries.

- `adapter-openapi` :: `agent-architecture/packages/adapters/adapter-openapi/SKILL.md` - Use OpenAPI contracts and optional generated clients/servers while keeping
generated code isolated and reviewed.

- `adapter-seniorswe-concise` :: `agent-architecture/packages/adapters/adapter-seniorswe-concise/SKILL.md` - Optional Seniorswe-Concise hook and MCP adapter for YAGNI mode injection across
Claude, Codex, Copilot, and MCP hosts.

- `adapter-strands` :: `agent-architecture/packages/adapters/adapter-strands/SKILL.md` - Optional Strands adapter boundary for composing skills and tools with
privacy-first policy gates and no core runtime dependency.

- `stack` :: `agent-architecture/packages/adapters/stack/SKILL.md` - Tech stack meta-loader. Auto-detects project tech stack from repo signals and
loads the matching stack-* skill. User can override detection explicitly.
Invoke via /stack, or when the user says "load stack", "detect stack",
"set stack to X", or any stack-* skill needs context.

### agent

- `pm` :: `agent-architecture/agents/pm/SKILL.md` - Product manager agent. Handles strategy, prioritization, PRDs, retrospectives,
and release communication. Pulls existing docs as context.
Invoke via /pm, or when the user says "write a PRD", "product spec",
"prioritize", "roadmap", "release notes", "retro", or "stakeholder update".

- `qa-agent` :: `agent-architecture/agents/qa-agent/SKILL.md` - QA engineer agent. Tests, validates, benchmarks, and monitors post-deploy.
Invoke via /qa-agent, or when the user says "test this", "write tests",
"validate", "benchmark", "regression", "canary", "QA", or "acceptance criteria".

- `spec-agent` :: `agent-architecture/agents/spec-agent/SKILL.md` - Spec writer and planner agent. Converts vague intent into precise, reviewable
specs. Pulls existing docs before writing. Multi-angle review built in.
Invoke via /spec-agent, or when the user says "write a spec", "design doc",
"architecture proposal", "define requirements", or "plan this feature".

- `swe` :: `agent-architecture/agents/swe/SKILL.md` - General software engineer agent. Handles implementation, debugging, code
review, and ship. Auto-detects project tech stack and loads the right
stack-* skill. Anti-bloat (seniorswe-concise) is always active.
Invoke via /swe, or when the user says "implement", "build", "fix", "debug",
"write code", "refactor", or starts any coding task.

- `cloud` :: `agent-architecture/packages/skills/agents/cloud/SKILL.md` - Cloud and DevOps engineer agent. Handles AWS infrastructure, DMS migrations,
post-deploy monitoring, release readiness. Destructive-command guardrails always active.
Invoke via /cloud, or when the user says "deploy", "infrastructure", "AWS",
"Terraform", "CDK", "DMS", "canary", "runbook", or "release readiness".

- `data` :: `agent-architecture/packages/skills/agents/data/SKILL.md` - Data and MLOps engineer agent. Handles Databricks jobs, dbt transformations,
ML lifecycle, data governance, and experiment design.
Invoke via /data, or when the user says "Databricks", "dbt", "data pipeline",
"MLOps", "model training", "experiment", "feature store", or "data governance".

- `design-agent` :: `agent-architecture/packages/skills/agents/design-agent/SKILL.md` - UI and design agent. Handles design review, implementation-ready HTML
guidance, plan design review, and design audit.
Invoke via /design-agent, or when the user says "design this", "UI review",
"HTML implementation", "accessibility", or "design audit".

- `diagram-agent` :: `agent-architecture/packages/skills/agents/diagram-agent/SKILL.md` - Diagram generation, editing, export, and visual system management.
Specializes in Draw.io diagrams: architecture, flowchart, ER, sequence, class, state, mind-map.

- `interviewer` :: `agent-architecture/packages/skills/agents/interviewer/SKILL.md` - Technical interviewer agent. Conducts interviews grounded in the actual
codebase and tech stack. Generates questions from real code, evaluates answers.
Invoke via /interviewer, or when the user says "interview", "technical screen",
"coding question", "system design interview", or "evaluate candidate".

- `migration-engineer` :: `agent-architecture/packages/skills/agents/migration-engineer/SKILL.md` - Specialist in SQL Server -> Postgres migrations.
Assesses, plans, migrates, tests, and optimizes large-scale databases.

- `migration` :: `agent-architecture/packages/skills/agents/migration/SKILL.md` - Migration engineer agent. Handles .NET/SQL Server modernization, SQL-to-Postgres
migrations, AWS DMS, and legacy frontend rewrites. Destructive-command guardrails
always active.
Invoke via /migration, or when the user says "migrate", "modernize", "upgrade",
"port to", "SQL Server to Postgres", ".NET migration", or "AWS DMS".

- `orchestrate` :: `agent-architecture/packages/skills/agents/orchestrate/SKILL.md` - Coordinator agent for large features. Decomposes work into parallel subagents
per the subagent-deployment-plan.md roles (Explorer, Planner, Implementer,
Test Engineer, Reviewer, QA Agent, Devtools Agent, Docs Agent, Release Agent).
Invoke via /orchestrate, or when the user says "coordinate", "multi-agent",
"orchestrate", "break this into subagents", or asks to parallelize a large task.

- `release-agent` :: `agent-architecture/packages/skills/agents/release-agent/SKILL.md` - Release engineer agent. Handles release preparation, release notes, retros,
post-deploy monitoring, and rollback. Careful guardrails always active.
Invoke via /release-agent, or when the user says "release", "cut a release",
"release notes", "ship this", "retro", "post-mortem", or "rollback".

- `security` :: `agent-architecture/packages/skills/agents/security/SKILL.md` - Security engineer agent. Handles security reviews, threat modeling, access
control audits, and policy enforcement. Guard and careful always active.
Invoke via /security, or when the user says "security review", "threat model",
"OWASP", "CVE", "pentest", "access control", "secrets", or "compliance".

- `optimizing-dotnet-performance` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-diag/agents/optimizing-dotnet-performance.agent.md` - Analyzes .NET code for performance bottlenecks, recommends concrete optimizations, and guides benchmarking. Scans for ~50 anti-patterns across async, memory, strings, collections, LINQ, regex, serialization, and I/O. Use when reviewing .NET code performance, optimizing hot paths, reducing allocations, or tuning async/concurrency patterns.
- `build-perf` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/agents/build-perf.agent.md` - Agent for diagnosing and optimizing MSBuild build performance. Runs multi-step analysis: generates binlogs, analyzes timeline and bottlenecks, identifies expensive targets/tasks/analyzers, and suggests concrete optimizations. Invoke when builds are slow or when asked to optimize build times.
- `msbuild-code-review` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/agents/msbuild-code-review.agent.md` - Agent that reviews MSBuild project files for anti-patterns, modernization opportunities, and best practices violations. Scans .csproj, .vbproj, .fsproj, .props, .targets files and produces actionable improvement suggestions. Invoke when asked to review, audit, or improve MSBuild project files.
- `msbuild` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/agents/msbuild.agent.md` - Expert agent for MSBuild and .NET build troubleshooting, optimization, and project file quality. Routes to specialized agents for performance analysis and code review. Verifies MSBuild domain relevance before deep-diving. Specializes in build configuration, error diagnosis, binary log analysis, and resolving common build issues.
- `template-engine` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-template-engine/agents/template-engine.agent.md` - Expert agent for .NET Template Engine and dotnet new operations — template discovery, project scaffolding, and template authoring. Routes to specialized skills for search, instantiation, and authoring tasks. Verifies template-engine domain relevance before deep-diving.
- `code-testing-builder` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/agents/code-testing-builder.agent.md` - Runs build/compile commands for any language and reports results.
Use when: compiling code, running dotnet build, checking for compilation errors, verifying project builds successfully.
- `code-testing-fixer` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/agents/code-testing-fixer.agent.md` - Fixes compilation errors in source or test files.
Use when: resolving build errors, fixing CS/TS error codes, adding missing imports, correcting type mismatches, fixing compilation failures.
- `code-testing-generator` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/agents/code-testing-generator.agent.md` - Orchestrates comprehensive test generation using Research-Plan-Implement pipeline. Use when asked to generate tests, write unit tests, improve test coverage, or add tests. DO NOT USE FOR: diagnosing coverage plateaus or project-wide coverage/CRAP analysis without writing tests (use coverage-analysis); targeted method/class CRAP scores (use crap-score).
- `code-testing-implementer` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/agents/code-testing-implementer.agent.md` - Implements a single phase from the test plan. Writes test files and verifies they compile and pass.
Use when: executing a plan phase, writing test files, running build-test-fix cycle for generated tests.
- `code-testing-linter` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/agents/code-testing-linter.agent.md` - Runs code formatting and linting for any language.
Use when: formatting code, running dotnet format, fixing style issues, applying lint fixes.
- `code-testing-planner` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/agents/code-testing-planner.agent.md` - Creates structured test implementation plans from research findings.
Use when: organizing tests into phases, prioritizing test generation, creating .testagent/plan.md from research.
- `code-testing-researcher` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/agents/code-testing-researcher.agent.md` - Analyzes codebases to understand structure, testing patterns, and testability.
Use when: researching project structure, identifying source files to test, discovering test frameworks and build commands, producing .testagent/research.md.
- `code-testing-tester` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/agents/code-testing-tester.agent.md` - Runs test commands for any language and reports pass/fail results.
Use when: running dotnet test, executing tests, verifying tests pass, checking test results and failures.
- `test-migration` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/agents/test-migration.agent.md` - Orchestrates .NET test framework and platform migrations: auto-detects the current framework and version, routes to the appropriate migration skill, and guides users through end-to-end upgrades. Use when asked to upgrade MSTest, migrate to xUnit v3, switch to Microsoft.Testing.Platform, modernize test infrastructure, or when the user says "migrate my tests".
- `test-quality-auditor` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/agents/test-quality-auditor.agent.md` - Runs multi-skill audit pipelines for comprehensive test suite assessment across a workspace or project, combining assertion quality, test smell detection, mock usage analysis, test gap analysis, coverage risk, and test tagging into unified reports. Polyglot: .NET (MSTest/xUnit/NUnit/ TUnit), Python (pytest/unittest), TS/JS (Jest/Vitest/Mocha/node:test), Java (JUnit/TestNG), Go, Ruby (RSpec/Minitest), Rust, Swift, Kotlin (JUnit/Kotest), PowerShell (Pester), C++ (GoogleTest/Catch2). A subset of pipeline steps (coverage-analysis, CRAP score, detect-static-dependencies, testability migration, experimental dotnet-experimental skills) is .NET-only; for non-.NET audits those steps are skipped with an explanation. Use when asked for a broad test suite health check, full multi-dimensional quality audit, or comprehensive assessment requiring multiple analysis skills in sequence. Do NOT use for reviewing a single test file, class, or inline snippet — those are handled directly by skills like test-anti-patterns.
- `testability-migration` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/agents/testability-migration.agent.md` - Orchestrates end-to-end testability migration for .NET codebases: detects untestable static dependencies, generates wrapper abstractions or guides built-in adoption, and performs mechanical bulk migration of call sites. Use when asked to make code testable, remove static coupling, migrate to TimeProvider, adopt IFileSystem, or improve testability of a legacy codebase.
- `governance-agent` :: `agents/governance/SKILL.md` - Governance agent enforces repository standards. Reviews changes against
governance-spec.yaml, validates component manifests, generates health
reports, detects violations, and prevents non-compliant code from merging.
Acts as gatekeeper before PR approval.

### mcp

- `mcp-atlassian` :: `mcp-atlassian`
### plugin

- `dotnet` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet`
- `dotnet-ai` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-ai`
- `dotnet-aspnetcore` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-aspnetcore`
- `dotnet-blazor` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-blazor`
- `dotnet-data` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-data`
- `dotnet-diag` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-diag`
- `dotnet-experimental` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-experimental`
- `dotnet-maui` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-maui`
- `dotnet-msbuild` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild`
- `dotnet-nuget` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-nuget`
- `dotnet-template-engine` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-template-engine`
- `dotnet-test` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test`
- `dotnet-upgrade` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-upgrade`
- `dotnet11` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet11`
- `agent-architecture` :: `agent-architecture/plugins/agent-architecture`
### skill

- `autoplan` :: `agent-architecture/autoplan/SKILL.md` - Runs the plan review pipeline before coding begins, then a post-implementation critic gate before surfacing results.

- `brainstorming` :: `agent-architecture/brainstorming/SKILL.md` - Design-space exploration before coding. Explores user intent, requirements and design through collaborative dialogue.
MUST use before any creative work - creating features, building components, adding functionality, or modifying behavior.

- `canary` :: `agent-architecture/canary/SKILL.md` - Privacy-safe canary planning for post-deploy monitoring, rollback signals,
audit events, and human escalation without public telemetry defaults.

- `careful` :: `agent-architecture/careful/SKILL.md` - Destructive command guardrails. Warns before rm -rf, DROP TABLE, force-push,
git reset --hard, kubectl delete, and similar operations. Use when touching
production, shared environments, or when explicitly asked to use safety mode.

- `change-router` :: `agent-architecture/change-router/SKILL.md` - Routes changed files to the appropriate agent roles using agents/routing.json.
Given a git diff, file list, or PR changeset, outputs a dispatch plan mapping
each changed area to the correct agent (swe, qa-agent, migration, data, cloud,
design-agent, spec-agent, orchestrate). Invoke when coordinating multi-agent
work on a PR or large feature branch.

- `claude` :: `agent-architecture/claude/SKILL.md` - Claude Code host adapter. Covers enterprise-safe tool use, knowledge graph
queries via CodeGraph MCP, and cross-agent review when profile-approved.

- `codex` :: `agent-architecture/codex/SKILL.md` - OpenAI Codex host adapter. Covers how to use this skill pack inside a
Codex-managed repo: AGENTS.md-driven skill invocation, tool availability,
environment variables, and enterprise-safe defaults.

- `commit` :: `agent-architecture/commit/SKILL.md` - Atomic commit discipline for any code change. Enforces Conventional Commits
format, one-behavior-per-commit rule, and safe git operation sequences.
Invoke via /commit, or when the user says "commit this", "make a commit",
"how should I commit", "commit message", or asks about commit conventions,
atomic commits, or git workflow after making changes.

- `context-restore` :: `agent-architecture/context-restore/SKILL.md` - Restores previously saved local working context without relying on external services.

- `context-save` :: `agent-architecture/context-save/SKILL.md` - Captures local working context so a future agent session can resume safely.

- `copilot` :: `agent-architecture/copilot/SKILL.md` - GitHub Copilot host adapter. Covers how to install this skill pack into a
Copilot-enabled repo: copilot-instructions.md injection, hook configuration,
tool availability, environment variables, and enterprise-safe defaults.

- `doubt-driven-development` :: `agent-architecture/doubt-driven-development/SKILL.md` - Challenge assumptions before and during implementation. Surface load-bearing doubts
early so they can be resolved with evidence rather than discovered as bugs.

- `guard` :: `agent-architecture/guard/SKILL.md` - Applies stricter local safety posture for risky tools and filesystem boundaries.

- `health` :: `agent-architecture/health/SKILL.md` - Enterprise-safe code health dashboard. Detects and runs approved local quality checks
such as type checks, lint, tests, dependency checks, dead-code checks, and shell lint.
Produces a read-only scorecard and recommendations.

- `investigate` :: `agent-architecture/investigate/SKILL.md` - Root-cause investigation workflow for bugs, failing tests, broken integrations, and unexpected behavior.
Investigates before proposing fixes and records evidence for each hypothesis.

- `learn` :: `agent-architecture/learn/SKILL.md` - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
Writes to local learn-out/ folder as JSON. Exports Quizlet-compatible CSV via
learn/export.py. Optionally pushes cards to Confluence via atlassian-docs.
Invoke via /learn at end of any session.

- `learnings` :: `agent-architecture/learnings/SKILL.md` - Local project learning workflow. Captures reusable project conventions, pitfalls, decisions,
and review lessons without storing secrets or raw sensitive data.

- `architecture-agent-upgrade` :: `agent-architecture/packages/skills/architecture-agent-upgrade/SKILL.md` - Upgrades an installed architecture-agent skill pack through a policy-approved internal,
mirrored, or manual flow. Public update checks are disabled by default.

- `atlassian-docs` :: `agent-architecture/packages/skills/atlassian-docs/SKILL.md` - Atlassian MCP integration for Jira, Confluence, and Bitbucket. Provides read and write
access to all three services through bundled FastMCP 3 servers. Use for product
documentation lookup, issue management, sprint tracking, wiki authoring, repository
operations, and PR workflows. Do not use for credential setup, OAuth setup, or
public web browsing outside approved Atlassian hosts.

- `benchmark` :: `agent-architecture/packages/skills/benchmark/SKILL.md` - Local benchmark and regression-check workflow for performance or quality
changes with no public telemetry or benchmark uploads by default.

- `chrome-devtools` :: `agent-architecture/packages/skills/chrome-devtools/SKILL.md` - Chrome DevTools MCP integration for browser automation, debugging, performance analysis,
and network inspection. Provides 45 tools via the official chrome-devtools-mcp server.
Use for UI testing, Playwright-style interactions, screenshot capture, console/network
debugging, performance traces, and heap memory analysis. External npm package — not bundled.

- `codebase-engine` :: `agent-architecture/packages/skills/codebase-engine/SKILL.md` - Enterprise-safe AST knowledge graph for local codebases. Indexes source
with tree-sitter, builds a NetworkX graph, clusters by community, and
answers symbol, path, and dependency queries. No external egress.

- `design-html` :: `agent-architecture/packages/skills/design-html/SKILL.md` - Turns approved UI design direction into implementation-ready HTML guidance.

- `design-review` :: `agent-architecture/packages/skills/design-review/SKILL.md` - Reviews product UI and interaction quality for practical design issues.

- `diagram-cloudformation` :: `agent-architecture/packages/skills/diagram-cloudformation/SKILL.md` - AWS CloudFormation template visualization.
Convert CloudFormation templates to architecture diagrams automatically.

- `diagram-export` :: `agent-architecture/packages/skills/diagram-export/SKILL.md` - Export Draw.io diagrams to PNG, SVG, PDF with styling options.

- `diagram-generate` :: `agent-architecture/packages/skills/diagram-generate/SKILL.md` - Generate Draw.io diagrams from text descriptions.
Supports flowchart, architecture, ER, sequence, class, state, mind-map.

- `diagram-helm` :: `agent-architecture/packages/skills/diagram-helm/SKILL.md` - Kubernetes Helm chart visualization.
Generate architecture diagrams from Helm charts automatically.

- `diagram-iac` :: `agent-architecture/packages/skills/diagram-iac/SKILL.md` - AWS architecture diagrams from YAML code (infrastructure-as-code).
Generate architecture diagrams using diagram-as-code YAML format.

- `diagram-infrastructure` :: `agent-architecture/packages/skills/diagram-infrastructure/SKILL.md` - Multi-cloud infrastructure diagrams from Python DSL.
Generate professional infrastructure diagrams for AWS, GCP, Azure, Kubernetes, hybrid, and multi-cloud architectures.

- `diagram-search` :: `agent-architecture/packages/skills/diagram-search/SKILL.md` - Search Draw.io shape library for icons, shapes, and templates.
Supports 10,000+ shapes: AWS, Azure, Cisco, P&ID, flowchart elements, etc.

- `diagram-style` :: `agent-architecture/packages/skills/diagram-style/SKILL.md` - Apply consistent styling to diagrams. Colors, fonts, themes.

- `diagram-validate` :: `agent-architecture/packages/skills/diagram-validate/SKILL.md` - Validate diagram completeness and design patterns.
Checks: all labels present, connections complete, swimlanes correct.

- `diagram` :: `agent-architecture/packages/skills/diagram/SKILL.md` - Creates text-first architecture and workflow diagrams from local project context.

- `document-generate` :: `agent-architecture/packages/skills/document-generate/SKILL.md` - Generates missing local project documentation from code-backed evidence.

- `document-release` :: `agent-architecture/packages/skills/document-release/SKILL.md` - Updates documentation after shipped behavior changes.

- `documentation` :: `agent-architecture/packages/skills/documentation/SKILL.md` - Documentation workflow for generating, updating, and reviewing project docs after implementation.
Focuses on accurate code-backed docs without public browsing or telemetry.

- `migration-dotnet-sqlserver-modernization` :: `agent-architecture/packages/skills/migration-dotnet-sqlserver-modernization/SKILL.md` - Plan .NET Framework and SQL Server modernization using compatibility
assessment, code translation references, and governed data migration lanes.

- `migration-review` :: `agent-architecture/packages/skills/migration-review/SKILL.md` - Review modernization and migration plans for sequencing, rollback,
compatibility, data safety, privacy, and production readiness.

- `migration-sqlserver-assess` :: `agent-architecture/packages/skills/migration-sqlserver-assess/SKILL.md` - Assess SQL Server database for Postgres migration readiness.
Analyzes schema, special features, data volume, and incompatibilities.

- `migration-sqlserver-data` :: `agent-architecture/packages/skills/migration-sqlserver-data/SKILL.md` - Execute data migration from SQL Server to Postgres.
Validates data integrity with checksums and row counts.

- `migration-sqlserver-perf` :: `agent-architecture/packages/skills/migration-sqlserver-perf/SKILL.md` - Performance tune PostgreSQL after migration.
Creates indexes, analyzes queries, establishes baselines.

- `migration-sqlserver-schema` :: `agent-architecture/packages/skills/migration-sqlserver-schema/SKILL.md` - Convert SQL Server T-SQL DDL to PostgreSQL schema.
Handles incompatibilities: CLR → functions, XML → JSONB, spatial types.

- `migration-sqlserver-test` :: `agent-architecture/packages/skills/migration-sqlserver-test/SKILL.md` - Validate migrated data matches source.
Tests correctness, constraints, and triggers.

- `observability-and-instrumentation` :: `agent-architecture/packages/skills/observability-and-instrumentation/SKILL.md` - Add structured observability to code and agent outputs: tracing, structured logging,
metrics, and AG-UI-compatible event emission. Prevents silent failures in production.

- `plan-design-review` :: `agent-architecture/packages/skills/plan-design-review/SKILL.md` - Reviews plans for user experience, UI quality, and product interaction risk.

- `plan-devex-review` :: `agent-architecture/packages/skills/plan-devex-review/SKILL.md` - Reviews plans for developer experience, APIs, onboarding, and operability.

- `plan-director-review` :: `agent-architecture/packages/skills/plan-director-review/SKILL.md` - Director or senior-principal plan review. Reviews scope, sequencing, architecture risk,
team fit, operational maturity, and executive-readiness before implementation.

- `plan-eng-review` :: `agent-architecture/packages/skills/plan-eng-review/SKILL.md` - Reviews plans for architecture, data flow, reliability, and testability.

- `plan-pm-review` :: `agent-architecture/packages/skills/plan-pm-review/SKILL.md` - Product manager plan review. Reviews user value, requirements clarity, acceptance
criteria, rollout, measurement, stakeholder impact, and non-goals.

- `plan-review` :: `agent-architecture/packages/skills/plan-review/SKILL.md` - Enterprise-safe plan review workflow. Reviews a proposed implementation plan for scope,
architecture, testability, policy compliance, data risk, and delivery sequencing before code changes begin.

- `rtk-token-optimizer` :: `agent-architecture/packages/skills/rtk-token-optimizer/SKILL.md` - Optional Rust Token Killer integration guidance. Uses RTK to reduce noisy shell output
when installed and approved by policy. Does not install global hooks or enable telemetry by default.

- `security-review` :: `agent-architecture/packages/skills/security-review/SKILL.md` - Enterprise security and governance review for application code, data access, agent
tools, cloud integrations, and release workflows.

- `security-scanner` :: `agent-architecture/packages/skills/security-scanner/SKILL.md` - MCP server providing Checkov (IaC), Semgrep (source), Bandit (Python), and
ASH (multi-tool) security scanning. Produces SECURITY.md reports. Requires
Docker or local tool install. No external API keys required.

- `seniorswe-concise-audit` :: `agent-architecture/packages/skills/seniorswe-concise-audit/SKILL.md` - Whole-repo audit for over-engineering. Like /seniorswe-concise-review but
scans the entire codebase instead of a diff: a ranked list of what to delete,
simplify, or replace with stdlib/native equivalents. Invoke via
/seniorswe-concise-audit, or "audit this codebase", "audit for
over-engineering", "what can I delete", "find bloat". One-shot report, does
not apply fixes.

- `seniorswe-concise-debt` :: `agent-architecture/packages/skills/seniorswe-concise-debt/SKILL.md` - Harvest every `seniorswe-concise:` comment in the codebase into a debt ledger
so deliberate shortcuts get tracked instead of rotting into "later means never".
Invoke via /seniorswe-concise-debt, or "what shortcuts did we defer", "list
the seniorswe-concise markers", "debt ledger", or "what did we mark to do
later". One-shot report, changes nothing.

- `seniorswe-concise-gain` :: `agent-architecture/packages/skills/seniorswe-concise-gain/SKILL.md` - Show measured impact of concise/lazy-mode coding as a compact scoreboard:
less code, less cost, more speed, from benchmark medians. One-shot display,
not a persistent mode. Invoke via /seniorswe-concise-gain, or "what does
concise mode save", "show impact", "scoreboard".

- `seniorswe-concise-help` :: `agent-architecture/packages/skills/seniorswe-concise-help/SKILL.md` - Quick-reference card for Senior SWE Concise mode: all levels, skills, and
commands in one view. One-shot display, not a persistent mode. Invoke via
/seniorswe-concise-help or "what are the seniorswe-concise commands", "how
do I use seniorswe-concise", "seniorswe-concise help".

- `seniorswe-concise-review` :: `agent-architecture/packages/skills/seniorswe-concise-review/SKILL.md` - Code review focused exclusively on over-engineering. Finds what to delete:
reinvented standard library, unneeded dependencies, speculative abstractions,
dead flexibility. One line per finding: location, what to cut, what replaces
it. Use when the user says "review for over-engineering", "what can we
delete", "is this over-engineered", "simplify review", or invokes
/seniorswe-concise-review. Complements correctness-focused review, this one only
hunts complexity.

- `seniorswe-concise` :: `agent-architecture/packages/skills/seniorswe-concise/SKILL.md` - Senior SWE concise mode: forces the laziest solution that actually works.
Channels a senior dev who has seen everything — question whether the task
needs to exist at all (YAGNI), stdlib before custom code, native platform
features before dependencies, one line before fifty. Levels: lite, full
(default), ultra. Invoke via /seniorswe-concise, or when the user says "be
lazy", "lazy mode", "simplest solution", "minimal solution", "yagni", "do
less", "shortest path", or complains about over-engineering, bloat, or
boilerplate.

- `token-optimizer` :: `agent-architecture/packages/skills/token-optimizer/SKILL.md` - Token reduction for Python objects, API responses, logs, diffs, and code
before LLM injection. Bundles Python Token Killer (ptk) with zero required
dependencies and a bundled fallback. Complements rtk-token-optimizer
(rtk = shell output, token-optimizer = structured data and Python objects).

- `adapter-ag-ui` :: `agent-architecture/plugins/agent-architecture/skills/adapter-ag-ui/SKILL.md` - Map skill progress, approvals, tool actions, findings, and artifacts into
AG-UI-compatible event concepts.

- `adapter-agentcore` :: `agent-architecture/plugins/agent-architecture/skills/adapter-agentcore/SKILL.md` - Optional AgentCore adapter boundary for skills, tools, approvals, audit
events, and local privacy controls.

- `adapter-databricks` :: `agent-architecture/plugins/agent-architecture/skills/adapter-databricks/SKILL.md` - Optional Databricks SDK adapter boundary for workspace, job, and bundle
operations with explicit policy gates.

- `adapter-docker-mcp` :: `agent-architecture/plugins/agent-architecture/skills/adapter-docker-mcp/SKILL.md` - Docker MCP Registry and Toolkit adapter. Wires 300+ pre-built containerized
MCP servers (GitHub, Postgres, Playwright, Slack, Stripe, Docker ops, etc.)
through the Docker MCP Gateway — one stdio multiplexer replaces N individual
server configs. Use when deploying via Docker or consuming tools from the
official docker/mcp-registry catalog.

- `adapter-github` :: `agent-architecture/plugins/agent-architecture/skills/adapter-github/SKILL.md` - Optional GitHub MCP/CLI adapter guidance for repo, issue, and PR context
with read-only/default-deny safety.

- `adapter-google-adk` :: `agent-architecture/plugins/agent-architecture/skills/adapter-google-adk/SKILL.md` - Optional Google ADK host adapter boundary for invoking skills and tools
without making core architecture depend on ADK runtime packages.

- `adapter-langgraph` :: `agent-architecture/plugins/agent-architecture/skills/adapter-langgraph/SKILL.md` - Optional LangGraph orchestration boundary for durable app-level agents
without expanding the core runtime dependency surface.

- `adapter-mcp` :: `agent-architecture/plugins/agent-architecture/skills/adapter-mcp/SKILL.md` - Design optional Model Context Protocol adapters with default-deny tools,
narrow schemas, and local audit boundaries.

- `adapter-openapi` :: `agent-architecture/plugins/agent-architecture/skills/adapter-openapi/SKILL.md` - Use OpenAPI contracts and optional generated clients/servers while keeping
generated code isolated and reviewed.

- `adapter-seniorswe-concise` :: `agent-architecture/plugins/agent-architecture/skills/adapter-seniorswe-concise/SKILL.md` - Optional Seniorswe-Concise hook and MCP adapter for YAGNI mode injection across
Claude, Codex, Copilot, and MCP hosts.

- `adapter-strands` :: `agent-architecture/plugins/agent-architecture/skills/adapter-strands/SKILL.md` - Optional Strands adapter boundary for composing skills and tools with
privacy-first policy gates and no core runtime dependency.

- `architecture-agent-upgrade` :: `agent-architecture/plugins/agent-architecture/skills/architecture-agent-upgrade/SKILL.md` - Upgrades an installed architecture-agent skill pack through a policy-approved internal,
mirrored, or manual flow. Public update checks are disabled by default.

- `atlassian-docs` :: `agent-architecture/plugins/agent-architecture/skills/atlassian-docs/SKILL.md` - Atlassian MCP integration for Jira, Confluence, and Bitbucket. Provides read and write
access to all three services through bundled FastMCP 3 servers. Use for product
documentation lookup, issue management, sprint tracking, wiki authoring, repository
operations, and PR workflows. Do not use for credential setup, OAuth setup, or
public web browsing outside approved Atlassian hosts.

- `autoplan` :: `agent-architecture/plugins/agent-architecture/skills/autoplan/SKILL.md` - Runs the plan review pipeline before coding begins, then a post-implementation critic gate before surfacing results.

- `benchmark` :: `agent-architecture/plugins/agent-architecture/skills/benchmark/SKILL.md` - Local benchmark and regression-check workflow for performance or quality
changes with no public telemetry or benchmark uploads by default.

- `brainstorming` :: `agent-architecture/plugins/agent-architecture/skills/brainstorming/SKILL.md` - Design-space exploration before coding. Explores user intent, requirements and design through collaborative dialogue.
MUST use before any creative work - creating features, building components, adding functionality, or modifying behavior.

- `canary` :: `agent-architecture/plugins/agent-architecture/skills/canary/SKILL.md` - Privacy-safe canary planning for post-deploy monitoring, rollback signals,
audit events, and human escalation without public telemetry defaults.

- `careful` :: `agent-architecture/plugins/agent-architecture/skills/careful/SKILL.md` - Destructive command guardrails. Warns before rm -rf, DROP TABLE, force-push,
git reset --hard, kubectl delete, and similar operations. Use when touching
production, shared environments, or when explicitly asked to use safety mode.

- `change-router` :: `agent-architecture/plugins/agent-architecture/skills/change-router/SKILL.md` - Routes changed files to the appropriate agent roles using agents/routing.json.
Given a git diff, file list, or PR changeset, outputs a dispatch plan mapping
each changed area to the correct agent (swe, qa-agent, migration, data, cloud,
design-agent, spec-agent, orchestrate). Invoke when coordinating multi-agent
work on a PR or large feature branch.

- `chrome-devtools` :: `agent-architecture/plugins/agent-architecture/skills/chrome-devtools/SKILL.md` - Chrome DevTools MCP integration for browser automation, debugging, performance analysis,
and network inspection. Provides 45 tools via the official chrome-devtools-mcp server.
Use for UI testing, Playwright-style interactions, screenshot capture, console/network
debugging, performance traces, and heap memory analysis. External npm package — not bundled.

- `claude` :: `agent-architecture/plugins/agent-architecture/skills/claude/SKILL.md` - Claude Code host adapter. Covers enterprise-safe tool use, knowledge graph
queries via CodeGraph MCP, and cross-agent review when profile-approved.

- `codebase-engine` :: `agent-architecture/plugins/agent-architecture/skills/codebase-engine/SKILL.md` - Enterprise-safe AST knowledge graph for local codebases. Indexes source
with tree-sitter, builds a NetworkX graph, clusters by community, and
answers symbol, path, and dependency queries. No external egress.

- `codex` :: `agent-architecture/plugins/agent-architecture/skills/codex/SKILL.md` - OpenAI Codex host adapter. Covers how to use this skill pack inside a
Codex-managed repo: AGENTS.md-driven skill invocation, tool availability,
environment variables, and enterprise-safe defaults.

- `commit` :: `agent-architecture/plugins/agent-architecture/skills/commit/SKILL.md` - Atomic commit discipline for any code change. Enforces Conventional Commits
format, one-behavior-per-commit rule, and safe git operation sequences.
Invoke via /commit, or when the user says "commit this", "make a commit",
"how should I commit", "commit message", or asks about commit conventions,
atomic commits, or git workflow after making changes.

- `context-restore` :: `agent-architecture/plugins/agent-architecture/skills/context-restore/SKILL.md` - Restores previously saved local working context without relying on external services.

- `context-save` :: `agent-architecture/plugins/agent-architecture/skills/context-save/SKILL.md` - Captures local working context so a future agent session can resume safely.

- `copilot` :: `agent-architecture/plugins/agent-architecture/skills/copilot/SKILL.md` - GitHub Copilot host adapter. Covers how to install this skill pack into a
Copilot-enabled repo: copilot-instructions.md injection, hook configuration,
tool availability, environment variables, and enterprise-safe defaults.

- `design-html` :: `agent-architecture/plugins/agent-architecture/skills/design-html/SKILL.md` - Turns approved UI design direction into implementation-ready HTML guidance.

- `design-review` :: `agent-architecture/plugins/agent-architecture/skills/design-review/SKILL.md` - Reviews product UI and interaction quality for practical design issues.

- `diagram-export` :: `agent-architecture/plugins/agent-architecture/skills/diagram-export/SKILL.md` - Export Draw.io diagrams to PNG, SVG, PDF with styling options.

- `diagram-generate` :: `agent-architecture/plugins/agent-architecture/skills/diagram-generate/SKILL.md` - Generate Draw.io diagrams from text descriptions.
Supports flowchart, architecture, ER, sequence, class, state, mind-map.

- `diagram-search` :: `agent-architecture/plugins/agent-architecture/skills/diagram-search/SKILL.md` - Search Draw.io shape library for icons, shapes, and templates.
Supports 10,000+ shapes: AWS, Azure, Cisco, P&ID, flowchart elements, etc.

- `diagram-style` :: `agent-architecture/plugins/agent-architecture/skills/diagram-style/SKILL.md` - Apply consistent styling to diagrams. Colors, fonts, themes.

- `diagram-validate` :: `agent-architecture/plugins/agent-architecture/skills/diagram-validate/SKILL.md` - Validate diagram completeness and design patterns.
Checks: all labels present, connections complete, swimlanes correct.

- `diagram` :: `agent-architecture/plugins/agent-architecture/skills/diagram/SKILL.md` - Creates text-first architecture and workflow diagrams from local project context.

- `document-generate` :: `agent-architecture/plugins/agent-architecture/skills/document-generate/SKILL.md` - Generates missing local project documentation from code-backed evidence.

- `document-release` :: `agent-architecture/plugins/agent-architecture/skills/document-release/SKILL.md` - Updates documentation after shipped behavior changes.

- `documentation` :: `agent-architecture/plugins/agent-architecture/skills/documentation/SKILL.md` - Documentation workflow for generating, updating, and reviewing project docs after implementation.
Focuses on accurate code-backed docs without public browsing or telemetry.

- `domain-data-governance` :: `agent-architecture/plugins/agent-architecture/skills/domain-data-governance/SKILL.md` - Data governance review for classification, lineage, permissions, retention,
auditability, quality checks, and privacy-safe agent outputs.

- `domain-experiment-design` :: `agent-architecture/plugins/agent-architecture/skills/domain-experiment-design/SKILL.md` - Experiment design review for randomization, power, metrics, guardrails,
exposure, analysis plans, and rollout risk.

- `domain-mlops-databricks` :: `agent-architecture/plugins/agent-architecture/skills/domain-mlops-databricks/SKILL.md` - Databricks MLOps project structure, model lifecycle, CI/CD, monitoring, and
governed production ML workflows.

- `domain-model-interpretation` :: `agent-architecture/plugins/agent-architecture/skills/domain-model-interpretation/SKILL.md` - Model interpretation review for feature effects, calibration, drift,
uncertainty, explanation limits, and decision-risk communication.

- `doubt-driven-development` :: `agent-architecture/plugins/agent-architecture/skills/doubt-driven-development/SKILL.md` - Challenge assumptions before and during implementation. Surface load-bearing doubts
early so they can be resolved with evidence rather than discovered as bugs.

- `guard` :: `agent-architecture/plugins/agent-architecture/skills/guard/SKILL.md` - Applies stricter local safety posture for risky tools and filesystem boundaries.

- `health` :: `agent-architecture/plugins/agent-architecture/skills/health/SKILL.md` - Enterprise-safe code health dashboard. Detects and runs approved local quality checks
such as type checks, lint, tests, dependency checks, dead-code checks, and shell lint.
Produces a read-only scorecard and recommendations.

- `investigate` :: `agent-architecture/plugins/agent-architecture/skills/investigate/SKILL.md` - Root-cause investigation workflow for bugs, failing tests, broken integrations, and unexpected behavior.
Investigates before proposing fixes and records evidence for each hypothesis.

- `learn` :: `agent-architecture/plugins/agent-architecture/skills/learn/SKILL.md` - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
Writes to local learn-out/ folder as JSON. Exports Quizlet-compatible CSV via
learn/export.py. Optionally pushes cards to Confluence via atlassian-docs.
Invoke via /learn at end of any session.

- `learnings` :: `agent-architecture/plugins/agent-architecture/skills/learnings/SKILL.md` - Local project learning workflow. Captures reusable project conventions, pitfalls, decisions,
and review lessons without storing secrets or raw sensitive data.

- `migration-dotnet-sqlserver-modernization` :: `agent-architecture/plugins/agent-architecture/skills/migration-dotnet-sqlserver-modernization/SKILL.md` - Plan .NET Framework and SQL Server modernization using compatibility
assessment, code translation references, and governed data migration lanes.

- `migration-review` :: `agent-architecture/plugins/agent-architecture/skills/migration-review/SKILL.md` - Review modernization and migration plans for sequencing, rollback,
compatibility, data safety, privacy, and production readiness.

- `migration-sqlserver-assess` :: `agent-architecture/plugins/agent-architecture/skills/migration-sqlserver-assess/SKILL.md` - Assess SQL Server database for Postgres migration readiness.
Analyzes schema, special features, data volume, and incompatibilities.

- `migration-sqlserver-data` :: `agent-architecture/plugins/agent-architecture/skills/migration-sqlserver-data/SKILL.md` - Execute data migration from SQL Server to Postgres.
Validates data integrity with checksums and row counts.

- `migration-sqlserver-perf` :: `agent-architecture/plugins/agent-architecture/skills/migration-sqlserver-perf/SKILL.md` - Performance tune PostgreSQL after migration.
Creates indexes, analyzes queries, establishes baselines.

- `migration-sqlserver-schema` :: `agent-architecture/plugins/agent-architecture/skills/migration-sqlserver-schema/SKILL.md` - Convert SQL Server T-SQL DDL to PostgreSQL schema.
Handles incompatibilities: CLR → functions, XML → JSONB, spatial types.

- `migration-sqlserver-test` :: `agent-architecture/plugins/agent-architecture/skills/migration-sqlserver-test/SKILL.md` - Validate migrated data matches source.
Tests correctness, constraints, and triggers.

- `plan-design-review` :: `agent-architecture/plugins/agent-architecture/skills/plan-design-review/SKILL.md` - Reviews plans for user experience, UI quality, and product interaction risk.

- `plan-devex-review` :: `agent-architecture/plugins/agent-architecture/skills/plan-devex-review/SKILL.md` - Reviews plans for developer experience, APIs, onboarding, and operability.

- `plan-director-review` :: `agent-architecture/plugins/agent-architecture/skills/plan-director-review/SKILL.md` - Director or senior-principal plan review. Reviews scope, sequencing, architecture risk,
team fit, operational maturity, and executive-readiness before implementation.

- `plan-eng-review` :: `agent-architecture/plugins/agent-architecture/skills/plan-eng-review/SKILL.md` - Reviews plans for architecture, data flow, reliability, and testability.

- `plan-pm-review` :: `agent-architecture/plugins/agent-architecture/skills/plan-pm-review/SKILL.md` - Product manager plan review. Reviews user value, requirements clarity, acceptance
criteria, rollout, measurement, stakeholder impact, and non-goals.

- `plan-review` :: `agent-architecture/plugins/agent-architecture/skills/plan-review/SKILL.md` - Enterprise-safe plan review workflow. Reviews a proposed implementation plan for scope,
architecture, testability, policy compliance, data risk, and delivery sequencing before code changes begin.

- `pre-commit-review` :: `agent-architecture/plugins/agent-architecture/skills/pre-commit-review/SKILL.md` - Executable skill that runs pre-commit hooks on code to catch style issues
(trailing whitespace, debug statements, invalid syntax) before code review.
Allows reviewers to focus on architecture instead of trivial nitpicks.
Works across Claude, Codex, and Copilot.

- `qa` :: `agent-architecture/plugins/agent-architecture/skills/qa/SKILL.md` - Enterprise-safe QA workflow. Plans and verifies user-facing or service behavior using
local tests and approved tools. Browser automation is optional and disabled by default.

- `receiving-code-review` :: `agent-architecture/plugins/agent-architecture/skills/receiving-code-review/SKILL.md` - Handle code review feedback with technical rigor. Verify before implementing.
Requires evaluation, not performative agreement or blind implementation.

- `reference-gstack-patterns` :: `agent-architecture/plugins/agent-architecture/skills/reference-gstack-patterns/SKILL.md` - Repo-local quick reference for the skill-pack pattern this repo uses.
Read once when adding or refactoring a skill folder.

- `reference-skill-patterns` :: `agent-architecture/plugins/agent-architecture/skills/reference-skill-patterns/SKILL.md` - Repo-local quick reference for the skill-pack pattern this repo uses.
Read once when adding or refactoring a skill folder.

- `release-notes` :: `agent-architecture/plugins/agent-architecture/skills/release-notes/SKILL.md` - Generate privacy-safe release notes from local changes, tests, and docs
without sending change data to third-party services.

- `release` :: `agent-architecture/plugins/agent-architecture/skills/release/SKILL.md` - Policy-gated release preparation workflow. Checks readiness, tests, docs, risk, and rollback
before handoff to human-approved merge or deploy steps.

- `retro` :: `agent-architecture/plugins/agent-architecture/skills/retro/SKILL.md` - Produces a local project retrospective from commits, incidents, decisions, and outcomes.

- `review` :: `agent-architecture/plugins/agent-architecture/skills/review/SKILL.md` - Enterprise-safe code review workflow. Reviews diffs and code paths for correctness,
maintainability, data access, policy violations, test gaps, and release risk.

- `rtk-token-optimizer` :: `agent-architecture/plugins/agent-architecture/skills/rtk-token-optimizer/SKILL.md` - Optional Rust Token Killer integration guidance. Uses RTK to reduce noisy shell output
when installed and approved by policy. Does not install global hooks or enable telemetry by default.

- `security-review` :: `agent-architecture/plugins/agent-architecture/skills/security-review/SKILL.md` - Enterprise security and governance review for application code, data access, agent
tools, cloud integrations, and release workflows.

- `seniorswe-concise-audit` :: `agent-architecture/plugins/agent-architecture/skills/seniorswe-concise-audit/SKILL.md` - Whole-repo audit for over-engineering. Like /seniorswe-concise-review but
scans the entire codebase instead of a diff: a ranked list of what to delete,
simplify, or replace with stdlib/native equivalents. Invoke via
/seniorswe-concise-audit, or "audit this codebase", "audit for
over-engineering", "what can I delete", "find bloat". One-shot report, does
not apply fixes.

- `seniorswe-concise-debt` :: `agent-architecture/plugins/agent-architecture/skills/seniorswe-concise-debt/SKILL.md` - Harvest every `seniorswe-concise:` comment in the codebase into a debt ledger
so deliberate shortcuts get tracked instead of rotting into "later means never".
Invoke via /seniorswe-concise-debt, or "what shortcuts did we defer", "list
the seniorswe-concise markers", "debt ledger", or "what did we mark to do
later". One-shot report, changes nothing.

- `seniorswe-concise-gain` :: `agent-architecture/plugins/agent-architecture/skills/seniorswe-concise-gain/SKILL.md` - Show measured impact of concise/lazy-mode coding as a compact scoreboard:
less code, less cost, more speed, from benchmark medians. One-shot display,
not a persistent mode. Invoke via /seniorswe-concise-gain, or "what does
concise mode save", "show impact", "scoreboard".

- `seniorswe-concise-help` :: `agent-architecture/plugins/agent-architecture/skills/seniorswe-concise-help/SKILL.md` - Quick-reference card for Senior SWE Concise mode: all levels, skills, and
commands in one view. One-shot display, not a persistent mode. Invoke via
/seniorswe-concise-help or "what are the seniorswe-concise commands", "how
do I use seniorswe-concise", "seniorswe-concise help".

- `seniorswe-concise-review` :: `agent-architecture/plugins/agent-architecture/skills/seniorswe-concise-review/SKILL.md` - Code review focused exclusively on over-engineering. Finds what to delete:
reinvented standard library, unneeded dependencies, speculative abstractions,
dead flexibility. One line per finding: location, what to cut, what replaces
it. Use when the user says "review for over-engineering", "what can we
delete", "is this over-engineered", "simplify review", or invokes
/seniorswe-concise-review. Complements correctness-focused review, this one only
hunts complexity.

- `seniorswe-concise` :: `agent-architecture/plugins/agent-architecture/skills/seniorswe-concise/SKILL.md` - Senior SWE concise mode: forces the laziest solution that actually works.
Channels a senior dev who has seen everything — question whether the task
needs to exist at all (YAGNI), stdlib before custom code, native platform
features before dependencies, one line before fifty. Levels: lite, full
(default), ultra. Invoke via /seniorswe-concise, or when the user says "be
lazy", "lazy mode", "simplest solution", "minimal solution", "yagni", "do
less", "shortest path", or complains about over-engineering, bloat, or
boilerplate.

- `ship` :: `agent-architecture/plugins/agent-architecture/skills/ship/SKILL.md` - Prepares a human-approved PR, merge, or release handoff. Runs parallel specialist
review (QA, security, PM, DevEx) before producing the handoff artifact.

- `skillify` :: `agent-architecture/plugins/agent-architecture/skills/skillify/SKILL.md` - Turns a repeated local workflow into a reusable skill folder with template files.

- `spec` :: `agent-architecture/plugins/agent-architecture/skills/spec/SKILL.md` - Converts product or engineering intent into a scoped, reviewable specification with
goals, constraints, interfaces, invariants, tasks, and bug ledger.

- `stack-aws-dms` :: `agent-architecture/plugins/agent-architecture/skills/stack-aws-dms/SKILL.md` - AWS DMS/SCT migration planning patterns for governed database migration
experiments and cutovers.

- `stack-aws` :: `agent-architecture/plugins/agent-architecture/skills/stack-aws/SKILL.md` - AWS application modernization planning with least-privilege, local-first
validation, explicit approvals, and no default cloud mutation.

- `stack-csharp` :: `agent-architecture/plugins/agent-architecture/skills/stack-csharp/SKILL.md` - C# and .NET modernization guidance for projects, packages, services, tests,
analyzers, and compatibility assessments.

- `stack-databricks-dbt` :: `agent-architecture/plugins/agent-architecture/skills/stack-databricks-dbt/SKILL.md` - dbt on Databricks patterns for models, tests, docs, lineage, and governed
transformations.

- `stack-databricks` :: `agent-architecture/plugins/agent-architecture/skills/stack-databricks/SKILL.md` - Databricks engineering workflows for Asset Bundles, jobs, notebooks, SDK
usage, and governed data access.

- `stack-legacy-frontend` :: `agent-architecture/plugins/agent-architecture/skills/stack-legacy-frontend/SKILL.md` - Modernize legacy frontend stacks such as Knockout, YUI, old jQuery widgets,
and ad hoc browser code toward React/TypeScript.

- `stack-postgres` :: `agent-architecture/plugins/agent-architecture/skills/stack-postgres/SKILL.md` - Postgres schema, query, migration, performance, and data-governance workflows
with explicit read/write approvals and privacy-safe summaries.

- `stack-python` :: `agent-architecture/plugins/agent-architecture/skills/stack-python/SKILL.md` - Python service, library, and data workflow modernization with minimal
dependencies, local tests, packaging hygiene, and privacy-safe execution.

- `stack-react-typescript` :: `agent-architecture/plugins/agent-architecture/skills/stack-react-typescript/SKILL.md` - React and TypeScript application modernization, including codemods, Redux
Toolkit patterns, RTK Query, and UI migration checks.

- `stack-spring-ai` :: `agent-architecture/plugins/agent-architecture/skills/stack-spring-ai/SKILL.md` - Spring-native AI application patterns using Spring AI and Spring AI examples
as references, without making them core dependencies.

- `stack-spring-boot` :: `agent-architecture/plugins/agent-architecture/skills/stack-spring-boot/SKILL.md` - Spring Boot upgrade and API modernization using OpenRewrite recipes,
OpenAPI contracts, and local verification.

- `stack-sql-server` :: `agent-architecture/plugins/agent-architecture/skills/stack-sql-server/SKILL.md` - SQL Server schema, T-SQL, stored procedure, job, and application data-access
modernization with governed database access.

- `stack-sqlserver-to-postgres` :: `agent-architecture/plugins/agent-architecture/skills/stack-sqlserver-to-postgres/SKILL.md` - SQL Server to Postgres migration planning with T-SQL compatibility checks,
pgloader experiments, and production cutover guardrails.

- `stack` :: `agent-architecture/plugins/agent-architecture/skills/stack/SKILL.md` - Tech stack meta-loader. Auto-detects project tech stack from repo signals and
loads the matching stack-* skill. User can override detection explicitly.
Invoke via /stack, or when the user says "load stack", "detect stack",
"set stack to X", or any stack-* skill needs context.

- `subagent-orchestrator` :: `agent-architecture/plugins/agent-architecture/skills/subagent-orchestrator/SKILL.md` - Plans and materializes local-only subagent manifests for scoped parallel work.

- `systematic-debugging` :: `agent-architecture/plugins/agent-architecture/skills/systematic-debugging/SKILL.md` - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts.
Use when bugs span multiple system layers (workflow → build → deploy, API → service → database).
Emphasizes evidence gathering, architecture questioning, and preventing self-deception.

- `test` :: `agent-architecture/plugins/agent-architecture/skills/test/SKILL.md` - Designs and runs approved automated tests, including Playwright or Selenium when enabled by policy.

- `token-optimizer` :: `agent-architecture/plugins/agent-architecture/skills/token-optimizer/SKILL.md` - Token reduction for Python objects, API responses, logs, diffs, and code
before LLM injection. Bundles Python Token Killer (ptk) with zero required
dependencies and a bundled fallback. Complements rtk-token-optimizer
(rtk = shell output, token-optimizer = structured data and Python objects).

- `using-agent-skills` :: `agent-architecture/plugins/agent-architecture/skills/using-agent-skills/SKILL.md` - Use when starting any conversation - establishes how to find and use agent-architecture skills,
requiring skill invocation before ANY response including clarifying questions.

- `verification-before-completion` :: `agent-architecture/plugins/agent-architecture/skills/verification-before-completion/SKILL.md` - Ship-readiness verification workflow. Run verification commands and confirm output
before claiming work is complete or passing. Evidence before assertions always.

- `writing-skills` :: `agent-architecture/plugins/agent-architecture/skills/writing-skills/SKILL.md` - Skill creation and editing using test-driven development. Write test cases first,
watch them fail, write the skill documentation, watch tests pass, and refactor.

- `pre-commit-review` :: `agent-architecture/pre-commit-review/SKILL.md` - Executable skill that runs pre-commit hooks on code to catch style issues
(trailing whitespace, debug statements, invalid syntax) before code review.
Allows reviewers to focus on architecture instead of trivial nitpicks.
Works across Claude, Codex, and Copilot.

- `qa` :: `agent-architecture/qa/SKILL.md` - Enterprise-safe QA workflow. Plans and verifies user-facing or service behavior using
local tests and approved tools. Browser automation is optional and disabled by default.

- `receiving-code-review` :: `agent-architecture/receiving-code-review/SKILL.md` - Handle code review feedback with technical rigor. Verify before implementing.
Requires evaluation, not performative agreement or blind implementation.

- `reference-skill-patterns` :: `agent-architecture/reference-skill-patterns/SKILL.md` - Repo-local quick reference for the skill-pack pattern this repo uses.
Read once when adding or refactoring a skill folder.

- `release-notes` :: `agent-architecture/release-notes/SKILL.md` - Generate privacy-safe release notes from local changes, tests, and docs
without sending change data to third-party services.

- `release` :: `agent-architecture/release/SKILL.md` - Policy-gated release preparation workflow. Checks readiness, tests, docs, risk, and rollback
before handoff to human-approved merge or deploy steps.

- `retro` :: `agent-architecture/retro/SKILL.md` - Produces a local project retrospective from commits, incidents, decisions, and outcomes.

- `review` :: `agent-architecture/review/SKILL.md` - Enterprise-safe code review workflow. Reviews diffs and code paths for correctness,
maintainability, data access, policy violations, test gaps, and release risk.

- `ship` :: `agent-architecture/ship/SKILL.md` - Prepares a human-approved PR, merge, or release handoff. Runs parallel specialist
review (QA, security, PM, DevEx) before producing the handoff artifact.

- `agent-architecture` :: `agent-architecture/SKILL.md` - Enterprise-safe software engineering skill pack. Routes work to scoped skills for
spec writing, code review, QA, security review, documentation, learnings, and release
workflows. Designed for local project installs and no default public egress.

- `skillify` :: `agent-architecture/skillify/SKILL.md` - Turns a repeated local workflow into a reusable skill folder with template files.

- `spec` :: `agent-architecture/spec/SKILL.md` - Converts product or engineering intent into a scoped, reviewable specification with
goals, constraints, interfaces, invariants, tasks, and bug ledger.

- `subagent-orchestrator` :: `agent-architecture/subagent-orchestrator/SKILL.md` - Plans and materializes local-only subagent manifests for scoped parallel work.

- `systematic-debugging` :: `agent-architecture/systematic-debugging/SKILL.md` - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts.
Use when bugs span multiple system layers (workflow → build → deploy, API → service → database).
Emphasizes evidence gathering, architecture questioning, and preventing self-deception.

- `test` :: `agent-architecture/test/SKILL.md` - Designs and runs approved automated tests, including Playwright or Selenium when enabled by policy.

- `using-agent-skills` :: `agent-architecture/using-agent-skills/SKILL.md` - Use when starting any conversation - establishes how to find and use agent-architecture skills,
requiring skill invocation before ANY response including clarifying questions.

- `verification-before-completion` :: `agent-architecture/verification-before-completion/SKILL.md` - Ship-readiness verification workflow. Run verification commands and confirm output
before claiming work is complete or passing. Evidence before assertions always.

- `writing-skills` :: `agent-architecture/writing-skills/SKILL.md` - Skill creation and editing using test-driven development. Write test cases first,
watch them fail, write the skill documentation, watch tests pass, and refactor.

- `autoplan` :: `gstack/autoplan/SKILL.md` - Auto-review pipeline — reads the full CEO, design, eng, and DX review skills from disk and runs them sequentially with auto-decisions using 6 decision principles. (gstack)
- `benchmark-models` :: `gstack/benchmark-models/SKILL.md` - Cross-model benchmark for gstack skills. (gstack)
- `benchmark` :: `gstack/benchmark/SKILL.md` - Performance regression detection using the browse daemon. (gstack)
- `browse` :: `gstack/browse/SKILL.md` - Fast headless browser for QA testing and site dogfooding. (gstack)
- `hackernews-frontpage` :: `gstack/browser-skills/hackernews-frontpage/SKILL.md` - Scrape the Hacker News front page (titles, points, comment counts).
- `canary` :: `gstack/canary/SKILL.md` - Post-deploy canary monitoring. (gstack)
- `careful` :: `gstack/careful/SKILL.md` - Safety guardrails for destructive commands. (gstack)
- `codex` :: `gstack/codex/SKILL.md` - OpenAI Codex CLI wrapper — three modes. (gstack)
- `context-restore` :: `gstack/context-restore/SKILL.md` - Restore working context saved earlier by /context-save. (gstack)
- `context-save` :: `gstack/context-save/SKILL.md` - Save working context. (gstack)
- `cso` :: `gstack/cso/SKILL.md` - Chief Security Officer mode. (gstack)
- `design-consultation` :: `gstack/design-consultation/SKILL.md` - Design consultation: understands your product, researches the landscape, proposes a complete design system (aesthetic, typography, color, layout, spacing, motion), and generates font+color preview... (gstack)
- `design-html` :: `gstack/design-html/SKILL.md` - Design finalization: generates production-quality Pretext-native HTML/CSS. (gstack)
- `design-review` :: `gstack/design-review/SKILL.md` - Designer's eye QA: finds visual inconsistency, spacing issues, hierarchy problems, AI slop patterns, and slow interactions — then fixes them. (gstack)
- `design-shotgun` :: `gstack/design-shotgun/SKILL.md` - Design shotgun: generate multiple AI design variants, open a comparison board, collect structured feedback, and iterate. (gstack)
- `devex-review` :: `gstack/devex-review/SKILL.md` - Live developer experience audit. (gstack)
- `diagram` :: `gstack/diagram/SKILL.md` - Turn an English description (or mermaid source) into a diagram triplet: the source, an editable .excalidraw file you can open (gstack)
- `document-generate` :: `gstack/document-generate/SKILL.md` - Generate missing documentation from scratch for a feature, module, or entire project. (gstack)
- `document-release` :: `gstack/document-release/SKILL.md` - Post-ship documentation update. (gstack)
- `freeze` :: `gstack/freeze/SKILL.md` - Restrict file edits to a specific directory for the session. (gstack)
- `gstack-upgrade` :: `gstack/gstack-upgrade/SKILL.md` - Upgrade gstack to the latest version.
- `guard` :: `gstack/guard/SKILL.md` - Full safety mode: destructive command warnings + directory-scoped edits. (gstack)
- `health` :: `gstack/health/SKILL.md` - Code quality dashboard. (gstack)
- `investigate` :: `gstack/investigate/SKILL.md` - Systematic debugging with root cause investigation. (gstack)
- `ios-clean` :: `gstack/ios-clean/SKILL.md` - Remove the DebugBridge SPM package and all #if DEBUG wiring from an iOS app. (gstack)
- `ios-design-review` :: `gstack/ios-design-review/SKILL.md` - Visual design audit for iOS apps on real hardware. (gstack)
- `ios-fix` :: `gstack/ios-fix/SKILL.md` - Autonomous iOS bug fixer. (gstack)
- `ios-qa` :: `gstack/ios-qa/SKILL.md` - Live-device iOS QA for SwiftUI apps. (gstack)
- `ios-sync` :: `gstack/ios-sync/SKILL.md` - Regenerate the iOS debug bridge against the latest upstream gstack templates. (gstack)
- `land-and-deploy` :: `gstack/land-and-deploy/SKILL.md` - Land and deploy workflow. (gstack)
- `landing-report` :: `gstack/landing-report/SKILL.md` - Read-only queue dashboard for workspace-aware ship. (gstack)
- `learn` :: `gstack/learn/SKILL.md` - Manage project learnings.
- `make-pdf` :: `gstack/make-pdf/SKILL.md` - Turn any markdown file into a publication-quality PDF. (gstack)
- `office-hours` :: `gstack/office-hours/SKILL.md` - YC Office Hours — two modes. (gstack)
- `open-gstack-browser` :: `gstack/open-gstack-browser/SKILL.md` - Launch GStack Browser — AI-controlled Chromium with the sidebar extension baked in.
- `gstack-openclaw-ceo-review` :: `gstack/openclaw/skills/gstack-openclaw-ceo-review/SKILL.md` - Use when asked to review a plan, challenge a proposal, run a CEO review, poke holes in an approach, think bigger about scope, or decide whether to expand or reduce the plan.
- `gstack-openclaw-investigate` :: `gstack/openclaw/skills/gstack-openclaw-investigate/SKILL.md` - Use when asked to debug, fix a bug, investigate an error, or do root cause analysis, and when users report errors, stack traces, unexpected behavior, or say something stopped working.
- `gstack-openclaw-office-hours` :: `gstack/openclaw/skills/gstack-openclaw-office-hours/SKILL.md` - Use when asked to brainstorm, evaluate whether an idea is worth building, run office hours, or think through a new product idea or design direction before any code is written.
- `gstack-openclaw-retro` :: `gstack/openclaw/skills/gstack-openclaw-retro/SKILL.md` - Weekly engineering retrospective. Analyzes commit history, work patterns, and code quality metrics with persistent history and trend tracking. Team-aware with per-person contributions, praise, and growth areas. Use when asked for weekly retro, what shipped this week, or engineering retrospective.
- `pair-agent` :: `gstack/pair-agent/SKILL.md` - Pair a remote AI agent with your browser. (gstack)
- `plan-ceo-review` :: `gstack/plan-ceo-review/SKILL.md` - CEO/founder-mode plan review. (gstack)
- `plan-design-review` :: `gstack/plan-design-review/SKILL.md` - Designer's eye plan review — interactive, like CEO and Eng review. (gstack)
- `plan-devex-review` :: `gstack/plan-devex-review/SKILL.md` - Interactive developer experience plan review. (gstack)
- `plan-eng-review` :: `gstack/plan-eng-review/SKILL.md` - Eng manager-mode plan review. (gstack)
- `plan-tune` :: `gstack/plan-tune/SKILL.md` - Self-tuning question sensitivity + developer psychographic for gstack (v1: observational). (gstack)
- `qa-only` :: `gstack/qa-only/SKILL.md` - Report-only QA testing. (gstack)
- `qa` :: `gstack/qa/SKILL.md` - Systematically QA test a web application and fix bugs found. (gstack)
- `retro` :: `gstack/retro/SKILL.md` - Weekly engineering retrospective. (gstack)
- `review` :: `gstack/review/SKILL.md` - Pre-landing PR review. (gstack)
- `scrape` :: `gstack/scrape/SKILL.md` - Pull data from a web page. (gstack)
- `setup-browser-cookies` :: `gstack/setup-browser-cookies/SKILL.md` - Import cookies from your real Chromium browser into the headless browse session. (gstack)
- `setup-deploy` :: `gstack/setup-deploy/SKILL.md` - Configure deployment settings for /land-and-deploy.
- `setup-gbrain` :: `gstack/setup-gbrain/SKILL.md` - Set up gbrain for this coding agent: install the CLI, initialize a local PGLite or Supabase brain, register MCP, capture per-remote trust policy. (gstack)
- `ship` :: `gstack/ship/SKILL.md` - Ship workflow: detect + merge base branch, run tests, review diff, bump VERSION, update CHANGELOG, commit, push, create PR. (gstack)
- `gstack` :: `gstack/SKILL.md` - Fast headless browser for QA testing and site dogfooding. (gstack)
- `skillify` :: `gstack/skillify/SKILL.md` - Codify the most recent successful /scrape flow into a permanent browser-skill on disk. (gstack)
- `spec` :: `gstack/spec/SKILL.md` - Turn vague intent into a precise, executable spec in five phases. (gstack)
- `sync-gbrain` :: `gstack/sync-gbrain/SKILL.md` - Keep gbrain current with this repo's code and refresh agent search guidance in CLAUDE.md. Wraps the gstack-gbrain-sync orchestrator with state (gstack)
- `unfreeze` :: `gstack/unfreeze/SKILL.md` - Clear the freeze boundary set by /freeze, allowing edits to all directories again. (gstack)
- `ponytail-audit` :: `ponytail/skills/ponytail-audit/SKILL.md` - Whole-repo audit for over-engineering. Like ponytail-review, but scans the entire codebase instead of a diff: a ranked list of what to delete, simplify, or replace with stdlib/native equivalents. Use when the user says "audit this codebase", "audit for over-engineering", "what can I delete from this repo", "find bloat", "ponytail-audit", or "/ponytail-audit". One-shot report, does not apply fixes.

- `ponytail-debt` :: `ponytail/skills/ponytail-debt/SKILL.md` - Harvest every `ponytail:` comment in the codebase into a debt ledger, so the deliberate shortcuts and deferrals ponytail leaves behind get tracked instead of rotting into "later means never". Use when the user says "ponytail debt", "/ponytail-debt", "what did ponytail defer", "list the shortcuts", "ponytail ledger", or "what did we mark to do later". One-shot report, changes nothing.

- `ponytail-gain` :: `ponytail/skills/ponytail-gain/SKILL.md` - Show ponytail's measured impact as a compact scoreboard: less code, less cost, more speed, from the benchmark medians. One-shot display, not a persistent mode, and not a per-repo number. Trigger: /ponytail-gain, "ponytail gain", "what does ponytail save", "show ponytail impact", "ponytail scoreboard".

- `ponytail-help` :: `ponytail/skills/ponytail-help/SKILL.md` - Quick-reference card for all ponytail modes, skills, and commands. One-shot display, not a persistent mode. Trigger: /ponytail-help, "ponytail help", "what ponytail commands", "how do I use ponytail".

- `ponytail-review` :: `ponytail/skills/ponytail-review/SKILL.md` - Code review focused exclusively on over-engineering. Finds what to delete: reinvented standard library, unneeded dependencies, speculative abstractions, dead flexibility. One line per finding: location, what to cut, what replaces it. Use when the user says "review for over-engineering", "what can we delete", "is this over-engineered", "simplify review", or invokes /ponytail-review. Complements correctness-focused review, this one only hunts complexity.

- `ponytail` :: `ponytail/skills/ponytail/SKILL.md` - Forces the laziest solution that actually works, simplest, shortest, most minimal. Channels a senior dev who has seen everything: question whether the task needs to exist at all (YAGNI), reach for the standard library before custom code, native platform features before dependencies, one line before fifty. Supports intensity levels: lite, full (default), ultra. Use whenever the user says "ponytail", "be lazy", "lazy mode", "simplest solution", "minimal solution", "yagni", "do less", or "shortest path", and whenever they complain about over-engineering, bloat, boilerplate, or unnecessary dependencies.

- `tstack` :: `SKILL.md` - TStack - Repository governance engine with automated enforcement
### stack

- `domain-data-governance` :: `agent-architecture/packages/stacks/domain-data-governance/SKILL.md` - Data governance review for classification, lineage, permissions, retention,
auditability, quality checks, and privacy-safe agent outputs.

- `domain-experiment-design` :: `agent-architecture/packages/stacks/domain-experiment-design/SKILL.md` - Experiment design review for randomization, power, metrics, guardrails,
exposure, analysis plans, and rollout risk.

- `domain-mlops-databricks` :: `agent-architecture/packages/stacks/domain-mlops-databricks/SKILL.md` - Databricks MLOps project structure, model lifecycle, CI/CD, monitoring, and
governed production ML workflows.

- `domain-model-interpretation` :: `agent-architecture/packages/stacks/domain-model-interpretation/SKILL.md` - Model interpretation review for feature effects, calibration, drift,
uncertainty, explanation limits, and decision-risk communication.

- `stack-aws-dms` :: `agent-architecture/packages/stacks/stack-aws-dms/SKILL.md` - AWS DMS/SCT migration planning patterns for governed database migration
experiments and cutovers.

- `stack-aws` :: `agent-architecture/packages/stacks/stack-aws/SKILL.md` - AWS application modernization planning with least-privilege, local-first
validation, explicit approvals, and no default cloud mutation.

- `mcp-csharp-create` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-ai/skills/mcp-csharp-create/SKILL.md` - Create MCP servers using the C# SDK and .NET project templates. Covers scaffolding, tool/prompt/resource implementation, and transport configuration for stdio and HTTP. USE FOR: creating new MCP server projects, scaffolding with dotnet new mcpserver, adding MCP tools/prompts/resources, choosing stdio vs HTTP transport, configuring MCP hosting in Program.cs, setting up ASP.NET Core MCP endpoints with MapMcp. DO NOT USE FOR: debugging or running existing servers (use mcp-csharp-debug), writing tests (use mcp-csharp-test), publishing or deploying (use mcp-csharp-publish), building MCP clients, non-.NET MCP servers.

- `mcp-csharp-debug` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-ai/skills/mcp-csharp-debug/SKILL.md` - Run and debug C# MCP servers locally. Covers IDE configuration, MCP Inspector testing, GitHub Copilot Agent Mode integration, logging setup, and troubleshooting. USE FOR: running MCP servers locally with dotnet run, configuring VS Code or Visual Studio for MCP debugging, testing tools with MCP Inspector, testing with GitHub Copilot Agent Mode, diagnosing tool registration issues, setting up mcp.json configuration, debugging MCP protocol messages, configuring logging for stdio and HTTP servers. DO NOT USE FOR: creating new MCP servers (use mcp-csharp-create), writing automated tests (use mcp-csharp-test), publishing or deploying to production (use mcp-csharp-publish).

- `mcp-csharp-publish` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-ai/skills/mcp-csharp-publish/SKILL.md` - Publish and deploy C# MCP servers. Covers NuGet packaging for stdio servers, Docker containerization for HTTP servers, Azure Container Apps and App Service deployment, and publishing to the official MCP Registry. USE FOR: packaging stdio MCP servers as NuGet tools, creating Dockerfiles for HTTP MCP servers, deploying to Azure Container Apps or App Service, publishing to the MCP Registry at registry.modelcontextprotocol.io, configuring server.json for MCP package metadata, setting up CI/CD for MCP server publishing. DO NOT USE FOR: publishing general NuGet libraries (not MCP-specific), general Docker guidance unrelated to MCP, creating new servers (use mcp-csharp-create), debugging (use mcp-csharp-debug), writing tests (use mcp-csharp-test).

- `mcp-csharp-test` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-ai/skills/mcp-csharp-test/SKILL.md` - Test C# MCP servers at multiple levels: unit tests for individual tools and integration tests using the MCP client SDK. USE FOR: unit testing MCP tool methods, integration testing with in-memory MCP client/server, end-to-end testing via MCP protocol, testing HTTP MCP servers with WebApplicationFactory, mocking dependencies in tool tests, creating evaluations for MCP servers, writing eval questions, measuring tool quality. DO NOT USE FOR: testing MCP clients (this is server testing only), load or performance testing, testing non-.NET MCP servers, debugging server issues (use mcp-csharp-debug).

- `technology-selection` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-ai/skills/technology-selection/SKILL.md` - Guides technology selection and implementation of AI and ML features in .NET 8+ applications using ML.NET, Microsoft.Extensions.AI (MEAI), Microsoft Agent Framework (MAF), GitHub Copilot SDK, ONNX Runtime, and OllamaSharp. Covers the full spectrum from classic ML through modern LLM orchestration to local inference. Use when adding classification, regression, clustering, anomaly detection, recommendation, LLM integration (text generation, summarization, reasoning), RAG pipelines with vector search, agentic workflows with tool calling, Copilot extensions, or custom model inference via ONNX Runtime to a .NET project. DO NOT USE FOR projects targeting .NET Framework (requires .NET 8+), the task is pure data engineering or ETL with no ML/AI component, or the project needs a custom deep learning training loop (use Python with PyTorch/TensorFlow, then export to ONNX for .NET inference).
- `configuring-opentelemetry-dotnet` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-aspnetcore/skills/configuring-opentelemetry-dotnet/SKILL.md` - Configure OpenTelemetry distributed tracing, metrics, and logging in ASP.NET Core using the .NET OpenTelemetry SDK. Use when adding observability, setting up OTLP exporters, creating custom metrics/spans, or troubleshooting distributed trace correlation.
- `convert-blazor-server-to-webapp` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-aspnetcore/skills/convert-blazor-server-to-webapp/SKILL.md` - Guides conversion of a pre-.NET 8 Blazor Server app into a .NET 8+ Blazor Web App. USE FOR: migrating apps that use AddServerSideBlazor and MapBlazorHub to the AddRazorComponents/MapRazorComponents model, converting _Host.cshtml to an App.razor root component, replacing blazor.server.js with blazor.web.js, migrating CascadingAuthenticationState to a service, adopting new Blazor Web App features like enhanced navigation and streaming rendering. DO NOT USE FOR: apps that are already Blazor Web Apps (already use AddRazorComponents and MapRazorComponents), Blazor WebAssembly or hosted Blazor WebAssembly apps (different migration path), apps that should stay on the Blazor Server hosting model without converting, or apps still targeting .NET Framework.

- `dotnet-webapi` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-aspnetcore/skills/dotnet-webapi/SKILL.md` - Guides creation and modification of ASP.NET Core Web API endpoints with correct HTTP semantics, OpenAPI metadata, and error handling. USE FOR: adding new API endpoints (controllers or minimal APIs), wiring up OpenAPI/Swagger, creating .http test files, setting up global error handling middleware. DO NOT USE FOR: general C# coding style, EF Core data access or query optimization (use optimizing-ef-core-queries), frontend/Blazor work, gRPC services, or SignalR hubs.

- `minimal-api-file-upload` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-aspnetcore/skills/minimal-api-file-upload/SKILL.md` - File upload endpoints in ASP.NET minimal APIs (.NET 8+)
- `author-component` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-blazor/skills/author-component/SKILL.md` - Create or review Blazor components (.razor files) with correct architecture. USE FOR: writing new Blazor components that do NOT involve JavaScript interop, implementing parameters and EventCallback, RenderFragment slots, component lifecycle (OnInitializedAsync, OnParametersSet), async patterns, IAsyncDisposable, CancellationToken, CSS isolation, code-behind. DO NOT USE FOR: creating new projects (use create-blazor-project), JavaScript interop or calling browser APIs from Blazor (use use-js-interop), forms and validation (use collect-user-input), prerendering issues (use support-prerendering), HTTP data fetching patterns (use fetch-and-send-data), coordinating state between unrelated components (use coordinate-components).

- `collect-user-input` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-blazor/skills/collect-user-input/SKILL.md` - Build forms, validate data, and react to user input in Blazor. USE FOR adding forms, search boxes, filter panels, inline editing, data-entry UI, file uploads, validation (annotations or custom), handling form submissions, and binding input controls. Covers EditForm, built-in input components, DataAnnotationsValidator, custom validation, SSR form patterns (SupplyParameterFromForm, FormName, AntiforgeryToken, Enhance), and @bind for simple interactive controls. DO NOT USE for project scaffolding (see create-blazor-project) or prerendering issues (see support-prerendering).
- `configure-auth` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-blazor/skills/configure-auth/SKILL.md` - Add authentication and authorization to a Blazor Web App, accounting for the app's render mode. USE WHEN the user needs [Authorize] on pages, AuthorizeView, role or policy-based access, login/logout Identity pages, or AuthenticationStateProvider. Also USE WHEN auth state is null after WebAssembly loads, SignInManager throws in an interactive component, <NotAuthorized> content never renders in static SSR, or HttpContext.User is null in an interactive component. DO NOT USE for general component authoring (see author-component), for prerendering concerns unrelated to auth (see support-prerendering), or for managing non-auth cascading state (see coordinate-components).

- `coordinate-components` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-blazor/skills/coordinate-components/SKILL.md` - Share state between components that don't have a direct parent-child parameter relationship, using cascading values, scoped services with change events, or CascadingValueSource via DI. USE WHEN the user needs a CascadingParameter or CascadingValue that works across render mode boundaries, a shopping cart or notification count accessible from multiple pages, a theme or user preference cascaded app-wide, or when components in different parts of the tree must react when shared data changes. Also USE WHEN cascading values aren't reaching interactive children in per-page interactivity mode, or when the user needs to understand scoped vs singleton service lifetime for state on Blazor Server. DO NOT USE for direct parent-child parameter passing or EventCallback (see author-component), for persisting state across prerender-to-interactive transitions (see support-prerendering), or for service abstractions for data fetching in Auto/WebAssembly (see fetch-and-send-data).

- `create-blazor-project` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-blazor/skills/create-blazor-project/SKILL.md` - Create a new ASP.NET Core web application or web site using Blazor. USE FOR: creating a new Blazor web app, scaffolding a new web project, starting a new web site, choosing render modes (Static SSR, Interactive Server, Interactive WebAssembly, Auto), running dotnet new blazor with the right options, setting up initial project structure. DO NOT USE FOR: adding features to existing projects, changing how an existing app renders, or component authoring (use author-component).

- `fetch-and-send-data` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-blazor/skills/fetch-and-send-data/SKILL.md` - Call APIs, load data into components, and handle the async lifecycle in Blazor. USE FOR fetching data from a backend, submitting data to an API, displaying loading/error states, registering HttpClient, building service abstractions for Auto/WebAssembly render modes. DO NOT USE for form validation (see collect-user-input), prerendering persistence (see support-prerendering), or project scaffolding (see create-blazor-project).
- `plan-ui-change` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-blazor/skills/plan-ui-change/SKILL.md` - Plan complex Blazor UI features by decomposing them into focused components. USE FOR: building a complex Blazor page with multiple sections, planning component decomposition, designing a multi-section dashboard or layout, breaking down a large UI feature into composable components, pages with sidebars and content panels, any page with 3+ distinct visual sections or multiple interacting sub-features, identifying parent-child relationships and data flow. DO NOT USE FOR: creating new Blazor projects or apps from scratch (use create-blazor-project), implementing a single individual component (use author-component), writing component code with parameters and EventCallback (use author-component), or simple single-component pages.

- `support-prerendering` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-blazor/skills/support-prerendering/SKILL.md` - Make interactive Blazor components work correctly with prerendering. USE FOR fixing duplicate data loads, UI flicker during prerender-to-interactive handoff, null references during prerender, persisting state across prerender, disabling prerendering, excluding pages from interactive routing, or detecting whether a component is currently prerendering. DO NOT USE for choosing which render mode to use (see create-blazor-project) or general component authoring (see author-component).
- `use-js-interop` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-blazor/skills/use-js-interop/SKILL.md` - Add, review, or fix JavaScript interop in Blazor components. USE FOR: calling JavaScript from Blazor, calling .NET from JavaScript, collocated .razor.js modules, IJSRuntime, IJSObjectReference lifecycle, DotNetObjectReference, ElementReference, timing rules for when JS is available, IAsyncDisposable disposal of JS references, server-side JS interop safety. DO NOT USE FOR: general Blazor component authoring without JS interop needs (use author-component), forms (use collect-user-input).

- `optimizing-ef-core-queries` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-data/skills/optimizing-ef-core-queries/SKILL.md` - Optimize Entity Framework Core queries by fixing N+1 problems, choosing correct tracking modes, using compiled queries, and avoiding common performance traps. Use when EF Core queries are slow, generating excessive SQL, or causing high database load.
- `analyzing-dotnet-performance` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-diag/skills/analyzing-dotnet-performance/SKILL.md` - Scans .NET code for ~50 performance anti-patterns across async, memory, strings, collections, LINQ, regex, serialization, and I/O with tiered severity classification. Use when analyzing .NET code for optimization opportunities, reviewing hot paths, or auditing allocation-heavy patterns.
- `android-tombstone-symbolication` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-diag/skills/android-tombstone-symbolication/SKILL.md` - Symbolicate the .NET runtime frames in an Android tombstone file. Extracts BuildIds and PC offsets from the native backtrace, downloads debug symbols from the Microsoft symbol server, and runs llvm-symbolizer to produce function names with source file and line numbers. USE FOR triaging a .NET MAUI or Mono Android app crash from a tombstone, resolving native backtrace frames in libmonosgen-2.0.so or libcoreclr.so to .NET runtime source code, or investigating SIGABRT, SIGSEGV, or other native signals originating from the .NET runtime on Android. DO NOT USE FOR pure Java/Kotlin crashes, managed .NET exceptions that are already captured in logcat, or iOS crash logs. INVOKES Symbolicate-Tombstone.ps1 script, llvm-symbolizer, Microsoft symbol server.
- `apple-crash-symbolication` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-diag/skills/apple-crash-symbolication/SKILL.md` - Symbolicate .NET runtime frames in Apple platform .ips crash logs (iOS, tvOS, Mac Catalyst, macOS). Extracts UUIDs and addresses from the native backtrace, locates dSYM debug symbols, and runs atos to produce function names with source file and line numbers. Automatically downloads .dwarf symbols from the Microsoft symbol server using Mach-O UUIDs. USE FOR triaging a .NET MAUI or Mono app crash from an .ips file on any Apple platform, resolving native backtrace frames in libcoreclr or libmonosgen-2.0 to .NET runtime source code, retrieving .ips crash logs from a connected iOS device or iPhone, or investigating EXC_CRASH, EXC_BAD_ACCESS, SIGABRT, or SIGSEGV originating from the .NET runtime. DO NOT USE FOR pure Swift/Objective-C crashes with no .NET components, or Android tombstone files. INVOKES Symbolicate-Crash.ps1 script, atos, dwarfdump, idevicecrashreport.
- `clr-activation-debugging` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-diag/skills/clr-activation-debugging/SKILL.md` - Diagnoses .NET Framework CLR activation issues using CLR activation logs (CLRLoad logs) produced by mscoree.dll. Use when: the shim picks the wrong runtime, fails to load any runtime, shows unexpected .NET 3.5 Feature-on-Demand (FOD) dialogs, unexpectedly does NOT show FOD dialogs, loads both v2 and v4 into the same process causing failures, or any time someone is wondering "what is happening with .NET Framework activation?"
- `dotnet-trace-collect` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-diag/skills/dotnet-trace-collect/SKILL.md` - Guide developers through capturing diagnostic artifacts to diagnose production .NET performance issues. Use when the user needs help choosing diagnostic tools, collecting performance data, or understanding tool trade-offs across different environments (Windows/Linux, .NET Framework/modern .NET, container/non-container).
- `dump-collect` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-diag/skills/dump-collect/SKILL.md` - Configure and collect crash dumps for modern .NET applications. USE FOR: enabling automatic crash dumps for CoreCLR or NativeAOT, capturing dumps from running .NET processes, setting up dump collection in Docker or Kubernetes, using dotnet-dump collect or createdump. DO NOT USE FOR: analyzing or debugging dumps, post-mortem investigation with lldb/windbg/dotnet-dump analyze, profiling or tracing, or for .NET Framework processes.
- `microbenchmarking` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-diag/skills/microbenchmarking/SKILL.md` - Activate this skill when BenchmarkDotNet (BDN) is involved in the task — creating, running, configuring, or reviewing BDN benchmarks. Also activate when microbenchmarking .NET code would be useful and BenchmarkDotNet is the likely tool. Consider activating when answering a .NET performance question requires measurement and BenchmarkDotNet may be needed. Covers microbenchmark design, BDN configuration and project setup, how to run BDN microbenchmarks efficiently and effectively, and using BDN for side-by-side performance comparisons. Do NOT use for profiling/tracing .NET code (dotnet-trace, PerfView), production telemetry, or load/stress testing (Crank, k6).

- `exp-mock-usage-analysis` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-experimental/skills/exp-mock-usage-analysis/SKILL.md` - Audits .NET test mock usage by tracing each mock setup through the production code's execution path to find dead, unreachable, redundant, or replaceable mocks. Use when the user asks to audit mock usage, find unused or unnecessary mock setups, check if mocks are needed, reduce mock duplication or over-mocking, simplify test setup, or review whether mock configurations like ILogger/IOptions should use real implementations instead. Supports Moq, NSubstitute, and FakeItEasy.
- `exp-simd-vectorization` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-experimental/skills/exp-simd-vectorization/SKILL.md` - Optimizes hot-path scalar loops in .NET 8+ with cross-platform Vector128/Vector256/Vector512 SIMD intrinsics, or replaces manual math loops with single TensorPrimitives API calls. Covers byte-range validation, character counting, bulk bitwise ops, cross-type conversion, fused multi-array computations, and float/double math operations.
- `exp-test-maintainability` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-experimental/skills/exp-test-maintainability/SKILL.md` - Detects duplicate boilerplate, copy-paste tests, and structural maintainability issues across .NET test suites. Use when the user asks to reduce repetition, consolidate similar test methods, convert copy-paste tests to data-driven parameterized tests, suggest a better test structure, or identify refactoring opportunities. Identifies repeated construction, assertion patterns, copy-paste methods convertible to DataRow/Theory/TestCase, redundant setup/teardown, and shared infrastructure. Produces an analysis report with concrete before/after suggestions. Works with MSTest, xUnit, NUnit, and TUnit. DO NOT USE FOR: writing new tests (use writing-mstest-tests), reviewing test quality or anti-patterns (use test-anti-patterns), or deep mock auditing (use exp-mock-usage-analysis).
- `dotnet-maui-doctor` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-maui/skills/dotnet-maui-doctor/SKILL.md` - Diagnoses and fixes .NET MAUI development environment issues. Validates .NET SDK, workloads, Java JDK, Android SDK, Xcode, and Windows SDK. All version requirements discovered dynamically from NuGet WorkloadDependencies.json — never hardcoded. Use when: setting up MAUI development, build errors mentioning SDK/workload/JDK/Android, "Android SDK not found", "Java version" errors, "Xcode not found", environment verification after updates, or any MAUI toolchain issues. Do not use for: non-MAUI .NET projects, Xamarin.Forms apps, runtime app crashes unrelated to environment setup, or app store publishing issues. Works on macOS, Windows, and Linux.
- `maui-app-lifecycle` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-maui/skills/maui-app-lifecycle/SKILL.md` - .NET MAUI app lifecycle guidance — the four app states, cross-platform Window lifecycle events (Created, Activated, Deactivated, Stopped, Resumed, Destroying), platform-specific lifecycle mapping, backgrounding and resume behavior, and state-preservation patterns. USE FOR: "app lifecycle", "window lifecycle events", "save state on background", "resume app", "OnStopped", "OnResumed", "backgrounding", "deactivated event", "ConfigureLifecycleEvents", "platform lifecycle hooks". DO NOT USE FOR: navigation events (use maui-shell-navigation), dependency injection setup (use maui-dependency-injection), platform API invocation (use conditional compilation and partial classes).
- `maui-collectionview` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-maui/skills/maui-collectionview/SKILL.md` - Guidance for implementing CollectionView in .NET MAUI apps — data display, layouts (list & grid), selection, grouping, scrolling, empty views, templates, incremental loading, swipe actions, and pull-to-refresh. USE FOR: "CollectionView", "list view", "grid layout", "data template", "item template", "grouping", "pull to refresh", "incremental loading", "swipe actions", "empty view", "selection mode", "scroll to item", displaying scrollable data, replacing ListView. DO NOT USE FOR: simple static layouts without scrollable data (use Grid or StackLayout), map pin lists (use Microsoft.Maui.Controls.Maps), table-based data entry forms, or non-MAUI list controls.

- `maui-data-binding` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-maui/skills/maui-data-binding/SKILL.md` - Guidance for .NET MAUI XAML and C# data bindings — compiled bindings, INotifyPropertyChanged / ObservableObject, value converters, binding modes, multi-binding, relative bindings, fallbacks, and MVVM best practices. USE FOR: setting up compiled bindings with x:DataType, implementing INotifyPropertyChanged or CommunityToolkit ObservableObject, creating IValueConverter / IMultiValueConverter, choosing binding modes, configuring BindingContext, relative bindings, binding fallbacks, StringFormat, code-behind SetBinding with lambdas, and enforcing XC0022/XC0025 warnings. DO NOT USE FOR: CollectionView item templates and layouts (use maui-collectionview), Shell navigation data passing (use maui-shell-navigation), dependency injection (use maui-dependency-injection), or animations triggered by property changes (use .NET MAUI animation APIs).
- `maui-dependency-injection` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-maui/skills/maui-dependency-injection/SKILL.md` - Guidance for configuring dependency injection in .NET MAUI apps — service registration in MauiProgram.cs, lifetime selection (Singleton / Transient / Scoped), constructor injection, Shell navigation auto-resolution, platform-specific registrations, and testability patterns. USE FOR: "dependency injection", "DI setup", "AddSingleton", "AddTransient", "AddScoped", "service registration", "constructor injection", "IServiceProvider", "MauiProgram DI", "register services", "BindingContext injection". DO NOT USE FOR: data binding (use maui-data-binding), Shell route configuration (use maui-shell-navigation), unit-test mocking frameworks (use standard xUnit and NSubstitute patterns).

- `maui-safe-area` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-maui/skills/maui-safe-area/SKILL.md` - .NET MAUI safe area and edge-to-edge layout guidance for .NET 10+. Covers the new SafeAreaEdges property, SafeAreaRegions enum, per-edge control, keyboard avoidance, Blazor Hybrid CSS safe areas, migration from legacy iOS-only APIs, and platform-specific behavior for Android, iOS, and Mac Catalyst. USE FOR: "safe area", "edge-to-edge", "SafeAreaEdges", "SafeAreaRegions", "keyboard avoidance", "notch insets", "status bar overlap", "iOS safe area", "Android edge-to-edge", "content behind status bar", "UseSafeArea migration", "soft input keyboard", "IgnoreSafeArea replacement". DO NOT USE FOR: general layout or grid design (use Grid and StackLayout), app lifecycle handling (use maui-app-lifecycle), theming or styling (use maui-theming), or Shell navigation structure.
- `maui-shell-navigation` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-maui/skills/maui-shell-navigation/SKILL.md` - Guide for implementing Shell-based navigation in .NET MAUI apps. Covers AppShell setup, visual hierarchy (FlyoutItem, TabBar, Tab, ShellContent), URI-based navigation with GoToAsync, route registration, query parameters, back navigation, flyout and tab configuration, navigation events, and navigation guards. Use when: setting up Shell navigation, adding tabs or flyout menus, navigating between pages with GoToAsync, passing parameters between pages, registering routes, customizing back button behavior, or guarding navigation with confirmation dialogs. Do not use for: deep linking from external URLs (see .NET MAUI deep linking documentation), data binding on pages (use maui-data-binding), dependency injection setup (use maui-dependency-injection), or NavigationPage-only apps that don't use Shell.
- `maui-theming` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-maui/skills/maui-theming/SKILL.md` - Guide for theming .NET MAUI apps — light/dark mode via AppThemeBinding, ResourceDictionary theme switching, DynamicResource bindings, system theme detection, and user theme preferences. Use when: "dark mode", "light mode", "theming", "AppThemeBinding", "theme switching", "ResourceDictionary theme", "dynamic resources", "system theme detection", "color scheme", "app theme", "DynamicResource". Do not use for: localization or language switching (see .NET MAUI localization documentation), accessibility visual adjustments (see .NET MAUI accessibility documentation), app icons or splash screens (see .NET MAUI app icons documentation), or Bootstrap-style class theming (see Plugin.Maui.BootstrapTheme NuGet package).
- `binlog-failure-analysis` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/binlog-failure-analysis/SKILL.md` - Analyze MSBuild binary logs to diagnose build failures. Only activate in MSBuild/.NET build context. USE FOR: build errors that are unclear from console output, diagnosing cascading failures across multi-project builds, tracing MSBuild target execution order, and generally any MSBuild build issues. Requires an existing .binlog file. DO NOT USE FOR: generating binlogs (use binlog-generation), non-MSBuild build systems. INVOKES: binlog MCP server tools (overview, errors, search, items, properties); falls back to dotnet msbuild binlog replay + grep/cat when the MCP is unavailable.
- `binlog-generation` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/binlog-generation/SKILL.md` - Generate MSBuild binary logs (binlogs) for build diagnostics and analysis. Only activate in MSBuild/.NET build context. USE FOR: adding /bl:{} to any dotnet build, test, pack, publish, or restore command to capture a full build execution trace, prerequisite for binlog-failure-analysis and build-perf-diagnostics skills, enabling post-build investigation of errors or performance. Requires MSBuild 17.8+ / .NET 8 SDK+ for {} placeholder; PowerShell needs -bl:{{}}. DO NOT USE FOR: non-MSBuild build systems (npm, Maven, CMake), analyzing an existing binlog (use binlog-failure-analysis instead). INVOKES: shell commands (dotnet build /bl:{}).
- `build-parallelism` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/build-parallelism/SKILL.md` - Guide for optimizing MSBuild build parallelism and multi-project scheduling. Only activate in MSBuild/.NET build context. USE FOR: builds not utilizing all CPU cores, speeding up multi-project solutions, evaluating graph build mode (/graph), build time not improving with -m flag, understanding project dependency topology. Note: /maxcpucount default is 1 (sequential) — always use -m for parallel builds. Covers /maxcpucount, graph build for better scheduling and isolation, BuildInParallel on MSBuild task, reducing unnecessary ProjectReferences, solution filters (.slnf) for building subsets. DO NOT USE FOR: single-project builds, incremental build issues (use incremental-build), compilation slowness within a project (use build-perf-diagnostics), non-MSBuild build systems. INVOKES: binlog MCP server tools (expensive_projects, expensive_targets, project_target_times); falls back to dotnet build -m, dotnet build /graph, binlog replay + grep.
- `build-perf-baseline` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/build-perf-baseline/SKILL.md` - Establish build performance baselines and apply systematic optimization techniques. Only activate in MSBuild/.NET build context. USE FOR: diagnosing slow builds, establishing before/after measurements (cold, warm, no-op scenarios), applying optimization strategies like MSBuild Server, static graph builds, artifacts output, and dependency graph trimming. Start here before diving into build-perf-diagnostics, incremental-build, or build-parallelism. DO NOT USE FOR: non-MSBuild build systems, detailed bottleneck analysis (use build-perf-diagnostics after baselining).
- `build-perf-diagnostics` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/build-perf-diagnostics/SKILL.md` - Diagnose MSBuild build performance bottlenecks using binary log analysis. Only activate in MSBuild/.NET build context. USE FOR: identifying why builds are slow by analyzing binlog performance summaries, detecting ResolveAssemblyReference (RAR) taking >5s, Roslyn analyzers consuming >30% of Csc time, single targets dominating >50% of build time, node utilization below 80%, excessive Copy tasks, NuGet restore running every build. Covers timeline analysis, Target/Task Performance Summary interpretation, and 7 common bottleneck categories. Use after build-perf-baseline has established measurements. DO NOT USE FOR: establishing initial baselines (use build-perf-baseline first), fixing incremental build issues (use incremental-build), parallelism tuning (use build-parallelism), non-MSBuild build systems. INVOKES: binlog MCP server tools (overview, errors, search, items, properties); falls back to dotnet msbuild binlog replay + grep/cat when the MCP is unavailable.
- `check-bin-obj-clash` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/check-bin-obj-clash/SKILL.md` - Detects MSBuild projects with conflicting OutputPath or IntermediateOutputPath. Only activate in MSBuild/.NET build context. USE FOR: builds failing with 'Cannot create a file when that file already exists', 'The process cannot access the file because it is being used by another process', intermittent build failures that succeed on retry, missing outputs in multi-project builds, multi-targeting builds where project.assets.json conflicts. Diagnoses when multiple projects or TFMs write to the same bin/obj directories due to shared OutputPath, missing AppendTargetFrameworkToOutputPath, or extra global properties like PublishReadyToRun creating redundant evaluations. DO NOT USE FOR: file access errors unrelated to MSBuild (OS-level locking), single-project single-TFM builds, non-MSBuild build systems. INVOKES: binlog MCP server tools (overview, projects, evaluations, properties, double_writes); falls back to dotnet msbuild binlog replay + grep when the MCP is unavailable.
- `directory-build-organization` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/directory-build-organization/SKILL.md` - Guide for organizing MSBuild infrastructure with Directory.Build.props, Directory.Build.targets, Directory.Packages.props, and Directory.Build.rsp. Only activate in MSBuild/.NET build context. USE FOR: structuring multi-project repos, centralizing build settings, implementing NuGet Central Package Management (CPM) with ManagePackageVersionsCentrally, consolidating duplicated properties across .csproj files, setting up multi-level Directory.Build hierarchy with GetPathOfFileAbove, understanding evaluation order (Directory.Build.props → SDK .props → .csproj → SDK .targets → Directory.Build.targets). Critical pitfall: $(TargetFramework) conditions in .props silently fail for single-targeting projects — must use .targets. DO NOT USE FOR: non-MSBuild build systems, migrating legacy projects to SDK-style (use msbuild-modernization), single-project solutions with no shared settings. INVOKES: no tools — pure knowledge skill.
- `eval-performance` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/eval-performance/SKILL.md` - Guide for diagnosing and improving MSBuild project evaluation performance. Only activate in MSBuild/.NET build context. USE FOR: builds slow before any compilation starts, high evaluation time in binlog analysis, expensive glob patterns walking large directories (node_modules, .git, bin/obj), deep import chains (>20 levels), preprocessed output >10K lines indicating heavy evaluation, property functions with file I/O ($([System.IO.File]::ReadAllText(...))), multiple evaluations per project. Covers the 5 MSBuild evaluation phases, glob optimization via DefaultItemExcludes, import chain analysis with /pp preprocessing. DO NOT USE FOR: compilation-time slowness (use build-perf-diagnostics), incremental build issues (use incremental-build), non-MSBuild build systems. INVOKES: binlog MCP server tools (evaluations, evaluation_global_properties, evaluation_properties, imports, properties); falls back to dotnet msbuild -pp:full.xml for preprocessing, /clp:PerformanceSummary.
- `extension-points` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/extension-points/SKILL.md` - Guide for MSBuild extensibility: CustomBefore/CustomAfter hooks, wildcard imports with alphabetic ordering, import gating with control properties, NuGet package build extension layout (build/buildTransitive), and the MicrosoftCommonPropsHasBeenImported guard. Only activate in MSBuild/.NET build context. USE FOR: diagnosing and fixing MSBuild import and hook patterns, reviewing and fixing extension point anti-patterns in Directory.Build files, fixing missing Exists() guards on imports that break fresh clones, fixing NuGet package hooks being silently dropped instead of appended, making build targets extensible for other projects, injecting custom logic into the build pipeline, creating NuGet packages that extend the build, conditionally disabling imports. DO NOT USE FOR: target authoring patterns (use target-authoring), props vs targets placement (use directory-build-organization), general anti-patterns (use msbuild-antipatterns), non-MSBuild build systems.
- `including-generated-files` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/including-generated-files/SKILL.md` - Fix MSBuild targets that generate files during the build but those files are missing from compilation or output. Only activate in MSBuild/.NET build context. USE FOR: generated source files not compiling (CS0246 for a type that should exist), custom build tasks that create files but they are invisible to subsequent targets, globs not capturing build-generated files because they expand at evaluation time before execution creates them, ensuring generated files are cleaned by the Clean target. Covers correct BeforeTargets timing (CoreCompile, BeforeBuild, AssignTargetPaths), adding to Compile/FileWrites item groups, using $(IntermediateOutputPath) instead of hardcoded obj/ paths. DO NOT USE FOR: C# source generators that already work via the Roslyn pipeline, T4 design-time generation that runs in Visual Studio, non-MSBuild build systems. INVOKES: no tools — pure knowledge skill.
- `incremental-build` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/incremental-build/SKILL.md` - Guide for optimizing MSBuild incremental builds. Only activate in MSBuild/.NET build context. USE FOR: builds slower than expected on subsequent runs, 'nothing changed but it rebuilds anyway', diagnosing why targets re-execute unnecessarily, fixing broken no-op builds. Covers 8 common causes: missing Inputs/Outputs on custom targets, volatile properties in output paths (timestamps/GUIDs), file writes outside tracked Outputs, missing FileWrites registration, glob changes, Visual Studio Fast Up-to-Date Check (FUTDC) issues. Key diagnostic: look for 'Building target completely' vs 'Skipping target' in binlog. DO NOT USE FOR: first-time build slowness (use build-perf-baseline), parallelism issues (use build-parallelism), evaluation-phase slowness (use eval-performance), non-MSBuild build systems. INVOKES: binlog MCP server tools (overview, search, target details); falls back to dotnet build /bl, binlog replay with diagnostic verbosity.
- `item-management` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/item-management/SKILL.md` - Patterns for managing MSBuild item groups: Include/Remove/Update semantics, item metadata, batching with %(Metadata), transforms, per-item filtering, and cross-product batching pitfalls. Only activate in MSBuild/.NET build context. USE FOR: diagnosing and fixing item group anti-patterns in .csproj files, reviewing item management for correctness, fixing CS2002 duplicate file warnings from SDK globbing, fixing targets that run more times than expected due to cross-product batching, fixing Include vs Update misuse on SDK-globbed items, fixing FileWrites registration for generated file clean support, moving generated files to IntermediateOutputPath. DO NOT USE FOR: target chain architecture (use target-authoring), property patterns (use property-patterns), incrementality (use incremental-build), general anti-patterns (use msbuild-antipatterns), non-MSBuild build systems.
- `msbuild-antipatterns` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/msbuild-antipatterns/SKILL.md` - Catalog of MSBuild anti-patterns with detection rules and fix recipes. Only activate in MSBuild/.NET build context. USE FOR: reviewing, auditing, or cleaning up .csproj, .vbproj, .fsproj, .props, .targets, or .proj files. Each anti-pattern has a symptom, explanation, and concrete BAD→GOOD transformation. Covers Exec-instead-of-built-in-task, unquoted conditions, hardcoded paths, restating SDK defaults, scattered package versions, and more. DO NOT USE FOR: non-MSBuild build systems (npm, Maven, CMake, etc.), project migration to SDK-style (use msbuild-modernization).
- `msbuild-modernization` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/msbuild-modernization/SKILL.md` - Guide for modernizing and migrating MSBuild project files to SDK-style format. Only activate in MSBuild/.NET build context. USE FOR: converting legacy .csproj/.vbproj with verbose XML to SDK-style, migrating packages.config to PackageReference, removing Properties/AssemblyInfo.cs in favor of auto-generation, eliminating explicit <Compile Include> lists via implicit globbing, consolidating shared settings into Directory.Build.props. Indicators of legacy projects: ToolsVersion attribute, <Import Project="$(MSBuildToolsPath)">, .csproj files > 50 lines for simple projects. DO NOT USE FOR: projects already in SDK-style format, non-.NET build systems (npm, Maven, CMake), .NET Framework projects that cannot move to SDK-style. INVOKES: dotnet try-convert, upgrade-assistant tools.
- `msbuild-server` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/msbuild-server/SKILL.md` - Guide for using MSBuild Server to improve CLI build performance. Only activate in MSBuild/.NET build context. Activate when developers report slow incremental builds from the command line, or when CLI builds are noticeably slower than IDE builds. Covers MSBUILDUSESERVER=1 environment variable for persistent server-based caching. Do not activate for IDE-based builds (Visual Studio already uses a long-lived process).
- `property-patterns` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/property-patterns/SKILL.md` - MSBuild property definition patterns: conditional defaults, composition/concatenation, path normalization, trailing slash handling, TFM detection helpers, and property evaluation order. Only activate in MSBuild/.NET build context. USE FOR: diagnosing and fixing MSBuild property definition issues in .props or .csproj files, reviewing and fixing shared property configuration anti-patterns, fixing DefineConstants or NoWarn being overwritten instead of appended, fixing unconditional property assignments that prevent project-level overrides, fixing unquoted conditions that fail when properties are empty, fixing hardcoded paths that break cross-platform builds, setting property defaults that can be overridden, understanding property evaluation order and last-write-wins semantics. DO NOT USE FOR: props vs targets placement (use directory-build-organization), item operations (use item-management), target structure (use target-authoring), general anti-patterns (use msbuild-antipatterns), non-MSBuild build systems.
- `resolve-project-references` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/resolve-project-references/SKILL.md` - Guide for interpreting ResolveProjectReferences time in MSBuild performance summaries. Only activate in MSBuild/.NET build context. Activate when ResolveProjectReferences appears as the most expensive target and developers are trying to optimize it directly. Explains that the reported time includes wait time for dependent project builds and is misleading. Guides users to focus on task self-time instead. Do not activate for general build performance -- use build-perf-diagnostics instead.
- `target-authoring` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-msbuild/skills/target-authoring/SKILL.md` - Canonical patterns for writing custom MSBuild targets. Only activate in MSBuild/.NET build context. USE FOR: diagnosing and fixing custom target authoring anti-patterns, reviewing MSBuild target definitions for correctness, diagnosing broken SDK target chains across files (e.g., Directory.Build.targets silently redefining SDK targets), fixing targets that replace CompileDependsOn instead of extending it with $(CompileDependsOn), fixing query targets that return stale results due to Outputs vs Returns misuse, fixing missing Inputs/Outputs causing unnecessary rebuilds, fixing missing FileWrites registration. Covers DependsOnTargets vs BeforeTargets vs AfterTargets, the Build→CoreBuild three-level pattern, hooking into the build pipeline, the $(XxxDependsOn) chain-extension pattern. DO NOT USE FOR: incremental build tuning (use incremental-build), parallelization (use build-parallelism), general anti-patterns (use msbuild-antipatterns), non-MSBuild build systems.
- `convert-to-cpm` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-nuget/skills/convert-to-cpm/SKILL.md` - Convert .NET projects and solutions (.sln, .slnx) to NuGet Central Package Management (CPM) using Directory.Packages.props. USE FOR: converting to CPM, centralizing or aligning NuGet package versions across multiple projects, inlining MSBuild version properties from Directory.Build.props into Directory.Packages.props, resolving version conflicts or mismatches across a solution or repository, updating or bumping or syncing package versions across projects. Also activate when packages are out of sync, drifting, or inconsistent -- even without the user mentioning CPM. Provides baseline build capture, version conflict resolution, build validation with binlog comparison, and a structured post-conversion report. DO NOT USE FOR: packages.config projects (must migrate to PackageReference first) or repositories that already have CPM fully enabled.

- `template-authoring` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-template-engine/skills/template-authoring/SKILL.md` - Guides creation and validation of custom dotnet new templates. Generates templates from existing projects and validates template.json for authoring issues. USE FOR: creating a reusable dotnet new template from an existing project, validating template.json files for schema compliance and parameter issues, bootstrapping .template.config/template.json with correct identity, shortName, parameters, and post-actions, packaging templates as NuGet packages for distribution. DO NOT USE FOR: finding or using existing templates (use template-discovery and template-instantiation), MSBuild project file issues unrelated to template authoring, NuGet package publishing (only template packaging structure).

- `template-comparison` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-template-engine/skills/template-comparison/SKILL.md` - Compares two or more dotnet new templates side by side to help users choose between them based on parameters, feature support, frameworks, and classifications. USE FOR: deciding between similar templates (webapi vs webapp, blazor vs blazorwasm, console vs worker), producing a side-by-side comparison of parameters and feature support, understanding how templates differ before creating a project. DO NOT USE FOR: creating a project from a template (use template-instantiation), authoring or validating custom templates (use template-authoring and template-validation), general single-template discovery (use template-discovery).

- `template-discovery` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-template-engine/skills/template-discovery/SKILL.md` - Helps find, inspect, and compare .NET project templates. Resolves natural-language project descriptions to ranked template matches with pre-filled parameters. USE FOR: finding the right dotnet new template for a task, comparing templates side by side, inspecting template parameters and constraints, understanding what a template produces before creating a project, resolving intent like "web API with auth" to concrete template + parameters. DO NOT USE FOR: actually creating projects (use template-instantiation), authoring custom templates (use template-authoring), comparing templates side by side in detail (use template-comparison), MSBuild or build issues (use dotnet-msbuild plugin), NuGet package management unrelated to template packages.

- `template-instantiation` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-template-engine/skills/template-instantiation/SKILL.md` - Creates .NET projects from templates with validated parameters, smart defaults, Central Package Management adaptation, and latest NuGet version resolution. USE FOR: creating new dotnet projects, scaffolding solutions with multiple projects, installing or uninstalling template packages, creating projects that respect Directory.Packages.props (CPM), composing multi-project solutions (API + tests + library), getting latest NuGet package versions in newly created projects. DO NOT USE FOR: finding or comparing templates (use template-discovery), authoring custom templates (use template-authoring), modifying existing projects or adding NuGet packages to existing projects.

- `template-smart-defaults` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-template-engine/skills/template-smart-defaults/SKILL.md` - Applies cross-parameter default rules when creating .NET projects with dotnet new, filling gaps consistently without overriding values the user set explicitly. USE FOR: choosing sensible defaults for related parameters during project creation, resolving cross-parameter interactions (AOT implies a compatible framework, auth implies HTTPS, controllers excludes minimal-API flags), explaining why a default was applied. DO NOT USE FOR: creating the project itself (use template-instantiation), finding or comparing templates (use template-discovery and template-comparison), authoring or validating custom templates (use template-authoring and template-validation).

- `template-validation` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-template-engine/skills/template-validation/SKILL.md` - Validates custom dotnet new templates for correctness before publishing. Catches missing fields, parameter bugs, shortName conflicts, constraint issues, and common authoring mistakes that cause templates to fail silently. USE FOR: checking template.json files for errors before publishing or testing, diagnosing why a template doesn't appear after installation, reviewing template parameter definitions for type mismatches and missing defaults, finding shortName conflicts with dotnet CLI commands, validating post-action and constraint configuration. DO NOT USE FOR: finding or using existing templates (use template-discovery), creating projects from templates (use template-instantiation), creating templates from existing projects (use template-authoring).

- `assertion-quality` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/assertion-quality/SKILL.md` - Analyzes the variety and depth of assertions across test suites in any language. Use when the user asks to evaluate assertion quality, find shallow testing, identify assertion-free tests (no assertions or only trivial ones like Assert.IsNotNull / toBeTruthy() / assert x is not None), flag self-referential or tautological assertions (output equals input on identity/round-trip operations), measure assertion coverage diversity, or audit whether tests verify different facets of correctness. Produces metrics and actionable recommendations. Polyglot: .NET (MSTest/xUnit/NUnit), Python (pytest), TS/JS (Jest/Vitest), Java, Go, Ruby, Rust, Swift, Kotlin, PowerShell (Pester), C++. DO NOT USE FOR: writing new tests (use code-testing-agent, or writing-mstest-tests for MSTest), anti-patterns like flakiness or duplication, or a general severity-ranked anti-pattern audit even when focused on self-referential / tautological assertions and not asking for assertion-diversity metrics (use test-anti-patterns); fixing assertions.
- `code-testing-agent` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/code-testing-agent/SKILL.md` - Generates and writes new unit tests for any programming language — scaffolds .NET test projects, pytest suites, Vitest/Jest suites, Go test files, and JUnit suites, and configures coverage tooling (coverlet, pytest-cov, @vitest/coverage-v8) as part of test generation. Use when asked to generate tests, generate pytest tests, generate Vitest tests, write unit tests, add tests, improve coverage, comprehensive tests, or scaffold a new test project or suite for an app, service, library, REST API, blueprint, or package — including project-wide, multi-file test generation across services, repositories, routes, and modules. Supports C#/.NET, Python (pytest, Flask/Django), TypeScript/JavaScript (Vitest, Jest, Mocha), Go, Rust, Java (JUnit). Runs a research, planning, and implementation pipeline so tests compile and pass. DO NOT USE FOR: running existing tests (use run-tests); analyzing existing coverage reports (use coverage-analysis or crap-score); MSTest modernization (use writing-mstest-tests).
- `code-testing-extensions` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/code-testing-extensions/SKILL.md` - Provides file paths to language-specific extension files for the code-testing pipeline. Call this skill to discover available extension guidance files (e.g., dotnet.md for .NET, cpp.md for C++). Do not use directly — invoked by code-testing agents and skills that need language-specific references.
- `coverage-analysis` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/coverage-analysis/SKILL.md` - Project-wide code coverage and CRAP (Change Risk Anti-Patterns) score analysis for .NET projects. Calculates CRAP scores per method and surfaces risk hotspots — complex code with low coverage that is dangerous to modify. Use to diagnose why coverage is stuck or plateaued, identify what methods block improvement, or get project-wide coverage analysis with risk ranking. USE FOR: coverage stuck, coverage plateau, can't increase coverage, what's blocking coverage, coverage gap, CRAP scores, risk hotspots, where to add tests, coverage analysis, coverage report. DO NOT USE FOR: targeted single-method CRAP analysis (use crap-score), auditing test code for the "coverage-touching" anti-pattern (tests that execute / call code but assert nothing, inflating coverage without verifying behavior) — that is a test-code quality audit, use test-anti-patterns; writing tests; running tests without coverage, or troubleshooting test execution (use run-tests). This skill requires or produces coverage (Cobertura) and CRAP metrics.

- `crap-score` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/crap-score/SKILL.md` - Calculates targeted CRAP (Change Risk Anti-Patterns) scores for a named .NET method, class, or single source file. Use when the user explicitly asks to compute CRAP scores or assess risky untested code for a specific target, combining Cobertura coverage data with cyclomatic complexity analysis. DO NOT USE FOR: project-wide coverage analysis, coverage plateau or "stuck coverage" diagnosis, what's blocking coverage, or where to add tests across a project (use coverage-analysis); writing tests; running tests without CRAP context.

- `detect-static-dependencies` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/detect-static-dependencies/SKILL.md` - Scan C# source files for hard-to-test static dependencies — DateTime.Now/UtcNow, File.*, Directory.*, Environment.*, HttpClient, Console.*, Process.*, and other untestable statics. Produces a ranked report of static call sites by frequency. USE FOR: find untestable statics, scan for static dependencies, testability audit, identify hard-to-mock code, find DateTime.Now usage, detect static coupling, testability report, static analysis for testability. DO NOT USE FOR: generating wrappers (use generate-testability-wrappers), migrating code (use migrate-static-to-wrapper), general code review, or finding statics that are already behind abstractions.

- `dotnet-test-frameworks` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/dotnet-test-frameworks/SKILL.md` - Reference data for .NET test framework detection patterns, assertion APIs, skip annotations, setup/teardown methods, and common test smell indicators across MSTest, xUnit, NUnit, and TUnit. Loaded by test analysis skills (test-anti-patterns) as framework-specific lookup tables.
- `filter-syntax` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/filter-syntax/SKILL.md` - Reference data for test filter syntax across all platform and framework combinations: VSTest --filter expressions, MTP filters for MSTest/NUnit/xUnit v3/TUnit, and VSTest-to-MTP filter translation. DO NOT USE directly — loaded by run-tests, mtp-hot-reload, and migrate-vstest-to-mtp when they need filter syntax.
- `find-untested-sources-polyglot` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/find-untested-sources-polyglot/SKILL.md` - Polyglot, parse-only static analysis that pairs source files with referencing tests across Python, TypeScript/JavaScript, Go, Java, Rust, C#, and Ruby. JSON shape matches `find-untested-sources`. USE FOR: where to write tests next, find untested files, list sources without tests, polyglot test-pairing map. DO NOT USE FOR: coverage, CRAP risk. For .NET-only repos prefer `find-untested-sources`.

- `find-untested-sources` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/find-untested-sources/SKILL.md` - Parse-only C# analysis that pairs source files with referencing tests and emits JSON: `source_to_tests`, `untested` ordered by declaration count, and `suggested_test_path` from `ProjectReference` edges. USE FOR: where to write tests next, find untested files, list sources without tests, build a test-pairing map. DO NOT USE FOR: coverage (use `coverage-analysis`), CRAP risk ranking, assertion gaps.

- `generate-testability-wrappers` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/generate-testability-wrappers/SKILL.md` - Generate wrapper interfaces and DI registration for hard-to-test static dependencies in C#. Produces IFileSystem, IEnvironmentProvider, IConsole, IProcessRunner wrappers, or guides adoption of TimeProvider and IHttpClientFactory. USE FOR: generate wrapper for static, create IFileSystem wrapper, wrap DateTime.Now, make static testable, make class testable, create abstraction for File.*, generate DI registration, TimeProvider adoption, IHttpClientFactory setup, testability wrapper, mock-friendly interface, mock time in tests, create the right abstraction to mock, how to mock DateTime, test code using File.ReadAllText, what abstraction for Environment, how to make statics injectable, adopt System.IO.Abstractions, make file calls testable. DO NOT USE FOR: detecting statics (use detect-static-dependencies), migrating call sites (use migrate-static-to-wrapper), general interface design not about testability.

- `grade-tests` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/grade-tests/SKILL.md` - Grades a specified set of test methods individually and produces a concise table mapping each test (fully-qualified name) to a letter grade (A–F), a score band, and a one-line note — designed to be posted as a PR comment. Use when the caller wants per-test feedback on a curated list of methods (for example, the new or modified tests in a pull request), not a suite-wide audit. Polyglot: .NET (MSTest/xUnit/NUnit/TUnit), Python (pytest/unittest), TS/JS (Jest/Vitest/Mocha/node:test), Java (JUnit/TestNG), Go, Ruby (RSpec/Minitest), Rust, Swift (XCTest/Swift Testing), Kotlin (JUnit/Kotest), PowerShell (Pester), C++ (GoogleTest/Catch2/doctest). Input is a list of test methods (or method bodies / file+line spans); output is a compact markdown table plus a short summary. DO NOT USE FOR: full suite audits (use test-quality-auditor agent or test-anti-patterns), writing new tests (use code-testing-generator agent or writing-mstest-tests), fixing failures, or measuring code coverage.

- `migrate-mstest-v1v2-to-v3` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/migrate-mstest-v1v2-to-v3/SKILL.md` - Migrate MSTest v1 or v2 test project to MSTest v3. Use when user says "upgrade MSTest", "upgrade to MSTest v3", "migrate to MSTest v3", "update test framework", "modernize tests", "MSTest v3 migration", "MSTest compatibility", "MSTest v2 to v3", or build errors after updating MSTest packages from 1.x/2.x to 3.x. USE FOR: upgrading from MSTest v1 assembly references (Microsoft.VisualStudio.QualityTools.UnitTestFramework) or MSTest v2 NuGet (MSTest.TestFramework 1.x-2.x) to MSTest v3, fixing assertion overload errors (AreEqual/AreNotEqual), updating DataRow constructors, replacing .testsettings with .runsettings, timeout behavior changes, target framework compatibility (.NET 5 dropped -- use .NET 6+; .NET Fx older than 4.6.2 dropped), adopting MSTest.Sdk. First step toward MSTest v4 -- after this, use migrate-mstest-v3-to-v4. DO NOT USE FOR: migrating to MSTest v4 (use migrate-mstest-v3-to-v4), migrating between frameworks (MSTest to xUnit/NUnit), or general .NET upgrades unrelated to MSTest.

- `migrate-mstest-v3-to-v4` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/migrate-mstest-v3-to-v4/SKILL.md` - Fix build errors and breaking changes after upgrading MSTest from v3 to v4, or plan a complete MSTest v3-to-v4 migration. Use when user says "upgrade to MSTest v4", "MSTest 4 migration", "MSTest v4 breaking changes", "tests don't compile after upgrading MSTest", or has errors CS0507, CS0103, CS1061, CS1615 after updating MSTest packages from 3.x to 4.x. USE FOR: Execute to ExecuteAsync, CallerInfo constructor on TestMethodAttribute, sealed custom attributes, ClassCleanupBehavior removal, TestContext.Properties Contains to ContainsKey, Assert.ThrowsException to ThrowsExactly, Assert.IsInstanceOfType out parameter removal, ExpectedExceptionAttribute removal, TestTimeout enum removal, [TestMethod("name")] to DisplayName syntax, TreatDiscoveryWarningsAsErrors, TestContext.TestName in ClassInitialize, MSTest.Sdk MTP changes, dropped TFMs (net6.0/net7.0 to net8.0+). DO NOT USE FOR: migrating from MSTest v1/v2 to v3 (use migrate-mstest-v1v2-to-v3 first), migrating between test frameworks, or general .NET upgrades.

- `migrate-static-to-wrapper` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/migrate-static-to-wrapper/SKILL.md` - Mechanically replace static dependency call sites with wrapper or built-in abstraction calls across a bounded scope (file, project, or namespace). Performs codemod-style bulk replacement of DateTime.UtcNow to TimeProvider.GetUtcNow(), File.ReadAllText to IFileSystem, and similar transformations. Adds constructor injection parameters and updates DI registration. USE FOR: replace DateTime.UtcNow with TimeProvider, replace DateTime.Now with TimeProvider, migrate static calls to wrapper, bulk replace File.* with IFileSystem, codemod static to injectable, add constructor injection for time provider, mechanical migration of statics, refactor DateTime to TimeProvider, swap static for injected dependency, convert static calls to use abstraction, replace statics in a class, migrate one file to TimeProvider, scoped migration, update call sites. DO NOT USE FOR: detecting statics (use detect-static-dependencies), generating wrappers (use generate-testability-wrappers), migrating between test frameworks.

- `migrate-vstest-to-mtp` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/migrate-vstest-to-mtp/SKILL.md` - Migrates .NET test projects from VSTest to Microsoft.Testing.Platform (MTP). Use when user asks to "migrate to MTP", "switch from VSTest", "enable Microsoft.Testing.Platform", "use MTP runner", set OutputType=Exe only for test projects in Directory.Build.props, or mentions EnableMSTestRunner, EnableNUnitRunner, or UseMicrosoftTestingPlatformRunner. USE FOR: MTP behavioral differences vs VSTest (exit code 8, zero tests discovered, --ignore-exit-code, TESTINGPLATFORM_EXITCODE_IGNORE); centralizing MTP properties in Directory.Build.props and conditioning OutputType=Exe to only test projects via MSBuildProjectName, not IsTestProject. Supports MSTest, NUnit, xUnit.net v2 (via YTest.MTP.XUnit2), and xUnit.net v3. Covers runner enablement, CLI argument and filter translation, global.json config, CI/CD updates, and extension packages. DO NOT USE FOR: migrating between test frameworks (MSTest/xUnit/NUnit), xUnit.net v2 to v3 API migration, MSTest version upgrades, TFM upgrades, or UWP/WinUI test projects.

- `migrate-xunit-to-mstest` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/migrate-xunit-to-mstest/SKILL.md` - Migrate .NET test projects from xUnit.net (v2 or v3) to MSTest v4. USE FOR: convert/migrate xUnit tests to MSTest, replace xunit/xunit.v3 packages, port [Fact]/[Theory]/[InlineData]/[MemberData]/[ClassData] to [TestMethod]/[DataRow]/[DynamicData], port Assert.Equal/True/Throws/ThrowsAsync to Assert.AreEqual/IsTrue/ThrowsExactly/ThrowsExactlyAsync, port IClassFixture/ ICollectionFixture/IDisposable/IAsyncLifetime/ITestOutputHelper/[Trait]/[Fact(Skip)] to MSTest equivalents, preserve xUnit parallel-class default via [assembly: Parallelize(Scope = ClassLevel)], remove xunit.runner.json. DO NOT USE FOR: xUnit v2 -> v3 upgrade (use migrate-xunit-to-xunit-v3); MSTest -> xUnit, NUnit/TUnit -> MSTest (no skills exist); MSTest version upgrades (use migrate-mstest-v1v2-to-v3 or migrate-mstest-v3-to-v4); VSTest <-> MTP only (use migrate-vstest-to-mtp); general .NET upgrades.

- `migrate-xunit-to-xunit-v3` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/migrate-xunit-to-xunit-v3/SKILL.md` - Migrates .NET test projects from xUnit.net v2 to xUnit.net v3. USE FOR: upgrading xunit to xunit.v3. DO NOT USE FOR: migrating between test frameworks (MSTest/NUnit to xUnit.net), migrating from VSTest to Microsoft.Testing.Platform (use migrate-vstest-to-mtp). For xUnit v3 MTP filter syntax (--filter-class, --filter-trait, --filter-query), also load migrate-vstest-to-mtp.

- `mtp-hot-reload` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/mtp-hot-reload/SKILL.md` - Suggests using Microsoft Testing Platform (MTP) hot reload to iterate fixes on failing tests without rebuilding. Use when user says "hot reload tests", "iterate on test fix", "run tests without rebuilding", "speed up test loop", "fix test faster", or needs to set up MTP hot reload to rapidly iterate on test failures. Covers setup (NuGet package, environment variable, launchSettings.json) and the iterative workflow for fixing tests. DO NOT USE FOR: writing test code, diagnosing test failures, running tests normally with dotnet test (use run-tests), applying test filters, producing TRX reports, CI/CD pipeline configuration, or Visual Studio Test Explorer hot reload (which is a different feature).

- `platform-detection` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/platform-detection/SKILL.md` - Reference data for detecting the test platform (VSTest vs Microsoft.Testing.Platform) and test framework (MSTest, xUnit, NUnit, TUnit) from project files. DO NOT USE directly — loaded by run-tests, mtp-hot-reload, and migrate-vstest-to-mtp when they need detection logic.
- `run-tests` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/run-tests/SKILL.md` - For `dotnet test`: figures out which test platform (VSTest vs Microsoft.Testing.Platform) a project uses from `Directory.Build.props`, `global.json`, and `.csproj`, then picks the matching command syntax. USE FOR: running, filtering, or troubleshooting `dotnet test`; identifying the test runner/platform from project files; `--` separator rules on .NET SDK 8/9 vs 10+; choosing the right filter syntax for MSTest / xUnit / NUnit / TUnit (--filter, --filter-class, --filter-trait, --filter-query, --treenode-filter); TRX/reporting (--report-trx vs --logger trx); blame/hang/crash diagnostics (--blame-hang-timeout, --blame-crash); running tests against a single target framework when a project targets multiple TFMs (e.g., `<TargetFrameworks>net8.0;net9.0</TargetFrameworks>`, `--framework <TFM>`); and avoiding MTP/VSTest argument mixups (--logger trx on MTP, --report-trx on VSTest, --blame on MTP). DO NOT USE FOR: writing/generating test code, CI/CD config, or debugging failing test logic.

- `test-analysis-extensions` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/test-analysis-extensions/SKILL.md` - Provides file paths to language-specific reference files for the test ANALYSIS skills (assertion-quality, test-anti-patterns, test-gap-analysis, test-smell-detection, test-tagging). Call this skill to discover available extension files (e.g., dotnet.md for .NET/MSTest/xUnit/NUnit/TUnit, python.md for pytest/unittest, typescript.md for Jest/Vitest/Mocha, java.md for JUnit/TestNG, etc.). Do not use directly — invoked by the test-quality-auditor agent and polyglot analysis skills that need framework-specific lookup tables (test markers, assertion APIs, skip annotations, sleep patterns, mystery guest indicators, integration markers, setup/teardown, tag-support capability).
- `test-anti-patterns` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/test-anti-patterns/SKILL.md` - Audits an existing test file or suite in any language for anti-patterns and quality issues — produces a severity-ranked report (Critical/Warning/Info). INVOKE whenever asked to audit or review tests, find what's wrong with a suite, judge whether tests are any good, or check tests for: tests that pass but verify nothing, no/missing assertions, swallowed exceptions, self-comparing/self-referential/ tautological assertions (output==input on round-trip/identity ops), coverage-touching tests (every method called but nothing verified), broad exceptions, flaky or order-dependent tests (Thread.Sleep, DateTime.Now, time.sleep, shared state, reflection coupling), duplicated tests, magic values — in .NET, Python/pytest, TS/Jest, Java, Go, Ruby or C++. DO NOT USE FOR: writing new tests (use code-testing-agent); running tests (use run-tests); migration; assertion-diversity metrics (use assertion-quality); coverage/CRAP metrics (use coverage-analysis); the testsmells.org academic catalog (use test-smell-detection).

- `test-gap-analysis` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/test-gap-analysis/SKILL.md` - Performs pseudo-mutation analysis on production code in any language to find gaps in existing test suites. Use when the user asks to find weak tests, discover untested edge cases, check if tests would catch a bug, or evaluate test effectiveness through mutation-style reasoning. Analyzes production code for mutation points (boundaries, boolean flips, null/None/nil returns, exception/error removal, arithmetic changes) and checks whether tests would detect each mutation. Polyglot: .NET (MSTest/xUnit/NUnit/TUnit), Python (pytest/unittest), TS/JS (Jest/Vitest/Mocha/node:test), Java (JUnit/TestNG), Go, Ruby (RSpec/Minitest), Rust, Swift, Kotlin (JUnit/Kotest), PowerShell (Pester), C++ (GoogleTest/Catch2). DO NOT USE FOR: writing new tests (use code-testing-agent, or writing-mstest-tests for MSTest), detecting anti-patterns (use test-anti-patterns), measuring assertion diversity (use assertion-quality), or running actual mutation testing tools (Stryker, mutmut, PIT, cargo-mutants).
- `test-smell-detection` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/test-smell-detection/SKILL.md` - Deep-dive audit using the full testsmells.org 19-smell academic catalog for tests in any language. Every finding maps to a named, citable smell from the research literature (Assertion Roulette, Duplicate Assert, Mystery Guest, Eager Test, Sensitive Equality, Conditional Test Logic, Sleepy Test, Magic Number Test, etc.) with research-backed severity. Polyglot: .NET (MSTest/xUnit/NUnit/TUnit), Python (pytest/unittest), TS/JS (Jest/Vitest/Mocha/node:test), Java (JUnit/TestNG), Go, Ruby (RSpec/Minitest), Rust, Swift, Kotlin (JUnit/Kotest), PowerShell (Pester), C++ (GoogleTest/Catch2). INVOKE ONLY when explicitly asked for the testsmells.org 19-smell academic catalog or citable smell names from the literature. DO NOT USE FOR: general or pragmatic audits — use test-anti-patterns; writing new tests (use code-testing-agent, or writing-mstest-tests for MSTest); running tests (use run-tests); framework migration.

- `test-tagging` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/test-tagging/SKILL.md` - Analyzes test suites in any language and tags each test with a standardized set of traits (positive, negative, critical-path, boundary, smoke, regression, integration, performance, security). Use when the user wants to categorize, audit, or label tests with traits. Works with .NET (MSTest TestCategory / xUnit Trait / NUnit Category / TUnit Property), Python (pytest markers; unittest has no canonical tag syntax so report-only), TypeScript/JavaScript (Jest/Vitest test names, describe-block conventions), Java (JUnit 5 @Tag / TestNG groups), Go (subtest naming / build tags / file _test.go), Ruby (RSpec metadata), Rust (cargo test naming / cfg attributes), Swift (XCTest test plans / Swift Testing @Tag), Kotlin (JUnit @Tag / Kotest tags), PowerShell (Pester -Tag), C++ (GoogleTest filter prefixes / Catch2 [tags] / doctest decorators). Auto-edits when the framework has canonical syntax; falls back to report-only otherwise. Do not use for writing new tests, running tests, or migrating frameworks.
- `writing-mstest-tests` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-test/skills/writing-mstest-tests/SKILL.md` - Write new MSTest unit tests and fix existing MSTest code using MSTest 3.x/4.x modern APIs and best practices. USE FOR: write or create MSTest unit tests, fix or modernize MSTest assertions, better MSTest assertion than Assert.IsTrue, replace hard cast with MSTest type assertion, MSTest assertion APIs (IsInstanceOfType, Contains, ContainsSingle, HasCount, IsEmpty, IsNotEmpty, DoesNotContain, StartsWith, EndsWith, MatchesRegex, IsGreaterThan, IsInRange, IsNull), fix swapped Assert.AreEqual arguments, replace ExpectedException with Assert.Throws, data-driven tests (DataRow, DynamicData, ValueTuples), test lifecycle (sealed classes, TestInitialize, TestCleanup), async tests and cancellation tokens, test parallelization (Parallelize / DoNotParallelize), MSTest.Sdk project setup. DO NOT USE FOR: broad test quality audits (use test-anti-patterns), running tests (use run-tests), MSTest version migration (use migrate-mstest-v1v2-to-v3 or migrate-mstest-v3-to-v4), xUnit/NUnit/TUnit, or non-.NET languages.

- `dotnet-aot-compat` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-upgrade/skills/dotnet-aot-compat/SKILL.md` - Make .NET projects compatible with Native AOT and trimming by systematically resolving IL trim/AOT analyzer warnings. USE FOR: making projects AOT-compatible, fixing trimming warnings, resolving IL warnings (IL2026, IL2070, IL2067, IL2072, IL3050), adding DynamicallyAccessedMembers annotations, enabling IsAotCompatible. DO NOT USE FOR: publishing native AOT binaries, optimizing binary size, replacing reflection-heavy libraries with alternatives. INVOKES: no tools — pure knowledge skill.

- `migrate-dotnet10-to-dotnet11` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-upgrade/skills/migrate-dotnet10-to-dotnet11/SKILL.md` - Migrate a .NET 10 project or solution to .NET 11 and resolve all breaking changes. This is a MIGRATION skill — use it when upgrading from .NET 10 to .NET 11, NOT for writing new programs. USE FOR: upgrading TargetFramework from net10.0 to net11.0, fixing build errors after updating the .NET 11 SDK, resolving source-breaking and behavioral changes in .NET 11 runtime, C# 15 compiler, and EF Core 11, adapting to updated minimum hardware requirements (x86-64-v2, Arm64 LSE), and updating CI/CD pipelines and Dockerfiles for .NET 11. DO NOT USE FOR: .NET Framework migrations, upgrading from .NET 9 or earlier, greenfield .NET 11 projects, or cosmetic modernization unrelated to the upgrade. NOTE: .NET 11 is in preview. Covers breaking changes through Preview 3.

- `migrate-dotnet8-to-dotnet9` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-upgrade/skills/migrate-dotnet8-to-dotnet9/SKILL.md` - Migrate a .NET 8 project to .NET 9 and resolve all breaking changes. USE FOR: upgrading TargetFramework from net8.0 to net9.0, fixing build errors after updating the .NET 9 SDK, resolving behavioral changes in .NET 9 / C# 13 / ASP.NET Core 9 / EF Core 9, replacing BinaryFormatter (now always throws), resolving SYSLIB0054-SYSLIB0057, adapting to params span overload resolution, fixing C# 13 compiler changes, updating HttpClientFactory for SocketsHttpHandler, and resolving EF Core 9 migration/Cosmos DB changes. DO NOT USE FOR: .NET Framework migrations, upgrading from .NET 7 or earlier, greenfield .NET 9 projects, or cosmetic modernization unrelated to the upgrade.

- `migrate-dotnet9-to-dotnet10` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-upgrade/skills/migrate-dotnet9-to-dotnet10/SKILL.md` - Migrate a .NET 9 project or solution to .NET 10 and resolve all breaking changes. USE FOR: upgrading TargetFramework from net9.0 to net10.0, fixing build errors after updating the .NET 10 SDK, resolving source and behavioral changes in .NET 10 / C# 14 / ASP.NET Core 10 / EF Core 10, updating Dockerfiles for Debian-to-Ubuntu base images, resolving obsoletion warnings (SYSLIB0058-SYSLIB0062), adapting to SDK/NuGet changes (NU1510, PrunePackageReference), migrating System.Linq.Async to built-in AsyncEnumerable, fixing OpenApi v2 API changes, cryptography renames, and C# 14 compiler changes (field keyword, extension keyword, span overloads). DO NOT USE FOR: .NET Framework migrations, upgrading from .NET 8 or earlier (use migrate-dotnet8-to-dotnet9 first), greenfield .NET 10 projects, or cosmetic modernization. LOADS REFERENCES: csharp-compiler, core-libraries, sdk-msbuild (always); aspnet-core, efcore, cryptography, extensions-hosting, serialization-networking, winforms-wpf, containers-interop (selective).

- `migrate-nullable-references` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-upgrade/skills/migrate-nullable-references/SKILL.md` - Enable nullable reference types in a C# project and systematically resolve all warnings. USE FOR: adopting NRTs in existing codebases, file-by-file or project-wide migration, fixing CS8602/CS8618/CS86xx warnings, annotating APIs for nullability, cleaning up null-forgiving operators, upgrading dependencies with new nullable annotations. DO NOT USE FOR: projects already fully migrated with zero warnings (unless auditing suppressions), fixing a handful of nullable warnings in code that already has NRTs enabled, suppressing warnings without fixing them, C# 7.3 or earlier projects. INVOKES: Get-NullableReadiness.ps1 scanner script.

- `thread-abort-migration` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet-upgrade/skills/thread-abort-migration/SKILL.md` - Guides migration of .NET Framework Thread.Abort usage to cooperative cancellation in modern .NET. USE FOR: modernizing code that calls Thread.Abort, catching ThreadAbortException, replacing Thread.ResetAbort, replacing Thread.Interrupt for thread termination, resolving PlatformNotSupportedException or SYSLIB0006 after retargeting to .NET 6+, migrating ASP.NET Response.End or Response.Redirect(url, true) which internally call Thread.Abort. DO NOT USE FOR: code that only uses Thread.Join, Thread.Sleep, or Thread.Start without any abort, interrupt, or ThreadAbortException usage — these APIs work identically in modern .NET and need no migration. Also not for projects staying on .NET Framework, or Thread.Abort usage inside third-party libraries you do not control.

- `csharp-scripts` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet/skills/csharp-scripts/SKILL.md` - Run file-based C# apps with the .NET CLI when the user explicitly wants C#/.NET code without creating a project. Use for C# language/API experiments, one-file C# apps, small multi-file C# apps composed with `#:include`/`#:exclude`, or C# file-based apps linked with `#:ref`. Do not use for language-agnostic throwaway scripts, generic computations, Python/PowerShell-style automation, full projects, or existing app integration.
- `dotnet-pinvoke` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet/skills/dotnet-pinvoke/SKILL.md` - Correctly call native (C/C++) libraries from .NET using P/Invoke and LibraryImport. Covers function signatures, string marshalling, memory lifetime, SafeHandle, and cross-platform patterns. USE FOR: writing new P/Invoke or LibraryImport declarations, reviewing or debugging existing native interop code, wrapping a C or C++ library for use in .NET, diagnosing crashes, memory leaks, or corruption at the managed/native boundary. DO NOT USE FOR: COM interop, C++/CLI mixed-mode assemblies, or pure managed code with no native dependencies.

- `nuget-trusted-publishing` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet/skills/nuget-trusted-publishing/SKILL.md` - Set up NuGet trusted publishing (OIDC) on a GitHub Actions repo — replaces long-lived API keys with short-lived tokens. USE FOR: trusted publishing, NuGet OIDC, keyless NuGet publish, migrate from NuGet API key, NuGet/login, secure NuGet publishing. DO NOT USE FOR: publishing to private feeds or Azure Artifacts (OIDC is nuget.org only). INVOKES: shell (powershell or bash), edit, create, ask_user for guided repo setup.

- `system-text-json-net11` :: `agent-architecture/packages/stacks/stack-csharp/dotnet-skills/plugins/dotnet11/skills/system-text-json-net11/SKILL.md` - Provides guidance on new System.Text.Json APIs introduced in .NET 11. It covers typed JsonTypeInfo access via GetTypeInfo<T> and TryGetTypeInfo<T> on JsonSerializerOptions, and the new JsonNamingPolicy.PascalCase static property. Use when serializing or deserializing JSON in .NET 11 applications and needing typed metadata access or PascalCase property naming.

- `stack-csharp` :: `agent-architecture/packages/stacks/stack-csharp/SKILL.md` - C# and .NET modernization guidance for projects, packages, services, tests,
analyzers, and compatibility assessments.

- `stack-databricks-dbt` :: `agent-architecture/packages/stacks/stack-databricks-dbt/SKILL.md` - dbt on Databricks patterns for models, tests, docs, lineage, and governed
transformations.

- `databricks-agent-bricks` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-agent-bricks/SKILL.md` - Create Agent Bricks: Knowledge Assistants (KA) for document Q&A and Supervisor Agents for multi-agent orchestration (MAS).
- `databricks-ai-functions` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-ai-functions/SKILL.md` - Use Databricks built-in AI Functions (ai_classify, ai_extract, ai_summarize, ai_mask, ai_translate, ai_fix_grammar, ai_gen, ai_analyze_sentiment, ai_similarity, ai_parse_document, ai_query, ai_forecast) to add AI capabilities directly to SQL and PySpark pipelines without managing model endpoints. Also covers document parsing and building custom RAG pipelines (parse → chunk → index → query).
- `databricks-aibi-dashboards` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-aibi-dashboards/SKILL.md` - Create Databricks AI/BI dashboards. Must use when creating, updating, or deploying Lakeview dashboards as Databricks Dashboard have a unique json structure. CRITICAL: You MUST test ALL SQL queries via CLI BEFORE deploying. Follow guidelines strictly.
- `databricks-apps-python` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-apps-python/SKILL.md` - Builds Databricks applications. Prefers AppKit (TypeScript + React SDK) for new apps; falls back to Python frameworks (Dash, Streamlit, Gradio, Flask, FastAPI, Reflex) when Python is required. Handles OAuth authorization, app resources, SQL warehouse and Lakebase connectivity, model serving, foundation model APIs, and deployment. Use when building web apps, dashboards, ML demos, or REST APIs for Databricks, or when the user mentions AppKit, Streamlit, Dash, Gradio, Flask, FastAPI, Reflex, or Databricks app.
- `databricks-dbsql` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-dbsql/SKILL.md` - Databricks SQL (DBSQL) advanced features and SQL warehouse capabilities. This skill MUST be invoked when the user mentions: "DBSQL", "Databricks SQL", "SQL warehouse", "SQL scripting", "stored procedure", "CALL procedure", "materialized view", "CREATE MATERIALIZED VIEW", "pipe syntax", "|>", "geospatial", "H3", "ST_", "spatial SQL", "collation", "COLLATE", "ai_query", "ai_classify", "ai_extract", "ai_gen", "AI function", "http_request", "remote_query", "read_files", "Lakehouse Federation", "recursive CTE", "WITH RECURSIVE", "multi-statement transaction", "temp table", "temporary view", "pipe operator". SHOULD also invoke when the user asks about SQL best practices, data modeling patterns, or advanced SQL features on Databricks.
- `databricks-docs` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-docs/SKILL.md` - Databricks documentation reference via llms.txt index. Use when other skills do not cover a topic, looking up unfamiliar Databricks features, or needing authoritative docs on APIs, configurations, or platform capabilities.
- `databricks-execution-compute` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-execution-compute/SKILL.md` - Execute code and manage compute on Databricks: run Python/Scala/SQL/R via serverless, classic, or interactive clusters, and create/resize/delete clusters and SQL warehouses.
- `databricks-genie` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-genie/SKILL.md` - Create and query Databricks Genie Spaces for natural language SQL exploration. Use when building Genie Spaces, exporting and importing Genie Spaces, migrating Genie Spaces between workspaces or environments, or asking questions via the Genie Conversation API.
- `databricks-iceberg` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-iceberg/SKILL.md` - Apache Iceberg tables on Databricks — Managed Iceberg tables, External Iceberg Reads (fka Uniform), Compatibility Mode, Iceberg REST Catalog (IRC), Iceberg v3, Snowflake interop, PyIceberg, OSS Spark, external engine access and credential vending. Use when creating Iceberg tables, enabling External Iceberg Reads (uniform) on Delta tables (including Streaming Tables and Materialized Views via compatibility mode), configuring external engines to read Databricks tables via Unity Catalog IRC, integrating with Snowflake catalog to read Foreign Iceberg tables
- `databricks-lakeflow-connect` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-lakeflow-connect/SKILL.md` - Build managed ingestion pipelines into Databricks using Lakeflow Connect. Use when ingesting from SaaS apps (Salesforce, Workday Reports, ServiceNow, Google Analytics 4, HubSpot, Confluence) or databases (SQL Server cloud and on-prem; PostgreSQL/MySQL CDC in PuPr) into Unity Catalog with serverless pipelines.
- `databricks-metric-view-advisor` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-metric-view-advisor/SKILL.md` - Use this skill when the user wants to create Unity Catalog metric views — whether starting from gold/fact tables, existing AI/BI dashboards, SQL query files, Genie spaces, or KPI spreadsheets. Triggers on intent like "formalize our KPIs," "build a metric/semantic layer," "define measures and dimensions from our tables," "standardize aggregations so other teams can reuse them," or "turn our ad-hoc queries into reusable metrics." Guides an interactive workflow — analyzing source assets, generating YAML definitions, checking for overlap with existing views, and deploying. Do NOT use for querying or altering an already-existing metric view, comparing metric view frameworks, creating regular Unity Catalog tables/schemas, or MLflow/model tracking.
- `databricks-metric-views` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-metric-views/SKILL.md` - Unity Catalog metric views: define, create, query, and manage governed business metrics in YAML. Use when building standardized KPIs, revenue metrics, order analytics, or any reusable business metrics that need consistent definitions across teams and tools.
- `databricks-mlflow-evaluation` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-mlflow-evaluation/SKILL.md` - MLflow 3 GenAI agent evaluation. Use when writing mlflow.genai.evaluate() code, creating @scorer functions, using built-in scorers (Guidelines, Correctness, Safety, RetrievalGroundedness), building eval datasets from traces, setting up trace ingestion and production monitoring, aligning judges with MemAlign from domain expert feedback, or running optimize_prompts() with GEPA for automated prompt improvement.
- `databricks-python-sdk` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-python-sdk/SKILL.md` - Databricks development guidance including Python SDK, Databricks Connect, CLI, and REST API. Use when working with databricks-sdk, databricks-connect, or Databricks APIs.
- `databricks-spark-structured-streaming` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-spark-structured-streaming/SKILL.md` - Comprehensive guide to Spark Structured Streaming for production workloads. Use when building streaming pipelines, working with Kafka ingestion, implementing Real-Time Mode (RTM), configuring triggers (processingTime, availableNow), handling stateful operations with watermarks, optimizing checkpoints, performing stream-stream or stream-static joins, writing to multiple sinks, or tuning streaming cost and performance.
- `databricks-synthetic-data-gen` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-synthetic-data-gen/SKILL.md` - Generate realistic synthetic data using Spark + Faker (strongly recommended). Supports serverless execution, multiple output formats (Parquet/JSON/CSV/Delta), and scales from thousands to millions of rows. For small datasets (<10K rows), can optionally generate locally and upload to volumes. Use when user mentions 'synthetic data', 'test data', 'generate data', 'demo dataset', 'Faker', or 'sample data'.
- `databricks-unity-catalog` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-unity-catalog/SKILL.md` - Unity Catalog system tables and volumes. Use when querying system tables (audit, lineage, billing) or working with volume file operations (upload, download, list files in /Volumes/).
- `databricks-unstructured-pdf-generation` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-unstructured-pdf-generation/SKILL.md` - Build RAG / unstructured-document evaluation datasets and demo documents (e.g. for Knowledge Assistant) on Databricks: generate synthetic PDFs locally, upload to Unity Catalog volumes, and pair each document with test questions for retrieval evaluation.
- `databricks-zerobus-ingest` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/databricks-zerobus-ingest/SKILL.md` - Build Zerobus Ingest clients for near real-time data ingestion into Databricks Delta tables via gRPC. Use when creating producers that write directly to Unity Catalog tables without a message bus, working with the Zerobus Ingest SDK in Python/Java/Go/TypeScript/Rust, generating Protobuf schemas from UC tables, or implementing stream-based ingestion with ACK handling and retry logic.
- `spark-python-data-source` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/experimental/spark-python-data-source/SKILL.md` - Build custom Python data sources for Apache Spark using the PySpark DataSource API — batch and streaming readers/writers for external systems. Use this skill whenever someone wants to connect Spark to an external system (database, API, message queue, custom protocol), build a Spark connector or plugin in Python, implement a DataSourceReader or DataSourceWriter, pull data from or push data to a system via Spark, or work with the PySpark DataSource API in any way. Even if they just say "read from X in Spark" or "write DataFrame to Y" and there's no native connector, this skill applies.
- `databricks-app-design` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/skills/databricks-app-design/SKILL.md` - Design the UX of Databricks data apps — dashboards, KPI pages, reports, charts, tables, and Genie/chat data assistants — mapped to concrete AppKit components. Use when BUILDING or reviewing any UI that displays data or answers data questions: choosing genre, layout, charts, KPIs, semantic color, required states (loading/empty/error), IBCS notation, and AI-result trust (showing generated SQL/sources for Genie/chat). NOT for authoring managed AI/BI (Lakeview) dashboards (→ databricks-aibi-dashboards), non-data frontend (forms, settings, auth, marketing), or scaffolding/build/deploy (→ databricks-apps). Complements databricks-apps; use it alongside whenever the app has a dashboard, chart, table, KPI, report, or Genie/chat/AI surface.
- `databricks-apps` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/skills/databricks-apps/SKILL.md` - Build apps on Databricks Apps platform. Use when asked to create dashboards, data apps, analytics tools, or visualizations. Evaluates data access patterns (analytics vs Lakebase synced tables) before scaffolding. Invoke BEFORE starting implementation.
- `databricks-core` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/skills/databricks-core/SKILL.md` - Databricks CLI operations and the parent/entry-point skill for all Databricks work: authentication, profile selection, data exploration, bundles, and Genie natural-language data Q&A. Load this first for any Databricks task (CLI, auth, profiles, exploring catalogs/tables), then load the matching product skill. Contains up-to-date guidelines for Databricks-related CLI tasks.
- `databricks-dabs` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/skills/databricks-dabs/SKILL.md` - Create, configure, validate, deploy, run, and manage Declarative Automation Bundles (DABs, formerly Databricks Asset Bundles). Use when working with Databricks resources via DABs including dashboards, jobs, pipelines, alerts, volumes, and apps.
- `databricks-jobs` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/skills/databricks-jobs/SKILL.md` - Develop and deploy Lakeflow Jobs on Databricks via DABs, Python SDK, or the CLI. Use when creating data engineering jobs with notebooks, Python wheels, SQL, dbt, or pipelines. Invoke BEFORE starting implementation.
- `databricks-lakebase` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/skills/databricks-lakebase/SKILL.md` - Databricks Lakebase Postgres: projects, scaling, connectivity, Lakebase synced tables, and Data API. Use when asked about Lakebase databases, OLTP storage, or connecting apps to Postgres on Databricks.
- `databricks-model-serving` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/skills/databricks-model-serving/SKILL.md` - Databricks Model Serving (ops) plus MLflow model development (dev): manage serving endpoints, train and register models to Unity Catalog with @prod aliases, batch-score via spark_udf, build custom PyFunc / ResponsesAgent models, and discover Foundation Model API endpoints.
- `databricks-pipelines` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/skills/databricks-pipelines/SKILL.md` - Develop Lakeflow Spark Declarative Pipelines (formerly Delta Live Tables) on Databricks. Use when building batch or streaming data pipelines with Python or SQL. Invoke BEFORE starting implementation.
- `databricks-serverless-migration` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/skills/databricks-serverless-migration/SKILL.md` - Migrate Databricks workloads from classic compute to serverless compute. Use when migrating notebooks, jobs, pipelines, or Scala JARs (`spark_jar_task`) from classic clusters to serverless, checking if existing code is serverless-compatible, or writing new serverless-compatible code. Provides concrete fixes for the serverless Spark Connect architecture and guides the full migration. Not for classic DBR version upgrades or cluster configuration changes within classic compute.
- `databricks-vector-search` :: `agent-architecture/packages/stacks/stack-databricks/databricks-agent-skills/skills/databricks-vector-search/SKILL.md` - Databricks Vector Search endpoints and indexes for RAG and semantic search; covers index types, search modes, end-to-end RAG patterns
- `stack-databricks` :: `agent-architecture/packages/stacks/stack-databricks/SKILL.md` - Databricks engineering workflows for Asset Bundles, jobs, notebooks, SDK
usage, and governed data access.

- `stack-legacy-frontend` :: `agent-architecture/packages/stacks/stack-legacy-frontend/SKILL.md` - Modernize legacy frontend stacks such as Knockout, YUI, old jQuery widgets,
and ad hoc browser code toward React/TypeScript.

- `stack-postgres` :: `agent-architecture/packages/stacks/stack-postgres/SKILL.md` - Postgres schema, query, migration, performance, and data-governance workflows
with explicit read/write approvals and privacy-safe summaries.

- `stack-python` :: `agent-architecture/packages/stacks/stack-python/SKILL.md` - Python service, library, and data workflow modernization with minimal
dependencies, local tests, packaging hygiene, and privacy-safe execution.

- `stack-react-typescript` :: `agent-architecture/packages/stacks/stack-react-typescript/SKILL.md` - React and TypeScript application modernization, including codemods, Redux
Toolkit patterns, RTK Query, and UI migration checks.

- `stack-spring-ai` :: `agent-architecture/packages/stacks/stack-spring-ai/SKILL.md` - Spring-native AI application patterns using Spring AI and Spring AI examples
as references, without making them core dependencies.

- `stack-spring-boot` :: `agent-architecture/packages/stacks/stack-spring-boot/SKILL.md` - Spring Boot upgrade and API modernization using OpenRewrite recipes,
OpenAPI contracts, and local verification.

- `stack-sql-server` :: `agent-architecture/packages/stacks/stack-sql-server/SKILL.md` - SQL Server schema, T-SQL, stored procedure, job, and application data-access
modernization with governed database access.

- `stack-sqlserver-to-postgres` :: `agent-architecture/packages/stacks/stack-sqlserver-to-postgres/SKILL.md` - SQL Server to Postgres migration planning with T-SQL compatibility checks,
pgloader experiments, and production cutover guardrails.

