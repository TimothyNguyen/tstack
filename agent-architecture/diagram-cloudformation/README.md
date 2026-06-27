# Diagram CloudFormation

Convert AWS CloudFormation templates to architecture diagrams using FastMCP.

## Features

✅ **Template Parsing**: JSON and YAML CloudFormation templates
✅ **Resource Visualization**: Automatic extraction and diagram generation
✅ **Multiple Exports**: PNG, SVG, .drawio for editing
✅ **Policy Detection**: Identifies IAM policies and connections
✅ **FastMCP Integration**: Lightweight MCP framework with Pydantic validation
✅ **Template Validation**: Detects syntax and configuration errors

## Prerequisites

**REQUIRED: Install Graphviz system package FIRST**

Graphviz is needed to render diagrams from parsed CloudFormation templates.

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
python -c "from diagram_cloudformation.server import mcp; print('OK')"
```

### Usage

```python
# Define CloudFormation template
cf_template = {
    "AWSTemplateFormatVersion": "2010-09-09",
    "Description": "Simple web app",
    "Resources": {
        "WebServer": {
            "Type": "AWS::EC2::Instance",
            "Properties": {
                "ImageId": "ami-12345",
                "InstanceType": "t3.micro"
            }
        },
        "Database": {
            "Type": "AWS::RDS::DBInstance",
            "Properties": {
                "Engine": "postgres",
                "InstanceClass": "db.t3.micro"
            }
        }
    }
}

# Generate via MCP
result = await visualize_cloudformation_template(json.dumps(cf_template), "my-stack")
# Returns: {"success": true, "paths": {"png": "...", "drawio": "..."}}
```

## CloudFormation Support

### Supported Resource Types

- **Compute**: EC2, Lambda, ECS, EKS, AppRunner
- **Database**: RDS, DynamoDB, ElastiCache, DocumentDB
- **Storage**: S3, EBS, EFS, Glacier
- **Network**: VPC, Subnet, SecurityGroup, LoadBalancer, CloudFront
- **Message/Stream**: SQS, SNS, Kinesis, EventBridge
- **Monitoring**: CloudWatch, Logs
- **Security**: IAM, Secrets Manager, KMS, Certificate Manager
- **Deployment**: CloudFormation, CodePipeline, CodeBuild

### Template Formats

Supports both JSON and YAML CloudFormation templates:

```json
{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "My Stack",
  "Resources": {
    "MyResource": {
      "Type": "AWS::S3::Bucket"
    }
  }
}
```

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: My Stack
Resources:
  MyResource:
    Type: AWS::S3::Bucket
```

## MCP Configuration

Add to Claude Desktop or other MCP client:

```json
{
  "mcpServers": {
    "diagram-cloudformation": {
      "command": "python",
      "args": ["-m", "diagram_cloudformation.server"],
      "env": {"LOG_LEVEL": "INFO"}
    }
  }
}
```

## Example: Convert CloudFormation to Diagram

### Input CloudFormation Template (YAML)

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: "Multi-tier web application"

Resources:
  LoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Scheme: internet-facing
      Type: application

  WebServerRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service: ec2.amazonaws.com
            Action: sts:AssumeRole

  WebServerInstance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: ami-12345
      InstanceType: t3.micro
      IamInstanceProfile: !Ref WebServerRole

  Database:
    Type: AWS::RDS::DBInstance
    Properties:
      Engine: postgres
      AllocatedStorage: "20"
      DBInstanceClass: db.t3.micro

  AppBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: my-app-assets

Outputs:
  LoadBalancerURL:
    Value: !GetAtt LoadBalancer.DNSName
```

### Output Diagram

The diagram will show:
- LoadBalancer → WebServerInstance → Database
- WebServerInstance → AppBucket
- IAM roles and permissions as annotations

## Testing

```bash
# Run tests
pytest tests/ -v

# Test specific functionality
pytest tests/test_diagram_cloudformation.py -v

# With coverage
pytest tests/ --cov=diagram_cloudformation
```

## MCP Tools

### visualize_cloudformation_template

Convert CloudFormation template to diagram.

**Parameters:**
- `template_content` (string, required): CloudFormation template (JSON or YAML)
- `diagram_name` (string, optional): Output filename
- `output_format` (string, optional): png, svg, drawio, all (default: all)
- `output_path` (string, optional): Custom output directory

**Returns:** Paths to generated diagrams, template validation status, resource count

### extract_cloudformation_resources

Parse CloudFormation template and extract resource information.

**Parameters:**
- `template_content` (string, required): CloudFormation template

**Returns:** List of resources with types, properties, and connections

## Integration with Agent-Architecture

### diagram-agent workflow:

```
User: "Visualize my CloudFormation template"
  ↓
/diagram-agent routes to diagram-cloudformation
  ↓
User provides CF template (JSON/YAML)
  ↓
visualize_cloudformation_template()
  ↓
Return PNG preview + resource analysis
  ↓
User approves → /diagram-export (for PNG/PDF)
           → /draw.io link (for editing)
```

### Skills using this:

- **diagram-agent** - Master coordinator
- **diagram-generate** - High-level diagram requests
- **diagram-export** - Format conversion
- **diagram-iac** - Alternative IaC format

## Known Limitations

- Requires graphviz system package
- Diagram complexity limited by GraphViz (typically < 500 nodes)
- Parameter references (Ref, GetAtt) shown as annotations
- Custom resources displayed generically
- Some property details not shown in diagram (see validation output)

## Performance

- Simple templates (< 20 resources): ~1-2 seconds
- Medium templates (20-100 resources): ~2-5 seconds
- Complex templates (> 100 resources): ~5-30 seconds

Rendering time depends on system graphviz performance and template complexity.

## Future Enhancements

- AWS Well-Architected Framework validation
- Parameter detection and visualization
- Output exports visualization
- Change set diff/comparison
- Export to additional formats (Terraform, CDK)
- IAM policy analysis and visualization

## See Also

- [AWS CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [Python diagrams documentation](https://diagrams.mingrammer.com/)
- [diagram-infrastructure](../diagram-infrastructure) - Python diagrams DSL
- [diagram-iac](../diagram-iac) - AWS IaC YAML format
- [diagram-helm](../diagram-helm) - Kubernetes diagram generation

## License

Apache 2.0
