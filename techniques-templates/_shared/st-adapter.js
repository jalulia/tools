/* Techniques & Templates · study adapter · ø co.
   Loaded on the Technique Studies pages (studies/<slug>/index.html), after the study's own inline scripts and before
   shell.js. It files the study in the manifest (section "Studies") and maps the study's own instrument onto the
   shell's modules through S.ui. The engines are not changed. Three kinds of study page exist:
     A  ST-01…08   a still plate: render(canvas,w,h,dpr[,finish]) only
     B  ST-09…11   an instrument: controls, params, a HUD, and S.live (tick, pointer, keys, spec) set by render()
     C  ST-13 on   a measured plate: window.__MP (palettes, presets, motion, drag axes, benchmark) + S.live
   Contract the shell reads: PLATE-UI.md · "Study pages". */
(function(){
"use strict";
const S=window.STUDY; if(!S)return;
const MP=window.__MP||null;
const TT=window.TT||(window.TT={entries:[],sections:[]});
if(!TT.sections.some(s=>s.id==='studies'))TT.sections.push({id:'studies',title:'Studies',hash:'techniques',blurb:'One reference, one technique, rebuilt and measured.'});
for(const e of (window.TT_STUDIES||[]))if(!TT.entries.some(x=>x.id===e.id))TT.entries.push(Object.assign({section:'studies'},e));

const L=()=>(S.live&&typeof S.live==='object')?S.live:null;
const ctl=id=>(S.controls||[]).find(c=>c.id===id);
const gen=MP?'C':((S.controls||S.params||S.hud)?'B':'A');
const bus={}; const on=(ev,f)=>{ (bus[ev]||(bus[ev]=[])).push(f); }; const fire=(ev,a)=>(bus[ev]||[]).forEach(f=>{ try{ f(a); }catch(e){ console.error(e); } });
const lc=s=>String(s||'').charAt(0).toLowerCase()+String(s||'').slice(1);
const cap=s=>String(s||'').charAt(0).toUpperCase()+String(s||'').slice(1);
const list=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];

/* render: the shell calls (canvas,w,h,dpr,variant,finish,overrides); the study takes (canvas,w,h,dpr,finish) */
const R=S.render;
S.render=function(c,w,h,dpr,V,finish){ const r=R.call(S,c,w,h,dpr,finish); if(r!==false&&R.length<5)finish(); return false; };

const ui={ gen, on, fire, engine:L, params:[], actions:[], presets:[], view:[], keys:[], palettes:null, motion:null, interactive:null, engineFirst:gen==='B', pointer:gen!=='A' };

/* ---------- C: measured plates ---------- */
if(gen==='C'){
  const PL=MP.plate, st=MP.st, prm=k=>(PL.params||[]).find(p=>p.key===k);
  const lab=k=>{ const p=(S.params||[]).find(q=>q.id===k)||prm(k); return p?p.label:k; };
  (S.params||[]).forEach(p=>ui.params.push({ id:p.id, label:p.label, group:p.group||'Plate', why:p.why||'', type:p.type==='text'?'text':'range', min:p.min, max:p.max, step:p.step, value:p.value, unit:p.unit||'', maxLength:p.maxLength, placeholder:p.placeholder,
    get:()=>st.P[p.id], set:(v,quick)=>{ const l=L(); if(l)l.set(p.id,v,!!quick); }, commit:()=>{ const l=L(); if(l)l.commit(); } }));
  (PL.selects||[]).forEach(s=>{ const val=o=>Array.isArray(o)?o[0]:o, nm=o=>String(Array.isArray(o)?o[1]:o);
    ui.params.unshift({ id:s.key, label:s.label, group:'Content', why:s.why||'', type:'choice', options:(s.options||[]).map(o=>({v:val(o),label:nm(o)})), value:s.def, get:()=>st.P[s.key], set:v=>{ const l=L(); if(l)l.set(s.key,v); }, commit(){} }); });
  // text rows lead their group, the way the plate's own panel had them
  ui.params.sort((a,b)=>(a.group===b.group)?((a.type==='text'?0:1)-(b.type==='text'?0:1)):0);
  if('seed' in st.P)ui.actions.push({ id:'seed', label:'New seed', title:'Re-roll the seed (N)', run:()=>{ const l=L(); if(l)l.seed(); } });
  ui.presets=(PL.presets||[]).map((ps,i)=>({ label:ps.name, title:Object.keys(ps.set||{}).map(k=>lab(k)+' '+ps.set[k]).join(' · '), run:()=>{ const l=L(); if(l)l.preset(i); }, on:()=>st.preset===i }));
  ui.resetAll=()=>{ const l=L(); if(l)l.reset(); };
  if((MP.motion||[]).length){ const moves=MP.motion.map(m=>lc(lab(m.key)));
    ui.motion={ on:()=>!!st.motion, set:v=>{ const l=L(); if(l)l.motion(!!v); } };
    S.motionHint=`Play moves ${list(moves)} at half resolution. The sliders keep the values you set.`; }
  if(MP.axes){ const ax=MP.axes; const parts=[ax.x&&ax.x.key?`across sets ${lc(lab(ax.x.key))}`:'', ax.y&&ax.y.key?`down sets ${lc(lab(ax.y.key))}`:''].filter(Boolean);
    ui.interactive={ label:'Drag on the plate', on:()=>!!st.live, set:v=>{ const l=L(); if(l)l.liveMode(!!v); } };
    S.liveLabel='Drag on the plate'; S.liveHint=`Drag on the plate: ${parts.join(', ')}.`; }
  /* color: the plate's palettes, and every ink in the one in use. An edit replaces that value in a copy of the palette. */
  const SKIP=new Set(['id','name','note','sw']); const isRGB=v=>Array.isArray(v)&&(v.length===3||v.length===4)&&v.every(n=>typeof n==='number'&&n>=0&&n<=255);
  const toHex=v=>typeof v==='string'?v.toLowerCase():'#'+v.slice(0,3).map(n=>Math.round(n).toString(16).padStart(2,'0')).join('');
  const fromHex=(h,like)=>{ if(typeof like==='string')return h; const n=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)); return like.length===4?n.concat(like[3]):n; };
  const HEX=/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
  const walk=(o,path,out)=>{ if(isRGB(o)||(typeof o==='string'&&HEX.test(o))){ out.push({path,raw:o}); return; } if(Array.isArray(o)){ o.forEach((x,i)=>walk(x,path.concat(i),out)); return; } if(o&&typeof o==='object')for(const k of Object.keys(o)){ if(!path.length&&SKIP.has(k))continue; walk(o[k],path.concat(k),out); } };
  const inksOf=p=>{ const out=[]; walk(p,[],out); return out; };
  const nameOf=path=>{ const q=path.filter(s=>!/^(c|colors?|inks?)$/.test(String(s))); const w=q.map(s=>typeof s==='number'?String(s+1):String(s).replace(/([a-z])([A-Z0-9])/g,'$1 $2').replace(/_/g,' ').toLowerCase()); return cap(w.join(' · ')||'ink'); };
  const key=path=>path.join('.');
  const edits={}; let pi=Math.max(0,PL.palettes.indexOf(st.pal));
  const apply=()=>{ const base=PL.palettes[pi], E=edits[pi]; if(!E||!Object.keys(E).length){ st.pal=base; } else { const c=JSON.parse(JSON.stringify(base)); for(const it of inksOf(base)){ const h=E[key(it.path)]; if(!h)continue; let o=c; for(let i=0;i<it.path.length-1;i++)o=o[it.path[i]]; o[it.path[it.path.length-1]]=fromHex(h,it.raw); } c.sw=(base.sw||[]).map(s=>{ const hit=inksOf(base).find(it=>toHex(it.raw)===s.toLowerCase()); return hit&&E[key(hit.path)]?E[key(hit.path)]:s; }); st.pal=c; }
    st.want='full'; MP.sync(); MP.ui(); };
  ui.palettes={ list:PL.palettes.map(p=>({ id:p.id, label:p.name+(p.note&&p.note!=='measured'?' · '+p.note:''), sw:p.sw||[] })), current:()=>pi, edited:i=>!!(edits[i]&&Object.keys(edits[i]).length),
    set:i=>{ pi=i; const l=L(); if(l)l.palette(PL.palettes[i].id); if(edits[i]&&Object.keys(edits[i]).length)apply(); },
    inks:()=>{ const base=PL.palettes[pi], E=edits[pi]||{}; return inksOf(base).map(it=>({ key:key(it.path), name:nameOf(it.path), base:toHex(it.raw), hex:E[key(it.path)]||toHex(it.raw) })); },
    setInk:(k,h)=>{ const E=(edits[pi]||(edits[pi]={})); const base=inksOf(PL.palettes[pi]).find(it=>key(it.path)===k); if(base&&toHex(base.raw)===h.toLowerCase())delete E[k]; else E[k]=h.toLowerCase(); apply(); },
    resetInks:()=>{ delete edits[pi]; apply(); } };
  /* the plate tells the page when its state moves (preset, seed, palette, drag) */
  MP.ui=()=>{ const i=PL.palettes.indexOf(st.pal); if(i>=0&&!(edits[i]&&Object.keys(edits[i]).length))pi=i; fire('sync'); };
  MP.changed=()=>fire('changed');
  MP.on.push(w=>{ if(w==='bench')fire('bench'); });
  ui.bench=()=>st.bench?{ mean:st.bench.mean, rows:st.bench.rows, err:null }:(st.benchErr?{err:st.benchErr}:null);
  ui.benchNote=()=>`Scored in this page at the default values, ${((PL.palettes.find(p=>p.id===(PL.bench&&PL.bench.palette))||PL.palettes[0]).name)} palette, reference size, against statistics read from the reference.`;
  ui.status=()=>{ const s=[st.pal.name+(('seed' in st.P)?` · seed ${st.P.seed}`:''), `${st.px[0]} × ${st.px[1]} px · ${st.ms} ms`+(st.motion?' · playing':st.quick?' · quick':'')+(st.live?' · drag on':'')]; return s; };
  ui.message=()=>{ const t=st.msg; if(!t||performance.now()-st.msgT>2600)return null; return t.replace(/^Live · drag on the figure$/,'Drag on the plate').replace(/^Live off$/,'Drag off').replace(/\bLive\b/g,'Drag'); };
  ui.spec=()=>{ MP.sync(); return S.spec; };
  ui.save=()=>{ const l=L(); if(l)l.save(); };
  ui.keys=[['N','New seed'],['C','Next palette']].filter(k=>k[0]!=='N'||('seed' in st.P));
}

/* ---------- B: instruments (ST-09…11) ---------- */
if(gen==='B'){
  const groupOf='Plate';
  (S.params||[]).forEach(p=>ui.params.push({ id:p.id, label:p.label, group:groupOf, why:p.why||(p.fmt&&p.type!=='text'?'':''), type:p.type==='text'?'text':'range', min:p.min, max:p.max, step:p.step, value:p.value, unit:p.unit||'', maxLength:p.maxLength, placeholder:p.placeholder, fmt:p.fmt,
    get:()=>{ const l=L(); if(p.type==='text')return p._v!=null?p._v:(p.value||''); const v=l&&l.get?l.get(p.id):undefined; return typeof v==='number'?v:(p._v!=null?p._v:p.value); },
    set:(v)=>{ p._v=v; try{ p.onChange(v); }catch(e){ console.error(e); } }, commit(){} }));
  const mot=ctl('orbit')||ctl('drift');
  if(mot){ ui.motion={ on:()=>{ const l=L(); return !!(l&&l.get&&l.get(mot.id)); }, set:v=>{ if(ui.motion.on()!==!!v)mot.onClick(); } };
    S.motionHint=mot.id==='orbit'?'Play lets the light orbit. Arrow keys turn it by hand.':'Play lets the sources wander.'; }
  const drw=ctl('draw');
  if(drw){ ui.interactive={ label:'Draw on the plate', on:()=>{ const l=L(); return !!(l&&l.get&&l.get('draw')); }, set:v=>{ if(ui.interactive.on()!==!!v)drw.onClick(); } };
    S.liveLabel='Draw on the plate'; S.liveHint='Draw one stroke on the plate; it replaces the 9. Reset brings the 9 back.'; }
  const hnd=ctl('handles');
  if(hnd)ui.view.push({ id:'handles', label:'Handles', on:()=>{ const l=L(); return !!(l&&l.get&&l.get('handles')); }, set:v=>{ const l=L(); if(l&&!!l.get('handles')!==!!v)hnd.onClick(); } });
  const NAMES={ shuffle:'Shuffle', ref:'Measured sources', reset:'Reset', midi:'Connect MIDI', grain:null };
  for(const c of (S.controls||[])){ if(['orbit','drift','draw','handles','save','ramp'].includes(c.id))continue;
    ui.actions.push({ id:c.id, label:NAMES[c.id]||c.label, title:cap(c.title||''), run:()=>c.onClick(), relabel:c.relabel?()=>{ try{ return c.relabel(); }catch(e){ return c.label; } }:null }); }
  const rst=ctl('reset')||ctl('ref'); if(rst)ui.resetAll=()=>rst.onClick();
  const ramp=ctl('ramp'); const ramps=S.spec&&S.spec.ramps;
  if(ramp&&ramps){ const names=Object.keys(ramps);
    ui.palettes={ list:names.map(k=>({ id:k, label:cap(k), sw:ramps[k] })), current:()=>{ const l=L(); return Math.max(0,names.indexOf(l&&l.get?l.get('ramp'):names[0])); }, edited:()=>false,
      set:i=>{ for(let k=0;k<names.length&&ui.palettes.current()!==i;k++)ramp.onClick(); }, inks:()=>[] };
    S.colorHint='Pick a ramp. Each is a fixed set of five inks the levels map to.'; }
  if(S.id==='st-10'){ S.colorHint='The colors are the sources on the plate. Click one to select it, then hold it for the hue ring: around for hue, outward for chroma.';
    ui.pointerHint='Drag a source to move it, drag the field to stir, scroll on a source for its reach. Hold the field to add a source.'; }
  if(S.id==='st-09'&&!S.colorHint)S.colorHint='The colors come from one light: they are measured, not separate inks.';
  ui.save=ctl('save')?()=>ctl('save').onClick():null;
  ui.spec=()=>{ const l=L(); return l&&l.spec?l.spec():S.spec; };
  ui.status=()=>{ const l=L(); if(!l||!l.hud)return null; return String(l.hud()).split('\n').filter(Boolean).map(s=>s.replace(/\bLIVE\b/g,'DRAG')).slice(0,2); };
  ui.message=()=>null;
  const K=(S.spec&&S.spec.keys)||null; if(K&&typeof K==='object')ui.keys=Object.entries(K).map(([k,v])=>[k,cap(v)]);
  else if(mot)ui.keys=[['Arrows','Turn the light']];
}

/* ---------- A: still plates ---------- */
if(gen==='A'){ if(!S.colorHint)S.colorHint='This plate prints the inks measured from its reference. They are fixed here; the spec lists every value.'; ui.pointer=false; }

S.ui=ui;
})();
