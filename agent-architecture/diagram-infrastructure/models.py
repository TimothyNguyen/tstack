"""Pydantic models for diagram-infrastructure."""

from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class DiagramType(str, Enum):
    """Supported diagram types."""
    AWS = "aws"
    GCP = "gcp"
    AZURE = "azure"
    KUBERNETES = "kubernetes"
    HYBRID = "hybrid"
    MULTICLOUD = "multicloud"


class DiagramGenerateResponse(BaseModel):
    """Response from diagram generation."""
    success: bool
    diagram_name: Optional[str] = None
    paths: Dict[str, str] = Field(default_factory=dict)
    preview: Optional[str] = None
    code_lines: int = 0
    error: Optional[str] = None


class IconInfo(BaseModel):
    """Information about an icon."""
    name: str
    provider: str
    category: str
    description: Optional[str] = None


class IconsResponse(BaseModel):
    """Response from icon listing."""
    success: bool
    icons: Dict[str, Dict[str, List[str]]]
    total_providers: int
    error: Optional[str] = None
