/* lift-canvas · shared engine for plates whose figure is one canvas or one SVG on its source page.
   Appended to each plate's study.js by _build/plates.py after that plate's lc-figure.js (window.LC_FIG: source page,
   CSS path to the figure, its size, and which dials and inks were measured to act on it).
   The source page runs in a hidden frame on a clock this plate drives, so a moment is the same every time. Its canvas
   drawing calls pass through the dials: line weight (every stroke), mark size (dots and pixel marks), ink strength
   (every alpha), type size (every font). Its colors pass through the Color tab: each ink is a color the figure itself
   uses, measured by _build/qa/lift-probe.mjs (lc-head.js there is a copy of the HEAD function below; keep them in step), which also keeps only the dials that change this figure's pixels.
   An SVG figure is serialized with its computed styles; its strokes, type and colors take the same dials and inks.
   Nothing in the source file changes. */
(function (S) {
  'use strict';
  /* until the source page has loaded, the panel shows the figure as filed (its f01 still), not an empty frame */
  var READY = false;
  function placeholder(canvas, V) {
    var x = canvas.getContext('2d'), W = canvas.width, H = canvas.height, u = W / 1000, v = H / S.ref.h;
    x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = (V && V.paper) || '#FFFFFF'; x.fillRect(0, 0, W, H);
    (S.panels || []).forEach(function (p) {
      if (!p.src) return; var im = new Image();
      im.onload = function () { if (READY) return; var bx = p.x * u, by = p.y * v, bw = p.w * u, bh = p.h * v, k = Math.min(bw / im.width, bh / im.height); x.save(); x.globalAlpha = .9; x.drawImage(im, bx + (bw - im.width * k) / 2, by + (bh - im.height * k) / 2, im.width * k, im.height * k); x.restore(); };
      im.src = p.src;
    });
  }
  var FIG = window.LC_FIG || {}, ON = {}; (FIG.dials || []).forEach(function (k) { ON[k] = 1; });
  var leaf = function (value, lo, hi, step, label, unit, note) { var o = { value: value, range: [lo, hi], step: step, label: label, note: note }; if (unit) o.unit = unit; return o; };
  var ALL = {
    weight: leaf(1, 0.25, 3, 0.01, 'Line weight', '×', 'Weight of every line the figure draws, as a multiple of its own.'),
    mark: leaf(1, 0.3, 2.5, 0.01, 'Mark size', '×', 'Size of every dot and pixel mark the figure lays down (marks up to 6 px across).'),
    ink: leaf(1, 0.2, 2.5, 0.01, 'Ink strength', '×', 'Every transparency the figure uses, multiplied: below 1 thins the inks, above 1 builds them toward solid.'),
    type: leaf(1, 0.6, 1.8, 0.01, 'Type size', '×', 'Size of every label the figure sets.'),
    moment: leaf(FIG.t0 || 2, 0, 12, 0.1, 'Moment', 's', 'Where in its motion the figure is shown, in seconds from the start of its clock.')
  };
  var P0 = {}; Object.keys(ALL).forEach(function (k) { if (ON[k]) P0[k] = ALL[k]; });
  var read = (S.spec.techniques || [])[0] || {}, TID = read.id || 'lift';
  S.spec.techniques = [{ id: TID, short: (read.short || 'FIG'), name: read.name || 'Figure', layer: 1, pass: 1, atoms: read.atoms || [], params: P0,
    implementation: (read.implementation || '') + ' Drawn by the source page’s own code on a clock this plate drives; its strokes, marks, inks and type pass through the dials.' }]
    .concat((S.spec.techniques || []).filter(function (t) { return t.id !== TID; }));
  S.body = [S.body[0], 'The figure is drawn here by its source page’s own code. The dials act on what that code draws: every line, every dot, every transparency and every label, and the moment of its clock. Only dials measured to change this figure are shown. The Color tab lists the colors the figure itself uses.'];
  S.paramsHint = 'Dials on the page’s own drawing, kept only where they change this figure. Multiples are of the page’s own values.';
  S.liveOnLoad = false; delete S.live;

  /* inks: the figure's own colors, most used first. Source keeps them; One ink proofs every ink as a gray of the same lightness. */
  var INK = FIG.inks || [];
  function lum(h) { var c = [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16) / 255; }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
  function gray(h) { var v = Math.round(Math.pow(lum(h), 1 / 2.2) * 255).toString(16).padStart(2, '0'); return '#' + v + v + v; }
  function V(id, label, list) { var inks = {}; INK.forEach(function (h, i) { inks['ink' + (i + 1)] = list[i]; }); return { id: id, label: label, sw: list.slice(0, 5), spot: [20, 20, 20], paper: FIG.ground || '#FFFFFF', rule: '#D9D9DC', inks: inks, src: INK }; }
  S.variants = INK.length ? [V('source', 'Source', INK.slice()), V('one-ink', 'One ink', INK.map(gray))] : [{ id: 'source', label: 'Source', sw: [], spot: [20, 20, 20], paper: FIG.ground || '#FFFFFF', rule: '#D9D9DC' }];
  S.variantLabel = 'Palette';
  S.colorHint = 'Each ink is a color the figure itself uses, most used first. Click one to change it everywhere the figure uses it.';

  var HEAD = '<script>(' + function () {
    var W = window, q = [], n = 0, d0 = Date.now();
    W.__NOW = 0; W.__P = {}; W.__MAP = {}; W.__UC = new WeakMap(); W.__UO = { lw: 0, mark: 0, al: 0, font: 0, img: 0, col: {} };
    var UU = function (ctx) { var c = ctx && ctx.canvas; if (!c || !c.isConnected) return W.__UO; var o = W.__UC.get(c); if (!o) { o = { lw: 0, mark: 0, al: 0, font: 0, img: 0, col: {} }; W.__UC.set(c, o); } return o; };
    W.requestAnimationFrame = function (cb) { q.push([++n, cb]); return n; };
    W.cancelAnimationFrame = function (i) { q = q.filter(function (e) { return e[0] !== i; }); };
    performance.now = function () { return W.__NOW; }; Date.now = function () { return d0 + W.__NOW; };
    W.__step = function (dt) { W.__NOW += dt * 1000; var c = q; q = []; c.forEach(function (e) { try { e[1](W.__NOW); } catch (err) { console.error(err); } }); };
    W.__pending = function () { return q.length; };
    var mm = W.matchMedia; W.matchMedia = function (s) { if (/reduced-motion/.test(s)) return { matches: false, media: s, addListener: function () {}, removeListener: function () {}, addEventListener: function () {}, removeEventListener: function () {} }; return mm.call(W, s); };
    var C = CanvasRenderingContext2D.prototype, sc = document.createElement('canvas').getContext('2d'), FS = Object.getOwnPropertyDescriptor(C, 'fillStyle'), cache = new Map();
    function norm(v) { FS.set.call(sc, '#000'); FS.set.call(sc, v); return FS.get.call(sc); }
    function hex2(v) { return ('0' + (v | 0).toString(16)).slice(-2); }
    function mapc(v, ctx) {
      if (typeof v !== 'string') return v;
      var key = v + '|' + W.__MAPK, hit = cache.get(key); if (hit !== undefined) { if (hit[1]) { var u0 = UU(ctx); u0.col[hit[1]] = (u0.col[hit[1]] || 0) + 1; } return hit[0]; }
      var s = norm(v), m, hx, a = 1;
      if (s[0] === '#') hx = s; else if ((m = s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/))) { hx = '#' + hex2(m[1]) + hex2(m[2]) + hex2(m[3]); a = m[4] == null ? 1 : +m[4]; } else { cache.set(key, [v, '']); return v; }
      var to = W.__MAP[hx], out = v;
      if (to) { out = a >= 1 ? to : 'rgba(' + parseInt(to.substr(1, 2), 16) + ',' + parseInt(to.substr(3, 2), 16) + ',' + parseInt(to.substr(5, 2), 16) + ',' + a + ')'; }
      cache.set(key, [out, hx]); var u1 = UU(ctx); u1.col[hx] = (u1.col[hx] || 0) + 1; return out;
    }
    function wrap(name, setf, getf) { var d = Object.getOwnPropertyDescriptor(C, name); Object.defineProperty(C, name, { configurable: true, get: function () { var v = d.get.call(this); return getf ? getf(v) : v; }, set: function (v) { d.set.call(this, setf(v, this)); } }); }
    var P = function (k, dflt) { var v = W.__P[k]; return v == null ? dflt : v; };
    wrap('lineWidth', function (v, c) { UU(c).lw++; return v * P('weight', 1); }, function (v) { return v / P('weight', 1); });
    wrap('globalAlpha', function (v, c) { UU(c).al++; return Math.max(0, Math.min(1, v * P('ink', 1))); });
    wrap('font', function (v, c) { UU(c).font++; var f = P('type', 1); return f === 1 ? v : String(v).replace(/([\d.]+)px/, function (s, x) { return (+x * f) + 'px'; }); });
    ['fillStyle', 'strokeStyle', 'shadowColor'].forEach(function (k) { wrap(k, mapc); });
    var di = C.drawImage; C.drawImage = function () { UU(this).img++; return di.apply(this, arguments); };
    var G = CanvasGradient.prototype, acs = G.addColorStop; G.addColorStop = function (o, c) { return acs.call(this, o, mapc(c, null)); };
    var arc = C.arc; C.arc = function (x, y, r, a0, a1, cc) { if (r <= 3) { UU(this).mark++; r *= P('mark', 1); } return arc.call(this, x, y, r, a0, a1, cc); };
    var ell = C.ellipse; C.ellipse = function (x, y, rx, ry, ro, a0, a1, cc) { if (rx <= 3 && ry <= 3) { UU(this).mark++; var k = P('mark', 1); rx *= k; ry *= k; } return ell.call(this, x, y, rx, ry, ro, a0, a1, cc); };
    var fr = C.fillRect; C.fillRect = function (x, y, w, h) { if (w <= 6 && h <= 6 && w > 0 && h > 0) { UU(this).mark++; var k = P('mark', 1); x += w * (1 - k) / 2; y += h * (1 - k) / 2; w *= k; h *= k; } return fr.call(this, x, y, w, h); };
  }.toString() + ')();<\/script>';
  var cached = null, frame = null, gen = 0;
  function fetchSrc() { if (!cached) cached = fetch(FIG.src).then(function (r) { if (!r.ok) throw new Error('source ' + r.status); return r.text(); }); return cached; }
  function start(Q, MAP) {
    var my = ++gen;
    return fetchSrc().then(function (html) {
      html = html.replace(/<head[^>]*>/i, function (m) { return m + '<base href="' + new URL(FIG.src, location.href).href + '">' + HEAD; });
      return new Promise(function (res, rej) {
        if (frame) frame.remove();
        var f = frame = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; f.title = 'lift engine';
        f.style.cssText = 'position:fixed;left:0;top:0;width:1440px;height:1000px;opacity:0;pointer-events:none;z-index:-1';
        f.onload = function () {
          var w = f.contentWindow; w.__P = Q; w.__MAP = MAP; w.__MAPK = JSON.stringify(MAP);
          var tries = 0;
          (function wait() {
            if (my !== gen) return rej(new Error('superseded'));
            var el = w.document.querySelector(FIG.sel);
            if (el) {
              try { el.scrollIntoView({ block: 'center' }); } catch (e) {}
              var T = Q.moment != null ? Q.moment : (FIG.t0 || 2), steps = Math.round(T * 30) + 2, i = 0;
              (function run() { for (var j = 0; j < 30 && i < steps; j++, i++) w.__step(1 / 30); if (i < steps) setTimeout(run, 0); else res({ w: w, el: el }); })();
            } else if (++tries < 80) setTimeout(wait, 100); else rej(new Error('figure not found: ' + FIG.sel));
          })();
        };
        f.srcdoc = html; document.body.appendChild(f);
      });
    });
  }
  function svgImage(w, el) {
    var c = el.cloneNode(true), r = el.getBoundingClientRect(), Q = w.__P || {}, MAP = w.__MAP || {};
    c.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); c.setAttribute('width', r.width); c.setAttribute('height', r.height);
    if (!c.getAttribute('viewBox') && el.viewBox && el.viewBox.baseVal && el.viewBox.baseVal.width) { var vb = el.viewBox.baseVal; c.setAttribute('viewBox', [vb.x, vb.y, vb.width, vb.height].join(' ')); }
    var PROPS = ['display', 'visibility', 'opacity', 'fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'font-size', 'font-family', 'font-weight', 'font-style', 'letter-spacing', 'text-anchor', 'dominant-baseline', 'paint-order', 'mix-blend-mode', 'stop-color', 'stop-opacity'];
    var A = [el].concat([].slice.call(el.querySelectorAll('*'))), B = [c].concat([].slice.call(c.querySelectorAll('*')));
    function col(v) { var m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(v); if (!m) return v; var hx = '#' + [m[1], m[2], m[3]].map(function (x) { return ('0' + (+x | 0).toString(16)).slice(-2); }).join(''); var to = MAP[hx]; if (!to) return v; return m[4] != null ? 'rgba(' + [1, 3, 5].map(function (i) { return parseInt(to.substr(i, 2), 16); }).join(',') + ',' + m[4] + ')' : to; }
    A.forEach(function (n, i) {
      var cs = w.getComputedStyle(n), st = PROPS.map(function (k) {
        var v = cs.getPropertyValue(k); if (!v) return '';
        if (k === 'stroke-width') { var px = parseFloat(v); if (!isNaN(px)) v = (px * (Q.weight == null ? 1 : Q.weight)) + 'px'; }
        if (k === 'font-size') { var fz = parseFloat(v); if (!isNaN(fz)) v = (fz * (Q.type == null ? 1 : Q.type)) + 'px'; }
        if (k === 'fill-opacity' || k === 'stroke-opacity') v = String(Math.min(1, parseFloat(v) * (Q.ink == null ? 1 : Q.ink)));
        if (k === 'fill' || k === 'stroke' || k === 'stop-color') v = col(v);
        return k + ':' + v;
      }).filter(Boolean).join(';');
      B[i].setAttribute('style', st); B[i].removeAttribute('class');
    });
    var url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(c));
    return new Promise(function (res) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { res(null); }; im.src = url; });
  }
  var lastKey = '', live = null;
  S.render = function (canvas, cw, ch, dpr, Vt, done, overrides) {
    if (!READY) placeholder(canvas, Vt);
    var A = window.ART.params(S.spec, overrides || {}), Q = Object.assign({}, A[TID] || {}), MAP = {};
    var src = Vt.src || INK; INK.forEach(function (h, i) { var to = (Vt.inks || {})['ink' + (i + 1)]; if (to && to.toLowerCase() !== h) MAP[h] = to.toLowerCase(); });
    var key = JSON.stringify([Q, MAP]);
    var go = key === lastKey && live ? Promise.resolve(live) : start(Q, MAP).then(function (E) { lastKey = key; live = E; return E; });
    go.then(function (E) { READY = true;
      return (E.el.tagName.toLowerCase() === 'svg' ? svgImage(E.w, E.el) : Promise.resolve(E.el)).then(function (img) {
        var x = canvas.getContext('2d'), W = canvas.width, H = canvas.height, u = W / 1000, v = H / S.ref.h;
        x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = Vt.paper || '#FFFFFF'; x.fillRect(0, 0, W, H);
        /* the lifted part of the figure: crop is [x0, y0, x1, y1] of the element, as filed */
        var cr = FIG.crop || [0, 0, 1, 1], fw = FIG.w || (img && (img.width || img.naturalWidth)) || 1, fh = FIG.h || (img && (img.height || img.naturalHeight)) || 1, iw = fw * (cr[2] - cr[0]), ih = fh * (cr[3] - cr[1]);
        var nw = img ? (img.naturalWidth || img.width) : 1, nh = img ? (img.naturalHeight || img.height) : 1;
        S.panels.forEach(function (p) {
          var bx = p.x * u, by = p.y * v, bw = p.w * u, bh = p.h * v, k = Math.min(bw / iw, bh / ih), ox = bx + (bw - iw * k) / 2, oy = by + (bh - ih * k) / 2;
          x.save(); x.beginPath(); x.rect(bx, by, bw, bh); x.clip(); x.fillStyle = FIG.ground || Vt.paper || '#FFFFFF'; x.fillRect(bx, by, bw, bh);
          x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; if (img) try { x.drawImage(img, cr[0] * nw, cr[1] * nh, (cr[2] - cr[0]) * nw, (cr[3] - cr[1]) * nh, ox, oy, iw * k, ih * k); } catch (e) { console.error('[lift-canvas]', e); }
          x.restore(); x.strokeStyle = Vt.rule; x.lineWidth = Math.max(1, u * .8); x.strokeRect(Math.round(bx) + .5, Math.round(by) + .5, Math.round(bw) - 1, Math.round(bh) - 1);
        });
        if (done) done();
      });
    }).catch(function (err) { if (err && err.message !== 'superseded') console.error('[lift-canvas]', err); if (done) done(); });
    return false;
  };
})(window.STUDY);
