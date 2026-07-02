import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from security_scanner.scanners.checkov import (
    SUPPORTED_FORMATS,
    _parse_checkov_output,
    run_checkov_scan,
    run_directory_checkov_scan,
)

FAILED_OUTPUT = json.dumps({
    "results": {
        "passed_checks": [{"check_id": "CKV_AWS_1"}],
        "failed_checks": [
            {
                "check_id": "CKV_AWS_2",
                "severity": "HIGH",
                "resource": "aws_s3_bucket.test",
                "file_path": "/tmp/foo.tf",
                "file_line_range": [1, 5],
                "guideline": "https://docs.aws.amazon.com/s3",
            }
        ],
    },
    "summary": {"passed": 1, "failed": 1},
})


class TestRunCheckovScan:
    def test_unsupported_format_raises(self):
        with pytest.raises(ValueError, match="Unsupported format"):
            run_checkov_scan("code", "yaml")

    @patch("security_scanner.scanners.checkov.subprocess.run")
    @patch("security_scanner.scanners.checkov.os.unlink")
    def test_returns_findings_for_terraform(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout=FAILED_OUTPUT, returncode=1)
        result = run_checkov_scan("resource aws_s3_bucket test {}", "terraform")
        assert result["tool"] == "checkov"
        assert result["format_type"] == "terraform"
        assert len(result["findings"]) == 1
        assert result["findings"][0]["check_id"] == "CKV_AWS_2"
        assert result["total_issues"] == 1

    @patch("security_scanner.scanners.checkov.subprocess.run")
    @patch("security_scanner.scanners.checkov.os.unlink")
    def test_clean_scan_empty_findings(self, mock_unlink, mock_run):
        clean = json.dumps({"results": {"passed_checks": [{"check_id": "CKV_AWS_1"}], "failed_checks": []}, "summary": {"passed": 1, "failed": 0}})
        mock_run.return_value = MagicMock(stdout=clean, returncode=0)
        result = run_checkov_scan("resource aws_s3_bucket test {}", "terraform")
        assert result["findings"] == []
        assert result["total_issues"] == 0

    @patch("security_scanner.scanners.checkov.subprocess.run")
    @patch("security_scanner.scanners.checkov.os.unlink")
    def test_empty_stdout_returns_empty(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        result = run_checkov_scan("", "kubernetes")
        assert result["findings"] == []
        assert result["total_issues"] == 0

    @patch("security_scanner.scanners.checkov.subprocess.run")
    @patch("security_scanner.scanners.checkov.os.unlink")
    def test_parse_error_returns_empty(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="not json", returncode=1)
        result = run_checkov_scan("", "cloudformation")
        assert result["findings"] == []

    @patch("security_scanner.scanners.checkov.subprocess.run")
    @patch("security_scanner.scanners.checkov.os.unlink")
    def test_all_formats_accepted(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        for fmt in SUPPORTED_FORMATS:
            result = run_checkov_scan("code", fmt)
            assert result["tool"] == "checkov"

    @patch("security_scanner.scanners.checkov.subprocess.run")
    @patch("security_scanner.scanners.checkov.os.unlink")
    def test_tmp_file_deleted_on_success(self, mock_unlink, mock_run):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        run_checkov_scan("code", "terraform")
        assert mock_unlink.called

    @patch("security_scanner.scanners.checkov.subprocess.run")
    @patch("security_scanner.scanners.checkov.os.unlink")
    def test_multi_framework_output(self, mock_unlink, mock_run):
        multi = json.dumps([
            {"results": {"passed_checks": [], "failed_checks": [{"check_id": "CKV_K8S_1", "severity": "MEDIUM", "resource": "Pod.test"}]}, "summary": {"passed": 0, "failed": 1}},
            {"results": {"passed_checks": [{"check_id": "CKV_K8S_2"}], "failed_checks": []}, "summary": {"passed": 1, "failed": 0}},
        ])
        mock_run.return_value = MagicMock(stdout=multi, returncode=1)
        result = run_checkov_scan("code", "kubernetes")
        assert result["total_issues"] == 1
        assert len(result["findings"]) == 1


class TestRunDirectoryCheckovScan:
    @patch("security_scanner.scanners.checkov.subprocess.run")
    def test_creates_output_file(self, mock_run, tmp_path):
        mock_run.return_value = MagicMock(
            stdout=json.dumps({"summary": {"passed": 2, "failed": 0}}), returncode=0
        )
        result = run_directory_checkov_scan(str(tmp_path))
        assert result["tool"] == "checkov"
        assert Path(result["output_file"]).exists()

    @patch("security_scanner.scanners.checkov.subprocess.run")
    def test_returns_summary_counts(self, mock_run, tmp_path):
        mock_run.return_value = MagicMock(
            stdout=json.dumps({"summary": {"passed": 3, "failed": 2}}), returncode=1
        )
        result = run_directory_checkov_scan(str(tmp_path))
        assert result["summary"]["passed"] == 3
        assert result["summary"]["failed"] == 2

    @patch("security_scanner.scanners.checkov.subprocess.run")
    def test_empty_stdout_writes_empty_json(self, mock_run, tmp_path):
        mock_run.return_value = MagicMock(stdout="", returncode=0)
        result = run_directory_checkov_scan(str(tmp_path))
        assert Path(result["output_file"]).exists()
