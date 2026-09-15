# Study module contract · Techniques & Templates (ø co.)

Site root: `/home/claude/work/site`. Run every command from there.

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
