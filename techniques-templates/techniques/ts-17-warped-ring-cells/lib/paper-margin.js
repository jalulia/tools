/* paper-margin · Plain margin — TS-17 Warped ring cells · Techniques & Templates · ø co.
   Lifted from techniques/ts-17-warped-ring-cells/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Above ~120 u the margin crops the stretched band. */
export const id="paper-margin", name="Plain margin", code="TS-17", entry="ts-17-warped-ring-cells";
export const atoms=["margin","stock"];
export const spec={
  "id": "paper-margin",
  "short": "EDGE",
  "name": "Plain margin",
  "layer": 0,
  "pass": 0,
  "atoms": [
    "margin",
    "stock"
  ],
  "params": {
    "width_u": {
      "value": 34,
      "range": [
        0,
        120
      ],
      "unit": "u"
    },
    "rule": "none"
  },
  "limits": "Above ~120 u the margin crops the stretched band.",
  "implementation": "Flat paper fill; the print sits inset on every side."
};
export const params={
  "width_u": 34,
  "rule": "none"
};
export const A={};

export const make=(P,u)=>{ const m=P.width_u*u; return { m, inside:(x,y,W,H)=>x>=m&&x<W-m&&y>=m&&y<H-m }; };
export default make;
