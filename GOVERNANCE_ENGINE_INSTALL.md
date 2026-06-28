# Governance Engine - Installation Guide

## Overview

Governance Engine is a machine-readable governance system that enforces repository standards automatically. It consists of:

1. **governance-spec.yaml** — Machine-readable specification
2. **bin/governance.js** — CLI tool for validation
3. **Governance Agent** — Enforces standards in workflows
4. **Component Manifests** — Per-component metadata

## Installation Steps

### Step 1: Copy Core Files

```bash
# Add governance specification
cp governance-spec.yaml /path/to/repo/

# Add CLI tool
mkdir -p bin/
cp bin/governance.js /path/to/repo/bin/
chmod +x /path/to/repo/bin/governance.js

# Add schema files
cp governance-component-manifest.schema.json /path/to/repo/
cp example-governance-manifest.yaml /path/to/repo/

# Add governance agent
mkdir -p agents/governance/
cp agents/governance/SKILL.md /path/to/repo/agents/governance/
```

### Step 2: Update package.json

Add governance scripts to `package.json`:

```json
{
  "scripts": {
    "governance:check": "node bin/governance.js check",
    "governance:check:hard": "node bin/governance.js check:hard",
    "governance:check:soft": "node bin/governance.js check:soft",
    "governance:health": "node bin/governance.js health",
    "governance:validate": "node bin/governance.js validate",
    "governance:report": "node bin/governance.js report"
  },
  "devDependencies": {
    "js-yaml": "^4.1.0"
  }
}
```

### Step 3: Install Dependencies

```bash
npm install js-yaml
```

### Step 4: Add Git Hook (Pre-Commit)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Governance pre-commit hook

npm run governance:check:hard
if [ $? -ne 0 ]; then
  echo "❌ Governance hard gates failed. Fix issues and try again."
  exit 1
fi

echo "✓ Governance validation passed"
exit 0
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

### Step 5: Add CI/CD Workflow

Create `.github/workflows/governance.yml`:

```yaml
name: Governance Validation

on: [pull_request, push]

jobs:
  governance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Hard gates (required)
        run: npm run governance:check:hard

      - name: Soft gates (warnings)
        run: npm run governance:check:soft || true

      - name: Generate health report
        run: npm run governance:health

      - name: Validate component manifests
        run: npm run governance:validate

      - name: Generate scorecard
        run: npm run governance:report

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const report = require('./governance-out.json');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '## Governance Report\n\n' + formatReport(report)
            });
```

### Step 6: Create Component Manifests

For each component (skill, adapter, agent), create `GOVERNANCE.yaml`:

```bash
# Copy example manifest to each component
for component in agents/swe agents/qa adapters/github skills/commit; do
  cp example-governance-manifest.yaml "$component/GOVERNANCE.yaml"
  # Edit GOVERNANCE.yaml with component-specific details
done
```

### Step 7: Add Governance Exceptions File

Create `GOVERNANCE_EXCEPTIONS.md`:

```markdown
# Governance Exceptions

## Active Exceptions

### Exception 1
- Gate: soft_documentation
- Component: skill-name
- Reason: [justification]
- Issue: [link]
- Approved by: [staff SWE]
- Expires: [date]

## Expired Exceptions
(Moved here after resolution)
```

### Step 8: Update CLAUDE.md

Add governance context to `.claude/CLAUDE.md`:

```markdown
## Governance

Repository is governed by Governance Engine:

- **Specification**: `governance-spec.yaml` (machine-readable rules)
- **CLI**: `npm run governance:check` (validate locally)
- **Agent**: `@governance-agent` (automatic enforcement)
- **Manifests**: Each component has `GOVERNANCE.yaml`
- **Hard gates**: Must pass (no override)
- **Soft gates**: May warn, override allowed with justification
- **Scorecard**: All dimensions ≥8/10 required for merge

### Before Submitting PR

1. Run locally: `npm run governance:check`
2. Check scorecard: `npm run governance:report`
3. Fix any hard gate failures
4. Document soft gate overrides if needed
5. Ensure manifest is current: `GOVERNANCE.yaml`

### CI/CD

Governance runs automatically on:
- Pre-commit hook (hard gates only)
- Pull requests (full validation)
- Merge (health report generated)

All hard gates must pass. Soft gates allow documented exceptions.
```

### Step 9: Verify Installation

```bash
# Test CLI
npm run governance:check

# Should output:
# HARD GATES (Must Pass)
# SOFT GATES (Should Pass)
# COMPONENT VALIDATION
# ...

# Test each command
npm run governance:check:hard
npm run governance:check:soft
npm run governance:health
npm run governance:validate
npm run governance:report
```

## Configuration

### Customize governance-spec.yaml

Edit `governance-spec.yaml` to customize:
- `hard_gates`: Cannot be overridden
- `soft_gates`: May be overridden with justification
- `components.required_files`: Required per component
- `maturity_levels`: Governance per level
- `scorecard.dimensions`: Quality dimensions
- `commits`: Size limits, structure rules

### Create custom checks

Extend `bin/governance.js` to add:
- Custom validation rules
- Additional hard/soft gates
- Domain-specific checks
- Custom metrics

Example:

```javascript
// Add custom hard gate
validateHardGate(gate, key, value) {
  if (gate === 'custom' && key === 'my_rule') {
    // Custom validation logic
    return { pass: true/false, message: '...' };
  }
  // ... existing code
}
```

## Usage

### Local Validation

```bash
# Check all gates
npm run governance:check

# Hard gates only (fast)
npm run governance:check:hard

# Soft gates with warnings
npm run governance:check:soft

# Full health report
npm run governance:health

# Quality scorecard
npm run governance:report

# Validate component manifests
npm run governance:validate
```

### Pre-Commit Hook

```bash
git commit -m "..."
# → Automatically runs governance:check:hard
# → Blocks commit if hard gates fail
```

### GitHub Actions

```bash
git push origin branch
# → CI runs full governance:check
# → Posts report comment on PR
# → Blocks merge if hard gates fail
```

### Agent-Based (Automatic)

```
@governance-agent review this work
# → Validates all gates
# → Generates scorecard
# → Blocks merge if needed
# → Documents exceptions if allowed
```

## Escape Hatches

### Soft Gate Override

If soft gate fails but override is justified:

1. Document in `GOVERNANCE_EXCEPTIONS.md`:
   ```markdown
   - Gate: soft_documentation
   - Component: X
   - Reason: [why this is needed]
   - Issue: [tracking issue]
   - Approved by: [staff SWE name]
   - Expires: [date]
   ```

2. Link to tracking issue with remediation plan

3. CI allows merge with documented exception

4. Exception must be resolved by expiration date

### No Override for Hard Gates

Hard gates cannot be overridden. If hard gate fails:
1. Fix the underlying issue
2. Don't bypass the gate
3. Revalidate

## Troubleshooting

### Command not found: governance

```bash
# Ensure CLI is in PATH
export PATH="$PATH:$(pwd)/bin"

# Or use full path
./bin/governance.js check
```

### Dependencies missing

```bash
npm install js-yaml
```

### Pre-commit hook not running

```bash
# Make hook executable
chmod +x .git/hooks/pre-commit

# Verify it's there
ls -la .git/hooks/pre-commit
```

### Component manifest validation fails

```bash
# Check manifest format
npm run governance:validate

# Validate against schema
npx ajv validate -s governance-component-manifest.schema.json \
  -d component/GOVERNANCE.yaml
```

## Next Steps

1. **Customize**: Edit `governance-spec.yaml` for your rules
2. **Manifests**: Create `GOVERNANCE.yaml` for all components
3. **Integrate**: Wire into CI/CD via GitHub Actions
4. **Monitor**: Track health reports over time
5. **Evolve**: Version governance as it changes (v1.0 → v1.1)

## Support

For issues:
1. Check `governance-spec.yaml` for rules
2. Run `npm run governance:validate` for diagnostics
3. Review `bin/governance.js` for logic
4. Check component `GOVERNANCE.yaml` for metadata
5. See `GOVERNANCE_EXCEPTIONS.md` for overrides

## See Also

- `REPO_CHANGE_GOVERNANCE_WORKFLOW.md` — Policy document
- `governance-spec.yaml` — Machine-readable specification
- `agents/governance/SKILL.md` — Governance Agent
- `governance-component-manifest.schema.json` — Manifest schema
