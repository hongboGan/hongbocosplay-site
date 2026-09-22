// Server entry, used only by the prerender build step.
// Kept physically separate from main.jsx so Vite never confuses the two environments.
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App.jsx';
import { CATEGORIES, products } from './data/products.js';
import { POSTS } from './content/blog.js';
import { headFor, metaForPath } from './lib/route-meta.js';

// Every public route. 404 is deliberately absent: it must stay a rewrite, not a file.
export const ROUTES = [
  '/',
  '/shop',
  '/custom',
  '/about',
  '/blog',
  '/inquiry',
  ...CATEGORIES.map((c) => `/shop/${c.slug}`),
  ...products.map((p) => `/product/${p.id}`),
  ...POSTS.map((p) => `/blog/${p.slug}`),
];

export function render(pathname) {
  return renderToString(
    <StaticRouter location={pathname}>
      <App />
    </StaticRouter>
  );
}

export { headFor, metaForPath };
