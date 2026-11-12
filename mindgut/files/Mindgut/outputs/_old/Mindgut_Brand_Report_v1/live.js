/* live.js: helix rings, mock interactions, site model cycle, poster zoom */
import { renderHelix } from './helix_viz.js';

// deterministic strand generators
function gen(n, f147, f258, seed){
  let s=seed; const r=()=>{s=(s*9301+49297)%233280;return s/233280};
  const out=[]; for(let i=0;i<n;i++){const x=r(); out.push({phase: x<f147?147 : x<f147+f258?258:369})}
  return out;
}
const sets={
  kernel: gen(172, .361, .314, 42),      // real fractions from the #all-impossible HELIX
  mir:    gen(4200, .35, .33, 808),      // synthetic, labelled
  new:    gen(21, .34, .33, 7),
  site:   gen(21, .34, .33, 21),
  spine:  gen(4199, .38, .27, 3)
};
document.querySelectorAll('canvas[data-helix]').forEach(cv=>{
  const k=cv.dataset.helix; const strands=sets[k]||sets.new;
  renderHelix(cv, strands, { mode: k==='spine'?'strip':'ring' });
});

// identity swap demo
(function(){
  const lbl=document.getElementById('swap-label'), btn=document.getElementById('swapbtn'), note=document.getElementById('swap-note');
  if(!lbl||!btn) return;
  const models=['CLAUDE','GPT-5','GEMINI ARGON','GROK']; let i=0;
  btn.addEventListener('click',()=>{
    i=(i+1)%models.length;
    lbl.classList.add('is-leaving');
    setTimeout(()=>{lbl.textContent=models[i];lbl.classList.remove('is-leaving');lbl.classList.add('is-arriving');setTimeout(()=>lbl.classList.remove('is-arriving'),600)},200);
    note.textContent='IDENTITY HELD · NOTHING ELSE MOVED';
  });
})();

// mock: breath ticks + swap mid-thread
(function(){
  const br=document.getElementById('mk-breath'); if(!br) return;
  for(let i=0;i<21;i++){const t=document.createElement('i'); if(i<14) t.classList.add('on'); br.appendChild(t)}
  const btn=document.getElementById('mk-swapbtn'), model=document.getElementById('mk-model'), line=document.getElementById('mk-swapline'), m3=document.getElementById('mk-m3'), m4=document.getElementById('mk-m4'), note=document.getElementById('mk-note'), strands=document.getElementById('mk-strands');
  let done=false;
  btn.addEventListener('click',()=>{
    if(done) return; done=true;
    model.classList.add('is-leaving');
    setTimeout(()=>{model.textContent='GPT';model.classList.remove('is-leaving');model.classList.add('is-arriving')},200);
    setTimeout(()=>{line.hidden=false;line.classList.add('mg-crystallize')},500);
    setTimeout(()=>{m3.hidden=false;m3.classList.add('mg-crystallize')},1300);
    setTimeout(()=>{m4.hidden=false;m4.classList.add('mg-crystallize');const hx=document.createElement('span');hx.className='mk-hex';hx.textContent='⬡';m4.appendChild(hx);strands.textContent='4,201 STRANDS';note.textContent='THE MODEL CHANGED. THE RECORD DIDN\'T. THE REPLY CONTINUED.'},2400);
    [...br.children].forEach((c,i)=>c.classList.toggle('on',i<16));
  });
})();

// site: cycle the sounding model; sentence under it never changes
(function(){
  const el=document.querySelector('.site-models'); if(!el) return;
  const models=['CLAUDE','GPT','GEMINI','GROK']; let i=0;
  setInterval(()=>{ i=(i+1)%4; el.innerHTML=models.map((m,j)=>j===i?`<b>${m}</b>`:m).join(' · '); },2600);
})();

// posters: click to zoom, with scrim + Escape
(function(){
  let scrim=null;
  const close=()=>{document.querySelectorAll('.poster.zoom').forEach(x=>x.classList.remove('zoom')); if(scrim){scrim.remove();scrim=null}};
  document.querySelectorAll('.postergrid .poster').forEach(p=>p.addEventListener('click',()=>{
    const was=p.classList.contains('zoom'); close(); if(was) return;
    p.classList.add('zoom'); scrim=document.createElement('div'); scrim.className='poster-scrim'; scrim.addEventListener('click',close); document.body.appendChild(scrim);
  }));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();
