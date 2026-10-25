/* T-04 · Effect set · sheet runtime v2 · ø co. Techniques & Templates
   Generic: reads FXSET (set.js) and builds the rack, one technique block per effect, and the usage gallery.
   State: one params object per effect (S[id]) + one sheet light (LIGHT). Dials write it; everything reads it.
   Coupling: an effect that prints on a stock (effect.stockOf(o)) re-renders when that stock's params change.
   Rendering: a small worker pool (worker.js) renders off the main thread — latest job per canvas wins, drafts at ½ res
   while dragging, full device px on release, offscreen canvases are marked dirty and paint when they scroll in.
   Falls back to the main thread when workers are unavailable (file://). */
(function(){
'use strict';
const FX=window.FX, SET=window.FXSET, $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const h=(tag,attrs,...kids)=>{ const n=document.createElement(tag); for(const k in attrs||{}){ const v=attrs[k]; if(k==='class')n.className=v; else if(k==='html')n.innerHTML=v; else if(k.startsWith('on'))n.addEventListener(k.slice(2),v); else if(v!=null&&v!==false)n.setAttribute(k,v===true?'':v); } for(const c of kids.flat()) if(c!=null) n.append(c.nodeType?c:document.createTextNode(c)); return n; };
const clone=o=>JSON.parse(JSON.stringify(o)), esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=(v,p)=>{ if(typeof v!=='number') return String(v); const st=p&&p.step||.01; const d=st>=1?0:st>=.1?1:st>=.01?2:3; return v.toFixed(d); };
const TABS=[['density','Density'],['dropoff','Dropoff'],['stock','Stock'],['relief','Relief'],['color','Color'],['mixing','Mixing'],['mask','Edge']];
const EFX=Object.fromEntries(SET.effects.map(e=>[e.id,e]));
const DEF={}; SET.effects.forEach(e=>{ DEF[e.id]={}; e.params.forEach(p=>DEF[e.id][p.key]=clone(p.value)); });
const DEF_LIGHT={az:225,el:34};
const KEY='tt-t04:'+SET.code+':'+SET.set+':v2';
let S=clone(DEF), LIGHT=clone(DEF_LIGHT);
try{ const j=JSON.parse(localStorage.getItem(KEY)||'null'); if(j){ for(const id in DEF) S[id]=Object.assign({},DEF[id],(j.S||{})[id]||{}); if(j.light) LIGHT=Object.assign({},DEF_LIGHT,j.light); } }catch(e){}
const UI={view:'image',loupe:false,follow:true,dragging:false};
const COARSE=matchMedia('(pointer:coarse)').matches;
const save=(()=>{ let t; return ()=>{ clearTimeout(t); t=setTimeout(()=>{ try{ localStorage.setItem(KEY,JSON.stringify({S,light:LIGHT})); }catch(e){} },300); }; })();
const status=(t)=>{ const n=$('#fs-status'); if(n) n.textContent=t; };

/* ══════════ render pool ══════════ */
const N_WORKERS=Math.max(1,Math.min(3,(navigator.hardwareConcurrency||4)-1));
const pool=[]; let useWorkers=location.protocol!=='file:';
if(useWorkers){ try{ for(let i=0;i<N_WORKERS;i++){ const w=new Worker('worker.js'+(document.currentScript&&document.currentScript.src.includes('?')?'?'+document.currentScript.src.split('?')[1]:'')); w.busy=null; w.onmessage=ev=>done(w,ev.data); w.onerror=()=>{ useWorkers=false; }; pool.push(w); } }catch(e){ useWorkers=false; } }
const targets=new Map();   // key → {canvas, build(scale)→job, onStats, visible, dirty, lastPainted}
const pending=new Map();   // key → job (latest wins)
let tokenN=0;
const latest=new Map();    // key → newest token issued
function request(key,draft){ const T=targets.get(key); if(!T) return; if(!T.visible&&!draft){ T.dirty=true; return; } T.dirty=false;
  const job=T.build(draft?.5:1); job.key=key; job.token=++tokenN; job.prio=(draft?0:1)+(T.prio||0); latest.set(key,job.token); pending.set(key,job); T.frame&&T.frame.classList.add('busy'); pump(); }
function pump(){ if(!pending.size){ if(!pool.some(w=>w.busy)) status('idle'); return; } status(UI.dragging?'draft':'rendering');
  if(useWorkers&&pool.length){ for(const w of pool){ if(w.busy) continue; const job=next(); if(!job) break; w.busy=job.key; const tr=Object.values(job.clips||{}).map(c=>c.buffer); w.postMessage(job,tr); } }
  else if(!pump.t){ pump.t=setTimeout(()=>{ pump.t=0; const job=next(); if(job){ try{ const r=mainRender(job); done(null,{key:job.key,token:job.token,W:job.W,H:job.H,rgba:r.rgba,stats:r.stats}); }catch(err){ console.error(err); } } },0); } }
function next(){ let best=null; for(const j of pending.values()){ if(pool.some(w=>w.busy===j.key)) continue; if(!best||j.prio<best.prio) best=j; } if(best) pending.delete(best.key); return best; }
let mainR=null; function mainRender(job){ if(!mainR){ mainR=makeMainRenderer(); } return mainR(job); }
function makeMainRenderer(){ const enc=FX.enc; return (j)=>{ FX.LIGHT=j.light; const t0=performance.now(); let R;
  if(j.kind==='fx'){ R=EFX[j.id].run(j.S[j.id],j.W,j.H,j.dpr,{S:j.S}); } else { const u=SET.usages.find(u=>u.id===j.id); const SS={}; for(const id in j.S) SS[id]=Object.assign({},j.S[id],(u.overrides||{})[id]||{}); R=u.run(id=>SS[id],j.W,j.H,j.dpr,{S:SS,clips:j.clips||{}}); }
  const W=j.W,H=j.H,out=new Uint8ClampedArray(W*H*4);
  if(j.view==='image'){ const l=R.lin; for(let i=0,a=0,k=0;i<W*H;i++,a+=4,k+=3){ out[a]=enc(l[k]); out[a+1]=enc(l[k+1]); out[a+2]=enc(l[k+2]); out[a+3]=255; } }
  else { const f=j.view==='ink'?R.ink:j.view==='stock'?R.stock:R.mask, inv=j.view!=='stock'; for(let i=0,a=0;i<W*H;i++,a+=4){ let v=f?Math.min(1,f[i]):.5; const g=Math.round(255*(inv?1-v:v)); out[a]=out[a+1]=out[a+2]=g; out[a+3]=255; } }
  return {rgba:out,stats:{ms:performance.now()-t0,marks:R.marks,unit:R.markUnit||'',W,H}}; }; }
function done(w,d){ if(w) w.busy=null; const T=targets.get(d.key);
  if(d.error){ console.error(d.error); if(w&&/importScripts|NetworkError|SecurityError/.test(d.error)){ useWorkers=false; } }
  else if(T&&d.token>=(T.lastPainted||0)){ T.lastPainted=d.token; const c=T.canvas; if(c.width!==d.W||c.height!==d.H){ c.width=d.W; c.height=d.H; } c.getContext('2d').putImageData(new ImageData(d.rgba,d.W,d.H),0,0); T.onStats&&T.onStats(d.stats,d.token===latest.get(d.key)&&!UI.dragging); }
  if(T&&T.frame&&!pending.has(d.key)&&!pool.some(x=>x.busy===d.key)) T.frame.classList.remove('busy');
  pump(); }
const dims=(canvas,scale)=>{ const r=canvas.getBoundingClientRect(), dpr=Math.min(2,devicePixelRatio||1)*scale; return {W:Math.max(2,Math.round(r.width*dpr)),H:Math.max(2,Math.round(r.height*dpr)),dpr}; };
const fxJob=(id,canvas,view)=>scale=>{ const {W,H,dpr}=dims(canvas,scale); return {kind:'fx',id,W,H,dpr,S,light:LIGHT,view:view()}; };
const uJob=(u,canvas)=>scale=>{ const {W,H,dpr}=dims(canvas,scale); const clips={}; for(const k in (u.clips||{})){ const c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d'); g.setTransform(dpr,0,0,dpr,0,0); g.fillStyle='#fff'; u.clips[k](g,W/dpr,H/dpr); const d=g.getImageData(0,0,W,H).data, f=new Float32Array(W*H); for(let i=0,j=3;i<f.length;i++,j+=4) f[i]=d[j]/255; clips[k]=f; }
  const SS={}; for(const id in S) SS[id]=UI.follow?S[id]:DEF[id]; return {kind:'u',id:u.id,W,H,dpr,S:SS,light:LIGHT,view:'image',clips}; };

/* coupling: which keys must redraw when effect `id` changes */
const dependents=id=>{ const keys=new Set(['p:'+id,'r:'+id]); SET.effects.forEach(e=>{ if(e.stockOf&&e.stockOf(S[e.id])===id){ keys.add('p:'+e.id); keys.add('r:'+e.id); } });
  SET.usages.forEach(u=>{ if(u.uses.includes(id)||u.uses.some(x=>EFX[x].stockOf&&EFX[x].stockOf(Object.assign({},S[x],(u.overrides||{})[x]||{}))===id)) keys.add('u:'+u.id); }); return [...keys]; };
const refresh=(keys,draft)=>keys.forEach(k=>request(k,draft&&(targets.get(k)||{}).visible));
const allKeys=()=>[...targets.keys()];

/* ══════════ dials ══════════ */
const curveSVG=(e)=>{ const N=48; let d=''; for(let i=0;i<=N;i++){ const t=i/N, y=FX.ease(e,t); d+=(i?'L':'M')+(2+t*92).toFixed(1)+' '+(46-y*42).toFixed(1); } return `<svg viewBox="0 0 96 48" class="fs-curve" aria-hidden="true"><path d="M2 46H94M2 4V46" class="ax"/><path d="M2 46L94 4" class="dg"/><path d="${d}" class="cv"/></svg>`; };
const trackBG=(o,p)=>{ const L=o[p.ink+'L'], C=o[p.ink+'C'], hh=o[p.ink+'h'], k=p.key.slice(-1); const stops=[]; for(let i=0;i<=12;i++){ const t=i/12; const v=k==='L'?[t,C,hh]:k==='C'?[L,t*.37,hh]:[L,C,t*360]; stops.push(FX.ink(...v).hex); } return `linear-gradient(90deg,${stops.join(',')})`; };
const okWhen=(o,p)=>!p.when||Object.entries(p.when).every(([k,vs])=>vs.includes(o[k]));
const isDef=(id,k)=>JSON.stringify(S[id][k])===JSON.stringify(DEF[id][k]);
function buildDials(e,host,onInput,onChange){ host.innerHTML=''; const o=()=>S[e.id];
  const groups={}; e.params.forEach(p=>{ const g=p.group==='seed'?'mask':p.group; (groups[g]=groups[g]||[]).push(p); });
  const tabs=TABS.filter(([g])=>groups[g]); const strip=h('div',{class:'fs-tabs',role:'tablist','aria-label':e.name+' dial groups'}); const panes=h('div',{class:'fs-panes'});
  let cur=tabs[0][0]; const show=g=>{ cur=g; $$('button',strip).forEach(b=>b.setAttribute('aria-selected',String(b.dataset.g===g))); $$('.fs-pane',panes).forEach(p=>p.hidden=p.dataset.g!==g); if(g==='mixing') mixStrip(); };
  tabs.forEach(([g,label])=>{ strip.append(h('button',{type:'button',role:'tab','data-g':g,onclick:()=>show(g)},label,h('i',{class:'mod'}))); });
  host.append(strip,panes);
  tabs.forEach(([g])=>{ const pane=h('div',{class:'fs-pane',role:'tabpanel','data-g':g}); let lastInk=null;
    groups[g].forEach(p=>{
      if(p.ink&&p.ink!==lastInk){ lastInk=p.ink; pane.append(h('div',{class:'fs-ink','data-ink':p.ink},h('b'),h('span',{class:'nm'},p.label.split(' · ')[0]),h('code'),h('em'))); }
      const row=h('div',{class:'fs-row t-'+p.type,'data-k':p.key,title:p.note||''});
      const lab=h('label',{title:(p.note||'')+' · double-click to reset'},p.ink?p.label.split(' · ')[1]:p.label); lab.addEventListener('dblclick',()=>{ o()[p.key]=clone(DEF[e.id][p.key]); sync(); onChange(p); });
      row.append(lab);
      if(p.type==='range'){ const tr=h('div',{class:'fs-track'}); const span=p.max-p.min;
        (p.limits||[]).forEach(([a,b,why])=>tr.append(h('span',{class:'lim',style:`left:${(a-p.min)/span*100}%;width:${(b-a)/span*100}%`,title:why})));
        tr.append(h('span',{class:'def',style:`left:${(DEF[e.id][p.key]-p.min)/span*100}%`,title:'default '+fmt(DEF[e.id][p.key],p)}));
        const inp=h('input',{type:'range',min:p.min,max:p.max,step:p.step,value:o()[p.key],'aria-label':p.label});
        const out=h('button',{type:'button',class:'val',title:'type a value'}); const setOut=()=>{ out.textContent=fmt(o()[p.key],p)+(p.unit?' '+p.unit:''); };
        inp.addEventListener('input',()=>{ o()[p.key]=+inp.value; setOut(); syncInk(); onInput(p); });
        inp.addEventListener('change',()=>onChange(p));
        out.addEventListener('click',()=>{ const n=h('input',{type:'number',class:'num',min:p.min,max:p.max,step:p.step,value:o()[p.key],'aria-label':p.label+' value'}); out.replaceWith(n); n.focus(); n.select();
          let fd=false; const fin=(ok)=>{ if(fd) return; fd=true; if(ok){ const v=FX.clamp(+n.value,p.min,p.max); if(!isNaN(v)){ o()[p.key]=v; } } n.replaceWith(out); sync(); if(ok) onChange(p); };
          n.addEventListener('keydown',ev=>{ if(ev.key==='Enter') fin(true); if(ev.key==='Escape') fin(false); }); n.addEventListener('blur',()=>fin(true),{once:true}); });
        tr.append(inp); row.append(tr,out);
        row._sync=()=>{ inp.value=o()[p.key]; setOut(); if(p.ink){ tr.style.setProperty('--tbg',trackBG(o(),p)); tr.classList.add('grad'); } }; }
      else if(p.type==='select'){ const seg=h('div',{class:'fs-seg',role:'group','aria-label':p.label});
        p.options.forEach(v=>seg.append(h('button',{type:'button','data-v':v,onclick:()=>{ o()[p.key]=v; sync(); onInput(p); onChange(p); }},v))); row.append(seg);
        row._sync=()=>$$('button',seg).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===o()[p.key]))); }
      else if(p.type==='ease'){ const sel=h('select',{'aria-label':p.label}); Object.entries(FX.EASES).forEach(([k,c])=>sel.append(h('option',{value:k},c.label)));
        const kin=h('input',{type:'range',min:.3,max:8,step:.05,'aria-label':p.label+' k'}); const graph=h('span',{class:'fs-gw'}); const out=h('output');
        sel.addEventListener('change',()=>{ o()[p.key]=[sel.value,o()[p.key][1]]; row._sync(); onInput(p); onChange(p); });
        kin.addEventListener('input',()=>{ o()[p.key]=[o()[p.key][0],+kin.value]; row._sync(); onInput(p); }); kin.addEventListener('change',()=>onChange(p));
        row.append(h('div',{class:'fs-ease'},sel,kin),out,graph);
        row._sync=()=>{ const v=o()[p.key]; sel.value=v[0]; kin.value=v[1]; const hasK=FX.EASES[v[0]]&&FX.EASES[v[0]].k; kin.disabled=!hasK; out.textContent=hasK?'k '+(+v[1]).toFixed(2):'—'; graph.innerHTML=curveSVG(v); }; }
      pane.append(row); });
    if(g==='mixing') pane.append(h('div',{class:'fs-mixstrip'},h('canvas',{width:10,height:10,'aria-label':'white to ink in each color rule'}),h('div',{class:'lbl'},['film','oklab','oklch','linear','srgb'].map(s=>h('span',{'data-s':s},s)))));
    panes.append(pane); });
  function syncInk(){ $$('.fs-ink',host).forEach(n=>{ const p=n.dataset.ink, ink=FX.ink(o()[p+'L'],o()[p+'C'],o()[p+'h']); $('b',n).style.background=ink.hex; $('code',n).textContent=ink.css+' · '+ink.hex; $('em',n).textContent=ink.mapped?'chroma reduced to fit sRGB (asked '+ink.Creq.toFixed(3)+')':''; });
    $$('.fs-row',host).forEach(r=>{ const p=e.params.find(q=>q.key===r.dataset.k); if(p&&p.ink) $('.fs-track',r).style.setProperty('--tbg',trackBG(o(),p)); });
    if(cur==='mixing') mixStrip(); }
  function mixStrip(){ const c=$('.fs-mixstrip canvas',host); if(!c||!c.offsetParent) return; const r=c.getBoundingClientRect(), dpr=Math.min(2,devicePixelRatio||1), W=Math.max(40,Math.round(r.width*dpr)), RH=9, G=2, Hh=Math.round(5*(RH+G)*dpr); c.width=W; c.height=Hh;
    const pre=(e.params.find(p=>p.ink)||{}).ink; if(!pre) return; const ink=FX.ink(o()[pre+'L'],o()[pre+'C'],o()[pre+'h']), sp=['film','oklab','oklch','linear','srgb'], cur_=o().mix;
    const g=c.getContext('2d'), img=g.createImageData(W,Hh), d=img.data, px=[0,0,0]; for(let r2=0;r2<5;r2++) for(let x=0;x<W;x++){ px[0]=px[1]=px[2]=1; FX.mixInto(px,ink,x/(W-1)*(sp[r2]==='film'?(o().density||1):1),sp[r2]); for(let y=Math.round(r2*(RH+G)*dpr);y<Math.round((r2*(RH+G)+RH)*dpr);y++){ const j=(y*W+x)*4; d[j]=FX.enc(px[0]);d[j+1]=FX.enc(px[1]);d[j+2]=FX.enc(px[2]);d[j+3]=255; } } g.putImageData(img,0,0);
    $$('.fs-mixstrip .lbl span',host).forEach(s=>s.classList.toggle('on',s.dataset.s===cur_)); }
  function sync(){ $$('.fs-row',host).forEach(r=>{ r._sync&&r._sync(); const p=e.params.find(q=>q.key===r.dataset.k); r.classList.toggle('off',!okWhen(o(),p)); r.classList.toggle('mod',!isDef(e.id,p.key)); });
    tabs.forEach(([g])=>{ const b=$(`button[data-g="${g}"]`,strip); b.classList.toggle('has-mod',groups[g].some(p=>!isDef(e.id,p.key))); }); syncInk(); }
  host._sync=sync; host._show=show; show(cur); sync(); return sync; }

/* ══════════ page ══════════ */
const nav=$('#nav'); if(nav&&window.TT) nav.innerHTML=`<a class="brand" href="../../index.html">${TT.mark}<span class="wm">IMP<i>Ø</i>SSIBLE</span></a><span class="crumb"><a href="../../index.html#templates">Techniques &amp; Templates</a><span class="sep">/</span><b>${esc(SET.title)}</b><span class="code">${esc(SET.code)}</span></span><span class="pager"><span>${esc(SET.code)} · template</span><a href="../../index.html#templates">index</a></span>`;
document.documentElement.classList.add('js'); if(COARSE) document.documentElement.classList.add('coarse');
const live=$('#fs-live'); live.innerHTML='';
const fmtN=n=>n>=1e4?(n/1e3).toFixed(1)+'k':String(n);
const blocks={};
const copy=(txt,btn)=>{ const t=btn.textContent; (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>{ btn.textContent='copied'; setTimeout(()=>btn.textContent=t,900); }).catch(()=>{ prompt('Copy',txt); }); };
let READY=false; const obs=new IntersectionObserver(es=>es.forEach(en=>{ const T=targets.get(en.target.dataset.key); if(!T) return; T.visible=en.isIntersecting; if(READY&&T.visible&&(T.dirty||!T.lastPainted)) request(en.target.dataset.key,false); }),{rootMargin:'300px 0px'});
const register=(key,canvas,frame,build,onStats,prio)=>{ targets.set(key,{canvas,frame,build,onStats,prio,visible:false,dirty:true,lastPainted:0}); canvas.dataset.key=key; obs.observe(canvas); };

// system strip: the read, shared causes, pass order
if(SET.system){ const barEl=$('#fs-bar'); const sysD=h('details',{class:'fs-sysd'},h('summary',null,h('span',{class:'code'},'Material system'),h('span',{class:'sum'},SET.system.read)),h('section',{class:'fs-sys','aria-label':'Material system'},
  h('div',{class:'c'},h('span',{class:'code'},'Read'),h('p',{class:'read'},SET.system.read)),
  h('div',{class:'c'},h('span',{class:'code'},'Shared causes'),h('ul',null,SET.system.sharedCause.map(t=>h('li',null,t)))),
  h('div',{class:'c'},h('span',{class:'code'},'Pass order'),h('ol',null,SET.system.passOrder.map(t=>h('li',null,t)))))); if(innerWidth>760) sysD.open=true; barEl.parentNode.insertBefore(sysD,barEl); }

// rack
const rack=h('section',{class:'fs-rack','aria-label':'The set'});
SET.effects.forEach(e=>{ const c=h('canvas',{class:'fs-cv','aria-label':e.name}); const st=h('span',{class:'st'},'—'); const fr=h('div',{class:'fs-frame'},c);
  rack.append(h('a',{class:'fs-cell',href:'#'+e.id},fr,h('div',{class:'cap'},h('span',{class:'code'},e.code),h('b',null,e.name),h('span',{class:'role'},e.role||''),st)));
  register('r:'+e.id,c,fr,fxJob(e.id,c,()=>'image'),(s)=>{ st.textContent=fmtN(s.marks)+' '+s.unit; },3); });
live.append(rack);

// technique blocks
SET.effects.forEach(e=>{ const cv=h('canvas',{class:'fs-cv','aria-label':e.name+' plate'}); const stat=h('div',{class:'fs-stat'}); const dials=h('div',{class:'fs-dials'});
  const fr=h('div',{class:'fs-frame big'},cv,h('span',{class:'fs-bar-busy','aria-hidden':'true'}));
  const sec=h('section',{class:'fs-fx',id:e.id,'data-fx':e.id});
  const specObj=()=>({effect:e.id,code:e.code,name:e.name,set:SET.set,units:'CSS px; rendered at device px (dpr ≤ 2)',light:LIGHT,params:S[e.id],stock:e.stockOf?e.stockOf(S[e.id]):null});
  const call=()=>`// ${e.code} ${e.name} — load fx.js + set.js (or run worker.js)\nFX.LIGHT = ${JSON.stringify(LIGHT)};\nconst fx = FXSET.effects.find(e => e.id === '${e.id}');\nconst dpr = Math.min(2, devicePixelRatio), W = Math.round(cssW * dpr), H = Math.round(cssH * dpr);\nconst R = fx.run(${JSON.stringify(S[e.id])}, W, H, dpr, { S: allParams /* the stock's params live here */ });\nFX.toImage(canvas.getContext('2d'), R.lin, W, H);   // R.ink · R.stock · R.mask · R.marks also returned`;
  const onsite=h('a',{class:'fs-on',href:'#'},''); const updOn=()=>{ const sid=e.stockOf&&e.stockOf(S[e.id]); onsite.hidden=!sid; if(sid){ onsite.href='#'+sid; onsite.innerHTML=`prints on <b>${esc(EFX[sid].code)} ${esc(EFX[sid].name)}</b>`; } };
  const feed=h('span',{class:'fs-on feed'}); const updFeed=()=>{ const f=SET.effects.filter(x=>x.stockOf&&x.stockOf(S[x.id])===e.id); feed.hidden=!f.length; feed.innerHTML=f.length?'stock for '+f.map(x=>`<a href="#${x.id}"><b>${esc(x.code)}</b></a>`).join(' · '):''; };
  const bReset=h('button',{type:'button',onclick:()=>{ S[e.id]=clone(DEF[e.id]); dials._sync(); changed(); }},'reset');
  const bSeed=h('button',{type:'button',onclick:()=>{ S[e.id].seed=1+Math.floor(Math.random()*999); dials._sync(); changed(); }},'new seed');
  sec.append(h('header',{class:'fs-fxh'},h('div',{class:'id'},h('span',{class:'code'},e.code+' · '+(e.role||'')),h('h2',null,e.name),h('div',{class:'links'},onsite,feed)),h('p',{class:'sub'},e.sub),h('div',{class:'act'},bReset,bSeed)));
  const panelFoot=h('div',{class:'fs-pfoot'});
  const bP=h('button',{type:'button'},'copy params'); bP.onclick=()=>copy(JSON.stringify(specObj(),null,2),bP);
  const bC=h('button',{type:'button'},'copy call'); bC.onclick=()=>copy(call(),bC); panelFoot.append(bP,bC);
  const side=h('div',{class:'fs-side'},h('div',{class:'fs-panel'},dials,panelFoot)); sec.append(h('div',{class:'fs-fxb'},h('div',{class:'fs-stage'},fr,stat),side));
  // foot tabs: recipe · limits · params
  const spec=h('pre',{class:'fs-spec'});
  const lim=h('table',{class:'fs-lim'},h('thead',null,h('tr',null,h('th',null,'Param'),h('th',null,'Range'),h('th',null,'What happens'))),h('tbody',null,e.limits.map(l=>h('tr',null,h('td',null,l[0]),h('td',{class:'m'},l[1]),h('td',null,l[2])))));
  const ft=[['recipe','Recipe',h('ol',{class:'fs-rec'},e.recipe.map(r=>h('li',null,r)))],['limits','Limits',lim],['params','Params · live',spec]];
  const fstrip=h('div',{class:'fs-tabs small',role:'tablist'}), fpanes=h('div',{class:'fs-fpanes'});
  ft.forEach(([k,l,node],i)=>{ fstrip.append(h('button',{type:'button',role:'tab','data-k':k,'aria-selected':String(i===0),onclick:()=>{ $$('button',fstrip).forEach(b=>b.setAttribute('aria-selected',String(b.dataset.k===k))); $$('.fs-fpane',fpanes).forEach(p=>p.hidden=p.dataset.k!==k); }},l)); fpanes.append(h('div',{class:'fs-fpane','data-k':k,hidden:i!==0},node)); });
  side.append(h('div',{class:'fs-fxf'},fstrip,fpanes));
  live.append(sec);
  const updSpec=()=>{ spec.textContent=JSON.stringify(specObj(),null,2); };
  register('p:'+e.id,cv,fr,fxJob(e.id,cv,()=>UI.view),(s,final)=>{ stat.innerHTML=`<span>${s.W} × ${s.H} px</span><span><b>${fmtN(s.marks)}</b> ${s.unit}</span><span>${s.ms.toFixed(0)} ms</span><span class="${final?'':'dr'}">${final?'device px · '+UI.view:'draft · ½ res'}</span>`; },1);
  const changed=()=>{ updSpec(); updOn(); SET.effects.forEach(x=>blocks[x.id]&&blocks[x.id].updFeed()); save(); UI.dragging=false; refresh(dependents(e.id),false); };
  buildDials(e,dials,()=>{ dials._sync(); updSpec(); UI.dragging=true; refresh(dependents(e.id).filter(k=>k.startsWith('p:')),true); },()=>{ dials._sync(); changed(); });
  blocks[e.id]={dials,updSpec,updOn,updFeed,specObj}; updSpec(); updOn(); updFeed(); });

// usage gallery
const UG=h('section',{class:'fs-usages',id:'usages'});
const fol=h('button',{type:'button','aria-pressed':'true',onclick:()=>{ UI.follow=!UI.follow; fol.setAttribute('aria-pressed',String(UI.follow)); fol.textContent=UI.follow?'following the dials':'defaults only'; refresh(allKeys().filter(k=>k.startsWith('u:')),false); }},'following the dials');
UG.append(h('header',{class:'fs-uh'},h('div',null,h('span',{class:'code'},'Usages'),h('h2',null,'Where the set goes')),h('p',{class:'sub'},'Each card is a composition that runs the same effect functions with the live dials and the sheet light, merged with the card\'s own overrides. Tune a plate — or the stock it prints on — and the cards that use it redraw.'),h('div',{class:'act'},fol)));
const ugrid=h('div',{class:'fs-ugrid'}); UG.append(ugrid);
SET.usages.forEach((u,i)=>{ const c=h('canvas',{class:'fs-cv','aria-label':u.title}); const lbl=h('div',{class:'fs-ulbl'+(u.rows?' rows':'')},(u.labels||[]).map(l=>h('span',null,h('b',null,l[0]),h('i',null,l[1]))));
  const fr=h('div',{class:'fs-frame',style:`aspect-ratio:${u.aspect}`},c,lbl,h('span',{class:'fs-bar-busy','aria-hidden':'true'}));
  const ov=h('pre',{class:'fs-ov'},JSON.stringify(u.overrides,null,1).replace(/\n\s*/g,' '));
  ugrid.append(h('article',{class:'fs-ucard'},fr,h('div',{class:'cap'},h('span',{class:'code'},'U-0'+(i+1)),h('b',null,u.title),h('p',null,u.sub),h('div',{class:'chips'},u.uses.map(id=>h('a',{href:'#'+id},EFX[id].code+' '+EFX[id].name))),h('details',null,h('summary',null,'overrides'),ov))));
  register('u:'+u.id,c,fr,uJob(u,c),null,2); });
live.append(UG);

/* ══════════ bar: view · light · loupe · copy · reset ══════════ */
const bar=$('#fs-bar');
$$('[data-view]',bar).forEach(b=>b.addEventListener('click',()=>{ UI.view=b.dataset.view; $$('[data-view]',bar).forEach(x=>x.setAttribute('aria-pressed',String(x===b))); refresh(SET.effects.map(e=>'p:'+e.id),false); }));
$('#fs-loupe').addEventListener('click',e=>{ UI.loupe=!UI.loupe; e.currentTarget.setAttribute('aria-pressed',String(UI.loupe)); if(!UI.loupe) loupe.style.display='none'; });
$('#fs-copyset').addEventListener('click',e=>copy(JSON.stringify({set:SET.set,title:SET.title,light:LIGHT,effects:S},null,2),e.currentTarget));
$('#fs-resetall').addEventListener('click',()=>{ S=clone(DEF); LIGHT=clone(DEF_LIGHT); save(); puck.sync(); $$('.fs-dials').forEach(d=>d._sync&&d._sync()); SET.effects.forEach(e=>{ blocks[e.id].updSpec(); blocks[e.id].updOn(); blocks[e.id].updFeed(); }); refresh(allKeys(),false); });
// light puck: drag inside the disc — angle = where the light comes from, distance from center = how low it sits
const puck=(()=>{ const host=$('#fs-light'); if(!host) return {sync(){}}; const disc=h('div',{class:'disc',role:'slider',tabindex:'0','aria-label':'Sheet light: azimuth and elevation','aria-valuetext':''},h('i',{class:'sun'})), out=h('span',{class:'v'}); host.append(h('span',null,'Light'),disc,out);
  const sync=()=>{ const r=(90-LIGHT.el)/80, a=LIGHT.az*Math.PI/180; const sun=$('.sun',disc); sun.style.left=(50+Math.cos(a)*r*42).toFixed(2)+'%'; sun.style.top=(50+Math.sin(a)*r*42).toFixed(2)+'%'; out.textContent=`${Math.round(LIGHT.az)}° · ${Math.round(LIGHT.el)}°`; disc.setAttribute('aria-valuetext',`from ${Math.round(LIGHT.az)} degrees, ${Math.round(LIGHT.el)} degrees up`); SET.effects.forEach(e=>blocks[e.id]&&blocks[e.id].updSpec()); };
  const at=(ev)=>{ const r=disc.getBoundingClientRect(), x=(ev.clientX-r.left)/r.width*2-1, y=(ev.clientY-r.top)/r.height*2-1, d=Math.min(1,Math.hypot(x,y)); LIGHT.az=((Math.atan2(y,x)*180/Math.PI)+360)%360; LIGHT.el=FX.clamp(90-d*80,10,88); sync(); };
  let raf=0; const kick=(draft)=>{ cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{ UI.dragging=draft; refresh(draft?allKeys().filter(k=>k.startsWith('p:')&&targets.get(k).visible):allKeys(),draft); }); };
  disc.addEventListener('pointerdown',ev=>{ disc.setPointerCapture(ev.pointerId); at(ev); kick(true); });
  disc.addEventListener('pointermove',ev=>{ if(!disc.hasPointerCapture(ev.pointerId)) return; at(ev); kick(true); });
  disc.addEventListener('pointerup',ev=>{ disc.releasePointerCapture(ev.pointerId); save(); kick(false); });
  disc.addEventListener('keydown',ev=>{ const st=ev.shiftKey?10:2; if(ev.key==='ArrowLeft') LIGHT.az=(LIGHT.az-st+360)%360; else if(ev.key==='ArrowRight') LIGHT.az=(LIGHT.az+st)%360; else if(ev.key==='ArrowUp') LIGHT.el=Math.min(88,LIGHT.el+st); else if(ev.key==='ArrowDown') LIGHT.el=Math.max(10,LIGHT.el-st); else return; ev.preventDefault(); sync(); save(); kick(false); });
  disc.addEventListener('dblclick',()=>{ LIGHT=clone(DEF_LIGHT); sync(); save(); kick(false); });
  sync(); return {sync}; })();

/* ══════════ loupe: 4× device pixels, nearest-neighbor, on any plate (fine pointers) ══════════ */
const loupe=h('canvas',{class:'fs-loupe',width:10,height:10}); document.body.append(loupe);
if(COARSE){ const b=$('#fs-loupe'); if(b) b.hidden=true; }
document.addEventListener('pointermove',ev=>{ if(!UI.loupe||ev.pointerType==='touch') return; const t=ev.target; if(!(t instanceof HTMLCanvasElement)||!t.classList.contains('fs-cv')){ loupe.style.display='none'; return; }
  const r=t.getBoundingClientRect(), dpr=Math.min(2,devicePixelRatio||1), S_=176, Z=4; loupe.width=loupe.height=Math.round(S_*dpr); const g=loupe.getContext('2d'); g.imageSmoothingEnabled=false;
  const sx=(ev.clientX-r.left)/r.width*t.width, sy=(ev.clientY-r.top)/r.height*t.height, sw=loupe.width/Z; g.fillStyle='#fff'; g.fillRect(0,0,loupe.width,loupe.height); g.drawImage(t,sx-sw/2,sy-sw/2,sw,sw,0,0,loupe.width,loupe.height);
  const lx=Math.min(innerWidth-S_-8,ev.clientX+18), ly=Math.min(innerHeight-S_-8,ev.clientY+18); loupe.style.display='block'; loupe.style.left=lx+'px'; loupe.style.top=ly+'px'; },{passive:true});

/* ══════════ start ══════════ */
let lastW=innerWidth; addEventListener('resize',()=>{ clearTimeout(window.__rt); window.__rt=setTimeout(()=>{ if(Math.abs(innerWidth-lastW)<40) return; lastW=innerWidth; targets.forEach(T=>{ T.dirty=true; }); targets.forEach((T,k)=>{ if(T.visible) request(k,false); }); },220); });
(document.fonts&&document.fonts.load?Promise.all([document.fonts.load('800 40px Archivo'),document.fonts.load('500 12px "JetBrains Mono"')]).catch(()=>{}):Promise.resolve()).then(()=>{ READY=true; status('ready'); targets.forEach((T,k)=>{ if(T.visible) request(k,false); }); });
window.__fxsheet={get S(){return S;},DEF,get light(){return LIGHT;},targets,idle:()=>!pending.size&&!pool.some(w=>w.busy)&&!pump.t,workers:()=>useWorkers&&pool.length};
})();
