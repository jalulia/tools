/* ============================================================================
   plot.js — the 1-D function plotter.

   The Book of Shaders uses this widget eleven times (`simpleFunction`) and the
   playground dropped it entirely, which is the most serious of its losses: it
   is the only place where the *shape of a value* is isolated from everything
   else. Chapter 13 builds fBm in one dimension with three of these in a row
   before it ever touches 2-D.

   It is implemented honestly: a small recursive-descent parser for a GLSL-ish
   scalar expression, compiled to a closure tree, sampled once per pixel column.
   No eval, no new Function, no library. Unknown identifiers and malformed
   input raise a message the widget prints instead of throwing.

   Deliberately NOT animated. `t` is a slider, not a clock: the point of the
   widget is to hold everything still except one number, and it also means a
   course page has zero requestAnimationFrame callbacks pending, which is what
   PLAN §7 criterion 4 asks of every stage on the page.
   ============================================================================ */
(function () {
  'use strict';
  var S = window.Shell;

  /* ---------------------------------------------------------------- lexer */
  function lex(src) {
    var out = [], i = 0;
    while (i < src.length) {
      var c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        var j = i;
        while (j < src.length && /[0-9.eE]/.test(src[j])) {
          if ((src[j] === 'e' || src[j] === 'E') && /[+-]/.test(src[j + 1] || '')) j++;
          j++;
        }
        var n = parseFloat(src.slice(i, j));
        if (isNaN(n)) throw new Error('bad number at ' + i);
        out.push({ t: 'num', v: n }); i = j; continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        var k = i;
        while (k < src.length && /[A-Za-z0-9_]/.test(src[k])) k++;
        out.push({ t: 'id', v: src.slice(i, k) }); i = k; continue;
      }
      if ('+-*/(),'.indexOf(c) >= 0) { out.push({ t: c }); i++; continue; }
      throw new Error('unexpected "' + c + '"');
    }
    out.push({ t: 'end' });
    return out;
  }

  /* -------------------------------------------------------------- library */
  var K = { PI: Math.PI, TAU: Math.PI * 2, E: Math.E };
  function fract(v) { return v - Math.floor(v); }
  function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }
  var F = {
    sin: [1, Math.sin], cos: [1, Math.cos], tan: [1, Math.tan],
    asin: [1, Math.asin], acos: [1, Math.acos],
    atan: [-1, function (a, b) { return b === undefined ? Math.atan(a) : Math.atan2(a, b); }],
    abs: [1, Math.abs], floor: [1, Math.floor], ceil: [1, Math.ceil],
    fract: [1, fract], sign: [1, Math.sign], sqrt: [1, Math.sqrt],
    inversesqrt: [1, function (a) { return 1 / Math.sqrt(a); }],
    exp: [1, Math.exp], log: [1, Math.log],
    exp2: [1, function (a) { return Math.pow(2, a); }],
    log2: [1, Math.log2], radians: [1, function (a) { return a * Math.PI / 180; }],
    degrees: [1, function (a) { return a * 180 / Math.PI; }],
    pow: [2, Math.pow], min: [2, Math.min], max: [2, Math.max],
    mod: [2, function (a, b) { return a - b * Math.floor(a / b); }],
    step: [2, function (e, v) { return v < e ? 0 : 1; }],
    distance: [2, function (a, b) { return Math.abs(a - b); }],
    clamp: [3, clamp],
    mix: [3, function (a, b, h) { return a + (b - a) * h; }],
    smoothstep: [3, function (e0, e1, v) {
      var h = clamp((v - e0) / (e1 - e0), 0, 1); return h * h * (3 - 2 * h);
    }]
  };

  /* --------------------------------------------------------------- parser */
  function parse(src, vars) {
    var ts = lex(src), p = 0;
    function peek() { return ts[p]; }
    function eat(t) {
      if (ts[p].t !== t) throw new Error('expected "' + t + '"');
      return ts[p++];
    }
    function expr() {
      var l = term();
      while (peek().t === '+' || peek().t === '-') {
        var op = ts[p++].t, r = term();
        l = (op === '+') ? add(l, r) : sub(l, r);
      }
      return l;
    }
    function add(a, b) { return function (e) { return a(e) + b(e); }; }
    function sub(a, b) { return function (e) { return a(e) - b(e); }; }
    function term() {
      var l = unary();
      while (peek().t === '*' || peek().t === '/') {
        var op = ts[p++].t, r = unary();
        l = (op === '*')
          ? (function (a, b) { return function (e) { return a(e) * b(e); }; })(l, r)
          : (function (a, b) { return function (e) { return a(e) / b(e); }; })(l, r);
      }
      return l;
    }
    function unary() {
      if (peek().t === '-') { p++; var n = unary(); return function (e) { return -n(e); }; }
      if (peek().t === '+') { p++; return unary(); }
      return primary();
    }
    function primary() {
      var tk = peek();
      if (tk.t === 'num') { p++; return function () { return tk.v; }; }
      if (tk.t === '(') { p++; var v = expr(); eat(')'); return v; }
      if (tk.t === 'id') {
        p++;
        var name = tk.v;
        if (peek().t === '(') {
          p++;
          var args = [];
          if (peek().t !== ')') {
            args.push(expr());
            while (peek().t === ',') { p++; args.push(expr()); }
          }
          eat(')');
          var f = F[name];
          if (!f) throw new Error('no function "' + name + '"');
          if (f[0] >= 0 && args.length !== f[0]) {
            throw new Error(name + '() takes ' + f[0] + ' argument' + (f[0] > 1 ? 's' : ''));
          }
          return function (e) {
            var a = args.map(function (g) { return g(e); });
            return f[1].apply(null, a);
          };
        }
        if (Object.prototype.hasOwnProperty.call(K, name)) {
          return function () { return K[name]; };
        }
        if (vars.indexOf(name) < 0) throw new Error('unknown name "' + name + '"');
        return function (e) { return e[name]; };
      }
      throw new Error('unexpected end of expression');
    }
    var fn = expr();
    eat('end');
    return fn;
  }

  /* --------------------------------------------------------------- widget */
  var W = 560, H = 260;

  function build(spec, host) {
    var id = 'plot-' + Math.random().toString(36).slice(2, 8);
    var uses = /\bt\b/.test(spec.expr);
    var vars = ['x', 't'];
    var dom = spec.domain || [0, 1];
    var ran = spec.range || [0, 1];

    /* CK8 · A plot's backing store is allocated ON APPROACH and released on
       exit, and it is sized to the display rather than pinned at 2x.
       Before: every plot on a chapter allocated 1120x520x4 = 2.33 MB at load,
       whatever the screen, whatever was on it — chapter 10 carries three, so
       an entry route opened with FOUR canvases and 8.9 MB of store against
       PLAN §7.10's budget of two. The canvas starts at 0x0 (no store), an
       IntersectionObserver sizes it and draws when it comes within a viewport
       of the fold, and zeroes it again on exit. Nothing above the fold
       changes; the plots still redraw on every keystroke. */
    host.innerHTML =
      '<div class="plot">' +
        '<canvas width="0" height="0"' +
          ' style="aspect-ratio:' + W + '/' + H + '" role="img" aria-label="Plot of ' +
          S.esc(spec.expr) + '"></canvas>' +
        '<div class="pf"><span class="y">y =</span>' +
          '<input id="' + id + '" value="' + S.esc(spec.expr) + '" spellcheck="false" ' +
          'aria-label="Function of x"></div>' +
        (uses ? '<div class="pf"><span class="y">t =</span>' +
          '<input type="range" min="0" max="6.28" step="0.01" value="0" ' +
          'aria-label="t" style="flex:1"><span class="y tval">0.00</span></div>' : '') +
        '<div class="err" hidden></div>' +
      '</div>';

    var cv = host.querySelector('canvas');
    var input = host.querySelector('input:not([type=range])');
    var slider = host.querySelector('input[type=range]');
    var tval = host.querySelector('.tval');
    var err = host.querySelector('.err');
    var ctx = cv.getContext('2d');

    /* The store is capped at 2x so a 3x phone does not triple the bytes for a
       line drawing, and floored at 1x so it is never softer than the screen. */
    function scale() { return Math.max(1, Math.min(2, window.devicePixelRatio || 1)); }
    function allocate() {
      var s = scale();
      if (cv.width === Math.round(W * s)) return;
      cv.width = Math.round(W * s); cv.height = Math.round(H * s);
    }
    function release() { cv.width = 0; cv.height = 0; }

    function draw() {
      var fn;
      try { fn = parse(input.value, vars); }
      catch (e) { err.hidden = false; err.textContent = 'FAILED · ' + e.message; return; }
      err.hidden = true;

      var t = slider ? parseFloat(slider.value) : 0;
      if (tval) tval.textContent = t.toFixed(2);

      allocate();
      var w = cv.width, h = cv.height, pad = 12 * scale();
      if (!w || !h) return;                     // released: nothing to draw on
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);

      // grid: quarters of the declared domain and range
      var k = scale();                                  // stroke/type in store pixels
      ctx.strokeStyle = '#f0f0f1'; ctx.lineWidth = 1 * k;
      for (var i = 0; i <= 4; i++) {
        var gx = pad + (w - 2 * pad) * i / 4, gy = pad + (h - 2 * pad) * i / 4;
        ctx.beginPath(); ctx.moveTo(gx, pad); ctx.lineTo(gx, h - pad); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pad, gy); ctx.lineTo(w - pad, gy); ctx.stroke();
      }
      // the y = 0 and y = 1 rules, which are the ones that mean something
      ctx.strokeStyle = '#d0d0d4';
      [0, 1].forEach(function (v) {
        if (v < ran[0] || v > ran[1]) return;
        var y = h - pad - (h - 2 * pad) * (v - ran[0]) / (ran[1] - ran[0]);
        ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
      });

      // the curve
      ctx.strokeStyle = '#0b0b0c'; ctx.lineWidth = 1.5 * k; ctx.lineJoin = 'round';
      ctx.beginPath();
      var started = false, bad = false;
      for (var px = 0; px <= w - 2 * pad; px++) {
        var x = dom[0] + (dom[1] - dom[0]) * px / (w - 2 * pad);
        var y;
        try { y = fn({ x: x, t: t }); } catch (e) { bad = true; break; }
        if (!isFinite(y)) { started = false; continue; }
        var sy = h - pad - (h - 2 * pad) * (y - ran[0]) / (ran[1] - ran[0]);
        sy = Math.max(-1e4, Math.min(1e4, sy));
        if (!started) { ctx.moveTo(pad + px, sy); started = true; }
        else ctx.lineTo(pad + px, sy);
      }
      ctx.stroke();
      if (bad) { err.hidden = false; err.textContent = 'FAILED · could not evaluate'; }

      // the machine's labels, in mono, on the frame
      ctx.fillStyle = '#74747a';
      ctx.font = (10 * k) + 'px ui-monospace, "DejaVu Sans Mono", monospace';
      ctx.fillText(String(dom[0]), pad, h - 3 * k);
      ctx.textAlign = 'right';
      ctx.fillText(String(dom[1]), w - pad, h - 3 * k);
      ctx.fillText(String(ran[1]), pad - 2 * k, pad + 4 * k);
      ctx.fillText(String(ran[0]), pad - 2 * k, h - pad + 4 * k);
      ctx.textAlign = 'left';
    }

    input.addEventListener('input', draw);
    if (slider) slider.addEventListener('input', draw);

    /* Mount on approach, release on exit. Without IntersectionObserver every
       plot simply allocates and draws, which is the old behaviour. */
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (rows) {
        rows.forEach(function (r) { if (r.isIntersecting) draw(); else release(); });
      }, { rootMargin: '100% 0px' });
      io.observe(cv);
      // a plot already on screen at mount draws in the observer's first callback
    } else {
      draw();
    }
  }

  S.plot = { build: build, parse: parse };
})();
