/* paper-tooth · Paper tooth — TS-10 Thermal blob field · Techniques & Templates · ø co.
   Lifted from techniques/ts-10-thermal-blob-field/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Grain above ~0.08 reads as noise on the paper and breaks the rim. A mottle cell under ~30 u reads as a second grain. */
export const id="paper-tooth", name="Paper tooth", code="TS-10", entry="ts-10-thermal-blob-field";
export const atoms=["grain","mottle"];
export const spec={
  "id": "paper-tooth",
  "short": "TOOTH",
  "name": "Paper tooth",
  "layer": 3,
  "pass": 3,
  "atoms": [
    "grain",
    "mottle"
  ],
  "params": {
    "grain_amp": {
      "value": 0.03,
      "range": [
        0,
        0.15
      ]
    },
    "pitch_px": 1,
    "mono": true,
    "seed": {
      "value": 1010,
      "range": [
        1,
        9999
      ],
      "step": 1
    },
    "mottle": {
      "formula": "perlin fbm, 3 octaves, overlay",
      "cell_u": {
        "value": 90,
        "range": [
          20,
          400
        ],
        "unit": "u"
      },
      "amp": {
        "value": 0.012,
        "range": [
          0,
          0.08
        ]
      },
      "octaves": 3,
      "gain": 0.55
    },
    "measured": "high-pass std 3.4/255 on paper, 5.5/255 in the core"
  },
  "limits": "Grain above ~0.08 reads as noise on the paper and breaks the rim. A mottle cell under ~30 u reads as a second grain.",
  "implementation": "Multiplicative mono grain per device pixel, then a low-frequency perlin mottle, both on the whole sheet including the blobs."
};
export const params={
  "grain_amp": 0.03,
  "pitch_px": 1,
  "mono": true,
  "seed": 1010,
  "mottle": {
    "formula": "perlin fbm, 3 octaves, overlay",
    "cell_u": 90,
    "amp": 0.012,
    "octaves": 3,
    "gain": 0.55
  },
  "measured": "high-pass std 3.4/255 on paper, 5.5/255 in the core"
};
export const A={};
A.grain=(ctx,opts)=>{ opts=opts||{}; const c=ctx.canvas; const w=c.width,h=c.height; const id=ctx.getImageData(0,0,w,h); const d=id.data; const amp=opts.amp||0.05, pitch=opts.pitch||1, seed=(opts.seed||7)|0, mono=opts.mono!==false, corr=opts.corr||0; const rows=Math.ceil(h/pitch), cols=Math.ceil(w/pitch);
  const hash=(x,y,k)=>{ let n=(x*374761393+y*668265263+k*1274126177+seed*2246822519)|0; n=(n^(n>>>13))*1274126177|0; n=n^(n>>>16); return ((n>>>0)/4294967296)*2-1; };
  const N=new Float32Array(rows*cols*(mono?1:3)); const ch=mono?1:3;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)for(let k=0;k<ch;k++){ let v=hash(x,y,k); if(corr){ v=(1-corr)*v+corr*0.5*(hash(x-1,y,k)+hash(x,y-1,k)); } N[(y*cols+x)*ch+k]=v; }
  for(let y=0;y<h;y++){ const ry=(y/pitch)|0; for(let x=0;x<w;x++){ const i=(y*w+x)*4; const b=(ry*cols+((x/pitch)|0))*ch; if(mono){ const m=1+amp*N[b]; d[i]=d[i]*m; d[i+1]=d[i+1]*m; d[i+2]=d[i+2]*m; } else { d[i]=d[i]*(1+amp*N[b]); d[i+1]=d[i+1]*(1+amp*N[b+1]); d[i+2]=d[i+2]*(1+amp*N[b+2]); } } }
  ctx.putImageData(id,0,0); };
A.perlin=seed=>{ const r=A.rng(seed); const perm=new Uint8Array(512); const p=[]; for(let i=0;i<256;i++)p[i]=i; for(let i=255;i>0;i--){ const j=(r()*(i+1))|0; const t=p[i]; p[i]=p[j]; p[j]=t; } for(let i=0;i<512;i++)perm[i]=p[i&255];
  const G=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]; const fade=t=>t*t*t*(t*(t*6-15)+10);
  const n=(x,y)=>{ const X=Math.floor(x),Y=Math.floor(y); const xf=x-X,yf=y-Y; const xi=X&255,yi=Y&255; const g00=G[perm[perm[xi]+yi]&7],g10=G[perm[perm[xi+1]+yi]&7],g01=G[perm[perm[xi]+yi+1]&7],g11=G[perm[perm[xi+1]+yi+1]&7]; const n00=g00[0]*xf+g00[1]*yf,n10=g10[0]*(xf-1)+g10[1]*yf,n01=g01[0]*xf+g01[1]*(yf-1),n11=g11[0]*(xf-1)+g11[1]*(yf-1); const u=fade(xf),v=fade(yf); const a=n00+(n10-n00)*u; return a+((n01+(n11-n01)*u)-a)*v; };
  n.fbm=(x,y,o,g)=>{ let s=0,a=1,t=0; g=g||0.5; for(let i=0;i<(o||3);i++){ s+=a*n(x,y); t+=a; a*=g; const nx=x*2.03+17.1,ny=y*2.03+9.7; x=nx; y=ny; } return s/t; };
  return n; };
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
A.off=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,u,A)=>({ apply:(x,W,H)=>{ A.grain(x,{amp:P.grain_amp,pitch:1,seed:P.seed,mono:true});
      const n=A.perlin(P.seed); const s=Math.max(1,Math.round(6*u)); const mw=Math.ceil(W/s), mh=Math.ceil(H/s); const m=A.off(mw,mh); const mx=m.getContext('2d'); const id=mx.createImageData(mw,mh); const d=id.data;
      for(let j=0;j<mh;j++)for(let i=0;i<mw;i++){ const v=n.fbm(i*s/(P.mottle.cell_u*u),j*s/(P.mottle.cell_u*u),P.mottle.octaves,P.mottle.gain); const g=A.clamp(128+128*P.mottle.amp*4*v,0,255); const k=(j*mw+i)*4; d[k]=d[k+1]=d[k+2]=g; d[k+3]=255; }
      mx.putImageData(id,0,0); x.setTransform(1,0,0,1,0,0); x.globalCompositeOperation='overlay'; x.imageSmoothingEnabled=true; x.drawImage(m,0,0,W,H); x.globalCompositeOperation='source-over'; } });
export default make;
