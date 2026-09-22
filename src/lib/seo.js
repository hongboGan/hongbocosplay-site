import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { headFor, metaForPath } from './route-meta.js';

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

// Keeps the document head in step with the route.
//
// Called with no argument it derives the values from the current path, which is what
// almost every page wants. The prerender script renders the same values into static
// HTML, so a crawler that never runs JS still gets a correct title and description.
export function usePageMeta(meta) {
  const { pathname } = useLocation();
  const resolved = meta || metaForPath(pathname);
  const { title, description, canonical, ogTitle, ogDescription, ogUrl, ogImage } = headFor(resolved);

  useEffect(() => {
    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', ogTitle);
    upsertMeta('property', 'og:description', ogDescription);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    if (canonical) {
      upsertMeta('property', 'og:url', canonical);
      upsertLink('canonical', canonical);
    } else {
      // Unknown route: drop the canonical rather than point it at the home page.
      document.head.querySelector('link[rel="canonical"]')?.remove();
      document.head.querySelector('meta[property="og:url"]')?.remove();
    }
    if (ogImage) upsertMeta('property', 'og:image', ogImage);
  }, [title, description, canonical, ogTitle, ogDescription, ogUrl, ogImage]);
}
