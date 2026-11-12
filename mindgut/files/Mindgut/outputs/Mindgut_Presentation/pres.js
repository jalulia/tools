/* Mindgut Presentation boot.
   Mounts real brand assets, live Rhizome / Rolodex / Planters studies, and the interactive Product + HELIX slice. */
(function(){
  const M = window.MG;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* 1 · Real Mindgut lockups & icons */
  const put = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; };
  put('#wm', Brand.lockup(17));
  put('#bigwm', Brand.lockup(44));
  put('#bigwm-dark', Brand.lockup(44, { dark:1 }));
  put('#big-icon', Brand.icon(96));
  put('#cardwm', Brand.lockup(22));
  put('#swm', Brand.lockup(17));
  put('#swm2', Brand.wordmark(15));
  put('#st-wm', Brand.lockup(20, { dark:1 }));
  put('#trk-wm', Brand.lockup(22, { dark:1 }));
  put('#wb-wm', Brand.lockup(20));
  put('#inv-wm', Brand.lockup(22));
  put('#closewm', Brand.lockup(52));

  /* 2 · Load robot & wordmark images for Canvas studies (Rhizome & Rolodex) */
  const loadImg = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

  Promise.all([
    loadImg('brand/robot.png'),
    loadImg('brand/wordmark-white.png'),
    document.fonts ? document.fonts.ready : Promise.resolve()
  ]).then(([robot, wmWhite]) => {
    if (window.Rhizome){ Rhizome.assets.robot = robot; Rhizome.assets.wm = wmWhite; }
    if (window.Rolodex){ Rolodex.assets.robot = robot; Rolodex.assets.wm = wmWhite; }
    initHero();
    initVoiceRolodex();
  });

  /* 3 · Hero canvas with switcher (01 Rhizome · 02 Rolodex · 03 Archive Planters) */
  function initHero(){
    const cv = $('#hero-canvas');
    const tg = $('#pl-toggle'), rp = $('#pl-replay'), cap = $('#open-cap');
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let scene = 'rhizome', playing = !reduce, t = reduce ? 9.8 : 2.9, last = performance.now(), raf = 0, lastFrame = -1;
    let planterBuilt = false;

    const CAPS = {
      rhizome: '01 · RHIZOME — Every exchange becomes a node. Contexts you return to grow; Mir traces back, connects, and opens the next move.',
      rolodex: '02 · ROLODEX — “hey mir, can we pick back up on the short film?” Flipping back through dated cards to land on the March ending decision.',
      planters: '03 · ARCHIVE STUDY — Early folder illustration study: four project threads receiving dated slips.'
    };

    function syncBtn(){
      if (!tg) return;
      tg.textContent = playing ? 'Pause' : 'Play';
      tg.setAttribute('aria-label', tg.textContent);
    }

    function drawFrame(force){
      const mod = scene === 'rhizome' ? window.Rhizome : scene === 'rolodex' ? window.Rolodex : window.Planters;
      if (!mod) return;
      const fps = mod.FPS || 12;
      const fi = Math.floor(t * fps);
      if (!force && fi === lastFrame) return;
      lastFrame = fi;

      if (scene === 'planters'){
        if (!planterBuilt){ Planters.setSPR(Math.max(2, dpr*1.25)); Planters.build(); planterBuilt = true; }
        cv.width = 960 * dpr; cv.height = 540 * dpr;
        const ctx = cv.getContext('2d');
        ctx.setTransform(1,0,0,1,0,0);
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
        const s = 0.8 * dpr;
        ctx.setTransform(s, 0, 0, s, 0, 14 * dpr);
        Planters.render(ctx, Math.min(Planters.DURATION, fi / fps));
      } else {
        if (cv.width !== mod.W * dpr || cv.height !== mod.H * dpr){
          cv.width = mod.W * dpr; cv.height = mod.H * dpr;
        }
        const ctx = cv.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        mod.render(ctx, fi / fps);
      }
    }

    function tick(now){
      if (!playing) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;
      if (scene === 'planters' && t >= Planters.DURATION + 2.0){ t = 0; lastFrame = -1; }
      drawFrame(false);
      raf = requestAnimationFrame(tick);
    }

    function setScene(next){
      cancelAnimationFrame(raf);
      scene = next;
      lastFrame = -1;
      t = reduce ? (next === 'planters' ? 7.2 : 9.8) : (next === 'rhizome' ? 2.9 : next === 'rolodex' ? 0.5 : 0);
      if (cap) cap.textContent = CAPS[next] || '';
      document.querySelectorAll('.os-btn').forEach(b => {
        const on = b.dataset.scene === next;
        b.classList.toggle('on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      drawFrame(true);
      if (playing){ last = performance.now(); raf = requestAnimationFrame(tick); }
    }

    document.querySelectorAll('.os-btn').forEach(b => {
      b.onclick = () => setScene(b.dataset.scene);
    });
    if (tg) tg.onclick = () => {
      playing = !playing; syncBtn();
      if (playing){ last = performance.now(); raf = requestAnimationFrame(tick); }
      else cancelAnimationFrame(raf);
    };
    if (rp) rp.onclick = () => {
      cancelAnimationFrame(raf);
      t = 0; lastFrame = -1; playing = true; syncBtn();
      drawFrame(true); last = performance.now(); raf = requestAnimationFrame(tick);
    };

    syncBtn();
    drawFrame(true);
    if (playing){ last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  /* 4 · Secondary Rolodex canvas in Identity section */
  function initVoiceRolodex(){
    const cv = $('#vo-rolodex'), rp = $('#ro-replay');
    if (!cv || !window.Rolodex) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Rolodex.W * dpr; cv.height = Rolodex.H * dpr;
    const ctx = cv.getContext('2d');
    let t = 10.4, raf = 0, last = 0, playing = false;
    const draw = () => { ctx.setTransform(dpr,0,0,dpr,0,0); Rolodex.render(ctx, t); };
    draw();
    function loop(now){
      if (!playing) return;
      t += Math.min(0.1, (now - last) / 1000); last = now;
      draw();
      if (t >= Rolodex.T){ t = 10.4; playing = false; draw(); return; }
      raf = requestAnimationFrame(loop);
    }
    if (rp) rp.onclick = () => {
      cancelAnimationFrame(raf); t = 0; playing = true; last = performance.now();
      raf = requestAnimationFrame(loop);
    };
  }

  /* 5 · Product + HELIX interactive slice */
  try { Product.mount($('#product')); } catch(e){ console.error('product', e); }
  try { Helix.mount($('#helixapp')); } catch(e){ console.error('helix', e); }

  /* 6 · Dense record social card */
  const dn = $('#dense');
  if (dn) dn.innerHTML = M.strands.filter(s => !s.live).map(s => esc(s.text).replace(/(florals?|flowers?)/gi, '<em>$1</em>')).join(' · ');

  /* 7 · Cross-track poster background text */
  const rep = $('#trk-rep');
  if (rep){
    const v = [
      "Hi. I run a two-person packaging studio. We're working on a loose-leaf tea brand, four SKUs, premium but not precious. The CEO doesn't like florals.",
      "Context: small studio, tea client, four SKUs, Whole Foods shelf and their site. No florals, the CEO hates them. We picked a pattern route.",
      "Quick background before you start. Packaging studio. Tea. Pattern route, one tile per SKU, shared grid. No florals on the core range.",
      "OK so again: I'm a designer, this is a tea brand, we already decided no florals for the core range, the sampler has a peel pattern, she wants a serif…",
      "Pasting my brief again because you won't have it. Studio, tea, four SKUs, pattern route, no florals, sampler approved in April, holiday tin now."
    ];
    let h = ''; for (let i=0;i<34;i++) h += `<span class="${i%7===3?'x':''}">${esc(v[i%v.length])}</span> `;
    rep.innerHTML = h;
  }

  /* 8 · Website model rotator */
  const rot = $('#s-rot');
  if (rot && !reduce){
    const names = ['Claude','GPT-5','Gemini','Grok']; let i = 0;
    setInterval(() => { i = (i+1) % names.length; rot.classList.remove('in'); void rot.offsetWidth; rot.textContent = names[i]; rot.classList.add('in'); }, 2400);
  }

  /* 9 · Story 9:16 animation */
  const story = $('#story'), sp = $('#st-play');
  function storyRun(){
    if (!story) return;
    const steps = story.querySelectorAll('[data-step]');
    steps.forEach(s => s.classList.remove('on'));
    if (reduce){ steps.forEach(s => s.classList.add('on')); return; }
    const T = [150, 1800, 3600, 5400, 7200];
    steps.forEach(s => setTimeout(() => s.classList.add('on'), T[+s.dataset.step]));
  }
  if (story){
    if (sp) sp.onclick = storyRun;
    storyRun();
  }
})();
