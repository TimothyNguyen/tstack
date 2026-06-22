import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const policyPath = path.join(root, 'policies', 'enterprise-default.json');
const defaultPolicy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));

function isInside(parent, child) {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function redact(value, forbiddenFields = defaultPolicy.audit.forbiddenFields) {
  if (Array.isArray(value)) return value.map((item) => redact(item, forbiddenFields));
  if (!value || typeof value !== 'object') return value;

  const forbidden = new Set(forbiddenFields.map((field) => field.toLowerCase()));
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    out[key] = forbidden.has(key.toLowerCase()) ? '[REDACTED]' : redact(child, forbiddenFields);
  }
  return out;
}

function resolveAuditPath(baseDir = root, policy = defaultPolicy) {
  const auditPath = path.resolve(baseDir, policy.audit.path);
  const allowedRoot = path.resolve(baseDir, '.architecture-agent');
  if (!isInside(allowedRoot, auditPath)) {
    throw new Error(`Audit path escapes .architecture-agent: ${policy.audit.path}`);
  }
  return auditPath;
}

function writeAuditEvent(event, options = {}) {
  const baseDir = options.baseDir ? path.resolve(options.baseDir) : root;
  const policy = options.policy || defaultPolicy;
  if (!policy.audit?.enabled) return null;

  const auditPath = resolveAuditPath(baseDir, policy);
  const record = {
    timestamp: new Date().toISOString(),
    ...redact(event, policy.audit.forbiddenFields),
  };

  fs.mkdirSync(path.dirname(auditPath), { recursive: true });
  fs.appendFileSync(auditPath, `${JSON.stringify(record)}\n`, 'utf8');
  return { path: auditPath, record };
}

export { redact, resolveAuditPath, writeAuditEvent };
