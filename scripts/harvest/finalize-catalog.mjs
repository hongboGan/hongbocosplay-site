// Final curation pass: fix misclassifications, drop items the classifier
// over-reached on, resize images for web, and emit the launch catalogue.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = 'C:/Users/Administrator/AccioWork/2026-09-16-17-15-24-640-e0833c0c';
const REPO = path.join(ROOT, 'hongbocosplay-site');
const IMG_DIR = path.join(REPO, 'public', 'products');
const DATA = path.join(REPO, 'src', 'data', 'products.json');

// Hand-curated launch catalogue. Categories the store could not support with
// enough genuine products (props / gloves / custom prints) are deliberately
// held back for the 1688 sourcing pass rather than padded with wrong items.
const KEEP = {
  masks: [
    'hannya-mask-full-face-japanese',
    's-best-made-venetian-feather',
    'white-ostrich-feather-princess-mask',
    'multi-color-pvc-masquerade-eye',
    'fluffy-faux-fur-wolf-ears',
    'ornate-feather-marching-band-drum',
    'elegant-ladies-breathable-floppy-sun',
  ],
  wigs: [
    'popular-princess-wig-halloween-cosplay',
    '200g-colorful-clown-wigs-fan',
    'grandma-wig-granny-dress-100',
    'halloween-party-wig-100-days',
    'fancy-fun-8-100-days',
  ],
  armor: [
    'medieval-knight-armor-costume-chainmail',
    'hooded-medieval-cloak-victorian-steampunk',
    'hooded-witch-cape-halloween-costume',
    'halloween-echo-hooded-cloak-cosplay',
  ],
  costumes: [
    'velvet-ballet-leotard-dancewear-sleeveless',
    'girl-sequin-embroidery-puffy-prom',
    'priest-celebrant-clergy-vestment-church',
    'british-primary-school-uniform-korean',
    'christmas-outfit-halloween-cosplay-fireman',
    'korean-hanbok-traditional-dangui-pleated',
    'lolita-maid-dress-cosplay-costume',
    '1920s-vest-roaring-20s-waistcoat',
    'chinese-manufacturer-anime-dress-black',
    'pirate-lolita-blouse-long-sleeves',
  ],
};

const existing = JSON.parse(fs.readFileSync(DATA, 'utf8')).products;
const byId = new Map(existing.map((p) => [p.id, p]));

const wanted = new Set();
for (const list of Object.values(KEEP)) for (const id of list) wanted.add(id);

const missing = [...wanted].filter((id) => !byId.has(id));
if (missing.length) {
  console.error('MISSING ids:', missing);
  process.exit(1);
}

const kept = [];
for (const [category, ids] of Object.entries(KEEP)) {
  for (const id of ids) kept.push({ ...byId.get(id), category });
}

// Resize for web: max 900px on the long edge, JPEG q82, progressive.
const MAX = 900;
let beforeBytes = 0;
let afterBytes = 0;
for (const p of kept) {
  const file = path.join(IMG_DIR, `${p.id}.jpg`);
  beforeBytes += fs.statSync(file).size;
  const tmp = `${file}.tmp.jpg`;
  await sharp(file)
    .rotate()
    .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(tmp);
  fs.renameSync(tmp, file);
  afterBytes += fs.statSync(file).size;
  const meta = await sharp(file).metadata();
  p.width = meta.width;
  p.height = meta.height;
}

// Drop images that did not make the launch catalogue.
const keepFiles = new Set(kept.map((p) => `${p.id}.jpg`));
let removed = 0;
for (const f of fs.readdirSync(IMG_DIR)) {
  if (!keepFiles.has(f)) {
    fs.unlinkSync(path.join(IMG_DIR, f));
    removed++;
  }
}

fs.writeFileSync(DATA, JSON.stringify({ products: kept }, null, 2));

const byCat = {};
for (const p of kept) byCat[p.category] = (byCat[p.category] || 0) + 1;

console.log(JSON.stringify({
  products: kept.length,
  byCategory: byCat,
  imagesBeforeMB: +(beforeBytes / 1048576).toFixed(2),
  imagesAfterMB: +(afterBytes / 1048576).toFixed(2),
  avgKB: Math.round(afterBytes / kept.length / 1024),
  unusedImagesRemoved: removed,
  data: DATA,
}, null, 2));

console.log('\n--- launch catalogue ---');
for (const p of kept) {
  const price = p.priceUsdMax && p.priceUsdMax !== p.priceUsdMin ? `$${p.priceUsdMin}-${p.priceUsdMax}` : `$${p.priceUsdMin}`;
  console.log(`${p.category.padEnd(9)} | ${price.padEnd(13)} | ${String(p.moq).padEnd(11)} | ${p.id}`);
}
