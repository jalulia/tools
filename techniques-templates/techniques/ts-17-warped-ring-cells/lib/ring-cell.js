/* ring-cell · Ringed rounded cell — TS-17 Warped ring cells · Techniques & Templates · ø co.
   Lifted from techniques/ts-17-warped-ring-cells/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: outer.at + width + grow above ~0.6 closes every gutter and the cells read as holes in a flat tint. Pitch under ~28 u falls below the speckle and the rings vanish. */
export const id="ring-cell", name="Ringed rounded cell", code="TS-17", entry="ts-17-warped-ring-cells";
export const atoms=["grid","superellipse","ring"];
export const spec={
  "id": "ring-cell",
  "short": "CELL",
  "name": "Ringed rounded cell",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "grid",
    "superellipse",
    "ring"
  ],
  "params": {
    "pitch_u": {
      "value": 64,
      "range": [
        28,
        160
      ],
      "unit": "u"
    },
    "turn_deg": {
      "value": 14,
      "range": [
        -45,
        45
      ],
      "unit": "°"
    },
    "roundness": {
      "value": 2.7,
      "range": [
        2,
        8
      ],
      "note": "superellipse exponent; 2 is a circle"
    },
    "outer": {
      "at": {
        "value": 0.37,
        "range": [
          0.3,
          0.5
        ]
      },
      "width": {
        "value": 0.05,
        "range": [
          0.02,
          0.16
        ]
      },
      "grow": {
        "value": 0.07,
        "range": [
          0,
          0.25
        ],
        "note": "added width at full field strength"
      }
    },
    "gutter": {
      "tint": {
        "value": 0.6,
        "range": [
          0,
          0.9
        ],
        "note": "ink coverage between cells"
      }
    },
    "edge": {
      "value": 0.075,
      "range": [
        0.01,
        0.2
      ],
      "note": "softness of a band edge, in cell units"
    },
    "inner": {
      "at": {
        "value": 0.2,
        "range": [
          0.1,
          0.3
        ]
      },
      "width": {
        "value": 0.04,
        "range": [
          0.01,
          0.1
        ]
      },
      "share": {
        "value": 0.7,
        "range": [
          0,
          1
        ],
        "note": "share of cells that carry it"
      }
    },
    "field": {
      "sigma_u": {
        "value": 400,
        "range": [
          150,
          1200
        ],
        "unit": "u"
      },
      "floor": {
        "value": 0.1,
        "range": [
          0,
          1
        ]
      }
    },
    "cell_var": {
      "value": 0.55,
      "range": [
        0,
        1
      ],
      "note": "how much ring strength varies cell to cell"
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
  "limits": "outer.at + width + grow above ~0.6 closes every gutter and the cells read as holes in a flat tint. Pitch under ~28 u falls below the speckle and the rings vanish.",
  "implementation": "Inside each cell the distance to the center is measured as a superellipse; two bands of that distance carry ink and the space past 0.45 carries a lighter tint. Both strengthen with a gaussian field centered on the lens."
};
export const params={
  "pitch_u": 64,
  "turn_deg": 14,
  "roundness": 2.7,
  "outer": {
    "at": 0.37,
    "width": 0.05,
    "grow": 0.07
  },
  "gutter": {
    "tint": 0.6
  },
  "edge": 0.075,
  "inner": {
    "at": 0.2,
    "width": 0.04,
    "share": 0.7
  },
  "field": {
    "sigma_u": 400,
    "floor": 0.1
  },
  "cell_var": 0.55,
  "seed": 31
};
export const A={};
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,u,A)=>{ const p=P.pitch_u*u, a=P.turn_deg*Math.PI/180, ca=Math.cos(a), sa=Math.sin(a), n=P.roundness, sig=P.field.sigma_u*u;
      const hash=(i,j,k)=>{ let h=(i*374761393+j*668265263+k*1274126177+P.seed*2246822519)|0; h=(h^(h>>>13))*1274126177|0; h=h^(h>>>16); return (h>>>0)/4294967296; };
      const band=(d,at,w)=>1-A.sstep(w*0.5,w*0.5+P.edge,Math.abs(d-at));
      return { hash, cell:(qx,qy,cx,cy)=>{ const gx=(qx*ca+qy*sa)/p, gy=(-qx*sa+qy*ca)/p; const i=Math.floor(gx), j=Math.floor(gy); const fx=gx-i-0.5, fy=gy-j-0.5; const d=Math.pow(Math.pow(Math.abs(fx),n)+Math.pow(Math.abs(fy),n),1/n);
          const mx=((i+0.5)*ca-(j+0.5)*sa)*p-cx, my=((i+0.5)*sa+(j+0.5)*ca)*p-cy; const F=P.field.floor+(1-P.field.floor)*Math.exp(-(mx*mx+my*my)/(sig*sig));
          const sv=1-P.cell_var*hash(i,j,3); const o=band(d,P.outer.at+P.outer.grow*F*0.5,P.outer.width+P.outer.grow*F)*(0.55+0.45*F)*sv; const inn=hash(i,j,1)<P.inner.share?band(d,P.inner.at,P.inner.width)*(0.5+0.5*F):0;
          return { i, j, outer:Math.max(o,A.sstep(0.45,0.53,d)*P.gutter.tint*(0.15+0.85*F)), inner:inn, px:mx+cx, py:my+cy }; } }; };
export default make;
