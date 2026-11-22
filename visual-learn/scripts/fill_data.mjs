#!/usr/bin/env node
// Puts a DATA block into a page or hub file.
// Usage: node fill_data.mjs <base.html> <data.js> <out.html>
//   base.html = assets/page-template.html or assets/hub-template.html
//   data.js   = only the lines between "// ===== DATA" and "// ===== END DATA =====" (no marker lines)
// Exit 0 = written, 2 = bad input.
import { readFileSync, writeFileSync } from "node:fs";

const [base, data, out] = process.argv.slice(2);
if (!base || !data || !out) { console.error("Usage: node fill_data.mjs base.html data.js out.html"); process.exit(2); }
const html = readFileSync(base, "utf8");
const body = readFileSync(data, "utf8").replace(/\s+$/, "") + "\n";
if (/\/\/ ===== (END )?DATA/.test(body)) { console.error("data.js must not contain the marker lines."); process.exit(2); }
const re = /(\/\/ ===== DATA[^\n]*\n)[\s\S]*?(\/\/ ===== END DATA =====)/;
if (!re.test(html)) { console.error(`${base}: no DATA markers found.`); process.exit(2); }
writeFileSync(out, html.replace(re, (_, a, b) => a + body + b));
console.log(`wrote ${out}`);
