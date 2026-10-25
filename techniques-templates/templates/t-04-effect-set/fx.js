/* T-04 · Effect set · FX core · ø co. Techniques & Templates
   Shared by every effect in a set: seeded noise, a blue-noise rank tile, ease curves,
   OKLab / OKLCH color, a randomized edge mask, and a per-pixel compositor that mixes
   coverage into the ground under an explicit color rule.
   Units: every length a set exposes is in CSS px; effects render at device px (dpr ≤ 2),
   so density means "marks per CSS px²" on any screen — a density dial changes the COUNT
   of marks, never the zoom of a tile.
   OKLab: Björn Ottosson, "A perceptual color space for image processing" (2020),
   https://bottosson.github.io/posts/oklab/ — matrices below are that post's, verbatim.
   OKLCH as defined in CSS Color 4 (https://www.w3.org/TR/css-color-4/#ok-lab).
   v2 · material model: every effect is ink on a STOCK. A stock is a height field (paper tooth, or woven thread)
   lit by ONE sheet light (FX.LIGHT). The same height field decides where ink lands, where it starves, where it
   wicks, and how the relief catches the light. Ink is a film: Beer–Lambert absorption in linear light.
   Worker-safe: no DOM in anything an effect calls. */
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

/* gradient (Perlin) noise, 0..1 — no grid-aligned lumps, unlike value noise; used where a surface is LIT (paper tooth),
   since lighting differentiates the field and value noise's flat cell centers read as worms and plateaus */
const gnoise=FX.gnoise=(x,y,s)=>{ const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi, u=xf*xf*xf*(xf*(xf*6-15)+10), v=yf*yf*yf*(yf*(yf*6-15)+10);
  const g=(ix,iy,dx,dy)=>{ const a=hash(ix,iy,s)*TAU; return Math.cos(a)*dx+Math.sin(a)*dy; };
  const n00=g(xi,yi,xf,yf), n10=g(xi+1,yi,xf-1,yf), n01=g(xi,yi+1,xf,yf-1), n11=g(xi+1,yi+1,xf-1,yf-1);
  const nx0=n00+(n10-n00)*u, nx1=n01+(n11-n01)*u; return .5+(nx0+(nx1-nx0)*v)*.7071; };
FX.gfbm=(x,y,s,oct=3,pers=.5,lac=2.03)=>{ let v=0,amp=1,f=1,n=0; for(let i=0;i<oct;i++){ const c=Math.cos(i*.9), sn=Math.sin(i*.9); v+=amp*gnoise((x*c-y*sn)*f,(x*sn+y*c)*f,s+i*17); n+=amp; f*=lac; amp*=pers; } return v/n; };
/* fine film-splitting / grain noise sampled in CSS px (feature ≥ `cell` CSS px), so speckle keeps its physical size on any
   screen and in macro usages instead of being one device pixel wide */
FX.grain=(u,v,s,cell=.6,dpr=2)=>{ const c=Math.max(cell,1.3/dpr), c2=Math.max(c*.6,1.3/dpr); return .62*gnoise(u/c,v/c,s)+.38*gnoise(u/c2+31.7,v/c2-12.3,s+5); };

/* signed distance to a coverage clip (device px, + inside), from an exact squared Euclidean distance transform
   (Felzenszwalb & Huttenlocher 2012) on both sides of the .5 contour, refined by the AA coverage (sub-pixel edge). */
FX.sdf=(clip,W,H)=>{ const INF=1e20, f=new Float64Array(Math.max(W,H)), d=new Float64Array(Math.max(W,H)), z=new Float64Array(Math.max(W,H)+1), v=new Int32Array(Math.max(W,H));
  const dt1=(n)=>{ let k=0; v[0]=0; z[0]=-INF; z[1]=INF; for(let q=1;q<n;q++){ let s_; while(true){ const r=v[k]; s_=((f[q]+q*q)-(f[r]+r*r))/(2*q-2*r); if(s_<=z[k]&&k>0){ k--; continue; } if(s_<=z[k]){ k--; if(k<0){k=0; break;} continue; } break; } k++; v[k]=q; z[k]=s_; z[k+1]=INF; }
    k=0; for(let q=0;q<n;q++){ while(z[k+1]<q) k++; const r=v[k]; d[q]=(q-r)*(q-r)+f[r]; } };
  const edt=(inside)=>{ const g=new Float64Array(W*H); for(let i=0;i<W*H;i++) g[i]=(clip[i]>=.5)===inside?0:INF;
    for(let x=0;x<W;x++){ for(let y=0;y<H;y++) f[y]=g[y*W+x]; dt1(H); for(let y=0;y<H;y++) g[y*W+x]=d[y]; }
    for(let y=0;y<H;y++){ for(let x=0;x<W;x++) f[x]=g[y*W+x]; dt1(W); for(let x=0;x<W;x++) g[y*W+x]=d[x]; } return g; };
  const din=edt(false), dout=edt(true), out=new Float32Array(W*H);
  for(let i=0;i<W*H;i++){ const c=clip[i]; out[i]=c>0&&c<1?c-.5:c>=.5?Math.sqrt(din[i])-.5:.5-Math.sqrt(dout[i]); }
  return out; };

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
     film   · Beer–Lambert: the ink is a transparent film; transmittance = ink^thickness per channel, in linear
              light, multiplied into whatever is under it. Thin = pale, thick = deep; overprint is automatic.
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
  if(t<=0) return;
  if(space==='film'){ px[0]*=Math.pow(ink.lin[0]<1e-4?1e-4:ink.lin[0],t); px[1]*=Math.pow(ink.lin[1]<1e-4?1e-4:ink.lin[1],t); px[2]*=Math.pow(ink.lin[2]<1e-4?1e-4:ink.lin[2],t); return; } if(t>=1){ px[0]=ink.lin[0]; px[1]=ink.lin[1]; px[2]=ink.lin[2]; return; }
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
FX.MASK_PARAMS=(d={},opt={})=>[
  {key:'mShape',label:'Shape',group:'mask',type:'select',options:['none','rect','ellipse','band','blob','type','image'],value:d.mShape||'rect',note:'the region the effect may occupy — type = your words as the mask; image = upload a PNG/SVG (alpha, or dark = ink)'},
  {key:'mText',label:'Mask text',group:'mask',type:'text',value:d.mText||'Counted',maxlength:60,when:{mShape:['type']},note:'set in Archivo 800, fit to the plate'},
  {key:'mInset',label:'Inset',group:'mask',type:'range',min:0,max:120,step:1,unit:'px',value:d.mInset??18,note:'distance from the plate edge to the mask edge'},
  {key:'mAmp',label:'Edge wander',group:'mask',type:'range',min:0,max:40,step:.5,unit:'px',value:d.mAmp??6,note:'how far noise pushes the edge in and out',limits:[[28,40,'above ~28 px the edge tears into islands']]},
  {key:'mScale',label:'Wander scale',group:'mask',type:'range',min:4,max:240,step:1,unit:'px',value:d.mScale??60,note:'wavelength of the wander; small = ragged, large = drifting'},
  {key:'mRough',label:'Roughness',group:'mask',type:'range',min:1,max:6,step:1,unit:'oct',value:d.mRough??4,note:'octaves of edge noise — adds fine teeth without moving the large shape'},
  {key:'mFeather',label:'Feather',group:'mask',type:'range',min:.5,max:60,step:.5,unit:'px',value:d.mFeather??6,note:'width over which coverage falls from 1 to 0'},
  ...(opt.mode===false?[]:[{key:'mMode',label:'Feather as',group:'mask',type:'select',options:['speckle','tone'],value:d.mMode||'speckle',note:'speckle = binary marks thinning out; tone = partial coverage'}]),
  ...(opt.extra||[]),
  {key:'mBite',label:'Bite',group:'mask',type:'range',min:0,max:1,step:.01,value:d.mBite??.25,note:'clumped dropouts that grow more likely toward the edge'},
];
const MASKS=new Map();
FX.mask=(o,W,H,dpr,seed)=>Float32Array.from(FX.maskField(o,W,H,dpr,seed).m);
/* maskField → { m: coverage 0..1, d: wandered signed distance in CSS px (+ inside), or null when shape = none } */
FX.maskField=(o,W,H,dpr,seed)=>{ const key=[o.mShape,o.mInset,o.mAmp,o.mScale,o.mRough,o.mFeather,o.mMode,o.mBite,W,H,dpr,seed].join('|'); const hit=MASKS.get(key); if(hit) return hit;
  const R=FX._mask(o,W,H,dpr,seed); MASKS.set(key,R); if(MASKS.size>16) MASKS.delete(MASKS.keys().next().value); return R; };
FX._mask=(o,W,H,dpr,seed)=>{ const M=new Float32Array(W*H); const sh=o.mShape||'none';
  if(sh==='none'||sh==='type'||sh==='image'){ M.fill(1); return {m:M,d:null}; } // type / image arrive as a main-thread clip (x.clips.umask)
  const D=new Float32Array(W*H);
  const w=W/dpr, h=H/dpr, ins=o.mInset, amp=o.mAmp, sc=o.mScale, oct=o.mRough|0, fe=Math.max(.5,o.mFeather), bite=o.mBite, s=seed*7+3;
  const cx=w/2, cy=h/2, rx=Math.max(1,w/2-ins), ry=Math.max(1,h/2-ins), rr=Math.min(rx,ry)*.05;
  for(let y=0;y<H;y++){ const v=y/dpr; for(let x=0;x<W;x++){ const u=x/dpr; let d;
    if(sh==='rect'){ const qx=Math.abs(u-cx)-(rx-rr), qy=Math.abs(v-cy)-(ry-rr); d=-(Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-rr); }
    else if(sh==='ellipse'){ const nx=(u-cx)/rx, ny=(v-cy)/ry, k=Math.hypot(nx,ny); d=(1-k)*Math.min(rx,ry); }
    else if(sh==='band'){ d=ry*.55-Math.abs(v-cy); }
    else { const a=Math.atan2(v-cy,u-cx), R=Math.min(rx,ry)*(.78+.22*FX.fbm(Math.cos(a)*1.3+5,Math.sin(a)*1.3+5,s+9,3)); d=R-Math.hypot((u-cx)*Math.min(rx,ry)/rx,(v-cy)*Math.min(rx,ry)/ry); }
    d+=amp*(FX.fbm(u/sc,v/sc,s,oct,.55)*2-1)*1.6; D[y*W+x]=d;
    let m=clamp(d/fe,0,1);
    if(bite>0&&m>0){ const near=1-clamp(d/(fe*4+amp*2),0,1); const holes=FX.fbm(u/(sc*.22+2),v/(sc*.22+2),s+41,3); if(holes<bite*(.25+.75*near)*.62) m*=clamp((holes-bite*(.25+.75*near)*.62+.04)/.04,0,1); }
    if(o.mMode==='speckle'&&m>0&&m<1){ const n=FX.grain(u,v,s+77,.7,dpr); m=clamp((m-n)*7+.5,0,1); } else m=m*m*(3-2*m); // speckle: binary marks in CSS px, AA-edged
    M[y*W+x]=m; } }
  return {m:M,d:D}; };

/* ── fast paths ──
   lut: one ink over a uniform ground, by coverage t (1025 steps) — the same mix rule, computed once per render.
   DotRaster: analytic coverage for small irregular discs (7 vertex radii, linear in angle), union by max. Canvas 2D
   fills of tens of thousands of contours in one path are slow (Skia), and a per-dot fill call is slower still. */
FX.lut=(ink,space,ground=FX.WHITE)=>{ const N=1024, T=new Float32Array((N+1)*3), px=[0,0,0]; for(let i=0;i<=N;i++){ px[0]=ground.lin[0];px[1]=ground.lin[1];px[2]=ground.lin[2]; FX.mixInto(px,ink,i/N,space); T[i*3]=px[0];T[i*3+1]=px[1];T[i*3+2]=px[2]; } return T; };
FX.lutAt=(T,t,out,k)=>{ const j=((t<=0?0:t>=1?1024:t*1024+.5)|0)*3; out[k]=T[j]; out[k+1]=T[j+1]; out[k+2]=T[j+2]; };
FX.DotRaster=(W,H)=>{ const cov=new Float32Array(W*H);
  return { cov, add(cx,cy,r,rad,soft=1,pk=1){ // device px; rad = 7 relative radii; soft = rim width (pressure falls off); pk = peak
    const R=r*1.6+soft+1, x0=Math.max(0,Math.floor(cx-R)), x1=Math.min(W-1,Math.ceil(cx+R)), y0=Math.max(0,Math.floor(cy-R)), y1=Math.min(H-1,Math.ceil(cy+R));
    for(let y=y0;y<=y1;y++){ const dy=y+.5-cy; for(let x=x0;x<=x1;x++){ const dx=x+.5-cx, d=Math.hypot(dx,dy); let rr=r;
      if(rad){ let a=Math.atan2(dy,dx)/TAU*7; if(a<0)a+=7; const i=a|0, f=a-i; rr=r*(rad[i]+(rad[(i+1)%7]-rad[i])*f); }
      const c=(rr-d)/soft+.5; if(c>0){ const v=(c>1?1:c)*pk, j=y*W+x; if(v>cov[j]) cov[j]=v; } } } } }; };

/* signed-distance dot raster (device px): sd = max over dots of (radius(θ) − distance), pr = that dot's pressure.
   Coverage is decided later, after the stock has displaced the edge — so every mark keeps a 1-device-px AA edge. */
FX.DotSD=(W,H)=>{ const sd=new Float32Array(W*H).fill(-9), pr=new Float32Array(W*H);
  return { sd, pr, add(cx,cy,r,rad,pk,reach=3){ const R=r*1.6+reach, x0=Math.max(0,Math.floor(cx-R)), x1=Math.min(W-1,Math.ceil(cx+R)), y0=Math.max(0,Math.floor(cy-R)), y1=Math.min(H-1,Math.ceil(cy+R));
    for(let y=y0;y<=y1;y++){ const dy=y+.5-cy; for(let x=x0;x<=x1;x++){ const dx=x+.5-cx, d=Math.sqrt(dx*dx+dy*dy); let rr=r;
      if(rad){ let a=Math.atan2(dy,dx)/TAU*7; if(a<0)a+=7; const i=a|0, f=a-i; rr=r*(rad[i]+(rad[(i+1)%7]-rad[i])*f); }
      const v=rr-d, j=y*W+x; if(v>sd[j]){ sd[j]=v; pr[j]=pk; } } } } }; };

/* capsule raster: AA line segments (fibers, hairs), union by max, device px */
FX.LineRaster=(W,H)=>{ const cov=new Float32Array(W*H);
  return { cov, add(x0,y0,x1,y1,w,pk=1){ const r=w/2, minx=Math.max(0,Math.floor(Math.min(x0,x1)-r-1)), maxx=Math.min(W-1,Math.ceil(Math.max(x0,x1)+r+1)), miny=Math.max(0,Math.floor(Math.min(y0,y1)-r-1)), maxy=Math.min(H-1,Math.ceil(Math.max(y0,y1)+r+1));
    const dx=x1-x0, dy=y1-y0, L2=dx*dx+dy*dy||1e-6;
    for(let y=miny;y<=maxy;y++) for(let x=minx;x<=maxx;x++){ const px=x+.5-x0, py=y+.5-y0; let t=(px*dx+py*dy)/L2; t=t<0?0:t>1?1:t; const ex=px-dx*t, ey=py-dy*t, d=Math.sqrt(ex*ex+ey*ey); const c=r-d+.5; if(c>0){ const v=(c>1?1:c)*pk, j=y*W+x; if(v>cov[j]) cov[j]=v; } } },
    curve(x0,y0,cx,cy,x1,y1,w,pk){ const n=Math.max(2,Math.ceil(Math.hypot(x1-x0,y1-y0)/3)); let px=x0,py=y0; for(let i=1;i<=n;i++){ const t=i/n, a=(1-t)*(1-t), b=2*(1-t)*t, c=t*t, X=a*x0+b*cx+c*x1, Y=a*y0+b*cy+c*y1; this.add(px,py,X,Y,w,pk); px=X; py=Y; } } }; };

/* ── the sheet light ── one light for every plate, usage and shadow. az = direction the light comes FROM
   (screen degrees, 0 = from the right, 90 = from below, 225 = from upper left); el = elevation above the sheet. */
FX.LIGHT={az:225,el:34};
FX.lightVec=(L=FX.LIGHT)=>{ const a=L.az*Math.PI/180, e=L.el*Math.PI/180; return [Math.cos(a)*Math.cos(e),Math.sin(a)*Math.cos(e),Math.sin(e)]; };
/* Lambert shading of a height field. h ∈ 0..1 scaled to `depth` CSS px. Returns factor, 1 = a flat surface. */
/* skylight under a raking sun: the room fills the shadow side, so walls facing away never go to black and the lit side
   rolls off instead of blowing out. 0 at ≥ 32° (studio plates unchanged), rising to ~.28 as the light rakes to the sheet. */
FX.sky=(L=FX.LIGHT)=>.28*Math.min(1,Math.max(0,(32-L.el)/22));
FX.shade=(h,W,H,dpr,depth,L)=>{ const [lx,ly,lz]=FX.lightVec(L), out=new Float32Array(W*H), k=depth*dpr*.5, sky=FX.sky(L||FX.LIGHT);
  for(let y=0;y<H;y++){ const r=y*W, up=(y>0?y-1:y)*W, dn=(y<H-1?y+1:y)*W; for(let x=0;x<W;x++){ const sx=(h[r+(x<W-1?x+1:x)]-h[r+(x>0?x-1:x)])*k, sy=(h[dn+x]-h[up+x])*k;
    const n=1/Math.sqrt(sx*sx+sy*sy+1), d=(-sx*lx-sy*ly+lz)*n, f=((d>0?d:0)+sky)/(lz+sky); out[r+x]=f>1.3?1.3+(f-1.3)/(1+(f-1.3)*.7):f; } }
  return out; };
/* height-field cast shadow: march toward the light; a sample higher than the ray occludes. Returns lit factor 0..1. */
FX.hshadow=(h,W,H,dpr,depth,L,reachPx,soft=.5)=>{ const [lx,ly,lz]=FX.lightVec(L), out=new Float32Array(W*H).fill(1), sky=FX.sky(L||FX.LIGHT), amb=lz/(lz+sky); const pl=Math.hypot(lx,ly)||1, ux=lx/pl, uy=ly/pl, tanE=lz/pl;
  const steps=Math.max(2,Math.round(reachPx*dpr/1.5)), st=reachPx*dpr/steps, hd=depth*dpr;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=y*W+x, h0=h[i]*hd; let occ=0;
    for(let k=1;k<=steps;k++){ const X=(x+ux*st*k)|0, Y=(y+uy*st*k)|0; if(X<0||Y<0||X>=W||Y>=H) break; const need=h0+st*k*tanE, have=h[Y*W+X]*hd; if(have>need){ const o=(have-need)/(soft*hd+1e-3); if(o>occ) occ=o; } }
    out[i]=1-(occ>1?1:occ)*amb; }
  return out; };
/* normals of a height field given in CSS px (neighbors are 1 device px apart) */
FX.normals=(hpx,W,H,dpr)=>{ const nx=new Float32Array(W*H), ny=new Float32Array(W*H), nz=new Float32Array(W*H), k=dpr*.5;
  for(let y=0;y<H;y++){ const r=y*W, up=(y>0?y-1:y)*W, dn=(y<H-1?y+1:y)*W; for(let x=0;x<W;x++){ const sx=(hpx[r+(x<W-1?x+1:x)]-hpx[r+(x>0?x-1:x)])*k, sy=(hpx[dn+x]-hpx[up+x])*k, n=1/Math.sqrt(sx*sx+sy*sy+1), i=r+x; nx[i]=-sx*n; ny[i]=-sy*n; nz[i]=n; } }
  return {nx,ny,nz}; };
/* half vector for a viewer straight above the sheet */
FX.halfVec=(L=FX.LIGHT)=>{ const [lx,ly,lz]=FX.lightVec(L), hx=lx, hy=ly, hz=lz+1, n=Math.hypot(hx,hy,hz); return [hx/n,hy/n,hz/n]; };

/* separable box blur ×3 ≈ gaussian, radius in device px */
FX.blur=(src,W,H,r)=>{ r=Math.max(0,Math.round(r)); if(!r) return Float32Array.from(src); let a=Float32Array.from(src), b=new Float32Array(W*H);
  const pass=(s,d,horiz)=>{ const n=horiz?W:H, m=horiz?H:W, inv=1/(2*r+1); for(let j=0;j<m;j++){ let acc=0; const at=i=>{ i=i<0?0:i>=n?n-1:i; return horiz?s[j*W+i]:s[i*W+j]; };
    for(let i=-r;i<=r;i++) acc+=at(i); for(let i=0;i<n;i++){ if(horiz) d[j*W+i]=acc*inv; else d[i*W+j]=acc*inv; acc+=at(i+r+1)-at(i-r); } } };
  for(let k=0;k<3;k++){ pass(a,b,true); pass(b,a,false); } return a; };
/* object on the page — no drop shadow. A sheet lying flat on a surface only occludes a hairline at its edge: a crisp
   contact line on the side away from the light (offset by the sheet's thickness at the light's slope) plus a very tight
   ambient occlusion right at the edge. Only something truly LIFTED (lift ≳ 1.5, a peeled flap) throws a real cast
   shadow, and its penumbra stays proportional to the height, so it stays sharp near the object. Returns darkening 0..1. */
FX.castShadow=(alpha,W,H,dpr,L,lift=1)=>{ const [lx,ly,lz]=FX.lightVec(L), pl=Math.hypot(lx,ly)||1, cot=Math.min(4,pl/lz);
  const off=(px)=>{ const o=new Float32Array(W*H), ox=Math.round(-lx/pl*px*cot*dpr), oy=Math.round(-ly/pl*px*cot*dpr); for(let y=0;y<H;y++){ const sy=y-oy; if(sy<0||sy>=H) continue; for(let x=0;x<W;x++){ const sx=x-ox; if(sx>=0&&sx<W) o[y*W+x]=alpha[sy*W+sx]; } } return o; };
  const t=Math.min(lift,1), c=FX.blur(off(.28*t+.1),W,H,Math.max(1,Math.round(.35*dpr))), a=FX.blur(alpha,W,H,Math.max(1,Math.round(.9*dpr)));
  const up=lift>1.5?Math.min(1,(lift-1.5)/1.5):0, sh=up>0?FX.blur(off(lift*.9),W,H,Math.max(1,Math.round(lift*.3*dpr))):null, out=new Float32Array(W*H);
  for(let i=0;i<out.length;i++){ const v=.2*c[i]+.045*a[i]+(sh?.14*up*sh[i]:0); out[i]=v*(1-alpha[i]); } return out; };
/* film LUT: per-channel transmittance ink^τ for τ ∈ [0,2], 1025 steps */
FX.filmLUT=(ink)=>{ const N=1024, T=new Float32Array((N+1)*3), l=ink.lin.map(v=>Math.log(v<1e-4?1e-4:v)); for(let i=0;i<=N;i++){ const t=i/N*2; T[i*3]=Math.exp(l[0]*t); T[i*3+1]=Math.exp(l[1]*t); T[i*3+2]=Math.exp(l[2]*t); } return T; };

/* buffers → RGBA for display / export: image (sRGB encode), ink plate (film positive), stock (normalized height), mask */
FX.toRGBA=(R,view,W,H)=>{ const out=new Uint8ClampedArray(W*H*4);
  if(view==='image'||!view){ const l=R.lin; for(let i=0,j=0,k=0;i<W*H;i++,j+=4,k+=3){ out[j]=FX.enc(l[k]); out[j+1]=FX.enc(l[k+1]); out[j+2]=FX.enc(l[k+2]); out[j+3]=255; } return out; }
  const f=view==='ink'?R.ink:view==='stock'?R.stock:R.mask;
  let mn=0, mx=1; if(view==='stock'&&f){ mn=1e9; mx=-1e9; for(let i=0;i<f.length;i++){ const v=f[i]; if(v<mn) mn=v; if(v>mx) mx=v; } if(mx-mn<1e-6){ mn=0; mx=1; } }
  for(let i=0,j=0;i<W*H;i++,j+=4){ let v=f?f[i]:0, g;
    if(view==='stock') g=f?Math.round(255*(v-mn)/(mx-mn)):128;          // height map: low = black, high = white
    else { if(v>1) v=1; if(v<0) v=0; g=Math.round(255*(1-v)); }        // ink plate / mask: ink = black, as a film positive
    out[j]=out[j+1]=out[j+2]=g; out[j+3]=255; } return out; };

/* ── canvas helpers ── */
FX.fit=(canvas,scale=1)=>{ const r=canvas.getBoundingClientRect(); const dpr=Math.min(2,(typeof devicePixelRatio!=='undefined'?devicePixelRatio:1)||1)*scale;
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
FX.MIX_PARAM=(v='film',opts=['film','oklab','oklch','linear','srgb'])=>({key:'mix',label:'Color rule',group:'mixing',type:'select',options:opts,value:v,note:'film = Beer–Lambert absorption in linear light (physical); oklab / oklch / linear / srgb = coverage mixes, for comparison'});
FX.EASE_PARAM=(key,label,v,note)=>({key,label,group:'dropoff',type:'ease',value:v,note});
FX.SEED_PARAM=(v)=>({key:'seed',label:'Seed',group:'seed',type:'range',min:1,max:999,step:1,value:v,note:'every random draw in the effect hangs off this one number'});

/* ── d additions ── */
/* iso-contours of a field sampled at device px (marching squares, saddles split by the cell mean), chained into
   polylines: [[x,y],…] in device px (pixel centers at +.5); a closed contour repeats its first point at the end.
   Used to lay stitches, rules or beads ALONG a die edge with real arc length (a raster SDF has none). */
FX.contours=(f,W,H,lev=.5)=>{ const gw=W-1, gh=H-1, at=(i,j)=>f[j*W+i]-lev, pt=new Map(), adj=new Map();
  const hid=(i,j)=>(j*W+i)*2, vid=(i,j)=>(j*W+i)*2+1;
  const P=id=>{ if(pt.has(id)) return; const k=id>>1, i=k%W, j=(k/W)|0; if(id&1){ const a=at(i,j), b=at(i,j+1); pt.set(id,[i+.5,j+a/(a-b)+.5]); } else { const a=at(i,j), b=at(i+1,j); pt.set(id,[i+a/(a-b)+.5,j+.5]); } };
  const link=(p,q)=>{ P(p); P(q); let A=adj.get(p); if(!A) adj.set(p,A=[]); A.push(q); let B=adj.get(q); if(!B) adj.set(q,B=[]); B.push(p); };
  for(let j=0;j<gh;j++) for(let i=0;i<gw;i++){ const v0=at(i,j)>0, v1=at(i+1,j)>0, v2=at(i+1,j+1)>0, v3=at(i,j+1)>0; if(v0===v1&&v1===v2&&v2===v3) continue;
    const T=hid(i,j), Rr=vid(i+1,j), B=hid(i,j+1), L=vid(i,j), e=[]; if(v0!==v1) e.push(T); if(v1!==v2) e.push(Rr); if(v3!==v2) e.push(B); if(v0!==v3) e.push(L);
    if(e.length===2) link(e[0],e[1]);
    else { const c=(at(i,j)+at(i+1,j)+at(i+1,j+1)+at(i,j+1))/4>0; if(c===v0){ link(T,Rr); link(B,L); } else { link(T,L); link(Rr,B); } } }
  const seen=new Set(), out=[];
  for(const p0 of adj.keys()){ if(seen.has(p0)) continue; const walk=(start,first)=>{ const path=[]; let prev=start, cur=first; while(cur!==undefined&&!seen.has(cur)){ seen.add(cur); path.push(pt.get(cur)); const nb=adj.get(cur)||[]; const nx=nb.find(q=>q!==prev&&!seen.has(q)); prev=cur; cur=nx; } return path; };
    seen.add(p0); const nb=adj.get(p0)||[], fw=walk(p0,nb[0]), bw=nb[1]!==undefined?walk(p0,nb[1]):[];
    const line=bw.reverse().concat([pt.get(p0)],fw); const closed=nb.length===2&&line.length>2&&Math.hypot(line[0][0]-line[line.length-1][0],line[0][1]-line[line.length-1][1])<1.5; if(closed) line.push(line[0]); out.push(line); }
  return out; };
})(typeof window!=='undefined'?window:self);
