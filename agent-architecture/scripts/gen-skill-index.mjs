#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { discoverTemplates } from './discover-skills.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const CHECK = process.argv.includes('--check');
const OUTPUT = path.join(ROOT, 'generated', 'skills.index.json');

function parseFrontmatter(content) {
  const text = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!normalized.startsWith('---\n')) return {};
  const end = normalized.indexOf('\n---', 4);
  if (end === -1) return {};
  const block = normalized.slice(4, end);

  const result = {};

  const nameMatch = block.match(/^name:\s*(.+)$/m);
  if (nameMatch) result.name = nameMatch[1].trim();

  const versionMatch = block.match(/^version:\s*(.+)$/m);
  if (versionMatch) result.version = versionMatch[1].trim();

  const descMatch = block.match(/^description:\s*\|?\s*\n((?:[ \t]+.+\n?)+)/m);
  if (descMatch) {
    result.description = descMatch[1]
      .replace(/^[ \t]{2}/gm, '')
      .trim()
      .split('\n')[0]
      .trim();
  } else {
    const inlineDesc = block.match(/^description:\s*(.+)$/m);
    if (inlineDesc) result.description = inlineDesc[1].trim();
  }

  const agentsMatch = block.match(/^agents:\s*\[([^\]]*)\]/m);
  if (agentsMatch) {
    result.agents = agentsMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
  } else {
    result.agents = [];
  }

  return result;
}

function buildIndex() {
  const templates = discoverTemplates(ROOT);
  const skills = [];

  for (const { tmpl } of templates) {
    const tmplPath = path.join(ROOT, tmpl);
    const content = fs.readFileSync(tmplPath, 'utf8');
    const fm = parseFrontmatter(content);
    if (!fm.name) continue;

    skills.push({
      name: fm.name,
      version: fm.version || null,
      description: fm.description || null,
      path: tmpl,
      agents: fm.agents,
    });
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));
  return { generatedAt: new Date().toISOString(), count: skills.length, skills };
}

const index = buildIndex();
const rendered = `${JSON.stringify(index, null, 2)}\n`;

if (CHECK) {
  const current = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf8').replace(/\r\n/g, '\n') : '';
  const normalized = rendered.replace(/\r\n/g, '\n');

  // Compare ignoring generatedAt timestamp
  const stripTs = (s) => s.replace(/"generatedAt":\s*"[^"]*"/, '"generatedAt": ""');
  if (stripTs(current) !== stripTs(normalized)) {
    console.error('generated/skills.index.json is stale; run npm run build:index from agent-architecture/');
    process.exitCode = 1;
  } else {
    console.log(`check:index OK (${index.count} skills)`);
  }
} else {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, rendered, 'utf8');
  console.log(`skills.index.json written (${index.count} skills)`);
}
