/* shade-field · Density shading — TS-16 Stipple bank and dot burst · Techniques & Templates · ø co.
   Lifted from techniques/ts-16-stipple-cloud-bank/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: floor at 1 removes the shading. scale under ~80 u reads as blotches, not form. */
export const id="shade-field", name="Density shading", code="TS-16", entry="ts-16-stipple-cloud-bank";
export const atoms=["noise-field","density"];
export const spec={
  "id": "shade-field",
  "short": "SHAD",
  "name": "Density shading",
  "layer": 2,
  "pass": 3,
  "atoms": [
    "noise-field",
    "density"
  ],
  "params": {
    "scale_u": {
      "value": 260,
      "range": [
        80,
        900
      ],
      "unit": "u"
    },
    "floor": {
      "value": 0.45,
      "range": [
        0,
        1
      ],
      "note": "lowest share of dots kept"
    },
    "seed": {
      "value": 9,
      "range": [
        1,
        9999
      ],
      "step": 1
    },
    "density": "floor + (1 − floor) · smoothstep(−0.25, 0.3, fbm)"
  },
  "limits": "floor at 1 removes the shading. scale under ~80 u reads as blotches, not form.",
  "implementation": "A two-octave noise field gives each dot a keep probability between the floor and 1."
};
export const params={
  "scale_u": 260,
  "floor": 0.45,
  "seed": 9,
  "density": "floor + (1 − floor) · smoothstep(−0.25, 0.3, fbm)"
};
export const A={};
A.perlin=seed=>{ const r=A.rng(seed); const perm=new Uint8Array(512); const p=[]; for(let i=0;i<256;i++)p[i]=i; for(let i=255;i>0;i--){ const j=(r()*(i+1))|0; const t=p[i]; p[i]=p[j]; p[j]=t; } for(let i=0;i<512;i++)perm[i]=p[i&255];
  const G=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]; const fade=t=>t*t*t*(t*(t*6-15)+10);
  const n=(x,y)=>{ const X=Math.floor(x),Y=Math.floor(y); const xf=x-X,yf=y-Y; const xi=X&255,yi=Y&255; const g00=G[perm[perm[xi]+yi]&7],g10=G[perm[perm[xi+1]+yi]&7],g01=G[perm[perm[xi]+yi+1]&7],g11=G[perm[perm[xi+1]+yi+1]&7]; const n00=g00[0]*xf+g00[1]*yf,n10=g10[0]*(xf-1)+g10[1]*yf,n01=g01[0]*xf+g01[1]*(yf-1),n11=g11[0]*(xf-1)+g11[1]*(yf-1); const u=fade(xf),v=fade(yf); const a=n00+(n10-n00)*u; return a+((n01+(n11-n01)*u)-a)*v; };
  n.fbm=(x,y,o,g)=>{ let s=0,a=1,t=0; g=g||0.5; for(let i=0;i<(o||3);i++){ s+=a*n(x,y); t+=a; a*=g; const nx=x*2.03+17.1,ny=y*2.03+9.7; x=nx; y=ny; } return s/t; };
  return n; };
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,u,A)=>{ const n=A.perlin(P.seed); const s=P.scale_u*u; return { keep:(x,y)=>P.floor+(1-P.floor)*A.sstep(-0.25,0.3,n.fbm(x/s,y/s,2)) }; };
export default make;
