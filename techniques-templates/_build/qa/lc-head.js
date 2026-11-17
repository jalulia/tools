(function () {
    var W = window, q = [], n = 0, d0 = Date.now();
    /* a page that keeps its place in the URL (history.replaceState) cannot inside a frame of another address: let it pass */
    ['replaceState', 'pushState'].forEach(function (k) { var o = history[k]; history[k] = function () { try { return o.apply(history, arguments); } catch (e) {} }; });
    W.__NOW = 0; W.__P = W.__P0 || {}; W.__MAP = W.__MAP0 || {}; W.__MAPK = JSON.stringify(W.__MAP); W.__UC = new WeakMap(); W.__UO = { lw: 0, mark: 0, al: 0, font: 0, img: 0, col: {} };
    var UU = function (ctx) { var c = ctx && ctx.canvas; if (!c || !c.isConnected) return W.__UO; var o = W.__UC.get(c); if (!o) { o = { lw: 0, mark: 0, al: 0, font: 0, img: 0, col: {} }; W.__UC.set(c, o); } return o; };
    if (W.__REAL) W.__step = function () {}; else {
    W.requestAnimationFrame = function (cb) { q.push([++n, cb]); return n; };
    W.cancelAnimationFrame = function (i) { q = q.filter(function (e) { return e[0] !== i; }); };
    performance.now = function () { return W.__NOW; }; Date.now = function () { return d0 + W.__NOW; };
    W.__step = function (dt) { W.__NOW += dt * 1000; var c = q; q = []; c.forEach(function (e) { try { e[1](W.__NOW); } catch (err) { console.error(err); } }); }; }
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
    wrap('filter', function (v) { var b = P('blur', 1); return b === 1 || typeof v !== 'string' ? v : v.replace(/blur\(([\d.]+)px\)/g, function (m, x) { return 'blur(' + (+x * b) + 'px)'; }); });
    wrap('font', function (v, c) { UU(c).font++; var f = P('type', 1); return f === 1 ? v : String(v).replace(/([\d.]+)px/, function (s, x) { return (+x * f) + 'px'; }); });
    ['fillStyle', 'strokeStyle', 'shadowColor'].forEach(function (k) { wrap(k, mapc); });
    var di = C.drawImage; C.drawImage = function () { UU(this).img++; return di.apply(this, arguments); };
    var G = CanvasGradient.prototype, acs = G.addColorStop; G.addColorStop = function (o, c) { return acs.call(this, o, mapc(c, null)); };
    var arc = C.arc; C.arc = function (x, y, r, a0, a1, cc) { if (r <= 3) { UU(this).mark++; r *= P('mark', 1); } return arc.call(this, x, y, r, a0, a1, cc); };
    var ell = C.ellipse; C.ellipse = function (x, y, rx, ry, ro, a0, a1, cc) { if (rx <= 3 && ry <= 3) { UU(this).mark++; var k = P('mark', 1); rx *= k; ry *= k; } return ell.call(this, x, y, rx, ry, ro, a0, a1, cc); };
    var fr = C.fillRect; C.fillRect = function (x, y, w, h) { if (w <= 6 && h <= 6 && w > 0 && h > 0) { UU(this).mark++; var k = P('mark', 1); x += w * (1 - k) / 2; y += h * (1 - k) / 2; w *= k; h *= k; } return fr.call(this, x, y, w, h); };
  })();