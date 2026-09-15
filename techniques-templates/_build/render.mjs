// node _build/render.mjs <id-fragment> [tag]   — run from the site root. Needs playwright (npm i playwright) + chromium.
// Writes _shots/<id>-page[-tag].png, <path>/thumb.png (variant 0 art, 800 px wide), _shots/<id>-compare[-tag].png (reference | rebuild per variant).
// Prints console errors, render time and the fidelity readout. `node _build/render.mjs index` shoots the index page.
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { chromium } from 'playwright';
const root=process.cwd(); const TT=(()=>{ const c={window:{}}; vm.runInNewContext(fs.readFileSync('_shared/entries.js','utf8'),c); return c.window.TT; })();
const [frag,tag='']=process.argv.slice(2); const sfx=tag?'-'+tag:''; fs.mkdirSync('_shots',{recursive:true});
const browser=await chromium.launch(); const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});
const errors=[]; page.on('console',m=>{ if(m.type()==='error')errors.push(m.text()); }); page.on('pageerror',e=>errors.push(String(e)));
if(frag==='index'){ await page.goto('file://'+path.join(root,'index.html')); await page.waitForTimeout(1200); await page.screenshot({path:`_shots/index${sfx}.png`,fullPage:true}); console.log('index shot; errors:',errors); await browser.close(); process.exit(0); }
const es=TT.entries.filter(e=>e.id.includes(frag)); if(!es.length){ console.error('no entry matches',frag); process.exit(1); }
for(const e of es){ const url='file://'+path.join(root,e.path,'index.html'); const t0=Date.now(); await page.goto(url); await page.waitForFunction(()=>window.__study&&window.__study.art(),null,{timeout:30000}).catch(()=>console.warn('art not ready in 30 s'));
  const t1=Date.now()-t0; await page.waitForTimeout(3400); await page.screenshot({path:`_shots/${e.id}-page${sfx}.png`});
  const n=await page.evaluate(()=>window.__study.variants.length); const strips=[];
  for(let i=0;i<n;i++){ await page.evaluate(k=>window.__study.setVariant(k),i); await page.waitForFunction(()=>window.__study.art(),null,{timeout:30000}).catch(()=>{}); await page.waitForTimeout(150);
    const data=await page.evaluate(()=>window.__study.art().toDataURL('image/png')); const buf=Buffer.from(data.split(',')[1],'base64'); fs.writeFileSync(`_shots/${e.id}-art-${i}${sfx}.png`,buf); if(i===0)fs.writeFileSync(`_shots/${e.id}-art-0-full.png`,buf);
    const fid=await page.evaluate(()=>window.__study.fidelity()); strips.push({i,fid}); console.log(e.id,'variant',i,fid?`match ${(fid.sum*100).toFixed(0)}% (pal ${(fid.pal*100)|0} tone ${(fid.tone*100)|0} edge ${(fid.edge*100)|0} grain ${(fid.grain*100)|0} chroma ${(fid.chroma*100)|0})`:'no ref'); }
  await page.evaluate(()=>window.__study.setVariant(0));
  // thumb (variant 0, 800 px wide) + compare strip via python/PIL
  const refjs=fs.readFileSync(path.join(root,e.path,'ref.js'),'utf8'); const m=refjs.match(/"data":"data:image\/jpeg;base64,([^"]+)"/); if(m)fs.writeFileSync(`_shots/${e.id}-ref.jpg`,Buffer.from(m[1],'base64'));
  const py=`
from PIL import Image
import os
e='${e.id}'; sfx='${sfx}'; n=${n}
a=Image.open(f'_shots/{e}-art-0-full.png').convert('RGB'); t=a.copy(); t.thumbnail((800,800)); t.save('${e.path}thumb.png',optimize=True)
arts=[Image.open(f'_shots/{e}-art-{i}{sfx}.png').convert('RGB') for i in range(n)]
ref=Image.open(f'_shots/{e}-ref.jpg').convert('RGB') if os.path.exists(f'_shots/{e}-ref.jpg') else None
H=720; tiles=([ref] if ref else [])+arts; tiles=[im.resize((int(im.width*H/im.height),H),Image.LANCZOS) for im in tiles]
W=sum(t.width for t in tiles)+8*(len(tiles)-1); s=Image.new('RGB',(W,H),'white'); x=0
for t in tiles: s.paste(t,(x,0)); x+=t.width+8
s.save(f'_shots/{e}-compare{sfx}.png')
`; fs.writeFileSync(`_shots/_tmp-${e.id}.py`,py); const { execSync }=await import('node:child_process'); execSync(`python3 _shots/_tmp-${e.id}.py`,{stdio:'inherit'}); fs.unlinkSync(`_shots/_tmp-${e.id}.py`);
  console.log(`${e.id}: first render ${t1} ms · console errors: ${errors.length?errors.join(' | '):'0'}`); errors.length=0; }
await browser.close();
