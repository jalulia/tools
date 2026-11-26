/* app3.js · the ribbon held to hands, and three lockups that land it on the wordmark: stage, guide sheet, elevations, plates, export */
"use strict";
(() => {
  const PALS = [
    { id: 'emerald', name: 'Emerald', ground: [8, 11, 12], haze: [2, 6, 16], grid: [40, 60, 110], ribbon: [40, 200, 90], gel: [60, 200, 110], rim: [255, 190, 90],
      arcs: [[255, 230, 120], [255, 120, 150], [200, 220, 255]], spheres: [[255, 160, 60], [240, 230, 90], [120, 140, 255], [255, 90, 90], [220, 240, 230]], mark: [236, 238, 236], sw: '#28c85a', src: 'ST-22 p10 palette "Emerald"' },
    { id: 'st22', name: 'ST-22 orange', ground: [10, 11, 16], haze: [2, 1, 26], grid: [30, 27, 46], ribbon: [255, 72, 25], gel: [255, 120, 40], rim: [90, 136, 221],
      arcs: [[252, 206, 108], [118, 154, 90], [120, 150, 255]], spheres: [[152, 182, 98], [250, 200, 66], [152, 182, 98], [92, 84, 186], [64, 94, 186]], mark: [236, 238, 236], sw: '#ff4819' },
    { id: 'lime', name: 'Mindgut lime', ground: [17, 21, 19], haze: [4, 30, 18], grid: [24, 66, 42], ribbon: [208, 236, 96], gel: [170, 215, 80], rim: [183, 156, 242],
      arcs: [[234, 246, 176], [150, 196, 70], [183, 156, 242]], spheres: [[208, 236, 96], [18, 107, 61], [183, 156, 242], [86, 62, 168], [150, 196, 70]], mark: [236, 238, 236], sw: '#D0EC60' },
    { id: 'box', name: 'Lightbox', lightbox: true, ground: [236, 238, 236], haze: [0, 0, 0], grid: [40, 46, 42], ribbon: [208, 236, 96], gel: [150, 205, 70], rim: [86, 62, 168], opacity: .16, tint: .9, rimGlow: .6, bloom: 0,
      arcs: [[18, 107, 61], [86, 62, 168], [18, 107, 61]], spheres: [[208, 236, 96], [18, 107, 61], [183, 156, 242], [86, 62, 168], [150, 196, 70]], mark: [17, 21, 19], sw: '#ECEEEC' }
  ];
  const VIEWS = { front: { az: 0, el: 0, persp: .15, zoom: 1 }, oblique: { az: 32, el: -16, persp: .5, zoom: 1.05 }, axis: { az: 90, el: 0, persp: .3, zoom: 2.4 } };
  const $ = id => document.getElementById(id);
  const cv = $('cv'), ov = $('ov'), REND = GL.make(cv), H = HANDS.DEF;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const st = { mode: 'logo', lk: 'wrap', lt: reduce ? 1 : 0, hold: 0, from: 'mindgut', to: 'mindgut', m: 1, mT: 0, phase: 0, play: !reduce, view: 'front', vFrom: 'front', vm: 1, guide: false, under: false, pal: 0, last: 0, intro: false };
  const lerp = (a, b, t) => a + (b - a) * t, ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /* ---------- controls ---------- */
  const chip = (html, fn, radio) => { const b = document.createElement('button'); b.className = 'chip'; b.innerHTML = html; b.onclick = fn; if (radio) b.setAttribute('role', 'radio'); return b; };
  const on = (b, v) => b.setAttribute(b.getAttribute('role') === 'radio' ? 'aria-checked' : 'aria-pressed', String(v));
  [['logo', 'Logo'], ['hands', 'Hands']].forEach(([k, l]) => $('modes').appendChild(chip(l, () => { st.mode = k; if (k === 'hands') { st.guide = true; } else { st.guide = false; st.lt = 0; } st.last = 0; sync(); draw(); side(); }, true)));
  LOCK.LOCKUPS.forEach(l => { const b = chip(`<span class="n">${l.no}</span>${l.name}`, () => { st.mode = 'logo'; st.lk = l.id; st.lt = 0; st.hold = 0; st.last = 0; sync(); draw(); side(); }, true); b.dataset.lk = l.id; $('hands').appendChild(b); });
  H.forEach(h => { const b = chip(`${h.name}`, () => { st.mode = 'hands'; setHand(h.id); }, true); b.dataset.hand = h.id; $('hands').appendChild(b); });
  Object.keys(VIEWS).forEach(v => $('views').appendChild(chip(v[0].toUpperCase() + v.slice(1), () => setView(v), true)));
  const tg = [['guide', 'Guide sheet'], ['under', 'Wordmark under']];
  tg.forEach(([k, l]) => $('toggles').appendChild(chip(l, () => { st[k] = !st[k]; sync(); draw(); })));
  PALS.forEach((p, i) => $('pals').appendChild(chip(`<span class="sw" style="background:${p.sw}"></span>${p.name}`, () => { st.pal = i; sync(); draw(); renderPlates(); }, true)));
  const RO = ['X-HEIGHT', 'ASC', 'DESC', 'NIB', 'SLANT', 'STROKE PITCH', 'TURNS'], ROL = ['TIME', 'TURN', 'AZIMUTH', 'ELEVATION', 'WORDMARK', 'RIBBON', 'REVEAL'];
  $('readout').innerHTML = RO.map(k => `<div><span class="k mono">${k}</span><span class="v">—</span></div>`).join('');
  const vEls = [...document.querySelectorAll('.readout .v')];
  function setHand(id) { if (id === st.to && st.m >= 1) return; st.from = st.m < 1 ? st.to : st.to; st.to = id; st.m = 0; st.mT = performance.now(); st.intro = false; sync(); if (!st.play) animateOnce(); }
  function setView(v) { if (v === st.view) return; st.vFrom = st.view; st.view = v; st.vm = 0; st.vT = performance.now(); sync(); if (!st.play) animateOnce(); }
  function sync() {
    const logo = st.mode === 'logo';
    [...$('modes').children].forEach((b, i) => on(b, (i === 0) === logo));
    [...$('hands').children].forEach(b => { if (b.dataset.lk) { b.hidden = !logo; on(b, b.dataset.lk === st.lk); } else { b.hidden = logo; on(b, b.dataset.hand === st.to); } });
    $('scrub').setAttribute('aria-label', logo ? 'Time' : 'Turn of the coil');
    $('viewRow').hidden = logo;
    [...$('readout').querySelectorAll('.k')].forEach((k, i) => k.textContent = (logo ? ROL : RO)[i]);
    [...$('views').children].forEach((b, i) => on(b, Object.keys(VIEWS)[i] === st.view));
    [...$('toggles').children].forEach((b, i) => { b.setAttribute('aria-pressed', String(!!st[tg[i][0]])); if (tg[i][0] === 'under') b.hidden = logo; });
    [...$('pals').children].forEach((b, i) => on(b, i === st.pal));
    const h = HANDS.byId(st.to), cap = t => t.charAt(0).toUpperCase() + t.slice(1), L0 = LOCK.byId(st.lk);
    $('handLine').textContent = logo ? `${L0.no} ${L0.name}. ${L0.line}` : `${h.name}, ${h.note}. ${cap(h.src)}.`;
    $('play').setAttribute('aria-label', st.play ? 'Pause' : 'Play'); $('playIcon').innerHTML = st.play ? '<path d="M4 3h2.8v10H4zM9.2 3H12v10H9.2z"/>' : '<path d="M4.5 2.8v10.4L13 8z"/>';
    if (logo) lockCard(L0); else card(h);
  }
  $('bReset').onclick = () => { Object.assign(st, { mode: 'logo', lk: 'wrap', lt: 0, hold: 0, from: 'mindgut', to: 'mindgut', m: 1, phase: 0, play: !reduce, view: 'front', vFrom: 'front', vm: 1, guide: false, under: false, last: 0 });
    const repaint = st.pal !== 0; st.pal = 0; sync(); draw(); side(); if (repaint) renderPlates(); };
  $('play').onclick = () => { st.play = !st.play; st.last = 0; sync(); };
  $('scrub').oninput = e => { if (st.mode === 'logo') st.lt = e.target.value / 1000; else st.phase = e.target.value / 1000; st.play = false; sync(); draw(); side(); };
  addEventListener('keydown', e => { if (e.target.closest && e.target.closest('input')) return; if (e.key === ' ' && e.target === document.body) { e.preventDefault(); $('play').click(); }
    const n = +e.key; if (n >= 1 && n <= H.length) setHand(H[n - 1].id); });

  /* ---------- frame ---------- */
  const camAt = () => { const a = VIEWS[st.vFrom], b = VIEWS[st.view], t = ease(st.vm); const c = {}; for (const k in b) c[k] = lerp(a[k], b[k], t); return c; };
  function frameNow(phase, opts) {
    opts = opts || {};
    if ((opts.mode || st.mode) === 'logo') { const L0 = LOCK.byId(opts.lk || st.lk); return L0.f(opts.lt === undefined ? st.lt : opts.lt); } const from = opts.from || st.from, to = opts.to || st.to, m = opts.m === undefined ? st.m : opts.m;
    const cam = opts.cam || camAt();
    const F = HANDS.frame(from, to, ease(m), phase, cam);
    F.cam.zoom = lerp(fitZoom(from, opts.view || st.view), fitZoom(to, opts.view || st.view), ease(m)) * (opts.cam ? 1 : 1);
    if (!opts.cam) { const za = fitZoom(from, st.vFrom), zb = fitZoom(to, st.vFrom), zc = fitZoom(from, st.view), zd = fitZoom(to, st.view), em = ease(m), ev = ease(st.vm); F.cam.zoom = lerp(lerp(za, zb, em), lerp(zc, zd, em), ev); }
    const stw = (from === 'st22' ? 1 - ease(m) : 0) + (to === 'st22' ? ease(m) : 0); F.cam.persp = lerp(F.cam.persp, Math.max(F.cam.persp, .4), stw);
    const mg = (from === 'mindgut' ? 1 - ease(m) : 0) + (to === 'mindgut' ? ease(m) : 0), L = HANDS.layout(HANDS.byId('mindgut'));
    F.markView = { k: L.k, ox: L.ox, oy: L.oy }; F.under = (opts.under === undefined ? st.under : opts.under) ? .16 * mg : 0;
    return F;
  }

  /* zoom so each hand fills the stage the same way: its strokes across the width, its ladder in the height */
  function fitZoom(id, v) { const h = HANDS.byId(id), L = HANDS.layout(h), tall = (L.desc - L.asc) || 594;
    if (id === 'st22') return v === 'axis' ? .82 : 1;
    if (v === 'axis') return Math.max(.8, Math.min(2.6, .7 * 675 / tall));
    const span = (L.X[L.X.length - 1] - L.X[0]) + 12 * L.nib + tall * Math.tan(h.slant * Math.PI / 180);
    return Math.max(1, Math.min(1.4, 1080 / span, 540 / tall)) * (v === 'oblique' ? .94 : 1); }
  /* ---------- drawing ---------- */
  const DPR = () => Math.min(2, devicePixelRatio || 1);
  function sizeFor(el, cap) { const r = el.getBoundingClientRect(), d = DPR(); let w = Math.round(r.width * d), h = Math.round(r.height * d); const k = Math.sqrt(Math.min(1, cap / (w * h))); return [Math.max(2, Math.round(w * k)), Math.max(2, Math.round(h * k)), d * k]; }
  let F = null;
  function draw() {
    if (!REND) return; F = frameNow(st.phase); const [w, h, d] = sizeFor(cv, 3.4e6);
    REND.draw(F, PALS[st.pal], { w, h, dpr: d }); if (ov.width !== w || ov.height !== h) { ov.width = w; ov.height = h; }
    GUIDE.draw(ov, F, { alpha: st.guide ? 1 : 0, light: !!PALS[st.pal].lightbox });
  }
  function side() {
    if (!F) return; const m = $('map'), [mw, mh, md] = sizeFor(m, 2.2e6); if (m.width !== mw || m.height !== mh) { m.width = mw; m.height = mh; } MAP.draw(m, F, md);
    if (st.mode === 'logo') { const k = F.lock || {}, L0 = LOCK.byId(st.lk);
      const vals = [(st.lt * L0.dur).toFixed(1) + ' s', (k.turn || 0).toFixed(2), Math.round(F.cam.az) + '°', Math.round(F.cam.el) + '°', Math.round((k.wordmark || 0) * 100) + '%', Math.round((k.ribbon === undefined ? 1 : k.ribbon) * 100) + '%', k.reveal ? (k.reveal.length > 14 ? k.reveal.split(' ').slice(-2).join(' ') : k.reveal) : '—'];
      vEls.forEach((el, i) => el.textContent = vals[i]); $('scrub').value = Math.round(st.lt * 1000); $('time').textContent = (st.lt * L0.dur).toFixed(1) + ' / ' + L0.dur.toFixed(1) + ' s'; return; }
    const g = F.guide, L = HANDS.layout(HANDS.byId(st.to)), gb = HANDS.helix(HANDS.byId(st.to));
    const turns = (gb.psi[gb.psi.length - 1] - gb.psi[0]) / (Math.PI * 2), pitch = L.X.length > 1 ? (L.X[L.X.length - 1] - L.X[0]) / (L.X.length - 1) / L.nib : .44;
    const vals = [g.xh.toFixed(2), g.ascN.toFixed(2), g.descN.toFixed(2), Math.round(g.nib * 57.2958) + '°', Math.round(g.slant * 57.2958) + '°', (st.m >= 1 ? pitch : NaN).toFixed(2), (st.m >= 1 ? turns : NaN).toFixed(2)];
    vEls.forEach((el, i) => el.textContent = vals[i] === 'NaN' ? '…' : vals[i]);
    $('scrub').value = Math.round(st.phase * 1000); $('time').textContent = 'turn ' + st.phase.toFixed(2);
  }
  function card(h) { const L = HANDS.layout(h);
    const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
    $('handCard').innerHTML = `<span class="mono">${h.measured || h.id === 'st22' ? 'Measured' : 'Cited'} · ${h.note}</span><h3>${h.name}</h3>
      <div class="nums"><div><span class="mono">X-height</span><b>${h.xh.toFixed(2)}</b></div><div><span class="mono">Asc</span><b>${h.asc.toFixed(2)}</b></div><div><span class="mono">Desc</span><b>${h.desc.toFixed(2)}</b></div>
      <div><span class="mono">Nib</span><b>${h.nib}°</b></div><div><span class="mono">Slant</span><b>${h.slant}°</b></div><div><span class="mono">Contrast</span><b style="font-size:17px">${h.contrast}</b></div></div>
      <p>${cap(h.src)}.</p><p class="mono" style="font-size:10.5px">nib width on stage ${L.nib.toFixed(1)} px · ${L.X.length || 0} stroke slots</p>`; }
  function lockCard(L0) { const rows = L0.keys.map(k => { const f = L0.f(k); return `<div><span class="mono">t ${k.toFixed(2)}</span><b style="font-size:17px">${Math.round((f.lock.wordmark || 0) * 100)}% · ${Math.round((f.lock.ribbon === undefined ? 1 : f.lock.ribbon) * 100)}%</b></div>`; }).join('');
    $('handCard').innerHTML = `<span class="mono">Lockup ${L0.no} · ${L0.dur} s · Mindgut hand</span><h3>${L0.name}</h3><div class="nums">${rows}</div><p>${L0.line}</p><p class="mono" style="font-size:10.5px">Keyframes: wordmark · ribbon. The wordmark is the Mir library trace, set flat at z = 0 inside the coil.</p>`; }
  let lastSide = 0;
  function tick(now) {
    let moving = false;
    if (st.m < 1) { st.m = Math.min(1, (now - st.mT) / 1600); moving = true; if (st.m >= 1) st.from = st.to; }
    if (st.vm < 1) { st.vm = Math.min(1, (now - st.vT) / 1400); moving = true; if (st.vm >= 1) st.vFrom = st.view; }
    if (st.play) { const dt = st.last ? (now - st.last) / 1000 : 0; st.last = now; moving = true;
      if (st.mode === 'logo') { const L0 = LOCK.byId(st.lk); if (st.lt < 1) st.lt = Math.min(1, st.lt + dt / L0.dur); else { st.hold += dt; if (st.hold > 1.6) { st.hold = 0; st.lt = 0; } } }
      else st.phase = (st.phase + dt / 7) % 1; }
    else st.last = 0;
    if (moving) { draw(); if (now - lastSide > 90) { side(); lastSide = now; } }
    requestAnimationFrame(tick);
  }
  let once = 0; function animateOnce() { cancelAnimationFrame(once); }

  /* ---------- plates: each hand, three views ---------- */
  const pcv = document.createElement('canvas'), PREND = GL.make(pcv), pov = document.createElement('canvas'), plateEls = [];
  pov.width = 640; pov.height = 360;
  const lockRows = document.createElement('div'); lockRows.className = 'plates'; $('lockPlates').appendChild(lockRows);
  LOCK.LOCKUPS.forEach(l => { const row = document.createElement('div'); row.className = 'prow lrow'; row.innerHTML = `<div class="lab"><span class="mono">Lockup ${l.no}</span><b>${l.name}</b></div>`;
    l.keys.forEach((k, j) => { const b = document.createElement('button'); b.className = 'plate'; b.setAttribute('aria-label', `${l.name}, t ${k.toFixed(2)}`);
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; b.appendChild(c); const cap = document.createElement('span'); cap.className = 'mono'; cap.textContent = `${l.no}${'abcdef'[j]} · t ${k.toFixed(2)}`; b.appendChild(cap);
      b.onclick = () => { st.play = false; st.mode = 'logo'; st.lk = l.id; st.lt = k; sync(); draw(); side(); document.querySelector('.stage').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); };
      row.appendChild(b); plateEls.push({ c, lk: l.id, t: k }); });
    lockRows.appendChild(row); });
  H.forEach(h => { const row = document.createElement('div'); row.className = 'prow'; row.innerHTML = `<div class="lab"><span class="mono">${h.note}</span><b>${h.name}</b></div>`;
    ['front', 'oblique', 'axis'].forEach(v => { const b = document.createElement('button'); b.className = 'plate'; b.setAttribute('aria-label', `${h.name}, ${v} view`);
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; b.appendChild(c); const cap = document.createElement('span'); cap.className = 'mono'; cap.textContent = `${h.name} · ${v}`; b.appendChild(cap);
      b.onclick = () => { st.play = false; st.phase = 0; setHand(h.id); setView(v); st.m = 1; st.from = h.id; st.vm = 1; st.vFrom = v; sync(); draw(); side(); document.querySelector('.stage').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); };
      row.appendChild(b); plateEls.push({ c, h: h.id, v }); });
    $('plates').appendChild(row); });
  let job = 0;
  function renderPlates() { if (!PREND) return; const my = ++job; let i = 0;
    const step = () => { if (my !== job || i >= plateEls.length) return; const p = plateEls[i++];
      if (p.lk) { const Fl = frameNow(0, { mode: 'logo', lk: p.lk, lt: p.t }); PREND.draw(Fl, PALS[st.pal], { w: 640, h: 360, dpr: 1 }); const x = p.c.getContext('2d'); x.drawImage(pcv, 0, 0); setTimeout(step, 0); return; }
      const Fp = frameNow(0, { mode: 'hands', from: p.h, to: p.h, m: 1, cam: Object.assign({}, VIEWS[p.v]), under: false, view: p.v }); if (p.h === 'st22') Fp.cam.persp = Math.max(Fp.cam.persp, .4);
      PREND.draw(Fp, PALS[st.pal], { w: 640, h: 360, dpr: 1 }); GUIDE.draw(pov, Fp, { alpha: p.v === 'oblique' ? 0 : 1, light: !!PALS[st.pal].lightbox });
      const x = p.c.getContext('2d'); x.drawImage(pcv, 0, 0); x.drawImage(pov, 0, 0); setTimeout(step, 0); };
    step(); }

  /* ---------- export: a frame, and one full turn as a seamless GIF ---------- */
  /* saves go through the page's downloads capability when it runs as an artifact; a local copy of the file uses a plain download */
  let DLS = null; const inFrame = !!(window.claude && window.claude.use);
  if (inFrame) { $('bPng').hidden = $('bGif').hidden = true; window.claude.use('downloads').then(d => { DLS = d; if (d) $('bPng').hidden = $('bGif').hidden = false; }, () => {}); }
  const dl = async (blob, name) => {
    if (DLS) { try { await DLS.save({ filename: name, data: blob }); return 'saved'; } catch (e) { return (e && e.code) || 'unavailable'; } }
    if (inFrame) return 'unavailable';
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); return 'saved'; };
  const composite = (c, o, w, h) => { const k = document.createElement('canvas'); k.width = w; k.height = h; const x = k.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0); x.drawImage(o, 0, 0); return k; };
  $('bPng').onclick = () => { const c = document.createElement('canvas'), r2 = GL.make(c), o = document.createElement('canvas'); o.width = 2400; o.height = 1350; const Fx = frameNow(st.phase);
    r2.draw(Fx, PALS[st.pal], { w: 2400, h: 1350, dpr: 2 }); GUIDE.draw(o, Fx, { alpha: st.guide ? 1 : 0, light: !!PALS[st.pal].lightbox });
    composite(c, o, 2400, 1350).toBlob(b => { dl(b, st.mode === 'logo' ? `mindgut-lockup-${st.lk}-${PALS[st.pal].id}-t${st.lt.toFixed(2)}.png` : `ribbon-${st.to}-${st.view}-${PALS[st.pal].id}.png`); }, 'image/png'); };
  $('bGif').onclick = async () => {
    const btn = $('bGif'); btn.disabled = true; const fps = 12, secs = 7, n = fps * secs, W = 640, Hh = 360, pal = PALS[st.pal];
    const c = document.createElement('canvas'), r2 = GL.make(c), o = document.createElement('canvas'); o.width = W; o.height = Hh; const k2 = document.createElement('canvas'); k2.width = W; k2.height = Hh; const x2 = k2.getContext('2d', { willReadFrequently: true });
    const cam = camAt(), frames = [], logo = st.mode === 'logo', L0 = LOCK.byId(st.lk), N2 = logo ? Math.round(L0.dur * fps) + fps : n;
    for (let i = 0; i < N2; i++) { const Fx = logo ? frameNow(0, { mode: 'logo', lk: st.lk, lt: Math.min(1, i / (L0.dur * fps)) }) : frameNow(i / n, { mode: 'hands', from: st.to, to: st.to, m: 1, cam: Object.assign({}, cam), view: st.view });
      if (!logo) Fx.cam.zoom = cam.zoom * fitZoom(st.to, st.view) / (VIEWS[st.view].zoom || 1); r2.draw(Fx, pal, { w: W, h: Hh, dpr: 1 }); GUIDE.draw(o, Fx, { alpha: st.guide ? 1 : 0, light: !!pal.lightbox });
      x2.clearRect(0, 0, W, Hh); x2.drawImage(c, 0, 0); x2.drawImage(o, 0, 0); frames.push(x2.getImageData(0, 0, W, Hh).data);
      if (i % 6 === 0) { btn.textContent = `Rendering ${Math.round(i / N2 * 100)}%`; await new Promise(r => setTimeout(r, 0)); } }
    btn.textContent = 'Encoding'; await new Promise(r => setTimeout(r, 0));
    const { GIFEncoder, quantize, applyPalette } = window.GIFENC, step = Math.max(1, Math.floor(frames.length / 12)), parts = [];
    for (let i = 0; i < frames.length; i += step) parts.push(frames[i]); const smp = new Uint8Array(parts.length * parts[0].length); parts.forEach((p, i) => smp.set(p, i * p.length));
    const palette = quantize(smp, 255); palette.push([0, 0, 0]); const T = palette.length - 1, base = palette.slice(0, T), g = GIFEncoder(); let prev = null;
    frames.forEach(f => { const idx = applyPalette(f, base), delay = Math.round(1000 / fps);
      if (!prev) { g.writeFrame(idx, W, Hh, { palette, delay, repeat: 0, dispose: 1 }); prev = idx.slice(); return; }
      const d = new Uint8Array(idx.length); for (let k = 0; k < idx.length; k++) { if (idx[k] === prev[k]) d[k] = T; else { d[k] = idx[k]; prev[k] = idx[k]; } }
      g.writeFrame(d, W, Hh, { delay, transparent: true, transparentIndex: T, dispose: 1 }); });
    g.finish(); const bytes = g.bytes(); const r = await dl(new Blob([bytes], { type: 'image/gif' }), (logo ? `mindgut-lockup-${st.lk}-${pal.id}.gif` : `ribbon-${st.to}-${st.view}-${pal.id}-one-turn.gif`));
    btn.textContent = r === 'saved' ? `GIF · ${(bytes.length / 1048576).toFixed(1)} MB` : r === 'declined' ? 'Not saved' : 'Saving is off here'; setTimeout(() => { btn.textContent = 'Export GIF'; btn.disabled = false; }, 2600);
  };

  /* ---------- table and spec ---------- */
  $('handsTable').querySelector('tbody').innerHTML = H.map(h => `<tr><td class="tag">${h.name}</td><td class="rng">${h.xh.toFixed(2)} · ${h.asc.toFixed(2)} · ${h.desc.toFixed(2)}</td><td class="rng">${h.nib}° · ${h.slant}°</td><td>${h.src.charAt(0).toUpperCase() + h.src.slice(1)}</td></tr>`).join('');
  const SPEC = {
    id: 'ribbon-slant-grid', version: 'v05', date: '2026-11-26', supersedes: 'v04',
    concept: 'The ribbon stays ST-22’s band on a helix. A hand is a set of exact constraints in nib widths; the band’s width is the nib. Seen from the front the helix is a sine wave: crest = x-height, trough = baseline; ascenders and descenders come from the wordmark’s front view.',
    construction: {
      unit: 'nib width n = band width',
      stroke_slots: 'downstroke k at ψ = π/2 + 2πk, x = X_k; x(ψ) linear between slots; a lead-in of 1.25 π from the back; after the last slot 0.85 turn opening as u + 0.6u³ (ST-22’s sweep)',
      front_view: 'y = mid − A(x)·cos(ψ + turn); A = x-height/2 + ascender·sky_up(x) above the axis, x-height/2 + descender·sky_down(x) below',
      depth: 'z = (x-height/2)·sin(ψ + turn); the side view is a ring per turn',
      lead_correction: 'x′ = x + (mid − y)·(tan σ + (dx/dψ)/A), per sample: an oblique cylinder; near strokes stand on the slant lines, far strokes become the hairline diagonals',
      nib: 'band direction b = (cos θ, −sin θ, 0), fixed (translation); copperplate: width = n·(0.07 + 0.93·max(0, sin(ψ + turn))^1.4) (expansion)',
      spheres: '12 spheres in the 12 counters between 13 downstrokes, r = 0.36 n',
      turn: 'the coil turns about its axis; stroke slots and the skyline are fixed in space, so every whole turn registers again; one turn loops exactly'
    },
    wordmark_front_view: { units: '998 × 217', stem: STEMS().stem, strokes: HANDS.MG, skyline: HANDS.SKY },
    hands: H.map(h => ({ id: h.id, name: h.name, note: h.note, x_height_nw: +h.xh.toFixed(3), ascender_nw: +h.asc.toFixed(3), descender_nw: +h.desc.toFixed(3), nib_deg: h.nib, slant_deg: h.slant, counter_nw: h.counter, letter_space_nw: h.between, contrast: h.contrast, source: h.src })),
    lockups: LOCK.LOCKUPS.map(l => ({ id: l.id, no: l.no, name: l.name, seconds: l.dur, line: l.line, keyframes: l.keys.map(k => { const f = l.f(k); return { t: k, turn: +(f.lock.turn || 0).toFixed(3), camera: { az: +f.cam.az.toFixed(1), el: +f.cam.el.toFixed(1) }, wordmark: +(f.lock.wordmark || 0).toFixed(2), ribbon: +((f.lock.ribbon === undefined ? 1 : f.lock.ribbon)).toFixed(2), reveal: f.lock.reveal }; }) })),
    lockup_rules: { wordmark: 'the Mir library trace, one flat color, set as a plane at z = 0 inside the coil and depth-ordered with the ribbon (far half behind, near half in front); no grain on it', ribbon: 'the Mindgut hand, unbent; whole turns land its front faces on the stems', strike: 'reveal x < head (wordmark units), head 0 → 998', settle: 'reveal |x − stem| < r, r 0 → 22.5 (the stem) → 142 (whole letters)' },
    views: VIEWS,
    render: { engine: 'GPU rebuild after ST-22 p10: measured normal ramp, gel stacking (per-channel filter by dual-source blending), light helices, lit spheres, floor grid, 4 % bloom, static scan grain', guide_sheet: 'ascender, x-height, baseline, descender, slant line per stroke slot, nib ladder; seen down the axis, a square cell with diagonals and centerlines (the rice-character grid, 米字格)' },
    export: { png: '2400 × 1350 with the guide', gif: 'one full turn, 7 s at 12 fps, 640 × 360, one global palette from 12 frames, unchanged pixels sent as transparent (doc 55)' },
    records: [
      { what: 'Textura Quadrata: x-height 5, asc 2, desc 2 nib widths; pen 35–45°; counters and letter spaces about 1 nib width', where: 'lettering-daily.com/blackletter-calligraphy' },
      { what: 'Italic: x-height 5 nib widths, pen 45°, slant 5–7°', where: 'lettering-daily.com/italic-calligraphy; artincontext.org guide sheet presets (7°, asc/desc 4)', diverges: 'Faber-Castell: pen 35°, asc 2, desc 3' },
      { what: 'Foundational: pen about 30°, minim height 4–5, asc/desc 3 nib widths, upright', where: 'Foundational hand (Johnston), via course and manual excerpts' },
      { what: 'Spencerian 52°, Copperplate 55° slant lines; Spencerian connective slant 30°', where: 'John Neal guide sheets; loveleighloops.com' },
      { what: 'Penmanship chart with unit parallelograms at about 50°, connectives at about 25°', where: 'US patent 723,338 (1903)' },
      { what: 'Blackletter minims with picket-fence regularity; four families', where: 'Britannica; lettering-daily.com' },
      { what: 'Standardized unit widths in early textura and roman type', where: 'Blokland, Leiden University, 2016' },
      { what: 'Nine palaces (九宮格), field (田字格) and rice (米字格) grids', where: 'Leiden 2020 thesis ch. 4; meer.com; Language Log' },
      { what: 'Proportioned scripts measured in rhombic dots of the pen’s width', where: 'The Met, Art of the Islamic World' },
      { what: 'Translation, rotation, expansion', where: 'Noordzij, The shape of the stroke, RIDT 1991' }
    ],
    open: ['lockup: ribbon alone, or with the wordmark under it', 'Mindgut 2.2 mark not used', 'not checked: real GPU, Safari, phone, 1:1 against p10']
  };
  function STEMS() { return { stem: 45, x_height: 128, ascender: 45, descender: 34, pitch_in_letter: [81.5, 82.5] }; }
  $('spec').textContent = JSON.stringify(SPEC, null, 2);
  $('copySpec').onclick = () => { navigator.clipboard && navigator.clipboard.writeText($('spec').textContent).then(() => { $('copySpec').textContent = 'Copied'; setTimeout(() => $('copySpec').textContent = 'Copy JSON', 1600); }, () => {}); };

  if (!REND) document.querySelector('.screen').insertAdjacentHTML('beforeend', '<p class="line" style="position:absolute;inset:auto 20px 20px">WebGL 2 is off in this browser, so the study cannot draw.</p>');
  sync(); document.fonts.ready.then(() => { draw(); side(); renderPlates(); });
  let rz = 0; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { draw(); side(); }, 120); });
  requestAnimationFrame(tick);
  window.__study = { st, draw, side, setHand, setView, sync };
})();
