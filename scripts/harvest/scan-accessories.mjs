// Scan the harvested catalogue for genuine ACCESSORY products.
// A title that is primarily a garment is excluded even if it mentions an accessory.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/Administrator/AccioWork/2026-09-16-17-15-24-640-e0833c0c';
const all = JSON.parse(fs.readFileSync(path.join(ROOT, '_harvest', 'all-products.json'), 'utf8')).products;

const GARMENT = /\b(dress|dresses|costume|costumes|suit|suits|robe|robes|gown|gowns|jumpsuit|leotard|onesie|onesies|pajama|pajamas|pyjama|skirt|blouse|shirt|uniform|abaya|thobe|kaftan|kimono|tunic|vest|jacket|coat|bodysuit|tutu|poncho|bathrobe|nightgown)\b/i;

const ACCESSORY = {
  masks: /\b(mask|masks|masquerade|headwear|headcover|headpiece|headband|hat|hats|crown|tiara|helmet|shako|wimple)\b/i,
  wigs: /\b(wig|wigs|hairpiece|hair extension)\b/i,
  gloves: /\b(glove|gloves|mitten|mittens|gauntlet|gauntlets|paw|paws|claw|claws)\b/i,
  props: /\b(sword|blade|wand|staff|shield|fan|fans|tail|wing|wings|scepter|lantern|balloon|dagger|axe|hammer|prop|props|hook)\b/i,
  armor: /\b(armor|armour|chainmail|breastplate|pauldron|bracer|shoulder|gauntlet|helmet|shield|cuirass)\b/i,
  prints: /\b(print|printed|printing|sublimation|mug|cup|keychain|key chain|pillow|cushion|blanket|mousepad|magnet)\b/i,
};

const seen = new Set();
const hits = [];
for (const p of all) {
  if (seen.has(p.id)) continue;
  const t = p.title;
  const isGarment = GARMENT.test(t);
  const matched = Object.entries(ACCESSORY).filter(([, re]) => re.test(t)).map(([k]) => k);
  if (!matched.length) continue;
  // A garment title only counts if the accessory is the head noun of a standalone item.
  if (isGarment) continue;
  seen.add(p.id);
  hits.push({ ...p, matched });
}

console.log('accessory-like products (garments excluded):', hits.length, '\n');
const byCat = {};
for (const h of hits) for (const m of h.matched) (byCat[m] ||= []).push(h);

for (const cat of Object.keys(ACCESSORY)) {
  const list = byCat[cat] || [];
  console.log(`=== ${cat}  (${list.length}) ===`);
  for (const p of list.slice(0, 22)) {
    console.log(`  ${p.id} g=${p.groupId} | ${p.moq} | ${p.priceText} | ${p.title.slice(0, 92)}`);
  }
  console.log('');
}

// Also dump the accessory group in full — it is the store's own accessory bucket.
console.log('=== group 936638447 (Party Mask&Hat&Props) full ===');
for (const p of all.filter((x) => String(x.groupId) === '936638447')) {
  console.log(`  ${p.id} | ${p.moq} | ${p.priceText} | ${p.title.slice(0, 92)}`);
}

fs.writeFileSync(path.join(ROOT, '_harvest', 'accessories.json'), JSON.stringify(hits, null, 2));
console.log('\nwritten:', path.join(ROOT, '_harvest', 'accessories.json'));
