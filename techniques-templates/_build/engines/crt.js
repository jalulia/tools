/* crt · engine for the cathode-ray receiver plates (PL-92, PL-93, PL-94, PL-95). Appended to each plate's study.js by
   _build/plates.py after that plate's crt-figure.js (window.CRT_FIG: one set from the sheet Cathode-Ray Receivers,
   plates/_src/cathode-ray-receivers.html, with every number in the sheet's own px).
   The set is drawn the way the sheet draws it: one ink at two weights (main 1.5 px, fine 1 px), round caps and joins,
   the sheet's opacities, rounded rectangles with quadratic corners, and the tube face as a "pillow" of four bowed edges.
   Here every part is laid out from parameters, the set designer's own decisions: the cabinet's corner and proportion,
   its rails, handle and antenna; the tube's bulge, glass lines and raster; which controls and grille it carries; and
   the line's weight and hand. At the default parameters each plate draws its sheet drawing, scaled to fill the stage. */
(function (S) {
  'use strict';
  var F = window.CRT_FIG; if (!F) return;
  var MAIN = 1.5, FINE = 1.0;   /* the sheet's two weights, in its px */

  /* ---------- parameters ---------- */
  var leaf = function (value, lo, hi, step, label, unit, note) { var o = { value: value, range: [lo, hi], step: step, label: label, note: note }; if (unit) o.unit = unit; return o; };
  var choice = function (value, labels, label, note) { return { value: value, options: labels.map(function (l, i) { return { v: i, label: l }; }), label: label, note: note }; };
  var r1 = function (v, d) { var m = Math.pow(10, d); return Math.round(v * m) / m; };
  /* corner radius runs linearly over 0–14% of the height: half the track is 7%, and equal travel rounds the set by equal steps */
  /* every control carries a one-line note (shown under its row); the longer account sits in its technique's implementation */
  var CAB = {
    corner: Object.assign(leaf(r1(F.cab.r / F.cab.h * 100, 2), 0, 14, 0.1, 'Corner radius', '%', 'How round the cabinet’s corners are, as a share of its height; the mask and tube follow.'), { scale: 'linear' }),
    prop: leaf(r1(F.cab.w / F.cab.h, 2), F.prop[0], F.prop[1], 0.01, 'Proportion', '× height', 'Cabinet width as a multiple of its height; the tube takes the change, the controls stay put.')
  };
  if (F.rails) CAB.rails = choice(F.rails.on, ['Off', 'On'], 'Side rails', 'The carrying rail standing off each side of the cabinet.');
  if (F.handle) CAB.handle = choice(F.handle.on, ['Off', 'On'], 'Handle', 'The carrying loop over the top of the cabinet.');
  CAB.antenna = choice(F.antenna.value, F.antenna.options.map(function (o) { return o.label; }), 'Antenna', F.notes.antenna);
  var TUBE = {
    bulge: leaf(Math.round(F.screen.bulge * 1000) / 10, 0, 12, 0.1, 'Bulge', '%', 'How far each edge of the tube face bows out; 0 is a flat rectangle.'),
    glass: leaf(3, 0, 5, 1, 'Glass lines', 'per edge', 'Faint lines at the top and bottom of the face; 0 is clear glass.'),
    picture: choice(0, ['Off', 'Raster'], 'Picture', 'Raster lights the set with dashed scan lines, as the sheet’s PVM does.')
  };
  var CTRL = {
    fit: choice(F.fits.value, ['Knobs', 'Dials', 'Buttons'], 'Control set', F.notes.fit),
    grille: choice(F.grilles.value, ['Slots', 'Dots', 'None'], 'Grille', F.notes.grille)
  };
  var LINE = {
    weight: leaf(1, 0.7, 2, 0.05, 'Line weight', 'px', 'Fine-line width in the sheet’s px (main lines are 1.5 times it); 1 is the sheet’s hairline.'),
    hand: leaf(0, 0, 1, 0.05, 'Hand', 'px', 'How far the drawing wanders from ruled, in the sheet’s px; 0 is ruled.'),
    seed: leaf(1, 1, 99, 1, 'Deal', '', 'Turns the knobs to new settings and deals a new hand; No. 1 is the sheet’s.')
  };
  var read = (S.spec.techniques || [])[0] || {}, RID = read.id || 'product-line';
  var TECH = [
    { id: RID, short: 'PLDR', name: read.name || 'Product line drawing', layer: 1, pass: 1, atoms: ['line', 'elevation', 'parametric'],
      params: { sheet: 'Cathode-Ray Receivers, TD·2608 rev B', set: F.no + ' ' + F.name + ' · ' + F.year, main_px: MAIN, fine_px: FINE, ink: '#1A1A1D', sheet_paper: '#F5F3ED', plate_paper: '#FBFBF7' },
      implementation: 'A television drawn front-on in one ink at two weights, main 1.5 px and fine 1 px, with no fill; secondary lines are the same ink at lower opacity. Drawn here by code from the sheet’s own numbers.' },
    { id: 'crt-cabinet', short: 'CAB', name: 'Cabinet', layer: 2, pass: 2, atoms: ['rounded-rectangle', 'proportion'], params: CAB,
      limits: 'corner radius stops at 14% of the height: the set is fully rounded there, and further the rounding would crowd the controls. ' + F.notes.propLimit,
      implementation: 'A rounded rectangle with quadratic corners in the main line; rails, handle, feet and antenna are laid from its edges, so they keep their places as the corner and the width change. The mask and tube corners follow the cabinet’s, concentric, once it outgrows them; ' + F.notes.corner + ' ' + F.notes.prop + ' ' + F.notes.antennaLong },
    { id: 'crt-screen', short: 'TUBE', name: 'Tube', layer: 2, pass: 3, atoms: ['pillow', 'bow', 'hairline'], params: TUBE,
      limits: 'bulge stops at 12%: past it the face reads as a cushion, not a tube. Glass lines stop at 5 per edge, before they reach the middle of the face.',
      implementation: 'The mask is a rounded rectangle in fine line; the face is four quadratic edges bowed out by the bulge, with rounded corners. Glass lines sit at the sheet’s fractions of the half-height (0.965, 0.885, 0.77), extended by the same power law (1 − 0.035·k^1.715), each inset to clear the corner.' },
    { id: 'crt-controls', short: 'CTRL', name: 'Controls', layer: 2, pass: 4, atoms: ['dial', 'knob', 'button', 'grille'], params: CTRL,
      limits: 'each control set uses the sheet’s own parts and spacing, laid in the same place, so none is scaled to squeeze in.',
      implementation: F.notes.fits + ' Dials are a main-line circle with a cap at 0.32 of the radius and twelve ticks; knobs a fine circle with a pointer from 0.35 of the radius; buttons small rounded rectangles; grilles fine slots at 0.6 or a checkerboard of dots.' },
    { id: 'crt-line', short: 'LINE', name: 'Line', layer: 3, pass: 5, atoms: ['line-weight', 'hand'], params: LINE,
      limits: 'line weight stops at 0.7 px, where the fine lines would fade into the ground, and at 2 px, where knobs start to fill in. Hand stops at 1 px, past which the set reads as warped rather than drawn.',
      implementation: 'Every part is flattened to a polyline, then stroked in one ink with round caps and joins. Hand moves every point of the drawing through one smooth seeded field (two octaves, 70 and 22 px), so lines bow as if drawn freehand while joints stay joined and small circles stay round.' }
  ];
  var keep = (S.spec.techniques || []).filter(function (t) { return t.id !== RID; });
  S.spec.techniques = TECH.concat(keep);
  S.spec.pass_order = ['ground · the plate’s paper', 'cabinet · outline, rails, handle, feet, antenna', 'tube · mask, bowed face, glass lines, raster', 'controls · dials, knobs, buttons, grille', 'line · one ink at two weights, ruled or by hand'];
  S.lede = F.lede;
  S.body = [F.body, 'The set is drawn here by code from the sheet’s own numbers, so the designer’s decisions are its controls: the cabinet’s corner and proportion, its antenna, the tube’s bulge and glass lines, which controls and grille it carries, and the line. At the defaults it is the sheet’s drawing, scaled to fill the plate.'];
  S.paramsHint = 'The set designer’s decisions, in pass order. Lengths are in the sheet’s px.';
  S.liveOnLoad = false; delete S.live;

  /* ---------- palettes: paper, the one ink, and the rule of the glass lines (ink at the sheet's 0.32 over paper) ---------- */
  var hexRGB = function (h) { var n = parseInt(String(h).slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  var PAL = function (id, label, paper, ink, rule) { return { id: id, label: label, sw: [paper, ink, rule], spot: hexRGB(ink), paper: paper, ink: ink, rule: rule }; };
  /* Source keeps the sheet's ink (#1A1A1D at its opacities) on the house paper, not the sheet's warm #F5F3ED */
  S.variants = [
    PAL('source', 'Source', '#FBFBF7', '#1A1A1D', '#B3B3B1'),
    PAL('cobalt', 'Cobalt', '#F3F5F8', '#1B3BD4', '#AEBAEC'),
    PAL('ink', 'Ink', '#101014', '#E7E7E4', '#555557')
  ];
  S.variantLabel = 'Palette';
  S.colorHint = 'Pick a palette; click an ink to change it. Paper is the ground; Ink is every line of the set, at the sheet’s opacities; Rule is the faint glass lines on the tube face. Source is the sheet’s ink on the house paper.';

  /* ---------- geometry: every part becomes polylines in sheet px ---------- */
  function seg(a, x1, y1) { var p = a[a.length - 1], L = Math.hypot(x1 - p[0], y1 - p[1]), n = Math.max(1, Math.ceil(L / 3)); for (var i = 1; i <= n; i++) a.push([p[0] + (x1 - p[0]) * i / n, p[1] + (y1 - p[1]) * i / n]); }
  function quad(a, cx, cy, x1, y1) { var p = a[a.length - 1], x0 = p[0], y0 = p[1], L = Math.hypot(cx - x0, cy - y0) + Math.hypot(x1 - cx, y1 - cy), n = Math.max(2, Math.ceil(L / 0.75));
    for (var i = 1; i <= n; i++) { var t = i / n, A = (1 - t) * (1 - t), B = 2 * t * (1 - t), C = t * t; a.push([A * x0 + B * cx + C * x1, A * y0 + B * cy + C * y1]); } }
  function rrectPts(x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); var a = [[x + r, y]];
    seg(a, x + w - r, y); quad(a, x + w, y, x + w, y + r); seg(a, x + w, y + h - r); quad(a, x + w, y + h, x + w - r, y + h);
    seg(a, x + r, y + h); quad(a, x, y + h, x, y + h - r); seg(a, x, y + r); quad(a, x, y, x + r, y); a.pop(); return a; }
  /* the sheet's crt(): each edge a quadratic bowed by b times the face, corners quadratic of radius r */
  /* g (0..1) eases each corner's control from the rectangle's corner (the sheet's) to where the bowed edges' tangents meet,
     so a strong bulge turns its corners smoothly instead of kinking; at the sheet's bulge g is 0 and the face is the sheet's */
  function crtPts(x, y, w, h, b, r, g) { var bx = w * b, by = h * b, ox = 0, oy = 0;
    if (g > 0) { var ax = w / 2 - r, ay = by, ex = -bx, ey = r - h / 2, det = -ax * ey + ex * ay; if (Math.abs(det) > 1e-9) { var t = r * (-ey + ex) / det; if (t > 0) { ox = Math.max(-r, Math.min(0, -r + t * ax)) * g; oy = Math.max(0, Math.min(r, t * ay)) * g; } } }
    var a = [[x + r, y]];
    quad(a, x + w / 2, y - by, x + w - r, y); quad(a, x + w + ox, y + oy, x + w, y + r); quad(a, x + w + bx, y + h / 2, x + w, y + h - r); quad(a, x + w + ox, y + h - oy, x + w - r, y + h);
    quad(a, x + w / 2, y + h + by, x + r, y + h); quad(a, x - ox, y + h - oy, x, y + h - r); quad(a, x - bx, y + h / 2, x, y + r); quad(a, x - ox, y + oy, x + r, y); a.pop(); return a; }
  function circPts(cx, cy, r) { var n = Math.max(24, Math.ceil(2 * Math.PI * r / 0.75)), a = []; for (var i = 0; i < n; i++) { var t = i / n * Math.PI * 2; a.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]); } return a; }
  function linePts(x0, y0, x1, y1) { var a = [[x0, y0]]; seg(a, x1, y1); return a; }

  /* ---------- the set, laid out from parameters ---------- */
  var AT = function (v, W) { return typeof v === 'number' ? v : v[0] === 'R' ? W + v[1] : v[0] === 'C' ? W / 2 + v[1] : v[1]; };   /* x from the left, the right ('R') or the center ('C') */
  var ATY = function (v, H) { return typeof v === 'number' ? v : v[0] === 'B' ? H + v[1] : v[1]; };                                 /* y from the top, or the bottom ('B') */
  var GLASS = [0.965, 0.885, 0.77, 1 - 0.035 * Math.pow(4, 1.715), 1 - 0.035 * Math.pow(5, 1.715)];

  function layout(Q) {
    var C = Q['crt-cabinet'], T = Q['crt-screen'], K = Q['crt-controls'];
    /* the defaults are shown to two places; at them the set takes the sheet's exact width and radius */
    var H = F.cab.h, W = Math.abs(C.prop - CAB.prop.value) < 1e-9 ? F.cab.w : H * C.prop, R = Math.abs(C.corner - CAB.corner.value) < 1e-9 ? F.cab.r : C.corner / 100 * H;
    R = Math.max(0, Math.min(R, H / 2, W / 2));
    var parts = [], marks = {}, dots = [];
    var add = function (pts, closed, w, op, dash, tag) { parts.push({ p: pts, c: closed, w: w, op: op == null ? 1 : op, d: dash || null, tag: tag || '' }); };
    var rng = window.ART.rng(((Q['crt-line'].seed | 0) * 7919) ^ 0x5bd1);
    var deal = (Q['crt-line'].seed | 0) === 1 ? null : function () { return -150 + rng() * 190; };
    var nextAng = function (a) { return deal ? deal() : a; };   /* knob pointers: the sheet's settings at deal No. 1 */
    /* cabinet */
    add(rrectPts(0, 0, W, H, R), true, MAIN, 1, null, 'cab');
    marks.cab = [R * 0.29, R * 0.29];
    /* side rails (PROFEEL): they shorten to the straight run of the side as the corner grows */
    if (F.rails && +C.rails === 1) { var rl = F.rails, ri = Math.max(rl.inset, R * 0.62);
      [-(rl.gap + rl.w), W + rl.gap].forEach(function (rx) { add(rrectPts(rx, ri, rl.w, H - 2 * ri, rl.r), true, MAIN, 1, null, 'rail'); add(linePts(rx + rl.w / 2, ri + rl.rule, rx + rl.w / 2, H - ri - rl.rule), false, FINE, rl.ruleOp, null, 'rail'); }); }
    /* mask (bezel) and tube: insets from the cabinet's edges; corners concentric once the cabinet's outgrow them */
    var B = F.bezel, rb = 0, bx0, by0, bw, bh;
    if (B) { bx0 = B.l; by0 = B.t; bw = W - B.l - B.r; bh = H - B.t - B.b; rb = Math.max(B.rad, R - Math.min(B.l, B.t)); add(rrectPts(bx0, by0, bw, bh, rb), true, FINE, B.op, null, 'mask'); }
    var Sc = F.screen, sx = Sc.l, sy = Sc.t, sw = W - Sc.l - Sc.r, sh = H - Sc.t - Sc.b;
    var outer = B ? rb - Math.min(Sc.l - B.l, Sc.t - B.t) : R - Math.min(Sc.l, Sc.t);
    var sr = Math.max(Sc.rad, outer);
    /* bulge: the face's outer extent stays where the sheet puts it; a stronger bow pulls the corners in */
    var b0 = Sc.bulge, b = T.bulge / 100, kx = (1 + b0) / (1 + b), w2 = sw * kx, h2 = sh * kx, x2 = sx + (sw - w2) / 2, y2 = sy + (sh - h2) / 2;
    sr = Math.min(sr, w2 / 2 - 1, h2 / 2 - 1);
    var face = crtPts(x2, y2, w2, h2, b, sr, b > b0 ? Math.min(1, (b - b0) / 0.03) : 0);
    add(face, true, MAIN, 1, null, 'tube');
    /* where a level line crosses the face outline (left and right) */
    var span = function (yy) { var lo = 1e9, hi = -1e9; for (var i = 0; i < face.length; i++) { var A = face[i], Bq = face[(i + 1) % face.length]; if ((A[1] - yy) * (Bq[1] - yy) <= 0 && A[1] !== Bq[1]) { var xx = A[0] + (Bq[0] - A[0]) * (yy - A[1]) / (Bq[1] - A[1]); if (xx < lo) lo = xx; if (xx > hi) hi = xx; } } return [lo, hi]; };
    marks.tube = [x2 - w2 * b / 2, y2 + h2 / 2];
    /* glass lines: the sheet's shade(), at fractions of the half-height, inset to clear the corner (and, at a strong bulge, the outline) */
    var nG = Math.max(0, Math.min(5, Math.round(T.glass))), cy = y2 + h2 / 2, gl = [];
    for (var gi = 0; gi < nG; gi++) [-1, 1].forEach(function (sg) {
      var t = GLASS[gi], dy = t * h2 / 2, pad = 4; if (dy > h2 / 2 - sr) { var d = dy - (h2 / 2 - sr); pad = sr - Math.sqrt(Math.max(0, sr * sr - d * d)) + 4; }
      var yy = cy + sg * dy, sp = span(yy), xa = Math.max(x2 + pad, sp[0] + 3), xb = Math.min(x2 + w2 - pad, sp[1] - 3); gl.push(yy); if (xb > xa) add(linePts(xa, yy, xb, yy), false, FINE, 1, null, 'glass'); });
    marks.glass = [x2 + w2 * 0.5, gl.length ? Math.min.apply(null, gl) : y2 + 6];
    /* raster: the PVM's five dashed scan lines */
    /* raster: the PVM's five dashed scan lines, 34 px in from the face's top and bottom; with more glass lines the band
       closes up so every scan line sits on clear glass, between the innermost glass lines */
    if (+T.picture === 1) { var hs = h2 / 2 - 34 * kx; if (nG) hs = Math.min(hs, GLASS[nG - 1] * h2 / 2 - Math.max(8, h2 * 0.05));
      for (var ri2 = 0; ri2 < 5; ri2++) { var ry = cy - hs + ri2 * hs / 2, rs = span(ry); add(linePts(Math.max(x2 + 22, rs[0] + 12), ry, Math.min(x2 + w2 - 22, rs[1] - 12), ry), false, FINE, 0.5, [9, 6], 'raster'); } }
    /* the strip divider (PROFEEL) */
    if (F.divider) add(linePts(F.divider.inset, H - F.divider.y, W - F.divider.inset, H - F.divider.y), false, FINE, F.divider.op, null, 'div');
    /* controls: one of three fits, each the sheet's own parts at the sheet's spacing */
    var fit = F.fits.sets[+K.fit] || [], cl = 1e9, cbox = [1e9, 1e9, -1e9, -1e9];
    var grow = function (x0, y0, x1, y1) { cbox = [Math.min(cbox[0], x0), Math.min(cbox[1], y0), Math.max(cbox[2], x1), Math.max(cbox[3], y1)]; cl = Math.min(cl, x0); };
    fit.forEach(function (it) {
      var X = AT(it.x, W), Y = ATY(it.y, H);
      if (it.k === 'dial') { var dr = it.r, to = dr - 3, ti = Math.min(dr * 0.8, to - 2); add(circPts(X, Y, dr), true, MAIN, 1, null, 'dial'); add(circPts(X, Y, dr * 0.32), true, FINE, 0.8, null, 'dial');
        for (var a = 0; a < 360; a += 30) { var ra = a * Math.PI / 180; add(linePts(X + Math.cos(ra) * ti, Y + Math.sin(ra) * ti, X + Math.cos(ra) * to, Y + Math.sin(ra) * to), false, FINE, 0.75, null, 'dial'); }
        grow(X - dr, Y - dr, X + dr, Y + dr); }
      else if (it.k === 'knob') { var kr = it.r, ka = nextAng(it.a) * Math.PI / 180; add(circPts(X, Y, kr), true, FINE, 1, null, 'knob');
        add(linePts(X + Math.cos(ka) * kr * 0.35, Y + Math.sin(ka) * kr * 0.35, X + Math.cos(ka) * kr, Y + Math.sin(ka) * kr), false, FINE, 1, null, 'knob'); grow(X - kr, Y - kr, X + kr, Y + kr); }
      else if (it.k === 'button') { add(rrectPts(X, Y, it.w, it.h, it.r), true, FINE, 1, null, 'button'); grow(X, Y, X + it.w, Y + it.h); }
      else if (it.k === 'power') { add(rrectPts(X, Y, 22, 13, 2), true, MAIN, 1, null, 'button'); add(rrectPts(X + 4, Y + 3, 14, 7, 1.2), true, FINE, 0.6, null, 'button'); grow(X, Y, X + 22, Y + 13); }
      else if (it.k === 'tally') { add(circPts(X, Y, 4), true, FINE, 1, null, 'button'); grow(X - 4, Y - 4, X + 4, Y + 4); }
    });
    marks.ctrl = [(cbox[0] + cbox[2]) / 2, (cbox[1] + cbox[3]) / 2];
    /* grille: slots or a checkerboard of dots; in a strip it fills the run left of the controls */
    var g = F.grilles.sets[+K.grille];
    if (g) {
      var gx = AT(g.x, W), gy = ATY(g.y, H), n = g.n, cols = g.cols;
      if (g.fill) { var run = cl - g.clear - gx; if (g.k === 'slots') n = Math.max(0, Math.min(g.n, Math.floor(run / g.gap) + 1)); else cols = Math.max(0, Math.min(g.cols, Math.floor(run / g.gap) + 1)); }
      if (g.k === 'slots') { for (var si = 0; si < n; si++) { if (g.vert) add(linePts(gx + si * g.gap, gy, gx + si * g.gap, gy + g.len), false, FINE, 0.6, null, 'grille'); else add(linePts(gx, gy + si * g.gap, gx + g.len, gy + si * g.gap), false, FINE, 0.6, null, 'grille'); }
        marks.grille = g.vert ? [gx + (n - 1) * g.gap / 2, gy + g.len / 2] : [gx + g.len / 2, gy + (n - 1) * g.gap / 2]; }
      else { for (var ci = 0; ci < cols; ci++) for (var rj = 0; rj < g.rows; rj++) { if ((ci + rj) % 2) continue; dots.push([gx + ci * g.gap, gy + rj * g.gap]); }
        marks.grille = [gx + (cols - 1) * g.gap / 2, gy + (g.rows - 1) * g.gap / 2]; }
    } else marks.grille = F.grilles.mark ? [AT(F.grilles.mark[0], W), ATY(F.grilles.mark[1], H)] : marks.ctrl;
    /* feet: they step in to stay under the flat of the bottom as the corner grows */
    if (F.feet) { var fi = Math.max(F.feet.inset, R + 2), fw = F.feet.w;
      [fi, W - fi - fw].forEach(function (fx) { add([[fx, H], [fx + 3, H + 9], [fx + fw - 3, H + 9], [fx + fw, H]].reduce(function (a, p, i) { if (!i) return [p]; seg(a, p[0], p[1]); return a; }, null), true, FINE, 1, null, 'foot'); }); }
    /* handle */
    if (F.handle && +C.handle === 1) { var hd = F.handle;
      var loop = function (ins, top, rad) { var a = [[ins, 0]]; seg(a, ins, -(top - rad)); quad(a, ins, -top, ins + rad, -top); seg(a, W - ins - rad, -top); quad(a, W - ins, -top, W - ins, -(top - rad)); seg(a, W - ins, 0); return a; };
      add(loop(hd.inset, hd.top, hd.rad), false, MAIN, 1, null, 'handle'); add(loop(hd.inner.inset, hd.inner.top, hd.inner.rad), false, FINE, hd.inner.op, null, 'handle'); }
    /* antenna: stowed along the top, a whip (solid mast, phantom extension), or rabbit ears */
    var an = F.antenna.options[+C.antenna] || {}, m = F.antenna, tip = null;
    if (an.k === 'stowed') { var s0 = Math.max(m.stowed.x0, R + 2), s1 = s0 + (m.stowed.x1 - m.stowed.x0); add(linePts(s0, m.stowed.y, s1, m.stowed.y), false, FINE, m.stowed.op, null, 'ant'); tip = [(s0 + s1) / 2, m.stowed.y]; }
    else if (an.k === 'whip') { var wp = m.whip, side = wp.from === 'L' ? 1 : -1, bx = AT(wp.x, W), lim = side < 0 ? W - R - 2 - wp.base[0] : R + 2;
      if (side < 0 && bx > lim) bx = lim; if (side > 0 && bx < lim) bx = lim;
      var px = bx + wp.base[0] / 2, p1 = [px + wp.v1[0], -wp.base[1] + wp.v1[1]], p2 = [p1[0] + wp.v2[0], p1[1] + wp.v2[1]];
      add(rrectPts(bx, -wp.base[1], wp.base[0], wp.base[1], wp.base[2]), true, FINE, 1, null, 'ant');
      add(linePts(px, -wp.base[1], p1[0], p1[1]), false, wp.solid ? MAIN : FINE, wp.solid ? 0.9 : 0.8, wp.solid ? null : [7, 4], 'ant');
      add(linePts(p1[0], p1[1], p2[0], p2[1]), false, FINE, 0.8, [7, 4], 'ant');
      add(circPts(p2[0], p2[1], 3), true, FINE, 0.8, null, 'ant'); tip = p2; }
    else if (an.k === 'ears') { var e = m.ears, ex = AT(e.x, W), dome = [[ex - 15, 0]]; quad(dome, ex - 15, -11, ex, -11); quad(dome, ex + 15, -11, ex + 15, 0);
      add(dome, false, FINE, 1, null, 'ant');
      [-1, 1].forEach(function (sd) { var a = e.ang * Math.PI / 180, ux = Math.sin(a) * sd, uy = -Math.cos(a), o = [ex + sd * 4, -10], q1 = [o[0] + ux * e.l1, o[1] + uy * e.l1], q2 = [q1[0] + ux * e.l2, q1[1] + uy * e.l2];
        add(linePts(o[0], o[1], q1[0], q1[1]), false, MAIN, 0.9, null, 'ant'); add(linePts(q1[0], q1[1], q2[0], q2[1]), false, FINE, 0.8, [7, 4], 'ant'); add(circPts(q2[0], q2[1], 3), true, FINE, 0.8, null, 'ant');
        if (sd > 0) tip = q2; }); }
    if (!tip) tip = [AT(m.mark || ['R', -73], W), -4];
    marks.ant = tip;
    marks.line = [W * 0.5, H];
    /* bounds of everything drawn, with the main line's half-width */
    var bb = [1e9, 1e9, -1e9, -1e9];
    parts.forEach(function (pt) { pt.p.forEach(function (q) { if (q[0] < bb[0]) bb[0] = q[0]; if (q[1] < bb[1]) bb[1] = q[1]; if (q[0] > bb[2]) bb[2] = q[0]; if (q[1] > bb[3]) bb[3] = q[1]; }); });
    var hw = MAIN * Math.max(1, LINE.weight.range[1]) / 2; bb = [bb[0] - hw, bb[1] - hw, bb[2] + hw, bb[3] + hw];
    return { parts: parts, dots: dots, bb: bb, marks: marks, W: W, H: H };
  }

  /* ---------- the stage: cut to the default set with an even margin, the set scaled to fill it ---------- */
  var DEF = window.ART.params(S.spec, {}), L0 = layout(DEF), MARGIN = 0.09;
  var BW = L0.bb[2] - L0.bb[0], BH = L0.bb[3] - L0.bb[1], M = MARGIN * Math.max(BW, BH) / (1 - 2 * MARGIN), SW = BW + 2 * M, SH = BH + 2 * M;
  S.ref = { w: 1000, h: Math.round(1000 * SH / SW) };
  if (S.panels && S.panels[0]) { S.panels[0].x = 0; S.panels[0].y = 0; S.panels[0].w = 1000; S.panels[0].h = S.ref.h; }
  /* sheet px → stage px: whatever the parameters, the set (antenna and handle included) fills the stage inside the same
     even margin, centered; at the defaults that is the stage's own cut */
  function fit(L, Wd, Hd) { var k0 = Wd / SW, bw = L.bb[2] - L.bb[0], bh = L.bb[3] - L.bb[1], k = Math.min(1.3 * k0, (Wd - 2 * M * k0) / bw, (Hd - 2 * M * k0) / bh);
    return { k: k, ox: (Wd - bw * k) / 2 - L.bb[0] * k, oy: (Hd - bh * k) / 2 - L.bb[1] * k }; }

  /* ---------- callouts: the parts, measured on the drawing; they follow the parameters ---------- */
  var PTS = [['cab', 'CAB', 'Cabinet · rounded rectangle, main line', 'crt-cabinet', [-1, -1]], ['tube', 'TUBE', 'Tube face · four bowed edges', 'crt-screen', [-1, 0]], ['glass', 'GLS', 'Glass lines · faint, crowding to the edge', 'crt-screen', [1, -1]],
    ['ctrl', 'CTRL', 'Controls · ' + F.fits.say, 'crt-controls', [1, -1]], ['grille', 'GRL', 'Grille', 'crt-controls', [1, 1]], ['ant', 'ANT', 'Antenna', 'crt-cabinet', [1, -1]], ['line', 'LINE', 'Line · main 1.5 px, fine 1 px, one ink', 'crt-line', [1, 1]]];
  var PLIVE = null;
  function points(Q, Wd, Hd) { var L = layout(Q), f = fit(L, Wd, Hd); return PTS.map(function (p) { var q = L.marks[p[0]] || [L.W / 2, L.H / 2]; return { u: +((f.ox + q[0] * f.k) / Wd).toFixed(4), v: +((f.oy + q[1] * f.k) / Hd).toFixed(4) }; }); }
  var P0 = points(DEF, 1000, S.ref.h);
  S.points = PTS.map(function (p, i) { return { u: P0[i].u, v: P0[i].v, d: p[1], label: p[2], t: p[3], dir: p[4] }; }).concat([{ u: 0.03, v: 0.04, d: 'GRND', label: 'Ground · the plate’s paper', t: 'figure-ground', dir: [-1, -1] }]);
  S.onPoints = function (P) { PLIVE = P; };
  S.relayPoints = function (ov, fg) { if (!PLIVE) return; var Q = window.ART.params(S.spec, ov || {}), q = points(Q, fg.w || 1000, fg.h || S.ref.h); q.forEach(function (o, i) { if (PLIVE[i]) { PLIVE[i].u = o.u; PLIVE[i].v = o.v; } }); };

  /* ---------- hand: every point of the drawing moves through one smooth seeded field (value noise, two octaves), so lines
     bow as if drawn freehand while joints stay joined and a small circle moves almost as one, staying round ---------- */
  function hash(n, s) { var h = Math.imul((n | 0) ^ Math.imul(s | 0, 0x9E3779B1), 0x85EBCA6B); h ^= h >>> 13; h = Math.imul(h, 0xC2B2AE35); h ^= h >>> 16; return (h >>> 0) / 4294967296 * 2 - 1; }
  function vn(x, y, s) { var i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    var h = function (a, b) { return hash(Math.imul(a, 73856093) ^ Math.imul(b, 19349663), s); };
    return (h(i, j) * (1 - u) + h(i + 1, j) * u) * (1 - v) + (h(i, j + 1) * (1 - u) + h(i + 1, j + 1) * u) * v; }
  var L1 = 70, L2 = 22;
  function field(amp, seed) { return function (p) { var x = p[0], y = p[1];
    return [x + amp * (vn(x / L1, y / L1, seed) + 0.35 * vn(x / L2, y / L2, seed + 5)), y + amp * (vn(x / L1 + 31.7, y / L1 + 11.3, seed + 1) + 0.35 * vn(x / L2 + 7.1, y / L2 + 3.9, seed + 6))]; }; }

  /* ---------- render ---------- */
  S.render = function (canvas, w, h, dpr, V, done, overrides) {
    var Q = window.ART.params(S.spec, overrides || {}), Ln = Q['crt-line'];
    var x = canvas.getContext('2d'), Wd = canvas.width, Hd = canvas.height;
    var paper = V.paper || '#F5F3ED', ink = V.ink || '#1A1A1D', rule = V.rule || ink;
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.fillStyle = paper; x.fillRect(0, 0, Wd, Hd);
    var L = layout(Q), f = fit(L, Wd, Hd), wt = +Ln.weight || 1, hand = Math.max(0, +Ln.hand || 0), seed = (Ln.seed | 0) * 131;
    x.setTransform(f.k, 0, 0, f.k, f.ox, f.oy); x.lineCap = 'round'; x.lineJoin = 'round';
    var move = hand ? field(hand, seed) : null;
    L.parts.forEach(function (pt) {
      var q = move ? pt.p.map(move) : pt.p;
      x.beginPath(); q.forEach(function (p, i) { if (i) x.lineTo(p[0], p[1]); else x.moveTo(p[0], p[1]); }); if (pt.c) x.closePath();
      var glass = pt.tag === 'glass';
      x.strokeStyle = glass ? rule : ink; x.globalAlpha = glass ? 1 : pt.op; x.lineWidth = pt.w * wt;
      x.setLineDash(pt.d ? pt.d.map(function (d) { return d * Math.max(1, wt); }) : []); x.stroke();
    });
    x.setLineDash([]); x.globalAlpha = 0.7; x.fillStyle = ink;
    var dr = 1.1 * Math.sqrt(wt); L.dots.forEach(function (p) { if (move) p = move(p); x.beginPath(); x.arc(p[0], p[1], dr, 0, Math.PI * 2); x.fill(); });
    x.globalAlpha = 1; x.setTransform(1, 0, 0, 1, 0, 0);
    if (done) done();
    return false;
  };
})(window.STUDY);
