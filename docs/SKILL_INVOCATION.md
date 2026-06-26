# Skill Invocation & Discovery Guide

How agents discover, invoke, and coordinate skills through the registry.

## Bootstrap: Using-Agent-Skills

At session start, the session-start hook injects `using-agent-skills` skill into every agent's context. This teaches:

1. **Skill Discovery:** Query registry for available skills
2. **Invocation:** Use Skill tool to load and execute skills
3. **Priority:** Process skills before implementation skills
4. **Discipline:** Follow rigid skills exactly (TDD, systematic-debugging)
5. **Red Flags:** Recognize rationalization traps

### Example: Agent Startup Context

```
<EXTREMELY_IMPORTANT>
You have access to agent-architecture skills.

Below is the full content of your 'using-agent-skills' introduction:
- Learn how to find and use skills
- Skill priority: process first (brainstorming, debugging), then implementation
- Red flags: "this is simple", "let me explore first", "I'll just do one thing"
- If 1% chance a skill applies, invoke it — no rationalization

For all other skills, use the 'Skill' tool.
</EXTREMELY_IMPORTANT>
```

## Registry-Based Discovery

After bootstrap, agents query the registry to find available skills:

```javascript
// Read registry at .agent/generated/registry.json
const registry = JSON.parse(fs.readFileSync('.agent/generated/registry.json', 'utf8'));

// Find skills available to current agent
const currentAgent = 'swe';
const availableSkills = registry.byAgent[currentAgent];
// ['brainstorming', 'systematic-debugging', 'commit', 'investigate', 'ship', ...]

// Find skills by capability
const codeReviewSkills = registry.skills.filter(s => 
  s.name.includes('review') && s.agents.includes(currentAgent)
);

// Find skills by allowed tools
const bashSkills = registry.skills.filter(s => 
  s.allowedTools.includes('Bash') && s.agents.includes(currentAgent)
);
```

## Skill Invocation Patterns

### Pattern 1: Skill Checks (Mandatory)

Before responding to any task, check if a skill applies:

```
User: "Fix this bug in auth.ts"

Agent thinks:
1. Do I have systematic-debugging? (check registry)
   byAgent[swe].includes('systematic-debugging') → true
2. Does it apply? (1% chance rule)
   Bug investigation = 100% chance systematic-debugging applies
3. Invoke BEFORE doing anything:
   /systematic-debugging

Result: Skill loaded, agent follows its workflow exactly
```

### Pattern 2: Skill Priority

When multiple skills could apply, use this order:

```
Task: "Build a feature"

Skill Priority:
1. brainstorming (PROCESS SKILL — determines HOW to approach)
   ├─ Query user intent
   ├─ Explore design space
   └─ Refine requirements

2. spec (IMPLEMENTATION SKILL — guides execution)
   ├─ Write formal spec
   └─ Create task breakdown

3. design-html (IMPLEMENTATION SKILL)
   ├─ Create UI mockups
   └─ Implement components

MANDATORY: Invoke brainstorming first, then spec, then design-html
```

### Pattern 3: Skill Tool Invocation

Load a skill via the Skill tool:

```
# Syntax
/skill-name

# Example: Invoke brainstorming
/brainstorming

The brainstorming skill loads with:
- Full content of brainstorming/SKILL.md
- Agent-specific preamble
- Workflow steps
- Output requirements
```

### Pattern 4: Skill Coordination

Agents coordinate via registry + subagent-orchestrator:

```
Orchestrate Agent runs:

1. /brainstorming
   → Facilitates idea dialogue
   → Identifies design patterns
   
2. /subagent-orchestrator
   → Creates manifest for parallel work
   → Assigns spec-agent for formal spec
   → Assigns design-agent for UI design
   → Assigns swe for implementation
   
3. /autoplan
   → Reviews all subagent plans
   → Coordinates dependencies
   → Identifies risks

Result: 4 agents work in parallel, each following their skills exactly
```

## Core Skill Groups

### Process Skills (Follow Exactly)

These determine HOW to approach work. Don't rationalize away discipline:

| Skill | Use Case | Agents | Mandatory When |
|-------|----------|--------|----------------|
| `brainstorming` | Design-space exploration | orchestrate, swe, spec-agent | Starting new feature, unclear requirements |
| `systematic-debugging` | Complex multi-layer bugs | swe, security | Bug persists after multiple fix attempts |
| `verification-before-completion` | Ship-readiness | swe, qa-agent | Claiming work complete, before commit |

### Implementation Skills (Flexible)

These guide execution but can adapt to context:

| Skill | Use Case | Agents |
|-------|----------|--------|
| `spec` | Requirements → formal spec | spec-agent, pm |
| `plan-review` | Implementation plan review | orchestrate |
| `design-html` | HTML from design direction | design-agent |
| `commit` | Atomic commits, Conventional Commits | swe, data |

### Domain Skills (Stack-Specific)

Automatically discovered based on tech stack detection:

```javascript
// Example: TypeScript + React repo
const techStack = detectTechStack();
if (techStack.includes('react')) {
  agentSkills.push('stack-react-typescript');
}
if (techStack.includes('postgres')) {
  agentSkills.push('stack-postgres');
}
```

## Registry Structure

After installation, registry.json contains:

```javascript
{
  "generatedAt": "2026-06-26T20:42:16.153Z",
  "count": 102,
  
  // Agent → Skills mapping (for discovery)
  "byAgent": {
    "swe": [
      "brainstorming",
      "systematic-debugging",
      "receiving-code-review",
      "commit",
      "investigate",
      "ship",
      "seniorswe-concise",
      "verification-before-completion"
    ],
    "qa-agent": [
      "qa",
      "test",
      "benchmark",
      "canary",
      "health"
    ],
    // ... 10 more role agents
  },
  
  // Full skill metadata (for capability queries)
  "skills": [
    {
      "name": "brainstorming",
      "version": "0.1.0",
      "description": "Design-space exploration and requirements refinement...",
      "agents": ["orchestrate", "swe", "spec-agent"],
      "allowedTools": ["Read", "Grep", "Glob", "Bash"]
    },
    // ... 101 more skills
  ]
}
```

## Skill Lifecycle

### Load Time (Session Start)

1. Host loads session-start hook
2. Hook reads using-agent-skills/SKILL.md
3. Hook injects full content into system prompt
4. Agent receives skill + bootstrap context
5. Agent learns skill discovery patterns

### Runtime (User Task)

```
User: "Fix the login bug"
     ↓
Agent: Check for applicable skills
     ↓
Agent: /systematic-debugging (skill loaded)
     ↓
Skill: Run 6-step investigation workflow
     ↓
Skill: Root cause identified
     ↓
Agent: Implement fix using skill guidance
```

### Skill End-to-End Example

```bash
# File: .agent/generated/registry.json
# Contains 102 skills, 13 agents

# User invokes SWE agent
/swe

# Agent receives:
# 1. System prompt
# 2. using-agent-skills context (from session-start hook)
# 3. SWE agent SKILL.md
# 4. Access to Skill tool

# User: "Debug this crash in prod"
# Agent thinks:
# 1. Is this a debugging task? YES (100%)
# 2. Registry shows: byAgent.swe.includes('systematic-debugging') → true
# 3. Invoke BEFORE exploring: /systematic-debugging

# Skill loads with:
# - 6-step investigation framework
# - Evidence gathering patterns
# - Root-cause analysis discipline
# - Fix validation before landing

# Agent follows skill exactly for 6 hours of complex debugging
# Then implements fix with /receiving-code-review discipline
```

## Skill Tool vs Registry

| When | Use | Why |
|------|-----|-----|
| Session start | Registry (read-only) | Fast skill discovery, no tool needed |
| Skill selection | Skill tool (`/skill-name`) | Loads full skill content, prepares agent |
| Capability query | Registry (programmatic) | JSON lookup for tool lists, agents |
| Skill coordination | Registry + subagent-orchestrator | Parallelizes work across agents |

## Avoiding Rationalization Traps

Skills declare themselves in registry. If a skill applies, agent has **no choice**:

### ❌ Rationalization: "This is just a simple bug"

```
Thought: "Should just take 5 minutes to fix"
Reality: Bug has persisted 2+ days, needs systematic-debugging
Action: /systematic-debugging (MANDATORY)
```

### ❌ Rationalization: "Let me explore the codebase first"

```
Thought: "I'll quickly check how X works"
Reality: systematic-debugging teaches HOW to explore
Action: /systematic-debugging BEFORE exploring
```

### ❌ Rationalization: "I remember this skill"

```
Thought: "I know what brainstorming does"
Reality: Skills evolve, current version is authoritative
Action: /brainstorming (read current version)
```

### ✓ Correct: Skill Priority + Invocation

```
Task: "Build new reporting feature"

1. /brainstorming → PROCESS (required first)
   └─ Determine architecture + UX patterns

2. /spec → IMPLEMENTATION (required second)  
   └─ Formal spec from brainstorming output

3. Design, code, test following spec

Result: Disciplined, coherent, high-quality delivery
```

## Cross-Agent Skill Discovery

Agents can query which OTHER agents have specific skills:

```javascript
// SWE needs design help
const designAgents = registry.byAgent['design-agent'];
// → ['design-review', 'design-html', 'plan-design-review', ...]

// SWE routes to design-agent
dispatch('design-agent', { task: 'Create HTML from mockup' });

// Design-agent invokes /design-html automatically
// (design-agent already has it in registry.byAgent)
```

## Registry Maintenance

Registry auto-generates on `npm run build:skills`:

```bash
# In agent-architecture/

# Update a skill
vi brainstorming/SKILL.md.tmpl
vi brainstorming/SKILL.md

# Rebuild everything
npm run build:skills

# Verify registry is fresh
npm run check:skills

# Output: registry.json has latest mappings
```

When installed in another project, registry is **read-only** (already generated in npm package).

For custom skills in your repo, manually edit registry after adding:

```bash
# Add new-skill/SKILL.md with agents: [swe]
# Then update registry manually:
cat >> .agent/generated/registry.json << EOF
{
  "name": "new-skill",
  "agents": ["swe"],
  "allowedTools": ["Read", "Bash"],
  "description": "..."
}
EOF
```

## Next Steps

- Read [WORKFLOWS.md](./WORKFLOWS.md) for end-to-end task patterns
- Read [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- See [INSTALLATION.md](./INSTALLATION.md) for registry access
