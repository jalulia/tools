/* ink-pool · Ink pools — TS-17 Warped ring cells · Techniques & Templates · ø co.
   Lifted from techniques/ts-17-warped-ring-cells/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: size above ~2 merges the pools into one field and no region reads. gain under ~0.4 leaves only the stray pixels. */
export const id="ink-pool", name="Ink pools", code="TS-17", entry="ts-17-warped-ring-cells";
export const atoms=["palette-field","gaussian","per-cell"];
export const spec={
  "id": "ink-pool",
  "short": "POOL",
  "name": "Ink pools",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "palette-field",
    "gaussian",
    "per-cell"
  ],
  "params": {
    "pools": [
      {
        "ink": "base",
        "mode": "gutter",
        "at": [
          0.25,
          0.25
        ],
        "size": 0.42
      },
      {
        "ink": "teal",
        "mode": "cell",
        "at": [
          0.45,
          0.08
        ],
        "size": 0.22
      },
      {
        "ink": "teal",
        "mode": "cell",
        "at": [
          0.45,
          0.31
        ],
        "size": 0.19
      },
      {
        "ink": "red",
        "mode": "ring",
        "at": [
          0.58,
          0.34
        ],
        "size": 0.08
      },
      {
        "ink": "red",
        "mode": "ring",
        "at": [
          0.93,
          0.3
        ],
        "size": 0.11
      },
      {
        "ink": "orange",
        "mode": "ring",
        "at": [
          0.95,
          0.18
        ],
        "size": 0.08
      },
      {
        "ink": "yellow",
        "mode": "ring",
        "at": [
          0.88,
          0.55
        ],
        "size": 0.12
      },
      {
        "ink": "yellow",
        "mode": "ring",
        "at": [
          0.9,
          0.85
        ],
        "size": 0.14
      },
      {
        "ink": "blue",
        "mode": "gutter",
        "at": [
          0.52,
          0.58
        ],
        "size": 0.19
      },
      {
        "ink": "red",
        "mode": "cell",
        "at": [
          0.38,
          0.82
        ],
        "size": 0.14
      },
      {
        "ink": "orange",
        "mode": "cell",
        "at": [
          0.08,
          0.9
        ],
        "size": 0.09
      },
      {
        "ink": "pink",
        "mode": "ring",
        "at": [
          0.1,
          0.42
        ],
        "size": 0.1
      },
      {
        "ink": "blue",
        "mode": "cell",
        "at": [
          0.58,
          0.97
        ],
        "size": 0.06
      }
    ],
    "gain": {
      "value": 1,
      "range": [
        0,
        2
      ],
      "note": "multiplies every pool"
    },
    "size": {
      "value": 1,
      "range": [
        0.4,
        2.5
      ],
      "note": "multiplies every pool radius"
    },
    "cell_var": {
      "value": 0.25,
      "range": [
        0,
        1
      ],
      "note": "how much strength varies cell to cell"
    },
    "drift": {
      "value": 0,
      "range": [
        0,
        1
      ],
      "note": "moves every pool once around a small loop; Motion runs it"
    },
    "seed": {
      "value": 31,
      "range": [
        1,
        9999
      ],
      "step": 1
    }
  },
  "limits": "size above ~2 merges the pools into one field and no region reads. gain under ~0.4 leaves only the stray pixels.",
  "implementation": "Each pool has an ink, a center, a gaussian radius and a mode. Its strength is 2.4 × the gaussian, read per pixel and clipped at 1, so the middle of a pool is solid; the mode says which shape of the cell it colors."
};
export const params={
  "pools": [
    {
      "ink": "base",
      "mode": "gutter",
      "at": [
        0.25,
        0.25
      ],
      "size": 0.42
    },
    {
      "ink": "teal",
      "mode": "cell",
      "at": [
        0.45,
        0.08
      ],
      "size": 0.22
    },
    {
      "ink": "teal",
      "mode": "cell",
      "at": [
        0.45,
        0.31
      ],
      "size": 0.19
    },
    {
      "ink": "red",
      "mode": "ring",
      "at": [
        0.58,
        0.34
      ],
      "size": 0.08
    },
    {
      "ink": "red",
      "mode": "ring",
      "at": [
        0.93,
        0.3
      ],
      "size": 0.11
    },
    {
      "ink": "orange",
      "mode": "ring",
      "at": [
        0.95,
        0.18
      ],
      "size": 0.08
    },
    {
      "ink": "yellow",
      "mode": "ring",
      "at": [
        0.88,
        0.55
      ],
      "size": 0.12
    },
    {
      "ink": "yellow",
      "mode": "ring",
      "at": [
        0.9,
        0.85
      ],
      "size": 0.14
    },
    {
      "ink": "blue",
      "mode": "gutter",
      "at": [
        0.52,
        0.58
      ],
      "size": 0.19
    },
    {
      "ink": "red",
      "mode": "cell",
      "at": [
        0.38,
        0.82
      ],
      "size": 0.14
    },
    {
      "ink": "orange",
      "mode": "cell",
      "at": [
        0.08,
        0.9
      ],
      "size": 0.09
    },
    {
      "ink": "pink",
      "mode": "ring",
      "at": [
        0.1,
        0.42
      ],
      "size": 0.1
    },
    {
      "ink": "blue",
      "mode": "cell",
      "at": [
        0.58,
        0.97
      ],
      "size": 0.06
    }
  ],
  "gain": 1,
  "size": 1,
  "cell_var": 0.25,
  "drift": 0,
  "seed": 31
};
export const A={};

export const make=(P,u,A)=>({ cell_var:P.cell_var, hash:(i,j)=>{ let h=(i*374761393+j*668265263+P.seed*2246822519)|0; h=(h^(h>>>13))*1274126177|0; h=h^(h>>>16); return (h>>>0)/4294967296; },
      build:(W,H)=>{ const a=6.2832*P.drift; return P.pools.map((p,k)=>{ const r=p.size*P.size*W; return { ink:p.ink, m:p.mode==='cell'?0:(p.mode==='ring'?1:2), x:(p.at[0]+0.06*(Math.cos(a+k*1.7)-Math.cos(k*1.7)))*W, y:(p.at[1]+0.05*(Math.sin(a+k*2.3)-Math.sin(k*2.3)))*H, r2:r*r, cut:r*r*5, gain:P.gain*2.4 }; }); } });
export default make;
