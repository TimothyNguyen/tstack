# Install Spec

This spec defines how to install `agent-architecture/` into another codebase.

## Goal

Install a reusable architecture-agent skill pack into a project without relying
on public egress, global config mutation, telemetry, public tunnels, or cookie
import.

## Supported Install Modes

| Mode | Target | Use case |
|---|---|---|
| Repo-local | `<repo>/.architecture-agent/` | Default company-safe install. |
| Vendored source | `<repo>/tools/architecture-agent/` | Repo owns a pinned copy. |
| Approved user directory | `<home>/.architecture-agent/` | Individual opt-in install. |
| Generated host sidecar | `<repo>/.agents/skills/architecture-agent/` or host equivalent | Host-specific generated skill artifacts. |

Repo-local install is the default.

## Install Inputs

An install must declare:

- Source path or artifact path.
- Target repo root.
- Install mode.
- Enabled hosts.
- Enabled profiles.
- Enabled optional adapters.
- Policy file.

## Default Policy

The default install uses:

```text
agent-architecture/policies/enterprise-default.json
```

Defaults:

- No public telemetry.
- No public update checks.
- No public tunnels.
- No public scraping.
- No cookie/session import.
- No credential read.
- No global config mutation.
- Privileged tools require policy approval and audit event.

## Required Installed Shape

Repo-local install:

```text
<repo>/.architecture-agent/
  VERSION
  SKILL.md
  policies/
  profiles/
  generated/
    claude/
    codex/
    copilot/
    google-adk/
```

Vendored source install:

```text
<repo>/tools/architecture-agent/
  package.json
  SKILL.md.tmpl
  SKILL.md
  scripts/
  <skill>/
    SKILL.md.tmpl
    SKILL.md
```

Host sidecar install:

```text
<repo>/.agents/skills/architecture-agent/
  SKILL.md
  <skill>/
    SKILL.md
```

Host paths may differ by adapter, but generated artifacts must remain derived
from source templates.

Host installs should preserve access to:

- `docs/rpi-workflow.md`
- `docs/cross-model-workflows.md`
- `docs/runbooks/claude-hooks.md` when Claude host enabled

## Install Steps

1. Resolve target repo root.
2. Read policy and install mode.
3. Refuse install if target path is outside the repo or approved directory.
4. Copy or link source files according to install mode.
5. Generate host-specific artifacts.
6. Run `npm run check:skills`.
7. Write a local install manifest.
8. Report installed hosts, profiles, policies, and skipped optional adapters.
9. Report host workflow docs included with install.

## Install Manifest

Write:

```text
<target>/.architecture-agent/install-manifest.json
```

Shape:

```json
{
  "name": "architecture-agent",
  "version": "0.1.0",
  "installedAt": "2026-06-17T00:00:00Z",
  "mode": "repo-local",
  "source": "local-path-or-artifact",
  "policy": "enterprise-default",
  "hosts": ["claude", "codex", "copilot"],
  "profiles": ["enterprise-default"],
  "adapters": []
}
```

The manifest must not include secrets, access tokens, credentials, full prompts,
or raw project data.

A machine-checkable dry-run example lives at
`docs/install-dry-run.example.json`. It is intentionally repo-local and may be
used by installer tests before any write-capable installer exists.

## Upgrade

Use `architecture-agent-upgrade`.

Upgrade rules:

- No public update check by default.
- Use internal mirror, pinned artifact, or manual source path.
- Preserve local policies and profiles.
- Regenerate host artifacts.
- Run `npm run check:skills`.
- Report changed skill folders and generated outputs.

## Uninstall

Uninstall must remove only paths declared in the install manifest. It must not
delete arbitrary host configuration or global files.

## Tests

The package must test:

- Generated skills are fresh.
- Install spec exists and names required defaults.
- Upgrade skill is `architecture-agent-upgrade`, not `tstack-upgrade`.
- Default policy denies public egress, telemetry, tunnels, scraping, cookie
  import, and credential reads.
- Host sidecar layout remains documented.
