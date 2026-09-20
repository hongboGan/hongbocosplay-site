# ARCHITECTURE.md — the storage and delivery stack

The target architecture, layer by layer: where each thing lives, why it lives there,
and which layers are actually in place today.

> 一句话：**Namecheap 买门牌号 + GitHub 存图纸 + Vercel 开店 + Cloudflare 保驾护航 +
> Cloudflare R2 存资产。**

Companion document: [RECOVERY.md](RECOVERY.md) — how to rebuild all of this after a loss.

---

## Layer 1 — Namecheap · the address

**Role:** owns the domain `hongbocosplay.com`. The only layer that cannot be re-created —
everything else can be rebuilt from scratch, but a lost domain is gone.

| | |
|---|---|
| Registrar | Namecheap |
| Nameservers | `dns1.registrar-servers.com`, `dns2.registrar-servers.com` |
| Renewal | annual; **set auto-renew on and keep the card current** |

The domain is the one asset where an expired card can cost you the business identity.
Calendar the renewal date.

## Layer 2 — GitHub · the drawings

**Role:** the authoritative copy of the source. As the diagram puts it: *as long as the
drawings exist, the site can be restored at any time.*

| | |
|---|---|
| Repository | `hongboGan/hongbocosplay-site` (public, branch `main`) |
| Contents | 8 routes, design system, 26-product catalogue, all product images, fonts, build scripts |
| Size | ~2 MB / 61 files — small enough to clone in seconds |

Everything needed to rebuild the site is here. The only things outside it are the four
accounts in §6 and the domain itself.

## Layer 3 — Vercel · the shopfront

**Role:** turns the GitHub blueprint into a live, globally distributed site. Free, fast,
and correctly sized for a site like this one.

| | |
|---|---|
| Project | `hongbocosplay-site` |
| Build | framework `Vite`, `npm run build`, output `dist` |
| Deploy | automatic on every push to `main` |
| Domains | `hongbocosplay.com` + `www.hongbocosplay.com`; apex 308-redirects to www |
| TLS | issued and renewed automatically |

**Canonical host is `www`.** Canonical tags, the sitemap and `robots.txt` all point at
`https://www.hongbocosplay.com` to match the redirect.

## Layer 4 — Cloudflare · the escort ⚠️ NOT IN PLACE

**Role in the target architecture:** DDoS protection, a global edge cache, and better
reachability for buyers in the US, Europe and the Middle East.

**Status: not configured.** The domain still resolves through Namecheap BasicDNS.

What it would actually buy us, honestly:

- **Real benefit:** DDoS and bot filtering before traffic reaches Vercel; a second cache
  tier; and a DNS provider that is easier to manage programmatically.
- **Limited benefit:** Vercel already serves from a global CDN, so the "acceleration" gain
  on a site this size is marginal. Vercel also serves from an anycast pool that is not
  especially strong from mainland China, and proxying through Cloudflare can improve that
  for some routes — but it can equally add a second cache layer that serves stale HTML if
  the cache rules are not set correctly.
- **The trap:** moving nameservers to Cloudflare means **every DNS record must be migrated,
  including the mail records.** Get that wrong and `sales06@hoburn.group` — the address every
  inquiry lands in — stops receiving mail. This is a bigger risk than the DDoS exposure it
  removes.

**Before doing this:** export the full zone (MX `mx1/mx2/mx3.qiye.aliyun.com`, the SPF TXT,
the GSC verification TXT, the A and CNAME records), migrate them verbatim, verify mail
delivery, and only then switch. If proxying, start the site records on "DNS only" and enable
proxying one step at a time.

## Layer 5 — Cloudflare R2 · the asset store ⚠️ NOT IN PLACE

**Role in the target architecture:** hold images and video, served through a dedicated
asset hostname, with no egress fees.

**Status: not configured.** All 26 product images (1.77 MB) and the hero artwork (112 KB)
are committed to the repository and served by Vercel.

An honest read on the timing:

- **At the current scale it would be over-engineering.** 1.9 MB of images on Vercel's CDN
  costs nothing and performs well. R2 adds a second provider, a bucket, a custom asset
  hostname and a build step to keep in sync — for no measurable gain today.
- **It becomes worth it when:** the catalogue moves into the hundreds of images, video is
  added (product clips, factory footage), or buyers in slow regions need a dedicated,
  cheaply-cacheable asset origin. R2's zero-egress pricing is a genuine structural advantage
  at that point.
- **If adopted:** keep the source images in the repository regardless — R2 is a delivery
  layer, not a backup. The repository must stay the thing you can rebuild from.

## Layer the diagram misses — the inquiry channel

The five layers above carry the site. They do **not** carry the thing the site exists for:
getting a buyer's message into a human's inbox.

That is a separate dependency — **FormSubmit** delivering to `sales06@hoburn.group` — and it
is the single most fragile part of the stack. It proved that on 2026-09-20: the form looked
fine, the page said "thank you", and every inquiry was being silently dropped.

Two rules follow, and they belong in the architecture:

1. **Never trust HTTP 200 from the form endpoint.** The response body's `success` field is
   the truth. The site already checks it and shows a real failure state with clickable
   email and WhatsApp fallbacks.
2. **Test the channel after any migration** — DNS change, host change, domain change. A
   working website with a broken inquiry path is worth nothing to this business.

## Current state at a glance

| # | Layer | Purpose | State |
|---|---|---|---|
| 1 | Namecheap | Domain registration | ✅ in place |
| 2 | GitHub | Source of truth | ✅ in place |
| 3 | Vercel | Hosting + CDN + TLS | ✅ in place |
| 4 | Cloudflare | Protection + acceleration | ❌ not configured |
| 5 | Cloudflare R2 | Image/video asset store | ❌ not configured |
| + | FormSubmit | Inquiry delivery | ✅ active — **requires periodic testing** |

## Recommended order of work

1. **Keep layers 1–3 healthy.** Auto-renew the domain; keep pushes flowing to `main`.
2. **Add a second git remote** (Gitee or GitLab). Two copies of the source is one copy short
   of safe, and GitHub is intermittently unreachable from mainland China.
3. **Test the inquiry channel** with one real submission per month, and always after any
   infrastructure change.
4. **Cloudflare in front of Vercel** — only once the DNS migration plan above is written out
   record by record. Not urgent.
5. **R2** — defer until the catalogue or video volume justifies it.
