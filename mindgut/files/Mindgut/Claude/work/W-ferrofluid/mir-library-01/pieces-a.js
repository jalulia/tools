/* agent A pieces · round 2 · L-01, L-02, L-07, L-08, L-09
   Each piece: a settled still (render), one orchestrated move (animate), and 2–4 controls that are its design program. */
(function(){
'use strict';
const M=window.MIR, S=window.MIR_SPEC, TAU=Math.PI*2;
const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── A helpers (agent A only) ── */
let A_mc=null; const A_m=()=>{ if(!A_mc){ A_mc=document.createElement('canvas').getContext('2d'); A_mc.dpr=1; } return A_mc; };
function A_cap(g){ return {g, a:[], dot(x,y,r,c){ this.a.push(x,y,Math.max(r,g?M.minR(g):.55),c); }}; }
function A_lines(g,lines,x,y,lh,o){ lines.forEach((l,i)=>M.text(g,l,x,y+i*lh,o)); return lines.length*lh; }
function A_shuffle(n,seed){ const R=M.rng(seed), o=new Uint32Array(n); for(let i=0;i<n;i++) o[i]=i; for(let i=n-1;i>0;i--){ const j=(R()*(i+1))|0, t=o[i]; o[i]=o[j]; o[j]=t; } return o; }
const A_fmt=n=>n.toLocaleString('en-US');
const A_b=v=>Math.round(v/4)*4;
const A_g=v=>Math.exp(-v*v);
/* wrap measured with the tracking the line will be set in (canvas letterSpacing), so tracked mono never runs past its measure */
function A_wrapT(str,maxW,o){ const g=A_m(), tr=(o.track??.06)*(o.size||11), ls='letterSpacing' in g; if(ls) g.letterSpacing=tr+'px'; const L=M.wrap(g,str,ls?maxW:maxW/(1+tr/((o.size||11)*.6)),o); if(ls) g.letterSpacing='0px'; return L; }                                   /* the 4 px baseline grid */
const A_c=st=>{ if(!st._c) Object.defineProperty(st,'_c',{value:{},writable:true,enumerable:false}); return st._c; };   /* per-frame cache, never copied */
const A_t=(st,k,v)=>Object.defineProperty(st,k,{value:v,writable:true,enumerable:false,configurable:true});             /* transient state, never copied */
const MONO=(size,color,o={})=>Object.assign({font:'mono',size,upper:true,track:.12,color},o);
const DISP=(size,color,o={})=>Object.assign({size,weight:300,track:size>=40?-.04:size>=24?-.025:-.01,color},o);

/* color: hex → rgb (cached) and a tint of the ground toward the ink (secondary dots are tints, never gray salt) */
const A_rgbC=new Map();
function A_rgb(c){ let v=A_rgbC.get(c); if(v) return v; let s=String(c).replace('#',''); if(s.length===3) s=s.replace(/./g,'$&$&'); const n=parseInt(s,16); v=[(n>>16)&255,(n>>8)&255,n&255]; A_rgbC.set(c,v); return v; }
function A_mix(a,b,t){ const A=A_rgb(a), B=A_rgb(b); return '#'+A.map((x,i)=>Math.round(x+(B[i]-x)*t).toString(16).padStart(2,'0')).join(''); }

/* A_Ras: a dot rasteriser with the Buf API. Anti-aliased discs written straight into device pixels, then one putImageData.
   Same crisp disc as an arc fill, about 4× faster than path arcs in a software canvas, which keeps animation frames in budget.
   Draw type and hairlines after flush() (putImageData replaces pixels). */
const A_imgC=new Map();
function A_Ras(g,bg,box){ const d=g.dpr, cw=g.canvas.width, ch=g.canvas.height, b=box||[0,0,cw/d,ch/d];
  this.px0=Math.max(0,Math.floor(b[0]*d)); this.py0=Math.max(0,Math.floor(b[1]*d)); this.PW=Math.max(1,Math.min(cw,Math.ceil(b[2]*d))-this.px0); this.PH=Math.max(1,Math.min(ch,Math.ceil(b[3]*d))-this.py0);
  const key=this.PW+'x'+this.PH; let img=A_imgC.get(key); if(!img){ if(A_imgC.size>8) A_imgC.clear(); img=g.createImageData(this.PW,this.PH); A_imgC.set(key,img); }
  this.img=img; this.u=new Uint32Array(img.data.buffer); this.g=g; this.d=d; this.mr=M.minR(g); if(bg) this.clear(bg); }
A_Ras.prototype.clear=function(bg){ const c=A_rgb(bg); this.u.fill((0xff000000|(c[2]<<16)|(c[1]<<8)|c[0])>>>0); };
A_Ras.prototype.rect=function(x0,y0,x1,y1,col){ const d=this.d, c=A_rgb(col), v=(0xff000000|(c[2]<<16)|(c[1]<<8)|c[0])>>>0, X0=Math.max(0,Math.round(x0*d)-this.px0), X1=Math.min(this.PW,Math.round(x1*d)-this.px0), Y0=Math.max(0,Math.round(y0*d)-this.py0), Y1=Math.min(this.PH,Math.round(y1*d)-this.py0);
  for(let y=Y0;y<Y1;y++) this.u.fill(v,y*this.PW+X0,y*this.PW+X1); };
A_Ras.prototype.dot=function(x,y,r,col){ const d=this.d, X=x*d-this.px0, Y=y*d-this.py0, rr=(r<this.mr?this.mr:r)*d, PW=this.PW, PH=this.PH, lim=rr+.5, l2=lim*lim;
  let x0=Math.floor(X-lim), x1=Math.ceil(X+lim), y0=Math.floor(Y-lim), y1=Math.ceil(Y+lim); if(x0<0) x0=0; if(y0<0) y0=0; if(x1>PW-1) x1=PW-1; if(y1>PH-1) y1=PH-1; if(x0>x1||y0>y1) return;
  const C=A_rgb(col), cr=C[0], cg=C[1], cb=C[2], full=(0xff000000|(cb<<16)|(cg<<8)|cr)>>>0, u=this.u;
  for(let yy=y0;yy<=y1;yy++){ const dy=yy+.5-Y, dy2=dy*dy; let o=yy*PW+x0; for(let xx=x0;xx<=x1;xx++,o++){ const dx=xx+.5-X, q=dx*dx+dy2; if(q>=l2) continue; const a=lim-Math.sqrt(q);
    if(a>=1){ u[o]=full; continue; } const p=u[o], R=p&255, G=(p>>8)&255, B=(p>>16)&255; u[o]=(0xff000000|(((B+(cb-B)*a)|0)<<16)|(((G+(cg-G)*a)|0)<<8)|((R+(cr-R)*a)|0))>>>0; } } };
A_Ras.prototype.flush=function(){ this.g.putImageData(this.img,this.px0,this.py0); };
A_Ras.prototype.snap=function(){ return this.u.slice(); };
A_Ras.prototype.load=function(a){ this.u.set(a); };


/* blue-noise stipple on one cached Poisson set per (w,h,sp,seed), offset to any box: area tone without salt; rOf adds size (AM on FM) */
function A_blue(B,o){ const P=(o.w*o.h>90000?A_pbox:(w,h,sp,sd)=>M.poisson([0,0,w,h],sp,sd))(Math.ceil(o.w),Math.ceil(o.h),o.sp,o.seed||1), R=M.rng((o.seed||1)*977+(o.salt||0)), col=o.color;
  for(let i=0;i<P.length;i+=2){ const x=P[i]+o.ox, y=P[i+1]+o.oy, d=o.density(x,y); if(d<=0||R()>=d) continue; const c=typeof col==='function'?col(x,y,d,R):col; if(!c) continue; B.dot(x,y,o.rOf?o.rOf(d,R):o.r,c); } }
/* a seamless (toroidal) Poisson-disc tile: distances wrap, so tiles repeat with no seams and the minimum spacing holds across borders.
   Tiling it gives blue noise over any box for the cost of one small tile; per-dot thinning hides the 192 px period. */
const A_tileC=new Map();
function A_ptile(T,sp,seed){ const key=T+'|'+sp+'|'+seed; if(A_tileC.has(key)) return A_tileC.get(key);
  const cs=sp/Math.SQRT2, gw=Math.ceil(T/cs), grid=new Int32Array(gw*gw).fill(-1), pts=[], act=[], R=M.rng(seed), sp2=sp*sp, cw=T/gw;
  const put=(x,y)=>{ const i=pts.length; pts.push(x,y); grid[((y/cw)|0)%gw*gw+((x/cw)|0)%gw]=i; act.push(i); }; put(R()*T,R()*T);
  while(act.length){ const ai=(R()*act.length)|0, i=act[ai], px=pts[i], py=pts[i+1]; let ok=false;
    for(let t=0;t<24;t++){ const a=R()*TAU, d=sp*(1+R()); let x=px+Math.cos(a)*d, y=py+Math.sin(a)*d; x=(x%T+T)%T; y=(y%T+T)%T; const gx=(x/cw)|0, gy=(y/cw)|0; let far=true;
      for(let yy=-2;yy<=2&&far;yy++) for(let xx=-2;xx<=2;xx++){ const j=grid[((gy+yy+gw)%gw)*gw+((gx+xx+gw)%gw)]; if(j>=0){ let dx=Math.abs(pts[j]-x), dy=Math.abs(pts[j+1]-y); if(dx>T/2) dx=T-dx; if(dy>T/2) dy=T-dy; if(dx*dx+dy*dy<sp2){ far=false; break; } } }
      if(far){ put(x,y); ok=true; break; } }
    if(!ok){ act[ai]=act[act.length-1]; act.pop(); } }
  const out=Float32Array.from(pts); if(A_tileC.size>12) A_tileC.clear(); A_tileC.set(key,out); return out; }
/* blue-noise points over a box [0,w]×[0,h] from the tile (returns a flat x,y array, in box coordinates) */
function A_pbox(w,h,sp,seed){ const T=192, P=A_ptile(T,sp,seed), out=[]; for(let ty=0;ty<h;ty+=T) for(let tx=0;tx<w;tx+=T) for(let i=0;i<P.length;i+=2){ const x=P[i]+tx, y=P[i+1]+ty; if(x<w&&y<h) out.push(x,y); } return Float32Array.from(out); }
/* a stippled curve with amplitude modulation: dots on the line are fuller, dots that stray off it are finer */
function A_curve(B,R,cv,o){ const n=o.n|0, sp=o.sp??.6;
  for(let i=0;i<n;i++){ const t=(i+R())/n, [x,y,nx,ny]=cv(t), k=R.gauss()*sp; B.dot(x+nx*k,y+ny*k,o.r*(1.18-.5*Math.min(1,Math.abs(k)/(1.8*sp+1e-6))),o.color); } }
/* corner ticks: a hairline viewport without a box */
function A_ticks(g,x0,y0,x1,y1,len,col){ [[x0,y0,1,1],[x1,y0,-1,1],[x0,y1,1,-1],[x1,y1,-1,-1]].forEach(([x,y,sx,sy])=>{ M.rule(g,x,y,x+sx*len,y,col,1); M.rule(g,x,y,x,y+sy*len,col,1); }); }

/* ── M1 music helpers. Scores are composed by each piece's music(); these serve the immediate answers (pointer, parameters).
   m1_au returns the engine only while sound is on and this piece is audible (not muted, on screen), so nothing sounds by accident. ── */
const m1_F=new Map();
function m1_au(id){ const a=M.audio; if(!a||!a.enabled||!a.unlocked||!M.music) return null; let f=m1_F.get(id); const W=window.__mir;
  if(!f&&W&&W.frames){ f=W.frames.find(x=>x.p.id===id); if(f) m1_F.set(id,f); } if(f&&(f.muted||!(f.ratio>0))) return null; return a; }
/* transient per-state memo for held voices and rate limits (non-enumerable: never copied, Reset makes a new one) */
function m1_T(st){ if(!Object.prototype.hasOwnProperty.call(st,'_m1')) Object.defineProperty(st,'_m1',{value:{},writable:true,configurable:true,enumerable:false}); return st._m1; }
const m1_rl=(T,k,ms)=>{ const n=performance.now(); if(T['r_'+k]&&n-T['r_'+k]<ms) return false; T['r_'+k]=n; return true; };
/* the in-tune chord of a mode: minor where the mode's third is minor */
const m1_home=md=>md==='dorian'||md==='aeolian'?'Dm':'D';
/* a score note from a midi number, tuned over chord sym (or the score's chord at t), with an optional detune in cents */
function m1_sn(S,t,ins,m,dur,o,hit,sym){ const op=Object.assign({},o||{}), c=op.cents||0; delete op.cents; return S.note(t,ins,{hz:M.music.hz(m,sym||S.chordAt(t))*Math.pow(2,c/1200)},dur,op,hit); }
/* the same, played now on the piece's bus (pointer answers); returns the voice handle */
function m1_pn(a,id,ins,m,dur,o,when,sym){ const op=Object.assign({},o||{}), c=op.cents||0; delete op.cents; if(op.from!=null&&op.from<128) op.from=M.music.hz(op.from,sym);
  op.freq=M.music.hz(m,sym)*Math.pow(2,c/1200); op.dur=dur/1000; op.when=when; return a.play(id,ins,op); }

/* ════════════════════════════════════════════════════════════════
   L-01 · Mir, defined · the ten marks as a specimen plate
   Every specimen is captured once per width as dots with a color role, so Ground (rule G) only recolors, and the
   assembly animation eases each dot from a loose, stray position into its mark, staggered as a diagonal wave across the grid.
   ════════════════════════════════════════════════════════════════ */
const ROLES=['ink','soft','tint','center','blade'];
function A_roles(P){ return {ink:P.ink, soft:A_mix(P.ground,P.ink,.5), tint:A_mix(P.ground,P.ink,.26), center:P.center, blade:P.blade}; }
const SPEC01={
  /* the dot: one strand, and the first two rings it starts. Below it (type pass) the wordmark, with a hairline to the i's tittle:
     the field begins at the i. The strand is drawn here, never on or beside the letters (clear space holds). */
  dot(B,cx,cy,s,R,r,ov){ const y=cy-s*.14, rr=s*.07;
    A_blue(B,{ox:cx-rr-2,oy:y-rr-2,w:2*rr+4,h:2*rr+4,sp:1.05,seed:5,salt:40,density:(x,yy)=>Math.hypot(x-cx,yy-y)<rr-r*.5?.94:0,rOf:(d,Rr)=>r*(.85+.3*Rr()),color:'ink'});
    [2.05,3.25].forEach((f,i)=>M.ring(B,{cx,cy:y,R:rr*f,w:1.4,swell:.45,dpl:i?.7:1.05,rCore:r*1.05,rEdge:r*.55,seed:51+i,color:i?'tint':'soft'}));
    ov.logo={cx,cy:y,rr:rr*3.25}; },
  stray(B,cx,cy,s,R,r){ const ox=cx-s*.5, oy=cy+s*.5;            /* a corner of the field; strays out at the edge, one drifting in */
    [0,1,2].forEach(q=>{ const rad=s*(.74-q*.11); A_curve(B,R,t=>M.curve.ring(ox,oy,rad)(-.25+t*.25),{n:Math.round(rad*TAU*.25/(1.05+q*.25)),sp:.55,r,color:q?'tint':'soft'}); });
    [[.22,-.32,1.9],[.36,-.1,1.4],[.04,-.42,1.2],[.42,-.38,2.2],[.3,.14,1.3],[.43,.04,1.7],[-.16,-.32,1.5]].forEach(([dx,dy,k])=>B.dot(cx+dx*s,cy+dy*s,r*k,'ink'));
    const sx=cx+.12*s, sy=cy-.12*s; B.dot(sx,sy,r*2,'ink'); for(let i=1;i<=4;i++) B.dot(sx+i*s*.035,sy-i*s*.035,r*(1.5-i*.22),'tint'); },
  /* engraved rings (M.ring): stratified along, gaussian across, dots shrinking toward the edges: a dense core and soft edges */
  ring(B,cx,cy,s,R,r){ [.42,.31,.2].forEach((f,i)=>M.ring(B,{cx,cy,R:s*f,w:Math.max(2.2,s*.014),swell:.35,dpl:1.9,rCore:r*1.2,rEdge:r*.5,seed:31+i*7,wobble:.008,color:'ink'})); },
  center(B,cx,cy,s,R,r){ M.ring(B,{cx,cy,R:s*.4,w:1.6,swell:.3,dpl:.62,rCore:r*.95,rEdge:r*.6,seed:44,wobble:.006,color:'tint'});
    M.ring(B,{cx,cy,R:s*.27,w:1.6,swell:.3,dpl:.78,rCore:r,rEdge:r*.6,seed:45,wobble:.006,color:'soft'});
    M.ring(B,{cx,cy,R:s*.14,w:2.2,swell:.2,dpl:2.2,rCore:r*1.2,rEdge:r*.5,seed:46,color:'center'}); },
  blade(B,cx,cy,s,R,r){ const ox=cx-s*.34, oy=cy+s*.3, a=-.72, L0=s*.1, L1=s*.84, f=M.shape.blade(ox,oy,a,L0,L1,s*.17,1.2), ca=Math.cos(a), sa=Math.sin(a);
    A_blue(B,{ox:cx-s/2,oy:cy-s/2,w:s,h:s,sp:1.05,seed:3,salt:3,density:(x,y)=>{ const v=f(x,y); if(!v) return 0; const u=((x-ox)*ca+(y-oy)*sa-L0)/(L1-L0); return v*(.5+.5*(1-u)); },rOf:d=>r*(.5+.75*d),color:'ink'});
    A_curve(B,R,M.curve.ring(ox,oy,s*.035),{n:12,sp:.3,r,color:'ink'}); },
  bar(B,cx,cy,s,R,r){ for(let i=0;i<7;i++){ const x=cx-s*.39+i*s*.13, lit=i<4, f=M.shape.bar(x,cy,s*.52,s*.07,Math.PI/2-.36,1.4);
    A_blue(B,{ox:cx-s/2,oy:cy-s/2,w:s,h:s,sp:1.1,seed:3,salt:10+i,density:(X,Y)=>f(X,Y)*(lit?1:.7),rOf:d=>r*(.5+.7*d),color:lit?'ink':'tint'}); } },
  diamond(B,cx,cy,s,R,r){ [[-.27,.1,1],[0,-.08,1],[.27,.1,0]].forEach(([dx,dy,full])=>{ const c=M.curve.diamond(cx+dx*s,cy+dy*s,s*.1,s*.17);
    A_curve(B,R,full?c:(t=>c(.08+t*.62)),{n:Math.round(s*(full?1.25:.6)),sp:.42,r,color:full?'ink':'soft'}); }); },
  confetti(B,cx,cy,s,R,r){ const pts=[[-.34,-.3],[-.05,-.36],[.28,-.26],[-.2,-.05],[.12,-.02],[.38,.08],[-.38,.22],[-.08,.26],[.22,.32],[.02,.1]];
    pts.forEach(([dx,dy],i)=>{ const x=cx+dx*s, y=cy+dy*s, z=s*(.05+.022*((i*7)%3)), f=M.shape.bar(x,y,z,z,(i*1.7)%1.6-.8,.7);
      A_blue(B,{ox:x-z,oy:y-z,w:2*z,h:2*z,sp:1.1,seed:4,salt:20+i,density:f,rOf:d=>r*(.55+.6*d),color:i%3===1?'tint':'ink'}); }); },
  hollow(B,cx,cy,s,R,r){ const hx=cx+s*.12, hy=cy-s*.1, hr=s*.13;     /* the gap is exact: any dot whose disc would touch it is simply not placed */
    A_blue(B,{ox:cx-s/2,oy:cy-s/2,w:s,h:s,sp:1.35,seed:3,salt:30,density:(x,y)=>{ if(Math.hypot(x-hx,y-hy)<hr+r*1.3+.5) return 0; const a=Math.atan2(y-cy,x-cx), e=s*(.36+.1*M.noise(Math.cos(a)*1.6+3,Math.sin(a)*1.6+3,8)), d=Math.hypot(x-cx,y-cy);
      return (1-M.ss(e-5,e+5,d))*(.42+.4*M.noise(x/16,y/16,2)); },rOf:d=>r*(.5+.8*d),color:(x,y,d)=>d>.55?'ink':'soft'}); },
  ground(B,cx,cy,s,R,r,ov){ const t=s*.27, gap=s*.06, x0=cx-(3*t+2*gap)/2; ov.swatches=[];
    for(let i=0;i<3;i++){ const x=x0+i*(t+gap), y=cy-t/2; ov.swatches.push([x,y,t]); [.36,.22].forEach((f,q)=>A_curve(B,R,M.curve.ring(x+t/2,y+t/2,t*f),{n:Math.round(t*f*TAU/1.25),sp:.4,r,color:'sw'+i+(q?'c':'r')})); } }
};
const L01M=S.ontology.marks;
function L01lay(w){ const g=A_m(), ph=w<600, pad=ph?16:32, cols=ph?2:5, rows=10/cols, cw=(w-2*pad)/cols, ip=ph?10:16, tw=cw-2*ip;
  const z={name:ph?9:9.5, st:ph?12.5:14, us:ph?11:12}, lh={st:ph?16:20, us:16};
  const sp=Math.floor(ph?Math.min(tw,150):Math.min(tw,196));
  const marks=L01M.map((m,i)=>({m, st:M.wrap(g,m.stands,tw,{size:z.st,weight:400}), us:M.wrap(g,m.mir,tw,{size:z.us,weight:300}), note:i===0?(A_wrapT('THE FIELD BEGINS AT THE I',tw,{size:9,font:'mono',track:.1}).length>1?['THE FIELD BEGINS','AT THE I']:['THE FIELD BEGINS AT THE I']):[]}));
  const textH=r=>Math.max(...marks.slice(r*cols,r*cols+cols).map(k=>k.st.length*lh.st+8+k.us.length*lh.us+(k.note.length?8+k.note.length*12:0)));
  const titleH=ph?204:208, rowH=[]; for(let r=0;r<rows;r++) rowH.push(A_b(ip+20+sp+24+textH(r)+ip));
  const src='Root · Demarteau, 1756: etched dots that pass for chalk. Simplified: tone from dot spacing and size.';
  const srcL=A_wrapT(src,w-2*pad,{size:ph?9:9.5,font:'mono',track:.04});
  const H=A_b(pad+titleH+rowH.reduce((a,b)=>a+b,0)+20+srcL.length*14+pad);
  return {ph,pad,cols,rows,cw,ip,tw,z,lh,sp,marks,titleH,rowH,srcL,H}; }
/* capture: every specimen's dots once per width, with a role, a cell, and a loose start for the assembly */
const L01C=new Map();
function L01cap(w,g){ const key=w+'|'+g.dpr; if(L01C.has(key)) return L01C.get(key); if(L01C.size>4) L01C.clear();
  const L=L01lay(w), {pad,cols,cw,ip,sp}=L, r=L.ph?.66:.78, cols2=[], ci=new Map(), X=[], Y=[], Rd=[], C=[], cell=[], ov={dpr:g.dpr}, ovs=[];
  const sink={dot(x,y,rr,c){ let k=ci.get(c); if(k===undefined){ k=cols2.length; cols2.push(c); ci.set(c,k); } X.push(x); Y.push(y); Rd.push(Math.max(rr,M.minR(g))); C.push(k); cell.push(sink.cell); }};
  let y=pad+L.titleH;
  for(let rI=0;rI<L.rows;rI++){ for(let c=0;c<cols;c++){ const i=rI*cols+c, x0=pad+c*cw+ip, cx=x0+L.tw/2, cy=y+ip+20+sp/2, s=sp*.86, o={dpr:g.dpr};
      sink.cell=i; SPEC01[L01M[i].id](sink,cx,cy,s,M.rng(101+i*31),r,o); ovs[i]=o; }
    y+=L.rowH[rI]; }
  /* loose start: each dot begins displaced like a stray (a random direction, up to a third of the specimen) */
  const N=X.length, R=M.rng(4242), OX=new Float32Array(N), OY=new Float32Array(N), J=new Float32Array(N);
  for(let i=0;i<N;i++){ const a=R()*TAU, m=sp*(.06+.3*R()*R()); OX[i]=Math.cos(a)*m; OY[i]=Math.sin(a)*m; J[i]=R()*280; }
  const rs=[0]; for(let r=1;r<=L.rows;r++){ let i=rs[r-1]; while(i<N&&cell[i]<r*cols) i++; rs.push(i); }   /* dots are captured in cell order */
  const out={L,N,rs,X:Float32Array.from(X),Y:Float32Array.from(Y),R:Float32Array.from(Rd),C:Uint8Array.from(C),cell:Uint8Array.from(cell),cols:cols2,OX,OY,J,ovs};
  L01C.set(key,out); return out; }
function L01draw(g,w,h,st,t){ const P=M.PAL[st.ground]||M.PAL.paper, D=L01cap(w,g), L=D.L, {ph,pad,cols,cw,ip,z,lh,sp}=L, RL=A_roles(P);
  const others=['night','olive','cobalt','paper','sky'].filter(k=>k!==st.ground).slice(0,3);
  const colOf=D.cols.map(c=>{ if(RL[c]) return RL[c]; const m=/^sw(\d)([rc])$/.exec(c); if(m){ const Q=M.PAL[others[+m[1]]]; return m[2]==='r'?Q.ring:Q.center; } return c; });
  const rows=L.rows, INK=P.ink, SOFT=RL.soft, HAIR=A_mix(P.ground,P.ink,.16);
  const swatches=B=>D.ovs.forEach(o=>{ if(o.swatches) o.swatches.forEach(([x,y,s],i)=>B.rect(x,y,x+s,y+s,M.PAL[others[i]].ground)); });
  const logo=(o,y)=>{ const xh=ph?8:10, g0=M.logoGeo(0,0,xh), lx=o.logo.cx-g0.tittle.cx, base=Math.round(y+ip+20+sp-4), lg=M.logo(g,lx,base,xh,{color:INK});
    /* hairline from the field's first ring down to the tittle, stopping one clear-space unit short of it */
    M.rule(g,o.logo.cx,o.logo.cy+o.logo.rr+5,o.logo.cx,lg.tittle.cy-lg.tittle.h/2-lg.clear-1,SOFT,1); };
  if(t!=null){ /* a frame redraws only the specimen bands (one per row); the type around them stays from the settled render */
    let y=pad+L.titleH;
    /* each cell lands on its 16th (ARR01); its dots swell as its note sounds, and all of them on the cadence */
    const ec=[]; for(let c=0;c<10;c++) ec.push(M.music?M.music.env(st,'c'+c,t,200):0); const ea=M.music?M.music.env(st,'all',t,320):0;
    for(let rI=0;rI<rows;rI++){ const y0=y+ip+20, y1=y0+sp, B=new A_Ras(g,P.ground,[0,y0,w,y1]); swatches(B);
      for(let i=D.rs[rI];i<D.rs[rI+1];i++){ const c=D.cell[i], delay=ARR01(c)-DUR01*U9_01-(D.J[i]-140)*.4, e=M.ease.outQuint(M.clamp01((t-delay)/DUR01));
        let yy=D.Y[i]+D.OY[i]*(1-e); if(yy<y0+1) yy=2*(y0+1)-yy; else if(yy>y1-1) yy=2*(y1-1)-yy;     /* strays reflect off the band edge */
        B.dot(D.X[i]+D.OX[i]*(1-e),yy,D.R[i]*(.55+.45*e)*(1+.55*ec[c]+.22*ea),colOf[D.C[i]]); }
      B.flush(); for(let c=1;c<cols;c++) M.rule(g,pad+c*cw,y+(rI?0:4),pad+c*cw,y+L.rowH[rI]-8,HAIR,1);
      for(let c=0;c<cols;c++){ const o=D.ovs[rI*cols+c]; if(o.logo) logo(o,y); }
      y+=L.rowH[rI]; }
    return; }
  const B=new A_Ras(g,P.ground); swatches(B);
  for(let i=0;i<D.N;i++) B.dot(D.X[i],D.Y[i],D.R[i],colOf[D.C[i]]);
  B.flush();
  /* title block: one large confident figure, dense micro-type beside it */
  M.text(g,'Plate L-01',pad,pad+12,MONO(ph?9:9.5,INK,{weight:500}));
  const tS=ph?48:96; M.text(g,'Mir, defined',pad-(ph?2:5),A_b(pad+(ph?64:116)),DISP(tS,INK));
  M.text(g,'ten marks, one meaning each',pad,A_b(pad+(ph?96:160)),DISP(ph?18:24,SOFT));
  const micro=['Diagram · 10 marks','Each cell · name · stands for · Mir use'];
  if(ph) micro.forEach((m,i)=>M.text(g,m,pad,A_b(pad+124)+i*12,MONO(9,i===1?INK:SOFT)));
  else { const mx=pad+3*cw+ip; micro.forEach((m,i)=>M.text(g,m,mx,A_b(pad+160)-(micro.length-1-i)*14,MONO(9.5,i===1?INK:SOFT))); }
  let y=pad+L.titleH; M.rule(g,pad,y-16,w-pad,y-16,INK,ph?1:2);
  for(let rI=0;rI<rows;rI++){ const rh=L.rowH[rI]; if(rI>0) M.rule(g,pad,y,w-pad,y,HAIR,1);
    for(let c=1;c<cols;c++) M.rule(g,pad+c*cw,y+(rI?0:4),pad+c*cw,y+rh-8,HAIR,1);
    for(let c=0;c<cols;c++){ const i=rI*cols+c, k=L.marks[i], x0=pad+c*cw+ip;
      const nw=M.text(g,String(i+1).padStart(2,'0'),x0,y+ip+9,MONO(z.name,SOFT,{upper:false})); M.text(g,k.m.id,x0+nw+z.name,y+ip+9,MONO(z.name,INK,{weight:500}));
      const o=D.ovs[i]; if(o.logo) logo(o,y);
      let ty=y+ip+20+sp+24; A_lines(g,k.st,x0,ty,lh.st,{size:z.st,weight:400,color:INK}); ty+=k.st.length*lh.st+8-lh.st+lh.us;
      A_lines(g,k.us,x0,ty,lh.us,{size:z.us,weight:300,color:SOFT}); if(k.note.length){ ty+=k.us.length*lh.us+4; A_lines(g,k.note,x0,ty,12,MONO(9,INK,{track:.1})); } }
    y+=rh; }
  M.rule(g,pad,y,w-pad,y,INK,1);
  A_lines(g,L.srcL,pad,y+20,14,MONO(ph?9:9.5,SOFT,{upper:false,track:.04})); }
/* L-01 music, 112 BPM. The plate is a phrase: the assembly is re-timed so cell c lands on the 16th ARR01(c), in reading order, and each
   cell's arrival is its note in its own timbre. The first three cells play the motif loose (5 ↑ 1 ↑ 4) over a suspended pad; the red
   center resolves it to the third (meet) and the chord turns home; the run climbs the chord; the hollow is a note cut off at 60 ms into
   silence; the ground is the low drone. The downbeat is the cadence: the pad in tune, the bass once, and the motif in tune ending on
   the third, with the center swelling. Ground sets the mode. */
const BPM01=112, BT01=60000/BPM01, N16_01=BT01/4, DUR01=6*N16_01, U9_01=1-Math.pow(.1,.2), ARR01=c=>BT01*1.5+c*N16_01, DOWN01=4*BT01, END01=DOWN01+2.25*BT01;
/* each mark's voice in mode md: [dt ms, instrument, midi, dur ms, opts, cut ms] */
function m1_v01(c,md){ const d=(k,o)=>M.music.deg(md,k,o);
  return [[[0,'pluck',d(-3,4),320,{cutoff:1500,vel:.62}]],
    [[0,'bell',d(0,5),600,{ratio:3,bright:.5,vel:.42,cents:7}]],                                  /* a stray: glass, a little out */
    [[0,'organ',d(3,4),N16_01+16,{vel:.54,vibrato:4,release:.12}]],                                /* the ring: the suspension, until the center resolves it */
    [[0,'meet',d(2,4),1500,{spread:30,vel:.56}]],                                                /* the center: the third arrives */
    [[0,'glide',d(4,4),320,{from:d(2,4),glide:90,vel:.5,vibrato:0,attack:.012,release:.3,tone:3600}]],
    [[0,'pulse',d(7,4),130,{pw:.3,cutoff:1800,vel:.46}]],
    [[0,'clave',d(4,6),0,{vel:.42}],[0,'mallet',d(2,5),700,{vel:.42,trem:5}]],
    [0,1,2].map(k=>[k*N16_01/3,'bell',d(4+3*k-(k>1?1:0),5),520,{ratio:3,bright:1.1,vel:.32-.03*k,pan:(k-1)*.3}]),
    [[0,'mallet',d(4,5),600,{vel:.5},60]],                                                       /* the hollow: cut short */
    [[0,'drone',d(0,2),700,{ratio:1.5,level:.5,fade:.25,cutoff:1300}]]][c]; }
function music01(st){ const mu=M.music, S=mu.score({bpm:BPM01,ground:st.ground}), md=S.mode, home=m1_home(md), d=(k,o)=>mu.deg(md,k,o);
  S.harm([[0,'Dsus4'],[ARR01(3),home]]);
  /* the bed: suspended under the loose cells, in tune from the center on */
  S.chord(0,'pad',[d(-3,3),d(0,4),d(3,4)],ARR01(3),{attack:.5,release:.2,cutoff:900,vel:.34,over:'D'});
  S.chord(ARR01(3),'pad',[d(0,3),d(4,3),d(2,4)],DOWN01-ARR01(3),{attack:.25,release:.3,cutoff:1100,vel:.34});
  for(let c=0;c<10;c++) m1_v01(c,md).forEach(([dt,ins,m,dur,o,cut],k)=>{ const t=ARR01(c)+dt, id='k'+c+'_'+k, hk=['c'+c,k?.6:1];
    if(ins==='clave') S.hitSound(t,'clave',{freq:mu.hz(m,S.chordAt(t)),vel:o.vel},hk);
    else m1_sn(S,t,ins,m,c===9?END01+500-t:dur,Object.assign({id},o),hk);
    if(cut) S.stop(t+cut,id,.02); });
  /* the cadence */
  S.chord(DOWN01,'pad',[d(0,3),d(4,3),d(2,4),d(4,4)],1800,{attack:.04,release:1.1,cutoff:1500,vel:.4},['all',1]);
  S.note(DOWN01,'bass',d(0,2),700,{from:d(-3,1),glide:90,env:2.6,decay:.4,vel:.6});
  S.hitSound(DOWN01,'kick',{vel:.46});
  [[.5,-3,'c0'],[1,0,'c1'],[1.5,2,'c3']].forEach(([b,k,key],j)=>S.note(DOWN01+b*BT01,'mallet',d(k,5),j===2?1700:700,{vel:.44+.04*j,trem:5,pan:(j-1)*.2},[key,j===2?1:.7]));
  S.end(END01+1700); return S.out(); }
function m1_cell01(w,x,y){ const L=L01lay(w); if(x<L.pad||x>w-L.pad) return -1; let yy=L.pad+L.titleH; for(let r=0;r<L.rows;r++){ if(y>=yy&&y<yy+L.rowH[r]) return r*L.cols+Math.min(L.cols-1,Math.floor((x-L.pad)/L.cw)); yy+=L.rowH[r]; } return -1; }
/* pointing at a mark: its own voice, on its degree, over the chord it was last heard in */
function m1_point01(st,c){ const a=m1_au('L-01'); if(!a) return; const md=M.music.groundMode(st.ground), sym=M.music.chordAt(st,1e9), now=a.now()+.006;
  m1_v01(c,md).forEach(([dt,ins,m,dur,o,cut])=>{ const when=now+dt/1000;
    if(ins==='clave') a.play('L-01','clave',{freq:M.music.hz(m,sym),vel:o.vel*.8,when});
    else { const h=m1_pn(a,'L-01',ins,m,dur,Object.assign({},o,{vel:(o.vel||.5)*.8}),when,sym); if(cut) h.stop(when+cut/1000,.02); } }); }
M.piece({ id:'L-01',
  caption:'The ten marks of Mir as a specimen plate, each with what it stands for and how Mir uses it. Play to watch them assemble from stray dots, change Ground, or point at a mark to hear it.',
  alt:'A specimen plate: ten stippled marks in a grid (dot, stray, ring, center, blade, bar, diamond, confetti, hollow, ground), each with its name, meaning and use, under a large light title.',
  recipe:{
    idea:'Each mark carries one meaning, and the identity is the construction, so the plate reads the same on any ground.',
    marks:['dot','stray','ring','center','blade','bar','diamond','confetti','hollow','ground'],
    ground:'paper, night, olive',
    accent:'the center specimen’s inner ring, red: where the two of you meet',
    composition:'Title block over a 5 × 2 grid of cells (2 × 5 on phones); each cell has a number and name, the stippled specimen, what it stands for and how Mir uses it.',
    motion:'At 112 BPM: each dot eases from a loose stray position into its mark (outQuint, six 16ths), and the cells land one per 16th in reading order, each swelling as its note sounds; all swell on the downbeat, about 3.2 s in all. Reduced motion shows the settled plate.',
    sound:'The plate is a phrase, one note per mark in its own timbre: the first three cells play the motif suspended, the red center resolves it to the third, the run climbs the chord, the hollow cuts off, and a cadence lands on the downbeat.',
    controls:['Ground (Paper, Night, Olive): the mode, Ionian, Dorian or Mixolydian','point at a mark to hear it'],
    computed:['tone: blue-noise (Poisson-disc) dots, kept by density, dot size following density','rings: M.ring, stratified along the ring, gaussian across it, dots shrinking toward the edges','hollow: any dot whose disc would touch the gap is not placed'],
    placeholder:['stray, confetti and diamond positions (hand-placed)','loose start positions (seeded)'],
    root:'Demarteau, crayon manner, 1756',
    rules:['the dot specimen sits above the real wordmark, joined to the i’s tittle by a hairline that stops one clear-space unit short','Ground recolors dots by role; positions do not change'],
    engine:['M.poisson','M.ring','M.curve.ring','M.curve.diamond','M.shape.blade','M.shape.bar','M.noise','M.logo','M.logoGeo','M.ease.outQuint','M.text','M.rule','M.music']
  },
  aspect:w=>w/L01lay(w).H,
  state:{ground:'paper'},
  controls:[{id:'ground',type:'select',label:'Ground',options:[{value:'paper',label:'Paper'},{value:'night',label:'Night'},{value:'olive',label:'Olive'}]}],
  music:music01,
  /* Ground: the motif heard in the new mode, suspended, then resolving to the mode's own third over its home chord (one bar) */
  musicParam(A,st,id,ov,nv){ if(id!=='ground') return false; const mu=M.music, md=mu.groundMode(nv), home=m1_home(md), d=(k,o)=>mu.deg(md,k,o), now=A.now()+.01, b=BT01/1000, hz=(m,s)=>mu.hz(m,s);
    A.play('pluck',{freq:hz(d(-3,4),'D'),dur:.3,vel:.6,cutoff:1500,when:now});
    A.play('organ',{freq:hz(d(0,4),'D'),dur:b*2.6,vel:.44,when:now+b*.5});
    const v=A.play('glide',{freq:hz(d(3,4),'D'),dur:b*3,vel:.56,vibrato:6,attack:.04,release:.7,tone:3200,when:now+b}); v.set('freq',hz(d(2,4),home),80,now+b*2);
    A.play('meet',{freq:hz(d(2,5),home),spread:24,dur:1.4,vel:.5,when:now+b*2});
    A.play('pad',{chord:[d(0,3),d(4,3),d(2,4)].map(m=>hz(m,home)),dur:1.3,attack:.06,release:.8,vel:.36,cutoff:1300,when:now+b*2}); return true; },
  render(g,w,h,M,st){ L01draw(g,w,h,st||{ground:'paper'},null); if(st) m1_T(st).run=false; },
  animate(g,w,h,M,st,t){ L01draw(g,w,h,st,t); m1_T(st).run=t<END01; return t<END01; },
  /* pointing at a mark sounds its voice (once per cell entered, at most every 90 ms); a press during the assembly shows the settled plate */
  pointer(st,e){ const T=m1_T(st), c=m1_cell01(e.w,e.x,e.y);
    if(e.type==='up') return false;
    if(c>=0&&(c!==T.hc||e.type==='down')&&m1_rl(T,'p',90)) m1_point01(st,c);
    T.hc=c; if(e.type==='down'&&T.run){ T.run=false; return true; } return false; } });

/* ════════════════════════════════════════════════════════════════
   L-02 · How a figure agrees
   Method (computed): field = mirField(seed 11, k .90, 9 rings, R 200 ref px, 36 strays), generated once in reference units.
   Ring bands = |r − R_i| < 4 ref px. Chance p = band area ÷ the (2.3R)² square the marks are placed in.
   agreement(n) = (share of the first n marks of a seeded reveal order inside a band) ÷ p, from a prefix sum (O(1) per n).
   Envelope: the same reading for 40 other seeded orders at 120 log-spaced counts; min, quartiles and max per count.
   ════════════════════════════════════════════════════════════════ */
function A_agree(){ if(A_agree.c) return A_agree.c;
  const Rr=200, rings=9, cap=A_cap(null); M.mirField(cap,{cx:0,cy:0,R:Rr,k:.9,seed:11,rings,dens:1,strays:36,pal:M.PAL.night});
  const P=M.PAL.night, a=cap.a, N=a.length/4, X=new Float32Array(N), Y=new Float32Array(N), C=new Uint8Array(N), inb=new Uint8Array(N), Hb=4, half=Rr*1.15;
  const radii=[]; for(let i=1;i<=rings;i++) radii.push(Rr*(i/rings)*(.98+.02*i/rings));
  for(let i=0;i<N;i++){ X[i]=a[i*4]; Y[i]=a[i*4+1]; const c=a[i*4+3]; C[i]=c===P.center?2:c===P.blade?1:0; const d=Math.hypot(X[i],Y[i]); inb[i]=radii.some(R=>Math.abs(d-R)<Hb)?1:0; }
  const p=radii.reduce((s,R)=>s+4*Math.PI*R*Hb,0)/((2*half)*(2*half));
  const order=A_shuffle(N,2026), cum=new Uint32Array(N+1); for(let i=0;i<N;i++) cum[i+1]=cum[i]+inb[order[i]];
  const at=n=>(cum[n]/n)/p;
  const G=120, cs=[]; for(let j=0;j<=G;j++){ const n=Math.max(1,Math.round(Math.pow(N,j/G))); if(!cs.length||n>cs[cs.length-1]) cs.push(n); }
  const vals=cs.map(()=>[]); for(let o=0;o<40;o++){ const ord=A_shuffle(N,7000+o*13); let k=0, ci=0; for(let i=0;i<N&&ci<cs.length;i++){ k+=inb[ord[i]]; if(i+1===cs[ci]){ vals[ci].push((k/(i+1))/p); ci++; } } }
  const env=vals.map(v=>{ v.sort((a,b)=>a-b); return [v[0],v[10],v[29],v[39]]; });   /* min, q25, q75, max */
  const main=[]; for(let j=0;j<=200;j++){ const n=Math.max(1,Math.round(Math.pow(N,j/200))); if(!main.length||n>main[main.length-1][0]) main.push([n,at(n)]); }
  const stops=[.03,.12,.40,1].map(s=>{ const n=Math.max(1,Math.round(s*N)); return {s,n,v:at(n)}; });
  return (A_agree.c={N,X,Y,C,order,p,half,at,cs,env,main,stops}); }
const A_nOf=u=>{ const A=A_agree(); return Math.max(1,Math.min(A.N,Math.round(Math.pow(A.N,u)))); };
const A_pct=n=>{ const v=n/A_agree().N*100; return (v<1?v.toFixed(1):Math.round(v))+'%'; };
const THESIS02='One field revealed mark by mark, and its agreement over chance.';
function L02lay(w){ const g=A_m(), ph=w<760, pad=ph?16:32, inner=w-2*pad, A=A_agree();
  let Sz, rx0, rw; if(ph){ Sz=inner; rx0=pad; rw=inner; } else { Sz=Math.round(Math.min(inner*.47,560)); rx0=pad+Sz+48; rw=w-pad-rx0; }
  const tS=ph?36:52, tL=M.wrap(g,'How a figure agrees',rw,{size:tS,weight:300}), thS=ph?16:19, thL=M.wrap(g,THESIS02,Math.min(rw,ph?rw:460),{size:thS,weight:300});
  const big=ph?64:104, o={ph,pad,inner,Sz,rx0,rw,tS,tL,thS,thL,big};
  let y=pad+12; o.kY=y; y=A_b(y+20+tS*.78); o.tY=y; y+=(tL.length-1)*A_b(tS*1.04);
  y=A_b(y+(ph?28:36)); o.thY=y; y+=(thL.length-1)*A_b(thS*1.36);
  if(ph){ o.pY=A_b(y+24); y=o.pY+Sz; }
  y=A_b(y+(ph?52:40)+big*.74); o.bY=y;
  o.plY0=A_b(y+(ph?32:40)); const minPlot=ph?200:190; o.plY1=ph?o.plY0+minPlot:Math.max(pad+Sz,o.plY0+minPlot); if(!ph) o.pY=pad;
  const mt=`Agreement = share of shown marks on a ring band ÷ share expected at random (the bands are ${(A.p*100).toFixed(1)}% of the field).`;
  o.mtL=A_wrapT(mt,inner,{size:ph?9:9.5,font:'mono',track:.04}); o.mY=A_b(Math.max(o.plY1+4,ph?0:pad+Sz+28)+28);
  o.H=A_b(o.mY+(o.mtL.length-1)*14+pad+4);
  o.plot={lx:rx0+(ph?26:32), rx:w-pad, ty:o.plY0+20, by:o.plY1-34};
  return o; }
const L02C=new Map();
function L02band(L,w){ const k=w+'', P0=L.plot; if(L02C.has(k)) return L02C.get(k); if(L02C.size>4) L02C.clear();
  const v=A_pbox(Math.ceil(P0.rx-P0.lx),Math.ceil(P0.by-P0.ty),L.ph?1.5:1.55,77); L02C.set(k,v); return v; }
function L02draw(g,w,h,st,anim){ const P=M.PAL.night, A=A_agree(), L=L02lay(w), {ph,pad,Sz,rx0,rw}=L, Q=L.plot;
  const SOFT=A_mix(P.ground,P.ink,.52), HAIR=A_mix(P.ground,P.ink,.16), TINT=A_mix(P.ground,P.ring,.24), TINT2=A_mix(P.ground,P.ring,.38);
  const n=anim?anim.n:A_nOf(st.share), trace=anim?anim.n:A.N, v=A.at(n);
  const B=new A_Ras(g,P.ground);
  /* the large panel: the first n marks of the seeded order */
  const px=pad, py=L.pY, sc=Sz/(2*A.half), cx=px+Sz/2, cy=py+Sz/2, r=Sz>420?.95:Sz>300?.82:.7, col=[P.ring,P.blade,P.center];
  for(let j=0;j<n;j++){ const k=A.order[j]; B.dot(cx+A.X[k]*sc,cy+A.Y[k]*sc,r*(A.C[k]===2?1.1:1),col[A.C[k]]); }
  /* the rank revealed with each partial swells as that partial sounds */
  if(anim&&anim.fl) anim.fl.forEach(([j0,j1,e])=>{ for(let j=j0;j<Math.min(j1,n);j++){ const k=A.order[j]; B.dot(cx+A.X[k]*sc,cy+A.Y[k]*sc,r*(A.C[k]===2?1.1:1)*(1+1.1*e),col[A.C[k]]); } });
  /* plot: log x, agreement y; the 40-order envelope as stippled tone, traced in sync with the reveal */
  const lN=Math.log(A.N), X=m=>Q.lx+(Q.rx-Q.lx)*Math.log(m)/lN, ymax=5, Yv=val=>Q.by-(Q.by-Q.ty)*val/ymax, xT=X(trace);
  const bp=L02band(L,w), envAt=x=>{ const u=(x-Q.lx)/(Q.rx-Q.lx)*lN, m=Math.exp(u); let i=0; while(i<A.cs.length-2&&A.cs[i+1]<m) i++; const a=A.cs[i], b=A.cs[i+1], f=b>a?M.clamp01((m-a)/(b-a)):0, E0=A.env[i], E1=A.env[i+1]; return [0,1,2,3].map(q=>E0[q]+(E1[q]-E0[q])*f); };
  let lastX=-1, E=null; const Rb=M.rng(9);
  for(let i=0;i<bp.length;i+=2){ const x=bp[i]+Q.lx, y=bp[i+1]+Q.ty; if(x>xT) continue; if(Math.abs(x-lastX)>.75){ E=envAt(x); lastX=x; }
    const vv=(Q.by-y)/(Q.by-Q.ty)*ymax; if(vv<E[0]||vv>E[3]) continue; const inner=vv>=E[1]&&vv<=E[2]; if(Rb()>(inner?.62:.34)) continue; B.dot(x,y,inner?.74:.58,inner?TINT2:TINT); }
  for(let x=Q.lx+2;x<Q.rx;x+=5) B.dot(x,Yv(1),.55,SOFT);              /* chance, 1×, in dots */
  A.main.forEach(([m,val])=>{ if(m<=trace) B.dot(X(m),Yv(val),1.05,P.ring); });
  A.stops.forEach(s=>{ if(s.n<=trace) B.dot(X(s.n),Yv(s.v),1.9,P.ring); });
  const mx=X(n), my=Yv(v), pk=anim&&anim.pk||0; for(let i=0;i<20;i++){ const a=i/20*TAU, rr=6.5*(1+.55*pk); B.dot(mx+Math.cos(a)*rr,my+Math.sin(a)*rr,.7*(1+.8*pk),P.ring); }
  B.flush();
  /* type */
  A_ticks(g,px-6,py-6,px+Sz+6,py+Sz+6,10,HAIR);
  M.text(g,'Field · seed 11 · coherence .90',px,py+Sz+22,MONO(9,SOFT));
  if(!ph) M.text(g,`${A_fmt(n)} / ${A_fmt(A.N)} marks`,px+Sz,py+Sz+22,MONO(9,P.ink,{align:'right'}));
  M.text(g,'Plate L-02 · diagram',rx0,L.kY,MONO(ph?9:9.5,SOFT));
  A_lines(g,L.tL,rx0-(ph?1:3),L.tY,A_b(L.tS*1.04),DISP(L.tS,P.ink));
  A_lines(g,L.thL,rx0,L.thY,A_b(L.thS*1.36),DISP(L.thS,SOFT));
  const bw=M.text(g,v.toFixed(2)+'×',rx0-(ph?2:5),L.bY,DISP(L.big,P.ink));
  const ml=['Agreement × chance',`${A_pct(n)} shown`,`${A_fmt(n)} of ${A_fmt(A.N)} marks`], mxx=rx0+Math.max(bw,L.big*2.6)+(ph?12:24);
  ml.forEach((s,i)=>M.text(g,s,mxx,L.bY-(ml.length-1-i)*14,MONO(ph?9:9.5,i===1?P.ink:SOFT)));
  M.text(g,'Agreement over marks shown, log',rx0,L.plY0+4,MONO(9,SOFT));
  if(!ph) M.text(g,'Band · 40 other orders · white · this order',Q.rx,L.plY0+4,MONO(9,SOFT,{align:'right'}));
  M.rule(g,Q.lx,Q.by,Q.rx,Q.by,HAIR,1);
  for(let k=0;k<=ymax;k++) M.text(g,k+'×',Q.lx-8,Yv(k)+3,MONO(9,k===1?P.ink:SOFT,{align:'right',upper:false}));
  M.text(g,'chance',Q.lx+8,Yv(1)-7,MONO(9,SOFT));
  const ticks=[[1,'1 mark'],[10,'10'],[100,'100'],[1000,'1,000'],[A.N,A_fmt(A.N)]].filter(([m],i,a)=>i===a.length-1||m<A.N*(ph?.2:.5));
  ticks.forEach(([m,s],i)=>M.text(g,s,X(m),Q.by+16,MONO(9,SOFT,{align:i===0?'left':i===ticks.length-1?'right':'center'})));
  M.rule(g,mx,Q.by-2,mx,my+10,SOFT,1);
  const lab=`${A_pct(n)} · ${v.toFixed(2)}×`, lw=M.text(g,lab,-9999,0,MONO(9.5,P.ink)), lx=mx+12+lw>Q.rx?mx-12-lw:mx+12; M.text(g,lab,lx,my-10,MONO(9.5,P.ink,{weight:500}));
  A.stops.forEach((s,i)=>{ if(s.n>trace) return; const t=Math.round(s.s*100)+'%', tw=M.text(g,t,-9999,0,MONO(9,SOFT)), sx=i===3?X(s.n)-tw:X(s.n)-tw/2, sy=Yv(s.v)+(i<2?18:-10); if(sx<lx+lw+6&&sx+tw>lx-6&&Math.abs(sy-(my-10))<12) return; M.text(g,t,sx,sy,MONO(9,SOFT)); });
  if(!st._used) M.text(g,ph?'Drag across the plot':'Drag across the plot to scrub',Q.rx,Q.ty+8,MONO(9.5,P.ink,{weight:500,align:'right'}));   /* hint until first use */
  A_lines(g,L.mtL,pad,L.mY,14,MONO(ph?9:9.5,SOFT,{upper:false,track:.04})); }
/* L-02 music, 60 BPM: the reveal is one bar. The figure is D2's harmonic series, the partials that spell a D major chord
   (1 2 3 4 5 6 8 10 12 16). They fill in from the lowest as the share rises, one entering on the 32nd grid as each ninth of the reveal
   arrives, scattered by how far the reading can still move (the middle half of the 40-order band as a share of the final agreement,
   × 120 cents, at most 40) and gliding toward pure on every 16th as the band narrows. On the downbeat they lock; the motif rings above,
   ending on the third if the fifth partial (F#) has been shown, on the suspended fourth if it has not. A soft tick counts the beats. */
const D02=4000, P02=[1,2,3,4,5,6,8,10,12,16];
function m1_dt02(n){ const A=A_agree(); let i=0; while(i<A.cs.length-1&&A.cs[i]<n) i++; const E=A.env[i], vN=A.at(A.N); return Math.min(40,Math.max(0,(E[2]-E[1])/vN*120)); }
const m1_u002=()=>{ const A=A_agree(); return Math.log(Math.max(1,A.N*.01))/Math.log(A.N); };
/* how many partials sound at share u */
const m1_cnt02=u=>{ const u0=m1_u002(); return Math.max(1,Math.min(10,1+Math.floor((u-u0)/(1-u0)*9+1e-9))); };
function m1_plan02(share){ const u0=m1_u002(), u1=Math.max(u0,share), uAt=t=>u0+(u1-u0)*M.ease.inOutCubic(M.clamp01(t/D02)), K=[];
  const inv=y=>{ let a=0,b=1; for(let i=0;i<32;i++){ const m=(a+b)/2; if(M.ease.inOutCubic(m)<y) a=m; else b=m; } return (a+b)/2; };
  let last=-1; for(let k=0;k<P02.length;k++){ const uk=u0+k/9*(1-u0); if(uk>u1+1e-9) break; let t=k?D02*inv((uk-u0)/((u1-u0)||1)):0; t=Math.ceil(t/125-1e-6)*125; if(t<=last) t=last+125; t=Math.min(D02,t); last=t;
    K.push({k,t,n:A_nOf(uAt(t))}); }
  return {u0,u1,uAt,K}; }
function music02(st){ const mu=M.music, S=mu.score({bpm:60,mode:'ionian'}), P=m1_plan02(st.share), R=M.rng(202), f0=mu.hz('D2','D'), END=D02+2600;
  S.harm([[0,'D']]); const sg=P02.map(()=>(R()<.5?-1:1)*(.55+.45*R())), few=(10-P.K.length)*.022;   /* fewer partials shown: each sounds a little fuller */
  P.K.forEach(({k,t,n})=>{ const f=f0*P02[k], id='p'+k, c=m1_dt02(n)*sg[k];
    S.note(t,'glide',{hz:f*Math.pow(2,c/1200)},END-t,{id,attack:.1,release:1.3,vel:.56-.022*k+few,vibrato:0,wow:1.2,tone:2600,pan:(k%2?1:-1)*Math.min(.6,.07*k)},['p'+k,1]);
    for(let tt=Math.floor(t/250+1)*250;tt<D02;tt+=250) S.set(tt,id,'freq',f*Math.pow(2,m1_dt02(A_nOf(P.uAt(tt)))*sg[k]/1200),200);
    S.set(D02,id,'freq',f,320); });
  for(let b=0;b<4;b++) S.hitSound(b*1000,'tick',{vel:.26,tock:b>0},['beat',.6]);
  const third=P.K.some(x=>x.k===4);
  [[3500,-3],[3750,0],[D02,third?2:3]].forEach(([t,d],j)=>S.note(t,'bell',mu.deg('ionian',d,5),j===2?2400:900,{ratio:3,bright:.6,vel:.4+.05*j+few*1.6,pan:.15},['lead',1]));
  if(third) S.note(D02,'meet',mu.deg('ionian',2,4),2000,{spread:24,vel:.5},['lead',1]);
  S.end(END); const o=S.out(); o.m1=P.K; return o; }
/* moving the share: the partial being revealed (or hidden) glides in from its current scatter; between partials, the top one pulses */
function m1_scrub02(play,st,ov,nv){ const T=m1_T(st), a=m1_cnt02(ov), b=m1_cnt02(nv), f0=M.music.hz('D2','D'), c=Math.max(6,m1_dt02(A_nOf(nv)));
  if(b!==a){ const k=Math.max(a,b)-1, f=f0*P02[k], up=b>a; play('glide',{freq:f,from:f*Math.pow(2,(k%2?1:-1)*c/1200),glide:170,dur:up?.9:.45,attack:.03,release:.6,vel:up?.58:.4,vibrato:0,wow:1,tone:2600,pan:(k%2?1:-1)*Math.min(.6,.07*k)}); }
  else if(m1_rl(T,'s',240)){ const k=b-1, f=f0*P02[k]; play('glide',{freq:f,from:f*Math.pow(2,c/1200),glide:200,dur:.35,attack:.03,release:.4,vel:.32,vibrato:0,tone:2200}); } }
M.piece({ id:'L-02',
  caption:'One sample field revealed mark by mark, with a live reading of how much more often its marks sit on the rings than chance would predict. Drag Share shown or scrub the plot; Play reveals it from 1%.',
  alt:'On near-black, a large stippled ring figure with a red center. Beside it a large number for agreement over chance, and a dot plot whose gray band narrows from left to right around a bright curve near three times chance.',
  recipe:{
    idea:'Agreement is in the marks from the start, but a few marks can say anything; the reading only steadies as the count grows.',
    marks:['ring','center','blade','stray'],
    ground:'night',
    accent:'center, red: the cluster where the rings meet',
    composition:'Square field panel at left (top on phones); at right, title, dek, a large live agreement number and a log-scale dot plot with a band of 40 other reveal orders.',
    motion:'Play reveals the field from 1% to the set share over one bar at 60 BPM (4 s, inOutCubic), tracing the plot in step; the rank revealed with each partial swells as it sounds, and the plot’s leading point pulses on the beats. Reduced motion shows the set share.',
    sound:'The figure is a harmonic series: its partials enter from the lowest as the share rises, scattered while the reading can still move, and glide pure on the downbeat, with the motif ringing above and ending on the third once enough is shown.',
    controls:['Share shown 0–100%: how many partials sound and how far they scatter','drag across the plot to scrub'],
    computed:['field: M.mirField, seed 11, coherence .90, 9 rings, 36 strays, in reference units','ring bands: |r − Rᵢ| < 4 ref px','chance p = band area ÷ area of the square the marks are placed in','agreement(n) = share of the first n marks of a seeded reveal order inside a band ÷ p, from a prefix sum','band: the same reading for 40 other seeded orders at 120 log-spaced counts; outer = min to max, inner = middle half'],
    placeholder:['the field (seeded, standing in for a conversation)'],
    root:'',
    rules:['the band, curve and chance line are drawn in dots'],
    engine:['M.mirField','M.rng','M.poisson','M.ease.inOutCubic','M.text','M.rule','M.wrap','M.music']
  },
  aspect:w=>w/L02lay(w).H,
  plotBox:w=>L02lay(w).plot,   /* for tests: where the scrub area is */
  state:{share:1},
  controls:[{id:'share',type:'range',label:'Share shown',min:0,max:1,step:.001,fmt:v=>{ const n=A_nOf(+v); return A_pct(n)+' · '+A_fmt(n); }}],
  music:music02,
  musicParam(A,st,id,ov,nv){ if(id!=='share') return false; m1_scrub02((ins,o)=>A.play(ins,Object.assign({when:A.now()+.005},o)),st,ov,nv); return true; },
  render(g,w,h,M,st){ L02draw(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ const P=m1_plan02(st.share), n=A_nOf(P.uAt(t)), mu=M.music, K=(st._mus&&st._mus.m1)||[], fl=[];
    K.forEach((x,i)=>{ const e=mu.env(st,'p'+x.k,t,280); if(e>.03) fl.push([i?K[i-1].n:0,x.n,e]); });
    const pk=Math.max(mu.env(st,'p*',t,240),.6*mu.env(st,'beat',t,160),mu.env(st,'lead',t,420));
    L02draw(g,w,h,st,{n,fl,pk}); return t<D02+900; },
  pointer(st,e){ const L=L02lay(e.w), Q=L.plot; if(e.type==='down'){ A_t(st,'_scrub',e.x>Q.lx-12&&e.x<Q.rx+12&&e.y>Q.ty-24&&e.y<Q.by+24); if(st._scrub) A_t(st,'_used',true); }
    if(e.type==='up'){ const was=st._scrub; A_t(st,'_scrub',false); return !!was; }
    if(!st._scrub||(e.type==='move'&&!e.down)) return false; const ov=st.share; st.share=Math.round(M.clamp01((e.x-Q.lx)/(Q.rx-Q.lx))*1000)/1000;
    const a=m1_au('L-02'); if(a&&ov!==st.share) m1_scrub02((ins,o)=>a.play('L-02',ins,o),st,ov,st.share); return true; } });

/* ════════════════════════════════════════════════════════════════
   L-07 · Two voices
   Two ring families: you (a hand: slight wobble, wider spread) and Mir (precise, finer). A mark turns red only when it also lies
   on a ring of the other field (|d − k·pitch| < tol): agreement. Crossings are also counted analytically: every pair of circles
   (j·pitchA, k·pitchB) with |a − b| < D < a + b meets at two points; those inside the frame and the visible field are counted.
   ════════════════════════════════════════════════════════════════ */
const HEAD07='On confiding in something that only listens';
function L07lay(w,h){ const g=A_m(), ph=w<450, pad=ph?16:24, hs=ph?30:40, hl=M.wrap(g,HEAD07,w-2*pad,{size:hs,weight:300}), lh=A_b(hs*1.06);
  const kY=pad+10, hY=A_b(kY+18+hs*.8), iy0=hY+(hl.length-1)*lh+20, iy1=h-pad-40, ih=iy1-iy0, S0=Math.min(w,ih), dr=S0*.052;
  return {ph,pad,hs,hl,lh,kY,hY,iy0,iy1,ih,S0,dr,ax:w*.38,ay:iy0+ih*.57,Rmax:S0*.5}; }
function L07mir(L,st,w){ const d=st.dist*L.dr; let bx=L.ax+Math.cos(st.angle)*d, by=L.ay+Math.sin(st.angle)*d; bx=Math.max(16,Math.min(w-16,bx)); by=Math.max(L.iy0+16,Math.min(L.iy1-16,by)); return [bx,by]; }
/* one ring family, engraved with M.ring (stratified along, gaussian across, AM taper). F.sw: swell (the hand's pressure); F.wpx:
   wobble in px, constant across rings. Dots are captured with their ring index and position along it, for the draw-on. */
function L07field(L,w,F){ const nR=Math.floor(L.Rmax/F.dr), X=[],Y=[],Rd=[],J=[],T=[], U=M.rng(F.seed*3+1); let j=0, ct=0, fade=1;
  const sink={dot(x,y,r){ if(U()>fade*fade+.015) return; if(x<1||x>w-1||y<L.iy0||y>L.iy1) return; X.push(x); Y.push(y); Rd.push(r); J.push(j); T.push(ct); }};
  for(j=1;j<=nR;j++){ const rad=j*F.dr; fade=1-Math.max(0,(rad-L.Rmax*.6)/(L.Rmax*.4));
    M.ring(sink,{cx:F.x,cy:F.y,R:rad,w:F.sp*2,swell:F.sw,dpl:F.dpl,rCore:F.r*1.2,rEdge:F.r*.62,seed:F.seed*31+j,wobble:F.wpx/rad,color:t=>{ ct=t; return 1; }}); }
  return {X:Float32Array.from(X),Y:Float32Array.from(Y),R:Float32Array.from(Rd),J:Uint8Array.from(J),T:Float32Array.from(T),n:X.length,nR}; }
function L07model(L,w,h,st,g){ const c=A_c(st), r0=L.ph?.74:.84, kp=w+'|'+h;
  if(c.k07p!==kp){ c.k07p=kp; c.fA=L07field(L,w,{x:L.ax,y:L.ay,dr:L.dr,dpl:.86,sp:.78,sw:.5,wpx:Math.min(1.3,L.dr*.05),seed:41,r:r0}); c.k07m=null; }
  const [bx,by]=L07mir(L,st,w), km=kp+'|'+bx.toFixed(1)+','+by.toFixed(1)+'|'+st.pitch;
  if(c.k07m!==km){ c.k07m=km; const drB=L.dr*st.pitch; c.fB=L07field(L,w,{x:bx,y:by,dr:drB,dpl:1.0,sp:.44,sw:.12,wpx:0,seed:42,r:r0*.94});
    /* analytic crossings first: every pair of circles (j·pitchA, k·pitchB) that meets, inside the frame and the visible field */
    const fA=c.fA, fB=c.fB, D=Math.hypot(bx-L.ax,by-L.ay), XP=[], XJ=[]; let cnt=0;
    for(let j=1;j<=fA.nR;j++) for(let k=1;k<=fB.nR;k++){ const a=j*L.dr, b=k*drB; if(D<=Math.abs(a-b)||D>=a+b||D<1e-6) continue; const ex=(bx-L.ax)/D, ey=(by-L.ay)/D, l=(a*a-b*b+D*D)/(2*D), hh=Math.sqrt(Math.max(0,a*a-l*l));
      for(const sg of [-1,1]){ const x=L.ax+ex*l-ey*hh*sg, y=L.ay+ey*l+ex*hh*sg; if(x<0||x>w||y<L.iy0||y>L.iy1) continue; if(a>L.Rmax*.9||b>L.Rmax*.9) continue; cnt++; XP.push(x,y); XJ.push(j); } }
    /* agreement: a mark lies on a ring of the other field AND near a crossing (so near-tangent rings give a small cluster instead of a long smear) */
    const tol=L.ph?1.9:2.2, rc=Math.max(6,L.dr*.33), cs=rc*2, grid=new Map(), mx=(L.ax+bx)/2, my=(L.ay+by)/2;
    for(let i=0;i<XP.length;i+=2){ const kx=Math.floor(XP[i]/cs), ky=Math.floor(XP[i+1]/cs), kk=kx+','+ky; (grid.get(kk)||grid.set(kk,[]).get(kk)).push(XP[i],XP[i+1]); }
    const nearX=(x,y)=>{ const kx=Math.floor(x/cs), ky=Math.floor(y/cs); for(let u=-1;u<=1;u++) for(let v=-1;v<=1;v++){ const a=grid.get((kx+u)+','+(ky+v)); if(a) for(let q=0;q<a.length;q+=2) if((a[q]-x)**2+(a[q+1]-y)**2<rc*rc) return true; } return false; };
    const on=(x,y,cx,cy,dr,nR)=>{ const d=Math.hypot(x-cx,y-cy), k=Math.round(d/dr); return k>=1&&k<=nR&&Math.abs(d-k*dr)<tol; };
    let dmax=1; [[fA,bx,by,drB,fB.nR],[fB,L.ax,L.ay,L.dr,fA.nR]].forEach(([F,cx,cy,dr,nR])=>{ F.red=new Uint8Array(F.n); F.dm=new Float32Array(F.n);
      for(let i=0;i<F.n;i++){ if(on(F.X[i],F.Y[i],cx,cy,dr,nR)&&nearX(F.X[i],F.Y[i])){ F.red[i]=1; const d=Math.hypot(F.X[i]-mx,F.Y[i]-my); F.dm[i]=d; if(d>dmax) dmax=d; } } });
    c.dmax=dmax;
    c.cross=cnt; c.bx=bx; c.by=by; c.XP=XP; c.XJ=XJ; c.mid=[mx,my]; }
  return c; }
function L07draw(g,w,h,st,t){ const P=M.PAL[st.ground]||M.PAL.paper, L=L07lay(w,h), c=L07model(L,w,h,st,g), INK=P.ink, SOFT=A_mix(P.ground,P.ink,.52), RED=P.center, anim=t!=null, thin=!!st._drag;
  /* hint until first use: under Mir's label, or above it when your label is in the way */
  const hint=st._used?null:(()=>{ const x=Math.max(L.pad+62,Math.min(w-L.pad-62,c.bx)); let y=c.by+22; if(Math.abs(x-L.ax)<80&&Math.abs(y-L.ay)<20) y=c.by-18; return {s:'drag Mir’s center',x,y}; })();
  const KO=[[L.ax,L.ay,15],[c.bx,c.by,15]].map(([x,y,hw])=>[x-hw,y-8,x+hw,y+6]);   /* the center labels knock out the dots under them */
  if(hint){ const hw=M.text(g,hint.s,-9999,0,MONO(9,SOFT))/2+5; KO.push([hint.x-hw,hint.y-10,hint.x+hw,hint.y+3]); }
  const B=new A_Ras(g,P.ground);
  /* on the 120 BPM grid: ring j of each field starts drawing on its 8th (Mir's a canon delay later) and flashes as its note sounds;
     the agreeing dots ignite outward from the midpoint across the crossing bells and swell on their bell */
  let tm=null, eA=[], eB=[], eX=[], eE=0; if(anim){ const mu=M.music; tm=m1_tm07(st,c); for(let j=0;j<=Math.max(c.fA.nR,c.fB.nR);j++){ eA.push(mu.env(st,'a'+j,t,200)); eB.push(mu.env(st,'b'+j,t,200)); }
    for(let k=0;k<tm.K;k++) eX.push(mu.env(st,'x'+k,t,260)); eE=mu.env(st,'end',t,500); }
  [[c.fA,0],[c.fB,1]].forEach(([F,fi])=>{ for(let i=0;i<F.n;i++){ if(thin&&(i&1)) continue; const X=F.X[i], Y=F.Y[i]; if(KO.some(k=>X>k[0]&&X<k[2]&&Y>k[1]&&Y<k[3])) continue; let r=F.R[i]*(F.red[i]?1.15:1), col=F.red[i]?RED:INK;
    if(anim){ const j=F.J[i], p=M.ease.outCubic(M.clamp01((t-(fi?tm.sB(j):tm.sA(j)))/DR07)); if(F.T[i]>p) continue; r*=1+.6*(fi?eB[j]:eA[j]);
      if(F.red[i]){ const q=F.dm[i]/c.dmax; if(t<tm.ti(q)) col=INK; else r*=1+.8*(tm.K?eX[Math.min(tm.K-1,Math.round(q*(tm.K-1)))]:0)+.35*eE; } }
    B.dot(X,Y,r,col); } });
  B.flush();
  M.text(g,'Illustration for an essay',L.pad,L.kY,MONO(9,SOFT));
  if(!L.ph) M.text(g,'L-07',w-L.pad,L.kY,MONO(9.5,INK,{weight:500,align:'right'}));
  A_lines(g,L.hl,L.pad-(L.ph?1:2),L.hY,L.lh,DISP(L.hs,INK));
  const lab=(s,x,y)=>M.text(g,s,x,y+3,MONO(9,INK,{align:'center',weight:500}));
  lab('you',L.ax,L.ay); lab('Mir',c.bx,c.by); if(hint) M.text(g,hint.s,hint.x,hint.y,MONO(9,SOFT,{align:'center'}));
  /* credit line: the publication’s illustration credit carries the real wordmark */
  const y1=h-L.pad-16, y2=h-L.pad; const cw=M.text(g,'Illustration',L.pad,y1,MONO(9,SOFT));
  const xh=7, lg=M.logo(g,L.pad+cw+10,y1,xh,{color:INK});   /* 7 px x-height: the wordmark's screen minimum */
  if(!L.ph) M.text(g,'· Mir study',L.pad+cw+10+lg.w+Math.max(8,lg.clear*2),y1,MONO(9,SOFT));
  M.text(g,`${c.cross} crossings`,w-L.pad,y1,MONO(9,INK,{align:'right'}));
  M.text(g,L.ph?'Ink · you and Mir · red · where both agree':'Ink · two fields, you and Mir · red · where both agree',L.pad,y2,MONO(9,SOFT)); }
/* L-07 music, 120 BPM: a canon. Your rings draw as an arpeggio up the home chord, one ring per 8th, each ring its note (mallet);
   Mir's rings follow as the same line at Mir's interval (glide), a canon delay later (1, 3 or 5 16ths: farther is later, and wider
   in the stereo field). Mir's interval is its ring spacing read as a frequency ratio, 1 ÷ spacing, snapped to the nearest just
   interval. Two voices at p/q share every p-th partial of yours, so the crossings ring as bells on that shared partial (an E at 9/8,
   the third at 5/4, the fifth at 3/2), on 16ths outward from the midpoint, inner rings an octave higher. A held drone of the two
   voices is the bed; the arrival is the home chord with the shared partial met on top. */
const BPM07=120, E8_07=250, N16_07=125, DR07=800, PRE07=210;   /* a ring's note sounds when ~60% of it is drawn (outCubic, 210 of 800 ms) */
const IV07=[[2,3],[3,4],[4,5],[5,6],[8,9],[1,1],[9,8],[6,5],[5,4],[4,3],[3,2]];
function m1_r07(pitch){ const x=1/pitch; let b=IV07[5], bd=1e9; for(const v of IV07){ const d=Math.abs(Math.log(x*v[1]/v[0])); if(d<bd){ bd=d; b=v; } } return b; }
const m1_dl07=dist=>dist<2.5?1:dist<5.5?3:5, m1_w07=dist=>Math.min(.75,.15+.06*dist);
/* the canon's timing from the model: ring starts, the crossing window, the red ignition by distance from the midpoint, the arrival */
function m1_tm07(st,c){ const dl=m1_dl07(st.dist), sA=j=>(j-1)*E8_07, sB=k=>(k-1)*E8_07+dl*N16_07, last=Math.max(sA(c.fA.nR),sB(c.fB.nR))+PRE07,
    Tx=Math.ceil((last+E8_07)/E8_07)*E8_07, K=Math.min(10,c.XJ.length), Tend=Math.ceil((Tx+K*N16_07+1)/(2*E8_07))*2*E8_07;
  return {dl,sA,sB,Tx,K,Tend,END:Tend+900,ti:q=>Tx+q*Math.max(0,K-1)*N16_07}; }
/* the shared partial of you (D) and Mir (D × p/q) as Hz in [lo, 2·lo) */
function m1_sh07(p,lo){ let f=M.music.hz('D2','D')*p; while(f<lo) f*=2; while(f>=lo*2) f/=2; return f; }
function music07(st,W,H){ const L=L07lay(W,H), c=L07model(L,W,H,st,null), tm=m1_tm07(st,c), mu=M.music, S=mu.score({bpm:BPM07,ground:st.ground}), md=S.mode, home=m1_home(md), [p,q]=m1_r07(st.pitch), r=p/q, w=m1_w07(st.dist), d3=mu.deg(md,0,3);
  S.harm([[0,home]]);
  S.note(0,'drone',d3,tm.END+300,{ratio:r,level:.42,fade:.6,cutoff:1400});
  for(let j=1;j<=c.fA.nR;j++) S.note(PRE07+tm.sA(j),'mallet',mu.ct(home,d3,Math.min(10,j-1)),120,{vel:.64-.012*j,pan:-w},['a'+j,1]);
  for(let k=1;k<=c.fB.nR;k++){ const f=mu.hz(mu.ct(home,d3,Math.min(10,k-1)),home)*r; S.note(PRE07+tm.sB(k),'glide',{hz:f},110,{vel:.56,pan:w,vibrato:0,attack:.008,release:.22,tone:3000},['b'+k,1]); }
  /* the crossings, outward from the midpoint */
  const X=c.XP, pts=[]; for(let i=0;i<c.XJ.length;i++) pts.push([Math.hypot(X[2*i]-c.mid[0],X[2*i+1]-c.mid[1]),c.XJ[i]]); pts.sort((a,b)=>a[0]-b[0]);
  const D5=mu.hz('D5','D'); for(let k=0;k<tm.K;k++){ const xj=pts[Math.floor((k+.5)*pts.length/tm.K)][1], f=m1_sh07(p,D5)*(xj<=3?2:1);
    S.note(tm.Tx+k*N16_07,'bell',{hz:f},900,{ratio:3,bright:.55,vel:.42,pan:(k%2?1:-1)*w*.5},['x'+k,1]); }
  /* the arrival: home, with the shared partial met on top (or the mode's third, where the shared partial is not in the mode) */
  let fm=m1_sh07(p,mu.hz('D4','D')); const pc=Math.round(12*Math.log2(fm/mu.hz('D4','D'))); if(mu.inMode(md,62+pc)!==62+pc) fm=mu.hz(mu.deg(md,2,4),home);
  S.chord(tm.Tend,'pad',[d3,mu.deg(md,4,3),mu.deg(md,2,4)],1600,{attack:.06,release:1,cutoff:1300,vel:.52},['end',1]);
  S.note(tm.Tend,'meet',{hz:fm},1800,{spread:26,vel:.62},['end',1]); S.hitSound(tm.Tend,'kick',{vel:.4});
  S.end(tm.END+1200); return S.out(); }
/* dragging Mir's center holds the two voices: between whole rings they beat, on a ring they are pure; letting go glides them pure */
const m1_dt07=st=>(st.dist-Math.round(st.dist))*40;
function m1_drag07(st,phase){ const T=m1_T(st), a=m1_au('L-07'); if(!a) return; const [p,q]=m1_r07(st.pitch), f=M.music.hz(M.music.deg(M.music.groundMode(st.ground),0,3),'D');
  if(phase!=='up'){ if(!T.hg&&T.hr&&T.hr.alive){ clearTimeout(T.tg); T.hg=T.hr; T.hr=null; }   /* a drag that starts while the last one is still resolving takes its voice back */
    if(!T.hg||!T.hg.alive) T.hg=a.play('L-07','drone',{freq:f,ratio:p/q,detune:m1_dt07(st),level:.5,fade:.08,cutoff:1600}); else T.hg.set('detune',m1_dt07(st),80); }
  else { const h=T.hg; T.hg=null; if(h&&h.alive){ h.set('detune',0,200); T.hr=h; T.tg=setTimeout(()=>{ h.stop(null,.8); if(T.hr===h) T.hr=null; },380); } } }
M.piece({ id:'L-07',
  caption:'Two ring fields, you and Mir, for an essay on confiding in a machine, with red dots where one field’s marks sit on the other’s rings. Drag Mir’s center or change the spacing; the crossings are recounted as you go.',
  alt:'Two overlapping families of stippled ink rings on a light ground, labeled you and Mir at their centers. Where the rings cross, small clusters of red dots, densest between the two centers. A light headline above; a credit line with the mindgut wordmark below.',
  recipe:{
    idea:'Color appears where the two fields agree, so the accent marks where you and Mir meet.',
    marks:['ring','center'],
    ground:'paper, night, olive',
    accent:'red dots: marks of one field that sit on a ring of the other, near a crossing',
    composition:'Headline across the top; two ring families centered on “you” (left of middle) and “Mir” (draggable); a credit line and the crossing count at the bottom.',
    motion:'At 120 BPM: your rings draw on one per 8th (800 ms outCubic), Mir’s 1, 3 or 5 16ths later by distance, each flashing on its note; after both lines the agreeing dots turn red outward from the midpoint, swelling on the 16th-note bells, and all swell on the arrival. Reduced motion shows the settled frame.',
    sound:'A canon: your rings climb the chord one note each and Mir answers at its own interval, later when farther; the crossings ring as bells on the partial the two voices share, and the chord arrives with that partial on top.',
    controls:['Distance 1–9 rings: the canon delay and the stereo width','Mir’s ring spacing 0.70–1.40×: the interval, snapped to just ratios','Ground: the mode','drag Mir’s center: the held voices retune'],
    computed:['crossings: every pair of circles (j × your spacing, k × Mir’s) with |a − b| < D < a + b meets at two points; points inside the frame and the visible field are counted','agreement: a dot within 2.2 px (1.9 on phones) of a ring of the other field and within max(6 px, a third of the ring spacing) of a crossing'],
    placeholder:['headline','credit line'],
    root:'',
    rules:['your field has a hand’s wobble and a wider spread; Mir’s is finer, with no wobble','the center labels knock out the dots under them'],
    engine:['M.ring','M.logo','M.ease.outCubic','M.rng','M.text','M.wrap','M.music']
  },
  aspect:()=>4/5,
  state:{dist:3.6,angle:-.62,pitch:.92,ground:'paper'},
  controls:[{id:'dist',type:'range',label:'Distance',min:1,max:9,step:.1,fmt:v=>(+v).toFixed(1)+' rings'},
    {id:'pitch',type:'range',label:'Mir’s ring spacing',min:.7,max:1.4,step:.01,fmt:v=>(+v).toFixed(2)+'×'},
    {id:'ground',type:'select',label:'Ground',options:[{value:'paper',label:'Paper'},{value:'night',label:'Night'},{value:'olive',label:'Olive'}]}],
  music:music07,
  /* Mir's spacing glides Mir's held voice against yours (unsnapped, so it beats between the just steps; a bell marks each new step,
     on the shared partial) and settles on the snapped interval when you stop. Distance plays your note and Mir's echo at the new delay and width. */
  musicParam(A,st,id,ov,nv){ const T=m1_T(st), mu=M.music, md=mu.groundMode(st.ground), f=mu.hz(mu.deg(md,0,3),'D');
    if(id==='pitch'){ const [p,q]=m1_r07(nv), key=p+'/'+q; clearTimeout(T.tp);
      if(!T.hp||!T.hp.alive) T.hp=A.play('drone',{freq:f,ratio:1/nv,level:.5,fade:.08,cutoff:1700}); else T.hp.set('ratio',1/nv,60);
      if(key!==T.iv){ T.iv=key; A.play('bell',{freq:m1_sh07(p,mu.hz('D5','D')),ratio:3,dur:1,vel:.3,bright:.5,when:A.now()+.005}); }
      T.tp=setTimeout(()=>{ const h=T.hp; T.hp=null; if(h&&h.alive){ h.set('ratio',p/q,200); setTimeout(()=>h.stop(null,.8),420); } },360); return true; }
    if(id==='dist'){ if(m1_rl(T,'d',150)){ const [p,q]=m1_r07(st.pitch), w=m1_w07(nv), now=A.now()+.008, f4=f*2;
        A.play('mallet',{freq:f4,dur:.12,vel:.5,pan:-w,when:now}); A.play('glide',{freq:f4*p/q,dur:.11,vel:.44,pan:w,vibrato:0,attack:.008,release:.25,tone:3000,when:now+m1_dl07(nv)*N16_07/1000}); } return true; }
    return false; },
  render(g,w,h,M,st){ L07draw(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ L07draw(g,w,h,st,t); return t<m1_tm07(st,A_c(st)).END; },
  pointer(st,e){ const L=L07lay(e.w,e.h), [bx,by]=L07mir(L,st,e.w);
    if(e.type==='down'){ const hit=Math.hypot(e.x-bx,e.y-by)<Math.max(40,L.dr*1.6); A_t(st,'_drag',hit);
      if(hit) m1_drag07(st,'down');
      if(hit&&!st._used){ A_t(st,'_used',true); return true; } return false; }
    if(e.type==='up'){ const was=st._drag; A_t(st,'_drag',false); if(was) m1_drag07(st,'up'); return !!was; }
    if(!st._drag||!e.down) return false;
    const dx=e.x-L.ax, dy=Math.max(L.iy0+8,Math.min(L.iy1-8,e.y))-L.ay; st.dist=Math.round(Math.max(.4,Math.min(11,Math.hypot(dx,dy)/L.dr))*10)/10; st.angle=Math.round(Math.atan2(dy,dx)*1000)/1000; m1_drag07(st,'move'); return true; } });

/* ════════════════════════════════════════════════════════════════
   L-08 · What Mir keeps
   One computed field on a blue-noise base: ring bands (gaussian about each ring radius) give bright, fuller dots; between the rings a
   fine tone of small dots in a tint of the ground. Forgetting removes every dot whose disc would touch the hollow, so the edge is the
   field's own. Tap to forget: the dots inside scatter outward and shrink to nothing over 700 ms.
   ════════════════════════════════════════════════════════════════ */
const HEAD08='Everything it keeps, and the one thing it let go';
function L08lay(w,h){ const g=A_m(), ph=w<450, pad=ph?16:24, hs=ph?28:38, hl=M.wrap(g,HEAD08,(w-2*pad)*(ph?1:.88),{size:hs,weight:300}), lh=A_b(hs*1.08);
  const kY=pad+10, hY=A_b(kY+18+hs*.8), fy0=A_b(hY+(hl.length-1)*lh+(ph?60:44));
  return {ph,pad,hs,hl,lh,kY,hY,fy0,cx:w*.64,cy:fy0+(h-fy0)*.58,Rm:w*.78,hr0:Math.max(18,w*.07)}; }
const L08C=new Map();
function L08field(L,w,h){ const key=w+'x'+h; if(L08C.has(key)) return L08C.get(key); if(L08C.size>4) L08C.clear();
  const P=M.PAL.night, rings=14, dR=L.Rm/rings, hw=Math.max(1.7,dR*.075), cR=L.Rm*.045, r=L.ph?.72:.84, bl=[];
  for(let b=0;b<10;b++) bl.push(M.shape.blade(L.cx,L.cy,b/10*TAU+TAU/20,L.Rm*.30,L.Rm*.52,L.Rm*.07,1.4));
  const X=[],Y=[],Rd=[],C=[], R=M.rng(808), TINT=A_mix(P.ground,P.ring,.24), cols=[P.ring,TINT,P.blade,P.center];
  A_blue({dot(x,y,rr,c){ X.push(x); Y.push(y); Rd.push(rr); C.push(cols.indexOf(c)); }},{ox:0,oy:L.fy0,w,h:h-L.fy0,sp:L.ph?1.55:1.6,seed:8,salt:1,
    density:(x,y)=>{ const dx=x-L.cx, dy=y-L.cy, d=Math.hypot(dx,dy); if(d<cR-4) return 0; const cb=A_g((d-cR)/1.6); if(cb>.2) return cb;
      const i=Math.max(1,Math.round(d/dR)); if(Math.abs(d-i*dR)<hw*1.5) return 0;    /* the ring bands are engraved below */
      let bd=0; if(d>L.Rm*.28&&d<L.Rm*.54) for(const f of bl){ const v=f(x,y); if(v>bd) bd=v; }
      const fd=1-M.ss(L.Rm*.66,L.Rm*1.04,d), tone=(.14+.16*M.noise(x/52,y/52,5))*fd; return Math.max(bd*.36,tone); },
    color:(x,y,d,Rg)=>{ const dd=Math.hypot(x-L.cx,y-L.cy); if(Math.abs(dd-cR)<4) return cols[3]; let bd=0; if(dd>L.Rm*.28&&dd<L.Rm*.54) for(const f of bl){ const v=f(x,y); if(v>bd) bd=v; }
      if(bd>.4&&Rg()<.6) return cols[2]; return cols[1]; },
    rOf:(d)=>d>.45?r*(.58+.62*d):r*.6});
  /* the rings: engraved (M.ring), a dense core and soft edges of hard dots; they thin out with the same fade as the tone */
  const U=M.rng(809); let fd=1; const rsink={dot(x,y,rr){ if(y<L.fy0+1||y>h-1||x<1||x>w-1||U()>fd*.97) return; X.push(x); Y.push(y); Rd.push(rr); C.push(0); }};
  for(let i=1;i*dR<L.Rm*1.12;i++){ const Ri=i*dR; fd=1-M.ss(L.Rm*.66,L.Rm*1.04,Ri); if(fd<=.02) continue; M.ring(rsink,{cx:L.cx,cy:L.cy,R:Ri,w:hw*1.5,swell:.35,dpl:1.25,rCore:r*1.22,rEdge:r*.58,seed:820+i,wobble:.01,color:1}); }
  const out={X:Float32Array.from(X),Y:Float32Array.from(Y),R:Float32Array.from(Rd),C:Uint8Array.from(C),n:X.length,cols,base:new Map()};
  out.ci=[]; for(let i=0;i<out.n;i++) if(out.C[i]===3) out.ci.push(i);
  /* each dot gets a seeded scatter direction and delay for the forgetting */
  const N=out.n; out.SA=new Float32Array(N); out.SD=new Float32Array(N); out.SM=new Float32Array(N); for(let i=0;i<N;i++){ out.SA[i]=(R()-.5)*1.2; out.SD[i]=R()*140; out.SM[i]=.55+R()*.8; }
  L08C.set(key,out); return out; }
const A_hole=(L,w,h,st,i)=>{ const q=st.holes[i]; return [q[0]*w,L.fy0+q[1]*(h-L.fy0),L.hr0*st.size]; };
function L08draw(g,w,h,st,ai,t,ts){ /* ai: index of the hole being forgotten (or -1); t: ms into it; ts: the score's time, for the flashes */
  const P=M.PAL.night, L=L08lay(w,h), F=L08field(L,w,h), SOFT=A_mix(P.ground,P.ink,.52), holes=st.holes.map((_,i)=>A_hole(L,w,h,st,i));
  const B=new A_Ras(g,P.ground), inH=(x,y,rr,hl)=>Math.hypot(x-hl[0],y-hl[1])<hl[2]+rr+.4;
  const bkey=w+'x'+h+'|'+g.dpr+'|'+JSON.stringify(holes.map(q=>q.map(v=>Math.round(v*10))));
  let base=F.base.get(bkey);
  if(base) B.load(base); else { for(let i=0;i<F.n;i++){ const x=F.X[i], y=F.Y[i], rr=F.R[i]; if(holes.some(q=>inH(x,y,rr,q))) continue; B.dot(x,y,rr,F.cols[F.C[i]]); } base=B.snap(); if(F.base.size>2) F.base.clear(); F.base.set(bkey,base); }
  if(ai>=0&&t!=null){ const q=holes[ai], es=ts!=null&&M.music?M.music.env(st,'s*',ts,150):0;   /* the forgetting: inside dots scatter outward and vanish, flashing per pluck */
    for(let i=0;i<F.n;i++){ const x=F.X[i], y=F.Y[i], rr=F.R[i]; if(!inH(x,y,rr,q)) continue; if(holes.some((o,j)=>j!==ai&&inH(x,y,rr,o))) continue;
      const u=M.clamp01((t-F.SD[i])/SC08); if(u>=1) continue; const e=M.ease.outCubic(u), a=Math.atan2(y-q[1],x-q[0])+F.SA[i]*e, d0=Math.hypot(x-q[0],y-q[1]), d=d0+q[2]*F.SM[i]*e;
      B.dot(q[0]+Math.cos(a)*d,q[1]+Math.sin(a)*d,(rr*(1-e)+.001)*(1+.9*es),F.cols[F.C[i]]); } }
  if(ts!=null&&M.music){ const ea=M.music.env(st,'all',ts,450); if(ea>.03) for(const i of F.ci) B.dot(F.X[i],F.Y[i],F.R[i]*(1+.6*ea),F.cols[3]); }   /* the red center answers the hollow chord */
  B.flush();
  M.text(g,'L-08',L.pad,L.kY,MONO(9.5,P.ink,{weight:500}));
  M.text(g,'Illustration',w-L.pad,L.kY,MONO(9,SOFT,{align:'right'}));
  A_lines(g,L.hl,L.pad-(L.ph?1:2),L.hY,L.lh,DISP(L.hs,P.ink));
  const n=holes.length, capT=`forgotten on request · ${n} item${n===1?'':'s'}`, cy0=L.fy0-16, tw=M.text(g,capT,-9999,0,MONO(9,P.ink));
  let cx0=L.pad;
  if(n){ const q=holes[0], tx=Math.max(L.pad,Math.min(w-L.pad-tw,q[0]-12)); cx0=tx; if(q[1]-q[2]-6>cy0+6) M.rule(g,q[0],cy0+6,q[0],q[1]-q[2]-6,SOFT,1); M.text(g,capT,tx,cy0,MONO(9,P.ink)); }
  else M.text(g,capT,L.pad,cy0,MONO(9,P.ink));
  /* hint until first use: on the caption row, left of the caption, if it fits */
  if(!st._used){ const s='Tap the field to forget', fits=n&&L.pad+M.text(g,s,-9999,0,MONO(9,SOFT))+14<cx0; M.text(g,s,L.pad,fits||!n?cy0-(n?0:16):cy0-16,MONO(9,SOFT)); }
  holes.forEach((q,i)=>{ if(i===0) return; M.text(g,String(i+1).padStart(2,'0'),q[0]+q[2]*.74+4,q[1]-q[2]*.74,MONO(9,P.ink,{upper:false})); }); }
/* L-08 music, 144 BPM. A held pad is the memory: D major 9 (D3 A3 F#4 C#5 E5), one voice per tone. On beat 2 the hollow is cut:
   the tones it takes stop, and the top one breaks into a descending sprinkle of plucks on 16ths, quieter and darker as it falls,
   with a last glide sinking a fifth into silence. Hollow size is what is forgotten: small takes the 9th (Dmaj7 is left), mid the 7th
   and 9th (the triad), large the third as well (the bare fifth). On the next downbeat the organ sounds what is left: a hollow fifth
   is the literal sound of a hollow. */
const BPM08=144, BT08=60000/BPM08, N16_08=BT08/4, SC08=5*N16_08, FB08=BT08, DOWN08=4*BT08;
const m1_cat08=sz=>sz<.9?0:sz<1.25?1:2;
function m1_set08(sz){ const d=(k,o)=>M.music.deg('ionian',k,o), V=[d(0,3),d(4,3),d(2,4),d(6,4),d(1,5)], cat=m1_cat08(sz), go=[[d(1,5)],[d(6,4),d(1,5)],[d(2,4),d(6,4),d(1,5)]][cat];
  return {V,cat,go,keep:V.filter(m=>!go.includes(m)),hollow:[[d(0,3),d(4,3),d(2,4),d(6,4)],[d(0,3),d(4,3),d(2,4),d(4,4)],[d(0,3),d(4,3),d(0,4),d(4,4)]][cat],K:[4,5,7][cat]}; }
function m1_score08(st,fb){ const mu=M.music, S=mu.score({bpm:BPM08,mode:'ionian'}), X=m1_set08(st.size), d=(k,o)=>mu.deg('ionian',k,o), END=DOWN08+1500;
  S.harm([[0,'Dmaj9'],[fb,X.cat?'D':'Dmaj7']]);
  X.V.forEach((m,j)=>{ const gone=X.go.includes(m); S.note(0,'pad',m,gone?fb:END,{id:'v'+j,attack:fb>300?.3:.04,release:gone?.12:1.1,vel:.3,cutoff:1300,detune:4,over:'Dmaj9'},j?null:['all',.3]); });
  S.hitSound(fb,'tap',{vel:.3},['st',.6]);
  /* the sprinkle: from the top forgotten tone, down the scale, one pluck per 16th */
  for(let k=0;k<X.K;k++) m1_sn(S,fb+k*N16_08,'pluck',d(1-k,5),150,{cutoff:1600-130*k,vel:.64-.045*k,pan:.25-.08*k},['s'+k,1]);
  { const t=fb+X.K*N16_08, m=d(2-X.K,5); S.note(t,'glide',{hz:mu.hz(m,'D')*2/3},420,{from:mu.hz(m,'D'),glide:380,vel:.26,vibrato:0,attack:.01,release:.35,tone:1600},['s'+X.K,.6]); }
  /* what is left, on the downbeat */
  X.hollow.forEach((m,j)=>S.note(DOWN08,'organ',m,1400,{vel:.46-.02*j,vibrato:3,attack:.03,release:.6},['all',1]));
  S.end(END+700); return S.out(); }
function L08tap(st,i){ const c=A_c(st), L=c.live; if(!L) return; cancelAnimationFrame(c.raf||0);
  /* a tap composes its own short cue (the forgetting two 16ths after the tap) and draws from its heard clock */
  const fb=2*N16_08, sc=m1_score08(st,fb); M.music.attach(st,sc); const a=m1_au('L-08'); let A0=null;
  if(a){ try{ if(c.msh) c.msh.stop(.1); A0=a.now()+.05; c.msh=a.score('L-08',sc.events,{when:A0}); }catch(e){ console.error('L-08 tap',e); A0=null; } }
  const t0=performance.now(); let off=t0;
  const step=now=>{ if(!c.live||c.live.g.__l08!==c) return; let t=now-off; if(A0!=null&&m1_au('L-08')){ t=Math.max(0,(M.music.heard()-A0)*1000); off=now-t; }
    const G=c.live.g; G.setTransform(G.dpr,0,0,G.dpr,0,0); L08draw(G,c.live.w,c.live.h,st,i,t<fb?0:t-fb,t); if(t<DOWN08+600) c.raf=requestAnimationFrame(step); else L08draw(G,c.live.w,c.live.h,st,-1,null); };
  c.raf=requestAnimationFrame(step); }
M.piece({ id:'L-08',
  caption:'A long conversation as a dense field, with a clean hollow where something was forgotten on request, for a piece on memory and privacy. Tap the field to forget at that point; Reset restores it.',
  alt:'A dense stippled ring field on near-black, bright ring dots over a fine tone, cropped at the right and bottom, with a red center. Up and to the left of the center, one clean round gap labeled forgotten on request, 1 item.',
  recipe:{
    idea:'Forgetting is drawn as absence: the marks inside leave, and the edge is crisp because the marks around it stay.',
    marks:['ring','center','blade','hollow'],
    ground:'night',
    accent:'center ring, red',
    composition:'Headline at top left; the field fills the lower frame, centered right of middle and cropped at the right and bottom; a caption line above the first hollow with a hairline down to it.',
    motion:'At 144 BPM: on beat 2 the dots inside the hollow scatter outward and shrink to nothing (outCubic, five 16ths, seeded delays up to 140 ms), flashing on each pluck; the red center answers the downbeat. A tap plays the same move at that point. Reduced motion cuts the hollow at once.',
    sound:'A held major ninth is the memory. Forgetting takes tones out of it: the top one breaks into a falling sprinkle of plucks, one per scattering step, and what is left sounds on the downbeat, down to a bare, hollow fifth.',
    controls:['Hollow size 0.60–1.60×: which tones are forgotten (the 9th; the 7th and 9th; the third too)','tap the field to forget (up to 9)'],
    computed:['hollow: every dot whose disc would touch the circle is removed, so the edge is exact','tone: blue-noise dots between the ring bands, density from noise, fading out from 66% to 104% of the field radius'],
    placeholder:['headline','what was forgotten and where'],
    root:'',
    rules:['no smudge and no leftover strays inside a hollow'],
    engine:['M.ring','M.shape.blade','M.poisson','M.noise','M.ss','M.ease.outCubic','M.text','M.rule','M.music']
  },
  aspect:()=>4/5,
  state:{holes:[[.36,.22]],size:1},
  controls:[{id:'size',type:'range',label:'Hollow size',min:.6,max:1.6,step:.05,fmt:v=>(+v).toFixed(2)+'×'}],
  music:st=>m1_score08(st,FB08),
  /* Hollow size previews what will go: the leaving tone falls as a pluck; crossing into a new size, what would be left sounds first */
  musicParam(A,st,id,ov,nv){ if(id!=='size') return false; const T=m1_T(st), X=m1_set08(nv), now=A.now()+.006, hz=m=>M.music.hz(m,'D');
    if(m1_cat08(ov)!==X.cat){ X.hollow.forEach((m,j)=>A.play('organ',{freq:hz(m),dur:.55,vel:.34,vibrato:2,attack:.02,release:.3,when:now}));
      X.go.slice().reverse().forEach((m,j)=>A.play('pluck',{chord:[hz(m)],dur:.15,vel:.5-.06*j,cutoff:1500-200*j,when:now+.14+j*N16_08/1000})); }
    else if(m1_rl(T,'z',220)) A.play('pluck',{chord:[hz(X.go[X.go.length-1])],dur:.14,vel:.32,cutoff:1100,when:now});
    return true; },
  render(g,w,h,M,st){ const c=A_c(st); c.live={g,w,h}; g.__l08=c; L08draw(g,w,h,st,-1,null); },
  animate(g,w,h,M,st,t){ const c=A_c(st); c.live={g,w,h}; g.__l08=c; if(!st.holes.length){ L08draw(g,w,h,st,-1,null); return false; } L08draw(g,w,h,st,0,t<FB08?0:t-FB08,t); return t<DOWN08+600; },
  pointer(st,e){ const c=A_c(st);
    if(e.type==='down'){ c.down=[e.x,e.y,performance.now()]; return false; }
    if(e.type!=='up'||!c.down) return false; const [x0,y0,t0]=c.down; c.down=null; if(Math.hypot(e.x-x0,e.y-y0)>8||performance.now()-t0>700) return false;
    const L=L08lay(e.w,e.h), hr=L.hr0*st.size; if(e.y<L.fy0+hr*.4||st.holes.length>=9) return false;
    if(st.holes.some((_,i)=>{ const q=A_hole(L,e.w,e.h,st,i); return Math.hypot(e.x-q[0],e.y-q[1])<q[2]+hr*.5; })) return false;
    st.holes.push([Math.round(e.x/e.w*1000)/1000,Math.round((e.y-L.fy0)/(e.h-L.fy0)*1000)/1000]); A_t(st,'_used',true);
    if(RM()||!c.live){ const a=m1_au('L-08'); if(a) a.play('L-08','tap',{vel:.32}); return true; } L08tap(st,st.holes.length-1); return false; } });

/* ════════════════════════════════════════════════════════════════
   L-09 · Where the plate is still · three Chladni modes, computed
   Method: square-plate approximation f(x,y) = cos(nπx)cos(mπy) − cos(mπx)cos(nπy), x,y ∈ [−1,1]; f(0,0)=0 for every mode.
   Bow: grains start on an even blue-noise layer. Each steps along −f·∇f/|∇f|² (a Newton step toward f = 0, clamped to 0.08 plate
   units), up to 16 times; it rests on the nodal line with a residual spread of ~0.6 px along ∇f. Grains that do not converge stay
   where they are (sand still moving). The animation eases each grain along its path with jitter that decays as the plate settles.
   ════════════════════════════════════════════════════════════════ */
const MODE09=[[1,2],[1,4],[2,3],[2,5],[3,4],[1,6],[3,8],[4,7],[5,8],[6,9]].map(([n,m])=>({value:n+','+m,label:`(${n}, ${m})`}));
const NAME09=['a first exchange','settling in','a long conversation'];
function L09lay(w){ const g=A_m(), ph=w<760, pad=ph?16:32, inner=w-2*pad, gap=ph?16:24, colW=ph?inner:Math.max(232,Math.min(268,inner*.24));
  const dek='Three conversations as three modes of a vibrating plate, with sand where the plate is still.';
  const dekS=ph?14:15, dekL=M.wrap(g,dek,colW,{size:dekS,weight:300});
  const mt='Root · Chladni, 1787: sand on a bowed plate gathers where it is still. Simplified: a square-plate model.';
  const mtL=A_wrapT(mt,colW,{font:'mono',size:9,track:.04}); const o={ph,pad,inner,gap,colW,dekL,dekS,mtL};
  if(ph){ const sm=Math.floor((inner-gap)/2); o.ps=[sm,sm,inner]; let y=pad+12; o.kY=y; o.tY=A_b(y+20+34*.8); y=o.tY+(inner<340?36:0); o.tL=inner<340?['Where the plate','is still']:['Where the plate is still'];
    o.dY=A_b(y+30); y=o.dY+(dekL.length-1)*20; const py=A_b(y+28); o.pp=[[pad,py,sm],[pad+sm+gap,py,sm]]; y=py+sm+48; o.pp.push([pad,A_b(y),inner]); y=A_b(y)+inner+48; o.mY=A_b(y+8); o.H=A_b(o.mY+(mtL.length-1)*13+pad+4); }
  else { const avail=inner-colW-40-2*gap, k=[.62,.8,1], s3=Math.floor(avail/k.reduce((a,b)=>a+b,0)), ps=k.map(f=>Math.floor(s3*f)); o.ps=ps; const yb=pad+8+s3; let x=pad+colW+40; o.pp=ps.map(s=>{ const p=[x,yb-s,s]; x+=s+gap; return p; });
    o.kY=pad+12; o.tY=A_b(pad+12+20+44*.8); o.tL=['Where the plate','is still']; o.dY=A_b(o.tY+44+32); const dEnd=o.dY+(dekL.length-1)*20;
    o.mY=A_b(Math.max(dEnd+36,yb+44-(mtL.length-1)*13)); o.H=A_b(Math.max(yb+44,o.mY+(mtL.length-1)*13)+pad+4); }
  return o; }
const L09C=new Map();
function L09grains(s,mode,dpr,ph){ const key=s+'|'+mode+'|'+ph; if(L09C.has(key)) return L09C.get(key); if(L09C.size>12) L09C.clear();
  const [n,m]=mode.split(',').map(Number), PI=Math.PI, half=s/2, sp=ph?2.15:2.35, pts=A_pbox(s,s,sp,1787), N=pts.length/2, R=M.rng(9+s+n*31+m*7);
  const SX=new Float32Array(N), SY=new Float32Array(N), TX=new Float32Array(N), TY=new Float32Array(N), DL=new Float32Array(N), DU=new Float32Array(N), PH=new Float32Array(N), RD=new Float32Array(N);
  const ev=(u,v)=>{ const cnu=Math.cos(n*PI*u), cmv=Math.cos(m*PI*v), cmu=Math.cos(m*PI*u), cnv=Math.cos(n*PI*v);
    return [cnu*cmv-cmu*cnv, -n*PI*Math.sin(n*PI*u)*cmv+m*PI*Math.sin(m*PI*u)*cnv, -m*PI*cnu*Math.sin(m*PI*v)+n*PI*cmu*Math.sin(n*PI*v)]; };
  for(let i=0;i<N;i++){ const x=pts[2*i], y=pts[2*i+1]; SX[i]=x; SY[i]=y; let u=x/half-1, v=y/half-1, f, fx, fy, ok=false;
    for(let it=0;it<16;it++){ [f,fx,fy]=ev(u,v); const g2=fx*fx+fy*fy; if(g2<1e-8) break; if(Math.abs(f)/Math.sqrt(g2)*half<.25){ ok=true; break; }
      let dx=-f*fx/g2, dy=-f*fy/g2; const L=Math.hypot(dx,dy); if(L>.08){ dx*=.08/L; dy*=.08/L; } u=Math.max(-1,Math.min(1,u+dx)); v=Math.max(-1,Math.min(1,v+dy)); }
    if(!ok){ [f,fx,fy]=ev(u,v); }
    const gl=Math.hypot(fx,fy)||1, k=ok?R.gauss()*.6:0; TX[i]=(u+1)*half+fx/gl*k; TY[i]=(v+1)*half+fy/gl*k;
    DL[i]=R()*560; DU[i]=1450+R()*450; PH[i]=R()*TAU; RD[i]=(ok?.64:.58)*(1+.22*(R()-.5)); }
  /* q75: when three quarters of the grains are 90% of the way to their line (outCubic reaches .9 at u = 1 − ∛0.1) */
  const ts=new Float32Array(N), u9=1-Math.cbrt(.1); for(let i=0;i<N;i++) ts[i]=DL[i]+u9*DU[i]; ts.sort();
  const out={N,SX,SY,TX,TY,DL,DU,PH,RD,q75:ts[Math.floor(N*.75)]}; L09C.set(key,out); return out; }
function L09draw(g,w,h,st,t){ const P=M.PAL.night, L=L09lay(w), SOFT=A_mix(P.ground,P.ink,.52), HAIR=A_mix(P.ground,P.ink,.2), modes=[st.p1,st.p2,st.p3];
  const anim=t!=null, off=anim?m1_off09(L,modes):null, ec=anim&&M.music?M.music.env(st,'ctr',t,600):0;
  /* a frame redraws only the three plate squares (one raster each); the type and ticks stay from the settled render.
     Each plate starts its bow so that it rings on its beat; its jitter decays with its bow noise; its lines swell with its ring. */
  let B=anim?null:new A_Ras(g,P.ground);
  L.pp.forEach(([x0,y0,s],pi)=>{ const G=L09grains(s,modes[pi],g.dpr,L.ph), c=s/2, cr=Math.max(6,s*.032), cr2=cr*cr, sc=s>240?1.12:s>170?1:.92;
    const tt=anim?t-off[pi]:0, J=anim?m1_jit09(tt):0, ep=anim&&M.music?M.music.env(st,'pl'+pi,t,700):0;
    if(anim) B=new A_Ras(g,P.ground,[x0,y0,x0+s,y0+s]);
    for(let i=0;i<G.N;i++){ let x, y; if(anim){ const e=M.ease.outCubic(M.clamp01((tt-G.DL[i])/G.DU[i])); x=G.SX[i]+(G.TX[i]-G.SX[i])*e; y=G.SY[i]+(G.TY[i]-G.SY[i])*e;
        if(J>0){ const ph=G.PH[i]; x+=J*Math.sin(t*.045+ph); y+=J*Math.cos(t*.037+ph*1.7); } } else { x=G.TX[i]; y=G.TY[i]; }
      const ctr=(x-c)*(x-c)+(y-c)*(y-c)<cr2; B.dot(x0+x,y0+y,G.RD[i]*sc*(1+.32*ep+(ctr?.9*ec:0)),ctr?P.center:P.ring); }
    if(anim) B.flush(); });
  if(anim) return;
  B.flush();
  M.text(g,'Plate L-09 · concept',L.pad,L.kY,MONO(L.ph?9:9.5,SOFT));
  A_lines(g,L.tL,L.pad-(L.ph?1:3),L.tY,A_b((L.ph?34:44)*1.04),DISP(L.ph?34:44,P.ink));
  A_lines(g,L.dekL,L.pad,L.dY,20,{size:L.dekS,weight:300,color:P.ink});
  L.pp.forEach(([x0,y0,s],pi)=>{ const [n,m]=modes[pi].split(','); A_ticks(g,x0-6,y0-6,x0+s+6,y0+s+6,8,HAIR); const ly=y0+s+24;
    M.text(g,`${['I','II','III'][pi]} · ${NAME09[pi]}`,x0,ly,{size:L.ph&&pi<2?12:13,weight:400,color:P.ink});
    M.text(g,`mode (${n}, ${m})`,x0,ly+16,MONO(9,SOFT)); });
  A_lines(g,L.mtL,L.pad,L.mY,13,MONO(9,SOFT,{upper:false,track:.04})); }
/* L-09 music, 80 BPM in 3/4. The bow is a noise bed whose level is the sand's jitter, 3.2 (1 − T)² per plate, stroked up and down on
   the 8ths, so it crossfades into the plates' tones as the sand settles. Each plate is a bowed mode: modes rank by n² + m² (a square
   plate's frequency rises with it), and rank r sounds the r-th tone of the D chord up from D3, so the three plates are one voicing and
   changing a mode changes it. Plate I rings on beat 3, II on beat 4, III on beat 5 (a bowed tone swelling in, struck as its lines form;
   the plate you changed loudest); on the next downbeat the third meets above the still center. A low octave drone holds D under it all. */
const BPM09=80, BT09=750, RING09=pi=>(pi+2)*BT09, END09=6*BT09;
const RANK09=(()=>{ const v=MODE09.map(o=>{ const [n,m]=o.value.split(',').map(Number); return [o.value,n*n+m*m]; }).sort((a,b)=>a[1]-b[1]), r={}; v.forEach(([k],i)=>{ r[k]=i; }); return r; })();
/* each plate's bow starts so that three quarters of its sand reaches its line on the plate's beat */
const m1_off09=(L,modes)=>L.pp.map(([x0,y0,s],pi)=>RING09(pi)-L09grains(s,modes[pi],1,L.ph).q75);
const m1_jit09=tt=>{ const T=M.clamp01(tt/2500); return 3.2*(1-T)*(1-T); };
function music09(st,W){ const L=L09lay(W), modes=[st.p1,st.p2,st.p3], off=m1_off09(L,modes), mu=M.music, S=mu.score({bpm:BPM09,meter:[3,4],mode:'ionian'}), prev=st._mus&&st._mus.m1m;
  S.harm([[0,'D']]);
  S.note(0,'drone','D2',END09+1400,{ratio:2,level:.36,fade:.6,cutoff:900});
  S.note(0,'noise','D2',END09,{id:'bow',color:.62,level:.0001,fade:.05},['bow',.3]);
  for(let tt=0;tt<END09;tt+=BT09/2){ const j=off.reduce((a,o)=>a+m1_jit09(tt+BT09/4-o)/3.2,0)/3, up=(tt/(BT09/2))%2<1; S.set(tt,'bow','level',.52*j*(up?1:.62),140); }
  S.set(END09-200,'bow','level',0,300);
  modes.forEach((md,pi)=>{ const m=mu.ct('D','D3',RANK09[md]||0), v=!prev?.4:prev[pi]!==md?.56:.3, t0=Math.max(0,RING09(pi)-2*BT09), pan=(pi-1)*.4;
    S.note(t0,'glide',m,END09+1200-t0,{attack:1.3,release:1.2,vel:v,vibrato:3,rate:4.6,wow:1.2,tone:1900,pan},['pl'+pi,.25]);
    S.note(RING09(pi),'bell',m+12,2600,{ratio:3,bright:.7,vel:v*.9,pan},['pl'+pi,1]); });
  S.note(END09,'meet','F#4',2000,{spread:24,vel:.5},['ctr',1]); S.note(END09,'pluck','D3',500,{cutoff:700,vel:.5},['ctr',.5]);
  S.end(END09+2400); const o=S.out(); o.m1m=modes.slice(); return o; }
M.piece({ id:'L-09',
  caption:'Three conversations drawn as three Chladni modes of a square plate, with the sand on the lines where the plate does not move. Pick a mode for each plate and watch the sand run to its new lines.',
  alt:'Three square Chladni figures in white stipple on near-black, growing in size and complexity from left to right, each with a small red cluster at the center where the nodal lines meet.',
  recipe:{
    idea:'State shows as a picture resolving: each conversation is a figure made of stillness, and every mode keeps the same still center.',
    marks:['dot','center'],
    ground:'night',
    accent:'center, red: the sand at the plate’s center, still in every mode',
    composition:'Title, dek and root in a left column; three square plates growing left to right (I, II, III), each labeled with its name and mode; on phones, two small plates over one large.',
    motion:'At 80 BPM in 3/4: each grain eases from an even layer to its nodal line over 1.45–1.9 s (outCubic, delays up to 560 ms) with jitter that decays over 2.5 s; each plate starts so that it settles on its beat (I, II, III on beats 3, 4, 5), its lines swelling as it rings, and the red center answers the downbeat. Reduced motion shows the settled figures.',
    sound:'The bow is a hiss stroked on the 8ths that fades as the sand settles into each plate’s ringing tone; the three modes are three tones of one chord, ranked by n² + m², ringing in turn, and the third meets above the still center.',
    controls:['Plate I, II and III mode: each plate’s tone in the chord, by n² + m² (the changed plate rings loudest)'],
    computed:['f(x, y) = cos(nπx)cos(mπy) − cos(mπx)cos(nπy) on x, y ∈ [−1, 1], a square-plate approximation; f(0, 0) = 0 for every mode','grains start on a blue-noise layer and take up to 16 Newton steps along −f·∇f/|∇f|² (clamped to 0.08 plate units) toward f = 0, then rest with ~0.6 px spread along ∇f; grains that do not converge stay put','red: grains within 3.2% of the plate size of the center'],
    placeholder:['the three conversation names'],
    root:'Chladni, 1787',
    rules:[],
    engine:['M.poisson','M.rng','M.ease.outCubic','M.text','M.wrap','M.rule','M.music']
  },
  aspect:w=>w/L09lay(w).H,
  state:{p1:'1,4',p2:'2,5',p3:'3,8'},
  controls:[{id:'p1',type:'select',label:'Plate I',options:MODE09,play:true},{id:'p2',type:'select',label:'Plate II',options:MODE09,play:true},{id:'p3',type:'select',label:'Plate III',options:MODE09,play:true}],
  music:music09,
  render(g,w,h,M,st){ L09draw(g,w,h,st,null); },
  animate(g,w,h,M,st,t){ L09draw(g,w,h,st,t); return t<END09+400; } });
})();
