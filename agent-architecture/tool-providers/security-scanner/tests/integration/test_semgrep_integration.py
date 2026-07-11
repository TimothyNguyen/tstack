import pytest
from pathlib import Path

from security_scanner.scanners.semgrep import run_semgrep_scan

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.mark.integration
class TestSemgrepIntegration:
    def test_javascript_scan_returns_correct_shape(self):
        code = (FIXTURES / "insecure.js").read_text()
        result = run_semgrep_scan(code, "javascript")
        assert result["tool"] == "semgrep"
        assert result["language"] == "javascript"
        assert isinstance(result["findings"], list)
        assert isinstance(result["total_issues"], int)
        for finding in result["findings"]:
            assert "rule_id" in finding
            assert "severity" in finding

    def test_python_scan_returns_correct_shape(self):
        code = (FIXTURES / "insecure.py").read_text()
        result = run_semgrep_scan(code, "python")
        assert result["tool"] == "semgrep"
        assert isinstance(result["findings"], list)
