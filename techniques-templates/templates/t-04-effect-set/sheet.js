/* T-04 · Effect set · sheet runtime · ø co. Techniques & Templates
   Generic: reads window.FXSET (set.js) and builds the rack, one technique block per effect (plate + dials +
   recipe + limits + live spec), and the usage gallery. Nothing in here knows what an effect draws.
   One params object per effect (S[id]); dials write it, plates/rack/usages/spec all read it.
   Dragging renders a half-resolution draft; releasing renders at device px and re-runs the usages that use it. */
(function(){
'use strict';
const FX=window.FX, SET=window.FXSET, $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const h=(tag,attrs,...kids)=>{ const n=document.createElement(tag); for(const k in attrs||{}){ const v=attrs[k]; if(k==='class')n.className=v; else if(k==='html')n.innerHTML=v; else if(k.startsWith('on'))n.addEventListener(k.slice(2),v); else if(v!=null&&v!==false)n.setAttribute(k,v===true?'':v); } for(const c of kids.flat()) if(c!=null) n.append(c.nodeType?c:document.createTextNode(c)); return n; };
const clone=o=>JSON.parse(JSON.stringify(o)), esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=(v,p)=>{ if(typeof v!=='number') return String(v); const st=p&&p.step||.01; const d=st>=1?0:st>=.1?1:st>=.01?2:3; return v.toFixed(d); };
const GROUPS={density:'Density · marks',dropoff:'Dropoff · ease',color:'Color · OKLCH',mixing:'Mixing rule',mask:'Mask · edge',seed:'Seed'};
const EFX=Object.fromEntries(SET.effects.map(e=>[e.id,e]));
const DEF={}; SET.effects.forEach(e=>{ DEF[e.id]={}; e.params.forEach(p=>DEF[e.id][p.key]=clone(p.value)); });
const KEY='tt-t04:'+SET.code+':'+SET.set+':v1';
let S=clone(DEF); try{ const j=JSON.parse(localStorage.getItem(KEY)||'null'); if(j) for(const id in DEF) S[id]=Object.assign({},DEF[id],j[id]||{}); }catch(e){}
const UI={view:'composite',loupe:false,follow:true};
const save=(()=>{ let t; return ()=>{ clearTimeout(t); t=setTimeout(()=>{ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} },300); }; })();

/* ── job queue: one job per frame, drafts first ── */
const Q=new Map(); let draft=null, busy=false;
const pump=()=>{ if(busy) return; busy=true; requestAnimationFrame(()=>{ busy=false; let job=null; if(draft){ job=draft; draft=null; } else { const it=Q.entries().next(); if(!it.done){ Q.delete(it.value[0]); job=it.value[1]; } }
  if(job){ try{ job(); }catch(err){ console.error(err); } pump(); } else { $('#fs-status').textContent='idle'; } }); };
const queue=(k,fn)=>{ Q.delete(k); Q.set(k,fn); $('#fs-status').textContent='rendering'; pump(); };
const queueDraft=fn=>{ draft=fn; $('#fs-status').textContent='draft'; pump(); };

/* ── render one effect into a canvas ── */
const paint=(canvas,R,W,H,view)=>{ const ctx=canvas.getContext('2d'); if(view==='coverage') FX.grayImage(ctx,R.cov,W,H); else if(view==='mask') FX.grayImage(ctx,R.mask,W,H); else FX.toImage(ctx,R.lin,W,H); };
const renderEffect=(e,canvas,scale,view)=>{ const {W,H,dpr}=FX.fit(canvas,scale); const t0=performance.now(); const R=e.run(S[e.id],W,H,dpr); paint(canvas,R,W,H,view); return {ms:performance.now()-t0,W,H,marks:R.marks,unit:R.markUnit||'dots',inks:R.inks}; };
const P=(u)=>id=>Object.assign({},UI.follow?S[id]:DEF[id],(u.overrides||{})[id]||{});

/* ── dials ── */
const curveSVG=(e)=>{ const N=48; let d=''; for(let i=0;i<=N;i++){ const t=i/N, y=FX.ease(e,t); d+=(i?'L':'M')+(2+t*92).toFixed(1)+' '+(46-y*42).toFixed(1); } return `<svg viewBox="0 0 96 48" class="fs-curve" aria-hidden="true"><path d="M2 46H94M2 4V46" class="ax"/><path d="M2 46L94 4" class="dg"/><path d="${d}" class="cv"/></svg>`; };
const trackBG=(e,p)=>{ // gradient track for OKLCH sliders
  if(!p.ink) return ''; const o=S[e.id], L=o[p.ink+'L'], C=o[p.ink+'C'], hh=o[p.ink+'h']; const k=p.key.slice(-1);
  const stops=[]; for(let i=0;i<=12;i++){ const t=i/12; const v=k==='L'?[t,C,hh]:k==='C'?[L,t*.37,hh]:[L,C,t*360]; stops.push(FX.ink(...v).hex); }
  return `linear-gradient(90deg,${stops.join(',')})`; };
const okWhen=(e,p)=>!p.when||Object.entries(p.when).every(([k,vs])=>vs.includes(S[e.id][k]));
function buildDials(e,host,onInput,onChange){ host.innerHTML=''; const groups={};
  e.params.forEach(p=>{ (groups[p.group]=groups[p.group]||[]).push(p); });
  Object.keys(GROUPS).forEach(g=>{ if(!groups[g]) return; const box=h('div',{class:'fs-grp','data-g':g},h('div',{class:'fs-gh'},h('span',null,GROUPS[g]),h('i',null,String(groups[g].length))));
    let lastInk=null;
    groups[g].forEach(p=>{
      if(p.ink&&p.ink!==lastInk){ lastInk=p.ink; box.append(h('div',{class:'fs-ink','data-ink':p.ink},h('b'),h('span',{class:'nm'},p.label.split(' · ')[0]),h('code'),h('em'))); }
      const row=h('div',{class:'fs-row t-'+p.type,'data-k':p.key,title:p.note||''});
      const lab=h('label',{title:(p.note||'')+' · double-click to reset'},p.ink?p.label.split(' · ')[1]:p.label); lab.addEventListener('dblclick',()=>{ S[e.id][p.key]=clone(DEF[e.id][p.key]); sync(); onChange(p); });
      row.append(lab);
      if(p.type==='range'){ const tr=h('div',{class:'fs-track'}); const span=p.max-p.min;
        (p.limits||[]).forEach(([a,b,why])=>tr.append(h('span',{class:'lim',style:`left:${(a-p.min)/span*100}%;width:${(b-a)/span*100}%`,title:why})));
        tr.append(h('span',{class:'def',style:`left:${(DEF[e.id][p.key]-p.min)/span*100}%`,title:'default '+fmt(DEF[e.id][p.key],p)}));
        const inp=h('input',{type:'range',min:p.min,max:p.max,step:p.step,value:S[e.id][p.key],'aria-label':p.label});
        inp.addEventListener('input',()=>{ S[e.id][p.key]=+inp.value; out.textContent=fmt(+inp.value,p)+(p.unit?' '+p.unit:''); syncInk(); onInput(p); });
        inp.addEventListener('change',()=>onChange(p)); tr.append(inp); const out=h('output',null,fmt(S[e.id][p.key],p)+(p.unit?' '+p.unit:'')); row.append(tr,out);
        row._sync=()=>{ inp.value=S[e.id][p.key]; out.textContent=fmt(S[e.id][p.key],p)+(p.unit?' '+p.unit:''); if(p.ink) tr.style.setProperty('--tbg',trackBG(e,p)); tr.classList.toggle('grad',!!p.ink); }; }
      else if(p.type==='select'){ const seg=h('div',{class:'fs-seg',role:'group','aria-label':p.label});
        p.options.forEach(v=>seg.append(h('button',{type:'button','data-v':v,onclick:()=>{ S[e.id][p.key]=v; sync(); onInput(p); onChange(p); }},v))); row.append(seg,h('output'));
        row._sync=()=>$$('button',seg).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===S[e.id][p.key]))); }
      else if(p.type==='ease'){ const sel=h('select',{'aria-label':p.label}); Object.entries(FX.EASES).forEach(([k,c])=>sel.append(h('option',{value:k},c.label)));
        const kin=h('input',{type:'range',min:.3,max:8,step:.05,'aria-label':p.label+' k'}); const graph=h('span',{class:'fs-gw'}); const out=h('output');
        sel.addEventListener('change',()=>{ S[e.id][p.key]=[sel.value,S[e.id][p.key][1]]; row._sync(); onInput(p); onChange(p); });
        kin.addEventListener('input',()=>{ S[e.id][p.key]=[S[e.id][p.key][0],+kin.value]; row._sync(); onInput(p); }); kin.addEventListener('change',()=>onChange(p));
        const wrap=h('div',{class:'fs-ease'},sel,kin); row.append(wrap,out,graph);
        row._sync=()=>{ const v=S[e.id][p.key]; sel.value=v[0]; kin.value=v[1]; const hasK=FX.EASES[v[0]]&&FX.EASES[v[0]].k; kin.disabled=!hasK; out.textContent=hasK?'k '+(+v[1]).toFixed(2):'—'; graph.innerHTML=curveSVG(v); }; }
      box.append(row); });
    if(g==='mixing'){ box.append(h('div',{class:'fs-mixstrip'},h('canvas',{width:10,height:10,'aria-label':'ground to ink in four mix spaces'}),h('div',{class:'lbl'},['oklab','oklch','linear','srgb'].map(s=>h('span',{'data-s':s},s))))); }
    host.append(box); });
  function syncInk(){ $$('.fs-ink',host).forEach(n=>{ const p=n.dataset.ink, o=S[e.id], ink=FX.ink(o[p+'L'],o[p+'C'],o[p+'h']); $('b',n).style.background=ink.hex; $('code',n).textContent=ink.css+' · '+ink.hex; $('em',n).textContent=ink.mapped?'chroma reduced to fit sRGB (asked '+ink.Creq.toFixed(3)+')':''; });
    $$('.fs-row',host).forEach(r=>{ const p=e.params.find(q=>q.key===r.dataset.k); if(p&&p.ink){ const tr=$('.fs-track',r); tr.style.setProperty('--tbg',trackBG(e,p)); } });
    mixStrip(); }
  function mixStrip(){ const c=$('.fs-mixstrip canvas',host); if(!c) return; const r=c.getBoundingClientRect(); const dpr=Math.min(2,devicePixelRatio||1); const W=Math.max(40,Math.round(r.width*dpr)), H=Math.round(4*11*dpr); c.width=W; c.height=H;
    const o=S[e.id], pre=(e.params.find(p=>p.ink)||{}).ink; if(!pre) return; const ink=FX.ink(o[pre+'L'],o[pre+'C'],o[pre+'h']); const sp=['oklab','oklch','linear','srgb'], cur=o.mix||o.space;
    const g=c.getContext('2d'), img=g.createImageData(W,H), d=img.data, px=[0,0,0]; for(let r2=0;r2<4;r2++) for(let x=0;x<W;x++){ px[0]=px[1]=px[2]=1; FX.mixInto(px,ink,x/(W-1),sp[r2]); for(let y=Math.round(r2*11*dpr);y<Math.round((r2*11+9)*dpr);y++){ const j=(y*W+x)*4; d[j]=FX.enc(px[0]);d[j+1]=FX.enc(px[1]);d[j+2]=FX.enc(px[2]);d[j+3]=255; } } g.putImageData(img,0,0);
    $$('.fs-mixstrip .lbl span',host).forEach(s=>s.classList.toggle('on',s.dataset.s===cur)); }
  function sync(){ $$('.fs-row',host).forEach(r=>{ r._sync&&r._sync(); const p=e.params.find(q=>q.key===r.dataset.k); r.classList.toggle('off',!okWhen(e,p)); }); syncInk(); }
  host._sync=sync; sync(); return sync; }

/* ── page build ── */
const nav=$('#nav'); if(nav&&window.TT) nav.innerHTML=`<a class="brand" href="../../index.html">${TT.mark}<span class="wm">IMP<i>Ø</i>SSIBLE</span></a><span class="crumb"><a href="../../index.html#templates">Techniques &amp; Templates</a><span class="sep">/</span><b>${esc(SET.title)}</b><span class="code">${esc(SET.code)}</span></span><span class="pager"><span>${esc(SET.code)} · template</span><a href="../../index.html#templates">index</a></span>`;
document.documentElement.classList.add('js');
const live=$('#fs-live'); live.innerHTML='';
const plates={}; // id -> {canvas, stat, rackCanvas, rackStat, sync}
const fmtN=n=>n>=1e4?(n/1e3).toFixed(1)+'k':String(n);

// rack
const rack=h('section',{class:'fs-rack','aria-label':'The set'});
SET.effects.forEach(e=>{ const c=h('canvas',{class:'fs-cv','aria-label':e.name}); const st=h('span',{class:'st'},'—');
  rack.append(h('a',{class:'fs-cell',href:'#'+e.id},h('div',{class:'fs-frame'},c),h('div',{class:'cap'},h('span',{class:'code'},e.code),h('b',null,e.name),st)));
  plates[e.id]={rackCanvas:c,rackStat:st}; });
live.append(rack);

// technique blocks
SET.effects.forEach((e,ix)=>{ const pl=plates[e.id]; const cv=h('canvas',{class:'fs-cv','aria-label':e.name+' plate'}); const stat=h('div',{class:'fs-stat'}); const dials=h('div',{class:'fs-dials'});
  const spec=h('pre',{class:'fs-spec'}); const sec=h('section',{class:'fs-fx',id:e.id,'data-fx':e.id});
  const copy=(txt,btn)=>{ (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>{ const t=btn.textContent; btn.textContent='copied'; setTimeout(()=>btn.textContent=t,900); }).catch(()=>{ prompt('Copy',txt); }); };
  const specObj=()=>({effect:e.id,code:e.code,name:e.name,set:SET.set,units:'CSS px; rendered at device px (dpr ≤ 2)',params:S[e.id]});
  const call=()=>`// ${e.code} ${e.name} — fx.js + set.js loaded\nconst fx = FXSET.effects.find(e => e.id === '${e.id}');\nconst dpr = Math.min(2, devicePixelRatio), W = Math.round(cssW * dpr), H = Math.round(cssH * dpr);\nconst R = fx.run(${JSON.stringify(S[e.id])}, W, H, dpr /*, { base, clip, field } */);\nFX.toImage(canvas.getContext('2d'), R.lin, W, H);   // R.cov, R.mask, R.marks also returned`;
  const bReset=h('button',{type:'button',onclick:()=>{ S[e.id]=clone(DEF[e.id]); dials._sync(); changed(); }},'reset');
  const bSeed=h('button',{type:'button',onclick:()=>{ S[e.id].seed=1+Math.floor(Math.random()*999); dials._sync(); changed(); }},'new seed');
  const bP=h('button',{type:'button'},'copy params'); bP.onclick=()=>copy(JSON.stringify(specObj(),null,2),bP);
  const bC=h('button',{type:'button'},'copy call'); bC.onclick=()=>copy(call(),bC);
  sec.append(h('header',{class:'fs-fxh'},h('div',{class:'id'},h('span',{class:'code'},e.code),h('h2',null,e.name)),h('p',{class:'sub'},e.sub),h('div',{class:'act'},bReset,bSeed,bP,bC)));
  sec.append(h('div',{class:'fs-fxb'},h('div',{class:'fs-stage'},h('div',{class:'fs-frame big'},cv),stat),dials));
  const lim=h('table',{class:'fs-lim'},h('thead',null,h('tr',null,h('th',null,'Param'),h('th',null,'Range'),h('th',null,'What happens'))),h('tbody',null,e.limits.map(l=>h('tr',null,h('td',null,l[0]),h('td',{class:'m'},l[1]),h('td',null,l[2])))));
  sec.append(h('div',{class:'fs-fxf'},h('div',null,h('h3',null,'Recipe'),h('ol',{class:'fs-rec'},e.recipe.map(r=>h('li',null,r)))),h('div',null,h('h3',null,'Limits'),lim),h('div',null,h('h3',null,'Params · live'),spec)));
  live.append(sec);
  Object.assign(pl,{canvas:cv,stat,spec,specObj});
  const drawFull=()=>{ const r=renderEffect(e,cv,1,UI.view); stat.innerHTML=`<span>${r.W} × ${r.H} px</span><span><b>${fmtN(r.marks)}</b> ${r.unit}</span><span>${r.ms.toFixed(0)} ms</span><span>device px · ${UI.view}</span>`; pl.drawn=true; };
  const drawDraft=()=>{ const r=renderEffect(e,cv,.5,UI.view); stat.innerHTML=`<span>${r.W} × ${r.H} px</span><span><b>${fmtN(r.marks)}</b> ${r.unit}</span><span>${r.ms.toFixed(0)} ms</span><span class="dr">draft · ½ res</span>`; };
  const drawRack=()=>{ const r=renderEffect(e,pl.rackCanvas,1,'composite'); pl.rackStat.textContent=fmtN(r.marks)+' '+r.unit; };
  pl.full=drawFull; pl.rack=drawRack;
  const updSpec=()=>{ spec.textContent=JSON.stringify(specObj(),null,2); };
  const changed=()=>{ updSpec(); save(); queue(e.id,drawFull); queue(e.id+':rack',drawRack); SET.usages.forEach(u=>{ if(u.uses.includes(e.id)&&UI.follow) queue('u:'+u.id,()=>drawUsage(u)); }); };
  const dials_=buildDials(e,dials,()=>{ dials._sync(); updSpec(); queueDraft(drawDraft); },()=>{ dials._sync(); changed(); });
  updSpec(); });

// usage gallery
const UG=h('section',{class:'fs-usages',id:'usages'});
const fol=h('button',{type:'button','aria-pressed':'true',onclick:()=>{ UI.follow=!UI.follow; fol.setAttribute('aria-pressed',String(UI.follow)); fol.textContent=UI.follow?'follow the dials':'defaults only'; SET.usages.forEach(u=>queue('u:'+u.id,()=>drawUsage(u))); }},'follow the dials');
UG.append(h('header',{class:'fs-uh'},h('div',null,h('span',{class:'code'},'Usages'),h('h2',null,'Where the set goes')),h('p',{class:'sub'},'Each card runs the same effect functions with the live dials, merged with the card\'s own overrides (listed under it). Tune a plate above and the cards that use it redraw.'),h('div',{class:'act'},fol)));
const ugrid=h('div',{class:'fs-ugrid'}); UG.append(ugrid);
const ucv={};
SET.usages.forEach((u,i)=>{ const c=h('canvas',{class:'fs-cv','aria-label':u.title}); const lbl=h('div',{class:'fs-ulbl'},(u.labels||[]).map(l=>h('span',null,h('b',null,l[0]),h('i',null,l[1]))));
  if(u.id==='u-meter') lbl.classList.add('rows');
  const ov=h('pre',{class:'fs-ov'},JSON.stringify(u.overrides,null,1).replace(/\n\s*/g,' '));
  ugrid.append(h('article',{class:'fs-ucard'},h('div',{class:'fs-frame',style:`aspect-ratio:${u.aspect}`},c,lbl),h('div',{class:'cap'},h('span',{class:'code'},'U-0'+(i+1)),h('b',null,u.title),h('p',null,u.sub),h('div',{class:'chips'},u.uses.map(id=>h('a',{href:'#'+id},EFX[id].code+' '+EFX[id].name))),h('details',null,h('summary',null,'overrides'),ov))));
  ucv[u.id]=c; });
live.append(UG);
function drawUsage(u){ const c=ucv[u.id]; const {W,H,dpr}=FX.fit(c,1); const R=u.run(c.getContext('2d'),W,H,dpr,P(u)); paint(c,R,W,H,'composite'); }

/* ── bar: view, loupe, copy set, reset ── */
const bar=$('#fs-bar');
$$('[data-view]',bar).forEach(b=>b.addEventListener('click',()=>{ UI.view=b.dataset.view; $$('[data-view]',bar).forEach(x=>x.setAttribute('aria-pressed',String(x===b))); SET.effects.forEach(e=>queue(e.id,plates[e.id].full)); }));
$('#fs-loupe').addEventListener('click',e=>{ UI.loupe=!UI.loupe; e.currentTarget.setAttribute('aria-pressed',String(UI.loupe)); if(!UI.loupe) loupe.style.display='none'; });
$('#fs-copyset').addEventListener('click',e=>{ const b=e.currentTarget, t=JSON.stringify({set:SET.set,title:SET.title,effects:S},null,2); (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>{ b.textContent='copied'; setTimeout(()=>b.textContent='copy set params',900); }).catch(()=>prompt('Copy',t)); });
$('#fs-resetall').addEventListener('click',()=>{ S=clone(DEF); save(); $$('.fs-dials').forEach(d=>d._sync&&d._sync()); SET.effects.forEach(e=>{ plates[e.id].spec.textContent=JSON.stringify(plates[e.id].specObj(),null,2); queue(e.id,plates[e.id].full); queue(e.id+':rack',plates[e.id].rack); }); SET.usages.forEach(u=>queue('u:'+u.id,()=>drawUsage(u))); });

/* ── loupe: 4× device pixels, nearest-neighbor, follows the pointer on any plate ── */
const loupe=h('canvas',{class:'fs-loupe',width:10,height:10}); document.body.append(loupe);
document.addEventListener('pointermove',ev=>{ if(!UI.loupe) return; const t=ev.target; if(!(t instanceof HTMLCanvasElement)||!t.classList.contains('fs-cv')){ loupe.style.display='none'; return; }
  const r=t.getBoundingClientRect(), dpr=Math.min(2,devicePixelRatio||1), S_=176, Z=4; loupe.width=loupe.height=Math.round(S_*dpr); const g=loupe.getContext('2d'); g.imageSmoothingEnabled=false;
  const sx=(ev.clientX-r.left)/r.width*t.width, sy=(ev.clientY-r.top)/r.height*t.height, sw=loupe.width/Z; g.fillStyle='#fff'; g.fillRect(0,0,loupe.width,loupe.height); g.drawImage(t,sx-sw/2,sy-sw/2,sw,sw,0,0,loupe.width,loupe.height);
  loupe.style.display='block'; loupe.style.left=(ev.clientX+18)+'px'; loupe.style.top=(ev.clientY+18)+'px'; },{passive:true});

/* ── first paint: rack, then blocks and usages as they scroll into view ── */
const start=()=>{ SET.effects.forEach(e=>queue(e.id+':rack',plates[e.id].rack));
  const io=new IntersectionObserver(es=>es.forEach(en=>{ if(!en.isIntersecting) return; io.unobserve(en.target); const id=en.target.dataset.fx; if(id) queue(id,plates[id].full); else if(en.target.dataset.u){ const u=SET.usages.find(x=>x.id===en.target.dataset.u); queue('u:'+u.id,()=>drawUsage(u)); } }),{rootMargin:'400px'});
  $$('.fs-fx').forEach(s=>io.observe(s)); $$('.fs-ucard').forEach((c,i)=>{ c.dataset.u=SET.usages[i].id; io.observe(c); });
  let rt; addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(()=>{ SET.effects.forEach(e=>{ queue(e.id+':rack',plates[e.id].rack); if(plates[e.id].drawn) queue(e.id,plates[e.id].full); }); SET.usages.forEach(u=>queue('u:'+u.id,()=>drawUsage(u))); $$('.fs-dials').forEach(d=>d._sync&&d._sync()); },200); }); };
(document.fonts&&document.fonts.load?Promise.all([document.fonts.load('800 40px Archivo'),document.fonts.load('400 12px Inter')]).catch(()=>{}):Promise.resolve()).then(start);
window.__fxsheet={S,DEF,plates,queue,idle:()=>!busy&&!draft&&Q.size===0};
})();
