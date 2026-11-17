/* dot-record · shared engine for the "dot record" plates drawn by Mindgut's A04 directions page (PL-04…10).
   Appended to each plate's study.js by _build/plates.py after that plate's dr-figure.js (window.DR_FIG: the source page
   and the selector of the figure). The page's own code draws the figure: it is loaded once into a hidden frame with its
   canvas helper and its stipple helpers given a dial object (window.__P), and the figure's own draw function then paints
   straight into this plate. At the default dials the plate is the source figure, mark for mark. Nothing in the source changes. */
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
  var FIG = window.DR_FIG || {};
  var leaf = function (value, lo, hi, step, label, unit, note) { var o = { value: value, range: [lo, hi], step: step, label: label, note: note }; if (unit) o.unit = unit; return o; };
  var read = (S.spec.techniques || [])[0] || {};
  var TECH = [
    { id: 'dot-record', short: 'DOT', name: 'Dot record', layer: 1, pass: 1, atoms: ['stipple', 'count'],
      params: (function () {
        var P = {
          dot: leaf(1, 0.4, 2.5, 0.01, 'Dot size', '×', 'Radius of every dot, as a multiple of the page\u2019s own.'),
          density: leaf(1, 0.25, 3, 0.01, 'Density', '×', 'Dots per cluster: more dots carry the same count at a finer grain; fewer leave it sparse.'),
          spread: leaf(1, 0.4, 2, 0.01, 'Spread', '×', 'How wide each cluster of dots is laid around its point.'),
          scatter: leaf(0, 0, 2.5, 0.01, 'Scatter', '×', 'How far each dot is knocked off its well-spaced place, in dot radii. 0 is the page\u2019s even stipple.')
        };
        if (FIG.wave) {
          P.upto = leaf(336, 42, 420, 2, 'Crossings', '', 'How many crossings of the record are drawn. 42 make one turn.');
          P.chords = leaf(1, 0, 1, 1, 'Recall chords', '', '1 draws the lines from the newest crossing to the ones it recalls; 0 leaves the dots alone.');
        }
        P.seed = leaf(0, 0, 99, 1, 'Seed', '', 'Re-rolls the scatter' + (FIG.record ? ', and shifts the seed of the simulated record: 0 is the page\u2019s own.' : '.'));
        return P;
      })(),
      implementation: (read.implementation || 'A record drawn as dots: each crossing is a cluster whose count is its length.') + ' Drawn by the source page’s own code, with its helpers given dials.' }
  ];
  S.spec.techniques = TECH.concat((S.spec.techniques || []).filter(function (t) { return t.id !== 'dot-record'; }));
  S.spec.pass_order = ['ground · plate', 'record · the page’s own simulation, seeded', 'stipple · clusters of whole dots, binned by ink', 'pen · axis, handoff ticks, recall chords, labels'];
  S.body = [S.body[0], 'The figure is drawn here by its source page’s own code, with dials on its stipple: dot size, density, spread, how many crossings are shown, the recall chords and the record’s seed. At the default dials it is the source figure.'];
  S.paramsHint = 'Dials on the page’s own stipple. Multiples are of the page’s numbers.';
  S.liveOnLoad = false; delete S.live;

  /* the figure's own inks, editable on the Color tab: they replace the page's INK object before every draw */
  var PAL = function (id, label, k) { return { id: id, label: label, sw: [k.stock, k.you, k.model, k.night, k.ember], spot: [20, 20, 20], paper: k.stock, rule: k.rule, inks: k }; };
  S.variants = [
    PAL('mindgut', 'Mindgut A', { stock: '#f8f8f6', you: '#1b3bd4', model: '#93a8ea', night: '#0e1122', ember: '#ef4a2b', rule: '#c9cdda', label: '#474c63' }),
    PAL('night', 'Night', { stock: '#0e1122', you: '#93a8ea', model: '#3b4cb4', night: '#eef0f6', ember: '#ef4a2b', rule: '#2c3150', label: '#a9aec4' }),
    PAL('forest', 'Forest', { stock: '#f5f7f0', you: '#126b3d', model: '#a9cf94', night: '#151b17', ember: '#d9462f', rule: '#cfd6c8', label: '#3f4a42' })
  ];
  S.variantLabel = 'Palette';
  S.colorHint = 'Pick a palette; click an ink to change it. You, Model, Night and Ember are the figure\u2019s inks; Stock is its paper.';
  var PATCH = [
    ["INK={you:'#1b3bd4',model:'#93a8ea',night:'#0e1122',ember:'#ef4a2b',stock:'#f8f8f6',rule:'#c9cdda',ink2:'#474c63',ink3:'#666b82'}", "INK=window.__INK={you:'#1b3bd4',model:'#93a8ea',night:'#0e1122',ember:'#ef4a2b',stock:'#f8f8f6',rule:'#c9cdda',ink2:'#474c63',ink3:'#666b82'}"],
    ['function plate(cv,draw){', 'function plate(cv,draw){(window.__DRAWS=window.__DRAWS||[]).push({cv:cv,draw:draw});'],
    ['function recOf(i){if(RECS[i])return RECS[i];var sp=SP[i],', 'function recOf(i){var __s=(window.__P&&window.__P.seed)|0,__k=i+":"+__s;if(RECS[__k])return RECS[__k];var sp=__s?Object.assign({},SP[i],{seed:SP[i].seed+__s*97}):SP[i],'],
    ['return RECS[i]=r}', 'return RECS[__k]=r}'],
    ['function cluster(B,key,cx,cy,m,su,sv,ang,rd,rot){', 'function cluster(B,key,cx,cy,m,su,sv,ang,rd,rot){var __P=window.__P||{};m=Math.max(1,Math.round(m*(__P.density||1)));su*=(__P.spread||1);sv*=(__P.spread||1);'],
    ['Bins.prototype.dot=function(key,x,y,r){', 'Bins.prototype.dot=function(key,x,y,r){var __P=window.__P||{};r*=(__P.dot||1);if(__P.scatter){var __n=(window.__DN=(window.__DN||0)+1),__a=Math.sin(__n*12.9898+(__P.seed|0)*78.233)*43758.5453,__b=Math.sin(__n*39.3468+(__P.seed|0)*11.135)*24634.6345;__a-=Math.floor(__a);__b-=Math.floor(__b);x+=(__a-.5)*2*__P.scatter*r;y+=(__b-.5)*2*__P.scatter*r;}'],
    ['function drawRec(x,rec,upto,view,g,o){o=o||{};', 'function drawRec(x,rec,upto,view,g,o){o=Object.assign({},o||{});var __P=window.__P||{};o.per=(o.per||34)/(__P.density||1);if(__P.chords===0)o.nochord=true;'],
    ['var I={spec:2,rec:null,upto:336', 'var I=window.__I={spec:2,rec:null,upto:336']
  ];
  var boot = null, WIN = null;
  function load() {
    if (boot) return boot;
    boot = fetch(FIG.src).then(function (r) { if (!r.ok) throw new Error('source ' + r.status); return r.text(); }).then(function (html) {
      var miss = [];
      PATCH.forEach(function (q) { if (html.split(q[0]).length !== 2) { miss.push(q[0]); return; } html = html.replace(q[0], q[1]); });
      if (miss.length) console.info('[dot-record] not wired:', miss);
      html = html.replace(/<head>/i, '<head><base href="' + new URL(FIG.src, location.href).href + '">');
      return new Promise(function (res, rej) {
        var f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; f.title = 'dot-record engine';
        f.style.cssText = 'position:fixed;left:-4000px;top:0;width:1440px;height:900px;visibility:hidden';
        f.onload = function () {
          var w = f.contentWindow, tries = 0;
          (function wait() {
            var d = w.document, el = d.querySelector(FIG.sel), cv = el && (el.tagName === 'CANVAS' ? el : el.querySelector('canvas'));
            if (cv && !(w.__DRAWS || []).some(function (q) { return q.cv === cv; }) && w.initA && !w.__inited) { w.__inited = 1; try { w.initA(d.querySelector('.dA') || d.body); } catch (e) {} }
            var hit = cv && (w.__DRAWS || []).filter(function (q) { return q.cv === cv; })[0];
            if (hit) { WIN = w; res({ w: w, draw: hit.draw, aspect: cv.getBoundingClientRect().width / Math.max(1, cv.getBoundingClientRect().height) }); }
            else if (++tries < 80) setTimeout(wait, 100); else rej(new Error('figure not found: ' + FIG.sel));
          })();
        };
        f.srcdoc = html; document.body.appendChild(f);
      });
    });
    return boot;
  }
  S.render = function (canvas, w, h, dpr, V, done, overrides) {
    if (!READY) placeholder(canvas, V);
    var A = window.ART.params(S.spec, overrides || {}), Q = A['dot-record'];
    var x = canvas.getContext('2d'), W = canvas.width, H = canvas.height, u = W / 1000, v = H / S.ref.h;
    x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = V.paper || '#FFFFFF'; x.fillRect(0, 0, W, H);
    load().then(function (E_) { READY = true; return E_; }).then(function (E) {
      var win = E.w, K = V.inks || S.variants[0].inks; if (win.__INK) { Object.keys(K).forEach(function (k) { if (k !== 'label') win.__INK[k] = K[k]; }); win.__INK.ink2 = win.__INK.ink3 = K.label; }
      win.__P = { dot: Q.dot, density: Q.density, spread: Q.spread, scatter: Q.scatter, chords: Q.chords == null ? 1 : Q.chords, seed: Q.seed };
      S.panels.forEach(function (p) {
        var bx = p.x * u, by = p.y * v, bw = p.w * u, bh = p.h * v, cw = bw / dpr, ch = bh / dpr;
        x.save(); x.beginPath(); x.rect(bx, by, bw, bh); x.clip();
        x.fillStyle = K.stock || '#f8f8f6'; x.fillRect(bx, by, bw, bh);
        if (FIG.wave && win.__I && win.MG) { /* the Wave: crossings and seed on the page's own state */
          var I = win.__I, R = win.MG.recOf(2); if (Q.upto > R.N && win.MG.grow) win.MG.grow(R, Q.upto); I.rec = R; I.upto = Math.min(Q.upto, R.N); I.hov = -1;
        }
        win.__DN = 0;
        /* drawn at the source figure's own size, then scaled to the panel: every mark keeps its proportion to the figure */
        var fw = FIG.w || cw, fh = FIG.h || ch, k = Math.min(cw / fw, ch / fh), ox = bx + (bw - fw * k * dpr) / 2, oy = by + (bh - fh * k * dpr) / 2;
        x.setTransform(dpr * k, 0, 0, dpr * k, ox, oy);
        try { E.draw(x, fw, fh, { w: fw, h: fh, d: dpr * k, t: 0 }); } catch (err) { console.error('[dot-record]', err); }
        x.setTransform(1, 0, 0, 1, 0, 0); x.restore();
        x.strokeStyle = V.rule; x.lineWidth = Math.max(1, u * .8); x.strokeRect(Math.round(bx) + .5, Math.round(by) + .5, Math.round(bw) - 1, Math.round(bh) - 1);
      });
      if (done) done();
    }, function (err) { console.error('[dot-record]', err); if (done) done(); });
    return false;
  };
})(window.STUDY);
