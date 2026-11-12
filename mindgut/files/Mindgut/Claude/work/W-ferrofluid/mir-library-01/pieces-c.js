/* agent C pieces · L-11, L-12, L-13, L-14, L-15 · round 3.
   Brand meets Mir at one point: the i's tittle. The wordmark is only ever drawn with M.logo, one flat color, untouched; every
   field here radiates from geo.tittle and knocks out around the letters with M.logoMask. Figures are placed dots; hairline
   M.rule only for plate frames, guides, leaders and UI chrome; flat surfaces only in UI pieces. Type: Geist 300 voice, Geist
   Mono uppercase labels, 4 px baseline (c5q). Animated pieces cache static layers per (w, h, dpr, settings) and redraw only
   the moving dots; the sting rasterises its dots straight into pixels (c5Ras) to stay inside the frame budget.
   Helpers are prefixed c5 so they never collide with agents A, B or D. */
(function(){
'use strict';
const M=window.MIR, TAU=Math.PI*2, E=M.ease, cl=M.clamp01, lerp=M.lerp;
const c5q=v=>Math.round(v/4)*4;
const c5RM=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(_){ return false; } };
const c5rgbC=new Map();
function c5rgb(c){ let v=c5rgbC.get(c); if(v) return v; let s=String(c).replace('#',''); if(s.length===3) s=s.replace(/./g,'$&$&'); const n=parseInt(s,16); v=[(n>>16)&255,(n>>8)&255,n&255]; c5rgbC.set(c,v); return v; }
function c5mix(a,b,t){ const A=c5rgb(a), B=c5rgb(b); return '#'+A.map((x,i)=>Math.round(x+(B[i]-x)*t).toString(16).padStart(2,'0')).join(''); }
/* per-state cache that never enters "Copy settings" (WeakMap on the live state object; Reset makes a new one) */
const c5WM=new WeakMap();
function c5slot(st,name,key,make){ let c=c5WM.get(st); if(!c){ c={}; c5WM.set(st,c); } const s=c[name]; if(s&&s.key===key) return s.v; const v=make(); c[name]={key,v}; return v; }
const c5T=st=>{ let c=c5WM.get(st); if(!c){ c={}; c5WM.set(st,c); } return c; };           /* transient per-state scratch */
const c5dpr=()=>Math.min(3,window.devicePixelRatio||1);
const c5DK=(w,h)=>w+'x'+h+'@'+c5dpr();
function c5off(w,h){ const cv=document.createElement('canvas'); const g=M.canvas(cv,w,h); return {cv,g}; }
function c5blit(g,cv){ g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(cv,0,0); g.restore(); }
let c5ctx=null; const c5m=()=>{ if(!c5ctx){ c5ctx=document.createElement('canvas').getContext('2d'); c5ctx.dpr=1; } return c5ctx; };
const c5lab=(g,s,x,y,c,size=9.5,o={})=>M.text(g,s,x,y,Object.assign({font:'mono',size,weight:500,track:.12,upper:true,color:c},o));
const c5trk=s=>s>=40?-.04:s>=28?-.03:s>=18?-.016:-.004;
const c5disp=(g,s,x,y,size,c,o={})=>M.text(g,s,x,y,Object.assign({font:'display',size,weight:300,track:c5trk(size),color:c},o));
function c5para(g,s,x,y,maxW,o){ const oo=Object.assign({weight:300,track:c5trk(o.size)},o), lines=M.wrap(g,s,maxW,oo), lh=o.lh||c5q(o.size*1.45); lines.forEach((l,i)=>M.text(g,l,x,y+i*lh,oo)); return y+(lines.length-1)*lh; }
const c5paraN=(s,maxW,o)=>M.wrap(c5m(),s,maxW,Object.assign({weight:300},o)).length;
function c5box(g,x0,y0,x1,y1,c){ M.rule(g,x0,y0,x1,y0,c); M.rule(g,x1,y0,x1,y1,c); M.rule(g,x1,y1,x0,y1,c); M.rule(g,x0,y1,x0,y0,c); }
function c5rrPath(g,x,y,w,h,r){ r=Math.min(r,w/2,h/2); g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
function c5rr(g,x,y,w,h,r,fill,stroke){ c5rrPath(g,x,y,w,h,r); if(fill){ g.fillStyle=fill; g.fill(); } if(stroke){ g.strokeStyle=stroke; g.lineWidth=1/g.dpr; g.stroke(); } }
/* point-in-rounded-rect, for clipping dots to icon and screen shapes */
function c5inRR(x,y,X,Y,W,H,r){ if(x<X||y<Y||x>X+W||y>Y+H) return false; const dx=x<X+r?X+r-x:x>X+W-r?x-(X+W-r):0, dy=y<Y+r?Y+r-y:y>Y+H-r?y-(Y+H-r):0; return dx*dx+dy*dy<=r*r; }
/* grounds: the palette's own colors, plus tints mixed from ground → ink (never gray salt) */
function c5pal(k){ const P=M.PAL[k]; return {k,name:P.name,ground:P.ground,ink:P.ink,ring:P.ring,acc:P.center,blade:P.blade,atm:P.soft,
  soft:c5mix(P.ground,P.ink,k==='sky'?.72:.6), dim:c5mix(P.ground,P.ink,.42), tint:c5mix(P.ground,P.ink,.24), hair:c5mix(P.ground,P.ink,.15), lift:c5mix(P.ground,P.ink,.05)}; }
/* a capture sink with the Buf API: engine marks (M.ring, M.blue …) become arrays we can animate */
function c5cap(mask){ return {mask, X:[],Y:[],R:[],C:[], dot(x,y,r,c){ if(this.mask&&this.mask(x,y)) return; this.X.push(x); this.Y.push(y); this.R.push(r); this.C.push(c); }}; }
/* c5Ras: dots written straight into device pixels (anti-aliased discs), one putImageData per frame. Draw type after flush. */
const c5imgC=new Map();
function c5Ras(g,box){ const d=g.dpr, cw=g.canvas.width, ch=g.canvas.height, b=box||[0,0,cw/d,ch/d];
  this.px0=Math.max(0,Math.floor(b[0]*d)); this.py0=Math.max(0,Math.floor(b[1]*d)); this.PW=Math.max(1,Math.min(cw,Math.ceil(b[2]*d))-this.px0); this.PH=Math.max(1,Math.min(ch,Math.ceil(b[3]*d))-this.py0);
  const key=this.PW+'x'+this.PH; let img=c5imgC.get(key); if(!img){ if(c5imgC.size>6) c5imgC.clear(); img=g.createImageData(this.PW,this.PH); c5imgC.set(key,img); }
  this.img=img; this.u=new Uint32Array(img.data.buffer); this.g=g; this.d=d; this.mr=M.minR(g); }
c5Ras.prototype.clear=function(bg){ const c=c5rgb(bg); this.u.fill((0xff000000|(c[2]<<16)|(c[1]<<8)|c[0])>>>0); };
c5Ras.prototype.dot=function(x,y,r,col){ const d=this.d, X=x*d-this.px0, Y=y*d-this.py0, rr=(r<this.mr?this.mr:r)*d, PW=this.PW, PH=this.PH, lim=rr+.5, l2=lim*lim;
  let x0=Math.floor(X-lim), x1=Math.ceil(X+lim), y0=Math.floor(Y-lim), y1=Math.ceil(Y+lim); if(x0<0) x0=0; if(y0<0) y0=0; if(x1>PW-1) x1=PW-1; if(y1>PH-1) y1=PH-1; if(x0>x1||y0>y1) return;
  const C=c5rgb(col), cr=C[0], cg=C[1], cb=C[2], full=(0xff000000|(cb<<16)|(cg<<8)|cr)>>>0, u=this.u;
  for(let yy=y0;yy<=y1;yy++){ const dy=yy+.5-Y, dy2=dy*dy; let o=yy*PW+x0; for(let xx=x0;xx<=x1;xx++,o++){ const dx=xx+.5-X, q=dx*dx+dy2; if(q>=l2) continue; const a=lim-Math.sqrt(q);
    if(a>=1){ u[o]=full; continue; } const p=u[o], R=p&255, G=(p>>8)&255, B=(p>>16)&255; u[o]=(0xff000000|(((B+(cb-B)*a)|0)<<16)|(((G+(cg-G)*a)|0)<<8)|((R+(cr-R)*a)|0))>>>0; } } };
/* dotC: the same disc with the color pre-split (hot loops) */
c5Ras.prototype.dotC=function(x,y,r,C){ const d=this.d, X=x*d-this.px0, Y=y*d-this.py0, rr=(r<this.mr?this.mr:r)*d, PW=this.PW, PH=this.PH, lim=rr+.5, l2=lim*lim;
  let x0=(X-lim)|0, x1=Math.ceil(X+lim), y0=(Y-lim)|0, y1=Math.ceil(Y+lim); if(x0<0) x0=0; if(y0<0) y0=0; if(x1>PW-1) x1=PW-1; if(y1>PH-1) y1=PH-1; if(x0>x1||y0>y1) return;
  const cr=C[0], cg=C[1], cb=C[2], full=C[3], u=this.u, inner=(lim-1)*(lim-1);
  for(let yy=y0;yy<=y1;yy++){ const dy=yy+.5-Y, dy2=dy*dy; let o=yy*PW+x0; for(let xx=x0;xx<=x1;xx++,o++){ const dx=xx+.5-X, q=dx*dx+dy2; if(q>=l2) continue; if(q<=inner){ u[o]=full; continue; } const a=lim-Math.sqrt(q);
    const p=u[o], R=p&255, G=(p>>8)&255, B=(p>>16)&255; u[o]=(0xff000000|(((B+(cb-B)*a)|0)<<16)|(((G+(cg-G)*a)|0)<<8)|((R+(cr-R)*a)|0))>>>0; } } };
const c5C=c=>{ const v=c5rgb(c); return [v[0],v[1],v[2],(0xff000000|(v[2]<<16)|(v[1]<<8)|v[0])>>>0]; };
c5Ras.prototype.flush=function(){ this.g.putImageData(this.img,this.px0,this.py0); };
c5Ras.prototype.snap=function(){ return this.u.slice(); };
c5Ras.prototype.load=function(a){ this.u.set(a); };
/* the wordmark's own alpha (letters only, counters open), sampled at 4× for the don't-thumbnails */
function c5logoA(geo){ const k=4, ox=geo.x-2, oy=geo.top-2, W=Math.ceil((geo.w+4)*k), H=Math.ceil((geo.bottom-geo.top+4)*k), c=document.createElement('canvas'); c.width=W; c.height=H;
  const q=c.getContext('2d'); q.setTransform(k,0,0,k,-ox*k,-oy*k); M.logo(q,geo.x,geo.base,geo.xh,{color:'#000'}); const a=q.getImageData(0,0,W,H).data;
  return (x,y)=>{ const ix=((x-ox)*k)|0, iy=((y-oy)*k)|0; return ix<0||iy<0||ix>=W||iy>=H?0:a[(iy*W+ix)*4+3]/255; }; }
/* rings from the tittle: the field begins at the i. Knockout around the letters comes from the Buf's mask. */
function c5rings(B,geo,o){ const cx=geo.tittle.cx, cy=geo.tittle.cy, step=o.step, Rmax=o.Rmax;
  for(let i=1;i*step<Rmax;i++){ const f=Math.min(1,i/6); M.ring(B,{cx,cy,R:i*step,w:(o.w||1.4)*(.85+.35*f),swell:.5,dpl:(o.dpl||.55),rCore:o.r||.9,rEdge:(o.r||.9)*.55,seed:(o.seed||1)*31+i*7,color:o.color,wobble:o.wobble||0,loose:o.loose||0}); } }
function c5accent(B,geo,o){ const cR=Math.max(geo.tittle.w,geo.tittle.h)*(o.rk||1.05); M.ring(B,{cx:geo.tittle.cx,cy:geo.tittle.cy,R:cR,w:o.w||1.2,swell:.3,dpl:o.dpl||1.5,rCore:o.r||.95,rEdge:(o.r||.95)*.6,seed:o.seed||5,color:o.color,ex:o.ex||1,ey:o.ey||1,rot:o.rot||0}); return cR; }

/* ── music (M2). Each piece composes a score from its own geometry and data with M.music; the frame plays it on the piece's bus
   and drives animate's t from the heard audio clock, and the pictures answer the notes through M.music.env.
   The shared meaning: the person is the root (D), the model the fifth (A), Mir the third (F#). Loose is the suspension (the 4th
   where the 3rd should be); in tune, the third arrives. Ground picks the mode; the motif (5 ↑ 1 ↑ 3) never changes. ── */
const mu=M.music;
/* direct audio for pointer sounds: the piece's own bus, honoring the switch and the stored per-piece mute */
function m2_A(id){ const a=M.audio; if(!a||!a.enabled||!a.unlocked) return null;
  try{ if(JSON.parse(localStorage.getItem('mir.soundMute')||'[]').includes(id)) return null; }catch(_){}
  return {now:()=>a.now(),play:(n,o)=>a.play(id,n,o),bus:()=>a.bus(id)}; }
/* Hz of note m (midi) heard over chord sym, through the engine's adaptive just intonation */
const m2_hz=(m,sym)=>mu.hz(m,sym||'D');
/* a piece's own control, pressed: canvas buttons route through the frame so the score and the clock stay the frame's */
function m2_press(id){ setTimeout(()=>{ const b=document.getElementById(id); if(b) b.click(); },0); }
/* rate limiter for parameter answers while dragging */
function m2_gate(st,k,ms){ const T=c5T(st), now=performance.now(); T.pg=T.pg||{}; if(now-(T.pg[k]||0)<ms) return false; T.pg[k]=now; return true; }
/* the env of the piece's current score (0 when nothing has played) */
const m2_env=(st,k,t,tau)=>mu.env(st,k,t,tau);

/* ════════════════════════════════════════════════════════════════════════
   L-11 · The wordmark, and its one dot · a lockup plate.
   Clear space is one unit on every side, the unit being the tittle's height (geo.clear). Minimum sizes are drawn at true
   CSS px. The field diagram is three steps of the same rule: the tittle, the accent ring that locks around it, the rings.
   ════════════════════════════════════════════════════════════════════════ */
const G11=['paper','night','olive','cobalt','sky'];
const T11='The wordmark, and its one dot';
const SUB11='The lockup and its one dot, the i’s tittle, where every Mir field begins.';
const NOTE11='Floor: 7 px x-height on screen. Below 12 px the ® may drop if a footnote says so. Default: keep it.';
const FOOT11='';
const DONT11=[{k:'do',t:'Do · one flat color'},{k:'stipple',t:'Don’t stipple it'},{k:'dot',t:'Don’t add a dot'},{k:'recolor',t:'Don’t recolor letters'},{k:'outline',t:'Don’t outline it'}];
const STEP11=[{t:'01 · The tittle',b:'The dot the wordmark already has.'},{t:'02 · One ring',b:'The accent locks around it: where the two of you meet.'},{t:'03 · The field',b:'Rings radiate from it and part around the letters.'}];
function c5grid(x0,x1,y,n,cols,th,lh,gap){ const cw=(x1-x0-(cols-1)*gap)/cols, out=[]; for(let i=0;i<n;i++){ const c=i%cols, r=(i/cols)|0; const x=x0+c*(cw+gap), yy=y+r*(th+lh+gap*.75); out.push([x,yy,x+cw,yy+th]); } const rows=Math.ceil(n/cols); return {r:out,bottom:y+rows*(th+lh)+(rows-1)*gap*.75}; }
function L11lay(w){ const g=c5m(), wide=w>=760, pad=wide?32:16, inner=w-2*pad, ts=wide?40:30, o={wide,pad,inner,ts};
  o.labY=pad+8; o.tl=M.wrap(g,T11,wide?inner*.7:inner,{size:ts,weight:300}); o.tlh=c5q(ts*1.04); o.tY=c5q(o.labY+(wide?52:44));
  o.sub=M.wrap(g,SUB11,wide?Math.min(560,inner*.6):inner,{size:wide?15:14,weight:300}); o.subY=c5q(o.tY+(o.tl.length-1)*o.tlh+(wide?32:28));
  let y=c5q(o.subY+(o.sub.length-1)*20+(wide?40:32));
  if(wide){ const ah=c5q(Math.max(300,inner*.3)); o.cs=[pad,y,pad+inner*.655,y+ah]; o.mn=[pad+inner*.655+24,y,pad+inner,y+ah]; y+=ah+48; }
  else { o.cs=[pad,y,pad+inner,y+200]; y+=200+16; const nl=c5paraN(NOTE11,inner-28,{size:12.5}); const mh=c5q(52+3*0+ (24+16+9)*1.6+3*36+nl*18+24); o.mn=[pad,y,pad+inner,y+mh]; y+=mh+40; }
  o.fbY=y; y+=28; if(wide){ const ch=c5q(inner/3*.6); o.fb=[0,1,2].map(i=>{ const cw=inner/3; return [pad+i*cw,y,pad+(i+1)*cw,y+ch]; }); y+=ch+84; }
  else { const ch=c5q(inner*.5); o.fb=[0,1,2].map(i=>[pad,y+i*(ch+60),pad+inner,y+i*(ch+60)+ch]); y+=3*(ch+60)+20; }
  o.grY=y; y+=24; const cols=wide?5:2, th=wide?c5q(inner/5*.5):c5q((inner-12)/2*.62); const G=c5grid(pad,pad+inner,y,5,cols,th,34,wide?16:12); o.gr=G.r; y=G.bottom+40;
  o.dY=y; y+=24; const D=c5grid(pad,pad+inner,y,5,cols,th,34,wide?16:12); o.dn=D.r; y=D.bottom+16;
  o.foot=M.wrap(g,FOOT11,inner,{font:'mono',size:9}); o.footY=c5q(y+12); o.H=c5q(o.footY+(o.foot.length-1)*14+pad); return o; }
function L11field(B,geo,box,P,step,seed,atm){ const [x0,y0,x1,y1]=box, cx=geo.tittle.cx, cy=geo.tittle.cy, Rmax=Math.max(Math.hypot(cx-x0,cy-y0),Math.hypot(cx-x1,cy-y0),Math.hypot(cx-x0,cy-y1),Math.hypot(cx-x1,cy-y1));
  if(atm) M.atmos(B,{box:box.map(Math.round),cx,cy,R:Rmax*.8,amount:.13,rays:12,rayPow:5,rayPhase:Math.PI/12,sp:1.9,seed:seed+3,r:.5,color:P.atm});
  c5rings(B,geo,{step,Rmax,color:P.ring,w:1.3,dpl:.62,r:.85,seed}); }
function L11draw(g,w,h,st){ const L=L11lay(w), P=c5pal(st.ground), {pad,inner,wide}=L;
  M.fill(g,P.ground);
  /* title block */
  c5lab(g,'L-11 · Brand · lockup rules',pad,L.labY,P.ink,wide?10:9.5);
  if(wide) c5lab(g,'vector trace of the brand PNG · 998 × 217',w-pad,L.labY,P.soft,9.5,{align:'right'});
  L.tl.forEach((l,i)=>c5disp(g,l,pad-1,L.tY+i*L.tlh,L.ts,P.ink));
  L.sub.forEach((l,i)=>M.text(g,l,pad,L.subY+i*20,{size:wide?15:14,weight:300,color:P.soft}));
  const sec=(n,t,x,y)=>{ c5lab(g,n,x,y,P.ink,9.5); c5lab(g,wide?t:t.split(' · ')[0],x+28,y,P.soft,9.5); };
  /* 01 · clear space */
  { const [x0,y0,x1,y1]=L.cs, pw=x1-x0, ph=y1-y0; c5box(g,x0,y0,x1,y1,P.hair); sec('01','Clear space · one unit = the tittle’s height',x0+14,y0+22);
    const xh=Math.min(pw*(wide?.86:.8)/8.1,(ph-80)/2.3), geo0=M.logoGeo(0,0,xh), lx=Math.round(x0+(pw-geo0.w)/2), base=Math.round(y0+ph*.5+(wide?6:4)+xh*.515), geo=M.logoGeo(lx,base,xh), u=geo.clear;
    const bx0=geo.x-u, bx1=geo.x+geo.w+u, by0=geo.top-u, by1=geo.bottom+u;
    /* guides: baseline and x-height, the lockup's bounds, the clear-space box */
    M.rule(g,bx0-18,geo.base,bx1+18,geo.base,P.hair); M.rule(g,bx0-18,geo.base-xh,bx1+18,geo.base-xh,P.hair);
    c5box(g,geo.x,geo.top,geo.x+geo.w,geo.bottom,P.hair); c5box(g,bx0,by0,bx1,by1,P.tint);
    const B=new M.Buf(g), R=M.rng(1101), sq=(x,y)=>M.field(B,{rng:R,box:[x,y,x+u,y+u],cell:Math.max(.9,u*.075),r:.55,rj:.1,density:M.shape.rect(x+.4,y+.4,x+u-.4,y+u-.4,.3),color:P.dim});
    sq(geo.tittle.cx-u/2,by0); sq(bx0,geo.base-xh/2-u/2); sq(geo.x+geo.w,geo.base-xh/2-u/2); sq(geo.x+(geo.w*.62)-u/2,geo.bottom); sq(geo.x+geo.w,by0);
    B.flush(); M.logo(g,geo.x,geo.base,xh,{color:P.ink});
    /* the tittle, named: a leader to the unit square above it */
    if(wide){ const lx2=geo.tittle.cx+u/2+6, ly=by0+u/2; M.rule(g,lx2,ly,lx2+28,ly,P.soft); c5lab(g,'1 unit · tittle height',lx2+32,ly+3.5,P.soft,9); }
    if(wide){ c5lab(g,'baseline',bx1+22,geo.base+3.5,P.soft,9); c5lab(g,'x-height',bx1+22,geo.base-xh+3.5,P.soft,9); }
    c5lab(g,wide?'clear space ≥ 1 unit on all sides':'1 unit = tittle height · on all sides',x0+14,y1-14,P.soft,9); }
  /* 02 · minimum size, drawn at true CSS px */
  { const [x0,y0,x1,y1]=L.mn; c5box(g,x0,y0,x1,y1,P.hair); sec('02','Minimum size · true px',x0+14,y0+22);
    let y=y0+52; [24,16,9].forEach(xh=>{ const asc=(M.LOGO.base-M.LOGO.asc)/M.LOGO.xh*xh, desc=(M.LOGO.desc-M.LOGO.base)/M.LOGO.xh*xh, base=Math.round(y+asc);
      M.logo(g,x0+14,base,xh,{color:P.ink}); const ly=c5q(base+desc+18); c5lab(g,xh+' px x-height'+(xh<12?' · ® kept':''),x0+14,ly,P.soft,9); y=ly+(wide?20:18); });
    c5para(g,NOTE11,x0+14,c5q(y+6),x1-x0-28,{size:12.5,lh:18,color:P.soft}); }
  /* 03 · where the field begins */
  { sec('03','Where the field begins',pad,L.fbY);
    L.fb.forEach((box,i)=>{ const [x0,y0,x1,y1]=box, cw=x1-x0, ch=y1-y0; c5box(g,x0,y0,x1,y1,P.hair);
      const xh=Math.min(cw*.62/7.52,ch*.17), geo0=M.logoGeo(0,0,xh), lx=Math.round(x0+(cw-geo0.w)/2), base=Math.round(y0+ch*.6+xh*.5), geo=M.logoGeo(lx,base,xh);
      const kmask=c5slot(st,'m11'+i,c5DK(w,h)+'|'+i,()=>M.logoMask(geo,Math.max(2,xh*.16)));
      const B=new M.Buf(g,(x,y)=>x<x0+1||x>x1-1||y<y0+1||y>y1-1||kmask(x,y));
      if(i===2) L11field(B,geo,[x0+1,y0+1,x1-1,y1-1],P,xh*.62,7,true);
      if(i>=1){ const am=c5slot(st,'a11'+i,c5DK(w,h)+'|'+i,()=>M.logoMask(geo,Math.max(1,xh*.045))); B.flush(); B.mask=am; c5accent(B,geo,{color:P.acc,seed:11,r:.9}); B.mask=(x,y)=>x<x0+1||x>x1-1||y<y0+1||y>y1-1||kmask(x,y); }
      if(i===1){ const R=M.rng(113); for(let s=0;s<5;s++){ const a=-2.4+s*1.15+R()*.4, d=xh*(1.3+R()*1.6); B.dot(geo.tittle.cx+Math.cos(a)*d,geo.tittle.cy+Math.sin(a)*d,.85+R()*.35,P.ring); } }
      B.flush(); M.logo(g,geo.x,geo.base,xh,{color:P.ink});
      if(i===0){ const tx=geo.tittle.cx, ty=geo.top-4; M.rule(g,tx,ty,tx,y0+38,P.soft); M.rule(g,tx,y0+38,tx+14,y0+38,P.soft); c5lab(g,'the i’s tittle',tx+18,y0+41.5,P.soft,9); }
      c5lab(g,STEP11[i].t,x0+(wide?0:0),y1+20,P.ink,9.5);
      M.text(g,STEP11[i].b,x0,y1+38,{size:12.5,weight:300,color:P.soft}); }); }
  /* 04 · grounds: the figure survives every ground (rule G) */
  { sec('04','Grounds · the lockup and its field on each',pad,L.grY);
    G11.forEach((k,i)=>{ const [x0,y0,x1,y1]=L.gr[i], Q=c5pal(k), tw=x1-x0, th=y1-y0; M.fill(g,Q.ground,x0,y0,tw,th); c5box(g,x0,y0,x1,y1,k===st.ground?P.soft:P.hair);
      const xh=Math.min(tw*.6/7.52,th*.2), geo0=M.logoGeo(0,0,xh), lx=Math.round(x0+(tw-geo0.w)/2), base=Math.round(y0+th*.56+xh*.5), geo=M.logoGeo(lx,base,xh);
      const km=c5slot(st,'g11'+i,c5DK(w,h)+'|'+i,()=>M.logoMask(geo,Math.max(1.6,xh*.18)));
      const B=new M.Buf(g,(x,y)=>x<x0+1||x>x1-1||y<y0+1||y>y1-1||km(x,y)); c5rings(B,geo,{step:xh*.85,Rmax:tw,color:Q.ring,w:1.1,dpl:.6,r:.7,seed:i+3}); c5accent(B,geo,{color:Q.acc,seed:i+9,r:.75,dpl:1.6});
      B.flush(); M.logo(g,geo.x,geo.base,xh,{color:Q.ink});
      c5lab(g,Q.name+(k===st.ground?' · this plate':''),x0,y1+18,P.ink,9); c5lab(g,'ground '+Q.ground+' · mark '+Q.ink,x0,y1+31,P.soft,9,{upper:false,track:.02}); }); }
  /* 05 · do and don't. The don'ts are grayed; the strike is the frame's accent, stippled. */
  { sec('05','Do and don’t',pad,L.dY); const gry=c5mix(P.ground,P.ink,.36), gry2=c5mix(P.ground,P.ink,.9);
    DONT11.forEach((d,i)=>{ const [x0,y0,x1,y1]=L.dn[i], tw=x1-x0, th=y1-y0; c5box(g,x0,y0,x1,y1,P.hair);
      const xh=Math.min(tw*.62/7.52,th*.2), geo0=M.logoGeo(0,0,xh), lx=Math.round(x0+(tw-geo0.w)/2-(d.k==='dot'?xh*.4:0)), base=Math.round(y0+th*.56+xh*.5), geo=M.logoGeo(lx,base,xh), B=new M.Buf(g), R=M.rng(1150+i);
      if(d.k==='do') M.logo(g,geo.x,geo.base,xh,{color:P.ink});
      else if(d.k==='stipple'){ const A=c5logoA(geo); M.blue(B,{box:[Math.floor(geo.x-1),Math.floor(geo.top-1),Math.ceil(geo.x+geo.w+1),Math.ceil(geo.bottom+1)],sp:1.05,seed:51,density:(x,y)=>A(x,y)>.5?.9:0,rOf:(v,R)=>.42+.18*R(),color:gry}); }
      else if(d.k==='outline'){ const A=c5logoA(geo), e=.75; M.blue(B,{box:[Math.floor(geo.x-1),Math.floor(geo.top-1),Math.ceil(geo.x+geo.w+1),Math.ceil(geo.bottom+1)],sp:.62,seed:52,density:(x,y)=>A(x,y)>.5&&(A(x+e,y)<.5||A(x-e,y)<.5||A(x,y+e)<.5||A(x,y-e)<.5)?1:0,rOf:()=>.42,color:gry}); }
      else if(d.k==='dot'){ M.logo(g,geo.x,geo.base,xh,{color:gry}); }
      else if(d.k==='recolor'){ M.logo(g,geo.x,geo.base,xh,{color:gry}); g.save(); g.beginPath(); g.rect(geo.x+(225-M.LOGO.x0)*geo.s,geo.top-2,(54)*geo.s,geo.bottom-geo.top+4); g.clip(); M.logo(g,geo.x,geo.base,xh,{color:gry2}); g.restore(); }
      if(d.k==='dot'){ const r=xh*.34, cx=geo.x+geo.w+r*1.6, cy=geo.base-r; M.field(B,{rng:R,box:[cx-r-1,cy-r-1,cx+r+1,cy+r+1],cell:Math.max(.8,r*.16),r:.5,rj:.1,density:M.shape.disc(cx,cy,r,.4),color:gry}); }
      if(d.k!=='do'){ M.along(B,{rng:R,curve:M.curve.seg(x0+10,y1-10,x1-10,y0+10),n:Math.round(Math.hypot(tw,th)*2.2),spread:.55,r:.8,rj:.2,color:P.acc,even:true}); }
      B.flush();
      c5lab(g,d.t,x0,y1+18,d.k==='do'?P.ink:P.soft,9); }); }
  L.foot.forEach((l,i)=>c5lab(g,l,pad,L.footY+i*14,P.dim,9,{upper:false,track:0})); }
/* where the plate's tittles are: the 01 lockup, the three 03 panels and the five 04 tiles (the same arithmetic as L11draw) */
function L11pts(w){ const L=L11lay(w), wide=L.wide, o={L};
  { const [x0,y0,x1,y1]=L.cs, pw=x1-x0, ph=y1-y0, xh=Math.min(pw*(wide?.86:.8)/8.1,(ph-80)/2.3), g0=M.logoGeo(0,0,xh);
    o.main={geo:M.logoGeo(Math.round(x0+(pw-g0.w)/2),Math.round(y0+ph*.5+(wide?6:4)+xh*.515),xh),xh}; }
  o.fb=L.fb.map(([x0,y0,x1,y1])=>{ const cw=x1-x0, ch=y1-y0, xh=Math.min(cw*.62/7.52,ch*.17), g0=M.logoGeo(0,0,xh); return {geo:M.logoGeo(Math.round(x0+(cw-g0.w)/2),Math.round(y0+ch*.6+xh*.5),xh),xh}; });
  o.gr=L.gr.map(([x0,y0,x1,y1])=>{ const tw=x1-x0, th=y1-y0, xh=Math.min(tw*.6/7.52,th*.2), g0=M.logoGeo(0,0,xh); return {geo:M.logoGeo(Math.round(x0+(tw-g0.w)/2),Math.round(y0+th*.56+xh*.5),xh),xh}; });
  return o; }
/* the sonic logo, one bar of 4/4 at 112 BPM. Over an open fifth (the person and the model), the motif 5 ↑ 1 ↑ 3 on mallet and
   bell, one 8th apart; each note lights one step of 03 (the tittle, the ring, the field). On beat 3 the dot on the i pings
   high on the third, the chord fills in with the ground's color tone, and the low D answers. Ground is the mode. */
const BPM11=112, B11=60000/BPM11;
/* the ground's color tone: the 9th (Ionian, Dorian, Aeolian), the #11 (Lydian, tuned 45/32 as the third of E) or the 7th (Mixolydian, 7/4) */
const COL11={ionian:[1,6,'D'],lydian:[3,5,'E'],mixolydian:[6,5,'D7'],dorian:[1,6,'Dm'],aeolian:[1,6,'Dm']};
function music11(st){ const S=mu.score({bpm:BPM11,ground:st.ground}), md=S.mode, o=S.feel.oct, b=B11, [cd,co,csym]=COL11[md]||COL11.ionian, home=/^Dm/.test(csym)?'Dm':'D';
  S.harm([[0,home]]);
  S.chord(0,'pad',[50,57],2*b,{attack:.25,release:.5,cutoff:760,vel:.44},['bed',.3]);
  S.note(0,'pluck','D2',300,{cutoff:360,vel:.74},null);
  [mu.deg(md,-3,4),mu.deg(md,0,4),mu.deg(md,2,4)].forEach((m,k)=>{ const t=k*b/2;
    S.note(t,'mallet',m+12*o,k===2?1600:900,{vel:.64+.04*k,trem:k===2?5:0,pan:(k-1)*.25},['m'+k,1]);
    S.note(t,'bell',m+12+12*o,1400,{ratio:3,bright:.6,vel:.38+.03*k,pan:(k-1)*.25}); });
  /* beat 3: the ping, high on the third, and the chord with its color tone */
  S.note(2*b,'bell',mu.deg(md,2,6)+12*o,2600,{ratio:4,bright:1.15,vel:.64,pan:.3},['ping',1]);
  S.chord(2*b,'mallet',[mu.deg(md,0,4),mu.deg(md,2,4),mu.deg(md,4,4)].map(m=>m+12*o),1800,{vel:.54,trem:5,over:home},['chord',1]);
  S.note(2*b,'mallet',mu.deg(md,cd,co)+12*o,1800,{vel:.46,trem:5,over:csym});
  S.chord(2*b,'pad',[50,mu.deg(md,2,3),57],2*b,{attack:.08,release:1.2,cutoff:1000,vel:.46,over:home});
  S.note(2*b,'pluck','D2',300,{cutoff:380,vel:.70});
  S.end(4*b+900); return S.out(); }
/* the flashes: a crisp ring of accent dots around each sounding tittle, swelling with its note and decaying with it */
function flash11(g,st,P,Q,t,acc){ const tile=G11.indexOf(st.ground), list=[['m0',Q.fb[0],1.05],['m1',Q.fb[1],1.05],['m2',Q.fb[2],1.05],['ping',Q.main,1.08],['chord',Q.gr[tile],1.05]];
  list.forEach(([k,q,rk],i)=>{ if(!q) return; const e=Math.max(m2_env(st,k,t,k==='ping'?380:260),acc&&k==='ping'?acc:0); if(e<.03) return; const geo=q.geo, cR=Math.max(geo.tittle.w,geo.tittle.h)*rk*(1+.18*e);
    const am=c5slot(st,'fm11'+i,c5DK(Q.L.inner,0)+'|'+geo.x+'|'+geo.base,()=>M.logoMask(geo,Math.max(1,q.xh*.045))), B=new M.Buf(g,am);
    M.ring(B,{cx:geo.tittle.cx,cy:geo.tittle.cy,R:cR,w:1.2,swell:.3,dpl:1.6,rCore:.8+.9*e,rEdge:.5+.5*e,seed:11+i,color:i===4?c5pal(st.ground).acc:P.acc}); B.flush(); }); }
/* rectangles to restore from the base before each flash frame */
function rects11(Q,st){ const tile=G11.indexOf(st.ground); return [Q.fb[0],Q.fb[1],Q.fb[2],Q.main,Q.gr[tile]].filter(Boolean).map(q=>{ const g=q.geo, r=Math.max(g.tittle.w,g.tittle.h)*1.6+4; return [g.tittle.cx-r,g.tittle.cy-r,2*r,2*r]; }); }
function base11(st,w,h){ return c5slot(st,'base',c5DK(w,h)+st.ground,()=>{ const {cv,g}=c5off(w,h); L11draw(g,w,h,st); return cv; }); }
function frame11(g,w,h,st,t,acc){ const P=c5pal(st.ground), Q=c5slot(st,'pts',c5DK(w,h),()=>L11pts(w)), B=base11(st,w,h), d=g.dpr;
  g.save(); g.setTransform(1,0,0,1,0,0); rects11(Q,st).forEach(([x,y,rw,rh])=>{ const X=Math.max(0,Math.floor(x*d)), Y=Math.max(0,Math.floor(y*d)), W=Math.ceil(rw*d), H=Math.ceil(rh*d); g.drawImage(B,X,Y,W,H,X,Y,W,H); }); g.restore();
  flash11(g,st,P,Q,t,acc); }
/* pointing at the dot on the i: the ping, on the third, in the ground's mode, with its flash */
function ping11(st,e){ const T=c5T(st), Q=c5slot(st,'pts',c5DK(e.w,e.h),()=>L11pts(e.w)), geo=Q.main.geo, u=geo.clear, inside=Math.hypot(e.x-geo.tittle.cx,e.y-geo.tittle.cy)<Math.max(9,u*.9);
  if(!inside){ T.in11=false; return; } if(T.in11) return; T.in11=true; const md=mu.groundMode(st.ground), o=(mu.GROUND_FEEL[st.ground]||{oct:0}).oct, A=m2_A('L-11');
  if(A) A.play('bell',{freq:m2_hz(mu.deg(md,2,6)+12*o,/^(dorian|aeolian)$/.test(md)?'Dm':'D'),dur:2.2,ratio:4,bright:1.1,vel:.5,pan:.3});
  if(!T.live||c5RM()) return; const t0=performance.now(); cancelAnimationFrame(T.raf11||0);
  const step=now=>{ const lv=T.live, u2=(now-t0)/600; if(!lv) return; lv.g.setTransform(lv.g.dpr,0,0,lv.g.dpr,0,0); frame11(lv.g,lv.w,lv.h,st,-1e9,u2<1?Math.exp(-u2*3.2)*Math.min(1,u2*12+.2):0); if(u2<1.1) T.raf11=requestAnimationFrame(step); };
  T.raf11=requestAnimationFrame(step); }
M.piece({ id:'L-11',
  caption:'A lockup plate: clear space set by the dot on the i, true-pixel minimum sizes, the field starting at that dot, five grounds and four misuses. Change Ground to hear its sonic logo, or point at the dot.',
  alt:'A brand-guidelines plate. The lowercase mindgut wordmark large with a clear-space box marked by small stippled squares the height of the i’s tittle; samples at 24, 16 and 9 pixel x-height; three panels where a red ring forms around the tittle and then stippled rings radiate from it, parting around the letters; the wordmark on five grounds; and five do-and-don’t tiles with grayed misuses struck through in stippled red.',
  recipe:{
    idea:'Mir gets no mark of its own: it is the field that settles around the dot the wordmark already has, on every ground.',
    marks:['dot','ring','center','stray','ground'],
    ground:'paper, night, olive, cobalt, sky',
    accent:'the ring around the tittle, and the stippled strike through each misuse',
    composition:'Title block; 01 clear space and 02 minimum sizes side by side (stacked on phones); 03 three panels of the field beginning at the tittle; 04 the lockup on five grounds; 05 five do-and-don’t tiles.',
    motion:'A still plate. Play or a Ground change runs one bar at 112 BPM: each 03 panel’s tittle rings on its motif note, 8ths apart, then the 01 tittle and this ground’s 04 tile flash on beat 3 (decay 260–380 ms). Pointing at the 01 dot flashes it.',
    sound:'The sonic logo: over an open fifth, the motif 5 ↑ 1 ↑ 3 on mallet and bell lights the three steps of 03; then the dot on the i pings high on the third and the chord fills in, colored by the ground’s mode.',
    controls:['Ground (Paper, Night, Olive, Cobalt, Sky)'],
    computed:['clear-space unit = the tittle’s height, from the wordmark geometry','minimum sizes drawn at true CSS px','rings radiate from the tittle; dots within a margin of the letters are knocked out','misuse tiles sample the wordmark’s own alpha at 4×'],
    placeholder:[],
    root:'',
    rules:['draw the wordmark with M.logo only: one flat color, never stippled, outlined, recolored or given an extra dot','7 px x-height minimum on screen; keep the ® by default'],
    engine:['M.logo','M.logoGeo','M.logoMask','M.LOGO','M.ring','M.atmos','M.field','M.blue','M.along','M.curve.seg','M.shape.rect','M.shape.disc','M.Buf','M.text','M.wrap','M.rule','M.fill']
  },
  aspect:w=>w/L11lay(w).H,
  state:{ground:'paper'},
  controls:[{id:'ground',type:'select',label:'Ground',play:true,options:G11.map(k=>({value:k,label:M.PAL[k].name}))}],
  autoplay:false,
  music:music11,
  render(g,w,h,M,st){ const T=c5T(st); T.live={g,w,h}; c5blit(g,base11(st,w,h)); },
  animate(g,w,h,M,st,t){ const T=c5T(st); T.live={g,w,h}; frame11(g,w,h,st,t,0); return t<4*B11+900; },
  pointer(st,e){ if(e.type==='move'&&!e.down) ping11(st,e); else if(e.type==='down') ping11(st,e); return false; } });
/* ════════════════════════════════════════════════════════════════════════
   L-12 · Sting · the sonic logo: two bars of 4/4 whose tempo is set by Duration (bpm = 480 000 ÷ ms), one orchestrated move
   computed per dot. Each ring dot has a target on its ring (M.ring around geo.tittle, knocked out around the letters), a loose
   radial offset (seeded value noise, ±0.42 ring steps) and a start as a stray. Gather (beats 0–3): the rings fly in by groups,
   inner first, each group landing on its note of a loosely timed arpeggio (16ths; the jitter shrinks as the rings come in, so
   the timing pulls onto the grid). Wordmark (beats 3–5): opacity only, under the organ's swell. Settle (beats 5–8): the motif,
   the loose offsets decay to zero, the accent ellipse (1.7 × 0.7) closes to a circle and the light arrives by count, one batch
   per 8th; the third arrives on the downbeat after bar 2, exactly where the accent becomes a circle.
   ════════════════════════════════════════════════════════════════════════ */
const G12=['night','cobalt','paper'];
const PH12=[[0,.375,'01','gather','strays → rings'],[.375,.625,'02','wordmark','opacity only'],[.625,1,'03','settle','accent locks']];
/* the gather's 16ths (of 12): eight notes in three cells, so the rings land da-da-da · da-da-da · da-da */
const POS12=[2,3,4,6,7,8,10,11], K12=POS12.length;
function geo12(w){ const wide=w>=600, fh=Math.round(w*9/16), sh=wide?96:112, H=fh+sh, xh=w*(wide?.074:.08), g0=M.logoGeo(0,0,xh), lx=Math.round((w-g0.w)/2), base=Math.round(fh*.5+.515*xh), geo=M.logoGeo(lx,base,xh);
  const cx=geo.tittle.cx, cy=geo.tittle.cy, step=xh*(wide?.5:.56), Rmax=Math.hypot(Math.max(cx,w-cx),Math.max(cy,fh-cy))+step, km=M.logoMask(geo,xh*.16), am=M.logoMask(geo,Math.max(1,xh*.045));
  const out=(x,y)=>x<-2||y<-2||x>w+2||y>fh+2, R=M.rng(1212), rd=wide?.95:.8;
  /* rings */
  const cap=c5cap((x,y)=>out(x,y)||km(x,y)); let nr=0; for(let i=1;i*step<Rmax;i++,nr++){ const n0=cap.X.length; M.ring(cap,{cx,cy,R:i*step,w:Math.max(1.5,step*.05)*(.85+.35*Math.min(1,i/6)),swell:.55,dpl:wide?.44:.58,rCore:rd,rEdge:rd*.55,seed:i*17+3,color:0}); for(let j=n0;j<cap.X.length;j++) cap.C[j]=i; }
  /* the gather's timing: note n lands at 16th POS12[n] plus a seeded jitter that shrinks to zero by the last note (loose → on the grid);
     ring i belongs to note group ⌊(i − 1) · 8 ÷ rings⌋, so the rings come in by groups, inner first */
  const RJ=M.rng(1219), JIT=POS12.map((_,n)=>(1-n/(K12-1))*.42*(RJ()*2-1)), LF=POS12.map((p,n)=>(p+JIT[n])/12);
  const N=cap.X.length, A=new Float32Array(N), RH=new Float32Array(N), DL=new Float32Array(N), SR=new Float32Array(N), SA=new Float32Array(N), DE=new Float32Array(N), RR=Float32Array.from(cap.R), GR=new Uint8Array(N);
  for(let j=0;j<N;j++){ const dx=cap.X[j]-cx, dy=cap.Y[j]-cy, a=Math.atan2(dy,dx), rho=Math.hypot(dx,dy), ring=cap.C[j], gi=Math.min(K12-1,Math.floor((ring-1)*K12/nr)); A[j]=a; RH[j]=rho; GR[j]=gi;
    DL[j]=step*.42*(M.noise(Math.cos(a)*1.25+ring*.71,Math.sin(a)*1.25+ring*.37,9)-.5)*2+R.gauss()*step*.07;
    /* the dot's ease (outCubic over a third of the gather) reaches 0.9 at its delay + 0.18: on its group's note */
    SR[j]=rho*(1.5+1.3*R())+step*2*R(); SA[j]=a+(R()-.5)*1.2+.35; DE[j]=LF[gi]-.18+.05*(R()-.5); }
  /* the accent: a ring around the tittle, a smear while loose (ellipse 1.7 × 0.7, rot 0.7), a clean circle in tune */
  const cR=Math.max(geo.tittle.w,geo.tittle.h)*1.05, ac=c5cap(); M.ring(ac,{cx,cy,R:cR,w:1.3,swell:.3,dpl:2.1,rCore:rd*1.05,rEdge:rd*.6,seed:5,color:0});
  const NA=ac.X.length, AA=new Float32Array(NA), AK=new Float32Array(NA), ASR=new Float32Array(NA), ASA=new Float32Array(NA), ADE=new Float32Array(NA), AR=Float32Array.from(ac.R);
  for(let j=0;j<NA;j++){ const dx=ac.X[j]-cx, dy=ac.Y[j]-cy; AA[j]=Math.atan2(dy,dx); AK[j]=Math.hypot(dx,dy)-cR; ASR[j]=cR*(3+5*R())+step*R(); ASA[j]=AA[j]+(R()-.5)*1.6; ADE[j]=.15+.25*R(); }
  /* light: fine dots gathered into rays from the tittle; each has a threshold so it arrives by count */
  const at=c5cap((x,y)=>km(x,y)); M.atmos(at,{box:[0,0,w,fh],cx,cy,R:Rmax*.85,amount:.15,rays:12,rayPow:5,rayPhase:Math.PI/12,sp:wide?2.4:2.1,seed:15,r:wide?.52:.46,color:'a'});
  const NT=at.X.length, TH=new Float32Array(NT); for(let j=0;j<NT;j++) TH[j]=R();
  return {wide,fh,sh,H,xh,geo,cx,cy,cR,step,am,N,A,RH,DL,SR,SA,DE,RR,GR,JIT,LF,nr,NA,AA,AK,ASR,ASA,ADE,AR,AX:Float32Array.from(at.X),AY:Float32Array.from(at.Y),AT:Float32Array.from(at.R),NT,TH,pad:wide?24:16}; }
function L12frame(g,w,h,st,t){ const G=c5slot(st,'geo',c5DK(w,h),()=>geo12(w)), P=c5pal(st.ground), D=st.dur*1000, b=D/8, u=cl(t/D);
  const p1=3*b, s=E.inOutCubic(cl((t-5*b)/(3*b))), la=E.inOutCubic(cl((t-3*b)/(2*b))), lite=t<5*b?0:Math.min(7,Math.floor((t-5*b)/(b/2))+1)/7;
  const B=new c5Ras(g,[0,0,w,G.fh]); B.clear(P.ground);
  const CA=c5C(P.atm), CR=c5C(P.ring), CX=c5C(P.acc);
  /* pairing: each gather group swells on its note; every ring breathes once at the lock; the accent answers the motif and the lock */
  const eg=[]; for(let n=0;n<K12;n++) eg.push(1+.95*m2_env(st,'g'+n,t,170));
  const el=m2_env(st,'lock',t,560), em=m2_env(st,'m*',t,230), kr=1+.32*el, ka=1+1.25*Math.max(.75*em,el);
  if(lite>0) for(let j=0;j<G.NT;j++) if(G.TH[j]<lite) B.dotC(G.AX[j],G.AY[j],G.AT[j]*(1+.4*el),CA);
  const cx=G.cx, cy=G.cy, tp=t/p1, ls=1-s, W=w+3, F=G.fh+3;
  for(let j=0;j<G.N;j++){ let e=(tp-G.DE[j])*3; e=e<=0?0:e>=1?1:1-(1-e)*(1-e)*(1-e); const rl=G.RH[j]+G.DL[j]*ls, rr=G.SR[j]+(rl-G.SR[j])*e, aa=G.SA[j]+(G.A[j]-G.SA[j])*e, x=cx+Math.cos(aa)*rr, y=cy+Math.sin(aa)*rr; if(x<-3||y<-3||x>W||y>F) continue; B.dotC(x,y,G.RR[j]*eg[G.GR[j]]*kr,CR); }
  /* accent: loose ellipse → circle; knocked out where it crosses the letters only once the letters are there */
  const ex=lerp(1.7,1,s), ey=lerp(.7,1,s), ro=.7, c=Math.cos(ro), sn=Math.sin(ro), lo=1-s;
  for(let j=0;j<G.NA;j++){ const e=E.outCubic(cl((tp-G.ADE[j])/.55)), a=G.AA[j], rad=G.cR+G.AK[j]*(1+lo*2.5), lx=Math.cos(a)*rad*ex, ly=Math.sin(a)*rad*ey, tx=cx+lx*c-ly*sn, ty=cy+lx*sn+ly*c;
    const sx=cx+Math.cos(G.ASA[j])*G.ASR[j], sy=cy+Math.sin(G.ASA[j])*G.ASR[j], x=sx+(tx-sx)*e, y=sy+(ty-sy)*e; if(la>.5&&G.am(x,y)) continue; B.dotC(x,y,G.AR[j]*ka,CX); }
  B.flush();
  if(la>0){ g.save(); g.globalAlpha=la; M.logo(g,G.geo.x,G.geo.base,G.xh,{color:P.ink}); g.restore(); }
  /* the strip: cached chrome, then the playhead */
  const S=c5slot(st,'strip',c5DK(w,h)+st.ground+'|'+st.dur,()=>L12strip(w,h,G,P,st.dur));
  g.save(); g.setTransform(1,0,0,1,0,0); const d=g.dpr, y0=Math.floor(G.fh*d); g.drawImage(S,0,y0,S.width,S.height-y0,0,y0,S.width,S.height-y0); g.restore();
  const x0=G.pad, x1=w-G.pad, X=x0+(x1-x0)*u, ty=G.fh+(G.wide?56:58);
  M.fill(g,P.ink,x0,ty-.75,X-x0,1.5); M.rule(g,X,ty-14,X,ty+8,P.acc,1.5);
  const ph=PH12.findIndex(q=>u<q[1]||q[1]===1), lab=(u>=1?'end frame':PH12[ph][3])+' · '+(Math.min(t,D)/1000).toFixed(2)+' s';
  c5lab(g,lab,x1,G.fh+22,P.acc,9.5,{align:'right'}); }
function L12strip(w,h,G,P,dur){ const {cv,g}=c5off(w,h), y0=G.fh, x0=G.pad, x1=w-G.pad, X=v=>x0+(x1-x0)*v, ty=y0+(G.wide?56:58);
  M.fill(g,P.lift,0,y0,w,h-y0); M.rule(g,0,y0,w,y0,P.hair);
  c5lab(g,'L-12 · Brand · sting · '+dur.toFixed(1)+' s · '+Math.round(480/dur)+' BPM',x0,y0+22,P.ink,G.wide?10:9.5);
  if(G.wide) c5lab(g,'2 bars of 4/4 · opacity only, no scale',X(.5),y0+22,P.soft,9.5,{align:'center'});
  M.rule(g,x0,ty,x1,ty,P.dim);
  /* the grid: a tick per beat (taller at each bar), a dot per 16th */
  const B=new M.Buf(g); for(let k=0;k<=32;k++){ const x=X(k/32); if(k%4===0) M.rule(g,x,ty,x,ty+(k%16===0?8:5),P.soft); else B.dot(x,ty+4,.75,P.dim); } B.flush();
  const every=G.wide?.5:1; for(let v=0;v<=dur+1e-6;v+=every){ const x=X(v/dur); c5lab(g,v.toFixed(1)+(v+every>dur+1e-6?' s':''),x,ty+(G.wide?22:20),P.soft,9,{align:v===0?'left':v+every>dur+1e-6?'right':'center'}); }
  PH12.forEach(([a,b,n,k,d],i)=>{ const xa=X(a); if(i) M.rule(g,xa,ty-16,xa,ty,P.soft); c5lab(g,n+' '+k+(G.wide?' · '+d:''),xa+(i?6:0),ty-8,P.ink,9); });
  if(!G.wide) c5lab(g,'opacity only · no scale',x0,h-12,P.soft,9);
  return cv; }
/* the sting's score (b = Duration ÷ 8). Bed: the person and the model, an open fifth on the pad, from the first beat.
   Gather: the rings' landings are a loosely timed arpeggio up the suspended chord (A3 → D6 on mallet), one note per ring group.
   Wordmark: the organ swells the suspended chord with the wordmark's opacity. Settle: the motif loose, 5 ↑ 1 ↑ 4, on a glide
   doubled by mallet; shakers count the light in by 8ths; `meet` starts on the third two beats early so its two voices converge as
   the accent closes and bloom exactly at the lock. Lock (downbeat after bar 2): the 4 falls to the 3 in the glide and in the organ,
   the stacked bass drops once, the chord is pure and a bell rings the tonic. Ground is the mode: night (Dorian) resolves to F,
   cobalt (Lydian) suspends on G# over a sus2 and falls to F#. */
function music12(st,W,H){ const G=c5slot(st,'geo',c5DK(W,H),()=>geo12(W)), D=st.dur*1000, b=D/8, S=mu.score({bpm:480000/D,ground:st.ground}), md=S.mode, o=12*S.feel.oct, s16=b/4;
  const lyd=md==='lydian', minor=md==='dorian'||md==='aeolian', sus=lyd?'Dsus2':'Dsus4', home=minor?'Dm':'D';
  S.harm([[0,sus],[8*b,home]]);
  S.chord(0,'pad',[50,57],8*b,{attack:Math.min(1.2,b*1.5/1000),release:.5,cutoff:720,vel:.34},['bed',.3]);
  /* gather */
  const arp=mu.tones(sus,'A3','D6');
  for(let n=0;n<K12;n++) S.note((POS12[n]+G.JIT[n])*s16,'mallet',arp[n]+o,1000,{vel:.36+.035*n,ratio:4,bright:.85+.05*n,pan:-.45+.9*n/(K12-1)},['g'+n,1]);
  /* wordmark: the organ swells the suspended chord; the suspension tone will fall to the third */
  const org=mu.tones(sus,'D3','D4'), st4=org.find(m=>m%12!==2&&m%12!==9);
  org.forEach((m,k)=>S.note(3*b,'organ',m,5*b+1500,{id:m===st4?'os':undefined,attack:2*b/1000,release:1.5,vel:m===st4?.5:.44,vibrato:3,cutoff:2600},k===0?['org',.4]:null));
  /* settle: the motif, loose (5 ↑ 1 ↑ 4), legato on a glide and struck on mallet */
  const mot=[mu.deg(md,-3,4),mu.deg(md,0,4),mu.deg(md,3,4)].map(m=>m+o), third=mu.deg(md,2,4)+o;
  const n4=m=>lyd?{hz:m2_hz(m,'E')}:m;   /* Lydian's raised 4th, tuned as the third of E (45/32), so it stays pure against the fifth */
  S.note(5*b,'glide',mot[0],3*b+1700,{id:'mv',attack:.03,release:1.3,vel:.5,vibrato:7,tone:3000,pan:.08});
  S.glide(5.5*b,'mv',mot[1],50); S.glide(6*b,'mv',n4(mot[2]),50);
  mot.forEach((m,k)=>S.note((5+.5*k)*b,'mallet',k===2?n4(m+12):m+12,800,{vel:.36,ratio:4,pan:.2*(k-1)},['m'+k,1]));
  for(let k=0;k<6;k++) S.hitSound((5+.5*k)*b,'hat',{vel:.16+.035*k,decay:.022},['h'+k,.5]);
  S.note(6*b,'meet',mu.deg(md,2,5)+o,2*b/.62,{spread:30,vel:.48,over:home});
  /* lock: the third arrives */
  S.glide(8*b,'mv',third,130); S.glide(8*b,'os',mu.deg(md,2,3),160);
  S.note(8*b,'bass','D2',720,{from:'A1',glide:90,env:2.8,decay:.36,vel:.62},['lock',1]);
  S.chord(8*b,'pad',[50,mu.deg(md,2,3),57,62],1900,{attack:.05,release:1.4,cutoff:1300,vel:.38});
  S.note(8*b,'bell',mu.deg(md,0,6)+o,2600,{ratio:3.5,vel:.44,pan:.2});
  S.end(8*b+2400); return S.out(); }
/* Duration is the tempo. Dragging it plays the suspension and its resolution, one beat apart at the new tempo, so you hear
   the beat you are setting (at most every 220 ms) */
function param12(A,st,id,oldV,newV){ if(id!=='dur') return false; if(!m2_gate(st,'dur',220)) return true; const md=mu.groundMode(st.ground), o=12*((mu.GROUND_FEEL[st.ground]||{}).oct||0), now=A.now(), bt=newV/8;
  const home=/^(dorian|aeolian)$/.test(md)?'Dm':'D';
  A.play('mallet',{freq:m2_hz(mu.deg(md,3,5)+o,md==='lydian'?'E':'Dsus4'),dur:.8,vel:.42,when:now+.01});
  A.play('mallet',{freq:m2_hz(mu.deg(md,2,5)+o,home),dur:1.1,vel:.46,trem:5,when:now+.01+bt});
  A.play('pluck',{freq:m2_hz(50,home),dur:.3,cutoff:380,vel:.5,when:now+.01+bt});
  return true; }
M.piece({ id:'L-12',
  caption:'A logo sting in which stray dots gather into rings around the dot on the i, the wordmark fades in, and the ring around that dot closes last. Press Play to replay it, or change Duration to stretch it.',
  alt:'A 16:9 frame: the mindgut wordmark on near-black, with concentric stippled rings centered on the i’s tittle, parting around the letters, fine dots of light in rays, and a red ring around the tittle. Under it, a timeline with tick marks, three labeled phases and a red playhead.',
  recipe:{
    idea:'The wordmark does not move; the agreement around it does, resolving loose to in tune, with the accent locking last.',
    marks:['stray','ring','center','dot'],
    ground:'night, cobalt, paper',
    accent:'the ring around the tittle (gold on cobalt): a loose ellipse that closes to a circle',
    composition:'A 16:9 frame with the wordmark centered and rings radiating from the tittle, parting around the letters; a timeline strip below with ticks, three phases and a playhead.',
    motion:'Two bars of 4/4 (160 BPM at 3 s). Beats 0–3: strays fly in by ring groups, inner first, each group landing and swelling on its 16th. Beats 3–5: the wordmark fades in, opacity only. Beats 5–8: offsets decay, the accent closes, light arrives by 8ths; the lock flashes on the downbeat. Reduced motion shows the end frame.',
    sound:'The rings land as a loosely timed arpeggio over an open fifth; an organ swells the suspension under the wordmark; the motif waits on its fourth while shakers count in the light, and on the downbeat it falls to Mir’s third with bass and bell.',
    controls:['Ground (Night, Cobalt, Paper): the mode','Duration 2.0–5.0 s: the tempo (240–96 BPM)'],
    computed:['each ring dot: a target on its ring, a loose radial offset (seeded noise, ±0.42 ring steps) and a stray start (1.5–2.8× its radius, angle swung up to ±0.6 rad)','gather timing: ring group ⌊(i − 1) · 8 ÷ rings⌋ lands on 16th 2, 3, 4, 6, 7, 8, 10 or 11, with a seeded jitter that shrinks to zero','light: M.atmos ray dots, each with a seeded threshold so they arrive by count'],
    placeholder:[],
    root:'',
    rules:['the wordmark changes opacity only: no scale, no motion','the accent is the last thing to lock, on the downbeat with the third'],
    engine:['M.ring','M.atmos','M.logo','M.logoGeo','M.logoMask','M.noise','M.ease.inOutCubic','M.ease.outCubic','M.music.score','M.music.env','M.Buf','M.text','M.rule','M.fill']
  },
  aspect:w=>w/geo12(w).H,
  state:{ground:'night',dur:3},
  controls:[{id:'ground',type:'select',label:'Ground',play:true,options:G12.map(k=>({value:k,label:M.PAL[k].name}))},
    {id:'dur',type:'range',label:'Duration',min:2,max:5,step:.1,fmt:v=>(+v).toFixed(1)+' s'}],
  music:music12,
  musicParam:param12,
  render(g,w,h,M,st){ L12frame(g,w,h,st,st.dur*1000+9000); },
  animate(g,w,h,M,st,t){ const D=st.dur*1000; if(c5RM()) t=D+9000; L12frame(g,w,h,st,t); return t<D+1500; } });

/* ════════════════════════════════════════════════════════════════════════
   L-13 · Icon and splash. The icon is the field at the tittle: rings centered in a rounded square
   (corner 22.37 % of the side), the accent at the center. Small sizes get fewer, heavier rings (ring count and dot weight
   are a function of the side, below). The splash is the same field opening: the icon's square grows to the screen, its rings
   spread to the screen's pitch, its center travels to where the tittle will be, and the accent dot opens into the ring that
   holds the tittle. 1.4 s, computed per dot from one set of end-state dots.
   ════════════════════════════════════════════════════════════════════════ */
const G13=['night','olive','cobalt','paper'], RAD13=.2237;
function c5iconSpec(s,master){ return master?{n:6,r:.8,w:1.6,dpl:.8,ring:true}:s>=150?{n:5,r:.85,w:1.7,dpl:.8,ring:true}:s>=50?{n:3,r:.9,w:1.6,dpl:1.05,ring:false}:{n:2,r:.8,w:1.25,dpl:1.5,ring:false}; }
/* a small accent dot built as two tight rings and a core: round at 29 px, never a ragged blob */
function c5dotC(B,cx,cy,rd,col,r,seed){ B.dot(cx,cy,r*1.1,col); [.45,.85].forEach((f,i)=>{ const n=Math.max(5,Math.round(TAU*rd*f/(r*1.5))), ph=(seed||0)*.7+i*.5; for(let k=0;k<n;k++){ const a=ph+k/n*TAU; B.dot(cx+Math.cos(a)*rd*f,cy+Math.sin(a)*rd*f,r,col); } }); }
function c5icon(g,x,y,s,P,seed,master){ const S=c5iconSpec(s,master), rr=s*RAD13, cx=x+s/2, cy=y+s/2, step=s*.5/(S.n+.55);
  c5rr(g,x,y,s,s,rr,P.ground,P.k==='paper'?c5mix(P.ground,P.ink,.22):null);
  const B=new M.Buf(g,(px,py)=>!c5inRR(px,py,x+.6,y+.6,s-1.2,s-1.2,rr));
  for(let i=1;i*step<s*.72;i++) M.ring(B,{cx,cy,R:i*step,w:S.w*(.9+.2*Math.min(1,i/4)),swell:.4,dpl:S.dpl,rCore:S.r,rEdge:S.r*.6,seed:seed*7+i*13,color:P.ring});
  if(S.ring) M.ring(B,{cx,cy,R:step*.5,w:S.w*.8,swell:.3,dpl:2,rCore:S.r,rEdge:S.r*.6,seed:seed+3,color:P.acc});
  else c5dotC(B,cx,cy,step*.46,P.acc,S.r*.85,seed);
  B.flush(); }
function lay13(w){ const wide=w>=480, pad=wide?24:16, inner=w-2*pad, o={wide,pad,inner};
  o.labY=pad+8; o.tY=c5q(pad+(wide?56:50)); o.ts=wide?32:28; const top=c5q(o.tY+(wide?36:30));
  if(wide){ const lw=Math.min(240,Math.max(200,inner*.38)), gap=28; o.big=[pad,top,Math.min(lw,216)]; o.i180=[pad,c5q(top+o.big[2]+44)]; o.i60=[pad,c5q(o.i180[1]+180+44)]; o.i29=[pad+60+28,o.i60[1]+31];
    const px=pad+lw+gap, pw=Math.min(300,w-pad-px), ph=c5q(pw*2.165); o.ph=[px+(w-pad-px-pw)/2,top,pw,ph]; o.H=c5q(Math.max(top+ph+48,o.i60[1]+60+48)+16); }
  else { const bs=Math.min(180,inner-180-14); o.big=[pad,top,bs]; o.i180=[pad+bs+14,top]; o.i60=[pad,c5q(top+180+44)]; o.i29=[pad+60+28,o.i60[1]+31];
    const pw=Math.min(280,inner), ph=c5q(pw*2.165), y=c5q(o.i60[1]+60+56); o.ph=[pad+(inner-pw)/2,y,pw,ph]; o.H=c5q(y+ph+48+16); }
  return o; }
function geo13(w){ const L=lay13(w), [sx,sy,pw,ph]=L.ph, cr=pw*.13, xh=pw*.075, g0=M.logoGeo(0,0,xh), geo=M.logoGeo(Math.round(sx+(pw-g0.w)/2),Math.round(sy+ph*.47),xh);
  const cx=geo.tittle.cx, cy=geo.tittle.cy, step=pw*.068, Rmax=Math.hypot(Math.max(cx-sx,sx+pw-cx),Math.max(cy-sy,sy+ph-cy))+step, km=M.logoMask(geo,xh*.16), am=M.logoMask(geo,Math.max(1,xh*.05));
  const cap=c5cap(); for(let i=1;i*step<Rmax;i++){ const n0=cap.X.length; M.ring(cap,{cx,cy,R:i*step,w:1.7,swell:.5,dpl:.62,rCore:.88,rEdge:.5,seed:i*11+2,color:'r'}); for(let j=n0;j<cap.X.length;j++) cap.C[j]=i; }
  const N=cap.X.length, A=new Float32Array(N), CO=new Float32Array(N), SI=new Float32Array(N), K=new Float32Array(N), I=new Float32Array(N), RR=Float32Array.from(cap.R), KO=new Uint8Array(N);
  for(let j=0;j<N;j++){ const dx=cap.X[j]-cx, dy=cap.Y[j]-cy; A[j]=Math.atan2(dy,dx); CO[j]=Math.cos(A[j]); SI[j]=Math.sin(A[j]); I[j]=cap.C[j]; K[j]=(Math.hypot(dx,dy)-cap.C[j]*step)/step; KO[j]=km(cap.X[j],cap.Y[j])?1:0; }
  /* ring groups for the partials: group ⌊(i − 1) · 8 ÷ rings⌋, inner first */
  let nr=1; for(let j=0;j<N;j++) nr=Math.max(nr,I[j]); const GR=new Uint8Array(N); for(let j=0;j<N;j++) GR[j]=Math.min(7,Math.floor((I[j]-1)*8/nr));
  /* accent: a disc of dots in the icon, a ring around the tittle on the splash. Each dot keeps its angle; its radius opens. */
  const cR=Math.max(geo.tittle.w,geo.tittle.h)*1.05, R=M.rng(1313), NA=Math.round(cR*TAU*2.2), AA=new Float32Array(NA), AF=new Float32Array(NA), AK=new Float32Array(NA);
  for(let j=0;j<NA;j++){ AA[j]=(j+R())/NA*TAU; AF[j]=Math.sqrt(R()); AK[j]=R.gauss()*.5; }
  const s0=Math.round(pw*.23);
  return {L,sx,sy,pw,ph,cr,xh,geo,cx,cy,step,N,A,CO,SI,K,I,RR,KO,GR,cR,NA,AA,AF,AK,am,s0,step0:s0*.5/3.55}; }
function base13(st,w,h){ return c5slot(st,'base',c5DK(w,h)+st.ground,()=>{ const L=lay13(w), P=c5pal(st.ground), Pp=c5pal('paper'), {cv,g}=c5off(w,h), ink=Pp.ink, soft=Pp.soft;
  M.fill(g,Pp.ground);
  c5lab(g,'L-13 · UI · icon and splash',L.pad,L.labY,ink,L.wide?10:9.5);
  c5disp(g,'Icon and splash',L.pad-1,L.tY,L.ts,ink);
  const [bx,by,bs]=L.big; c5icon(g,bx,by,bs,P,1,true);
  c5lab(g,'1024 · master',bx,by+bs+18,ink,9.5); c5lab(g,L.wide?'shown at '+Math.round(bs/1024*100)+'% · 6 rings · accent ring':'at '+Math.round(bs/1024*100)+'% · 6 rings',bx,by+bs+31,soft,9);
  c5icon(g,L.i180[0],L.i180[1],180,P,2); c5lab(g,'180 · true size',L.i180[0],L.i180[1]+180+18,ink,9.5); c5lab(g,'5 rings · accent ring',L.i180[0],L.i180[1]+180+31,soft,9);
  c5icon(g,L.i60[0],L.i60[1],60,P,3); c5lab(g,'60',L.i60[0],L.i60[1]+60+18,ink,9.5); c5lab(g,'3 rings',L.i60[0],L.i60[1]+60+31,soft,9);
  c5icon(g,L.i29[0],L.i29[1],29,P,4); c5lab(g,'29',L.i29[0],L.i60[1]+60+18,ink,9.5); c5lab(g,'2 rings · accent dot',L.i29[0],L.i60[1]+60+31,soft,9);
  const [sx,sy,pw,ph]=L.ph; c5lab(g,'Splash · 1.4 s · icon → field → wordmark',sx,sy+ph+22,ink,9.5); c5lab(g,'flat screen, no device · '+Math.round(pw)+' × '+Math.round(ph)+' pt',sx,sy+ph+36,soft,9);
  if(P.k==='paper') c5rr(g,sx,sy,pw,ph,pw*.13,null,c5mix(P.ground,P.ink,.22));
  return cv; }); }
/* splash at t ms of its one bar (172 BPM, b = 349 ms). The square grows from 16th 1 to beat 2.5 (inOutCubic) as its rings spread
   to the screen's pitch and its center travels to the tittle; the wordmark fades in over beats 2–3.25; the accent dot opens into
   the ring around the tittle over beats 2.5–4, closing on the next downbeat. Ring groups swell on their partials; the accent
   answers the bell (center arrives) and the arrival chord. */
const BPM13=172, B13=60000/BPM13;
function splash13(g,w,h,st,tms){ const G=c5slot(st,'geo',c5DK(w,h),()=>geo13(w)), P=c5pal(st.ground), {sx,sy,pw,ph}=G, b=B13;
  const e=E.inOutCubic(cl((tms-.25*b)/(2.25*b))), la=E.inOutCubic(cl((tms-2*b)/(1.25*b))), ea=E.inOutCubic(cl((tms-2.5*b)/(1.5*b)));
  const eg=[]; for(let n=0;n<8;n++) eg.push(1+.9*m2_env(st,'p'+n,tms,150)); const ek=Math.max(m2_env(st,'center',tms,320),m2_env(st,'arrive',tms,480)), ka=1+1.2*ek, kr=1+.25*m2_env(st,'arrive',tms,480);
  const s0=G.s0, X0=sx+(pw-s0)/2, Y0=sy+(ph-s0)/2, bx=lerp(X0,sx,e), by=lerp(Y0,sy,e), bw=lerp(s0,pw,e), bh=lerp(s0,ph,e), rr=lerp(s0*RAD13,G.cr,e);
  const cx=lerp(sx+pw/2,G.cx,e), cy=lerp(sy+ph/2,G.cy,e), step=lerp(G.step0,G.step,e), rd=lerp(.95,.88,e);
  if(P.k==='paper'&&e<1) c5rr(g,bx,by,bw,bh,rr,null,c5mix(P.ground,P.ink,.22));
  c5rr(g,bx+.3,by+.3,bw-.6,bh-.6,rr,P.ground,null);
  const by_=new Map(), add=(x,y,r,c)=>{ let a=by_.get(c); if(!a){ a=[]; by_.set(c,a); } a.push(x,y,r); }, mr=M.minR(g);
  const x0=bx+.5, y0=by+.5, x1=bx+bw-.5, y1=by+bh-.5, r2=rr-.5;
  /* dots are stored ring by ring, so the loop stops at the first ring wholly outside the opening square */
  const far=Math.hypot(Math.max(cx-x0,x1-cx),Math.max(cy-y0,y1-cy))+step, kd=rd/.88*kr;
  for(let j=0;j<G.N;j++){ const rad=(G.I[j]+G.K[j])*step; if(G.I[j]*step>far) break; if(G.KO[j]&&la>.02) continue; const x=cx+G.CO[j]*rad, y=cy+G.SI[j]*rad; if(x<x0||x>x1||y<y0||y>y1) continue; if(!c5inRR(x,y,x0,y0,x1-x0,y1-y0,r2)) continue; add(x,y,G.RR[j]*kd*eg[G.GR[j]],P.ring); }
  const rd0=G.step0*.46;
  for(let j=0;j<G.NA;j++){ const a=G.AA[j], rad=lerp(G.AF[j]*rd0,G.cR+G.AK[j],ea), x=cx+Math.cos(a)*rad, y=cy+Math.sin(a)*rad; if(la>.5&&G.am(x,y)) continue; add(x,y,lerp(.8,.95,ea)*ka,P.acc); }
  for(const [c,a] of by_){ g.fillStyle=c; g.beginPath(); for(let i=0;i<a.length;i+=3){ const r=Math.max(mr,a[i+2]); g.moveTo(a[i]+r,a[i+1]); g.arc(a[i],a[i+1],r,0,TAU); } g.fill(); }
  if(la>0){ g.save(); g.globalAlpha=la; M.logo(g,G.geo.x,G.geo.base,G.xh,{color:P.ink}); g.restore(); } }
/* the splash's score: one bar at 172 BPM, the icon's 1.4 s. The icon opening is a glide rising from the root (the person) to
   Mir's third, D4 → F#5, across the growth. The rings spreading are partials of D: eight on 16ths, one per ring group, inner
   first, over an open fifth. A bell on the root when the center reaches the tittle; on the next downbeat, as the accent ring
   closes, the third fills the chord. Ground is the mode: night (Dorian) rises to F and leaves out the 5th partial; olive
   (Mixolydian) adds the 7th partial; cobalt (Lydian) the 9th. */
const PART13={ionian:[2,3,4,5,6,8,10,12],lydian:[2,3,4,5,6,8,9,10],mixolydian:[2,3,4,5,6,7,8,10],dorian:[2,3,4,6,8,9,12,16],aeolian:[2,3,4,6,8,9,12,16]};
function music13(st){ const S=mu.score({bpm:BPM13,ground:st.ground}), md=S.mode, o=12*S.feel.oct, b=B13, minor=md==='dorian'||md==='aeolian', home=minor?'Dm':'D', f0=m2_hz(50+o,'D'), PT=PART13[md]||PART13.ionian;
  S.harm([[0,'D'],[4*b,home]]);
  S.chord(0,'pad',[50,57],4*b,{attack:.2,release:.6,cutoff:760,vel:.47},['bed',.3]);
  S.note(0,'pluck','D2',260,{cutoff:360,vel:.70});
  S.note(.25*b,'glide',62+o,3.75*b+1200,{id:'up',attack:.05,release:1.1,vel:.61,vibrato:5,tone:3200,pan:-.1},['glide',.3]);
  S.glide(.25*b+30,'up',mu.deg(md,2,5)+o,2.25*b);
  PT.forEach((p,n)=>S.note((.5+n/4)*b,'mallet',{hz:f0*p},900,{vel:.58-.02*n,ratio:4,bright:.8,pan:-.5+n/7},['p'+n,1]));
  S.note(2.5*b,'bell',mu.deg(md,0,6)+o,2000,{ratio:3.5,vel:.57,pan:.15},['center',1]);
  S.chord(4*b,'mallet',[mu.deg(md,0,4),mu.deg(md,2,4),mu.deg(md,4,4),mu.deg(md,0,5)].map(m=>m+o),1600,{vel:.57,trem:5,over:home},['arrive',1]);
  S.chord(4*b,'pad',[50,mu.deg(md,2,3),57],1600,{attack:.06,release:1.2,cutoff:1100,vel:.49,over:home});
  S.note(4*b,'pluck','D2',300,{cutoff:380,vel:.71});
  S.end(4*b+1500); return S.out(); }
M.piece({ id:'L-13',
  caption:'The app icon at 1024, 180, 60 and 29, and the splash it opens into; smaller icons use fewer, heavier rings. Change Ground or press Play to watch the icon open into the field and the wordmark.',
  alt:'Four rounded-square app icons from large to tiny, each with concentric stippled rings and a red center, labeled 1024, 180, 60 and 29. Beside them a flat phone screen: the rings fill it, centered on the i of the mindgut wordmark, with a red ring around the tittle.',
  recipe:{
    idea:'No new mark: the icon is a crop of the same field at the tittle, so the splash opens in one continuous move on every ground.',
    marks:['ring','center','dot'],
    ground:'night, olive, cobalt, paper',
    accent:'the center: a ring in the two larger icons, a dot at 60 and 29, and the ring around the tittle on the splash',
    composition:'Icons at 1024 (shown reduced), 180, 60 and 29 at left (a 2-up block on phones); a flat phone splash screen at right (below on phones).',
    motion:'One bar at 172 BPM (1.4 s): the square grows from the first 16th to beat 2.5 (inOutCubic) as its rings spread, each ring group swelling on its 16th; the wordmark fades in over beats 2–3.25; the accent opens into the tittle’s ring and closes on the next downbeat. Reduced motion shows the end frame.',
    sound:'Opening is a glide rising from the root to Mir’s third; the spreading rings are partials of D, one per 16th; a bell on the root as the center reaches the dot; then the chord fills in as the accent closes. Ground sets the mode.',
    controls:['Ground (Night, Olive, Cobalt, Paper): the mode'],
    computed:['icon: rounded square, corner 22.37% of the side; ring count and dot weight by size (6 rings at 1024, 5 at 180, 3 at 60, 2 at 29)','splash: every dot keeps its angle and ring index; its radius scales with the ring pitch as the square opens','ring group ⌊(i − 1) · 8 ÷ rings⌋ sounds partial n of D'],
    placeholder:[],
    root:'',
    rules:['small sizes get fewer, heavier rings; the 29 px center is a built dot that stays round'],
    engine:['M.ring','M.logo','M.logoGeo','M.logoMask','M.Buf','M.ease.inOutCubic','M.music.score','M.music.env','M.text','M.rule','M.fill']
  },
  aspect:w=>w/lay13(w).H,
  state:{ground:'night'},
  controls:[{id:'ground',type:'select',label:'Ground',play:true,options:G13.map(k=>({value:k,label:M.PAL[k].name}))}],
  music:music13,
  render(g,w,h,M,st){ c5blit(g,base13(st,w,h)); splash13(g,w,h,st,4*B13+9000); },
  animate(g,w,h,M,st,t){ if(c5RM()) t=4*B13+9000; const G=c5slot(st,'geo',c5DK(w,h),()=>geo13(w)), d=g.dpr, B=base13(st,w,h);
    /* only the screen region changes: restore it from the base, then draw the splash */
    const x=Math.floor((G.sx-2)*d), y=Math.floor((G.sy-2)*d), W=Math.ceil((G.pw+4)*d), H=Math.ceil((G.ph+4)*d); g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(B,x,y,W,H,x,y,W,H); g.restore();
    splash13(g,w,h,st,t); return t<4*B13+700; } });

/* ════════════════════════════════════════════════════════════════════════
   L-14 · A quiet nudge. Mir does not ping. A lock-screen card and an in-app banner each carry a small field (three rings
   and the accent) with one stray waiting at its edge. Arrive: the stray drifts in along a shallow arc and settles into the
   outer ring, shrinking to the ring's own dot size, so it becomes indistinguishable from what it joined. Each Arrive brings
   a different stray (seeded angle) and its line. All copy invented; times and dates are placeholders.
   ════════════════════════════════════════════════════════════════════════ */
const LINES14=['Something from Tuesday found its place.','What you said about the move settled in.','A line from this morning found where it goes.'];
const DAY14=['Tuesday','Sunday','this morning'];
const NOTES14=[['No badge, no count','Nothing to clear. Nothing accumulates.'],['One plain line','No question, no streak, no “come back”.'],['Silent by default','Only the person turns sound on.'],['Opens where it landed','Tapping shows the stray in its ring, with its line.']];
const C14={ground:'#0f0c0c',scr:'#161212',card:'#221d1d',ink:'#efefef',soft:'#a19c9b',dim:'#6f6968',hair:'#2e2828',acc:'#d4142a'};
function lay14(w){ const wide=w>=480, pad=wide?24:16, inner=w-2*pad, o={wide,pad,inner}; o.labY=pad+8; o.tY=c5q(pad+(wide?56:50)); o.ts=wide?32:28; const top=c5q(o.tY+(wide?36:30));
  if(wide){ const lw=Math.min(300,Math.round(inner*.48)), lh=c5q(lw*2.165); o.lock=[pad,top,lw,lh]; const x2=pad+lw+28, rw=w-pad-x2; o.ban=[x2,top+28,rw,c5q(Math.max(196,rw*.8))]; o.notesY=c5q(o.ban[1]+o.ban[3]+44); o.nx=x2; o.nw=rw; o.H=c5q(top+lh+40); }
  else { const lw=Math.min(300,inner), lh=c5q(lw*2.165); o.lock=[pad+(inner-lw)/2,top,lw,lh]; o.ban=[pad,c5q(top+lh+60),inner,c5q(Math.max(196,inner*.62))]; o.notesY=c5q(o.ban[1]+o.ban[3]+44); o.nx=pad; o.nw=inner;
    let y=o.notesY+20; NOTES14.forEach(n=>{ y+=18+c5paraN(n[1],inner-28,{size:13})*18+14; }); o.H=c5q(y+24); }
  /* card geometry: lock-screen notification and in-app banner, each with its small field */
  const [lx,ly,lw,lh]=o.lock, cx0=lx+12, cw=lw-24, cy0=c5q(ly+lh*.42); o.card=[cx0,cy0,cw,c5q(Math.max(92,cw*.36))]; o.f1={cx:cx0+12+19,cy:cy0+58,R:6,rs:1};
  const [bx,by,bw,bh]=o.ban, bcy=by+52; o.bcard=[bx+12,bcy,bw-24,c5q(Math.max(84,bh*.4))]; o.f2={cx:bx+12+14+24,cy:bcy+o.bcard[3]/2,R:7.6,rs:1.25};
  return o; }
/* one small field: three rings + the accent dot, and the stray at angle a. u ∈ [0,1]: 0 waiting at the edge, 1 settled.
   ec: the center answering the motif; el: the landing (the stray brightens, the outer ring takes it in) */
function field14(B,F,a,u,seed,ec,el){ const R=F.R, rs=F.rs;
  for(let i=1;i<=3;i++){ const k=i===3?1+.55*el:1; M.ring(B,{cx:F.cx,cy:F.cy,R:R*i,w:.95*rs,swell:.3,dpl:1.05/rs,rCore:.8*rs*k,rEdge:.55*rs*k,seed:seed*5+i,color:C14.ink}); }
  c5dotC(B,F.cx,F.cy,R*.42*(1+.25*ec),C14.acc,.72*rs*(1+.6*ec),seed);
  const e=E.inOutCubic(u), r0=R*5, r1=R*3, aa=a+(1-e)*.6, rr=lerp(r0,r1,e)+Math.sin(e*Math.PI)*R*.35; B.dot(F.cx+Math.cos(aa)*rr,F.cy+Math.sin(aa)*rr,lerp(1.4,.8,e*e)*rs*(1+1.3*el),C14.ink); }
function base14(st,w,h){ return c5slot(st,'base',c5DK(w,h)+'|'+st.n,()=>{ const L=lay14(w), C=C14, {cv,g}=c5off(w,h), line=LINES14[st.n%3];
  M.fill(g,C.ground);
  c5lab(g,'L-14 · UI · notification',L.pad,L.labY,C.ink,L.wide?10:9.5);
  c5disp(g,'A quiet nudge',L.pad-1,L.tY,L.ts,C.ink);
  /* lock screen: flat, no device */
  const [lx,ly,lw,lh]=L.lock; c5rr(g,lx,ly,lw,lh,lw*.12,C.scr,C.hair);
  M.text(g,'Thursday 22 October',lx+lw/2,ly+lh*.1,{size:14,weight:400,color:C.soft,align:'center'});
  M.text(g,'7:42',lx+lw/2,ly+lh*.1+lw*.27,{size:lw*.27,weight:300,track:-.04,color:C.ink,align:'center'});
  const [cx,cy,cw,ch]=L.card; c5rr(g,cx,cy,cw,ch,14,C.card,null);
  const gq=M.logo(g,cx+12,cy+22,8,{color:C.ink}); c5lab(g,'now',cx+cw-12,cy+22,C.soft,9,{align:'right'});
  c5para(g,line,cx+12+44,cy+50,cw-56-12,{size:13.5,weight:400,lh:18,color:C.ink,track:0});
  c5lab(g,'wordmark · 8 px x-height',lx+lw/2,ly+lh-18,C.dim,9,{align:'center'});
  /* in-app banner */
  const [bx,by,bw,bh]=L.ban; c5lab(g,'In-app banner',bx,by-12,C.ink,9.5);
  c5rr(g,bx,by,bw,bh,14,C.scr,C.hair); M.logo(g,bx+14,by+24,9,{color:C.ink}); c5lab(g,'Mir · listening',bx+bw-14,by+24,C.dim,9,{align:'right'}); M.rule(g,bx+14,by+36,bx+bw-14,by+36,C.hair);
  const [ux,uy,uw,uh]=L.bcard; c5rr(g,ux,uy,uw,uh,12,C.card,null);
  const tx=ux+14+48+14, lines=M.wrap(g,line,uw-(tx-ux)-14,{size:14,weight:400}), ty=uy+uh/2-((lines.length-1)*19)/2+5; lines.forEach((l,i)=>M.text(g,l,tx,ty+i*19,{size:14,weight:400,color:C.ink}));
  const y2=uy+uh+26; M.text(g,'I keep putting off the call.',bx+14,y2,{size:13,weight:300,color:C.dim}); if(y2+22<by+bh-8) M.text(g,'That’s all right. It will keep.',bx+14,y2+22,{size:13,weight:300,color:C.soft});
  /* rules */
  c5lab(g,'Rules · proposed',L.nx,L.notesY,C.ink,9.5); let y=L.notesY+24;
  NOTES14.forEach((n,i)=>{ c5lab(g,String(i+1).padStart(2,'0'),L.nx,y,C.dim,9); M.text(g,n[0],L.nx+28,y,{size:13.5,weight:500,color:C.ink}); y=c5para(g,n[1],L.nx+28,y+18,L.nw-28,{size:13,lh:18,color:C.soft})+(L.wide?20:22); });
  return cv; }); }
function dyn14(g,st,w,h,u,t){ const L=lay14(w), B=new M.Buf(g), a=A14[st.n%3], ec=m2_env(st,'m*',t,260), el=m2_env(st,'land',t,520);
  field14(B,L.f1,a,u,st.n+1,ec,el); field14(B,L.f2,a,u,st.n+1,ec,el); B.flush(); }
/* the nudge, 4/4 at 82 BPM (b = 732 ms). The field calls the motif, loose: 5 ↑ 1 ↑ 4 on organ 8ths, and the stray starts to drift
   on the 4 (beat 1). The 4 is held, wavering, over the person and the model (D and A) while the stray drifts, and falls to the
   third exactly as the stray settles into the outer ring (beat 3, 2.2 s): the suspension resolves; no ping. The pad warms with the
   third and the low D answers. Each Arrive is a different stray: its angle sets the pan and which octave the line sits in. */
const BPM14=82, B14=60000/BPM14, A14=[-2.35,2.5,-1.8];
function music14(st){ const S=mu.score({bpm:BPM14}), b=B14, a=A14[st.n%3], pan=Math.cos(a)*.45, o=st.n%3===1?-12:0;
  S.harm([[0,'Dsus4'],[3*b,'D']]);
  S.note(0,'organ','D3',3*b+1600,{attack:.35,release:1.4,vel:.48,vibrato:2,cutoff:2200},['bed',.3]);
  S.note(0,'organ','A3',3*b+1600,{attack:.35,release:1.4,vel:.42,vibrato:2,cutoff:2200});
  S.note(0,'pluck','D2',320,{cutoff:340,vel:.62});
  S.note(0,'organ',57+o,b*.46,{attack:.03,release:.25,vel:.48,vibrato:0,pan},['m0',1]);
  S.note(b/2,'organ',62+o,b*.46,{attack:.03,release:.25,vel:.50,vibrato:0,pan},['m1',1]);
  S.note(b,'organ',67+o,2*b+1500,{id:'sus',attack:.06,release:1.3,vel:.54,vibrato:9,rate:4.6,pan},['m2',1]);
  /* the landing: the 4 falls to the 3 as the stray settles */
  S.glide(3*b,'sus',66+o,240);
  S.chord(3*b,'pad',[50,54,57],1800,{attack:.22,release:1.4,cutoff:900,vel:.42},['land',1]);
  S.note(3*b,'pluck','D2',360,{cutoff:360,vel:.60});
  S.end(3*b+1600); return S.out(); }
M.piece({ id:'L-14',
  caption:'A lock-screen card and an in-app banner, each with a small field, one stray dot waiting at its edge and one plain line. Press Arrive to watch the stray settle into the outer ring; each press brings a different one.',
  alt:'A flat phone lock screen on near-black: the date, the time 7:42, and a notification card with the small mindgut wordmark, a tiny field of three dotted rings with a red center and one loose dot at its edge, and the line “Something from Tuesday found its place.” Beside it, an in-app banner with the same field and line, and four proposed rules.',
  recipe:{
    idea:'A notification is the moment a stray finds its place, told in one line and shown as one dot joining a ring.',
    marks:['stray','ring','center'],
    ground:'night',
    accent:'the small field’s center dot, red',
    composition:'A flat lock screen with date, time and a notification card at left; an in-app banner with the same card and four proposed rules at right (stacked on phones).',
    motion:'Arrive, at 82 BPM: the center dot answers the motif’s three 8ths; on beat 1 the stray drifts in on a shallow arc and settles into the outer ring on beat 3 (1.46 s, inOutCubic), shrinking to the ring’s dot size, then brightens with the outer ring. Reduced motion shows it settled.',
    sound:'No ping: the field calls the motif loose, 5 ↑ 1 ↑ 4, on a soft organ over D and A; the 4 wavers while the stray drifts and falls to Mir’s third exactly as it settles, and the chord warms.',
    controls:['Arrive (cycles three strays and lines; each stray sets the pan and the line’s octave)'],
    computed:[],
    placeholder:['notification lines','date and time','banner conversation'],
    root:'',
    rules:['no badge, count, question, streak or sound by default','the card carries the wordmark at 8 px x-height'],
    engine:['M.ring','M.logo','M.Buf','M.ease.inOutCubic','M.text','M.wrap','M.rule','M.fill']
  },
  aspect:w=>w/lay14(w).H,
  state:{n:0},
  controls:[{id:'arrive',type:'button',label:'Arrive',play:true,run:st=>{ st.n=(st.n+1)%3; }}],
  music:music14,
  render(g,w,h,M,st){ c5blit(g,base14(st,w,h)); dyn14(g,st,w,h,0,-1e9); },
  animate(g,w,h,M,st,t){ if(c5RM()) t=3*B14+9000; c5blit(g,base14(st,w,h)); dyn14(g,st,w,h,cl((t-B14)/(2*B14)),t); return t<3*B14+1300; } });

/* ════════════════════════════════════════════════════════════════════════
   L-15 · What Mir keeps, as a screen. The memory ledger: kept marks grouped by theme as small clusters (phyllotaxis inside
   each, a faint ring of agreement around it), one selected mark read in the panel, and one plain action. Forget this:
   the mark's dots, and any ring dots inside its hollow, scatter outward and shrink to nothing (650 ms), leaving a clean
   hollow; the count drops; Undo is offered for 5 s and reassembles the same dots. Every theme, line, date and reason is
   invented placeholder. Light product tokens (2.2.59) on paper.
   ════════════════════════════════════════════════════════════════════════ */
const TH15=[
  ['work',11,['I start a new job Monday.','My manager moved the deadline again.','I said yes too fast again.']],
  ['sleep',7,['I sleep badly before trips.','Woke at four and couldn’t settle.','Slept through for the first time in weeks.']],
  ['the move',9,['The boxes are still in the hall.','I miss the old kitchen light.','We sign the lease on Friday.']],
  ['your brother',5,['I want to call my brother.','He sounded tired on the phone.','We laughed about the dog.']],
  ['mornings',8,['Mornings are the hardest.','Coffee before anything else.','I walked before work today.']],
  ['money',6,['Rent went up again.','I finally made a budget.','I keep checking the account.']],
  ['running',4,['Ran 5k without stopping.','My knee hurt on the hill.','A rain run, worth it.']],
  ['music',6,['That song from the car again.','I want to learn the piano part.','Played records all evening.']]];
const WHY15=['You came back to it twice.','You said it mattered.','It connects to three other things you said.','It changed how you talked about the week.'];
const C15={page:'#fafafa',surf:M.TOK.surface,card:M.TOK.card,border:M.TOK.border,ink:M.TOK.text,soft:'#5f646b',dim:'#9a9fa5',tint:'#b9bdc2',tintF:'#a9aeb4',acc:'#d4142a'};
const STRAYS15=3, UNDO15=5000, SCAT15=600, BACK15=450;
const c5day=n=>{ const d=new Date(Date.UTC(2026,9,24)-n*864e5); return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getUTCDay()]+' '+d.getUTCDate()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()]; };
const MARKS15=(()=>{ const R=M.rng(1515), out=[]; TH15.forEach(([name,n,lines],ti)=>{ for(let k=0;k<n;k++){ const d=1+((R()*58)|0), hh=7+((R()*16)|0), mm=(R()*60)|0;
  out.push({id:ti+':'+k,ti,k,n,theme:name,line:lines[k%lines.length],date:c5day(d)+' · '+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'),why:WHY15[(ti+k)%WHY15.length],used:'How Mir asks about '+name+'.',w:.8+R()*.45}); } }); return out; })();
const TOTAL15=MARKS15.length+STRAYS15;
function lay15(w){ const wide=w>=760, pad=wide?32:16, inner=w-2*pad, o={wide,pad,inner}; o.labY=pad+8; o.ts=wide?40:28; o.tY=c5q(pad+(wide?56:50)); const top=c5q(o.tY+(wide?36:28));
  const ax=pad, aw=inner, hh=52; o.app=[ax,top,aw,0]; o.hh=hh;
  if(wide){ const ah=c5q(Math.max(560,aw*.54)); o.app[3]=ah; const split=ax+Math.round(aw*.62); o.fr=[ax+24,top+hh+20,split-24,top+ah-20]; o.pn=[split,top+hh,ax+aw,top+ah]; o.H=c5q(top+ah+pad); }
  else { const fh=c5q(inner*1.9); o.fr=[ax+14,top+hh+16,ax+aw-14,top+hh+16+fh]; const py=o.fr[3]+16; o.pn=[ax,py,ax+aw,py+400]; o.app[3]=o.pn[3]-top; o.H=c5q(o.pn[3]+pad); }
  return o; }
function geo15(w){ const L=lay15(w), [x0,y0,x1,y1]=L.fr, cols=L.wide?4:2, rows=8/cols, gy0=y0+34, gy1=y1-(L.wide?34:40), cw=(x1-x0)/cols, ch=(gy1-gy0)/rows, R=M.rng(1501), cmax=Math.min(cw,ch-30)*.46, mr=Math.max(4,Math.min(6.4,cmax*.1));
  const clusters=[], marks=new Map();
  TH15.forEach(([name,n],ti)=>{ const c=ti%cols, r=(ti/cols)|0, cR=cmax*Math.sqrt(n/11)*.96, cx=x0+cw*(c+.5)+(R()-.5)*cw*.14, cy=gy0+ch*r+(ch-30)*.5+(R()-.5)*ch*.06, rot=R()*TAU, ringR=cR*1.1;
    /* the theme's own field: a faint ring of agreement and a fine tint inside it; a forgotten mark cuts a crisp hollow in both */
    const ring=c5cap(); M.ring(ring,{cx,cy,R:ringR,w:1.3,swell:.45,dpl:.7,rCore:.72,rEdge:.45,seed:ti*7+1,color:'r'});
    const tint=c5cap(); M.field(tint,{rng:M.rng(ti*31+5),box:[cx-cR,cy-cR,cx+cR,cy+cR],cell:1.9,r:.55,rj:.15,density:(px,py)=>{ const d=Math.hypot(px-cx,py-cy)/cR; return d<1?.5*(1-d*d*.55):0; },color:'t'});
    const ms=[]; for(let k=0;k<n;k++){ const m=MARKS15.find(q=>q.ti===ti&&q.k===k), rr=cR*.8*Math.sqrt((k+.55)/(n+.1)), a=rot+k*2.39996, x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr, rad=mr*m.w;
      /* a mark: an engraved dot (core, inner ring, outer ring) so it stays round and crisp at 4–7 px */
      const cap=c5cap(); cap.dot(x,y,Math.max(.7,rad*.2),'m'); [[.5,1.25],[.92,1.3]].forEach(([f,gap],q)=>{ const nn=Math.max(5,Math.round(TAU*rad*f/gap)), ph=k*.9+q*.4; for(let j=0;j<nn;j++){ const aa=ph+j/nn*TAU; cap.dot(x+Math.cos(aa)*rad*f,y+Math.sin(aa)*rad*f,q?.6:.66,'m'); } });
      ms.push({m,x,y,r:rad,hr:rad*1.85,dots:cap}); marks.set(m.id,ms[ms.length-1]); }
    clusters.push({ti,name,n,cx,cy,cR,ringR,ring,tint,ms}); });
  /* each mark's scatter set: its own dots plus the tint and ring dots inside its hollow, each with a seeded vector and delay */
  marks.forEach(mk=>{ const c=clusters[mk.m.ti], R2=M.rng(mk.m.ti*977+mk.m.k), X=[],Y=[],Rr=[],K=[], sc=[];
    const take=(cap,kind)=>{ for(let i=0;i<cap.X.length;i++){ if(kind!=='m'&&Math.hypot(cap.X[i]-mk.x,cap.Y[i]-mk.y)>=mk.hr) continue; X.push(cap.X[i]); Y.push(cap.Y[i]); Rr.push(cap.R[i]); K.push(kind); } };
    take(mk.dots,'m'); take(c.tint,'t'); take(c.ring,'r');
    for(let i=0;i<X.length;i++){ const a=Math.atan2(Y[i]-mk.y,X[i]-mk.x)+(R2()-.5)*1.1, d=c.cR*(.45+R2()*.7); sc.push(Math.cos(a)*d,Math.sin(a)*d,R2()*120); }
    mk.set={X,Y,R:Rr,K}; mk.sc=sc; });
  /* strays: kept, not yet placed. They wait together in the field's lower right, outside every theme. */
  const strays=[], sx=x1-(L.wide?150:120), sy=y1-(L.wide?22:26); [[0,0,1.6],[22,-12,1.3],[44,-3,1.8]].forEach(([dx,dy,r])=>strays.push([sx+dx,sy+dy,r]));
  return {L,clusters,marks,strays,mr}; }
const c5order15=MARKS15.map(m=>m.id);
/* hidden(id): forgotten, or mid-forgetting. Ring dots inside a hidden mark's hollow go with it. */
function base15(st,w,h,G){ const key=c5DK(w,h)+'|'+st.gone.join(',')+'|'+(st.sel||''); return c5slot(st,'base',key,()=>{ const L=G.L, C=C15, {cv,g}=c5off(w,h), B=new M.Buf(g);
  M.fill(g,C.page);
  c5lab(g,L.wide?'L-15 · UI · memory ledger · desktop':'L-15 · UI · memory ledger',L.pad,L.labY,C.ink,L.wide?10:9.5);
  c5disp(g,L.wide?'What Mir keeps, as a screen':'What Mir keeps',L.pad-1,L.tY,L.ts,C.ink);
  const [ax,ay,aw,ah]=L.app; M.fill(g,C.surf,ax,ay,aw,ah); c5box(g,ax,ay,ax+aw,ay+ah,C.border);
  M.logo(g,ax+20,ay+31,10,{color:C.ink});
  if(L.wide){ const nav=['Session','Kept','Settings']; let nx=ax+150; nav.forEach(n=>{ const tw=M.text(g,n,nx,ay+31,{size:14,weight:n==='Kept'?500:400,color:n==='Kept'?C.ink:C.soft}); if(n==='Kept') M.fill(g,C.ink,nx,ay+50,tw,2); nx+=tw+28; }); }
  M.rule(g,ax,ay+L.hh,ax+aw,ay+L.hh,C.border);
  const [px0,py0,px1,py1]=L.pn; M.fill(g,C.card,px0,py0,px1-px0,py1-py0); if(L.wide) M.rule(g,px0,py0,px0,py1,C.border); else M.rule(g,px0,py0,px1,py0,C.border);
  /* clusters */
  const hid=new Set(st.gone), holes=[]; G.marks.forEach(mk=>{ if(hid.has(mk.m.id)) holes.push(mk); });
  const inHole=(x,y)=>holes.some(mk=>Math.hypot(x-mk.x,y-mk.y)<mk.hr);
  G.clusters.forEach(c=>{ [[c.tint,C.tintF],[c.ring,C.tint]].forEach(([Rg,col])=>{ for(let i=0;i<Rg.X.length;i++){ if(inHole(Rg.X[i],Rg.Y[i])) continue; B.dot(Rg.X[i],Rg.Y[i],Rg.R[i],col); } });
    c.ms.forEach(mk=>{ if(hid.has(mk.m.id)||mk.m.id===st.sel) return; const D=mk.dots; for(let i=0;i<D.X.length;i++) B.dot(D.X[i],D.Y[i],D.R[i],C.ink); }); });
  G.strays.forEach(([x,y,r])=>B.dot(x,y,r,C.ink));
  B.flush();
  G.clusters.forEach(c=>{ const left=c.ms.filter(mk=>!hid.has(mk.m.id)).length, y=c.cy+c.ringR+20; const tw=M.text(g,c.name.toUpperCase(),-999,0,{font:'mono',size:9.5,weight:500,track:.12}), nw=M.text(g,' · '+left,-999,0,{font:'mono',size:9.5,weight:500,track:.12});
    c5lab(g,c.name,c.cx-(tw+nw)/2,y,C.ink,9.5); c5lab(g,' · '+left,c.cx-(tw+nw)/2+tw,y,C.soft,9.5); });
  if(G.strays.length){ const [sx,sy]=G.strays[0]; c5lab(g,'not yet placed · '+G.strays.length,sx-10,sy+4,C.soft,9,{align:'right'}); }
  return cv; }); }
function L15draw(g,w,h,st,t,act){ const G=c5slot(st,'geo',c5DK(w,0),()=>geo15(w)), L=G.L, C=C15, T=c5T(st), run=t!=null&&t>-1e8;
  /* the undo window: the forget run's own clock while it plays, the wall clock otherwise */
  if(T.pending){ const el=run&&act==='forget'&&!c5RM()?t:performance.now()-T.pending.wall; if(el>=UNDO15) T.pending=null; else T.left=Math.ceil((UNDO15-el)/1000); }
  c5blit(g,base15(st,w,h,G));
  const B=new M.Buf(g), [x0,y0,x1]=L.fr;
  /* scatter (forgetting) or reassembly (undo); the dots pulse on the sprinkle's notes */
  const KC={m:C.ink,t:C.tintF,r:C.tint}, anim=(mk,u,dir,pu)=>{ const D=mk.set, dur=dir>0?SCAT15:BACK15, lag=dir>0?120:0; for(let i=0;i<D.X.length;i++){ let v=cl((u*dur-(dir>0?mk.sc[i*3+2]:0))/(dur-lag)); if(dir<0) v=1-v; const e=E.outCubic(v); if(e>=1) continue;
    B.dot(D.X[i]+mk.sc[i*3]*e,D.Y[i]+mk.sc[i*3+1]*e,D.R[i]*(1-e)*(1+.9*pu),D.K[i]==='m'&&dir>0?C.acc:KC[D.K[i]]); } };
  let fm=null; if(run&&act==='forget'&&T.fid){ fm=G.marks.get(T.fid); if(fm&&t<SCAT15) anim(fm,t/SCAT15,1,Math.max(m2_env(st,'s*',t,110),m2_env(st,'k*',t,140))); }
  const restoring=run&&act==='undo'&&T.restore&&t<BACK15; if(restoring) anim(G.marks.get(T.restore),t/BACK15,-1,m2_env(st,'u*',t,110));
  /* the hollow, when the fifth is left: a fine ring traces its edge and fades with it */
  if(fm){ const eh=m2_env(st,'hol',t,650); if(eh>.03) M.ring(B,{cx:fm.x,cy:fm.y,R:fm.hr,w:.9,swell:.2,dpl:1.5,rCore:.35+.5*eh,rEdge:.3+.3*eh,seed:13,color:C.tint}); }
  /* the selected mark: the accent, with a fine ring that says "this one"; its dots swell on its motif's notes */
  const sel=st.sel&&G.marks.get(st.sel); if(sel&&!restoring){ const ek=run?m2_env(st,'k*',t,240):0, D=sel.dots; for(let i=0;i<D.X.length;i++) B.dot(D.X[i],D.Y[i],D.R[i]*(1+.85*ek),C.acc); M.ring(B,{cx:sel.x,cy:sel.y,R:sel.r+5+3*ek,w:.9,swell:.2,dpl:1.6,rCore:.62,rEdge:.45,seed:9,color:C.ink}); }
  B.flush();
  const kept=TOTAL15-st.gone.length;
  c5lab(g,L.wide?'Kept marks · by theme':'By theme',x0,y0+12,C.ink,9.5);
  c5lab(g,T.used?kept+' kept · 8 themes':'Click a mark to hear and read it',x1,y0+12,T.used?C.soft:C.acc,9.5,{align:'right'});
  const [ax,ay,aw]=L.app; c5lab(g,'Kept · '+kept,ax+aw-20,ay+31,C.ink,9.5,{align:'right'});
  /* panel */
  const [px0,py0,px1,py1]=L.pn, ip=L.wide?28:16, X=px0+ip, PW=px1-px0-2*ip; let y=py0+(L.wide?40:32); T.btn=null; T.undo=null;
  if(T.pending){ const mk=G.marks.get(T.pending.id), left=T.left||5;
    c5lab(g,'Forgotten · '+mk.m.theme,X,y,C.soft,9.5); y+=40; c5disp(g,'Gone from what Mir keeps.',X,y,L.wide?26:22,C.ink); y+=30;
    y=c5para(g,'Its dots have left the field and its place is a clean hollow. '+kept+' kept.',X,y,PW,{size:14,lh:20,color:C.soft})+28;
    const bw=120; M.fill(g,C.ink,X,y,bw,36); M.text(g,'Undo · '+left,X+bw/2,y+23,{size:14,weight:500,color:C.surf,align:'center'}); T.undo=[X,y,X+bw,y+36];
    M.text(g,'available for '+left+' s',X+bw+14,y+23,{size:13,weight:300,color:C.soft}); }
  else if(sel){ const m=sel.m; c5lab(g,'Kept mark · '+m.theme+' · '+(m.k+1)+' of '+m.n,X,y,C.soft,9.5); y+=L.wide?44:38;
    const qs=L.wide?26:22, ql=M.wrap(g,'“'+m.line+'”',PW,{size:qs,weight:300}); ql.forEach((l,i)=>c5disp(g,l,X-(i===0?6:0),y+i*c5q(qs*1.2),qs,C.ink)); y+=(ql.length-1)*c5q(qs*1.2)+28;
    [['Said',m.date],['Kept because',m.why],['Used for',m.used]].forEach(([k,v])=>{ M.rule(g,X,y,X+PW,y,C.border); y+=22; c5lab(g,k,X,y,C.soft,9); y=c5para(g,v,X+(L.wide?110:104),y,PW-(L.wide?110:104),{size:14,weight:400,lh:20,color:C.ink,track:0})+18; });
    M.rule(g,X,y,X+PW,y,C.border); y+=24; const bw=128; M.fill(g,C.surf,X,y,bw,36); c5box(g,X,y,X+bw,y+36,C.ink); M.text(g,'Forget this',X+bw/2,y+23,{size:14,weight:500,color:C.ink,align:'center'}); T.btn=[X,y,X+bw,y+36];
    c5para(g,'Undo for 5 seconds, then it is gone.',X+bw+14,y+23,PW-bw-14,{size:13,lh:18,color:C.soft}); }
  else { c5lab(g,'Nothing selected',X,y,C.soft,9.5); y+=44; c5disp(g,'Select a mark to read it.',X,y,L.wide?26:22,C.ink); y+=30; c5para(g,'Each mark is one thing you said that Mir kept. '+kept+' kept.',X,y,PW,{size:14,lh:20,color:C.soft}); }
  }
/* actions. Each sets what the next Play is (recall, forget or undo); the controls replay through the frame, so the score and
   the picture share one clock. */
function forget15(st){ const T=c5T(st); if(!st.sel){ T.act='recall'; return; } T.fid=st.sel; T.pending={id:st.sel,wall:performance.now()}; st.gone.push(st.sel); T.restore=null; st.sel=null; T.used=true; T.act='forget'; }
function undo15(st){ const T=c5T(st); if(!T.pending){ T.act='recall'; return; } const id=T.pending.id; st.gone=st.gone.filter(x=>x!==id); st.sel=id; T.pending=null; T.restore=id; T.act='undo'; }
/* L-15 music, 100 BPM (16th = 150 ms; the scatter is four 16ths, the reassembly three). Each kept mark is a remembered motif:
   three tones of the kept chord (D major 9, held on the pad as the memory), starting from its theme's tone, shaped by its place.
   Recall: the motif on mallet 8ths over the memory, a bell on its last tone. Forget: the motif backwards, 16ths, while its tone
   breaks into a falling sprinkle (each glide drops into the next lower chord tone, softer), timed to the scatter; the memory
   stops and what is left is a hollow fifth, D and A. Undo: the sprinkle rises back, the motif plays forward as the dots arrive,
   and the chord returns. */
const BPM15=100, B15=60000/BPM15, N16_15=B15/4, CT15=[62,66,69,73,76,78,81,85], SH15=[[0,1,2],[0,2,1],[1,0,2],[2,1,3],[0,2,4],[1,2,0]], MEM15=[50,57,61,64,66];
const mot15=m=>SH15[m.k%SH15.length].map(d=>CT15[m.ti%4+d]);
function music15(st,W){ const G=c5slot(st,'geo',c5DK(W,0),()=>geo15(W)), T=c5T(st), act=T.act||st.act||'recall', s16=N16_15, b=B15, S=mu.score({bpm:BPM15});
  const id=act==='forget'?(T.fid||st.sel):act==='undo'?(T.restore||st.sel):st.sel, mk=id&&G.marks.get(id); if(!mk){ S.end(10); return S.out(); }
  const mot=mot15(mk.m), pan=(mk.x/W-.5)*1.1, lo=Math.min(...mot);
  if(act==='forget'){ S.harm([[0,'Dmaj9'],[SCAT15,'D']]);
    S.chord(0,'pad',MEM15,SCAT15,{attack:.04,release:.45,cutoff:950,vel:.47});
    [2,1,0].forEach((k,i)=>S.note(i*s16,'mallet',mot[k],520,{vel:.63-.06*i,ratio:4,pan},['k'+k,1]));
    let m=lo; for(let i=0;i<5;i++){ const to=mu.ct('Dmaj9',m,-1); S.note(s16+i*s16/2,'glide',to,110,{from:m,glide:60,attack:.008,release:.09,vibrato:0,tone:2600,vel:.52-.05*i,pan:pan*(1+.15*i)},['s'+i,1]); m=to; }
    S.note(SCAT15,'organ','D3',1900,{attack:.08,release:1.2,vel:.53,vibrato:2,cutoff:2000},['hol',1]); S.note(SCAT15,'organ','A3',1900,{attack:.08,release:1.2,vel:.47,vibrato:2,cutoff:2000});
    S.end(SCAT15+2600); return S.out(); }
  if(act==='undo'){ S.harm([[0,'D'],[BACK15,'Dmaj9']]);
    for(let i=0;i<3;i++){ const to=mu.ct('Dmaj9',lo,i-3); S.note(i*s16,'glide',to,110,{from:mu.ct('Dmaj9',to,-1),glide:50,attack:.008,release:.09,vibrato:0,tone:2600,vel:.5+.05*i,pan},['u'+i,1]); }
    mot.forEach((m,k)=>S.note(BACK15+k*s16,'mallet',m,k===2?1500:700,{vel:.72+.03*k,ratio:4,trem:k===2?5:0,pan},['k'+k,1]));
    S.chord(BACK15,'pad',MEM15,1900,{attack:.15,release:1.2,cutoff:950,vel:.56});
    S.note(BACK15+2*s16,'bell',mot[2]+12,1800,{ratio:3,bright:.7,vel:.58,pan});
    S.end(BACK15+2400); return S.out(); }
  S.harm([[0,'Dmaj9']]);
  S.chord(0,'pad',MEM15,4*b,{attack:.3,release:1.2,cutoff:900,vel:.55},['bed',.3]);
  S.note(0,'pluck','D2',300,{cutoff:360,vel:.67});
  mot.forEach((m,k)=>S.note((k+1)*b/2,'mallet',m,k===2?1600:900,{vel:.76,ratio:4,trem:k===2?5:0,pan},['k'+k,1]));
  S.note(2*b,'bell',mot[2]+12,1800,{ratio:3,bright:.7,vel:.6,pan},['kb',.6]); S.note(2*b,'pluck','D2',300,{cutoff:360,vel:.63});
  S.end(4*b+800); return S.out(); }
M.piece({ id:'L-15',
  caption:'The memory ledger: everything Mir keeps, as marks grouped by theme, each with a remembered motif. Click a mark to hear and read it, then Forget this to scatter its dots into a clean hollow, with Undo for five seconds.',
  alt:'A flat desktop screen on white: the mindgut wordmark and a Kept tab; on the left eight small clusters of stippled dots, each inside a faint dotted ring and labeled work, sleep, the move, your brother, mornings, money, running, music; one dot is red and ringed. On the right a panel reads a kept line in quotes, its date, why it was kept, what it is used for, and a Forget this button.',
  recipe:{
    idea:'Forgetting is one plain action with a visible result: a clean hollow, and a count that says what changed.',
    marks:['dot','ring','stray','hollow'],
    ground:'paper (light product tokens, 2.2.59)',
    accent:'the selected mark, red; a forgotten mark flashes red as it scatters',
    composition:'A flat desktop app: header with wordmark, nav and count; eight theme clusters in a 4 × 2 grid at left (2 × 4 on phones); a reading panel at right (below on phones) with the line, when it was said, why it was kept, what it is used for and Forget this.',
    motion:'At 100 BPM. Play or a click: the selected mark swells on its motif’s 8ths. Forget this: its dots, with the ring and tint dots inside its hollow, scatter and shrink over four 16ths (outCubic, seeded delays up to 120 ms), then the hollow’s edge glows; Undo (5 s) reassembles them over three 16ths.',
    sound:'Each mark is a three-note motif from the kept chord. Forgetting plays it backwards while its tone breaks into a falling sprinkle and the chord drains to a hollow fifth; Undo rises back and plays it forward as the chord returns.',
    controls:['Next mark','Forget this','Undo (5 s)','click a mark to hear and read it'],
    computed:['marks placed by phyllotaxis in each cluster (2.39996 rad turn), cluster size by √count','motif: three tones of D major 9 from the theme’s tone, shaped by the mark’s index','hollow: ring and tint dots within 1.85 × the mark’s radius go with it','kept = marks + strays − forgotten'],
    placeholder:['themes, lines, dates and reasons','panel copy (written for this study)'],
    root:'',
    rules:['one action and Undo for 5 s; no confirmation maze'],
    engine:['M.ring','M.field','M.logo','M.Buf','M.ease.outCubic','M.music.score','M.music.env','M.TOK','M.text','M.wrap','M.rule','M.fill']
  },
  aspect:w=>w/lay15(w).H,
  state:{sel:'1:0',gone:[]},
  controls:[{id:'next',type:'button',label:'Next mark',play:true,run:st=>{ const T=c5T(st); T.used=true; T.pending=null; T.act='recall'; const ids=c5order15.filter(id=>!st.gone.includes(id)); if(!ids.length) return; const i=ids.indexOf(st.sel); st.sel=ids[(i+1)%ids.length]; }},
    {id:'forget',type:'button',label:'Forget this',play:true,run:st=>forget15(st)},
    {id:'undo',type:'button',label:'Undo',play:true,run:st=>undo15(st)}],
  music:music15,
  render(g,w,h,M,st){ const T=c5T(st); T.live={g,w,h}; L15draw(g,w,h,st,null,T.act||'recall'); },
  animate(g,w,h,M,st,t){ const T=c5T(st), act=T.act||'recall'; T.live={g,w,h}; if(c5RM()) t=9e3; L15draw(g,w,h,st,t,act); return act==='forget'?t<UNDO15:t<2600; },
  pointer(st,e){ const T=c5T(st);
    if(e.type==='down'){ T.down=[e.x,e.y,performance.now()]; return false; }
    if(e.type!=='up'||!T.down) return false; const [x0,y0,t0]=T.down; T.down=null; if(Math.hypot(e.x-x0,e.y-y0)>8||performance.now()-t0>800) return false;
    const inR=(r)=>r&&e.x>=r[0]&&e.x<=r[2]&&e.y>=r[1]&&e.y<=r[3];
    if(inR(T.undo)){ m2_press('L-15-undo'); return false; }
    if(inR(T.btn)){ m2_press('L-15-forget'); return false; }
    const G=c5slot(st,'geo',c5DK(e.w,0),()=>geo15(e.w)); let best=null, bd=1e9; G.marks.forEach(mk=>{ if(st.gone.includes(mk.m.id)) return; const d=Math.hypot(e.x-mk.x,e.y-mk.y); if(d<bd){ bd=d; best=mk; } });
    if(best&&bd<Math.max(14,best.r*2.6)){ st.sel=best.m.id; T.used=true; T.pending=null; T.act='recall'; m2_press('L-15-play'); return true; }
    return false; } });

})();
