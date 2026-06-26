# Installation Verification & Cross-Repo Testing

Verify that agent-architecture installs correctly in a different repository and all skills, agents, and MCPs work end-to-end.

## Pre-Installation Checklist

- [ ] npm 10+ or yarn installed
- [ ] Node.js 18+ available
- [ ] Git initialized in target repo
- [ ] .gitignore includes `.agent/` directory
- [ ] Claude Code / Codex / Copilot CLI available

## Step 1: Install into Test Repo

```bash
# Create a test repository
mkdir ~/test-install
cd ~/test-install
git init
git config user.name "Test User"
git config user.email "test@example.com"

# Add .agent to .gitignore
echo ".agent/" >> .gitignore
echo ".brainstorm/" >> .gitignore

# Install agent-architecture
npx agent-architecture install

# Verify installation
npx agent-architecture doctor
```

**Expected Output:**
```
✓ Installation directory: .agent/
✓ Skills found: 102
✓ Agents found: 12
  - swe
  - qa-agent
  - spec-agent
  - pm
  - design-agent
  - orchestrate
  - security
  - migration
  - data
  - cloud
  - release-agent
  - interviewer
✓ Registry validated: 102 skills, 13 agents
✓ Session-start hook configured
✓ All checks passed
```

## Step 2: Verify Registry Accessibility

```bash
# Check registry.json exists
ls -la .agent/generated/registry.json

# Verify registry structure
node -e "
const r = require('./.agent/generated/registry.json');
console.log('Skills:', r.count);
console.log('Agents:', Object.keys(r.byAgent).filter(a => a !== '_infrastructure').length);
console.log('SWE skills:', r.byAgent.swe.length);
console.log('QA skills:', r.byAgent['qa-agent'].length);
"

# Expected:
# Skills: 102
# Agents: 12
# SWE skills: 8
# QA skills: 5
```

## Step 3: Open in Claude Code

```bash
# Navigate to test repo
cd ~/test-install

# Open in Claude Code
claude code .
```

**In Claude Code, verify:**
1. ✓ Session starts without errors
2. ✓ `using-agent-skills` context appears in agent context
3. ✓ Skill tool is available

## Step 4: Test Skill Invocation

### Test 4a: Verify Skill Tool Works

```
/swe

Hello! Verify that I can invoke skills. Show me the registry.
```

**Expected:**
- Agent responds
- No errors about missing Skill tool
- Agent can access `.agent/generated/registry.json`

### Test 4b: Invoke a Simple Skill

```
/swe

Use the /health skill to check code quality in this repo.
```

**Expected:**
- Skill tool loads `health` skill
- Skill executes without errors
- Agent receives skill output

### Test 4c: Invoke Process Skill

```
/orchestrate

Use /brainstorming to explore ideas for a new feature.
What if we added a feature to save search results?
```

**Expected:**
- `brainstorming` skill loads
- Agent facilitates dialogue
- Ideas documented in structured format

## Step 5: Test Workflow End-to-End

### Workflow: Brainstorm → Spec → Implement

#### Part 1: Brainstorming

```
/orchestrate

Let's brainstorm a feature to export data in multiple formats.
What's the best approach? Should we use a plugin system?
```

**Verify:**
1. ✓ Skill loads (`/brainstorming` or automatic)
2. ✓ Agent asks clarifying questions
3. ✓ Ideas documented
4. ✓ Tradeoffs explained

**Output:** Architecture direction, requirements

#### Part 2: Formal Spec

```
/spec-agent

Based on our brainstorming, write a formal spec for the export feature.
Support CSV, JSON, and Excel formats. Handle up to 10k rows.
```

**Verify:**
1. ✓ Spec agent available
2. ✓ `/spec` skill invokes
3. ✓ Spec includes goals, constraints, tasks
4. ✓ Spec is formal + structured

**Output:** Spec document + task breakdown

#### Part 3: Implementation

```
/swe

Implement CSV export based on the spec above.
Scope: 100 lines max, use existing patterns, no new dependencies.
```

**Verify:**
1. ✓ `/seniorswe-concise` skill invokes (lazy mode)
2. ✓ Code follows existing patterns
3. ✓ Tests included
4. ✓ `/verification-before-completion` passes

**Output:** Working feature, ready for review

### Workflow: Debug an Issue

```
/swe

Users report that the CSV export fails randomly.
Debug this systematically to find the root cause.
```

**Verify:**
1. ✓ `/systematic-debugging` skill invokes
2. ✓ Follows 6-step investigation framework
3. ✓ Evidence gathered
4. ✓ Root cause identified
5. ✓ Fix verified

**Output:** Root cause + solution

## Step 6: Cross-Platform Hook Testing

### Claude Code

```bash
# Verify hook is configured
ls -la .claude/hooks/session-start

# Expected: Hook file exists and is executable
# When you start a new session, using-agent-skills loads
```

### Codex (if available)

```bash
# Verify hook
ls -la .codex/hooks/session-start

# Start Codex session, verify using-agent-skills loads
```

### Copilot CLI (if available)

```bash
# Verify hook
ls -la .copilot/hooks/session-start

# Run: copilot swe
# Verify using-agent-skills context appears
```

## Step 7: Test All Role Agents

Create a test for each agent:

```
Test Agent 1: /swe
/swe
Show me which skills you have access to via the registry.

Expected: swe agent lists 8+ skills

Test Agent 2: /qa-agent
/qa-agent
Show me your available skills.

Expected: qa-agent lists 5+ skills

Test Agent 3: /spec-agent
/spec-agent
List your skills.

Expected: spec-agent has spec, autoplan, diagram

Test Agent 4: /orchestrate
/orchestrate
What skills do you have?

Expected: orchestrate has 3+ skills
```

## Step 8: Test MCP Integration (If Configured)

### Option A: Without MCPs (Recommended for First Test)

Skip this step. MCPs are optional.

### Option B: With GitHub MCP

```bash
# Set GitHub token
export GITHUB_TOKEN="ghp_your_token_here"

# Reconfigure
echo '{"private": true, "hosts": ["claude"], "agents": ["swe"], "mcps": [{"name": "github", "command": "npx", "args": ["@modelcontextprotocol/server-github"], "credentialEnvVars": ["GITHUB_TOKEN"]}]}' > .agent-config.json

# Reinstall
npx agent-architecture install --upgrade

# Verify
npx agent-architecture doctor
```

In Claude Code:
```
/swe

Use the GitHub MCP to list the top 10 open issues in this repo.
```

**Expected:**
- GitHub MCP connects
- Issues listed
- No credential exposure

## Verification Checklist

- [ ] Registry.json exists and is valid JSON
- [ ] All 102 skills listed in registry
- [ ] All 12 role agents have skills assigned
- [ ] Session-start hook injects using-agent-skills
- [ ] Skill tool can invoke skills
- [ ] brainstorming skill works
- [ ] systematic-debugging skill works
- [ ] verification-before-completion skill works
- [ ] spec skill works
- [ ] seniorswe-concise skill works
- [ ] commit skill works
- [ ] All 12 agents accessible via /agent-name
- [ ] Brainstorm → Spec → Implement workflow succeeds
- [ ] Bug investigation workflow succeeds
- [ ] MCP (if configured) connects and functions

## Troubleshooting

### "Registry not found"

```bash
ls -la .agent/generated/registry.json

# If missing, rebuild
npx agent-architecture install --upgrade
```

### "Skill tool not available"

Likely in wrong environment. Skill tool only available in:
- Claude Code (with hooks enabled)
- Codex (with hooks enabled)
- Copilot CLI v1.0.11+

Not available in:
- Standalone Node.js REPL
- Regular terminal
- IDE extensions without MCP support

### "Hook not firing"

**Claude Code:**
- Settings → Hooks → Toggle on
- Restart Claude Code
- Check `.claude/hooks/session-start` exists

**Codex:**
- Check `.codex/hooks/session-start` exists
- Verify Codex configuration

**Copilot CLI:**
- Check hooks config in copilot settings
- Verify `$COPILOT_CLI=1` env var

### "Skill errors after install"

```bash
# Verify all files present
ls -la .agent/agents/
ls -la .agent/skills/
ls -la .agent/generated/

# Regenerate if needed
npx agent-architecture install --dry-run
npx agent-architecture install --upgrade

# Full test
npx agent-architecture doctor
```

### "MCP authentication failed"

```bash
# Check credentials
echo $GITHUB_TOKEN
echo $DATABASE_URL

# Test MCP manually
npx agent-architecture doctor --verbose

# Output should show:
# MCP: github — CONNECTED
# MCP: database — CONNECTED
```

## Success Criteria

Installation is successful when:

1. ✓ `.agent/generated/registry.json` contains 102 skills
2. ✓ All 12 role agents have 5+ skills each
3. ✓ Session-start hook loads using-agent-skills in every session
4. ✓ Skill tool invocation works for all skills
5. ✓ Brainstorm → Spec → Implement workflow completes
6. ✓ Systematic debugging works end-to-end
7. ✓ All role agents accessible and functional
8. ✓ No errors in logs or skill output

## Next Steps

- [ ] Create `.agent-config.json` with your agent/MCP choices
- [ ] Run through Workflow 1 (Brainstorm) in [WORKFLOWS.md](./WORKFLOWS.md)
- [ ] Integrate into your CI/CD pipeline
- [ ] Document any customizations in your repo

## Debugging Output

If verification fails, run with verbose output:

```bash
# Verbose doctor output
npx agent-architecture doctor --verbose

# Sample output:
# ✓ Installation directory: .agent
# ✓ Package version: 0.1.3
# ✓ Skills found: 102
# ✓ Agents found: 12
# ✓ Registry: 102 skills, 13 agents, all valid
# ✓ Hook (Claude): .claude/hooks/session-start present
# ✓ Hook (Codex): .codex/hooks/session-start present
# ✓ Skills sorted alphabetically
# ✓ No orphaned skills
# ✓ All agents have >= 5 skills
# ✓ All skill-agent relationships bidirectional
# MCP: (none configured)
```

If any line shows `✗`, see Troubleshooting above.
