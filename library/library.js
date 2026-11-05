/* library/library.js — reads window.LIBRARY (catalog.js) and draws the front door.
   A classic script: no modules, no network, opens from file://. Every number on the
   page is counted from the catalog at load. */
(function () {
  'use strict';
  var L = window.LIBRARY;
  var $lib = document.getElementById('lib'), $rail = document.getElementById('rail'), $views = document.getElementById('views'),
      $q = document.getElementById('q'), $tally = document.getElementById('tally'), $drawer = document.getElementById('drawer'),
      $frame = document.getElementById('frame'), $tip = document.getElementById('tip');
  if (!L || !$lib) return;

  /* ---------------------------------------------------------------- index */
  var R = L.records, byId = {}, byAcc = {}, COL = {}, TECH = {}, ATOM = {}, SEE = {}, IN = {};
  L.collections.forEach(function (c, i) { c._i = i; COL[c.id] = c; });
  L.authority.techniques.forEach(function (t) { TECH[t.key] = t; });
  L.authority.atoms.forEach(function (a) { ATOM[a.key] = a; });
  R.forEach(function (r, i) { r._i = i; byId[r.id] = r; byAcc[r.acc] = r; });
  L.authority.see_also.links.forEach(function (l) {
    (SEE[l.a] = SEE[l.a] || []).push({ to: l.b, relation: l.relation, by: l.by, date: l.date, basis: l.basis });
    (SEE[l.b] = SEE[l.b] || []).push({ to: l.a, relation: l.relation, by: l.by, date: l.date, basis: l.basis, back: true });
  });
  R.forEach(function (r) { (r.rel || []).forEach(function (x) { if (byId[x.to]) (IN[x.to] = IN[x.to] || []).push({ type: x.type, from: r.id }); }); });
  R.forEach(function (r) {
    var names = (r.techniques || []).map(function (k) { return TECH[k] ? TECH[k].id + ' ' + TECH[k].name : k; });
    r._hay = [r.acc, r.call, r.title, r.sub, r.kind, r.atom_kind, COL[r.collection].title, COL[r.collection].code, r.section_title, r.status, r.lane, r.layer, r.style,
      (r.tags || []).join(' '), names.join(' '), (r.atoms || []).join(' '), r.provenance && r.provenance.title, r.id].join(' ').toLowerCase();
  });

  var KINDS = ['technique', 'atom', 'exploration', 'coupling', 'study', 'template', 'instrument'];
  var STATUSES = ['canonical', 'exploration', 'proposed', 'unsorted', 'known-failure', 'historical', ''];
  var ACCESS = ['public', 'staged', 'local'];
  var LANES = []; R.forEach(function (r) { if (r.lane && LANES.indexOf(r.lane) < 0) LANES.push(r.lane); }); LANES.sort();
  var VIEWS = [['plates', 'Plates'], ['shelves', 'Shelves'], ['techniques', 'Techniques'], ['atoms', 'Atoms'], ['ledger', 'Ledger'], ['audit', 'Audit']];
  var FACETS = [
    { k: 'kind', title: 'Kind', values: KINDS, label: cap, mark: function (v) { return glyph(v, 'canonical'); }, tip: function (v) { return L.vocabulary.kind[v]; } },
    { k: 'collection', title: 'Collection', values: L.collections.map(function (c) { return c.id; }), label: function (v) { return COL[v].title; }, mark: function () { return ''; }, tip: function (v) { return COL[v].note; } },
    { k: 'status', title: 'Status', values: STATUSES, label: function (v) { return v ? cap(v.replace('-', ' ')) : 'None on file'; }, mark: function (v) { return glyph('study', v); }, tip: function (v) { return L.vocabulary.status[v]; } },
    { k: 'access', title: 'Access', values: ACCESS, label: cap, mark: function (v) { return glyph('study', '', v); }, tip: function (v) { return L.vocabulary.access[v]; } },
    { k: 'lane', title: 'Lane', values: LANES, label: function (v) { return v; }, mark: function () { return ''; } }
  ];
  var SCHEME_LABEL = { enc: 'ENC', 'enc.read': 'ENC·R', tt: 'TT', st: 'ST', hld: 'HLD' };

  /* ---------------------------------------------------------------- state */
  var S = { view: 'plates', q: '', f: { kind: [], collection: [], status: [], access: [], lane: [] }, d: 's', sort: 'modified', r: null, term: null, scheme: '', tsort: 'n', ls: 'acc', ld: 1, open: {} };
  var LIST = R;   // the records the drawer pages through
  var MEM = null; // the route, kept in memory where the host will not let the page write its own address
  var BASE = L.base || '../', PREVIEW = !!L.preview;

  function parse(from) {
    var h = (from != null ? from : MEM != null ? MEM : location.hash).replace(/^#\/?/, ''), i = h.indexOf('?');
    var path = (i < 0 ? h : h.slice(0, i)).split('/'), qs = i < 0 ? '' : h.slice(i + 1), p = {};
    qs.split('&').forEach(function (kv) { if (!kv) return; var j = kv.indexOf('='); p[decodeURIComponent(j < 0 ? kv : kv.slice(0, j))] = j < 0 ? '' : decodeURIComponent(kv.slice(j + 1)); });
    S.view = VIEWS.some(function (v) { return v[0] === path[0]; }) ? path[0] : 'plates';
    S.term = path[1] ? decodeURIComponent(path.slice(1).join('/')) : null;
    S.q = p.q || '';
    FACETS.forEach(function (F) { S.f[F.k] = p[F.k] != null ? p[F.k].split(',').map(function (v) { return v === '-' ? '' : v; }).filter(function (v) { return F.values.indexOf(v) >= 0; }) : []; });
    S.d = p.d === 'm' ? 'm' : 's';
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
    if (o.d === 'm') qs.push('d=m');
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
  function glyph(kind, status, access) {
    var ink = '#101014', stroke = access && access !== 'public' ? '#F4551E' : ink, fill = 'none', sw = 1.3, dash = '', extra = '';
    if (status === 'canonical') fill = ink;
    else if (status === 'exploration') { fill = 'url(#g-dot)'; sw = 1; }
    else if (status === 'proposed') extra = '<circle cx="10.3" cy="1.7" r="1.7" fill="#F4551E"/>';
    else if (status === 'unsorted') { stroke = '#A9A9AD'; sw = 1; }
    else if (status === 'known-failure') { fill = ink; extra = '<path d="M2.6 9.4L9.4 2.6" stroke="#fff" stroke-width="1.5"/>'; }
    else if (status === 'historical') dash = ' stroke-dasharray="1.7 1.5"';
    var a = ' fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '"' + dash + '/>';
    var shape = {
      technique: '<path d="M6 1.5L10.9 10.5H1.1Z"' + a,
      atom: '<circle cx="6" cy="6" r="4.3"' + a,
      exploration: '<path d="M6 1.1L10.9 6L6 10.9L1.1 6Z"' + a,
      coupling: '<circle cx="4.3" cy="6" r="3.1"' + a + '<circle cx="7.7" cy="6" r="3.1"' + a,
      study: '<rect x="1.7" y="1.7" width="8.6" height="8.6"' + a,
      template: '<rect x="1" y="3.2" width="10" height="5.6"' + a,
      instrument: '<path d="M4.5 1.3h3v3.2h3.2v3H7.5v3.2h-3V7.5H1.3v-3h3.2z"' + a
    }[kind] || '<rect x="1.7" y="1.7" width="8.6" height="8.6"' + a;
    return '<svg class="sw" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">' + shape + extra + '</svg>';
  }
  function frame(r, big) {
    var src = big && r.thumb_master ? r.thumb_master : r.thumb;
    if (src) return '<span class="fr"><img src="' + e(src) + '" alt="" loading="lazy" decoding="async" data-call="' + e(r.call || r.title) + '"></span>';
    return '<span class="fr">' + placeholder(r) + '</span>';
  }
  function placeholder(r) {
    var why = r.access === 'public' ? 'no thumbnail on file' : r.access === 'staged' ? 'staged, not live' : 'held locally';
    return '<span class="ph">' + (r.call ? '<b>' + e(r.call) + '</b>' : '<b class="w">' + e(r.title) + '</b>') + '<i>' + why + '</i></span>';
  }
  function statusLabel(r) { return r.status ? r.status.replace('-', ' ') : (r.kind === 'instrument' ? '' : 'no status'); }
  function recHref(r) { return hash({ r: r.acc }); }

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
  function filtered() {
    var tk = tokens(), out = R.filter(function (r) { return match(r, null, tk); });
    if (S.sort === 'title') out.sort(function (a, b) { return a.title.localeCompare(b.title); });
    else if (S.sort === 'modified') out.sort(function (a, b) { return (b.dates.modified || '').localeCompare(a.dates.modified || '') || a._i - b._i; });
    else if (S.sort === 'shelf') out.sort(function (a, b) { return COL[a.collection]._i - COL[b.collection]._i || shelfPos(a) - shelfPos(b); });
    return out;
  }
  var SHELF = {}; L.collections.forEach(function (c) { var n = 0; c.sections.forEach(function (s) { s.records.forEach(function (id) { SHELF[id] = n++; }); }); });
  function shelfPos(r) { return SHELF[r.id] || 0; }
  function anyFilter() { return S.q || FACETS.some(function (F) { return S.f[F.k].length; }); }

  /* ---------------------------------------------------------------- bar + rail */
  function drawBar(n) {
    $views.innerHTML = VIEWS.map(function (v) {
      var c = v[0] === 'plates' ? R.length : v[0] === 'shelves' ? L.collections.length : v[0] === 'techniques' ? L.authority.techniques.length : v[0] === 'atoms' ? L.authority.atoms.length : v[0] === 'audit' ? L.audit.filter(function (a) { return a.level !== 'note'; }).length : '';
      return '<button type="button" data-view="' + v[0] + '"' + (S.view === v[0] ? ' aria-current="page"' : '') + '>' + v[1] + (c !== '' ? '<i>' + c + '</i>' : '') + '</button>';
    }).join('');
    $tally.innerHTML = n == null ? '' : '<b>' + n + '</b>' + (n === R.length ? 'records' : 'of ' + R.length);
  }
  function drawRail() {
    var railed = S.view === 'plates' || S.view === 'ledger' || S.view === 'shelves';
    $frame.classList.toggle('norail', !railed);
    if (!railed) { $rail.innerHTML = ''; return; }
    var tk = tokens(), nActive = FACETS.reduce(function (n, F) { return n + S.f[F.k].length; }, 0);
    var h = '<button type="button" class="railtog" data-railtog>Filters' + (nActive ? ' · ' + nActive + ' on' : '') + '<span>' + ($rail.classList.contains('open') ? '–' : '+') + '</span></button>';
    FACETS.forEach(function (F) {
      var counts = {}, max = 0;
      R.forEach(function (r) { if (match(r, F.k, tk)) { var v = r[F.k] == null ? '' : r[F.k]; counts[v] = (counts[v] || 0) + 1; } });
      F.values.forEach(function (v) { if ((counts[v] || 0) > max) max = counts[v]; });
      var vals = F.values.filter(function (v) { return counts[v] || S.f[F.k].indexOf(v) >= 0 || F.k !== 'lane'; });
      if (!vals.length) return;
      h += '<section class="fg"><h2><span class="k">' + F.title + '</span>' + (S.f[F.k].length ? '<button type="button" data-clear="' + F.k + '">clear</button>' : '') + '</h2><div class="fvs">';
      vals.forEach(function (v) {
        var n = counts[v] || 0, on = S.f[F.k].indexOf(v) >= 0;
        h += '<button type="button" class="fv' + (n ? '' : ' zero') + '" data-f="' + F.k + '" data-v="' + e(v) + '" aria-pressed="' + on + '"' + (F.tip && F.tip(v) ? ' title="' + e(F.tip(v)) + '"' : '') + '>' +
          '<span>' + (F.mark(v) || (F.k === 'collection' ? '<span class="mono" style="font-size:8px;letter-spacing:.04em;color:#66666A">' + COL[v].code.slice(0, 2) + '</span>' : '')) + '</span>' +
          '<span class="lb">' + e(F.label(v)) + '</span><span class="ct">' + n + '</span><span class="bar"><i style="width:' + (max ? Math.round(n / max * 100) : 0) + '%"></i></span></button>';
      });
      h += '</div></section>';
    });
    h += '<div class="rail-note">A shape is a kind. Its fill is a status: solid is canonical, dotted is an exploration, an orange point is proposed, a pale outline is unsorted. An orange outline is not live yet.' +
      '<span class="mono">' + e(L.schema) + ' · ' + e(L.generated) + (L.source_commit ? ' · ' + e(L.source_commit) : '') + '</span></div>';
    $rail.innerHTML = h;
  }

  /* ---------------------------------------------------------------- shared pieces */
  function head(title, lede, tools) {
    return '<header class="vh"><div><h1>' + title + '</h1><p>' + lede + '</p></div>' + (tools ? '<div class="tools">' + tools + '</div>' : '') + '</header>';
  }
  function activeBar(n, noun, noFacets) {
    var chips = '';
    if (S.q) chips += '<button type="button" class="chip" data-unq>“' + e(S.q) + '”</button>';
    if (!noFacets) FACETS.forEach(function (F) { S.f[F.k].forEach(function (v) { chips += '<button type="button" class="chip" data-f="' + F.k + '" data-v="' + e(v) + '">' + e(F.label(v)) + '</button>'; }); });
    return '<div class="active"><span class="n"><b>' + n + '</b> ' + noun + (n === 1 ? '' : 's') + (chips ? ' where' : '') + '</span>' + chips + (chips ? '<button type="button" class="clear" data-clearall>clear all</button>' : '') + '</div>';
  }
  function foot() {
    return '<footer class="foot"><p>Collections stay where they were made, in their own order and their own shell. The library keeps one record per work, a number that never changes, and the way in.</p>' +
      '<p class="mono">' + (PREVIEW ? 'a preview of library/ · the data files ship with it' : '<a href="catalog.json">catalog.json</a> · <a href="accessions.json">accessions.json</a> · <a href="fixity.json">fixity.json</a> · <a href="llms.txt">llms.txt</a>') + '<br>' +
      e(L.schema) + ' · built ' + e(L.generated) + (L.source_commit ? ' from ' + e(L.source_commit) : '') + '</p></footer>';
  }
  function card(r) {
    var flags = '';
    if (r.access !== 'public') flags += '<span style="border-color:#F4551E">' + r.access + '</span>';
    else { if (r.plate && r.plate.modules) flags += '<span>lift</span>'; else if (r.plate && r.plate.spec) flags += '<span>spec</span>'; }
    return '<a class="pl" href="' + recHref(r) + '" data-r="' + r.acc + '" title="' + e((r.call ? r.call + ' · ' : '') + r.title) + '"' + (S.r === r.acc ? ' aria-current="true"' : '') + '>' + frame(r) +
      (flags ? '<span class="flags">' + flags + '</span>' : '') +
      '<span class="l1"><b class="call">' + e(r.call || '—') + '</b><span class="acc">' + r.acc + '</span></span>' +
      '<span class="tt">' + e(r.title) + '</span>' +
      '<span class="l3">' + glyph(r.kind, r.status, r.access) + '<span class="st">' + e(r.kind) + (statusLabel(r) ? ' · ' + e(statusLabel(r)) : '') + '</span><span class="col">' + COL[r.collection].code + '</span></span></a>';
  }

  /* ---------------------------------------------------------------- lanes */
  function lanes(list) {
    var W = Math.max(320, $lib.clientWidth - 48), gut = 36, n = R.length, step = (W - gut) / n, rowH = 10, rows = L.collections.length, H = rows * rowH + 22;
    var inSet = {}; list.forEach(function (r) { inSet[r.id] = 1; });
    var s = '<div class="lanes"><div class="cap"><span class="k">Arrival · ' + R[0].acc + ' → ' + R[n - 1].acc + '</span><span class="k">one mark per record · a row per collection</span></div>' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Every record in order of arrival, one row per collection">';
    L.collections.forEach(function (c, i) {
      var y = i * rowH;
      s += '<line class="rule" x1="' + gut + '" x2="' + W + '" y1="' + (y + rowH - .5) + '" y2="' + (y + rowH - .5) + '"/><text class="lab" x="0" y="' + (y + 7) + '">' + c.code + '</text>';
    });
    var mw = Math.max(1.4, step - 1), lastLabel = -99, lastDate = '';
    R.forEach(function (r, i) {
      var x = gut + i * step, y = COL[r.collection]._i * rowH + 1.5;
      s += '<rect class="m' + (inSet[r.id] ? '' : ' off') + (S.r === r.acc ? ' sel' : '') + '" data-r="' + r.acc + '" x="' + x.toFixed(2) + '" y="' + y + '" width="' + mw.toFixed(2) + '" height="' + (rowH - 3.5) + '"/>';
      var d = r.dates.accessioned || '';
      if (d !== lastDate) {
        lastDate = d;
        s += '<line class="tick" x1="' + x.toFixed(2) + '" x2="' + x.toFixed(2) + '" y1="' + (rows * rowH) + '" y2="' + (rows * rowH + 4) + '"/>';
        if (x - lastLabel > 44) { s += '<text class="date" x="' + x.toFixed(2) + '" y="' + (rows * rowH + 14) + '">' + d.slice(5) + '</text>'; lastLabel = x; }
      }
    });
    R.forEach(function (r, i) { s += '<rect class="hit" data-r="' + r.acc + '" x="' + (gut + i * step).toFixed(2) + '" y="0" width="' + step.toFixed(2) + '" height="' + (rows * rowH) + '"/>'; });
    return s + '</svg></div>';
  }

  /* ---------------------------------------------------------------- views */
  function vPlates() {
    var list = filtered(); LIST = list;
    var tools = '<button type="button" data-d="s" aria-pressed="' + (S.d === 's') + '">Contact sheet</button><button type="button" data-d="m" aria-pressed="' + (S.d === 'm') + '">Cards</button>' +
      '<label>Order <select data-sort><option value="modified"' + sel('modified') + '>Last changed</option><option value="acc"' + sel('acc') + '>Arrival</option><option value="shelf"' + sel('shelf') + '>Shelf</option><option value="title"' + sel('title') + '>Title</option></select></label>';
    function sel(v) { return S.sort === v ? ' selected' : ''; }
    var body = list.length ? '<div class="grid ' + S.d + '">' + list.map(card).join('') + '</div>'
      : '<div class="empty"><b>Nothing matches.</b>Loosen a filter, or search the technique and atom lists instead.</div>';
    $lib.innerHTML = head('Plates', 'Every work in every collection. Open one to see where it lives, what it is made of and what it connects to.', tools) + activeBar(list.length, 'record') + lanes(list) + body + foot();
    drawBar(list.length);
  }

  function vShelves() {
    var tk = tokens(), any = anyFilter(), total = 0, h = '';
    LIST = [];
    L.collections.forEach(function (c) {
      var secs = '', n = 0;
      c.sections.forEach(function (s) {
        var recs = s.records.map(function (id) { return byId[id]; }).filter(function (r) { return !any || match(r, null, tk); });
        if (!recs.length) return;
        n += recs.length; LIST = LIST.concat(recs);
        secs += '<div class="sec"><h3><b>' + e(s.title) + '</b>' + recs.length + '</h3><div class="tiles">' + recs.map(function (r) {
          return '<a class="tile" href="' + recHref(r) + '" data-r="' + r.acc + '" title="' + e((r.call ? r.call + ' · ' : '') + r.title) + '">' + frame(r) + '<span class="c">' + e(r.call || r.acc) + '</span></a>';
        }).join('') + '</div></div>';
      });
      if (any && !n) return;
      total += n;
      h += '<section class="shelf"><header><div class="code">' + c.code + '</div><div><h2>' + e(c.title) + ' <span class="k" style="margin-left:8px">' + n + (n === c.n ? '' : ' of ' + c.n) + '</span></h2><p class="note">' + e(c.note) + '</p><div class="truth">source of truth · ' + e(c.truth) + '</div></div>' +
        (c.index ? '<a class="go" href="' + e(c.index) + '">Open its own index ↗</a>' : '<span></span>') + '</header>' + secs + '</section>';
    });
    var sup = L.superseded.map(function (s) { return '<code>' + e(s.path) + '/</code> into ' + e(s.folded_into); }).join(', ');
    $lib.innerHTML = head('Shelves', 'Each collection in the order its makers left it. Folded in and not counted twice: ' + sup + '.', '') + activeBar(total, 'record') +
      (h || '<div class="empty"><b>Nothing matches.</b></div>') + foot();
    drawBar(total);
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
    var nrec = function (t) { var s = {}; t.uses.forEach(function (u) { s[u.rec] = 1; }); return Object.keys(s).length; };
    list.forEach(function (t) { t._n = nrec(t); });
    if (S.tsort === 'n') list.sort(function (a, b) { return b._n - a._n || a.id.localeCompare(b.id); }); else list.sort(function (a, b) { return a.id.localeCompare(b.id); });
    var max = list.reduce(function (m, t) { return Math.max(m, t._n); }, 1);
    var tools = '<button type="button" data-scheme="" aria-pressed="' + (!S.scheme) + '">All</button>' + schemes.map(function (s) {
      return '<button type="button" data-scheme="' + s + '" aria-pressed="' + (S.scheme === s) + '" title="' + e(L.vocabulary.scheme[s] || s) + '">' + (SCHEME_LABEL[s] || s) + '</button>';
    }).join('') + '<button type="button" data-ts="' + (S.tsort === 'n' ? 'az' : 'n') + '">' + (S.tsort === 'n' ? 'Most used first' : 'A to Z') + '</button>';
    var lede = which === 'techniques'
      ? 'A technique entry is a page of its own. A technique read is one block of a plate’s spec. Each vocabulary keeps its own ids; a see-also link joins two only once someone writes it down.'
      : 'An atom is a noun with parameters. The encyclopedia files atoms as entries; Techniques &amp; Templates tags each read with the atoms it is built from.';
    var h = head(cap(which), lede, tools) + activeBar(list.length, 'term', true);
    h += list.length ? '<ul class="terms">' + list.map(function (t) {
      var open = S.term === t.key;
      return '<li class="term"' + (open ? ' open' : '') + ' id="t-' + e(t.key) + '"><button type="button" data-term="' + e(t.key) + '" aria-expanded="' + open + '">' +
        '<span class="sc">' + (SCHEME_LABEL[t.scheme] || t.scheme) + '</span><span class="id">' + e(t.id) + '</span><span class="nm">' + e(t.name !== t.id ? t.name : '') + (t.atom_kind ? ' · ' + e(t.atom_kind) : '') + (SEE[type + ':' + t.key] ? ' · see also' : '') + '</span>' +
        '<span class="ct"><i style="width:' + Math.max(2, Math.round(t._n / max * 70)) + 'px"></i>' + t._n + '</span></button>' + (open ? termBody(t, type) : '') + '</li>';
    }).join('') + '</ul>' : '<div class="empty"><b>No term matches.</b></div>';
    $lib.innerHTML = h + foot();
    LIST = R; drawBar(list.length);
    if (S.term) { var el = document.getElementById('t-' + S.term); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' }); }
  }
  function termBody(t, type) {
    var h = '<div class="body">';
    (SEE[type + ':' + t.key] || []).forEach(function (s) { h += seeBox(s); });
    if (t.record && byId[t.record]) h += '<div class="see"><span class="tag ruled">entry</span>This term has a page of its own: <a href="' + recHref(byId[t.record]) + '" data-r="' + byId[t.record].acc + '">' + e(byId[t.record].title) + '</a></div>';
    var uses = t.uses.slice().sort(function (a, b) { return byId[a.rec]._i - byId[b.rec]._i; });
    uses.forEach(function (u) {
      var r = byId[u.rec]; if (!r || (u.role === 'entry')) return;
      h += '<div class="use"><a href="' + recHref(r) + '" data-r="' + r.acc + '">' + frame(r) + '</a><div><h4><span class="call">' + e(r.call || r.acc) + '</span><a href="' + recHref(r) + '" data-r="' + r.acc + '">' + e(r.title) + '</a><span class="role">' + e(u.role === 'in' ? 'in ' + (u.via || '').split(':').pop() : u.role) + '</span></h4>' +
        (u.implementation ? '<p>' + e(u.implementation) + '</p>' : '') + (u.limits ? '<p class="lim">Limits. ' + e(u.limits) + '</p>' : '') +
        (u.module ? '<p><code>' + e(u.module) + '</code></p>' : '') + '</div></div>';
    });
    if (t.scheme === 'tt') h += '<div class="see"><span class="tag ruled">parameters</span><a href="' + e(BASE) + 'techniques-templates/?' + (type === 'atom' ? 'a' : 't') + '=' + encodeURIComponent(t.id) + '">Open ' + e(t.id) + ' in Techniques &amp; Templates ↗</a></div>';
    return h + '</div>';
  }
  function seeBox(s) {
    var parts = s.to.split(':'), type = parts[0], key = parts.slice(1).join(':'), label, href, attr = '';
    if (type === 'record') { var r = byId[key]; label = (r.call ? r.call + ' ' : '') + r.title; href = recHref(r); attr = ' data-r="' + r.acc + '"'; }
    else { var t = (type === 'technique' ? TECH : ATOM)[key]; label = key + (t && t.name !== t.id ? ' · ' + t.name : ''); href = hash({ view: type + 's', term: key, r: null, q: '', scheme: '' }); }
    return '<div class="see"><span class="tag' + (s.by === 'proposed' ? '' : ' ruled') + '">' + (s.by === 'proposed' ? 'proposed' : 'see also') + '</span><span class="mono" style="font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#66666A">' + type + '</span> <a href="' + href + '"' + attr + '>' + e(label) + '</a><span class="rel">' + e(s.relation) + '</span><p>' + e(s.basis) + (s.by === 'proposed' ? ' Not yet ruled.' : ' Source: ' + e(s.by) + '.') + '</p></div>';
  }

  function vLedger() {
    var list = filtered();
    var cols = [['acc', 'Accession'], ['call', 'Call'], ['title', 'Title'], ['kind', 'Kind'], ['collection', 'Collection'], ['section_title', 'Section'], ['status', 'Status'], ['access', 'Access'], ['arrived', 'Arrived'], ['modified', 'Changed'], ['fixity', 'Fixity']];
    var val = function (r, k) { return k === 'arrived' ? r.dates.accessioned : k === 'modified' ? r.dates.modified : k === 'collection' ? COL[r.collection].code : k === 'acc' ? r.acc.slice(5) : (r[k] || ''); };
    list.sort(function (a, b) { return String(val(a, S.ls)).localeCompare(String(val(b, S.ls))) * S.ld || a._i - b._i; });
    LIST = list;
    var h = head('Ledger', 'The accession register. A number is given once, in order of arrival, and stays with the work whatever shelf it moves to.', '') + activeBar(list.length, 'record');
    h += '<div class="lwrap"><table class="ledger"><colgroup><col style="width:104px"><col style="width:76px"><col><col style="width:128px"><col style="width:56px"><col style="width:150px"><col style="width:104px"><col style="width:70px"><col style="width:94px"><col style="width:94px"><col style="width:84px"></colgroup><thead><tr>' + cols.map(function (c) { return '<th scope="col" data-ls="' + c[0] + '"' + (S.ls === c[0] ? ' aria-sort="' + (S.ld > 0 ? 'ascending' : 'descending') + '"' : '') + '>' + c[1] + '</th>'; }).join('') + '</tr></thead><tbody>' +
      list.map(function (r) {
        return '<tr data-r="' + r.acc + '"' + (S.r === r.acc ? ' aria-current="true"' : '') + '><td>' + r.acc + '</td><td>' + e(r.call) + '</td><td class="t">' + e(r.title) + '</td><td><span class="gl">' + glyph(r.kind, r.status, r.access) + e(r.kind) + '</span></td><td>' + COL[r.collection].code + '</td><td class="n">' + e(r.section_title) + '</td><td>' + e(r.status || '') + '</td><td class="n">' + e(r.access) + '</td><td class="n">' + e(r.dates.accessioned) + '</td><td class="n">' + e(r.dates.modified) + '</td><td class="n">' + e(r.fixity ? r.fixity.slice(0, 8) : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    $lib.innerHTML = h + foot();
    drawBar(list.length);
  }

  function vAudit() {
    var groups = [['ruling', 'Wants a ruling'], ['gap', 'Gaps'], ['drift', 'Drift'], ['note', 'Notes']], h = head('Audit', 'What the catalog found while reading. Nothing here was changed. A ruling is yours; a gap is missing data; drift is two places saying different things.', '');
    groups.forEach(function (g) {
      var fs = L.audit.filter(function (a) { return a.level === g[0]; });
      if (!fs.length) return;
      h += '<section class="aud"><h2>' + g[1] + '</h2>';
      fs.forEach(function (a, i) {
        var key = g[0] + i, n = a.records ? a.records.length : a.items ? a.items.length : a.links ? a.links.length : (a.n != null ? a.n : ''), open = !!S.open[key], has = a.records || a.items || a.links;
        var big = a.of != null ? a.n + '<small>/' + a.of + '</small>' : n;
        h += '<div class="fd"><button type="button"' + (has ? ' data-fd="' + key + '" aria-expanded="' + open + '"' : ' disabled style="cursor:default"') + '><h3>' + e(a.title) + '</h3><p>' + e(a.detail) + '</p><span class="big">' + big + '</span></button>';
        if (open && has) {
          h += '<div class="more">';
          if (a.items || a.links) h += '<ul>' + (a.items || a.links).map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ul>';
          if (a.records) h += a.records.map(function (id) { var r = byId[id]; return r ? '<a href="' + recHref(r) + '" data-r="' + r.acc + '"><span class="mono">' + r.acc + '</span><span class="mono cl2">' + e(r.call) + '</span><span class="ti">' + e(r.title) + '</span></a>' : ''; }).join('');
          h += '</div>';
        }
        h += '</div>';
      });
      h += '</section>';
    });
    $lib.innerHTML = h + foot();
    LIST = R; drawBar(null);
    $tally.innerHTML = '<b>' + L.audit.filter(function (a) { return a.level !== 'note'; }).length + '</b>findings';
  }

  /* ---------------------------------------------------------------- drawer */
  function syncDrawer() {
    var r = S.r ? byAcc[S.r] : null;
    if (!r) { $drawer.setAttribute('aria-hidden', 'true'); return; }
    var i = LIST.indexOf(r), prev = i > 0 ? LIST[i - 1] : null, next = i >= 0 && i < LIST.length - 1 ? LIST[i + 1] : null, c = COL[r.collection], p = r.provenance || {};
    var h = '<div class="dh"><span class="where">' + e(c.title) + ' / ' + e(r.section_title) + '<span class="acc">' + (i >= 0 ? (i + 1) + ' of ' + LIST.length : '') + '</span></span>' +
      '<button type="button" data-r="' + (prev ? prev.acc : '') + '"' + (prev ? '' : ' disabled') + ' aria-label="Previous record">←</button><button type="button" data-r="' + (next ? next.acc : '') + '"' + (next ? '' : ' disabled') + ' aria-label="Next record">→</button><button type="button" data-close aria-label="Close">Close ×</button></div><div class="db">';
    h += frame(r, true);
    h += '<div class="l1"><b class="call">' + e(r.call || '—') + '</b><span class="acc">' + r.acc + '</span></div><h1>' + e(r.title) + '</h1>' + (r.sub ? '<p class="sub">' + e(r.sub) + '</p>' : '');
    h += '<div class="acts">' + (r.href ? '<a class="pri" href="' + e(r.href) + '">Open the plate ↗</a>' : '<span class="off acts-off" style="font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;border:1px dashed #A9A9AD;padding:8px 11px;line-height:1;color:#66666A">Not published</span>') +
      (r.spec_href ? '<a href="' + e(r.spec_href) + '">Spec JSON ↗</a>' : '') + '<button type="button" data-copy="record">Copy record</button>' + (PREVIEW ? '' : '<button type="button" data-copy="link">Copy link</button>') + '</div>';
    var rows = [];
    rows.push(['Accession', r.acc + ' <small>· arrived ' + e(r.dates.accessioned) + (r.dates.modified && r.dates.modified !== r.dates.accessioned ? ', changed ' + e(r.dates.modified) : '') + '</small>']);
    rows.push(['Kind', '<span class="gl">' + glyph(r.kind, r.status, r.access) + e(r.kind) + (r.atom_kind ? ' · ' + e(r.atom_kind) : '') + '</span>']);
    rows.push(['Status', r.status ? e(r.status.replace('-', ' ')) + (L.vocabulary.status[r.status] ? ' <small>· ' + e(L.vocabulary.status[r.status]) + '</small>' : '') : '<small>None on file. This collection does not record one.</small>']);
    if (r.proposed_grade) rows.push(['Proposed grade', e(r.proposed_grade) + ' <small>· a researcher’s grade, not a ruling</small>']);
    if (r.ruling) rows.push(['Ruling', 'by ' + e(r.ruling.by) + (r.ruling.date ? ', ' + e(r.ruling.date) : '')]);
    rows.push(['Collection', '<a href="' + hash({ view: 'shelves', r: null, term: null, q: '', f: { kind: [], collection: [r.collection], status: [], access: [], lane: [] } }) + '" style="border-bottom:1px solid #A9A9AD">' + e(c.title) + '</a> <small>· ' + e(r.section_title) + '</small>']);
    var mk = [r.lane && 'lane ' + r.lane, r.layer && 'layer ' + r.layer.toLowerCase(), r.style && 'style ' + r.style].filter(Boolean);
    if (mk.length) rows.push(['Made as', e(mk.join(' · '))]);
    var pl = r.plate || {}, has = [pl.spec && 'spec', pl.points && pl.points + '-point read', pl.variants && pl.variants + ' variants', pl.motion && 'motion', pl.live && 'live', pl.compare && 'reference compare', pl.modules && pl.modules + ' liftable modules', pl.examples && pl.examples + (pl.examples === 1 ? ' example' : ' examples'), pl.params && pl.params + ' parameters'].filter(Boolean);
    if (has.length) rows.push(['Carries', e(has.join(' · '))]);
    var src = [p.kind && p.kind.replace('-', ' '), p.title, p.author, p.date, p.license].filter(Boolean).map(e).join(' · ');
    if (src) rows.push(['Source', src + (p.url ? ' <a href="' + e(p.url) + '" style="border-bottom:1px solid #A9A9AD">link ↗</a>' : '')]);
    if (p.rights) rows.push(['Reference', e({ 'first-party': 'First-party. Published.', 'reference-withheld': 'Third-party reference, held locally and not published.', 'reference-published': 'Reference published with the plate.', adapted: 'Adapted. Prose condensed, code written here.', 'reference-study': 'Studied from the corpus, cited by file and line.' }[p.rights] || p.rights)]);
    if (r.governed_by) rows.push(['Governed by', e(r.governed_by.join(' · '))]);
    if (r.swatches) rows.push(['Palette', '<span class="swatches">' + r.swatches.map(function (x) { return '<i style="background:' + e(x) + '" title="' + e(x) + '"></i>'; }).join('') + '</span>']);
    if (r.thumb_kind === 'snapshot') rows.push(['Picture', 'A snapshot of the live plate, taken by the library. <small>The plate has no thumbnail of its own.</small>']);
    rows.push(['Location', r.location ? e(r.location) : '<code>' + e(r.source) + '</code>']);
    if (r.fixity && r.access === 'public') rows.push(['Fixity', '<code>sha256 ' + e(r.fixity) + '…</code>']);
    if (r.access !== 'public') rows.push(['Access', e(cap(r.access)) + ' <small>· ' + e(L.vocabulary.access[r.access]) + (r.target ? ' Bound for ' + e(r.target) + '.' : '') + '</small>']);
    h += '<dl class="dl">' + rows.map(function (x) { return '<dt>' + x[0] + '</dt><dd>' + x[1] + '</dd>'; }).join('') + '</dl>';

    if (r.techniques && r.techniques.length) {
      h += '<section class="dsec"><h2><span class="k">Techniques · ' + r.techniques.length + '</span>' + (pl.modules ? '<span class="k">◆ has a module to lift</span>' : '') + '</h2><div class="chips">' + r.techniques.map(function (k) {
        var t = TECH[k], mod = t && t.uses.some(function (u) { return u.rec === r.id && u.module; });
        return '<a class="' + (mod ? 'mod' : '') + '" href="' + hash({ view: 'techniques', term: k, r: null, q: '', scheme: '' }) + '" title="' + e(t ? t.name : k) + '">' + e(k.split(':').pop()) + '</a>';
      }).join('') + '</div></section>';
    }
    if (r.atoms && r.atoms.length) {
      h += '<section class="dsec"><h2><span class="k">Atoms · ' + r.atoms.length + '</span></h2><div class="chips">' + r.atoms.map(function (k) {
        return '<a href="' + hash({ view: 'atoms', term: k, r: null, q: '', scheme: '' }) + '" title="' + e(ATOM[k] ? ATOM[k].name : k) + '">' + e(k.split(':').pop()) + '</a>';
      }).join('') + '</div></section>';
    }
    var rel = (r.rel || []).filter(function (x) { return byId[x.to]; }).map(function (x) { return { ty: x.type, o: byId[x.to] }; })
      .concat((IN[r.id] || []).map(function (x) { return { ty: '← ' + x.type, o: byId[x.from] }; }));
    if (rel.length) {
      h += '<section class="dsec"><h2><span class="k">Connected · ' + rel.length + '</span></h2><div class="rels">' + rel.map(function (x) {
        return '<a href="' + recHref(x.o) + '" data-r="' + x.o.acc + '"><span class="ty">' + e(x.ty) + '</span><span class="cl">' + e(x.o.call || x.o.acc) + '</span><span>' + e(x.o.title) + '</span></a>';
      }).join('') + '</div></section>';
    }
    var see = SEE['record:' + r.id];
    if (see) h += '<section class="dsec"><h2><span class="k">See also</span></h2>' + see.map(seeBox).join('<div style="height:6px"></div>') + '</section>';
    $drawer.innerHTML = h + '</div>';
    $drawer.setAttribute('aria-hidden', 'false');
    $drawer.scrollTop = 0;
  }
  function markCurrent() {
    var els = document.querySelectorAll('[aria-current="true"]'), i;
    for (i = 0; i < els.length; i++) els[i].removeAttribute('aria-current');
    els = document.querySelectorAll('.lanes .m.sel'); for (i = 0; i < els.length; i++) els[i].classList.remove('sel');
    if (!S.r) return;
    els = document.querySelectorAll('.pl[data-r="' + S.r + '"],.ledger tr[data-r="' + S.r + '"]'); for (i = 0; i < els.length; i++) els[i].setAttribute('aria-current', 'true');
    els = document.querySelectorAll('.lanes .m[data-r="' + S.r + '"]'); for (i = 0; i < els.length; i++) els[i].classList.add('sel');
  }

  /* ---------------------------------------------------------------- render */
  function render() {
    if ($q.value !== S.q && document.activeElement !== $q) $q.value = S.q;
    drawRail();
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
      // a link to another view: route it here, so it works where the host owns the address bar
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
      if (d.copy === 'record') copy(JSON.stringify(o, null, 2), 'Record copied'); else copy(location.href.split('#')[0] + hash({ view: 'plates', term: null, q: '', scheme: '', f: { kind: [], collection: [], status: [], access: [], lane: [] } }), 'Link copied');
      return;
    }
    ev.preventDefault();
    if (d.view) return go({ view: d.view, term: null, r: null, scheme: '' });
    if ('close' in d) return go({ r: null });
    if ('r' in d) { if (d.r) go({ r: d.r === S.r && !t.closest('#drawer') ? null : d.r }); return; }
    if (d.f) return toggle(d.f, d.v);
    if (d.clear) { var f = {}; for (var x in S.f) f[x] = S.f[x]; f[d.clear] = []; return go({ f: f }); }
    if ('clearall' in d) { $q.value = ''; return go({ q: '', f: { kind: [], collection: [], status: [], access: [], lane: [] } }); }
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
    else if (ev.key === 'Escape') { if (S.r) go({ r: null }); else if (typing) { $q.blur(); } else if (S.q) { $q.value = ''; go({ q: '' }); } }
    else if (S.r && !typing && (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight')) {
      var i = LIST.indexOf(byAcc[S.r]), n = LIST[i + (ev.key === 'ArrowRight' ? 1 : -1)];
      if (i >= 0 && n) { ev.preventDefault(); go({ r: n.acc }, true); }
    }
  });
  // a thumbnail that fails to load becomes the same plate a record with no thumbnail gets
  document.addEventListener('error', function (ev) {
    var im = ev.target; if (!im || im.tagName !== 'IMG' || !im.parentNode || !im.parentNode.classList.contains('fr')) return;
    im.parentNode.innerHTML = '<span class="ph"><b class="w">' + e(im.dataset.call || '') + '</b><i>thumbnail did not load</i></span>';
  }, true);
  // lanes: what a mark is, on hover
  document.addEventListener('mousemove', function (ev) {
    var t = ev.target.closest && ev.target.closest('.lanes .hit');
    if (!t) { if (!$tip.hidden) $tip.hidden = true; return; }
    var r = byAcc[t.dataset.r];
    $tip.innerHTML = '<b>' + e((r.call ? r.call + ' · ' : '') + r.title) + '</b><i>' + r.acc + ' · ' + e(COL[r.collection].title) + ' · ' + e(r.dates.accessioned) + '</i>';
    $tip.hidden = false;
    var x = Math.min(ev.clientX + 12, window.innerWidth - $tip.offsetWidth - 8);
    $tip.style.left = x + 'px'; $tip.style.top = (ev.clientY + 16) + 'px';
  });
  var rt, lastW = window.innerWidth;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (window.innerWidth !== lastW) { lastW = window.innerWidth; if (S.view === 'plates') render(); } }, 160); });
  window.addEventListener('popstate', function () { MEM = null; parse(); render(); });
  window.addEventListener('hashchange', function () { MEM = null; parse(); render(); });

  parse(); render();
})();
