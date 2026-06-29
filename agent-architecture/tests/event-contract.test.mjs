import assert from 'node:assert/strict';
import test from 'node:test';
import { EVENT_TYPES, createEvent } from '../core/events.mjs';

test('event helper supports documented AG-UI-compatible event types', () => {
  for (const type of [
    'run.started',
    'approval.requested',
    'tool.completed',
    'subagent.started',
    'subagent.action',
    'subagent.completed',
    'subagent.blocked',
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

test('createEvent uses all defaults when options are omitted', () => {
  const event = createEvent('run.started', {});
  assert.equal(event.source.host, 'local');
  assert.equal(event.source.skill, 'agent-architecture');
  assert.equal(event.source.profile, 'privacy-default');
  assert.ok(typeof event.id === 'string' && event.id.length > 0);
  assert.ok(typeof event.correlationId === 'string' && event.correlationId.length > 0);
  assert.ok(typeof event.timestamp === 'string' && event.timestamp.length > 0);
});

test('createEvent uses provided id and timestamp', () => {
  const event = createEvent('run.completed', {}, {
    id: 'fixed-id-123',
    timestamp: '2024-06-01T00:00:00.000Z',
  });
  assert.equal(event.id, 'fixed-id-123');
  assert.equal(event.timestamp, '2024-06-01T00:00:00.000Z');
});
