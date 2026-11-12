/* Mindgut report. The page measures itself. */
import { renderHelix } from './helix_viz.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* letter-by-letter count: a=1..z=26, digital root, mod 3 -> 147 / 258 / 369 */
function count(text){
  const c=[0,0,0];
  for(const ch of text.toLowerCase()){const n=ch.charCodeAt(0)-96; if(n<1||n>26) continue; c[(n-1)%9%3]++;}
  const t=c[0]+c[1]+c[2]||1; return {c,f:c.map(x=>x/t),t};
}
const fmt=f=>f.map(x=>x.toFixed(3).slice(1)).join(' / ');
const num=n=>n.toLocaleString('en-US');

/* sections: nav + each section's own split in the margin */
const secs=$$('section.s[id]');
const nav=$('#nav');
secs.forEach(s=>{
  const {f,t}=count(s.textContent);
  s.dataset.split=`${fmt(f)} · ${num(t)} LETTERS`;
  const a=document.createElement('a'); a.href='#'+s.id; a.innerHTML=`<span>${s.dataset.n}</span>${s.dataset.title}`; nav.appendChild(a);
});
const links=$$('#nav a');
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting) links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-40% 0px -55% 0px'});
secs.forEach(s=>io.observe(s));

/* the strip: whole page as strands (one paragraph = one strand), bars = its split */
const paras=$$('main p, main li, main h2, main h3, main figcaption, main td').filter(el=>el.textContent.trim().length>12);
const whole=count($('main').textContent);
$('#st-strands').textContent=`${num(paras.length)} STRANDS`;
$('#end-count').textContent=`THIS PAGE · ${num(paras.length)} STRANDS · ${fmt(whole.f)}`;
$$('#st-bars i').forEach((b,i)=>b.style.setProperty('--w',(whole.f[i]*100).toFixed(1)+'%'));

/* breath: 21 cells, one per 200ms, the same 4.2s the dot uses */
function breathe(el,start=0){
  if(!el) return; el.innerHTML='';
  for(let i=0;i<21;i++) el.appendChild(document.createElement('i'));
  const cells=[...el.children]; let k=start;
  const tick=()=>{k=(k+1)%22; cells.forEach((c,i)=>c.classList.toggle('on',i<k))};
  tick(); if(!reduce) setInterval(tick,200);
}
breathe($('#st-breath')); breathe($('#mk-breath'),14);

/* rings. kernel fractions are real (#all-impossible, 172 strands). others are labelled synthetic. */
function gen(n,f1,f2,seed){let s=seed;const r=()=>{s=(s*9301+49297)%233280;return s/233280};const o=[];for(let i=0;i<n;i++){const x=r();o.push({phase:x<f1?147:x<f1+f2?258:369})}return o}
const sets={kernel:gen(172,.361,.314,42),mir:gen(4200,.35,.33,808),new:gen(21,.34,.33,7),spine:gen(4199,.38,.27,3)};
$$('canvas[data-helix]').forEach(cv=>renderHelix(cv,sets[cv.dataset.helix]||sets.new,{mode:cv.dataset.helix==='spine'?'strip':'ring'}));

/* swap the model: only the label moves */
const MODELS=['CLAUDE','GPT','GEMINI','GROK'];
function swapLabel(lbl,next){
  lbl.classList.add('is-leaving');
  setTimeout(()=>{lbl.textContent=next;lbl.classList.remove('is-leaving');lbl.classList.add('is-arriving');setTimeout(()=>lbl.classList.remove('is-arriving'),600)},200);
}
(()=>{
  const lbl=$('#swap-label'),btn=$('#swap-btn'),note=$('#swap-note'); if(!btn) return; let i=0;
  btn.addEventListener('click',()=>{i=(i+1)%MODELS.length;swapLabel(lbl,MODELS[i]);note.textContent='HELD · NOTHING ELSE MOVED'});
})();

/* the room: swap mid-thread, then the thread continues and the count goes up */
(()=>{
  const btn=$('#mk-swapbtn'); if(!btn) return;
  const model=$('#mk-model'),line=$('#mk-swapline'),m3=$('#mk-m3'),m4=$('#mk-m4'),note=$('#mk-note'),strands=$('#mk-strands'),rail=$('.mk-helix'),conv=$('#mk-conv');
  let n=4199,done=false;
  const bump=(text,phase)=>{n++;strands.textContent=`${num(n)} STRANDS`;
    const d=document.createElement('div');d.className='mk-strand arrive';
    d.innerHTML=`<span class="mono">${num(n)} · <b style="color:var(--p${phase})">${phase}</b></span>${text}`;
    rail.insertBefore(d,rail.children[1]);};
  btn.addEventListener('click',()=>{
    if(done) return; done=true; btn.disabled=true;
    swapLabel(model,'GPT'); line.hidden=false; bump('"Pull it. Keep going…"',147);
    setTimeout(()=>{m3.hidden=false;m3.classList.add('arrive');conv.scrollTop=1e4},500);
    setTimeout(()=>{m4.hidden=false;m4.classList.add('arrive');bump('"In the window now…"',258);note.textContent='SAME RECORD · DIFFERENT MODEL';conv.scrollTop=1e4},1400);
  });
  /* composer line takes the color of what's typed: here, of the page's own split */
  $('.mk-line').style.setProperty('--fill',(whole.f[1]*100).toFixed(0)+'%');
})();

/* cover: a slow helix of strands, colored by phase, three turns */
(()=>{
  const cv=$('#cv-helix'); if(!cv||reduce) return;
  const ctx=cv.getContext('2d'); const css=getComputedStyle(document.documentElement);
  const col={147:css.getPropertyValue('--p147').trim(),258:css.getPropertyValue('--p258').trim(),369:css.getPropertyValue('--p369').trim()};
  const S=gen(420,.36,.31,808).map((s,i)=>({c:s.phase,l:.35+((i*7919)%100)/154,ph:(i*2.399)%6.283}));
  let W,H;
  const size=()=>{const d=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0)};
  size(); addEventListener('resize',size);
  let t=0;
  (function frame(){
    t+=0.0025; ctx.clearRect(0,0,W,H);
    const cx=W*0.7,cy=H*0.5,R=Math.min(W,H)*0.42;
    S.forEach((s,i)=>{
      const a=(i/S.length)*Math.PI*6+t, y=cy+(i/S.length-0.5)*H*1.1, x=cx+Math.cos(a)*R*0.55, z=(Math.sin(a)+1)/2;
      ctx.globalAlpha=(0.12+z*0.55)*(0.85+0.15*Math.sin(t*6+s.ph)); ctx.strokeStyle=col[s.c]; ctx.lineWidth=0.8+z*1.6;
      ctx.beginPath(); ctx.moveTo(x-(8+s.l*26)*z,y); ctx.lineTo(x+(8+s.l*26)*z,y); ctx.stroke();
    });
    ctx.globalAlpha=1; requestAnimationFrame(frame);
  })();
})();
