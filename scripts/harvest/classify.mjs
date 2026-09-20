// Classify the harvested store catalog into site-2 categories and pick a
// balanced, de-duplicated selection.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/Administrator/AccioWork/2026-09-16-17-15-24-640-e0833c0c';
const SRC = path.join(ROOT, '_harvest', 'all-products.json');
const OUT = path.join(ROOT, '_harvest', 'selection.json');

const all = JSON.parse(fs.readFileSync(SRC, 'utf8')).products;

const SUPERHERO = /spider-?man|spider-?gwen|venom|symbiote|carnage|deadpool|wolverine|iron man|iron spider|captain america|batman|superman|\bthor\b|\bhulk\b|black panther|miles morales|avengers|marvel|\bdc\b|superhero|super hero/i;

// Order matters: first match wins.
const RULES = [
  ['wigs', /\b(wig|wigs|hairpiece|hair piece|hair extension)\b/i],
  ['masks', /\b(mask|masks|masquerade|headwear|headcover|headpiece|headband|hat|crown|tiara|helmet|shako|veil|hood)\b/i],
  ['gloves', /\b(glove|gloves|mitten|mittens|gauntlet|gauntlets|paw|paws|wristband|hand wrap)\b/i],
  ['armor', /\b(armor|armour|chainmail|breastplate|pauldron|bracer|chest plate|shoulder guard|cape|cloak|corset|jumpsuit)\b/i],
  ['props', /\b(prop|props|sword|blade|wand|staff|shield|fan|tail|wing|wings|scepter|lantern|inflatable|balloon|dagger|axe|hammer|lace|sash|belt|necklace|earring|collar)\b/i],
  ['prints', /\b(print|printed|printing|sublimation|custom logo|personalized|mug|cup|keychain|key chain|pillow|cushion|blanket|t-shirt|tshirt)\b/i],
];

const TARGET = { masks: 7, props: 6, armor: 6, wigs: 5, gloves: 5, prints: 5, costumes: 6 };

function classify(p) {
  const t = p.title;
  const isSuperhero = SUPERHERO.test(t);
  for (const [cat, re] of RULES) {
    if (re.test(t)) {
      // Costumes line must stay fully clear of the superhero catalogue on site 1.
      if (isSuperhero && cat !== 'costumes') continue;
      return isSuperhero ? 'costumes-superhero-excluded' : cat;
    }
  }
  return isSuperhero ? 'costumes-superhero-excluded' : 'costumes';
}

const buckets = {};
for (const p of all) {
  const c = classify(p);
  (buckets[c] ||= []).push(p);
}

// Keep distinct products only: collapse near-duplicate titles.
function normKey(t) {
  return t
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 7)
    .join(' ');
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

const selection = {};
for (const cat of Object.keys(TARGET)) selection[cat] = pick(cat, TARGET[cat]);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(selection, null, 2));

const summary = {};
for (const [k, v] of Object.entries(buckets)) summary[k] = v.length;

console.log('catalogue size:', all.length);
console.log('available per category:', JSON.stringify(summary, null, 2));
console.log('');
for (const cat of Object.keys(TARGET)) {
  const picked = selection[cat];
  console.log(`=== ${cat}  picked ${picked.length}/${TARGET[cat]}  (available ${(buckets[cat] || []).length}) ===`);
  for (const p of picked) {
    console.log(`  ${p.id} | ${p.moq} | ${p.priceText} | ${p.title.slice(0, 95)}`);
  }
}
console.log('\nwritten:', OUT);
