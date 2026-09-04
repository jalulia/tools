/* W1 — seven passes on one ridge. Canvas2D.

   Adapted from KLS-01, corpus/repos/Ki-Landscapes/index.html:260-332: a
   painterly landscape in which every depth band is painted by seven passes,
   each one clipped to that band's own ridge path, each one offset by that
   band's own parallax drift, each one tinted from that band's own mid colour.
   research/07 §3 recommends it over PM-07 as the order-dependence example, on
   the grounds that its coupling is tighter — and that is right: in PM-07 the
   passes are numbered, and here they are wired.

   The lane is Canvas2D and that is a decision, not a limitation (PLAN §5.2).
   The chain is seven compositing operations against clipped paths, which is
   what a 2D canvas is actually good at; the same thing in GLSL would be seven
   masked blends of procedural tiles and would be longer, not shorter. The best
   order-dependence example in the corpus is Canvas2D and the best coupling
   example is GLSL, and this tool holds both. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  instance_of: ["seven-pass-band-chain", "oklab-ramp-driver", "mulberry32-driver"],
  uses: ["paper-tooth","oklab-ramp","watercolour-wash","granulation","cut-paper-edge","edge-bloom","mulberry32"],
  governed_by: ["composing-computational-material-systems"],
  id: 'w1-seven-pass-band-chain',
  index: 'W1',
  order: 400,
  title: 'Seven passes on one ridge',
  section: 'worked-examples',
  status: 'canonical',
  lane: 'canvas2d',
  tags: ['order dependence', 'compositing', 'canvas2d', 'watercolour'],
  source: {
    kind: 'adapted',
    title: 'KLS-01 — Ki-Landscapes/index.html:260–332',
    author: 'Julia Compton',
    date: '2026',
    note: 'Ported to this stage and reduced to one still frame. The pass list, the per-band coupling and the drift are the original’s; the colour is interpolated in sRGB here where the original uses OKLab, which is a real loss and is listed under faults.'
  },
  thumb: 'thumb.png',

  text: `
    <p>A landscape painted in depth bands, from the back forwards. Each band is
    a ridge line, a fill, and then seven passes laid one over the other inside
    the band's own silhouette. The passes are, in order: a watercolour wash;
    granulation, where the pigment settles in the body; a crisp cut-paper edge
    along the ridge; an edge bloom that hugs the crest; a catch-light on the
    very top of it; edge pooling, a finer pigment burn inside the bloom; and
    paper grain.</p>

    <p>Seven is a lot. Seven is exactly the number at which a piece usually
    stops being a system and becomes a pile — and the reason this one does not
    is visible in the code rather than in the picture. Every pass is clipped to
    the same path. Every pass is offset by the same <code>drift</code>, which is
    the scroll converted into pixels <em>at that band's own parallax rate</em>,
    so that all seven textures travel with the land instead of sitting in front
    of it. Every pass is tinted from the same <code>mid</code> colour, taken
    from the middle of that band's own gradient. Three shared causes, seven
    consequences.</p>

    <div class="note"><span class="lab">Why order is visible here</span>
      <p>The granulation multiplies and the wash soft-lights. Swap them and the
      wash is multiplying against a body that has already been darkened, so the
      hue shifts and the band goes muddy. The pooling burns <em>inside</em> the
      bloom's reach — put it before the bloom and it has no reach to be inside
      of. The grain is last because it is the paper, and paper is under
      everything or over everything; it is not in the middle. Each of those is
      a sentence about what the pass <em>is</em>, and that is the test: if you
      can only justify an order by saying it looks better, the passes are
      adjacent rather than composed.</p></div>

    <h2>The one that is easiest to get wrong</h2>

    <p>The catch-light lifts the crest by a fraction of the remaining headroom
    to white, rather than by a fixed amount. It is one line and it is the
    difference between a landscape and a landscape with a fault in it: the far
    bands are already hazed and pale, so a fixed lift clips them into a flat
    white lens along the horizon, exactly where the eye goes. Multiplying by
    what is left instead means the near bands get a bright rim and the far bands
    get a whisper, from the same number.</p>

    <p>The original states this in a comment at
    <code>Ki-Landscapes/index.html:304</code>, and the neighbouring ruling at
    <code>:252</code> — <em>crisp edge (solid to 94%) — CANON, do not
    soften</em> — is the reason the sun in that piece has an edge at all. Those
    two lines are the editorial layer this tool now has fields for.</p>

    <h2>What it costs</h2>

    <p>Seven passes per band times six bands is forty-two composited
    operations, two of them through a full-size scratch buffer. It paints once
    and stops — this is a print, not an animation, and the stage renders one
    frame and holds it. Under a rendering budget it would be the first thing to
    reduce, and the honest reduction is fewer bands rather than fewer passes:
    the passes are the material, and the bands are the composition.</p>`,

  params: [
    { name: 'bands', min: 3, max: 9, step: 1, value: 6,
      note: 'depth bands, painted back to front' },
    { name: 'edge', min: 0, max: 1.2, step: 0.01, value: 0.65,
      note: 'how far the bloom, the pooling and the catch-light reach from the crest. One number, three passes.' },
    { name: 'journey', min: 0, max: 1, step: 0.01, value: 0.28,
      note: 'the scroll. Every band drifts at its own rate and every texture drifts with its band.' }
  ],

  examples: [
    { id: 'seven-passes', title: 'All seven', lane: 'canvas2d', file: 'main.js', code:
`/* Seven passes per depth band, clipped to that band's ridge, offset by that
   band's drift, tinted from that band's mid colour.

   Read the pass list first (search for PASS 1 … PASS 7). Then note that none
   of them takes a coordinate, an alpha or a colour that is not derived from
   \`drift\`, \`mid\` or \`edge\`. That is the whole argument. */

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
` },

    { id: 'three-passes', title: 'Three of the seven', lane: 'canvas2d', file: 'reduced.js', code:
`/* THE REDUCTION. The same bands, the same ridges, the same drift, the same
   colours — with passes 1, 2, 4 and 6 deleted. What is left is the fill, the
   crisp edge, the catch-light and the paper.

   This is here because "seven passes" is not automatically a virtue and the
   removal test has to be able to come back with a yes. Look at the two side by
   side and the honest verdict is: the reduction is a good picture. It is
   cut-paper rather than watercolour — cleaner, flatter, and about a different
   material. What it cannot do is hold a band that is BOTH pale and textured,
   because the wash and the granulation were the two passes carrying pigment
   density independently of tone.

   So the seven survive, and they survive as four-plus-three rather than as
   seven equals seven: the wash, the granulation and the pooling are one job
   done at three scales, and if a budget ever demanded it, that is where the
   argument would start. */

const BANDS   = Math.max(3, Math.round(p.bands   == null ? 6    : p.bands));
const EDGE    = lib.clamp(p.edge    == null ? 0.65 : p.edge, 0, 1.2);
const JOURNEY = lib.clamp(p.journey == null ? 0.28 : p.journey, 0, 1);

// Far to near. t = 0 is the FURTHEST band, so the ramp starts pale and warm —
// aerial perspective, which is why the catch-light below has to lift by a
// fraction of the remaining headroom rather than by a fixed amount.
const PAL = [[206, 198, 176], [166, 164, 146], [116, 122, 112], [70, 82, 82], [30, 38, 48]];
function bandColour(t) {
  const u = lib.clamp(t, 0, 1) * (PAL.length - 1);
  const i = Math.min(PAL.length - 2, Math.floor(u)), f = u - i;
  return [0, 1, 2].map(k => Math.round(lib.lerp(PAL[i][k], PAL[i + 1][k], f)));
}
const rgb   = c => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
const shade = (c, k) => c.map(v => Math.round(lib.clamp(v * k, 0, 255)));
const lift  = (c, k) => c.map(v => Math.round(v + (255 - v) * k));

const grain = lib.grainTile();

const sky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
sky.addColorStop(0, 'rgb(226,222,206)');
sky.addColorStop(1, 'rgb(238,228,206)');
ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

const PTS = 220;

for (let i = 0; i < BANDS; i++) {
  const t     = BANDS === 1 ? 1 : i / (BANDS - 1);
  const mid   = bandColour(t);
  const drift = JOURNEY * (0.12 + 0.9 * t) * W / lib.lerp(0.8, 2.4, t);

  const wave = lib.fbm1D(1000 + i * 97, 5, 4, 0.55);
  const base = lib.lerp(H * 0.30, H * 0.88, t);
  const amp  = H * (0.045 + 0.10 * t);
  const ys   = [];
  for (let k = 0; k <= PTS; k++) ys.push(base - amp * wave(k / PTS * 1.4 + drift / W * 0.6));
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

  const g = ctx.createLinearGradient(0, top, 0, H);
  g.addColorStop(0, rgb(lift(mid, 0.12)));
  g.addColorStop(1, rgb(shade(mid, 0.82)));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // PASS 3 — the crisp edge
  ctx.save();
  trace();
  ctx.strokeStyle = 'rgba(' + shade(mid, 0.55).join(',') + ',' +
                    lib.clamp(0.46 - 0.28 * EDGE, 0.10, 0.46).toFixed(3) + ')';
  ctx.lineWidth = Math.max(1, H * 0.0018);
  ctx.lineJoin = ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  // PASS 5 — the catch-light
  {
    const lr = Math.max(2, Math.ceil(H * (0.014 + 0.030 * EDGE)));
    const ls = document.createElement('canvas'); ls.width = 1; ls.height = lr;
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

  // PASS 7 — the paper
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.42;
  const gw = grain.width, gh = grain.height;
  const gx0 = ((i * 53 + drift) % gw + gw) % gw, gy0 = (i * 97) % gh;
  for (let gx = -gx0; gx < W; gx += gw) {
    for (let gy = -gy0 + Math.floor((top + gy0) / gh) * gh; gy < H; gy += gh) {
      ctx.drawImage(grain, gx, gy);
    }
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

  ctx.restore();
}

const vg = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.3, W / 2, H * 0.5, W * 0.8);
vg.addColorStop(0, 'rgba(0,0,0,0)');
vg.addColorStop(1, 'rgba(20,14,8,0.10)');
ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
` }
  ],

  exercises: [
    { rung: 'tune', text: 'Move <code>journey</code> slowly. Every band drifts at its own rate and every texture drifts with its band — the grain on the near band travels further than the grain on the far one, because it is the same sheet of paper seen at a different distance. Pin the grain instead (delete <code>drift</code> from pass 7) and the land slides underneath its own surface.' },
    { rung: 'tune', text: 'Take <code>edge</code> to 0 and then to 1.2. Three passes move together — the bloom, the pooling and the catch-light all take their reach from it — and the crisp edge line fades <em>as they grow</em>, because one edge is not allowed two loud treatments.' },
    { rung: 'substitute', text: 'Swap passes 1 and 2 in the editor: put the multiply before the soft-light. The wash is now perturbing a body that has already been darkened, the hue drifts, and the band goes muddy. Nothing was added or removed; the picture is worse and you can say exactly why.' },
    { rung: 'generalise', text: 'Lift the four repeated pieces — the clip, the drift, the mid colour and the crest stamp — into functions, then write an eighth pass using nothing but those. If the new pass needs a coordinate or an alpha that is not derived from one of the three shared causes, it does not belong in the chain.' },
    { rung: 'compose', text: 'Switch to the second example and look at both. Then decide which of the seven you would cut first under a real budget, and write the sentence that says what collapses. The three pigment passes are one job at three scales; that is where the argument starts, and knowing where it starts is more use than defending all seven.' }
  ],

  critique: {
    reads_as: 'A watercolour landscape in depth bands, printed on a sheet with a tooth — one painting seen at one distance, not a stack of texture layers.',
    coupling: 'Three shared causes and nothing else. `drift` — the scroll converted to pixels at each band’s own parallax rate — offsets the wash, the granulation, the pooling and the grain, so all four textures travel with the land they belong to. `mid` — one colour taken from the middle of that band’s own gradient — tints the edge line, the bloom, the pooling and the catch-light, so nothing in the band is a colour from somewhere else. `edge` sets the reach of the bloom, the pooling and the catch-light together, and simultaneously fades the crisp edge line, so a soft crest and a hard crest cannot both be loud.',
    pass_order: 'Wash (soft-light) → granulation (multiply) → edge line → bloom → catch-light → pooling → grain. Swap the wash and the granulation and the wash is perturbing an already-darkened body: the hue drifts and the band muddies. Move the pooling before the bloom and it has no reach to burn inside of, because the reach is the bloom’s. Move the grain anywhere but last and the paper is under some of the pigment and over the rest, which is not a thing paper does. Only the catch-light and the bloom could arguably trade places, and they do not, because a rim light sits on top of a shadow.',
    operators: ['band gradient', 'wash (soft-light)', 'granulation (multiply, masked)', 'cut-paper edge', 'edge bloom', 'crest catch-light', 'edge pooling', 'paper grain (soft-light)'],
    why_it_survives: 'Removal is on the page: the second example is the same chain with the wash, the granulation, the bloom and the pooling deleted. What collapses is specific — a band can no longer be pale and textured at the same time, because those were the passes carrying pigment density independently of tone — and what survives is also specific, which is why the reduction is a good picture rather than a broken one. The catch-light is the pass whose removal is hardest to argue with: without it the horizon has no rim and the bands stop stacking.',
    faults: [
      'Colour is interpolated in sRGB. The original works in OKLab, and the difference shows in the middle of the ramp where the sRGB lerp goes grey through the transition. This is the single largest loss in the port and it is a loss of about twelve lines.',
      'Two of the seven passes route through a full-size scratch canvas. At 1440 with DPR 2 that is two 2880 x 1320 buffers per band; it paints once, which is the only reason it is acceptable.',
      'The ridge is a 1-D fbm rather than the original’s hashed-lattice landform placement (KLS-03), so the bands have texture but no features — no peaks that are peaks. The composition is therefore weaker than the source at exactly the level the source is best at.',
      'The vignette is outside the band loop and is therefore the one pinned, global thing in the piece. It is a frame and not a treatment, which is the argument for it; it is also the pass that would be cut first.'
    ]
  },

  ruling: {
    // CK8 · verbatim from her comment; citation moved into `source`.
    text: 'wash · granulation · edge · bloom · crest-light · pooling · grain are ALL per-band; no pinned global film.',
    by: 'julia',
    source: 'Ki-Landscapes/index.html:327'
  },

  related: [
    { entry: '13-fractal-brownian-motion', relation: 'shader-behind',
      label: '13 Fractal Brownian Motion' },
    { entry: '10-random', relation: 'technique-of', label: '10 Random' }
  ],

  links: [
    { label: 'Ki · Landscape Atelier — the tool this came out of', url: '../ki-landscapes/' }
  ]
});
