#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { DEFAULT_MODE, normalizeMode, normalizePersistedMode } = require('./ponytail-config.cjs');

const INDEPENDENT_MODES = new Set(['review']);
const SKILL_PATH = path.resolve(__dirname, '..', '..', '..', 'ponytail', 'SKILL.md');

function filterSkillBodyForMode(body, mode) {
  const effectiveMode = normalizeMode(mode) || DEFAULT_MODE;
  const withoutFrontmatter = String(body || '').replace(/^---[\s\S]*?---\s*/, '');

  return withoutFrontmatter
    .split(/\r?\n/)
    .filter((line) => {
      const tableLabel = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|/);
      if (tableLabel) {
        const labelMode = normalizeMode(tableLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }

      const exampleLabel = line.match(/^-\s*([^:]+):\s*/);
      if (exampleLabel) {
        const labelMode = normalizeMode(exampleLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }

      return true;
    })
    .join('\n');
}

function getFallbackInstructions(mode) {
  return [
    `PONYTAIL MODE ACTIVE - level: ${mode}`,
    '',
    'You are a lazy senior developer. Lazy means efficient, not careless.',
    'Use YAGNI, standard library first, native platform features before dependencies, and the smallest correct diff.',
    'Never simplify away security, input validation at trust boundaries, data-loss prevention, accessibility basics, or explicit user requirements.',
  ].join('\n');
}

function getPonytailInstructions(mode) {
  const configuredMode = normalizePersistedMode(mode) || DEFAULT_MODE;
  if (INDEPENDENT_MODES.has(configuredMode)) {
    return `PONYTAIL MODE ACTIVE - level: ${configuredMode}. Behavior defined by /ponytail-${configuredMode} skill.`;
  }

  const effectiveMode = normalizeMode(configuredMode) || DEFAULT_MODE;
  try {
    return `PONYTAIL MODE ACTIVE - level: ${effectiveMode}\n\n` +
      filterSkillBodyForMode(fs.readFileSync(SKILL_PATH, 'utf8'), effectiveMode);
  } catch {
    return getFallbackInstructions(effectiveMode);
  }
}

module.exports = {
  filterSkillBodyForMode,
  getFallbackInstructions,
  getPonytailInstructions,
};
