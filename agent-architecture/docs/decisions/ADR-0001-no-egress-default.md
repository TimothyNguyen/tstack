# ADR-0001 — Default No-Egress Policy

**Status:** Accepted  
**Date:** 2026-06-25  
**SPEC refs:** C3, V1, V7, V8, V9

## Context

Agent skill packs run inside enterprise networks where outbound traffic to public
services is either monitored or blocked. A skill pack that phones home on first use
creates a trust problem: security teams cannot audit it, firewall rules may silently
break it, and legal teams cannot sign off on it.

Prior art (upstream agent-architecture) included public Supabase telemetry, GitHub update checks,
and ngrok tunnel support. These are incompatible with enterprise deployment.

## Decision

The default egress posture is **deny-all**. No generated skill, installer step, or
runtime behavior may initiate an outbound network connection without an explicit
policy allowlist entry.

Concretely:

- `policies/enterprise-default.json` sets `"egress": { "default": "deny" }`.
- `allowPublicTelemetry`, `allowPublicUpdateChecks`, `allowPublicTunnels`, and
  `allowPublicWebScraping` are all `false`.
- No `adapters/registry.json` entry may set `"egress": "enabled"` as a default.
- Generated skill Markdown must not instruct agents to call public endpoints.
- Tests verify: no generated skill contains ngrok, supabase.co, update-check, or
  cookie-import strings (`tests/skill-generation.test.mjs`).

Optional egress (e.g., GitHub MCP, Databricks SDK) is gated by:
1. Policy allowlist entry (`allowedHosts`).
2. Adapter marked `"egress": "approval-required"` in registry.
3. Explicit user/admin opt-in at install time.

## Consequences

- Skills work offline and in air-gapped environments by default.
- Teams adopting the pack do not need to pre-configure firewall rules.
- Optional egress adapters remain available but require explicit policy changes,
  which are auditable and reversible.
- Public update checks must use an internal mirror if desired — no silent phoning home.
