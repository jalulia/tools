/* agent H pieces · L-36…L-40 · delivery 4: pairings.
   Each piece pairs an analog practice with the Mir behavior that does the same job, and computes one thing for real.
   Figures are placed dots. Hairline M.rule only for structure (sheet edges, label boxes, plate frames).
   Type: Geist 300 for voice, Geist Mono uppercase for labels. The wordmark only via M.logo, one flat color.
   Animated pieces cache a static base per (size, dpr, settings) and draw only what changes per frame.
   Helpers are prefixed h7_. */
(function(){
'use strict';
const M=window.MIR, TAU=Math.PI*2, E=M.ease, cl=M.clamp01, lerp=M.lerp;

/* ── shared helpers ── */
const h7_q=v=>Math.round(v/4)*4;
const h7_dpr=()=>Math.min(3,window.devicePixelRatio||1);
const h7_DK=(w,h)=>w+'x'+h+'@'+h7_dpr();
const h7_RGB=new Map();
function h7_rgb(c){ let v=h7_RGB.get(c); if(v) return v; const s=c.replace('#',''); v=[0,2,4].map(i=>parseInt(s.slice(i,i+2),16)); h7_RGB.set(c,v); return v; }
const h7_MX=new Map();
function h7_mix(a,b,t){ const k=a+b+t; let v=h7_MX.get(k); if(v) return v; const A=h7_rgb(a), B=h7_rgb(b); v='#'+A.map((x,i)=>Math.max(0,Math.min(255,Math.round(x+(B[i]-x)*t))).toString(16).padStart(2,'0')).join(''); h7_MX.set(k,v); return v; }
/* one cache slot per name (each piece exists once on the page) */
const h7_SL={}; function h7_slot(name,key,make){ const s=h7_SL[name]; if(s&&s.key===key) return s.v; const v=make(); h7_SL[name]={key,v}; return v; }
function h7_off(w,h){ const cv=document.createElement('canvas'); return {cv,g:M.canvas(cv,w,h)}; }
function h7_blit(g,cv){ g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(cv,0,0); g.restore(); }
const h7_memo=f=>{ const m=new Map(); return w=>{ const k=w+'@'+h7_dpr(); let v=m.get(k); if(!v){ if(m.size>8) m.clear(); v=f(w); m.set(k,v); } return v; }; };
let h7_MC=null; const h7_ctx=()=>{ if(!h7_MC){ h7_MC=document.createElement('canvas').getContext('2d'); h7_MC.dpr=1; } return h7_MC; };
function h7_tw(s,o){ const g=h7_ctx(), size=o.size||11; g.font=`${o.weight||400} ${size}px ${M.FONT[o.font||'display']}`; const str=o.upper?String(s).toUpperCase():String(s), tr=(o.track||0)*size;
  if('letterSpacing' in g){ g.letterSpacing=tr+'px'; const w=g.measureText(str).width-tr; g.letterSpacing='0px'; return w; } return g.measureText(str).width+tr*(str.length-1); }
const h7_MONO={font:'mono',weight:500,track:.14,upper:true};
const h7_lab=(g,s,x,y,c,size=9.5,o={})=>M.text(g,s,x,y,Object.assign({},h7_MONO,{size,color:c},o));
const h7_lw=(s,size=9.5,o={})=>h7_tw(s,Object.assign({},h7_MONO,{size},o));
const h7_trk=s=>s>=40?-.04:s>=28?-.03:s>=18?-.016:-.004;
const h7_dispO=size=>({font:'display',size,weight:300,track:h7_trk(size)});
const h7_disp=(g,s,x,y,size,c,o={})=>M.text(g,s,x,y,Object.assign(h7_dispO(size),{color:c},o));
function h7_wrap(str,maxW,o){ const out=[]; let line=''; for(const wd of String(str).split(/\s+/)){ const t=line?line+' '+wd:wd; if(line&&h7_tw(t,o)>maxW){ out.push(line); line=wd; } else line=t; } if(line) out.push(line); return out; }
const h7_ROOT={font:'mono',size:9,weight:400,track:.02};
function h7_root(g,lines,x,y,c){ lines.forEach((l,i)=>M.text(g,l,x,y+i*14,Object.assign({color:c},h7_ROOT))); }
function h7_box(g,x0,y0,x1,y1,c){ M.rule(g,x0,y0,x1,y0,c); M.rule(g,x1,y0,x1,y1,c); M.rule(g,x1,y1,x0,y1,c); M.rule(g,x0,y1,x0,y0,c); }
/* stippled line: dpl dots per px, gaussian spread across it */
function h7_seg(B,ax,ay,bx,by,col,o={}){ const L=Math.hypot(bx-ax,by-ay), n=Math.max(2,Math.round(L*(o.dpl||1.1))), R=M.rng(o.seed||3), sp=o.spread??.25, nx=-(by-ay)/(L||1), ny=(bx-ax)/(L||1);
  for(let i=0;i<n;i++){ const t=o.even?i/(n-1):(i+R())/n, k=R.gauss()*sp; if(o.drop&&R()<o.drop) continue; B.dot(ax+(bx-ax)*t+nx*k, ay+(by-ay)*t+ny*k, (o.r||.62)*(.9+R()*.2), col); } }
/* jittered-lattice stipple: stratified, so no salt clumps; cheap for large tone areas */
function h7_lat(B,box,sp,dens,rOf,col,seed){ const [x0,y0,x1,y1]=box, R=M.rng(seed||1);
  for(let y=y0;y<y1;y+=sp) for(let x=x0;x<x1;x+=sp){ const px=x+(.12+.76*R())*sp, py=y+(.12+.76*R())*sp, u=R(), d=dens(px,py); if(d<=0||u>=d) continue; const c=typeof col==='function'?col(px,py,d):col; if(c) B.dot(px,py,rOf(d,R),c); } }
/* a capture buffer: engine calls write into arrays, so a figure can be animated or masked per dot */
function h7_cap(){ return {X:[],Y:[],R:[],C:[], dot(x,y,r,c){ this.X.push(x); this.Y.push(y); this.R.push(r); this.C.push(c); }}; }
/* the title block: id row, display title, one dek line set in Geist 300 */
function h7_T(w,sub,subMax,phW){ const ph=w<(phW||640), pad=ph?16:(w<760?24:32), inner=w-2*pad, ts=ph?30:40, tb=ph?64:76, ss=ph?14:15, slh=ph?19:20;
  const sl=h7_wrap(sub,Math.min(subMax||620,inner),Object.assign(h7_dispO(ss))); return {ph,pad,inner,ts,tb,ss,slh,sub:sl,top:h7_q(tb+(ph?30:34)+(sl.length-1)*slh+(ph?36:44))}; }
function h7_title(g,T,left,right,title,ink,soft){ const y=T.ph?24:28, lw=h7_lab(g,left,T.pad,y,ink,T.ph?9.5:10);
  if(right&&T.pad+lw+32+h7_lw(right)<T.pad+T.inner) h7_lab(g,right,T.pad+T.inner,y,soft,9.5,{align:'right'});
  h7_disp(g,title,T.pad-1,T.tb,T.ts,ink); T.sub.forEach((l,i)=>M.text(g,l,T.pad,T.tb+(T.ph?30:34)+i*T.slh,Object.assign(h7_dispO(T.ss),{color:soft}))); }
/* static render: blit the cached base if it exists; otherwise paint straight into the frame (no offscreen raster on the
   cold path) and build the cache when the browser is idle, ready for the first animation frame */
function h7_baseOr(g,name,key,w,h,paint){ const s=h7_SL[name]; if(s&&s.key===key){ h7_blit(g,s.v); return; } paint(g);
  (window.requestIdleCallback||setTimeout)(()=>{ h7_slot(name,key,()=>{ const o=h7_off(w,h); paint(o.g); return o.cv; }); }); }
function h7_baseGet(name,key,w,h,paint){ return h7_slot(name,key,()=>{ const o=h7_off(w,h); paint(o.g); return o.cv; }); }
const h7_RM=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(_){ return false; } };

/* ── music (agent M4). Each piece composes a score from its own data with M.music; the frame plays it and drives t from the heard clock.
   Visual pairing reads the same score with M.music.env, so it works with sound off. Pointer sounds are tuned to the piece's chord. ── */
function m4_live(){ const a=M.audio; return a&&a.enabled&&a.unlocked?a:null; }
function m4_play(id,ins,o){ const a=m4_live(); if(!a) return null; try{ return a.play(id,ins,o); }catch(e){ console.error(id+' sound',e); return null; } }
function m4_S(st){ let s=st._m4; if(!s){ s={}; try{ Object.defineProperty(st,'_m4',{value:s,enumerable:false,writable:true,configurable:true}); }catch(_){} } return s; }
function m4_ok(st,key,ms){ const s=m4_S(st), now=performance.now(); if(now-(s[key]||-1e9)<ms) return false; s[key]=now; return true; }
const m4_e=(st,k,t,tau)=>t==null?0:M.music.env(st,k,t,tau);
const m4_qe=e=>Math.round(e*8)/8;
const m4_hz=(m,sym)=>M.music.hz(m,sym||'D');
function m4_gain(sc,g){ sc.events.forEach(e=>{ if(e.play) e.opts.gain=(e.opts.gain||1)*g; }); return sc; }

/* ════════════════════════════════════════════════════════════════════════
   L-36 · Pressed and labeled: one kept mark mounted as a herbarium specimen.
   Sheet in millimetres (290 × 420, a common herbarium sheet), scaled by u px/mm.
   COMPUTED: review date = last mention + the retention rule's days (UTC calendar arithmetic).
   The specimen is a pressed Mir mark: engraved rings (M.ring), blades (blue-noise), the red center. Its strays are not on
   the sheet: loose fragments go into the fragment packet, as in herbarium practice. Paper strips mask the dots they cover.
   ════════════════════════════════════════════════════════════════════════ */
const P36=M.PAL.paper, C36={ground:P36.ground, stock:'#ffffff', ink:P36.ink, soft:h7_mix(P36.ground,P36.ink,.64), dim:h7_mix(P36.ground,P36.ink,.4),
  hair:h7_mix(P36.ground,P36.ink,.2), fib:h7_mix('#ffffff',P36.ink,.13), shade:h7_mix('#ffffff',P36.ink,.3), blade:P36.blade, acc:P36.center};
const SP36=[
  {said:'the call with my brother', where:'session · Tue 14 Oct', kept:'you asked me to', theme:'family', col:'2026-10-14', last:'2026-10-21', no:'0412', acc:'004127', strays:6, rings:4, nb:8, seed:3601, rot:-.32},
  {said:'sleep is better on Sundays', where:'session · Sat 3 Oct', kept:'it came up three times', theme:'rest', col:'2026-10-03', last:'2026-10-19', no:'0398', acc:'004113', strays:3, rings:5, nb:7, seed:3617, rot:.4},
  {said:'the move in March', where:'session · Thu 24 Sep', kept:'you said it matters', theme:'home', col:'2026-09-24', last:'2026-09-30', no:'0371', acc:'004086', strays:9, rings:3, nb:6, seed:3631, rot:1.1}];
const T36='Pressed and labeled';
const SUB36='One kept mark, mounted like a specimen, held by paper strips, labeled and given a review date.';
const ROOT36='Root · Luca Ghini, 1544: plants pressed between paper, then glued to card. Simplified: label fields.';
const h7_day=s=>{ const [y,m,d]=s.split('-').map(Number); return Date.UTC(y,m-1,d); };
const h7_iso=t=>new Date(t).toISOString().slice(0,10);
const h7_WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
/* the retention rule, computed: review on (last mention + days) */
function h7_review36(S,days){ const t=h7_day(S.last)+days*864e5; return {iso:h7_iso(t), wd:h7_WD[new Date(t).getUTCDay()]}; }
const lay36=h7_memo(function(w){ const T=h7_T(w,SUB36,520,480), o=Object.assign({},T), {ph,pad,inner}=T;
  o.sx=pad; o.sw=inner; o.u=inner/290; o.sy=T.top; o.sh=h7_q(inner*420/290);
  const u=o.u, X=mm=>o.sx+mm*u, Y=mm=>o.sy+mm*u; o.X=X; o.Y=Y; o.m=Math.max(12,16*u);
  /* label, lower right; a determination slip above it */
  o.lw=ph?Math.round(o.sw-2*o.m):Math.round(Math.max(124*u,214)); o.lx=o.sx+o.sw-o.m-o.lw; o.kw=h7_lw('Mentioned',9)+12; o.vw=o.lw-24-o.kw;
  o.rows=SP36.map(S=>{ const vals=[['No.',S.no],['Said','“'+S.said+'”'],['Where',S.where],['Kept',S.kept],['Collected',S.col],['Mentioned',S.last],['Review','']];
    return vals.map(([k,v])=>({k,v,L:v?h7_wrap(v,o.vw,{size:10.5,weight:400}):['']})); });
  o.lhMax=Math.max(...o.rows.map(r=>r.reduce((s,x)=>s+x.L.length*13+6,0)));
  o.lh=h7_q(32+o.lhMax+8); o.ly=o.sy+o.sh-o.m-o.lh; o.dh=34; o.dw=Math.round(Math.min(o.lw,Math.max(o.lw*.7,h7_lw('Det.',9)+34+Math.max(...SP36.map(S=>h7_tw(S.theme+' · Mir · '+S.last,{font:'mono',size:9.5,weight:400,track:.02})))))); o.dx=o.lx+o.lw-o.dw; o.dy=o.ly-12-o.dh;
  /* packet and accession stamp, top corners */
  o.pk=[X(16),Y(16),Math.max(64*u,96),Math.max(40*u,58)];
  o.stw=Math.max(56*u,104); o.st=ph?[o.pk[0],o.pk[1]+o.pk[3]+12,o.pk[2],26]:[o.sx+o.sw-o.m-o.stw,Y(16),o.stw,Math.max(16*u,26)];
  /* the specimen sits between the packet and the slips; on a phone, beside the packet and stamp */
  if(ph){ const x0=o.pk[0]+o.pk[2]+8, x1=o.sx+o.sw-o.m, top=o.sy+o.m, bot=o.dy-12; o.R=Math.min((x1-x0)/2*.86,(bot-top)/2*.86); o.cx=(x0+x1)/2; o.cy=(top+bot)/2; }
  else { const top=o.pk[1]+o.pk[3]+10, bot=o.dy-14; o.R=Math.min(o.sw*.4,(bot-top)/2*.94); o.cx=o.sx+o.sw*.5; o.cy=(top+bot)/2; }
  o.bar=ph?[o.pk[0],o.st[1]+o.st[3]+28]:[X(16),o.sy+o.sh-o.m-6];
  let y=o.sy+o.sh+30; o.ruleY=y; o.ruleL=ph?2:1; y+=o.ruleL*16+12;
  o.root=h7_wrap(ROOT36,inner,h7_ROOT); o.rootY=y+10; o.H=h7_q(o.rootY+(o.root.length-1)*14+pad); return o; });
/* the pressed mark, captured as dots (so the mount animation and the strip masks can work per dot) */
function h7_spec36(L,si){ return h7_slot('spec36',L.sw+'|'+L.sh+'|'+si+'|'+h7_dpr(),()=>{ const S=SP36[si], C=h7_cap(), R0=L.R, cx=L.cx, cy=L.cy, ex=1, ey=.84, rot=S.rot, cr=Math.cos(rot), sr=Math.sin(rot);
  const rr=M.rng(S.seed);
  for(let i=1;i<=S.rings;i++){ const Ri=R0*(.16+.4*i/S.rings); M.ring(C,{cx,cy,R:Ri,w:2+.8*i/S.rings,swell:.5,dpl:1.75,rCore:.85,rEdge:.5,seed:S.seed+i*7,color:C36.ink,wobble:.02,ex,ey,rot}); }
  /* blades: lenses reaching out past the rings, one folded short in the press */
  const fold=(rr()*S.nb)|0, bl=[];
  for(let b=0;b<S.nb;b++){ const a=b/S.nb*TAU+rr()*.25, r1=R0*(b===fold?.7:.92+rr()*.1); bl.push(M.shape.blade(0,0,a,R0*.6,r1,R0*.13)); }
  const f=M.shape.max(...bl);
  h7_lat(C,[cx-R0*1.05,cy-R0*1.05,cx+R0*1.05,cy+R0*1.05],1.3,(x,y)=>{ const dx=x-cx, dy=y-cy, r2=dx*dx+dy*dy; if(r2<R0*R0*.3) return 0; const lx=(dx*cr+dy*sr)/ex, ly=(-dx*sr+dy*cr)/ey; return f(lx,ly)*.86; },(d,R)=>.55+.28*R(),C36.blade,S.seed+11);
  M.ring(C,{cx,cy,R:R0*.075,w:1.4,swell:.2,dpl:1.6,rCore:.85,rEdge:.6,seed:S.seed+3,color:C36.acc,ex:1.05,ey:.9,rot});
  /* strips: across three blades, perpendicular to them */
  const strips=[0,Math.round(S.nb/3),Math.round(2*S.nb/3)].map((b,i)=>{ const a=b/S.nb*TAU+.12, rm=R0*.8, lx=Math.cos(a)*rm, ly=Math.sin(a)*rm*ey, px=cx+lx*cr-ly*sr, py=cy+lx*sr+ly*cr, ang=a+rot+Math.PI/2;
    return {x:px,y:py,a:ang,l:Math.max(R0*.36,30),w:Math.max(R0*.075,6)}; });
  /* each dot settles with its band (center outward, one band per ring), a few ms apart inside the band */
  const n=C.X.length, ox=new Float32Array(n), oy=new Float32Array(n), dl=new Float32Array(n), bd=new Uint8Array(n), R2=M.rng(S.seed+29);
  for(let i=0;i<n;i++){ const dx=C.X[i]-cx, dy=C.Y[i]-cy, d=Math.hypot(dx,dy)||1, k=(10+R2()*26)*(1+d/R0*.5), a=Math.atan2(dy,dx)+(R2()-.5)*1.2; ox[i]=Math.cos(a)*k; oy[i]=Math.sin(a)*k; dl[i]=R2(); bd[i]=Math.min(S.rings-1,Math.floor(Math.min(.999,d/(R0*1.05))*S.rings)); }
  return {C,strips,ox,oy,dl,bd}; }); }
const h7_inStrip=(s,x,y,pad)=>{ const c=Math.cos(s.a), si=Math.sin(s.a), dx=x-s.x, dy=y-s.y, u=dx*c+dy*si, v=-dx*si+dy*c; return Math.abs(u)<s.l/2+pad&&Math.abs(v)<s.w/2+pad; };
function h7_strip36(B,s,seed,k){ const c=Math.cos(s.a), si=Math.sin(s.a), P=(u,v)=>[s.x+u*c-v*si, s.y+u*si+v*c], hl=s.l/2, hw=s.w/2, R=M.rng(seed);
  /* the strip's edges (crisp), a shade edge on the lower side (it has thickness), and a few fibers inside */
  const e=[[-hl,-hw,hl,-hw],[hl,-hw,hl,hw],[hl,hw,-hl,hw],[-hl,hw,-hl,-hw]];
  e.forEach(([a,b,c2,d],i)=>{ const p=P(a,b), q=P(c2,d); h7_seg(B,p[0],p[1],q[0],q[1],C36.dim,{seed:seed+i,dpl:1.3*k,spread:.12,r:.52,even:true}); });
  { const p=P(-hl+1,hw+1), q=P(hl+1,hw+1); h7_seg(B,p[0],p[1],q[0],q[1],C36.shade,{seed:seed+9,dpl:.9*k,spread:.15,r:.5}); }
  const nf=Math.round(s.l*s.w*.05*k); for(let i=0;i<nf;i++){ const p=P((R()-.5)*s.l*.92,(R()-.5)*s.w*.8); B.dot(p[0],p[1],.5,C36.fib); } }
function h7_base36(st,w,h){ return h7_slot('base36',h7_DK(w,h)+'|'+st.spec+'|'+st.days,()=>{ const L=lay36(w), S=SP36[st.spec], {cv,g}=h7_off(w,h), u=L.u;
  M.fill(g,C36.ground); h7_title(g,L,'L-36 · Pairing · herbarium sheet','sheet 29 × 42 cm',T36,C36.ink,C36.soft);
  /* the sheet: white stock on the white page, held by a hairline */
  M.fill(g,C36.stock,L.sx,L.sy,L.sw,L.sh); h7_box(g,L.sx,L.sy,L.sx+L.sw,L.sy+L.sh,C36.hair);
  const B=new M.Buf(g);
  /* fragment packet: a folded paper envelope; the flap's folds are its two diagonals */
  { const [x,y,pw,phh]=L.pk; h7_seg(B,x,y,x+pw,y,C36.dim,{seed:3651,dpl:1.3,spread:.12,r:.52,even:true}); h7_seg(B,x+pw,y,x+pw,y+phh,C36.dim,{seed:3652,dpl:1.3,spread:.12,r:.52,even:true});
    h7_seg(B,x+pw,y+phh,x,y+phh,C36.dim,{seed:3653,dpl:1.3,spread:.12,r:.52,even:true}); h7_seg(B,x,y+phh,x,y,C36.dim,{seed:3654,dpl:1.3,spread:.12,r:.52,even:true});
    h7_seg(B,x,y,x+pw/2,y+phh*.5,C36.hair,{seed:3655,dpl:1,spread:.12,r:.5}); h7_seg(B,x+pw,y,x+pw/2,y+phh*.5,C36.hair,{seed:3656,dpl:1,spread:.12,r:.5});
    h7_seg(B,x+1.5,y+phh+1.2,x+pw+1.2,y+phh+1.2,C36.shade,{seed:3657,dpl:.8,spread:.15,r:.5}); }
  /* accession stamp: an inked frame with the drop-outs a rubber stamp leaves */
  { const [x,y,sw,sh]=L.st; [[x,y,x+sw,y],[x+sw,y,x+sw,y+sh],[x+sw,y+sh,x,y+sh],[x,y+sh,x,y]].forEach((s,i)=>h7_seg(B,s[0],s[1],s[2],s[3],C36.ink,{seed:3660+i,dpl:1.5,spread:.3,r:.62,drop:.14})); }
  /* scale bar, 5 cm in 1 cm blocks */
  { const [x,y]=L.bar, cm=10*u; for(let i=0;i<5;i++){ const x0=x+i*cm; if(i%2===0) h7_lat(B,[x0,y-3.2,x0+cm,y],.95,()=>.9,()=>.5,C36.ink,3670+i); else { h7_seg(B,x0,y-3.2,x0+cm,y-3.2,C36.ink,{seed:3680+i,dpl:1.4,spread:.08,r:.45,even:true}); h7_seg(B,x0,y,x0+cm,y,C36.ink,{seed:3690+i,dpl:1.4,spread:.08,r:.45,even:true}); } } }
  B.flush();
  { const [x,y,pw,phh]=L.pk; h7_lab(g,'Fragments',x+8,y+phh-20,C36.soft,9); h7_lab(g,S.strays+' strays',x+8,y+phh-8,C36.ink,9); }
  { const [x,y,sw,sh]=L.st; M.text(g,'ACC '+S.acc,x+sw/2,y+sh/2+3.5,{font:'mono',size:10.5,weight:500,track:.12,color:C36.ink,align:'center'}); }
  { const [x,y]=L.bar; h7_lab(g,'0',x,y+13,C36.soft,9); h7_lab(g,'5 cm',x+50*u,y+13,C36.soft,9,{align:'right'}); }
  /* determination slip: the later annotation that names what the specimen is */
  M.fill(g,C36.stock,L.dx,L.dy,L.dw,L.dh); h7_box(g,L.dx,L.dy,L.dx+L.dw,L.dy+L.dh,C36.hair);
  h7_lab(g,'Det.',L.dx+10,L.dy+21,C36.soft,9); M.text(g,S.theme+' · Mir · '+S.last,L.dx+10+h7_lw('Det.',9)+10,L.dy+21,{font:'mono',size:9.5,weight:400,track:.02,color:C36.ink});
  /* the collector's label */
  { const x=L.lx, y=L.ly; M.fill(g,C36.stock,x,y,L.lw,L.lh); h7_box(g,x,y,x+L.lw,y+L.lh,C36.hair);
    const geo=M.logo(g,x+12,y+19,7.5,{color:C36.ink}); h7_lab(g,'Kept marks',x+12+geo.w+Math.max(10,geo.clear*2),y+19,C36.soft,9);
    M.rule(g,x+12,y+28,x+L.lw-12,y+28,C36.hair);
    const rv=h7_review36(S,st.days); let yy=y+44;
    L.rows[st.spec].forEach(r=>{ const rev=r.k==='Review'; if(rev){ M.rule(g,x+12,yy-11,x+L.lw-12,yy-11,C36.hair); yy+=3; }
      h7_lab(g,r.k,x+12,yy,C36.soft,9);
      if(rev) M.text(g,rv.iso+' · '+rv.wd,x+12+L.kw,yy,{font:'mono',size:10.5,weight:500,track:.02,color:C36.ink});
      else r.L.forEach((l,i)=>M.text(g,l,x+12+L.kw,yy+i*13,{size:10.5,weight:400,color:C36.ink}));
      yy+=r.L.length*13+6; }); }
  /* the rule, under the sheet */
  { const rv=h7_review36(S,st.days), a='Retention · review '+st.days+' days after the last mention', b=S.last+' + '+st.days+' d = '+rv.iso;
    if(L.ph){ h7_lab(g,a,L.pad,L.ruleY,C36.soft,9); h7_lab(g,b,L.pad,L.ruleY+16,C36.ink,9); } else { h7_lab(g,a,L.pad,L.ruleY,C36.soft,9); h7_lab(g,b,L.pad+L.inner,L.ruleY,C36.ink,9,{align:'right'}); } }
  h7_root(g,L.root,L.pad,L.rootY,C36.soft); return cv; }); }
function h7_draw36(g,w,h,st,t){ const L=lay36(w), Sp=h7_spec36(L,st.spec), C=Sp.C, n=C.X.length, live=t!=null, T=live?t:1e9, nR=SP36[st.spec].rings;
  /* 100 BPM: band b lands on its eighth (the descending arpeggio), the strips go down on sixteenths before the stamp's downbeat;
     a dot under a strip is hidden once that strip is down. Each band swells as its note sounds. */
  const down=Sp.strips.map((s,i)=>T>=STRIP36+i*E36/2), B=new M.Buf(g), eb=[], ebl=live?m4_qe(m4_e(st,'bell',t,700)):0; for(let b=0;b<nR;b++) eb.push(live?m4_qe(m4_e(st,'b'+b,t,200)):0);
  for(let i=0;i<n;i++){ let x=C.X[i], y=C.Y[i], r=C.R[i]; const b=Sp.bd[i];
    if(live){ const ld=h7_land36(nR,b), s0=Math.max(0,ld-2*E36)+Sp.dl[i]*45, e=E.outCubic(cl((T-s0)/(ld-s0))); if(e<=0) continue; x+=Sp.ox[i]*(1-e); y+=Sp.oy[i]*(1-e); r*=1+.6*eb[b]; }
    if(live&&C.C[i]===C36.acc) r*=1+.7*ebl;
    let hid=false; for(let s=0;s<3;s++) if(down[s]&&h7_inStrip(Sp.strips[s],x,y,.6)){ hid=true; break; } if(!hid) B.dot(x,y,r,C.C[i]); }
  Sp.strips.forEach((s,i)=>{ if(down[i]) h7_strip36(B,s,3700+i*13,1+(live?1.2*m4_e(st,'s'+i,t,160):0)); });
  /* the accession stamp answers the downbeat: its frame inked again, heavier */
  const es=live?m4_qe(m4_e(st,'stamp',t,280)):0; if(es>.05){ const [x,y,sw,sh]=L.st; [[x,y,x+sw,y],[x+sw,y,x+sw,y+sh],[x+sw,y+sh,x,y+sh],[x,y+sh,x,y]].forEach((q,i)=>h7_seg(B,q[0],q[1],q[2],q[3],C36.ink,{seed:3664+i,dpl:1.5,spread:.3+.5*es,r:.62+.5*es,drop:.14})); }
  B.flush(); }
/* music · L-36: pressing as a ritual, 100 BPM 4/4. Under a soft G major 7 (IV), the mark's rings settle from the center out, each
   ring band landing on an eighth as one note of a slow descending arpeggio (the specimen sets the motif: where it starts and how many
   rings it has); the three strips go down as paper and press taps on sixteenths; the stamp lands on the downbeat of bar 2 with a thud
   and the D chord (a plagal amen), the bell on F♯ for the red center. Retention is how long that chord rings, and how much air it has. */
const BPM36=100, E36=60000/BPM36/2, STAMP36=8*E36, STRIP36=STAMP36-2*E36;
const h7_land36=(nR,b)=>STRIP36-(nR-b)*E36;
const TOP36=['D6','F#5','B5'];
function m4_ring36(days){ return {dur:.9+days/30*.85, send:.2+.45*days/180}; }
function m4_music36(st){ const S=SP36[st.spec], nR=S.rings, mu=M.music, Sc=mu.score({bpm:BPM36,meter:[4,4],ground:'paper'}), rg=m4_ring36(st.days);
  Sc.harm([[0,'Gmaj7'],[STAMP36,'D']]);
  Sc.chord(40,'pad',mu.voice('Gmaj7','G3','G4',4),STAMP36,{attack:.7,release:.4,cutoff:900,vel:.34});
  Sc.hitSound(30,'paper',{dur:.5,vel:.16,freq:2600});
  /* the rings land: a descending arpeggio of Gmaj7 from the specimen's top note */
  const lad=mu.tones('Gmaj7','D4',TOP36[st.spec]).reverse(); for(let b=0;b<nR;b++) Sc.note(h7_land36(nR,b),'mallet',lad[Math.min(lad.length-1,b)],1600,{vel:.5-.03*b,trem:4.5,bright:.8,pan:(b%2?.2:-.2)},['b'+b,1]);
  /* strips: paper and press, on sixteenths, panned where they lie */
  [0,Math.round(S.nb/3),Math.round(2*S.nb/3)].forEach((bb,i)=>{ const t=STRIP36+i*E36/2, a=bb/S.nb*TAU+.12, pan=Math.cos(a+S.rot)*.6, fa=(((a+S.rot+Math.PI/2)%Math.PI)+Math.PI)%Math.PI;
    Sc.hitSound(t,'paper',{dur:.12,vel:.4,pan,freq:2400+1600*fa/Math.PI},['s'+i,1]); Sc.hitSound(t,'tap',{vel:.4,pan}); });
  /* the stamp: a downbeat thud and the chord, ringing as long as the memory is kept */
  Sc.hitSound(STAMP36,'stamp',{vel:.6},['stamp',1]); Sc.note(STAMP36,'pluck','D2',500,{cutoff:380,vel:.55,hp:35});
  Sc.chord(STAMP36,'mallet',['D4','F#4','A4','D5'],rg.dur*1000,{vel:.42,trem:4.5,send:rg.send}); Sc.chord(STAMP36,'pad',['A3','D4','F#4'],rg.dur*1000*.8,{attack:.05,release:rg.dur*.5,cutoff:1100,vel:.34,send:rg.send});
  Sc.note(STAMP36+E36,'bell','F#5',rg.dur*1000+600,{vel:.26,ratio:3.5,pan:.2,send:rg.send},['bell',1]);
  Sc.end(STAMP36+rg.dur*1000+800); return m4_gain(Sc.out(),1.9); }
/* Retention as music: the stamp's chord, ringing for the new length */
function m4_param36(A,st,id,ov,nv){ if(id!=='days') return false; const now=A.now(); if(!now||!m4_ok(st,'pd',150)) return true; const rg=m4_ring36(+nv);
  A.play('stamp',{vel:.4,when:now+.005}); A.play('mallet',{chord:['D4','F#4','A4'].map(n=>m4_hz(n,'D')),dur:rg.dur,vel:.36,trem:4.5,send:rg.send,when:now+.005}); A.play('bell',{freq:m4_hz('F#5','D'),dur:rg.dur+.4,vel:.22,ratio:3.5,send:rg.send,when:now+.15}); return true; }
M.piece({ id:'L-36',
  caption:'A kept memory mounted like a herbarium specimen, with paper strips, a collector’s label, a determination slip and an accession stamp. Change the retention rule and the review date on the label moves.',
  alt:'A white herbarium sheet with a small pressed figure of stippled rings, teal blades and a red center, held by three paper strips. A folded fragment packet sits top left, an accession stamp top right, and a label with the wordmark, a determination slip and a 5 cm scale bar along the bottom.',
  recipe:{
    idea:'Keeping is curation: a kept memory has a collector, a date, a reason and a review date, the way a specimen does.',
    marks:['ring','blade','center','stray'],
    ground:'paper',
    accent:'the pressed mark’s center, red: where the two of you met',
    composition:'A 29 × 42 cm sheet fills the width; packet and stamp at the top corners, the mark in the middle, slip and label stacked lower right, scale bar lower left.',
    motion:'At 100 BPM: the mark settles ring by ring from the center out, each band landing on an eighth and swelling with its note; the three strips go down on sixteenths; the stamp inks again on the downbeat of bar 2. Reduced motion shows the mounted sheet.',
    sound:'A ritual over G major 7: each ring lands as a note of a descending arpeggio (the specimen’s motif), the strips are paper and press on sixteenths, and the stamp is a downbeat thud and a D chord that rings as long as the retention.',
    controls:['Specimen (3)','Retention 30–180 days'],
    computed:['review date = last mention + retention days (UTC date arithmetic)'],
    placeholder:['what was said, where, why kept, dates, numbers','theme names'],
    root:'Luca Ghini, Pisa, 1544: the first recorded herbarium (hortus siccus), plants pressed between paper and glued to card. Records differ: Ghini’s sheets do not survive; his student Gherardo Cibo’s herbarium (c. 1532) is the earliest surviving one named in the same source. Source: en.wikipedia.org/wiki/Luca_Ghini',
    rules:['the sheet and slips are neutral white (#ffffff on #fafafa), never cream','strays go in the fragment packet, not on the sheet','strips hide the dots under them','wordmark on the label only, one flat color'],
    engine:['M.ring','M.blue','M.shape.blade','M.logo','M.rule','M.Buf']},
  aspect:w=>w/lay36(w).H,
  state:{spec:0,days:90},
  controls:[{id:'spec',type:'select',label:'Specimen',play:true,options:SP36.map((S,i)=>({value:i,label:S.no+' · '+S.theme}))},
    {id:'days',type:'range',label:'Retention',min:30,max:180,step:15,fmt:v=>v+' days'}],
  music:m4_music36, musicParam:m4_param36, musicIns:'mallet',
  render(g,w,h,M,st){ h7_blit(g,h7_base36(st,w,h)); h7_draw36(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ t=Math.max(0,t); h7_blit(g,h7_base36(st,w,h)); if(h7_RM()){ h7_draw36(g,w,h,st,null); return false; } h7_draw36(g,w,h,st,t); return t<STAMP36+m4_ring36(st.days).dur*1000+300; } });


/* ════════════════════════════════════════════════════════════════════════
   L-37 · Setting the line: a composing stick in plan view; the reply set in sorts, line by line, justified, then proofed.
   The faces of sorts are mirror images; set nick up, they read upside down from the compositor's side
   (mirror + half turn = a vertical flip per glyph, order left to right).
   COMPUTED: set width of each sort = Geist 600 advance at 18 pt (no kerning, as in metal). Lines break greedily at the
   measure with a 4-em minimum word space. Each line but the last is justified: space added per gap =
   (measure − set width) / gaps, with its nearest make-up from up to three standard spaces (em, en, 3-em, 4-em, 5-em, hair).
   The last line is set with 3-em spaces and filled out with quads.
   ════════════════════════════════════════════════════════════════════════ */
const P37=M.PAL.olive, C37={ground:P37.ground, ink:P37.ink, soft:h7_mix(P37.ground,P37.ink,.6), dim:h7_mix(P37.ground,P37.ink,.4), hair:h7_mix(P37.ground,P37.ink,.2),
  steel:h7_mix(P37.ground,P37.ink,.22), steel2:h7_mix(P37.ground,P37.ink,.36), body:h7_mix(P37.ground,P37.ink,.3), quad:h7_mix(P37.ground,P37.ink,.17), acc:P37.center, paper:'#fafafa'};
const LN37=['I kept the part about Sunday. Say more when you are ready, and I will hold it.','Rest first, then the move. The call can wait until the morning.','That stays with me. Tuesday found its place, next to the walk.'];
const LNAME37=['about Sunday','rest first','that stays'];
const PT37=18, MIN37=4.5, SPC37=[['em',18],['en',9],['3-em',6],['4-em',4.5],['5-em',3.6],['hair',1]];
const T37='Setting the line';
const SUB37='A reply set in sorts, upside down and backward, then spaced out to fill the measure.';
const ROOT37='Root · Moxon, 1683: the compositor adds spaces until the line fills the stick. Simplified: no kerning.';
const h7_em37=new Map();
function h7_adv37(ch){ let v=h7_em37.get(ch); if(v!=null) return v; const g=h7_ctx(); g.font='600 100px '+M.FONT.display; if('letterSpacing' in g) g.letterSpacing='0px'; v=g.measureText(ch).width/100; h7_em37.set(ch,v); return v; }
const h7_ww37=w=>{ let s=0; for(const ch of w) s+=h7_adv37(ch)*PT37; return s; };
/* make-up: up to three standard spaces whose sum is closest to the gap (fewest pieces on ties); Moxon calls more than three poor work */
function h7_make37(per){ let best=null; const V=SPC37.map(x=>x[1]), m=V.length;
  for(let a=0;a<m;a++) for(let b=a;b<=m;b++) for(let c=b;c<=m;c++){ const pick=[a,b,c].filter(i=>i<m), s=pick.reduce((t,i)=>t+V[i],0), n=pick.length, err=Math.abs(s-per);
    if(!best||err<best.err-1e-9||(Math.abs(err-best.err)<1e-9&&n<best.n)) best={err,n,s,pick}; }
  return {s:best.s,parts:best.pick.map(i=>SPC37[i])}; }
/* the justification, computed: greedy breaks, then the space each gap needs */
function h7_set37(li,picas){ return h7_slot('set37|'+li,picas+'|'+(h7_em37.get('a')||0),()=>{ const M_pt=picas*12, words=LN37[li].split(' '), lines=[]; let cur=[];
  const fit=ws=>ws.reduce((t,w)=>t+h7_ww37(w),0)+(ws.length-1)*MIN37<=M_pt;
  for(const w of words){ if(cur.length&&!fit(cur.concat([w]))){ lines.push(cur); cur=[w]; } else cur.push(w); } if(cur.length) lines.push(cur);
  return {M_pt,lines:lines.map((ws,i)=>{ const sw=ws.reduce((t,w)=>t+h7_ww37(w),0), gaps=ws.length-1, last=i===lines.length-1, per=last||!gaps?6:(M_pt-sw)/gaps;
    return {ws,sw,gaps,last,per,make:last?null:h7_make37(per),wide:!last&&per>PT37*.75,quad:last?M_pt-sw-gaps*6:0}; })}; }); }
const lay37=h7_memo(function(w){ const T=h7_T(w,SUB37,520,480), o=Object.assign({},T), {ph,pad,inner}=T;
  /* the stick: 30 picas = 360 pt across its inner length; room for the most lines any reply needs at the narrowest measure */
  o.hx=pad+(ph?10:14); o.len=inner-(ph?34:46); o.s=o.len/360; o.body=PT37*o.s; o.nl=Math.max(...LN37.map((_,i)=>h7_set37(i,20).lines.length));
  o.labY=T.top; o.scY=T.top+28; o.sy=o.scY+20; o.flH=Math.max(7,o.body*.3); o.trayY=o.sy+o.flH; o.lineY=o.trayY+Math.max(6,o.body*.25);
  o.trayH=o.nl*o.body+Math.max(14,o.body*.55); o.sy1=o.trayY+o.trayH; let y=o.sy1+(ph?40:40);
  o.pfY=y; o.pfH=o.nl*o.body*1.12+(ph?44:48); y+=o.pfH+30;
  o.rdY=y; o.colW=ph?inner:(inner-24)/2; o.rdRows=ph?o.nl+1:Math.ceil((o.nl+1)/2); y=o.rdY+o.rdRows*34+8;
  o.root=h7_wrap(ROOT37,inner,h7_ROOT); o.rootY=y+14; o.H=h7_q(o.rootY+(o.root.length-1)*14+pad); return o; });
/* a glyph's face as dots: render the glyph once at device resolution, sample its coverage on a jittered lattice */
function h7_face37(ch,px){ return h7_slot('face37|'+ch,px+'@'+h7_dpr(),()=>{ const d=h7_dpr(), W=Math.ceil(px*1.2*d)+4, H=Math.ceil(px*1.3*d)+4, c=document.createElement('canvas'); c.width=W; c.height=H; const q=c.getContext('2d');
  q.font=`600 ${px*d}px ${M.FONT.display}`; q.fillStyle='#000'; q.textBaseline='alphabetic'; q.fillText(ch,2,Math.round(px*.98*d)+2); const a=q.getImageData(0,0,W,H).data;
  const sp=px>22?.95:.82, R=M.rng(ch.charCodeAt(0)*31+7), out=[];
  for(let y=0;y<H/d;y+=sp) for(let x=0;x<W/d;x+=sp){ const px2=x+(.15+.7*R())*sp, py=y+(.15+.7*R())*sp, ix=(px2*d)|0, iy=(py*d)|0; if(ix<W&&iy<H&&a[(iy*W+ix)*4+3]>110) out.push(px2-2/d,py-2/d); }
  return {pts:out}; }); }
/* sort positions per line: setting uses a 3-em word space; justifying opens each gap to the computed value */
function h7_pos37(J,s,x0,ju){ const out=[]; J.lines.forEach((Ln,li)=>{ let x=x0; const gap=Ln.last?6:lerp(6,Ln.per,ju);
  Ln.ws.forEach((wd,wi)=>{ if(wi){ out.push({sp:true,li,x,w:gap*s,make:Ln.make}); x+=gap*s; } for(const ch of wd){ const a=h7_adv37(ch)*PT37*s; out.push({ch,li,x,w:a}); x+=a; } });
  if(Ln.last) out.push({quad:true,li,x,w:Ln.quad*s}); }); return out; }
function h7_base37(st,w,h){ return h7_slot('base37',h7_DK(w,h)+'|'+st.line+'|'+st.measure,()=>{ const L=lay37(w), J=h7_set37(st.line,st.measure), {cv,g}=h7_off(w,h), s=L.s;
  M.fill(g,C37.ground); h7_title(g,L,'L-37 · Pairing · composing stick','type 18 pt · 1 pica = 12 pt',T37,C37.ink,C37.soft);
  const B=new M.Buf(g), x0=L.hx, x1=L.hx+L.len, mx=x0+J.M_pt*s;
  /* pica scale above the stick */
  for(let p=0;p<=30;p++){ const x=x0+p*12*s, tall=p%6===0; for(let k=0;k<(tall?4:2);k++) B.dot(x,L.scY+4-k*2,.55,tall?C37.soft:C37.dim); }
  /* the stick: back flange (dense), tray floor (fine tone), the fixed head at left, the knee set to the measure */
  h7_lat(B,[x0-8,L.sy,x1+14,L.trayY],1.05,()=>.62,(d,R)=>.5+.12*R(),C37.steel2,3711);
  h7_lat(B,[x0-8,L.trayY,x1+14,L.sy1],1.5,()=>.3,(d,R)=>.48+.1*R(),C37.steel,3712);
  h7_lat(B,[x0-10,L.sy,x0,L.sy1],1,()=>.85,(d,R)=>.52+.12*R(),C37.steel2,3713);
  h7_lat(B,[mx,L.sy-2,mx+10,L.sy1+3],.95,()=>.9,(d,R)=>.55+.12*R(),C37.ink,3714);
  M.ring(B,{cx:mx+5,cy:L.sy1+10,R:4.5,w:1.2,swell:.1,dpl:1.6,rCore:.65,rEdge:.5,seed:3715,color:C37.soft});
  B.flush();
  h7_lab(g,'In the stick · nick up, faces mirrored',L.pad,L.labY,C37.soft,9);
  h7_lab(g,'0',x0,L.scY-6,C37.soft,9); h7_lab(g,'30 picas',x1,L.scY-6,C37.soft,9,{align:'right'});
  if(!L.ph) [6,12,18,24].forEach(p=>h7_lab(g,String(p),x0+p*12*s,L.scY-6,C37.soft,9,{align:'center'}));
  h7_lab(g,'head',x0-10,L.sy1+24,C37.soft,9); h7_lab(g,'knee · '+st.measure+' picas',Math.min(mx+14,L.pad+L.inner),L.sy1+24,C37.ink,9,{align:'right'});
  /* proof slip */
  M.fill(g,C37.paper,L.pad,L.pfY,L.inner,L.pfH);
  /* readings: the measure, then each line's computed space */
  const rows=[['Measure',st.measure+' picas · '+J.M_pt+' pt · '+J.lines.length+' lines']];
  J.lines.forEach((Ln,i)=>rows.push(Ln.last?['Line '+(i+1),'last line · 3-em spaces, quadded out']:['Line '+(i+1)+' · added per gap',Ln.per.toFixed(1)+' pt = '+Ln.make.parts.map(p=>p[0]).join(' + ')+(Ln.wide?' · wide':'')]));
  rows.forEach((r,i)=>{ const col=L.ph?0:Math.floor(i/L.rdRows), rw=L.ph?i:i%L.rdRows, x=L.pad+col*(L.colW+24), y=L.rdY+rw*34, acc=/added/.test(r[0]);
    h7_lab(g,r[0],x,y,acc?C37.acc:C37.soft,9); M.text(g,r[1],x,y+16,{font:'mono',size:L.ph?10.5:11,weight:400,track:.02,color:acc?C37.acc:C37.ink}); });
  h7_root(g,L.root,L.pad,L.rootY,C37.soft); return cv; }); }
/* a sort as a sprite: body from above with a hair of ground at its sides, the face flipped vertically. Same letter, same sort. */
function h7_sort37(ch,wpx,bh){ return h7_slot('sort37|'+ch,wpx.toFixed(3)+'|'+bh.toFixed(3)+'@'+h7_dpr(),()=>{ const W=Math.ceil(wpx)+2, H=Math.ceil(bh)+2, o=h7_off(W,H), B=new M.Buf(o.g);
  h7_lat(B,[1.8,1.6,1+wpx-.8,1+bh-.6],1.15,()=>.8,(d,R)=>.5+.08*R(),C37.body,ch.charCodeAt(0)*13+3760);
  const F=h7_face37(ch,bh), oy=1+bh; for(let k=0;k<F.pts.length;k+=2) B.dot(1+F.pts[k],oy-F.pts[k+1],.5,C37.ink); B.flush(); return {cv:o.cv,W,H}; }); }
/* the proof, inked once; a frame reveals it under the roller */
function h7_proof37(L,J,st){ return h7_slot('proof37',h7_DK(L.inner,L.pfH)+'|'+st.line+'|'+st.measure,()=>{ const o=h7_off(L.inner+2*L.pad,L.pfH), B=new M.Buf(o.g), bh=L.body, lh=bh*1.12, R=M.rng(3790);
  h7_pos37(J,L.s,L.hx,1).forEach(S=>{ if(S.sp||S.quad) return; const F=h7_face37(S.ch,bh), y0=30+S.li*lh; for(let k=0;k<F.pts.length;k+=2) if(R()<.97) B.dot(S.x+F.pts[k],y0+F.pts[k+1]-bh*.1,.52,C37.ground); });
  B.flush(); return o.cv; }); }
function h7_draw37(g,w,h,st,t){ const L=lay37(w), J=h7_set37(st.line,st.measure), s=L.s, live=t!=null, T=live?t:1e9, bh=L.body, TL=m4_tl37(st);
  const xs=h7_pos37(J,s,L.hx,1), ju=E.inOutCubic(cl((T-TL.ju0)/TL.jud)), pf=cl((T-TL.pf0)/(TL.arr-TL.pf0));
  const xj=ju>=1?xs:h7_pos37(J,s,L.hx,ju), B=new M.Buf(g), fl=[];
  /* each sort drops onto its sixteenth (160 ms, out cubic) and its face flashes as its click sounds */
  xj.forEach((S,i)=>{ const e=E.outCubic(cl((T-TL.ts[i]+160)/160)); if(e<=0) return; const top=L.lineY+S.li*bh, dy=(1-e)*-Math.max(14,bh*.7);
    if(live&&S.ch){ const ef=m4_qe(m4_e(st,'s'+i,t,150)); if(ef>.05) fl.push([S,top+dy,ef]); }
    if(S.quad){ if(S.w>2) h7_lat(B,[S.x+.6,top+dy+bh*.2,S.x+S.w-.6,top+dy+bh*.8],1.6,()=>.5,()=>.48,C37.quad,3730+S.li); return; }
    if(S.sp){ /* a space: lower than type-high, no face; ochre once it carries the computed justification */
      if(!S.make||ju<=0){ h7_lat(B,[S.x+.6,top+dy+bh*.2,S.x+S.w-.6,top+dy+bh*.8],1.2,()=>.5,()=>.5,C37.dim,3720+i); return; }
      const parts=S.make.parts, tot=parts.reduce((a,p)=>a+p[1],0), sc=S.w/(tot*s); let xx=S.x;
      const ej=live?m4_qe(m4_e(st,'j'+S.li,t,320)):0; parts.forEach((p,k)=>{ const pw=p[1]*s*sc; h7_lat(B,[xx+.5,top+bh*.2,xx+pw-.5,top+bh*.8],1.05,()=>Math.min(1,.55+.4*ju+.3*ej),()=>.52*(1+.45*ej),C37.acc,3740+i*7+k); xx+=pw; }); return; }
    const sp=h7_sort37(S.ch,S.w,bh); g.drawImage(sp.cv,S.x-1,top+dy-1,sp.W,sp.H); });
  /* the proof: right-reading, inked on the slip, same widths as the stick */
  B.flush();
  if(fl.length){ const Bf=new M.Buf(g); fl.forEach(([S,y0,ef])=>{ const F=h7_face37(S.ch,bh), c=h7_mix(C37.ink,C37.acc,.85*ef), oy=1+bh; for(let k=0;k<F.pts.length;k+=2) Bf.dot(S.x+F.pts[k],y0+oy-F.pts[k+1],.5*(1+.5*ef),c); }); Bf.flush(); }
  if(pf>0){ const pc=h7_proof37(L,J,st), xr=L.pad+L.inner*E.inOutCubic(pf); g.save(); g.beginPath(); g.rect(L.pad,L.pfY,xr-L.pad,L.pfH); g.clip(); g.drawImage(pc,0,L.pfY,L.inner+2*L.pad,L.pfH); g.restore(); }
  h7_lab(g,'Proof · right-reading',L.pad+10,L.pfY+18,h7_mix(C37.paper,C37.ground,.55),9); }
/* music · L-37: 150 BPM in D Mixolydian (olive). The measure is the meter: 20 picas 4/4, 25 picas 5/4, 30 picas 6/4 (nearest).
   Setting is a sixteenth-note sequence: each sort a metal click tuned to a chord tone by its set width (narrow sorts high), each word's
   first sort also a vibraphone note (the tune of the text), each space a rest; every line starts on a downbeat over the vamp
   D, C, G, D (I, ♭VII, IV, I). Justifying (two beats) is the chord on C opening up: each justified line is a voice that glides from
   a close voicing outward, as far as its spaces open. The proof rolls on beat 3 and the line arrives home on D with the bass, once. */
const BPM37=150, S16_37=60000/BPM37/4;
function m4_tl37(st){ return h7_slot('tl37',st.line+'|'+st.measure+'|'+(h7_em37.get('a')||0),()=>{ const J=h7_set37(st.line,st.measure), xs=h7_pos37(J,1,0,1), bpb=[4,5,6][Math.max(0,Math.min(2,Math.round((st.measure-20)/5)))], bar=bpb*4*S16_37, ts=[];
  let li=-1, c=0; xs.forEach(S=>{ if(S.li!==li){ li=S.li; c=Math.ceil(c/bar-1e-9)*bar; } ts.push(c); c+=S16_37; });
  const ju0=Math.ceil((c+S16_37)/bar-1e-9)*bar, jud=8*S16_37, pf0=ju0+jud, arr=ju0+bar; return {xs,ts,bpb,bar,ju0,jud,pf0,arr,J}; }); }
const VAMP37=['D','C','G','D'];
function m4_music37(st){ const TL=m4_tl37(st), J=TL.J, mu=M.music, Sc=mu.score({bpm:BPM37,meter:[TL.bpb,4],ground:'olive'}), md=Sc.mode, nb=Math.round(TL.ju0/TL.bar);
  const prog=[]; for(let b=0;b<nb;b++) prog.push([b*TL.bar,VAMP37[b%4]]); prog.push([TL.ju0,'C'],[TL.arr,'D']); Sc.harm(prog);
  /* the vamp: a pad and a plucked root a bar */
  let pv=null; for(let b=0;b<nb;b++){ const c=VAMP37[b%4]; pv=mu.voice(c,'A3','A4',3,pv); Sc.chord(b*TL.bar+15,'pad',pv,TL.bar+60,{attack:.15,release:.3,cutoff:1000,vel:.3}); Sc.note(b*TL.bar,'pluck',36+mu.parse(c).pcs[0],TL.bar*.5,{cutoff:380,vel:.5,hp:35}); }
  /* the setting: clicks by width; a word's first sort is a note of the tune */
  let first=true; TL.xs.forEach((S,i)=>{ const t=TL.ts[i]; if(S.sp||S.quad){ first=true; return; } const sym=Sc.chordAt(t+1), wd=cl((h7_adv37(S.ch)-.25)/.7), k=Math.round((1-wd)*5), acc=Math.abs(t/TL.bar-Math.round(t/TL.bar))<1e-6;
    Sc.hitSound(t,'clave',{freq:mu.hz(mu.ct(sym,'D6',k),sym),vel:acc?.34:.22,decay:.016,pan:((S.x/360)-.5)*.8},['s'+i,1]);
    if(first){ Sc.note(t,'mallet',mu.ct(sym,'A3',Math.round((1-wd)*4)+2),900,{vel:.36,trem:5,pan:((S.x/360)-.5)*.6}); first=false; } });
  /* justifying: the C chord opens, one voice per justified line, as far as its spaces open */
  const close=['E4','G4','C5','E5'], lines=J.lines.filter(x=>!x.last); Sc.note(TL.ju0,'pluck','C2',TL.bar*.8,{cutoff:400,vel:.5,hp:35});
  lines.slice(0,4).forEach((Ln,k)=>{ const o=Math.round(Math.min(1,(Ln.per-4.5)/12)*3), from=mu.midi(close[k]), dir=k%2?1:-1, to=mu.ct('C',from,dir*Math.max(1,o)), id='v'+k;
    Sc.note(TL.ju0,'glide',from,TL.arr-TL.ju0+300,{id,attack:.06,release:.5,vel:.3,vibrato:3,tone:2400,pan:(k-1.5)*.3},['j'+k,1]); Sc.glide(TL.ju0+S16_37*2,id,to,TL.jud*.6); });
  /* the proof and the arrival */
  Sc.hitSound(TL.pf0,'roller',{dur:(TL.arr-TL.pf0)/1000,rate:5,vel:.4});
  Sc.note(TL.arr,'bass','D2',700,{from:'A1',glide:90,env:2.6,decay:.4,vel:.58},['arr',1]); Sc.chord(TL.arr,'mallet',['D4','F#4','A4','D5'],1800,{vel:.36,trem:5});
  [mu.deg(md,-3,5),mu.deg(md,0,5),mu.deg(md,2,5)].forEach((m,k)=>Sc.note(TL.arr+k*S16_37*2,'bell',m,k===2?2000:900,{vel:.24,ratio:3.5,pan:.2}));
  Sc.end(TL.arr+2000); return m4_gain(Sc.out(),1.5); }
/* Measure as music: one bar of the new meter, clicked on eighths with its downbeat accented */
function m4_param37(A,st,id,ov,nv){ if(id!=='measure') return false; const now=A.now(); if(!now||!m4_ok(st,'pm',220)) return true; const bpb=[4,5,6][Math.max(0,Math.min(2,Math.round((+nv-20)/5)))];
  for(let k=0;k<bpb;k++) A.play('clave',{freq:m4_hz(k?'A6':'D7','D'),vel:k?.24:.36,decay:.016,when:now+.005+k*S16_37*2/1000});
  A.play('pluck',{chord:[m4_hz('D2','D')],dur:.3,cutoff:380,vel:.45,hp:35,when:now+.005}); return true; }
M.piece({ id:'L-37',
  caption:'A reply set in a composing stick, upside down and backward, then justified line by line; the ochre spaces fill each line to the measure. Change the measure and the lines rebreak and respace.',
  alt:'On a dark olive ground, a steel composing stick in plan view holds three lines of stippled type blocks whose letters read upside down, with ochre blocks in the word gaps. Below, a white proof slip shows the same lines right-reading, and readings list the space added per gap for each line.',
  recipe:{
    idea:'Composing is fitting: the words stay the same and the space between them changes until each line fits the person’s measure.',
    marks:['dot','bar'],
    ground:'olive',
    accent:'the justification spaces, ochre: the computed space added per gap',
    composition:'Pica scale, the stick across the full width with head left and knee at the measure, the proof slip below, then one reading per line.',
    motion:'At 150 BPM: sorts drop onto sixteenths left to right, each line from a downbeat, each face flashing as it clicks; then the gaps open to the computed width over two beats (in-out cubic) and the proof inks in, arriving on the next downbeat. Reduced motion shows the justified stick and the proof.',
    sound:'A sixteenth-note sequence: each sort a click tuned by its width, each word’s first sort a note of the tune, spaces rests, over D, C, G, D in the measure’s meter. Justifying opens a C chord, voice by line; the proof lands on D.',
    controls:['Line (3 replies)','Measure 20–30 picas'],
    computed:['set width: sum of Geist 600 glyph advances at 18 pt (no kerning, as in metal type)','greedy line breaks at the measure with a 4-em minimum space','space added per gap = (measure − set width) / gaps, per line','make-up: exhaustive search over up to three of em, en, 3-em, 4-em, 5-em and hair spaces for the closest sum'],
    placeholder:['the three replies'],
    root:'Joseph Moxon, Mechanick Exercises, vol. 2, London, 1683: justifying is filling the stick with spaces between words; very wide spacing is “pigeon-holes”. Movable type has several records: Bi Sheng’s ceramic type (China, 1040s, described by Shen Kuo), metal type in Korea (Jikji, 1377), Gutenberg (Mainz, c. 1450). Sources: gutenberg.org/ebooks/78991, en.wikipedia.org/wiki/Composing_stick, guinnessworldrecords.com (Jikji)',
    rules:['faces in the stick are flipped vertically (mirror + half turn), order left to right','the proof uses the same x positions as the stick','spaces sit lower than type-high, with no face'],
    engine:['M.Buf','M.ring','M.text','canvas glyph coverage sampled to dots']},
  aspect:w=>w/lay37(w).H,
  state:{line:0,measure:22},
  controls:[{id:'line',type:'select',label:'Line',play:true,options:LNAME37.map((l,i)=>({value:i,label:l}))},
    {id:'measure',type:'range',label:'Measure',min:20,max:30,step:1,fmt:v=>v+' picas'}],
  music:m4_music37, musicParam:m4_param37, musicIns:'mallet',
  render(g,w,h,M,st){ h7_blit(g,h7_base37(st,w,h)); h7_draw37(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ t=Math.max(0,t); h7_blit(g,h7_base37(st,w,h)); if(h7_RM()){ h7_draw37(g,w,h,st,null); return false; } h7_draw37(g,w,h,st,t); return t<m4_tl37(st).arr+900; } });


/* ════════════════════════════════════════════════════════════════════════
   L-38 · Shadow time: a horizontal dial with 21 breath lines; the shadow steps only on an exchange.
   COMPUTED: breath i (1…21) takes hour angle H_i = −90° + i·180°/22; its line on a horizontal dial at latitude φ lies at
   θ_i = atan(sin φ · tan H_i) from the noon line. The style stands at φ above the plate.
   Exchange times are seeded (placeholder); the shadow sits on line m, where m = exchanges so far.
   ════════════════════════════════════════════════════════════════════════ */
const P38=M.PAL.sky, C38={ground:P38.ground, white:P38.ring, ink:P38.ink, soft:h7_mix(P38.ground,P38.ink,.62), dim:h7_mix(P38.ground,P38.ring,.42), faint:h7_mix(P38.ground,P38.ring,.3), shadow:P38.ink, acc:P38.peach};
const T38='Shadow time';
const SUB38='Twenty-one breaths laid out as hour lines; the shadow moves only when someone speaks.';
const ROOT38='Root · Egypt (c. 1500 BCE), Babylon, China (Taosi gnomon): a shadow on marked lines tells the hour.';
const h7_H38=i=>(-90+i*180/22)*Math.PI/180;
const h7_th38=(i,lat)=>{ if(i<=0) return -Math.PI/2; return Math.atan(Math.sin(lat*Math.PI/180)*Math.tan(h7_H38(i))); };
/* the seeded session: 21 exchange times in minutes, irregular (exponential gaps) */
const EX38=(()=>{ const R=M.rng(3801), t=[]; let x=0; for(let i=0;i<21;i++){ x+=1.2+(-Math.log(1-R()*.95))*2.6; t.push(x); } return t; })();
const lay38=h7_memo(function(w){ const T=h7_T(w,SUB38,520,480), o=Object.assign({},T), {ph,pad,inner}=T;
  o.R=Math.round(inner*(ph?.4:.41)); o.fx=pad+inner/2; o.fy=T.top+o.R+34; o.base=o.fy+12;
  let y=o.base+34; o.axY=y+18; o.ax0=pad; o.ax1=pad+inner; y=o.axY+52;
  o.rdY=y; o.colW=ph?inner:(inner-24)/2; o.rdRows=ph?6:3; y=o.rdY+o.rdRows*34+8;
  o.root=h7_wrap(ROOT38,inner,h7_ROOT); o.rootY=y+14; o.H=h7_q(o.rootY+(o.root.length-1)*14+pad); return o; });
function h7_base38(st,w,h){ return h7_slot('base38',h7_DK(w,h)+'|'+st.lat,()=>{ const L=lay38(w), {cv,g}=h7_off(w,h), B=new M.Buf(g), fx=L.fx, fy=L.fy, R=L.R;
  M.fill(g,C38.ground); h7_title(g,L,'L-38 · Pairing · horizontal sundial','latitude '+st.lat+'° N',T38,C38.ink,C38.ink);
  /* plate edge: a half-ring of white dots and the straight south edge */
  M.ring(B,{cx:fx,cy:fy,R:R+(L.ph?24:30),w:1.2,swell:.2,dpl:.9,rCore:.62,rEdge:.5,seed:3810,color:C38.dim,a0:Math.PI,a1:TAU});
  h7_seg(B,fx-R-(L.ph?24:30),L.base,fx+R+(L.ph?24:30),L.base,C38.dim,{seed:3811,dpl:.9,spread:.15,r:.55});
  /* the gnomon's style, seen from above: a thin wedge along the noon line */
  M.blue(B,{box:[Math.round(fx-6),Math.round(fy-R*.6),Math.round(fx+6),Math.round(fy+2)],sp:.85,seed:3812,rOf:()=>.52,color:C38.ink,density:(x,y)=>{ const u=(fy-y)/(R*.58); if(u<0||u>1) return 0; return Math.abs(x-fx)<2.6*(1-u)+.6?1:0; }});
  B.flush();
  /* the style in elevation: a small inset, the angle at the foot equals the latitude */
  { const iw=L.ph?44:56, ix=L.pad+L.inner-iw-(L.ph?4:8), iy=L.rdY+(L.ph?70:66),  a=st.lat*Math.PI/180, ih=iw*Math.tan(a), B2=new M.Buf(g);
    h7_seg(B2,ix,iy,ix+iw,iy,C38.ink,{seed:3813,dpl:1.4,spread:.1,r:.55,even:true}); h7_seg(B2,ix,iy,ix+iw,iy-ih,C38.ink,{seed:3814,dpl:1.4,spread:.1,r:.55,even:true}); h7_seg(B2,ix+iw,iy,ix+iw,iy-ih,C38.ink,{seed:3815,dpl:1.4,spread:.1,r:.55,even:true});
    M.ring(B2,{cx:ix,cy:iy,R:16,w:.9,swell:.1,dpl:1.2,rCore:.55,rEdge:.5,seed:3816,color:C38.ink,a0:-a,a1:0}); B2.flush();
    h7_lab(g,'style · '+st.lat+'°',ix+iw,iy+16,C38.ink,9,{align:'right'}); }
  /* exchange axis: time runs; dots are exchanges */
  { const B3=new M.Buf(g), t1=EX38[20]+2; h7_seg(B3,L.ax0,L.axY,L.ax1,L.axY,C38.dim,{seed:3817,dpl:.8,spread:.1,r:.5});
    for(let m=0;m<=t1;m+=10){ const x=L.ax0+m/t1*(L.ax1-L.ax0); B3.dot(x,L.axY+5,.6,C38.ink); B3.dot(x,L.axY+7.5,.6,C38.ink); } B3.flush();
    h7_lab(g,'Exchanges · time',L.ax0,L.axY-12,C38.ink,9); const stp=L.ph?20:10, last=Math.floor(t1/stp)*stp; for(let m=0;m<=t1;m+=stp){ const x=L.ax0+m/t1*(L.ax1-L.ax0), end=m===last; h7_lab(g,m+(end?' min':''),end?Math.min(x+8,L.ax1):x,L.axY+22,C38.ink,9,{align:m===0?'left':end?'right':'center'}); } }
  return cv; }); }
function h7_draw38(g,w,h,st,t){ const L=lay38(w), B=new M.Buf(g), fx=L.fx, fy=L.fy, R=L.R, live=t!=null, t1=EX38[20]+2;
  /* where the shadow is: in a session replay, the exchange count at clock time c; in a step, from n−1 to n */
  let c, m, th;
  /* a step: the shadow eases to the next line over one beat and lands on its note */
  if(live&&st.anim==='step'){ m=t>=STEP38?st.n:st.n-1; c=EX38[Math.max(0,st.n-1)]; const e=E.outCubic(cl(t/STEP38)); const a0=h7_th38(st.n-1,st.lat), a1=h7_th38(st.n,st.lat); th=a0+(a1-a0)*e; }
  /* the replay: exchanges on sixteenths (their irregular spacing kept), the shadow easing onto each line as its note sounds */
  else if(live){ const TL=m4_tl38(st); c=m4_clock38(TL,st,t); m=0; while(m<st.n&&TL.tq[m]<=t) m++;
    if(m<st.n){ const tq=TL.tq[m], d=Math.min(200,tq-(m?TL.tq[m-1]:0)), e=E.outCubic(cl((t-(tq-d))/d)); th=h7_th38(m,st.lat)+(h7_th38(m+1,st.lat)-h7_th38(m,st.lat))*e; } else th=h7_th38(m,st.lat); }
  else { m=st.n; c=EX38[Math.max(0,m-1)]; th=h7_th38(m,st.lat); }
  /* the 21 breath lines: lit up to the shadow, faint beyond, the 21st (renewal) in the accent */
  for(let i=1;i<=21;i++){ const a=h7_th38(i,st.lat), dx=Math.sin(a), dy=-Math.cos(a), lit=i<=m, ren=i===21, r0=R*.17, col=ren?C38.acc:lit?C38.white:C38.faint, e=live?m4_qe(m4_e(st,'l'+i,t,ren?420:220)):0;
    h7_seg(B,fx+dx*r0,fy+dy*r0,fx+dx*R,fy+dy*R,col,{seed:3820+i,dpl:(lit||ren?1.15:.6)*(1+.6*e),spread:(ren?.45:.25)*(1+1.2*e),r:(lit||ren?.68:.55)*(1+.7*e)}); }
  /* the shadow: a dense wedge from the foot along θ */
  { const dx=Math.sin(th), dy=-Math.cos(th), nx=-dy, ny=dx, Rs=M.rng(3850), L2=R*.9; for(let i=0;i<L2*7;i++){ const u=Rs(), wdt=(4.2*(1-u)+1.1), v=(Rs()-.5)*2*wdt*.5; const x=fx+dx*u*L2+nx*v, y=fy+dy*u*L2+ny*v; if(Rs()<.88) B.dot(x,y,.6,C38.shadow); } }
  /* exchange dots on the time axis, and the clock's playhead */
  { const W=L.ax1-L.ax0; for(let i=0;i<21;i++){ const x=L.ax0+EX38[i]/t1*W, on=i<m, done=i<st.n; M.ring(B,{cx:x,cy:L.axY,R:2.4,w:1,swell:.1,dpl:2,rCore:.62,rEdge:.5,seed:3860+i,color:i===20&&on?C38.acc:on?C38.white:done?C38.dim:C38.faint}); }
    if(live&&st.anim!=='step'){ const x=L.ax0+c/t1*W; for(let k=0;k<6;k++) B.dot(x,L.axY-6-k*2,.6,C38.ink); } }
  B.flush();
  for(let i=1;i<=21;i++){ const a=h7_th38(i,st.lat), rr=R+(L.ph?11:14); if(L.ph&&i%2===0&&i!==20) continue; M.text(g,String(i),fx+Math.sin(a)*rr,fy-Math.cos(a)*rr+3.5,{font:'mono',size:9,weight:500,track:0,color:i===21?C38.ink:i<=m?C38.ink:C38.soft,align:'center'}); }
  /* readings */
  const Hd=m?h7_H38(m)*180/Math.PI:-90, thd=th*180/Math.PI, sg=v=>(v>=0?'+':'−')+Math.abs(v).toFixed(1)+'°', mm=Math.floor(c), ss=Math.round((c-mm)*60)%60;
  const rows=[['Breath',m+' / 21'+(m===21?' · renewal':'')],['Hour angle',sg(Hd)],['Shadow',sg(thd)+' from noon'],['Line rule','tan θ = sin φ · tan H'],['Clock',mm+':'+String(ss).padStart(2,'0')+' · moves on'],['To renewal',String(21-m)]];
  rows.forEach((r,i)=>{ const col=L.ph?0:Math.floor(i/3), rw=L.ph?i:i%3, x=L.pad+col*(L.colW+24), y=L.rdY+rw*34;
    h7_lab(g,r[0],x,y,C38.soft,9); M.text(g,r[1],x,y+16,{font:'mono',size:L.ph?10.5:11,weight:400,track:.02,color:C38.ink}); });
  h7_root(g,L.root,L.pad,L.rootY,C38.ink); }
/* music · L-38: 120 BPM 4/4. A Sani organ over a held drone (D and A): each exchange that moves the shadow sounds the next rung of a
   21-step ladder, three octaves of the mode from D3, held until the next exchange; the clock ticks every beat between them. The replay
   keeps the exchanges' irregular spacing but sets them on sixteenths, the last one on a downbeat, where the rung is harmonized (the
   mode's triad with the rung as its third). Line 21 is renewal: the ladder resolves to the tonic, three octaves up, with the bass once.
   Latitude is the mode, by the sun's angle: 20° Lydian (brightest), 35° Ionian, 50° Mixolydian, 60° Dorian. */
const BPM38=120, BT38=500, STEP38=BT38;
const m4_mode38=lat=>lat<27.5?'lydian':lat<42.5?'ionian':lat<55?'mixolydian':'dorian';
/* the mode's triad holding degree d, as its third where it can (d−2, d, d+2): its symbol (for tuning) and notes */
function m4_triad38(md,d,oct){ const mu=M.music; for(const o of [-2,0,-4]){ const ns=[mu.deg(md,d+o,oct),mu.deg(md,d+o+2,oct),mu.deg(md,d+o+4,oct)], r=ns[0], i3=ns[1]-r, i5=ns[2]-r;
    /* a diminished triad has no pure tuning, so the rung takes the next triad that holds it (as root, then as fifth) */
    if(i5!==7) continue; return {sym:mu.name(r).replace(/-?\d+$/,'')+(i3===3?'m':''),notes:ns}; }
  return {sym:'D',notes:[mu.deg(md,d,oct)]}; }
function m4_tl38(st){ return h7_slot('tl38',st.n,()=>{ const n=st.n, bars=n<=5?1:n<=12?2:3, Tl=bars*4*BT38, tq=[]; let prev=-1e9;
  for(let m=1;m<=n;m++){ let t=m===n?Tl:Math.round(EX38[m-1]/EX38[n-1]*Tl/(BT38/4))*(BT38/4); t=Math.max(t,prev+BT38/4); tq.push(t); prev=t; }
  for(let i=n-2;i>=0;i--) tq[i]=Math.min(tq[i],tq[i+1]-BT38/4); return {tq,Tl}; }); }
/* the clock's minutes at t: piecewise linear through the exchanges, so the axis keeps the session's real times */
function m4_clock38(TL,st,t){ const n=st.n, span=EX38[n-1]+1.2; let a=0, ca=0; for(let i=0;i<n;i++){ const b=TL.tq[i], cb=EX38[i]; if(t<b) return ca+(cb-ca)*Math.max(0,(t-a)/((b-a)||1)); a=b; ca=cb; } return Math.min(span,ca+(span-ca)*(t-a)/(BT38*2)); }
function m4_music38(st){ const mu=M.music, md=m4_mode38(st.lat), Sc=mu.score({bpm:BPM38,meter:[4,4],mode:md,ground:'sky'}), home=md==='dorian'?'Dm':'D', step=st.anim==='step';
  const tq=step?[STEP38]:m4_tl38(st).tq, first=step?st.n:1, n=st.n, Tl=tq[tq.length-1], fin=m4_triad38(md,n===21?21:n,3);
  Sc.harm([[0,home],[Tl,n===21?home:fin.sym]]);
  Sc.hitSound(0,'drone',{freq:mu.hz('D2','D'),ratio:1.5,level:.32,cutoff:900,fade:step?.25:.8,dur:(Tl+(step?600:1600))/1000});
  for(let t=0;t<=Tl+BT38*(step?1:2);t+=BT38) Sc.hitSound(t,'tick',{vel:.13,pan:-.3});
  tq.forEach((t,j)=>{ const m=first+j, d=mu.deg(md,m,3), nx=j<tq.length-1?tq[j+1]:t+1400, pan=Math.sin(h7_th38(m,st.lat))*.6, last=j===tq.length-1;
    Sc.hitSound(t,'tick',{tock:true,vel:.36,pan});
    Sc.note(t,'organ',d,Math.max(90,nx-t-20),{attack:.012,release:last?.6:.12,vel:m===21?.44:.38,vibrato:3,cutoff:2600,pan,over:last&&n!==21?fin.sym:home},['l'+m,1]); });
  /* arrival: the rung harmonized; renewal is the tonic, the bass and the motif */
  if(n===21){ Sc.note(Tl,'bass','D2',700,{from:'A1',glide:90,env:2.6,decay:.4,vel:.58}); Sc.chord(Tl,'mallet',mu.voice(home,'D4','D5',4),1800,{vel:.36,trem:5});
    [mu.deg(md,-3,5),mu.deg(md,0,5),mu.deg(md,2,5)].forEach((m,k)=>Sc.note(Tl+BT38*(k+1)/2,'bell',m,k===2?2000:900,{vel:.24,ratio:3.5,pan:.2})); }
  else Sc.chord(Tl,'mallet',fin.notes,1500,{vel:.32,trem:5,over:fin.sym});
  Sc.end(Tl+(step?1400:2600)); return m4_gain(Sc.out(),step?1.85:1.6); }
/* Latitude as music: in a new mode, the motif (5 ↑ 1 ↑ 3) in that mode; within a mode, the current rung, panned to its line's new angle */
function m4_param38(A,st,id,ov,nv){ if(id!=='lat') return false; const now=A.now(); if(!now) return true; const mu=M.music, md=m4_mode38(+nv), was=m4_mode38(+ov);
  if(md!==was){ [mu.deg(md,-3,4),mu.deg(md,0,4),mu.deg(md,2,4)].forEach((m,k)=>A.play('organ',{freq:m4_hz(m,'D'),dur:k===2?.9:.3,attack:.012,release:.3,vel:.4,vibrato:3,cutoff:2600,when:now+.005+k*.12})); return true; }
  if(!m4_ok(st,'pl',120)) return true; A.play('organ',{freq:m4_hz(mu.deg(md,st.n,3),'D'),dur:.25,attack:.012,release:.2,vel:.34,vibrato:3,cutoff:2600,pan:Math.sin(h7_th38(st.n,+nv))*.6,when:now+.005}); return true; }
M.piece({ id:'L-38',
  caption:'Twenty-one breath lines on a horizontal sundial; the clock runs, but the shadow steps to the next line only when an exchange lands. Press Speak to add one, or change the latitude to respace the lines.',
  alt:'On a sky-blue ground, a half-round dial with 21 white hour lines fanning from a small navy style; the last line is peach. A dark shadow wedge lies on line 13. Below, a time axis with 21 dots for exchanges, and readings for breath, hour angle and shadow angle.',
  recipe:{
    idea:'Time in Mir is counted exchanges: the hours pass, but the shadow only moves when someone speaks.',
    marks:['bar','dot'],
    ground:'sky',
    accent:'the 21st line, peach: renewal',
    composition:'A half-round dial centered under the title, the style inset in the lower left corner, the exchange axis across the width, readings in two columns.',
    motion:'At 120 BPM: the replay sets the exchanges on sixteenths (their irregular spacing kept, the last on a downbeat) and the shadow eases onto each line as its note sounds, the line flashing; the clock runs between. Speak moves one line in one beat. Reduced motion shows the current line.',
    sound:'An organ over a D drone: each exchange plays the next rung of a 21-step ladder, three octaves of the mode, while the clock ticks each beat. Latitude is the mode (20° Lydian … 60° Dorian). Line 21 resolves to the tonic with the bass.',
    controls:['Speak (adds an exchange; after 21 a new cycle starts)','Latitude 20–60°'],
    computed:['hour angle H = −90° + i·180°/22 for breath i','line angle θ = atan(sin φ · tan H), the horizontal-dial relation','style angle = latitude'],
    placeholder:['exchange times (seeded)','latitude'],
    root:'Several early records: Egypt, a limestone dial from the Valley of the Kings dividing daylight into 12 parts (dated c. 1500 BCE in one source, 13th century BCE in another), and shadow clocks of the same period; Herodotus credits the Babylonians; in China, a gui-biao gnomon from the Taosi observatory site (Shanxi). Sources: en.wikipedia.org/wiki/History_of_timekeeping_devices_in_Egypt, sundials.org (Valley of the Kings dial), subsites.chinadaily.com.cn/shanxi/2024-11/29/c_1049230.htm',
    rules:['the shadow never moves between exchanges','line 21 is the only accent'],
    engine:['M.ring','M.blue','M.Buf','M.text']},
  aspect:w=>w/lay38(w).H,
  state:{n:13,lat:41,anim:'session'},
  controls:[{id:'speak',type:'button',label:'Speak',play:true,run:st=>{ st.n=st.n>=21?1:st.n+1; st.anim='step'; }},
    {id:'lat',type:'range',label:'Latitude',min:20,max:60,step:1,fmt:v=>v+'° N'}],
  music:m4_music38, musicParam:m4_param38, musicIns:'organ',
  render(g,w,h,M,st){ h7_blit(g,h7_base38(st,w,h)); h7_draw38(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ t=Math.max(0,t); h7_blit(g,h7_base38(st,w,h)); if(h7_RM()){ h7_draw38(g,w,h,st,null); st.anim='session'; return false; }
    if(st.anim==='step'){ h7_draw38(g,w,h,st,t); if(t>=STEP38+1100){ st.anim='session'; return false; } return true; }
    h7_draw38(g,w,h,st,t); return t<m4_tl38(st).Tl+1800; } });


/* ════════════════════════════════════════════════════════════════════════
   L-39 · One plate, many exposures: twelve exposures of the field settling, on one fixed plate.
   Every dot of the settled field has an identity. Exposure i (0…11) catches it at k_i = .3 + .7·outCubic(i/11), so its
   position is settled + (1 − k_i)·offset: a dot that is still loose leaves a trail, a dot that has settled lands on itself.
   Each exposure keeps fewer dots (p_i = 1 − .045·i) and smaller ones: fainter.
   COMPUTED: stack count per region = how many exposures put at least one dot in that cell (12-bit mask per cell, popcount).
   The plate is silver, so it is monochrome; the red appears only in the stack map, where all twelve exposures agree.
   ════════════════════════════════════════════════════════════════════════ */
const P39=M.PAL.night, C39={ground:P39.ground, ink:P39.ring, soft:h7_mix(P39.ground,P39.ring,.58), dim:h7_mix(P39.ground,P39.ring,.38), hair:h7_mix(P39.ground,P39.ring,.2), fog:h7_mix(P39.ground,P39.ring,.16), acc:P39.center};
const T39='One plate, many exposures';
const SUB39='Twelve exposures of the field settling on one fixed plate; where they stack, the field agrees.';
const ROOT39='Root · Marey, 1882: a rotating-disc shutter put successive exposures on one fixed plate.';
const N39=12, k39=i=>.3+.7*E.outCubic(i/(N39-1)), p39=i=>1-.045*i;
const lay39=h7_memo(function(w){ const T=h7_T(w,SUB39,560,640), o=Object.assign({},T), {ph,pad,inner}=T;
  if(ph){ o.P=inner; o.px=pad; o.py=T.top; let y=o.py+o.P+44; o.dk=[pad,y,96]; o.rd=[pad+112,y]; y+=112; o.mp=[pad,y+20,inner]; o.lg=[pad,o.mp[1]+inner+22,'row']; y=o.mp[1]+inner+62;
    o.fw=(inner-3*8)/4; o.fr=[pad,y,3]; y+=3*(o.fw+44)+14; }
  else { o.P=Math.round(Math.min(inner*.56,620)); o.px=pad; o.py=T.top; const cx=pad+o.P+32, cw=inner-o.P-32; o.dk=[cx,o.py,Math.min(150,cw*.36)]; o.rd=[cx+o.dk[2]+24,o.py+6];
    const ms=Math.min(cw-96,o.P-o.dk[2]-80); o.mp=[cx,o.py+o.P-ms,ms]; o.lg=[cx+ms+20,o.mp[1]+8,'col']; let y=o.py+o.P+48; o.fw=(inner-11*8)/12; o.fr=[pad,y,1]; y+=o.fw+58; o.yEnd=y; }
  let y=ph?o.fr[1]+3*(o.fw+44)+8:o.yEnd; o.root=h7_wrap(ROOT39,inner,h7_ROOT); o.rootY=y+6; o.H=h7_q(o.rootY+(o.root.length-1)*14+pad);
  o.cs=ph?7:9; return o; });
/* the field's dots with identities and loose offsets; then each exposure's dots and the per-cell masks */
function h7_data39(L){ return h7_slot('data39',L.P+'|'+h7_dpr(),()=>{ const P=L.P, cx=P/2, cy=P/2, R=P*.43, C=h7_cap();
  M.mirField(C,{cx,cy,R,k:1,seed:39,rings:8,dens:L.ph?.45:.38,r:.8,pal:{ring:'#fff',blade:'#fff',center:'#fff'},center:true,nb:8});
  const n=C.X.length, ox=new Float32Array(n), oy=new Float32Array(n), Rr=M.rng(3901);
  for(let i=0;i<n;i++){ const dx=C.X[i]-cx, dy=C.Y[i]-cy, d=Math.hypot(dx,dy)||1, a=Math.atan2(dy,dx), sw=(M.noise(Math.cos(a)*2+3,Math.sin(a)*2+3,7)-.5)*2;
    const rad=Rr.gauss()*R*.05+sw*R*.06, tan=Rr.gauss()*R*.035+d*.12; ox[i]=Math.cos(a)*rad-Math.sin(a)*tan; oy[i]=Math.sin(a)*rad+Math.cos(a)*tan; }
  const cs=L.cs, gw=Math.ceil(P/cs), mask=new Uint16Array(gw*gw), ex=[];
  for(let e=0;e<N39;e++){ const k=k39(e), p=p39(e), X=[], Y=[]; for(let i=0;i<n;i++){ if(M.hash2(i,e,39)>=p) continue; const x=C.X[i]+(1-k)*ox[i], y=C.Y[i]+(1-k)*oy[i]; if(x<1||y<1||x>P-1||y>P-1) continue; X.push(x); Y.push(y);
      mask[((y/cs)|0)*gw+((x/cs)|0)]|=1<<e; } ex.push({X:Float32Array.from(X),Y:Float32Array.from(Y),k,r:.82*(1-e*.022)}); }
  return {n,ex,mask,gw,cs}; }); }
const h7_pop=v=>{ let c=0; while(v){ v&=v-1; c++; } return c; };
/* the shutter disc, drawn once with its window at the top; a frame only turns it */
function h7_discP39(B,s,ox,oy,nw){ nw=nw||1; const c=s/2, R=s*.46, wa=Math.min(.42,TAU/nw*.45);
  M.ring(B,{cx:ox+c,cy:oy+c,R,w:1.2,swell:.15,dpl:1.2,rCore:.65,rEdge:.5,seed:3920,color:C39.soft}); M.ring(B,{cx:ox+c,cy:oy+c,R:R*.18,w:1,swell:.1,dpl:1.4,rCore:.6,rEdge:.5,seed:3921,color:C39.soft});
  h7_lat(B,[ox,oy,ox+2*c,oy+2*c],1.9,(px,py)=>{ px-=ox; py-=oy; const d=Math.hypot(px-c,py-c); if(d>R-1.5||d<R*.2) return 0; let a=Math.atan2(py-c,px-c)+Math.PI/2; a=((a%TAU)+TAU)%TAU; const aw=a%(TAU/nw); if((aw>TAU/nw-wa/2||aw<wa/2)&&d>R*.55) return 0; return .4; },()=>.5,C39.dim,3922); }
/* the shutter disc has one window per exposure: n windows, one turn a bar, so the exposures are an n-tuplet against the bar's four beats */
const h7_disc39=(s,nw)=>h7_slot('disc39',s+'|'+nw+'@'+h7_dpr(),()=>{ const o=h7_off(s,s), B=new M.Buf(o.g); h7_discP39(B,s,0,0,nw); B.flush(); return o.cv; });
/* one exposure alone, small, lit or waiting (cached as sprites) */
function h7_thumbsP39(B,L,ox,oy,onOf){ const D=h7_data39(L), per=12/L.fr[2], s=L.fw/L.P, stp=Math.max(1,Math.round(1/(s*s)/3));
  for(let e=0;e<N39;e++){ const r=Math.floor(e/per), c=e%per, x=ox+c*(L.fw+8), y=oy+r*(L.fw+44), X=D.ex[e], col=onOf(e)?C39.ink:C39.hair; for(let i=0;i<X.X.length;i+=stp) B.dot(x+X.X[i]*s,y+X.Y[i]*s,.5,col); } }
const h7_thumbs39=(L,on)=>h7_slot('th39|'+on,L.fw+'|'+L.P+'|'+L.inner+'@'+h7_dpr(),()=>{ const o=h7_off(L.inner,L.fr[2]*(L.fw+44)), B=new M.Buf(o.g); h7_thumbsP39(B,L,0,0,()=>on); B.flush(); return o.cv; });
/* the stack map for the first ne exposures: dot size from the count, red where all twelve stack */
function h7_mapP39(B,L,ne,ox,oy){ const D=h7_data39(L), ms=L.mp[2], gw=D.gw, sc=ms/L.P, full=(1<<N39)-1, cur=(1<<ne)-1; let n12=0, nAny=0;
  for(let j=0;j<gw;j++) for(let i=0;i<gw;i++){ const v=D.mask[j*gw+i]&cur; if(!v) continue; const c=h7_pop(v); nAny++; const all=ne===N39&&v===full; if(all) n12++;
    B.dot(ox+(i+.5)*D.cs*sc,oy+(j+.5)*D.cs*sc,Math.max(.5,D.cs*sc*.5*Math.sqrt(c/N39)),all?C39.acc:c>=ne&&ne>1?C39.ink:C39.soft); }
  return {n12,nAny}; }
const h7_map39=(L,ne)=>h7_slot('map39',L.mp[2]+'|'+L.P+'|'+ne+'@'+h7_dpr(),()=>{ const ms=L.mp[2], o=h7_off(ms,ms), B=new M.Buf(o.g), r=h7_mapP39(B,L,ne,0,0); B.flush(); return {cv:o.cv,n12:r.n12,nAny:r.nAny}; });
/* the still's plate (any count), separate from the animation's incremental layer */
const h7_plateS39=(L,ne)=>h7_slot('plateS39',L.P+'|'+ne+'@'+h7_dpr(),()=>{ const D=h7_data39(L), o=h7_off(L.P,L.P), B=new M.Buf(o.g); for(let e=0;e<ne;e++){ const X=D.ex[e]; for(let i=0;i<X.X.length;i++) B.dot(X.X[i],X.Y[i],X.r,C39.ink); } B.flush(); return o.cv; });
const h7_has39=(L,ne,nw)=>{ const m=h7_SL.map39, t1=h7_SL.thN39, d=h7_SL.disc39, ps=h7_SL.plateS39; return ps&&ps.key===L.P+'|'+ne+'@'+h7_dpr()&&m&&m.key===L.mp[2]+'|'+L.P+'|'+ne+'@'+h7_dpr()&&t1&&t1.key===L.fw+'|'+L.P+'|'+L.inner+'|'+ne+'@'+h7_dpr()&&d&&d.key===L.dk[2]+'|'+nw+'@'+h7_dpr(); };
/* the plate layer only ever gains exposures while a run plays, so each frame adds at most one exposure's dots */
let h7_PL39=null;
function h7_plate39(L,ne){ const key=L.P+'|'+h7_dpr(); if(!h7_PL39||h7_PL39.key!==key||ne<h7_PL39.ne){ const o=h7_off(L.P,L.P); h7_PL39={key,cv:o.cv,g:o.g,ne:0}; }
  const Ly=h7_PL39, D=h7_data39(L); if(ne>Ly.ne){ const B=new M.Buf(Ly.g); for(let e=Ly.ne;e<ne;e++){ const X=D.ex[e]; for(let i=0;i<X.X.length;i++) B.dot(X.X[i],X.Y[i],X.r,C39.ink); } B.flush(); Ly.ne=ne; }
  return Ly.cv; }
function h7_paint39(g,st,w,h){ const L=lay39(w);
  M.fill(g,C39.ground); h7_title(g,L,'L-39 · Pairing · fixed-plate chronophotograph','12 exposures · 1/12 s apart',T39,C39.ink,C39.soft);
  const B=new M.Buf(g), P=L.P;
  /* plate fog: the emulsion's faint base, so the black reads as a plate */
  h7_lat(B,[L.px+2,L.py+2,L.px+P-2,L.py+P-2],L.ph?6:8,()=>.6,()=>.5,C39.fog,3910);
  /* the shutter disc: one window, turning */
  B.flush(); h7_box(g,L.px,L.py,L.px+P,L.py+P,C39.hair);
  
  { const [x,y,s]=L.mp; h7_box(g,x,y,x+s,y+s,C39.hair); h7_lab(g,'Stack count · per '+L.cs+' px region',x,y-12,C39.soft,9); }
  { const [x,y,s]=L.dk; if(!L.ph) h7_lab(g,'Shutter disc',x,y+s+18,C39.soft,9); }
  /* legend: dot size is the count; red is all twelve */
  { const B2=new M.Buf(g), cell=L.cs*L.mp[2]/P; [1,4,8,11,12].forEach((c,i)=>{ const x=L.lg[2]==='row'?L.lg[0]+6+i*44:L.lg[0]+6, y=L.lg[2]==='row'?L.lg[1]:L.lg[1]+i*24; B2.dot(x,y,Math.max(.5,cell*.5*Math.sqrt(c/N39)),c===12?C39.acc:C39.ink); }); B2.flush(); }
  [1,4,8,11,12].forEach((c,i)=>{ const row=L.lg[2]==='row', x=row?L.lg[0]+16+i*44:L.lg[0]+18, y=row?L.lg[1]+3.5:L.lg[1]+i*24+3.5; h7_lab(g,String(c)+(c===12?' · all':''),x,y,c===12?C39.acc:C39.soft,9); });
  h7_root(g,L.root,L.pad,L.rootY,C39.soft); }
/* during a run, only the parts that change are restored from the base and redrawn (the base is not re-blitted whole) */
function h7_regions39(L,w,parts){ const r=[], c=(x,y,ww,hh)=>{ const x0=Math.max(0,x), y0=Math.max(0,y); r.push([x0,y0,Math.min(w,x+ww)-x0,hh-(y0-y)]); };
  if(parts.P) c(L.px-20,L.py-20,L.P+40,L.P+44); if(parts.D) c(L.dk[0]-14,L.dk[1]-16,L.dk[2]+28,L.dk[2]+26); if(parts.R) c(L.rd[0],L.rd[1]-10,w-L.rd[0],3*34+14);
  if(parts.A) c(L.mp[0]-10,L.mp[1]-10,L.mp[2]+20,L.mp[2]+20); if(parts.T) c(L.fr[0]-2,L.fr[1]-2,L.inner+4,L.fr[2]*(L.fw+44)+2);
  return r; }
let h7_RN39=null;
const h7_base39=(st,w,h)=>h7_baseGet('base39',h7_DK(w,h),w,h,g=>h7_paint39(g,st,w,h));
/* thumbnails for the first ne exposures lit, the rest waiting: one sprite per count */
const h7_thumbsN39=(L,ne)=>h7_slot('thN39',L.fw+'|'+L.P+'|'+L.inner+'|'+ne+'@'+h7_dpr(),()=>{ const o=h7_off(L.inner,L.fr[2]*(L.fw+44)), B=new M.Buf(o.g); h7_thumbsP39(B,L,0,0,e=>e<ne); B.flush(); return o.cv; });
/* parts: P plate (+ loupe, plate label), D disc, A stack map, T thumbnails, R readings. A still draws all of them. */
function h7_draw39(g,w,h,st,t,parts){ const L=lay39(w), D=h7_data39(L), live=t!=null, P=L.P, on=k=>!parts||parts[k];
  const TL=m4_tl39(st.n), neAt=tt=>{ let k=0; while(k<st.n&&TL.te[k]<=tt) k++; return k; }, ne=live?neAt(t):st.n, neM=live?neAt(t-48):st.n, ang=live?t/BAR39*TAU:0;
  /* the cold still paints straight onto the frame; the sprites for animation and pointer redraws are built when idle */
  const cold=!live&&!h7_has39(L,ne,st.n), B=new M.Buf(g);
  if(cold) (window.requestIdleCallback||setTimeout)(()=>{ h7_plateS39(L,ne); h7_map39(L,ne); h7_thumbsN39(L,ne); h7_disc39(L.dk[2],st.n); });
  if(on('P')){ if(cold){ for(let e=0;e<ne;e++){ const X=D.ex[e]; for(let i=0;i<X.X.length;i++) B.dot(L.px+X.X[i],L.py+X.Y[i],X.r,C39.ink); } }
    else if(ne>0) g.drawImage(live?h7_plate39(L,ne):h7_plateS39(L,ne),L.px,L.py,P,P);
    /* the plate flashes with each exposure: that exposure's dots, struck again larger as its note sounds */
    if(live) for(let e=Math.max(0,ne-3);e<ne;e++){ const ef=m4_qe(m4_e(st,'x'+e,t,150)); if(ef<.05) continue; const X=D.ex[e]; for(let i=0;i<X.X.length;i+=2) B.dot(L.px+X.X[i],L.py+X.Y[i],X.r*(1+.9*ef),C39.ink); } }
  /* the shutter disc */
  if(on('D')){ const [x,y,s]=L.dk, cx=x+s/2, cy=y+s/2, R=s*.46;
    if(cold) h7_discP39(B,s,x,y,st.n); else { const sp=h7_disc39(s,st.n); g.save(); g.translate(cx,cy); g.rotate(ang%TAU); g.drawImage(sp,-s/2,-s/2,s,s); g.restore(); }
    for(let i=0;i<N39;i++){ const a=-Math.PI/2+i/N39*TAU, r1=R+5; B.dot(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1,i<ne?.95:.6,i<ne?C39.ink:C39.dim); }
    /* the lens position: top */ B.dot(cx,cy-R-11,1.1,C39.ink); }
  /* the stack map: dot size from the count, red where all twelve stack */
  const [mx,my,ms]=L.mp, gw=D.gw, sc=ms/P, cur=(1<<ne)-1;
  let MP=null; if(neM>0){ if(cold) MP=on('A')?h7_mapP39(B,L,neM,mx,my):null; else { MP=h7_map39(L,neM); if(on('A')) g.drawImage(MP.cv,mx,my,ms,ms); } }
  const n12=MP?MP.n12:0, nAny=MP?MP.nAny:0;
  /* where all twelve stack, the red answers the stack chord */
  { const es=live&&on('A')&&neM===N39?m4_qe(m4_e(st,'stack',t,420)):0; if(es>.05){ const full=(1<<N39)-1; for(let j=0;j<gw;j++) for(let i=0;i<gw;i++) if(D.mask[j*gw+i]===full) B.dot(mx+(i+.5)*D.cs*sc,my+(j+.5)*D.cs*sc,D.cs*sc*.5*(1+.8*es),C39.acc); } }
  /* the twelve exposures, each alone */
  const [fx,fy,rows]=L.fr, per=12/rows, gp=8;
  if(on('T')){ if(cold) h7_thumbsP39(B,L,fx,fy,e=>e<ne); else g.drawImage(h7_thumbsN39(L,ne),fx,fy,L.inner,rows*(L.fw+44)); }
  /* pointer: the region under the loupe */
  let hv=null; if(on('P')&&st.hx!=null){ const ix=(st.hx/D.cs)|0, iy=(st.hy/D.cs)|0; if(ix>=0&&iy>=0&&ix<gw&&iy<gw){ hv={ix,iy,c:h7_pop(D.mask[iy*gw+ix]&cur)};
    M.ring(B,{cx:L.px+st.hx,cy:L.py+st.hy,R:16,w:1,swell:.1,dpl:1.4,rCore:.65,rEdge:.5,seed:3930,color:C39.ink});
    M.ring(B,{cx:mx+(ix+.5)*D.cs*sc,cy:my+(iy+.5)*D.cs*sc,R:6,w:.9,swell:.1,dpl:1.6,rCore:.6,rEdge:.5,seed:3931,color:C39.ink}); } }
  B.flush();
  if(on('T')) for(let e=0;e<N39;e++){ const r=Math.floor(e/per), c=e%per, x=fx+c*(L.fw+gp), y=fy+r*(L.fw+44)+L.fw+14, lit=e<ne;
    const k=D.ex[e].k; h7_lab(g,String(e+1).padStart(2,'0'),x,y,lit?C39.ink:C39.dim,9); h7_lab(g,k<.5?'loose':k<.9?'settling':'in tune',x,y+14,lit?C39.soft:C39.dim,9); }
  if(on('R')){ const [x,y]=L.rd; const rows2=[['Exposures',ne+' of 12'],['All twelve',neM===N39?n12+' regions':'needs all 12'],['Any exposure',nAny+' regions']];
    rows2.forEach((r,i)=>{ h7_lab(g,r[0],x,y+i*34+4,i===1?C39.acc:C39.soft,9); M.text(g,r[1],x,y+i*34+20,{font:'mono',size:11,weight:400,track:.02,color:C39.ink}); }); }
  if(on('P')){ if(hv){ const lx=Math.min(L.px+st.hx+22,L.px+P-120), ly=Math.max(L.py+16,L.py+st.hy-20); h7_lab(g,'stack '+hv.c+' of '+ne,lx,ly,C39.ink,9.5); }
    h7_lab(g,st.hint&&!hv?'Fixed plate · point to read a region':'Fixed plate',L.px,L.py+P+16,C39.soft,9); }
  return {ne,neM}; }
/* music · L-39: 100 BPM 4/4 in D Dorian (night). n exposures are an n-tuplet: the disc (n windows, one turn a bar) clicks n times
   across the bar against a steady four (a plucked D and A). Each exposure is a vibraphone note of the motif, 5 1 4 while the field is
   loose, 5 1 3 once it reads in tune (from exposure 7), the second three an octave up; loose exposures land a little off the grid.
   The harmony follows the field: Dsus4 until the first in-tune exposure, then D minor. On the next downbeat the plate stacks: every
   exposure's note at once, with a bell on the chord tone; with all twelve, the third, the meet and the bass. */
const BPM39=100, BAR39=4*60000/BPM39;
function m4_tl39(n){ return h7_slot('tl39',n,()=>{ const te=[]; for(let i=0;i<n;i++){ const k=k39(i), j=i?(M.hash2(i,n,393)-.5)*2*(1-k)*28:0; te.push(i*BAR39/n+j); } return {te}; }); }
const m4_pitch39=(md,i)=>{ const k=k39(i), d=[-3,0,k>=.9?2:3][i%3]; return M.music.deg(md,d,4+Math.min(1,Math.floor(i/3))); };
function m4_music39(st){ const n=st.n, TL=m4_tl39(n), mu=M.music, Sc=mu.score({bpm:BPM39,meter:[4,4],ground:'night'}), md=Sc.mode, bt=BAR39/4;
  let tin=null; for(let i=0;i<n;i++) if(k39(i)>=.9){ tin=TL.te[i]; break; } const fin=tin==null?'Dsus4':'Dm';
  Sc.harm(tin==null?[[0,'Dsus4']]:[[0,'Dsus4'],[tin,'Dm']]);
  Sc.chord(20,'pad',mu.voice('Dsus4','A3','A4',3),BAR39+60,{attack:.2,release:.3,cutoff:900,vel:.3});
  /* the steady four */
  for(let b=0;b<4;b++) Sc.note(b*bt,'pluck',b%2?'A1':'D2',bt*.8,{cutoff:380,vel:b?.46:.54,hp:35,pan:-.1});
  /* the n-tuplet: shutter and note per exposure */
  const ps=[]; for(let i=0;i<n;i++){ const t=TL.te[i], k=k39(i), m=m4_pitch39(md,i), pan=Math.sin(i/n*TAU)*.6; ps.push(m);
    Sc.hitSound(t,'shutter',{vel:.26+.1*k,speed:.03+.035*(1-k),pan});
    Sc.note(t,'mallet',m,900,{vel:.34+.1*k,trem:5,bright:.9,pan,over:t>=(tin==null?1e9:tin)?'Dm':'Dsus4'},['x'+i,1]); }
  /* the stack: everything exposed, at once */
  const un=[...new Set(ps.map(m=>m4_res39(md,m,fin)))].sort((a,b)=>a-b).slice(-5);
  Sc.chord(BAR39,'mallet',un,2200,{vel:.36,trem:5,over:fin},['stack',1]);
  if(n===N39){ Sc.note(BAR39,'bass','D2',700,{from:'A1',glide:90,env:2.6,decay:.4,vel:.56}); Sc.note(BAR39+bt/2,'meet',mu.deg(md,2,5),1900,{spread:28,vel:.5}); Sc.note(BAR39+bt/2,'bell',mu.deg(md,2,6),2200,{vel:.24,ratio:3.5,pan:.2}); }
  else { Sc.note(BAR39,'pluck','D2',700,{cutoff:380,vel:.55,hp:35}); Sc.chord(BAR39,'pad',mu.voice(fin,'A3','A4',3),2000,{attack:.05,release:1,cutoff:1100,vel:.34}); Sc.note(BAR39+bt/2,'bell',mu.deg(md,4,5),1800,{vel:.22,ratio:3.5,pan:.2}); }
  Sc.end(BAR39+2200); return m4_gain(Sc.out(),n===N39?1.2:1.9+.5*(1-n/N39)); }
/* a stacked note on the final chord: the suspended fourth falls to the third once the field is in tune */
const m4_res39=(md,m,fin)=>fin==='Dm'&&(((m-2)%12+12)%12)===5?m-2:m;
/* Exposures as music: the new tuplet, played across one beat (all n windows passing), with the shutter on the first */
function m4_param39(A,st,id,ov,nv){ if(id!=='n') return false; const now=A.now(); if(!now||!m4_ok(st,'pn',260)) return true; const n=+nv, md='dorian', sp=.5/n;
  A.play('shutter',{vel:.3,speed:.03,when:now+.005}); for(let i=0;i<n;i++){ const m=m4_pitch39(md,i); A.play('mallet',{freq:m4_hz(m,k39(i)>=.9?'Dm':'Dsus4'),dur:.5,vel:.3,trem:5,pan:Math.sin(i/n*TAU)*.6,when:now+.005+i*sp}); }
  return true; }
/* pointing: a region's stack count is a step up the scale (a count is a run); all twelve ring a bell on a D minor tone set by the ring */
function m4_ptr39(st,e){ const s=m4_S(st); if(st.hx==null){ s.cell=null; return; } const L=lay39(e.w), D=h7_data39(L), ix=(st.hx/D.cs)|0, iy=(st.hy/D.cs)|0;
  if(ix<0||iy<0||ix>=D.gw||iy>=D.gw) return; const key=ix+','+iy; if(key===s.cell) return; s.cell=key; const c=h7_pop(D.mask[iy*D.gw+ix]&((1<<st.n)-1));
  if(!c||!m4_ok(st,'pt',85)) return; const mu=M.music;
  if(c===N39){ const r=Math.hypot(st.hx-L.P/2,st.hy-L.P/2)/(L.P*.43); m4_play('L-39','bell',{freq:m4_hz(mu.ct('Dm','D5',Math.min(6,Math.round(r*6))),'Dm'),vel:.36,dur:1.4,ratio:3.5}); }
  else m4_play('L-39','mallet',{freq:m4_hz(mu.deg('dorian',c-1,4),'Dm'),dur:.6,vel:.16+.26*c/N39,trem:5}); }
M.piece({ id:'L-39',
  caption:'Twelve exposures of one field on a fixed plate, after Marey (1882); loose dots leave trails and settled dots land on themselves. The stack map counts the exposures in each region; point at the plate to read one.',
  alt:'A black square plate with a ring figure in white dots, sharp at the rings and smeared into short trails between them. Beside it a shutter disc with one window and a dot map in which ring paths show as large dots, some red. Below, twelve small frames show each exposure alone.',
  recipe:{
    idea:'Agreement is what stays put: across many exposures, only what has settled stacks into a figure.',
    marks:['ring','blade','center','dot'],
    ground:'night',
    accent:'red in the stack map only: regions where all twelve exposures put a dot',
    composition:'A large square plate at left; the shutter disc, three readings and the stack map at right; the twelve single exposures in a row underneath (two rows of six on a phone).',
    motion:'At 100 BPM the disc, with one window per exposure, turns once a bar, so n exposures land as an n-tuplet against four beats (loose ones slightly off the grid); each exposure strikes the plate again as its note sounds; the stack map’s red answers the stack chord on the next downbeat. Reduced motion shows the finished plate.',
    sound:'n exposures are an n-tuplet of shutter clicks and vibraphone notes against a steady four: the motif with its fourth while loose, its third once in tune. On the next downbeat every note stacks; with all twelve, the third and the meet.',
    controls:['Exposures 1–12','pointer: read a region’s stack count'],
    computed:['exposure i: k = .3 + .7·outCubic(i/11), dot at settled + (1 − k)·offset','exposure i keeps dots with hash < 1 − .045·i (fainter)','stack count per region = popcount of a 12-bit mask of exposures that hit the cell'],
    placeholder:['the field (seeded)','loose offsets (seeded)','interval 1/12 s'],
    root:'Étienne-Jules Marey, presented 3 July 1882 to the Académie des sciences: a fixed-plate chronophotographic camera with a rotating disc shutter, figures in white against black velvet at the Station physiologique, many phases on one plate. Sources: numerabilis.u-paris.fr/medica/bibliotheque-numerique/presentations/marey/03-en.php, victorian-cinema.net/marey',
    rules:['the plate is monochrome; no red on the plate','each exposure is drawn from the same dot identities'],
    engine:['M.mirField','M.ring','M.hash2','M.Buf']},
  aspect:w=>w/lay39(w).H,
  state:{n:12,hint:true},
  controls:[{id:'n',type:'range',label:'Exposures',min:1,max:12,step:1,fmt:v=>v+' of 12'}],
  pointer(st,e){ const L=lay39(e.w), x=e.x-L.px, y=e.y-L.py, inside=x>=0&&y>=0&&x<L.P&&y<L.P;
    if(e.type==='up'&&!inside) return false; if(inside){ st.hx=x; st.hy=y; st.hint=false; m4_ptr39(st,e); return true; } if(st.hx!=null){ st.hx=null; st.hy=null; m4_ptr39(st,e); return true; } return false; },
  music:m4_music39, musicParam:m4_param39, musicIns:'mallet',
  render(g,w,h,M,st){ h7_baseOr(g,'base39',h7_DK(w,h),w,h,q=>h7_paint39(q,st,w,h)); h7_draw39(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ t=Math.max(0,t); if(h7_RM()){ h7_blit(g,h7_base39(st,w,h)); h7_draw39(g,w,h,st,null); return false; } const base=h7_base39(st,w,h), fresh=!h7_RN39||h7_RN39.g!==g||h7_RN39.w!==w||t<h7_RN39.t;
    const TL=m4_tl39(st.n), neAt=tt=>{ let k=0; while(k<st.n&&TL.te[k]<=tt) k++; return k; }, ne=neAt(t), neM=neAt(t-48), fl=m4_e(st,'x*',t,150)>.04, fs=m4_e(st,'stack',t,420)>.04;
    let parts=null; if(fresh) h7_blit(g,base); else { const pv=h7_RN39; parts={D:1,P:ne!==pv.ne||st.hx!=null||fl||pv.fl,T:ne!==pv.ne,A:neM!==pv.neM||fs||pv.fs,R:ne!==pv.ne||neM!==pv.neM};
      const d=h7_dpr(); h7_regions39(lay39(w),w,parts).forEach(([x,y,ww,hh])=>g.drawImage(base,x*d,y*d,ww*d,hh*d,x,y,ww,hh)); }
    h7_draw39(g,w,h,st,t,parts); h7_RN39={g,w,t,ne,neM,fl,fs}; return t<BAR39+1900; } });


/* ════════════════════════════════════════════════════════════════════════
   L-40 · Test strip: one print exposed in five strips, each a stop more than the last.
   COMPUTED: strip times t_i = base · 2^(i−2), i = 0…4, so each strip is one stop (×2 light) from its neighbor.
   Print density at a point: D = 1 / (1 + e^(−1.5·(log2(t/T0) + log2(v) − s0))), a placeholder paper curve, where v is the
   negative's light at that point (rings 1, halo, fog .03), T0 = 8 s, s0 = −1.4. Dots: keep with probability D, radius grows
   with D (AM on FM), so overexposure fattens and merges.
   Separation per strip = mean D on ring cores − mean D midway between rings; the pencil goes to the strip with the most.
   ════════════════════════════════════════════════════════════════════════ */
const P40=M.PAL.paper, C40={ground:P40.ground, stock:'#ffffff', ink:P40.ink, soft:h7_mix(P40.ground,P40.ink,.64), dim:h7_mix(P40.ground,P40.ink,.4), hair:h7_mix(P40.ground,P40.ink,.2),
  card:h7_mix(P40.ground,P40.ink,.5), pencil:h7_mix(P40.ground,'#4a4f57',.86), acc:P40.center};
const T40='Test strip';
const SUB40='One print exposed in five strips, each with twice the light of the last.';
const ROOT40='Root · darkroom test strip, f-stop method (Gene Nocon): doubling the time adds one stop. Simplified: paper curve.';
const T0_40=8, S0_40=-1.3, G40=1.5, VE40=Math.exp(-6.25)+.32*Math.exp(-6.25/9);
const h7_D40=s=>1/(1+Math.exp(-G40*(s-S0_40)));
const lay40=h7_memo(function(w){ const T=h7_T(w,SUB40,520,640), o=Object.assign({},T), {ph,pad,inner}=T;
  o.nt=ph?[pad,T.top-8]:[pad+inner-Math.min(300,inner*.3),44]; let y=ph?T.top+2*30+4:T.top;
  o.px=pad; o.pw=inner; o.py=y+26; o.ph2=h7_q(ph?inner*1.25:Math.min(inner*.42,480)); o.sw=o.pw/5; y=o.py+o.ph2;
  o.sepY=y+22; y+=ph?66:44; o.noteY=y; y+=34;
  o.root=h7_wrap(ROOT40,inner,h7_ROOT); o.rootY=y+10; o.H=h7_q(o.rootY+(o.root.length-1)*14+pad); return o; });
/* the negative's light: concentric rings across the whole print, blades near the middle, fog elsewhere */
function h7_v40(L){ const cx=L.px+L.pw/2, cy=L.py+L.ph2*.5, R=L.ph?L.ph2*.62:L.pw*.52, nr=L.ph?7:10, step=R/nr, bl=[];
  for(let b=0;b<8;b++) bl.push(M.shape.blade(cx,cy,b/8*TAU+TAU/16,step*1.6,step*3.4,step*.55));
  const f=M.shape.max(...bl);
  return {cx,cy,R,step,v:(x,y)=>{ const r=Math.hypot(x-cx,(y-cy)*1.04), i=Math.round(r/step); let ring=0;
    if(i>=1&&i<=nr){ const d=Math.abs(r-i*step), wd=1.4+i*.08; ring=Math.exp(-(d*d)/(wd*wd))+.32*Math.exp(-(d*d)/(wd*wd*9)); }
    if(r<step*.7){ const d=Math.abs(r-step*.45); ring=Math.max(ring,Math.exp(-(d*d)/2.2)); }
    const fb=r>step*1.45&&r<step*3.55?f(x,y)*.7:0; return Math.max(.03,Math.min(1,Math.max(ring,fb))); }}; }
const h7_t40=(base,i)=>base*Math.pow(2,i-2);
/* per strip: ring-core density, gap density, separation (computed from the same curve and v) */
function h7_sep40(base){ const vr=1, vg=VE40; return [0,1,2,3,4].map(i=>{ const s=Math.log2(h7_t40(base,i)/T0_40), ring=h7_D40(s+Math.log2(vr)), gap=h7_D40(s+Math.log2(vg)); return {t:h7_t40(base,i),stops:i-2,ring,edge:gap,sep:ring-gap}; }); }
/* the print's dots, with their development order (a dot appears when developer density reaches its threshold) */
function h7_dots40(L,base){ return h7_slot('dots40',L.pw+'|'+L.ph2+'|'+base+'|'+h7_dpr(),()=>{ const V=h7_v40(L), sp=L.ph?1.45:1.6, R=M.rng(4001), X=[], Y=[], Rd=[], Td=[];
  for(let y=L.py;y<L.py+L.ph2;y+=sp) for(let x=L.px;x<L.px+L.pw;x+=sp){ const px=x+(.12+.76*R())*sp, py=y+(.12+.76*R())*sp, u=R(); if(px>=L.px+L.pw||py>=L.py+L.ph2) continue;
    const i=Math.min(4,Math.floor((px-L.px)/L.sw)), D=h7_D40(Math.log2(h7_t40(base,i)/T0_40)+Math.log2(V.v(px,py))); if(u>=D) continue;
    X.push(px); Y.push(py); Rd.push(.42+.62*D); Td.push(-Math.log(1-Math.min(.999,u/D))/3); }
  /* counting sort into 256 bins of development time (order inside a bin does not matter at 60 fps) */
  const n=X.length, NB=256, TM=2.31, bin=new Uint32Array(NB+1), bi=new Uint16Array(n); for(let i=0;i<n;i++){ const k=Math.min(NB-1,(Td[i]/TM*NB)|0); bi[i]=k; bin[k+1]++; } for(let k=0;k<NB;k++) bin[k+1]+=bin[k];
  const oX=new Float32Array(n), oY=new Float32Array(n), oR=new Float32Array(n), oT=new Float32Array(n);
  for(let i=0;i<n;i++){ const k=bin[bi[i]]++; oX[k]=X[i]; oY[k]=Y[i]; oR[k]=Rd[i]; oT[k]=(bi[i]+1)/NB*TM; } return {X:oX,Y:oY,R:oR,T:oT,n}; }); }
function h7_paint40(g,st,w,h){ const L=lay40(w), S=h7_sep40(st.base);
  M.fill(g,C40.ground); h7_title(g,L,'L-40 · Pairing · darkroom test strip','',T40,C40.ink,C40.soft);
  /* print notes: the settings a printer writes down (placeholders) */
  { const [x,y]=L.nt, rows=[['Lens','f/8'],['Paper','grade 2 · RC'],['Developer','90 s'],['Base',st.base+' s']], cw=L.ph?(L.inner)/2:150;
    rows.forEach((r,i)=>{ const c=L.ph?i%2:0, rr=L.ph?Math.floor(i/2):i, xx=x+c*cw, yy=y+rr*(L.ph?30:17); if(L.ph){ h7_lab(g,r[0],xx,yy,C40.soft,9); M.text(g,r[1],xx,yy+14,{font:'mono',size:10,weight:400,track:.02,color:C40.ink}); }
      else { h7_lab(g,r[0],xx,yy,C40.soft,9); M.text(g,r[1],xx+92,yy,{font:'mono',size:10,weight:400,track:.02,color:C40.ink}); } }); }
  /* the print: white stock, a hairline, strip times along the top margin */
  M.fill(g,C40.stock,L.px,L.py,L.pw,L.ph2); h7_box(g,L.px,L.py,L.px+L.pw,L.py+L.ph2,C40.hair);
  S.forEach((s,i)=>{ const x=L.px+i*L.sw; const tt=(s.t<1?s.t.toFixed(2):s.t%1?s.t.toFixed(1):String(s.t))+' s', so=s.stops===0?'base':(s.stops>0?'+':'−')+Math.abs(s.stops)+' stop'+(Math.abs(s.stops)===1?'':'s');
    const tw=h7_lab(g,tt,x+(L.ph?4:8),L.py-10,C40.ink,9.5); if(L.sw>=90) h7_lab(g,'· '+so,x+8+tw+8,L.py-10,C40.soft,9); if(i){ const B0=new M.Buf(g); for(let k=0;k<3;k++){ B0.dot(x,L.py-3-k*2,.55,C40.dim); B0.dot(x,L.py+L.ph2+3+k*2,.55,C40.dim); } B0.flush(); }
    if(L.ph) h7_lab(g,'sep '+s.sep.toFixed(2),x+4,L.sepY,C40.soft,9); else { h7_lab(g,'ring '+s.ring.toFixed(2)+' · edge '+s.edge.toFixed(2),x+8,L.sepY,C40.soft,9); } });
  if(L.ph) h7_lab(g,'separation = ring − edge',L.pad,L.sepY+18,C40.soft,9);
  h7_root(g,L.root,L.pad,L.rootY,C40.soft); }
const h7_base40=(st,w,h)=>h7_baseGet('base40',h7_DK(w,h)+'|'+st.base,w,h,g=>h7_paint40(g,st,w,h));
/* the opaque card, as a cached tone the size of the print; a frame clips it to the strips it covers */
function h7_card40(L){ return h7_slot('card40',L.pw+'|'+L.ph2+'@'+h7_dpr(),()=>{ const o=h7_off(L.pw,L.ph2), B=new M.Buf(o.g); h7_lat(B,[0,0,L.pw,L.ph2],3.2,()=>.7,()=>.65,C40.card,4010); B.flush(); return o.cv; }); }
/* the incremental layer: development only ever adds dots, so a frame draws only the new ones */
let h7_L40=null;
function h7_draw40(g,w,h,st,t){ if(t==null){ const L0=lay40(w); (window.requestIdleCallback||setTimeout)(()=>h7_card40(L0)); } const L=lay40(w), Dd=h7_dots40(L,st.base), S=h7_sep40(st.base), live=t!=null;
  const EXP=EXP40, DEV=DEV40, best=S.reduce((b,s,i)=>s.sep>S[b].sep?i:b,0);
  let dev=live?cl((t-EXP)/DEV)*1.4:1e9; const key=h7_DK(w,h)+'|'+st.base;
  if(!live){ /* the still: every dot straight onto the frame */ h7_L40=null; const B=new M.Buf(g); for(let i=0;i<Dd.n;i++) B.dot(Dd.X[i],Dd.Y[i],Dd.R[i],C40.ink); B.flush(); }
  else { if(!h7_L40||h7_L40.key!==key||dev<h7_L40.dev){ h7_L40={key,cv:null,g:null,i:0,dev:0}; }
    const Ly=h7_L40; if(!Ly.cv){ const o=h7_off(w,h); Ly.cv=o.cv; Ly.g=o.g; }
    const B=new M.Buf(Ly.g); while(Ly.i<Dd.n&&Dd.T[Ly.i]<=dev){ B.dot(Dd.X[Ly.i],Dd.Y[Ly.i],Dd.R[Ly.i],C40.ink); Ly.i++; } B.flush(); Ly.dev=dev;
    h7_blit(g,Ly.cv); }
  const B2=new M.Buf(g);
  /* exposing: the card covers one more strip at each step (cumulative times 2, 4, 8, 16, 32 at base 8) */
  if(live&&t<EXP){ const step=Math.min(4,Math.floor(t/(EXP/5))); if(step>0){ const cd=h7_card40(L); g.save(); g.beginPath(); g.rect(L.px,L.py,step*L.sw,L.ph2); g.clip(); g.drawImage(cd,L.px,L.py,L.pw,L.ph2); g.restore(); } }
  /* each strip answers its timer beep (a dotted edge along its top) and its note entering as it develops (along its foot) */
  if(live) for(let i=0;i<5;i++){ const eb=m4_qe(m4_e(st,'k'+i,t,170)), ed=m4_qe(m4_e(st,'b'+i,t,320)), x0=L.px+i*L.sw+3, x1=L.px+(i+1)*L.sw-3;
    if(eb>.05) h7_seg(B2,x0,L.py+2,x1,L.py+2,C40.ink,{seed:4030+i,dpl:.8,spread:.1,r:.5+.5*eb,even:true}); if(ed>.05) h7_seg(B2,x0,L.py+L.ph2-2,x1,L.py+L.ph2-2,C40.ink,{seed:4040+i,dpl:.8,spread:.1,r:.5+.5*ed,even:true}); }
  /* the chosen step: a red bracket under the strip, once the print has come up; it strikes again with the cadence */
  const showNote=!live||t>=CAD40, ec=live?m4_qe(m4_e(st,'cad',t,500)):0, rb=1+.8*ec;
  if(showNote){ const x0=L.px+best*L.sw+6, x1=L.px+(best+1)*L.sw-6, y=L.py+L.ph2+8; h7_seg(B2,x0,y,x1,y,C40.acc,{seed:4020,dpl:1.4,spread:.35,r:.75*rb}); h7_seg(B2,x0,y-5,x0,y,C40.acc,{seed:4021,dpl:1.4,spread:.3,r:.7*rb}); h7_seg(B2,x1,y-5,x1,y,C40.acc,{seed:4022,dpl:1.4,spread:.3,r:.7*rb}); }
  B2.flush();
  if(live&&t<EXP){ const step=Math.min(4,Math.floor(t/(EXP/5))), cum=h7_t40(st.base,step); h7_lab(g,'exposing · '+(cum%1?cum.toFixed(1):cum)+' s total',L.px+L.pw,L.noteY,C40.ink,9.5,{align:'right'}); }
  else if(live&&dev<1.4){ h7_lab(g,'developing · '+Math.round(cl((t-EXP)/DEV)*90)+' of 90 s',L.px+L.pw,L.noteY,C40.ink,9.5,{align:'right'}); }
  if(showNote){ const s=S[best], tt=(s.t%1?s.t.toFixed(1):s.t)+' s', x=L.px+best*L.sw+(L.ph?4:8);
    M.text(g,tt+' · this one'+(L.ph?'':', grade 2'),Math.min(x,L.px+L.pw-h7_tw(tt+' · this one, grade 2',{font:'mono',size:11})-4),L.noteY,{font:'mono',size:11,weight:400,track:.02,color:C40.pencil}); } }
/* music · L-40: 100 BPM 4/4, the exposing strips on eighths and developing for one bar. Each stop doubles the time, so each strip's
   timer beep is the same D an octave higher; the base exposure sets the starting octave, and beeps that would pass D7 stay there
   (the paper saturates). A safelight hum (D and A) holds under it. Developing is the chord blooming: a strip's note (A3, D4, F♯4, A4,
   D5, brighter strips higher) enters when its ring density crosses a threshold, so dense strips sound first and a strip too faint
   never sounds. When the bracket appears, the chosen strip is a cadence on the ober (IV, V7, I) that lands on the downbeat with the bass. */
const BPM40=100, E40=60000/BPM40/2, EXP40=5*E40, DEV40=8*E40, CAD40=12*E40, ARR40=16*E40;
const m4_oct40=b=>({2:2,4:3,8:4,16:5})[b]||4;
function m4_music40(st){ const base=st.base, S=h7_sep40(base), best=S.reduce((b,x,i)=>x.sep>S[b].sep?i:b,0), mu=M.music, Sc=mu.score({bpm:BPM40,meter:[4,4],ground:'paper'});
  Sc.harm([[0,'D'],[CAD40,'G'],[CAD40+2*E40,'A7'],[ARR40,'D']]);
  Sc.hitSound(0,'drone',{freq:mu.hz('D3','D'),ratio:1.5,level:.2,cutoff:700,fade:.6,dur:(CAD40-600)/1000});
  /* exposing: beeps an octave apart (to the ceiling), the card sliding over each next strip */
  for(let k=0;k<5;k++){ const t=k*E40, o=Math.min(7,m4_oct40(base)+k); Sc.note(t,'pulse',12*(o+1)+2,90,{pw:.25,cutoff:3000,env:.8,vel:.36,pan:(k/4-.5)*.8},['k'+k,1]); if(k) Sc.hitSound(t,'paper',{dur:.14,vel:.32,freq:3000,pan:(k/4-.5)*.8}); }
  /* developing: notes enter by threshold */
  const th=.35, lad=['A3','D4','F#4','A4','D5'], ent=[]; S.forEach((x,i)=>{ if(x.ring<=th) return; const tau=-Math.log(1-th/x.ring)/3, t=EXP40+Math.round(Math.min(1.35,tau)/1.4*DEV40/(E40/2))*(E40/2); ent.push([t,i]); });
  const used=new Set(); ent.sort((a,b)=>a[0]-b[0]).forEach(([t,i])=>{ while(used.has(t)) t+=E40/2; used.add(t); Sc.chord(t,'pad',[lad[i]],CAD40-t+150,{attack:.12,release:.4,cutoff:900+300*i,vel:.26,pan:(i/4-.5)*.8},['b'+i,1]); });
  Sc.hitSound(EXP40,'noise',{color:.16,level:.03,fade:.4,dur:DEV40/1000-.4});
  /* the cadence on the chosen strip: IV, V7, I, its top note by which strip was chosen */
  const top=['C#5','E5','G5','E5','C#5'][best], pan=(best-2)*.22;
  [[0,'B4','G'],[1,'D5','G'],[2,top,'A7'],[3,'C#5','A7'],[4,'D5','D']].forEach(([k,n,c])=>Sc.note(CAD40+k*E40,'ober',n,k===4?1600:E40*.95,{vel:.42,cutoff:1300,vibrato:k===4?10:4,pan,release:k===4?.6:.12},['o'+k,1]));
  Sc.chord(CAD40,'pluck',mu.voice('G','G3','G4',3),300,{cutoff:800,vel:.38}); Sc.note(CAD40,'pluck','G2',500,{cutoff:380,vel:.5,hp:35});
  Sc.chord(CAD40+2*E40,'pluck',['A3','C#4','G4'],300,{cutoff:800,vel:.38}); Sc.note(CAD40+2*E40,'pluck','A1',500,{cutoff:380,vel:.5,hp:35});
  Sc.note(ARR40,'bass','D2',700,{from:'A1',glide:90,env:2.6,decay:.4,vel:.58},['cad',1]); Sc.chord(ARR40,'mallet',['D4','F#4','A4'],1800,{vel:.34,trem:5}); Sc.note(ARR40+E40,'bell','F#5',2000,{vel:.24,ratio:3.5,pan});
  Sc.end(ARR40+2000); return m4_gain(Sc.out(),1.3); }
M.piece({ id:'L-40',
  caption:'One print exposed in five strips, each with twice the light of the last; too little reads loose and faint, too much dense and overstated. Change the base exposure and the pencil moves to the strip that separates best.',
  alt:'A white print on a white page, divided into five vertical strips labeled 2, 4, 8, 16 and 32 seconds. The same stippled ring field crosses all five: faint and sparse at left, clean in the middle, heavy and merged at right. A red bracket and a pencil note mark the 8 second strip.',
  recipe:{
    idea:'Tuning a response is a test strip: the same picture at five strengths, and the right one is chosen by looking.',
    marks:['ring','blade','dot'],
    ground:'paper',
    accent:'the red bracket under the chosen strip',
    composition:'Title left with print notes at right; the print spans the full width in five equal strips with times above and densities below; the pencil note under the chosen strip.',
    motion:'At 100 BPM: exposing on eighths, a card covering one more strip each (1.5 s), each strip’s top edge flashing on its beep; developing for one bar, dots up in order of their thresholds, each strip’s foot flashing as its note enters; the bracket on beat 3 of bar 2, striking again on the cadence. Reduced motion shows the developed print.',
    sound:'Each stop doubles the time, so each timer beep is the same D an octave higher, up to a ceiling. Developing, the chord blooms as each strip crosses a density threshold (faint strips never sound); the chosen strip is an ober cadence home to D.',
    controls:['Base exposure 2–16 s'],
    computed:['strip times t = base · 2^(i − 2), one stop apart','density D = logistic(1.5 · (log2(t/8 s) + log2(v) + 1.4)) per point','separation = D(ring core) − D(ring edge, 2.5 widths out); the pencil marks the maximum'],
    placeholder:['paper curve constants','print notes (lens, paper, developer)','the field'],
    root:'Darkroom practice. A test strip exposes one sheet in steps; the linear habit adds a fixed 5 s per step, while f-stop printing doubles the time so each step is one stop. 35mmc credits Gene Nocon as the method’s main champion. Source: 35mmc.com/02/02/2024/f-stop-printing-in-the-darkroom/',
    rules:['the print and page are neutral white, never cream','one field crosses all five strips; only the exposure changes'],
    engine:['M.Buf','M.shape.blade','M.rng']},
  aspect:w=>w/lay40(w).H,
  state:{base:8},
  controls:[{id:'base',type:'select',label:'Base exposure',play:true,options:[2,4,8,16].map(v=>({value:v,label:v+' s'}))}],
  music:m4_music40, musicIns:'pulse',
  render(g,w,h,M,st){ h7_baseOr(g,'base40',h7_DK(w,h)+'|'+st.base,w,h,q=>h7_paint40(q,st,w,h)); h7_draw40(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ t=Math.max(0,t); h7_blit(g,h7_base40(st,w,h)); if(h7_RM()){ h7_draw40(g,w,h,st,null); return false; } h7_draw40(g,w,h,st,t); return t<ARR40+1400; } });

})();
