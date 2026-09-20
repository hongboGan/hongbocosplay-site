// Build the site-2 catalogue: classify -> pick -> download images -> emit products.json
// Downloads use Node's global fetch (child-process spawning of curl is blocked by EPERM here).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/Administrator/AccioWork/2026-09-16-17-15-24-640-e0833c0c';
const REPO = path.join(ROOT, 'hongbocosplay-site');
const IMG_DIR = path.join(REPO, 'public', 'products');
const DATA_OUT = path.join(REPO, 'src', 'data', 'products.json');

const all = JSON.parse(fs.readFileSync(path.join(ROOT, '_harvest', 'all-products.json'), 'utf8')).products;

const SUPERHERO = /spider-?man|spider-?gwen|venom|symbiote|carnage|deadpool|wolverine|iron man|iron spider|captain america|batman|superman|\bthor\b|\bhulk\b|black panther|miles morales|avengers|marvel|superhero|super hero/i;
const GARMENT = /\b(dress|dresses|costume|costumes|suit|suits|robe|robes|gown|gowns|jumpsuit|jumpsuits|leotard|onesie|onesies|pajama|pajamas|skirt|skirts|blouse|shirt|uniform|abaya|thobe|kaftan|kimono|tunic|vest|jacket|coat|bodysuit|tutu|poncho|bathrobe|nightgown|sweatshirt|outfit|outfits)\b/i;

const RULES = [
  { cat: 'wigs', re: /\b(wig|wigs|hairpiece|hair extension)\b/i, garmentOk: true },
  { cat: 'masks', re: /\b(mask|masks|masquerade|headwear|headcover|headpiece|headband|hat|shako|crown|tiara)\b/i },
  { cat: 'gloves', re: /\b(glove|gloves|mitten|mittens|gauntlet|gauntlets|paw|paws|claw|claws)\b/i, garmentOk: true },
  { cat: 'props', re: /\b(fan|fans|hula|staff|wand|sword|shield|prop|props|crown and magic)\b/i },
  { cat: 'armor', re: /\b(cloak|cloaks|cape|capes|chainmail|armor|armour|knight)\b/i },
  { cat: 'prints', re: /\b(print|printed|printing|sublimation|mug|cup|logo|oem|tie dye)\b/i },
];

const CAPS = { masks: 8, wigs: 5, gloves: 3, props: 4, armor: 4, prints: 3, costumes: 10 };

// An accessory only wins if its keyword appears BEFORE any garment keyword;
// otherwise the product is really a garment that merely mentions an accessory.
function classify(p) {
  const t = p.title;
  if (SUPERHERO.test(t)) return null;
  const g = GARMENT.exec(t);
  const gAt = g ? g.index : Infinity;
  for (const r of RULES) {
    const m = r.re.exec(t);
    if (!m) continue;
    if (m.index < gAt || (r.garmentOk && m.index < gAt + 40)) return r.cat;
    if (m.index < gAt) return r.cat;
  }
  return 'costumes';
}

const buckets = {};
for (const p of all) {
  const c = classify(p);
  if (!c) continue;
  (buckets[c] ||= []).push(p);
}

function normKey(t) {
  return t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 8).join(' ');
}

const STOP = new Set(['the', 'a', 'an', 'for', 'and', 'with', 'of', 'to', 'in', 'on', 'new', 'hot', 'sale', 'high', 'quality', 'wholesale', 'custom', 'customized', 'pcs', 'set', 'unisex', 'adult', 'kids', 'children', 'mens', 'womens', 'women', 'men', 'girls', 'boys', 'includes', 'style', 'styles']);
const usedSlugs = new Set();
function slugify(title) {
  const words = title.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w));
  let base = words.slice(0, 5).join('-').slice(0, 46).replace(/-+$/, '');
  if (!base) base = 'item';
  let slug = base;
  let n = 2;
  while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
  usedSlugs.add(slug);
  return slug;
}

function pick(cat, n) {
  const seen = new Set();
  const out = [];
  for (const p of buckets[cat] || []) {
    const k = normKey(p.title);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
    if (out.length >= n) break;
  }
  return out;
}

const chosen = [];
for (const cat of Object.keys(CAPS)) for (const p of pick(cat, CAPS[cat])) chosen.push({ ...p, category: cat });

fs.mkdirSync(IMG_DIR, { recursive: true });
fs.mkdirSync(path.dirname(DATA_OUT), { recursive: true });

function candidates(original) {
  const list = [];
  if (/\.jpe?g$/i.test(original)) list.push(`${original}_960x960.jpg`);
  else if (/\.png$/i.test(original)) list.push(`${original}_960x960.png`);
  list.push(original);
  return list;
}

async function fetchImage(url, dest) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 45000);
  try {
    const res = await fetch(url, { signal: ctl.signal });
    if (!res.ok) return { ok: false, note: `http ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1024) return { ok: false, note: `too small ${buf.length}B` };
    fs.writeFileSync(dest, buf);
    return { ok: true, size: buf.length };
  } catch (e) {
    return { ok: false, note: `${e.name}: ${e.message}`.slice(0, 140) };
  } finally {
    clearTimeout(timer);
  }
}

const products = [];
const failures = [];
for (const p of chosen) {
  const slug = slugify(p.title);
  const dest = path.join(IMG_DIR, `${slug}.jpg`);
  let got = null;
  let lastNote = '';
  for (const url of candidates(p.image)) {
    const r = await fetchImage(url, dest);
    if (r.ok) {
      got = { url, size: r.size };
      break;
    }
    lastNote = r.note;
  }
  if (!got) {
    failures.push({ id: p.id, slug, note: lastNote, tried: candidates(p.image) });
    continue;
  }
  const m = /^\$([\d.]+)(?:-([\d.]+))?/.exec(p.priceText || '');
  products.push({
    id: slug,
    title: p.title,
    category: p.category,
    priceUsdMin: m ? Number(m[1]) : null,
    priceUsdMax: m ? Number(m[2] || m[1]) : null,
    moq: p.moq,
    sourceUrl: p.url,
    sourceImage: got.url,
    image: `/products/${slug}.jpg`,
  });
  console.log(`ok  ${p.category.padEnd(9)} ${slug}.jpg ${(got.size / 1024).toFixed(0)}KB`);
}

fs.writeFileSync(DATA_OUT, JSON.stringify({ products }, null, 2));

const byCat = {};
for (const p of products) byCat[p.category] = (byCat[p.category] || 0) + 1;
const totalBytes = products.reduce((s, p) => {
  const f = path.join(IMG_DIR, `${p.id}.jpg`);
  return s + (fs.existsSync(f) ? fs.statSync(f).size : 0);
}, 0);

console.log('\n' + JSON.stringify({
  considered: all.length,
  availablePerCategory: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])),
  built: products.length,
  byCategory: byCat,
  imageFailures: failures.length,
  totalImageMB: +(totalBytes / 1048576).toFixed(2),
  dataOut: DATA_OUT,
}, null, 2));

if (failures.length) console.log('failures:', JSON.stringify(failures.slice(0, 8), null, 2));
