/* Mindgut brand report: rail nav, reveal, tabs, breath, cover helix */
(function(){
  const secs=[...document.querySelectorAll('section.sec[id]')];
  const list=document.getElementById('rail-list');
  secs.forEach((s,i)=>{
    const h=s.querySelector('h2'); if(!h) return;
    const li=document.createElement('li');
    li.innerHTML=`<a href="#${s.id}"><span class="n">${String(i+1).padStart(2,'0')}</span><span>${h.textContent}</span></a>`;
    list.appendChild(li);
  });
  const links=[...list.querySelectorAll('a')];
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id)); }});
  },{rootMargin:'-40% 0px -55% 0px'});
  secs.forEach(s=>io.observe(s));

  // reveal
  const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target)}}),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));

  // tabs
  document.querySelectorAll('.tabs').forEach(t=>{
    const btns=[...t.querySelectorAll('button')]; const panes=[...t.parentElement.querySelectorAll(':scope > .tabpane')];
    const pick=i=>{btns.forEach((x,j)=>{x.classList.toggle('on',j===i);x.setAttribute('aria-selected',j===i?'true':'false')});panes.forEach((x,j)=>x.classList.toggle('on',j===i))};
    btns.forEach((b,i)=>{b.addEventListener('click',()=>pick(i));b.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){pick((i+1)%btns.length);btns[(i+1)%btns.length].focus()}if(e.key==='ArrowLeft'){pick((i-1+btns.length)%btns.length);btns[(i-1+btns.length)%btns.length].focus()}})});
  });

  // breath: 21 cells, advance one per 4s; exhale (reset) at 21
  const br=document.getElementById('rail-breath');
  if(br){ for(let i=0;i<21;i++){br.appendChild(document.createElement('i'))}
    let k=0; const cells=[...br.children];
    setInterval(()=>{ k=(k+1)%22; cells.forEach((c,i)=>c.classList.toggle('on',i<k)); },1800);
  }

  // cover helix: slow drifting strip of strands colored by phase
  const cv=document.getElementById('cover-helix');
  if(cv && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    const ctx=cv.getContext('2d'); let W,H,dpr;
    const css=getComputedStyle(document.documentElement);
    const col={147:css.getPropertyValue('--p147').trim(),258:css.getPropertyValue('--p258').trim(),369:css.getPropertyValue('--p369').trim()};
    // deterministic pseudo-helix from the real kernel balance: f147 .36 / f258 .31 / f369 .33
    let seed=808; const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280};
    const N=420; const strands=[]; for(let i=0;i<N;i++){const r=rnd();strands.push({c:r<.36?147:r<.67?258:369,l:.35+rnd()*.65,ph:rnd()*Math.PI*2})}
    function size(){dpr=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
    size(); addEventListener('resize',size);
    let t=0;
    function frame(){
      t+=0.0025; ctx.clearRect(0,0,W,H);
      const cx=W*0.68, cy=H*0.5, R=Math.min(W,H)*0.42;
      for(let i=0;i<N;i++){
        const s=strands[i]; const a=(i/N)*Math.PI*2*3 + t;          // three turns
        const y=cy + (i/N-0.5)*H*1.1;                                 // vertical travel
        const x=cx + Math.cos(a)*R*0.55; const z=(Math.sin(a)+1)/2;   // depth
        const breath=0.85+0.15*Math.sin(t*6+s.ph);
        ctx.globalAlpha=(0.12+z*0.55)*breath;
        ctx.strokeStyle=col[s.c]; ctx.lineWidth=0.8+z*1.6;
        ctx.beginPath(); ctx.moveTo(x-(8+s.l*26)*z,y); ctx.lineTo(x+(8+s.l*26)*z,y); ctx.stroke();
      }
      ctx.globalAlpha=1; requestAnimationFrame(frame);
    }
    frame();
  }
})();
