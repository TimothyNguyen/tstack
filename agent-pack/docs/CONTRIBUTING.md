# Contributing Skills to agent-pack

Guide for adding new skills, agents, and workflows to agent-pack with full validation and testing.

## Overview

agent-pack is designed for **principal engineers** to extend systematically. New skills require:

1. ✅ Clear charter (purpose, agents, use cases)
2. ✅ TDD-based workflow (test RED, write skill GREEN, refactor)
3. ✅ Metadata completion (discovery, dependencies, training)
4. ✅ Security review (no egress, no credentials, policy gates)
5. ✅ Documentation (examples, patterns, migration guides)
6. ✅ Code review + merge

**Goal:** Maintain quality and consistency across 100+ skills without creating tribal knowledge.

---

## Skill Submission Process

### Step 1: Proposal (GitHub Issue)

Open issue with skill charter:

```markdown
## Skill Proposal: My Skill

**Purpose:** Clear one-liner describing what this skill does.

**Agents:** Which agents use this? (swe, design-agent, orchestrate, etc.)

**Use Cases:**
- User says "X" → agent invokes this skill
- User says "Y" → agent invokes this skill
- etc.

**External Dependencies:**
- MCP servers? (drawio-mcp, github-mcp, etc.)
- Other skills? (diagram-export, spec, etc.)
- CLI tools? (git, npm, docker, etc.)

**Reference Skills:** Similar skills to review for patterns?

**Approval:** Who will security-review this? (Usually team lead or @TimothyNguyen)
```

**Example:**

```markdown
## Skill Proposal: diagram-generate

**Purpose:** Generate Draw.io diagrams from text descriptions.

**Agents:** design-agent, spec-agent, orchestrate

**Use Cases:**
- "Draw the architecture" → generate diagram from text spec
- "Create a flowchart" → convert description to flowchart
- "Visualize the data flow" → generate data flow diagram

**External Dependencies:**
- MCP: drawio-mcp (1.0.0+)
- Skills: diagram-export (optional), diagram-validate (optional)

**Reference Skills:** design-html, documentation

**Approval:** @design-systems team
```

### Step 2: Scaffold Skill Directory

Once proposal is approved, create skill skeleton:

```bash
npm run scaffold:skill -- --name diagram-generate --agents design-agent,spec-agent,orchestrate
```

**Creates:**

```
diagram-generate/
  SKILL.md.tmpl          # Template (you edit this)
  SKILL.md               # Generated (do not edit)
  sections/
    manifest.json        # Optional: metadata for sections
    (other sections...)
```

### Step 3: Write Tests First (RED)

Create `tests/diagram-generate.test.mjs` with pressure scenarios:

```javascript
import test from "node:test";
import assert from "node:assert";

test("diagram-generate skill forces agent to request diagram type", async (t) => {
  // SCENARIO: User says "Draw this architecture" without specifying type
  // RED: Agent can't comply without skill
  // GREEN: Skill teaches agent to ask "flowchart? sequence? architecture?"
  
  const userRequest = "Draw the login architecture";
  
  // Pressure test: does agent follow skill's workflow?
  // Test passes when skill is present and agent complies.
  // Test fails when skill is absent (RED phase).
});

test("diagram-generate skill validates input format", async (t) => {
  // Skill should teach agent to check:
  // - Is description detailed enough? (>= 50 chars)
  // - Is diagram type specified? (flowchart, ER, sequence, etc.)
  // - Are swimlanes needed? (for sequence diagrams)
});

test("diagram-generate exports SVG preview inline", async (t) => {
  // Skill output includes embedded SVG preview + MCP invocation result
});
```

**Run test (should FAIL without skill):**

```bash
npm test -- tests/diagram-generate.test.mjs
```

### Step 4: Write Skill Template (GREEN)

Edit `diagram-generate/SKILL.md.tmpl`:

```yaml
---
name: diagram-generate
version: 0.1.0
description: |
  Generate Draw.io diagrams from text descriptions.
  Supports flowchart, architecture, ER, sequence, class diagrams.
allowed-tools: [Read, Bash, Grep]
agents: [design-agent, spec-agent, orchestrate]

metadata:
  category: "visual-system"
  domain: null
  tier: "recommended"
  dependencies:
    mcps:
      - name: drawio-mcp
        min-version: "1.0.0"
    skills: []
    min-agent-arch-version: "0.1.4"
  training:
    keywords: [diagram, architecture, flowchart, visual]
  discovery:
    related-to: [design-html, diagram-export]
  approval-gates:
    policy-required: [mcp-egress]
  support:
    maintenance-status: "active"
    owner-team: "design-systems"
    last-reviewed: "2026-06-26"
---

{{PREAMBLE}}

# Diagram Generation

Generate Draw.io diagrams from plain-text descriptions.

## Checklist

1. **Understand requirements**
   - [ ] Ask: What type of diagram? (flowchart, architecture, ER, sequence, class, state)
   - [ ] Ask: What's the scope? (how many components/actors/entities?)
   - [ ] Ask: Are swimlanes needed? (for sequence diagrams)

2. **Validate input**
   - [ ] Description >= 50 characters? If not, ask user to elaborate.
   - [ ] Diagram type is one of: flowchart, architecture, ER, sequence, class, state, mind-map, Gantt
   - [ ] All key actors/entities named

3. **Generate diagram**
   - [ ] Invoke `/diagram-agent` or use MCP directly
   - [ ] MCP call: `create_diagram` with format (XML or Mermaid)
   - [ ] Capture SVG preview from response

4. **Validate output**
   - [ ] All labeled elements present
   - [ ] Connections complete (no dangling edges)
   - [ ] Swimlanes correct (for sequence diagrams)
   - [ ] Ask user: "Does this match your intent?"

5. **Export and save**
   - [ ] Save to `.drawio` file in project
   - [ ] Generate SVG/PNG preview
   - [ ] Commit with message: `feat: add [diagram-name] diagram`

## Anti-Patterns

- ❌ Generating without asking diagram type first
- ❌ Creating overly detailed diagrams (>15 components)
- ❌ Using XML when Mermaid would be simpler
- ❌ Exporting before user approves

## Policy Requirements

- **MCP Egress:** drawio-mcp requires explicit policy approval for diagram generation
- **Data Privacy:** Never include PII, credentials, or confidential data in diagrams
```

**Run test (should PASS with skill):**

```bash
npm test -- tests/diagram-generate.test.mjs
```

### Step 5: Add Examples and Patterns

Create `diagram-generate/references/examples.md`:

```markdown
# Diagram Generation Examples

## Example 1: Simple Flowchart

**User Request:** "Draw a login flow"

**Skill Process:**
1. Ask: "Should this include 2FA?"
2. Ask: "Error paths? (invalid credentials, account locked, etc.)"
3. Generate flowchart with decision nodes
4. Show SVG preview

**Output:**
- `.drawio` file
- SVG preview
- Ready for use in docs or spec
```

### Step 6: Metadata Validation

Verify your frontmatter:

```bash
npm run validate:metadata -- diagram-generate/SKILL.md.tmpl
```

**Checks:**
- Required fields present (name, version, description, agents)
- Metadata schema valid (if provided)
- Agent names valid
- Dependency skills exist
- Policy names valid

### Step 7: Security Review Checklist

Self-review against `docs/SECURITY-REVIEW-CHECKLIST.md`:

- [ ] No public egress by default
- [ ] No telemetry, update checks, tunnels
- [ ] No credential reads
- [ ] MCP invocations declared in frontmatter
- [ ] Destructive operations gated by policy
- [ ] No shell injection vulnerabilities
- [ ] No unredacted file paths in examples

### Step 8: Build and Verify Freshness

```bash
npm run build:skills
npm run check:skills
```

**Verifies:**
- Template renders without placeholders
- Generated `SKILL.md` is current
- Registry includes your skill
- Agent skill declarations updated

### Step 9: Full Test Suite

```bash
npm test
```

**Validates:**
- Your new skill test passes
- No regressions in existing 363 tests
- Metadata validation passes
- Agent routing correct

### Step 10: Code Review + Merge

Create PR with:

- Template + generated markdown (commit both)
- Test file (`tests/diagram-generate.test.mjs`)
- References (examples, patterns, migration guides)
- Metadata complete
- Security review checklist signed off

**PR template:**

```markdown
## Skill: diagram-generate

**Purpose:** Generate Draw.io diagrams from text

**Agents:** design-agent, spec-agent, orchestrate

**Dependencies:**
- MCP: drawio-mcp (1.0.0+)
- Skills: (none required)

**Testing:**
- [x] Test RED (fails without skill)
- [x] Test GREEN (passes with skill)
- [x] Metadata validates
- [x] All 363 tests pass
- [x] Security review complete

**Checklist:**
- [x] Examples provided
- [x] Backwards compatible
- [x] No new dependencies
- [x] Documentation complete
```

---

## Best Practices

### 1. Keep Skills Focused

One skill = one responsibility. Don't build mega-skills.

❌ **Bad:** `diagram-and-document` skill (too broad)
✅ **Good:** `diagram-generate` (focused) + `diagram-export` (focused)

### 2. Reuse Existing Patterns

Look at similar skills first. Copy structure, naming conventions, checklist format.

Reference skills:
- `brainstorming` — process skills (exploration workflows)
- `systematic-debugging` — investigation skills
- `design-html` — output skills
- `verification-before-completion` — validation skills

### 3. Write for Clarity

Skills teach agents **HOW** to work. Checklists > prose.

❌ **Unclear:** "Generate the diagram using the appropriate format"
✅ **Clear:** 
```
1. Ask: "Flowchart, architecture, or ER diagram?"
2. For flowchart: use Mermaid.js
3. For architecture: use XML with grid placement
4. For ER: use Mermaid.js ER syntax
```

### 4. Test Pressure Scenarios

Tests should verify agents actually follow your skill.

❌ **Weak:** Unit test that just checks parsing
✅ **Strong:** End-to-end test with agent behavior expectations

### 5. Declare All Dependencies

If skill needs an MCP, policy, or other skill — declare it in metadata.

```yaml
metadata:
  dependencies:
    mcps: [drawio-mcp]
    skills: [diagram-export]
    min-agent-arch-version: "0.1.4"
```

### 6. Support Deprecation Path

If replacing an old skill, add migration guide and keep both for 1-2 releases.

```yaml
metadata:
  discovery:
    replaces: old-skill-name
```

---

## Troubleshooting

### Test Fails "Function Not Found"

Skill isn't rendering. Run:

```bash
npm run build:skills
npm test -- tests/diagram-generate.test.mjs
```

### Metadata Validation Error

Check `docs/METADATA-SCHEMA.md` for field definitions. Common issues:

- Invalid `category` (must be one of: core, visual-system, design, code, data, release, infrastructure)
- Agent name doesn't exist
- Dependency skill doesn't exist in registry
- `last-reviewed` not in ISO format (YYYY-MM-DD)

### Security Review Fails

Check `docs/SECURITY-REVIEW-CHECKLIST.md`. Common issues:

- Public egress not gated by policy
- MCP invocation not declared in frontmatter
- Example code includes credentials

---

## Maintenance

Once merged, your skill is part of the pack.

**Quarterly review:**

```bash
npm run validate:metadata -- diagram-generate/SKILL.md.tmpl
```

**If making changes:**

- Bump `version` in frontmatter (major/minor/patch)
- Update `last-reviewed` date
- If breaking change: update `metadata.dependencies.min-agent-arch-version`
- Regenerate: `npm run build:skills`
- Test: `npm test`

---

## Questions?

Refer to:
- `docs/METADATA-SCHEMA.md` — Metadata field reference
- `docs/SKILL-VALIDATION-CHECKLIST.md` — QA gate checklist
- `docs/SECURITY-REVIEW-CHECKLIST.md` — Security gate checklist
- Existing skills (brainstorming, diagram, spec, etc.) — Pattern reference

