# databricks-sdk-py (reference subset)

Reference subset of <https://github.com/databricks/databricks-sdk-py>
(Apache-2.0). The Python SDK package itself is **not** vendored — install it
with `pip install databricks-sdk` when policy allows. This folder carries
only documentation + examples so the agent can reason about auth modes and
usage patterns without an outbound fetch.

## What's here

```
databricks-sdk-py/
├── UPSTREAM_README.md            # original repo README
├── UPSTREAM_LICENSE              # Apache-2.0
├── UPSTREAM_NOTICE               # upstream attribution
├── docs/
│   ├── getting-started.md
│   ├── authentication.md         # supported auth modes — read first
│   ├── dataplane.md
│   └── dbutils.md
└── examples/                     # WorkspaceClient / AccountClient examples
```

Intentionally **omitted**:

| Omitted | Reason |
|---|---|
| `databricks/` (source package, ~25 MB) | Use `pip install databricks-sdk` instead — don't carry the runtime in this skill pack. |
| `docs/{account,clients,dbdataclasses}` | Sphinx-generated API reference; read online when needed. |
| `tests/`, `Makefile`, `pyproject.toml`, lockfiles | Repo tooling not needed for usage reference. |

## How to use

Install the runtime where the work happens:

```bash
pip install databricks-sdk
# or for a project with a lockfile
uv add databricks-sdk
```

Authenticate using one of the supported modes — pick the lowest-trust mode
your workspace supports:

| Mode | When |
|---|---|
| `.databrickscfg` profile | Local dev. Profile name via `DATABRICKS_CONFIG_PROFILE`. |
| Env vars (`DATABRICKS_HOST`, `DATABRICKS_TOKEN`) | CI / containers. **Never commit values.** |
| OAuth U2M | Local interactive SSO. |
| OAuth M2M (service principal) | Production jobs. |
| Notebook auth | Inside Databricks notebooks (auto). |

See `docs/authentication.md` for the full matrix and precedence rules.

## Enterprise guardrails

- **Never** embed a PAT, workspace host, or service-principal client secret
  in code, examples, commits, or chat output. Reference the env var or
  config profile by name only.
- Calls land on the configured workspace API. Treat every SDK call as a
  workspace mutation candidate — require explicit user confirmation for
  writes (deploys, job runs, cluster creates, permission changes).
- The `WorkspaceClient()` default constructor reads `~/.databrickscfg` and
  env vars. Inspect which profile was selected before any write.

## Updating

```bash
git clone --depth 1 https://github.com/databricks/databricks-sdk-py \
  /tmp/databricks-sdk-py

rsync -a --delete /tmp/databricks-sdk-py/examples/ ./examples/
for f in getting-started.md authentication.md dataplane.md dbutils.md; do
  cp "/tmp/databricks-sdk-py/docs/$f" "./docs/$f" 2>/dev/null
done
cp /tmp/databricks-sdk-py/{LICENSE,NOTICE,README.md} \
   ./{UPSTREAM_LICENSE,UPSTREAM_NOTICE,UPSTREAM_README.md}
```
