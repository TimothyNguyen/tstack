#!/usr/bin/env python3
"""
Helm Chart Diagram MCP Server - Visualize Kubernetes Helm charts as architecture diagrams.
"""

import json
import logging
import subprocess
import sys
from pathlib import Path
from typing import Literal, Optional, Dict, Any, List

from fastmcp import FastMCP
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

mcp = FastMCP("diagram-helm", "0.1.0")


class VisualizeHelmChartInput(BaseModel):
    """Input for visualize_helm_chart tool."""
    chart_path: str = Field(
        description="Path to Helm chart directory"
    )
    namespace: Optional[str] = Field(
        default="default",
        description="Kubernetes namespace"
    )
    values_override: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Override values.yaml settings"
    )


def check_helm_available() -> bool:
    """Check if Helm CLI is available."""
    try:
        result = subprocess.run(
            ["helm", "version"],
            capture_output=True,
            timeout=5,
            text=True
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def parse_helm_chart(chart_path: str) -> Dict[str, Any]:
    """Parse Helm chart metadata."""
    chart_file = Path(chart_path) / "Chart.yaml"
    values_file = Path(chart_path) / "values.yaml"

    chart_metadata = {"name": "unknown", "version": "0.0.0"}
    chart_values = {}

    if chart_file.exists():
        try:
            import yaml
            with open(chart_file) as f:
                chart_metadata = yaml.safe_load(f) or {}
        except ImportError:
            logger.warning("PyYAML not installed")
        except Exception as e:
            logger.error(f"Error parsing Chart.yaml: {e}")

    if values_file.exists():
        try:
            import yaml
            with open(values_file) as f:
                chart_values = yaml.safe_load(f) or {}
        except Exception as e:
            logger.warning(f"Error parsing values.yaml: {e}")

    return {
        "metadata": chart_metadata,
        "values": chart_values,
        "path": chart_path
    }


def extract_k8s_resources(chart: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract Kubernetes resources from Helm chart."""
    resources = []
    values = chart.get("values", {})

    # Extract Deployment
    if "deployment" in values or "replicaCount" in values:
        resources.append({
            "type": "Deployment",
            "name": chart.get("metadata", {}).get("name", "app"),
            "replicas": values.get("replicaCount", 1),
            "image": values.get("image", {}).get("repository", "app:latest")
        })

    # Extract Service
    if "service" in values:
        service_cfg = values.get("service", {})
        resources.append({
            "type": "Service",
            "name": f"{chart.get('metadata', {}).get('name', 'app')}-svc",
            "port": service_cfg.get("port", 80),
            "target_port": service_cfg.get("targetPort", 8080)
        })

    # Extract Ingress
    if "ingress" in values:
        ingress_cfg = values.get("ingress", {})
        if ingress_cfg.get("enabled"):
            resources.append({
                "type": "Ingress",
                "name": f"{chart.get('metadata', {}).get('name', 'app')}-ingress",
                "host": ingress_cfg.get("hosts", [{}])[0].get("host", "example.com")
            })

    # Extract ConfigMap/Secret references
    if "configMap" in values or "secrets" in values:
        resources.append({
            "type": "ConfigMap",
            "name": f"{chart.get('metadata', {}).get('name', 'app')}-config"
        })

    # Extract StatefulSet if present
    if "statefulSet" in values or ("persistence" in values and values.get("persistence", {}).get("enabled")):
        resources.append({
            "type": "StatefulSet",
            "name": f"{chart.get('metadata', {}).get('name', 'app')}-statefulset"
        })

    # Extract DaemonSet references
    if "daemonset" in str(values).lower():
        resources.append({
            "type": "DaemonSet",
            "name": f"{chart.get('metadata', {}).get('name', 'app')}-daemon"
        })

    return resources if resources else [
        {
            "type": "Deployment",
            "name": chart.get("metadata", {}).get("name", "app"),
            "replicas": 1
        }
    ]


def convert_helm_to_diagram_python(chart: Dict[str, Any]) -> str:
    """Convert Helm chart to diagram-infrastructure Python code."""
    metadata = chart.get("metadata", {})
    chart_name = metadata.get("name", "app")
    resources = extract_k8s_resources(chart)

    code_lines = [
        "from diagrams import Diagram, Cluster",
        "from diagrams.k8s.compute import Pod, Deployment, StatefulSet, DaemonSet",
        "from diagrams.k8s.network import Service, Ingress",
        "from diagrams.k8s.storage import PersistentVolume",
        "",
        f'with Diagram("{chart_name.capitalize()} Helm Chart"):',
    ]

    # Group resources
    has_ingress = any(r["type"] == "Ingress" for r in resources)
    has_service = any(r["type"] == "Service" for r in resources)
    has_persistence = any(r["type"] in ["StatefulSet", "PersistentVolume"] for r in resources)

    indent = "    "

    # Add ingress if present
    if has_ingress:
        ingress_res = next((r for r in resources if r["type"] == "Ingress"), None)
        if ingress_res:
            code_lines.append(f'{indent}ingress = Ingress("{ingress_res["name"]}")')

    # Add service layer
    if has_service:
        service_res = next((r for r in resources if r["type"] == "Service"), None)
        if service_res:
            code_lines.append(f'{indent}svc = Service("{service_res["name"]}")')

    # Add compute cluster
    compute_resources = [r for r in resources if r["type"] in ["Deployment", "StatefulSet", "DaemonSet"]]
    if compute_resources:
        code_lines.append(f'{indent}with Cluster("Compute"):')
        for res in compute_resources:
            if res["type"] == "Deployment":
                replicas = res.get("replicas", 1)
                code_lines.append(f'{indent}    deploy = Deployment("{res["name"]}")')
                if replicas > 1:
                    code_lines.append(f'{indent}    pods = [Pod("pod-{{i}}") for i in range({replicas})]')
            elif res["type"] == "StatefulSet":
                code_lines.append(f'{indent}    statefulset = StatefulSet("{res["name"]}")')
            elif res["type"] == "DaemonSet":
                code_lines.append(f'{indent}    daemonset = DaemonSet("{res["name"]}")')

    # Add storage if persistent
    if has_persistence:
        code_lines.append(f'{indent}pv = PersistentVolume("storage")')

    # Add connections
    code_lines.append("")
    if has_ingress and has_service:
        code_lines.append(f'{indent}ingress >> svc')
    if has_service and compute_resources:
        code_lines.append(f'{indent}svc >> deploy')
    if has_persistence and compute_resources:
        code_lines.append(f'{indent}deploy >> pv')

    return "\n".join(code_lines)


@mcp.tool()
async def visualize_helm_chart(
    chart_path: str,
    namespace: Optional[str] = "default",
    values_override: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Convert Helm chart to architecture diagram.

    Parses Helm chart structure, extracts Kubernetes resources,
    and generates architecture diagram.
    """
    if not chart_path:
        return "Error: chart_path required"

    # Check if chart exists
    chart_dir = Path(chart_path)
    if not chart_dir.exists():
        return f"Error: Chart directory not found: {chart_path}"

    if not (chart_dir / "Chart.yaml").exists():
        return f"Error: Not a Helm chart (missing Chart.yaml): {chart_path}"

    # Parse chart
    try:
        chart = parse_helm_chart(chart_path)
    except Exception as e:
        return f"Error parsing Helm chart: {e}"

    # Extract resources
    resources = extract_k8s_resources(chart)

    # Convert to Python diagrams code
    python_code = convert_helm_to_diagram_python(chart)

    # Would call diagram-infrastructure MCP here
    chart_name = chart.get("metadata", {}).get("name", "unknown")
    chart_version = chart.get("metadata", {}).get("version", "0.0.0")

    return f"""Helm Chart Converted to Architecture Diagram ✅

Chart: {chart_name} ({chart_version})
Namespace: {namespace}
Resources extracted: {len(resources)}

Generated Python diagrams code:

```python
{python_code}
```

Next steps:
1. Use diagram-infrastructure skill to render diagram
2. Export to PNG/SVG with diagram-export
3. Edit Python code if needed and regenerate

Resource types found:
{chr(10).join(f"  - {r['type']}: {r.get('name', 'N/A')}" for r in resources)}"""


@mcp.tool()
async def parse_helm_values(
    chart_path: str,
) -> str:
    """Extract and list all configuration values from Helm chart."""
    if not chart_path:
        return "Error: chart_path required"

    try:
        chart = parse_helm_chart(chart_path)
        values = chart.get("values", {})
    except Exception as e:
        return f"Error: {e}"

    if not values:
        return "No values found in values.yaml"

    def format_values(d, indent=0):
        lines = []
        for k, v in d.items():
            if isinstance(v, dict):
                lines.append(f"{'  ' * indent}{k}:")
                lines.extend(format_values(v, indent + 1))
            elif isinstance(v, list):
                lines.append(f"{'  ' * indent}{k}: [{', '.join(str(x) for x in v[:3])}]")
            else:
                lines.append(f"{'  ' * indent}{k}: {v}")
        return lines

    config_lines = format_values(values)
    return "Helm Chart Configuration Values:\n\n" + "\n".join(config_lines[:50])


def main():
    """MCP server entry point."""
    if not check_helm_available():
        logger.warning("Helm CLI not found. Install with: brew install helm")

    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
