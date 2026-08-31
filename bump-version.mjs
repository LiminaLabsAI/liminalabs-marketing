#!/usr/bin/env node
/* Bump the design system's cache-busting version everywhere at once.
   Usage: node bump-version.mjs 2.1
   Every reference has to move together — the entry file, its @imports, the JS,
   and every page that links them. Miss one and a browser will serve a cached
   copy of it against freshly changed siblings. */
import { readFileSync, writeFileSync } from "node:fs";
const next = process.argv[2];
if (!next) { console.error("usage: node bump-version.mjs <version>"); process.exit(1); }
const files = [
  "design-system/css/limina.css",
  "design-system/index.html",
  "design-system/README.md",
  "src/partials/shell.html",
];
let total = 0;
for (const f of files) {
  const before = readFileSync(f, "utf8");
  const after = before.replace(/\?v=[\d.]+/g, `?v=${next}`);
  const n = (before.match(/\?v=[\d.]+/g) || []).length;
  if (after !== before) writeFileSync(f, after);
  total += n;
  console.log(`  ${String(n).padStart(2)} refs  ${f}`);
}
console.log(`\n  ${total} references now at v=${next}\n`);
