# `<project>/state.json` format

One file per project (e.g. `my-course/state.json`). It is the source of truth for progress.
The hub shows a **copy** of it; artifact pages can't read project docs.

Two ideas, kept apart on purpose:
- **Curriculum** = what is measured. Each module fills up as its chunks are done, so it can't be faked.
- **Milestones** = target date windows. The hub draws each window as a bar, fills it with the module's progress, and adds a "today" line, so you see at a glance whether you are on track.

## Shape

```jsonc
{
  "schema": 1,                       // bump only if this file's format changes
  "project": "Example Course",       // hub title fallback
  "updated": "YYYY-MM-DD",           // last time anything below changed
  "plan": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD", "end_label": "short text" },
  "current": { "module": "<curriculum id>", "next_step": "≤ 14 words" },

  "curriculum": [                    // modules, in study order (max 12)
    { "id": "M0", "title": "≤ 5 words", "status": "todo|doing|done", "done": 0, "total": 4 }
  ],
  "milestones": [                    // target windows, in date order
    { "id": "ms-M0", "title": "≤ 5 words", "module": "M0", "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" }
  ],
  "pages": [                         // one per visual-learn page (same as visual-index rows)
    { "id": "<PAGE.id>", "title": "≤ 5 words", "module": "M0", "status": "live|frozen", "done": 0, "total": 5 }
  ],

  "extra_tiles": [ { "label": "quizzes · avg", "value": "1 · 3.0/5" } ]   // optional, max 2
}
```

## Field rules

| Field | Rule |
|---|---|
| `curriculum[].done` / `total` | Chunks done / chunks planned. Integers, `0 ≤ done ≤ total`. Unknown plan: `total: 0` (bar shows status only). |
| `curriculum[].status` | `todo`, `doing` or `done`. `done` means 100 % even if `total` is 0. |
| `milestones[].module` | A `curriculum[].id`, or `null` for a one-day deadline (exam, submission). Then `from` = `to`. |
| `milestones[].from` / `to` | `from ≤ to`, both inside `plan.start`…`plan.end`. |
| `pages[].id` | Exactly `PAGE.id` of the page (`<subject>-<nn>-<slug>`). |
| `pages[].done` / `total` | Self-test items marked "got it" / self-test count. Written from what the user reports, never from browser ticks. |
| `pages[].status` | Same as the index `Status` column. |
| `current.module` | A `curriculum[].id`. |
| Dates | `YYYY-MM-DD`. |
| Other keys | Allowed (e.g. `weak_spots`, `cases` used by study sessions). The hub ignores them. |

Ids must be unique within each list. Every `module` reference must exist in `curriculum`.

## What each field feeds in the hub

The hub's DATA block gets `progress` and `milestones` built from this file (see SKILL.md, step 9).

| Hub part | Built from |
|---|---|
| Tile "days left" | `plan.end` − today (the page computes it live), label `plan.end_label` |
| Tile "modules done" | count of `curriculum[].status == "done"` / `curriculum.length` |
| Tile "chunks done" | Σ `curriculum[].done` / Σ `curriculum[].total` |
| Tile "pages" | `pages.length` (live + frozen) |
| Up to 2 extra tiles | `extra_tiles` as is |
| Curriculum bars | `curriculum[]` (title, status, done/total → % filled) |
| Milestone timeline | `milestones[]` windows on a `plan.start`…`plan.end` axis, each filled with its module's % and crossed by a today line |
| "Next step" line | `current.next_step` (and `current.module` highlighted) |
| Header sub-line | `updated` |

Hub `progress` object (copy into the hub DATA as is):

```js
progress: {
  updated, plan, current,
  tiles: [ {label, value}, … ],       // the 4 computed tiles + extra_tiles
  curriculum: [ {id, title, status, done, total}, … ]
},
milestones: [ {id, title, module, from, to}, … ]
```

## Full example

```json
{
  "schema": 1,
  "project": "Example Course",
  "updated": "2026-01-15",
  "plan": { "start": "2026-01-05", "end": "2026-12-31", "end_label": "course ends" },
  "current": { "module": "M0", "next_step": "Finish chunk 2, then start the lifecycle page" },
  "curriculum": [
    { "id": "M0", "title": "Foundations", "status": "doing", "done": 1, "total": 4 },
    { "id": "M1", "title": "Core concepts", "status": "todo", "done": 0, "total": 0 },
    { "id": "M2", "title": "Applications", "status": "todo", "done": 0, "total": 0 }
  ],
  "milestones": [
    { "id": "ms-M0", "title": "Foundations", "module": "M0", "from": "2026-01-05", "to": "2026-02-28" },
    { "id": "ms-M1", "title": "Core concepts", "module": "M1", "from": "2026-03-01", "to": "2026-06-30" },
    { "id": "ms-M2", "title": "Applications", "module": "M2", "from": "2026-07-01", "to": "2026-10-31" },
    { "id": "ms-exam", "title": "Exam", "module": null, "from": "2026-11-15", "to": "2026-11-15" }
  ],
  "pages": [
    { "id": "course-01-concept-map", "title": "Concept map", "module": "M0", "status": "live", "done": 0, "total": 5 }
  ],
  "extra_tiles": [ { "label": "quizzes · avg score", "value": "1 · 3.0/5" } ],
  "weak_spots": ["Definitions in chunk 1"]
}
```
