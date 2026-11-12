/* press.js — MINDGUT print press. Classic script, attaches to window.MG. */
(function (W) {
  var MG = W.MG = W.MG || {};

  // mulberry32
  MG.rng = function (seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  function mk(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  // Paper tooth: per-pixel near-white noise + long faint horizontal fibres. Goes UNDER ink.
  MG.paperTooth = function (canvas, w, h, o) {
    o = o || {};
    var seed = o.seed == null ? 7 : o.seed, base = o.base == null ? 246 : o.base, amp = o.amp == null ? 22 : o.amp;
    var r = MG.rng(seed), ctx = canvas.getContext('2d');
    canvas.width = w; canvas.height = h;
    var img = ctx.createImageData(w, h), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = base + (r() - .5) * 2 * amp;
      d[i] = v; d[i + 1] = v - 1; d[i + 2] = v - 5; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    var fib = o.fibres == null ? Math.round(h / 5) : o.fibres;
    ctx.strokeStyle = 'rgba(60,50,30,0.045)'; ctx.lineWidth = 1;
    for (var k = 0; k < fib; k++) {
      var y = r() * h, x = r() * w, len = w * (.15 + r() * .5);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y + (r() - .5) * 2); ctx.stroke();
    }
    return canvas;
  };

  MG.paperTile = function (o) {
    o = o || {}; var s = o.size || 180;
    return MG.paperTooth(mk(s, s), s, s, { seed: o.seed == null ? 3 : o.seed, base: o.base, amp: o.amp }).toDataURL();
  };

  // Risograph: paper tooth, then each plate on its own drum (offset + rotation), stochastic screen, starve pinholes.
  MG.riso = function (canvas, w, h, plates, o) {
    o = o || {};
    var seed = o.seed == null ? 11 : o.seed, misreg = o.misreg == null ? 2.2 : o.misreg;
    var grain = o.grain == null ? .18 : o.grain, starve = o.starve == null ? .35 : o.starve;
    MG.paperTooth(canvas, w, h, { seed: seed, amp: 22 * (grain / .18) });
    var ctx = canvas.getContext('2d');
    var hw = Math.ceil(w / 2), hh = Math.ceil(h / 2);
    plates.forEach(function (p, k) {
      var r = MG.rng(seed + k * 101);
      var dx = (r() - .5) * 2 * misreg, dy = (r() - .5) * 2 * misreg, rot = (r() - .5) * .008;
      var t = mk(hw, hh), tc = t.getContext('2d');
      var img = tc.createImageData(hw, hh), d = img.data;
      var col = hex(p.color);
      for (var y = 0; y < hh; y++) for (var x = 0; x < hw; x++) {
        var c = p.coverage((x + .5) / hw, (y + .5) / hh), i = (y * hw + x) * 4;
        if (c <= 0) continue;
        var ink = r() < c;
        if (ink && c > .85 && r() < starve * (c - .85) * 6) ink = false;
        if (!ink) continue;
        d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
      }
      tc.putImageData(img, 0, 0);
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.translate(w / 2 + dx, h / 2 + dy); ctx.rotate(rot);
      ctx.drawImage(t, -w / 2, -h / 2, w, h);
      ctx.restore();
    });
    return canvas;
  };

  function hex(s) {
    s = s.replace('#', ''); if (s.length === 3) s = s.replace(/./g, function (c) { return c + c; });
    var n = parseInt(s, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  MG.hex = hex;

  // Line screen: render draw(ctx) black on temp; vertical ink bars where column alpha > .5.
  MG.lineScreen = function (canvas, w, h, draw, o) {
    o = o || {};
    var pitch = o.pitch || 4, ink = o.ink || '#14452F';
    MG.paperTooth(canvas, w, h, { seed: o.seed == null ? 5 : o.seed, base: 246, amp: 18 });
    var t = mk(w, h), tc = t.getContext('2d');
    tc.fillStyle = '#000'; tc.strokeStyle = '#000'; draw(tc);
    var d = tc.getImageData(0, 0, w, h).data;
    var ctx = canvas.getContext('2d');
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = ink;
    var bw = pitch * .55;
    for (var x = 0; x < w; x += pitch) {
      var run = -1, sx = Math.min(w - 1, x + (pitch >> 1));
      for (var y = 0; y <= h; y++) {
        var on = y < h && d[(y * w + sx) * 4 + 3] > 127;
        if (on && run < 0) run = y;
        else if (!on && run >= 0) { ctx.fillRect(x, run, bw, y - run); run = -1; }
      }
    }
    ctx.restore();
    return canvas;
  };

  // Stamp: perforated edge via CSS mask, paper panel, label/sub/corner, leaf SVG.
  MG.stamp = function (el, o) {
    o = o || {};
    var w = o.w || 220, h = o.h || 270, color = o.color || '#2E6B45';
    var label = o.label || 'MINDGUT', sub = o.sub || 'HELIX · 6,630', corner = o.corner || '01';
    var paper = o.paper || MG.paperTile({ seed: 21, size: 160 });
    var mask = 'radial-gradient(circle at 7px 7px, transparent 5px, #000 5.5px)';
    var s = document.createElement('div');
    s.style.cssText = 'position:relative;width:' + w + 'px;height:' + h + 'px;background:' + color +
      ';-webkit-mask-image:' + mask + ';mask-image:' + mask + ';-webkit-mask-size:14px 14px;mask-size:14px 14px;' +
      '-webkit-mask-position:-7px -7px;mask-position:-7px -7px;box-sizing:border-box;padding:16px;font-family:"JetBrains Mono",monospace';
    var panel = document.createElement('div');
    panel.style.cssText = 'position:absolute;inset:16px;background:#F2EEE3 url(' + paper + ');background-blend-mode:multiply;' +
      'border:1px solid rgba(0,0,0,.25);box-sizing:border-box;padding:12px;color:' + color;
    panel.innerHTML =
      '<div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase">' + label + '</div>' +
      '<svg viewBox="0 0 100 100" style="position:absolute;left:50%;top:50%;width:46%;transform:translate(-50%,-50%)">' +
      '<path d="M50 8 C 78 24, 90 54, 52 92 C 14 54, 24 24, 50 8 Z M50 20 L50 84" fill="' + color + '" stroke="#F2EEE3" stroke-width="2"/>' +
      '<path d="M50 40 L66 32 M50 52 L68 46 M50 64 L66 60 M50 40 L34 32 M50 52 L32 46 M50 64 L34 60" stroke="#F2EEE3" stroke-width="1.5" fill="none"/></svg>' +
      '<div style="position:absolute;left:12px;bottom:10px;font-size:9px;letter-spacing:.12em">' + sub + '</div>' +
      '<div style="position:absolute;right:12px;bottom:8px;font-size:18px;color:#E8541E;font-weight:700">' + corner + '</div>';
    s.appendChild(panel); el.appendChild(s); return s;
  };

  // Grain gradient: paint at 1/16, upscale smooth, then per-channel film grain.
  MG.grainGradient = function (canvas, w, h, stops, o) {
    o = o || {};
    var r = MG.rng(o.seed == null ? 9 : o.seed);
    var sw = Math.max(2, Math.round(w / 16)), sh = Math.max(2, Math.round(h / 16));
    var t = mk(sw, sh), tc = t.getContext('2d');
    var g = tc.createLinearGradient(0, 0, 0, sh);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    tc.fillStyle = g; tc.fillRect(0, 0, sw, sh);
    if (o.belt) {
      var b = o.belt, rg = tc.createRadialGradient(sw / 2, b.y * sh, 0, sw / 2, b.y * sh, sw * .5);
      var c = hex(b.color); var rgb = c[0] + ',' + c[1] + ',' + c[2];
      rg.addColorStop(0, 'rgba(' + rgb + ',.9)'); rg.addColorStop(1, 'rgba(' + rgb + ',0)');
      tc.save(); tc.translate(0, b.y * sh); tc.scale(1, (b.h * sh) / (sw * .5)); tc.translate(0, -b.y * sh);
      tc.fillStyle = rg; tc.fillRect(0, 0, sw, sh); tc.restore();
    }
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(t, 0, 0, w, h);
    var img = ctx.getImageData(0, 0, w, h), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      d[i] += (r() - .5) * 18; d[i + 1] += (r() - .5) * 18; d[i + 2] += (r() - .5) * 18;
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
  };

  // 21-step quantized triangle 0..1
  MG.breath = function (t, cycle) {
    cycle = cycle || 4200;
    var p = (t % cycle) / cycle, tri = p < .5 ? p * 2 : 2 - p * 2;
    return Math.round(tri * 20) / 20;
  };
})(window);
