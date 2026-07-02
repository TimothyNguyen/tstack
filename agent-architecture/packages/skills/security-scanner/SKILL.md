---
name: security-scanner
version: 0.1.0
description: |
  MCP server providing Checkov (IaC), Semgrep (source), Bandit (Python), and
  ASH (multi-tool) security scanning. Produces SECURITY.md reports. Requires
  Docker or local tool install. No external API keys required.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
agents: [security, swe, qa-agent]
mcp: security-scanner
trigger: scan|checkov|semgrep|bandit|vulnerability|IaC|security report
---

# Security Scanner MCP

Security scanning via MCP tools. Start with Docker, then invoke tools directly.

## Quick Start

```bash
# Start scanner (base: Checkov + Semgrep + Bandit)
docker compose up security-scanner

# Start scanner with ASH (Ruby/Node, ~2GB image)
docker compose --profile full up security-scanner-full
```

## MCP Tools

| Tool | Input | Output |
|------|-------|--------|
| `scan_with_checkov` | `code: str`, `format_type: str` | findings + summary |
| `scan_with_semgrep` | `code: str`, `language: str` | findings + summary |
| `scan_with_bandit` | `code: str` | findings + summary |
| `scan_directory_with_checkov` | `directory_path: str` | summary + output file |
| `scan_directory_with_semgrep` | `directory_path: str`, `language: str` | summary + output file |
| `scan_directory_with_bandit` | `directory_path: str` | summary + output file |
| `scan_directory_with_ash` | `directory_path: str` | summary + output file |
| `generate_security_report` | `project_name: str`, `scan_results: str` | SECURITY.md content |

Supported `format_type` values: `terraform`, `cloudformation`, `kubernetes`, `dockerfile`, `arm`, `bicep`, `helm`, `kustomize`

Supported `language` values: `python`, `javascript`, `typescript`, `java`, `go`, `ruby`, `php`, `c`, `cpp`, `csharp`, `rust`, `kotlin`, `scala`
