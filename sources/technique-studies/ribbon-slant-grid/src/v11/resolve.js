/* resolve.js · ST-22's ribbon, as it is, resolving into the mindgut wordmark.
   Two trajectories, each starting on ST-22's still (p10 defaults, Emerald) and each ending on the real wordmark, by a different mechanism:
     01 Cut       the ribbon is a designspace with two masters (ST-22, and the same band registered to the wordmark's m). Interpolating
                  REG turns ST-22's 1.85 turns into the m's arcade; the light helices become the word's guide lines and skyline; the
                  spheres take the counters and the tittle. Then two substitutions at matched shape: the score becomes "indgut", the
                  arcade becomes the m. No pixel of the mark is faded, wiped or masked in.
     02 Parallax  the ribbon never changes. The camera pulls back and swings; the wordmark's letters stand at different depths, sized so
                  that from one viewpoint (the hit point) they project to the wordmark exactly. The ribbon ends beside the word, never on it.
   World units are ST-22 stage pixels. The wordmark is 998 × 217 units; letters split at the gaps measured from its outline. */
"use strict";
const RES = (() => {
  const { N, AX, clamp, lerp, ss } = G; const TAU = Math.PI * 2;
  const outC = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3), inOut = t => { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const bump = (t, a, b) => { const u = clamp((t - a) / (b - a), 0, 1); return Math.sin(Math.PI * u) ** 2; };     // 0 → 1 → 0

  /* the wordmark, measured from its outline (units) */
  const LET = [{ l: 'm', u0: 0, u1: 219 }, { l: 'i', u0: 219, u1: 284 }, { l: 'n', u0: 284, u1: 427 }, { l: 'd', u0: 427, u1: 581 },
               { l: 'g', u0: 581, u1: 738 }, { l: 'u', u0: 738, u1: 881 }, { l: 't', u0: 881, u1: 977.3 }, { l: '®', u0: 977.3, u1: 998 }];
  const XTOP = 47, BASE = 175, STEM = 45, MID = (XTOP + BASE) / 2, TIT = { x: 251.4, y: 19, r: 17 };
  const MSTEMS = [24.5, 106, 187];                                   // the m's three stems (HANDS.MG)
  const SKY = [[106, 175], [251.4, 2.3], [398, 175], [551.5, 2.3], [613.5, 209], [658.5, 47], [703.5, 204], [924, 14.9]];   // front-view extrema: crest, trough, …
  const COUNTERS = HANDS.MG.slice(1).map((s, k) => (HANDS.MG[k].x + s.x) / 2);

  /* ---------- 01 · Cut ---------- */
  const W1 = { k: 1, ox: AX.cx - 499, oy: AX.cy - MID };            // the wordmark in world units for Cut: centered on ST-22's axis
  const wp = (u, v, W) => [W.ox + u * W.k, W.oy + v * W.k];

  // master A: ST-22 as it is
  const A = (() => { const h = HANDS.helix(HANDS.byId('st22')); return { psi: h.psi, x: h.x, mid: AX.cy, amp: h.up[0], rz: h.rz, w: h.w, lead: new Float64Array(N) }; })();
  // master B: the same band registered to the m: stroke k at ψ = π/2 + 2πk over stem k; from the m's x-height (ψ = 0) to its baseline after the third stem (ψ = 5π)
  /* master B: the same band registered on the m, as a written m. The coil's axis yaws by YAW so that, seen straight on, the helix is a
     cycloid (tan YAW = pitch / 2πr): cusped feet where the downstroke retraces into the next upstroke, round crests (overturns), triangular
     gaps between them. It opens at the baseline with an overturn and takes the m's three stems as three overturns (stroke k at ψ = 5π/2 + 2πk),
     ending at the last foot, lit like ST-22's cut end (brush-lettering m construction, loveleighloops.com). The camera stays orthographic. */
  const B = (() => { const k = W1.k, X = MSTEMS.map(x => W1.ox + x * k), g = (X[2] - X[0]) / 2, amp = (BASE - XTOP) / 2 * k;
    const psi = new Float64Array(N), x = new Float64Array(N), p0 = Math.PI, p1 = 7 * Math.PI;
    for (let i = 0; i < N; i++) { const p = p0 + (p1 - p0) * i / (N - 1), f = (p - 2.5 * Math.PI) / TAU; psi[i] = p; x[i] = X[0] + f * g; }
    return { psi, x, mid: W1.oy + MID * k, amp, rz: amp, w: STEM * k, X, cx: X[1], yaw: Math.asin(g / (TAU * amp)) }; })();      // sin YAW = stem spacing / 2πr (cusp condition)

  const NIB = 0;
  function band(reg, phase) {
    const e = reg, rot = TAU * phase, s = new Array(N), mid = lerp(A.mid, B.mid, e), amp = lerp(A.amp, B.amp, e), rz = lerp(A.rz, B.rz, e), w = lerp(A.w, B.w, e);
    const yw = B.yaw * e, cy = Math.cos(yw), sy = Math.sin(yw), bx = cy, bz = -sy;
    for (let i = 0; i < N; i++) { const q = lerp(A.psi[i], B.psi[i], e) + rot, y = mid - amp * Math.cos(q), z0 = rz * Math.sin(q);
      // yaw about the m's middle stem; the axial map is pre-scaled and offset so the near strokes still land on the stems
      const xa = lerp(A.x[i], B.x[i], e), dx = (xa - B.cx) / cy - rz * sy * e / cy * 0;
      const xr = B.cx + dx * cy + z0 * sy - rz * sy, zr = -dx * sy + z0 * cy;
      s[i] = { x: lerp(xa, xr, e), y, z: lerp(z0, zr, e), w, bx, by: 0, bz, r: 0, sh: 0, a: 1 }; }
    return s;
  }
  /* light helices: ST-22's three (p10, seed 7) → the word's skyline and its two guide lines */
  function skyline(n, rot) {      // front view: half-cosines between measured extrema; depth turns half a turn per extremum
    const k = W1.k, P = SKY.map(([u, v]) => wp(u, v, W1)), segs = P.length - 1, out = [];
    for (let j = 0; j < n; j++) { const f = j / (n - 1) * segs, a = Math.min(segs - 1, Math.floor(f)), t = f - a, p = P[a], q = P[a + 1];
      const y = p[1] + (q[1] - p[1]) * (1 - Math.cos(Math.PI * t)) / 2, z = 26 * k * Math.sin(Math.PI * (a + t) + rot);
      out.push({ x: lerp(p[0], q[0], t), y, z, e: .95 * Math.min(1, j / 12, (n - 1 - j) / 12) }); }
    return out;
  }
  function rule(n, v, rot) {      // a guide line: a helix of radius 5 around the line, so it still catches light
    const a = wp(-10, v, W1), b = wp(990, v, W1), out = [];
    for (let j = 0; j < n; j++) { const t = j / (n - 1), th = TAU * 9 * t + rot;
      out.push({ x: lerp(a[0], b[0], t), y: a[1] - 5 * Math.cos(th), z: 5 * Math.sin(th), e: .55 * Math.min(1, j / 10, (n - 1 - j) / 10) }); }
    return out;
  }
  function arcs(reg, phase, lag) {
    const src = G.arcs(phase), rot = TAU * phase * 1.5;
    const tgt = [skyline(src[0].pts.length, rot), rule(src[1].pts.length, XTOP, rot), rule(src[2].pts.length, BASE, rot)];
    // each light travels into its line left to right, as if drawn: point i turns over a window that moves along the arc
    return src.map((A0, j) => { const T = tgt[j], n = A0.pts.length, r = clamp((reg - lag * j) / (1 - lag * 2), 0, 1) * 1.45;
      return { col: A0.col, pts: A0.pts.map((p, i) => { const e = inOut(clamp(r - .45 * i / (n - 1), 0, 1)), ez = 1 - (1 - e) * (1 - e);
        return { x: lerp(p.x, T[i].x, e), y: lerp(p.y, T[i].y, e), z: lerp(p.z, T[i].z, ez), e: lerp(p.e, T[i].e, e) }; }) }; });
  }
  /* spheres: ST-22's twelve on the axis → positive parts of the word only: the ten strokes outside the m (at mid x-height, inside the
     stem), the tittle and the ®. Each sphere sits on ink, so at the cut every one has a letter part under it. */
  const SPOTS = [[251, MID, 14], [315.5, MID, 14], [398, MID, 14], [456, MID, 14], [551.5, MID, 14], [613.5, MID, 14], [703.5, MID, 14], [770, MID, 14], [852, MID, 14], [924, MID, 14], [TIT.x, TIT.y, 14], [986.5, 22.5, 7]];
  function spheres(reg) {
    return G.spheres().map((p, k) => { const e = inOut(clamp((reg - .04 * k) / (1 - .04 * 11), 0, 1)), [tx, ty, tr] = SPOTS[k], q = wp(tx, ty, W1);
      return Object.assign({}, p, { x: lerp(p.x, q[0], e), y: lerp(p.y, q[1], e), z: 0, r: lerp(p.r, tr * W1.k, e), dim: lerp(p.dim, 1, e) }); });
  }
  const cards = (W, which, depth) => LET.filter(L => which.includes(L.l)).map(L => ({ u0: L.u0, u1: L.u1, ox: W.ox, oy: W.oy, k: W.k, z: depth ? depth(L) : 0, px: W.px, py: W.py, F: W.F }));

  /* the camera that keeps the ribbon large while it registers: zoom so the band fills about 70 % of the height, centered on it */
  const track = e => { const H = 2 * lerp(A.amp, B.amp, e) + B.w * .3 * e, cx = lerp(AX.cx, B.cx, e);
    return { zoom: Math.min(3.3, Math.max(1, lerp(1, .7 * 675 / H, Math.min(1, e * 3)))), shift: cx - AX.cx }; };
  const FPS = 12;
  /* master C: the wordmark's m as a written stroke, its own skeleton (ductus): stem 1 up, arch, stem 2 down, back up the stem, arch,
     stem 3 down. Stems 45, arches 34 at the apex (units), measured from the outline. Sampled at the same 1800 points as the ribbon, with
     landmarks matched one to one: each turn of the ribbon has a stroke of the letter to land on (entry → stem 1 up, first downstroke →
     stem 1 down, crest 2 → arch 1's apex, foot 2 → stem 2's foot, crest 3 → arch 2's apex, last foot → stem 3's foot). */
  const MPATH = [
    [[24.5, 176, 45], [24.5, 47, 45]],                                                   // stem 1 up to its flat top (the ribbon's entry)
    [[24.5, 47, 45], [24.5, 176, 45]],                                                   // and down again (the ribbon's first downstroke)
    [[24.5, 176, 45], [24.5, 130, 45], [25, 96, 44], [31, 76, 40], [44, 66, 36], [62, 64, 34], [80, 66, 36], [96, 76, 40], [104, 96, 44], [106, 130, 45], [106, 176, 45]],
    [[106, 176, 45], [106, 130, 45]],
    [[106, 130, 45], [107, 96, 44], [113, 76, 40], [126, 66, 36], [146, 64, 34], [164, 66, 36], [178, 76, 40], [185, 96, 44], [187, 130, 45], [187, 176, 45]]];
  const C = (() => {
    const dense = []; MPATH.forEach((seg, k) => {
      for (let i = 0; i < seg.length - 1; i++) { const p0 = seg[Math.max(0, i - 1)], p1 = seg[i], p2 = seg[i + 1], p3 = seg[Math.min(seg.length - 1, i + 2)];
        for (let q = 0; q < 24; q++) { const t = q / 24, t2 = t * t, t3 = t2 * t, o = [];
          for (let c = 0; c < 3; c++) o.push(.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3));
          if (!(k > 0 && i === 0 && q === 0)) dense.push(o); } } dense.push(seg[seg.length - 1].slice()); });
    const L = [0]; for (let i = 1; i < dense.length; i++) L.push(L[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
    const at = s => { let j = 0; while (j < L.length - 2 && L[j + 1] < s) j++; const t = clamp((s - L[j]) / ((L[j + 1] - L[j]) || 1), 0, 1), a = dense[j], b = dense[j + 1];
      return { x: lerp(a[0], b[0], t), y: lerp(a[1], b[1], t), w: lerp(a[2], b[2], t), tx: b[0] - a[0], ty: b[1] - a[1] }; };
    const near = (x, y) => { let best = 0, bd = 1e9; dense.forEach((p, i) => { const d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; best = i; } }); return L[best]; };
    const lenA = L[dense.length - 1];
    // landmark arc positions on the letter (shoulder, apexes, foot of stem 2)
    const sTop1 = 129, sFoot1 = 258;                                                      // stem 1 is 129 units tall: up, then down
    const sApex1 = near(62, 64), sFoot2 = L[dense.findIndex((p, i) => i > 0 && L[i] > sApex1 && Math.abs(p[0] - 106) < .6 && Math.abs(p[1] - 176) < .6)] || near(106, 176), sApex2 = near(146, 64);
    const KNOT = [[Math.PI, 0], [2 * Math.PI, sTop1], [3 * Math.PI, sFoot1], [4 * Math.PI, sApex1], [5 * Math.PI, sFoot2], [6 * Math.PI, sApex2], [7 * Math.PI, lenA]];
    const map = psi => { let k = 0; while (k < KNOT.length - 2 && KNOT[k + 1][0] < psi) k++; const [p0, s0] = KNOT[k], [p1, s1] = KNOT[k + 1]; return s0 + (s1 - s0) * clamp((psi - p0) / (p1 - p0), 0, 1); };
    const out = []; for (let i = 0; i < N; i++) { const q = at(map(B.psi[i])), l = Math.hypot(q.tx, q.ty) || 1, w = wp(q.x, q.y, W1);
      out.push({ x: w[0], y: w[1], w: q.w * W1.k, bx: q.ty / l, by: -q.tx / l, s: map(B.psi[i]) / lenA }); }    // b × T faces the viewer: every stroke lands face-up
    return out; })();

  /* the ribbon's m flowing into the letter's m. e(i) in 0…1 per sample (1 = on the letter; a little past 1 overshoots), ink(i) 0…1 */
  function morph(base, e, ink) {
    return base.map((p, i) => { const c = C[i], k = e(i, p), kk = clamp(k, 0, 1), z = p.z * (1 - kk) * (1 - kk);
      // where the band must turn over to land face-up, it rolls through edge-on (Noordzij's rotation) instead of shrinking through zero
      const dt = p.bx * c.bx + p.by * c.by, roll = dt < 0 ? Math.sin(Math.PI * kk) * -dt : 0;
      let bx = lerp(p.bx, c.bx, kk), by = lerp(p.by, c.by, kk), bz = lerp(p.bz, 0, kk) + roll; const bl = Math.hypot(bx, by, bz) || 1;
      return { x: lerp(p.x, c.x, k), y: lerp(p.y, c.y, k), z, w: lerp(p.w, c.w, kk), bx: bx / bl, by: by / bl, bz: bz / bl, r: kk, sh: 0, a: 1, wt: ink(i, p) }; });
  }
  /* three ways to go from the ribbon's m to the letter's m, all inside the same camera pull-back */
  const M0 = 52 / FPS, M1 = 64 / FPS, SWAP = 66 / FPS;
  const VARIANTS = {
    // 01 · Ductus: the whole band flows onto the letter's skeleton at once (Noordzij: translation to expansion), then inks
    ductus: T => { const u = clamp((T - M0) / (M1 - M0), 0, 1), w = clamp((T - (M1 - 2 / FPS)) / (4 / FPS), 0, 1);
      return { e: i => inOut(clamp(u * 1.15 - .15 * C[i].s, 0, 1)), ink: () => inOut(w) }; },
    // 02 · Write: a front runs along the stroke in writing order; behind it the band is on the letter, and the ink follows three frames later
    write: T => { const f = clamp((T - M0) / (M1 - M0), 0, 1) * 1.35;
      return { e: i => inOut(clamp((f - C[i].s) / .35, 0, 1)), ink: i => inOut(clamp((f - .25 - C[i].s) / .35 + .15, 0, 1)) }; },
    // 03 · Press: a press line crosses the m left to right; under it each part snaps flat onto the letter with a damped spring, and prints
    press: T => { const u = clamp((T - M0) / (M1 - M0), 0, 1), X = lerp(-60, 260, u);
      const spring = v => v <= 0 ? 0 : v >= 1.6 ? 1 : 1 - Math.exp(-4.2 * v) * Math.cos(5.4 * v) * (1 - v / 1.6);
      return { e: (i, p) => spring((W1.ox + X * W1.k - p.x) / (70 * W1.k)), ink: (i, p) => inOut(clamp((W1.ox + (X - 70) * W1.k - p.x) / (50 * W1.k), 0, 1)) }; }
  };
  function cut(t, dur, vid) {
    const T = t * dur, fr = T * FPS, V = VARIANTS[vid] || VARIANTS.ductus;
    const reg = inOut(clamp((T - 1.0) / 2.83, 0, 1));                                     // 1.0 → 3.83 s (frame 46)
    const C1 = 52 / FPS, D0 = 46 / FPS, D1 = 68 / FPS;                                    // cut 1 on frame 52; one dolly carries everything after (46 → 68)
    const phase = T < .5 ? 0 : T < M1 ? 2 * outC((T - .5) / (M1 - .5)) : 2;               // the coil lands on a whole turn as the morph ends
    const ant = bump(T, .5, 1.0) * 4, sw = bump(T, 1.0, 3.83), tr = track(reg);
    const d = inOut(clamp((T - D0) / (D1 - D0), 0, 1)), endZ = .84;                       // the carrier: pull back from the m to the whole word
    const cam = { az: ant - 18 * sw, el: 8 * sw, persp: lerp(.4, 0, inOut(clamp((T - 1.0) / 2.83, 0, 1))) + .1 * sw,
      zoom: Math.exp(lerp(Math.log(tr.zoom), Math.log(endZ), d)) * (1 + .015 * bump(T, .5, 1.0)), shift: lerp(tr.shift, 0, d) };
    const base = band(reg, phase), m = V(T), S = T < M0 ? base : morph(base, m.e, m.ink);
    const stage = T < 1.0 ? 'still' : T < D0 ? 'approach' : T < C1 ? 'pull back' : T < M0 + 1 / FPS ? 'script m' : T < M1 ? 'flowing to the m' : T < SWAP ? 'inked' : T < D1 ? 'mark, settling' : 'mark';
    const F = { s: S, cam, phase, ribA: T < SWAP ? 1 : 0, endGlow: T < M0 ? 1 : 0, arcA: T < C1 ? 1 : 0, sphA: T < C1 ? 1 : 0, gridA: lerp(1, .5, reg),
      arcs: arcs(reg, phase, .08), spheres: spheres(reg), markA: 0, planeA: 0,
      cards: T >= SWAP ? cards(W1, 'mindgut®') : T >= C1 ? cards(W1, 'indgut®') : null };
    const fm = T < M0 ? 0 : S.reduce((a, p) => a + p.r, 0) / S.length;
    F.res = { time: T, frame: Math.floor(fr + 1e-6), reg, form: fm, turns: lerp(1.85, 3, reg), az: cam.az, el: cam.el, persp: cam.persp, zoom: cam.zoom, stage };
    return F;
  }
  /* the FORM axis as a still: ribbon m (0) → letter m (1), front orthographic, at the m's own zoom */
  function form(v) { const tr = track(1), S = morph(band(1, 2), () => v, () => 0);
    return { s: S, cam: { az: 0, el: 0, persp: 0, zoom: tr.zoom * .8, shift: tr.shift }, phase: 2, ribA: 1, endGlow: 0, arcA: 0, sphA: 0, gridA: .5, markA: 0, planeA: 0, res: { form: v } }; }

  /* ---------- 02 · Parallax ---------- */
  // the lockup at the hit point: ST-22's ribbon (world 137…1032 × 46…640) beside the word; word height = 0.9 × the ribbon's
  const SYM = { x0: 137, x1: 1032, y0: 46, y1: 640 }, KW = .74 * (SYM.y1 - SYM.y0) / (214.1 - 2.3), GAP = .7 * (BASE - XTOP) * KW;
  const W2 = { k: KW, ox: SYM.x1 + GAP, oy: AX.cy - MID * KW };
  const LOCKC = { x: (SYM.x0 + W2.ox + 977 * KW) / 2, y: AX.cy }, LOCKW = W2.ox + 977 * KW - SYM.x0;
  const HIT = { az: 0, el: 0, persp: .4, zoom: .82 * 1200 / LOCKW };                  // the hit point is ST-22's own camera, pulled back
  /* the word in fifteen pieces, cut by its own construction (Channel 4 cut its 4 by its parts): the thirteen strokes, the tittle and the ®.
     Each stands at its own depth; all drift together on one vector, so they read as one object coming apart, not as debris. */
  const PIECES = [[0, 65], [65, 146], [146, 219], [219, 284, 40, 217], [219, 284, 0, 40], [284, 357], [357, 427], [427, 503], [503, 581], [581, 658], [658, 738], [738, 811], [811, 881], [881, 977.3], [977.3, 998]];
  const PZ = [700, -380, 260, -820, 900, 140, -560, 480, -240, 820, -700, 360, -960, 600, 600];
  const SHARDS = PIECES.map(([u0, u1, v0, v1], k) => ({ u0, u1, v0: v0 === undefined ? 0 : v0, v1: v1 === undefined ? 217 : v1, z: PZ[k] }));
  function parallax(t, dur) {
    const T = t * dur, H0 = 1.0, H1 = 5.0, P0 = 5.6, P1 = 6.8;                            // swing to the hit 1.0 → 5.0; lockup beat; carry to the word 5.6 → 6.8; hold
    const u = clamp((T - H0) / (H1 - H0), 0, 1), e = inOut(u), ant = bump(T, .5, 1.0) * 4, sw = Math.sin(Math.PI * outC(u)) ** 2 * (u < 1 ? 1 : 0);
    const p = inOut(clamp((T - P0) / (P1 - P0), 0, 1)), wordZ = .72 * 1200 / (977 * KW), wordC = W2.ox + 489 * KW;
    const zoom = Math.exp(lerp(lerp(0, Math.log(HIT.zoom), e), Math.log(wordZ), p)) * (1 + .015 * bump(T, .5, 1.0));
    const px = lerp(AX.cx, LOCKC.x, e), py = AX.cy;
    const cam = { az: ant - 24 * sw, el: 9 * sw, persp: .4 + .1 * sw, zoom, px, py, qx: AX.cx, qy: AX.cy, shift: lerp(px, wordC, p) - AX.cx };
    const phase = T < .5 ? 0 : T < P0 ? 2 * outC((T - .5) / (P0 - .5)) : 2;
    const Fh = R.focal(HIT), dr = (1 - e) * (1 - e);                                       // the shared drift dies out at the hit
    const gx = -1100 * p * p;                                                              // the ribbon leaves as a rigid body: moved, never reshaped
    const F = { s: G.coil(phase).pts.map(q => Object.assign(q, { x: q.x + gx, r: 0, sh: 0, a: 1 })), cam, phase, ribA: 1, endGlow: 1, arcA: 1, sphA: 1, gridA: lerp(1, .4, e), markA: 0, planeA: 0,
      arcs: G.arcs(phase).map(A0 => ({ col: A0.col, pts: A0.pts.map(q => Object.assign({}, q, { x: q.x + gx })) })), spheres: G.spheres().map(q => Object.assign({}, q, { x: q.x + gx })),
      cards: SHARDS.map(S => ({ u0: S.u0, u1: S.u1, v0: S.v0, v1: S.v1, ox: W2.ox + 420 * dr, oy: W2.oy - 60 * dr, k: W2.k, z: S.z, px: AX.cx, py: AX.cy, F: Fh })) };
    F.res = { time: T, reg: 0, turns: 1.85, az: cam.az, el: cam.el, persp: cam.persp, zoom: cam.zoom, stage: T < 1.0 ? 'still' : T < H1 ? 'camera move' : T < P0 ? 'hit point: lockup' : T < P1 ? 'to the word' : 'mark' };
    return F;
  }

  /* a designspace location as a still: REG × PHASE, camera following REG from ST-22's to the front */
  function at(reg, phase) {
    const tr = track(reg);
    const F = { s: band(reg, phase), cam: { az: 0, el: 0, persp: 0, zoom: tr.zoom * .8, shift: tr.shift }, phase, ribA: 1, endGlow: 1, arcA: 1, sphA: 1, gridA: .6,
      arcs: arcs(reg, phase, .08), spheres: spheres(reg), markA: 0, planeA: 0 };
    F.res = { reg, turns: lerp(1.85, 3, reg), stage: 'designspace' }; return F;
  }
  const CK = (m1, m2, m3) => ['ST-22 as it is', 'REG 0.75: the camera follows', 'REG 1: the m, three overturns', 'cut 1: script m, roman “indgut”', m1, m2, m3, 'the mark, held'];
  const KEYS = {
    ductus: CK('FORM 0.3: depth letting go', 'FORM 0.75: on the skeleton', 'inked: the mark’s white'),
    write: CK('stem 1 written', 'arch 1 and stem 2 written', 'arch 2 and stem 3, inked'),
    press: CK('the press at stem 1', 'the press at stem 2, overshoot', 'pressed and printed'),
    parallax: ['ST-22 as it is', 'pull back and swing', 'fifteen pieces in depth', 'pieces drift as one', 'seams closing', 'the hit point: lockup', 'carried to the word', 'the mark, held']
  };
  const REFS = [
    { ref: 'homélior wordmark', device: 'one script m among upright roman letters', traj: 'ductus', t: 4.42 / 8, frame: 'Ductus · 4.42 s' },
    { ref: 'Rémi wordmark', device: 'a script m and a slash accent', traj: 'write', t: 4.67 / 8, frame: 'Write · 4.67 s', note: 'the slash is the band’s back stroke, the thin up from each foot, still standing while the first stem is written' },
    { ref: 'brush-script specimen (Metropolis, Phantom, Bergkatze)', device: 'a broad tool: thick downstrokes, thin upstrokes, an m built of overturns', traj: 'ductus', t: 3.85 / 8, frame: 'Ductus · 3.85 s' },
    { ref: 'single-glyph d mark', device: 'one glyph standing as a mark of its own', traj: 'parallax', t: 5.3 / 9, frame: 'Parallax · 5.30 s', note: 'here ST-22’s ribbon, unchanged, stands beside the word for one beat' }
  ];
  const CUTKEYS = [0, 2.9, 3.85, 4.42, 4.67, 4.92, 5.17, 8];
  const TRAJ = [
    { id: 'ductus', no: '01', name: 'Ductus', dur: 8, f: t => cut(t, 8, 'ductus'), keys: CUTKEYS.map(s => s / 8),
      line: 'The whole band flows onto the letter’s own skeleton at once: depth collapses, the band turns face-on and swells from the ribbon’s 45 to the letter’s 45 and 34, then takes the mark’s ink. The real m arrives on frame 66, already matched.' },
    { id: 'write', no: '02', name: 'Write', dur: 8, f: t => cut(t, 8, 'write'), keys: CUTKEYS.map(s => s / 8),
      line: 'A front runs along the stroke in writing order: stem, arch, stem, back up, arch, stem. Behind it the band lies on the letter; the ink follows three frames later, so the m is written by the ribbon as it lands.' },
    { id: 'press', no: '03', name: 'Press', dur: 8, f: t => cut(t, 8, 'press'), keys: CUTKEYS.map(s => s / 8),
      line: 'A press line crosses the m left to right. Under it each part of the band snaps flat onto the letter with a damped spring, overshooting a little, and prints where it lands.' },
    { id: 'parallax', no: '04', name: 'Parallax', dur: 9, f: t => parallax(t, 9), keys: [0, 1.6, 2.4, 3.2, 4.2, 5.3, 6.2, 9].map(s => s / 9),
      line: 'ST-22 as it is, never changed. The camera pulls back and swings; the word stands in fifteen pieces, its strokes, tittle and ®, at fifteen depths, drifting as one, each sized so that from ST-22’s own camera pulled back they close into the wordmark. One beat with the ribbon beside the word, then the camera carries on to the word.' }
  ];
  return { TRAJ, byId: id => TRAJ.find(x => x.id === id), band, arcs, spheres, at, KEYS, REFS, LET, W1, W2, HIT, SHARDS, SKY, TIT, NIB, MSTEMS, KW, B, SPOTS, PIECES, GAP: () => GAP, C, form, M0, M1, SWAP };
})();
