# CHECKPOINT E3 — techniques as the front door

`#/techniques` is now the encyclopedia's landing route, as ck-e0 already
declared. What ck-e3 finishes is the shape of that page: every row carries
a contact strip, every layer is a shelf, and UNFILED lives at the top of
the page (D1 · julia-proxy's non-optional condition on the "techniques
as front door" recommendation).

## The technique index — `#/techniques`

Grouped by the seven-layer position each technique acts at, from the
composing-computational-material-systems skill:

- **SOURCE** (10) — chapters 00–04, 10–13, plus the `unlinked-shader` stub
- **STRUCTURE** (6) — 05 shaping, 07 shapes, 08 matrices, 09 patterns, 14 fractals, 21 domain warping
- **MATERIAL RESPONSE** (2) — 15 textures, hillshade-and-flow (stub)
- **IMAGE FORMATION** (3) — 20 dithering, seven-pass-band-chain, depth-aware-dither
- **SCREEN-SPACE** (4) — 16 image ops, 17 kernels, 18 filters, 19 other effects
- **GRAPHIC COMPOSITION** (1) — 06 colors

Layers come from `entries[].layer` when declared and from a hand-maintained
CHAPTER_LAYER map in views.js when not — 22 entry.js files did not need
touching. A technique with no layer files under "NO LAYER ON FILE" at the
top of the page, visibly.

Every row: title · description · status pill · CONTACT STRIP · instance
count. The strip prefers external explorations (an entry whose
`instance_of[]` cites this technique) and falls back to the chapter's own
`gallery[]` thumbs where none exist — a chapter's inline examples ARE its
instances; promoting each to a top-level exploration (~80 new entries)
would be the "150-entry manifest" the fold set out to avoid. The row
labels which case it is ("2 inst." vs "4 examples · built-in").

UNFILED bar sits between the lede and the layers, always showing the count
of `status: unsorted` entries — zero on this branch, and that zero is a
to-do list for ck-e7's import.

Shot: `team2/build-e/shots/e3/techniques-1440.png` (also `-390.png`).

## The technique entry page — `#/technique/<id>`

Two templates land under this route:

1. **The compact technique page** (`renderTechniquePage`), for STUBS.
   Kicker (`TECHNIQUE · <LAYER>`), title, status/lane meta, one-sentence
   description, THE FIVE TESTS block, PRODUCES swatches, INSTANCES table,
   ATOMS ACROSS INSTANCES chips, ALSO APPEARS IN styles, GOVERNED BY skills,
   RULING (Julia's dated decisions where declared), pager. Shot:
   `tech-7pass-1440.png`.

2. **The chapter template**, for the 22 chapters. A chapter is BOTH the
   technique and the tutorial for it — folding the compact page over a
   chapter would hide the very build-up, params and gallery the chapter
   exists to teach. Shot: `tech-fbm-1440.png`.

The differentiator is whether the entry declares `stages[]`, `gallery[]`,
`exercises[]` or `params[]` — the course furniture. A stub has none of
those and gets the compact template; a chapter has any of them and keeps
the course template. Both are honest; both live under `#/technique/<id>`.

## The five tests

Every technique that has canonical instances gets a critique-derived tests
block (per the julia-proxy promotion rule). The four stubs on this branch
each carry a full `tests` object in the manifest, so their pages read
directly from those. Where a technique has NO tests declared and NO
canonical instance with a critique block, the page prints
"not on file · awaiting Julia" — the same discipline as the
`reference: null` cells on the press-bench.

The critique block on a technique that has 2+ instances IS derived from
the instances' own critique blocks — the tool proposes when it can, and
labels its proposals so no one mistakes them for rulings.

## Chapters as instances

Chapter examples were NOT promoted to top-level explorations (`instance_of:
['<chapter-id>']`) in this checkpoint. The judgment call: chapter 13's
four sub-examples (`octaves`, `turbulence`, `ridge`, `clouds`) live inside
the same entry.js and are the shape a build-up + gallery is; promoting
them would double the visible entry count without adding a rule, a fault
or a ruling. The technique index displays them AS EXAMPLES on the row
already, with the count labelled "built-in", so the archive still says
what is there.

When an exploration wants to cite a chapter as a technique (as W1 already
cites `seven-pass-band-chain`), it declares `instance_of[]` — same shape,
top-level entry, listed in the technique's INSTANCES table.

## Verification

    node scripts/build-site.mjs   → all manifests verified
    encyclopedia/manifest.js — 77 entries, 16 sections, 6 styles, 14 skills

Zero console errors at 1440 and 390. `prefers-reduced-motion` honoured:
`.tech-row`, `.sw-cell`, `.style-card`, `.used-cell`, `.mini-card` opt
out of transitions.

Shots: `team2/build-e/shots/e3/{techniques-1440,techniques-390,
tech-7pass-1440,tech-fbm-1440,tech-dither-1440,tech-unlinked-1440,
landing-1440}.png`.
