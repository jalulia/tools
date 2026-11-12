/* shade-field · Tone by depth and wisp — TS-16 Stipple bank and dot burst · Techniques & Templates · ø co.
   Lifted from techniques/ts-16-stipple-cloud-bank/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: wisp_mix at 0 leaves only the depth ramp and the banks read as flat steps. stretch above ~6 turns wisps into stripes. */
export const id="shade-field", name="Tone by depth and wisp", code="TS-16", entry="ts-16-stipple-cloud-bank";
export const atoms=["noise-field","density","edge-distance"];
export const spec={
  "id": "shade-field",
  "short": "SHAD",
  "name": "Tone by depth and wisp",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "noise-field",
    "density",
    "edge-distance"
  ],
  "params": {
    "rim_depth": {
      "value": 0.9,
      "range": [
        0.2,
        3
      ],
      "note": "rim falloff, in lobe radii"
    },
    "rim_floor": {
      "value": 0.5,
      "range": [
        0,
        1
      ],
      "note": "tone left deep inside a rim bank"
    },
    "body_from": {
      "value": 0.12,
      "range": [
        0,
        1
      ],
      "note": "depth where a body bank starts to take tone, in lobe radii"
    },
    "body_to": {
      "value": 1.1,
      "range": [
        0.3,
        3
      ]
    },
    "wisp_u": {
      "value": 150,
      "range": [
        40,
        600
      ],
      "unit": "u"
    },
    "stretch": {
      "value": 3.2,
      "range": [
        1,
        8
      ],
      "note": "wisp length over width"
    },
    "contrast": {
      "value": 0.2,
      "range": [
        0.05,
        0.6
      ]
    },
    "wisp_mix": {
      "value": 0.85,
      "range": [
        0,
        1
      ]
    },
    "gain": {
      "value": 1,
      "range": [
        0,
        1.5
      ]
    },
    "seed": {
      "value": 9,
      "range": [
        1,
        9999
      ],
      "step": 1
    }
  },
  "limits": "wisp_mix at 0 leaves only the depth ramp and the banks read as flat steps. stretch above ~6 turns wisps into stripes.",
  "implementation": "Rim banks: tone = floor + (1 − floor)·exp(−depth / rim depth). Body banks: tone = smoothstep(depth) × wisp, where wisp is three-octave noise sampled in coordinates turned to the bank and stretched along it."
};
export const params={
  "rim_depth": 0.9,
  "rim_floor": 0.5,
  "body_from": 0.12,
  "body_to": 1.1,
  "wisp_u": 150,
  "stretch": 3.2,
  "contrast": 0.2,
  "wisp_mix": 0.85,
  "gain": 1,
  "seed": 9
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
export const make=(P,u,A)=>{ const n=A.perlin(P.seed); const sy=P.wisp_u*u, sx=sy*P.stretch;
      return { tone:(b,depth,x,y)=>{ const a=x*b.dir[0]+y*b.dir[1], c=-x*b.dir[1]+y*b.dir[0]; const w=A.sstep(-P.contrast,P.contrast,n.fbm(a/sx+3.1,c/sy+7.7,3)); const m=1-P.wisp_mix+P.wisp_mix*w; let t;
          if(b.shade==='rim'){ const e=depth<0?1:Math.exp(-depth/(P.rim_depth*b.Rb)); t=(P.rim_floor+(1-P.rim_floor)*e)*(0.55+0.45*m); } else t=A.sstep(P.body_from*b.Rb,P.body_to*b.Rb,depth)*m;
          t*=P.gain; return t<0?0:(t>1?1:t); } }; };
export default make;
