#!/usr/bin/env node
/**
 * Syncs each agent/SKILL.md.tmpl with the list of skills that declare
 * themselves for that agent via their `agents:` frontmatter field.
 *
 * Appends / updates a guarded block:
 *   <!-- agent-skills:start -->
 *   ...generated table...
 *   <!-- agent-skills:end -->
 *
 * Usage:
 *   node scripts/sync-agent-skills.mjs          # write mode
 *   node scripts/sync-agent-skills.mjs --check  # verify, exit 1 if stale
 */
import fs from 'node:fs';
import path from 'node:path';
import { discoverSkillAgents } from './discover-skills.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const CHECK = process.argv.includes('--check');

const START = '<!-- agent-skills:start -->';
const END = '<!-- agent-skills:end -->';

function parseFrontmatterDescription(content) {
  const text = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!normalized.startsWith('---\n')) return null;
  const end = normalized.indexOf('\n---', 4);
  if (end === -1) return null;
  const block = normalized.slice(4, end);
  const descMatch = block.match(/^description:\s*\|?\s*\n((?:[ \t]+.+\n?)+)/m);
  if (descMatch) {
    return descMatch[1].replace(/^[ \t]{2}/gm, '').trim().split('\n')[0].trim();
  }
  const inlineMatch = block.match(/^description:\s*(.+)$/m);
  return inlineMatch ? inlineMatch[1].trim() : null;
}

function buildBlock(agentName, skills) {
  if (skills.length === 0) return '';
  const rows = skills.map(({ name, description }) => {
    const safeDesc = (description || '').replace(/\|/g, '\\|');
    return `| \`${name}\` | ${safeDesc} |`;
  });
  return [
    '',
    START,
    '## Declared Skills',
    '',
    'Skills that declare this agent in their frontmatter `agents:` field.',
    '',
    '| Skill | Description |',
    '|-------|-------------|',
    ...rows,
    END,
    '',
  ].join('\n');
}

function applyBlock(content, block) {
  const startIdx = content.indexOf(START);
  const endIdx = content.indexOf(END);
  if (startIdx !== -1 && endIdx !== -1) {
    const before = content.slice(0, startIdx).trimEnd();
    const after = content.slice(endIdx + END.length).trimStart();
    return `${before}${block}${after ? `\n${after}` : ''}`;
  }
  return `${content.trimEnd()}${block}`;
}

function agentPath(name) {
  return path.join(ROOT, 'agents', name, 'SKILL.md.tmpl');
}

function run() {
  // skill-dir → agents[]
  const skillAgentMap = discoverSkillAgents(ROOT);

  // agent-name → [{ name, description }]
  const agentSkillMap = new Map();
  for (const [skillDir, agents] of skillAgentMap) {
    if (agents.length === 0) continue;
    const tmplPath = path.join(ROOT, skillDir, 'SKILL.md.tmpl');
    const tmplContent = fs.readFileSync(tmplPath, 'utf8');
    const description = parseFrontmatterDescription(tmplContent);
    const skillName = path.basename(skillDir);

    for (const agent of agents) {
      if (agent.startsWith('_')) continue; // skip meta-tags like _infrastructure
      if (!agentSkillMap.has(agent)) agentSkillMap.set(agent, []);
      agentSkillMap.get(agent).push({ name: skillName, description });
    }
  }

  let stale = 0;
  let updated = 0;

  const agentsDir = path.join(ROOT, 'agents');
  const agentDirs = fs.readdirSync(agentsDir)
    .filter((d) => fs.existsSync(path.join(agentsDir, d, 'SKILL.md.tmpl')))
    .sort();

  for (const agentName of agentDirs) {
    const tmplPath = agentPath(agentName);
    const current = fs.readFileSync(tmplPath, 'utf8').replace(/\r\n/g, '\n');

    const skills = (agentSkillMap.get(agentName) || []).sort((a, b) => a.name.localeCompare(b.name));
    const block = buildBlock(agentName, skills);
    const desired = applyBlock(current, block);

    if (current === desired) continue;

    if (CHECK) {
      console.error(`agents/${agentName}/SKILL.md.tmpl is stale; run npm run sync:agents`);
      stale++;
    } else {
      fs.writeFileSync(tmplPath, desired, 'utf8');
      console.log(`updated agents/${agentName}/SKILL.md.tmpl (${skills.length} skills)`);
      updated++;
    }
  }

  if (CHECK) {
    if (stale === 0) {
      console.log(`check:agents OK (${agentDirs.length} agents)`);
    } else {
      process.exitCode = 1;
    }
  } else {
    if (updated === 0) {
      console.log(`sync:agents — all ${agentDirs.length} agents up to date`);
    } else {
      console.log(`sync:agents — ${updated} agent(s) updated; run npm run build:skills`);
    }
  }
}

run();
