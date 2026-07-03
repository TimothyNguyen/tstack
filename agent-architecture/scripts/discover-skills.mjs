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

  const agentsDir = path.join(root, 'agents');
  if (fs.existsSync(agentsDir)) {
    for (const name of fs.readdirSync(agentsDir).sort()) {
      const rel = `agents/${name}/SKILL.md.tmpl`;
      if (fs.existsSync(path.join(root, rel))) {
        templates.push({ tmpl: rel, output: rel.replace(/\.tmpl$/, '') });
      }
    }
  }

  // Also discover skills in packages/skills/ (specialty skills package)
  const skillsPackageDir = path.join(root, 'packages', 'skills');
  if (fs.existsSync(skillsPackageDir)) {
    for (const name of subdirs(skillsPackageDir)) {
      const rel = `packages/skills/${name}/SKILL.md.tmpl`;
      if (fs.existsSync(path.join(root, rel))) {
        templates.push({ tmpl: rel, output: rel.replace(/\.tmpl$/, '') });
      }
    }
    // Also discover specialty agents in packages/skills/agents/
    const skillsAgentsDir = path.join(skillsPackageDir, 'agents');
    if (fs.existsSync(skillsAgentsDir)) {
      for (const name of fs.readdirSync(skillsAgentsDir).sort()) {
        const rel = `packages/skills/agents/${name}/SKILL.md.tmpl`;
        if (fs.existsSync(path.join(root, rel))) {
          templates.push({ tmpl: rel, output: rel.replace(/\.tmpl$/, '') });
        }
      }
    }
  }

  // Also discover adapters in packages/adapters/ (each gets a plugin mirror)
  const adaptersPackageDir = path.join(root, 'packages', 'adapters');
  if (fs.existsSync(adaptersPackageDir)) {
    for (const name of subdirs(adaptersPackageDir)) {
      const rel = `packages/adapters/${name}/SKILL.md.tmpl`;
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
  const rootDirs = subdirs(root).filter((d) => fs.existsSync(path.join(root, d, 'SKILL.md.tmpl')));
  const agentsDir = path.join(root, 'agents');
  const agentDirs = fs.existsSync(agentsDir)
    ? fs.readdirSync(agentsDir).sort().filter((d) => fs.existsSync(path.join(agentsDir, d, 'SKILL.md.tmpl')))
    : [];

  for (const dir of rootDirs) {
    const tmpl = fs.readFileSync(path.join(root, dir, 'SKILL.md.tmpl'), 'utf8');
    map.set(dir, parseFrontmatterAgents(tmpl));
  }
  for (const dir of agentDirs) {
    const tmpl = fs.readFileSync(path.join(agentsDir, dir, 'SKILL.md.tmpl'), 'utf8');
    map.set(`agents/${dir}`, parseFrontmatterAgents(tmpl));
  }

  // Also discover skills in packages/skills/ (specialty skills package)
  const skillsPackageDir = path.join(root, 'packages', 'skills');
  if (fs.existsSync(skillsPackageDir)) {
    for (const dir of subdirs(skillsPackageDir)) {
      const tmplPath = path.join(skillsPackageDir, dir, 'SKILL.md.tmpl');
      if (fs.existsSync(tmplPath)) {
        const tmpl = fs.readFileSync(tmplPath, 'utf8');
        map.set(`packages/skills/${dir}`, parseFrontmatterAgents(tmpl));
      }
    }
    // Also discover specialty agents in packages/skills/agents/
    const skillsAgentsDir = path.join(skillsPackageDir, 'agents');
    if (fs.existsSync(skillsAgentsDir)) {
      for (const dir of fs.readdirSync(skillsAgentsDir).sort()) {
        const tmplPath = path.join(skillsAgentsDir, dir, 'SKILL.md.tmpl');
        if (fs.existsSync(tmplPath)) {
          const tmpl = fs.readFileSync(tmplPath, 'utf8');
          map.set(`packages/skills/agents/${dir}`, parseFrontmatterAgents(tmpl));
        }
      }
    }
  }

  return map;
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

  // Also scan packages/skills/ for section templates
  const skillsPackageDir = path.join(root, 'packages', 'skills');
  if (fs.existsSync(skillsPackageDir)) {
    for (const dir of subdirs(skillsPackageDir)) {
      const sectionsDir = path.join(skillsPackageDir, dir, 'sections');
      if (!fs.existsSync(sectionsDir)) continue;

      for (const entry of fs.readdirSync(sectionsDir, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.md.tmpl')) continue;
        const rel = `packages/skills/${dir}/sections/${entry.name}`;
        templates.push({
          tmpl: rel,
          output: rel.replace(/\.tmpl$/, ''),
          skillDir: `packages/skills/${dir}`,
        });
      }
    }
  }

  return templates.sort((a, b) => a.tmpl.localeCompare(b.tmpl));
}
