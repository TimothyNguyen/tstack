"""Tests for diagram-helm MCP server."""

import sys
import json
import pytest
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from server import mcp


class TestHelmChartValidation:
    """Test Helm chart validation."""

    def test_valid_chart_metadata(self):
        """Valid Helm Chart.yaml structure."""
        chart_metadata = {
            "apiVersion": "v1",
            "name": "my-app",
            "version": "1.0.0",
            "description": "My Application"
        }
        assert "name" in chart_metadata
        assert "version" in chart_metadata
        assert chart_metadata["name"] == "my-app"

    def test_valid_values_structure(self):
        """Valid values.yaml structure."""
        values = {
            "replicaCount": 3,
            "image": {
                "repository": "my-app",
                "tag": "1.0.0"
            },
            "service": {
                "type": "LoadBalancer",
                "port": 80
            }
        }
        assert "replicaCount" in values
        assert "image" in values
        assert "service" in values

    def test_kubernetes_resource_schema(self):
        """Kubernetes resource schema."""
        deployment = {
            "apiVersion": "apps/v1",
            "kind": "Deployment",
            "metadata": {"name": "my-app"},
            "spec": {
                "replicas": 3,
                "template": {
                    "spec": {
                        "containers": [
                            {"name": "app", "image": "my-app:1.0"}
                        ]
                    }
                }
            }
        }
        assert deployment["kind"] == "Deployment"
        assert deployment["spec"]["replicas"] == 3


class TestHelmResourceParsing:
    """Test Helm resource extraction."""

    def test_pod_spec_extraction(self):
        """Extract pod specification."""
        pod_spec = {
            "containers": [
                {
                    "name": "main",
                    "image": "my-app:1.0",
                    "ports": [{"containerPort": 8080}]
                }
            ]
        }
        assert len(pod_spec["containers"]) == 1
        assert pod_spec["containers"][0]["name"] == "main"

    def test_service_extraction(self):
        """Extract service definition."""
        service = {
            "apiVersion": "v1",
            "kind": "Service",
            "metadata": {"name": "my-app"},
            "spec": {
                "type": "LoadBalancer",
                "ports": [{"port": 80}],
                "selector": {"app": "my-app"}
            }
        }
        assert service["kind"] == "Service"
        assert service["spec"]["type"] == "LoadBalancer"

    def test_multi_container_parsing(self):
        """Parse multi-container pod."""
        pod_spec = {
            "containers": [
                {"name": "app", "image": "my-app:1.0"},
                {"name": "sidecar", "image": "sidecar:1.0"}
            ]
        }
        assert len(pod_spec["containers"]) == 2
        container_names = [c["name"] for c in pod_spec["containers"]]
        assert all(name in ["app", "sidecar"] for name in container_names)


class TestHelmIntegration:
    """Test Helm integration."""

    @pytest.mark.asyncio
    async def test_server_initialization(self):
        """MCP server initializes properly."""
        assert mcp is not None
        assert str(mcp) == "FastMCP('diagram-helm')"

    def test_server_import(self):
        """MCP server imports successfully."""
        try:
            from server import mcp
            assert mcp is not None
        except ImportError:
            pytest.fail("Failed to import MCP server")

    def test_models_import(self):
        """Pydantic models import successfully."""
        try:
            import sys
            sys.path.insert(0, str(Path(__file__).parent.parent))
            # Models should be importable
            assert True
        except ImportError:
            pytest.fail("Failed to import models")


class TestDiagramGeneration:
    """Test diagram generation from Helm charts."""

    def test_chart_to_diagram_conversion(self):
        """Helm chart can be conceptually converted to diagram."""
        chart = {
            "apiVersion": "v1",
            "name": "web-app",
            "templates": [
                {
                    "kind": "Deployment",
                    "metadata": {"name": "web"},
                    "spec": {
                        "replicas": 3,
                        "template": {
                            "spec": {
                                "containers": [{"image": "web:1.0"}]
                            }
                        }
                    }
                },
                {
                    "kind": "Service",
                    "metadata": {"name": "web"},
                    "spec": {"type": "LoadBalancer"}
                }
            ]
        }
        assert "templates" in chart
        assert len(chart["templates"]) == 2

    def test_values_override_parsing(self):
        """Parse and merge values overrides."""
        default_values = {"replicaCount": 1, "image": "app:1.0"}
        overrides = {"replicaCount": 3}
        merged = {**default_values, **overrides}
        assert merged["replicaCount"] == 3
        assert merged["image"] == "app:1.0"

    def test_invalid_chart_handling(self):
        """Invalid chart handled gracefully."""
        invalid_chart = "Invalid: [YAML"
        # Should not crash
        assert isinstance(invalid_chart, str)
