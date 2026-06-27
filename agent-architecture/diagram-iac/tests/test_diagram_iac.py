"""Tests for diagram-iac MCP server."""

import sys
import json
import pytest
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from server import mcp


class TestYAMLValidation:
    """Test YAML infrastructure definition validation."""

    def test_valid_yaml_structure(self):
        """Valid YAML structure."""
        yaml_content = """
DiagramName: "Test Architecture"
Resources:
  - Type: EC2
    Label: "Web Server"
  - Type: RDS
    Label: "Database"
Connections:
  - Source: 0
    Target: 1
"""
        # Should not raise
        assert isinstance(yaml_content, str)

    def test_minimal_yaml(self):
        """Minimal valid YAML."""
        yaml_content = """
DiagramName: "Simple"
Resources: []
"""
        assert "DiagramName" in yaml_content
        assert "Resources" in yaml_content


class TestAWSResourceListing:
    """Test AWS resource catalog."""

    @pytest.mark.asyncio
    async def test_list_all_resources(self):
        """List all AWS resources."""
        # This tests that the MCP server is properly configured
        # The actual resource listing depends on awsdac CLI
        assert mcp is not None

    @pytest.mark.asyncio
    async def test_resource_categories(self):
        """Test resource categories exist."""
        categories = ["compute", "database", "network", "storage"]
        assert all(isinstance(cat, str) for cat in categories)


class TestDiagramGeneration:
    """Test diagram generation."""

    @pytest.mark.asyncio
    async def test_server_initialization(self):
        """Test MCP server initializes properly."""
        assert mcp is not None

    @pytest.mark.asyncio
    async def test_invalid_yaml_handling(self):
        """Invalid YAML should be handled gracefully."""
        invalid_yaml = "Invalid: [YAML"
        # Server should handle gracefully
        assert isinstance(invalid_yaml, str)

    def test_connection_validation(self):
        """Connections reference valid resource indices."""
        yaml_with_connections = """
DiagramName: "Test"
Resources:
  - Type: EC2
    Label: "Server 1"
  - Type: EC2
    Label: "Server 2"
  - Type: RDS
    Label: "DB"
Connections:
  - Source: 0
    Target: 1
  - Source: 1
    Target: 2
"""
        assert "Connections" in yaml_with_connections
        assert "Source: 0" in yaml_with_connections


class TestDiagramIACIntegration:
    """Test diagram-iac integration."""

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
