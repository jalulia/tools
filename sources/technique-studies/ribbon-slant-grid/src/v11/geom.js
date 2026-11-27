/* geom.js · one pen path, many states.
   World units are ST-22 plate pixels on a 1200 × 675 stage (the 1000 × 675 plate, extended).
   x right, y down, z toward the viewer. Every state is N samples along one path, so any two states interpolate. */
"use strict";
const G = (() => {
  const N = 1800;
  const STAGE = { w: 1200, h: 675 };
  const AX = { cx: 600, cy: 343 };                       // ST-22: horizon .52 × 675 − 8
  const WM = { k: 0.74, ox: 600 - 499 * 0.74, oy: 343 - 110 * 0.74 };   // wordmark units → stage
  const wm = (x, y) => [WM.ox + x * WM.k, WM.oy + y * WM.k];
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /* ---------- splines ---------- */
  function catmull(pts, m) {                         // pts [[x,y,w],...] → m samples by arc length
    const P = pts.length < 2 ? [pts[0], pts[0]] : pts, dense = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < 24; k++) { const t = k / 24, t2 = t * t, t3 = t2 * t, o = [];
        for (let c = 0; c < p1.length; c++) o.push(.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3));
        dense.push(o); } }
    dense.push(P[P.length - 1].slice());
    return resample(dense, m);
  }
  function resample(d, m) {
    const L = [0]; for (let i = 1; i < d.length; i++) L.push(L[i - 1] + Math.hypot(d[i][0] - d[i - 1][0], d[i][1] - d[i - 1][1], (d[i][2] !== undefined && d[i].length > 3) ? 0 : 0));
    const tot = L[L.length - 1] || 1e-6, out = []; let j = 0;
    for (let i = 0; i < m; i++) { const s = m === 1 ? 0 : i / (m - 1) * tot; while (j < d.length - 2 && L[j + 1] < s) j++;
      const t = (s - L[j]) / ((L[j + 1] - L[j]) || 1e-6), o = []; for (let c = 0; c < d[j].length; c++) o.push(lerp(d[j][c], d[j + 1][c], clamp(t, 0, 1))); out.push(o); }
    return { pts: out, len: tot };
  }

  /* ---------- the word: one pen path, roman and script, in wordmark units (998 × 217, base 176, x-height top 44) ----------
     segments: [pen, roman keypoints, script keypoints]. pen 1 = ink in both; 0 = travel in roman, a join in script; 2 = travel in both.
     Keypoints [x, y, w]: w = stroke weight in wordmark units (stems 45, arches and bowls ~34). Stroke order is a writing order. */
  const SLANT = Math.tan(14 * Math.PI / 180);
  const sl = (p, k) => [p[0] + (176 - p[1]) * SLANT * k, p[1], p[2]];
  const WORD = [
    // m
    [1, [[24.5, 176, 45], [24.5, 120, 45], [25.5, 88, 42], [36, 68, 36], [62, 64, 34], [90, 70, 36], [103, 90, 42], [106, 120, 45], [106, 176, 45]],
        [[20, 176, 42], [24, 140, 42], [30, 96, 40], [44, 70, 34], [64, 66, 30], [84, 76, 32], [94, 104, 40], [98, 140, 42], [100, 176, 42]]],
    [1, [[106, 176, 45], [106, 120, 45]], [[100, 176, 30], [108, 150, 26], [114, 118, 26]]],
    [1, [[106, 120, 45], [108.5, 90, 42], [121, 70, 36], [146, 64, 34], [171, 70, 36], [184, 90, 42], [187, 120, 45], [187, 176, 45]],
        [[114, 118, 26], [122, 84, 32], [140, 66, 30], [160, 68, 32], [172, 96, 40], [176, 140, 42], [178, 176, 42]]],
    // i
    [0, [[187, 176, 45], [251, 176, 45]], [[178, 176, 42], [192, 190, 18], [214, 168, 16], [234, 110, 20], [246, 62, 22]]],
    [1, [[251, 176, 45], [251, 47, 45]], [[246, 62, 22], [248, 47, 30], [250, 110, 40], [252, 176, 42]]],
    // n
    [0, [[251, 47, 45], [315.5, 176, 45]], [[252, 176, 42], [266, 192, 18], [288, 168, 16], [304, 120, 20], [312, 70, 24]]],
    [1, [[315.5, 176, 45], [315.5, 120, 45], [318, 90, 42], [331, 70, 36], [357, 64, 34], [383, 70, 36], [395, 90, 42], [398, 120, 45], [398, 176, 45]],
        [[312, 70, 24], [314, 120, 38], [316, 176, 42], [320, 130, 26], [330, 82, 32], [350, 66, 30], [370, 70, 32], [382, 100, 40], [386, 140, 42], [388, 176, 42]]],
    // d
    [0, [[398, 176, 45], [552, 90, 34]], [[388, 176, 42], [404, 194, 18], [440, 186, 16], [500, 120, 18], [540, 84, 30]]],
    [1, [[552, 90, 34], [540, 71, 34], [503, 63.5, 34], [467, 72, 34], [456, 110, 44], [467, 149, 34], [503, 158.5, 34], [540, 149, 34], [552, 128, 40]],
        [[540, 84, 30], [522, 66, 26], [492, 68, 30], [466, 92, 40], [460, 130, 42], [474, 160, 34], [500, 166, 24], [528, 150, 26], [542, 120, 34]]],
    [1, [[552, 128, 45], [552, 2, 45]], [[542, 120, 30], [552, 70, 26], [566, 22, 20], [572, 4, 22]]],
    [1, [[552, 2, 45], [552, 176, 45]], [[572, 4, 22], [560, 14, 30], [552, 80, 42], [548, 140, 44], [550, 176, 42]]],
    // g
    [0, [[552, 176, 45], [703, 90, 34]], [[550, 176, 42], [566, 194, 18], [604, 184, 16], [656, 120, 18], [690, 84, 30]]],
    [1, [[703, 90, 34], [691, 70, 32], [658, 62, 32], [625, 70, 32], [613, 104, 44], [625, 138, 32], [658, 146, 32], [691, 138, 32], [703, 118, 40]],
        [[690, 84, 30], [672, 66, 26], [644, 68, 30], [620, 90, 40], [616, 124, 42], [630, 150, 34], [654, 156, 24], [680, 140, 26], [694, 112, 34]]],
    [1, [[703, 118, 45], [703, 47, 45]], [[694, 112, 30], [700, 80, 26], [704, 52, 26]]],
    [1, [[703, 47, 45], [703, 165, 45], [697, 187, 40], [679, 197, 34], [652, 198, 32], [624, 194, 32], [604, 190, 34]],
        [[704, 52, 26], [700, 120, 44], [692, 182, 44], [676, 212, 34], [648, 214, 24], [632, 198, 20], [648, 182, 20], [690, 172, 18], [726, 166, 18]]],
    // u
    [0, [[604, 190, 34], [770, 47, 45]], [[726, 166, 18], [744, 138, 18], [758, 96, 22], [764, 62, 24]]],
    [1, [[770, 47, 45], [770, 110, 45], [773, 132, 42], [787, 150, 36], [811, 155.5, 34], [835, 150, 36], [849, 132, 42], [852, 110, 45]],
        [[764, 62, 24], [764, 110, 40], [766, 146, 40], [778, 168, 30], [800, 170, 24], [820, 154, 28], [832, 120, 32], [836, 66, 24]]],
    [1, [[852, 110, 45], [852, 47, 45]], [[836, 66, 24], [838, 58, 26], [840, 52, 28]]],
    [1, [[852, 47, 45], [852, 176, 45]], [[840, 52, 28], [838, 110, 42], [840, 176, 42]]],
    // t
    [0, [[852, 176, 45], [924, 15, 45]], [[840, 176, 42], [856, 192, 18], [880, 160, 16], [902, 70, 20], [914, 18, 22]]],
    [1, [[924, 15, 45], [924, 118, 45], [928, 144, 40], [944, 156, 34], [975, 156, 34]],
        [[914, 18, 22], [910, 80, 40], [906, 140, 44], [916, 172, 34], [944, 174, 24], [968, 156, 20]]],
    [2, [[975, 156, 34], [887, 64.5, 34]], [[968, 156, 20], [876, 70, 20]]],
    [1, [[887, 64.5, 34], [976, 64.5, 34]], [[876, 70, 20], [930, 62, 18], [978, 52, 18]]],
    // tittle: the one dot
    [2, [[976, 64.5, 34], [245, 19, 34]], [[978, 52, 18], [247, 2, 18]]],
    [1, [[245, 19, 34], [258, 19, 34]], [[247, 2, 30], [256, 14, 30]]]
  ];
  // script: slanted and set a little tighter than the roman
  const SCX = .88, SCC = 499;
  const scriptPt = p => { const q = sl(p, 1); return [SCC + (q[0] - SCC) * SCX, q[1], q[2]]; };

  /* sample counts per segment ∝ the longer of its two lengths */
  const segLen = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
  function buildWord() {
    const lens = WORD.map(s => Math.max(segLen(s[1]), segLen(s[2].map(scriptPt)), 1) * (s[0] === 2 ? .35 : 1));
    const tot = lens.reduce((a, b) => a + b, 0);
    let cnt = lens.map(l => Math.max(4, Math.round(l / tot * N))), d = N - cnt.reduce((a, b) => a + b, 0);
    cnt[cnt.indexOf(Math.max(...cnt))] += d;
    const roman = [], script = [], seg = [];
    WORD.forEach((s, i) => { const r = catmull(s[1], cnt[i]).pts, c = catmull(s[2].map(scriptPt), cnt[i]).pts;
      for (let k = 0; k < cnt[i]; k++) { roman.push({ x: r[k][0], y: r[k][1], w: r[k][2], pen: s[0] === 1 ? 1 : 0 }); script.push({ x: c[k][0], y: c[k][1], w: c[k][2], pen: s[0] === 2 ? 0 : 1 }); seg.push(i); } });
    return { roman, script, seg };
  }
  const W0 = buildWord();
  // the letter each sample belongs to
  const LETTER_OF_SEG = [0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 1, 1];
  const letterOf = i => LETTER_OF_SEG[W0.seg[i]];

  /* ---------- ST-22 coil, as measured (defaults), on the extended stage ---------- */
  const ST = { turns: 1.85, radius: .44, band: .18, pitch: .08, open: .9, start: 2.6, shift: .04, persp: .4 };
  function coil(phase, o) {
    o = Object.assign({}, ST, o || {});
    const H = 675, Wp = 1000, R = H * o.radius, bw = Wp * o.band, pitch = Wp * o.pitch;
    const th0 = o.start + .1, th1 = th0 + 6.2832 * o.turns, rot = 6.2832 * (phase || 0);
    const adv = th => { const t = (th - th0) / 6.2832; return pitch * (t + o.open * t * t * t); };
    const span = adv(th1) + bw, a0 = (Wp - span) / 2 + o.shift * Wp + (STAGE.w - Wp) / 2;
    const out = [];
    for (let i = 0; i < N; i++) { const th = th0 + (th1 - th0) * i / (N - 1), thr = th + rot;
      out.push({ x: a0 + adv(th) + bw / 2, y: AX.cy - R * Math.cos(thr), z: R * Math.sin(thr), w: bw, bx: 1, by: 0, bz: 0, pen: 1 }); }
    return { pts: out, R, F: R * lerp(12, 2.2, o.persp) };
  }
  /* light helices on the same axis (p10's arcs, seed 7) */
  function hashI(x, y, s) { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; }
  function arcs(phase, seed) {
    seed = seed || 7; const H = 675, Wp = 1000, R = H * ST.radius, pitch = Wp * ST.pitch, bw = Wp * ST.band, rot = 6.2832 * (phase || 0);
    const th0 = ST.start + .1, th1 = th0 + 6.2832 * ST.turns, adv = th => { const t = (th - th0) / 6.2832; return pitch * (t + ST.open * t * t * t); };
    const span = adv(th1) + bw, a0 = (Wp - span) / 2 + ST.shift * Wp + (STAGE.w - Wp) / 2, out = [];
    for (let k = 0; k < 3; k++) { const s = seed + 9, ra = R * (.86 + .15 * hashI(k, 1, s)), ph = (hashI(k, 2, s) - .5) * .8, pa = pitch * (1.6 + 1.2 * hashI(k, 4, s)),
        xap = a0 + (k + .02 + .2 * hashI(k, 5, s)) / 3 * span, ta = 6.2832 * (.6 + .4 * hashI(k, 6, s)), bright = .65 + .5 * hashI(k, 8, s), gate = (hashI(k, 10, s) - .5) * 2.5, pts = [];
      for (let n = 0; n <= 160; n++) { const th = ph + ta * (n / 160 - .5), tt = th / 6.2832, thr = th + rot * 1.5;
        const env = (.3 + .7 * Math.pow(.5 + .5 * Math.cos(thr - gate), 1.2)) * Math.pow(Math.max(0, Math.sin(Math.PI * n / 160)), .5) * bright;
        pts.push({ x: xap + pa * tt * (1 + ST.open * Math.abs(tt) * .5), y: AX.cy - ra * Math.cos(thr), z: ra * Math.sin(thr), e: env }); }
      out.push({ col: (k + 2) % 3, pts }); }
    return out;
  }
  /* spheres on the axis (p10: 78 px apart, r 18) */
  function spheres(seed) { seed = seed || 7; const out = [], sx0 = 78 * (.6 + .2 * .5) + (STAGE.w - 1000) / 2;
    const c0 = Math.floor(hashI(1, 7, seed) * 5);
    for (let k = 0; k < 12; k++) out.push({ x: sx0 + k * 78, y: AX.cy + (hashI(k, 3, seed) - .5) * 2, z: 0, r: 18, col: (k + c0) % 5, dim: .86 + .14 * hashI(k, 11, seed) });
    return out; }

  /* ---------- the wordmark's own outline (traced vector, 14 contours; the ® is left out of the ribbon) ---------- */
  function contours(d) {
    const out = []; let cur = null, x = 0, y = 0; const re = /([MCLZ])([^MCLZ]*)/g; let m;
    while ((m = re.exec(d))) { const c = m[1], v = m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
      if (c === 'M') { cur = [[v[0], v[1]]]; out.push(cur); x = v[0]; y = v[1]; }
      else if (c === 'L') { for (let i = 0; i < v.length; i += 2) { x = v[i]; y = v[i + 1]; cur.push([x, y]); } }
      else if (c === 'C') { for (let i = 0; i < v.length; i += 6) { const [x1, y1, x2, y2, x3, y3] = v.slice(i, i + 6);
          for (let k = 1; k <= 4; k++) { const t = k / 4, u = 1 - t; cur.push([u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]); }
          x = x3; y = y3; } }
      else if (c === 'Z') { if (cur && cur.length) cur.push(cur[0].slice()); } }
    return out;
  }
  let OUTLINE = null;
  function outline(d) {
    if (OUTLINE) return OUTLINE;
    const cs = contours(d).filter(c => Math.min(...c.map(p => p[0])) < 977);
    cs.sort((a, b) => Math.min(...a.map(p => p[0])) - Math.min(...b.map(p => p[0])));
    // orient every contour so the band's outward side faces out of the letter: outer contours clockwise on screen, counters the other way
    const area = c => { let s = 0; for (let i = 0; i < c.length - 1; i++) s += c[i][0] * c[i + 1][1] - c[i + 1][0] * c[i][1]; return s / 2; };
    const lens = cs.map(segLen), travel = 24, tot = lens.reduce((a, b) => a + b, 0) + travel * (cs.length - 1);
    const inside = (q, c) => { let k = false; for (let i = 0, j = c.length - 1; i < c.length; j = i++) { const a = c[i], b = c[j];
      if ((a[1] > q[1]) !== (b[1] > q[1]) && q[0] < (b[0] - a[0]) * (q[1] - a[1]) / (b[1] - a[1]) + a[0]) k = !k; } return k; };
    /* flip: the band's normal (b × T with b = +z) must face away from the ink: out of an outer contour, into a counter */
    const flips = cs.map((c, ci) => { const hole = cs.some((o, oi) => oi !== ci && inside(c[0], o));
      const i = Math.floor(c.length / 3), a = c[i], b = c[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, T = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
      const q = [(a[0] + b[0]) / 2 - T[1] * 1.5, (a[1] + b[1]) / 2 + T[0] * 1.5], qin = inside(q, c);
      return hole ? !qin : qin; });
    const pts = []; let used = 0;
    cs.forEach((c, ci) => { const n = ci === cs.length - 1 ? N - used : Math.round(lens[ci] / tot * N);
      const r = resample(c, Math.max(8, n)).pts; r.forEach(p => pts.push({ x: p[0], y: p[1], pen: 1, ring: ci, flip: flips[ci] }));
      used += r.length;
      if (ci < cs.length - 1) { const tn = Math.max(2, Math.round(travel / tot * N)); const a = c[c.length - 1], b = cs[ci + 1][0];
        for (let k = 1; k <= tn && used < N - 8; k++) { const t = k / (tn + 1); pts.push({ x: lerp(a[0], b[0], t), y: lerp(a[1], b[1], t), pen: 0, ring: -1 }); used++; } } });
    while (pts.length > N) pts.pop(); while (pts.length < N) pts.push(Object.assign({}, pts[pts.length - 1], { pen: 0 }));
    OUTLINE = pts; return pts;
  }

  return { N, STAGE, AX, WM, wm, clamp, lerp, ss, ease, W0, letterOf, coil, arcs, spheres, outline, contours, hashI, ST, SLANT, WORD };
})();
if (typeof module !== 'undefined') module.exports = G;
