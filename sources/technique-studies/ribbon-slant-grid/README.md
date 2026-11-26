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
