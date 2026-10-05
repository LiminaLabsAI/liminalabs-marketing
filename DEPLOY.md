# Deploying liminalabs.in

The site is hosted on **Cloudflare Pages**, project `liminalabs-marketing`, on the
same account as `intent-studio-frontend`, `intent-studio-marketing` and
`cerebrio-marketing`. The free plan covers it: static requests and bandwidth are
unlimited, and this site is 140 files and 22 MB against limits of 20,000 files
and 25 MB per file.

```bash
node build.mjs      # src/ → the repo root, enforcing the copy rules
node publish.mjs    # the repo root → dist/, enforcing what may be published
npx wrangler pages deploy dist --project-name=liminalabs-marketing --branch=main
```

Live at <https://liminalabs.in>.

## Deploying

**Normally you do not.** `.github/workflows/deploy.yml` runs the three commands
above on every push to `main`. Pushing is the deploy.

The workflow adds one check the laptop path cannot: that the built HTML committed
at the repo root still matches `src/`. The output is committed so the tree reads
as what is actually served, and a source edit pushed without a rebuild quietly
breaks that — CI would deploy the fresh build while the committed pages said
something else. It fails instead. The fix is `node build.mjs` and commit.

It needs one secret, `CLOUDFLARE_API_TOKEN`:

1. Cloudflare → **My Profile** → **API Tokens** → **Create Token**
2. **Custom token** with one permission: **Account → Cloudflare Pages → Edit**
3. Scope it to this account only, create it, copy the value (shown once)
4. GitHub → repo **Settings** → **Secrets and variables** → **Actions** →
   **New repository secret** → name `CLOUDFLARE_API_TOKEN`

The account id in the workflow is deliberately not a secret — it appears in every
dashboard URL. Only the token is.

---

## Why there is a publish step

`build.mjs` writes its output to the repo root, next to `src/`, `specs/` and
`.momentum/`. That suits GitHub Pages, which serves the repo as it stands. Upload
that root to any other host and you publish the page sources and the internal
specs along with the site.

`publish.mjs` copies out an **allowlist** into `dist/`. Never a denylist: a
denylist fails open, so a directory added next year that nobody remembered to
exclude ships to the public. Three checks run before anything is uploaded, and
each one has already caught something real:

| Check | What it caught |
|---|---|
| Every local `href`/`src` resolves inside `dist/` | `design-system/index.html`, a dev demo whose links assume the repo root — it would have 404'd at `/design-system/` |
| No `style="…"` attribute on a site page | four inline styles the CSP silently drops, which is a layout bug with no error a reader would connect to it |
| Every inline `<script>` matches the CSP hash | would catch a second inline script being added without the policy knowing |

`dist/` is generated and git-ignored.

## Headers

`publish.mjs` generates `dist/_headers`. The Content-Security-Policy is
`default-src 'self'` with no exceptions, which is only honest because the site
genuinely makes no external requests — no CDN, no font host, no analytics host.
Anything that later adds one breaks visibly at publish time instead of quietly
shipping.

The single inline script is the theme-flash preventer in `src/partials/shell.html`.
It must be inline and must run before first paint, so it is allowed by hash — and
the hash is **computed from the partial on every publish**, never pasted in. Paste
it and the next edit to that script loads the site in the wrong theme for everyone
who chose dark.

HTML revalidates on every request. `design-system/` and `assets/` are versioned in
the URL (`?v=6.1`, moved by `bump-version.mjs`), so they are held for a year.

## 404

`404.html` is written to the **root**, not to `404/index.html`. Cloudflare Pages
and GitHub Pages both look for `/404.html` and nowhere else; put it in a directory
and unknown URLs answer `200` with the home page, which a search engine reads as a
soft 404 and indexes as duplicates. `build.mjs` special-cases the slug `404`
alongside `index` for this reason.

---

## DNS cutover — done, 2026-10-05

`liminalabs.in` now runs on Cloudflare nameservers (`laila`/`quinton.ns.cloudflare.com`,
the pair already serving `thecerebrio.ai`). The domain is still **registered at
GoDaddy** — only DNS hosting moved; this was not a transfer.

It had to move because the apex could not be served from GoDaddy: a CNAME is
illegal at a zone apex, Cloudflare Pages publishes no fixed IPs to put in an A
record, and GoDaddy has no CNAME flattening. Vercel did publish such an IP
(`216.198.79.1`), which is how the apex worked before.

Two lessons from the migration, if this is ever done for another domain:

- **Cloudflare's import scan missed four live records** — `app.intent`, `intent`,
  `api.intent` and the Oracle DKIM key `oci1._domainkey`. The GoDaddy zone export
  is what caught them. Never trust the scan; reconcile against the export.
- **You cannot pre-verify the new zone with `dig`.** Querying
  `@laila.ns.cloudflare.com` before activation answers recursively from the *old*
  nameservers, so it looks like confirmation and is not. `+norecurse` returns
  SERVFAIL, which is the real signal. The dashboard record list is the authority
  until the registry switches.

**Record the current zone before changing anything.** Cloudflare scans existing
records when a domain is added, but the scan is best-effort and a missed `MX`
takes `hello@liminalabs.in` down — the only contact route the whole site offers.

The zone as it was at GoDaddy, for reference:

```
MX      @                 10 mx.zoho.in · 20 mx2.zoho.in · 50 mx3.zoho.in
TXT     @                 v=spf1 include:zoho.in include:ap.rp.oracleemaildelivery.com ~all
TXT     @                 zoho-verification=zb28792761.zmverify.zoho.in
TXT     _dmarc            v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;
TXT     zmail._domainkey  v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCpUoN1wO0NAF/BUweuN/eRZaASKs86t6CKEGQwq+fJEKLuxcF3rza10aXJwl3/cRzGcajvblhsK2uCMxNBhh3L6wva7P3brd3fl3jG0hScsPDRwGmLpmmlceXXaMee8lR3FybBs5WbREppd7mAob8qVLAHrsRRT0QNLifRz/I0TQIDAQAB
CNAME   app.intent        → intent-studio-frontend.pages.dev
CNAME   intent            → intent-studio-marketing.pages.dev
A       @                 → 216.198.79.1          (Vercel — replaced by the move)
CNAME   www               → …vercel-dns-017.com   (Vercel — replaced by the move)
```

The five email records are the ones to be careful about. `MX` carries the mail,
`SPF`/`DKIM`/`DMARC` decide whether what you send is believed — and losing those
three does not bounce anything, it just moves your mail to other people's spam
folders, which can take weeks to notice. `zmail._domainkey` is the DKIM key and is
long enough to be truncated by a careless copy; check its tail matches
`…Rz/I0TQIDAQAB` after the move.

This list is what resolves from outside. It cannot show a record that exists but
answers nothing, so **export the zone file from GoDaddy** before you start and
treat that as the authority.

Verified live on Cloudflare after the switch: all three `MX`, SPF, DMARC, the Zoho
DKIM key (tail `…Rz/I0TQIDAQAB`), the Oracle DKIM key, `api.intent`, `app.intent`,
`intent`, and every page of this site over HTTPS on both the apex and `www`.

Two dashboard notices on the DNS page are expected and neither is a fault. The
blue note on the apex CNAME is Cloudflare saying it is using CNAME flattening —
the feature the move was for. The amber warning on `app.intent` says the zone's
wildcard certificate does not cover a two-level subdomain, which is true and does
not matter: Pages issues that hostname its own certificate
(`CN=app.intent.liminalabs.in`), and it serves 200.

**Still to do:** confirm `hello@liminalabs.in` receives a test message, then remove
the project from Vercel. Not before.

Also outstanding, from `LAUNCH.md`: 301s from `preceptaai.com` → `/precepta` and
`intent.preceptaai.com` → `/intent-studio`, preserving deep paths. Those are
cheapest as Cloudflare Bulk Redirects once both zones are on the account.

---

## Analytics

**Cloudflare zone analytics**, which needs no script at all. It is collected at the
edge from requests that already pass through Cloudflare, so it costs the site
nothing: no JavaScript, no cookie, no external request, and no change to
`build.mjs`. It appears by itself once the domain is proxied — there is nothing to
install. Free plan gives requests, unique visitors, bandwidth and country, over a
rolling 30 days.

**Cloudflare Web Analytics** — the *Web analytics* item in the dashboard sidebar —
is the other one, and it is deliberately not used. It reports more (per-page views,
referrers, Core Web Vitals) but it works by loading a beacon from
`static.cloudflareinsights.com` in the visitor's browser. That ends the property
that this site makes zero external requests: a buyer evaluating us on data
sovereignty can check that in a browser's network tab in about thirty seconds, and
on that axis it is worth more than page-view counts on a marketing site. It would
also mean weakening the `BANNED` list in `build.mjs`, which is the guard that has
kept this true so far. Enabling it from the dashboard rather than in code does not
change what the visitor's browser does — it only hides it from the repo.

If per-page numbers are wanted later, the route that keeps the claim intact is a
cookieless counter served from this domain — a Worker on `liminalabs.in` writing to
Analytics Engine — so the only request is first-party. That is what `LAUNCH.md`
has always prescribed, and it is more work than either of the above.
