/* scallop-bank · Scalloped flat bank — TS-16 Stipple bank and dot burst · Techniques & Templates · ø co.
   Lifted from techniques/ts-16-stipple-cloud-bank/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: spacing above ~1.9 opens gaps between lobes and the edge reads as beads. R_var above ~0.6 makes single lobes swallow their neighbors. */
export const id="scallop-bank", name="Scalloped flat bank", code="TS-16", entry="ts-16-stipple-cloud-bank";
export const atoms=["flat-fill","circle-union","hard-edge"];
export const spec={
  "id": "scallop-bank",
  "short": "BANK",
  "name": "Scalloped flat bank",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "flat-fill",
    "circle-union",
    "hard-edge"
  ],
  "params": {
    "banks": [
      {
        "fill": "warm",
        "from": [
          1090,
          520
        ],
        "to": [
          430,
          1300
        ],
        "R": 104,
        "seed": 11
      },
      {
        "fill": "dark",
        "from": [
          1100,
          760
        ],
        "to": [
          330,
          1560
        ],
        "R": 96,
        "seed": 23
      },
      {
        "fill": "pale",
        "from": [
          -90,
          1010
        ],
        "to": [
          1120,
          1640
        ],
        "R": 128,
        "seed": 37
      },
      {
        "fill": "dark",
        "from": [
          -100,
          1330
        ],
        "to": [
          640,
          1880
        ],
        "R": 92,
        "seed": 51
      }
    ],
    "R_scale": {
      "value": 1,
      "range": [
        0.5,
        1.8
      ],
      "note": "multiplies every lobe radius"
    },
    "R_var": {
      "value": 0.3,
      "range": [
        0,
        0.6
      ],
      "note": "lobe radius varies ± this share"
    },
    "spacing": {
      "value": 1.25,
      "range": [
        0.8,
        1.9
      ],
      "note": "lobe centers sit this many radii apart"
    }
  },
  "limits": "spacing above ~1.9 opens gaps between lobes and the edge reads as beads. R_var above ~0.6 makes single lobes swallow their neighbors.",
  "implementation": "Each bank is a row of circles along a spine from one point to another, filled together with the polygon under the spine; later banks cover earlier ones."
};
export const params={
  "banks": [
    {
      "fill": "warm",
      "from": [
        1090,
        520
      ],
      "to": [
        430,
        1300
      ],
      "R": 104,
      "seed": 11
    },
    {
      "fill": "dark",
      "from": [
        1100,
        760
      ],
      "to": [
        330,
        1560
      ],
      "R": 96,
      "seed": 23
    },
    {
      "fill": "pale",
      "from": [
        -90,
        1010
      ],
      "to": [
        1120,
        1640
      ],
      "R": 128,
      "seed": 37
    },
    {
      "fill": "dark",
      "from": [
        -100,
        1330
      ],
      "to": [
        640,
        1880
      ],
      "R": 92,
      "seed": 51
    }
  ],
  "R_scale": 1,
  "R_var": 0.3,
  "spacing": 1.25
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>({ banks:P.banks.map(b=>{ const r=A.rng(b.seed); const fx=b.from[0]*u, fy=b.from[1]*u, tx=b.to[0]*u, ty=b.to[1]*u; const len=Math.hypot(tx-fx,ty-fy); const lobes=[]; let s=0;
        while(s<=len){ const R=b.R*P.R_scale*u*(1+(r()*2-1)*P.R_var); lobes.push([fx+(tx-fx)*s/len, fy+(ty-fy)*s/len, R]); s+=R*P.spacing; }
        return { fill:b.fill, draw:(x,W,H)=>{ x.beginPath(); x.moveTo(fx,fy); x.lineTo(tx,ty); x.lineTo(tx,H+4*u); x.lineTo(fx<0?-4*u:(fx>W?W+4*u:fx),H+4*u); if(fx>W||fx<0)x.lineTo(fx,H+4*u); x.closePath(); x.fill(); for(const l of lobes){ x.beginPath(); x.arc(l[0],l[1],l[2],0,6.2832); x.fill(); } } }; }) });
export default make;
