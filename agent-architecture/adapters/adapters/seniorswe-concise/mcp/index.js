#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { MODES, buildInstructions, resolveMode } from './instructions.js';

const server = new McpServer({ name: 'architecture-agent-seniorswe-concise', version: '0.1.0' });

const modeArg = z.enum(MODES).optional()
  .describe('Seniorswe-Concise intensity: lite, full, or ultra. Omit for the configured default.');

server.registerPrompt(
  'seniorswe-concise',
  {
    title: 'Seniorswe-Concise mode',
    description: 'Lazy senior dev instructions: YAGNI, stdlib first, smallest correct change.',
    argsSchema: { mode: modeArg },
  },
  ({ mode }) => ({
    messages: [{ role: 'user', content: { type: 'text', text: buildInstructions(mode) } }],
  }),
);

server.registerTool(
  'seniorswe_concise_instructions',
  {
    title: 'Seniorswe-Concise instructions',
    description: 'Return Seniorswe-Concise rules for the given intensity.',
    inputSchema: { mode: modeArg },
    outputSchema: { mode: z.string(), instructions: z.string() },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  ({ mode }) => {
    const resolvedMode = resolveMode(mode);
    const instructions = buildInstructions(resolvedMode);
    return {
      content: [{ type: 'text', text: instructions }],
      structuredContent: { mode: resolvedMode, instructions },
    };
  },
);

await server.connect(new StdioServerTransport());
