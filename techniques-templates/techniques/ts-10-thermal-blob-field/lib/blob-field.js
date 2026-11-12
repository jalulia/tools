/* blob-field · Blurred blob field — TS-10 Thermal blob field · Techniques & Templates · ø co.
   Lifted from techniques/ts-10-thermal-blob-field/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Under σ ~15 u the edge profile is too steep for the ramp and the bands alias. Past σ ~110 u neighboring blobs fuse and the rim stop no longer closes. harmonic_scale above ~2 makes r(θ) cross zero and the outline self-intersects. */
export const id="blob-field", name="Blurred blob field", code="TS-10", entry="ts-10-thermal-blob-field";
export const atoms=["blob","fourier-radius","gaussian-blur"];
export const spec={
  "id": "blob-field",
  "short": "BLOB",
  "name": "Blurred blob field",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "blob",
    "fourier-radius",
    "gaussian-blur"
  ],
  "params": {
    "blobs": 4,
    "radius": "r(θ) = R·(1 + Σ a_k·cos(k·θ + φ_k)), k = 2..4, a ≤ 0.22",
    "shapes": [
      {
        "c": [
          340,
          -120
        ],
        "R": 250,
        "sx": 1.05,
        "sy": 0.7,
        "h": [
          [
            2,
            0.08,
            0.4
          ],
          [
            3,
            0.1,
            1.9
          ],
          [
            4,
            0.05,
            3.2
          ]
        ]
      },
      {
        "c": [
          210,
          610
        ],
        "R": 280,
        "sx": 1.15,
        "sy": 1,
        "h": [
          [
            2,
            0.16,
            3.14
          ],
          [
            3,
            0.14,
            4.71
          ],
          [
            4,
            0.05,
            4.4
          ],
          [
            5,
            0.04,
            1.2
          ]
        ]
      },
      {
        "c": [
          630,
          730
        ],
        "R": 200,
        "sx": 1.4,
        "sy": 0.62,
        "h": [
          [
            2,
            0.1,
            1.1
          ],
          [
            3,
            0.08,
            3
          ]
        ]
      },
      {
        "c": [
          1090,
          720
        ],
        "R": 150,
        "sx": 1,
        "sy": 1,
        "h": [
          [
            2,
            0.12,
            0.2
          ],
          [
            3,
            0.06,
            2.2
          ]
        ]
      }
    ],
    "R_scale": {
      "value": 1,
      "range": [
        0.4,
        1.8
      ],
      "note": "multiplies every blob radius"
    },
    "harmonic_scale": {
      "value": 1,
      "range": [
        0,
        2.5
      ],
      "note": "multiplies every a_k"
    },
    "blur_sigma_u": {
      "value": 46,
      "range": [
        6,
        140
      ],
      "unit": "u"
    },
    "res_div": {
      "value": 3,
      "range": [
        1,
        6
      ],
      "step": 1,
      "note": "field resolution = device px / res_div"
    },
    "fill": "radial white → 0.78 gray at the shape edge, union by lighten"
  },
  "limits": "Under σ ~15 u the edge profile is too steep for the ramp and the bands alias. Past σ ~110 u neighboring blobs fuse and the rim stop no longer closes. harmonic_scale above ~2 makes r(θ) cross zero and the outline self-intersects.",
  "implementation": "Four Fourier-radius blobs are filled with a radial white-to-gray gradient on a black canvas (union by lighten) at one-third resolution, blurred with σ = 46 u and read back as a 0..1 luminance field."
};
export const params={
  "blobs": 4,
  "radius": "r(θ) = R·(1 + Σ a_k·cos(k·θ + φ_k)), k = 2..4, a ≤ 0.22",
  "shapes": [
    {
      "c": [
        340,
        -120
      ],
      "R": 250,
      "sx": 1.05,
      "sy": 0.7,
      "h": [
        [
          2,
          0.08,
          0.4
        ],
        [
          3,
          0.1,
          1.9
        ],
        [
          4,
          0.05,
          3.2
        ]
      ]
    },
    {
      "c": [
        210,
        610
      ],
      "R": 280,
      "sx": 1.15,
      "sy": 1,
      "h": [
        [
          2,
          0.16,
          3.14
        ],
        [
          3,
          0.14,
          4.71
        ],
        [
          4,
          0.05,
          4.4
        ],
        [
          5,
          0.04,
          1.2
        ]
      ]
    },
    {
      "c": [
        630,
        730
      ],
      "R": 200,
      "sx": 1.4,
      "sy": 0.62,
      "h": [
        [
          2,
          0.1,
          1.1
        ],
        [
          3,
          0.08,
          3
        ]
      ]
    },
    {
      "c": [
        1090,
        720
      ],
      "R": 150,
      "sx": 1,
      "sy": 1,
      "h": [
        [
          2,
          0.12,
          0.2
        ],
        [
          3,
          0.06,
          2.2
        ]
      ]
    }
  ],
  "R_scale": 1,
  "harmonic_scale": 1,
  "blur_sigma_u": 46,
  "res_div": 3,
  "fill": "radial white → 0.78 gray at the shape edge, union by lighten"
};
export const A={};
A.off=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
A.blur=(src,radiusPx)=>{ const c=A.off(src.width,src.height); const x=c.getContext('2d'); x.filter=`blur(${radiusPx}px)`; x.drawImage(src,0,0); x.filter='none'; return c; };
export const make=(P,u,A)=>({ div:P.res_div, field:(W,H,s,off)=>{
      const p=Math.ceil(140*s); const c=A.off(W+2*p,H+2*p); const x=c.getContext('2d'); x.fillStyle='#000'; x.fillRect(0,0,c.width,c.height); x.fillStyle='#fff';
      x.globalCompositeOperation='lighten';
      const B=P.shapes; for(let b=0;b<B.length;b++){ const q=B[b]; const R=q.R*P.R_scale; const o=off?off[b]:[0,0]; const cx=p+(q.c[0]+o[0])*s, cy=p+(q.c[1]+o[1])*s; const g=x.createRadialGradient(cx,cy,0,cx,cy,R*Math.max(q.sx,q.sy)*1.25*s); g.addColorStop(0,'#fff'); g.addColorStop(1,'#c8c8c8'); x.fillStyle=g; x.beginPath();
        for(let i=0;i<=96;i++){ const th=i/96*6.283185; let r=1; for(const hh of q.h)r+=hh[1]*P.harmonic_scale*Math.cos(hh[0]*th+hh[2]); const px=p+(q.c[0]+o[0]+Math.cos(th)*R*q.sx*r)*s, py=p+(q.c[1]+o[1]+Math.sin(th)*R*q.sy*r)*s; if(i)x.lineTo(px,py); else x.moveTo(px,py); }
        x.closePath(); x.fill(); }
      x.globalCompositeOperation='source-over';
      const bl=A.blur(c,P.blur_sigma_u*s); const out=A.off(W,H); const ox=out.getContext('2d'); ox.fillStyle='#000'; ox.fillRect(0,0,W,H); ox.drawImage(bl,-p,-p); return out; } });
export default make;
