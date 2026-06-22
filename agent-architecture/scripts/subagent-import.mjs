#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applySubagentPatch,
  exportSubagentPatch,
  rejectSubagentPatch,
} from '../core/subagent-import.mjs';

function parseArgs(argv) {
  const [command, id, ...rest] = argv;
  if (!['export', 'apply', 'reject'].includes(command)) {
    throw new Error('Usage: subagent-import <export|apply|reject> <agent-id> [--base-dir repo] [--reason text]');
  }
  if (!id) throw new Error('Missing agent id');
  const args = { command, id, baseDir: process.cwd(), reason: 'rejected by coordinator' };
  const positional = [];
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === '--') {
      continue;
    } else if (arg === '--base-dir') {
      args.baseDir = rest[i + 1];
      i += 1;
    } else if (arg === '--reason') {
      args.reason = rest[i + 1];
      i += 1;
    } else if (!arg.startsWith('--')) {
      positional.push(arg);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (args.baseDir === process.cwd() && positional[0]) args.baseDir = positional[0];
  if (args.reason === 'rejected by coordinator' && positional[1]) args.reason = positional.slice(1).join(' ');
  return args;
}

function run(args) {
  const options = { baseDir: path.resolve(args.baseDir) };
  if (args.command === 'export') return exportSubagentPatch(args.id, options);
  if (args.command === 'apply') return applySubagentPatch(args.id, options);
  return rejectSubagentPatch(args.id, args.reason, options);
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    process.stdout.write(`${JSON.stringify(run(args))}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}

export { parseArgs, run };
