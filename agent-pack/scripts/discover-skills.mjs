import fs from 'node:fs';
import path from 'node:path';

const SKIP = new Set([
  '.git',
  'adapters',
  'agents',
  'core',
  'docs',
  'domains',
  'generated',
  'hosts',
  'node_modules',
  'plugins',
  'policies',
  'profiles',
  'scripts',
  'skills',
  'stacks',
  'tests',
  'tool-providers',
]);

function subdirs(root) {
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith('.'))
    .filter((entry) => !SKIP.has(entry.name))
    .map((entry) => entry.name)
    .sort();
}

export function discoverTemplates(root) {
  const templates = [];

  const rootSkill = 'SKILL.md.tmpl';
  if (fs.existsSync(path.join(root, rootSkill))) {
    templates.push({ tmpl: rootSkill, output: 'SKILL.md' });
  }

  for (const base of ['skills', 'agents', 'adapters', 'stacks', 'domains', 'tool-providers']) {
    const baseDir = path.join(root, base);
    if (!fs.existsSync(baseDir)) continue;
    for (const name of subdirs(baseDir)) {
      const rel = `${base}/${name}/SKILL.md.tmpl`;
      if (fs.existsSync(path.join(root, rel))) {
        templates.push({ tmpl: rel, output: rel.replace(/\.tmpl$/, '') });
      }
    }
  }

  return templates;
}

export function parseFrontmatterAgents(content) {
  // Strip UTF-8 BOM if present
  const text = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
  // Normalize CRLF → LF for consistent parsing
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!normalized.startsWith('---\n')) return [];
  const end = normalized.indexOf('\n---', 4);
  if (end === -1) return [];
  const block = normalized.slice(4, end);
  const match = block.match(/^agents:\s*\[([^\]]*)\]/m);
  if (!match) return [];
  return match[1].split(',').map((s) => s.trim()).filter(Boolean);
}

export function discoverSkillAgents(root) {
  const map = new Map();
  for (const base of ['skills', 'agents', 'adapters', 'stacks', 'domains', 'tool-providers']) {
    const baseDir = path.join(root, base);
    if (!fs.existsSync(baseDir)) continue;
    for (const dir of subdirs(baseDir)) {
      const tmplPath = path.join(baseDir, dir, 'SKILL.md.tmpl');
      if (!fs.existsSync(tmplPath)) continue;
      const tmpl = fs.readFileSync(tmplPath, 'utf8');
      map.set(`${base}/${dir}`, parseFrontmatterAgents(tmpl));
    }
  }

  return map;
}

export function discoverSectionTemplates(root) {
  const templates = [];

  for (const base of ['skills', 'agents', 'adapters', 'stacks', 'domains', 'tool-providers']) {
    const baseDir = path.join(root, base);
    if (!fs.existsSync(baseDir)) continue;
    for (const dir of subdirs(baseDir)) {
      const sectionsDir = path.join(baseDir, dir, 'sections');
      if (!fs.existsSync(sectionsDir)) continue;

      for (const entry of fs.readdirSync(sectionsDir, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.md.tmpl')) continue;
        const rel = `${base}/${dir}/sections/${entry.name}`;
        templates.push({
          tmpl: rel,
          output: rel.replace(/\.tmpl$/, ''),
          skillDir: `${base}/${dir}`,
        });
      }
    }
  }

  return templates.sort((a, b) => a.tmpl.localeCompare(b.tmpl));
}
