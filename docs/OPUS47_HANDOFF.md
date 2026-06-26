# Opus 4.7 Handoff: Complete Verification & Installation Testing

This document hands off Phases 1-4 to Opus 4.7 for comprehensive end-to-end verification.

## Current State Summary

### Completed (Haiku)
- **Phase 1:** Session-start hook + using-agent-skills bootstrap ✓
- **Phase 2:** Skill registry auto-discovery (102 skills, 13 agents) ✓
- **Phase 3:** Brainstorming server foundation (WebSocket, lifecycle) ✓
- **Phase 4:** QA validation (68 integration tests, all pass) ✓

### Test Status
- All 363 unit tests passing
- All 68 integration tests passing
- Registry.json validates 102 skills, all mapped to agents
- Brainstorm server verified enterprise-safe + local-only

### Documentation (Haiku)
- INSTALLATION.md: Quick start, config options, post-install steps
- SKILL_INVOCATION.md: Discovery patterns, bootstrap context, priority rules
- WORKFLOWS.md: 6 end-to-end workflows (brainstorm, debug, implement, analyze, test, release)
- MCP_INTEGRATION.md: PostgreSQL, GitHub, Docker, custom MCPs
- VERIFICATION.md: 8-step cross-repo installation verification

## Handoff Tasks for Opus 4.7

### Task 1: Verify Cross-Repo Installability

**Goal:** Prove agent-architecture can be installed in a separate repository and works end-to-end.

**Steps:**
1. Create test directory outside tstack
2. Install via `npx agent-architecture install`
3. Verify registry.json exists and is complete
4. Open in Claude Code, verify hooks fire
5. Invoke each workflow from WORKFLOWS.md:
   - Brainstorm → Spec → Implement
   - Systematic debugging
   - Codebase analysis
6. Verify all 12 agents accessible

**Success Criteria:**
- ✓ Installation completes without error
- ✓ Registry has 102 skills
- ✓ All role agents have 5+ skills
- ✓ Session-start hook injects using-agent-skills
- ✓ Brainstorm workflow completes
- ✓ Debug workflow completes
- ✓ Implement workflow completes
- ✓ All 12 agents respond to invocation

**Deliverable:** Test report with success/failure for each step

### Task 2: Verify Agent Skill Discovery

**Goal:** Prove agents can query registry and invoke skills correctly.

**Steps:**
1. In test repo, create Node.js script:
   ```javascript
   const registry = require('./.agent/generated/registry.json');
   
   // Test 1: Agent can find their skills
   console.log('SWE skills:', registry.byAgent.swe);
   
   // Test 2: Skill metadata is complete
   const brainstorm = registry.skills.find(s => s.name === 'brainstorming');
   console.assert(brainstorm.agents.includes('orchestrate'));
   console.assert(brainstorm.allowedTools.length > 0);
   
   // Test 3: All skills assigned to agent(s)
   for (const skill of registry.skills) {
     console.assert(skill.agents.length > 0, `${skill.name} has no agents`);
   }
   ```
2. Run script, verify no errors
3. Test skill invocation in Claude Code:
   - `/swe` + "list your skills"
   - Agent should query registry and respond with skill list
4. Test skill priority enforcement:
   - `/orchestrate` + "brainstorm new feature"
   - Agent should automatically invoke `/brainstorming` (process skill first)

**Success Criteria:**
- ✓ Registry queries work (agent → registry → skills)
- ✓ Skill metadata complete (name, agents, description, allowedTools)
- ✓ No orphaned skills (all have 1+ agents)
- ✓ Process skills invoked before implementation skills
- ✓ Agents follow skill discipline (don't rationalize away)

**Deliverable:** Script results + skill invocation transcript

### Task 3: Verify MCP Registration & Functionality

**Goal:** Prove MCPs can be configured and work with skills.

**Steps:**
1. In test repo, configure GitHub MCP (if token available):
   ```json
   {
     "mcps": [{
       "name": "github",
       "command": "npx",
       "args": ["@modelcontextprotocol/server-github"],
       "credentialEnvVars": ["GITHUB_TOKEN"]
     }]
   }
   ```
2. Reinstall: `npx agent-architecture install --upgrade`
3. Verify MCP connects: `npx agent-architecture doctor`
4. Test MCP in skill:
   - `/swe` + "use GitHub MCP to list open issues in this repo"
   - Agent should query via MCP, return results
5. Test MCP + skill coordination:
   - `/investigate` + "search GitHub for related bugs"
   - Skill should coordinate investigate + github MCP

**Success Criteria:**
- ✓ MCP connects without auth errors
- ✓ Skill can invoke MCP tools
- ✓ MCP results integrate into skill output
- ✓ No credential exposure in logs
- ✓ Policy-gated writes (read OK, writes require approval)

**Deliverable:** MCP test transcript + doctor output

### Task 4: Test All Workflows End-to-End

**Goal:** Verify all 6 workflows from WORKFLOWS.md work in test repo.

**Workflows to test:**
1. **Brainstorm → Design → Implement** (estimated 1-2h)
   - `/orchestrate` → brainstorming
   - `/spec-agent` → spec
   - `/swe` → implementation
2. **Bug Investigation** (estimated 30min-1h)
   - `/swe` → systematic-debugging
   - Root cause → fix → verification
3. **Codebase Analysis** (estimated 30min)
   - `/swe` → codebase-engine
   - Explain architecture
4. **Test Strategy** (estimated 1h)
   - `/qa-agent` → qa, test, benchmark
5. **Feature Implementation (Fast Track)** (estimated 30min-1h)
   - `/swe` → seniorswe-concise
   - `/commit` → atomic commits
6. **Release Coordination** (estimated 30min)
   - `/release-agent` → release, ship
   - Generate release notes

**Success Criteria:**
- ✓ Each workflow completes without errors
- ✓ Skills invoke correctly (brainstorming, spec, design-html, etc.)
- ✓ Skill output is integrated into workflow
- ✓ All 12 agents can be involved
- ✓ No rationalization/skipping skills

**Deliverable:** Workflow completion transcript + success report

### Task 5: Cross-Platform Hook Verification

**Goal:** Prove session-start hook works on Claude Code, Codex, Copilot CLI.

**Steps:**
1. Open test repo in Claude Code
   - Verify `.claude/hooks/session-start` exists
   - Start session, verify using-agent-skills injects
   - Check: system prompt includes skill discovery rules

2. If Codex available:
   - Verify `.codex/hooks/session-start` exists
   - Start session, verify using-agent-skills context
   - Check: agents receive bootstrap

3. If Copilot CLI available:
   - Verify `.copilot/hooks/session-start` exists
   - Run: `copilot swe`
   - Check: using-agent-skills appears in context

**Success Criteria:**
- ✓ Hook fires on session start (Claude Code confirmed)
- ✓ using-agent-skills content injected into system prompt
- ✓ Bootstrap context includes skill discovery rules
- ✓ Agent receives full skill list + red flag warnings
- ✓ No hook errors in logs

**Deliverable:** Hook verification report (per platform)

### Task 6: Installation Documentation Quality Review

**Goal:** Verify documentation is accurate, complete, and actionable.

**Steps:**
1. Follow INSTALLATION.md exactly as written in test repo
   - Does every step work?
   - Are examples correct?
   - Are placeholders clear?

2. Follow SKILL_INVOCATION.md patterns
   - Can agent discover skills via registry?
   - Do invocation examples work?
   - Are red flag traps documented clearly?

3. Follow WORKFLOWS.md workflows
   - Does each workflow section make sense?
   - Are examples realistic?
   - Do success criteria match outcomes?

4. Follow VERIFICATION.md checklist
   - Does checklist cover all critical steps?
   - Are troubleshooting steps accurate?
   - Are success criteria achievable?

**Success Criteria:**
- ✓ All documentation steps work as written
- ✓ Examples are accurate + runnable
- ✓ No typos or unclear references
- ✓ Troubleshooting sections resolve issues
- ✓ User can follow docs start-to-finish without external help

**Deliverable:** Documentation QA report with any corrections needed

## Critical Questions for Verification

1. **Cross-Repo:** Can a user install this in ANY repo and have it work?
2. **Discovery:** Can agents actually find skills via registry queries?
3. **Discipline:** Do agents follow skill rules (brainstorming first, discipline for debugging)?
4. **Integration:** Do skills, agents, MCPs, and registry work together?
5. **Docs:** Can a principal engineer follow the docs and get it working?

## Definition of Success

✓ Agent-architecture installable in separate repo  
✓ All 102 skills discoverable via registry  
✓ All 12 agents functional and skill-aware  
✓ Brainstorm → Spec → Implement workflow complete  
✓ Systematic debugging workflow complete  
✓ MCP integration working (if configured)  
✓ Session-start hook fires on all platforms  
✓ Documentation accurate + complete  
✓ No errors in agent logs or skill output  
✓ Ready for Phase 5 (superpowers cleanup)  

## What NOT to Do

- ✗ Don't remove superpowers references yet (user said "don't do any removing")
- ✗ Don't modify code without verification results first
- ✗ Don't skip documentation review
- ✗ Don't test in tstack repo; use separate test directory

## Environment Setup for Opus 4.7

Clone test repo setup:
```bash
# Create test space
mkdir ~/agent-arch-test
cd ~/agent-arch-test
git init
echo ".agent/" >> .gitignore
echo ".brainstorm/" >> .gitignore

# Install
npx agent-architecture install

# Verify doctor
npx agent-architecture doctor

# Ready for testing
```

## Deliverables Expected from Opus 4.7

1. **Installation Verification Report**
   - Cross-repo installation success/failure
   - Registry validation
   - Hook functionality per platform

2. **Workflow Test Report**
   - All 6 workflows tested
   - Success/failure + transcripts
   - Any workflow blockers

3. **Agent Discovery Report**
   - Registry queries work
   - Skill invocation works
   - Priority enforcement works
   - No rationalization observed

4. **Documentation QA Report**
   - All steps tested + verified
   - Corrections/clarifications needed (if any)
   - Example accuracy check

5. **System-Ready Verification**
   - All 9 success criteria met or not met
   - Any critical blockers identified
   - Ready for Phase 5 or needs fixes

## Next Phase After Verification

**Phase 5: Cleanup** (will execute AFTER Opus 4.7 verification passes)
- Remove .superpowers references from shell scripts
- Remove superpowers branding from docs
- Update refs to .brainstorm/ instead of .superpowers/brainstorm/
- Final integration test
- Merge to main

## Context for Opus 4.7

You're verifying an enterprise skill system (agent-architecture) that:
- Bootstrap injects meta-skill at session start
- Agents query registry to find available skills
- Skills have rigid discipline (brainstorming, debugging) vs flexible patterns
- MCPs extend capabilities without rebuilding
- Works across Claude Code, Codex, Copilot CLI
- Installable in any repo via npm

The user wants to ensure:
1. Installation works in new repos (cross-repo compatibility)
2. All agents, skills, registry, MCPs work together
3. Documentation is accurate and complete
4. Ready for principal engineers to use

You have:
- 363 unit tests passing
- 68 integration tests passing
- Complete documentation (5 guides)
- Working brainstorm server + session-start hook
- Full skill registry

Now verify it all works end-to-end in a fresh install.

Good luck!
