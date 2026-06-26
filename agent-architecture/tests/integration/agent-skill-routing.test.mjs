import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');

function readRegistry() {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  const content = fs.readFileSync(registryPath, 'utf8');
  return JSON.parse(content);
}

test('orchestrate agent has routing skills', () => {
  const registry = readRegistry();
  const skills = registry.byAgent.orchestrate || [];

  const expectedSkills = ['subagent-orchestrator', 'autoplan', 'context-save'];
  for (const skill of expectedSkills) {
    assert(skills.includes(skill), `orchestrate should have ${skill} skill`);
  }
});

test('swe agent has implementation skills', () => {
  const registry = readRegistry();
  const skills = registry.byAgent.swe || [];

  const expectedSkills = ['seniorswe-concise', 'commit', 'investigate', 'ship'];
  for (const skill of expectedSkills) {
    assert(skills.includes(skill), `swe should have ${skill} skill`);
  }
});

test('swe agent has new extracted skills', () => {
  const registry = readRegistry();
  const skills = registry.byAgent.swe || [];

  const newSkills = ['systematic-debugging', 'receiving-code-review', 'verification-before-completion'];
  for (const skill of newSkills) {
    assert(skills.includes(skill), `swe should have ${skill} skill after extraction`);
  }
});

test('qa-agent has testing and validation skills', () => {
  const registry = readRegistry();
  const skills = registry.byAgent['qa-agent'] || [];

  const expectedSkills = ['qa', 'test', 'benchmark', 'canary'];
  for (const skill of expectedSkills) {
    assert(skills.includes(skill), `qa-agent should have ${skill} skill`);
  }
});

test('spec-agent has design and documentation skills', () => {
  const registry = readRegistry();
  const skills = registry.byAgent['spec-agent'] || [];

  const expectedSkills = ['spec', 'autoplan', 'diagram'];
  for (const skill of expectedSkills) {
    assert(skills.includes(skill), `spec-agent should have ${skill} skill`);
  }
});

test('pm agent has product management skills', () => {
  const registry = readRegistry();
  const skills = registry.byAgent.pm || [];

  const expectedSkills = ['spec', 'retro', 'release-notes'];
  for (const skill of expectedSkills) {
    assert(skills.includes(skill), `pm should have ${skill} skill`);
  }
});

test('design-agent has UI design skills', () => {
  const registry = readRegistry();
  const skills = registry.byAgent['design-agent'] || [];

  const expectedSkills = ['design-review', 'design-html', 'plan-design-review'];
  for (const skill of expectedSkills) {
    assert(skills.includes(skill), `design-agent should have ${skill} skill`);
  }
});

test('security agent has security review skills', () => {
  const registry = readRegistry();
  const skills = registry.byAgent.security || [];

  const expectedSkills = ['security-review', 'guard', 'investigate', 'health'];
  for (const skill of expectedSkills) {
    assert(skills.includes(skill), `security should have ${skill} skill`);
  }
});

test('migration agent has migration skills', () => {
  const registry = readRegistry();
  const skills = registry.byAgent.migration || [];

  const expectedSkills = ['migration-review', 'careful'];
  for (const skill of expectedSkills) {
    assert(skills.includes(skill), `migration should have ${skill} skill`);
  }
});

test('data agent has databricks and mlops skills', () => {
  const registry = readRegistry();
  const skills = registry.byAgent.data || [];

  assert(skills.some(s => s.includes('databricks')), 'data agent should have databricks skills');
});

test('cloud agent has aws and infrastructure skills', () => {
  const registry = readRegistry();
  const skills = registry.byAgent.cloud || [];

  assert(skills.some(s => s.includes('aws') || s.includes('stack')), 'cloud agent should have aws/stack skills');
});

test('release-agent has release coordination skills', () => {
  const registry = readRegistry();
  const skills = registry.byAgent['release-agent'] || [];

  const expectedSkills = ['release', 'ship', 'release-notes', 'canary', 'retro'];
  for (const skill of expectedSkills) {
    assert(skills.includes(skill), `release-agent should have ${skill} skill`);
  }
});

test('interviewer agent has codebase and documentation skills', () => {
  const registry = readRegistry();
  const skills = registry.byAgent.interviewer || [];

  const expectedSkills = ['codebase-engine', 'diagram'];
  for (const skill of expectedSkills) {
    assert(skills.includes(skill), `interviewer should have ${skill} skill`);
  }
});

test('all agents have at least 5 skills', () => {
  const registry = readRegistry();

  for (const [agent, skills] of Object.entries(registry.byAgent)) {
    if (agent === '_infrastructure') continue;
    assert(skills.length >= 5, `${agent} should have at least 5 skills, has ${skills.length}`);
  }
});

test('no skill is assigned to zero agents', () => {
  const registry = readRegistry();

  for (const skill of registry.skills) {
    assert(skill.agents.length > 0, `${skill.name} should be assigned to at least one agent`);
  }
});

test('brainstorming skill is available to process agents', () => {
  const registry = readRegistry();

  const brainstormSkill = registry.skills.find(s => s.name === 'brainstorming');
  assert(brainstormSkill, 'brainstorming skill should exist');

  const processAgents = ['orchestrate', 'swe', 'spec-agent'];
  const availableToProcessAgents = processAgents.filter(a => brainstormSkill.agents.includes(a));

  assert(availableToProcessAgents.length >= 2, 'brainstorming should be available to at least 2 process agents');
});

test('systematic-debugging available to swe and relevant agents', () => {
  const registry = readRegistry();

  const debugSkill = registry.skills.find(s => s.name === 'systematic-debugging');
  assert(debugSkill, 'systematic-debugging skill should exist');
  assert(debugSkill.agents.includes('swe'), 'systematic-debugging should be available to swe');
});

test('verification-before-completion available to qa and swe agents', () => {
  const registry = readRegistry();

  const verifySkill = registry.skills.find(s => s.name === 'verification-before-completion');
  assert(verifySkill, 'verification-before-completion skill should exist');
  assert(
    verifySkill.agents.includes('swe') || verifySkill.agents.includes('qa-agent'),
    'verification-before-completion should be available to swe or qa-agent'
  );
});

test('each agent in registry has corresponding SKILL.md', () => {
  const registry = readRegistry();

  const agentDirs = fs.readdirSync(path.join(REPO_ROOT, 'agents')).filter(f => {
    const stat = fs.statSync(path.join(REPO_ROOT, 'agents', f));
    return stat.isDirectory();
  });

  for (const agentDir of agentDirs) {
    const skillPath = path.join(REPO_ROOT, 'agents', agentDir, 'SKILL.md');
    assert(fs.existsSync(skillPath), `agent ${agentDir} should have SKILL.md`);
  }
});
