import fs from 'node:fs';
import path from 'node:path';

const SKIP = new Set([
  '.git',
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
  const dirs = ['', ...subdirs(root)];
  const templates = [];

  for (const dir of dirs) {
    const rel = dir ? `${dir}/SKILL.md.tmpl` : 'SKILL.md.tmpl';
    if (fs.existsSync(path.join(root, rel))) {
      templates.push({ tmpl: rel, output: rel.replace(/\.tmpl$/, '') });
    }
  }

  return templates;
}

export function discoverSectionTemplates(root) {
  const templates = [];

  for (const dir of subdirs(root)) {
    const sectionsDir = path.join(root, dir, 'sections');
    if (!fs.existsSync(sectionsDir)) continue;

    for (const entry of fs.readdirSync(sectionsDir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.md.tmpl')) continue;
      const rel = `${dir}/sections/${entry.name}`;
      templates.push({
        tmpl: rel,
        output: rel.replace(/\.tmpl$/, ''),
        skillDir: dir,
      });
    }
  }

  return templates.sort((a, b) => a.tmpl.localeCompare(b.tmpl));
}
