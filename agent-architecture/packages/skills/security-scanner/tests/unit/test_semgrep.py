import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from security_scanner.scanners.semgrep import (
    SUPPORTED_LANGUAGES,
    _parse_semgrep_output,
    run_semgrep_scan,
    run_directory_semgrep_scan,
)

SEMGREP_OUTPUT = json.dumps({
    "results": [
        {
            "check_id": "python.lang.security.audit.hardcoded-password",
            "path": "/tmp/foo.py",
            "start": {"line": 5},
            "extra": {
                "severity": "ERROR",
                "message": "Hardcoded password detected",
            },
        }
    ],
    "errors": [],
})


class TestRunSemgrepScan:
    def test_unsupported_language_raises(self):
        with pytest.raises(ValueError, match="Unsupported language"):
            run_semgrep_scan("code", "cobol")

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    @patch("security_scanner.scanners.semgrep.os.unlink")
    def test_returns_findings_for_python(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout=SEMGREP_OUTPUT, returncode=1)
        result = run_semgrep_scan("password = 'secret'", "python")
        assert result["tool"] == "semgrep"
        assert result["language"] == "python"
        assert len(result["findings"]) == 1
        assert result["findings"][0]["rule_id"] == "python.lang.security.audit.hardcoded-password"
        assert result["findings"][0]["severity"] == "ERROR"
        assert result["total_issues"] == 1

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    @patch("security_scanner.scanners.semgrep.os.unlink")
    def test_clean_scan_empty_findings(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(
            stdout=json.dumps({"results": [], "errors": []}), returncode=0
        )
        result = run_semgrep_scan("x = 1", "python")
        assert result["findings"] == []
        assert result["total_issues"] == 0

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    @patch("security_scanner.scanners.semgrep.os.unlink")
    def test_all_languages_accepted(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        for lang in SUPPORTED_LANGUAGES:
            result = run_semgrep_scan("code", lang)
            assert result["tool"] == "semgrep"

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    @patch("security_scanner.scanners.semgrep.os.unlink")
    def test_parse_error_returns_empty(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="invalid json", returncode=1)
        result = run_semgrep_scan("code", "javascript")
        assert result["findings"] == []

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    @patch("security_scanner.scanners.semgrep.os.unlink")
    def test_empty_stdout_returns_empty(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        result = run_semgrep_scan("code", "go")
        assert result["findings"] == []

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    @patch("security_scanner.scanners.semgrep.os.unlink")
    def test_tmp_file_deleted(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        run_semgrep_scan("code", "go")
        assert mock_unlink.called

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    @patch("security_scanner.scanners.semgrep.os.unlink")
    def test_summary_counts_by_severity(self, mock_unlink, mock_run):
        output = json.dumps({"results": [
            {"check_id": "r1", "path": "/f.py", "start": {"line": 1}, "extra": {"severity": "ERROR", "message": "err"}},
            {"check_id": "r2", "path": "/f.py", "start": {"line": 2}, "extra": {"severity": "WARNING", "message": "warn"}},
            {"check_id": "r3", "path": "/f.py", "start": {"line": 3}, "extra": {"severity": "INFO", "message": "info"}},
        ], "errors": []})
        mock_run.return_value = MagicMock(stdout=output, returncode=1)
        result = run_semgrep_scan("code", "python")
        assert result["summary"]["error"] == 1
        assert result["summary"]["warning"] == 1
        assert result["summary"]["info"] == 1


class TestRunDirectorySemgrepScan:
    @patch("security_scanner.scanners.semgrep.subprocess.run")
    def test_creates_output_file(self, mock_run, tmp_path):
        mock_run.return_value = MagicMock(
            stdout=json.dumps({"results": [], "errors": []}), returncode=0
        )
        result = run_directory_semgrep_scan(str(tmp_path), "python")
        assert result["tool"] == "semgrep"
        assert Path(result["output_file"]).exists()

    @patch("security_scanner.scanners.semgrep.subprocess.run")
    def test_returns_total_count(self, mock_run, tmp_path):
        mock_run.return_value = MagicMock(stdout=SEMGREP_OUTPUT, returncode=1)
        result = run_directory_semgrep_scan(str(tmp_path), "python")
        assert result["summary"]["total"] == 1
