/* hands.js · the ribbon held to a hand. Nothing here draws letters: every state is a helix with ST-22's band.
   A hand is a set of exact constraints, in nib widths (the band's own width is the nib):
     x-height, ascender, descender · nib angle · slant · stroke pitch (stroke + counter) · contrast (translation or expansion).
   Seen from the front, the coil is a sine wave: a crest is the x-height, a trough is the baseline. Which crests rise to an
   ascender and which troughs drop to a descender is read off the mindgut wordmark's front view (its skyline), measured
   per downstroke. Downstroke k sits at stroke position X_k with phase ψ_k = π/2 + 2πk (the near side, halfway down). */
"use strict";
const HANDS = (() => {
  const { N, AX, clamp, lerp, ss } = G;
  const D2R = Math.PI / 180, TAU = Math.PI * 2;

  /* the wordmark's 13 downstrokes, measured from its front view (998 × 217 units; column ±5 around each stroke center at y 120) */
  const MG = [
    { x: 24.5, top: 47, bottom: 175, l: 'm' }, { x: 106, top: 47, bottom: 175, l: 'm' }, { x: 187, top: 47, bottom: 175, l: 'm' },
    { x: 251, top: 2, bottom: 175, l: 'i' }, { x: 315.5, top: 47, bottom: 175, l: 'n' }, { x: 398, top: 47, bottom: 175, l: 'n' },
    { x: 456, top: 53, bottom: 169, l: 'd' }, { x: 551.5, top: 2, bottom: 175, l: 'd' }, { x: 613.5, top: 50, bottom: 209, l: 'g' },
    { x: 703.5, top: 47, bottom: 204, l: 'g' }, { x: 770, top: 47, bottom: 175, l: 'u' }, { x: 852, top: 47, bottom: 175, l: 'u' },
    { x: 924, top: 15, bottom: 176, l: 't' }
  ];
  const STEM = 45, XTOP = 47, BASE = 175;            // wordmark units: stem width = the nib
  /* the skyline as a category per stroke: which crest is an ascender, which trough a descender (t's ascender is 0.71 of d's) */
  const SKY = MG.map(s => ({ up: s.top < 30 ? (s.top - XTOP) / (2 - XTOP) : 0, down: s.bottom > 190 ? (s.bottom - BASE) / (209 - BASE) : 0, l: s.l }));
  /* stroke spacing pattern: inside a letter, between letters, bowls */
  const GAPS = MG.slice(1).map((s, i) => { const a = MG[i]; return { wu: s.x - a.x, kind: a.l === s.l ? ((a.l === 'd' || a.l === 'g') ? 'bowl' : 'in') : 'between' }; });

  /* hands: numbers from the cited sources; "derived" marks a value this study had to choose */
  const DEF = [
    { id: 'st22', name: 'ST-22', note: 'p10 defaults', xh: 594 / 180, asc: 0, desc: 0, nib: 0, slant: 0, contrast: 'translation', src: 'ST-22 p10 defaults: coil diameter 594 px, band 180 px, pitch 80 px a turn opening cubically (open .9)' },
    { id: 'mindgut', name: 'Mindgut', note: 'measured from the wordmark', xh: (BASE - XTOP) / STEM, asc: (XTOP - 2) / STEM, desc: (209 - BASE) / STEM, nib: 0, slant: 0, contrast: 'translation', measured: true,
      src: 'wordmark front view: stem 45, x-height 128, ascender 45, descender 34 units; stroke pitch 81.5 to 82.5 inside m, n, u' },
    { id: 'textura', name: 'Textura', note: 'quadrata', xh: 5, asc: 2, desc: 2, nib: 40, slant: 0, counter: 1, between: 1, contrast: 'translation', src: 'lettering-daily.com, Textura Quadrata: x-height 5, ascender 2, descender 2 nib widths; pen 35–45°; counters and letter spaces about 1 nib width' },
    { id: 'foundational', name: 'Foundational', note: 'Johnston', xh: 4, asc: 3, desc: 3, nib: 30, slant: 0, counter: 2, between: 1.5, contrast: 'translation', src: 'Foundational hand: pen about 30°, minim height 4–5, ascenders and descenders 3 nib widths; upright. Counters derived here (round arches)' },
    { id: 'italic', name: 'Italic', note: 'chancery', xh: 5, asc: 4, desc: 4, nib: 45, slant: 7, counter: 1.6, between: 1.2, contrast: 'translation', src: 'x-height 5 nib widths, pen 45°, slant 5–7° (lettering-daily.com; artincontext.org preset 7°, asc/desc 4). Faber-Castell gives pen 35°, asc 2, desc 3. Counters derived here' },
    { id: 'copperplate', name: 'Copperplate', note: 'pointed pen', xh: 2, asc: 3, desc: 3, nib: 0, slant: 35, counter: 1.1, between: 1.1, contrast: 'expansion', src: 'slant 55° from the baseline (35° from vertical); 3:2:3 proportion (Archie’s guide sheets). Spencerian: 52°, connective slant 30°. Pointed pen: width from pressure (Noordzij’s expansion). The ribbon’s width stands in for pressure' }
  ];

  /* lay a hand out on the stage: stroke positions in px, the guide lines, the nib in px */
  const layouts = {};
  function layout(h) {
    if (layouts[h.id]) return layouts[h.id];
    let L;
    if (h.id === 'st22') {
      const R = 675 * G.ST.radius; L = { nib: 180, mid: AX.cy, xtop: AX.cy - R, base: AX.cy + R, asc: AX.cy - R, desc: AX.cy + R, X: [], slant: 0 };
    } else if (h.measured) {
      // the wordmark, at the scale the stage uses for it
      const k = 1.0, ox = 660 - 474 * k, mid = 337;
      const y = v => mid + (v - (XTOP + BASE) / 2) * k;
      L = { nib: STEM * k, mid, xtop: y(XTOP), base: y(BASE), asc: y(2), desc: y(209), X: MG.map(s => ox + s.x * k), slant: 0, k, ox, oy: mid - (XTOP + BASE) / 2 * k };
    } else {
      // gaps in nib widths: stroke width under translation is n·|cos nib|; expansion strokes count as 1
      const sw = h.contrast === 'expansion' ? .9 : Math.abs(Math.cos(h.nib * D2R));
      const g = GAPS.map(a => sw + (a.kind === 'between' ? h.between : a.kind === 'bowl' ? h.counter * 1.5 : h.counter));
      const wN = g.reduce((a, b) => a + b, 0) + (h.xh + h.asc + h.desc) * Math.tan(h.slant * D2R), hN = h.xh + h.asc + h.desc;
      const n = Math.min(900 / wN, 520 / hN), top = 337 - hN * n / 2;
      const xtop = top + h.asc * n, base = xtop + h.xh * n, X = [0]; g.forEach(v => X.push(X[X.length - 1] + v * n));
      const off = 600 - X[X.length - 1] / 2 + 1.6 * n; for (let i = 0; i < X.length; i++) X[i] += off;
      L = { nib: n, mid: (xtop + base) / 2, xtop, base, asc: top, desc: base + h.desc * n, X, slant: h.slant };
    }
    return layouts[h.id] = L;
  }

  /* a hand's helix, per sample: unwrapped phase ψ, axial x, upper and lower amplitude, depth radius, width */
  const geo = {};
  function helix(h) {
    if (geo[h.id]) return geo[h.id];
    const L = layout(h), out = { psi: new Float64Array(N), x: new Float64Array(N), up: new Float64Array(N), dn: new Float64Array(N), mid: L.mid, rz: (L.base - L.xtop) / 2, w: L.nib, nib: h.nib, slant: h.slant, exp: h.contrast === 'expansion' };
    if (h.id === 'st22') {
      const S = G.ST, Wp = 1000, R = 675 * S.radius, bw = Wp * S.band, pitch = Wp * S.pitch, th0 = S.start + .1, th1 = th0 + TAU * S.turns;
      const adv = th => { const t = (th - th0) / TAU; return pitch * (t + S.open * t * t * t); }, span = adv(th1) + bw, a0 = (Wp - span) / 2 + S.shift * Wp + (G.STAGE.w - Wp) / 2;
      for (let i = 0; i < N; i++) { const th = th0 + (th1 - th0) * i / (N - 1); out.psi[i] = th; out.x[i] = a0 + adv(th) + bw / 2; out.up[i] = R; out.dn[i] = R; }
      out.rz = R; out.w = bw; return geo[h.id] = out;
    }
    // stroke k at ψ_k = π/2 + 2πk; a lead-in from the back and a closing turn that opens into the sweep, as ST-22 ends
    const X = L.X, K = X.length, gap0 = X[1] - X[0], gapN = X[K - 1] - X[K - 2];
    const p0 = Math.PI / 2 - 1.25 * Math.PI, p1 = Math.PI / 2 + TAU * (K - 1) + TAU * .85;
    const xAt = p => { const f = (p - Math.PI / 2) / TAU; if (f <= 0) return X[0] + f * gap0; if (f >= K - 1) { const u = f - (K - 1); return X[K - 1] + gapN * (u + .6 * u * u * u); }
      const k = Math.floor(f), t = f - k; return X[k] + (X[k + 1] - X[k]) * t; };
    for (let i = 0; i < N; i++) { const p = p0 + (p1 - p0) * i / (N - 1); out.psi[i] = p; out.x[i] = xAt(p); }
    out.X = X; out.L = L; return geo[h.id] = out;
  }
  /* the skyline as a field over x: crests over a stroke region rise to its ascender, troughs drop to its descender */
  function skyAt(h, x, which) {
    const L = layout(h); if (h.id === 'st22') return 0;
    const X = L.X, n = X.length; let best = 0, wsum = 0;
    for (let k = 0; k < n; k++) { const c = which === 'up' ? X[k] - (k ? (X[k] - X[k - 1]) / 2 : (X[1] - X[0]) / 2) : X[k] + (k < n - 1 ? (X[k + 1] - X[k]) / 2 : (X[k] - X[k - 1]) / 2);
      const half = (k < n - 1 ? X[k + 1] - X[k] : X[k] - X[k - 1]) * .5, d = Math.abs(x - c) / half, w = Math.max(0, 1 - d * d) ** 2;
      const v = which === 'up' ? SKY[k].up : SKY[k].down; best += v * w; wsum += w; }
    return wsum ? best / Math.max(wsum, 1) : 0;
  }
  const byId = id => DEF.find(h => h.id === id);

  /* compose a frame: blend two hands by m, turn the coil by phase (shape turns, stroke slots stay), pick a camera */
  function frame(aId, bId, m, phase, cam, o) {
    o = o || {}; const A = byId(aId), B = byId(bId), ga = helix(A), gb = helix(B), La = layout(A), Lb = layout(B), e = ss(0, 1, m);
    const rot = TAU * (phase || 0), s = new Array(N);
    const mid = lerp(ga.mid, gb.mid, e), rz = lerp(ga.rz, gb.rz, e), slant = lerp(A.slant, B.slant, e) * D2R, nib = lerp(A.nib, B.nib, e) * D2R;
    const upA = (La.mid - La.xtop), dnA = (La.base - La.mid), upB = (Lb.mid - Lb.xtop), dnB = (Lb.base - Lb.mid);
    const ascA = La.xtop - La.asc, ascB = Lb.xtop - Lb.asc, desA = La.desc - La.base, desB = Lb.desc - Lb.base;
    const bx = Math.cos(nib), by = -Math.sin(nib);
    for (let i = 0; i < N; i++) {
      const psi = lerp(ga.psi[i], gb.psi[i], e), x0 = lerp(ga.x[i], gb.x[i], e), q = psi + rot, c = Math.cos(q), sn = Math.sin(q);
      const upa = A.id === 'st22' ? ga.up[i] : upA + ascA * skyAt(A, ga.x[i], 'up'), upb = B.id === 'st22' ? gb.up[i] : upB + ascB * skyAt(B, gb.x[i], 'up');
      const dna = A.id === 'st22' ? ga.dn[i] : dnA + desA * skyAt(A, ga.x[i], 'down'), dnb = B.id === 'st22' ? gb.dn[i] : dnB + desB * skyAt(B, gb.x[i], 'down');
      const amp = c > 0 ? lerp(upa, upb, e) : lerp(dna, dnb, e);
      // the helix leans by its own lead angle (dx/dψ over the amplitude); an oblique cylinder cancels it, so near strokes stand on the slant lines
      const j0 = Math.max(0, i - 1), j1 = Math.min(N - 1, i + 1);
      const leadA = A.id === 'st22' ? 0 : (ga.x[j1] - ga.x[j0]) / ((ga.psi[j1] - ga.psi[j0]) || 1) / ((upa + dna) / 2);
      const leadB = B.id === 'st22' ? 0 : (gb.x[j1] - gb.x[j0]) / ((gb.psi[j1] - gb.psi[j0]) || 1) / ((upb + dnb) / 2);
      const y = mid - amp * c, z = rz * sn, x = x0 + (mid - y) * (Math.tan(slant) + lerp(leadA, leadB, e));
      const wa = ga.exp ? ga.w * (.07 + .93 * Math.pow(Math.max(0, sn), 1.4)) : ga.w, wb = gb.exp ? gb.w * (.07 + .93 * Math.pow(Math.max(0, sn), 1.4)) : gb.w;
      s[i] = { x, y, z, w: lerp(wa, wb, e), bx, by, bz: 0, r: 0, sh: 0, a: 1 };
    }
    // spheres: ST-22's twelve on the axis, which move into the twelve counters between the thirteen downstrokes
    const sa = G.spheres(), Xc = (gb.X || ga.X || []), XcA = ga.X || [];
    const spheres = sa.map((p, k) => { const cb = gb.X ? (gb.X[k] + gb.X[k + 1]) / 2 : p.x, ca = ga.X ? (ga.X[k] + ga.X[k + 1]) / 2 : p.x;
      const r = lerp(ga.X ? La.nib * .36 : p.r, gb.X ? Lb.nib * .36 : p.r, e);
      return Object.assign({}, p, { x: lerp(ca, cb, e), y: mid, z: 0, r }); });
    const st = (A.id === 'st22' ? 1 - e : 0) + (B.id === 'st22' ? e : 0);
    const F = { s, cam: Object.assign({ az: 0, el: 0, persp: .15 }, cam || {}), arcA: st, sphA: o.spheres === false ? 0 : 1, gridA: o.floor === false ? 0 : .35 + .65 * st, markA: 0, markG: 0, ribA: 1, phase: phase || 0, spheres, endGlow: 1,
      guide: { mid, xtop: lerp(La.xtop, Lb.xtop, e), base: lerp(La.base, Lb.base, e), asc: lerp(La.asc, Lb.asc, e), desc: lerp(La.desc, Lb.desc, e), slant, nib, n: lerp(La.nib, Lb.nib, e),
        X: (gb.X && ga.X) ? gb.X.map((v, k) => lerp(ga.X[k], v, e)) : (gb.X ? gb.X.map(v => v) : (ga.X || [])), xh: lerp(A.xh, B.xh, e), ascN: lerp(A.asc, B.asc, e), descN: lerp(A.desc, B.desc, e) },
      hand: { a: A, b: B, m: e } };
    return F;
  }
  return { DEF, MG, SKY, GAPS, layout, helix, frame, byId, skyAt };
})();
