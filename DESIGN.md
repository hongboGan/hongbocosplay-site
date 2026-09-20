# DESIGN.md — hongbocosplay.com

Visual and content contract for the second independent site.

## 1. Positioning

**Custom cosplay merchandise, made to order.** Masks, headwear, wigs and armour-style
outerwear lead; finished costumes sit alongside them as a second line. The buyer is a
wholesale or OEM customer — a party-goods importer, a cosplay retailer, an event
producer — not a single-unit consumer. Every page is judged by whether it moves that
buyer toward an inquiry.

Contact is fixed and appears on every page:

- Email — `sales06@hoburn.group`
- WhatsApp — `wa.me/8618872213891` (country code required in the link)

## 2. Visual direction — "dark theatre"

Products are lit objects on a dark stage. The interface recedes; the goods come forward.
One warm accent does all the pointing, and nothing else competes with it.

### Deliberate contrast with site 1

`hongbocostumes.com` is loud: cream ground, multiple saturated accents, 2px black
borders, hard offset shadows, rotated sticker badges, a marquee ticker. Site 2 must be
recognisably a different brand on first glance. These rules are binding:

| Dimension | Site 1 (must not repeat) | Site 2 (dark theatre) |
|---|---|---|
| Ground | warm cream `#FFF6E9` | near-black charcoal `#0B0C0E` |
| Accents | lime + hot pink + violet, many | **exactly one** warm amber |
| Heading face | Archivo Black, all-caps, ultra-heavy | display serif, sentence case |
| Borders | 2px solid black on every card | none, or 1px hairline at 8% white |
| Shadows | `8px 8px 0` hard offset | soft bloom, or none |
| Density | high, sticker badges, ticker | generous, single-column narrative |
| Motion | marquee, bounce | slow fade / lift only |

Do not import site 1's tokens, components, fonts or blog voice. Do not reuse its
`styles.css`. The two stylesheets must share no custom property names beyond the
browser defaults.

### Palette

```css
:root {
  --bg:            #0B0C0E;  /* stage floor */
  --bg-raised:     #12141A;  /* panels */
  --bg-raised-2:   #191C23;  /* cards on panels */
  --hairline:      rgba(255,255,255,0.08);
  --hairline-soft: rgba(255,255,255,0.04);

  --ink:           #F2F0EC;  /* warm off-white, never pure #fff */
  --ink-muted:     #A8ADB6;
  --ink-faint:     #6E747E;

  --accent:        #E0A93F;  /* the single pointing colour */
  --accent-strong: #F2C162;
  --accent-wash:   rgba(224,169,63,0.12);

  --ok:            #5FA57A;
  --danger:        #C4574F;
}
```

Rules: `--accent` is for the primary CTA, the active filter, and one emphasis per
viewport. Never more than one accented surface visible at a time. Body copy is
`--ink-muted`, never `--ink` — the brightest text is reserved for headings and prices.

### Typography

| Role | Face | Weight | Size |
|---|---|---|---|
| Display | Fraunces | 500–600 | `clamp(2.4rem, 6vw, 4.5rem)`, line-height 1.02 |
| Section head | Fraunces | 500 | `clamp(1.6rem, 3.2vw, 2.4rem)` |
| Body | Manrope | 400 | 16–17px, line-height 1.65 |
| Label / eyebrow | Manrope | 600 | 12px, letter-spacing 0.14em, uppercase |
| Price | Manrope | 600 | 15px, `--ink` |

Fonts are self-hosted woff2 in `public/fonts/`. No external font CDN. A serif display
face is the single most visible break from site 1's ultra-heavy sans.

### Spacing and shape

- 8px base scale; section rhythm `clamp(64px, 10vw, 128px)`.
- Corner radius 2px on cards and inputs, 999px on pill buttons only.
- Cards carry `--bg-raised-2` on `--bg-raised` panels; separation comes from tone, not
  from borders or drop shadows.
- Product photography sits on a subtle radial bloom (`radial-gradient` at 18% accent
  opacity) so items read as lit from behind.

## 3. Pages

| Route | Purpose |
|---|---|
| `/` | Hero, category tiles, featured products, OEM capability, inquiry CTA |
| `/shop` | Full catalogue with category filter chips |
| `/shop/:category` | Category listing (`masks`, `wigs`, `armor`, `costumes`) |
| `/product/:id` | Product detail — image, spec table, MOQ, CTA to inquiry prefilled |
| `/custom` | OEM / customisation capability: what can be made, lead times, process |
| `/inquiry` | Inquiry form (all fields), plus direct email/WhatsApp routes |
| `/about` | Factory, capacity, QC, trade terms |
| `*` | 404 |

Category slugs are fixed strings, not translated labels, so URLs stay stable if the
display name changes.

### Navigation

Desktop: wordmark left, `Shop ▾` / `Custom` / `About` / `Inquiry` right. `Shop ▾` is a
mega panel listing every category with its product count — all categories rank equally,
with costumes sitting in the same list rather than demoted.

Mobile (<900px): wordmark + a single menu control opening a full-height panel. Every
category reachable in one tap. No hover-only affordances anywhere.

### Product card

Image (4:5, lazy-loaded, explicit width/height to reserve space), title, price range,
MOQ line, and category eyebrow. Hover lifts the card 2px and brightens the image
slightly — no border change, no shadow.

## 4. Inquiry path

Every page carries a persistent path to contact: header CTA, in-flow CTA after each
product grid, and a floating WhatsApp button on mobile.

The form posts via FormSubmit to `sales06@hoburn.group`. Fields: name, company, email,
country, product/interest, quantity, target date, message. Client-side validation with
inline errors; a visible success and failure state; the submitting button disables
during flight. **FormSubmit requires the recipient to click an activation link on the
first submission — unactivated, submissions are silently dropped.**

## 5. Non-negotiables

- One `h1` per page; headings descend in order.
- All product images self-hosted under `public/products/`, max 900px on the long edge,
  JPEG q82, target under 120KB each. No hot-linking to supplier CDNs.
- Every image has a descriptive `alt`; decorative images use empty `alt`.
- `prefers-reduced-motion` disables fades and lifts.
- Body text ≥ `--ink-muted` on its background; never place `--ink-faint` on `--bg-raised-2`.
- No horizontal overflow at any width; verify at 375px, 768px, 1440px.
- Layout uses `min-height: 100dvh` and stays vertically scrollable; nothing may be
  clipped by fixed chrome.
