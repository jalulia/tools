/* T-04 · Effect set · FX core · ø co. Techniques & Templates
   Shared by every effect in a set: seeded noise, a blue-noise rank tile, ease curves,
   OKLab / OKLCH color, a randomized edge mask, and a per-pixel compositor that mixes
   coverage into the ground under an explicit color rule.
   Units: every length a set exposes is in CSS px; effects render at device px (dpr ≤ 2),
   so density means "marks per CSS px²" on any screen — a density dial changes the COUNT
   of marks, never the zoom of a tile.
   OKLab: Björn Ottosson, "A perceptual color space for image processing" (2020),
   https://bottosson.github.io/posts/oklab/ — matrices below are that post's, verbatim.
   OKLCH as defined in CSS Color 4 (https://www.w3.org/TR/css-color-4/#ok-lab). */
(function(G){
'use strict';
const FX=G.FX={};
const TAU=Math.PI*2, clamp=(x,a,b)=>x<a?a:x>b?b:x, lerp=(a,b,t)=>a+(b-a)*t;
FX.clamp=clamp; FX.lerp=lerp; FX.TAU=TAU;

/* ── seeded random + hash + value noise ── */
FX.rng=seed=>{ let a=seed>>>0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
const hash=FX.hash=(x,y,s)=>{ let h=(x*374761393+y*668265263+(s|0)*982451653)|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
const vnoise=FX.vnoise=(x,y,s)=>{ const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi, u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
  const a=hash(xi,yi,s), b=hash(xi+1,yi,s), c=hash(xi,yi+1,s), d=hash(xi+1,yi+1,s); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; };
/* fbm with an explicit spectrum: persistence = amplitude dropoff per octave, lacunarity = frequency step */
FX.fbm=(x,y,s,oct=3,pers=.5,lac=2)=>{ let v=0,amp=1,f=1,n=0; for(let i=0;i<oct;i++){ v+=amp*vnoise(x*f,y*f,s+i*17); n+=amp; f*=lac; amp*=pers; } return v/n; };

/* ── blue-noise rank tile (void-and-cluster, Ulichney 1993), 64 × 64, toroidal, built once at load ──
   rank[i] ∈ [0,1): thresholding the tile at t keeps a fraction t of cells, spread as evenly as possible.
   Used to choose WHICH sites survive at a given density, so sparse areas thin evenly instead of clumping. */
FX.blue=(()=>{ const N=64, NN=N*N, sig=1.9, K=new Float32Array(NN);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){ const dx=Math.min(x,N-x), dy=Math.min(y,N-y); K[y*N+x]=Math.exp(-(dx*dx+dy*dy)/(2*sig*sig)); }
  const r=FX.rng(1993), on=new Uint8Array(NN), E=new Float32Array(NN);
  const put=(p,s)=>{ const px=p%N, py=(p/N)|0; for(let y=0;y<N;y++){ const ky=((y-py+N)%N)*N, row=y*N; for(let x=0;x<N;x++) E[row+x]+=s*K[ky+((x-px+N)%N)]; } };
  const tight=()=>{ let b=-1,m=-1e9; for(let i=0;i<NN;i++) if(on[i]&&E[i]>m){m=E[i];b=i;} return b; };
  const voidp=()=>{ let b=-1,m=1e9; for(let i=0;i<NN;i++) if(!on[i]&&E[i]<m){m=E[i];b=i;} return b; };
  let ones=0; while(ones<NN*.1){ const p=(r()*NN)|0; if(!on[p]){ on[p]=1; put(p,1); ones++; } }
  for(let it=0;it<4000;it++){ const t=tight(); on[t]=0; put(t,-1); const v=voidp(); if(v===t){ on[t]=1; put(t,1); break; } on[v]=1; put(v,1); }
  const rank=new Uint32Array(NN), proto=on.slice(), PE=E.slice();
  let c=ones; while(c>0){ const t=tight(); on[t]=0; put(t,-1); c--; rank[t]=c; }
  on.set(proto); E.set(PE); c=ones; while(c<NN){ const v=voidp(); on[v]=1; put(v,1); rank[v]=c; c++; }
  const out=new Float32Array(NN); for(let i=0;i<NN;i++) out[i]=(rank[i]+.5)/NN;
  return { N, at:(x,y)=>out[(((y%N)+N)%N)*N+(((x%N)+N)%N)], data:out };
})();

/* ── ease curves · t ∈ [0,1] → [0,1], k shapes the curve ── */
FX.EASES={
  linear:{label:'linear',  f:t=>t},
  smooth:{label:'smoothstep', f:t=>t*t*(3-2*t)},
  smoother:{label:'smootherstep', f:t=>t*t*t*(t*(t*6-15)+10)},
  in:{label:'power in · tⁿ', k:true, f:(t,k)=>Math.pow(t,k)},
  out:{label:'power out', k:true, f:(t,k)=>1-Math.pow(1-t,k)},
  inout:{label:'power in-out', k:true, f:(t,k)=>t<.5?.5*Math.pow(2*t,k):1-.5*Math.pow(2-2*t,k)},
  expo:{label:'exponential', k:true, f:(t,k)=>Math.abs(k)<1e-3?t:(Math.exp(k*t)-1)/(Math.exp(k)-1)},
  sigmoid:{label:'sigmoid', k:true, f:(t,k)=>{ const s=x=>1/(1+Math.exp(-k*(x-.5))); const a=s(0),b=s(1); return (s(t)-a)/(b-a); }}
};
FX.ease=(e,t)=>{ const c=FX.EASES[e&&e[0]]||FX.EASES.linear; return clamp(c.f(clamp(t,0,1),e?+e[1]:1),0,1); };

/* ── color: sRGB ⇄ linear (LUT for encode), OKLab, OKLCH, gamut ── */
const toLin=c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);
const ENC=new Uint8Array(4097); for(let i=0;i<=4096;i++){ const c=i/4096; ENC[i]=Math.round(255*(c<=.0031308?12.92*c:1.055*Math.pow(c,1/2.4)-.055)); }
const enc=FX.enc=v=>ENC[(v<=0?0:v>=1?4096:(v*4096+.5)|0)];
const DEC=new Float32Array(256); for(let i=0;i<256;i++) DEC[i]=toLin(i/255); FX.dec=i=>DEC[i];
FX.lin2lab=(r,g,b,o)=>{ const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b), m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b), s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  o[0]=.2104542553*l+.7936177850*m-.0040720468*s; o[1]=1.9779984951*l-2.4285922050*m+.4505937099*s; o[2]=.0259040371*l+.7827717662*m-.8086757660*s; return o; };
FX.lab2lin=(L,a,b,o)=>{ let l=L+.3963377774*a+.2158037573*b, m=L-.1055613458*a-.0638541728*b, s=L-.0894841775*a-1.2914855480*b; l*=l*l; m*=m*m; s*=s*s;
  o[0]=4.0767416621*l-3.3077115913*m+.2309699292*s; o[1]=-1.2684380046*l+2.6097574011*m-.3413193965*s; o[2]=-.0041960863*l-.7034186147*m+1.7076147010*s; return o; };
const inGamut=(o,e=1e-4)=>o[0]>=-e&&o[0]<=1+e&&o[1]>=-e&&o[1]<=1+e&&o[2]>=-e&&o[2]<=1+e;
/* an ink: OKLCH in, every form out. Out-of-gamut chroma is reduced at constant L and h (binary search) and flagged. */
FX.ink=(L,C,h)=>{ const t=[0,0,0]; let c=C, mapped=false; const try_=c=>{ const hr=h*Math.PI/180; return FX.lab2lin(L,c*Math.cos(hr),c*Math.sin(hr),t); };
  if(!inGamut(try_(c))){ mapped=true; let lo=0,hi=c; for(let i=0;i<24;i++){ const mid=(lo+hi)/2; if(inGamut(try_(mid)))lo=mid; else hi=mid; } c=lo; try_(c); }
  const lin=[clamp(t[0],0,1),clamp(t[1],0,1),clamp(t[2],0,1)], hr=h*Math.PI/180;
  return { L, C:c, h, Creq:C, mapped, lab:[L,c*Math.cos(hr),c*Math.sin(hr)], lin, hex:'#'+lin.map(v=>enc(v).toString(16).padStart(2,'0')).join(''), css:`oklch(${(L*100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})` }; };
FX.WHITE=FX.ink(1,0,0);

/* ── mixing rules ──
   mix(space): how a partial coverage t blends the ink into what is under it (edges, AA, thin film).
     oklab  · straight line in OKLab — even perceived steps, no dark fringe
     oklch  · L and C linear, hue on the short arc; an achromatic end takes the other end's hue
              (CSS Color 4 "powerless hue"), so ink → white keeps its hue instead of graying
     linear · linear-light RGB — what optical blur does; mid-tones read light
     srgb   · gamma-encoded RGB — the browser default; shown for comparison (dark, dull midpoints)
   over(rule): ink laid over ink.
     multiply · transparent inks, product in linear light (subtractive, like real overprint)
     mix      · opaque ink, blended by the mix space above
     darken   · OKLab: keep the lower L, take the top ink's a/b */
const LA=[0,0,0], LB=[0,0,0], O=[0,0,0];
FX.mixInto=(px,ink,t,space)=>{ // px: Float32 [r,g,b] linear, mutated
  if(t<=0) return; if(t>=1){ px[0]=ink.lin[0]; px[1]=ink.lin[1]; px[2]=ink.lin[2]; return; }
  if(space==='linear'){ px[0]+=(ink.lin[0]-px[0])*t; px[1]+=(ink.lin[1]-px[1])*t; px[2]+=(ink.lin[2]-px[2])*t; return; }
  if(space==='srgb'){ for(let i=0;i<3;i++){ const a=enc(px[i])/255, b=enc(ink.lin[i])/255; px[i]=toLin(a+(b-a)*t); } return; }
  FX.lin2lab(px[0],px[1],px[2],LA);
  if(space==='oklch'){ const C1=Math.hypot(LA[1],LA[2]), C2=ink.C; let h1=Math.atan2(LA[2],LA[1]), h2=ink.h*Math.PI/180;
    if(C1<2e-3) h1=h2; if(C2<2e-3) h2=h1; let dh=h2-h1; if(dh>Math.PI)dh-=TAU; if(dh<-Math.PI)dh+=TAU;
    const L=LA[0]+(ink.L-LA[0])*t, C=C1+(C2-C1)*t, h=h1+dh*t; FX.lab2lin(L,C*Math.cos(h),C*Math.sin(h),O); }
  else FX.lab2lin(LA[0]+(ink.lab[0]-LA[0])*t, LA[1]+(ink.lab[1]-LA[1])*t, LA[2]+(ink.lab[2]-LA[2])*t, O);
  px[0]=O[0]; px[1]=O[1]; px[2]=O[2]; };
FX.overInto=(px,ink,t,rule,space)=>{ if(t<=0) return;
  if(rule==='multiply'){ px[0]*=1+(ink.lin[0]-1)*t; px[1]*=1+(ink.lin[1]-1)*t; px[2]*=1+(ink.lin[2]-1)*t; return; }
  if(rule==='darken'){ FX.lin2lab(px[0],px[1],px[2],LA); const L=Math.min(LA[0],ink.L); FX.lab2lin(LA[0]+(L-LA[0])*t, LA[1]+(ink.lab[1]-LA[1])*t, LA[2]+(ink.lab[2]-LA[2])*t, O); px[0]=O[0];px[1]=O[1];px[2]=O[2]; return; }
  FX.mixInto(px,ink,t,space); };
/* shift L (and pull toward a tint's a/b) in OKLab — used for paper tooth, mottle and thread shading */
FX.shadeInto=(px,dL,tint,tAmt)=>{ FX.lin2lab(px[0],px[1],px[2],LA); const a=tint?LA[1]+(tint.lab[1]-LA[1])*tAmt:LA[1], b=tint?LA[2]+(tint.lab[2]-LA[2])*tAmt:LA[2]; FX.lab2lin(clamp(LA[0]+dL,0,1),a,b,O); px[0]=O[0];px[1]=O[1];px[2]=O[2]; };

/* mix toward an ink whose L is offset by dL (thread shading, dye lot) — one conversion instead of mix-then-shade */
const TMP={L:0,C:0,h:0,lab:[0,0,0],lin:[0,0,0]};
FX.mixShaded=(px,ink,dL,t,space)=>{ const L=clamp(ink.L+dL,0,1); TMP.L=L; TMP.C=ink.C; TMP.h=ink.h; TMP.lab[0]=L; TMP.lab[1]=ink.lab[1]; TMP.lab[2]=ink.lab[2];
  FX.lab2lin(L,ink.lab[1],ink.lab[2],TMP.lin); TMP.lin[0]=clamp(TMP.lin[0],0,1); TMP.lin[1]=clamp(TMP.lin[1],0,1); TMP.lin[2]=clamp(TMP.lin[2],0,1); FX.mixInto(px,TMP,t,space); };

/* ── randomized edge mask ──
   Signed distance to a shape (CSS px, + inside), displaced by fbm so the edge wanders, then turned into coverage
   by a feather — either as tone (soft) or as speckle (binary, blue-noise thresholded: ink that breaks up rather than fades).
   "bite" removes clumped holes whose likelihood rises toward the edge (worn, torn, starved). */
FX.MASK_PARAMS=(d={})=>[
  {key:'mShape',label:'Shape',group:'mask',type:'select',options:['none','rect','ellipse','band','blob'],value:d.mShape||'rect',note:'the region the effect is allowed to occupy'},
  {key:'mInset',label:'Inset',group:'mask',type:'range',min:0,max:120,step:1,unit:'px',value:d.mInset??18,note:'distance from the plate edge to the mask edge'},
  {key:'mAmp',label:'Edge wander',group:'mask',type:'range',min:0,max:40,step:.5,unit:'px',value:d.mAmp??6,note:'how far noise pushes the edge in and out',limits:[[28,40,'above ~28 px the edge tears into islands']]},
  {key:'mScale',label:'Wander scale',group:'mask',type:'range',min:4,max:240,step:1,unit:'px',value:d.mScale??60,note:'wavelength of the wander; small = ragged, large = drifting'},
  {key:'mRough',label:'Roughness',group:'mask',type:'range',min:1,max:6,step:1,unit:'oct',value:d.mRough??4,note:'octaves of edge noise — adds fine teeth without moving the large shape'},
  {key:'mFeather',label:'Feather',group:'mask',type:'range',min:.5,max:60,step:.5,unit:'px',value:d.mFeather??6,note:'width over which coverage falls from 1 to 0'},
  {key:'mMode',label:'Feather as',group:'mask',type:'select',options:['speckle','tone'],value:d.mMode||'speckle',note:'speckle = binary marks thinning out; tone = partial coverage'},
  {key:'mBite',label:'Bite',group:'mask',type:'range',min:0,max:1,step:.01,value:d.mBite??.25,note:'clumped dropouts that grow more likely toward the edge'},
];
const MASKS=new Map();
FX.mask=(o,W,H,dpr,seed)=>{ const key=[o.mShape,o.mInset,o.mAmp,o.mScale,o.mRough,o.mFeather,o.mMode,o.mBite,W,H,dpr,seed].join('|'); const hit=MASKS.get(key); if(hit) return Float32Array.from(hit);
  const M=FX._mask(o,W,H,dpr,seed); MASKS.set(key,M); if(MASKS.size>24) MASKS.delete(MASKS.keys().next().value); return Float32Array.from(M); };
FX._mask=(o,W,H,dpr,seed)=>{ const M=new Float32Array(W*H); const sh=o.mShape||'none';
  if(sh==='none'){ M.fill(1); return M; }
  const w=W/dpr, h=H/dpr, ins=o.mInset, amp=o.mAmp, sc=o.mScale, oct=o.mRough|0, fe=Math.max(.5,o.mFeather), bite=o.mBite, s=seed*7+3;
  const cx=w/2, cy=h/2, rx=Math.max(1,w/2-ins), ry=Math.max(1,h/2-ins), rr=Math.min(rx,ry)*.05;
  for(let y=0;y<H;y++){ const v=y/dpr; for(let x=0;x<W;x++){ const u=x/dpr; let d;
    if(sh==='rect'){ const qx=Math.abs(u-cx)-(rx-rr), qy=Math.abs(v-cy)-(ry-rr); d=-(Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-rr); }
    else if(sh==='ellipse'){ const nx=(u-cx)/rx, ny=(v-cy)/ry, k=Math.hypot(nx,ny); d=(1-k)*Math.min(rx,ry); }
    else if(sh==='band'){ d=ry*.55-Math.abs(v-cy); }
    else { const a=Math.atan2(v-cy,u-cx), R=Math.min(rx,ry)*(.78+.22*FX.fbm(Math.cos(a)*1.3+5,Math.sin(a)*1.3+5,s+9,3)); d=R-Math.hypot((u-cx)*Math.min(rx,ry)/rx,(v-cy)*Math.min(rx,ry)/ry); }
    d+=amp*(FX.fbm(u/sc,v/sc,s,oct,.55)*2-1)*1.6;
    let m=clamp(d/fe,0,1);
    if(bite>0&&m>0){ const near=1-clamp(d/(fe*4+amp*2),0,1); const holes=FX.fbm(u/(sc*.22+2),v/(sc*.22+2),s+41,3); if(holes<bite*(.25+.75*near)*.62) m*=clamp((holes-bite*(.25+.75*near)*.62+.04)/.04,0,1); }
    if(o.mMode==='speckle'&&m>0&&m<1) m=FX.blue.at(x,y)<m?1:0; else m=m*m*(3-2*m);
    M[y*W+x]=m; } }
  return M; };

/* ── fast paths ──
   lut: one ink over a uniform ground, by coverage t (1025 steps) — the same mix rule, computed once per render.
   DotRaster: analytic coverage for small irregular discs (7 vertex radii, linear in angle), union by max. Canvas 2D
   fills of tens of thousands of contours in one path are slow (Skia), and a per-dot fill call is slower still. */
FX.lut=(ink,space,ground=FX.WHITE)=>{ const N=1024, T=new Float32Array((N+1)*3), px=[0,0,0]; for(let i=0;i<=N;i++){ px[0]=ground.lin[0];px[1]=ground.lin[1];px[2]=ground.lin[2]; FX.mixInto(px,ink,i/N,space); T[i*3]=px[0];T[i*3+1]=px[1];T[i*3+2]=px[2]; } return T; };
FX.lutAt=(T,t,out,k)=>{ const j=((t<=0?0:t>=1?1024:t*1024+.5)|0)*3; out[k]=T[j]; out[k+1]=T[j+1]; out[k+2]=T[j+2]; };
FX.DotRaster=(W,H)=>{ const cov=new Float32Array(W*H);
  return { cov, add(cx,cy,r,rad){ // device px; rad = 7 relative radii
    const R=r*1.6+1, x0=Math.max(0,Math.floor(cx-R)), x1=Math.min(W-1,Math.ceil(cx+R)), y0=Math.max(0,Math.floor(cy-R)), y1=Math.min(H-1,Math.ceil(cy+R));
    for(let y=y0;y<=y1;y++){ const dy=y+.5-cy; for(let x=x0;x<=x1;x++){ const dx=x+.5-cx, d=Math.hypot(dx,dy); let rr=r;
      if(rad){ let a=Math.atan2(dy,dx)/TAU*7; if(a<0)a+=7; const i=a|0, f=a-i; rr=r*(rad[i]+(rad[(i+1)%7]-rad[i])*f); }
      const c=rr-d+.5; if(c>0){ const v=c>1?1:c, j=y*W+x; if(v>cov[j]) cov[j]=v; } } } } }; };

/* ── canvas helpers ── */
FX.fit=(canvas,scale=1)=>{ const r=canvas.getBoundingClientRect(); const dpr=Math.min(2,window.devicePixelRatio||1)*scale;
  const W=Math.max(2,Math.round(r.width*dpr)), H=Math.max(2,Math.round(r.height*dpr)); if(canvas.width!==W||canvas.height!==H){ canvas.width=W; canvas.height=H; } return {W,H,dpr}; };
/* a coverage layer rasterized by Canvas 2D (AA for free), read back as Float32 0..1 */
FX.coverCanvas=(W,H)=>{ const c=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(W,H):Object.assign(document.createElement('canvas'),{width:W,height:H}); const x=c.getContext('2d',{willReadFrequently:true}); x.fillStyle='#000'; x.fillRect(0,0,W,H); x.fillStyle='#fff'; x.strokeStyle='#fff'; return {c,x}; };
FX.readCover=(cc,W,H)=>{ const d=cc.x.getImageData(0,0,W,H).data, out=new Float32Array(W*H); for(let i=0,j=0;i<out.length;i++,j+=4) out[i]=d[j]/255; return out; };
/* write a Float32 linear-RGB buffer (3 per px) to an ImageData */
FX.toImage=(ctx,lin,W,H)=>{ const img=ctx.createImageData(W,H), d=img.data; for(let i=0,j=0,k=0;i<W*H;i++,j+=4,k+=3){ d[j]=enc(lin[k]); d[j+1]=enc(lin[k+1]); d[j+2]=enc(lin[k+2]); d[j+3]=255; } ctx.putImageData(img,0,0); };
FX.grayImage=(ctx,f,W,H,invert=true)=>{ const img=ctx.createImageData(W,H), d=img.data; for(let i=0,j=0;i<W*H;i++,j+=4){ const v=Math.round(255*clamp(invert?1-f[i]:f[i],0,1)); d[j]=d[j+1]=d[j+2]=v; d[j+3]=255; } ctx.putImageData(img,0,0); };
FX.ground=(W,H,ink)=>{ const b=new Float32Array(W*H*3); for(let k=0;k<b.length;k+=3){ b[k]=ink.lin[0]; b[k+1]=ink.lin[1]; b[k+2]=ink.lin[2]; } return b; };
FX.inkOf=(o,p)=>FX.ink(o[p+'L'],o[p+'C'],o[p+'h']);
FX.INK_PARAMS=(p,label,L,C,h)=>[
  {key:p+'L',label:label+' · L',group:'color',type:'range',min:0,max:1,step:.005,value:L,ink:p,note:'OKLCH lightness (0 black … 1 white)'},
  {key:p+'C',label:label+' · C',group:'color',type:'range',min:0,max:.37,step:.002,value:C,ink:p,note:'OKLCH chroma; reduced at constant L/h if it leaves sRGB',limits:[[.26,.37,'most hues leave sRGB above ~.26 and get chroma-reduced']]},
  {key:p+'h',label:label+' · h',group:'color',type:'range',min:0,max:360,step:.5,unit:'°',value:h,ink:p,note:'OKLCH hue angle'}];
FX.MIX_PARAM=(v='oklab')=>({key:'mix',label:'Mix space',group:'mixing',type:'select',options:['oklab','oklch','linear','srgb'],value:v,note:'how partial coverage (edges, AA, thin ink) blends ink into what is under it'});
FX.EASE_PARAM=(key,label,v,note)=>({key,label,group:'dropoff',type:'ease',value:v,note});
FX.SEED_PARAM=(v)=>({key:'seed',label:'Seed',group:'seed',type:'range',min:1,max:999,step:1,value:v,note:'every random draw in the effect hangs off this one number'});
})(window);
