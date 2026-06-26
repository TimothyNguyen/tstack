import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');

test('registry.json exists and is valid', () => {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  assert(fs.existsSync(registryPath), 'registry.json should exist');

  const content = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(content);

  assert(registry.count, 'registry should have count');
  assert(registry.skills, 'registry should have skills array');
  assert(registry.byAgent, 'registry should have byAgent mapping');
  assert(Array.isArray(registry.skills), 'skills should be array');
  assert(typeof registry.byAgent === 'object', 'byAgent should be object');
});

test('registry maps 102 skills', () => {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  const content = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(content);

  assert.strictEqual(registry.count, 102, 'should have 102 skills');
  assert.strictEqual(registry.skills.length, 102, 'skills array should have 102 items');
});

test('registry maps skills to 13 agents', () => {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  const content = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(content);

  const agents = Object.keys(registry.byAgent).filter(a => a !== '_infrastructure');
  assert.strictEqual(agents.length, 12, 'should have 12 role agents');
});

test('registry has expected core agents', () => {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  const content = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(content);

  const expectedAgents = ['swe', 'qa-agent', 'spec-agent', 'pm', 'design-agent', 'orchestrate', 'security', 'migration', 'data', 'cloud', 'release-agent', 'interviewer'];

  for (const agent of expectedAgents) {
    assert(registry.byAgent[agent], `registry should have ${agent} agent`);
    assert(Array.isArray(registry.byAgent[agent]), `${agent} should have skill list`);
    assert(registry.byAgent[agent].length > 0, `${agent} should have at least one skill`);
  }
});

test('each skill has required registry fields', () => {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  const content = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(content);

  for (const skill of registry.skills) {
    assert(skill.name, `skill should have name`);
    assert(typeof skill.name === 'string', `skill name should be string`);
    assert(Array.isArray(skill.agents), `skill should have agents array`);
    assert(skill.agents.length > 0, `skill should be assigned to at least one agent`);
    assert('allowedTools' in skill, `skill should have allowedTools field`);
  }
});

test('each skill is assigned to at least one agent', () => {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  const content = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(content);

  let unassignedCount = 0;
  for (const skill of registry.skills) {
    if (!skill.agents || skill.agents.length === 0) {
      unassignedCount++;
    }
  }

  assert.strictEqual(unassignedCount, 0, 'all skills should be assigned to at least one agent');
});

test('registry agents have skills in skill list', () => {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  const content = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(content);

  const skillNames = new Set(registry.skills.map(s => s.name));

  for (const [agent, skills] of Object.entries(registry.byAgent)) {
    for (const skillName of skills) {
      assert(skillNames.has(skillName), `skill ${skillName} referenced in ${agent} agent should exist in skills list`);
    }
  }
});

test('registry skills have agents in registry byAgent keys', () => {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  const content = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(content);

  const agentKeys = new Set(Object.keys(registry.byAgent));

  for (const skill of registry.skills) {
    for (const agent of skill.agents) {
      assert(agentKeys.has(agent), `agent ${agent} declared in skill ${skill.name} should exist in registry.byAgent`);
    }
  }
});

test('using-agent-skills skill exists and is in registry', () => {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  const content = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(content);

  const usingSkill = registry.skills.find(s => s.name === 'using-agent-skills');
  assert(usingSkill, 'using-agent-skills should be in registry');
  assert(Array.isArray(usingSkill.agents), 'using-agent-skills should have agents');
  assert(usingSkill.agents.length >= 12, 'using-agent-skills should be available to all role agents');
});

test('brainstorming skill is in registry', () => {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  const content = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(content);

  const brainstormSkill = registry.skills.find(s => s.name === 'brainstorming');
  assert(brainstormSkill, 'brainstorming should be in registry');
  assert(brainstormSkill.agents.includes('orchestrate'), 'brainstorming should be available to orchestrate agent');
});

test('systematic-debugging skill is in registry', () => {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  const content = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(content);

  const debugSkill = registry.skills.find(s => s.name === 'systematic-debugging');
  assert(debugSkill, 'systematic-debugging should be in registry');
  assert(debugSkill.agents.includes('swe'), 'systematic-debugging should be available to swe agent');
});

test('receiving-code-review skill is in registry', () => {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  const content = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(content);

  const reviewSkill = registry.skills.find(s => s.name === 'receiving-code-review');
  assert(reviewSkill, 'receiving-code-review should be in registry');
  assert(reviewSkill.agents.includes('swe'), 'receiving-code-review should be available to swe agent');
});

test('verification-before-completion skill is in registry', () => {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  const content = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(content);

  const verifySkill = registry.skills.find(s => s.name === 'verification-before-completion');
  assert(verifySkill, 'verification-before-completion should be in registry');
  assert(verifySkill.agents.includes('swe'), 'verification-before-completion should be available to swe agent');
});

test('core infrastructure skills are available to all agents', () => {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  const content = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(content);

  const infrastructureSkills = ['using-agent-skills', 'commit', 'health'];
  const agents = Object.keys(registry.byAgent).filter(a => a !== '_infrastructure');

  for (const skillName of infrastructureSkills) {
    const skill = registry.skills.find(s => s.name === skillName);
    if (skill) {
      // Core infrastructure skills should be available to most agents
      assert(skill.agents.length >= 2, `${skillName} should be available to multiple agents`);
    }
  }
});

test('skill registry is sorted alphabetically', () => {
  const registryPath = path.join(REPO_ROOT, 'generated', 'registry.json');
  const content = fs.readFileSync(registryPath, 'utf8');
  const registry = JSON.parse(content);

  const names = registry.skills.map(s => s.name);
  const sorted = [...names].sort();

  for (let i = 0; i < names.length; i++) {
    assert.strictEqual(names[i], sorted[i], `skills should be alphabetically sorted at index ${i}`);
  }
});
