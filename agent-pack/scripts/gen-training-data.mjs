#!/usr/bin/env node

/**
 * Generate training data (JSONL) for LLM fine-tuning and skill discovery.
 *
 * Usage:
 *   npm run gen:training-data
 *   npm run gen:training-data -- --check
 *
 * Output: docs/TRAINING-DATA.jsonl (one JSON object per line)
 *
 * Each line represents one skill's metadata for LLM ingestion:
 *   - name, description, keywords
 *   - agents that access it
 *   - example invocations
 *   - when to use
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const outputPath = path.join(rootDir, "docs", "TRAINING-DATA.jsonl");
const TRAINING_ROOTS = ["skills", "agents", "adapters", "stacks", "domains", "tool-providers"];

const CHECK_MODE = process.argv.includes("--check");

/**
 * Parse frontmatter from SKILL.md.tmpl
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;

  const fm = {};
  const lines = match[1].split("\n");

  let currentKey = null;
  let isArray = false;
  let arrayItems = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    if (line[0] !== " " && line.includes(":")) {
      // Save previous key
      if (currentKey) {
        if (isArray) {
          fm[currentKey] = arrayItems;
          arrayItems = [];
        }
      }

      const [key, ...valueParts] = line.split(":");
      currentKey = key.trim();
      const value = valueParts.join(":").trim();

      if (value.startsWith("[") && value.endsWith("]")) {
        fm[currentKey] = value
          .slice(1, -1)
          .split(",")
          .map((item) => item.trim());
        currentKey = null;
        isArray = false;
      } else if (value === "|") {
        fm[currentKey] = true; // Multi-line marker
        currentKey = null;
      } else if (value === "") {
        isArray = false;
      } else {
        fm[currentKey] = value;
        currentKey = null;
      }
    } else if (currentKey && line.trim().startsWith("- ")) {
      isArray = true;
      arrayItems.push(line.trim().slice(2).trim());
    }
  }

  if (currentKey && isArray) {
    fm[currentKey] = arrayItems;
  }

  return fm;
}

/**
 * Extract example invocations from skill body
 */
function extractExamples(content) {
  const examples = [];

  // Look for "Invoke /skill-name" patterns
  const invokePattern = /(?:invoke|Invoke|use|Use).*`\/([a-z-]+)`/gi;
  let match;

  while ((match = invokePattern.exec(content)) !== null) {
    if (!examples.includes(`/${match[1]}`)) {
      examples.push(`/${match[1]}`);
    }
  }

  return examples;
}

/**
 * Get use-case summary from skill body
 */
function extractUseCases(content) {
  const useCases = [];

  // Look for "When to use", "Use when", etc.
  const lines = content.split("\n");
  let inUseSection = false;

  for (const line of lines) {
    if (
      line.includes("When to") ||
      line.includes("Use when") ||
      line.includes("use this")
    ) {
      inUseSection = true;
    } else if (line.startsWith("#") && inUseSection) {
      break;
    } else if (inUseSection && line.includes("-")) {
      useCases.push(line.replace(/^[-*]\s*/, "").trim());
    }
  }

  return useCases.slice(0, 5); // Limit to 5
}

/**
 * Collect all skills with metadata
 */
function collectSkills() {
  const skills = [];

  for (const base of TRAINING_ROOTS) {
    const baseDir = path.join(rootDir, base);
    if (!fs.existsSync(baseDir)) continue;

    const entries = fs.readdirSync(baseDir);
    for (const entry of entries) {
      const fullPath = path.join(baseDir, entry);
      if (!fs.statSync(fullPath).isDirectory()) continue;
      if (entry.startsWith(".")) continue;

      const skillPath = path.join(fullPath, "SKILL.md.tmpl");
      if (!fs.existsSync(skillPath)) continue;

      try {
        const content = fs.readFileSync(skillPath, "utf8");
        const fm = parseFrontmatter(content);

        if (fm && fm.name) {
          // Extract description (first line only)
          let description = "";
          if (fm.description && typeof fm.description === "string") {
            description = fm.description.split("\n")[0].trim();
          }

          // If description is missing, try to extract from generated SKILL.md
          if (!description) {
            try {
              const skillMdPath = path.join(fullPath, "SKILL.md");
              if (fs.existsSync(skillMdPath)) {
                const skillMdContent = fs.readFileSync(skillMdPath, "utf8");
                // Extract first paragraph after frontmatter
                const match = skillMdContent.match(/^---[\s\S]*?^---\n+([\s\S]*?)(?:\n##|\n$)/m);
                if (match && match[1]) {
                  description = match[1].split("\n")[0].trim();
                }
              }
            } catch {
              // Ignore, use empty description
            }
          }

          // Extract examples and use cases
          const examples = extractExamples(content);
          const useCases = extractUseCases(content);

        // Parse metadata
        let keywords = [];
        let agents = [];

        if (fm.agents) {
          if (Array.isArray(fm.agents)) {
            agents = fm.agents;
          } else if (typeof fm.agents === "string") {
            agents = fm.agents
              .slice(1, -1)
              .split(",")
              .map((a) => a.trim());
          }
        }

          skills.push({
            name: fm.name,
            version: fm.version || "0.1.0",
            description,
            agents: agents.filter((a) => a !== "_infrastructure"),
            keywords: keywords,
            examples: examples,
            useCases: useCases.length > 0 ? useCases : undefined,
          });
        }
      } catch (e) {
        console.error(`Error parsing ${skillPath}:`, e.message);
      }
    }
  }

  return skills;
}

/**
 * Generate JSONL training data
 */
function generateTrainingData(skills) {
  const lines = [];

  // Header comment line (not part of JSONL, for human reference)
  lines.push(
    '# Training data for LLM skill discovery and invocation'
  );
  lines.push(
    '# One JSON object per line: skill name, description, agents, keywords, examples'
  );
  lines.push("");

  // Sort by name for consistency
  const sorted = skills.sort((a, b) => a.name.localeCompare(b.name));

  for (const skill of sorted) {
    const obj = {
      name: skill.name,
      version: skill.version,
      description: skill.description,
      agents: skill.agents,
      keywords: skill.keywords,
      examples: skill.examples,
    };

    // Add use cases if present
    if (skill.useCases) {
      obj.useCases = skill.useCases;
    }

    lines.push(JSON.stringify(obj));
  }

  return lines.join("\n");
}

/**
 * Main
 */
async function main() {
  console.log("Generating training data...");

  const skills = collectSkills();
  const trainingData = generateTrainingData(skills);

  if (CHECK_MODE) {
    // Verify training data is current
    if (!fs.existsSync(outputPath)) {
      console.error("❌ Training data file missing. Run: npm run gen:training-data");
      process.exit(1);
    }

    const existing = fs.readFileSync(outputPath, "utf8");
    if (existing !== trainingData) {
      console.error("❌ Training data is stale. Run: npm run gen:training-data");
      process.exit(1);
    }

    console.log(`✅ Training data is current (${skills.length} skills)`);
  } else {
    // Write training data
    fs.writeFileSync(outputPath, trainingData, "utf8");
    console.log(
      `✅ Generated ${outputPath} (${skills.length} skills, LLM-ready JSONL)`
    );
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
