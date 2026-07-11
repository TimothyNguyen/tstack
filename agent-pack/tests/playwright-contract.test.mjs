import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}

test('package exposes Playwright CLI e2e scripts', () => {
  const pkg = readJson('package.json');
  assert.equal(pkg.scripts['test:e2e'], 'playwright test');
  assert.equal(pkg.scripts['test:e2e:ui'], 'playwright test --ui');
  assert.equal(pkg.devDependencies['@playwright/test'], '^1.56.0');
});

test('Playwright config and smoke spec exist', () => {
  assert.equal(fs.existsSync(path.join(root, 'playwright.config.mjs')), true);
  assert.equal(fs.existsSync(path.join(root, 'e2e', 'subagent-devtools.spec.mjs')), true);
});
