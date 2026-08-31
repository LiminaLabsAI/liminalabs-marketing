# Limen — the Limina Labs design system

Enterprise AI that can be trusted to act.

Limen is the interface layer for Limina Labs. It is plain CSS with custom
properties: no build step, no framework, no dependencies. Open
[`index.html`](index.html) for the living spec — every component on that page is
rendered by these files.

**The thesis.** Limina's product promise is that you can see what the system did
and it still holds you. Glass is that promise rendered: a surface you see
through that is still a boundary. That is why the system is built on translucent
panes rather than opaque cards, and it is why the ambient layer behind them is
structural rather than decorative.

Everything in `css/tokens.css` is derived from the brand kit in [`../assets`](../assets):

| Token group | Comes from |
| --- | --- |
| `--lim-cobalt-*` | the four bar fills in `assets/mark/limina-mark-cobalt.svg` |
| `--lim-frost-*` | the four bar fills in `assets/mark/limina-mark-frost.svg` |
| `--lim-navy-*` | the wordmark and sub-word colours in `assets/lockup/*.svg` |
| `--lim-ground-*` / `--lim-abyss-*` | sampled from `assets/background/deck-1920x1080-*.png` |
| `--lim-skew`, `--lim-ladder-*` | the mark's geometry — 22 across 24 down, bars 124 / 96 / 68 / 40 |
| `--lim-s-3/5/6` | the mark's bar gap (12), bar height (24) and pitch (36) |

---

## Setup

```html
<!-- Set the theme before paint so there is no flash of the wrong one -->
<script>try{var t=localStorage.getItem("limina-theme");
  if(t)document.documentElement.dataset.theme=t;}catch(e){}</script>

<link rel="stylesheet" href="design-system/css/limina.css?v=3.3">

<!-- before </body> -->
<script src="design-system/js/limina.js?v=3.3" defer></script>
```

That is the whole integration. The typefaces are **self-hosted** in `fonts/` and
loaded by `css/fonts.css`, so a page using this system makes no external
requests — no font CDN, nothing to block, nothing for a CISO to find in
devtools. Ship `fonts/` next to `css/` and the relative paths resolve.

Put a version on the two local URLs (`limina.css?v=3.3`, `limina.js?v=3.3`) and
bump it when you change them. Without it a browser will happily keep running a
cached copy of the JS against freshly edited CSS, which looks exactly like a
broken component.

Theme follows the operating system until someone chooses. `data-theme="dark"` or
`data-theme="light"` on `<html>` wins in both directions and is persisted to
`localStorage` under `limina-theme`.

---

## What makes this read as premium

Premium in consumer design signals desire. Premium in enterprise signals
**evidence of judgement** — a CISO is inferring, from a website, whether you are
the kind of organisation that stays careful when nobody is watching. Every
visual decision is read as a proxy for engineering discipline.

That gives three levers, and decoration is not one of them.

**Restraint.** One accent colour, few type sizes, few components, used
identically everywhere. A page with one accent reads as considered; a page with
five reads as unmanaged. The message is not "we have taste" — it is "we have
standards and we hold them."

**Precision.** Tabular numerals in tables, hairlines you can actually see, real
em-dashes, no orphans, consistent optical alignment. Nobody consciously notices
these. Everybody unconsciously registers their absence.

**Density.** The counterintuitive one. Consumer sites breathe because attention
is scarce; an enterprise buyer *wants* information, and hero-plus-three-cards
reads as a company with nothing to say. Dense but organised beats airy.

### What this system deliberately does not do

- **No visible glass.** Panes sit at 90–97% opacity with `blur(10px)` and
  `saturate(108%)`. The material is real but you should not notice it working.
  Frosted-glass-as-effect reads consumer, and it costs contrast that text needs.
- **No large soft shadows.** A wide diffuse halo is the tell of a card floating
  for decoration rather than because it sits above something. Shadows are short.
- **No decorative motion.** Animation carrying no information was removed. What
  remains reports state — the lift on a brand moment, the loading motifs.
- **Quiet ground.** The auras are a tint, not a light show, and the oversized
  ambient mark appears only on the home page, never behind body copy.
- **The wordmark face is not the heading face.** Setting every heading in the
  logo's typeface makes the logo ordinary. Bricolage ships as a seven-glyph
  subset for the wordmark alone; Archivo does the reading and the scanning.

The site does not publish a roadmap: it describes the vision, the products and
what is available today. That places the whole evidential load on `/trust` and
on things a buyer can drive themselves — the sandbox, an adversarial session,
the architecture argument. Keep those sharp; they are doing the work a reference
customer would normally do.

## Seven rules that are easy to get wrong

1. **Glass needs something to refract.** `base.css` paints three soft auras in
   `body::before`. Over a flat fill, `backdrop-filter` renders a grey rectangle
   and every pane in the system collapses. Do not remove that layer, and do not
   give `body` a plain background colour instead of `var(--lim-page)`.
2. **42.5° is the only diagonal.** `--lim-skew` is the mark's own lean. Accents,
   sweeps, stripes and step markers use it; nothing else in a Limina interface
   tilts. The gradient-angle form of the same lean is `--lim-stripe` (132.5deg).
3. **Size a mark with `--lim-mark-size`, never a `width` attribute.** `.lim-mark`
   sets `inline-size` in CSS, which beats any `width=""` on the `<svg>` — the
   attribute is silently ignored. Use `--sm` / `--md` / `--lg` / `--xl`, or set
   the variable directly. Same for `.lim-ladder`: set `--lim-ladder-w` and the
   bar height and gap follow, because they are computed from the mark's own
   ratios (24/124 and 12/124). Set them by hand and the logo stops being the logo.
4. **A skewed bar overflows to the right** by its own height × 0.92. Reserve that
   space — `.lim-ladder` and `.lim-ramp__bar` already do — or the next element
   sits underneath it.
5. **`--lim-text-faint` is not body copy.** It measures 2.8:1 on light and 3.9:1
   on dark. It is for rules, disabled state and decoration. Body copy uses
   `--lim-text-muted`; captions and labels use `--lim-text-soft`.
6. **Filled controls are flat.** No gradient, no glow, one solid ramp value:
   `--lim-action` is cobalt-500 (`#2F47C4`, 7.45:1 against white — AAA). All
   three states are ramp steps, so retuning the button can never introduce a
   colour the mark does not have. Light darkens on hover (600) and press (700);
   dark inverts and brightens (400, 300), because on a near-black ground a
   darker hover reads as the button switching off. Depth in this system belongs
   to the glass — a button that glows competes with every pane behind it.
7. **Never recolour a single bar** of the mark, and never loop the logo. Loops
   belong to the bar motifs (`trail`, `relay`), which carry no logo status.
   `lift` is the only logo animation and it plays once.

---

## Tokens

Full list in [`css/tokens.css`](css/tokens.css). The ones you will reach for:

| Group | Names |
| --- | --- |
| Text | `--lim-text` · `--lim-text-muted` · `--lim-text-soft` · `--lim-text-faint` · `--lim-text-on-accent` |
| Action | `--lim-accent` · `--lim-accent-hover` · `--lim-accent-soft` · `--lim-accent-wash` · `--lim-link` · `--lim-focus` |
| Filled controls | `--lim-action` · `--lim-action-hover` · `--lim-action-press` — flat ramp steps, no gradient |
| Ramps | `--lim-cobalt-50…700` · `--lim-frost-100…400` · `--lim-bar-1…4` (theme-aware) |
| Status | `--lim-ok` · `--lim-warn` · `--lim-stop` (+ `-bg` variants) |
| Glass | `--lim-glass` · `--lim-glass-solid` · `--lim-glass-nav` · `--lim-glass-thin` · `--lim-glass-raise` · `--lim-blur` · `--lim-blur-lg` · `--lim-sat` |
| Edges | `--lim-edge` · `--lim-edge-dim` · `--lim-hairline` · `--lim-hairline-strong` |
| Elevation | `--lim-shadow-1` · `--lim-shadow-2` · `--lim-shadow-3` |
| Geometry | `--lim-skew` · `--lim-stripe` · `--lim-lean` · `--lim-ladder-1…4` |
| Space | `--lim-s-1…10` · `--lim-section` · `--lim-gutter` · `--lim-wrap` · `--lim-wrap-narrow` |
| Radius | `--lim-r-xs` · `-sm` · `-md` · `-lg` · `-xl` · `-2xl` · `-pill` |
| Type | `--lim-font-display` · `--lim-font-sans` · `--lim-font-mono` · `--lim-t-hero` · `--lim-t-1…4` · `--lim-t-lede` · `--lim-t-body` · `--lim-t-sm` · `--lim-t-xs` · `--lim-t-eyebrow` |
| Motion | `--lim-ease` · `--lim-ease-out` · `--lim-ease-in` · `--lim-spring` · `--lim-d-1…4` |
| Layers | `--lim-z-base` · `-raised` · `-sticky` · `-nav` · `-overlay` · `-toast` |

To retheme, redefine tokens on `:root` **after** the import. Never override a
component rule — if a component does not fit, it needs a modifier, not a patch.

---

## Components

| Component | Classes |
| --- | --- |
| Glass surface | `.lim-pane` `--solid` `--thin` `--flush` · `.lim-sweep` |
| Floating nav | `.lim-nav` · `__brand` `__wordmark` `__links` `__end` `__cta` `__toggle` · `.lim-sheet` |
| | Brand mark animation: `data-lim-lift` on the `<svg>` lifts it once on load, `.lb-lift-hover` on the link lifts it again on hover. Lift is the logo's only animation — March is for brand buttons, never the mark (see `assets/README.md`). |
| Buttons | `.lim-btn` `--primary` `--glass` `--ghost` `--sm` `--lg` · `.lim-icon-btn` `--sm` |
| Cards | `.lim-card` `--lift` `--flat` `--tight` · `__head` `__title` `__body` `__foot` |
| Mark & ladder | `.lim-mark` `--sm` `--md` `--lg` `--xl` `--flat` · `.lim-ladder` `--sm` `--lg` `--steps` `--loading` `--relay` |
| Colour ramp | `.lim-ramp` `--sm` · `__row` `__bar` `__meta` `__name` `__hex` |
| Badges | `.lim-badge` `--glass` `--ok` `--warn` `--stop` · `__dot` · `.lim-kbd` |
| Fields | `.lim-field` `--invalid` · `.lim-label` `.lim-input` `.lim-select` `.lim-textarea` `.lim-hint` `.lim-error` |
| Segmented control | `.lim-seg` |
| Stats | `.lim-stat` · `__value` `__label` `__note` |
| Progress | `.lim-progress` `--striped` |
| Table | `.lim-table-wrap` · `.lim-table` · `.lim-tabular` |
| Notes | `.lim-note` `--ok` `--warn` `--stop` |
| People | `.lim-avatar` `--lg` · `.lim-avatar-group` |
| Footer | `.lim-footer` · `__row` |
| Ambient mark | `.lim-ambient` |

**Layout and type roles** (`base.css`): `.lim-wrap` `--narrow` · `.lim-section` ·
`.lim-section-head` · `.lim-grid` `--2` `--3` `--4` `--auto` `--span-all` ·
`.lim-stack` · `.lim-row` · `.lim-rule` · `.lim-hero-type` · `.lim-t1…t4` ·
`.lim-lede` · `.lim-prose` · `.lim-eyebrow` · `.lim-mono` · `.lim-sm` ·
`.lim-xs` · `.lim-muted` · `.lim-soft` · `.lim-skip` · `.lim-visually-hidden`.

`--2` / `--3` / `--4` mean exactly that many columns and then collapse; `--auto`
fits as many as will fit, which is the right choice for lists of unknown length.

**Motion** (`motion.css`): `.lb-lift` · `.lb-march` · `.lb-hover` · `.lb-trail` ·
`.lb-relay` and `.lb-lift-hover` on a `.lim-mark` whose bars carry `.lb-bar` —
put these on the real SVG mark, which is what the kit animates. Lift plays **once**, so applying
`.lb-lift` in markup means it fires at document load and anyone who has to
scroll to it never sees it; use `data-lim-lift` instead and it waits until the
mark is on screen. March only exists on `:hover` — put `.lb-hover` on a target
big enough to find, or `.lb-march` for an always-on version. `.lim-ladder--loading` and
`--relay` are the div equivalents for small UI slots; `--loading` runs its own
keyframes because the shared ones would overwrite the ladder's lean. Plus `.lim-reveal`
(`--d1…d4`) and `.lim-enter` (`--d1…d4`). These are the same four primitives, with
the same names and timings, as `assets/web-snippets/limina-motion.css` — markup
written against either works with the other. Use this copy in products; the
snippet is for anyone who only wants the animations.

---

## Behaviour

`js/limina.js` does five things and nothing else. Everything else is CSS.

| Hook | Behaviour |
| --- | --- |
| `data-lim-theme-toggle` | Toggles light/dark, persists it, updates `<meta name="theme-color">` |
| `data-lim-nav` | Adds `.is-scrolled` past 8px so the nav thickens to `solid` |
| `data-lim-nav-toggle` + `data-lim-nav-sheet` | Mobile menu: outside click and Escape close it |
| `data-lim-lift` | Runs the logo lift when the mark first scrolls into view, not on document load |
| `data-lim-lift-replay="#id"` | A button that replays the lift on the mark it names |
| `data-lim-seg` (+ optional `data-lim-seg-target`) | Roving tabindex, arrow keys, and shows the matching `[data-panel]` |
| `.lim-reveal` | Gets `.is-in` when it scrolls into view, with a 4s safety net |

---

## Quality floor

Responsive to 320px. Every interactive element has a visible focus ring
(`2px solid var(--lim-focus)` at 2px offset). Under `prefers-reduced-motion`
every animation stops and the sweep is removed, but nothing that carries meaning
disappears — a ladder mid-progress still shows how far it got. Browsers without
`backdrop-filter` get opaque panes rather than transparent ones.

---

## Files

```
design-system/
├── index.html            the living spec — every component, both themes
├── css/
│   ├── limina.css        the only file you import
│   ├── fonts.css         @font-face for the three self-hosted families
│   ├── tokens.css        every custom property, light and dark
│   ├── base.css          reset, ambient ground, type roles, layout primitives
│   ├── components.css    every component
│   ├── motion.css        brand primitives + interface motion + reduced motion
│   └── utilities.css     a deliberately short list
├── fonts/                woff2 — Bricolage Grotesque, Archivo, IBM Plex Mono
└── js/limina.js          theme, nav, lift, reveals, segmented controls
```

`../assets` stays the source of truth for the mark, lockups, favicons, app
icons, social art and deck backgrounds. This folder never duplicates them — it
redraws the ground in CSS so it can follow the theme, and it inlines the mark as
SVG so the bars can paint with `--lim-bar-*`.
