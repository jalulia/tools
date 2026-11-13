/* Techniques & Templates · plate runtime · ø co.
   Reads window.STUDY (one per page) and window.TT (manifest) and lays out three columns:
   notes (left: title, short description, one accordion), the plate (center: canvas, callouts, build sweep),
   and the control panel (right: View, Callouts, Motion, Color, Parameters, Export — same order on every page).
   Design notes: _shared/PLATE-UI.md. Everything is generated at runtime; the only bitmap is the inlined reference. */
(function(){
"use strict";
const S=window.STUDY; if(!S){document.body.textContent='no STUDY';return;}
const TT=window.TT||{entries:[],sections:[]}; const VOC=window.TT_VOCAB||{names:{},atoms:{},byAtom:{},byTechnique:{}};
const ROOT=document.body.dataset.root||'../../';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const px=v=>Math.round(v)+0.5;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=()=>innerWidth<=960;
const me=TT.entries.find(e=>e.id===S.id)||{id:S.id,section:'techniques',code:S.code,title:S.title,techniques:[]};
const section=TT.sections.find(s=>s.id===me.section)||{id:me.section,title:me.section};
const sib=TT.entries.filter(e=>e.section===me.section); const idx=sib.findIndex(e=>e.id===S.id);
const variantsOf=S=>(S.variants||[]).map(v=>({id:v.id,label:v.label,swatches:v.sw}));
const famName=f=>String(f||'').replace(/-/g,' ');
const ICON={ chev:'<svg class="chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M2.5 3.8L5 6.3l2.5-2.5"/></svg>', reset:'<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 6.3A3.9 3.9 0 1 0 3.4 3"/><path d="M2.6 1v2.4H5"/></svg>' };

/* ---------- nav: crumb + pager (no brand) ---------- */
(function(){ const n=$('nav'); if(!n)return; const prev=sib[idx-1], next=sib[idx+1];
  n.innerHTML=`<span class="crumb"><a href="${ROOT}index.html">Techniques &amp; Templates</a><span class="sep">/</span><a href="${ROOT}index.html#${esc(section.id)}">${esc(section.title)}</a><span class="sep">/</span><b>${esc(S.title)}</b><span class="code">${esc(S.code)}</span></span>
  <span class="pager">${prev?`<a href="${ROOT}${prev.path}index.html" title="Previous: ${esc(prev.code)} ${esc(prev.title)} (,)">← ${esc(prev.code)}</a>`:'<a class="off" aria-disabled="true">←</a>'}<a class="pos" href="${ROOT}index.html#${esc(section.id)}" title="All ${esc(section.title.toLowerCase())}"><span class="n">${idx+1}</span>&nbsp;of ${sib.length}</a>${next?`<a href="${ROOT}${next.path}index.html" title="Next: ${esc(next.code)} ${esc(next.title)} (.)">${esc(next.code)} →</a>`:'<a class="off" aria-disabled="true">→</a>'}</span>`; })();

/* ---------- notes column: title, description, one accordion ---------- */
(function(){ const el=$('copy'); const T=S.spec.techniques||[];
  const steps=(S.spec.pass_order||[]).map(s=>`<li><b>${esc(s.split(' · ')[0])}</b>${s.includes(' · ')?`<span>${esc(s.split(' · ').slice(1).join(' · '))}</span>`:''}</li>`).join('');
  const vrows=T.map(t=>`<li class="vr"><button type="button" data-t="${esc(t.id)}" title="Show where ${esc(t.name.toLowerCase())} was measured"><span class="vn">${esc(t.name)}</span><span class="vid">${esc(t.id)}</span></button><span class="at">${(t.atoms||[]).map(a=>`<a href="${ROOT}index.html#techniques?a=${encodeURIComponent(a)}" title="Every entry that uses ${esc(a)}">${esc(a)}</a>`).join('')}${S.techniques&&S.techniques[t.id]?`<a class="mod" href="lib/${esc(t.id)}.js" title="The lifted module">lib/${esc(t.id)}.js</a>`:''}</span></li>`).join('');
  const keys=[['R','Plate, reference, compare'],['V','Next palette'],['M',S.motion?'Play or pause motion':null],['L',S.live?'Interactive version':null],['Space','Replay the build'],['S','Open the spec'],['F','Expand the plate'],[', .','Previous, next study'],['/','Back to the index']].filter(k=>k[1]);
  const acc=(id,title,body,open)=>`<details class="acc" name="notes" id="${id}"${open?' open':''}><summary><span>${title}</span>${ICON.chev}</summary><div class="ab">${body}</div></details>`;
  el.innerHTML=`<p class="kicker"><span>${esc(S.code)}</span>${me.family?`<span>${esc(famName(me.family))}</span>`:''}</p><h1 class="title">${esc(S.title)}</h1>${S.lede?`<p class="lede">${esc(S.lede)}</p>`:''}<div class="body">${(S.body||[]).map(p=>`<p>${esc(p)}</p>`).join('')}</div>
  <div class="accs">
  ${steps?acc('aBuild','How it is built',`<ol class="steps">${steps}</ol>`,true):''}
  ${acc('aTech',`Techniques <i>${T.length}</i>`,`<p class="ah">Click one to light its callouts on the plate. The grey words are atoms: click one to see every study that uses it.</p><ul class="vocab" id="chips">${vrows}</ul>`,!steps)}
  ${acc('aRef','Reference and match',`<p class="src">${esc(S.source||'—')}</p><div class="fid" id="fid"></div>`)}
  ${acc('aStudy','Study',`<dl class="kv"><dt>Code</dt><dd>${esc(S.code)}</dd><dt>Section</dt><dd>${esc(section.title)} · ${idx+1} of ${sib.length}</dd>${me.family?`<dt>Family</dt><dd>${esc(famName(me.family))}</dd>`:''}<dt>Palettes</dt><dd>${(S.variants||[]).length||1}</dd><dt>Parameters</dt><dd>${(window.ART.paramLeaves?window.ART.paramLeaves(S.spec).length:0)||'—'}</dd><dt>Motion</dt><dd>${[S.motion?'loop':'',S.live?(S.liveLabel||'interactive').toLowerCase():''].filter(Boolean).join(' · ')||'still plate'}</dd><dt>Spec</dt><dd><a href="spec.json">spec.json</a></dd></dl>`)}
  ${acc('aRel','Related','<div class="rel" id="rel"></div>')}
  ${acc('aKeys','Keyboard',`<dl class="keys">${keys.map(k=>`<dt><kbd>${esc(k[0])}</kbd></dt><dd>${esc(k[1])}</dd>`).join('')}</dl>`)}
  </div>`;
  /* one section open at a time (the name attribute does this natively; this covers older engines) */
  el.querySelectorAll('details.acc').forEach(d=>d.addEventListener('toggle',()=>{ if(d.open)el.querySelectorAll('details.acc').forEach(o=>{ if(o!==d)o.open=false; }); }));
})();

/* ---------- spec panel ---------- */
const specEl=$('spec'), specPre=$('specpre');
const specFull=Object.assign({ id:S.id, code:S.code, title:S.title, section:me.section, variants:variantsOf(S) },S.spec);
const specJSON=JSON.stringify(specFull,null,2);
function hlJSON(s){ return esc(s).replace(/("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)|\b(true|false|null)\b/g,(m,str,col,num,lit)=>{ if(str)return col?`<span class="k">${str}</span>${col}`:`<span class="s">${str}</span>`; if(num)return `<span class="n">${num}</span>`; return `<span class="n">${lit}</span>`; }); }
specPre.innerHTML=hlJSON(specJSON); $('specid').textContent=S.id;
function openSpec(o){ specEl.classList.toggle('open',o); specEl.setAttribute('aria-hidden',o?'false':'true'); $('bSpec').classList.toggle('on',o); $('bSpec').textContent=o?'Close spec':'Open spec'; }
function hlTech(id){ const lines=specJSON.split('\n'); let out=[],on=false,depth=0; for(const ln of lines){ if(!on&&ln.includes(`"id": "${id}"`)){ on=true; depth=ln.search(/\S/); } if(on){ out.push(`<span class="hl">${hlJSON(ln)}</span>`); if(ln.search(/\S/)<=depth&&/^\s*\},?$/.test(ln))on=false; } else out.push(hlJSON(ln)); } specPre.innerHTML=out.join('\n'); const h=specPre.querySelector('.hl'); if(h&&specEl.classList.contains('open'))h.scrollIntoView({block:'center'}); }
let techFocus=null;
document.querySelectorAll('#chips button[data-t]').forEach(c=>{ c.onclick=()=>{ const id=c.dataset.t; const on=c.classList.contains('on'); document.querySelectorAll('#chips button[data-t]').forEach(x=>{ x.classList.remove('on'); x.setAttribute('aria-pressed','false'); }); if(on){ techFocus=null; } else { c.classList.add('on'); c.setAttribute('aria-pressed','true'); techFocus=id; hlTech(id); if(!noteOn)setNotes(true); } dirty=true; }; });

/* ---------- canvas + layout ---------- */
const cv=$('cv'), wrap=cv.parentElement, liveEl=$('live'), relEl=$('rel');
let ctx=cv.getContext('2d'), W=0,H=0,DPR=1;
const INK='#101014', INK50='rgba(16,16,20,0.5)', INK30='rgba(16,16,20,0.3)', GREY='#6B6B70', PAPER='#FFFFFF', ACC='#F4551E';
const FONT=s=>`${s}px "JetBrains Mono",ui-monospace,Menlo,monospace`;
const hasLS=('letterSpacing' in ctx); const track=(s,em)=>{ if(hasLS)ctx.letterSpacing=(s*em).toFixed(2)+'px'; };
function text(s,x,y,size,em,col,al){ ctx.font=FONT(size); track(size,em||0); ctx.fillStyle=col||INK; ctx.textAlign=al||'left'; ctx.textBaseline='alphabetic'; ctx.fillText(s,x,y); if(hasLS)ctx.letterSpacing='0px'; }
let fig={x:0,y:0,w:0,h:0}; const ar=S.ref.h/S.ref.w;
const artCache={}; let art=null, artKey='', artDone=false;
const variants=S.variants&&S.variants.length?S.variants:[{id:'ref',label:'As reference'}];
let vi=0;

/* ---------- color: palette presets + editable inks ----------
   An ink is a hex color the render actually reads from the variant (sw and spot are display-only, P is physics).
   Editing one swaps that value everywhere it appears in a copy of the variant; the copy gets a new id so the studies'
   own caches miss. Edits are kept per palette. */
const HEX=/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const norm=h=>{ h=h.toLowerCase(); return h.length===4?'#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3]:h; };
const SKIP=new Set(['id','label','sw','spot','P']);
function inksOf(V){ const map=new Map(); const walk=(v,path)=>{ if(typeof v==='string'){ if(HEX.test(v)){ const k=norm(v); if(!map.has(k))map.set(k,{hex:k,paths:[]}); map.get(k).paths.push(path); } return; } if(Array.isArray(v)){ v.forEach((x,i)=>walk(x,path.concat(i))); return; } if(v&&typeof v==='object')for(const k of Object.keys(v)){ if(!path.length&&SKIP.has(k))continue; walk(v[k],path.concat(k)); } }; walk(V,[]);
  const cnt={}; for(const k of map.values())for(const p of k.paths)cnt[p[0]]=(cnt[p[0]]||0)+1; const dom=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];
  for(const k of map.values()){ const i=k.paths.findIndex(p=>p[0]===dom); if(i>0)k.paths.unshift(k.paths.splice(i,1)[0]); }
  const sw=(V.sw||[]).map(norm); return [...map.values()].sort((a,b)=>{ const ia=sw.indexOf(a.hex), ib=sw.indexOf(b.hex); return (ia<0?99:ia)-(ib<0?99:ib); }); }
const inkName=p=>{ let q=p.slice(); let stop=false; if(q.length>=2&&typeof q[q.length-1]==='number'&&q[q.length-1]===1&&typeof q[q.length-2]==='number'){ q.pop(); stop=true; } /* [pos,'#hex'] ramp stop */
  if(q.length>1&&q[q.length-1]==='c')q.pop(); if(q.length>1&&/^(inks|colors)$/.test(q[0])&&typeof q[1]==='string')q=q.slice(1); if(q.length===2&&q[0]==='plates'&&typeof q[1]==='string')q=['plate '+q[1].toUpperCase()];
  const out=[]; q.forEach((s,i)=>{ if(typeof s==='number'){ const prev=out.length?out[out.length-1]:''; if(prev&&/s$/.test(prev)&&!/ss$/.test(prev))out[out.length-1]=prev.slice(0,-1)+' '+(s+1); else out.push(String(s+1)); } else out.push(String(s).replace(/([a-z])([A-Z0-9])/g,'$1 $2').toLowerCase()); });
  if(stop&&out.length>1&&/^\d+$/.test(out[out.length-1]))out[out.length-1]='stop '+out[out.length-1];
  const n=out.join(' · '); return n.charAt(0).toUpperCase()+n.slice(1); };
const inkEdits={}; /* vi → { origHex: newHex } */
const effCache={};
function variant(){ const V=variants[vi]; const E=inkEdits[vi]; if(!E||!Object.keys(E).length)return V; const key=vi+JSON.stringify(E); if(effCache[key])return effCache[key];
  const sub=v=>{ if(typeof v==='string'&&HEX.test(v)){ const k=norm(v); return E[k]||v; } if(Array.isArray(v))return v.map(sub); if(v&&typeof v==='object'){ const o={}; for(const k of Object.keys(v))o[k]=(k==='P')?v[k]:sub(v[k]); return o; } return v; };
  const C=sub(V); let h=0; for(const ch of key){ h=(h*31+ch.charCodeAt(0))|0; } C.id=V.id+'~'+(h>>>0).toString(36);
  if(Array.isArray(V.spot)){ const sh='#'+V.spot.map(c=>(c|0).toString(16).padStart(2,'0')).join(''); if(E[sh])C.spot=window.ART.hex(E[sh]); }
  return (effCache[key]=C); }

function layout(){ if(mobile()){ const w0=wrap.clientWidth; wrap.style.height=Math.round(Math.min(innerHeight*0.86,(w0-32)*ar+68))+'px'; } else wrap.style.height=''; const r=wrap.getBoundingClientRect(); DPR=Math.min(3,Math.max(1,devicePixelRatio||1)); W=r.width; H=r.height; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0);
  const mob=mobile(); const left=mob?16:40, top=mob?34:48, right=mob?16:40, bottom=mob?34:44;
  let bw=W-left-right, bh=H-top-bottom; let fw=bw, fh=fw*ar; if(fh>bh){ fh=bh; fw=fh/ar; }
  fig={x:Math.round(left+(bw-fw)/2),y:Math.round(top+(bh-fh)/2),w:Math.round(fw),h:Math.round(fh)};
  ensureArt(); placePoints(); placeLive(); }
let overrides={}; /* parameter overrides: { 'technique-id': { 'path': value } } */
function ensureArt(){ const k=fig.w+'x'+fig.h+'@'+DPR+'#'+variant().id+'#'+JSON.stringify(overrides); if(k===artKey&&art)return; artKey=k; if(artCache[k]){ art=artCache[k]; artDone=true; dirty=true; computeFidelity(); return; } renderArt(k); }
function renderArt(key){ const c=document.createElement('canvas'); c.width=Math.round(fig.w*DPR); c.height=Math.round(fig.h*DPR); const x=c.getContext('2d'); x.setTransform(DPR,0,0,DPR,0,0); x.fillStyle='#fff'; x.fillRect(0,0,fig.w,fig.h); artDone=false; dirty=true; busy(true);
  const t0=performance.now();
  const finish=()=>{ if(key!==artKey)return; artCache[key]=c; art=c; artDone=true; dirty=true; busy(false); console.info(`[${S.id}] ${variant().id} rendered in ${Math.round(performance.now()-t0)} ms`); computeFidelity(); };
  try{ const r=S.render(c,fig.w,fig.h,DPR,variant(),finish,overrides); if(r!==false&&S.render.length<6)finish(); }catch(e){ console.error(e); finish(); } }
function busy(o){ document.body.classList.toggle('drawing',o); }

/* ---------- points ---------- */
const P=(S.points||[]).slice(0,10).map((p,i)=>({num:10+i*2,u:p.u,v:p.v,d:p.d||'—',label:p.label||'',t:p.t||null,dir:p.dir||null,lock:-1,x:0,y:0}));
let links=[];
function placePoints(){ const Sz=9; for(const t of P){ t.x=fig.x+t.u*fig.w; t.y=fig.y+t.v*fig.h; }
  for(const t of P){ let dx,dy; if(t.dir){ dx=t.dir[0]; dy=t.dir[1]; } else { dx=t.u<0.5?-1:1; dy=t.v<0.35?-1:(t.v>0.65?1:0); }
    const L=Sz+22; const ex=t.x+dx*L, ey=t.y+(dy||0)*L*0.7; t.sx=dx; t.sy=dy||0; t.ex=ex; t.ey=ey; const lw=22,lh=14; t.lab={x:dx<0?ex-6-lw:ex+6,y:ey-lh/2,w:lw,h:lh}; }
  const n=P.length; links=[]; if(n>1){ const inT=new Array(n).fill(false); inT[0]=true; for(let k=1;k<n;k++){ let best=1e18,bi=-1,bj=-1; for(let i=0;i<n;i++)if(inT[i])for(let j=0;j<n;j++)if(!inT[j]){ const d=Math.hypot(P[i].x-P[j].x,P[i].y-P[j].y); if(d<best){best=d;bi=i;bj=j;} } inT[bj]=true; links.push([bi,bj]); } } }

/* ---------- callouts module ---------- */
const rowsEl=$('rows'), ctrEl=$('ctr'), readTxt=$('readtxt'), readCode=$('readcode'), fidEl=$('fid');
const techName=id=>{ const t=(S.spec.techniques||[]).find(q=>q.id===id); return t?t.name:(id||''); };
const rows=P.map(t=>{ const r=document.createElement('div'); r.className='r blank'; r.tabIndex=0; r.setAttribute('role','button'); r.innerHTML='<span class="rn"></span><span class="rd"></span><span class="rl"></span><span class="ruv"></span>'; r.onmouseenter=()=>setHover(t); r.onmouseleave=()=>setHover(null); r.onfocus=()=>setHover(t); r.onblur=()=>setHover(null); r.onclick=()=>select(t); r.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); select(t); } }; rowsEl.appendChild(r); return r; });
function rowText(r,t,uv,done){ const s=r.children; s[0].textContent=String(t.num); s[1].textContent=done?t.d:'—'; s[2].textContent=done?t.label:''; s[3].textContent=uv?uv[0].toFixed(2)+' · '+uv[1].toFixed(2):''; r.classList.toggle('blank',!done); r.title=done?`${t.label} · ${techName(t.t)}`:''; }
rows.forEach((r,i)=>rowText(r,P[i],null,false));
if(!P.length){ $('mNote').hidden=true; }
let hover=null, selected=null, dirty=true, noteOn=true;
function setHover(t){ hover=t; rows.forEach((r,i)=>r.classList.toggle('on',P[i]===(hover||selected))); showRead(hover||selected); dirty=true; }
function select(t){ selected=(selected===t)?null:t; rows.forEach((r,i)=>r.classList.toggle('on',P[i]===(hover||selected))); showRead(selected||hover); if(selected&&selected.t)hlTech(selected.t); dirty=true; }
function showRead(t){ if(!t){ readTxt.textContent='Hover or select a point.'; readCode.textContent=''; return; } const tech=(S.spec.techniques||[]).find(q=>q.id===t.t); readTxt.innerHTML=`<b>${t.num} · ${esc(t.label)}</b>${tech?`<span>${esc(tech.name)}</span>`:''}`; const show=v=>window.ART.isLeaf(v)?`${v.value}${v.unit?' '+v.unit:''}`:(typeof v==='object'?JSON.stringify(v):v); readCode.textContent=tech&&tech.params?Object.entries(tech.params).slice(0,6).map(([k,v])=>`${k}  ${show(v)}`).join('\n'):''; }
function setNotes(o){ noteOn=o; $('tNote').checked=o; document.body.classList.toggle('no-callouts',!o); dirty=true; }
$('tNote').onchange=()=>setNotes($('tNote').checked);
$('bPoints').onclick=()=>{ const p=$('pts'); p.hidden=!p.hidden; $('bPoints').setAttribute('aria-expanded',String(!p.hidden));  };

/* ---------- color module ---------- */
const palEl=$('pal'), inksEl=$('inks'); let inkAll=false;
(function(){ palEl.innerHTML=variants.map((v,i)=>`<button type="button" role="radio" aria-checked="${i===0}" data-i="${i}" class="pv${i===0?' on':''}"><span class="dot" aria-hidden="true"></span><span class="sws">${(v.sw||[]).slice(0,6).map(c=>`<i style="background:${esc(c)}"></i>`).join('')}</span><span class="pl">${esc(v.label)}</span><span class="ed" hidden>edited</span></button>`).join('');
  palEl.querySelectorAll('button').forEach(b=>b.onclick=()=>setVariant(+b.dataset.i));
  if(variants.length<2){ palEl.classList.add('single'); }
  $('bInkReset').onclick=()=>{ delete inkEdits[vi]; drawInks(); refresh(); };
  drawInks(); })();
function drawInks(){ const V=variants[vi], E=inkEdits[vi]||{}; const list=inksOf(V); const edited=Object.keys(E).length>0;
  $('bInkReset').hidden=!edited; palEl.querySelectorAll('button').forEach((b,i)=>{ const e=inkEdits[i]&&Object.keys(inkEdits[i]).length; b.querySelector('.ed').hidden=!e; });
  if(!list.length){ inksEl.innerHTML=''; $('colorHint').textContent=S.colorHint?S.colorHint:variants.length>1?'Pick a palette. This plate computes its colors from the optics, so the inks are not editable one by one.':'This plate computes its colors; there are no separate inks to edit.'; return; }
  $('colorHint').textContent=variants.length>1?'Pick a palette, then click any ink to change it. The plate redraws.':'Click any ink to change it. The plate redraws.';
  const CAP=8, shown=inkAll?list:list.slice(0,CAP);
  inksEl.innerHTML=`<div class="ih"><span>Inks in ${esc(V.label)}</span><i>${list.length}</i></div>`+shown.map(k=>{ const cur=E[k.hex]||k.hex; return `<div class="ink${E[k.hex]?' on':''}" data-h="${k.hex}"><label class="chip" style="--c:${cur}" title="Change ${esc(inkName(k.paths[0]))}"><input type="color" value="${cur}" aria-label="${esc(inkName(k.paths[0]))} color"></label><span class="nm" title="${esc(k.paths.map(inkName).join(', '))}">${esc(inkName(k.paths[0]))}${k.paths.length>1?`<i>+${k.paths.length-1}</i>`:''}</span><input class="hex" value="${cur.toUpperCase()}" maxlength="7" spellcheck="false" autocomplete="off" aria-label="${esc(inkName(k.paths[0]))} hex">${E[k.hex]?`<button type="button" class="rst" title="Back to ${k.hex.toUpperCase()}" aria-label="Reset this ink">${ICON.reset}</button>`:'<span class="rst-sp"></span>'}</div>`; }).join('')+(list.length>CAP?`<button type="button" class="more" id="inkMore">${inkAll?'Show fewer':`Show all ${list.length} inks`}</button>`:'');
  if($('inkMore'))$('inkMore').onclick=()=>{ inkAll=!inkAll; drawInks(); };
  inksEl.querySelectorAll('.ink').forEach(row=>{ const h=row.dataset.h, ci=row.querySelector('input[type=color]'), hx=row.querySelector('.hex'), chip=row.querySelector('.chip');
    const set=(v,commit)=>{ v=norm(v); const E2=(inkEdits[vi]??={}); if(v===h)delete E2[h]; else E2[h]=v; chip.style.setProperty('--c',v); hx.value=v.toUpperCase(); row.classList.toggle('on',v!==h); scheduleRefresh(commit); if(commit)drawInks(); };
    ci.oninput=()=>set(ci.value,false); ci.onchange=()=>set(ci.value,true);
    hx.onkeydown=e=>{ if(e.key==='Enter'){ let v=hx.value.trim(); if(!v.startsWith('#'))v='#'+v; if(HEX.test(v))set(v,true); else { hx.classList.add('bad'); setTimeout(()=>hx.classList.remove('bad'),600); } } else if(e.key==='Escape'){ hx.value=(E[h]||h).toUpperCase(); hx.blur(); } };
    hx.onblur=()=>{ let v=hx.value.trim(); if(!v.startsWith('#'))v='#'+v; if(HEX.test(v)&&norm(v)!==norm(E[h]||h))set(v,true); else hx.value=((inkEdits[vi]||{})[h]||h).toUpperCase(); };
    const rb=row.querySelector('.rst'); if(rb)rb.onclick=()=>set(h,true); }); }
function setVariant(i){ vi=(i+variants.length)%variants.length; palEl.querySelectorAll('button').forEach((b,k)=>{ b.classList.toggle('on',k===vi); b.setAttribute('aria-checked',String(k===vi)); }); inkAll=false; drawInks(); refresh(); }
let rto2=null; function scheduleRefresh(now){ clearTimeout(rto2); rto2=setTimeout(refresh,now?0:120); }
function refresh(){ if(liveOn&&typeof S.live==='function')liveEl.querySelector('iframe').srcdoc=S.live(variant(),overrides); if(!motionOn)ensureArt(); dirty=true; }

/* ---------- parameters module ---------- */
const ABBR={amp:'amplitude',var:'variation',sat:'saturation',deg:'angle',len:'length',freq:'frequency',corr:'correlation',rot:'rotation',mix:'mix',n:'count',r:'radius',R:'radius',dx:'offset x',dy:'offset y',lo:'low',hi:'high',min:'min',max:'max',w:'width',h:'height',x:'x',y:'y',u:'u',v:'v',px:'',cx:'center x',cy:'center y',k:'k',tol:'tolerance',dens:'density',pct:'percent',ref:'reference',hl:'highlight'};
const UNITS={u:'u',deg:'°',px:'px',pct:'%',s:'s'};
function human(path){ const segs=path.split('.'); const out=segs.map((s,j)=>{ let parts=s.split('_'); if(j===segs.length-1&&parts.length>1&&UNITS[parts[parts.length-1]])parts=parts.slice(0,-1); return parts.map(p=>ABBR[p]!==undefined?ABBR[p]:p.replace(/([a-z])([A-Z])/g,'$1 $2').toLowerCase()).filter(Boolean).join(' '); }).filter(Boolean).join(' · '); return out.charAt(0).toUpperCase()+out.slice(1); }
const niceStep=x=>{ const e=Math.pow(10,Math.floor(Math.log10(x))); const m=x/e; return (m>=5?5:m>=2?2:1)*e; };
function stepOf(l){ const [lo,hi]=l.range, span=hi-lo||1; const key=l.path.split('.').pop(); const intLike=Number.isInteger(l.value)&&((l.step&&Number.isInteger(l.step)&&l.step>=1)||(Number.isInteger(lo)&&Number.isInteger(hi)&&/seed|count|rays|rungs|spokes|octaves|cells|rows|cols|^n$|_n$|^n_/.test(key)));
  if(intLike)return 1; const fine=niceStep(span/1000); return l.step?Math.min(l.step,fine):fine; }
const decOf=st=>st>=1?0:Math.min(5,Math.max(0,-Math.floor(Math.log10(st)+1e-9)));
(function(){ const leaves=window.ART.paramLeaves?window.ART.paramLeaves(S.spec):[]; const host=$('prail');
  if(!leaves.length){ host.innerHTML='<p class="empty">This study has no adjustable values yet. Its numbers are in the spec.</p>'; $('mParams').classList.add('none'); return; }
  leaves.forEach(l=>{ l.st=stepOf(l); l.dec=decOf(l.st); l.unitS=l.unit||((/_deg$/.test(l.path))?'°':(/_u$/.test(l.path)?'u':(/_px$/.test(l.path)?'px':''))); });
  const decs=x=>{ const s=String(x); const i=s.indexOf('.'); return i<0?0:s.length-i-1; };
  leaves.forEach(l=>{ l.base=l.st>=1?0:Math.min(l.dec,Math.max(decs(l.value),decs(l.range[0]),decs(l.range[1]))); });
  const fmt=(l,v)=>{ if(l.st>=1)return String(Math.round(v)); let s=v.toFixed(Math.min(6,l.dec+1)); s=s.replace(/0+$/,''); const d=s.length-s.indexOf('.')-1; if(d<l.base)s=v.toFixed(l.base); if(s.endsWith('.'))s=s.slice(0,-1); return s; };
  const groups=[]; for(const l of leaves){ let g=groups.find(g=>g.tech===l.tech); if(!g){ const t=(S.spec.techniques||[]).find(q=>q.id===l.tech)||{}; g={tech:l.tech,name:t.name||l.tech,short:l.short||'',limits:t.limits||'',items:[]}; groups.push(g); } g.items.push(l); }
  host.innerHTML=groups.map((g,gi)=>`<div class="pg" data-g="${gi}"><button type="button" class="pgh" aria-expanded="true"><span class="pgn">${esc(g.name)}</span><span class="pgc"><i class="chg" hidden></i>${g.items.length}</span>${ICON.chev}</button><div class="pgb">${g.limits?`<p class="lim">${esc(g.limits)}</p>`:''}${g.items.map(l=>{ const i=leaves.indexOf(l); return `<div class="prm" data-i="${i}"><label class="lb" for="pr${i}" title="${esc(l.note||human(l.path))}"><span class="nm">${esc(human(l.path))}</span>${human(l.path).toLowerCase().replace(/ · /g,'.').replace(/ /g,'_')!==l.path.toLowerCase()?`<span class="key">${esc(l.path)}</span>`:''}</label><input id="pr${i}" type="range" min="${l.range[0]}" max="${l.range[1]}" step="${l.st}" value="${l.value}" aria-label="${esc(human(l.path))}"${l.note?` title="${esc(l.note)}"`:''}><span class="vf"><input class="num" value="${fmt(l,l.value)}" inputmode="decimal" spellcheck="false" autocomplete="off" aria-label="${esc(human(l.path))} value"><span class="un">${esc(l.unitS)}</span></span><button type="button" class="rst" tabindex="-1" title="Back to ${fmt(l,l.value)}${l.unitS?' '+esc(l.unitS):''}" aria-label="Reset ${esc(human(l.path))}">${ICON.reset}</button></div>`; }).join('')}<button type="button" class="pgr" hidden>Reset ${esc(g.name.toLowerCase())}</button></div></div>`).join('');
  let rto=null; const apply=(l,v,now)=>{ if(v===l.value){ if(overrides[l.tech]){ delete overrides[l.tech][l.path]; if(!Object.keys(overrides[l.tech]).length)delete overrides[l.tech]; } } else (overrides[l.tech]??={})[l.path]=v; marks(); clearTimeout(rto); rto=setTimeout(refresh,now?0:140); };
  const marks=()=>{ const n=Object.values(overrides).reduce((s,o)=>s+Object.keys(o).length,0); const b=$('bParamReset'); b.hidden=!n; b.textContent=`Reset all · ${n}`; host.querySelectorAll('.pg').forEach(pg=>{ const g=groups[+pg.dataset.g]; const c=Object.keys(overrides[g.tech]||{}).length; const ch=pg.querySelector('.chg'); ch.hidden=!c; ch.textContent=c+' changed · '; pg.querySelector('.pgr').hidden=!c; }); };
  const rowOf=i=>host.querySelector(`.prm[data-i="${i}"]`);
  const fill=(rg,l,v)=>rg.style.setProperty('--p',(100*(v-l.range[0])/((l.range[1]-l.range[0])||1)).toFixed(2)+'%');
  const setRow=(i,v,commit)=>{ const l=leaves[i], el=rowOf(i); v=clamp(v,l.range[0],l.range[1]); el.querySelector('input[type=range]').value=v; fill(el.querySelector('input[type=range]'),l,v); el.querySelector('.num').value=fmt(l,v); el.classList.toggle('on',Math.abs(v-l.value)>1e-12); apply(l,Math.abs(v-l.value)>1e-12?v:l.value,commit); };
  host.querySelectorAll('.prm').forEach(el=>{ const i=+el.dataset.i, l=leaves[i], rg=el.querySelector('input[type=range]'), nm=el.querySelector('.num'); fill(rg,l,l.value);
    rg.oninput=()=>setRow(i,+rg.value,false); rg.onchange=()=>setRow(i,+rg.value,true); rg.ondblclick=()=>setRow(i,l.value,true);
    const commit=()=>{ const v=parseFloat(nm.value.replace(',','.')); if(isFinite(v)){ if(v<l.range[0]||v>l.range[1]){ nm.classList.add('bad'); setTimeout(()=>nm.classList.remove('bad'),700); } setRow(i,v,true); } else nm.value=fmt(l,+rg.value); };
    nm.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); commit(); nm.select(); } else if(e.key==='Escape'){ nm.value=fmt(l,+rg.value); nm.blur(); } else if(e.key==='ArrowUp'||e.key==='ArrowDown'){ e.preventDefault(); const k=(e.shiftKey?10:1)*(e.altKey&&l.st<1?0.1:1)*(e.key==='ArrowUp'?1:-1); const cur=parseFloat(nm.value)||+rg.value; const v=Math.round((cur+k*l.st)/(l.st*(e.altKey&&l.st<1?0.1:1)))*(l.st*(e.altKey&&l.st<1?0.1:1)); setRow(i,v,false); } };
    nm.onkeyup=e=>{ if(e.key==='ArrowUp'||e.key==='ArrowDown')setRow(i,parseFloat(nm.value),true); };
    nm.onblur=commit; nm.onfocus=()=>nm.select();
    el.querySelector('.rst').onclick=()=>setRow(i,l.value,true); });
  host.querySelectorAll('.pg').forEach(pg=>{ const g=groups[+pg.dataset.g]; const h=pg.querySelector('.pgh'); h.onclick=()=>{ const o=pg.classList.toggle('shut'); h.setAttribute('aria-expanded',String(!o)); }; pg.querySelector('.pgr').onclick=()=>{ g.items.forEach(l=>{ const i=leaves.indexOf(l); const el=rowOf(i); el.querySelector('input[type=range]').value=l.value; fill(el.querySelector('input[type=range]'),l,l.value); el.querySelector('.num').value=fmt(l,l.value); el.classList.remove('on'); }); delete overrides[g.tech]; marks(); refresh(); }; });
  $('bParamReset').onclick=()=>{ overrides={}; leaves.forEach((l,i)=>{ const el=rowOf(i); el.querySelector('input[type=range]').value=l.value; fill(el.querySelector('input[type=range]'),l,l.value); el.querySelector('.num').value=fmt(l,l.value); el.classList.remove('on'); }); marks(); refresh(); };
  window.__study_params={leaves,set:(tech,path,v)=>{ const i=leaves.findIndex(x=>x.tech===tech&&x.path===path); if(i>=0)setRow(i,v,true); },overrides:()=>overrides}; })();

/* ---------- view: plate / reference / compare ---------- */
const refImg=new Image(); let refReady=false; const hasRef=!!(window.__REF&&window.__REF.data);
refImg.onload=()=>{ refReady=true; dirty=true; computeFidelity(); };
let mode=0, splitX=0.5;
const VIEW_HINT=['The rebuild, drawn in code.','The source image the technique was measured from.','Reference on the left, rebuild on the right. Move across the plate to slide the split.'];
if(hasRef)refImg.src=window.__REF.data; else { document.querySelectorAll('#segView button[data-m="1"],#segView button[data-m="2"]').forEach(b=>{ b.disabled=true; b.title='The reference is held locally and not published'; }); $('viewHint').textContent='The reference is held locally and not published, so only the rebuild is shown.'; fidEl.innerHTML='<p class="none">Reference held locally, not published. No match score.</p>'; }
function setMode(m){ if(!hasRef)m=0; mode=(m+3)%3; document.querySelectorAll('#segView button').forEach(b=>{ const on=+b.dataset.m===mode; b.classList.toggle('on',on); b.setAttribute('aria-checked',String(on)); }); if(hasRef)$('viewHint').textContent=VIEW_HINT[mode]+(mode!==0&&fidelity?` Match ${Math.round(fidelity.sum*100)} %.`:''); dirty=true; }
document.querySelectorAll('#segView button').forEach(b=>b.onclick=()=>setMode(+b.dataset.m));

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
  const pc=v=>Math.round(v*100)+' %'; const row=(k,v,n)=>`<div class="fr"><span>${k}</span><span class="fb"><i style="width:${(v*100).toFixed(1)}%"></i></span><span>${pc(v)}</span></div>`;
  fidEl.innerHTML=`<p class="fh">Measured on the ${esc(variant().label.toLowerCase())} palette, reference against rebuild.</p>${row('Palette',pal)}${row('Tone',tone)}${row('Edges',edge)}${row('Grain',grain)}${row('Chroma',chroma)}<div class="fr sum"><span>Optical match</span><span class="fb"><i style="width:${(sum*100).toFixed(1)}%"></i></span><span>${pc(sum)}</span></div>`; if(mode)setMode(mode); }catch(e){ console.info('fidelity',e); } }

/* ---------- related (accordion) ---------- */
(function(){ const mine=new Set(me.techniques||[]); const myAtoms=new Set(VOC.atoms[S.id]||(S.spec.techniques||[]).flatMap(t=>t.atoms||[])); const scored=TT.entries.filter(e=>e.id!==S.id&&e.section==='techniques').map(e=>{ const shared=(e.techniques||[]).filter(t=>mine.has(t)); const atomsShared=(VOC.atoms[e.id]||[]).filter(a=>myAtoms.has(a)); const rel=(me.related||[]).includes(e.id); return {e,shared,atomsShared,rel,score:(rel?10:0)+shared.length*2+atomsShared.length}; }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).slice(0,4);
  if(!relEl)return; if(!scored.length){ relEl.innerHTML='<p class="none">No other study shares a technique with this one yet.</p>'; return; }
  relEl.innerHTML=scored.map(({e,shared,atomsShared,rel})=>`<a class="r" href="${ROOT}${e.path}index.html"><img src="${ROOT}${e.path}thumb.png" alt="" loading="lazy"><span class="name">${esc(e.title)}<i>${esc(e.code)}</i></span><span class="via">${rel?'related':'shares '+esc(shared[0]||atomsShared[0]||'')}</span></a>`).join(''); })();

/* ---------- motion + interactive ---------- */
let liveOn=false, motionOn=false, mArt=null, mCtx=null, mT0=0;
const LIVE_LABEL=S.liveLabel||'Interactive';
(function(){ const has=!!S.motion, live=!!S.live; $('bMotion').hidden=!has; $('bLive').hidden=!live; $('liveLabel').textContent=LIVE_LABEL;
  if(!has&&!live){ $('motionRow').innerHTML='<span class="btn off" aria-disabled="true">Still plate</span>'; $('motionHint').textContent='This study has no motion or interactive version.'; $('mMotion').classList.add('none'); return; }
  $('motionHint').textContent=[has?(S.motionHint||'Play runs the plate as a loop.'):'', live?(S.liveHint||`${LIVE_LABEL} opens the working version in place of the plate.`):''].filter(Boolean).join(' ');
  if(has)$('bMotion').onclick=()=>setMotion(!motionOn); if(live)$('bLive').onclick=()=>setLive(!liveOn);
  if(has!==live)(has?$('bMotion'):$('bLive')).style.gridColumn='1/3';
  if(live&&!/pointer/i.test(LIVE_LABEL))$('bLive').querySelector('svg').outerHTML='<svg viewBox="0 0 12 12" aria-hidden="true" style="fill:none;stroke:currentColor;stroke-width:1.3"><path d="M5 2H2v8h8V7"/><path d="M7 1.5h3.5V5M10.5 1.5L5.5 6.5"/></svg>'; })();
function motionState(){ $('motionState').textContent=motionOn?'Playing':(liveOn?LIVE_LABEL:'Still'); $('motionState').classList.toggle('hot',motionOn||liveOn); }
function placeLive(){ if(!S.live)return; const f=liveEl.querySelector('iframe'); if(!f)return; f.style.left=fig.x+'px'; f.style.top=fig.y+'px'; f.style.width=fig.w+'px'; f.style.height=fig.h+'px'; }
if(S.live){ const f=document.createElement('iframe'); f.setAttribute('title',`${S.code} ${LIVE_LABEL.toLowerCase()} version`); liveEl.appendChild(f); }
function setLive(o){ if(o&&motionOn)setMotion(false); liveOn=o; liveEl.classList.toggle('on',o); $('bLive').classList.toggle('on',o); $('bLive').setAttribute('aria-pressed',String(o)); if(o){ const f=liveEl.querySelector('iframe'); f.srcdoc=typeof S.live==='function'?S.live(variant(),overrides):S.live; } placeLive(); motionState(); dirty=true; }
function setMotion(o){ if(o&&liveOn)setLive(false); motionOn=o; const b=$('bMotion'); b.classList.toggle('on',o); b.setAttribute('aria-pressed',String(o)); b.querySelector('span').textContent=o?'Pause':'Play'; if(o){ mArt=document.createElement('canvas'); mArt.width=Math.round(fig.w*DPR); mArt.height=Math.round(fig.h*DPR); mCtx=mArt.getContext('2d'); mCtx.setTransform(DPR,0,0,DPR,0,0); mT0=performance.now(); } else { mArt=null; ensureArt(); } motionState(); dirty=true; }

/* ---------- export ---------- */
$('bCopy').onclick=async()=>{ const b=$('bCopy'); try{ await navigator.clipboard.writeText(specJSON); b.textContent='Copied'; }catch(e){ b.textContent='Copy failed'; } b.classList.add('on'); setTimeout(()=>{ b.textContent='Copy spec'; b.classList.remove('on'); },1400); };
$('bPng').onclick=()=>{ const src=motionOn?mArt:art; if(!src)return; src.toBlob(bl=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(bl); const ed=Object.keys(overrides).length||(inkEdits[vi]&&Object.keys(inkEdits[vi]).length); a.download=`${S.id}-${variants[vi].id}${ed?'-edited':''}.png`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); },'image/png'); };

/* ---------- chrome drawn on the canvas ---------- */
let phase='pre', pt=0, lastNow=performance.now(); const READ=reduced?0.01:2.6;
const headPos=t=>smooth(0,READ,t);
function drawChrome(){ ctx.strokeStyle=INK50; ctx.lineWidth=0.5; ctx.strokeRect(px(fig.x),px(fig.y),fig.w,fig.h);
  ctx.beginPath(); for(const q of [0.25,0.5,0.75]){ const X=px(fig.x+fig.w*q), Y=px(fig.y+fig.h*q); ctx.moveTo(X,fig.y+0.5); ctx.lineTo(X,fig.y+3.5); ctx.moveTo(X,fig.y+fig.h-0.5); ctx.lineTo(X,fig.y+fig.h-3.5); ctx.moveTo(fig.x+0.5,Y); ctx.lineTo(fig.x+3.5,Y); ctx.moveTo(fig.x+fig.w-0.5,Y); ctx.lineTo(fig.x+fig.w-3.5,Y); } ctx.stroke();
  ctx.strokeStyle=INK; ctx.lineWidth=0.75; const g=2,l=10; const X0=fig.x-g, X1=fig.x+fig.w+g, Y0=fig.y-g, Y1=fig.y+fig.h+g;
  ctx.beginPath(); ctx.moveTo(X0+0.5,Y0-l); ctx.lineTo(X0+0.5,Y0+0.5); ctx.lineTo(X0-l,Y0+0.5); ctx.moveTo(X1-0.5,Y0-l); ctx.lineTo(X1-0.5,Y0+0.5); ctx.lineTo(X1+l,Y0+0.5); ctx.moveTo(X0+0.5,Y1+l); ctx.lineTo(X0+0.5,Y1-0.5); ctx.lineTo(X0-l,Y1-0.5); ctx.moveTo(X1-0.5,Y1+l); ctx.lineTo(X1-0.5,Y1-0.5); ctx.lineTo(X1+l,Y1-0.5); ctx.stroke();
  const cap=(mobile()?`FIG. ${S.fig||'1'} · ${S.code}`:`FIG. ${S.fig||'1'} · ${S.title} · ${S.code}`).toUpperCase(); text(cap,fig.x+(mobile()?0:12),fig.y-13,9.5,0.16,INK50);
  let st=''; if(motionOn)st='PLAYING'; else if(liveOn)st=LIVE_LABEL.toUpperCase(); else if(!artDone&&phase!=='pre')st='DRAWING…'; else if(phase==='read')st='BUILDING · '+String(Math.round(headPos(pt)*100)).padStart(3,'0')+' %'; else if(phase==='hold')st=mode===1?'REFERENCE':(mode===2?'COMPARE':'STILL'); else st='DRAWING…'; text(st,fig.x+fig.w-(mobile()?0:12),fig.y-13,9.5,0.16,st==='STILL'||st.startsWith('BUILDING')?INK:ACC,'right');
  const by=fig.y+fig.h+18; ctx.font=FONT(9.5); track(9.5,0.16); const lab='PLATE · ', s2=` ${S.code} CORE `; const w1=ctx.measureText(lab).width, w2=ctx.measureText(s2).width; if(hasLS)ctx.letterSpacing='0px';
  text(lab,fig.x,by,9.5,0.16,GREY); const sx=fig.x+w1+2, sy=by-7.5; const spot=(variant().spot||S.spot||[16,16,20]); ctx.fillStyle=`rgb(${spot.join(',')})`; ctx.fillRect(Math.round(sx),Math.round(sy),7,7); ctx.strokeStyle=INK; ctx.lineWidth=0.5; ctx.strokeRect(Math.round(sx)+0.5,Math.round(sy)+0.5,7,7);
  text(s2,sx+11,by,9.5,0.16,GREY); text(spot.map(c=>c|0).join(' · '),sx+11+w2,by,9.5,0.16,INK);
  if(!mobile()){ const ed=Object.keys(overrides).length||(inkEdits[vi]&&Object.keys(inkEdits[vi]).length); const rs=`${variants[vi].label}${ed?' · EDITED':''}`.toUpperCase(); ctx.font=FONT(9.5); track(9.5,0.16); const rw=ctx.measureText(rs).width, leftEnd=sx+11+w2+ctx.measureText(spot.join(' · ')).width; if(hasLS)ctx.letterSpacing='0px'; const rx=fig.x+fig.w; if(rx-rw>leftEnd+24)text(rs,rx,by,9.5,0.16,ed?ACC:GREY,'right'); } }
function drawArt(y1){ const src=motionOn?mArt:art; if(!src)return; ctx.save(); ctx.beginPath(); ctx.rect(fig.x,fig.y,fig.w,Math.max(0,y1-fig.y)); ctx.clip(); ctx.imageSmoothingEnabled=!(src.width===Math.round(fig.w*DPR));
  const drawRef=(x0,x1)=>{ if(!refReady)return; ctx.save(); ctx.beginPath(); ctx.rect(x0,fig.y,x1-x0,fig.h); ctx.clip(); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'; ctx.drawImage(refImg,fig.x,fig.y,fig.w,fig.h); ctx.restore(); };
  if(mode===0||motionOn){ ctx.drawImage(src,fig.x,fig.y,fig.w,fig.h); }
  else if(mode===1){ drawRef(fig.x,fig.x+fig.w); if(!refReady)ctx.drawImage(src,fig.x,fig.y,fig.w,fig.h); }
  else { const sx=fig.x+fig.w*splitX; ctx.drawImage(src,fig.x,fig.y,fig.w,fig.h); drawRef(fig.x,sx); ctx.strokeStyle=INK; ctx.lineWidth=0.75; ctx.beginPath(); ctx.moveTo(px(sx),fig.y); ctx.lineTo(px(sx),fig.y+fig.h); ctx.stroke(); ctx.fillStyle=PAPER; ctx.fillRect(sx-40,fig.y+4,34,14); ctx.fillRect(sx+6,fig.y+4,58,14); text('REF',sx-10,fig.y+14,9,0.16,INK,'right'); text('REBUILD',sx+10,fig.y+14,9,0.16,INK,'left'); }
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
  const t=noteOn?(hover||selected):null; if(t){ const l1=`${t.num} · ${t.d} · U ${t.u.toFixed(3)} · V ${t.v.toFixed(3)}`; const l2=t.label; ctx.font=FONT(10); track(10,0.06); const w2=Math.max(ctx.measureText(l2).width,ctx.measureText(l1).width); if(hasLS)ctx.letterSpacing='0px'; const PW=Math.max(168,Math.ceil(w2)+18), PH=32; const Sz=9;
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
  if(motionOn&&mArt){ work=true; try{ S.motion(mArt,fig.w,fig.h,DPR,variant(),(now-mT0)/1000,mCtx,overrides); }catch(e){ console.error(e); setMotion(false); } }
  if(!work&&!dirty)return; dirty=false;
  ctx.clearRect(0,0,W,H);
  if(liveOn){ drawChrome(); return; }
  if(phase==='read'){ const y=fig.y+fig.h*headPos(pt); drawArt(y); ctx.strokeStyle=ACC; ctx.lineWidth=0.75; ctx.beginPath(); ctx.moveTo(fig.x-14,px(y)); ctx.lineTo(fig.x+fig.w+14,px(y)); ctx.stroke(); }
  else drawArt(fig.y+fig.h);
  drawChrome(); if(noteOn&&!motionOn)drawTrackers(pt); drawHover(); }
requestAnimationFrame(frame);

/* ---------- input ---------- */
cv.addEventListener('pointermove',e=>{ const r=cv.getBoundingClientRect(); const x=e.clientX-r.left,y=e.clientY-r.top; pointer=(x>=fig.x&&x<=fig.x+fig.w&&y>=fig.y&&y<=fig.y+fig.h)?{x,y}:null; if(mode===2&&pointer)splitX=clamp((x-fig.x)/fig.w,0,1);
  let h=null; if(noteOn)for(const t of P){ if(Math.hypot(t.x-x,t.y-y)<14)h=t; } if(h!==hover)setHover(h); cv.style.cursor=h?'pointer':(mode===2&&pointer?'ew-resize':'crosshair'); dirty=true; });
cv.addEventListener('pointerleave',()=>{ pointer=null; if(hover)setHover(null); dirty=true; });
cv.addEventListener('click',()=>{ if(hover)select(hover); });
$('bReplay').onclick=()=>{ if(!noteOn)setNotes(true); startRead(); };
$('bSpec').onclick=()=>openSpec(!specEl.classList.contains('open')); $('specclose').onclick=()=>openSpec(false);
$('speccopy').onclick=async()=>{ try{ await navigator.clipboard.writeText(specJSON); $('speccopy').textContent='Copied'; setTimeout(()=>$('speccopy').textContent='Copy',1200);}catch(e){} };
/* expand (F): the notes column folds away and the plate takes its width; remembered per browser */
let wide=false; try{ wide=localStorage.getItem('tt-wide')==='1'; }catch(e){}
function setWide(o){ wide=o; document.body.classList.toggle('wide',o); const b=$('bWide'); if(b){ b.classList.toggle('on',o); b.setAttribute('aria-pressed',String(o)); b.querySelector('span').textContent=o?'Collapse':'Expand'; } try{ localStorage.setItem('tt-wide',o?'1':'0'); }catch(e){} requestAnimationFrame(()=>{ layout(); dirty=true; }); }
if($('bWide')){ $('bWide').onclick=()=>setWide(!wide); } if(wide)setWide(true);
addEventListener('keydown',e=>{ if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return; if(e.metaKey||e.ctrlKey||e.altKey)return; const k=e.key.toLowerCase(); if(k==='f'){ setWide(!wide); return; }
  if(k==='r'&&hasRef)setMode(mode+1); else if(k==='s')openSpec(!specEl.classList.contains('open')); else if(k==='v'&&variants.length>1)setVariant(vi+1); else if(k==='m'&&S.motion)setMotion(!motionOn); else if(k==='l'&&S.live)setLive(!liveOn); else if(e.key===' '&&!(e.target&&/BUTTON|SUMMARY/.test(e.target.tagName))){ e.preventDefault(); if(!noteOn)setNotes(true); startRead(); } else if(e.key==='Escape')openSpec(false);
  else if(e.key===','&&sib[idx-1])location.href=ROOT+sib[idx-1].path+'index.html'; else if(e.key==='.'&&sib[idx+1])location.href=ROOT+sib[idx+1].path+'index.html'; else if(e.key==='/')location.href=ROOT+'index.html'; });
let rto=null; addEventListener('resize',()=>{ clearTimeout(rto); rto=setTimeout(()=>{ layout(); dirty=true; },120); });
/* wait for the inlined fonts before the first render (art modules draw type) */
let started=false; const go=()=>{ if(started)return; started=true; layout(); dirty=true; };
if(document.fonts){ Promise.all(['700 20px Archivo','400 12px Inter','400 12px "JetBrains Mono"'].map(f=>document.fonts.load(f).catch(()=>{}))).then(go); setTimeout(go,2500); } else go();
window.__study={S,fig:()=>fig,art:()=>art,fidelity:()=>fidelity,setMode,setVariant,setMotion,setLive,setNotes,variants,variant,inks:()=>inksOf(variants[vi]),setInk:(h,v)=>{ (inkEdits[vi]??={})[norm(h)]=norm(v); drawInks(); refresh(); }};
})();
