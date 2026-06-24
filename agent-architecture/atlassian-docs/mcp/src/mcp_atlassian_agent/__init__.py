from __future__ import annotations

import asyncio
import sys
from typing import Any


def main() -> None:
    """Entry point — delegates to mcp_atlassian server."""
    try:
        from mcp_atlassian import main as _main  # type: ignore[import-untyped]
    except ImportError as exc:
        print(f"mcp-atlassian not installed: {exc}", file=sys.stderr)
        sys.exit(1)
    asyncio.run(_main())
