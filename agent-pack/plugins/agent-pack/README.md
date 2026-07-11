# Agent Pack Plugin

This directory is the clean plugin boundary.

Consumers should read:

```text
plugin.json
registry.json
skills/
```

The legacy source tree above this directory still contains templates, build scripts, tests, and compatibility installer code. Do not make harness or registry consumers scrape that tree directly.

## Build

From the repository root:

```bash
npm run registry:export
```

This regenerates:

```text
generated/agent-registry/registry.json
agent-pack/plugins/agent-pack/registry.json
```

## Ownership

- `agent-registry` imports and indexes definitions from `registry.json`.
- `agent-harness` consumes resolved definitions from `agent-registry`.
- This plugin remains definition content, not runtime execution.
