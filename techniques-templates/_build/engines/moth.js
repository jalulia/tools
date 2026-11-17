/* moth · shared engine for the plates lifted from Mindgut's "How a Moth Works" (PL-133…143, PL-158, PL-159).
   Appended to each plate's study.js by _build/plates.py after that plate's mo-figure.js (window.MO_FIG: source page
   and the id of its Plate). The page runs in a hidden frame, still (its reduced-motion path: each figure is warmed
   for the page's own number of frames and held), and only this plate is built. Its drawing system is given dials:
   stipple pitch and dot size (stipplePts, dots), line weight (every stroke the page draws), and paper grain (stock).
   Its nine named inks are on the Color tab. The figure's canvases and its callout overlay are then laid into this
   plate. Nothing in the source file changes. */
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
  var FIG = window.MO_FIG || {};
  var leaf = function (value, lo, hi, step, label, unit, note) { var o = { value: value, range: [lo, hi], step: step, label: label, note: note }; if (unit) o.unit = unit; return o; };
  var read = (S.spec.techniques || [])[0] || {}, TID = read.id || 'field-guide-plate';
  var TECH = [{ id: TID, short: 'MTH', name: read.name || 'Field-guide plate', layer: 1, pass: 1, atoms: ['stipple', 'keyline', 'stock'],
    params: {
      pitch: leaf(1, 0.5, 2.2, 0.01, 'Stipple pitch', '×', 'Spacing of the stipple lattice every toned area is laid on. Smaller packs the dots; larger opens the screen.'),
      dot: leaf(1, 0.4, 2.2, 0.01, 'Dot size', '×', 'Radius of every stippled dot and every dot population (scales, scent, sonar).'),
      weight: leaf(1, 0.3, 2.5, 0.01, 'Line weight', '×', 'Weight of every line the page draws: keylines, veins, leaders, rules.'),
      grain: leaf(1, 0, 2.5, 0.01, 'Paper grain', '×', 'The night stock under the figure: mottle, fibres and tooth. 0 leaves flat ground.')
    },
    implementation: (read.implementation || '') + ' Drawn by the source page’s own code; its stipple, dots, strokes and stock are given dials.' }];
  S.spec.techniques = TECH.concat((S.spec.techniques || []).filter(function (t) { return t.id !== TID; }));
  S.body = [S.body[0], 'The figure is drawn here by its source page’s own code (How a Moth Works), still, as the page draws it for reduced motion. Dials act on the page’s whole drawing system: the stipple lattice, the dots, every line and the paper. The Color tab edits its nine named inks.'];
  S.paramsHint = 'Dials on the page’s own drawing. Multiples are of the page’s numbers.';
  S.liveOnLoad = false; delete S.live;

  var hex = function (a) { return '#' + a.map(function (v) { return (v | 0).toString(16).padStart(2, '0'); }).join(''); };
  var rgb = function (h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); };
  var NAMES = ['stock', 'bone', 'lamp', 'scent', 'sonar', 'hot', 'plum', 'leaf', 'night'];
  var VAR = { stock: 'STOCK', bone: 'BONE', lamp: 'LAMP', scent: 'SCENT', sonar: 'SONAR', hot: 'HOT', plum: 'PLUM', leaf: 'LEAF', night: 'NIGHT' };
  var PALS = [
    ['night', 'Night', { stock: '#10131b', bone: '#e6e7e4', lamp: '#f0a23b', scent: '#c58cf5', sonar: '#4fd3c4', hot: '#ff5a36', plum: '#8a4e70', leaf: '#bedcba', night: '#0a0c12' }],
    ['forest', 'Forest', { stock: '#07110b', bone: '#e6e7e4', lamp: '#d0ec60', scent: '#b79cf2', sonar: '#6fcf90', hot: '#ef4a2b', plum: '#8a4e70', leaf: '#bedcba', night: '#050b07' }],
    ['ink', 'Ink', { stock: '#0e1122', bone: '#eef0f6', lamp: '#93a8ea', scent: '#ef4a2b', sonar: '#c9d2f5', hot: '#ef4a2b', plum: '#5d6ad8', leaf: '#a9aec4', night: '#090b17' }]
  ];
  S.variants = PALS.map(function (f) { var k = f[2]; return { id: f[0], label: f[1], sw: [k.stock, k.bone, k.lamp, k.scent, k.sonar], spot: [230, 231, 228], paper: k.stock, rule: '#2a2e38', inks: JSON.parse(JSON.stringify(k)) }; });
  S.variantLabel = 'Palette';
  S.colorHint = 'Pick a palette; click an ink to change it. These are the page’s own nine inks: stock (the paper), bone, lamp, scent, sonar, hot, plum, leaf and night.';

  var Pq = '(window.__P||{})';
  var PATCH = [
    ["RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;", 'RM=true;'],
    ['PLUM=[138,78,112], STOCK=[16,19,27], LEAF=[190,220,186], NIGHT=[10,12,18];', 'PLUM=[138,78,112], STOCK=[16,19,27], LEAF=[190,220,186], NIGHT=[10,12,18];window.__INK={BONE:BONE,LAMP:LAMP,SCENT:SCENT,SONAR:SONAR,HOT:HOT,PLUM:PLUM,STOCK:STOCK,LEAF:LEAF,NIGHT:NIGHT};'],
    ['byId={};', 'byId=window.__BY={};'],
    ['plates[i++].size();', 'var __q=plates[i++];if(!window.__ONLY||__q.el.id===window.__ONLY)__q.size();'],
    ['var out=[],p=o.pitch,r=o.rnd,row=0,rad=o.r||1.1;', 'var out=[],p=o.pitch*(' + Pq + '.pitch||1),r=o.rnd,row=0,rad=(o.r||1.1)*(' + Pq + '.dot||1);'],
    ['x.moveTo(qx+p[2],qy);x.arc(qx,qy,p[2],0,TAU)', 'x.moveTo(qx+p[2]*(' + Pq + '.dot||1),qy);x.arc(qx,qy,p[2]*(' + Pq + '.dot||1),0,TAU)'],
    ['im.data[k+3]=(v-.5)*44}', 'im.data[k+3]=(v-.5)*44*(' + Pq + '.grain==null?1:' + Pq + '.grain)}'],
    ['im.data[k+3]=(.5-v)*110}', 'im.data[k+3]=(.5-v)*110*(' + Pq + '.grain==null?1:' + Pq + '.grain)}'],
    ['for(var f=0;f<170;f++)', 'for(var f=0;f<Math.round(170*(' + Pq + '.grain==null?1:' + Pq + '.grain));f++)'],
    ["x.save();x.setTransform(1,0,0,1,0,0);x.fillStyle=x.createPattern(tooth(),'repeat');", "x.save();x.setTransform(1,0,0,1,0,0);x.globalAlpha=Math.min(1," + Pq + ".grain==null?1:" + Pq + ".grain);x.fillStyle=x.createPattern(tooth(),'repeat');"]
  ];
  /* line weight: every stroke the page sets goes through this, so one dial weights them all */
  var HEAD = "<script>(function(){var C=CanvasRenderingContext2D.prototype,d=Object.getOwnPropertyDescriptor(C,'lineWidth');var W=function(){var p=window.__P||{};return p.weight==null?1:Math.max(.01,p.weight)};Object.defineProperty(C,'lineWidth',{configurable:true,get:function(){return d.get.call(this)/W()},set:function(v){d.set.call(this,v*W())}});window.__ONLY=" + JSON.stringify(FIG.id) + ";})();<\/script>";
  var boot = null;
  function load() {
    if (boot) return boot;
    boot = fetch(FIG.src).then(function (r) { if (!r.ok) throw new Error('source ' + r.status); return r.text(); }).then(function (html) {
      var miss = [];
      PATCH.forEach(function (q) { var n = html.split(q[0]).length - 1; if (n !== 1) { miss.push(q[0].slice(0, 50) + ' ×' + n); return; } html = html.split(q[0]).join(q[1]); });
      if (miss.length) console.info('[moth] not wired:', miss);
      html = html.replace(/<head>/i, '<head><base href="' + new URL(FIG.src, location.href).href + '">' + HEAD);
      return new Promise(function (res, rej) {
        var f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; f.title = 'moth engine';
        f.style.cssText = 'position:fixed;left:-4000px;top:0;width:1440px;height:1200px;visibility:hidden';
        f.onload = function () { var w = f.contentWindow, tries = 0; (function wait() { var P = (w.__BY || {})[FIG.id]; if (P && P.ready && w.__INK) res({ w: w, P: P }); else if (++tries < 150) setTimeout(wait, 100); else rej(new Error('figure not found: ' + FIG.id)); })(); };
        f.srcdoc = html; document.body.appendChild(f);
      });
    });
    return boot;
  }
  var lastKey = '', overlay = null;
  function svgImage(P) {
    var sv = P.el.querySelector('svg.ov'); if (!sv) return Promise.resolve(null);
    var c = sv.cloneNode(true), win = P.el.ownerDocument.defaultView; c.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); c.setAttribute('width', P.W); c.setAttribute('height', P.H);
    /* the overlay is styled by the page's stylesheet; an image of it has none, so every element carries its computed style */
    var PROPS = ['display', 'visibility', 'opacity', 'fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'font-size', 'font-weight', 'letter-spacing', 'text-anchor', 'dominant-baseline', 'paint-order'];
    var A = [sv].concat([].slice.call(sv.querySelectorAll('*'))), B = [c].concat([].slice.call(c.querySelectorAll('*')));
    A.forEach(function (el, i) { var cs = win.getComputedStyle(el), st = PROPS.map(function (k) { return k + ':' + cs.getPropertyValue(k); }).join(';'); B[i].setAttribute('style', st + ';font-family:ui-monospace,Menlo,monospace;color:' + cs.color); });
    var url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(c));
    return new Promise(function (res) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { res(null); }; im.src = url; });
  }
  function build(E, Q, V) {
    var w = E.w, P = E.P, K = V.inks || S.variants[0].inks, key = JSON.stringify([Q, K]);
    if (key === lastKey) return Promise.resolve();
    lastKey = key; w.__P = Q;
    NAMES.forEach(function (n) { var a = w.__INK[VAR[n]], c = rgb(K[n] || '#000000'); if (a) { a[0] = c[0]; a[1] = c[1]; a[2] = c[2]; } });
    P.ready = false; P.S = {}; P.t = 0; P.size();
    return svgImage(P).then(function (im) { overlay = im; });
  }
  S.render = function (canvas, w, h, dpr, V, done, overrides) {
    if (!READY) placeholder(canvas, V);
    var A = window.ART.params(S.spec, overrides || {}), Q = A[TID] || {};
    load().then(function (E_) { READY = true; return E_; }).then(function (E) { return build(E, Q, V).then(function () { return E; }); }).then(function (E) {
      var x = canvas.getContext('2d'), W = canvas.width, H = canvas.height, u = W / 1000, v = H / S.ref.h, P = E.P, K = V.inks || S.variants[0].inks;
      x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = V.paper; x.fillRect(0, 0, W, H);
      S.panels.forEach(function (p) {
        var bx = p.x * u, by = p.y * v, bw = p.w * u, bh = p.h * v, k = Math.min(bw / P.W, bh / P.H), ox = bx + (bw - P.W * k) / 2, oy = by + (bh - P.H * k) / 2;
        x.save(); x.beginPath(); x.rect(bx, by, bw, bh); x.clip(); x.fillStyle = K.stock; x.fillRect(bx, by, bw, bh);
        x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
        if (P.bg && P.bg.width) x.drawImage(P.bg, ox, oy, P.W * k, P.H * k);
        if (P.fg && P.fg.width) x.drawImage(P.fg, ox, oy, P.W * k, P.H * k);
        if (overlay) x.drawImage(overlay, ox, oy, P.W * k, P.H * k);
        x.restore();
        x.strokeStyle = V.rule; x.lineWidth = Math.max(1, u * .8); x.strokeRect(Math.round(bx) + .5, Math.round(by) + .5, Math.round(bw) - 1, Math.round(bh) - 1);
      });
      if (done) done();
    }, function (err) { console.error('[moth]', err); if (done) done(); });
    return false;
  };
})(window.STUDY);
