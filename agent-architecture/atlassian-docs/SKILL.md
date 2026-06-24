---
name: atlassian-docs
version: 0.1.0
description: |
  Read-only Atlassian product-documentation lookup for coding projects. Use when a user asks a coding, implementation, debugging, or product-behavior question that should be answered from approved internal Confluence pages or Jira issues through a configured mcp-atlassian connector. Do not use for ticket creation, page edits, attachment transfer, credential setup, OAuth setup, or general public web browsing.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
agents: [spec-agent, pm, qa-agent, interviewer]
---

## Enterprise Preamble

- Stay inside the current project unless the user explicitly names another path.
- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.
- Use policy-gated tools only when the active profile allows them.
- Commit after each discrete behavior change — do not accumulate unrelated edits across multiple files before committing.
- Each commit message must follow Conventional Commits: `<type>[scope]: <description>` (types: feat, fix, docs, refactor, test, chore, perf, ci).
- Never use `--no-verify`, `--force` (use `--force-with-lease`), or `--no-gpg-sign` unless explicitly instructed.
- Sequence for rebasing: stage → commit → fetch → rebase → push.

# Atlassian Docs

Use this skill to retrieve relevant internal product documentation from an approved `mcp-atlassian` MCP connector while keeping `codebase-engine` and local code workflows no-egress by default.

Do not vendor or import `mcp-atlassian` into `codebase-engine`. Treat it as an optional external connector with explicit enterprise policy approval.

## Workflow

1. Read local code, docs, and `codebase-engine` output first when they can answer the question.
2. Use Atlassian only when the user needs product context, requirements, decisions, Jira issue detail, or Confluence documentation that is not available locally.
3. Confirm the active profile has an approved `mcp-atlassian` connector configured in read-only mode.
4. Validate the connector profile with `scripts/validate_mcp_atlassian_profile.py` when an env file or environment snapshot is available.
5. Scope every Atlassian query to the named product, project key, issue key, space, component, or page title when possible.
6. Retrieve only the minimum relevant pages or issues.
7. Summarize the answer for the coding task and cite page titles, issue keys, URLs, or local file paths when available.

## Allowed Use

- Search approved Confluence spaces for product documentation.
- Read specific Confluence pages that are relevant to implementation.
- Search or read Jira issues when requirements, acceptance criteria, or product decisions live there.
- Cross-check Atlassian context against local code and tests before recommending code changes.

## Prohibited Use

- Do not create, update, delete, transition, comment on, or assign Jira issues.
- Do not create, update, delete, label, move, or comment on Confluence pages.
- Do not upload, download, or read attachment file paths through Atlassian tools.
- Do not read credentials, cookies, browser sessions, keyring entries, or OAuth token files.
- Do not enable OAuth proxy, public HTTP exposure, disabled SSL verification, public tunnels, public scraping, or public telemetry.
- Do not broaden egress beyond explicitly approved Atlassian Cloud or Data Center hosts.

## Safe Connector Profile

Use this minimum profile before querying Atlassian:

```text
READ_ONLY_MODE=true
ATLASSIAN_OAUTH_PROXY_ENABLE=false
JIRA_SSL_VERIFY=true
CONFLUENCE_SSL_VERIFY=true
MCP_ALLOWED_URL_DOMAINS=<approved Atlassian domains only>
ENABLED_TOOLS=<read-only search/get tools only>
```

If the connector is not already configured, do not set up credentials yourself. Tell the user what approval or configuration is missing.

For connector risk details and reviewed `mcp-atlassian` evidence, read `references/mcp-atlassian-safety.md`.

For a starting profile, use `references/safe-profile.env.example`. Validate it before use:

```bash
python atlassian-docs/scripts/validate_mcp_atlassian_profile.py --env-file atlassian-docs/references/safe-profile.env.example --print-summary
```

## Policy Requirements

- Read-only code inspection is allowed.
- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.
- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
