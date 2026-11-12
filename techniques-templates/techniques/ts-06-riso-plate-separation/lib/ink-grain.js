/* ink-grain · Per-plate ink grain — TS-06 Riso three-plate separation · Techniques & Templates · ø co.
   Lifted from techniques/ts-06-riso-plate-separation/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: floor + gain above 1 clips fills to full coverage and the edge thinning disappears. stochastic above ~0.7 breaks the keyline into specks. A mottle scale under ~20 u reads as a second grain, not as uneven inking. */
export const id="ink-grain", name="Per-plate ink grain", code="TS-06", entry="ts-06-riso-plate-separation";
export const atoms=["grain","mottle","edge-thinning"];
export const spec={
  "id": "ink-grain",
  "short": "GRN",
  "name": "Per-plate ink grain",
  "layer": 3,
  "pass": 2,
  "atoms": [
    "grain",
    "mottle",
    "edge-thinning"
  ],
  "params": {
    "amp": [
      0.1,
      0.12,
      0.11
    ],
    "amp_scale": {
      "value": 1,
      "range": [
        0,
        3
      ],
      "note": "multiplies the three plate amplitudes"
    },
    "seeds": [
      601,
      602,
      603
    ],
    "pitch_px": 1,
    "stochastic": {
      "value": 0.4,
      "range": [
        0,
        0.95
      ],
      "note": "coverage × (1 − stochastic·rand)"
    },
    "edge": {
      "blur_u": {
        "value": 4,
        "range": [
          0,
          20
        ],
        "unit": "u"
      },
      "floor": {
        "value": 0.72,
        "range": [
          0.2,
          1
        ]
      },
      "gain": {
        "value": 0.28,
        "range": [
          0,
          0.8
        ]
      },
      "formula": "coverage × (floor + gain·blur(coverage, blur_u))"
    },
    "mottle": {
      "base": {
        "value": 0.86,
        "range": [
          0.4,
          1
        ]
      },
      "depth": {
        "value": 0.14,
        "range": [
          0,
          0.6
        ]
      },
      "scale_u": {
        "value": 60,
        "range": [
          12,
          300
        ],
        "unit": "u"
      },
      "seed": {
        "value": 611,
        "range": [
          1,
          9999
        ],
        "step": 1
      },
      "formula": "base + depth·perlin(p / scale_u)"
    }
  },
  "limits": "floor + gain above 1 clips fills to full coverage and the edge thinning disappears. stochastic above ~0.7 breaks the keyline into specks. A mottle scale under ~20 u reads as a second grain, not as uneven inking.",
  "implementation": "Before colouring, coverage is multiplied by a blurred copy of itself so fills thin toward their edges, and by a slow perlin mottle; after colouring ART.grain runs mono on the plate and paper pixels are reset to white."
};
export const params={
  "amp": [
    0.1,
    0.12,
    0.11
  ],
  "amp_scale": 1,
  "seeds": [
    601,
    602,
    603
  ],
  "pitch_px": 1,
  "stochastic": 0.4,
  "edge": {
    "blur_u": 4,
    "floor": 0.72,
    "gain": 0.28,
    "formula": "coverage × (floor + gain·blur(coverage, blur_u))"
  },
  "mottle": {
    "base": 0.86,
    "depth": 0.14,
    "scale_u": 60,
    "seed": 611,
    "formula": "base + depth·perlin(p / scale_u)"
  }
};
export const A={};
A.perlin=seed=>{ const r=A.rng(seed); const perm=new Uint8Array(512); const p=[]; for(let i=0;i<256;i++)p[i]=i; for(let i=255;i>0;i--){ const j=(r()*(i+1))|0; const t=p[i]; p[i]=p[j]; p[j]=t; } for(let i=0;i<512;i++)perm[i]=p[i&255];
  const G=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]; const fade=t=>t*t*t*(t*(t*6-15)+10);
  const n=(x,y)=>{ const X=Math.floor(x),Y=Math.floor(y); const xf=x-X,yf=y-Y; const xi=X&255,yi=Y&255; const g00=G[perm[perm[xi]+yi]&7],g10=G[perm[perm[xi+1]+yi]&7],g01=G[perm[perm[xi]+yi+1]&7],g11=G[perm[perm[xi+1]+yi+1]&7]; const n00=g00[0]*xf+g00[1]*yf,n10=g10[0]*(xf-1)+g10[1]*yf,n01=g01[0]*xf+g01[1]*(yf-1),n11=g11[0]*(xf-1)+g11[1]*(yf-1); const u=fade(xf),v=fade(yf); const a=n00+(n10-n00)*u; return a+((n01+(n11-n01)*u)-a)*v; };
  n.fbm=(x,y,o,g)=>{ let s=0,a=1,t=0; g=g||0.5; for(let i=0;i<(o||3);i++){ s+=a*n(x,y); t+=a; a*=g; const nx=x*2.03+17.1,ny=y*2.03+9.7; x=nx; y=ny; } return s/t; };
  return n; };
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>{ const pmo=A.perlin(P.mottle.seed); const mo=P.mottle.scale_u*u;
      return { blur:P.edge.blur_u*u, amps:P.amp.map(a=>a*P.amp_scale), seeds:P.seeds,
        mottle:(X,Y)=>P.mottle.base+P.mottle.depth*(0.5+0.5*pmo(X/mo,Y/mo)),
        thin:soft=>P.edge.floor+P.edge.gain*soft/255,
        starve:r=>1-P.stochastic*r }; };
export default make;
