#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { getStateDir } = require('./seniorswe-concise-config.cjs');

const STATE_FILE = '.seniorswe-concise-active';
const isCopilot = Boolean(process.env.COPILOT_PLUGIN_DATA);
const isCodex = !isCopilot && Boolean(process.env.PLUGIN_DATA);
const statePath = path.join(getStateDir(), STATE_FILE);

function setMode(mode) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, mode, 'utf8');
}

function clearMode() {
  try {
    fs.unlinkSync(statePath);
  } catch {}
}

function writeHookOutput(event, mode, context = '') {
  if (isCopilot) {
    process.stdout.write(JSON.stringify(event === 'SessionStart' && context ? { additionalContext: context } : {}));
    return;
  }
  if (isCodex) {
    const output = { systemMessage: `SENIORSWE-CONCISE:${mode.toUpperCase()}` };
    if (context) {
      output.hookSpecificOutput = { hookEventName: event, additionalContext: context };
    }
    process.stdout.write(JSON.stringify(output));
    return;
  }
  process.stdout.write(context);
}

module.exports = {
  STATE_FILE,
  clearMode,
  isCodex,
  isCopilot,
  setMode,
  statePath,
  writeHookOutput,
};
