# RECOVERY.md — how to rebuild hongbocosplay.com from nothing

Everything needed to stand this site back up on a new machine, a new host, or after
losing an account. Keep a copy of this file outside the repository too.

## 1. What this site is

A static React + Vite single-page application. There is no database and no server-side
code. The only runtime dependency is a third-party form endpoint. That means the site can
be redeployed onto **any** static host — Vercel, Cloudflare Pages, Netlify, GitHub Pages,
an Nginx box — without changing a line of code.

## 2. The four external accounts

| What | Where | Identifier |
|---|---|---|
| Source code | GitHub | `hongboGan/hongbocosplay-site` (public, branch `main`) |
| Hosting | Vercel | project `hongbocosplay-site`, account `miazhang031@gmail.com` |
| Domain | Namecheap | `hongbocosplay.com` |
| Inquiry delivery | FormSubmit | recipient `sales06@hoburn.group` |

Recovery is impossible without access to at least the GitHub account and the Namecheap
account. **Both should have recovery email and 2FA set up, and both should have a second
person or a printed record of the credentials.**

## 3. DNS records to re-create

If the domain's DNS is ever wiped, these are the two records that matter. The CNAME value
is specific to the Vercel project — if you rebuild on a different host, that host will
give you its own value and you must use that instead.

| Type | Host | Value | TTL |
|---|---|---|---|
| A | `@` | `216.198.79.1` | Automatic |
| CNAME | `www` | `787fe088d1e7dd9b.vercel-dns-017.com` | Automatic |

Nameservers stay on Namecheap BasicDNS (`dns1.registrar-servers.com`,
`dns2.registrar-servers.com`). Do not add AAAA records — Vercel does not support IPv6 on
third-party DNS and a stale AAAA blocks certificate issuance. The apex is configured to
308-redirect to `www`, so `www` is the canonical host.

## 4. Rebuild the site

```bash
git clone https://github.com/hongboGan/hongbocosplay-site.git
cd hongbocosplay-site
npm install
npm run build          # -> dist/
```

Sitemap (regenerate after any catalogue change):

```bash
node scripts/gen-sitemap.mjs
```

Deploy `dist/` to any static host. On Vercel: import the repository, framework preset
**Vite**, build command `npm run build`, output directory `dist`, production branch `main`.
`vercel.json` supplies the SPA rewrite so deep links resolve.

## 5. Things that are NOT in the repository

These have to be re-created by hand after a disaster. They are the real recovery risk.

| Item | Where it lives | If it is lost |
|---|---|---|
| Domain registration | Namecheap account | Not recoverable — the domain is gone |
| DNS records | Namecheap DNS panel | Re-enter the two records in §3 |
| Vercel project + domain binding | Vercel dashboard | Re-import the repo, re-add both domains |
| **FormSubmit activation** | `sales06@hoburn.group` inbox | **Must be re-activated, or inquiries are silently dropped** |
| Hero artwork master (PNG) | Local `media-output/` only | Recover the optimised JPEG from `public/hero/`, or regenerate |
| Catalogue harvest scripts | `scripts/harvest/` | Pipeline is preserved; it expects the raw supplier-page cache, so a re-harvest would need that cache or a fresh crawl |

## 6. The inquiry path — verify it after any migration

This is the single most fragile part of the site, because FormSubmit answers **HTTP 200
even when it refuses a submission**. The response body carries the truth:

- `{"success":"true", ...}` — delivered
- `{"success":"false", ...}` — **not delivered**, and the `message` says why
  (most often: the form has never been activated)

After any migration or account change, submit one real inquiry through the live form and
confirm the email arrives. Do not assume it works because the page said "thank you".

Test from the command line (run from the site's own origin, or FormSubmit rejects it):

```bash
curl -X POST "https://formsubmit.co/ajax/sales06@hoburn.group" \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.hongbocosplay.com" \
  -H "Referer: https://www.hongbocosplay.com/inquiry" \
  -d '{"Name":"test","Company":"test","Email":"test@example.com","Message":"delivery test","_captcha":"false"}'
```

## 7. Backup posture (as of the last audit)

Two copies exist: the GitHub repository and the local working copy. That is **one copy
short of safe** — GitHub is a single vendor, and while GitHub is unreachable from mainland
China neither copy is retrievable online.

Minimum improvement: add a second, independent remote (GitLab, Gitee, or a self-hosted
bare repository) and push to both. Ideally also keep an offline archive of the repository
on physical media.
