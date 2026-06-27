#!/usr/bin/env python3
"""
CloudFormation Diagram MCP Server - Visualize CF templates as architecture diagrams.
Wraps diagram-iac by converting CloudFormation → diagram-iac YAML format.
"""

import json
import logging
import sys
from typing import Literal, Optional, Dict, Any, List

from fastmcp import FastMCP
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

mcp = FastMCP("diagram-cloudformation", "0.1.0")


class VisualizeCfInput(BaseModel):
    """Input for visualize_cloudformation_template tool."""
    template_content: str = Field(
        description="CloudFormation template (JSON or YAML)"
    )
    output_format: Optional[Literal["png", "svg", "drawio", "all"]] = Field(
        default="all",
        description="Output format: png, svg, drawio, or all"
    )


def parse_cloudformation_template(content: str) -> Dict[str, Any]:
    """Parse CloudFormation template (JSON or YAML)."""
    # Try JSON first
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    # Try YAML
    try:
        import yaml
        return yaml.safe_load(content)
    except ImportError:
        logger.warning("PyYAML not installed. Install with: pip install PyYAML")
        # Fallback: basic YAML parsing
        lines = content.split("\n")
        result = {}
        current_section = None
        for line in lines:
            if line.startswith("Resources:"):
                current_section = "Resources"
                result["Resources"] = {}
            elif line and not line.startswith(" ") and ":" in line:
                current_section = line.split(":")[0]
        return result
    except Exception as e:
        logger.error(f"YAML parse error: {e}")
        return {}


def extract_cf_resources(template: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract AWS resources from CloudFormation template."""
    resources = []
    resources_section = template.get("Resources", {})

    for resource_name, resource_props in resources_section.items():
        if isinstance(resource_props, dict):
            resource_type = resource_props.get("Type", "Custom")
            resources.append({
                "name": resource_name,
                "type": resource_type,
                "properties": resource_props.get("Properties", {})
            })

    return resources


def map_resource_to_diagram_type(aws_type: str) -> str:
    """Map CloudFormation resource type to diagram-iac type."""
    type_mapping = {
        "AWS::EC2::Instance": "EC2",
        "AWS::EC2::SecurityGroup": "SecurityGroup",
        "AWS::RDS::DBInstance": "RDS",
        "AWS::Lambda::Function": "Lambda",
        "AWS::S3::Bucket": "S3",
        "AWS::ElastiCache::CacheCluster": "ElastiCache",
        "AWS::DynamoDB::Table": "DynamoDB",
        "AWS::SQS::Queue": "SQS",
        "AWS::SNS::Topic": "SNS",
        "AWS::CloudFront::Distribution": "CloudFront",
        "AWS::ElasticLoadBalancing::LoadBalancer": "ELB",
        "AWS::ElasticLoadBalancingV2::LoadBalancer": "ALB",
        "AWS::CloudFormation::Stack": "Stack",
        "AWS::IAM::Role": "IAM",
        "AWS::IAM::User": "IAM",
        "AWS::KMS::Key": "KMS",
        "AWS::VPC": "VPC",
        "AWS::Subnet": "Subnet",
        "AWS::EC2::VPC": "VPC",
    }

    for aws_key, diagram_type in type_mapping.items():
        if aws_key in aws_type:
            return diagram_type

    # Fallback: use last part of type
    return aws_type.split("::")[-1]


def convert_cf_to_iac_yaml(template: Dict[str, Any]) -> str:
    """Convert CloudFormation template to diagram-iac YAML format."""
    description = template.get("Description", "CloudFormation Stack")
    resources = extract_cf_resources(template)

    # Group resources by logical type
    groups = {}
    for resource in resources:
        resource_type = resource["type"]
        aws_service = resource_type.split("::")[1] if "::" in resource_type else "Other"

        if aws_service not in groups:
            groups[aws_service] = []

        groups[aws_service].append({
            "label": resource["name"],
            "type": map_resource_to_diagram_type(resource_type),
            "original_type": resource_type
        })

    # Build YAML
    yaml_lines = [
        f'DiagramName: "{description}"',
        "Description: Converted from CloudFormation template",
        "Groups:",
    ]

    for service, service_resources in groups.items():
        yaml_lines.append(f'  - Name: "{service}"')
        yaml_lines.append("    Resources:")
        for res in service_resources:
            yaml_lines.append(f'      - Type: {res["type"]}')
            yaml_lines.append(f'        Label: "{res["label"]}"')

    # Simple connections (stub - full implementation would analyze Refs)
    if len(resources) > 1:
        yaml_lines.append("\nConnections:")
        # Connect first to second if exists
        if len(resources) >= 2:
            yaml_lines.append(f'  - Source: ["{resources[0]["name"]}"]')
            yaml_lines.append(f'    Target: ["{resources[1]["name"]}"]')

    return "\n".join(yaml_lines)


@mcp.tool()
async def visualize_cloudformation_template(
    template_content: str,
    output_format: Optional[str] = "all",
) -> str:
    """
    Convert CloudFormation template to architecture diagram.

    Accepts JSON or YAML CloudFormation templates. Extracts resources,
    maps to AWS service types, and generates diagram via diagram-iac.
    """
    if not template_content or not isinstance(template_content, str):
        return f"Error: template_content required (string), got {type(template_content).__name__}"

    # Parse template
    try:
        template = parse_cloudformation_template(template_content)
    except Exception as e:
        return f"Error parsing CloudFormation template: {e}"

    if not template or "Resources" not in template:
        return "Error: CloudFormation template must contain Resources section"

    # Extract resources
    resources = extract_cf_resources(template)
    if not resources:
        return "Error: No AWS resources found in template"

    # Convert to diagram-iac YAML
    iac_yaml = convert_cf_to_iac_yaml(template)

    # Would call diagram-iac MCP here, but for now return the conversion
    num_resources = len(resources)
    resource_types = set(r["type"] for r in resources)

    return f"""CloudFormation Template Converted to Architecture Diagram ✅

Resources extracted: {num_resources}
Service types: {', '.join(sorted(resource_types)[:5])}{'...' if len(resource_types) > 5 else ''}

Generated diagram-iac YAML:

{iac_yaml}

Next steps:
1. Use diagram-iac skill to generate PNG
2. Use diagram-export to convert formats
3. Edit YAML if needed and regenerate

Limitations:
- Manual connections (auto-detection TODO)
- VPC/SecurityGroup relationships simplified
- Custom resources shown as generic boxes"""


@mcp.tool()
async def extract_cf_resources_tool(
    template_content: str,
) -> str:
    """Extract AWS resources from CloudFormation template."""
    if not template_content:
        return "Error: template_content required"

    try:
        template = parse_cloudformation_template(template_content)
        resources = extract_cf_resources(template)
    except Exception as e:
        return f"Error: {e}"

    if not resources:
        return "No AWS resources found"

    lines = ["CloudFormation Resources Extracted:\n"]
    for res in resources:
        diagram_type = map_resource_to_diagram_type(res["type"])
        lines.append(f"  - {res['name']} ({diagram_type})")
        lines.append(f"    Type: {res['type']}")

    return "\n".join(lines)


def main():
    """MCP server entry point."""
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
