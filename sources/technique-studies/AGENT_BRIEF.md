# Engine brief — Measured Plates (read all of it before touching code)

You are building technique engines for Julia Compton's Technique Studies site. Each plate is a live, generative,
single-canvas rebuild of ONE reference image's **technique** (material, process, palette, grain, structure), with
an **original composition** in that technique. The bar is a measured ≥ **98 %** technique match, and the plate must
LOOK right to a creative director at 1× and at 3–5× zoom. Numbers and eyes both have to agree.

## Files and harness (all under /home/claude/plates)
- `ref/rNN.png` — the reference(s). `src/util.js` — shared kit (rng `mulberry`, `hashI`, `vnoise`, `fbm`, `gblur`,
  `upsampleCR`, `probit`, `mk` canvas factory with willReadFrequently, `chan`, `hex`, `css`, `clamp`, `lerp`, `sstep`).
  Read util.js, src/p1.js and src/p4.js first: they are the house style for an engine file.
- `src/pNN.js` — YOUR file (NN = the reference number). It must end with `PLATES.push({...})`. Nothing else is shared;
  do not edit util.js, metrics.js, dev.html or other plates' files. If you need a helper, put it in your own file.
- `dev.html?p=pNN` loads only your plate. Every script takes the plate id:
  - `python3 shoot.py pNN out.png '{"param":v}' [paletteId]` — render once, save PNG, prints ms + errors.
  - `python3 bench.py pNN ['{"k":v}'] [--save out.png] [--raw]` — scores against `ref/rNN.png`, caches `refstats/pNN.json`.
  - `python3 search.py pNN <itemIndex> [step]` — slides an item's render window over the plate, lists best rects (use it to
    pick an honest comparable region when the composition is generated; record that you did in `bench.note`).
  - `python3 tune.py pNN k=a,b,c k2=…` — grid; `python3 cd.py pNN k=start:step … --passes N` — coordinate descent on the mean.
  - `python3 test_params.py pNN` — sweeps every slider min/max, every palette, preset, text, select; flags params that
    change nothing and any errors. Must be clean before you finish.
- Python has numpy, scipy, PIL, cv2 may or may not be present (check). Playwright + /usr/bin/google-chrome for rendering.
- The render runs in the browser live, so the budget is ≤ ~1.2 s at reference size on this machine (bench prints ms).

## Plate contract (what `PLATES.push` must contain)
```js
PLATES.push({
  id:"pNN", no:"NN", title:"Two Or Three Words", ref:{w,h},            // ref = the reference pixel size (or a close integer ratio)
  render(cv, P, pal, scale){ /* deterministic; cv.width = round(ref.w*scale) */ },
  line:"One sentence: the technique as a physical chain of causes.",
  params:[{key,label,min,max,step,def,unit,group,why}, …],          // 12–24 sliders, grouped; every one must visibly matter
  texts:[{key,label,def}] /* only if the reference carries type */, selects:[{key,label,def,options:[[v,label]]}] /* optional */,
  palettes:[{id:"measured",name,note:"measured", …colors…, sw:[hex×3..4]}, +4 or 5 alternates],
  presets:[{name, set:{param:value,…}}, ×3+],                       // each a distinct, useful look
  bench:{palette:"measured", params:{}, note:"…", items:[ {name, ref:[x,y,w,h], out:[x,y,w,h], m:["hist","mean","std","spec","ac","ink","share"], lags, inks:[[r,g,b],…], inkNames:[…]} ×4–6 ]},
  passes:["pass 1 …", …], measured:{…constants with how they were read…}, limits:["…"], source:"Reference NN: …",
  study:{ slug:"kebab-case", lede:"one line", body:["paragraph 1: what the technique is physically","paragraph 2: what the rebuild does and what the controls do"],
          method:"A · B · C · D", points:[{u,v,d:"KEY"|"READ",label:"what to look at here and why",t:"pull"|"grain"|…,dir:[x,y]} ×10] }
});
```
Rules inside `render`:
- Deterministic: all randomness from `mulberry(P.seed…)`, `hashI(x,y,seed)`, `vnoise(seed)`. Per-pixel noise must be
  **position-hashed** (`hashI`), never pulled from a sequential generator inside a pixel loop that another branch can
  desync. Canvases via `mk()`. Two renders with the same inputs must be byte-identical (test_params checks).
- Everything scales from `u = scale`: no constant in pixels without `* u`.
- No `box-shadow`-style fakes, no CSS, no images, no fonts other than Anton / Archivo Black / Archivo (600/700) /
  JetBrains Mono, which dev.html loads (use them only if the reference carries type).
- One shared field drives many consequences (one weave shades every paint; one grain screens every tone).
  Static print references get static output; nothing animates.

## The work, in order (do not skip the looking)
1. **Pass 0 — measure.** Open the reference at full size with PIL. Make 3–5 crops at 3–5× (NEAREST) of the material
   that matters (an edge, a dot field, a gradient run, a stroke) and **Read them** (the Read tool shows you the image).
   Measure with numpy: palette (k-means on a stride), per-class coverage, grain/dot statistics (component median
   area, nearest-neighbor spacing, pitch via autocorrelation peaks), stroke angle (structure tensor), tone profiles
   along a line, edge softness (cross-section widths), bloom radii (fit exp/gaussian falloffs), weave period, etc.
   Write every number you will use into `measured`, with the method. A guess that measurement rejects is logged as rejected.
2. **Build.** Order passes by physics and say why in `passes`. Keep it one engine, not a pile of effects.
3. **Benchmark.** Define 4–6 patches on the reference that carry the material (not the composition): a flat field, an
   edge, a dense region, a highlight, the whole plate for palette shares. Pick `out` rects as the same region if the
   composition allows; otherwise use `search.py` and say so in `bench.note`. Do not score only the easy patches.
4. **Loop until ≥ 98 % mean**: `bench.py --raw` tells you which statistic is off and in which direction (spectrum per
   band, autocorrelation per lag, histograms per bin, ink colors and shares). Fix the *cause* in the engine, re-score.
   `cd.py` can polish constants, but do not let it drive a parameter to a value that looks wrong; bake tuned values
   as the slider `def` (or as `(P.k ?? v)` internals) and re-check. Every metric at or above 98 % is the goal; if one
   stays under, say which and why in `limits` — no silent misses.
5. **Look.** After every meaningful change: `shoot.py`, build a side-by-side (reference | render, same crop, 3×) with PIL,
   **Read it**, write 3–6 faults, fix them. Minimum three full look-fix passes. Ask: would the reference's designer
   recognize the material? Blurry, mushy, "effect-y", clip-art, uniform-texture, pattern-tile tells are failures.
6. **Parameters.** Each slider must be a real knob on the physics (not a post-filter), with a plain-English `why`.
   Ranges should reach interesting extremes without breaking. Run `test_params.py pNN` clean (no errors, nothing flat).
7. **Color alternates.** ≥ 5 palettes besides `measured`, each a considered world (never cream / warm off-white /
   manila / kraft / oxblood grounds; whites are cool or neutral). Alternates must keep the technique legible.
8. **Study copy.** Fill `study` (lede, two body paragraphs, method line, 10 read points at u,v positions on the
   render that point at real material events). US English. Plain, specific, no marketing voice.
9. **Finish.** `bench.py pNN --save shots/pNN_final.png` ≥ 98 %, `test_params.py pNN` clean, a final side-by-side
   at `shots/pNN_side.png` you have looked at. Report: score table, what each slider does, what is approximated.

## Content rules
- Compositions are the plate's own: generate subjects procedurally in the reference's technique; do not trace the
  reference's figures, and do not embed or quote any reference pixels. Any brand name, wordmark, person's name,
  product name or caption in a reference is replaced by editable **Mindgut** copy (Mindgut's world: Mindgut, Mir,
  the Helix, the little robot logomark, first thought / second brain). Characters in references are not copied; if a
  character is needed, draw a simple original robot (Mindgut's logomark is a robot).
- NO cream. Default neutrals are white/neutral/cool. Texture defaults sit at the subtle end of the measured range.
- When a reference is a JPEG, its softness and ringing are not "the technique": match the material, not the compression,
  and note it in `limits` when it costs you a score.

## Addendum (14:10) — motion and live, and copy rules
Two more fields on every `PLATES.push` object (the site's T&T studies ship with "Motion" and "Live" modes, and Julia asked for animation and interactivity options on these studies):
- `motion`: [{key, amp, period, mode:"sine"|"saw"|"drift"}, …] — 1 to 3 parameters the page may animate around the current value
  (sine: value ± amp with that period in seconds; saw: ramps from value to value+amp; drift: random walk with amp as the
  step scale, driven by the seed). Pick the parameters whose motion means something physically (a flow phase, a light
  position, a bloom level, a weave offset, a slip count), never a parameter that just makes the picture flicker. If the
  render has a natural time axis, add an optional numeric param `phase` (min 0, max 1, step .001, def 0, group "Motion",
  why "Position along the loop.") that advances the generated subject or flow and list it in `motion` with mode "saw".
- `live`: {x:{key,min,max}, y:{key,min,max}} — the two parameters the pointer drives when dragging over the canvas
  (x across, y down). Choose the most legible pair (light direction, flow angle, density, size).
These must cost nothing at rest: the default render stays identical.

Copy rules (study lede, body, method, point labels, `why`, `limits`): every evaluative sentence must carry a measured
number, a named part or a stated method; no "beautifully", "stunning", "elegant", no "not just X, it's Y", no triads for
rhythm, no closing summaries, no "testament/showcase/highlighting", no em dashes. Short sentences. Name the thing.
