import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from security_scanner.scanners.bandit import (
    _parse_bandit_output,
    run_bandit_scan,
    run_directory_bandit_scan,
)

BANDIT_OUTPUT = json.dumps({
    "results": [
        {
            "test_id": "B105",
            "test_name": "hardcoded_password_string",
            "issue_severity": "HIGH",
            "issue_confidence": "MEDIUM",
            "issue_text": "Possible hardcoded password: 'secret'",
            "line_number": 3,
            "filename": "/tmp/foo.py",
            "code": "password = 'secret'",
        }
    ],
    "metrics": {
        "_totals": {
            "SEVERITY.HIGH": 1,
            "SEVERITY.MEDIUM": 0,
            "SEVERITY.LOW": 0,
        }
    },
})


class TestRunBanditScan:
    @patch("security_scanner.scanners.bandit.subprocess.run")
    @patch("security_scanner.scanners.bandit.os.unlink")
    def test_findings_present(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout=BANDIT_OUTPUT, returncode=1)
        result = run_bandit_scan("password = 'secret'")
        assert result["tool"] == "bandit"
        assert len(result["findings"]) == 1
        assert result["findings"][0]["test_id"] == "B105"
        assert result["findings"][0]["issue_severity"] == "HIGH"
        assert result["total_issues"] == 1

    @patch("security_scanner.scanners.bandit.subprocess.run")
    @patch("security_scanner.scanners.bandit.os.unlink")
    def test_clean_scan_empty_findings(self, mock_unlink, mock_run):
        clean = json.dumps({
            "results": [],
            "metrics": {"_totals": {"SEVERITY.HIGH": 0, "SEVERITY.MEDIUM": 0, "SEVERITY.LOW": 0}},
        })
        mock_run.return_value = MagicMock(stdout=clean, returncode=0)
        result = run_bandit_scan("x = 1")
        assert result["findings"] == []
        assert result["total_issues"] == 0

    @patch("security_scanner.scanners.bandit.subprocess.run")
    @patch("security_scanner.scanners.bandit.os.unlink")
    def test_empty_stdout_returns_empty(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        result = run_bandit_scan("")
        assert result["findings"] == []

    @patch("security_scanner.scanners.bandit.subprocess.run")
    @patch("security_scanner.scanners.bandit.os.unlink")
    def test_parse_error_returns_empty(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="not json", returncode=1)
        result = run_bandit_scan("code")
        assert result["findings"] == []

    @patch("security_scanner.scanners.bandit.subprocess.run")
    @patch("security_scanner.scanners.bandit.os.unlink")
    def test_tmp_file_deleted(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        run_bandit_scan("code")
        assert mock_unlink.called

    @patch("security_scanner.scanners.bandit.subprocess.run")
    @patch("security_scanner.scanners.bandit.os.unlink")
    def test_summary_severity_counts(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout=BANDIT_OUTPUT, returncode=1)
        result = run_bandit_scan("password = 'secret'")
        assert result["summary"]["high"] == 1
        assert result["summary"]["medium"] == 0
        assert result["summary"]["low"] == 0


class TestRunDirectoryBanditScan:
    @patch("security_scanner.scanners.bandit.subprocess.run")
    def test_creates_output_file(self, mock_run, tmp_path):
        mock_run.return_value = MagicMock(
            stdout=json.dumps({"results": [], "metrics": {"_totals": {}}}), returncode=0
        )
        result = run_directory_bandit_scan(str(tmp_path))
        assert result["tool"] == "bandit"
        assert Path(result["output_file"]).exists()

    @patch("security_scanner.scanners.bandit.subprocess.run")
    def test_returns_summary(self, mock_run, tmp_path):
        mock_run.return_value = MagicMock(stdout=BANDIT_OUTPUT, returncode=1)
        result = run_directory_bandit_scan(str(tmp_path))
        assert result["summary"]["high"] == 1
        assert result["summary"]["total"] == 1
