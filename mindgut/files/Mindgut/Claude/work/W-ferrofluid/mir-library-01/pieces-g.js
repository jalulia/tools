/* agent G pieces · L-31 … L-35 · delivery 4: pairings.
   Each plate pairs an analog device with the Mir behavior that does the same job and computes one thing for real.
   Figures are placed dots. Hairline M.rule only for plate frames, panels and dimension marks. Type: Geist 300 voice,
   Geist Mono labels on a 4 px baseline. Animated pieces cache their static layer per (w, h, dpr, settings).
   Helpers are prefixed g7_ so they never collide with other agents' files. */
(function(){
'use strict';
const M=window.MIR, TAU=Math.PI*2, E=M.ease, cl=M.clamp01, lerp=M.lerp;
const g7_q=v=>Math.round(v/4)*4;
const g7_RM=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(_){ return false; } };
const g7_hex=c=>{ c=String(c).replace('#',''); if(c.length===3) c=c.replace(/./g,'$&$&'); return [0,2,4].map(i=>parseInt(c.slice(i,i+2),16)); };
const g7_MX=new Map();
function g7_mix(a,b,t){ const k=a+b+t; let v=g7_MX.get(k); if(v) return v; const A=g7_hex(a), B=g7_hex(b); v='#'+A.map((x,i)=>Math.round(x+(B[i]-x)*t).toString(16).padStart(2,'0')).join(''); g7_MX.set(k,v); return v; }
function g7_pal(k){ const P=M.PAL[k]; return {k,ground:P.ground,ink:P.ink,ring:P.ring,acc:P.center,blade:P.blade,blue:P.blue,atm:P.soft,
  soft:g7_mix(P.ground,P.ink,.62), dim:g7_mix(P.ground,P.ink,.42), tint:g7_mix(P.ground,P.ink,.26), hair:g7_mix(P.ground,P.ink,.16), lift:g7_mix(P.ground,P.ink,.06)}; }
/* caches: each piece exists once, so a slot per piece name, keyed by size and settings, survives Reset */
const g7_SL={}; function g7_slot(name,key,make){ const s=g7_SL[name]; if(s&&s.key===key) return s.v; const v=make(); g7_SL[name]={key,v}; return v; }
const g7_dpr=()=>Math.min(3,window.devicePixelRatio||1);
const g7_DK=(w,h)=>w+'x'+h+'@'+g7_dpr();
function g7_off(w,h){ const cv=document.createElement('canvas'); return {cv,g:M.canvas(cv,w,h)}; }
function g7_blit(g,cv){ g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(cv,0,0); g.restore(); }
const g7_memo=f=>{ const m=new Map(); return w=>{ const k=w+'@'+g7_dpr(); let v=m.get(k); if(!v){ if(m.size>8) m.clear(); v=f(w); m.set(k,v); } return v; }; };

/* type */
let g7_MC=null; const g7_ctx=()=>{ if(!g7_MC){ g7_MC=document.createElement('canvas').getContext('2d'); g7_MC.dpr=1; } return g7_MC; };
const g7_tw=(s,o={})=>{ const g=g7_ctx(), size=o.size||11; g.font=`${o.weight||400} ${size}px ${M.FONT[o.font||'display']}`; const str=o.upper?String(s).toUpperCase():String(s), tr=(o.track||0)*size;
  if('letterSpacing' in g){ g.letterSpacing=tr+'px'; const w=g.measureText(str).width-tr; g.letterSpacing='0px'; return w; } return g.measureText(str).width+tr*(str.length-1); };
const g7_monoO=(size,upper=true)=>({font:'mono',size,weight:500,track:upper?.12:.02,upper});
const g7_lab=(g,s,x,y,c,size=9.5,o={})=>M.text(g,s,x,y,Object.assign(g7_monoO(size),{color:c},o));
const g7_trk=s=>s>=40?-.04:s>=28?-.03:s>=18?-.016:-.004;
const g7_dispO=size=>({font:'display',size,weight:300,track:g7_trk(size)});
const g7_disp=(g,s,x,y,size,c,o={})=>M.text(g,s,x,y,Object.assign(g7_dispO(size),{color:c},o));
function g7_lines(s,maxW,o){ const out=[]; let line=''; for(const wd of String(s).split(/\s+/)){ const t=line?line+' '+wd:wd; if(line&&g7_tw(t,o)>maxW){ out.push(line); line=wd; } else line=t; } if(line) out.push(line); return out; }
const g7_ROOT=g7_monoO(9,false);
/* the title block every plate shares: id line, display title, one sentence; returns the y where content starts */
function g7_tl(w,title,dek,phW){ const ph=w<(phW||600), pad=ph?16:28, inner=w-2*pad, o={ph,pad,inner};
  o.labY=pad+8; o.ts=ph?30:36; o.tl=g7_lines(title,inner,g7_dispO(o.ts)); o.tlh=g7_q(o.ts*1.06); o.tY=g7_q(o.labY+(ph?44:52));
  o.ss=ph?13.5:15; o.sub=g7_lines(dek,Math.min(inner,640),g7_dispO(o.ss)); o.subY=g7_q(o.tY+(o.tl.length-1)*o.tlh+(ph?28:32)); o.top=g7_q(o.subY+(o.sub.length-1)*20+(ph?32:40)); return o; }
function g7_title(g,T,left,right,title,P){ g7_lab(g,left,T.pad,T.labY,P.ink,T.ph?9.5:10); if(right&&!T.ph) g7_lab(g,right,T.pad+T.inner,T.labY,P.soft,9.5,{align:'right'});
  T.tl.forEach((l,i)=>g7_disp(g,l,T.pad-1,T.tY+i*T.tlh,T.ts,P.ink)); T.sub.forEach((l,i)=>M.text(g,l,T.pad,T.subY+i*20,Object.assign(g7_dispO(T.ss),{color:P.soft}))); }
/* the Root line at the foot (≤ 2 lines at 390) */
function g7_rootL(T,s,y){ T.root=g7_lines(s,T.inner,g7_ROOT); T.rootY=g7_q(y); return g7_q(y+(T.root.length-1)*14+T.pad); }
function g7_root(g,T,P){ T.root.forEach((l,i)=>M.text(g,l,T.pad,T.rootY+i*14,Object.assign({},g7_ROOT,{color:P.soft}))); }

/* dots */
/* jittered lattice: stratified, salt-free, cheap for large tone areas */
function g7_jit(B,box,sp,dens,rOf,col,seed){ const [x0,y0,x1,y1]=box, R=M.rng(seed||1);
  for(let y=y0;y<y1;y+=sp) for(let x=x0;x<x1;x+=sp){ const px=x+(.12+.76*R())*sp, py=y+(.12+.76*R())*sp, u=R(), d=dens(px,py); if(d<=0||u>=d) continue; B.dot(px,py,rOf(d,R),typeof col==='function'?col(px,py,d):col); } }
/* a stippled line with gaussian spread */
function g7_seg(B,ax,ay,bx,by,col,o={}){ const L=Math.hypot(bx-ax,by-ay), n=Math.max(2,Math.round(L*(o.dpl||1.1))), R=M.rng(o.seed||3), sp=o.spread??.3, nx=-(by-ay)/(L||1), ny=(bx-ax)/(L||1);
  for(let i=0;i<n;i++){ const t=(i+R())/n, k=R.gauss()*sp; B.dot(ax+(bx-ax)*t+nx*k, ay+(by-ay)*t+ny*k, (o.r||.7)*(.88+R()*.26), col); } }
/* a dot line: evenly spaced dots (rays, guides) */
function g7_dl(B,x0,y0,x1,y1,step,r,c,from=0,to=1){ const L=Math.hypot(x1-x0,y1-y0), n=Math.max(1,Math.round(L/step)); for(let i=Math.ceil(from*n);i<=Math.floor(to*n);i++){ const t=i/n; B.dot(x0+(x1-x0)*t,y0+(y1-y0)*t,r,c); } }
/* a small stippled caret pointing along angle a */
function g7_caret(B,x,y,s,a,col,seed){ const R=M.rng(seed||9), c=Math.cos(a), si=Math.sin(a);
  for(let i=0;i<Math.round(s*s*1.1);i++){ const u=R(), v=(R()-.5)*(1-u); const lx=(u-.5)*s, ly=v*s*1.1; B.dot(x+lx*c-ly*si, y+lx*si+ly*c, .6, col); } }
function g7_box(g,x0,y0,x1,y1,c){ M.rule(g,x0,y0,x1,y0,c); M.rule(g,x1,y0,x1,y1,c); M.rule(g,x1,y1,x0,y1,c); M.rule(g,x0,y1,x0,y0,c); }
/* a dot capture: engine marks become arrays */
function g7_cap(){ return {X:[],Y:[],R:[],C:[], dot(x,y,r,c){ this.X.push(x); this.Y.push(y); this.R.push(r); this.C.push(c); }}; }
function g7_inPoly(P,x,y){ let c=false; for(let i=0,j=P.length-2;i<P.length;j=i,i+=2){ const xi=P[i], yi=P[i+1], xj=P[j], yj=P[j+1]; if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi)) c=!c; } return c; }
const g7_fmtInt=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,',');

/* ── music (agent M4). Each piece composes a score from its own data with M.music; the frame plays it and drives t from the heard clock.
   Visual pairing reads the same score with M.music.env, so it works with sound off. Pointer sounds are tuned to the piece's chord. ── */
function m4_live(){ const a=M.audio; return a&&a.enabled&&a.unlocked?a:null; }
/* an immediate interaction sound on the piece's bus (the frame's mix mutes it with the piece) */
function m4_play(id,ins,o){ const a=m4_live(); if(!a) return null; try{ return a.play(id,ins,o); }catch(e){ console.error(id+' sound',e); return null; } }
/* per-frame scratch that never reaches Copy settings */
function m4_S(st){ let s=st._m4; if(!s){ s={}; try{ Object.defineProperty(st,'_m4',{value:s,enumerable:false,writable:true,configurable:true}); }catch(_){} } return s; }
function m4_ok(st,key,ms){ const s=m4_S(st), now=performance.now(); if(now-(s[key]||-1e9)<ms) return false; s[key]=now; return true; }
/* the envelope of a score hit at t (0 for a still) */
const m4_e=(st,k,t,tau)=>t==null?0:M.music.env(st,k,t,tau);
const m4_qe=e=>Math.round(e*8)/8;
/* tuned Hz for a note over a chord, from a musicParam's scoped A */
const m4_hz=(m,sym)=>M.music.hz(m,sym||'D');
/* the piece's mix level: every sounding event of a finished score scaled by g (drones and noise beds by their level) */
function m4_gain(sc,g){ sc.events.forEach(e=>{ if(e.play) e.opts.gain=(e.opts.gain||1)*g; }); return sc; }

/* ════════════════════════════════════════════════════════════════════════
   L-31 · Two hands on one pointer: a talking board and a planchette moved by two seeded hands.
   COMPUTED (board units, 1000 × 660): each step the pointer moves by v = a + b (+ the viewer's nudge, which joins "you").
   Each hand pushes toward the letter it expects, a = g·dir·min(1, dist/40) + tremor, with its own seeded gain per letter
   and its own smooth seeded tremor. A letter lands when |v| < 2 for 6 steps (or after 160 steps): the nearest cell to the
   window. Share per letter: Σ max(0, a·v̂) over that letter's steps, against the same for b. Equal within 10% → red.
   The two hands share one expectation (the reply); that is the ideomotor account: expectation moves the hand.
   ════════════════════════════════════════════════════════════════════════ */
const P31=g7_pal('night');
const T31='Two hands on one pointer', D31='Each step moves the pointer by the sum of two hands. A letter lands where it rests.';
const ROOT31='Root · Carpenter, 1852: named ideomotor action, movement driven by expectation. Simplified: seeded hands.';
const REPLY31='STAY WITH IT';
const YOU31=P31.ring, MIR31=P31.blade;
/* the board in its own units: two letter arcs, numerals, YES / NO, GOOD BYE */
const BD31=(function(){ const cells=[], W=1000, H=570, cx=500, cy=930;
  const arc=(str,r,y0)=>{ const n=str.length, half=Math.asin(Math.min(.99,(y0)/r)); for(let i=0;i<n;i++){ const a=-half+2*half*i/(n-1); cells.push({ch:str[i],x:cx+r*Math.sin(a),y:cy-r*Math.cos(a),rot:a}); } };
  arc('ABCDEFGHIJKLM',760,400); arc('NOPQRSTUVWXYZ',630,340);
  '1234567890'.split('').forEach((c,i)=>cells.push({ch:c,x:230+i*60,y:462,rot:0}));
  return {W,H,cells,yes:[110,96],no:[890,96],bye:[500,532]}; })();
function g7_sim31(st){ return g7_slot('sim31',[st.bal,st.tremor,st.nx,st.ny].join('|'),()=>{
  const tg=REPLY31.replace(/ /g,''), cell=ch=>BD31.cells.find(c=>c.ch===ch), R=M.rng(3101);
  const gA=[], gB=[]; for(let i=0;i<tg.length;i++){ gA.push(7*(.3+1.4*R())); gB.push(7*(.3+1.4*R())*st.bal); }
  let px=500, py=400, step=0; const X=[px], Y=[py], AX=[], AY=[], BX=[], BY=[], DOM=[], letters=[];
  for(let i=0;i<tg.length;i++){ const T=cell(tg[i]); let calm=0, n=0, cA=0, cB=0; const s0=step;
    while(true){ const dx=T.x-px, dy=T.y-py, d=Math.hypot(dx,dy)||1, pr=Math.min(1,d/40), ux=dx/d, uy=dy/d, tq=step*.11;
      const ax=gA[i]*pr*ux+st.tremor*.85*(M.noise(tq,3.1,311)-.5)*2+st.nx, ay=gA[i]*pr*uy+st.tremor*.85*(M.noise(tq,7.7,312)-.5)*2+st.ny;
      const bx=gB[i]*pr*ux+st.tremor*.85*(M.noise(tq,1.3,313)-.5)*2, by=gB[i]*pr*uy+st.tremor*.85*(M.noise(tq,5.9,314)-.5)*2;
      const vx=ax+bx, vy=ay+by, sp=Math.hypot(vx,vy)||1e-6, pa=(ax*vx+ay*vy)/sp, pb=(bx*vx+by*vy)/sp;
      cA+=Math.max(0,pa); cB+=Math.max(0,pb); px=Math.min(1000,Math.max(0,px+vx)); py=Math.min(570,Math.max(0,py+vy));
      AX.push(ax); AY.push(ay); BX.push(bx); BY.push(by); DOM.push(pa>=pb?0:1); X.push(px); Y.push(py); step++; n++;
      calm=sp<2?calm+1:0; if((calm>=6&&n>=8)||n>=160) break; }
    let best=null, bd=1e9; for(const c of BD31.cells){ const dd=Math.hypot(c.x-px,c.y-py); if(dd<bd){ bd=dd; best=c; } }
    const sA=cA/((cA+cB)||1); letters.push({ch:bd<55?best.ch:'·',want:tg[i],cell:bd<55?best:null,step,s0,sA,eq:Math.abs(2*sA-1)<=.1}); }
  let tA=0, tB=0; for(let i=0;i<AX.length;i++){ const vx=AX[i]+BX[i], vy=AY[i]+BY[i], sp=Math.hypot(vx,vy)||1e-6; tA+=Math.max(0,(AX[i]*vx+AY[i]*vy)/sp); tB+=Math.max(0,(BX[i]*vx+BY[i]*vy)/sp); }
  /* word breaks after the targets that end a word */
  const brk=new Set(); let k=0; for(const wd of REPLY31.split(' ')){ k+=wd.length; brk.add(k-1); }
  let vmax=1, wide=0, wv=-1; for(let i=0;i<AX.length;i++){ vmax=Math.max(vmax,Math.hypot(AX[i]+BX[i],AY[i]+BY[i]),Math.hypot(AX[i],AY[i]),Math.hypot(BX[i],BY[i])); const ma=Math.hypot(AX[i],AY[i]), mb=Math.hypot(BX[i],BY[i]), cr=Math.min(ma,mb)>=1.5?Math.abs(AX[i]*BY[i]-AY[i]*BX[i])/(ma*mb):-1; if(cr>wv){ wv=cr; wide=i; } }
  return {X,Y,AX,AY,BX,BY,DOM,letters,steps:step,share:tA/((tA+tB)||1),brk,vmax,wide}; }); }
const lay31=g7_memo(function(w){ const T=g7_tl(w,T31,D31,700), o=T, {ph,pad,inner}=T;
  o.bw=ph?inner:Math.round(inner*.64); o.s=o.bw/1000; o.bh=Math.round(570*o.s); o.bx=pad; o.by=T.top;
  o.rx=ph?pad:pad+o.bw+32; o.rw=ph?inner:inner-o.bw-32;
  let y=o.by+o.bh+(ph?36:40); o.trY=y; o.cw=Math.min(ph?30:64,Math.floor(inner/12)); o.gy=ph?20:26; y+=ph?74:92;
  if(ph){ o.vx=pad; o.vy=y; o.vw=inner; o.vh=140; o.ry=y+o.vh+34; o.rdx=pad; o.rdw=inner; y=o.ry+5*30; }
  else { o.vx=o.rx; o.vy=o.by; o.vw=o.rw; o.vh=Math.min(220,Math.round(o.bh*.52)); o.rdx=o.rx; o.rdw=o.rw; o.ry=o.vy+o.vh+40; y=Math.max(y,o.ry+5*34)+8; }
  o.H=g7_rootL(T,ROOT31,y+(ph?8:12)); return o; });
/* the planchette: a teardrop pointing up, a round window at the pointer, felt body in sparse dots */
const PL31=(function(){ const pts=[]; for(let i=0;i<72;i++){ const t=i/72*TAU; pts.push(Math.sin(t)*Math.pow(Math.abs(Math.sin(t/2)),.9)/.77*58, -Math.cos(t)*72-30); } return pts; })();
function g7_planch31(B,L,px,py,P){ const s=L.s, ox=L.bx+px*s, oy=L.by+py*s, poly=[]; for(let i=0;i<PL31.length;i+=2) poly.push(ox+PL31[i]*s,oy+PL31[i+1]*s);
  const wr=24*s; let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(let i=0;i<poly.length;i+=2){ x0=Math.min(x0,poly[i]); x1=Math.max(x1,poly[i]); y0=Math.min(y0,poly[i+1]); y1=Math.max(y1,poly[i+1]); }
  g7_jit(B,[x0,y0,x1,y1],L.ph?1.9:2.3,(x,y)=>Math.hypot(x-ox,y-oy)>wr+2.2&&g7_inPoly(poly,x,y)?.5:0,(d,R)=>.55+.15*R(),P.dim,3120);
  const cv=M.curve.poly(Array.from({length:poly.length/2},(_,i)=>[poly[2*i],poly[2*i+1]]),true);
  M.along(B,{rng:M.rng(3121),curve:cv,n:Math.round(560*s*1.6),spread:.45,r:.75,color:P.ink,even:true});
  M.ring(B,{cx:ox,cy:oy,R:wr,w:1.4,swell:.15,dpl:1.5,rCore:.8,rEdge:.6,seed:3122,color:P.ink}); }
function g7_base31(w,h){ return g7_slot('base31',g7_DK(w,h),()=>{ const L=lay31(w), P=P31, {cv,g}=g7_off(w,h), s=L.s, bx=L.bx, by=L.by, B=new M.Buf(g);
  M.fill(g,P.ground); g7_title(g,L,'L-31 · Pairing · talking board','board units per step',T31,P);
  /* the board: a sparse tooth inside a stippled edge band */
  const r0=26*s, inR=(x,y)=>{ const dx=Math.max(bx+r0-x,0,x-(bx+L.bw-r0)), dy=Math.max(by+r0-y,0,y-(by+L.bh-r0)); return Math.hypot(dx,dy); };
  g7_jit(B,[bx,by,bx+L.bw,by+L.bh],L.ph?2.2:2.6,(x,y)=>{ const d=inR(x,y); return d>r0?0:d>r0-1.6?.95:.13; },(d,R)=>d>.5?.62+.12*R():.5+.12*R(),(x,y,d)=>d>.5?P.dim:P.hair,3100);
  /* sun and moon marks at YES / NO, as stippled rings */
  [[BD31.yes,'YES'],[BD31.no,'NO']].forEach(([[x,y],t],i)=>{ M.ring(B,{cx:bx+x*s,cy:by+(y-44)*s,R:13*s,w:1.2,swell:.2,dpl:1.3,rCore:.7,rEdge:.55,seed:3103+i,color:P.dim}); });
  B.flush();
  const fs=Math.max(10,34*s);
  BD31.cells.forEach(c=>{ g.save(); g.translate(bx+c.x*s,by+c.y*s); g.rotate(c.rot); M.text(g,c.ch,0,fs*.36,{font:'display',size:fs,weight:300,color:P.dim,align:'center'}); g.restore(); });
  [[BD31.yes,'YES'],[BD31.no,'NO'],[BD31.bye,'GOOD BYE']].forEach(([[x,y],t])=>g7_lab(g,t,bx+x*s,by+y*s+4,P.dim,Math.max(9,15*s),{align:'center',track:.2}));
  /* the vector panel and the transcript frame */
  { const {vx,vy,vw,vh}=L; g7_box(g,vx,vy,vx+vw,vy+vh,P.hair); g7_lab(g,'the step',vx+10,vy+18,P.soft,9); }
  g7_lab(g,'the reply · share of the push under each letter',L.pad,L.trY-14,P.soft,9);
  return cv; }); }
function g7_arrow31(B,x0,y0,dx,dy,col,seed){ const L=Math.hypot(dx,dy); if(L<2) { B.dot(x0,y0,1,col); return; } g7_dl(B,x0,y0,x0+dx*(1-4/L),y0+dy*(1-4/L),2.2,.8,col); g7_caret(B,x0+dx-2*dx/L,y0+dy-2*dy/L,7,Math.atan2(dy,dx),col,seed); }
function g7_draw31(g,w,h,st,t){ const L=lay31(w), P=P31, S=g7_sim31(st), s=L.s, bx=L.bx, by=L.by, live=t!=null;
  const TL=m4_tl31(st), n=live?Math.min(S.steps,Math.floor(m4_k31(S,TL,t)+1e-6)):S.steps, B=new M.Buf(g), fl=i=>m4_qe(m4_e(st,'l'+i,t,170));
  /* the trace: three dots per step, colored by the hand that pushed more along that step */
  for(let i=0;i<n;i++){ const c=S.DOM[i]?MIR31:YOU31; for(let q=0;q<3;q++){ const u=(q+.5)/3; B.dot(bx+lerp(S.X[i],S.X[i+1],u)*s,by+lerp(S.Y[i],S.Y[i+1],u)*s,L.ph?.55:.62,c); } }
  B.flush();
  const done=S.letters.filter(l=>l.step<=n), fs=Math.max(10,34*s);
  /* a letter answers its note: it swells as it sounds */
  done.forEach(l=>{ if(!l.cell) return; const e=fl(S.letters.indexOf(l)); g.save(); g.translate(bx+l.cell.x*s,by+l.cell.y*s); g.rotate(l.cell.rot); M.text(g,l.ch,0,fs*.36*(1+.3*e),{font:'display',size:fs*(1+.3*e),weight:400,color:l.eq?P.acc:P.ink,align:'center'}); g.restore(); });
  const B2=new M.Buf(g); g7_planch31(B2,L,S.X[n],S.Y[n],P);
  { let e=0; S.letters.forEach((l,i)=>{ e=Math.max(e,fl(i)); }); if(e>.05) M.ring(B2,{cx:L.bx+S.X[n]*s,cy:L.by+S.Y[n]*s,R:24*s*(1-.25*e),w:1.4+1.2*e,swell:.15,dpl:1.5,rCore:.8,rEdge:.6,seed:3123,color:P.ink}); }
  /* the transcript: each landed letter and its split trace */
  { let x=L.pad; const cw=L.cw, gl=L.ph?20:30;
    S.letters.forEach((l,i)=>{ const on=l.step<=n, cx=x+cw/2;
      if(on){ const e=fl(i); M.text(g,l.ch,cx,L.trY+gl*.8,{font:'display',size:gl*(1+.25*e),weight:300,track:-.01,color:l.eq?P.acc:P.ink,align:'center'});
        const bw=cw-(L.ph?6:12), x0=cx-bw/2, k=Math.round(bw/2.2), ka=Math.round(k*l.sA), yb=L.trY+gl*.8+12;
        for(let q=0;q<k;q++){ const c=q<ka?YOU31:MIR31; B2.dot(x0+q*2.2+1.1,yb,.8,c); B2.dot(x0+q*2.2+1.1,yb+2.4,.8,c); }
        const pa=Math.round(l.sA*100); g7_lab(g,L.ph?String(pa):pa+'/'+(100-pa),cx,yb+18,l.eq?P.acc:P.soft,9,{align:'center',track:.04}); }
      else { B2.dot(cx,L.trY+gl*.5,.8,P.hair); }
      x+=cw+(S.brk.has(i)?L.cw*.5:0); }); }
  /* the step: two hands and their sum, drawn tip to tail (the parallelogram) */
  { const {vx,vy,vw,vh}=L, k=Math.min(n,S.steps-1), cx0=vx+vw*.5, cy0=vy+vh*.5, sc0=Math.min(vw*.6,vh*.62);
    let ax=S.AX[k], ay=S.AY[k], bxv=S.BX[k], byv=S.BY[k], lab='step '+(k+1);
    if(!live){ /* the still shows the step where the two hands disagreed most (largest |a × b|) */ const bi=S.wide, l=S.letters.find(q=>q.step>bi)||S.letters[S.letters.length-1]; ax=S.AX[bi]; ay=S.AY[bi]; bxv=S.BX[bi]; byv=S.BY[bi]; lab='step '+(bi+1)+(L.ph?'':' · toward '+l.want); }
    const sc=sc0/Math.max(1,Math.hypot(ax,ay),Math.hypot(bxv,byv),Math.hypot(ax+bxv,ay+byv)), ox=cx0-(ax+bxv)*sc*.5, oy=cy0-(ay+byv)*sc*.5;
    g7_dl(B2,ox+ax*sc,oy+ay*sc,ox+(ax+bxv)*sc,oy+(ay+byv)*sc,3.2,.6,P.dim); g7_dl(B2,ox+bxv*sc,oy+byv*sc,ox+(ax+bxv)*sc,oy+(ay+byv)*sc,3.2,.6,P.dim);
    g7_arrow31(B2,ox,oy,(ax+bxv)*sc,(ay+byv)*sc,P.soft,3131); g7_arrow31(B2,ox,oy,ax*sc,ay*sc,YOU31,3132); g7_arrow31(B2,ox,oy,bxv*sc,byv*sc,MIR31,3133); B2.dot(ox,oy,1.6,P.ink);
    B2.flush(); g7_lab(g,lab,vx+vw-10,vy+18,P.soft,9,{align:'right'});
    const ly=vy+vh-12; g7_lab(g,'you '+Math.hypot(ax,ay).toFixed(1),vx+10,ly,YOU31,9); g7_lab(g,'Mir '+Math.hypot(bxv,byv).toFixed(1),vx+vw*.5,ly,MIR31,9,{align:'center'}); g7_lab(g,'sum '+Math.hypot(ax+bxv,ay+byv).toFixed(1),vx+vw-10,ly,P.soft,9,{align:'right'}); }
  /* readings */
  { const eq=done.filter(l=>l.eq).length, nud=Math.hypot(st.nx,st.ny), rep=S.letters.map((l,i)=>(l.step<=n?l.ch:'_')+(S.brk.has(i)&&i<S.letters.length-1?' ':'')).join('');
    const rows=[['reply',rep],['steps',String(n)+(live&&n<S.steps?' of '+S.steps:'')],['you · Mir',Math.round(S.share*100)+' / '+(100-Math.round(S.share*100))+' of the push'],['equal within 10%',eq+(eq===1?' letter':' letters')],['your nudge',nud<.05?'none · drag the board':nud.toFixed(1)+' per step · '+Math.round((Math.atan2(st.ny,st.nx)*180/Math.PI+450)%360)+'°']];
    const rh=L.ph?30:34; rows.forEach((r,i)=>{ const y=L.ry+i*rh; if(r[0]==='you · Mir'){ const w1=g7_lab(g,'you',L.rdx,y,YOU31,9); g7_lab(g,'· Mir',L.rdx+w1+6,y,MIR31,9); } else g7_lab(g,r[0],L.rdx,y,r[0].startsWith('equal')?P.acc:P.soft,9); M.text(g,r[1],L.rdx,y+15,Object.assign(g7_monoO(L.ph?10:11,false),{color:P.ink})); }); }
  if(!st.used&&!live) g7_lab(g,'drag the board to nudge',bx+L.bw/2,by+(L.ph?18:22),P.soft,9,{align:'center'});
  return live&&t<TL.end; }
/* music · L-31: a duet in D Dorian (the night ground), 120 BPM 4/4, three bars and an arrival. The pointer's walk is re-timed so each
   letter lands on an eighth: a letter's travel gets eighths in proportion to its steps (1–5, 24 in all), so the last letter lands on the
   downbeat of bar 4. Tremor pushes unequal landings off the grid (±28 ms per unit); equal letters and the last letter stay on it.
   The letters are the tune: letter → scale degree (A = 1, B = 2, …), voice-led and set on the chord (Dm7, G, C, Dsus4 → Dm).
   The hand that pushed less sings the harmony: the chord tone below, sliding in from a detune that grows with the inequality and the
   tremor; equal letters lock to a unison (word ends) or a pure fifth, with a glass bell. Balance decides who leads. Friction is a
   noise bed whose level follows the pointer's speed, eighth by eighth. Arrival: the motif 5 ↑ 1 ↑ 3, F natural, over Dm and the bass. */
const BPM31=120, E31=60000/BPM31/2, BAR31=E31*8;
function m4_tl31(st){ return g7_slot('tl31',[st.bal,st.tremor,st.nx,st.ny].join('|'),()=>{ const S=g7_sim31(st), L=S.letters, n=L.length, TOT=24;
  const w=L.map(l=>Math.max(1,l.step-l.s0)), sum=w.reduce((a,b)=>a+b,0), q=w.map(x=>Math.max(1,Math.min(5,Math.round(x/sum*TOT))));
  let d=TOT-q.reduce((a,b)=>a+b,0); while(d!==0){ let j=-1; for(let i=0;i<n;i++){ if(d>0&&q[i]<5&&(j<0||w[i]/q[i]>w[j]/q[j])) j=i; if(d<0&&q[i]>1&&(j<0||w[i]/q[i]<w[j]/q[j])) j=i; } if(j<0) break; q[j]+=Math.sign(d); d-=Math.sign(d); }
  const R=M.rng(3141), land=[]; let c=0; for(let i=0;i<n;i++){ c+=q[i]; const g=Math.max(-1,Math.min(1,R.gauss()/2)), lock=L[i].eq||i===n-1; land.push(c*E31+(lock?0:g*st.tremor*28)); }
  return {land,q,end:land[n-1]+BAR31+400}; }); }
/* the step the pointer has reached at t: linear within each letter's travel, so the walk keeps its character and lands on the grid */
function m4_k31(S,T,t){ const L=S.letters; let a=0; for(let i=0;i<L.length;i++){ const b=T.land[i]; if(t<b){ const u=Math.max(0,(t-a)/(b-a)); return L[i].s0+u*(L[i].step-L[i].s0); } a=b; } return S.steps; }
const CH31=[[0,'Dm7'],[1,'G'],[2,'C'],[2.5,'Dsus4'],[3,'Dm']];
function m4_music31(st){ const S=g7_sim31(st), T=m4_tl31(st), mu=M.music, Sc=mu.score({bpm:BPM31,meter:[4,4],ground:'night'}), md=Sc.mode, L=S.letters, n=L.length, Bb=BAR31, arr=3*Bb;
  Sc.harm(CH31.map(([b,s])=>[b*Bb,s]));
  /* the bed: one pad per chord, voice-led; a plucked root on each change */
  let pv=null; CH31.forEach(([b,s],k)=>{ const t0=b*Bb, t1=k<CH31.length-1?CH31[k+1][0]*Bb:arr+Bb*.9; pv=mu.voice(s,'A3','A4',3,pv);
    Sc.chord(t0+20,'pad',pv,t1-t0+(k===CH31.length-1?400:120),{attack:k===CH31.length-1?.05:.28,release:k===CH31.length-1?1.4:.35,cutoff:k===CH31.length-1?1500:900,vel:k===CH31.length-1?.36:.26});
    if(k<CH31.length-1) Sc.note(t0,'pluck',mu.ct(s,'C2',0),360,{cutoff:360,vel:.5,hp:35}); });
  /* friction: a noise bed, its level following the pointer's speed each eighth */
  const fr=Sc.hitSound(0,'noise',{color:.3,level:.012,fade:.12,dur:(T.land[n-1]+150)/1000});
  for(let e=0;e*E31<T.land[n-1];e++){ const k=Math.min(S.steps-1,Math.floor(m4_k31(S,T,e*E31+E31/2))), v=Math.min(1,Math.hypot(S.AX[k]+S.BX[k],S.AY[k]+S.BY[k])/S.vmax);
    Sc.set(e*E31,fr,'level',.012+.07*v,110); Sc.set(e*E31,fr,'color',.22+.45*v,110); if(e%2) Sc.hitSound(e*E31,'hat',{vel:.12+.1*v,decay:.02}); }
  /* the letters: lead and harmony */
  const lead=st.bal>1.04?'mir':'you', tr=Math.min(1.5,st.tremor)/1.5; let prev=null;
  L.forEach((l,i)=>{ const t=T.land[i], sym=Sc.chordAt(t+1), nx=i<n-1?T.land[i+1]:t+Bb*.9, dur=Math.min(1150,nx-t-30), cc=(l.cell?l.ch:l.want).charCodeAt(0)-65;
    let m=mu.deg(md,((cc%7)+7)%7,4); if(prev!=null){ while(m-prev>7) m-=12; while(prev-m>7) m+=12; } m=mu.snap(sym,Math.max(62,Math.min(77,m))); prev=m;
    const pcs=mu.parse(sym).pcs, ineq=Math.abs(2*l.sA-1), word=S.brk.has(i);
    let h=l.eq?(word?m:(pcs.includes(((m-7)%12+12)%12)?m-7:m)):mu.ct(sym,m-1,-1); if(m-h>9) h=m;
    const mel=lead==='you'?{you:m,mir:h}:{you:h,mir:m}, quiet=l.cell?1:.6;
    const yo={attack:.03,release:.35,vel:(.28+.34*l.sA)*quiet,vibrato:2+5*st.tremor,wow:1,flutter:.5,tone:2800,pan:-.35,id:'y'+i};
    const mo={attack:.03,release:.4,vel:(.26+.32*(1-l.sA))*quiet,vibrato:3+6*st.tremor,cutoff:1500,pan:.35,id:'r'+i};
    /* the follower slides in from a detune (the two hands still finding each other) and lands pure */
    const det=l.eq?0:(3+12*ineq)*tr, fol=lead==='you'?'mir':'you', fid=fol==='you'?'y'+i:'r'+i, fm=mel[fol];
    Sc.note(t,'glide',fol==='you'&&det?{hz:mu.hz(fm,sym)*Math.pow(2,-det/1200)}:mel.you,dur,yo,lead==='you'?['l'+i,1]:null);
    Sc.note(t,'ober',fol==='mir'&&det?{hz:mu.hz(fm,sym)*Math.pow(2,det/1200)}:mel.mir,dur,mo,lead==='mir'?['l'+i,1]:null);
    if(det) Sc.glide(t+Math.min(dur*.45,260),fid,fm,Math.min(dur*.4,220));
    if(l.eq) Sc.note(t,'bell',m+12,1500,{vel:.24,ratio:3.5,pan:.1},['eq'+i,1]); });
  /* arrival: the motif, 5 ↑ 1 ↑ 3 (F natural: the Dorian third), the bass once */
  Sc.note(arr,'bass','D2',700,{from:'A1',glide:90,env:2.6,decay:.4,vel:.6},['arr',1]); Sc.hitSound(arr,'kick',{vel:.4});
  [mu.deg(md,-3,4),mu.deg(md,0,4),mu.deg(md,2,4)].forEach((m,k)=>Sc.note(arr+E31*(k+1),'mallet',m,k===2?1800:900,{vel:.4-.03*k,trem:5,pan:(k-1)*.2},['m'+k,1]));
  Sc.note(arr+E31*3,'bell',mu.deg(md,2,5),2200,{vel:.3,ratio:3.5,pan:.15});
  Sc.end(T.end+1200); return m4_gain(Sc.out(),1.3); }
/* controls as music: Balance plays the duet's interval with the new leader on top and the new loudness; Tremor plays a short figure
   with that vibrato depth and timing jitter */
function m4_param31(A,st,id,ov,nv){ const now=A.now(); if(!now) return true; const mu=M.music;
  if(id==='bal'){ if(!m4_ok(st,'pb',110)) return true; const g=Math.min(2,Math.max(.5,+nv)), you=.5/(1+g)*1.6, mir=.5*g/(1+g)*1.6, top=mu.hz('F4','Dm'), bot=mu.hz('A3','Dm');
    A.play('glide',{freq:g>1.04?bot:top,dur:.5,vel:you,attack:.02,release:.3,vibrato:3,tone:2800,pan:-.35,when:now+.005});
    A.play('ober',{freq:g>1.04?top:bot,dur:.5,vel:mir,release:.3,vibrato:4,cutoff:1500,pan:.35,when:now+.005}); return true; }
  if(id==='tremor'){ if(!m4_ok(st,'pt',180)) return true; const v=+nv, R=M.rng(Math.round(v*10)+7);
    ['A3','D4','F4'].forEach((n,k)=>A.play('glide',{freq:mu.hz(n,'Dm'),dur:k===2?.6:.16,vel:.42,attack:.02,release:.25,vibrato:2+8*v,tone:2800,pan:-.2+.2*k,when:now+.005+k*.12+(k?(R()-.5)*.05*v:0)})); return true; }
  return false; }
let g7_drag31=null;
function g7_ptr31(st,e){ const L=lay31(e.w), inB=e.x>=L.bx&&e.x<=L.bx+L.bw&&e.y>=L.by&&e.y<=L.by+L.bh;
  if(e.type==='down'){ if(!inB) return false; g7_drag31={x:e.x,y:e.y,nx:st.nx,ny:st.ny}; return false; }
  if(e.type==='move'&&e.down&&g7_drag31){ let nx=g7_drag31.nx+(e.x-g7_drag31.x)/L.s*.035, ny=g7_drag31.ny+(e.y-g7_drag31.y)/L.s*.035; const m=Math.hypot(nx,ny); if(m>12){ nx*=12/m; ny*=12/m; }
    st.nx=+nx.toFixed(2); st.ny=+ny.toFixed(2); st.used=1; return true; }
  if(e.type==='up'){ const was=!!g7_drag31; g7_drag31=null; return was; }
  return false; }
M.piece({ id:'L-31',
  caption:'A talking board whose pointer is moved by two hands, you and Mir. Change the balance or the tremor, or drag the board to add your own push, and hear which letters land together.',
  alt:'A dark talking board with two arcs of letters, a row of numerals, YES, NO and GOOD BYE. A stippled heart-shaped pointer with a round window rests on a letter. A dotted trace in white and teal shows its path. Below, the reply STAY WITH IT with a split bar under each letter; equal letters are red. A panel shows two step vectors and their sum.',
  aspect:w=>w/lay31(w).H,
  state:{bal:1,tremor:1,nx:0,ny:0,used:0},
  controls:[
    {id:'bal',type:'range',label:'Balance · Mir ÷ you',min:.5,max:2,step:.1,fmt:v=>(+v).toFixed(1)+'×'},
    {id:'tremor',type:'range',label:'Tremor',min:0,max:2.5,step:.1,fmt:v=>(+v).toFixed(1)+'×'}],
  music:m4_music31, musicParam:m4_param31, musicIns:'glide',
  render(g,w,h,M,st){ g7_blit(g,g7_base31(w,h)); g7_draw31(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ g7_blit(g,g7_base31(w,h)); if(g7_RM()){ g7_draw31(g,w,h,st,null); return false; } return g7_draw31(g,w,h,st,Math.max(0,t)); },
  /* dragging the board: a plucked Dm as you take hold, then the nudge climbs the Dorian scale, one note per unit of push */
  pointer(st,e){ const was=g7_drag31, r=g7_ptr31(st,e), mu=M.music, s=m4_S(st);
    if(e.type==='down'&&g7_drag31){ m4_play('L-31','pluck',{chord:['D3','A3','F4'].map(n=>mu.hz(n,'Dm')),dur:.4,cutoff:700,vel:.5}); s.ps=Math.round(Math.hypot(st.nx,st.ny)); }
    else if(r&&e.type==='move'&&was){ const k=Math.round(Math.hypot(st.nx,st.ny)); if(k!==s.ps&&m4_ok(st,'drag',80)){ s.ps=k; m4_play('L-31','mallet',{freq:mu.hz(mu.deg('dorian',k,4),'Dm'),dur:.7,vel:.36,trem:5,pan:Math.max(-.6,Math.min(.6,st.nx/12))}); } }
    return r; },
  recipe:{
    idea:'A reply is written by two hands on one pointer; each letter carries how much of the push was yours and how much was Mir’s.',
    marks:['stray','center'],
    ground:'night',
    accent:'red letters: where the two hands pushed equally, within 10%',
    composition:'Board left (two letter arcs, numerals, YES / NO, GOOD BYE), step-vector panel and readings right; the reply strip below with a split bar under each letter. Phone: one column.',
    motion:'At 120 BPM: the pointer walks the computed path and each letter lands on an eighth, its travel given eighths in proportion to its steps, so the last lands on the downbeat of bar 4 (tremor pushes unequal landings off the grid); letters swell as they sound. Reduced motion shows the finished path.',
    sound:'A duet in D Dorian: each letter is a note, its scale degree from the alphabet. The hand that pushed less sings the harmony below, sliding in from a detune; equal letters lock to a unison or fifth. The motif arrives on F.',
    controls:['Balance · Mir ÷ you 0.5–2','Tremor 0–2.5','drag the board: your nudge, up to 12 units per step'],
    computed:['path: v = a + b (+ nudge) per step, a = g·dir·min(1, d/40) + smooth tremor','landing: |v| < 2 for 6 steps, nearest cell within 55 units','share: Σ max(0, a·v̂) against Σ max(0, b·v̂) per letter','equal: |share you − share Mir| ≤ 0.10'],
    placeholder:['the reply STAY WITH IT','per-letter gains (seed 3101)','tremor noise seeds'],
    root:'Ideomotor action: Carpenter, 1852; Faraday’s table-turning tests, 1853. Talking-board records differ: Chinese fuji (扶乩) spirit writing, recorded from the Liu Song era and common by the Song, often held by two people; the French planchette, 1853; the US Ouija patent, 1891.',
    rules:['letters are type on the board (the medium); the pointer and trace are dots','the window is a clean hollow'],
    engine:['M.ring','M.along','M.curve.poly','M.noise','M.rng']
  } });

/* ════════════════════════════════════════════════════════════════════════
   L-32 · Dead reckoning: a plotting sheet: heading-and-time legs, DR marks, fixes, and an error circle that grows.
   COMPUTED (nm, x east, y north, 0.02 h steps): DR(t) = last fix + Σ speed·(sin C, cos C)·dt along the logged legs.
   The true track adds a seeded current (set and drift); a fix reports the true position. Error circle radius
   r(t) = r_fix + rate·(t − t_fix), the stated error rate (control). At each fix we test |true − DR| ≤ r: inside or not.
   Latitude and longitude labels: Δlat′ = Δy (nm = minutes), Δlong′ = Δx / cos(lat), from a placeholder start.
   ════════════════════════════════════════════════════════════════════════ */
const P32=g7_pal('paper');
const T32='Dead reckoning', D32='Heading and time give a position. The circle around it grows until a plain statement fixes it.';
const ROOT32='Root · Bowditch: dead reckoning advances a known fix by course, speed and time. Simplified: no leeway.';
const LEG32=[[28,6],[52,5.5],[12,6],[78,4.5],[34,5],[58,6]], SET32=[160,.9], R032=.3, H32=6, T0_32=21, LAT32=40;
const FIX32=[{t:2,say:'It’s my brother. That’s what this is.'},{t:4,say:'I want to stop arguing with him.'}];
const g7_hhmm=h=>{ const m=Math.round(((T0_32+h)%24)*60); return String(Math.floor(m/60)%24).padStart(2,'0')+String(m%60).padStart(2,'0'); };
const g7_dm=(deg,hemi)=>{ const d=Math.floor(deg+1e-9), m=(deg-d)*60; return d+'°'+m.toFixed(0).padStart(2,'0')+'′'+hemi; };
function g7_sim32(st){ return g7_slot('sim32',st.rate+'|'+st.fixes,()=>{ const dt=.02, N=Math.round(H32/dt), sx=Math.sin(SET32[0]*Math.PI/180)*SET32[1], sy=Math.cos(SET32[0]*Math.PI/180)*SET32[1];
  const fixes=st.fixes?FIX32:[]; let tx=0, ty=0, dx=0, dy=0, tf=0, fi=0; const S=[]; const ev=[{t:0,kind:'fix',x:0,y:0,r:R032,say:'start · last session'}];
  for(let i=0;i<=N;i++){ const t=i*dt; let fx=false; if(fi<fixes.length&&t>=fixes[fi].t-1e-9){ const off=Math.hypot(tx-dx,ty-dy), r=R032+st.rate*(t-tf); ev.push({t,kind:'fix',x:tx,y:ty,from:[dx,dy],off,r,inside:off<=r,say:fixes[fi].say}); dx=tx; dy=ty; tf=t; fi++; fx=true; }
    if(i%50===0&&i>0&&!fx) ev.push({t,kind:'dr',x:dx,y:dy,r:R032+st.rate*(t-tf),leg:LEG32[Math.min(5,Math.floor(t-1e-9))]});
    S.push({t,dx,dy,tx,ty,r:R032+st.rate*(t-tf),tf});
    if(i<N){ const [C,v]=LEG32[Math.min(5,Math.floor(t+1e-9))], a=C*Math.PI/180; dx+=Math.sin(a)*v*dt; dy+=Math.cos(a)*v*dt; tx+=(Math.sin(a)*v+sx)*dt; ty+=(Math.cos(a)*v+sy)*dt; } }
  ev.sort((a,b)=>a.t-b.t); const last=S[S.length-1], endOff=Math.hypot(last.tx-last.dx,last.ty-last.dy);
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(const p of S){ const rr=Math.min(p.r,4); x0=Math.min(x0,p.dx-rr,p.tx); x1=Math.max(x1,p.dx+rr,p.tx); y0=Math.min(y0,p.dy-rr,p.ty); y1=Math.max(y1,p.dy+rr,p.ty); }
  return {S,ev,dt,bb:[x0,y0,x1,y1],endOff,endIn:endOff<=last.r}; }); }
const lay32=g7_memo(function(w){ const T=g7_tl(w,T32,D32,480), o=T, {ph,pad,inner}=T;
  o.sx=pad; o.sy=T.top; o.sw=inner; o.sh=Math.round(inner*(ph?.92:.8)); let y=o.sy+o.sh+30; o.legY=y; y+=ph?44:30; o.logY=y; o.logH=ph?20:24; y+=22+9*o.logH+(ph?3*14:0)+6;
  o.H=g7_rootL(T,ROOT32,y+12); return o; });
/* the sheet's projection: fit the run (fixed bbox of the default rate, so the sheet does not jump) */
let g7_BB32=null;
function g7_bb32(){ if(g7_BB32) return g7_BB32; let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; [true,false].forEach(f=>{ const S=g7_sim32({rate:1,fixes:f}).S; for(const p of S){ x0=Math.min(x0,p.dx-1.5,p.tx); x1=Math.max(x1,p.dx+1.5,p.tx); y0=Math.min(y0,p.dy-1.5,p.ty); y1=Math.max(y1,p.dy+1.5,p.ty); } }); g7_SL.sim32=null; return g7_BB32=[x0,y0,x1,y1]; }
function g7_proj32(L){ const bb=g7_bb32(), m=L.ph?18:26, sc=Math.min((L.sw-2*m)/(bb[2]-bb[0]),(L.sh-2*m)/(bb[3]-bb[1])), cx=L.sx+L.sw/2-(bb[0]+bb[2])/2*sc, cy=L.sy+L.sh/2+(bb[1]+bb[3])/2*sc;
  return {sc,X:x=>cx+x*sc,Y:y=>cy-y*sc}; }
function g7_base32(w,h){ return g7_slot('base32',g7_DK(w,h),()=>{ const L=lay32(w), P=P32, {cv,g}=g7_off(w,h), B=new M.Buf(g), J=g7_proj32(L);
  M.fill(g,P.ground); g7_title(g,L,'L-32 · Pairing · plotting sheet','nm · north up',T32,P);
  M.fill(g,'#ffffff',L.sx,L.sy,L.sw,L.sh); g7_box(g,L.sx,L.sy,L.sx+L.sw,L.sy+L.sh,P.hair);
  /* grid every 2 nm, as dot lines; labels in minutes from the placeholder start */
  const gx0=Math.ceil((L.sx-J.X(0))/J.sc/2)*2, gx1=Math.floor((L.sx+L.sw-J.X(0))/J.sc/2)*2, gy0=Math.ceil((J.Y(0)-L.sy-L.sh)/J.sc/2)*2, gy1=Math.floor((J.Y(0)-L.sy)/J.sc/2)*2;
  for(let gx=gx0;gx<=gx1;gx+=2){ const x=J.X(gx); g7_dl(B,x,L.sy+3,x,L.sy+L.sh-3,3.2,.5,gx%10?P.hair:P.tint); }
  for(let gy=gy0;gy<=gy1;gy+=2){ const y=J.Y(gy); g7_dl(B,L.sx+3,y,L.sx+L.sw-3,y,3.2,.5,gy%10?P.hair:P.tint); }
  /* compass rose: two engraved rings, ticks every 10°, a long tick every 30°, north marked */
  const rr=L.ph?30:42, rx=L.sx+L.sw-rr-(L.ph?14:20), ry=L.sy+L.sh-rr-(L.ph?14:20);
  M.ring(B,{cx:rx,cy:ry,R:rr,w:1.2,swell:.2,dpl:1.4,rCore:.7,rEdge:.55,seed:3201,color:P.ink}); M.ring(B,{cx:rx,cy:ry,R:rr*.62,w:1,swell:.2,dpl:1.1,rCore:.62,rEdge:.5,seed:3202,color:P.dim});
  for(let a=0;a<360;a+=10){ const t=a*Math.PI/180, l=a%90===0?rr*.3:a%30===0?rr*.18:rr*.1; g7_dl(B,rx+Math.sin(t)*(rr-l),ry-Math.cos(t)*(rr-l),rx+Math.sin(t)*rr,ry-Math.cos(t)*rr,1.3,.5,a%90?P.dim:P.ink); }
  B.flush(); g7_lab(g,'N',rx,ry-rr-6,P.ink,9,{align:'center'});
  for(let gx=gx0;gx<=gx1;gx+=L.ph?10:6){ if(J.X(gx)>rx-rr-24) continue; const lon=70-gx/60/Math.cos(LAT32*Math.PI/180); g7_lab(g,g7_dm(lon,'W'),J.X(gx)+3,L.sy+L.sh-6,P.soft,9,{upper:false,track:.02}); }
  for(let gy=gy0;gy<=gy1;gy+=L.ph?10:6){ const y=J.Y(gy); if(y>L.sy+L.sh-24||y<L.sy+14) continue; g7_lab(g,g7_dm(LAT32+gy/60,'N'),L.sx+5,y-4,P.soft,9,{upper:false,track:.02}); }
  return cv; }); }
function g7_draw32(g,w,h,st,t){ const L=lay32(w), P=P32, S=g7_sim32(st), J=g7_proj32(L), B=new M.Buf(g), live=t!=null;
  const tt=live?Math.min(H32,t/1000):H32, k=Math.min(S.S.length-1,Math.round(tt/S.dt)), cur=S.S[k];
  /* true track: what the current did, unknown aboard until a fix */
  for(let i=0;i<k;i+=3){ const p=S.S[i]; B.dot(J.X(p.tx),J.Y(p.ty),.6,P.soft); }
  /* the DR track: dot lines from each fix along the logged legs */
  for(let i=0;i<k;i++){ const p=S.S[i], q=S.S[i+1]; if(q.tf!==p.tf) continue; g7_dl(B,J.X(p.dx),J.Y(p.dy),J.X(q.dx),J.Y(q.dy),2.2,.62,P.ink,0,.99); }
  /* earlier circles, faint: the radius at every hour, so growth and collapse read as a sequence */
  const evs=S.ev.filter(e=>e.t<=tt+1e-9);
  evs.forEach(e=>{ if(e.kind==='dr'){ M.ring(B,{cx:J.X(e.x),cy:J.Y(e.y),R:e.r*J.sc,w:.8,swell:.1,dpl:.5,rCore:.58,rEdge:.5,seed:3210+Math.round(e.t*7),color:P.dim}); } });
  /* the live circle */
  const ep=m4_e(st,'ping',t,260);
  { let r=cur.r; const fe=S.ev.find(e=>e.kind==='fix'&&e.t>0&&e.t<=tt&&tt-e.t<.25); if(live&&fe) r=lerp(fe.r,cur.r,E.outCubic((tt-fe.t)/.25));
    M.ring(B,{cx:J.X(cur.dx),cy:J.Y(cur.dy),R:Math.max(2,r*J.sc),w:1.3+1.6*ep,swell:.2,dpl:1.1,rCore:.8,rEdge:.55,seed:3220,color:P.ink}); }
  /* DR marks: a semicircle over the dot, time written on the diagonal */
  evs.forEach(e=>{ if(e.kind!=='dr') return; const x=J.X(e.x), y=J.Y(e.y); M.ring(B,{cx:x,cy:y,R:5,w:.9,swell:0,dpl:1.6,rCore:.62,rEdge:.55,seed:3230,color:P.ink,a0:Math.PI,a1:TAU}); B.dot(x,y,1.1,P.ink); });
  /* fixes: a full circle, in red; the set found is a dot line from the DR position to the fix */
  let fk=0; evs.forEach(e=>{ if(e.kind!=='fix') return; const x=J.X(e.x), y=J.Y(e.y), ef=m4_e(st,'fix'+(fk++),t,320); if(e.from) g7_dl(B,J.X(e.from[0]),J.Y(e.from[1]),x,y,2.6,.55,P.soft); M.ring(B,{cx:x,cy:y,R:5.5*(1+.9*ef),w:1+.8*ef,swell:0,dpl:1.8,rCore:.7,rEdge:.6,seed:3240,color:P.acc}); B.dot(x,y,1.2,P.acc); });
  /* the boat, at the DR position, pointing along the leg */
  if(live&&tt<H32){ const [C]=LEG32[Math.min(5,Math.floor(tt))]; g7_caret(B,J.X(cur.dx),J.Y(cur.dy),9*(1+.45*ep),(C-90)*Math.PI/180,P.ink,3250); }
  B.flush();
  /* labels on the plot */
  evs.forEach(e=>{ const x=J.X(e.x), y=J.Y(e.y); if(e.kind==='dr'){ g.save(); g.translate(x+7,y+6); g.rotate(Math.PI/4); g7_lab(g,g7_hhmm(e.t),0,0,P.ink,9,{track:.04}); g.restore(); }
    else g7_lab(g,g7_hhmm(e.t),x+9,y+13,P.acc,9,{track:.04}); });
  /* course and speed on each full leg, once: C above, S below, along the leg */
  if(!L.ph){ for(let hh=0;hh<6;hh++){ const i0=Math.round((hh+.5)/S.dt); if(i0>k) break; const p=S.S[i0], [C,v]=LEG32[hh], a=(C-90)*Math.PI/180; if(S.ev.some(e=>e.kind==='fix'&&e.t>0&&Math.abs(e.t-(hh+.5))<.25)) continue;
    g.save(); g.translate(J.X(p.dx),J.Y(p.dy)); g.rotate(Math.abs(a)>Math.PI/2?a+Math.PI:a); g7_lab(g,'C '+String(C).padStart(3,'0'),0,-6,P.soft,9,{align:'center',track:.04}); g7_lab(g,'S '+v.toFixed(1),0,13,P.soft,9,{align:'center',track:.04}); g.restore(); } }
  g7_lab(g,'circle '+cur.r.toFixed(1)+' nm · '+g7_hhmm(tt),L.sx+(L.ph?8:12),L.sy+(L.ph?16:20),P.ink,9);
  /* legend */
  { const y=L.legY, items=[['DR · semicircle',P.ink],['fix · circle',P.acc],['true track',P.dim],['error circle · '+st.rate.toFixed(1)+' nm/h',P.ink]]; let x=L.pad, yy=y;
    items.forEach(([s,c])=>{ const tw=g7_tw(s,g7_monoO(9)); if(x+tw>L.pad+L.inner){ x=L.pad; yy+=16; } g7_lab(g,s,x,yy,c,9); x+=tw+18; }); }
  /* the log */
  { const yb=L.logY; g7_lab(g,'log',L.pad,yb,P.soft,9); M.rule(g,L.pad,yb+6,L.pad+L.inner,yb+6,P.hair);
    let y=yb+22-L.logH; evs.forEach((e,i)=>{ y+=L.logH; const isF=e.kind==='fix'; if(L.ph&&i>0&&evs[i-1].kind==='fix') y+=14; g7_lab(g,g7_hhmm(e.t),L.pad,y,isF?P.acc:P.ink,9,{track:.04});
      const xx=L.pad+(L.ph?40:48);
      if(isF){ const tx=e.t===0?'fix · start':'fix · '+(e.inside?'inside':'outside')+' · '+e.off.toFixed(1)+' nm off'; g7_lab(g,tx,xx,y,P.acc,9); M.text(g,e.t===0?'where the last session ended':'“'+e.say+'”',L.ph?xx:L.pad+L.inner,L.ph?y+13:y,Object.assign(g7_monoO(9,false),{color:P.ink,align:L.ph?'left':'right'})); }
      else g7_lab(g,'DR · C '+String(e.leg[0]).padStart(3,'0')+' · S '+e.leg[1].toFixed(1)+' · circle '+e.r.toFixed(1)+' nm',xx,y,P.soft,9); }); }
  return live&&t<H32*1000+1900; }
/* music · L-32: 120 BPM 4/4, one hour of plot per half bar (the 6 s run is three bars). A marine chronometer ticks every beat.
   Each hourly DR mark is an organ ping, its note the leg's heading read as a chord tone (a compass rose as a scale), its tail and its
   second rank's detune growing with the error circle (the error rate sets how fast), so the pings smear and beat as the estimate drifts.
   The chord drifts too: re-centered D at a fix, suspended (Dsus4) an hour later, padded wider and wetter as the circle grows.
   A fix is a cadence: A7 leans in on the beat before, then the bell on F♯ (the third, the red ring) and a re-centered D, pure.
   The first fix brings the bass, once. Without fixes there is no cadence: the drift ends on B minor, near home but not home. */
const BPM32=120, BT32=500;
function m4_music32(st){ const Sm=g7_sim32(st), mu=M.music, Sc=mu.score({bpm:BPM32,meter:[4,4],ground:'paper'}), END=H32*1000, rAt=t=>{ const p=Sm.S[Math.min(Sm.S.length-1,Math.round(t/1000/Sm.dt))]; return p.r; };
  const fixes=Sm.ev.filter(e=>e.kind==='fix'&&e.t>0), prog=[[0,'D']]; let last=0;
  fixes.forEach(f=>{ const T=Math.round(f.t*1000); prog.push([last+1000,'Dsus4'],[T-BT32,'A7'],[T,'D']); last=T; });
  if(last+1000<END) prog.push([last+1000,'Dsus4']); prog.push([END,st.fixes?'Dadd9':'Bm']); Sc.harm(prog);
  /* the bed: a pad per chord, its chorus (detune) and its air (send) widening with the error circle */
  let pv=null; prog.forEach(([t0,sym],k)=>{ const t1=k<prog.length-1?prog[k+1][0]:END+1600, r=Math.min(5,rAt(Math.min(t0,END))), fin=k===prog.length-1; pv=mu.voice(sym,'A3','A4',fin?4:3,pv);
    Sc.chord(t0+10,'pad',pv,t1-t0+(fin?200:80),{attack:sym==='D'&&t0>0?.04:.3,release:fin?1.6:.3,detune:6+4*r*st.rate,cutoff:fin?1300:1000,vel:fin?.38:.32,send:Math.min(.95,.28+.1*r)}); });
  /* the chronometer */
  for(let t=0;t<=END;t+=BT32) Sc.hitSound(t,'tick',{vel:(t/BT32)%2?.12:.18,tock:!!((t/BT32)%2)});
  /* the start (the last session's fix) and each hourly ping */
  Sc.note(30,'bell',mu.deg(Sc.mode,2,5),1400,{vel:.24,ratio:3.5,pan:-.3},['fix0',1]); Sc.note(0,'pluck','D2',400,{cutoff:360,vel:.5});
  Sm.ev.forEach(e=>{ if(e.kind!=='dr') return; const t=Math.round(e.t*1000), sym=Sc.chordAt(t+1), r=Math.min(6,e.r), m=mu.ct(sym,'D4',Math.round(e.leg[0]/26));
    Sc.note(t,'organ',m,70,{attack:.006,release:Math.min(2.4,.15+.32*r),vibrato:0,detune:4*r,cutoff:2600,vel:.42,send:Math.min(.95,.32+.12*r),pan:Math.max(-.6,Math.min(.6,(e.x-3)/8))},['ping',1]); });
  /* fixes: the cadence */
  fixes.forEach((f,k)=>{ const T=Math.round(f.t*1000);
    Sc.note(T-BT32,'pluck','A1',420,{cutoff:380,vel:.5,hp:35});
    Sc.note(T,'bell',mu.deg(Sc.mode,2,5),2400,{vel:.36,ratio:3.5,pan:.2},['fix'+(k+1),1]);
    Sc.chord(T,'mallet',['D4','F#4','A4','D5'],1600,{vel:.36,trem:5});
    if(k===0) Sc.note(T,'bass','D2',620,{from:'A1',glide:90,env:2.6,decay:.4,vel:.58}); else Sc.note(T,'pluck','D2',500,{cutoff:380,vel:.55,hp:35}); });
  /* the end */
  if(st.fixes) Sc.note(END,'bell','E5',1800,{vel:.22,ratio:3.5,pan:.3},['ping',.5]); else { Sc.note(END,'pluck','B1',700,{cutoff:380,vel:.5,hp:35}); Sc.note(END,'bell','D5',1800,{vel:.26,ratio:3.5,pan:.3},['ping',.6]); }
  Sc.end(END+2600); return m4_gain(Sc.out(),st.fixes?1.55:1.95); }
/* Error rate as music: a ping as it would sound three hours from a fix at this rate (tail, detune and air) */
function m4_param32(A,st,id,ov,nv){ if(id!=='rate') return false; const now=A.now(); if(!now||!m4_ok(st,'pr',120)) return true; const r=.3+3*(+nv);
  A.play('organ',{freq:m4_hz('A4','Dsus4'),dur:.07,attack:.006,release:Math.min(2.4,.15+.32*r),vibrato:0,detune:4*r,cutoff:2600,vel:.44,send:Math.min(.95,.32+.12*r),when:now+.005});
  A.play('tick',{vel:.16,when:now+.005}); return true; }
M.piece({ id:'L-32',
  caption:'Six hours of a session plotted the way a navigator works without landmarks: heading and time give a position, and an error circle grows until a fix. Set the error rate, or turn the fixes off.',
  alt:'A white plotting sheet with a dotted grid, latitude and longitude labels and a compass rose. A dotted course runs east-northeast with semicircle marks each hour and red circles at two fixes. Faint circles grow around each hour mark and shrink after each fix. A log below lists times, courses and the statements that fixed the position.',
  aspect:w=>w/lay32(w).H,
  state:{rate:1,fixes:true},
  controls:[
    {id:'rate',type:'range',label:'Error rate',min:.2,max:2,step:.1,fmt:v=>(+v).toFixed(1)+' nm/h'},
    {id:'fixes',type:'toggle',label:'Fixes',play:true}],
  music:m4_music32, musicParam:m4_param32, musicIns:'organ',
  render(g,w,h,M,st){ g7_blit(g,g7_base32(w,h)); g7_draw32(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ g7_blit(g,g7_base32(w,h)); if(g7_RM()){ g7_draw32(g,w,h,st,null); return false; } return g7_draw32(g,w,h,st,Math.max(0,t)); },
  recipe:{
    idea:'Mir keeps estimating where the conversation is from heading and time, and its uncertainty grows until you say something plainly.',
    marks:['ring','center'],
    ground:'paper',
    accent:'red fixes: the moments a plain statement gave a position',
    composition:'White plotting sheet with dot-line grid and a compass rose; DR track, hourly semicircles, fixes; a legend and the log below (every DR mark and fix).',
    motion:'At 120 BPM the boat runs one hour per half bar (6 h in three bars); fixes fall on downbeats and the circle collapses over a quarter hour (out cubic); the boat and circle swell on each ping, each fix ring on its bell. Reduced motion shows the finished plot.',
    sound:'A chronometer ticks; each hour is a sonar-like organ ping on the heading’s chord tone, smearing and beating as the error circle grows. A fix is a cadence (A7 to D, a bell on F♯); without fixes the drift ends on B minor.',
    controls:['Error rate 0.2–2 nm/h','Fixes on/off'],
    computed:['DR(t) = last fix + Σ v·(sin C, cos C)·dt, dt = 0.02 h','true track = DR legs + current (set 160°, drift 0.9 kn)','r(t) = 0.3 nm + rate·(t − t_fix)','inside test at each fix: |true − DR| ≤ r','labels: Δlat′ = Δy, Δlong′ = Δx / cos 40°'],
    placeholder:['courses and speeds of six legs','current set and drift','fix times and statements','start 40°00′N 70°00′W'],
    root:'Bowditch, American Practical Navigator, ch. 9: DR advances a fix by ordered course and speed; fix circle, DR semicircle, four-digit times; error grows with time without a fix. Pacific etak reckoning is a separate tradition, not drawn here.',
    rules:['sheet is #ffffff on the #fafafa ground','one accent: the fixes'],
    engine:['M.ring (a0/a1 for the semicircle)','M.rule','M.text']
  } });

/* ════════════════════════════════════════════════════════════════════════
   L-33 · Knotted cords: a khipu holding counts of kept marks, read in the decimal knot system.
   COMPUTED: each count is written as knots by place value (Locke 1912/1923; Ascher): hundreds and tens as clusters of
   single (overhand) knots, units as one long knot of 2–9 turns, a figure-eight knot for 1, zero as an empty position.
   Each group's top cord carries the sum of its four pendants (the relation Locke found), written the same way.
   Reading back reverses it: the knots on a cord are parsed position by position into a number.
   The counts are placeholders. Colors stand for themes here; what color meant on real khipus is still studied.
   ════════════════════════════════════════════════════════════════════════ */
const P33=g7_pal('paper');
const T33='Knotted cords', D33='An Andean cord record: knot position gives place value, cord color gives theme.';
const ROOT33='Root · Locke, 1912: read khipu knots as base-ten counts. Simplified: invented counts.';
const TH33=[{name:'sleep',c:P33.ink},{name:'work',c:P33.blade},{name:'my brother',c:P33.blue},{name:'the move',c:g7_mix(P33.ground,P33.ink,.5)}];
const GR33=[{name:'Sep',v:[112,24,31,0]},{name:'Oct',v:[104,23,210,8]},{name:'Nov',v:[56,21,145,10]}];
/* the cords in reading order: 12 pendants, then the three top cords */
const CORDS33=(function(){ const out=[]; GR33.forEach((G,gi)=>G.v.forEach((v,ti)=>out.push({g:gi,t:ti,v,top:false}))); GR33.forEach((G,gi)=>out.push({g:gi,t:-1,v:G.v.reduce((a,b)=>a+b,0),top:true})); return out; })();
/* number → knots, by place: [{place:100,n,kind:'single'}, …]; units: 'long' (2–9 turns) or 'eight' (1) */
function g7_knots33(v){ const h=Math.floor(v/100), t=Math.floor(v/10)%10, u=v%10;
  return [{place:100,n:h,kind:'single'},{place:10,n:t,kind:'single'},{place:1,n:u,kind:u===1?'eight':'long'}]; }
/* knots → number: the reading, done from the knot list itself */
const g7_read33=K=>K.reduce((s,k)=>s+k.place*k.n,0);
const lay33=g7_memo(function(w){ const T=g7_tl(w,T33,D33,700), o=T, {ph,pad,inner}=T;
  o.kw=ph?inner:Math.round(inner*.66); o.kx=pad; o.gut=ph?30:40; o.sp=(o.kw-o.gut)/15.6; o.cw=ph?1.7:Math.min(2.6,o.sp*.06); o.D=ph?54:Math.min(76,Math.round(o.sp*1.55));
  o.topH=Math.round(o.D*3.2); o.yP=T.top+o.topH; o.L=Math.round(o.D*3.6); o.lv={100:o.yP+o.D*.95,10:o.yP+o.D*1.95,1:o.yP+o.D*2.95}; o.lvU={100:o.yP-o.D*.8,10:o.yP-o.D*1.75,1:o.yP-o.D*2.7};
  o.xs=[]; let x=o.kx+o.gut+o.sp*.5; GR33.forEach((G,gi)=>{ const xs=[]; for(let i=0;i<4;i++){ xs.push(x); x+=o.sp; } o.xs.push(...xs); x+=o.sp*1.4; });
  GR33.forEach((G,gi)=>o.xs.push((o.xs[gi*4+1]+o.xs[gi*4+2])/2));
  o.gY=o.yP+o.L+22; let y=o.gY+(ph?62:66);
  if(ph){ o.px=pad; o.pw=inner; o.py=y; y+=236; o.keyY=y; y+=110; }
  else { o.px=pad+o.kw+40; o.pw=inner-o.kw-40; o.py=T.top; o.keyY=y; y+=78; y=Math.max(y,o.py+330); }
  o.H=g7_rootL(T,ROOT33,y+8); return o; });
/* a plied cord: two strands of dots twisting around the axis (S-ply), so the cord reads as spun fiber */
function g7_cord33(B,x,y0,y1,w,col,seed,horiz){ const R=M.rng(seed), c2=g7_mix(col,P33.ground,.28), L=Math.abs(y1-y0), n=Math.round(L*1.7), f=1/(w*2.2);
  for(let i=0;i<n;i++){ const t=(i+R()*.6)/n, a=y0+(y1-y0)*t, ph=a*f*TAU*.25;
    for(let s=0;s<2;s++){ const o=Math.sin(ph+s*Math.PI)*w*.3, d=Math.cos(ph+s*Math.PI), cc=d>0?col:c2; const px=x+o+(R()-.5)*.3, r=(.62+.18*R())*(w>2.5?1.05:.95);
      horiz?B.dot(a,px,r,cc):B.dot(px,a,r,cc); } } }
/* knots: single overhand (a bump with a crossing), long (n coils), figure-eight (two lobes) */
function g7_single33(B,x,y,w,col,seed){ const R=M.rng(seed), rx=w*2.1, ry=w*1.2;
  for(let i=0;i<Math.round(rx*ry*5);i++){ const a=R()*TAU, r=Math.sqrt(R()), dx=Math.cos(a)*r*rx, dy=Math.sin(a)*r*ry; if(Math.abs(dx*.55-dy)<w*.16) continue; B.dot(x+dx,y+dy,.62+.15*R(),col); } }
function g7_long33(B,x,y,n,w,col,seed){ const R=M.rng(seed), th=w*1.5, H=n*th, rx=w*1.9;
  for(let i=0;i<Math.round(rx*H*4.2);i++){ const dx=(R()*2-1)*rx, dy=(R()-.5)*H; if((dx/rx)*(dx/rx)+Math.pow(Math.abs(dy)/(H/2+th*.3),6)>1) continue; const ph=((dy+H/2)/th+dx/(rx*2.4))%1; if(ph>.72) continue; B.dot(x+dx,y+dy,.6+.15*R(),col); } return H; }
function g7_eight33(B,x,y,w,col,seed){ const r=w*1.45; M.ring(B,{cx:x,cy:y-r*.95,R:r,w:w*.55,swell:.1,dpl:2.4,rCore:.62,rEdge:.55,seed,color:col}); M.ring(B,{cx:x,cy:y+r*.95,R:r,w:w*.55,swell:.1,dpl:2.4,rCore:.62,rEdge:.55,seed:seed+1,color:col}); }
function g7_kH33(k,w){ const kh=w*2.1; return k.kind==='single'?k.n*kh*1.1:k.kind==='eight'?w*3.8:k.n*w*1.15; }
function g7_tie33(B,x,lvY,dir,K,w,col,seed){ /* dir 1: pendant (down), −1: top cord (up); clusters centered on each level */
  col=g7_mix(col,P33.ink,.22); K.forEach((k,j)=>{ if(!k.n) return; const y=lvY[k.place], kh=w*2.6;
    if(k.kind==='single'){ const H=k.n*kh*1.1; for(let i=0;i<k.n;i++) g7_single33(B,x,y-H/2+kh*1.1*(i+.5),w,col,seed+j*31+i); }
    else if(k.kind==='eight') g7_eight33(B,x,y,w,col,seed+j*31);
    else g7_long33(B,x,y,k.n,w,col,seed+j*31); }); }
function g7_base33(w,h){ return g7_slot('base33',g7_DK(w,h),()=>{ const L=lay33(w), P=P33, {cv,g}=g7_off(w,h), B=new M.Buf(g), w0=L.cw;
  M.fill(g,P.ground); g7_title(g,L,'L-33 · Pairing · khipu','base ten · knots by place',T33,P);
  const lvDown=L.lv, lvUp=L.lvU;
  /* primary cord: thicker, undyed */
  g7_cord33(B,L.yP,L.kx,L.kx+L.kw,w0*1.6,g7_mix(P.ground,P.ink,.62),3300,true);
  CORDS33.forEach((C,i)=>{ const x=L.xs[i], col=C.top?g7_mix(P.ground,P.ink,.78):TH33[C.t].c, K=g7_knots33(C.v);
    if(C.top){ g7_cord33(B,x,L.yP-2,L.yP-L.topH,w0,col,3310+i); g7_tie33(B,x,lvUp,-1,K,w0,col,3400+i*97); }
    else { const len=L.L*(.94+.06*M.hash2(i,3,33)); g7_cord33(B,x,L.yP+2,L.yP+len,w0,col,3310+i); g7_tie33(B,x,lvDown,1,K,w0,col,3400+i*97);
      const R=M.rng(3390+i); for(let q=0;q<5;q++) B.dot(x+(R()-.5)*w0*2.2,L.yP+len+R()*5,.55,col); } });
  B.flush();
  g7_lab(g,L.ph?'top cords':'top cords · group sums',L.xs[12]+(L.ph?8:10),L.yP-L.topH+6,P.soft,9);
  /* labels: cord numbers under the cords, group names, place levels */
  CORDS33.forEach((C,i)=>{ if(C.top) return; g7_lab(g,String(i+1).padStart(2,'0'),L.xs[i],L.gY,P.soft,9,{align:'center',track:.02}); });
  GR33.forEach((G,gi)=>{ const x0=L.xs[gi*4], x1=L.xs[gi*4+3]; M.rule(g,x0-4,L.gY+10,x1+4,L.gY+10,P.hair); g7_lab(g,(L.ph?'':'group '+(gi+1)+' · ')+G.name,(x0+x1)/2,L.gY+24,P.ink,9,{align:'center'}); });
  /* key: the three knot kinds, drawn the same way, and the theme colors */
  { const y=L.keyY, B2=new M.Buf(g), ww=L.ph?2.2:3, cwid=L.ph?L.inner/2:Math.min(210,L.inner/6);
    const draws=[(x,y)=>{ g7_single33(B2,x,y-ww*1.2,ww,P.ink,3501); g7_single33(B2,x,y+ww*1.2,ww,P.ink,3502); },(x,y)=>g7_long33(B2,x,y,4,ww,P.ink,3503),(x,y)=>g7_eight33(B2,x,y,ww,P.ink,3504),null];
    ['single · 10s, 100s','long · 4 turns = 4','figure-eight · 1','empty · 0'].forEach((t,i)=>{ const col=L.ph?i%2:i, row=L.ph?Math.floor(i/2):0, x=L.pad+col*cwid, yy=y+row*40;
      g7_cord33(B2,x+8,yy-14,yy+20,ww,g7_mix(P.ground,P.ink,.35),3510+i); if(draws[i]) draws[i](x+8,yy+2);
      g7_lab(g,t,x+22,yy+5,P.ink,9); });
    const ty=L.ph?y+80:y+50; let tx=L.pad; TH33.forEach((t,i)=>{ g7_cord33(B2,tx+4,ty-10,ty+4,ww,t.c,3520+i); const lw=g7_lab(g,t.name,tx+14,ty,P.ink,9); tx+=lw+(L.ph?24:32); });
    B2.flush(); g7_lab(g,'colors stand for themes here',L.ph?L.pad:tx+8,L.ph?ty+18:ty,P.soft,9,{upper:false,track:.02}); }
  return cv; }); }
function g7_draw33(g,w,h,st,t){ const L=lay33(w), P=P33, live=t!=null, n=CORDS33.length, step=E33;
  const sel=live&&t<n*step?Math.floor(t/step):st.sel, C=CORDS33[sel], K=g7_knots33(C.v), x=L.xs[sel], B=new M.Buf(g);
  /* place guides */
  if(st.guides){ const xe=L.kx+L.kw; [100,10,1].forEach(p=>{ g7_dl(B,L.kx+(L.ph?24:30),L.lv[p],xe,L.lv[p],4,.5,P.tint); g7_dl(B,L.kx+(L.ph?24:30),L.lvU[p],xe,L.lvU[p],4,.5,P.tint); }); }
  /* the cord being read: a red ring where it meets the primary cord, and a caret at its end */
  M.ring(B,{cx:x,cy:L.yP,R:L.ph?6:8,w:1.2,swell:.15,dpl:1.6,rCore:.75,rEdge:.6,seed:3600,color:P.acc});
  /* each cord answers its note: its knot levels swell in a ring as the reading passes */
  if(live) CORDS33.forEach((Ci,i)=>{ const e=m4_qe(m4_e(st,'c'+i,t,200)); if(e<.05) return; const xi=L.xs[i], lv=Ci.top?L.lvU:L.lv;
    g7_knots33(Ci.v).forEach(k=>{ if(k.n) M.ring(B,{cx:xi,cy:lv[k.place],R:(L.ph?5:7)*(1+.6*e),w:.8+1.2*e,swell:.1,dpl:1.4,rCore:.6,rEdge:.5,seed:3602+i,color:g7_mix(Ci.top?P.ink:TH33[Ci.t].c,P.acc,e*.7)}); }); });
  const ye=C.top?L.yP-L.topH-10:L.yP+L.L+8; g7_caret(B,x,ye,L.ph?6:8,C.top?Math.PI/2:-Math.PI/2,P.acc,3601);
  B.flush();
  if(st.guides) [[100,'100s'],[10,'10s'],[1,'1s']].forEach(([p,s])=>{ g7_lab(g,s,L.kx,L.lv[p]+3,P.soft,9,{upper:false,track:.02}); g7_lab(g,s,L.kx,L.lvU[p]+3,P.soft,9,{upper:false,track:.02}); });
  /* the reading panel */
  { const px=L.px, py=L.py, pw=L.pw; let y=py+(L.ph?0:8);
    g7_lab(g,C.top?'top cord · group '+(C.g+1):'cord '+String(sel+1).padStart(2,'0')+' · group '+(C.g+1)+' · '+GR33[C.g].name,px,y,P.soft,9);
    y+=L.ph?32:40; const nm=C.top?'sum of the group':TH33[C.t].name; g7_disp(g,nm,px-1,y,L.ph?22:26,C.top?P.ink:TH33[C.t].c);
    const v=g7_read33(K); y+=L.ph?52:66; g7_disp(g,String(v),px-2,y,L.ph?44:60,P.ink); g7_lab(g,'read back',px+g7_tw(String(v),g7_dispO(L.ph?44:60))+10,y,P.soft,9);
    y+=L.ph?26:34; M.rule(g,px,y-14,px+pw,y-14,P.hair);
    K.forEach(k=>{ const kind=!k.n?'empty':k.kind==='single'?k.n+' single knot'+(k.n>1?'s':''):k.kind==='eight'?'figure-eight':'long knot · '+k.n+' turns', ek=m4_qe(m4_e(st,'p'+k.place,t,160));
      g7_lab(g,k.place===100?'100s':k.place===10?'10s':'1s',px,y,ek>.05?g7_mix(P.soft,P.acc,ek):P.soft,9,{upper:false}); g7_lab(g,kind,px+40,y,P.ink,9,{upper:false,track:.02}); g7_lab(g,'→ '+k.n*k.place,px+pw,y,P.ink,9,{align:'right',upper:false,track:.02}); y+=L.ph?18:20; });
    if(C.top){ const G=GR33[C.g], s=G.v.join(' + ')+' = '+G.v.reduce((a,b)=>a+b,0); y+=4; g7_lab(g,s,px,y,P.acc,9,{upper:false,track:.02}); y+=16; g7_lab(g,'equals the four pendants',px,y,P.soft,9,{upper:false,track:.02}); }
    else { const G=GR33[C.g], tot=G.v.reduce((a,b)=>a+b,0); y+=4; g7_lab(g,'= '+v+(C.v===0?' · an empty cord':''),px,y,P.acc,9,{upper:false,track:.02}); y+=16; g7_lab(g,'top cord, group '+(C.g+1)+': '+tot,px,y,P.soft,9,{upper:false,track:.02}); }
    if(!st.used&&!live) g7_lab(g,L.ph?'tap a cord to read it':'hover or tap a cord to read it',px,y+(L.ph?24:36),P.soft,9); }
  return live&&t<BAR33*3.9; }
/* music · L-33: 115 BPM, one cord per eighth (the old 260 ms step is this tempo's eighth). The reading is a melody in two registers:
   each pendant's units are a high note and its tens a low one, the digit read as a scale degree and set on the group's chord
   (Sep D, Oct B minor, Nov G); an empty cord is a rest; the three top cords (the sums) answer over A. Place guides add a bass on the
   hundreds. Then the selected cord is read back as a phrase over A7: each place counted out as a scale run (a count is a run), low for
   hundreds, middle for tens, high for units; the last note resolves to D with the bass, once. */
const BPM33=115, E33=60000/BPM33/2, BAR33=E33*8;
/* the read-back of one count: [{dt (ms), place, m}] as scale runs, with the place sizes as registers */
function m4_runs33(v,md,step){ const out=[], dg=[[100,Math.floor(v/100),2],[10,Math.floor(v/10)%10,4],[1,v%10,5]]; let t=0;
  dg.forEach(([pl,n,oc])=>{ if(!n){ t+=step; return; } for(let j=0;j<n;j++){ out.push({dt:t,place:pl,m:M.music.deg(md,j,oc)}); t+=step; } t+=step; }); return {notes:out,len:t}; }
function m4_music33(st){ const mu=M.music, Sc=mu.score({bpm:BPM33,meter:[4,4],ground:'paper'}), md=Sc.mode, E=E33, B=BAR33, rb=2*B, arr=3*B, C=CORDS33[st.sel];
  Sc.harm([[0,'D'],[4*E,'Bm'],[8*E,'G'],[12*E,'A'],[rb,'A7'],[arr,'D']]);
  let pv=null; [['D',0,4],['Bm',4,4],['G',8,4],['A',12,4]].forEach(([sym,e0,n])=>{ pv=mu.voice(sym,'A3','A4',3,pv); Sc.chord(e0*E+10,'pad',pv,n*E+60,{attack:.12,release:.3,cutoff:950,vel:.22}); });
  CORDS33.forEach((Cd,i)=>{ const t=i*E, sym=Sc.chordAt(t+1), h=Math.floor(Cd.v/100), te=Math.floor(Cd.v/10)%10, u=Cd.v%10, pan=(i/14-.5)*1.2; let hit=['c'+i,1];
    Sc.hitSound(t,'hat',{vel:i%2?.1:.16,decay:.02});
    if(u){ Sc.note(t,Cd.top?'bell':'pulse',mu.snap(sym,mu.deg(md,u-1,5)),Cd.top?1200:E*.8,Cd.top?{vel:.3,ratio:3.5,pan}:{pw:.3,cutoff:2400,env:1.2,vel:.34,pan},hit); hit=null; }
    if(te){ Sc.note(t,'pluck',mu.snap(sym,mu.deg(md,te-1,3)),E*1.6,{cutoff:900,vel:.44,pan:pan*.6},hit); hit=null; }
    if(st.guides&&h){ Sc.note(t,'pluck',mu.ct(sym,36+mu.parse(sym).pcs[0],h-1),E*1.8,{cutoff:380,vel:.52,hp:35},hit); hit=null; }
    if(Cd.top&&!u&&!te) Sc.note(t,'organ',mu.snap(sym,'A4'),E*1.5,{vel:.3,vibrato:2},hit); });
  /* the read-back over A7, the place runs on sixteenths (thirty-seconds if the count is long) */
  Sc.note(rb,'pluck','A1',B*.9,{cutoff:420,vel:.52,hp:35}); if(st.guides) Sc.note(rb+B/2,'pluck','E2',B*.45,{cutoff:420,vel:.42,hp:35});
  const nk=Math.floor(C.v/100)+Math.floor(C.v/10)%10+C.v%10+3, step=Math.min(E/2,(B-E)/nk), R=m4_runs33(C.v,md,step);
  R.notes.forEach(x=>Sc.note(rb+x.dt,'pulse',x.m,step*.9,{pw:.3,cutoff:2000+x.place*4,env:1.1,vel:.36,pan:x.place===100?-.4:x.place===10?0:.4},['p'+x.place,1]));
  /* the sum resolves: the bass once, the D chord, the bell on F♯ */
  Sc.note(arr,'bass','D2',700,{from:'A1',glide:90,env:2.6,decay:.4,vel:.58},['arr',1]); Sc.chord(arr,'mallet',['D4','F#4','A4','D5'],1700,{vel:.36,trem:5});
  Sc.note(arr+E,'bell',mu.deg(md,2,5),2000,{vel:.3,ratio:3.5,pan:.2});
  Sc.end(arr+B*.9+1200); return m4_gain(Sc.out(),st.guides?1.5:1.65); }
/* the read-back on its own (Cord select, hover, tap): the runs and the resolution, through any play(ins, opts) */
function m4_count33(play,now,C){ const md='ionian', step=E33/2/1000, R=m4_runs33(C.v,md,step*1000), hs=[];
  hs.push(play('pluck',{chord:[m4_hz('A1','A7')],dur:.6,cutoff:420,vel:.48,hp:35,when:now}));
  R.notes.forEach(x=>hs.push(play('pulse',{freq:m4_hz(x.m,'A7'),dur:step*.9,pw:.3,cutoff:2000,env:1.1,vel:.36,pan:x.place===100?-.4:x.place===10?0:.4,when:now+x.dt/1000})));
  const te=now+R.len/1000+.05; hs.push(play('mallet',{chord:['D4','F#4','A4'].map(n=>m4_hz(n,'D')),dur:1.2,vel:.34,trem:5,when:te})); return hs; }
function m4_param33(A,st,id,ov,nv){ if(id!=='sel') return false; const now=A.now(); if(!now) return true; const s=m4_S(st); (s.ch||[]).forEach(h=>{ try{ h&&h.stop(now,.04); }catch(_){} });
  s.ch=m4_count33((i,o)=>A.play(i,o),now+.01,CORDS33[+nv]); return true; }
M.piece({ id:'L-33',
  caption:'A khipu, the Andean knotted-cord record, holding invented counts of kept marks in its decimal knot system. Hover or tap a cord to hear its knots counted out and its number read back.',
  alt:'A pale stippled primary cord with twelve hanging pendant cords in four colors, in three groups, and three short top cords rising above. Each pendant carries clusters of small knots and one long coiled knot or figure-eight knot at three heights. A panel on the right reads the selected cord: my brother, 31, with its knots listed by place.',
  aspect:w=>w/lay33(w).H,
  state:{sel:2,guides:true,used:0},
  controls:[
    {id:'sel',type:'select',label:'Cord',options:CORDS33.map((C,i)=>({value:i,label:C.top?'top · group '+(C.g+1):String(i+1).padStart(2,'0')+' · '+TH33[C.t].name+' · '+GR33[C.g].name}))},
    {id:'guides',type:'toggle',label:'Place guides',play:true}],
  music:m4_music33, musicParam:m4_param33, musicIns:'pulse',
  render(g,w,h,M,st){ g7_blit(g,g7_base33(w,h)); g7_draw33(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ g7_blit(g,g7_base33(w,h)); if(g7_RM()){ g7_draw33(g,w,h,st,null); return false; } return g7_draw33(g,w,h,st,Math.max(0,t)); },
  pointer(st,e){ if(e.type==='up') return false; const L=lay33(e.w); if(e.x<L.kx||e.x>L.kx+L.kw||e.y<L.yP-L.topH-12||e.y>L.yP+L.L+12) return false;
    const above=e.y<L.yP-4; let bi=-1, bd=1e9; CORDS33.forEach((C,i)=>{ if(C.top!==above) return; const d=Math.abs(L.xs[i]-e.x); if(d<bd){ bd=d; bi=i; } });
    if(bi<0||bd>L.sp*.7) return false; if(bi===st.sel&&st.used) return false; st.sel=bi; st.used=1;
    /* the cord's count, read back as runs; a quick sweep of the pointer waits 90 ms between counts */
    const a=m4_live(); if(a&&m4_ok(st,'hv',90)){ const s=m4_S(st), now=a.now()+.01; (s.ch||[]).forEach(h=>{ try{ h&&h.stop(now,.04); }catch(_){} }); s.ch=m4_count33((i,o)=>m4_play('L-33',i,o),now,CORDS33[bi]); }
    return true; },
  recipe:{
    idea:'What Mir keeps is counted, and the count can be read back by anyone who knows the knots.',
    marks:['dot','hollow'],
    ground:'paper',
    accent:'red ring and caret: the cord being read, and its sum line',
    composition:'Primary cord across the top, three groups of four pendants with top cords above; place guides at 100s, 10s, 1s; reading panel right (below on phone); knot key and theme colors under the khipu.',
    motion:'At 115 BPM the reading crosses the fifteen cords one per eighth (261 ms), each cord’s knot levels swelling as it sounds; then it rests on the selected cord while its places are counted out, and the sum resolves on the downbeat of bar 4. Reduced motion shows the selected cord.',
    sound:'The reading is a melody: each cord’s units a high note and its tens a low one, set on its group’s chord; empty cords are rests. The selected cord’s count plays back as scale runs by place over A7, then resolves to D.',
    controls:['Cord (15)','Place guides on/off','hover or tap a cord'],
    computed:['knots from a count: hundreds and tens as single knots, units as a long knot of n turns, 1 as a figure-eight, 0 as an empty place','read back: Σ place × knots, parsed from the knot list','top cord = sum of its group’s four pendants'],
    placeholder:['all counts','theme names and colors','group names Sep, Oct, Nov'],
    root:'Locke (1912, 1923) showed many khipus record base-ten numbers; Ascher and Ascher analyzed several hundred. Known khipus number about 1,400 (Medrano). Debated or unknown: non-numerical and narrative khipus, what colors and knot direction meant, Urton’s binary coding, Hyland’s phonetic reading of Collata khipus. Khipu use continued after the conquest and survives in some Andean communities today.',
    rules:['a record system of the Andes, drawn as a record: no ornament, no pastiche patterns','colors stand for themes in this piece only'],
    engine:['M.ring','M.hash2','M.rng']
  } });

/* ════════════════════════════════════════════════════════════════════════
   L-34 · Through a pinhole: a dark room in section, and its far wall face-on with the inverted image.
   COMPUTED (λ = 550 nm, object 0.5 m in radius at u = 15 m, wall at f): image radius = 0.5·f/u, inverted (rotated 180°).
   Blur on the wall b = d·(1 + f/u) (the hole's own shadow) + 2.44·λ·f/d (the Airy disc). Each dot is spread by a fixed
   random point in a disc of diameter b. Sharpest hole: db/dd = 0 → d* = √(2.44·λ·f·u/(u + f)). Light on the wall ∝ (d/f)²;
   dots shown = N₀·(d/f)²/(d*·f₀⁻¹)², capped at 2·N₀, by a fixed rank per dot. Rayleigh's 1.9·√(λf) is printed for comparison.
   ════════════════════════════════════════════════════════════════════════ */
const P34=g7_pal('night');
const T34='Through a pinhole', D34='Light from outside crosses one small hole and lands upside down on the far wall.';
const ROOT34='Root · Mozi, Aristotle, Ibn al-Haytham: a small hole casts an inverted image. Simplified: blur as a disc.';
const LAM34=550e-9, U34=15, RO34=.5;
const g7_opt34=f=>Math.sqrt(2.44*LAM34*f*U34/(U34+f))*1000; /* mm */
function g7_calc34(st){ const f=st.f, d=st.d/1000, bg=d*(1+f/U34), bd=2.44*LAM34*f/d, b=bg+bd, dopt=g7_opt34(f), ref=g7_opt34(3)/3, light=Math.pow(st.d/f,2)/Math.pow(ref,2);
  return {f,d:st.d,bg:bg*1000,bd:bd*1000,b:b*1000,dopt,ray:1.9*Math.sqrt(LAM34*f)*1000,light,fno:f/d,ri:RO34*f/U34,show:Math.min(2,light)}; }
/* the field's dots, once, at radius 1: position, color, a fixed rank, a fixed blur offset */
let g7_FD34=null;
function g7_fd34(){ if(g7_FD34) return g7_FD34; const cap=g7_cap(); M.mirField(cap,{cx:0,cy:0,R:100,k:1,seed:34,pal:{ring:'r',blade:'b',center:'c'},rings:8,dens:2.2,r:.8});
  const R=M.rng(3401), n=cap.X.length, o={x:new Float32Array(n),y:new Float32Array(n),c:cap.C.slice(),rank:new Float32Array(n),ox:new Float32Array(n),oy:new Float32Array(n),n};
  for(let i=0;i<n;i++){ o.x[i]=cap.X[i]/100; o.y[i]=cap.Y[i]/100; o.rank[i]=R(); const a=R()*TAU, r=Math.sqrt(R())*.5; o.ox[i]=Math.cos(a)*r; o.oy[i]=Math.sin(a)*r; } return g7_FD34=o; }
const lay34=g7_memo(function(w){ const T=g7_tl(w,T34,D34,480), o=T, {ph,pad,inner}=T;
  o.sx=pad; o.sy=T.top; o.sw=inner; o.sh=Math.round(inner*(ph?.62:.46)); let y=o.sy+o.sh+(ph?40:44);
  o.wy=y; if(ph){ o.wx=pad; o.ws=inner; o.rx=pad; o.ry=y+o.ws+34; y=o.ry+5*30; } else { o.ws=Math.round(inner*.56); o.wx=pad; o.rx=pad+o.ws+28; o.rw=inner-o.ws-28; o.ry=y+12; y=Math.max(y+o.ws,o.ry+5*36); }
  o.H=g7_rootL(T,ROOT34,y+(ph?18:24)); return o; });
function g7_base34(w,h){ return g7_slot('base34',g7_DK(w,h),()=>{ const L=lay34(w), P=P34, {cv,g}=g7_off(w,h), B=new M.Buf(g);
  M.fill(g,P.ground); g7_title(g,L,'L-34 · Pairing · camera obscura','550 nm light · object at 15 m',T34,P);
  /* the far wall panel: a faint tooth so the wall reads as a surface */
  g7_jit(B,[L.wx,L.wy,L.wx+L.ws,L.wy+L.ws],L.ph?2.4:2.8,()=>.1,(d,R)=>.5+.1*R(),P.hair,3410); B.flush();
  g7_box(g,L.wx,L.wy,L.wx+L.ws,L.wy+L.ws,P.hair); g7_lab(g,'the far wall, face-on',L.wx,L.wy-10,P.soft,9);
  g7_lab(g,'section · not to scale',L.sx,L.sy-10,P.soft,9);
  return cv; }); }
function g7_draw34(g,w,h,st,t){ const L=lay34(w), P=P34, C=g7_calc34(st), FD=g7_fd34(), live=t!=null, u=live?cl((t-2*E34)/(FOC34+1200-2*E34)):1, ui=live?m4_qe(m4_e(st,'img',t,420)):0, B=new M.Buf(g);
  /* ── the section ── */
  { const x0=L.sx, y0=L.sy, W=L.sw, H=L.sh, cy=y0+H*.5, ox=x0+W*.13, ro=Math.min(H*.3,W*.12), wx=x0+W*.52, fx=x0+W*.96, rt=y0+H*.08, rb=y0+H*.92, tw=L.ph?7:9, gap=Math.max(3,Math.min(H*.16,st.d*2.4)), ri=ro*(fx-tw/2-wx)/(wx-ox);
    /* the room's walls: dense stipple, the pinhole a gap in the near wall */
    const wallD=(x,y)=>{ const inNear=x>=wx-tw/2&&x<=wx+tw/2&&y>=rt&&y<=rb&&Math.abs(y-cy)>gap/2, inFar=x>=fx-tw/2&&x<=fx+tw/2&&y>=rt&&y<=rb, inTop=y>=rt&&y<=rt+tw&&x>=wx-tw/2&&x<=fx+tw/2, inBot=y<=rb&&y>=rb-tw&&x>=wx-tw/2&&x<=fx+tw/2; return inNear||inFar||inTop||inBot?.8:0; };
    const kk=Math.max(1,Math.round(FD.n/(L.ph?1400:2200)));
    /* walls and the field outside change only with the hole: cached per size and pinhole */
    g7_blit(g,g7_slot('sec34',g7_DK(w,h)+'|'+st.d,()=>{ const o=g7_off(w,h), Bs=new M.Buf(o.g); g7_jit(Bs,[wx-tw,rt-1,fx+tw,rb+1],L.ph?1.5:1.7,wallD,(d,R)=>.55+.15*R(),P.dim,3420);
      for(let i=0;i<FD.n;i+=kk) Bs.dot(ox+FD.x[i]*ro,cy+FD.y[i]*ro,.6,FD.c[i]==='c'?P.acc:FD.c[i]==='b'?P.blade:P.ring); Bs.flush(); return o.cv; }));
    /* rays: from the top, center and bottom of the field through both edges of the hole, as dot lines */
    /* rays leave one per eighth, bottom of the field first (the rising arpeggio); each reaches the hole an eighth later and the wall
       an eighth after that, and brightens while its note sounds */
    RAY34.forEach(([s,e],k)=>{ const py=cy+s*ro, hy=cy+e*gap/2, wy=hy+(hy-py)*(fx-tw/2-wx)/(wx-ox), a=live?cl((t-k*E34)/E34):1, b=live?cl((t-(k+1)*E34)/E34):1, er=live?m4_qe(m4_e(st,'r'+k,t,240)):0, r=.55*(1+.7*er);
      if(a>0) g7_dl(B,ox,py,wx,hy,3,r,er>.1?P.ring:P.soft,0,a); if(b>0) g7_dl(B,wx,hy,fx-tw/2,wy,3,r,s===0&&er<.1?P.soft:P.ring,0,b); });
    /* on the far wall, in section: the image, inverted, drawn small and face-on against the wall */
    if(!live||t>=FOC34){ const R=M.rng(3425), n=Math.round(ri*2*1.6*Math.min(1,C.show)); for(let i=0;i<n;i++){ const yy=cy+(R()*2-1)*ri, c=Math.abs(yy-cy)<ri*.12?P.acc:P.ring; B.dot(fx-tw/2-1.5-R()*3,yy,.6,c); } }
    B.flush();
    g7_lab(g,'outside',ox,rb,P.soft,9,{align:'center'}); g7_lab(g,'pinhole',wx,rt-8,P.ink,9,{align:'center'});
    g7_lab(g,'far wall · '+C.f.toFixed(1)+' m',fx,rb+16,P.soft,9,{align:'right'}); }
  /* ── the far wall: the inverted image, spread by blur, thinned by light ── */
  { const B2=new M.Buf(g), half=L.ws/2, cx=L.wx+half, cy=L.wy+half, mpp=.15/half, rpx=C.ri/mpp, bpx=C.b/1000/mpp, show=C.show/2*u, rr=(L.ph?.62:.7)*(1+.45*ui), lk=live?m4_qe(m4_e(st,'lock',t,500)):0;
    for(let i=0;i<FD.n;i++){ if(FD.rank[i]>=show) continue; const x=cx-FD.x[i]*rpx+FD.ox[i]*bpx, y=cy-FD.y[i]*rpx+FD.oy[i]*bpx; if(x<L.wx+2||x>L.wx+L.ws-2||y<L.wy+2||y>L.wy+L.ws-2) continue;
      B2.dot(x,y,FD.c[i]==='c'?rr*(1+.8*lk):rr,FD.c[i]==='c'?P.acc:FD.c[i]==='b'?P.blade:P.ring); }
    /* a blur disc to scale, bottom left */
    const bx=L.wx+14+Math.max(3,bpx/2), by=L.wy+L.ws-16-Math.max(3,bpx/2); M.ring(B2,{cx:bx,cy:by,R:Math.max(1.5,bpx/2),w:.8,swell:0,dpl:1.6,rCore:.55,rEdge:.5,seed:3430,color:P.soft});
    B2.flush(); g7_lab(g,'blur '+C.b.toFixed(1)+' mm',bx+Math.max(3,bpx/2)+8,by+3,P.soft,9,{upper:false,track:.02});
    g7_lab(g,'image ↻ 180°',L.wx+L.ws-10,L.wy+18,P.soft,9,{align:'right'}); }
  /* ── readings ── */
  { const sharp=Math.abs(C.d-C.dopt)/C.dopt<.12, rows=[
      ['pinhole',C.d.toFixed(1)+' mm · f/'+Math.round(C.fno)],
      ['blur on the wall',C.bg.toFixed(1)+' hole + '+C.bd.toFixed(1)+' diffraction = '+C.b.toFixed(1)+' mm'],
      ['sharpest hole',C.dopt.toFixed(2)+' mm'+(sharp?' · this one':'')],
      ['Rayleigh, 1891','1.9√(λf) = '+C.ray.toFixed(2)+' mm'],
      ['light vs sharpest',(C.light<10?C.light.toFixed(2):C.light.toFixed(0))+'× · '+(Math.log2(C.light)>=0?'+':'−')+Math.abs(Math.log2(C.light)).toFixed(1)+' stops'+(C.light>2?' · dots capped at 2×':'')]];
    const rh=L.ph?30:36, mw=L.ph?L.inner:L.rw; rows.forEach((r,i)=>{ const y=L.ry+i*rh, acc=i===2&&sharp; g7_lab(g,r[0],L.rx,y,acc?P.acc:P.soft,9); const lines=g7_lines(r[1],mw,g7_monoO(10,false));
      M.text(g,lines.length>1&&!L.ph?r[1].replace(' diffraction',' diffr.'):r[1],L.rx,y+15,Object.assign(g7_monoO(L.ph?10:10,false),{color:P.ink})); }); }
  return live&&t<FOC34+2600; }
/* music · L-34: 100 BPM 4/4 in D Dorian (night), the image a chord coming into focus. The six rays leave on eighths as a rising
   arpeggio of the loose motif (5 1 4, twice), over a room tone on the root and fifth whose level is the light through the hole.
   On the downbeat of bar 2 the image lands: at the sharpest hole the fourth resolves to the third at once and the two voices meet;
   too large a hole, and the chord arrives blurred (its chorus widened by the blur, its air wetter) and the third slides in late;
   too small, and it is a thin, quiet triad that resolves a beat later. Room depth is register: a deeper room sounds an octave lower. */
const BPM34=100, E34=60000/BPM34/2, FOC34=8*E34, RAY34=[[1,-1],[1,1],[0,-1],[0,1],[-1,-1],[-1,1]];
function m4_p34(st){ const C=g7_calc34(st), Cb=g7_calc34({d:C.dopt,f:st.f}), lg=cl((Math.log2(C.light)+4)/7), r=C.d/C.dopt, sharp=Math.abs(r-1)<.12;
  return {C,lg,sharp,small:!sharp&&r<1,large:!sharp&&r>1,blur:Math.min(1,Math.abs(Math.log2(C.b/Cb.b))*1.4),oct:st.f<2.5?1:st.f<3.25?0:-1}; }
function m4_music34(st){ const p=m4_p34(st), mu=M.music, Sc=mu.score({bpm:BPM34,meter:[4,4],ground:'night'}), md=Sc.mode, E=E34, F=FOC34, o=12*p.oct, res=p.sharp?F:p.large?F+4*E:F+2*E;
  Sc.harm([[0,'Dsus4'],[res,'Dm']]);
  /* the room tone: root and fifth, as loud and as bright as the light */
  Sc.hitSound(0,'drone',{freq:mu.hz(50+o,'D'),ratio:1.5,level:.2+.26*p.lg,cutoff:500+1600*p.lg,fade:.9,dur:(F+2*E)/1000});
  /* the rays: the loose motif rising twice, panned outside → wall */
  const arp=[mu.deg(md,-3,4),mu.deg(md,0,4),mu.deg(md,3,4),mu.deg(md,4,4),mu.deg(md,7,4),mu.deg(md,10,4)];
  arp.forEach((m,k)=>Sc.note(k*E,'mallet',m+o,1500-k*90,{vel:.3+.03*k,bright:.8,pan:-.6+.24*k},['r'+k,1]));
  Sc.note(0,'pluck',38+o,500,{cutoff:360,vel:.5,hp:35});
  /* the image */
  const v=mu.voice('Dm','D4','D5',4).map(m=>m+o), sus=mu.voice('Dsus4','D4','D5',4).map(m=>m+o);
  Sc.note(F,'pluck',38+o,600,{cutoff:380,vel:.55,hp:35});
  if(p.sharp){ Sc.chord(F,'pad',v,2200,{attack:.04,release:1.4,detune:3,cutoff:900+1800*p.lg,vel:.36},['img',1]);
    Sc.note(F,'meet',mu.deg(md,2,5)+o,1900,{spread:28,vel:.55},['lock',1]); Sc.note(F+E,'bell',mu.deg(md,2,6)+o,2200,{vel:.24,ratio:3.5,pan:.25}); }
  else if(p.large){ Sc.chord(F,'pad',sus,2*E*2,{attack:.35,release:.6,detune:8+28*p.blur,cutoff:600+1500*p.lg,vel:.2+.18*p.lg,send:.5+.45*p.blur},['img',.8]);
    Sc.note(F,'glide',mu.deg(md,3,4)+o,F+2400-F,{id:'g3',attack:.3,release:1.2,vel:.3,vibrato:6,tone:1800,send:.5+.45*p.blur,over:'Dsus4'});
    Sc.glide(res,'g3',mu.deg(md,2,4)+o,700); Sc.chord(res,'pad',v,1800,{attack:.5,release:1.2,detune:8+20*p.blur,cutoff:600+1500*p.lg,vel:.2+.16*p.lg,send:.5+.45*p.blur}); }
  else { Sc.chord(F,'mallet',sus.slice(0,3),1300,{vel:.24+.14*p.lg,trem:4},['img',.6]); Sc.chord(res,'mallet',v.slice(0,3),2000,{vel:.24+.14*p.lg,trem:4},['img',.5]); }
  Sc.end(F+2600); return m4_gain(Sc.out(),1.55); }
/* Pinhole: the image chord as this hole would show it (blurred, thin or, at the sharpest hole, the meet); Room depth: the root and fifth
   in the new register, and the motif when the register changes */
function m4_param34(A,st,id,ov,nv){ const now=A.now(); if(!now) return true; const mu=M.music, p=m4_p34(st), o=12*p.oct;
  if(id==='d'){ const was=m4_p34(Object.assign({},st,{d:+ov})).sharp; if(p.sharp&&!was){ A.play('meet',{freq:mu.hz(65+o,'Dm'),spread:28,vel:.5,dur:1.6,when:now+.005}); return true; }
    if(!m4_ok(st,'pd',150)) return true; const v=p.sharp?['D4','F4','A4']:['D4','G4','A4'];
    if(p.small) A.play('mallet',{chord:v.map(n=>mu.hz(mu.midi(n)+o,'Dsus4')),dur:.6,vel:.16+.14*p.lg,trem:4,when:now+.005});
    else A.play('pad',{chord:v.map(n=>mu.hz(mu.midi(n)+o,p.sharp?'Dm':'Dsus4')),dur:.5,attack:.06,release:.35,detune:p.sharp?3:8+28*p.blur,cutoff:600+1500*p.lg,vel:.24+.16*p.lg,send:.4+.5*p.blur,when:now+.005}); return true; }
  if(id==='f'){ const q=m4_p34(Object.assign({},st,{f:+ov})); if(q.oct!==p.oct){ ['A3','D4','F4'].forEach((n,k)=>A.play('mallet',{freq:mu.hz(mu.midi(n)+o,'Dm'),dur:.9,vel:.36,when:now+.005+k*E34/1000})); return true; }
    if(!m4_ok(st,'pf',150)) return true; A.play('mallet',{chord:[mu.hz(50+o,'D'),mu.hz(57+o,'D')],dur:.7,vel:.3,cutoff:1200+800*(4-st.f),when:now+.005}); return true; }
  return false; }
M.piece({ id:'L-34',
  caption:'A dark room in section and its far wall face-on, where the field outside lands upside down. Open the pinhole for more light and blur, or close it for a sharper, dimmer image; the chord locks at the sharpest hole.',
  alt:'A dark plate. Above, a section of a room: a stippled ring field outside at left, a gap in the near wall, dotted rays crossing at the hole and spreading to the far wall. Below, the far wall face-on with the ring field upside down, its red center now at the opposite side, and readings of hole size, blur and light.',
  aspect:w=>w/lay34(w).H,
  state:{d:1.8,f:3},
  controls:[
    {id:'d',type:'range',label:'Pinhole',min:.3,max:8,step:.1,fmt:v=>(+v).toFixed(1)+' mm'},
    {id:'f',type:'range',label:'Room depth',min:2,max:4,step:.1,fmt:v=>(+v).toFixed(1)+' m'}],
  music:m4_music34, musicParam:m4_param34, musicIns:'mallet',
  render(g,w,h,M,st){ g7_blit(g,g7_base34(w,h)); g7_draw34(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ g7_blit(g,g7_base34(w,h)); if(g7_RM()){ g7_draw34(g,w,h,st,null); return false; } return g7_draw34(g,w,h,st,Math.max(0,t)); },
  recipe:{
    idea:'Listening is letting the image in before answering: the hole that gives the clearest picture is small, and it has an exact best size.',
    marks:['ring','blade','center'],
    ground:'night',
    accent:'the field’s red center, which lands on the opposite side once inverted; the sharpest-hole reading turns red when the pinhole is within 12% of it',
    composition:'Section diagram across the top (field outside, near wall with the hole, rays, far wall); the far wall face-on below left, readings right (below on phone).',
    motion:'At 100 BPM: the six rays leave one per eighth, bottom first, each reaching the hole an eighth later and the wall an eighth after; the image exposes in rank order and lands on the downbeat of bar 2, its dots swelling with the chord (the red center with the meet). Reduced motion shows the formed image.',
    sound:'The rays rise as an arpeggio of the loose motif over a room tone as loud as the light, and the image lands as a chord: at the sharpest hole the third arrives at once; too large, blurred and late; too small, thin.',
    controls:['Pinhole 0.3–8 mm','Room depth 2–4 m'],
    computed:['image radius = 0.5 m · f / 15 m, rotated 180°','blur b = d(1 + f/u) + 2.44 λ f / d, λ = 550 nm','sharpest d* = √(2.44 λ f u / (u + f)), from db/dd = 0','light ∝ (d/f)²; dots = N₀ × light relative to d* at 3 m, capped at 2×'],
    placeholder:['object size and distance','the field shown outside'],
    root:'Pinhole images are recorded by many: the Mohist canon (Mozi, 4th c. BCE) on the inverted image; Aristotle’s Problems on round sun spots and eclipse crescents; Ibn al-Haytham (c. 1027) on straight-line light and small holes; Shen Kuo (1088) on inversion. Optimal hole: Petzval 1857, Rayleigh 1891 (1.9√(λf)), Young 1971.',
    rules:['rays are dot lines','blur is spread of dots, never a filter'],
    engine:['M.mirField (captured once)','M.ring','M.rng']
  } });

/* ════════════════════════════════════════════════════════════════════════
   L-35 · The roll: a reply cut as a player-piano roll, read by a tracker bar, with the field breathing in time.
   COMPUTED: the reply is split into syllables (vowel groups); each syllable is one slot. Duration in beats: 1, ×2 on the first
   syllable of a content word, ×2 at a phrase end; a comma rests a beat; each sentence's first stress lands on a 3/4 downbeat.
   Pitch: a falling line per sentence (70 → 62, MIDI), +4 on stressed syllables, −5 at a period, +5 at a question, snapped to
   D pentatonic, then strong notes moved onto the bar's chord. One beat is 0.4 s of roll at tempo 70 (= 7 ft of paper a minute =
   1.4 in/s, a 150 BPM waltz), 9 holes to the inch. Playback at tempo T takes duration × 70 / T. The field follows the heard notes.
   ════════════════════════════════════════════════════════════════════════ */
const P35=g7_pal('paper');
const T35='The roll', D35='A reply cut as a perforated roll: slot length is duration, column is pitch.';
const ROOT35='Root · Votey’s Pianola, 1896; 88-note rolls set at 9 holes to the inch, 1908. Simplified: 24 keys shown.';
const REP35=['That sounds heavy. We can stay with it as long as you like.','You said it plainly, and it held. Do you want to rest here?','Tell me the part you skipped, slowly.'];
const FN35=new Set(['that','we','can','with','it','as','you','the','a','to','do','and','me','here']);
const PENT35=[2,4,6,9,11]; /* D pentatonic: D E F♯ A B */
const BEAT35=.4; /* cut seconds per beat at tempo 70: the roll is a waltz at 150 BPM, quarter-note syllables */
function g7_syl35(w){ const s=w.toLowerCase().replace(/[^a-z]/g,''); if(!s) return 0; let n=(s.match(/[aeiouy]+/g)||[]).length; if(n>1&&/e$/.test(s)&&!/[^aeiou]le$/.test(s)) n--; return Math.max(1,n); }
/* the reply set as a tune: syllables → beats, the speech contour → keys of D pentatonic, sentences phrased onto a 3/4 grid,
   one chord per bar chosen by the tune, strong notes moved onto the chord. The roll is cut from this, so a slot is what sounds. */
function g7_score35(ri){ return g7_slot('score35',ri,()=>{ const mu=M.music, words=REP35[ri].split(/\s+/), sents=[]; { let cur=[]; words.forEach(w=>{ cur.push(w); if(/[.?]$/.test(w)){ sents.push(cur); cur=[]; } }); if(cur.length) sents.push(cur); }
  /* 1. syllables: a stressed syllable (first of a content word) is a half note, a phrase end twice as long; pitch falls across the sentence */
  const S=[]; sents.forEach((sw,si)=>{ const nsyl=sw.reduce((a,w)=>a+g7_syl35(w),0); let k=0;
    sw.forEach((w,wi)=>{ const n=g7_syl35(w), content=!FN35.has(w.toLowerCase().replace(/[^a-z]/g,'')), last=wi===sw.length-1, comma=/,$/.test(w), q=/\?$/.test(w);
      for(let s=0;s<n;s++){ const pos=k/Math.max(1,nsyl-1), fin=(last||comma)&&s===n-1, stress=content&&s===0; let m=70-8*pos+(stress?4:0); if(fin&&last) m+=q?5:-5;
        let best=null; for(let x=Math.floor(m)-3;x<=Math.ceil(m)+3;x++) if(PENT35.includes(((x%12)+12)%12)&&(best==null||Math.abs(x-m)<Math.abs(best-m))) best=x;
        S.push({w,si,wi,m:best,beats:(stress?2:1)*(fin?2:1),stress,fin,comma:comma&&s===n-1,end:last&&s===n-1,q:q&&last&&s===n-1}); k++; } }); });
  /* 2. phrasing: each sentence's first stressed syllable lands on a downbeat (the words before it are its pickup); a stressed syllable that
     would fall on beat 3 waits a beat; sentence ends hold until a beat before the next pickup */
  const BB=3, down=b=>Math.ceil(b/BB-1e-9)*BB, notes=[]; let cur=0, G0=0;
  sents.forEach((sw,si)=>{ const ss=S.filter(x=>x.si===si), p=Math.max(0,ss.findIndex(x=>x.stress)), P=ss.slice(0,p).reduce((a,x)=>a+x.beats,0); let start;
    if(si===0){ G0=down(P+BB)-P; start=0; } else { start=down(G0+cur+1+P)-P-G0; const pv=notes[notes.length-1]; pv.beats=Math.max(pv.beats,start-1-pv.beat); }
    let b=start; ss.forEach((x,j)=>{ if(x.stress&&j>p&&(G0+b)%BB===2){ notes[notes.length-1].beats+=1; b+=1; } notes.push(Object.assign({},x,{beat:b})); b+=x.beats; if(x.comma) b+=1; }); cur=b; });
  const lastN=notes[notes.length-1]; lastN.beats=down(G0+lastN.beat+lastN.beats)-G0-lastN.beat; const end=lastN.beat+lastN.beats, nb=(G0+end)/BB;
  /* 3. harmony: one chord a bar, the one that holds most of the bar's tune (held notes weigh triple); a statement ends on D, a question on A,
     and the bar before an end leans to A */
  const CANDS=['D','G','A','Bm','Em','F#m'], bars=[], onsetIn=(n,j)=>G0+n.beat>=j*BB&&G0+n.beat<(j+1)*BB; let prev='D';
  for(let j=0;j<nb;j++){ const on=notes.filter(n=>onsetIn(n,j)), held=notes.filter(n=>G0+n.beat<j*BB&&G0+n.beat+n.beats>j*BB), en=on.find(n=>n.end), nxEnd=notes.some(n=>n.end&&!n.q&&onsetIn(n,j+1)); let ch=prev;
    if(en) ch=en.q?'A':'D'; else if(on.length){ let best=-1e9; CANDS.forEach((c,ci)=>{ const pcs=mu.parse(c).pcs; let sc=-ci*.01-(c===prev?.4:0)+(nxEnd&&c==='A'?.8:0);
        on.forEach(n=>{ if(pcs.includes(n.m%12)) sc+=Math.min(n.beats,(j+1)*BB-G0-n.beat)+(((G0+n.beat)%BB)===0?1:0); }); held.forEach(n=>{ if(pcs.includes(n.m%12)) sc+=3; }); if(sc>best){ best=sc; ch=c; } }); }
    else if(!held.length&&j*BB<G0) ch='D';
    bars.push(ch); prev=ch; }
  /* 4. the tune on the chords: downbeats, long notes and any note a semitone from the chord move to the nearest chord tone */
  notes.forEach(n=>{ const ch=bars[Math.floor((G0+n.beat)/BB)], pcs=mu.parse(ch).pcs, pc=n.m%12, clash=pcs.some(c=>{ const d=Math.abs(c-pc)%12; return d===1||d===11; });
    if(((G0+n.beat)%BB)===0||n.beats>=2||clash) n.m=mu.snap(ch,n.m); while(n.m>77) n.m-=12; while(n.m<55) n.m+=12; n.ch=ch; });
  const out=notes.map(n=>({t:n.beat*BEAT35,dur:n.beats*BEAT35-.05,m:n.m,word:n.w,beat:n.beat,beats:n.beats,stress:n.stress,fin:n.fin||n.end,end:n.end,q:n.q,si:n.si,ch:n.ch}));
  const wl=[]; notes.forEach((n,i)=>{ if(!i||n.wi!==notes[i-1].wi||n.si!==notes[i-1].si) wl.push({w:n.w,t:n.beat*BEAT35}); });
  return {notes:out,words:wl,dur:end*BEAT35,lead:G0,bars,q:!!lastN.q,ns:sents.length}; }); }
const ROWS35=24, HI35=77; /* keys MIDI 54–77 shown, of 88 */
const lay35=g7_memo(function(w){ const T=g7_tl(w,T35,D35,700), o=T, {ph,pad,inner}=T;
  o.rp=ph?6:11; o.S=o.rp*9; o.pxs=1.4*o.S; o.rx=pad; o.rw=inner; o.ry=T.top+(ph?18:22); o.mt=ph?16:22; o.mb=ph?40:48; o.rh=o.mt+ROWS35*o.rp+o.mb; o.xT=pad+Math.round(inner*(ph?.3:.4));
  let y=o.ry+o.rh+(ph?40:48); o.fy=y; o.fR=ph?58:92;
  if(ph){ o.fx=pad+inner/2; o.fcy=y+o.fR+8; o.sx=pad; o.sy=o.fcy+o.fR+40; y=o.sy+5*30; }
  else { o.fx=pad+o.fR+10; o.fcy=y+o.fR; o.sx=pad+2*o.fR+60; o.sy=y+8; y=Math.max(o.fcy+o.fR+10,o.sy+4*36); }
  o.H=g7_rootL(T,ROOT35,y+(ph?16:24)); return o; });
let g7_FF35=null;
function g7_ff35(){ if(g7_FF35) return g7_FF35; const cap=g7_cap(); M.mirField(cap,{cx:0,cy:0,R:100,k:1,seed:35,pal:{ring:'r',blade:'b',center:'c'},rings:7,dens:1.1,r:.85,strays:6}); return g7_FF35=cap; }
function g7_base35(w,h){ return g7_slot('base35',g7_DK(w,h),()=>{ const L=lay35(w), P=P35, {cv,g}=g7_off(w,h);
  M.fill(g,P.ground); g7_title(g,L,'L-35 · Pairing · player-piano roll','9 holes to the inch · keys 54–77 of 88',T35,P);
  if(L.ph) g7_lab(g,'roll travels ←',L.rx+L.rw,L.ry-10,P.soft,9,{align:'right'}); else g7_lab(g,'the roll travels this way ←',L.rx,L.ry-10,P.soft,9); g7_lab(g,'tracker bar',L.xT,L.ry-10,P.ink,9,{align:'center'});
  return cv; }); }
function g7_draw35(g,w,h,st,t){ const L=lay35(w), P=P35, S=g7_score35(st.reply), live=t!=null, k=st.tempo/70;
  /* tNow: score time under the tracker bar (cut-tempo seconds). Still: 40% through. Live: the vamp (the beats before the first slot), then at tempo. */
  const tNow=live?-S.lead*BEAT35+t/1000*k:(L.ph?Math.min(1.1,S.dur*.4):S.dur*.4), X=s=>L.xT+(s-tNow)*L.pxs, y0=L.ry+L.mt, rowY=m=>y0+(HI35-m)*L.rp+L.rp/2;
  const x0=L.rx, x1=L.rx+L.rw, sp=L.ph?10:16;
  /* paper between the spools, and the spools themselves (wound paper, dense dots) */
  M.fill(g,'#ffffff',x0+sp,L.ry,L.rw-2*sp,L.rh); M.rule(g,x0+sp,L.ry,x1-sp,L.ry,P.hair); M.rule(g,x0+sp,L.ry+L.rh,x1-sp,L.ry+L.rh,P.hair);
  const B=new M.Buf(g);
  /* the leader, with the roll's label: the wordmark (one flat color) and the cut tempo */
  g.save(); g.beginPath(); g.rect(x0+sp,L.ry,L.rw-2*sp,L.rh); g.clip();
  { const xh=L.ph?7:9.5, lw=Math.max(M.logoGeo(0,0,xh).w,g7_tw('reply 1 · tempo 70',g7_monoO(9))), lx=X(-.35)-lw, base=L.ry+L.rh/2+xh/2; if(lx<x1&&lx+lw>x0){ M.logo(g,lx,base,xh,{color:P.ink}); g7_lab(g,'reply '+(st.reply+1)+' · tempo 70',lx,base+(L.ph?16:20),P.soft,9); }
    /* the slots: true voids, so a flat dark fill is the hole showing the spool box behind */
    const dk=g7_mix(P.ink,P.ground,.08); S.notes.forEach((n,i)=>{ const a=X(n.t), b=X(n.t+n.dur); if(b<x0||a>x1) return; const y=rowY(n.m), hh=L.rp*.62, r=hh/2, e=m4_qe(m4_e(st,'n'+i,t,200)); g.fillStyle=e>.05?g7_mix(dk,P.acc,.75*e):dk; g.beginPath(); g.moveTo(a+r,y-r); g.lineTo(b-r,y-r); g.arc(b-r,y,r,-Math.PI/2,Math.PI/2); g.lineTo(a+r,y+r); g.arc(a+r,y,r,Math.PI/2,Math.PI*1.5); g.fill(); });
    /* words printed in the margin, at their onsets */
    { const ends=[-1e9,-1e9]; S.words.forEach(o=>{ const x=X(o.t), ww=g7_tw(o.w,g7_monoO(9,false)); let ln=ends[0]<x-6?0:ends[1]<x-6?1:(ends[0]<ends[1]?0:1); ends[ln]=x+ww; if(x>x0-80&&x<x1) g7_lab(g,o.w,x,L.ry+L.rh-(L.ph?22:26)+ln*(L.ph?13:14),P.soft,9,{upper:false,track:.02}); }); }
    /* the time line in the top margin: a dot every 0.5 s of the cut, numbered each second */
    for(let s=Math.floor(tNow-L.rw/L.pxs);s<tNow+L.rw/L.pxs;s+=.5){ if(s<0||s>S.dur) continue; const x=X(s); if(x<x0+sp+2||x>x1-sp-2) continue; B.dot(x,L.ry+(L.ph?5:7),s%1?.55:.85,s%1?P.dim:P.ink); if(s%1===0&&!L.ph) g7_lab(g,s+' s',x+4,L.ry+(L.ph?9:12),P.soft,9,{upper:false,track:.02}); }
  }
  g.restore();
  /* the tracker bar: a band with one port per key; a port over a slot sounds (red) */
  const sounding=new Set(); let env=0; S.notes.forEach(n=>{ if(tNow>=n.t&&tNow<n.t+n.dur) sounding.add(n.m); const a=tNow-n.t; if(a>=0) env=Math.max(env,a<n.dur?1-.25*a/n.dur:Math.exp(-(a-n.dur)/.18)*.75); });
  /* live, the field breathes with the heard notes (and swells once more with the arrival) */
  if(live&&st._mus) env=Math.min(1,M.music.env(st,'n*',t,260)*.85+M.music.env(st,'arr',t,600));
  const ep=live?m4_qe(M.music.env(st,'n*',t,140)):0;
  /* spools and the tracker bar never move: one cached overlay */
  g7_blit(g,g7_slot('ov35',g7_DK(w,h),()=>{ const o=g7_off(w,h), Bo=new M.Buf(o.g), bw=L.ph?8:12, pr=L.rp*.26;
    g7_jit(Bo,[x0,L.ry-6,x0+sp,L.ry+L.rh+6],1.5,()=>.75,(d,R)=>.55+.12*R(),P.dim,3501); g7_jit(Bo,[x1-sp,L.ry-6,x1,L.ry+L.rh+6],1.5,()=>.75,(d,R)=>.55+.12*R(),P.dim,3502);
    g7_jit(Bo,[L.xT-bw/2,y0-4,L.xT+bw/2,y0+ROWS35*L.rp+4],1.05,(x,y)=>{ const r=Math.round((y-y0-L.rp/2)/L.rp), py=y0+r*L.rp+L.rp/2; return Math.hypot(x-L.xT,y-py)<pr+.6?0:.85; },(d,R)=>.55+.1*R(),P.ink,3510); Bo.flush(); return o.cv; }));
  {
    sounding.forEach(m=>{ const y=rowY(m); B.dot(L.xT,y,L.rp*.26*(1+.7*ep),P.acc); }); }
  /* key marks at the left: every C */
  B.flush(); for(let m=HI35;m>HI35-ROWS35;m--) if(m%12===0) g7_lab(g,'C'+(m/12-1),x0+sp+4,rowY(m)+3,P.soft,9,{upper:false,track:.02});
  /* the field breathes with the envelope: radius and the center ring follow the sounding slots */
  { const F=g7_ff35(), B2=new M.Buf(g), sc=L.fR/100*(1+.06*env), cs=1+.35*env;
    for(let i=0;i<F.X.length;i++){ const c=F.C[i], dx=F.X[i], dy=F.Y[i], rr=Math.hypot(dx,dy), s=c==='c'?L.fR/100*cs*(1+.02*env):sc*(1-.04*env*(1-rr/100)); B2.dot(L.fx+dx*s,L.fcy+dy*s,F.R[i]*(L.ph?.85:1),c==='c'?P.acc:c==='b'?P.blade:P.ink); }
    B2.flush(); g7_lab(g,sounding.size?'sounding':'between notes',L.fx,L.fcy+L.fR+(L.ph?20:24),sounding.size?P.acc:P.soft,9,{align:'center'}); }
  /* readings */
  { const play=S.dur*70/st.tempo, len=S.dur*1.4, rows=[['slots',S.notes.length+' · one per syllable'],['cut at tempo 70','7 ft a minute · 1.4 in/s'],['roll length',len.toFixed(1)+' in · '+(len*2.54).toFixed(0)+' cm'],['plays in',play.toFixed(1)+' s at tempo '+st.tempo+(live?' · '+Math.max(0,tNow*70/st.tempo).toFixed(1)+' s in':'')]];
    if(L.ph) rows.push(['reply','“'+REP35[st.reply]+'”']);
    const rh=L.ph?30:36; rows.forEach((r,i)=>{ const y=L.sy+i*rh; g7_lab(g,r[0],L.sx,y,P.soft,9); const ls=g7_lines(r[1],L.ph?L.inner:L.rw-(L.sx-L.pad),g7_monoO(L.ph?10:11,false)); ls.forEach((l,j)=>M.text(g,l,L.sx,y+15+j*14,Object.assign(g7_monoO(L.ph?10:11,false),{color:P.ink}))); });
    if(!L.ph){ const rx=L.sx+Math.min(420,(L.pad+L.inner-L.sx)*.5); g7_lab(g,'reply',rx,L.sy,P.soft,9); g7_lines('“'+REP35[st.reply]+'”',L.pad+L.inner-rx,g7_dispO(18)).forEach((l,j)=>g7_disp(g,l,rx,L.sy+26+j*26,18,P.ink)); } }
  return live&&t<m4_end35(st); }
/* music · L-35: the roll is a waltz for reed organ. Tempo 70 is 150 BPM in 3/4 (tempo scales it), one syllable a beat, stressed syllables
   half notes, phrase ends held. A vamp bar (oom-pah-pah) sets the time; each sentence's pickup leads to its first stress on a downbeat.
   Under the tune: a plucked bass on 1 (root, and the fifth in alternate bars) and a plucked chord on 2 and 3, one chord a bar from the
   tune itself (D, G, A, Bm, Em, F♯m), a statement ending on D and a question on A. The last sentence is doubled by a glockenspiel an
   octave up. Arrival: the final bar on D with the bass, once; a question gets a bar of answer, D, after the roll runs out. */
function m4_end35(st){ const R=g7_score35(st.reply), k=st.tempo/70, nb=R.bars.length+(R.q?1:0); return nb*3*BEAT35/k*1000+1400; }
function m4_music35(st){ const R=g7_score35(st.reply), mu=M.music, k=st.tempo/70, Sc=mu.score({bpm:150*k,meter:[3,4],ground:'paper'}), bt=Sc.beat, G=b=>b*bt, G0=R.lead, nb=R.bars.length, tag=R.q?1:0, fin=nb-1+tag;
  const bars=R.bars.concat(tag?['D']:[]); Sc.harm(bars.map((c,j)=>[G(3*j),c]));
  /* the waltz: bass on 1, chord on 2 and 3 (the final bar gets the bass, the pad and the bell instead) */
  let pv=null; bars.forEach((c,j)=>{ const root=36+mu.parse(c).pcs[0], b0=G(3*j); pv=mu.voice(c,'A3','A4',3,pv);
    if(j===fin){ Sc.note(b0,'bass',root<40?root+12:root,Math.min(900,bt*2.2),{from:root+5,glide:90,env:2.6,decay:.4,vel:.58},['arr',1]); Sc.chord(b0,'pad',mu.voice(c,'D4','D5',4),bt*3+900,{attack:.05,release:1.4,cutoff:1300,vel:.3}); Sc.note(b0+bt,'bell',mu.ct(c,'F#5',0),2000,{vel:.24,ratio:3.5,pan:.3}); return; }
    Sc.note(b0,'pluck',j%2&&root+7<=47?root+7:root,bt*.9,{cutoff:380,vel:.56,hp:35,pan:-.08});
    [1,2].forEach(q=>Sc.chord(b0+G(q),'pluck',pv,Math.min(160,bt*.4),{cutoff:820,vel:q===1?.36:.32,pan:q===1?-.18:.18})); });
  /* the roll's air: the bar hisses while paper passes */
  Sc.hitSound(G(G0)-60,'noise',{color:.75,level:.014,fade:.2,dur:R.dur/k+.3});
  /* the tune: reed organ, each note exactly as long as its slot crosses the bar */
  const lastS=R.ns-1; R.notes.forEach((n,i)=>{ const t=G(G0+n.beat), d=Math.max(70,n.beats*bt-Math.min(60,bt*.12));
    Sc.note(t,'organ',n.m,d,{attack:.02,release:n.fin?.32:.08,vel:n.stress?.56:.46,vibrato:1.5,detune:3,cutoff:2400,pan:.1},['n'+i,1]);
    if(n.si===lastS&&bt>=240) Sc.note(t,'bell',n.m+12,Math.min(1200,d+300),{vel:.18,ratio:3.5,bright:.8,pan:.28}); });
  /* a breath of the bellows before each sentence */
  R.notes.forEach((n,i)=>{ if(i&&n.si===R.notes[i-1].si) return; Sc.hitSound(Math.max(0,G(G0+n.beat)-bt*.6),'breath',{dur:Math.min(.6,bt*.9/1000*1.2),vel:.22,freq:700}); });
  Sc.end(m4_end35(st)); return m4_gain(Sc.out(),1.5); }
/* Tempo as music: the reply's first bar at the new tempo (bass, then the first three notes of the tune) */
function m4_param35(A,st,id,ov,nv){ if(id!=='tempo') return false; const now=A.now(); if(!now||!m4_ok(st,'pt',280)) return true; const R=g7_score35(st.reply), bt=60/(150*(+nv)/70), c=R.bars[0];
  A.play('pluck',{chord:[m4_hz(38,'D')],dur:bt*.9,cutoff:380,vel:.5,hp:35,when:now+.005});
  R.notes.slice(0,3).forEach((n,i)=>{ const b=n.beat-R.notes[0].beat; A.play('organ',{freq:m4_hz(n.m,R.bars[Math.floor((R.lead+n.beat)/3)]||c),dur:Math.max(.07,Math.min(n.beats,2)*bt-.04),attack:.02,release:.08,vel:.46,vibrato:1.5,cutoff:2400,when:now+.005+b*bt}); });
  return true; }
M.piece({ id:'L-35',
  caption:'Mir’s reply cut as a player-piano roll: each syllable is a slot, its length the duration and its column the pitch. Press Play to hear it pass the tracker bar, or change the tempo or the reply.',
  alt:'A white paper roll running across a light plate between two stippled spools, punched with dark rounded slots at different heights and lengths, words printed along its lower margin and the mindgut wordmark on its leader. A vertical tracker bar with small ports crosses it; ports over slots are red. Below, a ring field and readings of slots, tempo and length.',
  aspect:w=>w/lay35(w).H,
  state:{tempo:70,reply:0},
  controls:[
    {id:'tempo',type:'range',label:'Tempo',min:30,max:140,step:5,fmt:v=>String(v)},
    {id:'reply',type:'select',label:'Reply',play:true,options:REP35.map((r,i)=>({value:i,label:(i+1)+' · '+r.split(' ').slice(0,3).join(' ')+'…'}))}],
  music:m4_music35, musicParam:m4_param35, musicIns:'organ',
  render(g,w,h,M,st){ g7_blit(g,g7_base35(w,h)); g7_draw35(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ g7_blit(g,g7_base35(w,h)); if(g7_RM()){ g7_draw35(g,w,h,st,null); return false; } return g7_draw35(g,w,h,st,Math.max(0,t)); },
  recipe:{
    idea:'Mir’s voice is scheduled before it is heard: a reply is a roll of timed openings, and the field breathes when one passes the bar.',
    marks:['ring','blade','center'],
    ground:'paper',
    accent:'red: what is sounding now, at the tracker ports and the field’s center',
    composition:'A white roll across the full width between two spools, the tracker bar at 40% (30% on phone), the time line in the top margin and the words in the bottom margin; the field and readings below.',
    motion:'The roll advances right to left at the chosen tempo (1.4 in/s at 70, a 150 BPM waltz) after a vamp bar; each slot flashes red as it crosses the tracker bar and the field swells with the heard notes and the arrival. Reduced motion shows the roll 40% through.',
    sound:'The reply is a waltz tune on a reed organ: a syllable a beat, stresses held, each sentence phrased onto the downbeat, over an oom-pah-pah bass and chords drawn from the tune. A statement lands on D with the bass; a question is answered.',
    controls:['Tempo 30–140','Reply (3)'],
    computed:['syllables by vowel groups, one slot each: a beat, two for a stressed syllable, doubled at a phrase end','pitch: a falling line per sentence, snapped to D pentatonic, strong notes moved onto the bar’s chord','phrasing: each sentence’s first stress on a downbeat of 3/4','chord per bar: the candidate holding most of the bar’s tune','roll length = duration × 1.4 in (tempo 70 = 150 BPM)','play time = duration × 70 / tempo'],
    placeholder:['the three replies','the pitch contour rules'],
    root:'Votey’s Pianola, 1896 (Wikipedia, Player piano); Welte paper rolls from 1883; the Buffalo convention of 10 December 1908 set 88-note rolls at 9 holes to the inch; tempo 70 = 7 ft of paper a minute (Wikipedia, Piano roll; MMD, 1908 Buffalo convention).',
    rules:['slots are voids, filled flat with the dark behind the paper','wordmark on the leader only, one flat color, clear space kept'],
    engine:['M.mirField (captured once)','M.logo','M.rule']
  } });

})();
