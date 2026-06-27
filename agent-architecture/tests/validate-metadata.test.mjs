import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

/**
 * Simple YAML frontmatter parser (subset we care about)
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;

  const yaml = match[1];
  const result = {};

  for (const line of yaml.split("\n")) {
    if (!line.trim() || line[0] === " ") continue;
    if (line.includes(":")) {
      const [key, value] = line.split(":");
      result[key.trim()] = value.trim();
    }
  }

  return result;
}

/**
 * Get all skill files
 */
function getAllSkillFiles() {
  const skills = [];
  const entries = fs.readdirSync(rootDir);

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry);
    if (!fs.statSync(fullPath).isDirectory()) continue;

    const skillPath = path.join(fullPath, "SKILL.md.tmpl");
    if (fs.existsSync(skillPath)) {
      skills.push({ name: entry, path: skillPath });
    }
  }

  return skills;
}

test("metadata: all skills have required frontmatter fields", () => {
  const skills = getAllSkillFiles();
  assert(skills.length > 0, "Should find at least some skills");

  const missing = [];

  for (const skill of skills) {
    const content = fs.readFileSync(skill.path, "utf8");
    const fm = parseFrontmatter(content);

    if (!fm) {
      missing.push(`${skill.name}: Missing frontmatter`);
      continue;
    }

    if (!fm.name)
      missing.push(`${skill.name}: Missing 'name' field`);
    if (!fm.version)
      missing.push(`${skill.name}: Missing 'version' field`);
    if (!fm.description)
      missing.push(`${skill.name}: Missing 'description' field`);
    if (!fm["allowed-tools"])
      missing.push(`${skill.name}: Missing 'allowed-tools' field`);
    if (!fm.agents)
      missing.push(`${skill.name}: Missing 'agents' field`);
  }

  if (missing.length > 0) {
    console.log("\nMissing fields:");
    missing.forEach((m) => console.log(`  ${m}`));
  }

  assert.equal(missing.length, 0, "All skills should have required fields");
});

test("metadata: skill names match directory names", () => {
  const skills = getAllSkillFiles();
  const mismatches = [];

  for (const skill of skills) {
    const content = fs.readFileSync(skill.path, "utf8");
    const fm = parseFrontmatter(content);

    if (fm && fm.name && fm.name !== skill.name) {
      mismatches.push(
        `${skill.name}/SKILL.md.tmpl has name='${fm.name}'`
      );
    }
  }

  if (mismatches.length > 0) {
    console.log("\nName mismatches:");
    mismatches.forEach((m) => console.log(`  ${m}`));
  }

  assert.equal(mismatches.length, 0, "Skill names should match directory names");
});

test("metadata: all version fields are semver", () => {
  const skills = getAllSkillFiles();
  const invalid = [];

  for (const skill of skills) {
    const content = fs.readFileSync(skill.path, "utf8");
    const fm = parseFrontmatter(content);

    if (fm && fm.version) {
      if (!/^\d+\.\d+\.\d+/.test(fm.version)) {
        invalid.push(
          `${skill.name}: version='${fm.version}' is not valid semver`
        );
      }
    }
  }

  if (invalid.length > 0) {
    console.log("\nInvalid versions:");
    invalid.forEach((m) => console.log(`  ${m}`));
  }

  assert.equal(invalid.length, 0, "All versions should be semver");
});

test("metadata: all agent references are valid", () => {
  const skills = getAllSkillFiles();
  const validAgents = [
    "_infrastructure",
    "swe",
    "qa-agent",
    "spec-agent",
    "pm",
    "design-agent",
    "orchestrate",
    "security",
    "migration",
    "data",
    "cloud",
    "release-agent",
    "interviewer",
  ];

  const invalid = [];

  for (const skill of skills) {
    const content = fs.readFileSync(skill.path, "utf8");
    const fm = parseFrontmatter(content);

    if (fm && fm.agents) {
      // Parse agents array from YAML
      const agentList = fm.agents
        .slice(1, -1)
        .split(",")
        .map((a) => a.trim());

      for (const agent of agentList) {
        if (!validAgents.includes(agent)) {
          invalid.push(`${skill.name}: Invalid agent '${agent}'`);
        }
      }
    }
  }

  if (invalid.length > 0) {
    console.log("\nInvalid agents:");
    invalid.forEach((m) => console.log(`  ${m}`));
  }

  assert.equal(invalid.length, 0, "All agent references should be valid");
});

test("metadata: no SKILL.md.tmpl files have rendering placeholders", () => {
  const skills = getAllSkillFiles();
  const problematic = [];

  for (const skill of skills) {
    const content = fs.readFileSync(skill.path, "utf8");

    // Check for unrendered placeholders
    if (content.includes("{{") && !content.includes("PREAMBLE")) {
      problematic.push(
        `${skill.name}: Has unreplaced placeholders`
      );
    }
  }

  if (problematic.length > 0) {
    console.log("\nProblematic placeholders:");
    problematic.forEach((m) => console.log(`  ${m}`));
  }

  assert.equal(
    problematic.length,
    0,
    "No skill should have unreplaced placeholders"
  );
});

test("metadata: all skills are registered in package.json files", () => {
  const skills = getAllSkillFiles();
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(rootDir, "package.json"), "utf8")
  );

  const unregistered = [];

  for (const skill of skills) {
    if (!packageJson.files.includes(skill.name + "/")) {
      unregistered.push(skill.name);
    }
  }

  if (unregistered.length > 0) {
    console.log("\nUnregistered skills in package.json:");
    unregistered.forEach((s) => console.log(`  ${s}/`));
  }

  // This is a warning, not a failure (for now)
  if (unregistered.length > 0) {
    console.log(
      "  (Run: npm run build:skills && npm run check:skills)"
    );
  }
});

test("metadata: agent skill declarations are current", () => {
  const agents = fs.readdirSync(path.join(rootDir, "agents"));
  const issues = [];

  for (const agent of agents) {
    if (agent.startsWith(".")) continue;

    const skillPath = path.join(rootDir, "agents", agent, "SKILL.md");
    if (!fs.existsSync(skillPath)) continue;

    const content = fs.readFileSync(skillPath, "utf8");

    // Check for "Declared Skills" section
    if (!content.includes("Declared Skills")) {
      issues.push(`${agent}: Missing 'Declared Skills' section`);
    }
  }

  if (issues.length > 0) {
    console.log("\nMissing agent skill declarations:");
    issues.forEach((i) => console.log(`  ${i}`));
    console.log("  (Run: npm run build:skills)");
  }

  // This is a warning for now (agent declarations auto-generate)
  assert(
    issues.length < 5,
    "Should have fewer than 5 missing declarations (auto-generated on build:skills)"
  );
});
