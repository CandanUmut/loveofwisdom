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
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const dir = path.join(root, 'content', 'thinkers');
const WRITE = process.argv.includes('--write');
const VERIFY = process.argv.includes('--verify');
const API = 'https://www.wikidata.org/w/api.php';
const UA = 'loveofwisdom-content-build/0.1 (identifier resolution; contact repo owner)';

/**
 * Shelled out to curl rather than using `fetch`: Node's built-in fetch does not honour
 * HTTPS_PROXY, so in a proxied environment every request 403s at the gateway. curl does
 * honour it, and this script only makes a couple of dozen calls.
 */
async function search(name) {
  const url = `${API}?action=wbsearchentities&format=json&language=en&type=item&limit=7&search=${encodeURIComponent(name)}`;
  const body = execFileSync('curl', ['-sS', '-L', '--max-time', '25', '-A', UA, '-H', 'Accept: application/json', url],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  let json;
  try { json = JSON.parse(body); } catch { throw new Error(`non-JSON response for "${name}"`); }
  if (json.error) throw new Error(`${json.error.code} for "${name}"`);
  return (json.search ?? []).map((r) => ({ id: r.id, label: r.label, description: r.description ?? '' }));
}

/**
 * Only accept a hit Wikidata describes as a person.
 *
 * Searching a thinker's name mostly returns *articles about them* — "William of Ockham
 * on Future Contingency", "Ibn-Rushd (Averroes). The Incoherence of the Incoherence" —
 * so publications are excluded first, and what remains must both read as a person and
 * carry a label that actually looks like the name searched for. Without the label check
 * a search for "Immanuel Kant" happily offers Gustav Teichmüller.
 */
const PERSONISH = /philosoph|theolog|scholar|jurist|writer|thinker|polymath|friar|monk|saint|logician|reformer|priest|politician|mystic|sufi|imam|physician|astronom|mathematic/i;
const PUBLICATION = /article|journal|book|chapter|edition|volume|proceedings|thesis|paper|translat|review|encyclop|published/i;

/** Label, description and instance-of for an entity — used to verify a pinned Q-ID. */
async function entityInfo(qid) {
  const body = execFileSync('curl', ['-sS', '-L', '--max-time', '25', '-A', UA,
    `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const e = JSON.parse(body).entities?.[qid];
  if (!e) throw new Error(`${qid} does not resolve`);
  return {
    label: e.labels?.en?.value,
    description: e.descriptions?.en?.value ?? '',
    instanceOf: (e.claims?.P31 ?? []).map((c) => c.mainsnak?.datavalue?.value?.id).filter(Boolean),
  };
}

/** Birth and death years from the entity's own claims. Precision below year is dropped. */
async function entityDates(qid) {
  const body = execFileSync('curl', ['-sS', '-L', '--max-time', '25', '-A', UA,
    `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const claims = JSON.parse(body).entities?.[qid]?.claims ?? {};
  const year = (prop) => {
    const v = claims[prop]?.[0]?.mainsnak?.datavalue?.value?.time;
    if (!v) return undefined;
    const m = /^([+-])(\d{4})/.exec(v);
    if (!m) return undefined;
    const n = parseInt(m[2], 10);
    return m[1] === '-' ? `${n} BCE` : String(n);
  };
  return { born: year('P569'), died: year('P570') };
}

/** Does the candidate's label plausibly name the person we searched for? */
function labelMatches(label, name) {
  const strip = (x) => x.normalize('NFD').replace(/[\u0300-\u036f\u02bf\u02be]/g, '')
    // Apostrophes are removed, not turned into spaces: "al-Ash'ari" is one word, and
    // splitting it into "ash" + "ari" makes it match nothing.
    .replace(/['\u2019\u02bc\u02bb]/g, '')
    .toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const l = strip(label), n = strip(name);
  if (l === n) return true;
  // Compare distinctive words. A strict subset rule is too tight for names that carry
  // extra elements on one side only — Wikidata's "Abd al-Jabbar ibn Ahmad" against our
  // "al-Qāḍī ʿAbd al-Jabbār" share two words and differ in one each way. Two shared
  // distinctive words is enough to identify; one is not ("Liu Xunzimo" vs "Xunzi").
  const skip = new Set(['al', 'ibn', 'abu', 'of', 'the', 'john', 'st', 'saint', 'bin']);
  const lw = [...new Set(l.split(' ').filter((w) => w.length > 2 && !skip.has(w)))];
  const nw = [...new Set(n.split(' ').filter((w) => w.length > 2 && !skip.has(w)))];
  if (!lw.length || !nw.length) return false;
  const shared = lw.filter((w) => nw.includes(w));
  if (shared.length >= 2) return true;
  return shared.length === 1 && Math.min(lw.length, nw.length) === 1;
}

let resolved = 0, ambiguous = 0, missing = 0, verified = 0, badPins = 0;

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const p = path.join(dir, file);
  const data = JSON.parse(readFileSync(p, 'utf8'));
  let touched = false;

  for (const t of data.thinkers ?? []) {
    if (t.wikidata) {
      if (!VERIFY) continue;
      try {
        const e = await entityInfo(t.wikidata);
        const names = [t.name, ...(t.searchAliases ?? [])];
        const human = e.instanceOf.includes('Q5');
        const named = names.some((n) => labelMatches(e.label ?? '', n));
        if (human && named) { console.log(`  ✓ ${t.id.padEnd(18)} ${t.wikidata.padEnd(11)} ${e.label} — verified human, label matches`); verified++; }
        else { console.error(`  ✗ ${t.id.padEnd(18)} ${t.wikidata} FAILED: label="${e.label}" human=${human} nameMatch=${named}`); badPins++; }
      } catch (err) { console.error(`  ! ${t.id}: ${err.message}`); badPins++; }
      await new Promise((r) => setTimeout(r, 200));
      continue;
    }
    let hits;
    try {
      // Try the canonical name, then a diacritic-light form, then without any
      // parenthetical — "Ibn Rushd (Averroes)" finds nothing; "Ibn Rushd" does.
      const variants = [...new Set([
        ...(t.searchAliases ?? []),
        t.name,
        t.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u02bf\u02be]/g, ''),
        t.name.replace(/\s*\([^)]*\)/, '').trim(),
      ])];
      // Accumulate across every variant rather than stopping at the first that returns
      // anything: a variant can return results that are all wrong, and breaking there
      // means never trying the spelling that would have worked.
      const byId = new Map();
      for (const v of variants) {
        for (const h of await search(v)) if (!byId.has(h.id)) byId.set(h.id, h);
        await new Promise((r) => setTimeout(r, 200));
      }
      hits = [...byId.values()];
    } catch (e) {
      console.error(`  ! ${t.id}: ${e.message}`);
      continue;
    }
    await new Promise((r) => setTimeout(r, 250)); // be a good citizen

    // Check the label against every name we searched under, not only the canonical one:
    // the alias exists precisely because the canonical form does not match the authority
    // file's spelling, so testing the canonical form again throws the alias away.
    const names = [t.name, ...(t.searchAliases ?? [])];
    const strong = hits.filter((h) =>
      PERSONISH.test(h.description) && !PUBLICATION.test(h.description)
      && names.some((n) => labelMatches(h.label, n)));
    if (strong.length === 1) {
      console.log(`  ✓ ${t.id.padEnd(18)} ${strong[0].id.padEnd(10)} ${strong[0].label} — ${strong[0].description}`);
      if (WRITE) {
        t.wikidata = strong[0].id;
        // Wikidata is CC0, so dates can be taken as well as linked. Only filled where
        // content has none — an authored hijri/CE double date is better than a bare year
        // and is never overwritten.
        const dates = await entityDates(strong[0].id);
        if (!t.born && dates.born) t.born = dates.born;
        if (!t.died && dates.died) t.died = `d. ${dates.died}`;
        if (dates.born || dates.died) {
          t.sources = [
            ...(t.sources ?? []).filter((x) => !/^Wikidata /.test(x.citation)),
            { citation: `Wikidata ${strong[0].id} (CC0)`, kind: 'reference-work',
              url: `https://www.wikidata.org/wiki/${strong[0].id}`, urlVerified: true },
          ];
        }
        touched = true;
      }
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
  `\n${resolved} unambiguous, ${ambiguous} ambiguous (left null for a human), ${missing} unmatched` +
  (VERIFY ? `, ${verified} pinned identifiers verified, ${badPins} failed` : '') + '.' +
  (WRITE ? '' : '\nDry run — pass --write to save the unambiguous matches.'),
);
if (badPins > 0) process.exit(1);
