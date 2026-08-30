/* ============================================================================
   shell.js — the shared shell for the learn/ tools.  CORE.
   Transport · state · router · index rail · keyboard · chrome.

   Everything that draws an entry, a contact sheet or a style page lives in
   views.js, which registers itself as Shell.views. This file is the part that
   would still be true if the pages looked completely different.

   TRANSPORT, and why it is what it is
   -----------------------------------
   Under file:// exactly one mechanism loads external data into a page: a
   classic <script src>. fetch, XHR, import() and type="module" all fail
   (research/03-deploy-constraints.md, measured). Julia's checkout is opened by
   double-click, so there is no fetch anywhere in this file and there never
   will be. Data arrives by self-registration:

     manifest.js         →  Shell.registerManifest({...})
     content/<id>/entry.js →  Shell.registerEntry({...})
     adapters/glsl.js    →  Shell.registerAdapter('glsl', {...})

   The manifest names its entries in order. An entry named as a string is
   loaded from content/<id>/entry.js by an injected classic script; an entry
   given inline as an object needs no second file. Both forms may be mixed,
   and an inline object may still be completed by an entry.js of the same id —
   the registered object wins field by field.

   No framework, no build step, no minification. View source is the docs.
   ============================================================================ */
(function () {
  'use strict';

  var S = {
    version: 1,

    /* ---- data ---- */
    manifest: null,
    entries: [],            // roster, in manifest order (objects, possibly partial)
    byId: Object.create(null),
    routes: null,           // Map id -> entry. The validated hash target set.
    pending: Object.create(null),   // id -> true while its script is in flight
    failed: Object.create(null),    // id -> true when its script 404'd

    /* ---- view state ---- */
    filtered: [],
    current: null,
    currentExample: null,
    q: '',
    status: null,           // Set of active status filters; empty = all
    kfocus: -1,
    booted: false,
    wantRoute: null,        // a route waiting on a script that has not landed

    /* ---- seams ---- */
    adapters: Object.create(null),
    adapter: null,          // the adapter mounted right now
    views: null,            // set by views.js
    io: null,               // section observer for the contact sheet
    previewIO: null
  };
  window.Shell = S;

  /* ==========================================================================
     1. Registration — the three entry points every data file uses
     ========================================================================== */

  S.registerAdapter = function (name, adapter) {
    S.adapters[name] = adapter;
  };

  S.registerManifest = function (m) {
    if (S.manifest) { warn('a second manifest was registered; ignoring it'); return; }
    S.manifest = m;
    S.status = new Set();
    whenDOM(function () { boot(m); });
  };

  /* An entry file calls this once. It may arrive before or after boot — both
     orders happen for real (a cached script can run before DOMContentLoaded),
     so nothing here assumes the DOM exists. */
  S.registerEntry = function (e) {
    if (!e || !e.id) { warn('registerEntry called without an id'); return; }
    var seat = S.byId[e.id];
    if (!seat) {
      // An entry that is not in the manifest is not reachable. Say so loudly
      // in the console rather than silently half-working.
      warn('entry "' + e.id + '" registered but is not listed in the manifest');
      return;
    }
    for (var k in e) if (Object.prototype.hasOwnProperty.call(e, k)) seat[k] = e[k];
    seat.__loaded = true;
    delete S.pending[e.id];
    schedule();
  };

  /* ==========================================================================
     2. Boot
     ========================================================================== */

  function boot(m) {
    var body = document.body;
    body.setAttribute('data-mode', m.mode || 'course');
    if (!body.hasAttribute('data-index')) body.setAttribute('data-index', 'open');
    if (!body.hasAttribute('data-apparatus')) body.setAttribute('data-apparatus', 'closed');
    if (matchReduced()) body.setAttribute('data-reduced-motion', 'true');

    buildRoster(m);
    S.adapter = null;

    if (S.views && S.views.buildChrome) S.views.buildChrome();
    buildRail();
    bindKeys();
    bindDrawerRule();

    window.addEventListener('hashchange', function () { S.route(); });
    S.booted = true;
    injectEntryScripts();
    S.route();
  }

  function buildRoster(m) {
    var list = (m.entries || []).map(function (item, i) {
      var e = (typeof item === 'string') ? { id: item, __needsScript: true }
                                         : shallow(item);
      if (e.order == null) e.order = (i + 1) * 10;
      if (!e.path) e.path = 'content/' + e.id + '/';
      return e;
    });
    // `order` is the sort key and `index` is the label — they are different
    // fields on purpose (a lens can display "E6" and sort third).
    list.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

    S.entries = list;
    S.byId = Object.create(null);
    S.routes = new Map();
    list.forEach(function (e) {
      if (S.byId[e.id]) warn('duplicate entry id "' + e.id + '" in the manifest');
      S.byId[e.id] = e;
      S.routes.set(e.id, e);          // the validated hash target set
    });
    S.filtered = list.slice();
  }

  /* One injected classic <script> per entry that declares no inline content.
     They are tiny and local; the rail fills in as they land and the router
     re-runs itself when the entry it is waiting for arrives. */
  function injectEntryScripts() {
    /* CK8 · THE ROUTED ENTRY GOES FIRST. `async = false` makes these execute in
       injection order, so before this the chapter you actually asked for waited
       behind every chapter ahead of it in the manifest: a deep link to W1, the
       twenty-third of twenty-six, was interactive at 535–614 ms against PLAN
       §7.10's 400 ms budget, while chapter 02 was at 129 ms. Hoisting the one
       script the hash names costs nothing — every entry declares an explicit
       numeric `order`, so the sort no longer depends on registration order —
       and the rest still stream in behind it to fill the rail. */
    var want = null;
    var p = String(location.hash || '').replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean)[0];
    if (p && p !== 'index' && p !== 'style') { try { want = decodeURIComponent(p); } catch (err) { want = p; } }

    var list = S.entries.filter(function (e) { return e.__needsScript && !e.__loaded; });
    if (want) {
      list.sort(function (a, b) { return (b.id === want) - (a.id === want); });
    }
    list.forEach(function (e) {
      var src = (e.path || ('content/' + e.id + '/')) + (e.entry || 'entry.js');
      S.pending[e.id] = true;
      var s = document.createElement('script');
      s.src = src;
      s.async = false;                // execute in injection order
      s.onerror = function () {
        delete S.pending[e.id];
        S.failed[e.id] = true;
        warn('could not load ' + src);
        schedule();
      };
      document.head.appendChild(s);
    });
  }

  /* Batch the re-render: twenty-seven scripts landing in one tick should cost
     one rail render, not twenty-seven. */
  var tick = null;
  function schedule() {
    if (tick) return;
    tick = setTimeout(function () {
      tick = null;
      if (!S.booted) return;
      // applyFilter re-renders the rail and, through views.onFilter, any list
      // view that is on screen — so a sheet drawn before its entries landed
      // fills itself in as they arrive rather than staying empty.
      applyFilter();
      if (S.wantRoute) { var r = S.wantRoute; S.wantRoute = null; S.route(r); }
    }, 0);
  }

  /* ==========================================================================
     3. Router
       #/                     landing  (course → first entry; catalogue → sheet)
       #/index                contact sheet, explicitly
       #/<entry>              entry
       #/<entry>/<example>    entry + example
       #/style/<id>           style page
     plus a hash query string: ?q=<filter> · ?src=<base64> · ?edited=1
     An unknown hash lands on the landing route, silently and without a throw.
     ========================================================================== */

  function parseHash(h) {
    h = String(h == null ? location.hash : h).replace(/^#\/?/, '');
    var query = {}, qi = h.indexOf('?');
    if (qi >= 0) {
      h.slice(qi + 1).split('&').forEach(function (kv) {
        if (!kv) return;
        var p = kv.split('=');
        try { query[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || '').replace(/\+/g, ' ')); }
        catch (err) { /* a malformed escape is not worth a broken page */ }
      });
      h = h.slice(0, qi);
    }
    var parts = h.split('/').filter(Boolean).map(function (p) {
      try { return decodeURIComponent(p); } catch (err) { return p; }
    });
    return { parts: parts, query: query };
  }
  S.parseHash = parseHash;

  S.landing = function () {
    /* ck-e0: the encyclopedia's front door is the technique index. Every
       other tool keeps its old landing rule (course = first entry, catalogue
       = contact sheet). The check is on manifest.id rather than mode so a
       catalogue tool that is not the encyclopedia is unaffected. */
    if (S.manifest && S.manifest.id === 'encyclopedia') return '#/techniques';
    if (S.manifest && S.manifest.mode === 'catalogue') return '#/index';
    return S.entries.length ? '#/' + S.entries[0].id : '#/index';
  };

  /* The seven new entity/facet routes the encyclopedia adds at ck-e0. Each
     one names an entity kind or a saved query; the shell resolves it against
     the views layer, which renders "empty on purpose" if nothing has been
     filed under it yet. */
  var ENCYCLOPEDIA_ROUTES = {
    techniques:   { kind: 'entity',  filter: function (e) { return e.entity === 'technique'; } },
    atoms:        { kind: 'entity',  filter: function (e) { return e.entity === 'atom'; } },
    styles:       { kind: 'styles',  filter: null },       /* the manifest's styles[] */
    explorations: { kind: 'entity',  filter: function (e) { return !e.entity || e.entity === 'exploration'; } },
    sound:        { kind: 'facet',   filter: function (e) { return e.lane === 'audio' || e.section === 'sound'; } },
    symptoms:     { kind: 'facet',   filter: function (e) { return (e.related || []).some(function (r) { return r.relation === 'overuses'; }); } },
    unfiled:      { kind: 'facet',   filter: function (e) { return e.status === 'unsorted' || e.section === 'unfiled'; } },
    skills:       { kind: 'skills',  filter: null },
    couplings:    { kind: 'facet',   filter: function (e) { return e.entity === 'coupling' || Array.isArray(e.consequences); } }
  };
  S.ENCYCLOPEDIA_ROUTES = ENCYCLOPEDIA_ROUTES;

  S.go = function (entryId, exampleId, keep) {
    var h = '#/' + entryId + (exampleId ? '/' + exampleId : '');
    if (keep && S.q) h += '?q=' + encodeURIComponent(S.q);
    if (location.hash === h) S.route(); else location.hash = h;
  };

  S.route = function (forced) {
    var r = parseHash(forced);
    var p = r.parts;

    // a filter carried in the URL steers the rail before anything renders
    if (r.query.q != null && r.query.q !== S.q) {
      S.q = r.query.q;
      var box = document.getElementById('find');
      if (box) box.value = S.q;
      applyFilter();
    }

    if (document.body.getAttribute('data-index') === 'open' && isPhone()) closeSheet();

    if (!p.length) return replaceWith(S.landing());

    /* Explicit redirects, declared in the encyclopedia manifest. The whole
       hash path (without leading #/) is the key. This is how old links to
       #/13-fbm or #/kls01-ki-landscape resolve to their new home. */
    var reds = (S.manifest && S.manifest.redirects) || null;
    if (reds) {
      var key = p.join('/');
      if (reds[key]) return replaceWith(reds[key]);
      if (reds[p[0]]) return replaceWith(reds[p[0]]);
    }

    if (p[0] === 'index') return S.views && S.views.renderSheet(null, r.query);
    if (p[0] === 'style') {
      var st = styleById(p[1]);
      if (!st) return replaceWith(S.landing());
      return S.views && S.views.renderStyle(st, r.query);
    }

    /* ck-e0 encyclopedia routes. Each renders through views if the view
       exists; otherwise fall through to the entry-lookup, which handles
       #/entry/<id> and #/technique/<id> alike by treating the second segment
       as the id. */
    if (ENCYCLOPEDIA_ROUTES[p[0]]) {
      var route = ENCYCLOPEDIA_ROUTES[p[0]];
      if (S.views && S.views.renderRoute) return S.views.renderRoute(p[0], route, r.query);
      /* Fallback: filtered sheet. Every view above degrades to a contact
         sheet — a tool without views.renderRoute still shows something. */
      return S.views && S.views.renderSheet(route.filter, r.query);
    }
    /* ck-e8 · #/skill/<id> — the per-skill page. Kept singular to match the
       other entity prefixes (#/technique/<id>, #/atom/<id>). Falls through to
       the landing route if the id is not a declared skill or if the views
       layer does not know how to render skill pages. */
    if (p[0] === 'skill' && p[1]) {
      var skill = ((S.manifest && S.manifest.skills) || [])
        .filter(function (s) { return s.id === p[1]; })[0];
      if (!skill) return replaceWith(S.landing());
      if (S.views && S.views.renderSkill) return S.views.renderSkill(skill, r.query);
      return replaceWith(S.landing());
    }
    /* Explicit entity prefixes: #/technique/<id>, #/atom/<id>, #/entry/<id>
       all resolve to the same entry lookup — the entity's page template is
       chosen by its `entity` field at render time. */
    if (p[0] === 'technique' || p[0] === 'atom' || p[0] === 'entry' || p[0] === 'coupling') {
      var eByPrefix = S.routes.get(p[1]);
      if (!eByPrefix) return replaceWith(S.landing());
      if (!eByPrefix.__loaded && S.pending[eByPrefix.id]) {
        S.wantRoute = location.hash;
        if (S.views && S.views.renderLoading) S.views.renderLoading(eByPrefix);
        return;
      }
      if (!eByPrefix.__loaded && S.failed[eByPrefix.id]) {
        return S.views && S.views.renderMissing(eByPrefix.id);
      }
      return S.views && S.views.renderEntry(eByPrefix, p[2], r.query);
    }

    var e = S.routes.get(p[0]);
    if (!e) return replaceWith(S.landing());          // validated map, no throw

    if (!e.__loaded && S.pending[e.id]) {             // its script is in flight
      S.wantRoute = location.hash;
      if (S.views && S.views.renderLoading) S.views.renderLoading(e);
      return;
    }
    if (!e.__loaded && S.failed[e.id]) {
      return S.views && S.views.renderMissing(e.id);
    }
    return S.views && S.views.renderEntry(e, p[1], r.query);
  };

  function replaceWith(hash) {
    if (location.hash === hash) { // already there and it did not resolve
      if (S.views && S.views.renderSheet) S.views.renderSheet(null, {});
      return;
    }
    history.replaceState(null, '', stripHash(location.href) + hash);
    S.route();
  }
  function stripHash(href) { return href.split('#')[0]; }

  function styleById(id) {
    return ((S.manifest && S.manifest.styles) || []).filter(function (s) { return s.id === id; })[0] || null;
  }
  S.styleById = styleById;

  S.sectionOf = function (id) {
    return ((S.manifest && S.manifest.sections) || []).filter(function (s) { return s.id === id; })[0] ||
           { id: id, title: id || 'Unfiled' };
  };

  /* ==========================================================================
     4. Index rail — search, status chips, the spine
     ========================================================================== */

  function buildRail() {
    var find = document.getElementById('find');
    if (find) {
      find.placeholder = S.manifest.mode === 'catalogue'
        ? 'Search lenses, tags, references…'
        : 'Search chapters, tags, sources…';
      find.addEventListener('input', function () {
        S.q = find.value.trim();
        applyFilter();
        writeQuery();
      });
      find.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') { find.value = ''; S.q = ''; applyFilter(); writeQuery(); find.blur(); }
        if (ev.key === 'Enter') {
          ev.preventDefault();
          var pick = S.filtered[Math.max(0, S.kfocus)];
          if (pick) S.go(pick.id, null, true);
        }
        if (ev.key === 'ArrowDown') { ev.preventDefault(); moveFocus(1); }
        if (ev.key === 'ArrowUp') { ev.preventDefault(); moveFocus(-1); }
      });
    }
    buildChips();
    applyFilter();
  }

  /* Status is editorial standing, not build state. The chips are a row, never
     a panel — and they are marks plus a word, never four colours.
     The row is rebuilt whenever the set of statuses in the tool changes, which
     is how it fills in as the entry scripts land at boot. */
  var chipSig = '';
  function buildChips() {
    var box = document.getElementById('chips');
    if (!box) return;
    var seen = [];
    S.entries.forEach(function (e) {
      if (e.status && seen.indexOf(e.status) < 0) seen.push(e.status);
    });
    var ORDER = ['canonical', 'exploration', 'historical', 'known-failure'];
    seen.sort(function (a, b) { return ORDER.indexOf(a) - ORDER.indexOf(b); });
    var sig = seen.join(',');
    if (sig === chipSig) return;
    chipSig = sig;
    box.innerHTML = seen.map(function (s) {
      return '<button type="button" class="chip st" data-st="' + esc(s) + '" data-status="' + esc(s) +
             '" aria-pressed="true">' + esc(s.replace('-', ' ')) + '</button>';
    }).join('');
    box.querySelectorAll('.chip').forEach(function (c) {
      c.addEventListener('click', function () {
        var s = c.dataset.status;
        // pressed = visible. An empty exclusion set means "everything".
        if (S.status.has(s)) { S.status.delete(s); c.setAttribute('aria-pressed', 'true'); }
        else { S.status.add(s); c.setAttribute('aria-pressed', 'false'); }
        applyFilter();
      });
    });
  }

  function matches(e) {
    if (S.status.size && S.status.has(e.status)) return false;   // excluded
    if (!S.q) return true;
    var hay = [e.id, e.index, e.title, S.sectionOf(e.section).title, e.section,
               (e.tags || []).join(' '), (e.source && e.source.title) || '',
               e.style || '', e.lane || ''].join(' ').toLowerCase();
    return hay.indexOf(S.q.toLowerCase()) >= 0;
  }

  function applyFilter() {
    S.filtered = S.entries.filter(matches);
    S.kfocus = -1;
    buildChips();
    renderSpine();
    var count = document.getElementById('count');
    if (count) {
      var noun = S.manifest.mode === 'catalogue' ? 'lenses' : 'chapters';
      // Every count on the page derives from entries. Nothing is typed by hand;
      // that is what verifyManifests() enforces at deploy time.
      var extra = (S.manifest.styles || []).length
        ? ' · ' + S.manifest.styles.length + ' styles'
        : (function () {
            var n = S.entries.reduce(function (t, e) { return t + ((e.examples || []).length); }, 0);
            return n ? ' · ' + n + ' examples' : '';
          })();
      count.textContent = (S.filtered.length === S.entries.length)
        ? S.entries.length + ' ' + noun + extra
        : S.filtered.length + ' / ' + S.entries.length + ' ' + noun;
    }
    var pillN = document.querySelector('#pill .n');
    if (pillN) pillN.textContent = String(S.filtered.length);
    if (S.views && S.views.onFilter) S.views.onFilter();
  }
  S.applyFilter = applyFilter;

  function writeQuery() {
    var h = location.hash.split('?')[0] || S.landing();
    var qs = S.q ? '?q=' + encodeURIComponent(S.q) : '';
    history.replaceState(null, '', stripHash(location.href) + h + qs);
  }

  function renderSpine() {
    var spine = document.getElementById('spine');
    if (!spine) return;
    if (!S.filtered.length) {
      spine.innerHTML = '<li class="empty">Nothing matches.</li>';
      return;
    }
    var order = (S.manifest.sections || []).map(function (s) { return s.id; });
    var groups = Object.create(null);
    S.filtered.forEach(function (e) {
      (groups[e.section] = groups[e.section] || []).push(e);
    });
    Object.keys(groups).forEach(function (k) {
      if (order.indexOf(k) < 0) order.push(k);
    });

    var html = '';
    order.forEach(function (id) {
      var list = groups[id];
      if (!list) return;
      // CK8 · was <li role="presentation">, which axe grades a serious `list`
      // violation on every route: a <ul> may not have a direct child with a
      // presentational role. The divider stays an ordinary <li> — it IS in the
      // list — and the part that is a heading says so instead.
      html += '<li class="sec"><span role="heading" aria-level="3">' + esc(S.sectionOf(id).title) +
              '</span><span class="n">' + list.length + '</span></li>';
      html += list.map(entryRow).join('');
    });
    spine.innerHTML = html;

    spine.querySelectorAll('.ent').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        S.go(a.dataset.id, null, true);
      });
    });
    markCurrent();
  }

  function entryRow(e) {
    var st = (e.status && e.status !== 'canonical') ?
      '<span class="f" data-st="' + esc(e.status) + '" title="' + esc(e.status) + '"></span>' : '';
    var stub = e.stub ? '<span class="f" data-st="stub" title="stub"></span>' : '';
    return '<li><a class="ent" href="#/' + esc(e.id) + '" data-id="' + esc(e.id) + '">' +
      '<span class="n">' + esc(e.index || pad(e.order)) + '</span>' +
      '<span class="t">' + esc(e.title || e.id) + '</span>' + st + stub + '</a></li>';
  }

  /* CK8 · Element.scrollIntoView() sets Chromium's SEQUENTIAL FOCUS NAVIGATION
     STARTING POINT. Calling it on the current rail entry during boot therefore
     moved the start of the tab order into the middle of the index: the first
     Tab on a freshly loaded page landed on the SECOND chapter, and the skip
     link, the Index toggle, the two tool links, Edit, ? and the search box were
     unreachable going forwards. PLAN §7.5 asks for every control reachable by
     Tab in DOM order, so scrolling a scroller is done by writing its scrollTop
     / scrollLeft instead — same pixels, no effect on focus. */
  function reveal(el, axis) {
    if (!el) return;
    var box = el.parentNode;
    while (box && box !== document.body) {
      var s = getComputedStyle(box);
      var scrolls = axis === 'x'
        ? (/(auto|scroll)/.test(s.overflowX) && box.scrollWidth > box.clientWidth)
        : (/(auto|scroll)/.test(s.overflowY) && box.scrollHeight > box.clientHeight);
      if (scrolls) break;
      box = box.parentNode;
    }
    if (!box || box === document.body || !box.getBoundingClientRect) return;
    var r = el.getBoundingClientRect(), b = box.getBoundingClientRect();
    if (axis === 'x') {
      if (r.left < b.left) box.scrollLeft -= (b.left - r.left);
      else if (r.right > b.right) box.scrollLeft += (r.right - b.right);
    } else {
      if (r.top < b.top) box.scrollTop -= (b.top - r.top);
      else if (r.bottom > b.bottom) box.scrollTop += (r.bottom - b.bottom);
    }
  }
  S.reveal = reveal;

  function markCurrent() {
    document.querySelectorAll('.ent').forEach(function (a) {
      if (S.current && a.dataset.id === S.current.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    reveal(document.querySelector('.ent[aria-current="true"]'));
  }
  S.markCurrent = markCurrent;

  function moveFocus(d) {
    if (!S.filtered.length) return;
    S.kfocus = Math.max(0, Math.min(S.filtered.length - 1, S.kfocus + d));
    document.querySelectorAll('.ent.kfocus').forEach(function (n) { n.classList.remove('kfocus'); });
    var el = document.querySelector('.ent[data-id="' + cssId(S.filtered[S.kfocus].id) + '"]');
    if (el) { el.classList.add('kfocus'); reveal(el); }
  }

  /* ==========================================================================
     5. Chrome state — index, apparatus, phone sheet
     ========================================================================== */

  function isPhone() { return window.matchMedia('(max-width: 839px)').matches; }
  function isNarrow() { return window.matchMedia('(max-width: 1499px)').matches; }
  S.isPhone = isPhone;

  S.toggleIndex = function (force) {
    if (isPhone()) return toggleSheet(force);
    var open = document.body.getAttribute('data-index') !== 'closed';
    var next = (force === undefined) ? !open : force;
    document.body.setAttribute('data-index', next ? 'open' : 'closed');
    syncControls();
  };
  function toggleSheet(force) {
    var open = document.body.getAttribute('data-index') === 'open';
    var next = (force === undefined) ? !open : force;
    document.body.setAttribute('data-index', next ? 'open' : 'closed');
    syncControls();
    if (next) { var f = document.getElementById('find'); if (f) f.focus(); }
  }
  function closeSheet() { toggleSheet(false); }
  S.closeSheet = closeSheet;

  /* Below 1500 the apparatus and the index never both hold a track: editing is
     not browsing. The control has to say so, so we actually move the state
     rather than only hiding the rail in CSS. */
  var railBefore = null;
  S.toggleApparatus = function (force) {
    var open = document.body.getAttribute('data-apparatus') === 'open';
    var next = (force === undefined) ? !open : force;
    document.body.setAttribute('data-apparatus', next ? 'open' : 'closed');
    if (next && isNarrow() && !isPhone()) {
      railBefore = document.body.getAttribute('data-index');
      document.body.setAttribute('data-index', 'closed');
    } else if (!next && railBefore && !isPhone()) {
      document.body.setAttribute('data-index', railBefore);
      railBefore = null;
    }
    syncControls();
    if (next && S.adapter && S.adapter.onApparatusOpen) S.adapter.onApparatusOpen();
  };

  function bindDrawerRule() {
    var mq = window.matchMedia('(max-width: 1499px)');
    var onChange = function () {
      if (document.body.getAttribute('data-apparatus') === 'open' && mq.matches && !isPhone()) {
        if (railBefore === null) railBefore = document.body.getAttribute('data-index');
        document.body.setAttribute('data-index', 'closed');
        syncControls();
      }
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  function syncControls() {
    var ib = document.getElementById('idxbtn');
    if (ib) {
      var open = document.body.getAttribute('data-index') === 'open';
      ib.setAttribute('aria-pressed', String(open));
      ib.setAttribute('aria-expanded', String(open));
    }
    var eb = document.getElementById('edbtn');
    if (eb) eb.setAttribute('aria-pressed', String(document.body.getAttribute('data-apparatus') === 'open'));
  }
  S.syncControls = syncControls;

  /* ==========================================================================
     6. Keyboard — ONE central guard.
     The old tool guarded per handler (book-of-shaders/index.html:1071-1075),
     which is why Escape could not leave the textarea. Guard once, here.
     ========================================================================== */

  function typing(el) {
    return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ||
                    el.tagName === 'SELECT' || el.isContentEditable);
  }

  var gPending = false;
  function bindKeys() {
    window.addEventListener('keydown', function (ev) {
      var el = document.activeElement;

      // Escape is the one key that must work FROM inside a field: it is how
      // you leave the editor. Everything else is guarded below.
      if (ev.key === 'Escape') {
        var dlg = document.getElementById('help');
        if (dlg && dlg.open) { closeHelp(); return; }
        if (typing(el)) { el.blur(); return; }
        if (document.body.getAttribute('data-index') === 'open' && isPhone()) { closeSheet(); return; }
        if (document.body.getAttribute('data-apparatus') === 'open') { S.toggleApparatus(false); return; }
        if (S.q) { S.q = ''; var f = document.getElementById('find'); if (f) f.value = ''; applyFilter(); writeQuery(); }
        return;
      }

      if (typing(el) || ev.metaKey || ev.ctrlKey || ev.altKey) return;

      switch (ev.key) {
        case '/': ev.preventDefault(); focusSearch(); return;
        case '?': ev.preventDefault(); openHelp(); return;
        case 'e': ev.preventDefault(); S.toggleApparatus(); return;
        case 'g': gPending = true; setTimeout(function () { gPending = false; }, 700); return;
        case 'i':
          if (gPending) { gPending = false; location.hash = '#/index'; }
          return;
        case 'j': case 'ArrowDown': ev.preventDefault(); step(1); return;
        case 'k': case 'ArrowUp': ev.preventDefault(); step(-1); return;
        case 'ArrowRight': ev.preventDefault(); stepExample(1); return;
        case 'ArrowLeft': ev.preventDefault(); stepExample(-1); return;
        case ' ':
          if (S.adapter && S.adapter.toggleRun) { ev.preventDefault(); S.adapter.toggleRun(); }
          return;
      }
    });

    // Keys forwarded out of a lens iframe (fragment-boot.js), so the keyboard
    // model survives the isolation boundary.
    window.addEventListener('message', function (ev) {
      var d = ev.data;
      if (!d || d.__lens !== true || d.type !== 'key') return;
      if (d.key === '/') focusSearch();
      else if (d.key === '?') openHelp();
      else if (d.key === 'Escape') { if (document.body.getAttribute('data-apparatus') === 'open') S.toggleApparatus(false); }
    });
  }

  function focusSearch() {
    if (isPhone()) { if (document.body.getAttribute('data-index') !== 'open') toggleSheet(true); }
    else if (document.body.getAttribute('data-index') === 'closed') S.toggleIndex(true);
    var f = document.getElementById('find');
    if (f) { f.focus(); f.select(); }
  }
  S.focusSearch = focusSearch;

  /* j/k walk the FILTERED list. If a search shows 3 of 27, stepping must stay
     inside those 3 or the filter is a lie. */
  function step(d) {
    var list = S.filtered.length ? S.filtered : S.entries;
    if (!list.length) return;
    var i = S.current ? list.indexOf(S.current) : -1;
    var n = list[Math.max(0, Math.min(list.length - 1, i + d))];
    if (n && n !== S.current) S.go(n.id, null, true);
  }
  function stepExample(d) {
    var list = (S.current && S.current.examples) || [];
    if (!list.length) return step(d);
    var i = S.currentExample ? list.indexOf(S.currentExample) : 0;
    var n = list[i + d];
    if (n) S.go(S.current.id, n.id, true); else step(d);
  }

  /* ==========================================================================
     7. The shortcuts dialog — focus-trapped, and it gives focus back
     ========================================================================== */

  var helpReturn = null;
  function openHelp() {
    var dlg = document.getElementById('help');
    if (!dlg || dlg.open) return;
    helpReturn = document.activeElement;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    var first = dlg.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
    if (first) first.focus();
    dlg.addEventListener('keydown', trap);
    dlg.addEventListener('cancel', onCancel);
  }
  function onCancel(ev) { ev.preventDefault(); closeHelp(); }
  function closeHelp() {
    var dlg = document.getElementById('help');
    if (!dlg) return;
    dlg.removeEventListener('keydown', trap);
    dlg.removeEventListener('cancel', onCancel);
    if (dlg.close) dlg.close(); else dlg.removeAttribute('open');
    if (helpReturn && helpReturn.focus) helpReturn.focus();
    helpReturn = null;
  }
  function trap(ev) {
    if (ev.key !== 'Tab') return;
    var dlg = ev.currentTarget;
    var f = [].slice.call(dlg.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])'))
             .filter(function (n) { return n.offsetParent !== null || n === document.activeElement; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  }
  S.openHelp = openHelp;
  S.closeHelp = closeHelp;

  /* ==========================================================================
     8. Share links — the editor buffer is NOT written on every keystroke
     ========================================================================== */

  S.shareLink = function (code) {
    var base = stripHash(location.href);
    var hash = '#/' + (S.current ? S.current.id : '') +
               (S.currentExample ? '/' + S.currentExample.id : '');
    if (!code) return base + hash;
    return base + hash + '?src=' + encodeURIComponent(b64(code));
  };
  S.readSharedSource = function (query) {
    if (!query || !query.src) return null;
    try { return unb64(query.src); } catch (e) { return null; }
  };
  S.markEdited = function (on) {
    var h = location.hash.split('?')[0];
    history.replaceState(null, '', stripHash(location.href) + h + (on ? '?edited=1' : ''));
  };
  function b64(s) { return btoa(String.fromCharCode.apply(null, new TextEncoder().encode(s))); }
  function unb64(s) {
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  /* ==========================================================================
     9. Small shared utilities
     ========================================================================== */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function attr(s) { return esc(s); }
  function pad(n) { return String(n == null ? '' : n).padStart(2, '0'); }
  function cssId(s) { return String(s).replace(/["\\]/g, '\\$&'); }
  function shallow(o) { var r = {}; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) r[k] = o[k]; return r; }
  function warn(m) { if (window.console && console.warn) console.warn('[shell] ' + m); }
  function matchReduced() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function whenDOM(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }
  S.esc = esc; S.attr = attr; S.pad = pad; S.warn = warn;
  S.reduced = matchReduced;

  /* ==========================================================================
     ck-e8 · governedBy(entry) — the union of an entry's declared governed_by[]
     and the skills its shape implies.

     ck-e0 tagged only two of the fourteen skills on the corpus (composing-
     computational-material-systems and components-craft) because only those
     two were declared in a form the entries knew about. The rest were left as
     visibly empty pages on purpose, to be filed at ck-e8.

     Rather than edit 168 entry.js files by hand — half of which are one-line
     imports — the rules are declared once here and evaluated at render time.
     An entry.js may still assert an explicit governed_by[]; those wins. The
     rules only ADD. The output is de-duplicated and, when the manifest is
     available, filtered against known skill ids so a stale rule cannot smear
     an id the deploy would fail on.
     ========================================================================== */
  S.governedBy = function (e) {
    if (!e) return [];
    var out = [];
    var seen = Object.create(null);
    var add = function (id) {
      if (!id || seen[id]) return;
      seen[id] = true;
      out.push(id);
    };
    (e.governed_by || []).forEach(add);

    var section = e.section || '';
    var style = e.style || '';
    var lane = e.lane || '';
    var tags = (e.tags || []).map(String);
    var id = String(e.id || '').toLowerCase();
    var title = String(e.title || '').toLowerCase();
    var kind = e.kind || '';

    // AUDIO — every audio-lane entry
    if (lane === 'audio' || section === 'sound' ||
        ['voice','space','bus'].indexOf(kind) >= 0) add('composing-computational-sound-systems');

    // RISO / PRINT / PAPER lens → creative-hifi-frontend + canvas-design
    if (style === 'riso-xerox' || style === 'atmospheric' ||
        section === 'print-reproduction' ||
        /riso|paper|xerox|print|halftone/.test(tags.join(' ').toLowerCase())) {
      add('creative-hifi-frontend');
      add('canvas-design');
    }

    // TECHNICAL DOCUMENT style / dimensioned exploration / technical-doc atom
    if (style === 'technical-doc' || /instrument|typology|spec|dossier|drafting|dimension|blueprint/.test((id + ' ' + title + ' ' + tags.join(' ')).toLowerCase())) {
      add('technical-illustration');
    }

    // PATENT figure — very small overlap; only when the entry literally says so
    if (/patent|figure|callout|exploded/.test((id + ' ' + title).toLowerCase())) {
      add('patent-figure-drawing');
    }

    // ATOMS in the field/engine/texture kinds — the material rung
    if (e.entity === 'atom' && ['field','engine','texture','process','substrate','colour','mark'].indexOf(kind) >= 0) {
      add('composing-computational-material-systems');
    }

    // GENERATIVE FIELD / SHADER / p5-flavoured — algorithmic-art
    if (kind === 'field' || lane === 'glsl' || /p5|generative|shader|noise|fbm|cellular/.test((id + ' ' + title).toLowerCase())) {
      add('composing-computational-material-systems');
      // algorithmic-art only when the piece reads as p5-style algorithm rather than a chapter
      if (/p5|particle|flow[- ]?field|algorithmic/.test((id + ' ' + title + ' ' + tags.join(' ')).toLowerCase()) ||
          (kind === 'field' && e.entity === 'atom')) {
        add('algorithmic-art');
      }
    }

    // Ki-brand entries
    if (/^ki-|^kls-|-ki$/.test(id) || /\bki\b/.test(title) ||
        /ki-landscape|ki brand|ki brief/.test(title)) {
      add('ki-brief');
    }

    // Chart/plot atoms → dataviz
    if (/chart|plot|dashboard|meter|kpi|axis|legend/.test((id + ' ' + title).toLowerCase())) {
      add('dataviz');
    }

    // Sell-sheet-adjacent
    if (/sell[- ]?sheet|line[- ]?sheet|spec[- ]?sheet|stock/i.test(id + ' ' + title + ' ' + tags.join(' '))) {
      add('sell-sheet');
    }

    // Ledger note: components-craft was ck-e1's blanket for lenses; keep it
    // where declared, no new inferences here (avoid smearing).

    // Filter against manifest.skills[] so a rule that names a skill the
    // manifest does not carry does not fire.
    if (S.manifest && S.manifest.skills) {
      var known = Object.create(null);
      S.manifest.skills.forEach(function (s) { known[s.id] = true; });
      out = out.filter(function (id) { return known[id]; });
    }
    return out;
  };

  /* Inverse: entries that a given skill governs. Every UI that lists a
     skill's instances uses this so the rule set stays one place. */
  S.entriesGovernedBy = function (sid) {
    return S.entries.filter(function (e) { return S.governedBy(e).indexOf(sid) >= 0; });
  };

  /* The adapter for a given entry/example. The lane is per entry and per
     example, not per tool: the best order-dependence example in the corpus is
     Canvas2D and the best coupling example is GLSL, and they belong in the
     same chapter. */
  S.adapterFor = function (entry, example) {
    var lane = (example && example.lane) || (entry && entry.lane) ||
               (S.manifest.stage && S.manifest.stage.adapter) || 'glsl';
    var a = S.adapters[lane];
    if (!a) { warn('no adapter registered for lane "' + lane + '"'); return null; }
    a.__lane = lane;
    return a;
  };

  S.mountAdapter = function (opts) {
    if (S.adapter && S.adapter.unmount) { try { S.adapter.unmount(); } catch (e) { warn(String(e)); } }
    S.adapter = S.adapterFor(opts.entry, opts.example);
    if (S.adapter && S.adapter.mount) S.adapter.mount(opts);
  };
  S.unmountAdapter = function () {
    if (S.adapter && S.adapter.unmount) { try { S.adapter.unmount(); } catch (e) { warn(String(e)); } }
    S.adapter = null;
  };

  /* ==========================================================================
     10. Contact-sheet preview observation
     The mount/evict POLICY lives in the adapter (it is the thing that knows
     what a frame costs). The shell owns only the trigger: 200px of approach,
     mount on enter, unmount on exit. Both halves are required — mount on
     approach without unmount on exit is how a sheet accumulates twenty live
     frames at 390 and never releases one.
     ========================================================================== */

  S.observePreviews = function (root) {
    S.unobservePreviews();
    if (!root) return;
    var cards = root.querySelectorAll('.prev[data-id]');
    if (!cards.length) return;
    S.previewIO = new IntersectionObserver(function (rows) {
      rows.forEach(function (r) {
        var e = S.byId[r.target.dataset.id];
        if (!e) return;
        var a = S.adapterFor(e, null);
        if (!a || !a.preview) return;
        a.preview(r.target, e, r.isIntersecting);
      });
    }, { rootMargin: '200px 0px' });
    cards.forEach(function (c) { S.previewIO.observe(c); });
  };

  S.unobservePreviews = function () {
    if (S.previewIO) { S.previewIO.disconnect(); S.previewIO = null; }
    // release anything still mounted from the sheet we are leaving
    Object.keys(S.adapters).forEach(function (k) {
      var a = S.adapters[k];
      if (a && a.preview && a.unmount && a.liveCount && a.liveCount()) a.unmount();
    });
  };

  /* Wire the fixed chrome controls that exist in every tool's index.html. */
  whenDOM(function () {
    var ib = document.getElementById('idxbtn');
    if (ib) ib.addEventListener('click', function () { S.toggleIndex(); });
    var eb = document.getElementById('edbtn');
    if (eb) eb.addEventListener('click', function () { S.toggleApparatus(); });
    var hb = document.getElementById('helpbtn');
    if (hb) hb.addEventListener('click', function () { openHelp(); });
    var hc = document.getElementById('helpclose');
    if (hc) hc.addEventListener('click', function () { closeHelp(); });
    var pill = document.getElementById('pill');
    if (pill) pill.addEventListener('click', function () { toggleSheet(); });
    // outside click closes the phone sheet — the mm-menu behaviour
    document.addEventListener('click', function (ev) {
      if (!isPhone()) return;
      if (document.body.getAttribute('data-index') !== 'open') return;
      if (ev.target.closest('.rail') || ev.target.closest('#pill') || ev.target.closest('#idxbtn')) return;
      closeSheet();
    });
  });
})();
