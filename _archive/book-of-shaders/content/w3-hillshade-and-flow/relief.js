/* MM-04. The gradient's LENGTH, against a light direction.
   Fourteen lines of consumer over the field below. */

const N       = Math.max(2, Math.round(p.sources == null ? 6 : p.sources));
const LIGHT   = p.light   == null ? 2.2 : p.light;
const DENSITY = p.density == null ? 1   : p.density;

const AR = W / H, INK = '22,22,15';
const rnd = lib.mulberry32(11);
const src = [];
for (let k = 0; k < 6; k++) {
  const a = (k / 6) * Math.PI * 2 + 0.4;
  src.push({ ox: AR * 0.5 + Math.cos(a) * AR * 0.31,
             oy: 0.5 + Math.sin(a) * 0.29, str: 0.85 + 0.4 * rnd() });
}
function field(u, v) {
  let s = 0;
  for (let k = 0; k < N; k++) {
    const dx = u - src[k].ox, dy = v - src[k].oy;
    s += src[k].str * Math.exp(-(dx * dx + dy * dy) / 0.038);
  }
  return s;
}
const at = (x, y) => field(x / H, y / H);

ctx.fillStyle = '#efece2';
ctx.fillRect(0, 0, W, H);

const step = Math.max(3, Math.round(Math.min(W, H) / (170 * DENSITY)));
const lx = Math.cos(LIGHT), ly = Math.sin(LIGHT);
for (let y = 0; y < H + step; y += step) {
  for (let x = 0; x < W + step; x += step) {
    const v = at(x, y);
    if (v < 0.06) continue;
    const gx = at(x + step, y) - at(x - step, y);
    const gy = at(x, y + step) - at(x, y - step);
    const sh = -gx * lx - gy * ly;
    let a = lib.clamp(v / 1.9, 0, 1) * 0.26 + lib.clamp(sh * 1.5, -0.15, 0.15);
    a = lib.clamp(a, 0, 0.38);
    if (a < 0.01) continue;
    ctx.fillStyle = 'rgba(' + INK + ',' + a.toFixed(3) + ')';
    ctx.fillRect(x - step * 0.5, y - step * 0.5, step + 1.2, step + 1.2);
  }
}

// Tone, and nothing else. There is no edge anywhere in this picture: the field
// is smooth, so its shading is smooth, and where two hills meet you get a
// gentle saddle rather than a boundary. That absence is the job the strokes do.
