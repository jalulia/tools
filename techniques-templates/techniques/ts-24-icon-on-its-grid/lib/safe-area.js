/* safe-area · Safe area and keylines — TS-24 Mir on its icon grid · Techniques & Templates · ø co.
   Lifted from techniques/ts-24-icon-on-its-grid/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Below 64% Mir becomes a badge in an empty tile; above 92% the safe circle meets the corner arcs. */
export const id="safe-area", name="Safe area and keylines", code="TS-24", entry="ts-24-icon-on-its-grid";
export const atoms=["keyline","grid","safe-area","center-cross"];
export const spec={
  "id": "safe-area",
  "short": "SAFE",
  "name": "Safe area and keylines",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "keyline",
    "grid",
    "safe-area",
    "center-cross"
  ],
  "params": {
    "safe_pct": {
      "value": 80,
      "range": [
        64,
        92
      ],
      "unit": "%",
      "label": "Safe area",
      "note": "Diameter of the safe circle and side of the safe square, as a share of the tile."
    },
    "construction": {
      "value": 3,
      "options": [
        {
          "v": 1,
          "label": "Off"
        },
        {
          "v": 2,
          "label": "Keylines"
        },
        {
          "v": 3,
          "label": "Full grid"
        }
      ],
      "label": "Construction",
      "note": "Off shows the tile alone. Keylines adds the circles, square, diagonals, center cross and notes. Full grid adds the 16 × 64 px grid."
    },
    "cells": 16,
    "cell_px": 64
  },
  "limits": "Below 64% Mir becomes a badge in an empty tile; above 92% the safe circle meets the corner arcs.",
  "implementation": "All keylines are drawn twice, clipped inside and outside the tile, so they keep contrast on dark tiles. Grid and keylines sit under Mir; the center cross and notes sit over it."
};
export const params={
  "safe_pct": 80,
  "construction": 3,
  "cells": 16,
  "cell_px": 64
};
export const A={};

export const make=(P,u,A)=>({ safe:P.safe_pct/100, mode:P.construction, cells:P.cells, cell:P.cell_px });
export default make;
