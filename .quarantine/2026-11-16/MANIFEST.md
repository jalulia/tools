# Quarantine · 2026-11-16 · the Encyclopedia, retired

Julia, 2026-11-16: "Rebuild, then get it tf outta here." Nothing here is deployed (build-site skips dot-folders). Julia does the final pass.

| Moved here | From | Why |
|---|---|---|
| `encyclopedia/` | `encyclopedia/` | Retired. 176 records; the 44 Julia kept in the CMS (moved, private or archived) were rebuilt first. |
| `components/` | `components/` | A shell that only redirected into the Encyclopedia (its lenses were folded in at ck-e1). |
| `book-of-shaders/` | `book-of-shaders/` | Same: a redirect shell into the Encyclopedia. |

## What was kept, and where it went
- `library/items/`: the 44 kept items (list in `library/items/README.md`) plus 8 support entries they use or produce (paper-tooth, mulberry32, bayer8, edge-bloom and four drivers; unlisted in the library). Same learn/ shell, same record ids (`enc:<id>`), so CMS edits and accession numbers carry over. Made by `build-items.mjs` (here).
- `learn/` stays: the shared shell, also used by ki-landscapes.

## Links repointed or dropped
- `techniques-templates/_build/registry-map.json`: 55 lifts and 27 members that pointed at removed or retired records dropped; 33 techniques that lived only in the Encyclopedia or in removed work left out of the registry (Book of Shaders chapters and others). Full list: `registry-map-drops.json` (here).
- `library/_build/collate.mjs`: crosswalk links to Encyclopedia items that were not kept are dropped, not errors.
- `techniques-templates/_build/registry.mjs`: lifts that resolved before and were removed or retired are dropped with a note; techniques whose only examples were removed are kept and listed.
- `mindgut/index.html`: 4 links to `encyclopedia/content/mir-22/entry.js` now point at this folder on GitHub.
- Left as is: `techniques-templates/templates/t-04-effect-set/registry.full.json` (sample data with old links); `scripts/qa/deployed.mjs` (dev script that read the two shells).
