/* ============================================================================
   fragment-boot.js — the ONLY contract a lens fragment must honour.
   Every fragment.html includes it as its last <script>. Nothing else about a
   fragment is the shell's business: it is a complete, standalone,
   view-source-legible document that also opens on its own by double-click.

   It does four things:
     1. reports its natural height to the host (for entries that declare
        "height":"auto" instead of a fixed aspect);
     2. announces itself with a `ready` message;
     3. forwards Escape, / and ? so the host's keyboard model survives the
        isolation boundary;
     4. answers pause/resume — and actually stops the work.

   (4) is the one that was wrong before. Setting animation-play-state stops CSS
   animation and leaves requestAnimationFrame running, which is where the cost
   actually is. So this file patches rAF: while paused, callbacks are held, not
   run, and are released in order on resume. It also dispatches `lens:pause` /
   `lens:resume` DOM events, so a lens that owns a timer or a worker can stop
   that too. A lens that does nothing gets the rAF freeze for free.

   Host → fragment: { __shell: true, type: 'pause' | 'resume' }
   Fragment → host: { __lens: true,  type: 'height' | 'ready' | 'key' }
   ============================================================================ */
(function () {
  'use strict';

  function post(msg) {
    if (window.parent === window) return;             // opened alone: no host
    try {
      var m = { __lens: true };
      for (var k in msg) if (Object.prototype.hasOwnProperty.call(msg, k)) m[k] = msg[k];
      parent.postMessage(m, '*');
    } catch (e) { /* cross-origin parent, nothing to do */ }
  }

  /* ---------------------------------------------------------------- height */
  var lastH = -1;
  function reportHeight() {
    var h = Math.ceil(Math.max(
      document.documentElement.scrollHeight,
      document.body ? document.body.scrollHeight : 0
    ));
    if (h === lastH) return;
    lastH = h;
    post({ type: 'height', height: h });
  }
  if (window.ResizeObserver) {
    new ResizeObserver(reportHeight).observe(document.documentElement);
  } else {
    window.addEventListener('resize', reportHeight);
  }
  window.addEventListener('load', reportHeight);
  reportHeight();

  /* ------------------------------------------------------------ byte cost
     CK8. The host's mount cap used to be a COUNT — four frames on a desktop,
     two on a phone — and a count is the wrong unit for a budget measured in
     megabytes: two neighbouring lenses in this library cost 13.99 MB together
     against a 12 MB phone budget (PLAN §7.10), while ten others cost nothing
     at all because they allocate no canvas. Only the fragment can know what it
     allocated, and it cannot be asked across an opaque origin, so it reports.
     The host caches the figure per lens and predicts the next mount from it. */
  var lastBytes = -1;
  function canvasBytes() {
    var n = 0, cs = document.getElementsByTagName('canvas');
    for (var i = 0; i < cs.length; i++) n += (cs[i].width || 0) * (cs[i].height || 0) * 4;
    return n;
  }
  function reportBytes() {
    var b = canvasBytes();
    if (b === lastBytes) return;
    lastBytes = b;
    post({ type: 'bytes', bytes: b });
  }
  window.addEventListener('load', reportBytes);
  // A lens that sizes its canvases from a rAF or an image decode reports late.
  // Three cheap re-reads cover every lens in the library; the message is a
  // no-op when nothing changed.
  setTimeout(reportBytes, 60);
  setTimeout(reportBytes, 400);
  setTimeout(reportBytes, 1500);

  /* --------------------------------------------------------- keyboard exit */
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === '/' || e.key === '?') post({ type: 'key', key: e.key });
  });

  /* ------------------------------------------------------ pause and resume */
  var paused = false;
  var held = [];                 // [{id, cb}] callbacks parked while paused
  var nextId = -1;               // synthetic ids are negative so they cannot
                                 // collide with the real ones
  var realRAF = window.requestAnimationFrame && window.requestAnimationFrame.bind(window);
  var realCAF = window.cancelAnimationFrame && window.cancelAnimationFrame.bind(window);

  if (realRAF) {
    window.requestAnimationFrame = function (cb) {
      if (!paused) return realRAF(cb);
      var id = nextId--;
      held.push({ id: id, cb: cb });
      return id;
    };
    window.cancelAnimationFrame = function (id) {
      if (id < 0) {
        for (var i = 0; i < held.length; i++) {
          if (held[i].id === id) { held.splice(i, 1); return; }
        }
        return;
      }
      if (realCAF) realCAF(id);
    };
  }

  function setPaused(on) {
    if (paused === on) return;
    paused = on;
    if (on) {
      document.documentElement.style.setProperty('animation-play-state', 'paused');
      document.documentElement.setAttribute('data-lens-paused', 'true');
    } else {
      document.documentElement.style.removeProperty('animation-play-state');
      document.documentElement.removeAttribute('data-lens-paused');
      var flush = held; held = [];
      flush.forEach(function (h) { if (realRAF) realRAF(h.cb); });
    }
    // Give the lens a chance to stop things rAF cannot reach.
    var ev;
    try { ev = new CustomEvent(on ? 'lens:pause' : 'lens:resume'); }
    catch (e) { ev = document.createEvent('Event'); ev.initEvent(on ? 'lens:pause' : 'lens:resume', false, false); }
    window.dispatchEvent(ev);
    document.dispatchEvent(ev);
  }

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || d.__shell !== true) return;
    if (d.type === 'pause') setPaused(true);
    if (d.type === 'resume') setPaused(false);
  });

  post({ type: 'ready', title: document.title, bytes: canvasBytes() });
})();
