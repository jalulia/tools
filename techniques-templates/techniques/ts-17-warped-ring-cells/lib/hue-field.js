/* hue-field · Anchored ink regions — TS-17 Warped ring cells · Techniques & Templates · ø co.
   Lifted from techniques/ts-17-warped-ring-cells/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: sharpness under ~1.5 mixes every region and no ink dominates anywhere. mix above ~0.4 reads as random color. */
export const id="hue-field", name="Anchored ink regions", code="TS-17", entry="ts-17-warped-ring-cells";
export const atoms=["palette-field","per-cell"];
export const spec={
  "id": "hue-field",
  "short": "HUE",
  "name": "Anchored ink regions",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "palette-field",
    "per-cell"
  ],
  "params": {
    "anchors_u": [
      [
        480,
        130
      ],
      [
        520,
        640
      ],
      [
        760,
        1040
      ],
      [
        60,
        860
      ],
      [
        960,
        420
      ]
    ],
    "sharpness": {
      "value": 3,
      "range": [
        1,
        8
      ],
      "note": "higher gives harder region borders"
    },
    "mix": {
      "value": 0.38,
      "range": [
        0,
        0.5
      ],
      "note": "chance that a cell takes its second-nearest ink"
    },
    "inner": "the inner ring takes the next ink in the list"
  },
  "limits": "sharpness under ~1.5 mixes every region and no ink dominates anywhere. mix above ~0.4 reads as random color.",
  "implementation": "Five anchor points carry one ink each. A cell takes the ink of its nearest anchor, or with up to 30 % chance the second nearest."
};
export const params={
  "anchors_u": [
    [
      480,
      130
    ],
    [
      520,
      640
    ],
    [
      760,
      1040
    ],
    [
      60,
      860
    ],
    [
      960,
      420
    ]
  ],
  "sharpness": 3,
  "mix": 0.38,
  "inner": "the inner ring takes the next ink in the list"
};
export const A={};

export const make=(P,u,A)=>{ const an=P.anchors_u.map(a=>[a[0]*u,a[1]*u]); return { pick:(x,y,h)=>{ let b=0, s=1, bd=1e30, sd=1e30; for(let k=0;k<an.length;k++){ const d=Math.hypot(x-an[k][0],y-an[k][1]); if(d<bd){ sd=bd; s=b; bd=d; b=k; } else if(d<sd){ sd=d; s=k; } }
        const near=Math.pow(bd/(sd+1e-6),P.sharpness); return h<P.mix*(0.4+1.2*near)?s:b; }, count:an.length }; };
export default make;
