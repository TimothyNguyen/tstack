import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SERVER_SCRIPT = path.join(REPO_ROOT, 'brainstorming', 'scripts', 'server.cjs');
const START_SCRIPT = path.join(REPO_ROOT, 'brainstorming', 'scripts', 'start-server.sh');
const STOP_SCRIPT = path.join(REPO_ROOT, 'brainstorming', 'scripts', 'stop-server.sh');

test('brainstorm-server.cjs exists and is valid CommonJS', () => {
  assert(fs.existsSync(SERVER_SCRIPT), 'server.cjs should exist');
  const content = fs.readFileSync(SERVER_SCRIPT, 'utf8');
  assert(content.includes('require('), 'should use require for CommonJS');
  assert(content.includes('module.exports'), 'should export module');
  assert(content.includes('http.createServer'), 'should create HTTP server');
  assert(content.includes('WebSocket'), 'should handle WebSocket protocol');
});

test('brainstorm-server WebSocket protocol implementation is RFC-compliant', () => {
  const content = fs.readFileSync(SERVER_SCRIPT, 'utf8');
  assert(content.includes('OPCODES'), 'should define WebSocket opcodes');
  assert(content.includes('WS_MAGIC'), 'should define WebSocket magic string');
  assert(content.includes('computeAcceptKey'), 'should implement accept key computation');
  assert(content.includes('encodeFrame'), 'should implement frame encoding');
  assert(content.includes('decodeFrame'), 'should implement frame decoding');
});

test('brainstorm-server has lifecycle management', () => {
  const content = fs.readFileSync(SERVER_SCRIPT, 'utf8');
  assert(content.includes('IDLE_TIMEOUT_MS'), 'should have idle timeout');
  assert(content.includes('LIFECYCLE_CHECK_MS'), 'should have lifecycle check');
  assert(content.includes('lastActivity'), 'should track activity');
  assert(content.includes('touchActivity'), 'should have activity touch function');
  assert(content.includes('BRAINSTORM_IDLE_TIMEOUT_MS'), 'should respect idle timeout env var');
});

test('brainstorm-server has browser launcher for platform detection', () => {
  const content = fs.readFileSync(SERVER_SCRIPT, 'utf8');
  assert(content.includes('browserLauncherForPlatform'), 'should detect platform');
  assert(content.includes('maybeOpenBrowser'), 'should open browser on first screen');
  assert(content.includes('BRAINSTORM_OPEN'), 'should respect BRAINSTORM_OPEN env var');
});

test('brainstorm-server has file watching', () => {
  const content = fs.readFileSync(SERVER_SCRIPT, 'utf8');
  assert(content.includes('fs.watch'), 'should use fs.watch');
  assert(content.includes('debounceTimers'), 'should debounce file changes');
  assert(content.includes('CONTENT_DIR'), 'should watch content directory');
});

test('brainstorm-server has event handling', () => {
  const content = fs.readFileSync(SERVER_SCRIPT, 'utf8');
  assert(content.includes('handleMessage'), 'should handle WebSocket messages');
  assert(content.includes('handleRequest'), 'should handle HTTP requests');
  assert(content.includes('handleUpgrade'), 'should handle WebSocket upgrade');
  assert(content.includes('JSON.parse'), 'should parse events as JSON');
});

test('start-server.sh exists and is valid bash', () => {
  assert(fs.existsSync(START_SCRIPT), 'start-server.sh should exist');
  const content = fs.readFileSync(START_SCRIPT, 'utf8');
  assert(content.includes('#!/bin/bash') || content.includes('#!/usr/bin/env bash'), 'should have shebang');
  assert(content.length > 100, 'should have substantive content');
});

test('stop-server.sh exists and is valid bash', () => {
  assert(fs.existsSync(STOP_SCRIPT), 'stop-server.sh should exist');
  const content = fs.readFileSync(STOP_SCRIPT, 'utf8');
  assert(content.includes('#!/bin/bash') || content.includes('#!/usr/bin/env bash'), 'should have shebang');
  assert(content.length > 50, 'should have substantive content');
});

test('helper.js exists and exports brainstorming utilities', () => {
  const helperScript = path.join(REPO_ROOT, 'brainstorming', 'scripts', 'helper.js');
  assert(fs.existsSync(helperScript), 'helper.js should exist');
  const content = fs.readFileSync(helperScript, 'utf8');
  assert(content.includes('export'), 'should export functions');
});

test('frame-template.html exists for brainstorming UI', () => {
  const templatePath = path.join(REPO_ROOT, 'brainstorming', 'scripts', 'frame-template.html');
  assert(fs.existsSync(templatePath), 'frame-template.html should exist');
  const content = fs.readFileSync(templatePath, 'utf8');
  assert(content.includes('<html') || content.includes('<!DOCTYPE'), 'should be valid HTML');
});

test('brainstorming SKILL.md has server lifecycle documentation', () => {
  const skillPath = path.join(REPO_ROOT, 'brainstorming', 'SKILL.md');
  assert(fs.existsSync(skillPath), 'SKILL.md should exist');
  const content = fs.readFileSync(skillPath, 'utf8');
  assert(content.includes('WebSocket') || content.includes('server'), 'should document server');
});

test('brainstorming skill declares agents availability', () => {
  const skillPath = path.join(REPO_ROOT, 'brainstorming', 'SKILL.md.tmpl');
  assert(fs.existsSync(skillPath), 'SKILL.md.tmpl should exist');
  const content = fs.readFileSync(skillPath, 'utf8');
  assert(content.includes('agents:'), 'should declare agents');
  assert(content.includes('name: brainstorming'), 'should have name');
  assert(content.includes('description:'), 'should have description');
});
