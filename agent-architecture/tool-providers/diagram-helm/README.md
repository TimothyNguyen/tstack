# Diagram Helm

Visualize Kubernetes Helm charts as architecture diagrams using FastMCP.

## Features

✅ **Helm Chart Parsing**: Direct analysis of chart definitions
✅ **Kubernetes Resources**: Pods, Services, Deployments, StatefulSets, etc.
✅ **Values Visualization**: Show configurable values and defaults
✅ **Multiple Exports**: PNG, SVG, .drawio for editing
✅ **FastMCP Integration**: Lightweight MCP framework with Pydantic validation
✅ **Dependency Resolution**: Shows inter-service connections and dependencies

## Prerequisites

**REQUIRED: Install system dependencies FIRST**

### Graphviz (Required for diagram rendering)

Graphviz is needed to render Helm chart diagrams.

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

### Helm (Required for parsing Helm charts)

Helm is required to parse Helm chart templates and values.

```bash
# macOS (Homebrew)
brew install helm

# Ubuntu/Debian (apt)
sudo apt-get install helm

# RHEL/CentOS (yum)
sudo yum install helm

# Windows (Chocolatey)
choco install kubernetes-helm

# Windows (Direct download)
# Download from https://github.com/helm/helm/releases and add to PATH
```

Verify installation:
```bash
helm version  # Should print version information
```

## Quick Start

### Installation

```bash
# 1. Ensure graphviz and helm are installed (see Prerequisites above)

# 2. Install Python package
pip install -e .

# 3. Verify imports work
python -c "from diagram_helm.server import mcp; print('OK')"
```

### Usage

```python
# Define Helm chart (as Python DSL or template reference)
helm_chart = {
    "apiVersion": "v1",
    "name": "my-app",
    "version": "1.0.0",
    "templates": [
        {
            "apiVersion": "apps/v1",
            "kind": "Deployment",
            "metadata": {"name": "web"},
            "spec": {
                "replicas": 3,
                "template": {
                    "spec": {
                        "containers": [{"name": "app", "image": "my-app:1.0"}]
                    }
                }
            }
        }
    ]
}

# Generate via MCP
result = await visualize_helm_chart(json.dumps(helm_chart), "my-helm")
# Returns: {"success": true, "paths": {"png": "...", "drawio": "..."}}
```

## Helm Chart Support

### Supported Kubernetes Resources

- **Workload**: Deployment, StatefulSet, DaemonSet, Job, CronJob, Pod
- **Service**: Service, Ingress, NetworkPolicy
- **Storage**: PersistentVolume, PersistentVolumeClaim, StorageClass
- **Config**: ConfigMap, Secret, ServiceAccount
- **RBAC**: Role, RoleBinding, ClusterRole, ClusterRoleBinding
- **Policy**: PodDisruptionBudget, NetworkPolicy, SecurityPolicy
- **Monitoring**: ServiceMonitor, PrometheusRule (if Prometheus installed)

### Helm Chart Structure

Diagrams are generated from:
- `Chart.yaml` - Chart metadata
- `values.yaml` - Default configuration
- `templates/` - Kubernetes resource definitions

Example chart structure:

```
my-app/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   └── ingress.yaml
└── README.md
```

## MCP Configuration

Add to Claude Desktop or other MCP client:

```json
{
  "mcpServers": {
    "diagram-helm": {
      "command": "python",
      "args": ["-m", "diagram_helm.server"],
      "env": {"LOG_LEVEL": "INFO"}
    }
  }
}
```

## Example: Visualize Helm Chart

### Input: Helm Chart (values.yaml)

```yaml
# Default values for web-app
replicaCount: 3

image:
  repository: my-app
  tag: "1.0.0"
  pullPolicy: IfNotPresent

service:
  type: LoadBalancer
  port: 80

database:
  enabled: true
  host: postgres.default.svc.cluster.local
  port: 5432

redis:
  enabled: true
  url: redis://redis:6379
```

### Input: Deployment Template (templates/deployment.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "web-app.fullname" . }}
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
      - name: app
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: {{ .Values.service.port }}
        env:
        - name: DATABASE_URL
          value: "postgres://{{ .Values.database.host }}:{{ .Values.database.port }}"
        - name: REDIS_URL
          value: "{{ .Values.redis.url }}"
```

### Output Diagram

The diagram will show:
- Deployment → Service → Ingress
- Deployment → ConfigMap (environment variables)
- Deployment → Secret (if used)
- Deployment → PersistentVolumeClaim (if storage enabled)
- Pod replicas (3 in this case)

## Testing

```bash
# Run tests
pytest tests/ -v

# Test specific functionality
pytest tests/test_diagram_helm.py -v

# With coverage
pytest tests/ --cov=diagram_helm
```

## MCP Tools

### visualize_helm_chart

Parse Helm chart and generate diagram.

**Parameters:**
- `chart_content` (string, required): Helm chart (YAML or JSON structure)
- `diagram_name` (string, optional): Output filename
- `output_format` (string, optional): png, svg, drawio, all (default: all)
- `values_override` (string, optional): Custom values YAML
- `output_path` (string, optional): Custom output directory

**Returns:** Paths to generated diagrams, resource inventory, value overrides status

### parse_helm_values

Extract and parse Helm chart values with defaults.

**Parameters:**
- `chart_content` (string, required): Helm chart YAML/JSON
- `values_override` (string, optional): Custom values to merge

**Returns:** Merged values with documentation, resource requirements, port mappings

### list_helm_resources

List all Kubernetes resources defined in chart.

**Parameters:**
- `chart_content` (string, required): Helm chart YAML/JSON

**Returns:** Inventory of resource kinds, counts, and configurations

## Integration with Agent-Architecture

### diagram-agent workflow:

```
User: "Draw my Helm chart architecture"
  ↓
/diagram-agent routes to diagram-helm
  ↓
User provides Helm chart (YAML/JSON or path)
  ↓
visualize_helm_chart()
  ↓
Return PNG preview + resource inventory
  ↓
User approves → /diagram-export (for PNG/PDF)
           → /draw.io link (for editing)
```

### Skills using this:

- **diagram-agent** - Master coordinator
- **diagram-generate** - High-level diagram requests
- **diagram-export** - Format conversion

## Known Limitations

- Requires graphviz and helm system packages
- Diagram complexity limited by GraphViz (typically < 500 nodes)
- Template variable expansion requires values (uses defaults if not provided)
- Custom CRDs shown generically
- Helm hooks (pre-install, post-install) not shown in diagram

## Performance

- Simple charts (< 10 resources): ~1-2 seconds
- Medium charts (10-50 resources): ~2-5 seconds
- Complex charts (> 50 resources): ~5-30 seconds

Rendering time depends on system graphviz and template complexity.

## Future Enhancements

- Helm dependency chain visualization
- SubChart relationships and nesting
- Resource limit visualization (CPU, memory)
- Probe configuration (liveness, readiness) display
- Init container visualization
- Multi-chart (umbrella chart) support
- Helm values validation and documentation generation

## See Also

- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Python diagrams documentation](https://diagrams.mingrammer.com/)
- [diagram-infrastructure](../diagram-infrastructure) - Python diagrams DSL
- [diagram-iac](../diagram-iac) - AWS IaC diagrams
- [diagram-cloudformation](../diagram-cloudformation) - AWS CloudFormation diagrams

## License

Apache 2.0
