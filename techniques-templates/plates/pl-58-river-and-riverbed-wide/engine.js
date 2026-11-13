/* PL-58 · River and riverbed — engine. Appended to study.js by _build/plates.py ("engine" in plates.json); edit this file.
   The painted river from the A07 microsite runs here with its dials. The page's own script is read, its river code is
   given a parameter object (RVP) in place of its fixed numbers, and it runs in a hidden frame; its draw function paints
   straight into this plate. Nothing in the source file changes. Grain is laid at screen pixels, not page pixels. */
(function (S) {
  'use strict';
  var SRC = '../../../mindgut/files/Mindgut/Claude/collection/sources-2026-11-12/artifacts/A07_microsite.html';
  var still = S.render;
  var leaf = function (value, lo, hi, step, label, unit, note) { var o = { value: value, range: [lo, hi], step: step, label: label, note: note }; if (unit) o.unit = unit; return o; };
  var read = (S.spec.techniques || [])[0] || {};
  var TECH = [
    { id: read.id || 'pixel-river', short: 'GRN', name: 'Painted grain', layer: 1, pass: 1, atoms: ['grain', 'ramp'],
      params: {
        grain: leaf(1, 1, 3, 0.25, 'Grain', 'px', 'Size of one grain, in screen pixels. Every grain takes one color from a short ramp; 1 lays the ground at the screen’s own pixel, the page drew it at 2 on a retina screen.'),
        speck: leaf(1, 0, 2.5, 0.01, 'Speckle', '×', 'How far chance moves a grain along its ramp. 0 leaves only the light field and the brush streaks; higher breaks every tone into speckle.'),
        fray: leaf(1, 0, 3, 0.01, 'Bank fray', '×', 'How ragged the water’s edge is, grain by grain.'),
        flowers: leaf(1, 0, 3, 0.01, 'Flowers', '×', 'Share of grains in the meadow patches that print as pink, pale yellow and violet flowers.'),
        record: leaf(1, 0, 1.25, 0.01, 'Riverbed glow', '×', 'Share of grains over each strand of the record that print as its glow: green for yours, white for the model’s.')
      },
      implementation: 'Ground and water are laid in as grain: every pixel takes one color from a short ramp, chosen by a field of light, a streak of brushwork and chance, so light blooms and falls off in speckle and nothing has a hard edge. The record lies on the bed as two kinds of glow.' },
    { id: 'river-form', short: 'RIV', name: 'River', layer: 1, pass: 2, atoms: ['field'],
      params: {
        width: leaf(1, 0.5, 1.6, 0.01, 'Width', '×', 'Half-width of the river against the height of the plate.'),
        meander: leaf(1, 0, 2.5, 0.01, 'Meander', '×', 'Depth of the river’s long bend.'),
        sun: leaf(1, 0.2, 1.4, 0.01, 'Sun along the river', '×', 'Where the light on the water sits along the current.'),
        light: leaf(1, 0, 1.8, 0.01, 'Sun on the water', '×', 'Reach and strength of the bloom of light on the water.')
      },
      implementation: 'One centerline with a slowly varying width; banks wander about it by noise; three islands part the current; a light field of broad sweeps, a worn path and a sun on the water.' },
    { id: 'river-hand', short: 'HND', name: 'Hand marks', layer: 2, pass: 3, atoms: ['stroke'],
      params: {
        grass: leaf(1, 0, 2.5, 0.01, 'Grass', '×', 'Count of tapered grass strokes, leaning with the wind.'),
        current: leaf(1, 0, 2.5, 0.01, 'Current', '×', 'Count of long current strokes that part round the islands, and of the glints running down the water.'),
        bank: leaf(1, 0, 2.5, 0.01, 'Bank line', '×', 'Weight of the broken dark line where water meets land.')
      },
      implementation: 'Tapered strokes of a loaded brush over the grain: grass on land, current in the water, a dark line at the bank that thickens, thins and breaks.' },
    { id: 'river-time', short: 'TIME', name: 'Time', layer: 3, pass: 4, atoms: ['motion'],
      params: {
        speed: leaf(1, 0, 3, 0.01, 'Speed', '×', 'How fast the river’s clock runs when the plate plays: current, koi, canoe, walkers, kite.'),
        moment: leaf(6, 0, 120, 0.1, 'Moment', 's', 'The time on the river’s clock the still shows, and where Play starts.')
      },
      implementation: 'Everything that moves reads one clock: glints and koi ride the current, the canoe passes from one model’s reach to the next, people and robots walk the banks.' }
  ];
  S.spec.techniques = TECH.concat((S.spec.techniques || []).filter(function (t) { return t.id !== read.id; }));
  S.spec.pass_order = ['ground · plate', 'fields · light, water, record, trees, flowers, drawn small and read back soft', 'grain · one color per screen pixel', 'hand · grass, current, bank line, reeds, stones', 'life · the clock: water, koi, canoe, people, birds'];
  S.body = [S.body[0], 'The river runs here from the page’s own code, with its dials. The grain is laid at the screen’s pixel, so it stays fine however large the plate is drawn; width, meander, light, speckle, bank fray, flowers, the riverbed glow, grass, current and the bank line redraw the scene, and Play runs its clock.'];
  S.paramsHint = 'Every dial of the painted river. Grain is in screen pixels; the rest are multiples of the page’s own numbers.';
  S.motionHint = 'Play runs the river’s clock: the current, the koi, the canoe, the people and robots on the banks.';
  S.motionOnLoad = true; S.liveOnLoad = false; delete S.live;
  S.refHint = 'The figure is its own reference: it runs from the page’s code. The source is named in the spec.';

  /* seasons: the ramps of land, water and canopy */
  var SEASONS = {
    park: null,
    late: { LR: ['#2c3b22', '#4c5a26', '#7a7f2e', '#a8973a', '#cfb550', '#e0dc7c'], CAN: ['#1d2a1a', '#2f3f1c', '#56602a', '#8a7f36', '#c2a64a'] },
    dusk: { LR: ['#0d1630', '#1a2a4a', '#2c4660', '#4d6a78', '#7e9a8e', '#b8c9a8'], WR: ['#070b2a', '#141f5a', '#28388f', '#5d5fb8', '#d6b8e8'], CAN: ['#060c1c', '#0e1a30', '#1c3046', '#2f4c5e', '#5c7a7a'] },
    frost: { LR: ['#3a4a5c', '#5d7184', '#8aa0b2', '#b5c6d2', '#d9e3ea', '#f2f6f9'], WR: ['#14244a', '#25407a', '#3d64a8', '#7fa2d2', '#e2eef8'], CAN: ['#1e2c3a', '#33475a', '#56708a', '#8aa4ba', '#c6d6e2'] }
  };
  var sw = function (k) { var s = SEASONS[k]; return s ? [s.LR[2], s.LR[4], (s.WR || ['#2857c0', '#2857c0', '#2857c0'])[2], s.CAN[1]] : ['#27744b', '#86b96b', '#2857c0', '#0e463b']; };
  S.variants = [['park', 'Park'], ['late', 'Late summer'], ['dusk', 'Dusk'], ['frost', 'Frost']].map(function (v) { return { id: v[0], label: v[1], sw: sw(v[0]), spot: [20, 20, 20], paper: '#FFFFFF', rule: '#D9D9DC' }; });
  S.variantLabel = 'Season';

  /* ---- the river's code, given dials ---- */
  var PATCH = [
    ['hwf=nar?.125:tall?.15:.168', 'hwf=(nar?.125:tall?.15:.168)*RVP.width'],
    ['(nar?.045:tall?.062:.082)*Math.sin(', '(nar?.045:tall?.062:.082)*RVP.meander*Math.sin('],
    ['var sun=atf(M*(tall?.6:.67),-.08)', 'var sun=atf(M*(tall?.6:.67)*RVP.sun,-.08)'],
    ['glow(sun[0],sun[1],h*.24,255,.75);glow(sun[0],sun[1],h*.1,255,1);', 'glow(sun[0],sun[1],h*.24*Math.max(.05,RVP.light),255,Math.min(1,.75*RVP.light));glow(sun[0],sun[1],h*.1*Math.max(.05,RVP.light),255,Math.min(1,RVP.light));'],
    ['(r2-.5)*.32', '(r2-.5)*.32*RVP.speck'], ['(r2-.5)*.25', '(r2-.5)*.25*RVP.speck'], ['(r2-.5)*.22', '(r2-.5)*.22*RVP.speck'],
    ['>.5+(r1-.5)*.26', '>.5+(r1-.5)*.26*RVP.fray'],
    ['i<(nar?260:tall?480:820)', 'i<Math.round((nar?260:tall?480:820)*RVP.grass)'],
    ['i<(nar?50:tall?80:130)', 'i<Math.round((nar?50:tall?80:130)*RVP.current)'],
    ['i<(nar?26:tall?44:70)', 'i<Math.round((nar?26:tall?44:70)*RVP.current)'],
    ['lw=2.7*sc*', 'lw=2.7*RVP.bank*sc*'],
    ['if(r3<sy*.8)col=YO', 'if(r3<sy*.8*RVP.record)col=YO'], ['else if(r3<sy*.8+sm*.8)col=MO', 'else if(r3<(sy*.8+sm*.8)*RVP.record)col=MO'],
    ['var f1=FM[o]/255*.2,f2=FM[o+1]/255*.22,f3=FM[o+2]/255*.2;', 'var f1=FM[o]/255*.2*RVP.flowers,f2=FM[o+1]/255*.22*RVP.flowers,f3=FM[o+2]/255*.2*RVP.flowers;'],
    ['fs=tall?8:9;', 'fs=(tall?8:9)*RVP.k;'], ["x.lineWidth=3.2;x.strokeStyle='#131c63'", "x.lineWidth=3.2*RVP.k;x.strokeStyle='#131c63'"]
  ];
  var boot = null, WIN = null, missed = [];
  function load() {
    if (boot) return boot;
    boot = fetch(SRC).then(function (r) { if (!r.ok) throw new Error('source ' + r.status); return r.text(); }).then(function (html) {
      var a = html.indexOf('var RV={rec:'), p = html.indexOf("plate('c-river',function(x,w,h,P,dt,d){"), b = p < 0 ? -1 : html.indexOf('},{live:true});', p);
      if (a < 0 || b < 0) throw new Error('river code not found');
      var sec = html.slice(a, b);
      PATCH.forEach(function (q) { var n = sec.split(q[0]).length - 1; if (n !== 1) { missed.push(q[0]); return; } sec = sec.replace(q[0], q[1]); });
      sec = sec.replace('var RV={rec:', 'var RV=window.__RV={rec:').replace("plate('c-river',function(x,w,h,P,dt,d){", "plate('c-river',window.__RIVER=function(x,w,h,P,dt,d){");
      var head = "(function(){\n'use strict';";
      var src = html.slice(0, a) + sec + html.slice(b);
      if (src.indexOf(head) < 0) throw new Error('script head not found');
      src = src.replace(head, head + 'var RVP=window.RVP=window.RVP||{width:1,meander:1,sun:1,light:1,speck:1,fray:1,grass:1,current:1,bank:1,record:1,flowers:1,k:1};');
      src = src.replace(/<head>/i, '<head><base href="' + new URL(SRC, location.href).href + '">');
      if (missed.length) console.info('[PL-58] dials not wired:', missed);
      return new Promise(function (res, rej) {
        var f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; f.title = 'river engine';
        f.style.cssText = 'display:none'; f.onload = function () { var w = f.contentWindow; if (w && w.__RIVER && w.__RV) { w.__DEF = { LR: w.__RV.LR.slice(), WR: w.__RV.WR.slice(), CAN: w.__RV.CAN.slice() }; WIN = w; res(w); } else rej(new Error('river did not start')); };
        f.srcdoc = src; document.body.appendChild(f);
      });
    });
    return boot;
  }
  var lastKey = '';
  function setUp(w, A, V, dpr) {
    var G = A[TECH[0].id], R = A['river-form'], H = A['river-hand'], k = Math.max(1, dpr / Math.max(.5, G.grain));
    var P = w.RVP; P.width = R.width; P.meander = R.meander; P.sun = R.sun; P.light = R.light; P.speck = G.speck; P.fray = G.fray; P.flowers = G.flowers; P.record = G.record; P.grass = H.grass; P.current = H.current; P.bank = H.bank; P.k = k;
    var sea = SEASONS[V && V.id] || null, D = w.__DEF; w.__RV.LR = (sea && sea.LR) || D.LR; w.__RV.WR = (sea && sea.WR) || D.WR; w.__RV.CAN = (sea && sea.CAN) || D.CAN;
    var key = JSON.stringify([P, V && V.id]); if (key !== lastKey) { w.__RV.c = null; lastKey = key; }
    return k;
  }
  function paint(w, canvas, x, V, A, dpr, t) {
    var W = canvas.width, Hh = canvas.height, u = W / 1000, v = Hh / S.ref.h, p = S.panels[0];
    var bx = Math.round(p.x * u), by = Math.round(p.y * v), bw = Math.round(p.w * u), bh = Math.round(p.h * v);
    var k = setUp(w, A, V, dpr), d = dpr / k, sw2 = bw / d, sh2 = bh / d;
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.fillStyle = V.paper; x.fillRect(0, 0, W, Hh);
    x.save(); x.beginPath(); x.rect(bx, by, bw, bh); x.clip(); x.setTransform(d, 0, 0, d, bx, by);
    w.__RIVER(x, sw2, sh2, { t: t }, 0, d);
    x.restore(); x.setTransform(1, 0, 0, 1, 0, 0);
    x.strokeStyle = V.rule; x.lineWidth = Math.max(1, u * .8); x.strokeRect(bx + .5, by + .5, bw - 1, bh - 1);
  }
  S.render = function (canvas, w, h, dpr, V, done, overrides) {
    var A = window.ART.params(S.spec, overrides || {});
    load().then(function (win) { paint(win, canvas, canvas.getContext('2d'), V, A, dpr, A['river-time'].moment); if (done) done(); })
      .catch(function (e) { console.info('[PL-58] still only:', e && e.message); still(canvas, w, h, dpr, V, done); });
    return false;
  };
  S.motion = function (canvas, w, h, dpr, V, t, ctx, overrides) {
    if (!WIN) { load().catch(function () {}); return; }
    var A = window.ART.params(S.spec, overrides || {}), T = A['river-time'];
    paint(WIN, canvas, ctx || canvas.getContext('2d'), V, A, dpr, T.moment + t * T.speed);
  };
})(window.STUDY);
