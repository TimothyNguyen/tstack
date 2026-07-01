# Workflows

Use this page for high-level paths, not exhaustive examples.

## Core Paths

### 1. Brainstorm -> Spec -> Build

- start with `/orchestrate`
- move to `/spec-agent`
- implement with `/swe`
- validate with `/qa-agent`

### 2. Bug -> Investigate -> Fix

- start with `/swe`
- invoke systematic debugging first
- confirm root cause before patching
- finish with verification

### 3. Install -> Verify -> Use

- install via [INSTALLATION.md](INSTALLATION.md)
- verify via [VERIFICATION.md](VERIFICATION.md)
- configure MCPs only if needed via [MCP_INTEGRATION.md](MCP_INTEGRATION.md)

## Which Agent First

- vague idea: `/orchestrate`
- implementation: `/swe`
- testing: `/qa-agent`
- formal planning: `/spec-agent`

## Related Docs

- [INSTALLATION.md](INSTALLATION.md)
- [SKILL_INVOCATION.md](SKILL_INVOCATION.md)
- [VERIFICATION.md](VERIFICATION.md)
