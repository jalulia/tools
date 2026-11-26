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
   feather lets fibers carry ink past it; the rim keeps full film while the face thins. The letterform is a named switch:
   solid, outline (only a rim prints), inline (a line cut inside the stroke) or contour (a line set off outside it); its
   lines are proportioned to each letter's own stroke, so display letters get them and small type stays whole. ── */
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
  const form = T.form | 0, R8 = Math.round(12 * dpr), reach = 3 + Math.abs(spread) + rag + wa * 1.6 + fe + (form === 3 ? R8 * .5 + 3 * dpr : 0), deep = reach + rimW + 2 * dpr + (form ? R8 * .6 : 0);
  const bb = bboxOf(clip, W, H); if (!bb) return done();
  const mg = Math.ceil(reach + R8 + 4), bx = Math.max(0, bb[0] - mg), by = Math.max(0, bb[1] - mg), w2 = Math.min(W, bb[2] + mg + 1) - bx, h2 = Math.min(H, bb[3] + mg + 1) - by;
  const cl = crop(clip, W, bx, by, w2, h2), st = stF ? { h: crop(stF.h, W, bx, by, w2, h2), fib: stF.fib && crop(stF.fib, W, bx, by, w2, h2), form: stF.form && crop(stF.form, W, bx, by, w2, h2) } : null;
  const sd = FX.sdf(cl, w2, h2), TH = thickness(sd, w2, h2, R8), hm = meanOf(stF && stF.h), seed = (T.seed | 0) + (o.salt | 0);
  const N = w2 * h2, COV = new Float32Array(N), Pb = new Float32Array(N), TAU = new Float32Array(N);
  const ebite = T.ebite, face = T.face, ga = .1, gc = Math.cos(ga), gs = Math.sin(ga);
  for (let y = 0; y < h2; y++) { const v = (y + by) / dpr; for (let X = 0; X < w2; X++) { const i = y * w2 + X, s0 = sd[i]; if (s0 < -reach) continue;
    if (s0 > deep) { if (form !== 1) { COV[i] = 1; Pb[i] = T.imp; TAU[i] = face; } continue; } // deep in the stroke: no edge effect reaches here
    const u = (X + bx) / dpr, k = clamp((TH[i] / dpr - 1.2) / 3.8, .12, 1); // k: 1 on display letters, .12 on small type
    let ds = s0 + spread * (spread < 0 ? .3 + .7 * k : .6 + .4 * k); if (wa) ds += wa * k * (FX.fbm(u / ws, v / ws, seed + 3, 3, .5) * 2 - 1) * 1.4;
    const rg = rag && st ? rag * (.5 + .5 * k) * (st.h[i] - hm) : 0, d = ds + rg;
    let c = clamp(d + .5, 0, 1), tau = 1;
    if (ebite > 0 && c > 0) { const near = 1 - clamp(d / (dpr * 2.5 + wa * 2), 0, 1), holes = FX.fbm(u / 2.4, v / 2.4, seed + 41, 3, .55), th = ebite * k * (.2 + .8 * near) * .62; if (holes < th) c *= clamp((holes - th + .04) / .04, 0, 1); }
    const th = TH[i], kc = sstep(.45, .8, k);
    if (form === 1) { if (kc > 0) { const rw = clamp(.24 * th, dpr, 4 * dpr); c *= 1 - clamp(d - rw + .5, 0, 1) * kc; } else if (c > 0 && face < 1) { const rim = 1 - sstep(rimW - .75 * dpr, rimW + .75 * dpr, d); tau = face + (1 - face) * rim; } } // outline: only a rim, in proportion to the stroke; small type stays solid
    else if (c > 0 && face < 1) { const rim = 1 - sstep(rimW - .75 * dpr, rimW + .75 * dpr, d); tau = face + (1 - face) * rim; }
    if (form === 2 && kc > 0 && c > 0) { const ins = .42 * th, lw = clamp(.17 * th, .9 * dpr, 3.2 * dpr); c *= 1 - clamp(lw / 2 - Math.abs(ds - ins) + .5, 0, 1) * kc; } // inline: a line cut along the stroke
    if (fe > 0 && d < .5) { const cr = clamp(1 + (d - .5) / (fe * (.45 + .55 * k)), 0, 1); if (cr > 0) { // hairlines creep out along the paper's grain
        const a = (u * gc + v * gs), b = (-u * gs + v * gc), n1 = FX.fbm(a / 2.8, b / .38, seed + 61, 2, .5), n2 = FX.fbm((a * .906 + b * .423) / 2.2, (-a * .423 + b * .906) / .34, seed + 67, 2, .5);
        let f = Math.max(sstep(.66 - .2 * cr, .72 - .2 * cr, n1), .7 * sstep(.7 - .2 * cr, .76 - .2 * cr, n2)) * cr; if (st && st.fib) f = Math.max(f, sstep(.3, .75, st.fib[i]) * cr);
        f *= .88; if (f > c) { c = f; tau = Math.max(tau, .75); } } }
    if (form === 3 && kc > 0 && d < 0) { const lw = clamp(.17 * th, dpr, 3.2 * dpr), gap = clamp(.32 * th, 1.5 * dpr, 5 * dpr), ring = clamp(lw / 2 + rg * .3 - Math.abs(-ds - gap - lw / 2) + .5, 0, 1) * kc; if (ring > c) { c = ring; tau = 1; } } // contour: a line set off outside, off the letter's own edge
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
  const marks = inkChain(Pb, st, oo, R.ink, alb, A, W, H, dpr, seed, 'film', (down ? 90 : 0) + R.skew, R.streak, TAU);
  const LF = x.lf || (st ? st.lf : null);
  return { alb, lf: LF, lin: null, ink: A, stock: null, mask: Pb, marks: Math.round(marks / (dpr * dpr)), markUnit: 'inked px²' }; } };

/* the press bar (all-day poster): the same roller and ink, stamped at fixed pressures (the clip's alpha) */
const pressPrint = { run(o, W, H, dpr, x) {
  const R = o.R, clip = x.clip, st = stockFor({ stock: 'paper' }, x, W, H, dpr), alb = baseAlb(st, x, W, H), A = new Float32Array(W * H);
  const oo = { split: R.split, bite: R.bite, starve: R.starve, wick: R.wick, mottle: R.mottle, breakup: R.breakup, density: R.density };
  const Pb = Float32Array.from(clip); const marks = inkChain(Pb, st, oo, R.ink, alb, A, W, H, dpr, (R.seed | 0) + 2, 'film', 90 + R.skew, R.streak);
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
const stationOf = (R, P) => { const ink = R.ink, share = P > .002 ? clamp(Math.min(P, 1 - R.starve), 0, 1) : 0, bu = R.breakup, a1 = (bu + (1 - bu) * P * P) * R.density, a0 = (1 - bu) * P * P * R.density;
  const m = ink.lin.map((c) => share * Math.pow(c, a1) + (1 - share) * Math.pow(c, a0)), o = [0, 0, 0]; FX.lin2lab(m[0], m[1], m[2], o);
  return { share, L: o[0], C: Math.hypot(o[1], o[2]), h: ((Math.atan2(o[2], o[1]) * 180 / PI) + 360) % 360 }; };

/* ── controls: the decisions a printer makes, not the engine's knobs. Each one drives its own set of engine values, so no
   two controls fight over one; every one changes the plate visibly at the size it is shown. ── */
const PAPERS = [ // coated · bond · cold press: the board under the roll and the type
  { label: 'Coated', tooth: { scale: .85, oct: 3, aniso: 1.3, fibers: .4, form: .12, pits: .15, depth: .03 }, bite: .72, mottle: .1 },
  { label: 'Bond', tooth: null, bite: .82, mottle: .18 }, // the piece's own sheet (its overrides)
  { label: 'Cold press', tooth: { scale: 2.6, oct: 4, aniso: 1.45, fibers: 2.4, form: .35, pits: .7, depth: .13, ease: ['out', 1.4] }, bite: .93, mottle: .26 }];
const ROLLERS = [ // hard rubber · soft rubber · foam
  { label: 'Hard rubber', fall: .5, ridge: 1, wAmp: 2, wScale: 170, splitX: .75, biteX: 1.1 },
  { label: 'Soft rubber', fall: 2.5, ridge: .3, wAmp: 5, wScale: 120, splitX: 1, biteX: 1 },
  { label: 'Foam', fall: 7, ridge: 0, wAmp: 14, wScale: 55, splitX: 1.9, biteX: .62 }];
const PRESSES = [ // letterpress · offset · rubber stamp: how the type meets the sheet
  { label: 'Letterpress', imp: .978, starve: .014, mottle: .24, density: 1.35, spread: .14, rag: .38, wander: .35, wScale: 22, feather: .3, ebite: 0, rim: 1.4, face: .8 },
  { label: 'Offset', imp: 1, starve: 0, mottle: .06, density: 1.3, spread: .03, rag: .05, wander: 0, wScale: 22, feather: 0, ebite: 0, rim: 1, face: 1 },
  { label: 'Rubber stamp', imp: .93, starve: .045, mottle: .45, density: 1.12, spread: .38, rag: .5, wander: .9, wScale: 13, feather: .45, ebite: .12, rim: 2.4, face: .7 }];
const LETTERFORMS = ['Solid', 'Outline', 'Inline', 'Contour'];
const opt = (list) => list.map((x, i) => ({ v: i, label: typeof x === 'string' ? x : x.label }));
const ctl = (S, id) => (S && S[id]) || {};
/* the roller page's controls → the roll's engine values */
const rollOf = (S, def) => { const r = Object.assign({}, def.ctl, pick(ctl(S, 'fx-02-ink-edge'), ['load', 'runout', 'pressure', 'drift', 'roller', 'seed']), pick(ctl(S, 'ink-film'), ['body', 'clump', 'streak']), pick(ctl(S, 'fx-03-paper-tooth'), ['paper']));
  const RL = ROLLERS[r.roller | 0] || ROLLERS[1], PA = PAPERS[r.paper | 0] || PAPERS[1], b = clamp(r.body, 0, 1);
  return { runAt: r.load, runLen: r.runout, curve: def.curve, pressure: r.pressure, skew: r.drift, seed: r.seed, fall: RL.fall, ridge: RL.ridge, wAmp: RL.wAmp, wScale: RL.wScale,
    split: r.clump * RL.splitX, streak: r.streak, bite: PA.bite * RL.biteX, mottle: PA.mottle, starve: .004, breakup: .62 + .38 * b, density: 1 + .3 * b,
    ink: hexInk(S && S.inks && S.inks.rollerInk, def.ink), paper: r.paper | 0 }; };
/* the type page's controls → the letters' engine values */
const typeOf = (S, def) => { const c = Object.assign({}, def, pick(ctl(S, 'fx-02-ink-edge'), ['press', 'inkAmt', 'impression', 'wear']), pick(ctl(S, 'type-edge'), ['form', 'seed']));
  const T = Object.assign({}, PRESSES[c.press | 0] || PRESSES[0]), x = clamp(c.inkAmt, -1, 1), y = clamp(c.impression, -1, 1), w = clamp(c.wear, 0, 1);
  T.spread += x > 0 ? x * .5 : x * .4; T.starve += Math.max(0, -x) * .1; T.density *= 1 + .15 * x; // starved ↔ heavy
  if (y < 0) { T.imp -= -y * .2; T.face += (1 - T.face) * -y; T.spread -= -y * .12; } else { T.face -= y * .32; T.rim *= 1 + .9 * y; T.spread += .1 * y; } // kiss ↔ deep
  T.imp = clamp(T.imp, .78, 1); T.face = clamp(T.face, .3, 1);
  T.wander += w * 2.2; T.ebite = clamp(T.ebite + w * .95, 0, 1); T.wScale *= 1 - .3 * w; // new ↔ worn: waver and dings, in proportion to the letter
  T.form = c.form | 0; T.seed = c.seed; T.breakup = .6; T.bite = .6; return T; };
const ROLLER_CTL = { load: 50, runout: 102, pressure: 1, drift: 0, roller: 1, seed: 41, body: .84, clump: .8, streak: 2.2, paper: 1 };
const TYPE_CTL = { press: 0, inkAmt: 0, impression: 0, wear: 0, form: 0, seed: 7 };

const rollerDials = (c) => ({ id: 'fx-02-ink-edge', name: 'Roller', short: 'FX-02', atoms: ['deposit'],
  implementation: 'One pass of a hand roller. Ink on the roller sets where along the stroke it is down to half its ink, Run-out how much of the stroke that takes, Pressure how hard the hand leans (below 1 the solid opens onto the paper before the ink runs out), Hand drift how far the run-out line turns off square. The roller sets its ends and wander: hard rubber prints crisp ends with a ridge of squeezed ink that holds into the run-out, soft rubber a softer edge, foam a wandering edge and an open, cellular film.',
  limits: 'Run-out under 6% is a hard vector edge. Hand drift past 15° turns the run-out off the strip before the stations can read it.',
  params: {
    load: { value: c.load, range: [10, 95], label: 'Ink on the roller', step: 1, unit: '%', note: 'how far along the stroke the roller is down to half its ink. More ink, a longer solid' },
    runout: { value: c.runout, range: [6, 160], label: 'Run-out', step: 1, unit: '%', scale: 'log', note: 'how much of the stroke the ink takes to give out: a short burst or a long fade' },
    pressure: { value: c.pressure, range: [.65, 1], label: 'Pressure', step: .01, note: 'how hard the hand leans. Below 1 the solid opens onto the paper before the ink runs out' },
    drift: { value: c.drift, range: [-15, 15], label: 'Hand drift', step: .5, unit: '°', note: 'the hand turns off square: the run-out line and the streaks tilt with it' },
    roller: { value: c.roller, options: opt(ROLLERS), label: 'Roller', note: 'hard rubber: crisp ends and a ridge of squeezed ink; soft rubber: a softer edge; foam: a wandering edge and an open, cellular film' },
    seed: { value: c.seed, range: [1, 999], label: 'Pass', step: 1, note: 'roll it again: the same settings, a new pass' } } });
const inkDials = (c) => ({ id: 'ink-film', name: 'Ink', short: 'FX-02', atoms: ['deposit'],
  implementation: 'The ink as it splits between roller and paper (the ink chain): the paper\'s height, blended with the film\'s own split, is ranked so that pressure P inks exactly the top P of the surface. A stiff ink breaks into sharp specks at full strength; a loose one stays a thinner, whole film that fades. Clump size is how big the film\'s own breaks are; Streak draws them out along the stroke. The color is the Color tab.',
  limits: 'Clump size past 2.5 px reads as blotches. Streak past 6 reads as scanlines.',
  params: {
    body: { value: c.body, range: [0, 1], label: 'Ink body', step: .01, note: '0 loose: a thin film that fades to tone. 1 stiff: a tacky ink that breaks into sharp specks at full strength' },
    clump: { value: c.clump, range: [.4, 2.5], label: 'Clump size', step: .05, unit: 'px', scale: 'log', note: 'how big the film\'s own breaks are as it splits off the roller' },
    streak: { value: c.streak, range: [1, 6], label: 'Streak', step: .1, note: 'clumps drawn out along the stroke: a dry roller, a fast pass' } } });
const paperDials = (c) => ({ id: 'fx-03-paper-tooth', name: 'Paper', short: 'FX-03', atoms: ['form'],
  implementation: 'The sheet is FX-03 live: tooth, formation, fibers and pits under the one sheet light. As the ink gives out it only reaches the paper\'s peaks, so the run-out speckle is the paper itself: fine and even on coated board, fibrous on bond, coarse and deep on cold press.',
  limits: 'One sheet: the paper under the type changes with it.',
  params: { paper: { value: c.paper, options: opt(PAPERS), label: 'Paper', note: 'coated: fine, even speckle; bond: fibrous; cold press: coarse tooth and deep valleys' } } });
const pressDials = (c) => ({ id: 'fx-02-ink-edge', name: 'Press', short: 'FX-02', atoms: ['deposit'],
  implementation: 'The letters are inked by the same chain as the roll, then their edges are worked on each letter\'s signed distance. The press sets the character: letterpress squeezes ink to a darker rim with a light impression in the face; offset is clean and flat; a rubber stamp is soft, spread and uneven. Ink, Impression and Wear move it from there; wear and the lines are in proportion to each letter, so the display type takes them and the small setting stays whole.',
  limits: 'Heavy ink closes the counters of the small mono labels first. A kiss impression opens the face to the paper\'s valleys; the small setting stops reading below that.',
  params: {
    press: { value: c.press, options: opt(PRESSES), label: 'Press', note: 'letterpress: a squeezed rim and a light impression; offset: clean and flat; rubber stamp: soft, spread and uneven' },
    inkAmt: { value: c.inkAmt, range: [-1, 1], label: 'Ink', step: .01, note: '−1 starved: thin, eaten edges and pinholes. +1 heavy: ink squeezed past the edge, deeper and darker' },
    impression: { value: c.impression, range: [-1, 1], label: 'Impression', step: .01, note: '−1 kiss: the face only touches the paper\'s peaks. +1 deep: the ink is pushed to a wide, dark rim' },
    wear: { value: c.wear, range: [0, 1], label: 'Wear', step: .01, note: '0 new type. 1 worn: wavering edges and dings, on the display letters' } } });
const formDials = (c) => ({ id: 'type-edge', name: 'Letterform', short: 'Type', atoms: ['deposit'],
  implementation: 'Each letter\'s alpha becomes a signed distance in device px. Outline prints only a rim, Inline cuts a line along the inside of the stroke, Contour sets a line off the outside; each line is proportioned to the letter\'s own stroke (the running maximum of its inside distance), so display letters carry it and small type stays solid. Coverage stays one device px wide, so edges are crisp at any setting.',
  limits: 'Inline and Contour act only on display letters; the small mono setting keeps its solid form.',
  params: {
    form: { value: c.form, options: opt(LETTERFORMS), label: 'Letterform', note: 'solid; outline: only the rim prints; inline: a line cut inside the stroke; contour: a line set off outside it' },
    seed: { value: c.seed, range: [1, 999], label: 'Pass', step: 1, note: 'print it again: the same settings, a new pass' } } });

/* ── inks: the Color tab edits the hex in the variant; each page's render reads its own inks from there ── */
const hexInk = (hex, fallback) => { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return fallback; const v = [0, 2, 4].map((k) => parseInt(m[1].slice(k, k + 2), 16) / 255).map((c) => c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4));
  const o = [0, 0, 0]; FX.lin2lab(v[0], v[1], v[2], o); return FX.ink(o[0], Math.hypot(o[1], o[2]), ((Math.atan2(o[2], o[1]) * 180 / PI) + 360) % 360); };
const toHex = (ink) => '#' + ink.lin.map((c) => { const s = c <= .0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - .055; return Math.round(clamp(s, 0, 1) * 255).toString(16).padStart(2, '0'); }).join('');
const EMBER_HEX = toHex(FX.ink(.64, .2, 38)), KEY_HEX = toHex(TEXT_INK), EMBER = hexInk(EMBER_HEX), KEY = hexInk(KEY_HEX); // the inks as the Color tab holds them, so both pages of a pair print the same

/* ── defaults: both pages of a pair open on the same piece ── */
const DEF_DD = { ctl: ROLLER_CTL, curve: 0, ink: EMBER }, DEF_PO = { ctl: Object.assign({}, ROLLER_CTL, { seed: 57, streak: 2.4 }), curve: 1, ink: EMBER };
const OV_DD = { 'fx-03-paper-tooth': { depth: .045, aniso: 1.4, fibers: 1.4, pits: .35, form: .25, fRaise: .45, fWidth: .4, mShape: 'none' } };
const OV_PO = { 'fx-03-paper-tooth': { depth: .05, aniso: 1.6, fibers: 1.8, pits: .4, form: .3, fRaise: .45, fWidth: .4, mShape: 'none' } };
/* the sheet: the piece's own paper, or the Paper switch's (roller page only) */
const sheetOf = (S, R) => { const PA = PAPERS[R.paper] || PAPERS[1]; if (!PA.tooth) return S; const S2 = Object.assign({}, S); S2['fx-03-paper-tooth'] = Object.assign({}, S['fx-03-paper-tooth'], PA.tooth); return S2; };

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
  labels: (g, w, h, S) => { const R = rollOf(role === 'roller' ? S : null, DEF_DD), q = a3_DD(w, h), f = a3_fs(w, .02), L = q.x1 - q.x0;
    q.st.forEach((x) => { const c = stationOf(R, pressureAt(R, x - q.x0, L));
      typeAt(g, Math.round(c.share * 100) + '%', x, q.y1 + h * .045 + f * 1.45, f * 1.2, { font: 'mono', weight: 700, align: 'center' });
      typeAt(g, dec(c.L) + ' ' + dec(c.C), x, q.y1 + h * .045 + f * 2.75, f, { font: 'mono', weight: 600, align: 'center' }); typeAt(g, 'h ' + (c.C < .005 ? '–' : Math.round(c.h)), x, q.y1 + h * .045 + f * 3.95, f, { font: 'mono', weight: 600, align: 'center' }); }); } });
const ddRun = (role) => function (P, W, H, dpr, x) { const C = x.clips, w = W / dpr, h = H / dpr, q = a3_DD(w, h);
  const R = rollOf(role === 'roller' ? x.S : null, DEF_DD), T = typeOf(role === 'type' ? x.S : null, TYPE_CTL), S = sheetOf(x.S, R), I = (role === 'type' && x.S.inks) || {};
  const keyInk = hexInk(I.keyInk, KEY), markInk = hexInk(I.wordmark, EMBER);
  const key = { fx: typePrint, o: { T, ink: keyInk, salt: 0 }, x: { clip: C.key } }, labels = { fx: typePrint, o: { T, ink: keyInk, salt: 5 }, x: { clip: C.labels } };
  const title = { fx: typePrint, o: { T, ink: markInk, dens: .926, salt: 13 }, x: { clip: C.title } }, band = { fx: inkEdge, o: BAND, x: { clip: C.bar } };
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
const poRun = (role) => function (P, W, H, dpr, x) { const C = x.clips, w = W / dpr, h = H / dpr, q = a3_PO(w, h);
  const R = rollOf(role === 'roller' ? x.S : null, DEF_PO), T = typeOf(role === 'type' ? x.S : null, TYPE_CTL), S = sheetOf(x.S, R), pk = paperKey(S, W, H, dpr);
  const type = { fx: typePrint, o: { T, ink: hexInk(role === 'type' && x.S.inks && x.S.inks.keyInk, KEY), salt: 0 }, x: { clip: C.ink } };
  const roll = [{ fx: rollerPrint, o: { R, g: { x0: q.x0, x1: q.x1, y0: q.y0, y1: q.y1, dir: 'y' } } }, { fx: pressPrint, o: { R }, x: { clip: C.bar } }];
  return role === 'roller' ? print([type], roll, 'po-type|' + pk + '|' + sig(C.ink), W, H, dpr, S) : print(roll, [type], 'po-roll|' + pk + '|' + sig(C.bar), W, H, dpr, S); };

const DD_SUB = 'The spec card for a grocer\'s one brand color, rolled once across the card over white and over a black opacity band. ';
const PO_SUB = 'A poster for a twelve-hour bill at an invented venue. One ember block is rolled once down the sheet and the roller is not re-inked, so each set\'s time is also how much ink was left. ';
const ROLLER_PASS = ['Paper · the sheet the roller meets: coated, bond or cold press.', 'Roller · how much ink it carries, how fast it gives out, how hard the hand leans and drifts, and what the roller is made of.', 'Ink · how the film splits onto the paper\'s peaks; its color is the Color tab.'];
const TYPE_PASS = ['Press · how the type meets the sheet: letterpress, offset or rubber stamp; then ink, impression and wear.', 'Letterform · solid, outline, inline or contour, in proportion to each letter.'];
SET.splitKit = { typePrint, rollerPrint, pressPrint, rollOf, typeOf, stationOf, pressureAt, hexInk };
SET.splits = [
  { id: 'u-drawdown-roller', job: 'brand', title: 'Brand ink · roller run-out', aspect: '3/2', light: { az: 220, el: 30 }, overrides: OV_DD, uses: ['fx-03-paper-tooth', 'fx-02-ink-edge', 'ink-film'],
    split: { code: 'AP-35', slug: 'ap-35-brand-ink-roller', parent: 'u-drawdown', role: 'roller', sibling: 'AP-36' },
    variants: [{ id: 'set', label: 'As drawn', sw: [EMBER_HEX], rollerInk: EMBER_HEX }],
    sub: 'The drawdown card\'s roller on its own: every control changes the roll and nothing else. ' + DD_SUB + 'Set the paper, how much ink the roller carries and how fast it gives out, how hard the hand leans and drifts, what the roller is made of, and how the ink splits. The five stations are recomputed from the same film model on every change. The brand ink is in the Color tab. The type is printed as AP-36 opens and does not move.',
    pass: ROLLER_PASS, dials: [paperDials(DEF_DD.ctl), rollerDials(DEF_DD.ctl), inkDials(DEF_DD.ctl)], clips: ddClips('roller'), run: ddRun('roller') },
  { id: 'u-drawdown-type', job: 'brand', title: 'Brand ink · type, printed', aspect: '3/2', light: { az: 220, el: 30 }, overrides: OV_DD, uses: ['fx-02-ink-edge', 'type-edge'],
    split: { code: 'AP-36', slug: 'ap-36-brand-ink-type', parent: 'u-drawdown', role: 'type', sibling: 'AP-35' },
    variants: [{ id: 'set', label: 'As drawn', sw: [EMBER_HEX, KEY_HEX], wordmark: EMBER_HEX, keyInk: KEY_HEX }],
    sub: 'The drawdown card\'s type on its own: every control changes how the letters print and nothing else. Choose the press and the letterform, then the ink, the impression and the wear. The wordmark and key inks are in the Color tab. The roller strip is printed as AP-35 opens and does not move.',
    pass: TYPE_PASS, dials: [pressDials(TYPE_CTL), formDials(TYPE_CTL)], clips: ddClips('type'), run: ddRun('type') },
  { id: 'u-allday-roller', job: 'print', title: 'All-day poster · roller run-out', aspect: '2/3', light: { az: 220, el: 30 }, overrides: OV_PO, uses: ['fx-03-paper-tooth', 'fx-02-ink-edge', 'ink-film'],
    split: { code: 'AP-37', slug: 'ap-37-all-day-poster-roller', parent: 'u-allday', role: 'roller', sibling: 'AP-38' },
    variants: [{ id: 'set', label: 'As drawn', sw: [EMBER_HEX], rollerInk: EMBER_HEX }],
    sub: 'The all-day poster\'s roller on its own: every control changes the roll and nothing else. ' + PO_SUB + 'Set the paper, how much ink the roller carries and how fast it gives out, how hard the hand leans and drifts, what the roller is made of, and how the ink splits. The press bar is the same roller at six fixed pressures. The ink is in the Color tab. The type is printed as AP-38 opens and does not move.',
    pass: ROLLER_PASS, dials: [paperDials(DEF_PO.ctl), rollerDials(DEF_PO.ctl), inkDials(DEF_PO.ctl)], clips: poClips(), run: poRun('roller') },
  { id: 'u-allday-type', job: 'print', title: 'All-day poster · type, printed', aspect: '2/3', light: { az: 220, el: 30 }, overrides: OV_PO, uses: ['fx-02-ink-edge', 'type-edge'],
    split: { code: 'AP-38', slug: 'ap-38-all-day-poster-type', parent: 'u-allday', role: 'type', sibling: 'AP-37' },
    variants: [{ id: 'set', label: 'As drawn', sw: [KEY_HEX], keyInk: KEY_HEX }],
    sub: 'The all-day poster\'s type on its own: every control changes how the letters print and nothing else. Choose the press and the letterform, then the ink, the impression and the wear. The key ink is in the Color tab. The ember block and the press bar are printed as AP-37 opens and do not move.',
    pass: TYPE_PASS, dials: [pressDials(TYPE_CTL), formDials(TYPE_CTL)], clips: poClips(), run: poRun('type') }];
})(typeof window !== 'undefined' ? window : self);
