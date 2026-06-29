# Governance Quick Reference

## Five-Second Summary

- **Hard Gates** → Must pass (no override). Blocks commit/PR merge.
- **Soft Gates** → Should pass (documented override allowed). Warns only.
- **Scorecard** → All dimensions ≥8/10 required to merge.
- **CLI** → `npm run governance:check` validates locally.
- **Exceptions** → Document in GOVERNANCE_EXCEPTIONS.md with tracking issue + expiration.

## Common Commands

```bash
# Validate locally (before commit)
npm run governance:check:hard

# Check warnings (soft gates)
npm run governance:check:soft

# View repository health
npm run governance:health

# View quality scorecard
npm run governance:report

# Validate all files present
npm run governance:validate
```

## Hard Gates (No Override)

If any fail, fix the issue and revalidate:

- ✗ Build fails → Fix build
- ✗ Tests fail → Fix tests
- ✗ Circular dependency → Refactor to break cycle
- ✗ Orphaned component → Register component or remove
- ✗ Missing required files → Add README.md, SPEC.md, etc.
- ✗ SPEC.md incomplete → Add required sections
- ✗ Template artifacts → Remove .Groups[1].Value markers

## Soft Gates (Override Allowed)

Document override if bypassing:

1. **Edit GOVERNANCE_EXCEPTIONS.md:**
   ```markdown
   - Gate: soft_documentation
     Component: component-name
     Reason: [specific justification]
     Issue: [GitHub issue link]
     Approved by: [Staff SWE name]
     Expires: [remediation date]
   ```

2. **Link issue** with remediation plan
3. **Merge allowed** with exception documented
4. **Resolve by expiration date** or renew exception

## Scorecard Dimensions

All must score ≥8/10 to merge:

| Dimension | Threshold | Improvement Path |
|-----------|-----------|------------------|
| Architecture | 8/10 | Review design patterns, reduce complexity |
| Documentation | 8/10 | Expand SPEC.md sections, add examples |
| Testing | 8/10 | Increase coverage to 80%+ |
| Maintainability | 8/10 | Reduce code duplication, improve naming |
| Determinism | 8/10 | Remove randomness, improve reproducibility |
| Reusability | 8/10 | Reduce coupling, improve interfaces |
| CI/CD Readiness | 8/10 | Add automation, validate in pipeline |

## Maturity Levels

Each level has proportionate governance:

| Level | Duration | Rules | Coverage |
|-------|----------|-------|----------|
| Draft | 0 days | Relaxed | Any |
| Experimental | 90 days | Relaxed | Any |
| Beta | Normal | Normal | 80%+ |
| Stable | Ongoing | Strict | 90%+ |
| Deprecated | Maintenance | Read-only | N/A |
| Archived | None | Read-only | N/A |

## Creating GOVERNANCE.yaml for New Component

```yaml
name: my-component
type: skill  # skill, adapter, agent, mcp, utility, workflow
status: experimental  # draft, experimental, beta, stable, deprecated, archived
version: "1.0.0"
owner: my-team

description: Brief description (50-500 chars)

dependencies:
  skills: []
  adapters: []
  tools: []
  mcps: []

testing:
  coverage_target: 80
  types: [unit, integration]

documentation:
  readme: true
  spec: true
  examples_min: 2

used_by: [agent-name]

governance_version: "1.0"
last_reviewed: "2026-06-27"
```

Place as `my-component/GOVERNANCE.yaml`.

## Pre-Commit Hook

Automatically runs on commit:

```bash
git commit -m "..."
# → Runs: npm run governance:check:hard
# → Blocks commit if hard gates fail
# → Allows commit if hard gates pass
```

## CI/CD Integration

Runs on every PR/push:

```bash
git push origin branch
# → GitHub Actions runs full governance:check
# → Reports results as PR comment
# → Blocks merge if hard gates fail
```

## Debugging

| Problem | Solution |
|---------|----------|
| "Build fails" | Check `npm run build` output |
| "Tests fail" | Run `npm test` to see failures |
| "Circular dependency" | Use `npm ls` to visualize deps |
| "Coverage <80%" | Add tests for uncovered lines |
| "README <200 words" | Expand with examples & sections |
| "SPEC.md incomplete" | Add missing sections (see TMPL.md) |

## When Stuck

1. **Read the error message** — It says what's wrong
2. **Check governance-spec.yaml** — Defines all rules
3. **Run `npm run governance:validate`** — Find missing files
4. **Review REPO_CHANGE_GOVERNANCE_WORKFLOW.md** — Understand policy
5. **Ask staff SWE** — For override approvals

## Contact

For issues:
- Check GOVERNANCE_ENGINE_INSTALL.md troubleshooting
- Review governance-spec.yaml rule definitions
- Open tracking issue in GitHub
