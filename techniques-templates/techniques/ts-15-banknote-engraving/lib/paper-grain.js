/* paper-grain · Paper grain — TS-15 Banknote engraving · Techniques & Templates · ø co.
   Lifted from techniques/ts-15-banknote-engraving/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Above ~0.06 the grain reads before the line; this pass is the last thing to add and the first to remove. */
export const id="paper-grain", name="Paper grain", code="TS-15", entry="ts-15-banknote-engraving";
export const atoms=["grain","stock"];
export const spec={
  "id": "paper-grain",
  "short": "GRAIN",
  "name": "Paper grain",
  "layer": 4,
  "pass": 7,
  "atoms": [
    "grain",
    "stock"
  ],
  "params": {
    "amp": {
      "value": 0.03,
      "range": [
        0,
        0.12
      ]
    },
    "cell_u": {
      "value": 0.6,
      "range": [
        0.25,
        4
      ],
      "unit": "u",
      "note": "grain cell; one device pixel at the default"
    },
    "corr": {
      "value": 0.35,
      "range": [
        0,
        0.8
      ]
    },
    "seed": {
      "value": 15,
      "range": [
        1,
        9999
      ],
      "step": 1
    }
  },
  "limits": "Above ~0.06 the grain reads before the line; this pass is the last thing to add and the first to remove.",
  "implementation": "One multiplicative monochrome noise pass over paper and ink together, on cells of 1.4 u with lag-1 correlation."
};
export const params={
  "amp": 0.03,
  "cell_u": 0.6,
  "corr": 0.35,
  "seed": 15
};
export const A={};
A.grain=(ctx,opts)=>{ opts=opts||{}; const c=ctx.canvas; const w=c.width,h=c.height; const id=ctx.getImageData(0,0,w,h); const d=id.data; const amp=opts.amp||0.05, pitch=opts.pitch||1, seed=(opts.seed||7)|0, mono=opts.mono!==false, corr=opts.corr||0; const rows=Math.ceil(h/pitch), cols=Math.ceil(w/pitch);
  const hash=(x,y,k)=>{ let n=(x*374761393+y*668265263+k*1274126177+seed*2246822519)|0; n=(n^(n>>>13))*1274126177|0; n=n^(n>>>16); return ((n>>>0)/4294967296)*2-1; };
  const N=new Float32Array(rows*cols*(mono?1:3)); const ch=mono?1:3;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)for(let k=0;k<ch;k++){ let v=hash(x,y,k); if(corr){ v=(1-corr)*v+corr*0.5*(hash(x-1,y,k)+hash(x,y-1,k)); } N[(y*cols+x)*ch+k]=v; }
  for(let y=0;y<h;y++){ const ry=(y/pitch)|0; for(let x=0;x<w;x++){ const i=(y*w+x)*4; const b=(ry*cols+((x/pitch)|0))*ch; if(mono){ const m=1+amp*N[b]; d[i]=d[i]*m; d[i+1]=d[i+1]*m; d[i+2]=d[i+2]*m; } else { d[i]=d[i]*(1+amp*N[b]); d[i+1]=d[i+1]*(1+amp*N[b+1]); d[i+2]=d[i+2]*(1+amp*N[b+2]); } } }
  ctx.putImageData(id,0,0); };
export const make=(P,u,A)=>({ apply:ctx=>{ if(P.amp>0)A.grain(ctx,{amp:P.amp,pitch:Math.max(1,Math.round(P.cell_u*u)),seed:P.seed,corr:P.corr}); } });
export default make;
