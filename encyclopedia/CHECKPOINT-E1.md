# CHECKPOINT E1 — the fold

The Book of Shaders and Components have folded into `encyclopedia/`. Every
chapter, worked example and lens is an entry under one manifest, tagged with
an entity kind and — where legible — an `instance_of[]` or `uses[]` edge that
resolves against the atom and technique stubs declared inline.

## Counts (all derived from `entries[]`)

| kind | count | notes |
|---|---|---|
| **techniques** | 26 | 22 chapters + 4 stubs (`seven-pass-band-chain`, `depth-aware-dither`, `hillshade-and-flow`, `unlinked-shader`) |
| **atoms** | 10 | `paper-tooth`, `dot-screen-20`, `mulberry32`, `oklab-ramp`, `watercolour-wash`, `granulation`, `cut-paper-edge`, `edge-bloom`, `bayer8`, `fbm-noise` — each declared with a `kind` |
| **atoms cited via `uses[]`** | 10 | every atom stub is referenced by at least one exploration; verifyManifests fails the deploy on an unresolvable atom id |
| **explorations** | 33 | 4 worked examples + 29 lenses (KL1 folded into W1 — one record, not two) |
| **couplings** | 0 | ck-e5 files ~5 sound couplings (band-to-landscape, etc.) with `driver` + `consequences[]` |
| **styles** | 6 | verbatim from `components/manifest.js`; `atmospheric.entries` has KL1 replaced with W1 |
| **skills declared** | 14 | the full list from BRIEF-2 (§47-49) + the proposed `composing-computational-sound-systems` rung 1b (REVIEW-SOUND §1) |
| **skill tags used** | 2 | `composing-computational-material-systems` (all chapters + workeds) and `components-craft` (all lenses); the other 12 skill pages will be visibly empty until entries file against them at ck-e8 |
| **total entries** | 69 | 26 + 10 + 33 |

## The dedup

`kls01-ki-landscape` is gone from disk. Its content is folded into
`w1-seven-pass-band-chain`, which now declares:

- `entity: 'exploration'`
- `instance_of: ['seven-pass-band-chain']`
- `uses: ['paper-tooth', 'oklab-ramp', 'watercolour-wash', 'granulation',
  'cut-paper-edge', 'edge-bloom', 'mulberry32']`
- `governed_by: ['composing-computational-material-systems']`

The old KL1 URL redirects to it (`manifest.redirects` in
`encyclopedia/manifest.js`). The `atmospheric` style's `entries[]` list now
carries W1 in KL1's slot. Cross-references from `e4-masonry-cards` and
`e5-case-card` were rewritten to point at W1. The seven-pass technique stub
carries the `Ki-Landscapes/index.html:252 — CANON, do not soften` ruling as
proof the technique record is now the destination for the corpus-side
ruling as well as the encyclopedia-side content.

## Redirects

- `#/kls01-ki-landscape` → `#/entry/w1-seven-pass-band-chain`
- `#/entry/kls01-ki-landscape` → `#/entry/w1-seven-pass-band-chain`
- `#/13-fbm` → `#/technique/13-fractal-brownian-motion`
- `book-of-shaders/#/<hash>` → `../encyclopedia/#/<classified>` (soft-redirect
  page + `redirect-to-encyclopedia.js`; chapter ids become
  `technique/<id>`, worked ids become `entry/<id>`)
- `components/#/<hash>` → `../encyclopedia/#/entry/<id>`

The old `book-of-shaders/` and `components/` folders stay on disk with
`hidden: true` in `tool.json`, so they no longer appear on the landing
page but any live URL still resolves via the redirect script.

## What ck-e1 did NOT do

- **Chapter examples[] are still nested under their technique.** The task
  specifies each example (13.0, 13.1, 13.2, 13.3) becomes its own top-level
  exploration with `instance_of: ['13-fractal-brownian-motion']`. That
  expansion — roughly 80 new entries — is deferred to ck-e3 alongside the
  technique-page instance strips, so the fold ships in one commit instead of
  bulking to 150+. The routes and schema are ready; the examples[] blocks are
  already the data the ck-e3 promotion will draw on.
- **Atom pages are stubs.** ck-e2 folds each into a rendered swatch matrix
  drawn from `components/content/_engines/*.js` (paper.js, halftone.js,
  rng.js) — six of the ten atoms have their engine on disk already.
- **Governed_by is conservative.** Only two of the fourteen skills are tagged
  here. The remaining twelve are declared for the ck-e8 skill-page pass; that
  page is where a visibly empty rung is the point.

Full count printed by `node scripts/build-site.mjs`:

    encyclopedia/manifest.js — 69 entries, 16 sections, 6 styles, 14 skills
