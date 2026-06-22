# Autonomous Backlog

This backlog tracks privacy-first follow-up work for `agent-architecture`.

## Done In This Pass

| Item | Status | Verification |
|---|---|---|
| Add missing modernization stack/domain/adapter skills | Done | `npm run check:skills`, `npm test` |
| Add privacy-first adapter contract | Done | `tests/privacy-adapter-contract.test.mjs` |
| Port Ponytail hook/MCP runtime as optional adapter | Done | `tests/ponytail-adapter.test.mjs` |
| Ensure every top-level skill is cataloged and routed | Done | `tests/skill-catalog.test.mjs` |
| Ignore generated .NET fixture `obj/` output | Done | `.gitignore` |
| Add privacy/default profile manifests | Done | `tests/profile-contract.test.mjs` |
| Add adapter registry manifest | Done | `tests/adapter-registry.test.mjs` |
| Add MCP manifest schema coverage | Done | `tests/mcp-manifest.test.mjs` |
| Add installer dry-run manifest | Done | `tests/install-dry-run.test.mjs` |
| Add local audit writer | Done | `tests/audit-writer.test.mjs` |
| Add AG-UI-compatible event serializer | Done | `tests/event-contract.test.mjs` |
| Add declarative host registry | Done | `tests/host-registry.test.mjs` |
| Add local subagent manifest/deploy slice | Done | `tests/subagent-manifest.test.mjs`, `tests/subagent-deployment.test.mjs`, `tests/profile-contract.test.mjs` |
| Add worktree-isolated subagent execution | Done | `tests/subagent-worktree.test.mjs`, `tests/subagent-deployment.test.mjs` |
| Add coordinator import/reject flow | Done | `tests/subagent-import.test.mjs`, `tests/subagent-import-cli.test.mjs` |

## Ready To Test Next

| Item | Why | Suggested Check |
|---|---|---|
| Host config objects for Claude/Codex/Copilot/ADK/Strands/AgentCore | Makes adapter install surfaces concrete. | Add `tests/host-config.test.mjs` for uniqueness, paths, disabled defaults. |
| Host parity generator | Needed before generated host outputs can be compared. | Add generator output tests for every host registry entry. |
| Day-to-day install loop | Needed before this can replace gstack for daily use. | Implement installer and verify `install -> doctor -> spec -> review -> test -> ship`. |
| Subagent conflict-resolution UX | Needed after import/reject mechanics. | Add conflict fixture tests and coordinator-readable remediation output. |

## Deferred Until Runtime Exists

| Item | Blocker |
|---|---|
| End-to-end host invocation tests | Host generation/install runtime is not implemented yet. |
| Adapter live connector tests | External connectors are intentionally disabled by default. |
| Paid/model evaluation tests | Public/model calls are outside the local default profile. |
| QA/browser subagent | Browser adapter is still optional/deferred. |
