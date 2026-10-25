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
const b64e=t=>btoa(unescape(encodeURIComponent(t))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''), b64d=t=>decodeURIComponent(escape(atob(t.replace(/-/g,'+').replace(/_/g,'/'))));
const applySnap=j=>{ for(const id in DEF) S[id]=Object.assign({},DEF[id],(j.S||{})[id]||{}); LIGHT=Object.assign({},DEF_LIGHT,j.light||{}); };
let FROM_LINK=false;
try{ const q=new URLSearchParams(location.search).get('s'); if(q){ applySnap(JSON.parse(b64d(q))); FROM_LINK=true; } }catch(e){ console.warn('bad share link',e); }
if(!FROM_LINK) try{ const j=JSON.parse(localStorage.getItem(KEY)||'null'); if(j) applySnap(j); }catch(e){}
const diffSnap=()=>{ const o={S:{},light:LIGHT}; for(const id in S){ const d={}; for(const k in S[id]) if(JSON.stringify(S[id][k])!==JSON.stringify(DEF[id][k])) d[k]=S[id][k]; if(Object.keys(d).length) o.S[id]=d; } return o; };
/* history: one snapshot per committed change (release, preset, reset, light) */
const HIST={list:[],i:-1}; const snap=()=>clone({S,light:LIGHT});
const commit=()=>{ const sn=JSON.stringify(snap()); if(HIST.i>=0&&JSON.stringify(HIST.list[HIST.i])===sn) return; HIST.list=HIST.list.slice(0,HIST.i+1); HIST.list.push(JSON.parse(sn)); if(HIST.list.length>80) HIST.list.shift(); HIST.i=HIST.list.length-1; updHist(); };
const updHist=()=>{ const u=document.getElementById('fs-undo'), r=document.getElementById('fs-redo'); if(u) u.disabled=HIST.i<=0; if(r) r.disabled=HIST.i>=HIST.list.length-1; };
const UI={view:'image',loupe:false,follow:true,dragging:false};
const COARSE=matchMedia('(pointer:coarse)').matches;
const save=(()=>{ let t; return ()=>{ clearTimeout(t); t=setTimeout(()=>{ try{ localStorage.setItem(KEY,JSON.stringify({S,light:LIGHT})); }catch(e){} },300); }; })();
const status=(t)=>{ const n=$('#fs-status'); if(n) n.textContent=t; };

/* ══════════ render pool ══════════ */
const N_WORKERS=Math.max(1,Math.min(3,(navigator.hardwareConcurrency||4)-1));
const pool=[]; let useWorkers=location.protocol!=='file:';
const workerQ=(document.currentScript&&document.currentScript.src.includes('?'))?'?'+document.currentScript.src.split('?')[1]:'';
if(useWorkers){ try{ for(let i=0;i<N_WORKERS;i++){ const w=new Worker('worker.js'+workerQ); w.busy=null; w.onmessage=ev=>done(w,ev.data); w.onerror=()=>{ useWorkers=false; }; pool.push(w); } }catch(e){ useWorkers=false; } }
const targets=new Map();   // key → {canvas, build(scale)→job, onStats, visible, dirty, lastPainted}
const pending=new Map();   // key → job (latest wins)
let tokenN=0;
const latest=new Map();    // key → newest token issued
function request(key,draft){ const T=targets.get(key); if(!T) return; if(!T.visible&&!draft){ T.dirty=true; return; } T.dirty=false;
  const sc=draft?(T.ms<80?1:T.ms<240?.71:.5):1; const job=T.build(sc); job.key=key; job.token=++tokenN; job.prio=(draft?0:1)+(T.prio||0); latest.set(key,job.token); pending.set(key,job); T.frame&&T.frame.classList.add('busy'); pump(); }
function pump(){ if(!pending.size){ if(!pool.some(w=>w.busy)) status(''); return; } status(UI.dragging?'draft':'rendering');
  if(useWorkers&&pool.length){ for(const w of pool){ if(w.busy) continue; const job=next(); if(!job) break; w.busy=job.key; const tr=Object.values(job.clips||{}).map(c=>c.buffer); w.postMessage(job,tr); } }
  else if(!pump.t){ pump.t=setTimeout(()=>{ pump.t=0; const job=next(); if(job){ try{ const r=mainRender(job); done(null,{key:job.key,token:job.token,W:job.W,H:job.H,dpr:job.pdpr||job.dpr,scale:job.scale,rgba:r.rgba,stats:r.stats}); }catch(err){ console.error(err); } } },0); } }
function next(){ let best=null; for(const j of pending.values()){ if(pool.some(w=>w.busy===j.key)) continue; if(!best||j.prio<best.prio) best=j; } if(best) pending.delete(best.key); return best; }
let mainR=null; function mainRender(job){ if(!mainR){ mainR=makeMainRenderer(); } return mainR(job); }
function makeMainRenderer(){ return (j)=>{ FX.LIGHT=j.light; const t0=performance.now(); let R;
  if(j.kind==='fx'){ R=EFX[j.id].run(j.S[j.id],j.W,j.H,j.dpr,{S:j.S,clips:j.clips||{},proof:!!j.proof}); } else { const u=SET.usages.find(u=>u.id===j.id); FX.LIGHT=SET.lightFor(u,FX.LIGHT); const SS={}; for(const id in j.S) SS[id]=Object.assign({},j.S[id],(u.overrides||{})[id]||{}); R=u.run(id=>SS[id],j.W,j.H,j.dpr,{S:SS,clips:j.clips||{}}); }
  if(j.outputs){ const outs={}; for(const v of j.outputs) outs[v]=FX.toRGBA(R,v,j.W,j.H); return {outs,stats:{ms:performance.now()-t0,marks:R.marks,unit:R.markUnit||''}}; }
  return {rgba:FX.toRGBA(R,j.view,j.W,j.H),stats:{ms:performance.now()-t0,marks:R.marks,unit:R.markUnit||'',W:j.W,H:j.H}}; }; }
function done(w,d){ if(w) w.busy=null; const T=targets.get(d.key);
  if(d.error){ console.error(d.error); if(w&&/importScripts|NetworkError|SecurityError/.test(d.error)){ useWorkers=false; } }
  else if(T&&d.token>=(T.lastPainted||0)){ T.lastPainted=d.token; const c=T.canvas; if(c.width!==d.W||c.height!==d.H){ c.width=d.W; c.height=d.H; } c.getContext('2d').putImageData(new ImageData(d.rgba,d.W,d.H),0,0); if(!T.fit) place(c,d.W,d.H,d.dpr,d.scale); if(d.scale===1) T.ms=d.stats.ms; d.stats.dpr=d.dpr; T.onStats&&T.onStats(d.stats,d.scale===1); }
  if(T&&T.frame&&!pending.has(d.key)&&!pool.some(x=>x.busy===d.key)) T.frame.classList.remove('busy');
  pump(); }
/* canvas size = the frame's inner box in device px (dpr up to 3, a pixel budget per canvas), floored, and shown at exactly
   W/dpr CSS px with its origin snapped to a device pixel — so the browser never resamples a finished plate. */
const BUDGET=2.8e6;
const dims=(canvas,scale)=>{ const fr=canvas.parentElement, cw=fr.clientWidth, ch=fr.clientHeight; let dpr=Math.min(3,devicePixelRatio||1); if(cw*ch*dpr*dpr>BUDGET) dpr=Math.sqrt(BUDGET/(cw*ch)); dpr*=scale;
  return {W:Math.max(2,Math.floor(cw*dpr)),H:Math.max(2,Math.floor(ch*dpr)),dpr,scale}; };
const place=(c,W,H,dpr,scale)=>{ const real=devicePixelRatio||1, fr=c.parentElement, r=fr.getBoundingClientRect(), x0=r.left+fr.clientLeft, y0=r.top+fr.clientTop;
  const fx=(x0*real)%1, fy=((y0+scrollY)*real)%1; c.style.width=(W/dpr)+'px'; c.style.height=(H/dpr)+'px'; c.style.left=(fx?(1-fx)/real:0)+'px'; c.style.top=(fy?(1-fy)/real:0)+'px'; c.style.imageRendering=scale<1?'pixelated':'auto'; };
/* clips are drawn on the main thread (fonts, Path2D) and shipped to the worker as Float32 alpha */
const CLIPC=document.createElement('canvas'), UMASK={}; // UMASK[id] = uploaded mask image (session only)
const mkC=(W,H)=>{ CLIPC.width=W; CLIPC.height=H; return CLIPC; };
const makeClips=(defs,W,H,dpr,o)=>{ const clips={}; for(const k in (defs||{})){ const c=mkC(W,H), g=c.getContext('2d',{willReadFrequently:true}); g.clearRect(0,0,W,H); g.setTransform(dpr,0,0,dpr,0,0); g.fillStyle='#fff'; defs[k](g,W/dpr,H/dpr,o); const d=g.getImageData(0,0,W,H).data, f=new Float32Array(W*H); for(let i=0,j=3;i<f.length;i++,j+=4) f[i]=d[j]/255; clips[k]=f; } return clips; };
const fxClips=(id,W,H,dpr,o)=>SET.clips(id,W,H,dpr,o,UMASK[id],mkC);
const isStock=e=>/^stock/.test(e.role||'');
const fxJob=(id,canvas,view,opt={})=>scale=>{ const {W,H,dpr}=dims(canvas,scale); const o=opt.S?opt.S(id):S[id], SS=opt.S?Object.assign({},S,{[id]:o}):S; return {kind:'fx',id,W,H,dpr,scale,S:SS,light:LIGHT,view:view(),proof:opt.proof?opt.proof():false,clips:fxClips(id,W,H,dpr,o)}; };
const uJob=(u,canvas)=>scale=>{ const d0=dims(canvas,scale), W=d0.W, H=d0.H, dpr=d0.dpr*(u.zoom||1); const clips=makeClips(u.clips,W,H,dpr,null); // zoom: marks rendered larger at device px — a macro crop, never an upscale
  const SS={}; for(const id in S) SS[id]=UI.follow?S[id]:DEF[id]; return {kind:'u',id:u.id,W,H,dpr,pdpr:d0.dpr,scale,S:SS,light:LIGHT,view:'image',clips}; };

/* coupling: which keys must redraw when effect `id` changes */
const dependents=id=>{ const keys=new Set(['p:'+id,'r:'+id,'o:'+id]); SET.effects.forEach(e=>{ if(e.stockOf&&e.stockOf(S[e.id])===id){ keys.add('p:'+e.id); keys.add('r:'+e.id); keys.add('o:'+e.id); } });
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
      if(p.type==='range'){ const tr=h('div',{class:'fs-track'}); const span=p.max-p.min, k=p.curve||1;
        // curve k: slider position t ∈ [0,1] → value = min + span·t^k — resolution where the subtle values live
        const toT=v=>Math.pow(FX.clamp((v-p.min)/span,0,1),1/k), toV=t=>{ const v=p.min+span*Math.pow(t,k), st=p.step||.001; return FX.clamp(+(Math.round(v/st)*st).toFixed(6),p.min,p.max); };
        (p.limits||[]).forEach(([a,b,why])=>{ const ta=toT(a), tb=toT(b); tr.append(h('span',{class:'lim',style:`left:${ta*100}%;width:${(tb-ta)*100}%`,title:why})); });
        tr.append(h('span',{class:'def',style:`left:${toT(DEF[e.id][p.key])*100}%`,title:'default '+fmt(DEF[e.id][p.key],p)}));
        if(k!==1) tr.classList.add('curved');
        const inp=h('input',{type:'range',min:0,max:1,step:.0005,value:toT(o()[p.key]),'aria-label':p.label,'aria-valuemin':p.min,'aria-valuemax':p.max});
        const out=h('button',{type:'button',class:'val',title:'type a value'}); const setOut=()=>{ out.textContent=fmt(o()[p.key],p)+(p.unit?' '+p.unit:''); inp.setAttribute('aria-valuenow',o()[p.key]); };
        inp.addEventListener('input',()=>{ const v=toV(+inp.value); if(v===o()[p.key]) return; o()[p.key]=v; setOut(); syncInk(); onInput(p); });
        inp.addEventListener('change',()=>onChange(p));
        inp.addEventListener('keydown',ev=>{ if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(ev.key)) return; ev.preventDefault(); const st=(p.step||.01)*(ev.shiftKey?10:1)*(ev.key==='ArrowLeft'||ev.key==='ArrowDown'?-1:1); o()[p.key]=FX.clamp(+(o()[p.key]+st).toFixed(6),p.min,p.max); sync(); onInput(p); clearTimeout(inp._kt); inp._kt=setTimeout(()=>onChange(p),260); });
        out.addEventListener('click',()=>{ const n=h('input',{type:'number',class:'num',min:p.min,max:p.max,step:p.step,value:o()[p.key],'aria-label':p.label+' value'}); out.replaceWith(n); n.focus(); n.select();
          let fd=false; const fin=(ok)=>{ if(fd) return; fd=true; if(ok){ const v=FX.clamp(+n.value,p.min,p.max); if(!isNaN(v)){ o()[p.key]=v; } } n.replaceWith(out); sync(); if(ok) onChange(p); };
          n.addEventListener('keydown',ev=>{ if(ev.key==='Enter') fin(true); if(ev.key==='Escape') fin(false); }); n.addEventListener('blur',()=>fin(true),{once:true}); });
        tr.append(inp); row.append(tr,out);
        row._sync=()=>{ inp.value=toT(o()[p.key]); setOut(); if(p.ink){ tr.style.setProperty('--tbg',trackBG(o(),p)); tr.classList.add('grad'); } }; }
      else if(p.type==='text'){ const inp=h('input',{type:'text',class:'txt',maxlength:p.maxlength||80,value:o()[p.key],'aria-label':p.label,spellcheck:'false'}); let t;
        inp.addEventListener('input',()=>{ o()[p.key]=inp.value; clearTimeout(t); t=setTimeout(()=>onChange(p),260); }); inp.addEventListener('keydown',ev=>{ if(ev.key==='Enter'){ clearTimeout(t); onChange(p); } });
        row.append(inp); row._sync=()=>{ if(document.activeElement!==inp) inp.value=o()[p.key]; }; }
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
const register=(key,canvas,frame,build,onStats,prio,opt={})=>{ const el=opt.observe||canvas; targets.set(key,{canvas,frame,build,onStats,prio,fit:!!opt.fit,el,visible:false,dirty:true,lastPainted:0}); el.dataset.key=key; obs.observe(el); if(READY) requestAnimationFrame(()=>{ const T=targets.get(key); if(T&&T.visible) request(key,false); }); };
const unregister=key=>{ const T=targets.get(key); if(!T) return; obs.unobserve(T.el||T.canvas); targets.delete(key); pending.delete(key); };
const BASE=new URL('.',location.href).href;
const roundP=(e,o)=>{ const r={}; for(const p of e.params){ let v=o[p.key]; if(p.type==='range'&&typeof v==='number'){ const st=p.step||.001, d=Math.max(0,Math.ceil(-Math.log10(st))); v=+v.toFixed(d); } r[p.key]=v; } return r; };
const lightR=()=>({az:Math.round(LIGHT.az),el:Math.round(LIGHT.el)});
const depsOf=id=>{ const out=[id], e=EFX[id], sid=e.stockOf&&e.stockOf(S[id]); if(sid&&!out.includes(sid)) out.push(sid); return out; };
const paramsWithDeps=id=>Object.fromEntries(depsOf(id).map(k=>[k,roundP(EFX[k],S[k])]));

/* material system: one line, open for the causes and the pass order */
if(SET.system){ const barEl=$('#fs-bar'); const sysD=h('details',{class:'fs-sysd',open:innerWidth>760},h('summary',null,h('span',{class:'code'},'Material system'),h('span',{class:'sum'},SET.system.read)),h('section',{class:'fs-sys','aria-label':'Material system'},
  h('div',{class:'c'},h('span',{class:'code'},'Shared causes'),h('ul',null,SET.system.sharedCause.map(t=>h('li',null,t)))),
  h('div',{class:'c'},h('span',{class:'code'},'Pass order'),h('ol',null,SET.system.passOrder.map(t=>h('li',null,t)))))); barEl.parentNode.insertBefore(sysD,barEl.nextSibling); }

/* ── sheet light: one state, a handle on every plate ── */
const pucks=[]; let lightRaf=0;
const kickLight=(draft)=>{ cancelAnimationFrame(lightRaf); lightRaf=requestAnimationFrame(()=>{ UI.dragging=draft; refresh(draft?allKeys().filter(k=>(k.startsWith('p:')||k.startsWith('w:'))&&targets.get(k).visible):allKeys(),draft); }); };
const syncPucks=()=>{ pucks.forEach(p=>p.sync()); SET.effects.forEach(e=>blocks[e.id]&&blocks[e.id].updSpec()); };
function makePuck(host,mini){ const disc=h('div',{class:'disc',role:'slider',tabindex:'0','aria-label':'Sheet light: drag — angle is where it comes from, distance from center is how low it rakes','aria-valuetext':''},h('i',{class:'sun'})), out=h('span',{class:'v'});
  const wrap=h('div',{class:'fs-puck'+(mini?' mini':''),title:'Sheet light — drag. Angle = where it comes from; distance from center = how low it rakes. Arrow keys step it, double-click resets.'},disc,out); host.append(wrap);
  const sync=()=>{ const r=(90-LIGHT.el)/80, a=LIGHT.az*Math.PI/180, sun=$('.sun',disc); sun.style.left=(50+Math.cos(a)*r*40).toFixed(2)+'%'; sun.style.top=(50+Math.sin(a)*r*40).toFixed(2)+'%'; out.textContent=`${Math.round(LIGHT.az)}° · ${Math.round(LIGHT.el)}°`; disc.setAttribute('aria-valuetext',`from ${Math.round(LIGHT.az)} degrees, ${Math.round(LIGHT.el)} degrees up`); };
  const at=(ev)=>{ const r=disc.getBoundingClientRect(), x=(ev.clientX-r.left)/r.width*2-1, y=(ev.clientY-r.top)/r.height*2-1, d=Math.min(1,Math.hypot(x,y)); LIGHT.az=((Math.atan2(y,x)*180/Math.PI)+360)%360; LIGHT.el=FX.clamp(90-d*80,10,88); syncPucks(); };
  disc.addEventListener('pointerdown',ev=>{ ev.preventDefault(); disc.setPointerCapture(ev.pointerId); wrap.classList.add('on'); at(ev); kickLight(true); });
  disc.addEventListener('pointermove',ev=>{ if(!disc.hasPointerCapture(ev.pointerId)) return; at(ev); kickLight(true); });
  const up=ev=>{ if(!disc.hasPointerCapture(ev.pointerId)) return; disc.releasePointerCapture(ev.pointerId); wrap.classList.remove('on'); save(); commit(); kickLight(false); };
  disc.addEventListener('pointerup',up); disc.addEventListener('pointercancel',up);
  disc.addEventListener('keydown',ev=>{ const st=ev.shiftKey?10:2; if(ev.key==='ArrowLeft') LIGHT.az=(LIGHT.az-st+360)%360; else if(ev.key==='ArrowRight') LIGHT.az=(LIGHT.az+st)%360; else if(ev.key==='ArrowUp') LIGHT.el=Math.min(88,LIGHT.el+st); else if(ev.key==='ArrowDown') LIGHT.el=Math.max(10,LIGHT.el-st); else return; ev.preventDefault(); syncPucks(); save(); clearTimeout(disc._kt); disc._kt=setTimeout(commit,400); kickLight(false); });
  disc.addEventListener('dblclick',()=>{ LIGHT=clone(DEF_LIGHT); syncPucks(); save(); commit(); kickLight(false); });
  const P={sync}; pucks.push(P); sync(); return P; }

/* ── racks, one per section ── */
const SECTS=SET.sections||[{id:'all',title:SET.short}]; const secOf=e=>e.section||SECTS[0].id;
const racks={}; SECTS.forEach((sc,i)=>{ const r=h('section',{class:'fs-rack','aria-label':sc.title}); racks[sc.id]=r; if(SECTS.length>1) live.append(h('div',{class:'fs-rackh',id:i?null:'sec-'+sc.id},h('span',{class:'code'},String(i+1).padStart(2,'0')),h('b',null,sc.title),h('span',{class:'bl'},sc.blurb||''))); live.append(r); });
SET.effects.forEach(e=>{ const rack=racks[secOf(e)]||racks[SECTS[0].id]; const c=h('canvas',{class:'fs-cv','aria-label':e.name}); const st=h('span',{class:'st'},'—'); const fr=h('div',{class:'fs-frame'},c);
  rack.append(h('a',{class:'fs-cell',href:'#'+e.id},fr,h('div',{class:'cap'},h('span',{class:'code'},e.code),h('b',null,e.name),h('span',{class:'role'},e.role||''),st)));
  register('r:'+e.id,c,fr,fxJob(e.id,c,()=>'image',{proof:()=>isStock(e)}),(s)=>{ st.textContent=fmtN(s.marks)+' '+s.unit; },3); });

/* ── output destinations: device px, and — for print — physical size; mark scale keeps density physically constant ── */
const DESTS=[
  {id:'deck',label:'Deck 16:9 · 3840 × 2160',px:[3840,2160]},
  {id:'figma',label:'Figma frame 1440 · @2×',px:[2880,1800]},
  {id:'square',label:'Square · 2160',px:[2160,2160]},
  {id:'story',label:'Story 9:16 · 2160 × 3840',px:[2160,3840]},
  {id:'a4',label:'A4 · 300 dpi',mm:[210,297],dpi:300},
  {id:'a5',label:'A5 · 300 dpi',mm:[148,210],dpi:300},
  {id:'letter',label:'US Letter · 300 dpi',mm:[215.9,279.4],dpi:300},
  {id:'custom',label:'Custom · mm @ dpi',mm:[120,80],dpi:300}];
const MM_PER_CSS=25.4/96;
const destDims=(d,o)=>{ const m=o.scale; if(d.px){ const [W,H]=o.land?[Math.max(...d.px),Math.min(...d.px)]:d.px, dpr=2*m; return {W,H,dpr,cssW:W/dpr,cssH:H/dpr,note:`marks as on a 2× screen${m!==1?' × '+m:''}`}; }
  let [mw,mh]=d.id==='custom'?[o.mw,o.mh]:d.mm; if(d.id!=='custom'&&o.land) [mw,mh]=[mh,mw]; const dpi=d.id==='custom'?o.dpi:d.dpi, W=Math.round(mw/25.4*dpi), H=Math.round(mh/25.4*dpi), dpr=dpi/96*m;
  return {W,H,dpr,cssW:W/dpr,cssH:H/dpr,mm:[mw,mh],dpi,note:`1 CSS px = ${(MM_PER_CSS*m).toFixed(3)} mm on paper`}; };
const dl=(blob,name)=>{ const a=h('a',{href:URL.createObjectURL(blob),download:name}); document.body.append(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },4000); };
const toBlob=(rgba,W,H)=>new Promise(res=>{ const c=document.createElement('canvas'); c.width=W; c.height=H; c.getContext('2d').putImageData(new ImageData(rgba,W,H),0,0); c.toBlob(b=>res(b),'image/png'); });
function exportJob(job){ return new Promise((res,rej)=>{ if(useWorkers&&pool.length){ const w=new Worker('worker.js'+workerQ); w.onmessage=ev=>{ w.terminate(); ev.data.error?rej(ev.data.error):res(ev.data); }; w.onerror=err=>{ w.terminate(); rej(err.message||'worker error'); }; w.postMessage(job,Object.values(job.clips||{}).map(c=>c.buffer)); }
  else setTimeout(()=>{ try{ res(mainRender(job)); }catch(err){ rej(String(err)); } },30); }); }

/* ══════════ technique blocks ══════════ */
const stepDown=(src,dst)=>{ const real=Math.min(2,devicePixelRatio||1), fr=dst.parentElement, tw=Math.max(2,Math.round(fr.clientWidth*real)), th=Math.max(2,Math.round(fr.clientHeight*real)); dst.width=tw; dst.height=th; dst.style.width='100%'; dst.style.height='100%';
  let c=src, sw=src.width, sh=src.height; while(sw/2>tw){ const t=document.createElement('canvas'); t.width=Math.max(tw,Math.round(sw/2)); t.height=Math.max(th,Math.round(sh/2)); const g=t.getContext('2d'); g.imageSmoothingQuality='high'; g.drawImage(c,0,0,t.width,t.height); c=t; sw=t.width; sh=t.height; }
  const g=dst.getContext('2d'); g.imageSmoothingQuality='high'; g.drawImage(c,0,0,tw,th); };
const VIEWS=[['image','image'],['ink','ink'],['stock','stock'],['mask','mask']];
const DISTS=[['1:1',1,'as rendered (≈ 45 cm)'],['60 cm',.75,'arm\'s length'],['1.5 m',.3,'across a table'],['4 m',.11,'across a room']];
let lastSec=null;
SET.effects.forEach(e=>{
  if(SECTS.length>1&&secOf(e)!==lastSec){ lastSec=secOf(e); const sc=SECTS.find(x=>x.id===lastSec)||{title:lastSec}; if(SECTS.indexOf(sc)>0) live.append(h('div',{class:'fs-secth',id:'sec-'+lastSec},h('span',{class:'code'},'Section · '+String(SECTS.indexOf(sc)+1).padStart(2,'0')),h('h2',null,sc.title),sc.blurb?h('p',null,sc.blurb):null)); }
  const B={view:'image',dist:1,proof:isStock(e),wedge:null,pin:null}; const id=e.id;
  const cv=h('canvas',{class:'fs-cv','aria-label':e.name+' plate'}), stat=h('div',{class:'fs-stat'}), dials=h('div',{class:'fs-dials'});
  const distC=h('canvas',{class:'fs-distc',hidden:true}), puckHost=h('div',{class:'fs-puckhost'});
  const fr=h('div',{class:'fs-frame big'},cv,distC,h('span',{class:'fs-bar-busy','aria-hidden':'true'}),puckHost);
  const sec=h('section',{class:'fs-fx',id,'data-fx':id});
  const specObj=()=>({effect:id,code:e.code,name:e.name,set:SET.set,units:'CSS px; rendered at device px (dpr ≤ 3 on screen, any for export)',light:lightR(),params:roundP(e,S[id]),printsOn:e.stockOf?e.stockOf(S[id]):null,deps:paramsWithDeps(id)});
  const onsite=h('a',{class:'fs-on',href:'#'},''); const updOn=()=>{ const sid=e.stockOf&&e.stockOf(S[id]); onsite.hidden=!sid; if(sid){ onsite.href='#'+sid; onsite.innerHTML=`prints on <b>${esc(EFX[sid].code)} ${esc(EFX[sid].name)}</b>`; } };
  const feed=h('span',{class:'fs-on feed'}); const updFeed=()=>{ const f=SET.effects.filter(x=>x.stockOf&&x.stockOf(S[x.id])===id); feed.hidden=!f.length; feed.innerHTML=f.length?'stock for '+f.map(x=>`<a href="#${x.id}"><b>${esc(x.code)}</b></a>`).join(' · '):''; };
  const bReset=h('button',{type:'button',onclick:()=>{ S[id]=clone(DEF[id]); dials._sync(); changed(); }},'reset');
  const seedOut=h('button',{type:'button',class:'seed',title:'new seed — every random draw hangs off this number',onclick:()=>{ S[id].seed=1+Math.floor(Math.random()*999); dials._sync(); changed(); }},'');
  sec.append(h('header',{class:'fs-fxh'},h('div',{class:'id'},h('span',{class:'code'},e.code+' · '+(e.role||'')),h('h2',null,e.name),h('div',{class:'links'},onsite,feed)),h('p',{class:'sub'},e.sub),h('div',{class:'act'},bReset,seedOut)));
  // presets
  const presetVals=pp=>Object.assign(clone(DEF[id]),clone(pp),{seed:S[id].seed});
  const pre=h('div',{class:'fs-presets',role:'group','aria-label':e.name+' presets'},h('span',null,'Start from'));
  (e.presets||[]).forEach(([name,pp])=>pre.append(h('button',{type:'button','data-p':name,onclick:()=>{ S[id]=presetVals(pp); dials._sync(); changed(); }},name)));
  const updPre=()=>{ const cur=JSON.stringify(Object.assign({},S[id],{seed:0})); $$('button',pre).forEach(b=>{ const pp=(e.presets||[]).find(x=>x[0]===b.dataset.p)[1]; b.setAttribute('aria-pressed',String(JSON.stringify(Object.assign(presetVals(pp),{seed:0}))===cur)); }); seedOut.textContent='seed '+S[id].seed+' ↻'; };
  if((e.presets||[]).length) sec.append(pre);

  // ── plate tools: view · distance · wedge · pin · (test strip) ──
  const seg=(items,cur,on,label)=>{ const g=h('div',{class:'fs-tseg',role:'group','aria-label':label}); items.forEach(([k,v,tt])=>g.append(h('button',{type:'button','data-v':String(v),title:tt||'','aria-pressed':String(v===cur),onclick:ev=>{ const me=ev.currentTarget; $$('button',g).forEach(b=>b.setAttribute('aria-pressed',String(b===me))); on(v); }},k))); return g; };
  const viewSeg=seg(VIEWS.map(([k,v])=>[k,v]),'image',v=>{ B.view=v; request('p:'+id,false); },'View');
  const distSeg=seg(DISTS.map(([k,v,t])=>[k,v,'viewing distance: '+t]),1,v=>{ B.dist=v; paintDist(); },'Viewing distance');
  const bWedge=h('button',{type:'button',class:'tb','aria-pressed':'false',title:'Wedge: a grid of variations across two dials — click a cell to adopt it'},'wedge');
  const bPin=h('button',{type:'button',class:'tb','aria-pressed':'false',title:'Pin this state, keep tuning, and compare with a split'},'pin · split');
  const bProof=isStock(e)?h('button',{type:'button',class:'tb','aria-pressed':'true',title:'Print the source marks into this stock — a stock is only legible through ink'},'test strip'):null;
  const wedgeCtl=h('div',{class:'fs-wctl',hidden:true});
  const tools=h('div',{class:'fs-ptools'},viewSeg,h('span',{class:'lbl'},'distance'),distSeg,h('span',{class:'sp'}),bProof,bWedge,bPin);
  if(bProof) bProof.onclick=()=>{ B.proof=!B.proof; bProof.setAttribute('aria-pressed',String(B.proof)); request('p:'+id,false); };
  // phones: only the plate and its stats stay pinned while you dial; view / distance / wedge tools scroll with the page
  const PHONE=matchMedia('(max-width:760px)').matches, stage=PHONE?h('div',{class:'fs-stage'},fr,stat):h('div',{class:'fs-stage'},fr,tools,wedgeCtl,stat);
  makePuck(puckHost,true);

  // viewing distance: the eye integrates; we downsample with the browser's high-quality filter at true device px
  function paintDist(){ $$('button',distSeg).forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.v===B.dist))); if(B.dist===1||!cv.width){ distC.hidden=true; return; }
    const real=devicePixelRatio||1, Wc=fr.clientWidth, Hc=fr.clientHeight; distC.width=Math.round(Wc*real); distC.height=Math.round(Hc*real); distC.style.width=Wc+'px'; distC.style.height=Hc+'px';
    const g=distC.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,distC.width,distC.height); g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high';
    // step down in halves (box-filter-like) so fine marks average into tone instead of aliasing
    let src=cv, sw=cv.width, sh=cv.height; const tw=Math.max(1,Math.round(distC.width*B.dist)), th=Math.max(1,Math.round(distC.height*B.dist));
    while(sw/2>tw){ const t=document.createElement('canvas'); t.width=Math.max(tw,Math.round(sw/2)); t.height=Math.max(th,Math.round(sh/2)); const tg=t.getContext('2d'); tg.imageSmoothingQuality='high'; tg.drawImage(src,0,0,t.width,t.height); src=t; sw=t.width; sh=t.height; }
    g.drawImage(src,Math.round((distC.width-tw)/2),Math.round((distC.height-th)/2),tw,th); const dd=DISTS.find(x=>x[1]===B.dist); g.font=`500 ${10*real}px "JetBrains Mono", monospace`; g.fillStyle='#6F6E6A'; g.fillText(`seen from ${dd[0]} · ${dd[2]} — the plate at its apparent size`,12*real,distC.height-12*real); distC.hidden=false; }

  // pin · split: freeze the current plate, keep tuning, drag the divider to compare
  function setPin(on){ B.pin&&B.pin.el.remove(); B.pin=null; bPin.setAttribute('aria-pressed',String(on)); if(!on) return;
    const pc=h('canvas',{class:'fs-pinc'}); pc.width=cv.width; pc.height=cv.height; pc.getContext('2d').drawImage(cv,0,0); ['width','height','left','top'].forEach(k=>pc.style[k]=cv.style[k]);
    const handle=h('div',{class:'fs-split',role:'slider','aria-label':'split position',tabindex:'0'},h('span',{class:'a'},'pinned'),h('span',{class:'b'},'live')), el=h('div',{class:'fs-pin'},pc,handle); fr.insertBefore(el,distC);
    B.pin={el,x:.5}; const setX=x=>{ B.pin.x=FX.clamp(x,0,1); pc.style.clipPath=`inset(0 ${(1-B.pin.x)*100}% 0 0)`; handle.style.left=(B.pin.x*100)+'%'; }; setX(.5);
    handle.addEventListener('pointerdown',ev=>{ ev.preventDefault(); handle.setPointerCapture(ev.pointerId); });
    handle.addEventListener('pointermove',ev=>{ if(!handle.hasPointerCapture(ev.pointerId)) return; const r=fr.getBoundingClientRect(); setX((ev.clientX-r.left)/r.width); });
    handle.addEventListener('keydown',ev=>{ if(ev.key==='ArrowLeft') setX(B.pin.x-.05); if(ev.key==='ArrowRight') setX(B.pin.x+.05); }); }
  bPin.onclick=()=>setPin(!B.pin);

  // wedge: two dials × N steps around the current value (in slider space, so curved dials step evenly by eye)
  const rangeParams=e.params.filter(p=>p.type==='range'&&p.key!=='seed'&&!p.ink);
  const tOf=(p,v)=>Math.pow(FX.clamp((v-p.min)/(p.max-p.min),0,1),1/(p.curve||1)), vOf=(p,t)=>{ const v=p.min+(p.max-p.min)*Math.pow(FX.clamp(t,0,1),p.curve||1), st=p.step||.001; return FX.clamp(+(Math.round(v/st)*st).toFixed(6),p.min,p.max); };
  const inLim=(p,v)=>(p.limits||[]).some(([a,b])=>v>=a&&v<=b);
  function wedgeOff(){ if(!B.wedge) return; B.wedge.keys.forEach(unregister); B.wedge.grid.remove(); B.wedge=null; bWedge.setAttribute('aria-pressed','false'); wedgeCtl.hidden=true; }
  function wedgeOn(px,py){ wedgeOff(); const N=innerWidth<=760?3:5, P1=rangeParams.find(p=>p.key===px)||rangeParams[0], P2=rangeParams.find(p=>p.key===py)||rangeParams[1]||rangeParams[0];
    const grid=h('div',{class:'fs-wedge',style:`--n:${N}`}), keys=[]; const t1=tOf(P1,S[id][P1.key]), t2=tOf(P2,S[id][P2.key]), span=.36;
    const steps=(t)=>Array.from({length:N},(_,k)=>FX.clamp(t-span/2+span*k/(N-1),0,1));
    const xs=steps(t1).map(t=>vOf(P1,t)), ys=steps(t2).map(t=>vOf(P2,t)).reverse();
    ys.forEach((vy,r)=>xs.forEach((vx,c)=>{ const cc=h('canvas',{class:'fs-cv'}), cur=vx===S[id][P1.key]&&vy===S[id][P2.key];
      const cell=h('button',{type:'button',class:'wc'+(inLim(P1,vx)||inLim(P2,vy)?' lim':'')+(cur?' cur':''),title:`${P1.label} ${fmt(vx,P1)} · ${P2.label} ${fmt(vy,P2)} — click to adopt`,onclick:()=>{ S[id][P1.key]=vx; S[id][P2.key]=vy; dials._sync(); wedgeOff(); changed(); }},cc,h('span',{class:'wl'},`${fmt(vx,P1)} · ${fmt(vy,P2)}`));
      grid.append(cell); const key=`w:${id}:${r*N+c}`; keys.push(key);
      register(key,cc,cell,fxJob(id,cc,()=>B.view,{S:()=>Object.assign({},S[id],{[P1.key]:vx,[P2.key]:vy}),proof:()=>B.proof}),null,1.5); }));
    fr.append(grid); B.wedge={grid,keys,px:P1.key,py:P2.key}; bWedge.setAttribute('aria-pressed','true');
    const sel=(cur,on)=>{ const s_=h('select',{'aria-label':'wedge axis'}); rangeParams.forEach(p=>s_.append(h('option',{value:p.key,selected:p.key===cur},p.label))); s_.addEventListener('change',()=>on(s_.value)); return s_; };
    wedgeCtl.innerHTML=''; wedgeCtl.append(h('span',null,'across →'),sel(P1.key,v=>wedgeOn(v,B.wedge.py)),h('span',null,'up ↑'),sel(P2.key,v=>wedgeOn(B.wedge.px,v)),h('span',{class:'hint'},'click a cell to adopt · esc to close'),h('button',{type:'button',onclick:wedgeOff},'close')); wedgeCtl.hidden=false; }
  bWedge.onclick=()=>B.wedge?wedgeOff():wedgeOn(rangeParams[0]&&rangeParams[0].key,rangeParams[1]&&rangeParams[1].key);
  sec.addEventListener('keydown',ev=>{ if(ev.key==='Escape'&&B.wedge) wedgeOff(); });

  // ── output: destination → px / mm · dpi · mark scale → files ──
  const O={dest:'deck',land:true,scale:1,mw:120,mh:80,dpi:300,image:true,ink:false,stock:false,json:true};
  const dSel=h('select',{'aria-label':'destination'}); DESTS.forEach(d=>dSel.append(h('option',{value:d.id},d.label)));
  const land=h('button',{type:'button',class:'tb','aria-pressed':'true',title:'landscape / portrait'},'landscape');
  const scaleIn=h('input',{type:'range',min:0,max:1,step:.001,'aria-label':'mark scale'}), scaleOut=h('span',{class:'v'});
  const sToT=v=>Math.log2(v/0.25)/4, tToS=t=>+(0.25*Math.pow(2,t*4)).toFixed(2); scaleIn.value=sToT(1);
  const cmm=h('div',{class:'fs-cmm',hidden:true},h('input',{type:'number',value:O.mw,min:5,max:2000,'aria-label':'width mm','data-k':'mw'}),h('span',null,'×'),h('input',{type:'number',value:O.mh,min:5,max:2000,'aria-label':'height mm','data-k':'mh'}),h('span',null,'mm @'),h('input',{type:'number',value:O.dpi,min:72,max:1200,'aria-label':'dpi','data-k':'dpi'}),h('span',null,'dpi'));
  const chk=(k,label,tt)=>{ const b=h('button',{type:'button',class:'tb','aria-pressed':String(O[k]),title:tt,onclick:()=>{ O[k]=!O[k]; b.setAttribute('aria-pressed',String(O[k])); updOut(); }},label); return b; };
  const sum=h('div',{class:'fs-osum'}), prev=h('canvas',{class:'fs-cv'}), prevFr=h('div',{class:'fs-frame fs-oprev'},prev,h('span',{class:'fs-bar-busy'}));
  const bGo=h('button',{type:'button',class:'go'},'render & download'), prog=h('span',{class:'fs-oprog'});
  const outD=h('details',{class:'fs-out'},h('summary',null,h('span',{class:'code'},'Output'),h('span',{class:'sumv'})),
    h('div',{class:'orow'},dSel,land),cmm,
    h('div',{class:'orow'},h('label',null,'Mark scale'),scaleIn,scaleOut),
    h('div',{class:'orow files'},chk('image','image','the rendered plate, sRGB PNG'),chk('ink','ink plate','absorbance as a film positive — one grayscale plate per run, for riso / screen / a mask in Figma'),chk('stock','height map','the stock height as 8-bit grayscale — displacement in Blender, Cavalry, TouchDesigner'),chk('json','spec','JSON sidecar: params + deps + light + destination')),
    prevFr,sum,h('div',{class:'orow'},bGo,prog));
  // Output stays closed: the plate and its dials lead; export is one click away (its summary shows the target)
  if(prevFr.parentNode) prevFr.after(h('p',{class:'fs-onote'},'Preview = the whole composition stepped down to this box, so fine marks average into tone, as from across a room. The export carries every mark at full size.'));
  const updOut=()=>{ const d=DESTS.find(x=>x.id===O.dest), r=destDims(d,O); cmm.hidden=d.id!=='custom'; land.hidden=d.id==='custom'||(d.px&&d.px[0]===d.px[1]); land.textContent=O.land?'landscape':'portrait'; land.setAttribute('aria-pressed',String(O.land));
    scaleOut.textContent='× '+O.scale; const mp=r.W*r.H/1e6; sum.innerHTML=`<b>${r.W} × ${r.H} px</b> · ${mp.toFixed(1)} MP${r.mm?` · ${r.mm[0]} × ${r.mm[1]} mm @ ${r.dpi} dpi`:''}<br>${esc(r.note)} · composition at ${Math.round(r.cssW)} × ${Math.round(r.cssH)} CSS px${mp>16?'<br><em>large — may take a while; desktop recommended</em>':''}`;
    $('.sumv',outD).textContent=`${d.label.split(' · ')[0]} · ${r.W}×${r.H}`; prevFr.style.aspectRatio=`${r.W} / ${r.H}`; bGo.disabled=mp>48; request('o:'+id,false); };
  dSel.addEventListener('change',()=>{ O.dest=dSel.value; const d=DESTS.find(x=>x.id===O.dest); if(d.mm&&d.id!=='custom') O.land=false; updOut(); });
  land.onclick=()=>{ O.land=!O.land; updOut(); };
  scaleIn.addEventListener('input',()=>{ O.scale=tToS(+scaleIn.value); updOut(); });
  $$('input[type=number]',cmm).forEach(n=>n.addEventListener('change',()=>{ O[n.dataset.k]=FX.clamp(+n.value||0,+n.min,+n.max); updOut(); }));
  // preview: the whole destination composition, at the size it fits — marks average to tone, as from a distance
  // preview: the whole destination composition at ≥ 1 device px per CSS px (so no mark is dropped), then stepped down
  // into the visible box — marks average into tone exactly as they will at that size, never vanish
  const prevSrc=document.createElement('canvas');
  register('o:'+id,prevSrc,prevFr,scale=>{ const d=DESTS.find(x=>x.id===O.dest), r=destDims(d,O); let dpr=Math.max(1,Math.min(r.dpr,1.25)); const k=Math.min(1,Math.sqrt(2.4e6/(r.cssW*r.cssH*dpr*dpr))); dpr*=k;
    const W=Math.max(2,Math.floor(r.cssW*dpr)), H=Math.max(2,Math.floor(r.cssH*dpr)); return {kind:'fx',id,W,H,dpr,scale:1,S,light:LIGHT,view:'image',proof:false,clips:fxClips(id,W,H,dpr,S[id])}; },()=>stepDown(prevSrc,prev),4,{observe:prev,fit:true});
  bGo.onclick=async()=>{ const d=DESTS.find(x=>x.id===O.dest), r=destDims(d,O), outs=['image','ink','stock'].filter(k=>O[k]); if(!outs.length&&!O.json) return;
    bGo.disabled=true; prog.textContent='rendering '+r.W+' × '+r.H+' …'; const t0=performance.now();
    try{ const job={kind:'fx',id,W:r.W,H:r.H,dpr:r.dpr,S,light:LIGHT,proof:false,outputs:outs.length?outs:['image'],clips:fxClips(id,r.W,r.H,r.dpr,S[id])};
      const res=await exportJob(job); prog.textContent='encoding …'; const base=`${id}_${d.id}_${r.W}x${r.H}`, files=[];
      for(const k of outs){ const b=await toBlob(res.outs[k],r.W,r.H); files.push(new File([b],`${base}_${k==='stock'?'height':k}.png`,{type:'image/png'})); }
      if(O.json){ const side={effect:id,code:e.code,name:e.name,set:SET.set,destination:{id:d.id,label:d.label,px:[r.W,r.H],mm:r.mm||null,dpi:r.dpi||null,dpr:+r.dpr.toFixed(4),markScale:O.scale,cssPx:[+r.cssW.toFixed(2),+r.cssH.toFixed(2)]},light:lightR(),params:roundP(e,S[id]),deps:paramsWithDeps(id),files:files.map(f=>f.name),source:BASE,rendered:new Date().toISOString()};
        files.push(new File([JSON.stringify(side,null,2)],`${base}.json`,{type:'application/json'})); }
      if(COARSE&&navigator.canShare&&navigator.canShare({files})){ await navigator.share({files,title:`${e.code} ${e.name}`}); } else for(const f of files){ dl(f,f.name); await new Promise(r_=>setTimeout(r_,350)); }
      prog.textContent=`done · ${((performance.now()-t0)/1000).toFixed(1)} s · ${files.length} file${files.length>1?'s':''}`; }
    catch(err){ console.error(err); prog.textContent='failed: '+String(err).slice(0,80); }
    bGo.disabled=false; };

  // ── foot: recipe · lift · spec ──
  const spec=h('pre',{class:'fs-spec'});
  const liftCode=h('pre',{class:'fs-spec lift'});
  const snippet=()=>{ const P=paramsWithDeps(id), needsClip=!!e.clips||['type'].includes(S[id].mShape);
    return `<!-- ${e.code} ${e.name} · ${SET.set} · lifted ${new Date().toISOString().slice(0,10)} -->
${needsClip?`<link rel="stylesheet" href="${new URL('../../_shared/fonts.css',BASE).href}">  <!-- Archivo / JetBrains Mono for dies and type -->
<link rel="stylesheet" href="${new URL('type.css',BASE).href}">  <!-- Courier Prime for typewriter strikes (OFL) -->
`:''}<canvas id="${id}" style="width:800px;height:600px;display:block"></canvas>
<script src="${BASE}fx.js"></script>
<script src="${BASE}set.js"></script>
<script>
  const S = ${JSON.stringify(P)};
  FX.LIGHT = ${JSON.stringify(lightR())};
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
  const c = document.getElementById('${id}'), cssW = 800, cssH = 600;
  const dpr = Math.min(3, devicePixelRatio || 1), W = Math.round(cssW * dpr), H = Math.round(cssH * dpr);
  c.width = W; c.height = H;
  const fx = FXSET.effects.find(e => e.id === '${id}');${needsClip?`
  const clips = FXSET.clips('${id}', W, H, dpr, S['${id}']);   // dies / typed marks, rasterized here (fonts load first)`:''}
  const R = fx.run(S['${id}'], W, H, dpr, { S${needsClip?', clips':''} });
  c.getContext('2d').putImageData(new ImageData(FX.toRGBA(R, 'image', W, H), W, H), 0, 0);
  // also: FX.toRGBA(R, 'ink' | 'stock' | 'mask', W, H) — plates and maps
  });
</script>`; };
  const bCopySnip=h('button',{type:'button'},'copy snippet'); bCopySnip.onclick=()=>copy(snippet(),bCopySnip);
  const bCopyP=h('button',{type:'button'},'copy params'); bCopyP.onclick=()=>copy(JSON.stringify(specObj(),null,2),bCopyP);
  const lift=h('div',{class:'fs-lift'},h('p',null,'Paste into any HTML file — it loads the two modules from this site, carries this effect\'s params and the stock it prints on, and renders at device px. Agents: the per-effect spec has the signature, units, dependencies and a test vector.'),
    h('div',{class:'orow'},bCopySnip,bCopyP,h('a',{class:'btn',href:`lift/${id}.html`,target:'_blank',rel:'noopener'},'standalone ↗'),h('a',{class:'btn',href:`spec/${id}.json`,target:'_blank',rel:'noopener'},'spec.json ↗')),liftCode);
  const ft=[['recipe','Recipe',h('ol',{class:'fs-rec'},e.recipe.map(r=>h('li',null,r)))],['lift','Lift',lift],['spec','Spec · live',spec]];
  const fstrip=h('div',{class:'fs-tabs small',role:'tablist'}), fpanes=h('div',{class:'fs-fpanes'});
  ft.forEach(([k,l,node],i)=>{ fstrip.append(h('button',{type:'button',role:'tab','data-k':k,'aria-selected':String(i===0),onclick:()=>{ $$('button',fstrip).forEach(b=>b.setAttribute('aria-selected',String(b.dataset.k===k))); $$('.fs-fpane',fpanes).forEach(p=>p.hidden=p.dataset.k!==k); if(k==='lift') liftCode.textContent=snippet(); }},l)); fpanes.append(h('div',{class:'fs-fpane','data-k':k,hidden:i!==0},node)); });

  // mask upload (Edge tab), session only
  const side=h('div',{class:'fs-side'},h('div',{class:'fs-panel'},dials),outD,h('div',{class:'fs-fxf'},fstrip,fpanes));
  sec.append(h('div',{class:'fs-fxb'},stage,...(PHONE?[h('div',{class:'fs-ptools-ph'},tools,wedgeCtl)]:[]),side));
  live.append(sec);
  const updSpec=()=>{ spec.textContent=JSON.stringify(specObj(),null,2); if(!$('.fs-fpane[data-k=lift]',fpanes).hidden) liftCode.textContent=snippet(); };
  register('p:'+id,cv,fr,fxJob(id,cv,()=>B.view,{proof:()=>B.proof}),(s,final)=>{ stat.innerHTML=`<span>${s.W} × ${s.H} px</span><span><b>${fmtN(s.marks)}</b> ${s.unit}</span><span>${s.ms.toFixed(0)} ms</span><span>${(s.dpr||1).toFixed(s.dpr%1?2:0)}× px</span>${final?'':'<span class="dr">draft</span>'}`; if(final) paintDist(); },1);
  const changed=()=>{ updSpec(); updOn(); updPre(); SET.effects.forEach(x=>blocks[x.id]&&blocks[x.id].updFeed()); save(); commit(); UI.dragging=false; refresh(dependents(id).concat(['o:'+id]),false); if(B.wedge) wedgeOn(B.wedge.px,B.wedge.py); };
  buildDials(e,dials,()=>{ dials._sync(); updSpec(); updPre(); UI.dragging=true; refresh(dependents(id).filter(k=>k.startsWith('p:')),true); },()=>{ dials._sync(); changed(); });
  // the Edge tab gets an upload when the mask shape is "image"
  const up=h('input',{type:'file',accept:'image/png,image/svg+xml,image/jpeg,image/webp',hidden:true}), upB=h('button',{type:'button',class:'tb up'},UMASK[id]?'replace mask image':'upload mask image');
  up.addEventListener('change',async()=>{ const f=up.files[0]; if(!f) return; const img=new Image(); img.src=URL.createObjectURL(f); await img.decode().catch(()=>{}); UMASK[id]=img; upB.textContent='replace mask image · '+f.name.slice(0,24); S[id].mShape='image'; dials._sync(); changed(); });
  upB.onclick=()=>up.click(); const mrow=$('.fs-row[data-k="mShape"]',dials); if(mrow) mrow.after(h('div',{class:'fs-uprow'},upB,up));
  blocks[id]={dials,updSpec,updOn,updFeed,updPre,specObj,B,updOut,wedgeOff}; updSpec(); updOn(); updFeed(); updPre(); updOut(); });
// a plate's output preview also depends on its stock

// ── stage height → sticky dial tabs sit right under the plate on phones ──
const ro=new ResizeObserver(es=>es.forEach(en=>{ en.target.closest('.fs-fxb').style.setProperty('--stageH',Math.ceil(en.target.getBoundingClientRect().height)+'px'); }));
$$('.fs-stage').forEach(s=>ro.observe(s));

/* ══════════ usage gallery ══════════ */
const UG=h('section',{class:'fs-usages',id:'usages'});
const fol=h('button',{type:'button','aria-pressed':'true',onclick:()=>{ UI.follow=!UI.follow; fol.setAttribute('aria-pressed',String(UI.follow)); fol.textContent=UI.follow?'following the dials':'defaults only'; refresh(allKeys().filter(k=>k.startsWith('u:')),false); }},'following the dials');
UG.append(h('header',{class:'fs-uh'},h('div',null,h('span',{class:'code'},'Usages'),h('h2',null,'Where the set goes')),h('p',{class:'sub'},'Compositions that run the same functions with the live dials and the sheet light, merged with each card\'s overrides. Tune a plate — or the stock it prints on — and the cards that use it redraw.'),h('div',{class:'act'},fol)));
// filter by job: what the card is for, not which effect it uses
const JOBS=SET.jobs||[]; const jcount=k=>SET.usages.filter(u=>u.job===k).length;
const jbar=h('div',{class:'fs-jobs',role:'group','aria-label':'Filter usages by job'},h('span',null,'Job'));
const setJob=k=>{ $$('button',jbar).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.j===k))); $$('.fs-ucard',ugrid).forEach(c=>c.hidden=k!=='all'&&c.dataset.job!==k); requestAnimationFrame(fitU); };
jbar.append(h('button',{type:'button','data-j':'all','aria-pressed':'true',onclick:()=>setJob('all')},'all ',h('i',null,String(SET.usages.length))));
JOBS.forEach(([k,l])=>{ if(jcount(k)) jbar.append(h('button',{type:'button','data-j':k,'aria-pressed':'false',onclick:()=>setJob(k)},l+' ',h('i',null,String(jcount(k))))); });
if(JOBS.length) UG.append(jbar);
const ugrid=h('div',{class:'fs-ugrid'}); UG.append(ugrid);
const JORD=k=>{ const i=JOBS.findIndex(j=>j[0]===k); return i<0?99:i; };
[...SET.usages].map((u,i)=>[u,i]).sort((a,b)=>JORD(a[0].job)-JORD(b[0].job)||a[1]-b[1]).map(x=>x[0]).forEach((u,i)=>{ const c=h('canvas',{class:'fs-cv','aria-label':u.title}); const lbl=h('div',{class:'fs-ulbl'+(u.rows?' rows':'')},(u.labels||[]).map(l=>h('span',null,h('b',null,l[0]),h('i',null,l[1]))));
  const fr=h('div',{class:'fs-frame',style:`aspect-ratio:${u.aspect}`},c,lbl,h('span',{class:'fs-bar-busy','aria-hidden':'true'}));
  const ov=Object.entries(u.overrides||{}).map(([k,v])=>h('div',{class:'ovr'},h('a',{href:'#'+k},EFX[k].code),h('span',null,Object.entries(v).map(([a,b])=>`${a} ${typeof b==='object'?JSON.stringify(b):b}`).join(' · '))));
  const jl=(JOBS.find(j=>j[0]===u.job)||[])[1];
  ugrid.append(h('article',{class:'fs-ucard'+(u.span===2?' wide':''),'data-job':u.job||'','data-u':u.id},fr,h('div',{class:'cap'},h('span',{class:'code'},'U-'+String(i+1).padStart(2,'0')+(jl?' · '+jl:'')+(u.zoom>1?' · '+u.zoom+'×':'')+(u.light?' · light '+u.light.el+'°':'')),h('b',null,u.title),h('p',null,u.sub),h('div',{class:'chips'},u.uses.map(id=>h('a',{href:'#'+id},EFX[id].code+' '+EFX[id].name))),ov.length?h('details',null,h('summary',null,'overrides'),h('div',{class:'fs-ovs'},ov)):null)));
  register('u:'+u.id,c,fr,uJob(u,c),null,2); });
live.append(UG);
/* row-reading masonry: each card spans as many 6 px grid rows as its own height (aspect + caption) needs */
/* phones: the first 8 cards, then one button; captions clamp to two lines, tap to read */
if(matchMedia('(max-width:760px)').matches){ const cards=$$('.fs-ucard',ugrid); if(cards.length>8){ cards.slice(8).forEach(c=>c.classList.add('fold')); const more=h('button',{class:'fs-umore',type:'button'},'Show all '+cards.length+' usages'); more.onclick=()=>{ cards.forEach(c=>c.classList.remove('fold')); more.remove(); }; UG.append(more); jbar.addEventListener('click',()=>{ cards.forEach(c=>c.classList.remove('fold')); more.remove(); }); }
  $$('.fs-ucard .cap p',ugrid).forEach(p=>p.addEventListener('click',()=>p.classList.toggle('open'))); }
function fitU(){ if(getComputedStyle(ugrid).display!=='grid') return; $$('.fs-ucard',ugrid).forEach(c=>{ if(c.hidden) return; const n=Math.ceil(c.getBoundingClientRect().height/6); if(c._rows!==n){ c._rows=n; c.style.gridRowEnd='span '+n; } }); };
if(typeof ResizeObserver!=='undefined'){ const ro=new ResizeObserver(()=>requestAnimationFrame(fitU)); $$('.fs-ucard',ugrid).forEach(c=>ro.observe(c)); } fitU();

/* ══════════ bar: history · link · params · reset · loupe ══════════ */
const bar=$('#fs-bar');
$('#fs-loupe').addEventListener('click',e=>{ UI.loupe=!UI.loupe; e.currentTarget.setAttribute('aria-pressed',String(UI.loupe)); if(!UI.loupe) loupe.style.display='none'; });
$('#fs-copyset').addEventListener('click',e=>copy(JSON.stringify({set:SET.set,title:SET.title,light:lightR(),effects:Object.fromEntries(SET.effects.map(x=>[x.id,roundP(x,S[x.id])]))},null,2),e.currentTarget));
const restoreAll=()=>{ save(); syncPucks(); $$('.fs-dials').forEach(d=>d._sync&&d._sync()); SET.effects.forEach(e=>{ blocks[e.id].updSpec(); blocks[e.id].updOn(); blocks[e.id].updFeed(); blocks[e.id].updPre(); blocks[e.id].wedgeOff(); }); UI.dragging=false; refresh(allKeys(),false); };
const undo=()=>{ if(HIST.i<=0) return; HIST.i--; applySnap(clone(HIST.list[HIST.i])); restoreAll(); updHist(); };
const redo=()=>{ if(HIST.i>=HIST.list.length-1) return; HIST.i++; applySnap(clone(HIST.list[HIST.i])); restoreAll(); updHist(); };
$('#fs-undo').addEventListener('click',undo); $('#fs-redo').addEventListener('click',redo);
document.addEventListener('keydown',ev=>{ const t=ev.target; if(t&&(t.type==='number'||t.type==='text'||t.tagName==='TEXTAREA'||t.isContentEditable)) return; if(!(ev.metaKey||ev.ctrlKey)) return; const k=ev.key.toLowerCase(); if(k==='z'&&!ev.shiftKey){ ev.preventDefault(); undo(); } else if((k==='z'&&ev.shiftKey)||k==='y'){ ev.preventDefault(); redo(); } });
$('#fs-link').addEventListener('click',e=>{ const u=location.origin+location.pathname+'?s='+b64e(JSON.stringify(diffSnap())); try{ history.replaceState(null,'',u+location.hash); }catch(_){} copy(u,e.currentTarget); });
$('#fs-resetall').addEventListener('click',()=>{ S=clone(DEF); LIGHT=clone(DEF_LIGHT); commit(); restoreAll(); });

/* ══════════ loupe: 4× device pixels, nearest-neighbor, on any plate (fine pointers) ══════════ */
const loupe=h('canvas',{class:'fs-loupe',width:10,height:10}); document.body.append(loupe);
if(COARSE){ const b=$('#fs-loupe'); if(b) b.hidden=true; }
document.addEventListener('pointermove',ev=>{ if(!UI.loupe||ev.pointerType==='touch') return; const t=ev.target; if(!(t instanceof HTMLCanvasElement)||!t.classList.contains('fs-cv')){ loupe.style.display='none'; return; }
  const r=t.getBoundingClientRect(), dpr=Math.min(2,devicePixelRatio||1), S_=176, Z=4; loupe.width=loupe.height=Math.round(S_*dpr); const g=loupe.getContext('2d'); g.imageSmoothingEnabled=false;
  const sx=(ev.clientX-r.left)/r.width*t.width, sy=(ev.clientY-r.top)/r.height*t.height, sw=loupe.width/Z; g.fillStyle='#fff'; g.fillRect(0,0,loupe.width,loupe.height); g.drawImage(t,sx-sw/2,sy-sw/2,sw,sw,0,0,loupe.width,loupe.height);
  const lx=Math.min(innerWidth-S_-8,ev.clientX+18), ly=Math.min(innerHeight-S_-8,ev.clientY+18); loupe.style.display='block'; loupe.style.left=lx+'px'; loupe.style.top=ly+'px'; },{passive:true});

/* ══════════ start ══════════ */
let lastW=innerWidth; addEventListener('resize',()=>{ clearTimeout(window.__rt); window.__rt=setTimeout(()=>{ if(Math.abs(innerWidth-lastW)<40) return; lastW=innerWidth; targets.forEach(T=>{ T.dirty=true; }); targets.forEach((T,k)=>{ if(T.visible) request(k,false); }); SET.effects.forEach(e=>{ const b=blocks[e.id]; if(b.B.pin) b.B.pin.el.remove(), b.B.pin=null; }); },220); });
// watchdog: a visible canvas that never painted (a dropped job) gets requested again
setInterval(()=>{ if(!READY) return; targets.forEach((T,k)=>{ if(T.visible&&!T.lastPainted&&!pending.has(k)&&!pool.some(w=>w.busy===k)) request(k,false); }); },1500);
(document.fonts&&document.fonts.load?Promise.all([document.fonts.load('800 40px Archivo'),document.fonts.load('500 12px "JetBrains Mono"'),document.fonts.load('400 12px "Courier Prime"'),document.fonts.load('700 12px "Courier Prime"')]).catch(()=>{}):Promise.resolve()).then(()=>{ READY=true; status(''); targets.forEach((T,k)=>{ if(T.visible) request(k,false); }); });
commit();
window.__fxsheet={undo,redo,hist:()=>HIST.i,get S(){return S;},DEF,get light(){return LIGHT;},targets,blocks,idle:()=>!pending.size&&!pool.some(w=>w.busy)&&!pump.t,workers:()=>useWorkers&&pool.length};
})();
