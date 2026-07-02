import json
import os
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Dict


def run_bandit_scan(code: str) -> Dict:
    """Scan Python source code string with Bandit."""
    fd, tmp_path = tempfile.mkstemp(suffix=".py", prefix="bandit_scan_")
    os.close(fd)

    try:
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(code)
        result = subprocess.run(
            ["bandit", "-f", "json", "-q", tmp_path],
            capture_output=True,
            text=True,
        )
        return _parse_bandit_output(result.stdout)
    finally:
        os.unlink(tmp_path)


def run_directory_bandit_scan(directory_path: str) -> Dict:
    """Scan a Python directory recursively with Bandit; write results to .security-reports/bandit/<ts>.json."""
    p = Path(directory_path).resolve()
    if not p.is_dir():
        return {"success": False, "error": f"Not a valid directory: {directory_path}"}
    directory_path = str(p)
    out_dir = Path(directory_path) / ".security-reports" / "bandit"
    out_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = out_dir / f"{timestamp}.json"

    result = subprocess.run(
        ["bandit", "-r", "-f", "json", "-q", directory_path],
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
    metrics = raw.get("metrics", {}).get("_totals", {}) if isinstance(raw, dict) else {}

    return {
        "tool": "bandit",
        "directory": directory_path,
        "summary": {
            "high": int(metrics.get("SEVERITY.HIGH", 0)),
            "medium": int(metrics.get("SEVERITY.MEDIUM", 0)),
            "low": int(metrics.get("SEVERITY.LOW", 0)),
            "total": len(raw.get("results", [])) if isinstance(raw, dict) else 0,
        },
        "output_file": str(out_file),
    }


def _parse_bandit_output(stdout: str) -> Dict:
    _empty = {
        "tool": "bandit",
        "findings": [],
        "summary": {"high": 0, "medium": 0, "low": 0},
        "total_issues": 0,
    }

    if not stdout.strip():
        return _empty

    try:
        data = json.loads(stdout)
    except json.JSONDecodeError:
        return _empty

    findings = []
    for r in data.get("results", []):
        findings.append({
            "test_id": r.get("test_id"),
            "test_name": r.get("test_name"),
            "issue_severity": (r.get("issue_severity") or "MEDIUM").upper(),
            "issue_confidence": (r.get("issue_confidence") or "MEDIUM").upper(),
            "issue_text": r.get("issue_text"),
            "line_number": r.get("line_number"),
            "filename": r.get("filename"),
            "code": r.get("code"),
        })

    metrics = data.get("metrics", {}).get("_totals", {})
    return {
        "tool": "bandit",
        "findings": findings,
        "summary": {
            "high": int(metrics.get("SEVERITY.HIGH", 0)),
            "medium": int(metrics.get("SEVERITY.MEDIUM", 0)),
            "low": int(metrics.get("SEVERITY.LOW", 0)),
        },
        "total_issues": len(findings),
    }
