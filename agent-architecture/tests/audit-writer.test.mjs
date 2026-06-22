import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { redact, resolveAuditPath, writeAuditEvent } from '../core/audit.mjs';

test('audit redaction replaces forbidden fields recursively', () => {
  const redacted = redact({
    action: 'databaseRead',
    token: 'abc',
    nested: {
      apiKey: 'def',
      safe: 'ok',
    },
  });

  assert.equal(redacted.token, '[REDACTED]');
  assert.equal(redacted.nested.apiKey, '[REDACTED]');
  assert.equal(redacted.nested.safe, 'ok');
});

test('audit path stays under .architecture-agent', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-audit-'));
  const safePath = resolveAuditPath(baseDir);
  assert.equal(path.relative(path.join(baseDir, '.architecture-agent'), safePath).startsWith('..'), false);

  assert.throws(() => resolveAuditPath(baseDir, {
    audit: { path: '../audit.jsonl' },
  }), /escapes/);

  fs.rmSync(baseDir, { recursive: true, force: true });
});

test('audit writer appends redacted local JSONL records', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-audit-'));
  const result = writeAuditEvent({
    type: 'approval.requested',
    action: 'deploy',
    password: 'secret-value',
  }, { baseDir });

  assert.ok(result.path.endsWith(path.join('.architecture-agent', 'audit', 'events.jsonl')));
  const lines = fs.readFileSync(result.path, 'utf8').trim().split(/\r?\n/);
  assert.equal(lines.length, 1);
  const record = JSON.parse(lines[0]);
  assert.equal(record.type, 'approval.requested');
  assert.equal(record.password, '[REDACTED]');

  fs.rmSync(baseDir, { recursive: true, force: true });
});
