# Diagram Infrastructure

Generate professional infrastructure diagrams for AWS, GCP, Azure, Kubernetes, and multi-cloud architectures using Python diagrams DSL via MCP.

## Features

✅ **Multi-Cloud Support**: AWS, GCP, Azure, Kubernetes, hybrid, multi-cloud
✅ **Python DSL**: Intuitive programmatic diagram creation
✅ **Multiple Exports**: PNG, SVG, .drawio for editing
✅ **Icon Discovery**: List available icons by provider and category
✅ **FastMCP**: Lightweight MCP framework with Pydantic validation
✅ **Integration**: Works with diagram-export and diagram-generate skills

## Prerequisites

**REQUIRED: Install Graphviz system package FIRST**

Graphviz is a system-level dependency required for diagram rendering.

```bash
# macOS (Homebrew)
brew install graphviz

# Ubuntu/Debian (apt)
sudo apt-get install graphviz graphviz-dev

# RHEL/CentOS (yum)
sudo yum install graphviz graphviz-devel

# Windows (Chocolatey - requires admin)
choco install graphviz

# Windows (Direct download)
# Download from https://graphviz.org/download/ and add to PATH
```

Verify installation:
```bash
dot -V  # Should print Graphviz version
```

## Quick Start

### Installation

```bash
# 1. Ensure graphviz is installed (see Prerequisites above)

# 2. Install Python package
pip install -e .

# 3. Verify imports work
python -c "from diagrams import Diagram; print('OK')"
```

### Usage

```python
# Define in code
code = """
from diagrams import Diagram, Cluster
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS

with Diagram("My Architecture"):
    with Cluster("Web Tier"):
        servers = [EC2("web-1"), EC2("web-2")]
    db = RDS("postgres")
    servers >> db
"""

# Generate via MCP
result = await generate_infrastructure_diagram(code, "my-arch")
# Returns: {"success": true, "paths": {"png": "...", "svg": "...", "drawio": "..."}}
```

## MCP Configuration

Add to Claude Desktop or other MCP client:

```json
{
  "mcpServers": {
    "infrastructure-diagram": {
      "command": "python",
      "args": ["-m", "diagram_infrastructure.server"]
    }
  }
}
```

## Architecture Diagrams

### AWS Architecture

```python
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.network import ELB
from diagrams.aws.compute import EC2, Lambda
from diagrams.aws.database import RDS, DynamoDB
from diagrams.aws.storage import S3

with Diagram("AWS Web App Architecture"):
    users = ELB("users")
    
    with Cluster("Web Tier"):
        web_servers = [EC2("web-1"), EC2("web-2")]
    
    with Cluster("Application"):
        api = Lambda("api")
    
    with Cluster("Data"):
        db = RDS("postgres")
        cache = DynamoDB("sessions")
        storage = S3("assets")
    
    users >> web_servers >> api
    api >> db
    api >> cache
    web_servers >> storage
```

### Multi-Cloud

```python
from diagrams import Diagram, Cluster
from diagrams.aws.compute import EC2
from diagrams.gcp.compute import GCE
from diagrams.azure.compute import VM

with Diagram("Multi-Cloud"):
    with Cluster("AWS"):
        aws = EC2("compute")
    with Cluster("GCP"):
        gcp = GCE("compute")
    with Cluster("Azure"):
        azure = VM("compute")
```

### Kubernetes

```python
from diagrams import Diagram, Cluster
from diagrams.k8s.compute import Pod, Deployment
from diagrams.k8s.network import Service, Ingress

with Diagram("Kubernetes Cluster"):
    ingress = Ingress("api.example.com")
    svc = Service("api")
    
    with Cluster("Pods"):
        pods = [Pod(f"api-{i}") for i in range(3)]
    
    ingress >> svc >> pods
```

## Testing

```bash
# Run tests
pytest tests/ -v

# Test specific functionality
pytest tests/test_diagram_infrastructure.py::TestDiagramGeneration -v

# With coverage
pytest tests/ --cov=diagram_infrastructure
```

## MCP Tools

### generate_infrastructure_diagram

Generate diagram from Python diagrams DSL code.

**Parameters:**
- `code` (string, required): Python diagrams DSL code
- `diagram_name` (string, optional): Output filename
- `output_format` (string, optional): png, svg, drawio, or all (default: all)
- `workspace_dir` (string, optional): Custom workspace directory

**Returns:** Paths to generated diagrams, base64 PNG preview, code validation

### list_available_icons

List icons available for diagram generation.

**Parameters:**
- `provider` (string, optional): aws, gcp, azure, k8s, or all (default: all)
- `category` (string, optional): Filter by category (e.g., "compute")

**Returns:** Icon catalog organized by provider and category

## Integration with Agent-Architecture

### diagram-agent workflow:

```
User: "Draw AWS architecture"
  ↓
/diagram-agent routes to diagram-infrastructure
  ↓
User provides requirements or Python DSL
  ↓
generate_infrastructure_diagram()
  ↓
Return PNG preview + .drawio export
  ↓
User approves → /diagram-export (for PNG/PDF)
           → /draw.io link (for editing)
```

### Skills using this:

- **diagram-agent** - Master coordinator
- **diagram-generate** - High-level diagram requests
- **diagram-export** - Format conversion
- **diagram-cloudformation** - CloudFormation → diagram (uses diagram-iac)

## Known Limitations

- Requires graphviz system package
- Diagram complexity limited by GraphViz (typically <500 nodes)
- SVG/DRAWIO export requires additional tools (stub for now)
- Custom providers need additional library imports

## Performance

- Simple diagrams (< 20 nodes): ~1-2 seconds
- Medium diagrams (20-100 nodes): ~2-5 seconds
- Complex diagrams (> 100 nodes): ~5-30 seconds

Rendering time depends on system graphviz performance.

## Future Enhancements

- Direct YAML DSL (YAML → diagram without Python code)
- Terraform diagram generation
- Real-time diagram editing
- Diagram comparison/diff tool
- Export to additional formats (DRAWIO native conversion)

## See Also

- [Python diagrams documentation](https://diagrams.mingrammer.com/)
- [andrewmoshu/diagram-mcp-server](https://github.com/andrewmoshu/diagram-mcp-server) - Source
- [diagram-iac](../diagram-iac) - AWS IaC diagrams
- [diagram-cloudformation](../diagram-cloudformation) - CloudFormation visualization

## License

Apache 2.0 - Derived from andrewmoshu/diagram-mcp-server
