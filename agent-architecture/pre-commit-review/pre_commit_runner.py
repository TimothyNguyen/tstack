#!/usr/bin/env python3
"""
Pre-commit runner - integrates pre-commit framework with Claude Code.

Extracts and wraps pre-commit functionality:
- Configuration loading and validation
- Hook discovery
- Results parsing and reporting
"""

import json
import logging
import subprocess
import sys
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class PreCommitRunner:
    """Run pre-commit hooks on code files."""

    def __init__(self, project_dir: str = "."):
        """Initialize runner for a project directory."""
        self.project_dir = Path(project_dir).resolve()
        self.config_path = self.project_dir / ".pre-commit-config.yaml"

    def is_configured(self) -> bool:
        """Check if project has pre-commit config."""
        return self.config_path.exists()

    def run_all_hooks(self, files: list[str] | None = None) -> dict[str, Any]:
        """
        Run all pre-commit hooks.

        Args:
            files: Specific files to check (if None, checks all files)

        Returns:
            Dictionary with results
        """
        if not self.is_configured():
            return {
                "success": False,
                "error": "No .pre-commit-config.yaml found",
                "passed": [],
                "failed": [],
                "issues": {},
            }

        # Build command
        cmd = ["pre-commit", "run"]

        if files:
            cmd.extend(["--files"] + [str((self.project_dir / f).resolve()) for f in files])
        else:
            cmd.append("--all-files")

        # Run pre-commit
        result = subprocess.run(
            cmd,
            cwd=str(self.project_dir),
            capture_output=True,
            text=True,
        )

        return self._parse_results(result)

    def _parse_results(self, result: subprocess.CompletedProcess) -> dict[str, Any]:
        """Parse pre-commit CLI output into structured results."""
        output = result.stdout + result.stderr
        lines = output.splitlines()

        passed = []
        failed = []
        issues = {}
        current_hook = None
        current_output = []

        for line in lines:
            # Lines with dots indicate hook results
            # Format: "hook-id.............................................Passed/Failed"
            if "." in line and any(x in line for x in ["Passed", "Failed"]):
                # Save previous hook output
                if current_hook and current_output:
                    issue_text = "\n".join(current_output).strip()
                    if issue_text:
                        issues[current_hook] = issue_text

                # Parse hook result
                if "Passed" in line:
                    # Extract hook name before dots
                    hook_name = line.split(".")[0].strip()
                    if hook_name:
                        passed.append(hook_name)
                        current_hook = None
                        current_output = []
                elif "Failed" in line:
                    hook_name = line.split(".")[0].strip()
                    if hook_name:
                        failed.append(hook_name)
                        current_hook = hook_name
                        current_output = []

            # Collect output for failed hooks
            elif current_hook and line.strip() and not line.startswith("pre-commit"):
                current_output.append(line)

        # Save final hook if any
        if current_hook and current_output:
            issue_text = "\n".join(current_output).strip()
            if issue_text:
                issues[current_hook] = issue_text

        return {
            "success": result.returncode == 0,
            "passed": passed,
            "failed": failed,
            "issues": issues,
        }


def main():
    """CLI entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Run pre-commit hooks on code"
    )
    parser.add_argument(
        "--project",
        default=".",
        help="Project directory",
    )
    parser.add_argument(
        "--files",
        nargs="+",
        help="Specific files to check",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results as JSON",
    )

    args = parser.parse_args()

    runner = PreCommitRunner(args.project)

    if not runner.is_configured():
        print("ERROR: No .pre-commit-config.yaml found in project")
        return 1

    results = runner.run_all_hooks(files=args.files)

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        _print_results(results)

    return 0 if results["success"] else 1


def _print_results(results: dict[str, Any]) -> None:
    """Pretty-print results."""
    print("\n" + "=" * 60)
    print("PRE-COMMIT CODE REVIEW")
    print("=" * 60)

    passed = results.get("passed", [])
    failed = results.get("failed", [])
    issues = results.get("issues", {})

    if passed:
        print(f"\n[OK] {len(passed)} checks PASSED:")
        for hook in passed:
            print(f"  - {hook}")

    if failed:
        print(f"\n[FAIL] {len(failed)} checks FAILED:")
        for hook in failed:
            print(f"  - {hook}")

    if issues:
        print("\nISSUES:")
        for hook, output in issues.items():
            print(f"\n  [{hook}]")
            for line in output.splitlines()[:5]:
                print(f"    {line}")
            if output.count("\n") > 5:
                print(f"    ... and {output.count(chr(10)) - 5} more")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    sys.exit(main())
