// Single source of truth for per-route <head> values.
// The pages read it on navigation and the prerender script reads it at build time,
// so the static HTML and the hydrated app cannot drift apart.
import { getCategory, getProduct, moqLabel, priceLabel, shortTitle } from '../data/products.js';
import { getPost } from '../content/blog.js';

export const SITE = 'Hongbo Cosplay';
// Canonical host is www: the apex 308-redirects here on Vercel, so a self-referencing
// canonical must say www or every page points at a URL that immediately redirects away.
export const ORIGIN = 'https://www.hongbocosplay.com';

const STATIC = {
  '/': {
    title: 'Custom Cosplay Merchandise Manufacturer',
    description:
      'Wholesale and OEM cosplay merchandise — masks, headwear, wigs, armour-style outerwear and costumes, manufactured to your specification.',
  },
  '/shop': {
    title: 'Catalogue',
    description:
      'The full Hongbo Cosplay catalogue — masks and headwear, wigs, armour-style outerwear and costumes, all available for wholesale and OEM orders.',
  },
  '/custom': {
    title: 'Custom / OEM manufacturing',
    description:
      'OEM cosplay merchandise: your artwork, your sizing, your branding. What we can customise, how sampling works, and the trade terms we work to.',
  },
  '/about': {
    title: 'About us',
    description:
      'A cosplay merchandise and costume manufacturer supplying wholesale and OEM buyers — masks, headwear, wigs, armour-style outerwear and finished costumes.',
  },
  '/blog': {
    title: 'Sourcing notes',
    description:
      'Sourcing and production notes for cosplay buyers — masks, wigs, armour, sizing and order timing, written from the manufacturing side.',
  },
  '/inquiry': {
    title: 'Request a quote',
    description: 'Send us the item and the quantity. Quotes come back within one working day by email or WhatsApp.',
  },
};

// No canonical: a page that does not exist must never claim an address as canonical.
const NOT_FOUND = {
  title: 'Page not found',
  description: 'The page you requested does not exist.',
  path: null,
};

export function metaForPath(pathname) {
  const clean = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (STATIC[clean]) return { ...STATIC[clean], path: clean };

  const shop = clean.match(/^\/shop\/([^/]+)$/);
  if (shop) {
    const cat = getCategory(shop[1]);
    return cat
      ? { title: cat.name, description: `${cat.blurb} Wholesale and OEM orders welcome.`, path: clean }
      : NOT_FOUND;
  }

  const product = clean.match(/^\/product\/([^/]+)$/);
  if (product) {
    const item = getProduct(product[1]);
    return item
      ? {
          title: shortTitle(item, 70),
          description: `${item.title} — ${priceLabel(item)}, ${moqLabel(item)}. Wholesale and OEM orders.`,
          path: clean,
          image: item.image,
        }
      : NOT_FOUND;
  }

  const post = clean.match(/^\/blog\/([^/]+)$/);
  if (post) {
    const article = getPost(post[1]);
    return article
      ? { title: article.title, description: article.excerpt, path: clean, image: article.cover }
      : NOT_FOUND;
  }

  return NOT_FOUND;
}

// Concrete head values for a meta descriptor — shared by the client and the prerender.
// A null `path` means "no canonical": an unknown URL must not claim the home page as
// its canonical address.
export function headFor(meta) {
  const title = meta.title ? `${meta.title} | ${SITE}` : SITE;
  const canonical = meta.path == null ? null : `${ORIGIN}${meta.path}`;
  const description = meta.description || '';
  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonical,
    ogImage: meta.image ? `${ORIGIN}${meta.image}` : null,
  };
}
