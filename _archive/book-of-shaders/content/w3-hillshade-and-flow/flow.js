/* MM-05. The gradient's DIRECTION, turned ninety degrees.
   The same field, the same derivative, an unrelated reading of it. */

const N       = Math.max(2, Math.round(p.sources == null ? 6 : p.sources));
const DENSITY = p.density == null ? 1 : p.density;

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

const gap = Math.max(11, Math.round(Math.min(W, H) / (42 * DENSITY)));
ctx.lineCap = 'round';
for (let y = gap * 0.5; y < H; y += gap) {
  for (let x = gap * 0.5; x < W; x += gap) {
    const v = at(x, y);
    if (v < 0.05) continue;
    const gx = at(x + 3, y) - at(x - 3, y);
    const gy = at(x, y + 3) - at(x, y - 3);
    const gl = Math.hypot(gx, gy) || 1e-4;
    const ux = -gy / gl, uy = gx / gl;
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

// Structure, and nothing else. Every level set is legible and there is no
// indication anywhere of which side of a ridge is lit, or which hill is taller.
// That absence is the job the shading does.
