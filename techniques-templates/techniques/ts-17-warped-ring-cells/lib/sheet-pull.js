/* sheet-pull · Gaussian sheet pulls — TS-17 Warped ring cells · Techniques & Templates · ø co.
   Lifted from techniques/ts-17-warped-ring-cells/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: A pull folds the sheet when 0.86 × vector length exceeds its radius; at strength 1 the largest ratio is 0.65. Pitch under ~24 u puts a cell below ten pixels and the outline closes. */
export const id="sheet-pull", name="Gaussian sheet pulls", code="TS-17", entry="ts-17-warped-ring-cells";
export const atoms=["domain-warp","gaussian","displacement"];
export const spec={
  "id": "sheet-pull",
  "short": "PULL",
  "name": "Gaussian sheet pulls",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "domain-warp",
    "gaussian",
    "displacement"
  ],
  "params": {
    "pitch_u": {
      "value": 52,
      "range": [
        24,
        160
      ],
      "unit": "u"
    },
    "turn_deg": {
      "value": -8,
      "range": [
        -45,
        45
      ],
      "unit": "°"
    },
    "pulls": [
      {
        "at": [
          0.5,
          0.16
        ],
        "radius_u": 310,
        "vec_u": [
          0,
          -235
        ]
      },
      {
        "at": [
          0.93,
          0.3
        ],
        "radius_u": 250,
        "vec_u": [
          150,
          -105
        ]
      },
      {
        "at": [
          0.04,
          0.86
        ],
        "radius_u": 330,
        "vec_u": [
          -215,
          20
        ]
      },
      {
        "at": [
          0.62,
          1
        ],
        "radius_u": 260,
        "vec_u": [
          60,
          120
        ]
      }
    ],
    "strength": {
      "value": 1,
      "range": [
        0,
        1.5
      ],
      "note": "multiplies every pull vector"
    },
    "radius": {
      "value": 1,
      "range": [
        0.5,
        2
      ],
      "note": "multiplies every pull radius"
    },
    "swing": {
      "value": 0,
      "range": [
        0,
        1
      ],
      "note": "turns and scales the pulls through one cycle; Motion runs it"
    },
    "grab": {
      "x": {
        "value": 0.5,
        "range": [
          0,
          1
        ]
      },
      "y": {
        "value": 0.5,
        "range": [
          0,
          1
        ]
      },
      "pull_u": {
        "value": 0,
        "range": [
          0,
          320
        ],
        "unit": "u",
        "note": "a fifth pull, away from the sheet center; Live sets it at the pointer"
      },
      "radius_u": {
        "value": 280,
        "range": [
          80,
          600
        ],
        "unit": "u"
      }
    }
  },
  "limits": "A pull folds the sheet when 0.86 × vector length exceeds its radius; at strength 1 the largest ratio is 0.65. Pitch under ~24 u puts a cell below ten pixels and the outline closes.",
  "implementation": "Each pixel is sampled at its own position minus every pull vector times exp(−d² / r²). The grid is read at the sample point, so the sheet stretches behind a pull and bunches ahead of it."
};
export const params={
  "pitch_u": 52,
  "turn_deg": -8,
  "pulls": [
    {
      "at": [
        0.5,
        0.16
      ],
      "radius_u": 310,
      "vec_u": [
        0,
        -235
      ]
    },
    {
      "at": [
        0.93,
        0.3
      ],
      "radius_u": 250,
      "vec_u": [
        150,
        -105
      ]
    },
    {
      "at": [
        0.04,
        0.86
      ],
      "radius_u": 330,
      "vec_u": [
        -215,
        20
      ]
    },
    {
      "at": [
        0.62,
        1
      ],
      "radius_u": 260,
      "vec_u": [
        60,
        120
      ]
    }
  ],
  "strength": 1,
  "radius": 1,
  "swing": 0,
  "grab": {
    "x": 0.5,
    "y": 0.5,
    "pull_u": 0,
    "radius_u": 280
  }
};
export const A={};

export const make=(P,u,A)=>({ build:(W,H)=>{ const L=[]; P.pulls.forEach((p,k)=>{ const ph=6.2832*(P.swing+k/3), ph0=6.2832*k/3; const rot=0.6*(Math.sin(ph)-Math.sin(ph0)), sc=P.strength*(1+0.3*(Math.sin(2*ph+k)-Math.sin(2*ph0+k))); const c=Math.cos(rot), s=Math.sin(rot), r=p.radius_u*u*P.radius; L.push({ x:p.at[0]*W, y:p.at[1]*H, r2:r*r, vx:(p.vec_u[0]*c-p.vec_u[1]*s)*u*sc, vy:(p.vec_u[0]*s+p.vec_u[1]*c)*u*sc }); });
        if(P.grab.pull_u>0){ const gx=P.grab.x*W, gy=P.grab.y*H; const dx=gx-W/2, dy=gy-H/2, n=Math.hypot(dx,dy)||1, r=P.grab.radius_u*u; L.push({ x:gx, y:gy, r2:r*r, vx:dx/n*P.grab.pull_u*u, vy:dy/n*P.grab.pull_u*u }); }
        const a=P.turn_deg*Math.PI/180, ca=Math.cos(a), sa=Math.sin(a), p=P.pitch_u*u, out=[0,0,0,0];
        return { at:(x,y)=>{ let qx=x, qy=y; for(let k=0;k<L.length;k++){ const l=L[k]; const dx=x-l.x, dy=y-l.y, d2=dx*dx+dy*dy; if(d2<l.r2*8){ const g=Math.exp(-d2/l.r2); qx-=l.vx*g; qy-=l.vy*g; } }
            const gx=(qx*ca+qy*sa)/p, gy=(-qx*sa+qy*ca)/p; const i=Math.floor(gx), j=Math.floor(gy); out[0]=i; out[1]=j; out[2]=gx-i-0.5; out[3]=gy-j-0.5; return out; } }; } });
export default make;
