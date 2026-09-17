# hongbocosplay-site

Source for the second B2B independent site, served at **hongbocosplay.com**.

Stack mirrors the proven `hongbocostumes-site` setup: React 18 + Vite 5, deployed
on Vercel from the `main` branch.

## Scripts

```bash
npm install
npm run dev      # local dev server on 127.0.0.1
npm run build    # production build into dist/
npm run preview  # preview the built output
```

## Status

Currently a placeholder holding page. `index.html` carries
`<meta name="robots" content="noindex, nofollow">` so the domain is not indexed
before the real site ships. **Remove that tag when the real content goes live.**
