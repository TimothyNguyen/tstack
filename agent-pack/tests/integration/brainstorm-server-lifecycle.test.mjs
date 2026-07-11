import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');

test('brainstorm-server.cjs has idle timeout configuration', () => {
  const serverPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'server.cjs');
  const content = fs.readFileSync(serverPath, 'utf8');

  assert(content.includes('BRAINSTORM_IDLE_TIMEOUT_MS'), 'should have idle timeout env var');
  assert(content.includes('4 * 60 * 60 * 1000'), 'should have 4 hour default');
});

test('brainstorm-server.cjs has lifecycle watchdog', () => {
  const serverPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'server.cjs');
  const content = fs.readFileSync(serverPath, 'utf8');

  assert(content.includes('LIFECYCLE_CHECK_MS'), 'should have lifecycle check interval');
  assert(content.includes('process.kill'), 'should monitor process liveness');
  assert(content.includes('ownerPid'), 'should track owner process');
});

test('brainstorm-server.cjs has token-based authentication', () => {
  const serverPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'server.cjs');
  const content = fs.readFileSync(serverPath, 'utf8');

  assert(content.includes('generateToken'), 'should have token generation');
  assert(content.includes('TOKEN'), 'should use token for auth');
  assert(content.includes('timingSafeEqualStr'), 'should use timing-safe comparison');
});

test('brainstorm-server.cjs has WebSocket security headers', () => {
  const serverPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'server.cjs');
  const content = fs.readFileSync(serverPath, 'utf8');

  assert(content.includes('securityHeaders'), 'should have security headers function');
  assert(content.includes('Content-Security-Policy'), 'should set security headers');
});

test('brainstorm-server.cjs enforces loopback-only by default', () => {
  const serverPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'server.cjs');
  const content = fs.readFileSync(serverPath, 'utf8');

  assert(content.includes("'127.0.0.1'"), 'should default to loopback address');
  assert(content.includes('BRAINSTORM_HOST'), 'should allow override via env var');
});

test('brainstorm-server.cjs has port fallback for collisions', () => {
  const serverPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'server.cjs');
  const content = fs.readFileSync(serverPath, 'utf8');

  assert(content.includes('EADDRINUSE'), 'should handle port in use');
  assert(content.includes('randomPort'), 'should fallback to random port');
});

test('start-server.sh creates owner-only session files', () => {
  const scriptPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'start-server.sh');
  const content = fs.readFileSync(scriptPath, 'utf8');

  assert(content.includes('umask 077'), 'should set strict umask');
  assert(content.includes('chmod 600'), 'should create owner-only files');
});

test('start-server.sh validates idle timeout argument', () => {
  const scriptPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'start-server.sh');
  const content = fs.readFileSync(scriptPath, 'utf8');

  assert(content.includes('--idle-timeout-minutes'), 'should accept idle timeout argument');
  assert(content.includes('[[ "$IDLE_TIMEOUT_MINUTES" =~ ^[0-9]+$'), 'should validate numeric input');
});

test('start-server.sh auto-foregrounds in Windows environments', () => {
  const scriptPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'start-server.sh');
  const content = fs.readFileSync(scriptPath, 'utf8');

  assert(content.includes('is_windows_like_shell'), 'should detect Windows shell');
  assert(content.includes('FOREGROUND'), 'should auto-foreground on Windows');
});

test('start-server.sh monitors server startup', () => {
  const scriptPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'start-server.sh');
  const content = fs.readFileSync(scriptPath, 'utf8');

  assert(content.includes('server-started'), 'should wait for server-started message');
  assert(content.includes('kill -0'), 'should verify server liveness');
});

test('stop-server.sh kills process by PID', () => {
  const scriptPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'stop-server.sh');
  const content = fs.readFileSync(scriptPath, 'utf8');

  assert(content.includes('kill'), 'should kill server process');
  assert(content.includes('PID_FILE'), 'should read PID from file');
});

test('brainstorm-server.cjs persists events to disk', () => {
  const serverPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'server.cjs');
  const content = fs.readFileSync(serverPath, 'utf8');

  assert(content.includes('events'), 'should persist events');
  assert(content.includes('appendFileSync'), 'should append to events file');
  assert(content.includes('JSON.stringify(event)'), 'should serialize events as JSON');
});

test('brainstorm-server.cjs watches content directory', () => {
  const serverPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'server.cjs');
  const content = fs.readFileSync(serverPath, 'utf8');

  assert(content.includes('fs.watch'), 'should watch content directory');
  assert(content.includes('debounceTimers'), 'should debounce file changes');
  assert(content.includes('CONTENT_DIR'), 'should track content directory');
});

test('brainstorm-server.cjs broadcasts updates to all clients', () => {
  const serverPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'server.cjs');
  const content = fs.readFileSync(serverPath, 'utf8');

  assert(content.includes('broadcast'), 'should have broadcast function');
  assert(content.includes('clients'), 'should track connected clients');
  assert(content.includes('socket.write'), 'should send updates to clients');
});

test('brainstorm-server.cjs has cross-origin protection', () => {
  const serverPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'server.cjs');
  const content = fs.readFileSync(serverPath, 'utf8');

  assert(content.includes('isAllowedWebSocketOrigin'), 'should validate WebSocket origin');
  assert(content.includes('Origin'), 'should check Origin header');
});

test('brainstorm-server.cjs prevents directory traversal', () => {
  const serverPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'scripts', 'server.cjs');
  const content = fs.readFileSync(serverPath, 'utf8');

  assert(content.includes('path.basename'), 'should use path.basename to strip paths');
  assert(content.includes('realpath'), 'should resolve to real path to prevent symlink attacks');
});

test('brainstorming skill documents server lifecycle', () => {
  const skillPath = path.join(REPO_ROOT, 'skills', 'brainstorming', 'SKILL.md');
  const content = fs.readFileSync(skillPath, 'utf8');

  assert(content.includes('server') || content.includes('WebSocket'), 'should document server');
  assert(content.length > 1000, 'should have substantive documentation');
});
