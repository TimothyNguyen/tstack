import json
import os
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Dict

SUPPORTED_FORMATS = {
    "terraform": ".tf",
    "cloudformation": ".yaml",
    "kubernetes": ".yaml",
    "dockerfile": "Dockerfile",
    "arm": ".json",
    "bicep": ".bicep",
    "helm": ".yaml",
    "kustomize": ".yaml",
}


def run_checkov_scan(code: str, format_type: str) -> Dict:
    """Scan an IaC code string with Checkov."""
    fmt = format_type.lower()
    if fmt not in SUPPORTED_FORMATS:
        raise ValueError(
            f"Unsupported format: {format_type}. Supported: {sorted(SUPPORTED_FORMATS)}"
        )

    ext = SUPPORTED_FORMATS[fmt]
    if ext == "Dockerfile":
        fd, tmp_path = tempfile.mkstemp(prefix="Dockerfile")
        os.close(fd)
    else:
        fd, tmp_path = tempfile.mkstemp(suffix=ext, prefix="checkov_scan_")
        os.close(fd)

    try:
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(code)
        result = subprocess.run(
            ["checkov", "-f", tmp_path, "--output", "json", "--quiet", "--compact"],
            capture_output=True,
            text=True,
        )
        return _parse_checkov_output(result.stdout, format_type)
    finally:
        os.unlink(tmp_path)


def run_directory_checkov_scan(directory_path: str) -> Dict:
    """Scan a directory with Checkov; write results to .security-reports/checkov/<ts>.json."""
    out_dir = Path(directory_path) / ".security-reports" / "checkov"
    out_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = out_dir / f"{timestamp}.json"

    result = subprocess.run(
        ["checkov", "-d", directory_path, "--output", "json", "--quiet", "--compact"],
        capture_output=True,
        text=True,
    )

    raw: object = {}
    if result.stdout.strip():
        try:
            raw = json.loads(result.stdout)
        except json.JSONDecodeError:
            raw = {}

    out_file.write_text(json.dumps(raw, indent=2), encoding="utf-8")

    passed = failed = 0
    checks = raw if isinstance(raw, list) else [raw]
    for check in checks:
        s = check.get("summary", {}) if isinstance(check, dict) else {}
        passed += s.get("passed", 0)
        failed += s.get("failed", 0)

    return {
        "tool": "checkov",
        "directory": directory_path,
        "summary": {"passed": passed, "failed": failed},
        "output_file": str(out_file),
    }


def _parse_checkov_output(stdout: str, format_type: str) -> Dict:
    _empty = {
        "tool": "checkov",
        "format_type": format_type,
        "findings": [],
        "summary": {"passed": 0, "failed": 0, "high": 0, "medium": 0, "low": 0},
        "total_issues": 0,
    }

    if not stdout.strip():
        return _empty

    try:
        data = json.loads(stdout)
    except json.JSONDecodeError:
        return _empty

    findings = []
    passed = failed = 0
    checks = data if isinstance(data, list) else [data]

    for check in checks:
        if not isinstance(check, dict):
            continue
        results = check.get("results", {})
        passed_checks = results.get("passed_checks", [])
        failed_checks = results.get("failed_checks", [])
        passed += len(passed_checks)
        failed += len(failed_checks)
        for fc in failed_checks:
            findings.append({
                "check_id": fc.get("check_id"),
                "check_name": fc.get("check_id"),
                "description": fc.get("check_id"),
                "severity": (fc.get("severity") or "MEDIUM").upper(),
                "resource": fc.get("resource"),
                "file_path": fc.get("file_path"),
                "line_range": fc.get("file_line_range", []),
                "guideline": fc.get("guideline"),
            })

    high = sum(1 for f in findings if f["severity"] in ("HIGH", "CRITICAL"))
    medium = sum(1 for f in findings if f["severity"] == "MEDIUM")
    low = sum(1 for f in findings if f["severity"] == "LOW")

    return {
        "tool": "checkov",
        "format_type": format_type,
        "findings": findings,
        "summary": {"passed": passed, "failed": failed, "high": high, "medium": medium, "low": low},
        "total_issues": failed,
    }
