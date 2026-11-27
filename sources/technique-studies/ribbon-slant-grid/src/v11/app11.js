/* app9.js · ST-22's ribbon resolving into the mindgut wordmark (two trajectories, a designspace), and the hands study: stage, elevations, plates, export */
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
  const st = { mode: 'logo', lk: 'ductus', lt: reduce ? 1 : 0, hold: 0, from: 'mindgut', to: 'mindgut', m: 1, mT: 0, phase: 0, play: !reduce, view: 'front', vFrom: 'front', vm: 1, guide: false, under: false, pal: 0, last: 0, intro: false };
  const lerp = (a, b, t) => a + (b - a) * t, ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /* ---------- controls ---------- */
  const chip = (html, fn, radio) => { const b = document.createElement('button'); b.className = 'chip'; b.innerHTML = html; b.onclick = fn; if (radio) b.setAttribute('role', 'radio'); return b; };
  const on = (b, v) => b.setAttribute(b.getAttribute('role') === 'radio' ? 'aria-checked' : 'aria-pressed', String(v));
  [['logo', 'Trajectories'], ['hands', 'Hands']].forEach(([k, l]) => $('modes').appendChild(chip(l, () => { st.mode = k; if (k === 'hands') { st.guide = true; } else { st.guide = false; st.lt = 0; } st.last = 0; sync(); draw(); side(); }, true)));
  RES.TRAJ.forEach(l => { const b = chip(`<span class="n">${l.no}</span>${l.name}`, () => { st.mode = 'logo'; st.lk = l.id; st.lt = 0; st.hold = 0; st.last = 0; sync(); draw(); side(); }, true); b.dataset.lk = l.id; $('hands').appendChild(b); });
  H.forEach(h => { const b = chip(`${h.name}`, () => { st.mode = 'hands'; setHand(h.id); }, true); b.dataset.hand = h.id; $('hands').appendChild(b); });
  Object.keys(VIEWS).forEach(v => $('views').appendChild(chip(v[0].toUpperCase() + v.slice(1), () => setView(v), true)));
  const tg = [['guide', 'Guide sheet'], ['under', 'Wordmark under']];
  tg.forEach(([k, l]) => $('toggles').appendChild(chip(l, () => { st[k] = !st[k]; sync(); draw(); })));
  PALS.forEach((p, i) => $('pals').appendChild(chip(`<span class="sw" style="background:${p.sw}"></span>${p.name}`, () => { st.pal = i; sync(); draw(); renderPlates(); }, true)));
  const RO = ['X-HEIGHT', 'ASC', 'DESC', 'NIB', 'SLANT', 'STROKE PITCH', 'TURNS', 'CONTRAST'], ROL = ['TIME', 'STATE', 'REG', 'FORM', 'TURNS', 'AZIMUTH', 'ELEVATION', 'ZOOM'], ROLH = ['TIME', 'STATE', 'THREAD', 'FLOOD', 'TURNS', 'AZIMUTH', 'ELEVATION', 'ZOOM'];
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
    [...$('readout').querySelectorAll('.k')].forEach((k, i) => k.textContent = (logo ? (st.lk === 'head' ? ROLH : ROL) : RO)[i]);
    [...$('views').children].forEach((b, i) => on(b, Object.keys(VIEWS)[i] === st.view));
    [...$('toggles').children].forEach((b, i) => { b.setAttribute('aria-pressed', String(!!st[tg[i][0]])); b.hidden = logo; });
    [...$('pals').children].forEach((b, i) => on(b, i === st.pal));
    const h = HANDS.byId(st.to), cap = t => t.charAt(0).toUpperCase() + t.slice(1), L0 = RES.byId(st.lk);
    $('handLine').textContent = logo ? `${L0.no} ${L0.name}. ${L0.line}` : `${h.name}, ${h.note}. ${cap(h.src)}.`;
    $('play').setAttribute('aria-label', st.play ? 'Pause' : 'Play'); $('playIcon').innerHTML = st.play ? '<path d="M4 3h2.8v10H4zM9.2 3H12v10H9.2z"/>' : '<path d="M4.5 2.8v10.4L13 8z"/>';
    if (logo) lockCard(L0); else card(h);
    $('ticks').innerHTML = logo ? L0.keys.map(k => `<i style="left:${(k * 100).toFixed(3)}%"></i>`).join('') : '';
  }
  $('bReset').onclick = () => { Object.assign(st, { mode: 'logo', lk: 'ductus', lt: 0, hold: 0, from: 'mindgut', to: 'mindgut', m: 1, phase: 0, play: !reduce, view: 'front', vFrom: 'front', vm: 1, guide: false, under: false, last: 0 });
    const repaint = st.pal !== 0; st.pal = 0; sync(); draw(); side(); if (repaint) renderPlates(); };
  $('play').onclick = () => { st.play = !st.play; st.last = 0; sync(); };
  $('scrub').oninput = e => { if (st.mode === 'logo') st.lt = e.target.value / 1000; else st.phase = e.target.value / 1000; st.play = false; sync(); draw(); side(); };
  addEventListener('keydown', e => { if (e.target.closest && e.target.closest('input')) return; if (e.key === ' ' && e.target === document.body) { e.preventDefault(); $('play').click(); }
    const n = +e.key; if (n >= 1 && n <= H.length) setHand(H[n - 1].id); });

  /* ---------- frame ---------- */
  const camAt = () => { const a = VIEWS[st.vFrom], b = VIEWS[st.view], t = ease(st.vm); const c = {}; for (const k in b) c[k] = lerp(a[k], b[k], t); return c; };
  function frameNow(phase, opts) {
    opts = opts || {};
    if ((opts.mode || st.mode) === 'logo') { const L0 = RES.byId(opts.lk || st.lk); return L0.f(opts.lt === undefined ? st.lt : opts.lt); } const from = opts.from || st.from, to = opts.to || st.to, m = opts.m === undefined ? st.m : opts.m;
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
    if (st.mode === 'logo') { const k = F.res || {}, L0 = RES.byId(st.lk);
      const vals = [(st.lt * L0.dur).toFixed(2) + ' s', k.stage || '—', (k.reg || 0).toFixed(2), (k.form || 0).toFixed(2), (k.turns || 0).toFixed(2), Math.round(F.cam.az) + '°', Math.round(F.cam.el) + '°', F.cam.zoom.toFixed(2)];
      vEls.forEach((el, i) => el.textContent = vals[i]); $('scrub').value = Math.round(st.lt * 1000); $('scrub').parentNode.style.setProperty('--p', (st.lt * 100).toFixed(2) + '%'); $('time').textContent = (st.lt * L0.dur).toFixed(1) + ' / ' + L0.dur.toFixed(1) + ' s'; return; }
    const g = F.guide, L = HANDS.layout(HANDS.byId(st.to)), gb = HANDS.helix(HANDS.byId(st.to));
    const turns = (gb.psi[gb.psi.length - 1] - gb.psi[0]) / (Math.PI * 2), pitch = L.X.length > 1 ? (L.X[L.X.length - 1] - L.X[0]) / (L.X.length - 1) / L.nib : .44;
    const vals = [g.xh.toFixed(2), g.ascN.toFixed(2), g.descN.toFixed(2), Math.round(g.nib * 57.2958) + '°', Math.round(g.slant * 57.2958) + '°', (st.m >= 1 ? pitch : NaN).toFixed(2), (st.m >= 1 ? turns : NaN).toFixed(2), HANDS.byId(st.to).contrast];
    vEls.forEach((el, i) => el.textContent = vals[i] === 'NaN' ? '…' : vals[i]);
    $('scrub').value = Math.round(st.phase * 1000); $('scrub').parentNode.style.setProperty('--p', (st.phase * 100).toFixed(2) + '%'); $('time').textContent = 'turn ' + st.phase.toFixed(2);
  }
  function card(h) { const L = HANDS.layout(h);
    const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
    $('handCard').innerHTML = `<span class="mono">${h.measured || h.id === 'st22' ? 'Measured' : 'Cited'} · ${h.note}</span><h3>${h.name}</h3>
      <div class="nums"><div><span class="mono">X-height</span><b>${h.xh.toFixed(2)}</b></div><div><span class="mono">Asc</span><b>${h.asc.toFixed(2)}</b></div><div><span class="mono">Desc</span><b>${h.desc.toFixed(2)}</b></div>
      <div><span class="mono">Nib</span><b>${h.nib}°</b></div><div><span class="mono">Slant</span><b>${h.slant}°</b></div><div><span class="mono">Contrast</span><b style="font-size:17px">${h.contrast}</b></div></div>
      <p>${cap(h.src)}.</p><p class="mono" style="font-size:10.5px">nib width on stage ${L.nib.toFixed(1)} px · ${L.X.length || 0} stroke slots</p>`; }
  function lockCard(L0) { const rows = L0.keys.map((k, j) => `<li><span class="mono">${(k * L0.dur).toFixed(2)} s</span><span>${RES.KEYS[L0.id][j]}</span></li>`).join('');
    $('handCard').innerHTML = `<span class="mono">Trajectory ${L0.no} · ${L0.dur} s · 12 fps loop</span><h3>${L0.name}</h3><p>${L0.line}</p><ol class="keys">${rows}</ol>`; }
  let lastSide = 0;
  function tick(now) {
    let moving = false;
    if (st.m < 1) { st.m = Math.min(1, (now - st.mT) / 1600); moving = true; if (st.m >= 1) st.from = st.to; }
    if (st.vm < 1) { st.vm = Math.min(1, (now - st.vT) / 1400); moving = true; if (st.vm >= 1) st.vFrom = st.view; }
    if (st.play) { const dt = st.last ? (now - st.last) / 1000 : 0; st.last = now; moving = true;
      if (st.mode === 'logo') { const L0 = RES.byId(st.lk); if (st.lt < 1) st.lt = Math.min(1, st.lt + dt / L0.dur); else { st.hold += dt; if (st.hold > 1.6) { st.hold = 0; st.lt = 0; } } }
      else st.phase = (st.phase + dt / 7) % 1; }
    else st.last = 0;
    if (moving) { draw(); if (now - lastSide > 90) { side(); lastSide = now; } }
    requestAnimationFrame(tick);
  }
  let once = 0; function animateOnce() { cancelAnimationFrame(once); }

  /* ---------- plates: each hand, three views ---------- */
  const pcv = document.createElement('canvas'), PREND = GL.make(pcv), pov = document.createElement('canvas'), plateEls = [];
  pov.width = 640; pov.height = 360;
  const goTo = (id, t) => { st.play = false; st.mode = 'logo'; st.lk = id; st.lt = t; sync(); draw(); side(); document.querySelector('.stage').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); };
  const plate = (label, cap, onclick) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'plate'; b.setAttribute('aria-label', label);
    const c = document.createElement('canvas'); c.width = 640; c.height = 360; b.appendChild(c); const sp = document.createElement('span'); sp.className = 'cap'; sp.innerHTML = cap; b.appendChild(sp); b.onclick = onclick; return [b, c]; };
  // key frames, per trajectory: a contact sheet, each frame an anchor the references link to
  const code = (l, j) => `${l.no}${'ABCDEFGH'[j]}`;
  RES.TRAJ.forEach(l => { const row = document.createElement('div'); row.className = 'strip';
    row.innerHTML = `<div class="strip-head"><h3 class="strip-name"><span class="n">${l.no}</span>${l.name}</h3><p class="strip-note">${l.line}</p><span class="strip-meta mono lit">${l.dur.toFixed(1)} s · ${l.keys.length} frames</span></div>`;
    const ol = document.createElement('ol'); ol.className = 'strip-frames'; ol.style.setProperty('--n', l.keys.length); row.appendChild(ol);
    l.keys.forEach((k, j) => { const li = document.createElement('li'); li.id = 'f-' + code(l, j).toLowerCase();
      const [b, c] = plate(`${l.name}, ${(k * l.dur).toFixed(2)} seconds`, `<span class="cap-t"><b>${code(l, j)}</b>${(k * l.dur).toFixed(2)} s</span><span class="cap-d">${RES.KEYS[l.id][j]}</span>`, () => goTo(l.id, k));
      li.appendChild(b); ol.appendChild(li); plateEls.push({ c, lk: l.id, t: k }); });
    $(l.mark === 'robot' ? 'robotPlates' : 'keyPlates').appendChild(row); });
  { const ks = RES.TRAJ.filter(l => l.mark !== 'robot'), rs = RES.TRAJ.filter(l => l.mark === 'robot'), f = a => a.reduce((n, l) => n + l.keys.length, 0);
    $('keyMeta').textContent = `${ks.length} trajectories · ${f(ks)} frames`; $('robotMeta').textContent = `${rs.length} ${rs.length === 1 ? 'trajectory' : 'trajectories'} · ${f(rs)} frames`; }
  // the designspace: REG across, PHASE down
  const REGS = [0, .25, .5, .75, 1], PHS = [0, .25, .5, .75, 1];
  PHS.forEach(ph => REGS.forEach(r => { const [b, c] = plate(`Designspace: REG ${r.toFixed(2)}, phase ${ph.toFixed(2)}`, '', () => { st.play = false; st.mode = 'logo'; st.lk = 'cut'; st.lt = r < 1 ? 1.3 / 8 + r * 3 / 8 : 4.25 / 8; sync(); draw(); side(); });
    b.classList.add('ds-cell'); b.querySelector('.cap').remove(); if (ph === 0 && (r === 0 || r === 1)) b.dataset.master = r === 0 ? 'ST-22 · origin' : 'm master'; $('dsPlates').appendChild(b); plateEls.push({ c, ds: [r, ph] }); }));
  // the FORM axis: the ribbon's m (0) to the letter's m (1), as Ductus travels it
  [0, .25, .5, .75, 1].forEach(v => { const [b, c] = plate(`FORM ${v.toFixed(2)}`, '', () => { st.play = false; st.mode = 'logo'; st.lk = 'ductus'; st.lt = (52 + 12 * v) / 96; sync(); draw(); side(); });
    b.classList.add('ds-cell'); b.querySelector('.cap').remove(); if (v === 0 || v === 1) b.dataset.master = v === 0 ? 'ribbon m' : 'letter m'; $('formPlates').appendChild(b); plateEls.push({ c, form: v }); });
  // references → frames
  RES.REFS.forEach((r, n) => { const L = RES.byId(r.traj), j = L.keys.findIndex(k => Math.abs(k - r.t) < .002), cd = code(L, j);
    const li = document.createElement('li'); li.className = 'ref';
    li.innerHTML = `<div class="ref-id"><span class="ref-n mono">R${n + 1}</span><h3>${r.ref}</h3><span class="ref-by mono">Your reference</span></div>
      <div class="ref-body"><p class="ref-device">${r.device.charAt(0).toUpperCase() + r.device.slice(1)}.${r.note ? ' ' + r.note.charAt(0).toUpperCase() + r.note.slice(1) + '.' : ''}</p><a class="ref-link" href="#f-${cd.toLowerCase()}"><span class="mono">Operates at</span><span class="to">${L.name} · ${cd} · ${(r.t * L.dur).toFixed(2)} s</span></a></div>`;
    const pd = document.createElement('div'); pd.className = 'ref-plate';
    const [b, c] = plate(`${L.name} frame ${cd}, ${(r.t * L.dur).toFixed(2)} seconds`, `<span class="cap-t"><b>${cd}</b>${(r.t * L.dur).toFixed(2)} s</span><span class="cap-d">${RES.KEYS[L.id][j]}</span>`, () => goTo(r.traj, r.t));
    pd.appendChild(b); li.appendChild(pd); $('refPlates').appendChild(li); plateEls.push({ c, lk: r.traj, t: r.t }); });
  H.forEach(h => {
    ['front', 'oblique', 'axis'].forEach(v => { const [b, c] = plate(`${h.name}, ${v} view`, `<span class="cap-name">${h.name} · ${v}</span><span class="cap-t">${h.xh.toFixed(2)} · ${h.asc.toFixed(2)} · ${h.desc.toFixed(2)}</span>`, null);
      b.onclick = () => { st.play = false; st.phase = 0; setHand(h.id); setView(v); st.m = 1; st.from = h.id; st.vm = 1; st.vFrom = v; sync(); draw(); side(); document.querySelector('.stage').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); };
      $('plates').appendChild(b); plateEls.push({ c, h: h.id, v }); }); });
  let job = 0;
  function renderPlates() { if (!PREND) return; const my = ++job; let i = 0;
    const step = () => { if (my !== job || i >= plateEls.length) return; const p = plateEls[i++];
      if (p.lk || p.ds || p.form !== undefined) { const Fl = p.form !== undefined ? RES.form(p.form) : p.ds ? RES.at(p.ds[0], p.ds[1]) : frameNow(0, { mode: 'logo', lk: p.lk, lt: p.t }); PREND.draw(Fl, PALS[st.pal], { w: 640, h: 360, dpr: .5333 }); const x = p.c.getContext('2d'); x.drawImage(pcv, 0, 0); setTimeout(step, 0); return; }
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
    composite(c, o, 2400, 1350).toBlob(b => { dl(b, st.mode === 'logo' ? `mindgut-resolve-${st.lk}-${PALS[st.pal].id}-t${(st.lt * RES.byId(st.lk).dur).toFixed(2)}s.png` : `ribbon-${st.to}-${st.view}-${PALS[st.pal].id}.png`); }, 'image/png'); };
  $('bGif').onclick = async () => {
    const btn = $('bGif'); btn.disabled = true; const fps = 12, secs = 7, n = fps * secs, W = 640, Hh = 360, pal = PALS[st.pal];
    const c = document.createElement('canvas'), r2 = GL.make(c), o = document.createElement('canvas'); o.width = W; o.height = Hh; const k2 = document.createElement('canvas'); k2.width = W; k2.height = Hh; const x2 = k2.getContext('2d', { willReadFrequently: true });
    const cam = camAt(), frames = [], logo = st.mode === 'logo', L0 = RES.byId(st.lk), N2 = logo ? Math.round(L0.dur * fps) : n;
    for (let i = 0; i < N2; i++) { const Fx = logo ? frameNow(0, { mode: 'logo', lk: st.lk, lt: i / (L0.dur * fps) }) : frameNow(i / n, { mode: 'hands', from: st.to, to: st.to, m: 1, cam: Object.assign({}, cam), view: st.view });
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
    g.finish(); const bytes = g.bytes(); const r = await dl(new Blob([bytes], { type: 'image/gif' }), (logo ? `mindgut-resolve-${st.lk}-${pal.id}.gif` : `ribbon-${st.to}-${st.view}-${pal.id}-one-turn.gif`));
    btn.textContent = r === 'saved' ? `GIF · ${(bytes.length / 1048576).toFixed(1)} MB` : r === 'declined' ? 'Not saved' : 'Saving is off here'; setTimeout(() => { btn.textContent = 'Export GIF'; btn.disabled = false; }, 2600);
  };

  /* ---------- table and spec ---------- */
  $('handsTable').querySelector('tbody').innerHTML = H.map(h => `<tr><th scope="row" class="tag">${h.name}</th><td class="num">${h.xh.toFixed(2)}</td><td class="num">${h.asc.toFixed(2)}</td><td class="num">${h.desc.toFixed(2)}</td><td class="num">${h.nib}°</td><td class="num">${h.slant}°</td><td class="src">${h.src.charAt(0).toUpperCase() + h.src.slice(1)}</td></tr>`).join('');
  const SRC = [
    ['Gerrit Noordzij', 'The shape of the stroke', 'RIDT, 1991', 'https://typemedia.org/assets/download/The%20Shape%20of%20the%20Stroke,%20RIDT%201991,%20pp%2034-42_low.pdf', 'translation, rotation, expansion; the broad pen’s counterpoint is constant in length and direction'],
    ['David Berlow', 'Decovar', 'Font Bureau / Google Fonts, 2017', 'https://www.github.com/googlefonts/decovar', 'skeleton axes under embellishment axes: here the centerline is the skeleton'],
    ['Erik van Blokland', 'Superpolator: the designspace', 'LettError', 'https://superpolator.com/designspace.html', 'masters, axes and instances; a keyframe is an instance'],
    ['RoboFont', 'Creating glyph substitution rules', 'documentation', 'https://www.robofont.com/documentation/how-tos/creating-glyph-substitution-rules/', 'a designspace area where one glyph is replaced by another: the bridge when the mark may not morph'],
    ['Pané-Farré and Thiefes', 'Virtual Noordzij Cube: behind the cube', 'HAW Hamburg', 'https://haw-type-design.github.io/noordzij-cube/behind-the-cube', 'helper axes that steer how a stroke swings between masters'],
    ['Channel 4 / MPC', 'Channel 4 idents', '2004 (read in Brownie, University of Hertfordshire)', 'https://uhra.herts.ac.uk/id/eprint/3901/1/904962.pdf', 'the hit point: pieces in depth align from one tracked viewpoint'],
    ['Markus Raetz', 'OUI–NON', 'Geneva', 'https://www.kunstbulletin.ch/en/node/170606', 'one word appears as the other disappears, by viewpoint alone'],
    ['Douglas Hofstadter', 'Gödel, Escher, Bach (cover trip-let)', '1979', 'https://mathworld.wolfram.com/Trip-Let.html', 'one solid, three letters, three viewpoints'],
    ['Saul Bass', 'North by Northwest, title sequence', '1959', 'https://artofthetitle.com/title/north-by-northwest', 'a ruled grid that becomes a façade: guide lines turning into the object'],
    ['Lippincott & Margulies', 'Coca-Cola Dynamic Ribbon', '1969', 'https://www.logohistories.com/p/coca-cola-logo-history-1969', 'a ribbon set beside the script as a companion device, not inside it'],
    ['Wikipedia', 'Match cut', '', 'https://en.wikipedia.org/wiki/Match_cut', 'a cut on matched shape and movement'],
    ['lettering-daily.com', 'Blackletter, italic and foundational hands', '', 'https://www.lettering-daily.com/blackletter-calligraphy/', 'x-heights in nib widths, pen angles, the picket-fence rhythm'],
    ['Apple', 'Animate with springs', 'WWDC 2023', 'https://developer.apple.com/videos/play/wwdc2023/10158/', 'bounce 0 is smooth; a spring keeps its velocity when retargeted'],
    ['Google Design', 'Evolving the Google identity', '2015', 'https://design.google/library/evolving-google-identity/', 'dots, G and logotype as states of one logo on consistent paths and timing'],
    ['Smith and Martin-Portugues Santacreu', 'Match-action: the role of motion and audio in creating global change blindness in film', 'Media Psychology, 2017', 'https://eprints.bbk.ac.uk/id/eprint/14904', 'motion continuing after a cut is what hides it: both cuts sit inside one camera move'],
    ['Loveleigh Loops', 'Brush calligraphy letters', '', 'https://loveleighloops.com/blog/brush-calligraphy-letters', 'start the m with an overturn; triangular gaps between overturns'],
    ['Microsoft', 'OpenType fvar and the axis registry', '', 'https://learn.microsoft.com/en-gb/typography/opentype/spec/fvar', 'four-letter axis tags, min · default · max, hidden axes'],
    ['Wikipedia', 'Felice Varini', '', 'https://en.wikipedia.org/wiki/Felice_Varini', 'off the vantage point the shape is fragments; the work is both'],
    ['Fast Company', 'Channel 4’s rebrand dismantles its iconic 4 logo', '2015', 'https://www.fastcompany.com/3051855/channel-4s-rebrand-dismantles-its-iconic-4-logo', 'a mark cut into its parts and set loose, as policy']
  ];
  $('sources').innerHTML = SRC.map(([who, what, when, url, why]) => `<li><span><a class="src-title" href="${url}" target="_blank" rel="noopener">${what}</a><span class="src-by">${who} · ${when || 'n.d.'}</span><span class="src-url">${why}</span></span></li>`).join('');
  const r2 = v => +v.toFixed(2);
  const SPEC = {
    id: 'ribbon-slant-grid', version: 'v11', date: '2026-11-27',
    concept: 'From ST-22’s still to the mindgut wordmark. The band interpolates to a second master, an m in three overturns, then flows onto the letter m itself along a third master, the m’s own skeleton, in one of three ways (Ductus, Write, Press), takes the mark’s ink and hands over to the real m with no visible change. Parallax keeps the ribbon unchanged and finds the word by viewpoint. The wordmark itself is never morphed or recolored.',
    start: { source: 'ST-22 p10 defaults', turns: 1.85, coil_radius: '0.44 of height', band: '0.18 of width', pitch: '0.08 of width a turn', opening: 0.9, start_angle: 2.6, perspective: 0.4, palette: 'Emerald' },
    designspace: {
      axes: { REG: '0 = ST-22, 1 = the band registered on the m', PHASE: 'turn of the coil about its axis', camera: 'az, el, perspective, zoom (Cut follows REG; Parallax moves alone)' },
      masters: {
        st22: 'helix, 1.85 turns from ψ 2.7, x(ψ) = a0 + p·(t + 0.9 t³), radius 297, band 180 along the axis',
        m: `helix, 3 turns from ψ π (baseline) to 7π (the last foot); stroke k at ψ = 5π/2 + 2πk over the m’s stems ${RES.MSTEMS.join(', ')}; radius = x-height/2 = 64; band = stem = 45; the axis yawed ${(RES.B.yaw * 57.2958).toFixed(1)}° (sin = stem spacing / 2πr), so the front view is a cycloid: cusped feet, round overturns, triangular gaps`
      },
      instances: 'any (REGS, PHAS); the turns count interpolates 1.85 → 3', tags: { REGS: 'registration, 0 · 0 · 1', PHAS: 'turn, 0 · 0 · 1, time-driven (hidden, as an fvar hidden axis)', LITE: 'follows REGS', SPHR: 'follows REGS' },
      light_helices: { skyline: 'front view: half-cosines through the wordmark’s measured extrema ' + JSON.stringify(RES.SKY), x_height: 'a helix of radius 5 along y = 47', baseline: 'a helix of radius 5 along y = 175', travel: 'each light turns into its line left to right, as if drawn' },
      spheres: 'the twelve land on positive parts only: the ten strokes outside the m (r 14, inside the 45 stem), the tittle and the ®'
    },
    trajectories: RES.TRAJ.map(l => ({ id: l.id, no: l.no, name: l.name, seconds: l.dur, fps: 12, line: l.line,
      keyframes: l.keys.map((k, j) => { const f = l.f(k); return { s: r2(k * l.dur), state: f.res.stage, what: RES.KEYS[l.id][j], reg: r2(f.res.reg), camera: { az: r2(f.cam.az), el: r2(f.cam.el), persp: r2(f.cam.persp), zoom: r2(f.cam.zoom) } }; }) })),
    form: {
      master_c: 'the m as a written stroke: stem 1 up to its flat top (47) and down, arch 1 (apex 62, 64, weight 34), stem 2 down, back up, arch 2 (apex 146, 64), stem 3 down; stems 45; same 1800 samples',
      landmarks: 'ψ π → stem 1 foot; 2π → stem 1 top; 3π → stem 1 foot; 4π → arch 1 apex; 5π → stem 2 foot; 6π → arch 2 apex; 7π → stem 3 foot; linear between',
      per_sample: 'x, y → the skeleton; z × (1 − e)²; width 45 → 45 / 34; band direction → face-up, rolling through edge-on where it must turn over; drawn as a stroke (tube offsets) as e → 1',
      window: 'frames 52 → 64 (4.33 → 5.33 s), inside the pull-back; the coil lands its whole turn on frame 64',
      ink: 'the band takes the mark’s flat color and opacity (no gel, no grain), then the real m replaces the matched white stroke on frame 66',
      variants: {
        ductus: 'all samples together, 15 % stagger along the stroke; ink frames 62 → 66',
        write: 'a front runs along the stroke in writing order over 35 % of its length; ink follows 25 % behind',
        press: 'a press line crosses x −60 → 260 (units); under it each sample snaps with a damped spring (overshoot, then rest at 1.6 units of travel); ink 70 units behind the line'
      }
    },
    head: {
      end: 'the Mindgut 2.2 mark, its own vector (landing page v13, five potrace paths, 1620 × 1571 units), drawn as its sticker: paper #ECEEEC, ink #111513; never morphed or recolored',
      canon: 'Mir is the brain folds and the light in the eyes; the head is Mindgut',
      ribbon_to_brain: { master_d: 'the brain’s white folds as one stroke: skeleton of each of the 17 folds, pruned, toured as an Euler walk (diameter last), folds visited right to left; width = 2 × distance to the fold’s edge; between folds width 0', samples: 1800, mechanism: 'the band slides along one compound path (coil · one Hermite bend · brain): sample i sits at index i + e × 2000, so every sample keeps its neighbors and nothing stretches or tears', cord: 'before and while it threads, ST-22’s band (180) rolls to a cord (10) from its cut end back: 1.15 s at the cut end, 2.25 s at the tail, 0.7 s each', bend: 'one Hermite bend from the coil’s cut end to the first fold; band direction → face-up over its first 45 %', window: '1.6 → 5.0 s, ease in-out; the coil turns 0.6 while it empties', ink: 'from 4.75 s, leading end first, 0.55 s along the band, 0.35 s each' },
      spheres_to_eyes: { map: 'spheres 1–6 → left eye light, 7–12 → right eye light (each the inscribed circle of the eye’s bite)', window: '1.25 s, 0.07 s apart, 1.5 s each', print: 'lit until the eye forms around it, then flat paper' },
      lights_to_contours: { map: ['helix 1 → the sticker’s edge', 'helix 2 → the head’s edge', 'helix 3 → the face plate'], form: 'radius 2 helix around the contour, 18 turns, 481 points; contours rounded at the ear-cup notches (gaussian, σ 13 units)', window: '1.0 s + 0.18 s per helix, 1.6 s, drawn in along the contour', out: 'each goes dark as the flood passes its own distance from the outline (0, 38, 231 units)' },
      flood: { field: 'exact Euclidean distance (Felzenszwalb and Huttenlocher 2012), quarter grid, bilinear: from the silhouette inward; inside the face plate, the plate edge’s distance (231) plus distance from the plate edge, so the plate closes along its midline', window: '5.1 → 6.1 s, ease in-out, front 10 units soft', order: 'sticker edge, head, ear cups, brain, face plate closing to a slit' },
      features: { eyes: 'not flooded: each grows out from its light, radius 45 → 250 units, 5.95 → 6.45 s', mouth: 'grows out from its centroid, 0 → 95 units, 6.15 → 6.55 s', lights: 'the spheres stay lit until the eye has formed around them, then print flat, 6.1 → 6.4 s' },
      swap: 'frame 80 (6.67 s): the inked band, the printed eye lights and the lights give way to the mark, which already lies under them',
      camera: { anticipation: '+4° yaw, 0.5–1.0 s', swing: '−14° yaw, +6° elevation, peaking at 3.0 s', perspective: '0.4 → 0 from 4.2 to 5.8 s', zoom: 1 }
    },
    mechanisms: {
      cut: { fps: 12, carrier: 'one pull-back from the m to the whole word, frames 46 → 68', substitution_1: 'frame 52 (4.33 s): the score (helices, spheres) is replaced by “indgut®”', substitution_2: 'the real m arrives on frame 66 over a matched white stroke', settle: 'ease-out to rest on frame 68, no overshoot', hold: '28 frames (2.33 s)', rule: 'after a cut the gel never overlaps the wordmark; every sphere sits on ink at the cut', camera: 'follows the band so it fills about 70 % of the height until the pull-back' },
      parallax: { seconds: 9, hit: { az: 0, el: 0, persp: RES.HIT.persp, zoom: r2(RES.HIT.zoom), at_s: 5.0, note: 'ST-22’s own camera, pulled back' }, pieces: '15, by construction: 13 strokes, the tittle, the ®', depths: 'one per piece, −960 … 900', drift: 'one shared vector for all pieces, dying out at the hit', scale: 's = 1 − z/F about the center of projection', lockup_beat: '5.0 → 5.6 s, ribbon beside the word', carry: '5.6 → 6.8 s, the camera moves to the word as the ribbon leaves as a rigid body', hold: '2.2 s' }
    },
    motion: { anticipation: '+4° yaw, 0.5–1.0 s', approach: 'ease in-out', cuts: 'inside a camera move, never on a still frame (Smith and Martin-Portugues Santacreu 2017)', hold: '≥ 2.2 s' },
    references_to_frames: RES.REFS.map(r => ({ reference: r.ref, device: r.device, frame: r.frame })),
    hands: H.map(h => ({ id: h.id, name: h.name, x_height_nw: +h.xh.toFixed(3), ascender_nw: +h.asc.toFixed(3), descender_nw: +h.desc.toFixed(3), nib_deg: h.nib, slant_deg: h.slant, contrast: h.contrast, source: h.src })),
    wordmark: { units: '998 × 217', stem: 45, x_height: 128, ascender: 45, descender: 34, letters: RES.LET, rule: 'never outlined or recolored (Mir library)' },
    render: 'GPU rebuild after ST-22 p10: measured normal ramp, gel stacking by dual-source blending, light helices, lit spheres, floor grid, 4 % bloom, fine static grain, airbrush spray in three octaves',
    export: { png: '2400 × 1350', gif: 'the whole trajectory at 12 fps (Cut 96 frames, Parallax 108), 640 × 360, one global palette, unchanged pixels transparent' },
    sources: SRC.map(([who, what, when, url]) => ({ who, what, when, url }))
  };
  function STEMS() { return { stem: 45, x_height: 128, ascender: 45, descender: 34, pitch_in_letter: [81.5, 82.5] }; }
  $('spec').textContent = JSON.stringify(SPEC, null, 2);
  $('bJson').onclick = () => $('copySpec').click();
  $('copySpec').onclick = () => { navigator.clipboard && navigator.clipboard.writeText($('spec').textContent).then(() => { $('copySpec').textContent = 'Copied'; setTimeout(() => $('copySpec').textContent = 'Copy JSON', 1600); }, () => {}); };

  if (!REND) document.querySelector('.screen').insertAdjacentHTML('beforeend', '<p class="line" style="position:absolute;inset:auto 20px 20px">WebGL 2 is off in this browser, so the study cannot draw.</p>');
  sync(); document.fonts.ready.then(() => { draw(); side(); renderPlates(); });
  let rz = 0; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { draw(); side(); }, 120); });
  requestAnimationFrame(tick);
  window.__study = { st, draw, side, setHand, setView, sync };
})();
