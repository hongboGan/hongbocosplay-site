import { useEffect } from 'react';

const SITE = 'Hongbo Cosplay';
// Canonical host is www: the apex 308-redirects here on Vercel, so self-referencing
// canonicals must point at www or every page declares a canonical that redirects away.
const ORIGIN = 'https://www.hongbocosplay.com';

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// Per-route <title>, description, canonical and social tags.
export function usePageMeta({ title, description, path = '/', image }) {
  useEffect(() => {
    const full = title ? `${title} | ${SITE}` : SITE;
    document.title = full;
    upsertMeta('name', 'description', description || '');
    upsertMeta('property', 'og:title', full);
    upsertMeta('property', 'og:description', description || '');
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:url', `${ORIGIN}${path}`);
    if (image) upsertMeta('property', 'og:image', `${ORIGIN}${image}`);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertLink('canonical', `${ORIGIN}${path}`);
  }, [title, description, path, image]);
}
