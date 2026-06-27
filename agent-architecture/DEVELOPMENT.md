# Agent Architecture Development Workflow

Complete workflow guide for adding, editing, and maintaining skills, MCPs, and agents in agent-architecture.

## Current State Audit (2026-06-27)

### Directory Structure

```
agent-architecture/
├── .agents/                    # Built plugin manifests
├── agents/                     # 15 role-based agents
│   ├── diagram-agent/
│   ├── cloud/
│   ├── data/
│   ├── design-agent/
│   ├── interviewer/
│   ├── migration/
│   ├── orchestrate/
│   ├── pm/
│   ├── qa-agent/
│   ├── release-agent/
│   ├── security/
│   ├── spec-agent/
│   ├── swe/
│   ├── migration-engineer/
│   └── ...
├── adapter-*/                  # 11 MCP adapters (agentcore, docker, databricks, etc.)
├── diagram-*/                  # 9 diagram skills + MCP servers
│   ├── diagram-infrastructure/ (has SKILL.md, server.py, tests, pyproject.toml)
│   ├── diagram-iac/           (has SKILL.md, server.py, pyproject.toml)
│   ├── diagram-cloudformation/(has SKILL.md, server.py, pyproject.toml)
│   ├── diagram-helm/          (has SKILL.md, server.py, pyproject.toml)
│   ├── diagram-generate/
│   ├── diagram-export/
│   ├── diagram-search/
│   ├── diagram-style/
│   └── diagram-validate/
├── stack-*/                    # Domain/stack skills (databricks, aws, etc.)
├── domain-*/                   # Domain skills (mlops, data-governance, etc.)
├── drawio-mcp-python/          # MCP server (v2.0.0)
├── skills/                     # Core skills (104 with SKILL.md)
│   ├── seniorswe-concise/
│   ├── commit/
│   ├── investigate/
│   ├── test/
│   ├── canary/
│   └── ... 100+ more
├── plugins/                    # Plugin/host definitions
├── docs/                       # Documentation
│   ├── METADATA-SCHEMA.md
│   ├── workflows/
│   └── ...
└── tests/                      # Integration tests
```

### Coverage Report

| Category | Count | Status |
|----------|-------|--------|
| **Skills** | 104 | ✅ All have SKILL.md |
| **Python Skills** | 8 | ⚠️ Mixed structure |
| **Agents** | 15 | ✅ All have SKILL.md |
| **Adapter MCPs** | 11 | ⚠️ Missing pyproject.toml |
| **Standalone MCPs** | 1 (drawio-mcp-python) | ✅ Complete |
| **Tests** | ~2 | ⚠️ Need more coverage |

### Python Skills Status

```
✅ COMPLETE (pyproject.toml, __init__.py, server.py):
  - diagram-infrastructure (has tests!)
  - diagram-iac
  - diagram-cloudformation
  - diagram-helm

⚠️ INCOMPLETE:
  - codebase-engine (missing __init__.py)
  - atlassian-docs (missing __init__.py, pyproject.toml)
  - learn (missing all)
  - token-optimizer (missing all)
```

### Adapters Status

```
ALL MISSING: pyproject.toml, __init__.py

adapter-agentcore/
adapter-ag-ui/
adapter-databricks/
adapter-docker-mcp/
adapter-github/
adapter-google-adk/
adapter-langgraph/
adapter-mcp/
adapter-openapi/
adapter-seniorswe-concise/
adapter-strands/
```

---

## Quality Gates: The No-Slop Checklist

### Phase 1: Planning (Before You Code)

**Task: Define New Feature**

- [ ] **Clear scope**: What problem does it solve? Who uses it? When?
- [ ] **Type classification**:
  - [ ] New skill? (add under `skillname/`)
  - [ ] New agent? (add under `agents/agentname/`)
  - [ ] New MCP server? (add under `server-name-mcp/`)
  - [ ] Adapter? (add under `adapter-name/`)
  - [ ] Domain/stack skill? (add under `domain-*/` or `stack-*/`)
- [ ] **Dependency audit**:
  - [ ] What skills does it depend on? (list in metadata.dependencies.skills)
  - [ ] What MCPs does it depend on? (list in metadata.dependencies.mcps)
  - [ ] What packages? (list in pyproject.toml)
  - [ ] Conflicts with existing skills?
- [ ] **Documentation plan**: Where will docs go? README? Examples?
- [ ] **Testing strategy**: How will you verify it works end-to-end?

**Output**: JIRA/issue with title, scope, deps, testing strategy

---

### Phase 2: Structure (Create Files)

**Task: Set Up Project**

**For MARKDOWN-ONLY Skills:**

```
skillname/
├── SKILL.md                    (450-600 lines)
│   ├── Frontmatter (metadata + agents + dependencies)
│   ├── Enterprise Preamble
│   ├── Main skill documentation
│   ├── Examples (with real code)
│   ├── Testing section
│   ├── Architecture section
│   └── Future enhancements
└── (README.md optional if detailed)
```

**Required SKILL.md Frontmatter:**

```yaml
---
name: skillname
version: 0.1.0                  # Start at 0.1.0
description: |
  One-liner (60 chars max).
  Extended description.
agents: [agent-1, agent-2]      # Which agents use this
allowed-tools:                  # Which Claude Code tools it uses
  - Read
  - Bash
  - Grep

metadata:
  category: "category"          # visual-system, iac, data, etc.
  domain: "domain"              # aws, kubernetes, data, etc.
  tier: "recommended"           # core, recommended, experimental
  dependencies:
    mcps:
      - name: mcp-name
        min-version: "1.0.0"
    skills:
      - skill-1
      - skill-2
    packages:
      - package>=1.0
    min-agent-arch-version: "0.1.4"
  training:
    keywords: [k1, k2, k3, ...]
  discovery:
    related-to: [skill-1, skill-2]
  approval-gates:
    policy-required: [gate-1]
  support:
    maintenance-status: "active"
    owner-team: "team-name"
    last-reviewed: "2026-06-27"

optional-skills:
  - optional-skill-1
  - optional-skill-2
---
```

**For PYTHON Skills (MCP Servers):**

```
skillname/
├── SKILL.md                    (400+ lines, same as above)
├── __init__.py                 (__version__ = "0.1.0")
├── pyproject.toml              (with dependencies)
├── server.py                   (FastMCP implementation)
├── models.py                   (Pydantic models)
├── README.md                   (optional, if detailed)
├── tests/
│   ├── __init__.py
│   └── test_skillname.py       (pytest + asyncio tests)
└── examples/
    └── example_usage.py
```

**pyproject.toml Template:**

```toml
[build-system]
requires = ["setuptools>=68.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "skillname"
version = "0.1.0"
description = "One-liner"
requires-python = ">=3.8"
license = { text = "Apache-2.0" }
authors = [{ name = "Agent Architecture" }]
keywords = ["mcp", "keyword1", "keyword2"]

dependencies = [
    "fastmcp>=0.1.0",
    "pydantic>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "pytest-asyncio>=0.21",
]

[tool.setuptools]
packages = ["skillname"]
```

- [ ] Frontmatter complete and valid YAML
- [ ] agent/skill names match folder names (kebab-case)
- [ ] All required metadata fields present
- [ ] Dependencies listed (skills, mcps, packages)
- [ ] Testing section included in SKILL.md
- [ ] Examples with real code (not pseudo-code)
- [ ] Architecture section describing internal flow

---

### Phase 3: Implementation (Write Code)

**For Python Skills:**

#### Code Quality Checklist

- [ ] **Use FastMCP + Pydantic**:
  ```python
  from fastmcp import FastMCP
  from pydantic import BaseModel, Field
  
  mcp = FastMCP("skill-name", "0.1.0")
  
  class InputModel(BaseModel):
      param: str = Field(description="...")
  
  @mcp.tool()
  async def tool_name(param: str) -> str:
      """Tool docstring."""
      ...
  ```

- [ ] **Validate inputs**: All parameters checked
- [ ] **Error messages**: Specific, actionable (not generic)
- [ ] **Logging**: Structured logging, not print()
- [ ] **Type hints**: All functions typed
- [ ] **Docstrings**: Every function has one (one-liner OK)
- [ ] **No hardcoded paths**: Use environment variables
- [ ] **No API keys in code**: Use env vars or config
- [ ] **No external API calls** without timeout + error handling
- [ ] **Cross-platform paths**: Use pathlib.Path, not os.path

#### Testing Checklist

- [ ] Unit tests for each tool (pytest)
- [ ] Async tests for async tools (pytest-asyncio)
- [ ] Edge cases tested (empty strings, None, wrong types)
- [ ] Mocks for external tools (CLI, APIs)
- [ ] Test fixtures for data
- [ ] Coverage > 80% (pytest-cov)

Example test:

```python
import pytest
from skillname.server import tool_function

class TestToolFunction:
    def test_valid_input(self):
        result = tool_function("valid")
        assert result == expected
    
    @pytest.mark.asyncio
    async def test_async_tool(self):
        result = await async_tool("param")
        assert result
    
    def test_error_handling(self):
        with pytest.raises(ValueError):
            tool_function(None)
```

#### Integration Testing

- [ ] Test all dependencies work (MCPs, skills, packages)
- [ ] Test in isolation (no side effects)
- [ ] Test error paths
- [ ] Test with real data (not fixtures)

---

### Phase 4: Documentation (Write Examples)

**SKILL.md Examples Section:**

Must include:
- [ ] **Simple example** (happy path, <10 lines)
- [ ] **Complex example** (real-world, with options)
- [ ] **Error example** (what happens when things go wrong)
- [ ] **Integration example** (how other skills use this)

Example template:

```markdown
## Examples

### Simple: Basic Usage

\`\`\`python
result = await tool_function("input")
# Returns: "output"
\`\`\`

### Complex: With Options

\`\`\`python
result = await tool_function(
    "input",
    option1="value",
    option2=["a", "b"]
)
# Returns: structured result
\`\`\`

### Error Handling

\`\`\`python
result = await tool_function(None)
# Returns: "Error: input required"
\`\`\`

### Integration with Other Skills

Use this with `/diagram-generate`:
\`\`\`
1. Generate diagram with diagram-generate
2. Pass to this skill for processing
3. Export with diagram-export
\`\`\`
```

**README.md (if Python):**

- [ ] Installation instructions
- [ ] Quick start (3-line example)
- [ ] MCP configuration (for clients)
- [ ] Full API docs
- [ ] Known limitations
- [ ] Performance notes
- [ ] Troubleshooting

---

### Phase 5: Validation (Check Everything Works)

**Pre-Commit Checklist:**

```bash
# 1. Validate metadata
npm run check:skills

# 2. Run tests
pytest tests/ -v --cov

# 3. Lint code
flake8 skillname/
black skillname/
mypy skillname/

# 4. Check dependencies resolve
pip install -e ".[dev]"

# 5. Test MCP works
python skillname/server.py --help

# 6. Regenerate skill catalog
npm run build:skills
```

- [ ] SKILL.md parses as valid YAML (frontmatter only)
- [ ] All metadata fields valid
- [ ] All dependencies listed and available
- [ ] Tests pass (pytest)
- [ ] Code formatted (black)
- [ ] Type hints correct (mypy)
- [ ] No unused imports
- [ ] Examples actually work (run them!)
- [ ] README accurate and complete
- [ ] Version bumped in pyproject.toml and SKILL.md

**Integration Validation:**

- [ ] Related skills still work (test dependencies)
- [ ] Agents using this skill still work
- [ ] No conflicts with existing MCPs
- [ ] No breaking changes to APIs

---

### Phase 6: Review (Before Merge)

**Code Review Checklist:**

- [ ] **Scope**: Does it solve the problem?
- [ ] **Quality**: Is it production-ready?
- [ ] **Testing**: Are edge cases covered?
- [ ] **Documentation**: Is it clear for users?
- [ ] **Dependencies**: Are they minimal and necessary?
- [ ] **Performance**: Is it fast enough?
- [ ] **Security**: No hardcoded secrets, no dangerous operations?
- [ ] **Consistency**: Matches codebase style?

**Automated Checks (CI):**

```yaml
# Pre-commit hook checks:
- Metadata validation
- Test coverage (80%+)
- Type checking (mypy)
- Code formatting (black)
- No hardcoded secrets (trufflehog)
- Examples actually work
```

---

### Phase 7: Merge and Release

**Commit Message:**

```
feat(diagram-infrastructure): implement multi-cloud diagrams

- Add support for AWS, GCP, Azure, Kubernetes, hybrid, multi-cloud
- Implement generate_infrastructure_diagram() and list_available_icons() tools
- Port from andrewmoshu/diagram-mcp-server to FastMCP + Pydantic
- Add comprehensive tests (7/7 test suites passing)
- Integration with diagram-agent

Validation:
✓ 30/30 tests passing
✓ 100% feature parity with Node.js version
✓ SKILL.md, server.py, pyproject.toml, tests complete
✓ Integrated into diagram-agent optional-skills
✓ No breaking changes to existing skills

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>
```

**Pre-Merge Checklist:**

- [ ] All tests pass
- [ ] Code reviewed and approved
- [ ] Documentation complete
- [ ] Examples verified working
- [ ] Version bumped
- [ ] Commit message follows Conventional Commits
- [ ] Branch is up to date with main

---

## Editing Existing Skills

### When Changing Code

**Scenario: Fix bug in existing skill**

1. [ ] Create branch: `git checkout -b fix/skillname-bugfix`
2. [ ] Write test that fails (demonstrates bug)
3. [ ] Fix code to make test pass
4. [ ] Bump version: `0.1.0 → 0.1.1` (patch)
5. [ ] Update SKILL.md version
6. [ ] Update CHANGELOG or version section
7. [ ] Commit: `fix(skillname): brief description`
8. [ ] All tests pass
9. [ ] Create PR, get review, merge

**Scenario: Add new feature to existing skill**

1. [ ] Check if feature breaks existing behavior
2. [ ] Write tests for new feature FIRST
3. [ ] Implement feature
4. [ ] Bump version: `0.1.0 → 0.2.0` (minor)
5. [ ] Add to SKILL.md: new tool, new examples
6. [ ] Update optional-skills list in dependent agents
7. [ ] Run full test suite for this skill
8. [ ] Update related skills if needed (dependencies)
9. [ ] Commit: `feat(skillname): add new feature`

### When Changing Metadata

**Scenario: Add new dependency**

Update SKILL.md frontmatter:

```yaml
dependencies:
  skills:
    - new-skill  # Added
  mcps:
    - new-mcp    # Added
```

Then:
- [ ] Verify new-skill works
- [ ] Test integration
- [ ] Update version (minor bump)
- [ ] Run full test suite

**Scenario: Add agent that uses this skill**

Update SKILL.md:

```yaml
agents: [existing-agent, new-agent]  # Added new-agent
```

Then:
- [ ] Verify in new agent's SKILL.md it lists this as dependency
- [ ] Test workflow through new agent
- [ ] No circular dependencies

### When Changing Documentation

**Minor changes (typos, clarification):**
- No version bump needed
- Single commit
- No test changes required

**Major changes (new examples, restructure):**
- Version bump (patch)
- Update examples to reflect current state
- Verify examples work
- Review examples are clear and realistic

---

## Deleting Skills

**Scenario: Deprecate old skill**

1. [ ] Check what depends on it:
   ```bash
   grep -r "skillname" agents/ --include="SKILL.md"
   grep -r "skillname" */SKILL.md
   ```

2. [ ] Remove from dependent agents' skill lists
3. [ ] Update SKILL.md status: "deprecated"
4. [ ] Add deprecation notice:
   ```markdown
   **Status: DEPRECATED**
   Use [new-skill](../new-skill) instead.
   Removal date: 2026-12-31
   ```

5. [ ] Create migration guide (if needed)
6. [ ] Commit: `docs(skillname): mark deprecated, use new-skill instead`
7. [ ] Wait 3 months for adoption of replacement
8. [ ] Then remove directory entirely

**Hard delete (breaking change):**
- [ ] Only if no skills depend on it
- [ ] Update all agents
- [ ] Major version bump (3.0.0)
- [ ] Release notes explain the removal
- [ ] Migration path documented

---

## Audit Checklist: For Every Skill

Run monthly:

```bash
#!/bin/bash
# audit-skills.sh

PASS=0
FAIL=0

for skill in */SKILL.md; do
  dir=$(dirname "$skill")
  
  # Check frontmatter
  if ! grep -q "^name:" "$skill"; then
    echo "FAIL: $dir - missing name"
    ((FAIL++))
    continue
  fi
  
  # Check agents listed
  if ! grep -q "^agents:" "$skill"; then
    echo "FAIL: $dir - missing agents"
    ((FAIL++))
    continue
  fi
  
  # Check dependencies section
  if ! grep -q "dependencies:" "$skill"; then
    echo "WARN: $dir - no dependencies listed"
  fi
  
  # Check last-reviewed
  REVIEWED=$(grep "last-reviewed:" "$skill" | cut -d'"' -f2)
  if [ -z "$REVIEWED" ]; then
    echo "WARN: $dir - no last-reviewed date"
  fi
  
  # If Python skill, check structure
  if [ -f "$dir/server.py" ]; then
    [ -f "$dir/__init__.py" ] || echo "FAIL: $dir - missing __init__.py"
    [ -f "$dir/pyproject.toml" ] || echo "FAIL: $dir - missing pyproject.toml"
    [ -d "$dir/tests" ] || echo "WARN: $dir - no tests directory"
  fi
  
  ((PASS++))
done

echo ""
echo "Audit complete: $PASS checked, $FAIL failed"
```

---

## Installation: Package Assembly

When package is installed, all skills must be available:

```bash
npm install agent-architecture

# This should:
# 1. Copy all SKILL.md files to ~/.architecture-agent/skills/
# 2. Install all Python dependencies (pyproject.toml)
# 3. Register all MCPs in MCP config
# 4. Register all agents
# 5. Validate metadata
```

**Installation manifest (package.json):**

```json
{
  "name": "agent-architecture",
  "version": "0.1.4",
  "scripts": {
    "install": "npm run validate:skills && npm run install:skills && npm run install:mcps",
    "validate:skills": "node scripts/validate-metadata.mjs",
    "install:skills": "node scripts/install-skills.mjs",
    "install:mcps": "node scripts/install-mcps.mjs"
  },
  "files": [
    "*/SKILL.md",
    "*/server.py",
    "*/pyproject.toml",
    "docs/",
    "scripts/"
  ]
}
```

---

## Current Violations to Fix

### Immediate (Critical)

1. **Adapters missing pyproject.toml** (11 adapters)
   - Priority: HIGH
   - Impact: Cannot install as packages
   - Fix: Add pyproject.toml to each adapter

2. **Incomplete Python skills** (4 skills)
   - Priority: HIGH
   - Impact: Cannot import or test
   - Skills:
     - codebase-engine (missing __init__.py)
     - atlassian-docs (missing __init__.py, pyproject.toml)
     - learn (missing all)
     - token-optimizer (missing all)

### Short-term (1 month)

3. **Diagram skills missing tests** (3 skills)
   - diagram-cloudformation, diagram-helm, diagram-iac
   - Add pytest test files

4. **Incomplete READMEs** (30+ skills)
   - Priority: MEDIUM
   - Add examples, usage, config

5. **Outdated metadata** (50+ skills)
   - Update last-reviewed dates
   - Add missing keywords
   - Verify agents still accurate

---

## Preventing AI Slop

### Golden Rules

1. **Every change must have a test**
   - No test = won't merge
   - TDD: write test first, then code

2. **Every SKILL.md must have real examples**
   - Not pseudo-code
   - Run before commit
   - Show input and actual output

3. **Every Python skill must have types**
   - Full type hints or mypy fails
   - Pydantic models for MCP inputs
   - Return types on all functions

4. **Every tool must validate inputs**
   - Check for None, empty strings, wrong types
   - Return specific error messages
   - Don't silently fail

5. **Every agent must list all dependencies**
   - Check agents/ SKILL.md matches skills used
   - Validate no circular dependencies
   - Test full workflow end-to-end

6. **Every MCP must have timeout + error handling**
   - CLI calls must timeout (30s max)
   - API calls must have retry + backoff
   - All errors must be caught and reported

7. **Version bumping is mandatory**
   - New feature = minor bump (0.2.0)
   - Bug fix = patch bump (0.1.1)
   - Breaking change = major bump (1.0.0)
   - Update in: pyproject.toml AND SKILL.md

8. **Commits must follow Conventional Commits**
   - `feat(scope): description`
   - `fix(scope): description`
   - `docs(scope): description`
   - No commits like "update" or "fix bug"

### CI/CD Checks (Pre-Commit)

```yaml
# .githooks/pre-commit
- Metadata validation (YAML syntax, required fields)
- Test passing (pytest)
- Code coverage (>80%)
- Type checking (mypy)
- Code formatting (black)
- No secrets (trufflehog)
- Version bumped (if code changed)
- Examples work (run them!)
- No AI slop (manual review)
```

### Manual Review Gate

Before merge, answer these questions:

- [ ] **Would a user understand this from the examples?**
- [ ] **Could someone else maintain this code?**
- [ ] **Are error messages helpful (not cryptic)?**
- [ ] **Is this the simplest solution (not over-engineered)?**
- [ ] **Does it follow existing patterns in the codebase?**
- [ ] **Are there edge cases not covered?**
- [ ] **Is there unnecessary code to delete?**

If answer to ANY is "no", request changes.

---

## Next Actions

### Immediate (This Week)

- [ ] Add pyproject.toml to all 11 adapters
- [ ] Fix 4 incomplete Python skills
- [ ] Add tests to 3 diagram skills

### Short-term (This Month)

- [ ] Audit all 104 skill metadata (update last-reviewed)
- [ ] Update all examples to be real (not pseudo)
- [ ] Add missing READMEs (30+)
- [ ] Set up CI/CD validation hooks

### Long-term (This Quarter)

- [ ] 100% test coverage for Python skills
- [ ] Deprecation process for old skills
- [ ] Automatic installation validation
- [ ] Performance benchmarking

---

## References

- [METADATA-SCHEMA.md](./docs/METADATA-SCHEMA.md) - Frontmatter spec
- [CONTRIBUTING.md](./docs/CONTRIBUTING.md) - Contribution workflow
- [SKILL-VALIDATION-CHECKLIST.md](./docs/SKILL-VALIDATION-CHECKLIST.md) - QA gates
- [SECURITY-REVIEW-CHECKLIST.md](./docs/SECURITY-REVIEW-CHECKLIST.md) - Security gates

---

**Last Updated:** 2026-06-27
**Maintained By:** Agent Architecture Team
**Status:** Active
