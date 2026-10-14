/* stochastic-grain · Stochastic two-ink screen — TS-01 Moiré from two ring screens · Techniques & Templates · ø co.
   Lifted from techniques/ts-01-moire-ring-screens/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,A,V) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: soften above ~1.5 px dissolves the lattice into tone; cell_px is fixed at 1 in this rebuild (a coarser cell needs a hash per cell, not per pixel). */
export const id="stochastic-grain", name="Stochastic two-ink screen", code="TS-01", entry="ts-01-moire-ring-screens";
export const atoms=["dither","grain","overprint"];
export const spec={
  "id": "stochastic-grain",
  "short": "GRAIN",
  "name": "Stochastic two-ink screen",
  "layer": 3,
  "pass": 3,
  "atoms": [
    "dither",
    "grain",
    "overprint"
  ],
  "params": {
    "threshold": "uniform random per pixel per ink",
    "seed": {
      "value": 101,
      "range": [
        1,
        9999
      ],
      "step": 1
    },
    "overprint": "where both inks land: overCore pink in the field, overFar plum on lattice dots (product > plum_above) inside the core",
    "plum_above": {
      "value": 0.7,
      "range": [
        0.3,
        1
      ]
    },
    "soften_px": {
      "value": 0.6,
      "range": [
        0,
        3
      ],
      "unit": "px"
    },
    "cell_px": 1
  },
  "limits": "soften above ~1.5 px dissolves the lattice into tone; cell_px is fixed at 1 in this rebuild (a coarser cell needs a hash per cell, not per pixel).",
  "implementation": "For each device pixel: blue if r1 < blue_coverage, red if r2 < red_coverage; both → overprint; neither → paper tint. A 0.6 px blur softens the pixel edges the way the reference’s scan does."
};
export const params={
  "threshold": "uniform random per pixel per ink",
  "seed": 101,
  "overprint": "where both inks land: overCore pink in the field, overFar plum on lattice dots (product > plum_above) inside the core",
  "plum_above": 0.7,
  "soften_px": 0.6,
  "cell_px": 1
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
A.hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
A.mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
export const make=(P,A,V)=>{ const r=A.rng(P.seed); const oc=A.hex(V.overCore), of=A.hex(V.overFar); const plum=P.plum_above;
      return { soften:P.soften_px, ink:(blue,red,prod,cutoff,inkA,inkB,field)=>{ const b=r()<blue, rr=red>cutoff&&r()<red; return b&&rr?(prod>plum?A.mix(of,oc,1-red):oc):(rr?inkB:(b?inkA:field)); } }; };
export default make;
