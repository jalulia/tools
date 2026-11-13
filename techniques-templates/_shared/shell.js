/* Techniques & Templates · plate runtime · ø co.
   Reads window.STUDY (one per page) and window.TT (manifest) and lays out three columns:
   notes (left: title, short description, one accordion), the plate (center: canvas, callouts, build sweep),
   and the control panel (right: View, Callouts, Motion, Color, Parameters, Export — same order on every page).
   Design notes: _shared/PLATE-UI.md. Everything is generated at runtime; the only bitmap is the inlined reference. */
(function(){
if(/[?&]embed\b/.test(location.search))document.body.classList.add('embed');
"use strict";
const S=window.STUDY; if(!S){document.body.textContent='no STUDY';return;}
/* S.ui: a study page (studies/) brings its own instrument; _shared/st-adapter.js maps it onto these modules.
   ENG(): the study's running engine (tick, pointer, keys, spec); IFRAME: a TS interactive version in an iframe. */
const UI=S.ui||null; const ENG=()=>(S.live&&typeof S.live==='object'&&!Array.isArray(S.live))?S.live:null;
const IFRAME=typeof S.live==='function'||typeof S.live==='string';
let uiColorDraw=()=>{}, uiSyncRows=()=>{};
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
const sib=TT.entries.filter(e=>e.section===me.section&&(!e.hidden||e.id===S.id)); const idx=sib.findIndex(e=>e.id===S.id);
const secHash=section.hash||section.id;
const variantsOf=S=>(S.variants||[]).map(v=>({id:v.id,label:v.label,swatches:v.sw}));
const famName=f=>String(f||'').replace(/-/g,' ');
const ICON={ chev:'<svg class="chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M2.5 3.8L5 6.3l2.5-2.5"/></svg>', reset:'<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 6.3A3.9 3.9 0 1 0 3.4 3"/><path d="M2.6 1v2.4H5"/></svg>' };

/* ---------- nav: crumb + pager (no brand) ---------- */
(function(){ const n=$('nav'); if(!n)return; const prev=sib[idx-1], next=sib[idx+1];
  n.innerHTML=`<span class="crumb"><a href="${ROOT}index.html">Techniques &amp; Templates</a><span class="sep">/</span><a href="${ROOT}index.html#${esc(secHash)}">${esc(section.title)}</a><span class="sep">/</span><b>${esc(S.title)}</b><span class="code">${esc(S.code)}</span></span>
  <span class="pager">${prev?`<a href="${ROOT}${prev.path}index.html" title="Previous: ${esc(prev.code)} ${esc(prev.title)} (,)">← ${esc(prev.code)}</a>`:'<a class="off" aria-disabled="true">←</a>'}<a class="pos" href="${ROOT}index.html#${esc(secHash)}" title="All ${esc(section.title.toLowerCase())}"><span class="n">${idx+1}</span>&nbsp;of ${sib.length}</a>${next?`<a href="${ROOT}${next.path}index.html" title="Next: ${esc(next.code)} ${esc(next.title)} (.)">${esc(next.code)} →</a>`:'<a class="off" aria-disabled="true">→</a>'}</span>`; })();

/* ---------- notes column: title, description, one accordion ---------- */
(function(){ const el=$('copy'); const T=S.spec.techniques||[];
  const split=x=>{ x=String(x); if(x.includes(' · '))return [x.split(' · ')[0],x.split(' · ').slice(1).join(' · ')]; const m=x.match(/^([^:;]{1,40}?):\s+(.+)$/); return m?[m[1],m[2]]:[x,'']; };
  const steps=(S.spec.pass_order||[]).map(s=>{ const [a,b]=split(s); return `<li><b>${esc(a)}</b>${b?`<span>${esc(b)}</span>`:''}</li>`; }).join('');
  /* the left column keeps a short description: three sentences at most; the rest opens the "How it is built" section */
  const sents=(S.body||[]).join(' ').split(/(?<=[.!?])\s+(?=[A-Z0-9“"(])/); const bodyShort=sents.slice(0,3).join(' '), bodyMore=sents.slice(3).join(' ');
  const vrows=T.map(t=>`<li class="vr"><button type="button" data-t="${esc(t.id)}" title="Show where ${esc(t.name.toLowerCase())} was measured"><span class="vn">${esc(t.name)}</span><span class="vid">${esc(t.id)}</span></button><span class="at">${(t.atoms||[]).map(a=>`<a href="${ROOT}index.html#techniques?a=${encodeURIComponent(a)}" title="Every entry that uses ${esc(a)}">${esc(a)}</a>`).join('')}${S.techniques&&S.techniques[t.id]?`<a class="mod" href="lib/${esc(t.id)}.js" title="The lifted module">lib/${esc(t.id)}.js</a>`:''}</span></li>`).join('');
  const ef=!!(UI&&UI.engineFirst), refOK=!!(window.__REF&&window.__REF.data), nPal=UI?(UI.palettes?UI.palettes.list.length:0):(S.variants||[]).length, hasMo=UI?!!UI.motion:!!S.motion, hasLv=UI?!!UI.interactive:IFRAME;
  const keys=[['R',refOK?'Plate, reference, compare':null],['V',!ef&&nPal>1?'Next palette':null],['M',!ef&&hasMo?'Play or pause motion':null],['L',!ef&&hasLv?(S.liveLabel||'Interactive version'):null],['S','Open the spec'],['F','Expand the plate'],[', .',ef?null:'Previous, next study'],['/','Back to the index'],...((UI&&UI.keys)||[])].filter(k=>k[1]);
  const nParams=UI?UI.params.length:((window.ART.paramLeaves?window.ART.paramLeaves(S.spec).length:0));
  const motDesc=UI?[UI.motion?'loop':'',UI.interactive?UI.interactive.label.toLowerCase():'',UI.pointerHint?'pointer':''].filter(Boolean).join(' · '):[S.motion?'loop':'',S.live?(S.liveLabel||'interactive').toLowerCase():''].filter(Boolean).join(' · ');
  const acc=(id,title,body,open)=>`<details class="acc" name="notes" id="${id}"${open?' open':''}><summary><span>${title}</span>${ICON.chev}</summary><div class="ab">${body}</div></details>`;
  el.innerHTML=`<p class="kicker"><span>${esc(S.code)}</span>${me.family?`<span>${esc(famName(me.family))}</span>`:''}</p><h1 class="title">${esc(S.title)}</h1>${S.lede?`<p class="lede">${esc(S.lede)}</p>`:''}<div class="body">${bodyShort?`<p>${esc(bodyShort)}</p>`:''}</div>
  <div class="accs">
  ${steps||bodyMore?acc('aBuild','How it is built',`${bodyMore?`<p class="ah more">${esc(bodyMore)}</p>`:''}${steps?`<ol class="steps">${steps}</ol>`:''}`,!mobile()):''}
  ${acc('aTech',`Techniques <i>${T.length}</i>`,`<p class="ah">Click one to light its callouts on the plate. The grey words are atoms: click one to see every study that uses it.</p><ul class="vocab" id="chips">${vrows}</ul>`,!steps)}
  ${acc('aRef','Reference and match',`<p class="src">${esc(S.source||'—')}</p><div class="fid" id="fid"></div>`)}
  ${acc('aStudy','Study',`<dl class="kv"><dt>Code</dt><dd>${esc(S.code)}</dd><dt>Section</dt><dd>${esc(section.title)} · ${idx+1} of ${sib.length}</dd>${me.family?`<dt>Family</dt><dd>${esc(famName(me.family))}</dd>`:''}<dt>Palettes</dt><dd>${UI?(nPal||'fixed inks'):(nPal||1)}</dd><dt>Parameters</dt><dd>${nParams||'—'}</dd><dt>Motion</dt><dd>${motDesc||'still plate'}</dd><dt>Spec</dt><dd><a href="spec.json">spec.json</a></dd></dl>`)}
  ${acc('aRel','Related','<div class="rel" id="rel"></div>')}
  ${acc('aKeys','Keyboard',`<dl class="keys">${keys.map(k=>`<dt><kbd>${esc(k[0])}</kbd></dt><dd>${esc(k[1])}</dd>`).join('')}</dl>`)}
  </div>`;
  /* one section open at a time (the name attribute does this natively; this covers older engines) */
  el.querySelectorAll('details.acc').forEach(d=>d.addEventListener('toggle',()=>{ if(d.open)el.querySelectorAll('details.acc').forEach(o=>{ if(o!==d)o.open=false; }); }));
})();

/* ---------- spec panel ---------- */
const specEl=$('spec'), specPre=$('specpre');
const specFull=Object.assign({ id:S.id, code:S.code, title:S.title, section:me.section, variants:variantsOf(S) },S.spec);
let specJSON=JSON.stringify(specFull,null,2);
/* a study page's spec moves with its controls: read it again when it is opened or copied */
function refreshSpec(){ if(!(UI&&UI.spec))return; try{ specJSON=JSON.stringify(Object.assign({ id:S.id, code:S.code, title:S.title, section:me.section },UI.spec()),null,2); specPre.innerHTML=hlJSON(specJSON); }catch(e){ console.error(e); } }
function hlJSON(s){ return esc(s).replace(/("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)|\b(true|false|null)\b/g,(m,str,col,num,lit)=>{ if(str)return col?`<span class="k">${str}</span>${col}`:`<span class="s">${str}</span>`; if(num)return `<span class="n">${num}</span>`; return `<span class="n">${lit}</span>`; }); }
specPre.innerHTML=hlJSON(specJSON); $('specid').textContent=S.id;
function openSpec(o){ if(o)refreshSpec(); specEl.classList.toggle('open',o); specEl.setAttribute('aria-hidden',o?'false':'true'); $('bSpec').classList.toggle('on',o); $('bSpec').textContent=o?'Close spec':'Open spec'; }
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
/* a name that is only a number ("Ink 3") says nothing: name the color instead */
const HUES=[[0,'red'],[14,'vermilion'],[26,'orange'],[39,'amber'],[47,'yellow'],[66,'lime'],[95,'green'],[150,'teal'],[176,'cyan'],[190,'sky blue'],[205,'blue'],[240,'indigo'],[262,'violet'],[282,'purple'],[302,'magenta'],[328,'pink'],[348,'red']];
function colorName(hex){ const h=norm(hex); const r=parseInt(h.slice(1,3),16)/255,g=parseInt(h.slice(3,5),16)/255,b=parseInt(h.slice(5,7),16)/255; const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn; const sat=d===0?0:d/(1-Math.abs(2*l-1));
  if(l<0.1)return 'Black'; if(l>0.95&&sat<0.4)return 'White'; if(sat<0.14||d<0.06)return l>0.78?'Light gray':(l>0.42?'Gray':'Dark gray');
  let hu=d===0?0:(mx===r?((g-b)/d)%6:(mx===g?(b-r)/d+2:(r-g)/d+4))*60; if(hu<0)hu+=360; let nm=HUES[0][1]; for(const [a,n] of HUES)if(hu>=a)nm=n;
  if(nm==='orange'&&l<0.35)nm='brown'; const pre=l<0.28?'dark ':(l>0.8?'pale ':''); const out=pre+nm; return out.charAt(0).toUpperCase()+out.slice(1); }
const genericInk=n=>/^(?:(?:inks?|colou?rs?|sw|swatch(?:es)?|palette)\s*(?:·\s*)?)?\d+$/i.test(String(n).trim());
function inkLabels(list){ const seen={}; return list.map(k=>{ let n=inkName(k.paths[0]); if(genericInk(n)){ n=colorName(k.hex); seen[n]=(seen[n]||0)+1; if(seen[n]>1)n+=' '+seen[n]; } return n; }); }
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
function ensureArt(){ if(typeof S.relayPoints==='function'){ S.relayPoints(overrides); placePoints(); try{ if(phase==='hold')rows.forEach((r,i)=>rowText(r,P[i],[P[i].u,P[i].v],true)); }catch(e){} }   /* a study whose layout follows its parameters moves its points first */
  const k=fig.w+'x'+fig.h+'@'+DPR+'#'+variant().id+'#'+JSON.stringify(overrides); if(k===artKey&&art)return; artKey=k; if(artCache[k]&&!UI){ art=artCache[k]; artDone=true; dirty=true; computeFidelity(); return; } renderArt(k); }
function renderArt(key){ const c=document.createElement('canvas'); c.width=Math.round(fig.w*DPR); c.height=Math.round(fig.h*DPR); const x=c.getContext('2d'); x.setTransform(DPR,0,0,DPR,0,0); x.fillStyle='#fff'; x.fillRect(0,0,fig.w,fig.h); artDone=false; dirty=true; busy(true);
  const t0=performance.now();
  const finish=()=>{ if(key!==artKey)return; artCache[key]=c; art=c; artDone=true; dirty=true; busy(false); console.info(`[${S.id}] ${variant().id} rendered in ${Math.round(performance.now()-t0)} ms`); computeFidelity(); };
  try{ const r=S.render(c,fig.w,fig.h,DPR,variant(),finish,overrides); if(r!==false&&S.render.length<6)finish(); }catch(e){ console.error(e); finish(); } }
function busy(o){ document.body.classList.toggle('drawing',o); }

/* ---------- points ---------- */
const P=(S.points||[]).slice(0,10).map((p,i)=>({num:10+i*2,u:p.u,v:p.v,d:p.d||'—',label:p.label||'',t:p.t||null,dir:p.dir||null,lock:-1,x:0,y:0}));
if(typeof S.onPoints==='function')S.onPoints(P);   /* a study that re-lays its plate (PL plates) moves its points */
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
let hover=null, selected=null, dirty=true, noteOn=false;   /* callouts are off until asked for */
function setHover(t){ hover=t; rows.forEach((r,i)=>r.classList.toggle('on',P[i]===(hover||selected))); showRead(hover||selected); dirty=true; }
function select(t){ selected=(selected===t)?null:t; rows.forEach((r,i)=>r.classList.toggle('on',P[i]===(hover||selected))); showRead(selected||hover); if(selected&&selected.t)hlTech(selected.t); dirty=true; }
function showRead(t){ if(!t){ readTxt.textContent='Hover or select a point.'; readCode.textContent=''; return; } const tech=(S.spec.techniques||[]).find(q=>q.id===t.t); readTxt.innerHTML=`<b>${t.num} · ${esc(t.label)}</b>${tech?`<span>${esc(tech.name)}</span>`:''}`; const show=v=>window.ART.isLeaf(v)?`${v.value}${v.unit?' '+v.unit:''}`:(typeof v==='object'?JSON.stringify(v):v); readCode.textContent=tech&&tech.params?Object.entries(tech.params).slice(0,6).map(([k,v])=>`${k}  ${show(v)}`).join('\n'):''; }
function setNotes(o){ noteOn=o; $('tNote').checked=o; document.body.classList.toggle('no-callouts',!o); dirty=true; }
$('tNote').onchange=()=>setNotes($('tNote').checked); document.body.classList.add('no-callouts');
$('bPoints').onclick=()=>{ const p=$('pts'); p.hidden=!p.hidden; $('bPoints').setAttribute('aria-expanded',String(!p.hidden));  };

/* ---------- color module ---------- */
const palEl=$('pal'), inksEl=$('inks'); let inkAll=false;
(function(){ if(UI){ uiColor(); return; } palEl.innerHTML=variants.map((v,i)=>`<button type="button" role="radio" aria-checked="${i===0}" data-i="${i}" class="pv${i===0?' on':''}"><span class="dot" aria-hidden="true"></span><span class="sws">${(v.sw||[]).slice(0,6).map(c=>`<i style="background:${esc(c)}"></i>`).join('')}</span><span class="pl">${esc(v.label)}</span><span class="ed" hidden>edited</span></button>`).join('');
  palEl.querySelectorAll('button').forEach(b=>b.onclick=()=>setVariant(+b.dataset.i));
  if(variants.length<2){ palEl.classList.add('single'); }
  $('bInkReset').onclick=()=>{ delete inkEdits[vi]; drawInks(); refresh(); };
  drawInks(); })();
function drawInks(){ const V=variants[vi], E=inkEdits[vi]||{}; const list=inksOf(V); const edited=Object.keys(E).length>0;
  $('bInkReset').hidden=!edited; palEl.querySelectorAll('button').forEach((b,i)=>{ const e=inkEdits[i]&&Object.keys(inkEdits[i]).length; b.querySelector('.ed').hidden=!e; });
  if(!list.length){ inksEl.innerHTML=''; $('colorHint').textContent=S.colorHint?S.colorHint:variants.length>1?'Pick a palette. This plate computes its colors from the optics, so the inks are not editable one by one.':'This plate computes its colors; there are no separate inks to edit.'; return; }
  $('colorHint').textContent=variants.length>1?'Pick a palette, then click any ink to change it. The plate redraws.':'Click any ink to change it. The plate redraws.';
  const CAP=8, shown=inkAll?list:list.slice(0,CAP); const NM=inkLabels(list);
  inksEl.innerHTML=`<div class="ih"><span>Inks in ${esc(V.label)}</span><i>${list.length}</i></div>`+shown.map((k,j)=>{ const cur=E[k.hex]||k.hex; const nm=NM[j]; return `<div class="ink${E[k.hex]?' on':''}" data-h="${k.hex}"><label class="chip" style="--c:${cur}" title="Change ${esc(nm)}"><input type="color" value="${cur}" aria-label="${esc(nm)} color"></label><span class="nm" title="${esc(k.paths.map(inkName).join(', '))}">${esc(nm)}${k.paths.length>1?`<i>+${k.paths.length-1}</i>`:''}</span><input class="hex" value="${cur.toUpperCase()}" maxlength="7" spellcheck="false" autocomplete="off" aria-label="${esc(nm)} hex">${E[k.hex]?`<button type="button" class="rst" title="Back to ${k.hex.toUpperCase()}" aria-label="Reset this ink">${ICON.reset}</button>`:'<span class="rst-sp"></span>'}</div>`; }).join('')+(list.length>CAP?`<button type="button" class="more" id="inkMore">${inkAll?'Show fewer':`Show all ${list.length} inks`}</button>`:'');
  if($('inkMore'))$('inkMore').onclick=()=>{ inkAll=!inkAll; drawInks(); };
  inksEl.querySelectorAll('.ink').forEach(row=>{ const h=row.dataset.h, ci=row.querySelector('input[type=color]'), hx=row.querySelector('.hex'), chip=row.querySelector('.chip');
    const set=(v,commit)=>{ v=norm(v); const E2=(inkEdits[vi]??={}); if(v===h)delete E2[h]; else E2[h]=v; chip.style.setProperty('--c',v); hx.value=v.toUpperCase(); row.classList.toggle('on',v!==h); scheduleRefresh(commit); if(commit)drawInks(); };
    ci.oninput=()=>set(ci.value,false); ci.onchange=()=>set(ci.value,true);
    hx.onkeydown=e=>{ if(e.key==='Enter'){ let v=hx.value.trim(); if(!v.startsWith('#'))v='#'+v; if(HEX.test(v))set(v,true); else { hx.classList.add('bad'); setTimeout(()=>hx.classList.remove('bad'),600); } } else if(e.key==='Escape'){ hx.value=(E[h]||h).toUpperCase(); hx.blur(); } };
    hx.onblur=()=>{ let v=hx.value.trim(); if(!v.startsWith('#'))v='#'+v; if(HEX.test(v)&&norm(v)!==norm(E[h]||h))set(v,true); else hx.value=((inkEdits[vi]||{})[h]||h).toUpperCase(); };
    const rb=row.querySelector('.rst'); if(rb)rb.onclick=()=>set(h,true); }); }
/* color on a study page: the study's own palettes (S.ui.palettes) and the inks of the one in use */
function uiColor(){ const P=UI.palettes;
  if(!P){ palEl.hidden=true; inksEl.innerHTML=''; $('colorHint').textContent=S.colorHint||'This plate prints fixed inks.'; $('mColor').classList.add('none'); return; }
  let raf=0; const draw=()=>{ cancelAnimationFrame(raf); raf=0; const cur=P.current();
    palEl.innerHTML=P.list.map((v,i)=>`<button type="button" role="radio" aria-checked="${i===cur}" data-i="${i}" class="pv${i===cur?' on':''}"><span class="dot" aria-hidden="true"></span><span class="sws">${(v.sw||[]).slice(0,6).map(c=>`<i style="background:${esc(c)}"></i>`).join('')}</span><span class="pl">${esc(v.label)}</span><span class="ed"${P.edited(i)?'':' hidden'}>edited</span></button>`).join('');
    palEl.classList.toggle('single',P.list.length<2); palEl.querySelectorAll('button').forEach(b=>b.onclick=()=>{ P.set(+b.dataset.i); draw(); dirty=true; });
    const inks=P.inks?P.inks():[]; const edited=inks.some(k=>k.hex!==k.base); $('bInkReset').hidden=!edited;
    if(!inks.length){ inksEl.innerHTML=''; $('colorHint').textContent=S.colorHint||'Pick a palette. The plate redraws.'; return; }
    $('colorHint').textContent=P.list.length>1?'Pick a palette, then click any ink to change it. The plate redraws.':'Click any ink to change it. The plate redraws.';
    const seen={}; const names=inks.map(k=>{ let n=k.name; if(genericInk(n)){ n=colorName(k.base); seen[n]=(seen[n]||0)+1; if(seen[n]>1)n+=' '+seen[n]; } return n; });
    const CAP=8, shown=inkAll?inks:inks.slice(0,CAP);
    inksEl.innerHTML=`<div class="ih"><span>Inks in ${esc(P.list[cur]?P.list[cur].label:'')}</span><i>${inks.length}</i></div>`+shown.map((k,j)=>{ const on=k.hex!==k.base; return `<div class="ink${on?' on':''}" data-k="${esc(k.key)}"><label class="chip" style="--c:${k.hex}" title="Change ${esc(names[j])}"><input type="color" value="${k.hex}" aria-label="${esc(names[j])} color"></label><span class="nm">${esc(names[j])}</span><input class="hex" value="${k.hex.toUpperCase()}" maxlength="7" spellcheck="false" autocomplete="off" aria-label="${esc(names[j])} hex">${on?`<button type="button" class="rst" title="Back to ${k.base.toUpperCase()}" aria-label="Reset this ink">${ICON.reset}</button>`:'<span class="rst-sp"></span>'}</div>`; }).join('')+(inks.length>CAP?`<button type="button" class="more" id="inkMore">${inkAll?'Show fewer':`Show all ${inks.length} inks`}</button>`:'');
    if($('inkMore'))$('inkMore').onclick=()=>{ inkAll=!inkAll; draw(); };
    inksEl.querySelectorAll('.ink').forEach(row=>{ const k=row.dataset.k, it=inks.find(x=>x.key===k), ci=row.querySelector('input[type=color]'), hx=row.querySelector('.hex'), chip=row.querySelector('.chip');
      let t=null; const set=(v,commit)=>{ v=norm(v); chip.style.setProperty('--c',v); hx.value=v.toUpperCase(); row.classList.toggle('on',v!==it.base); clearTimeout(t); t=setTimeout(()=>{ P.setInk(k,v); dirty=true; if(commit)draw(); },commit?0:90); };
      ci.oninput=()=>set(ci.value,false); ci.onchange=()=>set(ci.value,true);
      hx.onkeydown=e=>{ if(e.key==='Enter'){ let v=hx.value.trim(); if(!v.startsWith('#'))v='#'+v; if(HEX.test(v))set(v,true); else { hx.classList.add('bad'); setTimeout(()=>hx.classList.remove('bad'),600); } } else if(e.key==='Escape'){ hx.value=it.hex.toUpperCase(); hx.blur(); } };
      hx.onblur=()=>{ let v=hx.value.trim(); if(!v.startsWith('#'))v='#'+v; if(HEX.test(v)&&norm(v)!==it.hex)set(v,true); else hx.value=it.hex.toUpperCase(); };
      const rb=row.querySelector('.rst'); if(rb)rb.onclick=()=>set(it.base,true); }); };
  $('bInkReset').onclick=()=>{ if(P.resetInks)P.resetInks(); draw(); dirty=true; };
  uiColorDraw=()=>{ if(inksEl.contains(document.activeElement))return; if(!raf)raf=requestAnimationFrame(draw); };
  UI.on('sync',uiColorDraw); draw(); }
function setVariant(i){ if(UI){ const P=UI.palettes; if(P&&P.list.length>1){ P.set((P.current()+(i>vi?1:-1)+P.list.length)%P.list.length); uiColorDraw(); dirty=true; } return; } vi=(i+variants.length)%variants.length; palEl.querySelectorAll('button').forEach((b,k)=>{ b.classList.toggle('on',k===vi); b.setAttribute('aria-checked',String(k===vi)); }); inkAll=false; drawInks(); refresh(); }
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
/* limits are written with raw keys at sentence starts ("gap under ~0.1 …"): capitalize each sentence */
const sent=t=>String(t||'').replace(/(^|[.!?]\s+)([a-z])/g,(m,a,b)=>a+b.toUpperCase());
(function(){ if(UI){ uiParams(); return; } const leaves=window.ART.paramLeaves?window.ART.paramLeaves(S.spec):[]; const host=$('prail');
  if(!leaves.length){ host.innerHTML='<p class="empty">'+esc(S.paramsHint||'This study has no adjustable values yet. Its numbers are in the spec.')+'</p>'; $('mParams').classList.add('none'); $('mParams').querySelector('.hint').hidden=true; return; }
  leaves.forEach(l=>{ l.st=stepOf(l); l.dec=decOf(l.st); l.unitS=l.unit||((/_deg$/.test(l.path))?'°':(/_u$/.test(l.path)?'u':(/_px$/.test(l.path)?'px':''))); });
  const decs=x=>{ const s=String(x); const i=s.indexOf('.'); return i<0?0:s.length-i-1; };
  leaves.forEach(l=>{ l.base=l.st>=1?0:Math.min(l.dec,Math.max(decs(l.value),decs(l.range[0]),decs(l.range[1]))); });
  const fmt=(l,v)=>{ if(l.st>=1)return String(Math.round(v)); let s=v.toFixed(Math.min(6,l.dec+1)); s=s.replace(/0+$/,''); const d=s.length-s.indexOf('.')-1; if(d<l.base)s=v.toFixed(l.base); if(s.endsWith('.'))s=s.slice(0,-1); return s; };
  const groups=[]; for(const l of leaves){ let g=groups.find(g=>g.tech===l.tech); if(!g){ const t=(S.spec.techniques||[]).find(q=>q.id===l.tech)||{}; g={tech:l.tech,name:t.name||l.tech,short:l.short||'',limits:sent(t.limits||''),items:[]}; groups.push(g); } g.items.push(l); }
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

/* parameters on a study page: the study's own values (S.ui.params), its actions and presets, same rows as the TS plates */
function uiParams(){ const host=$('prail'), rows=UI.params||[], acts=UI.actions||[], pres=UI.presets||[];
  const decs=x=>{ const s=String(x); const i=s.indexOf('.'); return i<0?0:s.length-i-1; };
  rows.forEach(r=>{ if(r.type!=='range')return; const l={path:r.id,range:[r.min,r.max],value:r.value,step:r.step}; r.st=stepOf(l); r.dec=decOf(r.st); r.base=r.st>=1?0:Math.min(r.dec,Math.max(decs(r.value),decs(r.min),decs(r.max),decs(r.step||0))); });
  const fmt=(r,v)=>{ v=+v; if(!isFinite(v))return ''; if(r.st>=1)return String(Math.round(v)); let s=v.toFixed(Math.min(6,r.dec+1)).replace(/0+$/,''); const d=s.length-s.indexOf('.')-1; if(d<r.base)s=v.toFixed(r.base); if(s.endsWith('.'))s=s.slice(0,-1); return s; };
  const groups=[]; for(const r of rows){ let g=groups.find(g=>g.name===r.group); if(!g){ g={name:r.group||'Plate',items:[]}; groups.push(g); } g.items.push(r); }
  const top=(acts.length?`<div class="acts">${acts.map((a,i)=>`<button type="button" class="btn" data-a="${i}" title="${esc(a.title||'')}">${esc(a.relabel?a.relabel():a.label)}</button>`).join('')}</div>`:'')
    +(pres.length?`<div class="pres"><span class="ph">Presets</span><div class="chips">${pres.map((p,i)=>`<button type="button" class="cb" data-p="${i}" aria-pressed="false" title="${esc(p.title||'')}">${esc(p.label)}</button>`).join('')}</div></div>`:'');
  const row=(r,i)=>{ const lab=`<label class="lb" for="pr${i}" title="${esc(r.why||r.label)}"><span class="nm">${esc(r.label)}</span>${String(r.id).toLowerCase()!==String(r.label).toLowerCase()?`<span class="key">${esc(r.id)}</span>`:''}</label>`;
    if(r.type==='text')return `<div class="prm txt" data-i="${i}">${lab}<input id="pr${i}" class="tx" type="text" maxlength="${r.maxLength||240}" placeholder="${esc(r.placeholder||'')}" value="${esc(r.value||'')}" spellcheck="false" autocomplete="off" aria-label="${esc(r.label)}"${r.why?` title="${esc(r.why)}"`:''}><button type="button" class="rst" tabindex="-1" title="Back to the measured value" aria-label="Reset ${esc(r.label)}">${ICON.reset}</button></div>`;
    if(r.type==='choice')return `<div class="prm ch" data-i="${i}">${lab}<div class="seg sm" role="radiogroup" aria-label="${esc(r.label)}">${r.options.map((o,k)=>`<button type="button" role="radio" aria-checked="false" data-k="${k}">${esc(o.label)}</button>`).join('')}</div><button type="button" class="rst" tabindex="-1" title="Back to the measured value" aria-label="Reset ${esc(r.label)}">${ICON.reset}</button></div>`;
    return `<div class="prm" data-i="${i}">${lab}<input id="pr${i}" type="range" min="${r.min}" max="${r.max}" step="${r.st}" value="${r.value}" aria-label="${esc(r.label)}"${r.why?` title="${esc(r.why)}"`:''}><span class="vf"><input class="num" value="${fmt(r,r.value)}" inputmode="decimal" spellcheck="false" autocomplete="off" aria-label="${esc(r.label)} value"><span class="un">${esc(r.unit||'')}</span></span><button type="button" class="rst" tabindex="-1" title="Back to ${fmt(r,r.value)}${r.unit?' '+esc(r.unit):''}" aria-label="Reset ${esc(r.label)}">${ICON.reset}</button></div>`; };
  if(!rows.length){ host.innerHTML=top+'<p class="empty">This study has no adjustable values. Its numbers are in the spec.</p>'; if(!acts.length&&!pres.length){ $('mParams').classList.add('none'); $('mParams').querySelector('.hint').hidden=true; } bindTop(); return; }
  host.innerHTML=top+groups.map((g,gi)=>`<div class="pg" data-g="${gi}"><button type="button" class="pgh" aria-expanded="true"><span class="pgn">${esc(g.name)}</span><span class="pgc"><i class="chg" hidden></i>${g.items.length}</span>${ICON.chev}</button><div class="pgb">${g.items.map(r=>row(r,rows.indexOf(r))).join('')}<button type="button" class="pgr" hidden>Reset ${esc(String(g.name).toLowerCase())}</button></div></div>`).join('');
  const el=i=>host.querySelector(`.prm[data-i="${i}"]`);
  const same=(r,v)=>r.type==='range'?Math.abs(+v-(+r.value))<1e-9:String(v)===String(r.value);
  const fill=(rg,r,v)=>rg.style.setProperty('--p',(100*(v-r.min)/((r.max-r.min)||1)).toFixed(2)+'%');
  const show=(i,v)=>{ const r=rows[i], e=el(i); if(!e)return; if(r.type==='range'){ const rg=e.querySelector('input[type=range]'), nm=e.querySelector('.num'); if(document.activeElement!==rg)rg.value=v; fill(rg,r,+v); if(document.activeElement!==nm)nm.value=fmt(r,v); }
    else if(r.type==='text'){ const t=e.querySelector('.tx'); if(document.activeElement!==t)t.value=v==null?'':v; } else e.querySelectorAll('.seg button').forEach(b=>{ const on=r.options[+b.dataset.k].v===v; b.classList.toggle('on',on); b.setAttribute('aria-checked',String(on)); });
    e.classList.toggle('on',!same(r,v)); };
  const marks=()=>{ let n=0; host.querySelectorAll('.pg').forEach(pg=>{ const g=groups[+pg.dataset.g]; const c=g.items.filter(r=>!same(r,r.get())).length; n+=c; const ch=pg.querySelector('.chg'); ch.hidden=!c; ch.textContent=c+' changed · '; pg.querySelector('.pgr').hidden=!c; }); const b=$('bParamReset'); b.hidden=!n; b.textContent=`Reset all · ${n}`; pres.forEach((p,i)=>{ const b=host.querySelector(`.cb[data-p="${i}"]`); const on=!!(p.on&&p.on()); b.classList.toggle('on',on); b.setAttribute('aria-pressed',String(on)); }); acts.forEach((a,i)=>{ if(a.relabel){ const b=host.querySelector(`.acts [data-a="${i}"]`); if(b)b.textContent=a.relabel(); } }); };
  const put=(i,v,commit)=>{ const r=rows[i]; if(r.type==='range')v=clamp(+v,r.min,r.max); r.set(v,!commit); if(commit&&r.commit)r.commit(); show(i,v); marks(); dirty=true; };
  rows.forEach((r,i)=>{ const e=el(i); show(i,r.get()); e.querySelector('.rst').onclick=()=>put(i,r.value,true);
    if(r.type==='range'){ const rg=e.querySelector('input[type=range]'), nm=e.querySelector('.num');
      rg.oninput=()=>put(i,+rg.value,false); rg.onchange=()=>put(i,+rg.value,true); rg.ondblclick=()=>put(i,r.value,true);
      const commit=()=>{ const v=parseFloat(nm.value.replace(',','.')); if(isFinite(v)){ if(v<r.min||v>r.max){ nm.classList.add('bad'); setTimeout(()=>nm.classList.remove('bad'),700); } put(i,v,true); } else nm.value=fmt(r,r.get()); };
      nm.onkeydown=e2=>{ if(e2.key==='Enter'){ e2.preventDefault(); commit(); nm.select(); } else if(e2.key==='Escape'){ nm.value=fmt(r,r.get()); nm.blur(); } else if(e2.key==='ArrowUp'||e2.key==='ArrowDown'){ e2.preventDefault(); const f=e2.altKey&&r.st<1?0.1:1, k=(e2.shiftKey?10:1)*f*(e2.key==='ArrowUp'?1:-1); const cur=parseFloat(nm.value)||+rg.value; const q=r.st*f; put(i,Math.round((cur+k*r.st)/q)*q,false); nm.value=fmt(r,clamp(Math.round((cur+k*r.st)/q)*q,r.min,r.max)); } };
      nm.onkeyup=e2=>{ if(e2.key==='ArrowUp'||e2.key==='ArrowDown')put(i,parseFloat(nm.value),true); }; nm.onblur=commit; nm.onfocus=()=>nm.select(); }
    else if(r.type==='text'){ const t=e.querySelector('.tx'); const commit=()=>{ if(String(t.value)!==String(r.get()))put(i,t.value,true); }; t.onkeydown=e2=>{ if(e2.key==='Enter'){ e2.preventDefault(); commit(); } else if(e2.key==='Escape'){ t.value=r.get(); t.blur(); } }; t.onblur=commit; }
    else e.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>put(i,r.options[+b.dataset.k].v,true)); });
  host.querySelectorAll('.pg').forEach(pg=>{ const g=groups[+pg.dataset.g]; const h=pg.querySelector('.pgh'); h.onclick=()=>{ const o=pg.classList.toggle('shut'); h.setAttribute('aria-expanded',String(!o)); }; pg.querySelector('.pgr').onclick=()=>{ g.items.forEach(r=>{ if(!same(r,r.get()))put(rows.indexOf(r),r.value,true); }); }; });
  $('bParamReset').onclick=()=>{ if(UI.resetAll)UI.resetAll(); else rows.forEach((r,i)=>{ if(!same(r,r.get()))put(i,r.value,true); }); setTimeout(()=>{ uiSyncRows(); uiColorDraw(); },30); dirty=true; };
  function bindTop(){ host.querySelectorAll('.acts [data-a]').forEach(b=>{ const a=acts[+b.dataset.a]; b.onclick=()=>{ a.run(); setTimeout(()=>{ uiSyncRows(); uiColorDraw(); },30); dirty=true; }; }); host.querySelectorAll('.cb[data-p]').forEach(b=>{ b.onclick=()=>{ pres[+b.dataset.p].run(); setTimeout(()=>{ uiSyncRows(); uiColorDraw(); },30); dirty=true; }; }); }
  bindTop();
  let raf=0; uiSyncRows=()=>{ if(raf)return; raf=requestAnimationFrame(()=>{ raf=0; rows.forEach((r,i)=>show(i,r.get())); marks(); }); };
  UI.on('sync',uiSyncRows); marks();
  window.__study_params={rows,set:(id,v)=>{ const i=rows.findIndex(r=>r.id===id); if(i>=0)put(i,v,true); }}; }

/* ---------- view: plate / reference / compare ---------- */
const refImg=new Image(); let refReady=false; const hasRef=!!(window.__REF&&window.__REF.data);
refImg.onload=()=>{ refReady=true; dirty=true; computeFidelity(); };
let mode=0, splitX=0.5;
const VIEW_HINT=['The rebuild, drawn in code.','The source image the technique was measured from.','Reference on the left, rebuild on the right. Move across the plate to slide the split.'];
if(hasRef)refImg.src=window.__REF.data; else { if($('tCompare')){ $('tCompare').disabled=true; $('cmpTog').classList.add('off'); $('cmpTog').title='No published reference to compare'; } $('viewHint').textContent=S.refHint||'The reference is held locally and not published, so only the rebuild is shown.'; fidEl.innerHTML=S.refHint?`<p class="none">${esc(S.refHint)}</p>`:'<p class="none">Reference held locally, not published. No match score.</p>'; }
function setMode(m){ if(!hasRef)m=0; mode=m===2?2:0; if($('tCompare'))$('tCompare').checked=mode===2; if(hasRef)$('viewHint').textContent=VIEW_HINT[mode]+(mode!==0&&fidelity?` Match ${Math.round(fidelity.sum*100)} %.`:''); dirty=true; }
if($('tCompare'))$('tCompare').onchange=()=>setMode($('tCompare').checked?2:0);
let readoutEl=null;
if(UI){ const mv=$('mView');
  if((UI.view||[]).length){ const box=document.createElement('div'); box.className='vsw'; box.innerHTML=UI.view.map((v,i)=>`<label class="sw-toggle"><input type="checkbox" data-v="${i}"><span class="tr" aria-hidden="true"></span><span class="tl">${esc(v.label)}</span></label>`).join(''); mv.appendChild(box);
    const sync=()=>box.querySelectorAll('input').forEach(c=>{ c.checked=!!UI.view[+c.dataset.v].on(); }); box.querySelectorAll('input').forEach(c=>c.onchange=()=>{ UI.view[+c.dataset.v].set(c.checked); setTimeout(sync,30); dirty=true; }); UI.on('sync',sync); setTimeout(sync,400); }
  if(UI.status){ readoutEl=document.createElement('div'); readoutEl.className='readout'; readoutEl.setAttribute('aria-live','off'); mv.appendChild(readoutEl); }
  if(UI.bench){ const pc=v=>(v*100).toFixed(1)+' %'; const row=(k,v)=>`<div class="fr"><span>${esc(k)}</span><span class="fb"><i style="width:${(Math.max(0,Math.min(1,v))*100).toFixed(1)}%"></i></span><span>${pc(v)}</span></div>`;
    const drawB=()=>{ const b=UI.bench(); if(!b){ fidEl.innerHTML='<p class="fh">Measuring against the reference statistics…</p>'; return; } if(b.err){ fidEl.innerHTML=`<p class="none">The benchmark failed: ${esc(b.err)}</p>`; return; }
      const lo=b.rows.reduce((a,r)=>r.v<a.v?r:a,b.rows[0]), n98=b.rows.filter(r=>r.v>=0.98).length; const pats=[...new Set(b.rows.map(r=>r.patch))];
      fidEl.innerHTML=`<p class="fh">${esc(UI.benchNote?UI.benchNote():'')} The reference is held locally and is not in this page.</p>${pats.map(pn=>{ const rs=b.rows.filter(r=>r.patch===pn); return row(cap1(pn),rs.reduce((s,r)=>s+r.v,0)/rs.length); }).join('')}<div class="fr"><span>Lowest · ${esc(lo.patch)} ${esc(lo.metric)}</span><span></span><span>${pc(lo.v)}</span></div><div class="fr"><span>At or above 98 %</span><span></span><span>${n98} / ${b.rows.length}</span></div><div class="fr sum"><span>Match</span><span class="fb"><i style="width:${(b.mean*100).toFixed(1)}%"></i></span><span>${pc(b.mean)}</span></div>`;
      if(!hasRef)$('viewHint').textContent=`The reference is held locally and not published. Measured against its statistics, the plate matches ${pc(b.mean)}.`; };
    UI.on('bench',drawB); drawB(); } }
function cap1(s){ s=String(s||''); return s.charAt(0).toUpperCase()+s.slice(1); }

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
(function(){ const mine=new Set(me.techniques||[]); const myAtoms=new Set(VOC.atoms[S.id]||(S.spec.techniques||[]).flatMap(t=>t.atoms||[])); const isSt=me.section==='studies'; const scored=TT.entries.filter(e=>e.id!==S.id&&!e.hidden&&(e.section==='techniques'||(isSt&&e.section==='studies'))).map(e=>{ const shared=(e.techniques||[]).filter(t=>mine.has(t)); const atomsShared=(VOC.atoms[e.id]||[]).filter(a=>myAtoms.has(a)); const rel=(me.related||[]).includes(e.id); const fam=isSt&&me.family&&e.family===me.family; return {e,shared,atomsShared,rel,fam,score:(rel?10:0)+shared.length*2+atomsShared.length+(fam?3:0)}; }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).slice(0,4);
  if(!relEl)return; if(!scored.length){ relEl.innerHTML='<p class="none">No other study shares a technique with this one yet.</p>'; return; }
  relEl.innerHTML=scored.map(({e,shared,atomsShared,rel,fam})=>`<a class="r" href="${ROOT}${e.path}index.html"><img src="${ROOT}${e.path}thumb.png" alt="" loading="lazy"><span class="name">${esc(e.title)}<i>${esc(e.code)}</i></span><span class="via">${rel?'related':(shared[0]||atomsShared[0]?'shares '+esc(shared[0]||atomsShared[0]):'same family')}</span></a>`).join(''); })();

/* ---------- motion + interactive ---------- */
let liveOn=false, motionOn=false, mArt=null, mCtx=null, mT0=0;
const LIVE_LABEL=S.liveLabel||'Interactive';
(function(){ if(UI){ uiMotion(); return; } const has=!!S.motion, live=IFRAME; $('bMotion').hidden=!has; $('bLive').hidden=!live; $('liveLabel').textContent=LIVE_LABEL;
  if(!has&&!live){ $('motionRow').innerHTML='<span class="btn off" aria-disabled="true">Still plate</span>'; $('motionHint').textContent='This study has no motion or interactive version.'; $('mMotion').classList.add('none'); return; }
  $('motionHint').textContent=[has?(S.motionHint||'Play runs the plate as a loop.'):'', live?(S.liveHint||`${LIVE_LABEL} opens the working version in place of the plate.`):''].filter(Boolean).join(' ');
  if(has)$('bMotion').onclick=()=>setMotion(!motionOn); if(live)$('bLive').onclick=()=>setLive(!liveOn);
  if(has!==live)(has?$('bMotion'):$('bLive')).style.gridColumn='1/3';
  if(live&&!/pointer/i.test(LIVE_LABEL))$('bLive').querySelector('svg').outerHTML='<svg viewBox="0 0 12 12" aria-hidden="true" style="fill:none;stroke:currentColor;stroke-width:1.3"><path d="M5 2H2v8h8V7"/><path d="M7 1.5h3.5V5M10.5 1.5L5.5 6.5"/></svg>'; })();
function motionState(){ if(UI){ const m=!!(UI.motion&&UI.motion.on()), l=!!(UI.interactive&&UI.interactive.on()); $('motionState').textContent=m?'Playing':(l?UI.interactive.label:'Still'); $('motionState').classList.toggle('hot',m||l);
    const bm=$('bMotion'), bl=$('bLive'); if(bm){ bm.classList.toggle('on',m); bm.setAttribute('aria-pressed',String(m)); bm.querySelector('span').textContent=m?'Pause':'Play'; } if(bl){ bl.classList.toggle('on',l); bl.setAttribute('aria-pressed',String(l)); } return; }
  $('motionState').textContent=motionOn?'Playing':(liveOn?LIVE_LABEL:'Still'); $('motionState').classList.toggle('hot',motionOn||liveOn); }
/* motion on a study page: Play runs the study's own motion; the second button is its drag or draw mode */
function uiMotion(){ const M=UI.motion, I=UI.interactive; $('bMotion').hidden=!M; $('bLive').hidden=!I; if(I)$('liveLabel').textContent=I.label;
  if(!M&&!I){ if(UI.pointerHint){ $('motionRow').innerHTML='<span class="btn off" aria-disabled="true">Pointer on the plate</span>'; $('motionHint').textContent=UI.pointerHint; } else { $('motionRow').innerHTML='<span class="btn off" aria-disabled="true">Still plate</span>'; $('motionHint').textContent='This study has no motion or interactive version.'; $('mMotion').classList.add('none'); } return; }
  $('motionHint').textContent=[M?(S.motionHint||'Play runs the plate as a loop.'):'', I?(S.liveHint||''):'', UI.pointerHint||''].filter(Boolean).join(' ');
  if(M)$('bMotion').onclick=()=>{ M.set(!M.on()); motionState(); dirty=true; }; if(I)$('bLive').onclick=()=>{ I.set(!I.on()); motionState(); dirty=true; };
  if(!M||!I)(M?$('bMotion'):$('bLive')).style.gridColumn='1/3';
  if(I&&!/pointer|drag/i.test(I.label))$('bLive').querySelector('svg').outerHTML='<svg viewBox="0 0 12 12" aria-hidden="true" style="fill:none;stroke:currentColor;stroke-width:1.3"><path d="M2 10l1.2-3.4L8.6 1.2l2.2 2.2-5.4 5.4z"/></svg>';
  UI.on('sync',motionState); motionState(); }
function placeLive(){ if(!IFRAME)return; const f=liveEl.querySelector('iframe'); if(!f)return; f.style.left=fig.x+'px'; f.style.top=fig.y+'px'; f.style.width=fig.w+'px'; f.style.height=fig.h+'px'; }
if(IFRAME){ const f=document.createElement('iframe'); f.setAttribute('title',`${S.code} ${LIVE_LABEL.toLowerCase()} version`); liveEl.appendChild(f); }
function setLive(o){ if(o&&motionOn)setMotion(false); liveOn=o; liveEl.classList.toggle('on',o); $('bLive').classList.toggle('on',o); $('bLive').setAttribute('aria-pressed',String(o)); if(o){ const f=liveEl.querySelector('iframe'); f.srcdoc=typeof S.live==='function'?S.live(variant(),overrides):S.live; } placeLive(); motionState(); dirty=true; }
function setMotion(o){ if(o&&liveOn)setLive(false); motionOn=o; const b=$('bMotion'); b.classList.toggle('on',o); b.setAttribute('aria-pressed',String(o)); b.querySelector('span').textContent=o?'Pause':'Play'; if(o){ mArt=document.createElement('canvas'); mArt.width=Math.round(fig.w*DPR); mArt.height=Math.round(fig.h*DPR); mCtx=mArt.getContext('2d'); mCtx.setTransform(DPR,0,0,DPR,0,0); mT0=performance.now(); } else { mArt=null; ensureArt(); } motionState(); dirty=true; }

/* ---------- export ---------- */
$('bCopy').onclick=async()=>{ const b=$('bCopy'); refreshSpec(); try{ await navigator.clipboard.writeText(specJSON); b.textContent='Copied'; }catch(e){ b.textContent='Copy failed'; } b.classList.add('on'); setTimeout(()=>{ b.textContent='Copy spec'; b.classList.remove('on'); },1400); };
$('bPng').onclick=()=>{ if(UI&&UI.save){ UI.save(); return; } const src=motionOn?mArt:art; if(!src)return; src.toBlob(bl=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(bl); const ed=Object.keys(overrides).length||(inkEdits[vi]&&Object.keys(inkEdits[vi]).length); a.download=`${S.id}-${variants[vi].id}${ed?'-edited':''}.png`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); },'image/png'); };

/* ---------- chrome drawn on the canvas ---------- */
let phase='pre', pt=0, lastNow=performance.now(), uiT=0, uiM0=null, uiL0=null, uiMsg0=null; const READ=reduced?0.01:2.6;
const headPos=t=>smooth(0,READ,t);
function drawChrome(){ ctx.strokeStyle=INK50; ctx.lineWidth=0.5; ctx.strokeRect(px(fig.x),px(fig.y),fig.w,fig.h);
  ctx.beginPath(); for(const q of [0.25,0.5,0.75]){ const X=px(fig.x+fig.w*q), Y=px(fig.y+fig.h*q); ctx.moveTo(X,fig.y+0.5); ctx.lineTo(X,fig.y+3.5); ctx.moveTo(X,fig.y+fig.h-0.5); ctx.lineTo(X,fig.y+fig.h-3.5); ctx.moveTo(fig.x+0.5,Y); ctx.lineTo(fig.x+3.5,Y); ctx.moveTo(fig.x+fig.w-0.5,Y); ctx.lineTo(fig.x+fig.w-3.5,Y); } ctx.stroke();
  ctx.strokeStyle=INK; ctx.lineWidth=0.75; const g=2,l=10; const X0=fig.x-g, X1=fig.x+fig.w+g, Y0=fig.y-g, Y1=fig.y+fig.h+g;
  ctx.beginPath(); ctx.moveTo(X0+0.5,Y0-l); ctx.lineTo(X0+0.5,Y0+0.5); ctx.lineTo(X0-l,Y0+0.5); ctx.moveTo(X1-0.5,Y0-l); ctx.lineTo(X1-0.5,Y0+0.5); ctx.lineTo(X1+l,Y0+0.5); ctx.moveTo(X0+0.5,Y1+l); ctx.lineTo(X0+0.5,Y1-0.5); ctx.lineTo(X0-l,Y1-0.5); ctx.moveTo(X1-0.5,Y1+l); ctx.lineTo(X1-0.5,Y1-0.5); ctx.lineTo(X1+l,Y1-0.5); ctx.stroke();
  const cap=(mobile()?`FIG. ${S.fig||'1'} · ${S.code}`:`FIG. ${S.fig||'1'} · ${S.title} · ${S.code}`).toUpperCase(); text(cap,fig.x+(mobile()?0:12),fig.y-13,9.5,0.16,INK50);
  let st=''; const msg=UI&&UI.message?UI.message():null; const uiM=UI&&UI.motion&&UI.motion.on(), uiI=UI&&UI.interactive&&UI.interactive.on();
  if(msg)st=msg.toUpperCase(); else if(motionOn||uiM)st='PLAYING'; else if(liveOn)st=LIVE_LABEL.toUpperCase(); else if(uiI)st=UI.interactive.label.toUpperCase(); else if(!artDone&&phase!=='pre')st='DRAWING…'; else if(phase==='read')st='BUILDING · '+String(Math.round(headPos(pt)*100)).padStart(3,'0')+' %'; else if(phase==='hold')st=mode===1?'REFERENCE':(mode===2?'COMPARE':'STILL'); else st='DRAWING…'; text(st,fig.x+fig.w-(mobile()?0:12),fig.y-13,9.5,0.16,st==='STILL'||st.startsWith('BUILDING')?INK:ACC,'right');
  const by=fig.y+fig.h+18; ctx.font=FONT(9.5); track(9.5,0.16); const lab='PLATE · ', s2=` ${S.code} CORE `; const w1=ctx.measureText(lab).width, w2=ctx.measureText(s2).width; if(hasLS)ctx.letterSpacing='0px';
  text(lab,fig.x,by,9.5,0.16,GREY); const sx=fig.x+w1+2, sy=by-7.5; const spot=(variant().spot||S.spot||[16,16,20]); ctx.fillStyle=`rgb(${spot.join(',')})`; ctx.fillRect(Math.round(sx),Math.round(sy),7,7); ctx.strokeStyle=INK; ctx.lineWidth=0.5; ctx.strokeRect(Math.round(sx)+0.5,Math.round(sy)+0.5,7,7);
  text(s2,sx+11,by,9.5,0.16,GREY); text(spot.map(c=>c|0).join(' · '),sx+11+w2,by,9.5,0.16,INK);
  if(!mobile()){ let ed=Object.keys(overrides).length||(inkEdits[vi]&&Object.keys(inkEdits[vi]).length), pl=variants[vi].label;
    if(UI){ const P=UI.palettes; pl=P&&P.list[P.current()]?P.list[P.current()].label:'Measured inks'; ed=!!((P&&P.edited&&P.edited(P.current()))||(UI.params||[]).some(r=>{ const v=r.get(); return r.type==='range'?Math.abs(+v-(+r.value))>1e-9:String(v)!==String(r.value); })); }
    const rs=`${pl}${ed?' · EDITED':''}`.toUpperCase(); ctx.font=FONT(9.5); track(9.5,0.16); const rw=ctx.measureText(rs).width, leftEnd=sx+11+w2+ctx.measureText(spot.join(' · ')).width; if(hasLS)ctx.letterSpacing='0px'; const rx=fig.x+fig.w; if(rx-rw>leftEnd+24)text(rs,rx,by,9.5,0.16,ed?ACC:GREY,'right'); } }
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
  if(phase==='pre'){ if(artDone){ phase='hold'; pt=1; for(const t of P)t.lock=0; rows.forEach((r,i)=>rowText(r,P[i],[P[i].u,P[i].v],true)); ctrEl.textContent=`${P.length} / ${P.length}`; dirty=true; } }
  if(phase==='read'){ pt+=dt; work=true; const y=fig.y+fig.h*headPos(pt); let n=0; for(const t of P){ if(t.lock<0&&t.y<=y)t.lock=pt; if(t.lock>=0)n++; } ctrEl.textContent=`${n} / ${P.length}`;
    rows.forEach((r,i)=>{ const t=P[i]; if(t.lock<0)return; const e=clamp((pt-t.lock)/0.24,0,1); rowText(r,t,[t.u*e,t.v*e],e>=1); });
    if(pt>=READ+0.3){ phase='hold'; for(const t of P)if(t.lock<0)t.lock=pt; rows.forEach((r,i)=>rowText(r,P[i],[P[i].u,P[i].v],true)); ctrEl.textContent=`${P.length} / ${P.length}`; dirty=true; } }
  else if(phase==='hold'){ for(const t of P)if(t.lock>=0&&pt-t.lock<0.4)work=true; pt+=dt; }
  if(motionOn&&mArt){ work=true; try{ S.motion(mArt,fig.w,fig.h,DPR,variant(),(now-mT0)/1000,mCtx,overrides); }catch(e){ console.error(e); setMotion(false); } }
  const L=ENG(); if(L){ try{ if(L.tick)L.tick(now,dt); }catch(e){ console.error(e); L.tick=null; } if(L.dirty){ L.dirty=false; dirty=true; } }
  if(UI&&now-uiT>220){ uiT=now; if(readoutEl){ const st=UI.status(); const t=Array.isArray(st)?st.join('\n'):(st||''); if(readoutEl.textContent!==t)readoutEl.textContent=t; } const m=!!(UI.motion&&UI.motion.on()), l=!!(UI.interactive&&UI.interactive.on()), g=UI.message?UI.message():null; if(m!==uiM0||l!==uiL0){ uiM0=m; uiL0=l; motionState(); } if(g!==uiMsg0){ uiMsg0=g; dirty=true; } }
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
const uvOf=e=>{ const r=cv.getBoundingClientRect(); const x=e.clientX-r.left,y=e.clientY-r.top; return {x,y,u:(x-fig.x)/fig.w,v:(y-fig.y)/fig.h,inside:x>=fig.x&&x<=fig.x+fig.w&&y>=fig.y&&y<=fig.y+fig.h,fig}; };
const LV=()=>{ const L=ENG(); return L&&L.pointer?L:null; };
cv.addEventListener('pointerdown',e=>{ const L=LV(); if(!L)return; const p=uvOf(e); if(!p.inside||hover||mode===2)return; try{ cv.setPointerCapture(e.pointerId); }catch(err){} L.pointer('down',p,e); });
cv.addEventListener('pointermove',e=>{ const L=LV(); if(L)L.pointer('move',uvOf(e),e); });
cv.addEventListener('pointerup',e=>{ const L=LV(); if(L)L.pointer('up',uvOf(e),e); });
cv.addEventListener('pointercancel',e=>{ const L=LV(); if(L)L.pointer('cancel',uvOf(e),e); });
cv.addEventListener('wheel',e=>{ const L=LV(); if(!L)return; const p=uvOf(e); if(!p.inside)return; e.preventDefault(); L.pointer('wheel',p,e); },{passive:false});
cv.addEventListener('contextmenu',e=>{ if(LV()&&uvOf(e).inside)e.preventDefault(); });
addEventListener('keyup',e=>{ const L=ENG(); if(L&&L.keyup)L.keyup(e); });
addEventListener('blur',()=>{ const L=ENG(); if(L&&L.blur)L.blur(); });
cv.addEventListener('click',()=>{ if(hover)select(hover); });
$('bSpec').onclick=()=>openSpec(!specEl.classList.contains('open')); $('specclose').onclick=()=>openSpec(false);
$('speccopy').onclick=async()=>{ refreshSpec(); try{ await navigator.clipboard.writeText(specJSON); $('speccopy').textContent='Copied'; setTimeout(()=>$('speccopy').textContent='Copy',1200);}catch(e){} };
/* expand (F): the notes column folds away and the plate takes its width; remembered per browser */
let wide=false; try{ wide=localStorage.getItem('tt-wide')==='1'; }catch(e){}
function setWide(o){ wide=o; document.body.classList.toggle('wide',o); const b=$('bWide'); if(b){ b.classList.toggle('on',o); b.setAttribute('aria-pressed',String(o)); b.querySelector('span').textContent=o?'Collapse':'Expand'; } try{ localStorage.setItem('tt-wide',o?'1':'0'); }catch(e){} requestAnimationFrame(()=>{ layout(); dirty=true; }); }
if($('bWide')){ $('bWide').onclick=()=>setWide(!wide); } if(wide)setWide(true);
addEventListener('keydown',e=>{ if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return; if(e.metaKey||e.ctrlKey||e.altKey)return; const k=e.key.toLowerCase(); if(k==='f'){ setWide(!wide); return; }
  const L=ENG(); const toEngine=()=>{ if(L&&L.key&&L.key(e)){ e.preventDefault(); setTimeout(()=>{ uiSyncRows(); uiColorDraw(); motionState(); },30); dirty=true; return true; } return false; };
  /* an instrument page (ST-09…11) owns its keys first; the shell keeps R, S, F, space, Escape and / */
  if(UI&&UI.engineFirst&&!['r','s','/','escape',' '].includes(k)&&toEngine())return;
  if(k==='r'&&hasRef)setMode(mode===2?0:2); else if(k==='s')openSpec(!specEl.classList.contains('open'));
  else if(k==='v'&&(UI?(UI.palettes&&UI.palettes.list.length>1):variants.length>1))setVariant(vi+1);
  else if(k==='m'&&(UI?UI.motion:S.motion)){ if(UI){ UI.motion.set(!UI.motion.on()); motionState(); dirty=true; } else setMotion(!motionOn); }
  else if(k==='l'&&(UI?UI.interactive:IFRAME)){ if(UI){ UI.interactive.set(!UI.interactive.on()); motionState(); dirty=true; } else setLive(!liveOn); }
  else if(e.key==='Escape')openSpec(false);
  else if(e.key===','&&!(UI&&UI.engineFirst)&&sib[idx-1])location.href=ROOT+sib[idx-1].path+'index.html'; else if(e.key==='.'&&!(UI&&UI.engineFirst)&&sib[idx+1])location.href=ROOT+sib[idx+1].path+'index.html'; else if(e.key==='/')location.href=ROOT+'index.html';
  else toEngine(); });
let rto=null; addEventListener('resize',()=>{ clearTimeout(rto); rto=setTimeout(()=>{ layout(); dirty=true; },120); });
/* wait for the inlined fonts before the first render (art modules draw type) */
let started=false; const go=()=>{ if(started)return; started=true; layout(); dirty=true; if(S.liveOnLoad&&S.live&&!liveOn)setLive(true); };
if(document.fonts){ Promise.all(['700 20px Archivo','400 12px Inter','400 12px "JetBrains Mono"'].map(f=>document.fonts.load(f).catch(()=>{}))).then(go); setTimeout(go,2500); } else go();
/* ---------- your presets: palette, inks and every parameter, saved by name; one can load on open ----------
   Kept in this browser (localStorage). "Copy link" puts the preset in the address (#preset=…), so anyone who opens it sees it. */
(function(){ const host=$('mypre'); if(!host)return; const KEY='tt-presets:'+(S.id||S.code);
  const load=()=>{ try{ return JSON.parse(localStorage.getItem(KEY))||[]; }catch(e){ return []; } }, save=L=>{ try{ localStorage.setItem(KEY,JSON.stringify(L)); }catch(e){} };
  const P=()=>window.__study_params||{};
  function capture(){ if(UI){ const pal=UI.palettes; return { m:'ui', p:pal?pal.current():0, inks:pal&&pal.inks?pal.inks().filter(k=>k.hex!==k.base).map(k=>[k.key,k.hex]):[], r:(UI.params||[]).map(r=>[r.id,r.get()]) }; }
    return { m:'ts', v:vi, inks:Object.assign({},inkEdits[vi]||{}), o:JSON.parse(JSON.stringify(overrides)) }; }
  function apply(d){ if(!d)return; try{
    if(d.m==='ui'&&UI){ const pal=UI.palettes; if(pal){ pal.set(d.p||0); if(pal.setInk&&d.inks){ const inks=pal.inks?pal.inks():[]; for(const [k,v] of d.inks){ const ink=inks.find(x=>x.key===k); if(ink)pal.setInk(ink,v); } } }
      for(const [id,v] of d.r||[])if(P().set)P().set(id,v); setTimeout(()=>{ try{ uiSyncRows(); uiColorDraw(); }catch(e){} },30); }
    else if(d.m==='ts'){ if(typeof d.v==='number'&&d.v!==vi&&variants[d.v]){ vi=d.v; palEl.querySelectorAll('button').forEach((b,k)=>{ b.classList.toggle('on',k===vi); b.setAttribute('aria-checked',String(k===vi)); }); }
      inkEdits[vi]=Object.assign({},d.inks||{}); drawInks();
      const rb=$('bParamReset'); if(rb&&!rb.hidden)rb.click();
      for(const [tech,o] of Object.entries(d.o||{}))for(const [path,v] of Object.entries(o))if(P().set)P().set(tech,path,v);
      refresh(); }
    dirty=true; }catch(e){ console.error(e); } }
  const enc=d=>btoa(unescape(encodeURIComponent(JSON.stringify(d)))).replace(/=+$/,''), dec=t=>{ try{ return JSON.parse(decodeURIComponent(escape(atob(t)))); }catch(e){ return null; } };
  let naming=false, note='';
  function draw(){ const L=load();
    host.innerHTML=`<div class="mph"><span>Your presets${L.length?` · ${L.length}`:''}</span><button type="button" class="ghost" id="bPreNew">${naming?'Cancel':'Save current'}</button></div>`
      +(naming?`<div class="mpn"><input id="preName" type="text" maxlength="40" placeholder="Name this preset" aria-label="Preset name"><label class="sw-toggle"><input type="checkbox" id="preOn"><span class="tr" aria-hidden="true"></span><span class="tl">On load</span></label><button type="button" class="btn" id="bPreOk">Save</button></div>`:'')
      +(L.length?`<ul>${L.map((x,i)=>`<li><button type="button" class="pn" data-a="${i}" title="Apply">${esc(x.name)}</button><label class="ol" title="Open this study with this preset"><input type="radio" name="preOnload" data-o="${i}"${x.onload?' checked':''}><span>On load</span></label><button type="button" class="ic" data-l="${i}" title="Copy a link that opens with this preset">Link</button><button type="button" class="ic" data-d="${i}" title="Delete" aria-label="Delete ${esc(x.name)}">×</button></li>`).join('')}</ul>`:'')
      +(L.some(x=>x.onload)?`<button type="button" class="ghost clr" id="bPreOff">Open with the defaults</button>`:'')+`<p class="mpnote" aria-live="polite">${esc(note)}</p>`;
    $('bPreNew').onclick=()=>{ naming=!naming; note=''; draw(); if(naming)$('preName').focus(); };
    if(naming){ const ok=()=>{ const n=$('preName').value.trim()||('Preset '+(L.length+1)); const on=$('preOn').checked; const L2=load().map(x=>on?Object.assign(x,{onload:false}):x); L2.push({name:n,onload:on,d:capture()}); save(L2); naming=false; note=on?`Saved. "${n}" opens on load in this browser.`:`Saved "${n}".`; draw(); };
      $('bPreOk').onclick=ok; $('preName').onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); ok(); } else if(e.key==='Escape'){ naming=false; draw(); } }; }
    host.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{ apply(load()[+b.dataset.a].d); note=`Applied "${load()[+b.dataset.a].name}".`; draw(); });
    host.querySelectorAll('[data-o]').forEach(r=>r.onchange=()=>{ const L2=load().map((x,k)=>Object.assign(x,{onload:k===+r.dataset.o})); save(L2); note=`"${L2[+r.dataset.o].name}" opens on load in this browser.`; draw(); });
    host.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{ const x=load()[+b.dataset.l]; const u=location.href.split('#')[0]+'#preset='+enc(x.d); const done=()=>{ note='Link copied: it opens with "'+x.name+'".'; draw(); };
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(done,()=>{ note=u; draw(); }); else { note=u; draw(); } });
    host.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{ const L2=load(); L2.splice(+b.dataset.d,1); save(L2); draw(); });
    const off=$('bPreOff'); if(off)off.onclick=()=>{ save(load().map(x=>Object.assign(x,{onload:false}))); note='Opens with the defaults.'; draw(); }; }
  draw();
  /* on open: a preset in the address wins, then the one marked on load */
  const fromUrl=(location.hash.match(/[#&]preset=([^&]+)/)||[])[1];
  const first=fromUrl?dec(fromUrl):((load().find(x=>x.onload)||{}).d);
  if(first){ let tries=0; const go=()=>{ if(window.__study_params||++tries>40){ apply(first); } else setTimeout(go,50); }; setTimeout(go,60); }
})();
window.__study={S,fig:()=>fig,art:()=>art,fidelity:()=>fidelity,setMode,setVariant,setMotion,setLive,setNotes,variants,variant,inks:()=>inksOf(variants[vi]),setInk:(h,v)=>{ (inkEdits[vi]??={})[norm(h)]=norm(v); drawInks(); refresh(); }};
})();
