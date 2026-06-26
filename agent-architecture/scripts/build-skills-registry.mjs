#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { discoverTemplates } from './discover-skills.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const CHECK = process.argv.includes('--check');
const OUTPUT = path.join(ROOT, 'generated', 'registry.json');

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

  const toolsMatch = block.match(/^allowed-tools:\s*\n((?:[ \t]+-\s*.+\n?)+)/m);
  if (toolsMatch) {
    result.allowedTools = toolsMatch[1]
      .split('\n')
      .map((line) => line.replace(/^[ \t]+-\s*/, '').trim())
      .filter(Boolean);
  } else {
    result.allowedTools = [];
  }

  return result;
}

function buildRegistry() {
  const templates = discoverTemplates(ROOT);
  const skills = [];
  const byAgent = {};

  for (const { output } of templates) {
    const filePath = path.join(ROOT, output);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    const fm = parseFrontmatter(content);
    if (!fm.name) continue;

    const skillEntry = {
      name: fm.name,
      version: fm.version || null,
      description: fm.description || null,
      agents: fm.agents,
      allowedTools: fm.allowedTools,
    };

    skills.push(skillEntry);

    for (const agent of fm.agents) {
      if (!byAgent[agent]) byAgent[agent] = [];
      byAgent[agent].push(fm.name);
    }
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));

  return {
    generatedAt: new Date().toISOString(),
    count: skills.length,
    byAgent: Object.fromEntries(
      Object.entries(byAgent).sort((a, b) => a[0].localeCompare(b[0])),
    ),
    skills,
  };
}

const registry = buildRegistry();
const rendered = `${JSON.stringify(registry, null, 2)}\n`;

if (CHECK) {
  const current = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf8').replace(/\r\n/g, '\n') : '';
  const normalized = rendered.replace(/\r\n/g, '\n');

  const stripTs = (s) => s.replace(/"generatedAt":\s*"[^"]*"/, '"generatedAt": ""');
  if (stripTs(current) !== stripTs(normalized)) {
    console.error('generated/registry.json is stale; run npm run build:registry from agent-architecture/');
    process.exitCode = 1;
  } else {
    console.log(`check:registry OK (${registry.count} skills)`);
  }
} else {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, rendered, 'utf8');
  console.log(`registry.json written (${registry.count} skills, ${Object.keys(registry.byAgent).length} agents)`);
}
