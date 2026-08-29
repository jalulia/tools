/* ============================================================================
   views.js — everything the shell draws.
   Registers itself as Shell.views; shell.js calls into it and never the other
   way round, so the router and the transport can be read without reading this.

   Two reading modes, one set of regions:
     course     ordered and pedagogical. Entry = prose + a staged build-up +
                named parameters + the four-rung ladder + a variant gallery +
                1-D plots. Landing route is the first entry.
     catalogue  lateral and comparative. Entry = a lens at 1:1 with a fit
                toggle, then REFERENCE STUDY / PASS 0 / FAULTS / the ruling as
                page furniture rather than panel contents. Landing route is the
                contact sheet.

   The mode branches in exactly four places: the landing route (shell.js), the
   entry body, the drawdown strip (the adapter's job) and the apparatus tab
   names.
   ============================================================================ */
(function () {
  'use strict';
  var S = window.Shell;
  var esc = S.esc;

  var TAB = {
    course:    [['edit', 'Edit'], ['notes', 'Notes'], ['meta', 'Meta']],
    catalogue: [['source', 'Source'], ['decomposition', 'Decomposition'], ['meta', 'Meta']]
  };
  var RELATION = {
    'shader-behind': 'Shader behind →',
    'technique-of':  'Technique →',
    'variant-of':    'Variant →',
    'source-of':     'Used in →',
    'answers':       'Next →'
  };
  var RUNG = { tune: 'Tune', substitute: 'Substitute', generalise: 'Generalise', compose: 'Compose' };

  var view = { kind: null, styleId: null };   // what is on screen right now
  var localExample = null;                    // a stage / gallery variant, not a route

  function el(id) { return document.getElementById(id); }
  function pathOf(e) { return e.path || ('content/' + e.id + '/'); }

  /* ==========================================================================
     Chrome
     ========================================================================== */

  function buildChrome() {
    var m = S.manifest;
    var brand = el('brand');
    if (brand) brand.textContent = m.title;
    document.title = m.title;

    var sw = el('switch');
    if (sw) {
      var sib = m.siblings || [];
      if (!sib.length) sw.remove();
      else sw.innerHTML = sib.map(function (t) {
        return '<a href="' + esc(t.href) + '"' + (t.id === m.id ? ' aria-current="page"' : '') +
               '>' + esc(t.title) + '</a>';
      }).join('');
    }

    var eb = el('edbtn');
    if (eb) eb.firstChild.nodeValue = (m.mode === 'catalogue' ? 'Source ' : 'Edit ');

    var tabs = el('app-tabs');
    if (tabs) {
      tabs.innerHTML = TAB[m.mode || 'course'].map(function (t, i) {
        return '<button type="button" role="tab" data-tab="' + t[0] + '" aria-selected="' +
               (i === 0) + '">' + esc(t[1]) + '</button>';
      }).join('');
      tabs.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () { selectTab(b.dataset.tab); });
      });
    }
    buildHelp();
    S.syncControls();
  }

  /* One keyboard map, printed from one place, so the dialog cannot drift from
     the handler. */
  function buildHelp() {
    var box = el('help-keys');
    if (!box) return;
    var rows = [
      ['/', 'Focus the search field'],
      ['j  k   ↓ ↑', 'Previous / next entry, within the current filter'],
      ['←  →', 'Previous / next example inside the entry'],
      ['e', 'Open or close the apparatus'],
      ['Space', 'Play or pause the stage'],
      ['g  i', 'Go to the contact sheet'],
      ['Esc', 'Leave the field · close the sheet · close the apparatus'],
      ['?', 'This dialog']
    ];
    box.innerHTML = rows.map(function (r) {
      return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>';
    }).join('');
  }

  function selectTab(name) {
    var tabs = el('app-tabs');
    if (!tabs) return;
    tabs.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.dataset.tab === name));
    });
    fillPane(name);
  }
  function activeTab() {
    var b = document.querySelector('#app-tabs button[aria-selected="true"]');
    return b ? b.dataset.tab : (S.manifest.mode === 'catalogue' ? 'source' : 'edit');
  }

  function fillPane(name) {
    var body = el('app-body'), con = el('con'), file = el('app-file');
    if (!body) return;
    var e = S.current, ex = localExample || S.currentExample;
    if (!e) { body.innerHTML = '<p class="empty">Nothing selected.</p>'; if (con) con.textContent = ''; return; }

    if (name === 'edit' || name === 'source') {
      if (S.adapter && S.adapter.fillSource) { S.adapter.fillSource(e, ex); return; }
      body.innerHTML = '<p class="empty">This lane has no source pane.</p>';
      if (con) { con.textContent = ''; con.removeAttribute('data-state'); }
      return;
    }
    if (con) { con.textContent = ''; con.removeAttribute('data-state'); }
    if (file) file.textContent = pathOf(e);

    if (name === 'notes' || name === 'decomposition') {
      body.innerHTML = notesHTML(e);
      return;
    }
    body.innerHTML = metaHTML(e, ex);
  }

  function notesHTML(e) {
    var out = '';
    if (e.reference && e.reference.cells && e.reference.cells.length) {
      out += '<dl>' + e.reference.cells.map(function (c) {
        return '<dt>' + esc(c.k) + '</dt><dd>' + esc(c.v) + '</dd>';
      }).join('') + '</dl>';
    } else {
      out += '<p class="empty">No decomposition on file for this entry.</p>';
    }
    if (e.note) out += '<div class="src-note"><p class="lab">Note</p><p>' + esc(e.note) + '</p></div>';
    return out;
  }

  function metaHTML(e, ex) {
    var rows = [
      ['id', e.id], ['index', e.index], ['order', e.order], ['section', e.section],
      ['lane', e.lane || (S.manifest.stage && S.manifest.stage.adapter)],
      ['status', e.status + (e.stub ? ' · stub' : '')],
      ['style', e.style], ['tags', (e.tags || []).join(', ')],
      ['path', pathOf(e)], ['example', ex ? ex.id : ''],
      ['source', e.source ? [e.source.kind, e.source.title, e.source.author, e.source.license]
        .filter(Boolean).join(' · ') : '']
    ];
    var html = rows.map(function (r) {
      if (r[1] === undefined || r[1] === null || r[1] === '') return '';
      return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>';
    }).join('');
    if (e.source && e.source.url) {
      html += '<dt>url</dt><dd><a href="' + esc(e.source.url) + '" target="_blank" rel="noopener">' +
              esc(e.source.url) + '</a></dd>';
    }
    return '<dl>' + html + '</dl>';
  }

  /* ==========================================================================
     Entry page
     ========================================================================== */

  function renderEntry(e, exampleId, query) {
    S.unobservePreviews();
    view.kind = 'entry';
    S.current = e;
    localExample = null;

    var list = e.examples || [];
    var ex = list.filter(function (x) { return x.id === exampleId; })[0] || list[0] || null;
    S.currentExample = ex;

    var crumb = el('crumb');
    if (crumb) crumb.textContent = S.sectionOf(e.section).title + ' · ' + e.title;
    position();

    var mode = S.manifest.mode;
    var aspect = (e.frame && e.frame.aspect) || (S.manifest.stage && S.manifest.stage.aspect) || '3/2';
    var lane = e.lane || (S.manifest.stage && S.manifest.stage.adapter);
    var catalogueStage = (lane === 'fragment');

    var body = '' +
      '<article style="--stage-aspect:' + esc(aspect.replace('/', ' / ')) + '">' +
        head(e) +
        '<div class="mat"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i>' +
          '<div class="stage" id="stage"' + (catalogueStage ? ' data-fit="lens"' : '') + '></div>' +
        '</div>' +
        '<div class="draw" id="bar"></div>' +
        '<nav class="strip" id="strip" aria-label="Examples"></nav>' +
        '<div class="read" id="read">' + (proseOf(e) || '') + '</div>' +
        (mode === 'course' ? courseBlocks(e) : '') +
        studyHTML(e) + passHTML(e) + critiqueHTML(e) + rulingHTML(e) +
        relatedHTML(e) +
        pagerHTML(e) +
      '</article>';

    el('view').innerHTML = body;

    renderStrip(e, ex);
    S.mountAdapter({
      stage: el('stage'), bar: el('bar'), entry: e, example: ex,
      query: query || {}, params: paramValues(e, ex)
    });
    if (mode === 'course') wireCourse(e, ex, query || {});
    wirePlots(e);
    S.markCurrent();
    fillPane(activeTab());
    window.scrollTo(0, 0);
  }

  function head(e) {
    var sec = S.sectionOf(e.section);
    var right = [];
    // The KIND leads, not the word "src". Four Book of Shaders chapters are
    // original work filling holes upstream left, and PLAN §5.4's complaint was
    // that nothing on the page said so. "adapted · The Book of Shaders —
    // chapter 13" and "original · Written for this tool" both say it in one
    // line, in the place a reader is already looking.
    if (e.source && (e.source.title || e.source.kind)) {
      right.push(String(e.source.kind || 'src').replace('-', ' ') +
                 (e.source.title ? ' · ' + e.source.title : ''));
    }
    if ((e.examples || []).length > 1) right.push((e.examples.length) + ' examples');
    if (e.style) right.push('style · ' + e.style);
    return '<p class="kicker">' + esc(sec.title) + ' · ' + esc(e.index || S.pad(e.order)) + '</p>' +
      '<h1>' + esc(e.title) + '</h1>' +
      '<div class="meta">' +
        '<span class="st" data-st="' + esc(e.status) + '">' + esc(String(e.status).replace('-', ' ')) + '</span>' +
        (e.stub ? '<span class="st" data-st="stub">stub</span>' : '') +
        ((e.tags || []).length
          ? '<span class="tags">' + e.tags.map(function (t) { return '<b>' + esc(t) + '</b>'; }).join(' · ') + '</span>'
          : '') +
        (right.length ? '<span class="tags right">' + esc(right.join('  ·  ')) + '</span>' : '') +
      '</div>';
  }

  function proseOf(e) {
    if (!e.text) return '';
    var t = String(e.text);
    // Prose is authored as an HTML string in the entry file. There is no fetch,
    // so a filename would need a second transport; a template literal next to
    // the code it explains is the right authoring unit anyway.
    return t.trim().charAt(0) === '<' ? t : '<p>' + esc(t) + '</p>';
  }

  function position() {
    var pos = el('pos');
    if (!pos) return;
    if (S.current) {
      var i = S.entries.indexOf(S.current) + 1;
      pos.textContent = i + ' / ' + S.entries.length;
    } else {
      var noun = S.manifest.mode === 'catalogue' ? 'lenses' : 'chapters';
      pos.textContent = S.entries.length + ' ' + noun;
    }
  }

  function renderStrip(e, cur) {
    var box = el('strip');
    var list = e.examples || [];
    if (list.length < 2) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = list.map(function (x, i) {
      var num = (e.index || S.pad(e.order)) + '.' + i;
      return '<button type="button" data-id="' + esc(x.id) + '" aria-current="' +
        String(!!cur && x.id === cur.id) + '">' + esc(num) + ' · ' + esc(x.title) + '</button>';
    }).join('');
    box.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () { S.go(e.id, b.dataset.id, true); });
    });
  }

  /* ==========================================================================
     Course furniture — the chapter anatomy (research/04 §5)
     ========================================================================== */

  function courseBlocks(e) {
    var out = '';
    if ((e.stages || []).length) {
      out += '<section class="blk"><div class="blk-head"><span class="lab">Build-up</span>' +
        '<span class="n">' + e.stages.length + ' stages</span></div>' +
        '<div class="stages" id="stages">' + e.stages.map(function (s, i) {
          return '<button type="button" data-i="' + i + '" aria-current="' + String(!!s.default) + '">' +
            '<span class="n">' + S.pad(i + 1) + '</span>' +
            '<span class="t">' + esc(s.label) + '</span>' +
            (s.note ? '<span class="d">' + esc(s.note) + '</span>' : '') + '</button>';
        }).join('') + '</div>' +
        '<p class="stage-note" id="stagenote"></p></section>';
    }
    var params = e.params || [];
    if (params.length) {
      out += '<section class="blk"><div class="blk-head"><span class="lab">Parameters</span>' +
        '<span class="n">' + params.length + ' named</span></div>' +
        '<div class="params" id="params">' + params.map(function (p) {
          return '<div class="par"><div class="lr"><label for="par-' + esc(p.name) + '">' +
            esc(p.name) + '</label><span class="val" id="val-' + esc(p.name) + '">' +
            fmt(p.value, p.step) + '</span></div>' +
            '<input type="range" id="par-' + esc(p.name) + '" data-name="' + esc(p.name) + '" ' +
            'min="' + (p.min != null ? p.min : 0) + '" max="' + (p.max != null ? p.max : 1) + '" ' +
            'step="' + (p.step || 0.01) + '" value="' + (p.value != null ? p.value : 0) + '"></div>';
        }).join('') + '</div></section>';
    }
    if ((e.plots || []).length) {
      out += '<section class="blk"><div class="blk-head"><span class="lab">The value, in one dimension</span>' +
        '<span class="n">' + e.plots.length + '</span></div>' +
        e.plots.map(function (p, i) {
          return (p.title ? '<p class="stage-note"><b>' + esc(p.title) + '</b></p>' : '') +
            '<div id="plot-host-' + i + '"></div>' +
            (p.note ? '<p class="stage-note">' + p.note + '</p>' : '');
        }).join('') + '</section>';
    }
    if ((e.exercises || []).length) {
      out += '<section class="blk"><div class="blk-head"><span class="lab">Exercises</span>' +
        '<span class="n">' + e.exercises.length + '</span></div><ul class="rungs">' +
        e.exercises.map(function (x) {
          return '<li><span class="rung">' + esc(RUNG[x.rung] || x.rung || '') + '</span>' +
            '<span class="txt">' + (x.text || '') + '</span></li>';
        }).join('') + '</ul></section>';
    }
    if ((e.gallery || []).length) {
      out += '<section class="blk"><div class="blk-head"><span class="lab">Variants</span>' +
        '<span class="n">' + e.gallery.length + '</span></div><div class="gallery" id="gallery">' +
        e.gallery.map(function (g, i) {
          return '<button type="button" data-i="' + i + '">' +
            '<span class="sw"' + (g.thumb ? ' style="background-image:url(' + esc(pathOf(e) + g.thumb) +
              ');background-size:cover"' : '') + '></span>' +
            '<span class="t">' + esc(g.label) + '</span></button>';
        }).join('') + '</div></section>';
    }
    if ((e.links || []).length) {
      out += '<section class="blk"><div class="blk-head"><span class="lab">Elsewhere</span></div>' +
        '<div class="rel" style="border:0;padding-top:0;margin-top:0">' + e.links.map(function (l) {
          return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + ' ↗</a>';
        }).join('') + '</div></section>';
    }
    return out;
  }

  function fmt(v, step) {
    if (v == null) return '';
    return (step && step < 1) ? Number(v).toFixed(2) : String(v);
  }

  function paramValues(e, ex) {
    var out = {};
    ((e.params) || []).forEach(function (p) { out[p.name] = p.value; });
    ((ex && ex.params) || []).forEach(function (p) { out[p.name] = p.value; });
    return out;
  }

  function wireCourse(e, ex, query) {
    var shared = !!(query && query.src);
    var stages = el('stages');
    if (stages) {
      var note = el('stagenote');
      var apply = function (i) {
        var s = e.stages[i];
        stages.querySelectorAll('button').forEach(function (b) {
          b.setAttribute('aria-current', String(+b.dataset.i === i));
        });
        if (note) note.textContent = s.note || '';
        localExample = { id: 'stage-' + i, title: s.label, code: s.code, lane: e.lane };
        S.mountAdapter({
          stage: el('stage'), bar: el('bar'), entry: e, example: localExample,
          query: {}, params: paramValues(e, ex)
        });
        if (document.body.getAttribute('data-apparatus') === 'open') fillPane(activeTab());
      };
      stages.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () { apply(+b.dataset.i); });
      });
      var def = e.stages.map(function (s, i) { return s.default ? i : -1; })
                        .filter(function (i) { return i >= 0; })[0];
      // A shared edit in the URL beats the file, so it also beats the default
      // stage — otherwise opening someone's link silently discards their code.
      if (shared) { if (note) note.textContent = 'Showing a shared edit, not a stage.'; }
      else if (def != null) apply(def);
      else if (note) note.textContent = e.stages[0].note || '';
    }

    var params = el('params');
    if (params) {
      params.querySelectorAll('input[type=range]').forEach(function (inp) {
        inp.addEventListener('input', function () {
          var v = parseFloat(inp.value);
          var out = el('val-' + inp.dataset.name);
          if (out) out.textContent = fmt(v, parseFloat(inp.step));
          if (S.adapter && S.adapter.setParam) S.adapter.setParam(inp.dataset.name, v);
        });
      });
    }

    var gallery = el('gallery');
    if (gallery) {
      gallery.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          var g = e.gallery[+b.dataset.i];
          localExample = { id: 'variant-' + b.dataset.i, title: g.label, code: g.code, lane: e.lane };
          S.mountAdapter({
            stage: el('stage'), bar: el('bar'), entry: e, example: localExample,
            query: {}, params: paramValues(e, ex)
          });
          if (document.body.getAttribute('data-apparatus') === 'open') fillPane(activeTab());
          window.scrollTo({ top: 0, behavior: S.reduced() ? 'auto' : 'smooth' });
        });
      });
    }
  }

  function wirePlots(e) {
    (e.plots || []).forEach(function (p, i) {
      var host = el('plot-host-' + i);
      if (host && S.plot) S.plot.build(p, host);
    });
  }

  /* ==========================================================================
     Catalogue furniture — promoted out of comments and panels, into the page
     ========================================================================== */

  function studyHTML(e) {
    if (e.reference === undefined) return '';
    if (e.reference === null) {
      return '<section class="study"><div class="study-head"><span class="lab">Reference study</span>' +
        '<span class="dir">Not on file</span></div>' +
        '<p class="none">No decomposition on file for this entry. A missing decomposition ' +
        'should be visible, not blank.</p></section>';
    }
    var cells = (e.reference.cells || []);
    if (!cells.length) return '';
    return '<section class="study"><div class="study-head">' +
      '<span class="lab">Reference study</span>' +
      '<span class="src">' + esc(e.reference.title || (e.source && e.source.title) || '') + '</span>' +
      '<span class="dir">What the source does → what the lens does</span></div>' +
      '<div class="cells">' + cells.map(function (c) {
        var parts = String(c.v).split('→');
        return '<div><span class="lab">' + esc(c.k) + '</span>' +
          '<p>' + esc(parts[0].trim()) + '</p>' +
          (parts[1] ? '<p class="does">' + esc(parts[1].trim()) + '</p>' : '') + '</div>';
      }).join('') + '</div></section>';
  }

  function passHTML(e) {
    var p0 = e.pass0 || [];
    var faults = (e.critique && e.critique.faults) || [];
    if (!p0.length && !faults.length) return '';
    return '<section class="pass">' +
      '<div>' + (p0.length
        ? '<div class="blk-head"><span class="lab">Pass 0 — decomposition</span></div><dl>' +
          p0.map(function (c) { return '<dt>' + esc(c.k) + '</dt><dd>' + esc(c.v) + '</dd>'; }).join('') +
          '</dl>'
        : '') + '</div>' +
      '<div>' + (faults.length
        ? '<div class="blk-head"><span class="lab">Faults (pre-refine)</span></div>' +
          '<div class="faults"><ol>' + faults.map(function (f) {
            return '<li>' + esc(f) + '</li>';
          }).join('') + '</ol></div>'
        : '') + '</div>' +
      '</section>';
  }

  function critiqueHTML(e) {
    var c = e.critique;
    if (!c) return '';
    var rows = [
      ['Reads as', c.reads_as],
      ['Coupling', c.coupling],
      ['Pass order', c.pass_order],
      ['Operators', (c.operators || []).join(' · ')],
      ['Why it survives', c.why_it_survives]
    ].filter(function (r) { return r[1]; });
    if (!rows.length) return '';
    return '<section class="blk"><div class="blk-head"><span class="lab">Critique</span>' +
      '<span class="n">stated before it may be shown as canon</span></div>' +
      '<div class="crit">' + rows.map(function (r) {
        return '<div><span class="lab">' + esc(r[0]) + '</span><p>' + esc(r[1]) + '</p></div>';
      }).join('') + '</div></section>';
  }

  function rulingHTML(e) {
    var r = e.ruling;
    if (!r || !r.text) return '';
    return '<section class="ruling"><span class="lab">Ruling</span>' +
      '<p>' + esc(r.text) + '</p>' +
      '<span class="by">' + esc([r.by, r.date].filter(Boolean).join(' · ')) + '</span></section>';
  }

  function relatedHTML(e) {
    var list = e.related || [];
    if (!list.length) return '';
    return '<nav class="rel" aria-label="Related">' + list.map(function (r) {
      var href = (r.tool && r.tool !== S.manifest.id)
        ? (r.href || ('../' + r.tool + '/#/' + r.entry))
        : ('#/' + r.entry);
      var name = r.label || (S.byId[r.entry] && S.byId[r.entry].title) || r.entry;
      return '<a href="' + esc(href) + '">' + esc(name) + ' · ' +
             esc(RELATION[r.relation] || r.relation) + '</a>';
    }).join('') + '</nav>';
  }

  function pagerHTML(e) {
    // prev/next walk the FILTERED list, so a filter that hides things also
    // stops the pager walking into them
    var list = S.filtered.indexOf(e) >= 0 ? S.filtered : S.entries;
    var i = list.indexOf(e);
    var prev = list[i - 1], next = list[i + 1];
    return '<nav class="pager" aria-label="Pager">' +
      (prev ? '<a href="#/' + esc(prev.id) + '"><span class="lab">← Previous</span>' +
              '<span class="t">' + esc(prev.index || '') + ' · ' + esc(prev.title) + '</span></a>'
            : '<span></span>') +
      (next ? '<a class="next" href="#/' + esc(next.id) + '"><span class="lab">Next →</span>' +
              '<span class="t">' + esc(next.index || '') + ' · ' + esc(next.title) + '</span></a>'
            : '<span></span>') +
      '</nav>';
  }

  /* ==========================================================================
     Contact sheet and style page
     ========================================================================== */

  function renderSheet(styleId) {
    S.unmountAdapter();
    S.unobservePreviews();
    view.kind = 'sheet'; view.styleId = styleId || null;
    S.current = null; S.currentExample = null; localExample = null;
    S.markCurrent(); position();

    var crumb = el('crumb');
    var list = S.filtered.filter(function (e) { return !styleId || e.style === styleId; });
    var st = styleId ? S.styleById(styleId) : null;
    if (crumb) crumb.textContent = st ? ('Style · ' + st.title) : ('Contact sheet · ' + S.entries.length +
      (S.manifest.mode === 'catalogue' ? ' lenses' : ' chapters'));

    var order = (S.manifest.sections || []).map(function (s) { return s.id; });
    var groups = {};
    list.forEach(function (e) { (groups[e.section] = groups[e.section] || []).push(e); });
    Object.keys(groups).forEach(function (k) { if (order.indexOf(k) < 0) order.push(k); });

    var studied = S.entries.filter(function (e) { return e.reference && e.reference.cells; }).length;
    var noun = S.manifest.mode === 'catalogue' ? 'lenses' : 'chapters';

    var head = st ? styleDeclaration(st) :
      '<p class="kicker">' + esc(S.manifest.title) + (S.manifest.subtitle ? ' · ' + esc(S.manifest.subtitle) : '') + '</p>' +
      '<h1>Contact sheet</h1>' +
      '<div class="meta"><span class="tags">' + S.entries.length + ' ' + noun +
        ((S.manifest.styles || []).length ? ' <b>·</b> ' + S.manifest.styles.length + ' styles' : '') +
        (studied ? ' <b>·</b> ' + studied + ' with a reference study' : '') + '</span>' +
      // The mount counter is a statement about iframes. A course tool has none,
      // so on a course sheet the line said "0 mounted" forever, about nothing.
      (S.manifest.mode === 'catalogue'
        ? '<span class="tags right">Live frames mount on approach · ' +
          '<span id="mountcount">0</span> mounted</span>'
        : '') + '</div>';

    el('view').innerHTML = head + '<div class="sheet">' +
      (list.length ? order.filter(function (id) { return groups[id]; }).map(function (id) {
        return '<div class="sheet-head" id="sec-' + esc(id) + '">' + esc(S.sectionOf(id).title) +
          '<span class="n">' + groups[id].length + '</span></div>' +
          '<div class="grid">' + groups[id].map(cardHTML).join('') + '</div>';
      }).join('') : '<p class="empty">Nothing matches this filter.</p>') +
      '</div>';

    // current section in the rail while the sheet scrolls — no scroll handler
    var heads = el('view').querySelectorAll('.sheet-head[id^="sec-"]');
    if (heads.length) {
      S.io = new IntersectionObserver(function (rows) {
        rows.forEach(function (r) {
          if (!r.isIntersecting) return;
          var id = r.target.id.replace('sec-', '');
          document.querySelectorAll('.spine .sec').forEach(function (s) {
            s.setAttribute('data-current', String(s.dataset.section === id));
          });
        });
      }, { rootMargin: '-10% 0px -80% 0px' });
      heads.forEach(function (h) { S.io.observe(h); });
    }
    S.observePreviews(el('view'));
  }

  function cardHTML(e) {
    var thumb = e.thumb && (typeof e.thumb === 'string' ? e.thumb : e.thumb.file);
    return '<a class="card" href="#/' + esc(e.id) + '">' +
      '<span class="prev" data-id="' + esc(e.id) + '">' +
        '<span class="queued">' + esc(e.index || e.id) + '</span>' +
        (thumb ? '<img src="' + esc(pathOf(e) + thumb) + '" alt="" loading="lazy" ' +
                 'onerror="this.remove()">' : '') +
      '</span>' +
      '<span class="cap"><span class="n">' + esc(e.index || S.pad(e.order)) + '</span>' +
      '<span class="t">' + esc(e.title) + '</span>' +
      // Same rule as head(): the card names the KIND. "ref · Written for this
      // tool" — which is what "ref ·" produced for every original entry — reads
      // as a citation of something that does not exist. The source TITLE is not
      // repeated here: at 20 cards it wrapped every caption to two lines, and
      // the full attribution is one click away on the entry.
      '<span class="r">' + esc([
        e.source && String(e.source.kind).replace('-', ' '),
        e.status !== 'canonical' && String(e.status).replace('-', ' ')
      ].filter(Boolean).join(' · ')) + '</span></span></a>';
  }

  function styleDeclaration(st) {
    var blocks = '';
    if (st.palette && st.palette.length) {
      blocks += '<div><span class="lab">Palette</span><div class="sw-row">' +
        st.palette.map(function (c) {
          return '<span><i style="background:' + esc(c) + '"></i>' + esc(c) + '</span>';
        }).join('') + '</div></div>';
    }
    if (st.type) {
      blocks += '<div><span class="lab">Type</span>' +
        Object.keys(st.type).map(function (k) {
          return '<p>' + esc(k) + ' · ' + esc(st.type[k]) + '</p>';
        }).join('') + '</div>';
    }
    if (st.texture && st.texture.length) {
      blocks += '<div><span class="lab">Texture</span><p>' + esc(st.texture.join(' · ')) + '</p></div>';
    }
    if (st.engines && st.engines.length) {
      blocks += '<div><span class="lab">Engines</span>' + st.engines.map(function (g) {
        return '<p><code>' + esc(g) + '</code></p>';
      }).join('') + '</div>';
    }
    if (st.rules && st.rules.length) {
      blocks += '<div><span class="lab">Rules</span><ul>' + st.rules.map(function (r) {
        return '<li>' + esc(r) + '</li>';
      }).join('') + '</ul></div>';
    }
    var n = S.entries.filter(function (e) { return e.style === st.id; }).length;
    return '<p class="kicker">Style</p><h1>' + esc(st.title) + '</h1>' +
      (st.summary ? '<p class="read" style="padding-top:0;max-width:66ch">' + esc(st.summary) + '</p>' : '') +
      '<div class="meta"><span class="tags">' + n + ' entries in this style</span></div>' +
      (blocks ? '<div class="decl">' + blocks + '</div>' : '');
  }

  function renderStyle(st) { renderSheet(st.id); }

  function renderLoading(e) {
    el('view').innerHTML = '<p class="empty">Loading ' + esc(e.id) + '…</p>';
  }
  function renderMissing(id) {
    view.kind = 'missing';
    el('view').innerHTML = '<p class="empty">No entry <code>' + esc(id) +
      '</code> in this manifest. <a href="#/index">Back to the index</a>.</p>';
  }

  /* A list view is a function of the filter, so it re-renders when the filter
     changes — which is also what fills the sheet in as entry scripts land. */
  function onFilter() {
    if (view.kind === 'sheet' && el('view')) renderSheet(view.styleId);
    if (S.current) position();
  }

  S.views = {
    buildChrome: buildChrome,
    renderEntry: renderEntry,
    renderSheet: renderSheet,
    renderStyle: renderStyle,
    renderLoading: renderLoading,
    renderMissing: renderMissing,
    selectTab: selectTab,
    fillPane: function () { fillPane(activeTab()); },
    onFilter: onFilter
  };
})();
