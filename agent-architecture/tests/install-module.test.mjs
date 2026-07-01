import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as installModule from "../scripts/install.mjs";

const repoRoot = process.cwd();
const installModulePath = path.join(process.cwd(), "scripts", "install.mjs");

async function loadInstallModule({ cwd, args = [] } = {}) {
  const previousCwd = process.cwd();
  const previousArgv = process.argv.slice();
  if (cwd) {
    process.chdir(cwd);
  }
  process.argv = ["node", "test-runner.mjs", ...args];
  try {
    return await import(`${pathToFileURL(installModulePath).href}?t=${Date.now()}-${Math.random()}`);
  } finally {
    process.chdir(previousCwd);
    process.argv = previousArgv;
  }
}

function withCapturedLogs(fn) {
  const lines = [];
  const original = console.log;
  console.log = (...args) => lines.push(args.join(" "));
  try {
    fn();
  } finally {
    console.log = original;
  }
  return lines;
}

test("install module pure helpers are exercised through direct import", () => {
  const defaults = installModule.getDefaultAgents();
  assert.ok(defaults.includes("swe"));
  assert.ok(defaults.includes("orchestrate"));

  const parsed = installModule.parseFrontmatter("---\nname: demo\ndescription: |\n  line one\nagents: [swe, qa-agent]\n---\nbody");
  assert.equal(parsed.name, "demo");
  assert.equal(parsed.description, "line one");
  assert.deepEqual(parsed.agents, ["swe", "qa-agent"]);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-arch-collect-"));
  fs.mkdirSync(path.join(tempDir, "demo"), { recursive: true });
  fs.writeFileSync(
    path.join(tempDir, "demo", "SKILL.md"),
    "---\nname: demo\ndescription: |\n  Demo skill\nagents: [swe]\n---\nbody\n",
    "utf8",
  );
  const collected = installModule.collectSkillEntries(tempDir, "demo-root");
  assert.equal(collected.length, 1);
  assert.equal(collected[0].name, "demo");
  assert.equal(installModule.collectSkillEntries(path.join(tempDir, "missing")).length, 0);

  const frontmatter = installModule.readAgentFrontmatter("swe");
  assert.equal(frontmatter.name, "swe");
  assert.equal(installModule.readAgentFrontmatter("does-not-exist"), null);

  const mergedMcps = installModule.resolveBuiltinMcps({
    mcps: [{ name: "custom", command: "node", args: [], credentialEnvVars: [] }],
    mcpProfiles: ["github"],
  });
  assert.ok(mergedMcps.some((mcp) => mcp.name === "custom"));
  assert.ok(mergedMcps.some((mcp) => mcp.name === "github"));
  assert.throws(
    () => installModule.resolveBuiltinMcps({ mcps: [], mcpProfiles: ["does-not-exist"] }),
    /Unknown MCP profiles/,
  );

  const lines = withCapturedLogs(() => {
    installModule.printList("agents");
    installModule.printList("mcp-profiles");
    installModule.printList("hosts");
  });
  assert.ok(lines.includes("supported:"));

  const originalCwd = process.cwd();
  const tempConfigDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-arch-readcfg-"));
  process.chdir(tempConfigDir);
  try {
    const defaultConfig = installModule.readConfig();
    assert.ok(defaultConfig.agents.includes("swe"));
    fs.writeFileSync(
      ".agent-config.json",
      JSON.stringify({
        hosts: ["claude"],
        agents: ["swe"],
        mcps: [],
        mcpProfiles: ["github"],
      }),
      "utf8",
    );
    const config = installModule.readConfig();
    assert.deepEqual(config.hosts, ["claude"]);
    assert.ok(config.mcps.some((mcp) => mcp.name === "github"));
  } finally {
    process.chdir(originalCwd);
  }

  const settings = JSON.parse(installModule.generateSettings({
    mcps: [{ name: "custom", command: "node", args: ["server.js"], credentialEnvVars: ["TOKEN"] }],
    mcpProfiles: [],
  }));
  assert.equal(settings.mcpServers.custom.env.TOKEN, "$TOKEN");

  const claudeMd = installModule.generateClaudeMd({ agents: ["swe", "orchestrate"] }, "9.9.9");
  const agentsMd = installModule.generateAgentsMd({ agents: ["swe", "orchestrate"] }, "9.9.9");
  const copilotMd = installModule.generateCopilotInstructions({ agents: ["swe", "orchestrate"] }, "9.9.9");
  assert.match(claudeMd, /\/swe/);
  assert.match(agentsMd, /orchestrate:/);
  assert.match(copilotMd, /- \/orchestrate/);

  const utilitySkills = installModule.discoverUtilitySkills(["swe", "orchestrate"]);
  assert.ok(utilitySkills.some((skill) => skill.name === "review"));

  const manifest = JSON.parse(installModule.generateManifest({ agents: ["swe"], hosts: ["claude"], mcps: [], mcpProfiles: [] }, "1.0.0", utilitySkills.slice(0, 2)));
  assert.equal(manifest.version, "1.0.0");
  assert.equal(manifest.hosts[0], "claude");
});

test("install module readConfig returns defaults when .agent-config.json is absent", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-arch-config-"));
  const mod = await loadInstallModule({ cwd: tempDir });
  const config = mod.readConfig();

  assert.equal(config.private, false);
  assert.deepEqual(config.hosts, ["claude", "codex", "copilot"]);
  assert.ok(config.agents.includes("swe"));
  assert.ok(config.agents.includes("orchestrate"));
  assert.deepEqual(config.mcps, []);
});

test("install module generate helpers include specialty agents and MCP wiring", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-arch-generate-"));
  const mod = await loadInstallModule({ cwd: tempDir, args: ["--private", "--docker-mcp", "backend", "--mcp-profile", "github"] });
  const config = {
    private: true,
    hosts: ["claude", "codex", "copilot"],
    agents: ["swe", "orchestrate", "security"],
    mcps: [],
    mcpProfiles: [],
  };

  const settings = JSON.parse(mod.generateSettings(config));
  assert.equal(settings.env.CLAUDE_CODE_DISABLE_AUTO_MEMORY, "1");
  assert.deepEqual(settings.mcpServers["docker-gateway"].args, ["mcp", "gateway", "run", "--profile", "backend"]);
  assert.equal(settings.mcpServers.github.env.GITHUB_TOKEN, "$GITHUB_TOKEN");

  const claudeMd = mod.generateClaudeMd(config, "1.2.3");
  assert.match(claudeMd, /\/swe/);
  assert.match(claudeMd, /\/orchestrate/);
  assert.match(claudeMd, /private: no telemetry/i);

  const agentsMd = mod.generateAgentsMd(config, "1.2.3");
  assert.match(agentsMd, /swe: /);
  assert.match(agentsMd, /orchestrate: /);

  const copilot = mod.generateCopilotInstructions(config, "1.2.3");
  assert.match(copilot, /- \/security/);

  const manifest = JSON.parse(mod.generateManifest(config, "1.2.3", [{ name: "review" }]));
  assert.deepEqual(manifest.hosts, ["claude", "codex", "copilot"]);
  assert.ok(manifest.mcps.includes("github"));
  assert.deepEqual(manifest.skills, ["review"]);
});

test("install module list and validation helpers cover supported branches", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-arch-lists-"));
  const mod = await loadInstallModule({ cwd: tempDir });

  const agentLines = withCapturedLogs(() => mod.printList("agents"));
  assert.ok(agentLines.includes("swe"));
  assert.ok(agentLines.includes("orchestrate"));

  const profileLines = withCapturedLogs(() => mod.printList("mcp-profiles"));
  assert.deepEqual(profileLines, ["github", "postgres", "slack"]);

  const hostLines = withCapturedLogs(() => mod.printList("hosts"));
  assert.deepEqual(hostLines.slice(0, 4), ["supported:", "claude", "codex", "copilot"]);
  assert.ok(hostLines.includes("future:"));

  assert.throws(() => mod.validateHostNames(["bogus-host"]), /Unknown hosts/);
  assert.throws(() => mod.validateAgentNames(["bogus-agent"]), /Unknown agents/);
});

test("install module resolves MCP profiles, discovers utilities, installs, and doctor passes", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-arch-install-"));
  const mod = await loadInstallModule({ cwd: tempDir, args: ["--private", "--mcp-profile", "slack"] });

  fs.writeFileSync(
    path.join(tempDir, ".agent-config.json"),
    JSON.stringify({
      private: true,
      hosts: ["claude", "codex", "copilot"],
      agents: ["swe", "orchestrate"],
      mcps: [
        {
          name: "custom-mcp",
          command: "node",
          args: ["server.js"],
          credentialEnvVars: ["CUSTOM_TOKEN"],
        },
      ],
      mcpProfiles: ["github"],
    }, null, 2),
    "utf8",
  );

  process.chdir(tempDir);
  try {
    const config = mod.readConfig();
    const mergedMcps = mod.resolveBuiltinMcps(config);
    assert.ok(mergedMcps.some((mcp) => mcp.name === "custom-mcp"));
    assert.ok(mergedMcps.some((mcp) => mcp.name === "github"));
    assert.ok(mergedMcps.some((mcp) => mcp.name === "slack"));

    const utilitySkills = mod.discoverUtilitySkills(config.agents);
    assert.ok(utilitySkills.some((skill) => skill.name === "review"));

    mod.install();

    const installRoot = path.join(tempDir, ".agent");
    assert.ok(fs.existsSync(path.join(installRoot, "skills", "swe", "SKILL.md")));
    assert.ok(fs.existsSync(path.join(installRoot, "skills", "orchestrate", "SKILL.md")));
    assert.ok(fs.existsSync(path.join(installRoot, "install-manifest.json")));
    assert.ok(fs.existsSync(path.join(tempDir, ".architecture-agent", ".gitignore")));

    const settings = JSON.parse(fs.readFileSync(path.join(installRoot, "settings.json"), "utf8"));
    assert.equal(settings.mcpServers["custom-mcp"].env.CUSTOM_TOKEN, "$CUSTOM_TOKEN");

    process.exitCode = 0;
    mod.doctor();
    assert.equal(process.exitCode, 0);
  } finally {
    process.chdir(repoRoot);
    process.exitCode = 0;
  }
});
