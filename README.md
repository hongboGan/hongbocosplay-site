# hongbocosplay-site

Source for **https://www.hongbocosplay.com** — a B2B site for custom cosplay merchandise:
masks and headwear, wigs, armour-style outerwear and finished costumes, sold wholesale and
OEM to importers, retailers and event producers.

React 18 + Vite 5 + React Router v6, deployed on Vercel from `main`. There is no CMS, no
database and no server: the site is static files plus one third-party form endpoint.

## Scripts

```bash
npm install
npm run dev      # local dev server on 127.0.0.1
npm run build    # client build + SSR bundle + prerender every route into dist/
npm run preview  # preview the built output

node scripts/gen-sitemap.mjs    # regenerate public/sitemap.xml — run after any catalogue or article change
node scripts/fetch-fonts.mjs    # re-download the self-hosted variable fonts
node scripts/prepare-hero.mjs   # re-optimise the hero artwork from its source PNG
node scripts/serve-dist.mjs     # tiny static server with SPA fallback, for checking a build
```

`npm run preview` needs esbuild and hits `spawn EPERM` in this environment; use
`serve-dist.mjs` instead.

## Routes

`/` · `/shop` · `/shop/:category` · `/product/:id` · `/custom` · `/about` · `/blog` ·
`/blog/:slug` · `/inquiry` · 404 fallback

## Prerendering

`npm run build` runs three steps: the client build, an SSR bundle of `src/entry-server.jsx`,
then `scripts/prerender.mjs`, which renders all 41 public routes with `react-dom/server` and
writes real HTML — including that route's title, description, canonical and og tags — so a
crawler that never runs JavaScript still receives a complete page. No SSR framework and no
new runtime dependency.

Three things to preserve when touching this:

- **`vercel.json` must keep `cleanUrls: true`.** Vercel does not map `/blog` to `blog.html` on
  its own; without it every extensionless route falls through and the prerendered files are
  unreachable.
- **Do not add a catch-all rewrite.** Unmatched paths are answered by the prerendered
  `404.html`, which returns a real 404 status and deliberately carries no canonical.
- **`src/lib/route-meta.js` is the only place page metadata lives.** The static HTML and the
  hydrated app both read it, which is what keeps them from disagreeing and triggering a
  hydration mismatch. A new route belongs there and in `ROUTES` in `entry-server.jsx`.

## Adding a blog post

1. Append an entry to `POSTS` in `src/content/blog.js`:

   | Field | Notes |
   |---|---|
   | `slug` | URL segment, also the sitemap entry |
   | `title`, `excerpt` | used for the card, the page and the meta description |
   | `date` | ISO `YYYY-MM-DD`; the index sorts newest first |
   | `tags` | array of short labels |
   | `cover` | path to a file under `public/` — reuse a product image or add one |
   | `sources` | the community discussions the piece was written from |
   | `body` | Markdown: `##` and `###` headings, `- ` lists, `> ` quotes, `**bold**`, `*italic*`, `[text](/path)` |

2. Keep `sources` honest. It records **topic cues only** — every word of the article is
   original, and nothing may be presented as a fact about our own factory that is not true.
3. `node scripts/gen-sitemap.mjs`
4. `npm run build`, then check it locally
5. Commit and push — Vercel deploys automatically

## Adding or changing products

`src/data/products.json` is the single source of truth. Each entry carries `id`, `title`,
`category` (`masks` | `wigs` | `armor` | `costumes`), `priceUsdMin` / `priceUsdMax`, `moq`,
`sourceUrl`, `sourceImage` and `image`.

Images live in `public/products/`, processed with `sharp` to long edge 900 px, JPEG q82,
progressive. Keep every file under roughly 150 KB — page weight is what decides whether an
overseas buyer waits or leaves. Then run `gen-sitemap.mjs` and push.

Product photos must be photographs of the actual goods. Never substitute a generated or
borrowed image: a buyer who orders something different from the picture is a lost account.

## Inquiry delivery

The form posts to FormSubmit and is forwarded to `sales06@hoburn.group`.

**The endpoint answers HTTP 200 even when it rejects a submission.** Never treat the status
code as success — the code checks the response body's `success` field, and shows a real
failure state with clickable email and WhatsApp fallbacks. Activity here is per form page,
so re-test the channel after any DNS, host or domain change.

## Performance rules worth not breaking

- Images above the fold must **not** use `loading="lazy"`. It has caused a blank hero twice.
  Verify `naturalWidth` at first paint, not after a scroll — scrolling hides the defect.
- Fonts are self-hosted woff2. No external font CDN.
- No UI framework, no Markdown parser, no CMS. The build stays small on purpose.

## More documentation

- [DESIGN.md](DESIGN.md) — the visual contract and the rules that keep this site distinct from the main site
- [ARCHITECTURE.md](ARCHITECTURE.md) — the storage and delivery stack, layer by layer
- [RECOVERY.md](RECOVERY.md) — how to rebuild everything from nothing
