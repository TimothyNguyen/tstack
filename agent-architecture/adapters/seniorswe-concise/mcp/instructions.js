import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { getSeniorsweConciseInstructions } = require('../hooks/seniorswe-concise-instructions.cjs');
const { getDefaultMode, normalizeMode } = require('../hooks/seniorswe-concise-config.cjs');

export const MODES = ['lite', 'full', 'ultra'];

export function resolveMode(requested) {
  const asked = normalizeMode(requested);
  if (asked && asked !== 'off') return asked;

  const fallback = normalizeMode(getDefaultMode());
  return fallback && fallback !== 'off' ? fallback : 'full';
}

export function buildInstructions(requested) {
  return getSeniorsweConciseInstructions(resolveMode(requested));
}
