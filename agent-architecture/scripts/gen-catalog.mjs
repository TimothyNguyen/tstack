#!/usr/bin/env node

/**
 * Generate docs/skill-catalog.md from skill metadata.
 *
 * Usage:
 *   npm run gen:catalog          # Generate catalog
 *   npm run gen:catalog -- --check  # Verify catalog is fresh
 *
 * Reads all SKILL.md.tmpl files, extracts metadata, generates
 * human-readable catalog with groupings, descriptions, and links.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const catalogPath = path.join(rootDir, "docs", "skill-catalog.md");

const CHECK_MODE = process.argv.includes("--check");

/**
 * Parse frontmatter from SKILL.md.tmpl
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;

  const fm = { raw: match[1] };
  const lines = match[1].split("\n");

  for (const line of lines) {
    if (!line.trim() || line[0] === " ") continue;

    if (line.includes(":")) {
      const [key, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();

      // Parse simple values
      if (value.startsWith("[") && value.endsWith("]")) {
        fm[key.trim()] = value
          .slice(1, -1)
          .split(",")
          .map((v) => v.trim());
      } else if (value) {
        fm[key.trim()] = value;
      }
    }
  }

  return fm;
}

/**
 * Get skill description (first line of description field)
 */
function getDescription(fm) {
  if (!fm.description) return "";

  // Handle multi-line description (after |)
  const lines = fm.description.split("\n");
  return lines[0].trim();
}

/**
 * Collect all skills with metadata
 */
function collectSkills() {
  const skills = [];
  const entries = fs.readdirSync(rootDir);

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry);
    if (!fs.statSync(fullPath).isDirectory()) continue;
    if (entry.startsWith(".")) continue;

    const skillPath = path.join(fullPath, "SKILL.md.tmpl");
    if (!fs.existsSync(skillPath)) continue;

    try {
      const content = fs.readFileSync(skillPath, "utf8");
      const fm = parseFrontmatter(content);

      if (fm && fm.name) {
        skills.push({
          name: fm.name,
          version: fm.version || "0.1.0",
          description: getDescription(fm),
          agents: fm.agents || [],
          category: fm.category || "core",
          directory: entry,
          frontmatter: fm,
        });
      }
    } catch (e) {
      console.error(`Error parsing ${skillPath}:`, e.message);
    }
  }

  return skills;
}

/**
 * Group skills by category
 */
function groupByCategory(skills) {
  const grouped = {};

  const categories = [
    "core",
    "visual-system",
    "design",
    "code",
    "data",
    "release",
    "infrastructure",
  ];

  for (const cat of categories) {
    grouped[cat] = skills.filter(
      (s) => s.category === cat || (!s.category && cat === "core")
    );
  }

  return grouped;
}

/**
 * Generate markdown catalog
 */
function generateCatalog(skills) {
  const grouped = groupByCategory(skills);

  let md = `# Skill Catalog

Agent-architecture provides ${skills.length} reusable skills organized by category and specialized role.

**[Contributing?](./CONTRIBUTING.md)** See submission process and validation checklist.

---

## By Category

`;

  const categoryNames = {
    core: "Core Workflows",
    "visual-system": "Visual System (Diagrams & Design)",
    design: "Design & Review",
    code: "Code & Implementation",
    data: "Data & MLOps",
    release: "Release & Deployment",
    infrastructure: "Infrastructure & Coordination",
  };

  for (const [cat, skills] of Object.entries(grouped)) {
    if (!skills.length) continue;

    md += `### ${categoryNames[cat]}\n\n`;

    for (const skill of skills.sort((a, b) => a.name.localeCompare(b.name))) {
      const agentList = Array.isArray(skill.agents)
        ? skill.agents
            .filter((a) => a !== "_infrastructure")
            .slice(0, 2)
            .join(", ")
        : "";
      const agentSuffix = agentList ? ` *(${agentList})*` : "";

      md += `- **[\`${skill.name}\`](./${skill.directory}/SKILL.md)** — ${skill.description}${agentSuffix}\n`;
    }

    md += "\n";
  }

  // Add by-agent index
  md += `---

## By Agent

`;

  const agents = [
    "swe",
    "qa-agent",
    "spec-agent",
    "pm",
    "design-agent",
    "diagram-agent",
    "orchestrate",
    "security",
    "migration",
    "migration-engineer",
    "data",
    "cloud",
    "release-agent",
    "interviewer",
  ];

  for (const agent of agents) {
    const agentSkills = skills.filter((s) => {
      const agents = Array.isArray(s.agents) ? s.agents : [];
      return agents.includes(agent);
    });

    if (agentSkills.length === 0) continue;

    md += `### \`/${agent}\`\n\n`;
    md += `${agentSkills.length} skills\n\n`;

    for (const skill of agentSkills.sort((a, b) =>
      a.name.localeCompare(b.name)
    )) {
      md += `- [\`${skill.name}\`](./${skill.directory}/SKILL.md) — ${skill.description}\n`;
    }

    md += "\n";
  }

  // Add stats
  md += `---

## Statistics

| Category | Count |
|----------|-------|
`;

  for (const [cat, skills] of Object.entries(grouped)) {
    if (skills.length > 0) {
      md += `| ${categoryNames[cat]} | ${skills.length} |\n`;
    }
  }

  md += `| **Total** | **${skills.length}** |\n\n`;

  md += `See [METADATA-SCHEMA.md](./METADATA-SCHEMA.md) for skill development and metadata reference.\n`;

  return md;
}

/**
 * Main
 */
async function main() {
  console.log("Generating skill catalog...");

  const skills = collectSkills();
  const catalog = generateCatalog(skills);

  if (CHECK_MODE) {
    // Verify catalog is current
    if (!fs.existsSync(catalogPath)) {
      console.error("❌ Catalog file missing. Run: npm run gen:catalog");
      process.exit(1);
    }

    const existing = fs.readFileSync(catalogPath, "utf8");
    if (existing !== catalog) {
      console.error("❌ Catalog is stale. Run: npm run gen:catalog");
      process.exit(1);
    }

    console.log(`✅ Catalog is current (${skills.length} skills)`);
  } else {
    // Write catalog
    fs.writeFileSync(catalogPath, catalog, "utf8");
    console.log(
      `✅ Generated ${catalogPath} (${skills.length} skills, ${skills.length} agents covered)`
    );
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
