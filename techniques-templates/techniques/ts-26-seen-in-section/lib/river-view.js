/* river-view · Water and far hills — TS-26 Seen in section · Techniques & Templates · ø co.
   Lifted from techniques/ts-26-seen-in-section/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Above 108 u the water would reach the bank crest; under ~40 u the river is a shallow strip over the gravel. Above ~40 strokes per 10 000 u² the water turns white-on-blue and loses its depth. */
export const id="river-view", name="Water and far hills", code="TS-26", entry="ts-26-seen-in-section";
export const atoms=["water","stroke","haze"];
export const spec={
  "id": "river-view",
  "short": "WAVE",
  "name": "Water and far hills",
  "layer": 1,
  "pass": 2,
  "atoms": [
    "water",
    "stroke",
    "haze"
  ],
  "params": {
    "water_u": {
      "value": 102,
      "range": [
        40,
        108
      ],
      "unit": "u",
      "label": "Water level",
      "note": "Height of the water surface above the riverbed"
    },
    "strokes": {
      "value": 12,
      "range": [
        1.5,
        40
      ],
      "unit": "/10k u²",
      "label": "Wave strokes",
      "note": "White strokes on the water, per 10 000 u² of water"
    },
    "horizon_u": 300,
    "ridge_seed": 31,
    "ridges": [
      {
        "tone": 0,
        "peaks": [
          [
            318,
            36,
            62
          ],
          [
            236,
            24,
            46
          ],
          [
            392,
            15,
            34
          ]
        ]
      },
      {
        "tone": 0.55,
        "peaks": [
          [
            105,
            50,
            70
          ],
          [
            22,
            24,
            48
          ]
        ]
      },
      {
        "tone": 0.8,
        "peaks": [
          [
            182,
            34,
            78
          ],
          [
            40,
            12,
            40
          ],
          [
            296,
            7,
            40
          ]
        ]
      },
      {
        "tone": 1,
        "peaks": [
          [
            430,
            40,
            46
          ],
          [
            372,
            12,
            30
          ]
        ]
      }
    ],
    "stroke_seed": 7,
    "drift_u_s": [
      2.2,
      4.8
    ]
  },
  "limits": "Above 108 u the water would reach the bank crest; under ~40 u the river is a shallow strip over the gravel. Above ~40 strokes per 10 000 u² the water turns white-on-blue and loses its depth.",
  "implementation": "Water fills every column whose ground lies below the level, from the left edge to the shoreline. Strokes are arched, tapered dashes placed uniformly in the water; deeper strokes are longer and thicker. The far hills are four ridges drawn back to front, teal far to green near, each with a fractal crest, light on the flanks that face the upper left, fine dabbed flecks and haze toward the waterline; they stand on the waterline at any level."
};
export const params={
  "water_u": 102,
  "strokes": 12,
  "horizon_u": 300,
  "ridge_seed": 31,
  "ridges": [
    {
      "tone": 0,
      "peaks": [
        [
          318,
          36,
          62
        ],
        [
          236,
          24,
          46
        ],
        [
          392,
          15,
          34
        ]
      ]
    },
    {
      "tone": 0.55,
      "peaks": [
        [
          105,
          50,
          70
        ],
        [
          22,
          24,
          48
        ]
      ]
    },
    {
      "tone": 0.8,
      "peaks": [
        [
          182,
          34,
          78
        ],
        [
          40,
          12,
          40
        ],
        [
          296,
          7,
          40
        ]
      ]
    },
    {
      "tone": 1,
      "peaks": [
        [
          430,
          40,
          46
        ],
        [
          372,
          12,
          30
        ]
      ]
    }
  ],
  "stroke_seed": 7,
  "drift_u_s": [
    2.2,
    4.8
  ]
};
export const A={};
A.perlin=seed=>{ const r=A.rng(seed); const perm=new Uint8Array(512); const p=[]; for(let i=0;i<256;i++)p[i]=i; for(let i=255;i>0;i--){ const j=(r()*(i+1))|0; const t=p[i]; p[i]=p[j]; p[j]=t; } for(let i=0;i<512;i++)perm[i]=p[i&255];
  const G=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]; const fade=t=>t*t*t*(t*(t*6-15)+10);
  const n=(x,y)=>{ const X=Math.floor(x),Y=Math.floor(y); const xf=x-X,yf=y-Y; const xi=X&255,yi=Y&255; const g00=G[perm[perm[xi]+yi]&7],g10=G[perm[perm[xi+1]+yi]&7],g01=G[perm[perm[xi]+yi+1]&7],g11=G[perm[perm[xi+1]+yi+1]&7]; const n00=g00[0]*xf+g00[1]*yf,n10=g10[0]*(xf-1)+g10[1]*yf,n01=g01[0]*xf+g01[1]*(yf-1),n11=g11[0]*(xf-1)+g11[1]*(yf-1); const u=fade(xf),v=fade(yf); const a=n00+(n10-n00)*u; return a+((n01+(n11-n01)*u)-a)*v; };
  n.fbm=(x,y,o,g)=>{ let s=0,a=1,t=0; g=g||0.5; for(let i=0;i<(o||3);i++){ s+=a*n(x,y); t+=a; a*=g; const nx=x*2.03+17.1,ny=y*2.03+9.7; x=nx; y=ny; } return s/t; };
  return n; };
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
A.lerp=(a,b,t)=>a+(b-a)*t;
export const make=(P,u,A)=>{ const g=(x,c,w)=>{ const d=(x-c)/w; return Math.exp(-d*d); }; const H0=P.horizon_u;
      /* far hills: ridges back to front, each a sum of gaussian peaks with a fractal crest; tone 0 = far (teal), 1 = near (green) */
      const fb=A.perlin(P.ridge_seed);
      const hs=rd=>x=>{ let h=0; for(const [c,a,w] of rd.peaks)h+=a*g(x,c,w); return h; };
      const ridge=(rd,k)=>{ const h0=hs(rd); return x=>{ const h=h0(x), j=(2.6*fb.fbm(x/15+k*7.3,k*3.1+0.5,3)+1.0*fb(x/4.2+k*11.1,k*5.7+0.3))*Math.min(1,h/12); return H0-Math.max(0,h+j); }; };
      const ridges=P.ridges.map((rd,k)=>{ const h0=hs(rd); return { y:ridge(rd,k), lit:x=>Math.max(0,Math.min(1,0.5+1.5*(h0(x+6)-h0(x-6))/12)), tone:rd.tone }; });
      return { ridges, H0, level:(bed,crestLow)=>Math.max(bed-P.water_u,crestLow+3),
        /* strokes(G): arched dashes in the water, in u. G: { S, yw, xs, bedMax } */
        strokes:G=>{ const r=A.rng(P.stroke_seed); let area=0; for(let x=0;x<G.xs;x+=2)area+=Math.max(0,G.S(x)-G.yw)*2; const n=Math.round(P.strokes*area/10000); const out=[];
          for(let i=0;i<n;i++){ let x=0,y=0,ok=false; for(let k=0;k<30&&!ok;k++){ x=r()*G.xs; y=G.yw+1.2+r()*(G.bedMax-G.yw); ok=y<G.S(x)-1.5; } if(!ok)continue;
            const f=Math.min(1,(y-G.yw)/Math.max(8,G.bedMax-G.yw)); const len=(12+30*f)*(0.55+0.9*r()), th=(1.2+1.7*f)*(0.75+0.5*r()), arch=(r()-0.25)*th*1.3;
            let xr=x; while(xr<G.xs&&G.S(xr)>y+th)xr+=1;
            out.push({ x, y, len, th, arch, hi:r()<0.8, ph:r()*6.2832, v:A.lerp(P.drift_u_s[0],P.drift_u_s[1],1-f)*(0.75+0.5*r()), xr }); }
          return out; } }; };
export default make;
