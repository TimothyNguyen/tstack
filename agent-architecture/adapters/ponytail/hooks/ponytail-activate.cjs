#!/usr/bin/env node
const { getDefaultMode } = require('./ponytail-config.cjs');
const { getPonytailInstructions } = require('./ponytail-instructions.cjs');
const { clearMode, setMode, writeHookOutput } = require('./ponytail-runtime.cjs');

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
  writeHookOutput('SessionStart', mode, getPonytailInstructions(mode));
} catch {}
