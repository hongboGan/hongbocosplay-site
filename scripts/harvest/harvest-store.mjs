// Offline parser for locally cached Alibaba store listing pages.
// Pages were saved as _tmp_pages/p<N>.html; each embeds a percent-encoded
// JSON blob containing a "productList" array.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/Administrator/AccioWork/2026-09-16-17-15-24-640-e0833c0c';
const PAGES = path.join(ROOT, '_tmp_pages');
const OUT = path.join(ROOT, '_harvest', 'all-products.json');

function percentToBytes(s) {
  const out = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '%' && /^[0-9A-Fa-f]{2}$/.test(s.substr(i + 1, 2))) {
      out.push(parseInt(s.substr(i + 1, 2), 16));
      i += 2;
    } else {
      out.push(s.charCodeAt(i) & 0xff);
    }
  }
  return Buffer.from(out).toString('utf8');
}

// Slice the balanced [...] that follows the first `"productList":` marker.
function extractArray(decoded, marker) {
  const at = decoded.indexOf(marker);
  if (at < 0) return null;
  const start = decoded.indexOf('[', at);
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < decoded.length; i++) {
    const c = decoded[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '[') depth++;
    else if (c === ']') {
      depth--;
      if (depth === 0) return decoded.slice(start, i + 1);
    }
  }
  return null;
}

const files = fs
  .readdirSync(PAGES)
  .filter((f) => /^p\d+\.html$/.test(f))
  .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

const byId = new Map();
let pagesParsed = 0;

for (const f of files) {
  const raw = fs.readFileSync(path.join(PAGES, f), 'utf8');
  const markerAt = raw.indexOf('productList');
  if (markerAt < 0) continue;

  const chunk = raw.slice(Math.max(0, markerAt - 500), markerAt + 900000);
  let decoded;
  try {
    decoded = decodeURIComponent(chunk);
  } catch {
    decoded = percentToBytes(chunk);
  }

  const arrText = extractArray(decoded, '"productList":') || extractArray(decoded, 'productList');
  if (!arrText) continue;

  let list;
  try {
    list = JSON.parse(arrText);
  } catch {
    continue;
  }
  if (!Array.isArray(list)) continue;
  pagesParsed++;

  for (const p of list) {
    if (!p || p.id == null || !p.subject) continue;
    const id = String(p.id);
    if (byId.has(id)) continue;

    const img = p.imageUrls && p.imageUrls.original ? String(p.imageUrls.original) : null;
    const href = p.url ? String(p.url) : null;

    byId.set(id, {
      id,
      title: String(p.subject).trim(),
      groupId: p.groupId ?? null,
      moq: p.moq ?? null,
      priceText: p.fobPrice || p.fobPriceWithoutUnit || (p.priceFrom ? `$${p.priceFrom}` : null),
      priceFrom: p.priceFrom ?? null,
      fobUnit: p.fobUnit ?? null,
      certified: p.certified ?? null,
      sold: p.prodOrdCnt ?? null,
      url: href ? (href.startsWith('//') ? 'https:' + href : href) : null,
      image: img ? (img.startsWith('//') ? 'https:' + img : img) : null,
    });
  }
}

const products = [...byId.values()];

const groups = {};
for (const p of products) {
  const k = String(p.groupId);
  groups[k] = (groups[k] || 0) + 1;
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ count: products.length, pagesParsed, groups, products }, null, 2));

const missingImg = products.filter((p) => !p.image).length;
const missingPrice = products.filter((p) => !p.priceText).length;
const missingUrl = products.filter((p) => !p.url).length;

console.log(JSON.stringify({
  pagesFound: files.length,
  pagesParsed,
  products: products.length,
  missingImage: missingImg,
  missingPrice,
  missingUrl,
  groupIds: Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 30),
  out: OUT,
}, null, 2));
