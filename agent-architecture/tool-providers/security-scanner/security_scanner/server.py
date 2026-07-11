import os
from functools import wraps
from typing import Any, Callable

from loguru import logger
from mcp.server.fastmcp import FastMCP

from security_scanner.scanners.ash import run_ash_scan
from security_scanner.scanners.bandit import run_bandit_scan, run_directory_bandit_scan
from security_scanner.scanners.checkov import run_checkov_scan, run_directory_checkov_scan
from security_scanner.scanners.semgrep import run_semgrep_scan, run_directory_semgrep_scan
from security_scanner.report_generator import generate_report

mcp = FastMCP("security-scanner")


def handle_exceptions(func: Callable) -> Callable:
    """Catch exceptions in MCP tool handlers; return error dict instead of raising."""
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            logger.exception(f"Error in {func.__name__}")
            return {"success": False, "error": str(e)}
    return wrapper


@mcp.tool()
@handle_exceptions
async def scan_with_checkov(code: str, format_type: str) -> dict:
    """Scan IaC code with Checkov. format_type: terraform|cloudformation|kubernetes|dockerfile|arm|bicep|helm|kustomize"""
    return run_checkov_scan(code, format_type)


@mcp.tool()
@handle_exceptions
async def scan_with_semgrep(code: str, language: str) -> dict:
    """Scan source code with Semgrep. language: python|javascript|typescript|java|go|ruby|php|c|cpp|csharp|rust|kotlin|scala"""
    return run_semgrep_scan(code, language)


@mcp.tool()
@handle_exceptions
async def scan_with_bandit(code: str) -> dict:
    """Scan Python source code with Bandit."""
    return run_bandit_scan(code)


@mcp.tool()
@handle_exceptions
async def scan_directory_with_ash(
    directory_path: str,
    output_dir: str = "",
    delta_scan: bool = False,
) -> dict:
    """Scan a directory with ASH (multi-tool). Requires 'full' Docker target."""
    return run_ash_scan(directory_path, output_dir or None, delta_scan)


@mcp.tool()
@handle_exceptions
async def scan_directory_with_checkov(directory_path: str) -> dict:
    """Scan a directory with Checkov (all supported IaC formats)."""
    return run_directory_checkov_scan(directory_path)


@mcp.tool()
@handle_exceptions
async def scan_directory_with_semgrep(directory_path: str, language: str = "") -> dict:
    """Scan a directory with Semgrep."""
    return run_directory_semgrep_scan(directory_path, language)


@mcp.tool()
@handle_exceptions
async def scan_directory_with_bandit(directory_path: str) -> dict:
    """Scan a Python directory recursively with Bandit."""
    return run_directory_bandit_scan(directory_path)


@mcp.tool()
@handle_exceptions
async def generate_security_report(project_name: str, scan_results: str) -> dict:
    """Generate SECURITY.md report from scan results JSON (single object or array)."""
    return generate_report(project_name, scan_results)


def main() -> None:
    transport = os.getenv("MCP_TRANSPORT", "stdio")
    if transport == "sse":
        mcp.run(transport="sse", host="0.0.0.0", port=8765)
    else:
        mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
