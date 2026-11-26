/* Applications · split instruments. A usage that printed two things with one set of dials is split into two pages:
   the roller (only the roll answers: paper, roller, transfer, ink) and the type (only the letters answer: how the face
   takes ink, and the edge and outline). Each page prints the other half at the defaults of its sibling, so both open on
   the same piece. Same physics as the effect set: FXSET.kit is the set's own ink chain, stock and layout geometry.
   Source: _build/engines/ap-splits.js. _build/apps.mjs copies it to applications/_engine/splits.js and writes the pages.
   Shape: FXSET.splits = [ usage + { split:{ code, slug, parent, role }, dials:[ technique with params ] } ] */
(function (G) {
'use strict';
const SET = G.FXSET, K = SET && SET.kit, FX = G.FX; if (!K || !FX) return;
const { inkEdge, inkChain, stockFor, baseAlb, light, typeAt, sstep, SOLID, a3_DD, a3_PO, a3_fs, a3_line, a3_circ, a3_LINE } = K;
const clamp = FX.clamp, PI = Math.PI;
const defaultsOf = (e) => Object.fromEntries(e.params.map((p) => [p.key, JSON.parse(JSON.stringify(p.value))]));
const dec = (v) => (v >= .995 ? '1.00' : v.toFixed(2).slice(1)); /* OKLCH as the card prints it: .63, and 1.00 for bare paper */
const pick = (o, keys) => { const r = {}; if (o) for (const k of keys) if (o[k] !== undefined) r[k] = o[k]; return r; };

/* ── the printed key: one black ink for the setting and rules; the band under the drawdown is a plain solid ── */
const TEXT_INK = FX.ink(.17, .004, 280);
const BASE = Object.assign(defaultsOf(inkEdge), SOLID, { stock: 'paper', iL: .17, iC: .004, ih: 280, density: 1.35, starve: 0, mottle: 0, bite: .2, breakup: .55 });
const BAND = Object.assign({}, BASE, { breakup: 1 });
const EASE = [['smooth', 2], ['out', 1.7], ['in', 1.7], ['linear', 1]];

/* ── the type, printed: the letters' own alpha → signed distance (device px) → the edge is worked, then inked by the same
   chain as the roll. spread moves the edge; rag pushes it by the board's height; wander waves it; bite eats clumps near it;
   feather lets fibers carry ink past it; the rim keeps full film while the face thins (face 0 = outline type); the contour
   is a hairline set off the edge. ── */
/* local stroke size: the half-stroke of the nearest letter (running max of the inside distance over a window, separable,
   van Herk / Gil-Werman). Wear scales with it, as it does in a case of type: big wood letters carry big dings and wide
   outlines, small metal type stays whole. */
const runMax = (src, dst, n, stride, off, r, buf) => { const L = 2 * r + 1, g = new Float32Array(n + L), hh = new Float32Array(n + L);
  for (let i = 0; i < n + 2 * r; i++) buf[i] = i < r || i >= n + r ? 0 : src[off + (i - r) * stride];
  const m = n + 2 * r; for (let i = 0; i < m; i++) g[i] = i % L === 0 ? buf[i] : Math.max(g[i - 1], buf[i]);
  for (let i = m - 1; i >= 0; i--) hh[i] = (i % L === L - 1 || i === m - 1) ? buf[i] : Math.max(hh[i + 1], buf[i]);
  for (let i = 0; i < n; i++) dst[off + i * stride] = Math.max(hh[i], g[i + L - 1 < m ? i + L - 1 : m - 1]); };
const thickness = (sd, W, H, r) => { const a = new Float32Array(W * H), b = new Float32Array(W * H), buf = new Float32Array(Math.max(W, H) + 2 * r + 2);
  for (let i = 0; i < W * H; i++) a[i] = sd[i] > 0 ? sd[i] : 0;
  for (let y = 0; y < H; y++) runMax(a, b, W, 1, y * W, r, buf); for (let x = 0; x < W; x++) runMax(b, a, H, W, x, r, buf); return a; };
const meanOf = (h) => { if (!h) return .5; let m = 0, n = 0; for (let i = 0; i < h.length; i += 97) { m += h[i]; n++; } return m / n; };
const bboxOf = (clip, W, H) => { let x0 = W, y0 = H, x1 = -1, y1 = -1; for (let y = 0; y < H; y++) { const r = y * W; for (let X = 0; X < W; X++) if (clip[r + X] > 0) { if (X < x0) x0 = X; if (X > x1) x1 = X; if (y < y0) y0 = y; if (y > y1) y1 = y; } } return x1 < 0 ? null : [x0, y0, x1, y1]; };
const crop = (a, W, x0, y0, w, h, ch = 1) => { const o = new Float32Array(w * h * ch); for (let y = 0; y < h; y++) o.set(a.subarray(((y0 + y) * W + x0) * ch, ((y0 + y) * W + x0 + w) * ch), y * w * ch); return o; };
/* the pass works on the letters' own box (plus the reach of every edge effect), not the whole sheet */
const typePrint = { run(o, W, H, dpr, x) {
  const T = o.T, clip = x.clip, stF = stockFor({ stock: 'paper' }, x, W, H, dpr), alb = baseAlb(stF, x, W, H), A = new Float32Array(W * H);
  const LF = x.lf || (stF ? stF.lf : null), done = () => ({ alb, lf: LF, lin: null, ink: A, stock: null, mask: A, marks: 0, markUnit: 'inked px²' });
  const spread = T.spread * dpr, rag = T.rag * dpr * 2, wa = T.wander * dpr, ws = Math.max(1, T.wScale), fe = T.feather * dpr, rimW = Math.max(.3, T.rim) * dpr;
  const kw = T.contour * dpr, gap = (1.5 + 1.2 * T.contour) * dpr, reach = 3 + Math.abs(spread) + rag + wa * 1.6 + fe + (kw > 0 ? gap + kw : 0), deep = reach + rimW + 2 * dpr;
  const bb = bboxOf(clip, W, H); if (!bb) return done();
  const R8 = Math.round(8 * dpr), mg = Math.ceil(reach + R8 + 4), bx = Math.max(0, bb[0] - mg), by = Math.max(0, bb[1] - mg), w2 = Math.min(W, bb[2] + mg + 1) - bx, h2 = Math.min(H, bb[3] + mg + 1) - by;
  const cl = crop(clip, W, bx, by, w2, h2), st = stF ? { h: crop(stF.h, W, bx, by, w2, h2), fib: stF.fib && crop(stF.fib, W, bx, by, w2, h2), form: stF.form && crop(stF.form, W, bx, by, w2, h2) } : null;
  const sd = FX.sdf(cl, w2, h2), TH = thickness(sd, w2, h2, R8), hm = meanOf(stF && stF.h), seed = (T.seed | 0) + (o.salt | 0);
  const N = w2 * h2, COV = new Float32Array(N), Pb = new Float32Array(N), TAU = new Float32Array(N);
  const ebite = T.ebite, face = T.face, ga = .1, gc = Math.cos(ga), gs = Math.sin(ga);
  for (let y = 0; y < h2; y++) { const v = (y + by) / dpr; for (let X = 0; X < w2; X++) { const i = y * w2 + X, s0 = sd[i]; if (s0 < -reach) continue;
    if (s0 > deep) { COV[i] = 1; Pb[i] = T.imp; TAU[i] = face; continue; } // deep in the stroke: no edge effect reaches here
    const u = (X + bx) / dpr, k = clamp((TH[i] / dpr - 1.2) / 3.8, .12, 1); // k: 1 on display letters, .12 on small type
    let ds = s0 + spread * (spread < 0 ? .3 + .7 * k : .6 + .4 * k); if (wa) ds += wa * k * (FX.fbm(u / ws, v / ws, seed + 3, 3, .5) * 2 - 1) * 1.4;
    const rg = rag && st ? rag * (.5 + .5 * k) * (st.h[i] - hm) : 0, d = ds + rg;
    let c = clamp(d + .5, 0, 1), tau = 1;
    if (ebite > 0 && c > 0) { const near = 1 - clamp(d / (dpr * 2.5 + wa * 2), 0, 1), holes = FX.fbm(u / 2.4, v / 2.4, seed + 41, 3, .55), th = ebite * k * (.2 + .8 * near) * .62; if (holes < th) c *= clamp((holes - th + .04) / .04, 0, 1); }
    if (c > 0 && face < 1) { const rim = 1 - sstep(rimW - .75 * dpr, rimW + .75 * dpr, d); tau = face + (1 - face) * rim; }
    if (fe > 0 && d < .5) { const cr = clamp(1 + (d - .5) / (fe * (.45 + .55 * k)), 0, 1); if (cr > 0) { // hairlines creep out along the paper's grain
        const a = (u * gc + v * gs), b = (-u * gs + v * gc), n1 = FX.fbm(a / 2.8, b / .38, seed + 61, 2, .5), n2 = FX.fbm((a * .906 + b * .423) / 2.2, (-a * .423 + b * .906) / .34, seed + 67, 2, .5);
        let f = Math.max(sstep(.66 - .2 * cr, .72 - .2 * cr, n1), .7 * sstep(.7 - .2 * cr, .76 - .2 * cr, n2)) * cr; if (st && st.fib) f = Math.max(f, sstep(.3, .75, st.fib[i]) * cr);
        f *= .88; if (f > c) { c = f; tau = Math.max(tau, .75); } } }
    if (kw > 0) { const kc = sstep(.45, .8, k); if (kc > 0) { const ring = clamp(kw / 2 + rg * .3 - Math.abs(-ds - gap - kw / 2) + .5, 0, 1) * kc; /* the line sits off the letter's own edge; the tooth works its two edges, not its course */ if (ring > c) { c = ring; tau = 1; } } }
    if (c <= 0) continue; COV[i] = c; Pb[i] = T.imp; TAU[i] = tau; } }
  const oo = { split: 1.1, bite: T.bite, starve: T.starve, wick: 0, mottle: T.mottle, breakup: T.breakup, density: T.density * (o.dens || 1) };
  // ink at full coverage into a copy, then mix by the letter's own coverage in linear light: an anti-aliased edge pixel is
  // part ink, part paper (a film thinned by coverage would print dark inks half a pixel bold)
  const a2 = crop(alb, W, bx, by, w2, h2, 3), albI = Float32Array.from(a2), A2 = new Float32Array(N), marks = inkChain(Pb, st, oo, o.ink, albI, A2, w2, h2, dpr, seed, 'film', 0, 1.25, TAU);
  for (let y = 0; y < h2; y++) for (let X = 0; X < w2; X++) { const i = y * w2 + X, c = COV[i]; if (c <= 0) continue; const j = (y + by) * W + X + bx, k = j * 3, q = i * 3;
    alb[k] += (albI[q] - alb[k]) * c; alb[k + 1] += (albI[q + 1] - alb[k + 1]) * c; alb[k + 2] += (albI[q + 2] - alb[k + 2]) * c; A[j] = A2[i] * c; }
  return Object.assign(done(), { marks: Math.round(marks / (dpr * dpr)) }); } };

/* ── the roll: one pass of a hand roller over a rectangle of the card. Along the stroke the roller's ink gives out
   (half gone at runAt, over runLen, by the dropoff curve, along a warped line); across it, pressure falls off at the
   roller's ends and where it sets down and lifts, so those edges are the board's own tooth, and the ink squeezed to the
   ends prints a ridge that holds on longer. ── */
const rollerPrint = { run(o, W, H, dpr, x) {
  const R = o.R, g = o.g, seed = R.seed | 0, st = stockFor({ stock: 'paper' }, x, W, H, dpr), alb = baseAlb(st, x, W, H), A = new Float32Array(W * H);
  const Pb = new Float32Array(W * H), TAU = new Float32Array(W * H);
  const down = g.dir === 'y', L = down ? g.y1 - g.y0 : g.x1 - g.x0, t0 = down ? g.x0 : g.y0, t1 = down ? g.x1 : g.y1, tm = (t0 + t1) / 2;
  const sk = R.skew * PI / 180, cs = Math.cos(sk), sn = Math.sin(sk), at = R.runAt / 100 * L, wid = Math.max(.5, R.runLen / 100 * L), ease = EASE[R.curve | 0] || EASE[0];
  const fall = R.fall, fsc = 5 + fall * 2.5, soft = fall + 1 / dpr, rr = 1.6 + fall * .8;
  const X0 = Math.max(0, Math.floor(g.x0 * dpr) - 2), X1 = Math.min(W - 1, Math.ceil(g.x1 * dpr) + 2), Y0 = Math.max(0, Math.floor(g.y0 * dpr) - 2), Y1 = Math.min(H - 1, Math.ceil(g.y1 * dpr) + 2);
  for (let y = Y0; y <= Y1; y++) { const v = y / dpr; for (let X = X0; X <= X1; X++) { const u = X / dpr, s = down ? v - g.y0 : u - g.x0, t = down ? u : v;
    const n = fall > 0 ? (FX.fbm(u / fsc, v / fsc, seed + 5, 3, .55) * 2 - 1) * fall * .7 : 0;
    const e = Math.min(t - t0, t1 - t, s, L - s) + n, lat = sstep(0, 1, clamp((e + .5 / dpr) / soft, 0, 1)); if (lat <= 0) continue;
    const rid = R.ridge > 0 ? R.ridge * Math.exp(-Math.max(0, e) / rr) : 0;
    let d = at - (s * cs + (t - tm) * sn); if (R.wAmp) d += R.wAmp * (FX.fbm(u / R.wScale, v / R.wScale, seed, 3, .5) * 2 - 1) * 1.5;
    const p = FX.ease(ease, clamp(d / wid + .5, 0, 1)), i = y * W + X;
    Pb[i] = (p + rid * (1 - p) * .6) * R.pressure * lat; TAU[i] = 1 + rid * .8; } }
  const oo = { split: R.split, bite: R.bite, starve: R.starve, wick: R.wick, mottle: R.mottle, breakup: R.breakup, density: R.density };
  const marks = inkChain(Pb, st, oo, FX.ink(R.L, R.C, R.h), alb, A, W, H, dpr, seed, 'film', (down ? 90 : 0) + R.skew, R.streak, TAU);
  const LF = x.lf || (st ? st.lf : null);
  return { alb, lf: LF, lin: null, ink: A, stock: null, mask: Pb, marks: Math.round(marks / (dpr * dpr)), markUnit: 'inked px²' }; } };

/* the press bar (all-day poster): the same roller and ink, stamped at fixed pressures (the clip's alpha) */
const pressPrint = { run(o, W, H, dpr, x) {
  const R = o.R, clip = x.clip, st = stockFor({ stock: 'paper' }, x, W, H, dpr), alb = baseAlb(st, x, W, H), A = new Float32Array(W * H);
  const oo = { split: R.split, bite: R.bite, starve: R.starve, wick: R.wick, mottle: R.mottle, breakup: R.breakup, density: R.density };
  const Pb = Float32Array.from(clip); const marks = inkChain(Pb, st, oo, FX.ink(R.L, R.C, R.h), alb, A, W, H, dpr, (R.seed | 0) + 2, 'film', 90 + R.skew, R.streak);
  const LF = x.lf || (st ? st.lf : null);
  return { alb, lf: LF, lin: null, ink: A, stock: null, mask: Pb, marks: Math.round(marks / (dpr * dpr)), markUnit: 'inked px²' }; } };

/* ── the runner: passes in order on one albedo, lit once at the end. The half of the page that does not answer this page's
   dials is printed once and kept (per worker, one piece), keyed by everything it depends on: the sheet size, the paper and
   the letters' own masks. ── */
const steps = (list, W, H, dpr, S, alb0, lf0) => { let alb = alb0, lf = lf0, R = null; for (const st of list) { const xx = Object.assign({ S }, st.x || {}); if (alb) { xx.alb = alb; xx.lf = lf; } R = st.fx.run(st.o, W, H, dpr, xx); alb = R.alb; lf = R.lf; } return { R, alb, lf }; };
const sig = (a) => { if (!a) return 0; let h = 0; for (let i = 0; i < a.length; i += 11) h = (h * 31 + Math.round(a[i] * 255)) | 0; return h; };
const KEPT = new Map();
const kept = (key, make) => { const hit = KEPT.get(key); if (hit) return hit; const v = make(); KEPT.clear(); KEPT.set(key, v); return v; };
const print = (fixed, live, fixedKey, W, H, dpr, S) => { const P0 = kept(fixedKey, () => steps(fixed, W, H, dpr, S, null, null));
  const Z = steps(live, W, H, dpr, S, P0.alb, P0.lf), R = Z.R || P0.R; return Object.assign({}, R, { alb: Z.alb, lf: Z.lf, lin: light(Z.alb, Z.lf, W, H), ink: R.ink }); };
const paperKey = (S, W, H, dpr) => [W, H, dpr, JSON.stringify(S && S['fx-03-paper-tooth'])].join('|');

/* ── what a station reads (drawdown): the roller's pressure P at the strip's center line, the share of the board that
   took ink (the top P of the surface, less the starved floor) and the color the station averages to (Beer–Lambert film,
   linear light, the chain's own break-up rule) ── */
const pressureAt = (R, s, L) => { const at = R.runAt / 100 * L, wid = Math.max(.5, R.runLen / 100 * L), sk = R.skew * PI / 180; return FX.ease(EASE[R.curve | 0] || EASE[0], clamp((at - s * Math.cos(sk)) / wid + .5, 0, 1)) * R.pressure; };
const stationOf = (R, P) => { const ink = FX.ink(R.L, R.C, R.h), share = P > .002 ? clamp(Math.min(P, 1 - R.starve), 0, 1) : 0, bu = R.breakup, a1 = (bu + (1 - bu) * P * P) * R.density, a0 = (1 - bu) * P * P * R.density;
  const m = ink.lin.map((c) => share * Math.pow(c, a1) + (1 - share) * Math.pow(c, a0)), o = [0, 0, 0]; FX.lin2lab(m[0], m[1], m[2], o);
  return { share, L: o[0], C: Math.hypot(o[1], o[2]), h: ((Math.atan2(o[2], o[1]) * 180 / PI) + 360) % 360 }; };

/* ── dials. Paper, Roller, Transfer and Ink belong to the roller page; Face and Edge to the type page. ── */
const R_KEYS = ['runAt', 'runLen', 'curve', 'pressure', 'skew', 'wAmp', 'wScale', 'fall', 'ridge', 'seed'], X_KEYS = ['bite', 'breakup', 'split', 'streak', 'starve', 'mottle'], I_KEYS = ['L', 'C', 'h', 'density'];
const F_KEYS = ['imp', 'starve', 'mottle', 'density'], E_KEYS = ['spread', 'rag', 'wander', 'wScale', 'feather', 'ebite', 'rim', 'face', 'contour', 'seed'];
const P_KEYS = ['scale', 'aniso', 'fAngle', 'fibers', 'form'];
const rollOf = (S, def) => Object.assign({}, def, pick(S && S['fx-02-ink-edge'], R_KEYS), pick(S && S['ink-transfer'], X_KEYS), pick(S && S['ink-film'], I_KEYS));
const typeOf = (S, def) => Object.assign({}, def, pick(S && S['fx-02-ink-edge'], F_KEYS), pick(S && S['type-edge'], E_KEYS));

const M = {
  /* paper */
  scale: { range: [.8, 4], label: 'Tooth scale', step: .05, unit: 'px', scale: 'log', note: 'feature size of the board\'s tooth. The run-out speckle is this tooth: as the ink gives out, only its peaks still take it' },
  aniso: { range: [1.3, 4], label: 'Grain stretch', step: .05, note: 'tooth drawn out along the machine direction. Below 1.3 it reads as a stock paper filter' },
  fAngle: { range: [0, 180], label: 'Grain angle', step: 1, unit: '°', note: 'machine direction of the tooth and fibers. Along the stroke the speckle joins into streaks; across it, it breaks them' },
  fibers: { range: [0, 12], label: 'Fibers', step: .1, unit: '/100×100 px', note: 'laid fibers in the board. Each one stands proud, takes ink early and wicks it into the run-out' },
  form: { range: [0, .6], label: 'Formation', step: .01, note: 'the sheet\'s cloudiness. It lifts the board in broad flocs and thins the film over them' },
  /* roller */
  runAt: { range: [10, 90], label: 'Runs out at', step: 1, unit: '%', note: 'how far along the stroke the roller is down to half its ink' },
  runLen: { range: [6, 180], label: 'Run-out length', step: 1, unit: '%', scale: 'log', note: 'share of the stroke the ink takes to give out. Short is an abrupt burst; long is a slow fade that never holds a solid' },
  curve: { label: 'Dropoff', options: [{ v: 0, label: 'Smooth' }, { v: 1, label: 'Long tail' }, { v: 2, label: 'Late drop' }, { v: 3, label: 'Even' }], note: 'how the ink gives out across the run-out: an S, a fast drop with a long tail, a long hold with a late drop, or a straight line' },
  pressure: { range: [.65, 1], label: 'Roller pressure', step: .01, note: 'how hard the hand leans on the roller. Below 1 the solid opens onto the board\'s valleys before the ink runs out' },
  skew: { range: [-20, 20], label: 'Roller skew', step: .5, unit: '°', note: 'the hand drifts off square, so the run-out line and the streaks turn' },
  wAmp: { range: [0, 30], label: 'Edge warp', step: .5, unit: 'px', note: 'how far the run-out line wanders: an unevenly inked roller' },
  wScale: { range: [20, 400], label: 'Warp scale', step: 1, unit: 'px', scale: 'log', note: 'wavelength of the wander' },
  fall: { range: [0, 12], label: 'Roller ends', step: .1, unit: 'px', note: 'how far pressure falls off where the roller\'s ends run and where it sets down and lifts. 0 is a die-cut edge' },
  ridge: { range: [0, 1], label: 'Edge ridge', step: .01, note: 'ink squeezed to the roller\'s ends: a darker line along the edges that holds on into the run-out' },
  /* transfer */
  bite: { range: [.3, 1], label: 'Stock bite', step: .01, note: 'how much the board\'s height, against the film\'s own split, decides where ink lands. Below .3 the speckle stops following the paper and reads as dither' },
  breakup: { range: [.6, 1], label: 'Break-up ↔ thin', step: .01, note: '1: the film breaks into marks on the peaks as the ink gives out. Lower: it stays whole and thins to tone. Below .6 the run-out reads as a gradient' },
  split: { range: [.4, 2.5], label: 'Film split', step: .05, unit: 'px', scale: 'log', note: 'clump size of the film as it splits between roller and board: a tacky ink clumps larger' },
  streak: { range: [1, 6], label: 'Streak', step: .1, note: 'clumps drawn out along the stroke: a dry roller, a fast pass. Above 6 they read as scanlines' },
  starve: { range: [0, .25], label: 'Starve', step: .002, scale: 'pow', curve: 2, note: 'the lowest share of the board never takes ink: pinholes in the solid, placed by the board\'s valleys' },
  mottle: { range: [0, .6], label: 'Mottle', step: .01, note: 'the sheet\'s formation thinning the film in clouds. Past .6 the clouds read as blotches' },
  /* ink */
  L: { range: [.6, .76], label: 'Ink lightness', step: .005, unit: 'L', note: 'OKLCH lightness of the ink. The stations read the printed result, not this number' },
  C: { range: [0, .2], label: 'Ink chroma', step: .005, unit: 'C', note: 'OKLCH chroma of the ink, mapped into gauge where a hue cannot carry it' },
  h: { range: [0, 360], label: 'Ink hue', step: 1, unit: '°', note: 'OKLCH hue of the ink' },
  density: { range: [.6, 1.8], label: 'Film thickness', step: .01, note: 'ink film at full load. Beer–Lambert: thicker prints deeper and more saturated; on the black band a thin film all but disappears' },
  /* type · face */
  imp: { range: [.78, 1], label: 'Impression', step: .005, note: 'how hard the forme meets the board. Below 1 the letters open onto the board\'s valleys: a kiss impression' },
  tstarve: { key: 'starve', range: [0, .2], label: 'Starve', step: .002, scale: 'pow', curve: 2, note: 'the lowest share of the board inside each letter never takes ink: pinholes' },
  tmottle: { key: 'mottle', range: [0, .6], label: 'Mottle', step: .01, note: 'the sheet\'s formation thinning the film inside the letters. Past .6 the clouds read as blotches' },
  tdensity: { key: 'density', range: [.8, 1.8], label: 'Film thickness', step: .01, note: 'ink film on the letters. The wordmark\'s brand ink and the black key thin and deepen together' },
  /* type · edge and outline */
  spread: { range: [-.45, .9], label: 'Ink spread', step: .01, unit: 'px', note: 'film squeezed past the letter\'s edge (+), or the edge eaten back by a starved forme (−). Full on display letters, less on small type, where counters close and hairlines vanish first' },
  rag: { range: [0, 1], label: 'Edge rag', step: .01, unit: 'px', scale: 'pow', curve: 2, note: 'how far the board\'s tooth pushes the edge in and out, half as far on small type. 0 is a cut vector edge' },
  wander: { range: [0, 1.6], label: 'Edge wander', step: .01, unit: 'px', note: 'a slow waver along the edge: a soft roller, a worn forme. Full on display letters, an eighth of it on small type' },
  ewScale: { key: 'wScale', range: [4, 80], label: 'Wander scale', step: .5, unit: 'px', scale: 'log', note: 'wavelength of the waver' },
  feather: { range: [0, 1.6], label: 'Feather', step: .01, unit: 'px', note: 'how far ink wicks past the edge along the paper\'s grain, in hairlines; about half as far on small type. Past 1.6 px it reads as fuzz' },
  ebite: { range: [0, 1], label: 'Edge bite', step: .01, note: 'clumped dropouts that grow likelier toward the edge: worn wood type. Display letters take it in full, small type barely' },
  rim: { range: [.4, 6], label: 'Rim width', step: .05, unit: 'px', scale: 'log', note: 'the band along each edge where the squeezed film sits at full strength' },
  face: { range: [0, 1], label: 'Face ink', step: .01, note: 'film in the face against the rim. 1 is an even solid; lower leaves a darker rim, the letterpress squash; 0 prints only the rim: outline type' },
  contour: { range: [0, 1.6], label: 'Contour line', step: .05, unit: 'px', note: 'a line around each display letter, set off by a gap that grows with it; small type is left alone. 0 is none' },
};
const leaf = (k, v) => { const m = M[k]; const o = Object.assign({ value: v }, m); delete o.key; return o; };
const params = (keys, def) => Object.fromEntries(keys.map((k) => { const key = (M[k] && M[k].key) || k; return [key, leaf(k, def[key])]; }));
const seedLeaf = (v, note) => ({ value: v, range: [1, 999], label: 'Seed', step: 1, note });

const paperDials = (P) => ({ id: 'fx-03-paper-tooth', name: 'Paper', short: 'FX-03', atoms: ['form'],
  implementation: 'The board is FX-03 live: tooth height (gradient noise at the tooth scale, stretched along the grain), formation flocs, laid fibers and pits, under the one sheet light. The roller reads this height: as its ink gives out it inks only the top share of the surface, so the run-out speckle is the board itself.',
  limits: 'Grain stretch < 1.3: isotropic tooth reads as a stock paper filter. Tooth scale < .8 px: per-pixel noise. Fibers > 12 per 100 × 100 px: felt. Formation > .6: the paper itself turns blotchy.',
  params: params(P_KEYS, P) });
const rollerDials = (R) => ({ id: 'fx-02-ink-edge', name: 'Roller', short: 'FX-02', atoms: ['deposit'],
  implementation: 'Pressure along the stroke = the dropoff curve of the distance to a warped run-out line (half the ink gone at Runs out at, over Run-out length). Across the stroke it falls off over Roller ends at the roller\'s ends, its set-down and its lift, with the board\'s own wander; the ends carry a ridge of squeezed ink, thicker film that holds longer.',
  limits: 'Run-out length < 6%: a hard vector edge, no run-out to see. Roller skew past 20°: the run-out leaves the strip before the stations can read it.',
  params: Object.assign(params(['runAt', 'runLen', 'curve', 'pressure', 'skew', 'wAmp', 'wScale', 'fall', 'ridge'], R), { seed: seedLeaf(R.seed, 'a new pass of the roller: the same settings, a different film split and wander') }) });
const transferDials = (R) => ({ id: 'ink-transfer', name: 'Transfer', short: 'FX-02', atoms: ['deposit'],
  implementation: 'The ink chain: the board\'s height (blended with film-splitting noise, clumped and streaked along the stroke) is ranked to percentiles, and pressure P inks exactly the top P of the surface, peaks first. Starve keeps the lowest share bare, fibers wick ink into the run-out, mottle thins the film over the formation.',
  limits: 'Stock bite < .3: speckle stops following the paper and reads as digital dither. Break-up < .6: the run-out becomes a gradient. Film split > 2.5 px: blotches. Streak > 6: scanlines. Mottle > .6: blotches.',
  params: params(X_KEYS, R) });
const inkDials = (R) => ({ id: 'ink-film', name: 'Ink', short: 'FX-02', atoms: ['deposit'],
  implementation: 'One transparent ink, set in OKLCH and printed as a Beer–Lambert film in linear light: absorbance = acceptance × film thickness. Over white it reads as its color; over the black band it all but disappears.',
  limits: 'Lightness is held between .6 and .76 and chroma at .2 or under: darker, the film prints a dull red-brown; paler, a pastel; past .2 chroma the thin film swings hue as it runs out.',
  params: params(I_KEYS, R) });
const faceDials = (T) => ({ id: 'fx-02-ink-edge', name: 'Face', short: 'FX-02', atoms: ['deposit'],
  implementation: 'The letters are inked by the same chain as the roll: the board under each letter is ranked to percentiles and the impression inks its top share, so a light impression opens the face onto the valleys, starve pins the lowest share and the formation mottles the film. The letter\'s own edge is the coverage, worked in Edge.',
  limits: 'Impression < .78: the face falls apart into speckle and the small setting stops reading.',
  params: params(['imp', 'tstarve', 'tmottle', 'tdensity'], T) });
const edgeDials = (T) => ({ id: 'type-edge', name: 'Edge', short: 'Type', atoms: ['deposit'],
  implementation: 'Each letter\'s alpha becomes a signed distance in device px. The edge is moved by spread, pushed by the board\'s height (rag), waved by noise (wander), eaten near the edge (bite) and feathered along fibers; the rim keeps full film while the face thins (face 0 = outline type), and a contour hairline sits off the edge. Coverage stays one device px wide, so the edge is crisp at any setting.',
  limits: 'Ink spread > .9 px closes the counters of the small mono labels. Edge rag > 1 px reads as a fuzz filter. Wander, bite and the contour scale with the letter: on small type they would break the setting.',
  params: Object.assign(params(['spread', 'rag', 'wander', 'ewScale', 'feather', 'ebite', 'rim', 'face', 'contour'], T), { seed: seedLeaf(T.seed, 'a new forme: the same settings, a different wander and bite') }) });

/* ── defaults: both pages of a pair open on the same piece ── */
const TYPE = { imp: .985, starve: .012, breakup: .6, bite: .6, mottle: .2, density: 1.35, spread: .12, rag: .32, wander: .3, wScale: 22, feather: .3, ebite: 0, rim: 1.2, face: .88, contour: 0, seed: 7 };
const ROLL_DD = { runAt: 50, runLen: 102, curve: 0, pressure: 1, skew: 0, wAmp: 5, wScale: 120, fall: 2.5, ridge: .3, seed: 41,
  bite: .82, breakup: .94, split: .8, streak: 2.2, starve: .004, wick: .3, mottle: .18, L: .64, C: .2, h: 38, density: 1.2 };
const ROLL_PO = Object.assign({}, ROLL_DD, { curve: 1, wAmp: 7, wScale: 110, seed: 57, streak: 2.4 });
const PAPER_DD = { scale: 1.1, aniso: 1.4, fAngle: 6, fibers: 1.4, form: .25, pits: .35 };
const PAPER_PO = { scale: 1.1, aniso: 1.6, fAngle: 6, fibers: 1.8, form: .3, pits: .4 };
const OV_DD = { 'fx-03-paper-tooth': { depth: .045, aniso: 1.4, fibers: 1.4, pits: .35, form: .25, fRaise: .45, fWidth: .4, mShape: 'none' } };
const OV_PO = { 'fx-03-paper-tooth': { depth: .05, aniso: 1.6, fibers: 1.8, pits: .4, form: .3, fRaise: .45, fWidth: .4, mShape: 'none' } };

/* ── drawdown card (AP-02): layout as the usage; the stations read the live roll ── */
const ddClips = (role) => ({
  bar: (g, w, h) => { const q = a3_DD(w, h); g.fillRect(q.x0 - w * .008, q.b0, q.x1 - q.x0 + w * .016, q.b1 - q.b0); },
  title: (g, w, h) => { typeAt(g, 'Ember', w * .064, h * .315, w * .155, { track: -w * .004 }); },
  key: (g, w, h) => { const q = a3_DD(w, h), m = w * .07, f = a3_fs(w, .02), hl = Math.max(1.1, w * .0024);
    typeAt(g, 'POMELO GROCERS · BRAND COLOR', m, h * .1, f, { font: 'mono', weight: 600, track: f * .1 }); typeAt(g, 'SPEC CARD', w - m, h * .1, f, { font: 'mono', weight: 600, track: f * .1, align: 'right' });
    const ds = a3_fs(w, .026); typeAt(g, 'Our one color, rolled once', w * .58, h * .23, ds, { weight: 500 }); typeAt(g, 'across the card.', w * .58, h * .23 + ds * 1.3, ds, { weight: 500 });
    typeAt(g, 'COVER · OKLCH AT FIVE STATIONS', q.x0, q.y0 - f * .8, f, { font: 'mono', weight: 700, track: f * .08 }); if (w >= 560) typeAt(g, 'OVER A BLACK BAND', q.x1, q.y0 - f * .8, f, { font: 'mono', weight: 700, track: f * .08, align: 'right' }); /* on a phone the two heads would run into each other */
    q.st.forEach((x) => a3_line(g, x, q.y1 + h * .012, x, q.y1 + h * .045, hl));
    a3_line(g, m, h * .915, w - m, h * .915, hl);
    typeAt(g, 'HAND ROLLER · ONE PASS · 300 G COATED', m, h * .915 + f * 1.5, f, { font: 'mono', weight: 600, track: f * .06 }); if (w >= 420) typeAt(g, 'INK 01', w - m, h * .915 + f * 1.5, f, { font: 'mono', weight: 600, track: f * .08, align: 'right' }); },
  labels: (g, w, h, S) => { const R = role === 'roller' ? rollOf(S, ROLL_DD) : ROLL_DD, q = a3_DD(w, h), f = a3_fs(w, .02), L = q.x1 - q.x0;
    q.st.forEach((x) => { const c = stationOf(R, pressureAt(R, x - q.x0, L));
      typeAt(g, Math.round(c.share * 100) + '%', x, q.y1 + h * .045 + f * 1.45, f * 1.2, { font: 'mono', weight: 700, align: 'center' });
      typeAt(g, dec(c.L) + ' ' + dec(c.C), x, q.y1 + h * .045 + f * 2.75, f, { font: 'mono', weight: 600, align: 'center' }); typeAt(g, 'h ' + (c.C < .005 ? '–' : Math.round(c.h)), x, q.y1 + h * .045 + f * 3.95, f, { font: 'mono', weight: 600, align: 'center' }); }); } });
const ddRun = (role) => function (P, W, H, dpr, x) { const C = x.clips, w = W / dpr, h = H / dpr, q = a3_DD(w, h), S = x.S;
  const R = role === 'roller' ? rollOf(S, ROLL_DD) : ROLL_DD, T = role === 'type' ? typeOf(S, TYPE) : TYPE;
  const key = { fx: typePrint, o: { T, ink: TEXT_INK, salt: 0 }, x: { clip: C.key } }, labels = { fx: typePrint, o: { T, ink: TEXT_INK, salt: 5 }, x: { clip: C.labels } };
  const title = { fx: typePrint, o: { T, ink: FX.ink(.64, .2, 38), dens: .926, salt: 13 }, x: { clip: C.title } }, band = { fx: inkEdge, o: BAND, x: { clip: C.bar } };
  const roll = { fx: rollerPrint, o: { R, g: { x0: q.x0, x1: q.x1, y0: q.y0, y1: q.y1, dir: 'x' } } }, pk = paperKey(S, W, H, dpr);
  // the type never touches the strip, so each page keeps the half that does not move and prints its own half on top
  return role === 'roller' ? print([key, band, title], [labels, roll], 'dd-type|' + pk + '|' + sig(C.key) + '|' + sig(C.title), W, H, dpr, S)
    : print([band, roll], [key, labels, title], 'dd-roll|' + pk + '|' + sig(C.bar), W, H, dpr, S); };

/* ── all-day poster (AP-07): layout as the usage ── */
const poClips = () => ({
  bar: (g, w, h) => { const q = a3_PO(w, h); q.bar.forEach((p, k) => { g.fillStyle = `rgba(255,255,255,${p})`; g.fillRect(q.x0 + k * q.bS * 1.12, q.bY, q.bS, q.bS); }); },
  ink: (g, w, h) => { const q = a3_PO(w, h), m = w * .07, f = a3_fs(w, .021), hl = Math.max(1.1, w * .0024); g.strokeStyle = '#fff';
    typeAt(g, 'SALA TAMARINDO PRESENTS', m, m * .75, f, { font: 'mono', weight: 600, track: f * .12 }); typeAt(g, 'SAT 07.11.26', w - m, m * .75, f, { font: 'mono', weight: 600, track: f * .12, align: 'right' });
    typeAt(g, 'Long', m - w * .006, h * .15, w * .2, { track: -w * .006 }); typeAt(g, 'Day', m - w * .006, h * .248, w * .2, { track: -w * .006 });
    typeAt(g, 'Twelve hours,', w * .56, h * .195, a3_fs(w, .03), { weight: 500 }); typeAt(g, 'one roll of ink.', w * .56, h * .195 + a3_fs(w, .03) * 1.3, a3_fs(w, .03), { weight: 500 });
    const nx = q.x1 + w * .07; a3_LINE.forEach(([mn, name]) => { const y = q.Y(mn), hh = (14 + Math.floor(mn / 60)) % 24, mm = mn % 60; a3_line(g, q.x1 + w * .012, y, q.x1 + w * .05, y, hl);
      typeAt(g, String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'), nx, y + f * .36, f, { font: 'mono', weight: 700 }); typeAt(g, name, nx + f * 4.2, y + w * .014, w * .045, { weight: 800, track: -w * .0006, maxW: w * .93 - nx - f * 4.2 }); });
    a3_line(g, q.x1 + w * .012, q.y1, q.x1 + w * .05, q.y1, hl); typeAt(g, '02:00', nx, q.y1 + f * .36, f, { font: 'mono', weight: 700 }); typeAt(g, 'CLOSE', nx + f * 4.2, q.y1 + f * .36, f, { font: 'mono', weight: 700, track: f * .1 });
    q.bar.forEach((p, k) => typeAt(g, String(Math.round(p * 100)), q.x0 + k * q.bS * 1.12 + q.bS / 2, q.bY + q.bS + f * 1.25, f * .9, { font: 'mono', weight: 600, align: 'center' }));
    typeAt(g, 'ROLLER PRESSURE %', q.x0, q.bY - f * .6, f * .9, { font: 'mono', weight: 700, track: f * .1 });
    const rx = w - m - q.bS * .5, ry = q.bY + q.bS * .5, rr = q.bS * .32; a3_circ(g, rx, ry, rr, hl); a3_line(g, rx - rr * 1.6, ry, rx + rr * 1.6, ry, hl); a3_line(g, rx, ry - rr * 1.6, rx, ry + rr * 1.6, hl);
    typeAt(g, 'DOORS 13:30 · €18', rx - q.bS * .9, ry + f * .36, f, { font: 'mono', weight: 700, align: 'right', track: f * .08 }); } });
const poRun = (role) => function (P, W, H, dpr, x) { const C = x.clips, w = W / dpr, h = H / dpr, q = a3_PO(w, h), S = x.S;
  const R = role === 'roller' ? rollOf(S, ROLL_PO) : ROLL_PO, T = role === 'type' ? typeOf(S, TYPE) : TYPE, pk = paperKey(S, W, H, dpr);
  const type = { fx: typePrint, o: { T, ink: TEXT_INK, salt: 0 }, x: { clip: C.ink } };
  const roll = [{ fx: rollerPrint, o: { R, g: { x0: q.x0, x1: q.x1, y0: q.y0, y1: q.y1, dir: 'y' } } }, { fx: pressPrint, o: { R }, x: { clip: C.bar } }];
  return role === 'roller' ? print([type], roll, 'po-type|' + pk + '|' + sig(C.ink), W, H, dpr, S) : print(roll, [type], 'po-roll|' + pk + '|' + sig(C.bar), W, H, dpr, S); };

const DD_SUB = 'The spec card for a grocer\'s one brand color, rolled once across the card over white and over a black opacity band. ';
const PO_SUB = 'A poster for a twelve-hour bill at an invented venue. One ember block is rolled once down the sheet and the roller is not re-inked, so each set\'s time is also how much ink was left. ';
SET.splitKit = { typePrint, rollerPrint, pressPrint, rollOf, typeOf, stationOf, pressureAt };
SET.splits = [
  { id: 'u-drawdown-roller', job: 'brand', title: 'Brand ink · roller run-out', aspect: '3/2', light: { az: 220, el: 30 }, overrides: OV_DD, uses: ['fx-03-paper-tooth', 'fx-02-ink-edge', 'ink-transfer', 'ink-film'],
    split: { code: 'AP-35', slug: 'ap-35-brand-ink-roller-run-out', parent: 'u-drawdown', role: 'roller', sibling: 'AP-36' },
    sub: 'The drawdown card\'s roller on its own: every dial changes the roll and nothing else. ' + DD_SUB + 'Paper sets where the speckle can land, Roller where and how fast the ink gives out, Transfer how the film breaks up, Ink the color. The five stations are recomputed from the same film model on every change. The type is printed at AP-36\'s defaults and does not move.',
    pass: ['Paper · the board the roller meets: tooth, fibers, formation.', 'Roller · where and how fast the ink gives out along the stroke, and how its ends meet the board.', 'Transfer · how the film splits onto the board\'s peaks.', 'Ink · one transparent film, set in OKLCH.'],
    dials: [paperDials(PAPER_DD), rollerDials(ROLL_DD), transferDials(ROLL_DD), inkDials(ROLL_DD)], clips: ddClips('roller'), run: ddRun('roller') },
  { id: 'u-drawdown-type', job: 'brand', title: 'Brand ink · type, printed', aspect: '3/2', light: { az: 220, el: 30 }, overrides: OV_DD, uses: ['fx-02-ink-edge', 'type-edge'],
    split: { code: 'AP-36', slug: 'ap-36-brand-ink-type-printed', parent: 'u-drawdown', role: 'type', sibling: 'AP-35' },
    sub: 'The drawdown card\'s type on its own: every dial changes how the letters print and nothing else. The wordmark, the setting and the rules are inked by the same chain as the roll; Face sets how the letters take ink, Edge works their edges and outline. The roller strip is printed at AP-35\'s defaults and does not move.',
    pass: ['Face · how the letters take ink from the forme.', 'Edge · spread, rag, wander, feather and bite at the edge; the squeezed rim, outline and contour.'],
    dials: [faceDials(TYPE), edgeDials(TYPE)], clips: ddClips('type'), run: ddRun('type') },
  { id: 'u-allday-roller', job: 'print', title: 'All-day poster · roller run-out', aspect: '2/3', light: { az: 220, el: 30 }, overrides: OV_PO, uses: ['fx-03-paper-tooth', 'fx-02-ink-edge', 'ink-transfer', 'ink-film'],
    split: { code: 'AP-37', slug: 'ap-37-all-day-poster-roller-run-out', parent: 'u-allday', role: 'roller', sibling: 'AP-38' },
    sub: 'The all-day poster\'s roller on its own: every dial changes the roll and nothing else. ' + PO_SUB + 'Paper sets where the speckle can land, Roller where and how fast the ink gives out, Transfer how the film breaks up, Ink the color. The press bar is the same roller at six fixed pressures. The type is printed at AP-38\'s defaults and does not move.',
    pass: ['Paper · the sheet the roller meets: tooth, fibers, formation.', 'Roller · where and how fast the ink gives out down the sheet, and how its ends meet the paper.', 'Transfer · how the film splits onto the paper\'s peaks.', 'Ink · one transparent film, set in OKLCH.'],
    dials: [paperDials(PAPER_PO), rollerDials(ROLL_PO), transferDials(ROLL_PO), inkDials(ROLL_PO)], clips: poClips(), run: poRun('roller') },
  { id: 'u-allday-type', job: 'print', title: 'All-day poster · type, printed', aspect: '2/3', light: { az: 220, el: 30 }, overrides: OV_PO, uses: ['fx-02-ink-edge', 'type-edge'],
    split: { code: 'AP-38', slug: 'ap-38-all-day-poster-type-printed', parent: 'u-allday', role: 'type', sibling: 'AP-37' },
    sub: 'The all-day poster\'s type on its own: every dial changes how the letters print and nothing else. The headline, the bill and the rules are inked by the same chain as the block; Face sets how the letters take ink, Edge works their edges and outline. The ember block and the press bar are printed at AP-37\'s defaults and do not move.',
    pass: ['Face · how the letters take ink from the forme.', 'Edge · spread, rag, wander, feather and bite at the edge; the squeezed rim, outline and contour.'],
    dials: [faceDials(TYPE), edgeDials(TYPE)], clips: poClips(), run: poRun('type') }];
})(typeof window !== 'undefined' ? window : self);
