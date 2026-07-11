# dotnet-skills (vendored)

Mirror of <https://github.com/dotnet/skills> bundled inside the `stack-csharp`
agent pack so you can use the .NET team's curated agent skills without
depending on an outbound marketplace fetch.

Upstream commit-of-record: see `UPSTREAM_README.md` and re-clone the source
repo to bump.

## What's here

```
dotnet-skills/
├── UPSTREAM_README.md     # original repo README (installation paths)
├── UPSTREAM_LICENSE       # original license — keep when redistributing
├── UPSTREAM_AGENTS.md     # upstream agent guidance
└── plugins/
    ├── dotnet/                    # core C# tasks
    ├── dotnet11/                  # .NET 11 new APIs
    ├── dotnet-ai/                 # AI/ML + MCP
    ├── dotnet-aspnetcore/         # ASP.NET Core
    ├── dotnet-blazor/             # Blazor
    ├── dotnet-data/               # EF Core query perf
    ├── dotnet-diag/               # crash, trace, microbench, symbolication
    ├── dotnet-experimental/       # exp-* skills (not policy-stable)
    ├── dotnet-maui/               # MAUI
    ├── dotnet-msbuild/            # MSBuild perf + authoring
    ├── dotnet-nuget/              # NuGet (CPM)
    ├── dotnet-template-engine/    # dotnet new templates
    ├── dotnet-test/               # tests, frameworks, gap analysis
    └── dotnet-upgrade/            # framework migrations
```

Each plugin holds a `plugin.json`, a `skills/` directory, and (for `dotnet/`)
a `lsp.json` describing optional language servers.

## How to use

Three options — pick whichever matches your host agent and license posture.

### A. Use the vendored copy directly (no network)

Point your agent at the vendored folder. The skills are valid
`agentskills.io` skills — any host that follows that standard can load them
from a local path.

| Host | Where to register |
|---|---|
| Claude Code | `~/.claude/skills/` (symlink each plugin's `skills/<name>` folder) or use the project's `.agent-pack/` install target. |
| Copilot CLI | `~/.copilot/skills/` (same: symlink per skill). |
| Codex CLI | `~/.codex/skills/`. |
| Cursor | Copy to `~/.cursor/plugins/local/dotnet-agent-skills`, reload window. |
| VS Code Insiders | Enable `chat.plugins.enabled`, then add the local path as a marketplace entry. |

Example symlink loop (Bash, run from this directory):

```bash
for plugin in plugins/*/; do
  name=$(basename "$plugin")
  for skill in "$plugin"skills/*/; do
    sk=$(basename "$skill")
    ln -s "$(realpath "$skill")" "$HOME/.claude/skills/${name}_${sk}"
  done
done
```

PowerShell equivalent:

```powershell
Get-ChildItem plugins -Directory | ForEach-Object {
  $name = $_.Name
  Get-ChildItem (Join-Path $_.FullName "skills") -Directory | ForEach-Object {
    $sk = $_.Name
    New-Item -ItemType SymbolicLink `
      -Path "$HOME\.claude\skills\${name}_${sk}" `
      -Target $_.FullName -Force
  }
}
```

After linking, restart your agent and run `/skills` (Claude Code, Copilot CLI)
or the equivalent listing command to verify the new skills are discoverable.

### B. Use the official marketplace (recommended for fresh installs)

If your host has network access and the dotnet/skills marketplace is allowed
under your org policy, prefer the upstream channel — it self-updates and
keeps your local copy from drifting.

```bash
# Claude Code / Copilot CLI
/plugin marketplace add dotnet/skills
/plugin install dotnet@dotnet-agent-skills
/plugin install dotnet-test@dotnet-agent-skills
/plugin install dotnet-msbuild@dotnet-agent-skills
# …repeat per plugin you want

# Codex CLI
codex plugin marketplace add dotnet/skills
# then /plugins inside codex
```

The vendored copy is then a fallback for air-gapped runs, audits, or
deterministic CI replay.

### C. Per-skill install via skill-installer

Single skill, no marketplace:

```bash
skill-installer install https://github.com/dotnet/skills/tree/main/plugins/dotnet-test/skills/run-tests
```

## When to use which plugin

See the **Vendored .NET Agent Packs** table in
`../SKILL.md` for the activation routing. Short version:

| Working on… | Activate |
|---|---|
| One-off C# script, P/Invoke, NuGet publish | `dotnet` |
| ASP.NET Core API or migration to Web App | `dotnet-aspnetcore` |
| Blazor component, form, JS interop, auth | `dotnet-blazor` |
| EF Core query that's slow or N+1 | `dotnet-data` |
| MSBuild slow / failing / non-SDK style | `dotnet-msbuild` |
| Central Package Management | `dotnet-nuget` |
| .NET 8↔9↔10↔11 jump, nullable refs, AOT | `dotnet-upgrade` |
| Tests: run, migrate, cover, smell-detect | `dotnet-test` |
| MEAI, Semantic Kernel, ML.NET, MCP server | `dotnet-ai` |
| MAUI screen, navigation, theming, doctor | `dotnet-maui` |
| `dotnet new` template work | `dotnet-template-engine` |
| New .NET 11 APIs | `dotnet11` |
| Mock audit, SIMD vectorization, test sprawl | `dotnet-experimental` (gated) |
| Crash dump, ETW trace, symbolicate, dotnet-trace | `dotnet-diag` |

## Updating

```bash
# 1. Pull upstream into a scratch location
git clone --depth 1 https://github.com/dotnet/skills.git /tmp/dotnet-skills

# 2. Diff against vendored copy
diff -ruq /tmp/dotnet-skills/plugins ./plugins

# 3. Rsync new content (preserves vendored README)
rsync -a --delete /tmp/dotnet-skills/plugins/ ./plugins/

# 4. Re-vet anything that calls public telemetry, public update checks,
#    unscoped credential reads, or cookie import. Gate by policy before
#    committing.
```

## License

`dotnet/skills` is licensed by the upstream project — see `UPSTREAM_LICENSE`.
Keep the license file in this directory when redistributing.
