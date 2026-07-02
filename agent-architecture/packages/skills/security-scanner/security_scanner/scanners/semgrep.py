import json
import os
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Dict

SUPPORTED_LANGUAGES = {
    "python": ".py",
    "javascript": ".js",
    "typescript": ".ts",
    "java": ".java",
    "go": ".go",
    "ruby": ".rb",
    "php": ".php",
    "c": ".c",
    "cpp": ".cpp",
    "csharp": ".cs",
    "rust": ".rs",
    "kotlin": ".kt",
    "scala": ".scala",
}


def run_semgrep_scan(code: str, language: str) -> Dict:
    """Scan a source code string with Semgrep."""
    lang = language.lower()
    if lang not in SUPPORTED_LANGUAGES:
        raise ValueError(
            f"Unsupported language: {language}. Supported: {sorted(SUPPORTED_LANGUAGES)}"
        )

    ext = SUPPORTED_LANGUAGES[lang]
    fd, tmp_path = tempfile.mkstemp(suffix=ext, prefix="semgrep_scan_")
    os.close(fd)

    try:
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(code)
        result = subprocess.run(
            ["semgrep", "--config", "auto", "--json", "--quiet", tmp_path],
            capture_output=True,
            text=True,
        )
        return _parse_semgrep_output(result.stdout, language)
    finally:
        os.unlink(tmp_path)


def run_directory_semgrep_scan(directory_path: str, language: str = "") -> Dict:
    """Scan a directory with Semgrep; write results to .security-reports/semgrep/<ts>.json."""
    out_dir = Path(directory_path) / ".security-reports" / "semgrep"
    out_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = out_dir / f"{timestamp}.json"

    cmd = ["semgrep", "--config", "auto", "--json", "--quiet", directory_path]
    lang = language.lower()
    if lang and lang in SUPPORTED_LANGUAGES:
        cmd.extend(["--lang", lang])

    result = subprocess.run(cmd, capture_output=True, text=True)

    raw: object = {}
    if result.stdout.strip():
        try:
            raw = json.loads(result.stdout)
        except json.JSONDecodeError:
            raw = {}

    out_file.write_text(json.dumps(raw, indent=2), encoding="utf-8")
    results_list = raw.get("results", []) if isinstance(raw, dict) else []

    return {
        "tool": "semgrep",
        "directory": directory_path,
        "language": language,
        "summary": {"total": len(results_list)},
        "output_file": str(out_file),
    }


def _parse_semgrep_output(stdout: str, language: str) -> Dict:
    _empty = {
        "tool": "semgrep",
        "language": language,
        "findings": [],
        "summary": {"total": 0, "error": 0, "warning": 0, "info": 0},
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
        severity = (r.get("extra", {}).get("severity") or "WARNING").upper()
        findings.append({
            "rule_id": r.get("check_id"),
            "message": r.get("extra", {}).get("message"),
            "severity": severity,
            "line": r.get("start", {}).get("line"),
            "file_path": r.get("path"),
        })

    error = sum(1 for f in findings if f["severity"] == "ERROR")
    warning = sum(1 for f in findings if f["severity"] == "WARNING")
    info = sum(1 for f in findings if f["severity"] == "INFO")

    return {
        "tool": "semgrep",
        "language": language,
        "findings": findings,
        "summary": {"total": len(findings), "error": error, "warning": warning, "info": info},
        "total_issues": len(findings),
    }
