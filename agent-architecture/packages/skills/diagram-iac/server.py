#!/usr/bin/env python3
"""
Diagram IaC MCP Server - FastMCP wrapper for diagram-as-code (awsdac).
Generate AWS architecture diagrams from YAML infrastructure definitions.
"""

import asyncio
import base64
import json
import logging
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Literal, Optional

from fastmcp import FastMCP
from pydantic import BaseModel, Field

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

mcp = FastMCP("diagram-iac", "0.1.0")

# Check for awsdac CLI
AWSDAC_PATH = os.getenv("AWSDAC_PATH", "awsdac")


class GenerateIacDiagramInput(BaseModel):
    """Input for generate_iac_diagram tool."""
    yaml_content: str = Field(
        description="YAML infrastructure definition for AWS architecture"
    )
    output_format: Optional[Literal["png", "svg", "drawio", "all"]] = Field(
        default="all",
        description="Output format: png, svg, drawio, or all. Default: all"
    )
    output_path: Optional[str] = Field(
        default=None,
        description="Custom output directory"
    )


def check_awsdac_available() -> tuple[bool, Optional[str]]:
    """Check if awsdac CLI is available."""
    try:
        result = subprocess.run(
            [AWSDAC_PATH, "--version"],
            capture_output=True,
            timeout=5,
            text=True
        )
        if result.returncode == 0:
            return True, result.stdout.strip()
        return False, "awsdac returned error"
    except FileNotFoundError:
        return False, f"awsdac not found at {AWSDAC_PATH}"
    except subprocess.TimeoutExpired:
        return False, "awsdac timeout"
    except Exception as e:
        return False, str(e)


def validate_yaml(yaml_content: str) -> tuple[bool, str]:
    """Validate YAML syntax."""
    try:
        import yaml
        yaml.safe_load(yaml_content)
        return True, ""
    except ImportError:
        # Fallback: basic YAML validation without full parser
        if "DiagramName:" in yaml_content or "Resources:" in yaml_content:
            return True, ""
        return False, "YAML missing required fields (DiagramName, Resources)"
    except Exception as e:
        return False, f"YAML error: {str(e)}"


async def generate_diagram_internal(
    yaml_content: str,
    output_format: Literal["png", "svg", "drawio", "all"] = "all",
    output_path: Optional[str] = None,
) -> dict:
    """
    Generate AWS architecture diagram from YAML.

    Returns dict with:
    - success: bool
    - diagram_path: str
    - preview: base64 PNG
    - error: optional error message
    """
    # Check awsdac availability
    available, version_info = check_awsdac_available()
    if not available:
        return {
            "success": False,
            "error": f"awsdac CLI not available: {version_info}. Install with: brew install awsdac"
        }

    # Validate YAML
    valid, error = validate_yaml(yaml_content)
    if not valid:
        return {"success": False, "error": error}

    # Create workspace
    if output_path:
        work_dir = Path(output_path)
        work_dir.mkdir(parents=True, exist_ok=True)
    else:
        work_dir = Path(tempfile.gettempdir()) / "diagram-iac"
        work_dir.mkdir(parents=True, exist_ok=True)

    # Write YAML to temp file
    yaml_file = work_dir / "architecture.yaml"
    try:
        yaml_file.write_text(yaml_content)
    except Exception as e:
        return {"success": False, "error": f"Failed to write YAML: {e}"}

    # Generate diagram via awsdac
    png_file = work_dir / "architecture.png"
    try:
        result = subprocess.run(
            [AWSDAC_PATH, str(yaml_file), "-o", str(png_file)],
            capture_output=True,
            timeout=30,
            text=True,
            cwd=str(work_dir)
        )

        if result.returncode != 0:
            error_msg = result.stderr or result.stdout or "Unknown error"
            return {
                "success": False,
                "error": f"awsdac failed: {error_msg}"
            }

        if not png_file.exists():
            return {
                "success": False,
                "error": "PNG file not generated"
            }

        # Generate preview
        preview = ""
        try:
            with open(png_file, "rb") as f:
                preview = base64.b64encode(f.read()).decode()
        except Exception as e:
            logger.warning(f"Failed to create preview: {e}")

        # Generate other formats (stub - requires additional tools)
        paths = {"png": str(png_file)}

        return {
            "success": True,
            "diagram_path": str(png_file),
            "paths": paths,
            "preview": preview,
            "size_bytes": png_file.stat().st_size if png_file.exists() else 0
        }

    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Diagram generation timeout (>30s)"}
    except Exception as e:
        logger.error(f"Diagram generation error: {e}")
        return {"success": False, "error": str(e)}
    finally:
        # Cleanup YAML temp file
        try:
            yaml_file.unlink()
        except:
            pass


def list_aws_resources_internal(category: Optional[str] = None) -> dict:
    """List available AWS resources for diagram generation."""
    aws_resources = {
        "compute": [
            "EC2", "ECS", "EKS", "Lambda", "ElasticBeanstalk", "AppRunner", "LightSail"
        ],
        "storage": [
            "S3", "EBS", "EFS", "Glacier", "Backup", "DataSync", "StorageGateway"
        ],
        "database": [
            "RDS", "DynamoDB", "ElastiCache", "DocumentDB", "Neptune", "QLDB", "Redshift"
        ],
        "network": [
            "VPC", "Subnet", "SecurityGroup", "NatGateway", "InternetGateway",
            "ELB", "ALB", "NLB", "VPNGateway", "DirectConnect", "CloudFront", "Route53"
        ],
        "security": [
            "IAM", "KMS", "SecretsManager", "CertificateManager", "WAF", "Shield", "Macie"
        ],
        "integration": [
            "SQS", "SNS", "Kinesis", "EventBridge", "AppFlow", "MQ", "StepFunctions"
        ],
        "monitoring": [
            "CloudWatch", "CloudTrail", "XRay", "PersonalHealthDashboard", "ServiceLens"
        ],
        "management": [
            "Systems Manager", "CloudFormation", "OpsWorks", "ConfigService", "Trusted Advisor"
        ],
    }

    if category:
        if category in aws_resources:
            return {
                "success": True,
                "category": category,
                "resources": aws_resources[category]
            }
        return {
            "success": False,
            "error": f"Category '{category}' not found. Available: {list(aws_resources.keys())}"
        }

    return {
        "success": True,
        "categories": list(aws_resources.keys()),
        "resources": aws_resources,
        "total_resources": sum(len(v) for v in aws_resources.values())
    }


@mcp.tool()
async def generate_iac_diagram(
    yaml_content: str,
    output_format: Optional[str] = "all",
    output_path: Optional[str] = None,
) -> str:
    """
    Generate AWS architecture diagram from YAML infrastructure definition.

    YAML format:
    ```
    DiagramName: "My Architecture"
    Groups:
      - Name: "Web Tier"
        Resources:
          - Type: EC2
            Label: "Web Server"
      - Name: "Database"
        Resources:
          - Type: RDS
            Label: "PostgreSQL"
    Connections:
      - Source: ["Web Server"]
        Target: ["PostgreSQL"]
    ```
    """
    if not yaml_content or not isinstance(yaml_content, str):
        return f"Error: yaml_content required (string), got {type(yaml_content).__name__}"

    result = await generate_diagram_internal(yaml_content, output_format, output_path)

    if not result.get("success"):
        return f"Error: {result.get('error', 'Unknown error')}"

    return f"""AWS Architecture Diagram Generated ✅

Diagram: {result.get('diagram_path', 'generated')}
File size: {result.get('size_bytes', 0)} bytes

Available formats:
  - PNG: {result.get('paths', {}).get('png', 'N/A')}

Next steps:
1. Use diagram-export skill to convert formats
2. Upload PNG to draw.io for editing
3. Share or embed in documentation

Tips:
- Edit YAML and regenerate for iterations
- Use Groups to organize resources
- Connect related resources with Connections
- Check AWS icon library with list_aws_resources"""


@mcp.tool()
async def list_aws_resources(category: Optional[str] = None) -> str:
    """List available AWS resources for diagram generation."""
    result = list_aws_resources_internal(category)

    if not result.get("success"):
        return f"Error: {result.get('error')}"

    if category:
        resources = result.get("resources", [])
        return f"AWS Resources in '{category}':\n\n" + "\n".join(f"  - {r}" for r in resources)

    # Full list
    lines = ["AWS Resources by Category:\n"]
    for cat, resources in result.get("resources", {}).items():
        lines.append(f"\n{cat.upper()} ({len(resources)}):")
        for r in resources[:5]:
            lines.append(f"  - {r}")
        if len(resources) > 5:
            lines.append(f"  ... and {len(resources) - 5} more")

    return "\n".join(lines) + f"\n\nTotal: {result.get('total_resources')} resources"


def main():
    """MCP server entry point."""
    available, info = check_awsdac_available()
    if not available:
        print(f"WARNING: awsdac CLI not available: {info}", file=sys.stderr)
        print("Install with: brew install awsdac (macOS) or go install github.com/awslabs/diagram-as-code/cmd/awsdac@latest", file=sys.stderr)

    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
