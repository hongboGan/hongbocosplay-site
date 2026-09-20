// Download the display serif + body sans as variable woff2 into public/fonts
// and emit a local @font-face stylesheet. No external font CDN at runtime.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const OUT_DIR = path.resolve('public/fonts');
const OUT_CSS = path.resolve('src/styles/fonts.css');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(OUT_CSS), { recursive: true });

// Variable ranges: one file per family covering every weight the site uses.
const SPEC = [
  { family: 'Fraunces', range: '500..600', file: 'fraunces-var.woff2' },
  { family: 'Manrope', range: '400..600', file: 'manrope-var.woff2' },
];

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function get(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

const faces = [];

for (const spec of SPEC) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${spec.family}:wght@${spec.range}&display=swap`;
  const css = await (await get(cssUrl)).text();

  // Keep only the plain `latin` subset block.
  const blocks = css.split('@font-face').slice(1);
  let picked = null;
  for (const block of blocks) {
    const subset = /\/\*\s*([\w-]+)\s*\*\//.exec(block);
    const url = /url\((https:\/\/[^)]+\.woff2)\)/.exec(block);
    if (!url) continue;
    if (subset && subset[1] !== 'latin') continue;
    picked = url[1];
    break;
  }
  if (!picked) throw new Error(`no latin woff2 in stylesheet for ${spec.family}`);

  const dest = path.join(OUT_DIR, spec.file);
  const buf = Buffer.from(await (await get(picked)).arrayBuffer());
  fs.writeFileSync(dest, buf);

  faces.push({
    family: spec.family,
    range: spec.range,
    file: spec.file,
    bytes: buf.length,
    sha1: crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12),
  });
}

const css = faces
  .map(
    (f) => `@font-face {
  font-family: '${f.family}';
  font-style: normal;
  font-weight: ${f.range.replace('..', ' ')};
  font-display: swap;
  src: url('/fonts/${f.file}') format('woff2-variations');
}`
  )
  .join('\n\n');

fs.writeFileSync(OUT_CSS, css + '\n');

console.log(JSON.stringify({ faces, totalKB: Math.round(faces.reduce((s, f) => s + f.bytes, 0) / 1024), css: OUT_CSS }, null, 2));
