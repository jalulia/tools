/* helix-step · shared engine for the helix-step plates drawn by Mindgut's A07 microsite (PL-20…25, PL-155, PL-156).
   Appended to each plate's study.js by _build/plates.py after that plate's hx-figure.js (window.HX_FIG: source page,
   canvas id, and which dials act on that figure). The page's own code draws the figure: it is loaded once into a hidden
   frame with its canvas helper and its step, shard, sun and crystal helpers given a dial object (window.__P), and the
   figure's draw function paints straight into this plate. Moment 0 is the page's own still (its reduced-motion frame). */
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
  var FIG = window.HX_FIG || {}, ON = {}; (FIG.dials || []).forEach(function (k) { ON[k] = 1; });
  var leaf = function (value, lo, hi, step, label, unit, note) { var o = { value: value, range: [lo, hi], step: step, label: label, note: note }; if (unit) o.unit = unit; return o; };
  var ALL = {
    curl: leaf(1, 0.5, 2, 0.01, 'Curl', '×', 'Radius of the helix the steps climb: smaller winds the flight tighter, larger opens it toward a straight stair.'),
    turn: leaf(0, -40, 40, 1, 'Turn', '°', 'Where on the helix the flight starts: turns the whole stair about its axis.'),
    rise: leaf(1, 0.6, 1.8, 0.01, 'Rise', '×', 'Height of each step, as a multiple of the page’s.'),
    tread: leaf(1, 0.6, 1.6, 0.01, 'Tread', '×', 'Depth of each step along the helix, as a multiple of the page’s.'),
    block: leaf(1, 0.6, 1.3, 0.01, 'Block size', '×', 'Size of every step block against the spacing of the flight.'),
    yaw: leaf(0, -0.6, 0.6, 0.01, 'Yaw', 'rad', 'Turns every block about its own vertical axis.'),
    pitch: leaf(1, 0.5, 1.6, 0.01, 'Pitch', '×', 'How steeply the blocks are seen from above.'),
    sun: leaf(1, 0, 1.6, 0.01, 'Sun', '×', 'Size of the sun disc behind the stair; 0 takes it away.'),
    crystal: leaf(1, 0.4, 1.8, 0.01, 'Crystal size', '×', 'Size of each crystal the record sets into.'),
    length: leaf(1, 0.3, 2.5, 0.01, 'Message length', '×', 'How many characters the example exchange has: every count in the figure follows it.'),
    dotp: leaf(1, 0.6, 1.6, 0.01, 'Dot pitch', '×', 'Spacing of the counted dots.'),
    moment: leaf(0, 0, 24, 0.1, 'Moment', 's', 'Where in its loop the figure is shown. 0 is the page’s own still.')
  };
  var P0 = {}; Object.keys(ALL).forEach(function (k) { if (ON[k]) P0[k] = ALL[k]; });
  var read = (S.spec.techniques || [])[0] || {};
  var TECH = [{ id: 'helix-step', short: 'HLX', name: 'Helix step', layer: 1, pass: 1, atoms: ['isometric', 'stair', 'block'], params: P0,
    implementation: (read.implementation || 'The record as a stair of blocks climbing a helix, one block to an exchange.') + ' Drawn by the source page’s own code, with its stair, block, sun and crystal helpers given dials.' }];
  S.spec.techniques = TECH.concat((S.spec.techniques || []).filter(function (t) { return t.id !== (read.id || 'helix-step'); }));
  S.spec.pass_order = ['ground · plate', 'sun disc', 'flight · one block to an exchange, on the helix', 'figures · walker, robot, pets, crystals', 'labels'];
  S.body = [S.body[0], 'The figure is drawn here by its source page’s own code, with dials on how it is built: the helix the steps climb, the size and angle of each block, the sun, the crystals, and the moment in its loop. At the default dials it is the page’s own still.'];
  S.paramsHint = 'Dials on the page’s own drawing. Multiples are of the page’s numbers.';
  S.liveOnLoad = false; delete S.live;

  /* the figure's own inks, editable on the Color tab. The stair figures read the page's palette variables; a setter
     injected into the page reassigns them (with the shades each block face needs) before every draw. */
  var CRY = FIG.id === 'c-cryst';
  function mix(a, b, t) { var A = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); }), B = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); }); return '#' + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0'); }).join(''); }
  /* the robot is the brand character from the green landing page (A07 = the 16 Nov microsite): its colorway's inks
     sit with the figure's, so the Color tab recolors it too. FIG.robot is the page's colorway index (0 Forest, 1 Violet). */
  var BOT = FIG.robot == null ? null : FIG.robot;
  var ROB = {
    mindgut: [{ head: '#fbfcf7', brain: '#d0ec60', suit: '#126b3d', tip: '#d0ec60' }, { head: '#fbfcf7', brain: '#d9cdf7', suit: '#6c46b8', tip: '#d0ec60' }],
    night: [{ head: '#fbfcf7', brain: '#d0ec60', suit: '#2f9a5c', tip: '#d0ec60' }, { head: '#fbfcf7', brain: '#d9cdf7', suit: '#b79cf2', tip: '#d0ec60' }],
    cobalt: [{ head: '#f8f9fc', brain: '#93a8ea', suit: '#1b3bd4', tip: '#93a8ea' }, { head: '#f8f9fc', brain: '#c9d2f5', suit: '#0e1122', tip: '#93a8ea' }]
  };
  var PAL = CRY ? function (id, label, k) { return { id: id, label: label, sw: [k.ground, k.ink, k.muted, k.accent, k.green], spot: [240, 240, 240], paper: k.ground, rule: mix(k.ground, k.ink, .16), inks: k }; }
    : function (id, label, k) { if (BOT != null && ROB[id]) k.robot = ROB[id][BOT] || ROB[id][0]; return { id: id, label: label, sw: [k.paper, k.block, k.model, k.sun, k.line], spot: [20, 20, 20], paper: k.paper, rule: mix(k.paper, k.line, .16), inks: k }; };
  S.variants = CRY ? [
    PAL('mindgut', 'Mindgut', { ground: '#101311', ink: '#f5f7f0', muted: '#b9c3b1', accent: '#d0ec60', green: '#3fb36c' }),
    PAL('cobalt', 'Cobalt', { ground: '#0e1122', ink: '#eef0f6', muted: '#a9aec4', accent: '#93a8ea', green: '#1b3bd4' }),
    PAL('paper', 'Paper', { ground: '#f5f7f0', ink: '#151b17', muted: '#5d675f', accent: '#126b3d', green: '#3fb36c' })
  ] : [
    PAL('mindgut', 'Mindgut', { paper: '#f5f7f0', block: '#126b3d', model: '#fbfcf7', sun: '#d0ec60', line: '#151b17', ember: '#d9462f', violet: '#6c46b8' }),
    PAL('night', 'Night', { paper: '#151b17', block: '#d0ec60', model: '#2c3a30', sun: '#126b3d', line: '#eef2e7', ember: '#d9462f', violet: '#b9a3f0' }),
    PAL('cobalt', 'Cobalt', { paper: '#f3f5f8', block: '#1b3bd4', model: '#f8f9fc', sun: '#93a8ea', line: '#0e1122', ember: '#ef4a2b', violet: '#0e1122' })
  ];
  S.variantLabel = 'Palette';
  S.colorHint = 'Pick a palette; click an ink to change it. Each ink is one of the figure\u2019s own colors; block faces are shaded from it.' + (BOT != null ? ' The robot\u2019s head, brain, suit and antenna tip are here too.' : '');
  function setInks(win, k) {
    if (CRY) { win.__CRY = { ink: k.ink, dim: k.muted, acc: k.accent, gy: k.green }; return; }
    if (BOT != null && k.robot && win.__ROBOTS && win.__ROBOTS[BOT]) { var r = win.__ROBOTS[BOT], c = k.robot; r.head = c.head; r.brain = r.cupc = c.brain; r.suit = r.cup = r.curl = c.suit; r.tip = c.tip; }
    if (!win.__setInk) return;
    win.__setInk({ line: k.line, block: k.block, blockS: [k.block, mix(k.block, '#000000', .16), mix(k.block, '#000000', .32)], modelS: [k.model, mix(k.model, k.line, .1), mix(k.model, k.line, .2)],
      sun: k.sun, sunS: [k.sun, mix(k.sun, '#000000', .1), mix(k.sun, '#000000', .22)], litS: [mix(k.sun, '#ffffff', .72), mix(k.sun, '#ffffff', .55), mix(k.sun, '#ffffff', .4)],
      ember: k.ember, violet: k.violet, paper: k.paper, paleS: [mix(k.paper, k.line, .03), mix(k.paper, k.line, .06), mix(k.paper, k.line, .11)] });
  }
  var PATCH = [
    ['var ROBOTS=[', 'var ROBOTS=window.__ROBOTS=['],
    ["GHO=['#f5f7f0','#f5f7f0','#eef2e7'];", "GHO=['#f5f7f0','#f5f7f0','#eef2e7'];window.__setInk=function(o){if(o.line){VOID=MIST=_kINK=o.line}if(o.block){COBALT=FOREST=o.block;_kYOU=o.blockS}if(o.modelS)_kMOD=o.modelS;if(o.sun){ACID=o.sun;LIVY=o.sunS;LIVM=o.litS}if(o.ember)EMBER=o.ember;if(o.violet)VIOLET=o.violet;if(o.paper){NIGHTP=SHEET=o.paper;PALE=o.paleS;GHO=[o.paper,o.paper,o.paleS[0]]}};"],
    ["ink='#f5f7f0',dim='#b9c3b1',acc='#d0ec60',GY='#3fb36c'", "ink=(window.__CRY||{}).ink||'#f5f7f0',dim=(window.__CRY||{}).dim||'#b9c3b1',acc=(window.__CRY||{}).acc||'#d0ec60',GY=(window.__CRY||{}).gy||'#3fb36c'"],
    ["function plate(id,draw,opt){var cv=typeof id==='string'?$(id):id;if(!cv)return null;opt=opt||{};", "function plate(id,draw,opt){var cv=typeof id==='string'?$(id):id;if(!cv)return null;opt=opt||{};(window.__DRAWS=window.__DRAWS||{})[typeof id==='string'?id:(cv.id||'')]=draw;"],
    ["RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;", "RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;window.__setRM=function(v){RM=v};"],
    ["var Rr=o.R||4.6,ac=(o.ac==null?86:o.ac)*Math.PI/180", "var __P=window.__P||{},Rr=(o.R||4.6)*(__P.curl||1),ac=((o.ac==null?86:o.ac)+(__P.turn||0))*Math.PI/180"],
    ["v:-(k-(n-1)/2)*.27*c2", "v:-(k-(n-1)/2)*.27*(__P.rise||1)*c2"],
    [".46/Rr", ".46*(__P.tread||1)/Rr", 2],
    ["function _kShard(x,cx,cy,S,kind,e,yaw,rot,q){q=q||{};", "function _kShard(x,cx,cy,S,kind,e,yaw,rot,q){q=q||{};var __P=window.__P||{};S*=(__P.block||1);yaw+=(__P.yaw||0);if(__P.pitch&&__P.pitch!==1)q=Object.assign({},q,{pit:(q.pit==null?_kPIT:q.pit)*__P.pitch});"],
    ["function sunDisc(x,cx,cy,R,col){", "function sunDisc(x,cx,cy,R,col){R*=((window.__P||{}).sun==null?1:window.__P.sun);if(R<1)return;"],
    ["function crystal(x,cx,cy,R,form,t,o){o=o||{};", "function crystal(x,cx,cy,R,form,t,o){o=o||{};R*=((window.__P||{}).crystal||1);"],
    ["function howFig(x,w,h,t,o){o=o||{};", "function howFig(x,w,h,t,o){o=o||{};var __Lm=((window.__P||{}).length||1),__L=function(v){return Math.max(1,Math.round(v*__Lm))};"],
    ["CY=[14,19,13],CM=[33,46,39],NY=46,NM=118", "CY=[14,19,13].map(__L),CM=[33,46,39].map(__L),NY=__L(46),NM=__L(118)"],
    ["p=Math.max(3.2,Math.min(10,", "p=((window.__P||{}).dotp||1)*Math.max(3.2,Math.min(10,"],
    ["var JN={who:0,", "var JN=window.__JN={who:0,"]
  ];
  var boot = null;
  function load() {
    if (boot) return boot;
    boot = fetch(FIG.src).then(function (r) { if (!r.ok) throw new Error('source ' + r.status); return r.text(); }).then(function (html) {
      var miss = [];
      PATCH.forEach(function (q) { var n = html.split(q[0]).length - 1; if (n !== (q[2] || 1)) { miss.push(q[0]); return; } html = html.split(q[0]).join(q[1]); });
      if (miss.length) console.info('[helix-step] not wired:', miss);
      html = html.replace(/<head>/i, '<head><base href="' + new URL(FIG.src, location.href).href + '">');
      return new Promise(function (res, rej) {
        var f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; f.title = 'helix-step engine';
        f.style.cssText = 'position:fixed;left:-4000px;top:0;width:1440px;height:900px;visibility:hidden';
        f.onload = function () { var w = f.contentWindow, tries = 0; (function wait() { var d = (w.__DRAWS || {})[FIG.id]; if (d) { w.__T0 = w.__JN ? w.__JN.T : 0; res({ w: w, draw: d }); } else if (++tries < 100) setTimeout(wait, 100); else rej(new Error('figure not found: ' + FIG.id)); })(); };
        f.srcdoc = html; document.body.appendChild(f);
      });
    });
    return boot;
  }
  S.render = function (canvas, w, h, dpr, V, done, overrides) {
    if (!READY) placeholder(canvas, V);
    var A = window.ART.params(S.spec, overrides || {}), Q = A['helix-step'] || {};
    var x = canvas.getContext('2d'), W = canvas.width, H = canvas.height, u = W / 1000, v = H / S.ref.h;
    x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = V.paper || '#FFFFFF'; x.fillRect(0, 0, W, H);
    load().then(function (E_) { READY = true; return E_; }).then(function (E) {
      var win = E.w, P = {}; Object.keys(ALL).forEach(function (k) { P[k] = k in Q ? Q[k] : ALL[k].value; }); win.__P = P;
      var K = V.inks || S.variants[0].inks; setInks(win, K);
      var m = +Q.moment || 0; if (win.__setRM) win.__setRM(m === 0); if (win.__JN) win.__JN.T = m === 0 ? win.__T0 : m;
      S.panels.forEach(function (p) {
        var bx = p.x * u, by = p.y * v, bw = p.w * u, bh = p.h * v, cw = bw / dpr, ch = bh / dpr;
        x.save(); x.beginPath(); x.rect(bx, by, bw, bh); x.clip(); x.fillStyle = K.paper || K.ground || FIG.ground || '#f5f7f0'; x.fillRect(bx, by, bw, bh);
        /* drawn at the source figure's own size, then scaled to the panel: every mark keeps its proportion to the figure */
        var fw = FIG.w || cw, fh = FIG.h || ch, cr = FIG.crop || [0, 0, 1, 1], vw = fw * (cr[2] - cr[0]), vh = fh * (cr[3] - cr[1]), k = Math.min(cw / vw, ch / vh), ox = bx + (bw - vw * k * dpr) / 2 - cr[0] * fw * k * dpr, oy = by + (bh - vh * k * dpr) / 2 - cr[1] * fh * k * dpr; /* the filed crop of the figure fills the panel */
        x.setTransform(dpr * k, 0, 0, dpr * k, ox, oy);
        try { E.draw(x, fw, fh, { cv: null, t: m, vis: true, live: true, ptr: null, down: false }, 0, dpr * k); } catch (err) { console.error('[helix-step]', err); }
        x.setTransform(1, 0, 0, 1, 0, 0); x.restore();
        x.strokeStyle = V.rule; x.lineWidth = Math.max(1, u * .8); x.strokeRect(Math.round(bx) + .5, Math.round(by) + .5, Math.round(bw) - 1, Math.round(bh) - 1);
      });
      if (done) done();
    }, function (err) { console.error('[helix-step]', err); if (done) done(); });
    return false;
  };
})(window.STUDY);
