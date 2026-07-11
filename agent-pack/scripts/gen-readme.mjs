#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

// Skip directories
const SKIP = new Set([
  '.git',
  '.hypothesis',
  '.pytest_cache',
  'adapters',
  'core',
  'docs',
  'generated',
  'hosts',
  'node_modules',
  'policies',
  'profiles',
  'scripts',
  'tests',
  '__pycache__',
]);

function isSkipDir(name) {
  return SKIP.has(name) || name.startsWith('.');
}

function findAllSkillDirs(dir = ROOT, results = [], depth = 0) {
  // Limit depth to avoid too deep recursion and skip problematic directories
  if (depth > 10) return results;

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (isSkipDir(entry.name)) continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        try {
          // Check if this directory has SKILL.md
          const skillPath = path.join(fullPath, 'SKILL.md');
          if (fs.existsSync(skillPath)) {
            results.push(fullPath);
          }

          // Recurse into subdirectories
          findAllSkillDirs(fullPath, results, depth + 1);
        } catch (e) {
          // Skip directories we can't access
        }
      }
    }
  } catch (e) {
    // Silently skip unreadable directories
  }

  return results;
}

function parseFrontmatter(content) {
  const text = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  if (!normalized.startsWith('---\n')) return { name: '', description: '' };

  const end = normalized.indexOf('\n---', 4);
  if (end === -1) return { name: '', description: '' };

  const block = normalized.slice(4, end);

  // Extract name
  const nameMatch = block.match(/^name:\s*(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim() : '';

  // Extract description - handle multiline with |
  const descMatch = block.match(/^description:\s*\|\s*\n([\s\S]*?)(?=\n[a-z-]+:|$)/m);
  let description = '';
  if (descMatch) {
    description = descMatch[1]
      .split('\n')
      .map(line => line.replace(/^\s{2}/, '')) // Remove leading 2 spaces
      .join('\n')
      .trim();
  }

  return { name, description };
}

function getReadmeContent(skillName, description) {
  return `# ${skillName}

${description}

## Quick Start

See [SKILL.md](./SKILL.md) for complete documentation.

## See Also

- [agent-pack](../) - Parent documentation
`;
}

function main() {
  const skillDirs = findAllSkillDirs();
  let created = 0;
  const samples = [];

  for (const skillDir of skillDirs) {
    const readmePath = path.join(skillDir, 'README.md');

    // Skip if README already exists
    if (fs.existsSync(readmePath)) {
      continue;
    }

    const skillPath = path.join(skillDir, 'SKILL.md');
    try {
      const skillContent = fs.readFileSync(skillPath, 'utf8');
      const { name, description } = parseFrontmatter(skillContent);

      if (!name || !description) {
        console.warn(`Skipping ${skillDir}: missing name or description in SKILL.md`);
        continue;
      }

      const readmeContent = getReadmeContent(name, description);
      fs.writeFileSync(readmePath, readmeContent);
      created++;

      if (samples.length < 3) {
        samples.push({
          path: path.relative(ROOT, readmePath),
          name,
        });
      }
    } catch (e) {
      console.warn(`Error processing ${skillDir}: ${e.message}`);
    }
  }

  console.log(`\nCreated ${created} README.md files\n`);
  console.log('Sample files created:');
  for (const sample of samples) {
    console.log(`  - ${sample.path} (${sample.name})`);
  }
}

main();
