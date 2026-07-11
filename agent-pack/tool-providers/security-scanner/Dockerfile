FROM python:3.12-slim AS base

WORKDIR /app

# Install OS deps for Checkov (git for git-based rules) and Semgrep
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install core security scanners
RUN pip install --no-cache-dir \
    "checkov>=3.0.0" \
    "semgrep>=1.45.0" \
    "bandit>=1.7.5" \
    "loguru>=0.6.0" \
    "mcp[cli]>=1.11.0" \
    "pydantic>=2.0.0"

# Copy and install the package
COPY security_scanner/ ./security_scanner/
COPY pyproject.toml .

RUN pip install --no-cache-dir -e . --no-deps

ENV MCP_TRANSPORT=sse
EXPOSE 8765

CMD ["security-scanner"]

# Full target: adds Ruby (cfn-nag) + Node 20 (npm-audit) + ASH
FROM base AS full

RUN apt-get update && apt-get install -y --no-install-recommends \
    ruby-full \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN gem install cfn-nag

RUN pip install --no-cache-dir \
    "automated-security-helper @ git+https://github.com/awslabs/automated-security-helper.git@v3.2.7"

EXPOSE 8765
CMD ["security-scanner"]
