/* stochastic-speckle · Noise-threshold print — TS-17 Warped ring cells · Techniques & Templates · ø co.
   Lifted from techniques/ts-17-warped-ring-cells/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: stray above ~0.25 lifts the stock to a tint. Any soften above 0 turns the pixels into tone and the print reads as blurred. */
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
      "value": 0.92,
      "range": [
        0.3,
        1
      ],
      "note": "highest ink coverage"
    },
    "stray": {
      "value": 0.12,
      "range": [
        0,
        0.35
      ],
      "note": "share of pixels near a pool that take its ink regardless"
    },
    "stock_noise": {
      "value": 0.08,
      "range": [
        0,
        0.25
      ]
    },
    "soften_px": {
      "value": 0,
      "range": [
        0,
        3
      ],
      "unit": "px",
      "note": "blur after printing; 0 keeps single pixels"
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
  "limits": "stray above ~0.25 lifts the stock to a tint. Any soften above 0 turns the pixels into tone and the print reads as blurred.",
  "implementation": "Per pixel: ink if a random number is under the coverage, with the ink drawn in proportion to each pool’s share; otherwise stock, or a stray ink pixel."
};
export const params={
  "gain": 0.92,
  "stray": 0.12,
  "stock_noise": 0.08,
  "soften_px": 0,
  "seed": 211
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>({ r:A.rng(P.seed), gain:P.gain, stray:P.stray, noise:P.stock_noise, soften:P.soften_px });
export default make;
