/* agent E pieces · L-21…L-25 · delivery 3: digital/analog pairings.
   Each piece pairs an analog machine with the Mir behavior that does the same job, and computes one thing for real.
   Every figure is placed dots. Hairline M.rule only for structure (plate frames, brackets, insets). Flat fills only for grounds
   (the plate, a film base, a print's stock) and for true voids (a sprocket hole shows the sheet under it).
   Type: Geist 300 for voice, Geist Mono uppercase for labels. No serif. The wordmark only via M.logo, one flat color.
   Animated pieces cache a static base per (size, dpr, settings) and draw only what moves per frame.
   Helpers are prefixed e6_ so they never collide with other agents' files. */
(function(){
'use strict';
const M=window.MIR, TAU=Math.PI*2, E=M.ease, cl=M.clamp01, lerp=M.lerp;
const e6_q=v=>Math.round(v/4)*4;
const e6_RM=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(_){ return false; } };
const e6_rgbC=new Map();
function e6_rgb(c){ let v=e6_rgbC.get(c); if(v) return v; let s=String(c).replace('#',''); if(s.length===3) s=s.replace(/./g,'$&$&'); const n=parseInt(s,16); v=[(n>>16)&255,(n>>8)&255,n&255]; e6_rgbC.set(c,v); return v; }
const e6_hex=a=>'#'+a.map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join('');
const e6_mixC=new Map();
function e6_mix(a,b,t){ const k=a+b+t; let v=e6_mixC.get(k); if(v) return v; const A=e6_rgb(a), B=e6_rgb(b); v=e6_hex(A.map((x,i)=>x+(B[i]-x)*t)); e6_mixC.set(k,v); return v; }
/* multiply: what two transparent inks do where they overlap (each channel is the product of the two transmittances) */
function e6_mul(a,b){ const A=e6_rgb(a), B=e6_rgb(b); return e6_hex(A.map((x,i)=>x*B[i]/255)); }
const e6_WM=new WeakMap();
const e6_c=st=>{ let c=e6_WM.get(st); if(!c){ c={}; e6_WM.set(st,c); } return c; };
/* caches keyed by settings, held per piece (each piece exists once), so Reset, which swaps in a fresh state object, keeps them */
const e6_SL={}; function e6_slot(st,name,key,make){ const s=e6_SL[name+'|'+(st&&st.__id||'')]; if(s&&s.key===key) return s.v; const v=make(); e6_SL[name+'|'+(st&&st.__id||'')]={key,v}; return v; }
function e6_off(w,h){ const cv=document.createElement('canvas'); return {cv,g:M.canvas(cv,w,h)}; }
function e6_blit(g,cv){ g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(cv,0,0); g.restore(); }
const e6_dpr=()=>Math.min(3,window.devicePixelRatio||1);
const e6_DK=(w,h)=>w+'x'+h+'@'+e6_dpr();
const e6_memo=f=>{ const m=new Map(); return w=>{ const k=w+'@'+e6_dpr(); let v=m.get(k); if(!v){ if(m.size>8) m.clear(); v=f(w); m.set(k,v); } return v; }; };
const e6_cache=new Map(); const e6_once=(k,f)=>{ let v=e6_cache.get(k); if(v===undefined){ v=f(); e6_cache.set(k,v); } return v; };
let e6_MC=null; const e6_ctx=()=>{ if(!e6_MC){ e6_MC=document.createElement('canvas').getContext('2d'); e6_MC.dpr=1; } return e6_MC; };

/* type */
const e6_lab=(g,s,x,y,c,size=9.5,o={})=>M.text(g,s,x,y,Object.assign({font:'mono',size,weight:500,track:.14,upper:true,color:c},o));
const e6_trk=s=>s>=40?-.04:s>=28?-.03:s>=18?-.016:-.004;
const e6_disp=(g,s,x,y,size,c,o={})=>M.text(g,s,x,y,Object.assign({font:'display',size,weight:300,track:e6_trk(size),color:c},o));
const e6_tw=(s,o)=>{ const g=e6_ctx(), size=o.size||11; g.font=`${o.weight||400} ${size}px ${M.FONT[o.font||'display']}`; const str=o.upper?String(s).toUpperCase():String(s), tr=(o.track||0)*size;
  if('letterSpacing' in g){ g.letterSpacing=tr+'px'; const w=g.measureText(str).width-tr; g.letterSpacing='0px'; return w; } return g.measureText(str).width+tr*(str.length-1); };
const e6_MONO={font:'mono',weight:500,track:.14,upper:true};
const e6_lw=(s,size=9.5)=>e6_tw(s,Object.assign({size},e6_MONO));
function e6_wrapT(str,maxW,o){ const out=[]; let line=''; for(const wd of String(str).split(/\s+/)){ const t=line?line+' '+wd:wd; if(line&&e6_tw(t,o)>maxW){ out.push(line); line=wd; } else line=t; } if(line) out.push(line); return out; }
const e6_lines=(s,maxW,o)=>e6_wrapT(s,maxW,Object.assign({weight:300,track:e6_trk(o.size||11)},o));
function e6_para(g,s,x,y,maxW,o){ const oo=Object.assign({weight:300,track:e6_trk(o.size)},o), L=e6_lines(s,maxW,oo), lh=o.lh||Math.round(o.size*1.4); L.forEach((l,i)=>M.text(g,l,x,y+i*lh,oo)); return y+(L.length-1)*lh; }
const e6_FOOT={font:'mono',size:9,weight:400,track:.02};
function e6_foot(g,lines,x,y,c){ lines.forEach((l,i)=>M.text(g,l,x,y+i*14,Object.assign({color:c},e6_FOOT))); return y+(lines.length-1)*14; }
const e6_footL=(s,maxW)=>e6_wrapT(s,maxW,e6_FOOT);

/* the title block every plate shares: id line, display title, one plain sentence */
function e6_titleL(w,sub,subMax,phW){ const ph=w<(phW||640), pad=ph?16:(w<760?24:32), inner=w-2*pad, ts=ph?30:40, tb=ph?64:76, ss=ph?14:15, slh=ph?19:20;
  const sl=e6_lines(sub,Math.min(subMax||620,inner),{size:ss}); return {ph,pad,inner,ts,tb,ss,slh,sub:sl,top:e6_q(tb+(ph?30:34)+(sl.length-1)*slh+(ph?36:44))}; }
function e6_title(g,T,id,left,right,title,ink,soft){ const y=T.ph?24:28, lw=e6_lab(g,id+' · '+left,T.pad,y,ink,T.ph?9.5:10);
  if(right&&!T.ph&&T.pad+lw+32+e6_lw(right)<T.pad+T.inner) e6_lab(g,right,T.pad+T.inner,y,soft,9.5,{align:'right'});
  e6_disp(g,title,T.pad-1,T.tb,T.ts,ink); T.sub.forEach((l,i)=>M.text(g,l,T.pad,T.tb+(T.ph?30:34)+i*T.slh,{size:T.ss,weight:300,track:e6_trk(T.ss),color:soft})); }

/* dots */
/* jittered-lattice stipple: stratified, so it never clumps into salt; cheap enough for large tone areas (soot, card stock) */
function e6_lat(B,box,sp,dens,rOf,col,seed){ const [x0,y0,x1,y1]=box, R=M.rng(seed||1);
  for(let y=y0;y<y1;y+=sp) for(let x=x0;x<x1;x+=sp){ const px=x+(.12+.76*R())*sp, py=y+(.12+.76*R())*sp, u=R(), d=dens(px,py); if(d<=0||u>=d) continue; B.dot(px,py,rOf(d,R),typeof col==='function'?col(px,py,d):col); } }
/* a stippled line: n dots per px, gaussian spread across it */
function e6_seg(B,ax,ay,bx,by,col,o={}){ const L=Math.hypot(bx-ax,by-ay), n=Math.max(2,Math.round(L*(o.dpl||1.1))), R=M.rng(o.seed||3), sp=o.spread??.3, nx=-(by-ay)/(L||1), ny=(bx-ax)/(L||1);
  for(let i=0;i<n;i++){ const t=(i+R())/n, k=R.gauss()*sp; B.dot(ax+(bx-ax)*t+nx*k, ay+(by-ay)*t+ny*k, (o.r||.7)*(.88+R()*.26), col); } }
/* a dot buffer for per-frame work: dots flagged sq (only the dimmest, smallest tone dots) are placed as device-aligned
   2-device-px squares, which is what a disc that small rasterizes to anyway; every other dot stays a disc. */
function e6_FB(g){ this.g=g; this.by=new Map(); this.mr=M.minR(g); }
e6_FB.prototype.dot=function(x,y,r,c,sq){ const k=sq?c+'|s':c; let a=this.by.get(k); if(!a){ a=[]; this.by.set(k,a); } a.push(x,y,r<this.mr?this.mr:r); };
e6_FB.prototype.flush=function(){ const g=this.g, d=g.dpr||1; for(const [k,a] of this.by){ const sq=k.endsWith('|s'); g.fillStyle=sq?k.slice(0,-2):k; g.beginPath();
  for(let i=0;i<a.length;i+=3){ const r=a[i+2]; if(sq){ const s=Math.max(1,Math.round(r*2*d))/d, x=Math.round(a[i]*d)/d-s/2, y=Math.round(a[i+1]*d)/d-s/2; g.rect(x,y,s,s); } else { g.moveTo(a[i]+r,a[i+1]); g.arc(a[i],a[i+1],r,0,TAU); } }
  g.fill(); } this.by.clear(); };
/* a small stippled triangle (a caret that points along angle a) */
function e6_caret(B,x,y,s,a,col,seed){ const R=M.rng(seed||9), c=Math.cos(a), si=Math.sin(a);
  for(let i=0;i<Math.round(s*s*.9);i++){ const u=R(), v=(R()-.5)*(1-u); const lx=(u-.5)*s, ly=v*s*1.1; B.dot(x+lx*c-ly*si, y+lx*si+ly*c, .62, col); } }
/* a stippled crosshair (registration mark) */
function e6_cross(B,x,y,r,col,seed,dpl){ M.ring(B,{cx:x,cy:y,R:r,w:.9,swell:.1,dpl:dpl||1.4,rCore:.72,rEdge:.6,seed,color:col}); e6_seg(B,x-r*1.7,y,x+r*1.7,y,col,{seed:seed+1,dpl:dpl||1.4,spread:.22,r:.68}); e6_seg(B,x,y-r*1.7,x,y+r*1.7,col,{seed:seed+2,dpl:dpl||1.4,spread:.22,r:.68}); }
function e6_box(g,x0,y0,x1,y1,c){ M.rule(g,x0,y0,x1,y0,c); M.rule(g,x1,y0,x1,y1,c); M.rule(g,x1,y1,x0,y1,c); M.rule(g,x0,y1,x0,y0,c); }
function e6_rrPath(g,x,y,w,h,r){ r=Math.min(r,w/2,h/2); g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
const e6_word=k=>k<.34?'loose':k<.8?'settling':'in tune';
function e6_syl(word){ const w=word.toLowerCase().replace(/[^a-z]/g,''); if(!w) return 0; let n=(w.match(/[aeiouy]+/g)||[]).length; if(n>1&&/e$/.test(w)&&!/[^aeiou]le$/.test(w)) n--; return Math.max(1,n); }

/* ── music (M3). Each piece composes a score from its own data (music(st)); the frame plays it on the piece's bus and drives
   animate's t from the heard clock, so marks answer notes through M.music.env. Controls answer at once through musicParam.
   Pointer sounds are tuned to the piece's chord and scale. Helpers are prefixed m3_. ── */
const m3_WM=new WeakMap();
const m3_S=st=>{ let s=m3_WM.get(st); if(!s){ s={}; m3_WM.set(st,s); } return s; };
const m3_env=(st,k,t,tau)=>M.music&&t!=null?M.music.env(st,k,t,tau):0;
const m3_try=f=>{ try{ return f(); }catch(e){ console.error('music',e); } };
/* immediate sound on a piece's own bus, for pointer gestures (silent unless sound is on) */
const m3_A=id=>{ const a=M.audio; return a&&a.enabled&&a.unlocked?{play:(n,o)=>a.play(id,n,o),now:()=>a.now()}:null; };
/* transpose a chord symbol by semitones (roots spelled with sharps, except Bb and Eb) */
const m3_PC=['C','C#','D','Eb','E','F','F#','G','G#','A','Bb','B'];
const m3_tr=(sym,k)=>{ if(!k) return sym; const m=/^([A-G][#b]?)(.*)$/.exec(sym), pc=M.music.pcOf(m[1]); return m3_PC[(pc+k+120)%12]+m[2]; };
const m3_root=(sym,oct)=>M.music.parse(sym).root+oct;
const m3_cents=c=>Math.pow(2,c/1200);


/* ════════════════════════════════════════════════════════════════════════
   L-21 · The loom card · a six-turn session encoded as a Jacquard-style card; the cloth it weaves.
   Encoding (16 hooks, one row per turn; a hole is a 1):
     1–2 speaker (01 you · 10 Mir) · 3–5 length bucket = ⌊words ÷ 3⌋, capped at 7 (computed from the invented line)
     6–8 agreement bucket = round(a × 7), a seeded placeholder · 9–10 crossings (seeded) · 11–12 strays (seeded)
     13–15 k bucket = round(k × 7), k = 1 − e^(−Σa ÷ 2.2) over the turns so far (computed) · 16 even parity (computed).
   Drawdown (computed): warp j is threaded to hook h(j) in a point repeat, h = p < 16 ? p : 30 − p with p = j mod 30.
   Pick i reads card row (i mod 6). Where row bit h(j) is 1 the needle passes the hole, the hook lifts warp j, and the warp
   shows over the weft (ink); otherwise the weft shows (tint). Schematic: no real card works this way.
   ════════════════════════════════════════════════════════════════════════ */
const S21=[
  {name:'the call', seed:2101, turns:[['you','I keep putting off the call to my brother.'],['mir','What makes the first minute hard?'],['you','He will ask about the move, and I don’t have an answer yet.'],['mir','Then the first minute could be saying exactly that.'],['you','That I don’t know yet. I can say that.'],['mir','Want to write the first line together?']]},
  {name:'sleep', seed:2203, turns:[['you','Third night in a row I was up at four.'],['mir','Is it the same thought each time, or different ones?'],['you','Same one. The money, mostly.'],['mir','What does the four o’clock version of it say?'],['you','That it is all going wrong at once, which isn’t true in daylight.'],['mir','So daylight has a different answer. What is it?']]},
  {name:'the move', seed:2307, turns:[['you','I signed the lease.'],['mir','How does it feel to say that out loud?'],['you','Bigger than I expected, and quieter.'],['mir','Quieter how?'],['you','Like the decision stopped arguing with me once I made it.'],['mir','That sounds like it settled. Want to keep this one?']]}];
const GR21=[['SPK',0,2,'speaker','01 you · 10 Mir'],['LEN',2,3,'length','⌊words ÷ 3⌋'],['AGR',5,3,'agreement','round(a × 7)'],['×',8,2,'crossings','0–3'],['STR',10,2,'strays','0–3'],['K',12,3,'settled','round(k × 7)'],['P',15,1,'parity','even']];
const SUB21='A session encoded as a loom card, one turn a row, and the cloth it weaves.';
/* time is the music's: one pick per 8th note at 103 BPM in 6/8, so one card (six rows) is one bar and the woven strip is two */
const PICKS21=12, BPM21=103, T21=60000/BPM21/2, ARR21=PICKS21*T21, END21=ARR21+1900;
const e6_bits=(v,n)=>{ const o=[]; for(let i=n-1;i>=0;i--) o.push((v>>i)&1); return o; };
function e6_enc21(i){ return e6_once('enc21|'+i,()=>{ const S=S21[i], R=M.rng(S.seed); let sum=0;
  return S.turns.map(([who,line])=>{ const words=line.split(/\s+/).length, len=Math.min(7,Math.floor(words/3)), a=.28+.68*R(), agr=Math.round(a*7), x=(R()*4)|0, s=(R()*4)|0; sum+=a; const k=1-Math.exp(-sum/2.2), kb=Math.round(k*7);
    const bits=[...(who==='you'?[0,1]:[1,0]),...e6_bits(len,3),...e6_bits(agr,3),...e6_bits(x,2),...e6_bits(s,2),...e6_bits(kb,3)]; bits.push(bits.reduce((p,b)=>p^b,0));
    return {who,line,words,len,a,agr,x,s,k,kb,bits}; }); }); }
const e6_hook=j=>{ const p=j%30; return p<16?p:30-p; };
const lay21=e6_memo(function(w){ const T=e6_titleL(w,SUB21,600), {ph,pad,inner}=T, o=Object.assign({},T);
  const nw=ph?18:28, cw=(ph?inner:Math.min(660,Math.round(inner*.58)))-nw, endW=Math.max(20,Math.round(cw*.075)), cp=(cw-2*endW)/16, rp=Math.round(cp*10)/10, mY=Math.round(rp*.62), ch=Math.round(6*rp+2*mY), gap=Math.max(3,Math.round(rp*.18));
  const cy=T.top+(ph?30:34); o.nw=nw; o.card={x:pad+nw,y:cy,w:cw,h:ch,endW,cp,rp,mY,gap,hr:cp*.27,win:ch+gap+Math.round(rp*.7)};
  o.rowY=r=>cy+mY+(r+.5)*rp;
  let y=cy+o.card.win;
  if(ph){ o.rx=pad; o.rw=inner; o.dy=y+36; o.drow=34; o.my=o.dy+6*o.drow+20; }
  else { o.rx=pad+nw+cw+48; o.rw=pad+inner-o.rx; o.dy=null; o.my=o.rowY(5)+40; }
  o.mapH=20+GR21.length*15; y=Math.max(y,o.my+o.mapH);
  /* the cloth as a draft: few, large cells, each float legible; threading numbers over the warps */
  o.warps=ph?16:32; o.cell=Math.min(22,Math.floor((inner-nw)/o.warps)); o.cx=pad+nw; o.clY=e6_q(y+66); o.clH=PICKS21*o.cell;
  const cW=o.warps*o.cell; if(ph){ o.lgX=pad; o.lgY=o.clY+o.clH+30; o.lgW=inner; y=o.lgY+2*(Math.min(o.cell,20)+10)+28+40; } else { o.lgX=o.cx+cW+40; o.lgY=o.clY+6; o.lgW=pad+inner-o.lgX; y=o.clY+Math.max(o.clH,4*24+8)+48; }
  /* the session, as said: three columns wide, one on a phone */
  const cols=ph?1:3, gx=24, colW=(inner-(cols-1)*gx)/cols; o.ses={y,cols,colW,gx};
  const hRow=[]; for(let t=0;t<6;t++){ let mx=1; S21.forEach(S=>{ mx=Math.max(mx,e6_lines(S.turns[t][1],colW,{size:14}).length); }); hRow.push(22+mx*19+18); }
  let sy=y+24; o.ses.cells=[]; for(let r=0;r<6/cols;r++){ let rh=0; for(let c=0;c<cols;c++){ const t=r*cols+c; o.ses.cells.push([pad+c*(colW+gx),sy]); rh=Math.max(rh,hRow[t]); } sy+=rh; }
  o.foot=e6_footL(FOOT21,inner); o.footY=e6_q(sy+16); o.H=e6_q(o.footY+(o.foot.length-1)*14+pad); return o; });
const FOOT21='Root · Jacquard, 1804: a hole lets a hook lift a warp thread. Simplified: 16 hooks, one turn a row.';
const P21=M.PAL.paper, C21={ink:P21.ink, soft:P21.soft, stock:e6_mix(P21.ground,P21.ink,.075), edge:e6_mix(P21.ground,P21.ink,.42), rim:e6_mix(P21.ground,P21.ink,.62), weft:e6_mix(P21.ground,P21.ink,.34), hair:e6_mix(P21.ground,P21.ink,.18), acc:P21.center};
/* the card as an object: pale stock as one flat tint (the card is a ground for the holes), a crisp stippled cut edge,
   holes as true voids (the plate shows through) each with a clean stippled rim; peg and lacing holes at the ends */
function e6_card21(L,si){ const C=L.card, {cv,g}=e6_off(C.w+2,C.h+2), B=new M.Buf(g), rows=e6_enc21(si), holes=[];
  rows.forEach((r,ri)=>r.bits.forEach((b,ci)=>{ if(b) holes.push([1+C.endW+(ci+.5)*C.cp,1+C.mY+(ri+.5)*C.rp,C.hr]); }));
  const ex=[1+C.endW*.5,1+C.w-C.endW*.5]; ex.forEach(x=>{ holes.push([x,1+C.h/2,C.hr*1.25]); holes.push([x,1+C.mY*.55,C.hr*.55]); holes.push([x,1+C.h-C.mY*.55,C.hr*.55]); });
  const rr=Math.max(2,C.rp*.16); e6_rrPath(g,1,1,C.w,C.h,rr); g.fillStyle=C21.stock; g.fill();
  g.fillStyle=P21.ground; holes.forEach(([x,y,r])=>{ g.beginPath(); g.arc(x,y,r,0,TAU); g.fill(); });
  /* cut edges: dots placed evenly along each edge, just inside it */
  const R=M.rng(2190), per=2*(C.w+C.h)-8*rr+TAU*rr, n=Math.round(per*1.25);
  for(let i=0;i<n;i++){ const t=(i+R()*.6)/n*per; let x,y; const W=C.w-2*rr, H=C.h-2*rr, q=TAU*rr/4;
    let u=t; const seg=[W,q,H,q,W,q,H,q]; let k=0; while(k<7&&u>seg[k]){ u-=seg[k]; k++; }
    const ins=.5+R()*.35;
    if(k===0){ x=1+rr+u; y=1+ins; } else if(k===2){ x=1+C.w-ins; y=1+rr+u; } else if(k===4){ x=1+C.w-rr-u; y=1+C.h-ins; } else if(k===6){ x=1+ins; y=1+C.h-rr-u; }
    else { const cxs=[0,1+C.w-rr,0,1+C.w-rr,0,1+rr,0,1+rr], cys=[0,1+rr,0,1+C.h-rr,0,1+C.h-rr,0,1+rr], a0=[0,-Math.PI/2,0,0,0,Math.PI/2,0,Math.PI][k], a=a0+u/rr; x=cxs[k]+Math.cos(a)*(rr-ins); y=cys[k]+Math.sin(a)*(rr-ins); }
    B.dot(x,y,.6,C21.edge); }
  holes.forEach(([x,y,r],i)=>{ const m=Math.max(10,Math.round(TAU*r*1.7)), Rh=M.rng(2200+i); for(let j=0;j<m;j++){ const a=(j+Rh()*.5)/m*TAU, d=r+.55+Rh()*.3; B.dot(x+Math.cos(a)*d,y+Math.sin(a)*d,.58,C21.rim); } });
  B.flush(); return cv; }
/* one drawdown cell. Lifted warp: a dense ink bar running down, squared where the warp keeps floating into the next pick.
   Weft: a light tint bar running across, joined to the next cell where the weft keeps floating. */
function e6_cell21(B,R,x,y,c,up,c0,c1,ph){ const sp=up?(ph?1.02:1.12):(ph?1.1:1.22);
  let x0,x1,y0,y1; if(up){ x0=x+c*.21; x1=x+c*.79; y0=y+(c0?0:c*.08); y1=y+c-(c1?0:c*.08); } else { x0=x+(c0?0:c*.06); x1=x+c-(c1?0:c*.06); y0=y+c*.33; y1=y+c*.67; }
  for(let yy=y0;yy<y1-sp*.2;yy+=sp) for(let xx=x0;xx<x1-sp*.2;xx+=sp){ const px=xx+(.2+.6*R())*sp, py=yy+(.2+.6*R())*sp; if(px>x1||py>y1) continue; if(R()>(up?.97:.84)) continue; B.dot(px,py,up?.62+.08*R():.56+.06*R(),up?C21.ink:C21.weft); } }
function e6_cloth21(L,si){ const rows=e6_enc21(si), c=L.cell, W=L.warps*c, H=PICKS21*c, {cv,g}=e6_off(W+2,H+2), B=new M.Buf(g), R=M.rng(2140+si);
  const up=(i,j)=>i>=0&&i<PICKS21&&j>=0&&j<L.warps&&rows[i%6].bits[e6_hook(j)]===1;
  for(let i=0;i<PICKS21;i++) for(let j=0;j<L.warps;j++){ const u=up(i,j); if(u) e6_cell21(B,R,1+j*c,1+i*c,c,true,up(i-1,j),up(i+1,j),L.ph); else e6_cell21(B,R,1+j*c,1+i*c,c,false,j>0&&!up(i,j-1),j<L.warps-1&&!up(i,j+1),L.ph); }
  B.flush(); return cv; }
function e6_base21(st,w,h){ return e6_slot(st,'base21',e6_DK(w,h)+'|'+st.session+'|'+st.enc,()=>{ const L=lay21(w), {cv,g}=e6_off(w,h), rows=e6_enc21(st.session), C=L.card, ink=C21.ink, soft=C21.soft;
  M.fill(g,P21.ground); e6_title(g,L,'L-21','Pairing · loom card',null,'The loom card',ink,soft);
  /* row numbers, at rest */
  for(let r=0;r<6;r++) e6_lab(g,String(r+1),C.x-(L.ph?12:20),L.rowY(r)+3.5,soft,9,{align:'center'});
  /* encoding: brackets over the hook groups */
  if(st.enc){ const by=C.y-12; GR21.forEach(([k,a,n])=>{ const x0=C.x+C.endW+a*C.cp+2, x1=C.x+C.endW+(a+n)*C.cp-2; M.rule(g,x0,by,x1,by,C21.hair); M.rule(g,x0,by,x0,by+4,C21.hair); M.rule(g,x1,by,x1,by+4,C21.hair); e6_lab(g,k,(x0+x1)/2,by-7,soft,9,{align:'center',track:.06}); }); }
  else e6_lab(g,'16 hooks · 6 turns',C.x+C.endW,C.y-14,soft,9);
  /* the decode, one line per row, aligned to the card at rest */
  const rx=L.rx;
  if(!L.ph) e6_lab(g,st.enc?'bits · decoded':'turn · who · words',rx,C.y-14,soft,9);
  rows.forEach((r,ri)=>{ const who=r.who==='you'?'You':'Mir';
    if(L.ph){ const y=L.dy+ri*L.drow; e6_lab(g,String(ri+1).padStart(2,'0')+' '+who,rx,y,ink,9); if(st.enc){ e6_lab(g,e6_grp(r.bits),rx+62,y,ink,9,{track:.08}); e6_lab(g,e6_dec(r),rx+62,y+14,soft,9,{track:.08}); } else e6_lab(g,r.words+' words · '+e6_word(r.k),rx+62,y,soft,9); }
    else { const y=L.rowY(ri)+3.5; e6_lab(g,who,rx,y,ink,9); if(st.enc){ e6_lab(g,e6_grp(r.bits),rx+38,y,ink,9.5,{track:.08}); const dx=rx+38+e6_lw(e6_grp(r.bits))+14; if(dx+e6_lw(e6_dec(r),9)<=L.pad+L.inner) e6_lab(g,e6_dec(r),dx,y,soft,9,{track:.08}); } else e6_lab(g,r.words+' words · settled '+r.k.toFixed(2)+' · '+e6_word(r.k),rx+38,y,soft,9); } });
  if(L.ph&&!st.enc) e6_lab(g,'turn · who · words',rx,L.dy-18,soft,9); if(L.ph&&st.enc) e6_lab(g,'bits · decoded',rx,L.dy-18,soft,9);
  /* the encoding map */
  { let y=L.my; e6_lab(g,st.enc?'Encoding · a hole is a 1':'A hole lets the needle through',rx,y,ink,9.5); y+=20;
    if(st.enc) GR21.forEach(([k,a,n,name,note])=>{ e6_lab(g,String(a+1).padStart(2,'0')+(n>1?'–'+String(a+n).padStart(2,'0'):'   '),rx,y,ink,9,{track:.06}); e6_lab(g,name+' · '+note,rx+(L.ph?62:74),y,soft,9,{track:.06}); y+=15; });
    else { e6_para(g,'Where the needle passes a hole, its hook lifts one warp thread and the warp shows over the weft. Card stock stops the needle and the warp stays down.',rx,y,L.rw,{size:13,lh:18,color:soft}); } }
  /* the cloth: labels */
  const cx=L.cx, cW=L.warps*L.cell, c=L.cell; e6_lab(g,'The cloth · '+PICKS21+' picks · '+L.warps+' warps',L.ph?L.pad:cx,L.clY-34,ink,9.5);
  /* threading: the hook each warp hangs from, over its column */
  for(let j=0;j<L.warps;j++) e6_lab(g,String(e6_hook(j)+1),cx+(j+.5)*c,L.clY-9,(j%30===0||j%30===15)?ink:soft,9,{align:'center',track:0});
  if(!L.ph){ e6_lab(g,'1',cx-20,L.clY+c*.5+3.5,soft,9,{align:'center'}); e6_lab(g,'7',cx-20,L.clY+c*6.5+3.5,soft,9,{align:'center'}); }
  /* the draft's key */
  { const B=new M.Buf(g), R=M.rng(2150), s=Math.min(c,20), X=L.lgX, rowsK=[[true,'Lifted warp · the needle passed a hole'],[false,'Weft shows · card stock stopped the needle']];
    let y=L.lgY; rowsK.forEach(([u,t])=>{ e6_cell21(B,R,X,y,s,u,true,true,L.ph); e6_lab(g,t,X+s+12,y+s/2+3.5,ink,9); y+=s+10; });
    B.flush(); e6_lab(g,'Threading · hook over each warp, 1→16→2',X,y+10,soft,9); e6_lab(g,'Pick i reads card row ((i − 1) mod 6) + 1',X,y+28,soft,9); }
  /* the session as said */
  e6_lab(g,'The session · '+S21[st.session].name,L.pad,L.ses.y,ink,9.5);
  rows.forEach((r,t)=>{ const [x,y]=L.ses.cells[t]; e6_lab(g,String(t+1).padStart(2,'0')+' · '+(r.who==='you'?'You':'Mir')+' · '+r.words+' words → len '+r.len,x,y+16,r.who==='you'?ink:soft,9); e6_para(g,r.line,x,y+38,L.ses.colW,{size:14,lh:19,color:ink}); });
  e6_foot(g,L.foot,L.pad,L.footY,soft);
  return cv; }); }
const e6_grp=b=>[b.slice(0,2),b.slice(2,5),b.slice(5,8),b.slice(8,10),b.slice(10,12),b.slice(12,15),b.slice(15)].map(x=>x.join('')).join(' ');
const e6_dec=r=>'len '+r.len+' agr '+r.agr+' × '+r.x+' str '+r.s+' k '+r.k.toFixed(2).slice(1);
/* chain position for pick i: rows advance one pitch; after row 6 the next laced card comes up. Pick i is read on 8th note i:
   the chain moves in the 40% of an 8th before it and stops on the note, so the needles pass the holes as the chord sounds */
function e6_frame21(g,st,w,h,t){ const L=lay21(w), C=L.card, si=st.session, rows=e6_enc21(si), K=e6_slot(st,'k21',e6_DK(w,h)+'|'+si,()=>({card:e6_card21(L,si),cloth:e6_cloth21(L,si)}));
  const per=C.h+C.gap, pos=i=>Math.floor(i/6)*per+(i%6)*C.rp;
  let off=0, woven=PICKS21, settled=true, pick=-1;
  if(t!=null){ const ts=t+.42*T21, i=Math.min(PICKS21-1,Math.floor(ts/T21)), u=cl((ts-i*T21)/T21); const a=i>0?pos(i-1):pos(0), b=pos(i), m=E.inOutCubic(cl(u/.4)); off=lerp(a,b,m); settled=u>=.42; woven=t>=ARR21?PICKS21:i+(settled?1:0); pick=i; }
  off=((off%per)+per)%per;
  const d=e6_dpr(), wy=C.y, x0=C.x-1, x1=C.x+C.w+1;
  g.save(); g.beginPath(); g.rect(x0-2,wy-1,x1-x0+4,C.win+1); g.clip(); g.setTransform(1,0,0,1,0,0);
  for(let k=-1;k<=1;k++){ const y=wy-off+k*per; if(y>wy+C.win||y+C.h<wy) continue; g.drawImage(K.card,Math.round((C.x-1)*d),Math.round((y-1)*d)); }
  g.restore();
  const B=new M.Buf(g), q10=v=>Math.round(Math.min(1,v)*10)/10;
  /* lacing cord across each visible seam: cards are laced into a chain through the small end holes */
  for(let k=-1;k<=1;k++){ const ys=wy-off+k*per+C.h+C.gap/2; if(ys<wy+2||ys>wy+C.win-2) continue; [C.x+C.endW*.5,C.x+C.w-C.endW*.5].forEach((x,q)=>e6_seg(B,x,Math.max(wy+1,ys-C.mY*.5),x,Math.min(wy+C.win-1,ys+C.mY*.5),C21.rim,{seed:2170+q+k*3,dpl:2,spread:.35,r:.6})); }
  /* the read head: needles through the holes of the row under it (only when the card has stopped). They flash as the row's
     chord sounds; the parity needle flashes with its bell */
  const hy=L.rowY(0), en=pick>=0?m3_env(st,'n'+pick,t,170):0, ep=pick>=0?m3_env(st,'p'+pick,t,260):0;
  if(settled){ const rr=Math.round(off/C.rp); if(rr>=0&&rr<6&&Math.abs(off-rr*C.rp)<1){ const row=rows[rr];
    row.bits.forEach((b,ci)=>{ if(!b) return; const x=C.x+C.endW+(ci+.5)*C.cp, R=M.rng(2180+ci), e=ci===15?Math.max(en,ep):en, col=e>.05?e6_mix(C21.ink,C21.acc,q10(e)):C21.ink, n=e>.05?11:7;
      for(let q=0;q<n;q++){ const a=R()*TAU, r=Math.sqrt(R())*C.hr*(.22+.5*e); B.dot(x+Math.cos(a)*r,hy+Math.sin(a)*r,.6*(1+.5*e),col); } }); } }
  const ea=m3_env(st,'arr',t,420), cs=(L.ph?6:7)*(1+.3*en+.5*ea); e6_caret(B,C.x-cs*.2-3,hy,cs,0,C21.acc,2191); e6_caret(B,C.x+C.w+cs*.2+3,hy,cs,Math.PI,C21.acc,2192);
  /* the cloth so far, and the fell (the newest pick), whose caret answers the needles */
  if(woven>0){ g.save(); g.beginPath(); g.rect(L.cx-1,L.clY-1,L.warps*L.cell+2,woven*L.cell+1); g.clip(); g.setTransform(1,0,0,1,0,0); g.drawImage(K.cloth,Math.round((L.cx-1)*d),Math.round((L.clY-1)*d)); g.restore();
    const ef=Math.max(m3_env(st,'n'+(woven-1),t,220),ea), fy=L.clY+(woven-.5)*L.cell, fc=(L.ph?6:7)*(1+.6*ef); e6_caret(B,L.cx-fc*.2-3,fy,fc,0,C21.acc,2193); if(ea>.05) e6_caret(B,L.cx+L.warps*L.cell+fc*.2+3,fy,fc,Math.PI,C21.acc,2194); }
  B.flush();
  /* the row being read, named */
  if(t!=null&&t<ARR21){ e6_lab(g,'pick '+String(pick+1).padStart(2,'0')+' · row '+(pick%6+1),C.x+C.w,C.y+C.win+16,C21.ink,9,{align:'right'}); }
  else e6_lab(g,'read head · row 1',C.x+C.w,C.y+C.win+16,C21.soft,9,{align:'right'}); }
/* music: the card is a step sequencer, as Jacquard cards were the ancestors of music rolls. 6/8 at 103 BPM, one pick an 8th,
   one card a bar, two bars and an arrival. Each row's chord is its own settled bucket (bits 13–15: 2–3 Em, 4 G, 5 A, 6–7 D), so
   the card walks ii → IV → V as the session settles and the arrival is I. The needles pass all of a row's holes at once, so the
   holes sound together: hook h is chord tone ⌊(h − 2) ÷ 2⌋ above A3, plucked; the top hole is the line, doubled on the pulse
   lead. The parity hole rings a high bell. Show encoding adds the encoding as bass: the speaker bits, You on the root and Mir
   on the fifth, rocking in 8ths. The stacked bass and the tonic arrive once, on the downbeat after the last pick. */
const CH21=['Bm','Bm','Em','Em','G','A','D','D'];
function e6_music21(st){ const mu=M.music, S=mu.score({bpm:BPM21,meter:[6,8]}), rows=e6_enc21(st.session), L=i=>i*T21;
  const chords=[]; for(let i=0;i<PICKS21;i++) chords.push(CH21[rows[i%6].kb]);
  S.harm(chords.map((c,i)=>[L(i),c]).concat([[ARR21,'D']]));
  let prev=null;
  for(let i=0;i<PICKS21;i++){ const r=rows[i%6], sym=chords[i], t=L(i), beat=i%3===0, bar=i%6===0, u=i/(PICKS21-1);
    const idx=[]; r.bits.forEach((b,h)=>{ if(b&&h>=2&&h<15&&!idx.includes((h-2)>>1)) idx.push((h-2)>>1); });
    let tones=[...new Set(idx.map(k=>mu.ct(sym,'A3',k)))].sort((a,b)=>a-b); if(tones.length>5) tones=tones.slice(-5);
    /* the needles: the row as one plucked chord, a little brighter as the session settles */
    const same=i<PICKS21-1&&chords[i+1]===sym; S.chord(t,'pluck',tones,T21*(same?1.4:.92),{cutoff:900+500*u,env:1.3,vel:(beat?.7:.62)+(st.enc?0:.06),pan:(i%2?.18:-.18)},['n'+i,1]);
    /* the line: the top hole on the pulse lead, gliding a hair from the last one; on a parity row the bell takes the top */
    const top=tones[tones.length-1]; if(!r.bits[15]) S.note(t,'pulse',top+12,T21*(beat?.9:.62)*(same?1:.95),{pw:.32,cutoff:1500+900*u,env:1.2,q:2.2,vel:.48+.08*(beat?1:0),pan:.12,from:prev!=null&&Math.abs(prev-top)<=7?prev+12:undefined,glide:prev!=null?40:undefined});
    prev=top;
    if(r.bits[15]) S.note(t,'bell',top+12,same?700:T21*.95,{ratio:3.5,bright:.7,vel:.24,pan:.35},['p'+i,1]);
    /* the encoding as bass: You on the root, Mir on the fifth */
    if(st.enc) S.note(t,'pluck',mu.ct(sym,m3_root(sym,2),r.who==='you'?0:2),T21*.9,{cutoff:420,env:1.1,vel:r.who==='you'?.66:.54});
    /* the loom's rhythm: the batten on the dotted-quarter beats, the shuttle on the off 8ths, a new laced card on the bar */
    if(beat) S.hitSound(t,'rim',{vel:bar?.46:.36,tune:bar?.9:1});
    else if(!r.bits[15]&&!st.enc) S.hitSound(t,'hat',{vel:.16+.06*(i%3===2?1:0),decay:.024});
    if(i===0) S.hitSound(t,'kick',{vel:.44});
    if(i===6){ S.hitSound(t,'tap',{vel:.4}); }
    /* without the bass, a soft pad holds each chord of the card */
    if(!st.enc&&(i===0||chords[i-1]!==sym)){ let n=1; while(i+n<PICKS21&&chords[i+n]===sym) n++; S.chord(t,'pad',mu.voice(sym,'A3','A4',3),n*T21,{attack:.06,release:.3,cutoff:800,vel:.4}); } }
  /* arrival: the cloth is woven, the card is home. The third rings, the stacked bass drops once, the chord is pure */
  S.chord(ARR21,'pad',mu.voice('D','D4','D5',4),1500,{attack:.03,release:1.1,cutoff:1500,vel:.56},['arr',1]);
  S.note(ARR21,'bass','D2',620,{from:'A1',glide:90,env:3,decay:.4,vel:.62});
  S.note(ARR21,'bell','F#5',2200,{ratio:3.5,vel:.42,pan:.2});
  S.end(END21); return S.out(); }
M.piece({ id:'L-21',
  caption:'A session written as a loom card, one turn per row, and below it the cloth the card weaves. Switch Session, or toggle Show encoding to read each row’s holes as bits.',
  alt:'A pale stippled punched card with six rows of round holes, numbered 1 to 6, laced to the next card below it, with red carets marking the read head. To the right, each row decoded as bits. Below, a woven strip of small stippled cells, ink where the warp is lifted and a pale tint where the weft shows, in a mirrored repeat.',
  recipe:{
    idea:'A session is a sequence of counted marks, and the cloth exists only because the holes agree row after row; the card is the program.',
    marks:['dot'],
    ground:'paper',
    accent:'red carets at the read head and the newest pick',
    composition:'Title block; the card (six rows, 16 hooks, laced to the next card) at left with a decode beside it and the encoding map; the woven draft with threading numbers and a key; the six lines of the session below.',
    motion:'On a 6/8 grid at 103 BPM, Play weaves 12 picks, one per 8th note: the chain advances one row in the 40% of an 8th before it (inOutCubic) and stops on the note, the needles flash through the holes and one pick of cloth appears; the arrival lands on the next downbeat. Reduced motion shows the finished cloth.',
    sound:'The card is a step sequencer: each row’s holes sound together as a plucked chord, the top hole is the lead, and the chords walk ii, IV, V as the session settles, then home to I. Show encoding adds the speaker bits as bass.',
    controls:['Session (three)','Show encoding'],
    computed:['bits per row: speaker (2), length ⌊words ÷ 3⌋ capped at 7 (3), agreement round(a × 7) (3), crossings (2), strays (2), settled round(k × 7) with k = 1 − e^(−Σa ÷ 2.2) (3), even parity (1)','drawdown: warp j hangs from hook h = p < 16 ? p : 30 − p, p = j mod 30; pick i reads row i mod 6; a hole lifts the warp (ink), else the weft shows (tint)'],
    placeholder:['the lines','agreement, crossings and strays (seeded)'],
    root:'Jacquard, 1804',
    rules:['schematic: a real card carries hundreds of holes per pick','holes are true voids; the card stock is one flat tint'],
    engine:['M.Buf','M.rng','M.ease.inOutCubic','M.text','M.rule','M.fill']
  },
  aspect:w=>w/lay21(w).H,
  state:{session:0,enc:true},
  controls:[{id:'session',type:'select',label:'Session',play:true,options:S21.map((S,i)=>({value:i,label:(i+1)+' · '+S.name}))},{id:'enc',type:'toggle',label:'Show encoding',play:true}],
  music:e6_music21,
  render(g,w,h,M,st){ e6_blit(g,e6_base21(st,w,h)); e6_frame21(g,st,w,h,null); },
  animate(g,w,h,M,st,t){ t=Math.max(0,t); e6_blit(g,e6_base21(st,w,h)); e6_frame21(g,st,w,h,t); return t<ARR21+1300; } });


/* ════════════════════════════════════════════════════════════════════════
   L-22 · Cut in lacquer · Mir's speech rhythm cut as a spiral groove, seen from above.
   Rhythm (computed): syllables counted from the invented words (vowel groups), seeded durations, an attack 40 ms /
   decay 160 ms envelope. Groove (computed): r(θ) = Rs − pitch·θ/2π + A·env(t)·sin(2π·60 Hz·t), t = θ/2π · 60/rpm.
   At 45 rpm the same speech takes more turns and a longer wavelength per wiggle, as on a real disc.
   The lit edge: a groove wall catches the light where its tangent is square to the light (the radial sheen of a record),
   brightness ∝ |cos(angle − light)|⁸. Pitch exaggerated about 30× and modulation drawn at 60 Hz, for viewing.
   ════════════════════════════════════════════════════════════════════════ */
const SIDE22='What would make the first minute of it easier? You don’t have to have the whole call planned. Start with the part you already know. Say that you have been putting it off, and that you want to talk anyway. If he asks about the move, you can tell him it isn’t decided yet. That is an answer too. Then let him talk for a while. You can stop whenever you want, and I will be here after.';
const SUB22='Mir’s speech rhythm cut as a spiral groove that ends in a locked ring.';
const P22=M.PAL.night, C22={ink:P22.ring, soft:e6_mix(P22.ground,P22.ring,.6), dim:e6_mix(P22.ground,P22.ring,.4), hi:P22.ring, mid:e6_mix(P22.ground,P22.ring,.58), lo:e6_mix(P22.ground,P22.ring,.32), shade:e6_mix(P22.ground,P22.ring,.2), hair:e6_mix(P22.ground,P22.ring,.2), acc:P22.center};
const RPM22=[{value:33.333,label:'33⅓'},{value:45,label:'45'}], LANG22=-Math.PI/4, VIS22=1/6, F22=60;
const e6_rpmS=v=>v<40?'33⅓':'45';
/* time is the music's: one revolution is one bar of 3/4, so 33⅓ rpm (1.8 s a turn) is 100 BPM; 45 rpm runs 4/3 faster and a
   just fourth higher (the real 1.35 snapped to 4/3). A one-beat lead-in, the side in three bars at constant speed, a bar of
   lead-out, and the locked groove: one revolution, so one bar, looping */
const e6_tl22=rpm=>{ const B=60000/(rpm<40?100:400/3), T0=B, TS=T0+9*B, TL=TS+3*B; return {B,T0,TS,TL,TE:TL+3*B,k:rpm<40?0:5}; };
function e6_rh22(){ return e6_once('rh22',()=>{ const R=M.rng(2222), S=[]; let t=300;
  SIDE22.split(/\s+/).forEach(wd=>{ const n=e6_syl(wd); for(let k=0;k<n;k++){ const d=150+R()*80; S.push({t,s:k===0?.85+.15*R():.45+.3*R()}); t+=d; } t+=/[.?]$/.test(wd)?440:/,$/.test(wd)?240:40+R()*60; });
  const T=t+300, N=Math.ceil(T/10), env=new Float32Array(N);
  for(const q of S) for(let i=Math.floor(q.t/10);i<N;i++){ const u=i*10-q.t; if(u<0) continue; const a=u<40?u/40:Math.exp(-(u-40)/160); if(u>40&&a<.01) break; env[i]+=q.s*a; }
  for(let i=0;i<N;i++) env[i]=Math.min(1,env[i]); return {S,T,N,env,rate:S.length/(T/1000)}; }); }
const lay22=e6_memo(function(w){ const T=e6_titleL(w,SUB22,520,480), o=Object.assign({},T), {pad,inner}=T;
  o.R=Math.floor(inner/2)-2; o.dcx=pad+inner/2; o.dcy=T.top+o.R+4; let y=o.dcy+o.R+34;
  o.stY=y; y+=T.ph?62:48; o.inY=y+18; o.inH=T.ph?96:116; o.inX=pad; o.inW=inner; y=o.inY+o.inH+34;
  o.legY=y; y+=T.ph?34:20; o.foot=e6_footL(FOOT22,inner); o.footY=e6_q(y+16); o.H=e6_q(o.footY+(o.foot.length-1)*14+pad); return o; });
const FOOT22='Root · lacquer cutting: a lathe cuts the groove and a locked run-out. Simplified: pitch ×30, 60 Hz wiggle.';
/* the groove, computed once per (size, rpm) into flat arrays: radius, disc angle, kind, a seeded value */
function e6_g22(L,rpm){ return e6_once('g22|'+L.R+'|'+rpm+'|'+e6_dpr(),()=>{ const Rh=e6_rh22(), R=L.R, Rlab=R*.335, Rl=Rlab+R*.05, Rs=R*.95;
  const sec=Rh.T/1000, turnsMax=sec*45/60, band=Rs-(Rl+R*.12), pitch=band/(turnsMax+.15), turns=sec*rpm/60, Th=TAU*turns, gw=Math.max(2.2,pitch*.42), A0=-Math.PI/2, om=rpm/60*TAU;
  const env=t=>{ const i=Math.floor(t*100); return i<0||i>=Rh.N?0:Rh.env[i]; };
  const rP=th=>{ const t=th/om; return Rs-pitch*th/TAU+pitch*.3*env(t)*Math.sin(TAU*F22*t); };
  const Re=Rs-pitch*Th/TAU, LO=TAU*2;
  const r=th=>th<0?Rs+(-th/TAU)*(R*.985-Rs):th<=Th?rP(th):th<=Th+LO?lerp(Re,Rl,(th-Th)/LO):Rl;
  const rr=[], aa=[], kk=[], qq=[], Rr=M.rng(2230); let n=0;
  const push=(rad,a,k)=>{ rr.push(rad); aa.push(a); kk.push(k); qq.push(Rr()); n++; };
  let c=0; for(let th=-TAU;th<Th+LO;c++){ const rad=r(th), a=A0-th; push(rad+gw/2,a,0); if(c%3===0) push(rad-gw/2,a,1); th+=(L.ph?1.3:1.5)/Math.max(20,rad); }
  for(let th=0;th<TAU;th+=1.1/Rl){ push(Rl+gw/2,A0-th,2); push(Rl-gw/2,A0-th,3); }
  return {R,Rlab,Rl,Rs,Re,pitch,gw,turns,Th,LO,om,A0,r,sec,rate:Rh.rate,syl:Rh.S.length,
    rad:Float32Array.from(rr),ang:Float32Array.from(aa),kind:Uint8Array.from(kk),rnd:Float32Array.from(qq)}; }); }
/* tonearm: the stylus sits where a circle of radius ρ about the spindle meets the arm's circle about its pivot (computed) */
function e6_arm22(L,G,rho){ const cx=L.dcx, cy=L.dcy, px=cx+L.R*1.0, py=cy-L.R*1.04, D=Math.hypot(px-cx,py-cy), Ln=D-G.Rl*.85;
  const a=(rho*rho-Ln*Ln+D*D)/(2*D), hh=Math.sqrt(Math.max(0,rho*rho-a*a)), ux=(px-cx)/D, uy=(py-cy)/D, bx=cx+a*ux, by=cy+a*uy;
  return {px,py,sx:bx-uy*hh,sy:by+ux*hh}; }
function e6_frame22(g,st,w,h,t){ const L=lay22(w), G=e6_g22(L,st.rpm), cx=L.dcx, cy=L.dcy, B=new e6_FB(g), live=t!=null, Q=e6_tl22(st.rpm);
  /* time, on the bar grid: needle drop and lead-in (one beat), the side at constant speed (three bars), the lead-out (one bar),
     then it locks and the accent runs once around the ring (one revolution, one bar) */
  let ths=G.Th*.58, lockU=1, phi=0;
  if(live){ phi=G.om*VIS22*t/1000; if(t<Q.T0) ths=-TAU*.4*(1-t/Q.T0); else if(t<Q.TS) ths=G.Th*(t-Q.T0)/(Q.TS-Q.T0); else if(t<Q.TL) ths=G.Th+G.LO*E.outCubic((t-Q.TS)/(Q.TL-Q.TS)); else ths=G.Th+G.LO+.01; lockU=t<Q.TL?0:cl((t-Q.TL)/(Q.TE-Q.TL)); }
  const rho=G.r(ths), arm=e6_arm22(L,G,rho), sig=Math.atan2(arm.sy-cy,arm.sx-cx);
  /* the groove under the stylus brightens on each note of the melody; the locked ring swells at the lock; the spindle answers each turn's pop */
  const en=m3_env(st,'n*',t,170), el=m3_env(st,'lock',t,600), cS=Math.cos(sig), sS=Math.sin(sig), near=en>.04;
  /* the disc */
  const cL=Math.cos(LANG22), sL=Math.sin(LANG22), n=G.rad.length, cP=Math.cos(phi), sP=Math.sin(phi), lockA=G.A0+phi+(sig-(G.A0+phi));
  for(let i=0;i<n;i++){ const a=G.ang[i], ca=Math.cos(a), sa=Math.sin(a), cA=ca*cP-sa*sP, sA=sa*cP+ca*sP, r=G.rad[i], x=cx+r*cA, y=cy+r*sA, k=G.kind[i], q=G.rnd[i];
    let s=cA*cL+sA*sL; s*=s; s*=s; s*=s;
    if(k===0){ if(near&&cA*cS+sA*sS>.94&&Math.abs(r-rho)<G.pitch*2.2){ B.dot(x,y,(.5+.42*s)*(1+.7*en),en>.5?C22.hi:C22.mid); continue; }
      if(q>.26+.74*s) continue; B.dot(x,y,.5+.42*s,s>.5?C22.hi:s>.16?C22.mid:C22.lo,s<=.16); }
    else if(k===1){ if(q>.7) continue; B.dot(x,y,.5,C22.shade,true); }
    else { /* the locked groove: the accent arrives around the ring from the stylus, once the side is in tune */
      let on=lockU>=1; if(!on&&lockU>0){ let d=((sig-Math.atan2(sA,cA))%TAU+TAU)%TAU; on=d<lockU*TAU; }
      if(k===2){ if(q>.55+.45*s&&!on) continue; B.dot(x,y,(on?.62+.25*s:.5+.42*s)*(on?1+.6*el:1),on?C22.acc:(s>.5?C22.hi:C22.mid)); } else if(q<.7) B.dot(x,y,.52*(on?1+.5*el:1),on?C22.acc:C22.shade); } }
  /* spindle hole: a void with a crisp rim */
  const ep=m3_env(st,'pop',t,240); M.ring(B,{cx,cy,R:Math.max(3.2,G.R*.017)*(1+.35*ep),w:.8,swell:.1,dpl:1.6,rCore:.62,rEdge:.55,seed:2203,color:ep>.3?C22.ink:C22.soft});
  /* tonearm, pivot, stylus */
  e6_seg(B,arm.px,arm.py,arm.sx,arm.sy,C22.soft,{seed:2204,dpl:1.3,spread:.35,r:.62}); const ax=(arm.px-arm.sx), ay=(arm.py-arm.sy), al=Math.hypot(ax,ay);
  e6_seg(B,arm.px,arm.py,arm.px+ax/al*G.R*.09,arm.py+ay/al*G.R*.09,C22.soft,{seed:2205,dpl:3.2,spread:1.4,r:.62});
  M.ring(B,{cx:arm.px,cy:arm.py,R:5,w:1.2,swell:.1,dpl:1.6,rCore:.7,rEdge:.55,seed:2206,color:C22.soft});
  e6_cross(B,arm.sx,arm.sy,2.6,C22.ink,2207,2);
  /* the inset: the groove under the stylus, magnified. Three neighboring turns, walls lit and shaded, land left empty */
  const ix=L.inX, iy=L.inY, iw=L.inW, ih=L.inH, mag=ih/(G.pitch*2.7), yc=iy+ih/2;
  const thU=((G.A0+phi-sig)%TAU+TAU)%TAU; let thp=thU+TAU*Math.round((ths-thU)/TAU);   /* the groove point now under the stylus */
  if(ths<0) thp=ths;
  for(let k=-1;k<=1;k++) for(let px=0;px<iw;px+=L.ph?1.1:1){ const s=(px-iw/2)/mag, th=thp+k*TAU+s/Math.max(20,rho), r=G.r(th), y0=yc+(rho-r)*mag; const R=M.hash2(px*7|0,k+5,2209);
    const yl=y0-G.gw*mag/2, ysh=y0+G.gw*mag/2; if(yl>iy+2&&yl<iy+ih-2) B.dot(ix+px,yl+(R-.5)*.8,.68*(k===0?1+.6*en:1),C22.hi); if(ysh>iy+2&&ysh<iy+ih-2&&R<.6) B.dot(ix+px,ysh+(R-.5)*.8,.55,C22.lo);
    /* the wall itself: sparse dots down the lit wall's slope */
    if(R<.22){ const yy=yl+(ysh-yl)*R/.22*.4; if(yy>iy+2&&yy<iy+ih-2) B.dot(ix+px,yy,.5,C22.shade); } }
  { const sx=ix+iw/2, R=M.rng(2210); for(let q=0;q<46;q++){ const u=R(), v=(R()-.5)*2; const yy=yc-G.gw*mag*.42+u*G.gw*mag*.42, xx=sx+v*(1-u)*G.gw*mag*.32; B.dot(xx,yy,.62,C22.ink); } }
  B.flush();
  /* the label: it turns with the disc. Wordmark small, side and speed, all placeholder */
  g.save(); g.translate(cx,cy); g.rotate(phi); const xh=Math.max(7,G.Rlab*.105), geo0=M.logoGeo(0,0,xh), lx=-geo0.w/2;
  M.logo(g,lx,-G.Rlab*.34,xh,{color:C22.ink});
  const ty=Math.max(G.Rlab*.2,15); e6_lab(g,'Mir · side A',0,ty,C22.ink,9,{align:'center'});
  e6_lab(g,e6_rpmS(st.rpm)+' rpm',0,Math.max(G.Rlab*.66,ty+31),C22.ink,9,{align:'center'}); g.restore();
  /* inset frame and words */
  e6_box(g,ix,iy,ix+iw,iy+ih,C22.hair);
  const locked=ths>G.Th+G.LO;
  e6_lab(g,'Inset · '+mag.toFixed(1)+'× · '+(locked?'the locked groove: unmodulated, it holds':ths<0?'the lead-in: no signal yet':'the groove under the stylus'),ix,iy-10,C22.ink,9);
  if(!L.ph) e6_lab(g,'lit wall · shaded wall',ix+iw,iy-10,C22.soft,9,{align:'right'});
  /* live state */
  const sL2=locked?'locked · in tune':live&&t<600?'needle drop':live&&ths>G.Th?'lead-out':'playing · turn '+Math.max(1,Math.ceil(Math.max(0,ths)/TAU))+' of '+Math.ceil(G.turns);
  e6_lab(g,sL2,L.pad,L.dcy-L.R+4,locked?C22.acc:C22.soft,9);
  if(live) e6_lab(g,'rotation 1/6 speed',L.pad+L.inner,L.dcy+L.R-2,C22.soft,9,{align:'right'}); }
function e6_base22(st,w,h){ return e6_slot(st,'base22',e6_DK(w,h)+'|'+st.rpm,()=>{ const L=lay22(w), G=e6_g22(L,st.rpm), {cv,g}=e6_off(w,h);
  M.fill(g,P22.ground); e6_title(g,L,'L-22','Pairing · lacquer groove',null,'Cut in lacquer',C22.ink,C22.soft);
  const a=e6_rpmS(st.rpm)+' rpm · '+(60/st.rpm).toFixed(2)+' s a turn · side '+G.sec.toFixed(1)+' s → '+G.turns.toFixed(1)+' turns', b=G.syl+' syllables · '+(G.syl/G.turns).toFixed(1)+' a turn';
  if(L.ph){ e6_lab(g,a,L.pad,L.stY,C22.ink,9,{track:.08}); e6_lab(g,b,L.pad,L.stY+15,C22.soft,9,{track:.08}); }
  else { e6_lab(g,a,L.pad,L.stY,C22.ink,9,{track:.08}); e6_lab(g,b,L.pad,L.stY+15,C22.soft,9,{track:.08}); }
  const B=new M.Buf(g); /* rim and label edge: turning does not change them */ M.ring(B,{cx:L.dcx,cy:L.dcy,R:G.R,w:1.4,swell:.2,dpl:.9,rCore:.75,rEdge:.55,seed:2201,color:C22.dim}); M.ring(B,{cx:L.dcx,cy:L.dcy,R:G.Rlab,w:1,swell:.2,dpl:1.1,rCore:.7,rEdge:.55,seed:2202,color:C22.dim});
  M.ring(B,{cx:L.pad+5,cy:L.legY-3,R:4,w:1.1,swell:.1,dpl:1.8,rCore:.8,rEdge:.6,seed:2211,color:C22.acc}); B.flush();
  e6_lab(g,L.ph?'accent: the locked groove':'accent: the locked groove, where it holds',L.pad+16,L.legY,C22.soft,9);
  e6_foot(g,L.foot,L.pad,L.footY,C22.soft); return cv; }); }
/* music: the record plays a waltz cut from the speech. 3/4, one bar a revolution (100 BPM at 33⅓). The stressed syllables, read
   at the stylus's constant speed and quantized to 8ths, are the melody on the Oberheim lead, moving by step and gliding between
   near notes: each sentence arcs up from the chord's third and comes down, a comma rests on the fifth, a full stop lands on the
   root, and the 8th after either is a breath.
   Under it the waltz: a plucked root on 1, chord plucks on 2 and 3, over D | Bm | G, then the lead-out bar on A7sus4 glides the
   lead down to D, and the lock resolves the suspension to the third (meet, the red ring) with the stacked bass once. The
   locked groove is one revolution, so one bar, and it loops. A pop at each turn, dust crackle throughout. At 45 rpm everything
   is a just fourth higher and 4/3 faster, as the real disc is. */
const PR22=['D','Bm','G'];
function e6_music22(st){ const mu=M.music, Q=e6_tl22(st.rpm), k=Q.k, B=Q.B, S=mu.score({bpm:60000/B,meter:[3,4]}), Rh=e6_rh22(), tr=sym=>m3_tr(sym,k);
  const bars=[...PR22,'A7sus4','D'], bt=b=>Q.T0+b*3*B;
  S.harm([[0,tr('D')]].concat(bars.map((c,b)=>[bt(b),tr(c)])));
  /* needle drop and the dust */
  const nz=S.hitSound(0,'noise',{color:.9,level:.085,fade:.25,dur:(Q.TE+400)/1000},null); S.hitSound(0,'needle',{vel:.52});
  S.set(Q.TL,nz,'color',.96,300); S.set(Q.TL,nz,'level',.05,400);
  /* the melody: word-first syllables at the stylus's constant speed, quantized to 8ths across the side's three bars */
  const SY=Rh.S, W=[]; SY.forEach((q,i)=>{ if(q.s<.85) return; if(W.length){ const pre=q.t-SY[i-1].t; W[W.length-1].cad=pre>=560?2:pre>=380?1:0; } W.push({u:q.t/Rh.T,s:q.s,cad:2}); });
  const slot=new Map(); W.forEach(n=>{ const j=Math.min(17,Math.round(n.u*18)); const o=slot.get(j); if(!o||n.cad>o.cad) slot.set(j,n); });
  /* a sentence breathes: the 8th after a full stop or a comma is a rest */
  const N=[]; [...slot.entries()].sort((a,b)=>a[0]-b[0]).forEach(([j,n])=>{ const p=N[N.length-1]; if(p&&p.cad>0&&j===p.j+1) return; N.push(Object.assign({j},n)); });
  /* the line moves by step in the scale, on a chord tone on each beat: each sentence arcs up from the chord's third and comes
     down, a comma resting on the fifth, a full stop landing on the root */
  const md='ionian', MS=mu.MODES[md], dOf=sym=>Math.max(0,MS.indexOf((mu.pcOf(mu.parse(sym).root)-2+12)%12));
  let start=0, prevD=null, prev=null;
  N.forEach((n,i)=>{ if(i&&N[i-1].cad===2) start=i; let end=i; while(end<N.length-1&&N[end].cad!==2) end++; const u=end>start?(i-start)/(end-start):1;
    const bar=Math.floor(n.j/6), sym=bars[bar], r=dOf(sym), lo=r>3?r-7:r;
    const near=c=>prevD==null?c[0]:c.reduce((a,b)=>Math.abs(b-prevD)<Math.abs(a-prevD)?b:a);
    let d=n.cad===2?near([lo+7,lo]):n.cad===1?near([lo+4,lo-3,lo+11]):lo+2+Math.round(2.4*Math.sin(Math.PI*u))+(n.s>.95?1:0);
    if(prevD!=null&&!n.cad) d=prevD+Math.max(-2,Math.min(2,d-prevD)); prevD=d;
    let m=mu.deg(md,d,4); if(n.j%2===0||n.cad) m=mu.snap(sym,m); m+=k;
    const t=Q.T0+n.j*B/2, nx=i<N.length-1?N[i+1].j:18, d8=Math.min(n.cad?3:2,nx-n.j)*B/2*.94;
    S.note(t,'ober',m,d8,{over:tr(sym),from:prev!=null&&Math.abs(prev-m)<=4?prev:undefined,glide:70,vel:n.cad?.5:.44,cutoff:1300,vibrato:n.cad?12:6,echo:.18,echoTime:B*.75/1000,pan:.08},['n'+i,1]); prev=m; });
  /* the waltz under it: root on 1, chord on 2 and 3, one pop per revolution */
  let vc=null; bars.forEach((c,b)=>{ const t0=bt(b), sym=tr(c); vc=mu.voice(sym,'F#3','A4',3,vc);
    if(b!==4) S.note(t0,'pluck',mu.ct(sym,m3_root(sym,2),0),B*.9,{cutoff:380,env:1.2,vel:.58});
    [1,2].forEach(q=>S.chord(t0+q*B,'pluck',vc,B*.7,{cutoff:900,env:1.2,vel:.4,pan:q===1?-.15:.15}));
    S.hitSound(t0,'tick',{vel:.2,tock:true,pan:.1},['pop',1]); });
  S.hitSound(Q.TE,'tick',{vel:.2,tock:true,pan:.1},['pop',1]);
  /* the lead-out: one long glide down to the tonic over the suspended dominant */
  S.note(Q.TS,'ober',mu.ct(tr('A7sus4'),m3_root(tr('A7sus4'),3),1)+12,3*B*.98,{from:prev!=null?prev:undefined,glide:3*B*.7,vel:.42,cutoff:1100,vibrato:4,echo:.2,echoTime:B*.75/1000},['nlo',1]);
  /* the lock: the suspension resolves to the third, the stacked bass once, the chord held for the looping bar */
  S.note(Q.TL,'meet',mu.ct(tr('D'),m3_root(tr('D'),4),1),1800,{spread:30,vel:.56},['lock',1]);
  S.note(Q.TL,'bass',m3_root(tr('D'),2),560,{from:m3_root(tr('A'),1),glide:90,env:3,decay:.4,vel:.6});
  S.chord(Q.TL,'pad',mu.voice(tr('D'),'D4','D5',4),3*B,{attack:.08,release:1,cutoff:1300,vel:.4});
  S.end(Q.TE+1300); return S.out(); }
M.piece({ id:'L-22',
  caption:'Mir’s side cut as a spiral groove, with the speech rhythm wiggling the walls and the run-out closing into a locked ring when it ends in tune. Switch Speed to 45 rpm and the same words take more turns.',
  alt:'A black record seen from above: fine dotted spiral grooves, brighter along a diagonal band where the walls catch the light, a dotted tonearm from the upper right, a center label with the small mindgut wordmark, “Mir · side A” and the speed, and a red ring marking the locked groove. Below, a magnified strip of three groove walls wiggling.',
  recipe:{
    idea:'State is a groove that keeps spiraling or closes and holds, and the rhythm is counted syllables, cut once and read back the same way.',
    marks:['ring','center','dot'],
    ground:'night',
    accent:'the locked groove, red, running around the ring from the stylus once the side is in tune',
    composition:'The disc fills the width with the label and wordmark at center and a tonearm from the upper right; a magnified inset of the groove under the stylus below it; stats and a legend.',
    motion:'On the record’s own grid, one revolution a bar of 3/4 (100 BPM at 33⅓, 4/3 faster at 45), rotation shown at 1/6 speed: needle drop and lead-in (one beat), the side at constant speed (three bars), the lead-out (one bar, outCubic), then the accent runs once around the locked groove (one bar). The groove under the stylus brightens on each note. Reduced motion shows the disc mid-side.',
    sound:'A waltz cut from the speech: the stressed syllables are a gliding lead, each sentence landing on its root, over plucked oom-pah-pah and dust. The lead-out glides home; the lock resolves the suspension to the third with the bass, and the locked bar loops.',
    controls:['Speed (33⅓, 45 rpm)'],
    computed:['rhythm: syllables from vowel groups, seeded durations, envelope attack 40 ms, decay 160 ms','groove: r(θ) = Rs − pitch·θ/2π + A·env(t)·sin(2π·60 Hz·t), t = θ/2π · 60/rpm','lit wall: brightness ∝ |cos(angle − light)|⁸','tonearm: the stylus sits where the groove radius meets the arm’s circle about its pivot'],
    placeholder:['the words','the label'],
    root:'lacquer disc cutting',
    rules:['schematic: pitch exaggerated about 30×, modulation drawn at 60 Hz, stylus advance compressed'],
    engine:['M.ring','M.logo','M.logoGeo','M.hash2','M.rng','M.ease.inOutCubic','M.ease.outCubic','M.text','M.rule','M.fill']
  },
  aspect:w=>w/lay22(w).H,
  state:{rpm:33.333},
  controls:[{id:'rpm',type:'select',label:'Speed',play:true,options:RPM22.map(o=>({value:o.value,label:o.label+' rpm'}))}],
  music:e6_music22,
  render(g,w,h,M,st){ e6_blit(g,e6_base22(st,w,h)); e6_frame22(g,st,w,h,null); },
  animate(g,w,h,M,st,t){ t=Math.max(0,t); e6_blit(g,e6_base22(st,w,h)); e6_frame22(g,st,w,h,t); return t<e6_tl22(st.rpm).TE+700; } });


/* ════════════════════════════════════════════════════════════════════════
   L-23 · Contact sheet · 36 frames of one field settling, printed as six strips of six.
   Session (computed from seeded steps): agreement a_i ∈ [.42, .92]; at frame 22 one step is negative (a slip);
   S_i = max(0, S_(i−1) + a_i), k_i = 1 − e^(−S_i ÷ 10). Held = the first frame from which every later k ≥ .8;
   slipped = the frame with the largest drop. Every frame draws the SAME dot set (unit coordinates) at its k, so the loupe is
   a true enlargement of one frame. 35 mm proportions (frame 36 × 24, pitch 38, strip 35 mm), schematic edge.
   ════════════════════════════════════════════════════════════════════════ */
const SUB23='Thirty-six frames of one field settling, marked in grease pencil where it held and where it slipped.';
const SLIP23=21;
const FILM23={night:{name:'Night',base:'#0f0c0c',frame:'#221d1c',dot:'#efefef',edge:'#8a8786'},olive:{name:'Olive',base:'#141912',frame:'#232a20',dot:'#e7e9e6',edge:'#8a917e'},cobalt:{name:'Cobalt',base:'#0e1b4d',frame:'#1b2a63',dot:'#efefef',edge:'#7d88b5'},paper:{name:'Paper',base:'#d5d6d8',frame:'#eaebec',dot:'#1d2733',edge:'#6f757d'}};
const P23=M.PAL.paper, C23={ink:P23.ink, soft:P23.soft, hair:e6_mix(P23.ground,P23.ink,.16), sheet:'#ffffff', acc:P23.center, tint:e6_mix(P23.ground,P23.ink,.3)};
function e6_ses23(){ return e6_once('ses23',()=>{ const R=M.rng(2323); let S=0; const f=[];
  for(let i=0;i<36;i++){ let a=.42+.5*R(); if(i===SLIP23) a=-3.6; S=Math.max(0,S+a); f.push({k:1-Math.exp(-S/10),t:i*95+Math.round(R()*40)}); }
  let held=35; for(let i=35;i>=0;i--){ if(f[i].k>=.8) held=i; else break; }
  let slip=1, md=0; for(let i=1;i<36;i++){ const d=f[i-1].k-f[i].k; if(d>md){ md=d; slip=i; } }
  return {f,held,slip}; }); }
/* the field in unit coordinates: five rings, a center ring, strays. Same dots, every k */
function e6_unit23(){ return e6_once('unit23',()=>{ const R=M.rng(2301), d=[];
  for(let i=1;i<=5;i++){ const Ri=i/5*.9, n=Math.round(TAU*Ri*30); for(let j=0;j<n;j++){ const a=(j+R())/n*TAU; d.push({ring:i,Ri,a,g:R.gauss(),g2:R.gauss(),nz:M.noise(Math.cos(a)*1.3+5,Math.sin(a)*1.3+5,i)-.5,q:R()}); } }
  for(let j=0;j<44;j++){ const a=(j+R())/44*TAU; d.push({ring:0,Ri:.085,a,g:R.gauss(),g2:R.gauss(),nz:0,q:R()}); }
  for(let j=0;j<60;j++) d.push({ring:-1,Ri:1+R()*.18,a:R()*TAU,g:R.gauss(),g2:R.gauss(),nz:0,q:R()});
  return d; }); }
function e6_field23(B,cx,cy,s,k,col,rd,clip){ const lo=1-k, U=e6_unit23();
  for(const d of U){ let x,y;
    if(d.ring>0){ const lo2=lo*lo, r=d.Ri*(1+lo*.3*d.nz*2)+d.g*(.012+lo2*.2+lo*.04), a=d.a+lo2*.35*d.g2; x=Math.cos(a)*r; y=Math.sin(a)*r; }
    else if(d.ring===0){ const ex=1+lo*.9, ey=1-lo*.35, r=d.Ri+d.g*(.006+lo*.03), ux=Math.cos(d.a)*r*ex, uy=Math.sin(d.a)*r*ey, c=Math.cos(.7), sn=Math.sin(.7); x=ux*c-uy*sn; y=ux*sn+uy*c; }
    else { if(d.q>lo*1.2) continue; const r=d.Ri+lo*.16*Math.abs(d.g); x=Math.cos(d.a)*r; y=Math.sin(d.a)*r; }
    const X=cx+x*s, Y=cy+y*s; if(clip&&!clip(X,Y)) continue; B.dot(X,Y,rd*(.85+.3*d.q),col); } }
const lay23=e6_memo(function(w){ const T=e6_titleL(w,SUB23,640), o=Object.assign({},T), {ph,pad,inner}=T;
  const per=ph?4:6, nS=36/per, sheetW=ph?inner:Math.round(inner*.66), sp=ph?10:14, edge=20;
  const fp=(sheetW-2*sp)/per, mm=fp/38, fw=36*mm, fh=24*mm, rb=Math.max(5.5*mm,edge), sh=fh+2*rb, gap=ph?10:12;
  o.per=per; o.nS=nS; o.mm=mm; o.fw=fw; o.fh=fh; o.fp=fp; o.rb=rb; o.sh=sh;
  o.sheet=[pad,T.top,pad+sheetW,T.top+sp*2+nS*sh+(nS-1)*gap];
  o.strips=[]; o.frames=[]; for(let s=0;s<nS;s++){ const sx=pad+sp, sy=T.top+sp+s*(sh+gap); o.strips.push([sx,sy,sx+per*fp,sy+sh]); for(let j=0;j<per;j++){ const i=s*per+j, fx=sx+j*fp+mm, fy=sy+rb; o.frames.push([fx,fy,fx+fw,fy+fh]); } }
  let y;
  if(ph){ y=o.sheet[3]+40; o.lx=pad; o.lw=inner; }
  else { o.lx=o.sheet[2]+32; o.lw=pad+inner-o.lx; y=T.top; }
  o.lD=Math.min(o.lw,ph?inner*.78:300); o.lcx=o.lx+(ph?o.lD/2:o.lw/2); o.lcy=y+o.lD/2+(ph?8:0); y=y+o.lD+(ph?40:36);
  o.infoY=y; y+=56; o.spY=y+8; o.spH=ph?70:80; y=o.spY+o.spH+40; o.noteY=y; y+=4*16;
  const bot=Math.max(ph?0:o.sheet[3]+28,y+8); o.foot=e6_footL(FOOT23,inner); o.footY=e6_q(bot+16); o.H=e6_q(o.footY+(o.foot.length-1)*14+pad); return o; });
const FOOT23='Root · contact sheet: negatives printed onto paper, marked in grease pencil. Simplified: 35 mm frames.';
function e6_loop23(B,f,u,seed,col,over){ const [x0,y0,x1,y1]=f, cx=(x0+x1)/2, cy=(y0+y1)/2, rx=(x1-x0)/2*(over||1.2), ry=(y1-y0)/2*(over||1.2)*1.18, R=M.rng(seed), a0=-2.3+R()*.3, span=TAU*1.12, ph=R()*TAU;
  const L=Math.PI*(rx+ry)*1.12, n=Math.round(L*3.2*u);
  for(let i=0;i<n;i++){ const t=i/(L*3.2), a=a0+span*t, wob=1+.05*Math.sin(2*a+ph)+.03*Math.sin(5*a+ph*2)+(t>.92?(t-.92)*.6:0), x=cx+Math.cos(a)*rx*wob, y=cy+Math.sin(a)*ry*wob;
    /* wax on paper: the pencil skips where the tooth is high */
    if(M.noise(t*40,seed,7)<.2&&R()<.7) continue; const k=R.gauss()*1.05, nx=Math.cos(a), ny=Math.sin(a); B.dot(x+nx*k,y+ny*k,.78+.38*R(),col); } }
function e6_strike23(B,f,u,seed,col){ const [x0,y0,x1,y1]=f, m=(x1-x0)*.08, R=M.rng(seed); [[x0-m,y1+m*.6,x1+m,y0-m*.6],[x0-m,y0-m*.4,x1+m,y1+m*.5]].forEach(([ax,ay,bx,by],q)=>{ const v=cl(u*2-q); if(v<=0) return; const L=Math.hypot(bx-ax,by-ay), n=Math.round(L*3*v);
  for(let i=0;i<n;i++){ const t=i/(L*3), bow=Math.sin(t*Math.PI)*m*.4, x=lerp(ax,bx,t), y=lerp(ay,by,t)+bow; if(M.noise(t*30,seed+q,7)<.2&&R()<.7) continue; const k=R.gauss()*1.0; B.dot(x+k*.5,y+k,.78+.38*R(),col); } }); }
function e6_base23(st,w,h){ return e6_slot(st,'base23',e6_DK(w,h)+'|'+st.film,()=>{ const L=lay23(w), F=FILM23[st.film]||FILM23.night, S=e6_ses23(), {cv,g}=e6_off(w,h), ink=C23.ink, soft=C23.soft;
  M.fill(g,P23.ground); e6_title(g,L,'L-23','Pairing · contact sheet',null,'Contact sheet',ink,soft);
  const [s0,s1,s2,s3]=L.sheet; M.fill(g,C23.sheet,s0,s1,s2-s0,s3-s1); e6_box(g,s0,s1,s2,s3,C23.hair);
  const B=new M.Buf(g), mm=L.mm;
  L.strips.forEach((sr,si)=>{ const [x0,y0,x1,y1]=sr; M.fill(g,F.base,x0,y0,x1-x0,y1-y0);
    /* sprocket holes: voids, so the white sheet shows through. 8 per frame, 4.75 mm pitch */
    const pw=1.98*mm, phh=Math.max(2.79*mm,4.5), ins=Math.max(1.4,L.rb*.07), py=[y0+ins,y1-ins-phh]; g.fillStyle=C23.sheet;
    for(let x=x0+2.37*mm-pw/2;x<x1-pw;x+=4.75*mm) py.forEach(y=>{ e6_rrPath(g,x,y,pw,phh,Math.min(pw,phh)*.28); g.fill(); }); });
  L.frames.forEach((f,i)=>{ const [x0,y0,x1,y1]=f; M.fill(g,F.frame,x0,y0,x1-x0,y1-y0); e6_field23(B,(x0+x1)/2,(y0+y1)/2,(y1-y0)*.43,S.f[i].k,F.dot,L.ph?.55:.6,(x,y)=>x>x0+1&&x<x1-1&&y>y0+1&&y<y1-1); });
  B.flush();
  /* edge print: frame numbers with half-frame A numbers between, the stock name on the other edge */
  const es=9;
  L.frames.forEach((f,i)=>{ const [x0,y0,x1,y1]=f, by=y1+8.5; e6_lab(g,'▸'+(i+1),(x0+x1)/2-L.fp*.12,by,F.edge,es,{track:.04});
    if((i+1)%L.per) e6_lab(g,(i+1)+'A',x1+mm,by,F.edge,es,{track:.04,align:'center'});
    if(i%L.per===0) e6_lab(g,'MIR 400',x0+L.fp*.06,y0-2,F.edge,es,{track:.1}); });
  /* the sparkline: the session's computed k, one dot per frame */
  { const x0=L.lx, x1=L.lx+L.lw, y0=L.spY, y1=L.spY+L.spH, X=i=>x0+(i+.5)*(x1-x0)/36, Y=k=>y1-k*(y1-y0), B2=new M.Buf(g);
    for(let x=x0;x<x1;x+=3) B2.dot(x,Y(.8),.55,C23.tint);
    for(let i=0;i<35;i++) e6_seg(B2,X(i),Y(S.f[i].k),X(i+1),Y(S.f[i+1].k),C23.tint,{seed:2330+i,dpl:1.2,spread:.15,r:.55});
    S.f.forEach((f,i)=>{ const R=M.rng(2360+i); for(let q=0;q<10;q++){ const a=R()*TAU, r=Math.sqrt(R())*1.9; B2.dot(X(i)+Math.cos(a)*r,Y(f.k)+Math.sin(a)*r,.6,ink); } });
    B2.flush(); e6_lab(g,'settled per frame',x0,y0-12,ink,9); e6_lab(g,'in tune ≥ .80',x1,Y(.8)+14,soft,9,{align:'right'}); e6_lab(g,'1',x0,y1+16,soft,9); e6_lab(g,'36',x1,y1+16,soft,9,{align:'right'}); }
  /* notes */
  { let y=L.noteY; [['held','frame '+(S.held+1)+' · from here on, settled ≥ .80'],['slipped','frame '+(S.slip+1)+' · the largest drop']].forEach(([k,s],q)=>{ e6_lab(g,k,L.lx+32,y,ink,9); e6_lab(g,s,L.lx+32,y+14,soft,9,{track:.06}); const B3=new M.Buf(g), bx=[L.lx+2,y-4,L.lx+20,y+8]; e6_loop23(B3,bx,1,2390+q,C23.acc,1.05); if(q) e6_strike23(B3,bx,1,2395,C23.acc); B3.flush(); y+=40; }); }
  e6_foot(g,L.foot,L.pad,L.footY,soft); return cv; }); }
/* time is the music's: 132 BPM in 4/4. The loupe walks one frame per 16th from a two-16th pickup, so the held frame lands on
   the downbeat of bar 2 while the pencil loops it; it holds two beats, the pencil loops the slip on beat 3 and strikes it out
   in two 8th-note strokes on beat 4, and the loupe comes home to the held frame on the next downbeat */
const BPM23=132, S16_23=60000/BPM23/4, B23=4*S16_23, TH23=32*S16_23, TS23=TH23+2*B23, TX23=TH23+3*B23, TA23=TH23+4*B23;
function e6_sel23(S,t){ if(t<TH23) return Math.max(0,Math.min(S.held,Math.floor(t/S16_23)-2)); return t>=TS23&&t<TA23?S.slip:S.held; }
function e6_frame23(g,st,w,h,t){ const L=lay23(w), F=FILM23[st.film]||FILM23.night, S=e6_ses23(), B=new M.Buf(g), live=t!=null, T=e6_c(st);
  const uH=live?cl(t/TH23):1, uS=live?cl((t-TS23)/B23):1, uX=live?cl((t-TX23)/B23):1;
  let sel=st.sel==null?S.held:st.sel; if(live) sel=e6_sel23(S,t);
  const ef=live?Math.max(m3_env(st,'f'+sel,t,150),sel===S.held?m3_env(st,'held',t,420):0,m3_env(st,'arr',t,500)):0, ex=live?m3_env(st,'x',t,260):0;
  e6_loop23(B,L.frames[S.held],uH,2341,C23.acc); if(uS>0) e6_loop23(B,L.frames[S.slip],uS,2343,C23.acc); if(uX>0) e6_strike23(B,L.frames[S.slip],uX,2345,ex>.3?C23.ink:C23.acc);
  /* the selected frame, outlined on the sheet by four corner ticks that open out on its note */
  { const [x0,y0,x1,y1]=L.frames[sel], m=3+2.5*ef, a=Math.min(8,(x1-x0)*.12)*(1+.6*ef); [[x0-m,y0-m,1,1],[x1+m,y0-m,-1,1],[x0-m,y1+m,1,-1],[x1+m,y1+m,-1,-1]].forEach(([x,y,sx,sy],q)=>{ e6_seg(B,x,y,x+sx*a,y,C23.ink,{seed:2350+q,dpl:1.6,spread:.12,r:.6}); e6_seg(B,x,y,x,y+sy*a,C23.ink,{seed:2354+q,dpl:1.6,spread:.12,r:.6}); }); }
  /* the loupe: a true enlargement of the selected frame (same dots, scaled) */
  const D=L.lD, lcx=L.lcx, lcy=L.lcy, rad=D/2, fwl=D*1.12, fhl=fwl*24/36, mag=fwl/L.fw, inC=(x,y)=>(x-lcx)*(x-lcx)+(y-lcy)*(y-lcy)<(rad-1.5)*(rad-1.5);
  g.save(); g.beginPath(); g.arc(lcx,lcy,rad,0,TAU); g.clip(); M.fill(g,F.base,lcx-rad,lcy-rad,D,D); M.fill(g,F.frame,lcx-fwl/2,lcy-fhl/2,fwl,fhl); g.restore();
  e6_field23(B,lcx,lcy,fhl*.43,S.f[sel].k,F.dot,Math.min(2.2,(L.ph?.55:.6)*mag*.75),(x,y)=>inC(x,y)&&Math.abs(x-lcx)<fwl/2-1&&Math.abs(y-lcy)<fhl/2-1);
  B.flush();
  g.save(); g.strokeStyle=ef>.6?C23.acc:C23.ink; g.lineWidth=(1+Math.round(2*ef))/g.dpr; g.beginPath(); g.arc(lcx,lcy,rad,0,TAU); g.stroke(); g.restore();
  const f=S.f[sel], mmss=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  e6_lab(g,'Loupe · '+mag.toFixed(1)+'× · frame '+(sel+1)+(sel===S.held?' · held':sel===S.slip?' · slipped':''),L.lx,L.infoY,C23.ink,9.5);
  e6_lab(g,'settled '+f.k.toFixed(2)+' · '+e6_word(f.k)+' · '+mmss(f.t)+' into the session',L.lx,L.infoY+16,C23.soft,9,{track:.08});
  if(!T.used&&!live) e6_lab(g,'Click a frame to loupe it',L.lx,L.infoY+32,C23.ink,9);
  /* sparkline: the selected frame */
  { const X=L.lx+(sel+.5)*L.lw/36, Y=L.spY+L.spH-f.k*L.spH, B2=new M.Buf(g); M.ring(B2,{cx:X,cy:Y,R:4.5*(1+.5*ef),w:1,swell:.1,dpl:1.6,rCore:.7,rEdge:.55,seed:2370,color:ef>.35?C23.acc:C23.ink}); B2.flush(); } }
/* music: the frames are a melody. Each frame's settled value is a note: k climbs the film ground's mode from D (higher as it
   settles), snapped to the chord on the beats, so the loupe's walk plays a 16th-note run that rises through Dsus4, a ii7 and a
   suspended V, dips where the session slipped, and lands on the held frame on the downbeat: the third arrives (the red
   pencil) as a sustained glide with vibrato, the chosen one. The pencil scratches on each beat it loops. The slip is a muted
   wrong note struck out in two strokes over the IV; the cadence brings the loupe home on the motif, 5 ↑ 1 ↑ 3. */
const CH23={ionian:['Dsus4','Bm7','A7sus4','D','G'],dorian:['Dsus4','F','C','Dm','G'],mixolydian:['Dsus4','Em7','C','D','G'],lydian:['Dsus4','Bm7','A','D','E'],aeolian:['Dsus4','F','C','Dm','Gm']};
const e6_oct23=film=>(M.music.GROUND_FEEL[film]||{oct:0}).oct;
function e6_note23(j,mode,oct,sym){ const mu=M.music, k=e6_ses23().f[j].k, m=mu.deg(mode,Math.round(k/.86*9),4+oct); return sym?mu.snap(sym,m):m; }
function e6_music23(st){ const mu=M.music, S=mu.score({bpm:BPM23,ground:st.film}), md=S.mode, oc=e6_oct23(st.film), [sus,pre,dom,home,sub]=CH23[md]||CH23.ionian, Ses=e6_ses23(), B=B23, s16=S16_23;
  const T1=4*B, T2=TH23-2*B; S.harm([[0,sus],[T1,pre],[T2,dom],[TH23,home],[TS23,sub],[TA23,home]]);
  /* bed and bass: a quiet pad per chord, a plucked root under it */
  [[0,sus,T1],[T1,pre,2*B],[T2,dom,2*B],[TH23,home,2*B],[TS23,sub,2*B],[TA23,home,1800]].forEach(([t,c,d],i)=>{
    S.chord(t,'pad',mu.voice(c,'A3','A4',3),d,{attack:.12,release:.5,cutoff:950,vel:.42});
    S.note(t,'pluck',m3_root(c,2),Math.min(d,B*1.6),{cutoff:360,env:1.1,vel:.62}); });
  /* the walk: one frame per 16th, the held frame on the downbeat */
  let prev=null; for(let j=0;j<Ses.held;j++){ const t=(j+2)*s16, onB=(j+2)%4===0;
    const ch=t<T1?sus:t<T2?pre:dom, m=e6_note23(j,md,oc,onB?ch:null), mm=Math.abs(mu.snap(ch,m)-m)===1?mu.snap(ch,m):m;
    S.note(t,'mallet',mm,j===Ses.slip?260:520,{vel:onB?.68:.58,trem:5,cutoff:j===Ses.slip?1800:4200,pan:((j%6)/5-.5)*.6},['f'+j,1]); prev=mm; }
  /* the pencil, on the beat while it loops the held frame */
  for(let b=0;b<8;b++) S.hitSound(b*B,'scratch',{dur:.1,vel:.1+.03*(b%4===0)},null);
  /* the held frame: the third, sustained, with vibrato; a bell where the loop closes */
  const third=mu.deg(md,2,5+oc); S.note(TH23,'glide',third,2*B,{from:prev!=null?prev:undefined,glide:110,vibrato:13,rate:5.4,attack:.04,release:.5,vel:.68,tone:3400},['held',1]);
  S.note(TH23,'bell',third+12,1600,{ratio:3.5,bright:.8,vel:.3,pan:.2});
  /* the slip: the pencil loops it on beat 3, then strikes it out in two strokes, the second with the muted wrong note */
  S.hitSound(TS23,'scratch',{dur:.3,vel:.16},['f'+Ses.slip,1]); S.note(TS23,'mallet',mu.snap(sub,e6_note23(Ses.slip,md,oc)),300,{vel:.34,trem:0,cutoff:1600});
  S.hitSound(TX23,'scratch',{dur:.1,vel:.2},['x',1]); S.note(TX23,'pluck',mu.snap(sub,e6_note23(Ses.slip,md,oc))-12,70,{cutoff:280,env:.4,vel:.6});
  S.hitSound(TX23+B/2,'scratch',{dur:.1,vel:.22},['x',1]); S.hitSound(TX23+B/2,'snap',{vel:.3});
  /* the cadence: home to the held frame on the motif */
  [mu.deg(md,-3,5+oc),mu.deg(md,0,5+oc),third].forEach((m,i)=>S.note(TA23+i*s16,'mallet',m,i===2?1600:500,{vel:.62,trem:5,pan:(i-1)*.2},i===2?['arr',1]:null));
  S.note(TA23+2*s16,'bell',third+12,2200,{ratio:3.5,vel:.36,pan:-.2});
  S.end(TA23+1900); return S.out(); }
/* a control or a pointer answers in the film's mode: the frame's own note, or the cadence motif in the new mode */
function e6_play23(A,j,mode,oct,v){ const m=e6_note23(j,mode,oct), now=A.now()+.004; A.play('mallet',{when:now,freq:M.music.hz(m,'D'),dur:.6,vel:v,trem:5,pan:((j%6)/5-.5)*.5}); }
const e6_hit23=e=>{ const L=lay23(e.w); return L.frames.findIndex(([x0,y0,x1,y1])=>e.x>=x0-2&&e.x<=x1+2&&e.y>=y0-L.rb&&e.y<=y1+L.rb); };
M.piece({ id:'L-23',
  caption:'Thirty-six frames of one field settling, printed as a contact sheet with the frame where it held circled and the one where it slipped crossed out. Click any frame to loupe it, or change the film’s ground.',
  alt:'A white contact sheet with six black film strips of six frames, sprocket holes and edge numbers 1 to 36 with A numbers between. Each frame holds a stippled ring field, loose in the first frames and in tune in the last. A red grease-pencil loop circles one late frame; another loop around an earlier frame is crossed out. To the right, a round loupe enlarges the selected frame, with its settled value and time, and a dotted curve of that value across all 36 frames.',
  recipe:{
    idea:'A session is judged the way an editor judges a roll, by finding the frame where the picture holds; every frame is the same dots, more or less agreed.',
    marks:['ring','center','stray'],
    ground:'paper, with night, olive, cobalt or paper film',
    accent:'red grease pencil: a loop around the held frame, and a crossed-out loop around the slip',
    composition:'A white sheet of six strips of six frames (nine strips of four on phones) at left; a round loupe, its readout, a settled-per-frame sparkline and two notes at right (below on phones).',
    motion:'On a 132 BPM grid: the loupe walks one frame per 16th while the pencil loops the held frame (two bars), landing on the downbeat; it holds two beats, loops the slip on beat 3, strikes it out in two 8ths on beat 4 and returns home on the next downbeat. Frames flash on their notes. Reduced motion shows the marked sheet.',
    sound:'The frames are a melody: each frame’s settled value is a note, so the walk is a rising run that dips at the slip and lands on the held frame as a sustained third. The slip is a muted note, struck out; the motif cadences.',
    controls:['Ground of the film','click a frame to loupe it'],
    computed:['per frame: S = max(0, S + a), settled k = 1 − e^(−S ÷ 10), steps a ∈ [.42, .92] with one slip at frame 22','held: the first frame from which every later k ≥ .80','slipped: the frame with the largest drop','loupe: the frame’s own unit dot set, scaled'],
    placeholder:['the steps (seeded)','frame times','film stock name'],
    root:'the contact sheet',
    rules:['35 mm proportions: frame 36 × 24 mm, pitch 38 mm; sprocket holes are voids'],
    engine:['M.ring','M.noise','M.rng','M.Buf','M.text','M.rule','M.fill']
  },
  aspect:w=>w/lay23(w).H,
  state:{film:'night',sel:null},
  controls:[{id:'film',type:'select',label:'Ground of the film',options:Object.entries(FILM23).map(([k,v])=>({value:k,label:v.name}))}],
  music:e6_music23,
  musicIns:'mallet',
  /* Ground of the film is a mode: the cadence (5 ↑ 1 ↑ 3, the third held with vibrato) heard in it at once */
  musicParam(A,st,id,ov,nv){ if(id!=='film') return false; const mu=M.music, md=mu.groundMode(nv), oc=e6_oct23(nv), now=A.now()+.006, th=mu.deg(md,2,5+oc);
    [mu.deg(md,-3,5+oc),mu.deg(md,0,5+oc)].forEach((m,i)=>A.play('mallet',{when:now+i*S16_23/1000,freq:mu.hz(m,'D'),dur:.5,vel:.46,trem:5,pan:(i-1)*.2}));
    A.play('glide',{when:now+2*S16_23/1000,freq:mu.hz(th,'D'),from:mu.hz(mu.deg(md,3,5+oc),'D'),glide:160,dur:.9,vibrato:12,attack:.04,release:.5,vel:.55,tone:3400}); return true; },
  pointer(st,e){ const A=m3_A('L-23'), S=m3_S(st), md=M.music?M.music.groundMode(st.film):'ionian', oc=e6_oct23(st.film);
    if(e.type==='move'){ m3_try(()=>{ const i=e6_hit23(e); if(i<0){ S.hov=-1; return; } const n=performance.now(); if(A&&i!==S.hov&&n-(S.hovT||0)>90){ S.hov=i; S.hovT=n; e6_play23(A,i,md,oc,.3); } }); return false; }
    if(e.type!=='down') return false; const i=e6_hit23(e); if(i<0) return false; st.sel=i; e6_c(st).used=true;
    m3_try(()=>{ if(A){ S.hov=i; A.play('shutter',{when:A.now()+.004,vel:.45}); e6_play23(A,i,md,oc,.46); } }); return true; },
  render(g,w,h,M,st){ e6_blit(g,e6_base23(st,w,h)); e6_frame23(g,st,w,h,null); },
  animate(g,w,h,M,st,t){ t=Math.max(0,t); e6_blit(g,e6_base23(st,w,h)); e6_frame23(g,st,w,h,t); return t<TA23+900; } });


/* ════════════════════════════════════════════════════════════════════════
   L-24 · Smoked drum · a long session's clash, scratched through soot, one row per hour.
   Clash c(t), t in minutes (seeded, placeholder): .06 + .66·e^(−t/τ) + a seeded episode (a gaussian bump) + small noise.
   Trace (computed from c): y = row line − A·c(t)·(slow wander + c·fast tremor): ragged when c is high, quiet when low.
   Minute marks: the pen jogs for 0.12 min every minute (5-minute and hour marks larger), as a time-marking relay does.
   Held (computed): the first minute after which c < .2 for 20 minutes. Mean clash per hour computed per row.
   ════════════════════════════════════════════════════════════════════════ */
const SUB24='A stylus scratches through soot, one row per hour, ragged when loose and quiet in tune.';
const SES24=[{seed:2401,start:21,name:'1 · a long evening'},{seed:2417,start:9,name:'2 · a slow morning'},{seed:2429,start:14,name:'3 · an afternoon, interrupted'}];
const P24=M.PAL.night, C24={ink:P24.ring, soft:e6_mix(P24.ground,P24.ring,.6), dim:e6_mix(P24.ground,P24.ring,.42), soot:e6_mix(P24.ground,P24.ring,.14), soot2:e6_mix(P24.ground,P24.ring,.2), hair:e6_mix(P24.ground,P24.ring,.22), acc:P24.center};
function e6_clash24(si){ return e6_once('c24|'+si,()=>{ const S=SES24[si], R=M.rng(S.seed), tau=60+R()*70, ep=120+R()*150, eh=.22+R()*.18, ew=10+R()*18, c=new Float32Array(361);
  for(let i=0;i<=360;i++){ const v=.06+.66*Math.exp(-i/tau)+eh*Math.exp(-(((i-ep)/ew)**2))+.05*(M.noise(i*.08,S.seed%97,3)-.5); c[i]=Math.max(.03,Math.min(.85,v)); }
  let held=-1; for(let i=0;i<=340;i++){ let ok=true; for(let j=i;j<i+20;j++) if(c[j]>=.2){ ok=false; break; } if(ok){ held=i; break; } }
  const mean=[]; for(let r=0;r<6;r++){ let s=0; for(let i=r*60;i<r*60+60;i++) s+=c[i]; mean.push(s/60); }
  return {c,held,mean,tau,ep}; }); }
const lay24=e6_memo(function(w){ const T=e6_titleL(w,SUB24,w<760?560:Math.min(460,w*.42)), o=Object.assign({},T), {ph,pad,inner}=T;
  let y=T.top; if(ph){ o.stX=pad; o.stY=y; o.stW=inner; o.stH=104; y+=o.stH+28; } else { o.stW=Math.min(340,inner*.32); o.stX=pad+inner-o.stW; o.stH=104; o.stY=44; }
  o.dr=ph?{x:pad,y:y,w:inner,h:70}:{x:o.stX-24-200,y:o.stY,w:200,h:o.stH}; if(ph) y+=o.dr.h+48;
  o.lm=ph?0:58; o.rm=ph?0:92; o.shX=pad; o.shW=inner; o.rh=ph?60:66; o.scY=y+(ph?0:6); o.r0=o.scY+(ph?30:26);
  o.rows=[]; for(let r=0;r<6;r++){ const top=o.r0+r*(o.rh+(ph?22:0)); o.rows.push({top,base:top+o.rh*.56,lab:top+(ph?-6:0)}); }
  o.tx0=pad+o.lm; o.tx1=pad+inner-o.rm; o.shY0=o.scY+(ph?12:8); o.shY1=o.rows[5].top+o.rh+8; y=o.shY1+30;
  o.legY=y; y+=ph?36:18; o.foot=e6_footL(FOOT24,inner); o.footY=e6_q(y+16); o.H=e6_q(o.footY+(o.foot.length-1)*14+pad); return o; });
const FOOT24='Root · kymograph (Ludwig, 1840s): a stylus writes on a turning drum. Simplified: six one-hour rows.';
/* the scratched line: dots along the polyline at ~1.1 per px of length, a few dropped where soot flecks stayed */
function e6_trace24(L,si){ return e6_once('t24|'+si+'|'+L.inner+'|'+e6_dpr(),()=>{ const C=e6_clash24(si), S=SES24[si], A=L.rh*.44, W=L.tx1-L.tx0, X=[], Y=[], RW=[], TT=[], R=M.rng(S.seed*3+1);
  const yAt=(r,m)=>{ const t=r*60+m, i=Math.min(359,Math.floor(t)), f=t-i, c=C.c[i]*(1-f)+C.c[i+1]*f; let y=L.rows[r].base-A*c*((M.noise(t*.9,S.seed,1)-.5)*1.3+c*((M.noise(t*5.3,S.seed,2)-.5)*1.6+(M.noise(t*17,S.seed,4)-.5)*1.1));
    const mf=m-Math.floor(m); if(mf<.12){ const mi=Math.floor(m); y+=(mi===0?7:mi%5===0?4.5:2.6); } return y; };
  for(let r=0;r<6;r++){ let px=L.tx0, py=yAt(r,0); for(let m=.02;m<=60;m+=.02){ const x=L.tx0+m/60*W, y=yAt(r,m), seg=Math.hypot(x-px,y-py), n=Math.max(1,Math.round(seg*1.15));
      for(let q=1;q<=n;q++){ if(R()<.05) continue; const u=q/n; X.push(px+(x-px)*u+(R()-.5)*.35); Y.push(py+(y-py)*u+(R()-.5)*.35); RW.push(r); TT.push(r*60+m-.02*(1-u)); } px=x; py=y; } }
  const rs=[0]; for(let r=1;r<6;r++) rs.push(RW.indexOf(r)); rs.push(X.length);
  return {X:Float32Array.from(X),Y:Float32Array.from(Y),row:Uint8Array.from(RW),t:Float32Array.from(TT),rs,yAt}; }); }
function e6_base24(st,w,h){ return e6_slot(st,'base24',e6_DK(w,h)+'|'+st.session+'|'+st.speed,()=>{ const L=lay24(w), S=SES24[st.session], C=e6_clash24(st.session), {cv,g}=e6_off(w,h), ink=C24.ink, soft=C24.soft;
  M.fill(g,P24.ground); e6_title(g,L,'L-24','Pairing · smoked drum',null,'Smoked drum',ink,soft);
  /* station label block */
  { const x=L.stX, y=L.stY; e6_box(g,x,y,x+L.stW,y+L.stH,C24.hair); const hh=String(S.start).padStart(2,'0')+':00';
    [['station','MIR-01'],['component','clash, 0 to 1'],['drum','60 min a row · 6 rows'],['start',hh+' · session '+S.name.split(' · ')[0]],['playback',st.speed.toFixed(1)+'× · 1 h in '+(1.2/st.speed).toFixed(1)+' s']].forEach(([k,v],i)=>{ e6_lab(g,k,x+12,y+20+i*17,soft,9); e6_lab(g,v,x+(L.ph?100:96),y+20+i*17,ink,9,{track:.08}); }); }
  const B=new M.Buf(g);
  /* soot: dense dark tint, banded along the drum's turn (it was laid by a smoky flame while the drum spun) */
  e6_lat(B,[L.shX,L.shY0,L.shX+L.shW,L.shY1],L.ph?1.85:2.3,(x,y)=>.54+.36*(M.noise(x*.0035,y*.11,24)-.5)*2,(d,R)=>.58+.22*R(),(x,y,d)=>d>.62?C24.soot2:C24.soot,2440+st.session);
  { const D=L.dr, top=D.y+D.h*.14, bot=D.y+D.h*.86; e6_lat(B,[D.x,top,D.x+D.w,bot],2.4,()=>.55,(d,R)=>.55+.15*R(),C24.soot2,2461); }
  /* minute scale */
  const W=L.tx1-L.tx0; for(let m=0;m<=60;m+=5){ const x=L.tx0+m/60*W; for(let k=0;k<(m%10?2:4);k++) B.dot(x,L.scY+4-k*2.2,.6,C24.dim); }
  B.flush();
  for(let m=0;m<=60;m+=L.ph?20:10) e6_lab(g,m+(m===60?' min':''),L.tx0+m/60*W,L.scY-6,soft,9,{align:m===0?'left':m===60?'right':'center'});
  /* row labels: the hour each row starts, and its computed mean clash */
  L.rows.forEach((r,i)=>{ const hh=String((S.start+i)%24).padStart(2,'0')+':00';
    if(L.ph) e6_lab(g,hh,L.pad,r.top-4,ink,9); else e6_lab(g,hh,L.pad,r.base+3.5,ink,9); });
  e6_wrapT('clash high → ragged · low → quiet · minute marks are the pen’s small jogs',L.inner,Object.assign({size:9},e6_MONO)).forEach((l,i)=>e6_lab(g,l,L.pad,L.legY+i*14,soft,9));
  e6_foot(g,L.foot,L.pad,L.footY,soft); return cv; }); }
/* the trace is drawn into its own layer as the stylus writes, so a frame only adds the new dots */
function e6_frame24(g,st,w,h,t){ const L=lay24(w), C=e6_clash24(st.session), Tr=e6_trace24(L,st.session), live=t!=null;
  const rowMs=120000/e6_bpm24(st.speed), now=live?Math.min(360,t/rowMs*60):360;
  /* the whole scratch is cut once into its own canvas; a frame reveals it through a clip: the finished rows, and the current
     row up to the stylus. Nothing dirty is redrawn, so a frame costs one clipped copy */
  const tc=e6_slot(st,'tr24',e6_DK(w,h)+'|'+st.session,()=>{ const o=e6_off(w,h), B=new M.Buf(o.g); for(let i=0;i<Tr.X.length;i++) B.dot(Tr.X[i],Tr.Y[i],.6,C24.ink); B.flush(); return o.cv; });
  const done=Math.min(6,Math.floor(now/60+1e-9)), W=L.tx1-L.tx0, band=r=>[L.rows[r].base-L.rh*.62,L.rows[r].base+L.rh*.46];
  g.save(); g.beginPath(); for(let r=0;r<done;r++){ const [y0,y1]=band(r); g.rect(L.shX,y0,L.shW,y1-y0); }
  if(done<6){ const [y0,y1]=band(done), xn=L.tx0+(now-done*60)/60*W; g.rect(L.shX,y0,xn-L.shX,y1-y0); }
  g.clip(); g.setTransform(1,0,0,1,0,0); g.drawImage(tc,0,0); g.restore();
  const B2=new M.Buf(g);
  /* held: the accent, a small stippled ring where the line first goes quiet and stays quiet; it swells as the fifth locks */
  const eh=m3_env(st,'held',t,500), en=m3_env(st,'n*',t,150);
  if(C.held>=0&&now>=C.held){ const r=Math.floor(C.held/60), m=C.held-r*60, x=L.tx0+m/60*(L.tx1-L.tx0), y=L.rows[r].base; M.ring(B2,{cx:x,cy:y,R:(L.ph?7:9)*(1+.5*eh),w:1.3,swell:.2,dpl:1.6,rCore:.85,rEdge:.6,seed:2450,color:C24.acc}); }
  /* the stylus, at the write point: its tip opens on each note of the line */
  if(live&&now<360){ const r=Math.min(5,Math.floor(now/60)), m=now-r*60, x=L.tx0+m/60*(L.tx1-L.tx0), y=Tr.yAt(r,m); e6_cross(B2,x,y,2.4*(1+.9*en),C24.ink,2451,2.2); e6_seg(B2,x,y-L.rh*.5,x,y-5,C24.soft,{seed:2452,dpl:1.4,spread:.25,r:.6}); }
  /* the drum, from the side: soot, the six helical rows, the stylus; rotation shown by the turning seam */
  { const D=L.dr, ang=now/60*TAU, cxD=D.x+D.w/2, Rr=D.h*.36, top=D.y+D.h*.14, bot=D.y+D.h*.86, R=M.rng(2460);
    for(let r=0;r<6;r++){ const yy=top+(r+.5)/6*(bot-top), done=cl((now-r*60)/60); for(let x=D.x;x<D.x+D.w*done;x+=1.2) B2.dot(x,yy+(x-D.x)/D.w*(bot-top)/6,.55,C24.soft); }
    const sx=D.x+D.w*(.5+.5*Math.sin(ang)); if(Math.cos(ang)>0) for(let y=top;y<bot;y+=1.6) B2.dot(sx,y,.6,C24.dim);
    for(let y=D.y+2;y<top;y+=1.4){ B2.dot(D.x,y,.5,C24.dim); B2.dot(D.x+D.w,y,.5,C24.dim); } for(let y=bot;y<D.y+D.h-2;y+=1.4){ B2.dot(D.x,y,.5,C24.dim); B2.dot(D.x+D.w,y,.5,C24.dim); } }
  B2.flush();
  { const D=L.dr; e6_lab(g,'the drum · side view · turning',D.x,D.y+D.h+14,C24.soft,9); }
  /* each hour's mean clash, computed, printed once its row is written */
  /* each hour's label lights on its chord, and its mean lights as it prints */
  const S0=SES24[st.session]; L.rows.forEach((r,i)=>{ const eH=m3_env(st,'h'+i,t,320); if(eH>.25){ const hh=String((S0.start+i)%24).padStart(2,'0')+':00'; if(L.ph) e6_lab(g,hh,L.pad,r.top-4,C24.acc,9); else e6_lab(g,hh,L.pad,r.base+3.5,C24.acc,9); }
    if(now<(i+1)*60-1e-6) return; const m=C.mean[i], wd=e6_word(1-m/.75), eM=m3_env(st,'m'+i,t,360), mc=eM>.3?C24.acc:C24.ink;
    if(L.ph) e6_lab(g,'mean '+m.toFixed(2)+' · '+wd,L.pad+L.inner,r.top-4,eM>.3?C24.acc:C24.soft,9,{align:'right'});
    else { e6_lab(g,'mean '+m.toFixed(2),L.pad+L.inner,r.base-3,mc,9,{align:'right'}); e6_lab(g,wd,L.pad+L.inner,r.base+11,C24.soft,9,{align:'right'}); } });
  if(C.held>=0&&now>=C.held){ const r=Math.floor(C.held/60), m=C.held-r*60, x=L.tx0+m/60*(L.tx1-L.tx0), y=L.rows[r].base+(L.ph?22:L.rh*.42), S=SES24[st.session], hh=(S.start+r)%24;
    e6_lab(g,'first held · '+String(hh).padStart(2,'0')+':'+String(Math.floor(m)).padStart(2,'0'),Math.min(x,L.tx1-120),y,C24.acc,9); } }
/* music: the trace is a slow glide line. Speed is the tempo (100 BPM × Speed) and each hour is two beats, so the sheet is three
   bars; the stylus sings one note per 8th (every quarter hour): how far the line swings from its row picks the scale step around
   the hour's third, gliding between them like a Clavivox, and it sings sharp by up to 18 cents while the line is loose. Each
   hour's mean clash is its chord (loose Em7, settling G, nearly Asus4, in tune D), struck with a clock tick on the hour.
   Under it the drum's hum is a fifth, D and A, beating by clash × 18 cents until the first held minute, where it glides pure,
   locks (meet) and the stacked bass sounds once. The sheet ends home on D with the third ringing. */
const e6_bpm24=sp=>Math.round(10*sp)*10;
const e6_ch24=m=>{ const s=1-m/.75; return s<.34?'Em7':s<.6?'G':s<.8?'Asus4':'D'; };
function e6_music24(st){ const mu=M.music, bpm=e6_bpm24(st.speed), S=mu.score({bpm}), B=S.beat, row=2*B, C=e6_clash24(st.session), Ss=SES24[st.session], md=S.mode;
  const ch=C.mean.map(e6_ch24), held=C.held>=0?C.held/60*row:-1, END=6*row, sp=(st.speed-.5)/1.5, cAt=m=>C.c[Math.max(0,Math.min(360,Math.round(m)))];
  S.harm(ch.map((c,r)=>[r*row,c]).concat([[END,'D']]));
  /* the hum: a fifth that beats while loose and locks at the held minute */
  const hum=S.note(0,'drone','D3',END+200,{id:'hum',ratio:1.5,detune:cAt(0)*18,level:.38,fade:.5,cutoff:1100},null);
  const nz=S.hitSound(0,'noise',{color:.6,level:.02+.14*cAt(0),fade:.3,dur:END/1000},null);
  for(let q=1;q<=24;q++){ const t=q*B/2, m=q*15, c=cAt(m), locked=held>=0&&t>=held; if(!locked) S.set(t,'hum','detune',c*18,140); S.set(t,nz,'level',.02+.14*c,120); }
  if(held>=0){ S.set(held,'hum','detune',0,450); S.note(held,'meet','D4',1600,{ratio:1.5,spread:24,vel:.5},['held',1]); S.note(held,'bass','D2',520,{from:'A1',glide:90,env:2.6,decay:.4,vel:.56}); }
  /* hours: a clock tick and the hour's chord, a plucked root, the line re-struck */
  let vc=null; for(let r=0;r<6;r++){ const t0=r*row, sym=ch[r]; vc=mu.voice(sym,'A3','A4',3,vc);
    S.hitSound(t0,'tick',{vel:.4,tock:true},['h'+r,1]); if(r) S.hit(t0,'m'+(r-1),1); S.hitSound(t0+B,'tick',{vel:.22});
    S.chord(t0,'pad',vc,row,{attack:.1,release:.6,cutoff:800+500*sp,vel:.36});
    S.note(t0,'pluck',m3_root(sym,2),B*1.4,{cutoff:340,env:1.1,vel:.55});
    /* the line: one note per quarter hour, gliding */
    const rootDeg=Math.max(0,mu.MODES[md].indexOf((mu.pcOf(mu.parse(sym).root)-2+12)%12)); let id=null;
    for(let q=0;q<4;q++){ const t=t0+q*B/2, m=r*60+q*15, c=cAt(m);
      const v=c*((M.noise(m*.9,Ss.seed,1)-.5)*1.3+c*((M.noise(m*5.3,Ss.seed,2)-.5)*1.6)), step=Math.round(v*7);
      let n=mu.deg(md,rootDeg+2+step,4); if(q===0) n=mu.snap(sym,n); const locked=held>=0&&t>=held, f=mu.hz(n,sym)*(locked?1:m3_cents(c*18));
      if(q===0){ id='tr'+r; S.note(t,'glide',{hz:f},row*.98,{id,attack:.06,release:.25,vibrato:3+6*c,wow:1.2,flutter:.4,tone:1600+1800*sp,vel:.5,pan:-.1},['n'+(r*4),1]); }
      else { S.glide(t,id,{hz:f},B/2*.55); if(bpm<160||q===2) S.hitSound(t,'hat',{vel:.1+.12*c,decay:.02},['n'+(r*4+q),.8]); } } }
  /* home: the third rings, the chord is pure */
  S.hit(END,'m5',1); S.hitSound(END,'tick',{vel:.4,tock:true});
  S.chord(END,'pad',mu.voice('D','D4','D5',4),1500,{attack:.05,release:1.1,cutoff:1400,vel:.42});
  S.note(END,'glide','F#4',1300,{attack:.04,release:.8,vibrato:7,tone:2600,vel:.5},['n24',1]); S.note(END,'bell','F#5',2000,{ratio:3.5,vel:.36,pan:.2});
  S.note(END,'pluck','D2',700,{cutoff:340,env:1.1,vel:.58});
  S.end(END+1600); return S.out(); }
M.piece({ id:'L-24',
  caption:'Six hours of one session scratched through soot, one row per hour, ragged where it was loose and quiet where it was in tune, with red at the minute it first held. Switch Session or change Speed to replay it.',
  alt:'A dark sheet of stippled soot with six horizontal rows, each an hour. A pale scratched line runs along each row, a dense jagged scribble in the first hours that calms to a nearly straight line, with small regular jogs every minute. A red ring marks where it first held. A station label block and a small side view of the drum sit above.',
  recipe:{
    idea:'The record has no score, only a line that gets quieter, and time is counted marks on the paper itself.',
    marks:['dot','ring'],
    ground:'night',
    accent:'a small red ring where the line first goes quiet and stays quiet',
    composition:'Title block, a station label and a side view of the drum at top right; six hour rows of soot with the scratched trace, a minute scale, hour labels at left and each hour’s mean clash at right; a legend.',
    motion:'Speed is the tempo (100 BPM × Speed); each hour is two beats, so the stylus writes a row in 1.2 s ÷ Speed while the drum’s seam turns. Its tip opens on each quarter-hour note, each hour lights on its chord, each mean prints and lights as its row ends, and the red ring swells at the held minute. Reduced motion shows the full sheet.',
    sound:'The trace sings, one gliding note per quarter hour, sharp while loose. Each hour’s mean is its chord, ticked by the clock. Under it the drum hums a fifth that beats until the first held minute, then locks with the bass.',
    controls:['Session (three)','Speed 0.5–2.0×'],
    computed:['trace: y = row line − A·c(t)·(slow wander + c·fast tremor), so high clash writes ragged','minute marks: the pen jogs for 0.12 min each minute, larger at 5 minutes and on the hour','held: the first minute after which clash stays under .20 for 20 minutes','mean clash per hour'],
    placeholder:['clash series: .06 + .66·e^(−t/τ) + a seeded episode + noise','station name and start times'],
    root:'kymograph, Ludwig, 1840s',
    rules:['no score: the reading is the line itself'],
    engine:['M.ring','M.noise','M.rng','M.Buf','M.text','M.rule','M.fill']
  },
  aspect:w=>w/lay24(w).H,
  state:{session:0,speed:1},
  controls:[{id:'session',type:'select',label:'Session',play:true,options:SES24.map((S,i)=>({value:i,label:S.name}))},{id:'speed',type:'range',label:'Speed',min:.5,max:2,step:.1,fmt:v=>(+v).toFixed(1)+'×'}],
  music:e6_music24,
  /* Speed is the tempo: the drum's motor glides to its new pitch and the clock ticks one beat at the new tempo */
  musicParam(A,st,id,ov,nv){ if(id!=='speed') return false; const mu=M.music, b0=e6_bpm24(ov), b1=e6_bpm24(nv); if(b0===b1) return true; const S=m3_S(st), n=performance.now(); if(n-(S.sp||0)<70) return true; S.sp=n;
    const f=b=>mu.hz(mu.deg('ionian',Math.round((b-50)/150*7),3),'D'), now=A.now()+.006;
    A.play('glide',{when:now,freq:f(b1),from:f(b0),glide:140,dur:.42,attack:.02,release:.3,vibrato:0,tone:1600+1800*(nv-.5)/1.5,vel:.5});
    A.play('tick',{when:now,vel:.36,tock:true}); A.play('tick',{when:now+60/b1,vel:.26}); return true; },
  render(g,w,h,M,st){ e6_blit(g,e6_base24(st,w,h)); e6_frame24(g,st,w,h,null); },
  animate(g,w,h,M,st,t){ t=Math.max(0,t); e6_blit(g,e6_base24(st,w,h)); e6_frame24(g,st,w,h,t); return t<6*120000/e6_bpm24(st.speed)+900; } });


/* ════════════════════════════════════════════════════════════════════════
   L-25 · Two drums · a two-color stencil print of the Mir field: carbon (blue) and silicon (fluorescent pink).
   Both drums sample ONE blue-noise base (Poisson, so no period: a lattice would re-register falsely at every multiple of its
   spacing). Each point is inked by a drum if a shared seeded draw u < density × that drum's own inking (low-frequency noise),
   so where both drums print the same point at zero offset they land exactly together.
   Third color (computed): multiply, channel by channel, carbon × silicon ÷ 255. Drawn with 'multiply' compositing, so the
   overlap is the real product per pixel. Overlap share (computed): silicon dots whose center falls inside a carbon dot.
   Registration offset = clash: 0 px in tune, 12 px loose (placeholder mapping, clash = offset ÷ 12).
   ════════════════════════════════════════════════════════════════════════ */
const SUB25='Carbon and silicon printed from two ink drums, with a third color where both land.';
const INK25={carbon:'#3a6ee8', silicon:'#ff4f97'}; INK25.both=e6_mul(INK25.carbon,INK25.silicon);
const P25=M.PAL.paper, C25={ink:P25.ink, soft:P25.soft, hair:e6_mix(P25.ground,P25.ink,.16), stock:'#ffffff'};
const ANG25=-.62;
const lay25=e6_memo(function(w){ const T=e6_titleL(w,SUB25,520,480), o=Object.assign({},T), {ph,pad,inner}=T;
  o.sx=pad; o.sy=T.top; o.sw=inner; const m=ph?28:36; o.m=m; o.img=o.sw-2*m; o.ix=o.sx+m; o.iy=o.sy+m; o.colY=o.iy+o.img+(ph?30:34); o.sh=o.colY-o.sy+(ph?26:28);
  let y=o.sy+o.sh+32; o.swY=y; y+=64; o.stY=y; y+=34; o.foot=e6_footL(FOOT25,inner); o.footY=e6_q(y+12); o.H=e6_q(o.footY+(o.foot.length-1)*14+pad); return o; });
const FOOT25='Root · stencil duplicating: one ink drum per color pushes ink through a cut stencil. Simplified: two drums.';
function e6_dots25(L){ return e6_once('d25|'+L.img+'|'+e6_dpr(),()=>{ const s=L.img, sp=L.ph?2.1:2.35, P=M.poisson([0,0,s,s],sp,2501), R=M.rng(2502), cx=s/2, cy=s/2, Rm=s*.47, n=8, step=Rm/n, bw=Math.max(3.4,step*.46);
  const C=[], S=[], Bth=[];
  for(let i=0;i<P.length;i+=2){ const x=P[i], y=P[i+1], dx=x-cx, dy=y-cy, d=Math.hypot(dx,dy); if(d>Rm+bw) { R(); R(); R(); R(); continue; }
    const f=d/step, near=Math.abs(f-Math.round(f))*step, ri=Math.round(f); let den=ri>=1&&ri<=n?(1-M.ss(bw*.3,bw*.55,near))*(.8+.2*(1-ri/n)):0;
    /* blades between rings 3 and 5, eight of them */
    /* blades: lenses pointing out from the center, between the second and fifth rings, set in the gaps between bands */
    const a=Math.atan2(dy,dx), sector=((a/TAU*8+8.5)%1-.5)*TAU/8*d; if(d>step*1.7&&d<step*4.9){ const u=(d-step*3.3)/(step*1.6), hw=step*.62*Math.sqrt(Math.max(0,1-u*u)); if(Math.abs(sector)<hw-.8) den=Math.max(den,.78*(1-M.ss(hw-1.6,hw-.8,Math.abs(sector)))); }
    if(d<step*.75&&d>step*.42) den=Math.max(den,.9);
    const u=R(), inkC=.82+.36*(M.noise(x*.018,y*.018,31)-.5), inkS=.82+.36*(M.noise(x*.018+40,y*.018,37)-.5), rc=.9+.42*R(), rs=.9+.42*R();
    if(den<=0) continue;
    if(u<den*inkC) C.push(x,y,rc); if(u<den*inkS) S.push(x,y,rs); if(u<den*inkC&&u<den*inkS) Bth.push(x,y,Math.min(rc,rs)); }
  /* a spatial hash of carbon dots for the overlap count */
  const cell=3, gw=Math.ceil(s/cell)+2, nC=C.length/3, cnt=new Int32Array(gw*gw+1), key=new Int32Array(nC);
  for(let i=0;i<nC;i++){ const k=(((C[i*3+1]/cell)|0)+1)*gw+((C[i*3]/cell)|0)+1; key[i]=k; cnt[k+1]++; } for(let k=0;k<gw*gw;k++) cnt[k+1]+=cnt[k];
  const fill=cnt.slice(), idx=new Int32Array(nC); for(let i=0;i<nC;i++) idx[fill[key[i]]++]=i*3;
  return {C:Float32Array.from(C),S:Float32Array.from(S),both:Float32Array.from(Bth),start:cnt,idx,cell,gw}; }); }
function e6_overlap25(D,dx,dy){ let hit=0; const n=D.S.length/3;
  for(let i=0;i<D.S.length;i+=3){ const x=D.S[i]+dx, y=D.S[i+1]+dy, gx=((x/D.cell)|0)+1, gy=((y/D.cell)|0)+1; let ok=false;
    if(gx<1||gy<1||gx>=D.gw-1||gy>=D.gw-1) continue;
    for(let yy=gy-1;yy<=gy+1&&!ok;yy++) for(let xx=gx-1;xx<=gx+1&&!ok;xx++){ const k=yy*D.gw+xx; for(let q=D.start[k];q<D.start[k+1];q++){ const j=D.idx[q], ex=D.C[j]-x, ey=D.C[j+1]-y, r=D.C[j+2]; if(ex*ex+ey*ey<r*r){ ok=true; break; } } }
    if(ok) hit++; } return n?hit/n:0; }
function e6_base25(st,w,h){ return e6_slot(st,'base25',e6_DK(w,h),()=>{ const L=lay25(w), {cv,g}=e6_off(w,h), ink=C25.ink, soft=C25.soft;
  M.fill(g,P25.ground); e6_title(g,L,'L-25','Pairing · two-drum stencil',null,'Two drums',ink,soft);
  M.fill(g,C25.stock,L.sx,L.sy,L.sw,L.sh); e6_box(g,L.sx,L.sy,L.sx+L.sw,L.sy+L.sh,C25.hair);
  /* colophon: the print's brand surface. The wordmark, one flat color, clear space kept */
  const xh=L.ph?7.5:8.5, cy=L.colY; M.logo(g,L.ix,cy,xh,{color:ink}); const gw=M.logoGeo(L.ix,cy,xh).w;
  e6_lab(g,L.ph?'two drums':'two drums · carbon / silicon',L.ix+gw+xh*1.6,cy,soft,9);
  /* ink swatches, printed the same way */
  const sw=L.ph?Math.floor((L.inner-24)/3):Math.min(150,Math.floor((L.inner-32)/3)), B=new M.Buf(g); const R=M.rng(2520);
  [['carbon',INK25.carbon,1,0],['silicon',INK25.silicon,0,1],['both',INK25.both,1,1]].forEach(([k,c,a,b],i)=>{ const x=L.pad+i*(sw+(L.ph?12:16)), y=L.swY;
    e6_lab(g,k,x,y,ink,9); e6_lab(g,c,x,y+14,soft,9,{upper:false,track:.04});
    const yy=y+22, hh=22; for(let q=0;q<sw*hh*.34;q++){ const px=x+R()*sw, py=yy+R()*hh; if(a) B.dot(px,py,.75,INK25.carbon); } });
  B.flush(); g.save(); g.globalCompositeOperation='multiply'; const B2=new M.Buf(g), R2=M.rng(2520); [[1,0],[0,1],[1,1]].forEach(([a,b],i)=>{ const x=L.pad+i*(sw+(L.ph?12:16)), y=L.swY+22, hh=22; for(let q=0;q<sw*hh*.34;q++){ const px=x+R2()*sw, py=y+R2()*hh; if(b) B2.dot(px,py,.75,INK25.silicon); } }); B2.flush(); g.restore();
  e6_foot(g,L.foot,L.pad,L.footY,soft); return cv; }); }
/* time is the music's: 96 BPM. The silicon drum runs in over two beats (outCubic) past register by 10%, holds half a beat, and
   settles in a beat and a half (inOutCubic), so it registers on the downbeat of bar 2 */
const BPM25=96, B25=60000/BPM25, RG25=4*B25, END25=8*B25;
function e6_off25(st,t){ const from=st.reg>=6?0:12, to=st.reg, t1=to+(to-from)*.1; return t<2*B25?lerp(from,t1,E.outCubic(t/(2*B25))):t<2.5*B25?t1:t<RG25?lerp(t1,to,E.inOutCubic((t-2.5*B25)/(1.5*B25))):to; }
function e6_frame25(g,st,w,h,t){ const L=lay25(w), D=e6_dots25(L);
  let off=st.reg; if(t!=null) off=e6_off25(st,t);
  const ec=m3_env(st,'c*',t,160), es=m3_env(st,'s*',t,160), el=m3_env(st,'lock',t,520);
  /* off is signed: the drums overshoot through register to the other side before settling */
  const dx=Math.cos(ANG25)*off, dy=-Math.sin(ANG25)*off, ox=L.ix, oy=L.iy; off=Math.abs(off);
  const B=new M.Buf(g); for(let i=0;i<D.C.length;i+=3) B.dot(ox+D.C[i],oy+D.C[i+1],D.C[i+2],INK25.carbon);
  const m=L.m*.5, cs=L.ph?5:6, corners=[[L.sx+m,L.sy+m],[L.sx+L.sw-m,L.sy+m],[L.sx+m,L.sy+L.sh-m],[L.sx+L.sw-m,L.sy+L.sh-m]];
  corners.forEach(([x,y],q)=>e6_cross(B,x,y,cs*(1+.45*ec),INK25.carbon,2530+q,1.6)); B.flush();
  g.save(); g.globalCompositeOperation='multiply'; const B2=new M.Buf(g); for(let i=0;i<D.S.length;i+=3) B2.dot(ox+D.S[i]+dx,oy+D.S[i+1]+dy,D.S[i+2],INK25.silicon);
  corners.forEach(([x,y],q)=>e6_cross(B2,x+dx,y+dy,cs*(1+.45*es),INK25.silicon,2540+q,1.6)); B2.flush(); g.restore();
  /* at the lock, the points both drums print flash in the third color */
  if(el>.04&&Math.abs(off)<.25){ const B3=new M.Buf(g); for(let i=0;i<D.both.length;i+=3) B3.dot(ox+D.both[i],oy+D.both[i+1],D.both[i+2]*(1+.7*el),INK25.both); B3.flush(); }
  /* the numbers, beside the marks */
  const fx=v=>(v>=0?'+':'−')+Math.abs(v).toFixed(1); e6_lab(g,'Δ '+fx(dx)+' · '+fx(dy)+' px',L.sx+m+cs*2.2+4,L.sy+m+3.5,C25.soft,9,{track:.06});
  const ov=e6_overlap25(D,dx,dy), clash=off/12;
  e6_lab(g,'registration '+off.toFixed(1)+' px · clash '+clash.toFixed(2)+' · '+(off<.25?'in tune':clash<.5?'settling':'loose'),L.pad,L.stY,off<.25?C25.ink:C25.ink,9,{track:.08});
  e6_lab(g,Math.round(ov*100)+'% of silicon dots land on carbon',L.pad,L.stY+15,C25.soft,9,{track:.08}); }
/* music: two-colour printing is two voices in unison. 96 BPM, two bars. The carbon drum plays the motif while loose, 5 ↑ 1 ↑ 4,
   on Clavivox-like glides; the silicon drum prints the same line, late by the offset (4 ms a pixel, a flam) and sharp or flat
   by it (clash × 30 cents, signed), following the offset every 16th: apart they beat, the overshoot carries the pitch past
   unison and back, and as the drums register the beats slow to nothing. A rim per beat on each drum is the flam, heard closing;
   the roller turns under them at the drum's speed. Registered on the downbeat: the 4 falls to the third, the two voices lock
   (meet), the chord blooms with the bass once. Left misregistered, the line stays suspended and the beating fades unresolved. */
const e6_c25=off=>off/12*30, e6_fl25=off=>Math.abs(off)*4;
function e6_music25(st){ const mu=M.music, S=mu.score({bpm:BPM25}), B=B25, inn=st.reg<.25, s16=B/4, off=t=>e6_off25(st,t);
  S.harm([[0,'Dsus4'],[RG25,inn?'D':'Dsus4']]);
  const roll=S.hitSound(0,'roller',{dur:RG25/1000+.25,rate:3,vel:.42},null);
  for(let t=s16;t<RG25;t+=s16){ const sp=Math.abs(off(t+20)-off(t))/.02; S.set(t,roll,'rate',2+Math.min(14,sp*.45),60); S.set(t,roll,'level',.1+Math.min(.8,sp/30*.8),60); }
  S.chord(0,'pad',mu.voice('Dsus4','A3','A4',3),RG25,{attack:.3,release:.4,cutoff:900,vel:.42});
  S.note(0,'pluck','D2',B*1.6,{cutoff:360,env:1.1,vel:.56});
  /* the line, printed twice */
  const line=[[0,'A4',B],[B,'D5',B],[2*B,'G5',inn?3*B:4*B]], vo={attack:.03,release:.35,vibrato:0,wow:0,flutter:0,tone:3000};
  line.forEach(([t,n,d],k)=>{ const f=mu.hz(n,'Dsus4'), o=off(t), ts=t+e6_fl25(o);
    S.note(t,'glide',{hz:f},d,Object.assign({id:'c'+k,vel:.68,pan:-.25},vo),['c'+k,1]);
    S.note(ts,'glide',{hz:f*m3_cents(e6_c25(o))},d-(ts-t),Object.assign({id:'s'+k,vel:.64,pan:.25},vo),['s'+k,1]);
    for(let u=ts+s16;u<t+d;u+=s16) S.set(u,'s'+k,'freq',f*m3_cents(e6_c25(off(u))),70); });
  /* the flam: one rim per drum per beat, the silicon one late by the offset */
  for(let b=0;b<4;b++){ const t=b*B, o=off(t); S.hitSound(t,'rim',{vel:.44,tune:.92,pan:-.3},['c'+(9+b),1]); S.hitSound(t+e6_fl25(o),'rim',{vel:.4,tune:.92,pan:.3},['s'+(9+b),1]); if(b%2===0) S.hitSound(t,'kick',{vel:b?.3:.4}); }
  if(inn){ /* registered: the 4 falls to the third in both voices, they lock, the chord blooms, the bass once */
    S.glide(RG25,'c2',{hz:mu.hz('F#5','D')},140); S.glide(RG25,'s2',{hz:mu.hz('F#5','D')},140);
    S.note(RG25,'meet','F#4',2200,{spread:30,vel:.5},['lock',1]); S.hitSound(RG25,'rim',{vel:.36,tune:.92});
    S.chord(RG25,'pad',mu.voice('Dadd9','D4','E5',4),2600,{attack:.05,release:1.2,cutoff:1500,vel:.44});
    S.note(RG25,'bass','D2',600,{from:'A1',glide:90,env:2.8,decay:.4,vel:.58}); S.note(RG25+s16*2,'bell','A5',2000,{ratio:3.5,vel:.34,pan:.3});
    S.note(RG25+B,'mallet','D5',1400,{vel:.4,trem:5,pan:-.2}); S.note(RG25+2*B,'mallet','A5',1400,{vel:.36,trem:5,pan:.2}); }
  else { /* left apart: the drums stop, the line stays suspended, still beating, and fades */
    const o=st.reg; S.hitSound(RG25,'rim',{vel:.32,tune:.92,pan:-.3},['c13',1]); S.hitSound(RG25+e6_fl25(o),'rim',{vel:.28,tune:.92,pan:.3},['s13',1]);
    S.chord(RG25,'pad',mu.voice('Dsus4','A3','A4',3),2*B,{attack:.05,release:1.2,cutoff:850,vel:.42}); S.note(RG25,'pluck','D2',B*1.6,{cutoff:340,env:1.1,vel:.6}); S.note(RG25+2*B,'mallet','A4',1400,{vel:.44,trem:5,pan:-.2}); }
  S.end(END25); return S.out(); }
M.piece({ id:'L-25',
  caption:'The Mir field as a two-color stencil print, carbon on one drum and silicon on the other, with a third color where both land together. Slide Registration to pull the prints apart into blue and pink ghosts.',
  alt:'A white print on a paper plate: a stippled ring field with eight blades, printed in a blue and a pink ink. Where the dots of both inks coincide they turn a deep violet. Crosshair registration marks sit in the four corners, the pink one offset from the blue by the registration amount, with the offset in pixels. Below, three ink swatches and the overlap share.',
  recipe:{
    idea:'The shared color is the product of two inks where both land, and registration is tuning: in tune is the moment the two prints become one.',
    marks:['ring','blade','center'],
    ground:'paper, with a white print',
    accent:'the third color, carbon × silicon, wherever both drums print the same point',
    composition:'A white print with the field centered, crosshair registration marks in the corners and a colophon with the wordmark; three ink swatches and the registration readout below.',
    motion:'On a 96 BPM grid: the silicon drum slides from 12 px (or 0) through register with a 10% overshoot (two beats, outCubic), holds half a beat, then settles to the set value (a beat and a half, inOutCubic), registering on the downbeat. Marks flash on each drum’s beat; at register the shared points flash. Reduced motion shows the set registration.',
    sound:'Two drums are two voices in unison: the silicon one is late and out of tune by the offset, so the motif beats and flams, overshoots and closes. In register, the 4 falls to the third and the chord blooms; left apart, it stays suspended.',
    controls:['Registration 0–12 px'],
    computed:['both drums sample one blue-noise base; a point is inked when a shared seeded draw u < density × that drum’s inking (low-frequency noise)','third color = carbon × silicon ÷ 255 per channel, drawn with multiply compositing','overlap: share of silicon dots whose center falls inside a carbon dot'],
    placeholder:['clash = registration ÷ 12 px'],
    root:'stencil duplicating',
    rules:['a Poisson base, never a lattice, so an offset never re-registers falsely'],
    engine:['M.poisson','M.noise','M.ss','M.ring','M.logo','M.logoGeo','M.Buf','M.rng','M.ease.outCubic','M.ease.inOutCubic','M.text','M.rule','M.fill']
  },
  aspect:w=>w/lay25(w).H,
  state:{reg:0},
  controls:[{id:'reg',type:'range',label:'Registration',min:0,max:12,step:.5,fmt:v=>(+v).toFixed(1)+' px'}],
  music:e6_music25,
  /* Registration is detune and flam: dragging holds the two voices in unison, apart by the offset in cents, with the flam
     struck as you go; reaching 0 locks them and the third blooms */
  musicParam(A,st,id,ov,nv){ if(id!=='reg') return false; const S=m3_S(st), now=A.now()+.006, mu=M.music;
    if(!S.pair||!S.pair.alive){ S.pair=A.play('drone',{when:now,freq:mu.hz('D4','D'),ratio:1,detune:e6_c25(nv),level:.5,fade:.08,cutoff:1600}); S.lk=nv<.25; }
    else S.pair.set('detune',e6_c25(nv),40);
    const n=performance.now(); if(n-(S.fl||0)>170){ S.fl=n; A.play('rim',{when:now,vel:.32,tune:.92,pan:-.3}); A.play('rim',{when:now+e6_fl25(nv)/1000,vel:.28,tune:.92,pan:.3}); }
    if(nv<.25&&!S.lk){ A.play('meet',{when:now,freq:mu.hz('F#4','D'),spread:30,dur:1.6,vel:.5}); A.play('bell',{when:now+.12,freq:mu.hz('A5','D'),vel:.32,dur:1.8}); } S.lk=nv<.25;
    clearTimeout(S.to); const p=S.pair; S.to=setTimeout(()=>{ if(p&&p.alive) p.stop(null,1); },1600); return true; },
  render(g,w,h,M,st){ e6_blit(g,e6_base25(st,w,h)); e6_frame25(g,st,w,h,null); },
  animate(g,w,h,M,st,t){ t=Math.max(0,t); e6_blit(g,e6_base25(st,w,h)); e6_frame25(g,st,w,h,t); return t<RG25+1400; } });

})();
