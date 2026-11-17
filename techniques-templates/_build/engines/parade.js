/* parade · engine for PL-157, the robot parade from Mindgut's A07 microsite (the green landing page, 16 Nov 2026).
   Appended to the plate's study.js by _build/plates.py ("engine" in plates.json). The page's own code draws the
   parade: it is loaded once into a hidden frame, the parade's draw function is captured, and its spacing, size, pace
   and size spread are given dials (window.__Q). The robot is the page's own (_abot, the logomark head on a small body),
   so this plate always draws the current brand character. The Color tab edits the figure's own inks: the ground, the
   ground line, every robot colorway (head, brain, suit, cups, antenna tip) and the hound, hen and cat. */
(function (S) {
  'use strict';
  var SRC = '/tools/mindgut/files/Mindgut/Claude/collection/sources-2026-11-12/artifacts/A07_microsite.html', FW = 1440, FH = 189;
  var leaf = function (value, lo, hi, step, label, unit, note) { var o = { value: value, range: [lo, hi], step: step, label: label, note: note }; if (unit) o.unit = unit; return o; };
  var read = (S.spec.techniques || [])[0] || {};
  var TECH = [{ id: 'robot-parade', short: 'PRD', name: 'Robot parade', layer: 1, pass: 1, atoms: ['sprite', 'walk cycle', 'ground line'],
    params: {
      size: leaf(1, 0.5, 1.15, 0.01, 'Size', '×', 'Height of every figure against the strip. At 1 the tallest robot is the page’s 150 px.'),
      spacing: leaf(1, 0.6, 1.8, 0.01, 'Spacing', '×', 'Gap between one walker and the next. Smaller closes the line up; the line still wraps around the strip.'),
      spread: leaf(1, 0, 2.5, 0.01, 'Size spread', '×', 'How much the robots differ in height. 0 makes them one size; 1 is the page’s spread (80 to 110%).'),
      pace: leaf(1, 0, 2.5, 0.01, 'Pace', '×', 'How far the line walks per second. Each step is taken at the stride the figure’s legs allow, so faster pace means faster steps.'),
      moment: leaf(3, 0, 60, 0.1, 'Moment', 's', 'Where in the walk the line is shown. 3 is the page’s still frame (its reduced-motion frame).')
    },
    implementation: (read.implementation || 'A character is drawn as a set of states around an idle hub and placed into scenes.') + ' Drawn by the source page’s own code: the robot is the brand character (the logomark head on a small body) in its seven colorways, walking with a hound, a hen and a Siamese.' }];
  S.spec.techniques = TECH.concat((S.spec.techniques || []).filter(function (t) { return t.id !== (read.id || 'sprite-scene'); }));
  S.spec.pass_order = ['ground', 'ground line', 'walkers · each placed by the clock, drawn from its own walk cycle'];
  S.body = [S.body[0], 'The parade is drawn here by its source page’s own code. Every robot is the Mindgut brand character from the green landing page, in the seven colorways the page defines. Dials set the size, spacing, size spread and pace of the line; Play walks it; the Color tab recolors the ground, the line, each colorway and the animals.'];
  S.paramsHint = 'Dials on the page’s own drawing. Multiples are of the page’s numbers.';
  S.motionHint = 'Play walks the line at its pace.';
  S.refHint = 'The figure is its own reference: it runs from the page’s code. The source is named in the spec.';
  S.liveOnLoad = false; delete S.live;

  /* the inks. ROBOTS order is the page's: Forest, Violet, Lilac, Acid, Mint, Ink, Plum. */
  var CW = ['forest', 'violet', 'lilac', 'acid', 'mint', 'ink', 'plum'];
  var SRC_CW = {
    forest: { head: '#fbfcf7', brain: '#d0ec60', suit: '#126b3d', cup: '#126b3d', cupc: '#d0ec60', curl: '#126b3d', tip: '#d0ec60' },
    violet: { head: '#fbfcf7', brain: '#d9cdf7', suit: '#6c46b8', cup: '#6c46b8', cupc: '#d9cdf7', curl: '#6c46b8', tip: '#d0ec60' },
    lilac: { head: '#fbfcf7', brain: '#fbfcf7', suit: '#b79cf2', cup: '#6c46b8', cupc: '#b79cf2', curl: '#6c46b8', tip: '#d0ec60' },
    acid: { head: '#fbfcf7', brain: '#fbfcf7', suit: '#d0ec60', cup: '#126b3d', cupc: '#d0ec60', curl: '#126b3d', tip: '#d0ec60' },
    mint: { head: '#fbfcf7', brain: '#d0ec60', suit: '#8fdc9b', cup: '#0a4528', cupc: '#8fdc9b', curl: '#0a4528', tip: '#d0ec60' },
    ink: { head: '#fbfcf7', brain: '#d0ec60', suit: '#151b17', cup: '#6c46b8', cupc: '#d0ec60', curl: '#151b17', tip: '#d0ec60' },
    plum: { head: '#fbfcf7', brain: '#f0a9a0', suit: '#44297f', cup: '#b79cf2', cupc: '#44297f', curl: '#44297f', tip: '#d0ec60' }
  };
  function copy(o) { return JSON.parse(JSON.stringify(o)); }
  function one(src) { var o = {}; CW.forEach(function (k) { o[k] = copy(src); }); return o; }
  var ANIMALS = { hound: { coat: '#b88a68', collar: '#d9462f' }, hen: { feathers: '#fbfcf7', comb: '#151b17' }, cat: { coat: '#efe6d2', points: '#151b17' } };
  function PAL(id, label, ground, line, robots, animals) {
    return { id: id, label: label, sw: [ground, robots.forest.suit, robots.violet.suit, robots.forest.brain, line], spot: [20, 20, 20], paper: ground, rule: line, ground: ground, line: line, robots: robots, animals: animals || copy(ANIMALS) };
  }
  S.variants = [
    PAL('mindgut', 'Mindgut', '#eef2e7', '#151b17', copy(SRC_CW)),
    PAL('forest', 'Forest', '#eef2e7', '#151b17', (function () { var o = copy(SRC_CW); ['violet', 'lilac', 'plum'].forEach(function (k, i) { o[k] = copy([SRC_CW.forest, SRC_CW.mint, SRC_CW.acid][i]); }); return o; })()),
    PAL('violet', 'Violet', '#f3f1f8', '#151b17', (function () { var o = copy(SRC_CW); ['forest', 'acid', 'mint', 'ink'].forEach(function (k, i) { o[k] = copy([SRC_CW.violet, SRC_CW.lilac, SRC_CW.plum, SRC_CW.violet][i]); }); return o; })()),
    PAL('night', 'Night', '#151b17', '#eef2e7', copy(SRC_CW), { hound: { coat: '#b88a68', collar: '#d9462f' }, hen: { feathers: '#fbfcf7', comb: '#d0ec60' }, cat: { coat: '#efe6d2', points: '#6a4633' } })
  ];
  S.variantLabel = 'Palette';
  S.colorHint = 'Pick a palette; click an ink to change it. Each ink is one of the parade’s own colors: the ground, the line, every robot colorway and the animals.';

  var PATCH = [
    ['var ROBOTS=[', 'var ROBOTS=window.__ROBOTS=['],
    ['var PETS=[', 'var PETS=window.__PETS=['],
    ["function plate(id,draw,opt){var cv=typeof id==='string'?$(id):id;if(!cv)return null;opt=opt||{};", "function plate(id,draw,opt){var cv=typeof id==='string'?$(id):id;if(!cv)return null;opt=opt||{};(window.__DRAWS=window.__DRAWS||{})[typeof id==='string'?id:(cv.id||'')]=draw;"],
    ["RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;", "RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;window.__setRM=function(v){RM=v};"],
    ["GHO=['#f5f7f0','#f5f7f0','#eef2e7'];", "GHO=['#f5f7f0','#f5f7f0','#eef2e7'];window.__setLine=function(c){VOID=c};"],
    ["var t=RM?3:P.t,base=h*.8,H=Math.min(h*.86,150),rk=petK('robot',-1)", "var __Q=window.__Q||{},t=RM?3:P.t,base=h*.8,H=Math.min(h*.86,150)*(__Q.size||1),rk=petK('robot',-1)"],
    ['var gap=Math.max(H*.62,w/11),span=Math.max(w+gap*3,gap*11),sp=H*.36,', 'var gap=Math.max(H*.62,w/11)*(__Q.spacing||1),span=Math.max(w+gap*3,gap*11),sp=H*.36*(__Q.pace==null?1:__Q.pace),'],
    ['sc2=m[0]===rk?(.8+.3*h3(n,1,3)):1', 'sc2=m[0]===rk?(.95+(.3*h3(n,1,3)-.15)*(__Q.spread==null?1:__Q.spread)):1'],
    ["dir:1,t:t+n,bg:'#eef2e7'}", "dir:1,t:t+n,bg:(window.__PBG||'#eef2e7')}"]
  ];
  var boot = null, WIN = null;
  function load() {
    if (boot) return boot;
    boot = fetch(SRC).then(function (r) { if (!r.ok) throw new Error('source ' + r.status); return r.text(); }).then(function (html) {
      var miss = [];
      PATCH.forEach(function (q) { var n = html.split(q[0]).length - 1; if (n !== 1) { miss.push(q[0]); return; } html = html.split(q[0]).join(q[1]); });
      if (miss.length) console.info('[parade] not wired:', miss);
      html = html.replace(/<head>/i, '<head><base href="' + new URL(SRC, location.href).href + '">');
      return new Promise(function (res, rej) {
        var f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; f.title = 'parade engine';
        f.style.cssText = 'position:fixed;left:-4000px;top:0;width:1440px;height:900px;visibility:hidden';
        f.onload = function () { var w = f.contentWindow, tries = 0; (function wait() { var d = (w.__DRAWS || {})['c-parade']; if (d && w.__ROBOTS && w.__PETS) { WIN = { w: w, draw: d }; res(WIN); } else if (++tries < 100) setTimeout(wait, 100); else rej(new Error('parade not found')); })(); };
        f.srcdoc = html; document.body.appendChild(f);
      });
    });
    return boot;
  }
  function petAt(win, nm) { var P = win.__PETS; for (var i = 0; i < P.length; i++) if (P[i].name.toLowerCase().indexOf(nm) >= 0) return P[i]; return null; }
  function setInks(win, V) {
    var R = V.robots || S.variants[0].robots, A = V.animals || ANIMALS;
    CW.forEach(function (k, i) { var r = win.__ROBOTS[i], c = R[k]; if (!r || !c) return; Object.keys(c).forEach(function (f) { r[f] = c[f]; }); });
    var hd = petAt(win, 'hound'), hn = petAt(win, 'silkie'), ct = petAt(win, 'siam');
    if (hd) { hd.body = A.hound.coat; hd.collar = A.hound.collar; }
    if (hn) { hn.body = A.hen.feathers; hn.c2 = A.hen.comb; }
    if (ct) { ct.body = A.cat.coat; ct.c2 = A.cat.points; }
    win.__PBG = V.ground; if (win.__setLine) win.__setLine(V.line);
  }
  function paint(E, canvas, x, V, Q, dpr, t) {
    var W = canvas.width, H = canvas.height, u = W / 1000, v = H / S.ref.h, win = E.w;
    win.__Q = Q; setInks(win, V); if (win.__setRM) win.__setRM(false);
    x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = V.paper || '#FFFFFF'; x.fillRect(0, 0, W, H);
    S.panels.forEach(function (p) {
      var bx = p.x * u, by = p.y * v, bw = p.w * u, bh = p.h * v, cw = bw / dpr, ch = bh / dpr;
      x.save(); x.beginPath(); x.rect(bx, by, bw, bh); x.clip(); x.fillStyle = V.ground; x.fillRect(bx, by, bw, bh);
      /* the strip keeps the page's height; its width follows the panel, so a wider panel shows more of the line */
      var k = ch / FH, fw = cw / k;
      x.setTransform(dpr * k, 0, 0, dpr * k, bx, by);
      try { E.draw(x, fw, FH, { cv: null, t: t, vis: true, live: true, ptr: null, down: false }, 0, dpr * k); } catch (err) { console.error('[parade]', err); }
      x.setTransform(1, 0, 0, 1, 0, 0); x.restore();
      x.strokeStyle = V.rule; x.globalAlpha = .18; x.lineWidth = Math.max(1, u * .8); x.strokeRect(Math.round(bx) + .5, Math.round(by) + .5, Math.round(bw) - 1, Math.round(bh) - 1); x.globalAlpha = 1;
    });
  }
  S.render = function (canvas, w, h, dpr, V, done, overrides) {
    var A = window.ART.params(S.spec, overrides || {}), Q = A['robot-parade'] || {};
    load().then(function (E) { paint(E, canvas, canvas.getContext('2d'), V, Q, dpr, +Q.moment || 0); if (done) done(); },
      function (err) { console.error('[parade]', err); if (done) done(); });
    return false;
  };
  S.motion = function (canvas, w, h, dpr, V, t, ctx, overrides) {
    if (!WIN) { load().catch(function () {}); return; }
    var A = window.ART.params(S.spec, overrides || {}), Q = A['robot-parade'] || {};
    paint(WIN, canvas, ctx || canvas.getContext('2d'), V, Q, dpr, (+Q.moment || 0) + t);
  };
})(window.STUDY);
