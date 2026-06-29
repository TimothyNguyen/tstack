#!/usr/bin/env python3
"""
Infrastructure Diagram MCP Server - FastMCP implementation.
Generate multi-cloud infrastructure diagrams (AWS, GCP, Azure, K8s).
Ported from andrewmoshu/diagram-mcp-server to FastMCP + Pydantic.
"""

import asyncio
import base64
import json
import logging
import os
import sys
import tempfile
import subprocess
from pathlib import Path
from typing import Literal, Optional
from io import StringIO

from fastmcp import FastMCP
from pydantic import BaseModel, Field

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

mcp = FastMCP("infrastructure-diagram", "0.1.0")

# Check for graphviz
GRAPHVIZ_PATH = os.getenv("GRAPHVIZ_PATH")
try:
    import diagrams
    DIAGRAMS_AVAILABLE = True
except ImportError:
    DIAGRAMS_AVAILABLE = False
    logger.warning("diagrams package not installed. Install with: pip install diagrams")


class DiagramGenerateInput(BaseModel):
    """Input for generate_infrastructure_diagram tool."""
    code: str = Field(
        description="Python diagrams DSL code. Example: from diagrams import Diagram\\nfrom diagrams.aws.compute import EC2\\nwith Diagram('My Arch'): EC2('web')"
    )
    diagram_name: Optional[str] = Field(
        default=None,
        description="Diagram filename (auto-generated if not provided)"
    )
    output_format: Optional[Literal["png", "svg", "drawio", "all"]] = Field(
        default="all",
        description="Output format: png, svg, drawio, or all. Default: all"
    )
    workspace_dir: Optional[str] = Field(
        default=None,
        description="Custom workspace directory (default: temp directory)"
    )


class ListIconsInput(BaseModel):
    """Input for list_available_icons tool."""
    provider: Optional[Literal["aws", "gcp", "azure", "k8s", "all"]] = Field(
        default="all",
        description="Cloud provider: aws, gcp, azure, k8s, or all"
    )
    category: Optional[str] = Field(
        default=None,
        description="Filter by category (e.g., 'compute', 'network'). Optional."
    )


def validate_diagram_code(code: str) -> tuple[bool, str]:
    """Validate Python diagrams code syntax."""
    try:
        compile(code, "<string>", "exec")
        return True, ""
    except SyntaxError as e:
        return False, f"Syntax error at line {e.lineno}: {e.msg}"


async def generate_diagram_internal(
    code: str,
    diagram_name: Optional[str] = None,
    output_format: Literal["png", "svg", "drawio", "all"] = "all",
    workspace_dir: Optional[str] = None,
) -> dict:
    """
    Generate infrastructure diagram from Python diagrams DSL code.

    Returns dict with:
    - success: bool
    - diagram_name: str
    - paths: dict of format → filepath
    - preview: base64 PNG for preview
    - code_lines: int (for validation)
    """
    if not DIAGRAMS_AVAILABLE:
        return {
            "success": False,
            "error": "diagrams package not installed. Install with: pip install diagrams graphviz"
        }

    # Validate code
    valid, error = validate_diagram_code(code)
    if not valid:
        return {"success": False, "error": error}

    # Generate diagram name
    if not diagram_name:
        import uuid
        diagram_name = f"diagram-{uuid.uuid4().hex[:8]}"

    # Create workspace
    if workspace_dir:
        work_path = Path(workspace_dir)
        work_path.mkdir(parents=True, exist_ok=True)
    else:
        work_path = Path(tempfile.gettempdir()) / "diagram-infra"
        work_path.mkdir(parents=True, exist_ok=True)

    diagram_file = work_path / diagram_name

    try:
        # Set up environment for diagram rendering
        env = os.environ.copy()
        if GRAPHVIZ_PATH:
            env["PATH"] = GRAPHVIZ_PATH + ":" + env.get("PATH", "")

        # Execute diagram code in isolated namespace
        namespace = {
            "__name__": "__main__",
            "Diagram": diagrams.Diagram,
            "Cluster": diagrams.Cluster,
            "Edge": diagrams.Edge,
        }

        # Add provider imports
        try:
            from diagrams.aws import compute as aws_compute
            from diagrams.aws import database, network, security
            namespace["aws_compute"] = aws_compute
            namespace["aws_database"] = database
            namespace["aws_network"] = network
            namespace["aws_security"] = security
        except ImportError:
            pass

        try:
            from diagrams.gcp import compute as gcp_compute
            from diagrams.gcp import storage, database as gcp_db
            namespace["gcp_compute"] = gcp_compute
            namespace["gcp_storage"] = storage
            namespace["gcp_db"] = gcp_db
        except ImportError:
            pass

        try:
            from diagrams.azure import compute as azure_compute
            from diagrams.azure import database as azure_db
            namespace["azure_compute"] = azure_compute
            namespace["azure_db"] = azure_db
        except ImportError:
            pass

        try:
            from diagrams import k8s
            namespace["k8s"] = k8s
        except ImportError:
            pass

        # Change to workspace directory for diagram generation
        old_cwd = os.getcwd()
        try:
            os.chdir(work_path)

            # Execute user code (generates .png by default)
            exec(code, namespace)

        finally:
            os.chdir(old_cwd)

        # Check if PNG was generated
        png_path = diagram_file.with_suffix(".png")
        if not png_path.exists():
            return {
                "success": False,
                "error": f"Diagram generation failed. Check code syntax and imports."
            }

        # Generate other formats if requested
        paths = {"png": str(png_path)}

        if output_format in ["svg", "all"]:
            svg_path = convert_format(str(png_path), "svg")
            if svg_path:
                paths["svg"] = svg_path

        if output_format in ["drawio", "all"]:
            drawio_path = convert_format(str(png_path), "drawio")
            if drawio_path:
                paths["drawio"] = drawio_path

        # Create preview (base64 PNG)
        preview = ""
        if png_path.exists():
            with open(png_path, "rb") as f:
                preview = base64.b64encode(f.read()).decode()

        return {
            "success": True,
            "diagram_name": diagram_name,
            "paths": paths,
            "preview": preview,
            "code_lines": len(code.split("\n"))
        }

    except Exception as e:
        logger.error(f"Diagram generation error: {e}")
        return {
            "success": False,
            "error": str(e)
        }


def convert_format(png_path: str, target_format: str) -> Optional[str]:
    """Convert PNG to target format (svg, drawio, etc)."""
    try:
        # This is a stub - full conversion requires additional tools
        # SVG: potrace or other vectorizer
        # DRAWIO: custom converter or use graphviz directly
        logger.info(f"Format conversion ({target_format}) requires external tools. Install with: pip install potrace")
        return None
    except Exception as e:
        logger.warning(f"Format conversion failed: {e}")
        return None


def list_icons_internal(
    provider: Literal["aws", "gcp", "azure", "k8s", "all"] = "all",
    category: Optional[str] = None,
) -> dict:
    """List available icons for diagram generation."""
    if not DIAGRAMS_AVAILABLE:
        return {"success": False, "error": "diagrams package not installed"}

    icons = {}

    # AWS icons
    if provider in ["aws", "all"]:
        try:
            from diagrams import aws as aws_mod
            aws_categories = {}
            for attr_name in dir(aws_mod):
                if not attr_name.startswith("_"):
                    attr = getattr(aws_mod, attr_name)
                    if hasattr(attr, "__path__"):  # It's a module/package
                        icons_list = []
                        try:
                            for icon_name in dir(attr):
                                if not icon_name.startswith("_") and icon_name[0].isupper():
                                    icons_list.append(icon_name)
                        except:
                            pass
                        if icons_list:
                            aws_categories[attr_name] = icons_list[:10]  # Limit to first 10
            icons["aws"] = aws_categories
        except Exception as e:
            logger.warning(f"Error loading AWS icons: {e}")

    # GCP icons
    if provider in ["gcp", "all"]:
        icons["gcp"] = {
            "compute": ["GCE", "GKE", "CloudRun", "AppEngine"],
            "storage": ["GCS", "CloudSQL", "Firestore"],
            "network": ["VPC", "LoadBalancing", "CloudDNS"]
        }

    # Azure icons
    if provider in ["azure", "all"]:
        icons["azure"] = {
            "compute": ["VM", "AppService", "AKS", "FunctionApps"],
            "database": ["CosmosDB", "SQLDatabase", "MySQLDatabase"],
            "network": ["VirtualNetwork", "LoadBalancer", "ApplicationGateway"]
        }

    # Kubernetes icons
    if provider in ["k8s", "all"]:
        icons["k8s"] = {
            "compute": ["Pod", "Deployment", "StatefulSet", "DaemonSet"],
            "network": ["Service", "Ingress", "NetworkPolicy"],
            "storage": ["PersistentVolume", "PersistentVolumeClaim"]
        }

    # Apply category filter
    if category:
        filtered = {}
        for prov, cats in icons.items():
            if category in cats:
                filtered[prov] = {category: cats[category]}
        icons = filtered

    return {
        "success": True,
        "icons": icons,
        "total_providers": len(icons),
        "note": "Use in diagram code: from diagrams.aws.compute import EC2"
    }


@mcp.tool()
async def generate_infrastructure_diagram(
    code: str,
    diagram_name: Optional[str] = None,
    output_format: Optional[str] = "all",
    workspace_dir: Optional[str] = None,
) -> str:
    """
    Generate infrastructure diagram from Python diagrams DSL code.

    Supports AWS, GCP, Azure, Kubernetes, hybrid, and multi-cloud architectures.
    """
    if not code or not isinstance(code, str):
        return f"Error: code parameter required (string), got {type(code).__name__}"

    result = await generate_diagram_internal(
        code, diagram_name, output_format, workspace_dir
    )

    if not result.get("success"):
        return f"Error: {result.get('error', 'Unknown error')}"

    paths = result.get("paths", {})
    path_str = "\n".join(f"  - {fmt}: {path}" for fmt, path in paths.items())

    preview_msg = f"(Preview available as base64 PNG, {len(result.get('preview', ''))} bytes)"

    return f"""Infrastructure Diagram Generated ✅

Diagram: {result['diagram_name']}
Code lines: {result['code_lines']}

Output Files:
{path_str}

{preview_msg}

Next steps:
- Use diagram-export skill to convert formats
- Or upload PNG to draw.io for editing
- Use diagram-validate to check completeness"""


@mcp.tool()
async def list_available_icons(
    provider: Optional[str] = "all",
    category: Optional[str] = None,
) -> str:
    """List available icons for diagram generation by cloud provider."""
    if provider and provider not in ["aws", "gcp", "azure", "k8s", "all"]:
        return f"Error: provider must be aws, gcp, azure, k8s, or all. Got: {provider}"

    result = list_icons_internal(provider or "all", category)

    if not result.get("success"):
        return f"Error: {result.get('error')}"

    # Format output
    lines = []
    for prov, categories in result.get("icons", {}).items():
        lines.append(f"\n{prov.upper()}:")
        for cat, icon_list in categories.items():
            icons_str = ", ".join(icon_list)
            lines.append(f"  {cat}: {icons_str}")

    return f"""Available Icons:
{''.join(chr(10) + line for line in lines)}

Usage: from diagrams.{provider}.{list(result.get('icons', {}).values())[0]} import <IconName>"""


def main():
    """MCP server entry point."""
    if not DIAGRAMS_AVAILABLE:
        print("ERROR: diagrams package not installed.", file=sys.stderr)
        print("Install with: pip install diagrams graphviz", file=sys.stderr)
        sys.exit(1)

    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
