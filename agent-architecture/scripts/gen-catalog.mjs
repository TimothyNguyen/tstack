#!/usr/bin/env node

/**
 * Generate docs/skill-catalog.md from top-level skill metadata.
 *
 * Usage:
 *   npm run gen:catalog
 *   npm run check:catalog
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const catalogPath = path.join(rootDir, 'docs', 'skill-catalog.md');
const CHECK_MODE = process.argv.includes('--check');

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;

  const raw = match[1];
  const fm = { raw };
  const lines = raw.split('\n');

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (line[0] === ' ') continue;
    if (!line.includes(':')) continue;

    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();
    const trimmedKey = key.trim();

    if (value === '|') {
      const block = [];
      for (let j = i + 1; j < lines.length; j += 1) {
        const next = lines[j];
        if (!next.startsWith('  ')) break;
        block.push(next.slice(2));
        i = j;
      }
      fm[trimmedKey] = block.join('\n').trim();
      continue;
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      fm[trimmedKey] = value
        .slice(1, -1)
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
      continue;
    }

    if (value) {
      fm[trimmedKey] = value;
    }
  }

  return fm;
}

function getDescription(fm) {
  if (!fm?.description) return '';
  return String(fm.description).split('\n')[0].trim();
}

function collectSkills() {
  const skills = [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;

    const skillPath = path.join(rootDir, entry.name, 'SKILL.md.tmpl');
    if (!fs.existsSync(skillPath)) continue;

    try {
      const content = fs.readFileSync(skillPath, 'utf8');
      const fm = parseFrontmatter(content);
      if (!fm?.name) continue;

      skills.push({
        name: fm.name,
        version: fm.version || '0.1.0',
        description: getDescription(fm),
        agents: Array.isArray(fm.agents) ? fm.agents : [],
        category: fm.category || 'core',
        directory: entry.name,
      });
    } catch (error) {
      console.error(`Error parsing ${skillPath}: ${error.message}`);
    }
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

function groupByCategory(skills) {
  const categories = [
    'core',
    'visual-system',
    'design',
    'code',
    'data',
    'release',
    'infrastructure',
  ];

  const grouped = {};
  for (const category of categories) {
    grouped[category] = skills.filter((skill) => skill.category === category);
  }
  return grouped;
}

function formatSkillLine(skill, { bold = false, includeAgents = false } = {}) {
  const link = `[\`${skill.name}\`](./${skill.directory}/SKILL.md)`;
  const prefix = bold ? `**${link}**` : link;
  const agents = includeAgents
    ? skill.agents.filter((agent) => agent !== '_infrastructure').slice(0, 2).join(', ')
    : '';
  const agentSuffix = agents ? ` *(${agents})*` : '';
  return `- ${prefix} - ${skill.description}${agentSuffix}`;
}

function generateCatalog(skills) {
  const grouped = groupByCategory(skills);
  const categoryNames = {
    core: 'Core Workflows',
    'visual-system': 'Visual System (Diagrams & Design)',
    design: 'Design & Review',
    code: 'Code & Implementation',
    data: 'Data & MLOps',
    release: 'Release & Deployment',
    infrastructure: 'Infrastructure & Coordination',
  };

  const lines = [
    '# Skill Catalog',
    '',
    `Agent-architecture provides ${skills.length} reusable skills organized by category and specialized role.`,
    '',
    '**[Contributing?](./CONTRIBUTING.md)** See submission process and validation checklist.',
    '',
    '---',
    '',
    '## By Category',
    '',
  ];

  for (const [category, categorySkills] of Object.entries(grouped)) {
    if (categorySkills.length === 0) continue;
    lines.push(`### ${categoryNames[category]}`);
    lines.push('');
    for (const skill of categorySkills) {
      lines.push(formatSkillLine(skill, { bold: true, includeAgents: true }));
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## By Agent');
  lines.push('');

  const agents = [
    'swe',
    'qa-agent',
    'spec-agent',
    'pm',
    'design-agent',
    'diagram-agent',
    'orchestrate',
    'security',
    'migration',
    'migration-engineer',
    'data',
    'cloud',
    'release-agent',
    'interviewer',
  ];

  for (const agent of agents) {
    const agentSkills = skills.filter((skill) => skill.agents.includes(agent));
    if (agentSkills.length === 0) continue;

    lines.push(`### \`/${agent}\``);
    lines.push('');
    lines.push(`${agentSkills.length} skills`);
    lines.push('');
    for (const skill of agentSkills) {
      lines.push(formatSkillLine(skill));
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Statistics');
  lines.push('');
  lines.push('| Category | Count |');
  lines.push('|----------|-------|');
  for (const [category, categorySkills] of Object.entries(grouped)) {
    if (categorySkills.length > 0) {
      lines.push(`| ${categoryNames[category]} | ${categorySkills.length} |`);
    }
  }
  lines.push(`| **Total** | **${skills.length}** |`);
  lines.push('');
  lines.push('See [METADATA-SCHEMA.md](./METADATA-SCHEMA.md) for skill development and metadata reference.');
  lines.push('');

  return lines.join('\n');
}

function main() {
  console.log('Generating skill catalog...');

  const skills = collectSkills();
  const catalog = generateCatalog(skills);

  if (CHECK_MODE) {
    if (!fs.existsSync(catalogPath)) {
      console.error('Catalog file missing. Run: npm run gen:catalog');
      process.exit(1);
    }

    const existing = fs.readFileSync(catalogPath, 'utf8');
    if (existing !== catalog) {
      console.error('Catalog is stale. Run: npm run gen:catalog');
      process.exit(1);
    }

    console.log(`Catalog is current (${skills.length} skills)`);
    return;
  }

  fs.writeFileSync(catalogPath, catalog, 'utf8');
  console.log(`Generated ${catalogPath} (${skills.length} skills)`);
}

main();
