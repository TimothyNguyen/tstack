from unittest.mock import MagicMock, patch
from pathlib import Path

import pytest

from security_scanner.scanners.ash import check_ash_available, run_ash_scan


class TestCheckAshAvailable:
    @patch("security_scanner.scanners.ash.shutil.which", return_value="/usr/local/bin/ash")
    def test_available(self, mock_which):
        available, path = check_ash_available()
        assert available is True
        assert path == "/usr/local/bin/ash"

    @patch("security_scanner.scanners.ash.shutil.which", return_value=None)
    def test_not_available(self, mock_which):
        available, path = check_ash_available()
        assert available is False
        assert path is None


class TestRunAshScan:
    @patch("security_scanner.scanners.ash.check_ash_available", return_value=(False, None))
    def test_ash_not_installed_returns_error(self, mock_check, tmp_path):
        result = run_ash_scan(str(tmp_path))
        assert result["success"] is False
        assert "not installed" in result["error"]

    @patch("security_scanner.scanners.ash.check_ash_available", return_value=(True, "/usr/local/bin/ash"))
    @patch("security_scanner.scanners.ash.subprocess.run")
    def test_successful_scan(self, mock_run, mock_check, tmp_path):
        mock_run.return_value = MagicMock(returncode=0, stdout="Scan complete\n", stderr="")
        result = run_ash_scan(str(tmp_path))
        assert result["success"] is True
        assert result["tool"] == "ash"
        assert "output_file" in result

    @patch("security_scanner.scanners.ash.check_ash_available", return_value=(True, "/usr/local/bin/ash"))
    @patch("security_scanner.scanners.ash.subprocess.run")
    def test_delta_scan_includes_flag(self, mock_run, mock_check, tmp_path):
        mock_run.return_value = MagicMock(returncode=0, stdout="", stderr="")
        run_ash_scan(str(tmp_path), delta_scan=True)
        cmd = mock_run.call_args[0][0]
        assert "--delta-scan" in cmd

    @patch("security_scanner.scanners.ash.check_ash_available", return_value=(True, "/usr/local/bin/ash"))
    @patch("security_scanner.scanners.ash.subprocess.run")
    def test_no_delta_scan_by_default(self, mock_run, mock_check, tmp_path):
        mock_run.return_value = MagicMock(returncode=0, stdout="", stderr="")
        run_ash_scan(str(tmp_path))
        cmd = mock_run.call_args[0][0]
        assert "--delta-scan" not in cmd

    @patch("security_scanner.scanners.ash.check_ash_available", return_value=(True, "/usr/local/bin/ash"))
    @patch("security_scanner.scanners.ash.subprocess.run")
    def test_output_file_contains_stdout(self, mock_run, mock_check, tmp_path):
        mock_run.return_value = MagicMock(returncode=0, stdout="found issues", stderr="")
        result = run_ash_scan(str(tmp_path))
        assert "found issues" in Path(result["output_file"]).read_text()

    @patch("security_scanner.scanners.ash.check_ash_available", return_value=(True, "/usr/local/bin/ash"))
    @patch("security_scanner.scanners.ash.subprocess.run")
    def test_custom_output_dir(self, mock_run, mock_check, tmp_path):
        custom_dir = str(tmp_path / "custom_reports")
        mock_run.return_value = MagicMock(returncode=0, stdout="", stderr="")
        result = run_ash_scan(str(tmp_path), output_dir=custom_dir)
        assert result["output_file"].startswith(custom_dir)

    @patch("security_scanner.scanners.ash.check_ash_available", return_value=(True, "/usr/local/bin/ash"))
    @patch("security_scanner.scanners.ash.subprocess.run")
    def test_nonzero_exit_sets_success_false(self, mock_run, mock_check, tmp_path):
        mock_run.return_value = MagicMock(returncode=1, stdout="issues found", stderr="")
        result = run_ash_scan(str(tmp_path))
        assert result["success"] is False
        assert result["return_code"] == 1
