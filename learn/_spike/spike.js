/* ============================================================================
   _spike/spike.js — the throwaway view layer and two stub adapters for the
   transport spike. It exists to prove three things and nothing else:

     1. a manifest and nine entries load over injected classic <script src>,
        from file:// and from http, with no fetch and no console error;
     2. the hash router resolves only ids in the validated route Map and drops
        an unknown hash on the landing route silently;
     3. the iframe mount/evict policy in adapters/fragment.js holds its cap
        after the contact sheet has been scrolled end to end.

   The real view layer is learn/views.js (checkpoint 1). Nothing in this file
   is meant to survive; it is deliberately ugly so nobody mistakes it for the
   design.
   ============================================================================ */
(function () {
  'use strict';
  var S = window.Shell;

  /* --- two stub adapters, so the lane seam is exercised for all three lanes */
  S.registerAdapter('glsl', {
    mount: function (o) {
      o.stage.innerHTML = '<div class="stub">glsl lane · ' +
        S.esc((o.example && o.example.title) || '—') + '</div>';
      if (o.bar) o.bar.textContent = 'stub glsl adapter · no gl context in the spike';
    },
    unmount: function () {}
  });
  S.registerAdapter('canvas2d', {
    mount: function (o) {
      o.stage.innerHTML = '<div class="stub">canvas2d lane · ' +
        S.esc((o.example && o.example.title) || '—') + '</div>';
      if (o.bar) o.bar.textContent = 'stub canvas2d adapter';
    },
    unmount: function () {}
  });

  function el(id) { return document.getElementById(id); }

  S.views = {
    buildChrome: function () {
      el('brand').textContent = S.manifest.title;
    },

    renderLoading: function (e) {
      el('view').innerHTML = '<p class="lab">Loading ' + S.esc(e.id) + '…</p>';
    },

    renderMissing: function (id) {
      el('view').innerHTML = '<p class="lab">No entry ' + S.esc(id) +
        '. <a href="#/index">Back to the index</a>.</p>';
    },

    renderEntry: function (e, exampleId, query) {
      S.unobservePreviews();
      S.current = e;
      var ex = (e.examples || []).filter(function (x) { return x.id === exampleId; })[0] ||
               (e.examples || [])[0] || null;
      S.currentExample = ex;
      el('crumb').textContent = S.sectionOf(e.section).title + ' · ' + e.title;
      el('view').innerHTML =
        '<p class="lab">' + S.esc(S.sectionOf(e.section).title) + ' · ' + S.esc(e.index || '') + '</p>' +
        '<h1>' + S.esc(e.title) + '</h1>' +
        '<div class="mat"><div class="stage" id="stage"></div></div>' +
        '<div class="draw" id="bar"></div>' +
        '<div class="read">' + (e.text || '') + '</div>';
      S.mountAdapter({ stage: el('stage'), bar: el('bar'), entry: e, example: ex, query: query || {} });
      S.markCurrent();
      window.scrollTo(0, 0);
    },

    renderStyle: function (st) {
      this.renderSheet(st.id);
    },

    renderSheet: function (styleId) {
      S.unmountAdapter();
      S.current = null; S.currentStyle = styleId || null; S.markCurrent();
      el('crumb').textContent = styleId ? ('style · ' + styleId) : 'Contact sheet';
      var list = S.filtered.filter(function (e) { return !styleId || e.style === styleId; });
      var order = (S.manifest.sections || []).map(function (s) { return s.id; });
      var groups = {};
      list.forEach(function (e) { (groups[e.section] = groups[e.section] || []).push(e); });
      el('view').innerHTML =
        '<h1>Contact sheet</h1>' +
        '<p class="lab">' + S.entries.length + ' entries · live frames mounted: ' +
        '<span id="mountcount">0</span></p>' +
        order.filter(function (id) { return groups[id]; }).map(function (id) {
          return '<h2 id="sec-' + id + '">' + S.esc(S.sectionOf(id).title) + '</h2><div class="grid">' +
            groups[id].map(card).join('') + '</div>';
        }).join('');
      S.observePreviews(el('view'));
    },

    /* A list view is a function of the filter, so it re-renders when the
       filter changes — which is also what fills the sheet in as the entry
       scripts land during boot. */
    onFilter: function () {
      if (!S.current && document.getElementById('view')) S.views.renderSheet(S.currentStyle);
    }
  };

  function card(e) {
    return '<a class="card" href="#/' + S.esc(e.id) + '">' +
      '<span class="prev" data-id="' + S.esc(e.id) + '"><span class="queued">' +
      S.esc(e.index || e.id) + '</span></span>' +
      '<span class="cap">' + S.esc(e.title) + '</span></a>';
  }
})();
