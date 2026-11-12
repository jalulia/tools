/* agent B pieces · L-03, L-04, L-05, L-06, L-10 · round 2.
   Every figure is placed dots. Hairline M.rule only for plate frames, leaders and UI chrome; flat surfaces only in UI pieces.
   Type: Geist 300 for the editorial voice (tight at display sizes), Geist Mono uppercase for labels. No serif, no italic.
   Layout snaps to a 4 px baseline (q4). Animated pieces cache a static base layer per (w, h, dpr, settings) and draw only
   the moving dots per frame, so frames stay inside the budget. Helpers are prefixed b so they never collide with agent A. */
(function(){
'use strict';
const M=window.MIR, TAU=Math.PI*2, E=M.ease, cl=M.clamp01, lerp=M.lerp;
const q4=v=>Math.round(v/4)*4;
const bClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const bRM=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(_){ return false; } };
const bHex=c=>{ c=c.replace('#',''); return [0,2,4].map(i=>parseInt(c.slice(i,i+2),16)); };
/* a tint: ground mixed toward ink. Secondary dots use this, never a neutral gray. */
const bMix=(a,b,t)=>{ const A=bHex(a), B=bHex(b); return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join(''); };

/* per-state caches (WeakMap, so "Copy settings" never serializes them; Reset makes a new state and a fresh cache) */
const bWM=new WeakMap();
function bSlot(st,name,key,make){ let c=bWM.get(st); if(!c){ c={}; bWM.set(st,c); } const s=c[name]; if(s&&s.key===key) return s.v; const v=make(); c[name]={key,v}; return v; }
function bOff(w,h){ const cv=document.createElement('canvas'); const g=M.canvas(cv,w,h); return {cv,g}; }
function bBlit(g,cv){ g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(cv,0,0); g.restore(); }
const bDK=(w,h)=>w+'x'+h+'@'+Math.min(3,window.devicePixelRatio||1);

/* type */
let bMC=null; const bCtx=()=>{ if(!bMC){ bMC=document.createElement('canvas').getContext('2d'); bMC.dpr=1; } return bMC; };
function bMeasure(g,s,o={}){ const size=o.size||11; g.font=`${o.weight||400} ${size}px ${M.FONT[o.font||'display']}`; const str=o.upper?String(s).toUpperCase():String(s); const tr=(o.track||0)*size;
  if('letterSpacing' in g){ g.letterSpacing=tr+'px'; const w=g.measureText(str).width-tr; g.letterSpacing='0px'; return w; } return g.measureText(str).width+tr*(str.length-1); }
const bLab=(g,s,x,y,c,size=10,o={})=>M.text(g,s,x,y,Object.assign({font:'mono',size,weight:500,track:.14,upper:true,color:c},o));
const bTrk=s=>s>=40?-.04:s>=28?-.032:s>=18?-.018:-.006;
const bDisp=(g,s,x,y,size,c,o={})=>M.text(g,s,x,y,Object.assign({font:'display',size,weight:300,track:bTrk(size),color:c},o));
function bPara(g,s,x,y,maxW,o){ const oo=Object.assign({weight:300,track:bTrk(o.size)},o), lines=M.wrap(g,s,maxW,oo), lh=o.lh||o.size*1.45; lines.forEach((l,i)=>M.text(g,l,x,y+i*lh,oo)); return y+(lines.length-1)*lh; }
const bParaH=(g,s,maxW,o)=>M.wrap(g,s,maxW,Object.assign({weight:300},o)).length*(o.lh||o.size*1.45);
function bRect(g,x0,y0,x1,y1,c){ M.rule(g,x0,y0,x1,y0,c); M.rule(g,x1,y0,x1,y1,c); M.rule(g,x1,y1,x0,y1,c); M.rule(g,x0,y1,x0,y0,c); }

/* dots */
function bDisc(B,R,cx,cy,r,c,dens=.9,dr=.72){ M.field(B,{rng:R,box:[cx-r-1,cy-r-1,cx+r+1,cy+r+1],cell:Math.max(.8,r*.24),r:dr,rj:.15,density:(x,y)=>M.shape.disc(cx,cy,r,.4)(x,y)*dens,color:c}); }
const bBump=(t,c,wd)=>{ let d=Math.abs(t-c); d=Math.min(d,1-d); return Math.exp(-(d*d)/(2*wd*wd)); };
/* capture: run any engine stippler into arrays instead of the canvas (for per-dot animation) */
function bCap(){ const by=new Map(); return {by, dot(x,y,r,c){ let a=by.get(c); if(!a){ a=[]; by.set(c,a); } a.push(x,y,r); }}; }
/* ring with AM: dot radius swells and thins along the ring with slow noise, the way an engraved line breathes */
function bRingAM(B,R,cx,cy,Rr,o){ const cv=M.curve.ring(cx,cy,Rr,{ex:o.ex,ey:o.ey,rot:o.rot,wobble:o.wobble||0,seed:o.seed||0}), f=o.f||9, am=o.am??.35;
  for(let i=0;i<o.n;i++){ const t=(i+R())/o.n, p=cv(t), k=R.gauss()*(o.spread??.7), x=p[0]+p[2]*k, y=p[1]+p[3]*k, a=M.noise(t*f,(o.seed||0)*.37,5), c=o.color(x,y,t,R); if(c) B.dot(x,y,o.r*(1-am+2*am*a),c); } }
/* ── M1 music helpers (scores are composed by each piece's music(); these serve parameter answers) ── */
function m1_T(st){ if(!Object.prototype.hasOwnProperty.call(st,'_m1')) Object.defineProperty(st,'_m1',{value:{},writable:true,configurable:true,enumerable:false}); return st._m1; }
const m1_rl=(T,k,ms)=>{ const n=performance.now(); if(T['r_'+k]&&n-T['r_'+k]<ms) return false; T['r_'+k]=n; return true; };
const m1_home=md=>md==='dorian'||md==='aeolian'?'Dm':'D';
const m1_env=(st,k,t,tau)=>M.music&&t!=null?M.music.env(st,k,t,tau):0;
/* small composing ring (L-04 motion at marker size): n dots gather from radius r0 to r1 */
function bGather(B,cx,cy,r0,r1,u,n,c,dr,seed){ const R=M.rng(seed); for(let i=0;i<n;i++){ const th=i/n*TAU, ph=R()*TAU, s=R(), e=E.outCubic(cl((u-s*.3)/.7)); let d=((th-ph)%TAU+TAU*1.5)%TAU-Math.PI; const a=ph+d*e, rr=lerp(r0*(.55+.45*s),r1,e); B.dot(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,dr,c); } }

/* ════════════════════════════════════════════════════════════════════════
   L-03 · Listening · first run on a phone, flat frontal screen.
   The first ring is blue-noise (Poisson) points on one ring's annulus, accepted by a fixed per-point threshold against an
   angular density; the printed share = accepted / candidates (computed). Each line sent lands a stray at the ring's edge and
   adds a bump of agreement there, so the share rises with what you say. Strays breathe ±1 px on a 6 s period while visible.
   ════════════════════════════════════════════════════════════════════════ */
const G03={
  night:{name:'Night', ground:'#0f0c0c', scr:'#161212', ink:'#efefef', soft:'#a19c9b', dim:'#6a6463', hair:'#2c2626', inp:'#1f1a1a', inb:'#3a3333', acc:'#d4142a'},
  olive:{name:'Olive', ground:'#141912', scr:'#192016', ink:'#e7e9e6', soft:'#a3a898', dim:'#727a69', hair:'#2b3228', inp:'#1f261c', inb:'#38422f', acc:'#e0a232'},
  paper:{name:'Paper', ground:'#fafafa', scr:'#ffffff', ink:'#1a1a1a', soft:'#5f646b', dim:'#9a9fa5', hair:'#e0e0e0', inp:'#fafafa', inb:'#e0e0e0', acc:'#d4142a'}};
const SAY03=['I start a new job Monday.','I sleep badly before trips.','I want to call my brother.','Mornings are the hardest.','I said yes too fast again.'];
const LAND03=[.80,.06,.71,.15,.59];             /* where each sent line lands on the ring (fraction of a turn) */
const SR03=[2.0,1.15,1.55,.95,1.75,1.25,1.4];   /* sign-up strays: size varies with what each one is (placeholder) */
function lay03(w){ const g=bCtx(), wide=w>=480;
  if(wide){ const pad=24, H=q4(Math.min(w*1.32,820)), sy=96, sh=H-sy-pad, sw=q4(sh/2.08), nx=pad+sw+32; return {wide,pad,H,sx:pad,sy,sw,sh,nx,nw:w-pad-nx,ts:40,tb:76}; }
  const pad=16, sy=84, sh=q4(w*1.8), nw=w-2*pad-20; let nh=0; NOTE03('00.0',12).forEach(o=>{ nh+=20+bParaH(g,o.b,nw,{size:13,lh:18})+12; });
  return {wide,pad,H:q4(sy+sh+28+nh+36),sx:0,sy,sw:w,sh,nx:pad,nw,ts:32,tb:64}; }
function geo03(w,h){ const L=lay03(w), {sx,sy,sw,sh}=L, m=q4(Math.max(16,sw*.068)), xh=bClamp(sw*.03,8,10.5), hb=sy+m+12, hl=hb+m;
  const fx=sx+sw/2, fy=sy+sh*.36, rr=sw*.28, cs=bClamp(sw*.09,24,30), cy=q4(sy+sh*.66), ih=q4(bClamp(sw*.155,44,56)), ix=sx+m-4, iw=sw-2*(m-4), iy=q4(sy+sh-m-ih);
  /* sign-up strays */
  const SR=M.rng(77), st=[], box=[sx+m,hl+18,sx+sw-m,cy-cs-12];
  let guard=0; while(st.length<7&&guard++<4000){ const a=SR()*TAU, d=rr*(.45+SR()*1.15), x=fx+Math.cos(a)*d, y=fy+Math.sin(a)*d*.95; if(x<box[0]||x>box[2]||y<box[1]||y>box[3]) continue; if(Math.abs(Math.hypot(x-fx,y-fy)-rr)<9) continue; if(st.some(p=>Math.hypot(p.x-x,p.y-y)<rr*.36)) continue; const hal=[]; for(let q=0,nq=2+(SR()*2|0);q<nq;q++){ const aa=SR()*TAU, dd=2.8+SR()*2.2; hal.push(Math.cos(aa)*dd,Math.sin(aa)*dd,.6+SR()*.18); } st.push({x,y,r:SR03[st.length]*(sw<300?.9:1),p1:SR()*TAU,p2:SR()*TAU,hal}); }
  /* ring candidates: blue-noise points within ±2.6 px of a softly wobbling ring */
  const box2=[fx-rr-10,fy-rr-10,fx+rr+10,fy+rr+10], P=M.poisson(box2.map(v=>Math.round(v)),1.55,303), U=M.rng(31), cand=[];
  for(let i=0;i<P.length;i+=2){ const x=P[i], y=P[i+1], a=Math.atan2(y-fy,x-fx), t=((a/TAU)%1+1)%1, ra=rr*(1+.035*(M.noise(Math.cos(a)*1.3+5,Math.sin(a)*1.3+5,4)-.5)*2); if(Math.abs(Math.hypot(x-fx,y-fy)-ra)<2.6) cand.push(x,y,t,U()); }
  const land=LAND03.map(t=>{ const a=t*TAU; return {x:fx+Math.cos(a)*(rr+8),y:fy+Math.sin(a)*(rr+8),r:1.5,p1:t*17,p2:t*29}; });
  return {L,m,xh,hb,hl,fx,fy,rr,cs,cy,ih,ix,iw,iy,st,cand,land,send:[ix+iw-ih/2,iy+ih/2]}; }
/* the ring's angular agreement: a faint third, plus one bump per line said (prog 0..1 while a line is landing) */
const dens03=(t,n,prog)=>{ let d=.006+.22*bBump(t,.93,.07)+.08*bBump(t,.66,.03); for(let j=0;j<n;j++) d+=.3*bBump(t,LAND03[j],.04)*(j===n-1?prog:1); return d; };
function share03(G,n,prog){ let a=0; const c=G.cand; for(let i=0;i<c.length;i+=4) if(c[i+3]<dens03(c[i+2],n,prog)) a++; return a/(c.length/4); }
function base03(st,w,h){ return bSlot(st,'base',bDK(w,h)+st.ground+'|'+bLanded03(st),()=>{ const G=bSlot(st,'geo',bDK(w,h),()=>geo03(w,h)), L=G.L, C=G03[st.ground], {cv,g}=bOff(w,h), n=bLanded03(st);
  M.fill(g,C.ground); const {sx,sy,sw,sh}=L;
  bLab(g,'L-03 · UI · first run · phone',L.pad,L.wide?28:24,C.soft,L.wide?10:9.5);
  if(L.wide) bLab(g,'390 pt screen',w-L.pad,28,C.soft,9.5,{align:'right'});
  bDisp(g,'Listening',L.pad,L.tb,L.ts,C.ink);
  M.fill(g,C.scr,sx,sy,sw,sh); if(L.wide) bRect(g,sx,sy,sx+sw,sy+sh,C.hair); else { M.rule(g,0,sy,w,sy,C.hair); M.rule(g,0,sy+sh,w,sy+sh,C.hair); }
  M.logo(g,sx+G.m,G.hb,G.xh,{color:C.ink});
  bLab(g,'Mir · listening',sx+sw-G.m,G.hb,C.dim,9,{align:'right'});
  M.rule(g,sx+G.m,G.hl,sx+sw-G.m,G.hl,C.hair);
  bDisp(g,n===0?'Nothing here yet.':n===1?'One line so far.':['','','Two','Three','Four','Five'][n]+' lines so far.',sx+G.m,G.cy,G.cs,C.ink);
  M.text(g,'Mir draws you as you go.',sx+G.m,G.cy+q4(G.cs*1.2),{size:15,weight:400,color:C.soft});
  M.fill(g,C.inp,G.ix,G.iy,G.iw,G.ih); bRect(g,G.ix,G.iy,G.ix+G.iw,G.iy+G.ih,C.inb);
  /* notes */
  const sh03=(share03(G,n,1)*100).toFixed(1);
  const N=NOTE03(sh03,7+n);
  const ta=.93*TAU, ay=G.fy+Math.sin(ta)*G.rr, low=G.st.filter(p=>p.y>ay+36), a1=(low.length?low:G.st).reduce((b,p)=>p.x>b.x?p:b,(low.length?low:G.st)[0]), ANC=[[G.fx+Math.cos(ta)*G.rr,ay],[a1.x,a1.y],[G.ix+G.iw+2,G.iy+G.ih/2]];
  if(L.wide){ let yb=0; N.forEach((o,i)=>{ const A=ANC[i]; const y=q4(Math.max(A[1]+4,yb+24)); const x0=A[0]+(i===2?0:i===0?5:8), xm=sx+sw+12;
      M.rule(g,x0,A[1],xm,A[1],bMix(C.scr,C.ink,.3)); M.rule(g,xm,A[1],L.nx-8,y-4,bMix(C.scr,C.ink,.3));
      bLab(g,(i+1)+'  '+o.k,L.nx,y,C.ink,9.5); yb=bPara(g,o.b,L.nx,y+20,L.nw,{size:13,lh:18,color:C.soft})+8; });
    }
  else { ANC.forEach((A,i)=>bLab(g,String(i+1),i===2?G.ix+G.iw-G.ih-6:A[0]+8,i===2?A[1]+4:A[1]-6,C.dim,9,i===2?{align:'right'}:{}));
    let y=q4(sy+sh+32); N.forEach((o,i)=>{ bLab(g,(i+1)+'  '+o.k,L.pad,y,C.ink,9.5); y=q4(bPara(g,o.b,L.pad+20,y+20,L.nw,{size:13,lh:18,color:C.soft})+32); });
    }
  return cv; }); }
const NOTE03=(sh,n)=>[{k:'First ring · '+sh+'%',b:'One ring’s points, accepted at '+sh+'%. A line you send lands at the edge and raises the agreement there.'},
  {k:'Strays · '+n,b:'What you gave at sign-up, and each line since. Each waits at the edge until it connects.'},
  {k:'The invitation',b:'One line and no examples. Mir asks nothing before you do.'}];
const bLanded03=st=>Math.min(5,st.said-(st.arrive?1:0));
/* one frame: ring, strays (breathing), input, and the arriving stray. a = {n, prog, text, caret, flash, fly:{x,y,r}} */
function dyn03(g,st,w,h,tb,a){ const G=bSlot(st,'geo',bDK(w,h),()=>geo03(w,h)), C=G03[st.ground], B=new M.Buf(g), tint=bMix(C.scr,C.ink,.42);
  /* flashes (0..1, from the score): er the ring at a breath's crest or an echo, es[j] stray j on its note, el the landing, ek a key, eS the send */
  const er=a.er||0, es=a.es||[], el=a.el||0;
  const c=G.cand; for(let i=0;i<c.length;i+=4){ const d=dens03(c[i+2],a.n,a.prog); if(c[i+3]<d) B.dot(c[i],c[i+1],(.62+Math.min(.7,d*2.6))*(1+.45*er),tint); }
  const ph=TAU*tb/6000, drift=p=>[Math.sin(ph+p.p1),Math.cos(ph+p.p2)];
  G.st.forEach((p,j)=>{ const [dx,dy]=drift(p), e=es[j]||0; B.dot(p.x+dx,p.y+dy,p.r*(1+.9*e),e>.5?C.acc:C.ink); for(let q=0;q<p.hal.length;q+=3) B.dot(p.x+dx*1.4+p.hal[q],p.y+dy*1.4+p.hal[q+1],p.hal[q+2]*(1+.5*e),tint); });
  for(let j=0;j<a.landed;j++){ const p=G.land[j], [dx,dy]=drift(p), e=j===a.landed-1?el:0; B.dot(p.x+dx,p.y+dy,p.r*(1+1.6*e),e>.4?C.acc:C.ink); }
  if(a.fly){ B.dot(a.fly.x,a.fly.y,a.fly.r,a.fly.c||C.ink); const tr=a.fly.trail||[]; for(let k=0;k<tr.length;k+=3) B.dot(tr[k],tr[k+1],tr[k+2],tint); }
  bDisc(B,M.rng(9),G.send[0],G.send[1],4.6*(1+.5*(a.eS||0)),a.text||a.flash?C.acc:C.dim,.95,.6);
  B.flush();
  const ts=bClamp(G.L.sw*.05,13.5,15), tx=G.ix+14, ty=G.iy+G.ih/2+ts*.36;
  if(a.text){ g.save(); g.beginPath(); g.rect(G.ix+1,G.iy+1,G.iw-G.ih,G.ih-2); g.clip(); const tw=M.text(g,a.text,tx,ty,{size:ts,weight:400,color:C.ink}); g.restore(); if(a.caret) M.fill(g,C.acc,tx+tw+2,G.iy+G.ih*(.3-.08*(a.ek||0)),1.25+1.5*(a.ek||0),G.ih*(.4+.16*(a.ek||0))); }
  else { M.text(g,'Tell Mir something',tx,ty,{size:ts,weight:400,color:C.dim}); if(a.caret) M.fill(g,C.acc,tx-3,G.iy+G.ih*.3,1.25,G.ih*.4); } }
function rest03(st){ const n=bLanded03(st); return {n,landed:n,prog:1}; }

/* L-03 music. Idle, 40 BPM: a 6 s breath is one bar of 4/4. A near-silent organ open fifth (D3, A3) swells with each breath, an exhale
   of air under it, and at the crest (beat 3) one sign-up stray sounds an organ note on the mode's pentatonic (larger strays lower).
   Seven breaths, one per stray; on the last, the third answers at the crest. The organ opens a little with each line said.
   A line typed, 80 BPM: each character is a 16th (vowels are soft plucks on the suspended chord's tones, consonants muted ticks,
   spaces rests). On the next beat it is sent; the flying stray is a glide on the suspension that lands, two beats later, on the third
   (G → F#) as it reaches the ring: it joins the chord. Then the organ plays the line's vowels back slowly, in tune: Mir has heard it. */
const BAR03=6000, IDLE03=7*BAR03, P03=[-3,-2,0,1,2,4,5];
function m1_tl03(s){ const times=[]; for(let i=0;i<s.length;i++) times.push(375+i*187.5); const tSend=Math.ceil((375+s.length*187.5)/750)*750, land=tSend+1500;
  const V=[]; for(const ch of s.toLowerCase()){ const v='aeiouy'.indexOf(ch); if(v>=0) V.push(v); }
  return {times,tSend,tFly:1500,land,V,tEnd:land+750+V.length*375+750}; }
function music03(st){ const mu=M.music, S=mu.score({bpm:st.arrive?80:40,ground:st.ground}), md=S.mode, home=m1_home(md), d=(k,o)=>mu.deg(md,k,o), n=bLanded03(st);
  if(!st.arrive){ S.harm([[0,home]]);
    for(let j=0;j<7;j++){ const t0=j*BAR03, idx=Math.max(0,Math.min(6,Math.round((2-SR03[j])/1.05*6)));
      S.note(t0,'organ',d(0,3),BAR03-200,{attack:2.4,release:2,vel:.42,vibrato:0,cutoff:700+90*n},['ring',.25]);
      S.note(t0+30,'organ',d(4,3),BAR03-230,{attack:2.4,release:2,vel:.38,vibrato:0,cutoff:700+90*n},['ring',.2]);
      S.hitSound(t0+1000,'breath',{dur:5.2,vel:.36,freq:560},['ring',.15]);
      S.note(t0+3000,'organ',d(P03[idx],4),2600,{attack:.25,release:1.6,vel:.58,vibrato:4},['s'+j,1]); S.hit(t0+3000,'ring',.8); }
    S.note(6*BAR03+4500,'organ',d(2,4),1300,{attack:.08,release:1.2,vel:.46,vibrato:4},['ring',1]);
    const o=S.out(); o.dur=IDLE03; return o; }
  const j=st.arrive-1, s=SAY03[j], P=m1_tl03(s);
  S.harm([[0,'Dsus4'],[P.land-140,home]]);
  S.note(0,'organ',d(0,3),P.land,{attack:1.2,release:.8,vel:.38,vibrato:0,cutoff:800+90*n},['ring',.2]); S.note(0,'organ',d(4,3),P.land,{attack:1.2,release:.8,vel:.34,vibrato:0,cutoff:800+90*n},['ring',.2]);
  for(let i=0;i<s.length;i++){ const ch=s[i].toLowerCase(), v='aeiouy'.indexOf(ch); if(ch===' ') continue;
    if(v>=0) S.note(P.times[i],'pluck',mu.ct('Dsus4',d(0,4),v),120,{cutoff:1800,vel:.62,pan:(i/s.length-.5)*.5},['key',1]);
    else S.hitSound(P.times[i],'tick',{vel:.32,tock:true},['key',.5]); }
  S.hitSound(P.tSend,'click',{vel:.55},['send',1]);
  S.note(P.tSend,'glide',d(3,4),P.land-P.tSend+1400,{id:'fly',from:d(0,4),glide:600,vibrato:6,attack:.05,release:.9,vel:.64,tone:3000},['fly',.6]);
  S.glide(P.land-140,'fly',d(2,4),140);
  S.note(P.land,'organ',d(0,3),P.tEnd-P.land,{vel:.48,vibrato:2,release:1.2},['land',1]); S.note(P.land+20,'organ',d(4,3),P.tEnd-P.land,{vel:.44,vibrato:2,release:1.2},['land',.6]);
  P.V.forEach((v,i)=>S.note(P.land+750+i*375,'organ',mu.ct(home,d(0,4),v),700,{vel:.54,vibrato:3,attack:.02,release:.5},['echo',1]));
  const o=S.out(); o.dur=P.tEnd; return o; }
M.piece({ id:'L-03',
  caption:'A first run on a phone, where the field holds only seven stray dots from sign-up and a faint third of one ring. Play types five lines in turn; each lands at the ring’s edge and raises the agreement there.',
  alt:'A flat phone screen: the mindgut wordmark, seven loose dots of different sizes and a faint partial ring of fine dots, the line “Nothing here yet. Mir draws you as you go.” and an input reading “Tell Mir something”. Three numbered notes sit beside it.',
  recipe:{
    idea:'Every stray is something said that has not found its place yet; the ring agrees only as you say more.',
    marks:['stray','ring','dot'],
    ground:'night, olive, paper',
    accent:'the send dot and caret, in the ground’s accent: a line being sent',
    composition:'A flat 390 pt phone screen at left (full width on phones): wordmark and status, a partial ring with seven strays, the empty-state line and an input; three numbered notes beside it (below on phones).',
    motion:'Strays breathe ±1 px on a 6 s period, one 40 BPM bar, each flashing on its note at the crest while the ring brightens. Type a line: one character per 16th at 80 BPM, sent on the next beat; one stray flies on a curve to the ring’s edge in two beats (outCubic) and flashes as it lands, while the ring fills in there (inOutCubic). Reduced motion jumps to the landed state.',
    sound:'The listening is an organ fifth that breathes, one stray’s note at each crest. A line types in plucks and ticks, flies as a suspended glide that lands on the third as it joins the ring, and the organ plays its vowels back, in tune.',
    controls:['Type a line (up to 5): a typed phrase, sent and heard back','Ground (Night, Olive, Paper): the mode, Dorian, Mixolydian or Ionian'],
    computed:['first ring share: blue-noise candidates within ±2.6 px of a softly wobbling ring, each kept when its fixed seeded threshold is below the angular density; share = kept ÷ candidates','each line sent adds a density bump (0.04 turn wide) where it lands'],
    placeholder:['sign-up strays and their sizes','the five lines','where each line lands'],
    root:'',
    rules:['the invitation is one line with no examples'],
    engine:['M.poisson','M.noise','M.logo','M.field','M.shape.disc','M.Buf','M.ease.outCubic','M.ease.inOutCubic','M.text','M.wrap','M.rule','M.fill','M.music']
  },
  aspect:w=>w/lay03(w).H,
  state:{ground:'night',said:0,arrive:0},
  loop:true,
  controls:[
    {id:'type',type:'button',label:'Type a line',play:true,run:st=>{ st.said=Math.min(5,st.said+1); st.arrive=st.said; }},
    {id:'ground',type:'select',label:'Ground',options:[{value:'night',label:'Night'},{value:'olive',label:'Olive'},{value:'paper',label:'Paper'}]}],
  /* Play is the conversation: each Play types, sends and hears the next line (up to five); after the fifth, Play breathes the full ring */
  music:(st,w,h,M)=>{ if(!st.arrive&&st.said<5){ st.said++; st.arrive=st.said; } return music03(st,w,h,M); }, musicIns:'organ',
  render(g,w,h,M,st){ bBlit(g,base03(st,w,h)); dyn03(g,st,w,h,0,rest03(st)); },
  animate(g,w,h,M,st,t){ const base=base03(st,w,h);
    if(!st.arrive){ bBlit(g,base); const a=rest03(st); a.er=m1_env(st,'ring',t,700); a.es=[0,1,2,3,4,5,6].map(j=>m1_env(st,'s'+j,t,650)); dyn03(g,st,w,h,bRM()?0:t,a); return t<IDLE03; }
    /* typing on 16ths → send on the beat → one stray flies from the input to the ring's edge in two beats, and the ring's agreement grows there */
    const G=bSlot(st,'geo',bDK(w,h),()=>geo03(w,h)), C=G03[st.ground], j=st.arrive-1, s=SAY03[j], P=m1_tl03(s), tSend=P.tSend, tFly=P.tFly; if(bRM()) t=P.tEnd;
    bBlit(g,base);
    const a={n:j+1,landed:j,prog:E.inOutCubic(cl((t-tSend-375)/1125)),er:Math.max(m1_env(st,'echo',t,300),.6*m1_env(st,'ring',t,500)),el:Math.max(m1_env(st,'land',t,420),.5*m1_env(st,'echo',t,300)),ek:m1_env(st,'key',t,120),eS:m1_env(st,'send',t,200)};
    if(t<tSend){ const k=P.times.filter(x=>x<=t).length; a.text=s.slice(0,k); a.caret=Math.floor(t/375)%2===0||k<s.length; }
    else if(t<tSend+160) a.flash=true;
    if(t>=tSend){ const P0=G.send, LJ=G.land[j], P2=[LJ.x,LJ.y], P1=[lerp(P0[0],P2[0],.15),P0[1]-(P0[1]-P2[1])*.95], at=tt=>{ const u=E.outCubic(cl(tt/tFly)), v=1-u; return [v*v*P0[0]+2*v*u*P1[0]+u*u*P2[0], v*v*P0[1]+2*v*u*P1[1]+u*u*P2[1], u]; };
      const [x,y,u]=at(t-tSend); if(u<1){ a.fly={x,y,r:lerp(3.2,LJ.r,u),c:u<.15?C.acc:C.ink,trail:[]}; for(let k=1;k<=6;k++){ const q=at(t-tSend-k*34); if(q[2]>0) a.fly.trail.push(q[0],q[1],lerp(1.6,.6,k/6)*(1-u*.5)); } } else a.landed=j+1; }
    dyn03(g,st,w,h,t>=tSend+tFly?t-tSend-tFly:0,a);
    if(t>=P.tEnd){ st.arrive=0; return false; } return true; } });

/* ════════════════════════════════════════════════════════════════════════
   L-04 · Mir's turn · the composing state as a motion program (computed).
   72 dots. Dot i starts as a stray at radius ρ·S, angle φ, and travels in polar coordinates to its slot on a ring; r and θ
   both interpolate by e = ease(u), u = clamp((t − s·stagger)/duration), s = normalized ρ (nearest first).
   k(t) = mean e over the dots ("share settled"). Settle = duration + stagger. Loop: gather, hold 240, loosen (gather played
   back at 0.7×), rest 160. Every frame, the curve and the JSON line are computed from the same model and the controls.
   ════════════════════════════════════════════════════════════════════════ */
const N04=72;
const M04=(()=>{ const R=M.rng(404), d=[]; for(let i=0;i<N04;i++){ const s=R(); d.push({th:i/N04*TAU+R.gauss()*.025,rho:.52+.46*s,s,ph:R()*TAU,jr:R.gauss()*.02}); } return d; })();
const EASE04={outCubic:{f:E.outCubic,name:'out cubic',eq:'1 − (1 − u)³'},outQuint:{f:E.outQuint,name:'out quint',eq:'1 − (1 − u)⁵'},spring:{f:u=>E.spring(u),name:'spring',eq:'ζ 0.55 · ω 11'}};
const e04=(o,t,st)=>EASE04[st.ease].f(cl((t-o.s*st.stag)/st.dur));
const k04=(t,st)=>{ let s=0; for(const o of M04) s+=e04(o,t,st); return s/N04; };
/* the loop is a two-bar phrase. The gather takes nb whole beats (nb = round(settle ÷ 450 ms), 1–4), so the tempo is exactly
   60000 · nb ÷ settle BPM and nothing in the gather is re-timed; hold, loosen (about 0.7 of the gather, in whole 8ths) and an 8th of
   rest fill the two bars. */
const T04=st=>st.dur+st.stag;
function G04(st){ const T=T04(st), nb=Math.max(1,Math.min(4,Math.round(T/450))), beat=T/nb, e8=beat/2, G8=2*nb, L8=Math.max(1,Math.round(.7*G8)), H8=16-G8-L8-1;
  return {T,nb,beat,e8,bpm:60000/beat,hold:H8*e8,loos:L8*e8,rest:e8,loop:8*beat}; }
const LOOS04=st=>Math.round(G04(st).loos), LOOP04=st=>Math.round(G04(st).loop);
function loop04(st,t){ const g=G04(st), T=g.T, H=g.hold, Ls=g.loos; if(t<T) return [t,'gather']; if(t<T+H) return [T,'hold']; if(t<T+H+Ls) return [T*(1-(t-T-H)/Ls),'loosen']; return [0,'rest']; }
/* the 72 dots in 12 groups of 6 by stagger order (nearest first): each group is one note of the gather's arpeggio */
const GR04=(()=>{ const o=M04.map((d,i)=>[d.s,i]).sort((a,b)=>a[0]-b[0]), g=new Uint8Array(N04); o.forEach(([,i],r)=>{ g[i]=Math.floor(r/6); }); return g; })();
function dots04(B,cx,cy,S,t,st,C,rR,rS,fx){ const cols=[0,1,2,3].map(i=>bMix(C.tint,C.ink,i/3)), eg=fx&&fx.eg, er=fx?fx.ring:0;
  M04.forEach((o,i)=>{ const e=e04(o,t,st), ec=cl(e); let dth=((o.th-o.ph)%TAU+TAU*1.5)%TAU-Math.PI; const a=o.ph+dth*e, rad=lerp(o.rho*S*.48,S*.2*(1+o.jr),e), f=eg?eg[GR04[i]]:0;
    B.dot(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad,lerp(rS,rR,ec)*(1+.75*f+.55*er*ec),f>.5?C.ink:cols[Math.round(ec*3)]); }); }
function lay04(w){ const g=bCtx(), wide=w>=480;
  if(wide){ const pad=24, y0=100, cw=w-2*pad, P=q4(Math.min(cw*.6,340)), sx=pad+P+24, sw=w-pad-sx, gap=8, fs=Math.floor((cw-5*gap)/6), fsY=q4(y0+P+48), chY=q4(fsY+fs+72), chH=64, ruY=q4(chY+chH+64), rw=Math.floor((cw-2*20)/3);
    return {wide,pad,y0,cw,P,sx,sw,gap,fs,cols:6,fsY,chY,chH,ruY,rw,rcols:3,ts:40,tb:76}; }
  const pad=16, y0=88, cw=w-2*pad, P=cw, sx=pad, sw=cw, gap=10, fs=Math.floor((cw-2*gap)/3), fsY=q4(y0+P+20+4*28+40), chY=q4(fsY+2*(fs+40)+24), chH=60, ruY=q4(chY+chH+64);
  return {wide,pad,y0,cw,P,sx,sw,gap,fs,cols:3,fsY,chY,chH,ruY,rw:cw,rcols:1,ts:32,tb:64}; }
function text04(st){ const E4=EASE04[st.ease], T=T04(st);
  return {rules:[{k:'Easing',b:`Each dot: ${E4.name}, ${E4.eq}, over ${st.dur} ms. Start offsets of 0–${st.stag} ms by distance, nearest first. Every dot lands by ${T} ms.`},
    {k:'Loop',b:`Loops while composing, two bars at ${Math.round(G04(st).bpm)} BPM: gather ${T}, hold ${Math.round(G04(st).hold)}, loosen ${LOOS04(st)}, rest ${Math.round(G04(st).rest)}. On send it settles and holds; it does not loosen again.`},
    {k:'Reduced motion',b:'Shows the last frame: the held ring, still, with the state written out, “Mir is writing”.'}],
    json:`{ "composing": { "dots": 72, "duration_ms": ${st.dur}, "stagger_ms": ${st.stag}, "easing": "${st.ease}", "settle_ms": ${T}, "bpm": ${Math.round(G04(st).bpm*10)/10}, "loop_ms": ${LOOP04(st)}, "reduced": "last frame" } }`}; }
function height04(w,st){ const g=bCtx(), L=lay04(w), X=text04(st||{dur:1200,stag:400,ease:'outQuint'}); let rh=0;
  if(L.rcols===3) X.rules.forEach(r=>{ rh=Math.max(rh,20+bParaH(g,r.b,L.rw,{size:12,lh:17})); }); else X.rules.forEach(r=>{ rh+=20+bParaH(g,r.b,L.rw,{size:12.5,lh:18})+20; });
  return q4(L.ruY+rh+28+3*14+L.pad); }
const C04={ground:'#fafafa',ink:'#1d2733',soft:'#5d636b',hair:'#d9dbdd',acc:'#d4142a'}; C04.tint=bMix(C04.ground,C04.ink,.38);
function base04(st,w,h){ return bSlot(st,'base',bDK(w,h)+st.dur+'|'+st.stag+'|'+st.ease,()=>{ const L=lay04(w), C=C04, {cv,g}=bOff(w,h), B=new M.Buf(g), X=text04(st), E4=EASE04[st.ease], T=T04(st);
  M.fill(g,C.ground);
  bLab(g,'L-04 · UI · motion program',L.pad,L.wide?28:24,C.soft,L.wide?10:9.5); if(L.wide) bLab(g,'composing state',w-L.pad,28,C.soft,9.5,{align:'right'});
  bDisp(g,'Mir’s turn',L.pad,L.tb,L.ts,C.ink);
  /* preview frame (structure only) */
  bRect(g,L.pad,L.y0,L.pad+L.P,L.y0+L.P,C.hair);
  /* spec table: dense micro-type beside the large figure */
  const rows=[['duration',st.dur+' ms'],['stagger',st.stag+' ms'],['easing',E4.name],['curve',E4.eq],['settles',T+' ms'],['loop',(LOOP04(st)/1000).toFixed(2)+' s'],['dots','72']];
  if(L.wide){ let y=L.y0+100; rows.forEach(([k,v])=>{ bLab(g,k,L.sx,y,C.soft,9); M.text(g,v,L.sx+L.sw,y,{font:'mono',size:10.5,weight:500,color:C.ink,align:'right'}); M.rule(g,L.sx,y+8,L.sx+L.sw,y+8,C.hair); y+=28; }); }
  else { const cw2=(L.cw-16)/2; rows.slice(0,6).forEach(([k,v],i)=>{ const x=L.pad+(i%2)*(cw2+16), y=L.y0+L.P+76+((i/2)|0)*28; bLab(g,k,x,y,C.soft,9); M.text(g,v,x+cw2,y,{font:'mono',size:10.5,weight:500,color:C.ink,align:'right'}); M.rule(g,x,y+8,x+cw2,y+8,C.hair); }); }
  /* six frames across the settle */
  bLab(g,'Six frames · t = i⁄5 × settle',L.pad,L.fsY-14,C.ink,9.5);
  for(let i=0;i<6;i++){ const t=Math.round(T*i/5), c=i%L.cols, r=(i/L.cols)|0, x=L.pad+c*(L.fs+L.gap), y=L.fsY+r*(L.fs+40), s=L.fs; bRect(g,x,y,x+s,y+s,C.hair);
    dots04(B,x+s/2,y+s/2,s,t,st,C,Math.max(.8,s*.0105),Math.max(.6,s*.006)); bLab(g,t+' ms',x,y+s+16,C.ink,9); bLab(g,'settled '+k04(t,st).toFixed(2),x,y+s+30,C.soft,9); }
  /* k(t) curve on a fixed 0–1600 ms axis, so every setting is comparable */
  const top=E4===EASE04.spring?1.15:1, x0=L.pad+20, x1=w-L.pad, y0=L.chY+16, y1=y0+L.chH, X0=t=>x0+(x1-x0)*t/1600, Y0=k=>y1-(y1-y0)*k/top;
  bLab(g,'Share settled over time',L.pad,L.chY,C.ink,9.5);
  M.rule(g,x0,y1,x1,y1,C.hair); M.rule(g,x0,y0,x0,y1,C.hair); if(top>1) M.rule(g,x0,Y0(1),x1,Y0(1),bMix(C.ground,C.hair,.6));
  for(let i=0;i<=320;i++){ const t=i/320*1600; B.dot(X0(t),Y0(k04(t,st)),.72,C.ink); }
  for(let i=0;i<6;i++){ const t=T*i/5; bDisc(B,M.rng(i+9),X0(t),Y0(k04(t,st)),2.3,C.ink,.95,.55); }
  [0,400,800,1200,1600].forEach(t=>bLab(g,String(t),X0(t),y1+16,C.soft,9,{align:t===0?'left':t===1600?'right':'center'}));
  bLab(g,'1',x0-8,Y0(1)+4,C.soft,9,{align:'right'}); bLab(g,'0',x0-8,y1+3,C.soft,9,{align:'right'});
  B.flush();
  /* rules + spec line */
  let ry=L.ruY, yMax=ry;
  X.rules.forEach((r,i)=>{ if(L.rcols===3){ const x=L.pad+i*(L.rw+20); bLab(g,r.k,x,ry,C.ink,9.5); yMax=Math.max(yMax,bPara(g,r.b,x,ry+20,L.rw,{size:12,lh:17,color:C.soft})); }
    else { bLab(g,r.k,L.pad,ry,C.ink,9.5); ry=q4(bPara(g,r.b,L.pad,ry+20,L.rw,{size:12.5,lh:18,color:C.soft})+32); yMax=ry-32; } });
  let jy=q4(yMax+32); M.wrap(g,X.json,L.cw,{font:'mono',size:9,weight:400}).forEach((l,i)=>M.text(g,l,L.pad,jy+i*14,{font:'mono',size:9,weight:400,color:C.soft}));
  return cv; }); }
function dyn04(g,st,w,h,tm,phase,tl,fx){ const L=lay04(w), C=C04, B=new M.Buf(g), T=T04(st), cx=L.pad+L.P/2, cy=L.y0+L.P/2;
  dots04(B,cx,cy,L.P,tm,st,C,L.P*.0062,L.P*.0034,fx);
  const top=EASE04[st.ease]===EASE04.spring?1.15:1, x0=L.pad+20, x1=w-L.pad, y0=L.chY+16, y1=y0+L.chH, k=k04(tm,st);
  bDisc(B,M.rng(3),x0+(x1-x0)*tm/1600,y1-(y1-y0)*k/top,2.9,C.acc,.95,.6);
  B.flush();
  const lab=tl==null?'reduced · last frame':'loop · t '+String(Math.round(tl)).padStart(4,'0')+' ms';
  bLab(g,lab,L.pad+12,L.y0+20,C.soft,9); bLab(g,phase,L.pad+L.P-12,L.y0+20,phase==='hold'?C.acc:C.soft,9,{align:'right'});
  if(L.wide){ bLab(g,'share settled',L.sx,L.y0+8,C.soft,9); bDisp(g,k.toFixed(2),L.sx-2,L.y0+56,44,C.ink); bLab(g,'t '+Math.round(tm)+' ms of '+T,L.sx,L.y0+76,C.soft,9); }
  else { bLab(g,'share settled',L.pad,L.y0+L.P+22,C.soft,9); bDisp(g,k.toFixed(2),L.pad-2,L.y0+L.P+56,32,C.ink); bLab(g,'t '+Math.round(tm)+' ms of '+T,L.pad+L.cw,L.y0+L.P+56,C.soft,9,{align:'right'}); } }

/* L-04 music. One Play is four loops, four two-bar phrases that make a song: I → vi → IV → V (Dmaj7, Bm7, Gmaj7, A7).
   The gather is a 12-note arpeggio up the phrase's chord from its fifth, ending on its third: one note per group of six dots, at the
   moment the group is 90% settled, on the 32nd grid (notes that meet are struck together, so Stagger 0 is one strummed chord and more
   stagger spreads the strum). The ring's arrival strikes the chord (pad and mallets; the bass once, on the first). The hold is the groove,
   an 8th-note figure: bass on the beat, the chord off it, a hi-hat ticking; Easing sets its feel: out cubic straight 8ths, out quint a
   laid-back swing (offbeats at 0.62), spring bouncy, with octave grace notes. The loosen is a soft descending echo of the arpeggio. */
const CH04=[['Dmaj7','A2'],['Bm7','F#2'],['Gmaj7','D3'],['A7','E3']];
const SW04={outCubic:0,outQuint:.24,spring:0};
/* the time each group of six reaches 90% settled, quantized to 32nds of the phrase's beat */
function m1_arp04(st){ const g=G04(st), u=g.beat/8, t9=new Array(12).fill(null);
  let left=12; for(let t=0;t<=g.T+4&&left;t+=4){ const m=new Float64Array(12); for(let i=0;i<N04;i++) m[GR04[i]]+=e04(M04[i],t,st); for(let k=0;k<12;k++) if(t9[k]==null&&m[k]/6>=.9){ t9[k]=t; left--; } }
  return t9.map(t=>Math.min(g.T,Math.round((t==null?g.T:t)/u)*u)); }
function music04(st){ const mu=M.music, g=G04(st), S=mu.score({bpm:g.bpm,swing:SW04[st.ease],mode:'ionian'}), arp=m1_arp04(st), sp=st.ease==='spring';
  S.harm(CH04.map(([c],P)=>[P*g.loop,c]));
  CH04.forEach(([sym,from],P)=>{ const t0=P*g.loop, notes=[]; for(let k=0;k<12;k++) notes.push(mu.ct(sym,from,k));
    /* the gather: groups that land together are struck together */
    const by=new Map(); arp.forEach((t,k)=>{ if(!by.has(t)) by.set(t,[]); by.get(t).push(k); });
    [...by.entries()].forEach(([t,ks])=>{ const ms=ks.map(k=>notes[k]), top=ks[ks.length-1];
      S.chord(t0+t,'mallet',ms,520,{vel:.36+.022*top,pan:(top/11-.5)*.6,ratio:4},null); ks.forEach(k=>S.hit(t0+t,'g'+k,1)); });
    /* the arrival: the chord, the ring pulses */
    const T=t0+g.T; S.chord(T,'pad',mu.voice(sym,'D4','D5',4),g.hold+g.loos*.75,{attack:.03,release:.6,cutoff:1500,vel:.62},['hit',1]);
    S.chord(T,'mallet',notes.slice(8),900,{vel:.46,trem:5},null); if(P===0){ S.note(T,'bass',CH04[0][0][0]+'2',g.beat*1.6,{from:'A1',glide:80,env:2.8,decay:.36,vel:.62}); S.hitSound(T,'kick',{vel:.46}); }
    /* the hold: the groove */
    const n8=Math.round(g.hold/g.e8), root=mu.ct(sym,(sym[0]==='A'||sym[0]==='G'?sym[0]:sym[0])+'2',0), tri=mu.voice(sym,'F#3','F#4',3);
    for(let i=1;i<n8;i++){ const b=(T-t0)/g.beat+i/2, t=t0+S.at(0,b), on=i%2===0;
      if(sp&&on) S.note(t-g.beat/8,'pluck',root+12,70,{cutoff:2200,vel:.3},['pulse',.2]);
      if(on) S.note(t,'pluck',root,g.e8*.9,{cutoff:700,vel:.6},['pulse',.5]); else S.chord(t,'pluck',tri,g.e8*.7,{cutoff:1100,vel:.52},['pulse',.35]);
      S.hitSound(t,'hat',{vel:on?.22:.3,decay:.026},null); }
    /* the loosen: the gather played back at its speed, descending, every other group, softly, with tape echo */
    const L0=T+g.hold; for(let k=11;k>=0;k-=2){ const t=L0+g.loos*(1-arp[k]/g.T); S.note(S.q(t-t0,8)+t0,'glide',notes[k],g.e8*.8,{vel:.42,vibrato:0,attack:.01,release:.3,tone:2400,echo:.22,echoTime:g.e8*1.5/1000},['g'+k,.5]); } });
  /* a loop's score lasts exactly its four phrases, so the next Play lands on the next downbeat (tails ring over it) */
  const o=S.out(); o.dur=4*g.loop; return o; }
/* a short preview at the current settings: bass, chord, bass, chord, in the groove (and the strum at its spread) */
function m1_prev04(A,st,strum){ const g=G04(st), now=A.now()+.01, b=g.beat/1000, sw=SW04[st.ease], hz=m=>M.music.hz(m,'D'), tri=['F#3','A3','D4'].map(n=>hz(M.music.midi(n)));
  if(strum){ ['A2','D3','F#3','A3','C#4','F#4'].forEach((n,k)=>A.play('mallet',{freq:hz(M.music.midi(n)),dur:.5,vel:.42+.03*k,when:now+k*st.stag/6000})); return; }
  [0,1,2,3].forEach(i=>{ const on=i%2===0, t=now+Math.floor(i/2)*b+(on?0:b*(.5+sw*.5));
    if(st.ease==='spring'&&on) A.play('pluck',{chord:[hz(38)*2],dur:.07,cutoff:2200,vel:.3,when:t-b/8});
    if(on) A.play('pluck',{chord:[hz(38)],dur:b*.45,cutoff:700,vel:.52,when:t}); else A.play('pluck',{chord:tri,dur:b*.35,cutoff:1100,vel:.42,when:t});
    A.play('hat',{vel:on?.22:.3,decay:.026,when:t}); }); }
M.piece({ id:'L-04',
  caption:'While Mir composes, its stray dots gather into a small ring, hold and loosen again, shown as frames, a curve and a spec line. Change Duration, Stagger or Easing and all of them follow.',
  alt:'A motion program on white: a large square in which dark dots gather into a small ring, the share settled as a large number beside a spec table, six small frames across the settle, a dotted curve of the share settled over time with a red playhead, three rules and a one-line JSON spec.',
  recipe:{
    idea:'Composing reads as a figure settling, counted in frames, and its motion ships as a program of parameters.',
    marks:['stray','ring'],
    ground:'paper',
    accent:'the red playhead on the curve, and the word “hold” while the ring holds',
    composition:'A large preview square with a spec table beside it (below on phones), six frames across the settle, a share-settled curve on a fixed 0–1600 ms axis, three rules and a one-line JSON spec.',
    motion:'Loop, two bars: 72 dots travel in polar coordinates from strays to a small ring (duration, stagger and easing as set; the gather is a whole number of beats, which sets the tempo), hold through the groove, loosen (the gather played back, about 0.7 of its length, in whole 8ths), rest an 8th. Each group of six brightens on its note; the ring pulses on the chord and the groove. Reduced motion shows the held ring.',
    sound:'Each loop is a phrase of a four-chord song (I, vi, IV, V): the gather is an arpeggio up the chord, one note per group of dots, the ring strikes the chord, the hold grooves in the easing’s feel, and the loosen echoes back down.',
    controls:['Duration 400–1200 ms: note length and tempo','Stagger 0–400 ms: the strum’s spread','Easing (out cubic, out quint, spring): the groove, straight, swung or bouncy'],
    computed:['each dot: radius and angle interpolate by e = ease(clamp((t − s × stagger) ÷ duration)), s = normalized start radius, nearest first','share settled k(t) = mean e over the 72 dots','settle = duration + stagger = nb beats, nb = round(settle ÷ 450), so BPM = 60000 · nb ÷ settle; loop = 8 beats','frames, curve, table and JSON read the same model'],
    placeholder:['dot start positions (seeded)'],
    root:'Gerstner, Designing Programmes, 1964',
    rules:['on send the ring settles and holds; it does not loosen again'],
    engine:['M.ease.outCubic','M.ease.outQuint','M.ease.spring','M.field','M.shape.disc','M.Buf','M.rng','M.text','M.wrap','M.rule','M.fill','M.music']
  },
  aspect:w=>w/height04(w),
  state:{dur:560,stag:240,ease:'outCubic'},
  loop:true,
  controls:[
    {id:'dur',type:'range',label:'Duration',min:400,max:1200,step:20,fmt:v=>v+' ms'},
    {id:'stag',type:'range',label:'Stagger',min:0,max:400,step:20,fmt:v=>v+' ms'},
    {id:'ease',type:'select',label:'Easing',options:[{value:'outCubic',label:'Out cubic'},{value:'outQuint',label:'Out quint'},{value:'spring',label:'Spring'}]}],
  music:music04,
  musicParam(A,st,id){ const T=m1_T(st); if(!m1_rl(T,'p',id==='ease'?60:170)) return true; m1_prev04(A,st,id==='stag'); return true; },
  render(g,w,h,M,st){ bBlit(g,base04(st,w,h)); dyn04(g,st,w,h,T04(st),'hold',bRM()?null:T04(st)); },
  animate(g,w,h,M,st,t){ bBlit(g,base04(st,w,h)); const LP=G04(st).loop, tl=Math.min(t,4*LP-1)%LP, [tm,ph]=loop04(st,tl);
    const fx={eg:[...Array(12)].map((_,k)=>m1_env(st,'g'+k,t,170)),ring:Math.max(m1_env(st,'hit',t,380),.55*m1_env(st,'pulse',t,120))};
    dyn04(g,st,w,h,tm,ph,tl,fx); return t<4*LP; } });

/* ════════════════════════════════════════════════════════════════════════
   L-05 · The session, tuned · a flat desktop app screen. Ground: olive, night, or paper (light product tokens).
   "Play session": messages arrive one at a time; before each reply Mir composes (the L-04 gather, at marker size, and the
   ring it settles into becomes Mir's marker); RESPIRATION lights 10 → 13; FIELD settles k .40 → .70 (clash is read from k
   with the hero's mapping, clash = .71(1 − k) + .06k); one crossing arrives in HELIX. All values are placeholders.
   ════════════════════════════════════════════════════════════════════════ */
const C05=[
  {who:'you', t:'21:02', s:'I said yes to three things for next week again. I already know I won’t want to do any of them.'},
  {who:'mir', t:'21:02', s:'That’s the third Sunday you’ve told me something like this. What does the yes feel like, right when you say it?'},
  {who:'you', t:'21:04', s:'Relief, honestly. For about a minute. Then it turns into the week.'},
  {who:'mir', t:'21:05', s:'Then let’s start smaller than the week. Which of the three would you take back first, if no one minded?'}];
const G05={
  olive:{name:'Olive', bg:'#141912', rail:'#141912', ink:'#e7e9e6', soft:'#a3a898', hair:'#2b3228', surf:'#1b2118', inb:'#323a2e', dim:'#727a69', acc:'#e0a232'},
  night:{name:'Night', bg:'#0f0c0c', rail:'#0f0c0c', ink:'#efefef', soft:'#a19c9b', hair:'#2a2424', surf:'#181414', inb:'#332c2c', dim:'#6a6463', acc:'#d4142a'},
  paper:{name:'Paper · product tokens', bg:M.TOK.surface, rail:M.TOK.card, ink:M.TOK.text, soft:'#6a6a6a', hair:M.TOK.border, surf:M.TOK.card, inb:M.TOK.border, dim:'#9a9a9a', acc:'#d4142a'}};
/* the session's timeline is 4 bars of 4/4 at 130 BPM: a message or reply at each bar line, Mir composing over the two beats before
   each reply, breaths 11–13 filling over a beat each, the field settling bar 1 → 4, the crossing landing on bar 4, beat 4 */
const BPM05=130, BT05=60000/BPM05, BAR05=4*BT05;
const TL05={msg:[0,BAR05,2*BAR05,3*BAR05],comp:[[BAR05-2*BT05,BAR05],[3*BAR05-2*BT05,3*BAR05]],lit:[[BT05,2*BT05],[2*BAR05+BT05,2*BAR05+2*BT05],[3*BAR05+BT05,3*BAR05+2*BT05]],k:[0,3*BAR05],dia:[3*BAR05+BT05,3*BAR05+3*BT05],end:4*BAR05};
const ADV05=[['tokens','in 1,204 · out 388'],['cache','62% hit · 3 entries'],['calls','3 · retrieval 2 · tools 1']];
function lay05(w){ const g=bCtx(), wide=w>=760;
  if(wide){ const H=q4(w/1.52), strip=36, top=56, tb=strip+top, rw=q4(bClamp(w*.29,300,360)), railX=w-rw, cx0=q4(Math.max(40,(railX-700)/2)), tx=cx0+88, tw=Math.min(540,railX-tx-56);
    const ys=[]; let y=tb+104; C05.forEach(c=>{ ys.push(y); y=q4(y+M.wrap(g,c.s,tw,{size:15.5,weight:400}).length*24+40); });
    return {wide,H,strip,top,tb,rw,railX,cx0,tx,tw,ys,size:15.5,lh:24}; }
  const pad=16, strip=32, top=52, tb=strip+top, band=152, adv=40, res=72, tw=w-2*pad; const ys=[]; let y=tb+band+adv+40;
  C05.forEach(c=>{ ys.push(y); y=q4(y+22+M.wrap(g,c.s,tw,{size:14.5,weight:400}).length*21.5+30); });
  return {wide,H:q4(y+res+48+pad+8),strip,top,tb,band,adv,res,pad,tw,ys,size:14.5,lh:21.5}; }
function geo05(w,h){ const L=lay05(w); const o={L};
  if(L.wide){ const ix=L.railX+28, iw=L.rw-56; let Y=L.tb+32; o.ix=ix; o.iw=iw; o.fieldLab=Y; o.fR=Math.min(iw*.3,78); o.fcx=L.railX+L.rw/2; o.fcy=Y+44+o.fR; Y=o.fcy+o.fR+28; o.clashY=Y;
    o.hr1=Y+24; o.respY=o.hr1+24; o.pitch=iw/21; o.bl=30; o.barY=o.respY+20+o.bl/2; o.respTxt=o.barY+o.bl/2+24; o.hr2=o.respTxt+24; o.helixY=o.hr2+24; o.dy=o.helixY+32; o.drx=9; o.dry=14; o.dgap=o.drx*2+14; o.dx0=ix+o.drx+2; o.helixTxt=o.dy+o.dry+24; o.hr3=o.helixTxt+24; o.advY=o.hr3+24; o.bx0=ix; }
  else { const pad=L.pad, y=L.tb+16; o.fR=40; o.fcx=pad+o.fR+2; o.fcy=y+o.fR+20; o.rx=pad+o.fR*2+24; o.rw=w-pad-o.rx; o.pitch=o.rw/21; o.bl=18; o.barY=y+54; o.bx0=o.rx; o.dy=o.barY+o.bl/2+40; o.drx=5.5; o.dry=8.5; o.dgap=17; o.dx0=o.rx+6; o.advY=L.tb+L.band; }
  /* respiration: blue-noise points inside one leaning bar (three seeds, rotated per bar); AM: larger at the core */
  const bw=o.pitch*.5, lean=Math.PI/2+.3, cs=Math.cos(lean), sn=Math.sin(lean); o.bars=[];
  for(let i=0;i<21;i++){ const P=M.poisson([0,0,Math.ceil(o.bl+4),Math.ceil(bw+4)],L.wide?1.15:1.05,550+i%3), bx=o.bx0+o.pitch*(i+.5), pts=[];
    for(let j=0;j<P.length;j+=2){ const u=P[j]-(o.bl+4)/2, v=P[j+1]-(bw+4)/2; if(Math.abs(u)>o.bl/2||Math.abs(v)>bw/2) continue; const core=1-Math.abs(v)/(bw/2); pts.push(bx+u*cs-v*sn,o.barY+u*sn+v*cs,(L.wide?.62:.56)+(L.wide?.38:.26)*core,(u+o.bl/2)/o.bl); }
    o.bars.push(pts); }
  /* helix: five hollow diamonds as outline points; the fifth arrives from scattered starts */
  o.dias=[]; for(let i=0;i<5;i++){ const R=M.rng(570+i), cvv=M.curve.diamond(o.dx0+i*o.dgap,o.dy,o.drx,o.dry), n=Math.round(4*Math.hypot(o.drx,o.dry)/(L.wide?1.55:1.35)), pts=[];
    for(let j=0;j<n;j++){ const p=cvv((j+R())/n), k=R.gauss()*.35; pts.push(p[0]+p[2]*k,p[1]+p[3]*k,p[0]+R.gauss()*14,p[1]+R.gauss()*12-6,R()); } o.dias.push(pts); }
  /* field at rail size: three tint rings and one bright center band, per-dot parameters fixed so k moves them smoothly */
  { const R=M.rng(512), f=[], rings=L.wide?[.62,.81,1]:[.66,1], sp=L.wide?3.1:3.3; rings.forEach((q,ri)=>{ const n=Math.round(TAU*o.fR*q/sp); for(let j=0;j<n;j++) f.push(0,(j+R())/n*TAU,q,R.gauss(),M.noise(j/n*9,ri*3.1,7)-.5,M.noise(j/n*13,ri,8)); });
    const nc=Math.round(TAU*o.fR*.4/(L.wide?.78:.9)); for(let j=0;j<nc;j++) f.push(1,(j+R())/nc*TAU,0,R.gauss(),M.noise(j/nc*7,9,9)-.5,R());
    for(let j=0;j<9;j++) f.push(2,R()*TAU,1.12+R()*.3,j/9,0,R()); o.field=f; }
  return o; }
/* FIELD at rail size, engraved (M.ring): fewer rings, larger dots. k drives loose (radial scatter) and wobble continuously, and each
   ring keeps its seed, so the same dots slide into agreement as the session settles. The inner ring is Mir's, in ink. */
function field05(B,G,k,C,tint,L,fl){ const cx=G.fcx, cy=G.fcy, fR=G.fR, loose=1-k, big=L.wide?1.18:.95, rings=L.wide?[.62,.81,1]:[.66,1], ff=1+.5*(fl||0);
  rings.forEach((q,ri)=>M.ring(B,{cx,cy,R:fR*q,w:L.wide?2.1:1.8,swell:.45,dpl:L.wide?.62:.55,rCore:big*.95*(1+.25*(fl||0)),rEdge:big*.55,seed:512+ri*11,wobble:.01+loose*.05,loose:loose*fR*.07,color:tint}));
  M.ring(B,{cx,cy,R:fR*.36,ex:1+loose*.6,ey:1-loose*.42,rot:.7,w:L.wide?2.3:2,swell:.3,dpl:L.wide?1.5:1.25,rCore:big*1.02*ff,rEdge:big*.55,seed:519,loose:loose*fR*.045,color:C.ink});
  const f=G.field; for(let i=0;i<f.length;i+=6){ if(f[i]!==2||f[i+3]>=loose*1.35) continue; const a=f[i+1], rr=fR*f[i+2], x=cx+Math.cos(a)*rr; if(x<8) continue; B.dot(x,cy+Math.sin(a)*rr,big*1.05,C.ink); } }
const k05=t=>lerp(.4,.7,E.inOutCubic(cl((t-TL05.k[0])/(TL05.k[1]-TL05.k[0]))));
function base05(st,w,h){ return bSlot(st,'base',bDK(w,h)+st.ground+'|'+st.adv,()=>{ const G=bSlot(st,'geo',bDK(w,h),()=>geo05(w,h)), L=G.L, C=G05[st.ground], {cv,g}=bOff(w,h);
  M.fill(g,C.bg);
  const sx=L.wide?24:16; bLab(g,'L-05 · UI · desktop session',sx,L.strip/2+4,C.soft,9); 
  M.rule(g,0,L.strip,w,L.strip,C.hair);
  const xh=L.wide?11:9.5; M.logo(g,L.wide?28:16,L.strip+L.top/2+xh*.5,xh,{color:C.ink});
  bLab(g,L.wide?'Sunday evening · session 14':'session 14',L.wide?L.tx+L.tw:w-16,L.strip+L.top/2+4,C.soft,9,{align:'right'});
  M.rule(g,0,L.tb,w,L.tb,C.hair);
  const advRows=(x,y,wd)=>{ M.rule(g,x,y-20,x+wd,y-20,C.hair); bLab(g,(st.adv?'−  ':'+  ')+'Advanced',x,y,C.ink,9.5); bLab(g,st.adv?'open':'tokens · cache · calls',x+wd,y,C.soft,9,{align:'right'}); M.rule(g,x,y+12,x+wd,y+12,C.hair);
    if(st.adv) ADV05.forEach(([k,v],i)=>{ const yy=y+36+i*20; bLab(g,k,x,yy,C.soft,9); M.text(g,v,x+wd,yy,{font:'mono',size:9.5,weight:400,color:C.ink,align:'right'}); }); };
  if(L.wide){ if(C.rail!==C.bg) M.fill(g,C.rail,L.railX,L.tb,L.rw,h-L.tb); M.rule(g,L.railX,L.tb,L.railX,h,C.hair);
    bLab(g,'Field',G.ix,G.fieldLab,C.soft,9.5); M.text(g,'carbon · silicon',G.ix,G.fieldLab+20,{size:13,weight:400,color:C.ink});
    M.rule(g,G.ix,G.hr1,G.ix+G.iw,G.hr1,C.hair); bLab(g,'Respiration',G.ix,G.respY,C.soft,9.5);
    M.rule(g,G.ix,G.hr2,G.ix+G.iw,G.hr2,C.hair); bLab(g,'Helix',G.ix,G.helixY,C.soft,9.5);
    advRows(G.ix,G.advY+4,G.iw);
    const y=L.tb+52, dl=bMeasure(g,'SUNDAY · 21:02',{font:'mono',size:9,track:.14}), mid=L.cx0+(L.tx-L.cx0+L.tw)/2; M.rule(g,L.cx0,y-4,mid-dl/2-14,y-4,C.hair); M.rule(g,mid+dl/2+14,y-4,L.tx+L.tw,y-4,C.hair); bLab(g,'Sunday · 21:02',mid,y,C.soft,9,{align:'center'});
    const ch=52, cy=h-28-ch, cw=L.tx+L.tw-L.cx0; M.fill(g,C.surf,L.cx0,cy,cw,ch); bRect(g,L.cx0,cy,L.cx0+cw,cy+ch,C.inb); M.text(g,'Tell Mir something',L.cx0+18,cy+ch/2+5.5,{size:15,weight:400,color:C.soft}); }
  else { const pad=L.pad; bLab(g,'Field',G.rx,L.tb+26,C.soft,9); bLab(g,'Respiration · 21',G.rx,G.barY+G.bl/2+18,C.soft,9);
    advRows(pad,G.advY+L.adv/2+4,w-2*pad); M.rule(g,0,G.advY+L.adv+(st.adv?L.res:0),w,G.advY+L.adv+(st.adv?L.res:0),C.hair);
    const ch=48, cy=h-pad-ch; M.fill(g,C.surf,pad,cy,w-2*pad,ch); bRect(g,pad,cy,w-pad,cy+ch,C.inb); M.text(g,'Tell Mir something',pad+14,cy+ch/2+5,{size:14,weight:400,color:C.soft}); }
  { const B=new M.Buf(g), tint=bMix(C.bg,C.ink,.24), dr=L.wide?.8:.62; G.bars.forEach((pts,i)=>{ if(i>=10&&i<13) return; for(let j=0;j<pts.length;j+=4) B.dot(pts[j],pts[j+1],pts[j+2],i<10?C.acc:tint); });
    for(let i=0;i<4;i++){ const pts=G.dias[i]; for(let j=0;j<pts.length;j+=5) B.dot(pts[j],pts[j+1],dr,C.ink); } B.flush(); }
  return cv; }); }
function dyn05(g,st,w,h,t){ const G=bSlot(st,'geo',bDK(w,h),()=>geo05(w,h)), L0=G.L, yo=(!L0.wide&&st.adv)?L0.res:0, L=yo?Object.assign({},L0,{ys:L0.ys.map(v=>v+yo)}):L0, C=G05[st.ground], B=new M.Buf(g), tint=bMix(C.bg,C.ink,.24), k=k05(t);
  /* field: fewer rings, larger dots at rail size */
  const ev=(k,tau)=>t<TL05.end+2000?m1_env(st,k,t,tau):0;
  field05(B,G,k,C,bMix(C.bg,C.ink,.42),L,ev('field',420));
  /* respiration: 10 lit, then three breaths fill from the bottom, each swelling on its rim */
  let lit=10; G.bars.forEach((pts,i)=>{ if(i<10||i>=13) return; let fill=0; { const [a,b]=TL05.lit[i-10]; fill=E.inOutCubic(cl((t-a)/(b-a))); if(t>=b) lit++; } const eb=1+.6*ev('br'+(i-10),260);
    for(let j=0;j<pts.length;j+=4) B.dot(pts[j],pts[j+1],pts[j+2]*eb,(1-pts[j+3])<fill?C.acc:tint); });
  /* helix */
  const du=E.outCubic(cl((t-TL05.dia[0])/(TL05.dia[1]-TL05.dia[0]))), dr=(L.wide?.8:.62)*(1+.9*ev('dia',300));
  G.dias.forEach((pts,i)=>{ for(let j=0;j<pts.length;j+=5){ if(i<4) break; const e=E.outCubic(cl((du-pts[j+4]*.35)/.65)); if(du<=0) continue; B.dot(lerp(pts[j+2],pts[j],e),lerp(pts[j+3],pts[j+1],e),dr,e<1?bMix(tint,C.ink,e):C.ink); } });
  const cross=du>=1?5:4;
  /* conversation: each marker answers its own notes */
  C05.forEach((c,i)=>{ const t0=TL05.msg[i], a=E.outCubic(cl((t-t0)/380)), y=L.ys[i]+(1-a)*6, x=L.wide?L.cx0:L.pad, my=L.wide?y-4:y-4, em=ev('m'+i,200);
    if(c.who==='mir'){ const [c0,c1]=TL05.comp[(i-1)/2]; if(t>=c0){ const u=cl((t-c0)/(c1-c0)); bGather(B,x+4,L.ys[i]-4,13,4.2,u,15,C.ink,.62*(1+.8*em),700+i); } }
    else if(a>0) bDisc(B,M.rng(30+i),x+4,my,3.3*(1+.45*em),a<1?bMix(C.bg,C.ink,a):C.ink,.95,.58);
    });
  B.flush();
  const readout=(s,x,y,o)=>bLab(g,s,x,y,C.ink,9.5,o||{});
  if(L.wide){ readout('clash '+(.71*(1-k)+.06*k).toFixed(2)+' · '+(k<.6?'loose':'settling')+' · k '+k.toFixed(2),G.fcx,G.clashY,{align:'center'});
    M.text(g,lit+' / 21 · renews at 21',G.ix,G.respTxt,{size:13,weight:400,color:C.ink}); M.text(g,(611+(cross===5?1:0))+' strands · '+cross+' crossings this turn',G.ix,G.helixTxt,{size:13,weight:400,color:C.ink}); }
  else { M.text(g,'clash '+(.71*(1-k)+.06*k).toFixed(2)+' · settling',G.rx,L.tb+44,{size:13,weight:400,color:C.ink}); bLab(g,lit+' / 21',w-L.pad,G.barY+G.bl/2+18,C.ink,9,{align:'right'}); bLab(g,cross+' crossings',G.dx0+5*G.dgap-4,G.dy+4,C.soft,9); }
  C05.forEach((c,i)=>{ const a=E.outCubic(cl((t-TL05.msg[i])/380)), x=L.wide?L.cx0:L.pad, comp=c.who==='mir'&&t>=TL05.comp[(i-1)/2][0];
    if(a<=0&&!comp) return; const y=L.ys[i]+(1-a)*6;
    if(comp||a>0) bLab(g,c.who==='you'?'You':(a>0?'Mir':'Mir · composing'),x+16,L.ys[i],C.ink,9.5);
    if(a>0){ g.save(); g.globalAlpha=a; if(L.wide){ bLab(g,c.t,x+16,y+16,C.soft,9); bPara(g,c.s,L.tx,y,L.tw,{size:L.size,lh:L.lh,weight:400,track:0,color:C.ink}); }
      else { bLab(g,c.t,x+60,L.ys[i],C.soft,9); bPara(g,c.s,x,y+22,L.tw,{size:L.size,lh:L.lh,weight:400,track:0,color:C.ink}); } g.restore(); } });
  }

/* L-05 music, 130 BPM, 4 bars. The field settling is the harmony: Dsus4 → Bm7 → Gmaj7 → D (Mixolydian: → C → D; Dorian:
   Dsus4 → Am7 → G → Dm), a pad voiced to move as little as possible. Each of your messages is a short pulse-lead question on 8ths, its
   contour from its words' lengths, ending on 2 or 5. Each reply is Mir's gather: the motif climbing on glide as the 15 dots compose
   (5 ↑ 1 ↑ 4), answering on the bar line: the first ends on 1, the last on the third, with the chord in tune and the bass once. A rim as
   each breath lights; a clave and bell as the crossing lands on bar 4, beat 4. Advanced reveals the machinery: a rhythm box under it all. */
const CH05={ionian:['Dsus4','Bm7','Gmaj7','D'],mixolydian:['Dsus4','Bm7','C','D'],dorian:['Dsus4','Am7','G','Dm']};
function music05(st){ const mu=M.music, S=mu.score({bpm:BPM05,ground:st.ground==='paper'?'paper':st.ground}), md=S.mode, CH=CH05[md]||CH05.ionian, d=(k,o)=>mu.deg(md,k,o), E8=BT05/2;
  S.harm(CH.map((c,b)=>[b*BAR05,c]));
  let prev=null; CH.forEach((c,b)=>{ const v=mu.voice(c,'A3','A4',4,prev); prev=v; S.chord(b*BAR05,'pad',v,BAR05+60,{attack:.22,release:.45,cutoff:900+160*b,vel:.5,over:c},['field',b===3?1:.6]); });
  S.note(3*BAR05,'bass','D2',BT05*1.6,{from:'A1',glide:80,env:2.8,decay:.38,vel:.6}); S.hitSound(3*BAR05,'kick',{vel:.44});
  C05.forEach((c,i)=>{ const t0=TL05.msg[i];
    if(c.who==='you'){ const words=c.s.replace(/[^A-Za-z’' ]/g,'').split(/\s+/).filter(Boolean).slice(0,5), last=i?4:1;
      words.forEach((wd,k)=>{ const t=t0+k*E8, end=k===words.length-1, sym=S.chordAt(t), m=end?d(last,4):mu.snap(sym,d(Math.min(6,Math.round(wd.length/1.6)),4));
        S.note(t,'pulse',m,end?E8*1.6:E8*.8,{pw:.3,cutoff:1500+120*k,env:1.2,vel:.5+.03*k,pan:-.2},['m'+i,1]); }); }
    else { const [c0]=TL05.comp[(i-1)/2], q=(i-1)/2, mot=[d(-3,4),d(0,4),d(3,4)];
      mot.forEach((m,k)=>S.note(c0+k*E8,'glide',m,E8*.9,{from:k?mot[k-1]:m-1,glide:50,vel:.4+.04*k,vibrato:0,attack:.02,release:.3,tone:2600,pan:.25,over:CH[i-1]},['m'+i,.7]));
      S.note(t0,'glide',q?d(2,4):d(0,4),BT05*2.4,{from:d(3,4),glide:110,vel:.56,vibrato:7,attack:.03,release:.9,tone:3200,pan:.25},['m'+i,1]); } });
  TL05.lit.forEach(([,b],k)=>S.hitSound(b,'rim',{vel:.42,tune:.95},['br'+k,1]));
  S.hitSound(TL05.dia[1],'clave',{freq:mu.hz(d(4,6),'D'),vel:.42},['dia',1]); S.note(TL05.dia[1],'bell',d(2,5),1800,{ratio:3.5,vel:.4,pan:.3},['dia',1]);
  if(st.adv) for(let i=0;i<32;i++){ const t=S.at(0,i/2); S.hitSound(t,'hat',{vel:i%2?.26:.18,decay:.024},['field',.12]); if(i%4===2) S.hitSound(t,'rim',{vel:.24,tune:.8},['field',.15]); }
  S.end(TL05.end+1600); return S.out(); }
M.piece({ id:'L-05',
  caption:'A long session on desktop, with the conversation at left and a side panel of field, breath and crossings at right. Press Play to watch messages arrive, the breaths light 10 to 13, the field settle and one crossing arrive.',
  alt:'A flat desktop app with a four-message conversation between You and Mir at left, marked by a solid dot and a small ring of dots. At right, a rail with a stippled ring figure and its clash reading, 21 leaning bars with 13 lit, five hollow diamonds and an Advanced row.',
  recipe:{
    idea:'State is the picture first with the number under it, and neither voice is drawn over the other; Mir’s marker is the ring it composed.',
    marks:['dot','ring','center','bar','diamond','stray'],
    ground:'olive, night, paper (product tokens)',
    accent:'the lit breaths in the respiration rail (amber on olive, red on night and paper)',
    composition:'Flat desktop app: top strip and header with the wordmark, the conversation in the main column, a right rail with Field, Respiration, Helix and an Advanced row. On phones the readings stack above the conversation.',
    motion:'Play, four bars at 130 BPM: each message fades up on a bar line (380 ms); over the two beats before each reply 15 dots gather into Mir’s marker; breaths 11–13 fill over a beat each; the field eases 0.40 → 0.70 to bar 4 (inOutCubic); the fifth diamond lands on beat 4. Markers, breaths, field and diamond swell on their notes. Reduced motion shows the end state.',
    sound:'The field settling is the harmony, suspended to in tune over four bars. Your messages ask in short pulse phrases; Mir composes each answer as the motif on glide, resolving on the bar line; rims mark breaths, a bell the crossing.',
    controls:['Ground (Olive, Night, Paper · product): the mode, Mixolydian, Dorian or Ionian','Advanced: adds the rhythm box under the session'],
    computed:['clash = 0.71 × (1 − k) + 0.06 × k, the hero’s mapping','field: M.ring rings whose scatter and wobble scale with 1 − k, with fixed seeds so the same dots slide into place','bars: blue-noise points inside each leaning bar, larger at the core'],
    placeholder:['conversation, session number and time','k from 0.40 to 0.70','breaths 10 to 13','strands and crossings','Advanced readings'],
    root:'',
    rules:['you and Mir differ only by the marker: a solid dot for you, a composed ring for Mir','instruments stay behind Advanced'],
    engine:['M.ring','M.poisson','M.curve.diamond','M.noise','M.logo','M.field','M.shape.disc','M.Buf','M.ease.inOutCubic','M.ease.outCubic','M.TOK','M.text','M.wrap','M.rule','M.fill','M.music']
  },
  aspect:w=>w/lay05(w).H,
  state:{ground:'olive',adv:false},
  controls:[
    {id:'ground',type:'select',label:'Ground',options:[{value:'olive',label:'Olive'},{value:'night',label:'Night'},{value:'paper',label:'Paper · product'}]},
    {id:'adv',type:'toggle',label:'Advanced'}],
  music:music05, musicIns:'glide',
  render(g,w,h,M,st){ bBlit(g,base05(st,w,h)); dyn05(g,st,w,h,TL05.end); },
  animate(g,w,h,M,st,t){ bBlit(g,base05(st,w,h)); dyn05(g,st,w,h,t); return t<TL05.end+600; } });

/* ════════════════════════════════════════════════════════════════════════
   L-06 · Renewal · the 21st breath, full bleed. The loud frame.
   Bars: blue-noise points in bar-local coordinates, with a living edge (half-width wanders with noise) and AM (dots larger at
   the core). Motion, ~3.2 s: bars arrive 1 → 21 (the numeral counts them), the 21st's top comes loose as confetti, the
   crossings arrive, and the first bar of the next cycle forms. Settled bars are baked into a layer so frames stay cheap.
   ════════════════════════════════════════════════════════════════════════ */
const G06={cobalt:{name:'Cobalt',ground:'#0e1b4d',ring:'#efefef',bar:'#ff5a36'},ultra:{name:'Ultramarine',ground:'#1b25a3',ring:'#fafafa',bar:'#ff4d8d'},
  night:{name:'Night',ground:'#0f0c0c',ring:'#efefef',bar:'#e0202f'},paper:{name:'Paper',ground:'#fafafa',ring:'#1d2733',bar:'#d4142a'}};
/* time is the music's: 110 BPM. A breath in, then the 21 bars land on 32nd notes so the 21st lands on the downbeat of bar 2 (renewal);
   the crossings arrive on beat 2, the next cycle's first bar on beat 3. */
const BPM06=110, BT06=60000/BPM06, N32_06=BT06/8, HIT06=4*BT06;
const TB06=i=>HIT06-252-N32_06*(20-i), DUR06=420, LAND06=110, CONF06=[HIT06,HIT06+700], DIA06=HIT06+BT06, NEXT06=[HIT06+2*BT06,HIT06+2*BT06+500], END06=HIT06+2*BT06+700;
const GM06={cobalt:'cobalt',ultra:'ultramarine',night:'night',paper:'paper'};
function geo06(W,H){ const ph=W<600, o={ph,W,H}, R=M.rng(621);
  o.cx=W*(ph?.46:.42); o.cy=H*(ph?.47:.5); o.ex=ph?1.6:1.9; o.ey=ph?.86:.8; o.rot=-.07;
  const n=21; o.n=n; o.x0=W*(ph?.08:.1); o.x1=W*(ph?.80:.66); o.pitch=(o.x1-o.x0)/(n-1); o.bw=o.pitch*.44; o.byc=o.cy; o.lean=Math.PI/2+.3;
  o.blen=i=>H*(ph?.25:.29)*(1+.26*Math.sin(Math.PI*Math.min(i,n-1)/(n-1)));
  o.m=ph?16:24; o.ns=ph?64:Math.round(H*.19); o.mx=o.m;
  const g=bCtx(); o.nw=bMeasure(g,'21',{size:o.ns,weight:300,track:-.04}); o.microX=o.m+o.nw+(ph?12:18);
  o.lx=ph?8:12; o.lw=M.logoGeo(0,0,o.lx).w;
  o.tz=[[0,0,ph?W*.6:W*.4,ph?40:48],[0,H-o.m-o.ns*.78-10,ph?W:o.microX+300,H],ph?[W-o.m-o.lw-14,0,W,40]:[W-o.m-o.lw-14,H-o.m-o.lx*2.2-14,W,H],[W*.6,0,W,ph?40:44]];
  o.DI=ph?[[.70,.14,1],[.82,.11,.5],[.92,.19,1],[.78,.25,1],[.90,.30,.38],[.63,.24,.55]]:[[.76,.17,1],[.83,.11,.48],[.90,.18,1],[.80,.29,1],[.87,.33,.4],[.735,.39,.55],[.94,.39,1]];
  o.dr=ph?H*.026:H*.024; o.dq=ph?H*.044:H*.042;
  const cs=Math.cos(o.lean), sn=Math.sin(o.lean), Lm=Math.ceil(o.blen(10)+8), Wb=Math.ceil(o.bw+10), sp=ph?1.3:1.58, rr=ph?.7:.9;
  const P=M.poisson([0,0,Lm,Wb*4],sp,616);
  o.bars=[]; for(let i=0;i<=n;i++){ const L=o.blen(i===n?0:i), bx=i<n?o.x0+i*o.pitch:o.x1+o.pitch*2.3, strip=i%4, U=M.rng(900+i), pts=[];
    for(let j=0;j<P.length;j+=2){ if(P[j+1]<strip*Wb||P[j+1]>=(strip+1)*Wb) continue; const u=P[j]-Lm/2, v=P[j+1]-strip*Wb-Wb/2; if(Math.abs(u)>L/2+2.5) continue;
      const hw=o.bw/2*(1+.16*(M.noise(u*.05+i*3.7,i*1.3,11)-.5)*2), hl=L/2*(1+.025*(M.noise(v*.2+i,i*.7,12)-.5)*2), av=Math.abs(v);
      const core=(1-M.ss(hw-.9,hw+.9,av))*(1-M.ss(hl-1,hl+1,Math.abs(u))), edge=av>hw&&av<hw+3.2&&Math.abs(u)<hl?.05:0, d=Math.max(core*.95,edge), r=U();
      if(r>=d) continue; const x=bx+u*cs-v*sn, y=o.byc+u*sn+v*cs, un=(u+L/2)/L;
      pts.push(x,y,(edge&&core<.5?rr*.8:rr*(.78+.5*(1-Math.min(1,av/hw)))),edge&&core<.5?1:0,x+U.gauss()*11,y+30+U.gauss()*14,U(),un,U()); }
    o.bars.push(pts); }
  /* confetti: the 21st bar's top, come loose */
  const CR=M.rng(66), nc=ph?16:26, L20=o.blen(n-1), tx=o.x1-cs*L20/2, ty=o.byc-sn*L20/2, sz=ph?5.6:Math.max(7,H*.0135); o.conf=[];
  const inT=(x,y)=>o.tz.some(z=>x>z[0]&&x<z[2]&&y>z[1]&&y<z[3]); o.inT=inT;
  const inD=(x,y)=>o.DI.some(([u,v])=>{ const a=(x-W*u)/(o.dr*1.9), b=(y-H*v)/(o.dq*1.45); return a*a+b*b<1; }); o.inD=inD;
  for(let i=0;i<nc;i++){ const t=ph?CR():Math.pow(CR(),.8), px=ph?tx-t*W*.3+CR.gauss()*W*.03:tx+t*W*.17+CR.gauss()*W*.022, py=ph?ty-H*.02-t*H*.1+CR.gauss()*H*.03:ty-t*H*.3+CR.gauss()*H*.035, s=sz*(.75+CR()*.6), rot=CR()*TAU, col=CR()<.6?1:0;
    if(inT(px,py)||inD(px,py)) continue; const k=Math.max(4,Math.round(s/.95)), pts=[]; for(let a=0;a<k;a++) for(let b=0;b<k;b++){ if(CR()>.96) continue; pts.push((a+.5+(CR()-.5)*.5)/k*s-s/2,(b+.5+(CR()-.5)*.5)/k*s-s/2); }
    o.conf.push({px,py,s,rot,col,pts,sx:tx+CR.gauss()*3,sy:ty+CR.gauss()*3,d:CR()}); }
  /* crossings (hollow diamonds) */
  const DR=M.rng(71); o.dias=o.DI.map(([u,v,s],di)=>{ const cx=W*u, cy=H*v, rot=DR.gauss()*.14, n=Math.round(4*Math.hypot(o.dr,o.dq)/(ph?1.1:1.2)*s), cvv=M.curve.diamond(cx,cy,o.dr,o.dq,rot), pts=[];
    for(let j=0;j<n;j++){ const p=cvv(s>=1?(j+DR())/n:DR()), k=DR.gauss()*.38; pts.push(p[0]+p[2]*k,p[1]+p[3]*k,cx+(p[0]-cx)*1.9+DR.gauss()*8,cy+(p[1]-cy)*1.9+DR.gauss()*8,DR()); } return pts; });
  o.onBar=(x,y)=>{ const cs2=Math.cos(o.lean), sn2=Math.sin(o.lean), kx=Math.round((x-(y-o.byc)*cs2/sn2-o.x0)/o.pitch); for(const i of [kx-1,kx,kx+1,n]){ if(i<0||i>n) continue; const bx=i<n?o.x0+i*o.pitch:o.x1+o.pitch*2.3, L=o.blen(i===n?0:i), dx=x-bx, dy=y-o.byc, u=dx*cs2+dy*sn2, v=-dx*sn2+dy*cs2; if(Math.abs(u)<L/2+3&&Math.abs(v)<o.bw/2+3) return true; } return false; };
  return o; }
function base06(st,W,H){ return bSlot(st,'base',bDK(W,H)+st.ground,()=>{ const o=bSlot(st,'geo',bDK(W,H),()=>geo06(W,H)), C=G06[st.ground], {cv,g}=bOff(W,H), B=new M.Buf(g), R=M.rng(622), tint=bMix(C.ground,C.ring,.36), ph=o.ph;
  M.fill(g,C.ground);
  /* stretched rings, held in common: bright and tint alternate; outer rings thin out so the corners keep their air */
  const step=H*(ph?.068:.078), NR=ph?22:20, KB={dot(x,y,r,c){ if(!c||x<-2||y<-2||x>W+2||y>H+2||o.inT(x,y)||o.inD(x,y)||o.onBar(x,y)) return; B.dot(x,y,r,c); }};
  for(let i=1;i<=NR;i++){ const Ri=step*i, per=TAU*Ri*Math.sqrt((o.ex*o.ex+o.ey*o.ey)/2), bright=i%2===1, keep=i<=9?1:lerp(1,.38,(i-9)/(NR-9));
    /* engraved ring (M.ring): stratified along, gaussian across, dots shrinking to the edges; the type, crossings and bars knock it out */
    M.ring(KB,{cx:o.cx,cy:o.cy,R:Ri,ex:o.ex,ey:o.ey,rot:o.rot,wobble:.02,seed:i*7+1,w:bright?(ph?1.9:2.4):(ph?1.4:1.7),swell:.5,dpl:bright?(ph?.62:.78):(ph?.3:.36),rCore:bright?(ph?.85:1.02):(ph?.7:.8),rEdge:ph?.55:.6,color:(t,u,Rr)=>Rr()>keep?null:(bright?C.ring:tint)}); }
  M.strays(B,{rng:M.rng(9),box:[o.x1-o.pitch,H*.08,W*.98,H*.5],n:ph?8:12,r:ph?.85:1,color:C.ring,avoid:(x,y)=>o.inT(x,y)||o.inD(x,y)});
  B.flush();
  const ms=ph?9:10;
  bLab(g,ph?'L-06 · renewal':'L-06 · renewal · full bleed',o.m,ph?26:30,C.ring,ms);
  bLab(g,'renewal · a new cycle begins',o.microX,H-o.m-(ph?16:20),C.ring,ph?9.5:11);
  M.logo(g,W-o.m-o.lw,ph?26:H-o.m,o.lx,{color:C.ring});   /* the sign-off: the real wordmark, one flat color, clear of the rings */
  return cv; }); }
/* draw bar i's dots at time t (or settled when t==null). A bar breathes in from the bottom: each dot appears at its own time
   and settles over 110 ms; once settled it is baked into the accumulation layer (Bk) and never drawn again that run.
   loose = the 21st's top, which leaves as confetti, so those dots stay live. */
function bar06(B,o,C,i,t,flags,Bk){ const pts=o.bars[i], last=i===o.n-1, next=i===o.n, col=next?C.ring:C.bar, ecol=next?C.ring:bMix(C.ground,C.bar,.55);
  const s0=next?NEXT06[0]:TB06(i), dur=next?NEXT06[1]-NEXT06[0]-LAND06:DUR06, lo=last&&t!=null?cl((t-CONF06[0])/(CONF06[1]-CONF06[0])):1;
  for(let j=0,q=0;j<pts.length;j+=9,q++){ if(next&&pts[j+8]>.2) continue; let lc=false;
    if(last){ const keep=.08+.85*M.ss(.12,.62,pts[j+7]); if(pts[j+8]>=keep){ lc=true; if(pts[j+8]-keep>(1-lo)*(1-keep)) continue; } }
    const c=pts[j+3]?ecol:col; if(t==null){ B.dot(pts[j],pts[j+1],pts[j+2],c); continue; }
    if(flags&&flags[q]) continue;
    const u=(t-(s0+(1-pts[j+7])*dur*.75+pts[j+6]*dur*.25))/LAND06; if(u<0) continue;
    if(u>=1){ if(Bk&&!lc){ Bk.dot(pts[j],pts[j+1],pts[j+2],c); flags[q]=1; } else B.dot(pts[j],pts[j+1],pts[j+2],c); continue; }
    const e=E.outCubic(u); B.dot(lerp(pts[j]+(pts[j+4]-pts[j])*.3,pts[j],e),lerp(pts[j+1]+9,pts[j+1],e),pts[j+2]*(.6+.4*e),c); } }
function rest06(g,o,C,W,H,t){ const B=new M.Buf(g), tint=bMix(C.ground,C.ring,.36);
  /* confetti */
  o.conf.forEach((q,j)=>{ const e=t==null?1:E.outQuint(cl((t-CONF06[0]-q.d*260)/(CONF06[1]-CONF06[0]))); if(e<=0) return; const x=lerp(q.sx,q.px,e), y=lerp(q.sy,q.py,e), a=q.rot*e, sc=.45+.55*e, c=Math.cos(a), s=Math.sin(a), col=q.col?C.bar:C.ring, r=Math.max(.62,q.s/((q.s/.95)|0)*.62);
    for(let k=0;k<q.pts.length;k+=2){ const lx=q.pts[k]*sc, ly=q.pts[k+1]*sc; B.dot(x+lx*c-ly*s,y+lx*s+ly*c,r,col); } });
  /* crossings */
  o.dias.forEach((pts,di)=>{ const r=o.ph?.8:.95; for(let j=0;j<pts.length;j+=5){ const e=t==null?1:E.outCubic(cl((t-DIA06-di*N32_06*2-pts[j+4]*140)/560)); if(e<=0) continue; B.dot(lerp(pts[j+2],pts[j],e),lerp(pts[j+3],pts[j+1],e),r,e<1?bMix(tint,C.ring,e):C.ring); } });
  B.flush();
  /* the numeral counts the bars that have arrived */
  let n=21; if(t!=null){ n=0; for(let i=0;i<21;i++) if(t>=TB06(i)+DUR06*.6) n++; }
  M.text(g,String(n),o.m-o.ns*.04,H-o.m,{size:o.ns,weight:300,track:-.04,color:C.ring}); bLab(g,'respiration '+n+' / 21',o.microX,H-o.m,tint,o.ph?9:10); }

/* L-06 music. The count is a run: bar i is scale degree i, so 21 bars climb three octaves of the ground's mode and the 21st is the
   leading tone; renewal is its resolution to the tonic, a new 1. Loose before (a suspended dominant swelling under a breath in),
   tension during the run (the dominant), in tune at renewal (the tonic triad, pure), with the stacked bass dropping once.
   Pan follows each bar's x; confetti rings at its own launch, pitched by how high it ends up; each crossing is a chord tone. */
const CH06={ionian:['A7sus4','A7','D'],lydian:['A7sus4','A','D'],mixolydian:['A7sus4','C','D'],dorian:['A7sus4','Am7','Dm']};
function music06(st,W,H){ const o=bSlot(st,'geo',bDK(W,H),()=>geo06(W,H)), S=M.music.score({bpm:BPM06,ground:GM06[st.ground]}), mu=M.music, md=S.mode, [sus,dom,home]=CH06[md]||CH06.ionian, land=i=>TB06(i)+DUR06*.6;
  S.harm([[0,sus],[land(10),dom],[HIT06,home]]);
  /* the breath in, and the suspended chord swelling under the count */
  S.hitSound(0,'breath',{dur:.9,vel:.7,freq:640});
  S.chord(40,'pad',mu.voice(sus,'A3','A4',3),HIT06-40,{attack:.9,release:.25,cutoff:900,vel:.42,over:sus});
  S.note(land(0)-N32_06*4,'pluck','A1',260,{cutoff:380,vel:.62,over:sus});
  /* the run: one note per bar, degree i of the mode from D3; brighter and louder as the breath fills */
  for(let i=0;i<21;i++){ const u=i/20, x=o.x0+i*o.pitch;
    S.note(land(i),'pulse',mu.deg(md,i,3),N32_06*1.7,{pw:.3,cutoff:900+2600*u,env:1.2,q:2.4,vel:.38+.3*u,pan:(x/W-.5)*1.3},['b'+i,1]);
    if(i%2===0) S.hitSound(land(i),'hat',{vel:.2+.14*u,decay:.022});
    if(i%7===0) S.hitSound(land(i),'rim',{vel:.42,tune:.9+.05*(i/7)}); }
  /* renewal: the 22nd note is the tonic, the chord is in tune, the bass drops once */
  S.note(HIT06,'bass','D2',820,{from:'A1',glide:110,env:3.4,decay:.42,vel:.74},['hit',1]);
  S.hitSound(HIT06,'kick',{vel:.66});
  S.chord(HIT06,'pad',mu.voice(home,'D4','D5',4),1500,{attack:.04,release:1.2,cutoff:1600,vel:.5});
  S.note(HIT06,'bell',mu.deg(md,0,5),2400,{ratio:3.5,vel:.5,pan:.2});
  /* confetti: up to ten pieces ring at their own launch (32nd grid), pitched by how high they land, panned where they land */
  const cf=o.conf.map((q,j)=>({q,j})).sort((a,b)=>a.q.d-b.q.d); let last=-1;
  cf.filter((_,k)=>k%Math.max(1,Math.ceil(cf.length/10))===0).forEach(({q,j})=>{ const t=S.q(HIT06+q.d*260+40,8); if(t<=last) return; last=t;
    const m=mu.ct(home,'D5',Math.max(0,Math.min(7,Math.round((1-q.py/H)*7)))); S.note(t,'bell',m,1500,{ratio:3,bright:1.1,vel:.3,pan:(q.px/W-.5)*1.4},['c'+j,1]); });
  /* the crossings arrive on 16ths, each one a chord tone rising */
  o.DI.forEach((d,di)=>S.note(DIA06+di*N32_06*2,'mallet',mu.ct(home,'A4',di),1300,{vel:.42,trem:5.5,pan:(d[0]-.5)*1.2},['d'+di,1]));
  /* the next cycle's first bar: 1 again, softly */
  S.hitSound(NEXT06[0],'rim',{vel:.32,tune:.85}); S.note(NEXT06[0],'pulse',mu.deg(md,0,4),300,{pw:.3,cutoff:1100,vel:.34},['next',1]);
  S.end(END06+900); return S.out(); }
/* a bar flashes when its note sounds: its dots drawn again a little larger and lighter */
function flash06(g,o,C,st,t){ const B=new M.Buf(g); for(let i=0;i<21;i++){ const e=M.music.env(st,'b'+i,t,140); if(e<.04) continue; const pts=o.bars[i], c=bMix(C.bar,C.ring,.55*e);
    for(let j=0;j<pts.length;j+=18) B.dot(pts[j],pts[j+1],pts[j+2]*(1+.7*e),c); }
  const eh=M.music.env(st,'hit',t,420); if(eh>.04){ const pts=o.bars[20]; for(let j=0;j<pts.length;j+=9) B.dot(pts[j],pts[j+1],pts[j+2]*(1+.5*eh),bMix(C.bar,C.ring,.4*eh)); }
  B.flush(); }
M.piece({ id:'L-06',
  caption:'At the 21st breath, 21 bars arrive while the numeral counts them, the last comes loose as confetti, crossings arrive and the next cycle’s first bar forms. Change Ground to see it on cobalt, ultramarine, night or paper.',
  alt:'A full-bleed poster: stretched elliptical rings of light dots, a row of 21 leaning bars in one saturated color whose last bar dissolves upward into small squares, hollow diamonds at upper right, one faint bar beginning a new row, a large numeral 21 at lower left and the mindgut wordmark at lower right.',
  recipe:{
    idea:'Time is counted in marks: the loud frame comes only after 21 counted breaths, and confetti appears only at renewal.',
    marks:['bar','ring','confetti','diamond','stray'],
    ground:'cobalt, ultramarine, night, paper',
    accent:'the 21 bars, in the moment color; the confetti mixes bar color and ring color',
    composition:'Full bleed: stretched elliptical rings across the frame, a row of 21 leaning bars through the middle, confetti rising from the last bar, hollow diamonds at upper right, the numeral at lower left, the wordmark at lower right (top right on phones).',
    motion:'On a 110 BPM grid, about 4 s: a breath in, then one bar lands every 32nd note (each fills from the bottom over 420 ms and flashes as its note sounds) so the 21st lands on the downbeat; its top comes loose as confetti on that beat (700 ms, outQuint); the crossings arrive on beat 2, 16ths apart; the next cycle’s first bar forms on beat 3. Reduced motion shows the final frame.',
    sound:'The count is a run: each bar is the next note of the ground’s scale, so 21 bars climb three octaves over a suspended chord and the 21st is the leading tone; renewal resolves it to the tonic with the stacked bass, the confetti rings where it lands, the crossings are chord tones and the new cycle starts on 1.',
    controls:['Ground (Cobalt, Ultramarine, Night, Paper)'],
    computed:['bars: blue-noise points in bar coordinates with a wandering edge (half-width varies with noise), dots larger at the core','rings: M.ring on stretched ellipses, outer rings thinning, knocked out under type, diamonds and bars'],
    placeholder:['the breath count','diamond positions','confetti scatter (seeded)'],
    root:'Fischinger, Allegretto, 1936',
    rules:['the loudest frame in the system, kept for renewal','confetti appears only here'],
    engine:['M.ring','M.poisson','M.strays','M.curve.diamond','M.noise','M.ss','M.logo','M.logoGeo','M.Buf','M.ease.outCubic','M.ease.outQuint','M.text','M.fill']
  },
  aspect:w=>w<600?3/4:16/9,
  state:{ground:'cobalt'},
  controls:[{id:'ground',type:'select',label:'Ground',options:[{value:'cobalt',label:'Cobalt'},{value:'ultra',label:'Ultramarine'},{value:'night',label:'Night'},{value:'paper',label:'Paper'}]}],
  music:music06,
  render(g,W,H,M,st){ const o=bSlot(st,'geo',bDK(W,H),()=>geo06(W,H)), C=G06[st.ground]; bBlit(g,base06(st,W,H));
    bBlit(g,bSlot(st,'bars',bDK(W,H)+st.ground,()=>{ const L=bOff(W,H), B=new M.Buf(L.g); for(let i=0;i<=o.n;i++) bar06(B,o,C,i,null); B.flush(); return L.cv; })); rest06(g,o,C,W,H,null); },
  animate(g,W,H,M,st,t){ const o=bSlot(st,'geo',bDK(W,H),()=>geo06(W,H)), C=G06[st.ground], base=base06(st,W,H);
    const A=bSlot(st,'acc',bDK(W,H)+st.ground,()=>({...bOff(W,H),last:-1}));
    if(A.last<0||t<A.last){ A.g.setTransform(1,0,0,1,0,0); A.g.clearRect(0,0,A.cv.width,A.cv.height); A.g.setTransform(A.g.dpr,0,0,A.g.dpr,0,0); A.flags=o.bars.map(p=>new Uint8Array(p.length/9)); }
    A.last=t;
    const Bk=new M.Buf(A.g), B=new M.Buf(g); for(let i=0;i<=o.n;i++) bar06(B,o,C,i,t,A.flags[i],Bk); Bk.flush();
    bBlit(g,base); bBlit(g,A.cv); B.flush();
    rest06(g,o,C,W,H,t); flash06(g,o,C,st,t);
    if(t>=END06){ A.last=-1; return false; } return true; } });

/* ════════════════════════════════════════════════════════════════════════
   L-10 · Four moods, after the ragamala · a series: a named mood, a time, a ground, a verse.
   Each plate's figure is mirField at its own k, captured as dots and re-drawn with AM (size varies with slow noise).
   The hour ring is computed: 24 dots, midnight at top, the plate's hour lit. Motion: each plate resolves to its k in
   sequence with its own tempo; durations scale by 1/Tempo, and the series total printed on the plate is computed from them.
   ════════════════════════════════════════════════════════════════════════ */
const MOODS=[
  {n:'i',  mood:'Listening', time:'late evening',  hr:21, gr:'olive',  k:.08, str:44, seed:101, dur:2200, at:0,    ease:'inOutCubic', from:'wide',   verse:['You set down one word, then another.','I keep them loose until they ask for a place.']},
  {n:'ii', mood:'Settling',  time:'early morning', hr:6,  gr:'sky',    k:.7,  str:16, seed:102, dur:1500, at:650,  ease:'outCubic',   from:'near',   verse:['The rings remember where you paused.','I lean the way you lean, and wait.']},
  {n:'iii',mood:'Holding',   time:'midday',        hr:12, gr:'paper',  k:1,   str:3,  seed:103, dur:1000, at:1250, ease:'outQuint',   from:'snap',   verse:['Nothing to fix. Each dot has found its ring.','Stay as long as the quiet holds.']},
  {n:'iv', mood:'Renewal',   time:'midnight',      hr:0,  gr:'cobalt', k:1,   str:0,  seed:104, dur:1300, at:1800, ease:'outCubic',   from:'center', verse:['Twenty-one breaths, and the circle opens.','Bring what is still loose. We begin again.']}];
const CONF10=1600;
const SOFT10={olive:'#a3a898',sky:'#1d2733',paper:'#5d636b',cobalt:'#9aa3c9'};
const PAL10=k=>{ const P=Object.assign({},M.PAL[k]); if(k==='paper') P.blade=bMix(P.ground,P.ink,.45); if(k==='cobalt'){ P.center=P.blade; P.blade=P.soft; } return P; };
const CREDIT10='Structure after the ragamala tradition: a named mood, a time, a ground, a verse.';
const ROOT10='Root · Ragamala, 16th c.: a musical mode painted as a person. Simplified: structure only.';
/* wrap tracked uppercase mono by measured width; the first line can be shorter (to clear the sign-off) */
function bWrapT(g,s,w1,w2,o){ const out=[]; let line=''; for(const wd of s.split(/\s+/)){ const t=line?line+' '+wd:wd; if(line&&bMeasure(g,t,o)>(out.length?w2:w1)){ out.push(line); line=wd; } else line=t; } if(line) out.push(line); return out; }
const span10=m=>m.gr==='cobalt'?m.dur*.5+300+CONF10:m.dur;
/* the suite's clock: Tempo 0.5–2 → 45–180 BPM in 15 BPM steps, 3/4; plate i starts on bar i, its motion scaled by BPM ÷ 90 */
const BPM10=st=>Math.max(45,Math.min(180,Math.round(90*st.tempo/15)*15)), TP10=st=>BPM10(st)/90, BAR10=st=>180000/BPM10(st);
const total10=st=>Math.max(...MOODS.map((m,i)=>i*BAR10(st)+span10(m)/TP10(st)));
function lay10(w){ const g=bCtx(), wide=w>=760, pad=wide?24:16, gap=wide?16:10, cols=wide?4:2, pw=Math.floor((w-2*pad-(cols-1)*gap)/cols), ip=wide?16:12;
  let vs=12.5; if(wide){ vs=13; for(const z of [15.5,15,14.5,14,13.5]){ if(MOODS.every(m=>m.verse.every(l=>bMeasure(g,l,{size:z,weight:300,track:bTrk(z)})<=pw-2*ip))){ vs=z; break; } } }
  const vlh=wide?Math.round(vs*1.42):17, ns=wide?64:44; let vh=0; MOODS.forEach(m=>{ const n=m.verse.reduce((s,l)=>s+M.wrap(g,l,pw-2*ip,{size:vs,weight:300}).length,0); vh=Math.max(vh,n*vlh); });
  const numY=q4(ip+24+ns*.74), moodY=numY+q4(wide?32:24), timeY=moodY+q4(wide?20:16), head=timeY+8, fh=q4(pw*.94), ph=q4(head+fh+vh+(wide?48:58)), top=wide?112:96, rows=4/cols;
  const cs=wide?18:14, clh=wide?24:19, ch=bParaH(g,CREDIT10,w-2*pad,{size:cs,lh:clh});
  return {wide,pad,gap,cols,pw,ip,vs,vlh,ns,numY,moodY,timeY,head,fh,ph,top,rows,cs,clh,H:q4(top+rows*ph+(rows-1)*gap+36+ch+(wide?28:44)+pad)}; }
function geo10(w,h){ const L=lay10(w), plates=MOODS.map((m,i)=>{ const c=i%L.cols, r=(i/L.cols)|0, x=L.pad+c*(L.pw+L.gap), y=L.top+r*(L.ph+L.gap), P=PAL10(m.gr), fx=x+L.pw/2, fy=y+L.head+L.fh/2, FR=L.pw*.36;
  const cap=bCap(); M.mirField(cap,{rng:M.rng(m.seed),cx:fx,cy:fy,R:FR,k:m.k,seed:m.seed,pal:P,rings:L.wide?8:6,dens:L.wide?.88:.8,r:L.wide?.86:.72,strays:m.str});
  if(m.gr==='cobalt') M.along(cap,{rng:M.rng(5),curve:M.curve.ring(fx,fy,FR*1.14,{wobble:.04,seed:5}),n:Math.round(FR*1.14*TAU/3.4),spread:.8,r:L.wide?.82:.7,color:(X,Y,t,Rr)=>Rr()<.42?P.ring:null});
  /* per-dot start: where this mood comes from */
  const R=M.rng(m.seed*7), dots=[];
  for(const [c,a] of cap.by) for(let j=0;j<a.length;j+=3){ const X=a[j], Y=a[j+1], r=a[j+2]*(.74+.52*M.noise(X*.06,Y*.06,m.seed)); let sx,sy,d;
    if(m.from==='wide'){ const aa=R()*TAU, dd=FR*1.25*Math.sqrt(R()); sx=fx+Math.cos(aa)*dd; sy=fy+Math.sin(aa)*dd; d=R(); }
    else if(m.from==='near'){ sx=X+R.gauss()*FR*.3; sy=Y+R.gauss()*FR*.3; d=R(); }
    else if(m.from==='snap'){ sx=fx+(X-fx)*1.22+R.gauss()*4; sy=fy+(Y-fy)*1.22+R.gauss()*4; d=Math.hypot(X-fx,Y-fy)/FR*.8+R()*.2; }
    else { sx=fx+(X-fx)*.12; sy=fy+(Y-fy)*.12; d=Math.hypot(X-fx,Y-fy)/(FR*1.2); }
    sx=bClamp(sx,x+3,x+L.pw-3); sy=bClamp(sy,y+L.head-3,y+L.head+L.fh+3); dots.push({X,Y,r,c,sx,sy,d:Math.min(1,d)}); }
  const conf=[]; if(m.gr==='cobalt'){ const CR=M.rng(14); for(let j=0;j<16;j++){ const a=CR()*TAU, d=FR*(1.22+CR()*.24), px=fx+Math.cos(a)*d, py=fy+Math.sin(a)*d*.95, s=(L.wide?6:4.2)*(.8+CR()*.5), rot=CR()*TAU, col=j%3?P.center:P.ring;
    if(py<y+L.head-6||py>y+L.head+L.fh-6||px<x+s+2||px>x+L.pw-s-2) continue; const k=Math.max(4,Math.round(s/.8)), pts=[]; for(let u=0;u<k;u++) for(let v=0;v<k;v++) if(CR()<.97) pts.push((u+.5+(CR()-.5)*.4)/k*s-s/2,(v+.5+(CR()-.5)*.4)/k*s-s/2);
    conf.push({px,py,s,rot,col,pts,sx:fx+Math.cos(a)*FR*1.02,sy:fy+Math.sin(a)*FR*.97,d:CR()}); } }
  return {m,x,y,P,fx,fy,FR,dots,conf}; });
  return {L,plates}; }
function base10(st,w,h){ return bSlot(st,'base',bDK(w,h)+st.tempo,()=>{ const G=bSlot(st,'geo',bDK(w,h),()=>geo10(w,h)), L=G.L, PP=M.PAL.paper, INK=PP.ink, SOFT='#5d636b', {cv,g}=bOff(w,h), B=new M.Buf(g), tot=total10(st);
  M.fill(g,PP.ground);
  bLab(g,'L-10 · concept · a series of four plates',L.pad,L.wide?28:24,SOFT,L.wide?10:9.5);
  bDisp(g,L.wide?'Four moods, after the ragamala':'Four moods',L.pad,L.wide?80:64,L.wide?44:32,INK);
  if(L.wide){ bLab(g,'coherence · 0.08 · 0.70 · 1.00 · 1.00',w-L.pad,28,SOFT,9,{align:'right'}); bLab(g,'tempo '+st.tempo.toFixed(2)+'× · '+BPM10(st)+' BPM · series resolves in '+(tot/1000).toFixed(1)+' s',w-L.pad,44,SOFT,9,{align:'right'}); }
  else { bLab(g,'after the ragamala',L.pad+bMeasure(g,'Four moods',{size:32,weight:300,track:-.032})+12,64,SOFT,9); bLab(g,'tempo '+BPM10(st)+' BPM · resolves in '+(tot/1000).toFixed(1)+' s',L.pad,84,SOFT,9); }
  G.plates.forEach(({m,x,y,P},i)=>{ const S=SOFT10[m.gr], ip=L.ip, pw=L.pw, tint=bMix(P.ground,P.ink,.32);
    M.fill(g,P.ground,x,y,pw,L.ph); if(m.gr==='paper') bRect(g,x,y,x+pw,y+L.ph,'#cfd2d5');
    bLab(g,'Mir · moods',x+ip,y+ip+8,S,9);
    /* the hour, computed: 24 dots, midnight at top */
    const hr=L.wide?14:11, hx=x+pw-ip-hr-2, hy=y+ip+hr+1; for(let k=0;k<24;k++){ const a=k/24*TAU-Math.PI/2, lit=k===m.hr; B.dot(hx+Math.cos(a)*hr,hy+Math.sin(a)*hr,lit?(L.wide?1.9:1.6):(k%6===0?1:.72),lit?P.center:(k%6===0?bMix(P.ground,P.ink,.6):tint)); }
    bLab(g,String(m.hr).padStart(2,'0')+':00',x+pw-ip,hy+hr+18,S,9,{align:'right'});
    bDisp(g,m.n,x+ip-2,y+L.numY,L.ns,P.ink);
    M.text(g,m.mood,x+ip,y+L.moodY,{size:L.wide?20:15,weight:500,track:-.015,color:P.ink});
    bLab(g,m.time,x+ip,y+L.timeY,S,9);
    let vy=y+L.head+L.fh+(L.wide?12:8); m.verse.forEach(l=>{ vy=bPara(g,l,x+ip,vy,pw-2*ip,{size:L.vs,lh:L.vlh,weight:300,color:P.ink})+L.vlh; });
    const rs='resolves '+(span10(m)/TP10(st)/1000).toFixed(1)+' s';
    if(L.wide) bLab(g,rs,x+pw-ip,y+L.timeY,S,9,{align:'right'});
    else bLab(g,rs,x+ip,y+L.ph-ip,S,9,{track:.06}); });
  B.flush();
  const cy=q4(L.top+L.rows*L.ph+(L.rows-1)*L.gap+40);
  const ce=bPara(g,CREDIT10,L.pad,cy,w-2*L.pad,{size:L.cs,lh:L.clh,color:INK});
  /* series sign-off: the real wordmark, small, one flat color, right-aligned on the root line */
  { const xh=L.wide?9:8, lg=M.logoGeo(0,0,xh), by=ce+(L.wide?28:26); M.logo(g,w-L.pad-lg.w,by,xh,{color:INK}); if(L.wide) bLab(g,'Mir · moods · four plates',w-L.pad-lg.w-Math.max(14,lg.clear*3),by,SOFT,9,{align:'right'});
    const ro={font:'mono',size:9,weight:500,track:L.wide?.14:.06,upper:true};
    if(L.wide) bLab(g,ROOT10,L.pad,ce+28,SOFT,9);
    else bWrapT(g,ROOT10,w-2*L.pad-lg.w-Math.max(14,lg.clear*3),w-2*L.pad,ro).forEach((l,i)=>bLab(g,l,L.pad,ce+26+i*14,SOFT,9,{track:.06})); }
  return cv; }); }
/* t==null: settled. Otherwise each dot eases from where its mood comes from; once landed it is baked into Bk (flags). */
function dyn10(B,Bk,flags,st,G,t){ const L=G.L, tp=TP10(st), bar=BAR10(st);
  G.plates.forEach((pl,pi)=>{ const m=pl.m, ef=E[m.ease], dur=m.dur/tp, at=pi*bar, F=flags&&flags[pi], nd=pl.dots.length;
    pl.dots.forEach((d,q)=>{ if(F&&F[q]) return; let e=1; if(t!=null){ const u=(t-at-d.d*dur*.55)/(dur*.45); if(u<=0) return; e=ef(cl(u)); }
      if(e>=1){ if(F){ Bk.dot(d.X,d.Y,d.r,d.c); F[q]=1; } else B.dot(d.X,d.Y,d.r,d.c); return; }
      B.dot(lerp(d.sx,d.X,e),lerp(d.sy,d.Y,e),d.r*(.6+.4*e),d.c); });
    pl.conf.forEach((q,qi)=>{ if(F&&F[nd+qi]) return; let e=1; if(t!=null) e=E.outCubic(cl((t-at-dur*.5-q.d*300/tp)/(CONF10/tp))); if(e<=0) return; const x=lerp(q.sx,q.px,e), y=lerp(q.sy,q.py,e), a=q.rot*(.3+.7*e), c=Math.cos(a), s=Math.sin(a), sc=.5+.5*e, r=L.wide?.6:.55, tgt=(F&&e>=1)?Bk:B;
      for(let k=0;k<q.pts.length;k+=2){ const lx=q.pts[k]*sc, ly=q.pts[k+1]*sc; tgt.dot(x+lx*c-ly*s,y+lx*s+ly*c,r,q.col); } if(F&&e>=1) F[nd+qi]=1; }); }); }
/* a plate's settled dots swell on its phrase's notes (only dots that have landed, so nothing appears early) */
function flash10(B,G,st,t,flags){ const ea=m1_env(st,'all',t,520); G.plates.forEach((pl,pi)=>{ const e=Math.max(m1_env(st,'pl'+pi,t,320),.6*ea); if(e<.04) return; const F=flags&&flags[pi];
  for(let q=0;q<pl.dots.length;q+=2){ if(F&&!F[q]) continue; const d=pl.dots[q]; B.dot(d.X,d.Y,d.r*(1+.75*e),d.c); } }); }
function blitR(g,cv,x,y,w,h){ const d=g.dpr, X=Math.max(0,Math.floor(x*d)), Y=Math.max(0,Math.floor(y*d)), W=Math.min(cv.width-X,Math.ceil(w*d)), H=Math.min(cv.height-Y,Math.ceil(h*d)); g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(cv,X,Y,W,H,X,Y,W,H); g.restore(); }

/* L-10 music: a suite of four one-bar phrases in 3/4 over a tanpura-like ground (a D–A drone and a plucked Pa, Sa, Sa on the beats).
   Each plate, as it starts to resolve on its bar, sings its phrase in its own mode, alap-like: slow notes that slide in from a
   neighbor, with vibrato. Listening is Dorian and ends on its minor third; settling is Mixolydian, its suspension leaning onto the third;
   holding is Ionian, rising to the tonic; renewal is Lydian, its raised fourth opening onto the high third, with the confetti ringing
   as bells where it flies. The downbeat after the suite lands the chord. Tempo is the suite's BPM. */
const MD10=['dorian','mixolydian','ionian','lydian'];
/* [beat, degree, octave, beats, slide-from degree] */
const PH10=[[[0,4,4,1,3],[1,5,4,.9],[2,2,4,1,3]],[[0,6,4,1,7],[1,4,4,.9],[2,3,4,.5],[2.5,2,4,.5,3]],[[0,2,4,1,1],[1,4,4,.9],[2,7,4,1,6]],[[0,3,4,1,4],[1,4,4,.9],[2,9,4,1.6,7]]];
function music10(st,W,H){ const mu=M.music, bpm=BPM10(st), S=mu.score({bpm,meter:[3,4],mode:'ionian'}), BT=S.beat, BAR=S.bar, tp=TP10(st), END=Math.max(total10(st),4*BAR+BT);
  S.harm([[0,'Dm'],[BAR,'D7'],[2*BAR,'D'],[3*BAR,'E'],[3*BAR+BT,'D']]);
  S.note(0,'drone','D2',END+1200,{ratio:1.5,level:.4,fade:.8,cutoff:1100});
  for(let b=0;b<12;b++){ const pi=Math.floor(b/3); S.note(b*BT,'pluck',['A2','D3','D3'][b%3],Math.min(BT*.9,620),{cutoff:720,vel:b%3?.36:.44,pan:-.15},['pl'+pi,.22]); }
  PH10.forEach((ph,pi)=>ph.forEach(([b,dg,o,len,fr])=>{ const t=pi*BAR+b*BT, md=MD10[pi], m=mu.deg(md,dg,o), sym=S.chordAt(t);
    S.note(t,'glide',m,len*BT,Object.assign({vibrato:10,rate:5,attack:.06,release:.7,vel:.62,tone:2800,wow:2,pan:.12},fr!=null?{from:mu.hz(mu.deg(md,fr,o),sym),glide:Math.min(160,BT*.3)}:{}),['pl'+pi,1]); }));
  /* renewal's confetti rings where it flies, on 16ths */
  { const G=bSlot(st,'geo',bDK(W,H),()=>geo10(W,H)), pl=G.plates[3], dur=pl.m.dur/tp, at=3*BAR, used=new Set(); pl.conf.slice().sort((a,b)=>a.d-b.d).forEach((q,k)=>{ const t=S.q(at+dur*.5+q.d*300/tp+CONF10/tp*.3,4); if(used.has(Math.round(t))||used.size>=6) return; used.add(Math.round(t));
    S.note(t,'bell',mu.ct('D','D6',used.size%4),900,{ratio:3,bright:1.1,vel:.28,pan:(q.px-pl.fx)/pl.FR*.4},['pl3',.6]); }); }
  S.chord(4*BAR,'pluck',['D3','A3','F#4'],BT*1.2,{cutoff:900,vel:.5},['all',1]); S.note(4*BAR,'bell','D6',2200,{ratio:3.5,vel:.36},['all',1]);
  S.end(END+1400); return S.out(); }
M.piece({ id:'L-10',
  caption:'Mir in four moods, listening, settling, holding and renewing, each a plate with a time, a ground, a verse and a figure as settled as the mood. Change Tempo and press Play to watch each plate resolve in turn.',
  alt:'Four tall plates (two by two on a phone) on olive, sky blue, white and cobalt grounds. Each has a roman numeral, a mood and a time, a 24-dot hour ring with one hour lit, a stippled ring figure from loose to in tune, and a two-line verse.',
  recipe:{
    idea:'A mood is a coherence, a tempo and a color, so Mir is personified without a face, and the figure survives every ground.',
    marks:['ring','center','blade','stray','confetti','dot'],
    ground:'olive, sky, paper, cobalt',
    accent:'each plate’s center and lit hour, in that ground’s accent',
    composition:'Four tall plates in a row (2 × 2 on phones); each has a roman numeral, mood, time, a 24-dot hour ring, the figure at its coherence and a two-line verse; a credit and root line below.',
    motion:'Plates resolve in sequence, one per bar of 3/4 at the suite’s tempo (90 BPM at 1×), each from its own start: a wide scatter (2.2 s, inOutCubic), nearby (1.5 s, outCubic), a snap inward (1.0 s, outQuint), out from the center with confetti (1.3 s), durations × 90 ÷ BPM. Each figure swells on its phrase’s notes. Reduced motion shows the settled series.',
    sound:'A suite of four one-bar phrases over a plucked drone, each plate singing as it resolves in its own mode: Dorian listening, Mixolydian settling, Ionian holding, Lydian renewal, slow notes sliding in like an alap, at the Tempo you set.',
    controls:['Tempo 0.50–2.00×: the suite’s BPM, 45–180 in 15 BPM steps'],
    computed:['figures: M.mirField at coherence 0.08, 0.70, 1.00 and 1.00, seeded; dot size varies ±26% with slow noise','hour ring: 24 dots, midnight at top, the plate’s hour lit','series time = latest plate start (one bar each) + its span × 90 ÷ BPM'],
    placeholder:['moods, times and hours','verses (written for this study)'],
    root:'Ragamala painting, from the 16th century',
    rules:['borrow the structure only: no painting style, borders or iconography','no face or figure for Mir','western mode names only; no raga is claimed'],
    engine:['M.mirField','M.along','M.curve.ring','M.noise','M.logo','M.logoGeo','M.Buf','M.ease.inOutCubic','M.ease.outCubic','M.ease.outQuint','M.text','M.wrap','M.rule','M.fill','M.music']
  },
  aspect:w=>w/lay10(w).H,
  state:{tempo:1},
  controls:[{id:'tempo',type:'range',label:'Tempo',min:.5,max:2,step:.05,fmt:v=>(+v).toFixed(2)+'×'}],
  music:music10,
  /* Tempo: crossing a 15 BPM step plays the ground's Pa and Sa one beat apart at the new tempo */
  musicParam(A,st,id,ov,nv){ if(id!=='tempo') return false; const b0=BPM10({tempo:ov}), b1=BPM10({tempo:nv}); if(b0===b1) return true; const now=A.now()+.008, bt=60/b1, hz=n=>M.music.hz(n,'D');
    A.play('pluck',{chord:[hz('A2')],dur:Math.min(bt*.9,.6),cutoff:760,vel:.5,when:now}); A.play('pluck',{chord:[hz('D3')],dur:Math.min(bt*.9,.6),cutoff:760,vel:.42,when:now+bt}); return true; },
  render(g,w,h,M,st){ bBlit(g,base10(st,w,h)); const G=bSlot(st,'geo',bDK(w,h),()=>geo10(w,h)), B=new M.Buf(g); dyn10(B,null,null,st,G,null); B.flush(); },
  animate(g,w,h,M,st,t){ const base=base10(st,w,h), G=bSlot(st,'geo',bDK(w,h),()=>geo10(w,h)), L=G.L, T=total10(st), A=bSlot(st,'acc',bDK(w,h)+st.tempo,()=>({...bOff(w,h),last:-1})), TE=Math.max(T,4*BAR10(st)+700);
    let full=false; if(A.last<0||t<A.last){ A.g.setTransform(1,0,0,1,0,0); A.g.clearRect(0,0,A.cv.width,A.cv.height); A.g.setTransform(A.g.dpr,0,0,A.g.dpr,0,0); A.flags=G.plates.map(pl=>new Uint8Array(pl.dots.length+pl.conf.length)); full=true; }
    A.last=t; const B=new M.Buf(g), Bk=new M.Buf(A.g); dyn10(B,Bk,A.flags,st,G,Math.min(t,T)); Bk.flush(); flash10(B,G,st,t,A.flags);
    if(full){ bBlit(g,base); bBlit(g,A.cv); } else G.plates.forEach(pl=>{ const ry=pl.y+L.head-6; blitR(g,base,pl.x,ry,L.pw,L.fh+12); blitR(g,A.cv,pl.x,ry,L.pw,L.fh+12); });
    B.flush(); if(t>=TE){ A.last=-1; return false; } return true; } });
})();
