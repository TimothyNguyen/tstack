# Agent Architecture Adoption Guide

How to adopt and scale agent-architecture across your organization.

## For Individual Contributors (Week 1)

### Get Started

1. **Install**
   ```bash
   npx agent-architecture install
   npx agent-architecture doctor
   ```

2. **Learn Your Agent**
   - Determine your role (swe, qa-agent, spec-agent, design-agent, pm, orchestrate)
   - Read corresponding agent README in `agents/*/SKILL.md`
   - Explore 3-5 key skills for your role

3. **Run a Workflow**
   - Pick a workflow from [WORKFLOWS.md](./WORKFLOWS.md)
   - Execute end-to-end (brainstorm → spec → implement → test → review)
   - Notice: Skills guide you step-by-step; no guessing

### Key Principles

- **No default egress.** Skills ask for external tool access, then show you what they'll do.
- **Metadata-first.** Every skill declares: agents (who uses it), dependencies (MCPs/skills), gates (policy approval needed).
- **Workflows matter.** Don't invoke skills randomly; follow a workflow for context.

---

## For Team Leads (Week 2-3)

### Customize for Your Team

1. **Read METADATA-SCHEMA.md**
   - Understand metadata fields (category, tier, approval-gates)
   - See how policy approval gates work

2. **Configure MCPs** (if using external services)
   - Edit `.agent-config.json` in your repo root:
     ```json
     {
       "private": true,
       "hosts": ["claude", "codex"],
       "agents": ["swe", "qa-agent", "spec-agent"],
       "mcps": [
         {
           "name": "postgres-mcp",
           "command": "uvx",
           "args": ["mcp-server-postgres"],
           "credentialEnvVars": ["DATABASE_URL"]
         }
       ]
     }
     ```
   - Agents will request access; policy review required

3. **Decide Governance**
   - Who approves new skills? (tech lead, security team)
   - What policies apply? (mcp-egress, database-access, git-operations)
   - Release cadence? (weekly, monthly)

### Rolling Out Skills

- **Wave 1 (Week 1):** Core agents only (swe, qa-agent, spec-agent)
- **Wave 2 (Week 2-3):** Add specialized agents (design-agent, diagram-agent)
- **Wave 3 (Week 4+):** Add domain-specific skills (migration, data, cloud)

---

## For Architects (Week 3-4)

### Scale: Add Your Own Skill Families

Follow [EXTENSIBILITY-GUIDE.md](./EXTENSIBILITY-GUIDE.md) to add 5-10 skills per team:

**Phase 1: Planning**
- Write skill charter (scope, agents, dependencies)
- Get approval from tech lead + security

**Phase 2: Build Skills** (TDD)
- Create test file (RED: tests fail without skill)
- Create skill template with metadata
- Code skill body
- Tests GREEN (all tests pass)
- REFACTOR (clean up, document)

**Phase 3: Define Workflows**
- Add to `docs/workflows/registry.json`
- Each skill → agent → coordination

**Phase 4: Testing & Validation**
- `npm run validate:metadata` — Metadata is correct
- `npm test` — All 401+ tests pass
- `npm run build:skills` — Generated files fresh

**Phase 5: Documentation & Training**
- Write examples in skill body
- Extract use cases
- LLM training data auto-exports to TRAINING-DATA.jsonl

**Phase 6: Release**
- Update package.json files array
- Create release notes
- Update README with new agents/skills

**Example walkthrough:** [SQL Server → Postgres Migration](./EXTENSIBILITY-GUIDE.md#phase-2-build-skills) (agent + 5 skills, 40-80 hours)

### Security & Policy

All skills require:
- ✓ [SECURITY-REVIEW-CHECKLIST.md](./SECURITY-REVIEW-CHECKLIST.md) sign-off
- ✓ [SKILL-VALIDATION-CHECKLIST.md](./SKILL-VALIDATION-CHECKLIST.md) passed
- ✓ No hardcoded credentials, no destructive git ops, no telemetry

Use `approval-gates:` in metadata to flag policy requirements:
```yaml
approval-gates:
  policy-required: [mcp-egress, database-access]
```

---

## For Security Teams (Week 4-5)

### Policy Framework

**Three levels of approval:**

1. **Default-Deny (no approval needed)**
   - Read files, grep, basic tooling
   - Example: `/swe` → read, edit, grep only

2. **Policy-Gated (explicit approval)**
   - External MCPs (postgres-mcp, github-mcp)
   - Destructive operations (git push, delete)
   - Example: `/migration-engineer` requires `mcp-egress` + `database-access` gates

3. **Prohibited (never allowed)**
   - Hardcoded credentials
   - Public tunnels, telemetry, scraping
   - `sudo`, `eval()`, automatic updates
   - Example: Any skill with embedded API key auto-rejected

### Review Process

1. **Skill Submission** → Security reviews metadata + code
2. **Metadata Check** → Declared dependencies, MCPs, gates
3. **Code Review** → No secrets, no destructive ops, no injection risks
4. **Approval** → Security stamps "approved for policy gates X,Y,Z"
5. **Monitoring** → Track skill invocations, audit access logs

### Configuration

Set policy gates in `.agent-config.json`:
```json
{
  "policies": {
    "mcp-egress": {
      "allowed": ["postgres-mcp", "github-mcp"],
      "requires-approval": true,
      "approved-by": "security-team"
    },
    "database-access": {
      "allowed-connections": ["prod-postgres-replica", "staging-postgres"],
      "read-only": true
    }
  }
}
```

---

## Host Rollout Pattern

Adopt host complexity in layers:

- start with one host and one workflow family
- add tracked plan artifacts before adding more automation
- add cross-model review only for medium or high-risk work
- add hooks and subagent orchestration after baseline flow is stable

Recommended references:

- [cross-model-workflows.md](./cross-model-workflows.md)
- [rpi-workflow.md](./rpi-workflow.md)

Typical split:

- Claude-first for planning and orchestration
- Codex-second for repo-grounded review and verification

## FAQ

**Q: How many skills should we build?**
A: Start with 5-10 per team. Extensibility framework scales to 150+ skills systematically.

**Q: Can we use agent-architecture offline?**
A: Yes. It ships with all 114 skills. MCPs (Postgres, GitHub) are optional.

**Q: How do we upgrade?**
A: Run `/architecture-agent-upgrade` to update agent-architecture. Skills auto-fetch latest.

**Q: What about cross-team coordination?**
A: Use `/orchestrate` agent to coordinate (brainstorm + parallel skill execution). See [WORKFLOWS.md](./WORKFLOWS.md).

**Q: When should we use two hosts instead of one?**
A: When repo complexity or failure cost justifies second-pass review. Start with [cross-model-workflows.md](./cross-model-workflows.md).

**Q: How do we measure impact?**
A: Track: time to implement features, cycle time, test coverage, bugs found (pre/post agent use).

---

## Success Criteria

Your adoption is successful when:

✅ **Week 1** (ICs): All engineers using their role's agent (swe, qa-agent, spec-agent)
✅ **Week 2** (Leads): Team has 5+ custom skills for your domain
✅ **Week 3** (Architects): Skill family (5-10 skills + agent) deployed with workflows
✅ **Week 4** (Security): Policy review process in place, zero security issues
✅ **Month 2**: 30+ engineers using agents, measurable velocity improvement
✅ **Month 3**: 100+ skills across organization, new skill families from 3+ teams

---

## Timeline & Resources

| Timeline | Activity | Owner | Duration |
|----------|----------|-------|----------|
| Week 1 | Install & learn skills | IC | 2-3 hours/person |
| Week 2-3 | Configure MCPs + governance | Lead | 4-8 hours |
| Week 3-4 | Build first skill family | Architect | 40-80 hours |
| Week 4-5 | Security review + approval | Security | 4-6 hours |
| Month 2 | Rollout to 30+ users | Lead | ongoing |
| Month 3 | Scale to 100+ skills | Architect | ongoing |

---

## Next Steps

1. **Start here:** [INSTALLATION.md](./INSTALLATION.md) (detailed setup)
2. **Learn skills:** [CONTRIBUTING.md](./CONTRIBUTING.md) (10-step workflow)
3. **Add your skills:** [EXTENSIBILITY-GUIDE.md](./EXTENSIBILITY-GUIDE.md) (6-phase process)
4. **Reference:** [WORKFLOWS.md](./WORKFLOWS.md) (7 end-to-end examples)

Questions? See [CLAUDE.md](../CLAUDE.md) for architecture overview and code knowledge graph.
