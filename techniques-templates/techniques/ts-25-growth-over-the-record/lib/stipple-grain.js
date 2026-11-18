/* stipple-grain · Stipple grain and riverbed mark — TS-25 Growth over the record · Techniques & Templates · ø co.
   Lifted from techniques/ts-25-growth-over-the-record/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Below 0.7 u the grain is finer than a screen pixel at 900 px; above 1.6 u it clumps into blots. Current strokes narrower than about 2 u vanish at page size. */
export const id="stipple-grain", name="Stipple grain and riverbed mark", code="TS-25", entry="ts-25-growth-over-the-record";
export const atoms=["stochastic-screen","value-noise","anisotropic-noise","dither"];
export const spec={
  "id": "stipple-grain",
  "short": "GRAN",
  "name": "Stipple grain and riverbed mark",
  "layer": 4,
  "pass": 4,
  "atoms": [
    "stochastic-screen",
    "value-noise",
    "anisotropic-noise",
    "dither"
  ],
  "params": {
    "grain_u": {
      "value": 1.3,
      "range": [
        0.7,
        1.6
      ],
      "step": 0.05,
      "unit": "u",
      "label": "Grain size",
      "note": "cell of the value noise that picks each pixel’s ink"
    },
    "mark": {
      "value": 1,
      "options": [
        {
          "v": 1,
          "label": "Stipple"
        },
        {
          "v": 2,
          "label": "Current"
        }
      ],
      "label": "Riverbed mark",
      "note": "Stipple lays the blue like the grass; Current lays it in flow strokes along the boundary"
    },
    "spread": 0.72,
    "lean_var_deg": 20,
    "streak_u": 3.5,
    "current": {
      "length_u": 34,
      "width_u": 2.1,
      "meander_u": 7,
      "gain": 1.7,
      "lift": 0.07
    },
    "seed": 1556
  },
  "limits": "Below 0.7 u the grain is finer than a screen pixel at 900 px; above 1.6 u it clumps into blots. Current strokes narrower than about 2 u vanish at page size.",
  "implementation": "Value noise on a lattice rotated 27°, mixed with per-pixel white noise, offsets each pixel’s tone before it picks one discrete ink; grass adds 3.5 u streaks traced from its bright specks. Current is a second value noise stretched 34 u along the boundary and 2.1 u across it, meandering 7 u, added to the blue only."
};
export const params={
  "grain_u": 1.3,
  "mark": 1,
  "spread": 0.72,
  "lean_var_deg": 20,
  "streak_u": 3.5,
  "current": {
    "length_u": 34,
    "width_u": 2.1,
    "meander_u": 7,
    "gain": 1.7,
    "lift": 0.07
  },
  "seed": 1556
};
export const A={};

export const make=(P,u,A)=>{ const hs=(x,y,s)=>{ let n=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,1274126177))|0; n=Math.imul(n^(n>>>13),1274126177); n^=n>>>16; return (n>>>0)/4294967296; };
      const unit=out=>{ let s=0, s2=0, n=0; for(let i=0;i<out.length;i+=97){ s+=out[i]; s2+=out[i]*out[i]; n++; } const m=s/n, k=1/Math.sqrt(Math.max(1e-6,s2/n-m*m)); for(let i=0;i<out.length;i++)out[i]=(out[i]-m)*k; return out; };
      /* value noise on a lattice; X = a·x + b·y, Y = c·x + d·y in lattice cells (any affine frame) */
      const lattice=(W,H,a,b,c,d,S0,warp)=>{ const xs=[0,W*a,H*b,W*a+H*b], ys=[0,W*c,H*d,W*c+H*d], i0=Math.floor(Math.min(...xs))-40, j0=Math.floor(Math.min(...ys))-40, nx=Math.ceil(Math.max(...xs))-i0+80, ny=Math.ceil(Math.max(...ys))-j0+80, L=new Float32Array(nx*ny), out=new Float32Array(W*H);
        for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)L[j*nx+i]=hs(i+i0,j+j0,S0);
        for(let y=0;y<H;y++){ const r=y*W, wy=warp?warp.row(y):null; for(let x=0;x<W;x++){ const X=x*a+y*b-i0, Y=x*c+y*d-j0+(wy?wy[x>>3]:0), i=X|0, j=Y|0; let fx=X-i, fy=Y-j; fx=fx*fx*(3-2*fx); fy=fy*fy*(3-2*fy); const q=j*nx+i;
          const v0=L[q], v1=L[q+1], v2=L[q+nx], v3=L[q+nx+1]; out[r+x]=v0+(v1-v0)*fx+(v2-v0+(v0-v1-v2+v3)*fx)*fy; } }
        return out; };
      /* grain field: lattice rotated 27°, cell = grain_u, plus white noise; unit std */
      const field=(W,H)=>{ const c=Math.max(0.6,P.grain_u*u), ic=1/c, ca=0.891, sa=0.454, out=lattice(W,H,ca*ic,sa*ic,-sa*ic,ca*ic,P.seed,null);
        for(let y=0;y<H;y++){ const r=y*W; for(let x=0;x<W;x++)out[r+x]=(out[r+x]-0.5)*4.2+(hs(x,y,P.seed+7)-0.5)*1.25; } return unit(out); };
      /* current: value noise stretched along the flow direction th (rad, screen), meandering; unit std */
      const flow=(W,H,th,pn)=>{ const C=P.current, la=1/(C.length_u*u), wa=1/(C.width_u*u), dx=Math.cos(th), dy=Math.sin(th), mu=C.meander_u*u*wa, sc=1/(90*u);
        const warp={ row:y=>{ const n=Math.ceil(W/8)+1, o=new Float32Array(n); for(let k=0;k<n;k++)o[k]=mu*pn(k*8*sc+3.1,y*sc+7.7); return o; } };
        return unit(lattice(W,H,dx*la,dy*la,-dy*wa,dx*wa,P.seed+101,warp)); };
      /* fine blade streaks: each bright (or dark) speck adds a tapering streak above it along dirAt(x,y) (rad, per 8-px block) */
      const streak=(g,W,H,len,dirAt,shift)=>{ const n=Math.max(1,Math.round(len)), bw=Math.ceil(W/8), bh=Math.ceil(H/8), N=W*H, out=new Float32Array(N), OF=new Int32Array(bw*bh*n), w=new Float32Array(n); let ws=0;
        for(let k=0;k<n;k++){ w[k]=1-k/(n+1); ws+=w[k]; } for(let k=0;k<n;k++)w[k]/=ws*0.16;
        for(let by=0;by<bh;by++)for(let bx=0;bx<bw;bx++){ const a=dirAt(bx*8+4,by*8+4), dx=Math.sin(a), dy=-Math.cos(a), o=(by*bw+bx)*n; for(let k=0;k<n;k++)OF[o+k]=Math.round((k+1)*dy)*W+Math.round((k+1)*dx); }
        for(let j=0;j<N;j++){ const v=g[j]; let a; if(v>1.25)a=v-1.25; else if(v<-1.5)a=(v+1.5)*0.7; else continue; const q=j-shift; if(q<0)continue; const y=(q/W)|0, x=q-y*W, o=((y>>3)*bw+(x>>3))*n;
          for(let k=0;k<n;k++){ const i=q+OF[o+k]; if(i>=0&&i<N)out[i]+=w[k]*a; } }
        return out; };
      return { field, flow, streak, hs, blade:P.streak_u*u, current:P.mark===2, gain:P.current.gain, lift:P.current.lift, leanVar:P.lean_var_deg*Math.PI/180, spread:P.spread, seed:P.seed }; };
export default make;
