/* ============================================================================
   _engines/paper.js — substrate. Tooth, fibre and grain.

   Two lenses painted a paper tooth from scratch (B4's stkPaint, B3's
   festaTooth) and three more inlined a per-pixel grain loop. They are the
   same two operations with different amplitudes and different destinations:
   one paints into a full-size canvas that is multiplied over the plate, the
   other bakes a 180 px tile and hands back a data: URL for background-image.

   PASS ORDER, which is the part that is easy to get wrong:
   paper tooth goes UNDER the ink and is multiplied THROUGH it, so type sits
   in the paper rather than on top of it. Grain applied last, over everything,
   is the "noise as texture" anti-pattern — it makes a flat thing look busy
   without making it look printed.
   ============================================================================ */
(function () {
  'use strict';
  var Comp = window.Comp = window.Comp || {};

  /* Fill a canvas with paper: a near-white per-pixel value field plus faint
     horizontal fibres. Multiplied over the plate.
       opt { seed, base (0..255), amp, dpr, fibres, fibreAlpha }              */
  Comp.paperTooth = function (canvas, cssW, cssH, opt) {
    opt = opt || {};
    var dpr = opt.dpr || 1.5;
    var W = Math.round(cssW * dpr), H = Math.round(cssH * dpr);
    if (W < 2 || H < 2) return;
    canvas.width = W; canvas.height = H;
    var x = canvas.getContext('2d');
    var rnd = Comp.mulberry32(opt.seed == null ? 4141 : opt.seed);
    var base = opt.base == null ? 246 : opt.base;
    var amp = opt.amp == null ? 22 : opt.amp;

    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    var img = x.getImageData(0, 0, W, H), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var n = (rnd() - .5) * amp;
      var v = base + n;
      d[i] = d[i + 1] = d[i + 2] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
    x.putImageData(img, 0, 0);

    /* fibres: long, shallow, low-contrast. They are the direction the sheet
       was made in, not a scratch pass. */
    x.globalAlpha = opt.fibreAlpha == null ? .045 : opt.fibreAlpha;
    var n2 = opt.fibres == null ? Math.round(H / 5) : opt.fibres;
    for (var k = 0; k < n2; k++) {
      x.strokeStyle = rnd() < .5 ? '#000' : '#fff';
      x.lineWidth = 1;
      var y = rnd() * H;
      x.beginPath();
      x.moveTo(rnd() * W * .4, y);
      x.lineTo(W * .6 + rnd() * W * .4, y + (rnd() - .5) * 2.5);
      x.stroke();
    }
    x.globalAlpha = 1;
  };

  /* The tile version: one square of stock, returned as a data: URL for
     background-image + background-repeat. Cheaper than a full-size canvas
     when the sheet is large and the tooth is fine.                          */
  Comp.paperTile = function (opt) {
    opt = opt || {};
    var T = opt.size || 180;
    var c = document.createElement('canvas'); c.width = T; c.height = T;
    var x = c.getContext('2d'), rnd = Comp.mulberry32(opt.seed == null ? 4242 : opt.seed);
    var id = x.createImageData(T, T), d = id.data;
    var base = opt.base == null ? 234 : opt.base, amp = opt.amp == null ? 21 : opt.amp;
    for (var i = 0; i < d.length; i += 4) {
      var v = base + rnd() * amp;
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    x.putImageData(id, 0, 0);
    x.strokeStyle = opt.fibre || 'rgba(120,110,95,.12)';
    x.lineWidth = 1;
    var n = opt.fibres == null ? 54 : opt.fibres;
    for (var k = 0; k < n; k++) {
      var y = rnd() * T, x0 = rnd() * T, l = 6 + rnd() * 30;
      x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + l, y + (rnd() - .5) * 2); x.stroke();
    }
    return c.toDataURL();
  };

  /* Per-pixel monochrome grain over an existing paint. Amplitude in 0..255.
     Only honest as the LAST stage of a reproduction chain. */
  Comp.grain = function (ctx, W, H, amt, seed) {
    var rnd = Comp.mulberry32(seed == null ? 7 : seed);
    var img = ctx.getImageData(0, 0, W, H), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var n = (rnd() - .5) * amt;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
  };
})();
