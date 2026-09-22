// Prerender every public route to static HTML after `vite build`.
//
// The app is a client-rendered SPA, so a crawler that does not execute JavaScript
// receives an empty <div id="root">. This step renders each route with react-dom/server
// and writes real HTML, plus the per-route head values, so the page is complete before
// any script runs. No SSR framework is involved.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = path.resolve('dist');
const SSR_ENTRY = path.resolve('dist-ssr/entry-server.js');

const HEAD_BLOCK = /<!--head:start-->[\s\S]*?<!--head:end-->/;
const ROOT_PLACEHOLDER = '<div id="root"></div>';

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function headLines(head) {
  const lines = [
    `<title>${escapeHtml(head.title)}</title>`,
    `<meta name="description" content="${escapeHtml(head.description)}" />`,
  ];
  if (head.canonical) lines.push(`<link rel="canonical" href="${escapeHtml(head.canonical)}" />`);
  lines.push(`<meta property="og:title" content="${escapeHtml(head.ogTitle)}" />`);
  lines.push(`<meta property="og:description" content="${escapeHtml(head.ogDescription)}" />`);
  if (head.ogUrl) lines.push(`<meta property="og:url" content="${escapeHtml(head.ogUrl)}" />`);
  if (head.ogImage) lines.push(`<meta property="og:image" content="${escapeHtml(head.ogImage)}" />`);
  return lines;
}

function headBlock(head) {
  return `<!--head:start-->\n    ${headLines(head).join('\n    ')}\n    <!--head:end-->`;
}

// `detail/x` -> dist/detail/x.html. Flat files, because Vercel resolves /detail/x to
// x.html without issuing a trailing-slash redirect that would break the canonical.
function outputPath(route) {
  return route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, `${route}.html`);
}

const { ROUTES, render, headFor, metaForPath } = await import(pathToFileURL(SSR_ENTRY).href);

if (!ROUTES || !ROUTES.length) {
  console.error('prerender: entry-server exported no routes — refusing to write anything');
  process.exit(1);
}

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
if (!HEAD_BLOCK.test(template) || !template.includes(ROOT_PLACEHOLDER)) {
  console.error('prerender: index.html is missing the head markers or the root placeholder');
  process.exit(1);
}

// Blank shell for paths that are not prerendered. It carries the not-found head and
// deliberately no canonical, so an unknown URL cannot claim the home page as canonical.
// The SPA rewrite points here, not at dist/index.html, which is now the rendered home page.
const shellHead = headLines(headFor({ ...metaForPath('/__unknown-route__'), path: null }));
fs.writeFileSync(path.join(DIST, 'spa.html'), template.replace(HEAD_BLOCK, shellHead.join('\n    ')));

const failures = [];
let written = 0;

for (const route of ROUTES) {
  try {
    const appHtml = render(route);
    const head = headFor(metaForPath(route));

    let html = template.replace(ROOT_PLACEHOLDER, `<div id="root">${appHtml}</div>`);
    html = html.replace(HEAD_BLOCK, headBlock(head));

    const file = outputPath(route);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    written += 1;
  } catch (err) {
    // One bad route must never break the deploy; the SPA rewrite still covers it.
    failures.push(`${route}: ${err.message}`);
  }
}

console.log(`prerender: wrote ${written}/${ROUTES.length} routes`);

if (failures.length) {
  console.error(`prerender: ${failures.length} route(s) failed and will fall back to the SPA shell`);
  failures.forEach((f) => console.error(`  - ${f}`));
}

if (!written) process.exit(1);
