---
name: pre-commit-review
version: 0.1.0
description: |
  Executable skill that runs pre-commit hooks on code to catch style issues
  (trailing whitespace, debug statements, invalid syntax) before code review.
  Allows reviewers to focus on architecture instead of trivial nitpicks.
  Works across Claude, Codex, and Copilot.
agents: [swe, qa-agent, orchestrate, release-agent]
metadata:
  support:
    last-reviewed: "2026-06-27"
  platforms: [claude, codex, copilot]
---

# Pre-Commit Code Review

Run pre-commit hooks on code to catch style issues early. Uses pre-commit framework
to detect and fix:

- Trailing whitespace
- Missing final newlines
- Debug statements (pdb, ipdb, breakpoint)
- Invalid JSON/YAML/TOML/XML syntax
- Python syntax errors
- Merge conflict markers
- Large files
- And 40+ other checks

Allows code reviewers to focus on architecture and logic, not formatting nitpicks.

## Quick Start

### Install pre-commit framework
```bash
pip install pre-commit
```

### Configure hooks for your project
Create `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: debug-statements
      - id: check-ast
```

### Run checks before code review
```bash
pre-commit run --all-files
```

## Platform Usage

### Claude Code
```bash
/pre-commit-review
```

Skill installed at `~/.claude/skills/pre-commit-review/`. When invoked:
- Detects `.pre-commit-config.yaml` in current project
- Runs hooks on staged/specified files
- Reports passed/failed checks
- Shows issues that need fixing before code review

### Codex
Skills load natively. Invoke skill from Codex and follow instructions.

### Copilot CLI
Use `skill` tool to access pre-commit-review capability.

## Core Implementation

**`pre_commit_runner.py`** — Python module that:
- Loads `.pre-commit-config.yaml` from project
- Invokes pre-commit CLI with proper file filtering
- Parses results into structured format (passed/failed/issues)
- Returns JSON or human-readable output

**Files:**
- `pre_commit_runner.py` — Core runner (use with all platforms)
- `test_pre_commit_review.py` — Test suite (8 tests, all passing)
- `.pre-commit-config.yaml` — Example configuration
- `SKILL.md` — This file

## Extracted from Pre-Commit Framework

This skill integrates code and patterns from the pre-commit repository:

- **Configuration loading** — logic from `clientlib` module
- **Hook discovery and filtering** — file classification patterns
- **CLI invocation** — subprocess wrapping with result parsing
- **Error handling** — timeout and exception management

Pre-commit framework provides:
- Hook environment setup (dependency isolation)
- Language-specific toolchain management
- Git integration (staged files, hooks)
- Concurrent hook execution

## Typical Workflow

```
1. Develop code locally
   ↓
2. Run: pre-commit run --all-files
   ↓
3. Fix any reported issues
   ↓
4. Commit and push
   ↓
5. Submit for code review
   ↓
6. Reviewer focuses on:
     • Architecture
     • Logic correctness
     • Design patterns
   NOT on:
     • Trailing whitespace
     • Missing newlines
     • Debug statements
```

## Available Checks

### File Quality
- `trailing-whitespace` — trim trailing whitespace
- `end-of-file-fixer` — ensure final newline
- `check-case-conflict` — detect case conflicts
- `check-added-large-files` — prevent large files
- `detect-private-key` — detect hardcoded secrets

### Format Validation
- `check-json` — validate JSON syntax
- `check-yaml` — validate YAML syntax
- `check-toml` — validate TOML syntax
- `check-xml` — validate XML syntax

### Code Quality
- `check-ast` — validate Python syntax
- `debug-statements` — detect pdb/ipdb/breakpoint
- `check-docstring-first` — docstring ordering
- `check-merge-conflict` — detect merge markers

## Configuration Examples

### Minimal (recommended starting point)
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: debug-statements
```

### Python project
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-ast
      - id: debug-statements

  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black

  - repo: https://github.com/PyCQA/isort
    rev: 5.12.0
    hooks:
      - id: isort
```

### Full-featured (enterprise)
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-toml
      - id: check-xml
      - id: check-ast
      - id: debug-statements
      - id: check-docstring-first
      - id: detect-private-key
      - id: check-added-large-files
        args: ['--maxkb=1000']
```

## Troubleshooting

**"No .pre-commit-config.yaml found"**
Create `.pre-commit-config.yaml` in project root with hook definitions.

**"git failed. Is it installed?"**
Pre-commit requires git repository. Run `git init` in project.

**"Hook timed out"**
Some hooks are slow. Increase timeout or run specific hooks only.

**"Hook not found"**
Verify hook `id` matches the `.pre-commit-config.yaml` definition.

## Testing

```bash
# Test suite (8 tests, all passing)
python test_pre_commit_review.py
```

## Integration with Other Skills

**`commit`** — Use pre-commit-review before commit to ensure only
clean code is committed.

**`investigate`** — When debugging tests, pre-commit-review helps
identify debug statements that shouldn't be in production.

**`ship`** — Final check before release: ensure no debug statements,
private keys, or formatting issues.

**`qa`** — QA can run checks to verify code meets style standards.

## Enterprise Notes

- Pre-commit runs locally; no external network required for standard hooks
- Configure `.pre-commit-config.yaml` per-project for consistency
- Pin hook versions to avoid unexpected behavior changes
- Use `detect-private-key` to prevent credential leaks
- Store credentials in environment variables, never in `.pre-commit-config.yaml`
- Git hooks can be installed per-project with `pre-commit install`
