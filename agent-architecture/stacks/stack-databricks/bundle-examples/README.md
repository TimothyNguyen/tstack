# bundle-examples (vendored)

Mirror of <https://github.com/databricks/bundle-examples> — Databricks Asset
Bundle (`databricks bundle`) templates. Vendored for offline reference and
template scaffolding.

## What's here

```
bundle-examples/
├── UPSTREAM_README.md
├── UPSTREAM_LICENSE          # Databricks proprietary
├── UPSTREAM_NOTICE
├── default_minimal/          # smallest skeleton
├── default_python/           # Python-first bundle
├── default_sql/              # SQL-first bundle
├── dbt_sql/                  # dbt on Databricks
├── lakeflow_pipelines_python/  # Spark Declarative Pipelines (Python)
├── lakeflow_pipelines_sql/     # Spark Declarative Pipelines (SQL)
├── mlops_stacks/             # MLOps Stacks template
├── pydabs/                   # Python-defined DABs
├── knowledge_base/           # cookbook patterns
└── contrib/                  # community-contributed bundles
```

## License

Databricks proprietary. Permits use only in connection with Databricks
Services. Keep `UPSTREAM_LICENSE` alongside any redistribution.

## How to use

Copy a template, then customize:

```bash
# 1. Pick a template
cp -r bundle-examples/default_python ~/work/my_bundle

# 2. Replace placeholders
cd ~/work/my_bundle
# Edit databricks.yml — workspace host, profile, root path, target names
# Edit resources/*.yml — job names, schedules, cluster policies

# 3. Validate
databricks bundle validate
databricks bundle deploy --target dev --dry-run
```

## Enterprise guardrails

- All embedded credentials in these examples are placeholder `${var.*}` refs
  pulled from secret scopes — they are templates, not deployable as-is.
- Replace `workspace.host`, profile names, and secret scopes with project-local
  values before running `databricks bundle deploy`.
- `bundle deploy` is a workspace mutation. Require explicit user approval
  every time; default to `--dry-run` first.
- Production targets should pin to a CI-managed service principal, not a
  developer PAT.

## Updating

```bash
git clone --depth 1 https://github.com/databricks/bundle-examples \
  /tmp/bundle-examples

# Sync each template subtree; preserve our README + provenance files
for d in contrib dbt_sql default_minimal default_python default_sql \
         knowledge_base lakeflow_pipelines_python lakeflow_pipelines_sql \
         mlops_stacks pydabs; do
  rsync -a --delete "/tmp/bundle-examples/$d/" "./$d/"
done
cp /tmp/bundle-examples/{LICENSE,NOTICE,README.md} \
   ./{UPSTREAM_LICENSE,UPSTREAM_NOTICE,UPSTREAM_README.md}
```
