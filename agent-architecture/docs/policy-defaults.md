# Default Enterprise Policy

The default policy is intentionally restrictive. It should be safe to install in
a company repo before any project-specific approvals exist.

Policy file:

```text
agent-architecture/policies/enterprise-default.json
```

## Defaults

- Public egress is denied.
- Public telemetry is disabled.
- Public update checks are disabled.
- Public tunnels are disabled.
- Public web scraping is disabled.
- Cookie import is disabled.
- Credential reads are disabled.
- Database writes are disabled.
- Browser automation is disabled unless a profile enables it.
- Local audit logging is enabled.

## Allowed By Default

The policy allows low-risk local development actions:

- Shell read.
- Git read.
- Test execution.
- Human escalation.

These actions still must avoid secrets in logs.

## Approval Required By Default

The policy requires approval for actions that can affect local state, external
systems, or enterprise data:

- Shell write.
- Git write.
- Deployment.
- Database read.
- Ticket creation.

Approval policy is implemented later by `core/policy`; this document defines the
required behavior before implementation begins.

## Disabled By Default

Disabled means a profile cannot use the capability unless policy changes first:

- Browser write.
- Cookie import.
- Credential read.
- Database write.
- Public tunnels.
- Public telemetry.
- Public update checks.
- Public web scraping.

## Audit Rules

Audit events must be local-only by default. They may include action type, tool
name, host, decision, target path, and correlation id.

Audit events must not include:

- Tokens.
- Cookie values.
- API keys.
- Passwords.
- Secrets.
- Raw credentials.
- Full prompts.
- Full file contents.
- State values from customer, campaign, experiment, or model data.
