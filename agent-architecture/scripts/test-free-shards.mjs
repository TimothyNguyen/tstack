#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const TEST_ROOTS = ['tests', 'test', 'e2e'];
const TEST_FILE_REGEX = /\.(?:test|spec)\.(?:[cm]?[jt]s|tsx|jsx|py|cs)$/;

const DEFAULT_EXCLUDES = [
  /\/node_modules\//,
  /\/dist\//,
  /\/build\//,
  /\/generated\//,
  /\/fixtures\//,
  /e2e.*paid/i,
  /llm.*eval/i,
  /external.*service/i,
];

const WINDOWS_FRAGILE_PATTERNS = [
  { pattern: /['"`]\/bin\/(?:ba)?sh/, reason: 'hardcoded POSIX shell' },
  { pattern: /spawnSync\(['"]sh['"]|spawn\(['"]sh['"]|exec\(['"]sh /, reason: 'spawns sh directly' },
  { pattern: /['"`]\/tmp\//, reason: 'raw /tmp path' },
  { pattern: /\bchmod\b/, reason: 'chmod command' },
  { pattern: /\bxargs\b/, reason: 'xargs pipeline' },
  { pattern: /await\s+\w+\.launch\(/, reason: 'launches browser; run in browser shard' },
];

function normalize(filePath) {
  return filePath.replace(/\\/g, '/');
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    if (entry.isFile() && TEST_FILE_REGEX.test(entry.name)) files.push(full);
  }
  return files;
}

function collectTests(root = ROOT) {
  const files = new Set();
  for (const testRoot of TEST_ROOTS) {
    for (const full of walk(path.join(root, testRoot))) {
      const rel = normalize(path.relative(root, full));
      if (!DEFAULT_EXCLUDES.some((pattern) => pattern.test(`/${rel}`))) files.add(rel);
    }
  }
  return [...files].sort();
}

function detectWindowsFragility(root, rel) {
  const content = fs.readFileSync(path.join(root, rel), 'utf8');
  for (const { pattern, reason } of WINDOWS_FRAGILE_PATTERNS) {
    if (pattern.test(content)) return reason;
  }
  return null;
}

function stableHash(input) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function shard(files, count) {
  const buckets = Array.from({ length: count }, () => []);
  for (const file of files) buckets[stableHash(file) % count].push(file);
  return buckets.map((bucket) => bucket.sort()).filter((bucket) => bucket.length > 0);
}

function parseArgs(argv) {
  const options = { list: false, windowsOnly: false, shards: 8, shard: null, command: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--list') options.list = true;
    else if (arg === '--windows-only') options.windowsOnly = true;
    else if (arg === '--shards') options.shards = Number.parseInt(argv[++index], 10);
    else if (arg === '--shard') options.shard = Number.parseInt(argv[++index], 10);
    else if (arg === '--command') options.command = argv[++index];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  let files = collectTests();
  const excluded = [];

  if (options.windowsOnly) {
    files = files.filter((file) => {
      const reason = detectWindowsFragility(ROOT, file);
      if (reason) excluded.push({ file, reason });
      return !reason;
    });
  }

  if (options.list) {
    console.log(JSON.stringify({ files, excluded }, null, 2));
    return 0;
  }

  const buckets = shard(files, options.shards);
  const selected = options.shard ? buckets[options.shard - 1] : files;
  if (!selected || selected.length === 0) {
    console.log('No tests selected.');
    return 0;
  }

  if (!options.command) {
    console.log(JSON.stringify({ selected }, null, 2));
    return 0;
  }

  const [cmd, ...prefixArgs] = options.command.split(' ');
  const result = spawnSync(cmd, [...prefixArgs, ...selected], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return result.status ?? 1;
}

process.exitCode = main();
