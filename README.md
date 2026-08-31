# liminalabs.in

The Limina Labs marketing site. Ten marketing pages plus four utility pages,
static, no framework, no runtime dependencies, and **no external requests at
all** — not for fonts, not for analytics, not for anything.

```bash
node build.mjs          # build every page
node bump-version.mjs 2.2   # bump the design system cache-busting version
```

Then serve the repo root. `.claude/launch.json` defines a local server on :8080.

---

## How it is put together

```
src/
  partials/       shell · nav · footer          shared by every page
  pages/          one file per URL, front matter in an HTML comment
  site.css        marketing patterns layered on the design system
  site.js         one thing: the Products menu
  site.config.json  shared URLs and contact, so ten pages cannot drift
  placeholders.json what each {{PLACEHOLDER}} still needs
build.mjs         expands partials → writes index.html, precepta/index.html, …
design-system/    Limen — tokens, components, both themes, self-hosted fonts
assets/           the brand kit: mark, lockups, favicons, app icons, social
```

Output is committed to the repo root, so `/precepta` is served from
`precepta/index.html` by GitHub Pages with no rewrite rules and no CI.

**Never edit the built HTML at the repo root** — it is regenerated. Edit
`src/pages/` and rebuild.

---

## The build enforces the copy rules

`build.mjs` fails rather than emitting a page that breaks one. It checks for:

- the hard constraints — `beta`, `coming soon`, Forge, and the slop material
- every word on the never-use list — `enterprise-grade`, `seamless`, `leverage`,
  `unlock`, `AI-powered`, `10x` and the rest
- any external font CDN or analytics reference

It also writes [`LAUNCH.md`](LAUNCH.md) from the built pages, listing every
`{{PLACEHOLDER}}` and where it appears. That file is generated, so it cannot
quietly disagree with the site.

Placeholders render on the page as **amber dashed markers**. A placeholder that
blends in is a placeholder that ships.

---

## Rules that are not negotiable

These come from the build brief. Breaking one costs a deal, not a style point.

1. **Never fabricate an artifact.** Any attestation, probe output or audit log
   shown on the site must be real output from a real environment. There is none
   in this repo, so the site shows none — it describes the architecture instead.
   A fabricated log line is the one thing a technical buyer never forgives.
2. **Never name a customer**, claim a certification, funding, or a team size.
   None exist.
3. **Never publish a roadmap.** The site covers the vision, the products and
   what is available today. No dates, no horizons, no "what isn't built yet"
   tables — and correspondingly, never imply something unbuilt is purchasable.
4. **Never offer a self-hosted download, and never offer a sandbox.** There is
   no hosted tier — that is a positioning asset, not a gap. It means we operate
   no environment a customer's data could sit in, which is a stronger claim
   than any policy. Every route says *request an evaluation* or *talk to us*.
5. **Never present the three products as a pipeline.** They are siblings of
   equal weight. Diagram A points arrows *upward* on purpose — a left-to-right
   row tells the buyer they need all three, which is both untrue and the
   strongest objection procurement can raise.
6. **Never make Cerebrio visually subordinate.** Identical card, identical box,
   status in a chip. Never greyed, dimmed or dashed.
7. **Never assert what is true inside the reader's organisation.** Not *"your
   execution is ungoverned"*. Ask the question and let them answer it. An
   asserted problem invites an argument the reader wins.
8. **Never gate a security document.**
9. **Never publish a price.** Pricing is a conversation, not a page. Every
   commercial route leads to `/contact`.
10. **No sign-in anywhere, for now.** Limina Labs is a company, not an
    application, so there is no company-wide sign-in — and product-level entry
    points are parked too, pending a decision. Every route on the site leads to
    `/contact`. Worth knowing when that decision is made: Precepta could never
    have one anyway. It is self-hosted, so a customer signs in to their own
    deployment, at their own URL, which we neither host nor link.

Voice: British spelling, sentence case headings, plain declarative sentences,
concrete nouns. No emoji, no stock imagery, no manufactured social proof.

---

## Checking contrast

`src/contrast-harness.html` walks every page in an iframe, forces each theme,
composites translucent glass over its real backdrop and measures every
text/background pair against WCAG AA. Serve the repo and open:

```
http://localhost:8080/src/contrast-harness.html
```

It must report **TOTAL FAILURES: 0**. Two things it has already caught: the
amber `--lim-warn` sitting at 4.09:1 on its own wash, and decorative-only
`--lim-text-faint` used for numerals people are meant to read.

## Adding a page

1. Create `src/pages/<slug>.html` starting with the front-matter comment:
   ```html
   <!--
   title: Page title | Limina Labs
   description: One sentence for search and link previews.
   path: /slug
   nav: trust
   -->
   ```
   `nav` marks the matching nav item current; use `none` for utility pages.
2. Write the body. `{{base}}` resolves to the correct relative prefix.
3. `node build.mjs`.

---

## Design system

[`design-system/`](design-system/) is Limen — see its
[README](design-system/README.md). It carries the tokens, components, both
themes and the self-hosted typefaces, and everything on this site is composed
from it. If a component does not fit, it needs a modifier, not a patch.

Its cache-busting version has to move on every file at once — the entry file,
its `@import`s, and the JS. `bump-version.mjs` does all of them together, which
matters: version only the entry file and a browser will serve cached copies of
everything it imports, which looks exactly like a CSS fix that did not work.
