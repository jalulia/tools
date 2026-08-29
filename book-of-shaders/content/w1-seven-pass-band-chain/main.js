/* Seven passes per depth band, clipped to that band's ridge, offset by that
   band's drift, tinted from that band's mid colour.

   Read the pass list first (search for PASS 1 … PASS 7). Then note that none
   of them takes a coordinate, an alpha or a colour that is not derived from
   `drift`, `mid` or `edge`. That is the whole argument. */

const BANDS   = Math.max(3, Math.round(p.bands   == null ? 6    : p.bands));
const EDGE    = lib.clamp(p.edge    == null ? 0.65 : p.edge, 0, 1.2);
const JOURNEY = lib.clamp(p.journey == null ? 0.28 : p.journey, 0, 1);

/* ---------------------------------------------------------------- tiles
   Three noise tiles: a fine per-pixel tooth for the paper, a broad one for the
   wash, a mid one for pigment. Built once and kept on the shared library,
   because this shader re-runs on every slider move and 3 x 256^2 of noise is
   not something to rebuild sixty times a second. */
function noiseLayer(size, cells, seed) {
  const r = lib.mulberry32(seed), g = new Float32Array(cells * cells);
  for (let i = 0; i < g.length; i++) g[i] = r();
  return (x, y) => {
    const fx = x / size * cells, fy = y / size * cells;
    const xi = Math.floor(fx), yi = Math.floor(fy);
    const x0 = ((xi % cells) + cells) % cells, y0 = ((yi % cells) + cells) % cells;
    const x1 = (x0 + 1) % cells, y1 = (y0 + 1) % cells;
    let tx = fx - xi, ty = fy - yi;
    tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
    const a = g[y0 * cells + x0], b = g[y0 * cells + x1],
          c = g[y1 * cells + x0], d = g[y1 * cells + x1];
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  };
}
function tile(size, fn, base, spread) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const cx = c.getContext('2d'), id = cx.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const v = lib.clamp(base + (fn(x, y) - 0.5) * spread, 0, 255), i = (y * size + x) * 4;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
  }
  cx.putImageData(id, 0, 0); return c;
}
if (!lib._kls) {
  // paper grain: MID-GREY base, so soft-light perturbs luminance both ways and
  // the mean survives. A tooth, not a darkening film — see chapter 10.
  const rng = lib.mulberry32(7), fib = noiseLayer(256, 40, 21);
  const grain = tile(256, (x, y) => 0.5 + (rng() - 0.5) * 0.85 + (fib(x, y) - 0.5) * 0.35, 128, 80);
  const wf = noiseLayer(256, 6, 55);
  const wash = tile(256, wf, 128, 128);
  const mf = noiseLayer(256, 46, 91), mg = noiseLayer(256, 104, 131);
  const mottle = tile(256, (x, y) => 0.5 + (mf(x, y) - 0.5) * 0.7 + (mg(x, y) - 0.5) * 0.42, 206, 90);
  lib._kls = { grain, wash, mottle };
}
const T = lib._kls;

/* --------------------------------------------------------- scratch buffer
   Two of the seven passes need a masked copy of a tile. A canvas cannot mask
   what it has already painted without erasing it, so those two are assembled
   off-screen and stamped. */
if (!lib._klsPad || lib._klsPad.width !== W || lib._klsPad.height !== H) {
  const pad = document.createElement('canvas');
  pad.width = W; pad.height = H;
  lib._klsPad = pad;
}
const PAD = lib._klsPad, PX = PAD.getContext('2d');

/* ----------------------------------------------------------------- paint */
// Far to near. t = 0 is the FURTHEST band, so the ramp starts pale and warm —
// aerial perspective, which is why the catch-light below has to lift by a
// fraction of the remaining headroom rather than by a fixed amount.
const PAL = [[206, 198, 176], [166, 164, 146], [116, 122, 112], [70, 82, 82], [30, 38, 48]];
function bandColour(t) {                       // sRGB lerp along the ramp
  const u = lib.clamp(t, 0, 1) * (PAL.length - 1);
  const i = Math.min(PAL.length - 2, Math.floor(u)), f = u - i;
  return [0, 1, 2].map(k => Math.round(lib.lerp(PAL[i][k], PAL[i + 1][k], f)));
}
const rgb = c => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
const shade = (c, k) => c.map(v => Math.round(lib.clamp(v * k, 0, 255)));
const lift  = (c, k) => c.map(v => Math.round(v + (255 - v) * k));   // headroom, not addition

// sky
const sky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
sky.addColorStop(0, 'rgb(226,222,206)');
sky.addColorStop(1, 'rgb(238,228,206)');
ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

const PTS = 220;

for (let i = 0; i < BANDS; i++) {
  const t   = BANDS === 1 ? 1 : i / (BANDS - 1);     // 0 far, 1 near
  const mid = bandColour(t);

  // ---- SHARED CAUSE 1: the drift. Pixels scrolled at THIS band's parallax
  // rate. Every one of the seven passes below offsets its own coordinate by
  // this and by nothing else, which is why the textures travel with the land.
  const drift = JOURNEY * (0.12 + 0.9 * t) * W / lib.lerp(0.8, 2.4, t);

  // ---- the ridge ----
  const wave = lib.fbm1D(1000 + i * 97, 5, 4, 0.55);
  const base = lib.lerp(H * 0.30, H * 0.88, t);
  const amp  = H * (0.045 + 0.10 * t);
  const ys   = [];
  for (let k = 0; k <= PTS; k++) {
    ys.push(base - amp * wave(k / PTS * 1.4 + drift / W * 0.6));
  }
  const top = Math.min.apply(null, ys);

  const trace = () => {
    ctx.beginPath(); ctx.moveTo(0, ys[0]);
    for (let k = 1; k <= PTS; k++) {
      const x0 = (k - 1) / PTS * W, x1 = k / PTS * W;
      ctx.quadraticCurveTo(x0, ys[k - 1], (x0 + x1) / 2, (ys[k - 1] + ys[k]) / 2);
    }
  };

  ctx.save();
  trace(); ctx.lineTo(W, ys[PTS]); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
  ctx.clip();

  // ---- the body: one gradient, and mid is its middle ----
  const g = ctx.createLinearGradient(0, top, 0, H);
  g.addColorStop(0, rgb(lift(mid, 0.12)));
  g.addColorStop(1, rgb(shade(mid, 0.82)));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // ================= PASS 1 — watercolour wash =========================
  // soft-light, so it perturbs luminance and keeps the hue. Drifted.
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.45;
  const ws = W * 1.15, hs = ws * (H / W) * 1.4;
  ctx.drawImage(T.wash, -((i * 131 + drift * 0.6) % (ws * 0.5)), top - (i * 71) % (hs * 0.5), ws, hs);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

  // ================= PASS 2 — granulation ==============================
  // pigment settling in the BODY: a finer mottle, masked so it fades out at
  // the crest, multiplied so it darkens where pigment collects.
  PX.setTransform(1, 0, 0, 1, 0, 0);
  PX.globalCompositeOperation = 'source-over';
  PX.clearRect(0, 0, W, H);
  const mp = PX.createPattern(T.mottle, 'repeat');
  PX.save(); PX.translate(-((i * 61 + drift) % 256), -((i * 97) % 256));
  PX.fillStyle = mp; PX.fillRect(0, 0, W + 256, H + 256); PX.restore();
  PX.globalCompositeOperation = 'destination-in';
  const gmask = PX.createLinearGradient(0, top, 0, H);
  gmask.addColorStop(0, 'rgba(0,0,0,0)');
  gmask.addColorStop(0.45, 'rgba(0,0,0,1)');
  gmask.addColorStop(1, 'rgba(0,0,0,1)');
  PX.fillStyle = gmask; PX.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.20 + 0.30 * t;
  ctx.drawImage(PAD, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

  // ================= PASS 3 — crisp cut-paper edge =====================
  // follows the ridge exactly, and EASES AS THE BLOOM GROWS: one edge, two
  // treatments, and they are not allowed to both be loud.
  ctx.save();
  trace();
  ctx.strokeStyle = 'rgba(' + shade(mid, 0.55).join(',') + ',' +
                    lib.clamp(0.46 - 0.28 * EDGE, 0.10, 0.46).toFixed(3) + ')';
  ctx.lineWidth = Math.max(1, H * 0.0018);
  ctx.lineJoin = ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  const reach = H * (0.03 + 0.42 * EDGE);

  // ================= PASS 4 — edge bloom ===============================
  // a 1px vertical gradient strip stamped at every column's own crest, so it
  // HUGS the wave. A single blurred band across the top would not: it would be
  // a straight shadow behind a curved edge.
  if (EDGE > 0.02) {
    const strip = document.createElement('canvas');
    strip.width = 1; strip.height = Math.max(2, Math.ceil(reach));
    const sx = strip.getContext('2d');
    const lg = sx.createLinearGradient(0, 0, 0, strip.height);
    const bc = shade(mid, 0.62);
    lg.addColorStop(0, 'rgba(' + bc.join(',') + ',' + (0.10 + 0.30 * EDGE).toFixed(3) + ')');
    lg.addColorStop(1, 'rgba(' + bc.join(',') + ',0)');
    sx.fillStyle = lg; sx.fillRect(0, 0, 1, strip.height);
    // Stamped every two pixels rather than four: on the steep faces of a near
    // band, four-pixel stamps leave visible dashes along the crest.
    for (let x = 0; x < W; x += 2) {
      const fx = x / W * PTS, i0 = Math.floor(fx), f = fx - i0;
      const cy = ys[i0] + (ys[Math.min(PTS, i0 + 1)] - ys[i0]) * f;
      ctx.drawImage(strip, x, cy, 2, strip.height);
    }
  }

  // ================= PASS 5 — crest catch-light ========================
  // THE LINE THAT MATTERS. The lift is a FRACTION OF THE REMAINING HEADROOM
  // to white, not a fixed amount — so a hazed far band lifts gently and never
  // clips into a flat white lens along the horizon.
  {
    const lr = Math.max(2, Math.ceil(H * (0.014 + 0.030 * EDGE)));
    const ls = document.createElement('canvas');
    ls.width = 1; ls.height = lr;
    const lx = ls.getContext('2d'), lgr = lx.createLinearGradient(0, 0, 0, lr);
    const lc = lift(mid, 0.30);
    lgr.addColorStop(0, 'rgba(' + lc.join(',') + ',' + (0.45 * (0.55 + 0.45 * t)).toFixed(3) + ')');
    lgr.addColorStop(1, 'rgba(' + lc.join(',') + ',0)');
    lx.fillStyle = lgr; lx.fillRect(0, 0, 1, lr);
    for (let x = 0; x < W; x += 2) {
      const fx = x / W * PTS, i0 = Math.floor(fx), f = fx - i0;
      const cy = ys[i0] + (ys[Math.min(PTS, i0 + 1)] - ys[i0]) * f;
      ctx.drawImage(ls, x, cy, 2, lr);
    }
  }

  // ================= PASS 6 — edge pooling =============================
  // the same mottle again, masked to the bloom's reach and burned inside it.
  // It is AFTER the bloom because it is pigment pooling in the bloom; before
  // it, there is no bloom for it to be inside of.
  if (EDGE > 0.02) {
    PX.setTransform(1, 0, 0, 1, 0, 0);
    PX.globalCompositeOperation = 'source-over';
    PX.clearRect(0, 0, W, H);
    PX.save(); PX.translate(-((i * 53 + drift) % 256), -((i * 89) % 256));
    PX.fillStyle = PX.createPattern(T.mottle, 'repeat');
    PX.fillRect(0, 0, W + 256, H + 256); PX.restore();
    PX.globalCompositeOperation = 'destination-in';
    const eg = PX.createLinearGradient(0, top, 0, top + reach);
    eg.addColorStop(0, 'rgba(0,0,0,1)');
    eg.addColorStop(1, 'rgba(0,0,0,0)');
    PX.fillStyle = eg; PX.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.18 + 0.30 * EDGE;
    ctx.drawImage(PAD, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  // ================= PASS 7 — paper grain ==============================
  // last, because it is the paper. Soft-light over a mid-grey tile, so the
  // mean is preserved; locked to the same drift, so the sheet moves with the
  // land rather than the land sliding under a pinned film.
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.42;
  const gw = T.grain.width, gh = T.grain.height;
  const gx0 = ((i * 53 + drift) % gw + gw) % gw, gy0 = (i * 97) % gh;
  for (let gx = -gx0; gx < W; gx += gw) {
    for (let gy = -gy0 + Math.floor((top + gy0) / gh) * gh; gy < H; gy += gh) {
      ctx.drawImage(T.grain, gx, gy);
    }
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

  ctx.restore();
}

// no pinned global film. The vignette is the only thing outside the band loop,
// and it is the frame rather than a treatment.
const vg = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.3, W / 2, H * 0.5, W * 0.8);
vg.addColorStop(0, 'rgba(0,0,0,0)');
vg.addColorStop(1, 'rgba(20,14,8,0.10)');
ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
