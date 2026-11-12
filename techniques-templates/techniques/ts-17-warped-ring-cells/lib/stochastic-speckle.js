/* stochastic-speckle · Noise-threshold print — TS-17 Warped ring cells · Techniques & Templates · ø co.
   Lifted from techniques/ts-17-warped-ring-cells/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: stray above ~0.2 lifts the stock to a tint and the rings lose contrast. soften above ~1.5 px turns the speckle into tone. */
export const id="stochastic-speckle", name="Noise-threshold print", code="TS-17", entry="ts-17-warped-ring-cells";
export const atoms=["dither","grain","speckle"];
export const spec={
  "id": "stochastic-speckle",
  "short": "GRAIN",
  "name": "Noise-threshold print",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "dither",
    "grain",
    "speckle"
  ],
  "params": {
    "gain": {
      "value": 0.82,
      "range": [
        0.3,
        1
      ],
      "note": "highest ink coverage"
    },
    "stray": {
      "value": 0.15,
      "range": [
        0,
        0.3
      ],
      "note": "share of stock pixels that take an ink"
    },
    "stock_noise": {
      "value": 0.1,
      "range": [
        0,
        0.2
      ]
    },
    "soften_px": {
      "value": 0.8,
      "range": [
        0,
        3
      ],
      "unit": "px"
    },
    "seed": {
      "value": 211,
      "range": [
        1,
        9999
      ],
      "step": 1
    }
  },
  "limits": "stray above ~0.2 lifts the stock to a tint and the rings lose contrast. soften above ~1.5 px turns the speckle into tone.",
  "implementation": "Per pixel: ink if a random number is under the coverage, else stock; a share of stock pixels take a random ink. A 0.8 px blur follows."
};
export const params={
  "gain": 0.82,
  "stray": 0.15,
  "stock_noise": 0.1,
  "soften_px": 0.8,
  "seed": 211
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>{ const r=A.rng(P.seed); return { soften:P.soften_px, px:(cov,ink,stock,inks)=>{ if(r()<cov*P.gain)return ink; const t=r(); if(t<P.stray)return inks[(r()*inks.length)|0]; const m=1+(r()*2-1)*P.stock_noise; return [stock[0]*m,stock[1]*m,stock[2]*m]; } }; };
export default make;
