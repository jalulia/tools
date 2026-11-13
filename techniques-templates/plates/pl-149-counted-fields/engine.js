/* PL-149 · Counted fields — engine. Appended to study.js by _build/plates.py ("engine" in plates.json); edit this file.
   The four figures are drawn by the counted screen of Mindgut Direction 01 · Counted Marks, ported with its dials:
   a cell prints up to N dots, each at its own hashed spot, and keeps each with probability = density, so tone is a count.
   The screen is held at its size in screen pixels (cell, dot): a larger plate prints more dots, never bigger ones. */
(function (S) {
  'use strict';
  var C = { dg: [11, 59, 44], teal: [18, 165, 135], tm: [159, 220, 203], pu: [122, 44, 255], hair: [214, 223, 218] };
  function h2(x, y, s) { var h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
  function hexRGB(h) { var n = parseInt(String(h).slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  var P32 = function (c) { return (255 << 24 | c[2] << 16 | c[1] << 8 | c[0]) >>> 0; };

  /* ---- the dials ---- */
  var leaf = function (value, lo, hi, step, label, unit, note) { var o = { value: value, range: [lo, hi], step: step, label: label, note: note }; if (unit) o.unit = unit; return o; };
  var TECH = [
    { id: 'counted-stipple', short: 'CNT', name: 'Counted screen', layer: 1, pass: 1, atoms: ['screen-tone', 'stipple'],
      params: {
        cell: leaf(3.4, 2, 8, 0.1, 'Cell', 'px', 'Side of one screen cell, in screen pixels. Held at this size at any plate size, so a larger plate prints more dots, not bigger ones.'),
        dot: leaf(1.5, 1, 3, 0.05, 'Dot', 'px', 'Side of one dot, in screen pixels. Dots print as whole pixels; a fractional size is kept by thinning the count, so tone does not jump.'),
        perCell: leaf(3, 1, 6, 1, 'Dots per cell', '', 'Most dots one cell can hold. Tone is the count: density times this, the remainder kept by the hash.'),
        jitter: leaf(1, 0, 1, 0.01, 'Scatter', '', 'Where a dot may land in its cell. 1 is anywhere (the stochastic screen); 0 stacks every dot on the cell center, an ordered screen.'),
        round: leaf(2.5, 1.5, 4, 0.05, 'Round from', 'px', 'Dots this size and larger print round; smaller ones are square pixels.'),
        seed: leaf(11, 1, 99, 1, 'Seed', '', 'Re-rolls every hash: which dots are kept and where they land.')
      },
      implementation: 'Each cell of a jittered grid prints up to N dots at hashed positions and keeps the last one with probability equal to the remainder, so density is carried by the count of marks and nothing is blended.' },
    { id: 'stipple-ramp', short: 'RAMP', name: 'Stipple ramps', layer: 2, pass: 2, atoms: ['ramp'],
      params: {
        gamma: leaf(1.15, 0.4, 3, 0.01, 'Ramp curve', '', 'First figure: density = floor + (top - floor) · x^curve across the width.'),
        gamma2: leaf(1.4, 0.4, 3, 0.01, 'Split ramp curve', '', 'Second figure: the same ramp, printed dark green over teal.'),
        split: leaf(0.5, 0.15, 0.85, 0.01, 'Split', '', 'Where the second figure turns from dark green to teal, with a hairline on the seam.'),
        floor: leaf(0, 0, 0.3, 0.005, 'Floor', '', 'Density where the ramps start.'),
        top: leaf(0.97, 0.5, 1, 0.005, 'Top', '', 'Density where they end.')
      },
      implementation: 'density = floor + (top - floor) · (x / W)^curve, screened by the counted screen; the split ramp prints the top in dark green and the bottom in teal.' },
    { id: 'ring-interference', short: 'RING', name: 'Ring interference', layer: 2, pass: 3, atoms: ['interference'],
      params: {
        pitchA: leaf(44, 12, 90, 0.1, 'Pitch, you', 'u', 'Ring pitch of the first source, in figure units.'),
        pitchB: leaf(38.6, 12, 90, 0.1, 'Pitch, Mir', 'u', 'Ring pitch of the second source. Close to the first, the beat between them opens into wide lozenges.'),
        gain: leaf(0.85, 0.3, 1.2, 0.01, 'Gain', '', 'Density at a shared crest: (0.02 + gain · (A·B)^1.25) under the falloff.'),
        reach: leaf(0.42, 0.2, 0.9, 0.01, 'Reach', '', 'Width of the falloff that fades the rings toward the edges, as a share of the figure width.'),
        peak: leaf(0.93, 0.8, 1, 0.005, 'Purple peak', '', 'Where both crests stand above this near the first source, the cell prints one purple count. 1 removes it.')
      },
      implementation: 'Two ring screens A = ½ + ½cos(2π dA / pA) and B likewise; their product, under a gaussian falloff, is the density; the cell takes dark green where A leads and teal where B does.' },
    { id: 'counted-cells', short: 'CELL', name: 'Counted letters', layer: 2, pass: 4, atoms: ['count'],
      params: {
        tone: leaf(1, 0.4, 1.2, 0.01, 'Tone', '×', 'Each letter prints its digit (1 to 9, from its place in the alphabet) as density digit/9 times this.'),
        inset: leaf(4, 0, 14, 0.5, 'Inset', 'u', 'Margin of white inside each cell, in figure units.')
      },
      implementation: 'The words are spelled one letter per cell; each letter maps to a digit 1 to 9 and the cell prints that count as its tone, in the ink of its channel.' }
  ];
  var keep = (S.spec.techniques || []).filter(function (t) { return t.id !== 'counted-stipple'; });
  S.spec.techniques = TECH.concat(keep);
  S.spec.pass_order = ['ground · plate', 'counted screen · cells at screen size', 'ramps · rings · counted letters, one density field each', 'read · points measured from the filed figures'];
  S.body = [S.body[0], 'The four figures are drawn here by the counted screen of Mindgut Direction 01, with its dials. Cell and dot are held in screen pixels, so the plate prints finer as it grows, and every dial redraws the figures: curve, split, floor and top for the ramps; both pitches, gain, reach and the purple peak for the rings; tone and inset for the letters.'];
  S.paramsHint = 'Every dial of the counted screen and the four figures. Cell and dot are screen pixels; the figures are in their own units.';
  S.liveOnLoad = false; delete S.live;

  /* ---- the screen, writing whole-pixel dots into one image ---- */
  function Img(W, H, paper) { var img = new ImageData(W, H), b = new Uint32Array(img.data.buffer); b.fill(P32(paper)); return { img: img, b: b, W: W, H: H }; }
  function dot(I, x, y, sz, round, col) {
    var x0 = Math.round(x - sz / 2), y0 = Math.round(y - sz / 2), r2 = sz * sz / 4, c = sz / 2 - .5;
    for (var j = 0; j < sz; j++) { var yy = y0 + j; if (yy < 0 || yy >= I.H) continue; var o = yy * I.W;
      for (var i = 0; i < sz; i++) { var xx = x0 + i; if (xx < 0 || xx >= I.W) continue; if (round && (i - c) * (i - c) + (j - c) * (j - c) > r2) continue; I.b[o + xx] = col; } }
  }
  /* box: device rect of the figure; su: device px per figure unit; dens(x, y) in figure units -> 0..1 or [d, color32] */
  function screen(I, box, su, dens, Q, seedAdd) {
    var cell = Q.cell, sz = Math.max(1, Math.round(Q.dot)), ks = (Q.dot * Q.dot) / (sz * sz), M = Q.perCell, jit = Q.jitter, seed = (Q.seed | 0) + (seedAdd || 0), round = sz >= Q.round;
    var nx = Math.ceil(box.w / cell), ny = Math.ceil(box.h / cell), def = Q.color;
    for (var j = 0; j < ny; j++) for (var i = 0; i < nx; i++) {
      var cx = (i + .5) * cell, cy = (j + .5) * cell; if (cx > box.w || cy > box.h) continue;
      var d = dens(cx / su, cy / su), col = def;
      if (d && typeof d === 'object') { col = d[1]; d = d[0]; }
      if (!d || d <= 0) continue;
      var n = d * M * ks, k = Math.floor(n) + (h2(i, j, seed + 13) < n - Math.floor(n) ? 1 : 0);
      for (var q = 0; q < k; q++) {
        var x = box.x + (i + .5 + (h2(i * 7 + q, j, seed + q * 31) - .5) * jit) * cell, y = box.y + (j + .5 + (h2(i, j * 5 + q, seed + q * 17 + 7) - .5) * jit) * cell;
        dot(I, x, y, sz, round, col);
      }
    }
  }

  /* ---- the four figures, in figure units (the deck's 1920-wide slide) ---- */
  var FIG = [
    function ramp(I, box, su, W, H, Q, A, K) { var r = A['stipple-ramp']; screen(I, box, su, function (x) { return r.floor + (r.top - r.floor) * Math.pow(Math.max(0, x / W), r.gamma); }, Object.assign({ color: K.dg }, Q), 2); },
    function ramp2(I, box, su, W, H, Q, A, K) { var r = A['stipple-ramp'];
      screen(I, box, su, function (x, y) { return [r.floor + (r.top - r.floor) * Math.pow(Math.max(0, x / W), r.gamma2), y < H * r.split ? K.dg : K.teal]; }, Q, 0);
      var yy = Math.round(box.y + H * r.split * su); if (yy >= 0 && yy < I.H) for (var x = Math.max(0, box.x); x < Math.min(I.W, box.x + box.w); x++) I.b[yy * I.W + x] = K.hair; },
    function rings(I, box, su, W, H, Q, A, K) { var g = A['ring-interference'], pa = g.pitchA, pb = g.pitchB, ax = W * .38, ay = H * .52, bx = W * .66, by = H * .42, sg = 2 * Math.pow(W * g.reach, 2);
      screen(I, box, su, function (x, y) { var da = Math.hypot(x - ax, y - ay), db = Math.hypot(x - bx, y - by), a = .5 + .5 * Math.cos(2 * Math.PI * da / pa), b = .5 + .5 * Math.cos(2 * Math.PI * db / pb),
        fall = Math.exp(-(Math.pow(x - W * .52, 2) + Math.pow(y - H * .48, 2)) / sg), p = a * b;
        if (p > g.peak && da < pa * 3.2) return [.9, K.pu];
        return [(.02 + g.gain * Math.pow(p, 1.25)) * fall, a > b ? K.dg : K.teal]; }, Q, -3); },
    function cells(I, box, su, W, H, Q, A, K, x2d) { var c = A['counted-cells'], L = 'sayitonce'.split(''), cols = 3, cw = (W - 56) / cols, ch = Math.min(cw * 1.05, (H - 20) / Math.ceil(L.length / cols)), ins = c.inset;
      var labels = [];
      L.forEach(function (l, i) { var n = l.charCodeAt(0) - 96, dig = 1 + (n - 1) % 9, chn = dig % 3, x = 28 + (i % cols) * cw, y = 10 + Math.floor(i / cols) * ch, col = chn === 2 ? K.teal : K.dg;
        screen(I, box, su, function (px, py) { return px >= x + ins && px <= x + cw - ins && py >= y + ins && py <= y + ch - ins ? [Math.min(1, dig / 9 * .95 * c.tone), col] : 0; }, Q, 1 + i);
        labels.push([x, y, l.toUpperCase() + ' ' + dig, col]); });
      return function (x) { /* labels: a white chip and the letter with its count, drawn over the dots */
        labels.forEach(function (t) { var X = box.x + (t[0] + 8) * su, Y = box.y + (t[1] + 8) * su; x.fillStyle = K.paperCss; x.fillRect(X, Y, 46 * su, 24 * su); x.fillStyle = 'rgb(' + K.dgRGB.join(',') + ')';
          x.font = '500 ' + (13 * su).toFixed(2) + 'px "JetBrains Mono", ui-monospace, monospace'; x.textBaseline = 'alphabetic'; x.fillText(t[2], X + 6 * su, Y + 17 * su); }); };
    }
  ];

  S.render = function (canvas, w, h, dpr, V, done, overrides) {
    var A = window.ART.params(S.spec, overrides || {}), Q = Object.assign({}, A['counted-stipple']);
    var x = canvas.getContext('2d'), W = canvas.width, H = canvas.height, u = W / 1000, v = H / S.ref.h;
    var paper = hexRGB(V.paper || '#FFFFFF'), dark = (.2126 * paper[0] + .7152 * paper[1] + .0722 * paper[2]) < 110;
    var dg = dark ? [238, 244, 241] : C.dg, teal = dark ? C.tm : C.teal;
    var K = { dg: P32(dg), teal: P32(teal), pu: P32(C.pu), hair: P32(dark ? [60, 70, 66] : C.hair), dgRGB: dg, paperCss: V.paper || '#FFFFFF' };
    var I = Img(W, H, paper), after = [];
    S.panels.forEach(function (p, i) {
      var f = FIG[i]; if (!f) return;
      var box = { x: Math.round(p.x * u), y: Math.round(p.y * v), w: Math.round(p.w * u), h: Math.round(p.h * v) };
      var L = p.lift || {}, FW = (L.w || p.w) / .75, FH = (L.h || p.h) / .75, su = box.w / FW;   /* figure units: the slide's own (lifted at 0.75 of 1920) */
      var r = f(I, box, su, FW, FH, Q, A, K);
      if (typeof r === 'function') after.push(r);
    });
    x.setTransform(1, 0, 0, 1, 0, 0); x.putImageData(I.img, 0, 0);
    after.forEach(function (fn) { fn(x); });
    S.panels.forEach(function (p) { var X = Math.round(p.x * u), Y = Math.round(p.y * v), PW = Math.round(p.w * u), PH = Math.round(p.h * v); x.strokeStyle = V.rule; x.lineWidth = Math.max(1, u * .8); x.strokeRect(X + .5, Y + .5, PW - 1, PH - 1); });
    if (done) done();
    return false;
  };
})(window.STUDY);
