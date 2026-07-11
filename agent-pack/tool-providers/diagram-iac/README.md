# Diagram IaC

Generate AWS architecture diagrams from YAML infrastructure-as-code definitions using AWS Diagram-as-Code CLI via FastMCP.

## Features

✅ **YAML-based Diagrams**: Version-controlled infrastructure definitions
✅ **AWS Resource Support**: All major AWS services and resources
✅ **Multiple Exports**: PNG, SVG, .drawio for editing
✅ **AWS Compliance**: Follows AWS architecture best practices
✅ **FastMCP Integration**: Lightweight MCP framework with Pydantic validation
✅ **CLI Wrapper**: Wraps awsdac command-line tool

## Prerequisites

**REQUIRED: Install system dependencies FIRST**

### Graphviz (Required for diagram rendering)

Graphviz is needed to render diagrams.

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

### AWS Diagram-as-Code CLI (awsdac) - Required for diagram generation

AWS Diagram-as-Code (awsdac) is the CLI tool that parses YAML and generates diagrams.

```bash
# macOS (Homebrew)
brew install awsdac

# Linux - Install from GitHub releases
# https://github.com/awslabs/diagram-as-code/releases
# Download appropriate binary and add to PATH

# Windows - Install from GitHub releases
# https://github.com/awslabs/diagram-as-code/releases
# Download .exe and add to PATH

# Or via npm (requires Node.js)
npm install -g @aws-diagram-as-code/cli
```

Verify installation:
```bash
awsdac --version  # Should print version number
```

## Quick Start

### Installation

```bash
# 1. Ensure graphviz and awsdac are installed (see Prerequisites above)

# 2. Install Python package
pip install -e .

# 3. Verify imports work
python -c "from diagram_iac.server import mcp; print('OK')"
```

### Usage

```python
# Define infrastructure as YAML
yaml_code = """
DiagramName: "AWS Web App"
Resources:
  - Type: EC2
    Label: "Web Server"
  - Type: RDS
    Label: "Database"
Connections:
  - Source: 0
    Target: 1
"""

# Generate via MCP
result = await generate_iac_diagram(yaml_code, "my-arch")
# Returns: {"success": true, "paths": {"png": "...", "drawio": "..."}}
```

## YAML Format

### Basic Structure

```yaml
DiagramName: "My Architecture"
Region: "us-east-1"

Resources:
  - Type: EC2
    Label: "web-server-1"
    Count: 1
  
  - Type: RDS
    Label: "postgres-db"
    Engine: "PostgreSQL"
  
  - Type: S3
    Label: "static-assets"

Connections:
  - Source: 0      # Index of first resource
    Target: 1      # Index of second resource
    Label: "Query"
```

### Supported AWS Resource Types

- **Compute**: EC2, Lambda, ECS, EKS
- **Database**: RDS, DynamoDB, ElastiCache, DocumentDB
- **Storage**: S3, EBS, EFS
- **Network**: VPC, ALB, NLB, CloudFront, Route53
- **Message**: SQS, SNS, Kinesis
- **ML/Analytics**: SageMaker, Redshift, Athena

## MCP Configuration

Add to Claude Desktop or other MCP client:

```json
{
  "mcpServers": {
    "diagram-iac": {
      "command": "python",
      "args": ["-m", "diagram_iac.server"],
      "env": {"AWSDAC_PATH": "awsdac"}
    }
  }
}
```

## Example Diagrams

### AWS Web Application Architecture

```yaml
DiagramName: "AWS Web App Architecture"
Region: "us-east-1"

Resources:
  - Type: Route53
    Label: "DNS"
  
  - Type: CloudFront
    Label: "CDN"
  
  - Type: ALB
    Label: "Load Balancer"
  
  - Type: EC2
    Label: "web-1"
  
  - Type: EC2
    Label: "web-2"
  
  - Type: RDS
    Label: "postgres"
  
  - Type: ElastiCache
    Label: "redis"
  
  - Type: S3
    Label: "assets"

Connections:
  - Source: 0
    Target: 1
  - Source: 1
    Target: 2
  - Source: 2
    Target: 3
  - Source: 2
    Target: 4
  - Source: 3
    Target: 5
  - Source: 3
    Target: 6
  - Source: 4
    Target: 5
  - Source: 3
    Target: 7
```

### Microservices Architecture

```yaml
DiagramName: "Microservices Architecture"

Resources:
  - Type: ALB
    Label: "API Gateway"
  
  - Type: ECS
    Label: "User Service"
  
  - Type: ECS
    Label: "Order Service"
  
  - Type: ECS
    Label: "Payment Service"
  
  - Type: RDS
    Label: "User DB"
  
  - Type: RDS
    Label: "Order DB"
  
  - Type: SQS
    Label: "Message Queue"

Connections:
  - Source: 0
    Target: 1
  - Source: 0
    Target: 2
  - Source: 0
    Target: 3
  - Source: 1
    Target: 4
  - Source: 2
    Target: 5
  - Source: 2
    Target: 6
  - Source: 3
    Target: 6
```

## Testing

```bash
# Run tests
pytest tests/ -v

# Test specific functionality
pytest tests/test_diagram_iac.py -v

# With coverage
pytest tests/ --cov=diagram_iac
```

## MCP Tools

### generate_iac_diagram

Generate diagram from YAML infrastructure definition.

**Parameters:**
- `yaml_content` (string, required): YAML infrastructure definition
- `output_format` (string, optional): png, svg, drawio, all (default: all)
- `output_path` (string, optional): Custom output directory

**Returns:** Paths to generated diagrams, code validation status

### list_aws_resources

List available AWS resources for diagram generation.

**Parameters:**
- `category` (string, optional): Filter by category (compute, database, network, storage, etc.)

**Returns:** AWS resource catalog organized by category

## Integration with agent-pack

### diagram-agent workflow:

```
User: "Create AWS architecture from YAML"
  ↓
/diagram-agent routes to diagram-iac
  ↓
User provides YAML or infrastructure spec
  ↓
generate_iac_diagram()
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

## Known Limitations

- Requires graphviz and awsdac system packages
- Diagram complexity limited by awsdac/GraphViz (typically < 500 nodes)
- SVG/DRAWIO export requires additional tools (partial support)
- Custom AWS resources need awsdac configuration

## Performance

- Simple diagrams (< 20 nodes): ~1-2 seconds
- Medium diagrams (20-100 nodes): ~2-5 seconds
- Complex diagrams (> 100 nodes): ~5-30 seconds

Rendering time depends on system graphviz and awsdac performance.

## Future Enhancements

- Direct Terraform HCL parsing
- CloudFormation → YAML auto-conversion
- Diagram comparison/diff tool
- AWS Well-Architected Framework validation
- Export to additional formats

## See Also

- [AWS Diagram-as-Code Repository](https://github.com/awslabs/diagram-as-code)
- [Python diagrams documentation](https://diagrams.mingrammer.com/)
- [diagram-infrastructure](../diagram-infrastructure) - Python diagrams DSL
- [diagram-cloudformation](../diagram-cloudformation) - CloudFormation visualization

## License

Apache 2.0 - Derived from AWS Diagram-as-Code
