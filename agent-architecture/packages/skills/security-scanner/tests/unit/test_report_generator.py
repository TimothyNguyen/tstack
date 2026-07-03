import json

import pytest

from security_scanner.report_generator import generate_report

CHECKOV_RESULT = {
    "tool": "checkov",
    "format_type": "terraform",
    "findings": [
        {
            "check_id": "CKV_AWS_2",
            "severity": "HIGH",
            "resource": "aws_s3_bucket.test",
            "description": "Ensure S3 Bucket has MFA delete enabled",
            "guideline": "https://docs.aws.amazon.com/s3",
        }
    ],
    "summary": {"high": 1, "medium": 0, "low": 0},
    "total_issues": 1,
}

BANDIT_RESULT = {
    "tool": "bandit",
    "findings": [
        {
            "test_id": "B105",
            "issue_severity": "MEDIUM",
            "issue_text": "Hardcoded password",
            "line_number": 5,
        }
    ],
    "summary": {"high": 0, "medium": 1, "low": 0},
    "total_issues": 1,
}

CRITICAL_RESULT = {
    "tool": "checkov",
    "findings": [
        {"check_id": "CKV_AWS_99", "severity": "CRITICAL", "description": "Critical issue"}
    ],
    "summary": {"critical": 1, "high": 0, "medium": 0, "low": 0},
    "total_issues": 1,
}


class TestGenerateReport:
    def test_invalid_json_returns_error(self):
        result = generate_report("MyProject", "not json")
        assert result["success"] is False
        assert "Invalid JSON" in result["error"]

    def test_single_result_dict_succeeds(self):
        result = generate_report("MyProject", json.dumps(CHECKOV_RESULT))
        assert result["success"] is True
        assert "Security Report" in result["report"]
        assert "MyProject" in result["report"]
        assert result["summary"]["total_findings"] == 1

    def test_multi_result_array(self):
        result = generate_report("MyProject", json.dumps([CHECKOV_RESULT, BANDIT_RESULT]))
        assert result["success"] is True
        assert result["summary"]["total_findings"] == 2
        assert "checkov" in result["summary"]["scanners_used"]
        assert "bandit" in result["summary"]["scanners_used"]

    def test_critical_risk_level(self):
        result = generate_report("MyProject", json.dumps(CRITICAL_RESULT))
        assert result["summary"]["risk_level"] == "CRITICAL"

    def test_high_risk_level(self):
        result = generate_report("MyProject", json.dumps(CHECKOV_RESULT))
        assert result["summary"]["risk_level"] == "HIGH"

    def test_medium_risk_level(self):
        result = generate_report("MyProject", json.dumps(BANDIT_RESULT))
        assert result["summary"]["risk_level"] == "MEDIUM"

    def test_low_risk_level_no_findings(self):
        clean = {"tool": "checkov", "findings": [], "summary": {}, "total_issues": 0}
        result = generate_report("MyProject", json.dumps(clean))
        assert result["summary"]["risk_level"] == "LOW"

    def test_report_contains_stride_table(self):
        result = generate_report("MyProject", json.dumps(CHECKOV_RESULT))
        assert "STRIDE" in result["report"]
        assert "Spoofing" in result["report"]
        assert "Tampering" in result["report"]

    def test_high_severity_section_present(self):
        result = generate_report("MyProject", json.dumps(CHECKOV_RESULT))
        assert "Critical & High Severity Findings" in result["report"]
        assert "CKV_AWS_2" in result["report"]

    def test_medium_severity_table_present(self):
        result = generate_report("MyProject", json.dumps(BANDIT_RESULT))
        assert "Medium & Low Severity Findings" in result["report"]
        assert "B105" in result["report"]

    def test_empty_findings_skips_findings_sections(self):
        clean = {"tool": "checkov", "findings": [], "summary": {}, "total_issues": 0}
        result = generate_report("MyProject", json.dumps(clean))
        assert "Critical & High Severity Findings" not in result["report"]
        assert "Medium & Low Severity Findings" not in result["report"]

    def test_scanner_summary_table_present(self):
        result = generate_report("MyProject", json.dumps(CHECKOV_RESULT))
        assert "| Scanner |" in result["report"]
        assert "Checkov" in result["report"]

    def test_project_name_in_report(self):
        result = generate_report("Acme Corp App", json.dumps(CHECKOV_RESULT))
        assert "Acme Corp App" in result["report"]
