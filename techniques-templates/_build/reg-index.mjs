// node _build/reg-index.mjs [--check]   — run from techniques-templates/ after registry.mjs and the library build.
// Writes _shared/reg-index.js: every registry entry with a picture, its live studies and plates, and its lifted modules,
// for the "All techniques" tab of index.html. Pictures and links come from library/catalog.json and the T&T manifest.
import fs from 'node:fs'; import vm from 'node:vm';
const CHECK=process.argv.includes('--check');
const reg=JSON.parse(fs.readFileSync('registry.json','utf8'));
const cat=JSON.parse(fs.readFileSync('../library/catalog.json','utf8'));
const TT=(()=>{ const c={window:{}}; vm.runInNewContext(fs.readFileSync('_shared/entries.js','utf8'),c); return c.window.TT; })();
const map=JSON.parse(fs.readFileSync('_build/registry-map.json','utf8'));
const byId=new Map(cat.records.map(r=>[r.id,r])), auth=new Map(cat.authority.techniques.map(t=>[t.key,t]));
const byCode=new Map(TT.entries.map(e=>[e.code,e]));
const usesOf=new Map(); for(const [rec,ids] of Object.entries(map.study_uses||{}))for(const id of ids){ if(!usesOf.has(id))usesOf.set(id,[]); usesOf.get(id).push(rec); }
const SITE='../';   // index.html sits in techniques-templates/; the library is a sibling
const recHref=r=>r.href?(/^https?:/.test(r.href)?r.href:SITE+r.href.replace(/^(\.\.\/)+/,'')):SITE+'library/plate.html?r='+encodeURIComponent(r.acc);
const pic=r=>r&&r.thumb&&r.access==='public'?SITE+'library/'+r.thumb:null;
const out=[], USED=new Set();
// techniques with fewer candidate pictures choose first, so a study's own technique keeps the study picture
const ORDER=[...reg.entries].map((e,i)=>({ e, i, n:(e.members||[]).flatMap(m=>m.used_in||[]).length+(e.lifts||[]).length+(usesOf.get(e.id)||[]).length }));
for(const { e } of ORDER.sort((a,b)=>a.n-b.n||a.i-b.i)){
  const studies=[...new Set((e.members||[]).flatMap(m=>m.used_in||[]).filter(c=>byCode.has(c)))].map(c=>{ const s=byCode.get(c); return { code:c, title:s.title, href:s.path+'index.html', pic:s.path+'thumb.png' }; });
  const recIds=new Set(); for(const a of e.aliases||[]){ const t=auth.get(a); if(t)for(const u of t.uses||[])recIds.add(u.rec); } for(const r of usesOf.get(e.id)||[])recIds.add(r);
  const recs=[...recIds].map(id=>byId.get(id)).filter(r=>r&&r.access==='public'&&!r.role);
  recs.sort((a,b)=>(b.thumb?1:0)-(a.thumb?1:0)||(a.kind==='plate')-(b.kind==='plate')||String(a.call||a.title).localeCompare(String(b.call||b.title)));
  const lifts=(e.lifts||[]).map(l=>({ code:l.call, title:l.title, href:l.href?SITE+l.href.replace(/^(\.\.\/)+/,''):null, rec:byId.get(l.record) })).filter(l=>l.href);
  const lead=studies[0]||null, leadRec=recs.find(r=>r.thumb)||(lifts.find(l=>l.rec&&l.rec.thumb&&l.rec.access==='public')||{}).rec||null;
  // a picture is used once on the page: take the first candidate no earlier technique has taken
  const cands=[...studies.map(x=>x.pic),...recs.map(pic),...lifts.map(l=>pic(l.rec))].filter(Boolean); const picture=cands.find(c=>!USED.has(c))||null; if(picture)USED.add(picture);
  const key=(e.aliases||[])[0]||null;
  out.push({ id:e.id, name:e.name, family:e.family, kind:e.kind, spec:e.spec||null, modules:e.modules||[], studies, lifts:lifts.slice(0,6).map(l=>({ code:l.code, title:l.title, href:l.href })),
    recs:recs.slice(0,8).map(r=>({ code:r.call||'', title:r.title, href:recHref(r) })), n:studies.length+recs.length,
    pic:picture, href:lead?lead.href:(leadRec?recHref(leadRec):(lifts[0]?lifts[0].href:(key?SITE+'library/#/techniques/'+encodeURIComponent(key):null))), lib:key?SITE+'library/#/techniques/'+encodeURIComponent(key):null });
}
const POS=new Map(reg.entries.map((e,i)=>[e.id,i])); out.sort((a,b)=>POS.get(a.id)-POS.get(b.id));
const fam=reg.families.map(f=>({ id:f.id, blurb:f.blurb, n:out.filter(e=>e.family===f.id).length }));
// the Techniques tab also shows every other pictured technique piece in the library, grouped, each linked live
// a card's key in a shared set: its call number, or a short hash of its record id
const fnv=s=>{ let h=0x811c9dc5; for(const ch of String(s)){ h^=ch.codePointAt(0); h=Math.imul(h,0x01000193)>>>0; } return h.toString(36); };
const LIBPATH=p=>p?(p.startsWith('../')?SITE+p.replace(/^\.\.\//,''):SITE+'library/'+p):null;
const GROUPS=[
  { id:'st', title:'Technique studies', blurb:'One reference, one technique, rebuilt and measured. ST series.', test:r=>r.collection==='technique-studies' },
  { id:'pm', title:'Printed matter', blurb:'Riso, letterpress, chromolitho and photocopy processes, each as a working plate.', test:r=>r.collection==='printed-matter' },
  { id:'gal', title:'Single studies', blurb:'One-off studies with no series.', test:r=>r.collection==='single-studies' },
  { id:'enc', title:'Encyclopedia', blurb:'Techniques, atoms and explorations from the encyclopedia that have a picture.', test:r=>r.collection==='encyclopedia' },
  { id:'plates', title:'Isolated plates', blurb:'Single figures lifted out of pages across the work: charts, diagrams, illustrations, interfaces.', test:r=>r.kind==='plate' },
  { id:'more', title:'Instruments and explorations', blurb:'Tools and explorations on other sites.', test:r=>['instrument','exploration'].includes(r.kind) } ];
const LIB=cat.records.filter(r=>!r.role&&r.thumb&&r.access==='public'&&r.collection!=='techniques-templates'&&r.kind!=='document');
const COLT=new Map(cat.collections.map(c=>[c.id,c.title]));
const seen=new Set(); const groups=GROUPS.map(g=>{ const cards=LIB.filter(r=>!seen.has(r.id)&&g.test(r)).map(r=>{ seen.add(r.id); return { key:r.call||('x'+fnv(r.id)), code:r.call||'', title:r.title, sub:r.kind==='plate'?(COLT.get(r.collection)||''):(r.sub||'').slice(0,140), href:recHref(r), pic:LIBPATH(r.thumb_2x&&r.thumb_2x_w<=1400?r.thumb_2x:r.thumb), kind:r.kind, family:r.family||'' }; });
  if(g.id==='plates')cards.reverse();   // newest filed first
  if(g.id==='st')cards.sort((a,b)=>parseInt(a.code.replace(/\D/g,''),10)-parseInt(b.code.replace(/\D/g,''),10));   // studies in number order
  return { id:g.id, title:g.title, blurb:g.blurb, cards }; }).filter(g=>g.cards.length);
const js=`/* generated by _build/reg-index.mjs from registry.json and library/catalog.json. Do not edit. */\nwindow.TT_REG=${JSON.stringify({ families:fam, entries:out })};\nwindow.TT_LIB=${JSON.stringify({ groups })};\n`;
const f='_shared/reg-index.js', was=fs.existsSync(f)?fs.readFileSync(f,'utf8'):'';
if(CHECK){ if(was!==js){ console.error('reg-index · _shared/reg-index.js is stale; run node _build/reg-index.mjs'); process.exit(1); } console.log('reg-index · current'); }
else { fs.writeFileSync(f,js); }
const np=out.filter(e=>!e.pic).length, nl=out.filter(e=>!e.href).length;
console.log(`reg-index · ${groups.reduce((n,g)=>n+g.cards.length,0)} library cards in ${groups.length} groups · ${out.length} techniques · ${out.length-np} pictured · ${np} type cards · ${nl} with no link`);
