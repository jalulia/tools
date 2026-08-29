/* ============================================================================
   adapters/canvas2d.js — the Canvas2D stage.

   The contract is Ki Landscapes' (ki-landscapes/index.html:595-641), kept
   exactly as it is because it is good and because keeping it means Ki
   Landscapes joins this shell as a third `course` tool with a manifest and no
   new UX:

       new Function('ctx', 'W', 'H', 'p', 'lib', code)

   ctx  a 2D context sized to the stage at a capped DPR
   W H  the drawing-buffer size in device pixels
   p    the declared parameters, by name — this is what makes params[] real
   lib  the shared library below

   The lane is per entry and per example, not per tool: the strongest
   order-dependence example in the corpus is Canvas2D and the strongest
   coupling example is GLSL, and they belong in the same chapter.

   `lib` here is the general half of Ki Landscapes' LIB, vendored (no CDN, no
   import). A tool that needs more — the biome palettes, say — adds them with
   Shell.adapters.canvas2d.extendLib({...}) from its own script.
   ============================================================================ */
(function () {
  'use strict';
  var S = window.Shell;

  /* --------------------------------------------------------------- lib */
  var LIB = (function () {
    var lerp = function (a, b, t) { return a + (b - a) * t; };
    var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
    function smooth(a, b, x) {
      if (a === b) return x < a ? 0 : 1;
      var t = clamp((x - a) / (b - a), 0, 1);
      return t * t * (3 - 2 * t);
    }
    function mulberry32(a) {
      return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
    function makeNoise(seed, nodes) {
      var r = mulberry32(seed), a = new Array(nodes);
      for (var i = 0; i < nodes; i++) a[i] = r() * 2 - 1;
      return function (x) {
        var i2 = Math.floor(x), f = x - i2;
        var a0 = a[((i2 % nodes) + nodes) % nodes], a1 = a[(((i2 + 1) % nodes) + nodes) % nodes];
        var u = f * f * f * (f * (f * 6 - 15) + 10);
        return a0 + (a1 - a0) * u;
      };
    }
    function fbm1D(seed, nodes, octaves, persist) {
      var octs = [], n = nodes, amp = 1, sum = 0;
      for (var o = 0; o < octaves; o++) {
        octs.push({ fn: makeNoise(seed + o * 317, n), n: n, amp: amp });
        sum += amp; n = Math.min(256, n * 2); amp *= persist;
      }
      return function (u) {
        var v = 0;
        for (var i = 0; i < octs.length; i++) v += octs[i].fn(u * octs[i].n) * octs[i].amp;
        return v / sum;
      };
    }
    var _grain = null;
    function grainTile() {
      if (_grain) return _grain;
      var size = 256;
      function nl(cells, seed) {
        var r = mulberry32(seed), g = new Float32Array(cells * cells);
        for (var i = 0; i < g.length; i++) g[i] = r();
        return function (x, y) {
          var fx = x / size * cells, fy = y / size * cells;
          var xi = Math.floor(fx), yi = Math.floor(fy);
          var x0 = ((xi % cells) + cells) % cells, y0 = ((yi % cells) + cells) % cells;
          var x1 = (x0 + 1) % cells, y1 = (y0 + 1) % cells;
          var tx = fx - xi, ty = fy - yi;
          tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
          var a = g[y0 * cells + x0], b = g[y0 * cells + x1],
              c = g[y1 * cells + x0], d = g[y1 * cells + x1];
          return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
        };
      }
      var fns = [{ f: nl(80, 7), amp: 1 }, { f: nl(160, 21), amp: 0.55 }];
      var c = document.createElement('canvas'); c.width = c.height = size;
      var cx = c.getContext('2d'), id = cx.createImageData(size, size);
      for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
        var v = 0, s = 0;
        for (var i = 0; i < fns.length; i++) { v += fns[i].f(x, y) * fns[i].amp; s += fns[i].amp; }
        v /= s;
        var g2 = clamp(128 + (v - 0.5) * 90, 0, 255), o = (y * size + x) * 4;
        id.data[o] = id.data[o + 1] = id.data[o + 2] = g2; id.data[o + 3] = 255;
      }
      cx.putImageData(id, 0, 0); _grain = c; return c;
    }
    return { lerp: lerp, clamp: clamp, smooth: smooth, mulberry32: mulberry32,
             makeNoise: makeNoise, fbm1D: fbm1D, grainTile: grainTile };
  })();

  /* ------------------------------------------------------------- adapter */
  var cv = null, ctx = null, host = null, bar = null;
  var entry = null, example = null, buffer = '', P = {};
  var pending = false, raf = null, compileTimer = null;
  var status = 'rendered', log = '';

  function sizeCanvas() {
    if (!cv) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (w > 0 && h > 0 && (cv.width !== w || cv.height !== h)) { cv.width = w; cv.height = h; }
  }

  function run() {
    if (!ctx) return;
    sizeCanvas();
    var W = cv.width, H = cv.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    try {
      /* The one place this file evaluates authored code. It is the tool's
         entire premise — type and it redraws — and the code is the repo's own,
         loaded from the repo, exactly like every entry.js. */
      var fn = new Function('ctx', 'W', 'H', 'p', 'lib', buffer);
      fn(ctx, W, H, P, LIB);
      setStatus('rendered', 'No errors · ' + buffer.split('\n').length + ' lines');
    } catch (e) {
      setStatus('error', String((e && e.message) || e));
    }
    readout(W, H);
  }

  function schedule() {
    if (pending) return;
    pending = true;
    raf = requestAnimationFrame(function () { pending = false; raf = null; run(); });
  }

  function setStatus(kind, message) {
    status = kind; log = message;
    var r = document.getElementById('compile');
    if (r) {
      r.textContent = kind === 'error' ? 'FAILED' : 'RENDERED';
      if (kind === 'error') r.parentNode.setAttribute('data-state', 'error');
      else r.parentNode.removeAttribute('data-state');
    }
    var con = document.getElementById('con');
    if (con) {
      if (kind === 'error') { con.setAttribute('data-state', 'error'); con.textContent = 'FAILED · ' + message; }
      else { con.removeAttribute('data-state'); con.textContent = message; }
    }
  }

  function readout(W, H) {
    var cell = document.getElementById('c2read');
    if (!cell) return;
    cell.innerHTML = '<span><span class="k">res</span> ' + W + ' × ' + H + '</span>' +
      Object.keys(P).map(function (k) {
        return '<span class="opt"><span class="k">' + S.esc(k) + '</span> ' + fmt(P[k]) + '</span>';
      }).join('');
  }
  function fmt(v) { return (typeof v === 'number' && v % 1) ? v.toFixed(2) : String(v); }

  function sourceOf(e, ex) {
    if (ex && ex.code) return ex.code;
    if (e.code) return e.code;
    return "ctx.fillStyle='#e7e3d9'; ctx.fillRect(0,0,W,H);\n";
  }

  /* ------------------------------------------------------------- editor */
  var JS_KEY = ['const','let','var','function','return','if','else','for','while','do','of','in',
                'new','break','continue','true','false','null','undefined','typeof'];

  function highlight(src) {
    var re = /(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\b\d+\.?\d*\b|\.\d+)|([A-Za-z_$][\w$]*)/g;
    return src.replace(/[&<>]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]; })
      .replace(re, function (m, bc, lc, str, num, word) {
        if (bc !== undefined || lc !== undefined) return '<span class="cm">' + m + '</span>';
        if (str !== undefined) return '<span class="str">' + str + '</span>';
        if (num !== undefined) return '<span class="num">' + num + '</span>';
        if (word !== undefined) return JS_KEY.indexOf(word) >= 0 ? '<span class="kw">' + word + '</span>' : word;
        return m;
      });
  }

  function paintGutter() {
    var ed = document.getElementById('ed');
    if (!ed) return;
    ed.innerHTML = buffer.split('\n').map(function (l, i) {
      return '<div class="ln"><b>' + (i + 1) + '</b><code>' + (highlight(l) || '&nbsp;') + '</code></div>';
    }).join('');
  }

  function buildEditor() {
    var body = document.getElementById('app-body');
    if (!body) return;
    body.innerHTML = '<div class="edwrap"><div class="ed" id="ed" aria-hidden="true"></div>' +
      '<textarea id="ta" spellcheck="false" aria-label="Canvas source"></textarea></div>';
    var ta = document.getElementById('ta');
    ta.value = buffer;
    paintGutter();
    ta.addEventListener('input', function () {
      buffer = ta.value; paintGutter();
      clearTimeout(compileTimer);
      compileTimer = setTimeout(function () { run(); S.markEdited(true); }, 200);
    });
    ta.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Tab') return;
      ev.preventDefault();
      var a = ta.selectionStart, b = ta.selectionEnd;
      ta.value = ta.value.slice(0, a) + '  ' + ta.value.slice(b);
      ta.selectionStart = ta.selectionEnd = a + 2;
      buffer = ta.value; paintGutter();
      clearTimeout(compileTimer);
      compileTimer = setTimeout(run, 200);
    });
    var file = document.getElementById('app-file');
    if (file) {
      file.textContent = (entry.path || ('content/' + entry.id + '/')) +
        ((example && example.file) || 'main.js');
    }
    var foot = document.getElementById('app-foot');
    if (foot) {
      foot.innerHTML = '<button type="button" class="ctl" id="ed-reset">Reset</button>' +
                       '<button type="button" class="ctl" id="ed-copy">Copy link</button>';
      document.getElementById('ed-reset').addEventListener('click', function () {
        buffer = sourceOf(entry, example);
        document.getElementById('ta').value = buffer;
        paintGutter(); run(); S.markEdited(false);
      });
      document.getElementById('ed-copy').addEventListener('click', function (ev) {
        var link = S.shareLink(buffer);
        if (navigator.clipboard) navigator.clipboard.writeText(link);
        ev.target.textContent = 'Copied';
        setTimeout(function () { ev.target.textContent = 'Copy link'; }, 1400);
      });
    }
    setStatus(status, log);
  }

  var adapter = {
    mount: function (o) {
      adapter.unmount();
      host = o.stage; bar = o.bar; entry = o.entry; example = o.example;
      P = {};
      ((o.entry.params) || []).concat((o.example && o.example.params) || [])
        .forEach(function (p) {
          // prefer the value the panel is at over the declared default, so
          // moving a slider and then switching example does not reset it
          P[p.name] = (o.params && o.params[p.name] !== undefined)
            ? o.params[p.name] : p.value;
        });
      var shared = S.readSharedSource(o.query);
      buffer = shared || sourceOf(o.entry, o.example);

      cv = document.createElement('canvas');
      o.stage.innerHTML = '';
      o.stage.appendChild(cv);
      ctx = cv.getContext('2d');
      if (!ctx) {
        o.stage.innerHTML = '<p class="glnote">NO 2D CONTEXT ON THIS MACHINE</p>';
        return;
      }
      if (bar) {
        bar.innerHTML = '<span class="rd" id="c2read"></span>' +
          (shared ? '<span class="opt"><span class="k">source</span> shared edit</span>' : '') +
          '<span class="r"><span id="compile">RENDERED</span></span>';
      }
      run();                       // a print paints once and stops
      window.addEventListener('resize', schedule);
    },

    unmount: function () {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      pending = false;
      clearTimeout(compileTimer);
      window.removeEventListener('resize', schedule);
      if (cv && cv.parentNode) cv.parentNode.removeChild(cv);
      cv = null; ctx = null; host = null;
    },

    fillSource: buildEditor,
    setParam: function (name, value) { P[name] = value; schedule(); },
    toggleRun: function () { run(); },
    onApparatusOpen: function () { if (S.views) S.views.fillPane(); },
    extendLib: function (extra) { for (var k in extra) LIB[k] = extra[k]; },
    lib: LIB
  };

  S.registerAdapter('canvas2d', adapter);
})();
