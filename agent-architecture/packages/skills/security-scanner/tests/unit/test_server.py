import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


class TestHandleExceptions:
    @pytest.mark.asyncio
    async def test_exception_returns_error_dict(self):
        from security_scanner.server import handle_exceptions

        @handle_exceptions
        async def failing():
            raise RuntimeError("something broke")

        result = await failing()
        assert result["success"] is False
        assert "something broke" in result["error"]

    @pytest.mark.asyncio
    async def test_success_passes_through(self):
        from security_scanner.server import handle_exceptions

        @handle_exceptions
        async def good():
            return {"success": True, "value": 42}

        result = await good()
        assert result == {"success": True, "value": 42}

    @pytest.mark.asyncio
    async def test_value_error_returns_error_dict(self):
        from security_scanner.server import handle_exceptions

        @handle_exceptions
        async def bad_input():
            raise ValueError("bad format")

        result = await bad_input()
        assert result["success"] is False
        assert "bad format" in result["error"]


class TestServerTools:
    @patch("security_scanner.server.run_checkov_scan", return_value={"tool": "checkov", "findings": []})
    @pytest.mark.asyncio
    async def test_scan_with_checkov_delegates(self, mock_scan):
        from security_scanner.server import scan_with_checkov
        result = await scan_with_checkov(code="code", format_type="terraform")
        mock_scan.assert_called_once_with("code", "terraform")
        assert result["tool"] == "checkov"

    @patch("security_scanner.server.run_semgrep_scan", return_value={"tool": "semgrep", "findings": []})
    @pytest.mark.asyncio
    async def test_scan_with_semgrep_delegates(self, mock_scan):
        from security_scanner.server import scan_with_semgrep
        result = await scan_with_semgrep(code="code", language="python")
        mock_scan.assert_called_once_with("code", "python")
        assert result["tool"] == "semgrep"

    @patch("security_scanner.server.run_bandit_scan", return_value={"tool": "bandit", "findings": []})
    @pytest.mark.asyncio
    async def test_scan_with_bandit_delegates(self, mock_scan):
        from security_scanner.server import scan_with_bandit
        result = await scan_with_bandit(code="x = 1")
        mock_scan.assert_called_once_with("x = 1")
        assert result["tool"] == "bandit"

    @patch("security_scanner.server.run_ash_scan", return_value={"success": True, "tool": "ash"})
    @pytest.mark.asyncio
    async def test_scan_directory_with_ash_delegates(self, mock_scan):
        from security_scanner.server import scan_directory_with_ash
        result = await scan_directory_with_ash(directory_path="/tmp")
        mock_scan.assert_called_once_with("/tmp", None, False)
        assert result["tool"] == "ash"

    @patch("security_scanner.server.run_directory_checkov_scan", return_value={"tool": "checkov"})
    @pytest.mark.asyncio
    async def test_scan_directory_with_checkov_delegates(self, mock_scan):
        from security_scanner.server import scan_directory_with_checkov
        result = await scan_directory_with_checkov(directory_path="/tmp")
        mock_scan.assert_called_once_with("/tmp")

    @patch("security_scanner.server.run_directory_semgrep_scan", return_value={"tool": "semgrep"})
    @pytest.mark.asyncio
    async def test_scan_directory_with_semgrep_delegates(self, mock_scan):
        from security_scanner.server import scan_directory_with_semgrep
        result = await scan_directory_with_semgrep(directory_path="/tmp", language="python")
        mock_scan.assert_called_once_with("/tmp", "python")

    @patch("security_scanner.server.run_directory_bandit_scan", return_value={"tool": "bandit"})
    @pytest.mark.asyncio
    async def test_scan_directory_with_bandit_delegates(self, mock_scan):
        from security_scanner.server import scan_directory_with_bandit
        result = await scan_directory_with_bandit(directory_path="/tmp")
        mock_scan.assert_called_once_with("/tmp")

    @patch("security_scanner.server.generate_report", return_value={"success": True, "report": "# Security Report"})
    @pytest.mark.asyncio
    async def test_generate_security_report_delegates(self, mock_report):
        from security_scanner.server import generate_security_report
        result = await generate_security_report(project_name="MyProject", scan_results='{"tool":"checkov"}')
        mock_report.assert_called_once_with("MyProject", '{"tool":"checkov"}')
        assert result["success"] is True

    @patch("security_scanner.server.run_ash_scan", return_value={"success": True, "tool": "ash"})
    @pytest.mark.asyncio
    async def test_scan_directory_with_ash_custom_output(self, mock_scan):
        from security_scanner.server import scan_directory_with_ash
        result = await scan_directory_with_ash(
            directory_path="/tmp",
            output_dir="/custom/out",
            delta_scan=True,
        )
        mock_scan.assert_called_once_with("/tmp", "/custom/out", True)
        assert result["tool"] == "ash"

    @patch("security_scanner.server.run_directory_semgrep_scan", return_value={"tool": "semgrep"})
    @pytest.mark.asyncio
    async def test_scan_directory_with_semgrep_no_language(self, mock_scan):
        from security_scanner.server import scan_directory_with_semgrep
        result = await scan_directory_with_semgrep(directory_path="/tmp")
        mock_scan.assert_called_once_with("/tmp", "")


class TestMainEntryPoint:
    @patch.dict("os.environ", {}, clear=True)
    @patch("security_scanner.server.mcp.run")
    def test_main_stdio_by_default(self, mock_run):
        from security_scanner.server import main
        main()
        mock_run.assert_called_once_with(transport="stdio")

    @patch.dict("os.environ", {"MCP_TRANSPORT": "sse"})
    @patch("security_scanner.server.mcp.run")
    def test_main_sse_transport(self, mock_run):
        from security_scanner.server import main
        main()
        mock_run.assert_called_once_with(transport="sse", host="0.0.0.0", port=8765)
