/* agent F pieces · L-26 … L-30 · delivery 3: digital/analog pairings.
   Each plate pairs an analog machine with the Mir behavior that does the same job, and computes one thing for real
   (a braille transliteration, a flap count, a truth table, a beat rate, a plotter tour). Figures are placed dots; hairline
   M.rule only for plate frames, dimension lines, indexes and the pen head; flat surfaces only where the medium is a flat
   painted part (split flaps) or a UI string. Type: Geist 300 voice, Geist Mono labels, 4 px baseline (f6q).
   Animated pieces cache their static layer per (w, h, dpr, settings) and redraw only what moves.
   Helpers are prefixed f6 so they never collide with agents A–E. */
(function(){
'use strict';
const M=window.MIR, TAU=Math.PI*2, E=M.ease, cl=M.clamp01, lerp=M.lerp;
const f6q=v=>Math.round(v/4)*4;
const f6RM=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(_){ return false; } };
const f6hex=c=>{ c=c.replace('#',''); return [0,2,4].map(i=>parseInt(c.slice(i,i+2),16)); };
const f6MX=new Map();
function f6mix(a,b,t){ const k=a+b+t; let v=f6MX.get(k); if(v) return v; const A=f6hex(a), B=f6hex(b); v='#'+A.map((x,i)=>Math.round(x+(B[i]-x)*t).toString(16).padStart(2,'0')).join(''); f6MX.set(k,v); return v; }
const f6WM=new WeakMap();
const f6c=st=>{ let c=f6WM.get(st); if(!c){ c={}; f6WM.set(st,c); } return c; };
function f6slot(st,name,key,make){ const c=f6c(st), s=c[name]; if(s&&s.key===key) return s.v; const v=make(); c[name]={key,v}; return v; }
const f6dpr=()=>Math.min(3,window.devicePixelRatio||1);
const f6DK=(w,h)=>w+'x'+h+'@'+f6dpr();
function f6off(w,h){ const cv=document.createElement('canvas'); return {cv,g:M.canvas(cv,w,h)}; }
function f6blit(g,cv){ g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(cv,0,0); g.restore(); }
let f6MC=null; const f6ctx=()=>{ if(!f6MC){ f6MC=document.createElement('canvas').getContext('2d'); f6MC.dpr=1; } return f6MC; };
const f6tw=(s,o={})=>{ const g=f6ctx(), size=o.size||11; g.font=`${o.weight||400} ${size}px ${M.FONT[o.font||'display']}`; const str=o.upper?String(s).toUpperCase():String(s), tr=(o.track||0)*size; if('letterSpacing' in g){ g.letterSpacing=tr+'px'; const w=g.measureText(str).width-tr; g.letterSpacing='0px'; return w; } return g.measureText(str).width+tr*(str.length-1); };
const f6memo=f=>{ const m=new Map(); return w=>{ let v=m.get(w); if(!v){ if(m.size>8) m.clear(); v=f(w); m.set(w,v); } return v; }; };
const f6monoO=(size,upper=true)=>({font:'mono',size,weight:500,track:upper?.12:.02,upper});
const f6lab=(g,s,x,y,c,size=9.5,o={})=>M.text(g,s,x,y,Object.assign(f6monoO(size),{color:c},o));
const f6trk=s=>s>=40?-.04:s>=28?-.03:s>=18?-.016:-.004;
const f6dispO=size=>({font:'display',size,weight:300,track:f6trk(size)});
const f6disp=(g,s,x,y,size,c,o={})=>M.text(g,s,x,y,Object.assign(f6dispO(size),{color:c},o));
function f6lines(s,maxW,o){ const out=[]; let line=''; for(const wd of String(s).split(/\s+/)){ const t=line?line+' '+wd:wd; if(line&&f6tw(t,o)>maxW){ out.push(line); line=wd; } else line=t; } if(line) out.push(line); return out; }
function f6para(g,s,x,y,maxW,o){ const oo=Object.assign(f6dispO(o.size),o), L=f6lines(s,maxW,oo), lh=o.lh||f6q(o.size*1.45); L.forEach((l,i)=>M.text(g,l,x,y+i*lh,oo)); return y+(L.length-1)*lh; }
const f6paraN=(s,maxW,o)=>f6lines(s,maxW,Object.assign(f6dispO(o.size),o)).length;
function f6monoP(g,s,x,y,maxW,c,size=9,lh=14,upper=true){ const o=Object.assign(f6monoO(size,upper),{color:c}); const L=f6lines(s,maxW,o); L.forEach((l,i)=>M.text(g,l,x,y+i*lh,o)); return y+(L.length-1)*lh; }
const f6monoN=(s,maxW,size=9,upper=true)=>f6lines(s,maxW,f6monoO(size,upper)).length;
function f6box(g,x0,y0,x1,y1,c){ M.rule(g,x0,y0,x1,y0,c); M.rule(g,x1,y0,x1,y1,c); M.rule(g,x1,y1,x0,y1,c); M.rule(g,x0,y1,x0,y0,c); }
function f6rr(g,x,y,w,h,r,c){ g.fillStyle=c; g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); g.fill(); }
/* a row of dots: structure drawn in the figure's own medium */
function f6dots(B,x0,y0,x1,y1,step,r,c){ const L=Math.hypot(x1-x0,y1-y0), n=Math.max(1,Math.round(L/step)); for(let i=0;i<=n;i++){ const t=i/n; B.dot(x0+(x1-x0)*t,y0+(y1-y0)*t,r,c); } }
function f6pal(k){ const P=M.PAL[k]; return {k,ground:P.ground,ink:P.ink,ring:P.ring,acc:P.center,blade:P.blade,atm:P.soft,
  soft:f6mix(P.ground,P.ink,.6), dim:f6mix(P.ground,P.ink,.42), tint:f6mix(P.ground,P.ink,.26), hair:f6mix(P.ground,P.ink,.16), lift:f6mix(P.ground,P.ink,.06)}; }
/* the plate's head line: id and form on the left, a note on the right when it fits */
function f6head(g,w,pad,left,right,P){ const ph=w<480, y=pad+8, lw=f6lab(g,left,pad,y,P.ink,ph?9.5:10); if(right&&pad+lw+32+f6tw(right,f6monoO(9.5))<w-pad) f6lab(g,right,w-pad,y,P.soft,9.5,{align:'right'}); return y; }
/* a dot capture: engine marks (M.ring, M.mirField …) become arrays */
function f6cap(){ return {X:[],Y:[],R:[],C:[], dot(x,y,r,c){ this.X.push(x); this.Y.push(y); this.R.push(r); this.C.push(c); }}; }
/* a sparse tooth: one jittered point per lattice cell, each with a fixed threshold; only points under keep survive.
   At ≤ 20% acceptance a jittered lattice reads salt-free, and it costs a fraction of a Poisson set (cold-render budget). */
function f6jit(box,cell,seed,keep){ const [x0,y0,x1,y1]=box, R=M.rng(seed), out=[]; for(let y=y0;y<y1;y+=cell) for(let x=x0;x<x1;x+=cell){ const px=x+(.15+.7*R())*cell, py=y+(.15+.7*R())*cell, t=R(); if(t<keep) out.push(px,py,t); } return out; }
const f6fmtInt=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,',');

/* ── music (M3). Each piece composes a score from its own data (music(st)); the frame plays it on the piece's bus and drives
   animate's t from the heard clock, so marks answer notes through M.music.env. Controls answer at once through musicParam.
   Pointer sounds are tuned to the piece's chord and scale. Helpers are prefixed m3_. ── */
const m3_WM=new WeakMap();
const m3_S=st=>{ let s=m3_WM.get(st); if(!s){ s={}; m3_WM.set(st,s); } return s; };
const m3_env=(st,k,t,tau)=>M.music&&t!=null?M.music.env(st,k,t,tau):0;
const m3_try=f=>{ try{ return f(); }catch(e){ console.error('music',e); } };
/* immediate sound on a piece's own bus, for pointer gestures (silent unless sound is on) */
const m3_A=id=>{ const a=M.audio; return a&&a.enabled&&a.unlocked?{play:(n,o)=>a.play(id,n,o),now:()=>a.now()}:null; };
const m3_PC=['C','C#','D','Eb','E','F','F#','G','G#','A','Bb','B'];
const m3_tr=(sym,k)=>{ if(!k) return sym; const m=/^([A-G][#b]?)(.*)$/.exec(sym), pc=M.music.pcOf(m[1]); return m3_PC[(pc+k+120)%12]+m[2]; };
const m3_root=(sym,oct)=>M.music.parse(sym).root+oct;
const m3_cents=c=>Math.pow(2,c/1200);
/* the diatonic triad on scale degree d of a mode over D, as a chord symbol ('' or 'm'; a diminished triad is taken as minor) */
function m3_tri(mode,d){ const mu=M.music, S=mu.MODES[mode]||mu.MODES.ionian, n=S.length, r=S[((d%n)+n)%n], t=(S[((d+2)%n+n)%n]-r+12)%12; return m3_PC[(r+2)%12]+(t===3?'m':''); }

/* ════════════════════════════════════════════════════════════════════════
   L-26 · Read by touch · embossed braille ↔ the state a screen reader announces.
   COMPUTED: the transliteration. "Mir" and the state word go through a letter → dot table (a–z, the standard six-dot
   alphabet) under Unified English Braille grade 1 (uncontracted): a capital letter takes the capital indicator, dot 6, in its
   own cell; a space is a blank cell. Not proofread by a braille reader.
   Spacing is the UKAAF Braille Standard Dimensions: 2.5 mm dot pitch both ways, 6.0 mm cell to cell, 10.0 mm line to line,
   1.5 mm dot base, 0.5 mm high. The plate draws them at true proportion, scaled up by s px/mm (shown as × true size at 96 dpi).
   The emboss is blind: the dome is the stock's own color and shows only as light, a thin lit arc toward the upper left and a
   thin shade arc toward the lower right, two rows of fine dots each, with a faint tint on the shaded half.
   ════════════════════════════════════════════════════════════════════════ */
const P26=f6pal('paper'), STOCK26=f6mix(P26.ground,P26.ink,.06);
const T26='Read by touch';
const SUB26='Mir’s state in six-dot cells, embossed at true braille spacing and enlarged.';
const MM26={dot:2.5,cell:6.0,line:10.0,base:1.5,height:.5,margin:6};
const BR26={a:[1],b:[1,2],c:[1,4],d:[1,4,5],e:[1,5],f:[1,2,4],g:[1,2,4,5],h:[1,2,5],i:[2,4],j:[2,4,5],k:[1,3],l:[1,2,3],m:[1,3,4],n:[1,3,4,5],o:[1,3,5],p:[1,2,3,4],q:[1,2,3,4,5],r:[1,2,3,5],s:[2,3,4],t:[2,3,4,5],u:[1,3,6],v:[1,2,3,6],w:[2,4,5,6],x:[1,3,4,6],y:[1,3,4,5,6],z:[1,3,5,6]};
const ST26=[
  {id:'loose',   word:'loose',   sr:'Mir: loose. Still finding the shape.'},
  {id:'settling',word:'settling',sr:'Mir: settling. The field is closing.'},
  {id:'in-tune', word:'in tune', sr:'Mir: in tune.'},
  {id:'lock',    word:'lock',    sr:'Mir: lock. Held in tune for a while.'},
  {id:'renewal', word:'renewal', sr:'Mir: renewal. A new cycle begins.'}];
const ROOT26='Root · Braille, 1829: Barbier’s night writing cut to a six-dot cell. Simplified: UEB grade 1.';
/* UEB grade 1: letter → cell; capital → indicator cell (dot 6) + letter; space → blank cell */
function f6ueb(str){ const out=[]; for(const ch of str){ if(ch===' '){ out.push({p:'',dots:[],k:'space'}); continue; } const lo=ch.toLowerCase(); if(!BR26[lo]) continue; if(ch!==lo) out.push({p:'cap',dots:[6],k:'cap'}); out.push({p:lo,dots:BR26[lo],k:'letter'}); } return out; }
const f6st26=st=>ST26.find(s=>s.id===st.state)||ST26[1];
const f6cells26=st=>{ const S=f6st26(st); return [f6ueb('Mir'),f6ueb(S.word)]; };
const f6dotsTxt=c=>c.k==='space'?'space':(c.k==='cap'?'cap ':c.p+' ')+c.dots.join('');
const lay26=f6memo(function(w){ const ph=w<480, pad=ph?16:24, inner=w-2*pad, o={ph,pad,inner};
  o.labY=pad+8; o.ts=ph?30:34; o.tl=f6lines(T26,inner,f6dispO(o.ts)); o.tlh=f6q(o.ts*1.08); o.tY=f6q(o.labY+(ph?44:48));
  o.ss=ph?13.5:14; o.sub=f6lines(SUB26,inner,f6dispO(o.ss)); o.subY=f6q(o.tY+(o.tl.length-1)*o.tlh+28);
  let y=f6q(o.subY+(o.sub.length-1)*20+40); o.dimY=y+18; y+=36;
  const wmm=2*MM26.margin+7*MM26.cell+MM26.dot+MM26.base, hmm=2*MM26.margin+MM26.line+2*MM26.dot+MM26.base;
  o.s=inner/wmm; o.sx=pad; o.sy=y; o.sw=inner; o.sh=Math.round(hmm*o.s); y+=o.sh; o.scY=y+20; y=f6q(y+52);
  /* lower half: the large cell, and what the screen reader says */
  const dgw=ph?inner:196; o.pd=ph?64:58; o.dr=o.pd*.3; o.cap=f6lines('A strand is a dot; this one is read by touch.',dgw-28,f6dispO(13));
  o.dg=[pad,y,pad+dgw,y+f6q(52+o.pd*2+o.dr*2+28+24+o.cap.length*18+8)];
  o.rx=ph?pad:pad+dgw+28; o.rw=ph?inner:inner-dgw-28; let ry=ph?o.dg[3]+36:y+8;
  o.srLab=ry; o.srN=Math.max(...ST26.map(s=>f6monoN('“'+s.sr+'”',o.rw-28,11.5,false))); o.srBox=[o.rx,ry+12,o.rw,24+o.srN*17]; ry=ry+12+o.srBox[3]+30;
  o.cdLab=ry; o.cdN=Math.max(...ST26.map(s=>{ const C=[...f6ueb('Mir'),{k:'space',dots:[]},...f6ueb(s.word)]; return f6monoN(C.map(f6dotsTxt).join(' · '),o.rw,10,false); })); o.cdY=ry+20; ry=o.cdY+(o.cdN-1)*16+30;
  o.note='Dot numbers run down the left column (1 2 3), then the right (4 5 6). Shown at '+(o.s/3.7795).toFixed(2)+'× true size (96 dpi).';
  o.noteN=f6paraN(o.note,o.rw,{size:12.5}); o.noteY=ry; ry+= (o.noteN-1)*18;
  y=Math.max(o.dg[3],ry)+36; o.foot=f6lines(ROOT26,inner,f6monoO(9,false)); o.footY=y; o.H=f6q(y+(o.foot.length-1)*14+pad); return o; });
/* cell geometry → dot centers (px) */
function f6geo26(L,cells){ const s=L.s, out=[]; cells.forEach((line,li)=>line.forEach((c,ci)=>{ const x0=L.sx+(MM26.margin+MM26.base/2+ci*MM26.cell)*s, y0=L.sy+(MM26.margin+MM26.base/2+li*MM26.line)*s;
  out.push({li,ci,c,x0,y0,x1:x0+MM26.dot*s,y1:y0+2*MM26.dot*s,pos:d=>[x0+(d>3?MM26.dot*s:0),y0+((d-1)%3)*MM26.dot*s]}); })); return out; }
/* the dome: a blind emboss. Same color as the stock; it exists only as light. A thin lit arc (white dots) faces the light at
   the upper left, a thin shade arc (ink-tint dots) faces away at the lower right, each two rows of fine dots that taper at
   their ends, and a very faint tint on the shaded half inside. p (0..1) grows the arcs from their middles: the dot rising. */
const L26=(()=>{ const v=[-.58,-.72,.9], n=Math.hypot(...v); return v.map(x=>x/n); })(), AL26=Math.atan2(L26[1],L26[0]);
function f6dome(B,cx,cy,r,p,o){ if(p<=0) return; const sp=o.sp, rd=o.rd;
  const arc=(R0,ac,hs,col,rk)=>{ if(hs<=0) return; const n=Math.max(2,Math.round(2*hs*R0/sp)); for(let i=0;i<n;i++){ const f=(i+.5)/n, a=ac-hs+2*hs*f, t=1-Math.abs(f*2-1); if(t<.06) continue; B.dot(cx+R0*Math.cos(a),cy+R0*Math.sin(a),rd*rk*(.62+.38*Math.sqrt(t)),col); } };
  arc(r,AL26,1.05*p,o.lit,1); arc(r,AL26+Math.PI,1.2*p,o.shade,1.05);
  if(p>.4){ const q=cl((p-.4)/.6), r2=r-sp*.95; arc(r2,AL26,.8*q,o.lit,.85); arc(r2,AL26+Math.PI,.95*q,o.shade2,.9); }
  /* the faint tint inside: a sunflower of fine dots, kept only on the shaded half and sparsely */
  const R=r-sp*1.9, ga=Math.PI*(3-Math.sqrt(5)), nn=Math.max(0,Math.round(Math.PI*R*R/(o.tsp*o.tsp)));
  for(let i=0;i<nn;i++){ const rr=R*Math.sqrt((i+.5)/nn), a=i*ga+o.seed, u=Math.cos(a), v=Math.sin(a), face=-(u*L26[0]+v*L26[1])/Math.hypot(L26[0],L26[1]), k=face*(rr/R);
    if(k>.15&&M.hash2(i,o.seed*97,26)<k*.34*p) B.dot(cx+rr*u,cy+rr*v,rd*.85,o.tint); } }
/* the raised dots in reading order (line, cell, dot number), and the large cell's six positions */
function f6tooth26(st,w,h){ const L=lay26(w), cells=f6cells26(st), G=f6geo26(L,cells), r=MM26.base/2*L.s;
  return f6slot(st,'tooth',f6DK(w,h)+st.state,()=>{ const domes=[]; G.forEach((cg,gi)=>cg.c.dots.forEach(d=>{ const [x,y]=cg.pos(d); domes.push({gi,d,x,y}); }));
    domes.sort((a,b)=>a.gi-b.gi||a.d-b.d); domes.forEach((D,i)=>D.order=i);
    const [dx0,dy0,dx1]=L.dg, ccx=(dx0+dx1)/2, top=dy0+52+L.dr, sw=[Math.round(ccx-L.pd/2-L.dr*2.1),Math.round(top-L.dr*2.1),Math.round(ccx+L.pd/2+L.dr*2.1),Math.round(top+2*L.pd+L.dr*2.1)];
    const big=[1,2,3,4,5,6].map(d=>({d,x:ccx+(d>3?L.pd/2:-L.pd/2),y:top+((d-1)%3)*L.pd}));
    return {G,domes,big,sw,r}; }); }
function f6sel26(st,G){ if(st.sel>=0&&st.sel<G.length&&G[st.sel].c.k!=='space') return st.sel; const i=G.findIndex(x=>x.li===1&&x.c.k==='letter'); return i<0?0:i; }

function f6base26(st,w,h){ const T=f6tooth26(st,w,h), sel=f6sel26(st,T.G);
  return f6slot(st,'base',f6DK(w,h)+st.state+'|'+sel+'|'+(st.used?1:0),()=>{ const L=lay26(w), P=P26, {cv,g}=f6off(w,h), pad=L.pad, s=L.s, S=f6st26(st), rs=L.ph?.5:.52;
    M.fill(g,P.ground); f6head(g,w,pad,'L-26 · Pairing · braille','UEB grade 1',P);
    L.tl.forEach((l,i)=>f6disp(g,l,pad-1,L.tY+i*L.tlh,L.ts,P.ink)); L.sub.forEach((l,i)=>M.text(g,l,pad,L.subY+i*20,Object.assign(f6dispO(L.ss),{color:P.soft})));
    const B=new M.Buf(g);
    /* the stock: one even surface, a shade off the plate, so the lit arcs have somewhere to show */
    M.fill(g,STOCK26,L.sx,L.sy,L.sw,L.sh); M.fill(g,STOCK26,T.sw[0],T.sw[1],T.sw[2]-T.sw[0],T.sw[3]-T.sw[1]);
    /* the cell being read: a short row of accent dots under it */
    const sg=T.G[sel], my=sg.y1+T.r+(L.ph?19:24); f6dots(B,sg.x0-1,my,sg.x1+1,my,1.6,.75,P.acc);
    B.flush();
    M.rule(g,L.sx,L.sy,L.sx+L.sw,L.sy,P.tint); M.rule(g,L.sx,L.sy+L.sh,L.sx+L.sw,L.sy+L.sh,P.tint); M.rule(g,L.sx,L.sy,L.sx,L.sy+L.sh,P.tint); M.rule(g,L.sx+L.sw,L.sy,L.sx+L.sw,L.sy+L.sh,P.tint);
    /* interline print under each cell */
    T.G.forEach((cg,i)=>{ if(cg.c.k==='space') return; const x=(cg.x0+cg.x1)/2, y=cg.y1+T.r+(L.ph?12:15); f6lab(g,cg.c.p,x,y,i===sel?P.ink:P.soft,9,{align:'center',upper:cg.c.k==='cap'}); });
    /* dimensions: dot pitch, cell pitch (above), line pitch (in the right margin) */
    const c0=T.G[0], c1=T.G[1], dy=L.dimY, da=dy-20, tk=(x,y)=>M.rule(g,x,y-4,x,y+4,P.soft);
    M.rule(g,c0.x0,da,c0.x1,da,P.soft); tk(c0.x0,da); tk(c0.x1,da); f6lab(g,'2.5 mm dot',c0.x1+8,da+3.5,P.ink,9);
    M.rule(g,c0.x0,dy,c1.x0,dy,P.soft); tk(c0.x0,dy); tk(c1.x0,dy); f6lab(g,'6.0 mm cell',c1.x0+8,dy+3.5,P.soft,9);
    M.rule(g,c0.x1,da+4,c0.x1,L.sy-2,P.hair); M.rule(g,c1.x0,dy+4,c1.x0,L.sy-2,P.hair);
    M.rule(g,c0.x0,da+4,c0.x0,L.sy-2,P.hair);
    const vx=L.sx+L.sw-MM26.margin*s*.45, ya=T.G[0].y0, yb=ya+MM26.line*s; M.rule(g,vx,ya,vx,yb,P.soft); M.rule(g,vx-4,ya,vx+4,ya,P.soft); M.rule(g,vx-4,yb,vx+4,yb,P.soft);
    f6lab(g,'10.0 mm',vx-8,(ya+yb)/2+3,P.soft,9,{align:'right'}); f6lab(g,'line',vx-8,(ya+yb)/2+16,P.soft,9,{align:'right'});
    if(!st.used) f6lab(g,L.ph?'tap a cell':'tap a cell to read it',L.sx+L.sw,L.dimY+3.5,P.soft,9,{align:'right'});
    f6lab(g,'stock · '+(L.s/3.7795).toFixed(2)+'× true size',L.sx,L.scY,P.soft,9);
    if(!L.ph) f6lab(g,'1.5 mm dot base · 0.5 mm high',L.sx+L.sw,L.scY,P.soft,9,{align:'right'});
    /* the large cell */
    { const [x0,y0,x1,y1]=L.dg, ccx=(x0+x1)/2, top=y0+52+L.dr, c=sg.c, B2=new M.Buf(g); f6box(g,x0,y0,x1,y1,P.hair);
      f6lab(g,'One cell · '+(c.k==='cap'?'capital indicator':'“'+c.p+'”'),x0+14,y0+22,P.ink,9.5);
      for(let d=1;d<=6;d++){ const x=ccx+(d>3?L.pd/2:-L.pd/2), y=top+((d-1)%3)*L.pd; if(!c.dots.includes(d)){ const n=Math.round(TAU*L.dr*.92/2.4); for(let i=0;i<n;i++){ const a=i/n*TAU; B2.dot(x+L.dr*.92*Math.cos(a),y+L.dr*.92*Math.sin(a),.55,f6mix(STOCK26,P.ink,.32)); } }
        f6lab(g,String(d),d>3?x+L.dr+12:x-L.dr-12,y+3.5,c.dots.includes(d)?P.ink:P.soft,10,{align:d>3?'left':'right'}); }
      B2.flush();
      const cy=top+2*L.pd+L.dr+28; f6lab(g,'dots '+(c.dots.join(' ')||'none'),x0+14,cy,P.soft,9);
      L.cap.forEach((l,i)=>M.text(g,l,x0+14,cy+24+i*18,Object.assign(f6dispO(13),{color:P.ink}))); }
    /* what the screen reader says */
    { const [bx,by,bw,bh]=L.srBox; f6lab(g,'Screen reader · role=status · polite',L.rx,L.srLab,P.ink,9.5);
      f6rr(g,bx,by,bw,bh,6,f6mix(P.ground,P.ink,.055)); f6monoP(g,'“'+S.sr+'”',bx+14,by+24,bw-28,P.ink,11.5,17,false);
      f6lab(g,'The same state, as cells',L.rx,L.cdLab,P.ink,9.5);
      const C=[...T.G.filter(x=>x.li===0).map(x=>x.c),{k:'space',dots:[]},...T.G.filter(x=>x.li===1).map(x=>x.c)];
      f6monoP(g,C.map(f6dotsTxt).join(' · '),L.rx,L.cdY,L.rw,P.soft,10,16,false);
      f6para(g,L.note,L.rx,L.noteY,L.rw,{size:12.5,lh:18,color:P.soft}); }
    L.foot.forEach((l,i)=>M.text(g,l,pad,L.footY+i*14,Object.assign(f6monoO(9,false),{color:P.dim})));
    return cv; }); }
/* time is the music's: 126 BPM. The dots rise in reading order, one per 16th note, a space is a 16th rest and the second line
   starts on the beat after a rest; the large cell's dots rise one per 8th from the beat after the word, and the cadence lands
   on the next beat. Each dome starts to rise on its note and swells as it sounds. */
const BPM26=126, S16_26=60000/BPM26/4, B26=4*S16_26, P26X=[0,3,5,1,4,2];
function f6plan26(st){ const cells=f6cells26(st), G=cells.flatMap((line,li)=>line.map(c=>({li,c}))), sel=f6sel26(st,G), mode='ionian', rn=st.state==='renewal';
  const qual=(sym)=>{ const m=sym.endsWith('m'), r=sym.replace(/m$/,''); return st.state==='loose'?r+'sus4':st.state==='settling'?(m?r+'m7':r+'add9'):sym; };
  const chordOf=(gi)=>{ let j=gi; while(j<G.length&&G[j].c.k!=='letter') j++; if(j>=G.length) j=gi; const c=G[j].c; const i='abcdefghijklmnopqrstuvwxyz'.indexOf(c.p); return qual(m3_tr(m3_tri(mode,P26X[Math.max(0,i)%6]),rn&&G[j].li===1?7:0)); };
  let T=0, li0=0; const out=[];
  G.forEach((x,gi)=>{ if(x.li!==li0){ T=Math.ceil((T+S16_26)/B26-1e-6)*B26; li0=x.li; }
    if(x.c.k==='space'){ out.push({gi,li:x.li,c:x.c,sym:null,t0:T,dots:[]}); T+=S16_26; return; }
    const sym=chordOf(gi), t0=T, dots=x.c.dots.slice().sort((a,b)=>a-b).map(d=>{ const r={d,t:T}; T+=S16_26; return r; }); out.push({gi,li:x.li,c:x.c,sym,t0,t1:T,dots}); });
  const tB=Math.ceil(T/B26-1e-6)*B26+B26, sc=out[sel], big=sc.c.dots.slice().sort((a,b)=>a-b).map((d,i)=>({d,t:tB+i*2*S16_26}));
  const tA=Math.ceil((tB+big.length*2*S16_26)/B26-1e-6)*B26, home=rn?'A':'D';
  return {G,cells:out,sel,big,bigSym:sc.sym,tB,tA,home,end:tA+1800}; }
function f6draw26(g,w,h,st,t){ const L=lay26(w), T=f6tooth26(st,w,h), P=P26, B=new M.Buf(g), sel=f6sel26(st,T.G), PL=f6plan26(st);
  const O={lit:'#ffffff',shade:f6mix(STOCK26,P.ink,.54),shade2:f6mix(STOCK26,P.ink,.28),tint:f6mix(STOCK26,P.ink,.15),sp:L.ph?.95:1.05,tsp:L.ph?1.25:1.35,rd:.55};
  const q=v=>Math.round(Math.min(1,v)*8)/8, tOf=D=>{ const cl0=PL.cells[D.gi], x=cl0&&cl0.dots.find(z=>z.d===D.d); return x?x.t:0; };
  T.domes.forEach(D=>{ const e=m3_env(st,'d'+D.gi+'.'+D.d,t,200), pr=t==null?1:E.outCubic(cl((t-tOf(D))/(2*S16_26)));
    f6dome(B,D.x,D.y,T.r*(1+.3*e),pr,Object.assign({seed:D.order+1},O,e>.05?{shade:f6mix(O.shade,P.acc,q(e*.8))}:null)); });
  const c=T.G[sel].c, OB=Object.assign({},O,{sp:1.1,tsp:1.6,rd:.6});
  T.big.forEach(D=>{ const b=PL.big.find(z=>z.d===D.d), e=b?m3_env(st,'b'+D.d,t,260):0;
    f6dome(B,D.x,D.y,L.dr*(1+.18*e),b?(t==null?1:E.outCubic(cl((t-b.t)/(3*S16_26)))):0,Object.assign({seed:40+D.d},OB,e>.05?{shade:f6mix(OB.shade,P.acc,q(e*.8))}:null)); });
  /* the cadence: the accent row under the cell being read answers it */
  const ea=m3_env(st,'arr',t,480); if(ea>.05){ const sg=T.G[sel], my=sg.y1+T.r+(L.ph?19:24); f6dots(B,sg.x0-1,my,sg.x1+1,my,1.6,.75*(1+.8*ea),P.acc); }
  B.flush(); return t==null||t<PL.tA+900; }
function f6hit26(st,e){ const L=lay26(e.w), G=f6geo26(L,f6cells26(st)); if(e.y<L.sy||e.y>L.sy+L.sh) return -1; const s=L.s, half=MM26.cell*s/2;
  for(let i=0;i<G.length;i++){ const cg=G[i], mx=(cg.x0+cg.x1)/2, top=cg.li===0?L.sy:L.sy+(MM26.margin+MM26.line*.5)*s, bot=cg.li===0?L.sy+(MM26.margin+MM26.line*.5)*s:L.sy+L.sh; if(Math.abs(e.x-mx)<half&&e.y>=top&&e.y<bot&&cg.c.k!=='space') return i; } return -1; }
/* music: each cell is a chord and its six dots are six voices (dot 1–3 the lower three chord tones, 4–6 the upper three), so a
   cell sounds as the broken chord of its raised dots, one per 16th. The letters are the progression: letter index mod 6 picks
   I, IV, vi, ii, V or iii, so "settling" reads I V IV IV iii vi IV I. State is the harmony: loose, every chord a suspended 4th,
   a hair detuned and off the grid; settling, an added 9th (or 7th); in tune, pure triads; lock adds the octave below; renewal
   carries the word up a fifth into A. The large cell replays its chord one dot per 8th; the cadence lands home. */
function f6music26(st){ const mu=M.music, S=mu.score({bpm:BPM26}), PL=f6plan26(st), loose=st.state==='loose', lock=st.state==='lock', R=M.rng(2601);
  const voice=(sym,d)=>{ const pc=mu.pcOf(mu.parse(sym).root), base=45+((pc-9+12)%12); return mu.ct(sym,base,d-1); };
  S.harm(PL.cells.filter(c=>c.sym).map(c=>[c.t0,c.sym]).concat([[PL.tB,PL.bigSym],[PL.tA,PL.home]]));
  let lastSym=null; PL.cells.forEach((c,ci)=>{ if(!c.sym) return; const nx=PL.cells.slice(ci+1).find(x=>x.sym), end=nx?nx.t0:PL.tB;
    if(c.sym!==lastSym){ let e2=end; for(let q=ci+1;q<PL.cells.length;q++){ const y=PL.cells[q]; if(!y.sym) continue; if(y.sym!==c.sym) break; const z=PL.cells.slice(q+1).find(x=>x.sym); e2=z?z.t0:PL.tB; }
      S.chord(c.t0,'pad',mu.voice(c.sym,'A3','A4',3),e2-c.t0,{attack:.06,release:.25,cutoff:950,vel:.5});
      S.chord(c.t0,'pluck',lock?[voice(c.sym,1)-12,voice(c.sym,1)]:[voice(c.sym,1)-12],Math.min(e2-c.t0,B26),{cutoff:380,env:1.1,vel:.7}); } lastSym=c.sym;
    c.dots.forEach(({d,t})=>{ const j=loose?(R()-.5)*36:0, det=loose?(R()-.5)*6:0;
      S.note(Math.max(0,t+j),'mallet',{hz:mu.hz(voice(c.sym,d),c.sym)*m3_cents(det)},Math.max(S16_26,end-t-j),{vel:.66+.03*d,trem:5,pan:d>3?.22:-.22},['d'+c.gi+'.'+d,1]); }); });
  /* the large cell, slower, then the cadence */
  S.chord(PL.tB,'pad',mu.voice(PL.bigSym,'A3','A4',3),PL.tA-PL.tB,{attack:.1,release:.3,cutoff:850,vel:.36});
  PL.big.forEach(({d,t})=>S.note(t,'mallet',voice(PL.bigSym,d),PL.tA-t,{vel:.66,trem:5,pan:d>3?.25:-.25,over:PL.bigSym},['b'+d,1]));
  const h=PL.home; S.chord(PL.tA,'pad',mu.voice(h,'D4','D5',4),1500,{attack:.04,release:1,cutoff:1400,vel:.48},['arr',1]);
  S.chord(PL.tA,'mallet',[voice(h,1),voice(h,2),voice(h,3),voice(h,4),voice(h,5)],1600,{vel:.5,trem:5});
  S.note(PL.tA,'bell',voice(h,5)+12,2000,{ratio:3.5,vel:.34,pan:.2});
  if(lock||st.state==='renewal') S.note(PL.tA,'bass',m3_root(h,2),560,{from:m3_root(m3_tr(h,7),1),glide:90,env:2.8,decay:.4,vel:.58}); else S.note(PL.tA,'pluck',m3_root(h,2),900,{cutoff:360,env:1.1,vel:.58});
  S.end(PL.end); return S.out(); }
/* tapping a cell plays its chord: its raised dots as voices */
function f6tap26(st,i){ const A=m3_A('L-26'); if(!A) return; const mu=M.music, PL=f6plan26(st), c=PL.cells[i]; if(!c||!c.sym) return; const now=A.now()+.004, pc=mu.pcOf(mu.parse(c.sym).root), base=45+((pc-9+12)%12);
  c.dots.forEach((d,k)=>A.play('mallet',{when:now+k*.03,freq:mu.hz(mu.ct(c.sym,base,d.d-1),c.sym),dur:1.2,vel:.5,trem:5,pan:d.d>3?.22:-.22})); A.play('emboss',{when:now,vel:.4}); }
M.piece({ id:'L-26',
  caption:'Mir’s state as six-dot braille cells at true spacing, enlarged, beside the line a screen reader announces. Change State, or tap a cell to read it in the large diagram.',
  alt:'A paper plate. A strip of stippled card with two lines of embossed braille dots, “Mir” and the state word, each dot a small dome shaded from the upper left, with dimension marks for the 2.5 mm dot pitch, 6 mm cell and 10 mm line. Below, one enlarged cell with dots numbered one to six, and the screen-reader string in monospace.',
  recipe:{
    idea:'A dot system that is read by hand: each raised dot is a strand, and the word exists only because the dots agree on it.',
    marks:['dot'],
    ground:'paper',
    accent:'a short row of red dots under the cell being read',
    composition:'Title block; a strip of stock with “Mir” and the state word in braille at true proportion, enlarged, with dimension marks; below, one large cell with numbered dots beside the screen-reader string, the cells as dot numbers and a note.',
    motion:'On a 126 BPM grid: the dots rise in reading order, one per 16th note (a space is a rest, the second line starts on a beat), each rising over two 16ths and swelling on its note; then the large cell’s dots rise one per 8th and the cadence lands on the next beat. Reduced motion shows them raised.',
    sound:'Each cell is a chord and its dots its voices, so the dots rise as a broken chord and the letters spell the progression. State is the harmony: suspended, added ninths, pure triads, plus the octave, or up a fifth. Tap a cell.',
    controls:['State (five)','tap a cell to read it'],
    computed:['transliteration: a letter-to-dot table (a–z) under UEB grade 1, uncontracted; a capital takes the indicator, dot 6, in its own cell; a space is a blank cell','spacing per UKAAF Braille Standard Dimensions: 2.5 mm dot pitch, 6.0 mm cell, 10.0 mm line, 1.5 mm base, 0.5 mm high; drawn at true proportion, enlarged'],
    placeholder:['screen-reader lines','the braille is not proofread by a braille reader'],
    root:'Braille, 1829',
    rules:['a blind emboss: each dome is the stock’s own color and shows only as a lit arc (upper left) and a shade arc (lower right)'],
    engine:['M.ring','M.Buf','M.hash2','M.ease.outCubic','M.text','M.rule','M.fill']
  },
  aspect:w=>w/lay26(w).H,
  state:{state:'settling',sel:-1,used:false},
  controls:[{id:'state',type:'select',label:'State',play:true,options:ST26.map(s=>({value:s.id,label:s.word}))}],
  render(g,w,h,M,st){ const c=f6c(st); if(c.lastState!==st.state){ if(c.lastState!==undefined) st.sel=-1; c.lastState=st.state; } f6blit(g,f6base26(st,w,h)); f6draw26(g,w,h,st,null); },
  music:f6music26,
  animate(g,w,h,M,st,t){ if(f6RM()){ f6blit(g,f6base26(st,w,h)); f6draw26(g,w,h,st,null); return false; } f6blit(g,f6base26(st,w,h)); return f6draw26(g,w,h,st,Math.max(0,t)); },
  pointer(st,e){ if(e.type!=='down') return false; const i=f6hit26(st,e); if(i<0) return false; st.sel=i; st.used=true; m3_try(()=>f6tap26(st,i)); return true; } });

/* ════════════════════════════════════════════════════════════════════════
   L-27 · Split-flap · a flap board ↔ the rail's readings changing.
   COMPUTED: every flap. Each unit carries a drum of 43 characters in a fixed order; to change from a to b it must turn through
   every character between them, so flips = (index(b) − index(a)) mod 43. Units start on a cascade, 24 ms × their position
   (row-major), and each flip takes the flap time. The board settles at max(start + flips × flap time). One flip is drawn as the
   physical move: the upper half of the old character falls about the hinge (a vertical scale, cos 0 → π/2), then the lower
   half of the new one lands over the old lower half. A half turning away from the light darkens by its angle.
   Reduced motion: the board jumps to the final value. Values are placeholders.
   ════════════════════════════════════════════════════════════════════════ */
const P27=f6pal('night');
const DRUM27=' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./+-·:', D27=DRUM27.length, U27=12;
const ROWS27=[{id:'Field',sub:'state · clash'},{id:'Respiration',sub:'breaths this cycle'},{id:'Helix',sub:'strands · crossings + arriving'}];
const ST27=[
  {n:'loose',   v:['LOOSE    .62','10/21','388 · 3 + 2'], k:.18, lit:10, cr:3, ar:2},
  {n:'settling',v:['SETTLING .38','12/21','612 · 4 + 1'], k:.6,  lit:12, cr:4, ar:1},
  {n:'in tune', v:['IN TUNE  .11','13/21','701 · 5 + 0'], k:.94, lit:13, cr:5, ar:0},
  {n:'lock',    v:['LOCK     .06','20/21','840 · 5 + 0'], k:1,   lit:20, cr:5, ar:0},
  {n:'renewal', v:['RENEWAL  .09','21/21','903 · 0 + 1'], k:.82, lit:21, cr:0, ar:1}];
const T27='Split-flap';
const SUB27='The rail’s three readings on a flap board, turning flap by flap to each new value.';
const ROOT27='Root · Valle and Valle, Cifra 3, 1965: Solari flap time. Simplified: a 43-character drum.';
const f6row27=(si,r)=>si<0?' '.repeat(U27):(ST27[si].v[r]+' '.repeat(U27)).slice(0,U27);
const f6di27=ch=>{ const i=DRUM27.indexOf(ch); return i<0?0:i; };
/* time is the music's: 107 BPM. Flap time is quantized to a note value (under 52 ms a 64th, under 105 ms a 32nd, else a 16th);
   units start a 64th apart (row-major); each unit's last flip is moved onto the 16th grid (it turns a touch slower to get
   there), so every settle lands on a note */
const BPM27=107, S16_27=60000/BPM27/4, S32_27=S16_27/2, S64_27=S16_27/4;
const f6fq27=ms=>ms<52?S64_27:ms<105?S32_27:S16_27, f6nv27=ms=>ms<52?'64th':ms<105?'32nd':'16th';
/* the change plan: per unit, its start, flips, from/to drum index and settle time (computed) */
function f6plan27(from,to,ms){ const U=[], fq=f6fq27(ms); let tot=0, mx=0, end=0;
  for(let r=0;r<3;r++){ const A=f6row27(from,r), B=f6row27(to,r); for(let c=0;c<U27;c++){ const ia=f6di27(A[c]), ib=f6di27(B[c]), n=(ib-ia+D27)%D27, st0=(r*U27+c)*S64_27, e=n?Math.ceil((st0+n*fq)/S16_27-1e-6)*S16_27:0;
    U.push({r,c,ia,ib,n,st0,end:e}); tot+=n; if(n>mx) mx=n; if(n&&e>end) end=e; } }
  const rowEnd=[0,1,2].map(r=>Math.max(0,...U.filter(u=>u.r===r).map(u=>u.end))); return {U,tot,mx,end,rowEnd}; }
const lay27=f6memo(function(w){ const ph=w<600, pad=ph?16:32, inner=w-2*pad, o={ph,pad,inner};
  o.labY=pad+8; o.ts=ph?30:40; o.tY=f6q(o.labY+(ph?44:52)); o.ss=ph?13.5:15; o.sub=f6lines(SUB27,ph?inner:Math.min(640,inner),f6dispO(o.ss)); o.subY=f6q(o.tY+(ph?30:34));
  let y=f6q(o.subY+(o.sub.length-1)*20+(ph?32:40)); o.by=y; const bp=ph?12:20, gap=ph?3:5; o.bp=bp; o.gap=gap;
  if(!ph){ o.lw=168; const W=inner-2*bp-20-o.lw-12; o.uw=Math.floor((W-11*gap)/(12+1.4)); o.uh=Math.round(o.uw*1.4); o.ew=o.uh; o.eh=o.uh; o.rg=28;
    o.rows=[0,1,2].map(r=>{ const ry=y+bp+r*(o.uh+o.rg); return {ex:pad+bp,ey:ry,lx:pad+bp+o.ew+20,ly:ry,ux:w-pad-bp-(12*o.uw+11*gap),uy:ry}; }); o.bh=bp*2+3*o.uh+2*o.rg; }
  else { o.uw=Math.floor((inner-2*bp-11*gap)/12); o.uh=Math.round(o.uw*1.42); o.ew=68; o.eh=30; o.rg=22; const blk=o.eh+10+o.uh, ux=pad+bp+Math.floor((inner-2*bp-(12*o.uw+11*gap))/2);
    o.rows=[0,1,2].map(r=>{ const ry=y+bp+r*(blk+o.rg); return {ex:pad+bp,ey:ry,lx:pad+bp+o.ew+12,ly:ry,ux,uy:ry+o.eh+10}; }); o.bh=bp*2+3*blk+2*o.rg; }
  y=o.by+o.bh; o.rdY=y+30; o.rdN=f6monoN('from blank · this change · 288 flips across 36 units · longest unit 42 flips · 24 ms cascade per unit · 140 ms a flap · settles in 3.36 s',inner,9.5,false); y=o.rdY+(o.rdN-1)*15+26;
  o.foot=f6lines(ROOT27,inner,f6monoO(9,false)); o.footY=y; o.H=f6q(y+(o.foot.length-1)*14+pad); return o; });
/* the flap atlas: every drum character on a flap face, top and bottom halves split by the hinge gap */
const f6AT27=new Map();
function f6atlas27(uw,uh){ const key=uw+'x'+uh+'@'+f6dpr(); let A=f6AT27.get(key); if(A) return A; if(f6AT27.size>4) f6AT27.clear();
  const P=P27, cw=uw+2, {cv,g}=f6off(cw*D27,uh), d=g.dpr, face=f6mix(P.ground,P.ring,.085), size=uh*.6, gh=Math.max(1/d,uh*.014);
  for(let i=0;i<D27;i++){ const x=i*cw; f6rr(g,x,0,uw,uh,Math.max(2,uw*.07),face); if(DRUM27[i]!==' ') M.text(g,DRUM27[i],x+uw/2,uh/2+size*.355,{font:'mono',size,weight:500,color:P.ring,align:'center'}); }
  g.fillStyle=P.ground; g.fillRect(0,uh/2-gh/2,cw*D27,gh);
  A={cv,cw,uw,uh,d,hp:Math.floor(cv.height/2)}; f6AT27.set(key,A); return A; }
function f6half27(g,A,i,half,x,y,hh,sc,shade){ if(sc<=.002) return; const d=A.d, sy=half?A.hp:0, sh=half?A.cv.height-A.hp:A.hp, dh=hh*sc, dy=half?y+hh:y+hh-dh;
  g.drawImage(A.cv,Math.round(i*A.cw*d),sy,Math.round(A.uw*d),sh,x,dy,A.uw,dh); if(shade>0){ g.globalAlpha=shade; g.fillStyle=P27.ground; g.fillRect(x,dy,A.uw,dh); g.globalAlpha=1; } }
function f6unit27(g,A,x,y,u,t){ const hh=A.uh/2;
  if(!u.n||t==null||t>=u.end){ const i=t!=null&&u.n&&t<u.st0?u.ia:u.ib; f6half27(g,A,i,0,x,y,hh,1,0); f6half27(g,A,i,1,x,y,hh,1,0); return; }
  if(t<u.st0){ f6half27(g,A,u.ia,0,x,y,hh,1,0); f6half27(g,A,u.ia,1,x,y,hh,1,0); return; }
  const e=t-u.st0, ms=(u.end-u.st0)/u.n, k=Math.floor(e/ms), ph=(e-k*ms)/ms, cur=(u.ia+k)%D27, nxt=(cur+1)%D27;
  f6half27(g,A,nxt,0,x,y,hh,1,0); f6half27(g,A,cur,1,x,y,hh,1,0);
  if(ph<.5){ const sc=Math.cos(ph*Math.PI); f6half27(g,A,cur,0,x,y,hh,sc,(1-sc)*.6); }
  else { const sc=-Math.cos(ph*Math.PI); f6half27(g,A,nxt,1,x,y,hh,sc,(1-sc)*.6); } }
/* the echo at each row's left: the same reading drawn as a Mir mark (cached per state, row and size) */
const f6EC27=new Map();
function f6echo27(si,r,ew,eh){ const key=si+'|'+r+'|'+ew+'x'+eh+'@'+f6dpr(); let v=f6EC27.get(key); if(v) return v; if(f6EC27.size>60) f6EC27.clear();
  const P=P27, S=ST27[Math.max(0,si)], {cv,g}=f6off(ew,eh), B=new M.Buf(g), tint=f6mix(P.ground,P.ring,.3), off=si<0;
  if(r===0){ const cx=ew/2, cy=eh/2, R=Math.min(ew,eh)*.46, k=off?0:S.k, loose=1-k, n=eh>50?5:3;
    for(let i=1;i<=n;i++){ const Ri=R*i/n, bw=Math.max(1.2,R*.03)*(.8+.4*i/n); M.ring(B,{cx,cy,R:Ri,w:bw+loose*R*.05,swell:.5,dpl:Math.min(1.4,.4+bw*.4),rCore:eh>50?.85:.7,rEdge:.5,seed:31+i*13,color:off?tint:P.ring,wobble:loose*.14,loose:loose*R*.12}); }
    if(!off){ const cR=Math.max(2.2,R*.13); M.ring(B,{cx,cy,R:cR,w:Math.max(1,cR*.35)+loose*cR*.5,swell:.3,dpl:1.6,rCore:.8,rEdge:.55,seed:5,color:P.acc,ex:1+loose*.8,ey:1-loose*.3,rot:.7,loose:loose*cR*.35}); } }
  else if(r===1){ const pitch=ew/21, len=eh*.78, wid=Math.max(1.1,pitch*.42), lean=-Math.PI/2+.3, c=Math.cos(lean), s=Math.sin(lean), R=M.rng(77), cell=Math.max(.9,wid*.5);
    for(let i=0;i<21;i++){ const cx=(i+.5)*pitch, cy=eh/2, col=!off&&i<S.lit?P.acc:tint, nu=Math.max(2,Math.round(len/cell)), nv=Math.max(1,Math.round(wid/cell));
      for(let a=0;a<nu;a++) for(let b=0;b<nv;b++){ const u=((a+.25+R()*.5)/nu-.5)*len, v=((b+.25+R()*.5)/nv-.5)*wid; B.dot(cx+u*c-v*s,cy+u*s+v*c,eh>50?.56:.55,col); } } }
  else { const n=off?0:S.cr+S.ar, cy=eh/2, A=eh*.3, lam=2*ew/(Math.max(1,n)+1), ph0=ew/2-(Math.max(1,n)-1)*lam/4;
    /* two strands as a helix of dots; a crossing sits where they meet */
    const sc=f6mix(P.ground,P.ring,.46); for(let x=1;x<ew-1;x+=eh>50?1.5:1.3){ const y1=cy+A*Math.sin((x-ph0)/lam*TAU), y2=cy-A*Math.sin((x-ph0)/lam*TAU); B.dot(x,y1,.6,sc); B.dot(x,y2,.6,sc); }
    for(let i=0;i<n;i++){ const x=ph0+i*lam/2, rd=Math.min(eh*.16,lam*.2), land=i<S.cr; M.along(B,{rng:M.rng(90+i),curve:M.curve.diamond(x,cy,rd*.8,rd*1.15),n:Math.round(rd*(land?9:5)),spread:land?.25:.15,r:eh>50?.75:.6,color:land?P.ring:f6mix(P.ground,P.ring,.55),even:true}); } }
  B.flush(); v=cv; f6EC27.set(key,v); return v; }
function f6base27(st,w,h){ return f6slot(st,'base',f6DK(w,h)+st.step+'|'+st.from+'|'+st.ms,()=>{ const L=lay27(w), P=P27, {cv,g}=f6off(w,h), pad=L.pad, PL=f6plan27(st.from,st.step,st.ms);
  M.fill(g,P.ground); f6head(g,w,pad,'L-27 · Pairing · flap board',null,P);
  f6disp(g,T27,pad-1,L.tY,L.ts,P.ink); L.sub.forEach((l,i)=>M.text(g,l,pad,L.subY+i*20,Object.assign(f6dispO(L.ss),{color:P.soft})));
  f6box(g,pad,L.by,w-pad,L.by+L.bh,P.hair);
  const B=new M.Buf(g), pin=f6mix(P.ground,P.ring,.38);
  L.rows.forEach((R,r)=>{ const big=!L.ph; f6lab(g,ROWS27[r].id,R.lx,R.ly+(big?20:13),P.ink,big?12:10.5); f6lab(g,ROWS27[r].sub,R.lx,R.ly+(big?38:27),P.soft,9,{upper:false,track:.02});
    if(big&&r<2) M.rule(g,pad+L.bp,R.uy+L.uh+L.rg/2,w-pad-L.bp,R.uy+L.uh+L.rg/2,P.hair);
    if(!big&&r<2){ const yy=R.uy+L.uh+L.rg/2; M.rule(g,pad+L.bp,yy,w-pad-L.bp,yy,P.hair); }
    /* axle pins in the gaps: the hinge every flap turns on */
    for(let c=0;c<=U27;c++){ const x=R.ux+c*(L.uw+L.gap)-L.gap/2; B.dot(x,R.uy+L.uh/2,big?1.25:.8,pin); } });
  B.flush();
  const done=st.from<0?'from blank':'from '+ST27[st.from].n;
  f6monoP(g,done+' · this change · '+PL.tot+' flips across 36 units · longest unit '+PL.mx+' flips · a 64th ('+Math.round(S64_27)+' ms) cascade per unit · a '+f6nv27(st.ms)+' ('+Math.round(f6fq27(st.ms))+' ms) a flap · settles in '+(PL.end/1000).toFixed(2)+' s',pad,L.rdY,L.inner,P.soft,9.5,15,false);
  L.foot.forEach((l,i)=>M.text(g,l,pad,L.footY+i*14,Object.assign(f6monoO(9,false),{color:P.dim})));
  return cv; }); }
function f6draw27(g,w,h,st,t){ const L=lay27(w), A=f6atlas27(L.uw,L.uh), PL=f6slot(st,'plan',st.from+'|'+st.step+'|'+st.ms,()=>f6plan27(st.from,st.step,st.ms)), P=P27;
  PL.U.forEach((u,i)=>{ const R=L.rows[u.r], x=R.ux+u.c*(L.uw+L.gap); f6unit27(g,A,x,R.uy,u,t);
    /* a unit lights as it settles on its note */
    const e=t!=null&&u.n?m3_env(st,'u'+i,t,240):0; if(e>.04){ g.globalAlpha=Math.min(.4,.4*e); g.fillStyle=P.ring; g.fillRect(x,R.uy,L.uw,L.uh); g.globalAlpha=1; } });
  L.rows.forEach((R,r)=>{ const si=t!=null&&t<PL.rowEnd[r]?st.from:st.step; const cv=f6echo27(si,r,L.ew,L.eh); g.drawImage(cv,R.ex,R.ey,L.ew,L.eh); });
  /* the axle pins tick with the clatter; the board's last settle lights the rows' marks */
  const ek=m3_env(st,'k',t,70), ea=m3_env(st,'land',t,500); if(ek>.05||ea>.05){ const B=new M.Buf(g), pin=f6mix(P.ground,P.ring,.6);
    L.rows.forEach((R,r)=>{ if(ek>.05&&t<PL.rowEnd[r]) for(let c=0;c<=U27;c++) B.dot(R.ux+c*(L.uw+L.gap)-L.gap/2,R.uy+L.uh/2,(L.ph?.8:1.25)*(1+.6*ek),pin);
      if(ea>.05) f6dots(B,R.ex,R.ey+L.eh+4,R.ex+L.ew,R.ey+L.eh+4,2,.7*(1+ea),P.acc); }); B.flush(); }
  return t!=null&&t<PL.end+700; }
/* music: the clatter is the rhythm and the settles are the melody. 107 BPM; while units turn, a flap clacks on every 32nd (or
   every flap, if flaps are slower), louder the more units are turning. Each unit's last flip lands on a 16th as a struck note: its
   character is the note (drum index mod 4 picks a chord tone, the top row high, the bottom row low), so the arriving word
   is a melody and the board settles into the reading's chord. Advance walks a progression: loose Em7, settling Asus4, in tune
   D (the third arrives, meet), lock D with the stacked bass, renewal G with the bass, then round again. */
const CH27={loose:'Em7',settling:'Asus4','in tune':'D',lock:'D',renewal:'G'};
function f6music27(st){ const mu=M.music, S=mu.score({bpm:BPM27}), PL=f6plan27(st.from,st.step,st.ms), S0=ST27[st.step].n, sym=CH27[S0], prev=st.from>=0?CH27[ST27[st.from].n]:null, fq=f6fq27(st.ms), g=Math.max(fq,S32_27);
  const groups=new Map(); PL.U.forEach((u,i)=>{ if(!u.n) return; const k=Math.round(u.end/S16_27); let a=groups.get(k); if(!a) groups.set(k,a=[]); a.push(i); });
  const first=groups.size?Math.min(...groups.keys())*S16_27:0;
  S.harm(prev&&first>0?[[0,prev],[first,sym]]:[[0,sym]]);
  if(prev&&first>0) S.chord(0,'pad',mu.voice(prev,'A3','A4',3),first,{attack:.02,release:.3,cutoff:700,vel:.3});
  if(PL.end>0) S.chord(first,'pad',mu.voice(sym,'A3','A4',3),PL.end-first+200,{attack:Math.min(1.2,(PL.end-first)/1000*.7),release:.4,cutoff:1000,vel:.54});
  /* the clatter: on the grid, wherever units are still turning and no unit is settling */
  for(let t=0;t<PL.end-1;t+=g){ let n=0; for(const u of PL.U) if(u.n&&t>=u.st0&&t<u.end) n++; const k16=Math.floor(t/S16_27+1e-6); if(!n||groups.has(k16)) continue;
    S.hitSound(t,'flap',{vel:.4+.3*Math.sqrt(n/36),pan:((t/g)%3-1)*.25},['k',.6]); }
  /* the settles: each unit's character is a chord tone; units settling on the same 16th ring together */
  const base=['A4','D4','A3'];
  [...groups.entries()].sort((a,b)=>a[0]-b[0]).forEach(([k,ids])=>{ const t=k*S16_27, notes=[]; let nn=0;
    ids.forEach(i=>{ const u=PL.U[i]; if(DRUM27[u.ib]===' '){ return; } const m=mu.ct(sym,base[u.r],u.ib%4); if(!notes.includes(m)) notes.push(m); nn++; });
    if(!notes.length){ S.hitSound(t,'tap',{vel:.3}); ids.forEach(i=>S.hit(t,'u'+i,.5)); return; }
    S.chord(t,'mallet',notes.slice(0,4),1500,{bright:1.2,trem:5.5,vel:.62+.05*Math.min(4,nn),pan:(PL.U[ids[0]].c/11-.5)*.7});
    ids.forEach(i=>S.hit(t,'u'+i,1)); });
  /* landing: the reading's chord with its root; in tune brings the third (meet), lock and renewal the stacked bass */
  if(PL.end>0){ const t=PL.end; S.note(t,S0==='lock'||S0==='renewal'?'bass':'pluck',m3_root(sym,2),600,S0==='lock'||S0==='renewal'?{from:m3_root(m3_tr(sym,7),1),glide:90,env:2.8,decay:.4,vel:.58}:{cutoff:360,env:1.1,vel:.6},['land',1]);
    if(S0==='in tune') S.note(t,'meet','F#4',1800,{spread:30,vel:.5}); else S.note(t+S16_27,'mallet',mu.ct(sym,'A4',0),1400,{vel:.4,trem:5}); }
  S.end(PL.end+1500); return S.out(); }
M.piece({ id:'L-27',
  caption:'Three of Mir’s readings on a split-flap board, each character turning through its drum to the new value and then holding. Press Advance for the next state, or change Flap time.',
  alt:'A dark flap board with three rows of twelve split flaps reading SETTLING .38, 12/21 and 612 · 4 + 1, each flap split by a hinge gap with axle pins between units. At the left of each row, a small stippled mark: rings with a red center, 21 leaning bars with twelve lit red, and two dotted strands crossing at diamonds.',
  recipe:{
    idea:'A change you see once, counted in flips, and then it holds.',
    marks:['ring','center','bar','diamond','dot'],
    ground:'night',
    accent:'the red center and lit breaths in the row marks',
    composition:'A flap board of three rows of twelve units, each row with a small Mir mark and the reading’s name at its left; a readout of the change and a root line below.',
    motion:'On a 107 BPM grid. Advance: each unit starts a 64th after the one before (row-major) and turns through its drum one flap per Flap time (quantized to a 64th, 32nd or 16th), its last flip landing on a 16th, where it lights; each row’s mark changes once the row lands. Reduced motion jumps to the final value.',
    sound:'The clatter is the rhythm, flaps on 32nds swelling with the units still turning. Each settle is a struck note, its character a chord tone, so the word arrives as a melody and the board settles into a chord; Advance walks the progression.',
    controls:['Advance (five states)','Flap time 30–140 ms'],
    computed:['flips per unit = (index(new) − index(old)) mod 43 on a fixed 43-character drum','settle time = the latest unit’s start + flips × flap time','a turning half darkens by its angle'],
    placeholder:['the readings','drum order and flap time (assumed for this study)'],
    root:'Valle and Valle, Cifra 3, 1965',
    rules:['no ticking and no loop: it changes once and holds'],
    engine:['M.ring','M.along','M.curve.diamond','M.Buf','M.rng','M.text','M.rule','M.fill']
  },
  aspect:w=>w/lay27(w).H,
  state:{step:1,from:-1,ms:60},
  controls:[
    {id:'advance',type:'button',label:'Advance',play:true,run:st=>{ st.from=st.step; st.step=(st.step+1)%ST27.length; }},
    {id:'ms',type:'range',label:'Flap time',min:30,max:140,step:5,fmt:v=>v+' ms · '+f6nv27(v)}],
  music:f6music27,
  /* Flap time is the clatter's note value: a burst of four flaps at the new value, and a bell pitched by it (higher is faster) */
  musicParam(A,st,id,ov,nv){ if(id!=='ms') return false; const a=f6fq27(ov), b=f6fq27(nv), now=A.now()+.006, mu=M.music; if(a===b) return true;
    for(let k=0;k<4;k++) A.play('flap',{when:now+k*b/1000,vel:.42-.04*k,pan:(k-1.5)*.15});
    A.play('bell',{when:now+4*b/1000,freq:mu.hz(b===S64_27?'A5':b===S32_27?'F#5':'D5','D'),ratio:3.5,vel:.36,dur:1.4}); return true; },
  render(g,w,h,M,st){ f6blit(g,f6base27(st,w,h)); f6draw27(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ f6blit(g,f6base27(st,w,h)); if(f6RM()){ f6draw27(g,w,h,st,null); return false; } return f6draw27(g,w,h,st,Math.max(0,t)); } });

/* ════════════════════════════════════════════════════════════════════════
   L-28 · Llull's wheel · a combinatorial paper volvelle ↔ a model combining what you said.
   COMPUTED: the truth of each combination under two written rules. Rule 1: the relation must be able to happen in that state
   (REL28[].ok). Rule 2: the thing must be in that state, where a thing's state comes from its placeholder k and breath count
   (b ≥ 21 → renewal; k ≥ .95 lock; ≥ .8 in tune; ≥ .34 settling; else loose). True = both. 9 × 6 × 5 = 270 combinations;
   the count of true ones is computed, not typed. Discs snap to cells; the accent ring at the pivot locks only when true.
   Cells are keyed by letter after Llull's nine-letter alphabet (B–K, without J). Schematic: three discs; no figure of the Ars is reconstructed.
   ════════════════════════════════════════════════════════════════════════ */
const P28=f6pal('paper');
const THINGS28=[{t:'the call',k:.22,b:9},{t:'sleep',k:.86,b:14},{t:'the move',k:.58,b:12},{t:'my brother',k:.3,b:6},{t:'the new job',k:.5,b:11},{t:'the dinner',k:.97,b:19},{t:'my knee',k:.9,b:8},{t:'the train',k:.12,b:3},{t:'this week',k:.88,b:21}];
const REL28=[{id:'agree',ok:['settling','in tune','lock'],gl:'dots agree on a figure'},{id:'arrive',ok:['loose','settling'],gl:'a stray arrives at a ring'},{id:'cross',ok:['settling','in tune'],gl:'two strands cross'},
  {id:'breathe',ok:['in tune','lock','renewal'],gl:'an exchange becomes a breath'},{id:'renew',ok:['renewal'],gl:'21 breaths begin a new cycle'},{id:'forget',ok:['loose','settling','in tune','lock','renewal'],gl:'a hollow is left, on request'}];
const STS28=['loose','settling','in tune','lock','renewal'], KEYS28='BCDEFGHIK';
const f6tst28=x=>x.b>=21?'renewal':x.k>=.95?'lock':x.k>=.8?'in tune':x.k>=.34?'settling':'loose';
const DISC28=[{n:9,lab:i=>THINGS28[i].t,name:'outer · what you said'},{n:6,lab:i=>REL28[i].id,name:'middle · relations'},{n:5,lab:i=>STS28[i],name:'inner · states'}];
const TRUE28=(()=>{ let n=0; THINGS28.forEach(x=>REL28.forEach(r=>{ if(r.ok.includes(f6tst28(x))) n++; })); return n; })();
const CNT28='9 × 6 × 5 = 270 combinations · '+TRUE28+' true';
function f6judge28(a){ const x=THINGS28[a[0]], r=REL28[a[1]], s=STS28[a[2]], ts=f6tst28(x);
  if(ts!==s) return {ok:false,why:x.t+' is '+ts+', not '+s+'.'}; if(!r.ok.includes(s)) return {ok:false,why:r.id+' does not happen while '+s+'.'};
  return {ok:true,why:x.t+' is '+s+', and '+r.gl+'.'}; }
const T28='Llull’s wheel';
const SUB28='Three paper discs compose a sentence at the index; the pivot ring locks when it is true.';
const ROOT28='Root · Llull, c. 1300, after the zairja: paper wheels that combine concepts. Simplified: three discs.';
const RULE1='1 · The relation must be able to happen in that state.', RULE2='2 · The thing must be in that state, from how far it settled and its breath count.';
const lay28=f6memo(function(w){ const ph=w<760, pad=ph?16:32, inner=w-2*pad, o={ph,pad,inner};
  o.labY=pad+8; o.ts=ph?30:40; o.tY=f6q(o.labY+(ph?44:52)); o.ss=ph?13.5:15; o.sub=f6lines(SUB28,ph?inner:Math.min(640,inner),f6dispO(o.ss)); o.subY=f6q(o.tY+(ph?30:34));
  let y=f6q(o.subY+(o.sub.length-1)*20+(ph?44:52));
  if(!ph){ o.Rw=Math.min(262,Math.floor((inner*.52-48)/2)); o.cx=pad+o.Rw+28; o.cy=y+o.Rw+28; o.rx=o.cx+o.Rw+56; o.rw=w-pad-o.rx; o.ry=y+8; }
  else { o.Rw=Math.floor(inner/2)-4; o.cx=w/2; o.cy=y+o.Rw+28; o.rx=pad; o.rw=inner; o.ry=o.cy+o.Rw+44; }
  const R=o.Rw; o.rad=[[R*.69,R],[R*.41,R*.69],[R*.14,R*.41]]; o.hub=R*.14;
  /* the reading column */
  let ry=o.ry; o.sentY=ry+(ph?40:48); o.ssz=ph?24:32; o.sentN=2; ry=o.sentY+o.sentN*f6q(o.ssz*1.12)+4; o.verY=ry; o.verN=Math.max(...[2,3].map(()=>2)); ry+=18+o.verN*19+24;
  o.r1Y=ry; o.r1N=f6paraN(RULE1,o.rw,{size:13}); ry+=(o.r1N-1)*18+22; o.tabY=ry; ry+=REL28.length*16+18;
  o.r2Y=ry; o.r2N=f6paraN(RULE2,o.rw,{size:13}); ry+=(o.r2N-1)*18+22; o.thY=ry; o.thN=f6monoN(THINGS28.map(x=>x.t+' '+f6tst28(x)).join(' · '),o.rw,10,false); ry+=(o.thN-1)*16+28;
  o.cntY=ry; ry+=(f6monoN(CNT28,o.rw,9.5)-1)*15+8;
  y=Math.max(o.cy+o.Rw+36,ry)+28; o.foot=f6lines(ROOT28,inner,f6monoO(9,false)); o.footY=y; o.H=f6q(y+(o.foot.length-1)*14+pad); return o; });
/* each disc, precomputed in its own polar frame (ρ, φ with 0 at the top), so turning it is a rigid rotation of the same dots */
function f6discs28(w){ return f6slot(f6DISC28,'d',w+'@'+f6dpr(),()=>{ const L=lay28(w), out=[], tint=f6mix(P28.ground,P28.ink,.3), ph=L.ph, R=L.Rw;
  const sp=ph?2:2.2, P=f6jit([0,0,2*R,2*R],sp,2801,.15), dens=[.07,.11,.15];
  DISC28.forEach((D,j)=>{ const [ri,ro]=L.rad[j], X=[], Y=[], Rd=[], C=[]; const add=(rho,phi,r,c)=>{ X.push(rho); Y.push(phi); Rd.push(r); C.push(c); };
    for(let i=0;i<P.length;i+=3){ const x=P[i]-R, y=P[i+1]-R, rho=Math.hypot(x,y); if(rho>ri+1.2&&rho<ro-1.2&&P[i+2]<dens[j]) add(rho,Math.atan2(x,-y),ph?.5:.55,tint); }
    const cap=f6cap(); M.ring(cap,{cx:0,cy:0,R:ro,w:ph?1.1:1.4,swell:.45,dpl:ph?.75:.7,rCore:ph?.75:.85,rEdge:.5,seed:2810+j,color:P28.ink});
    if(j===2) M.ring(cap,{cx:0,cy:0,R:ri,w:1,swell:.3,dpl:.8,rCore:.7,rEdge:.5,seed:2815,color:P28.ink});
    for(let i=0;i<cap.X.length;i++) add(Math.hypot(cap.X[i],cap.Y[i]),Math.atan2(cap.X[i],-cap.Y[i]),cap.R[i],cap.C[i]);
    const soft=f6mix(P28.ground,P28.ink,.5); for(let c=0;c<D.n;c++){ const phi=(c+.5)*TAU/D.n; for(let rho=ri+5;rho<ro-4;rho+=ph?2.2:2.4) add(rho,phi,.55,soft); }
    out.push({j,ri,ro,n:D.n,X:Float32Array.from(X),Y:Float32Array.from(Y),R:Float32Array.from(Rd),C}); });
  return out; }); }
const f6DISC28={};
const f6th28=(st,j,ix)=>-ix*TAU/DISC28[j].n;
function f6disc28(g,B,L,Dd,th,sel){ const cx=L.cx, cy=L.cy;
  for(let i=0;i<Dd.X.length;i++){ const a=Dd.Y[i]+th-Math.PI/2; B.dot(cx+Dd.X[i]*Math.cos(a),cy+Dd.X[i]*Math.sin(a),Dd.R[i],Dd.C[i]); } }
function f6discText28(g,L,j,th,sel){ const D=DISC28[j], [ri,ro]=L.rad[j], rm=(ri+ro)/2+(j===2?2:0), size=L.ph?(j===0?9.5:10):(j===0?11:11.5), ks=9;
  for(let c=0;c<D.n;c++){ const a=-Math.PI/2+c*TAU/D.n+th, x=L.cx+rm*Math.cos(a), y=L.cy+rm*Math.sin(a), on=c===sel;
    g.save(); g.translate(x,y); g.rotate(a+Math.PI/2); M.text(g,D.lab(c),0,size*.36,{font:'mono',size,weight:500,track:.02,color:on?P28.ink:f6mix(P28.ground,P28.ink,.62),align:'center'});
    M.text(g,KEYS28[c],0,-(ro-rm)+ks+(L.ph?3:5),{font:'mono',size:ks,weight:500,color:on?P28.ink:f6mix(P28.ground,P28.ink,.45),align:'center'}); g.restore(); } }
function f6base28(st,w,h){ return f6slot(st,'base',f6DK(w,h)+'|'+(st.used?1:0),()=>{ const L=lay28(w), P=P28, {cv,g}=f6off(w,h), pad=L.pad;
  M.fill(g,P.ground); f6head(g,w,pad,'L-28 · Pairing · volvelle',null,P);
  f6disp(g,T28,pad-1,L.tY,L.ts,P.ink); L.sub.forEach((l,i)=>M.text(g,l,pad,L.subY+i*20,Object.assign(f6dispO(L.ss),{color:P.soft})));
  /* the index line, above the wheel */
  const top=L.cy-L.Rw; M.rule(g,L.cx,top-22,L.cx,top-4,P.ink); f6lab(g,'index',L.cx+8,top-12,P.soft,9);
  if(!st.used) f6lab(g,'drag a disc to turn it',L.ph?L.cx-L.Rw:L.cx-L.Rw,top-12,P.soft,9);
  f6lab(g,'At the index',L.rx,L.ry,P.ink,9.5);
  f6lab(g,'Two rules',L.rx,L.r1Y-22,P.ink,9.5);
  f6para(g,RULE1,L.rx,L.r1Y,L.rw,{size:13,lh:18,color:P.ink});
  const c2=L.ph?Math.min(110,L.rw*.34):120; REL28.forEach((r,i)=>{ const y=L.tabY+i*16; f6lab(g,r.id,L.rx,y,P.ink,10,{upper:false,track:.02}); f6lab(g,r.ok.length===5?'any state':r.ok.join(' · '),L.rx+c2,y,P.soft,10,{upper:false,track:.02}); });
  f6para(g,RULE2,L.rx,L.r2Y,L.rw,{size:13,lh:18,color:P.ink});
  f6monoP(g,THINGS28.map(x=>x.t+' '+f6tst28(x)).join(' · '),L.rx,L.thY,L.rw,P.soft,10,16,false);
  f6monoP(g,CNT28,L.rx,L.cntY,L.rw,P.ink,9.5,15,true);
  L.foot.forEach((l,i)=>M.text(g,l,pad,L.footY+i*14,Object.assign(f6monoO(9,false),{color:P.dim})));
  return cv; }); }
/* time is the music's: 100 BPM. Each disc turns over two beats (inOutCubic), the discs an 8th apart, so a one-cell turn passes
   its detent on an 8th; the verdict lands on beat 3 and the pivot ring tightens over one beat */
const BPM28=100, E8_28=60000/BPM28/2, TURN28=4*E8_28, VER28=2*E8_28+TURN28, LK28=2*E8_28;
const f6d28=(st,j)=>{ const n=DISC28[j].n; let d=((st.a[j]-st.pa[j])%n+n)%n; if(d>n/2) d-=n; return d; };
function f6draw28(g,w,h,st,t){ const L=lay28(w), P=P28, Ds=f6discs28(w), c=f6c(st), B=new M.Buf(g);
  const ix=[0,1,2].map(j=>{ if(c.th&&c.th[j]!=null) return -c.th[j]/(TAU/DISC28[j].n); if(t==null) return st.a[j];
    return st.pa[j]+f6d28(st,j)*E.inOutCubic(cl((t-j*E8_28)/TURN28)); });
  const th=ix.map((v,j)=>-v*TAU/DISC28[j].n), sel=ix.map((v,j)=>((Math.round(v)%DISC28[j].n)+DISC28[j].n)%DISC28[j].n);
  Ds.forEach(Dd=>f6disc28(g,B,L,Dd,th[Dd.j],sel[Dd.j]));
  /* windows: the reading cell of each disc, framed in dots at the index */
  /* the window of each disc flashes as its voice sounds the cell under the index */
  const wc=f6mix(P.ground,P.ink,.8); DISC28.forEach((D,j)=>{ const [ri,ro]=L.rad[j], h=Math.PI/D.n, a0=-Math.PI/2-h, a1=-Math.PI/2+h, sp=L.ph?1.8:2, e=m3_env(st,'c'+j,t,260), rd=.62*(1+.7*e), col=e>.3?P.acc:wc;
    for(const a of [a0,a1]) for(let r=ri+2;r<=ro-2;r+=sp) B.dot(L.cx+r*Math.cos(a),L.cy+r*Math.sin(a),rd,col);
    for(const r of [ri+2,ro-2]){ const n=Math.max(4,Math.round(r*2*h/sp)); for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; B.dot(L.cx+r*Math.cos(a),L.cy+r*Math.sin(a),rd,col); } } });
  /* the pivot and the ring that agrees */
  const J=f6judge28(sel), done=t==null||t>VER28, lk=J.ok?(t==null?1:E.outCubic(cl((t-VER28)/LK28))):0, hub=L.hub, loose=1-lk;
  M.ring(B,{cx:L.cx,cy:L.cy,R:hub*.28,w:1.4,swell:.2,dpl:1.4,rCore:.8,rEdge:.55,seed:2830,color:P.ink});
  const ev=m3_env(st,'v',t,500); if(J.ok&&done) M.ring(B,{cx:L.cx,cy:L.cy,R:hub*.66*(1+.18*ev),w:1.3+loose*3,swell:.3,dpl:1.6,rCore:.95,rEdge:.6,seed:2831,color:P.acc,ex:1+loose*.6,ey:1-loose*.3,rot:.7,loose:loose*hub*.25});
  else M.ring(B,{cx:L.cx,cy:L.cy,R:hub*.66,w:3,swell:.4,dpl:.7,rCore:.7,rEdge:.5,seed:2831,color:f6mix(P.ground,P.ink,.4),ex:1.5,ey:.75,rot:.7,loose:hub*.22});
  B.flush();
  for(let j=0;j<3;j++) f6discText28(g,L,j,th[j],sel[j]);
  /* the composed sentence */
  const sent=[THINGS28[sel[0]].t,REL28[sel[1]].id,STS28[sel[2]]].join(' · '), lh=f6q(L.ssz*1.12);
  f6lines(sent,L.rw,f6dispO(L.ssz)).slice(0,2).forEach((l,i)=>f6disp(g,l,L.rx-1,L.sentY+i*lh,L.ssz,P.ink));
  if(done||!J.ok){ f6lab(g,J.ok?'true':'not true',L.rx,L.verY,J.ok?P.acc:P.soft,9.5); f6para(g,J.why.charAt(0).toUpperCase()+J.why.slice(1),L.rx,L.verY+20,L.rw,{size:14,lh:19,color:P.soft}); }
  return t!=null&&t<VER28+LK28+700; }
function f6disc28At(L,x,y){ const r=Math.hypot(x-L.cx,y-L.cy); for(let j=2;j>=0;j--){ const [ri,ro]=L.rad[j]; if(r>=ri&&r<=ro+(j===0?10:0)) return j; } return -1; }
/* music: the three discs are three voices. The outer cell is the root (D G A B E F# D G A), the middle one the third (agree a
   major third, arrive the 4th still arriving, cross a minor third, breathe a major third, renew a 2nd, forget nothing, the
   hollow octave), the inner one the fifth and its colour (loose a 6th, settling and in tune the fifth, lock the fifth an octave
   up, renewal the 9th). 100 BPM: the turning disc's ratchet clicks on 8ths and its voice glides one step to the new cell as it
   passes the detent (voice leading). On beat 3 the verdict: true, the chord is pure and locks (meet on the third, the bass
   once, a bell); not true, the inner voices slide apart into a beating cluster and fade. */
const RT28=[0,3,4,5,1,2,0,3,4], MID28=[4,5,3,4,2,12], INN28=[9,7,7,19,14];
function f6v28(a){ const mu=M.music, pc=(mu.MODES.ionian[RT28[a[0]]]+2)%12, R=45+((pc-9+12)%12), rs=m3_PC[pc]; return {rs,v:[R,R+12+MID28[a[1]],R+12+INN28[a[2]]]}; }
function f6sym28(a){ const {rs}=f6v28(a), m=MID28[a[1]]; return rs+(m===4?'':m===3?'m':m===5?'sus4':m===2?'sus2':'sus2'); }
function f6music28(st){ const mu=M.music, S=mu.score({bpm:BPM28}), E8=E8_28, A0=f6v28(st.pa), A1=f6v28(st.a), J=f6judge28(st.a), hz=(m,rs)=>mu.hz(m,rs);
  S.harm([[0,f6sym28(st.pa)],[VER28,f6sym28(st.a)]]);
  const cur=A0.v.slice(), rs0=A0.rs; let rsC=rs0;
  /* the three voices, held */
  [0,1,2].forEach(j=>S.note(0,'glide',{hz:hz(cur[j],rs0)},VER28+(J.ok?2400:1300),{id:'v'+j,attack:.08,release:J.ok?.9:1.1,vel:[.6,.55,.52][j],vibrato:2,wow:1,flutter:.3,tone:2600,pan:(j-1)*.3},null));
  S.note(0,'pluck',A0.v[0]-12,TURN28,{cutoff:340,env:1.1,vel:.56});
  /* the turns: the ratchet on 8ths while a disc moves; at each detent the disc's voice steps to the new cell */
  const det=[]; [0,1,2].forEach(j=>{ const d=f6d28(st,j); if(!d) return; const n=DISC28[j].n, s0=j*E8, sg=Math.sign(d);
    for(let k=0;k<4;k++) S.hitSound(s0+k*E8,'click',{vel:.24,pan:-.15+.15*j});
    for(let m=0;m<Math.abs(d);m++){ const u=f6inv28((m+.5)/Math.abs(d)), t=Math.round((s0+TURN28*u)/(E8/2))*(E8/2), cell=((st.pa[j]+sg*(m+1))%n+n)%n, b=st.pa.slice(); b[j]=cell; det.push([t,j,b]); } });
  det.sort((x,y)=>x[0]-y[0]).forEach(([t,j,b])=>{ const V=f6v28(b); S.hitSound(t,'click',{vel:.5-.06*j,pan:-.15+.15*j},['c'+j,1]);
    if(j===0){ rsC=V.rs; [0,1,2].forEach(q=>{ cur[q]=V.v[q]; S.glide(t,'v'+q,{hz:hz(cur[q],rsC)},150); }); } else { cur[j]=V.v[j]; S.glide(t,'v'+j,{hz:hz(cur[j],rsC)},150); } });
  /* the verdict on beat 3 */
  const v=A1.v, rs=A1.rs; [0,1,2].forEach(j=>S.hit(VER28,'c'+j,1));
  if(J.ok){ S.note(VER28,'meet',v[1],1800,{spread:28,vel:.5,over:rs},['v',1]); S.note(VER28,'bass',v[0]-12,560,{from:v[0]-17,glide:90,env:2.8,decay:.4,vel:.56,over:rs});
    S.chord(VER28,'pad',[v[0],v[1],v[2]-12],2000,{attack:.05,release:1,cutoff:1300,vel:.42,over:rs});
    v.forEach((m,i)=>S.note(VER28+(i+1)*E8/2,'mallet',m+12,1200,{vel:.42,trem:5,over:rs,pan:(i-1)*.3})); S.note(VER28+2*E8,'bell',v[1]+12,2000,{ratio:3.5,vel:.32,over:rs}); }
  else { S.hitSound(VER28,'tap',{vel:.4},['v',1]); S.set(VER28,'v1','freq',hz(v[1],rs)*m3_cents(-18),320); S.set(VER28,'v2','freq',hz(v[2],rs)*m3_cents(23),320);
    S.note(VER28,'pluck',v[0]-12,600,{cutoff:300,env:.8,vel:.62,over:rs}); S.note(VER28,'mallet',v[0],900,{vel:.5,trem:0,over:rs}); }
  S.end(VER28+(J.ok?3000:2200)); return S.out(); }
function f6inv28(y){ let a=0,b=1; for(let i=0;i<30;i++){ const m=(a+b)/2; if(E.inOutCubic(m)<y) a=m; else b=m; } return (a+b)/2; }
/* pointer: a detent while dragging plays the cell's voice; letting go plays the verdict */
function f6tap28(st,j,cell){ const A=m3_A('L-28'); if(!A) return; const b=st.a.slice(); b[j]=cell; const V=f6v28(b), now=A.now()+.004; A.play('click',{when:now,vel:.5-.06*j,pan:-.15+.15*j}); A.play('mallet',{when:now,freq:M.music.hz(V.v[j]+12,V.rs),dur:.7,vel:.4,trem:5,pan:-.15+.15*j}); }
function f6ver28(st){ const A=m3_A('L-28'); if(!A) return; const mu=M.music, J=f6judge28(st.a), V=f6v28(st.a), now=A.now()+.01, f=V.v.map(m=>mu.hz(m,V.rs));
  A.play('tap',{when:now,vel:.36});
  if(J.ok){ A.play('meet',{when:now+.04,freq:f[1],spread:28,dur:1.2,vel:.5}); A.play('pad',{when:now+.04,chord:[f[0],f[1],f[2]/2],dur:1.1,attack:.05,release:.8,cutoff:1300,vel:.4}); }
  else f.forEach((x,i)=>A.play('glide',{when:now+.04+i*.03,freq:x*m3_cents([0,-18,23][i]),dur:.5,release:.6,vel:.36,vibrato:0,pan:(i-1)*.25})); }
M.piece({ id:'L-28',
  caption:'Three paper discs, holding things said, Mir’s relations and states, compose a sentence at the index. Turn or drag a disc; the ring at the pivot locks when the sentence is true.',
  alt:'A paper volvelle of three concentric stippled discs with lettered cells: an outer ring of invented things said, a middle ring of relations, and an inner ring of states. Dotted windows at the top mark one cell of each; beside the wheel, the composed sentence, whether it is true, and the two rules.',
  recipe:{
    idea:'Meaning made by combining marks, with an old machine for it; the accent appears only when the combination is true.',
    marks:['ring','center','dot'],
    ground:'paper',
    accent:'the ring at the pivot, red and tight when the sentence is true; loose and gray otherwise',
    composition:'A volvelle of three concentric stippled discs with lettered cells and an index line at the top; beside it (below on phones) the composed sentence, the verdict, the two rules with a relation table, each thing’s state and the count.',
    motion:'On a 100 BPM grid: a turn eases each disc to its cell over two beats (inOutCubic, discs an 8th apart), passing its detent on an 8th, where its window flashes; the verdict lands on beat 3 and, if true, the pivot ring tightens over one beat (outCubic). Reduced motion snaps.',
    sound:'The discs are three voices: the outer cell is the root, the middle the third, the inner the fifth. A turn ratchets on 8ths and steps one voice to its new note. True, the chord locks with the bass; false, it beats and fades.',
    controls:['Turn outer','Turn middle','Turn inner','drag a disc to turn it'],
    computed:['true = the relation can happen in that state and the thing is in that state','a thing’s state from its settled value k and breath count b: b ≥ 21 renewal; k ≥ .95 lock; ≥ .80 in tune; ≥ .34 settling; else loose','the true count over all 9 × 6 × 5 = 270 combinations'],
    placeholder:['things said, with their settled values and breath counts'],
    root:'Llull, c. 1300, likely drawing on the zairja, a letter wheel of Muslim astrologers; Leibniz, De arte combinatoria, 1666',
    rules:['cells keyed B–K after Llull’s nine-letter alphabet (no J); three discs, with no figure of the Ars reconstructed'],
    engine:['M.ring','M.Buf','M.rng','M.ease.inOutCubic','M.ease.outCubic','M.text','M.rule','M.fill']
  },
  aspect:w=>w/lay28(w).H,
  state:{a:[2,1,1],pa:[0,0,0],used:false},
  controls:[
    {id:'outer',type:'button',label:'Turn outer',play:true,run:st=>{ st.pa=st.a.slice(); st.a[0]=(st.a[0]+1)%9; st.used=true; }},
    {id:'middle',type:'button',label:'Turn middle',play:true,run:st=>{ st.pa=st.a.slice(); st.a[1]=(st.a[1]+1)%6; st.used=true; }},
    {id:'inner',type:'button',label:'Turn inner',play:true,run:st=>{ st.pa=st.a.slice(); st.a[2]=(st.a[2]+1)%5; st.used=true; }}],
  touchAction:'none',
  render(g,w,h,M,st){ f6blit(g,f6base28(st,w,h)); f6draw28(g,w,h,st,null); },
  music:f6music28,
  animate(g,w,h,M,st,t){ f6blit(g,f6base28(st,w,h)); if(f6RM()){ f6draw28(g,w,h,st,null); st.pa=st.a.slice(); return false; }
    const more=f6draw28(g,w,h,st,Math.max(0,t)); if(!more) st.pa=st.a.slice(); return more; },
  pointer(st,e){ const L=lay28(e.w), c=f6c(st), ang=Math.atan2(e.y-L.cy,e.x-L.cx);
    if(e.type==='down'){ const j=f6disc28At(L,e.x,e.y); if(j<0) return false; st.pa=st.a.slice(); c.drag={j,a0:ang,th0:-st.a[j]*TAU/DISC28[j].n}; c.th=[null,null,null]; c.th[j]=c.drag.th0; m3_S(st).cell28=st.a[j]; return false; }
    if(e.type==='move'&&c.drag){ let d=ang-c.drag.a0; d=Math.atan2(Math.sin(d),Math.cos(d)); c.th[c.drag.j]=c.drag.th0+d; c.drag.th0=c.th[c.drag.j]; c.drag.a0=ang;
      /* a detent click when the reading crosses into the next cell (rate-limited) */
      m3_try(()=>{ const S=m3_S(st), j=c.drag.j, n=DISC28[j].n, cell=Math.round(-c.th[j]/(TAU/n)), now=performance.now(); if(cell!==S.cell28){ S.cell28=cell; if(now-(S.det||0)>70){ S.det=now; f6tap28(st,j,((cell%n)+n)%n); } } }); return true; }
    if(e.type==='up'&&c.drag){ const j=c.drag.j, n=DISC28[j].n; st.a[j]=((Math.round(-c.th[j]/(TAU/n))%n)+n)%n; st.pa=st.a.slice(); c.drag=null; c.th=null; st.used=true;
      m3_try(()=>f6ver28(st)); return true; }
    return false; } });

/* ════════════════════════════════════════════════════════════════════════
   L-29 · A perfect fifth · Lissajous's forks and mirrors ↔ two voices finding a ratio.
   COMPUTED: x = sin(a·τ + δ), y = sin(b·τ), τ over one full period, sampled evenly, so dots crowd where the beam slows (the
   turning points read brighter, as on a screen). You are the reference, f_y = 220 Hz; Mir is f_x = 220·a/b, detuned by c cents:
   f_x' = f_x·2^(c/1200), Δf = f_x' − f_x. The phase drifts δ(t) = δ0 + 2π·Δf·t. Because a and b are coprime, the figure repeats
   whenever δ moves 2π/b, so it turns at b·|Δf| Hz, which is exactly the beat of the partials that meet (b·f_x = a·f_y).
   Persistence: the last six figures, 45 ms apart, drawn older = smaller and dimmer. No blur, no glow. Motion shown 4× slower.
   ════════════════════════════════════════════════════════════════════════ */
const P29=f6pal('night');
const RAT29={'1:1':{a:1,b:1,name:'unison'},'2:1':{a:2,b:1,name:'octave'},'3:2':{a:3,b:2,name:'perfect fifth'},'4:3':{a:4,b:3,name:'perfect fourth'}};
const F029=220, SLOW29=4, DT29=32, AGES29=5;
const T29='A perfect fifth';
const SUB29='Your pitch against Mir’s as a Lissajous figure that stands still in tune.';
const ROOT29='Root · Lissajous, 1857: a beam off two forks’ mirrors draws their ratio. Simplified: a schematic apparatus.';
function f6calc29(st){ const R=RAT29[st.ratio]||RAT29['3:2'], fy=F029, fx=F029*R.a/R.b, fx2=fx*Math.pow(2,st.cents/1200), df=fx2-fx, beat=R.b*Math.abs(df);
  return {R,fy,fx,fx2,df,beat,meet:R.b*fx,d0:(R.a+R.b)%2===0?Math.PI/2:0}; }
const lay29=f6memo(function(w){ const ph=w<480, pad=ph?16:24, inner=w-2*pad, o={ph,pad,inner};
  o.labY=pad+8; o.ts=ph?30:34; o.tY=f6q(o.labY+(ph?44:48)); o.ss=ph?13.5:14; o.sub=f6lines(SUB29,inner,f6dispO(o.ss)); o.subY=f6q(o.tY+28);
  let y=f6q(o.subY+(o.sub.length-1)*20+36); o.sx=pad; o.sy=y; o.sw=inner; o.sh=f6q(inner*.8); y+=o.sh;
  o.rdY=y+30; o.colW=ph?inner:(inner-24)/2; o.rdRows=ph?6:3; y=o.rdY+o.rdRows*36+18;
  o.fk=[pad,y,pad+inner,y+(ph?190:176)]; y=o.fk[3]+32;
  o.foot=f6lines(ROOT29,inner,f6monoO(9,false)); o.footY=y; o.H=f6q(y+(o.foot.length-1)*14+pad); return o; });
/* a tuning fork in stipple, from the tip of the tine that carries the mirror: two tines, the U, a stem.
   dir 'left': tines lie horizontal and the fork extends left (the second tine below); 'down': tines stand vertical, the fork
   extends down (the second tine to the right). Blue-noise dots in a union of rectangles, so the edges are crisp. */
function f6fork29(B,tx,ty,dir,tl,tw,gp,col,seed){ const S=M.shape, rs=[];
  if(dir==='left'){ const y1=ty, y2=ty+gp+tw, x0=tx-tl; rs.push(S.rect(x0,y1-tw/2,tx,y1+tw/2,.4),S.rect(x0,y2-tw/2,tx,y2+tw/2,.4),S.rect(x0-tw,y1-tw/2,x0,y2+tw/2,.4),S.rect(x0-tw-tl*.5,(y1+y2)/2-tw*.4,x0-tw,(y1+y2)/2+tw*.4,.4)); }
  else { const x1=tx, x2=tx+gp+tw, y0=ty+tl; rs.push(S.rect(x1-tw/2,ty,x1+tw/2,y0,.4),S.rect(x2-tw/2,ty,x2+tw/2,y0,.4),S.rect(x1-tw/2,y0,x2+tw/2,y0+tw,.4),S.rect((x1+x2)/2-tw*.4,y0+tw,(x1+x2)/2+tw*.4,y0+tw+tl*.5,.4)); }
  const f=S.max(...rs), box=dir==='left'?[tx-tl*1.5-tw-3,ty-tw-3,tx+3,ty+gp+tw*2+3]:[tx-tw-3,ty-3,tx+gp+tw*2+3,ty+tl*1.5+tw+3];
  M.blue(B,{box:box.map(Math.round),sp:1.05,seed,density:(x,y)=>f(x,y)*.9,rOf:(d,R)=>.55+.12*R(),color:col}); }
function f6base29(st,w,h){ return f6slot(st,'base',f6DK(w,h)+st.ratio+'|'+st.cents,()=>{ const L=lay29(w), P=P29, {cv,g}=f6off(w,h), pad=L.pad, C=f6calc29(st), B=new M.Buf(g);
  M.fill(g,P.ground); f6head(g,w,pad,'L-29 · Pairing · Lissajous',null,P);
  f6disp(g,T29,pad-1,L.tY,L.ts,P.ink); L.sub.forEach((l,i)=>M.text(g,l,pad,L.subY+i*20,Object.assign(f6dispO(L.ss),{color:P.soft})));
  /* the screen: 10 × 8 divisions, the graticule in dots */
  const {sx,sy,sw,sh}=L, dx=sw/10, dy=sh/8, gc=f6mix(P.ground,P.ring,.2), gc2=f6mix(P.ground,P.ring,.34);
  for(let i=1;i<10;i++) for(let yy=sy+3;yy<sy+sh-2;yy+=4) B.dot(sx+i*dx,yy,.5,i===5?gc2:gc);
  for(let j=1;j<8;j++) for(let xx=sx+3;xx<sx+sw-2;xx+=4) B.dot(xx,sy+j*dy,.5,j===4?gc2:gc);
  for(let i=0;i<=50;i++){ B.dot(sx+i*dx/5,sy+sh/2,.7,gc2); } for(let j=0;j<=40;j++){ B.dot(sx+sw/2,sy+j*dy/5,.7,gc2); }
  B.flush(); f6box(g,sx,sy,sx+sw,sy+sh,f6mix(P.ground,P.ring,.3));
  f6lab(g,'x · Mir →',sx+sw-8,sy+sh-10,P.soft,9,{align:'right'}); f6lab(g,'↑ y · you',sx+8,sy+18,P.soft,9);
  /* the readings */
  const still=st.cents===0, cs=(st.cents>0?'+':st.cents<0?'−':'±')+Math.abs(st.cents)+' ¢';
  const rows=[['You',C.fy.toFixed(2)+' Hz · the reference'],['Mir',(still?C.fx.toFixed(2):C.fx.toFixed(2)+' → '+C.fx2.toFixed(2))+' Hz · '+cs],['Ratio',st.ratio+' · '+C.R.name],
    ['Beat',(still?'0':C.beat.toFixed(2))+' Hz · b × Δf'],['Partials meet',C.meet.toFixed(0)+' Hz · '+C.R.b+' × '+C.fx.toFixed(0)+' = '+C.R.a+' × '+C.fy.toFixed(0)],['Figure',still?'stands still · in tune':'turns every '+(1/C.beat).toFixed(2)+' s · shown '+SLOW29+'× slower']];
  rows.forEach((r,i)=>{ const col=L.ph?0:Math.floor(i/3), rw=L.ph?i:i%3, x=L.sx+col*(L.colW+24), y=L.rdY+rw*36;
    const acc=r[0]==='Figure'&&still; f6lab(g,r[0],x,y,acc?P.acc:P.soft,9); M.text(g,r[1],x,y+17,Object.assign(f6monoO(L.ph?10.5:11,false),{color:acc?P.acc:P.ink})); });
  /* the apparatus: lamp → mirror on your fork → mirror on Mir's fork → screen */
  { const [x0,y0,x1,y1]=L.fk, W=x1-x0, H=y1-y0, bc=f6mix(P.ground,P.ring,.45), fc=f6mix(P.ground,P.ring,.62), B2=new M.Buf(g), R=M.rng(2901);
    f6lab(g,'Apparatus · schematic, not to scale',x0,y0+4,P.soft,9);
    const tl=Math.min(84,W*.17), tw=4.5, gp=9, lamp=[x0+W*.05,y0+H*.82], mB=[x0+W*.42,y0+H*.4], mA=[x0+W*.64,y0+H*.56], scr=[x0+W*.96,y0+H*.36];
    [[lamp,mB],[mB,mA],[mA,scr]].forEach(([a,b])=>f6dots(B2,a[0],a[1],b[0],b[1],2.4,.6,bc));
    M.ring(B2,{cx:lamp[0],cy:lamp[1],R:5,w:1.6,swell:.2,dpl:1.4,rCore:.8,rEdge:.55,seed:2902,color:P.ring});
    for(let yy=scr[1]-H*.24;yy<=scr[1]+H*.24;yy+=1.5) B2.dot(scr[0]+R()*1.2,yy,.7,P.ring);
    /* each mirror rides on a tine tip; your fork's tines lie flat (they bend the beam in y), Mir's stand up (x) */
    f6fork29(B2,mB[0]-6,mB[1]-tw,'left',tl,tw,gp,fc,2903); f6fork29(B2,mA[0]+tw,mA[1]+6,'down',tl*.62,tw,gp,fc,2904);
    f6dots(B2,mB[0]-6,mB[1]+4,mB[0]+6,mB[1]-4,.9,.95,P.ring); f6dots(B2,mA[0]-6,mA[1]-4,mA[0]+6,mA[1]+4,.9,.95,P.ring); B2.flush();
    f6lab(g,'lamp',lamp[0]-6,lamp[1]+22,P.soft,9); f6lab(g,'screen',scr[0]-8,scr[1]-H*.24+8,P.soft,9,{align:'right'});
    f6lab(g,'your fork · '+C.fy.toFixed(0)+' Hz · bends y',mB[0]-6-tl*1.5-tw,mB[1]-tw-18,P.ink,9);
    f6lab(g,'Mir’s fork · '+C.fx.toFixed(0)+' Hz · bends x',L.ph?x1:mA[0]+gp+tw*2+12,L.ph?y0+H-4:mA[1]+tl*.4,P.ink,9,L.ph?{align:'right'}:{}); }
  L.foot.forEach((l,i)=>M.text(g,l,pad,L.footY+i*14,Object.assign(f6monoO(9,false),{color:P.dim})));
  return cv; }); }
/* time is the music's: the audible beat sets the tempo. bpm = beat × 60 ÷ k, with k audible beats to a quarter note chosen so the
   tempo falls in 60–130, so the beating lands on the grid. A cue is two bars (more when the beat is slow), always a whole number
   of figure turns, so the loop is seamless in sound and picture. In tune there is no beat, and the tempo rests at 72. */
const K29=[1/8,1/4,1/2,1,2,4,8];
function f6grid29(st){ const C=f6calc29(st); if(!(C.beat>0)) return {C,bpm:72,k:0,bars:2,len:2*4*60000/72};
  let k=K29.find(x=>{ const b=C.beat*60/x; return b>=60&&b<130; }); if(k==null) k=C.beat*60<60?1/8:8; const bpm=C.beat*60/k, bars=Math.max(2,Math.round(1/k)); return {C,bpm,k,bars,len:bars*4*60000/bpm}; }
function f6draw29(g,w,h,st,t){ const L=lay29(w), P=P29, C=f6calc29(st), B=new M.Buf(g), tt=t||0, A=L.sh*.42, cx=L.sx+L.sw/2, cy=L.sy+L.sh/2, N=L.ph?820:980;
  const del=ms=>C.d0+TAU*C.df*(ms/1000)/SLOW29, ages=C.df===0?1:AGES29;
  /* a flash at each audible beat: the meeting partials are in phase at the strike, so the beat peaks at n ÷ beat seconds */
  const fl=t!=null&&C.beat>0?Math.pow(Math.abs(Math.cos(Math.PI*C.beat*tt/1000)),8):0, em=m3_env(st,'m*',t,200), el=m3_env(st,'lock',t,700);
  for(let k=ages-1;k>=0;k--){ const d=del(tt-k*DT29), col=k?f6mix(P.ground,P.ring,1-k*.14):P.ring, r=(L.ph?.82:.9)*(1-k*.07)*(k?1:1+.45*fl+.25*em);
    for(let i=0;i<N;i++){ const u=i/N*TAU; B.dot(cx+A*Math.sin(C.R.a*u+d),cy-A*Math.sin(C.R.b*u),r,col); } }
  /* the third arriving: a small red ring at the figure's center when it blooms in tune */
  if(el>.04) M.ring(B,{cx,cy,R:A*(.05+.05*el),w:1.2,swell:.2,dpl:1.6,rCore:.85,rEdge:.6,seed:2905,color:P.acc});
  B.flush(); return t==null||tt<f6grid29(st).len; }
/* music: the two forks are struck together at the frequencies printed (you 220 Hz, Mir 220 × a/b × 2^(c/1200)) and ring down;
   their meeting partials beat at exactly the Beat reading, and that beat is the tempo. You are the root (A), so Mir's fifth is
   E and the third that can appear between you is C#. Over the ringing forks, the motif: 5 ↑ 1 ↑ 4 while detuned, the 4 leaning
   toward the third as the detune shrinks (it reaches it only at 0), answered by a return to the root; hats on the grid, a rim
   on 2 and 4, a plucked root. At 0 cents the beat stops, the 4 falls to the third, and the chord blooms: Mir's third (meet),
   the bass once, a bell at the shared partial. Every pitch over the forks is an exact multiple of 220 Hz, so only the forks beat. */
function f6music29(st){ const Gd=f6grid29(st), C=Gd.C, S=M.music.score({bpm:Gd.bpm}), B=S.beat, F=C.fy, on=st.cents===0, LEN=Gd.len, bars=Gd.bars;
  const lean=on?1:Math.max(0,1-Math.abs(st.cents)/20), third=F*2*5/4, four=F*2*4/3, lf=four*Math.pow(third/four,lean*.85);
  S.harm([[0,on?'A':'Asus4']]);
  /* the forks: struck, ringing down over the cue (the next cue strikes them again) */
  S.note(0,'drone',{hz:F},LEN,{id:'fk',ratio:C.R.a/C.R.b,detune:st.cents,level:.6,fade:.02,breath:.0001,cutoff:2600},null); S.set(40,'fk','level',.3,LEN*.6);
  S.hitSound(0,'tap',{vel:.42},['m0',.6]);
  for(let p=0;p<bars;p+=2){ const o=p*4*B, last=p+2>=bars;
    /* rhythm on the beating's grid */
    for(let q=0;q<16;q++){ const t=o+q*B/2; if(q%4===2) S.hitSound(t,'rim',{vel:.26,tune:.9}); else if(q%2===1) S.hitSound(t,'hat',{vel:.12,decay:.02}); }
    S.note(o,'pluck',{hz:F/2},B*1.6,{cutoff:360,env:1.1,vel:.56}); S.note(o+4*B,'pluck',{hz:F/2},B*1.6,{cutoff:360,env:1.1,vel:.5});
    /* the motif, and its answer */
    [[0,F*1.5],[B,F*2],[2*B,on?third:four]].forEach(([t,f],i)=>S.note(o+t,'mallet',{hz:f},i===2?2*B:B*1.1,{vel:.62,trem:5,pan:(i-1)*.25},['m'+(i+1),1]));
    if(on&&p===0){ const t=o+4*B; S.note(t,'meet',{hz:third},2400,{spread:30,vel:.52},['lock',1]); S.note(t,'bass',{hz:F/4},620,{from:F/4*.75,glide:90,env:2.8,decay:.4,vel:.56});
      S.hitSound(t,'pad',{chord:[F,F*5/4,F*1.5],dur:2*B/1000,attack:.05,release:.9,cutoff:1300,vel:.44}); S.note(t+B/2,'bell',{hz:C.meet},2400,{ratio:3.5,bright:.6,vel:.36}); S.note(t+2*B,'mallet',{hz:F*2},B*1.5,{vel:.42,trem:5},['m4',1]); }
    else { S.note(o+4*B,'glide',{hz:four},2*B,{id:'ln'+p,from:F*2,glide:120,attack:.04,release:.4,vibrato:4,wow:0,flutter:0,tone:2800,vel:.58},['m4',1]); S.glide(o+4*B+B*.6,'ln'+p,{hz:lf},B*1.2);
      S.note(o+6*B,'mallet',{hz:F*2},B*1.6,{vel:.58,trem:5},['m5',1]); if(!last) S.note(o+7*B,'mallet',{hz:F*1.5},B*.9,{vel:.5,trem:5},['m6',1]); } }
  S.end(LEN); return S.out(); }
M.piece({ id:'L-29',
  caption:'Your pitch against Mir’s as a Lissajous figure, which turns at the beat rate when detuned and stands still in tune. Pick a Ratio, then move Detune toward zero.',
  alt:'A dark oscilloscope screen with a dotted graticule and a Lissajous figure drawn in dots, the 3:2 pretzel of a perfect fifth, with fainter, smaller trailing copies where the figure is turning. Below, the frequencies, the beat rate and a stippled schematic of a lamp, two tuning forks with mirrors, and a screen.',
  recipe:{
    idea:'Agreement shows as a figure that holds still; your pitch is the reference, and Mir moves.',
    marks:['dot'],
    ground:'night',
    accent:'the Figure reading, red when the figure stands still at 0 cents',
    composition:'A 10 × 8 dotted graticule with the figure; six readings below in two columns (one on phones); a stippled schematic of lamp, two forks with mirrors and a screen.',
    motion:'Loops on the beat’s own tempo (a whole number of figure turns per loop): the phase drifts δ(t) = δ0 + 2π·Δf·t, shown 4× slower, with five trailing copies 32 ms apart; the figure swells on each audible beat. At 0 cents one still figure, and a red ring as the third blooms. Reduced motion shows t = 0.',
    sound:'Two struck forks at exactly the frequencies shown; their beat is the tempo, and the motif plays over it, its 4 leaning toward the third as you tune. At 0 cents the beat stops, the 4 falls to the third and the chord blooms.',
    controls:['Ratio (1:1, 2:1, 3:2, 4:3)','Detune −20 to +20 ¢'],
    computed:['x = sin(a·τ + δ), y = sin(b·τ) over one period, sampled evenly so dots crowd at the turning points','Mir’s pitch = 220 × a/b × 2^(c/1200); Δf from the in-tune value','beat = b × |Δf|, the rate the figure turns (the partials meet at b·fₓ = a·f_y)'],
    placeholder:['the 220 Hz reference'],
    root:'Lissajous, 1857',
    rules:['persistence by smaller, dimmer copies; no blur, no glow','the apparatus is schematic, not to scale'],
    engine:['M.ring','M.blue','M.shape.rect','M.shape.max','M.Buf','M.rng','M.text','M.rule','M.fill']
  },
  aspect:w=>w/lay29(w).H,
  state:{ratio:'3:2',cents:6},
  loop:true,
  controls:[
    {id:'ratio',type:'select',label:'Ratio',play:true,options:Object.keys(RAT29).map(k=>({value:k,label:k+' · '+RAT29[k].name}))},
    {id:'cents',type:'range',label:'Detune',min:-20,max:20,step:1,fmt:v=>(v>0?'+':v<0?'−':'±')+Math.abs(v)+' ¢'}],
  music:f6music29,
  /* Detune is the beat: dragging holds the two forks at exactly the printed frequencies, so you hear the beat slow as you tune;
     at 0 the third blooms */
  musicParam(A,st,id,ov,nv){ if(id!=='cents') return false; const S=m3_S(st), C=f6calc29(Object.assign({},st,{cents:nv})), now=A.now()+.006;
    if(!S.fk||!S.fk.alive||S.fr!==st.ratio){ if(S.fk&&S.fk.alive) S.fk.stop(null,.1); S.fk=A.play('drone',{when:now,freq:C.fy,ratio:C.R.a/C.R.b,detune:nv,level:.55,fade:.03,breath:.0001,cutoff:2600}); S.fr=st.ratio; }
    else S.fk.set('detune',nv,40);
    if(nv===0&&ov!==0){ A.play('meet',{when:now,freq:C.fy*2*5/4,spread:30,dur:1.8,vel:.5}); A.play('bell',{when:now+.1,freq:C.meet,ratio:3.5,bright:.6,vel:.34,dur:2.2}); }
    clearTimeout(S.to); const h=S.fk; S.to=setTimeout(()=>{ if(h&&h.alive) h.stop(null,1.2); },1600); return true; },
  render(g,w,h,M,st){ f6blit(g,f6base29(st,w,h)); f6draw29(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ f6blit(g,f6base29(st,w,h)); return f6draw29(g,w,h,st,Math.max(0,t)); } });

/* ════════════════════════════════════════════════════════════════════════
   L-30 · Drawn by a machine, slowly · a pen plotter ↔ the field, computed.
   COMPUTED: the dot list is the hero field (M.mirField at k = 1, seed 3) captured once and mapped to an A5 sheet (148 × 210 mm,
   field radius 52 mm). A pen taps one dot per point, all the same size: tone comes only from count. Travel order is a
   nearest-neighbor tour from the plotter's home (0, 0), bottom left, using a 1.5 mm grid, run per pen (pen 1 ink, then pen 2 red for the
   center). Pen-up travel is summed in mm and compared with the order the dots were generated in. Time = taps ÷ 8 per second
   (travel not counted). HP-GL coordinates at 40 units per mm, origin bottom-left. The machine is a placeholder.
   ════════════════════════════════════════════════════════════════════════ */
const P30=f6pal('paper');
const SH30={w:148,h:210,cx:74,cy:88,R:52}, TAPS30=8, HP30=40;
const T30='Drawn by a machine, slowly';
const SUB30='The hero field plotted one tap per dot, with the time it takes counted.';
const ROOT30='Root · the pen plotter: one pen, one tap per point. Simplified: HP-GL, 40 units per mm.';
let f6PL30=null;
function f6nn30(xy,hx,hy){ const n=xy.length/2, cs=1.5, gw=Math.ceil(SH30.w/cs)+2, gh=Math.ceil(SH30.h/cs)+2, grid=new Array(gw*gh), cell=(x,y)=>Math.min(gh-1,Math.max(0,Math.floor(y/cs)))*gw+Math.min(gw-1,Math.max(0,Math.floor(x/cs)));
  for(let i=0;i<n;i++){ const k=cell(xy[2*i],xy[2*i+1]); (grid[k]||(grid[k]=[])).push(i); }
  const order=new Int32Array(n); let x=hx, y=hy, len=0;
  for(let s=0;s<n;s++){ const gx=Math.min(gw-1,Math.max(0,Math.floor(x/cs))), gy=Math.min(gh-1,Math.max(0,Math.floor(y/cs))); let best=-1, bd=Infinity, bk=-1, bj=-1;
    for(let r=0;r<Math.max(gw,gh);r++){ for(let yy=gy-r;yy<=gy+r;yy++){ if(yy<0||yy>=gh) continue; for(let xx=gx-r;xx<=gx+r;xx++){ if(xx<0||xx>=gw) continue; if(Math.max(Math.abs(xx-gx),Math.abs(yy-gy))!==r) continue;
        const a=grid[yy*gw+xx]; if(!a) continue; for(let q=0;q<a.length;q++){ const i=a[q], dx=xy[2*i]-x, dy=xy[2*i+1]-y, d=dx*dx+dy*dy; if(d<bd){ bd=d; best=i; bk=yy*gw+xx; bj=q; } } } }
      if(best>=0&&bd<=(r*cs)*(r*cs)) break; }
    const a=grid[bk]; a[bj]=a[a.length-1]; a.pop(); order[s]=best; len+=Math.sqrt(bd); x=xy[2*best]; y=xy[2*best+1]; }
  return {order,len,x,y}; }
function f6plan30(){ if(f6PL30) return f6PL30; const cap=f6cap(), Rr=140, k=SH30.R/Rr;
  M.mirField(cap,{cx:0,cy:0,R:Rr,k:1,seed:3,pal:{ring:'A',blade:'A',center:'C'},rings:9,dens:1.35,r:.85,strays:7});
  const pen=[[],[]]; for(let i=0;i<cap.X.length;i++) pen[cap.C[i]==='C'?1:0].push(SH30.cx+cap.X[i]*k,SH30.cy+cap.Y[i]*k);
  /* travel in the order generated, for comparison */
  let gl=0, px=0, py=SH30.h; for(const P of pen) for(let i=0;i<P.length;i+=2){ gl+=Math.hypot(P[i]-px,P[i+1]-py); px=P[i]; py=P[i+1]; }
  /* and in a seeded shuffle (Fisher–Yates), the order a naive program would send */
  let sl=0; { const R=M.rng(3001); for(const P of pen){ const n=P.length/2, ix=Array.from({length:n},(_,i)=>i); for(let i=n-1;i>0;i--){ const j=(R()*(i+1))|0; [ix[i],ix[j]]=[ix[j],ix[i]]; } px=0; py=SH30.h; ix.forEach(i=>{ sl+=Math.hypot(P[2*i]-px,P[2*i+1]-py); px=P[2*i]; py=P[2*i+1]; }); } }
  const t1=f6nn30(pen[0],0,SH30.h), t2=f6nn30(pen[1],t1.x,t1.y), seq=[];
  t1.order.forEach(i=>seq.push(pen[0][2*i],pen[0][2*i+1],0)); t2.order.forEach(i=>seq.push(pen[1][2*i],pen[1][2*i+1],1));
  const N=seq.length/3; f6PL30={seq,N,n1:t1.order.length,n2:t2.order.length,travel:t1.len+t2.len,gen:gl,shuf:sl,secs:N/TAPS30}; return f6PL30; }
const f6mmss=s=>Math.floor(s/60)+' min '+String(Math.round(s%60)).padStart(2,'0')+' s';
const f6hp30=(x,y)=>'PU'+Math.round(x*HP30)+','+Math.round((SH30.h-y)*HP30)+';PD;';
const lay30=f6memo(function(w){ const ph=w<480, pad=ph?16:24, inner=w-2*pad, o={ph,pad,inner};
  o.labY=pad+8; o.ts=ph?30:32; o.tl=f6lines(T30,inner,f6dispO(o.ts)); o.tlh=f6q(o.ts*1.08); o.tY=f6q(o.labY+(ph?44:48)); o.ss=ph?13.5:14; o.sub=f6lines(SUB30,inner,f6dispO(o.ss)); o.subY=f6q(o.tY+(o.tl.length-1)*o.tlh+28);
  let y=f6q(o.subY+(o.sub.length-1)*20+36);
  if(!ph){ o.sw=Math.round(inner*.58); o.shx=pad; o.shy=y+10; o.rx=pad+o.sw+28; o.rw=inner-o.sw-28; o.ry=y+18; }
  else { o.sw=inner-12; o.shx=pad+6; o.shy=y+10; o.rx=pad; o.rw=inner; }
  o.s=o.sw/SH30.w; o.shh=Math.round(SH30.h*o.s); if(ph) o.ry=o.shy+o.shh+44;
  let ry=o.ry; o.st=[]; for(let i=0;i<3;i++){ o.st.push(ry); ry+=ph?72:78; } o.hpY=ry+6; o.hpBox=[o.rx,ry+12,o.rw,6*15+18]; ry=ry+12+o.hpBox[3]+24; o.liveY=ry; ry+=25;
  y=Math.max(o.shy+o.shh+24,ry)+24; o.foot=f6lines(ROOT30,inner,f6monoO(9,false)); o.footY=y; o.H=f6q(y+(o.foot.length-1)*14+pad); return o; });
function f6base30(st,w,h){ return f6slot(st,'base',f6DK(w,h)+st.speed+'|'+st.pen,()=>{ const L=lay30(w), P=P30, {cv,g}=f6off(w,h), pad=L.pad, PL=f6plan30();
  M.fill(g,P.ground); f6head(g,w,pad,'L-30 · Pairing · pen plotter',null,P);
  L.tl.forEach((l,i)=>f6disp(g,l,pad-1,L.tY+i*L.tlh,L.ts,P.ink)); L.sub.forEach((l,i)=>M.text(g,l,pad,L.subY+i*20,Object.assign(f6dispO(L.ss),{color:P.soft})));
  /* the sheet: A5, with crop marks and the plotter's home */
  const x0=L.shx, y0=L.shy, x1=x0+L.sw, y1=y0+L.shh; M.fill(g,'#ffffff',x0,y0,L.sw,L.shh); f6box(g,x0,y0,x1,y1,P.hair);
  const cm=8; [[x0,y0,-1,-1],[x1,y0,1,-1],[x0,y1,-1,1],[x1,y1,1,1]].forEach(([x,y,sx,sy])=>{ M.rule(g,x+sx*3,y,x+sx*(3+cm),y,P.soft); M.rule(g,x,y+sy*3,x,y+sy*(3+cm),P.soft); });
  f6lab(g,'home 0,0',x0,y1+20,P.soft,9); f6lab(g,'A5 · 148 × 210 mm',x1,y1+20,P.soft,9,{align:'right'});
  /* the computed stats */
  const big=(v,lab,sub,y)=>{ f6disp(g,v,L.rx-1,y+24,L.ph?26:28,P.ink); f6lab(g,lab,L.rx,y+44,P.ink,9); if(sub) f6lab(g,sub,L.rx,y+58,P.soft,9,{upper:false,track:.02}); };
  big(f6fmtInt(PL.N),'taps','pen 1 · '+f6fmtInt(PL.n1)+'  pen 2 · '+f6fmtInt(PL.n2),L.st[0]);
  big((PL.travel/1000).toFixed(2)+' m','pen-up travel · nearest neighbor',(PL.gen/1000).toFixed(1)+' m as generated · '+(PL.shuf/1000).toFixed(0)+' m shuffled',L.st[1]);
  big(f6mmss(PL.secs),'at '+TAPS30+' taps a second','shown at ×'+st.speed+' · plays in '+(PL.secs/st.speed).toFixed(1)+' s',L.st[2]);
  f6lab(g,'HP-GL · the program',L.rx,L.hpY,P.ink,9.5); const [bx,by,bw,bh]=L.hpBox; f6rr(g,bx,by,bw,bh,6,f6mix(P.ground,P.ink,.055));
  L.foot.forEach((l,i)=>M.text(g,l,pad,L.footY+i*14,Object.assign(f6monoO(9,false),{color:P.dim})));
  return cv; }); }
function f6draw30(g,w,h,st,t){ const L=lay30(w), P=P30, PL=f6plan30(), s=L.s, ox=L.shx, oy=L.shy, B=new M.Buf(g), rate=TAPS30*st.speed, dur=PL.N/rate*1000;
  const n=t==null?PL.N:Math.min(PL.N,Math.floor(t/1000*rate)), tip=st.pen==='broad'?1.0:.5, r=Math.max(M.minR(g),tip/2*s), S=PL.seq;
  for(let i=0;i<n;i++) B.dot(ox+S[3*i]*s,oy+S[3*i+1]*s,r,S[3*i+2]?P.acc:P.ink);
  const X=i=>i<0?ox:ox+S[3*i]*s, Y=i=>i<0?oy+SH30.h*s:oy+S[3*i+1]*s, live=t!=null&&n<PL.N;
  if(live){ const tc=f6mix(P.ground,P.ink,.4); for(let k=Math.max(-1,n-7);k<n;k++) f6dots(B,X(k),Y(k),X(k+1),Y(k+1),1.6,.45,tc); }
  B.flush();
  /* the pen head: a crosshair at the next tap; it opens on each tap note, and turns red at the pen change */
  if(live){ const e=m3_env(st,'t',t,110), ep=m3_env(st,'pen',t,500), hx=X(n), hy=Y(n), a=5*(1+.9*e+.8*ep), gp=2, c=ep>.3?P.acc:P.ink; M.rule(g,hx-a-gp,hy,hx-gp,hy,c); M.rule(g,hx+gp,hy,hx+a+gp,hy,c); M.rule(g,hx,hy-a-gp,hx,hy-gp,c); M.rule(g,hx,hy+gp,hx,hy+a+gp,c); }
  /* colophon, once the plot is finished */
  if(!live){ const xh=Math.max(7,s*2.5), lx=ox+14*s, base=oy+(SH30.h-12)*s; M.logo(g,lx,base,xh,{color:P.ink});
    f6lab(g,'plotted on A5',ox+(SH30.w-14)*s,base-11,P.soft,9,{align:'right',upper:false,track:.02}); f6lab(g,f6fmtInt(PL.N)+' taps · pens 1 + 2',ox+(SH30.w-14)*s,base+1,P.soft,9,{align:'right',upper:false,track:.02}); }
  /* the program, live: the last lines sent */
  const [bx,by,bw]=L.hpBox, lines=[]; if(n===0) lines.push('IN;','SP1;'); for(let i=Math.max(0,n-5);i<n;i++){ if(i===PL.n1) lines.push('SP2;'); lines.push(f6hp30(S[3*i],S[3*i+1])); } if(!live) lines.push('PU;SP0;');
  lines.slice(-6).forEach((l,i)=>M.text(g,l,bx+12,by+20+i*15,Object.assign(f6monoO(L.ph?10:10,false),{color:i===Math.min(5,lines.length-1)&&live?P.ink:f6mix(P.ground,P.ink,.6)})));
  f6lab(g,live?'tap '+f6fmtInt(n+1)+' of '+f6fmtInt(PL.N):'finished',L.rx,L.liveY,live?P.ink:P.soft,9); f6lab(g,'plot time '+f6mmss(live?n/TAPS30:PL.secs),L.rx,L.liveY+15,P.soft,9);
  return t!=null&&t<dur+500; }
/* music: the plot is a melody of headings. Speed sets the tempo (84 BPM at ×20 up to 144 at ×400) and the pen taps are 16ths, each
   16th holding Speed × 8 × a 16th's worth of taps. The heading of the pen's travel over that 16th, as a compass point, is a
   scale degree (east the root, round to the octave), stepping at most a third from the last and on the chord at each beat:
   the fine pen sings it high and glassy, the broad pen low and woody. Each bar's chord comes from how far from the center the
   pen is working (outer rings IV, then vi, ii, and V near the middle); a plucked root on each bar. Under it the stepper whine
   glides between chord tones with the pen-up speed over a soft pad. The pen change to red, the center, is the arrival: I, the third (meet), the
   bass once; parking brings the whine home to D with the chord. */
const f6bpm30=sp=>Math.round(84+60*Math.log(sp/20)/Math.log(20));
function f6tl30(st){ const PL=f6plan30(), rate=TAPS30*st.speed, bpm=f6bpm30(st.speed), s16=15000/bpm; return {PL,rate,bpm,s16,K:rate*s16/1000,dur:PL.N/rate*1000}; }
function f6music30(st){ const mu=M.music, T=f6tl30(st), PL=T.PL, Sq=PL.seq, S=mu.score({bpm:T.bpm}), s16=T.s16, B=4*s16, BAR=16*s16, fine=st.pen!=='broad', md='ionian';
  const n16=Math.ceil(T.dur/s16), tap=i=>Math.min(PL.N-1,Math.max(0,Math.floor(i))), tPen=PL.n1/T.rate*1000, cum=f6trav30();
  const nb=Math.ceil(T.dur/BAR), chord=[]; for(let b=0;b<nb;b++){ const i0=tap(b*16*T.K), i1=tap((b+1)*16*T.K); let r=0, c=0; for(let i=i0;i<=i1;i+=Math.max(1,(i1-i0)>>5)){ r+=Math.hypot(Sq[3*i]-SH30.cx,Sq[3*i+1]-SH30.cy)/SH30.R; c++; } r/=c||1;
    chord.push(b*BAR>=tPen?'D':r>.82?'G':r>.6?'Bm':r>.38?'Em':'A7sus4'); }
  const pb=Math.floor(tPen/BAR), harm=chord.map((c,b)=>[b*BAR,c]); harm.push([Math.max(tPen,pb*BAR),'D']); harm.sort((a,b)=>a[0]-b[0]); S.harm(harm.concat([[T.dur,'D']]));
  /* bars: a plucked root */
  chord.forEach((c,b)=>{ const t=b*BAR; if(t>=T.dur||t>=tPen) return; S.note(t,'pluck',m3_root(c,2),B*1.5,{cutoff:340,env:1.1,vel:.56});
    if(!b||chord[b-1]!==c){ let e=b+1; while(e<chord.length&&chord[e]===c) e++; S.chord(t,'pad',mu.voice(c,'A3','A4',3),Math.min(e*BAR,tPen,T.dur)-t,{attack:.3,release:.4,cutoff:800,vel:.38}); } });
  /* the stepper whine, one held voice gliding between chord tones with the pen-up speed (per beat) */
  const wh=S.note(0,'glide','D3',T.dur+300,{id:'wh',attack:.4,release:.8,vibrato:2,wow:1.5,flutter:.6,tone:1500,vel:.42,echo:.12,echoTime:B*.75/1000},null);
  for(let t=B;t<T.dur;t+=B){ const i0=tap((t-B)/1000*T.rate), i1=tap(t/1000*T.rate), v=(cum[i1]-cum[i0])/(B/1000), hz=Math.max(90,Math.min(360,v*40/64)), sym=S.chordAt(t);
    let best=null, bd=1e9; for(const m of mu.tones(sym,'D3','D5')){ const d=Math.abs(Math.log2(mu.hz(m,sym)/hz)); if(d<bd){ bd=d; best=m; } } S.glide(t,'wh',best,B*.7); }
  /* the taps: one note per 16th, its pitch the heading */
  let prev=null; for(let n=0;n<n16;n++){ const t=n*s16; if(t>=T.dur) break; const i0=tap(n*T.K), i1=tap((n+1)*T.K), dx=Sq[3*i1]-Sq[3*i0], dy=-(Sq[3*i1+1]-Sq[3*i0+1]);
    let d=Math.round(((Math.atan2(dy,dx)/TAU)+1)%1*8)%8; if(prev!=null) d=prev+Math.max(-2,Math.min(2,d-prev)); prev=d;
    const sym=S.chordAt(t), base=mu.deg(md,d,fine?5:3), m=n%4===0?mu.snap(sym,base):base, on=n%4===0, p2=Sq[3*i0+2];
    if(fine) S.note(t,'bell',m,s16*2.2,{ratio:3.5,bright:.5,vel:on?.56:.48,pan:(Sq[3*i0]/SH30.w-.5)*.8},['t',1]);
    else S.note(t,'mallet',m,s16*2.4,{ratio:1,bright:.9,cutoff:1800,vel:on?.68:.6,pan:(Sq[3*i0]/SH30.w-.5)*.8},['t',1]);
    if(p2&&n%4===0) S.hitSound(t,'tick',{vel:.18,tock:true}); }
  /* the pen change: the red center, I with its third, the bass once */
  S.hitSound(tPen,'clave',{freq:mu.hz('F#5','D'),vel:.42},['pen',1]); S.note(tPen,'meet','F#4',1800,{spread:30,vel:.5});
  S.note(tPen,'bass','D2',560,{from:'A1',glide:90,env:2.8,decay:.4,vel:.56}); S.chord(tPen,'pad',mu.voice('D','D4','D5',4),Math.max(800,T.dur-tPen),{attack:.2,release:.6,cutoff:1100,vel:.38});
  /* parking: home */
  S.glide(T.dur,'wh','D3',600); S.hitSound(T.dur,'tap',{vel:.4},['park',1]); if(T.dur-tPen>B){ S.chord(T.dur,'pad',mu.voice('D','D4','D5',4),1500,{attack:.04,release:1,cutoff:1400,vel:.44}); S.note(T.dur,'bell','F#5',2000,{ratio:3.5,vel:.34}); }
  S.end(T.dur+1800); return S.out(); }
let f6TR30=null;
function f6trav30(){ if(f6TR30) return f6TR30; const PL=f6plan30(), S=PL.seq, cum=new Float32Array(PL.N+1); let px=0, py=SH30.h;
  for(let i=0;i<PL.N;i++){ cum[i+1]=cum[i]+Math.hypot(S[3*i]-px,S[3*i+1]-py); px=S[3*i]; py=S[3*i+1]; } f6TR30=cum; return cum; }
/* a control answers in the pen's own voice: the motif at the new tempo (Speed) or in the new pen (Pen) */
function f6fig30(A,st,bpm){ const mu=M.music, fine=st.pen!=='broad', s16=15/bpm, now=A.now()+.006;
  [-3,0,2,4].forEach((d,i)=>{ const m=mu.deg('ionian',d,fine?5:3), f=mu.hz(m,'D'); if(fine) A.play('bell',{when:now+i*s16,freq:f,ratio:3.5,bright:.5,dur:.6,vel:.5}); else A.play('mallet',{when:now+i*s16,freq:f,ratio:1,bright:.9,cutoff:1800,dur:.6,vel:.56}); }); }
M.piece({ id:'L-30',
  caption:'The ring field from the top of the page, plotted one equal pen tap per dot in nearest-neighbor order, with a clock for how long it takes. Change Speed or Pen, or press Restart.',
  alt:'A paper plate with a white A5 sheet showing a ring field plotted in small equal dots, its center ring in red, a pen-head crosshair and faint travel lines while it plots, and a colophon with the mindgut wordmark. Beside it, computed counts of taps, pen-up travel and time, and the last lines of the plotter program.',
  recipe:{
    idea:'A figure made of thousands of equal marks, counted, and the time it takes to make them.',
    marks:['ring','blade','center','stray','dot'],
    ground:'paper, with a white A5 sheet',
    accent:'the center, plotted by a second pen in red',
    composition:'An A5 sheet with crop marks at left (top on phones); three large counts (taps, pen-up travel, time), the live HP-GL program and a tap counter at right.',
    motion:'Plays the tour at 8 taps a second × Speed, each dot appearing at its tap, on a grid of 16ths (84 to 144 BPM from Speed): the crosshair opens on each 16th’s note and turns red at the pen change; the last seven moves dotted; the colophon appears when it parks. Reduced motion shows the finished sheet.',
    sound:'Pen taps are 16ths and the heading of travel is the melody, glassy for the fine pen, woody for the broad. Each bar’s chord comes from how far out the pen works, a stepper whine glides under it, and the red center arrives as I.',
    controls:['Speed ×20–×400','Pen (fine 0.5 mm, broad 1.0 mm)','Restart'],
    computed:['dots: M.mirField (coherence 1, seed 3) mapped to A5, field radius 52 mm','tour: nearest neighbor from home (0, 0) on a 1.5 mm grid, pen 1 then pen 2','pen-up travel in mm, against the generated order and a seeded shuffle','time = taps ÷ 8 a second, travel not counted; HP-GL at 40 units per mm, origin bottom left'],
    placeholder:['the machine and its speed'],
    root:'the pen plotter',
    rules:['every tap the same size: tone comes only from count'],
    engine:['M.mirField','M.logo','M.Buf','M.rng','M.text','M.rule','M.fill']
  },
  aspect:w=>w/lay30(w).H,
  state:{speed:80,pen:'fine',run:0},
  controls:[
    {id:'speed',type:'range',label:'Speed',min:20,max:400,step:20,fmt:v=>'×'+v},
    {id:'pen',type:'select',label:'Pen',options:[{value:'fine',label:'fine · 0.5 mm'},{value:'broad',label:'broad · 1.0 mm'}]},
    {id:'restart',type:'button',label:'Restart',play:true,run:st=>{ st.run=(st.run|0)+1; }}],
  music:f6music30,
  /* Speed is the tempo and Pen the voice: either plays the motif's four 16ths in the pen's voice at the tempo */
  musicParam(A,st,id,ov,nv){ if(id!=='speed'&&id!=='pen') return false; const S=m3_S(st), n=performance.now(); if(n-(S.t||0)<140) return true; S.t=n; f6fig30(A,st,f6bpm30(st.speed)); return true; },
  render(g,w,h,M,st){ f6blit(g,f6base30(st,w,h)); f6draw30(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ f6blit(g,f6base30(st,w,h)); if(f6RM()){ f6draw30(g,w,h,st,null); return false; } return f6draw30(g,w,h,st,Math.max(0,t)); } });

})();
