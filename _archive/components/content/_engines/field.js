/* ============================================================================
   _engines/field.js — the greyscale field that gets reproduced.

   Three lenses (B1 photocopy collage, C1 heavy-ink riso, E5·ALT ephemera)
   carried a byte-identical `*BuildField`, and D4 carried the same function
   with an extra shading pass bolted on the end. It is the stand-in for a
   PHOTOGRAPH: forty-six soft radial blobs plus seventy low-alpha streaks,
   contrast-stretched and dithered by a whisker.

   It is honest only as *the thing that is about to be reproduced* — the
   halftone screen in halftone.js is what makes it read as print. Presented
   on its own it is a bag of gradients with no field underneath, which is
   exactly the grade research gave it (CMP-03, B+, promising exploration).
   Do not use it as a material.
   ============================================================================ */
(function () {
  'use strict';
  var Comp = window.Comp = window.Comp || {};

  /* Returns ImageData, greyscale, W×H.
       darkBias   > 0 makes more blobs dark (a denser negative)
       contrast   multiplies around mid-grey before the ±9 dither  */
  Comp.buildField = function (W, H, rnd, darkBias, contrast) {
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var x = c.getContext('2d');
    x.fillStyle = '#8a8a8a'; x.fillRect(0, 0, W, H);

    var N = 46, i;
    for (i = 0; i < N; i++) {
      var px = rnd() * W, py = rnd() * H, r = (0.08 + rnd() * 0.42) * Math.max(W, H);
      var light = rnd() > (0.5 + darkBias);
      var a = 0.05 + rnd() * 0.16;
      var g = x.createRadialGradient(px, py, 0, px, py, r);
      var col = light ? '245,245,245' : '10,10,10';
      g.addColorStop(0, 'rgba(' + col + ',' + a + ')');
      g.addColorStop(1, 'rgba(' + col + ',0)');
      x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
    }

    /* streaks: the roller, not a texture. Very low alpha on purpose. */
    x.globalAlpha = .05;
    for (i = 0; i < 70; i++) {
      x.strokeStyle = rnd() < .5 ? '#000' : '#fff';
      x.lineWidth = 1 + rnd() * 2;
      var yy = rnd() * H;
      x.beginPath(); x.moveTo(0, yy); x.lineTo(W, yy + (rnd() - .5) * H * 0.5); x.stroke();
    }
    x.globalAlpha = 1;

    var img = x.getImageData(0, 0, W, H), d = img.data;
    for (var k = 0; k < d.length; k += 4) {
      var v = d[k];
      v = (v - 128) * contrast + 128;
      v += (rnd() - .5) * 18;
      v = v < 0 ? 0 : v > 255 ? 255 : v;
      d[k] = d[k + 1] = d[k + 2] = v;
    }
    x.putImageData(img, 0, 0);
    return x.getImageData(0, 0, W, H);
  };

  /* The `samp(x,y)` luminance lookup existed eight times, always the same
     three lines and always with a different out-of-bounds answer. The answer
     matters — it decides what the screen does past the edge of the plate — so
     it is a parameter here rather than a constant. */
  Comp.sampler = function (imageData, W, H, outside) {
    var f = imageData.data;
    var oob = (outside === undefined) ? 1 : outside;
    return function (x, y) {
      x = x | 0; y = y | 0;
      if (x < 0 || y < 0 || x >= W || y >= H) return oob;
      return f[(y * W + x) * 4] / 255;
    };
  };
})();
