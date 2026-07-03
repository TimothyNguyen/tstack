# Skill Catalog

Agent-architecture provides 36 reusable skills organized by category and specialized role.

**[Contributing?](./CONTRIBUTING.md)** See submission process and validation checklist.

---

## By Category

### Core Workflows

- **[`autoplan`](./autoplan/SKILL.md)** - Runs the plan review pipeline before coding begins, then a post-implementation critic gate before surfacing results. *(swe, orchestrate)*
- **[`brainstorming`](./brainstorming/SKILL.md)** - Design-space exploration before coding. Explores user intent, requirements and design through collaborative dialogue. *(swe, orchestrate)*
- **[`canary`](./canary/SKILL.md)** - Privacy-safe canary planning for post-deploy monitoring, rollback signals, *(qa-agent, cloud)*
- **[`careful`](./careful/SKILL.md)** - Destructive command guardrails. Warns before rm -rf, DROP TABLE, force-push, *(migration, cloud)*
- **[`change-router`](./change-router/SKILL.md)** - Routes changed files to the appropriate agent roles using agents/routing.json. *(orchestrate)*
- **[`claude`](./claude/SKILL.md)** - Claude Code host adapter. Covers enterprise-safe tool use, knowledge graph
- **[`codex`](./codex/SKILL.md)** - OpenAI Codex host adapter. Covers how to use this skill pack inside a
- **[`commit`](./commit/SKILL.md)** - Atomic commit discipline for any code change. Enforces Conventional Commits *(swe, migration)*
- **[`context-restore`](./context-restore/SKILL.md)** - Restores previously saved local working context without relying on external services. *(swe, orchestrate)*
- **[`context-save`](./context-save/SKILL.md)** - Captures local working context so a future agent session can resume safely. *(swe, orchestrate)*
- **[`copilot`](./copilot/SKILL.md)** - GitHub Copilot host adapter. Covers how to install this skill pack into a
- **[`doubt-driven-development`](./doubt-driven-development/SKILL.md)** - Challenge assumptions before and during implementation. Surface load-bearing doubts *(swe, qa-agent)*
- **[`guard`](./guard/SKILL.md)** - Applies stricter local safety posture for risky tools and filesystem boundaries. *(swe, migration)*
- **[`health`](./health/SKILL.md)** - Enterprise-safe code health dashboard. Detects and runs approved local quality checks *(swe, qa-agent)*
- **[`investigate`](./investigate/SKILL.md)** - Root-cause investigation workflow for bugs, failing tests, broken integrations, and unexpected behavior. *(swe, qa-agent)*
- **[`learn`](./learn/SKILL.md)** - Knowledge capture workflow. Extracts Q&A flashcards from agent session context. *(swe, qa-agent)*
- **[`learnings`](./learnings/SKILL.md)** - Local project learning workflow. Captures reusable project conventions, pitfalls, decisions, *(swe, orchestrate)*
- **[`pre-commit-review`](./pre-commit-review/SKILL.md)** - Executable skill that runs pre-commit hooks on code to catch style issues *(swe, qa-agent)*
- **[`qa`](./qa/SKILL.md)** - Enterprise-safe QA workflow. Plans and verifies user-facing or service behavior using *(qa-agent, swe)*
- **[`qa-verify`](./qa-verify/SKILL.md)** - Proof-of-done verification gate for AI coding agents. Scans changed files *(qa-agent, swe)*
- **[`receiving-code-review`](./receiving-code-review/SKILL.md)** - Handle code review feedback with technical rigor. Verify before implementing. *(swe, qa-agent)*
- **[`reference-agent-architecture-patterns`](./reference-agent-architecture-patterns/SKILL.md)** - Quick reference for the agent-architecture repo conventions. Covers *(swe, orchestrate)*
- **[`reference-skill-patterns`](./reference-skill-patterns/SKILL.md)** - Repo-local quick reference for the skill-pack pattern this repo uses. *(swe, orchestrate)*
- **[`release`](./release/SKILL.md)** - Policy-gated release preparation workflow. Checks readiness, tests, docs, risk, and rollback *(pm, cloud)*
- **[`release-notes`](./release-notes/SKILL.md)** - Generate privacy-safe release notes from local changes, tests, and docs *(pm, swe)*
- **[`retro`](./retro/SKILL.md)** - Produces a local project retrospective from commits, incidents, decisions, and outcomes. *(pm, orchestrate)*
- **[`review`](./review/SKILL.md)** - Enterprise-safe code review workflow. Reviews diffs and code paths for correctness, *(swe, qa-agent)*
- **[`ship`](./ship/SKILL.md)** - Prepares a human-approved PR, merge, or release handoff. Runs parallel specialist *(swe, cloud)*
- **[`skillify`](./skillify/SKILL.md)** - Turns a repeated local workflow into a reusable skill folder with template files. *(swe, orchestrate)*
- **[`spec`](./spec/SKILL.md)** - Converts product or engineering intent into a scoped, reviewable specification with *(spec-agent, pm)*
- **[`subagent-orchestrator`](./subagent-orchestrator/SKILL.md)** - Plans and materializes local-only subagent manifests for scoped parallel work. *(orchestrate)*
- **[`systematic-debugging`](./systematic-debugging/SKILL.md)** - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts. *(swe, qa-agent)*
- **[`test`](./test/SKILL.md)** - Designs and runs approved automated tests, including Playwright or Selenium when enabled by policy. *(swe, qa-agent)*
- **[`using-agent-skills`](./using-agent-skills/SKILL.md)** - Use when starting any conversation - establishes how to find and use agent-architecture skills, *(swe, orchestrate)*
- **[`verification-before-completion`](./verification-before-completion/SKILL.md)** - Ship-readiness verification workflow. Run verification commands and confirm output *(swe, qa-agent)*
- **[`writing-skills`](./writing-skills/SKILL.md)** - Skill creation and editing using test-driven development. Write test cases first, *(orchestrate)*

---

## By Agent

### `/swe`

25 skills

- [`autoplan`](./autoplan/SKILL.md) - Runs the plan review pipeline before coding begins, then a post-implementation critic gate before surfacing results.
- [`brainstorming`](./brainstorming/SKILL.md) - Design-space exploration before coding. Explores user intent, requirements and design through collaborative dialogue.
- [`commit`](./commit/SKILL.md) - Atomic commit discipline for any code change. Enforces Conventional Commits
- [`context-restore`](./context-restore/SKILL.md) - Restores previously saved local working context without relying on external services.
- [`context-save`](./context-save/SKILL.md) - Captures local working context so a future agent session can resume safely.
- [`doubt-driven-development`](./doubt-driven-development/SKILL.md) - Challenge assumptions before and during implementation. Surface load-bearing doubts
- [`guard`](./guard/SKILL.md) - Applies stricter local safety posture for risky tools and filesystem boundaries.
- [`health`](./health/SKILL.md) - Enterprise-safe code health dashboard. Detects and runs approved local quality checks
- [`investigate`](./investigate/SKILL.md) - Root-cause investigation workflow for bugs, failing tests, broken integrations, and unexpected behavior.
- [`learn`](./learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`learnings`](./learnings/SKILL.md) - Local project learning workflow. Captures reusable project conventions, pitfalls, decisions,
- [`pre-commit-review`](./pre-commit-review/SKILL.md) - Executable skill that runs pre-commit hooks on code to catch style issues
- [`qa`](./qa/SKILL.md) - Enterprise-safe QA workflow. Plans and verifies user-facing or service behavior using
- [`qa-verify`](./qa-verify/SKILL.md) - Proof-of-done verification gate for AI coding agents. Scans changed files
- [`receiving-code-review`](./receiving-code-review/SKILL.md) - Handle code review feedback with technical rigor. Verify before implementing.
- [`reference-agent-architecture-patterns`](./reference-agent-architecture-patterns/SKILL.md) - Quick reference for the agent-architecture repo conventions. Covers
- [`reference-skill-patterns`](./reference-skill-patterns/SKILL.md) - Repo-local quick reference for the skill-pack pattern this repo uses.
- [`release-notes`](./release-notes/SKILL.md) - Generate privacy-safe release notes from local changes, tests, and docs
- [`review`](./review/SKILL.md) - Enterprise-safe code review workflow. Reviews diffs and code paths for correctness,
- [`ship`](./ship/SKILL.md) - Prepares a human-approved PR, merge, or release handoff. Runs parallel specialist
- [`skillify`](./skillify/SKILL.md) - Turns a repeated local workflow into a reusable skill folder with template files.
- [`systematic-debugging`](./systematic-debugging/SKILL.md) - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts.
- [`test`](./test/SKILL.md) - Designs and runs approved automated tests, including Playwright or Selenium when enabled by policy.
- [`using-agent-skills`](./using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-architecture skills,
- [`verification-before-completion`](./verification-before-completion/SKILL.md) - Ship-readiness verification workflow. Run verification commands and confirm output

### `/qa-agent`

15 skills

- [`canary`](./canary/SKILL.md) - Privacy-safe canary planning for post-deploy monitoring, rollback signals,
- [`doubt-driven-development`](./doubt-driven-development/SKILL.md) - Challenge assumptions before and during implementation. Surface load-bearing doubts
- [`health`](./health/SKILL.md) - Enterprise-safe code health dashboard. Detects and runs approved local quality checks
- [`investigate`](./investigate/SKILL.md) - Root-cause investigation workflow for bugs, failing tests, broken integrations, and unexpected behavior.
- [`learn`](./learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`pre-commit-review`](./pre-commit-review/SKILL.md) - Executable skill that runs pre-commit hooks on code to catch style issues
- [`qa`](./qa/SKILL.md) - Enterprise-safe QA workflow. Plans and verifies user-facing or service behavior using
- [`qa-verify`](./qa-verify/SKILL.md) - Proof-of-done verification gate for AI coding agents. Scans changed files
- [`receiving-code-review`](./receiving-code-review/SKILL.md) - Handle code review feedback with technical rigor. Verify before implementing.
- [`reference-agent-architecture-patterns`](./reference-agent-architecture-patterns/SKILL.md) - Quick reference for the agent-architecture repo conventions. Covers
- [`review`](./review/SKILL.md) - Enterprise-safe code review workflow. Reviews diffs and code paths for correctness,
- [`systematic-debugging`](./systematic-debugging/SKILL.md) - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts.
- [`test`](./test/SKILL.md) - Designs and runs approved automated tests, including Playwright or Selenium when enabled by policy.
- [`using-agent-skills`](./using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-architecture skills,
- [`verification-before-completion`](./verification-before-completion/SKILL.md) - Ship-readiness verification workflow. Run verification commands and confirm output

### `/spec-agent`

6 skills

- [`autoplan`](./autoplan/SKILL.md) - Runs the plan review pipeline before coding begins, then a post-implementation critic gate before surfacing results.
- [`brainstorming`](./brainstorming/SKILL.md) - Design-space exploration before coding. Explores user intent, requirements and design through collaborative dialogue.
- [`doubt-driven-development`](./doubt-driven-development/SKILL.md) - Challenge assumptions before and during implementation. Surface load-bearing doubts
- [`learn`](./learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`spec`](./spec/SKILL.md) - Converts product or engineering intent into a scoped, reviewable specification with
- [`using-agent-skills`](./using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-architecture skills,

### `/pm`

7 skills

- [`learn`](./learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`learnings`](./learnings/SKILL.md) - Local project learning workflow. Captures reusable project conventions, pitfalls, decisions,
- [`release`](./release/SKILL.md) - Policy-gated release preparation workflow. Checks readiness, tests, docs, risk, and rollback
- [`release-notes`](./release-notes/SKILL.md) - Generate privacy-safe release notes from local changes, tests, and docs
- [`retro`](./retro/SKILL.md) - Produces a local project retrospective from commits, incidents, decisions, and outcomes.
- [`spec`](./spec/SKILL.md) - Converts product or engineering intent into a scoped, reviewable specification with
- [`using-agent-skills`](./using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-architecture skills,

### `/design-agent`

3 skills

- [`brainstorming`](./brainstorming/SKILL.md) - Design-space exploration before coding. Explores user intent, requirements and design through collaborative dialogue.
- [`learn`](./learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`using-agent-skills`](./using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-architecture skills,

### `/orchestrate`

15 skills

- [`autoplan`](./autoplan/SKILL.md) - Runs the plan review pipeline before coding begins, then a post-implementation critic gate before surfacing results.
- [`brainstorming`](./brainstorming/SKILL.md) - Design-space exploration before coding. Explores user intent, requirements and design through collaborative dialogue.
- [`change-router`](./change-router/SKILL.md) - Routes changed files to the appropriate agent roles using agents/routing.json.
- [`context-restore`](./context-restore/SKILL.md) - Restores previously saved local working context without relying on external services.
- [`context-save`](./context-save/SKILL.md) - Captures local working context so a future agent session can resume safely.
- [`learn`](./learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`learnings`](./learnings/SKILL.md) - Local project learning workflow. Captures reusable project conventions, pitfalls, decisions,
- [`pre-commit-review`](./pre-commit-review/SKILL.md) - Executable skill that runs pre-commit hooks on code to catch style issues
- [`reference-agent-architecture-patterns`](./reference-agent-architecture-patterns/SKILL.md) - Quick reference for the agent-architecture repo conventions. Covers
- [`reference-skill-patterns`](./reference-skill-patterns/SKILL.md) - Repo-local quick reference for the skill-pack pattern this repo uses.
- [`retro`](./retro/SKILL.md) - Produces a local project retrospective from commits, incidents, decisions, and outcomes.
- [`skillify`](./skillify/SKILL.md) - Turns a repeated local workflow into a reusable skill folder with template files.
- [`subagent-orchestrator`](./subagent-orchestrator/SKILL.md) - Plans and materializes local-only subagent manifests for scoped parallel work.
- [`using-agent-skills`](./using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-architecture skills,
- [`writing-skills`](./writing-skills/SKILL.md) - Skill creation and editing using test-driven development. Write test cases first,

### `/security`

10 skills

- [`careful`](./careful/SKILL.md) - Destructive command guardrails. Warns before rm -rf, DROP TABLE, force-push,
- [`guard`](./guard/SKILL.md) - Applies stricter local safety posture for risky tools and filesystem boundaries.
- [`health`](./health/SKILL.md) - Enterprise-safe code health dashboard. Detects and runs approved local quality checks
- [`investigate`](./investigate/SKILL.md) - Root-cause investigation workflow for bugs, failing tests, broken integrations, and unexpected behavior.
- [`learn`](./learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`qa-verify`](./qa-verify/SKILL.md) - Proof-of-done verification gate for AI coding agents. Scans changed files
- [`receiving-code-review`](./receiving-code-review/SKILL.md) - Handle code review feedback with technical rigor. Verify before implementing.
- [`systematic-debugging`](./systematic-debugging/SKILL.md) - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts.
- [`using-agent-skills`](./using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-architecture skills,
- [`verification-before-completion`](./verification-before-completion/SKILL.md) - Ship-readiness verification workflow. Run verification commands and confirm output

### `/migration`

8 skills

- [`careful`](./careful/SKILL.md) - Destructive command guardrails. Warns before rm -rf, DROP TABLE, force-push,
- [`commit`](./commit/SKILL.md) - Atomic commit discipline for any code change. Enforces Conventional Commits
- [`context-restore`](./context-restore/SKILL.md) - Restores previously saved local working context without relying on external services.
- [`context-save`](./context-save/SKILL.md) - Captures local working context so a future agent session can resume safely.
- [`guard`](./guard/SKILL.md) - Applies stricter local safety posture for risky tools and filesystem boundaries.
- [`learn`](./learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`systematic-debugging`](./systematic-debugging/SKILL.md) - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts.
- [`using-agent-skills`](./using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-architecture skills,

### `/data`

4 skills

- [`commit`](./commit/SKILL.md) - Atomic commit discipline for any code change. Enforces Conventional Commits
- [`learn`](./learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`systematic-debugging`](./systematic-debugging/SKILL.md) - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts.
- [`using-agent-skills`](./using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-architecture skills,

### `/cloud`

10 skills

- [`canary`](./canary/SKILL.md) - Privacy-safe canary planning for post-deploy monitoring, rollback signals,
- [`careful`](./careful/SKILL.md) - Destructive command guardrails. Warns before rm -rf, DROP TABLE, force-push,
- [`commit`](./commit/SKILL.md) - Atomic commit discipline for any code change. Enforces Conventional Commits
- [`guard`](./guard/SKILL.md) - Applies stricter local safety posture for risky tools and filesystem boundaries.
- [`health`](./health/SKILL.md) - Enterprise-safe code health dashboard. Detects and runs approved local quality checks
- [`learn`](./learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`release`](./release/SKILL.md) - Policy-gated release preparation workflow. Checks readiness, tests, docs, risk, and rollback
- [`ship`](./ship/SKILL.md) - Prepares a human-approved PR, merge, or release handoff. Runs parallel specialist
- [`systematic-debugging`](./systematic-debugging/SKILL.md) - Exhaustive root-cause investigation for complex bugs stuck after multiple fix attempts.
- [`using-agent-skills`](./using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-architecture skills,

### `/release-agent`

12 skills

- [`canary`](./canary/SKILL.md) - Privacy-safe canary planning for post-deploy monitoring, rollback signals,
- [`careful`](./careful/SKILL.md) - Destructive command guardrails. Warns before rm -rf, DROP TABLE, force-push,
- [`commit`](./commit/SKILL.md) - Atomic commit discipline for any code change. Enforces Conventional Commits
- [`learn`](./learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`pre-commit-review`](./pre-commit-review/SKILL.md) - Executable skill that runs pre-commit hooks on code to catch style issues
- [`qa-verify`](./qa-verify/SKILL.md) - Proof-of-done verification gate for AI coding agents. Scans changed files
- [`release`](./release/SKILL.md) - Policy-gated release preparation workflow. Checks readiness, tests, docs, risk, and rollback
- [`release-notes`](./release-notes/SKILL.md) - Generate privacy-safe release notes from local changes, tests, and docs
- [`retro`](./retro/SKILL.md) - Produces a local project retrospective from commits, incidents, decisions, and outcomes.
- [`ship`](./ship/SKILL.md) - Prepares a human-approved PR, merge, or release handoff. Runs parallel specialist
- [`using-agent-skills`](./using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-architecture skills,
- [`verification-before-completion`](./verification-before-completion/SKILL.md) - Ship-readiness verification workflow. Run verification commands and confirm output

### `/interviewer`

2 skills

- [`learn`](./learn/SKILL.md) - Knowledge capture workflow. Extracts Q&A flashcards from agent session context.
- [`using-agent-skills`](./using-agent-skills/SKILL.md) - Use when starting any conversation - establishes how to find and use agent-architecture skills,

---

## Statistics

| Category | Count |
|----------|-------|
| Core Workflows | 36 |
| **Total** | **36** |

See [METADATA-SCHEMA.md](./METADATA-SCHEMA.md) for skill development and metadata reference.
