# `claude/visual-index.md` format

One row per artifact. Update the row (don't add a second one) when an artifact changes.

```markdown
# Visual index

Hub: <slug> | <link>

| # | Topic | Layout | Link | Slug | Last updated | Status |
|---|---|---|---|---|---|---|
| 1 | Photosynthesis | map | https://claude.ai/... | 0b2c...e9 | 2026-11-22 | live |
| 2 | Word order | strip | https://claude.ai/... | 7f1a...04 | 2026-10-03 | frozen |

## Other artifacts

| Kind | Title | Link | Slug |
|---|---|---|---|
| doc | Study plan | https://claude.ai/... | 3d9e...b1 |
| sheet | Quiz log | https://claude.ai/... | a52c...70 |
```

- `Hub:` = the project's one hub (progress + buttons to every artifact below). Write `Hub: none` until it exists; step 9 of SKILL.md fills it in.
- `#` = running number; also used in `PAGE.id` (`<subject>-<nn>-<slug>`).
- `Slug` = artifact slug, needed to republish (`list_files` + `publish_files`).
- `Status`: `live` (update in place) or `frozen` (never edit).
- Other artifacts: `Kind` = `doc`, `sheet`, `deck` or `other`. They appear on the hub as buttons under their kind; pages come first.
- Dates in YYYY-MM-DD.
