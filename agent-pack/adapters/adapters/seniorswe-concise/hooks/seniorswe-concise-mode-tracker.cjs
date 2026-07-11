#!/usr/bin/env node
const { getDefaultMode, isDeactivationCommand } = require('./seniorswe-concise-config.cjs');
const { clearMode, setMode, writeHookOutput } = require('./seniorswe-concise-runtime.cjs');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input.replace(/^\uFEFF/, ''));
    const prompt = String(data.prompt || '').trim().toLowerCase();

    if (/^[/@$]seniorswe-concise/.test(prompt)) {
      const parts = prompt.split(/\s+/);
      const cmd = parts[0].replace(/^[@$]/, '/');
      const arg = parts[1] || '';
      let mode = null;

      if (cmd === '/seniorswe-concise-review' || cmd === '/seniorswe-concise:seniorswe-concise-review') {
        mode = 'review';
      } else if (cmd === '/seniorswe-concise' || cmd === '/seniorswe-concise:seniorswe-concise') {
        if (['lite', 'full', 'ultra', 'off'].includes(arg)) mode = arg;
        else mode = getDefaultMode();
      }

      if (mode && mode !== 'off') {
        setMode(mode);
        writeHookOutput('UserPromptSubmit', mode, `SENIORSWE-CONCISE MODE CHANGED - level: ${mode}`);
      } else if (mode === 'off') {
        clearMode();
        writeHookOutput('UserPromptSubmit', 'off', 'SENIORSWE-CONCISE MODE OFF');
      }
    }

    if (isDeactivationCommand(prompt)) {
      clearMode();
      writeHookOutput('UserPromptSubmit', 'off', 'SENIORSWE-CONCISE MODE OFF');
    }
  } catch {}
});
