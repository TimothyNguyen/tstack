import { randomUUID } from 'node:crypto';
import { redact } from './audit.mjs';

const EVENT_TYPES = new Set([
  'run.started',
  'run.completed',
  'run.failed',
  'progress',
  'approval.requested',
  'approval.resolved',
  'tool.requested',
  'tool.completed',
  'tool.failed',
  'subagent.started',
  'subagent.action',
  'subagent.completed',
  'subagent.blocked',
  'artifact.created',
  'finding.created',
  'audit.recorded',
  'human.escalated',
]);

function createEvent(type, payload = {}, options = {}) {
  if (!EVENT_TYPES.has(type)) throw new Error(`Unknown event type: ${type}`);

  return {
    id: options.id || randomUUID(),
    type,
    timestamp: options.timestamp || new Date().toISOString(),
    source: {
      host: options.host || 'local',
      skill: options.skill || 'agent-pack',
      profile: options.profile || 'privacy-default',
    },
    correlationId: options.correlationId || randomUUID(),
    payload: redact(payload),
  };
}

export { EVENT_TYPES, createEvent };
