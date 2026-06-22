import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  createSubagentManifest,
  writeJsonFile,
  writeSubagentManifest,
  writeSubagentResult,
} from './subagents.mjs';

function git(repo, args) {
  return execFileSync('git', args, {
    cwd: repo,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function subagentBase(baseDir, id) {
  return path.resolve(baseDir, '.architecture-agent', 'subagents', id);
}

function assertInside(parent, child) {
  const rel = path.relative(parent, child);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Path escapes subagent directory: ${child}`);
  }
}

function readAllocation(id, options = {}) {
  const baseDir = path.resolve(options.baseDir || path.resolve(import.meta.dirname, '..'));
  const allocationPath = path.join(subagentBase(baseDir, id), 'allocation.json');
  if (!fs.existsSync(allocationPath)) {
    throw new Error(`Missing subagent allocation: ${id}`);
  }
  return JSON.parse(fs.readFileSync(allocationPath, 'utf8'));
}

function allocateSubagentWorktree(manifestInput, options = {}) {
  const manifest = createSubagentManifest(manifestInput);
  if (manifest.writes === 'disabled') {
    throw new Error(`${manifest.role} does not allow worktree writes`);
  }

  const baseDir = path.resolve(options.baseDir || path.resolve(import.meta.dirname, '..'));
  const root = subagentBase(baseDir, manifest.id);
  const worktreePath = path.join(root, 'worktree');
  assertInside(root, worktreePath);
  writeSubagentManifest(manifest, { baseDir });

  const branch = options.branch || `architecture-agent/${manifest.id}`;
  const baseRef = options.baseRef || 'HEAD';
  fs.mkdirSync(root, { recursive: true });

  if (!fs.existsSync(worktreePath)) {
    git(baseDir, ['worktree', 'add', '-B', branch, worktreePath, baseRef]);
  }

  const allocation = {
    id: manifest.id,
    role: manifest.role,
    branch,
    baseRef,
    worktreePath,
    status: 'allocated',
  };
  writeJsonFile(path.join(root, 'allocation.json'), allocation);
  return allocation;
}

function parseChangedFiles(statusOutput) {
  if (!statusOutput) return [];
  return statusOutput
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.replace(/^(?:..|.)\s+/, '').trim())
    .filter(Boolean)
    .map((file) => file.includes(' -> ') ? file.split(' -> ').pop() : file)
    .sort();
}

function collectSubagentWorktreeResult(id, options = {}) {
  const allocation = readAllocation(id, options);
  const statusOutput = git(allocation.worktreePath, ['status', '--short', '--untracked-files=all']);
  const result = {
    status: 'completed',
    id,
    branch: allocation.branch,
    worktreePath: allocation.worktreePath,
    changedFiles: parseChangedFiles(statusOutput),
  };
  writeSubagentResult(id, result, options);
  return result;
}

function cleanupSubagentWorktree(id, options = {}) {
  const baseDir = path.resolve(options.baseDir || path.resolve(import.meta.dirname, '..'));
  const allocation = readAllocation(id, { baseDir });
  if (fs.existsSync(allocation.worktreePath)) {
    git(baseDir, ['worktree', 'remove', '--force', allocation.worktreePath]);
  }
  const record = {
    ...allocation,
    status: 'cleaned',
  };
  writeJsonFile(path.join(subagentBase(baseDir, id), 'allocation.json'), record);
  return record;
}

export {
  allocateSubagentWorktree,
  cleanupSubagentWorktree,
  collectSubagentWorktreeResult,
  parseChangedFiles,
  readAllocation,
};
