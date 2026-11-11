# Brief: Lensed page

A page of monospace notes with a black hole on it. Text near the hole is lensed. The hole's disk is set in characters on the same grid. The middle prints nothing.

- **Reference:** siddharth (@buildwithsid), "black hole.mp4", posted 2026-10-20. https://x.com/buildwithsid/status/2112492064336388249
- **Kind:** reference study. Credit the source on the entry. Do not reuse its copy.
- **Written:** 2026-11-05, from frames of the 1204 × 720 video.
- **All numbers:** `spec.json` in this folder. Read it before writing code. Where this file and the spec disagree, the spec wins.

## Build this

One standalone `fragment.html`, canvas, no dependencies, filed as an encyclopedia entry.

1. A 214 × 60 character grid on a 1284 × 720 plate. Cell 6 × 12 px. JetBrains Mono 10 px.
2. The page text fills the grid. Draft copy is in `spec.json` under `page_text`.
3. One hole. Its position follows the pointer on a slow spring and wanders when idle.
4. Each frame, every cell within 13 r_s of the hole is recomputed. Everything else is a cached bitmap.

## Locked

These are decided. Do not reopen them.

| Decision | Value |
|---|---|
| Glyphs | Upright, unscaled, unrotated, full opacity, always on the grid |
| Distortion | Lives in which character a cell shows. Never in how a glyph is drawn |
| Disk | Characters from a luminance ramp, same face, same grid. Never an image or gradient under the text |
| Halo characters | Real page characters, fetched through the lens map. Never random substitution |
| Sparsity | A cell prints or it does not. No opacity fades |
| Shadow | Bare paper |
| Color | Paper `#f6f6f6`, ink `#0a0a0b`, one hot ink `#e23a72` on a few cells |
| Texture | None. Screen piece |
| Bright side | Right |
| Physics | Schwarzschild geodesics, baked once. Constants in `spec.json` |

## Open to the builder

- Canvas 2D with a glyph atlas, or WebGL instancing. Pick whichever holds 60 fps.
- Bake pitch, chunking, table layout.
- Noise functions for wander, shimmer and disk texture.
- Tuning of the dropout curve and hot-ink rates by eye against the video, within the shape the spec gives.

## Pass 0

| | |
|---|---|
| Substrate | None. A screen, lit evenly |
| Process | Digital and clean. No print filters |
| Type | One monospace face at one size. The type is the layout, the image and the distortion |
| Hardware | None |
| Skeleton | 214 × 60 grid, text set solid from column 3, row 2, to the right edge |

## The four regions

Distances are from the hole, in r_s. One r_s is 27.8 px, about 4.6 columns.

| Region | Where | A cell shows |
|---|---|---|
| Far field | beyond 13 | Its own page character |
| Halo | inside 13, off the disk | The page character at its lensed source, or nothing |
| Disk | rays that land on the disk | A ramp glyph for the disk's brightness there |
| Shadow | captured rays, under 2.598 | Nothing |

## Coupling

One mass at one position. r_s sets the shadow, the disk, the Einstein radius and the halo edge. Moving the hole moves all four. The three regions cannot disagree about where the hole is or how heavy it is.

## Pass order

Page grid, lens map, dropout, disk, shadow, hot ink, draw.

Dropout runs before the disk, so it cannot punch holes in the disk. The shadow clears last, so nothing prints inside it.

## Removal test

- Without the remap, the halo is noise around a picture.
- Without the disk, the bend has no cause.
- Without the grid, it is an image filter over text.

## Faults to avoid

1. Rotating, stretching or blurring glyphs to show the bend.
2. Scrambling halo text with random characters.
3. Fading halo letters with opacity.
4. Drawing the disk as a soft image and laying text over it.
5. Tracing geodesics every frame. Bake once in the hole's frame, then look up.
6. Building the glyph atlas before the font has loaded. Wait on `document.fonts.load`.
7. Redrawing the whole page every frame. Only the halo's bounding box changes.
8. Using the ramp order as given. Re-sort it by measured ink coverage in the atlas.
9. Adding grain, paper tooth or any print texture.
10. Copying the reference's essay.

## The bake

`bake-prototype.js` is a working reference for the geodesic pass. It prints the disk as ASCII.

```
node bake-prototype.js > out.txt
```

`expected-bake.txt` is its output at the spec's geometry. The silhouette to match: an arc over the top, a band across the front, a thinner arc underneath, an empty middle, and a right side about ten times brighter than the left.

## Filing it in this repo

Facts checked on disk on 2026-11-05:

- The lens template is `components/content/_template-lens/` (`entry.js` and `fragment.html`). The README names `encyclopedia/content/_template`, which is not on disk.
- New pieces go in `encyclopedia/`. `components/` is hidden and redirects.
- Styles on disk: `atmospheric`, `display-specimen`, `editorial-serif`, `riso-xerox`, `swiss-modular`, `technical-doc`.
- `technical-doc.css` already declares JetBrains Mono from `_styles/fonts/JetBrainsMono.woff2`.
- `scripts/qa/static-checks.mjs` scans `.html` and `.js` under `components/` and `encyclopedia/`.

Steps:

1. `cp -r components/content/_template-lens encyclopedia/content/bh01-lensed-page`
2. Build `fragment.html`. Link exactly one style file, `../_styles/technical-doc.css`. Forced light: the meta, and an explicit background on `html` and `body`. `body { width: 1284px; margin: 0 auto }`. Last script is `../../../learn/fragment-boot.js`.
3. Fill `entry.js` from the draft below.
4. Add `'bh01-lensed-page'` to `entries[]` in `encyclopedia/manifest.js`, and to the `technical-doc` style's `entries[]`.
5. `node scripts/index-tools.mjs --tool encyclopedia`, then `--shots` for the thumbnail.
6. `node scripts/build-site.mjs` and `node scripts/qa/static-checks.mjs`. Both must pass.

Repo rules that bite here: classic scripts only, no network calls of any kind, no modules, no CDN. The fragment talks to the host by `postMessage` only, and `fragment-boot.js` does that for you.

### entry.js draft

Only fields that appear in the template or in `c3-kinetic-type/entry.js` are used. The schema rejects unknown keys.

```js
Shell.registerEntry({
  entity: 'exploration',
  governed_by: ['components-craft'],
  id: 'bh01-lensed-page',
  index: 'BH01',
  order: 185,                    // check it is free; c3-kinetic-type is 180
  title: 'Lensed page',
  section: 'motion-kinetic',
  style: 'technical-doc',
  status: 'exploration',         // Julia promotes it
  tags: ['Character grid', 'Lensing', 'Type as image'],
  source: { kind: 'reference-study', title: 'siddharth (@buildwithsid), black hole.mp4' },
  frame: { designWidth: 1284, aspect: '1284/720', previewHeight: 720 },
  thumb: { file: 'thumb.png', crop: [1.51, 0] },   // minimum scale is 1284*196/232/720 = 1.507
  text: '<p>A page of typed notes with a black hole resting on it, on a screen. Every glyph stays upright on a 214 by 60 grid.</p>' +
        '<p>One mass decides three things: which page character each nearby cell shows, where the disk appears, and where nothing prints.</p>',
  reference: {
    title: 'black hole.mp4, a 48 s screen recording',
    cells: [
      { k: 'Ground', v: 'off-white page of monospace notes → the same, 214 × 60 cells' },
      { k: 'Halo',   v: 'letters near the hole thin out and garble → page characters fetched through a point-lens map, then dropout' },
      { k: 'Disk',   v: 'a lensed accretion disk in ASCII, brighter on the right → baked Schwarzschild geodesics mapped to a glyph ramp' },
      { k: 'Shadow', v: 'blank paper in the middle → captured rays print nothing' },
      { k: 'Accent', v: 'a few pink characters → one hot ink on the brightest disk cells' }
    ]
  },
  pass0: [
    { k: 'Substrate', v: 'none, a screen, lit evenly' },
    { k: 'Process',   v: 'digital and clean, no print filters' },
    { k: 'Type',      v: 'JetBrains Mono 10 px, one weight; the type is layout, image and distortion' },
    { k: 'Hardware',  v: 'none' },
    { k: 'Skeleton',  v: '1284 × 720, 214 × 60 cells of 6 × 12 px, text set solid from column 3, row 2' }
  ],
  critique: {
    reads_as: 'A page of notes with a black hole sitting on it, drawn entirely in the page\'s own type.',
    coupling: 'One mass at one position sets the shadow, the disk, the lens strength and the halo edge, so the three regions cannot disagree about where the hole is or how heavy it is.',
    pass_order: 'page grid → lens map → dropout → disk → shadow → hot ink → draw. Dropout before the disk, or it punches holes in the disk.',
    operators: ['character grid', 'point-lens remap', 'dropout', 'geodesic bake', 'luminance ramp'],
    why_it_survives: 'Remove the remap and the halo is noise around a picture; remove the disk and the bend has no cause.',
    // add faults: [ ... ] here, written from your own render passes. Do not paste the list above.
  },
  links: [{ label: 'Reference post', url: 'https://x.com/buildwithsid/status/2112492064336388249' }],
  related: []                    // add a link only if it resolves; a dead one fails the deploy
});
```

## Acceptance

Run these headless. Pause the piece with the hole at (0.62 W, 0.45 H) unless a test says otherwise.

1. **Silhouette.** Disk and shadow cells agree with `expected-bake.txt` on at least 92% of cells in its 104 × 34 window.
2. **Shadow.** Blank cells span 22 ± 2 columns and 9 ± 1 rows through the hole.
3. **Beaming.** Mean disk luminance, right half over left half, is at least 4.
4. **Far field.** Every cell more than 13.5 r_s from the hole equals the page character. Zero differences.
5. **No substitution.** Every printed halo character equals the page character at the cell the lens map names.
6. **Density.** Share of printed cells: 0.2 to 0.4 between 6 and 9 r_s, 0.5 to 0.9 between 11 and 13 r_s. Set by eye from the video, so treat the bounds as a guide.
7. **Glyphs.** No canvas transform other than the device-pixel scale is active while glyphs draw.
8. **Speed.** 55 fps or better at 1284 × 720 and device pixel ratio 2. Under 4 ms of script per frame.
9. **Pause.** After `lens:pause`, zero frames draw. After `lens:resume`, drawing continues.
10. **Reduced motion.** One static frame, hole at (0.62 W, 0.45 H), no shimmer.
11. **Reading.** The full page text is present once in the DOM for screen readers, visually hidden.
12. **Guards.** `build-site.mjs` and `static-checks.mjs` pass. The page makes no network request.
13. **Look.** Three renders beside video frames at 2 s, 12 s and 30 s. Write the fault list from what differs, patch, render again. Two passes at least.

## Unknown

- How the reference was made. The post does not say. The first two dozen replies were read on 2026-11-05 and none says.
- Whether its hole follows the cursor. The video shows a slow wander and no cursor. This brief chooses pointer-follow with an idle wander.
- The reference's face and exact palette. The pink was read from compressed, antialiased pixels.

## Later, not in v1

Obel Mono (variable 100 to 900, SIL OFL 1.1) would let weight carry brightness alongside the ramp. It is not vendored in this repo. Julia decides.

## In this folder

- `BRIEF.md`: this file
- `spec.json`: every number, with what was measured and what was inferred
- `bake-prototype.js`: the geodesic pass, runnable with Node
- `expected-bake.txt`: its output, the silhouette target
