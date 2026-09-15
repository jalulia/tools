/* Techniques & Templates · plate runtime · ø co.
   Reads window.STUDY (one per page) and window.TT (manifest). Draws the read plate:
   frame + ticks, read head sweep, ten numbered points, track log, compare (R), variants (tabs),
   motion (M), live DOM demo (L), spec panel (S), related block, pager.
   Everything is generated at runtime; the only bitmap on a page is the inlined reference. */
(function(){
"use strict";
const S=window.STUDY; if(!S){document.body.textContent='no STUDY';return;}
const TT=window.TT||{entries:[],sections:[]};
const ROOT=document.body.dataset.root||'../../';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const px=v=>Math.round(v)+0.5;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=()=>innerWidth<=960;
const me=TT.entries.find(e=>e.id===S.id)||{id:S.id,section:'techniques',code:S.code,title:S.title,techniques:[]};
const section=TT.sections.find(s=>s.id===me.section)||{id:me.section,title:me.section};
const sib=TT.entries.filter(e=>e.section===me.section); const idx=sib.findIndex(e=>e.id===S.id);

/* ---------- nav ---------- */
(function(){ const n=$('nav'); if(!n)return; const prev=sib[idx-1], next=sib[idx+1];
  n.innerHTML=`<a class="brand" href="${ROOT}index.html" title="Index">${TT.mark||''}<span class="wm">IMP<i>Ø</i>SSIBLE</span></a>
  <span class="crumb"><a href="${ROOT}index.html">Techniques &amp; Templates</a><span class="sep">/</span><a href="${ROOT}index.html#${esc(section.id)}">${esc(section.title)}</a><span class="sep">/</span><b>${esc(S.title)}</b><span class="code">${esc(S.code)}</span></span>
  <span class="pager">${prev?`<a href="${ROOT}${prev.path}index.html" title="${esc(prev.title)}">← ${esc(prev.code)}</a>`:'<a class="off">←</a>'}<a href="${ROOT}index.html#${esc(section.id)}"><span class="n">${idx+1}</span>&nbsp;/ ${sib.length}</a>${next?`<a href="${ROOT}${next.path}index.html" title="${esc(next.title)}">${esc(next.code)} →</a>`:'<a class="off">→</a>'}</span>`; })();

/* ---------- notes column ---------- */
(function(){ const el=$('copy'); const T=S.spec.techniques||[];
  const chips=T.map(t=>`<span data-t="${esc(t.id)}" title="${esc(t.name)}">${esc(t.id)}</span>`).join('');
  const steps=(S.spec.pass_order||[]).map(s=>`<li><div><b>${esc(s.split(' · ')[0])}</b>${s.includes(' · ')?' · '+esc(s.split(' · ').slice(1).join(' · ')):''}</div></li>`).join('');
  el.innerHTML=`<p class="kicker">${esc(S.kicker||section.title+' · '+S.code)}</p><h1 class="lede">${esc(S.lede||S.title)}</h1><div class="body">${(S.body||[]).map(p=>`<p>${esc(p)}</p>`).join('')}</div>
  ${steps?`<div class="meta" style="display:block"><h2>Pass order</h2><ol class="steps">${steps}</ol></div>`:''}
  <div class="meta"><div class="full"><h2>Techniques read · click to highlight</h2><div class="tags" id="chips">${chips}</div></div>
  <div><h2>Reference</h2><div class="ro">${esc(S.source)}</div></div><div><h2>Study</h2><div class="nm">${esc(S.title)}</div><div class="ro">${esc(S.code)} · ${esc(section.title)} · ${idx+1} / ${sib.length}</div></div></div>
  <div class="foot"><span><b>R</b> compare · <b>V</b> variant · <b>S</b> spec · <b>space</b> re-read${S.motion?' · <b>M</b> motion':''}${S.live?' · <b>L</b> live':''}</span><span>ø co. · 2026</span></div>`; })();

/* ---------- spec panel ---------- */
const specEl=$('spec'), specPre=$('specpre');
const specJSON=JSON.stringify(S.spec,null,2);
function hlJSON(s){ return esc(s).replace(/("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)|\b(true|false|null)\b/g,(m,str,col,num,lit)=>{ if(str)return col?`<span class="k">${str}</span>${col}`:`<span class="s">${str}</span>`; if(num)return `<span class="n">${num}</span>`; return `<span class="n">${lit}</span>`; }); }
specPre.innerHTML=hlJSON(specJSON); $('specid').textContent=S.id;
function openSpec(o){ specEl.classList.toggle('open',o); specEl.setAttribute('aria-hidden',o?'false':'true'); $('bSpec').classList.toggle('on',o); }
function hlTech(id){ const lines=specJSON.split('\n'); let out=[],on=false,depth=0; for(const ln of lines){ if(!on&&ln.includes(`"id": "${id}"`)){ on=true; depth=ln.search(/\S/); } if(on){ out.push(`<span class="hl">${hlJSON(ln)}</span>`); if(ln.search(/\S/)<=depth&&/^\s*\},?$/.test(ln))on=false; } else out.push(hlJSON(ln)); } specPre.innerHTML=out.join('\n'); const h=specPre.querySelector('.hl'); if(h&&specEl.classList.contains('open'))h.scrollIntoView({block:'center'}); }
document.querySelectorAll('#chips span').forEach(c=>{ c.onclick=()=>{ const id=c.dataset.t; const on=c.classList.contains('on'); document.querySelectorAll('#chips span').forEach(x=>x.classList.remove('on')); if(on){ techFocus=null; } else { c.classList.add('on'); techFocus=id; hlTech(id); } dirty=true; }; });
let techFocus=null;

/* ---------- canvas + layout ---------- */
const cv=$('cv'), wrap=cv.parentElement, liveEl=$('live'), logEl=$('log'), relEl=$('rel');
let ctx=cv.getContext('2d'), W=0,H=0,DPR=1;
const INK='#101014', INK50='rgba(16,16,20,0.5)', INK30='rgba(16,16,20,0.3)', GREY='#6F6E6A', PAPER='#FFFFFF', ACC='#F4551E';
const FONT=s=>`${s}px "JetBrains Mono",ui-monospace,Menlo,monospace`;
const hasLS=('letterSpacing' in ctx); const track=(s,em)=>{ if(hasLS)ctx.letterSpacing=(s*em).toFixed(2)+'px'; };
function text(s,x,y,size,em,col,al){ ctx.font=FONT(size); track(size,em||0); ctx.fillStyle=col||INK; ctx.textAlign=al||'left'; ctx.textBaseline='alphabetic'; ctx.fillText(s,x,y); if(hasLS)ctx.letterSpacing='0px'; }
let fig={x:0,y:0,w:0,h:0}; const ar=S.ref.h/S.ref.w;
const artCache={}; let art=null, artKey='', artDone=false;
const variants=S.variants&&S.variants.length?S.variants:[{id:'ref',label:'As reference'}];
let vi=0; const variant=()=>variants[vi];

function layout(){ const r=wrap.getBoundingClientRect(); DPR=Math.min(2,devicePixelRatio||1); W=r.width; H=r.height; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0);
  const mob=mobile(); const relh=mob?0:relEl.getBoundingClientRect().height; const logw=mob?0:(logEl.getBoundingClientRect().width+24);
  const left=mob?16:44, top=mob?30:52, right=mob?16:(logw+44), bottom=(mob?34:46)+relh;
  let bw=W-left-right, bh=H-top-bottom; let fw=bw, fh=fw*ar; if(fh>bh){ fh=bh; fw=fh/ar; }
  fig={x:Math.round(left+(bw-fw)/2),y:Math.round(top+(bh-fh)/2),w:Math.round(fw),h:Math.round(fh)};
  ensureArt(); placePoints(); placeLive(); }
function ensureArt(){ const k=fig.w+'x'+fig.h+'@'+DPR+'#'+variant().id; if(k===artKey&&art)return; artKey=k; if(artCache[k]){ art=artCache[k]; artDone=true; dirty=true; computeFidelity(); return; } renderArt(k); }
function renderArt(key){ const c=document.createElement('canvas'); c.width=Math.round(fig.w*DPR); c.height=Math.round(fig.h*DPR); const x=c.getContext('2d'); x.setTransform(DPR,0,0,DPR,0,0); x.fillStyle='#fff'; x.fillRect(0,0,fig.w,fig.h); artDone=false; art=null; dirty=true;
  const t0=performance.now();
  const finish=()=>{ if(key!==artKey)return; artCache[key]=c; art=c; artDone=true; dirty=true; console.info(`[${S.id}] ${variant().id} rendered in ${Math.round(performance.now()-t0)} ms`); computeFidelity(); };
  try{ const r=S.render(c,fig.w,fig.h,DPR,variant(),finish); if(r!==false&&S.render.length<6)finish(); }catch(e){ console.error(e); finish(); } }

/* ---------- points ---------- */
const P=(S.points||[]).slice(0,10).map((p,i)=>({num:10+i*2,u:p.u,v:p.v,d:p.d||'—',label:p.label||'',t:p.t||null,dir:p.dir||null,lock:-1,x:0,y:0}));
let links=[];
function placePoints(){ const Sz=9; for(const t of P){ t.x=fig.x+t.u*fig.w; t.y=fig.y+t.v*fig.h; }
  for(const t of P){ let dx,dy; if(t.dir){ dx=t.dir[0]; dy=t.dir[1]; } else { dx=t.u<0.5?-1:1; dy=t.v<0.35?-1:(t.v>0.65?1:0); }
    const L=Sz+22; const ex=t.x+dx*L, ey=t.y+(dy||0)*L*0.7; t.sx=dx; t.sy=dy||0; t.ex=ex; t.ey=ey; const lw=22,lh=14; t.lab={x:dx<0?ex-6-lw:ex+6,y:ey-lh/2,w:lw,h:lh}; }
  const n=P.length; links=[]; if(n>1){ const inT=new Array(n).fill(false); inT[0]=true; for(let k=1;k<n;k++){ let best=1e18,bi=-1,bj=-1; for(let i=0;i<n;i++)if(inT[i])for(let j=0;j<n;j++)if(!inT[j]){ const d=Math.hypot(P[i].x-P[j].x,P[i].y-P[j].y); if(d<best){best=d;bi=i;bj=j;} } inT[bj]=true; links.push([bi,bj]); } } }

/* ---------- log rail ---------- */
const rowsEl=$('rows'), ctrEl=$('ctr'), readTxt=$('readtxt'), readCode=$('readcode'), fidEl=$('fid');
const rows=P.map((t,i)=>{ const r=document.createElement('div'); r.className='r blank'; r.tabIndex=0; r.innerHTML='<span></span><span></span><span></span><span></span>'; r.onmouseenter=()=>setHover(t); r.onmouseleave=()=>setHover(null); r.onfocus=()=>setHover(t); r.onblur=()=>setHover(null); r.onclick=()=>select(t); rowsEl.appendChild(r); return r; });
function rowText(r,t,uv,done){ const s=r.children; s[0].textContent=String(t.num); s[1].textContent=uv?uv[0].toFixed(3):'—'; s[2].textContent=uv?uv[1].toFixed(3):'—'; s[3].textContent=done?t.d:'—'; r.classList.toggle('blank',!done); }
rows.forEach((r,i)=>rowText(r,P[i],null,false));
let hover=null, selected=null, dirty=true;
function setHover(t){ hover=t; rows.forEach((r,i)=>r.classList.toggle('on',P[i]===(hover||selected))); showRead(hover||selected); dirty=true; }
function select(t){ selected=(selected===t)?null:t; rows.forEach((r,i)=>r.classList.toggle('on',P[i]===(hover||selected))); showRead(selected||hover); if(selected&&selected.t)hlTech(selected.t); dirty=true; }
function showRead(t){ if(!t){ readTxt.textContent='Hover or select a point.'; readCode.textContent=''; return; } const tech=(S.spec.techniques||[]).find(q=>q.id===t.t); readTxt.textContent=`${t.num} · ${t.d} — ${t.label}`; readCode.textContent=tech&&tech.params?Object.entries(tech.params).slice(0,6).map(([k,v])=>`${k}: ${typeof v==='object'?JSON.stringify(v):v}`).join('\n'):''; }

/* variant tabs */
(function(){ const el=$('vtabs'); if(variants.length<2){ el.hidden=true; return; }
  el.innerHTML=`<span class="vh">${esc(S.variantLabel||'Color')} · V</span>`+variants.map((v,i)=>`<button type="button" data-i="${i}" class="${i===0?'on':''}">${(v.sw||[]).slice(0,3).map(c=>`<i class="sw" style="background:${c}"></i>`).join('')}${esc(v.label)}</button>`).join('');
  el.querySelectorAll('button').forEach(b=>b.onclick=()=>setVariant(+b.dataset.i)); })();
function setVariant(i){ vi=(i+variants.length)%variants.length; document.querySelectorAll('#vtabs button').forEach((b,k)=>b.classList.toggle('on',k===vi)); if(motionOn)return; ensureArt(); dirty=true; }

/* ---------- reference / compare ---------- */
const refImg=new Image(); let refReady=false; const hasRef=!!(window.__REF&&window.__REF.data);
refImg.onload=()=>{ refReady=true; dirty=true; computeFidelity(); };
if(hasRef)refImg.src=window.__REF.data; else { $('bMode').hidden=true; fidEl.innerHTML='<div class="fh">Fidelity · ref ↔ rebuild</div><div class="fr"><span>Reference held locally · not published</span><span>—</span></div>'; }
let mode=0; const MODES=['Rebuild','Reference','Split']; let splitX=0.5;
function setMode(m){ mode=(m+3)%3; $('bMode').textContent=MODES[mode]; $('bMode').classList.toggle('on',mode!==0); dirty=true; }
$('bMode').onclick=()=>setMode(mode+1);

/* ---------- fidelity ---------- */
function stats(src,sw,sh){ const n=96; const m=document.createElement('canvas'); m.width=n*4; m.height=n*4; const mx=m.getContext('2d'); mx.imageSmoothingEnabled=true; mx.imageSmoothingQuality='high'; mx.drawImage(src,0,0,sw,sh,0,0,n*4,n*4); const c=document.createElement('canvas'); c.width=n; c.height=n; const x=c.getContext('2d',{willReadFrequently:true}); x.imageSmoothingEnabled=true; x.imageSmoothingQuality='high'; x.drawImage(m,0,0,n*4,n*4,0,0,n,n); const d=x.getImageData(0,0,n,n).data;
  const lab=new Float32Array(n*n*3), lum=new Float32Array(n*n); const f=v=>v>0.04045?Math.pow((v+0.055)/1.055,2.4):v/12.92; const g=t=>t>0.008856?Math.cbrt(t):7.787*t+16/116;
  for(let i=0;i<n*n;i++){ const r=f(d[i*4]/255),gg=f(d[i*4+1]/255),b=f(d[i*4+2]/255); const X=(r*0.4124+gg*0.3576+b*0.1805)/0.95047, Y=r*0.2126+gg*0.7152+b*0.0722, Z=(r*0.0193+gg*0.1192+b*0.9505)/1.08883; const fx=g(X),fy=g(Y),fz=g(Z); lab[i*3]=116*fy-16; lab[i*3+1]=500*(fx-fy); lab[i*3+2]=200*(fy-fz); lum[i]=lab[i*3]/100; }
  const hist3=new Float32Array(512), histL=new Float32Array(32);
  for(let i=0;i<n*n;i++){ const L=clamp(lab[i*3]/100,0,0.999), a=clamp((lab[i*3+1]+100)/200,0,0.999), b=clamp((lab[i*3+2]+100)/200,0,0.999); hist3[((L*8)|0)*64+((a*8)|0)*8+((b*8)|0)]+=1; histL[(L*32)|0]+=1; }
  for(let i=0;i<512;i++)hist3[i]/=n*n; for(let i=0;i<32;i++)histL[i]/=n*n;
  let edge=0,grain=0; for(let y=1;y<n-1;y++)for(let x2=1;x2<n-1;x2++){ const k=y*n+x2; edge+=Math.abs(lum[k+1]-lum[k-1])+Math.abs(lum[k+n]-lum[k-n]); grain+=Math.abs(lum[k]*4-lum[k+1]-lum[k-1]-lum[k+n]-lum[k-n]); } edge/=(n-2)*(n-2); grain/=(n-2)*(n-2);
  let sa=0; for(let i=0;i<n*n;i++)sa+=Math.hypot(lab[i*3+1],lab[i*3+2]); sa/=n*n; return {hist3,histL,edge,grain,chroma:sa}; }
let fidelity=null;
function computeFidelity(){ if(!art||!refReady)return; try{ const A=stats(refImg,refImg.naturalWidth,refImg.naturalHeight), B=stats(art,art.width,art.height);
  const inter=(p,q)=>{ let s=0; for(let i=0;i<p.length;i++)s+=Math.min(p[i],q[i]); return s; }; const ratio=(a,b)=>1-Math.abs(a-b)/Math.max(a,b,1e-6);
  const pal=inter(A.hist3,B.hist3), tone=inter(A.histL,B.histL), edge=ratio(A.edge,B.edge), grain=ratio(A.grain,B.grain), chroma=ratio(A.chroma,B.chroma); const sum=pal*0.3+tone*0.25+edge*0.2+grain*0.15+chroma*0.1; fidelity={pal,tone,edge,grain,chroma,sum};
  const pc=v=>String(Math.round(v*100)).padStart(2,'0')+' %'; const vlab=variants.length>1?` · ${variant().label}`:'';
  fidEl.innerHTML=`<div class="fh">Fidelity · ref ↔ rebuild${esc(vlab)}</div><div class="fr"><span>Palette · Lab 8³ ∩</span><span>${pc(pal)}</span></div><div class="fr"><span>Tone · L histogram ∩</span><span>${pc(tone)}</span></div><div class="fr"><span>Edge density</span><span>${pc(edge)}</span></div><div class="fr"><span>Grain · HF energy</span><span>${pc(grain)}</span></div><div class="fr"><span>Chroma · mean</span><span>${pc(chroma)}</span></div><div class="bar"><i style="width:${(sum*100).toFixed(1)}%"></i></div><div class="fr sum"><span>Optical match</span><span>${pc(sum)}</span></div>`; }catch(e){ console.info('fidelity',e); } }

/* ---------- related ---------- */
(function(){ const mine=new Set(me.techniques||[]); const scored=TT.entries.filter(e=>e.id!==S.id).map(e=>{ const shared=(e.techniques||[]).filter(t=>mine.has(t)); const rel=(me.related||[]).includes(e.id); return {e,shared,rel,score:(rel?10:0)+shared.length}; }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).slice(0,4);
  if(!scored.length){ relEl.innerHTML=`<div class="th"><span>Related</span><b>—</b></div>`; return; }
  relEl.innerHTML=`<div class="th"><span>Related</span><b>${scored.length}</b></div>`+scored.map(({e,shared,rel})=>`<a class="r" href="${ROOT}${e.path}index.html"><img src="${ROOT}${e.path}thumb.png" alt=""><span class="name">${esc(e.title)}</span><span class="via ${rel?'':'tech'}">${rel?'related':esc(shared[0])}</span></a>`).join(''); })();

/* ---------- live DOM demo (optional) ---------- */
let liveOn=false;
function placeLive(){ if(!S.live)return; const f=liveEl.querySelector('iframe'); if(!f)return; f.style.left=fig.x+'px'; f.style.top=fig.y+'px'; f.style.width=fig.w+'px'; f.style.height=fig.h+'px'; }
if(S.live){ const f=document.createElement('iframe'); f.setAttribute('title','live demo'); f.srcdoc=typeof S.live==='function'?S.live(variant()):S.live; liveEl.appendChild(f); $('bLive').hidden=false; $('bLive').onclick=()=>setLive(!liveOn); }
function setLive(o){ liveOn=o; liveEl.classList.toggle('on',o); $('bLive').classList.toggle('on',o); if(o&&typeof S.live==='function'){ liveEl.querySelector('iframe').srcdoc=S.live(variant()); } placeLive(); dirty=true; }

/* ---------- motion (optional) ---------- */
let motionOn=false, mArt=null, mCtx=null, mT0=0;
if(S.motion){ $('bMotion').hidden=false; $('bMotion').onclick=()=>setMotion(!motionOn); }
function setMotion(o){ motionOn=o; $('bMotion').classList.toggle('on',o); if(o){ mArt=document.createElement('canvas'); mArt.width=Math.round(fig.w*DPR); mArt.height=Math.round(fig.h*DPR); mCtx=mArt.getContext('2d'); mCtx.setTransform(DPR,0,0,DPR,0,0); mT0=performance.now(); } else { mArt=null; ensureArt(); } dirty=true; }

/* ---------- chrome ---------- */
let phase='pre', pt=0, lastNow=performance.now(); const READ=reduced?0.01:2.6;
const headPos=t=>smooth(0,READ,t);
function drawChrome(){ ctx.strokeStyle=INK50; ctx.lineWidth=0.5; ctx.strokeRect(px(fig.x),px(fig.y),fig.w,fig.h);
  ctx.beginPath(); for(const q of [0.25,0.5,0.75]){ const X=px(fig.x+fig.w*q), Y=px(fig.y+fig.h*q); ctx.moveTo(X,fig.y+0.5); ctx.lineTo(X,fig.y+3.5); ctx.moveTo(X,fig.y+fig.h-0.5); ctx.lineTo(X,fig.y+fig.h-3.5); ctx.moveTo(fig.x+0.5,Y); ctx.lineTo(fig.x+3.5,Y); ctx.moveTo(fig.x+fig.w-0.5,Y); ctx.lineTo(fig.x+fig.w-3.5,Y); } ctx.stroke();
  ctx.strokeStyle=INK; ctx.lineWidth=0.75; const g=2,l=10; const X0=fig.x-g, X1=fig.x+fig.w+g, Y0=fig.y-g, Y1=fig.y+fig.h+g;
  ctx.beginPath(); ctx.moveTo(X0+0.5,Y0-l); ctx.lineTo(X0+0.5,Y0+0.5); ctx.lineTo(X0-l,Y0+0.5); ctx.moveTo(X1-0.5,Y0-l); ctx.lineTo(X1-0.5,Y0+0.5); ctx.lineTo(X1+l,Y0+0.5); ctx.moveTo(X0+0.5,Y1+l); ctx.lineTo(X0+0.5,Y1-0.5); ctx.lineTo(X0-l,Y1-0.5); ctx.moveTo(X1-0.5,Y1+l); ctx.lineTo(X1-0.5,Y1-0.5); ctx.lineTo(X1+l,Y1-0.5); ctx.stroke();
  text(`FIG. ${S.fig||'1'} — ${S.title} · ${S.code}`.toUpperCase(),fig.x+12,fig.y-13,9.5,0.16,INK50);
  let st=''; if(motionOn)st='MOTION'; else if(liveOn)st='LIVE'; else if(phase==='read')st='READING · '+String(Math.round(headPos(pt)*100)).padStart(3,'0')+' %'; else if(phase==='hold')st=mode===1?'REFERENCE':(mode===2?'SPLIT':'HELD'); else st='RENDERING…'; text(st,fig.x+fig.w-12,fig.y-13,9.5,0.16,st==='HELD'||st.startsWith('READING')?INK:ACC,'right');
  const by=fig.y+fig.h+18; ctx.font=FONT(9.5); track(9.5,0.16); const lab='PLATE · ', s2=` ${S.code} CORE `; const w1=ctx.measureText(lab).width, w2=ctx.measureText(s2).width; if(hasLS)ctx.letterSpacing='0px';
  text(lab,fig.x,by,9.5,0.16,GREY); const sx=fig.x+w1+2, sy=by-7.5; const spot=(variant().spot||S.spot||[16,16,20]); ctx.fillStyle=`rgb(${spot.join(',')})`; ctx.fillRect(Math.round(sx),Math.round(sy),7,7); ctx.strokeStyle=INK; ctx.lineWidth=0.5; ctx.strokeRect(Math.round(sx)+0.5,Math.round(sy)+0.5,7,7);
  text(s2,sx+11,by,9.5,0.16,GREY); text(spot.join(' · '),sx+11+w2,by,9.5,0.16,INK);
  if(!mobile()){ const rs=`${P.length} POINTS · U,V NORMALIZED TO FRAME${variants.length>1?' · '+variant().label.toUpperCase():''}`; ctx.font=FONT(9.5); track(9.5,0.16); const rw=ctx.measureText(rs).width, leftEnd=sx+11+w2+ctx.measureText(spot.join(' · ')).width; if(hasLS)ctx.letterSpacing='0px'; const rx=fig.x+fig.w; if(rx-rw>leftEnd+24)text(rs,rx,by,9.5,0.16,GREY,'right'); } }
function drawArt(y1){ const src=motionOn?mArt:art; if(!src)return; ctx.save(); ctx.beginPath(); ctx.rect(fig.x,fig.y,fig.w,Math.max(0,y1-fig.y)); ctx.clip();
  const drawRef=(x0,x1)=>{ if(!refReady)return; ctx.save(); ctx.beginPath(); ctx.rect(x0,fig.y,x1-x0,fig.h); ctx.clip(); ctx.drawImage(refImg,fig.x,fig.y,fig.w,fig.h); ctx.restore(); };
  if(mode===0||motionOn){ ctx.drawImage(src,fig.x,fig.y,fig.w,fig.h); }
  else if(mode===1){ drawRef(fig.x,fig.x+fig.w); if(!refReady)ctx.drawImage(src,fig.x,fig.y,fig.w,fig.h); }
  else { const sx=fig.x+fig.w*splitX; ctx.drawImage(src,fig.x,fig.y,fig.w,fig.h); drawRef(fig.x,sx); ctx.strokeStyle=INK; ctx.lineWidth=0.75; ctx.beginPath(); ctx.moveTo(px(sx),fig.y); ctx.lineTo(px(sx),fig.y+fig.h); ctx.stroke(); ctx.fillStyle=PAPER; ctx.fillRect(sx-38,fig.y+4,32,14); ctx.fillRect(sx+6,fig.y+4,56,14); text('REF',sx-8,fig.y+14,9,0.16,INK,'right'); text('REBUILD',sx+8,fig.y+14,9,0.16,INK,'left'); }
  ctx.restore(); }
function boxEdge(dx,dy,Sz){ const m=Math.max(Math.abs(dx),Math.abs(dy))||1; return Sz/m; }
function drawTrackers(tNow){ const Sz=9; const hov=hover||selected; const dim=!!hov||!!techFocus;
  const isHot=t=>hov?hov===t:(techFocus?t.t===techFocus:false);
  const st=P.map(t=>{ if(t.lock<0)return {a:0}; const e=tNow-t.lock; return {a:1,grow:smooth(0,0.18,e),lead:clamp(e/0.12,0,1),cnt:clamp(e/0.24,0,1)}; });
  ctx.lineWidth=0.4; for(const [ia,ib] of links){ const a=P[ia],b=P[ib],sa=st[ia],sb=st[ib]; if(!sa.a||!sb.a)continue; const al=clamp((tNow-Math.max(a.lock,b.lock))/0.16,0,1); if(al<=0)continue;
    const dx=b.x-a.x,dy=b.y-a.y,m=Math.hypot(dx,dy)||1; const ux=dx/m,uy=dy/m; const ea=boxEdge(ux,uy,Sz),eb=boxEdge(ux,uy,Sz); if(m<ea+eb+4)continue; const hot=isHot(a)||isHot(b);
    ctx.strokeStyle=hot?INK:(dim?INK30:INK50); ctx.lineWidth=hot?0.6:0.4; ctx.beginPath(); ctx.moveTo(a.x+ux*ea,a.y+uy*ea); ctx.lineTo(a.x+ux*(ea+(m-ea-eb)*al),a.y+uy*(ea+(m-ea-eb)*al)); ctx.stroke(); }
  ctx.font=FONT(10.5); if(hasLS)ctx.letterSpacing='0px'; ctx.textAlign='center'; ctx.textBaseline='middle';
  P.forEach((t,i)=>{ const s=st[i]; if(!s.a)return; const hot=isHot(t); const col=hot?(techFocus&&!hov?ACC:INK):(dim?INK30:INK);
    ctx.fillStyle=col; ctx.beginPath(); ctx.arc(t.x,t.y,hot?2.4:1.7,0,6.2832); ctx.fill();
    if(s.grow>0){ const sz=lerp(2,Sz,s.grow); ctx.strokeStyle=col; ctx.lineWidth=hot?1.0:0.7; ctx.strokeRect(px(t.x-sz),px(t.y-sz),Math.round(sz*2),Math.round(sz*2));
      if(hot){ ctx.beginPath(); const X0=px(t.x-sz),Y0=px(t.y-sz),X1=X0+Math.round(sz*2),Y1=Y0+Math.round(sz*2); ctx.moveTo(X0-4,Y0);ctx.lineTo(X0,Y0);ctx.lineTo(X0,Y0-4); ctx.moveTo(X1+4,Y0);ctx.lineTo(X1,Y0);ctx.lineTo(X1,Y0-4); ctx.moveTo(X0-4,Y1);ctx.lineTo(X0,Y1);ctx.lineTo(X0,Y1+4); ctx.moveTo(X1+4,Y1);ctx.lineTo(X1,Y1);ctx.lineTo(X1,Y1+4); ctx.stroke(); } }
    if(s.lead>0&&s.grow>0.99){ const bx=t.x+t.sx*Sz, by=t.y+t.sy*Sz; const k=s.lead; ctx.strokeStyle=col; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(bx,t.sy?by:t.y); ctx.lineTo(lerp(bx,t.ex,k),lerp(t.sy?by:t.y,t.ey,k)); if(k>=1)ctx.lineTo(t.ex+t.sx*6,t.ey); ctx.stroke(); }
    if(s.cnt>0&&s.lead>=1){ ctx.fillStyle=PAPER; ctx.fillRect(Math.round(t.lab.x),Math.round(t.lab.y),t.lab.w,t.lab.h); ctx.fillStyle=col; ctx.font=FONT(10.5); const n=Math.round(lerp(0,t.num,s.cnt)); ctx.fillText(String(n).padStart(2,'0'),t.lab.x+t.lab.w/2,t.lab.y+t.lab.h/2+0.5); } });
  ctx.textAlign='left'; ctx.textBaseline='alphabetic'; }
let pointer=null;
function drawHover(){ if(pointer&&mode!==2){ ctx.strokeStyle=INK30; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(px(pointer.x),fig.y); ctx.lineTo(px(pointer.x),fig.y+fig.h); ctx.moveTo(fig.x,px(pointer.y)); ctx.lineTo(fig.x+fig.w,px(pointer.y)); ctx.stroke(); ctx.fillStyle=PAPER; ctx.fillRect(fig.x+4,fig.y+4,100,14); text(`U ${((pointer.x-fig.x)/fig.w).toFixed(3)}  V ${((pointer.y-fig.y)/fig.h).toFixed(3)}`,fig.x+6,fig.y+14,9,0.12,GREY); }
  const t=hover||selected; if(t){ const l1=`${t.num} · U ${t.u.toFixed(3)} · V ${t.v.toFixed(3)} · ${t.d}`; const l2=t.label; ctx.font=FONT(10); track(10,0.06); const w2=Math.max(ctx.measureText(l2).width,ctx.measureText(l1).width); if(hasLS)ctx.letterSpacing='0px'; const PW=Math.max(168,Math.ceil(w2)+18), PH=32; const Sz=9;
    let X=t.u>0.6?t.x-Sz-12-PW:t.x+Sz+12; let Y=t.y-PH/2; X=clamp(X,fig.x+2,fig.x+fig.w-PW-2); Y=clamp(Y,fig.y+2,fig.y+fig.h-PH-2);
    ctx.fillStyle=PAPER; ctx.fillRect(Math.round(X),Math.round(Y),PW,PH); ctx.strokeStyle=INK; ctx.lineWidth=0.5; ctx.strokeRect(px(X),px(Y),PW,PH); text(l1.toUpperCase(),X+8,Y+13,10,0.06,INK); text(l2,X+8,Y+27,10,0.06,INK); } }

/* ---------- loop ---------- */
function startRead(){ for(const t of P)t.lock=-1; rows.forEach((r,i)=>rowText(r,P[i],null,false)); ctrEl.textContent=`0 / ${P.length}`; phase='read'; pt=0; dirty=true; }
function frame(now){ requestAnimationFrame(frame); const dt=Math.min(0.05,(now-lastNow)/1000); lastNow=now; let work=false;
  if(phase==='pre'){ if(artDone)startRead(); }
  if(phase==='read'){ pt+=dt; work=true; const y=fig.y+fig.h*headPos(pt); let n=0; for(const t of P){ if(t.lock<0&&t.y<=y)t.lock=pt; if(t.lock>=0)n++; } ctrEl.textContent=`${n} / ${P.length}`;
    rows.forEach((r,i)=>{ const t=P[i]; if(t.lock<0)return; const e=clamp((pt-t.lock)/0.24,0,1); rowText(r,t,[t.u*e,t.v*e],e>=1); });
    if(pt>=READ+0.3){ phase='hold'; for(const t of P)if(t.lock<0)t.lock=pt; rows.forEach((r,i)=>rowText(r,P[i],[P[i].u,P[i].v],true)); ctrEl.textContent=`${P.length} / ${P.length}`; dirty=true; } }
  else if(phase==='hold'){ for(const t of P)if(t.lock>=0&&pt-t.lock<0.4)work=true; pt+=dt; }
  if(motionOn&&mArt){ work=true; try{ S.motion(mArt,fig.w,fig.h,DPR,variant(),(now-mT0)/1000,mCtx); }catch(e){ console.error(e); setMotion(false); } }
  if(!work&&!dirty)return; dirty=false;
  ctx.clearRect(0,0,W,H);
  if(liveOn){ drawChrome(); return; }
  if(phase==='read'){ const y=fig.y+fig.h*headPos(pt); drawArt(y); ctx.strokeStyle=ACC; ctx.lineWidth=0.75; ctx.beginPath(); ctx.moveTo(fig.x-14,px(y)); ctx.lineTo(fig.x+fig.w+14,px(y)); ctx.stroke(); }
  else drawArt(fig.y+fig.h);
  drawChrome(); if(!logEl.classList.contains('off'))drawTrackers(pt); drawHover(); }
requestAnimationFrame(frame);

/* ---------- input ---------- */
cv.addEventListener('mousemove',e=>{ const r=cv.getBoundingClientRect(); const x=e.clientX-r.left,y=e.clientY-r.top; pointer=(x>=fig.x&&x<=fig.x+fig.w&&y>=fig.y&&y<=fig.y+fig.h)?{x,y}:null; if(mode===2&&pointer)splitX=clamp((x-fig.x)/fig.w,0,1);
  let h=null; for(const t of P){ if(Math.hypot(t.x-x,t.y-y)<14)h=t; } if(h!==hover)setHover(h); dirty=true; });
cv.addEventListener('mouseleave',()=>{ pointer=null; if(hover)setHover(null); dirty=true; });
cv.addEventListener('click',()=>{ if(hover)select(hover); });
$('bRead').onclick=()=>{ logEl.classList.toggle('off'); $('bRead').classList.toggle('on',!logEl.classList.contains('off')); dirty=true; };
$('bReplay').onclick=()=>startRead();
$('bSpec').onclick=()=>openSpec(!specEl.classList.contains('open')); $('specclose').onclick=()=>openSpec(false);
$('speccopy').onclick=async()=>{ try{ await navigator.clipboard.writeText(specJSON); $('speccopy').textContent='Copied'; setTimeout(()=>$('speccopy').textContent='Copy',1200);}catch(e){} };
addEventListener('keydown',e=>{ if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return; const k=e.key.toLowerCase();
  if(k==='r'&&hasRef)setMode(mode+1); else if(k==='s')openSpec(!specEl.classList.contains('open')); else if(k==='v'&&variants.length>1)setVariant(vi+1); else if(k==='m'&&S.motion)setMotion(!motionOn); else if(k==='l'&&S.live)setLive(!liveOn); else if(e.key===' '){ e.preventDefault(); startRead(); } else if(e.key==='Escape')openSpec(false);
  else if(e.key===','&&sib[idx-1])location.href=ROOT+sib[idx-1].path+'index.html'; else if(e.key==='.'&&sib[idx+1])location.href=ROOT+sib[idx+1].path+'index.html'; else if(e.key==='/')location.href=ROOT+'index.html'; });
let rto=null; addEventListener('resize',()=>{ clearTimeout(rto); rto=setTimeout(()=>{ layout(); dirty=true; },120); });
/* wait for the inlined fonts before the first render (art modules draw type) */
let started=false; const go=()=>{ if(started)return; started=true; layout(); dirty=true; };
if(document.fonts){ Promise.all(['700 20px Archivo','400 12px Inter','400 12px "JetBrains Mono"'].map(f=>document.fonts.load(f).catch(()=>{}))).then(go); setTimeout(go,2500); } else go();
window.__study={S,fig:()=>fig,art:()=>art,fidelity:()=>fidelity,setMode,setVariant,setMotion,variants};
})();
