#!/usr/bin/env python3
"""
Official draw.io MCP server for LLMs - Open diagrams in draw.io editor.

Provides tools to open diagrams in the draw.io editor from:
- draw.io XML format
- CSV data (org charts, flowcharts)
- Mermaid.js syntax
"""

import json
import os
import sys
import zlib
import base64
import webbrowser
import urllib.parse
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Optional, Literal

from fastmcp import FastMCP
from pydantic import BaseModel, Field


mcp = FastMCP("drawio-mcp", "2.0.0")

# Configuration
DRAWIO_BASE_URL = os.getenv("DRAWIO_BASE_URL", "https://app.diagrams.net/")

# Load reference documentation
RESOURCES_DIR = Path(__file__).parent
XML_REFERENCE = (RESOURCES_DIR / "xml_reference.md").read_text() if (RESOURCES_DIR / "xml_reference.md").exists() else ""
MERMAID_REFERENCE = (RESOURCES_DIR / "mermaid_reference.md").read_text() if (RESOURCES_DIR / "mermaid_reference.md").exists() else ""


class DarkModeEnum(str):
    """Dark mode setting: auto, true, or false."""
    pass


class OpenDrawioXmlInput(BaseModel):
    """Input for open_drawio_xml tool."""
    content: str = Field(
        description="The draw.io XML content in mxGraphModel format."
    )
    lightbox: Optional[bool] = Field(
        default=False,
        description="Open in lightbox mode (read-only view). Default: false"
    )
    dark: Optional[Literal["auto", "true", "false"]] = Field(
        default="auto",
        description="Dark mode setting. Default: auto"
    )
    routing: Optional[Literal["libavoid"]] = Field(
        default=None,
        description=(
            "Optional obstacle-avoiding orthogonal edge-routing pass (libavoid), "
            "applied server-side before the diagram opens. Set it for hand-placed "
            "diagrams where edges would otherwise cross shapes — architecture, network, "
            "deployment, UML, floor plans. Omit it for sparse layouts."
        )
    )


class OpenDrawioCsvInput(BaseModel):
    """Input for open_drawio_csv tool."""
    content: str = Field(
        description="The CSV content following draw.io's CSV import format."
    )
    lightbox: Optional[bool] = Field(
        default=False,
        description="Open in lightbox mode (read-only view). Default: false"
    )
    dark: Optional[Literal["auto", "true", "false"]] = Field(
        default="auto",
        description="Dark mode setting. Default: auto"
    )


class OpenDrawioMermaidInput(BaseModel):
    """Input for open_drawio_mermaid tool."""
    content: str = Field(
        description="The Mermaid.js diagram definition. Example: 'graph TD; A-->B; B-->C;'"
    )
    lightbox: Optional[bool] = Field(
        default=False,
        description="Open in lightbox mode (read-only view). Default: false"
    )
    dark: Optional[Literal["auto", "true", "false"]] = Field(
        default="auto",
        description="Dark mode setting. Default: auto"
    )


def compress_data(data: str) -> str:
    """
    Compress data using deflateRaw and encode as base64.
    Matches the compression used by draw.io tools.
    """
    if not data:
        return data

    # URL encode first
    encoded = urllib.parse.quote(data)

    # Compress using deflateRaw (zlib.compress with wbits=-15)
    compressed = zlib.compress(encoded.encode(), wbits=-15)

    # Base64 encode
    return base64.b64encode(compressed).decode()


def generate_drawio_url(
    data: str,
    diagram_type: Literal["xml", "csv", "mermaid"],
    lightbox: bool = False,
    dark: Optional[Literal["auto", "true", "false"]] = None,
    border: int = 10,
) -> str:
    """
    Generate a draw.io URL with the #create hash parameter.

    Args:
        data: The diagram content (XML, CSV, or Mermaid)
        diagram_type: Type of diagram format
        lightbox: Open in lightbox mode (read-only)
        dark: Dark mode setting ("auto", "true", "false")
        border: Border size in pixels

    Returns:
        Full draw.io URL
    """
    compressed_data = compress_data(data)

    create_obj = {
        "type": diagram_type,
        "compressed": True,
        "data": compressed_data,
    }

    params = {}

    if lightbox:
        params["lightbox"] = "1"
        params["edit"] = "_blank"
        params["border"] = "10"
    else:
        params["grid"] = "0"
        params["pv"] = "0"

    if dark == "true":
        params["dark"] = "1"
    elif dark == "false":
        params.pop("dark", None)

    if not lightbox:
        params["border"] = str(border)
        params["edit"] = "_blank"

    # Build query string
    params_str = urllib.parse.urlencode(params) if params else ""
    create_hash = "#create=" + urllib.parse.quote(json.dumps(create_obj))

    base = DRAWIO_BASE_URL
    if params_str:
        return f"{base}?{params_str}{create_hash}"
    else:
        return f"{base}{create_hash}"


def apply_libavoid_routing(xml_content: str) -> str:
    """
    Apply libavoid obstacle-avoiding orthogonal edge routing to XML diagram.

    Attempts to use Node.js drawio-mcp wrapper if available (via npx or npm).
    Falls back to unrouted XML if Node.js not available.

    Args:
        xml_content: draw.io XML diagram

    Returns:
        XML with routing applied (or original if routing unavailable)
    """
    try:
        # Try to call Node.js drawio-mcp open_drawio_xml with routing
        # This assumes Node.js version is installed globally or via npx
        result = subprocess.run(
            ["npx", "drawio-mcp@latest"],
            input=json.dumps({
                "method": "route_xml",
                "params": {"content": xml_content, "routing": "libavoid"}
            }).encode(),
            capture_output=True,
            timeout=5,
            text=False
        )

        if result.returncode == 0:
            response = json.loads(result.stdout.decode())
            if "result" in response and response["result"]:
                return response["result"]
    except (FileNotFoundError, subprocess.TimeoutExpired, json.JSONDecodeError, Exception):
        # Node.js not available or call failed
        pass

    # Fallback: return unrouted XML with note
    # Draw.io will apply client-side orthogonal routing if edges marked
    print(
        "Note: libavoid routing requires Node.js drawio-mcp. "
        "Install with: npm install -g drawio-mcp\n"
        "Proceeding with unrouted diagram (client-side orthogonal routing may apply).",
        file=sys.stderr
    )
    return xml_content


def open_browser(url: str) -> None:
    """
    Open URL in default browser (cross-platform).
    """
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"Failed to open browser: {e}", file=sys.stderr)


@mcp.tool()
async def open_drawio_xml(
    content: str,
    lightbox: bool = False,
    dark: str = "auto",
    routing: Optional[str] = None,
) -> str:
    """
    Opens the draw.io editor with a diagram from XML content.

    Use this to view, edit, or create diagrams in draw.io format.
    The XML should be valid draw.io/mxGraph XML format.
    """ + (f"\n\n{XML_REFERENCE}" if XML_REFERENCE else "")

    if not content or not isinstance(content, str):
        return f"Error: content parameter is required and must be a string, got {type(content).__name__}"

    # Handle libavoid routing if requested
    diagram_content = content
    if routing == "libavoid":
        diagram_content = apply_libavoid_routing(content)

    url = generate_drawio_url(diagram_content, "xml", lightbox, dark)
    open_browser(url)

    return f"Draw.io Editor URL:\n{url}\n\nThe diagram has been opened in your default browser."


@mcp.tool()
async def open_drawio_csv(
    content: str,
    lightbox: bool = False,
    dark: str = "auto",
) -> str:
    """
    Opens the draw.io editor with a diagram generated from CSV data.

    The CSV format should follow draw.io's CSV import specification which allows
    creating org charts, flowcharts, and other diagrams from tabular data.
    """

    if not content or not isinstance(content, str):
        return f"Error: content parameter is required and must be a string, got {type(content).__name__}"

    url = generate_drawio_url(content, "csv", lightbox, dark)
    open_browser(url)

    return f"Draw.io Editor URL:\n{url}\n\nThe diagram has been opened in your default browser."


@mcp.tool()
async def open_drawio_mermaid(
    content: str,
    lightbox: bool = False,
    dark: str = "auto",
) -> str:
    """
    Opens the draw.io editor with a diagram generated from Mermaid.js syntax.

    Supports flowcharts, sequence diagrams, class diagrams, state diagrams,
    entity relationship diagrams, and more using Mermaid.js syntax.
    """ + (f"\n\n{MERMAID_REFERENCE}" if MERMAID_REFERENCE else "")

    if not content or not isinstance(content, str):
        return f"Error: content parameter is required and must be a string, got {type(content).__name__}"

    url = generate_drawio_url(content, "mermaid", lightbox, dark)
    open_browser(url)

    return f"Draw.io Editor URL:\n{url}\n\nThe diagram has been opened in your default browser."


def main():
    """Start the MCP server."""
    if len(sys.argv) > 1:
        if sys.argv[1] in ("--help", "-h"):
            print(f"""drawio-mcp 1.3.2

Official draw.io MCP server for opening diagrams in the draw.io editor.

Usage:
  drawio-mcp              Start the MCP stdio server
  drawio-mcp --help       Show this help text
  drawio-mcp --version    Show the package version

Options:
  -h, --help              Show help
  -v, --version           Show version""")
            sys.exit(0)
        elif sys.argv[1] in ("--version", "-v"):
            print("1.3.2")
            sys.exit(0)
        else:
            print(f"Unknown option: {sys.argv[1]}", file=sys.stderr)
            print("Run `drawio-mcp --help` for usage.", file=sys.stderr)
            sys.exit(1)

    # Start MCP server
    mcp.run()


if __name__ == "__main__":
    main()
