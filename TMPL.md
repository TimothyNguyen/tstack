# Templates

## Component GOVERNANCE.yaml Template

Use this template when creating GOVERNANCE.yaml for new components:

```yaml
name: component-name
type: skill  # skill, adapter, agent, mcp, utility, workflow
status: experimental  # draft, experimental, beta, stable, deprecated, archived
version: "1.0.0"
owner: team-or-agent-name

description: |
  Clear description of what this component does.
  At least 50 characters, at most 500 characters.

dependencies:
  skills: []
  adapters: []
  tools: []
  mcps: []

testing:
  coverage_target: 80
  types:
    - unit
    - integration

documentation:
  readme: true
  spec: true
  examples_min: 2

used_by: []

governance_version: "1.0"
last_reviewed: "2026-06-27"

# Component-specific metadata
skill_metadata:
  agents: []
  tools_provided: []
  inputs: {}
  outputs: {}

integration:
  pre_requirements: {}
  registration: {}
  wiring: {}

quality:
  test_coverage: 0
  documentation_completeness: 0
  security_review_date: ""
  performance_tested: false
  error_cases_documented: false

exceptions: []
```

## Soft Gate Exception Template

Use this when documenting a soft gate override in GOVERNANCE_EXCEPTIONS.md:

```markdown
- Gate: soft_documentation
  Component: component-name
  Reason: [Specific justification for why this exception is needed]
  Issue: [Link to tracking issue with remediation plan]
  Approved by: [Staff SWE name]
  Expires: [Date when exception must be resolved or renewed]
```

## Pre-Commit Hook Template

Create `.git/hooks/pre-commit` with:

```bash
#!/bin/bash
npm run governance:check:hard
if [ $? -ne 0 ]; then
  echo "❌ Governance hard gates failed."
  exit 1
fi
echo "✓ Governance validation passed"
exit 0
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

## CI/CD Workflow Template

Add to `.github/workflows/governance.yml`:

```yaml
name: Governance Validation

on: [pull_request, push]

jobs:
  governance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run governance:check:hard
      - run: npm run governance:check:soft || true
      - run: npm run governance:health
      - run: npm run governance:report
```
