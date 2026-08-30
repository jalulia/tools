# CHECKPOINT E2 — the atoms table

The atoms surface Julia will judge the TEXTURE question by. The whole answer
is in the shelf order.

## The texture question, answered by looking

Route `#/atoms` renders 18 atoms as horizontal shelves. The first three
shelves, in this order, are:

- **TEXTURE** (6) — paper-tooth, dot-screen-20, bayer-8-threshold, ink-chain,
  granulation, edge-bloom
- **SUBSTRATE** (2) — bone-140gsm, tyvek (×0 — the discipline)
- **PROCESS** (3) — two-drum-offset, xerox-degradation, watercolour-wash

Bone 140 gsm sits in SUBSTRATE, not TEXTURE. Paper tooth sits in TEXTURE.
The answer to *"does TEXTURE make more sense to house things like Paper,
Print?"* is on the page: no — texture is their sibling. She can see it
without reading a paragraph.

Shot: `team2/build-e/shots/e2/atoms-1440.png`.

## What ck-e2 shipped

| kind        | count | atoms |
|---|---|---|
| texture     | 6 | paper-tooth · dot-screen-20 · bayer-8-threshold · ink-chain · granulation · edge-bloom |
| substrate   | 2 | bone-140gsm · tyvek |
| process     | 3 | two-drum-offset · xerox-degradation · watercolour-wash |
| colour      | 1 | oklab-ramp |
| engine      | 4 | mulberry32 · halftone-js · paper-js · field-js |
| field       | 1 | fbm-noise |
| mark        | 1 | cut-paper-edge |
| **total**   | **18** | |

Every cell paints its own swatch **live from `encyclopedia/swatches.js`**,
which uses the engines already on disk (`content/_engines/*.js`) plus
per-atom canvas painters where the engine does not exist yet (the substrate
and process atoms). No stand-ins. The chrome is grey; the swatches carry
their own colour (REVIEW-ARCHITECT §2.6 — the OKLab ramp reads as evening
sky, not as another neutral rectangle).

## The atom entry page

`#/atom/<id>` (see `atom-paper-1440.png`):

- Kicker · title · kind · used-count · status pill
- One-sentence description, then the live swatch at design width (~400 px)
- **Parameters** — every param declared with default/min/max and a drag
  slider that redraws the swatch inline
- **Used by** — a grid of the pieces that cite this atom, each cell showing
  the piece's OWN thumbnail (or "no thumbnail on file"). Never a re-render
  of the atom (Julia's red line §2.2).
- Right rail: **Produced by** technique, **Admitted by** styles, **Engine
  file** path, **Governed by** skills.

Paper tooth: nine real thumbs (W1, B1, B2, C1, D4, D6, PM7, E4, E5).
Tyvek: zero — the empty cell is the point.

## What ck-e2 did NOT do

- **Promotion of chapter examples to top-level explorations** (13.0-13.3
  becoming their own entries with `instance_of: ['13-fractal-brownian-motion']`)
  is ck-e3's job — it belongs with the technique-page instance strips, not
  here, and inflates the entry count by ~80.
- **Bespoke atom folders with engine files.** The engine atoms
  (mulberry32, halftone-js, paper-js, field-js) still render as a
  file-card swatch; the real engine is already loaded from
  `content/_engines/*.js` by index.html and used by every fragment
  underneath. The card is the entry; the file is the runtime.
- **Symptoms and Unfiled** stay behind their ck-e0 placeholder pages.
  ck-e6 fills them.

## The rendering budget

18 canvases painting synchronously at DPR 1.5 measured ~40 ms on a mid
desktop, which fits inside one frame. Anything past 2000 px of doc scroll
falls back to an IntersectionObserver with a 400 px approach margin, so a
future 60-atom shelf never blocks the page. Same eviction discipline as the
press-bench sheet — cheapest possible check that the budget holds is a
number in the mount counter on the page.

## Verification

    node scripts/build-site.mjs   → all manifests verified

    encyclopedia/manifest.js — 77 entries, 16 sections, 6 styles, 14 skills

77 = 26 techniques + 18 atoms + 33 explorations. Every `uses[]` on the 33
explorations resolves to an atom in this manifest. Every atom carries a
`kind`. Every technique that is canonical AND has instances carries a
`critique.reads_as/coupling/pass_order` OR is `stub: true`. Zero problems.

Zero console errors at 1440 and 390.

Shots: `team2/build-e/shots/e2/{atoms-1440,atoms-390,atom-paper-1440,
atom-bone-1440,atom-riso-1440,atom-mulberry-1440}.png`.
