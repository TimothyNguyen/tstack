# Security Review Checklist

Self-review your skill against security best practices before submitting PR.

---

## Public Egress & MCPs

- [ ] No `fetch()`, `curl`, `wget` without explicit policy approval
- [ ] All MCP servers listed in `metadata.dependencies.mcps`
- [ ] Policy gate set: `metadata.approval-gates.policy-required: [mcp-egress]`
- [ ] Skill body explains policy requirement in **Policy Requirements** section
- [ ] Example code doesn't show actual API keys or tokens (use placeholders like `YOUR_TOKEN_HERE`)

**Reference:** `docs/METADATA-SCHEMA.md` → `metadata.dependencies.mcps`

---

## Credentials & Secrets

- [ ] No hardcoded API keys, tokens, passwords, or credentials
- [ ] Environment variable usage requires explicit approval in policy gates
- [ ] No credential reads without user knowledge
- [ ] Documentation warns against sharing/committing credentials
- [ ] Example authentication always uses placeholder values
- [ ] No unredacted output from `echo $SECRET`, `cat .env`, etc.

**Anti-patterns:**
- ❌ `api_key = "sk_live_abc123def456"`
- ❌ Example showing `export GITHUB_TOKEN=ghp_abc123`
- ❌ Test code with real tokens

**Correct patterns:**
- ✅ `export MY_API_TOKEN="your-token-here"`
- ✅ `.env.example` with placeholder values
- ✅ Documentation: "Set `GITHUB_TOKEN` before running"

---

## Destructive Operations

- [ ] Delete operations require explicit user confirmation first
- [ ] Overwrite operations warn user before executing
- [ ] Reset/revert operations require explicit approval and mention rollback path
- [ ] Git force-push forbidden (no `--force`, `--force-with-lease`)
- [ ] Git reset-hard forbidden (no `git reset --hard`)
- [ ] Shell `rm -rf` forbidden without explicit guard
- [ ] Documentation explains what gets deleted and how to restore

**Anti-patterns:**
- ❌ `git push --force`
- ❌ `git reset --hard origin/main`
- ❌ `rm -rf .git`
- ❌ Silent data deletion without confirmation

**Correct patterns:**
- ✅ "Confirm deletion by typing: `DELETE`"
- ✅ "This operation removes X. Backup created at ~/.backup/X-$(date).tar"
- ✅ "Rollback: `git revert <commit-hash>`"

---

## System Access & Safety

- [ ] No process termination without user approval (`kill`, `killall`, `Stop-Process`)
- [ ] No filesystem traversal outside project directory without guard
- [ ] File paths use `$HOME`, `$TMPDIR`, or relative paths (not `/tmp`, `/root`, `/home/*`)
- [ ] Shell commands properly quote all variables (prevent injection)
- [ ] No privilege escalation (`sudo`, `doas`, `RunAs Administrator`)
- [ ] No background daemon spawn without clear lifecycle management
- [ ] No modification of system configuration files (`/etc/*`, Windows registry)

**Anti-patterns:**
- ❌ `exec(userInput)` without validation
- ❌ `rm -rf "$variable"` (injection risk)
- ❌ `sudo npm install` (asks for password, blocks agents)
- ❌ Spawning background processes without PID tracking

**Correct patterns:**
- ✅ Validate user input against whitelist
- ✅ `rm -rf "${projectDir:?}"` (guard against empty variables)
- ✅ `npm install --no-audit` (respects user's npm config)
- ✅ Process lifecycle: spawn → log PID → track completion → cleanup

---

## Data Privacy & Confidentiality

- [ ] Diagrams/outputs don't expose PII (names, emails, SSNs, addresses)
- [ ] Code samples don't include real database URLs, API endpoints, or credentials
- [ ] Generated documentation doesn't leak internal architecture details (unless intended)
- [ ] Logs don't capture sensitive request/response bodies
- [ ] No screenshot/screen capture of confidential UI
- [ ] Offline-first by default (no cloud uploads without explicit user action)
- [ ] Data retention policy clear (if storing files longer than session)

**Anti-patterns:**
- ❌ Example SQL with real prod connection string
- ❌ Generated diagram with real IP addresses/ports
- ❌ Screenshots of internal tools in examples
- ❌ Automatic upload to SaaS service without user consent

**Correct patterns:**
- ✅ Example: `postgresql://user:pass@localhost:5432/mydb`
- ✅ Diagram nodes labeled `[API Server]`, `[Database]` (no IPs)
- ✅ "This skill keeps all data local. No cloud uploads."

---

## Network & External Services

- [ ] No DNS lookups or network probes without user knowledge
- [ ] No automatic update checks phoning home
- [ ] No telemetry, analytics, or metrics collection
- [ ] No cookie import from browsers
- [ ] No web scraping without explicit user action
- [ ] No tunnels (ngrok, localtunnel) without user approval
- [ ] HTTP requests use timeouts (prevent hanging indefinitely)

**Anti-patterns:**
- ❌ `fetch('https://metrics.example.com/ping')`
- ❌ Automatic version check on startup
- ❌ Capturing browser cookies without consent
- ❌ Spawning ngrok tunnel in background

**Correct patterns:**
- ✅ Metrics only with explicit opt-in flag
- ✅ Version check only when user asks: `npm outdated`
- ✅ "Run `browser-auth --extract-cookies` to import" (user explicitly chooses)
- ✅ "Secure tunnel requires your approval: [approve]"

---

## Dependency Security

- [ ] No new npm dependencies added without justification and review
- [ ] No dependencies from untrusted registries
- [ ] Dependency versions pinned (not `^` or `~` for security-critical deps)
- [ ] No known security vulnerabilities (check: `npm audit`)
- [ ] Dependencies minimal (YAGNI principle)

**Anti-patterns:**
- ❌ Adding 10 new packages for a simple utility
- ❌ `npm install from-unknown-registry@latest`
- ❌ Depending on deprecated packages

**Correct patterns:**
- ✅ "Using lodash 4.17.21 (vs 4.17.0) for 3 critical security fixes"
- ✅ Stdlib first, then battle-tested packages
- ✅ `npm audit --fix` before release

---

## Code Injection Prevention

- [ ] User input never directly executed (no `eval()`, `exec()`, backtick execution)
- [ ] Shell commands escape user input properly
- [ ] SQL queries use parameterized queries (no string interpolation)
- [ ] Template rendering validates input
- [ ] Markdown/HTML generation sanitizes user input

**Anti-patterns:**
- ❌ `eval(userInput)`
- ❌ `bash -c "${userCommand}"`
- ❌ `SQL: "SELECT * FROM users WHERE id = " + userId`
- ❌ Rendering user text as HTML without escaping

**Correct patterns:**
- ✅ Validate input against whitelist, reject unknown values
- ✅ Use `sh -c 'cmd' -- "$@"` pattern (proper argument passing)
- ✅ Parameterized queries: `db.query("SELECT * FROM users WHERE id = ?", [userId])`
- ✅ Escape HTML: `marked(userMarkdown, { breaks: true })`

---

## Testing & Verification

- [ ] Security test included in test file
- [ ] Example: test that injection fails
- [ ] Example: test that secrets aren't logged
- [ ] CI/CD runs security checks (`npm audit`, linting)
- [ ] Manual security review by team lead or security engineer before merge

---

## Self-Review Workflow

**Before submitting PR:**

```bash
# 1. Run full validation
npm run validate:metadata -- my-skill/SKILL.md.tmpl

# 2. Check for common issues
grep -r "fetch\|curl\|wget" my-skill/
grep -r "sk_live\|ghp_\|password" my-skill/

# 3. Verify metadata complete
cat my-skill/SKILL.md.tmpl | head -30

# 4. Review examples for secrets
cat my-skill/SKILL.md.tmpl | grep -A 10 "example\|Example"

# 5. Run tests
npm test -- tests/my-skill.test.mjs

# 6. Self-review checklist
# ... complete this checklist ...
```

**In PR:**

Add security review sign-off:

```markdown
## Security Review

- [x] No public egress without policy gates
- [x] No credentials in examples
- [x] No destructive operations without confirmation
- [x] No privacy leaks (PII, internal architecture)
- [x] Network access uses timeouts
- [x] Dependencies reviewed
- [x] Code injection prevention verified

Reviewed by: @[security-team-member]
```

---

## Red Flags (Automatic Rejection)

If ANY of these are true, PR will be rejected:

1. ❌ Hardcoded API keys or passwords
2. ❌ `git push --force`, `git reset --hard`, or other destructive git operations
3. ❌ Shell `rm -rf /` or similar catastrophic deletions without guard
4. ❌ `sudo` or privilege escalation without user control
5. ❌ `eval()` or code injection vectors
6. ❌ Public egress (HTTP, DNS, telemetry) without policy gates
7. ❌ Credential reads without explicit user knowledge
8. ❌ Unredacted PII or internal secrets in examples
9. ❌ Automatic updates or version checks phoning home
10. ❌ Known security vulnerabilities in dependencies

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — Common web vulnerabilities
- [CWE Top 25](https://cwe.mitre.org/top25/) — Most dangerous software weaknesses
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework) — Best practices
- `npm audit` — Dependency security scanning
- `npm outdated` — Version update checking

---

## Questions?

Reach out to: **@[security-team-member]** or file GitHub issue with tag `[security-review]`

