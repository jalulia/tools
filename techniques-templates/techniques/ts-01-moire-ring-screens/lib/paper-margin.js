/* paper-margin · Cream margin — TS-01 Moiré from two ring screens · Techniques & Templates · ø co.
   Lifted from techniques/ts-01-moire-ring-screens/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Above ~120 u the margin crops the beat fringe at the left edge. */
export const id="paper-margin", name="Cream margin", code="TS-01", entry="ts-01-moire-ring-screens";
export const atoms=["margin","stock"];
export const spec={
  "id": "paper-margin",
  "short": "EDGE",
  "name": "Cream margin",
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
    "color": "#F0EBE7",
    "rule": "none"
  },
  "limits": "Above ~120 u the margin crops the beat fringe at the left edge.",
  "implementation": "Flat cream fill; the print sits inset by 34 u on every side."
};
export const params={
  "width_u": 34,
  "color": "#F0EBE7",
  "rule": "none"
};
export const A={};

export const make=(P,u)=>{ const m=P.width_u*u; return { m, inside:(x,y,W,H)=>x>=m&&x<W-m&&y>=m&&y<H-m }; };
export default make;
