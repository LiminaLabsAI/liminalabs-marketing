#!/usr/bin/env node
/* ============================================================================
   liminalabs.in — static site build

   No dependencies, no npm install: `node build.mjs`.

   Ten pages share one nav, one footer and one <head>. Without this, changing a
   nav item is ten edits and the tenth gets forgotten. Sources live in src/,
   output is written to the repo root so GitHub Pages serves /precepta/ from
   precepta/index.html with no rewrite rules and no CI.

   The build also enforces the copy rules — see BANNED below. A page that
   breaks one fails the build rather than reaching a buyer.
   ========================================================================= */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const SRC = "src";
const OUT = ".";

/* --- The copy rules, enforced -------------------------------------------
   Everything here is either a hard constraint from the brief or a word from
   the never-use list. Word-boundary matched so "slope" and "before" survive. */
const BANNED = [
  // hard constraints
  [/\bbeta\b/i,                    "hard constraint: never use the word 'beta'"],
  [/coming soon/i,                 "hard constraint: never say 'coming soon'"],
  [/\bforge\b/i,                   "hard constraint: never mention Forge"],
  [/\bslop\b/i,                    "hard constraint: never mention slop"],
  [/fonts\.(googleapis|gstatic)\.com/i, "no external font CDN (brief §11)"],
  [/google-analytics|googletagmanager|\bgtag\(/i, "no third-party trackers (brief §11)"],
  // never-use words
  [/AI-powered/i, "never-use word"],      [/revolutionary/i, "never-use word"],
  [/next-generation/i, "never-use word"], [/cutting-edge/i, "never-use word"],
  [/enterprise-grade/i, "never-use word"],[/industry-leading/i, "never-use word"],
  [/\bseamless/i, "never-use word"],      [/\bunlock/i, "never-use word"],
  [/\bleverage/i, "never-use word"],      [/\bempower/i, "never-use word"],
  [/game-changing/i, "never-use word"],   [/military-grade/i, "never-use word"],
  [/bank-grade/i, "never-use word"],      [/trusted by/i, "never-use phrase"],
  [/\b10x\b/i, "never-use word"],         [/supercharge/i, "never-use word"],
];

const read = (p) => readFileSync(p, "utf8");
const partial = (n) => read(join(SRC, "partials", `${n}.html`));

/* Front matter is an HTML comment so page sources stay valid HTML. */
function parse(raw) {
  const m = raw.match(/^<!--([\s\S]*?)-->\s*/);
  if (!m) throw new Error("page is missing its front-matter comment");
  const meta = {};
  for (const line of m[1].trim().split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: raw.slice(m[0].length) };
}

const fill = (tpl, vars) =>
  tpl.replace(/\{\{(\w+)\}\}/g, (whole, k) => (k in vars ? vars[k] : whole));

/* Shared values (URLs, contact) live in one file so ten pages cannot drift. */
const config = JSON.parse(read(join(SRC, "site.config.json")));
const shared = Object.fromEntries(
  Object.entries(config).filter(([k]) => !k.startsWith("_"))
);

const shell = partial("shell");
const nav = partial("nav");
const footer = partial("footer");

const pages = readdirSync(join(SRC, "pages")).filter((f) => f.endsWith(".html")).sort();
const built = [];
const problems = [];

for (const file of pages) {
  const { meta, body } = parse(read(join(SRC, "pages", file)));
  const slug = file.replace(/\.html$/, "");
  const isHome = slug === "index";
  // depth-aware asset prefix: root pages use "", nested use "../"
  const base = isHome ? "" : "../";
  const outPath = isHome ? "index.html" : join(slug, "index.html");

  // mark the current nav item
  const navHtml = nav
    .replace(new RegExp(`(<a [^>]*data-nav="${meta.nav}")`), '$1 aria-current="page" class="is-active"')
    .replace(/\{\{base\}\}/g, base);

  const html = fill(shell, {
    ...shared,
    ...meta,
    base,
    nav: fill(navHtml, shared),
    footer: fill(footer.replace(/\{\{base\}\}/g, base), shared),
    content: fill(body, { base, ...shared }),
  });

  for (const [re, why] of BANNED) {
    const hit = html.match(re);
    if (hit) problems.push(`  ${outPath}: "${hit[0]}" — ${why}`);
  }

  mkdirSync(dirname(join(OUT, outPath)), { recursive: true });
  writeFileSync(join(OUT, outPath), html);
  const found = [...new Set(html.match(/\{\{[A-Z][^}]*\}\}/g) || [])];
  built.push({ outPath, url: meta.path, bytes: html.length, found, todos: found.length });
}

if (problems.length) {
  console.error("\nBUILD FAILED — copy rules broken:\n" + problems.join("\n") + "\n");
  process.exit(1);
}

/* --- LAUNCH.md, generated ------------------------------------------------
   Written from the built pages rather than maintained by hand, so it can
   never quietly disagree with what is actually on the site. */
const notes = JSON.parse(read(join(SRC, "placeholders.json")));
const where = new Map();
for (const b of built) {
  for (const ph of b.found) {
    if (!where.has(ph)) where.set(ph, new Set());
    where.get(ph).add(b.url);
  }
}
const lines = [
  "# Launch checklist",
  "",
  "Generated by `node build.mjs` — do not edit by hand.",
  "",
  `${where.size} unresolved values across ${built.length} pages. Each renders on the page as an`,
  "amber dashed marker, so nothing here can ship unnoticed.",
  "",
  "## Placeholders in the pages",
  "",
  "| Marker | Appears on | What it needs |",
  "|---|---|---|",
];
for (const [ph, urls] of [...where.entries()].sort()) {
  const note = notes[ph] || "**Undocumented** — add it to src/placeholders.json";
  lines.push(`| \`${ph}\` | ${[...urls].sort().join(", ")} | ${note} |`);
}
lines.push("", "## Out of band — not fixable in this repo", "");
for (const t of notes._outOfBand || []) lines.push(`- ${t}`);
lines.push("");
writeFileSync("LAUNCH.md", lines.join("\n"));

const pad = (s, n) => String(s).padEnd(n);
console.log(`\n  built ${built.length} pages\n`);
console.log(`  ${pad("URL", 18)}${pad("FILE", 30)}${pad("SIZE", 9)}PLACEHOLDERS`);
for (const b of built) {
  console.log(`  ${pad(b.url, 18)}${pad(b.outPath, 30)}${pad((b.bytes / 1024).toFixed(1) + "K", 9)}${b.todos || "—"}`);
}
const totalTodos = built.reduce((n, b) => n + b.todos, 0);
console.log(`\n  copy rules: clean · ${where.size} distinct placeholders across ${totalTodos} slots → LAUNCH.md\n`);
