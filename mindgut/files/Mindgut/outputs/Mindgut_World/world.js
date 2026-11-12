/* Mindgut world: strip, breath, hero field, plate grids, frame switchers. */
import { renderField } from './lib/field.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* paper tooth as a CSS tile, multiplied over everything (press rule: tooth under ink; here the page is the sheet) */
(()=>{const c=document.createElement('canvas');c.width=c.height=180;const x=c.getContext('2d');const img=x.createImageData(180,180);let s=4141;const r=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
for(let i=0;i<img.data.length;i+=4){const v=238+(r()-.5)*26;img.data[i]=img.data[i+1]=img.data[i+2]=v;img.data[i+3]=255}x.putImageData(img,0,0);
document.documentElement.style.setProperty('--tooth',`url(${c.toDataURL()})`)})();

/* nav */
const chs=$$('section.ch[id]'); const nav=$('#nav');
chs.forEach(c=>{const a=document.createElement('a');a.href='#'+c.id;a.textContent=c.dataset.t;nav.appendChild(a)});
const links=$$('#nav a');
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});
chs.forEach(c=>io.observe(c));

/* breath: 21 cells, 4.2s */
(()=>{const el=$('#st-breath');for(let i=0;i<21;i++)el.appendChild(document.createElement('i'));const cells=[...el.children];let k=0;
const tick=()=>{k=(k+1)%22;cells.forEach((c,i)=>c.classList.toggle('on',i<k))};tick();if(!reduce)setInterval(tick,200)})();

/* a synthetic record: 6,630 strands tagged a/b/c, seeded so it's the same every load */
function record(n,seed=6630){let s=seed;const r=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};const o=[];let bias=0;
for(let i=0;i<n;i++){bias=bias*0.94+(r()-.5)*0.3;const x=r()+bias;o.push(x<0.36?'a':x<0.68?'b':'c')}return o}
const SEQ=record(6630);
$('#st-count').textContent='6,630 STRANDS';

/* hero */
const hero=$('#hero'); if(hero){ const h=renderField(hero,SEQ,{mode:'terrain',palette:'deep',animate:!reduce});
  // the terrain grows while you look: one breath every 4.2s
  if(!reduce) setInterval(()=>{SEQ.push(...record(21,Date.now()&0xffff));h.update(SEQ);$('#st-count').textContent=SEQ.length.toLocaleString('en-US')+' STRANDS'},4200); }

/* plate grids */
const TEX=[['proto/dotfield.html','Terrain','ref 09'],['proto/ribbon.html','Moss ribbon','ref 06 · 16'],['proto/grain.html','Riso grain & burst','ref 20 · 05'],['proto/caustics.html','Water','ref 18'],['proto/line.html','The line','ref 02'],['proto/vortex.html','Vortex','ref 01']];
const ILL=[['ill/planters.html','Planters','a record that grows'],['ill/book.html','Ribbons','markers you can return to'],['ill/swap.html','The swap','change the model, keep the record'],['ill/field.html','The field','the record as terrain'],['ill/stamp.html','The stamp','constantly growing'],['ill/line.html','Strand by strand','one line, words on it']];
function grid(el,items){el.innerHTML=items.map(([src,b,s])=>`<figure class="plate" style="margin:0"><a class="open" href="${src}" target="_blank" rel="noopener">open ↗</a><iframe src="${src}" title="${b}" loading="lazy"></iframe><figcaption class="cap"><b>${b}</b><span>${s}</span></figcaption></figure>`).join('')}
grid($('#tex'),TEX); grid($('#ill'),ILL);

/* frame switchers */
function switcher(listSel,frameSel){const list=$(listSel),frame=$(frameSel);if(!list)return;list.addEventListener('click',e=>{const a=e.target.closest('a[data-src]');if(!a)return;e.preventDefault();frame.src=a.dataset.src;list.querySelectorAll('a').forEach(x=>x.classList.toggle('on',x===a))})}
switcher('#helix-list','#helix-frame'); switcher('#room-list','#room-frame');

/* this page, counted */
(()=>{const t=document.body.innerText.toLowerCase();const c=[0,0,0];for(const ch of t){const n=ch.charCodeAt(0)-96;if(n<1||n>26)continue;c[(n-1)%9%3]++}const s=c[0]+c[1]+c[2];
$('#end-count').textContent=`${s.toLocaleString('en-US')} letters · ${(c[0]/s).toFixed(3).slice(1)} / ${(c[1]/s).toFixed(3).slice(1)} / ${(c[2]/s).toFixed(3).slice(1)}`})();
