Repository Change Governance Workflow

Every addition, deletion, refactor, or modification to this repository MUST follow this workflow. This workflow is mandatory. Do not skip phases, even for “small” changes.

⸻

Core Principles

* The repository must always remain deployable.
* Every commit must leave the repository in a working state.
* Every feature must follow the repository contract.
* Every change must be deterministic.
* Every change should be independently reviewable.
* Prefer extending existing functionality over creating new functionality.
* Repository consistency is more important than implementation speed.

⸻

Phase 0 — Repository Discovery (Required)

Before making any edits:

1. Analyze the repository architecture.
2. Identify affected modules.
3. Identify all dependent Skills.
4. Identify dependent Agents.
5. Identify dependent MCP servers.
6. Identify dependent Adapters.
7. Identify tests that will be impacted.
8. Identify documentation that must change.
9. Search for existing implementations before creating anything new.

Output:

* Files impacted
* Dependencies
* Risks
* Proposed implementation
* Commit plan

No code should be written until this phase is complete.

⸻

Phase 1 — Existing Capability Search

Before creating:

* Skill
* Agent
* Adapter
* MCP Server
* Prompt
* Utility
* Workflow
* Schema
* Test

Search the repository for similar functionality.

Questions to answer:

* Does this already exist?
* Can it be extended?
* Can functionality be merged?
* Can duplication be removed?

If an existing implementation is suitable:

Reuse it.

Do not duplicate functionality.

⸻

Phase 2 — Repository Contract Validation

Every capability must follow the repository contract. Files must not be placeholders.

Expected structure:

feature/
README.md (non-corrupted, readable, substantive documentation)
SPEC.md (formal contract specification with required sections)
TMPL.md (template or configuration for this component)
SKILL.md or SKILL.md.tmpl (skill definition with full metadata)
CHANGELOG.md (version history with all changes documented)
src/ (implementation with substantive code)
tests/ (test suite with minimum 80% code coverage)
integration/ (integration tests verifying component contracts)
fixtures/ (test data and example inputs)
examples/ (working end-to-end examples)
schemas/ (JSON schemas or type definitions)
prompts/ (system prompts or LLM instructions)
config/ (configuration templates)

Required files per component type (ALL MUST HAVE SUBSTANTIVE CONTENT):

Skill:
- README.md ✓ (250+ words, not placeholder)
- SPEC.md ✓ (full specification, not stub)
- SKILL.md ✓ (complete metadata, examples)
- tests/ ✓ (minimum 5 tests, 80%+ coverage)
- examples/ ✓ (minimum 2 working examples)
- CHANGELOG.md ✓ (all versions documented)

Adapter:
- README.md ✓ (250+ words, explains why it exists)
- SPEC.md ✓ (source/target interfaces, transformations)
- SKILL.md ✓ (complete metadata, dependencies)
- tests/ ✓ (minimum 8 tests covering happy/error paths)
- integration/ ✓ (end-to-end integration tests)
- examples/ ✓ (minimum 3 working examples)
- CHANGELOG.md ✓ (version history)

Agent:
- README.md ✓ (250+ words, agent purpose and capabilities)
- SPEC.md ✓ (input/output contracts, execution flow)
- SKILL.md ✓ (skills, tools, MCPs, workflow)
- examples/ ✓ (minimum 3 usage scenarios)
- tests/ ✓ (integration tests via root-level suite)
- CHANGELOG.md ✓ (changes and skill updates)

Quality Gate - File Content Validation:

README.md:
- No template artifacts (.Groups[1].Value, ${}, etc.)
- Readable without preprocessing
- Minimum 200 words (not stub)
- References SPEC.md and SKILL.md
- Includes "Quick Start" section
- Includes "Examples" or "Usage" section
- Includes links to SPEC.md and SKILL.md

SPEC.md (Production Completeness):
REQUIRED SECTIONS (all must be substantive, not placeholders):

## Purpose
[One paragraph explaining why this component exists and what problem it solves]

## Inputs
[Detailed list of all parameters with types, formats, constraints, examples]

## Outputs
[Detailed description of all return values, side effects, state changes, formats]

## Dependencies
[Complete list of required components: MCP servers, adapters, skills, tools]

## Failure Modes
[What can go wrong? How does component behave on errors?]
- [Error condition 1]: [handling, recovery, side effects]
- [Error condition 2]: [handling, recovery, side effects]
- [Timeout behavior]: [what happens if operation takes too long]
- [Invalid input behavior]: [what happens with malformed input]

## Performance Expectations
- Latency: [expected response time ranges]
- Throughput: [maximum operations per second/minute]
- Resource usage: [CPU, memory, network requirements]
- Scalability: [does it degrade under load? How?]

## Security Considerations
- Authentication: [what authentication is required?]
- Authorization: [what authorization checks apply?]
- Data handling: [PII, secrets, sensitive data policies]
- Network isolation: [internal/external boundaries]
- Credential management: [how are credentials stored/rotated?]

## Extension Points
[How can this component be extended? What patterns exist?]

## Acceptance Criteria
[What must be true for this component to be considered "working"?]

## Examples
[Minimum 2 working examples with expected outputs]

Reject any SPEC.md that lacks these sections or contains placeholder content.

⸻

Phase 3 — Ownership Validation

Contract Documentation: Every component must define inputs, outputs, dependencies, and usage patterns.

Every Skill must have (in SKILL.md or SPEC.md):

* Owning Agent (agents: field in frontmatter)
* Documented inputs (## Inputs section - parameters, config, data formats)
* Documented outputs (## Outputs section - results, side effects, formats)
* Required MCP servers (## Dependencies section)
* Required adapters
* Examples (## Examples section with at least one usage example)
* Tests (tests/ directory with unit and integration tests)

Every Agent must document (in SKILL.md):

* Skills consumed (## Declared Skills section with descriptions)
* Tools used (## Tools section - formal list with purposes)
* MCP dependencies (## MCPs section - formal list)
* Execution flow (## Workflow section - step-by-step execution)
* Input format (what configuration/parameters does the agent accept?)
* Output format (what artifacts does the agent produce?)

Every MCP server must document (in SKILL.md and SPEC.md):

* Resources (what data can be accessed?)
* Tools (what operations are available?)
* Prompts (what system instructions or examples?)
* Authentication (how to authenticate? Required credentials?)
* Timeouts (what are timeout limits?)
* Retry strategy (what retries are automatic?)
* Health checks (how to verify server is operational?)

Every Adapter must explain (in SKILL.md and SPEC.md):

* Source interface (what data format/structure does it accept as input?)
* Target interface (what data format/structure does it produce as output?)
* Why the adapter exists (problem it solves, integration boundary it bridges)
* Supported transformations (what conversions does it perform?)
* Error handling (what happens on malformed input?)
* Examples (how to use it in practice?)

SPEC.md Template (required for all components):

```
# Component Name Specification

## Purpose
[One sentence explaining why this exists]

## Input Contract
- Parameter 1: [type, format, example]
- Parameter 2: [type, format, example]

## Output Contract
- Result 1: [type, format, example]
- Result 2: [type, format, example]

## Dependencies
- [List MCP servers, adapters, other components]

## Interface Boundary
[For adapters: source system → [transformation] → target system]

## Error Cases
- [Error condition 1]: [handling strategy]
- [Error condition 2]: [handling strategy]

## Examples
[Concrete usage example]
```

⸻

Phase 4 — Documentation Synchronization

Whenever code changes:

Update:

README

SPEC

TMPL

Examples

Architecture documentation

Diagrams (if applicable)

Changelog

No implementation is complete until documentation matches reality.

⸻

Phase 4.5 — Component Maturity Declaration

Every component must declare its lifecycle state. This determines which governance gates apply.

Maturity Levels:

Draft
- Experimental code, not for production
- Governance relaxed: SPEC.md can be partial, tests optional
- Must declare in README: "⚠ DRAFT - NOT FOR PRODUCTION"
- Cannot be included in core agent catalog
- Expires: 60 days without advancement

Experimental
- Tested internally, API may change
- Governance relaxed: SPEC.md sections can be partial, 50%+ test coverage
- Must declare in README: "🧪 EXPERIMENTAL - API SUBJECT TO CHANGE"
- Can be referenced by agents but marked experimental
- Must have CHANGELOG with date added

Beta
- Feature-complete, preparing for stability
- Governance normal: Full SPEC.md, 80%+ test coverage, examples
- Must declare in README: "🚀 BETA - APPROACHING STABILITY"
- Can be used in production with caveats
- Must have deprecation plan if major changes pending

Stable
- Production-ready, API locked
- Governance strict: All Phase 2/3 gates, 90%+ coverage, performance validated
- Must declare in README: "✓ STABLE - PRODUCTION READY"
- Can be used in production without caveats
- Breaking changes only in major versions
- Must maintain backwards compatibility for 2 versions

Deprecated
- No longer recommended, scheduled for removal
- Must declare in README: "⛔ DEPRECATED - [REASON]. REMOVE BY [DATE]."
- Governance: Keep working but no new features
- Migrate users to replacement component
- Set removal deadline (minimum 6 months notice)

Archived
- No longer maintained, kept for reference only
- Move to archive/ directory
- Update README: "📦 ARCHIVED - HISTORICAL REFERENCE ONLY"
- No support, no updates, read-only

Maturity affects Phase 6 enforcement:
- Draft/Experimental: Relaxed gates (file presence only)
- Beta: Normal gates (SPEC completeness, 80%+ tests)
- Stable: Strict gates (all requirements, 90%+ tests, performance)
- Deprecated/Archived: No new changes (maintenance only)

⸻

Phase 4.6 — Dependency Graph & Duplication Validation

Before finalizing changes, regenerate and validate:

Dependency Graph Validation:

1. Regenerate dependency map
   - Component → MCP servers
   - Component → Adapters
   - Component → Skills
   - Component → Tools
   - Component → Prompts

2. Detect cycles
   Validate: No circular dependencies (A → B → A)
   If found: Refactor to break cycle

3. Detect orphans
   Validate: Every component is consumed by at least one agent
   If found: Either integrate or archive

4. Detect isolated subgraphs
   Validate: No disconnected component clusters
   If found: Document justification or integrate

Architectural Duplication Detection:

Scan repository for:

* Duplicate prompts (>80% similarity = consolidate or justify)
* Duplicate workflows (>80% similarity = extract shared logic)
* Duplicate system prompts (exact or near-exact = reuse)
* Duplicate adapters (different names, same transformation = merge)
* Duplicate business logic (>75% code similarity = extract utility)
* Duplicate schemas (>90% structure match = unify)

For each duplicate found:

1. Determine if intentional (documented justification required)
2. If unintentional: Consolidate into single source of truth
3. Update all references to point to consolidated version
4. Add deprecation notice to original with pointer to canonical version
5. Document consolidation in CHANGELOG

Output: Dependency graph (visual or JSON) showing all connections, cycles, orphans.

⸻

Phase 4.7 — Registration & Wiring Validation

New components must be discoverable and integrated.

For every new Skill:

✓ Appears in agent registry
✓ At least one agent declares it in Declared Skills
✓ Appears in documentation (skills catalog)
✓ Referenced by examples
✓ Accessible via tool invocation
✓ Appears in version history (CHANGELOG)

For every new Adapter:

✓ Registered in adapter registry
✓ Referenced by at least one skill or agent
✓ Appears in documentation (adapter catalog)
✓ Integration tests verify it's wired correctly
✓ Example shows how to enable and use
✓ Appears in version history (CHANGELOG)

For every new Agent:

✓ Registered in agent registry
✓ Discoverable via CLI or API
✓ Has entry in documentation (agents catalog)
✓ Skills are wired and tested
✓ MCPs are discovered and configured
✓ Appears in version history (CHANGELOG)

For every new MCP:

✓ Registered in MCP registry
✓ Discoverable by agents
✓ Health checks pass
✓ Authentication is configured
✓ Tools are exported correctly
✓ Appears in version history (CHANGELOG)

Detection: After every change, run:

```bash
npm run check:registration    # Verify all components are wired
npm run check:discoverable    # Verify all components are discoverable
npm run check:exports         # Verify exports are correct
npm test                      # Integration tests prove it works
```

If any check fails, the component is not considered complete.

⸻

Phase 5 — Repository Metrics & Health Dashboard

After every change, generate and commit repository metrics.

Required Metrics:

```
Repository Health Dashboard
Generated: [ISO timestamp]
Commit: [hash]

INVENTORY
═════════════════════════════════════════════════════════════════════
Skills (total):                    [N]
  - Stable:                        [N] ✓
  - Beta:                          [N] ~
  - Experimental:                  [N] 🧪
  - Draft:                         [N] ⚠
  - Deprecated:                    [N] ⛔
  - Archived:                      [N] 📦

Agents (total):                    [N]
  - Actively used:                 [N] ✓
  - In development:                [N] 🧪
  - Deprecated:                    [N] ⛔

Adapters (total):                  [N]
  - Stable:                        [N] ✓
  - Experimental:                  [N] 🧪
  - Deprecated:                    [N] ⛔

MCP Servers (total):               [N]
  - Operational:                   [N] ✓
  - In beta:                       [N] ~
  - Offline:                       [N] ✗

DOCUMENTATION COMPLETENESS
═════════════════════════════════════════════════════════════════════
README.md (no placeholders):       [%] (target: 100%)
SPEC.md (full, no stubs):         [%] (target: 100%)
TMPL.md (present):                [%] (target: 100%)
SKILL.md (complete metadata):     [%] (target: 100%)
CHANGELOG.md (entries):           [%] (target: 100%)
examples/ (working code):         [%] (target: 100%)

TEST COVERAGE
═════════════════════════════════════════════════════════════════════
Components with tests:            [%] (target: 100%)
Minimum 80% coverage:             [%] (target: 100%)
Minimum 90% coverage:             [%] (target: 50% of Stable)
Integration tests passing:        [count]
Example tests passing:            [count]

HEALTH METRICS
═════════════════════════════════════════════════════════════════════
Orphaned components:              [count] (target: 0)
Circular dependencies:            [count] (target: 0)
Duplicate implementations:        [count] (target: 0)
Unused files:                     [count] (target: 0)
Broken documentation links:       [count] (target: 0)
Stale examples:                   [count] (target: 0)
TODOs without tracking:           [count] (target: 0)
Components >1000 LOC:             [count] (target: <5%)

REGISTRATION VALIDATION
═════════════════════════════════════════════════════════════════════
Registered components:            [count]
Discoverable components:          [count]
Properly exported:                [count]
Actually used by agents:          [count]
Unreferenced components:          [count] (candidates for archive)

QUALITY SCORE (by maturity)
═════════════════════════════════════════════════════════════════════
Stable components:
  Average coverage:               [%] (target: 90%+)
  Average doc completeness:       [%] (target: 100%)
  Average age:                    [months] (if >12: security audit needed)

Beta components:
  Average coverage:               [%] (target: 80%+)
  Average doc completeness:       [%] (target: 95%)
  Planned graduation date:        [date]

Experimental components:
  Count aging >90 days:           [count] (should mature or be archived)

TREND ANALYSIS
═════════════════════════════════════════════════════════════════════
Components added this month:      [count]
Components deprecated:            [count]
Components archived:              [count]
Test coverage trend:              [↑/→/↓] (should trend ↑)
Doc completeness trend:           [↑/→/↓] (should trend ↑)
Technical debt trend:             [↑/→/↓] (should trend ↓)
```

Treat this dashboard like a health scorecard. Commit it alongside code changes.

⸻

Phase 5.5 — Dependency Graph Regeneration

Generate and commit these artifacts:

1. dependencies.json
   ```json
   {
     "components": {
       "skill-name": {
         "type": "skill",
         "maturity": "stable",
         "dependencies": ["mcp-github", "adapter-openapi"],
         "dependents": ["agent-swe", "agent-orchestrate"],
         "skills": ["skill-a", "skill-b"]
       }
     },
     "cycles": [],
     "orphans": [],
     "metrics": {
       "total_components": 120,
       "isolated_subgraphs": 0
     }
   }
   ```

2. agents.json (agent → skills → MCPs mapping)
3. mcps.json (MCP → tools → resources mapping)
4. adapters.json (adapter → source → target)

Run validation after every change:

```bash
npm run validate:dependencies    # No cycles, no orphans
npm run validate:registration   # All components registered
npm run validate:coverage       # Test coverage meets targets
npm run validate:documentation # SPEC.md completeness
npm run check:health           # Overall repository health
```

If any validation fails, the change is incomplete.

⸻

Phase 6 — Repository Quality Gates

Verify:

PRODUCTION COMPLETENESS (not placeholder files):

Every SPEC.md has all 8 required sections (Purpose, Inputs, Outputs, Dependencies, Failure Modes, Performance, Security, Extension Points, Examples)
Every README.md has >200 words and substantial content (not stub)
Every component has working examples that execute without modification
Every component declares maturity level (Draft/Experimental/Beta/Stable/Deprecated)

Code Quality:

No dead code
No duplicate implementations (>80% similarity = consolidate)
No duplicate prompts (>80% match = reuse)
No duplicate workflows (>75% similarity = extract)
No duplicate adapters (same transformation = merge)
No circular dependencies
No orphaned components (not referenced by any agent)
No unused files or configuration
No broken imports
No inconsistent naming
No TODOs without tracking issue

Component-Level Documentation:

All skills/adapters/agents have complete README.md (250+ words, substantive)
All skills/adapters/agents have complete SPEC.md (all required sections)
All skills/adapters/agents have SKILL.md with full metadata
All skills/adapters/agents have TMPL.md (or configuration template)
All adapters document source/target interfaces and transformations
All agents document skills, tools, MCPs, execution flow, input/output contracts
All skills/adapters document error handling and failure modes
No template artifacts in any generated files (.Groups[1].Value, ${}, etc.)

Test Coverage:

Component-level tests: 80%+ code coverage minimum (90%+ for Stable)
Integration tests: Verify components work together as documented
Contract tests: Inputs/outputs match SPEC.md exactly
Example tests: All documentation examples must execute successfully
Performance tests: Verify performance meets expectations from SPEC.md
Security tests: Verify authentication/authorization work as documented
Regression tests: No breaking changes to published interfaces
Error path tests: All failure modes from SPEC.md are tested

Registration & Wiring:

All new skills appear in agent registry
All new adapters appear in adapter registry
All new agents appear in agent registry
All new MCPs appear in MCP registry
All registrations have passing integration tests
All referenced components are actually used
No "zombie" components (created but never integrated)
No stale references to archived components

Documentation Quality:

All examples are current and execute successfully
All links are functional (no 404s in documentation)
All contracts match implementation (SPEC.md == actual behavior)
All dependencies are documented (no hidden MCPs, adapters, or skills)
All error cases are documented in SPEC.md
All security considerations are documented
All performance expectations are documented
Changelog documents all changes since last version

Repository Metrics:

Orphaned components: 0
Circular dependencies: 0
Duplicate implementations: 0
Unused files: 0
Broken documentation links: 0
Stale examples: 0
TODOs without tracking: 0
Test coverage: ≥80% (≥90% for Stable components)
Documentation completeness: ≥95%
All components have declared maturity level
Health dashboard is current and committed

⸻

Phase 6.5 — PR Review Checklist (Pre-Submission)

Before opening a PR, verify:

ARCHITECTURE REVIEW:
☐ No new cycles detected in dependency graph
☐ No orphaned components created
☐ No duplicate implementations without justification
☐ Reuses existing components where possible
☐ Extends rather than duplicates existing functionality
☐ Architecture diagram updated (if applicable)
☐ Design decisions documented in PR description
☐ Trade-offs explained (performance, complexity, maintenance)

DOCUMENTATION REVIEW:
☐ README.md is substantial (>200 words) and non-placeholder
☐ SPEC.md has all 8 required sections with concrete content
☐ SKILL.md has complete metadata and examples
☐ TMPL.md exists with actual template or configuration
☐ CHANGELOG.md documents all changes
☐ Examples are working (tested, not stale)
☐ All links are functional
☐ All contracts in SPEC.md match implementation exactly

TEST REVIEW:
☐ Tests cover happy path
☐ Tests cover all error cases documented in SPEC.md
☐ Tests cover boundary conditions
☐ Test coverage ≥80% (≥90% for Stable maturity)
☐ Integration tests verify wiring
☐ Examples execute without modification
☐ All tests pass locally
☐ Performance meets SPEC.md expectations

DEPENDENCY REVIEW:
☐ All dependencies documented in SPEC.md
☐ No hidden dependencies (no code references undocumented MCPs/adapters)
☐ No circular dependencies introduced
☐ Dependency graph updated and validated
☐ New dependencies are appropriate (not over-engineered)

SECURITY REVIEW:
☐ SPEC.md documents authentication requirements
☐ SPEC.md documents authorization requirements
☐ SPEC.md documents PII/secrets handling
☐ No credentials committed
☐ No insecure defaults
☐ Error messages don't leak sensitive information
☐ All documented security considerations are tested

PERFORMANCE REVIEW:
☐ SPEC.md documents latency expectations
☐ SPEC.md documents throughput expectations
☐ SPEC.md documents resource requirements
☐ Performance tested (not just assumed)
☐ No performance regressions
☐ Scalability considered (degrades gracefully under load)

COMMIT SIZE REVIEW:
☐ Each commit is one logical change
☐ Each commit is ~5-10 files
☐ Each commit is ~100-300 lines changed
☐ Repository builds after each commit
☐ Tests pass after each commit
☐ Commits are independently reviewable
☐ Commits are independently revertible

REPOSITORY HEALTH REVIEW:
☐ Health metrics generated and current
☐ No metrics have degraded (coverage, doc completeness, etc.)
☐ Orphans count hasn't increased
☐ Cycles count is zero
☐ Duplicate implementations are zero
☐ TODOs without tracking are zero
☐ Stale examples count is zero
☐ Overall health score maintained or improved

REGISTRATION VALIDATION:
☐ New skills appear in agent registry
☐ New adapters appear in adapter registry
☐ New agents appear in agent registry
☐ New MCPs appear in MCP registry
☐ All registrations have passing integration tests
☐ npm run check:registration passes
☐ npm run check:discoverable passes
☐ npm run check:exports passes

If any checkbox is unchecked, the work is not ready for review.

⸻

Phase 7 — Commit Planning

Never create large commits.

Target:

* One logical change
* Approximately 5–10 files
* Approximately 100–300 lines changed
* Repository builds successfully after each commit

Split work into phases such as:

Commit 1

Repository scaffolding

Commit 2

Implementation

Commit 3

Tests

Commit 4

Documentation

Commit 5

Integration

Commit 6

Cleanup

Every commit should be independently reviewable and revertible.

⸻

Phase 8 — Validation

Before completing work verify:

✓ Repository builds

✓ Tests pass

✓ Lint passes

✓ Formatting passes

✓ Type checking passes

✓ Examples execute

✓ Agent registration works

✓ MCP registration works

✓ Documentation is synchronized

✓ TMPL exists

✓ No broken links

✓ No duplicate implementations

⸻

Phase 8.5 — CI/CD Enforcement

Do not rely on Claude remembering the workflow. Encode enforcement in CI.

Required CI Checks:

```yaml
# .github/workflows/governance.yml
- name: Check file structure
  run: npm run check:structure
  # Verify README.md, SPEC.md, SKILL.md, tests/ exist for all components

- name: Check documentation quality
  run: npm run check:docs
  # Verify SPEC.md has all required sections with substantive content
  # Verify README.md is >200 words, not placeholder
  # Verify TMPL.md exists
  # Verify no template artifacts (.Groups[1].Value, etc.)

- name: Check test coverage
  run: npm run check:coverage
  # Fail if any component <80% coverage (<90% for Stable)
  # Report per-component coverage

- name: Check dependencies
  run: npm run check:dependencies
  # Verify no circular dependencies
  # Verify no orphaned components
  # Verify dependency graph is acyclic

- name: Check registration
  run: npm run check:registration
  # Verify all components are registered
  # Verify all components are discoverable
  # Verify exports are correct

- name: Check duplication
  run: npm run check:duplication
  # Detect >80% similar code/prompts/workflows
  # Fail if unintentional duplication found

- name: Check documentation links
  run: npm run check:links
  # Verify no broken links in documentation
  # Verify all referenced components exist

- name: Check repository health
  run: npm run check:health
  # Generate health dashboard
  # Fail if metrics have degraded
  # Fail if health score is below acceptable threshold

- name: Run tests
  run: npm test
  # All unit tests pass
  # All integration tests pass
  # All example tests pass

- name: Check formatting
  run: npm run lint:format
  # Markdown lint
  # Code formatting
  # Naming consistency

- name: Check types
  run: npm run check:types
  # TypeScript type checking (if applicable)
  # Schema validation

- name: Validate maturity
  run: npm run check:maturity
  # Verify all components have declared maturity level
  # Verify maturity level is current (not stale)
  # Verify governance requirements match maturity level
```

CI should FAIL the build if any check fails. Do not allow human override.

⸻

Phase 9 — Repository Scorecard (End of Every Task)

After completing all work, generate and commit a scorecard:

```
REPOSITORY SCORECARD
Generated: [ISO timestamp]
Commit: [hash]
Work completed: [task description]

QUALITY DIMENSIONS
═════════════════════════════════════════════════════════════════════

ARCHITECTURE                          Score: [9/10] (Excellent)
  ✓ No circular dependencies
  ✓ No orphaned components
  ✓ Appropriate abstractions
  ~ Could extract 1 shared utility (optional)

DOCUMENTATION                         Score: [10/10] (Excellent)
  ✓ All README.md files complete (>200 words each)
  ✓ All SPEC.md files have required 8 sections
  ✓ All examples work and are current
  ✓ No broken links
  ✓ Contracts match implementation

TESTING                               Score: [10/10] (Excellent)
  ✓ 92% code coverage (target: 80%+)
  ✓ All error paths tested
  ✓ All examples execute successfully
  ✓ Integration tests comprehensive
  ✓ Performance meets expectations

MAINTAINABILITY                       Score: [9/10] (Excellent)
  ✓ Consistent naming across codebase
  ✓ No oversized modules (max: 1000 LOC)
  ✓ Clear separation of concerns
  ~ Could document 1 non-obvious pattern

DETERMINISM                           Score: [10/10] (Excellent)
  ✓ No randomness or timing dependencies
  ✓ Error handling explicit and documented
  ✓ All side effects documented
  ✓ Failure modes tested
  ✓ Reproducible builds

REUSABILITY                           Score: [9/10] (Excellent)
  ✓ Components have clear interfaces
  ✓ No component-specific hacks in shared code
  ✓ Adapters properly abstract integration points
  ~ Could generalize 1 adapter for broader use (optional)

CI/CD READINESS                       Score: [10/10] (Excellent)
  ✓ All governance checks pass
  ✓ Build succeeds on clean repo
  ✓ Tests pass consistently
  ✓ Deployment ready
  ✓ Rollback plan documented

TECHNICAL DEBT                        Status: [Low] (1 item)
  Item 1: [Non-blocking optimization noted for future, no impact]

OVERALL HEALTH                        [Green] ✓
  All critical gates pass
  Health metrics trending positively
  Repository ready for production use

REQUIRED FOLLOW-UP (if any):
  ☐ [Only include if governance gate was waived]
  ☐ [Document which gate and justification]
  ☐ [Set deadline for resolution]

SIGN-OFF:
  Completed by: Claude Code
  Reviewed by: [Staff SWE name]
  Approved by: [Tech Lead name]
  Date: [ISO date]
```

Threshold Check:

If ANY category scores below 8/10:
- Work is NOT complete
- Deficiencies must be addressed
- OR explicitly documented and approved by Staff SWE

Scorecard must be reviewed and approved before merging.

⸻

Phase 9 — Final Architectural Review

Before declaring work complete, perform one final review.

Answer:

Did this introduce duplication?

Did this simplify the repository?

Can another feature reuse this?

Should this become a shared utility?

Should this become a Skill?

Should this become an Adapter?

Should this become an MCP?

Should documentation be reorganized?

Should tests be generalized?

Would a Staff Engineer approve this change?

If any answer suggests improvement, implement it before finishing.

⸻

Required Output Format

For every request produce:

1. Repository Analysis

* Current architecture (with dependency graph)
* All existing implementations (reuse opportunities)
* Risks (architectural, performance, security)
* Orphaned components
* Cycles or bottlenecks
* Technical debt inventory

2. Implementation Plan

Broken into independently mergeable phases (see Phase 7).

Each phase should:
* Change 1 logical aspect
* Affect ~5-10 files
* Affect ~100-300 lines
* Keep repository building after each commit
* Have passing tests after each commit

3. Pre-Submission Checklist

Complete Phase 6.5 PR Review Checklist for all changes.

4. Validation Report

Report on EVERY validation step:

* ✓/✗ Build succeeds
* ✓/✗ All tests pass (coverage ≥80%)
* ✓/✗ Lint/format checks pass
* ✓/✗ Type checking passes (if applicable)
* ✓/✗ Documentation is complete (no placeholders)
* ✓/✗ SPEC.md has all 8 required sections
* ✓/✗ Examples work as documented
* ✓/✗ Registration validation passes
* ✓/✗ Dependency graph is acyclic
* ✓/✗ No orphaned components
* ✓/✗ No unintentional duplication (>80% similarity)
* ✓/✗ Repository health metrics maintained or improved

5. Repository Metrics

Include metrics from Phase 5.5:

```
Skills: [N] (Stable: [N], Beta: [N], Experimental: [N], Draft: [N], Deprecated: [N])
Agents: [N]
Adapters: [N]
MCPs: [N]
Documentation: [%]%
Test Coverage: [%]%
Orphans: [count]
Cycles: [count]
Duplication: [count]
```

6. Repository Scorecard

Generate scorecard from Phase 9:

```
Architecture:          [X]/10 (status)
Documentation:        [X]/10 (status)
Testing:              [X]/10 (status)
Maintainability:      [X]/10 (status)
Determinism:          [X]/10 (status)
Reusability:          [X]/10 (status)
CI/CD Readiness:      [X]/10 (status)
Overall Health:       [Green/Yellow/Red]
```

If any score is <8/10, work is NOT complete without remediation.

7. Technical Debt & Follow-up

Document:

* Remaining issues
* Deferred improvements (with justification)
* Follow-up PRs needed (with tracking issues)
* Performance improvements for future
* Optional enhancements (not blocking)

⸻

Non-Negotiable Rules

QUALITY & COMPLETENESS (Enforce with CI):

* Never publish components with placeholder documentation (stub files, incomplete SPEC.md)
* Never create SPEC.md without all 8 required sections (Purpose, Inputs, Outputs, Dependencies, Failure Modes, Performance, Security, Extension Points, Examples)
* Never create README.md with <200 words or placeholder content
* Never generate files that contain template artifacts (.Groups[1].Value, ${}, <%=, <#=, etc.)
* Never publish components without examples that work as documented
* Never publish components without declared maturity level (Draft/Experimental/Beta/Stable/Deprecated)
* Never merge code with <80% test coverage (<90% for Stable components)
* Never merge code without passing all CI gates (Phase 6.5 checklist)
* Never commit untracked TODOs (all TODOs must reference issues)

ARCHITECTURE & HEALTH:

* Never duplicate functionality without explicit justification in PR
* Never create >80% similar code/prompts/workflows without consolidation
* Never introduce circular dependencies
* Never leave orphaned components (every component must be used by at least one agent)
* Never create abstractions without demonstrated need (first use: copy; second use: abstract)
* Never leave repository health metrics degraded (coverage, doc completeness, orphans, cycles)
* Never approve a PR that includes "zombie" components (created but not integrated)

GOVERNANCE & PROCESS:

* Never skip a phase (all 9 phases + PR checklist required, no exceptions)
* Never leave repository in broken state (each commit must build, tests must pass)
* Never mix unrelated changes in a single commit
* Never omit required documentation (README.md, SPEC.md, SKILL.md, TMPL.md, tests/, examples/)
* Never publish adapters without documenting source interface, target interface, why it exists
* Never publish agents without input/output contracts and complete skill documentation
* Never merge without repository scorecard (Phase 9) showing all scores ≥8/10

ANTI-PATTERNS:

* Never document in comments what should be in SPEC.md
* Never create "utils" or "helpers" directories (extract to named components instead)
* Never reference archived components without migration path
* Never bypass CI checks or override failed tests
* Never rely on implicit behavior (all side effects, error handling, timeouts must be explicit)
* Never create vendor lock-in (require explicit justification + alternatives in SPEC.md)

DESIGN PRINCIPLES:

* Prefer consistency over cleverness
* Prefer deterministic behavior over convenience
* Prefer composition over inheritance
* Prefer reusable modules over feature-specific code
* Prefer explicit error handling over silence
* Prefer documented contracts over inferred behavior
* Prefer measurable over estimated (test, don't assume)

DECISION MAKING:

* If uncertain, stop and present options rather than making assumptions
* If documentation is vague, treat it as a bug (fix the docs, not the code)
* If a pattern appears twice, consider if it should be third-time abstract
* If a component isn't used, archive it (don't let it rot)
* If health metrics decline, treat as regression (fix before merging)
* If staff engineer would not approve it, do not merge it

⸻

Common Governance Violations & Detection

Violation 1: Template Artifacts in Generated Files

Detection:
Search generated markdown for: .Groups[1].Value, ${}, <%=, <#=

Impact: Phase 2 failure (README.md quality gate)

Fix: Regenerate from template with correct substitution engine

Violation 2: Missing SPEC.md Files

Detection:
Run: find . -name "SKILL.md" ! -name "*.tmpl" | while read f; do [ ! -f "${f%SKILL.md}SPEC.md" ] && echo "Missing: $f"; done

Impact: Phase 3 failure (no input/output contracts)

Fix: Create SPEC.md with input/output/dependency documentation

Violation 3: Missing Component-Level Tests

Detection:
Run: find . -path "./tests" -prune -o -name "SKILL.md" ! -name "*.tmpl" -print | while read f; do dir=$(dirname "$f"); [ ! -d "$dir/tests" ] && echo "No tests: $dir"; done

Impact: Phase 5/6 failure (no verification of component behavior)

Fix: Create tests/ directory in component with unit/integration tests

Violation 4: Incomplete Phase 3 Documentation

Detection:
SKILL.md missing these sections:
- Skill: ## Inputs, ## Outputs, ## Examples
- Agent: ## Tools, ## MCPs, ## Inputs, ## Outputs
- Adapter: "Source interface", "Target interface", "Why this exists"

Impact: Phase 3 failure (incomplete ownership documentation)

Fix: Add required sections with concrete examples and type information

⸻

This workflow is mandatory for every repository change, including additions, deletions, edits, refactors, renames, dependency updates, documentation changes, and generated code. Treat it as the repository’s governance policy and enforce it before, during, and after every modification.