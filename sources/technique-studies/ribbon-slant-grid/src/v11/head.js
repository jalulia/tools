/* head.js · 05 Head: ST-22's ribbon, as it is, becomes the Mindgut 2.2 mark. Mir is the brain folds and the light in the eyes; the head is Mindgut.
     the ribbon    slides along its own path, through one bend, into the skull, and lies down in the brain's folds as one continuous
                   stroke (17 folds, toured right to left; between folds the band dives to zero width). It is never stretched or cut:
                   every sample keeps its neighbors, the whole band moves as one train. Then it takes the mark's white.
     the spheres   the twelve gather into the two eye lights, six to an eye, and print flat.
     the lights    the three helices run onto the head's three contours: the sticker's edge, the head's edge, the face plate.
     the head      floods in from its outline inward (iso-distance fronts from the silhouette); the eyes form around their lights.
   Mark units: the mark's own vector, 1620 × 1571, y down (landing page v13, MG_LOGO). World units are ST-22 stage pixels. */
"use strict";
const HEAD = (() => {
  const { N, AX, clamp, lerp } = G, TAU = Math.PI * 2, D = window.ROBOTGEO, FPS = 12;
  const inOut = t => { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const bump = (t, a, b) => { const u = clamp((t - a) / (b - a), 0, 1); return Math.sin(Math.PI * u) ** 2; };
  const ss = (a, b, v) => { v = clamp((v - a) / (b - a), 0, 1); return v * v * (3 - 2 * v); };

  /* the head in world units: 560 tall, centered on ST-22's axis */
  const K = 560 / D.H, OX = AX.cx - D.W / 2 * K, OY = AX.cy - D.H / 2 * K, wp = (u, v) => [OX + u * K, OY + v * K];
  const VIEW = { ox: OX, oy: OY, k: K, w: D.W, h: D.H, dmax: D.dmax };

  /* master D: the brain as one stroke, entered from the right */
  const BR = D.brain.slice().reverse().map(([u, v, w]) => { const p = wp(u, v); return { x: p[0], y: p[1], w: w * K }; });
  BR.forEach((p, i) => { const a = BR[Math.max(0, i - 1)], b = BR[Math.min(N - 1, i + 1)], tx = b.x - a.x, ty = b.y - a.y, l = Math.hypot(tx, ty) || 1; p.bx = ty / l; p.by = -tx / l; });
  const M = 200, S = N + M;                                             // the bend between the coil's cut end and the first fold

  /* the compound path at this phase: coil (N) · bend (M) · brain (N); x y z w bx by bz r per index */
  function track(phase) {
    const C = G.coil(phase).pts, n = N + M + N, T = { x: new Float64Array(n), y: new Float64Array(n), z: new Float64Array(n), w: new Float64Array(n), bx: new Float64Array(n), by: new Float64Array(n), bz: new Float64Array(n), r: new Float64Array(n) };
    const put = (j, p, r) => { T.x[j] = p.x; T.y[j] = p.y; T.z[j] = p.z || 0; T.w[j] = p.w; T.bx[j] = p.bx; T.by[j] = p.by; T.bz[j] = p.bz || 0; T.r[j] = r; };
    for (let i = 0; i < N; i++) put(i, C[i], 0);
    const P0 = C[N - 1], Q0 = C[N - 2], P1 = BR[0], Q1 = BR[1], L = Math.hypot(P1.x - P0.x, P1.y - P0.y, P0.z) * .7;
    let t0 = [P0.x - Q0.x, P0.y - Q0.y, P0.z - Q0.z], t1 = [Q1.x - P1.x, Q1.y - P1.y, 0]; const l0 = Math.hypot(...t0) || 1, l1 = Math.hypot(...t1) || 1;
    t0 = t0.map(v => v / l0 * L); t1 = t1.map(v => v / l1 * L);
    for (let j = 0; j < M; j++) { const s = (j + 1) / (M + 1), s2 = s * s, s3 = s2 * s, h00 = 2 * s3 - 3 * s2 + 1, h10 = s3 - 2 * s2 + s, h01 = -2 * s3 + 3 * s2, h11 = s3 - s2;
      const k = ss(0, .45, s), dt = P0.bx * P1.bx + P0.by * P1.by, roll = dt < 0 ? Math.sin(Math.PI * k) * -dt : 0;
      let bx = lerp(P0.bx, P1.bx, k), by = lerp(P0.by, P1.by, k), bz = lerp(P0.bz || 0, 0, k) + roll; const bl = Math.hypot(bx, by, bz) || 1;
      put(N + j, { x: h00 * P0.x + h10 * t0[0] + h01 * P1.x + h11 * t1[0], y: h00 * P0.y + h10 * t0[1] + h01 * P1.y + h11 * t1[1], z: h00 * P0.z + h10 * t0[2],
        w: lerp(P0.w, P1.w, k), bx: bx / bl, by: by / bl, bz: bz / bl }, k); }
    for (let i = 0; i < N; i++) put(N + M + i, BR[i], 1);
    return T;
  }
  /* the band at slide e (0 = ST-22's coil, 1 = on the brain): sample i sits at index i + e·S of the compound path */
  const CORD = 10;                                                     // the cord: about the median fold (27 mark units × K)
  function band(e, phase, ink, cord) {
    const T = track(phase), s = new Array(N), top = T.x.length - 1;
    for (let i = 0; i < N; i++) { const q = Math.min(top, i + e * S), a = Math.floor(q), b = Math.min(top, a + 1), f = q - a, L = (k) => lerp(T[k][a], T[k][b], f);
      let bx = L('bx'), by = L('by'), bz = L('bz'); const bl = Math.hypot(bx, by, bz) || 1, c = cord ? cord(i) : 0;
      // off the brain, the sample's own width: ST-22's 180 rolling to a cord; through the bend it meets the fold's width
      const wc = lerp(180, CORD, c), kb = q < N ? 0 : clamp(L('r'), 0, 1), w = q < S ? lerp(wc, CORD, kb) : L('w'), r = q < S ? Math.max(c, kb) : 1;
      s[i] = { x: L('x'), y: L('y'), z: L('z'), w, bx: bx / bl, by: by / bl, bz: bz / bl, r, sh: 0, a: 1, wt: ink ? ink(i) : 0 }; }
    return s;
  }
  /* lights → contours: a tight helix around each contour, drawn in along its length (as the word's guide lines were) */
    // contours, rounded at the ear-cup notches (circular gaussian, σ 6 points ≈ 13 units) so a light never turns a sharp corner
  const smooth = (c, sg) => { const m = c.length, R0 = Math.ceil(sg * 3), k = []; for (let j = -R0; j <= R0; j++) k.push(Math.exp(-j * j / (2 * sg * sg)));
    const ks = k.reduce((a, b) => a + b, 0); return c.map((_, i) => { let x = 0, y = 0; for (let j = -R0; j <= R0; j++) { const p = c[(i + j + m) % m]; x += p[0] * k[j + R0]; y += p[1] * k[j + R0]; } return [x / ks, y / ks]; }); };
  const CONT = [D.sil, D.head, D.face].map(c => smooth(c, 6).map(([u, v]) => wp(u, v))), CD = [D.d_sil, D.d_head, D.d_face];
  function ring(C, n, rot) { const m = C.length, out = [];
    for (let j = 0; j < n; j++) { const f = j / (n - 1) * m, a = Math.floor(f) % m, b = (a + 1) % m, t = f - Math.floor(f), p = C[a], q = C[b], th = TAU * 18 * j / (n - 1) + rot;
      out.push({ x: lerp(p[0], q[0], t), y: lerp(p[1], q[1], t) - 2 * Math.cos(th), z: 2 * Math.sin(th), e: .8 }); } return out; }
  function arcs(T, phase, R) {
    const src = G.arcs(phase), rot = TAU * phase * 1.5;
    // each helix resampled to 3 × its points first, so it can lie on a long contour without corners
    return src.map(A1 => { const P = A1.pts, n = (P.length - 1) * 3 + 1; return { col: A1.col, pts: Array.from({ length: n }, (_, i) => { const f = i / 3, a = Math.min(P.length - 2, Math.floor(f)), t = f - a, p = P[a], q = P[a + 1];
      return { x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t), z: lerp(p.z, q.z, t), e: lerp(p.e, q.e, t) }; }) }; }).map((A0, j) => { const n = A0.pts.length, Tg = ring(CONT[j], n, rot), r = clamp((T - 1.0 - .18 * j) / 1.6, 0, 1) * 1.45, off = 1 - ss(CD[j] - 6, CD[j] + 26, R);
      return { col: A0.col, pts: A0.pts.map((p, i) => { const e = inOut(clamp(r - .45 * i / (n - 1), 0, 1)), ez = 1 - (1 - e) * (1 - e);
        return { x: lerp(p.x, Tg[i].x, e), y: lerp(p.y, Tg[i].y, e), z: lerp(p.z, Tg[i].z, ez), e: lerp(p.e, Tg[i].e, e) * off }; }) }; });
  }
  /* spheres → the eye lights, six to an eye; they print flat as the flood reaches the eyes */
  const EYEM = [D.lights[0].cx, D.lights[0].cy, D.lights[1].cx, D.lights[1].cy];          // the eyes grow out from their lights (mark units)
  const EYE = D.lights.map(l => { const p = wp(l.cx, l.cy); return { x: p[0], y: p[1], r: l.r * K - .6, d: 0 }; });
  function spheres(T, ink) {
    return G.spheres().map((p, k) => { const e = inOut(clamp((T - 1.25 - .07 * k) / 1.5, 0, 1)), t = EYE[k < 6 ? 0 : 1];
      return Object.assign({}, p, { x: lerp(p.x, t.x, e), y: lerp(p.y, t.y, e), z: lerp(p.z, 0, e), r: lerp(p.r, t.r, e), dim: lerp(p.dim, 1, e), ink }); });
  }
  const T0 = 1.6, T1 = 5.0, TI = 4.75, F0 = 5.1, F1 = 6.1, SWAP = 80 / FPS;          // thread 1.6 → 5.0 s · ink from 4.75 · flood 5.1 → 6.1 · eyes 6.0 → 6.5 · swap on frame 80
  function f(t) {
    const T = t * 9, fr = T * FPS, e = inOut(clamp((T - T0) / (T1 - T0), 0, 1));
    const phase = T < .5 ? 0 : .6 * inOut(clamp((T - .5) / (T1 - .5), 0, 1));
    const R = lerp(-12, D.dmax2 + 12, inOut(clamp((T - F0) / (F1 - F0), 0, 1)));
    const ink = i => inOut(clamp((T - TI - .55 * (1 - i / (N - 1))) / .35, 0, 1));
    const ant = bump(T, .5, 1.0) * 4, sw = bump(T, 1.0, 5.0);
    const cam = { az: ant - 14 * sw, el: 6 * sw, persp: lerp(.4, 0, inOut(clamp((T - 4.2) / 1.6, 0, 1))) + .1 * sw, zoom: 1 + .015 * bump(T, .5, 1.0), shift: 0 };
    const cord = i => ss(0, 1, (T - 1.15 - 1.1 * (1 - i / (N - 1))) / .7);   // leading end first: 1.15 s at the cut end, 2.25 s at the tail
    const S0 = band(e, phase, T > TI ? ink : null, cord), eyeInk = inOut(clamp((T - 6.1) / .3, 0, 1));          // lit until the eye has formed around it
    const F = { s: S0, cam, phase, ribA: T < SWAP ? 1 : 0, endGlow: e > 0 ? 0 : 1, arcA: T < SWAP ? 1 : 0, sphA: T < SWAP ? 1 : 0, gridA: lerp(1, .5, inOut(clamp((T - 1) / 4, 0, 1))),
      arcs: arcs(T, phase, R), spheres: spheres(T, eyeInk), markA: 0, planeA: 0, markC: [236, 238, 236],
      robot: T >= F0 ? { view: VIEW, flood: T >= SWAP ? D.dmax2 + 40 : R, eyes: EYEM, growE: T >= SWAP ? 400 : lerp(45, 250, inOut(clamp((T - 5.95) / .5, 0, 1))), growM: T >= SWAP ? 400 : lerp(0, 95, inOut(clamp((T - 6.15) / .4, 0, 1))) } : null };
    const stage = T < 1.0 ? 'still' : T < T0 ? 'lights draw the head' : T < T1 - .4 ? 'threading into the folds' : T < F0 ? 'inked' : T < F1 ? 'the head floods in' : T < SWAP ? 'settling' : 'mark';
    F.res = { time: T, frame: Math.floor(fr + 1e-6), reg: e, form: clamp(R / D.dmax2, 0, 1), turns: 1.85, az: cam.az, el: cam.el, persp: cam.persp, zoom: cam.zoom, stage };
    return F;
  }
  const KEYS = [0, 1.9, 2.9, 3.8, 4.7, 5.55, 6.15, 9];
  const L = { id: 'head', no: '05', name: 'Head', mark: 'robot', dur: 9, f, keys: KEYS.map(s => s / 9),
    line: 'ST-22 slides along its own path, through one bend, into the skull, and lies down in the brain’s seventeen folds as one stroke, never stretched or cut; then it takes the mark’s white. The spheres gather into the two eye lights. The light helices run onto the head’s three contours, and the head floods in from its outline. The real mark arrives on frame 80, already matched.' };
  RES.TRAJ.push(L);
  RES.KEYS.head = ['ST-22 as it is', 'the lights run onto the head', 'the ribbon threads into the skull', 'folding through the gyri', 'inked: the brain’s white', 'the head floods in from its outline', 'the eyes form around their light', 'the mark, held'];
  return { VIEW, BR, EYE, CONT, SWAP, f };
})();
