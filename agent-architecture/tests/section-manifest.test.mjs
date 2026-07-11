/**
 * Section manifest contract tests (ported from agent-architecture section-manifest-consistency).
 *
 * Guards:
 * - PASSIVE contract: no applies_when / required_for predicates in sections
 * - Generated orphan: every sections/*.md has a matching *.md.tmpl
 * - Manifest orphan: every *.md.tmpl in sections/ is listed in manifest.json
 * - Section id uniqueness
 * - Required section shape: id, file, title, trigger
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

const packageRoots = [
  root,
  path.join(root, 'agents'),
  path.join(root, 'adapters'),
  path.join(root, 'stacks'),
  path.join(root, 'domains'),
  path.join(root, 'skills'),
  path.join(root, 'tool-providers'),
].filter(fs.existsSync);

function discoverCarvedSkills() {
  const found = [];
  for (const scanRoot of packageRoots) {
    const prefix = scanRoot === root ? '' : path.relative(root, scanRoot).split(path.sep).join('/') + '/';
    fs.readdirSync(scanRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .filter((name) => fs.existsSync(path.join(scanRoot, name, 'sections', 'manifest.json')))
      .forEach((name) => found.push({ key: prefix + name, scanRoot, name }));
  }
  return found.sort((a, b) => a.key.localeCompare(b.key));
}

const carvedSkillEntries = discoverCarvedSkills();
const carvedSkills = carvedSkillEntries.map((e) => e.key);

test('at least one skill with sections/manifest.json is discovered', () => {
  assert.ok(carvedSkills.length >= 1, 'expected >=1 carved skill, found 0');
});

test('known carved skills exist', () => {
  for (const expected of ['skills/test', 'skills/security-review']) {
    assert.ok(
      carvedSkills.includes(expected),
      `${expected}/sections/manifest.json missing`,
    );
  }
});

for (const { key: skill, scanRoot, name } of carvedSkillEntries) {
  const sectionsDir = path.join(scanRoot, name, 'sections');

  test(`${skill}: manifest.json parses with required top-level shape`, () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(sectionsDir, 'manifest.json'), 'utf8'),
    );
    assert.equal(manifest.skill, name, 'manifest.skill must match directory name');
    assert.ok(Array.isArray(manifest.sections), 'manifest.sections must be an array');
    assert.ok(manifest.sections.length > 0, 'manifest.sections must be non-empty');
  });

  test(`${skill}: every section entry has required fields (id, file, title, trigger)`, () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(sectionsDir, 'manifest.json'), 'utf8'),
    );
    for (const section of manifest.sections) {
      assert.equal(typeof section.id, 'string', `section id must be string in ${skill}`);
      assert.equal(typeof section.file, 'string', `section file must be string in ${skill}`);
      assert.equal(typeof section.title, 'string', `section title must be string in ${skill}`);
      assert.equal(typeof section.trigger, 'string', `section trigger must be string in ${skill}`);
    }
  });

  test(`${skill}: manifest is PASSIVE — no applies_when or required_for (CM2 contract)`, () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(sectionsDir, 'manifest.json'), 'utf8'),
    );
    for (const section of manifest.sections) {
      assert.equal(
        Object.hasOwn(section, 'applies_when'),
        false,
        `${skill}/${section.id}: applies_when is forbidden in PASSIVE manifests`,
      );
      assert.equal(
        Object.hasOwn(section, 'required_for'),
        false,
        `${skill}/${section.id}: required_for is forbidden in PASSIVE manifests`,
      );
    }
  });

  test(`${skill}: section ids are unique`, () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(sectionsDir, 'manifest.json'), 'utf8'),
    );
    const ids = manifest.sections.map((s) => s.id);
    assert.equal(
      new Set(ids).size,
      ids.length,
      `${skill} has duplicate section ids: ${ids.join(', ')}`,
    );
  });

  test(`${skill}: no generated orphan — every sections/*.md has a matching *.md.tmpl`, () => {
    const entries = fs.readdirSync(sectionsDir);
    const sectionMds = entries.filter((f) => f.endsWith('.md') && !f.endsWith('.md.tmpl'));
    const orphans = sectionMds.filter(
      (md) => !fs.existsSync(path.join(sectionsDir, `${md}.tmpl`)),
    );
    assert.equal(
      orphans.length,
      0,
      `${skill} has generated .md files with no .md.tmpl source: ${orphans.join(', ')}`,
    );
  });

  test(`${skill}: every *.md.tmpl in sections/ is listed in manifest.json`, () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(sectionsDir, 'manifest.json'), 'utf8'),
    );
    const listed = new Set(manifest.sections.map((s) => s.file));
    const tmpls = fs.readdirSync(sectionsDir).filter((f) => f.endsWith('.md.tmpl'));
    const unlisted = tmpls.filter((t) => !listed.has(t.replace(/\.tmpl$/, '')));
    assert.equal(
      unlisted.length,
      0,
      `${skill} has unlisted section templates: ${unlisted.join(', ')}`,
    );
  });
}
