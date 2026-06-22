import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { readAllocation } from './subagent-worktrees.mjs';
import { writeJsonFile, writeSubagentResult } from './subagents.mjs';

function git(repo, args, options = {}) {
  return execFileSync('git', args, {
    cwd: repo,
    encoding: options.encoding || 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function subagentBase(baseDir, id) {
  return path.resolve(baseDir, '.architecture-agent', 'subagents', id);
}

function readManifest(baseDir, id) {
  const file = path.join(subagentBase(baseDir, id), 'manifest.json');
  if (!fs.existsSync(file)) throw new Error(`Missing subagent manifest: ${id}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function normalizeChangedFile(line) {
  const file = line.replace(/^(?:..|.)\s+/, '').trim();
  return file.includes(' -> ') ? file.split(' -> ').pop() : file;
}

function changedFilesFromStatus(worktreePath) {
  const output = git(worktreePath, ['status', '--short', '--untracked-files=all']).trim();
  if (!output) return [];
  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .map(normalizeChangedFile)
    .sort();
}

function addIntentToAddForUntracked(worktreePath) {
  const output = git(worktreePath, ['status', '--short', '--untracked-files=all']).trim();
  const untracked = output
    .split(/\r?\n/)
    .filter((line) => line.startsWith('?? '))
    .map(normalizeChangedFile);
  if (untracked.length > 0) {
    git(worktreePath, ['add', '--intent-to-add', '--', ...untracked]);
  }
}

function globToRegExp(glob) {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '.*');
  return new RegExp(`^${escaped}$`);
}

function assertAllowedFiles(files, allowedPaths) {
  const patterns = allowedPaths.map(globToRegExp);
  for (const file of files) {
    const normalized = file.replace(/\\/g, '/');
    if (!patterns.some((pattern) => pattern.test(normalized))) {
      throw new Error(`Subagent change outside allowed paths: ${file}`);
    }
  }
}

function exportSubagentPatch(id, options = {}) {
  const baseDir = path.resolve(options.baseDir || path.resolve(import.meta.dirname, '..'));
  const allocation = readAllocation(id, { baseDir });
  addIntentToAddForUntracked(allocation.worktreePath);
  const changedFiles = changedFilesFromStatus(allocation.worktreePath);
  const patch = git(allocation.worktreePath, ['diff', '--binary']);
  const patchPath = path.join(subagentBase(baseDir, id), 'patch.diff');
  fs.writeFileSync(patchPath, patch, 'utf8');
  const record = {
    id,
    status: 'exported',
    changedFiles,
    patchPath,
  };
  writeJsonFile(path.join(subagentBase(baseDir, id), 'patch.json'), record);
  return record;
}

function applySubagentPatch(id, options = {}) {
  const baseDir = path.resolve(options.baseDir || path.resolve(import.meta.dirname, '..'));
  const manifest = readManifest(baseDir, id);
  const exported = exportSubagentPatch(id, { baseDir });
  assertAllowedFiles(exported.changedFiles, manifest.allowedPaths);
  if (exported.changedFiles.length === 0) {
    throw new Error(`Subagent ${id} has no changes to apply`);
  }
  git(baseDir, ['apply', '--check', exported.patchPath]);
  git(baseDir, ['apply', exported.patchPath]);
  const result = {
    id,
    status: 'applied',
    changedFiles: exported.changedFiles,
    patchPath: exported.patchPath,
  };
  writeSubagentResult(id, result, { baseDir });
  return result;
}

function rejectSubagentPatch(id, reason, options = {}) {
  const baseDir = path.resolve(options.baseDir || path.resolve(import.meta.dirname, '..'));
  const exported = exportSubagentPatch(id, { baseDir });
  const record = {
    id,
    status: 'rejected',
    reason,
    changedFiles: exported.changedFiles,
    patchPath: exported.patchPath,
  };
  writeJsonFile(path.join(subagentBase(baseDir, id), 'rejection.json'), record);
  return record;
}

export {
  applySubagentPatch,
  assertAllowedFiles,
  changedFilesFromStatus,
  exportSubagentPatch,
  rejectSubagentPatch,
};
