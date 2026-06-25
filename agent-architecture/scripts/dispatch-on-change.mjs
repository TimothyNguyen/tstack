#!/usr/bin/env node
/**
 * Maps a list of changed files to the appropriate agent roles.
 *
 * Usage:
 *   node scripts/dispatch-on-change.mjs --files /tmp/changed.txt
 *   node scripts/dispatch-on-change.mjs --git-diff HEAD~1
 *   git diff --name-only HEAD~1 | node scripts/dispatch-on-change.mjs
 *
 * Options:
 *   --files <path>       newline-separated file list
 *   --git-diff <ref>     run git diff --name-only against <ref>
 *   --output <path>      write JSON to file instead of stdout
 *   --manifests          also write subagent manifests to .architecture-agent/
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createSubagentManifest, writeSubagentManifest } from '../core/subagents.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const ROUTING = JSON.parse(fs.readFileSync(path.join(ROOT, 'agents', 'routing.json'), 'utf8'));

const args = process.argv.slice(2);

function flag(name) {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : null;
}
const hasFlag = (name) => args.includes(name);

// ── Glob-to-regex (mirrors core/subagents.mjs to avoid circular import issues) ──

function globToRegex(pattern) {
  const normalized = pattern.replace(/\\/g, '/');
  let regex = '';
  let i = 0;
  while (i < normalized.length) {
    const ch = normalized[i];
    if (ch === '*' && normalized[i + 1] === '*') {
      i += 2;
      if (normalized[i] === '/') {
        // **/ → zero or more path segments
        regex += '(?:[^/]+/)*';
        i++;
      } else {
        regex += '.*';
      }
    } else if (ch === '*') {
      regex += '[^/]*';
      i++;
    } else if (ch === '?') {
      regex += '[^/]';
      i++;
    } else {
      regex += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
      i++;
    }
  }
  return new RegExp(`^${regex}$`);
}

function matchesAnyPattern(file, patterns) {
  return patterns.some((p) => globToRegex(p).test(file));
}

// ── File list acquisition ─────────────────────────────────────────────────────

function getChangedFiles() {
  const filesArg = flag('--files');
  const gitDiffArg = flag('--git-diff');

  if (filesArg) {
    return fs.readFileSync(filesArg, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
  }
  if (gitDiffArg) {
    const out = execSync(`git diff --name-only ${gitDiffArg}`, { cwd: process.cwd() }).toString();
    return out.split('\n').map((l) => l.trim()).filter(Boolean);
  }
  // stdin
  if (!process.stdin.isTTY) {
    const data = fs.readFileSync('/dev/stdin', 'utf8');
    return data.split('\n').map((l) => l.trim()).filter(Boolean);
  }
  throw new Error('Provide --files <path>, --git-diff <ref>, or pipe file list to stdin');
}

// ── Routing ───────────────────────────────────────────────────────────────────

function routeFiles(files) {
  const agentFiles = new Map();   // name → Set<file>
  const agentReasons = new Map(); // name → Set<reason>

  for (const file of files) {
    const normalized = file.replace(/\\/g, '/');
    let matched = false;

    for (const rule of ROUTING.rules) {
      if (matchesAnyPattern(normalized, rule.patterns)) {
        for (const agent of rule.agents) {
          if (!agentFiles.has(agent)) agentFiles.set(agent, new Set());
          if (!agentReasons.has(agent)) agentReasons.set(agent, new Set());
          agentFiles.get(agent).add(normalized);
          agentReasons.get(agent).add(rule.reason);
        }
        matched = true;
        break; // first rule wins per file
      }
    }

    if (!matched) {
      for (const agent of ROUTING.default) {
        if (!agentFiles.has(agent)) agentFiles.set(agent, new Set());
        if (!agentReasons.has(agent)) agentReasons.set(agent, new Set());
        agentFiles.get(agent).add(normalized);
        agentReasons.get(agent).add('default fallback');
      }
    }
  }

  return agentFiles;
}

// ── Manifest generation ───────────────────────────────────────────────────────

function safeManifestId(agentName) {
  return `dispatch-${agentName}-${Date.now()}`.slice(0, 63);
}

function createManifests(agentFiles) {
  const manifests = [];
  for (const [agent, files] of agentFiles) {
    try {
      const manifest = createSubagentManifest({
        id: safeManifestId(agent),
        role: agentRoleFor(agent),
        task: `Review and implement changes in assigned files for agent role: ${agent}`,
        allowedPaths: [...files].map((f) => f.includes('/') ? f : `${f}`),
        tools: toolsForRole(agentRoleFor(agent)),
      });
      writeSubagentManifest(manifest, { baseDir: process.cwd() });
      manifests.push({ agent, manifestId: manifest.id });
    } catch (err) {
      manifests.push({ agent, error: err.message });
    }
  }
  return manifests;
}

function agentRoleFor(agentName) {
  const roleMap = {
    'swe': 'implementer',
    'qa-agent': 'test-engineer',
    'migration': 'implementer',
    'data': 'implementer',
    'cloud': 'implementer',
    'design-agent': 'implementer',
    'spec-agent': 'docs-agent',
    'orchestrate': 'coordinator',
    'pm': 'docs-agent',
    'interviewer': 'reviewer',
    'release-agent': 'implementer',
    'security': 'reviewer',
  };
  return roleMap[agentName] || 'implementer';
}

function toolsForRole(role) {
  const readOnly = ['shellRead', 'gitRead'];
  const readWrite = ['shellRead', 'shellWrite', 'gitRead', 'gitWrite', 'testExecution'];
  const map = {
    'implementer': readWrite,
    'test-engineer': readWrite,
    'docs-agent': ['shellRead', 'shellWrite', 'gitRead'],
    'coordinator': ['shellRead', 'gitRead'],
    'reviewer': ['shellRead', 'gitRead'],
    'explorer': readOnly,
  };
  return map[role] || readOnly;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const files = getChangedFiles();
const agentFiles = routeFiles(files);

const plan = {
  totalFiles: files.length,
  generatedAt: new Date().toISOString(),
  agents: [...agentFiles.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, fileSet]) => ({
      name,
      invoke: `/${name}`,
      files: [...fileSet].sort(),
      reasons: [...(agentFiles.get(name) ? [] : [])],
    })),
};

// Re-attach reasons from routing pass
{
  const agentReasons = new Map();
  for (const file of files) {
    const normalized = file.replace(/\\/g, '/');
    for (const rule of ROUTING.rules) {
      if (matchesAnyPattern(normalized, rule.patterns)) {
        for (const agent of rule.agents) {
          if (!agentReasons.has(agent)) agentReasons.set(agent, new Set());
          agentReasons.get(agent).add(rule.reason);
        }
        break;
      }
    }
  }
  for (const agent of plan.agents) {
    agent.reasons = [...(agentReasons.get(agent.name) || new Set(['default fallback']))];
  }
}

if (hasFlag('--manifests')) {
  plan.manifests = createManifests(agentFiles);
}

const output = JSON.stringify(plan, null, 2);
const outputPath = flag('--output');
if (outputPath) {
  fs.writeFileSync(outputPath, output, 'utf8');
} else {
  process.stdout.write(`${output}\n`);
}
