/* One field. Two readings of its gradient. Nothing else.

   Read `field` and `grad` first — everything below them is a consumer, and
   neither consumer knows the other exists. */

const N       = Math.max(2, Math.round(p.sources == null ? 6 : p.sources));
const LIGHT   = p.light   == null ? 2.2 : p.light;
const DENSITY = p.density == null ? 1   : p.density;

const AR  = W / H;
const INK = '22,22,15';
const PAPER = '#efece2';

/* ------------------------------------------------------------------ field
   Six soft sources on a plane. Positions are in (u in 0..AR, v in 0..1) so the
   falloff is round rather than stretched by the viewport. */
const rnd = lib.mulberry32(11);
const src = [];
for (let k = 0; k < 6; k++) {
  const a = (k / 6) * Math.PI * 2 + 0.4;
  src.push({
    ox: AR * 0.5 + Math.cos(a) * AR * 0.31,
    oy: 0.5 + Math.sin(a) * 0.29,
    str: 0.85 + 0.4 * rnd()
  });
}
function field(u, v) {
  let s = 0;
  for (let k = 0; k < N; k++) {
    const dx = u - src[k].ox, dy = v - src[k].oy;
    s += src[k].str * Math.exp(-(dx * dx + dy * dy) / 0.038);
  }
  return s;
}
const at = (x, y) => field(x / H, y / H);        // pixels -> field units

/* --------------------------------------------------------------- gradient
   One finite difference, used twice below and computed once here. Its LENGTH
   is how steeply the field changes; its DIRECTION is which way. The two
   renderers take one each. */
function grad(x, y, h) {
  return [at(x + h, y) - at(x - h, y), at(x, y + h) - at(x, y - h)];
}

ctx.fillStyle = PAPER;
ctx.fillRect(0, 0, W, H);

/* ------------------------------------------- JOB 1: shade — read as height */
const step = Math.max(3, Math.round(Math.min(W, H) / (170 * DENSITY)));
const lx = Math.cos(LIGHT), ly = Math.sin(LIGHT);
for (let y = 0; y < H + step; y += step) {
  for (let x = 0; x < W + step; x += step) {
    const v = at(x, y);
    if (v < 0.06) continue;
    const g = grad(x, y, step);
    const sh = -g[0] * lx - g[1] * ly;            // the light, against the slope
    let a = lib.clamp(v / 1.9, 0, 1) * 0.26 + lib.clamp(sh * 1.5, -0.15, 0.15);
    a = lib.clamp(a, 0, 0.38);
    if (a < 0.01) continue;
    ctx.fillStyle = 'rgba(' + INK + ',' + a.toFixed(3) + ')';
    ctx.fillRect(x - step * 0.5, y - step * 0.5, step + 1.2, step + 1.2);
  }
}

/* --------------------------------------- JOB 2: point — read as direction */
const gap = Math.max(11, Math.round(Math.min(W, H) / (42 * DENSITY)));
ctx.lineCap = 'round';
for (let y = gap * 0.5; y < H; y += gap) {
  for (let x = gap * 0.5; x < W; x += gap) {
    const v = at(x, y);
    if (v < 0.05) continue;
    const g = grad(x, y, 3);
    const gl = Math.hypot(g[0], g[1]) || 1e-4;
    // ninety degrees off the gradient IS the contour direction. No contour was
    // extracted, traced or stored: every stroke works it out locally.
    const ux = -g[1] / gl, uy = g[0] / gl;
    const a = lib.clamp(v * 0.42, 0, 0.5);
    const len = gap * 0.82 * Math.min(1, 0.35 + v);
    ctx.strokeStyle = 'rgba(' + INK + ',' + a.toFixed(3) + ')';
    ctx.lineWidth = 0.8 + v * 1.1;
    ctx.beginPath();
    ctx.moveTo(x - ux * len * 0.5, y - uy * len * 0.5);
    ctx.lineTo(x + ux * len * 0.5, y + uy * len * 0.5);
    ctx.stroke();
  }
}
