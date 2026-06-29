# Governance Exceptions

Tracked soft gate overrides and documented exceptions to governance standards.

## Active Exceptions

None currently. All soft gates passing.

## Documented Override Process

When a soft gate fails but override is justified:

1. **Document in this file:**
   - Gate: [name of soft gate]
   - Component: [component name]
   - Reason: [specific justification]
   - Issue: [link to tracking issue]
   - Approved by: [staff SWE name]
   - Expires: [remediation date]

2. **Link to tracking issue** with remediation plan

3. **CI/CD allows merge** with documented exception

4. **Exception must be resolved** by expiration date or renewed

## Exception Template

```markdown
- Gate: soft_documentation
  Component: component-name
  Reason: [Why this component cannot meet the gate right now]
  Issue: [GitHub issue tracking remediation]
  Approved by: [Staff SWE who approved]
  Expires: [Date when exception expires]
```

## Expired Exceptions

(Moved here after resolution)

None yet.

## Notes

- Hard gates cannot be overridden (no exceptions allowed)
- Soft gate overrides require tracking issue + staff SWE approval
- Exceptions expire and must be resolved or explicitly renewed
- All exceptions tracked here for transparency
