#!/usr/bin/env node
/**
 * Resolve Wikidata Q-IDs for every thinker whose `wikidata` field is null.
 *
 * Research F.3 makes the Wikidata Q-ID the primary entity key, precisely so that this
 * project never mints its own person identifiers. The rule that follows from that is:
 * **a Q-ID is either resolved against wikidata.org or it stays null.** It is never
 * recalled from memory and never guessed, because a plausible-looking wrong Q-ID links
 * silently to the wrong person and is far worse than an absent one.
 *
 * The build environment this content was authored in had no egress to wikidata.org, so
 * every Q-ID is currently null and the UI says so on each thinker page. Run this from a
 * network-enabled machine to fill them in.
 *
 *   node scripts/resolve-wikidata.mjs           # report candidates, write nothing
 *   node scripts/resolve-wikidata.mjs --write   # write unambiguous single matches
 *
 * Ambiguous names are never auto-written: the script prints the candidates and leaves
 * the field null for a human to decide. "al-Ghazālī" alone matches several people.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const dir = path.join(root, 'content', 'thinkers');
const WRITE = process.argv.includes('--write');
const API = 'https://www.wikidata.org/w/api.php';
const UA = 'loveofwisdom-content-build/0.1 (identifier resolution; contact repo owner)';

async function search(name) {
  const url = `${API}?action=wbsearchentities&format=json&language=en&type=item&limit=5&search=${encodeURIComponent(name)}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for "${name}"`);
  const json = await res.json();
  return (json.search ?? []).map((r) => ({ id: r.id, label: r.label, description: r.description ?? '' }));
}

/** Only accept a hit that Wikidata describes as a person-shaped entity. */
const PERSONISH = /philosoph|theolog|scholar|jurist|writer|thinker|polymath|friar|monk|saint|logician/i;

let resolved = 0, ambiguous = 0, missing = 0;

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const p = path.join(dir, file);
  const data = JSON.parse(readFileSync(p, 'utf8'));
  let touched = false;

  for (const t of data.thinkers ?? []) {
    if (t.wikidata) continue;
    let hits;
    try {
      hits = await search(t.name);
    } catch (e) {
      console.error(`  ! ${t.id}: ${e.message}`);
      continue;
    }
    await new Promise((r) => setTimeout(r, 250)); // be a good citizen

    const strong = hits.filter((h) => PERSONISH.test(h.description));
    if (strong.length === 1) {
      console.log(`  ✓ ${t.id.padEnd(18)} ${strong[0].id.padEnd(10)} ${strong[0].label} — ${strong[0].description}`);
      if (WRITE) { t.wikidata = strong[0].id; touched = true; }
      resolved++;
    } else if (strong.length > 1) {
      console.log(`  ? ${t.id.padEnd(18)} ambiguous, left null. Candidates:`);
      for (const h of strong) console.log(`      ${h.id.padEnd(10)} ${h.label} — ${h.description}`);
      ambiguous++;
    } else {
      console.log(`  – ${t.id.padEnd(18)} no person-shaped match for "${t.name}", left null`);
      missing++;
    }
  }

  if (touched) {
    writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
    console.log(`  wrote ${path.relative(root, p)}`);
  }
}

console.log(
  `\n${resolved} unambiguous, ${ambiguous} ambiguous (left null for a human), ${missing} unmatched.` +
  (WRITE ? '' : '\nDry run — pass --write to save the unambiguous matches.'),
);
