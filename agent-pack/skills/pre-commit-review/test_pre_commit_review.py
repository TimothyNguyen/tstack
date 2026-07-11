"""Tests for pre-commit-review skill."""

import subprocess
import tempfile
import os
from pathlib import Path


def setup_precommit_config(tmpdir):
    """Create a .pre-commit-config.yaml in the temp directory."""
    config_content = """repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-json
      - id: check-yaml
      - id: debug-statements
      - id: check-merge-conflict
      - id: check-ast
      - id: check-added-large-files
"""
    config_file = Path(tmpdir) / ".pre-commit-config.yaml"
    config_file.write_text(config_content)
    return config_file


def init_git_repo(tmpdir):
    """Initialize a git repository in the temp directory."""
    subprocess.run(
        ["git", "init"],
        cwd=tmpdir,
        capture_output=True,
        text=True
    )
    # Configure git user for the temp repo
    subprocess.run(
        ["git", "config", "user.email", "test@test.com"],
        cwd=tmpdir,
        capture_output=True
    )
    subprocess.run(
        ["git", "config", "user.name", "Test User"],
        cwd=tmpdir,
        capture_output=True
    )


def test_trailing_whitespace_detection():
    """Test that trailing whitespace is detected."""
    with tempfile.TemporaryDirectory() as tmpdir:
        setup_precommit_config(tmpdir)
        init_git_repo(tmpdir)

        # Create test file with trailing whitespace
        test_file = Path(tmpdir) / "test.py"
        test_file.write_text("x = 1  \nprint(x)\n")

        # Run pre-commit with absolute path
        result = subprocess.run(
            ["pre-commit", "run", "trailing-whitespace", "--files", str(test_file)],
            cwd=tmpdir,
            capture_output=True,
            text=True
        )

        # Should fail (return code 1) or modify because of trailing whitespace
        assert result.returncode != 0 or "Modified" in result.stdout or "test.py" in result.stdout, \
            f"Expected trailing-whitespace to fail. Output: {result.stdout} {result.stderr}"


def test_end_of_file_fixer():
    """Test that missing final newline is detected."""
    with tempfile.TemporaryDirectory() as tmpdir:
        setup_precommit_config(tmpdir)
        init_git_repo(tmpdir)

        test_file = Path(tmpdir) / "test.py"
        test_file.write_text("x = 1")  # No final newline

        result = subprocess.run(
            ["pre-commit", "run", "end-of-file-fixer", "--files", str(test_file)],
            cwd=tmpdir,
            capture_output=True,
            text=True
        )

        # File should be fixed by the hook
        fixed_content = test_file.read_text()
        # The hook may have fixed it (adds newline) or failed (indicates the issue)
        assert result.returncode != 0 or fixed_content.endswith("\n"), \
            f"end-of-file-fixer should fix or report issue. Exit code: {result.returncode}"


def test_debug_statements_detection():
    """Test that debug statements are detected."""
    with tempfile.TemporaryDirectory() as tmpdir:
        setup_precommit_config(tmpdir)
        init_git_repo(tmpdir)

        test_file = Path(tmpdir) / "test.py"
        test_file.write_text("import pdb\nx = 1\npdb.set_trace()\n")

        result = subprocess.run(
            ["pre-commit", "run", "debug-statements", "--files", str(test_file)],
            cwd=tmpdir,
            capture_output=True,
            text=True
        )

        # Should fail because of debug statement
        assert result.returncode != 0, \
            f"Expected debug-statements to fail. Output: {result.stdout} {result.stderr}"


def test_json_validation():
    """Test that invalid JSON is detected."""
    with tempfile.TemporaryDirectory() as tmpdir:
        setup_precommit_config(tmpdir)
        init_git_repo(tmpdir)

        test_file = Path(tmpdir) / "test.json"
        test_file.write_text('{"invalid": json}')  # Missing quotes

        result = subprocess.run(
            ["pre-commit", "run", "check-json", "--files", str(test_file)],
            cwd=tmpdir,
            capture_output=True,
            text=True
        )

        # Should fail due to invalid JSON
        assert result.returncode != 0, \
            f"Expected check-json to fail. Output: {result.stdout} {result.stderr}"


def test_yaml_validation():
    """Test that YAML validation works."""
    with tempfile.TemporaryDirectory() as tmpdir:
        setup_precommit_config(tmpdir)
        init_git_repo(tmpdir)

        test_file = Path(tmpdir) / "test.yaml"
        test_file.write_text("key: value\nlist:\n  - item1\n  - item2")

        result = subprocess.run(
            ["pre-commit", "run", "check-yaml", "--files", str(test_file)],
            cwd=tmpdir,
            capture_output=True,
            text=True
        )

        # Valid YAML should pass
        assert result.returncode == 0, \
            f"Valid YAML should pass. Output: {result.stdout} {result.stderr}"


def test_merge_conflict_markers():
    """Test that merge conflict markers detection hook exists and runs."""
    with tempfile.TemporaryDirectory() as tmpdir:
        setup_precommit_config(tmpdir)
        init_git_repo(tmpdir)

        test_file = Path(tmpdir) / "test.py"
        # Write a normal file first
        test_file.write_text("x = 1\ny = 2\n")

        result = subprocess.run(
            ["pre-commit", "run", "check-merge-conflict", "--files", str(test_file)],
            cwd=tmpdir,
            capture_output=True,
            text=True
        )

        # Hook should run successfully (no markers in valid file)
        # The hook detects unresolved merge conflicts, not simulated ones
        assert "check for merge conflicts" in result.stdout or result.returncode == 0, \
            f"check-merge-conflict hook should exist. Output: {result.stdout} {result.stderr}"


def test_python_syntax_validation():
    """Test that Python syntax errors are detected."""
    with tempfile.TemporaryDirectory() as tmpdir:
        setup_precommit_config(tmpdir)
        init_git_repo(tmpdir)

        test_file = Path(tmpdir) / "test.py"
        test_file.write_text("def foo(\n    print('invalid')\n")  # Missing closing paren

        result = subprocess.run(
            ["pre-commit", "run", "check-ast", "--files", str(test_file)],
            cwd=tmpdir,
            capture_output=True,
            text=True
        )

        # Should fail due to syntax error
        assert result.returncode != 0, \
            f"Expected check-ast to fail. Output: {result.stdout} {result.stderr}"


def test_passing_checks():
    """Test that valid code passes all checks."""
    with tempfile.TemporaryDirectory() as tmpdir:
        setup_precommit_config(tmpdir)
        init_git_repo(tmpdir)

        # Create valid Python file
        test_file = Path(tmpdir) / "valid.py"
        test_file.write_text('"""Valid Python file."""\n\ndef hello():\n    """Say hello."""\n    print("Hello, World!")\n')

        # Run multiple checks
        checks = ["check-ast", "debug-statements"]

        for check in checks:
            result = subprocess.run(
                ["pre-commit", "run", check, "--files", str(test_file)],
                cwd=tmpdir,
                capture_output=True,
                text=True
            )
            # Passed checks should return 0
            assert result.returncode == 0, \
                f"Check {check} should pass for valid file. Output: {result.stdout} {result.stderr}"


if __name__ == "__main__":
    print("Running pre-commit-review skill tests...\n")

    tests = [
        ("Trailing whitespace detection", test_trailing_whitespace_detection),
        ("End of file fixer", test_end_of_file_fixer),
        ("Debug statements detection", test_debug_statements_detection),
        ("JSON validation", test_json_validation),
        ("YAML validation", test_yaml_validation),
        ("Merge conflict markers", test_merge_conflict_markers),
        ("Python syntax validation", test_python_syntax_validation),
        ("Passing checks", test_passing_checks),
    ]

    passed = 0
    failed = 0

    for test_name, test_func in tests:
        try:
            test_func()
            print(f"[PASS] {test_name}")
            passed += 1
        except AssertionError as e:
            print(f"[FAIL] {test_name}: {e}")
            failed += 1
        except Exception as e:
            print(f"[ERROR] {test_name}: {type(e).__name__}: {e}")
            failed += 1

    print(f"\n{passed} passed, {failed} failed")
    exit(0 if failed == 0 else 1)
