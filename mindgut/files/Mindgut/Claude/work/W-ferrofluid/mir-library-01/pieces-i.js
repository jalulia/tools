/* pieces-i.js · L-41 … L-46 (r11): spheres, devices, and the field as an instrument.
   Hardware is drawn in the patent line language: one hairline weight for outlines, interior edges at half strength, curvature told
   by dot density (never shadow), numbered callouts in even numerals with a leader ending in a dot. Screens are drawn at their true
   pixel grid: the image is rasterized to the panel's own pixels, and each lit pixel is one dot whose area is its brightness.
   Every piece composes a score from its own geometry; the marks answer it through M.music.env and M.music.bands.
   Helpers are prefixed i_. */
(function(){
'use strict';
const M=window.MIR, TAU=Math.PI*2, E=M.ease, cl=M.clamp01, lerp=M.lerp, DEG=Math.PI/180;

/* ── shared helpers ── */
const i_q=v=>Math.round(v/4)*4;
const i_dpr=()=>Math.min(3,window.devicePixelRatio||1);
const i_DK=(w,h)=>w+'x'+h+'@'+i_dpr();
const i_RGB=new Map();
function i_rgb(c){ let v=i_RGB.get(c); if(v) return v; const s=c.replace('#',''); v=[0,2,4].map(i=>parseInt(s.slice(i,i+2),16)); i_RGB.set(c,v); return v; }
const i_MX=new Map();
function i_mix(a,b,t){ t=Math.round(t*64)/64; const k=a+b+t; let v=i_MX.get(k); if(v) return v; const A=i_rgb(a), B=i_rgb(b); v='#'+A.map((x,i)=>Math.max(0,Math.min(255,Math.round(x+(B[i]-x)*t))).toString(16).padStart(2,'0')).join(''); i_MX.set(k,v); return v; }
const i_SL={}; function i_slot(name,key,make){ const s=i_SL[name]; if(s&&s.key===key) return s.v; const v=make(); i_SL[name]={key,v}; return v; }
function i_off(w,h){ const cv=document.createElement('canvas'); return {cv,g:M.canvas(cv,w,h)}; }
function i_blit(g,cv){ g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(cv,0,0); g.restore(); }
const i_memo=f=>{ const m=new Map(); return w=>{ const k=w+'@'+i_dpr(); let v=m.get(k); if(!v){ if(m.size>8) m.clear(); v=f(w); m.set(k,v); } return v; }; };
let i_MC=null; const i_ctx=()=>{ if(!i_MC){ i_MC=document.createElement('canvas').getContext('2d'); i_MC.dpr=1; } return i_MC; };
function i_tw(s,o){ const g=i_ctx(), size=o.size||11; g.font=`${o.weight||400} ${size}px ${M.FONT[o.font||'display']}`; const str=o.upper?String(s).toUpperCase():String(s), tr=(o.track||0)*size;
  if('letterSpacing' in g){ g.letterSpacing=tr+'px'; const w=g.measureText(str).width-tr; g.letterSpacing='0px'; return w; } return g.measureText(str).width+tr*(str.length-1); }
const i_MONO={font:'mono',weight:500,track:.14,upper:true};
const i_lab=(g,s,x,y,c,size=9.5,o={})=>M.text(g,s,x,y,Object.assign({},i_MONO,{size,color:c},o));
const i_lw=(s,size=9.5,o={})=>i_tw(s,Object.assign({},i_MONO,{size},o));
const i_trk=s=>s>=40?-.04:s>=28?-.03:s>=18?-.016:-.004;
const i_dispO=size=>({font:'display',size,weight:300,track:i_trk(size)});
function i_wrap(str,maxW,o){ const out=[]; let line=''; for(const wd of String(str).split(/\s+/)){ const t=line?line+' '+wd:wd; if(line&&i_tw(t,o)>maxW){ out.push(line); line=wd; } else line=t; } if(line) out.push(line); return out; }
const i_ROOT={font:'mono',size:9,weight:400,track:.02};
function i_root(g,lines,x,y,c){ lines.forEach((l,i)=>M.text(g,l,x,y+i*14,Object.assign({color:c},i_ROOT))); }
/* the title block, as in the other plates: id row, display title, one dek line */
function i_T(w,sub,subMax,phW){ const ph=w<(phW||640), pad=ph?16:(w<760?24:32), inner=w-2*pad, ts=ph?30:40, tb=ph?64:76, ss=ph?14:15, slh=ph?19:20;
  const sl=i_wrap(sub,Math.min(subMax||620,inner),i_dispO(ss)); return {ph,pad,inner,ts,tb,ss,slh,sub:sl,top:i_q(tb+(ph?30:34)+(sl.length-1)*slh+(ph?36:44))}; }
function i_title(g,T,left,right,title,ink,soft){ const y=T.ph?24:28, lw=i_lab(g,left,T.pad,y,ink,T.ph?9.5:10);
  if(right&&T.pad+lw+32+i_lw(right)<T.pad+T.inner) i_lab(g,right,T.pad+T.inner,y,soft,9.5,{align:'right'});
  M.text(g,title,T.pad-1,T.tb,Object.assign(i_dispO(T.ts),{color:ink})); T.sub.forEach((l,i)=>M.text(g,l,T.pad,T.tb+(T.ph?30:34)+i*T.slh,Object.assign(i_dispO(T.ss),{color:soft}))); }
const i_RM=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(_){ return false; } };
/* one hairline weight for the whole set: 1 device px, at least half a CSS px */
const i_hw=g=>Math.max(1,Math.round(.6*g.dpr))/g.dpr;
/* the instrument if the engine has it, else the fallback (the audio designer is adding names in parallel) */
const i_has=n=>{ const a=M.audio; return !!(a&&a.names&&a.names.indexOf(n)>=0); };
const i_ins=(n,fb)=>i_has(n)?n:fb;
function i_live(){ const a=M.audio; return a&&a.enabled&&a.unlocked?a:null; }
function i_S(st){ let s=st._i; if(!s){ s={}; try{ Object.defineProperty(st,'_i',{value:s,enumerable:false,writable:true,configurable:true}); }catch(_){} } return s; }
function i_ok(st,key,ms){ const s=i_S(st), now=performance.now(); if(now-(s[key]||-1e9)<ms) return false; s[key]=now; return true; }
const i_e=(st,k,t,tau)=>t==null?0:M.music.env(st,k,t,tau);
const i_qe=e=>Math.round(e*8)/8;
function i_gain(sc,g){ sc.events.forEach(e=>{ if(e.play) e.opts.gain=(e.opts.gain||1)*g; }); return sc; }

/* ── OKLab ramps (the Spectrum exploration only; after the Ki engine's gradients) ── */
const i_lin=c=>{ c/=255; return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4); };
const i_gam=c=>{ c=c<=.0031308?12.92*c:1.055*Math.pow(Math.max(0,c),1/2.4)-.055; return Math.max(0,Math.min(255,Math.round(c*255))); };
function i_toLab(hex){ const [r,g,b]=i_rgb(hex).map(i_lin); const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b), m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b), s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  return [.2104542553*l+.793617785*m-.0040720468*s, 1.9779984951*l-2.428592205*m+.4505937099*s, .0259040371*l+.7827717662*m-.808675766*s]; }
function i_fromLab(p){ const L=p[0], a=p[1], b=p[2], l=Math.pow(L+.3963377774*a+.2158037573*b,3), m=Math.pow(L-.1055613458*a-.0638541728*b,3), s=Math.pow(L-.0894841775*a-1.291485548*b,3);
  return '#'+[4.0767416621*l-3.3077115913*m+.2309699292*s, -1.2684380046*l+2.6097574011*m-.3413193965*s, -.0041960863*l-.7034186147*m+1.707614701*s].map(i_gam).map(x=>x.toString(16).padStart(2,'0')).join(''); }
function i_ramp(stops,n){ const L=stops.map(i_toLab), out=[]; for(let i=0;i<n;i++){ const u=i/(n-1)*(L.length-1), k=Math.min(L.length-2,Math.floor(u)), f=u-k; out.push(i_fromLab(L[k].map((v,j)=>v+(L[k+1][j]-v)*f))); } return out; }
/* three spectra, after the reel: soft green-yellow-pink; saturated bands; an RGB sweep. The red accent never sits in them. */
const NSP=12;
const SPEC={ soft:i_ramp(['#a6e8b0','#f1ea8e','#f5a9cc'],NSP), bands:i_ramp(['#3b74ff','#3b74ff','#25c97a','#25c97a','#ff5cb0','#ff5cb0'],NSP), rgb:i_ramp(['#ff6a3d','#ffd44a','#3fe08a','#38b6ff','#5b5cff'],NSP) };

/* ── the sphere: Mir's field wrapped on a globe. The rings are latitudes; the equator is the accent, where the two of you meet. ──
   Body dots sit on a latitude/longitude lattice (or a Fibonacci lattice). Ring dots are their own denser rows at ±20°, ±40°, ±60° and 0°.
   Loose, a ring drifts off its latitude (a slow wave plus scatter) and strays orbit outside the globe. */
const RINGS=[-60,-40,-20,0,20,40,60];
function i_lattice(kind,stepDeg,seed){ return i_slot('lat|'+kind+'|'+stepDeg+'|'+seed,'k',()=>{ const lat=[], lon=[], ri=[], R=M.rng(seed||41), st=stepDeg*DEG;
  const nearRing=a=>RINGS.some(r=>Math.abs(a/DEG-r)<stepDeg*.62);
  if(kind==='fib'){ const N=Math.round(4*Math.PI/(st*st)), ga=Math.PI*(3-Math.sqrt(5)); for(let i=0;i<N;i++){ const a=Math.asin(1-2*(i+.5)/N); if(nearRing(a)) continue; lat.push(a); lon.push(i*ga); ri.push(-1); } }
  else { const nr=Math.round(90/stepDeg); for(let j=-nr+1;j<nr;j++){ const a=j*st; if(nearRing(a)) continue; const c=Math.cos(a), base=Math.round(TAU/st), k=Math.pow(2,Math.floor(Math.log2(1/Math.max(.08,c)))), n=Math.max(4,Math.round(base/k));
      for(let i=0;i<n;i++){ lat.push(a); lon.push(i/n*TAU); ri.push(-1); } } lat.push(Math.PI/2); lon.push(0); ri.push(-1); lat.push(-Math.PI/2); lon.push(0); ri.push(-1); }
  /* ring rows: dots at .62 of the lattice step, so a ring reads as an engraved line */
  RINGS.forEach((r,k)=>{ const a=r*DEG, n=Math.round(TAU*Math.cos(a)/(st*.62)); for(let i=0;i<n;i++){ lat.push(a); lon.push((i+R()*.2)/n*TAU); ri.push(k); } });
  const N=lat.length, o={N,lat:Float32Array.from(lat),lon:Float32Array.from(lon),ri:Int8Array.from(ri),jit:new Float32Array(N),ph:new Float32Array(N)};
  for(let i=0;i<N;i++){ o.jit[i]=R.gauss(); o.ph[i]=R(); } return o; }); }
/* strays: orbiters outside the globe, each on its own tilted orbit */
function i_strays(n,seed){ return i_slot('str|'+n+'|'+seed,'k',()=>{ const R=M.rng(seed), out=[]; for(let i=0;i<n;i++) out.push({rho:1.12+R()*.42, inc:(R()-.5)*1.6, node:R()*TAU, ph:R()*TAU, sp:(.6+R()*.9)*(R()<.5?-1:1), r:.75+R()*.5}); return out; }); }
/* project the globe. emit(x,y,r,kind,ri,lat,z) for every visible dot; kind 0 body, 1 ring, 2 equator, 3 stray, 4 back ring.
   o: {cx,cy,R, yaw, tilt, loose 0..1, t (ms, for drift), L light [x,y,z], ink:'light'|'dark', rmax, back, strays:n, seed, pulse(ri)} */
function i_sphere(o,emit){ const Lt=i_lattice(o.kind||'ll',o.step,o.seed||41), cy0=Math.cos(o.yaw), sy0=Math.sin(o.yaw), ct=Math.cos(o.tilt), stl=Math.sin(o.tilt), loose=o.loose||0, t=(o.t||0)/1000;
  const Lv=o.L||[-.45,.55,.7], ll=Math.hypot(Lv[0],Lv[1],Lv[2]), lx=Lv[0]/ll, ly=Lv[1]/ll, lz=Lv[2]/ll, dark=o.ink==='dark', rmax=o.rmax, bk=o.back||0;
  for(let i=0;i<Lt.N;i++){ const k=Lt.ri[i]; let a=Lt.lat[i], b=Lt.lon[i];
    if(k>=0&&loose>0){ /* the ring drifts off its latitude: a slow wave around the globe plus scatter */ a+=loose*(.16*Math.sin(2*b+k*1.7+t*.35)+.05*Lt.jit[i]); b+=loose*.06*Lt.jit[(i+7)%Lt.N]; }
    const ca=Math.cos(a), x0=ca*Math.sin(b), y0=Math.sin(a), z0=ca*Math.cos(b);
    const x1=x0*cy0+z0*sy0, z1=-x0*sy0+z0*cy0, y=y0*ct-z1*stl, z=y0*stl+z1*ct;
    if(z<0){ if(bk&&k>=0) emit(o.cx+x1*o.R,o.cy-y*o.R,rmax*.32,4,k,a,z); continue; }
    const lam=Math.max(0,x1*lx+y*ly+z*lz), limb=Math.pow(z,.42), lit=dark?(1-.82*lam):(.1+.9*lam);
    let tone=lit*limb; if(k>=0) tone=Math.max(tone,.3*limb)*(o.pulse?1+o.pulse(k):1)*(o.boost?o.boost(k,Lt.lon[i]):1);
    const r=k>=0?(o.ringFlat?rmax*o.ringW*(.62+.38*limb)*(o.pulse?1+.6*o.pulse(k):1):rmax*(o.ringW||.44)*(.7+.6*Math.sqrt(tone))):rmax*(o.bodyW||.68)*Math.pow(tone,o.gam||.5); if(r<rmax*.06) continue;
    emit(o.cx+x1*o.R,o.cy-y*o.R,r,k===3?2:k>=0?1:0,k,a,z,tone); }
  const ns=o.strays|0; if(ns){ const S=i_strays(ns,(o.seed||41)+5); for(const s of S){ const an=s.ph+s.sp*t*.9, ci=Math.cos(s.inc), si=Math.sin(s.inc), px=Math.cos(an)*s.rho, pz0=Math.sin(an)*s.rho, py=pz0*si, pz=pz0*ci;
      const qx=px*Math.cos(s.node)-pz*Math.sin(s.node), qz=px*Math.sin(s.node)+pz*Math.cos(s.node), y=py*ct-qz*stl, z=py*stl+qz*ct;
      if(z<0&&Math.hypot(qx,y)<1) continue; emit(o.cx+qx*o.R,o.cy-y*o.R,rmax*s.r*.8,3,-1,0,z); } } }

/* ── a panel at its own pixel grid. Splat discs with coverage (max, so dots never saturate), then draw each lit pixel as one dot:
   the dot's area is the pixel's brightness. Pixels sit on the panel's real pitch. ── */
function i_Ras(w,h){ this.w=w; this.h=h; this.I=new Float32Array(w*h); this.C=new Uint8Array(w*h); }
i_Ras.prototype.clear=function(){ this.I.fill(0); };
i_Ras.prototype.splat=function(x,y,r,ci,a){ a=a==null?1:a; const w=this.w, h=this.h, I=this.I, C=this.C, x0=Math.max(0,Math.floor(x-r-1)), x1=Math.min(w-1,Math.ceil(x+r)), y0=Math.max(0,Math.floor(y-r-1)), y1=Math.min(h-1,Math.ceil(y+r));
  for(let j=y0;j<=y1;j++) for(let i=x0;i<=x1;i++){ const d=Math.hypot(i+.5-x,j+.5-y), cv=Math.min(1,Math.max(0,r+.5-d))*a; if(cv>I[j*w+i]){ I[j*w+i]=cv; C[j*w+i]=ci; } } };
/* text rendered into the panel's pixels (true density), through a scratch canvas */
i_Ras.prototype.text=function(s,x,y,o,ci){ const c=i_slot('rastx','k',()=>{ const cv=document.createElement('canvas'); cv.width=256; cv.height=64; return cv.getContext('2d',{willReadFrequently:true}); });
  const size=o.size||10; c.clearRect(0,0,256,64); c.font=`${o.weight||500} ${size}px ${M.FONT[o.font||'mono']}`; if('letterSpacing' in c) c.letterSpacing=(o.track||0)*size+'px'; c.fillStyle='#fff'; c.textBaseline='alphabetic';
  const str=o.upper?String(s).toUpperCase():String(s), tw=Math.ceil(c.measureText(str).width), ox=o.align==='center'?Math.round(x-tw/2):o.align==='right'?Math.round(x-tw):Math.round(x); c.fillText(str,2,Math.round(size*1.2)+2);
  const hh=Math.ceil(size*1.6)+4, d=c.getImageData(0,0,Math.min(256,tw+6),hh).data, ww=Math.min(256,tw+6), oy=Math.round(y)-Math.round(size*1.2)-2;
  for(let j=0;j<hh;j++) for(let i=0;i<ww;i++){ const v=d[(j*ww+i)*4+3]>110?1:0; if(!v) continue; const X=ox+i-2, Y=oy+j; if(X<0||Y<0||X>=this.w||Y>=this.h) continue; const k=Y*this.w+X; if(v>this.I[k]){ this.I[k]=v; this.C[k]=ci; } } };
/* draw: pixel (i,j) lands at ox + (i+.5)·ax + (j+.5)·bx (so a rotated panel draws rotated); s = pixel pitch in CSS px */
/* a pixel is lit, not grown: brightness is the dot's color between the panel ground and its ink (6 levels), at the pixel's full size.
   Where the pixels are large (an enlarged window), brightness is the dot's area instead. */
i_Ras.prototype.draw=function(B,ox,oy,ax,ay,bx,by,s,cols,lv,bg){ const w=this.w, h=this.h, I=this.I, C=this.C, L=lv||6, rr=s*.5, big=s>2.4;
  for(let j=0;j<h;j++) for(let i=0;i<w;i++){ const v=I[j*w+i]; if(v<.07) continue; const q=Math.ceil(v*L)/L, X=ox+(i+.5)*ax+(j+.5)*bx, Y=oy+(i+.5)*ay+(j+.5)*by, c=cols[C[j*w+i]];
    if(big) B.dot(X,Y,rr*.94*Math.sqrt(q),c); else B.dot(X,Y,rr*.96,q>=1||!bg?c:i_mix(bg,c,q)); } };

/* ── technical drawing: hairline strokes in mm, through a transform. One weight; interior edges at half strength. ── */
function i_fig(g,ox,oy,u,rot){ return {g,ox,oy,u,rot:rot||0, P(x,y){ const c=Math.cos(this.rot), s=Math.sin(this.rot); return [this.ox+(x*c-y*s)*this.u, this.oy+(x*s+y*c)*this.u]; },
  begin(col,half){ const g=this.g; g.save(); g.translate(this.ox,this.oy); g.rotate(this.rot); g.scale(this.u,this.u); g.lineWidth=i_hw(g)/this.u; g.strokeStyle=col; g.globalAlpha=half?.55:1; g.lineJoin='round'; g.lineCap='round'; g.beginPath(); },
  end(){ this.g.stroke(); this.g.restore(); } }; }
function i_rr(g,x,y,w,h,r){ g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
function i_circ(g,x,y,r){ g.moveTo(x+r,y); g.arc(x,y,r,0,TAU); }
/* a callout: number at the free end, leader with at most one bend, ending in a filled dot on the surface */
function i_callout(g,B,n,tx,ty,ex,ey,col,o={}){ g.save(); g.strokeStyle=col; g.lineWidth=i_hw(g); g.beginPath(); const bx=o.bend?o.bend[0]:tx, by=o.bend?o.bend[1]:ty; g.moveTo(tx,ty); if(o.bend) g.lineTo(bx,by); g.lineTo(ex,ey); g.stroke(); g.restore();
  B.dot(ex,ey,1.3,col); M.text(g,String(n),tx+(o.dx??-6),ty+3.5,{font:'mono',size:9.5,weight:500,track:.04,color:col,align:o.align||'right'}); }
/* a dimension line with witness ticks and a centered label */
function i_dim(g,ax,ay,bx,by,label,col,side){ const L=Math.hypot(bx-ax,by-ay), nx=-(by-ay)/L, ny=(bx-ax)/L, t=4; g.save(); g.strokeStyle=col; g.lineWidth=i_hw(g); g.beginPath(); g.moveTo(ax,ay); g.lineTo(bx,by);
  g.moveTo(ax-nx*t,ay-ny*t); g.lineTo(ax+nx*t,ay+ny*t); g.moveTo(bx-nx*t,by-ny*t); g.lineTo(bx+nx*t,by+ny*t); g.stroke(); g.restore();
  const mx=(ax+bx)/2, my=(ay+by)/2; if(Math.abs(ax-bx)<1){ g.save(); g.translate(mx+(side||1)*10,my); g.rotate(-Math.PI/2); i_lab(g,label,0,0,col,8.5,{align:'center'}); g.restore(); } else i_lab(g,label,mx,my-(side||1)*7+(side<0?7:0),col,8.5,{align:'center'}); }
/* curvature told by density: dots packed toward the silhouette of a cylinder (cable, actuator), open across its crown */
function i_cyl(B,P,len,wid,col,seed,n){ const R=M.rng(seed); for(let i=0;i<n;i++){ const u=R(), s=(R()<.5?-1:1)*Math.pow(R(),.35), [x,y]=P(u*len,s*wid/2); B.dot(x,y,.5,col); } }

/* ════════════════════════════════════════════════════════════════════════
   L-41 · Pocket Mir: three generic dev boards with 1.14" panels (135 × 240 px), each showing the field as a turning dot sphere in
   one state: loose, settling, in tune. The panels are rasterized at their real pixel grid. The boards are drawn as patent figures.
   Music: three small voices in canon, one per board, converging on the third.
   ════════════════════════════════════════════════════════════════════════ */
/* board, in mm: 25.0 × 51.5 (NOM.), panel active area 14.2 × 25.2 (135 × 240 px, pitch 0.105) */
const BD={w:25,h:51.5,r:1.6, glass:[4.2,5.6,16.6,30.6], act:[5.4,7.0,14.2,25.2], usb:[8.05,48.7,8.9,3.3], btn:[[4.4,45.6],[20.6,45.6]], pins:10, pinY:12.2, pinX:[1.55,23.45]};
const ST41=[{k:'loose',loose:.95,str:26,spec:'soft'},{k:'settling',loose:.42,str:9,spec:'bands'},{k:'in tune',loose:0,str:0,spec:'rgb'}];
const GR41={night:{ground:'#0f0c0c',ink:'#efefef',scr:'#050505',body:'#b4b0ab',ring:'#efefef',acc:'#e3283a',str:'#d9d6d2'},
  paper:{ground:'#fafafa',ink:'#1d2733',scr:'#f4f5f6',body:'#8b9097',ring:'#1d2733',acc:'#d4142a',str:'#1d2733'},
  spectrum:{ground:'#0f0c0c',ink:'#efefef',scr:'#050505',body:null,ring:null,acc:'#e3283a',str:'#efefef'}};
const T41='Pocket Mir';
const SUB41='Three tiny screens, each showing the field as a turning sphere of dots: loose, settling and in tune.';
const ROOT41='Root · adamfuhrer, “pocket spheres” (reel): dot spheres on 1-inch boards. Simplified: a generic board.';
const BPM41=96, BT41=625, BAR41=2500, CUE41=4*BAR41;
const TURNS41={slow:1,medium:2,fast:4};
const lay41=i_memo(function(w){ const T=i_T(w,SUB41,560,640), o=Object.assign({},T), {ph,pad,inner}=T;
  if(ph){ o.rot=-Math.PI/2; o.u=Math.min(5.8,(inner-50)/BD.h); o.bw=BD.h*o.u; o.bh=BD.w*o.u; const rowH=o.bh+52; o.boards=[0,1,2].map(i=>({x:pad,y:T.top+22+i*rowH})); o.H0=T.top+22+3*rowH;
    o.cols=1; }
  else { o.rot=0; const room=inner-(w>=1100?320:110); o.u=Math.min(9.4,room/(3*BD.w+2*12)); o.bw=BD.w*o.u; o.bh=BD.h*o.u; const gap=Math.min(o.u*12,(room-3*o.bw)/2), x0=pad+(w>=1100?118:96);
    o.boards=[0,1,2].map(i=>({x:x0+i*(o.bw+gap),y:T.top+30+[10,0,18][i]})); o.det=w>=1100?{cx:o.boards[2].x+o.bw+gap*.5+96,cy:T.top+30+o.bh*.36,R:84}:null; o.H0=T.top+30+o.bh+o.u*24; }
  o.root=i_wrap(ROOT41,inner,i_ROOT); o.rootY=o.H0+(ph?8:18); o.H=i_q(o.rootY+(o.root.length-1)*14+pad); return o; });
/* each board's panel, as a figure: P maps board mm to canvas; the panel's pixel basis follows the board */
function i_bf41(L,i,g){ const b=L.boards[i]; return L.ph?i_fig(g,b.x,b.y+L.bh,L.u,L.rot):i_fig(g,b.x,b.y,L.u,0); }
function i_panel41(L,F){ const [ax0,ay0,aw,ah]=BD.act, p0=F.P(ax0,ay0), s=aw*L.u/135;
  if(!L.ph) return {ox:p0[0],oy:p0[1],ax:s,ay:0,bx:0,by:s,s,pw:135,ph:240};
  /* rotated board: the panel's long side runs left to right; the image is drawn landscape (240 × 135) */
  const q=F.P(ax0+aw,ay0); return {ox:q[0],oy:q[1],ax:s,ay:0,bx:0,by:s,s,pw:240,ph:135}; }
function i_board41(g,B,L,i,C){ const F=i_bf41(L,i,g), [gx,gy,gw,gh]=BD.glass, [ax,ay,aw,ah]=BD.act, [ux,uy,uw,uh]=BD.usb, cg=g;
  /* outlines: PCB, glass, active area, USB-C receptacle, buttons, through-holes */
  F.begin(C.ink); i_rr(cg,0,0,BD.w,BD.h,BD.r); i_rr(cg,gx,gy,gw,gh,.6); i_rr(cg,ux,uy,uw,uh,1.5); BD.btn.forEach(([x,y])=>{ cg.rect(x-1.8,y-1.8,3.6,3.6); });
  for(let k=0;k<BD.pins;k++) BD.pinX.forEach(x=>i_circ(cg,x,BD.pinY+k*2.54,.85)); F.end();
  F.begin(C.ink,true); cg.rect(ax,ay,aw,ah); BD.btn.forEach(([x,y])=>i_circ(cg,x,y,.85)); for(let k=0;k<BD.pins;k++) BD.pinX.forEach(x=>i_circ(cg,x,BD.pinY+k*2.54,.42));
  i_rr(cg,ux+.8,uy+.7,uw-1.6,uh-1.4,.9); /* tongue */ cg.rect(gx+4.6,gy+gh,gw-9.2,1.5); /* FPC tail */
  [[9.4,40.4,1,.5],[11.4,40.4,1,.5],[13.6,40.4,1,.5],[15.6,40.4,1,.5],[19.6,39.8,1.6,.8],[5.6,39.8,1.6,.8]].forEach(([x,y,w,h])=>cg.rect(x,y,w,h));
  cg.rect(11.05,42.2,2.9,1.6); [11.55,12.5,13.45].forEach((x,k)=>{ cg.moveTo(x,k===1?42.2:43.8); cg.lineTo(x,k===1?41.6:44.4); });
  /* a printed antenna meander along the top edge */ cg.moveTo(5,3.4); for(let k=0;k<8;k++){ const x=5+k*1.9; cg.lineTo(x,1.6); cg.lineTo(x+.95,1.6); cg.lineTo(x+.95,3.4); cg.lineTo(x+1.9,3.4); }
  F.end();
  /* the black mask between glass and active area: tone by density */
  const R=M.rng(4100+i), maskCol=i_mix(C.ground,C.ink,.42); for(let y=gy+.35;y<gy+gh;y+=.7) for(let x=gx+.35;x<gx+gw;x+=.7){ if(x>ax-.2&&x<ax+aw+.2&&y>ay-.2&&y<ay+ah+.2) continue; const p=F.P(x,y); B.dot(p[0],p[1],.42,maskCol); }
  /* curvature: the button actuators and the receptacle's rounded ends, dots packed toward the silhouette */
  BD.btn.forEach(([x,y],k)=>{ for(let n=0;n<26;n++){ const a=R()*TAU, rr=.85*(1-Math.pow(R(),2.4)*.6), p=F.P(x+Math.cos(a)*rr,y+Math.sin(a)*rr); B.dot(p[0],p[1],.45,C.ink); } });
  /* plug and cable: overmold below the receptacle, then the cable leaving the frame */
  F.begin(C.ink); i_rr(cg,ux+.45,BD.h+.5,uw-.9,1.6,.7); i_rr(cg,6.6,BD.h+2.1,11.8,17,2.2); F.end();
  const cab=[[12.5,BD.h+19.1],[12.5+[2.5,-1.5,1.2][i],BD.h+40],[12.5+[7,-5,3][i],BD.h+70]];
  F.begin(C.ink); [-1.8,1.8].forEach(d=>{ cg.moveTo(cab[0][0]+d,cab[0][1]); cg.bezierCurveTo(cab[0][0]+d,cab[0][1]+9,cab[1][0]+d,cab[1][1]-6,cab[1][0]+d,cab[1][1]); cg.lineTo(cab[2][0]+d,cab[2][1]); }); F.end();
  /* the cable's roundness: dots close to both edges */
  /* lines along the axis at even angles round the cylinder, so their projections crowd toward both edges; each line is dotted */
  const tc=i_mix(C.ground,C.ink,.62); for(let k=0;k<9;k++){ const th=((k+.5)/9-.5)*Math.PI, sx=Math.sin(th)*1.62; if(Math.abs(th)<.5) continue; for(let y=BD.h+19.8;y<BD.h+70;y+=.62){ const u=(y-BD.h-19.1)/51, xm=u<.4?lerp(cab[0][0],cab[1][0],E.inOutCubic(u/.4)):lerp(cab[1][0],cab[2][0],(u-.4)/.6), p=F.P(xm+sx,y); B.dot(p[0],p[1],.4,tc); } }
  /* the overmold's long sides round away: the same, only near its silhouette */
  for(let k=0;k<11;k++){ const th=((k+.5)/11-.5)*Math.PI; if(Math.abs(th)<1.05) continue; const sx=Math.sin(th)*5.7; for(let y=BD.h+3.4;y<BD.h+18.2;y+=.62){ const p=F.P(12.5+sx,y); B.dot(p[0],p[1],.4,tc); } }
  return F; }
function i_base41(st,w,h){ return i_slot('base41',i_DK(w,h)+'|'+st.ground,()=>{ const L=lay41(w), C=GR41[st.ground], {cv,g}=i_off(w,h), B=new M.Buf(g), soft=i_mix(C.ground,C.ink,.6);
  M.fill(g,C.ground); i_title(g,L,L.ph?'L-41 · Concept':'L-41 · Concept · three boards, true pixel density','135 × 240 px · 1.14 in',T41,C.ink,soft);
  /* the cable runs off the bottom of the plate; clip the boards' area to the plate */
  g.save(); g.beginPath(); g.rect(0,L.top-8,w,L.H0-L.top+8); g.clip(); const Fs=[0,1,2].map(i=>i_board41(g,B,L,i,C)); B.flush(); g.restore();
  /* screens: the panel ground */
  Fs.forEach((F,i)=>{ const [ax,ay,aw,ah]=BD.act, p=F.P(ax,ay), q=F.P(ax+aw,ay+ah); g.fillStyle=C.scr; g.fillRect(Math.min(p[0],q[0]),Math.min(p[1],q[1]),Math.abs(q[0]-p[0]),Math.abs(q[1]-p[1]));
    const b=L.boards[i]; if(L.ph) i_lab(g,'0'+(i+1)+' · '+ST41[i].k,b.x,b.y-12,C.ink,9); else i_lab(g,'0'+(i+1)+' · '+ST41[i].k,b.x,b.y-14,C.ink,9.5); });
  /* callouts on the first board: even numerals, leaders ending in a dot */
  const F=Fs[0], B2=new M.Buf(g), lc=C.ink;
  if(!L.ph){ const x0=L.boards[0].x-22, pts=[[10,0,9],[12,8,18],[14,BD.pinX[0],BD.pinY+5*2.54],[16,BD.btn[0][0],BD.btn[0][1]],[18,9,BD.h-.6],[20,11.5,BD.h+10]];
    pts.forEach(([n,x,y])=>{ const p=F.P(x,y); i_callout(g,B2,n,x0,p[1],p[0],p[1],lc); });
    /* dimensions on the third board */ const F3=Fs[2], a=F3.P(BD.w,0), b=F3.P(BD.w,BD.h); i_dim(g,a[0]+16,a[1],b[0]+16,b[1],'51.5 mm nom.',soft,1);
    const c=F3.P(0,-6.2), d=F3.P(BD.w,-6.2); i_dim(g,c[0],c[1]+0,d[0],d[1],'25.0',soft,1); }
  B2.flush();
  if(L.det){ const D=L.det; g.save(); g.strokeStyle=C.ink; g.lineWidth=i_hw(g); g.beginPath(); i_circ(g,D.cx,D.cy,D.R); g.stroke(); g.restore();
    i_lab(g,'Fig. 1A · panel, 6:1',D.cx-D.R,D.cy+D.R+22,C.ink,9); i_lab(g,'pixel pitch 0.105 mm',D.cx-D.R,D.cy+D.R+36,soft,9); }
  i_root(g,L.root,L.pad,L.rootY,soft);
  return cv; }); }
/* one panel's image at time t: the sphere in its state, the state word, rasterized to the panel's pixels */
function i_scr41(L,st,i,t,ras){ const P=i_panel41(L,{P:()=>[0,0]}), S=ST41[i], pw=P.pw, ph=P.ph, land=pw>ph, pitch=st.pitch, R=land?58:61, cx=land?76:67.5, cy=land?67.5:108;
  const turns=TURNS41[st.rot]||2, T=t==null?1800:t, yaw=TAU*turns*T/CUE41+i*.9+.6, sp=st.ground==='spectrum'?SPEC[S.spec]:null, base=sp?4:0;
  ras.clear(); const ee=k=>i_e(st,'b'+i+'r'+k,t,240), lock=i_e(st,'lock',t,520), mer=i_e(st,'mer',t,110);
  i_sphere({cx,cy,R,yaw,tilt:.38,loose:S.loose,t:T+i*900,step:pitch/R/DEG,rmax:pitch*.5,strays:S.str,seed:41+i*3,pulse:k=>.9*ee(k)+(k===3?.6*lock:0)},(x,y,r,kind,k,lat,z,tone)=>{
    let ci=kind===3?3:kind===2?2:kind===1?1:0; if(sp&&kind!==2&&kind!==3){ ci=base+Math.max(0,Math.min(NSP-1,Math.round((.5-lat/Math.PI)*(NSP-1)))); }
    ras.splat(x,y,r,ci,kind===0?Math.min(1,.18+.95*tone):1); });
  /* the meridian facing you: a tick of light as it passes (the rotation is the rhythm) */
  if(mer>.05) for(let y=cy-R+3;y<cy+R-3;y+=pitch*.9){ const dx=Math.sqrt(Math.max(0,R*R-(y-cy)*(y-cy))); if(dx<4) continue; ras.splat(cx,y,pitch*.32*mer,1,.9*mer); }
  /* state word, at the panel's own pixels */
  if(land) ras.text(S.k,224,72,{size:10,weight:500,track:.08,upper:true,align:'right'},sp?3:1);
  else ras.text(S.k,67.5,224,{size:10,weight:500,track:.08,upper:true,align:'center'},sp?3:1);
  return P; }
function i_draw41(g,w,h,st,t){ const L=lay41(w), C=GR41[st.ground], B=new M.Buf(g); const ras=i_slot('ras41',L.ph?'l':'p',()=>[0,1,2].map(()=>L.ph?new i_Ras(240,135):new i_Ras(135,240)));
  for(let i=0;i<3;i++){ const F=i_bf41(L,i,g), P=i_scr41(L,st,i,t,ras[i]), [ax,ay,aw,ah]=BD.act, p0=L.ph?F.P(ax+aw,ay):F.P(ax,ay), s=aw*L.u/135;
    let cols=[C.body,C.ring,C.acc,C.str]; if(st.ground==='spectrum'){ const sp=SPEC[ST41[i].spec]; cols=['#777',sp[6],C.acc,C.str].concat(sp); }
    ras[i].draw(B,p0[0],p0[1],s,0,0,s,s,cols,5,C.scr);
    if(i===2&&L.det){ /* Fig. 1A: the same pixels, a window at 6:1 around where the equator meets the limb */ const D=L.det, k=6, fx=67.5+40, fy=104-6, R=D.R-3, sc=s*k, g2=g;
      B.flush(); g2.save(); g2.beginPath(); i_circ(g2,D.cx,D.cy,R); g2.clip(); g2.fillStyle=C.scr; g2.fillRect(D.cx-R,D.cy-R,2*R,2*R); const B3=new M.Buf(g2), r=ras[i], n=Math.ceil(R/sc)+1;
      for(let j=Math.floor(fy-n);j<=fy+n;j++) for(let q=Math.floor(fx-n);q<=fx+n;q++){ if(q<0||j<0||q>=r.w||j>=r.h) continue; const v=r.I[j*r.w+q]; if(v<.07) continue; const X=D.cx+(q+.5-fx)*sc, Y=D.cy+(j+.5-fy)*sc; B3.dot(X,Y,sc*.46*Math.sqrt(Math.ceil(v*6)/6),cols[r.C[j*r.w+q]]); }
      B3.flush(); g2.restore(); const a=F.P(ax+fx*aw/135,ay+fy*ah/240); g2.save(); g2.strokeStyle=i_mix(C.ground,C.ink,.6); g2.lineWidth=i_hw(g2); g2.beginPath(); i_circ(g2,a[0],a[1],R/k); g2.moveTo(a[0]+R/k,a[1]); g2.lineTo(D.cx-D.R,D.cy); g2.stroke(); g2.restore(); } }
  B.flush(); }
/* music · L-41. 96 BPM 4/4, four bars, looped. The same line in canon, one voice per board, a beat apart: the loose board plays the
   suspension (5 ↑ 1 ↑ 4) with its timing off the grid and slightly detuned; the settling board leans its 4 down onto the 3; the board in
   tune plays 5 ↑ 1 ↑ 3 on the grid. On bar 4 all three converge on the third, in three octaves, with the bass once.
   Pitch is latitude: each note lights the ring at its height on that board's globe, and the third is the equator.
   The rotation is the rhythm: each of eight meridians ticks as it faces you (Rotation sets the subdivision). Dot pitch is register. */
const LINE41=[[0,-3,1],[1,0,1],[2,2,1],[4,4,1],[5,2,1],[6,0,2],[8,-3,1],[9,0,1],[10,3,1]];
const RING41={'-3':1,'0':2,'2':3,'3':4,'4':5,'7':6};
const i_reg41=p=>p<=2?1:p>=6?-1:0;
function i_music41(st){ const mu=M.music, grd=st.ground==='spectrum'?'sky':st.ground, S=mu.score({bpm:BPM41,meter:[4,4],ground:grd}), md=S.mode, reg=i_reg41(st.pitch), R=M.rng(4141);
  const home=md==='dorian'||md==='aeolian'?'Dm':'D'; S.harm([[0,'Dsus4'],[3*BAR41,home]]);
  S.hitSound(0,'drone',{freq:mu.hz('D2','D'),ratio:1.5,level:.26,cutoff:700,fade:.6,dur:CUE41/1000});
  const V=[{ins:'bell',oct:5+reg,off:0,vel:.32,opt:{ratio:3.5,bright:.8}},{ins:'glide',oct:4+reg,off:1,vel:.4,opt:{vibrato:5,attack:.03,release:.25,tone:2600}},{ins:i_ins('rhodes','mallet'),oct:3+reg,off:2,vel:.46,opt:{trem:5}}];
  V.forEach((v,b)=>{ LINE41.forEach(([bt,d,len],n)=>{ const beat=bt+v.off; if(beat>=12) return; let deg=d, tt=beat*BT41, cents=0;
      if(b===0){ if(d===2) deg=3; tt+=(R()-.5)*.22*BT41; cents=0; }
      if(b===1&&d===2) deg=3;
      const m=mu.deg(md,deg,v.oct-1+(deg<0?1:0)), dur=Math.min(len,12-beat)*BT41*.92, pan=(b-1)*.55, key='b'+b+'r'+(RING41[String(deg)]??3);
      const f=mu.hz(m,'Dsus4')*Math.pow(2,cents/1200), id='v'+b+'n'+n;
      S.note(Math.max(0,tt),v.ins,{hz:f},dur,Object.assign({vel:v.vel*(n%3===0?1.08:1),pan,id},v.opt),[key,1]);
      /* the settling voice leans: its 4 glides down to the 3 half a beat later */
      if(b===1&&d===2){ S.glide(tt+BT41*.5,id,mu.deg(md,2,v.oct-1),110); S.hit(tt+BT41*.5,'b1r3',.8); S.hitSound(tt+BT41*.5,'tick',{vel:.05,pan}); } }); });
  /* convergence: the third in three octaves, the chord, the bass once */
  const T3=3*BAR41; V.forEach((v,b)=>S.note(T3,v.ins,mu.deg(md,2,v.oct-1),BAR41*.95,Object.assign({vel:v.vel*1.1,pan:(b-1)*.55},v.opt),['b'+b+'r3',1]));
  S.note(T3,'meet',mu.deg(md,2,4),1800,{spread:26,vel:.42},['lock',1]); S.note(T3,'bass','D2',700,{from:'A1',glide:90,env:2.4,decay:.4,vel:.5});
  S.chord(T3,'pad',mu.voice(home,'A3','A4',3),BAR41*.9,{attack:.08,release:.4,cutoff:1300,vel:.3});
  /* the meridians: eight per turn, each a soft tick as it faces you */
  const turns=TURNS41[st.rot]||2, every=CUE41/(8*turns); for(let k=0;k<8*turns;k++){ const tt=k*every+every*.5; S.hitSound(tt,i_ins('shaker','hat'),{vel:k%2?.1:.16,decay:.03,pan:.3},['mer',1]); }
  S.end(CUE41); return S.out(); }
function i_param41(A,st,id,ov,nv){ const mu=M.music, now=A.now(); if(!now) return true; const md=mu.groundMode(st.ground==='spectrum'?'sky':st.ground);
  if(id==='pitch'){ if(!i_ok(st,'pp',140)) return true; const reg=i_reg41(+nv); [-3,0,2].forEach((d,k)=>A.play('bell',{freq:mu.hz(mu.deg(md,d,4+reg+(d<0?1:0)),'D'),dur:k===2?1.1:.4,vel:.34,ratio:3.5,bright:.8,when:now+.005+k*.09})); return true; }
  if(id==='rot'){ const n=TURNS41[nv]||2, dt=CUE41/(8*n)/1000; for(let k=0;k<4;k++) A.play('hat',{vel:.16,decay:.03,when:now+.005+k*dt}); A.play('glide',{freq:mu.hz(mu.deg(md,2,4),'D'),dur:dt*4,vel:.34,vibrato:5,attack:.03,release:.25,tone:2600,when:now+.005}); return true; }
  return false; }
M.piece({ id:'L-41',
  caption:'Three tiny dev boards, each screen showing the field as a turning sphere of dots: loose, settling and in tune, at the panel’s own pixels. Press Play to hear them meet on one note, or change the rotation, dot pitch or ground.',
  alt:'Three small circuit boards drawn as fine technical line drawings with numbered callouts, each with a USB-C cable leaving the frame. Each tiny screen shows a sphere made of dots with latitude rings and a red equator; the first sphere is scattered with stray dots, the third is crisp.',
  recipe:{
    idea:'Mir fits on a one-inch screen: the field becomes a globe whose latitudes are the rings, and the equator is where the two of you meet.',
    marks:['ring','center','stray','dot'],
    ground:'night, paper; spectrum (an exploration for the sphere series: OKLab gradients on black panels)',
    accent:'the equator, red: where the two of you meet',
    composition:'A title block, then three portrait boards in a row with a slight stagger, cables leaving the bottom; callouts on the first, dimensions on the third, an enlarged pixel window at right. On phones the boards turn landscape and stack.',
    motion:'At 96 BPM: the globes turn a whole number of times per four bars (Rotation), so the loop is seamless; each note lights the ring at its height; the loose globe’s rings drift and its strays orbit; on bar 4 the equators flash together. Reduced motion shows a still turn.',
    sound:'Three small voices play one line in canon, a beat apart. The loose board holds the suspension off the grid; the settling one leans onto the third; the board in tune plays it clean. All three land on the third together. Each meridian facing you ticks.',
    controls:['Ground (Night, Paper, Spectrum · exploration)','Rotation (slow, medium, fast)','Dot pitch 2–6 px'],
    computed:['orthographic globe, yaw then tilt; halftone dot radius from Lambert light and limb (z^0.42)','panel rasterized at 135 × 240 px with disc coverage; each pixel drawn as one dot whose area is its brightness','board dimensions from a 25 × 51.5 mm generic board (NOM.)'],
    placeholder:['the three states','board layout (generic, NOM.)'],
    root:'adamfuhrer, “pocket spheres” (Instagram reel, 2026): rotating dot spheres on 1.1–1.9 in ESP32 board screens',
    rules:['no maker’s name or logo on the boards','one hairline weight; interior edges at half strength; curvature by dot density','Spectrum only as a labeled exploration'],
    engine:['M.Buf','M.text','M.rng','M.music','M.music.env']},
  aspect:w=>w/lay41(w).H,
  state:{ground:'night',rot:'medium',pitch:4},
  controls:[{id:'ground',type:'select',label:'Ground',options:[{value:'night',label:'Night'},{value:'paper',label:'Paper'},{value:'spectrum',label:'Spectrum · exploration'}]},
    {id:'rot',type:'select',label:'Rotation',options:[{value:'slow',label:'Slow'},{value:'medium',label:'Medium'},{value:'fast',label:'Fast'}]},
    {id:'pitch',type:'range',label:'Dot pitch',min:2,max:6,step:1,fmt:v=>v+' px'}],
  loop:true,
  music:i_music41, musicParam:i_param41, musicIns:'bell',
  render(g,w,h,M,st){ i_blit(g,i_base41(st,w,h)); i_draw41(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ t=Math.max(0,t); i_blit(g,i_base41(st,w,h)); if(i_RM()){ i_draw41(g,w,h,st,null); return false; } i_draw41(g,w,h,st,t); return t<CUE41; } });

/* ════════════════════════════════════════════════════════════════════════
   L-42 · The sphere, up close: one large stipple globe as an editorial plate. Halftone by a light direction; lattice by latitude and
   longitude or by Fibonacci points. Mir's rings are seven latitudes, each carrying one knot (a bead). As the globe turns, each bead
   crosses the fixed meridian line and sounds its chord tone: the rotation is a slow arpeggio. Dragging turns it by hand.
   ════════════════════════════════════════════════════════════════════════ */
const P42=M.PAL.paper, C42={ground:P42.ground, ink:P42.ink, soft:i_mix(P42.ground,P42.ink,.56), dim:i_mix(P42.ground,P42.ink,.3), faint:i_mix(P42.ground,P42.ink,.16), acc:P42.center};
const T42='The sphere, up close';
const SUB42='Mir’s rings as latitudes on a globe of dots. Each ring carries one knot; as it crosses the meridian, it sounds.';
const ROOT42='Root · Halftone engraving, 1880s: tone as the size of dots on a screen. Simplified: one light, one globe.';
const BPM42=76, BT42=60000/BPM42, TURN42=8*BT42, CUE42=2*TURN42;
const LIGHT42={ul:{L:[-.55,.6,.58],name:'upper left',bright:1.15,pan:-.35,cut:5200},top:{L:[0,.92,.4],name:'top',bright:.95,pan:0,cut:4200},right:{L:[.75,.25,.6],name:'right',bright:1.05,pan:.35,cut:4800},rim:{L:[.2,.35,-.9],name:'rim',bright:.55,pan:0,cut:2200}};
/* the order the beads cross: latitude order for the regular lattice (a rising arpeggio); golden-angle order for the Fibonacci lattice */
const i_order42=lat=>{ if(lat!=='fib') return [0,1,2,3,4,5,6]; const k=[0,1,2,3,4,5,6].map(i=>({i,a:(i*137.50776)%360})).sort((x,y)=>x.a-y.a), b=new Array(7); k.forEach((x,j)=>b[x.i]=j); return b; };
/* bead longitude, so bead k faces you on beat b_k of each turn (yaw 0); loose, the beads slip off the grid */
const i_bead42=(st,k)=>{ const b=i_order42(st.lat)[k], loose=1-st.k, j=(M.hash2(k,3,42)-.5)*.6*loose; return -TAU*(b+j)/8; };
const lay42=i_memo(function(w){ const T=i_T(w,SUB42,460,640), o=Object.assign({},T), {ph,pad,inner}=T;
  if(ph){ o.R=Math.round(inner*.42); o.cx=pad+inner/2; o.cy=T.top+o.R+20; let y=o.cy+o.R+90; o.tbl={x:pad,y,cols:2,colW:inner/2,rowH:22}; y+=4*22+26; o.sc={x:pad,y,w:inner,h:7*9}; y+=7*9+40; o.H0=y; }
  else { o.R=Math.round(Math.min(330,inner*.27)); o.cx=pad+inner*.64; o.cy=Math.max(T.top-30+o.R,o.R+70); let y=T.top+6; o.tbl={x:pad,y,cols:1,colW:240,rowH:24}; o.sc={x:pad,y:y+7*24+42,w:Math.min(300,o.cx-o.R-pad-90),h:7*10}; o.H0=Math.max(o.cy+o.R+70,o.sc.y+o.sc.h+40); }
  o.step=(ph?6.4:8.6)/o.R/DEG; o.root=i_wrap(ROOT42,inner,i_ROOT); o.rootY=o.H0; o.H=i_q(o.rootY+(o.root.length-1)*14+pad); return o; });
function i_base42(st,w,h){ return i_slot('base42',i_DK(w,h),()=>{ const L=lay42(w), {cv,g}=i_off(w,h), C=C42;
  M.fill(g,C.ground); i_title(g,L,L.ph?'L-42 · Editorial':'L-42 · Editorial · a globe of dots','7 rings · 7 knots',T42,C.ink,C.soft);
  /* the meridian: a graduated ring around the globe and the fixed line the knots cross */
  const B=new M.Buf(g), Rm=L.R+(L.ph?14:22); g.save(); g.strokeStyle=C.ink; g.lineWidth=i_hw(g); g.beginPath(); i_circ(g,L.cx,L.cy,Rm); g.moveTo(L.cx,L.cy-Rm-(L.ph?10:16)); g.lineTo(L.cx,L.cy+Rm+(L.ph?10:16)); g.stroke(); g.restore();
  for(let d=-90;d<=90;d+=5){ const a=d*DEG, x=L.cx+Math.cos(a)*Rm, y=L.cy-Math.sin(a)*Rm, long=d%30===0; for(let q=1;q<=(long?5:2);q++) B.dot(x+Math.cos(a)*q*1.6,y-Math.sin(a)*q*1.6,.5,C.ink); }
  B.flush(); if(!L.ph) [-60,-30,0,30,60].forEach(d=>{ const a=d*DEG; i_lab(g,(d>0?'+':d<0?'−':'')+Math.abs(d)+'°',L.cx+Math.cos(a)*(Rm+16),L.cy-Math.sin(a)*(Rm+16)+3,C.soft,8.5); });
  i_lab(g,'meridian',L.cx-6,L.cy-Rm-(L.ph?4:8),C.soft,8.5,{align:'right'});
  i_lab(g,'Rings · crossing the meridian',L.tbl.x,L.tbl.y-12,C.soft,9); i_lab(g,'The turn as a score · 2 turns',L.sc.x,L.sc.y-14,C.soft,9);
  i_root(g,L.root,L.pad,L.rootY,C.soft); return cv; }); }
/* the pitch each ring sounds over chord sym: the ring's place in a chord-tone ladder whose fourth rung (the equator) is the third */
function i_pitch42(md,sym,k,loose){ const mu=M.music, third=mu.deg(md,2,3), base=mu.ct(sym,third,0), m=mu.ct(sym,base,k); return m; }
function i_draw42(g,w,h,st,t){ const L=lay42(w), C=C42, Lt=LIGHT42[st.light]||LIGHT42.ul, loose=1-st.k, T=t==null?0:t, yaw=st.yaw+TAU*T/TURN42, B=new M.Buf(g), ord=i_order42(st.lat);
  const beads=[0,1,2,3,4,5,6].map(k=>i_bead42(st,k));
  i_sphere({cx:L.cx,cy:L.cy,R:L.R,yaw,tilt:.32,loose,t:T,kind:st.lat==='fib'?'fib':'ll',step:L.step,rmax:L.R*L.step*DEG*.5,L:Lt.L,ink:'dark',back:0,strays:Math.round(34*loose),seed:42,ringW:.52,ringFlat:1,bodyW:.66,gam:.85,
    pulse:k=>1.2*i_qe(i_e(st,'r'+k,t,300))},
    (x,y,r,kind,k,lat,z)=>{ const c=kind===2?C.acc:kind===4?C.faint:kind===1?C.ink:kind===3?C.ink:C.ink; B.dot(x,y,kind===4?Math.max(.5,r*.7):r,c); });
  B.flush();
  /* the knots: one per ring, a small engraved ring around a dot; it swells as it sounds on the meridian */
  { const B3=new M.Buf(g), cyw=Math.cos(yaw), syw=Math.sin(yaw), ct=Math.cos(.32), stl=Math.sin(.32); for(let k=0;k<7;k++){ let a=RINGS[k]*DEG, b=beads[k]; if(loose>0) a+=loose*.16*Math.sin(2*b+k*1.7+T/1000*.35);
      const ca=Math.cos(a), x0=ca*Math.sin(b), y0=Math.sin(a), z0=ca*Math.cos(b), x1=x0*cyw+z0*syw, z1=-x0*syw+z0*cyw, y=y0*ct-z1*stl, z=y0*stl+z1*ct; if(z<.05) continue;
      const X=L.cx+x1*L.R, Y=L.cy-y*L.R, e=i_qe(i_e(st,'r'+k,t,300)), rr=(L.ph?6:9.5)*(1+.45*e)*Math.sqrt(z), col=k===3?C.acc:C.ink;
      B3.dot(X,Y,(L.ph?2.2:3.2)*(1+.4*e),col); M.ring(B3,{cx:X,cy:Y,R:rr,ex:1,ey:Math.max(.35,z),w:.9,swell:.1,dpl:1.6,rCore:.62,rEdge:.5,seed:4200+k,color:col}); }
    B3.flush(); }
  /* the ring table and the score: which knot is crossing, and every crossing of the cue */
  const mu=M.music, md=mu.groundMode('paper'), names=[0,1,2,3,4,5,6].map(k=>mu.name(i_pitch42(md,'D',k)).replace('#','♯'));
  const B2=new M.Buf(g); [6,5,4,3,2,1,0].forEach((k,row)=>{ const T2=L.tbl, col=T2.cols===2?(row<4?0:1):0, rr=T2.cols===2?row%4:row, x=T2.x+col*T2.colW, y=T2.y+rr*T2.rowH+10, e=i_qe(i_e(st,'r'+k,t,300));
    B2.dot(x+4,y-3.5,2.2+2.2*e,k===3?C.acc:C.ink); });
  /* score: x = beat in the cue, y = ring; the playhead walks it */
  const S=L.sc, cw=S.w/16, rh=S.h/6; for(let b=0;b<16;b++) for(let r=0;r<7;r++) B2.dot(S.x+(b+.5)*cw,S.y+S.h-r*rh,.5,C.dim);
  for(let tr=0;tr<2;tr++) for(let k=0;k<7;k++){ const b=tr*8+ord[k], e=i_qe(i_e(st,'r'+k,t,300))*(t!=null&&Math.abs(T-(b*BT42))<BT42*1.2?1:0); B2.dot(S.x+(b+.5)*cw,S.y+S.h-k*rh,1.8+1.6*e,k===3?C.acc:C.ink); }
  if(t!=null){ const x=S.x+T/CUE42*S.w; for(let y=S.y-6;y<=S.y+S.h+6;y+=2) B2.dot(x,y,.5,C.ink); }
  B2.flush();
  [6,5,4,3,2,1,0].forEach((k,row)=>{ const T2=L.tbl, col=T2.cols===2?(row<4?0:1):0, rr=T2.cols===2?row%4:row, x=T2.x+col*T2.colW, y=T2.y+rr*T2.rowH+10, lat=RINGS[k];
    M.text(g,(lat>0?'+':lat<0?'−':' ')+String(Math.abs(lat)).padStart(2,'0')+'°',x+14,y,{font:'mono',size:10.5,weight:400,track:.02,color:C.ink}); M.text(g,names[k]+(k===3?' · the third':''),x+62,y,{font:'mono',size:10.5,weight:400,track:.02,color:k===3?C.acc:C.soft}); });
  i_lab(g,'light · '+Lt.name+' · lattice · '+(st.lat==='fib'?'Fibonacci':'lat-long')+' · '+(st.k>=.8?'in tune':st.k>=.4?'settling':'loose'),L.ph?L.pad:L.cx-L.R,L.ph?L.cy+L.R+40:L.cy+L.R+48,C.ink,9); }
/* music · L-42. 76 BPM 4/4; one turn of the globe is two bars, the cue two turns, looped. Each ring's knot sounds as it crosses the
   meridian, so a turn is a slow seven-note arpeggio up the rings (the regular lattice) or in golden-angle order (Fibonacci). Pitch is
   height: the rings are rungs of a chord-tone ladder whose middle rung, the equator, is the third. Loose, the knots slip off the grid
   and the chord is suspended (the equator sounds the fourth); in tune, the equator's third meets. Light is tone: upper left bright and
   left, top even, right bright and right, rim dark and close. Under it, a pad and a root per bar: D, Bm7, G6, Asus4. */
const PROG42=['D','Bm7','G6','Asus4'];
function i_music42(st){ const mu=M.music, S=mu.score({bpm:BPM42,meter:[4,4],ground:'paper'}), md=S.mode, loose=1-st.k, Lt=LIGHT42[st.light]||LIGHT42.ul, ord=i_order42(st.lat), ins=st.lat==='fib'?'bell':i_ins('rhodes','mallet');
  const prog=PROG42.map((c,i)=>i===0&&loose>.5?'Dsus4':c); S.harm(prog.map((c,i)=>[i*4*BT42,c]));
  prog.forEach((c,i)=>{ const t=i*4*BT42; S.chord(t,'pad',mu.voice(c,'A3','A4',3),4*BT42*.96,{attack:.6,release:.9,cutoff:Lt.cut*.22,vel:.24,over:c}); S.note(t,'pluck',mu.ct(c,'D2',0),BT42*1.6,{cutoff:420,vel:.5,over:c}); });
  const R=M.rng(4242), shift=((st.yaw/TAU)%1+1)%1*8;
  for(let tr=0;tr<2;tr++) for(let k=0;k<7;k++){ let b=tr*8+((ord[k]+shift)%8), tt=S.q(b*BT42,2); tt+=(M.hash2(k,3,42)-.5)*.6*loose*BT42;
    const sym=S.chordAt(Math.max(0,tt)), m=i_pitch42(md,k===3&&loose>.5?'Dsus4':sym,k), pan=Lt.pan+(k-3)*.08;
    const opt=ins==='bell'?{ratio:3.5,bright:Lt.bright,vel:.34+.02*k,pan}:{trem:5,bright:Lt.bright,cutoff:Lt.cut,vel:.42+.02*k,pan};
    const nb=(Math.floor(Math.max(0,tt)/(4*BT42))+1)*4*BT42; S.note(Math.max(0,tt),ins,m,Math.min(BT42*1.7,nb-tt-30),opt,['r'+k,1]);
    if(k===3&&st.k>=.8&&tr===0) S.note(Math.max(0,tt),'meet',m+12,1600,{spread:24,vel:.36},['eq',1]); }
  S.end(CUE42); return i_gain(S.out(),2.1); }
function i_param42(A,st,id,ov,nv){ const mu=M.music, now=A.now(); if(!now) return true; const md=mu.groundMode('paper');
  if(id==='k'){ if(!i_ok(st,'pk',120)) return true; const v=+nv, third=mu.hz(mu.deg(md,2,4),'D'), sus=mu.hz(mu.deg(md,3,4),'D'); A.play('glide',{freq:third*Math.pow(sus/third,Math.pow(1-v,.8)),dur:.32,vel:.38,vibrato:4,attack:.02,release:.25,tone:2600,when:now+.005}); return true; }
  if(id==='light'){ const Lt=LIGHT42[nv]||LIGHT42.ul; [0,2,3].forEach((k,j)=>A.play('mallet',{freq:mu.hz(i_pitch42(md,'D',k),'D'),dur:1,vel:.4,trem:5,bright:Lt.bright,cutoff:Lt.cut,pan:Lt.pan,when:now+.005+j*.1})); return true; }
  if(id==='lat'){ const ord=i_order42(nv), seq=[0,1,2,3,4,5,6].sort((a,b)=>ord[a]-ord[b]); seq.forEach((k,j)=>A.play(nv==='fib'?'bell':'mallet',{freq:mu.hz(i_pitch42(md,'D',k),'D'),dur:.6,vel:.32,ratio:3.5,trem:5,when:now+.005+j*.075})); return true; }
  return false; }
M.piece({ id:'L-42',
  caption:'One large globe of dots, lit from one side: its latitudes are Mir’s rings, and each ring’s knot sounds as it crosses the meridian. Drag to turn it by hand, or change how settled it is, the light and the lattice.',
  alt:'A large sphere drawn in fine ink dots on white, larger dots in shadow and tiny ones in the light, inside a graduated meridian ring with a vertical line. Seven latitude rings are drawn as denser dots, the equator in red; each ring has one heavier knot. At left, a table of rings and notes and a small dot score.',
  recipe:{
    idea:'The globe is the field in the round: its rings are latitudes, and turning it plays them, so rotation becomes a melody.',
    marks:['ring','center','stray','dot'],
    ground:'paper',
    accent:'the equator, red: the third, where the two of you meet',
    composition:'A title block and the ring table at left, the dot score below it; the globe right of center inside a graduated meridian ring, the meridian line vertical through its face.',
    motion:'At 76 BPM one turn is two bars; each knot crosses the meridian on its beat and its ring brightens as it sounds; loose, the rings drift off their latitudes and strays orbit. Drag to turn (it snaps to the eighth note on release). Reduced motion shows the still.',
    sound:'Each ring’s knot sounds its chord tone as it crosses the meridian: a slow arpeggio up the rings, or golden-angle order on the Fibonacci lattice. The equator is the third. Light sets tone and pan; loose, the knots slip and the chord hangs suspended.',
    controls:['Settled 0–100%','Light (upper left, top, right, rim)','Lattice (lat-long, Fibonacci)','drag to turn'],
    computed:['orthographic globe; dot radius from Lambert light and limb, ink sized by shadow','Fibonacci lattice: z = 1 − 2(i + ½)/N, longitude i·137.5°','crossing times from each knot’s longitude and the turn rate'],
    placeholder:['knot positions','the chord progression'],
    root:'Halftone engraving (Meisenbach, 1882; Ives, 1880s): tone made by the size of dots on a ruled screen',
    rules:['the meridian line is fixed; only the globe turns','the knots sound only when they cross it'],
    engine:['M.Buf','M.text','M.hash2','M.music','M.music.env']},
  aspect:w=>w/lay42(w).H,
  state:{k:1,light:'ul',lat:'ll',yaw:0},
  controls:[{id:'k',type:'range',label:'Settled',min:0,max:1,step:.01,fmt:v=>Math.round(v*100)+'%'},
    {id:'light',type:'select',label:'Light',options:[{value:'ul',label:'Upper left'},{value:'top',label:'Top'},{value:'right',label:'Right'},{value:'rim',label:'Rim'}]},
    {id:'lat',type:'select',label:'Lattice',options:[{value:'ll',label:'Lat-long'},{value:'fib',label:'Fibonacci'}]}],
  loop:true, touchAction:'pan-y',
  music:i_music42, musicParam:i_param42, musicIns:'mallet',
  pointer(st,e){ const L=lay42(e.w), s=i_S(st); if(e.type==='down'){ if(Math.hypot(e.x-L.cx,e.y-L.cy)>L.R*1.1) return false; s.drag={x:e.x,yaw:st.yaw}; return false; }
    if(e.type==='move'&&s.drag){ const ny=s.drag.yaw+(e.x-s.drag.x)/L.R, oy=st.yaw; st.yaw=ny;
      /* the globe as an instrument: a knot that crosses the meridian under your hand sounds now */
      const a=i_live(); if(a){ const mu=M.music, md=mu.groundMode('paper'); for(let k=0;k<7;k++){ const ph=y=>{ let d=((i_bead42(st,k)+y)%TAU+TAU)%TAU; return d>Math.PI?d-TAU:d; }, p0=ph(oy), p1=ph(ny);
        if(Math.abs(p0)<1.2&&Math.abs(p1)<1.2&&Math.sign(p0)!==Math.sign(p1)) try{ a.play('L-42',st.lat==='fib'?'bell':'mallet',{freq:mu.hz(i_pitch42(md,st.k<.5&&k===3?'Dsus4':'D',k),'D'),dur:1.2,vel:.42,trem:5,ratio:3.5,pan:(k-3)*.1}); }catch(_){} } }
      return true; }
    if(e.type==='up'&&s.drag){ s.drag=null; st.yaw=Math.round(st.yaw/(TAU/16))*(TAU/16); return true; } return false; },
  render(g,w,h,M,st){ i_blit(g,i_base42(st,w,h)); i_draw42(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ t=Math.max(0,t); i_blit(g,i_base42(st,w,h)); if(i_RM()){ i_draw42(g,w,h,st,null); return false; } i_draw42(g,w,h,st,t); return t<CUE42; } });

/* ════════════════════════════════════════════════════════════════════════
   L-43 · The field is the sequencer (after Sonic Atlas: the landscape is the sequencer). Mir's field unrolled as five ridges, one per
   ring, back to front. A playhead crosses left to right; each peak it meets is a note: the ridge is the voice, the height is the pitch
   on the ground's mode, snapped to the chord at that step, so there are no wrong notes. Draw on a ridge to raise a peak.
   ════════════════════════════════════════════════════════════════════════ */
const T43='The field is the sequencer';
const SUB43='Five rings unrolled into ridges. The playhead reads each peak as a note; height is pitch. Draw on a ridge to add one.';
const ROOT43='Root · Ki Sonic Atlas: the landscape is the sequencer. Also the player-piano roll, c. 1900.';
const GR43={night:{pal:'night',name:'Night · Dorian'},paper:{pal:'paper',name:'Paper · Ionian'},olive:{pal:'olive',name:'Olive · Mixolydian'},plum:{pal:'plum',name:'Plum · Aeolian'},cobalt:{pal:'cobalt',name:'Cobalt · Lydian'}};
/* voices, back (top) to front (bottom): register offset in scale degrees, octave, instrument */
const V43=[{n:'bell',lo:7,oct:4,ins:()=>'bell'},{n:'mallet',lo:3,oct:4,ins:()=>'mallet'},{n:'lead',lo:-3,oct:4,ins:()=>'ober'},{n:'comp',lo:0,oct:3,ins:()=>i_ins('rhodes','pluck')},{n:'bass',lo:0,oct:2,ins:()=>i_ins('ebass','pluck')}];
const N43=16, HMAX43=7;
const DEF43=[[4,0,0],[4,3,0],[4,4,5],[4,7,4],[4,8,3],[4,11,3],[4,12,4],[4,14,4],[3,2,2],[3,6,2],[3,10,2],[3,14,3],[2,0,0],[2,1,3],[2,2,5],[2,6,4],[2,8,3],[2,10,5],[2,11,7],[2,13,5],[1,4,4],[1,5,5],[1,12,6],[0,7,7],[0,15,5]];
const i_col43=st=>{ const P=M.PAL[GR43[st.ground].pal]; return {ground:P.ground, ink:P.ink, soft:i_mix(P.ground,P.ink,.56), dim:i_mix(P.ground,P.ink,.3), faint:i_mix(P.ground,P.ink,.14), acc:st.ground==='plum'?'#e3283a':st.ground==='cobalt'?P.center:P.center}; };
const lay43=i_memo(function(w){ const T=i_T(w,SUB43,560,640), o=Object.assign({},T), {ph,pad,inner}=T;
  o.x0=pad+(ph?48:84); o.x1=pad+inner-(ph?6:12); o.sw=(o.x1-o.x0)/N43; o.top=T.top+(ph?40:30); o.gap=ph?54:Math.min(84,w*.062); o.unit=o.gap*.21; o.base=[0,1,2,3,4].map(v=>o.top+o.gap*(v+1.2)); o.axY=o.base[4]+24;
  o.H0=o.axY+(ph?52:56); o.root=i_wrap(ROOT43,inner,i_ROOT); o.rootY=o.H0; o.H=i_q(o.rootY+(o.root.length-1)*14+pad); return o; });
/* the mode's diatonic triad on degree d (as a chord symbol), stepping down past a diminished one */
function i_tri43(md,d){ const mu=M.music; for(let k=0;k<3;k++){ const dd=d-k, r=mu.deg(md,dd,3), i3=mu.deg(md,dd+2,3)-r, i5=mu.deg(md,dd+4,3)-r; if(i5===7) return mu.name(r).replace(/-?\d+$/,'')+(i3===3?'m':''); } return 'D'; }
const i_prog43=md=>[0,5,3,4].map(d=>i_tri43(md,d));
const i_md43=st=>M.music.groundMode(st.ground);
const i_bpm43=st=>Math.round(st.tempo/2)*2, i_st43=st=>60000/i_bpm43(st)/2;
/* the pitch of a peak: degree h on the voice's ladder, snapped to the chord at its step */
function i_pitch43(st,v,step,h){ const mu=M.music, md=i_md43(st), V=V43[v], sym=i_prog43(md)[Math.floor(step/4)], m=mu.deg(md,V.lo+h,V.oct); return {m:mu.snap(sym,m),sym}; }
function i_prof43(L,st,v){ const ns=st.notes.filter(n=>n[0]===v), wd=L.sw*.42, R=M.rng(4300+v);
  return x=>{ let y=0; for(const n of ns){ const cx=L.x0+(n[1]+.5)*L.sw, d=(x-cx)/wd; if(d>-4&&d<4) y=Math.max(y,(n[2]+1)*L.unit*Math.exp(-d*d)); } return y+L.unit*.35*(.5+.5*Math.sin(x*.021+v*1.9))*(.6+.4*M.noise(x*.012,v,43)); }; }
function i_land43(st,w,h){ return i_slot('land43',i_DK(w,h)+'|'+st.ground+'|'+JSON.stringify(st.notes),()=>{ const L=lay43(w), C=i_col43(st), {cv,g}=i_off(w,h), B=new M.Buf(g);
  M.fill(g,C.ground); i_title(g,L,L.ph?'L-43 · Concept':'L-43 · Concept · the landscape is the sequencer',GR43[st.ground].name,T43,C.ink,C.soft);
  const P=[0,1,2,3,4].map(v=>i_prof43(L,st,v)), crest=(v,x)=>L.base[v]-P[v](x);
  /* back to front; a dot is hidden below any nearer ridge's crest */
  for(let v=0;v<5;v++){ const near=x=>{ let m=1e9; for(let u=v+1;u<5;u++) m=Math.min(m,crest(u,x)); return m; }, R=M.rng(4310+v), dp=L.ph?1.5:1.9;
    /* the crest: an engraved line */ for(let x=L.x0-L.sw*.5;x<=L.x1+L.sw*.2;x+=dp*.55){ const y=crest(v,x)+R.gauss()*.35; if(y>near(x)-1) continue; B.dot(x,y,L.ph?.62:.74,C.ink); }
    /* the slope: tone that thins with depth below the crest */
    for(let x=L.x0-L.sw*.5;x<=L.x1+L.sw*.2;x+=dp){ const c=crest(v,x), nr=near(x), bot=Math.min(nr-1.5,L.base[v]+L.gap*.5); for(let y=c+dp;y<bot;y+=dp){ const u=(y-c)/(L.base[v]+L.gap*.5-c); if(R()<.62*Math.pow(1-u,1.6)) B.dot(x+(R()-.5)*dp*.8,y,(L.ph?.5:.56),u<.3?C.soft:C.dim); } } }
  B.flush();
  /* the grid: steps, bars, voices */ const B2=new M.Buf(g); for(let s=0;s<=N43;s++){ const x=L.x0+s*L.sw, bar=s%8===0, beat=s%2===0; for(let k=0;k<(bar?6:beat?3:1);k++) B2.dot(x,L.axY+k*2.2,.55,bar?C.ink:C.soft); } B2.flush();
  for(let s=0;s<N43;s+=L.ph?4:2) i_lab(g,String(s+1),L.x0+(s+.5)*L.sw,L.axY+(L.ph?22:24),C.soft,8.5,{align:'center'});
  const md=i_md43(st), pr=i_prog43(md); pr.forEach((c,i)=>M.text(g,c,L.x0+i*4*L.sw+2,L.top-(L.ph?14:10),{font:'mono',size:10,weight:500,track:.04,color:C.soft}));
  V43.forEach((V,v)=>i_lab(g,V.n,L.pad,L.base[v]+3,C.soft,L.ph?7.5:9,L.ph?{track:.06}:{}));
  i_root(g,L.root,L.pad,L.rootY,C.soft); return cv; }); }
function i_draw43(g,w,h,st,t){ const L=lay43(w), C=i_col43(st), B=new M.Buf(g), stp=i_st43(st), P=[0,1,2,3,4].map(v=>i_prof43(L,st,v));
  /* peaks: a note head at each apex; the third of the chord in red; each flashes as it sounds */
  for(const n of st.notes){ const [v,s,hh]=n, x=L.x0+(s+.5)*L.sw, y=L.base[v]-P[v](x), p=i_pitch43(st,v,s,hh), third=((p.m-M.music.parse(p.sym).pcs[0]-((M.music.parse(p.sym).iv[1])))%12+12)%12===0, e=i_qe(i_e(st,'p'+v+'_'+s,t,220)), col=third?C.acc:C.ink;
    B.dot(x,y-3-e*3,(L.ph?1.4:1.8)*(1+.8*e),col); if(e>.05||third) M.ring(B,{cx:x,cy:y-3-e*3,R:(L.ph?3.4:4.6)*(1+.9*e),w:.8,swell:.1,dpl:1.6,rCore:.6,rEdge:.5,seed:4330+s,color:col});
    if(e>.1){ const R=M.rng(4340+s+v*16); for(let k=0;k<Math.round(26*e);k++){ const dx=R.gauss()*L.sw*.25, yy=L.base[v]-P[v](x+dx); B.dot(x+dx,yy+R()*L.unit*1.2,.62,col); } } }
  /* the playhead */
  if(t!=null){ const x=L.x0+((t/stp)%N43)*L.sw; for(let y=L.top-4;y<=L.axY+8;y+=2.2) B.dot(x,y,.55,C.ink); B.dot(x,L.axY+10,2,C.ink); }
  B.flush(); }
/* music · L-43. The landscape is the score: sixteen eighth notes (two bars of 4/4), looped. Each peak is a note on its ridge's
   instrument (bell, mallet, lead, comp, bass), its height a degree of the ground's mode in that voice's register, snapped to the
   chord of its half bar (I, vi, IV, V built from the mode), so every peak belongs. Peaks that land on the chord's third are red.
   Under it, a pad holds each chord and a brush or hat keeps the eighths. Tempo is the playhead's speed. */
function i_music43(st){ const mu=M.music, md=i_md43(st), S=mu.score({bpm:i_bpm43(st),meter:[4,4],ground:GR43[st.ground].pal==='cobalt'?'cobalt':st.ground}), E8=S.beat/2, pr=i_prog43(md);
  S.harm(pr.map((c,i)=>[i*4*E8,c])); pr.forEach((c,i)=>S.chord(i*4*E8,'pad',mu.voice(c,'A3','A4',3),4*E8*.95,{attack:.25,release:.5,cutoff:900,vel:.2}));
  const kit=i_ins('brush','hat'); for(let s=0;s<N43;s++) S.hitSound(s*E8,kit,{vel:s%4===0?.2:s%2?.09:.13,decay:.03});
  for(const [v,s,hh] of st.notes){ const p=i_pitch43(st,v,s,hh), nx=st.notes.filter(n=>n[0]===v&&n[1]>s).reduce((a,n)=>Math.min(a,n[1]),N43), len=Math.min(nx-s,v===4?2:3)*E8*.9, ins=V43[v].ins();
    const opt=v===0?{ratio:3.5,bright:.9,vel:.3}:v===1?{trem:5,vel:.38}:v===2?{vel:.38,cutoff:1500,vibrato:8}:v===3?{vel:.36,cutoff:900}:{vel:.5,cutoff:420};
    opt.pan=((s+.5)/N43-.5)*.7; S.note(s*E8,ins,p.m,len,opt,['p'+v+'_'+s,1]); }
  S.end(N43*E8); return i_gain(S.out(),1.6); }
function i_param43(A,st,id,ov,nv){ const now=A.now(); if(!now) return true;
  if(id==='tempo'){ if(!i_ok(st,'pt',160)) return true; const e8=30/(Math.round(+nv/2)*2); for(let k=0;k<4;k++) A.play(i_ins('brush','hat'),{vel:k?.1:.2,decay:.03,when:now+.005+k*e8}); return true; }
  return false; }
function i_hit43(L,st,x,y){ const s=Math.max(0,Math.min(N43-1,Math.floor((x-L.x0)/L.sw))); let v=-1, best=1e9; for(let k=0;k<5;k++){ const d=y<=L.base[k]+L.gap*.3?Math.abs(L.base[k]-L.unit*3-y):1e9; if(d<best&&y<=L.base[k]+L.gap*.3){ best=d; v=k; } }
  if(v<0) v=4; const hh=Math.max(0,Math.min(HMAX43,Math.round((L.base[v]-y)/L.unit-1))); return {v,s,hh}; }
function i_sound43(st,v,s,hh){ const a=i_live(); if(!a) return; const p=i_pitch43(st,v,s,hh); try{ a.play('L-43',V43[v].ins(),{freq:M.music.hz(p.m,p.sym),dur:.45,vel:.45,trem:5,ratio:3.5,cutoff:v===4?420:1400}); }catch(_){} }
M.piece({ id:'L-43',
  caption:'Mir’s field unrolled into five ridges: a playhead reads each peak as a note, the ridge is the instrument and the height is the pitch. Press on a ridge to raise a peak, drag to set its height, or change the tempo and ground.',
  alt:'Five stippled ridges stacked from back to front across the width, each with a few peaks topped by small note heads, some red. A dotted vertical playhead crosses them; step numbers run along the bottom and chord names along the top.',
  recipe:{
    idea:'The field is an instrument: its rings, unrolled, are voices, and every peak on them is a note that belongs to the chord.',
    marks:['ring','dot','center'],
    ground:'night, paper, olive, plum, cobalt (each a mode)',
    accent:'peaks that sound the chord’s third, red: where the two of you meet',
    composition:'A title block, then five ridges across the width from back (top) to front (bottom), voice names at left, chords above, step numbers below.',
    motion:'The playhead walks sixteen eighth notes at the tempo and loops; each peak it meets flashes and sheds a few dots down its slope as its note sounds. Reduced motion shows the landscape without the playhead.',
    sound:'Each peak is a note: bell, mallet, lead, comp and bass from back to front, height a degree of the mode, snapped to the chord of its half bar (I, vi, IV, V), so nothing is wrong. A pad holds the chords; a brush keeps the eighths.',
    controls:['Tempo 70–140 BPM','Ground (Night, Paper, Olive, Plum, Cobalt: the mode)','Clear','press or drag on a ridge'],
    computed:['ridge profile: the max of a Gaussian per peak plus a low ring wave','occlusion: a dot hides below any nearer ridge’s crest','pitch: mode degree in the voice’s register, snapped to the nearest chord tone'],
    placeholder:['the starting composition'],
    root:'Ki Sonic Atlas (J. Compton): “the landscape is the sequencer”; the player-piano roll (c. 1900)',
    rules:['no wrong notes: every pitch snaps to the chord','red only on the third'],
    engine:['M.Buf','M.ring','M.noise','M.music','M.music.env']},
  aspect:w=>w/lay43(w).H,
  state:{ground:'night',tempo:104,notes:DEF43},
  controls:[{id:'tempo',type:'range',label:'Tempo',min:70,max:140,step:2,fmt:v=>v+' BPM'},
    {id:'ground',type:'select',label:'Ground',options:Object.keys(GR43).map(k=>({value:k,label:GR43[k].name}))},
    {id:'clear',type:'button',label:'Clear',run:st=>{ st.notes=[]; }}],
  loop:true, touchAction:'none',
  music:i_music43, musicParam:i_param43, musicIns:'mallet',
  pointer(st,e){ const L=lay43(e.w), s=i_S(st); if(e.y<L.top-10||e.y>L.axY+6||e.x<L.x0-4||e.x>L.x1+4){ if(e.type==='up') s.ed=null; return false; }
    if(e.type==='down'){ const q=i_hit43(L,st,e.x,e.y); st.notes=st.notes.filter(n=>!(n[0]===q.v&&n[1]===q.s)).concat([[q.v,q.s,q.hh]]); s.ed={v:q.v,s:q.s,hh:q.hh}; i_sound43(st,q.v,q.s,q.hh); return true; }
    if(e.type==='move'&&s.ed){ const hh=Math.round((L.base[s.ed.v]-e.y)/L.unit-1); const n=st.notes.find(n=>n[0]===s.ed.v&&n[1]===s.ed.s);
      if(hh<0){ if(n){ st.notes=st.notes.filter(x=>x!==n); s.ed.hh=-1; return true; } return false; }
      const c=Math.min(HMAX43,hh); if(c!==s.ed.hh){ if(n) n[2]=c; else st.notes.push([s.ed.v,s.ed.s,c]); s.ed.hh=c; i_sound43(st,s.ed.v,s.ed.s,c); return true; } return false; }
    if(e.type==='up'){ s.ed=null; } return false; },
  render(g,w,h,M,st){ i_blit(g,i_land43(st,w,h)); i_draw43(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ t=Math.max(0,t); i_blit(g,i_land43(st,w,h)); if(i_RM()){ i_draw43(g,w,h,st,null); return false; } i_draw43(g,w,h,st,t); return t<N43*i_st43(st); } });

/* fbm: a few octaves of the engine's value noise, for masks that make a gestalt (clouds of density, worn edges, grain) */
function i_fbm(x,y,s,oct){ let v=0, a=.5, f=1, n=0; for(let i=0;i<(oct||4);i++){ v+=a*M.noise(x*f,y*f,(s||0)+i*17); n+=a; a*=.5; f*=2.03; } return v/n; }
/* a tiling fbm texture (256², periodic by construction of the lookup) for per-dot masks that must be cheap inside a frame */
let i_FT=null; function i_ft(x,y){ if(!i_FT){ i_FT=new Float32Array(65536); for(let j=0;j<256;j++) for(let i=0;i<256;i++){ const a=i/256*TAU, b=j/256*TAU; i_FT[j*256+i]=i_fbm(3+Math.cos(a)*2.2+Math.sin(b)*.7,3+Math.sin(a)*2.2+Math.cos(b)*1.9,91,4); }
    let lo=1,hi=0; for(const v of i_FT){ lo=Math.min(lo,v); hi=Math.max(hi,v); } for(let k=0;k<65536;k++) i_FT[k]=(i_FT[k]-lo)/(hi-lo); }
  return i_FT[((y|0)&255)*256+((x|0)&255)]; }

/* ════════════════════════════════════════════════════════════════════════
   L-44 · Listening landscape (after Ki Soundscape, in Mir's language). A full-bleed landscape of ring ridges travels toward the field,
   which rises at the horizon like a sun, while a composed 30-second cue plays. Each band of the cue drives its own region:
   bass swells the near ridges, mid lights the middle distance, treble makes the strays shimmer; the journey's speed follows bass + RMS.
   The bands are read from the score itself (M.music.bands), so the picture and the music agree with sound on or off.
   ════════════════════════════════════════════════════════════════════════ */
const BPM44=96, BT44=625, BAR44=2500, NB44=12, CUE44=NB44*BAR44;
const GR44={night:{pal:'night'},olive:{pal:'olive'},plum:{pal:'plum'},paper:{pal:'paper'}};
const i_col44=st=>{ const P=M.PAL[GR44[st.ground].pal]; return {ground:P.ground, ink:P.ink, soft:i_mix(P.ground,P.ink,.55), dim:i_mix(P.ground,P.ink,.3), faint:i_mix(P.ground,P.ink,.16), acc:st.ground==='plum'?'#e3283a':P.center, tint:P.blade}; };
const lay44=i_memo(function(w){ const ph=w<640, H=Math.round(ph?w*1.32:w*9/16); return {ph,w,H,pad:ph?16:28,hz:H*(ph?.4:.43),cx:w*.5}; });
/* the journey: integral of speed = base + React·(bass + RMS), from the score's own bands, at 60 Hz */
function i_jr44(st){ const sc=st._mus; if(!sc) return null; const key='jr'+st.react; if(sc._jr&&sc._jr.key===key) return sc._jr; const n=Math.ceil(sc.dur/1000*60)+2, J=new Float32Array(n); let j=0;
  for(let i=0;i<n;i++){ const b=M.music.bands(st,i*1000/60), v=.55+st.react*(1.5*b.bass+1.1*b.rms); j+=v/60; J[i]=j; } const o={key,J}; try{ Object.defineProperty(sc,'_jr',{value:o,writable:true,configurable:true,enumerable:false}); }catch(_){ sc._jr=o; } return o; }
function i_ridge44(xw,r){ const a=Math.abs(xw), valley=.12+.88*M.ss(.3,3.2,a), f=i_fbm(xw*.42+r*3.1,r*.53,44,4); return valley*(1.25*Math.pow(f,1.7)+.22*(.5+.5*Math.sin(xw*1.3+r*2.3))+.1*M.noise(xw*3.2,r,45)); }
/* each ridge's profile, tabulated once for its life on screen (xw in [−24, 24] at 0.012) */
const i_RT44=new Map(); function i_rt44(r){ let a=i_RT44.get(r); if(a) return a; if(i_RT44.size>140) i_RT44.clear(); a=new Float32Array(4001); for(let i=0;i<=4000;i++) a[i]=i_ridge44(-24+i*.012,r); i_RT44.set(r,a); return a; }
const i_rv44=(a,xw)=>{ const u=(xw+24)/.012, i=Math.max(0,Math.min(3999,u|0)), f=u-i; return a[i]+(a[i+1]-a[i])*f; };
function i_draw44(g,w,h,st,t){ const L=lay44(w), C=i_col44(st), W=w, H=h, ph=L.ph, B=new M.Buf(g); M.fill(g,C.ground);
  const T=t==null?CUE44*.55:t, bd=t==null?{bass:.35,mid:.4,treble:.3,rms:.4}:M.music.bands(st,T), re=st.react, jr=i_jr44(st);
  const J=jr&&t!=null?jr.J[Math.min(jr.J.length-1,Math.floor(T/1000*60))]:T/1000*.9;
  const hz=L.hz, F=W*.62, dn=1.15, DZ=.5, N=ph?34:44, Kg=(H*1.04-hz)*dn, Kh=(H-hz)*dn*1.05, cw=ph?1.6:2, nc=Math.ceil(W/cw)+1, occ=new Float32Array(nc).fill(H+40);
  /* the field rising at the horizon: rings around a red center, behind the ridges */
  const sx=L.cx, sy=hz-H*(ph?.035:.045), emel=i_qe(i_e(st,'mel',t,260)), elock=i_e(st,'lock',t,900);
  /* ridges, near to far, through a floating horizon (a dot shows only above everything nearer) */
  const Jr=J/DZ, fr=Jr%1, r0=Math.floor(Jr);
  for(let i=0;i<N;i++){ const r=r0+i, d=dn+(i-fr)*DZ, tab=i_rt44(r); if(d<.6) continue; const z=cl((d-dn)/((N-1)*DZ)), near=1-M.ss(0,.35,z), midw=Math.exp(-Math.pow((z-.38)/.2,2));
    const amp=Kh/d*(1+re*1.7*bd.bass*near), y0=hz+Kg/d, sp=cw*(z<.25?2:1), rr=(ph?.48:.56)+(ph?.28:.42)*(1-z), lit=cl(.35+.65*(1-z)*.7+re*.9*bd.mid*midw);
    const crest=lit>.8?C.ink:i_mix(C.ground,C.ink,.25+.75*lit), fillc=i_mix(C.ground,C.ink,.12+.35*lit), R=M.rng(4400+((r%997)+997)%997);
    for(let c=0;c<nc;c++){ const x=c*cw, xw=(x-L.cx)*d/F, y=y0-amp*i_rv44(tab,xw); if(y>=occ[c]) continue;
      if(c%(sp/cw)===0){ /* the crest, worn by an fbm mask so it reads drawn, not plotted */ const wear=i_ft(x*.35,r*7.3); if(wear>.28||z<.15) B.dot(x+R.gauss()*.25,y+R.gauss()*.35,rr*(.75+.45*wear),crest);
        /* the slope: tone below the crest, thinning with depth, clumped by fbm */ const depth=Math.min(occ[c]-y,Math.min(150,(Kh/d)*.5)), n=Math.floor(depth/(sp*1.7));
        for(let k=1;k<=n;k++){ const u=k/n, yy=y+u*depth+(R()-.5)*sp, m=i_ft(x*.6+r*13,yy*.6); if(R()<(.6-.55*u)*(.2+1.1*m)) B.dot(x+(R()-.5)*sp*1.2,yy,rr*.8,u<.22?crest:fillc); } }
      occ[c]=y; } }
  /* the sky: the field's rings around the center, only above the land; strays shimmer with the treble */
  for(let k=1;k<=7;k++){ const Rk=H*(ph?.045:.055)*k*(1+.04*emel), Rr=M.rng(4450+k), n=Math.round(TAU*Rk*.5);
    for(let j=0;j<n;j++){ const a=(j+Rr())/n*TAU, wob=1+.012*Math.sin(a*3+k)+Rr.gauss()*.004, x=sx+Math.cos(a)*Rk*wob, y=sy+Math.sin(a)*Rk*wob*.92; const c=Math.round(x/cw); if(c<0||c>=nc||y>=occ[c]-1) continue;
      const m=i_fbm(x*.012,y*.012,48,3); if(Rr()>.35+.6*m) continue; B.dot(x,y,(ph?.5:.58)*(1+.5*emel*(k<4?1:.5)),k%2?C.soft:C.dim); } }
  { const cR=H*.016*(1+.25*elock), Rr=M.rng(4460), n=Math.round(TAU*cR*1.6); for(let j=0;j<n;j++){ const a=(j+Rr())/n*TAU, x=sx+Math.cos(a)*(cR+Rr.gauss()*.6), y=sy+Math.sin(a)*(cR+Rr.gauss()*.6); const c=Math.round(x/cw); if(c>=0&&c<nc&&y<occ[c]-1) B.dot(x,y,.62,C.acc); } }
  { const Rr=M.rng(4470), ns=ph?60:110, sh=re*bd.treble; for(let j=0;j<ns;j++){ let x=Rr()*W, y=Rr()*hz*.92; const ph0=Rr()*TAU, jx=Math.sin(T*.011+ph0)*sh*5, jy=Math.cos(T*.013+ph0)*sh*3, r=(.5+.6*Rr())*(1+1.2*sh*Rr()); x+=jx; y+=jy;
      if(Math.hypot(x-sx,y-sy)<H*.4&&Rr()<.6) continue; B.dot(x,y,r,Rr()<.12+.4*sh?C.ink:C.soft); } }
  /* grain: a faint fbm-masked dust over the ground, so the plate feels printed */
  { const Rr=M.rng(4480), n=ph?900:1800; for(let j=0;j<n;j++){ const x=Rr()*W, y=Rr()*H, m=i_fbm(x*.006,y*.006,49,3); if(Rr()>m*m*1.2) continue; B.dot(x,y,.42,C.faint); } }
  B.flush();
  /* type: label, title, band meters, the wordmark */
  const pad=L.pad; i_lab(g,ph?'L-44 · Concept':'L-44 · Concept · a landscape that listens',pad,ph?24:30,C.ink,ph?9:9.5);
  M.text(g,'Listening landscape',pad-1,ph?60:80,Object.assign(i_dispO(ph?26:40),{color:C.ink}));
  const rows=[['bass',bd.bass,'near ridges'],['mid',bd.mid,'distance'],['treble',bd.treble,'strays'],['rms',bd.rms,'speed']], mx=ph?pad:W-pad-(ph?0:236), my=ph?(ph?86:0):pad+38, B2=new M.Buf(g);
  rows.forEach(([n,v,what],i)=>{ const y=my+i*(ph?14:16); i_lab(g,n,mx,y+3,C.ink,8.5); for(let k=0;k<12;k++){ const on=k<Math.round(v*12); B2.dot(mx+(ph?46:52)+k*6,y,on?1.5:.6,on?C.ink:C.soft); } if(!ph) i_lab(g,what,mx+132,y+3,C.soft,8.5); });
  B2.flush(); const tm=Math.floor(T/1000); i_lab(g,'0:'+String(tm).padStart(2,'0')+' / 0:30 · react '+Math.round(re*100)+'%',ph?pad:W-pad,ph?H-pad:pad+14,C.soft,8.5,ph?{}:{align:'right'});
  const lx=ph?8:11, lw=M.logoGeo(0,0,lx).w; M.logo(g,W-pad-lw,H-pad,lx,{color:C.ink}); }
/* music · L-44. A 30-second cue at 96 BPM, 12 bars, in the ground's mode: diatonic sevenths moving IV iii ii V | I vi ii V | IV iii ii–V |
   I, so it lifts and lands. Keys comp on the off-beats, a bass walks the roots and fifths, a shaker and brushes keep it loose; the lead
   enters on bar 5 with the motif (5 ↑ 1 ↑ 3) and answers itself; on the last bar the third arrives with the low bass, once.
   Played on the warmest palette the engine has (rhodes, ebass, brush, conga, strings when present). */
function i_sev44(md,d){ const mu=M.music; for(let k=0;k<3;k++){ const dd=d-k, r=mu.deg(md,dd,3), i3=mu.deg(md,dd+2,3)-r, i5=mu.deg(md,dd+4,3)-r, i7=mu.deg(md,dd+6,3)-r; if(i5!==7) continue;
    const q=i3===4&&i7===11?'maj7':i3===3&&i7===10?'m7':i3===4&&i7===10?'7':i3===3?'m':''; return mu.name(r).replace(/-?\d+$/,'')+q; } return 'D'; }
const PROG44=[3,2,1,4, 0,5,1,4, 3,2,1,0];
const MEL44=[[4,0,-3,.5],[4,.5,0,.5],[4,1,2,2],[4,3,4,1],[5,0,5,1.5],[5,1.5,4,.5],[5,2,2,2],[6,0,1,.5],[6,.5,2,.5],[6,1,4,1],[6,2,6,1],[6,3,5,1],[7,0,4,3],[7,3.5,2,.5],
  [8,0,7,1.5],[8,1.5,6,.5],[8,2,4,2],[9,0,2,1],[9,1,4,1],[9,2,5,2],[10,0,4,1],[10,1,3,1],[10,2,1,1],[10,3,-1,1]];
function i_music44(st){ const mu=M.music, S=mu.score({bpm:BPM44,meter:[4,4],ground:GR44[st.ground].pal}), md=S.mode, home=md==='dorian'||md==='aeolian'?'Dm':'D';
  const prog=PROG44.map((d,i)=>i===NB44-1?home:i_sev44(md,d)); const harm=[]; prog.forEach((c,i)=>harm.push([i*BAR44,c])); harm.splice(11,0,[10*BAR44+2*BT44,i_sev44(md,4)]); S.harm(harm);
  const keys=i_ins('rhodes','mallet'), bassI=i_ins('ebass','pluck'), shk=i_ins('shaker','hat'), br=i_ins('brush','snap'), cg=i_ins('conga','tap'), str=i_ins('strings','pad');
  let prev=null;
  harm.forEach(([t0,c],i)=>{ const t1=i<harm.length-1?harm[i+1][0]:CUE44, len=t1-t0, last=i===harm.length-1;
    S.chord(t0,str,mu.voice(c,'A3','A4',3),len*.98,{attack:last?.9:.5,release:last?1.6:.6,cutoff:last?1500:1000,vel:last?.3:.2});
    /* keys: a chord on the one, then off-beat stabs */ const v=mu.voice(c,'D4','D5',4,prev); prev=v;
    [[0,1.2],[1.5,.5],[2.5,.9]].forEach(([b,du],k)=>{ const tt=t0+b*BT44; if(tt>=t1-30) return; S.chord(tt,keys,v,Math.min(du*BT44,t1-tt-20),{vel:k?.24:.3,trem:4.5,over:c},['cp',.6]); });
    /* bass from bar 3: root, root, fifth, octave */ if(t0>=2*BAR44&&!last){ const rt=mu.ct(c,'A1',0), f5=mu.ct(c,rt+1,1)===rt+7?rt+7:mu.ct(c,rt+1,1);
      [[0,rt,.9],[1.5,rt,.4],[2.5,f5,.4],[3,rt+12,.8]].forEach(([b,m,du])=>{ const tt=t0+b*BT44; if(tt<t1-40) S.note(tt,bassI,mu.ct(c,m,0),du*BT44,{vel:.5,cutoff:480,over:c},['bs',1]); }); } });
  /* rhythm: shaker 16ths from bar 3, brushes on 2 and 4 from bar 5, conga answers in bars 9–11 */
  for(let b=2;b<NB44;b++) for(let s=0;s<16;s++){ const tt=b*BAR44+s*BT44/4; if(b===NB44-1&&s>4) break; S.hitSound(tt,shk,{vel:(s%4===0?.14:s%2?.07:.1),decay:.025,pan:.35}); }
  for(let b=4;b<NB44-1;b++) [1,3].forEach(k=>S.hitSound(b*BAR44+k*BT44,br,{vel:.22,pan:-.15}));
  for(let b=8;b<NB44-1;b++) [[.75,'open'],[1.5,'mute'],[2.75,'open'],[3.5,'slap']].forEach(([k,s2],j)=>S.hitSound(b*BAR44+k*BT44,cg,{vel:.26,stroke:s2,pan:-.3,freq:j%2?220:190}));
  /* the lead: the motif, then it answers itself; long notes sit on chord tones */
  MEL44.forEach(([b,k,d,du])=>{ const tt=b*BAR44+k*BT44, c=S.chordAt(tt); let m=mu.deg(md,d,4); if(du>=1) m=mu.snap(c,m); S.note(tt,'ober',m,du*BT44*.95,{vel:.36,cutoff:1600,vibrato:10,pan:.12,over:c},['mel',1]); });
  /* arrival: the third, the bass once, a bell */
  const T=(NB44-1)*BAR44; S.note(T,'ober',mu.deg(md,2,4),BAR44*.95,{vel:.4,cutoff:1800,vibrato:12},['mel',1]); S.note(T,'meet',mu.deg(md,2,5),2200,{spread:24,vel:.4},['lock',1]);
  S.note(T,'bass','D2',900,{from:'A1',glide:90,env:2.4,decay:.45,vel:.55},['bs',1]); S.note(T+BT44*2,'bell',mu.deg(md,2,6),1800,{ratio:3.5,vel:.22,pan:.3});
  S.end(CUE44); return i_gain(S.out(),1.2); }
function i_param44(A,st,id,ov,nv){ if(id!=='react') return false; const now=A.now(); if(!now||!i_ok(st,'pr',140)) return true; const mu=M.music, md=mu.groundMode(GR44[st.ground].pal), v=+nv;
  /* React is how much the land listens: more of the band, from the bass up */ [-7,-3,0,2].slice(0,1+Math.round(v*3)).forEach((d,k)=>A.play(k===0?i_ins('ebass','pluck'):i_ins('rhodes','mallet'),{freq:mu.hz(mu.deg(md,d,3),'D'),dur:.5,vel:.36,cutoff:k?2000:480,trem:4.5,when:now+.005+k*.06})); return true; }
M.piece({ id:'L-44',
  caption:'A landscape of ring ridges travels toward the field while a 30-second cue plays: the bass swells the near ridges, the middle band lights the distance, the treble makes the strays shimmer. Change React or the ground, and press Play.',
  alt:'A full-bleed dark landscape of stippled ridges receding to a horizon with a valley in the middle, concentric dotted rings rising behind it like a sun around a small red ring, scattered dots in the sky, small band meters at lower left and the mindgut wordmark at lower right.',
  recipe:{
    idea:'Mir listens the way the landscape does: each part of the picture hears one part of the music.',
    marks:['ring','stray','center','dot'],
    ground:'night, olive, plum, paper',
    accent:'the small ring at the horizon, red: where the two of you meet; it swells as the third arrives',
    composition:'Full bleed: ridges from the bottom edge to a horizon at 43%, a valley leading to the field’s rings rising behind them, strays in the sky, title at top left, meters at lower left, wordmark at lower right.',
    motion:'The ridges travel toward you at a speed set by the bass and RMS; near ridges swell with the bass, the middle distance brightens with the mid band, strays shimmer with the treble, the rings pulse on the lead. Reduced motion shows one still.',
    sound:'A 30-second cue in the ground’s mode: keys comping off the beat, a walking bass, shaker and brushes, a lead that states the motif and answers it, and a last bar where the third arrives with the low bass.',
    controls:['Ground (Night, Olive, Plum, Paper)','React 0–100%','Play'],
    computed:['bands: bass, mid, treble and RMS computed from the score (M.music.bands)','journey = ∫ (0.55 + React·(1.5·bass + 1.1·RMS)) dt','floating horizon: a dot shows only above every nearer ridge'],
    placeholder:['ridge shapes (fbm, seeded)'],
    root:'Ki Soundscape (J. Compton): bass, mid and treble each drive a biome region; the journey follows the music',
    rules:['each band drives its own region','red only at the horizon ring'],
    engine:['M.Buf','M.noise','M.ss','M.logo','M.logoGeo','M.music.bands','M.music.env']},
  aspect:w=>w/lay44(w).H,
  state:{ground:'night',react:.6},
  controls:[{id:'ground',type:'select',label:'Ground',options:[{value:'night',label:'Night'},{value:'olive',label:'Olive'},{value:'plum',label:'Plum'},{value:'paper',label:'Paper'}]},
    {id:'react',type:'range',label:'React',min:0,max:1,step:.01,fmt:v=>Math.round(v*100)+'%'}],
  music:i_music44, musicParam:i_param44, musicIns:'mallet',
  render(g,w,h,M,st){ i_draw44(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ t=Math.max(0,t); if(i_RM()){ i_draw44(g,w,h,st,null); return false; } i_draw44(g,w,h,st,t); return t<CUE44; } });

})();
