#!/usr/bin/env node
const { getDefaultMode } = require('./seniorswe-concise-config.cjs');
const { getSeniorsweConciseInstructions } = require('./seniorswe-concise-instructions.cjs');
const { clearMode, setMode, writeHookOutput } = require('./seniorswe-concise-runtime.cjs');

const mode = getDefaultMode();

if (mode === 'off') {
  clearMode();
  writeHookOutput('SessionStart', 'off', 'OK');
  process.exit(0);
}

try {
  setMode(mode);
} catch {}

try {
  writeHookOutput('SessionStart', mode, getSeniorsweConciseInstructions(mode));
} catch {}
