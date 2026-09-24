import raw from './products.json';

export const CONTACT = {
  email: 'sales06@hoburn.group',
  whatsappDisplay: '+86 18872213891',
  whatsappUrl: 'https://wa.me/8618872213891',
};

// Display order is the business order: merchandise first, costumes alongside.
export const CATEGORIES = [
  {
    slug: 'masks',
    name: 'Masks & Headwear',
    blurb: 'Latex head pieces, masquerade masks, crowns and character headwear.',
  },
  {
    slug: 'wigs',
    name: 'Wigs',
    blurb: 'Character and novelty wigs for cosplay, stage and party programmes.',
  },
  {
    slug: 'armor',
    name: 'Armor & Outerwear',
    blurb: 'Chainmail, hooded cloaks and capes built for stage and event wear.',
  },
  {
    slug: 'props',
    name: 'Props & Weapons',
    blurb: 'Cast blade and sword models, die-cast props and display ornaments.',
  },
  {
    slug: 'costumes',
    name: 'Costumes',
    blurb: 'Finished outfits across period, folk, occupational and anime themes.',
  },
];

export const products = raw.products;

export const getProduct = (id) => products.find((p) => p.id === id) || null;

export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug) || null;

export const byCategory = (slug) => products.filter((p) => p.category === slug);

export const countIn = (slug) => byCategory(slug).length;

export function priceLabel(p) {
  if (p.priceUsdMin == null) return 'Price on request';
  if (p.priceUsdMax == null || p.priceUsdMax === p.priceUsdMin) return `US$${p.priceUsdMin.toFixed(2)}`;
  return `US$${p.priceUsdMin.toFixed(2)} – ${p.priceUsdMax.toFixed(2)}`;
}

export function moqLabel(p) {
  return p.moq ? `MOQ ${p.moq}` : 'MOQ on request';
}

// A compact label for links and lists, trimmed on a word boundary.
export function shortTitle(p, max = 58) {
  const t = p.title;
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const at = cut.lastIndexOf(' ');
  return `${cut.slice(0, at > 30 ? at : max).replace(/[,;:.\-–]$/, '')}…`;
}
