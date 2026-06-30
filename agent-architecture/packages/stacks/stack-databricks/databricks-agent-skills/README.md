# databricks-agent-skills (vendored)

Stable + experimental subset of <https://github.com/databricks/databricks-agent-skills>,
vendored inside `stack-databricks` so it works air-gapped and is audited
against the enterprise preamble.

## What's here

```
databricks-agent-skills/
├── UPSTREAM_README.md     # original repo README (canonical install paths)
├── UPSTREAM_LICENSE       # Databricks License — keep when redistributing
├── UPSTREAM_NOTICE        # upstream attribution
├── UPSTREAM_CLAUDE.md     # upstream Claude guidance
├── UPSTREAM_AGENTS.md     # upstream cross-agent guidance
├── skills/                # 10 STABLE skill packs
└── experimental/          # 21 EXPERIMENTAL packs (opt-in only)
```

Intentionally **omitted** from the vendored copy (use upstream directly if
you need them):

| Omitted | Reason |
|---|---|
| `hooks/` | PostToolUse + UserPromptSubmit hooks that auto-route shell tool calls. Fail-open and harmless, but host-specific and policy-sensitive — opt in deliberately, not by default. |
| `plugins/databricks/<host>` | Host-specific plugin manifests for Claude / Cursor / Codex / Copilot. Use the upstream marketplace install when network/policy allows. |
| `scripts/`, `metaplugin/`, `tests/`, `rules/`, `commands/` | Repo tooling not needed for end-user activation. |

## License

Databricks proprietary license. Permits use only in connection with Databricks
Services. Keep `UPSTREAM_LICENSE` and `UPSTREAM_NOTICE` alongside any
redistribution.

## How to use

### A. Use the vendored copy directly (no network)

Symlink each stable skill into your host agent's skill directory:

```bash
# Bash — run from this directory
for skill in skills/*/; do
  sk=$(basename "$skill")
  ln -s "$(realpath "$skill")" "$HOME/.claude/skills/databricks_${sk}"
done
```

```powershell
# PowerShell — same effect
Get-ChildItem skills -Directory | ForEach-Object {
  New-Item -ItemType SymbolicLink `
    -Path "$HOME\.claude\skills\databricks_$($_.Name)" `
    -Target $_.FullName -Force
}
```

For Cursor / Codex / Copilot, swap the destination — see `UPSTREAM_README.md`.

### B. Use the canonical Databricks CLI installer (recommended when policy allows)

```bash
databricks aitools install
```

Auto-detects every coding agent on the machine and installs the **stable**
skills into the right directory. Add `--experimental` to opt into the
experimental packs.

### C. Use the upstream marketplace (Claude Code / Cursor)

```text
/plugin marketplace add databricks/databricks-agent-skills
/plugin install databricks@databricks-agent-skills
```

When the marketplace is allowed under your org policy, prefer it — it
self-updates and keeps the vendored copy a deterministic fallback.

## Stable pack routing

| User intent | Activate |
|---|---|
| Any Databricks task — load first | `databricks-core` |
| Asset Bundles, `databricks bundle`, dry-runs | `databricks-dabs` |
| Lakeflow Jobs | `databricks-jobs` |
| Lakeflow Spark Declarative Pipelines | `databricks-pipelines` |
| Databricks Apps (TypeScript full-stack) | `databricks-apps` + `databricks-app-design` |
| Lakebase Postgres autoscaling | `databricks-lakebase` |
| Model Serving endpoints, inference | `databricks-model-serving` |
| Vector Search index design / queries | `databricks-vector-search` |
| Classic → serverless compute migration | `databricks-serverless-migration` |

## Experimental packs — opt-in only

`experimental/` carries 21 packs the Databricks team has not stabilized:
`databricks-agent-bricks`, `databricks-aibi-dashboards`,
`databricks-ai-functions`, `databricks-apps-python`, `databricks-dbsql`,
`databricks-docs`, `databricks-execution-compute`, `databricks-genie`,
`databricks-iceberg`, `databricks-lakeflow-connect`,
`databricks-metric-view-advisor`, `databricks-metric-views`,
`databricks-mlflow-evaluation`, `databricks-python-sdk`,
`databricks-spark-structured-streaming`, `databricks-synthetic-data-gen`,
`databricks-unity-catalog`, `databricks-unstructured-pdf-generation`,
`databricks-zerobus-ingest`, `spark-python-data-source`.

Activate only when the user names them or the active profile permits
experimental tooling.

## Updating

```bash
git clone --depth 1 https://github.com/databricks/databricks-agent-skills \
  /tmp/databricks-agent-skills

# Diff before overwriting — re-vet any guidance that calls public telemetry,
# unscoped credential reads, or cookie / tunnel flows.
diff -ruq /tmp/databricks-agent-skills/skills ./skills
diff -ruq /tmp/databricks-agent-skills/experimental ./experimental

rsync -a --delete /tmp/databricks-agent-skills/skills/ ./skills/
rsync -a --delete /tmp/databricks-agent-skills/experimental/ ./experimental/
cp /tmp/databricks-agent-skills/{LICENSE,NOTICE,README.md} \
   ./{UPSTREAM_LICENSE,UPSTREAM_NOTICE,UPSTREAM_README.md}
```
