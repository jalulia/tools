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

  var KINDS = ['technique', 'atom', 'exploration', 'coupling', 'study', 'template', 'instrument', 'document', 'plate'].filter(function (k) { return (k !== 'document' && k !== 'plate') || R.some(function (r) { return r.kind === k; }); });
  var STATUSES = ['canonical', 'exploration', 'proposed', 'unsorted', 'known-failure', 'historical', ''];
  var ACCESS = ['public', 'staged', 'local', 'private'].filter(function (a) { return a !== 'private' || R.some(function (r) { return r.access === 'private'; }); });
  var LANES = []; R.forEach(function (r) { if (r.lane && LANES.indexOf(r.lane) < 0) LANES.push(r.lane); }); LANES.sort();
  var VIEWS = [['plates', 'Plates'], ['shelves', 'Shelves'], ['techniques', 'Techniques'], ['atoms', 'Atoms'], ['ledger', 'Ledger'], ['audit', 'Audit']];
  var FACETS = [
    { k: 'kind', title: 'Kind', values: KINDS, label: cap, mark: function (v) { return glyph(v, 'canonical'); }, tip: function (v) { return L.vocabulary.kind[v]; } },
    { k: 'collection', title: 'Collection', values: L.collections.map(function (c) { return c.id; }), label: function (v) { return COL[v].title; }, mark: function (v) { return '<span class="cd">' + COL[v].code + '</span>'; }, tip: function (v) { return COL[v].note; } },
    { k: 'status', title: 'Status', values: STATUSES, label: function (v) { return v ? cap(v.replace('-', ' ')) : 'No status'; }, mark: function (v) { return glyph('study', v); }, tip: function (v) { return L.vocabulary.status[v]; } },
    { k: 'access', title: 'Access', values: ACCESS, label: cap, mark: function (v) { return glyph('study', '', v); }, tip: function (v) { return L.vocabulary.access[v]; } },
    { k: 'family', title: 'Family', values: Object.keys(L.vocabulary.family || {}), label: function (v) { return cap(v.replace(/-/g, ' ')); }, mark: function () { return ''; }, tip: function (v) { return L.vocabulary.family[v]; } },
    { k: 'lane', title: 'Lane', values: LANES, label: function (v) { return v; }, mark: function () { return ''; } }
  ];
  var SCHEME_LABEL = { enc: 'ENC', 'enc.read': 'ENC·R', tt: 'TT', st: 'ST', hld: 'HLD' };
  var NOFILTER = { kind: [], collection: [], status: [], access: [], family: [], lane: [] };

  /* ---------------------------------------------------------------- state */
  var S = { view: 'plates', q: '', f: { kind: [], collection: [], status: [], access: [], family: [], lane: [] }, d: 's', sort: 'modified', r: null, term: null, scheme: '', tsort: 'n', ls: 'acc', ld: 1, open: {} };
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
    S.sort = ['acc', 'title', 'modified', 'shelf'].indexOf(p.sort) >= 0 ? p.sort : 'modified';
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
    if (o.sort !== 'modified') qs.push('sort=' + o.sort);
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
    return '<a class="pl" style="--ar:' + lay.toFixed(4) + '" href="' + recHref(r) + '" data-r="' + r.acc + '" data-rs="' + all.join(' ') + '" title="' + e(label(r) + (nv ? ' · ' + (nv + 1) + ' versions' : '') + (g.more.length ? ' · and ' + g.more.length + ' more with this picture' : '')) + '"' +
      (S.r && all.indexOf(S.r) >= 0 ? ' aria-current="true"' : '') + '>' + pic(r, Math.round(lay * h * 1.5) + 'px') + '<span class="c' + (r.call ? '' : ' t') + '"><b>' + e(r.call || r.title) + '</b>' + (n ? '<s>+' + n + '</s>' : '') + '</span></a>';
  }
  /* Only a work with a picture gets a frame. The rest are listed by name. */
  function strip(list, h) {
    var shown = list.filter(function (r) { return r.thumb; }), bare = list.filter(function (r) { return !r.thumb; });
    return (shown.length ? '<div class="strip">' + stacks(shown).map(function (g) { return tile(g, h); }).join('') + '</div>' : '') + unpictured(bare);
  }
  function unpictured(list) {
    if (!list.length) return '';
    return '<div class="bare"><h4 class="k">Not pictured · ' + list.length + '</h4>' + list.map(function (r) {
      return '<a href="' + recHref(r) + '" data-r="' + r.acc + '"' + (S.r === r.acc ? ' aria-current="true"' : '') + '><span class="m">' + e(r.call || r.acc) + '</span><span class="ti">' + e(r.title) + '</span><span class="m why">' + e(r.no_pic && r.no_pic.why ? r.no_pic.why : r.access !== 'public' ? cap(r.access) : '') + '</span></a>';
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
    else if (S.sort === 'modified') out.sort(function (a, b) { return (b.dates.modified || '').localeCompare(a.dates.modified || '') || a._i - b._i; });
    else if (S.sort === 'shelf') out.sort(function (a, b) { return COL[a.collection]._i - COL[b.collection]._i || (SHELF[a.id] || 0) - (SHELF[b.id] || 0); });
    return out;
  }
  function base() { return S.view === 'ledger' ? R : WORKS; }
  function anyFilter() { return S.q || FACETS.some(function (F) { return S.f[F.k].length; }); }

  /* ---------------------------------------------------------------- bar + rail */
  function drawBar() {
    var n = { plates: WORKS.length, shelves: L.collections.length, techniques: L.authority.techniques.length, atoms: L.authority.atoms.length, audit: L.audit.filter(function (a) { return a.level !== 'note'; }).length };
    $views.innerHTML = VIEWS.map(function (v) {
      return '<button type="button" data-view="' + v[0] + '"' + (S.view === v[0] ? ' aria-current="page"' : '') + '>' + v[1] + (n[v[0]] != null ? '<i>' + n[v[0]] + '</i>' : '') + '</button>';
    }).join('');
  }
  function drawRail() {
    var railed = S.view === 'plates' || S.view === 'ledger' || S.view === 'shelves';
    $frame.classList.toggle('norail', !railed);
    if (!railed) { $rail.innerHTML = ''; return; }
    var tk = tokens(), on = FACETS.reduce(function (n, F) { return n + S.f[F.k].length; }, 0);
    var h = '<button type="button" class="railtog" data-railtog aria-expanded="' + $rail.classList.contains('open') + '">Filters' + (on ? ' · ' + on : '') + '<span>' + ($rail.classList.contains('open') ? '–' : '+') + '</span></button>';
    FACETS.forEach(function (F) {
      var counts = {};
      base().forEach(function (r) { if (match(r, F.k, tk)) { var v = r[F.k] == null ? '' : r[F.k]; counts[v] = (counts[v] || 0) + 1; } });
      var vals = F.values.filter(function (v) { return counts[v] || S.f[F.k].indexOf(v) >= 0 || F.k !== 'lane'; });
      if (!vals.length) return;
      h += '<section class="fg' + (F.k === 'collection' ? ' code' : '') + '"><h2><span class="k">' + F.title + '</span>' + (S.f[F.k].length ? '<button type="button" data-clear="' + F.k + '">Clear</button>' : '') + '</h2><div class="fvs">';
      vals.forEach(function (v) {
        var n = counts[v] || 0, tip = F.tip && F.tip(v);
        h += '<button type="button" class="fv' + (n ? '' : ' zero') + '" data-f="' + F.k + '" data-v="' + e(v) + '" aria-pressed="' + (S.f[F.k].indexOf(v) >= 0) + '"' + (tip ? ' title="' + e(tip) + '"' : '') + '>' +
          '<span>' + F.mark(v) + '</span><span class="lb">' + e(F.label(v)) + '</span><span class="ct">' + n + '</span></button>';
      });
      h += '</div></section>';
    });
    $rail.innerHTML = h;
  }

  /* ---------------------------------------------------------------- shared pieces */
  function toolbar(tools, n, total, noFacets) {
    var chips = '';
    if (S.q) chips += '<button type="button" class="chip" data-unq>“' + e(S.q) + '”</button>';
    if (!noFacets) FACETS.forEach(function (F) { S.f[F.k].forEach(function (v) { chips += '<button type="button" class="chip" data-f="' + F.k + '" data-v="' + e(v) + '">' + e(F.label(v)) + '</button>'; }); });
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
  function card(r) {
    var st = r.status ? r.status.replace('-', ' ') : '';
    var has = r.access !== 'public' ? '<span class="not">' + r.access + '</span>'
      : r.plate && r.plate.modules ? '<span class="has" title="Has modules to lift">lift</span>' : r.plate && r.plate.spec ? '<span class="has" title="Has a spec">spec</span>' : '';
    return '<a class="cdx" href="' + recHref(r) + '" data-r="' + r.acc + '" title="' + e(label(r)) + '"' + (S.r === r.acc ? ' aria-current="true"' : '') + '><span class="cell">' + pic(r, '(max-width:720px) 46vw, 240px', r.access !== 'public') + '</span>' +
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
    return '<a class="tb-c cut-' + (FCUT[r.family] || CUT[r.kind] || 'step') + (r.access !== 'public' ? ' off' : '') + '" href="' + recHref(r) + '" data-r="' + r.acc + '" title="' + e(label(r)) + '"' + (S.r === r.acc ? ' aria-current="true"' : '') + '>' +
      '<span class="edge"><span class="face"><img src="' + e(r.thumb_2x && r.thumb_2x_w <= 1200 ? r.thumb_2x : r.thumb) + '" alt="" loading="lazy" decoding="async">' +
      '<span class="strip2"><span class="k">' + e(r.kind) + '</span><b' + (num.length > 5 ? ' class="long"' : '') + '>' + e(num) + '</b><span class="k st">' + e(st || COL[r.collection].code) + '</span><i>↗</i></span></span></span>' +
      '<span class="nm">' + e(r.title) + '</span></a>';
  }

  /* ---------------------------------------------------------------- arrival chart: one mark per record, a row per collection, on whole pixels */
  function lanes(list) {
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
      '<label class="ord">Order <select data-sort><option value="modified"' + sel('modified') + '>Last changed</option><option value="acc"' + sel('acc') + '>Arrival</option><option value="shelf"' + sel('shelf') + '>Shelf</option><option value="title"' + sel('title') + '>Title</option></select></label>';
    var body = !list.length ? empty('records')
      : S.d === 's' ? '<div class="sheet">' + strip(list, phone() ? 76 : 104) + '</div>'
      : S.d === 't' ? '<div class="tabs">' + list.filter(function (r) { return r.thumb; }).map(tab).join('') + '</div>' + unpictured(list.filter(function (r) { return !r.thumb; }))
      : '<div class="cards">' + list.filter(function (r) { return r.thumb; }).map(card).join('') + '</div>' + unpictured(list.filter(function (r) { return !r.thumb; }));
    $lib.innerHTML = '<h1 class="vh">Plates</h1>' + toolbar(tools, list.length, WORKS.length) + body + foot();
  }

  function vShelves() {
    var tk = tokens(), any = anyFilter(), total = 0, h = '';
    LIST = [];
    L.collections.forEach(function (c) {
      var secs = '', n = 0;
      c.sections.forEach(function (s) {
        var all = s.records.map(function (id) { return byId[id]; });
        var recs = all.filter(function (r) { return !r.role && (!any || match(r, null, tk)); });
        var parts = any ? [] : all.filter(function (r) { return r.role === 'part'; });
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
    h += '<div class="acts">' + (r.href ? '<a class="pri" href="' + e(r.href) + '">Open ↗</a>' : '<span>' + (r.access === 'private' || r.access === 'local' ? 'Local file' : 'Not published') + '</span>') +
      (r.spec_href ? '<a href="' + e(r.spec_href) + '">Spec JSON ↗</a>' : '') + '<button type="button" data-copy="record">Copy record</button>' + (PREVIEW ? '' : '<button type="button" data-copy="link">Copy link</button>') + '</div>';
    var rows = [];
    var of = r.work ? byId[r.work] : null;
    if (r.role) rows.push([r.role === 'version' ? 'Version of' : 'Part of', of ? '<a href="' + recHref(of) + '" data-r="' + of.acc + '">' + e(label(of)) + '</a>' : e(cap(r.part_of || ''))]);
    rows.push(['Kind', '<span class="gl">' + glyph(r.kind, r.status, r.access) + e(r.kind) + (r.atom_kind ? ' · ' + e(r.atom_kind) : '') + '</span>']);
    rows.push(['Status', r.status ? e(r.status.replace('-', ' ')) + (r.ruling ? ' <small>· ruled by ' + e(r.ruling.by) + (r.ruling.date ? ', ' + e(r.ruling.date) : '') + '</small>' : '') + (r.proposed_grade ? ' <small>· proposed grade ' + e(r.proposed_grade) + '</small>' : '') : '<small>none recorded</small>']);
    if (r.access !== 'public') rows.push(['Access', e(cap(r.access)) + ' <small>· ' + e(L.vocabulary.access[r.access]) + (r.target ? ' For ' + e(r.target) + '.' : '') + '</small>']);
    rows.push(['Collection', '<a href="' + hash({ view: 'shelves', r: null, term: null, q: '', f: { kind: [], collection: [r.collection], status: [], access: [], family: [], lane: [] } }) + '">' + e(c.title) + '</a> <small>· ' + e(r.section_title) + '</small>']);
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
    els = document.querySelectorAll('.pl[data-rs~="' + S.r + '"],.cdx[data-r="' + S.r + '"],.ledger tr[data-r="' + S.r + '"]'); for (i = 0; i < els.length; i++) els[i].setAttribute('aria-current', 'true');
    els = document.querySelectorAll('.lanes .m[data-r="' + S.r + '"]'); for (i = 0; i < els.length; i++) els[i].classList.add('sel');
  }

  /* ---------------------------------------------------------------- render */
  function render() {
    if ($q.value !== S.q && document.activeElement !== $q) $q.value = S.q;
    drawBar(); drawRail();
    if (S.view === 'plates') vPlates();
    else if (S.view === 'shelves') vShelves();
    else if (S.view === 'techniques' || S.view === 'atoms') vTerms(S.view);
    else if (S.view === 'ledger') vLedger();
    else vAudit();
    syncDrawer();
    document.title = (S.r && byAcc[S.r] ? byAcc[S.r].title + ' · ' : '') + 'Library';
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
    var t = ev.target.closest('[data-view],[data-f],[data-clear],[data-clearall],[data-unq],[data-d],[data-r],[data-close],[data-term],[data-scheme],[data-ts],[data-ls],[data-fd],[data-copy],[data-railtog]');
    if (!t) {
      // a link to another view is routed here, so it works where the host owns the address bar
      var a = ev.target.closest('a[href^="#/"]');
      if (a && !(ev.metaKey || ev.ctrlKey || ev.shiftKey)) { ev.preventDefault(); parse(a.getAttribute('href')); setHash(hash()); render(); window.scrollTo(0, 0); return; }
      if (S.r && !ev.target.closest('#drawer') && !ev.target.closest('a,button,input,select')) go({ r: null });
      return;
    }
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
    var d = t.dataset;
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
    if ('clearall' in d) { $q.value = ''; return go({ q: '', f: { kind: [], collection: [], status: [], access: [], family: [], lane: [] } }); }
    if ('unq' in d) { $q.value = ''; return go({ q: '' }); }
    if (d.d) return go({ d: d.d });
    if ('term' in d) return go({ term: S.term === d.term ? null : d.term });
    if ('scheme' in d) return go({ scheme: d.scheme, term: null });
    if (d.ts) return go({ tsort: d.ts });
    if (d.ls) { if (S.ls === d.ls) S.ld = -S.ld; else { S.ls = d.ls; S.ld = 1; } return render(); }
    if (d.fd) { S.open[d.fd] = !S.open[d.fd]; return render(); }
  });
  document.addEventListener('change', function (ev) { if (ev.target.matches('[data-sort]')) go({ sort: ev.target.value }); });
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

  parse(); render();
})();
