import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..", "skills");

test("migration-sqlserver-assess: RED phase", () => {
  const skillPath = path.join(rootDir, "migration-sqlserver-assess", "SKILL.md.tmpl");
  assert.ok(fs.existsSync(skillPath), "Skill file must exist");

  const content = fs.readFileSync(skillPath, "utf8");

  // Frontmatter checks
  assert.match(content, /^---\n/, "Must have YAML frontmatter");
  assert.match(content, /name:\s*migration-sqlserver-assess/, "Must declare name");
  assert.match(content, /version:\s*/, "Must declare version");
  assert.match(content, /description:\s*/, "Must declare description");
  assert.match(
    content,
    /agents:\s*\[.*migration-engineer.*\]/,
    "Must declare migration-engineer agent"
  );

  // Metadata checks
  assert.match(
    content,
    /metadata:/,
    "Must include metadata section"
  );
  assert.match(
    content,
    /category:\s*["']?infrastructure["']?/,
    "Must declare category"
  );
  assert.match(
    content,
    /domain:\s*["']?data-migration["']?/,
    "Must declare domain"
  );
  assert.match(
    content,
    /approval-gates:/,
    "Must declare approval gates (mcp-egress)"
  );

  // Checklist - assessment must ask about SQL Server specifics
  assert.match(
    content,
    /(?:SQL Server|sql server|version)/i,
    "Must address SQL Server version/setup"
  );
  assert.match(
    content,
    /(?:schema|table|database)/i,
    "Must address schema/table analysis"
  );
  assert.match(
    content,
    /(?:data volume|size|rows)/i,
    "Must address data size/volume"
  );
  assert.match(
    content,
    /(?:incompatibl|feature|CLR|XML)/i,
    "Must identify incompatibilities"
  );
  assert.match(
    content,
    /(?:assessment|report|output)/i,
    "Must produce assessment report"
  );

  // Examples - must show invocation
  assert.match(
    content,
    /\/migration-engineer/,
    "Must reference /migration-engineer agent"
  );
  assert.match(
    content,
    /Postgres|PostgreSQL/i,
    "Must mention PostgreSQL migration context"
  );
});

test("migration-sqlserver-schema: RED phase", () => {
  const skillPath = path.join(rootDir, "migration-sqlserver-schema", "SKILL.md.tmpl");
  assert.ok(fs.existsSync(skillPath), "Skill file must exist");

  const content = fs.readFileSync(skillPath, "utf8");
  assert.match(content, /name:\s*migration-sqlserver-schema/, "Must declare name");
  assert.match(content, /T-SQL|DDL|schema/i, "Must handle schema conversion");
});

test("migration-sqlserver-data: RED phase", () => {
  const skillPath = path.join(rootDir, "migration-sqlserver-data", "SKILL.md.tmpl");
  assert.ok(fs.existsSync(skillPath), "Skill file must exist");

  const content = fs.readFileSync(skillPath, "utf8");
  assert.match(content, /name:\s*migration-sqlserver-data/, "Must declare name");
  assert.match(content, /data.*migration|migrate.*data/i, "Must address data migration");
});

test("migration-sqlserver-test: RED phase", () => {
  const skillPath = path.join(rootDir, "migration-sqlserver-test", "SKILL.md.tmpl");
  assert.ok(fs.existsSync(skillPath), "Skill file must exist");

  const content = fs.readFileSync(skillPath, "utf8");
  assert.match(content, /name:\s*migration-sqlserver-test/, "Must declare name");
  assert.match(content, /validat|test|verify/i, "Must validate/test migrated data");
});

test("migration-sqlserver-perf: RED phase", () => {
  const skillPath = path.join(rootDir, "migration-sqlserver-perf", "SKILL.md.tmpl");
  assert.ok(fs.existsSync(skillPath), "Skill file must exist");

  const content = fs.readFileSync(skillPath, "utf8");
  assert.match(content, /name:\s*migration-sqlserver-perf/, "Must declare name");
  assert.match(content, /performance|perf|optim|tuning/i, "Must address performance");
});

test("migration-engineer agent: RED phase", () => {
  const agentPath = path.join(__dirname, "..", "agents", "migration-engineer", "SKILL.md.tmpl");
  assert.ok(fs.existsSync(agentPath), "Agent file must exist");

  const content = fs.readFileSync(agentPath, "utf8");
  assert.match(content, /name:\s*migration-engineer/, "Must declare name");
  assert.match(
    content,
    /agents:\s*\[.*_infrastructure.*\]/,
    "Must declare _infrastructure agent type"
  );
  assert.match(
    content,
    /optional-skills:/,
    "Must list optional skills"
  );
  assert.match(
    content,
    /migration-sqlserver-assess/,
    "Must reference migration-sqlserver-assess"
  );
});
