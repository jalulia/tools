/* deployed.mjs — the assembled _site over http: the landing page, both tools,
   learn/ hidden from the landing page but reachable, and every deep link. */
import { fileURLToPath as __f } from 'node:url';
import { dirname as __d, join as __j } from 'node:path';
const __ROOT = __j(__d(__f(import.meta.url)), '..', '..');
const __OUT = __j(__ROOT, 'scripts', 'qa', 'out');
import { mkdirSync as __mk } from 'node:fs'; __mk(__OUT, { recursive: true });
import { chromium } from 'playwright';
import { loadManifest } from '../lib/manifests.mjs';
const B='http://127.0.0.1:8124';
const M={ 'book-of-shaders': loadManifest(__j(__ROOT,'book-of-shaders/manifest.js')),
          components: loadManifest(__j(__ROOT,'components/manifest.js')) };
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1440,height:900}});
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
p.on('requestfailed',r=>{const w=r.failure()?.errorText||''; if(!/ERR_ABORTED|about:blank/.test(w)) errs.push('REQ '+r.url()+' '+w)});

await p.goto(B+'/index.html',{waitUntil:'load'}); await p.waitForTimeout(900);
const landing = await p.evaluate(()=>({
  title: document.title,
  links: [...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),
  text: document.body.innerText.slice(0,600)
}));
console.log('LANDING title:', landing.title);
console.log('LANDING links:', landing.links.join(' | '));
console.log('learn/ listed on the landing page?', landing.links.some(h=>/(^|\/)learn\/?/.test(h)) ? 'YES (BUG)' : 'no (correct)');
console.log('learn/ reachable directly?', (await p.goto(B+'/learn/index.html',{waitUntil:'load'})).status());
await p.waitForTimeout(400);
console.log('  colophon h1:', await p.evaluate(()=>document.querySelector('h1')?.textContent));

let bad=0, n=0;
for (const t of ['book-of-shaders','components']) {
  const routes=['#/','#/index',...M[t].entries.map(e=>'#/'+e.id),
    ...M[t].entries.flatMap(e=>(e.examples||[]).map(x=>'#/'+e.id+'/'+x.id)),
    ...(M[t].manifest.styles||[]).map(s=>'#/style/'+s.id)];
  await p.goto(B+'/'+t+'/index.html#/',{waitUntil:'load'}); await p.waitForTimeout(700);
  for (const r of routes) {
    const before=errs.length;
    await p.evaluate(h=>{location.hash=h}, r);
    await p.waitForTimeout(150);
    const ok = await p.evaluate(()=>!!document.querySelector('main, .mat, .sheet, .page') && document.body.innerText.length>50);
    n++;
    if(!ok || errs.length>before){ bad++; console.log('  BAD', t, r, errs.slice(before).join(' | ').slice(0,160)); }
  }
  console.log(t, routes.length, 'deep links checked');
}
console.log(`\n${n} deployed routes, ${bad} bad, ${errs.length} total errors`);
if (errs.length) console.log(errs.slice(0,8).join('\n'));
await b.close();
