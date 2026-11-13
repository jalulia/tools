"use strict";
/* ---------- shared kit: rng, noise, blur, canvas ---------- */
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function mulberry(seed) { let a = (seed | 0) || 1; return function () { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function gaussRng(r) { let spare = null; return function () { if (spare !== null) { const s = spare; spare = null; return s; } let u, v, s; do { u = r() * 2 - 1; v = r() * 2 - 1; s = u * u + v * v; } while (s >= 1 || s === 0); const m = Math.sqrt(-2 * Math.log(s) / s); spare = v * m; return u * m; }; }
function hashI(x, y, s) { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; }
function vnoise(seed) { return function (x, y) { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); const a = hashI(xi, yi, seed), b = hashI(xi + 1, yi, seed), c = hashI(xi, yi + 1, seed), d = hashI(xi + 1, yi + 1, seed); return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v; }; }
function fbm(n, x, y, o) { let s = 0, a = .5, f = 1, t = 0; for (let i = 0; i < o; i++) { s += a * n(x * f + i * 17.3, y * f - i * 9.1); t += a; a *= .5; f *= 2; } return s / t; }
/* inverse normal CDF (Acklam) */
function probit(p) { p = clamp(p, 1e-6, 1 - 1e-6); const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239], b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572], c = [-.007784894002430293, -.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783], d = [.007784695709041462, .3224671290700398, 2.445134137142996, 3.754408661907416]; let q, r; if (p < .02425) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); } if (p > 1 - .02425) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); } q = p - .5; r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
/* separable gaussian on a Float32Array. small sigma: true kernel; large: 3 box passes */
function gblur(src, w, h, sigma) {
  if (sigma < .05) return src;
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
  if (sigma < 3.2) {
    const R = Math.max(1, Math.ceil(sigma * 3)), k = new Float32Array(2 * R + 1); let s = 0;
    for (let i = -R; i <= R; i++) { k[i + R] = Math.exp(-i * i / (2 * sigma * sigma)); s += k[i + R]; }
    for (let i = 0; i < k.length; i++) k[i] /= s;
    for (let y = 0; y < h; y++) { const o = y * w; for (let x = 0; x < w; x++) { let a = 0; for (let i = -R; i <= R; i++) { const xx = x + i < 0 ? 0 : x + i >= w ? w - 1 : x + i; a += src[o + xx] * k[i + R]; } tmp[o + x] = a; } }
    for (let y = 0; y < h; y++) { const o = y * w; for (let x = 0; x < w; x++) { let a = 0; for (let i = -R; i <= R; i++) { const yy = y + i < 0 ? 0 : y + i >= h ? h - 1 : y + i; a += tmp[yy * w + x] * k[i + R]; } out[o + x] = a; } }
    return out;
  }
  const n = 3, wi = Math.sqrt(12 * sigma * sigma / n + 1); let wl = Math.floor(wi); if (wl % 2 === 0) wl--; const m = Math.round((12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4));
  let a = src, b = tmp;
  for (let p = 0; p < n; p++) {
    const r = ((p < m ? wl : wl + 2) - 1) >> 1, inv = 1 / (2 * r + 1);
    for (let y = 0; y < h; y++) { const o = y * w; let acc = 0; for (let i = -r; i <= r; i++) acc += a[o + clamp(i, 0, w - 1)]; for (let x = 0; x < w; x++) { b[o + x] = acc * inv; acc += a[o + Math.min(w - 1, x + r + 1)] - a[o + Math.max(0, x - r)]; } }
    for (let x = 0; x < w; x++) { let acc = 0; for (let i = -r; i <= r; i++) acc += b[clamp(i, 0, h - 1) * w + x]; for (let y = 0; y < h; y++) { out[y * w + x] = acc * inv; acc += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x]; } }
    a = out.slice ? (p < n - 1 ? out.slice() : out) : out;
  }
  return out;
}
/* separable Catmull-Rom upsample of a Float32 grid: flat spectrum up to the cell frequency, then a steep fall */
function upsampleCR(src, w0, h0, W, H) {
  const tmp = new Float32Array(W * h0), out = new Float32Array(W * H), cr = (a, b, c, d, t) => .5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  for (let x = 0; x < W; x++) { const f = (x + .5) * w0 / W - .5, i = Math.floor(f), t = f - i, i0 = clamp(i - 1, 0, w0 - 1), i1 = clamp(i, 0, w0 - 1), i2 = clamp(i + 1, 0, w0 - 1), i3 = clamp(i + 2, 0, w0 - 1); for (let y = 0; y < h0; y++) { const o = y * w0; tmp[y * W + x] = cr(src[o + i0], src[o + i1], src[o + i2], src[o + i3], t); } }
  for (let y = 0; y < H; y++) { const f = (y + .5) * h0 / H - .5, i = Math.floor(f), t = f - i, o0 = clamp(i - 1, 0, h0 - 1) * W, o1 = clamp(i, 0, h0 - 1) * W, o2 = clamp(i + 1, 0, h0 - 1) * W, o3 = clamp(i + 2, 0, h0 - 1) * W, o = y * W; for (let x = 0; x < W; x++) out[o + x] = cr(tmp[o0 + x], tmp[o1 + x], tmp[o2 + x], tmp[o3 + x], t); }
  return out;
}
function mk(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; c.getContext("2d", { willReadFrequently: true }); return c; }   /* CPU raster: same pixels on every machine */
function chan(ctx, w, h, c) { const d = ctx.getImageData(0, 0, w, h).data, o = new Float32Array(w * h); for (let i = 0, j = c || 0; i < o.length; i++, j += 4) o[i] = d[j] / 255; return o; }
function hex(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgbHex(c) { return "#" + c.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join(""); }
function css(c, a) { return a === undefined ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`; }
const PLATES = [];
/* ===== MINDGUT ROBOT · one construction, posed by angles or by IK targets =====
   Drawn into a plate system, not as an image: each part fills its own ink plate(s) and strokes the key.
   Parts go back to front; every part first erases the key under its own silhouette, so lines behind it vanish
   the way a drawn figure's hidden lines do.
   Local frame: origin at the hip center, unit s (= height / 9.6), +x to the robot's right as drawn, +y down.

   mgRobot({
     x, y,              world position of the hip center
     h,                 overall height, antenna ball to boot sole
     rot,               whole-body rotation (rad), flip: 1 | -1 (mirror)
     head: tilt (rad), look: -1..1 (eyes shift),
     arms: [back, front], legs: [back, front]  each { a, b } angles (rad, 0 = straight down, + = toward +x)
                                               or { to:[wx, wy], bend: 1|-1 } an IK target in world space
                                               plus { front: bool } to draw a limb in front of the torso
     plates: { body, light, accent, dark, shadow }  each { g, style, op? }   (op "destination-out" erases)
     key: { g, style, w },  shadow: [dx, dy] (world px) or null,  detail: 0..1
   })                                                                                                     */
function mgRobot(o) {
  const S = o.h / 9.6, rot = o.rot || 0, fl = o.flip || 1, K = o.key, kw = K.w, det = o.detail == null ? 1 : o.detail;
  const cr = Math.cos(rot), sr = Math.sin(rot);
  const toLocal = (wx, wy) => { const dx = wx - o.x, dy = wy - o.y; return [(dx * cr + dy * sr) / (S * fl), (-dx * sr + dy * cr) / S]; };
  const T = g => { g.save(); g.translate(o.x, o.y); g.rotate(rot); g.scale(fl * S, S); };
  const plate = (name, path) => { const p = o.plates && o.plates[name]; if (!p) return false; const g = p.g; T(g); g.globalCompositeOperation = p.op || "source-over"; g.fillStyle = p.style; path(g); g.fill(); g.restore(); return true; };
  const key = (path, w, fill) => { const g = K.g; T(g); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = K.style; g.fillStyle = K.style; g.lineWidth = (w || kw) / S; path(g); fill ? g.fill() : g.stroke(); g.restore(); };
  const hide = path => { const g = K.g; T(g); g.globalCompositeOperation = "destination-out"; g.fillStyle = "#000"; path(g); g.fill(); g.restore(); };
  /* a part: erase key under it, fill its plate, stroke its outline */
  const part = (path, ink) => { hide(path); plate(ink || "body", path); key(path); };
  const rr = (x, y, w, h, r) => g => { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); };
  const circ = (x, y, r) => g => { g.beginPath(); g.arc(x, y, r, 0, 6.2832); };
  const capsule = (A, B, w) => g => { const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1e-6, nx = -dy / L * w / 2, ny = dx / L * w / 2, a = Math.atan2(dy, dx); g.beginPath(); g.moveTo(A[0] + nx, A[1] + ny); g.lineTo(B[0] + nx, B[1] + ny); g.arc(B[0], B[1], w / 2, a + Math.PI / 2, a - Math.PI / 2, true); g.lineTo(A[0] - nx, A[1] - ny); g.arc(A[0], A[1], w / 2, a - Math.PI / 2, a + Math.PI / 2, true); g.closePath(); };
  /* geometry, in s */
  const torso = { w: 3.1, wb: 2.75, h: 3.0, top: -3.0, r: .55 }, neck = { w: .9, h: .32 }, head = { w: 3.5, h: 2.45, r: .85 };
  const headY = torso.top - neck.h - head.h, shoulderY = torso.top + .55;
  const LIMB = { arm: [1.3, 1.2, .62], leg: [1.08, 1.02, .7] };
  /* a limb's three points from angles or an IK target (local frame) */
  const limb = (root, spec, kind, side) => {
    const [a, b] = LIMB[kind];
    if (spec && spec.to) {
      let [tx, ty] = toLocal(spec.to[0], spec.to[1]); let dx = tx - root[0], dy = ty - root[1], d = Math.hypot(dx, dy);
      const dm = Math.min(a + b - .02, Math.max(Math.abs(a - b) + .02, d)); if (d > dm) { tx = root[0] + dx / d * dm; ty = root[1] + dy / d * dm; d = dm; }
      const th = Math.atan2(ty - root[1], tx - root[0]), al = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1)) * (spec.bend || side);
      const e = [root[0] + Math.cos(th + al) * a, root[1] + Math.sin(th + al) * a]; return [root, e, [tx, ty]];
    }
    const s0 = (spec && spec.a) || 0, s1 = s0 + ((spec && spec.b) || 0), d0 = Math.PI / 2 - s0, d1 = Math.PI / 2 - s1;
    const e = [root[0] + Math.cos(d0) * a, root[1] + Math.sin(d0) * a]; return [root, e, [e[0] + Math.cos(d1) * b, e[1] + Math.sin(d1) * b]];
  };
  const st = o.stance == null ? 1 : o.stance;   /* 1 = frontal; toward 0 the limbs root nearer the center line, for three-quarter poses */
  const arms = (o.arms || [{ a: -.25, b: -.15 }, { a: .25, b: .15 }]).map((sp, i) => ({ sp, pts: limb([(i ? 1.62 : -1.62) * (.45 + .55 * st), shoulderY], sp, "arm", i ? -1 : 1), side: i ? 1 : -1 }));
  const legs = (o.legs || [{ a: -.05, b: 0 }, { a: .05, b: 0 }]).map((sp, i) => ({ sp, pts: limb([(i ? .78 : -.78) * (.25 + .75 * st), -.05], sp, "leg", i ? 1 : -1), side: i ? 1 : -1 }));
  /* segmented tube: rings across the tube every .36 s, a light joint disc at the elbow or knee */
  const tube = (A, B, w) => {
    const path = capsule(A, B, w); part(path);
    if (det > .2) { const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), n = Math.max(1, Math.floor(L / .34)), nx = -dy / L, ny = dx / L;
      key(g => { g.beginPath(); for (let k = 1; k < n; k++) { const t = k / n, cx = A[0] + dx * t, cy = A[1] + dy * t; g.moveTo(cx + nx * w * .5, cy + ny * w * .5); g.quadraticCurveTo(cx + nx * 0 + dx / L * .09, cy + dy / L * .09, cx - nx * w * .5, cy - ny * w * .5); } }, kw * .62); }
  };
  const joint = (P, r) => part(circ(P[0], P[1], r), o.plates.accent ? "accent" : "light");
  const hand = (E, W, side) => { /* a C-claw, opening along the forearm */
    const a = Math.atan2(W[1] - E[1], W[0] - E[0]), r = .5, gap = .9;
    const path = g => { g.beginPath(); g.arc(W[0] + Math.cos(a) * r * .5, W[1] + Math.sin(a) * r * .5, r, a + gap / 2, a - gap / 2 + 6.2832); g.arc(W[0] + Math.cos(a) * r * .5, W[1] + Math.sin(a) * r * .5, r * .42, a - gap / 2 + 6.2832, a + gap / 2, true); g.closePath(); };
    part(path);
  };
  const foot = (K2, A2, side) => { /* boot: toe points away from the body's center line */
    const dir = side, x0 = K2[0] - .55 + dir * .18, y0 = K2[1] - .12;
    part(rr(x0, y0, 1.1 + .25, .62, [.34, .34, .14, .14]));
    if (det > .2) { part(rr(x0 + (dir > 0 ? .78 : 0), y0, .57, .62, dir > 0 ? [.1, .34, .14, .1] : [.34, .1, .1, .14]), o.plates.accent ? "accent" : "light"); key(g => { g.beginPath(); g.moveTo(x0 + .05, y0 + .5); g.lineTo(x0 + 1.3, y0 + .5); }, kw * .6); }
  };
  const drawArm = A => { const [S0, E, Wr] = A.pts; tube(S0, E, LIMB.arm[2]); tube(E, Wr, LIMB.arm[2] * .92); if (det > .2) joint(E, .36); hand(E, Wr, A.side); };
  const drawLeg = A => { const [S0, Kn, F] = A.pts; tube(S0, Kn, LIMB.leg[2]); tube(Kn, F, LIMB.leg[2] * .92); if (det > .2) joint(Kn, .4); foot(F, Kn, A.side); };
  /* cast shadow: the whole silhouette, offset, before anything else */
  if (o.shadow && o.pass !== "figure") { const sh = o.plates.shadow || { g: K.g, style: K.style }; const g = sh.g; g.save(); g.translate(o.shadow[0], o.shadow[1]); T(g); g.fillStyle = sh.style; g.globalCompositeOperation = sh.op || "source-over";
    const sil = [rr(-torso.w / 2, torso.top, torso.w, torso.h, torso.r), rr(-head.w / 2, headY, head.w, head.h, head.r)]; arms.concat(legs).forEach(L => { sil.push(capsule(L.pts[0], L.pts[1], .75)); sil.push(capsule(L.pts[1], L.pts[2], .7)); });
    legs.forEach(L => sil.push(rr(L.pts[2][0] - .7, L.pts[2][1] - .12, 1.5, .62, .3))); for (const p of sil) { p(g); g.fill(); } g.restore(); g.restore(); }
  if (o.pass === "shadow") return null;
  /* back to front */
  arms.filter(A => !(A.sp && A.sp.front)).forEach(drawArm);
  legs.filter(L => !(L.sp && L.sp.front)).forEach(drawLeg);
  /* torso: a slightly tapered box with a chest panel carrying a small double helix and a dial */
  const torsoPath = g => { const t = torso, y0 = t.top, y1 = t.top + t.h, r = t.r; g.beginPath(); g.moveTo(-t.w / 2 + r, y0); g.lineTo(t.w / 2 - r, y0); g.quadraticCurveTo(t.w / 2, y0, t.w / 2, y0 + r); g.lineTo(t.wb / 2, y1 - r); g.quadraticCurveTo(t.wb / 2, y1, t.wb / 2 - r, y1); g.lineTo(-t.wb / 2 + r, y1); g.quadraticCurveTo(-t.wb / 2, y1, -t.wb / 2, y1 - r); g.lineTo(-t.w / 2, y0 + r); g.quadraticCurveTo(-t.w / 2, y0, -t.w / 2 + r, y0); g.closePath(); };
  part(torsoPath);
  if (det > .2) {
    const px = -.95, py = torso.top + .55, pw = 1.9, ph = 1.35;
    part(rr(px, py, pw, ph, .28), "light");
    key(g => { g.beginPath(); for (let s2 = 0; s2 < 2; s2++) { for (let k = 0; k <= 16; k++) { const t = k / 16, x = px + .28 + t * (pw * .62), y = py + ph / 2 + Math.sin(t * 6.2832 + s2 * Math.PI) * ph * .26; k ? g.lineTo(x, y) : g.moveTo(x, y); } } }, kw * .7);
    key(g => { g.beginPath(); for (const t of [.125, .375, .625, .875]) { const x = px + .28 + t * pw * .62, y = py + ph / 2, dy = Math.abs(Math.sin(t * 6.2832)) * ph * .26 * .8; g.moveTo(x, y - dy); g.lineTo(x, y + dy); } }, kw * .45);
    part(circ(px + pw - .32, py + ph / 2, .2), o.plates.accent ? "accent" : "body");
    key(g => { g.beginPath(); g.moveTo(-1.0, torso.top + 2.35); g.lineTo(1.0, torso.top + 2.35); }, kw * .55);
    [-.6, 0, .6].forEach(xx => part(circ(xx, torso.top + 2.62, .1), "light"));
  }
  legs.filter(L => L.sp && L.sp.front).forEach(drawLeg);
  /* neck and head */
  part(rr(-neck.w / 2, torso.top - neck.h - .05, neck.w, neck.h + .15, .08));
  const ht = (o.head || 0); const HG = g => { g.translate(0, headY + head.h); g.rotate(ht); g.translate(0, -(headY + head.h)); };
  const headPart = (path, ink) => part(g => { HG(g); path(g); }, ink);
  const headKey = (path, w, fill) => key(g => { HG(g); path(g); }, w, fill);
  /* antenna: a stem and a ball, the ball is the one dot */
  headKey(g => { g.beginPath(); g.moveTo(.15, headY); g.quadraticCurveTo(.25, headY - .45, .05, headY - .85); }, kw * 1.05);
  headPart(circ(.05, headY - 1.08, .3), o.plates.accent ? "accent" : "light");
  /* ears */
  [-1, 1].forEach(sd => headPart(rr(sd > 0 ? head.w / 2 - .15 : -head.w / 2 - .32, headY + head.h * .32, .47, .85, .2), o.plates.accent ? "accent" : "light"));
  headPart(rr(-head.w / 2, headY, head.w, head.h, head.r));
  /* visor and face */
  const vx = -1.25, vy = headY + .45, vw = 2.5, vh = 1.42, lk = (o.look || 0) * .18;
  headPart(rr(vx, vy, vw, vh, .5), "light");
  [-.58, .58].forEach(ex => { headKey(circ(ex + lk, vy + .62, .3), 0, true); const gl = o.plates.light; if (gl && det > .2) { const g = gl.g; T(g); HG(g); g.fillStyle = gl.style; g.globalCompositeOperation = "source-over"; circ(ex + lk - .1, vy + .52, .08)(g); g.fill(); g.restore(); const kg = K.g; T(kg); HG(kg); kg.globalCompositeOperation = "destination-out"; circ(ex + lk - .1, vy + .52, .085)(kg); kg.fill(); kg.restore(); } });
  headKey(g => { g.beginPath(); g.arc(lk * .6, vy + .86, .3, .35, Math.PI - .35); }, kw * .75);
  if (det > .2) headKey(g => { g.beginPath(); g.moveTo(-head.w / 2 + .32, headY + .35); g.quadraticCurveTo(-head.w / 2 + .32, headY + .18, -head.w / 2 + .62, headY + .18); }, kw * .6);
  /* front arms last */
  arms.filter(A => A.sp && A.sp.front).forEach(drawArm);
  /* world-space anchor points the caller may want (hands, feet, head top) */
  const W = (p) => [o.x + (p[0] * fl * S) * cr - (p[1] * S) * sr, o.y + (p[0] * fl * S) * sr + (p[1] * S) * cr];
  return { hands: arms.map(A => W(A.pts[2])), feet: legs.map(L => W(L.pts[2])), top: W([0, headY - 1.4]), s: S };
}
/* named poses, angles in radians; IK limbs are added by callers */
const MG_POSE = {
  stand: { arms: [{ a: -.22, b: -.12 }, { a: .22, b: .12 }], legs: [{ a: -.06, b: .02 }, { a: .06, b: -.02 }] },
  wave: { arms: [{ a: -.25, b: -.2 }, { a: 2.5, b: .55, front: true }], legs: [{ a: -.06, b: .02 }, { a: .06, b: -.02 }], head: -.06, look: .5 },
  walk: { arms: [{ a: -.5, b: -.35 }, { a: .5, b: .45, front: true }], legs: [{ a: -.28, b: .12 }, { a: .62, b: -.95, front: true }], head: .04, look: .7 },
  run: { arms: [{ a: -1.0, b: -1.3 }, { a: 1.15, b: 1.2, front: true }], legs: [{ a: -.75, b: -.85 }, { a: 1.35, b: -1.55, front: true }], head: .12, look: 1 },
  dash: { stance: .35, arms: [{ a: -.75, b: -.35 }, { a: -.45, b: -.55, front: true }], legs: [{ a: -.7, b: -.75 }, { a: 1.2, b: -1.45, front: true }], head: -.12, look: 1 },
  cheer: { arms: [{ a: -2.55, b: .2 }, { a: 2.55, b: -.2, front: true }], legs: [{ a: -.18, b: .1 }, { a: .18, b: -.1 }], head: -.08 }
};
