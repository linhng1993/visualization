#!/usr/bin/env node
// Checks visual-learn pages against the visual-design rules.
// Usage: node check_page.mjs a.html [b.html ...]
// Prints results per file. Exit 0 = every file passes (warnings allowed),
// 1 = at least one file failed (rule broken, unreadable, or no valid DATA block). 2 = no files given.
import { readFileSync } from "node:fs";

const files = process.argv.slice(2);
if (!files.length) { console.error("Usage: node check_page.mjs a.html [b.html ...]"); process.exit(2); }

function check(file) {
let html;
try { html = readFileSync(file, "utf8"); } catch (e) { console.error("Cannot read " + file); return 2; }
const m = html.match(/\/\/ ===== DATA[^\n]*\n([\s\S]*?)\/\/ ===== END DATA =====/);
if (!m) { console.error("No // ===== DATA ... END DATA ===== block found."); return 2; }

let PAGE;
try { PAGE = new Function(m[1] + "\nreturn PAGE;")(); }
catch (e) { console.error("DATA block does not parse: " + e.message); return 2; }

const errors = [], warns = [];
const words = s => String(s ?? "").replace(/\[\[[\w-]+:(.+?)\]\]/g, "$1").trim().split(/\s+/).filter(Boolean).length;
const colors = PAGE.colors || {};
const LAYOUTS = ["map", "flow", "table", "strip", "tiles"];

for (const k of ["id", "title", "icon", "why", "layout"]) if (!PAGE[k]) errors.push(`Missing PAGE.${k}`);
if (!LAYOUTS.includes(PAGE.layout)) errors.push(`layout must be one of ${LAYOUTS.join(", ")}`);
if (words(PAGE.why) > 14) warns.push(`"why" is ${words(PAGE.why)} words; keep it to one short line`);

// back-to-hub link: the page hides the button if it is not http(s)
const navHub = PAGE.nav && PAGE.nav.hub;
if (navHub && !/^https?:\/\//i.test(String(navHub).trim())) warns.push(`nav.hub is set but not http(s) ("${String(navHub).slice(0, 40)}"); the "← Hub" button will be hidden`);

// colour keys must exist; one hex = one meaning
const usedKey = (k, where) => { if (k && k !== "grey" && !colors[k]) errors.push(`${where}: colour key "${k}" not in PAGE.colors`); };
const seen = {};
for (const [k, c] of Object.entries(colors)) {
  const h = String(c.hex || "").toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(h)) errors.push(`colors.${k}.hex must be #RRGGBB`);
  if (seen[h]) errors.push(`Colour ${h} used for two meanings: "${seen[h]}" and "${k}"`);
  seen[h] = k;
}

// red/green clash with mistake colours
const hue = h => { const r = parseInt(h.slice(1,3),16)/255, g = parseInt(h.slice(3,5),16)/255, b = parseInt(h.slice(5,7),16)/255;
  const mx = Math.max(r,g,b), mn = Math.min(r,g,b), d = mx - mn; if (!d) return -1;
  let x = mx === r ? ((g-b)/d) % 6 : mx === g ? (b-r)/d + 2 : (r-g)/d + 4; return (x*60 + 360) % 360; };
if (PAGE.mistakeColors !== false && (PAGE.mistakes || []).length) {
  for (const [k, c] of Object.entries(colors)) {
    const H = hue(String(c.hex));
    if (H >= 0 && (H < 15 || H > 345 || (H > 90 && H < 160)))
      errors.push(`colors.${k} is red/green but mistakes also use red/green. Set mistakeColors:false`);
  }
}

const items = PAGE.items || [];
if (["map", "flow"].includes(PAGE.layout)) {
  if (items.length < 3 || items.length > 7) errors.push(`items: ${items.length} (need 3-7)`);
  items.forEach((b, i) => {
    if (words(b.label) > 5) errors.push(`items[${i}].label "${b.label}" > 5 words`);
    usedKey(b.color, `items[${i}]`);
    const L = b.leaves || [];
    if (L.length > 7) errors.push(`items[${i}] has ${L.length} leaves (max 7)`);
    L.forEach((l, j) => {
      if (!l.main) errors.push(`items[${i}].leaves[${j}] missing main`);
      for (const f of ["main", "gloss", "example"]) if (words(l[f]) > 14) warns.push(`items[${i}].leaves[${j}].${f} is ${words(l[f])} words - shorten`);
    });
  });
}
if (PAGE.layout === "table") {
  const t = PAGE.table;
  if (!t) errors.push("layout table needs PAGE.table");
  else {
    if ((t.columns || []).length > 4) warns.push("more than 4 columns is hard to read on a phone");
    if ((t.rows || []).length > 7) errors.push(`table rows: ${t.rows.length} (max 7)`);
    (t.columns || []).forEach((c, i) => usedKey(c.color, `table.columns[${i}]`));
    (t.rows || []).forEach((r, i) => {
      if (words(r.label) > 5) errors.push(`table.rows[${i}].label > 5 words`);
      if ((r.cells || []).length !== (t.columns || []).length) errors.push(`table.rows[${i}] cell count != columns`);
      (r.cells || []).forEach((c, j) => { if (words(c) > 10) warns.push(`table.rows[${i}].cells[${j}] is ${words(c)} words`); });
    });
  }
}
if (PAGE.layout === "strip") {
  if (!PAGE.strips || !PAGE.strips.length) errors.push("layout strip needs PAGE.strips");
  else {
    if (PAGE.strips.length > 7) errors.push(`strips: ${PAGE.strips.length} (max 7)`);
    PAGE.strips.forEach((s, i) => { if ((s.blocks || []).length > 7) errors.push(`strips[${i}] > 7 blocks`);
      (s.blocks || []).forEach((b, j) => usedKey(b.color, `strips[${i}].blocks[${j}]`)); });
  }
}
if (PAGE.layout === "tiles") {
  if (!PAGE.tiles || !PAGE.tiles.length) errors.push("layout tiles needs PAGE.tiles");
  else {
    if (PAGE.tiles.length > 7) errors.push(`tiles: ${PAGE.tiles.length} (max 7)`);
    PAGE.tiles.forEach((t, i) => { usedKey(t.color, `tiles[${i}]`); if (words(t.label) > 5) errors.push(`tiles[${i}].label > 5 words`); });
  }
}
if ((PAGE.mistakes || []).length > 7) errors.push("more than 7 mistakes; pick the top 7");
const st = PAGE.selftest;
if (!st || !(st.items || []).length) errors.push("Every page needs a self-test (selftest.items)");
else if (st.items.length > 7) errors.push(`selftest: ${st.items.length} items (max 7)`);
else if (st.items.length < 3) warns.push(`selftest: ${st.items.length} items (aim for 3-7)`);

// inline [[key:text]] markup must use known keys
for (const [, k] of JSON.stringify(PAGE).matchAll(/\[\[([\w-]+):/g)) usedKey(k, "inline [[" + k + ":...]]");


warns.forEach(w => console.log("WARN  " + w));
errors.forEach(e => console.log("ERROR " + e));
console.log(errors.length ? `FAIL (${errors.length} errors)` : `PASS (${warns.length} warnings)`);
return errors.length ? 1 : 0;
}

let worst = 0;
for (const f of files) {
  console.log(`== ${f}`);
  const r = check(f);
  if (r !== 0) worst = 1;
}
process.exit(worst);
