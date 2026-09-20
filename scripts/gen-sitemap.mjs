// Generate public/sitemap.xml from the product catalogue plus the static routes.
// Run after any catalogue change: node scripts/gen-sitemap.mjs
import fs from 'node:fs';
import path from 'node:path';

// Must match the canonical host served by the site (www), not the apex that redirects to it.
const ORIGIN = 'https://www.hongbocosplay.com';
const DATA = path.resolve('src/data/products.json');
const OUT = path.resolve('public/sitemap.xml');

const { products } = JSON.parse(fs.readFileSync(DATA, 'utf8'));

const CATEGORIES = ['masks', 'wigs', 'armor', 'costumes'];
const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: '/', priority: '1.0', freq: 'weekly' },
  { loc: '/shop', priority: '0.9', freq: 'weekly' },
  ...CATEGORIES.map((c) => ({ loc: `/shop/${c}`, priority: '0.8', freq: 'weekly' })),
  { loc: '/custom', priority: '0.8', freq: 'monthly' },
  { loc: '/about', priority: '0.6', freq: 'monthly' },
  { loc: '/inquiry', priority: '0.9', freq: 'monthly' },
  ...products.map((p) => ({ loc: `/product/${p.id}`, priority: '0.7', freq: 'monthly' })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${ORIGIN}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(OUT, xml);
console.log(JSON.stringify({ routes: urls.length, products: products.length, out: OUT }, null, 2));
