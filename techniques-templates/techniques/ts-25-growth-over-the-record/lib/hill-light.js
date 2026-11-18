/* hill-light · Side light and rim — TS-25 Growth over the record · Techniques & Templates · ø co.
   Lifted from techniques/ts-25-growth-over-the-record/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Past ±75° the light comes from behind the hill and both flanks go flat. */
export const id="hill-light", name="Side light and rim", code="TS-25", entry="ts-25-growth-over-the-record";
export const atoms=["lambert","rim-light","depth-falloff"];
export const spec={
  "id": "hill-light",
  "short": "LITE",
  "name": "Side light and rim",
  "layer": 3,
  "pass": 3,
  "atoms": [
    "lambert",
    "rim-light",
    "depth-falloff"
  ],
  "params": {
    "sun_deg": {
      "value": -50,
      "range": [
        -75,
        75
      ],
      "step": 1,
      "unit": "°",
      "label": "Sun from",
      "note": "negative lights the left flank, positive the right; 0 is overhead"
    },
    "rim_u": {
      "value": 16,
      "range": [
        0,
        40
      ],
      "step": 0.5,
      "unit": "u",
      "label": "Rim light",
      "note": "width of the light band just under each silhouette"
    },
    "face": 0.62,
    "turn_u": 70,
    "mat": {
      "grass": [
        0.1,
        0.78,
        0.4,
        0.34,
        240,
        0.25
      ],
      "front": [
        0,
        0.46,
        0.6,
        0.08,
        60,
        0.3
      ],
      "blue": [
        0.09,
        0.55,
        0.75,
        0.3,
        170,
        0.85
      ],
      "hill": [
        0.2,
        0.55,
        0.3,
        0.2,
        70,
        0.4
      ],
      "note": "base, gain, rim gain, depth darkening, depth span u, sky share of the rim"
    }
  },
  "limits": "Past ±75° the light comes from behind the hill and both flanks go flat.",
  "implementation": "At each column the silhouette normal (slope, −1) is dotted with the sun vector; below the edge the normal turns toward the viewer over 70 u, a rim term decays over rim width, and depth darkens the lower hill."
};
export const params={
  "sun_deg": -50,
  "rim_u": 16,
  "face": 0.62,
  "turn_u": 70,
  "mat": {
    "grass": [
      0.1,
      0.78,
      0.4,
      0.34,
      240,
      0.25
    ],
    "front": [
      0,
      0.46,
      0.6,
      0.08,
      60,
      0.3
    ],
    "blue": [
      0.09,
      0.55,
      0.75,
      0.3,
      170,
      0.85
    ],
    "hill": [
      0.2,
      0.55,
      0.3,
      0.2,
      70,
      0.4
    ],
    "note": "base, gain, rim gain, depth darkening, depth span u, sky share of the rim"
  }
};
export const A={};

export const make=(P,u,A)=>{ const a=P.sun_deg*Math.PI/180, Lx=Math.sin(a), Ly=-Math.cos(a), face=P.face, turn=P.turn_u, rimW=P.rim_u;
      const lam2=s=>(s*Lx-Ly)/Math.sqrt(s*s+1);
      const tone=(m,l2,d)=>{ const lam=face+(l2-face)*Math.exp(-d/turn); const rim=rimW>0?Math.exp(-d/rimW)*(m[5]+(1-m[5])*Math.max(0,l2)):0; const t=Math.min(1,Math.max(0,d/m[4])); return m[0]+m[1]*lam+m[2]*rim-m[3]*t*t*(3-2*t); };
      return { Lx, Ly, lam2, tone, mat:P.mat, face, turn, rimW }; };
export default make;
