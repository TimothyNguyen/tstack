import pytest
from pathlib import Path

from security_scanner.scanners.checkov import run_checkov_scan, run_directory_checkov_scan

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.mark.integration
class TestCheckovIntegration:
    def test_terraform_scan_returns_correct_shape(self):
        code = (FIXTURES / "insecure.tf").read_text()
        result = run_checkov_scan(code, "terraform")
        assert result["tool"] == "checkov"
        assert result["format_type"] == "terraform"
        assert isinstance(result["findings"], list)
        assert isinstance(result["total_issues"], int)
        for finding in result["findings"]:
            assert "check_id" in finding
            assert "severity" in finding

    def test_kubernetes_scan_returns_correct_shape(self):
        code = (FIXTURES / "insecure_k8s.yaml").read_text()
        result = run_checkov_scan(code, "kubernetes")
        assert result["tool"] == "checkov"
        assert isinstance(result["findings"], list)

    def test_directory_scan_creates_report_file(self, tmp_path):
        import shutil
        shutil.copy(FIXTURES / "insecure.tf", tmp_path / "main.tf")
        result = run_directory_checkov_scan(str(tmp_path))
        assert result["tool"] == "checkov"
        assert Path(result["output_file"]).exists()
        assert Path(result["output_file"]).stat().st_size > 0
