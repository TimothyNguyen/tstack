import pytest
from pathlib import Path

from security_scanner.scanners.bandit import run_bandit_scan

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.mark.integration
class TestBanditIntegration:
    def test_python_finds_known_issues(self):
        code = (FIXTURES / "insecure.py").read_text()
        result = run_bandit_scan(code)
        assert result["tool"] == "bandit"
        assert result["total_issues"] > 0
        for finding in result["findings"]:
            assert "test_id" in finding
            assert "issue_severity" in finding
            assert finding["issue_severity"] in ("HIGH", "MEDIUM", "LOW")

    def test_clean_code_no_findings(self):
        result = run_bandit_scan("x = 1 + 2\nprint(x)\n")
        assert result["tool"] == "bandit"
        assert result["total_issues"] == 0
