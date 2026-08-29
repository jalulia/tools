/* ============================================================================
   adapters/fragment.js — the lens stage. One iframe, src=, never srcdoc.

   THE POLICY, in full, because it is the part that goes wrong quietly:

   · A lens is a complete standalone HTML document with its own <head>. It is
     loaded by src=, so it opens on its own by double-click, HTTP-caches, and
     lazy-loads. srcdoc gets none of that.
   · A file:// page DOES render a file:// iframe by src=, but the child is an
     opaque origin: contentDocument is null. So nothing here ever touches
     contentDocument / contentWindow.document. Height and readiness arrive by
     postMessage from fragment-boot.js. (The design comp read
     ef.contentDocument.body.scrollHeight; that works only for srcdoc and would
     have failed silently on a real file.)
   · The entry route mounts exactly one frame.
   · The contact sheet mounts on approach and UNMOUNTS ON EXIT — src about:blank
     and the element removed — with a hard concurrency cap: 4 at >= 840px, 2
     below. Mount-on-approach without eviction is what accumulates 20 live
     frames at 390 and never releases one.
   · A card at rest is a thumb <img>, so an unmounted card still shows the lens.
   · A preview renders at the fragment's own designWidth and is CSS-scaled with
     an authored thumb.crop [scale, offsetY]. A lens reflowed into a 240px card
     is a different composition, not a thumbnail of it.
   ============================================================================ */
(function () {
  'use strict';
  var S = window.Shell;

  var DESIGN_W = 1100;          // the width the Components lenses were drawn at
  var live = [];                // [{el, frame, entry}] currently mounted previews
  var wanted = new Map();       // el -> entry, everything inside the 200px band
  var stageFrame = null;        // the single entry-route frame
  var settle = null;            // debounce handle for reconcile()
  var msgBound = false;

  function cap() {
    return window.matchMedia('(min-width: 840px)').matches ? 4 : 2;
  }

  function srcFor(entry, example) {
    var base = entry.path || ('content/' + entry.id + '/');
    var file = (example && example.fragment) || entry.fragment || 'fragment.html';
    return base + file;
  }

  function makeFrame(title, src) {
    var f = document.createElement('iframe');
    f.title = title;                     // every iframe is titled (a11y)
    f.loading = 'lazy';
    f.setAttribute('scrolling', 'no');
    // no sandbox attribute: the child is already an opaque origin, and the
    // lenses need scripts and their own <defs> to resolve.
    f.src = src;
    return f;
  }

  function evict(rec) {
    if (!rec || !rec.frame) return;
    try { rec.frame.src = 'about:blank'; } catch (e) {}
    if (rec.frame.parentNode) rec.frame.parentNode.removeChild(rec.frame);
    rec.frame = null;
    if (rec.el) rec.el.removeAttribute('data-mounted');
    var i = live.indexOf(rec);
    if (i >= 0) live.splice(i, 1);
    report();
  }

  function report() {
    var el = document.getElementById('mountcount');
    if (el) el.textContent = String(live.length);
  }

  /* the mat's visible surround, read from the token rather than hard-coded */
  function matPad(stage) {
    var mat = stage.closest ? stage.closest('.mat') : null;
    if (!mat) return 0;
    return parseFloat(getComputedStyle(mat).paddingLeft) || 0;
  }

  function distance(el) {
    var r = el.getBoundingClientRect();
    return Math.abs((r.top + r.bottom) / 2 - window.innerHeight / 2);
  }

  function mountPreview(el, entry) {
    var frame = entry.frame || {};
    var dw = frame.designWidth || DESIGN_W;
    var crop = (entry.thumb && entry.thumb.crop) || null;   // [scale, offsetY]
    var f = makeFrame((entry.title || entry.id) + ' — preview', srcFor(entry));
    f.setAttribute('data-lens', 'preview');
    f.dataset.autoHeight = 'false';
    f.style.width = dw + 'px';
    f.style.height = (frame.previewHeight || 900) + 'px';
    // Render at the fragment's own design width and CSS-scale it. The crop is
    // authored per lens: a thumbnail crop is a picture editor's decision, not a
    // computed one.
    //   crop[0]  a MULTIPLE of fit-to-card. 1 shows the whole plate width; 1.4
    //            is a 1.4x detail. Relative, so a card that changes width when
    //            the rail closes does not change what the crop means.
    //   crop[1]  the design-pixel row that lands at the top of the card.
    //   crop[2]  optional: the design-pixel column that lands at its left edge.
    var fit = el.clientWidth / dw;
    var scale = fit * (crop ? crop[0] : 1);
    var offY = crop ? crop[1] || 0 : 0;
    // crop[2], optional: the design-pixel COLUMN that lands at the left edge.
    // Two lenses cannot be cropped correctly without it — T8's wordmark and
    // D2's glyph grid are centred on a plate too short to show whole, so the
    // only crop that fits the card is a zoom, and a zoom anchored at x=0 cuts
    // the L off NORMAL. Optional and defaulting to 0, so every existing
    // two-element crop means exactly what it meant.
    var offX = crop ? crop[2] || 0 : 0;
    f.style.transformOrigin = '0 0';
    f.style.transform = 'scale(' + scale + ') translate(' + (-offX) + 'px,' + (-offY) + 'px)';
    el.appendChild(f);
    el.setAttribute('data-mounted', 'true');
    live.push({ el: el, frame: f, entry: entry });
  }

  function reconcile() {
    var keep = [];
    wanted.forEach(function (entry, el) {
      if (el.isConnected) keep.push({ el: el, entry: entry, d: distance(el) });
    });
    keep.sort(function (a, b) { return a.d - b.d; });
    keep = keep.slice(0, cap());
    var keepEls = keep.map(function (k) { return k.el; });

    live.slice().forEach(function (rec) {
      if (keepEls.indexOf(rec.el) < 0) evict(rec);
    });
    keep.forEach(function (k) {
      if (!live.some(function (r) { return r.el === k.el; })) mountPreview(k.el, k.entry);
    });
    report();
  }

  /* ---- pause / resume across the isolation boundary --------------------- */
  function tell(frame, type) {
    if (!frame || !frame.contentWindow) return;
    try { frame.contentWindow.postMessage({ __shell: true, type: type }, '*'); } catch (e) {}
  }

  /* Height and ready arrive as messages, never by reaching into the frame. */
  function bindMessages() {
    if (msgBound) return;
    msgBound = true;
    window.addEventListener('message', function (ev) {
      var d = ev.data;
      if (!d || d.__lens !== true) return;
      var frames = [].slice.call(document.querySelectorAll('iframe[data-lens]'));
      var hit = frames.filter(function (f) { return f.contentWindow === ev.source; })[0];
      if (!hit) return;
      if (d.type === 'height' && hit.dataset.autoHeight === 'true') {
        hit.dataset.frameHeight = Math.max(120, d.height);
        var st = hit.closest('.stage');
        if (st) adapter.applyFit(st, +st.dataset.designWidth || DESIGN_W);
      }
      if (d.type === 'ready') hit.setAttribute('data-ready', 'true');
    });
  }

  var adapter = {
    /* ---------------------------------------------------------- entry route */
    mount: function (o) {
      bindMessages();
      var entry = o.entry;
      var src = srcFor(entry, o.example);
      var f = makeFrame((entry.title || entry.id) + ' — lens', src);
      f.setAttribute('data-lens', 'entry');
      var frame = entry.frame || {};
      var auto = frame.height === 'auto';
      var dw0 = frame.designWidth || DESIGN_W;
      f.dataset.autoHeight = String(auto);
      // Derive the frame's own height from the declared aspect, in design
      // pixels. "auto" leaves it to the fragment's postMessage.
      if (!auto) {
        var a = String(frame.aspect || '3/2').split('/');
        f.dataset.frameHeight = Math.round(dw0 * (+a[1] || 2) / (+a[0] || 3));
      }
      o.stage.innerHTML = '';
      o.stage.appendChild(f);
      stageFrame = f;

      // the drawdown strip tells you WHAT you are looking at — the catalogue's
      // equivalent of a compile status
      if (o.bar) {
        var dw = frame.designWidth || DESIGN_W;
        o.bar.innerHTML =
          '<span><span class="k">iframe</span> ' + S.esc(src) + '</span>' +
          '<span class="opt"><span class="k">design width</span> ' + dw +
            ' <span class="k">·</span> <span id="fitread">shown 1:1</span></span>' +
          '<span class="opt"><span class="k">isolation</span> iframe · own document</span>' +
          '<span class="r"><button type="button" class="lnk" id="fitbtn">Fit</button>' +
          '<a class="lnk" href="' + S.esc(src) + '" target="_blank" rel="noopener">Open alone ↗</a>' +
          '<span id="mountstate">MOUNTED</span></span>';
        var fit = document.getElementById('fitbtn');
        if (fit) fit.addEventListener('click', function () { adapter.toggleFit(o.stage, dw); });
      }
      adapter.applyFit(o.stage, frame.designWidth || DESIGN_W);
      window.addEventListener('resize', adapter._onResize);
    },

    unmount: function () {
      window.removeEventListener('resize', adapter._onResize);
      if (stageFrame) {
        try { stageFrame.src = 'about:blank'; } catch (e) {}
        if (stageFrame.parentNode) stageFrame.parentNode.removeChild(stageFrame);
        stageFrame = null;
      }
      wanted.clear();
      clearTimeout(settle);
      live.slice().forEach(evict);
    },

    /* ---- 1:1 vs fit. Julia's call: 1:1 and scroll, with a fit escape hatch,
       because B3 is 10,117px at design width. ---------------------------- */
    _fit: false,
    _onResize: function () {
      var st = document.querySelector('.stage[data-fit]');
      if (st) adapter.applyFit(st, +st.dataset.designWidth || DESIGN_W);
    },
    toggleFit: function (stage, dw) {
      adapter._fit = !adapter._fit;
      adapter.applyFit(stage, dw);
    },
    applyFit: function (stage, dw) {
      if (!stage) return;
      stage.dataset.designWidth = dw;
      stage.dataset.fit = adapter._fit ? 'fit' : 'lens';
      var f = stage.querySelector('iframe');
      // The stage's own width is the fit reference, so measure it before the
      // frame is scaled into it.
      var avail = stage.parentNode ? stage.parentNode.clientWidth - 2 * matPad(stage) : dw;
      var scale = adapter._fit ? Math.min(1, avail / dw) : 1;
      if (f) {
        f.style.width = dw + 'px';
        // A transform does not affect layout, so the stage has to be told the
        // height itself or it collapses to the iframe's default 150px. The
        // height comes from the declared aspect (or from the fragment's own
        // postMessage when it declares height:"auto").
        var h = +f.dataset.frameHeight || 0;
        if (h) {
          f.style.height = h + 'px';
          stage.style.height = Math.round(h * scale) + 'px';
        }
        f.style.transformOrigin = '0 0';
        f.style.transform = scale === 1 ? 'none' : 'scale(' + scale.toFixed(4) + ')';
      }
      var read = document.getElementById('fitread');
      if (read) {
        var clip = Math.max(0, Math.round(dw * scale - avail));
        read.textContent = (scale === 1 ? 'shown 1:1' : 'shown ' + scale.toFixed(2) + '×') +
          (clip ? ' · ' + clip + ' px clipped' : '');
      }
      var btn = document.getElementById('fitbtn');
      if (btn) { btn.textContent = adapter._fit ? '1:1' : 'Fit'; btn.setAttribute('aria-pressed', String(adapter._fit)); }
    },

    /* ------------------------------------------------------- contact sheet
       preview() only records what the observer wants; reconcile() decides.
       A straight "mount on enter, evict the farthest when full" loop has a
       real defect: a card evicted to make room stays evicted after the scroll
       settles, even though it is the one you are looking at. So instead the
       wanted set is reconciled every time it changes — mount the `cap` cards
       nearest the middle of the viewport, evict everything else. */
    preview: function (el, entry, on) {
      bindMessages();
      if (on) wanted.set(el, entry); else wanted.delete(el);
      // Debounced: during a fast scroll the wanted set changes several times a
      // frame, and mounting a document only to abort its load a moment later is
      // wasted work (and a stream of aborted requests in the network panel).
      clearTimeout(settle);
      settle = setTimeout(reconcile, 120);
    },

    pauseAll: function (yes) {
      live.forEach(function (r) { tell(r.frame, yes ? 'pause' : 'resume'); });
      if (stageFrame) tell(stageFrame, yes ? 'pause' : 'resume');
    },

    /* Read-only source pane. We cannot read the frame's document (opaque
       origin), so we show the path and let "Open alone" do the rest. */
    fillSource: function (entry, example) {
      var pane = document.getElementById('app-body');
      if (!pane) return;
      var src = srcFor(entry, example);
      pane.innerHTML = '<div class="src-note"><p class="lab">Fragment</p>' +
        '<p><code>' + S.esc(src) + '</code></p>' +
        '<p>A lens is its own document. It is not readable from this page — that is the ' +
        'isolation working. <a href="' + S.esc(src) + '" target="_blank" rel="noopener">Open it alone ↗</a></p></div>';
      var file = document.getElementById('app-file');
      if (file) file.textContent = src;
    },

    liveCount: function () { return live.length; }
  };

  S.registerAdapter('fragment', adapter);
})();
