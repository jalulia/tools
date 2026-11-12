/* marbled-fill · Marbled fill from fbm bands — TS-06 Riso three-plate separation · Techniques & Templates · ø co.
   Lifted from techniques/ts-06-riso-plate-separation/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: core ≥ rim removes the half-tone rim and the veins go hard-edged. Above scale ~100 u a top face holds less than one vein. One octave gives smooth contour lines, not marble. */
export const id="marbled-fill", name="Marbled fill from fbm bands", code="TS-06", entry="ts-06-riso-plate-separation";
export const atoms=["fbm","threshold","band"];
export const spec={
  "id": "marbled-fill",
  "short": "MARB",
  "name": "Marbled fill from fbm bands",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "fbm",
    "threshold",
    "band"
  ],
  "params": {
    "scale_u": {
      "value": 30,
      "range": [
        8,
        140
      ],
      "unit": "u"
    },
    "octaves": {
      "value": 4,
      "range": [
        1,
        6
      ],
      "step": 1
    },
    "gain": {
      "value": 0.6,
      "range": [
        0.3,
        0.9
      ]
    },
    "core": {
      "value": 0.055,
      "range": [
        0,
        0.2
      ],
      "note": "|n| below this → paper"
    },
    "rim": {
      "value": 0.1,
      "range": [
        0,
        0.35
      ],
      "note": "|n| below this → rim coverage"
    },
    "rim_coverage": {
      "value": 0.5,
      "range": [
        0,
        1
      ]
    },
    "seed": {
      "value": 610,
      "range": [
        1,
        9999
      ],
      "step": 1
    },
    "elsewhere": 1
  },
  "limits": "core ≥ rim removes the half-tone rim and the veins go hard-edged. Above scale ~100 u a top face holds less than one vein. One octave gives smooth contour lines, not marble.",
  "implementation": "Inside the top faces the pink plate is full except where an fbm field crosses zero: the core of the band is paper, the rim half-coverage, which reads as swirls."
};
export const params={
  "scale_u": 30,
  "octaves": 4,
  "gain": 0.6,
  "core": 0.055,
  "rim": 0.1,
  "rim_coverage": 0.5,
  "seed": 610,
  "elsewhere": 1
};
export const A={};
A.perlin=seed=>{ const r=A.rng(seed); const perm=new Uint8Array(512); const p=[]; for(let i=0;i<256;i++)p[i]=i; for(let i=255;i>0;i--){ const j=(r()*(i+1))|0; const t=p[i]; p[i]=p[j]; p[j]=t; } for(let i=0;i<512;i++)perm[i]=p[i&255];
  const G=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]; const fade=t=>t*t*t*(t*(t*6-15)+10);
  const n=(x,y)=>{ const X=Math.floor(x),Y=Math.floor(y); const xf=x-X,yf=y-Y; const xi=X&255,yi=Y&255; const g00=G[perm[perm[xi]+yi]&7],g10=G[perm[perm[xi+1]+yi]&7],g01=G[perm[perm[xi]+yi+1]&7],g11=G[perm[perm[xi+1]+yi+1]&7]; const n00=g00[0]*xf+g00[1]*yf,n10=g10[0]*(xf-1)+g10[1]*yf,n01=g01[0]*xf+g01[1]*(yf-1),n11=g11[0]*(xf-1)+g11[1]*(yf-1); const u=fade(xf),v=fade(yf); const a=n00+(n10-n00)*u; return a+((n01+(n11-n01)*u)-a)*v; };
  n.fbm=(x,y,o,g)=>{ let s=0,a=1,t=0; g=g||0.5; for(let i=0;i<(o||3);i++){ s+=a*n(x,y); t+=a; a*=g; const nx=x*2.03+17.1,ny=y*2.03+9.7; x=nx; y=ny; } return s/t; };
  return n; };
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>{ const pm=A.perlin(P.seed); const ms=P.scale_u*u;
      return { cov:(X,Y)=>{ const n=pm.fbm(X/ms,Y/ms,P.octaves,P.gain); const an=Math.abs(n); return an<P.core?0:(an<P.rim?P.rim_coverage:1); } }; };
export default make;
