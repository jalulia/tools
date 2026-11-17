/* page-controls · engine for plates whose figure is driven by its own page's controls (buttons, sliders, keys).
   Appended to a plate's study.js by _build/plates.py after that plate's pc-figure.js (window.PC_FIG: source page,
   CSS path to the figure's canvas, the filed crop, and the page controls that become this plate's dials).
   The page runs in a hidden frame. Each dial sets the page's own control the way a reader would: a choice clicks
   its button, a range sets its slider and fires input, a step presses its key on the figure. The figure is then
   copied into the plate. Its inks are the colors its canvas calls use, mapped on the Color tab. Nothing in the
   source file changes. */
(function (S) {
  'use strict';
  var FIG = window.PC_FIG || {};
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
  var leaf = function (c) { var o = { value: c.value, range: c.range, step: c.step || 1, label: c.label, note: c.note }; if (c.unit) o.unit = c.unit; return o; };
  var params = {}; (FIG.ctl || []).forEach(function (c) { params[c.key] = leaf(c); });
  var read = (S.spec.techniques || [])[0] || {}, TID = read.id || 'figure';
  S.spec.techniques = [{ id: TID, short: read.short || 'FIG', name: FIG.techName || read.name || 'Figure', layer: 1, pass: 1, atoms: read.atoms || [], params: params,
    implementation: (read.implementation || '') + ' Drawn by the source page’s own code; each dial sets one of the page’s own controls.' }]
    .concat((S.spec.techniques || []).filter(function (t) { return t.id !== TID; }));
  S.body = [S.body[0], FIG.body || 'The figure is drawn here by its source page’s own code. Each dial is one of that page’s own controls, set the way a reader would set it.'];
  S.paramsHint = 'Each dial is one of the source page’s own controls.';
  S.liveOnLoad = false; delete S.live;

  var INK = FIG.inks || [];
  function V(id, label, list) { var inks = {}; INK.forEach(function (h, i) { inks['ink' + (i + 1)] = list[i]; }); return { id: id, label: label, sw: [FIG.ground || '#FFFFFF'].concat(list.slice(0, 4)), spot: [20, 20, 20], paper: FIG.ground || '#FFFFFF', rule: '#D9D9DC', inks: inks }; }
  S.variants = [V('source', 'Source', INK.slice())].concat((FIG.palettes || []).map(function (p) { return V(p[0], p[1], p[2]); }));
  S.variantLabel = 'Palette';
  S.colorHint = FIG.colorHint || 'Each ink is a color the figure’s own drawing calls use. Click one to change it everywhere the figure uses it.';

  /* colors only: the page keeps its own clock */
  var HEAD = '<script>(' + function () {
    ['replaceState', 'pushState'].forEach(function (k) { var o = history[k]; history[k] = function () { try { return o.apply(history, arguments); } catch (e) {} }; });
    var W = window; W.__MAP = {};
    var C = CanvasRenderingContext2D.prototype, sc = document.createElement('canvas').getContext('2d'), FS = Object.getOwnPropertyDescriptor(C, 'fillStyle'), cache = new Map();
    function norm(v) { FS.set.call(sc, '#000'); FS.set.call(sc, v); return FS.get.call(sc); }
    function hex2(v) { return ('0' + (v | 0).toString(16)).slice(-2); }
    function mapc(v) {
      if (typeof v !== 'string') return v; var key = v + '|' + W.__MAPK, hit = cache.get(key); if (hit !== undefined) return hit;
      var s = norm(v), m, hx, a = 1;
      if (s[0] === '#') hx = s; else if ((m = s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/))) { hx = '#' + hex2(m[1]) + hex2(m[2]) + hex2(m[3]); a = m[4] == null ? 1 : +m[4]; } else { cache.set(key, v); return v; }
      var to = W.__MAP[hx], out = v; if (to) out = a >= 1 ? to : 'rgba(' + parseInt(to.substr(1, 2), 16) + ',' + parseInt(to.substr(3, 2), 16) + ',' + parseInt(to.substr(5, 2), 16) + ',' + a + ')';
      cache.set(key, out); return out;
    }
    ['fillStyle', 'strokeStyle'].forEach(function (k) { var d = Object.getOwnPropertyDescriptor(C, k); Object.defineProperty(C, k, { configurable: true, get: function () { return d.get.call(this); }, set: function (v) { d.set.call(this, mapc(v)); } }); });
    var G = CanvasGradient.prototype, acs = G.addColorStop; G.addColorStop = function (o, c) { return acs.call(this, o, mapc(c)); };
  }.toString() + ')();<\/script>';
  var boot = null, frame = null;
  function load() {
    if (boot) return boot;
    boot = fetch(FIG.src).then(function (r) { if (!r.ok) throw new Error('source ' + r.status); return r.text(); }).then(function (html) {
      html = html.replace(/<head[^>]*>/i, function (m) { return m + '<base href="' + new URL(FIG.src, location.href).href + '">' + HEAD; });
      return new Promise(function (res, rej) {
        var f = frame = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; f.title = 'page-controls engine';
        f.style.cssText = 'position:fixed;left:0;top:0;width:' + (FIG.vw || 1440) + 'px;height:1000px;opacity:0;pointer-events:none;z-index:-1';
        f.onload = function () {
          var w = f.contentWindow, d = w.document, tries = 0, sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
          var shown = function (el) { var r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return false; for (var n = el; n && n.nodeType === 1; n = n.parentElement) { var cs = w.getComputedStyle(n); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < .05) return false; } return true; };
          /* open the figure the way the live lift does: its tab, then its slide */
          var open = (FIG.tab ? sleep(400).then(function () { var b = [].slice.call(d.querySelectorAll('button,a,[role=tab]')).find(function (e) { var t = e.textContent.trim(); return t.replace(/^\d+/, '').indexOf(FIG.tab) === 0 && t.length < 60; }); if (b) b.click(); return sleep(1200); }) : Promise.resolve());
          open.then(function () {
            (function wait() {
              var el = d.querySelector(FIG.sel), ok = el && (el.tagName.toLowerCase() === 'svg' || el.width);
              if (!ok) { if (++tries < 120) return setTimeout(wait, 100); return rej(new Error('figure not found: ' + FIG.sel)); }
              var go = Promise.resolve();
              if (FIG.slide >= 0 && !shown(el)) go = (FIG.sid ? (w.location.hash = '#' + FIG.sid, sleep(500)) : Promise.resolve()).then(function step(k) { k = k || 0; if (shown(el) || k > 40) return; d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, which: 39, bubbles: true })); return sleep(260).then(function () { return step(k + 1); }); });
              go.then(function () { try { el.scrollIntoView({ block: 'center' }); } catch (e) {} setTimeout(function () { res({ w: w, el: el, state: {} }); }, FIG.settle || 600); });
            })();
          });
        };
        f.srcdoc = html; document.body.appendChild(f);
      });
    });
    return boot;
  }
  function frames(w, n) { return new Promise(function (res) { (function go(k) { if (k <= 0) return setTimeout(res, 60); w.requestAnimationFrame(function () { go(k - 1); }); })(n || 3); }); }
  function setControls(E, Q) {
    var w = E.w, d = w.document;
    (FIG.ctl || []).forEach(function (c) {
      var v = Q[c.key] == null ? c.value : Q[c.key];
      if (c.kind === 'choice') { var b = d.querySelectorAll(c.sel)[Math.round(v) - 1]; if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); }
      else if (c.kind === 'range') { var i = d.querySelector(c.sel); if (!i) return; var set = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set; var raw = v + (c.offset || 0); if (String(i.value) !== String(raw)) { set.call(i, raw); i.dispatchEvent(new w.Event('input', { bubbles: true })); i.dispatchEvent(new w.Event('change', { bubbles: true })); } }
      else if (c.kind === 'check') { var cb = d.querySelector(c.sel); if (cb && cb.checked !== (v >= .5)) cb.click(); }
      else if (c.kind === 'toggle') { var tb = d.querySelector(c.sel); if (tb) { var on = tb.getAttribute('aria-pressed') === 'true' || tb.classList.contains(c.onClass || 'on'); if (E.state[c.key] != null) on = E.state[c.key]; if (on !== (v >= .5)) { tb.click(); } E.state[c.key] = v >= .5; } }
      else if (c.kind === 'select') { var se = d.querySelector(c.sel); if (se && se.selectedIndex !== Math.round(v) - 1) { se.selectedIndex = Math.round(v) - 1; se.dispatchEvent(new w.Event('input', { bubbles: true })); se.dispatchEvent(new w.Event('change', { bubbles: true })); } }
      else if (c.kind === 'key') { var t = d.querySelector(c.sel) || E.el, have = t.dataset && t.dataset.picked != null ? Number(t.dataset.picked) + c.range[0] : (E.state[c.key] == null ? c.value : E.state[c.key]), n = c.range[1] - c.range[0] + 1, steps = ((Math.round(v) - have) % n + n) % n;
        for (var s = 0; s < steps; s++) t.dispatchEvent(new w.KeyboardEvent('keydown', { key: c.keyName || 'ArrowRight', bubbles: true, cancelable: true }));
        E.state[c.key] = Math.round(v); }
    });
  }
  function svgImage(w, el) {
    var c = el.cloneNode(true), r = el.getBoundingClientRect(), MAP = w.__MAP || {}, sc = 2;
    c.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); c.setAttribute('width', r.width * sc); c.setAttribute('height', r.height * sc);
    if (!c.getAttribute('viewBox')) c.setAttribute('viewBox', '0 0 ' + r.width + ' ' + r.height);
    var PROPS = ['display', 'visibility', 'opacity', 'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-opacity', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'font-size', 'font-family', 'font-weight', 'font-style', 'letter-spacing', 'text-anchor', 'dominant-baseline', 'paint-order', 'mix-blend-mode', 'stop-color', 'stop-opacity', 'transform', 'transform-origin', 'filter'];
    var A = [el].concat([].slice.call(el.querySelectorAll('*'))), B = [c].concat([].slice.call(c.querySelectorAll('*')));
    function col(v) { var m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(v); if (!m) return v; var hx = '#' + [m[1], m[2], m[3]].map(function (x) { return ('0' + (+x | 0).toString(16)).slice(-2); }).join(''); var to = MAP[hx]; if (!to) return v; return m[4] != null ? 'rgba(' + [1, 3, 5].map(function (i) { return parseInt(to.substr(i, 2), 16); }).join(',') + ',' + m[4] + ')' : to; }
    A.forEach(function (n, i) { var cs = w.getComputedStyle(n), st = PROPS.map(function (k) { var v = cs.getPropertyValue(k); if (!v || (k === 'transform' && v === 'none') || (k === 'filter' && v === 'none')) return ''; if (k === 'fill' || k === 'stroke' || k === 'stop-color') v = col(v); return k + ':' + v; }).filter(Boolean).join(';'); B[i].setAttribute('style', st); B[i].removeAttribute('class'); });
    var url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(c));
    return new Promise(function (res) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { res(null); }; im.src = url; });
  }
  /* text laid over the figure on its page (titles, labels on a card) is part of the figure: it is read from the page,
     line by line with its computed style, and set over the copied canvas. The page's own @font-face rules are carried
     into this page under a prefix, so the type is the page's type. */
  var FONTS = null, FAMS = {};
  function fontsFrom(w) {
    if (FONTS) return FONTS; var css = '';
    [].forEach.call(w.document.styleSheets, function (sh) {
      var rules; try { rules = sh.cssRules; } catch (e) { return; } var bh = sh.href || new URL(FIG.src, location.href).href;
      [].forEach.call(rules || [], function (r) {
        if (r.type !== 5) return; var fam = (r.style.getPropertyValue('font-family') || '').replace(/["']/g, '').trim(); if (!fam) return; FAMS[fam.toLowerCase()] = 'pc-' + fam;
        css += r.cssText.replace(/font-family:\s*([^;]+);/, 'font-family: "pc-' + fam + '";').replace(/url\((['"]?)([^'")]+)\1\)/g, function (m, q, u) { return /^data:/.test(u) ? m : 'url("' + new URL(u, bh).href + '")'; }) + '\n';
      });
    });
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    FONTS = (document.fonts && document.fonts.ready) || Promise.resolve(); return FONTS;
  }
  function famMap(list) { return list.split(',').map(function (f) { var k = f.replace(/["']/g, '').trim(); return FAMS[k.toLowerCase()] ? '"' + FAMS[k.toLowerCase()] + '"' : f.trim(); }).join(', '); }
  function textOps(w, el) {
    var d = w.document, R = el.getBoundingClientRect(), ops = [], tw = d.createTreeWalker(d.body, 4), n, rng = d.createRange();
    while ((n = tw.nextNode())) {
      var t = n.nodeValue, pe = n.parentElement; if (!t || !t.trim() || !pe || el.contains(pe) || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION|TITLE|SELECT)$/.test(pe.tagName)) continue;
      var dt = pe.closest('details'); if (dt && !dt.open && !pe.closest('summary')) continue;
      rng.selectNodeContents(n); var br = rng.getBoundingClientRect(); if (!br.width || br.right < R.left || br.left > R.right || br.bottom < R.top || br.top > R.bottom) continue;
      var cs = w.getComputedStyle(pe), op = 1, hid = false; for (var q = pe; q && q.nodeType === 1; q = q.parentElement) { var qs = w.getComputedStyle(q); op *= +qs.opacity; if (qs.visibility === 'hidden') hid = true; } if (hid || op < .05) continue;
      var lines = [], cur = null;
      for (var i = 0; i < t.length; i++) { if (!cur && /\s/.test(t[i])) continue; rng.setStart(n, i); rng.setEnd(n, i + 1); var cr = rng.getClientRects()[0]; if (!cr) continue;
        if (!cur || Math.abs(cr.top - cur.top) > cr.height * .5) { if (/\s/.test(t[i])) { cur = null; continue; } cur = { top: cr.top, bottom: cr.bottom, left: cr.left, s: '' }; lines.push(cur); } cur.s += t[i]; }
      lines.forEach(function (L) { var str = L.s.replace(/\s+/g, ' ').trim(); if (!str) return; if (cs.textTransform === 'uppercase') str = str.toUpperCase();
        ops.push({ s: str, x: L.left - R.left, y: (L.top + L.bottom) / 2 - R.top, font: cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + famMap(cs.fontFamily), color: cs.color, ls: cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing, a: op }); });
    }
    return ops;
  }
  var queue = Promise.resolve();
  S.render = function (canvas, cw, ch, dpr, Vt, done, overrides) {
    if (!READY) placeholder(canvas, Vt);
    var A = window.ART.params(S.spec, overrides || {}), Q = A[TID] || {}, MAP = {};
    INK.forEach(function (h, i) { var to = (Vt.inks || {})['ink' + (i + 1)]; if (to && to.toLowerCase() !== h) MAP[h] = to.toLowerCase(); });
    queue = queue.then(function () { return load(); }).then(function (E) {
      E.w.__MAP = MAP; E.w.__MAPK = JSON.stringify(MAP);
      /* a new ink map needs a fresh draw: the page redraws on resize */
      if (E.mapk !== E.w.__MAPK) { E.mapk = E.w.__MAPK; E.w.dispatchEvent(new E.w.Event('resize')); try { var st = E.el.style.width; E.el.style.width = (E.el.getBoundingClientRect().width - 1) + 'px'; E.el.getBoundingClientRect(); E.el.style.width = st; } catch (e) {} }
      setControls(E, Q); return frames(E.w, 4).then(function () { return E.el.tagName.toLowerCase() === 'svg' ? svgImage(E.w, E.el).then(function (im) { E.svgimg = im; return E; }) : E; })
        .then(function (E) { if (!FIG.overlay) return E; return fontsFrom(E.w).then(function () { E.ops = textOps(E.w, E.el); var fs = E.ops.map(function (o) { return o.font; }); return Promise.all(fs.filter(function (f, i) { return fs.indexOf(f) === i; }).map(function (f) { return document.fonts.load(f).catch(function () {}); })).then(function () { return E; }); }); });
    }).then(function (E) {
      READY = true; var el = E.el, x = canvas.getContext('2d'), W = canvas.width, H = canvas.height, u = W / 1000, v = H / S.ref.h, cr = FIG.crop || [0, 0, 1, 1];
      x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = Vt.paper || '#FFFFFF'; x.fillRect(0, 0, W, H);
      if (el.tagName.toLowerCase() === 'svg') { var img = E.svgimg; el = img; if (!img) { if (done) done(); return; } }
      var nw = el.naturalWidth || el.width, nh = el.naturalHeight || el.height, sw = (cr[2] - cr[0]) * nw, sh = (cr[3] - cr[1]) * nh;
      S.panels.forEach(function (p) {
        var bx = p.x * u, by = p.y * v, bw = p.w * u, bh = p.h * v, k = Math.min(bw / sw, bh / sh), ox = bx + (bw - sw * k) / 2, oy = by + (bh - sh * k) / 2;
        x.save(); x.beginPath(); x.rect(bx, by, bw, bh); x.clip(); x.fillStyle = FIG.ground || Vt.paper || '#FFFFFF'; x.fillRect(bx, by, bw, bh);
        x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; try { x.drawImage(el, cr[0] * nw, cr[1] * nh, sw, sh, ox, oy, sw * k, sh * k); } catch (e) { console.error('[page-controls]', e); }
        if (E.ops && E.ops.length) { var rr = E.el.getBoundingClientRect(), cssW = rr.width, cssH = rr.height, ks = (sw * k) / (cssW * (cr[2] - cr[0]));
          x.save(); x.translate(ox - cr[0] * cssW * ks, oy - cr[1] * cssH * ks); x.scale(ks, ks); x.textBaseline = 'middle'; x.textAlign = 'left';
          E.ops.forEach(function (o) { x.font = o.font; x.fillStyle = o.color; x.globalAlpha = o.a; if ('letterSpacing' in x) x.letterSpacing = o.ls; x.fillText(o.s, o.x, o.y); });
          x.restore(); }
        x.restore(); x.strokeStyle = Vt.rule; x.lineWidth = Math.max(1, u * .8); x.strokeRect(Math.round(bx) + .5, Math.round(by) + .5, Math.round(bw) - 1, Math.round(bh) - 1);
      });
      if (done) done();
    }).catch(function (err) { console.error('[page-controls]', err); if (done) done(); });
    return false;
  };
})(window.STUDY);
