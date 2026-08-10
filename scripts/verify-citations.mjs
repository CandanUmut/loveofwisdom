#!/usr/bin/env node
/**
 * Citation verification pass.
 *
 * Re-fetches every URL in the content and reports what happened. This exists because
 * the failure mode of an LLM filling in humanities citations is fabricating URLs that
 * look right and resolve to nothing, and the only defence that works is mechanical:
 * fetch them all, again, after writing.
 *
 * What it checks, per URL:
 *   1. It resolves — a 2xx after redirects.
 *   2. It is the page the citation says it is — the page's own title is compared with
 *      the distinctive words of the citation. A URL that resolves to the encyclopedia's
 *      404 page, or to a different entry, fails here rather than passing as "reachable".
 *
 * It also reports every claim that carries no URL at all, so the gaps are counted
 * rather than assumed to be zero.
 *
 *   node scripts/verify-citations.mjs            # verify, print a report
 *   node scripts/verify-citations.mjs --strict   # exit non-zero if anything failed
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const STRICT = process.argv.includes('--strict');
const UA = 'loveofwisdom-citation-check/0.1';

function walk(dir) {
  return readdirSync(dir).flatMap((e) => {
    const p = path.join(dir, e);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.json') ? [p] : [];
  });
}

/** Every {url, citation, where} in the content, wherever it is nested. */
function collect() {
  const out = [];
  for (const file of walk(path.join(root, 'content'))) {
    if (file.includes('_acceptance')) continue;
    const rel = path.relative(root, file);
    const seen = new Set();
    const visit = (node, trail) => {
      if (Array.isArray(node)) return node.forEach((n, i) => visit(n, `${trail}[${i}]`));
      if (!node || typeof node !== 'object') return;
      if (typeof node.url === 'string' && node.url.startsWith('http')) {
        const key = `${node.url}|${node.citation ?? ''}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ url: node.url, citation: node.citation ?? '', where: `${rel} ${trail}` });
        }
      }
      for (const [k, v] of Object.entries(node)) visit(v, trail ? `${trail}.${k}` : k);
    };
    visit(JSON.parse(readFileSync(file, 'utf8')), '');
  }
  return out;
}

function fetchPage(url) {
  try {
    const out = execFileSync('curl', [
      '-sS', '-L', '--max-time', '35', '-A', UA,
      '-w', '\\n@@STATUS@@%{http_code}', url,
    ], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    const i = out.lastIndexOf('\n@@STATUS@@');
    return { status: Number(out.slice(i + 11).trim()), body: out.slice(0, i) };
  } catch (e) {
    return { status: 0, body: '', error: String(e.message).split('\n')[0] };
  }
}

const titleOf = (html) => {
  const m = /<title[^>]*>([\s\S]{0,300}?)<\/title>/i.exec(html);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
};

const STOP = new Set(['the', 'of', 'and', 'in', 'on', 'a', 'an', 'stanford', 'internet',
  'encyclopedia', 'philosophy', 'entry', 'wikidata', 'cc0', 'via', 'edition']);

/** Do the citation and the page title share a distinctive word? */
function titleAgrees(citation, title) {
  const words = (s) => new Set(
    s.normalize('NFD').replace(/[̀-ͯʿʾ']/g, '')
      .toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w)),
  );
  const c = words(citation), t = words(title);
  if (!c.size || !t.size) return false;
  for (const w of c) if (t.has(w)) return true;
  return false;
}

const refs = collect();
console.log(`Checking ${refs.length} cited URLs\n`);

const results = [];
for (const r of refs) {
  const { status, body, error } = fetchPage(r.url);
  const title = titleOf(body);
  const ok2xx = status >= 200 && status < 300;
  const agrees = ok2xx && titleAgrees(r.citation, title);
  // A Wikidata entity page titles itself with the label, which the citation gives as a
  // bare Q-ID, so title agreement is not meaningful there; resolution is the check.
  const isWikidata = /wikidata\.org/.test(r.url);
  const verdict = !ok2xx ? 'UNREACHABLE' : (agrees || isWikidata) ? 'ok' : 'TITLE-MISMATCH';
  results.push({ ...r, status, title, verdict, error });
  const mark = verdict === 'ok' ? '  ✓' : '  ✗';
  console.log(`${mark} ${String(status).padEnd(4)} ${r.url}`);
  if (verdict !== 'ok') {
    console.log(`       cited as: ${r.citation.slice(0, 100)}`);
    console.log(`       page title: ${title.slice(0, 100) || '(none)'}${error ? ' — ' + error : ''}`);
    console.log(`       at: ${r.where}`);
  }
}

const failed = results.filter((r) => r.verdict !== 'ok');

// Count claims with no URL, so the gap is reported rather than assumed away.
let unsourced = 0;
for (const file of walk(path.join(root, 'content'))) {
  if (file.includes('_acceptance')) continue;
  const d = JSON.parse(readFileSync(file, 'utf8'));
  for (const h of d.holds ?? []) if (!(h.sources ?? []).some((s) => s.url) && !(h.sourcePassages ?? []).length) unsourced++;
}

console.log(`\n${results.length - failed.length}/${results.length} verified, ${failed.length} failed.`);
console.log(`${unsourced} attribution(s) carry neither a source passage nor a URL.`);

writeFileSync(
  path.join(root, 'citation-check.json'),
  JSON.stringify({ checkedAt: new Date().toISOString(), total: results.length, failed: failed.length, results }, null, 2) + '\n',
);
console.log('Report written to citation-check.json');

if (STRICT && failed.length) process.exit(1);
