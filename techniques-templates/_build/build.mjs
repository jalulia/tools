// node _build/build.mjs [id …]   — run from the site root.
// For every manifest entry: writes <path>/index.html from _build/page.html, <path>/ref.js from <path>/ref.(png|jpg)
// (≤ 900 px, JPEG q88), <path>/spec.json from study.js, and the aggregate techniques.json + atoms.json at the root.
// Thumbs are rendered by `node _build/render.mjs`.
//
// Static read (2026-10-14): every page is also legible without scripts. The plate's nav, notes column, the ten
// reads and the spec are baked into index.html at build time; the root index.html gets its nav and the full card
// grid baked between its <nav>/<main> tags (the inline script re-renders the same markup over it, so nothing moves).
// A text-only reader — curl, a crawler, an LLM that cannot run the plate — now sees what the browser sees.
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { execSync } from 'node:child_process'; import { pathToFileURL } from 'node:url';
const root=process.cwd();
const TT=(()=>{ const ctx={window:{}}; vm.runInNewContext(fs.readFileSync('_shared/entries.js','utf8'),ctx); return ctx.window.TT; })();
const only=process.argv.slice(2);
const tpl=fs.readFileSync('_build/page.html','utf8');
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const techIndex={}, atomIndex={}; const LIFTED=[];
// _shared/art.js helper sources, keyed by name, for inlining into lifted technique modules (spec v2)
const ART_SRC=(()=>{ const out={}; let cur=null; for(const ln of fs.readFileSync('_shared/art.js','utf8').split('\n')){ const m=ln.match(/^A\.(\w+)=/); if(m){ cur=m[1]; out[cur]=ln; continue; } if(/^return A;/.test(ln))cur=null; else if(cur&&!/^\/\*/.test(ln))out[cur]+='\n'+ln; } return out; })();
const helpersFor=src=>{ const need=new Set(); const scan=t=>{ for(const m of t.matchAll(/\bA\.(\w+)\b/g)){ const n=m[1]; if(ART_SRC[n]&&!need.has(n)){ need.add(n); scan(ART_SRC[n]); } } }; scan(src); return [...need]; };
const plateNav=(S,e)=>{ const section=TT.sections.find(s=>s.id===e.section)||{id:e.section,title:e.section}; const sib=TT.entries.filter(x=>x.section===e.section); const idx=sib.findIndex(x=>x.id===e.id); const prev=sib[idx-1], next=sib[idx+1]; const R='../../';
  return `<a class="brand" href="${R}index.html" title="Index">${TT.mark||''}<span class="wm">IMP<i>Ø</i>SSIBLE</span></a>
  <span class="crumb"><a href="${R}index.html">Techniques &amp; Templates</a><span class="sep">/</span><a href="${R}index.html#${esc(section.id)}">${esc(section.title)}</a><span class="sep">/</span><b>${esc(S.title)}</b><span class="code">${esc(S.code)}</span></span>
  <span class="pager">${prev?`<a href="${R}${prev.path}index.html" title="${esc(prev.title)}">← ${esc(prev.code)}</a>`:'<a class="off">←</a>'}<a href="${R}index.html#${esc(section.id)}"><span class="n">${idx+1}</span>&nbsp;/ ${sib.length}</a>${next?`<a href="${R}${next.path}index.html" title="${esc(next.title)}">${esc(next.code)} →</a>`:'<a class="off">→</a>'}</span>`; };
// Mirrors shell.js's notes column, then adds what only exists on the canvas at runtime: the techniques with their
// one-line implementations and the ten numbered reads. shell.js replaces all of this once it runs.
const plateNotes=(S,e)=>{ const section=TT.sections.find(s=>s.id===e.section)||{id:e.section,title:e.section}; const sib=TT.entries.filter(x=>x.section===e.section); const idx=sib.findIndex(x=>x.id===e.id); const T=S.spec.techniques||[];
  const chips=T.map(t=>`<span data-t="${esc(t.id)}" title="${esc(t.name)}">${esc(t.id)}</span>`).join('');
  const atoms=[...new Set(T.flatMap(t=>t.atoms||[]))].map(a=>`<a href="../../index.html#techniques?a=${encodeURIComponent(a)}">${esc(a)}</a>`).join('');
  const steps=(S.spec.pass_order||[]).map(s=>`<li><div><b>${esc(s.split(' · ')[0])}</b>${s.includes(' · ')?' · '+esc(s.split(' · ').slice(1).join(' · ')):''}</div></li>`).join('');
  const techs=T.map(t=>`<li><div><b>${esc(t.id)}</b> · ${esc(t.name)}${t.implementation?` — ${esc(t.implementation)}`:''}${t.limits?` <span class="ro">Limits · ${esc(t.limits)}</span>`:''}${S.techniques&&S.techniques[t.id]?` <a href="lib/${esc(t.id)}.js">lib/${esc(t.id)}.js</a>`:''}</div></li>`).join('');
  const reads=(S.points||[]).map(p=>`<li><div><b>${esc(p.d)}</b> · ${esc(p.label)} <span class="ro">u ${(+p.u).toFixed(2)} · v ${(+p.v).toFixed(2)}${p.t?` · ${esc(p.t)}`:''}</span></div></li>`).join('');
  return `<p class="kicker">${esc(S.kicker||section.title+' · '+S.code)}</p><h1 class="lede">${esc(S.lede||S.title)}</h1><div class="body">${(S.body||[]).map(p=>`<p>${esc(p)}</p>`).join('')}</div>
  ${steps?`<div class="meta" style="display:block"><h2>Pass order</h2><ol class="steps">${steps}</ol></div>`:''}
  <div class="meta"><div class="full"><h2>Techniques read · click to highlight</h2><div class="tags" id="chips">${chips}</div></div>
  ${atoms?`<div class="full"><h2>Atoms · click to find every use</h2><div class="tags atoms">${atoms}</div></div>`:''}
  <div><h2>Reference</h2><div class="ro">${esc(S.source)}</div></div><div><h2>Study</h2><div class="nm">${esc(S.title)}</div><div class="ro">${esc(S.code)} · ${esc(section.title)} · ${idx+1} / ${sib.length}</div></div></div>
  ${techs?`<div class="meta static" style="display:block"><h2>Techniques · <a href="spec.json">spec.json</a></h2><ol class="steps">${techs}</ol></div>`:''}
  ${reads?`<div class="meta static" style="display:block"><h2>${(S.points||[]).length} reads · u, v on the sheet</h2><ol class="steps">${reads}</ol></div>`:''}
  <div class="foot"><span><b>R</b> compare · <b>V</b> variant · <b>S</b> spec · <b>space</b> re-read${S.motion?' · <b>M</b> motion':''}${S.live?' · <b>L</b> live':''}</span><span>ø co. · 2026</span></div>`; };
for(const e of TT.entries){ if(only.length&&!only.some(o=>e.id.includes(o)))continue; const dir=path.join(root,e.path); if(!fs.existsSync(path.join(dir,'study.js'))){ console.warn('skip (no study.js):',e.id); continue; }
  // reference → ref.js
  const refSrc=['ref.png','ref.jpg'].map(f=>path.join(dir,f)).find(fs.existsSync);
  if(refSrc){ const out=path.join(dir,'_ref.jpg'); execSync(`python3 -c "from PIL import Image; im=Image.open('${refSrc}').convert('RGB'); im.thumbnail((900,900)); im.save('${out}',quality=88); print(im.size[0],im.size[1])"`); const [w,h]=execSync(`python3 -c "from PIL import Image; print(*Image.open('${out}').size)"`).toString().trim().split(' ').map(Number); const b64=fs.readFileSync(out).toString('base64'); fs.unlinkSync(out); fs.writeFileSync(path.join(dir,'ref.js'),`window.__REF={"w":${w},"h":${h},"data":"data:image/jpeg;base64,${b64}"};\n`); }
  else if(!fs.existsSync(path.join(dir,'ref.js'))) fs.writeFileSync(path.join(dir,'ref.js'),'window.__REF={"w":1,"h":1,"data":null};\n');
  // spec.json from study.js
  const ctx={window:{},document:{createElement:()=>({getContext:()=>null})},console}; try{ vm.runInNewContext(fs.readFileSync(path.join(dir,'study.js'),'utf8'),ctx); }catch(err){ console.error(e.id,'study.js failed to evaluate:',err.message); continue; }
  const S=ctx.window.STUDY; const spec=Object.assign({ id:S.id, code:S.code, title:S.title, section:e.section, variants:(S.variants||[]).map(v=>({id:v.id,label:v.label,swatches:v.sw})) },S.spec);
  // spec v2: lift each technique function into lib/<id>.js — a self-contained ES module (helpers inlined), and point the spec at it
  if(S.techniques&&typeof S.techniques==='object'){ const lib=path.join(dir,'lib'); fs.mkdirSync(lib,{recursive:true}); const P0=(()=>{ const c={window:{}}; vm.runInNewContext(fs.readFileSync('_shared/art.js','utf8'),c); return c.window.ART.params(S.spec); })();
    for(const t of (spec.techniques||[])){ const fn=S.techniques[t.id]; if(typeof fn!=='function')continue; const src=fn.toString(); const names=helpersFor(src);
      const mod=`/* ${t.id} · ${t.name} — ${S.code} ${S.title} · Techniques & Templates · ø co.
   Lifted from ${e.path}study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make${src.slice(0,src.indexOf(')')+1)} — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: ${t.limits||'—'} */
export const id=${JSON.stringify(t.id)}, name=${JSON.stringify(t.name)}, code=${JSON.stringify(S.code)}, entry=${JSON.stringify(S.id)};
export const atoms=${JSON.stringify(t.atoms||[])};
export const spec=${JSON.stringify(t,null,2)};
export const params=${JSON.stringify(P0[t.id]||{},null,2)};
export const A={};
${names.map(n=>ART_SRC[n]).join('\n')}
export const make=${src};
export default make;
`;
      fs.writeFileSync(path.join(lib,t.id+'.js'),mod); t.module='lib/'+t.id+'.js'; LIFTED.push(path.join(lib,t.id+'.js')); } }
  fs.writeFileSync(path.join(dir,'spec.json'),JSON.stringify(spec,null,2));
  // page — template + the static read baked in
  fs.writeFileSync(path.join(dir,'index.html'),tpl.replace(/\{\{CODE\}\}/g,e.code).replace(/\{\{TITLE\}\}/g,esc(e.title)).replace(/\{\{DESCRIPTION\}\}/g,()=>esc(`${e.code} · ${e.title} — ${S.lede||e.sub||''}`)).replace('{{NAV}}',()=>plateNav(S,e)).replace('{{NOTES}}',()=>plateNotes(S,e)).replace('{{SPEC}}',()=>esc(JSON.stringify(spec,null,2))));
  // coverage rule: every technique id has ≥ 1 point citing it
  const cited=new Set((S.points||[]).map(p=>p.t)); const miss=(S.spec.techniques||[]).filter(t=>!cited.has(t.id)).map(t=>t.id); const stray=[...cited].filter(t=>!(S.spec.techniques||[]).some(q=>q.id===t));
  if(miss.length||stray.length) console.warn(`${e.id}: coverage — uncited techniques [${miss}] · points citing unknown ids [${stray}]`);
  const manT=new Set(e.techniques||[]), specT=new Set((S.spec.techniques||[]).map(t=>t.id)); const d1=[...manT].filter(t=>!specT.has(t)), d2=[...specT].filter(t=>!manT.has(t)); if(d1.length||d2.length) console.warn(`${e.id}: manifest/spec technique mismatch — manifest-only [${d1}] · spec-only [${d2}]`);
  for(const t of (S.spec.techniques||[])){ (techIndex[t.id]??={name:t.name,used_in:[]}).used_in.push(Object.assign({entry:e.id,code:e.code,params:t.params,implementation:t.implementation},t.limits?{limits:t.limits}:{},t.module?{module:e.path+t.module}:{})); for(const a of (t.atoms||[]))(atomIndex[a]??=[]).push({entry:e.id,technique:t.id}); }
  console.log('built',e.id,(S.points||[]).length,'points',(S.spec.techniques||[]).length,'techniques',refSrc?'ref':'no ref');
}
if(!only.length){ fs.writeFileSync('techniques.json',JSON.stringify({generated:new Date().toISOString().slice(0,10),note:'file by atom, read by technique — every entry in Techniques & Templates, keyed by technique id',techniques:techIndex},null,2)); fs.writeFileSync('atoms.json',JSON.stringify({generated:new Date().toISOString().slice(0,10),atoms:atomIndex},null,2)); console.log('wrote techniques.json, atoms.json');
  // _shared/vocab.js — the vocabulary the index search, the atom filter and the plates' related block read (generated; do not edit)
  const names={}; for(const [id,t] of Object.entries(techIndex))names[id]=t.name;
  const atomsOf={}; for(const [a,uses] of Object.entries(atomIndex))for(const u of uses){ (atomsOf[u.entry]??=[]); if(!atomsOf[u.entry].includes(a))atomsOf[u.entry].push(a); }
  const byAtom={}; for(const [a,uses] of Object.entries(atomIndex))byAtom[a]=[...new Set(uses.map(u=>u.entry))];
  const byTechnique={}; for(const [id,t] of Object.entries(techIndex))byTechnique[id]=t.used_in.map(u=>u.entry);
  fs.writeFileSync('_shared/vocab.js',`/* generated by _build/build.mjs — technique names, atoms per entry, entries per atom / per technique */\nwindow.TT_VOCAB=${JSON.stringify({generated:new Date().toISOString().slice(0,10),names,atoms:atomsOf,byAtom,byTechnique})};\n`);
  console.log('wrote _shared/vocab.js',Object.keys(names).length,'techniques',Object.keys(byAtom).length,'atoms');
  // root index: bake nav + both sections' card grids between the <nav> and <main> tags (the inline script redraws them).
  // card() here MUST match card() in index.html's inline script.
  const count=s=>TT.entries.filter(e=>e.section===s).length;
  const allTech=[...new Set(TT.entries.flatMap(e=>e.techniques||[]))].sort();
  const allAtoms=Object.keys(byAtom).sort((a,b)=>byAtom[b].length-byAtom[a].length||a.localeCompare(b));
  const nav=`<a class="brand" href="index.html">${TT.mark}<span class="wm">IMP<i>Ø</i>SSIBLE</span></a><span class="crumb"><b>Techniques &amp; Templates</b></span><span class="pager"><span><span class="n">${TT.entries.length}</span>&nbsp;entries</span><a href="techniques.json" title="every technique, keyed by id">techniques.json</a></span>`;
  const tabs=TT.sections.map((s,i)=>`<a href="#${s.id}" class="${i===0?'on':''}">${esc(s.title)} <i>${count(s.id)}</i></a>`).join('')+`<label class="q"><input type="search" placeholder="search" value="" aria-label="search entries, techniques and atoms" autocomplete="off" spellcheck="false"></label>`;
  const chips=allTech.map(t=>`<span data-t="${esc(t)}"${names[t]?` title="${esc(names[t])}"`:''}>${esc(t)}</span>`).join('');
  const atomChips=allAtoms.map(a=>`<span data-a="${esc(a)}" title="${byAtom[a].length} ${byAtom[a].length===1?'entry':'entries'}">${esc(a)}<i>${byAtom[a].length}</i></span>`).join('');
  const card=e=>{ const sw=(e.variants||[])[0]||[]; const badges=[(e.variants||[]).length>1?e.variants.length+' variants':'', e.motion?'motion':'', e.live?'live':''].filter(Boolean).join(' · '); const tks=(e.techniques||[]).map(esc).join(' · ');
    return `<a class="card" href="${e.path}index.html"><div class="pv"><img src="${e.path}thumb.png" alt="" loading="lazy" onerror="this.style.visibility='hidden'"><div class="sw">${sw.map(c=>`<i style="background:${esc(c)}"></i>`).join('')}</div></div><div class="tx"><div class="code"><span>${esc(e.code)}</span> ${badges?`<span>${esc(badges)}</span>`:''}</div><div class="ttl">${esc(e.title)}</div><div class="sub">${esc(e.sub)}</div>${tks?`<div class="tks">${tks}</div>`:''}</div></a>`; };
  const sections=TT.sections.map(s=>{ const es=TT.entries.filter(e=>e.section===s.id); return `<section id="s-${esc(s.id)}"><h2><span>${esc(s.title)}</span><span>${es.length} ${es.length===1?'entry':'entries'}</span></h2>${s.id!=='techniques'?`<p class="blurb">${esc(s.blurb)}</p>`:''}<div class="grid">${es.map(card).join('')}</div></section>`; }).join('');
  // static read shows both vocabularies open: techniques, then atoms (the runtime shows one at a time)
  const main=`<div class="hd"><h1>${esc(TT.title)}</h1><p>${esc(TT.sections[0].blurb)}</p></div><div class="tabs">${tabs}</div><div class="filters open"><button type="button" class="ftog" aria-expanded="true">Filter by <span class="mode"><b class="on" data-m="technique">technique <i>${allTech.length}</i></b><b data-m="atom">atom <i>${allAtoms.length}</i></b></span></button><div class="chips">${chips}</div><div class="chips atoms">${atomChips}</div></div>${sections}`;
  let ix=fs.readFileSync('index.html','utf8');
  ix=ix.replace(/(<nav class="nav" id="nav"[^>]*>)[\s\S]*?(<\/nav>)/,(m,a,b)=>a+nav+b).replace(/(<main class="ix" id="ix">)[\s\S]*?(<\/main>)/,(m,a,b)=>a+main+b);
  const desc=`<meta name="description" content="${esc(`${count('techniques')} technique read plates and ${count('templates')} composed templates. ${TT.sections[0].blurb}`)}">`;
  ix=/<meta name="description"/.test(ix)?ix.replace(/<meta name="description"[^>]*>/,desc):ix.replace('<link rel="icon"',`${desc}\n<link rel="icon"`);
  if(!/rel="alternate"[^>]*techniques\.json/.test(ix)) ix=ix.replace('</head>',`<link rel="alternate" type="application/json" href="techniques.json" title="every technique, keyed by id">\n</head>`);
  fs.writeFileSync('index.html',ix); console.log('baked index.html',TT.entries.length,'cards',allTech.length,'chips'); }
// lifted modules must import on their own (no site, no art.js): the reuse gate
for(const m of LIFTED){ try{ const mod=await import(pathToFileURL(m).href+'?'+Date.now()); if(typeof mod.make!=='function'||!mod.params)throw new Error('no make()/params export'); }catch(err){ console.error('lifted module failed:',path.relative(root,m),err.message); process.exitCode=1; } }
if(LIFTED.length)console.log('lifted',LIFTED.length,'technique modules, all import clean');
