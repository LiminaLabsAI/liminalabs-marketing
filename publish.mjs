#!/usr/bin/env node
/* ============================================================================
   liminalabs.in — assemble dist/ for Cloudflare Pages

   No dependencies: `node publish.mjs`, after `node build.mjs`.

   build.mjs writes its output to the repo root, next to src/, specs/ and the
   rest of the working tree. That is right for GitHub Pages, which serves the
   repo as-is, and wrong for every other host: upload the root and you publish
   specs/, .momentum/ and the page sources along with the site.

   So this copies out an ALLOWLIST — never a denylist. A denylist fails open:
   add a directory next year, forget to exclude it, and it ships. This fails
   closed. Anything not named here does not leave the machine.

   The page list is read from src/pages/ rather than written out below, for the
   same reason build.mjs reads it: a hand-maintained second copy is a copy that
   drifts, and the drift shows up as a 404 on the one page nobody checked.
   ========================================================================= */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, cpSync, rmSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname, posix } from "node:path";

const OUT = "dist";

/* --- What ships ----------------------------------------------------------
   Everything the browser asks for, and nothing else. Note src/: the built
   pages link src/site.css and src/site.js, so those two files are public
   assets that happen to live in the source directory. The rest of src/ — the
   page sources, the partials, the two test harnesses — is not. */
const pages = readdirSync(join("src", "pages"))
  .filter((f) => f.endsWith(".html"))
  .map((f) => f.replace(/\.html$/, ""));

const FILES = [
  "index.html",
  "favicon.ico",
  "manifest.webmanifest",
  "src/site.css",
  "src/site.js",
  ".well-known/security.txt",
  /* Mirrors build.mjs: index and 404 are written to the root, the rest to
     <slug>/index.html. Cloudflare Pages serves /404.html for anything it
     cannot match, and answers with a real 404 status rather than 200. */
  ...pages.filter((p) => p !== "index" && p !== "404").map((p) => `${p}/index.html`),
  ...(pages.includes("404") ? ["404.html"] : []),
];

const DIRS = ["assets", "design-system"];

/* Carried inside those directories but not public. The design system's demo
   page links its CSS as design-system/css/… — relative to the repo root, where
   you open it in development. Served at /design-system/ it resolves to
   /design-system/design-system/css/… and renders unstyled, so it has never
   worked in public and is not meant to. The link check below is what found it. */
const EXCLUDE = ["design-system/index.html"];

/* --- Content-Security-Policy ---------------------------------------------
   The site makes no external requests, so the policy can say exactly that:
   'self' and nothing else. No CDN, no analytics host, no font host — and
   because the policy is this tight, anything that later tries to add one
   breaks visibly here instead of quietly shipping.

   The one inline script is the theme-flash preventer in the shell partial. It
   has to be inline and it has to run before first paint, so it is allowed by
   hash. The hash is computed from the partial on every publish rather than
   pasted in: edit that script, forget to update a pasted hash, and the site
   loads in the wrong theme for everyone who chose dark. */
function cspHash() {
  const shell = readFileSync(join("src", "partials", "shell.html"), "utf8");
  const m = shell.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) throw new Error("shell.html: inline theme script not found — CSP hash cannot be computed");
  return "sha256-" + createHash("sha256").update(m[1], "utf8").digest("base64");
}

const csp = [
  "default-src 'self'",
  `script-src 'self' '${cspHash()}'`,
  "style-src 'self'",
  "font-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

/* Cache: HTML must revalidate or a copy change takes a week to appear. The
   design system and the fonts are versioned in the URL (?v=6.1, bumped by
   bump-version.mjs), so they can be held for a year. */
const headers = `/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/design-system/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;

/* --- Assemble ------------------------------------------------------------ */
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const missing = [];
for (const f of FILES) {
  if (!existsSync(f)) { missing.push(f); continue; }
  mkdirSync(dirname(join(OUT, f)), { recursive: true });
  cpSync(f, join(OUT, f));
}
for (const d of DIRS) {
  if (!existsSync(d)) { missing.push(d + "/"); continue; }
  cpSync(d, join(OUT, d), { recursive: true });
}

if (missing.length) {
  console.error("\nPUBLISH FAILED — expected files are not there:\n  " + missing.join("\n  ") +
                "\n\n  Run `node build.mjs` first.\n");
  process.exit(1);
}

for (const f of EXCLUDE) rmSync(join(OUT, f), { force: true });

writeFileSync(join(OUT, "_headers"), headers);

/* --- Every link must resolve inside dist/ --------------------------------
   The allowlist above is the thing most likely to go stale: a page starts
   linking a new asset, nobody adds it here, and it 404s in public. So rather
   than trusting the list, walk the built HTML and check that every local
   href/src actually exists in what we are about to upload. */
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);

const html = walk(OUT).filter((f) => f.endsWith(".html"));
const broken = [];
for (const file of html) {
  const body = readFileSync(file, "utf8");
  const from = "/" + file.slice(OUT.length + 1);
  for (const [, url] of body.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(url)) continue;
    const clean = url.split(/[?#]/)[0];
    if (!clean) continue;
    const abs = clean.startsWith("/")
      ? clean
      : posix.resolve(posix.dirname(from), clean);
    let target = join(OUT, abs);
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, "index.html");
    if (!existsSync(target)) broken.push(`  ${from} → ${url}`);
  }
}

if (broken.length) {
  console.error("\nPUBLISH FAILED — links that would 404 in public:\n" +
                [...new Set(broken)].join("\n") +
                "\n\n  Add the file to FILES or DIRS in publish.mjs.\n");
  process.exit(1);
}

/* --- Nothing the CSP would block ----------------------------------------
   The policy above allows one inline script, by hash, and no inline style at
   all. A style="..." attribute is the easy way to break that: the browser
   drops it silently, so the page is simply laid out wrong for everyone, with
   nothing in the build to say why. One already got through this way.

   A hash cannot rescue a style attribute — CSP ignores hashes there unless
   'unsafe-hashes' is set, which gives up most of what the policy is for. So
   the rule is the simple one: put it in site.css. */
/* Scoped to the site's own pages. assets/web-snippets/ holds standalone
   copy-paste snippets for use in other projects, not pages of this site:
   nothing links them, and their markup is meant to be lifted whole into a
   codebase with its own policy. Holding them to this site's CSP would be
   asking the wrong question of them. */
const cspViolations = [];
for (const file of html.filter((f) => !f.startsWith(join(OUT, "assets") + "/"))) {
  const body = readFileSync(file, "utf8");
  const from = "/" + file.slice(OUT.length + 1);
  for (const [, attr] of body.matchAll(/\sstyle="([^"]*)"/g)) {
    cspViolations.push(`  ${from}: style="${attr}" — move it into src/site.css as a class`);
  }
  for (const [, code] of body.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    const h = "sha256-" + createHash("sha256").update(code, "utf8").digest("base64");
    if (h !== cspHash()) cspViolations.push(`  ${from}: inline <script> not covered by the CSP hash (${h})`);
  }
}

if (cspViolations.length) {
  console.error("\nPUBLISH FAILED — the Content-Security-Policy would block this:\n" +
                [...new Set(cspViolations)].join("\n") + "\n");
  process.exit(1);
}

const all = walk(OUT);
const bytes = all.reduce((n, f) => n + statSync(f).size, 0);
const biggest = all.map((f) => [f, statSync(f).size]).sort((a, b) => b[1] - a[1])[0];

console.log(`\n  dist/ ready — ${all.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
console.log(`  largest: ${biggest[0]} (${(biggest[1] / 1024 / 1024).toFixed(1)} MB, limit 25 MB)`);
console.log(`  every link resolves · source, specs and harnesses excluded\n`);
console.log(`  deploy:  npx wrangler pages deploy dist --project-name=liminalabs-marketing\n`);
