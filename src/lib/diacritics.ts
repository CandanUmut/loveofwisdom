/**
 * Research D, transliteration policy: store the fully diacriticized canonical form
 * (ḥusn wa qubḥ, ʿaql, mokṣa) and derive the diacritic-light display form at render
 * time. Never store the light form — it is lossy, and specialists need the canonical.
 *
 * Two things this must not do:
 *
 *  1. Strip Turkish, French, German or Spanish diacritics. "Gözübüyükoğlu" is not a
 *     transliteration and must survive intact — this site is Turkish-first-class.
 *     Those letters are preserved explicitly; everything else in Latin Extended is
 *     decomposed and stripped.
 *  2. Touch non-Latin scripts. Arabic ḥarakāt (U+064B–0652) and Devanagari vowel
 *     signs are outside the combining range this removes, so Arabic and Devanagari
 *     pass through untouched.
 */

/** Letters that belong to living Latin-script orthographies, not to transliteration. */
const PRESERVE = new Set<number>([
  // Latin-1 Supplement letters: à á â ã ä å ç è é ê ë ì í î ï ñ ò ó ô õ ö ù ú û ü ý ÿ and capitals
  ...range(0x00c0, 0x00ff),
  0x011e, 0x011f, // Ğ ğ
  0x015e, 0x015f, // Ş ş
  0x0130, 0x0131, // İ ı
  0x0152, 0x0153, // Œ œ
  0x0178,         // Ÿ
]);

function range(a: number, b: number): number[] {
  const out: number[] = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

/** ʿayn, hamza and their lookalikes. These vanish entirely in the light form: ʿaql → aql. */
const DROP = new Set<number>([
  0x02be, 0x02bf, // ʾ ʿ modifier letters (the correct encoding)
  0x02bb, 0x02bc, // ʻ ʼ (occasionally used for the same job)
  0x2018, 0x2019, // ‘ ’ only when standing in for ʿayn — see caveat below
]);

/**
 * Reduce a canonical transliteration to its diacritic-light display form.
 *
 * Caveat on U+2018/U+2019: dropping curly quotes would eat real quotation marks, so
 * they are only dropped when they sit directly between two letters (aʼla → ala) and
 * are otherwise left alone.
 */
export function diacriticLight(input: string): string {
  const chars = [...input];
  let out = '';
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const cp = ch.codePointAt(0)!;

    if (DROP.has(cp)) {
      if (cp === 0x2018 || cp === 0x2019) {
        const prev = chars[i - 1];
        const next = chars[i + 1];
        if (prev && next && /\p{L}/u.test(prev) && /\p{L}/u.test(next)) continue;
        out += ch;
        continue;
      }
      continue;
    }

    if (PRESERVE.has(cp) || cp < 0x00c0) { out += ch; continue; }

    // Everything else in Latin: decompose and drop combining marks.
    // ḥ → h + U+0323 → h.  ā → a + U+0304 → a.  ś → s + U+0301 → s.
    const stripped = ch.normalize('NFD').replace(/[̀-ͯ]/gu, '');
    out += stripped.normalize('NFC');
  }
  return out;
}

export type DiacriticMode = 'light' | 'full';

/** Apply the current display mode to a canonical string. */
export function applyDiacritics(text: string, mode: DiacriticMode): string {
  return mode === 'full' ? text : diacriticLight(text);
}
