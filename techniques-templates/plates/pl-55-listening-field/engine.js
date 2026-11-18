/* PL-55 · Listening field — engine. Appended to study.js by _build/plates.py ("engine" in plates.json); edit this file.
   Ported from the presence field of Mindgut Worlds V2 (drawPresence): a field of square dots on a 5 px lattice, each
   kept when a fixed hash falls under (wave + 1) · coverage. Mir's three states are three waves through the same field:
   Listening, rings from the center; Reaching, diagonal waves under a ring envelope; At rest, a low swell of small dots.
   The page's lattice, dot sizes, wave numbers and inks are the defaults; the dials are those numbers. */
(function (S) {
  'use strict';
  function h2(a, b, s) { var n = Math.imul(a + 1 + (s | 0) * 7919, 374761393) + Math.imul(b + 1, 668265263); n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967295; }
  var leaf = function (value, lo, hi, step, label, unit, note) { var o = { value: value, range: [lo, hi], step: step, label: label, note: note }; if (unit) o.unit = unit; return o; };
  var TID = (S.spec.techniques[0] || {}).id || 'character-field';
  var TECH = [{ id: TID, short: 'FLD', name: 'Presence field', layer: 1, pass: 1, atoms: ['dot lattice', 'threshold', 'wave'],
    params: {
      state: { value: 0, options: [{ v: 0, label: 'Listening' }, { v: 1, label: 'Reaching' }, { v: 2, label: 'At rest' }], label: 'Presence', note: 'Mir’s state, drawn as the wave through the field: rings from the center, diagonal waves reaching out, or a low swell.' },
      pitch: Object.assign(leaf(5, 3.5, 9, 0.1, 'Dot pitch', 'px', 'Spacing of the dot lattice, in screen pixels, held at any plate size as on the page. The page’s own is 5.'), { scale: 'linear' }),
      dot: leaf(34, 30, 55, 1, 'Dot size', '%', 'Side of each square dot as a share of the lattice pitch; the page’s 1.7 px on its 5 px lattice is 34 %. At rest prints at 0.6 of it, as the page does.'),
      freq: leaf(35, 22, 60, 1, 'Wave number', '', 'How many crests cross the field. 35 is the page’s ring count; Reaching and At rest scale their waves with it.'),
      cover: leaf(0.35, 0.22, 0.48, 0.005, 'Coverage', '', 'A dot prints where the hash falls under (wave + 1) × this. Higher fills the crests in; lower leaves only their peaks.'),
      seed: leaf(0, 0, 99, 1, 'Seed', '', 'Re-deals which lattice points print. 0 is the page’s own hash.')
    },
    implementation: 'A square-dot lattice thresholded by a fixed hash against a wave: dot printed where hash(x, y) < (wave(x, y, t) + 1) · coverage. The wave is the state: sin(35·r) from the center; sin(20·(x + y)) · cos(20·r); or sin(12·x)·sin(6·y)·0.35.' }];
  var keep = (S.spec.techniques || []).filter(function (t) { return t.id !== TID; });
  S.spec.techniques = TECH.concat(keep);
  S.spec.pass_order = ['ground', 'lattice · one point every pitch', 'wave · the state’s field at each point', 'threshold · keep where hash < (wave + 1) · coverage', 'type · the page’s kicker and the state’s name'];
  S.body = [S.body[0], 'The field is drawn here from the page’s own code, ported: a square-dot lattice kept or dropped by a fixed hash against a wave. The switch is Mir’s state; the dials are the page’s own numbers: lattice pitch, dot size, wave number and coverage. Play moves the wave.'];
  S.paramsHint = 'The page’s own numbers for the field, in its pixels.';
  S.motionHint = 'Play moves the wave at the page’s speed.';
  S.liveOnLoad = false; delete S.live;
  function VAR(id, label, paper, inks) { return { id: id, label: label, sw: [inks.ground, inks.listening, inks.reaching, inks.rest], spot: [20, 20, 20], paper: paper, rule: paper, inks: inks }; }
  S.variants = [
    VAR('source', 'Source', '#121714', { ground: '#121714', listening: '#d3ff5c', reaching: '#ff6a4b', rest: '#71895e', type: '#d3ff5c' }),
    VAR('paper', 'Paper', '#FBFBF7', { ground: '#FBFBF7', listening: '#126b3d', reaching: '#f4551e', rest: '#5e7a52', type: '#0a4528' }),
    VAR('ink', 'Ink', '#101014', { ground: '#101014', listening: '#f2f2ee', reaching: '#f4551e', rest: '#8a9a80', type: '#f2f2ee' })
  ];
  S.variantLabel = 'Palette';
  S.colorHint = 'The field’s inks: the ground, one ink per state, and the type.';
  /* the filed figure is 1419 × 742; the page's canvas sits in it at (10, 45), 1400 × 625, with its type laid over it */
  var FW = 1419, FH = 742, CX = 10, CY = 45, CW = 1400, CH = 625, NAMES = ['Listening.', 'Reaching.', 'At rest.'];

  function paint(canvas, x, V, Q, t, dpr) {
    var W = canvas.width, H = canvas.height, u = W / 1000, v = H / S.ref.h, I = V.inks || S.variants[0].inks;
    x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = V.paper || I.ground; x.fillRect(0, 0, W, H);
    var st = Math.round(+Q.state || 0), F = +Q.freq || 35, k = +Q.cover || .35, seed = Q.seed | 0, sp = t * .2, D = Math.max(1, dpr || 1);
    S.panels.forEach(function (p) {
      var bx = p.x * u, by = p.y * v, bw = p.w * u, bh = p.h * v, su = Math.min(bw / FW, bh / FH), ox = bx + (bw - FW * su) / 2, oy = by + (bh - FH * su) / 2;
      x.save(); x.beginPath(); x.rect(bx, by, bw, bh); x.clip(); x.fillStyle = I.ground; x.fillRect(bx, by, bw, bh);
      /* the lattice is held in screen pixels, as on the page: a larger plate prints more dots, never bigger ones */
      var step = Math.max(3, +Q.pitch || 5) * D, s = (+Q.dot || 34) / 100 * Math.max(3, +Q.pitch || 5) * (st === 2 ? 1 / 1.7 : 1), sd = Math.max(1, Math.round(s * D)),
          x0 = ox + (CX + 12) * su, x1 = ox + (CX + CW - 12) * su, y0 = oy + (CY + 45) * su, y1 = oy + (CY + CH - 65) * su, cw = CW * su, ch = CH * su, cx0 = ox + CX * su, cy0 = oy + CY * su;
      x.fillStyle = st === 1 ? I.reaching : st === 2 ? I.rest : I.listening;
      for (var iy = 0, yy = y0; yy < y1; yy = y0 + (++iy) * step) {
        var ny = (yy - cy0) / ch;
        for (var ix = 0, xx = x0; xx < x1; xx = x0 + (++ix) * step) {
          var nx = (xx - cx0) / cw, a = Math.hypot(nx - .5, ny - .5), val;
          if (st === 0) val = Math.sin(a * F - sp * 2);
          else if (st === 1) val = Math.sin((nx + ny) * F * 20 / 35 - sp * 4) * Math.cos(a * F * 20 / 35);
          else val = Math.sin(nx * F * 12 / 35) * Math.sin(ny * F * 6 / 35) * .35;
          if (h2(ix, iy, seed) < (val + 1) * k) x.fillRect(Math.round(xx), Math.round(yy), sd, sd);
        }
      }
      /* the page's type over the field: its kicker, and the state's name in the display face */
      x.translate(ox, oy); x.fillStyle = I.type; x.textBaseline = 'alphabetic';
      x.font = '400 ' + (18 * su).toFixed(2) + 'px Inter, "Helvetica Neue", Arial, sans-serif'; x.fillText('MINDGUT / A CHANGE IN THE FIELD', 48 * su, 63 * su);
      x.font = '400 ' + (78 * su).toFixed(2) + 'px Inter, "Helvetica Neue", Arial, sans-serif';
      if ('letterSpacing' in x) x.letterSpacing = (-4 * su).toFixed(2) + 'px';
      x.fillText(NAMES[st] || NAMES[0], 48 * su, 680 * su);
      if ('letterSpacing' in x) x.letterSpacing = '0px';
      x.restore();
    });
  }
  S.render = function (canvas, w, h, dpr, V, done, overrides) {
    var A = window.ART.params(S.spec, overrides || {}); paint(canvas, canvas.getContext('2d'), V, A[TID] || {}, 0, dpr); if (done) done(); return false;
  };
  S.motion = function (canvas, w, h, dpr, V, t, ctx, overrides) {
    var A = window.ART.params(S.spec, overrides || {}); paint(canvas, ctx || canvas.getContext('2d'), V, A[TID] || {}, t, dpr);
  };
})(window.STUDY);
