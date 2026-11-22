# DATA fields per layout

Every page has these fields:

```js
id: "bio-03-photosynthesis",        // stable; <subject>-<nn>-<slug>
subject: "Biology",
title: "Photosynthesis",
icon: "🌱",
why: "How plants turn light into stored energy.",   // ≤ 14 words
layout: "map",                // map | flow | table | strip | tiles
colors: { key: { hex: "#RRGGBB", label: "Meaning" } }, // from the subject pack
mistakeColors: true,          // false if the pack uses red or green
nav: { hub: "<url from the index Hub: line>" },       // "" if Hub: none; button hidden when empty
mistakes: [ { wrong, right, icon, note? } ],           // 0-7, from the error list only
selftest: { style: "gap|which|explain|recall", prompt?, items: [ { q, a } ] }  // 3-7
```

Text fields accept two bits of markup:
- `[[key:text]]` → text in the colour of `colors.key`
- `___` (3+ underscores) → a fill-in gap line

Unused layout fields stay `null`.

## map / flow — `items`

```js
items: [
  { label: "Light reactions", icon: "⚡", color: "process",
    leaves: [ { main: "Light energy is captured as ATP", gloss: "", example: "Happens in the thylakoids", ref: "" } ] }
]
```
- 3–7 items, label ≤ 5 words (aim for 1–3).
- Leaf fields come from the pack: `main` (required), `gloss`, `example`, `ref` (small pill, e.g. "Ch. 3").
- `flow` uses the same shape; order = step order.

## table — `table`

```js
table: {
  columns: [ { label: "Option A", color: "a" }, { label: "Option B", color: "b" } ],
  rows: [ { label: "Cost", icon: "💰", cells: ["Low", "High"] } ]
}
```
- 2–4 columns (phone width), max 7 rows, cells ≤ 10 words.

## strip — `strips`

```js
strips: [
  { blocks: [ { text: "Yesterday", label: "Time",    color: "time" },
              { text: "I went",    label: "Verb",    color: "verb" },
              { text: "to the market", label: "Place", color: "place" } ],
    gloss: "Sentence order: time, verb, place." }
]
```
- 1–7 strips, max 7 blocks each. Use for sentence order or document structure.

## tiles — `tiles`

```js
tiles: [ { value: "86%", label: "Answers correct", icon: "🎯", color: "grey" } ]
```
- 2–7 tiles. Numbers come from project docs (e.g. `progress.md`), never estimated.

## Self-test styles

| style | Default prompt | Good for |
|---|---|---|
| `gap` | Fill the gap out loud, then tap Show. | Language sentences (`q` has `___`) |
| `which` | Name it before you tap Show. | "Which rule / which section" questions |
| `explain` | Say it in one line, then tap Show. | Concepts |
| `recall` | Cover the answer, recall it, then tap Show. | Anything else |
