import fs from 'node:fs';
import path from 'node:path';
import { redact } from './audit.mjs';

const FORBIDDEN_FIELDS = new Set([
  'token',
  'cookie',
  'apiKey',
  'password',
  'secret',
  'credential',
  'fullPrompt',
  'fileContents',
]);

const ROLE_DEFAULTS = {
  coordinator: {
    writes: 'approval-required',
    output: 'summary-and-changed-files',
    writeTools: true,
    requiresAllowedPaths: false,
  },
  explorer: {
    writes: 'disabled',
    output: 'summary',
    writeTools: false,
    requiresAllowedPaths: false,
  },
  planner: {
    writes: 'approval-required',
    output: 'summary-and-changed-files',
    writeTools: true,
    requiresAllowedPaths: true,
  },
  implementer: {
    writes: 'approval-required',
    output: 'summary-and-changed-files',
    writeTools: true,
    requiresAllowedPaths: true,
  },
  'test-engineer': {
    writes: 'approval-required',
    output: 'summary-and-changed-files',
    writeTools: true,
    requiresAllowedPaths: true,
  },
  reviewer: {
    writes: 'disabled',
    output: 'summary',
    writeTools: false,
    requiresAllowedPaths: false,
  },
  'qa-agent': {
    writes: 'disabled',
    output: 'summary-and-evidence',
    writeTools: false,
    requiresAllowedPaths: false,
  },
  'devtools-agent': {
    writes: 'disabled',
    output: 'summary-and-evidence',
    writeTools: false,
    requiresAllowedPaths: false,
  },
  'docs-agent': {
    writes: 'approval-required',
    output: 'summary-and-changed-files',
    writeTools: true,
    requiresAllowedPaths: true,
  },
  'release-agent': {
    writes: 'approval-required',
    output: 'release-handoff',
    writeTools: true,
    requiresAllowedPaths: false,
  },
};

const ALLOWED_TOOLS = new Set([
  'shellRead',
  'shellWrite',
  'gitRead',
  'gitWrite',
  'testExecution',
  'browserRead',
  'browserWrite',
  'devtoolsInspect',
  'playwrightCli',
  'humanEscalation',
]);

const WRITE_TOOLS = new Set(['shellWrite', 'gitWrite', 'browserWrite']);

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function assertNoForbiddenFields(value, pathParts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenFields(item, [...pathParts, String(index)]));
    return;
  }
  if (!isPlainObject(value)) return;

  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_FIELDS.has(key)) {
      throw new Error(`Subagent manifest contains forbidden field ${key}`);
    }
    assertNoForbiddenFields(child, [...pathParts, key]);
  }
}

function validateId(id) {
  if (typeof id !== 'string' || !/^[a-z0-9][a-z0-9-]{1,62}$/.test(id)) {
    throw new Error(`Invalid subagent id: ${id}`);
  }
}

function normalizeStringArray(value, field) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.length === 0)) {
    throw new Error(`${field} must be an array of non-empty strings`);
  }
  return [...value];
}

function validateSubagentManifest(input) {
  if (!isPlainObject(input)) throw new Error('Subagent manifest must be an object');
  assertNoForbiddenFields(input);

  validateId(input.id);
  if (!ROLE_DEFAULTS[input.role]) throw new Error(`Unknown subagent role: ${input.role}`);
  if (typeof input.task !== 'string' || input.task.trim().length === 0) {
    throw new Error('Subagent manifest requires a task');
  }

  const role = ROLE_DEFAULTS[input.role];
  const allowedPaths = normalizeStringArray(input.allowedPaths, 'allowedPaths');
  const disallowedPaths = normalizeStringArray(input.disallowedPaths, 'disallowedPaths');
  const tools = normalizeStringArray(input.tools, 'tools');

  for (const tool of tools) {
    if (!ALLOWED_TOOLS.has(tool)) throw new Error(`Unknown subagent tool: ${tool}`);
    if (!role.writeTools && WRITE_TOOLS.has(tool)) {
      throw new Error(`${input.role} cannot use write tool ${tool}`);
    }
  }

  if (role.requiresAllowedPaths && allowedPaths.length === 0) {
    throw new Error(`${input.role} requires at least one allowed path`);
  }
  if (input.egress && input.egress !== 'disabled') {
    throw new Error('Subagent egress must be disabled by default');
  }

  return {
    id: input.id,
    role: input.role,
    task: input.task.trim(),
    allowedPaths,
    disallowedPaths,
    tools,
    egress: 'disabled',
    writes: input.writes || role.writes,
    output: input.output || role.output,
  };
}

function createSubagentManifest(input) {
  return validateSubagentManifest(input);
}

function subagentDir(baseDir, id) {
  validateId(id);
  return path.resolve(baseDir, '.architecture-agent', 'subagents', id);
}

function assertInside(parent, child) {
  const rel = path.relative(parent, child);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Subagent artifact path escapes declared directory: ${child}`);
  }
}

function writeJsonFile(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  return { path: file, record: value };
}

function writeSubagentManifest(manifest, options = {}) {
  const normalized = validateSubagentManifest(manifest);
  const baseDir = path.resolve(options.baseDir || path.resolve(import.meta.dirname, '..'));
  const dir = subagentDir(baseDir, normalized.id);
  const file = path.join(dir, 'manifest.json');
  assertInside(dir, file);
  return writeJsonFile(file, normalized);
}

function writeSubagentResult(id, result, options = {}) {
  validateId(id);
  if (!isPlainObject(result)) throw new Error('Subagent result must be an object');
  const baseDir = path.resolve(options.baseDir || path.resolve(import.meta.dirname, '..'));
  const dir = subagentDir(baseDir, id);
  const file = path.join(dir, 'result.json');
  assertInside(dir, file);
  return writeJsonFile(file, redact(result));
}

export {
  ROLE_DEFAULTS,
  validateSubagentManifest,
  createSubagentManifest,
  writeJsonFile,
  writeSubagentManifest,
  writeSubagentResult,
};
