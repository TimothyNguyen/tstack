"""Draw.io MCP server - Open diagrams in draw.io editor."""

__version__ = "1.3.2"
__author__ = "JGraph Ltd"

from .server import mcp, open_drawio_xml, open_drawio_csv, open_drawio_mermaid

__all__ = ["mcp", "open_drawio_xml", "open_drawio_csv", "open_drawio_mermaid"]
