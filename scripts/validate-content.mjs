#!/usr/bin/env node
/**
 * Validates every content fragment against schema.json, loads the whole graph,
 * and prints the integrity report. Run before every build.
 *
 * Exit non-zero on: a schema violation, any integrity ERROR, or a placeholder node
 * in site content. Placeholders are fine in the F.5 acceptance fixture — that seed
 * genuinely names thinkers it does not describe — but a placeholder that reaches the
 * site means a reference went unwritten, and it must not ship silently.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith('.json')) out.push(p);
  }
  return out;
}

const all = walk(path.join(root, 'content'));
const siteFiles = all.filter((f) => !f.includes(`${path.sep}_acceptance${path.sep}`));

const { default: Ajv2020 } = await import('ajv/dist/2020.js');
const schema = JSON.parse(readFileSync(path.join(root, 'schema.json'), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

let bad = 0;
for (const f of all) {
  const data = JSON.parse(readFileSync(f, 'utf8'));
  if (!validate(data)) {
    bad++;
    console.error(`\nschema: FAIL ${path.relative(root, f)}`);
    for (const e of validate.errors.slice(0, 8)) {
      console.error(`   ${e.instancePath || '/'} ${e.message}`);
    }
  }
}
console.log(`schema: ${all.length - bad}/${all.length} fragments valid`);

// Load the site graph through the real loader (Node 22 strips the types natively).
const { loadGraph } = await import('../src/graph/load.ts');

const fragments = siteFiles.map((f) => ({
  name: path.relative(root, f),
  data: JSON.parse(readFileSync(f, 'utf8')),
}));
const g = loadGraph(fragments);

const bySeverity = { error: [], warning: [], info: [] };
for (const i of g.issues) bySeverity[i.severity].push(i);

for (const sev of ['error', 'warning', 'info']) {
  const list = bySeverity[sev];
  if (!list.length) continue;
  console.log(`\ngraph: ${list.length} ${sev}${list.length === 1 ? '' : 's'}`);
  const grouped = new Map();
  for (const i of list) {
    if (!grouped.has(i.code)) grouped.set(i.code, []);
    grouped.get(i.code).push(i);
  }
  for (const [code, items] of grouped) {
    console.log(`  ${code} (${items.length})`);
    for (const i of items.slice(0, 4)) console.log(`    ${i.where}: ${i.message}`);
    if (items.length > 4) console.log(`    … and ${items.length - 4} more`);
  }
}

const placeholders = g.issues.filter((i) => i.code.startsWith('placeholder-'));
console.log(
  `\ngraph: ${g.questions.size} questions, ${g.positions.size} positions, ` +
  `${g.thinkers.size} thinkers, ${g.holds.length} attributions, ` +
  `${g.equivalences.length} intersections, ${g.passages.size} passages, ${g.concepts.size} concepts`,
);

if (bad || bySeverity.error.length || placeholders.length) {
  if (placeholders.length) {
    console.error(`\nvalidate: FAIL — ${placeholders.length} placeholder node(s) in site content.`);
  }
  process.exit(1);
}
console.log('validate: ok');
