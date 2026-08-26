# Limina Labs — website

Marketing site for Limina Labs: the persistent, deterministic reasoning substrate for
enterprise AI.

Single static page. No build step, no framework, no dependencies beyond a webfont
request to Google Fonts.

## Structure

```
index.html              the whole site — markup, CSS and JS in one file
assets/logo/            wordmark lockup and standalone mark (dark ink, transparent)
assets/team/            founder photographs
```

## Local preview

Any static server will do:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly with `file://` also works.

## Deployment

The site is static, so anything that serves files will host it.

**GitHub Pages** — Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
Add a `CNAME` file containing the custom domain if one is pointed at it.

**Netlify / Vercel / Cloudflare Pages** — no build command, publish directory `.`.

## Editing notes

- **Design tokens** live in the `:root` block at the top of the `<style>` element:
  palette, the four product accent colours, type families and layout widths. Change a
  colour there rather than hunting through rules.
- **Typography** is IBM Plex — Sans for headings, Serif for body copy, Mono for labels
  and data. All three load from one Google Fonts request.
- **The autonomy dial** is driven by the `SETTINGS` array in the script at the bottom of
  `index.html`. Each entry has `title`, `grant`, `needs` and `conseq`. Add or reword
  entries there; the track, keyboard handling and fill bar adapt to the array length.
- **The loop diagram** is inline SVG in the `#loop` section. Node positions are absolute
  in a `0 0 560 460` viewBox. Edge draw-in is CSS (`.edge` with `stroke-dasharray`) and
  is disabled under `prefers-reduced-motion`.
- **Scroll reveals** use the `.rv` class plus an `IntersectionObserver`. Elements are only
  hidden when JavaScript is running (`.js .rv`), so the page degrades to fully visible
  without JS, and a 4-second timeout reveals everything if the observer never fires.

## Accessibility

Keyboard-navigable throughout, visible focus rings, a skip link, `prefers-reduced-motion`
respected, and the autonomy dial implemented as an ARIA radiogroup with roving tabindex
and arrow-key support. Keep these intact when editing.

## Outbound product links

The site links out to the individual product sites rather than duplicating their content:

- Intent Studio — https://intent.preceptaai.com/
- Precepta — https://preceptaai.com/
- Cerebrio — https://thecerebrio.ai/
- Forge — in development, described on this page only

## Open items

- Confirm the registered entity and location line in the footer.
- Settle the Limina Labs / Precepta brand relationship — `preceptaai.com` currently serves
  as both a product domain and the parent contact address.
- No customer proof, logos or product screenshots yet.
