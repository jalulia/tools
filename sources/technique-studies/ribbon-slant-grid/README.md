# ribbon-slant-grid

Sources for `ribbon-slant-grid/index.html`: ST-22's airbrush ribbon held to calligraphic slant grids, and three lockups with the mindgut wordmark.

```
npm i --prefix . geist@1 gifenc@1.0.3
python3 build.py V06          # writes out/ribbon-to-mindgut_V06.html; refuses to overwrite without --force
```

| File | Holds |
|---|---|
| `src/geom.js` | stage, axis, the p10 helix (`coil`), arcs, spheres |
| `src/routes.js` | camera: `project`, `rotate`, `focal` |
| `src/hands.js` | the six hands (guide-line ratios, nib, slant) and `frame()`, which places the helix on a hand's grid |
| `src/guide.js` | the guide sheet and nib ladder, drawn through the same camera |
| `src/map.js` | third-angle elevations (top, front, side) |
| `src/gl.js` | WebGL2 renderer: dual-source gel blending, quarter-size bloom, fine static grain, the wordmark plane |
| `src/lockups.js` | Wrap, Strike, Settle |
| `src/logo.js` | the mindgut wordmark outline |
| `src/app5.js`, `src/page5.html`, `src/page4.css` | page, controls, plates, PNG / GIF / JSON export |

Reference images used while drawing this study stay private, outside the repo.

## V11 (current page)

```
npm i --prefix . geist@1 gifenc@1.0.3
python3 build11.py V11        # writes out/ribbon-to-mindgut_V11.html from src/v11/
```

| File | Holds |
|---|---|
| `src/v11/resolve.js` | trajectories 01 Ductus, 02 Write, 03 Press (REG and FORM designspace), 04 Parallax |
| `src/v11/head.js` | 05 Head: the ribbon into the Mindgut 2.2 mark |
| `src/v11/mark22.js` | the Mindgut 2.2 mark, five vector paths |
| `src/v11/robotgeo.js` | the mark measured from its vector: brain-fold tour, eye lights, three contours, distances |
| `src/v11/gl10.js` | renderer, with the mark as a plane flooded from its outline, eye and mouth growth, printed spheres |
| `src/v11/app11.js`, `src/v11/page11.html`, `src/v11/page11.css` | page, controls, plates, PNG / GIF / JSON export |
| `robot/` | how `robotgeo.js` is made: `reg.html` + `dump.mjs` rasterize the mark's regions, `geo.py` tours the brain folds, `bake.py` writes the file |
