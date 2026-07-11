#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEvent } from '../core/events.mjs';
import { allocateSubagentWorktree } from '../core/subagent-worktrees.mjs';
import { writeJsonFile, writeSubagentManifest } from '../core/subagents.mjs';

function parseArgs(argv) {
  const args = { baseDir: process.cwd() };
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--') {
      continue;
    } else if (arg === '--from-file') {
      args.fromFile = argv[i + 1];
      i += 1;
    } else if (arg === '--base-dir') {
      args.baseDir = argv[i + 1];
      i += 1;
    } else if (arg === '--allocate-worktrees') {
      args.allocateWorktrees = true;
    } else if (arg === 'allocate-worktrees' || arg === 'true') {
      args.allocateWorktrees = true;
    } else if (!arg.startsWith('--')) {
      positional.push(arg);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!args.fromFile && positional[0]) args.fromFile = positional[0];
  if (args.baseDir === process.cwd() && positional[1]) args.baseDir = positional[1];
  if (!args.fromFile) throw new Error('Missing --from-file');
  return args;
}

function readPlan(file) {
  const plan = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (Array.isArray(plan)) return { agents: plan };
  if (!Array.isArray(plan.agents)) throw new Error('Subagent plan requires agents array');
  return plan;
}

function deploySubagents(plan, options = {}) {
  const baseDir = path.resolve(options.baseDir || process.cwd());
  const manifests = plan.agents.map((agent) => writeSubagentManifest(agent, { baseDir }));
  const allocations = options.allocateWorktrees
    ? plan.agents
      .filter((agent) => agent.role !== 'explorer' && agent.role !== 'reviewer' && agent.role !== 'qa-agent')
      .map((agent) => allocateSubagentWorktree(agent, { baseDir }))
    : [];
  const event = createEvent('subagent.started', {
    count: manifests.length,
    agentIds: plan.agents.map((agent) => agent.id),
    allocatedWorktrees: allocations.length,
  }, {
    host: 'local',
    skill: 'subagent-orchestrator',
    profile: 'subagents-local',
  });
  const summary = {
    count: manifests.length,
    manifests: manifests.map((item) => ({
      id: item.record.id,
      role: item.record.role,
      path: item.path,
    })),
    allocations,
    event,
  };
  const summaryPath = path.join(baseDir, '.agent-pack', 'subagents', 'deployment.json');
  writeJsonFile(summaryPath, summary);
  return { ...summary, summaryPath };
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const plan = readPlan(args.fromFile);
    process.stdout.write(`${JSON.stringify(deploySubagents(plan, {
      baseDir: args.baseDir,
      allocateWorktrees: args.allocateWorktrees,
    }))}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}

export { deploySubagents, main, parseArgs, readPlan };
