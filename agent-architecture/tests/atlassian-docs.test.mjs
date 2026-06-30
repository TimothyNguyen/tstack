import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const skillsRoot = path.join(root, 'packages', 'skills');
const validator = path.join(skillsRoot, 'atlassian-docs', 'scripts', 'validate_mcp_atlassian_profile.py');
const safeProfile = path.join(skillsRoot, 'atlassian-docs', 'references', 'safe-profile.env.example');

function runValidator(envFile) {
  return spawnSync('python', [validator, '--env-file', envFile, '--print-summary'], {
    cwd: root,
    encoding: 'utf8',
  });
}

test('atlassian-docs safe profile validates', () => {
  const result = runValidator(safeProfile);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /READ_ONLY_MODE=true/);
  assert.match(result.stdout, /mcp-atlassian profile is safe/);
});

test('atlassian-docs validator rejects unsafe mcp-atlassian profile', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'atlassian-docs-'));
  const profile = path.join(dir, 'unsafe.env');
  fs.writeFileSync(profile, [
    'READ_ONLY_MODE=false',
    'ATLASSIAN_OAUTH_PROXY_ENABLE=true',
    'JIRA_SSL_VERIFY=false',
    'CONFLUENCE_SSL_VERIFY=true',
    'MCP_ALLOWED_URL_DOMAINS=atlassian.net',
    'TOOLSETS=all',
    'ENABLED_TOOLS=confluence_search,jira_create_issue,jira_upload_attachment',
    'JIRA_API_TOKEN=should-not-print',
  ].join('\n'));

  const result = runValidator(profile);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /READ_ONLY_MODE must be true/);
  assert.match(result.stderr, /TOOLSETS=all is not allowed/);
  assert.match(result.stderr, /side-effecting or file tools/);
  assert.match(result.stderr, /jira_upload_attachment/);
  assert.doesNotMatch(result.stdout + result.stderr, /should-not-print/);
});

test('atlassian-docs skill documents no codebase-engine vendoring and attachment denial', () => {
  const skill = fs.readFileSync(path.join(skillsRoot, 'atlassian-docs', 'SKILL.md.tmpl'), 'utf8');
  const safety = fs.readFileSync(path.join(skillsRoot, 'atlassian-docs', 'references', 'mcp-atlassian-safety.md'), 'utf8');

  assert.match(skill, /Do not vendor or import `mcp-atlassian` into `codebase-engine`/);
  assert.match(skill, /Do not upload, download, or read attachment file paths/);
  assert.match(safety, /Attachment upload tools can read arbitrary local file paths/);
  assert.match(safety, /Prefer stdio transport inside a trusted agent boundary/);
});
