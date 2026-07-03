#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
    '- Commit after each discrete behavior change — do not accumulate unrelated edits across multiple files before committing.',
    '- Each commit message must follow Conventional Commits: `<type>[scope]: <description>` (types: feat, fix, docs, refactor, test, chore, perf, ci).',
    '- Never use `--no-verify`, `--force` (use `--force-with-lease`), or `--no-gpg-sign` unless explicitly instructed.',
    '- Sequence for rebasing: stage → commit → fetch → rebase → push.',
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

function pluginMirrorFor(outputRel, pluginSkillsDir) {
  // outputRel is "<skill>/SKILL.md" — mirror only top-level SKILL.md (skip
  // sections/* and the repo-root SKILL.md which has no skill folder).
  const parts = outputRel.split('/');
  if (parts.length === 2 && parts[1] === 'SKILL.md') {
    return path.join(pluginSkillsDir, parts[0], 'SKILL.md');
  }
  // Also mirror adapters: packages/adapters/<name>/SKILL.md
  if (parts.length === 4 && parts[0] === 'packages' && parts[1] === 'adapters' && parts[3] === 'SKILL.md') {
    return path.join(pluginSkillsDir, parts[2], 'SKILL.md');
  }
  return null;
}

function writeRendered(tmplRel, outputRel, { check = CHECK, root = ROOT } = {}) {
  const pluginSkillsDir = path.join(root, 'plugins', 'agent-architecture', 'skills');
  const tmplPath = path.join(root, tmplRel);
  const outputPath = path.join(root, outputRel);
  const rendered = render(fs.readFileSync(tmplPath, 'utf8').replace(/\r\n/g, '\n'), tmplRel);
  const mirrorPath = pluginMirrorFor(outputRel, pluginSkillsDir);

  if (check) {
    const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8').replace(/\r\n/g, '\n') : '';
    if (current !== rendered) {
      console.error(`${outputRel} is stale; run npm run build:skills from agent-architecture/`);
      process.exitCode = 1;
    }
    if (mirrorPath) {
      const mirrorCurrent = fs.existsSync(mirrorPath) ? fs.readFileSync(mirrorPath, 'utf8') : '';
      if (mirrorCurrent !== rendered) {
        const rel = path.relative(root, mirrorPath).split(path.sep).join('/');
        console.error(`${rel} is stale; run npm run build:skills from agent-architecture/`);
        process.exitCode = 1;
      }
    }
    return;
  }

  fs.writeFileSync(outputPath, rendered);
  if (mirrorPath) {
    fs.mkdirSync(path.dirname(mirrorPath), { recursive: true });
    fs.writeFileSync(mirrorPath, rendered);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  for (const item of discoverTemplates(ROOT)) {
    writeRendered(item.tmpl, item.output);
  }

  for (const item of discoverSectionTemplates(ROOT)) {
    writeRendered(item.tmpl, item.output);
  }
}

export { render, writeRendered };
