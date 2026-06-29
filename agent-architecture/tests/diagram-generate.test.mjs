import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

test("diagram-generate: skill file exists", (t) => {
  const skillPath = path.join(rootDir, "diagram-generate", "SKILL.md.tmpl");
  assert(fs.existsSync(skillPath), "diagram-generate/SKILL.md.tmpl should exist");
});

test("diagram-generate: has required frontmatter", (t) => {
  const skillPath = path.join(rootDir, "diagram-generate", "SKILL.md.tmpl");
  const content = fs.readFileSync(skillPath, "utf8");

  assert(
    content.includes("name: diagram-generate"),
    "Should have name: diagram-generate"
  );
  assert(
    content.includes("version:"),
    "Should have version field"
  );
  assert(
    content.includes("description:"),
    "Should have description"
  );
  assert(
    content.includes("agents:"),
    "Should list agents"
  );
  assert(
    content.includes("metadata:"),
    "Should have metadata section"
  );
});

test("diagram-generate: declares agent dependencies", (t) => {
  const skillPath = path.join(rootDir, "diagram-generate", "SKILL.md.tmpl");
  const content = fs.readFileSync(skillPath, "utf8");

  // Should be available to design-agent, diagram-agent, spec-agent, orchestrate
  assert(
    content.includes("diagram-agent"),
    "Should declare diagram-agent"
  );
});

test("diagram-generate: declares drawio-mcp dependency", (t) => {
  const skillPath = path.join(rootDir, "diagram-generate", "SKILL.md.tmpl");
  const content = fs.readFileSync(skillPath, "utf8");

  assert(
    content.includes("drawio-mcp"),
    "Should declare drawio-mcp dependency"
  );
});

test("diagram-generate: has mcp-egress policy gate", (t) => {
  const skillPath = path.join(rootDir, "diagram-generate", "SKILL.md.tmpl");
  const content = fs.readFileSync(skillPath, "utf8");

  assert(
    content.includes("mcp-egress"),
    "Should have mcp-egress policy gate"
  );
});

test("diagram-generate: has comprehensive checklist", (t) => {
  const skillPath = path.join(rootDir, "diagram-generate", "SKILL.md.tmpl");
  const content = fs.readFileSync(skillPath, "utf8");

  // Should have structured checklist with checkboxes
  const checklistCount = (content.match(/\[ \]/g) || []).length;
  assert(checklistCount >= 15, `Should have comprehensive checklist (found ${checklistCount})`);
});

test("diagram-generate: documents diagram types", (t) => {
  const skillPath = path.join(rootDir, "diagram-generate", "SKILL.md.tmpl");
  const content = fs.readFileSync(skillPath, "utf8");

  const types = [
    "flowchart",
    "architecture",
    "sequence",
    "ER",
    "class",
    "state",
    "mind-map",
  ];

  for (const type of types) {
    assert(
      content.includes(type),
      `Should document ${type} diagram type`
    );
  }
});

test("diagram-generate: includes process flow diagram", (t) => {
  const skillPath = path.join(rootDir, "diagram-generate", "SKILL.md.tmpl");
  const content = fs.readFileSync(skillPath, "utf8");

  assert(
    content.includes("digraph"),
    "Should include process flow visualization"
  );
});

test("diagram-generate: anti-patterns section present", (t) => {
  const skillPath = path.join(rootDir, "diagram-generate", "SKILL.md.tmpl");
  const content = fs.readFileSync(skillPath, "utf8");

  assert(
    content.includes("Anti-Patterns"),
    "Should document anti-patterns to avoid"
  );
});

test("diagram-generate: policy requirements documented", (t) => {
  const skillPath = path.join(rootDir, "diagram-generate", "SKILL.md.tmpl");
  const content = fs.readFileSync(skillPath, "utf8");

  assert(
    content.includes("Policy"),
    "Should document policy requirements"
  );
});

test("diagram-generate: no hardcoded secrets or credentials", (t) => {
  const skillPath = path.join(rootDir, "diagram-generate", "SKILL.md.tmpl");
  const content = fs.readFileSync(skillPath, "utf8");

  assert(
    !content.includes("sk_") && !content.includes("ghp_"),
    "Should not contain hardcoded secrets"
  );
  assert(
    !content.includes("password=") && !content.includes("token="),
    "Should not contain hardcoded credentials"
  );
});

test("diagram-generate: has working examples", (t) => {
  const skillPath = path.join(rootDir, "diagram-generate", "SKILL.md.tmpl");
  const content = fs.readFileSync(skillPath, "utf8");

  // Should have at least one worked example section
  assert(
    content.includes("Example"),
    "Should include worked examples"
  );
});

test("diagram-generate: proper Markdown formatting", (t) => {
  const skillPath = path.join(rootDir, "diagram-generate", "SKILL.md.tmpl");
  const content = fs.readFileSync(skillPath, "utf8");

  // Check for basic Markdown structure
  assert(
    content.includes("# "),
    "Should have Markdown headings"
  );
  assert(
    content.includes("- "),
    "Should have Markdown lists"
  );
  assert(
    content.includes("`"),
    "Should have code formatting"
  );
});
