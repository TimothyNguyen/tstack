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

test('audit path stays under .agent-pack', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-audit-'));
  const safePath = resolveAuditPath(baseDir);
  assert.equal(path.relative(path.join(baseDir, '.agent-pack'), safePath).startsWith('..'), false);

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

  assert.ok(result.path.endsWith(path.join('.agent-pack', 'audit', 'events.jsonl')));
  const lines = fs.readFileSync(result.path, 'utf8').trim().split(/\r?\n/);
  assert.equal(lines.length, 1);
  const record = JSON.parse(lines[0]);
  assert.equal(record.type, 'approval.requested');
  assert.equal(record.password, '[REDACTED]');

  fs.rmSync(baseDir, { recursive: true, force: true });
});

test('redact returns null for null input', () => {
  assert.equal(redact(null), null);
  assert.equal(redact(0), 0);
  assert.equal(redact('plain-string'), 'plain-string');
});

test('redact handles array containing objects with forbidden fields', () => {
  const result = redact([{ token: 'abc' }, { safe: 'ok' }]);
  assert.equal(result[0].token, '[REDACTED]');
  assert.equal(result[1].safe, 'ok');
});

test('writeAuditEvent returns null when audit is disabled', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-audit-disabled-'));
  try {
    const disabledPolicy = { audit: { enabled: false, path: '.agent-pack/audit/events.jsonl', forbiddenFields: [] } };
    const result = writeAuditEvent({ type: 'test' }, { baseDir, policy: disabledPolicy });
    assert.equal(result, null);
  } finally {
    fs.rmSync(baseDir, { recursive: true, force: true });
  }
});

test('resolveAuditPath passes when auditPath equals the allowed root directory', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-audit-eq-'));
  try {
    const policy = { audit: { path: '.agent-pack' } };
    const auditPath = resolveAuditPath(baseDir, policy);
    assert.ok(auditPath.endsWith('.agent-pack'));
  } finally {
    fs.rmSync(baseDir, { recursive: true, force: true });
  }
});

test('writeAuditEvent uses root as baseDir when options.baseDir is absent (covers ternary false at line 35)', () => {
  const disabledPolicy = { audit: { enabled: false, path: '.agent-pack/audit/events.jsonl', forbiddenFields: [] } };
  const result = writeAuditEvent({ type: 'test' }, { policy: disabledPolicy });
  assert.equal(result, null, 'should return null while covering baseDir ternary false branch');
});
