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
    params: (function () { var ALL = {
      pitch: leaf(1, 0.6, 1.8, 0.01, 'Stipple pitch', '×', 'Spacing of the stipple lattice every toned area is laid on. Smaller packs the dots; larger opens the screen.'),
      dot: leaf(1, 0.6, 1.8, 0.01, 'Dot size', '×', 'Radius of every stippled dot and every dot population (scales, scent, sonar).'),
      weight: leaf(1, 0.7, 1.6, 0.01, 'Line weight', '×', 'Weight of every line the page draws: keylines, veins, leaders, rules. Held where rings and crosses keep their shape.'),
      grain: { value: 1, options: [{ v: 0, label: 'Off' }, { v: 1, label: 'On' }], label: 'Paper grain', note: 'The night stock under the figure, its mottle, fibers and tooth as the page lays them, or a flat ground.' },
      stars: Object.assign(leaf(90, 0, 200, 1, 'Stars', '', 'How many stars come out over the night half of the clock.'), { scale: 'sqrt' }),
      ticks: { value: 96, options: [{ v: 24, label: 'Hours' }, { v: 48, label: 'Half hours' }, { v: 96, label: 'Quarter hours' }], label: 'Dial ticks', note: 'How finely the 24-hour dial is ruled; every hour keeps its long tick.' },
      fur: leaf(1, 0.4, 1.6, 0.01, 'Fur', '×', 'How many hairs stand off the thorax: the insulation the plate is about.'),
      hair: leaf(1, 0.6, 1.5, 0.01, 'Hair length', '×', 'Length of each hair standing off the thorax.'),
      scatter: leaf(1, 0.6, 1.6, 0.01, 'Strike scatter', '×', 'How widely the bat’s strikes land around the body and the tails.'),
      fem: { value: 0, options: [{ v: 0, label: 'Male' }, { v: 1, label: 'Female' }], label: 'Specimen', note: 'Which Io the plate shows: the male, with broad feathered antennae, or the female.' },
      scale: leaf(1, 0.75, 1.6, 0.01, 'Scale pitch', '×', 'Pitch of the wing scales, laid in rows about each wing root from the margin inward: smaller lays finer, denser scales; larger lays a coarser, open coat.'),
      flash: leaf(0, 0, 100, 1, 'Eyespots showing', '%', 'How far the forewings have snapped forward off the hindwings: 0 is the moth at rest, 100 the full startle flash with both eyes out.'),
      discs: leaf(54, 24, 110, 1, 'Disc cells', '', 'Dots in each imaginal disc inside the pupa: the clusters of cells that become the wings, legs and eyes.'),
      clicks: leaf(34, 12, 56, 1, 'Clicks in the window', '', 'How many of the moth’s clicks fall in the gap between two bat calls; more clicks fill the window where the echo is due.')
    }, ON = FIG.dials || ['pitch', 'dot', 'weight', 'grain'], RG = FIG.range || {}, P = {};
    ON.forEach(function (k) { if (!ALL[k]) return; var o = ALL[k]; if (RG[k]) { o = JSON.parse(JSON.stringify(o)); o.range = RG[k]; } P[k] = o; }); return P; })(),
    implementation: (read.implementation || '') + ' Drawn by the source page’s own code; its stipple, dots, strokes and stock are given dials.' }];
  S.spec.techniques = TECH.concat((S.spec.techniques || []).filter(function (t) { return t.id !== TID; }));
  S.body = [S.body[0], 'The figure is drawn here by its source page’s own code (How a Moth Works), still, at the moment it was filed. Dials act on the page’s own decisions for this plate: its wing scales, stipple, dots, lines and night stock, and the counts the plate is built on. The Color tab edits its nine named inks.'];
  /* the panel takes the figure's own proportions (the filed still also holds the page's caption bars, which are not part of
     the figure), so the night stock runs to the rule with no flat bands above and below */
  if (FIG.w && FIG.h && S.panels && S.panels.length === 1) {
    var p0 = S.panels[0], top = p0.y, bot = S.ref.h - p0.y - p0.h; p0.h = Math.round(p0.w * FIG.h / FIG.w * 100) / 100; p0.a = FIG.w / FIG.h;
    S.ref.h = Math.round(top + p0.h + bot);
    (S.points || []).forEach(function (q) { if (q.pi === 0 && q.rv != null) { q.u = Math.round((p0.x + p0.w * q.ru) / 10) / 100; q.v = Math.round((p0.y + p0.h * q.rv) / S.ref.h * 10000) / 10000; } });
    if (S.spec && S.spec.reference && S.spec.reference.px) S.spec.reference.px[1] = S.ref.h;
  }
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
    ['S.idle=4;S.fem=false;', 'S.idle=4;S.fem=!!(' + Pq + '.fem);'],
    ["S.stars=[];for(var i=0;i<90;i++)S.stars.push(", 'S.stars=[];for(var i=0;i<Math.round(' + Pq + '.stars==null?90:' + Pq + '.stars);i++)S.stars.push('],
    ["for(i=0;i<96;i++){var a=i/96*TAU-Math.PI/2,l=i%4===0?12:5;", 'var __N=' + Pq + '.ticks||96;for(i=0;i<__N;i++){var a=i/__N*TAU-Math.PI/2,l=i%(__N/24)===0?12:5;'],
    ["S.fur=[];var rf=mul(19);for(i=0;i<2400;i++){", 'S.fur=[];var rf=mul(19);for(i=0;i<Math.round(2400*(' + Pq + '.fur||1));i++){'],
    ["S.fur.push([ex-Math.cos(a)*6,ey-Math.sin(a)*6,6+rf()*14,", 'S.fur.push([ex-Math.cos(a)*6,ey-Math.sin(a)*6,(6+rf()*14)*(' + Pq + '.hair||1),'],
    ["S.marks.push([615+Math.cos(a)*q*30,180+Math.sin(a)*q*40,0,r()])", 'S.marks.push([615+Math.cos(a)*q*30*(' + Pq + '.scatter||1),180+Math.sin(a)*q*40*(' + Pq + '.scatter||1),0,r()])'],
    ["S.marks.push([615+g*47+Math.cos(a)*q*15,288+Math.sin(a)*q*20,1,r()])", 'S.marks.push([615+g*47+Math.cos(a)*q*15*(' + Pq + '.scatter||1),288+Math.sin(a)*q*20*(' + Pq + '.scatter||1),1,r()])'],
    ['plates[i++].size();', 'var __q=plates[i++];if(!window.__ONLY||__q.el.id===window.__ONLY||(window.__ALSO||[]).indexOf(__q.el.id)>=0)__q.size();'],
    ['var out=[],p=o.pitch,r=o.rnd,row=0,rad=o.r||1.1;', 'var out=[],p=o.pitch*(' + Pq + '.pitch||1),r=o.rnd,row=0,rad=(o.r||1.1)*(' + Pq + '.dot||1);'],
    ['x.moveTo(qx+p[2],qy);x.arc(qx,qy,p[2],0,TAU)', 'x.moveTo(qx+p[2]*(' + Pq + '.dot||1),qy);x.arc(qx,qy,p[2]*(' + Pq + '.dot||1),0,TAU)'],
    ['im.data[k+3]=(v-.5)*44}', 'im.data[k+3]=(v-.5)*44*(' + Pq + '.grain==null?1:' + Pq + '.grain)}'],
    ['im.data[k+3]=(.5-v)*110}', 'im.data[k+3]=(.5-v)*110*(' + Pq + '.grain==null?1:' + Pq + '.grain)}'],
    ['for(var f=0;f<170;f++)', 'for(var f=0;f<Math.round(170*(' + Pq + '.grain==null?1:' + Pq + '.grain));f++)'],
    /* the filed moment: how long the plate is warmed before it is held (PL-135: 2.9 s into the cycle), the hour on the Io clock */
    ['for(var i=0;i<(o.warm||90);i++)', 'for(var i=0;i<(window.__WARM!=null?window.__WARM:(o.warm||90));i++)'],
    ['if(RM&&!ptr&&!S.set){S.h=22.1;S.set=1}', 'if(RM&&!ptr&&!S.set){S.h=window.__HOUR!=null?window.__HOUR:22.1;S.set=1}'],
    ['n=RM?87:Math.min(87,Math.floor(prog))', 'n=RM?(window.__MARKS!=null?window.__MARKS:87):Math.min(87,Math.floor(prog))'],
    /* scale pitch: every wing's scale lay; eyespots: the Io's startle flash; disc cells; clicks in the jam window */
    ['var R=w.root,row=0,r=mul(o.seed);', 'var R=w.root,row=0,r=mul(o.seed);o=Object.assign({},o,{pitch:o.pitch*(' + Pq + '.scale||1)});'],
    ['var a=S.a,shake=', 'var a=' + Pq + '.flash!=null?' + Pq + '.flash/100:S.a,shake='],
    ['S.discs.forEach(function(D){for(var k=0;k<54;k++)', 'S.discs.forEach(function(D){for(var k=0;k<Math.round(' + Pq + '.discs||54);k++)'],
    ['S.clk=[];for(i=0;i<34;i++)S.clk.push(r());', 'S.clk=[];for(i=0;i<Math.round(' + Pq + '.clicks||34);i++)S.clk.push(r());'],
    ['for(i=0;i<34;i++){var px=x0+12+((i*9.06+(RM?0:t*30))%span)', 'for(i=0;i<S.clk.length;i++){var px=x0+12+((i*308/S.clk.length+(RM?0:t*30))%span)'],
    /* house ink rule: the female Io's forewing is drawn as a warm rust, never an oxblood (the page's IOM 152,72,74 prints about #7F3C3D) */
    ['IOM=[152,72,74]', 'IOM=[176,94,58]'],
    ['fem?[112,52,58]:[204,152,62]', 'fem?[138,72,42]:[204,152,62]'],
    ['fem?[62,30,36]:[112,82,62]', 'fem?[68,40,26]:[112,82,62]'],
    ["x.save();x.setTransform(1,0,0,1,0,0);x.fillStyle=x.createPattern(tooth(),'repeat');", "x.save();x.setTransform(1,0,0,1,0,0);x.globalAlpha=Math.min(1," + Pq + ".grain==null?1:" + Pq + ".grain);x.fillStyle=x.createPattern(tooth(),'repeat');"]
  ];
  /* line weight: every stroke the page sets goes through this, so one dial weights them all */
  var HEAD = "<script>(function(){var C=CanvasRenderingContext2D.prototype,d=Object.getOwnPropertyDescriptor(C,'lineWidth');var W=function(){var p=window.__P||{};return p.weight==null?1:Math.max(.01,p.weight)};Object.defineProperty(C,'lineWidth',{configurable:true,get:function(){return d.get.call(this)/W()},set:function(v){d.set.call(this,v*W())}});window.__ONLY=" + JSON.stringify(FIG.id) + ";window.__ALSO=" + JSON.stringify(FIG.also || []) + ";})();<\/script>";
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
  /* the page's two faces for its callouts and counts (Geist Mono; Instrument Serif italic for the numerals). An image of the
     overlay cannot reach the page's web fonts, so their Latin files are fetched once and set into the image as data. If they
     cannot be fetched, the page's own fallbacks stand in (an italic serif, a monospace). */
  var FONTS = null;
  function fonts() {
    if (FONTS) return FONTS;
    var get = fetch('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@1&display=swap').then(function (r) { return r.ok ? r.text() : ''; }).then(function (css) {
      return Promise.all(css.split('@font-face').slice(1).filter(function (b) { return /U\+0000-00FF/.test(b); }).map(function (b) {
        var fam = (b.match(/font-family:\s*'([^']+)'/) || [])[1], st = (b.match(/font-style:\s*(\w+)/) || [])[1] || 'normal', wt = (b.match(/font-weight:\s*(\d+)/) || [])[1] || '400', url = (b.match(/url\(([^)]+)\)/) || [])[1];
        if (!fam || !url) return '';
        return fetch(url).then(function (r) { return r.blob(); }).then(function (bl) { return new Promise(function (res) { var fr = new FileReader(); fr.onload = function () { res("@font-face{font-family:'" + fam + "';font-style:" + st + ';font-weight:' + wt + ';src:url(' + fr.result + ") format('woff2')}"); }; fr.onerror = function () { res(''); }; fr.readAsDataURL(bl); }); });
      })).then(function (a) { return a.join(''); });
    }).catch(function () { return ''; });
    FONTS = Promise.race([get, new Promise(function (res) { setTimeout(function () { res(''); }, 5000); })]);
    return FONTS;
  }
  function svgImage(P) {
    var sv = P.el.querySelector('svg.ov'); if (!sv) return Promise.resolve(null);
    return fonts().then(function (css) { return svgImage2(P, sv, css); });
  }
  function svgImage2(P, sv, css) {
    var c = sv.cloneNode(true), win = P.el.ownerDocument.defaultView; c.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); c.setAttribute('width', P.W); c.setAttribute('height', P.H);
    /* the overlay is styled by the page's stylesheet; an image of it has none, so every element carries its computed style */
    var PROPS = ['display', 'visibility', 'opacity', 'fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'font-family', 'font-style', 'font-size', 'font-weight', 'letter-spacing', 'text-anchor', 'dominant-baseline', 'paint-order'];
    var A = [sv].concat([].slice.call(sv.querySelectorAll('*'))), B = [c].concat([].slice.call(c.querySelectorAll('*')));
    A.forEach(function (el, i) { var cs = win.getComputedStyle(el), st = PROPS.map(function (k) { return k + ':' + cs.getPropertyValue(k); }).join(';'); B[i].setAttribute('style', st + ';color:' + cs.color); });
    if (css) { var sty = document.createElementNS('http://www.w3.org/2000/svg', 'style'); sty.textContent = css; c.insertBefore(sty, c.firstChild); }
    var url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(c));
    return new Promise(function (res) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { res(null); }; im.src = url; });
  }
  function build(E, Q, V) {
    var w = E.w, P = E.P, K = V.inks || S.variants[0].inks, key = JSON.stringify([Q, K]);
    if (key === lastKey) return Promise.resolve();
    lastKey = key; w.__P = Q; w.__WARM = FIG.warm != null ? FIG.warm : null; w.__HOUR = FIG.hour != null ? FIG.hour : null; w.__MARKS = FIG.marks != null ? FIG.marks : null;
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
