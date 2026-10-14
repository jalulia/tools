// node _build/artcap.mjs <study-id> <outdir> [port]  — the 1:1 gate for a v2 refactor: captures window.__study.art() per variant
// from a local server (python3 -m http.server <port> from the site root) at 1440×900, DPR 1; diff the PNGs before/after.
// Needs playwright-core + a chromium headless shell (cloud session; Julia's Mac has none).
// node artcap.js <study-id> <outdir>  — captures window.__study.art() for every variant at 1440x900, DPR 1
import { chromium } from 'playwright-core'; import fs from 'node:fs';
const [id,out]=process.argv.slice(2); fs.mkdirSync(out,{recursive:true});
(async()=>{ const b=await chromium.launch({args:['--force-color-profile=srgb','--no-sandbox']});
 const c=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'reduce'}); const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{ if(m.type()==='error')errs.push(m.text()); });
 await p.goto(`http://127.0.0.1:'+(process.argv[4]||8787)+'/techniques/${id}/`,{waitUntil:'networkidle'});
 const n=await p.evaluate(()=>window.__study.variants.length);
 for(let i=0;i<n;i++){ await p.evaluate(i=>window.__study.setVariant(i),i); await p.waitForFunction(i=>{ const s=window.__study; return s.art()&&s.fig().w>0&&document.querySelector('#vtabs button.on')?.dataset.i==String(i); },i); await p.waitForTimeout(1500);
   const png=await p.evaluate(()=>window.__study.art().toDataURL('image/png')); fs.writeFileSync(`${out}/v${i}.png`,Buffer.from(png.split(',')[1],'base64')); console.log(id,'v'+i,await p.evaluate(()=>{ const a=window.__study.art(); return a.width+'x'+a.height; })); }
 console.log('errors',errs.length,errs.slice(0,2)); await b.close(); })();
