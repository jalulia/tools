// node templates/t-04-effect-set/build-sheet.mjs   (from the site root, or from this folder)
// Reads fx.js + set.js (data + run functions) and writes, next to itself:
//   index.html     — the sheet, with every effect's recipe, limits and params BAKED as static HTML for a reader
//                    that cannot run scripts; sheet.js replaces #fs-live with the interactive build on load.
//   set.json       — the set's machine-readable spec: every effect, every param with range / default / unit / limits.
//   template.json  — the template contract (what a new set must provide).
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const win={}; const ctx=vm.createContext({window:win,Math,Float32Array,Uint8Array,Uint32Array,Map,Set,Object,Array,JSON,String,Number,Promise});
for(const f of ['fx.js','set.js']) vm.runInContext(fs.readFileSync(path.join(here,f),'utf8'),ctx,{filename:f});
const SET=win.FXSET, FX=win.FX;
const TT=(()=>{ const c={window:{}}; vm.runInNewContext(fs.readFileSync(path.join(here,'../../_shared/entries.js'),'utf8'),c); return c.window.TT; })();
const V='?v='+new Date().toISOString().slice(0,16).replace(/[-:T]/g,''); // GitHub Pages caches ~10 min; stamp per build
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const val=(p)=>p.type==='ease'?`${p.value[0]}${FX.EASES[p.value[0]].k?' k '+p.value[1]:''}`:String(p.value)+(p.unit?' '+p.unit:'');
const rng=(p)=>p.type==='text'?'text':p.type==='range'?`${p.min} – ${p.max}${p.unit?' '+p.unit:''}`:p.type==='select'?p.options.join(' · '):Object.keys(FX.EASES).join(' · ')+' · k .3 – 8';
const GROUPS={density:'Density',dropoff:'Dropoff',stock:'Stock',relief:'Relief',color:'Color · OKLCH',mixing:'Mixing',mask:'Edge',seed:'Seed'};
const nParams=SET.effects.reduce((n,e)=>n+e.params.length,0);

const staticBlock=e=>`<section class="fs-fx" id="${e.id}"><header class="fs-fxh"><div class="id"><span class="code">${esc(e.code)}</span><h2>${esc(e.name)}</h2></div><p class="sub">${esc(e.sub)}</p></header>
<div class="fs-fxf"><div><h3>Recipe</h3><ol class="fs-rec">${e.recipe.map(r=>`<li>${esc(r)}</li>`).join('')}</ol></div><div><h3>Limits</h3><table class="fs-lim"><thead><tr><th>Param</th><th>Range</th><th>What happens</th></tr></thead><tbody>${e.limits.map(l=>`<tr><td>${esc(l[0])}</td><td class="m">${esc(l[1])}</td><td>${esc(l[2])}</td></tr>`).join('')}</tbody></table></div>
<div><h3>Params · ${e.params.length}</h3><table class="fs-lim"><thead><tr><th>Group</th><th>Param</th><th>Default</th><th>Range</th></tr></thead><tbody>${e.params.map(p=>`<tr><td class="m">${esc(GROUPS[p.group]||p.group)}</td><td>${esc(p.label)}<br><span style="color:var(--grey)">${esc(p.note||'')}</span></td><td class="m">${esc(val(p))}</td><td class="m">${esc(rng(p))}</td></tr>`).join('')}</tbody></table></div></div></section>`;
const staticUsages=`<section class="fs-usages" id="usages"><header class="fs-uh"><div><span class="code">Usages</span><h2>Where the set goes</h2></div></header><div class="fs-ugrid">${SET.usages.map((u,i)=>`<article class="fs-ucard"><div class="cap"><span class="code">U-0${i+1}</span><b>${esc(u.title)}</b><p>${esc(u.sub)}</p><div class="chips">${u.uses.map(id=>`<a href="#${id}">${esc(SET.effects.find(e=>e.id===id).code)}</a>`).join('')}</div><pre class="fs-ov">${esc(JSON.stringify(u.overrides))}</pre></div></article>`).join('')}</div></section>`;

const contractCode=`self.FXSET = {
  code:'T-04', title, short, set, premise, source,
  system:{ read, sharedCause:[…], passOrder:[…] },   // the material system, shown above the bar
  effects:[{
    id, code, name, sub, role,            // role: 'stock · paper', 'mark · pen' …
    recipe:[ 'step', … ],                 // numbered on the sheet
    limits:[ [param, range, 'what happens'], … ],
    params:[ { key, label, group, type, value, … } ],
      // group: density | dropoff | stock | relief | color | mixing | mask | seed
      // type:  range {min,max,step,unit,limits:[[lo,hi,why]]}
      //        select {options} · ease (value ['smooth',k])
      // ink:   FX.INK_PARAMS(prefix,label,L,C,h) → 3 OKLCH sliders
      // when:  { key:[values] } dims a param that does not apply
    stockOf(o) { return 'fx-03-…' },      // optional: the effect this one prints on → coupled redraws
    run(o, W, H, dpr, x) {                // W,H device px; lengths in o are CSS px; light = FX.LIGHT
      // x = { S: every effect's params, alb, clip, field }
      return { lin, alb, lf, ink, stock, mask, marks, markUnit };
    }
  }],
  usages:[{ id, title, sub, uses:[effect ids], aspect,
            overrides:{ [effectId]:{…} }, labels:[[a,b]],
            clips:{ name:(ctx2d, w, h) => draw },   // main thread (fonts), passed in as Float32
            run(P, W, H, dpr, x) { return effect.run(P(id), W, H, dpr, { S:x.S, clip:x.clips.name }); } }]
};`;

const html=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="only light">
<link rel="icon" href="data:,">
<title>${esc(SET.code)} — Effect set · Techniques &amp; Templates · ø co.</title>
<meta name="description" content="${esc(`${SET.code} Effect set template: ${SET.effects.length} single effects (${SET.effects.map(e=>e.name).join(', ')}) on white, each with density, dropoff, OKLCH color, mixing-rule and randomized-mask dials, limits and a live JSON spec, plus ${SET.usages.length} usages that follow the dials.`)}">
<link rel="alternate" type="application/json" href="set.json">
<link rel="stylesheet" href="../../_shared/fonts.css">
<link rel="stylesheet" href="../../_shared/shell.css${V}">
<link rel="stylesheet" href="sheet.css${V}">
</head>
<body class="fs-page">
<!-- build output of build-sheet.mjs — edit set.js / sheet.js / sheet.css / build-sheet.mjs, then rebuild. -->
<nav class="nav" id="nav" aria-label="Site navigation"><a class="brand" href="../../index.html">${TT.mark}<span class="wm">IMP<i>Ø</i>SSIBLE</span></a><span class="crumb"><a href="../../index.html#templates">Techniques &amp; Templates</a><span class="sep">/</span><b>${esc(SET.title)}</b><span class="code">${esc(SET.code)}</span></span><span class="pager"><span>${esc(SET.code)} · template</span><a href="../../index.html#templates">index</a></span></nav>
<main class="fs">
  <header class="fs-hd">
    <div><span class="code">${esc(SET.code)} · Effect set · ${esc(SET.set)} · ${SET.effects.length} effects · ${SET.usages.length} usages</span><h1>${esc(SET.short)}</h1><p class="premise">${esc(SET.premise)}</p></div>
    <div class="fs-how"><span class="code">How to use the sheet</span><ol>
      <li><b>Tune</b> a plate — dials are grouped by what they change; a dot marks what you moved. Drag the light on any plate.</li>
      <li><b>Explore</b> — <i>wedge</i> lays out a grid across two dials, <i>pin · split</i> compares against a frozen state, <i>distance</i> shows how the marks read from across a table.</li>
      <li><b>Take it</b> — <i>Output</i> renders to a deck, a Figma frame or paper at true dpi, with ink plates and a height map; <i>Lift</i> gives a snippet that runs anywhere and a spec an agent can check.</li></ol></div>
  </header>
  <div class="fs-bar" id="fs-bar" role="toolbar" aria-label="Sheet controls">
    <div class="g"><button type="button" id="fs-loupe" aria-pressed="false" title="4× device-pixel loupe on any plate">loupe 4×</button></div>
    <div class="g jump">${(SET.sections||[]).map((sc,i)=>`<a href="#sec-${sc.id}" class="code" style="padding:0 6px">${esc(sc.title)}</a>`).join('')}<a href="#usages" class="code" style="padding:0 6px;color:var(--grey)">usages</a></div>
    <span class="sp"></span>
    <div class="g hist"><button type="button" id="fs-undo" title="Undo · ⌘Z / Ctrl+Z" aria-label="Undo" disabled>↶</button><button type="button" id="fs-redo" title="Redo · ⇧⌘Z / Ctrl+Y" aria-label="Redo" disabled>↷</button></div>
    <div class="g"><button type="button" id="fs-link" title="Copy a link that opens the sheet with these exact settings">copy link</button><button type="button" id="fs-copyset">copy params</button><button type="button" id="fs-resetall">reset all</button></div>
    <span id="fs-status">loading</span>
  </div>
  <div id="fs-live"><div class="fs-static">
<section class="fs-sys"><div class="c"><span class="code">Read</span><p class="read">${esc(SET.system.read)}</p></div><div class="c"><span class="code">Shared causes</span><ul>${SET.system.sharedCause.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div><div class="c"><span class="code">Pass order</span><ol>${SET.system.passOrder.map(t=>`<li>${esc(t)}</li>`).join('')}</ol></div></section>
${SET.effects.map((e,i)=>((SET.sections&&i&&e.section!==SET.effects[i-1].section)?`<div class="fs-secth" id="sec-${e.section}"><h2>${esc((SET.sections.find(x=>x.id===e.section)||{}).title||'')}</h2></div>`:'')+staticBlock(e)).join('\n')}
${staticUsages}
  </div></div>
  <details class="fs-contractd"><summary><span class="code">Template contract · spec</span><span class="sum">how the sheet is built, the files, and how to make another set</span></summary>
  <dl class="fs-meta">
      <div><dt>Ground</dt><dd><b>#FFFFFF</b> · every effect prints onto white; nothing assumes a tinted stock</dd></div>
      <div><dt>Color math</dt><dd><b>Film · OKLCH</b> · inks set in OKLCH; Beer–Lambert film in linear light, or a chosen coverage mix</dd></div>
      <div><dt>Units</dt><dd><b>CSS px</b> · rendered at device px (≤ 3× on screen, any for export); density = count per px², never a tile zoom; print: 1 CSS px = 0.2646 mm × mark scale</dd></div>
      <div><dt>Params</dt><dd><b>${nParams}</b> across ${SET.effects.length} effects · ranges, defaults, limits · <a href="set.json" style="color:var(--blue)">set.json</a> · per effect: <a href="spec/index.json" style="color:var(--blue)">spec/index.json</a></dd></div>
      <div class="wide"><dt>Source</dt><dd>${esc(SET.source)}</dd></div>
  </dl>
  <section class="fs-contract" id="contract">
    <div><span class="code">Template contract</span><h2>Make another set</h2>
      <p>The sheet does not know what an effect draws. Copy this folder, replace <code>set.js</code> with your own effects and usages, run <code>node build-sheet.mjs</code> (bakes the static read, <code>set.json</code> and <code>template.json</code>), then register it in <code>_shared/entries.js</code> with <code>section:'templates'</code>.</p>
      <p>Rules the sheet enforces by construction: one params object per effect and one sheet light; every length in CSS px; density dials change counts, not zoom; inks in OKLCH, chroma reduced at constant L/h when out of sRGB; marks print INTO a stock through one ink chain; light is applied once, last; masks sample at the mark, so marks are whole or absent.</p>
      <table class="fs-files"><tbody>
        <tr><td>fx.js</td><td>shared core · noise, 64² blue-noise rank (void-and-cluster), ease curves, OKLab/OKLCH + gamut, film + mix + overprint rules, randomized mask (coverage + signed distance), sheet light, Lambert shade, height-field shadow, cast shadow, capsule + dot rasters</td></tr>
        <tr><td>set.js</td><td>this set · stocks (paper, cloth), the ink chain, effects (params, recipe, limits, run) and usages — the only file a new set replaces</td></tr>
        <tr><td>worker.js</td><td>render worker · loads fx.js + set.js, renders one job off the main thread, caches stock fields</td></tr>
        <tr><td>sheet.js · sheet.css</td><td>generic runtime · worker pool (latest job wins, ½-res drafts), stock coupling, light puck, rack, blocks, tabbed dials (limit zones hatched, default tick, type-in values, OKLCH tracks, ease graphs, five-rule mix strip), loupe, views, usage gallery</td></tr>
        <tr><td>set.json · template.json</td><td>machine-readable spec of the set and of the contract</td></tr>
        <tr><td>index.html</td><td>build output · static read baked in</td></tr>
      </tbody></table>
    </div>
    <div><pre class="fs-pre">${esc(contractCode)}</pre></div>
  </section></details>
  <div class="fs-end"><span><b>${esc(SET.code)}</b> · Effect set · ${esc(SET.set)} ${esc(SET.short)}</span><span>Techniques &amp; Templates · ø co. · The Impøssible Outcomes Company</span></div>
</main>
<script src="../../_shared/entries.js${V}"></script>
<script src="fx.js${V}"></script>
<script src="set.js${V}"></script>
<script src="sheet.js${V}"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(here,'index.html'),html);

const specParam=p=>{ const o={key:p.key,label:p.label,group:p.group,type:p.type,default:p.value}; if(p.type==='range') Object.assign(o,{min:p.min,max:p.max,step:p.step}); if(p.unit)o.unit=p.unit; if(p.options)o.options=p.options; if(p.type==='ease')o.curves=Object.keys(FX.EASES); if(p.ink)o.ink=p.ink; if(p.when)o.when=p.when; if(p.limits)o.limits=p.limits.map(([lo,hi,why])=>({lo,hi,why})); if(p.note)o.note=p.note; return o; };
const setJson={ template:SET.code, set:SET.set, title:SET.title, premise:SET.premise, source:SET.source, ground:'#FFFFFF', system:SET.system, light:{ default:{az:225,el:34}, note:'az = direction the light comes FROM (screen degrees, 0 = right, 90 = below); el = elevation above the sheet; one light for every plate, usage and shadow' },
  color:{ space:'OKLab / OKLCH (Ottosson 2020; CSS Color 4)', gamut:'sRGB; out-of-gamut inks have chroma reduced at constant L and h (binary search, 24 steps)', mix:{oklab:'straight line in OKLab',oklch:'L, C linear; hue on the short arc; achromatic end takes the other hue',linear:'linear-light RGB',srgb:'gamma-encoded RGB (comparison only)'}, overprint:{multiply:'transparent inks; product in linear light',mix:'opaque; blended by the mix space',darken:'OKLab: lower L, top ink a/b'} },
  units:'CSS px for every length; rendered at device px (dpr ≤ 2). Density params change mark count per px², never a tile scale.',
  shared:{ blueNoise:'64 × 64 void-and-cluster rank tile, σ 1.9, toroidal, seed 1993', mask:'signed distance to rect | ellipse | band | blob, displaced by fbm (wander, scale, octaves), feather as tone or blue-noise speckle, bite = clumped dropouts rising toward the edge; cached by params', eases:Object.fromEntries(Object.entries(FX.EASES).map(([k,c])=>[k,c.label+(c.k?' (k)':'')])) },
  effects:SET.effects.map(e=>({ id:e.id, code:e.code, name:e.name, role:e.role, sub:e.sub, presets:(e.presets||[]).map(([name,params])=>({name,params})), printsOn:e.stockOf?e.stockOf(Object.fromEntries(e.params.map(p=>[p.key,p.value]))):null, recipe:e.recipe, limits:e.limits.map(([param,range,what])=>({param,range,what})), params:e.params.map(specParam) })),
  usages:SET.usages.map((u,i)=>({ id:u.id, code:'U-0'+(i+1), title:u.title, sub:u.sub, uses:u.uses, aspect:u.aspect, overrides:u.overrides })) };
fs.writeFileSync(path.join(here,'set.json'),JSON.stringify(setJson,null,1));
const tpl={ id:'t-04-effect-set', code:'T-04', name:'Effect set', purpose:'House a family of single effects on one sheet: an overview rack, one technique block per effect (plate, dials, recipe, limits, live params), and a gallery of usages that run the same functions with the live dials.',
  files:{ 'fx.js':'shared core', 'set.js':'the set (replace)', 'sheet.js':'generic runtime', 'sheet.css':'styles on the T&T shell tokens', 'build-sheet.mjs':'bakes index.html (static read), set.json, template.json', 'index.html':'build output', 'worker.js':'render worker (same fx.js + set.js, off the main thread)' },
  layout:['nav (shell)','head: set code, title, premise, meta cells (ground, color math, units, params, source)','sticky bar: view composite|coverage|mask · loupe 4× · jump links · copy set params · reset all · status','rack: one 4:3 cell per effect with mark count','per effect: header (code, name, sub, reset · new seed · copy params · copy call) → plate (sticky, 4:3, device px, stats: px · marks · ms · mode) + dial column grouped density · dropoff · color · mixing · mask · seed → recipe · limits · live params','usages: 3-up cards, 16:9 canvas + labels, caption, effect chips, overrides; toggle follow the dials | defaults only','contract: files + set.js shape'],
  dials:{ tabs:'one dial group per tab (density · dropoff · stock · relief · color · mixing · edge); a dot marks tabs and rows changed from default', range:'hairline track; limit zones hatched with the reason as title; default tick; tap the value to type it; double-click label resets', light:'puck in the bar: angle = azimuth, distance from center = elevation; arrow keys step it', select:'segmented buttons', ease:'curve select + k + live graph', ink:'swatch + oklch() + hex + "chroma reduced" flag; L/C/h tracks painted with the sweep', mixing:'five-row strip: white → ink in film · oklab · oklch · linear · srgb, current highlighted', when:'params that do not apply are dimmed, not hidden' },
  rendering:{ workers:'pool of up to 3 (hardwareConcurrency − 1) running worker.js; main-thread fallback on file://', draft:'½-res while dragging a dial or the light', full:'device px on release', scheduling:'latest job per canvas wins; drafts first, then plates, usages, rack', lazy:'IntersectionObserver (300 px margin); offscreen canvases go dirty and paint when they scroll in', coupling:'a change to effect X redraws X, every effect whose stockOf() is X, and every usage that uses either', state:'one params object per effect + the sheet light, saved per viewer in localStorage (try/catch)' },
  contract:contractCode };
fs.writeFileSync(path.join(here,'template.json'),JSON.stringify(tpl,null,1));
// ── spec v2: one file per effect an agent (or a person) can lift without reading the sheet; standalone lift pages that prove it runs ──
const crypto=await import('node:crypto');
const LIVE='https://jalulia.github.io/tools/techniques-templates/templates/t-04-effect-set/';
fs.mkdirSync(path.join(here,'spec'),{recursive:true}); fs.mkdirSync(path.join(here,'lift'),{recursive:true});
const DEF=Object.fromEntries(SET.effects.map(e=>[e.id,Object.fromEntries(e.params.map(p=>[p.key,JSON.parse(JSON.stringify(p.value))]))]));
const index=[];
for(const e of SET.effects){ const o=DEF[e.id], dep=e.stockOf?e.stockOf(o):null, clipNames=Object.keys(e.clips||{});
  let tv=null; if(!clipNames.length){ FX.LIGHT={az:225,el:34}; const W=256,H=192, R=e.run(o,W,H,1,{S:DEF}), rgba=FX.toRGBA(R,'image',W,H); tv={W,H,dpr:1,light:{az:225,el:34},params:'defaults',S:'defaults of every effect',output:"FX.toRGBA(R,'image',W,H)",sha256:crypto.createHash('sha256').update(Buffer.from(rgba.buffer)).digest('hex'),engine:'V8 · Node '+process.versions.node}; }
  const spec={ id:e.id, code:e.code, name:e.name, role:e.role, section:e.section||'surfaces', set:SET.set, sub:e.sub,
    entry:{ scripts:[LIVE+'fx.js',LIVE+'set.js'], globals:['FX','FXSET'], find:`FXSET.effects.find(e => e.id === '${e.id}')`, call:`fx.run(o, W, H, dpr, { S${clipNames.length?', clips':''} })`, standalone:LIVE+'lift/'+e.id+'.html' },
    signature:{ in:{ o:'params object — keys below; every length in CSS px', W:'device px width', H:'device px height', dpr:'device px per CSS px (density is physical: marks per CSS px²)', x:{ S:'params of every effect keyed by id; the stock this prints on is read from S[printsOn]', ...(clipNames.length?{clips:`Float32Array alpha per name (${clipNames.join(', ')}), from FXSET.clips('${e.id}', W, H, dpr, o) on a thread with fonts`}:{}), umask:'optional: clips.umask — a typed or image mask (mShape type | image)' } },
      out:{ lin:'Float32Array W·H·3, linear-light sRGB (encode with FX.toRGBA(R,"image",W,H))', ink:'Float32Array W·H, absorbance / coverage (FX.toRGBA(R,"ink",…) = film positive)', stock:'Float32Array W·H, stock height (FX.toRGBA(R,"stock",…) = normalized height map)', mask:'Float32Array W·H', marks:'int — count of marks', markUnit:'string' } },
    light:{ global:'FX.LIGHT', default:{az:225,el:34}, note:'az = direction the light comes FROM (screen degrees; 0 = right, 90 = below); el = elevation above the sheet' },
    printsOn:dep, deterministic:'yes — every random draw is a hash of (position, seed); same inputs → same pixels in the same engine',
    params:e.params.map(specParam), defaults:o, depsDefaults:dep?{[dep]:DEF[dep]}:{}, presets:(e.presets||[]).map(([name,params])=>({name,params})),
    recipe:e.recipe, limits:e.limits.map(([param,range,what])=>({param,range,what})),
    testVector:tv||{ skipped:'needs main-thread text/path rasterization for its clips; render lift/'+e.id+'.html to compare by eye' } };
  fs.writeFileSync(path.join(here,'spec',e.id+'.json'),JSON.stringify(spec,null,1)); index.push({id:e.id,code:e.code,name:e.name,role:e.role,spec:'spec/'+e.id+'.json',lift:'lift/'+e.id+'.html',testVector:!!tv});
  const tvJs=tv?`const want='${tv.sha256}'; FX.LIGHT={az:225,el:34}; const R2=fx.run(o,256,192,1,{S:D}); const buf=FX.toRGBA(R2,'image',256,192); crypto.subtle.digest('SHA-256',buf).then(d=>{ const got=[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join(''); document.getElementById('tv').innerHTML=(got===want?'<b style="color:#1a7f37">test vector ✓</b> ':'<b style="color:#F4551E">test vector ✗</b> ')+'sha256 '+got.slice(0,16)+'… (256×192, defaults)'; });`:`document.getElementById('tv').textContent='test vector: skipped (clips need fonts)';`;
  fs.writeFileSync(path.join(here,'lift',e.id+'.html'),`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(e.code)} ${esc(e.name)} · standalone · T-04</title>
<link rel="stylesheet" href="../../../_shared/fonts.css">
<style>body{margin:0;background:#fff;font:12px/1.5 'JetBrains Mono',ui-monospace,monospace;color:#101014}main{max-width:860px;margin:0 auto;padding:28px 18px}canvas{display:block;width:100%;aspect-ratio:4/3;border:1px solid #E7E4DD}p{margin:10px 0}a{color:#2F5AE6}</style></head>
<body><main><p><b>${esc(e.code)} ${esc(e.name)}</b> · standalone: fx.js + set.js, defaults, nothing else from the sheet · <a href="../index.html#${e.id}">back to the sheet</a> · <a href="../spec/${e.id}.json">spec</a></p>
<canvas id="c"></canvas><p id="st"></p><p id="tv"></p></main>
<script src="../fx.js"></script><script src="../set.js"></script>
<script>
const D=Object.fromEntries(FXSET.effects.map(e=>[e.id,Object.fromEntries(e.params.map(p=>[p.key,JSON.parse(JSON.stringify(p.value))]))]));
const fx=FXSET.effects.find(e=>e.id==='${e.id}'), o=D['${e.id}'];
(document.fonts?Promise.all([document.fonts.load('800 40px Archivo'),document.fonts.load('500 12px "JetBrains Mono"')]).catch(()=>{}):Promise.resolve()).then(()=>{
  const c=document.getElementById('c'), r=c.getBoundingClientRect(), dpr=Math.min(3,devicePixelRatio||1), W=Math.floor(r.width*dpr), H=Math.floor(r.height*dpr); c.width=W; c.height=H;
  const t0=performance.now(), clips=FXSET.clips('${e.id}',W,H,dpr,o); FX.LIGHT={az:225,el:34};
  const R=fx.run(o,W,H,dpr,{S:D,clips}); c.getContext('2d').putImageData(new ImageData(FX.toRGBA(R,'image',W,H),W,H),0,0);
  document.getElementById('st').textContent=W+' × '+H+' device px · '+R.marks+' '+(R.markUnit||'')+' · '+Math.round(performance.now()-t0)+' ms';
  ${tvJs}
});
</script></body></html>
`); }
fs.writeFileSync(path.join(here,'spec','index.json'),JSON.stringify({set:SET.set,template:SET.code,effects:index},null,1));
console.log('built',SET.code,SET.effects.length,'effects',nParams,'params',SET.usages.length,'usages');
