# Skill Validation Checklist

QA gate for all new skills before merge. Run before creating PR.

---

## Frontmatter Validation

- [ ] `name` field present and matches directory name (lowercase, hyphens only)
- [ ] `version` follows semver (major.minor.patch, e.g., 0.1.0)
- [ ] `description` is non-empty, 1-3 sentences max
- [ ] `allowed-tools` array is non-empty, contains only valid tool names
- [ ] `agents` array is non-empty, references valid agent names or `[_infrastructure]`

**Verify:**
```bash
npm run validate:metadata -- <skill>/SKILL.md.tmpl
```

---

## Metadata Schema Validation

If using enhanced metadata (optional), verify:

- [ ] `metadata.category` is one of: core, visual-system, design, code, data, release, infrastructure
- [ ] `metadata.domain` is null or valid domain (aws, databricks, spring-boot, react, postgres, etc.)
- [ ] `metadata.tier` is one of: essential, recommended, optional
- [ ] `metadata.dependencies.mcps` lists MCP names with version constraints
- [ ] `metadata.dependencies.skills` references existing skills
- [ ] `metadata.dependencies.min-agent-arch-version` is valid semver
- [ ] `metadata.training.keywords` is array of strings
- [ ] `metadata.support.maintenance-status` is one of: active, experimental, deprecated
- [ ] `metadata.support.last-reviewed` is ISO date (YYYY-MM-DD)

---

## Documentation Completeness

- [ ] Skill has clear, step-by-step checklist (8+ items for complex skills, 4+ for simple)
- [ ] Workflow diagram (ASCII art or Graphviz) showing agent decision flow
- [ ] At least 1 worked example showing real user request → skill workflow → output
- [ ] Anti-patterns section (3+ patterns to avoid)
- [ ] Policy requirements section if using MCPs or destructive operations
- [ ] Cross-references to related skills

---

## Code Quality

### Workflow Logic

- [ ] Checklist items are **verbs**, not nouns (✅ "Ask user for input" ❌ "User input")
- [ ] Each step is **actionable** — agent can execute it
- [ ] Branching logic is **clear** — decision points marked
- [ ] No **placeholder text** (`{{PLACEHOLDER}}`, `TODO`, etc.)

### Example Code

- [ ] Includes actual user request (not abstract description)
- [ ] Shows skill workflow steps agent actually takes
- [ ] Demonstrates expected output (diagram, spec, etc.)
- [ ] No **credentials or secrets** in examples
- [ ] No **absolute file paths** (use relative or generic paths)

### Security

- [ ] No public egress (external HTTP/API calls) without explicit policy approval
- [ ] No telemetry, update checks, cookie imports, credential reads
- [ ] Shell commands don't bypass safety (e.g., no `--no-verify`, `--force`, or `rm -rf`)
- [ ] Git operations don't force-push or reset local changes
- [ ] Destructive operations (deletion, overwrite) gated by policy or user confirmation

---

## Testing

- [ ] Pressure test written (`tests/<skill>.test.mjs`)
- [ ] Test covers RED phase (agent fails without skill)
- [ ] Test covers GREEN phase (agent complies with skill)
- [ ] Test passes: `npm test -- tests/<skill>.test.mjs`
- [ ] No regressions in full suite: `npm test` (all 363+ tests pass)

**Test quality check:**

```javascript
// ❌ WEAK: Just checks parsing
test("skill parses input", () => {
  const input = "some input";
  // ... just parsing logic
});

// ✅ STRONG: Checks agent behavior
test("skill forces agent to ask diagram type", () => {
  // Scenario: User says "draw architecture" (missing type)
  // RED: Agent can't comply
  // GREEN: Skill teaches agent to ask "flowchart? sequence? architecture?"
  // Test passes when agent asks clarifying question
});
```

---

## Generation & Build

- [ ] Template renders without errors: `npm run build:skills`
- [ ] Generated SKILL.md has no `{{PLACEHOLDERS}}`
- [ ] Skill appears in registry: check `generated/registry.json`
- [ ] Agent declarations correct: check agents' "Declared Skills" section
- [ ] Freshness verified: `npm run check:skills` (all checks pass)

---

## Agent Integration

- [ ] Skill referenced in correct `agents/<agent>/SKILL.md` files
- [ ] Agent has routing logic to invoke this skill (if appropriate)
- [ ] Agent can access required tools (`allowed-tools`)
- [ ] No circular dependencies between skills

**Verify agent has skill:**
```bash
grep -r "diagram-generate" agents/*/SKILL.md
```

---

## Cross-Skill Validation

If skill declares dependencies:

- [ ] Each listed MCP server is real and documented
- [ ] Each listed dependent skill actually exists
- [ ] Version constraints make sense (min < max, if both specified)
- [ ] Policy gates are valid and documented

---

## Backwards Compatibility

- [ ] New metadata fields are **optional** (not breaking)
- [ ] Existing skills still work without metadata
- [ ] Old installations don't break on upgrade
- [ ] No changes to existing agent routing logic

---

## Security Review Checklist

Self-review your skill against common issues:

### Public Egress

- [ ] No `fetch()`, `curl`, `wget` without policy approval
- [ ] MCPs explicitly listed in `metadata.dependencies.mcps`
- [ ] Policy gate set: `metadata.approval-gates.policy-required: [mcp-egress]`
- [ ] Skill body mentions policy requirement in **Policy Requirements** section

### Credentials & Secrets

- [ ] No hardcoded API keys, tokens, or passwords
- [ ] No credential reads from environment without explicit approval
- [ ] Examples don't include real credentials (use `YOUR_TOKEN_HERE`, etc.)
- [ ] Documentation warns against sharing credentials

### Destructive Operations

- [ ] Delete operations confirmed by user first
- [ ] Overwrite operations warned in workflow
- [ ] Reset/revert operations require explicit approval
- [ ] Rollback instructions provided

### System Safety

- [ ] Shell commands use proper quoting (prevent injection)
- [ ] Git commands avoid `--force` and `--no-verify`
- [ ] File operations don't assume predictable paths
- [ ] Process termination requires explicit user action

### Data Privacy

- [ ] Diagrams/outputs don't expose PII
- [ ] Logs don't capture sensitive data
- [ ] No screenshots/captures of confidential UI
- [ ] Data retention policy clear (if storing files)

---

## Documentation Links

- [ ] Metadata schema: `docs/METADATA-SCHEMA.md`
- [ ] Security review: `docs/SECURITY-REVIEW-CHECKLIST.md`
- [ ] Contributing guide: `docs/CONTRIBUTING.md`
- [ ] Related skills documented and linked

---

## Pre-Merge Verification

Before creating PR, run full verification:

```bash
# 1. Validate metadata
npm run validate:metadata -- diagram-generate/SKILL.md.tmpl

# 2. Build skills
npm run build:skills

# 3. Check freshness
npm run check:skills

# 4. Run all tests
npm test

# 5. List any issues
npm run validate:metadata -- "*.md.tmpl"
```

**All must pass ✅ before PR**

---

## Post-Merge Maintenance

Skills have quarterly reviews:

```bash
# Monthly: Check for stale documentation
npm run validate:metadata -- diagram-generate/SKILL.md.tmpl

# Quarterly: Full audit
npm run validate:metadata -- "*.md.tmpl"
```

If making changes after merge:

- [ ] Bump `version` (major/minor/patch)
- [ ] Update `metadata.support.last-reviewed` date
- [ ] Regenerate: `npm run build:skills`
- [ ] Test: `npm test`
- [ ] Commit with reference to issue/PR

