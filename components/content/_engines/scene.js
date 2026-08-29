/* ============================================================================
   _engines/scene.js — the runtime every lens paints through.

   WHAT IT REPLACES
   In the monolith each lens wired itself up four times over: once on
   DOMContentLoaded, again on `load`, again on `document.fonts.ready`, and
   again on every window `resize` — so one browser resize repainted
   twenty-seven lenses and sixty-five canvases. Measured: 67.3 MB of backing
   store and 2.7 s to load.

   Under fragments most of that goes away for free (one document per frame,
   loading="lazy", the host mounts and evicts). What remains, and what this
   file owns, is:

     · paint ONCE when the document and its fonts are ready;
     · repaint on a real size change only, debounced, and only when the size
       actually moved by more than a threshold — the monolith's own stkPaint
       had this guard and nothing else did;
     · honour `lens:pause` from fragment-boot.js. The host pauses a lens that
       has scrolled off the contact sheet, and a paused lens must stop the
       work, not just the CSS animation;
     · honour prefers-reduced-motion: render one frame and stop.

   The animation half is MM-08's mkScene from Julia's own modemode work: one
   shared rAF for the whole document, an engine of {init, frame}, and an
   IntersectionObserver so an off-screen scene costs nothing.
   ============================================================================ */
(function () {
  'use strict';
  var Comp = window.Comp = window.Comp || {};

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  Comp.reducedMotion = REDUCED;

  /* ---- ready ------------------------------------------------------------ */
  var readyFns = [], fired = false;
  function fireReady() {
    if (fired) return; fired = true;
    readyFns.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
  }
  function whenReady(fn) {
    readyFns.push(fn);
    if (fired) { try { fn(); } catch (e) { console.error(e); } }
  }
  if (document.fonts && document.fonts.ready) {
    // fonts.ready is the honest signal: a plate whose type has not arrived
    // measures differently, and half these lenses size themselves off text.
    document.fonts.ready.then(fireReady);
    // …but never wait forever for a face that will not load.
    setTimeout(fireReady, 2500);
  }
  if (document.readyState === 'complete') setTimeout(fireReady, 0);
  else window.addEventListener('load', function () { setTimeout(fireReady, 0); });

  /* ---- paint: the one-shot painter -------------------------------------
     Comp.paint(fn)                 repaint on ready + on a real resize
     Comp.paint(fn, {threshold:40}) ignore width changes under 40 px         */
  Comp.paint = function (fn, opt) {
    opt = opt || {};
    var th = opt.threshold == null ? 24 : opt.threshold;
    var lastW = -1e9, lastH = -1e9, t = null, paused = false, dirty = false;

    function run(force) {
      if (paused) { dirty = true; return; }
      var w = document.documentElement.clientWidth;
      var h = window.innerHeight;
      if (!force && Math.abs(w - lastW) < th && Math.abs(h - lastH) < th) return;
      lastW = w; lastH = h; dirty = false;
      try { fn(); } catch (e) { console.error(e); }
    }
    whenReady(function () { run(true); });
    window.addEventListener('resize', function () {
      clearTimeout(t); t = setTimeout(function () { run(false); }, opt.debounce || 140);
    });
    window.addEventListener('lens:pause', function () { paused = true; });
    window.addEventListener('lens:resume', function () {
      paused = false; if (dirty) run(true);
    });
    return { repaint: function () { run(true); } };
  };

  /* ---- mkScene: the animated half --------------------------------------
     engine = { init(ctx, W, H, dpr), frame(ctx, W, H, t) }
     Only lenses that actually move need this. Everything else uses paint().  */
  var scenes = [], raf = null, running = false, hardPaused = false;

  function tick(ts) {
    raf = null;
    var live = 0;
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i];
      if (!s.visible || hardPaused) continue;
      live++;
      try { s.engine.frame(s.ctx, s.W, s.H, ts / 1000); } catch (e) { console.error(e); }
    }
    if (live && !REDUCED && !hardPaused) raf = requestAnimationFrame(tick);
    else running = false;
  }
  function kick() {
    if (running || REDUCED || hardPaused) return;
    running = true; raf = requestAnimationFrame(tick);
  }

  Comp.mkScene = function (canvas, engine, opt) {
    opt = opt || {};
    var dpr = Math.min(opt.dpr || 2, window.devicePixelRatio || 1, 2);
    var s = { canvas: canvas, engine: engine, visible: false, ctx: null, W: 0, H: 0 };

    function size() {
      var r = canvas.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      s.W = Math.round(r.width * dpr); s.H = Math.round(r.height * dpr);
      canvas.width = s.W; canvas.height = s.H;
      s.ctx = canvas.getContext('2d');
      try { engine.init(s.ctx, s.W, s.H, dpr); } catch (e) { console.error(e); }
      return true;
    }
    whenReady(function () {
      if (!size()) return;
      // reduced motion, or an engine with no frame(): paint one frame, stop.
      if (REDUCED || !engine.frame) { try { (engine.frame || function () {})(s.ctx, s.W, s.H, 0); } catch (e) { console.error(e); } return; }
      scenes.push(s);
      if (window.IntersectionObserver) {
        new IntersectionObserver(function (es) {
          s.visible = es[0].isIntersecting;
          if (s.visible) kick();
        }, { rootMargin: '120px' }).observe(canvas);
      } else { s.visible = true; }
      kick();
    });
    if (window.ResizeObserver) {
      var t = null;
      new ResizeObserver(function () {
        clearTimeout(t); t = setTimeout(function () { if (fired) { size(); kick(); } }, 140);
      }).observe(canvas);
    }
    return s;
  };

  /* The host's pause reaches every scene at once. fragment-boot.js already
     freezes rAF; this stops the scenes asking for frames in the first place,
     so a paused lens really is zero work rather than parked work. */
  window.addEventListener('lens:pause', function () {
    hardPaused = true;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    running = false;
  });
  window.addEventListener('lens:resume', function () { hardPaused = false; kick(); });
})();
