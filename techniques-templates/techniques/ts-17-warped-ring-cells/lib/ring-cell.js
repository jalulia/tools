/* ring-cell · Rounded cell — TS-17 Warped ring cells · Techniques & Templates · ø co.
   Lifted from techniques/ts-17-warped-ring-cells/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: cell_at above gutter_at removes the stock band between a cell and its gutter. edge above ~0.2 thins every shape to a haze. */
export const id="ring-cell", name="Rounded cell", code="TS-17", entry="ts-17-warped-ring-cells";
export const atoms=["grid","superellipse","ring"];
export const spec={
  "id": "ring-cell",
  "short": "CELL",
  "name": "Rounded cell",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "grid",
    "superellipse",
    "ring"
  ],
  "params": {
    "roundness": {
      "value": 2.8,
      "range": [
        2,
        8
      ],
      "note": "superellipse exponent; 2 is an ellipse"
    },
    "cell_at": {
      "value": 0.33,
      "range": [
        0.2,
        0.45
      ],
      "note": "edge of the solid cell, in cell units"
    },
    "ring_at": {
      "value": 0.34,
      "range": [
        0.1,
        0.42
      ]
    },
    "ring_width": {
      "value": 0.1,
      "range": [
        0.02,
        0.24
      ]
    },
    "gutter_at": {
      "value": 0.43,
      "range": [
        0.3,
        0.55
      ]
    },
    "edge": {
      "value": 0.04,
      "range": [
        0.01,
        0.25
      ],
      "note": "width over which coverage ramps at every edge"
    }
  },
  "limits": "cell_at above gutter_at removes the stock band between a cell and its gutter. edge above ~0.2 thins every shape to a haze.",
  "implementation": "The distance from the cell center is a superellipse. Three shapes are read from it: the solid cell, an outline band, and the gutter past it."
};
export const params={
  "roundness": 2.8,
  "cell_at": 0.33,
  "ring_at": 0.34,
  "ring_width": 0.1,
  "gutter_at": 0.43,
  "edge": 0.04
};
export const A={};
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,u,A)=>({ shapes:(fx,fy,o)=>{ const n=P.roundness; const d=Math.pow(Math.pow(Math.abs(fx),n)+Math.pow(Math.abs(fy),n),1/n), e=P.edge; o[0]=1-A.sstep(P.cell_at-e*0.5,P.cell_at+e*0.5,d); o[1]=1-A.sstep(P.ring_width*0.5,P.ring_width*0.5+e,Math.abs(d-P.ring_at)); o[2]=A.sstep(P.gutter_at-e*0.5,P.gutter_at+e*0.5,d); return o; } });
export default make;
