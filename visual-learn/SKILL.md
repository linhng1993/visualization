---
name: visual-learn
description: Turn study material into a phone-first visual review page (mind map, flow, table, sentence strip or tiles) with a mistakes-to-fix section and a self-test. Use this skill whenever the user wants to learn or review something visually in any subject, including "visualize this", "make it visual", "make a map", "mind map", "cheat sheet", "review page", or a photo or notes of study material plus a request to make it visual. For study content, use it INSTEAD of the inline Visualizer, Whiteboard, Design or Docs types, or a freehand HTML page, even when the request looks simple.
---

# visual-learn

> For study content, this skill replaces the built-in Visualizer, Whiteboard, Design and Docs outputs. Always build from `assets/page-template.html`; never draw a study visual freehand.

One learning chunk → one mobile-first HTML page the user reviews on their phone.
Designed for readers who learn visually and skip long text. Explanations and glosses are in English unless the subject pack says otherwise.

## Cost rules (read first)

Every tool call re-sends the whole background, so the number of steps sets the cost, not the page size. Target: about 10 tool calls per run + 3 per new page (5 per updated page).

- **Where the 10 go:** 3 reads (pack, index, `state.json`), 1 `Bash` that builds and checks all pages, then at the end of the run: index write, `state.json` write, and the hub (1 `Bash`, `list_files`, `publish_files`, save copy). One new page = `Write` data + `publish_files` + save copy (3). One update = `project_read` copy + `Write` + `list_files` + `publish_files` + save copy (5). A first-time hub adds one index write. Asking questions adds one call, only when something is missing.
- **Ways to stay lower:** write the hub DATA with a heredoc inside the hub `Bash` call (no separate `Write`); build and check all pages in one `Bash`; skip reads of files already in this chat.
- **Model hint.** This skill is template filling, so a mid-tier model is enough. If this run is on Opus or above, add one line to the first reply: "Tip: switch to a mid-tier model for visual-learn runs to save usage." Name the tier, not a model version. Say it once per chat.
- **One round of questions.** Ask once, one AskUserQuestion call, max 4 questions. Cover only what is missing, in this order: the subject-pack questions (step 1), the topic, the source doc. Offer likely options from `claude/visual-index.md` and the progress log. An attachment counts as the source doc. Page count: if not given, build 1 and don't ask. Over 4 missing? Drop from the end. Don't search through docs to guess.
- **Batch.** One run can build 1–3 pages. Read the pack, index and template once, fill each DATA block, check them together, then publish each. The index and the hub are updated once, at the end (steps 8–9).
- **Read narrowly.** Read only the source doc the user named. Read the template once (whole file or the DATA block plus field reference); never in several pieces.

## Workflow

1. **Load the subject pack.** Read `claude/subject-pack.md` from the current project.
   - Missing? Put its questions (at most 3, from `references/subject-pack-template.md`) into the one round of questions (Cost rules), then write the file.
     If a starter in `references/packs/` fits the subject, start from it and only confirm.
2. **Gather the content.** Use what the user sent (photo, notes, topic) plus the source docs the pack lists.
   Pull "my mistakes" from the project's error list (e.g. `error-list.md`) when one exists. Never invent mistakes; if there are none, leave `mistakes: []`.
3. **Check the index.** Read `claude/visual-index.md`. If the topic already has a page, go to step 7 (update in place).
4. **Pick the layout** with the table below. One page = one layout.
5. **Fill the DATA block** of `assets/page-template.html`. Change nothing outside the `// ===== DATA` markers.
   Follow the anatomy and rules below. Field reference: `references/layouts.md`.
   Set `nav.hub` to the URL from the index `Hub:` line (read in step 3). `Hub: none`, no line, or the first page of a new project → `""` (no button).
6. **Check, then publish.**
   - Build and check all pages of the run as in **Republish** step 1. Fix every ERROR; shorten text for WARNs.
   - Publish each as a new hand-built HTML artifact (**Republish** step 2).
     Title = `<Subject> · <Topic>`. Icon word: `study`.
   - No artifact tool in this session? Send the .html file instead.
   - Save the DATA copy: `project_write` with `path: "claude/pages/<PAGE.id>.js"` and `local_path` = the data file (**Republish** step 4).
7. **Update in place, never recreate.** For an existing page (slug from the index row):
   - Old DATA: `project_read` `claude/pages/<PAGE.id>.js`. Missing (page made before this version)? `read_artifact` once and take the DATA block from it.
   - Change the DATA, then build, check and republish as in **Republish** steps 1, 3 and 4. The link must stay the same.
   - Don't republish a page just to add the hub link. A page without `nav` gets it when it is next updated: add `nav: { hub: "<url>" }` to its DATA then (older copies have no `nav` line).
8. **Log it.** Add or update the row in `claude/visual-index.md` (format: `references/visual-index-template.md`).
   Docs, sheets or decks the user names for the project go in its "Other artifacts" table (kind, title, link, slug).
   If project files are read-only here, give the user the exact row to paste.
9. **Refresh the hub.** Required, once per run, after step 8, even for a batch. Every project has one hub: progress on top, buttons for all its artifacts below.
   - Write this run's pages into `<project>/state.json` (`pages[]`, `updated`; format in `references/state-schema.md`). No state file yet? Create one from the schema with what you know, or leave `curriculum` and `milestones` empty.
   - Build the hub DATA (`hub.data.js`; fields in `assets/hub-template.html`) from `claude/visual-index.md` and `state.json`: `title`, `icon`, `progress` and `milestones` as in state-schema.md ("Hub `progress` object"), and `links`: one per page row (`kind: "page"`) and one per "Other artifacts" row (its kind), each with `label`, `sub`, `icon`, `url`, `color`, `kind`. The days-left tile has `value: null`; the page computes it from `progress.plan.end`.
   - Next page: set `progress.current.next_step` to the next page or chunk to study (one short line). The hub shows it as the "Next" line; pages have no "next" link.
   - Build and check in one `Bash` call (write `hub.data.js` with a heredoc first): `node scripts/fill_data.mjs assets/hub-template.html hub.data.js hub.html && node scripts/check_hub.mjs hub.html`. Fix every ERROR (empty or duplicate url, unknown kind, done > total). Don't use `check_page.mjs` on the hub; it is for pages only.
   - Publish with **Republish** steps 3–4 (hub copy: `claude/hub.html`). The slug comes from the `Hub:` line.
   - No hub yet (`Hub: none` or no line)? Create it with **Republish** step 2 (then step 4), and write `Hub: <slug> | <link>` into the index (the one extra index write, first time only).
   - No artifact tool in this session? Skip this step and say so in one line.
10. **Reply short.** One line: what the page covers + the self-test count. The artifact card carries the link.

## Republish (pages and hub)

Never send a whole page through the chat. The project keeps the data; the page is rebuilt from the template on disk.

1. **Build and check.** `Write` each page's DATA body (lines between the markers, no marker lines) to `<id>.data.js` in the working directory. Then one `Bash` call for the whole run:
   `for id in <id1> <id2>; do node scripts/fill_data.mjs assets/page-template.html $id.data.js $id.html || exit 1; done && node scripts/check_page.mjs <id1>.html <id2>.html`
   (One page: `node scripts/fill_data.mjs … && node scripts/check_page.mjs <id>.html`.) The checker prints PASS or FAIL per file and exits 1 if any file fails.
2. **New artifact:** `publish_files` with `files: [{as: "index.html", path: "<abs path>/<id>.html"}]`, `title`, `icon`. Keep the returned slug and link.
3. **Existing artifact:**
   - `list_files` with `slug` → take `version`. (`publish_files` requires this list first, and it already returns the version, so `get_artifact` isn't needed.)
   - `publish_files` with `slug`, `base_version: <version>`, `files: [{as: "index.html", path: "<abs path>/<id>.html"}]`. Leave out `title` and `icon` (kept).
   - Rejected because the artifact is shared? `get_artifact` with `slug`, then retry with `shared_live: <its read value>` (and `artifact_title` if `public`). Version conflict? Repeat `list_files` once.
4. **Save the copy.** `project_write` with `local_path` (no content in the call): pages → `claude/pages/<PAGE.id>.js` (the data file); hub → `claude/hub.html` (the built file).

The hub uses steps 2–4 with `assets/hub-template.html` and the slug from the index `Hub:` line; its build and check is in step 9 (`check_hub.mjs`). Its DATA is rebuilt in full from `claude/visual-index.md` and `state.json` (`references/state-schema.md`), so the old hub is never read. Don't use `read_artifact` + `edit_version` for routine updates. (Hub title: `<Project> · Hub`, icon word: `hub`.)

## Layout by content

| Content | Layout (`PAGE.layout`) |
|---|---|
| Topic, vocabulary, concept family | `map` — centre → numbered branches |
| Process, steps, workflow | `flow` — top-down cards with ↓ |
| Comparison (A vs B) | `table` — colour-coded columns |
| Structure of a sentence or document | `strip` — row of coloured blocks |
| Numbers, progress | `tiles` — 2-column grid |

## Anatomy of every page

1. **Centre:** topic + icon + one line "why it matters" (≤ 14 words).
2. **Branches:** 3–7, numbered, 1–3 word labels (hard limit 5 words).
3. **Leaves:** format from the subject pack (e.g. term + gloss + example). Max 7 per branch.
4. **My mistakes → fix:** wrong (✗, strikethrough) → right (✓). Max 7.
5. **Self-test:** 3–7 items in the pack's style. Tap to reveal; tick boxes count "got it".

## Visual rules

- One screen = one chunk. Phone first (vertical). The template prints to A4 as a bonus.
- Max 7 items per level. Labels ≤ 5 words. No paragraphs anywhere.
- **One colour = one meaning** inside a subject. Never one colour for two meanings on a page. Grey = neutral.
  - Colour keys live in `PAGE.colors`; the legend renders from them.
  - Colour inline words with `[[key:word]]` (e.g. `[[noun:table]]`).
  - If the pack's colours include red or green, set `mistakeColors: false` (mistakes then use grey + ✗/✓ icons).
- Icons: use the pack's icon list. Same idea → same icon, every time.
- Every page ends with active recall. Never a read-only page.
- Tick boxes in browser storage are a convenience. Real progress lives in project docs (e.g. `progress.md`, `state.json`).

## Data rules

- Artifact pages cannot read project docs. The page holds a **copy** of the data; project docs stay the source of truth.
- Keep `PAGE.id` stable (`<subject>-<nn>-<slug>`); tick storage uses it.
- One hub per project (`assets/hub-template.html`), refreshed in step 9. Pages and other artifacts get their buttons from `visual-index.md`. Pages link back to the hub only (`nav.hub`); "next" lives on the hub, so an earlier page never needs a republish.

## Don'ts

- No long text pages. No more than 7 branches.
- Don't create a new artifact to "update" an old one.
- Don't touch pages the index marks as `frozen`.
- Don't reuse an old page's colours if they clash with the pack.

## Files

- `assets/page-template.html` — the page. Edit only the DATA block (includes `nav.hub`, the "← Hub" button).
- `assets/hub-template.html` — the project hub: progress tiles, curriculum, milestones, buttons for every artifact, with a sticky section jump bar.
- `scripts/check_page.mjs` — rule checker for pages; takes one or more files (limits, colour clashes, missing self-test, bad `nav.hub`).
- `scripts/check_hub.mjs` — hub checker (empty or duplicate url, unknown kind, done > total).
- `scripts/fill_data.mjs` — puts a DATA block into the page or hub template.
- `references/state-schema.md` — `state.json` format and what feeds each hub tile.
- `references/layouts.md` — DATA fields per layout (and `nav`), with examples.
- `references/packs/` — starter subject packs (`example-concepts.md`).
- `references/subject-pack-template.md` — the 3 questions + blank pack.
- `references/visual-index-template.md` — index format: pages, other artifacts, `Hub:` line.
