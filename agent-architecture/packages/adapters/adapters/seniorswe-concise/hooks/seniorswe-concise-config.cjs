#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_MODE = 'full';
const VALID_MODES = ['off', 'lite', 'full', 'ultra', 'review'];
const RUNTIME_MODES = ['off', 'lite', 'full', 'ultra'];
const ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..');

function normalizeMode(mode) {
  if (typeof mode !== 'string') return null;
  const normalized = mode.trim().toLowerCase();
  return RUNTIME_MODES.includes(normalized) ? normalized : null;
}

function normalizeConfigMode(mode) {
  if (typeof mode !== 'string') return null;
  const normalized = mode.trim().toLowerCase();
  return VALID_MODES.includes(normalized) ? normalized : null;
}

function normalizePersistedMode(mode) {
  return normalizeMode(mode) || normalizeConfigMode(mode);
}

function isDeactivationCommand(text) {
  const t = String(text || '').trim().toLowerCase().replace(/[.!?\s]+$/, '');
  return t === 'stop seniorswe-concise' || t === 'normal mode';
}

function contained(root, target) {
  const rel = path.relative(root, target);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function resolveDeclaredDir(envName, fallback) {
  const requested = process.env[envName];
  const dir = requested ? path.resolve(requested) : path.join(ROOT, fallback);
  if (!contained(ROOT, dir) && !process.env.SENIORSWE_CONCISE_ALLOW_EXTERNAL_STATE) {
    return path.join(ROOT, fallback);
  }
  return dir;
}

function getConfigDir() {
  return resolveDeclaredDir('SENIORSWE_CONCISE_CONFIG_DIR', path.join('.architecture-agent', 'seniorswe-concise'));
}

function getConfigPath() {
  return path.join(getConfigDir(), 'config.json');
}

function getStateDir() {
  if (process.env.COPILOT_PLUGIN_DATA) return process.env.COPILOT_PLUGIN_DATA;
  if (process.env.PLUGIN_DATA) return process.env.PLUGIN_DATA;
  return resolveDeclaredDir('SENIORSWE_CONCISE_STATE_DIR', path.join('.architecture-agent', 'state', 'seniorswe-concise'));
}

function getDefaultMode() {
  const envMode = normalizeConfigMode(process.env.SENIORSWE_CONCISE_DEFAULT_MODE);
  if (envMode) return envMode;

  try {
    const config = JSON.parse(fs.readFileSync(getConfigPath(), 'utf8'));
    return normalizeConfigMode(config.defaultMode) || DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

function writeDefaultMode(mode) {
  const normalized = normalizeConfigMode(mode);
  if (!normalized) return null;
  const configPath = getConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify({ defaultMode: normalized }, null, 2), 'utf8');
  return normalized;
}

module.exports = {
  DEFAULT_MODE,
  VALID_MODES,
  RUNTIME_MODES,
  getConfigDir,
  getConfigPath,
  getDefaultMode,
  getStateDir,
  isDeactivationCommand,
  normalizeConfigMode,
  normalizeMode,
  normalizePersistedMode,
  writeDefaultMode,
};
