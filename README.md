# visual-learn

A Claude skill that turns study material into phone-first visual review pages: a mind map, flow, comparison table, sentence strip or tiles, followed by a "mistakes → fix" section and a tap-to-reveal self-test. Each project also gets one **hub** page that shows progress (curriculum, milestones, days left) and links to every page, doc, sheet and deck in the project.

Pages are plain HTML with no dependencies. They support dark mode and print to A4.

## What you get

| Piece | What it does |
|---|---|
| Review page | One learning chunk per page. Colour-coded, 3–7 items per level, short labels, ends with active recall. |
| Hub | One page per project: progress tiles, curriculum bars, milestone timeline with a "today" line, and buttons to all artifacts. |
| Subject packs | Per-subject settings: leaf format, colour meanings, icons, self-test style. |
| Checkers | `check_page.mjs` and `check_hub.mjs` enforce the layout limits before publishing. |

## Requirements

- Claude with **Skills** and a **Project** (the skill keeps its index, state and page copies in project docs under `claude/`).
- An artifact tool that offers `publish_files` and `list_files` (used to publish and republish pages by slug).
- Node 18+ for the helper scripts. They have no npm dependencies.

Without an artifact tool the skill still builds the pages and sends you the `.html` files, but it skips the hub.

## Install

1. Zip the `visual-learn/` folder (the folder itself must be the top level of the zip):
   ```bash
   zip -r visual-learn.zip visual-learn
   ```
2. In Claude, go to **Settings → Capabilities → Skills** and upload `visual-learn.zip`.
3. Open a Project and ask for something like *"make this visual"*, with notes, a photo or a topic.

On the first run the skill asks up to three questions about your subject (leaf format, colour meanings, self-test style) and saves them as `claude/subject-pack.md`. A starter is in `visual-learn/references/packs/`.

## How a run works

1. Load the subject pack and the visual index from the project.
2. Fill the DATA block of `page-template.html` (nothing else in the template changes).
3. Build and check the page with the scripts, then publish it as an artifact.
4. Log it in `claude/visual-index.md`, update `state.json`, and refresh the hub once at the end.

Updates reuse the same artifact slug, so links never change. A run costs about 10 tool calls plus 3 per new page (5 per updated page). The exact budget and the ways to stay under it are in `SKILL.md`.

## Use the scripts on their own

```bash
cd visual-learn

# build a page from a DATA block, then check it
node scripts/fill_data.mjs assets/page-template.html my-page.data.js my-page.html
node scripts/check_page.mjs my-page.html

# same for the hub
node scripts/fill_data.mjs assets/hub-template.html hub.data.js hub.html
node scripts/check_hub.mjs hub.html
```

`my-page.data.js` holds only the lines between `// ===== DATA` and `// ===== END DATA =====`. Field reference: `references/layouts.md`. Open the built `.html` in any browser. For the hub, add `?today=YYYY-MM-DD` to the URL to test how the timeline looks on another date.

Exit codes: `0` passes, `1` a rule failed, `2` bad input.

## Repository layout

```
visual-learn/
├── SKILL.md                    # the skill: workflow, cost rules, republish steps
├── assets/
│   ├── page-template.html      # review page (edit only the DATA block)
│   └── hub-template.html       # project hub
├── scripts/
│   ├── fill_data.mjs           # inject a DATA block into a template
│   ├── check_page.mjs          # page rule checker (multi-file)
│   └── check_hub.mjs           # hub checker
└── references/
    ├── layouts.md              # DATA fields per layout
    ├── state-schema.md         # state.json format and hub tile mapping
    ├── visual-index-template.md
    ├── subject-pack-template.md
    └── packs/example-concepts.md
```

## Customising

- **New subject:** copy `references/packs/example-concepts.md` into your project as `claude/subject-pack.md` and edit the colours, icons and self-test style.
- **Layouts:** `map`, `flow`, `table`, `strip` and `tiles`. Limits are enforced in `check_page.mjs`.
- **Look:** change the CSS in the two templates. Keep the `// ===== DATA` markers, since the scripts rely on them.

## License

MIT. See [LICENSE](LICENSE).
