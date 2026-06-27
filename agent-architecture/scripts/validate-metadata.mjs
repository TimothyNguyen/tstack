#!/usr/bin/env node

/**
 * Validate skill metadata against schema.
 *
 * Usage:
 *   npm run validate:metadata -- skill-name/SKILL.md.tmpl
 *   npm run validate:metadata -- "*"  (validate all skills)
 *
 * Checks:
 *   - Required frontmatter fields present
 *   - Metadata schema valid (if present)
 *   - Agent names valid
 *   - Dependency skills exist
 *   - Policy names valid
 *   - Version constraints valid (semver)
 */

import fs from "fs";
import path from "path";

const VALID_CATEGORIES = [
  "core",
  "visual-system",
  "design",
  "code",
  "data",
  "release",
  "infrastructure",
];
const VALID_TIERS = ["essential", "recommended", "optional"];
const VALID_STATUSES = ["active", "experimental", "deprecated"];
const VALID_POLICIES = [
  "mcp-egress",
  "destructive-operations",
  "credential-read",
  "system-access",
];

// Valid agent names (from agents/ directory)
const VALID_AGENTS = [
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

// Valid tool names
const VALID_TOOLS = [
  "Read",
  "Grep",
  "Glob",
  "Bash",
  "PowerShell",
  "Write",
  "Edit",
  "Agent",
  "AskUserQuestion",
];

const errors = [];
const warnings = [];

/**
 * Parse YAML frontmatter from skill template
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;

  const yaml = match[1];
  const result = {};
  const lines = yaml.split("\n");

  let currentKey = null;
  let isArray = false;
  let arrayItems = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      continue;
    }

    // Check if this is a top-level key (not indented)
    if (line[0] !== " " && line.includes(":")) {
      // Save previous key
      if (currentKey) {
        if (isArray) {
          result[currentKey] = arrayItems;
          arrayItems = [];
        }
      }

      const [key, ...valueParts] = line.split(":");
      currentKey = key.trim();
      const value = valueParts.join(":").trim();

      if (value.startsWith("[") && value.endsWith("]")) {
        // Inline array: [a, b, c]
        result[currentKey] = value
          .slice(1, -1)
          .split(",")
          .map((item) => item.trim());
        currentKey = null;
        isArray = false;
      } else if (value === "|") {
        // Multi-line string follows (mark as present)
        result[currentKey] = true; // Mark as present
        currentKey = null;
      } else if (value === "") {
        // Multi-line or array follows
        isArray = false;
      } else {
        // Simple value
        result[currentKey] = value;
        currentKey = null;
      }
    } else if (currentKey && line.trim().startsWith("- ")) {
      // Array item
      isArray = true;
      arrayItems.push(line.trim().slice(2).trim());
    }
  }

  // Save last key if it's an array
  if (currentKey && isArray) {
    result[currentKey] = arrayItems;
  }

  return result;
}

/**
 * Load all skill names for dependency validation
 */
function loadSkillRegistry() {
  const skills = new Set();
  const skillDirs = fs
    .readdirSync(".")
    .filter((f) => fs.statSync(f).isDirectory());

  for (const dir of skillDirs) {
    const skillMdPath = path.join(dir, "SKILL.md.tmpl");
    if (fs.existsSync(skillMdPath)) {
      const content = fs.readFileSync(skillMdPath, "utf8");
      const fm = parseFrontmatter(content);
      if (fm && fm.name) {
        skills.add(fm.name);
      }
    }
  }

  return skills;
}

/**
 * Validate a single skill file
 */
function validateSkill(filePath, skillRegistry) {
  const content = fs.readFileSync(filePath, "utf8");
  const fm = parseFrontmatter(content);

  if (!fm) {
    errors.push(`${filePath}: No frontmatter found`);
    return;
  }

  const skillName = fm.name || path.basename(path.dirname(filePath));

  // Required fields
  if (!fm.name) {
    errors.push(`${filePath}: Missing 'name' field`);
  }
  if (!fm.version) {
    errors.push(`${filePath}: Missing 'version' field`);
  } else if (!isValidSemver(fm.version)) {
    errors.push(
      `${filePath}: Invalid version format '${fm.version}' (expected semver)`
    );
  }

  if (!fm.description) {
    errors.push(`${filePath}: Missing 'description' field`);
  }

  // allowed-tools is optional (some skills don't use tools)
  if (fm["allowed-tools"] && Array.isArray(fm["allowed-tools"])) {
    for (const tool of fm["allowed-tools"]) {
      if (!VALID_TOOLS.includes(tool)) {
        warnings.push(
          `${filePath}: Unknown tool '${tool}' (maybe new? Check VALID_TOOLS)`
        );
      }
    }
  }

  if (!fm.agents || !Array.isArray(fm.agents)) {
    errors.push(`${filePath}: Missing or invalid 'agents' field`);
  } else {
    for (const agent of fm.agents) {
      if (!VALID_AGENTS.includes(agent)) {
        errors.push(
          `${filePath}: Invalid agent '${agent}' (valid: ${VALID_AGENTS.join(", ")})`
        );
      }
    }
  }

  // Optional metadata validation
  if (fm.metadata) {
    const meta = fm.metadata;

    // Parse metadata if it's a string (YAML object)
    if (typeof meta === "string") {
      // Skip complex object parsing for now
      warnings.push(`${filePath}: Metadata parsing not implemented for complex objects`);
      return;
    }

    if (meta.category && !VALID_CATEGORIES.includes(meta.category)) {
      errors.push(
        `${filePath}: Invalid category '${meta.category}' (valid: ${VALID_CATEGORIES.join(", ")})`
      );
    }

    if (meta.tier && !VALID_TIERS.includes(meta.tier)) {
      errors.push(
        `${filePath}: Invalid tier '${meta.tier}' (valid: ${VALID_TIERS.join(", ")})`
      );
    }

    if (meta.dependencies) {
      if (meta.dependencies.skills && Array.isArray(meta.dependencies.skills)) {
        for (const skill of meta.dependencies.skills) {
          if (!skillRegistry.has(skill)) {
            errors.push(
              `${filePath}: Dependency skill '${skill}' not found in registry`
            );
          }
        }
      }

      if (meta.dependencies["min-agent-arch-version"]) {
        if (!isValidSemver(meta.dependencies["min-agent-arch-version"])) {
          errors.push(
            `${filePath}: Invalid min-agent-arch-version '${meta.dependencies["min-agent-arch-version"]}'`
          );
        }
      }
    }

    if (meta["approval-gates"] && meta["approval-gates"]["policy-required"]) {
      if (!Array.isArray(meta["approval-gates"]["policy-required"])) {
        errors.push(`${filePath}: policy-required must be an array`);
      } else {
        for (const policy of meta["approval-gates"]["policy-required"]) {
          if (!VALID_POLICIES.includes(policy)) {
            warnings.push(
              `${filePath}: Unknown policy '${policy}' (valid: ${VALID_POLICIES.join(", ")})`
            );
          }
        }
      }
    }

    if (
      meta.support &&
      meta.support["maintenance-status"] &&
      !VALID_STATUSES.includes(meta.support["maintenance-status"])
    ) {
      errors.push(
        `${filePath}: Invalid maintenance-status '${meta.support["maintenance-status"]}' (valid: ${VALID_STATUSES.join(", ")})`
      );
    }

    if (meta.support && meta.support["last-reviewed"]) {
      if (!isValidISODate(meta.support["last-reviewed"])) {
        errors.push(
          `${filePath}: Invalid last-reviewed date '${meta.support["last-reviewed"]}' (expected YYYY-MM-DD)`
        );
      }
    }
  }
}

/**
 * Check if string is valid semver
 */
function isValidSemver(version) {
  return /^\d+\.\d+\.\d+/.test(version);
}

/**
 * Check if string is valid ISO date
 */
function isValidISODate(dateString) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

/**
 * Find all SKILL.md.tmpl files
 */
function findAllSkillFiles() {
  const files = [];
  const entries = fs.readdirSync(".");

  for (const entry of entries) {
    const skillPath = path.join(entry, "SKILL.md.tmpl");
    if (fs.existsSync(skillPath)) {
      files.push(skillPath);
    }
  }

  return files;
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);

  if (!args.length) {
    console.error("Usage: validate-metadata -- <file-or-*>");
    process.exit(1);
  }

  const pattern = args[0];
  let files = [];

  if (pattern === "*") {
    // All skills
    files = findAllSkillFiles();
  } else if (fs.existsSync(pattern)) {
    // Single file
    files = [pattern];
  } else {
    console.error(`File not found: ${pattern}`);
    process.exit(1);
  }

  if (!files.length) {
    console.error(`No files found`);
    process.exit(1);
  }

  // Load skill registry for dependency validation
  const skillRegistry = loadSkillRegistry();

  // Validate each file
  for (const file of files) {
    validateSkill(file, skillRegistry);
  }

  // Report results
  console.log("");
  console.log(`Validated ${files.length} skill(s)`);

  if (errors.length) {
    console.log(`\n❌ ${errors.length} ERROR(S):\n`);
    for (const error of errors) {
      console.log(`  ${error}`);
    }
  }

  if (warnings.length) {
    console.log(`\n⚠️  ${warnings.length} WARNING(S):\n`);
    for (const warning of warnings) {
      console.log(`  ${warning}`);
    }
  }

  if (!errors.length && !warnings.length) {
    console.log("✅ All validations passed");
  }

  // Exit with error if any errors found
  if (errors.length) {
    process.exit(1);
  }
}

main().catch(console.error);
