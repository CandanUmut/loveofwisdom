#!/usr/bin/env bash
# Fetch and self-host the faces the site uses.
#
# Self-hosted rather than CDN-linked because Google Fonts' standard `latin-ext`
# subset stops at U+02BA and does NOT include Latin Extended Additional
# (U+1E00–1EFF). Linking the stylesheet would serve a face with no ḥ, ṣ, ṭ or ẓ,
# and the browser would silently substitute a system font mid-word — exactly the
# credibility break we cannot afford. Requesting the unsubsetted file (which the
# css2 endpoint returns when the client does not advertise woff2 support) gives
# the complete face; `node scripts/verify-fonts.mjs` then reads its cmap and
# fails the build if any required glyph is absent.
set -uo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/fonts

fetch() { # css2_query  out_basename
  local query="$1" out="$2" url
  url=$(curl -sS "https://fonts.googleapis.com/css2?family=${query}" \
        | grep -o 'https://fonts.gstatic.com/[^)]*' | head -1)
  if [ -z "$url" ]; then echo "fetch-fonts: no file URL for ${query}" >&2; return 1; fi
  curl -sS -o "public/fonts/${out}" "$url" || return 1
  echo "  ${out} $(( $(stat -c%s "public/fonts/${out}") / 1024 )) KB  <- ${url##*/}"
}

echo "fetch-fonts: downloading unsubsetted faces"
fetch "Gentium+Book+Plus"                 gentium-book-plus-400.ttf
fetch "Gentium+Book+Plus:ital@1"          gentium-book-plus-400i.ttf
fetch "Gentium+Book+Plus:wght@700"        gentium-book-plus-700.ttf
fetch "Young+Serif"                       young-serif-400.ttf
fetch "Noto+Sans+Mono:wght@400"           noto-sans-mono-400.ttf
fetch "Amiri"                             amiri-400.ttf

echo "fetch-fonts: converting to woff2"
python3 - <<'PY'
import glob, os
from fontTools.ttLib import TTFont
for p in sorted(glob.glob('public/fonts/*.ttf')):
    out = p[:-4] + '.woff2'
    f = TTFont(p)
    f.flavor = 'woff2'
    f.save(out)
    os.remove(p)
    print(f'  {os.path.basename(out)} {os.path.getsize(out)//1024} KB')
PY

echo "fetch-fonts: verifying glyph coverage"
node scripts/verify-fonts.mjs

echo "fetch-fonts: subsetting (keeps every range the site sets; drops Cyrillic/Vietnamese/etc.)"
python3 - <<'PY'
import glob, os, subprocess
# Latin + Latin Ext A/B + IPA + modifier letters + combining marks + Greek
# (Stephanus/Greek terms) + Latin Extended Additional + general punctuation.
KEEP = "U+0000-024F,U+0259,U+02B0-02FF,U+0300-036F,U+0370-03FF,U+1E00-1EFF,U+2000-206F,U+20A0-20BF,U+2100-214F"
ARAB = "U+0000-00FF,U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F,U+2000-206F"
for p in sorted(glob.glob('public/fonts/*.woff2')):
    before = os.path.getsize(p)
    rng = ARAB if 'amiri' in p else KEEP
    subprocess.run(['pyftsubset', p, f'--unicodes={rng}', '--flavor=woff2',
                    '--layout-features=*', '--output-file=' + p + '.sub'], check=True)
    os.replace(p + '.sub', p)
    print(f'  {os.path.basename(p)} {before//1024} KB -> {os.path.getsize(p)//1024} KB')
PY

node scripts/verify-fonts.mjs
