// node _build/build.mjs [id …]   — run from the site root.
// For every manifest entry: writes <path>/index.html from _build/page.html, <path>/ref.js from <path>/ref.(png|jpg)
// (≤ 900 px, JPEG q88), <path>/spec.json from study.js, and the aggregate techniques.json + atoms.json at the root.
// Thumbs are rendered by `node _build/render.mjs`.
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { execSync } from 'node:child_process';
const root=process.cwd();
const TT=(()=>{ const ctx={window:{}}; vm.runInNewContext(fs.readFileSync('_shared/entries.js','utf8'),ctx); return ctx.window.TT; })();
const only=process.argv.slice(2);
const tpl=fs.readFileSync('_build/page.html','utf8');
const techIndex={}, atomIndex={};
for(const e of TT.entries){ if(only.length&&!only.some(o=>e.id.includes(o)))continue; const dir=path.join(root,e.path); if(!fs.existsSync(path.join(dir,'study.js'))){ console.warn('skip (no study.js):',e.id); continue; }
  // page
  fs.writeFileSync(path.join(dir,'index.html'),tpl.replace(/\{\{CODE\}\}/g,e.code).replace(/\{\{TITLE\}\}/g,e.title.replace(/&/g,'&amp;')));
  // reference → ref.js
  const refSrc=['ref.png','ref.jpg'].map(f=>path.join(dir,f)).find(fs.existsSync);
  if(refSrc){ const out=path.join(dir,'_ref.jpg'); execSync(`python3 -c "from PIL import Image; im=Image.open('${refSrc}').convert('RGB'); im.thumbnail((900,900)); im.save('${out}',quality=88); print(im.size[0],im.size[1])"`); const [w,h]=execSync(`python3 -c "from PIL import Image; print(*Image.open('${out}').size)"`).toString().trim().split(' ').map(Number); const b64=fs.readFileSync(out).toString('base64'); fs.unlinkSync(out); fs.writeFileSync(path.join(dir,'ref.js'),`window.__REF={"w":${w},"h":${h},"data":"data:image/jpeg;base64,${b64}"};\n`); }
  else if(!fs.existsSync(path.join(dir,'ref.js'))) fs.writeFileSync(path.join(dir,'ref.js'),'window.__REF={"w":1,"h":1,"data":null};\n');
  // spec.json from study.js
  const ctx={window:{},document:{createElement:()=>({getContext:()=>null})},console}; try{ vm.runInNewContext(fs.readFileSync(path.join(dir,'study.js'),'utf8'),ctx); }catch(err){ console.error(e.id,'study.js failed to evaluate:',err.message); continue; }
  const S=ctx.window.STUDY; const spec=Object.assign({ id:S.id, code:S.code, title:S.title, section:e.section, variants:(S.variants||[]).map(v=>({id:v.id,label:v.label,swatches:v.sw})) },S.spec);
  fs.writeFileSync(path.join(dir,'spec.json'),JSON.stringify(spec,null,2));
  // coverage rule: every technique id has ≥ 1 point citing it
  const cited=new Set((S.points||[]).map(p=>p.t)); const miss=(S.spec.techniques||[]).filter(t=>!cited.has(t.id)).map(t=>t.id); const stray=[...cited].filter(t=>!(S.spec.techniques||[]).some(q=>q.id===t));
  if(miss.length||stray.length) console.warn(`${e.id}: coverage — uncited techniques [${miss}] · points citing unknown ids [${stray}]`);
  const manT=new Set(e.techniques||[]), specT=new Set((S.spec.techniques||[]).map(t=>t.id)); const d1=[...manT].filter(t=>!specT.has(t)), d2=[...specT].filter(t=>!manT.has(t)); if(d1.length||d2.length) console.warn(`${e.id}: manifest/spec technique mismatch — manifest-only [${d1}] · spec-only [${d2}]`);
  for(const t of (S.spec.techniques||[])){ (techIndex[t.id]??={name:t.name,used_in:[]}).used_in.push({entry:e.id,code:e.code,params:t.params,implementation:t.implementation}); for(const a of (t.atoms||[]))(atomIndex[a]??=[]).push({entry:e.id,technique:t.id}); }
  console.log('built',e.id,(S.points||[]).length,'points',(S.spec.techniques||[]).length,'techniques',refSrc?'ref':'no ref');
}
if(!only.length){ fs.writeFileSync('techniques.json',JSON.stringify({generated:new Date().toISOString().slice(0,10),note:'file by atom, read by technique — every entry in Techniques & Templates, keyed by technique id',techniques:techIndex},null,2)); fs.writeFileSync('atoms.json',JSON.stringify({generated:new Date().toISOString().slice(0,10),atoms:atomIndex},null,2)); console.log('wrote techniques.json, atoms.json'); }
