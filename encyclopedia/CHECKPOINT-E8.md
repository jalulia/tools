# CHECKPOINT E8 — skills index + per-skill pages + facet on every entry

## The two-shelf skills index at `#/skills`

**22 skill cards on two shelves.** Composition:

| shelf | count | shape |
|---|---|---|
| Competency **rungs** (rung ≥ 2) | 8 | 2 real rungs at the top (composing-computational-material-systems, composing-computational-sound-systems), then 4 LATER RUNGS named + empty (body-of-work-variation, type-as-material, art-direct-to-supplied-canon, production-and-handoff — verbatim from `creative-competencies-suite.md §"Later rungs"`), plus 2 carried rungs from ck-e0 (brand-world, material-systems-direction). |
| **Format / craft** (rung 1) | 14 | canvas-design, frontend-design, creative-hifi-frontend, technical-illustration, patent-figure-drawing, technical-svg-diagrams, headless-render, algorithmic-art, dataviz, sell-sheet, ki-brief, and the three carried from ck-e0 (components-craft, artifact-diagramming, proof-cleanup-upscale). |

Every card shows: **name**, **one-line description**, **N entries governed**, and an **empty state** if 0 (`0 entries · empty for now`). Later rungs render as `LATER RUNG · not yet built` with a dashed card border.

Shots: `team2/build-e/shots/e8/skills-1440.png` · `skills-390.png` (the phone view stacks the two shelves into one column).

## `#/skill/<id>` — the per-skill page

Route added to the router (kept singular to match `#/technique/<id>` and `#/atom/<id>`). Falls through to the landing route on an unknown id. `views.js` gains `renderSkill(s)` and exposes it via `S.views.renderSkill`.

Every page shows:

- **Title** with role + rung
- **Contract summary** — for the two built rungs this is the *skill's own contract* rendered from a small `RUNG_TESTS` table in views.js (mirroring `corpus/skills/composing-computational-material-systems/SKILL.md` §"What to produce"): one primary read/listen sentence, **five tests** as an ordered list, and the six/five **anti-patterns** as chips.
- **Instances governed** — grouped by entity kind (technique / atom / exploration / coupling), each row linking to the entry with its status chip if not canonical.

Built-rung shots: `skill-material-1440.png` (5 tests · 69 entries · 4 groups), `skill-sound-1440.png` (5 tests · 13 entries · 4 groups incl. one coupling).

**Stub-rung page** renders as a dashed block with the "LATER RUNG · not yet built" chip in the meta, a paragraph quoting `creative-competencies-suite.md §"Later rungs"` verbatim, and a call-to-action to draft the rung via cowork against `corpus/skills/`. Shot: `skill-stub-1440.png`.

## The facet pass — `Shell.governedBy(entry)`

The ck-e0 gap this closes: only 2 of the 14 skills carried entries (composing-material-systems on every chapter, components-craft on every lens). The other 12 pages read empty.

Rather than edit 168 entry.js files by hand (many are one-line imports), the rules are **declared once in `shell.js`** as `S.governedBy(entry)` and evaluated at render time. An entry.js's explicit `governed_by[]` still wins — rules only *add*.

**Rules applied (BUILD-NOTES-ENCYC §ck-e8):**

| trigger | skills added |
|---|---|
| `lane === 'audio'` OR `section === 'sound'` OR atom kind in `{voice,space,bus}` | composing-computational-sound-systems |
| `style` in `{riso-xerox, atmospheric}` OR `section === 'print-reproduction'` OR tags match `riso/paper/xerox/print/halftone` | creative-hifi-frontend + canvas-design |
| `style === 'technical-doc'` OR id/title matches `instrument/typology/spec/dossier/drafting/dimension/blueprint` | technical-illustration |
| id/title matches `patent/figure/callout/exploded` | patent-figure-drawing |
| atom kind in `{field, engine, texture, process, substrate, colour, mark}` OR lane `glsl` OR id/title matches `p5/generative/shader/noise/fbm/cellular` | composing-computational-material-systems |
| atom.kind `field` OR p5-flavoured lens | algorithmic-art |
| id matches `^ki-\|^kls-\|-ki$` OR title contains `ki` | ki-brief |
| id/title matches `chart/plot/dashboard/meter/kpi/axis/legend` | dataviz |
| id/title/tags match `sell-sheet/line-sheet/spec-sheet/stock` | sell-sheet |

The output is de-duplicated and **filtered against `manifest.skills[]`** so a stale rule cannot smear an id that would fail verifyManifests.

`S.entriesGovernedBy(sid)` is the inverse — every UI that lists a skill's instances calls it, so the rule set stays in one place.

**Counts on the built-rung pages (live from `Shell.entriesGovernedBy`):**

    composing-computational-material-systems ....... 69 entries
    composing-computational-sound-systems ........... 13 entries
    canvas-design ................................... 13 entries
    creative-hifi-frontend .......................... 13 entries
    ki-brief ........................................ 10 entries
    sell-sheet ....................................... 2 entries
    algorithmic-art .................................. 1 entry
    dataviz .......................................... 1 entry
    (technical-svg-diagrams, headless-render, patent-figure-drawing, and
    the four later rungs land empty on purpose — no entry today shapes into them.)

## Manifest additions

`encyclopedia/manifest.js` skills[] grew from 14 → **22**:

- `+ composing-computational-sound-systems` — already present (added at ck-e0), note tightened.
- `+ 4 LATER RUNGS` with `stub: true` (schema addition below).
- `+ 7 format/craft skills` per the task list (canvas-design, frontend-design, creative-hifi-frontend, technical-illustration, patent-figure-drawing, technical-svg-diagrams, headless-render, algorithmic-art, brand-world, dataviz, sell-sheet, ki-brief — some already present).
- The 4 skills carried from ck-e0 stay (components-craft, material-systems-direction, artifact-diagramming, proof-cleanup-upscale) because entries already tag them.

`learn/manifest.schema.json` — added `stub: boolean` to the `skills[]` item so a later-rung skill can declare itself unbuilt without failing schema validation.

## Verification

    node scripts/build-site.mjs   → all manifests verified
    encyclopedia/manifest.js — 168 entries, 16 sections, 6 styles, 22 skills, 74 unsorted

Zero console / page errors on `#/skills`, `#/skill/<id>` for all 22 skill ids at 1440 and 390, and on the unknown-id fallback (`#/skill/nope` → landing).

Files touched:

- `encyclopedia/manifest.js` — skills[]
- `learn/manifest.schema.json` — `stub` on skills[]
- `learn/shell.js` — router accepts `#/skill/<id>`; adds `S.governedBy` + `S.entriesGovernedBy`
- `learn/views.js` — `renderSkillsIndex`, `renderSkill`, `skillCard`; switches all inline `#/skills/<id>` chip hrefs to `#/skill/<id>`
- `learn/shell.css` — `.skill-shelf`, `.skill-grid`, `.skill-card`, `.skill-block`, `.skill-instances`

Shots: `team2/build-e/shots/e8/*.png` (skills + one page per built rung + one stub + two format/craft).
