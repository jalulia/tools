/* ============================================================================
   _engines/halftone.js — the rotated dot screen. ONE implementation.

   The monolith had six copies of this loop (anyHalftone, hvHalftone,
   graceHalftone, t1Halftone, PR.halftone, caHalftone) plus two more inlined
   into csPaint and the D4 duotone. They differed only in: cell pitch, screen
   angle, ink and paper colour, dot gain, the threshold below which a dot is
   not drawn, whether the screen is POSITIVE (radius grows as the field gets
   darker — a photograph reproduced) or INVERTED (radius grows as the field
   gets lighter — un-inked holes in a heavy solid), and whether a second ink
   runs at a second angle with a registration offset.

   All of that is now options. Nothing about the geometry changed:
   the lattice is built in screen space, rotated about the centre of the
   plate, and clipped by a one-cell margin, exactly as before — so a plate
   printed at the same seed prints the same dots.

   THE ONE RULE THIS FILE ENCODES
   A halftone is a *reproduction*, not a texture. It takes a continuous field
   and decides, per lattice site, how much ink lands there. If you find
   yourself drawing a halftone over something that was never a photograph,
   you are using it as a filter and it will read as one.
   ============================================================================ */
(function () {
  'use strict';
  var Comp = window.Comp = window.Comp || {};

  /* ---- the screen itself -------------------------------------------------
     ctx    a 2D context already sized W×H in device pixels
     samp   (x,y) -> luminance 0..1, from Comp.sampler
     opt    { ink, angle, cell, gain, min, invert, dx, dy, alpha, jitter }
       cell   lattice pitch in DEVICE px (callers pass cssCell * dpr / 2 to
              keep the historical pitch)
       angle  degrees. 20 = riso, 22.5 = the D4 set, 45 = the copier plates
       gain   dot radius multiplier
       min    radius below which no dot is drawn — the screen's own threshold
       invert radius follows luminance instead of 1-luminance
       dx/dy  registration offset in CSS px (a second drum is never in register)
       jitter random ± offset in device px; a drum that wobbles              */
  Comp.dotScreen = function (ctx, W, H, samp, opt) {
    opt = opt || {};
    var cell = opt.cell || 5,
        ang = (opt.angle == null ? 20 : opt.angle) * Math.PI / 180,
        cs = Math.cos(ang), sn = Math.sin(ang),
        gain = opt.gain == null ? 0.72 : opt.gain,
        min = opt.min == null ? 0.2 : opt.min,
        inv = !!opt.invert,
        ox = opt.dx || 0, oy = opt.dy || 0,
        jit = opt.jitter || 0,
        rnd = opt.rnd,
        gamma = opt.gamma || 1,
        R = Math.ceil(Math.hypot(W, H) / cell) + 2;
    if (opt.ink) ctx.fillStyle = opt.ink;
    if (opt.alpha != null) ctx.globalAlpha = opt.alpha;
    for (var i = -R; i < R; i++) for (var j = -R; j < R; j++) {
      var sx = i * cell, sy = j * cell;
      var x = sx * cs - sy * sn + W / 2 + ox, y = sx * sn + sy * cs + H / 2 + oy;
      if (x < -cell || x > W + cell || y < -cell || y > H + cell) continue;
      var lum = samp(x, y);
      var t = inv ? lum : (1 - lum);
      if (gamma !== 1) t = Math.pow(t, gamma);
      var r = t * cell * gain;
      if (r > min) {
        var jx = jit && rnd ? (rnd() - .5) * jit : 0;
        var jy = jit && rnd ? (rnd() - .5) * jit : 0;
        ctx.beginPath(); ctx.arc(x + jx, y + jy, r, 0, 6.2832); ctx.fill();
      }
    }
    if (opt.alpha != null) ctx.globalAlpha = 1;
  };

  /* ---- the whole path: build a field, screen it -------------------------
     opt { seed, darkBias, contrast, paper (null = transparent), inks[],
           cell, dpr, radial, fleck, outside }
     inks[] = [{ ink, angle, dx, dy, gain, min, alpha, invert }]  */
  Comp.halftone = function (canvas, cssW, cssH, opt) {
    opt = opt || {};
    var dpr = opt.dpr || 2;
    var W = Math.round(cssW * dpr), H = Math.round(cssH * dpr);
    if (W < 2 || H < 2) return;
    canvas.width = W; canvas.height = H;
    var rnd = Comp.mulberry32(Comp.spread(opt.seed || 1));
    var img = (opt.field || Comp.buildField)(W, H, rnd, opt.darkBias || 0, opt.contrast || 1);
    var base = Comp.sampler(img, W, H, opt.outside == null ? 1 : opt.outside);
    var samp = base;
    if (opt.radial) {
      // the scanner's own falloff: the plate fades to paper towards the rim
      var cx = W / 2, cy = H / 2, rad = Math.min(W, H) / 2;
      samp = function (x, y) {
        var l = base(x, y);
        var d = Math.hypot((x | 0) - cx, (y | 0) - cy) / rad;
        var f = Math.min(1, Math.max(0, (d - .55) / .45));
        return l + (1 - l) * f * f;
      };
    }
    var ctx = canvas.getContext('2d');
    if (opt.paper) { ctx.fillStyle = opt.paper; ctx.fillRect(0, 0, W, H); }
    else ctx.clearRect(0, 0, W, H);
    var cell = (opt.cell == null ? 5 : opt.cell) * dpr / 2;
    (opt.inks || [{ ink: '#141210', angle: 20 }]).forEach(function (k) {
      Comp.dotScreen(ctx, W, H, samp, {
        ink: k.ink, angle: k.angle, cell: cell, gain: k.gain, min: k.min,
        invert: k.invert, alpha: k.alpha, gamma: k.gamma,
        dx: (k.dx || 0) * dpr, dy: (k.dy || 0) * dpr,
        jitter: k.jitter, rnd: rnd
      });
    });
    /* toner flake: sparse bright specks and a few dark pinholes. This is a
       COVERAGE FAILURE, not noise — it exists because the drum ran out of
       ink, which is why it is drawn in the ground and fleck colours rather
       than in grey. */
    if (opt.fleck) {
      var n = Math.round(W * H / (opt.fleck.every || 2600));
      for (var k2 = 0; k2 < n; k2++) {
        var px = rnd() * W, py = rnd() * H, rr = .4 + rnd() * 1.1;
        ctx.fillStyle = rnd() < (opt.fleck.bias == null ? .82 : opt.fleck.bias)
          ? opt.fleck.light : opt.fleck.dark;
        ctx.beginPath(); ctx.arc(px, py, rr, 0, 6.2832); ctx.fill();
      }
    }
    return { W: W, H: H, ctx: ctx, rnd: rnd, samp: samp };
  };
})();
