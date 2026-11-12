/* agent D pieces · L-16…L-20 · round 3.
   Every figure is placed dots (M.ring for rings, a jittered lattice for bars). Hairline M.rule only for chrome and dividers;
   flat fills only for UI surfaces. Type: Geist 300 for voice, Geist Mono uppercase for labels. No serif.
   The wordmark is only ever drawn with M.logo, one flat color; where brand meets Mir, the field begins at the i's tittle.
   Animated pieces cache a static base per (size, dpr, settings) and draw only the moving dots per frame.
   Helpers are prefixed d5_ so they never collide with other agents' files. */
(function(){
'use strict';
const M=window.MIR, TAU=Math.PI*2, E=M.ease, cl=M.clamp01, lerp=M.lerp;
const q4=v=>Math.round(v/4)*4;
const d5_cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const d5_RM=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(_){ return false; } };
const d5_hex=c=>{ c=c.replace('#',''); return [0,2,4].map(i=>parseInt(c.slice(i,i+2),16)); };
const d5_mixC=new Map();
/* a tint: one color mixed toward another. Secondary dots are tints of the ground, never a neutral gray. */
const d5_mix=(a,b,t)=>{ const k=a+b+t; let v=d5_mixC.get(k); if(v) return v; const A=d5_hex(a), B=d5_hex(b); v='#'+A.map((x,i)=>Math.round(x+(B[i]-x)*t).toString(16).padStart(2,'0')).join(''); d5_mixC.set(k,v); return v; };
/* per-state caches in a WeakMap, so "Copy settings" never serializes them and Reset starts clean */
const d5_WM=new WeakMap();
const d5_c=st=>{ let c=d5_WM.get(st); if(!c){ c={}; d5_WM.set(st,c); } return c; };
function d5_slot(st,name,key,make){ const c=d5_c(st), s=c[name]; if(s&&s.key===key) return s.v; const v=make(); c[name]={key,v}; return v; }
function d5_off(w,h){ const cv=document.createElement('canvas'); return {cv,g:M.canvas(cv,w,h)}; }
function d5_blit(g,cv){ g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(cv,0,0); g.restore(); }
const d5_DK=(w,h)=>w+'x'+h+'@'+Math.min(3,window.devicePixelRatio||1);
const d5_memo=f=>{ const m=new Map(); return w=>{ let v=m.get(w); if(!v){ if(m.size>8) m.clear(); v=f(w); m.set(w,v); } return v; }; };
let d5_MC=null; const d5_ctx=()=>{ if(!d5_MC){ d5_MC=document.createElement('canvas').getContext('2d'); d5_MC.dpr=1; } return d5_MC; };

/* type */
const d5_lab=(g,s,x,y,c,size=10,o={})=>M.text(g,s,x,y,Object.assign({font:'mono',size,weight:500,track:.14,upper:true,color:c},o));
const d5_trk=s=>s>=40?-.04:s>=28?-.03:s>=18?-.016:-.004;
const d5_disp=(g,s,x,y,size,c,o={})=>M.text(g,s,x,y,Object.assign({font:'display',size,weight:300,track:d5_trk(size),color:c},o));
function d5_para(g,s,x,y,maxW,o){ const oo=Object.assign({weight:300,track:d5_trk(o.size)},o), lines=M.wrap(g,s,maxW,oo), lh=o.lh||Math.round(o.size*1.4); lines.forEach((l,i)=>M.text(g,l,x,y+i*lh,oo)); return y+(lines.length-1)*lh; }
/* wrap measured exactly as the line will be set (tracking and caps included), so tracked mono never runs past its measure */
function d5_wrapT(str,maxW,o){ const out=[]; let line=''; for(const wd of String(str).split(/\s+/)){ const t=line?line+' '+wd:wd; if(line&&d5_tw(t,o)>maxW){ out.push(line); line=wd; } else line=t; } if(line) out.push(line); return out; }
function d5_monoP(g,str,x,y,maxW,c,size=9,lh=14){ const o={font:'mono',size,weight:500,track:.14,upper:true}; const L=d5_wrapT(str,maxW,o); L.forEach((l,i)=>d5_lab(g,l,x,y+i*lh,c,size)); return y+(L.length-1)*lh; }
const d5_lines=(s,maxW,o)=>M.wrap(d5_ctx(),s,maxW,Object.assign({weight:300},o));
const d5_tw=(s,o)=>{ const g=d5_ctx(), size=o.size||11; g.font=`${o.weight||400} ${size}px ${M.FONT[o.font||'display']}`; const str=o.upper?String(s).toUpperCase():String(s), tr=(o.track||0)*size; if('letterSpacing' in g){ g.letterSpacing=tr+'px'; const w=g.measureText(str).width-tr; g.letterSpacing='0px'; return w; } return g.measureText(str).width+tr*(str.length-1); };
/* flat UI surface (allowed in UI pieces only): a filled rounded rectangle, no stroke, no shadow */
function d5_rr(g,x,y,w,h,r,c){ g.fillStyle=c; g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); g.fill(); }
function d5_disc(g,cx,cy,r,c){ g.fillStyle=c; g.beginPath(); g.arc(cx,cy,r,0,TAU); g.fill(); }
function d5_head(g,w,id,left,right,c,o){ const ph=w<480, y=ph?24:28, pad=ph?16:(o&&o.pad)||24, lw=d5_lab(g,id+' · '+left,pad,y,c,ph?9.5:10);
  if(right&&!ph&&pad+lw+32+d5_tw(right,{font:'mono',size:9.5,track:.14,upper:true,weight:500})<w-pad) d5_lab(g,right,w-pad,y,c,9.5,{align:'right'}); }

/* dots */
/* d5_field: the Mir field at any size. Engraved rings (M.ring: dense core, soft edges of hard dots); k loosens; an optional
   center ring in the accent. disp(i) adds px to ring i (breath); scale(i) multiplies its radius (settling tighter). */
function d5_field(B,o){ const cx=o.cx, cy=o.cy, R=o.R, n=o.rings||Math.max(3,Math.min(9,Math.round(R/9))), k=o.k??1, loose=1-k, seed=o.seed||1, z=o.z||1;
  for(let i=1;i<=n;i++){ const Ri=R*(i/n)*(o.scale?o.scale(i):1)+(o.disp?o.disp(i):0), bw=Math.max(1.5,R*.026)*(.8+.4*i/n)*(o.wk||1);
    M.ring(B,{cx,cy,R:Ri,w:bw+loose*R*.045,swell:.5,dpl:(o.dpl||1)*Math.min(1.5,.35+bw*.42),rCore:.95*z,rEdge:.55*z,seed:seed*31+i*13,color:o.color,wobble:loose*.13,loose:loose*R*.1}); }
  if(o.center){ const cR=Math.max(2.4,R*.085), cw=Math.max(1.3,cR*.34);
    M.ring(B,{cx,cy,R:cR,w:cw+loose*cR*.5,swell:.3,dpl:1.7,rCore:1*z,rEdge:.6*z,seed:seed+5,color:o.center,ex:1+loose*.8,ey:1-loose*.3,rot:.7,loose:loose*cR*.35}); } }
/* a leaning bar, stippled on a jittered lattice in its own frame (cheap enough for a hundred bars) */
function d5_bar(B,R,cx,cy,len,wid,ang,col,cell,r){ const c=Math.cos(ang), s=Math.sin(ang), nu=Math.max(2,Math.round(len/cell)), nv=Math.max(1,Math.round(wid/cell));
  for(let i=0;i<nu;i++) for(let j=0;j<nv;j++){ const u=((i+.22+R()*.56)/nu-.5)*len, v=((j+.22+R()*.56)/nv-.5)*wid; B.dot(cx+u*c-v*s,cy+u*s+v*c,r*(.88+R()*.26),typeof col==='function'?col(i/(nu-1||1)):col); } }
/* the breath rail: 21 leaning bars, `lit` of them in the accent. skip = an index left out (drawn by the animation) */
function d5_rail(B,x,yb,W,Hh,lit,P,o={}){ const pitch=W/21, lean=-Math.PI/2+.3, len=Hh/Math.cos(.3), wid=Math.max(1.8,pitch*.46), tint=d5_mix(P.ground,P.ring,.26), cell=o.cell||Math.max(.95,wid*.36);
  for(let i=0;i<21;i++){ if(i===o.skip) continue; const R=M.rng(700+i*7+(o.seed||0)); d5_bar(B,R,x+(i+.5)*pitch,yb-Hh/2,len,wid,lean,i<lit?P.center:tint,cell,o.r||.62); } }
/* atmosphere: the same light as M.atmos (density falls off from the center and gathers into rays), placed on a jittered lattice
   instead of a fresh Poisson set per poster. At this sparseness (≤ 20% acceptance) the lattice reads salt-free, and a cold
   render of four posters stays inside budget. */
function d5_atmos(B,o){ const sp=o.sp||2.2, [x0,y0,x1,y1]=o.box, R=M.rng((o.seed||5)*31+7), amt=o.amount??.12, nr=o.rays||0, rp=o.rayPow||6, r=o.r??.5;
  for(let y=y0;y<y1;y+=sp) for(let x=x0;x<x1;x+=sp){ const px=x+(.1+R()*.8)*sp, py=y+(.1+R()*.8)*sp, dx=px-o.cx, dy=py-o.cy, d=Math.hypot(dx,dy)/o.R; let v=amt*Math.exp(-d*d*1.6); const q=R(); if(v<.004) continue;
    if(nr){ const a=Math.atan2(dy,dx); v*=.35+.65*Math.pow(.5+.5*Math.cos(a*nr+(o.rayPhase||0)),rp)*1.6; } if(q<v) B.dot(px,py,r*(.85+.3*R()),o.color); } }
/* ring clipped to a box: only the arcs that fall inside are computed (posters and billboards stay inside budget) */
function d5_ringIn(B,o,box,pad=6){ const N=240, cx=o.cx, cy=o.cy, r=o.R, [x0,y0,x1,y1]=box, ins=[]; let any=false, all=true;
  for(let k=0;k<N;k++){ const a=k/N*TAU, x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r, v=x>x0-pad&&x<x1+pad&&y>y0-pad&&y<y1+pad; ins.push(v); any=any||v; all=all&&v; }
  if(!any) return; if(all){ M.ring(B,o); return; }
  /* walk once around from an outside sample; each run of inside samples becomes one arc (padded half a sample each side) */
  const s=ins.findIndex(v=>!v), runs=[]; let st=-1;
  for(let k=1;k<=N;k++){ const v=ins[(s+k)%N]; if(v&&st<0) st=k; if(!v&&st>=0){ runs.push([s+st-.5,s+k-.5]); st=-1; } }
  runs.forEach((rn,j)=>M.ring(B,Object.assign({},o,{a0:rn[0]/N*TAU,a1:rn[1]/N*TAU,seed:(o.seed||1)+j*101}))); }

/* ── music (M2; the same helpers as pieces-c.js). Each piece composes a score from its own data with M.music; the frame plays it
   on the piece's bus and drives animate's t from the heard audio clock, and the pictures answer the notes through M.music.env.
   The person is the root (D), the model the fifth (A), Mir the third (F#); loose is the suspension, in tune the third arrives. ── */
const mu=M.music;
/* direct audio for pointer sounds and previews: the piece's own bus, honoring the switch and the stored per-piece mute */
function m2_A(id){ const a=M.audio; if(!a||!a.enabled||!a.unlocked) return null;
  try{ if(JSON.parse(localStorage.getItem('mir.soundMute')||'[]').includes(id)) return null; }catch(_){}
  return {now:()=>a.now(),play:(n,o)=>a.play(id,n,o),score:(e,o)=>a.score(id,e,o),bus:()=>a.bus(id)}; }
const m2_hz=(m,sym)=>mu.hz(m,sym||'D');
function m2_gate(st,k,ms){ const c=d5_c(st), now=performance.now(); c.pg=c.pg||{}; if(now-(c.pg[k]||0)<ms) return false; c.pg[k]=now; return true; }
const m2_env=(st,k,t,tau)=>mu.env(st,k,t,tau);
/* does note m, tuned over sym, sit at a simple ratio (within 4 cents) to every tone of sym? (the library's consonance test) */
const M2_SIMPLE=[1,9/8,6/5,5/4,4/3,64/45,45/32,3/2,8/5,5/3,16/9,9/5,15/8,7/4,7/5,10/7,7/6,8/7,10/9];
function m2_cons(sym,m){ const f=m2_hz(m,sym); return mu.tones(sym,m-12,m+12).every(c=>{ if(c===m) return true; let q=Math.max(f,m2_hz(c,sym))/Math.min(f,m2_hz(c,sym)); while(q>=2-1e-6) q/=2; return q<1+1e-6||M2_SIMPLE.some(x=>Math.abs(1200*Math.log2(q/x))<=4); }); }

/* ════════════════════════════════════════════════════════════════════════
   L-16 · Voice · voice mode on a phone, olive. Two ring families, you and Mir, with offset centers.
   The speaker's rings breathe outward: each syllable sends one breath through the rings, 70 ms per ring.
   The syllables are COMPUTED from the transcript's words (vowel groups per word), timed by a seeded jitter and the Pace
   control; the envelope is attack 45 ms / decay 170 ms per syllable. Not real audio, and no waveform meter anywhere.
   The listener's rings tighten (−10% spacing) and settle (k .72 → .98) on a slow follower of the speaker's envelope.
   ════════════════════════════════════════════════════════════════════════ */
const P16=M.PAL.olive, C16={scr:'#192016', hair:'#2b3228', ink:P16.ring, soft:'#a3a898', dim:'#727a69', inp:'#20281d', end:'#2a3326', acc:P16.center, mir:d5_mix(P16.blade,P16.ring,.36), tint:d5_mix('#192016',P16.ring,.3)};
const SAY16={you:'I keep putting off the call. I think I know why now.', mir:'What would make the first minute of it easier?'};
function d5_syl(word){ const w=word.toLowerCase().replace(/[^a-z]/g,''); if(!w) return 0; let n=(w.match(/[aeiouy]+/g)||[]).length; if(n>1&&/e$/.test(w)&&!/[^aeiou]le$/.test(w)) n--; return Math.max(1,n); }
const d5_RH=new Map();
/* the syllables, counted from the words and set on the music's grid: 2 bars of 4/4 at 120 × Pace BPM, one syllable per 16th or
   longer (the spoken timing, seeded, rounded to the nearest free 16th), so the loop is exactly 2 bars at any Pace */
function d5_rhythm(who,pace){ const key=who+pace; if(d5_RH.has(key)) return d5_RH.get(key);
  const R=M.rng(who==='you'?1601:1607), words=SAY16[who].split(' '), raw=[]; let t=360;
  words.forEach((wd,w)=>{ const n=d5_syl(wd); for(let k=0;k<n;k++){ const d=118+R()*64; raw.push({t,s:k===0?.85+R()*.15:.42+R()*.3,w,first:k===0,last:k===n-1}); t+=d; } t+=/[.,?]$/.test(wd)?320:28+R()*50; });
  let prev=-1; raw.forEach(q=>{ q.n=Math.max(prev+1,Math.round(q.t/125)); prev=q.n; }); const top=raw[raw.length-1].n; if(top>29) raw.forEach(q=>{ q.n=Math.round(q.n*29/top); });
  const s16=125/pace, T=32*s16, S=[], W=[];
  raw.forEach((q,i)=>{ const nx=i+1<raw.length?raw[i+1].n:q.n+3, end=q.last&&/[.?]$/.test(words[q.w]); S.push({t:q.n*s16,d:Math.min(nx-q.n,end?3:2)*s16,s:q.s,w:q.w}); if(q.first) W.push(q.n*s16); });
  const speak=S[S.length-1].t+S[S.length-1].d, N=Math.ceil(T/10), env=new Float32Array(N), slow=new Float32Array(N);
  for(const q of S) for(let i=Math.floor(q.t/10);i<N;i++){ const u=i*10-q.t; if(u<0) continue; const a=u<45?u/45:Math.exp(-(u-45)/170); if(u>45&&a<.01) break; env[i]+=q.s*a; }
  let y=0; for(let pass=0;pass<2;pass++) for(let i=0;i<N;i++){ y+=(Math.min(1,env[i])-y)*.03; slow[i]=y; }   /* two passes: the loop's steady state */
  const v={S,W,T,N,env,slow,speak,rate:S.length/(speak/1000)}; d5_RH.set(key,v); return v; }
const d5_at=(arr,Rh,t)=>arr[Math.min(Rh.N-1,Math.max(0,Math.floor((((t%Rh.T)+Rh.T)%Rh.T)/10)))];
const lay16=d5_memo(function(w){ const wide=w>=540, pad=wide?24:16, ts=wide?40:32, tb=wide?76:64, sy=wide?96:84;
  if(wide){ const sw=q4(Math.min(300,(w-2*pad)*.54)), sh=q4(sw*2.04), nx=pad+sw+28; return {wide,pad,ts,tb,sx:pad,sy,sw,sh,nx,nw:w-pad-nx,ny:sy+4,H:sy+sh+pad}; }
  const sw=w, sh=q4(w*1.62), ny=sy+sh+36, L={wide,pad,ts,tb,sx:0,sy,sw,sh,nx:pad,nw:w-2*pad,ny}; L.H=q4(col16(null,L,{pace:1,speaker:'you'})+24); return L; });
const geo16=d5_memo(function(w){ const L=lay16(w), {sx,sy,sw,sh}=L, m=q4(Math.max(16,sw*.068)), xh=d5_cl(sw*.03,8,10.5), hb=sy+m+12, hl=hb+m;
  const fx=sx+sw/2, fy=sy+sh*.36, d=sw*.105, sp=sw*.052;
  return {L,m,xh,hb,hl,fx,fy,sp,you:[fx-d,fy+d*.55],mir:[fx+d,fy-d*.55],ty:q4(sy+sh*.655),ts:d5_cl(sw*.085,22,28),by:sy+sh-m-40}; });
/* the notes column: rhythm score (static part), legend and rules. Returns the y where it ends (used to size the phone layout). */
function col16(g,L,st){ const meas=!g; if(meas) g=d5_ctx(); const x=L.nx, W=L.nw, Rh=d5_rhythm(st.speaker,st.pace); let y=L.ny+12;
  d5_lab(g,'Syllable rhythm',x,y,C16.ink,9.5); y+=16; d5_lab(g,'counted from the words',x,y,C16.dim,9); y+=50;   /* score drawn live at y-14 */
  y+=4; d5_lab(g,'0 s',x,y,C16.dim,9); d5_lab(g,(Rh.T/1000).toFixed(1)+' s · loops',x+W,y,C16.dim,9,{align:'right'}); y+=28;
  d5_lab(g,'Pace '+st.pace.toFixed(2)+'× · '+Rh.rate.toFixed(1)+' syll/s',x,y,C16.ink,9); y+=44;
  const rows=[['You',C16.ink,'Light rings, center lower left.'],['Mir',C16.mir,'Green rings, center upper right.'],['Meet',C16.acc,'Ochre at the midpoint: where the two of you meet.']];
  rows.forEach(([k,c,s])=>{ const B=meas?null:new M.Buf(g); if(B){ if(k==='Meet') d5_field(B,{cx:x+7,cy:y-3,R:4.5,rings:1,k:.95,color:c,seed:9}); else d5_field(B,{cx:x+7,cy:y-3,R:8,rings:2,k:.95,color:c,seed:k.length,dpl:.55}); B.flush(); }
    d5_lab(g,k,x+24,y,c,9.5); y=d5_para(g,s,x+24,y+18,W-24,{size:13,lh:17,color:C16.soft})+26; });
  y+=4; d5_lab(g,'Rules',x,y,C16.ink,9.5); y+=20;
  ['The speaker’s rings breathe out: one breath per syllable, 70 ms per ring.','The listener’s rings tighten 10% and settle while the other speaks.','No waveform, no level meter, no face.'].forEach(s=>{ y=d5_para(g,s,x,y,W,{size:13,lh:17,color:C16.soft})+24; });
  return y-24; }
function base16(st,w,h){ return d5_slot(st,'base',d5_DK(w,h)+st.speaker+st.pace,()=>{ const G=geo16(w), L=G.L, {cv,g}=d5_off(w,h), {sx,sy,sw,sh}=L;
  M.fill(g,P16.ground); d5_head(g,w,'L-16','UI · voice mode',null,C16.soft); d5_disp(g,'Voice',L.pad,L.tb,L.ts,C16.ink);
  M.fill(g,C16.scr,sx,sy,sw,sh); if(L.wide){ M.rule(g,sx,sy,sx+sw,sy,C16.hair); M.rule(g,sx+sw,sy,sx+sw,sy+sh,C16.hair); M.rule(g,sx,sy+sh,sx+sw,sy+sh,C16.hair); M.rule(g,sx,sy,sx,sy+sh,C16.hair); } else { M.rule(g,0,sy,w,sy,C16.hair); M.rule(g,0,sy+sh,w,sy+sh,C16.hair); }
  M.logo(g,sx+G.m,G.hb,G.xh,{color:C16.ink}); d5_lab(g,'Voice · Mir',sx+sw-G.m,G.hb,C16.dim,9,{align:'right'}); M.rule(g,sx+G.m,G.hl,sx+sw-G.m,G.hl,C16.hair);
  d5_lab(g,'Live transcript',sx+G.m,G.ty+68,C16.dim,9);
  const ph=40, bw=(sw-2*G.m-12); d5_rr(g,sx+G.m,G.by,bw*.62,ph,ph/2,C16.inp); M.text(g,'Type instead',sx+G.m+18,G.by+ph/2+5,{size:14,color:C16.soft});
  d5_rr(g,sx+G.m+bw*.62+12,G.by,bw*.38,ph,ph/2,C16.end); M.text(g,'End',sx+G.m+bw*.62+12+bw*.19,G.by+ph/2+5,{size:14,weight:500,color:C16.ink,align:'center'});
  col16(g,L,st); return cv; }); }
function dyn16(g,st,w,h,t){ const G=geo16(w), L=G.L, Rh=d5_rhythm(st.speaker,st.pace), tt=((t%Rh.T)+Rh.T)%Rh.T, sl=d5_at(Rh.slow,Rh,tt), B=new M.Buf(g);
  const fam=(c,speaking,col,seed)=>{ for(let i=1;i<=6;i++){ const e=speaking?Math.min(1.2,st._mus?1.15*m2_env(st,'s',tt-i*70,170):d5_at(Rh.env,Rh,tt-i*70)):0, R0=i*G.sp*(speaking?1:1-.1*sl), disp=speaking?G.sp*.62*e*(.55+.45*i/6):0, k=speaking?.84-.3*Math.min(1,e):.72+.26*sl;
    M.ring(B,{cx:c[0],cy:c[1],R:R0+disp,w:1.6+(1-k)*3.2,swell:.5,dpl:1.05,rCore:.95,rEdge:.55,seed:seed+i*13,color:col,wobble:(1-k)*.05,loose:(1-k)*G.sp*.3}); } };
  const you=st.speaker==='you'; fam(G.you,you,C16.ink,160); fam(G.mir,!you,C16.mir,170);
  const mx=(G.you[0]+G.mir[0])/2, my=(G.you[1]+G.mir[1])/2, mk=.7+.28*sl; d5_field(B,{cx:mx,cy:my,R:5.2,rings:1,k:mk,color:C16.acc,seed:44,dpl:1.4});
  /* the score: one dot per syllable, size = stress; said syllables in ink */
  const sy0=L.ny+12+16+36, x0=L.nx, W=L.nw; Rh.S.forEach((q,i)=>{ const x=x0+q.t/Rh.T*W, said=q.t<=tt, f=said&&st._mus?Math.exp(-(tt-q.t)/150):0; B.dot(x,sy0,(.9+1.6*q.s)*(1+.8*f),said?C16.ink:C16.tint); });
  B.flush(); const px=x0+tt/Rh.T*W; M.rule(g,px,sy0-12,px,sy0+10,C16.soft);
  const sw=L.sw, sx=L.sx; d5_disp(g,you?'You’re speaking':'Mir is speaking',sx+G.m,G.ty,G.ts,C16.ink); M.text(g,you?'Mir is listening':'You’re listening',sx+G.m,G.ty+30,{size:15,weight:400,color:C16.soft});
  const words=SAY16[st.speaker].split(' '), shown=Rh.W.filter(x=>x<=tt).length, lines=M.wrap(g,SAY16[st.speaker],sw-2*G.m,{size:15,weight:400}); let wi=0, y=G.ty+92;
  for(const ln of lines){ const ws=ln.split(' '), vis=ws.slice(0,Math.max(0,Math.min(ws.length,shown-wi))); if(vis.length) M.text(g,vis.join(' '),sx+G.m,y,{size:15,weight:400,color:you?C16.ink:C16.mir}); wi+=ws.length; y+=21; } }
/* L-16 music: the line is sung without words. Each counted syllable is a `vox` note on its 16th, its stress the contour (stressed
   syllables step up, the rest fall back): you low on "o" (D3–A3) over D then G, Mir higher on "a" (A3–F#4) over Bm then Asus4.
   Each sentence is an arch; a statement comes home, a question ends on the fifth above home. Notes are drawn only from the mode
   (olive: Mixolydian) and must sit at a simple ratio to every tone of the chord, never a semitone from it. Under it the listener is a drone (A and E while you speak, D and A
   while Mir does) whose detune is the listener's looseness, (1 − k) × 100 cents with k = .72 + .26 × the same slow follower the
   rings use, so it tunes as their rings tighten. One loop is the score: 2 bars at 120 × Pace BPM. */
const PROG16={you:['D','G'],mir:['Bm','Asus4']};
function m2_line16(who,pace){ const Rh=d5_rhythm(who,pace), mir=who==='mir', lo=mir?57:50, hi=mir?66:57, bar=Rh.T/2, prog=PROG16[who], words=SAY16[who].split(' ');
  const sid=[]; let k=0; words.forEach(w=>{ sid.push(k); if(/[.?]$/.test(w)) k++; });
  const ok=sym=>{ const pc=mu.parse(sym).pcs, out=[]; for(let m=lo-2;m<=hi+2;m++){ if(mu.inMode('mixolydian',m)!==m) continue; const q=((m%12)+12)%12; if(pc.some(c=>(q-c+12)%12===1||(c-q+12)%12===1)||!m2_cons(sym,m)) continue; out.push(m); } return out; };
  const near=(L,x)=>L.reduce((a,m)=>Math.abs(m-x)<Math.abs(a-x)?m:a,L[0]);
  let prev=null; const out=Rh.S.map(q=>{ const sym=prog[q.t<bar-1?0:1], L=ok(sym), inS=Rh.S.filter(z=>sid[z.w]===sid[q.w]), pos=inS.indexOf(q), n=inS.length, u=n>1?pos/(n-1):0, quest=/\?$/.test(words[inS[n-1].w]);
    let m; if(pos===n-1) m=quest?lo+7:lo;
    else { m=near(L,lo+(hi-lo)*(.2+.6*Math.sin(Math.PI*u))+(q.s>.8?1.5:-1)); if(prev!=null&&Math.abs(m-prev)>5) m=near(L,prev+Math.sign(m-prev)*4); }
    prev=m; return {t:q.t,d:q.d,s:q.s,m,sym}; });
  return {Rh,out,prog,bar}; }
const m2_root16=sym=>{ let m=mu.midi(mu.parse(sym).root+'2'); if(m>45) m-=12; return m; };
function music16(st){ const L=m2_line16(st.speaker,st.pace), Rh=L.Rh, mir=st.speaker==='mir', S=mu.score({bpm:120*st.pace,ground:'olive'}), b=S.beat, T=Rh.T, bar=L.bar;
  S.harm([[0,L.prog[0]],[bar,L.prog[1]]]);
  let pv=null; L.prog.forEach((sym,i)=>{ const v=mu.voice(sym,'F#3','E4',3,pv); pv=v; S.chord(i*bar,'pad',v,bar,{attack:.2,release:.45,cutoff:820,vel:.42},['bar'+i,.15]); S.note(i*bar,'pluck',m2_root16(sym),280,{cutoff:340,vel:.6}); S.note(i*bar+2*b,'pluck',m2_root16(sym)+7,200,{cutoff:320,vel:.42}); });
  L.out.forEach(q=>S.note(q.t,'vox',q.m,Math.max(60,q.d*.9),{vowel:mir?'a':'o',to:mir?'e':'u',attack:.03,release:.12,vel:.5+.32*q.s,vibrato:4,pan:mir?.22:-.22},['s',q.s]));
  /* the listener's drone, tuning as the listener's rings tighten (sampled on every beat) */
  const k0=.72+.26*d5_at(Rh.slow,Rh,0);
  S.note(0,'drone',mir?50:45,T-900,{id:'dr',ratio:3/2,detune:(1-k0)*100,level:.36,fade:.5,over:'D'});
  for(let i=1;i<8;i++){ const k=.72+.26*d5_at(Rh.slow,Rh,i*b); S.set(i*b,'dr','detune',(1-k)*100,b*.8); }
  S.end(T); return S.out(); }
/* Pace is the tempo: dragging it sings the line's first three syllables at the new pace (at most every 300 ms) */
function param16(A,st,id,oldV,newV){ if(id!=='pace') return false; if(!m2_gate(st,'pace',300)) return true; const L=m2_line16(st.speaker,newV), now=A.now()+.01, t0=L.out[0].t;
  L.out.slice(0,3).forEach(q=>A.play('vox',{freq:m2_hz(q.m,q.sym),dur:Math.max(.06,q.d*.9/1000),vowel:st.speaker==='mir'?'a':'o',to:st.speaker==='mir'?'e':'u',attack:.03,release:.12,vel:.5+.3*q.s,vibrato:4,when:now+(q.t-t0)/1000}));
  return true; }
M.piece({ id:'L-16',
  caption:'Voice mode as two ring families, you and Mir; the speaker’s rings breathe out once per syllable while the listener’s tighten and settle. Switch Speaker, or change Pace to speed the breaths.',
  alt:'A flat phone screen on an olive ground: the mindgut wordmark in the header, two overlapping families of stippled rings, light and green, with a small ochre ring where they meet; the words “You’re speaking” and “Mir is listening”, a live transcript, and Type instead and End buttons. Beside it, a dotted syllable score with a playhead and notes.',
  recipe:{
    idea:'Turn-taking reads as one ring family breathing while the other settles, with no level meter.',
    marks:['ring','center'],
    ground:'olive',
    accent:'the small ochre ring at the midpoint between the two centers: where you meet',
    composition:'A flat phone screen at left (full width on phones): header, two offset ring families, the speaking state, a live transcript, Type instead and End; a syllable score, legend and rules beside it (below on phones).',
    motion:'Loops the line as 2 bars at 120 × Pace BPM: each syllable lands on a 16th and sends one breath out through the speaker’s six rings, 70 ms per ring (decay 170 ms); the listener’s rings tighten 10% and settle (.72 → .98) on a slow follower. Reduced motion shows one frame mid-line.',
    sound:'A wordless voice sings each counted syllable on its 16th, stress shaping the contour: you low on “o”, Mir higher on “a”; statements come home, a question ends on the fifth. The listener is a drone that tunes as their rings tighten.',
    controls:['Speaker (You, Mir): who sings, and the chords','Pace 0.60–1.60×: the tempo (72–192 BPM)'],
    computed:['syllables per word from vowel groups, timed with seeded jitter and Pace','envelope per syllable: attack 45 ms, decay 170 ms; the listener follows a slow average of it'],
    placeholder:['the two lines','syllable stress and timing (seeded, not audio)'],
    root:'',
    rules:['no waveform, level meter or face'],
    engine:['M.ring','M.logo','M.Buf','M.rng','M.text','M.wrap','M.rule','M.fill']
  },
  aspect:w=>w/lay16(w).H,
  state:{speaker:'you',pace:1},
  loop:true,
  controls:[
    {id:'speaker',type:'select',label:'Speaker',play:true,options:[{value:'you',label:'You'},{value:'mir',label:'Mir'}]},
    {id:'pace',type:'range',label:'Pace',min:.6,max:1.6,step:.05,fmt:v=>(+v).toFixed(2)+'×'}],
  music:music16,
  musicParam:param16,
  render(g,w,h,M,st){ d5_blit(g,base16(st,w,h)); const Rh=d5_rhythm(st.speaker,st.pace); dyn16(g,st,w,h,Rh.speak*.62); },
  animate(g,w,h,M,st,t){ d5_blit(g,base16(st,w,h)); const Rh=d5_rhythm(st.speaker,st.pace); dyn16(g,st,w,h,t); return t<Rh.T; } });
/* ════════════════════════════════════════════════════════════════════════
   L-17 · At a glance · widgets (small 2×2, medium 4×2), a lock screen (inline + rectangular) and a round watch face.
   Drawn at 1× (CSS px = pt) wherever the column allows; on a phone the set is drawn at the printed scale, never silently.
   Content: the breath rail 13 of 21, a tiny field, the state word. Animation: the 13th breath lights, bottom to top.
   ════════════════════════════════════════════════════════════════════════ */
const PL17=M.PAL.paper;
const G17={mixed:{small:'olive',medium:'night',watch:'night',lock:'cobalt'},night:{small:'night',medium:'night',watch:'night',lock:'night'},olive:{small:'olive',medium:'olive',watch:'olive',lock:'olive'},cobalt:{small:'cobalt',medium:'cobalt',watch:'cobalt',lock:'cobalt'}};
const T17=P=>({txt:d5_mix(P.ground,P.ring,.62),dim:d5_mix(P.ground,P.ring,.42),surf:d5_mix(P.ground,P.ring,.1)});
const lay17=d5_memo(function(w){ const wide=w>=520, pad=wide?24:16, s=wide?1:Math.min(1,Math.floor((w-2*pad)/364*100)/100), y0=wide?108:96, o={wide,pad,s,y0};
  o.med=[pad,y0]; if(wide){ o.small=[pad,y0+170+40]; o.watch=[pad+170+32,y0+170+40]; o.lock=[pad,y0+170+40+196+88]; o.H=o.lock[1]+236+56; }
  else { const ms=170*s; o.small=[pad,y0+ms+60]; o.watch=[pad,o.small[1]+170*s+28]; o.lock=[pad,o.watch[1]+196*s+28]; o.H=q4(o.lock[1]+236*s+96); }
  return o; });
const d5_word=k=>k<.34?'loose':k<.8?'settling':'in tune';
/* each widget, drawn in modes so the base and the animation never draw the same dots twice:
   'surf' (g: surface + static type) · 'rail' (B: the rail without the 13th bar) · 'field' (B) · 'bar' (B: the 13th bar, lit to p)
   · 'count' (g: the type that changes when the breath lands) */
let F17={land:0,c:0,sf:{}};   /* the flash amounts for this frame (from M.music.env), set by dyn17 */
function d5_w17(kind,mode,x,y,s,P,B,g,p,count){ const T=T17(P), K=.62, lit=12, tint=d5_mix(P.ground,P.ring,.26), fr=.62*(1+.75*Math.max(F17.land,F17.sf[kind]||0)), ctx=d5_mix(T.txt,P.center,Math.min(1,F17.c));
  const rail=(rx,ryb,W,Hh)=>{ const pitch=W/21, wid=Math.max(1.8,pitch*.46), cell=Math.max(.95,wid*.36);
    if(mode==='rail') d5_rail(B,rx,ryb,W,Hh,lit,P,{skip:12});
    else if(mode==='bar') d5_bar(B,M.rng(700+12*7),rx+12.5*pitch,ryb-Hh/2,Hh/Math.cos(.3),wid,-Math.PI/2+.3,u=>u<=p?P.center:tint,cell,fr); };
  if(kind==='small'){ const S=170*s;
    if(mode==='surf'){ d5_rr(g,x,y,S,S,22*s,P.ground); d5_disp(g,d5_word(K),x+16*s,y+106*s,22*s,P.ring); }
    else if(mode==='field') d5_field(B,{cx:x+42*s,cy:y+42*s,R:26*s,rings:3,k:K,color:P.ring,center:P.center,seed:171});
    else if(mode==='count') M.text(g,count+' of 21 breaths',x+16*s,y+126*s,{size:Math.max(9,11*s),color:T.txt});
    else rail(x+16*s,y+154*s,138*s,17*s); }
  else if(kind==='medium'){ const W=364*s, H=170*s;
    if(mode==='surf'){ d5_rr(g,x,y,W,H,22*s,P.ground); d5_lab(g,'Mir · Tuesday evening',x+172*s,y+30*s,T.dim,9); d5_disp(g,d5_word(K),x+172*s,y+70*s,30*s,P.ring); }
    else if(mode==='field') d5_field(B,{cx:x+80*s,cy:y+85*s,R:62*s,rings:6,k:K,color:P.ring,center:P.center,seed:172});
    else if(mode==='count') M.text(g,count+' of 21 breaths · renews at 21',x+172*s,y+96*s,{size:Math.max(9,12*s),color:ctx});
    else rail(x+172*s,y+150*s,176*s,20*s); }
  else if(kind==='watch'){ const D=196*s, cx=x+D/2, cy=y+D/2;
    if(mode==='surf'){ d5_disc(g,cx,cy,D/2,P.ground); M.text(g,'21:04',cx,cy-44*s,{size:17*s,weight:500,color:P.ring,align:'center'}); M.text(g,d5_word(K),cx,cy+68*s,{size:Math.max(9,12*s),weight:400,color:T.txt,align:'center'}); }
    else if(mode==='field') d5_field(B,{cx,cy:cy+6*s,R:40*s,rings:4,k:K,color:P.ring,center:P.center,seed:173});
    else if(mode==='rail'||mode==='bar'){ for(let i=0;i<21;i++){ if((mode==='bar')!==(i===12)) continue; const a=-Math.PI/2+i/21*TAU, rr=83*s, len=15*s, wid=4.4*s;
      d5_bar(B,M.rng(800+i*7),cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,len,wid,a+.3,i===12?(u=>u<=p?P.center:tint):(i<lit?P.center:tint),Math.max(.95,wid*.36),i===12?fr:.62); } } }
  else if(kind==='lock'){ const W=364*s, H=236*s, cx=x+W/2, rx=cx-79*s, ry=y+148*s;
    if(mode==='surf'){ M.fill(g,P.ground,x,y,W,H); M.text(g,'21:04',cx,y+124*s,{size:84*s,weight:600,track:-.03,color:P.ring,align:'center'}); d5_rr(g,rx,ry,158*s,72*s,16*s,T.surf); M.text(g,d5_word(K),rx+62*s,ry+30*s,{size:15*s,weight:500,color:P.ring}); }
    else if(mode==='field') d5_field(B,{cx:rx+32*s,cy:ry+36*s,R:21*s,rings:3,k:K,color:P.ring,center:P.center,seed:174});
    else if(mode==='count'){ const str='settling · '+count+' of 21', sz=14*s, tw=d5_tw(str,{size:sz,weight:500}), gx=cx-(tw+16*s)/2; const b=new M.Buf(g); d5_field(b,{cx:gx+5*s,cy:y+33*s,R:5.5*s,rings:2,k:.9,color:P.ring,seed:175,dpl:1.2}); b.flush(); M.text(g,str,gx+16*s,y+38*s,{size:sz,weight:500,color:d5_mix(P.ring,P.center,Math.min(1,F17.c))}); }
    else rail(rx+62*s,ry+58*s,86*s,12*s); } }
function d5_lab17(g,lines,x,y,c,ca){ lines.forEach((l,i)=>d5_lab(g,l,x,y+i*14,i?ca:c,9)); }
const d5_K17=['small','medium','watch','lock'], d5_pos17=(L,k)=>k==='medium'?L.med:L[k];
function base17(st,w,h){ return d5_slot(st,'base',d5_DK(w,h)+st.ground,()=>{ const L=lay17(w), {cv,g}=d5_off(w,h), s=L.s, GG=G17[st.ground], ink=PL17.ink, soft=PL17.soft;
  M.fill(g,PL17.ground); d5_head(g,w,'L-17','UI · widgets and watch','Every surface at 1×',soft);
  d5_disp(g,'At a glance',L.pad,L.wide?76:64,L.wide?40:30,ink);
  const sc=s===1?'drawn at 1×':'shown at '+s.toFixed(2)+'×';
  d5_K17.forEach(k=>{ const q=d5_pos17(L,k); d5_w17(k,'surf',q[0],q[1],s,M.PAL[GG[k]],null,g); });
  const B=new M.Buf(g); d5_K17.forEach(k=>{ const q=d5_pos17(L,k), P=M.PAL[GG[k]]; d5_w17(k,'rail',q[0],q[1],s,P,B); d5_w17(k,'field',q[0],q[1],s,P,B); }); B.flush();
  /* labels: name, size in pt, the scale it is drawn at, and its ground */
  if(L.wide){ const lx=L.pad+364+20; d5_lab17(g,['Medium · 4×2','364 × 170 pt',sc],lx,L.med[1]+12,ink,soft);
    d5_lab17(g,['Small · 2×2','170 × 170 pt',sc],L.small[0],L.small[1]+196+24,ink,soft); d5_lab17(g,['Round watch','⌀ 196 px',sc],L.watch[0],L.watch[1]+196+24,ink,soft);
    d5_lab17(g,['Lock screen','inline · 1 line','rectangular','158 × 72 pt',sc],lx,L.lock[1]+12,ink,soft);
    d5_lab(g,'Type inside the widgets is true-size UI type',L.pad,h-24,soft,9); }
  else { const r=L.pad+170*s+16; d5_lab17(g,['Medium · 4×2 · 364 × 170 pt',sc],L.pad,L.med[1]+170*s+20,ink,soft);
    d5_lab17(g,['Small · 2×2','170 × 170 pt',sc],r,L.small[1]+14,ink,soft); d5_lab17(g,['Round watch','⌀ 196 px',sc],L.pad+196*s+16,L.watch[1]+14,ink,soft);
    d5_lab17(g,['Lock screen · inline','+ rectangular · '+sc],L.pad,L.lock[1]+236*s+20,ink,soft);
    d5_lab(g,'Widget type is true-size UI type',L.pad,h-20,soft,9); }
  return cv; }); }
function dyn17(g,st,w,h,p,count,t){ const L=lay17(w), s=L.s, GG=G17[st.ground], B=new M.Buf(g); t=t==null?-1e9:t;
  F17={land:m2_env(st,'land',t,520),c:Math.max(.8*m2_env(st,'c*',t,200),m2_env(st,'land',t,700)),sf:{}}; d5_K17.forEach((k,i)=>{ F17.sf[k]=.5*m2_env(st,'sf'+i,t,400); });
  d5_K17.forEach(k=>{ const q=d5_pos17(L,k); d5_w17(k,'bar',q[0],q[1],s,M.PAL[GG[k]],B,null,p); }); B.flush();
  ['small','medium','lock'].forEach(k=>{ const q=d5_pos17(L,k); d5_w17(k,'count',q[0],q[1],s,M.PAL[GG[k]],null,g,p,count); }); }
/* L-17 music, 3/4 at 92 BPM (b = 652 ms). The count ticks on the beats as pulse notes up the 21-step ladder (three octaves of the
   ground's mode from D4): breaths 10, 11 and 12. From beat 1 the four surfaces swell together over two beats, each one a chord
   tone (small the root, medium the third, the watch the fifth, the lock screen the sixth, which is the 13th; the 7th on night,
   whose Dorian sixth would make a tritone with the minor third), so the 13th breath fills the 13 chord; it lands on the next
   downbeat with a bell on the 13th step of the ladder (snapped to the chord), as every count turns to 13. Ground is the mode. */
const BPM17=92, B17=60000/BPM17, GM17={mixed:'paper',night:'night',olive:'olive',cobalt:'cobalt'};
const m2_min17=md=>md==='dorian'||md==='aeolian';
/* root, third, fifth and the color: the sixth, the 13th (the 7th on a minor mode, where the 6th would make a tritone with the third) */
const m2_13=md=>[mu.deg(md,0,4),mu.deg(md,2,4),mu.deg(md,4,4),mu.deg(md,m2_min17(md)?6:5,4)], m2_sym17=md=>m2_min17(md)?'Dm7':'D6';
function music17(st){ const S=mu.score({bpm:BPM17,meter:[3,4],ground:GM17[st.ground]}), md=S.mode, b=B17, home=m2_min17(md)?'Dm':'D', six=m2_sym17(md);
  S.harm([[0,home],[b,six]]);
  for(let k=0;k<3;k++) S.note(k*b,'pulse',mu.deg(md,9+k,4),b*.3,{pw:.3,cutoff:1300+300*k,env:1.2,q:2.2,vel:.5+.06*k,pan:-.2+.2*k},['c'+k,1]);
  S.note(0,'pluck','D2',320,{cutoff:360,vel:.62});
  m2_13(md).forEach((m,k)=>S.note(b,'pad',m,2*b+900,{attack:2*b/1000,release:1.3,cutoff:1150,vel:.5,pan:-.45+.3*k,over:six},['sf'+k,.6]));
  S.note(3*b,'bell',mu.snap(six,mu.deg(md,12,4)),2400,{ratio:3.5,bright:.9,vel:.56,pan:.15},['land',1]);
  S.chord(3*b,'mallet',m2_13(md).map(m=>m+12),1500,{vel:.42,trem:5,over:six});
  S.note(3*b,'pluck','D2',340,{cutoff:380,vel:.6});
  S.end(3*b+2200); return S.out(); }
/* Ground is the mode: changing it plays the 13 chord in the new mode, rolled, with the 13th on a bell */
function param17(A,st,id,oldV,newV){ if(id!=='ground') return false; const md=mu.groundMode(GM17[newV]), six=m2_sym17(md), now=A.now()+.01;
  m2_13(md).forEach((m,k)=>A.play('mallet',{freq:m2_hz(m+12,six),dur:1.2,vel:.5,trem:5,when:now+k*.07}));
  A.play('bell',{freq:m2_hz(mu.snap(six,mu.deg(md,12,4)),six),dur:2,ratio:3.5,vel:.5,when:now+.3}); return true; }
M.piece({ id:'L-17',
  caption:'Small and medium widgets, a lock screen and a round watch face at true size, each with a row of 21 breaths, a small field and the state word. Press Play to light the 13th breath everywhere.',
  alt:'On a paper plate: a medium widget with a stippled ring field, the word “settling” and a rail of 21 leaning bars with 13 lit; a small widget; a round watch face with the 21 bars around its edge; and a lock-screen strip with an inline line, the time and a rectangular widget. Each is labeled with its size.',
  recipe:{
    idea:'The rail is the only number, and it is counted marks; the 13th breath lights on every surface at once.',
    marks:['bar','ring','center'],
    ground:'mixed (olive, night, cobalt), or all night, olive or cobalt, on a paper plate',
    accent:'the lit breaths and the field’s center',
    composition:'Medium widget at top with its labels beside it; small widget and round watch below; a lock screen with inline and rectangular widgets at the bottom. Drawn at 1×; scaled to fit on phones, with the scale labeled.',
    motion:'3/4 at 92 BPM: the counts flash on beats 0–2; from beat 1 the 13th breath fills bottom to top on every surface (two beats, inOutCubic) and lands on the next downbeat, where the counts turn to 13 and the bar swells. Reduced motion shows 13 lit.',
    sound:'The count ticks up a ladder on the beats; then four surfaces swell together, each a chord tone, into a chord whose top is the sixth, the 13th; it lands with a bell on the 13th step as every count turns to 13.',
    controls:['Ground (Mixed, Night, Olive, Cobalt): the mode'],
    computed:['scale: 1× where the column allows, else the column width ÷ 364 pt, rounded down to 0.01'],
    placeholder:['13 of 21 breaths','the state word','time and day','watch size'],
    root:'',
    rules:['each surface carries the rail, a small field and the state word, nothing else','widget type is true-size UI type'],
    engine:['M.ring','M.rng','M.Buf','M.ease.inOutCubic','M.PAL','M.text','M.fill']
  },
  aspect:w=>w/lay17(w).H,
  state:{ground:'mixed'},
  controls:[{id:'ground',type:'select',label:'Ground',options:[{value:'mixed',label:'Mixed'},{value:'night',label:'Night'},{value:'olive',label:'Olive'},{value:'cobalt',label:'Cobalt'}]}],
  music:music17,
  musicParam:param17,
  render(g,w,h,M,st){ d5_blit(g,base17(st,w,h)); dyn17(g,st,w,h,1,13); },
  animate(g,w,h,M,st,t){ if(d5_RM()) t=9e3; d5_blit(g,base17(st,w,h)); const p=E.inOutCubic(cl((t-B17)/(2*B17))); dyn17(g,st,w,h,p,p>=1?13:12,t); return t<3*B17+1400; } });
/* ════════════════════════════════════════════════════════════════════════
   L-18 · Your week, in marks · a weekly reflection, as an email (600 px column) and a 4:5 share card.
   k per day is COMPUTED from seeded placeholder exchanges: exchanges e ∈ 0..12 and agreement a ∈ .30..95 per day, then
   k = 1 − exp(−e·a/4). "Settled most" = the day with the highest k. A day with no exchanges is quiet: no rings at all.
   ════════════════════════════════════════════════════════════════════════ */
const PP18=M.PAL.paper, PN18=M.PAL.night;
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const WK18=[
  {seed:42, first:20, mon:'Oct', range:'20 – 26 Oct', lines:['A quiet day. Nothing said.','Talked about the call I keep putting off.','Started on sleep, ended somewhere else.','Worked out what I want from the move.','Two lines on the train. Didn’t finish.','Came back to the call. Not made yet.','Wrote down three things that went fine.']},
  {seed:35, first:27, mon:'Oct', range:'27 Oct – 2 Nov', lines:['Said the new job scares me more than I admit.','A short one about my knee.','Finally said why the move matters.','Picked up from Wednesday without starting over.','One line, then the day took over.','Half a thought about my brother.','Planned the week out loud.']},
  {seed:39, first:3, mon:'Nov', range:'3 – 9 Nov', lines:['Back after a long weekend away.','A quiet day. Nothing said.','Another quiet one.','Caught up on two quiet days in one go.','Talked through the dinner I was dreading.','The dinner went fine. Said so.','Asked Mir to forget one thing. It did.']}];
function d5_week(i){ const W=WK18[i], R=M.rng(W.seed*7919+3), d=[]; for(let j=0;j<7;j++){ const ex=Math.floor(R()*13), ag=.3+R()*.65; d.push({ex,ag,k:1-Math.exp(-ex*ag/4)}); }
  let mx=0; d.forEach((x,j)=>{ if(x.k>d[mx].k) mx=j; }); const date=j=>{ const n=W.first+j, lim=W.mon==='Oct'?31:30; return n>lim?n-lim:n; };
  return {W,d,mx,date,summary:DAYS[mx]+' settled most.'}; }
const d5_state18=x=>x.ex===0?'quiet':d5_word(x.k);
const lay18=d5_memo(function(w){ const ph=w<480, wide=w>=1000, pad=ph?16:32, tb=ph?64:76, ts=ph?30:40, ey=ph?96:112;
  const ex=ph?0:pad, ew=wide?600:Math.min(600,w-2*ex), E=d5_email(ew), o={ph,wide,pad,tb,ts,ex,ey,ew,E};
  if(wide){ o.cx=pad+600+40; o.cw=Math.min(440,w-pad-o.cx); o.cy=ey; o.ny=ey+o.cw*1.25+68; o.H=q4(Math.max(ey+E.h,o.ny+250)+56); }
  else { o.cw=Math.min(440,w-2*pad); o.cx=pad; o.cy=ey+E.h+56; o.ny=o.cy+o.cw*1.25+68; o.H=q4(o.ny+250+40); }
  return o; });
function d5_email(ew){ const ep=ew>=520?40:20, R=ew>=520?24:20, tx=ep+2*R+20, tw=ew-ep-tx, o={ep,R,tx,tw,rows:[]}; let y=172;
  o.sub=d5_lines('Seven days, one mark each. Each field is drawn from how that day’s conversations settled.',ew-2*ep,{size:14}); y+=(o.sub.length-1)*20+28; o.r0=y;
  for(let j=0;j<7;j++){ const n=Math.max(...WK18.map(W=>d5_lines(W.lines[j],tw,{size:15,weight:400}).length)), hh=Math.max(2*R+24,46+(n-1)*20+18); o.rows.push([y,hh]); y+=hh; }
  o.f=y+20; o.h=y+20+ (ew>=520?92:110); return o; }
function base18(st,w,h){ return d5_slot(st,'base',d5_DK(w,h)+st.week,()=>{ const L=lay18(w), {cv,g}=d5_off(w,h), K=d5_week(st.week), ink=PP18.ink, soft=PP18.soft, E5=L.E, ex=L.ex, ey=L.ey, ew=L.ew, ep=E5.ep;
  M.fill(g,PP18.ground); d5_head(g,w,'L-18','Editorial · weekly reflection',null,soft,{pad:L.pad}); d5_disp(g,'Your week, in marks',L.pad,L.tb,L.ts,ink);
  /* the email: a white 600 px column */
  M.fill(g,'#ffffff',ex,ey,ew,E5.h); const hair='#e4e5e6'; if(!L.ph){ M.rule(g,ex,ey,ex+ew,ey,hair); M.rule(g,ex+ew,ey,ex+ew,ey+E5.h,hair); M.rule(g,ex,ey+E5.h,ex+ew,ey+E5.h,hair); M.rule(g,ex,ey,ex,ey+E5.h,hair); }
  d5_lab(g,'Weekly note · '+K.W.range,ex+ep,ey+30,soft,9);
  M.logo(g,ex+ep,ey+68,ew>=520?12:10,{color:ink}); d5_lab(g,'Your week',ex+ew-ep,ey+68,soft,9,{align:'right'}); M.rule(g,ex+ep,ey+88,ex+ew-ep,ey+88,hair);
  E5.sub.forEach((l,i)=>M.text(g,l,ex+ep,ey+172+i*20,{size:14,weight:300,color:soft}));
  K.d.forEach((x,j)=>{ const [ry,rh]=E5.rows[j], top=ey+ry; M.rule(g,ex+ep,top,ex+ew-ep,top,hair);
    d5_lab(g,DAYS[j].slice(0,3)+' '+K.date(j)+' · '+d5_state18(x),ex+E5.tx,top+22,j===K.mx?ink:soft,9.5);
    d5_para(g,K.W.lines[j],ex+E5.tx,top+46,E5.tw,{size:15,weight:400,lh:20,color:ink,track:-.004}); });
  const fy=ey+E5.f; M.rule(g,ex+ep,fy,ex+ew-ep,fy,hair); M.logo(g,ex+ep,fy+34,8,{color:ink});
  d5_monoP(g,'You asked for a weekly note. Stop these · Forget this week',ex+ep,fy+60,ew-2*ep,soft);
  d5_lab(g,'Email · 600 px column'+(ew<600?' · reflowed to '+ew+' px':' · 1×'),L.ph?L.pad:ex,ey+E5.h+24,ink,9);
  /* the share card, 4:5, night */
  const cx=L.cx, cy=L.cy, cw=L.cw, ch=cw*1.25, cp=cw*.075; M.fill(g,PN18.ground,cx,cy,cw,ch);
  d5_lab(g,'Mir · week of '+K.W.range,cx+cp,cy+cp+8,d5_mix(PN18.ground,PN18.ring,.6),9); d5_lab(g,'4:5',cx+cw-cp,cy+cp+8,d5_mix(PN18.ground,PN18.ring,.6),9,{align:'right'});
  const ty=cy+ch*.79+Math.min(cw*.032,14)+18; K.d.forEach((x,j)=>d5_lab(g,DAYS[j][0],cx+cp+(j+.5)*(cw-2*cp)/7,ty,j===K.mx?PN18.ring:d5_mix(PN18.ground,PN18.ring,.5),9,{align:'center'}));
  d5_para(g,'“'+K.W.lines[K.mx]+'”',cx+cp,cy+ch*.665+Math.max(22,cw*.07),cw-2*cp,{size:Math.max(12,cw*.032),weight:300,lh:Math.round(Math.max(12,cw*.032)*1.35),color:d5_mix(PN18.ground,PN18.ring,.7)});
  M.logo(g,cx+cp,cy+ch-cp*.9,Math.max(8,cw*.022),{color:PN18.ring}); d5_lab(g,'1080 × 1350 export',cx+cw-cp,cy+ch-cp*.9,d5_mix(PN18.ground,PN18.ring,.5),9,{align:'right'});
  d5_lab(g,'Share card · 4:5 · shown at '+(cw/1080).toFixed(2)+'×',cx,cy+ch+24,ink,9);
  /* the method, with the computed values */
  let ny=L.ny+(L.wide?0:8); d5_lab(g,'By day',cx,ny,ink,9.5); ny+=20;
  ny=d5_para(g,'The day that settled most leads the note. A day with nothing said draws no rings.',cx,ny,cw,{size:13,lh:18,color:soft})+28;
  K.d.forEach((x,j)=>{ const y=ny+j*16, c=j===K.mx?ink:soft; d5_lab(g,DAYS[j].slice(0,3),cx,y,c,9); d5_lab(g,x.ex+' said',cx+56,y,c,9); d5_lab(g,'agree '+x.ag.toFixed(2),cx+112,y,c,9); d5_lab(g,'settled '+x.k.toFixed(2),cx+190,y,c,9); d5_lab(g,d5_state18(x),cx+cw,y,c,9,{align:'right'}); });
  return cv; }); }
/* the week on the music's grid (3/4, 125 BPM, b = 480 ms): day j's field settles from beat 2 + j (Monday is the pickup), so
   Tuesday and Friday fall on downbeats; the headline fades in over beat 8 and lands with the cadence on the downbeat of beat 9.
   Each day's fields swell on its chord; the top day's big field on the cadence; the headline warms on the motif's third. */
const BPM18=125, B18=60000/BPM18, T18=j=>(2+j)*B18, CAD18=9*B18;
function dyn18(g,st,w,h,t){ const L=lay18(w), K=d5_week(st.week), E5=L.E, ex=L.ex, ey=L.ey, B=new M.Buf(g), cw=L.cw, ch=cw*1.25, cp=cw*.075, tt=t==null?-1e9:t;
  const prog=j=>t==null?1:E.outCubic(cl((t-T18(j))/1100));
  const fld=(x,j,cx,cy,R,P,big)=>{ const p=prog(j), k=x.k*p; if(x.ex===0){ const Rr=M.rng(900+j); for(let i=0;i<3;i++){ const a=Rr()*TAU, d=R*(.5+Rr()*.6); B.dot(cx+Math.cos(a)*d,cy+Math.sin(a)*d,.8,d5_mix(P.ground,P.ring,.4)); } return; }
    const e=Math.max(m2_env(st,'d'+j,tt,300),big?m2_env(st,'cad',tt,700):0);
    d5_field(B,{cx,cy,R,rings:big?8:Math.max(3,Math.round(R/7)),k,color:P.ring,center:j===K.mx?P.center:null,seed:1800+j*17+st.week*3,z:(big?1.05:1)*(1+.8*e)}); };
  K.d.forEach((x,j)=>{ const [ry]=E5.rows[j]; fld(x,j,ex+E5.ep+E5.R,ey+ry+E5.R+12,E5.R,PP18,false); });
  const tr=Math.min(cw*.032,14); K.d.forEach((x,j)=>fld(x,j,L.cx+cp+(j+.5)*(cw-2*cp)/7,L.cy+ch*.79,tr,PN18,false));
  fld(K.d[K.mx],K.mx,L.cx+cw*.5,L.cy+ch*.36,cw*.27,PN18,true);
  B.flush();
  const a=t==null?1:cl((t-CAD18+B18)/B18); if(a>0){ const eh=Math.min(1,Math.max(.4*m2_env(st,'h0',tt,260),.4*m2_env(st,'h1',tt,260),m2_env(st,'h2',tt,600))); g.save(); g.globalAlpha=a;
    const hs=Math.min(E5.ep>=40?34:26,(L.ew-2*E5.ep)/(K.summary.length*.5)); d5_disp(g,K.summary,ex+E5.ep,ey+136,hs,d5_mix(PP18.ink,PP18.center,eh));
    d5_disp(g,K.summary,L.cx+cp,L.cy+ch*.665,Math.min(cw*.07,(cw-2*cp)/(K.summary.length*.5)),d5_mix(PN18.ring,PN18.center,eh)); g.restore(); } }
/* L-18 music: the week is a seven-chord progression, one chord per day, plucked as its field settles (a different progression
   each week). Quality is that day's settledness: a settled day (k ≥ .6) plays its triad, pure; a loose one its suspension (sus4,
   or sus2 where the 4th would leave D major), and its melody note sits 3.5 cents sharp. Voicing density is the exchange count
   (2 to 5 voices, voice-led). An ober line takes one chord tone per day, higher for higher agreement; the day that settled most
   rings a bell. Quiet days are rests. The headline is the cadence: the progression's last chord falls to D on the downbeat with
   the bass (once), and the motif, 5 ↑ 1 ↑ 3, arrives on the ober. Bass plucks keep the waltz's downbeats. */
const PROG18=[['D','Bm','G','Em','F#m','G','A7'],['G','A','F#m','Bm','Em','G','A'],['Em','A','F#m','Bm','G','Em','A7sus4']], DPC18=[2,4,6,7,9,11,1];
function m2_loose18(sym){ const c=mu.parse(sym); if(/sus/.test(c.q)) return sym; for(const q of (c.q==='7'?['7sus4']:['sus4','sus2'])){ const x=c.root+q; if(mu.parse(x).pcs.every(v=>DPC18.includes(v))) return x; } return sym; }
function music18(st){ const K=d5_week(st.week), S=mu.score({bpm:BPM18,meter:[3,4]}), b=B18, P=PROG18[st.week]||PROG18[0], H=[]; let pv=null, pm=null;
  const days=K.d.map((x,j)=>{ const sym=x.ex===0?null:(x.k>=.6?P[j]:m2_loose18(P[j])); if(sym) H.push([T18(j),sym]); return sym; });
  H.unshift([0,'D']); H.push([CAD18,'D']); S.harm(H);
  /* the week opens: a soft tonic swells under the two beats before Monday's pickup */
  S.chord(0,'pad',[50,57,62],2*b,{attack:.45,release:.35,cutoff:760,vel:.4},['wk',.2]); S.note(0,'pluck','D2',340,{cutoff:330,vel:.6});
  K.d.forEach((x,j)=>{ const sym=days[j], t=T18(j), down=(2+j)%3===0; if(!sym) return; const top=j===K.mx, n=x.ex<=3?2:x.ex<=7?3:x.ex<=10?4:5;
    const v=mu.voice(sym,'F#3','D5',n,pv); pv=v;
    S.chord(t,'pluck',v,300,{cutoff:540+520*x.k,vel:.5+.2*x.k,pan:-.4+.8*j/6},['d'+j,.5+.5*x.k]);
    if(down){ let r=mu.midi(mu.parse(sym).root+'2'); if(r>45) r-=12; S.note(t,'pluck',r,360,{cutoff:330,vel:.62}); }
    const C=mu.tones(sym,'D4','E5'), tg=62+(x.ag-.3)/.65*14, aim=pm==null?tg:(tg+pm)/2, m=C.reduce((q,c)=>Math.abs(c-aim)<Math.abs(q-aim)?c:q,C[0]); pm=m;
    S.note(t,'ober',x.k>=.6?m:{hz:m2_hz(m,sym)*Math.pow(2,3.5/1200)},b*.9,{vel:.5+.15*x.k,cutoff:1100+500*x.k,echo:.22,echoTime:b*.75/1000,vibrato:6,pan:.1});
    if(top) S.note(t,'bell',m+12,1600,{ratio:3.5,bright:.8,vel:.46,pan:.25}); });
  /* the headline: the cadence on the downbeat, the bass once, and the motif arriving on the third */
  S.note(CAD18,'bass','D2',800,{from:'A1',glide:80,env:2.6,decay:.38,vel:.6},['cad',1]);
  S.chord(CAD18,'pad',[50,54,57,62],2*b+1400,{attack:.08,release:1.4,cutoff:1000,vel:.42});
  [69,74,78].forEach((m,k)=>S.note(CAD18+k*b/2,'ober',m,k===2?b*2.6:b*.45,{vel:.62,cutoff:1300,echo:.22,echoTime:b*.75/1000,vibrato:k===2?14:5,pan:.1},['h'+k,1]));
  S.note(CAD18+b,'bell',78+12,2200,{ratio:3.5,bright:.8,vel:.42,pan:.25});
  S.end(CAD18+2*b+1600); return S.out(); }
M.piece({ id:'L-18',
  caption:'A weekly note the person can keep, as an email and a 4:5 share card, with one small field per day and that day’s line. Change Week to see the fields and the headline change.',
  alt:'A paper plate with two formats. Left, a white email column with the mindgut wordmark, the headline “Thursday settled most.” and seven rows, each a small stippled ring field with a day and one line. Right, a dark 4:5 share card with a large field, the same headline, seven tiny fields and the wordmark; under it, the values by day.',
  recipe:{
    idea:'A week is counted marks and nothing is graded; a quiet day draws nothing.',
    marks:['ring','center','stray'],
    ground:'paper, with a night share card',
    accent:'the center of the day that settled most',
    composition:'A 600 px email column at left (full width on phones): header, headline, seven rows of field, day and line, footer; a 4:5 share card at right with the top day’s field, its line and seven tiny fields; a by-day table under the card.',
    motion:'3/4 at 125 BPM: day fields settle one per beat from a Monday pickup (1.1 s outCubic), each swelling on its chord; the headline fades in over one beat and lands on the cadence’s downbeat, warming on the motif’s third. Reduced motion shows the settled week.',
    sound:'The week is a waltz of seven chords, one per day as its field settles: settled days pure triads, loose days suspended, fuller for more exchanges, with a line that climbs with agreement. Quiet days rest; the headline is the cadence home.',
    controls:['Week (three weeks): a different progression'],
    computed:['per day: exchanges e ∈ 0–12 and agreement a ∈ 0.30–0.95 from a seeded generator; settled k = 1 − exp(−e·a ÷ 4)','headline: the day with the highest k','a day with e = 0 is quiet: three faint strays, no rings'],
    placeholder:['exchanges and agreement (seeded)','day lines','dates'],
    root:'',
    rules:['the headline names a day; the week is never scored'],
    engine:['M.ring','M.logo','M.Buf','M.ease.outCubic','M.rng','M.text','M.wrap','M.rule','M.fill']
  },
  aspect:w=>w/lay18(w).H,
  state:{week:0},
  controls:[{id:'week',type:'select',label:'Week',play:true,options:WK18.map((W,i)=>({value:i,label:W.range}))}],
  music:music18,
  render(g,w,h,M,st){ d5_blit(g,base18(st,w,h)); dyn18(g,st,w,h,null); },
  animate(g,w,h,M,st,t){ if(d5_RM()) t=9e4; d5_blit(g,base18(st,w,h)); dyn18(g,st,w,h,t); return t<CAD18+1600; } });

/* ════════════════════════════════════════════════════════════════════════
   L-19 · Out of home · three 4:5 posters and a 3:1 billboard as one campaign. In each, the real wordmark, untouched, and
   the field radiating from the i's tittle. Rings knock out around the letters by the tittle's height (the clear space)
   and around the copy; the accent ring around the tittle is where they meet. Copy is invented.
   ════════════════════════════════════════════════════════════════════════ */
const LINES19=['Say it once. It stays.','Some things take a few tellings.','Drawn from what you say.'];
const lay19=d5_memo(function(w){ const ph=w<640, pad=ph?16:32, y0=ph?96:116, o={ph,pad,y0};
  if(!ph){ const pw=(w-2*pad-2*24)/3, phh=pw*1.25; o.P=[0,1,2].map(i=>[pad+i*(pw+24),y0,pw,phh]); o.bb=[pad,y0+phh+56,w-2*pad,(w-2*pad)/3]; o.H=q4(o.bb[1]+o.bb[3]+64); }
  else { const pw=w-2*pad, phh=pw*1.25; o.P=[0,1,2].map(i=>[pad,y0+i*(phh+48),pw,phh]); const by=y0+3*(phh+48); o.bb=[pad,by,pw,pw/3]; o.H=q4(by+pw/3+72); }
  return o; });
const POS19=[{g:'cobalt',name:'Poster A',comp:'low'},{g:'paper',name:'Poster B',comp:'high'},{g:'olive',name:'Poster C',comp:'mid'},{g:'ultra',name:'Billboard',comp:'wide'}];
function d5_poster(g,box,spec,line,seed){ const [x,y,bw,bh]=box, P=M.PAL[spec.g], wide=spec.comp==='wide', m=wide?bh*.12:bw*.075;
  g.save(); g.beginPath(); g.rect(x,y,bw,bh); g.clip(); M.fill(g,P.ground,x,y,bw,bh);
  let xh, base, cs, cx0, cyb, cw; const total=M.LOGO.w-M.LOGO.x0, ratio=total/M.LOGO.xh;
  if(wide){ xh=bh*.21; base=y+bh*.66; cs=Math.max(12,bh*.115); cx0=x+m+xh*ratio+bh*.26; cw=x+bw-m-cx0; }
  else { xh=(bw-2*m)*.86/ratio; cs=Math.max(15,bw*.082); cw=bw-2*m; cx0=x+m;
    base=spec.comp==='low'?y+bh*.8:spec.comp==='high'?y+bh*.3:y+bh*.56; }
  const geo=M.logoGeo(x+m,base,xh), lw=wide?cw:cw*.82, sent=line.replace(/\.\s+/g,'.\u0001').split('\u0001'), lines=sent.length>1&&sent.every(t=>d5_tw(t,{size:cs,weight:300})<=lw)?sent:M.wrap(g,line,lw,{size:cs,weight:300}), lh=Math.round(cs*1.08);
  /* copy position: top for low/mid, bottom for high, right of the wordmark (vertically centered) on the billboard */
  let ly; if(wide) ly=y+bh*.5-(lines.length*lh)/2+cs*.8; else if(spec.comp==='high') ly=y+bh-m-(lines.length-1)*lh-bh*.06; else ly=y+m+cs*.9;
  const cbox=[cx0-cs*.5,ly-cs*1.05,cx0+Math.max(...lines.map(l=>d5_tw(l,{size:cs,weight:300})))+cs*.5,ly+(lines.length-1)*lh+cs*.45];
  const lm=M.logoMask(geo,geo.clear), tx=geo.tittle.cx, ty=geo.tittle.cy, inBox=(px,py)=>px<x||py<y||px>x+bw||py>y+bh;
  const lbox=[0,0,0,0];
  const mask=(px,py)=>inBox(px,py)||lm(px,py)||(px>cbox[0]&&px<cbox[2]&&py>cbox[1]&&py<cbox[3])||(px>lbox[0]&&px<lbox[2]&&py>lbox[1]&&py<lbox[3]);
  const cR=geo.tittle.h*.5+geo.clear*1.7, aw=Math.max(3,geo.clear*.7), B=new M.Buf(g,(px,py)=>mask(px,py)||Math.abs(Math.hypot(px-tx,py-ty)-cR)<aw), far=Math.max(Math.hypot(tx-x,ty-y),Math.hypot(tx-x-bw,ty-y),Math.hypot(tx-x,ty-y-bh),Math.hypot(tx-x-bw,ty-y-bh));
  const step=wide?bh*.088:bw*.044, n=Math.ceil(far/step), bx4=[x,y,x+bw,y+bh], tint=d5_mix(P.ground,P.ring,.34);
  d5_atmos(B,{box:[Math.max(x,tx-step*6),Math.max(y,ty-step*6),Math.min(x+bw,tx+step*6),Math.min(y+bh,ty+step*6)],cx:tx,cy:ty,R:step*5,amount:.2,rays:12,rayPow:5,rayPhase:Math.PI/12,sp:2.1,seed:seed+3,r:.5,color:P.soft});
  for(let i=1;i<=n;i++){ const Ri=i*step*(1+.004*i), out=cl((Ri-step*6)/(far-step*6)), bwid=Math.max(2,step*.17)*(.85+.3*Math.min(1,i/8)), loose=out*out*.5;
    d5_ringIn(B,{cx:tx,cy:ty,R:Ri,w:bwid+loose*step*.25,swell:.5,dpl:Math.min(1.25,.35+bwid*.36)*(1-.45*out*out),rCore:wide||bw>300?1:.9,rEdge:.55,seed:seed*7+i*13,color:P.ring,wobble:loose*.03,loose:loose*step*.35},bx4); }
  /* strays past the last ring: the not-yet, at the edge */
  const SR=M.rng(seed+9); for(let i=0;i<14;i++){ const a=SR()*TAU, d=far*(.55+SR()*.5); B.dot(tx+Math.cos(a)*d,ty+Math.sin(a)*d,.8+SR()*.6,P.ring); }
  B.flush();
  /* the accent: one ring around the tittle, just beyond its clear space (the field begins at the i) */
  const A=new M.Buf(g,lm);   /* cR: just outside the knockout, so it reads as an arc over the i; the field leaves it a clear lane */ M.ring(A,{cx:tx,cy:ty,R:cR,w:Math.max(1.6,cR*.12),swell:.35,dpl:1.6,rCore:1,rEdge:.6,seed:seed+77,color:P.center}); A.flush();
  M.logo(g,x+m,base,xh,{color:P.ring});
  lines.forEach((l,i)=>M.text(g,l,cx0,ly+i*lh,{size:cs,weight:300,track:d5_trk(cs),color:P.ring}));
  g.restore();
  return {box,lines,cx0,ly,lh,cs,P,tx,ty,cR,lm,seed}; }
/* the plate, drawn once into a cached layer; the posters' copy layout is kept for the flashes */
function base19(st,w,h){ return d5_slot(st,'base',d5_DK(w,h)+'|'+st.line,()=>{ const L=lay19(w), PP=M.PAL.paper, ink=PP.ink, soft=PP.soft, {cv,g}=d5_off(w,h);
  M.fill(g,PP.ground); d5_head(g,w,'L-19','Editorial · campaign',null,soft,{pad:L.pad}); d5_disp(g,'Out of home',L.pad,L.ph?64:76,L.ph?30:40,ink);
  const line=LINES19[st.line]||LINES19[0], lay=[];
  L.P.forEach((b,i)=>{ lay.push(d5_poster(g,b,POS19[i],line,190+i*31)); d5_lab(g,POS19[i].name+' · 4:5',b[0],b[1]+b[3]+22,ink,9); });
  lay.push(d5_poster(g,L.bb,POS19[3],line,290)); d5_lab(g,'Billboard · 3:1',L.bb[0],L.bb[1]+L.bb[3]+22,ink,9);
  cv._lay=lay; return cv; }); }
/* the line as a sung motif: syllables counted from the words (d5_syl), set on 8ths at 144 BPM; a stressed word takes a quarter,
   a sentence's last syllable a dotted quarter, and a sentence ends on 1 (a comma would end on 5). The tune arches over chord
   tones (I, then IV or vi, V before the end, I at the period); it is an ober with an outdoor slap echo over a pad and a plucked bass. */
const BPM19=144, E19=60000/BPM19/2, WEAK19=['it','a','the','from','you','of'];
function m2_line19(line){ const words=line.split(' '), out=[]; let n8=0, wi=0;
  const sent=[]; let cur=[]; words.forEach((w,i)=>{ const k=d5_syl(w); for(let j=0;j<k;j++) cur.push({w:i,j,k,end:j===k-1&&/[.,]$/.test(w),comma:/,$/.test(w),weak:WEAK19.includes(w.toLowerCase().replace(/[^a-z]/g,''))}); if(/[.,]$/.test(w)){ sent.push(cur); cur=[]; } }); if(cur.length) sent.push(cur);
  sent.forEach((S,si)=>{ const n=S.length; let prev=null; S.forEach((q,i)=>{ const u=n>1?i/(n-1):0, last=i===n-1, sym=last?(q.comma?'A':'D'):i===n-2?'A':i===0?'D':(i%2?'G':'Bm'), len=last?3:(q.weak||q.j>0?1:2);
      let m; if(last) m=q.comma?69:(si===sent.length-1?62:74); else { const C=mu.tones(sym,'D4','B5'), aim=66+9*Math.sin(Math.PI*Math.min(1,u*1.15))+(q.weak?-2:0); m=C.reduce((a,c)=>Math.abs(c-aim)<Math.abs(a-aim)?c:a,C[0]); if(prev!=null&&Math.abs(m-prev)>7) m=C.reduce((a,c)=>Math.abs(c-prev)<Math.abs(a-prev)?c:a,C[0]); }
      out.push({t:n8*E19,d:len*E19,m,sym,w:q.w,last,first:i===0}); prev=m; n8+=len; }); n8+=1; });
  return {out,end:n8*E19}; }
function music19(st){ const L=m2_line19(LINES19[st.line]||LINES19[0]), S=mu.score({bpm:BPM19}), O=L.out;
  S.harm(O.map(q=>[q.t,q.sym]));
  /* the bed: one pad chord per run of the same chord, voice-led, and its root plucked low */
  let pv=null; O.forEach((q,i)=>{ if(i&&O[i-1].sym===q.sym) return; let j=i; while(j+1<O.length&&O[j+1].sym===q.sym&&!O[j].last) j++; const d=O[j].t+O[j].d-q.t, v=mu.voice(q.sym,'F#3','E4',3,pv); pv=v;
    S.chord(q.t,'pad',v,d+(O[j].last?900:0),{attack:.06,release:O[j].last?1.4:.25,cutoff:900,vel:.4}); let r=mu.midi(mu.parse(q.sym).root+'2'); if(r>45) r-=12; S.note(q.t,'pluck',r,260,{cutoff:340,vel:.6}); });
  O.forEach(q=>{ S.note(q.t,'ober',q.m,q.d*.92,{vel:q.last?.7:.6,cutoff:q.last?1200:1450,vibrato:q.last?14:5,echo:.38,echoTime:.115,pan:.08},['w'+q.w,1]);
    if(q.last) S.note(q.t,'bell',q.m+12,1600,{ratio:3.5,bright:.8,vel:.38,pan:.25},['cad',1]); });
  S.end(L.end+1300); return S.out(); }
/* the flashes: each word of the copy warms toward the accent as its syllables are sung (the same glyphs, clipped to the word);
   at each period the accent ring around the tittle swells */
function flash19(g,st,lay,t){ const words=(LINES19[st.line]||LINES19[0]).split(' '), ew=words.map((_,i)=>m2_env(st,'w'+i,t,260)), ec=m2_env(st,'cad',t,520);
  lay.forEach(q=>{ const [x,y,bw,bh]=q.box, P=q.P, o={size:q.cs,weight:300,track:d5_trk(q.cs)}; g.save(); g.beginPath(); g.rect(x,y,bw,bh); g.clip(); let wi=0;
    q.lines.forEach((ln,li)=>{ const ws=ln.split(' '), sp=d5_tw('a a',o)-d5_tw('aa',o); let px=q.cx0; ws.forEach((wd,k)=>{ const ww=d5_tw(wd,o), e=ew[wi+k]||0;
        if(e>.03){ g.save(); g.beginPath(); g.rect(px-sp*.45,q.ly+li*q.lh-q.cs*1.1,ww+sp*.9,q.cs*1.5); g.clip(); M.text(g,ln,q.cx0,q.ly+li*q.lh,Object.assign({color:d5_mix(P.ring,P.center,Math.min(1,e))},o)); g.restore(); }
        px+=ww+sp; }); wi+=ws.length; });
    if(ec>.03){ const A=new M.Buf(g,q.lm); M.ring(A,{cx:q.tx,cy:q.ty,R:q.cR*(1+.08*ec),w:Math.max(1.6,q.cR*.12),swell:.35,dpl:1.6,rCore:1+.8*ec,rEdge:.6+.4*ec,seed:q.seed+77,color:P.center}); A.flush(); }
    g.restore(); }); }
M.piece({ id:'L-19',
  caption:'A campaign of three posters and a billboard on four grounds, with the wordmark set large and the field radiating from the dot on the i. Change Line to set and sing every piece with a different line.',
  alt:'Three portrait posters (cobalt, paper, olive) and one wide ultramarine billboard. Each shows the mindgut wordmark large with stippled rings radiating from the dot of the i, an accent ring around that dot, and one line of copy such as “Say it once. It stays.”',
  recipe:{
    idea:'The brand and Mir meet at one point, the tittle, and the figure survives every ground.',
    marks:['ring','center','stray','dot'],
    ground:'cobalt, paper, olive, ultramarine',
    accent:'one ring around the tittle, just beyond its clear space',
    composition:'Three 4:5 posters in a row (stacked on phones), each with the wordmark large at a different height and one line of copy; a 3:1 billboard below with the copy right of the wordmark.',
    motion:'A still plate. Play or a Line change sings the line at 144 BPM: each word of the copy warms toward the accent on its syllables (260 ms decay), and at each period the accent ring around the tittle swells.',
    sound:'The line is sung: one ober note per counted syllable on 8ths, stressed words longer, the tune arching over chord tones to land on the root at each period, with an outdoor slap echo over a pad and plucked bass.',
    controls:['Line (three lines): the tune, its rhythm and its cadences'],
    computed:['rings radiate from the tittle, knocked out by the clear space around the letters, a lane around the accent and a box around the copy','only the arcs inside each poster are computed','outer rings loosen toward the edges; 14 strays past the last ring','light: ray dots around the tittle, as M.atmos'],
    placeholder:['campaign lines'],
    root:'',
    rules:['the wordmark set large, one flat color, untouched','the accent appears only around the tittle'],
    engine:['M.ring','M.logo','M.logoGeo','M.logoMask','M.LOGO','M.Buf','M.rng','M.text','M.wrap','M.fill']
  },
  aspect:w=>w/lay19(w).H,
  state:{line:0},
  controls:[{id:'line',type:'select',label:'Line',play:true,options:LINES19.map((l,i)=>({value:i,label:l}))}],
  autoplay:false,
  music:music19,
  render(g,w,h,M,st){ d5_blit(g,base19(st,w,h)); },
  animate(g,w,h,M,st,t){ const B=base19(st,w,h); d5_blit(g,B); if(!d5_RM()) flash19(g,st,B._lay,t); return t<m2_line19(LINES19[st.line]||LINES19[0]).end+900; } });

/* ════════════════════════════════════════════════════════════════════════
   L-20 · States of the system · seven states of one field, as a table a team can build from, with a live preview.
   Concrete rules: loading gathers dots and never spins; empty has no center (nobody has met yet); offline drops the
   accent and freezes the strays; error loosens the field and adds one plain line, and the accent never appears in it,
   so color never means failure; recovered settles back and the accent returns.
   ════════════════════════════════════════════════════════════════════════ */
const PN20=M.PAL.night;
/* the music's grid: 105 BPM, every state a 2-beat cell (1.143 s); the motions are re-timed to it */
const BPM20=105, B20=60000/BPM20, CELL20=2*B20;
const ST20=[
  {id:'loading',name:'Loading',ui:'One moment.',sees:'Dots drift in from the edges and gather toward a ring. No spinner, no percent.',means:'Mir is opening your field. Nothing is wrong.',motion:'Loop 2 beats · gather, then release · in-out cubic',still:.48*CELL20},
  {id:'empty',name:'Empty',ui:'Tell Mir something.',sees:'Seven strays and the faintest first ring. No center.',means:'Nothing has been said yet, so nobody has met.',motion:'Strays drift ±1 px on a 6 s period',still:0},
  {id:'listening',name:'Listening',ui:'Mir is listening.',sees:'Your field. Its outer ring breathes while you type or speak.',means:'Mir is taking it in and will not answer yet.',motion:'Outer ring breathes once per 2 beats · follows input',still:CELL20/4},
  {id:'composing',name:'Composing',ui:'Mir is writing back.',sees:'Strays gather into a small ring at the center.',means:'Mir is composing a reply.',motion:'Loop 2 beats · strays land on 16ths · out cubic',still:1.6*B20},
  {id:'offline',name:'Offline',ui:'Offline. What you write waits here.',sees:'The same field, quiet: no color at the center, strays still.',means:'No connection. Nothing is sent; nothing is lost.',motion:'None · frozen until the connection returns',still:0},
  {id:'error',name:'Error',ui:'That didn’t go through. Nothing you said is lost.',sees:'The field loosens, and one plain line says what happened.',means:'A request failed. The accent never appears here.',motion:'Loosen over 1 beat, then still',still:9e3},
  {id:'recovered',name:'Recovered',ui:'Back. Nothing was lost.',sees:'The field settles back and the center’s color returns.',means:'In tune again. Nothing to do.',motion:'Settle over 1 beat · once',still:9e3}];
const d5_strays20=(R,n,seed)=>{ const Rr=M.rng(seed), o=[]; for(let i=0;i<n;i++){ const a=Rr()*TAU, d=R*(1.02+Rr()*.3); o.push([Math.cos(a)*d,Math.sin(a)*d,.85+Rr()*.6,Rr()*TAU,Rr()*TAU]); } return o; };
/* one state of the field at time t (ms since the state began); zp ∈ [0,1]: the dots swell with the state's notes */
function d5_st20(B,i,cx,cy,R,t,small,zp){ const P=PN20, id=ST20[i].id, n=small?3:6, ink=P.ring, tint=d5_mix(P.ground,P.ring,.36), seed=2000+i*7, kz=1+.6*(zp||0), z=(small?.9:1)*kz, b=B20;
  const field=(k,col,center,disp)=>d5_field(B,{cx,cy,R,k,rings:n,seed,color:col,center,disp,z});
  if(id==='loading'){ const N=small?40:130, Rr=M.rng(seed+1); for(let j=0;j<N;j++){ const a=Rr()*TAU, r0=R*(1.12+Rr()*.22), r1=R*.62+Rr.gauss()*R*.012, s=Rr(), u=((t/CELL20)+s*.22)%1, e=E.inOutCubic(u<.5?u/.5:1-(u-.5)/.5), rr=lerp(r0,r1,e), aa=a+e*.35;
      B.dot(cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr,(small?.75:.95)*(.9+.2*s)*kz,e>.55?ink:tint); } }
  else if(id==='empty'){ M.ring(B,{cx,cy,R:R*.62,w:2,dpl:small?.12:.07,rCore:.8,rEdge:.55,seed,color:tint}); d5_strays20(R*.7,7,seed).forEach(p=>B.dot(cx+p[0]+Math.sin(TAU*t/6000+p[3]),cy+p[1]+Math.cos(TAU*t/6000+p[4]),p[2]*(small?.9:1.3)*kz,ink)); }
  else if(id==='listening'){ const br=Math.sin(TAU*t/CELL20); field(.58,ink,P.center,j=>j===n?R*.045*br:j===n-1?R*.02*Math.sin(TAU*t/CELL20-.7):0); }
  else if(id==='composing'){ field(.74,tint,null); const N=small?12:26, Rr=M.rng(seed+3), tl=((t%CELL20)+CELL20)%CELL20, r1=R*.2, ed=.45*b;
    /* six groups of strays land on 16ths 1–6 (each outCubic reaches 0.9 on its 16th) */
    for(let j=0;j<N;j++){ const a=Rr()*TAU, r0=R*(.75+Rr()*.5), th=j/N*TAU, gi=Math.floor(j*6/N), e=E.outCubic(cl((tl-((gi+1)*b/4-.54*ed))/ed)), d=((th-a)%TAU+TAU*1.5)%TAU-Math.PI, aa=a+d*e, rr=lerp(r0,r1,e); B.dot(cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr,(small?.8:1.1)*kz,ink); }
    d5_field(B,{cx,cy,R:R*.07,rings:1,k:.9,color:P.center,seed:seed+9,z}); }
  else if(id==='offline'){ field(.74,tint,null); d5_strays20(R*.85,6,seed).forEach(p=>B.dot(cx+p[0],cy+p[1],p[2]*(small?.9:1.2)*kz,tint)); }
  else if(id==='error'){ const k=lerp(.74,.22,E.outCubic(cl(t/b))); field(k,ink,ink); }
  else if(id==='recovered'){ const e=E.outCubic(cl(t/b)), k=lerp(.22,.95,e), q=Math.round(e*6)/6; field(k,ink,d5_mix(ink,P.center,q)); } }
/* three layouts: wide (preview beside a 5-column table), mid (preview above it, its words to the right), narrow (rows stacked) */
const lay20=d5_memo(function(w){ const pad=w<480?16:32, o={pad,tb:w<480?64:76,ts:w<480?30:40}, iw=w-2*pad;
  const colsFor=(x,tw,fixed)=>{ const c=fixed||[(tw-168-64)/3,(tw-168-64)/3,(tw-168-64)/3]; const ws=[72,96,c[0],c[1],tw-72-96-c[0]-c[1]-64]; const out=[]; ws.forEach(cw=>{ out.push([x,cw]); x+=cw+16; }); return out; };
  const rowsFrom=y=>ST20.map(s=>{ const n=Math.max(...[[s.sees,2],[s.means,3],[s.motion,4]].map(([t,c])=>d5_lines(t,o.cols[c][1],{size:13,weight:300}).length)), hh=Math.max(76,24+n*18+12); const r=[y,y+hh]; y+=hh; return r; });
  if(iw-360-40>=650){ o.wide=true; o.pv=360; o.px=w-pad-o.pv; o.py=132; o.tx=pad; o.tw=o.px-40-pad; o.cols=colsFor(pad,o.tw); o.hy=o.py+18; o.rows=rowsFrom(o.py+30);
    o.lab=[o.px,o.py-12]; o.mot=[o.px,o.py+o.pv+24]; o.ui=[o.px,o.py+o.pv+56,o.pv]; o.clr=[[o.px-2,o.py-28,o.pv+4,24],[o.px-2,o.py+o.pv+6,o.pv+4,98]];
    o.H=q4(Math.max(o.rows[6][1],o.py+o.pv+120)+48); }
  else if(w>=640){ o.mid=true; o.pv=q4(Math.min(340,iw*.42)); o.px=pad; o.py=132; o.tx=pad; o.tw=iw; o.cols=colsFor(pad,iw); const ux=o.px+o.pv+40, uw=w-pad-ux;
    o.lab=[ux,o.py+16]; o.mot=[ux,o.py+38]; o.ui=[ux,o.py+92,uw]; o.clr=[[ux-2,o.py,uw+4,o.pv]];
    o.hy=o.py+o.pv+56; o.rows=rowsFrom(o.hy+12); o.H=q4(o.rows[6][1]+48); }
  else { o.pv=Math.min(iw,420); o.px=pad+(iw-o.pv)/2; o.py=w<480?124:132; let y=o.py+o.pv+108; o.tx=pad; o.tw=iw;
    o.lab=[o.px,o.py-12]; o.mot=[o.px,o.py+o.pv+24]; o.ui=[o.px,o.py+o.pv+56,o.pv]; o.clr=[[o.px-2,o.py-28,o.pv+4,24],[o.px-2,o.py+o.pv+6,o.pv+4,98]];
    o.rows=ST20.map(s=>{ let hh=76-26+14; [s.sees,s.means,s.motion].forEach(t=>{ hh+=18*d5_lines(t,iw-64,{size:13,weight:300}).length+26; }); const r=[y,y+hh]; y+=hh; return r; }); o.H=q4(y+40); }
  return o; });
/* static layer: everything that does not depend on the selection (cached per size) */
function base20(st,w,h){ return d5_slot(st,'base',d5_DK(w,h),()=>{ const L=lay20(w), {cv,g}=d5_off(w,h), P=PN20, ink=P.ring, soft=d5_mix(P.ground,P.ring,.62), dim=d5_mix(P.ground,P.ring,.42), hair=d5_mix(P.ground,P.ring,.16);
  M.fill(g,P.ground); d5_head(g,w,'L-20','Concept · state table',null,dim,{pad:L.pad}); d5_disp(g,'States of the system',L.pad,L.tb,L.ts,ink);
  d5_lab(g,L.cols?'Hover or tap a row to play it':'Tap a row to play it',L.pad,L.tb+28,dim,9);
  const B=new M.Buf(g);
  ST20.forEach((s,i)=>{ const [y0]=L.rows[i]; M.rule(g,L.tx,y0,L.tx+L.tw,y0,hair);
    if(L.cols){ const R=24; d5_st20(B,i,L.cols[0][0]+8+R,y0+12+R,R,s.still,true);
      d5_lab(g,String(i+1).padStart(2,'0'),L.cols[1][0],y0+24,dim,9); M.text(g,s.name,L.cols[1][0],y0+44,{size:16,weight:400,color:ink});
      [s.sees,s.means,s.motion].forEach((t,c)=>d5_para(g,t,L.cols[c+2][0],y0+26,L.cols[c+2][1],{size:13,lh:18,color:c===2?soft:ink,weight:300})); }
    else { const R=20; d5_st20(B,i,L.tx+R+2,y0+16+R,R,s.still,true); d5_lab(g,String(i+1).padStart(2,'0'),L.tx+60,y0+28,dim,9); M.text(g,s.name,L.tx+60,y0+48,{size:16,weight:400,color:ink});
      let y=y0+76; [['What the person sees',s.sees],['What it means',s.means],['Motion',s.motion]].forEach(([k,t])=>{ d5_lab(g,k,L.tx+60,y,dim,9); y=d5_para(g,t,L.tx+60,y+18,L.tw-64,{size:13,lh:18,color:k==='Motion'?soft:ink})+26; }); } });
  M.rule(g,L.tx,L.rows[6][1],L.tx+L.tw,L.rows[6][1],hair);
  if(L.cols) ['','State','What the person sees','What it means','Motion'].forEach((k,c)=>k&&d5_lab(g,k,L.cols[c][0],L.hy,dim,9));
  B.flush();
  const {px,py,pv}=L, tk=10; [[px,py,1,1],[px+pv,py,-1,1],[px,py+pv,1,-1],[px+pv,py+pv,-1,-1]].forEach(([x,y,sx,sy])=>{ M.rule(g,x,y,x+sx*tk,y,dim); M.rule(g,x,y,x,y+sy*tk,dim); });
  return cv; }); }
/* the selection layer: a marker on the row, its number in the accent, and the preview's label, motion and the line the person reads */
function d5_selLayer20(g,L,sel){ const P=PN20, ink=P.ring, dim=d5_mix(P.ground,P.ring,.42), [y0,y1]=L.rows[sel], {px,py,pv}=L;
  M.rule(g,L.tx+1,y0+14,L.tx+1,y1-14,P.center,2);
  const nx=L.cols?L.cols[1][0]:L.tx+60, ny=y0+(L.cols?24:28); M.fill(g,P.ground,nx-2,ny-10,26,14); d5_lab(g,String(sel+1).padStart(2,'0'),nx,ny,P.center,9);
  L.clr.forEach(r=>M.fill(g,P.ground,r[0],r[1],r[2],r[3]));
  d5_lab(g,'Preview · '+String(sel+1).padStart(2,'0')+' '+ST20[sel].name,L.lab[0],L.lab[1],ink,9.5); d5_lab(g,ST20[sel].motion,L.mot[0],L.mot[1],dim,9);
  d5_para(g,ST20[sel].ui,L.ui[0],L.ui[1],L.ui[2],{size:L.pad>16?22:20,lh:L.pad>16?28:26,color:ink}); }
/* draw: a full pass when the selection or size changed, otherwise only the preview square (one sub-rect blit + its dots).
   zp: the preview's dots swell with the state's notes; er: the row marker thickens on the cell's step */
function d5_prev20(g,st,w,h,sel,t,zp,er){ const L=lay20(w), c=d5_c(st), key=d5_DK(w,h)+'|'+sel, base=base20(st,w,h), R=L.pv*.36, d=g.dpr;
  if(c.shown!==key){ d5_blit(g,base); d5_selLayer20(g,L,sel); c.shown=key; }
  else { const x=Math.floor(L.px*d), y=Math.floor(L.py*d), s=Math.ceil(L.pv*d)+1; g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(base,x,y,s,s,x,y,s,s); g.restore(); }
  if(er!=null){ const [y0,y1]=L.rows[sel], X=Math.floor((L.tx-4)*d), Y=Math.floor((y0+10)*d), W=Math.ceil(10*d), H=Math.ceil((y1-y0-20)*d); g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(base,X,Y,W,H,X,Y,W,H); g.restore(); M.rule(g,L.tx+1+1.2*er,y0+14,L.tx+1+1.2*er,y1-14,PN20.center,2+2.5*er); }
  const B=new M.Buf(g); d5_st20(B,sel,L.px+L.pv/2,L.py+L.pv/2,R,t,false,zp||0); B.flush(); }
const d5_sel20=st=>Math.max(0,ST20.findIndex(s=>s.id===st.state));
/* L-20 music: each state is a musical state, one 2-beat cell at 105 BPM, in the night ground's mode (Dorian):
   loading · an arpeggio building, D F A, and a tick where its top should be (unfinished)
   empty   · a rest with one breath
   listening · a tonic drone (D and A) that breathes with the outer ring
   composing · the gathering figure: six strays land on six 16ths up the chord, then the chord
   offline · a tape stop: the voices fall two octaves and end in a muted thud
   error   · the suspension (G over D and A), wavering, left unresolved
   recovered · the same suspension falls to the third as the field settles, with `meet` blooming on the lock and the bass (once) */
function m2_cell20(S,id,t0,bass){ const b=B20, md=S.mode, D=n=>mu.deg(md,n,4), tag=Math.round(t0);
  if(id==='loading'){ [0,2,4].forEach((n,k)=>S.note(t0+k*b/2,'pulse',D(n),b*.42,{pw:.3,cutoff:1200+400*k,env:1.3,q:2.2,vel:.62+.06*k},['n',.7])); S.hitSound(t0+1.5*b,'tick',{vel:.4},['n',.35]); }
  else if(id==='empty') S.hitSound(t0+b/2,'breath',{dur:1.1,vel:.82,freq:640},['n',.5]);
  else if(id==='listening'){ const k='dr'+tag; S.note(t0,'drone',50,CELL20-550,{id:k,ratio:3/2,level:.3,fade:.25}); S.set(t0+b*.5,k,'level',.5,b*.45); S.set(t0+b*1.5,k,'level',.26,b*.45); S.note(t0,'pluck','D2',300,{cutoff:340,vel:.6},['n',.6]); }
  else if(id==='composing'){ [0,2,4,7,9,11].forEach((n,k)=>S.note(t0+(k+1)*b/4,'mallet',D(n),620,{vel:.58+.04*k,ratio:4,pan:-.4+.16*k},['n',.6])); S.chord(t0+1.75*b,'mallet',[D(0),D(2),D(4),D(7)],1000,{vel:.66,trem:5},['n',1]); }
  else if(id==='offline'){ [[D(0),.68],[D(4),.58]].forEach(([m,v],k)=>{ const k2='to'+k+'_'+tag; S.note(t0,'glide',m,b*1.05,{id:k2,attack:.01,release:.1,vibrato:0,wow:0,flutter:0,tone:2400,vel:v},k?null:['n',.8]); S.glide(t0+30,k2,m-24,b*.95); }); S.hitSound(t0+b*1.1,'tap',{vel:.8},['n',.7]); }
  else if(id==='error'){ S.hitSound(t0,'snap',{vel:.42},['n',.8]); [50,57].forEach(m=>S.note(t0,'organ',m,CELL20*.92,{attack:.02,release:.35,vel:.44,vibrato:2,cutoff:2200})); S.note(t0,'glide',D(3),CELL20*.92,{vel:.56,vibrato:18,rate:6.6,attack:.02,release:.45,tone:3000}); }
  else if(id==='recovered'){ const k='rv'+tag; [50,57].forEach(m=>S.note(t0,'organ',m,CELL20+700,{attack:.02,release:1,vel:.42,vibrato:2,cutoff:2200}));
    S.note(t0,'glide',D(3),CELL20+700,{id:k,vel:.56,vibrato:6,attack:.02,release:1,tone:3000},['n',.6]); S.glide(t0+b,k,D(2),150);
    S.note(t0,'meet',D(2)+12,b/.62,{spread:30,vel:.5}); S.note(t0+b,'bell',D(7)+12,2000,{ratio:3.5,vel:.46,pan:.2},['n',1]);
    if(bass) S.note(t0+b,'bass','D2',700,{from:'A1',glide:90,env:2.6,decay:.36,vel:.6},['lock',1]); } }
const m2_harm20=(id,t0)=>id==='error'?[[t0,'Dsus4']]:id==='recovered'?[[t0,'Dsus4'],[t0+B20,'Dm']]:[[t0,'Dm']];
/* Play: the seven cells in turn (beats 0–14), each row stepped with a rim; the recovered chord rings through bar 4 */
function music20(st){ const S=mu.score({bpm:BPM20,ground:'night'}), H=[];
  ST20.forEach((x,i)=>{ const t0=i*CELL20; H.push(...m2_harm20(x.id,t0)); S.hitSound(t0,'rim',{vel:.3,tune:.9},['row'+i,1]); m2_cell20(S,x.id,t0,i===6); });
  S.harm(H); S.chord(13*B20,'pad',[50,53,57,62],3*B20,{attack:.1,release:1.4,cutoff:1000,vel:.42});
  S.end(16*B20+400); return S.out(); }
/* a selected or hovered state: its cell, four times (the bass only on the first lock) */
function m2_prevScore20(id){ const S=mu.score({bpm:BPM20,ground:'night'}), H=[]; for(let k=0;k<4;k++){ H.push(...m2_harm20(id,k*CELL20)); m2_cell20(S,id,k*CELL20,k===0); } S.harm(H); S.end(4*CELL20); return S.out(); }
/* the preview's own loop after a hover, tap or State change: the state's cell four times, sound and picture on one clock (the
   heard audio clock when sound is on), only while on screen */
function d5_live20(st){ const c=d5_c(st); cancelAnimationFrame(c.raf||0); c.raf=0; const req=c.sndReq; c.sndReq=false; const sel=d5_sel20(st), sc=m2_prevScore20(ST20[sel].id), ctx={_mus:sc}; c.pmus=sc;
  let A0=null; const A=req?m2_A('L-20'):null;
  if(A){ try{ const bu=A.bus(); if(bu) bu.stopAll(60); }catch(_){} A0=Math.max(A.now()+.07,(c.lastA0||0)+.11); c.lastA0=A0; try{ A.score(sc.events,{when:A0}); }catch(e){ console.error(e); } }
  if(d5_RM()||!c.live) return; const t0=performance.now();
  const step=now=>{ const L=c.live; if(d5_sel20(st)!==sel||!L) return; const r=L.g.canvas.getBoundingClientRect(); if(r.bottom<0||r.top>innerHeight){ c.raf=0; return; }
    let t=now-t0; if(A0!=null&&M.audio&&M.audio.enabled) t=(mu.heard()-A0)*1000;
    if(t>=4*CELL20){ d5_prev20(L.g,st,L.w,L.h,sel,ST20[sel].still,0,0); c.raf=0; return; }
    d5_prev20(L.g,st,L.w,L.h,sel,(Math.max(0,t))%CELL20,mu.env(ctx,'n',t,190),0); c.raf=requestAnimationFrame(step); };
  c.raf=requestAnimationFrame(step); }
M.piece({ id:'L-20',
  caption:'Seven states of one field, from loading to recovered, each with what the person sees, what it means and how it moves. Hover or tap a row, or pick a State, to play it in the preview.',
  alt:'A dark state table with seven rows, each with a small stippled field in that state, its name and three columns of text, beside a large preview of the selected state with the line the person reads, such as “Mir is listening.”',
  recipe:{
    idea:'System states are states of the same field; color leaves with the connection and does not stand for failure.',
    marks:['ring','center','stray','dot'],
    ground:'night',
    accent:'the center ring in listening, composing and recovered, and the selected row’s marker; it is absent in offline and error',
    composition:'A seven-row state table (thumbnail, name, what the person sees, what it means, motion) beside a large preview of the selected state and its line; on narrow screens the preview sits above stacked rows.',
    motion:'4 bars at 105 BPM: Play steps through the states, 2 beats each, the row marker thickening on each step and the preview’s dots swelling on each note. A selected state loops its 2-beat cell four times. Reduced motion shows each state’s still.',
    sound:'Each state is a musical state: loading an unfinished arpeggio, empty a breath, listening a tonic drone, composing the gathering figure, offline a tape stop to a thud, error an unresolved suspension, recovered that suspension falling to the third with the bass.',
    controls:['State: plays its cell, looped','hover or tap a row'],
    computed:[],
    placeholder:['the line each state shows'],
    root:'',
    rules:['loading gathers dots and never spins','empty has no center','offline drops the accent and freezes the strays','error loosens the field with one plain line and no accent'],
    engine:['M.ring','M.rng','M.Buf','M.ease.inOutCubic','M.ease.outCubic','M.music.score','M.music.env','M.text','M.wrap','M.rule','M.fill']
  },
  aspect:w=>w/lay20(w).H,
  state:{state:'listening'},
  controls:[{id:'state',type:'select',label:'State',options:ST20.map(s=>({value:s.id,label:s.name}))}],
  music:music20,
  previewScore:m2_prevScore20,   /* the looped cell a State change plays (exposed for offline audit) */
  /* a State change sounds through the preview (render → d5_live20), so the default answer is not needed */
  musicParam:(A,st,id)=>id==='state',
  pointer(st,e){ const L=lay20(e.w), c=d5_c(st); if(e.type==='up') return false; if(e.type==='move'&&e.down) return false;
    const i=L.rows.findIndex(([a,b])=>e.y>=a&&e.y<b&&e.x>=L.tx&&e.x<=L.tx+L.tw); if(i<0) return false; c.user=performance.now(); if(ST20[i].id===st.state&&c.raf) return false;
    st.state=ST20[i].id; c.sndReq=true; return true; },
  render(g,w,h,M,st){ const c=d5_c(st), sel=d5_sel20(st), first=!c.live, prev=c.lastSel; c.live={g,w,h}; c.lastSel=sel; c.shown=null; d5_prev20(g,st,w,h,sel,ST20[sel].still); if(!first&&prev!==sel) c.sndReq=true; if(!first&&(prev!==sel||(c.user&&c.user>(c.playT||0)))) d5_live20(st); },
  animate(g,w,h,M,st,t){ t=Math.max(0,t); const c=d5_c(st); c.live={g,w,h}; if(c.lastT==null||t<c.lastT) c.playT=performance.now(); c.lastT=t; const sel=d5_sel20(st);
    if((c.user&&c.user>c.playT)||t>=16*B20){ c.lastT=null; d5_prev20(g,st,w,h,sel,ST20[sel].still); return false; }
    const i=Math.min(6,Math.floor(t/CELL20)); d5_prev20(g,st,w,h,i,t-i*CELL20,m2_env(st,'n',t,190),m2_env(st,'row'+i,t,320)); return true; } });
})();
