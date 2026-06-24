import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { discoverSkillAgents } from '../scripts/discover-skills.mjs';

const root = path.resolve(import.meta.dirname, '..');

const VALID_AGENTS = new Set([
  'orchestrate', 'swe', 'qa-agent', 'pm', 'spec-agent',
  'design-agent', 'migration', 'data', 'cloud', 'interviewer',
  '_infrastructure',
]);

test('every skill with SKILL.md.tmpl declares agents: field', () => {
  const map = discoverSkillAgents(root);
  assert.ok(map.size >= 30, `expected >= 30 skills, got ${map.size}`);
  for (const [skill, agents] of map) {
    assert.ok(agents.length >= 1, `skill "${skill}" has no agents: declaration`);
    for (const agent of agents) {
      assert.ok(VALID_AGENTS.has(agent), `skill "${skill}" declares unknown agent "${agent}"`);
    }
  }
});

test('no skill is missing agents: field', () => {
  const map = discoverSkillAgents(root);
  const missing = [...map.entries()].filter(([, agents]) => agents.length === 0).map(([s]) => s);
  assert.deepEqual(missing, [], `orphan skills (missing agents: field): ${missing.join(', ')}`);
});

test('all 10 role agents exist in agents/ directory', () => {
  const agentsDir = path.join(root, 'agents');
  assert.ok(fs.existsSync(agentsDir), 'agents/ directory missing');
  const EXPECTED = ['orchestrate', 'swe', 'qa-agent', 'pm', 'spec-agent',
    'design-agent', 'migration', 'data', 'cloud', 'interviewer'];
  for (const agent of EXPECTED) {
    const skillPath = path.join(agentsDir, agent, 'SKILL.md.tmpl');
    assert.ok(fs.existsSync(skillPath), `agents/${agent}/SKILL.md.tmpl missing`);
  }
});

test('each agent SKILL.md.tmpl uses _infrastructure as its own agent', () => {
  const agentsDir = path.join(root, 'agents');
  for (const entry of fs.readdirSync(agentsDir)) {
    const tmplPath = path.join(agentsDir, entry, 'SKILL.md.tmpl');
    if (!fs.existsSync(tmplPath)) continue;
    const content = fs.readFileSync(tmplPath, 'utf8');
    assert.ok(
      content.includes('agents: [_infrastructure]'),
      `agents/${entry}/SKILL.md.tmpl must declare agents: [_infrastructure]`
    );
  }
});
