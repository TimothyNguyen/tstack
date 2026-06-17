#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { discoverSectionTemplates, discoverTemplates } from './discover-skills.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const CHECK = process.argv.includes('--check');

const RESOLVERS = {
  PREAMBLE: () => [
    '## Enterprise Preamble',
    '',
    '- Stay inside the current project unless the user explicitly names another path.',
    '- Do not call public telemetry, public update checks, public tunnels, cookie import, or public scraping flows.',
    '- Use policy-gated tools only when the active profile allows them.',
    '- Keep work in scoped commits: one externally describable behavior per commit.',
  ].join('\n'),
  POLICY_REQUIREMENTS: () => [
    '## Policy Requirements',
    '',
    '- Read-only code inspection is allowed.',
    '- Shell write, git write, deployment, database read, ticket creation, and browser use require policy approval unless the active profile says otherwise.',
    '- Credential reads, cookie import, public tunnels, public telemetry, and public scraping are disabled by default.',
  ].join('\n'),
  BASE_OUTPUT_RULES: () => [
    '## Output Rules',
    '',
    '- Report findings with file paths, concrete evidence, and recommended actions.',
    '- Do not include secrets, raw credentials, cookie values, full prompts, or full data extracts.',
    '- Prefer structured summaries that can map to AG-UI events later.',
  ].join('\n'),
};

function render(content, tmplPath) {
  return content.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, name) => {
    const resolver = RESOLVERS[name];
    if (!resolver) {
      throw new Error(`Unknown placeholder ${match} in ${tmplPath}`);
    }
    return resolver();
  });
}

function writeRendered(tmplRel, outputRel) {
  const tmplPath = path.join(ROOT, tmplRel);
  const outputPath = path.join(ROOT, outputRel);
  const rendered = render(fs.readFileSync(tmplPath, 'utf8'), tmplRel);

  if (CHECK) {
    const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
    if (current !== rendered) {
      console.error(`${outputRel} is stale; run npm run build:skills from agent-architecture/`);
      process.exitCode = 1;
    }
    return;
  }

  fs.writeFileSync(outputPath, rendered);
}

for (const item of discoverTemplates(ROOT)) {
  writeRendered(item.tmpl, item.output);
}

for (const item of discoverSectionTemplates(ROOT)) {
  writeRendered(item.tmpl, item.output);
}
