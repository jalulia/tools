/* NOT FROM THE SOURCE. This is the failure the page needs in order to make its
   claim falsifiable.

   Both passes below are driven by the same field. Both are therefore "coupled",
   in the sense that people usually mean when they say a piece is coupled — and
   the picture is still worse than the hillshade on its own, because the two
   passes do the SAME JOB. The second darkens by the field value; the first
   already darkens by the field value with a slope term on top. Adding them
   deepens the contrast of the shading and contributes no information that was
   not already in it.

   Shared cause is necessary. It is not sufficient. The test that catches this
   is DISTINCT JOBS, and it is the one people skip precisely because the shared
   driver feels like it should have settled the question. */

const N       = Math.max(2, Math.round(p.sources == null ? 6 : p.sources));
const LIGHT   = p.light   == null ? 2.2 : p.light;
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

const step = Math.max(3, Math.round(Math.min(W, H) / (170 * DENSITY)));
const lx = Math.cos(LIGHT), ly = Math.sin(LIGHT);

// pass 1 — hillshade, as before
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

// pass 2 — "for depth". Same cause, same job, different constant.
for (let y = 0; y < H + step; y += step) {
  for (let x = 0; x < W + step; x += step) {
    const v = at(x, y);
    if (v < 0.06) continue;
    const a = lib.clamp(v / 1.4, 0, 1) * 0.20;
    ctx.fillStyle = 'rgba(' + INK + ',' + a.toFixed(3) + ')';
    ctx.fillRect(x - step * 0.5, y - step * 0.5, step + 1.2, step + 1.2);
  }
}
