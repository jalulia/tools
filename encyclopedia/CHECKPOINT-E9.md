# CHECKPOINT E9 — QA matrix, fixes, README, PR body

## `scripts/qa/matrix.mjs` — rewritten for one archive

Where PR-1's matrix covered two tools (`book-of-shaders` + `components`)
across 14 criteria, PR-2 covers ONE tool (`encyclopedia`) across 19 criteria
and ~205 routes.

**Coverage:**
- routes: `#/`, `#/techniques`, `#/atoms`, `#/styles`, `#/sound`, `#/symptoms`, `#/unfiled`, `#/skills`, `#/index`, every `#/technique/<id>`, `#/atom/<id>`, `#/style/<id>`, `#/skill/<id>`, `#/entry/<id>`, `#/coupling/<id>`
- widths: 390 · 1440 (default; `--wide` adds 768 · 1024 · 1920)
- protocols: `http://127.0.0.1:<PORT>/` and `file://`
- states: `index open|closed × apparatus open|closed` — four states toggled inside one `page.evaluate` per route

**PLAN §7 criteria still checked:** 1 (no h-overflow), 2 (zero errors), 3 (forced light under dark), 4 (reduced motion), 5 (keyboard + a11y furniture), 9 (derived counts + verifyManifests), 11 (fold), 12 (contrast), 13 (route resolves silently), 14 (file:// parity).

**ck-e9 additions (15..23):**
- 15 · every `governed_by[]` resolves against `manifest.skills`
- 16 · every `uses[]` resolves to an atom in this manifest
- 17 · every `instance_of[]` resolves to a technique in this manifest
- 18 · every coupling entry has `driver` + `consequences[]`
- 19 · a proposed ruling renders as a PROPOSED chip on the entry page
- 20 · every unsorted entry declares (and renders) a `proposed_grade` tag
- 21 · the audio adapter builds its graph **without a user gesture** — assertion is on the OfflineAudioContext render path (`adapter.exportWav`), not on live playback; also checks `Shell.audio.has()` stays false before AND after
- 22 · the 74 unsorted show a thumbnail when their `entry.js` declares one — walks the whole grid in 600-px steps so lazy loading fires
- 23 · `#/symptoms` reaches every anti-pattern in ≤2 clicks from a symptom name — checks each of the 8 rows exposes ≥1 deep link to an atom / technique / known failure

## Final results — every criterion PASS

    encyclopedia/manifest.js — 168 entries, 16 sections, 6 styles, 22 skills, 74 unsorted
    all manifests verified

| #  | criterion                                                              | assertions | result |
|----|------------------------------------------------------------------------|-----------:|--------|
| 1  | No horizontal overflow in any state at any width                       |       3280 | PASS   |
| 2  | Zero console errors and zero page errors on every route                |        410 | PASS   |
| 3  | Forced light under emulated dark                                       |        240 | PASS   |
| 4  | prefers-reduced-motion                                                 |         25 | PASS   |
| 5  | Keyboard + a11y furniture                                              |          6 | PASS   |
| 9  | Derived counts + verifyManifests                                       |          1 | PASS   |
| 11 | Fold                                                                   |         24 | PASS   |
| 12 | Contrast                                                               |         96 | PASS   |
| 13 | Route resolves silently                                                |        412 | PASS   |
| 14 | file:// parity                                                         |        206 | PASS   |
| 15 | governed_by resolves                                                   |         95 | PASS   |
| 16 | uses[] resolves to atom                                                |         41 | PASS   |
| 17 | instance_of[] resolves to technique                                    |          4 | PASS   |
| 18 | coupling has driver + consequences[]                                   |          4 | PASS   |
| 19 | Proposed ruling renders as PROPOSED                                    |         10 | PASS   |
| 20 | Every unsorted carries proposed_grade                                  |         74 | PASS   |
| 21 | Audio adapter builds without a user gesture                            |          3 | PASS   |
| 22 | Unsorted thumbnails render                                             |          2 | PASS   |
| 23 | Symptoms → anti-pattern in ≤2 clicks                                   |          8 | PASS   |

Snapshot at `team2/build-e/RESULTS-ck-e9.md`. Fresh runs write to
`scripts/qa/out/{results.json,RESULTS.md}`.

## Fixes applied (all in `learn/shell.css`)

Six small rules — no shape changes, no entry.js edits.

1. `.lad-list a` — the atoms-page ladder used a fixed 220-px first column, which overflowed 390 px. Now `minmax(120px, 220px)` at ≥640, `1fr` below.
2. `.card` + `.card .cap .r` + `.card .cap .t` — long file:line source cites on unfiled cards. Added `overflow-wrap: anywhere` + `min-width: 0`.
3. `.blk.coupling` + `table.cons` — the coupling table's `white-space: nowrap` pushed the C-FLOW entry past 800 px on a phone. `nowrap` removed; `overflow-x: auto` on the container is the safety net.
4. `.colw p, .colw li, .colw h*` + `#view code, .colw code` — long uninterrupted strings in an entry's prose (a math expression, a long path) now wrap.
5. `.meta` + `.meta > *` — `min-width: 0` + `overflow-wrap: anywhere` so a long source-cite tag on an entry meta row wraps.
6. `.skill-card .stub-lab`, `.skill-card .skill-count.empty`, `.nothumb` — three uses of `--ink-3` on `--bench` landed at 4.11:1 contrast (needs 4.5:1). Raised to `--ink-2`.

## Deployed check

    node scripts/build-site.mjs
    → encyclopedia/manifest.js — 168 entries, 16 sections, 6 styles, 22 skills, 74 unsorted
    ✔ site assembled at /home/claude/tools/_site

`_site/encyclopedia/index.html` opens over `http://` and `file://` with zero
console / page errors on `#/techniques`, `#/skills`, `#/unfiled`, and
`#/skill/composing-computational-material-systems`.

## README

Rewritten to describe the encyclopedia (was: two tools). Adds the redirect
note ("Old tools/book-of-shaders and tools/components redirect to their
encyclopedia entries") plus the phase-three loop (`cp -r content/_template …`).

## PR body

`team2/build-e/PR-BODY-2.md` — verify-in-5-min commands, before/after
counts, entity table, screenshots to attach, what stays open (12 skills at
0 entries, TEXTURE-if-she-changes-her-mind, the 2 unsorted without thumbs,
the 6 tool-proposed techniques, old-tool folder cleanup), and the phase-three
loop.

## Not touched (deliberate)

- **`book-of-shaders/` and `components/` folders.** Kept on disk with
  `hidden: true` in `tool.json` and their redirect shells intact. Deletion
  is a follow-up PR after Julia clicks around and confirms nothing's
  missing.

Files touched at ck-e9:

- `scripts/qa/matrix.mjs` — rewritten
- `scripts/qa/package.json` — pinned `playwright@1.56.0` to match the vendored browser revision at `/opt/pw-browsers/chromium-1194`
- `learn/shell.css` — six phone/contrast fixes
- `README.md` — encyclopedia + phase-three loop
- `team2/build-e/PR-BODY-2.md` — PR body

Shots: `team2/build-e/shots/e9/*.png` (facet pages + coupling + phone
counterparts for techniques and unfiled).
