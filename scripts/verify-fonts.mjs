#!/usr/bin/env node
/**
 * Verify, rather than assume, that every face we ship actually contains the
 * glyphs this site sets: transliteration diacritics (ḥ ḍ ṣ ṭ ẓ ṇ ṛ ṃ ś ā ī ū),
 * the modifier letters ʿ (U+02BF) and ʾ (U+02BE), and Arabic.
 *
 * A display face that drops a ḥ, or renders ʿayn as a stray quote, breaks the
 * product's credibility — so this runs against the real woff2 binaries in
 * public/fonts and reads their cmap. It is wired into `npm run validate`.
 *
 * Note for maintainers: Google Fonts' css2 `text=` API echoes back the codepoints
 * you asked for in `unicode-range` whether or not the font has them, so that
 * endpoint cannot be used as a coverage probe. This script reads the cmap.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const fontDir = path.join(root, 'public', 'fonts');

const ASCII = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,;:!?()[]{}\'"-–—/&%'];
const TURKISH = [...'İıĞğŞşÇçÖöÜü'];
/** ʿayn and hamza as MODIFIER LETTERS (U+02BF, U+02BE) — not apostrophes. Non-negotiable. */
const MODIFIERS = [...'ʿʾ'];
/** Transliteration repertoire that appears in *headings* as well as body text. */
const TRANSLIT_CORE = [...'ḥḍṣṭẓṇṛṃāīūēōśʾʿ'];
/** The long tail that only ever appears in running text and apparatus. */
const TRANSLIT_TAIL = [...'ḏṯšžčřâîû'];

/**
 * Codepoints the site actually sets, by role.
 * Deliberately excluded: U+1E33 ḳ (no term on the site uses it) and U+2192 → (drawn
 * in CSS, never set as a glyph) — both are absent from nearly every display face and
 * requiring them would rule out every characterful option for no benefit.
 */
export const REQUIRED = {
  body:    [...ASCII, ...TURKISH, ...MODIFIERS, ...TRANSLIT_CORE, ...TRANSLIT_TAIL, ...'’‘“”†‡§¶…'],
  display: [...ASCII, ...TURKISH, ...MODIFIERS, ...TRANSLIT_CORE, ...'’‘“”'],
  mono:    [...ASCII, ...TURKISH, ...MODIFIERS, ...TRANSLIT_CORE, ...'†‡§'],
  arabic:  [...'ابتحخدرسشعقكلمنهويأإءةَُِّْ'],
};

const ROLES = {
  'gentium-book-plus': 'body',
  'young-serif': 'display',
  'noto-sans-mono': 'mono',
  'amiri': 'arabic',
};

/**
 * Is a cmap reader available? Reading a woff2 cmap needs brotli plus a table parser,
 * so this shells out to fontTools. Where it is missing the check reports that it was
 * skipped rather than passing silently — and in CI, where STRICT_FONTS=1, a skip fails
 * the build, so the guarantee is never quietly lost.
 */
function cmapReaderAvailable() {
  try {
    execFileSync('python3', ['-c', 'import fontTools'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function cmapOf(file) {
  const py = `
import sys
from fontTools.ttLib import TTFont
f = TTFont(sys.argv[1], fontNumber=0, lazy=True)
cps = set()
for t in f['cmap'].tables:
    cps |= set(t.cmap.keys())
print(' '.join(str(c) for c in sorted(cps)))
`;
  const out = execFileSync('python3', ['-c', py, file], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return new Set(out.trim().split(/\s+/).filter(Boolean).map(Number));
}

function main() {
  if (!existsSync(fontDir)) {
    console.error(`fonts: ${fontDir} does not exist — run scripts/fetch-fonts.sh first.`);
    process.exit(1);
  }
  const files = readdirSync(fontDir).filter((f) => /\.(woff2|ttf|otf)$/.test(f));
  if (!files.length) {
    console.error('fonts: no font files found in public/fonts.');
    process.exit(1);
  }

  const strict = process.env.STRICT_FONTS === '1';
  if (!cmapReaderAvailable()) {
    const msg = 'fonts: SKIPPED — python3 with fontTools is needed to read the cmaps. ' +
      'Install it with `pip install fonttools brotli`.';
    if (strict) { console.error(msg + ' STRICT_FONTS=1, so this is a failure.'); process.exit(1); }
    console.warn(msg);
    return;
  }
  let failed = false;
  const byFamily = new Map();
  for (const f of files) {
    const family = Object.keys(ROLES).find((k) => f.startsWith(k));
    if (!family) { console.log(`fonts: ${f} — no declared role, skipped`); continue; }
    if (!byFamily.has(family)) byFamily.set(family, []);
    byFamily.get(family).push(f);
  }
  for (const [family, fs] of byFamily) {
    const need = REQUIRED[ROLES[family]].map((c) => c.codePointAt(0));
    for (const f of fs) {
      const have = cmapOf(path.join(fontDir, f));
      const missing = need.filter((c) => !have.has(c));
      if (missing.length) {
        failed = true;
        console.error(
          `fonts: FAIL ${f} is missing ${missing.length} required glyph(s): ` +
          missing.map((c) => `U+${c.toString(16).toUpperCase().padStart(4, '0')} ${String.fromCodePoint(c)}`).join(', '),
        );
      } else {
        console.log(`fonts: ok   ${f} (${have.size} glyphs, all ${need.length} required present)`);
      }
    }
  }
  if (failed) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
