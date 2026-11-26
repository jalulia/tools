/* library/library.js: draws the page from window.LIBRARY (catalog.js).
   A classic script. No modules, no network; opens from file://. Counts come from the catalog. */
(function () {
  'use strict';
  var L = window.LIBRARY;
  var $lib = document.getElementById('lib'), $rail = document.getElementById('rail'), $views = document.getElementById('views'),
      $q = document.getElementById('q'), $drawer = document.getElementById('drawer'), $frame = document.getElementById('frame'), $tip = document.getElementById('tip');
  if (!L || !$lib) return;

  /* ---------------------------------------------------------------- index */
  var R = L.records, byId = {}, byAcc = {}, COL = {}, TECH = {}, ATOM = {}, SEE = {}, IN = {}, GROUP = {};
  L.collections.forEach(function (c, i) { c._i = i; COL[c.id] = c; });
  L.authority.techniques.forEach(function (t) { TECH[t.key] = t; });
  L.authority.atoms.forEach(function (a) { ATOM[a.key] = a; });
  R.forEach(function (r, i) { r._i = i; byId[r.id] = r; byAcc[r.acc] = r; if (r.pic_group) (GROUP[r.pic_group] = GROUP[r.pic_group] || []).push(r); });
  L.authority.see_also.links.forEach(function (l) {
    (SEE[l.a] = SEE[l.a] || []).push({ to: l.b, relation: l.relation, by: l.by, basis: l.basis });
    (SEE[l.b] = SEE[l.b] || []).push({ to: l.a, relation: l.relation, by: l.by, basis: l.basis });
  });
  R.forEach(function (r) { (r.rel || []).forEach(function (x) { if (byId[x.to]) (IN[x.to] = IN[x.to] || []).push({ type: x.type, from: r.id }); }); });
  // A work is drawn once. Its versions and parts are records too; they are listed under it and in the Ledger.
  var WORKS = R.filter(function (r) { return !r.role; });
  function members(r, k) { return (r[k] || []).map(function (id) { return byId[id]; }).filter(Boolean); }
  R.forEach(function (r) {
    var names = (r.techniques || []).map(function (k) { return TECH[k] ? TECH[k].id + ' ' + TECH[k].name : k; });
    r._hay = [r.acc, r.call, r.title, r.sub, r.kind, r.atom_kind, COL[r.collection].title, COL[r.collection].code, r.section_title, r.status, r.lane, r.layer, r.style,
      (r.tags || []).join(' '), names.join(' '), (r.atoms || []).join(' '), r.provenance && r.provenance.title, r.id].join(' ').toLowerCase();
  });
  WORKS.forEach(function (w) { members(w, 'versions').concat(members(w, 'parts')).forEach(function (m) { w._hay += ' ' + [m.acc, m.call, m.title].join(' ').toLowerCase(); }); });

  /* The CMS (library/cms.js, docs/CMS.md): projects down the left, three kinds, archived and private records. */
  window.__R_ALL = R;
  var CMSD = L.cms || { projects: [], removed: [], counts: {} };
  var PROJ = {}, PROJ_IDS = []; CMSD.projects.forEach(function (p) { PROJ[p.id] = p; PROJ_IDS.push(p.id); });
  var KIND3 = ['technique', 'example', 'template'], KIND3_LABEL = { technique: 'Techniques', example: 'Examples', template: 'Templates' };
  var ED = { on: false, unlocked: !!(window.LibCMS && window.LibCMS.token()), archive: null, sel: {}, busy: '', status: '', confirm: null, removed: CMSD.removed.slice() };
  try { ED.shared = localStorage.getItem('tools.view') === 'shared'; } catch (err) {}
  function mine() { return ED.unlocked && !ED.shared; }
  function visible(r) { return !r._gone && (r.visibility !== 'private' || mine()); }
  var KINDS = ['technique', 'atom', 'exploration', 'coupling', 'study', 'template', 'instrument', 'document', 'plate'].filter(function (k) { return (k !== 'document' && k !== 'plate') || R.some(function (r) { return r.kind === k; }); });
  var STATUSES = ['canonical', 'exploration', 'proposed', 'unsorted', 'known-failure', 'historical', ''];
  var ACCESS = ['public', 'staged', 'local', 'private'].filter(function (a) { return a !== 'private' || R.some(function (r) { return r.access === 'private'; }); });
  var LANES = []; R.forEach(function (r) { if (r.lane && LANES.indexOf(r.lane) < 0) LANES.push(r.lane); }); LANES.sort();
  var VIEWS = [['galleries', 'Galleries'], ['plates', 'Plates'], ['shelves', 'Shelves'], ['techniques', 'Techniques'], ['atoms', 'Atoms'], ['ledger', 'Ledger'], ['audit', 'Audit']];
  var FACETS = [
    { k: 'project', title: 'Project', values: PROJ_IDS, label: function (v) { return PROJ[v] ? PROJ[v].title : v; }, mark: function () { return ''; } },
    { k: 'kind3', title: 'Kind', values: KIND3, label: function (v) { return KIND3_LABEL[v]; }, mark: function () { return ''; }, tip: function (v) { return (L.vocabulary.kind3 || {})[v]; } },
    { k: 'kind', title: 'Kind (detail)', values: KINDS, label: cap, mark: function (v) { return glyph(v, 'canonical'); }, tip: function (v) { return L.vocabulary.kind[v]; } },
    { k: 'collection', title: 'Collection', values: L.collections.map(function (c) { return c.id; }), label: function (v) { return COL[v].title; }, mark: function (v) { return '<span class="cd">' + COL[v].code + '</span>'; }, tip: function (v) { return COL[v].note; } },
    { k: 'status', title: 'Status', values: STATUSES, label: function (v) { return v ? cap(v.replace('-', ' ')) : 'No status'; }, mark: function (v) { return glyph('study', v); }, tip: function (v) { return L.vocabulary.status[v]; } },
    { k: 'access', title: 'Access', values: ACCESS, label: cap, mark: function (v) { return glyph('study', '', v); }, tip: function (v) { return L.vocabulary.access[v]; } },
    { k: 'family', title: 'Family', values: Object.keys(L.vocabulary.family || {}), label: function (v) { return cap(v.replace(/-/g, ' ')); }, mark: function () { return ''; }, tip: function (v) { return L.vocabulary.family[v]; } },
    { k: 'lane', title: 'Lane', values: LANES, label: function (v) { return v; }, mark: function () { return ''; } }
  ];
  var SCHEME_LABEL = { enc: 'ENC', 'enc.read': 'ENC·R', tt: 'TT', st: 'ST', hld: 'HLD' };
  function noF() { var o = {}; FACETS.forEach(function (F) { o[F.k] = []; }); return o; }
  var NOFILTER = noF();

  /* ---------------------------------------------------------------- state */
  var S = { view: 'plates', q: '', f: noF(), d: 's', sort: 'new', r: null, term: null, scheme: '', tsort: 'n', ls: 'acc', ld: 1, open: {} };
  var LIST = R;   // the records the drawer pages through
  var MEM = null; // the route, kept here when the host does not let the page write its own address
  var BASE = L.base || '../', PREVIEW = !!L.preview;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  function phone() { return window.innerWidth <= 720; }

  function parse(from) {
    var h = (from != null ? from : MEM != null ? MEM : location.hash).replace(/^#\/?/, ''), i = h.indexOf('?');
    var path = (i < 0 ? h : h.slice(0, i)).split('/'), qs = i < 0 ? '' : h.slice(i + 1), p = {};
    qs.split('&').forEach(function (kv) { if (!kv) return; var j = kv.indexOf('='); p[decodeURIComponent(j < 0 ? kv : kv.slice(0, j))] = j < 0 ? '' : decodeURIComponent(kv.slice(j + 1)); });
    S.view = VIEWS.some(function (v) { return v[0] === path[0]; }) ? path[0] : 'plates';
    S.term = path[1] ? decodeURIComponent(path.slice(1).join('/')) : null;
    S.q = p.q || '';
    FACETS.forEach(function (F) { S.f[F.k] = p[F.k] != null ? p[F.k].split(',').map(function (v) { return v === '-' ? '' : v; }).filter(function (v) { return F.values.indexOf(v) >= 0; }) : []; });
    S.d = p.d === 'm' ? 'm' : p.d === 't' ? 't' : 's';
    S.sort = ['new', 'acc', 'title', 'modified', 'shelf'].indexOf(p.sort) >= 0 ? p.sort : 'new';
    S.scheme = p.scheme || '';
    S.tsort = p.ts === 'az' ? 'az' : 'n';
    S.r = p.r && byAcc[p.r] ? p.r : null;
  }
  function hash(over) {
    var o = {}, k; for (k in S) o[k] = S[k]; for (k in (over || {})) o[k] = over[k];
    var qs = [];
    if (o.q) qs.push('q=' + encodeURIComponent(o.q));
    FACETS.forEach(function (F) { var v = o.f[F.k]; if (v && v.length) qs.push(F.k + '=' + v.map(function (x) { return x === '' ? '-' : encodeURIComponent(x); }).join(',')); });
    if (o.d === 'm' || o.d === 't') qs.push('d=' + o.d);
    if (o.sort !== 'new') qs.push('sort=' + o.sort);
    if (o.scheme) qs.push('scheme=' + encodeURIComponent(o.scheme));
    if (o.tsort === 'az') qs.push('ts=az');
    if (o.r) qs.push('r=' + o.r);
    return '#/' + o.view + (o.term ? '/' + encodeURIComponent(o.term) : '') + (qs.length ? '?' + qs.join('&') : '');
  }
  function go(over, replace) {
    var before = S.view, onlyR = over && Object.keys(over).length === 1 && 'r' in over;
    for (var k in over) S[k] = over[k];
    setHash(hash(), replace);
    if (onlyR) { syncDrawer(); markCurrent(); return; }
    render();
    if (S.view !== before) window.scrollTo(0, 0);
  }
  function setHash(h, replace) {
    try { history[replace ? 'replaceState' : 'pushState'](null, '', h); MEM = null; } catch (err) { MEM = h; }
  }

  /* ---------------------------------------------------------------- helpers */
  function e(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function recHref(r) { return hash({ r: r.acc }); }
  function label(r) { return (r.call ? r.call + ' · ' : '') + r.title; }

  /* A shape is a kind. Its fill is a status. A --flag outline is work that is not live. */
  function glyph(kind, status, access) {
    var stroke = access && access !== 'public' ? 'var(--flag)' : 'currentColor', fill = 'none', sw = 1.3, dash = '', extra = '', half = false;
    if (status === 'canonical') fill = 'currentColor';
    else if (status === 'exploration') half = true;
    else if (status === 'proposed') extra = '<circle cx="10.3" cy="1.7" r="1.7" style="fill:var(--flag)"/>';
    else if (status === 'unsorted') { if (stroke === 'currentColor') stroke = '#A9A9AD'; sw = 1; }
    else if (status === 'known-failure') { fill = 'currentColor'; extra = '<path d="M2.6 9.4L9.4 2.6" style="stroke:var(--bg)" stroke-width="1.5"/>'; }
    else if (status === 'historical') dash = ' stroke-dasharray="1.7 1.5"';
    var geo = {
      technique: ['<path d="M6 1.5L10.9 10.5H1.1Z"'],
      atom: ['<circle cx="6" cy="6" r="4.3"'],
      exploration: ['<path d="M6 1.1L10.9 6L6 10.9L1.1 6Z"'],
      coupling: ['<circle cx="4.3" cy="6" r="3.1"', '<circle cx="7.7" cy="6" r="3.1"'],
      study: ['<rect x="1.7" y="1.7" width="8.6" height="8.6"'],
      template: ['<rect x="1" y="3.2" width="10" height="5.6"'],
      instrument: ['<path d="M4.5 1.3h3v3.2h3.2v3H7.5v3.2h-3V7.5H1.3v-3h3.2z"'],
      document: ['<path d="M2.7 1.2h4.6l2 2v7.6H2.7z"'],
      plate: ['<rect x="1.2" y="2.4" width="9.6" height="7.2"', '<rect x="3.4" y="4.4" width="5.2" height="3.2"']
    }[kind] || ['<rect x="1.7" y="1.7" width="8.6" height="8.6"'];
    var s = geo.map(function (g) { return g + ' style="fill:' + fill + ';stroke:' + stroke + '" stroke-width="' + sw + '"' + dash + '/>'; }).join('');
    if (half) s += '<g clip-path="url(#g-half)">' + geo.map(function (g) { return g + ' style="fill:currentColor"/>'; }).join('') + '</g>';
    return '<svg class="sw" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">' + s + extra + '</svg>';
  }

  /* A picture, whole. --ar is its shape; --nat is the widest it may be drawn without enlarging its pixels. */
  function shape(r) { var ar = r.thumb && r.thumb_w ? r.thumb_w / r.thumb_h : 4 / 3; return Math.max(.5, Math.min(3.2, ar)); }
  function pic(r, sizes, quiet) {
    if (!r.thumb) return '<span class="fr none" style="--ar:1.3333">' + (quiet ? '' : '<i>' + e(r.no_pic ? r.no_pic.label : 'no picture') + '</i>') + '</span>';
    var lay = shape(r), exact = r.thumb_w && Math.abs(lay - r.thumb_w / r.thumb_h) < .001, big = r.thumb_2x_w || r.thumb_w;
    return '<span class="fr' + (exact ? '' : ' fit') + '" style="--ar:' + lay.toFixed(4) + (big ? ';--nat:' + Math.round(big / DPR) + 'px' : '') + '"><img src="' + e(r.thumb) + '"' +
      (r.thumb_2x ? ' srcset="' + e(r.thumb) + ' ' + r.thumb_w + 'w, ' + e(r.thumb_2x) + ' ' + r.thumb_2x_w + 'w" sizes="' + sizes + '"' : '') +
      (r.thumb_w ? ' width="' + r.thumb_w + '" height="' + r.thumb_h + '"' : '') + ' alt="" loading="lazy" decoding="async"></span>';
  }
  /* Records that show one picture are drawn once, with a count. */
  function stacks(list) {
    var seen = {}, out = [];
    list.forEach(function (r) {
      if (!r.pic_group) { out.push({ r: r, more: [] }); return; }
      if (seen[r.pic_group]) { seen[r.pic_group].more.push(r); return; }
      out.push(seen[r.pic_group] = { r: r, more: [] });
    });
    return out;
  }
  function tile(g, h) {
    var r = g.r, lay = shape(r), all = [r.acc].concat(g.more.map(function (x) { return x.acc; })), nv = (r.versions || []).length, n = g.more.length + nv;
    return '<a class="pl" style="--ar:' + lay.toFixed(4) + '"' + tileAttrs(r) + ' data-rs="' + all.join(' ') + '" title="' + e(label(r) + (nv ? ' · ' + (nv + 1) + ' versions' : '') + (g.more.length ? ' · and ' + g.more.length + ' more with this picture' : '')) + '"' +
      (S.r && all.indexOf(S.r) >= 0 ? ' aria-current="true"' : '') + '>' + pic(r, Math.round(lay * h * 1.5) + 'px') + '<span class="c' + (r.call ? '' : ' t') + '"><b>' + e(r.call || r.title) + '</b>' + (n ? '<s>+' + n + '</s>' : '') + '</span>' + nw(r) + marks(r) + '</a>';
  }
  /* Only a work with a picture gets a frame. The rest are listed by name. */
  function strip(list, h) {
    var shown = list.filter(function (r) { return r.thumb; }), bare = list.filter(function (r) { return !r.thumb; });
    return (shown.length ? '<div class="strip">' + stacks(shown).map(function (g) { return tile(g, h); }).join('') + '</div>' : '') + unpictured(bare);
  }
  function unpictured(list) {
    if (!list.length) return '';
    return '<div class="bare"><h4 class="k">Not pictured · ' + list.length + '</h4>' + list.map(function (r) {
      return '<a' + tileAttrs(r) + (S.r === r.acc ? ' aria-current="true"' : '') + '><span class="m">' + e(r.call || r.acc) + '</span><span class="ti">' + e(r.title) + '</span><span class="m why">' + e(r.no_pic && r.no_pic.why ? r.no_pic.why : r.access !== 'public' ? cap(r.access) : '') + '</span></a>';
    }).join('') + '</div>';
  }
  function partsLine(list) {
    if (!list.length) return '';
    return '<p class="partsl"><span class="k">Parts · ' + list.length + '</span>' + list.map(function (r) { return '<a href="' + recHref(r) + '" data-r="' + r.acc + '" title="' + e(r.title) + '">' + e(r.call || r.acc) + '</a>'; }).join('') + '</p>';
  }

  /* ---------------------------------------------------------------- filter */
  function tokens() { return S.q.toLowerCase().split(/\s+/).filter(Boolean); }
  function match(r, except, tk) {
    for (var i = 0; i < FACETS.length; i++) {
      var k = FACETS[i].k; if (k === except) continue;
      var want = S.f[k]; if (want.length && want.indexOf(r[k] == null ? '' : r[k]) < 0) return false;
    }
    for (var j = 0; j < tk.length; j++) if (r._hay.indexOf(tk[j]) < 0) return false;
    return true;
  }
  var SHELF = {}; L.collections.forEach(function (c) { var n = 0; c.sections.forEach(function (s) { s.records.forEach(function (id) { SHELF[id] = n++; }); }); });
  function filtered() {
    var tk = tokens(), out = base().filter(function (r) { return match(r, null, tk); });
    if (S.sort === 'title') out.sort(function (a, b) { return a.title.localeCompare(b.title); });
    // newest first by default: the latest arrival leads every list (Julia, 2026-11-26)
    else if (S.sort === 'new') out.sort(function (a, b) { return (b.dates.accessioned || '').localeCompare(a.dates.accessioned || '') || b.acc.localeCompare(a.acc) || a._i - b._i; });
    else if (S.sort === 'modified') out.sort(function (a, b) { return (b.dates.modified || '').localeCompare(a.dates.modified || '') || a._i - b._i; });
    else if (S.sort === 'shelf') out.sort(function (a, b) { return COL[a.collection]._i - COL[b.collection]._i || (SHELF[a.id] || 0) - (SHELF[b.id] || 0); });
    return out;
  }
  function base() { return S.view === 'ledger' ? R.filter(visible) : WORKS.filter(function (r) { return visible(r) && r.state !== 'archived'; }); }
  function archivedShown() { var tk = tokens(); return WORKS.filter(function (r) { return visible(r) && r.state === 'archived' && match(r, null, tk); }); }
  function anyFilter() { return S.q || FACETS.some(function (F) { return S.f[F.k].length; }); }

  /* ---------------------------------------------------------------- bar + rail */
  function drawBar() {
    var k = S.f.kind3.length === 1 ? S.f.kind3[0] : '', on = function (x) { return x ? ' aria-current="page"' : ''; };
    var nT = L.authority.techniques.length, nA = base().length, kc = {};
    WORKS.forEach(function (r) { if (visible(r) && r.state !== 'archived') kc[r.kind3] = (kc[r.kind3] || 0) + 1; });
    var h = '<button type="button" data-nav=""' + on(S.view === 'plates' && !k) + '>Library<i>' + nA + '</i></button>' +
      '<button type="button" data-nav="technique"' + on(S.view === 'techniques') + ' title="Every method, with the work that uses it">Techniques<i>' + nT + '</i></button>' +
      '<button type="button" data-nav="example"' + on(S.view === 'plates' && k === 'example') + '>Examples<i>' + (kc.example || 0) + '</i></button>' +
      '<button type="button" data-nav="template"' + on(S.view === 'plates' && k === 'template') + '>Templates<i>' + (kc.template || 0) + '</i></button>' +
      '<button type="button" data-view="galleries"' + on(S.view === 'galleries') + '>Galleries<i>' + galleries().length + '</i></button>';
    if (ED.on || S.view === 'ledger' || S.view === 'audit' || S.view === 'shelves' || S.view === 'atoms') {
      var n = { ledger: R.length, audit: L.audit.filter(function (a) { return a.level !== 'note'; }).length, shelves: L.collections.length, atoms: L.authority.atoms.length };
      h += '<span class="vsep" aria-hidden="true"></span>' + ['ledger', 'audit'].concat(S.view === 'shelves' || S.view === 'atoms' ? [S.view] : []).map(function (v) {
        return '<button type="button" class="upk" data-view="' + v + '"' + on(S.view === v) + '>' + cap(v) + '<i>' + n[v] + '</i></button>';
      }).join('');
    }
    $views.innerHTML = h;
    drawViewSwitch();
  }
  // Mine / Shared: what you see, and what anyone you send the link to sees
  var $vsw = document.createElement('div'); $vsw.id = 'vsw'; $vsw.setAttribute('role', 'group'); $vsw.setAttribute('aria-label', 'Whose view');
  function drawViewSwitch() {
    if (!$vsw.parentNode) { var b = document.getElementById('bar'), c = document.getElementById('cmsbtn'); if (c) b.insertBefore($vsw, c); else b.appendChild($vsw); }
    $vsw.hidden = !ED.unlocked;
    $vsw.innerHTML = '<button type="button" data-cms="view-mine" aria-pressed="' + !ED.shared + '" title="Everything, private work included (only in this browser)">Mine</button><button type="button" data-cms="view-shared" aria-pressed="' + !!ED.shared + '" title="Exactly what anyone you send the link to sees">Shared</button>';
  }

  function drawRail() {
    var railed = S.view === 'plates' || S.view === 'ledger' || S.view === 'shelves';
    $frame.classList.toggle('norail', !railed);
    if (!railed) { $rail.innerHTML = ''; return; }
    var tk = tokens(), nref = REFINE.reduce(function (n, x) { return n + S.f[x[0]].length; }, 0), open = $rail.classList.contains('open');
    var h = '<button type="button" class="railtog" data-railtog aria-expanded="' + open + '">' + (S.f.project.length ? e(PROJ[S.f.project[0]] ? PROJ[S.f.project[0]].title : 'Projects') : 'All projects') + (nref ? ' · ' + nref + ' refined' : '') + '<span>' + (open ? '–' : '+') + '</span></button>';
    h += projectNav(tk) + refineNav(tk);
    $rail.innerHTML = h;
  }
  /* The useful part of the old filter panel: type, status and how it is built. Collection and access are covered by projects and Mine/Shared. */
  var REFINE = [['kind', 'Type'], ['status', 'Status'], ['lane', 'Build']];
  function refineNav(tk) {
    var any = false, g = '';
    REFINE.forEach(function (x) {
      var F = FACETS.filter(function (f) { return f.k === x[0]; })[0], counts = {};
      base().forEach(function (r) { if (match(r, F.k, tk)) { var v = r[F.k] == null ? '' : r[F.k]; counts[v] = (counts[v] || 0) + 1; } });
      var vals = F.values.filter(function (v) { return counts[v] || S.f[F.k].indexOf(v) >= 0; });
      if (vals.length < 2 && !S.f[F.k].length) return;
      if (S.f[F.k].length) any = true;
      g += '<div class="rg"><span class="k">' + x[1] + '</span><div class="rcs">' + vals.map(function (v) {
        var tip = F.tip && F.tip(v);
        return '<button type="button" class="rc" data-f="' + F.k + '" data-v="' + e(v) + '" aria-pressed="' + (S.f[F.k].indexOf(v) >= 0) + '"' + (tip ? ' title="' + e(tip) + '"' : '') + '>' + e(F.label(v)) + '<i>' + (counts[v] || 0) + '</i></button>';
      }).join('') + '</div></div>';
    });
    return g ? '<section class="fg ref"><h2><span class="k">Refine</span>' + (any ? '<button type="button" data-clearref>Clear</button>' : '') + '</h2>' + g + '</section>' : '';
  }
  /* Projects down the left: public, then Private (only in this browser, with the token), then what is retiring. */
  function projectNav(tk) {
    var counts = {}, all = 0;
    base().forEach(function (r) { if (match(r, 'project', tk)) { counts[r.project] = (counts[r.project] || 0) + 1; all++; } });
    var cur = S.f.project[0] || '';
    function row(id, title, n, note) {
      if (ED.on && ED.pjf && ED.pjf.id === id) return pjForm(PROJ[id]);
      var b = '<button type="button" class="fv pj' + (n ? '' : ' zero') + '" data-proj="' + e(id) + '" aria-pressed="' + (cur === id) + '"' + (note ? ' title="' + e(note) + '"' : '') + '><span></span><span class="lb">' + e(title) + '</span><span class="ct">' + n + '</span></button>';
      return ED.on && id ? '<div class="pjrow">' + b + '<button type="button" class="pjed" data-pjedit="' + e(id) + '" title="Rename, make private, or delete ' + e(title) + '" aria-label="Edit project ' + e(title) + '">' + PEN_SVG + '</button></div>' : b;
    }
    var pub = CMSD.projects.filter(function (p) { return !p.private && !p.retiring; }), prv = CMSD.projects.filter(function (p) { return p.private; }), ret = CMSD.projects.filter(function (p) { return p.retiring && !p.private; });
    var h = '<section class="fg pjs"><h2><span class="k">Projects</span></h2><div class="fvs">' + row('', 'All', all) + pub.map(function (p) { return row(p.id, p.title, counts[p.id] || 0, p.note); }).join('') +
      (ED.on ? (ED.pjf && ED.pjf.id === '' ? pjForm(null) : '<button type="button" class="pjnew" data-pjedit="">+ New project</button>') : '') + '</div></section>';
    if (mine() && prv.length) h += '<section class="fg pjs"><h2><span class="k">Private</span><span class="k only" title="Shown only in this browser, with your token">only you</span></h2><div class="fvs">' + prv.map(function (p) { return row(p.id, p.title, counts[p.id] || 0, p.note); }).join('') + '</div></section>';
    if (ret.length) h += '<section class="fg pjs ret"><h2><span class="k">Retiring</span></h2><div class="fvs">' + ret.map(function (p) { return row(p.id, p.title, counts[p.id] || 0, p.note); }).join('') + '</div></section>';
    return h;
  }
  /* Projects are edited in place on the left while editing: new, rename, private, delete when empty. */
  var PEN_SVG = '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M2 10l.6-2.4L8.3 1.9l1.8 1.8L4.4 9.4zM7.4 2.8l1.8 1.8" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>';
  function pjAll(id) { return R.filter(function (r) { return !r._gone && r.project === id; }).length; }
  function pjForm(p) {
    var n = p ? pjAll(p.id) : 0;
    return '<form class="pjf" data-pjform="' + e(p ? p.id : '') + '"><input name="t" value="' + e(p ? p.title : '') + '" placeholder="Project name" aria-label="Project name" spellcheck="true">' +
      '<input name="n" value="' + e(p && p.note || '') + '" placeholder="Note (optional)" aria-label="Note">' +
      '<label class="pv"><input type="checkbox" name="p"' + (p && p.private ? ' checked' : '') + '> Private <small>only you see it</small></label>' +
      '<div class="pjb"><button type="submit" class="act">' + (p ? 'Save' : 'Create') + '</button><button type="button" class="act" data-pjcancel>Cancel</button>' +
      (p ? (n ? '<span class="nd" title="Move its ' + n + ' records to another project first">' + n + ' in it</span>' : '<button type="button" class="act danger" data-pjdrop="' + e(p.id) + '">Delete</button>') : '') + '</div></form>';
  }
  function slug(t) { var b = String(t).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project', id = b, i = 2; while (PROJ[id]) id = b + '-' + i++; return id; }
  function saveProject(def, message) {
    var prevP = CMSD.projects.slice(), prevMap = {}; for (var k in PROJ) prevMap[k] = PROJ[k];
    applyProjectLocal(def); ED.pjf = null; render(); status('Saving: ' + message + '…');
    ED.q = ED.q.then(function () {
      return LibCMS.save({ op: def.drop ? 'project-delete' : 'project', ids: [], patch: {}, projectDef: def }, message).then(function (x) {
        CMSD.projects = x.E.projects || CMSD.projects; syncProjects(); status('Saved: ' + message + '. On the site after the next build, about two minutes.', 'ok'); render(); watchDeploy(6000);
      }, function (err) { CMSD.projects = prevP; syncProjects(); render(); status('Not saved: ' + err.message, 'bad'); });
    });
  }
  function applyProjectLocal(def) {
    var P = CMSD.projects, i = -1; P.forEach(function (x, j) { if (x.id === def.id) i = j; });
    if (def.drop) { if (i >= 0) P.splice(i, 1); }
    else { var cur = i >= 0 ? P[i] : { id: def.id }; for (var k in def.set) { if (def.set[k] == null || def.set[k] === false || def.set[k] === '') delete cur[k]; else cur[k] = def.set[k]; } if (i < 0) { var at = -1; P.forEach(function (x, j) { if (!x.private && !x.retiring) at = j; }); P.splice(cur.private || cur.retiring ? P.length : at + 1, 0, cur); } }
    syncProjects();
  }
  // the project list drives the rail, the facet, the selects and private visibility
  function syncProjects() {
    for (var k in PROJ) delete PROJ[k]; PROJ_IDS.length = 0;
    CMSD.projects.forEach(function (p) { PROJ[p.id] = p; PROJ_IDS.push(p.id); });
    R.forEach(function (r) { if (!PROJ[r.project]) return; var ed = r._ed || {}; if (PROJ[r.project].private && ed.visibility !== 'public') r.visibility = 'private'; else if (r.visibility === 'private' && ed.visibility !== 'private' && !PROJ[r.project].private) delete r.visibility; });
  }

  /* One row above the cards: families (grouping tags), then whatever else is filtering, each removable. */
  function filterRow(tk) {
    var fc = {}; base().forEach(function (r) { if (match(r, 'family', tk) && r.family) fc[r.family] = (fc[r.family] || 0) + 1; });
    var fams = Object.keys(L.vocabulary.family || {}).filter(function (f) { return fc[f] || S.f.family.indexOf(f) >= 0; }).sort(function (a, b) { return (fc[b] || 0) - (fc[a] || 0); });
    var act = '';
    if (S.q) act += '<button type="button" class="chip" data-unq>“' + e(S.q) + '”</button>';
    FACETS.forEach(function (F) { if (F.k === 'project' || F.k === 'kind3' || F.k === 'family') return; S.f[F.k].forEach(function (v) { act += '<button type="button" class="chip" data-f="' + F.k + '" data-v="' + e(v) + '">' + e(F.label(v)) + '</button>'; }); });
    var any = act || S.f.family.length;
    if (!fams.length && !act) return '';
    return '<div class="frow"><span class="k">Family</span><div class="fams">' + fams.map(function (f) {
      return '<button type="button" class="fam" data-f="family" data-v="' + e(f) + '" aria-pressed="' + (S.f.family.indexOf(f) >= 0) + '" title="' + e(L.vocabulary.family[f] || '') + '">' + e(cap(f.replace(/-/g, ' '))) + '<i>' + (fc[f] || 0) + '</i></button>';
    }).join('') + '</div>' + (act ? '<div class="act-f">' + act + '</div>' : '') + (any ? '<button type="button" class="clear" data-clearfilt>Clear</button>' : '') + '</div>';
  }

  /* ---------------------------------------------------------------- shared pieces */
  function toolbar(tools, n, total, noFacets) {
    var chips = '';
    if (S.q) chips += '<button type="button" class="chip" data-unq>“' + e(S.q) + '”</button>';
    if (!noFacets) FACETS.forEach(function (F) { if (F.k === 'project' || F.k === 'kind3' || F.k === 'family') return; S.f[F.k].forEach(function (v) { chips += '<button type="button" class="chip" data-f="' + F.k + '" data-v="' + e(v) + '">' + e(F.label(v)) + '</button>'; }); });
    var flt = chips || n !== total ? '<div class="flt"><span class="n"><b>' + n + '</b> of ' + total + '</span>' + chips + (chips ? '<button type="button" class="clear" data-clearall>Clear</button>' : '') + '</div>' : '';
    return tools || flt ? '<div class="tb">' + (tools || '') + flt + '</div>' : '';
  }
  function seg(name, opts, cur) {
    return '<div class="seg" role="group" aria-label="' + name + '">' + opts.map(function (o) { return '<button type="button" ' + o[0] + ' aria-pressed="' + (o[2] === cur) + '"' + (o[3] ? ' title="' + e(o[3]) + '"' : '') + '>' + o[1] + '</button>'; }).join('') + '</div>';
  }
  function empty(what) { return '<div class="empty">No ' + what + ' match.' + (anyFilter() ? '<button type="button" data-clearall>Clear filters</button>' : '') + '</div>'; }
  function foot() {
    return '<footer class="foot"><span>' + (PREVIEW ? 'Preview of library/' : '<a href="catalog.json">catalog.json</a> · <a href="accessions.json">accessions.json</a> · <a href="fixity.json">fixity.json</a> · <a href="llms.txt">llms.txt</a>') + '</span>' +
      '<span>' + e(L.schema) + ' · built ' + e(L.generated) + (L.source_commit ? ' · ' + e(L.source_commit) : '') + '</span></footer>';
  }
  /* A small control on a tile: the work's page in a new window, or its picture when it has no page. */
  var NW_SVG = '<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M5 2.5H2.5v7h7V7M7 2.5h2.5V5M9.5 2.5 5.5 6.5" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>';
  /* Every pictured record opens something: its own page, or the plate page that shows its picture at full size. */
  // a figure lifted into a read plate opens the plate it belongs to
  function openUrl(r) { var w = r.work && byId[r.work]; return r.href || (r.role === 'part' && w && w.href ? w.href : '') || (r.thumb ? 'plate.html?r=' + encodeURIComponent(r.acc) : ''); }
  /* A tile opens its page, in this tab (Julia: no new tabs, no step in between). The small i opens the record's details. */
  var INFO_SVG = '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M6 5.2v3.6M6 3.3v.9" stroke="currentColor" stroke-width="1.2"/></svg>';
  function nw(r) { return '<span class="nw" role="button" tabindex="0" data-r="' + r.acc + '" title="Details" aria-label="Details for ' + e(r.title) + '">' + INFO_SVG + '</span>'; }
  function tileHref(r) { return ED.on ? recHref(r) : (openUrl(r) || recHref(r)); }
  function tileAttrs(r) {
    var sel = ED.on && ED.sel[r.acc];
    return ' href="' + e(tileHref(r)) + '"' + (ED.on ? ' data-pick="' + r.acc + '" aria-pressed="' + !!sel + '"' : openUrl(r) ? ' data-acc="' + r.acc + '"' : ' data-r="' + r.acc + '"') +
      (r.state === 'archived' ? ' data-state="archived"' : '') + (r.visibility === 'private' ? ' data-vis="private"' : '');
  }
  function marks(r) { return (r.visibility === 'private' ? '<span class="mk pv">Private</span>' : '') + (r.state === 'archived' ? '<span class="mk ar">Archived</span>' : '') + (ED.on ? '<span class="tick" aria-hidden="true"></span>' : ''); }
  function card(r) {
    var st = r.status ? r.status.replace('-', ' ') : '';
    var has = r.access !== 'public' ? '<span class="not">' + r.access + '</span>'
      : r.plate && r.plate.modules ? '<span class="has" title="Has modules to lift">lift</span>' : r.plate && r.plate.spec ? '<span class="has" title="Has a spec">spec</span>' : '';
    return '<a class="cdx"' + tileAttrs(r) + ' title="' + e(label(r)) + '"' + (S.r === r.acc ? ' aria-current="true"' : '') + '><span class="cell">' + pic(r, '(max-width:720px) 46vw, 240px', r.access !== 'public') + nw(r) + marks(r) + '</span>' +
      '<span class="l1"><b class="call">' + e(r.call || r.acc) + '</b><span class="col">' + COL[r.collection].code + '</span></span>' +
      '<span class="tt">' + e(r.title) + '</span>' +
      '<span class="l3">' + glyph(r.kind, r.status, r.access) + '<span class="st">' + e(r.kind) + (st ? ' · ' + e(st) : '') + (r.versions ? ' · ' + (r.versions.length + 1) + ' versions' : '') + (r.parts ? ' · ' + r.parts.length + ' parts' : '') + '</span>' + has + '</span></a>';
  }

  /* A die-cut index card. The cut is the technique family: an arch for light and fields, a stepped
     corner for print and tone, a folder tab for layout, type and charts, a clipped corner for line,
     construction and pixel work. With no family, the kind picks the cut.
     The picture fills the window (cropped here, and only here); the label strip is paper. */
  var FCUT = { 'light-gradient': 'arch', 'fields-optics': 'arch', sound: 'arch', 'print-physics': 'step', 'screen-tone': 'step', 'grain-stock': 'step',
    'layout-ephemera': 'tab', type: 'tab', 'data-display': 'tab', 'motion-runtime': 'tab', line: 'clip', 'subject-construction': 'clip', 'pixel-sprite': 'clip', 'shader-fundamentals': 'clip' };
  var CUT = { technique: 'arch', atom: 'arch', plate: 'arch', study: 'step', exploration: 'step', coupling: 'step', template: 'tab', instrument: 'tab', document: 'tab' };
  function tab(r) {
    var tail = r.kind === 'plate' && /\/(\d{2})$/.exec(r.id), num = r.call || (tail ? tail[1] : r.acc.slice(5).replace(/^0+/, '')), st = r.access !== 'public' ? r.access : r.status ? r.status.replace('-', ' ') : (r.family || '').replace(/-/g, ' ');
    return '<a class="tb-c cut-' + (FCUT[r.family] || CUT[r.kind] || 'step') + (r.access !== 'public' ? ' off' : '') + '"' + tileAttrs(r) + ' title="' + e(label(r)) + '"' + (S.r === r.acc ? ' aria-current="true"' : '') + '>' +
      '<span class="edge"><span class="face"><img src="' + e(r.thumb_2x && r.thumb_2x_w <= 1200 ? r.thumb_2x : r.thumb) + '" alt="" loading="lazy" decoding="async">' +
      '<span class="strip2"><span class="k">' + e(r.kind) + '</span><b' + (num.length > 5 ? ' class="long"' : '') + '>' + e(num) + '</b><span class="k st">' + e(st || COL[r.collection].code) + '</span>' + nw(r) + '</span>' + marks(r) + '</span></span>' +
      '<span class="nm">' + e(r.title) + '</span></a>';
  }

  /* ---------------------------------------------------------------- arrival chart: one mark per record, a row per collection, on whole pixels */
  function lanes(list) {
    var R = window.__R_ALL.filter(visible); // only the records you can see
    var W = Math.max(320, $lib.clientWidth - 40), gut = 34, n = R.length, step = Math.max(1, Math.floor((W - gut) / n)), mw = Math.max(1, step - 1), rowH = 11, rows = L.collections.length, top = rows * rowH;
    var inSet = {}; list.forEach(function (r) { inSet[r.id] = 1; });
    var s = '<div class="lanes"><svg width="' + (gut + n * step) + '" height="' + (top + 18) + '" role="img" aria-label="Records in order of arrival, one row per collection">';
    L.collections.forEach(function (c, i) {
      s += '<line class="rule" x1="' + gut + '" x2="' + (gut + n * step) + '" y1="' + (i * rowH + rowH - .5) + '" y2="' + (i * rowH + rowH - .5) + '"/><text x="0" y="' + (i * rowH + 8) + '">' + c.code + '</text>';
    });
    var lastLabel = -99, lastDate = '';
    R.forEach(function (r, i) {
      var x = gut + i * step, y = COL[r.collection]._i * rowH + 2;
      s += '<rect class="m' + (inSet[r.id] ? '' : ' off') + (S.r === r.acc ? ' sel' : '') + '" data-r="' + r.acc + '" x="' + x + '" y="' + y + '" width="' + mw + '" height="' + (rowH - 4) + '"/>';
      var d = r.dates.accessioned || '';
      if (d !== lastDate) {
        lastDate = d;
        s += '<line class="tick" x1="' + (x + .5) + '" x2="' + (x + .5) + '" y1="' + top + '" y2="' + (top + 4) + '"/>';
        if (x - lastLabel > 46) { s += '<text x="' + x + '" y="' + (top + 15) + '">' + d.slice(5) + '</text>'; lastLabel = x; }
      }
    });
    R.forEach(function (r, i) { s += '<rect class="hit" data-r="' + r.acc + '" x="' + (gut + i * step) + '" y="0" width="' + step + '" height="' + top + '"/>'; });
    return s + '</svg></div>';
  }

  /* ---------------------------------------------------------------- views */
  function vPlates() {
    var list = filtered(); LIST = list;
    function sel(v) { return S.sort === v ? ' selected' : ''; }
    var tools = seg('Layout', [['data-d="s"', 'Sheet', 's'], ['data-d="m"', 'Cards', 'm'], ['data-d="t"', 'Tabs', 't', 'Die-cut index cards: the cut is the technique family']], S.d) +
      '<label class="ord">Order <select data-sort><option value="new"' + sel('new') + '>Newest</option><option value="modified"' + sel('modified') + '>Last changed</option><option value="acc"' + sel('acc') + '>Arrival</option><option value="shelf"' + sel('shelf') + '>Shelf</option><option value="title"' + sel('title') + '>Title</option></select></label>';
    var body = !list.length ? empty('records')
      : S.d === 's' ? '<div class="sheet">' + strip(list, phone() ? 76 : 104) + '</div>'
      : S.d === 't' ? '<div class="tabs">' + list.filter(function (r) { return r.thumb; }).map(tab).join('') + '</div>' + unpictured(list.filter(function (r) { return !r.thumb; }))
      : '<div class="cards">' + list.filter(function (r) { return r.thumb; }).map(card).join('') + '</div>' + unpictured(list.filter(function (r) { return !r.thumb; }));
    var pj = S.f.project.length ? PROJ[S.f.project[0]] : null, k = S.f.kind3.length === 1 ? S.f.kind3[0] : '', arch = archivedShown();
    var noun = k ? KIND3_LABEL[k].toLowerCase() : 'works'; if (list.length === 1) noun = noun.replace(/s$/, '');
    if (!list.length && arch.length) { S.open.arch = true; body = '<div class="empty">Nothing live matches. ' + arch.length + ' archived, below.</div>'; }
    var head = '<header class="lh"><div class="lh1"><h1>' + e(pj ? pj.title : k ? KIND3_LABEL[k] : 'Library') + '</h1><p class="meta"><b>' + list.length + '</b> ' + noun +
      (pj && pj.note ? ' · ' + e(pj.note) : '') + (pj && pj.private ? ' · <span class="pv">private: only you see this</span>' : '') +
      (arch.length ? ' · <button type="button" class="lnk" data-goarch>' + arch.length + ' archived ↓</button>' : '') + '</p></div><div class="lh2">' + tools + '</div></header>';
    $lib.innerHTML = head + filterRow(tokens()) + body + archiveFold() + removedFold() + foot();
  }

  /* Archived work sits at the foot of its project, folded. In Edit it can be picked and restored. */
  function archiveFold() {
    var a = archivedShown(); if (!a.length) return '';
    var open = !!S.open.arch;
    return '<section class="fold arch" id="archived"><button type="button" class="foldbtn" data-fd="arch" aria-expanded="' + open + '"><span class="fh">Archived</span><b>' + a.length + '</b><span class="fx">Out of every listing; the pages still work.' + (ED.on ? ' Pick to restore.' : '') + '</span><span class="tg">' + (open ? 'Hide' : 'Show') + '</span></button>' +
      (open ? '<div class="cards">' + a.filter(function (r) { return r.thumb; }).map(card).join('') + '</div>' + unpictured(a.filter(function (r) { return !r.thumb; })) : '') + '</section>';
  }
  function removedFold() {
    if (!ED.on || !ED.removed.length) return '';
    var open = !!S.open.rem, pj = S.f.project[0];
    var list = ED.removed.filter(function (x) { return !pj || x.project === pj; }); if (!list.length) return '';
    return '<section class="fold rem"><button type="button" class="foldbtn" data-fd="rem" aria-expanded="' + open + '"><span class="k">Removed</span><b>' + list.length + '</b><span>' + (open ? '–' : '+') + '</span></button>' +
      (open ? '<div class="remlist">' + list.map(function (x) {
        return '<div class="rrow"><span class="m">' + e(x.call || x.acc) + '</span><span class="ti">' + e(x.title) + '</span><span class="m">' + e((x.at || '').slice(0, 10)) + (x.pending ? ' · saving' : '') + '</span>' +
          (x.restored ? '<span class="m">Restored · back after the next build</span>' : '<button type="button" class="act" data-restore="' + e(x.id) + '">Restore</button>') + '</div>';
      }).join('') + '<p class="note">Removed work is off the site. Its files stay in this repo, and a copy is in the private repo ' + e(window.LibCMS ? LibCMS.archive : 'tools-archive') + '.</p></div>' : '') + '</section>';
  }

  function vShelves() {
    var tk = tokens(), any = anyFilter(), total = 0, h = '';
    LIST = [];
    L.collections.forEach(function (c) {
      var secs = '', n = 0;
      c.sections.forEach(function (s) {
        var all = s.records.map(function (id) { return byId[id]; });
        var recs = all.filter(function (r) { return r && !r.role && visible(r) && r.state !== 'archived' && (!any || match(r, null, tk)); });
        var parts = any ? [] : all.filter(function (r) { return r && r.role === 'part' && visible(r); });
        if (!recs.length && !parts.length) return;
        n += recs.length; LIST = LIST.concat(recs);
        secs += '<div class="sec"><h3>' + e(s.title) + '<span>' + recs.length + '</span></h3>' + strip(recs, phone() ? 56 : 64) + partsLine(parts) + '</div>';
      });
      if (any && !n) return;
      total += n;
      var cw = WORKS.filter(function (r) { return r.collection === c.id; }).length;
      h += '<section class="shelf"><header><h2><span class="k code">' + c.code + '</span>' + e(c.title) + '<span class="k">' + n + (n === cw ? '' : ' of ' + cw) + '</span></h2>' +
        (c.index ? '<a class="go" href="' + e(c.index) + '">Index ↗</a>' : '') + '<p class="note">' + e(c.note) + '</p><div class="truth">' + e(c.truth) + '</div></header>' + secs + '</section>';
    });
    $lib.innerHTML = '<h1 class="vh">Shelves</h1>' + toolbar('', total, WORKS.length) + (h || empty('records')) + foot();
  }

  function vTerms(which) {
    var all = which === 'techniques' ? L.authority.techniques : L.authority.atoms, type = which === 'techniques' ? 'technique' : 'atom';
    var schemes = []; all.forEach(function (t) { if (schemes.indexOf(t.scheme) < 0) schemes.push(t.scheme); });
    var tk = tokens();
    var list = all.filter(function (t) {
      if (S.scheme && t.scheme !== S.scheme) return false;
      if (!tk.length) return true;
      var hay = (t.id + ' ' + t.name + ' ' + (t.atom_kind || '') + ' ' + t.uses.map(function (u) { return byId[u.rec] ? byId[u.rec].title + ' ' + byId[u.rec].call : ''; }).join(' ')).toLowerCase();
      return tk.every(function (x) { return hay.indexOf(x) >= 0; });
    });
    list.forEach(function (t) { var s = {}; t.uses.forEach(function (u) { s[u.rec] = 1; }); t._n = Object.keys(s).length; });
    if (S.tsort === 'n') list.sort(function (a, b) { return b._n - a._n || a.id.localeCompare(b.id); }); else list.sort(function (a, b) { return a.id.localeCompare(b.id); });
    var max = list.reduce(function (m, t) { return Math.max(m, t._n); }, 1);
    var tools = seg('Vocabulary', [['data-scheme=""', 'All', '']].concat(schemes.map(function (s) { return ['data-scheme="' + s + '"', SCHEME_LABEL[s] || s, s, L.vocabulary.scheme[s] || s]; })), S.scheme) +
      seg('Order', [['data-ts="n"', 'By use', 'n'], ['data-ts="az"', 'A–Z', 'az']], S.tsort);
    var h = '<h1 class="vh">' + cap(which) + '</h1>' + toolbar(tools, list.length, all.length, true);
    h += list.length ? '<ul class="terms">' + list.map(function (t) {
      var open = S.term === t.key;
      return '<li class="term"' + (open ? ' open' : '') + ' id="t-' + e(t.key) + '"><button type="button" data-term="' + e(t.key) + '" aria-expanded="' + open + '">' +
        '<span class="sc">' + (SCHEME_LABEL[t.scheme] || t.scheme) + '</span><span class="id">' + e(t.id) + '</span><span class="nm">' + e([t.name !== t.id ? t.name : '', t.atom_kind, SEE[type + ':' + t.key] ? 'see also' : ''].filter(Boolean).join(' · ')) + '</span>' +
        '<span class="ct"><i style="width:' + Math.max(2, Math.round(t._n / max * 60)) + 'px"></i>' + t._n + '</span></button>' + (open ? termBody(t, type) : '') + '</li>';
    }).join('') + '</ul>' : empty('terms');
    $lib.innerHTML = h + foot();
    LIST = R;
    if (S.term) { var el = document.getElementById('t-' + S.term); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' }); }
  }
  function termBody(t, type) {
    var h = '<div class="body">';
    (SEE[type + ':' + t.key] || []).forEach(function (s) { h += seeBox(s); });
    if (t.record && byId[t.record]) h += '<div class="see"><span class="tag">Entry</span><a href="' + recHref(byId[t.record]) + '" data-r="' + byId[t.record].acc + '">' + e(byId[t.record].title) + '</a></div>';
    // one row per record: a record that uses the term in several modules lists them together
    var rows = [], at = {};
    t.uses.slice().sort(function (a, b) { return byId[a.rec]._i - byId[b.rec]._i; }).forEach(function (u) {
      var r = byId[u.rec]; if (!r || u.role === 'entry') return;
      var row = at[u.rec]; if (!row) { row = at[u.rec] = { r: r, roles: [], ins: [], notes: [] }; rows.push(row); }
      if (u.role === 'in') { var m = (u.via || '').split(':').pop(); if (m && row.ins.indexOf(m) < 0) row.ins.push(m); }
      else if (row.roles.indexOf(u.role) < 0) row.roles.push(u.role);
      var note = (u.implementation ? '<p>' + e(u.implementation) + '</p>' : '') + (u.limits ? '<p class="lim">Limits: ' + e(u.limits) + '</p>' : '') + (u.module ? '<p><code>' + e(u.module) + '</code></p>' : '');
      if (note && row.notes.indexOf(note) < 0) row.notes.push(note);
    });
    rows.forEach(function (row) {
      var r = row.r, role = row.roles.concat(row.ins.length ? ['in ' + row.ins.join(', ')] : []).join(' · ');
      h += '<div class="use"><a class="pic" href="' + recHref(r) + '" data-r="' + r.acc + '" tabindex="-1">' + pic(r, '96px') + '</a><div><h4><span class="call">' + e(r.call || r.acc) + '</span><a href="' + recHref(r) + '" data-r="' + r.acc + '">' + e(r.title) + '</a><span class="role">' + e(role) + '</span></h4>' + row.notes.join('') + '</div></div>';
    });
    if (t.scheme === 'tt') h += '<div class="see"><a href="' + e(BASE) + 'techniques-templates/?' + (type === 'atom' ? 'a' : 't') + '=' + encodeURIComponent(t.id) + '">Parameters in Techniques &amp; Templates ↗</a></div>';
    return h + '</div>';
  }
  function seeBox(s) {
    var parts = s.to.split(':'), type = parts[0], key = parts.slice(1).join(':'), text, href, attr = '', prop = s.by === 'proposed';
    if (type === 'record') { var r = byId[key]; text = (r.call ? r.call + ' ' : '') + r.title; href = recHref(r); attr = ' data-r="' + r.acc + '"'; }
    else { var t = (type === 'technique' ? TECH : ATOM)[key]; text = key + (t && t.name !== t.id ? ' · ' + t.name : ''); href = hash({ view: type + 's', term: key, r: null, q: '', scheme: '' }); }
    return '<div class="see' + (prop ? ' prop' : '') + '"><span class="tag">' + (prop ? 'Proposed' : 'See also') + '</span><span class="ty">' + type + '</span><a href="' + href + '"' + attr + '>' + e(text) + '</a><span class="rel">' + e(s.relation) + '</span><p>' + e(s.basis) + '</p></div>';
  }

  function vLedger() {
    var list = filtered();
    var cols = [['acc', 'Accession'], ['call', 'Call'], ['title', 'Title'], ['kind', 'Kind'], ['collection', 'Coll.'], ['section_title', 'Section'], ['status', 'Status'], ['access', 'Access'], ['arrived', 'Arrived'], ['modified', 'Changed'], ['fixity', 'Fixity']];
    var val = function (r, k) { return k === 'arrived' ? r.dates.accessioned : k === 'modified' ? r.dates.modified : k === 'collection' ? COL[r.collection].code : k === 'acc' ? r.acc.slice(5) : (r[k] || ''); };
    list.sort(function (a, b) { return String(val(a, S.ls)).localeCompare(String(val(b, S.ls))) * S.ld || a._i - b._i; });
    LIST = list;
    var h = '<h1 class="vh">Ledger</h1>' + toolbar('', list.length, R.length) + lanes(list);
    h += '<div class="lwrap"><table class="ledger"><thead><tr>' +
      cols.map(function (c) { return '<th scope="col" class="c-' + c[0] + '" data-ls="' + c[0] + '"' + (S.ls === c[0] ? ' aria-sort="' + (S.ld > 0 ? 'ascending' : 'descending') + '"' : '') + '>' + c[1] + '</th>'; }).join('') + '</tr></thead><tbody>' +
      list.map(function (r) {
        return '<tr data-r="' + r.acc + '"' + (S.r === r.acc ? ' aria-current="true"' : '') + '><td>' + r.acc + '</td><td>' + e(r.call) + '</td><td class="t">' + e(r.title) + '</td><td><span class="gl">' + glyph(r.kind, r.status, r.access) + e(r.kind) + '</span></td><td>' + COL[r.collection].code + '</td><td class="n c-section_title">' + e(r.section_title) + '</td><td>' + e(r.status || '') + '</td><td class="n c-access">' + e(r.access) + '</td><td class="n">' + e(r.dates.accessioned) + '</td><td class="n c-modified">' + e(r.dates.modified) + '</td><td class="n c-fixity">' + e(r.fixity ? r.fixity.slice(0, 8) : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    $lib.innerHTML = h + foot();
  }

  function vAudit() {
    var h = '<h1 class="vh">Audit</h1>';
    [['ruling', 'To rule'], ['gap', 'Gaps'], ['drift', 'Drift'], ['note', 'Notes']].forEach(function (g) {
      var fs = L.audit.filter(function (a) { return a.level === g[0]; });
      if (!fs.length) return;
      h += '<section class="aud"><h2 class="k">' + g[1] + '</h2>';
      fs.forEach(function (a) {
        var n = a.of != null ? a.n + '<small>/' + a.of + '</small>' : a.n != null ? a.n : a.records ? a.records.length : a.items ? a.items.length : a.links ? a.links.length : '';
        var has = a.records || a.items || a.links, open = has && !!S.open[a.id];
        h += '<div class="fd"><button type="button"' + (has ? ' data-fd="' + e(a.id) + '" aria-expanded="' + open + '"' : ' disabled') + '><span class="n">' + n + '</span><span class="t">' + e(a.title) + '</span><span class="d">' + e(a.detail) + '</span>' + (has ? '<span class="x">' + (open ? '–' : '+') + '</span>' : '') + '</button>';
        if (open) {
          h += '<div class="more">';
          if (a.items || a.links) h += '<ul>' + (a.items || a.links).map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ul>';
          else h += a.records.map(function (id) { var r = byId[id]; return r ? '<a href="' + recHref(r) + '" data-r="' + r.acc + '"><span class="m">' + r.acc + '</span><span class="m cl2">' + e(r.call) + '</span><span class="ti">' + e(r.title) + '</span></a>' : ''; }).join('');
          h += '</div>';
        }
        h += '</div>';
      });
      h += '</section>';
    });
    $lib.innerHTML = h + foot();
    LIST = R;
  }

  /* ---------------------------------------------------------------- drawer */
  var RIGHTS = { 'first-party': 'First-party', 'reference-withheld': 'Third-party reference, not published', 'reference-published': 'Published with the plate', adapted: 'Adapted', 'reference-study': 'Reference study' };
  function syncDrawer() {
    var r = S.r ? byAcc[S.r] : null;
    if (!r) { $drawer.setAttribute('aria-hidden', 'true'); return; }
    var i = LIST.indexOf(r), prev = i > 0 ? LIST[i - 1] : null, next = i >= 0 && i < LIST.length - 1 ? LIST[i + 1] : null, c = COL[r.collection], p = r.provenance || {}, pl = r.plate || {};
    var h = '<div class="dh"><span class="id">' + (r.call ? '<b>' + e(r.call) + '</b>' : '') + r.acc + '</span><span>' + (i >= 0 ? (i + 1) + ' / ' + LIST.length : '') + '</span>' +
      '<button type="button" data-r="' + (prev ? prev.acc : '') + '"' + (prev ? '' : ' disabled') + ' aria-label="Previous record">←</button><button type="button" data-r="' + (next ? next.acc : '') + '"' + (next ? '' : ' disabled') + ' aria-label="Next record">→</button><button type="button" data-close aria-label="Close">×</button></div><div class="db">';
    h += pic(r, '(max-width:720px) 92vw, 500px') + '<h1>' + e(r.title) + '</h1>' + (r.sub ? '<p class="sub">' + e(r.sub) + '</p>' : '');
    h += '<div class="acts">' + (openUrl(r) ? '<a class="pri" href="' + e(openUrl(r)) + '">Open</a>' : '<span>' + (r.access === 'private' || r.access === 'local' ? 'Local file' : 'Not published') + '</span>') +
      (r.spec_href ? '<a href="' + e(r.spec_href) + '">Spec JSON ↗</a>' : '') + '<button type="button" data-copy="record">Copy record</button>' + (PREVIEW ? '' : '<button type="button" data-copy="link">Copy link</button>') + '</div>';
    if (ED.on) h += editSection(r);
    var rows = [];
    var of = r.work ? byId[r.work] : null;
    if (r.role === 'hidden') rows.push(['Hidden', e(r.hidden_why || 'Not listed.')]);
    else if (r.role) rows.push([r.role === 'version' ? 'Version of' : 'Part of', of ? '<a href="' + recHref(of) + '" data-r="' + of.acc + '">' + e(label(of)) + '</a>' : e(cap(r.part_of || ''))]);
    rows.push(['Project', e(PROJ[r.project] ? PROJ[r.project].title : r.project || '') + (r.visibility === 'private' ? ' <small>· private</small>' : '') + (r.state === 'archived' ? ' <small>· archived' + (r.state_at ? ' ' + e(r.state_at.slice(0, 10)) : '') + '</small>' : '')]);
    rows.push(['Kind', '<span class="gl">' + e(r.kind3 || '') + ' · </span><span class="gl">' + glyph(r.kind, r.status, r.access) + e(r.kind) + (r.atom_kind ? ' · ' + e(r.atom_kind) : '') + '</span>']);
    rows.push(['Status', r.status ? e(r.status.replace('-', ' ')) + (r.ruling ? ' <small>· ruled by ' + e(r.ruling.by) + (r.ruling.date ? ', ' + e(r.ruling.date) : '') + '</small>' : '') + (r.proposed_grade ? ' <small>· proposed grade ' + e(r.proposed_grade) + '</small>' : '') : '<small>none recorded</small>']);
    if (r.access !== 'public') rows.push(['Access', e(cap(r.access)) + ' <small>· ' + e(L.vocabulary.access[r.access]) + (r.target ? ' For ' + e(r.target) + '.' : '') + '</small>']);
    rows.push(['Collection', '<a href="' + hash({ view: 'shelves', r: null, term: null, q: '', f: Object.assign(noF(), { collection: [r.collection] }) }) + '">' + e(c.title) + '</a> <small>· ' + e(r.section_title) + '</small>']);
    rows.push(['Dates', 'Arrived ' + e(r.dates.accessioned) + (r.dates.modified && r.dates.modified !== r.dates.accessioned ? ' <small>· changed ' + e(r.dates.modified) + '</small>' : '')]);
    if (r.family) rows.push(['Family', '<a href="' + e(BASE) + 'techniques-templates/">' + e(cap(r.family.replace(/-/g, ' '))) + '</a>' + (r.form ? ' <small>· ' + e(r.form) + '</small>' : '')]);
    var mk = [r.lane, r.layer && r.layer.toLowerCase(), r.style].filter(Boolean);
    if (mk.length) rows.push(['Build', e(mk.join(' · '))]);
    var has = [pl.spec && 'spec', pl.points && pl.points + '-point read', pl.variants && pl.variants + ' variants', pl.motion && 'motion', pl.live && 'live', pl.compare && 'reference compare', pl.modules && pl.modules + ' modules to lift', pl.examples && pl.examples + (pl.examples === 1 ? ' example' : ' examples'), pl.params && pl.params + ' parameters'].filter(Boolean);
    if (has.length) rows.push(['Plate', e(has.join(' · '))]);
    var src = [p.title, p.author, p.date, p.license].filter(Boolean).map(e).join(' · ');
    if (src || p.rights) rows.push(['Source', [RIGHTS[p.rights] || '', src].filter(Boolean).join(' · ') + (p.url ? ' <a href="' + e(p.url) + '">link ↗</a>' : '')]);
    if (r.governed_by) rows.push(['Governed by', e(r.governed_by.join(' · '))]);
    if (r.swatches) rows.push(['Palette', '<span class="swatches">' + r.swatches.map(function (x) { return '<i style="background:' + e(x) + '" title="' + e(x) + '"></i>'; }).join('') + '</span>']);
    var grp = r.pic_group ? GROUP[r.pic_group].filter(function (x) { return x !== r; }) : [];
    var about = !r.thumb ? ['None.' + (r.no_pic && r.no_pic.why ? ' ' + e(r.no_pic.why) : '')] : r.thumb_from && byId[r.thumb_from] ? ['From the version ' + e(byId[r.thumb_from].title) + '.'] : r.thumb_kind === 'snapshot' ? ['Library snapshot of the live page.'] : [];
    if (grp.length) about.push('Shared with ' + grp.map(function (x) { return '<a href="' + recHref(x) + '" data-r="' + x.acc + '">' + e(x.call || x.acc) + '</a>'; }).join(', ') + '.');
    if (about.length) rows.push(['Picture', about.join(' ')]);
    rows.push(['File', r.location ? e(r.location) : '<code>' + e(r.source) + '</code>']);
    if (r.fixity && r.access === 'public') rows.push(['Fixity', '<code>sha256 ' + e(r.fixity) + '…</code>']);
    h += '<dl class="dl">' + rows.map(function (x) { return '<dt>' + x[0] + '</dt><dd>' + x[1] + '</dd>'; }).join('') + '</dl>';

    var vs = members(r, 'versions'), ps = members(r, 'parts');
    function mrow(x, cur) {
      return '<a href="' + recHref(x) + '" data-r="' + x.acc + '"' + (cur ? ' aria-current="true"' : '') + '><span class="ty">' + e(x.dates.modified || x.dates.accessioned || '') + '</span><span class="cl">' + e(COL[x.collection].code + (x.access === 'public' ? '' : ' · ' + x.access)) + '</span><span>' + e(x.title) + '</span></a>';
    }
    if (vs.length) {
      var allv = [r].concat(vs).sort(function (a, b) { return (b.dates.modified || '').localeCompare(a.dates.modified || ''); });
      h += '<section class="dsec"><h2 class="k">Versions · ' + allv.length + '</h2><div class="rels vers">' + allv.map(function (x) { return mrow(x, x === r); }).join('') + '</div></section>';
    }
    if (ps.length) h += '<section class="dsec"><h2 class="k">Parts · ' + ps.length + '</h2><div class="rels vers">' + ps.map(function (x) { return '<a href="' + recHref(x) + '" data-r="' + x.acc + '"><span class="ty">' + e(x.call || x.acc) + '</span><span class="cl">' + e(x.kind) + '</span><span>' + e(x.title) + '</span></a>'; }).join('') + '</div></section>';
    if (r.techniques && r.techniques.length) {
      h += '<section class="dsec"><h2 class="k">Techniques · ' + r.techniques.length + '</h2><div class="chips">' + r.techniques.map(function (k) {
        var t = TECH[k], mod = t && t.uses.some(function (u) { return u.rec === r.id && u.module; });
        return '<a' + (mod ? ' class="mod"' : '') + ' href="' + hash({ view: 'techniques', term: k, r: null, q: '', scheme: '' }) + '" title="' + e((t ? t.name : k) + (mod ? ' · has a module to lift' : '')) + '">' + e(k.split(':').pop()) + '</a>';
      }).join('') + '</div></section>';
    }
    if (r.atoms && r.atoms.length) {
      h += '<section class="dsec"><h2 class="k">Atoms · ' + r.atoms.length + '</h2><div class="chips">' + r.atoms.map(function (k) {
        return '<a href="' + hash({ view: 'atoms', term: k, r: null, q: '', scheme: '' }) + '" title="' + e(ATOM[k] ? ATOM[k].name : k) + '">' + e(k.split(':').pop()) + '</a>';
      }).join('') + '</div></section>';
    }
    var rel = (r.rel || []).filter(function (x) { return byId[x.to]; }).map(function (x) { return { ty: x.type, o: byId[x.to] }; })
      .concat((IN[r.id] || []).map(function (x) { return { ty: '← ' + x.type, o: byId[x.from] }; }));
    if (rel.length) {
      h += '<section class="dsec"><h2 class="k">Connected · ' + rel.length + '</h2><div class="rels">' + rel.map(function (x) {
        return '<a href="' + recHref(x.o) + '" data-r="' + x.o.acc + '"><span class="ty">' + e(x.ty) + '</span><span class="cl">' + e(x.o.call || x.o.acc) + '</span><span>' + e(x.o.title) + '</span></a>';
      }).join('') + '</div></section>';
    }
    var see = SEE['record:' + r.id];
    if (see) h += '<section class="dsec"><h2 class="k">See also</h2>' + see.map(seeBox).join('') + '</section>';
    $drawer.innerHTML = h + '</div>';
    $drawer.setAttribute('aria-hidden', 'false');
    $drawer.scrollTop = 0;
  }
  function markCurrent() {
    var els = document.querySelectorAll('#lib [aria-current="true"]'), i;
    for (i = 0; i < els.length; i++) els[i].removeAttribute('aria-current');
    els = document.querySelectorAll('.lanes .m.sel'); for (i = 0; i < els.length; i++) els[i].classList.remove('sel');
    if (!S.r) return;
    els = document.querySelectorAll('.pl[data-rs~="' + S.r + '"],.cdx[data-r="' + S.r + '"],.cdx[data-acc="' + S.r + '"],.cdx[data-pick="' + S.r + '"],.ledger tr[data-r="' + S.r + '"]'); for (i = 0; i < els.length; i++) els[i].setAttribute('aria-current', 'true');
    els = document.querySelectorAll('.lanes .m[data-r="' + S.r + '"]'); for (i = 0; i < els.length; i++) els[i].classList.add('sel');
  }

  /* ---------------------------------------------------------------- render */
  function render() {
    if ($q.value !== S.q && document.activeElement !== $q) $q.value = S.q;
    drawBar(); drawRail();
    if (S.view === 'plates') vPlates();
    else if (S.view === 'shelves') vShelves();
    else if (S.view === 'techniques' || S.view === 'atoms') vTerms(S.view);
    else if (S.view === 'galleries') vGalleries();
    else if (S.view === 'ledger') vLedger();
    else vAudit();
    syncDrawer(); drawSel();
    document.title = (S.r && byAcc[S.r] ? byAcc[S.r].title + ' · ' : '') + 'Library';
  }

  /* ---------------------------------------------------------------- CMS: edit, archive, remove (library/cms.js does the saving) */
  var $bar = document.getElementById('bar'), $sel = document.createElement('div'), $pan = document.createElement('div');
  $sel.id = 'selbar'; $sel.hidden = true; $pan.id = 'cmspanel'; $pan.hidden = true; document.body.appendChild($sel); document.body.appendChild($pan);
  var $btn = document.createElement('button'); $btn.type = 'button'; $btn.id = 'cmsbtn'; $btn.setAttribute('data-cms', 'toggle'); $bar.appendChild($btn);
  ED.q = Promise.resolve();
  /* Deploy status: a save is only on the site once its deploy succeeds. A failed deploy is shown, not silent (2026-11-16). */
  var DEP = { st: null, t: 0 };
  function watchDeploy(soon) {
    if (!ED.unlocked || !window.LibCMS || !LibCMS.deployState) return;
    clearTimeout(DEP.t);
    DEP.t = setTimeout(function () {
      LibCMS.deployState().then(function (d) {
        DEP.st = d; drawDep(); drawCmsBtn();
        if (d && d.state === 'building') watchDeploy(30000);
      }, function () { /* rate-limited or offline: try again later */ DEP.t = setTimeout(function () { watchDeploy(0); }, 120000); });
    }, soon == null ? 4000 : soon);
  }
  function depLine() {
    var d = DEP.st; if (!d) return '';
    var when = d.at ? new Date(d.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
    if (d.state === 'building') return '<span class="dep b">Site updating…</span>';
    if (d.state === 'failed') return '<span class="dep f">The last deploy failed (' + e(when) + '), so recent saves are not on the site. They are kept. <a href="' + e(d.url) + '">See why</a></span>';
    if (d.state === 'live') return '<span class="dep ok">Site up to date · ' + e(when) + '</span>';
    return '';
  }
  function drawDep() { var x = $sel.querySelector('.depw'); if (x) x.innerHTML = depLine(); }
  function drawCmsBtn() { $btn.textContent = ED.on ? 'Done' : 'Edit'; $btn.classList.toggle('depfail', !!(DEP.st && DEP.st.state === 'failed')); $btn.setAttribute('aria-pressed', ED.on); $btn.title = ED.unlocked ? (ED.on ? 'Stop editing' : 'Edit the library: archive, remove, projects, tags') : 'Edit the library (needs your GitHub token)'; document.body.classList.toggle('editing', ED.on); }
  function selected() { return Object.keys(ED.sel).filter(function (a) { return ED.sel[a] && byAcc[a] && !byAcc[a]._gone; }).map(function (a) { return byAcc[a]; }); }
  function names(rs) { var n = rs.map(function (r) { return r.call || r.acc; }); return n.length > 4 ? n.slice(0, 4).join(', ') + ' and ' + (n.length - 4) + ' more' : n.join(', '); }
  function status(msg, kind) { ED.status = msg; ED.stKind = kind || ''; drawSel(); if (!ED.on && msg) toast(msg); }

  function projOptions(cur, blank) {
    return (blank ? '<option value="">Move to project…</option>' : '') + CMSD.projects.map(function (p) { return '<option value="' + e(p.id) + '"' + (cur === p.id ? ' selected' : '') + '>' + e(p.title) + (p.private ? ' (private)' : p.retiring ? ' (retiring)' : '') + '</option>'; }).join('');
  }
  function drawSel() {
    if (!ED.on) { $sel.hidden = true; selh(); return; }
    var rs = selected(), n = rs.length, allArch = n && rs.every(function (r) { return r.state === 'archived'; }), allPriv = n && rs.every(function (r) { return r.visibility === 'private'; });
    var st = ED.status ? '<span class="st ' + ED.stKind + '" role="status">' + e(ED.status) + (ED.stKind === 'ok' && ED.undo ? ' <button type="button" class="lnk" data-cms="undo">Undo</button>' : '') + '</span>' : '<span class="st" role="status">' + (n ? '' : 'Pick cards to edit them. Shift-click picks a run.') + '</span>';
    if (ED.confirm) {
      var c = ED.confirm;
      $sel.innerHTML = '<div class="conf"><p><b>Remove ' + c.recs.length + ' from the site?</b> ' + e(names(c.recs)) + '. ' + (c.recs.length > 1 ? 'They leave' : 'It leaves') + ' every listing' + (c.folders.length ? ', ' + c.folders.length + ' page folder' + (c.folders.length > 1 ? 's stop' : ' stops') + ' deploying, and a copy goes to the private repo ' + e(LibCMS.archive) : ' (it has no page folder of its own to copy)') + '. The files stay in this repo. Restore any time under Removed.</p>' +
        '<div class="row"><button type="button" class="act danger" data-cms="remove-go">Remove ' + c.recs.length + '</button><button type="button" class="act" data-cms="remove-cancel">Cancel</button></div></div>';
      $sel.hidden = false; selh(); return;
    }
    $sel.innerHTML = '<div class="row"><span class="n"><b>' + n + '</b> picked</span>' +
      '<button type="button" class="act" data-cms="all">Pick all shown</button>' + (n ? '<button type="button" class="act" data-cms="clear">Clear</button>' : '') +
      '<span class="sp"></span>' +
      (n ? '<select class="act" data-bulk="project" aria-label="Move to project">' + projOptions('', true) + '</select>' +
        '<button type="button" class="act" data-cms="' + (allArch ? 'unarchive' : 'archive') + '">' + (allArch ? 'Restore from archive' : 'Archive') + '</button>' +
        '<button type="button" class="act" data-cms="' + (allPriv ? 'public' : 'private') + '">' + (allPriv ? 'Make public' : 'Make private') + '</button>' +
        '<select class="act" data-bulk="gallery" aria-label="Add to gallery"><option value="">Gallery…</option>' + (CMSD.galleries || []).map(function (g) { return '<option value="' + e(g.id) + '">' + e(g.title) + '</option>'; }).join('') + '<option value="__new">New gallery…</option></select>' +
        '<button type="button" class="act" data-cms="tag">Add tag…</button>' +
        '<button type="button" class="act danger" data-cms="remove">Remove…</button>' : '') +
      '</div><div class="depw">' + depLine() + '</div>';
    $sel.innerHTML = st + $sel.innerHTML;
    $sel.hidden = false; selh();
  }
  // the drawer and the page stop above the bar
  function selh() { document.documentElement.style.setProperty('--selh', $sel.hidden ? '0px' : ($sel.offsetHeight + (phone() ? 0 : 18)) + 'px'); }
  function drawPanel(msg) {
    $pan.innerHTML = '<div class="ph"><b>Edit the library</b><button type="button" data-cms="panel-close" aria-label="Close">×</button></div>' +
      '<p>Paste your GitHub token. It stays in this browser and is sent only to api.github.com. Saves go straight to ' + e(LibCMS.repo) + ' and are live after the next build, about two minutes.</p>' +
      '<form data-cmsform><input type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…" aria-label="GitHub token"><button type="submit" class="act">Unlock</button></form>' +
      (msg ? '<p class="msg">' + e(msg) + '</p>' : '') + '<p class="fine">Needs Contents read and write on ' + e(LibCMS.repo) + ', and on ' + e(LibCMS.archive) + ' for Remove.</p>';
    $pan.hidden = false; var i = $pan.querySelector('input'); if (i) i.focus();
  }

  /* one record's edits, the same way library/_build/cms.mjs applies them on the next build */
  function applyEntry(r, ed) {
    if (!r || !ed) return;
    r._ed = ed;
    if (ed.project && PROJ[ed.project]) r.project = ed.project;
    if (ed.kind && KIND3.indexOf(ed.kind) >= 0) r.kind3 = ed.kind;
    if (ed.title) r.title = ed.title;
    if (Array.isArray(ed.tags)) { if (ed.tags.length) r.tags = ed.tags.slice(); else delete r.tags; }
    if (ed.state === 'archived') r.state = 'archived'; else delete r.state;
    if (ed.visibility === 'private' || (ed.visibility !== 'public' && PROJ[r.project] && PROJ[r.project].private)) r.visibility = 'private'; else delete r.visibility;
    if (ed.state === 'removed') { r._gone = true; R.forEach(function (x) { if (x.work === r.id) x._gone = true; }); }
    r._hay = r._hay.split(' · cms')[0] + ' · cms ' + [r.title, (r.tags || []).join(' '), PROJ[r.project] ? PROJ[r.project].title : ''].join(' ').toLowerCase();
  }
  function snap(rs) { return rs.map(function (r) { return { r: r, v: { project: r.project, kind3: r.kind3, title: r.title, tags: r.tags, state: r.state, visibility: r.visibility, _gone: r._gone } }; }); }
  function unsnap(sv) { sv.forEach(function (x) { for (var k in x.v) { if (x.v[k] === undefined) delete x.r[k]; else x.r[k] = x.v[k]; } }); }

  /* every change is one commit; they go one after another */
  function commit(rs, op, patch, message, per, after) {
    if (!rs.length) return;
    var ids = rs.map(function (r) { return r.id; }), sv = snap(rs);
    rs.forEach(function (r) { var ed = {}; for (var k in patch) if (patch[k] != null) ed[k] = patch[k]; if (per && per[r.id]) for (var j in per[r.id]) ed[j] = per[r.id][j]; ed.project = ed.project || r.project; if (!('kind' in ed)) ed.kind = r.kind3; if (!('tags' in ed)) ed.tags = r.tags || []; if (!('visibility' in ed)) { var pp = PROJ[ed.project] && PROJ[ed.project].private; if (r.visibility === 'private' && !pp) ed.visibility = 'private'; else if (r.visibility !== 'private' && pp) ed.visibility = 'public'; } if (!('state' in ed) && r.state === 'archived' && op !== 'unarchive') ed.state = 'archived'; applyEntry(r, ed); });
    ED.sel = {}; render(); status('Saving: ' + message + '…');
    ED.q = ED.q.then(function () {
      return LibCMS.save({ op: op, ids: ids, patch: patch, per: per }, message).then(function (x) {
        ids.forEach(function (id) { if (byId[id] && x.E.records[id]) applyEntry(byId[id], x.E.records[id]); });
        ED.undo = UNDO[op] ? { op: UNDO[op], ids: ids } : null;
        status('Saved: ' + message + '. On the site after the next build, about two minutes.', 'ok'); render(); if (after) after(x); watchDeploy(6000);
      }, function (err) {
        unsnap(sv); render();
        status('Not saved: ' + err.message + (err.status === 401 ? '. The token was refused; lock and paste it again.' : ''), 'bad');
      });
    });
  }
  var UNDO = { archive: 'unarchive', unarchive: 'archive', private: 'public', public: 'private' };
  function act(name, rs) {
    var n = names(rs);
    if (name === 'archive') return commit(rs, 'archive', { state: 'archived' }, 'Archive ' + n);
    if (name === 'unarchive') return commit(rs, 'unarchive', { state: null }, 'Restore ' + n + ' from the archive');
    if (name === 'private') return commit(rs, 'private', { visibility: 'private' }, 'Make ' + n + ' private');
    if (name === 'public') return commit(rs, 'public', { visibility: 'public' }, 'Make ' + n + ' public');
    if (name === 'remove') { var folders = rs.map(function (r) { return safeFolder(r, rs); }).filter(Boolean); ED.confirm = { recs: rs, folders: folders }; return drawSel(); }
  }

  /* Remove: the page folder and thumbnails are copied to the private repo, then the record is marked removed.
     build-site.mjs then stops deploying the folder. Nothing is deleted from this repo. */
  function folderOf(r) {
    var h = r.href || ''; if (!h || /^https?:/.test(h)) return '';
    var p = h.replace(/^(\.\.\/)+/, '').replace(/[?#].*$/, '').replace(/index\.html$/, ''), parts = p.split('/').filter(Boolean);
    return parts.length >= 2 ? parts.join('/') + '/' : '';
  }
  function safeFolder(r, removing) {
    var f = folderOf(r); if (!f) return '';
    if (L.collections.some(function (c) { return c.path && c.path.replace(/\/?$/, '/') === f; })) return '';
    var ids = {}; removing.forEach(function (x) { ids[x.id] = 1; });
    var clash = R.some(function (x) { if (ids[x.id] || x._gone || x.work === r.id) return false; var g = folderOf(x); return g && (g.indexOf(f) === 0 || f.indexOf(g) === 0); });
    return clash ? '' : f;
  }
  function removeGo() {
    var c = ED.confirm; ED.confirm = null; if (!c) return;
    var rs = c.recs, date = new Date().toISOString().slice(0, 10), prefix = 'removed/' + date + '/', n = names(rs);
    if (!ED.archive) { status('Not removed: this token cannot write to ' + LibCMS.archive + ' yet. Archive works without it.', 'bad'); return; }
    status('Copying ' + n + ' to the private repo…');
    var per = {}, extra = {};
    ED.q = ED.q.then(function () {
      return Promise.all(rs.map(function (r) {
        var f = safeFolder(r, rs), thumbs = [r.thumb, r.thumb_2x].filter(function (t) { return t && /^thumbs\//.test(t); }).map(function (t) { return 'library/' + t; });
        per[r.id] = { path: f || null, acc: r.acc, call: r.call || null, title_was: r.title };
        var snapR = {}; for (var k in r) if (k.charAt(0) !== '_') snapR[k] = r[k]; extra['records/' + r.acc + '.json'] = { removed: new Date().toISOString(), from: LibCMS.repo, folder: f || null, record: snapR };
        return Promise.all([f ? LibCMS.listFolder(f) : Promise.resolve([])].concat(thumbs.map(LibCMS.fileAt))).then(function (ls) { return [].concat.apply([], ls); });
      })).then(function (lists) {
        var files = [].concat.apply([], lists);
        if (files.length > 600) throw new Error(files.length + ' files is more than one removal should copy; nothing was removed');
        return LibCMS.copyToArchive(files, prefix, extra, 'Removed from ' + LibCMS.repo + ' by the library CMS: ' + n, function (i, t) { if (i % 5 === 0 || i === t) status('Copying ' + n + ' to the private repo · ' + i + ' of ' + t + ' files'); });
      }).then(function (sha) {
        rs.forEach(function (r) { per[r.id].archive = LibCMS.archive + '@' + sha.slice(0, 10) + ':' + prefix; });
        commit(rs, 'remove', { state: 'removed' }, 'Remove ' + n, per, function () {
          rs.forEach(function (r) { ED.removed.unshift({ id: r.id, acc: r.acc, call: r.call, title: r.title, project: r.project, path: per[r.id].path || '', at: new Date().toISOString(), archive: per[r.id].archive }); });
          render();
        });
      }).catch(function (err) { status('Not removed: ' + err.message, 'bad'); });
    });
  }
  function restoreRemoved(id) {
    var x = ED.removed.filter(function (y) { return y.id === id; })[0]; if (!x) return;
    x.pending = true; render(); status('Saving: restore ' + (x.call || x.acc) + '…');
    ED.q = ED.q.then(function () {
      return LibCMS.save({ op: 'restore', ids: [id], patch: { state: null, path: null } }, 'Restore ' + (x.call || x.acc) + ' (removed)').then(function () {
        x.pending = false; x.restored = true; status('Saved: ' + (x.call || x.acc) + ' is back after the next build, about two minutes.', 'ok'); render(); watchDeploy(6000);
      }, function (err) { x.pending = false; status('Not saved: ' + err.message, 'bad'); render(); });
    });
  }
  function pick(acc, range) {
    if (range && ED.last && ED.last !== acc) {
      var list = LIST.concat(archivedShown()), a = list.indexOf(byAcc[ED.last]), b = list.indexOf(byAcc[acc]);
      if (a >= 0 && b >= 0) { list.slice(Math.min(a, b), Math.max(a, b) + 1).forEach(function (r) { ED.sel[r.acc] = true; }); ED.last = acc; return repick(); }
    }
    ED.sel[acc] = !ED.sel[acc]; ED.last = acc; repick();
  }
  function repick() {
    ED.undo = null;
    var els = document.querySelectorAll('[data-pick]');
    for (var i = 0; i < els.length; i++) els[i].setAttribute('aria-pressed', !!ED.sel[els[i].getAttribute('data-pick')]);
    ED.status = ''; drawSel();
  }
  function cms(name) {
    if (name === 'toggle') { if (!ED.unlocked) return drawPanel(); if (!ED.on && ED.shared) { ED.shared = false; try { localStorage.setItem('tools.view', 'mine'); } catch (err) {} } ED.on = !ED.on; ED.sel = {}; ED.confirm = null; ED.status = ''; ED.pjf = null; drawCmsBtn(); return render(); }
    if (name === 'panel-close') { $pan.hidden = true; return; }
    if (name === 'view-mine' || name === 'view-shared') {
      ED.shared = name === 'view-shared'; try { localStorage.setItem('tools.view', ED.shared ? 'shared' : 'mine'); } catch (err) {}
      if (ED.shared && ED.on) { ED.on = false; ED.sel = {}; drawCmsBtn(); }
      if (ED.shared && S.f.project.length && PROJ[S.f.project[0]] && PROJ[S.f.project[0]].private) { var fs = {}; for (var a3 in S.f) fs[a3] = S.f[a3]; fs.project = []; return go({ f: fs }); }
      return render();
    }
    if (name === 'lock') { LibCMS.setToken(''); ED.unlocked = ED.on = false; ED.sel = {}; drawCmsBtn(); return render(); }
    if (name === 'all') { LIST.concat(S.open.arch ? archivedShown() : []).forEach(function (r) { ED.sel[r.acc] = true; }); return repick(); }
    if (name === 'clear') { ED.sel = {}; return repick(); }
    if (name === 'remove-go') return removeGo();
    if (name === 'undo') { var u = ED.undo; ED.undo = null; if (!u) return; return act(u.op, u.ids.map(function (id) { return byId[id]; }).filter(Boolean)); }
    if (name === 'remove-cancel') { ED.confirm = null; return drawSel(); }
    if (name === 'tag') {
      ED.tagging = true; var rs0 = selected();
      $sel.querySelector('.row').insertAdjacentHTML('beforeend', '<form class="tagf" data-tagform><input aria-label="Tag to add" placeholder="tag" spellcheck="false"><button type="submit" class="act">Add to ' + rs0.length + '</button></form>');
      return $sel.querySelector('.tagf input').focus();
    }
    var dr = /^d-(.*)/.exec(name), rs = dr ? [byAcc[S.r]].filter(Boolean) : selected();
    if (dr && name === 'd-remove') { ED.sel = {}; ED.sel[S.r] = true; return act('remove', rs); }
    return act(dr ? dr[1] : name, rs);
  }
  function editSection(r) {
    var tags = (r.tags || []).join(', ');
    return '<section class="dsec ed"><h2 class="k">Edit</h2><div class="edf">' +
      '<label><span class="k">Title</span><input data-edf="title" value="' + e(r.title) + '" spellcheck="true"></label>' +
      '<label><span class="k">Project</span><select data-edf="project">' + projOptions(r.project) + '</select></label>' +
      '<label><span class="k">Kind</span><select data-edf="kind">' + KIND3.map(function (k) { return '<option value="' + k + '"' + (r.kind3 === k ? ' selected' : '') + '>' + KIND3_LABEL[k].replace(/s$/, '') + '</option>'; }).join('') + '</select></label>' +
      '<label><span class="k">Tags</span><input data-edf="tags" value="' + e(tags) + '" placeholder="comma, separated" spellcheck="false"></label></div>' +
      '<div class="edacts"><button type="button" class="act" data-cms="d-' + (r.state === 'archived' ? 'unarchive' : 'archive') + '">' + (r.state === 'archived' ? 'Restore from archive' : 'Archive') + '</button>' +
      '<button type="button" class="act" data-cms="d-' + (r.visibility === 'private' ? 'public' : 'private') + '">' + (r.visibility === 'private' ? 'Make public' : 'Make private') + '</button>' +
      '<button type="button" class="act danger" data-cms="d-remove">Remove…</button></div></section>';
  }
  function editField(el) {
    var r = byAcc[S.r]; if (!r) return;
    var f = el.getAttribute('data-edf'), v = el.value.trim();
    if (f === 'title') { if (!v || v === r.title) return; return commit([r], 'title', { title: v }, 'Retitle ' + (r.call || r.acc) + ' as “' + v + '”'); }
    if (f === 'project') { if (v === r.project) return; return commit([r], 'project', { project: v }, 'Move ' + (r.call || r.acc) + ' to ' + PROJ[v].title); }
    if (f === 'kind') { if (v === r.kind3) return; return commit([r], 'kind', { kind: v }, 'Make ' + (r.call || r.acc) + ' a ' + v); }
    if (f === 'tags') { var t = v.split(',').map(function (x) { return x.trim(); }).filter(Boolean); if (t.join(',') === (r.tags || []).join(',')) return; return commit([r], 'tags', { tags: t }, 'Tag ' + (r.call || r.acc) + ': ' + (t.join(', ') || 'none')); }
  }
  // what changed on GitHub since this page was built
  function overlay() {
    if (!ED.unlocked || !window.LibCMS) return;
    watchDeploy(0);
    LibCMS.check(LibCMS.token()).then(function (c) { ED.archive = c.archive; if (!c.tools) { ED.unlocked = ED.on = false; drawCmsBtn(); status('The saved token was refused. Edit to paste it again.', 'bad'); render(); } });
    LibCMS.readEdits().then(function (x) {
      if (x.E.galleries) CMSD.galleries = x.E.galleries;
      if (x.E.projects && x.E.projects.length) { CMSD.projects = x.E.projects; syncProjects(); }
      var seen = {}; ED.removed.forEach(function (y) { seen[y.id] = y; });
      Object.keys(x.E.records || {}).forEach(function (id) {
        var ed = x.E.records[id];
        if (byId[id]) applyEntry(byId[id], ed);
        if (ed.state === 'removed' && !seen[id]) ED.removed.unshift({ id: id, acc: ed.acc || '', call: ed.call || '', title: ed.title_was || id, project: byId[id] ? byId[id].project : '', path: ed.path || '', at: ed.at || '', archive: ed.archive || '' });
      });
      ED.removed.forEach(function (y) { var ed = (x.E.records || {})[y.id]; if (!ed || ed.state !== 'removed') y.restored = true; });
      render();
    }, function () {});
  }
  $pan.addEventListener('submit', function (ev) {
    ev.preventDefault(); var i = $pan.querySelector('input'), t = i && i.value.trim(); if (!t) return;
    drawPanel('Checking…'); 
    LibCMS.check(t).then(function (c) {
      if (!c.tools) return drawPanel('GitHub refused this token for ' + LibCMS.repo + '.');
      LibCMS.setToken(t); ED.unlocked = true; ED.on = true; ED.archive = c.archive; $pan.hidden = true; drawCmsBtn();
      status(c.archive ? 'Editing. Pick cards, or open one for its details.' : 'Editing. This token cannot reach ' + LibCMS.archive + ', so Remove is off; Archive works.', c.archive ? '' : 'bad');
      render(); overlay();
    }, function (err) { drawPanel('Could not reach GitHub: ' + err.message); });
  });
  document.addEventListener('submit', function (ev) {
    var gf = ev.target.closest && ev.target.closest('[data-galform]');
    if (gf) {
      ev.preventDefault(); var gid = gf.getAttribute('data-galform'), gt = gf.t.value.trim(), gn = gf.n.value.trim(), gp = gf.p.checked; if (!gt) return gf.t.focus();
      if (!gid) return saveGallery({ id: gslug(gt), set: { title: gt, tag: gt, note: gn, private: gp } }, [], {}, 'New gallery ' + gt);
      var g0 = (CMSD.galleries || []).filter(function (x) { return x.id === gid; })[0];
      return saveGallery({ id: gid, set: { title: gt, note: gn, private: gp } }, [], {}, 'Gallery ' + (g0 ? g0.title : gid) + (g0 && gt !== g0.title ? ': rename to ' + gt : ': details'));
    }
    var f = ev.target.closest && ev.target.closest('[data-pjform]'); if (!f) return;
    ev.preventDefault();
    var id = f.getAttribute('data-pjform'), t = f.t.value.trim(), note = f.n.value.trim(), pv = f.p.checked, p = id ? PROJ[id] : null;
    if (!t) { f.t.focus(); return; }
    if (!p) return saveProject({ id: slug(t), set: { title: t, note: note, private: pv } }, 'New project ' + t + (pv ? ' (private)' : ''));
    var set = {}, said = [];
    if (t !== p.title) { set.title = t; said.push('rename ' + p.title + ' to ' + t); }
    if (note !== (p.note || '')) { set.note = note; said.push('note'); }
    if (pv !== !!p.private) { set.private = pv; said.push(pv ? 'make private' : 'make public'); }
    if (!said.length) { ED.pjf = null; return drawRail(); }
    saveProject({ id: id, set: set }, 'Project ' + p.title + ': ' + said.join(', '));
  });
  $sel.addEventListener('submit', function (ev) {
    var ng = ev.target.closest && ev.target.closest('[data-newgal]');
    if (ng) { ev.preventDefault(); ev.stopImmediatePropagation(); var nm = ng.querySelector('input').value.trim(); if (!nm) return; var rsn = selected(), pern = {}; rsn.forEach(function (r) { var a = (r.tags || []).slice(); if (a.indexOf(nm) < 0) a.push(nm); pern[r.id] = { tags: a }; }); return saveGallery({ id: gslug(nm), set: { title: nm, tag: nm } }, rsn, pern, 'New gallery ' + nm + ' with ' + names(rsn)); }
    ev.preventDefault(); var i = $sel.querySelector('.tagf input'), t = i && i.value.trim(); if (!t) return;
    var rs = selected(), per = {}; rs.forEach(function (r) { var a = (r.tags || []).slice(); if (a.indexOf(t) < 0) a.push(t); per[r.id] = { tags: a }; });
    commit(rs, 'tag', {}, 'Tag ' + names(rs) + ': ' + t, per);
  });
  drawCmsBtn();

  /* ---------------------------------------------------------------- galleries (2026-11-16)
     A gallery is a tag bundle: every record carrying its tag, plus any items listed by hand (techniques as R:<id>,
     records by id or call). Its cards open the work's own page, where the dials are. Saved in edits.json → galleries. */
  var REG = null, regLoading = false;
  function needReg() {
    if (REG || regLoading) return;
    regLoading = true; var s = document.createElement('script'); s.src = BASE + 'techniques-templates/_shared/reg-index.js';
    s.onload = function () { var R0 = window.TT_REG || { entries: [] }; REG = {}; R0.entries.forEach(function (x) { REG[x.id] = x; }); if (S.view === 'galleries') render(); };
    s.onerror = function () { REG = {}; }; document.head.appendChild(s);
  }
  var byCall = {}; R.forEach(function (r) { if (r.call && !byCall[r.call]) byCall[r.call] = r; });
  function ttp(p) { return !p ? '' : /^(https?:|\.\.\/)/.test(p) ? p : BASE + 'techniques-templates/' + p; }
  function galleries() { return (CMSD.galleries || []).filter(function (g) { return !g.private || mine(); }); }
  function galMembers(g) {
    var out = [], seen = {};
    (g.items || []).forEach(function (k) {
      if (/^R:/.test(k)) { var t = REG && REG[k.slice(2)]; if (t && t.href && !seen[k]) { seen[k] = 1; out.push({ key: k, t: t }); } return; }
      var r = byId[k] || byCall[k]; if (r && visible(r) && r.state !== 'archived' && !seen[r.id]) { seen[r.id] = 1; out.push({ key: k, r: r }); }
    });
    if (g.tag) WORKS.forEach(function (r) { if (visible(r) && r.state !== 'archived' && (r.tags || []).indexOf(g.tag) >= 0 && !seen[r.id]) { seen[r.id] = 1; out.push({ key: r.id, r: r, byTag: true }); } });
    return out;
  }
  function galPic(m) { return m.r ? (m.r.thumb || '') : ttp(m.t.pic); }
  function regCard(m, g) {
    var t = m.t, fam = (t.family || '').replace(/-/g, ' ');
    return '<a class="cdx" href="' + e(ttp(t.href)) + '" title="' + e(t.name) + '"><span class="cell"><span class="fr fit" style="--ar:1.3333"><img src="' + e(ttp(t.pic)) + '" alt="" loading="lazy" decoding="async"></span>' + (ED.on ? galRm(g, m) : '') + '</span>' +
      '<span class="l1"><b class="call">' + e((t.studies && t.studies[0] && t.studies[0].code) || 'Technique') + '</b><span class="col">' + e(fam) + '</span></span><span class="tt">' + e(t.name) + '</span><span class="l3"><span class="st">technique</span></span></a>';
  }
  function galRm(g, m) { return '<span class="galrm" role="button" tabindex="0" data-galrm="' + e(m.key) + '" data-gal="' + e(g.id) + '" title="Take out of this gallery" aria-label="Take ' + e(m.r ? m.r.title : m.t.name) + ' out of this gallery">×</span>'; }
  function galCard(g) {
    var ms = galMembers(g), pics = ms.map(galPic).filter(Boolean).slice(0, 4);
    return '<a class="gcard" href="#/galleries/' + encodeURIComponent(g.id) + '"><span class="mos n' + pics.length + '">' + pics.map(function (p) { return '<img src="' + e(p) + '" alt="" loading="lazy" decoding="async">'; }).join('') + '</span>' +
      '<span class="gt">' + e(g.title) + (g.private ? ' <i class="pv">private</i>' : '') + '</span><span class="gm">' + ms.length + ' ' + (ms.length === 1 ? 'piece' : 'pieces') + (g.note ? ' · ' + e(g.note) : '') + '</span></a>';
  }
  function vGalleries() {
    needReg();
    var g = S.term ? (CMSD.galleries || []).filter(function (x) { return x.id === S.term && (!x.private || mine()); })[0] : null;
    if (S.term && !g) { $lib.innerHTML = '<div class="empty">No gallery called “' + e(S.term) + '”. <a href="#/galleries">All galleries</a></div>' + foot(); return; }
    if (g) {
      var ms = galMembers(g); LIST = ms.filter(function (m) { return m.r; }).map(function (m) { return m.r; });
      var head = '<header class="lh"><div class="lh1"><p class="meta"><a class="lnk" href="#/galleries">Galleries</a></p><h1>' + e(g.title) + '</h1><p class="meta"><b>' + ms.length + '</b> ' + (ms.length === 1 ? 'piece' : 'pieces') + (g.note ? ' · ' + e(g.note) : '') + (g.tag ? ' · tag “' + e(g.tag) + '”' : '') + (g.private ? ' · <span class="pv">private: only you see this</span>' : '') + '</p></div>' +
        '<div class="lh2"><button type="button" class="act" data-galcopy>Copy link</button>' + (ED.on ? '<button type="button" class="act" data-galedit="' + e(g.id) + '">Rename or delete</button>' : '') + '</div></header>';
      var form = ED.on && ED.galf === g.id ? galForm(g) : '';
      var cards = ms.map(function (m) { return m.r ? card(m.r).replace('</span><span class="l1">', (ED.on ? galRm(g, m) : '') + '</span><span class="l1">') : regCard(m, g); }).join('');
      var none = !ms.length ? '<div class="empty">' + (REG ? 'Nothing in this gallery yet.' + (ED.on ? ' Pick cards in the library and choose Gallery → ' + e(g.title) + '.' : '') : 'Loading…') + '</div>' : '';
      $lib.innerHTML = head + form + (cards ? '<div class="cards gal">' + cards + '</div>' : none) + foot();
      return;
    }
    var gs = galleries();
    var head2 = '<header class="lh"><div class="lh1"><h1>Galleries</h1><p class="meta"><b>' + gs.length + '</b> ' + (gs.length === 1 ? 'gallery' : 'galleries') + ' · a gallery is a tag: pick cards in Edit, then Gallery</p></div>' +
      (ED.on ? '<div class="lh2"><button type="button" class="act" data-galnew>+ New gallery</button></div>' : '') + '</header>';
    $lib.innerHTML = head2 + (ED.on && ED.galf === '' ? galForm(null) : '') + (gs.length ? '<div class="gals">' + gs.map(galCard).join('') + '</div>' : '<div class="empty">No galleries yet.</div>') + foot();
  }
  function galForm(g) {
    return '<form class="pjf galf" data-galform="' + e(g ? g.id : '') + '"><input name="t" value="' + e(g ? g.title : '') + '" placeholder="Gallery name" aria-label="Gallery name" spellcheck="true">' +
      '<input name="n" value="' + e(g && g.note || '') + '" placeholder="Note (optional)" aria-label="Note">' +
      '<label class="pv"><input type="checkbox" name="p"' + (g && g.private ? ' checked' : '') + '> Private <small>only you see it</small></label>' +
      '<div class="pjb"><button type="submit" class="act">' + (g ? 'Save' : 'Create') + '</button><button type="button" class="act" data-galcancel>Cancel</button>' + (g ? '<button type="button" class="act danger" data-galdrop="' + e(g.id) + '">Delete gallery</button><span class="nd">tags stay on the pieces</span>' : '') + '</div></form>';
  }
  function gslug(t) { var b = String(t).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'gallery', id = b, i = 2; while ((CMSD.galleries || []).some(function (x) { return x.id === id; })) id = b + '-' + i++; return id; }
  function galLocal(def) {
    var G = CMSD.galleries = CMSD.galleries || [], i = -1; G.forEach(function (x, j) { if (x.id === def.id) i = j; });
    if (def.drop) { if (i >= 0) G.splice(i, 1); return; }
    var cur = i >= 0 ? G[i] : { id: def.id }; for (var k in def.set) { if (def.set[k] == null || def.set[k] === false || def.set[k] === '') delete cur[k]; else cur[k] = def.set[k]; } if (i < 0) G.push(cur);
  }
  // one commit: the gallery definition, and the tags on any pieces it touches
  function saveGallery(def, rs, per, message) {
    var prev = JSON.parse(JSON.stringify(CMSD.galleries || [])), sv = snap(rs || []);
    galLocal(def); (rs || []).forEach(function (r) { if (per && per[r.id]) applyEntry(r, Object.assign({}, r._ed || {}, per[r.id], { project: r.project, kind: r.kind3 })); });
    ED.galf = null; ED.sel = {}; render(); status('Saving: ' + message + '…');
    ED.q = ED.q.then(function () {
      return LibCMS.save({ op: def.drop ? 'gallery-delete' : 'gallery', ids: (rs || []).map(function (r) { return r.id; }), patch: {}, per: per, galleryDef: def }, message).then(function (x) {
        CMSD.galleries = x.E.galleries || CMSD.galleries; status('Saved: ' + message + '. On the site after the next build, about two minutes.', 'ok'); render(); watchDeploy(6000);
      }, function (err) { CMSD.galleries = prev; unsnap(sv); render(); status('Not saved: ' + err.message, 'bad'); });
    });
  }
  function addToGallery(g, rs) {
    var tag = g.tag || g.title, per = {};
    rs.forEach(function (r) { var a = (r.tags || []).slice(); if (a.indexOf(tag) < 0) a.push(tag); per[r.id] = { tags: a }; });
    saveGallery({ id: g.id, set: g.tag ? {} : { tag: tag } }, rs, per, 'Add ' + names(rs) + ' to the gallery ' + g.title);
  }
  function takeOut(gid, key) {
    var g = (CMSD.galleries || []).filter(function (x) { return x.id === gid; })[0]; if (!g) return;
    var items = (g.items || []).filter(function (k) { return k !== key; }), r = byId[key] || byCall[key], rs = [], per = {};
    if (r && g.tag && (r.tags || []).indexOf(g.tag) >= 0) { rs = [r]; per[r.id] = { tags: (r.tags || []).filter(function (t) { return t !== g.tag; }) }; }
    saveGallery({ id: gid, set: { items: items.length ? items : null } }, rs, per, 'Take ' + (r ? (r.call || r.acc) : key.replace(/^R:/, '')) + ' out of ' + g.title);
  }
  /* ---------------------------------------------------------------- events */
  function toggle(k, v) { var a = S.f[k].slice(), i = a.indexOf(v); if (i < 0) a.push(v); else a.splice(i, 1); var f = {}; for (var x in S.f) f[x] = S.f[x]; f[k] = a; go({ f: f }); }
  function toast(msg) { var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 1400); }
  function copy(text, msg) {
    var done = function () { toast(msg); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (err) { toast('Copy failed'); } ta.remove(); }
  }
  document.addEventListener('click', function (ev) {
    var pk = ED.on && ev.target.closest && !ev.target.closest('.nw,.galrm') && ev.target.closest('[data-pick]');
    if (pk) { ev.preventDefault(); pick(pk.getAttribute('data-pick'), ev.shiftKey); return; }
    var gx = ev.target.closest && ev.target.closest('[data-galrm],[data-galnew],[data-galedit],[data-galcancel],[data-galdrop],[data-galcopy]');
    if (gx) {
      ev.preventDefault(); ev.stopPropagation(); var gd = gx.dataset;
      if (gd.galrm) return takeOut(gd.gal, gd.galrm);
      if ('galnew' in gd) { ED.galf = ''; return render(); }
      if (gd.galedit) { ED.galf = gd.galedit; return render(); }
      if ('galcancel' in gd) { ED.galf = null; return render(); }
      if (gd.galdrop) { var gq = (CMSD.galleries || []).filter(function (x) { return x.id === gd.galdrop; })[0]; S.term = null; setHash(hash({ view: 'galleries', term: null })); return saveGallery({ id: gd.galdrop, drop: true }, [], {}, 'Delete the gallery ' + (gq ? gq.title : gd.galdrop)); }
      if ('galcopy' in gd) return copy(location.href.split('#')[0] + hash({ view: 'galleries', term: S.term, q: '', f: noF(), r: null }), 'Link copied');
    }
    var pe = ev.target.closest && ev.target.closest('[data-pjedit],[data-pjcancel],[data-pjdrop]');
    if (pe) {
      ev.preventDefault(); ev.stopPropagation();
      if (pe.hasAttribute('data-pjcancel')) { ED.pjf = null; return drawRail(); }
      if (pe.hasAttribute('data-pjdrop')) { var dp = PROJ[pe.getAttribute('data-pjdrop')]; if (dp && !pjAll(dp.id)) { if (S.f.project[0] === dp.id) S.f.project = []; saveProject({ id: dp.id, drop: true }, 'Delete the project ' + dp.title); } return; }
      ED.pjf = { id: pe.getAttribute('data-pjedit') }; drawRail(); var fi = $rail.querySelector('.pjf input[name="t"]'); if (fi) { fi.focus(); fi.select(); } return;
    }
    var t = ev.target.closest('[data-cms],[data-proj],[data-kind3],[data-restore],[data-nav],[data-goarch],[data-clearref],[data-clearfilt],[data-view],[data-f],[data-clear],[data-clearall],[data-unq],[data-d],[data-r],[data-close],[data-term],[data-scheme],[data-ts],[data-ls],[data-fd],[data-copy],[data-railtog]');
    if (!t) {
      // a link to another view is routed here, so it works where the host owns the address bar
      var a = ev.target.closest('a[href^="#/"]');
      if (a && !(ev.metaKey || ev.ctrlKey || ev.shiftKey)) { ev.preventDefault(); parse(a.getAttribute('href')); setHash(hash()); render(); window.scrollTo(0, 0); return; }
      if (S.r && !ev.target.closest('#drawer') && !ev.target.closest('a,button,input,select')) go({ r: null });
      return;
    }
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
    var d = t.dataset;
    if (d.cms) { ev.preventDefault(); return cms(d.cms); }
    if ('proj' in d) { ev.preventDefault(); var fp = {}; for (var y in S.f) fp[y] = S.f[y]; fp.project = d.proj ? [d.proj] : []; $rail.classList.remove('open'); return go({ f: fp, view: S.view === 'ledger' || S.view === 'shelves' ? S.view : 'plates', r: null }); }
    if ('kind3' in d) { ev.preventDefault(); var fk = {}; for (var z in S.f) fk[z] = S.f[z]; fk.kind3 = d.kind3 ? [d.kind3] : []; return go({ f: fk }); }
    if ('restore' in d) { ev.preventDefault(); return restoreRemoved(d.restore); }
    if ('nav' in d) {
      ev.preventDefault(); if (d.nav === 'technique') return go({ view: 'techniques', term: null, r: null, scheme: '' });
      var fn = {}; for (var a1 in S.f) fn[a1] = S.f[a1]; fn.kind3 = d.nav ? [d.nav] : []; return go({ view: 'plates', f: fn, term: null, r: null, scheme: '' });
    }
    if ('goarch' in d) { ev.preventDefault(); S.open.arch = true; render(); var ae = document.getElementById('archived'); if (ae) ae.scrollIntoView({ block: 'start' }); return; }
    if ('clearref' in d) { ev.preventDefault(); var fr = {}; for (var a2 in S.f) fr[a2] = S.f[a2]; REFINE.concat([['collection'], ['access']]).forEach(function (x) { fr[x[0]] = []; }); return go({ f: fr }); }
    if ('clearfilt' in d) { ev.preventDefault(); $q.value = ''; var fc2 = noF(); fc2.project = S.f.project.slice(); fc2.kind3 = S.f.kind3.slice(); return go({ q: '', f: fc2 }); }
    if ('railtog' in d) { $rail.classList.toggle('open'); drawRail(); return; }
    if ('copy' in d) {
      var r = byAcc[S.r], o = {}; for (var k in r) if (k.charAt(0) !== '_') o[k] = r[k];
      if (d.copy === 'record') copy(JSON.stringify(o, null, 2), 'Record copied'); else copy(location.href.split('#')[0] + hash({ view: 'plates', term: null, q: '', scheme: '', f: NOFILTER }), 'Link copied');
      return;
    }
    ev.preventDefault();
    if (d.view) return go({ view: d.view, term: null, r: null, scheme: '' });
    if ('close' in d) return go({ r: null });
    if ('r' in d) { if (d.r) go({ r: d.r === S.r && !t.closest('#drawer') ? null : d.r }); return; }
    if (d.f) return toggle(d.f, d.v);
    if (d.clear) { var f = {}; for (var x in S.f) f[x] = S.f[x]; f[d.clear] = []; return go({ f: f }); }
    if ('clearall' in d) { $q.value = ''; return go({ q: '', f: noF() }); }
    if ('unq' in d) { $q.value = ''; return go({ q: '' }); }
    if (d.d) return go({ d: d.d });
    if ('term' in d) return go({ term: S.term === d.term ? null : d.term });
    if ('scheme' in d) return go({ scheme: d.scheme, term: null });
    if (d.ts) return go({ tsort: d.ts });
    if (d.ls) { if (S.ls === d.ls) S.ld = -S.ld; else { S.ls = d.ls; S.ld = 1; } return render(); }
    if (d.fd) { S.open[d.fd] = !S.open[d.fd]; return render(); }
  });
  document.addEventListener('change', function (ev) {
    if (ev.target.matches('[data-sort]')) go({ sort: ev.target.value });
    else if (ev.target.matches('[data-edf]')) editField(ev.target);
    else if (ev.target.matches('[data-bulk="gallery"]') && ev.target.value) {
      var gv = ev.target.value, rsg = selected();
      if (gv === '__new') { $sel.querySelector('.row').insertAdjacentHTML('beforeend', '<form class="tagf" data-newgal><input aria-label="New gallery name" placeholder="Gallery name" spellcheck="true"><button type="submit" class="act">Make gallery of ' + rsg.length + '</button></form>'); $sel.querySelector('[data-newgal] input').focus(); return; }
      var gg = (CMSD.galleries || []).filter(function (x) { return x.id === gv; })[0]; if (gg) addToGallery(gg, rsg);
    }
    else if (ev.target.matches('[data-bulk="project"]') && ev.target.value) { var v = ev.target.value, rs = selected(); commit(rs, 'project', { project: v }, 'Move ' + names(rs) + ' to ' + PROJ[v].title); }
  });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && ev.target.matches && ev.target.matches('input[data-edf]')) { ev.preventDefault(); ev.target.blur(); } }, true);
  var qt; $q.addEventListener('input', function () { clearTimeout(qt); qt = setTimeout(function () { go({ q: $q.value.trim(), term: null }, true); }, 90); });
  document.addEventListener('keydown', function (ev) {
    var typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);
    if (ev.key === '/' && !typing) { ev.preventDefault(); $q.focus(); $q.select(); }
    else if (ev.key === 'Escape') { if (S.r) go({ r: null }); else if (typing) $q.blur(); else if (S.q) { $q.value = ''; go({ q: '' }); } }
    else if (S.r && !typing && (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight')) {
      var i = LIST.indexOf(byAcc[S.r]), n = LIST[i + (ev.key === 'ArrowRight' ? 1 : -1)];
      if (i >= 0 && n) { ev.preventDefault(); go({ r: n.acc }, true); }
    }
  });
  // a picture that fails to load leaves an empty frame
  document.addEventListener('error', function (ev) {
    var im = ev.target, fr = im && im.tagName === 'IMG' && im.parentNode;
    if (!fr || !fr.classList || !fr.classList.contains('fr')) return;
    fr.classList.add('none'); fr.innerHTML = '<i>no picture</i>';
  }, true);
  // arrival chart: name the mark under the pointer
  document.addEventListener('mousemove', function (ev) {
    var t = ev.target.closest && ev.target.closest('.lanes .hit');
    if (!t) { if (!$tip.hidden) $tip.hidden = true; return; }
    var r = byAcc[t.dataset.r];
    $tip.innerHTML = e(label(r)) + '<i>' + r.acc + ' · ' + e(COL[r.collection].title) + ' · ' + e(r.dates.accessioned) + '</i>';
    $tip.hidden = false;
    $tip.style.left = Math.min(ev.clientX + 12, window.innerWidth - $tip.offsetWidth - 8) + 'px'; $tip.style.top = (ev.clientY + 16) + 'px';
  });
  var rt, lastW = window.innerWidth;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (window.innerWidth !== lastW) { lastW = window.innerWidth; render(); } }, 160); });
  window.addEventListener('popstate', function () { MEM = null; parse(); render(); });
  window.addEventListener('hashchange', function () { MEM = null; parse(); render(); });

  parse(); render(); overlay();
})();
