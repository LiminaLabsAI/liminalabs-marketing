# Limina Labs — website

Marketing site for Limina Labs. **Limina Labs makes enterprise AI accountable** — intent,
execution and learning kept as one governed record, with any model, inside the customer's
own walls.

Single static page. No build step, no framework, no dependencies beyond one Google Fonts
request.

## Source of truth

The copy on this page is generated from **`limina-labs-vision.md`** (the company vision
document). When the story changes, change it there first, then update this page. Do not let
this page become the place the real thinking lives.

Rules the vision document imposes on this page, which must not drift:

- **Three products, not four.** Intent Studio, Precepta, Cerebrio. Forge is a *function*,
  not a product — it is not started and most likely lives inside Precepta.
- **Cerebrio is roadmap.** Never listed as available, never linked, and never with a
  published quarter.
- **Say "early access", never "beta".** Some enterprises cannot procure beta software.
- **Do not claim funding or customers.** "Early-stage and unfunded, in early access with a
  small number of enterprises" is true and reads as deliberate.
- The `#status` table is the honesty contract. Update it before demoing anything new.

## Structure

```
index.html              the whole site — markup, CSS and JS in one file
assets/logo/            the mark, favicons and the Open Graph card
assets/team/            founder photographs
favicon.ico             root fallback — browsers request this path automatically
```

## Local preview

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080. Opening `index.html` over `file://` also works.

`.claude/launch.json` runs the same thing from Claude Code's preview pane. It is local dev
config, not part of the site — gitignore it if you would rather not commit it. Port 8080
rather than the usual 8000 because OrbStack holds 8000 on this machine.

## Before you deploy

One thing needs changing, and it is flagged with a comment block at the top of `<head>`:

**Replace `https://liminalabs.ai` with the live origin** in the canonical link, `og:url`,
`og:image`, `twitter:image`, and in the JSON-LD block at the foot of the page. Everything
else on the page is relative. Open Graph images must be absolute URLs — a relative one will
not render a link preview.

## Deployment

Static, so anything that serves files will host it.

**GitHub Pages** — Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
Add a `CNAME` file containing the custom domain if one is pointed at it.

**Netlify / Vercel / Cloudflare Pages** — no build command, publish directory `.`.

## Brand

The identity comes from the Limina Labs asset kit, **cobalt light theme**.

- **The mark** is four right-leaning bars in a descending cobalt ramp
  (`#141F8F → #2A3DCC → #7C8CEB → #B3BEF6`). It is defined once as an inline SVG
  `<symbol id="limina-mark">` near the top of `<body>` and referenced with `<use>`
  everywhere else.
- **Retinting** is done with the custom properties `--m1`…`--m4`, not with classes.
  Custom properties inherit into the `<use>` shadow tree; class selectors do not, so
  `.mark .b1{fill:…}` silently renders black. The variants are `.mark` (cobalt light),
  `.mark--frost` (for dark backgrounds) and `.mark--flat` (one flat cobalt, per the kit's
  rule for sizes under ~24px).
- **The wordmark** is Bricolage Grotesque 700 with Archivo and IBM Plex Sans as fallbacks —
  "Limina" in ink, "Labs" in `--ink-3`.
- **Motion.** The kit allows the *Lift* animation on the logo once per page load and nowhere
  else. It is on the nav mark via `.mark--lift`, plays for 0.66s, and then stays still.
  Disabled under `prefers-reduced-motion`.

### The mark was rebuilt, not exported

The SVG geometry here was redrawn from the asset kit's rendering, because the kit's files
were not available to copy. It matches, but if you export the real kit, drop
`limina-mark-cobalt.svg` in and replace the `<symbol>` paths — nothing else needs to change.

The kit's own filenames, for when that happens: `limina-mark-cobalt.svg`,
`limina-mark-frost.svg`, `limina-mark-cobalt-flat.svg`,
`lockup/limina-lockup-horizontal-{light,dark}.svg`, `favicon/favicon.ico`,
`app-icon/icon-512-maskable-*.png`, `og-image-1200x630-{light,dark}.png`.

`assets/logo/limina-lockup.png` and `limina-mark.png` are the **superseded** monochrome mark.
Nothing references them; delete them once you are happy with the new identity.

## Editing notes

- **Design tokens** live in the `:root` block at the top of the `<style>` element: the
  surface ramp, the cobalt ramp, the three product accents, type families and layout widths.
  Change a colour there rather than hunting through rules.
- **Typography** is IBM Plex — Sans for headings, Serif for body copy, Mono for labels and
  data — plus Bricolage Grotesque for the wordmark only. All four load in one request.
- **The autonomy dial** is driven by the `SETTINGS` array in the script at the bottom. Each
  entry has `title`, `grant`, `needs` and `conseq`. The track, keyboard handling and fill bar
  adapt to the array length.
- **The loop diagram** is inline SVG in `#loop`, laid out on a `0 0 560 470` viewBox running
  clockwise: Know (Cerebrio) → Intent (Intent Studio) → Do (Precepta) → Trace + evaluate →
  Learn (Forge). Dashed node borders mean *not yet built* — keep that convention honest.
  Edge draw-in is CSS (`.edge` with `stroke-dasharray`) and is disabled under
  `prefers-reduced-motion`.
- **Watch out for class-name collisions.** `.road` is the horizon grid; the status table's
  cell states are namespaced `.st-yes` / `.st-road` / `.st-none` for exactly this reason.
- **Scroll reveals** use the `.rv` class plus an `IntersectionObserver`. Elements are only
  hidden when JavaScript is running (`.js .rv`), so the page degrades to fully visible
  without JS, and a 4-second timeout reveals everything if the observer never fires.

## Accessibility

Keyboard-navigable throughout, visible focus rings, a skip link, `prefers-reduced-motion`
respected, and the autonomy dial implemented as an ARIA radiogroup with roving tabindex and
arrow-key support. The loop diagram carries a full `aria-label` describing the cycle. Keep
these intact when editing.

Verified with no horizontal overflow at 390px, 768px and desktop widths.

## Outbound product links

- Intent Studio — https://intent.preceptaai.com/
- Precepta — https://preceptaai.com/
- Cerebrio — **not linked.** It is roadmap; `thecerebrio.ai` must not be presented as an
  available product.
- Forge — a function, described on this page only

## Open items

- Confirm the registered entity and location line in the footer.
- Settle the Limina Labs / Precepta brand relationship — `hello@preceptaai.com` is still the
  contact address, which makes Precepta look like the parent. Move to a Limina Labs address
  the day the domain is live.
- No customer proof, logos or product screenshots yet.
- Precepta has no published pricing.
