#!/usr/bin/env node
// Checks a built hub (hub.html) before publishing.
// Usage: node check_hub.mjs hub.html
// Flags: empty url, duplicate url, unknown kind, progress numbers with done > total.
// Exit 0 = pass, 1 = problem found, 2 = cannot read DATA block.
import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) { console.error("Usage: node check_hub.mjs hub.html"); process.exit(2); }
const html = readFileSync(file, "utf8");
const m = html.match(/\/\/ ===== DATA[^\n]*\n([\s\S]*?)\/\/ ===== END DATA =====/);
if (!m) { console.error("No // ===== DATA ... END DATA ===== block found."); process.exit(2); }
let HUB;
try { HUB = new Function(m[1] + "\nreturn HUB;")(); }
catch (e) { console.error("DATA block does not parse: " + e.message); process.exit(2); }

const KINDS = ["page", "doc", "sheet", "deck", "other"];
const errors = [], seen = new Map();
(HUB.links || []).forEach((l, i) => {
  const name = `links[${i}] "${l.label ?? ""}"`;
  const url = String(l.url ?? "").trim();
  if (!url) errors.push(`${name}: empty url`);
  else {
    if (!/^https?:\/\//i.test(url)) errors.push(`${name}: url is not http(s)`);
    if (seen.has(url)) errors.push(`${name}: duplicate url (same as links[${seen.get(url)}])`);
    else seen.set(url, i);
  }
  if (!KINDS.includes(l.kind)) errors.push(`${name}: unknown kind "${l.kind}" (use ${KINDS.join(", ")})`);
});
const chk = (o, where) => {
  if (o && Number.isFinite(o.done) && Number.isFinite(o.total) && o.done > o.total) errors.push(`${where}: done ${o.done} > total ${o.total}`);
};
((HUB.progress || {}).curriculum || []).forEach((c, i) => chk(c, `progress.curriculum[${i}] "${c.title ?? c.id ?? ""}"`));
// "x / y" tile values (modules done, chunks done)
((HUB.progress || {}).tiles || []).forEach((t, i) => {
  const r = String(t.value ?? "").match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
  if (r && +r[1] > +r[2]) errors.push(`progress.tiles[${i}] "${t.label}": ${r[1]} > ${r[2]}`);
});

errors.forEach(e => console.log("ERROR " + e));
console.log(errors.length ? `FAIL (${errors.length} errors)` : "PASS");
process.exit(errors.length ? 1 : 0);
