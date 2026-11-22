# Subject pack template

A subject pack tells the skill how pages for one subject should look. It lives in the project as `claude/subject-pack.md`.

## The questions (ask at most 3, only what is missing)

1. **Leaf format.** What does one line of content look like? (e.g. term + gloss + example; rule + reference; step + why)
2. **Colour meanings.** Which 3–6 things deserve a colour? One colour = one meaning. (e.g. input vs. process vs. output)
3. **Self-test style.** `gap`, `which`, `explain` or `recall` (see `layouts.md`).

If the subject is covered by a starter in `packs/`, start from it and only confirm.

## Blank pack

```markdown
# Subject pack: <subject>

## Leaf format
main = ...
gloss = ... (or none)
example = ... (or none)
ref = ... (or none)

## Colours (one colour = one meaning)
| key | hex | meaning |
|---|---|---|
| ... | #RRGGBB | ... |

Uses red or green for meaning? yes / no   (yes → set `mistakeColors: false`)

## Icons (same idea → same icon)
| idea | icon |
|---|---|

## Self-test style
gap | which | explain | recall

## Sources
- Source docs the skill may read: ...
- Error list (for "my mistakes"): ... or none
```
