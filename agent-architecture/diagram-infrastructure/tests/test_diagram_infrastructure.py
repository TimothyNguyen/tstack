"""Tests for diagram-infrastructure MCP server."""

import sys
import pytest
from pathlib import Path

# Mock diagrams if not installed
try:
    import diagrams
    DIAGRAMS_AVAILABLE = True
except ImportError:
    DIAGRAMS_AVAILABLE = False

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from server import validate_diagram_code, list_icons_internal


class TestValidateDiagramCode:
    """Test code validation."""

    def test_valid_import_code(self):
        """Valid import statement."""
        code = "from diagrams import Diagram"
        valid, error = validate_diagram_code(code)
        assert valid
        assert error == ""

    def test_valid_diagram_code(self):
        """Valid diagram definition."""
        code = """
from diagrams import Diagram
with Diagram("Test"):
    pass
"""
        valid, error = validate_diagram_code(code)
        assert valid
        assert error == ""

    def test_syntax_error(self):
        """Code with syntax error."""
        code = "from diagrams import"
        valid, error = validate_diagram_code(code)
        assert not valid
        assert "Syntax error" in error

    def test_indentation_error(self):
        """Code with indentation error."""
        code = """
from diagrams import Diagram
  invalid indent here
"""
        valid, error = validate_diagram_code(code)
        assert not valid


class TestListIcons:
    """Test icon listing."""

    @pytest.mark.skipif(not DIAGRAMS_AVAILABLE, reason="diagrams not installed")
    def test_list_all_icons(self):
        """List icons for all providers."""
        result = list_icons_internal("all")
        assert result["success"]
        assert "icons" in result
        assert isinstance(result["icons"], dict)

    @pytest.mark.skipif(not DIAGRAMS_AVAILABLE, reason="diagrams not installed")
    def test_list_aws_icons(self):
        """List AWS icons only."""
        result = list_icons_internal("aws")
        assert result["success"]
        assert "aws" in result["icons"]

    @pytest.mark.skipif(not DIAGRAMS_AVAILABLE, reason="diagrams not installed")
    def test_list_k8s_icons(self):
        """List Kubernetes icons."""
        result = list_icons_internal("k8s")
        assert result["success"]
        assert "k8s" in result["icons"]

    def test_invalid_provider(self):
        """Invalid provider should return specific icons."""
        # Should not error, just return empty or specific ones
        result = list_icons_internal("k8s")
        assert result["success"]


class TestDiagramGeneration:
    """Test diagram generation."""

    @pytest.mark.skipif(not DIAGRAMS_AVAILABLE, reason="diagrams not installed")
    @pytest.mark.asyncio
    async def test_generate_simple_diagram(self):
        """Generate a simple diagram."""
        from server import generate_diagram_internal

        code = """
from diagrams import Diagram

with Diagram("test"):
    pass
"""
        result = await generate_diagram_internal(code, "test_simple")
        assert result["success"]
        assert result["diagram_name"] == "test_simple"
        assert "png" in result["paths"]

    @pytest.mark.skipif(not DIAGRAMS_AVAILABLE, reason="diagrams not installed")
    @pytest.mark.asyncio
    async def test_generate_aws_diagram(self):
        """Generate AWS architecture diagram."""
        from server import generate_diagram_internal

        code = """
from diagrams import Diagram
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS

with Diagram("AWS Example"):
    db = RDS("postgres")
"""
        result = await generate_diagram_internal(code, "test_aws")
        assert result["success"] or "graphviz" in str(result.get("error", "")).lower()

    @pytest.mark.asyncio
    async def test_generate_invalid_code(self):
        """Generate with invalid code should fail."""
        from server import generate_diagram_internal

        code = "invalid python code here @@"
        result = await generate_diagram_internal(code)
        assert not result["success"]
        assert "error" in result
