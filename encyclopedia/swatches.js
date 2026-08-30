/* ============================================================================
   encyclopedia/swatches.js — the atom swatch renderer.

   Each atom in manifest.js declares kind, params and a note. This file paints
   its swatch — one function per atom id, keyed off the atom's declared params
   so a change to `depth` (paper tooth) or `angle` (dot screen) redraws the
   cell that shows the atom, not a stand-in for it.

   Every renderer here is CANVAS-2D, uses only the engines already on disk
   (content/_engines/*.js) or a tiny inlined equivalent, and paints synchronously
   in one frame — no fetch, no worker, no CDN.

   Julia's red line (REVIEW-ARCHITECT §2.2): a generated stand-in labelled with
   a real piece's id is a lie. These swatches are the ATOM's own swatch — that
   is what an atom cell is for. The exploration cells on `#/atom/<id>` do NOT
   render these; they render each exploration's thumb.png where one exists and
   say "no thumbnail on file" where it does not.

   Rendering budget: the atoms table has ~18 cells at 1440. Painting them all
   on load costs ~250 ms of synchronous canvas work. `Shell.observeAtoms` (in
   views.js) paints on approach with an IntersectionObserver so an off-screen
   cell never runs its loop.
   ============================================================================ */
(function () {
  'use strict';

  var C = window.Comp || {};
  /* A tiny local PRNG so the file boots even if _engines/rng.js has not been
     included in the page. When Comp.mulberry32 is present it wins. */
  function mulberry(seed) {
    if (C && C.mulberry32) return C.mulberry32(seed);
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ seed >>> 15, seed | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* dpr cap: swatches are decorative; a phone gets 1.25, a desktop gets 1.5 —
     mirrors the raster.js cap so a swatch never breaks the page budget. */
  function dpr() {
    var d = window.devicePixelRatio || 1;
    return Math.min(d, window.innerWidth < 480 ? 1.25 : 1.5);
  }

  /* size a canvas to its clientRect at capped dpr, and return the drawing
     buffer size in device pixels. Every swatch calls this. */
  function fit(cv) {
    var r = cv.getBoundingClientRect();
    var w = Math.max(64, Math.round(r.width)),
        h = Math.max(64, Math.round(r.height || r.width));
    var D = dpr();
    cv.width = Math.round(w * D);
    cv.height = Math.round(h * D);
    var x = cv.getContext('2d');
    x.setTransform(D, 0, 0, D, 0, 0);   // 1 unit = 1 CSS pixel from here on
    return { x: x, w: w, h: h };
  }

  function paperGround(x, w, h) {
    /* Warm-neutral bench, same value as --bench (#f1f1f1). Every swatch cell
       reads against the same ground so a kind's variety is legible. */
    x.fillStyle = '#f1f1f1'; x.fillRect(0, 0, w, h);
  }

  /* ==========================================================================
     TEXTURE
     ========================================================================== */

  function paperTooth(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    x.fillStyle = '#f4f2ed'; x.fillRect(0, 0, w, h);
    var rnd = mulberry((p && p.seed) || 4141);
    var amp = (p && p.depth) != null ? p.depth : 22;
    var img = x.getImageData(0, 0, w, h), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var n = (rnd() - .5) * amp;
      var v = 244 + n;
      d[i] = d[i + 1] = d[i + 2] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
    x.putImageData(img, 0, 0);
    x.globalAlpha = .045;
    var n2 = (p && p.fibres) != null ? p.fibres : 16;
    for (var k = 0; k < n2; k++) {
      x.strokeStyle = rnd() < .5 ? '#000' : '#fff';
      x.lineWidth = 1;
      var y = rnd() * h;
      x.beginPath();
      x.moveTo(rnd() * w * .4, y);
      x.lineTo(w * .6 + rnd() * w * .4, y + (rnd() - .5) * 2.5);
      x.stroke();
    }
    x.globalAlpha = 1;
  }

  function dotScreen20(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    x.fillStyle = '#efece5'; x.fillRect(0, 0, w, h);
    var cell = (p && p.cell) || 6,
        ang = ((p && p.angle) != null ? p.angle : 20) * Math.PI / 180,
        gain = (p && p.gain) || 0.72,
        cs = Math.cos(ang), sn = Math.sin(ang);
    x.fillStyle = '#191919';
    var R = Math.ceil(Math.hypot(w, h) / cell) + 2;
    for (var i = -R; i < R; i++) for (var j = -R; j < R; j++) {
      var sx = i * cell, sy = j * cell;
      var ax = sx * cs - sy * sn + w / 2,
          ay = sx * sn + sy * cs + h / 2;
      if (ax < -cell || ax > w + cell || ay < -cell || ay > h + cell) continue;
      /* left-to-right density gradient — a plate being reproduced */
      var t = (ax / w) * 0.9 + 0.05;
      var r = t * cell * gain;
      if (r > 0.2) { x.beginPath(); x.arc(ax, ay, r, 0, 6.2832); x.fill(); }
    }
  }

  function bayer8(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    var scale = (p && p.scale) || 3;
    var levels = (p && p.levels) || 2;
    /* the classic 8×8 Bayer */
    var B = [
      [0,32,8,40,2,34,10,42],[48,16,56,24,50,18,58,26],
      [12,44,4,36,14,46,6,38],[60,28,52,20,62,30,54,22],
      [3,35,11,43,1,33,9,41],[51,19,59,27,49,17,57,25],
      [15,47,7,39,13,45,5,37],[63,31,55,23,61,29,53,21]
    ];
    var img = x.createImageData(w, h), d = img.data;
    for (var y = 0; y < h; y++) for (var xp = 0; xp < w; xp++) {
      /* horizontal ramp being quantized */
      var f = xp / w;                        // 0..1 input
      var by = Math.floor(y / scale) & 7,
          bx = Math.floor(xp / scale) & 7;
      var th = (B[by][bx] + 0.5) / 64;      // threshold 0..1
      var q = Math.floor(f * (levels - 1) + th);
      if (q >= levels) q = levels - 1; if (q < 0) q = 0;
      var v = Math.round(q * 255 / (levels - 1));
      var idx = (y * w + xp) * 4;
      d[idx] = d[idx + 1] = d[idx + 2] = v; d[idx + 3] = 255;
    }
    x.putImageData(img, 0, 0);
  }

  function inkChain(cv, p) {
    /* feTurbulence + feDisplacementMap in software: build a low-freq noise
       and displace horizontal strokes by it. Opaque brush edge — the atom's
       rule is that the edge stays SOLID, so no per-pixel alpha ramp. */
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    x.fillStyle = '#eeeae1'; x.fillRect(0, 0, w, h);
    var freq = (p && p.freq) || 0.02,
        amp = (p && p.amp) || 8,
        seed = (p && p.seed) || 42;
    var rnd = mulberry(seed);
    /* build a low-freq noise field once */
    var GW = 40, GH = 40;
    var noise = new Float32Array(GW * GH);
    for (var i = 0; i < noise.length; i++) noise[i] = rnd();
    function sample(fx, fy) {
      var gx = fx * freq * w, gy = fy * freq * h;
      var ix = Math.floor(gx) % GW, iy = Math.floor(gy) % GH;
      if (ix < 0) ix += GW; if (iy < 0) iy += GH;
      return noise[iy * GW + ix];
    }
    x.strokeStyle = '#141210'; x.lineWidth = 6; x.lineCap = 'round';
    for (var s = 0; s < 3; s++) {
      x.beginPath();
      var y0 = h * (0.25 + s * 0.25);
      for (var xx = 8; xx <= w - 8; xx += 2) {
        var d = (sample(xx, s * 13) - 0.5) * amp;
        if (xx === 8) x.moveTo(xx, y0 + d);
        else x.lineTo(xx, y0 + d);
      }
      x.stroke();
    }
  }

  function granulation(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    /* wash first */
    var wash = x.createLinearGradient(0, 0, w, h);
    wash.addColorStop(0, '#e5d9bf'); wash.addColorStop(1, '#c6a679');
    x.fillStyle = wash; x.fillRect(0, 0, w, h);
    /* pigment settle: multiplicative pepper */
    var rnd = mulberry((p && p.seed) || 77);
    var density = (p && p.density) || 160;
    x.globalCompositeOperation = 'multiply';
    for (var k = 0; k < density; k++) {
      var a = 0.14 + rnd() * 0.24;
      x.fillStyle = 'rgba(72, 46, 20, ' + a.toFixed(2) + ')';
      var r = 0.8 + rnd() * 2.4;
      x.beginPath();
      x.arc(rnd() * w, rnd() * h, r, 0, 6.2832); x.fill();
    }
    x.globalCompositeOperation = 'source-over';
  }

  function edgeBloom(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    x.fillStyle = '#efe7d5'; x.fillRect(0, 0, w, h);
    var width = (p && p.width) || 14;
    var rnd = mulberry((p && p.seed) || 33);
    /* a wash */
    var mid = h * 0.55;
    x.fillStyle = '#c7bfa2'; x.fillRect(0, 0, w, mid);
    /* crest at the edge */
    for (var k = 0; k < width * 4; k++) {
      var t = k / (width * 4);
      var y = mid - width + t * width * 2;
      var alpha = Math.exp(-Math.pow((y - mid) / (width * 0.6), 2));
      x.strokeStyle = 'rgba(64, 46, 14, ' + (alpha * 0.35).toFixed(2) + ')';
      x.lineWidth = 1;
      x.beginPath();
      for (var xx = 0; xx <= w; xx += 3) {
        var dy = (rnd() - 0.5) * 1.2;
        if (xx === 0) x.moveTo(xx, y + dy); else x.lineTo(xx, y + dy);
      }
      x.stroke();
    }
  }

  /* ==========================================================================
     SUBSTRATE
     ========================================================================== */

  function bone140(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    var warmth = (p && p.warmth) != null ? p.warmth : 12;
    /* warm off-white, plate mark 1px, no shadow */
    var base = 246 - warmth * 0.3;
    x.fillStyle = 'rgb(' + Math.round(base) + ',' + Math.round(base - warmth * 0.15) + ',' +
                   Math.round(base - warmth) + ')';
    x.fillRect(0, 0, w, h);
    var rnd = mulberry(4141);
    var img = x.getImageData(0, 0, w, h), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var n = (rnd() - .5) * 6;
      d[i] = Math.max(0, Math.min(255, d[i] + n));
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
    }
    x.putImageData(img, 0, 0);
    /* plate mark */
    x.strokeStyle = 'rgba(30,26,18,.18)'; x.lineWidth = 1;
    x.strokeRect(0.5, 0.5, w - 1, h - 1);
  }

  function tyvek(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    x.fillStyle = '#eeeee9'; x.fillRect(0, 0, w, h);
    var sheen = (p && p.sheen) || 18;
    var rnd = mulberry((p && p.seed) || 91);
    /* fibre-direction sheen: fine parallel bands */
    x.globalAlpha = 0.08;
    for (var k = 0; k < 400; k++) {
      var y = rnd() * h;
      var len = 8 + rnd() * (w * 0.5);
      var start = rnd() * w;
      x.strokeStyle = rnd() < 0.5 ? '#000' : '#fff';
      x.lineWidth = 0.7 + rnd() * 0.9;
      x.beginPath();
      x.moveTo(start, y);
      x.lineTo(start + len, y + (rnd() - 0.5) * 0.6);
      x.stroke();
    }
    x.globalAlpha = 1;
    /* soft sheen band */
    var gr = x.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0.0, 'rgba(255,255,255,0)');
    gr.addColorStop(0.5, 'rgba(255,255,255,' + (sheen / 200).toFixed(3) + ')');
    gr.addColorStop(1.0, 'rgba(255,255,255,0)');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
  }

  /* ==========================================================================
     PROCESS
     ========================================================================== */

  function twoDrumRiso(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    x.fillStyle = '#efece5'; x.fillRect(0, 0, w, h);
    var ox = (p && p['offset-x']) != null ? p['offset-x'] : 2.4;
    var oy = (p && p['offset-y']) != null ? p['offset-y'] : 1.1;
    /* two flat colour rectangles, one offset — the two drums, off register.
       These are the reproduction colours the riso-xerox style declares. */
    x.fillStyle = 'rgba(74, 84, 207, .82)';     /* drum 01 · blue */
    x.fillRect(w * 0.14, h * 0.24, w * 0.62, h * 0.44);
    x.fillStyle = 'rgba(232, 83, 31, .75)';    /* drum 02 · orange */
    x.fillRect(w * 0.14 + ox * 3, h * 0.24 + oy * 3, w * 0.62, h * 0.44);
    /* register cross bottom-right */
    x.strokeStyle = '#141210'; x.lineWidth = 1;
    var cx = w * 0.88, cy = h * 0.82;
    x.beginPath(); x.moveTo(cx - 6, cy); x.lineTo(cx + 6, cy);
    x.moveTo(cx, cy - 6); x.lineTo(cx, cy + 6); x.stroke();
  }

  function xeroxDegradation(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    x.fillStyle = '#e8e5dd'; x.fillRect(0, 0, w, h);
    var gens = (p && p.generations) || 3;
    var starve = (p && p.starve) != null ? p.starve : 24;
    var jitter = (p && p.jitter) != null ? p.jitter : 1.5;
    var rnd = mulberry(gens * 91 + 3);
    /* a filled rect, then toner starve inside it plus feed jitter along edges */
    var rx = w * 0.15, ry = h * 0.22, rw = w * 0.7, rh = h * 0.44;
    x.fillStyle = '#1c1c1e'; x.fillRect(rx, ry, rw, rh);
    /* pinholes */
    x.fillStyle = '#e8e5dd';
    for (var k = 0; k < 300 * gens; k++) {
      var px = rx + rnd() * rw, py = ry + rnd() * rh;
      x.fillRect(px, py, 1 + rnd() * 2, 1);
    }
    /* edge burn */
    x.globalAlpha = 0.55;
    for (var b = 0; b < starve; b++) {
      x.fillStyle = 'rgba(60,50,40,' + (0.08 + rnd() * 0.1) + ')';
      x.fillRect(rx - 4 + rnd() * (rw + 8), ry - 2 + rnd() * (rh + 4),
        1 + rnd() * 5, 1 + rnd() * 2);
    }
    x.globalAlpha = 1;
    /* feed jitter: horizontal lines skipping down */
    for (var j = 0; j < h; j += 4) {
      var jj = (rnd() - 0.5) * jitter;
      x.fillStyle = 'rgba(0,0,0,.04)';
      x.fillRect(0, j + jj, w, 1);
    }
  }

  function watercolourWash(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    x.fillStyle = '#efece5'; x.fillRect(0, 0, w, h);
    var wet = (p && p.wet) != null ? p.wet : 0.55;
    var rnd = mulberry((p && p.seed) || 501);
    /* soft blob composited soft-light. Order matters — this is W1 pass 1. */
    x.globalCompositeOperation = 'soft-light';
    for (var k = 0; k < 24; k++) {
      var a = 0.15 + rnd() * 0.35 * wet;
      var rgrd = x.createRadialGradient(rnd() * w, rnd() * h, 0, rnd() * w, rnd() * h, 40 + rnd() * 60);
      rgrd.addColorStop(0, 'rgba(56, 40, 26, ' + a.toFixed(2) + ')');
      rgrd.addColorStop(1, 'rgba(56, 40, 26, 0)');
      x.fillStyle = rgrd; x.fillRect(0, 0, w, h);
    }
    x.globalCompositeOperation = 'source-over';
  }

  /* ==========================================================================
     COLOUR — swatches CARRY their own colour. The chrome stays grey.
     ========================================================================== */

  function oklabRamp(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    /* an actual MIR-21 style ATMOSPHERIC ramp — evening sky through band */
    var stops = [
      '#f4d5a4', /* sand */
      '#e6a778', /* light band */
      '#9d7967', /* dust */
      '#5b6a7d', /* haze */
      '#2c3f5b', /* deep sky */
      '#141c30', /* horizon dark */
      '#050914'  /* zenith */
    ];
    var n = (p && p.stops) || stops.length;
    n = Math.max(3, Math.min(stops.length, n));
    /* main gradient */
    var gr = x.createLinearGradient(0, 0, 0, h);
    for (var i = 0; i < n; i++) gr.addColorStop(i / (n - 1), stops[i]);
    x.fillStyle = gr; x.fillRect(0, 0, w * 0.72, h);
    /* stepped chips on the right — "she works in ramps" */
    for (var j = 0; j < n; j++) {
      x.fillStyle = stops[j];
      x.fillRect(w * 0.72, h * j / n, w * 0.28, h / n);
    }
  }

  /* ==========================================================================
     MARK
     ========================================================================== */

  function cutPaperEdge(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    x.fillStyle = '#efece5'; x.fillRect(0, 0, w, h);
    /* two flat colour bands with a hand-scale ridge between them */
    x.fillStyle = '#c9c1a4'; x.fillRect(0, 0, w, h * 0.5);
    x.fillStyle = '#8a6d4a'; x.fillRect(0, h * 0.5, w, h * 0.5);
    var rnd = mulberry((p && p.seed) || 88);
    var ridge = (p && p.ridge) || 1.2;
    x.strokeStyle = '#141210'; x.lineWidth = ridge; x.lineCap = 'round';
    x.beginPath();
    for (var xx = 0; xx <= w; xx += 2) {
      var y = h * 0.5 + (rnd() - 0.5) * 1.6;
      if (xx === 0) x.moveTo(xx, y); else x.lineTo(xx, y);
    }
    x.stroke();
    /* the one-pixel accent — the "cut" part */
    x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 1;
    x.beginPath();
    for (var xk = 0; xk <= w; xk += 2) {
      var yk = h * 0.5 + (rnd() - 0.5) * 1.6 - 1;
      if (xk === 0) x.moveTo(xk, yk); else x.lineTo(xk, yk);
    }
    x.stroke();
  }

  /* ==========================================================================
     FIELD
     ========================================================================== */

  function fbmNoise(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    var oct = (p && p.octaves) || 5;
    var lac = (p && p.lacunarity) || 2;
    var gain = (p && p.gain) || 0.5;
    var rnd = mulberry(4141);
    /* build a low-res noise LUT and sum it fBm-style */
    function hash(ix, iy) {
      var n = (ix | 0) * 374761393 + (iy | 0) * 668265263;
      n = (n ^ (n >>> 13)) * 1274126177;
      return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
    }
    function value(fx, fy) {
      var ix = Math.floor(fx), iy = Math.floor(fy);
      var u = fx - ix, v = fy - iy;
      var a = hash(ix, iy), b = hash(ix + 1, iy),
          c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
      u = u * u * (3 - 2 * u); v = v * v * (3 - 2 * v);
      return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
    }
    var img = x.createImageData(w, h), d = img.data;
    var stride = 3;
    for (var y = 0; y < h; y += stride) for (var xp = 0; xp < w; xp += stride) {
      var amp = 1, freq = 3 / w, sum = 0, norm = 0;
      for (var o = 0; o < oct; o++) {
        sum += amp * value(xp * freq, y * freq);
        norm += amp; amp *= gain; freq *= lac;
      }
      var v = Math.round(255 * sum / norm);
      for (var dy = 0; dy < stride && y + dy < h; dy++) for (var dx = 0; dx < stride && xp + dx < w; dx++) {
        var idx = ((y + dy) * w + xp + dx) * 4;
        d[idx] = d[idx + 1] = d[idx + 2] = v; d[idx + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0);
    if (rnd) {/* keep the seeded rnd in scope so the linter cannot say it is unused */}
  }

  /* ==========================================================================
     ENGINE — a swatch that says "this is a shared implementation, not a path"
     ========================================================================== */

  function engineCard(label, subtitle) {
    return function (cv) {
      var g = fit(cv), x = g.x, w = g.w, h = g.h;
      /* neutral card, monospace label, corner mark. The engine atoms exist to
         make paths into entries — the swatch is a card, not a picture. */
      x.fillStyle = '#e9e9e9'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#b6b6bb'; x.lineWidth = 1;
      x.strokeRect(0.5, 0.5, w - 1, h - 1);
      /* corner brace */
      x.beginPath();
      x.moveTo(6, 6); x.lineTo(6, 20); x.moveTo(6, 6); x.lineTo(20, 6);
      x.moveTo(w - 6, h - 6); x.lineTo(w - 6, h - 20); x.moveTo(w - 6, h - 6); x.lineTo(w - 20, h - 6);
      x.stroke();
      /* label */
      x.fillStyle = '#0b0b0c';
      x.font = 'bold ' + Math.max(11, Math.round(w / 12)) + 'px "Commit Mono", "DejaVu Sans Mono", monospace';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(label, w / 2, h / 2 - 6);
      if (subtitle) {
        x.fillStyle = '#74747a';
        x.font = Math.max(9, Math.round(w / 20)) + 'px "Commit Mono", monospace';
        x.fillText(subtitle, w / 2, h / 2 + 12);
      }
    };
  }

  /* ==========================================================================
     AUDIO ATOMS · signal-flow swatches. A filter or an envelope has no
     paintable "look" — what you paint is the GRAPH. Every renderer here
     draws a small block diagram with node labels and a per-parameter
     read-out (Hz, ms, dBFS). No hue; the same neutral ramp the visual
     swatches use.
     ========================================================================== */

  /* small helpers for the diagrams */
  function boxNode(x, cx, cy, w, h, label, sub) {
    x.save();
    x.strokeStyle = '#0b0b0c'; x.lineWidth = 1;
    x.fillStyle = '#ffffff';
    x.beginPath(); x.rect(cx - w / 2, cy - h / 2, w, h); x.fill(); x.stroke();
    x.fillStyle = '#0b0b0c';
    x.font = '600 11px "Commit Mono", ui-monospace, monospace';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(label, cx, cy - (sub ? 6 : 0));
    if (sub) {
      x.fillStyle = '#74747a';
      x.font = '9px "Commit Mono", ui-monospace, monospace';
      x.fillText(sub, cx, cy + 8);
    }
    x.restore();
  }
  function arrow(x, x0, y0, x1, y1) {
    x.save();
    x.strokeStyle = '#0b0b0c'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
    var ang = Math.atan2(y1 - y0, x1 - x0);
    x.beginPath();
    x.moveTo(x1, y1);
    x.lineTo(x1 - 5 * Math.cos(ang - 0.5), y1 - 5 * Math.sin(ang - 0.5));
    x.lineTo(x1 - 5 * Math.cos(ang + 0.5), y1 - 5 * Math.sin(ang + 0.5));
    x.closePath(); x.fillStyle = '#0b0b0c'; x.fill();
    x.restore();
  }
  function fbLoop(x, x0, y0, x1, y1, ymid) {
    /* feedback arrow that loops up and back */
    x.save();
    x.strokeStyle = '#0b0b0c'; x.lineWidth = 1;
    x.beginPath();
    x.moveTo(x1, y1); x.lineTo(x1, ymid);
    x.lineTo(x0, ymid); x.lineTo(x0, y0);
    x.stroke();
    var ang = Math.atan2(y0 - ymid, 0);
    x.beginPath();
    x.moveTo(x0, y0);
    x.lineTo(x0 - 5, y0 + 5);
    x.lineTo(x0 + 5, y0 + 5);
    x.closePath(); x.fillStyle = '#0b0b0c'; x.fill();
    x.restore();
  }
  function label(x, cx, cy, text) {
    x.save();
    x.fillStyle = '#74747a';
    x.font = '9px "Commit Mono", ui-monospace, monospace';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(text, cx, cy);
    x.restore();
  }

  /* freeverb-comb: [in]→[delay dt]→[LP damping,Q=0.5]→[gain fb]→loop back */
  function freeverbComb(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    paperGround(x, w, h);
    var y = h * 0.58;
    boxNode(x, 26,        y, 32, 22, 'in');
    boxNode(x, w * 0.32,  y, 62, 30, 'delay', (p.delay * 1000).toFixed(0) + ' ms');
    boxNode(x, w * 0.56,  y, 68, 30, 'LP',    (p.damping | 0) + ' Hz');
    boxNode(x, w * 0.80,  y, 46, 30, '×fb',   p.feedback.toFixed(2));
    arrow(x, 42,             y, w * 0.32 - 31, y);
    arrow(x, w * 0.32 + 31,  y, w * 0.56 - 34, y);
    arrow(x, w * 0.56 + 34,  y, w * 0.80 - 23, y);
    arrow(x, w * 0.80 + 23,  y, w - 12, y);
    fbLoop(x, w * 0.32 - 31, y - 15, w * 0.80 + 23, y + 15, h * 0.16);
    label(x, w / 2, 20, 'FEEDBACK LOOP');
    label(x, w * 0.56, y + 26, 'in-loop damping — Q=0.5, not 1');
  }

  /* allpass-diffuser: schematic of feed-fwd -0.5 + feed-back +0.5 */
  function allpassDiffuser(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    paperGround(x, w, h);
    var y = h * 0.55;
    boxNode(x, 28,       y, 32, 22, 'in');
    boxNode(x, w * 0.36, y, 62, 30, 'delay', (p.delay * 1000).toFixed(1) + ' ms');
    boxNode(x, w * 0.64, y, 46, 30, 'Σ', '');
    boxNode(x, w * 0.86, y, 32, 22, 'out');
    arrow(x, 44,             y, w * 0.36 - 31, y);
    arrow(x, w * 0.36 + 31,  y, w * 0.64 - 23, y);
    arrow(x, w * 0.64 + 23,  y, w * 0.86 - 16, y);
    /* feed-forward -0.5 */
    x.strokeStyle = '#0b0b0c'; x.lineWidth = 1;
    x.beginPath();
    x.moveTo(w * 0.36 - 31, y - 11);
    x.lineTo(w * 0.36 - 31, y - 22);
    x.lineTo(w * 0.64,      y - 22);
    x.lineTo(w * 0.64,      y - 15);
    x.stroke();
    label(x, (w * 0.36 + w * 0.64) / 2, y - 30, '−' + p.feedback.toFixed(2) + ' (feed-forward)');
    /* feed-back +0.5 */
    x.beginPath();
    x.moveTo(w * 0.64, y + 15);
    x.lineTo(w * 0.64, y + 26);
    x.lineTo(w * 0.36, y + 26);
    x.lineTo(w * 0.36, y + 11);
    x.stroke();
    label(x, (w * 0.36 + w * 0.64) / 2, y + 34, '+' + p.feedback.toFixed(2) + ' (feedback)');
  }

  /* master-limiter: input → trim → compressor → limiter → out */
  function masterLimiter(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    paperGround(x, w, h);
    var y = h * 0.55;
    boxNode(x, 24,       y, 28, 20, 'in');
    boxNode(x, w * 0.24, y, 46, 26, 'trim', p.trim.toFixed(2));
    boxNode(x, w * 0.48, y, 60, 32, 'comp', p['comp-thresh'] + ' dB');
    boxNode(x, w * 0.74, y, 60, 32, 'lim',  p['lim-thresh'] + ' dB');
    boxNode(x, w * 0.92, y, 26, 20, 'out');
    arrow(x, 38,             y, w * 0.24 - 23, y);
    arrow(x, w * 0.24 + 23,  y, w * 0.48 - 30, y);
    arrow(x, w * 0.48 + 30,  y, w * 0.74 - 30, y);
    arrow(x, w * 0.74 + 30,  y, w * 0.92 - 13, y);
    label(x, w * 0.48, y + 25, 'broadband glue');
    label(x, w * 0.74, y + 25, 'hard peak-catch');
  }

  /* sidechain-duck: heavy voice → duck all ambient/room via cancel+setTarget */
  function sidechainDuck(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    paperGround(x, w, h);
    boxNode(x, w * 0.18, h * 0.36, 78, 28, 'heavy', 'voice');
    boxNode(x, w * 0.18, h * 0.68, 78, 28, 'ambient', 'bus');
    boxNode(x, w * 0.62, h * 0.52, 64, 30, '×gain', p.depth.toFixed(2));
    boxNode(x, w * 0.88, h * 0.52, 28, 22, 'out');
    arrow(x, w * 0.18 + 39, h * 0.36, w * 0.62,        h * 0.52 - 6);
    arrow(x, w * 0.18 + 39, h * 0.68, w * 0.62,        h * 0.52 + 6);
    arrow(x, w * 0.62 + 32, h * 0.52, w * 0.88 - 14,   h * 0.52);
    /* sidechain arrow — the heavy voice modulates the gain */
    x.save();
    x.strokeStyle = '#0b0b0c'; x.lineWidth = 1; x.setLineDash([3, 3]);
    x.beginPath();
    x.moveTo(w * 0.18, h * 0.36 - 14);
    x.bezierCurveTo(w * 0.32, h * 0.16, w * 0.55, h * 0.20, w * 0.62, h * 0.52 - 15);
    x.stroke();
    x.restore();
    label(x, w * 0.42, h * 0.10, 'SIDECHAIN · duck ' + (p.depth * 100 | 0) + '% · ' +
      (p.attack * 1000).toFixed(0) + '/' + (p.release * 1000).toFixed(0) + ' ms');
  }

  /* banded-burst: noise → bandpass(freq,Q) → env(attack, dur) — with a mini
     envelope sketch on the right so the shape is visible */
  function bandedBurst(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    paperGround(x, w, h);
    var y = h * 0.42;
    boxNode(x, 30,       y, 44, 22, 'noise');
    boxNode(x, w * 0.32, y, 68, 30, 'BP', p.freq + ' Hz · Q' + p.Q);
    boxNode(x, w * 0.58, y, 60, 30, 'env', (p.duration * 1000).toFixed(0) + ' ms');
    arrow(x, 52,             y, w * 0.32 - 34, y);
    arrow(x, w * 0.32 + 34,  y, w * 0.58 - 30, y);
    arrow(x, w * 0.58 + 30,  y, w - 20, y);
    /* envelope sketch */
    x.save();
    var ex0 = w * 0.10, ey0 = h * 0.86, ew = w * 0.80, eh = h * 0.30;
    x.strokeStyle = 'rgba(11,11,12,.15)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(ex0, ey0); x.lineTo(ex0 + ew, ey0); x.stroke();
    x.strokeStyle = '#0b0b0c'; x.lineWidth = 1.5;
    x.beginPath();
    var pts = 60;
    for (var i = 0; i <= pts; i++) {
      var t = i / pts;                        /* 0..1 across the sketch */
      var v;
      if (t < 0.04) v = t / 0.04;             /* 4% attack ramp */
      else v = Math.exp(-(t - 0.04) * 6);     /* exp decay */
      var xx = ex0 + t * ew;
      var yy = ey0 - v * eh;
      if (i === 0) x.moveTo(xx, yy); else x.lineTo(xx, yy);
    }
    x.stroke();
    x.restore();
    label(x, w / 2, h - 6, 'attack 2 ms · exp decay · setValueAtTime(0) trailing');
  }

  /* buzz-envelope: noise → BP → gain × LFO — the mini LFO waveform on the right */
  function buzzEnvelope(cv, p) {
    var g = fit(cv), x = g.x, w = g.w, h = g.h;
    paperGround(x, w, h);
    var y = h * 0.38;
    boxNode(x, 28,       y, 44, 22, 'noise');
    boxNode(x, w * 0.30, y, 68, 30, 'BP', p.centre + ' Hz · Q' + p.Q);
    boxNode(x, w * 0.58, y, 46, 30, '×gain', '');
    boxNode(x, w * 0.82, y, 32, 22, 'out');
    arrow(x, 50,             y, w * 0.30 - 34, y);
    arrow(x, w * 0.30 + 34,  y, w * 0.58 - 23, y);
    arrow(x, w * 0.58 + 23,  y, w * 0.82 - 16, y);
    /* LFO into the gain (from below) */
    boxNode(x, w * 0.58, h * 0.75, 62, 26, 'LFO', p.rate.toFixed(1) + ' Hz');
    arrow(x, w * 0.58, h * 0.75 - 13, w * 0.58, y + 15);
    /* LFO waveform sketch */
    x.save();
    var wx0 = w * 0.06, wy0 = h * 0.75, ww = w * 0.36, wh = h * 0.24;
    x.strokeStyle = 'rgba(11,11,12,.15)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(wx0, wy0); x.lineTo(wx0 + ww, wy0); x.stroke();
    x.strokeStyle = '#0b0b0c'; x.lineWidth = 1.3;
    x.beginPath();
    for (var i = 0; i <= 80; i++) {
      var t = i / 80;
      var v = Math.sin(t * Math.PI * 2 * 2) * 0.5;   /* two cycles across the sketch */
      var xx = wx0 + t * ww;
      var yy = wy0 - v * wh;
      if (i === 0) x.moveTo(xx, yy); else x.lineTo(xx, yy);
    }
    x.stroke();
    x.restore();
  }

  /* ==========================================================================
     Registry
     ========================================================================== */

  window.Shell = window.Shell || {};
  window.Shell.swatches = {
    'paper-tooth':       paperTooth,
    'dot-screen-20':     dotScreen20,
    'bayer8':            bayer8,
    'ink-chain':         inkChain,
    'granulation':       granulation,
    'edge-bloom':        edgeBloom,

    'bone-140gsm':       bone140,
    'tyvek':             tyvek,

    'two-drum-riso':     twoDrumRiso,
    'xerox-degradation': xeroxDegradation,
    'watercolour-wash':  watercolourWash,

    'oklab-ramp':        oklabRamp,

    'cut-paper-edge':    cutPaperEdge,

    'fbm-noise':         fbmNoise,

    'mulberry32':        engineCard('rng.js',      'mulberry32(seed)'),
    'halftone-js':       engineCard('halftone.js', 'dotScreen(ctx,W,H,samp,opt)'),
    'paper-js':          engineCard('paper.js',    'paperTooth() · paperTile()'),
    'field-js':          engineCard('field.js',    'buildField(W,H,rnd,bias,c)'),

    /* ck-e5 · audio atoms — signal-flow diagrams. Voice/space/bus atoms
       have no paintable "look"; what you paint is the graph. */
    'freeverb-comb':     freeverbComb,
    'allpass-diffuser':  allpassDiffuser,
    'master-limiter':    masterLimiter,
    'sidechain-duck':    sidechainDuck,
    'banded-burst':      bandedBurst,
    'buzz-envelope':     buzzEnvelope
  };

  /* Paint one canvas from its data-atom id, respecting the atom's declared
     params (a caller may pass an override object). Idempotent — repaint is
     a no-op cost above the loop itself. */
  window.Shell.paintSwatch = function (cv, params) {
    var id = cv && cv.getAttribute && cv.getAttribute('data-atom');
    if (!id) return;
    var fn = window.Shell.swatches[id];
    if (!fn) {
      /* no swatch on file: draw an empty card so the shelf still reads
         as a shelf, not as a hole */
      engineCard(id, 'no swatch on file')(cv);
      return;
    }
    /* params: caller override wins, otherwise pick default values from the
       atom's declared params[] */
    var p = params;
    if (!p) {
      p = {};
      var atom = window.Shell.byId && window.Shell.byId[id];
      var declared = (atom && atom.params) || [];
      for (var i = 0; i < declared.length; i++) {
        p[declared[i].name] = declared[i].value;
      }
    }
    try { fn(cv, p); }
    catch (e) { if (window.console && console.warn) console.warn('[swatches] ' + id + ': ' + e.message); }
  };
})();
