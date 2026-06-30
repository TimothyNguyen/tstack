# Security Review Sections

## Agent Tooling

- Check tool allowlists.
- Check approval requirements.
- Check audit events.
- Check that generated instructions do not bypass policy.

## Data Access

- Check database read/write boundaries.
- Check customer, campaign, experiment, and model-output access.
- Check that findings do not expose raw sensitive data.

## Network And Egress

- Check for public telemetry.
- Check for public update checks.
- Check for public tunnels.
- Check for public scraping.

## Credential And Session Safety

- Check for credential reads.
- Check for cookie/session import.
- Check for secrets in logs, events, prompts, or generated artifacts.

## LLM And Agent Security (OWASP LLM Top 10)

For any code or config that invokes an LLM, uses agent tools, or processes LLM output:

- LLM01 Prompt Injection — untrusted content fenced or sanitized before entering prompt context? No instruction-override from data sources.
- LLM02 Insecure Output Handling — LLM output rendered to HTML? Must escape. LLM output executed as code or shell? Requires explicit gate.
- LLM03 Training Data Poisoning — fine-tune or RAG data pipeline integrity verified? Source hash-checked?
- LLM04 Model DoS — token budget capped? Retry loops bounded? Rate limits on inference calls enforced?
- LLM05 Supply Chain — model weights, plugins, and tool packages from trusted sources? Versions pinned?
- LLM06 Sensitive Info Disclosure — PII, credentials, or internal schema in prompt context minimized to what's strictly needed?
- LLM07 Insecure Plugin Design — agent tool plugins declare allowlists? Write/delete operations require approval gate?
- LLM08 Excessive Agency — agent has minimal tool grants for the task? Irreversible actions require human-in-loop?
- LLM09 Overreliance — agent output validated before acting on it? Fallback if model unavailable?
- LLM10 Model Theft — model API keys rotated? Inference endpoint access-controlled and not exposed publicly?

See `references/security-checklist.md` for the full AppSec + LLM checklist.

## Output Rules

- Report findings with file paths, concrete evidence, and recommended actions.
- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.
- Prefer structured summaries that can map to AG-UI events later.
