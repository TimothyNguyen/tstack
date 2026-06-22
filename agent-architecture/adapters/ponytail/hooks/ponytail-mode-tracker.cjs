#!/usr/bin/env node
const { getDefaultMode, isDeactivationCommand } = require('./ponytail-config.cjs');
const { clearMode, setMode, writeHookOutput } = require('./ponytail-runtime.cjs');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input.replace(/^\uFEFF/, ''));
    const prompt = String(data.prompt || '').trim().toLowerCase();

    if (/^[/@$]ponytail/.test(prompt)) {
      const parts = prompt.split(/\s+/);
      const cmd = parts[0].replace(/^[@$]/, '/');
      const arg = parts[1] || '';
      let mode = null;

      if (cmd === '/ponytail-review' || cmd === '/ponytail:ponytail-review') {
        mode = 'review';
      } else if (cmd === '/ponytail' || cmd === '/ponytail:ponytail') {
        if (['lite', 'full', 'ultra', 'off'].includes(arg)) mode = arg;
        else mode = getDefaultMode();
      }

      if (mode && mode !== 'off') {
        setMode(mode);
        writeHookOutput('UserPromptSubmit', mode, `PONYTAIL MODE CHANGED - level: ${mode}`);
      } else if (mode === 'off') {
        clearMode();
        writeHookOutput('UserPromptSubmit', 'off', 'PONYTAIL MODE OFF');
      }
    }

    if (isDeactivationCommand(prompt)) {
      clearMode();
      writeHookOutput('UserPromptSubmit', 'off', 'PONYTAIL MODE OFF');
    }
  } catch {}
});
