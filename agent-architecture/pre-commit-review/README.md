# Pre-Commit-Review Skill

Multi-platform executable skill for Claude Code, Codex, and Copilot CLI that runs pre-commit hooks to catch code style issues before review.

## Quick Facts

- **Version:** 0.1.0
- **Platforms:** Claude, Codex, Copilot
- **Agents:** swe, qa-agent, orchestrate, release-agent
- **Dependency:** pre-commit framework (`pip install pre-commit`)
- **Tests:** 8 passing
- **Status:** Production-ready

## What It Does

Catches trivial code issues before code review:
- Trailing whitespace
- Missing final newlines
- Debug statements (pdb, ipdb, breakpoint)
- Invalid syntax (JSON, YAML, TOML, XML, Python)
- Merge conflict markers
- Large files
- Private keys / secrets
- Case conflicts
- And 30+ other checks

Extracted from pre-commit framework, integrating:
- Configuration loading (clientlib patterns)
- Hook discovery and file filtering
- CLI invocation and result parsing
- Error handling and timeouts

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Skill documentation (generated) |
| `SKILL.md.tmpl` | Template (for agent-architecture build) |
| `pre_commit_runner.py` | Core implementation (cross-platform) |
| `test_pre_commit_review.py` | Test suite (8 tests) |
| `.pre-commit-config.yaml` | Example configuration |
| `README.md` | This file |

## Usage

### Claude Code
```bash
/pre-commit-review
```

Automatically detects `.pre-commit-config.yaml` in current project and runs checks.

### Codex
Skills load natively. Invoke skill and follow instructions.

### Copilot CLI
```bash
copilot skill pre-commit-review
```

## Installation

### One-Time Setup (per project)
```bash
# Install pre-commit framework
pip install pre-commit

# Configure hooks (create .pre-commit-config.yaml in project root)
cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: debug-statements
      - id: check-ast
EOF

# Install git hooks (optional, runs checks on commit)
pre-commit install
```

### Run Checks
```bash
# Check all files
pre-commit run --all-files

# Check specific files
pre-commit run --files file1.py file2.py
```

## Platform-Specific Notes

### Claude Code
- Installed at `~/.claude/skills/pre-commit-review/`
- Can be invoked with `/pre-commit-review` slash command
- Uses Python API directly for integration
- Returns structured results (passed/failed/issues)

### Codex
- Loaded as native skill in Codex environment
- Supports same `.pre-commit-config.yaml` configuration
- Can be invoked through standard Codex skill invocation
- Reports results in Codex-native format

### Copilot CLI
- Available via skill tool in Copilot CLI
- Works with standard pre-commit hooks
- Integrates with Copilot's project detection
- Results compatible with Copilot output formatting

## Test Results

```
Running pre-commit-review skill tests...

[PASS] Trailing whitespace detection
[PASS] End of file fixer
[PASS] Debug statements detection
[PASS] JSON validation
[PASS] YAML validation
[PASS] Merge conflict markers
[PASS] Python syntax validation
[PASS] Passing checks

8 passed, 0 failed
```

## Typical Workflow

1. **Develop** — Write code locally
2. **Check** — Run `pre-commit run --all-files`
3. **Fix** — Resolve any reported issues
4. **Commit** — Commit clean code
5. **Review** — Submit for code review (with focus on architecture, not style)

## Integration with Other Skills

Works well with:
- **`commit`** — Ensure checks pass before committing
- **`ship`** — Final validation before release
- **`qa`** — Verify style compliance before testing
- **`investigate`** — Identify debug statements in failing tests

## Enterprise Considerations

✓ No external network required (standard hooks)
✓ Configuration per-project via `.pre-commit-config.yaml`
✓ Git-based, works offline after initial setup
✓ Supports pinned hook versions for consistency
✓ Can detect hardcoded secrets/private keys
✓ Credentials stored in environment, not configs
✓ Can be integrated into CI/CD pipelines

## References

- **Pre-commit framework:** https://pre-commit.com
- **Hook registry:** https://pre-commit.com/hooks.html
- **GitHub repo:** https://github.com/pre-commit/pre-commit

## Support

Last reviewed: 2026-06-27

For issues or feedback, see agent-architecture repository.
