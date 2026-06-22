import assert from 'node:assert/strict';
import test from 'node:test';
import { EVENT_TYPES, createEvent } from '../core/events.mjs';

test('event helper supports documented AG-UI-compatible event types', () => {
  for (const type of [
    'run.started',
    'approval.requested',
    'tool.completed',
    'finding.created',
    'audit.recorded',
  ]) {
    assert.equal(EVENT_TYPES.has(type), true);
  }
});

test('event helper creates redacted local event envelopes', () => {
  const event = createEvent('tool.requested', {
    tool: 'databaseRead',
    token: 'abc',
    nested: { fileContents: 'private' },
  }, {
    host: 'codex',
    skill: 'stack-postgres',
    profile: 'enterprise-modernization',
    correlationId: 'run-1',
  });

  assert.equal(event.type, 'tool.requested');
  assert.equal(event.source.host, 'codex');
  assert.equal(event.source.skill, 'stack-postgres');
  assert.equal(event.source.profile, 'enterprise-modernization');
  assert.equal(event.correlationId, 'run-1');
  assert.equal(event.payload.token, '[REDACTED]');
  assert.equal(event.payload.nested.fileContents, '[REDACTED]');
});

test('event helper rejects unknown event types', () => {
  assert.throws(() => createEvent('telemetry.sent'), /Unknown event type/);
});
