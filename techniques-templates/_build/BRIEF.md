# Study module contract · Techniques & Templates (ø co.)

Site root: the `techniques-templates/` folder. Run every command from there.

Each entry is a folder `techniques/<id>/` with `ref.png` (the reference) and `study.js`. Do not edit anything in `_shared/` or `_build/`. Read `techniques/ts-01-moire-ring-screens/study.js` first — it is the model. Read `_shared/art.js` for helpers (seeded rng, perlin, lut, grain, gradientMap, blur, rrect, fitText).

## study.js
```js
window.STUDY={
  id, code:'TS-NN', fig:'1.N', title, kicker:'Technique · TS-NN', lede (one line, ≤ 70 chars), body:[2 short paragraphs],
  source:'Reference NN · <what it is>, W × H', spot:[r,g,b], ref:{w,h},   // ref = reference pixel size → plate aspect
  variantLabel:'Colour' | 'Inks' | 'Plates',
  variants:[ {id,label,sw:['#hex',…], spot:[r,g,b], …any colour params your render reads…}, … ],  // variant 0 = as reference; include one 'io' variant in Ø colours (#F4551E ember, #2F5AE6 blue, #101014 ink, #FFFFFF)
  points:[ 10 × {u,v,d:'4-LETTER',label:'Thing · number',t:'<technique id>',dir:[±1,±1|0]} ],   // every spec.techniques[].id must be cited by ≥ 1 point
  spec:{ reference:{file,px,grammar}, units, palette, techniques:[{id,short,name,layer,pass,atoms:[…],params:{…measured numbers…},implementation:'one sentence'}], pass_order:['name · detail',…], notes:[…] },
  render(canvas,w,h,dpr,V){ … },            // draw the WHOLE picture into canvas (device px = canvas.width/height; w,h css px). Deterministic. < 3 s at 900 px. Read colours from V.
  motion(canvas,w,h,dpr,V,t,ctx){ … }       // optional: draw frame at time t seconds (cheap; runs at 60 fps)
  live(V){ return '<!doctype html>…' }       // optional: a self-contained HTML string (inline CSS/JS, no external assets) for the DOM version, shown in an iframe at plate size
};
```
Rules: everything generated at runtime (no bitmaps, no external fonts beyond the three inlined: Archivo (wght 400–900, wdth 62–125 → use `font-stretch`), Inter, JetBrains Mono); seeded; no console errors; text only where the reference's technique is lettering, and then in Archivo/Inter/JetBrains Mono with invented, plain words (never the reference's words). Subject rule: technique 1:1, subject original. Copy plain and direct — no jokes, no metaphors, no adjectives you cannot measure.

## Loop (mandatory, ≥ 3 passes)
```
node _build/build.mjs <id-fragment>          # writes index.html, ref.js, spec.json; warns on coverage gaps
node _build/render.mjs <id-fragment> vN > /tmp/<id>.log 2>&1; tail -3 /tmp/<id>.log
```
Then LOOK at `_shots/<id>-compare-vN.png` (reference | rebuild per variant) and `_shots/<id>-page-vN.png`. Fix what the eye rejects first, the fidelity numbers second. Console errors must be 0. Keep `points` on things that exist in the rebuild.

## Spec v2 — techniques as parts (2026-10-14; TS-01 is the model)
The site is a parts bin: the unit of value is a technique you can lift into another project. v2 adds three things to the
contract above; v1 studies keep working unchanged, and a study can adopt v2 one technique at a time.

1. **Param schema.** A numeric param in `spec.techniques[].params` may be a leaf `{ value, range:[lo,hi], step?, unit?, note? }`
   — `value` is the measured number, `range` the band the technique holds together in. Strings stay as documentation of the
   formula. Nested objects are fine (`A:{pitch_u:{…}}`). Add `limits:'one line — where this stops holding'` to each technique.
   `ART.params(spec, overrides)` resolves every leaf to a plain value (`{ 'technique-id': params }`); `ART.paramLeaves(spec)`
   lists the sliderable ones. The plate shows a param rail for every leaf with a range and re-renders on drag.
2. **Technique functions.** `STUDY.techniques = { '<spec id>': (P, u[, A, V]) => … }` — one pure function per spec technique.
   `P` is that technique's params as plain values, `u` device px per design unit (`canvas.width/1000`), `A` the helpers,
   `V` the variant colors. It returns whatever `render` composes (closures, numbers, a pass). `render(canvas,w,h,dpr,V,done,O)`
   takes the overrides `O` as its 7th argument and MUST call `done()` (a 7-arg render is treated as async by the shell):
   ```js
   const S=window.STUDY; const T=S.techniques, P=window.ART.params(S.spec,O);
   const ring=T['ring-screen'](P['ring-screen'],u); …   // then compose in pass_order
   ```
   Rule: the refactor is 1:1 — same expressions, same operation order, same rng call order — and the gate is a pixel diff
   of `window.__study.art()` per variant before and after (`node _build/artcap.mjs <id> <outdir>` before and after, then diff — 0 px). Better-than-source fidelity is a
   separate change on top, judged by eye on the plate, never folded into the refactor.
3. **Lifted modules.** `node _build/build.mjs` writes `techniques/<id>/lib/<technique>.js` for every technique function:
   a self-contained ES module (`make`, `params`, `spec`, `atoms`, the `A` helpers it uses inlined from art.js — no imports),
   points `spec.json` and `techniques.json` at it (`module`), and re-imports each one as the reuse gate. Drop-in test for
   TS-01: import the five modules, override `ring.params.B.pitch_u`, compose in a plain pixel loop, write a PPM — no canvas,
   no shell (`node _build/dropin-ts01.mjs > out.ppm`).

Remaining v1 studies (TS-02 … TS-14) are to be moved to v2 one at a time, each with its own 0 px gate.
