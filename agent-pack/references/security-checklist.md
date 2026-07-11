# Security Checklist

Use this checklist before shipping any code that handles data, credentials, agent tools, or external integrations.

## Application Security (OWASP Top 10)

- [ ] A01 Broken Access Control — verify auth on every endpoint; no IDOR; enforce least-privilege
- [ ] A02 Cryptographic Failures — no plaintext secrets; TLS enforced; strong key sizes
- [ ] A03 Injection — parameterized queries; no shell interpolation of user input; sanitize prompts
- [ ] A04 Insecure Design — threat-modeled? trust boundaries drawn? fail-safe defaults?
- [ ] A05 Security Misconfiguration — no debug endpoints exposed; headers set; defaults hardened
- [ ] A06 Vulnerable Components — no known CVEs in direct/transitive deps
- [ ] A07 Auth Failures — session expiry; secure cookie flags; no credential logging
- [ ] A08 Software Integrity — deps pinned or hash-verified; no unsigned artifact
- [ ] A09 Logging Failures — security events logged; no secrets in logs
- [ ] A10 SSRF — allowlist outbound targets; no user-controlled URLs to internal hosts

## LLM and Agent Security (OWASP LLM Top 10)

- [ ] LLM01 Prompt Injection — untrusted content fenced or sanitized before entering prompt; no instruction-override from data sources
- [ ] LLM02 Insecure Output Handling — LLM output rendered to HTML? escape it. Executed as code? gate it
- [ ] LLM03 Training Data Poisoning — fine-tune/RAG data pipeline integrity verified? source hash-checked?
- [ ] LLM04 Model DoS — token budget capped; retry loops bounded; rate limits on inference calls enforced
- [ ] LLM05 Supply Chain — model weights, plugins, tool packages from trusted sources? versions pinned?
- [ ] LLM06 Sensitive Info Disclosure — PII, credentials, internal schema in prompt context minimized to what's strictly needed
- [ ] LLM07 Insecure Plugin Design — agent tool plugins declare allowlists? write/delete ops require approval gate?
- [ ] LLM08 Excessive Agency — agent has minimal tool grants for the task; irreversible actions require human-in-loop
- [ ] LLM09 Overreliance — agent output validated before acting on it? fallback if model unavailable?
- [ ] LLM10 Model Theft — model API keys rotated? inference endpoint access-controlled and not exposed publicly?

## Agent Tooling

- [ ] Tool allowlists declared and enforced
- [ ] Approval required for shell/git/deploy/db-write tools
- [ ] Audit events emitted for privileged tool calls
- [ ] Generated instructions cannot bypass policy
