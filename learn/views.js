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
  var paramState = {};                        // where the knobs actually are

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
    if (swatchIO) { swatchIO.disconnect(); swatchIO = null; }
    /* ck-e2/e3 · entity page templates. An atom needs a swatch and a param
       inspector; a technique STUB needs the five tests and its instance
       table. A chapter (a technique that carries its own build-up, params,
       gallery and exercises) keeps the course template — the tutorial IS
       the technique for those, and folding the compact page over it would
       hide the very thing the chapter exists to teach. */
    if (e.entity === 'atom')      return renderAtomPage(e);
    var isChapterTechnique = e.entity === 'technique' &&
      ((e.stages || []).length || (e.gallery || []).length ||
       (e.exercises || []).length || (e.params || []).length);
    if (e.entity === 'technique' && !isChapterTechnique) return renderTechniquePage(e, exampleId, query);
    /* ck-e10 · an entry that ships a spec block renders as a plate. E10 is the
       one-entry crossover: only birefringent-ray-bench qualifies. E11 flips
       every entry to the plate view and retires the fall-through below. */
    if (e.spec && S.views && S.views.renderPlate) {
      view.kind = 'entry';
      return S.views.renderPlate(e, exampleId, query);
    }
    view.kind = 'entry';
    S.current = e;
    localExample = null;

    var list = e.examples || [];
    var ex = list.filter(function (x) { return x.id === exampleId; })[0] || list[0] || null;
    S.currentExample = ex;
    paramState = {};                          // a new entry declares its own knobs

    var crumb = el('crumb');
    if (crumb) crumb.textContent = S.sectionOf(e.section).title + ' · ' + e.title;
    position();

    var mode = S.manifest.mode;
    var aspect = (e.frame && e.frame.aspect) || (S.manifest.stage && S.manifest.stage.aspect) || '3/2';
    var lane = e.lane || (S.manifest.stage && S.manifest.stage.adapter);
    var catalogueStage = (lane === 'fragment');
    /* ck-e5 · an audio stage collapses to its panes' height. Otherwise the
       stage's default 3/2 aspect ratio leaves a black wash below a 264 px
       tall wave + spectrum pair. `data-fit="audio"` re-uses the same CSS
       rule that clears aspect-ratio for fragment stages, so no second rule. */
    var audioStage = (lane === 'audio');

    var body = '' +
      '<article style="--stage-aspect:' + esc(aspect.replace('/', ' / ')) + '">' +
        head(e) +
        '<div class="mat"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i>' +
          '<div class="stage" id="stage"' +
            (catalogueStage ? ' data-fit="lens"' : audioStage ? ' data-fit="audio"' : '') + '></div>' +
        '</div>' +
        '<div class="draw" id="bar"></div>' +
        '<nav class="strip" id="strip" aria-label="Examples"></nav>' +
        '<div class="read" id="read">' + (proseOf(e) || '') + '</div>' +
        (mode === 'course' ? courseBlocks(e) : '') +
        studyHTML(e) + passHTML(e) + couplingHTML(e) + critiqueHTML(e) + rulingHTML(e) +
        relatedHTML(e) +
        pagerHTML(e) +
      '</article>';

    el('view').innerHTML = body;

    renderStrip(e, ex);
    S.mountAdapter({
      stage: el('stage'), bar: el('bar'), entry: e, example: ex,
      query: query || {}, params: paramValues(e, ex)
    });
    // Found by the real chapters: 07, 20 and W2 carry BOTH a build-up and an
    // example strip. Applying the default stage unconditionally re-mounted it
    // over whatever the route had just asked for, so every click in the strip
    // bounced straight back to the stage. The route wins; the default stage
    // only fills an unstated one.
    if (mode === 'course') wireCourse(e, ex, query || {}, !!exampleId);
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
    // A deep link to the twelfth chip must not land on a strip showing the
    // first. Below 840 the strip still scrolls, so this is where it matters.
    // scrollIntoView() would move the tab-order starting point into the strip
    // (see shell.js reveal()); write the scroller's scrollLeft instead.
    S.reveal(box.querySelector('button[aria-current="true"]'), 'x');
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

  /* Found by chapter 07: an `edge` of 0.004 on a step of 0.001 printed as
     "0.00", so the one control the chapter is about read as switched off. */
  function fmt(v, step) {
    if (v == null) return '';
    if (!step || step >= 1) return String(v);
    return Number(v).toFixed(step < 0.01 ? 3 : 2);
  }

  /* The declared defaults, once per entry — and after that the live positions
     of the sliders. Switching stage or variant must not reset a knob the reader
     has moved: the panel would still show the moved value and the stage would
     be running the default, which is the worst of both. */
  function paramValues(e, ex) {
    var out = {};
    ((e.params) || []).forEach(function (p) { out[p.name] = p.value; });
    ((ex && ex.params) || []).forEach(function (p) { out[p.name] = p.value; });
    for (var k in paramState) {
      if (Object.prototype.hasOwnProperty.call(out, k)) out[k] = paramState[k];
    }
    return out;
  }

  function wireCourse(e, ex, query, routedExample) {
    var shared = !!(query && query.src);
    var stages = el('stages');
    if (stages) {
      var note = el('stagenote');
      var clearStages = function () {
        stages.querySelectorAll('button').forEach(function (b) {
          b.setAttribute('aria-current', 'false');
        });
      };
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
      // So does an example named in the route: #/07-shapes/polygon asked for
      // the example, not for the build-up.
      if (shared) {
        clearStages();
        if (note) note.textContent = 'Showing a shared edit, not a stage.';
      } else if (routedExample) {
        clearStages();
        if (note) {
          note.textContent = 'Showing the example ' +
            ((ex && ex.title) || '') + ' — pick a stage to return to the build-up.';
        }
      } else if (def != null) { apply(def); }
      else if (note) note.textContent = e.stages[0].note || '';
    }

    var params = el('params');
    if (params) {
      params.querySelectorAll('input[type=range]').forEach(function (inp) {
        inp.addEventListener('input', function () {
          var v = parseFloat(inp.value);
          paramState[inp.dataset.name] = v;
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
          // A variant is not a stage: clear the build-up's current mark so the
          // page never claims to be showing two things at once.
          var st = el('stages'), sn = el('stagenote');
          if (st) st.querySelectorAll('button').forEach(function (x) {
            x.setAttribute('aria-current', 'false');
          });
          if (sn) sn.textContent = 'Showing the variant ' + g.label +
            ' — pick a stage to return to the build-up.';
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

  /* ck-e5 · a coupling is not a third page-kind — it is an ordinary entry
     with a `driver`, a `consequences[]` table, and a mute test. Rendered
     between PASS 0 and CRITIQUE so the coupling reads as its own section.
     `headroom` (audio entries) folds in beneath the coupling table so the
     level decision sits next to the mechanism that produces it. Field
     labels change per lane (reads_as → "listens as", pass_order → "signal
     path") — one line here, zero in the schema. */
  function couplingHTML(e) {
    if (!e.driver && !(e.consequences && e.consequences.length)) return '';
    var rows = (e.consequences || []).map(function (r) {
      return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1] || '') +
             '</td><td class="c">' + esc(r[2] || '') + '</td></tr>';
    }).join('');
    return '<section class="blk coupling"><div class="blk-head">' +
      '<span class="lab">Coupling — one driver, ' + (e.consequences || []).length + ' consequences</span>' +
      '<span class="n">one listen, one look, one mute test</span></div>' +
      (e.driver ? '<p class="coup-driver"><b>driver</b> — ' + esc(e.driver) + '</p>' : '') +
      (rows ? '<table class="cons"><thead><tr><th>consequence</th><th>mapping</th><th>source</th></tr></thead><tbody>' +
              rows + '</tbody></table>' : '') +
      (e.mute_test ? '<p class="coup-mute"><b>Mute test.</b> ' + esc(e.mute_test) + '</p>' : '') +
      '</section>';
  }

  function critiqueHTML(e) {
    var c = e.critique;
    if (!c) return '';
    /* ck-e5 · the FIELD NAMES are the shared schema's (reads_as, pass_order)
       so a sound entry and a visual entry are the same record. Only the
       LABELS change per lane — one line here, zero in the schema. */
    var audio = e.lane === 'audio';
    var rows = [
      [audio ? 'Listens as' : 'Reads as',       c.reads_as, ''],
      ['Coupling',                              c.coupling, ''],
      [audio ? 'Signal path' : 'Pass order',    c.pass_order, ''],
      ['Operators',                             (c.operators || []).join(' · '), ''],
      ['Why it survives',                       c.why_it_survives, ' wide'],
      [audio ? 'Headroom' : 'Headroom',         e.headroom, ' wide']
    ].filter(function (r) { return r[1]; });
    if (!rows.length) return '';
    return '<section class="blk"><div class="blk-head"><span class="lab">Critique</span>' +
      '<span class="n">stated before it may be shown as canon</span></div>' +
      '<div class="crit">' + rows.map(function (r) {
        return '<div class="c' + r[2] + '"><span class="lab">' + esc(r[0]) + '</span>' +
               '<p>' + esc(r[1]) + '</p></div>';
      }).join('') + '</div></section>';
  }

  /* CK8 · A RULING IS AN ATTRIBUTION, AND AN ATTRIBUTION IS A CORRECTNESS
     PROBLEM. The field was added (PLAN §2.7) to promote Julia's own dated
     decisions out of source comments — `// … CANON, do not soften (julia
     2026-06-10)` — into data. Four of the seven rulings on the branch at
     checkpoint 8 could not be traced to any comment in her repositories: they
     were written during the build and signed with her name. They now carry
     `by: 'proposed'`, and a proposed ruling is LABELLED as one in the same
     furniture rather than sitting silently in the same voice as a real one.
     Anything that says `julia` traces to a line in /home/claude/corpus. */
  function rulingHTML(e) {
    var r = e.ruling;
    if (!r || !r.text) return '';
    var proposed = String(r.by || '').toLowerCase() === 'proposed';
    // The heading already says PROPOSED, so the by-line carries only the date
    // and the citation — saying it twice reads as shouting rather than as a
    // label.
    var by = proposed
      ? ['written for this build', r.date, r.source].filter(Boolean).join(' · ')
      : [r.by, r.date, r.source].filter(Boolean).join(' · ');
    return '<section class="ruling"' + (proposed ? ' data-proposed="true"' : '') + '>' +
      '<span class="lab">' + (proposed ? 'Proposed ruling — not yet Julia’s' : 'Ruling') + '</span>' +
      '<p>' + esc(r.text) + '</p>' +
      '<span class="by">' + esc(by) + '</span></section>';
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

    var studied = S.entries.filter(hasStudy).length;
    var unstudied = S.entries.filter(noStudy).length;
    var noun = S.manifest.mode === 'catalogue' ? 'lenses' : 'chapters';

    var head = st ? styleDeclaration(st) :
      '<p class="kicker">' + esc(S.manifest.title) + (S.manifest.subtitle ? ' · ' + esc(S.manifest.subtitle) : '') + '</p>' +
      '<h1>Contact sheet</h1>' +
      '<div class="meta"><span class="tags">' + S.entries.length + ' ' + noun +
        ((S.manifest.styles || []).length ? ' <b>·</b> ' + S.manifest.styles.length + ' styles' : '') +
        (studied ? ' <b>·</b> ' + studied + ' with a reference study' : '') +
        // the mark is defined where it is used, next to the count it stands for
        (unstudied ? ' <b>·</b> ' + ND + ' ' + unstudied + ' without' : '') + '</span>' +
      // The mount counter is a statement about iframes. A course tool has none,
      // so on a course sheet the line said "0 mounted" forever, about nothing.
      (S.manifest.mode === 'catalogue'
        // CK8 · the budget is stated where it is spent. The cap is bytes as
        // well as frames now, and a reader watching the number move is the
        // cheapest possible check that the eviction policy is running.
        ? '<span class="tags right">Live frames mount on approach · ' +
          '<span id="mountcount">0</span> mounted · <span id="mountbytes">0.0 MB</span></span>'
        : '') + '</div>';

    el('view').innerHTML = head + '<div class="sheet">' +
      (list.length ? order.filter(function (id) { return groups[id]; }).map(function (id) {
        return '<div class="sheet-head" id="sec-' + esc(id) + '">' + esc(S.sectionOf(id).title) +
          '<span class="n">' + groups[id].length + '</span></div>' +
          '<div class="grid">' + groups[id].map(cardHTML).join('') + '</div>';
      }).join('') : '<p class="empty">Nothing matches this filter.</p>') +
      '</div>' + (st ? stylePager(st) : '');

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

  /* The caption's third line. It printed `source.kind`, which was the string
     "reference study" on all twenty-seven cards — a label identical on every
     card is doing no work, and checkpoint 5 flagged it. What a card can say
     that is TRUE OF THAT CARD is either the reference it decomposes or, when
     there is no external reference, the style it belongs to. `original` leads
     when the work is Julia's own, because that is the one thing about a lens's
     provenance a reader cannot infer from the picture. */
  function subtitleOf(e) {
    var st = S.styleById && e.style ? S.styleById(e.style) : null;
    var styleName = (st && st.title) || e.style || '';
    var src = e.source || {};
    var bits = [];
    if (String(src.kind) === 'original') {
      bits.push(styleName ? 'original · ' + styleName : 'original');
    } else {
      bits.push(src.title || styleName || String(src.kind || '').replace('-', ' '));
    }
    if (e.status !== 'canonical') bits.push(String(e.status).replace('-', ' '));
    return bits.filter(Boolean).join('  ·  ');
  }

  /* A lens with no decomposition on file. The entry page says it in a
     sentence; the sheet is where the RATIO is visible, and it was not visible
     at all. The mark is typographic and greyscale, like the status marks, but
     it is deliberately NOT one of them: ■ □ ▨ ⬚ are four values of one
     variable (editorial status) and a missing decomposition is a different
     variable (what is documented). Reusing ⬚ would give one mark two meanings,
     which is the thing PLAN §5.6 forbids. ∅ is the machine's own word for
     none, it is in the mono face like everything else reported, and it
     survives greyscale because it never had a colour. */
  function hasStudy(e) {
    return !!(e.reference && e.reference.cells && e.reference.cells.length);
  }
  /* DECLARED absent, not merely missing — the same distinction studyHTML()
     already makes. `reference: null` is an entry saying "there is no
     decomposition on file for this one"; `reference` undefined is a tool in
     which the question does not arise. Without that line the Book of Shaders'
     contact sheet grew twenty-six ∅ marks and a legend reading "26 without",
     about a field no chapter has ever declared. */
  function noStudy(e) {
    return e.reference === null;
  }
  var ND = '<i class="nd" aria-hidden="true">∅</i>' +
           '<span class="vh">no decomposition on file</span>';

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
      '<span class="r">' + (noStudy(e) ? ND : '') + esc(subtitleOf(e)) +
      '</span></span></a>';
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
    if (st.engines) {
      // An EMPTY list is a statement, not a missing field: technical-doc
      // declares one because no lens in it allocates a canvas, and a style
      // page that simply omitted the block would look like an oversight.
      blocks += '<div><span class="lab">Engines</span>' + (st.engines.length
        ? st.engines.map(function (g) { return '<p><code>' + esc(g) + '</code></p>'; }).join('')
        : '<p>None — no lens in this style allocates a canvas.</p>') + '</div>';
    }
    // The rules are the longest block and the only prose here, so it takes the
    // whole row under the four short declarations rather than sitting in a
    // 228px column with three empty ones beside it.
    var rules = (st.rules && st.rules.length)
      ? '<div class="rules"><span class="lab">Rules</span><ul>' + st.rules.map(function (r) {
          return '<li>' + esc(r) + '</li>';
        }).join('') + '</ul></div>'
      : '';

    var mine = S.entries.filter(function (e) { return e.style === st.id; });
    var cat = S.manifest.mode === 'catalogue';
    var noun = mine.length === 1 ? (cat ? 'lens' : 'entry') : (cat ? 'lenses' : 'entries');
    var studied = mine.filter(hasStudy).length;
    var unstudied = mine.filter(noStudy).length;

    return '<p class="kicker"><a href="#/index">' + esc(S.manifest.title) +
        '</a> · Style</p><h1>' + esc(st.title) + '</h1>' +
      (st.summary ? '<p class="read" style="padding-top:0;max-width:66ch">' + esc(st.summary) + '</p>' : '') +
      '<div class="meta"><span class="tags">' + mine.length + ' ' + noun + ' in this style' +
        (studied ? ' <b>·</b> ' + studied + ' with a reference study' : '') +
        (unstudied ? ' <b>·</b> ' + ND + ' ' + unstudied + ' without' : '') +
      '</span>' +
      // the style file is what every fragment in the style actually links, so
      // the page says where it is, the way the course apparatus names its file
      '<span class="tags right">content/_styles/' + esc(st.id) + '.css</span></div>' +
      (blocks || rules ? '<div class="decl">' + blocks + rules + '</div>' : '');
  }

  /* Styles are a set of six, so they get the same prev/next an entry gets.
     Without it a style page is a cul-de-sac: the rail lists lenses, not
     styles, so the only way out was the browser's back button. */
  function stylePager(st) {
    var list = S.manifest.styles || [];
    var i = list.map(function (s) { return s.id; }).indexOf(st.id);
    if (i < 0 || list.length < 2) return '';
    var prev = list[(i - 1 + list.length) % list.length];
    var next = list[(i + 1) % list.length];
    return '<nav class="pager style-pager" aria-label="Styles">' +
      '<a href="#/style/' + esc(prev.id) + '"><span class="lab">← Previous style</span>' +
        '<span class="t">' + esc(prev.title) + '</span></a>' +
      '<a class="next" href="#/style/' + esc(next.id) + '"><span class="lab">Next style →</span>' +
        '<span class="t">' + esc(next.title) + '</span></a></nav>';
  }

  function renderStyle(st) { renderSheet(st.id); }

  /* ck-e2 · atom-shelves helpers. The atoms table is the review stop:
     TEXTURE, SUBSTRATE, PROCESS sit as three side-by-side shelves in that
     order (D2 · texture is a sibling, not their parent). The ATOM_KIND_ORDER
     below is what makes that visible without an argument. */
  var ATOM_KIND_ORDER = ['texture', 'substrate', 'process', 'colour', 'type',
    'engine', 'field', 'mark', 'voice', 'space', 'bus'];
  var ATOM_KIND_NOTE = {
    texture:   'the surface consequences — what a printed sheet looks like.',
    substrate: 'the stock you print ONTO. A tooth is a consequence of its fibres, not a property of it.',
    process:   'the reproduction event. An action applied to a field on a substrate.',
    colour:    'ramps only. A lone hex has no parameters and no lesson.',
    engine:    'a shared implementation, cited by every fragment that uses it. Code is an entry, not a path.',
    field:     'the continuous input a technique consumes — noise as a source, not as a texture.',
    mark:      'hand-scale marks that go ON TOP of a plate. Never a filter.',
    type:      'display, text, mono, script. Roles, not families.',
    voice:     'a source: the thing that generates the audio signal.',
    space:     'the ambience the voice sits in.',
    bus:       'the graph the voice is bussed through.'
  };
  var LAYERS = ['SOURCE', 'STRUCTURE', 'MATERIAL RESPONSE', 'IMAGE FORMATION',
    'SCREEN-SPACE', 'TEMPORAL', 'GRAPHIC COMPOSITION'];

  /* A hand-maintained lookup so the 22 Book-of-Shaders chapters (each shipped
     from its own entry.js) can be filed under a seven-layer heading without
     touching the twenty-two files. Any technique that DOES declare `layer` on
     the entry wins over this table. Unfiled techniques land in a "no layer on
     file" band at the top of the index. */
  var CHAPTER_LAYER = {
    '00-introduction':               'SOURCE',
    '01-what-is-a-shader':           'SOURCE',
    '02-hello-world':                'SOURCE',
    '03-uniforms':                   'SOURCE',
    '04-running-your-shader':        'SOURCE',
    '05-shaping-functions':          'STRUCTURE',
    '06-colors':                     'GRAPHIC COMPOSITION',
    '07-shapes':                     'STRUCTURE',
    '08-matrices':                   'STRUCTURE',
    '09-patterns':                   'STRUCTURE',
    '10-random':                     'SOURCE',
    '11-noise':                      'SOURCE',
    '12-cellular-noise':             'SOURCE',
    '13-fractal-brownian-motion':    'SOURCE',
    '14-fractals':                   'STRUCTURE',
    '15-textures':                   'MATERIAL RESPONSE',
    '16-image-operations':           'SCREEN-SPACE',
    '17-kernel-convolutions':        'SCREEN-SPACE',
    '18-filters':                    'SCREEN-SPACE',
    '19-other-effects':              'SCREEN-SPACE',
    '20-dithering-and-quantization': 'IMAGE FORMATION',
    '21-domain-warping':             'STRUCTURE'
  };
  function layerOf(e) { return e.layer || CHAPTER_LAYER[e.id] || null; }

  /* Everything that instances a technique — direct via instance_of[], plus (for
     the chapter techniques where W1..W4 already declare a stub) the worked
     example as the CANONICAL instance. Small enough to compute per render. */
  function instancesOfTechnique(tid) {
    return S.entries.filter(function (e) {
      return e.entity !== 'technique' && (e.instance_of || []).indexOf(tid) >= 0;
    });
  }
  /* Explorations that use[] a given atom, with the params they used. Used by
     both the atom page ("used by N" strip) and the exploration-side chip row. */
  function usesOfAtom(aid) {
    var out = [];
    S.entries.forEach(function (e) {
      if (e.entity === 'atom') return;
      (e.uses || []).forEach(function (u) {
        var id = typeof u === 'string' ? u : u && u.atom;
        if (id === aid) out.push({ entry: e, params: (typeof u === 'object' && u.params) || null });
      });
    });
    return out;
  }
  /* Techniques that PRODUCE this atom (declared on the technique).           */
  function producesOfAtom(aid) {
    return S.entries.filter(function (e) {
      return e.entity === 'technique' && (e.produces || []).indexOf(aid) >= 0;
    });
  }
  /* Every skill id → skill object from the manifest.                         */
  function skillById(id) {
    return ((S.manifest && S.manifest.skills) || []).filter(function (s) { return s.id === id; })[0] || null;
  }
  function styleById(id) { return S.styleById && S.styleById(id); }

  /* Swatch paint. Two paths: an above-the-fold pass runs SYNCHRONOUSLY (no IO
     wait, no scroll trigger) so a full-page screenshot at 1440 shows every
     shelf painted; anything past 2000 px of scroll falls back to an
     IntersectionObserver with a 400 px approach margin. Painting all 18
     synchronously costs ~40 ms on a mid-desktop, well inside a frame — the
     original 250 ms measure was with @2x DPR uncapped; swatches.js caps at
     1.5×. A canvas is a one-shot draw, not a live frame, so once painted it
     stays painted. */
  var swatchIO = null;
  function observeSwatches(root) {
    if (swatchIO) { swatchIO.disconnect(); swatchIO = null; }
    if (!root || !S.paintSwatch) return;
    var cells = [].slice.call(root.querySelectorAll('canvas[data-atom]:not([data-painted])'));
    if (!cells.length) return;
    /* the approach: paint each in a rAF, stopping at 2000 px of doc scroll so
       the initial paint stays inside one frame budget. Anything past that
       waits on the observer. */
    var eager = [], lazy = [];
    cells.forEach(function (c) {
      var r = c.getBoundingClientRect();
      var top = r.top + window.scrollY;
      if (top < 2000) eager.push(c); else lazy.push(c);
    });
    /* eager pass — stagger by microtasks so a slow paint does not block chrome */
    var i = 0;
    function tick() {
      var start = performance.now();
      while (i < eager.length && performance.now() - start < 12) {
        S.paintSwatch(eager[i]);
        eager[i].setAttribute('data-painted', 'true');
        i++;
      }
      if (i < eager.length) requestAnimationFrame(tick);
    }
    if (eager.length) requestAnimationFrame(tick);
    /* lazy pass — observe */
    if (lazy.length) {
      swatchIO = new IntersectionObserver(function (rows) {
        rows.forEach(function (r) {
          if (!r.isIntersecting) return;
          S.paintSwatch(r.target);
          r.target.setAttribute('data-painted', 'true');
          swatchIO.unobserve(r.target);
        });
      }, { rootMargin: '400px 0px' });
      lazy.forEach(function (c) { swatchIO.observe(c); });
    }
  }
  S.observeSwatches = observeSwatches;

  /* One atom cell — the shelves' unit. Includes the swatch canvas, the name,
     the parameter count and the usage count. `used by N` is derived from
     uses[] across all entries — nothing counted twice. */
  function atomCellHTML(a) {
    var used = usesOfAtom(a.id).length;
    var params = (a.params || []).length;
    return '<a class="sw-cell" href="#/atom/' + esc(a.id) + '">' +
      '<span class="sw"><canvas data-atom="' + esc(a.id) + '"></canvas></span>' +
      '<span class="lbl">' +
        '<b>' + esc(a.title) + '</b>' +
        '<i class="ct">' + (used ? '&times;' + used : '&times;0') + '</i>' +
      '</span>' +
      '<span class="sub">' + params + ' param' + (params === 1 ? '' : 's') +
        (a.kind === 'engine' ? ' · shared engine' : '') + '</span>' +
      '</a>';
  }

  function renderAtomsShelves(query) {
    var atoms = S.entries.filter(function (e) { return e.entity === 'atom'; });
    var byKind = Object.create(null);
    atoms.forEach(function (a) { (byKind[a.kind] = byKind[a.kind] || []).push(a); });
    var kinds = ATOM_KIND_ORDER.filter(function (k) { return byKind[k]; })
      .concat(Object.keys(byKind).filter(function (k) { return ATOM_KIND_ORDER.indexOf(k) < 0; }));

    var head =
      '<p class="kicker">Materials</p>' +
      '<h1>Atoms</h1>' +
      '<p class="lede">The whole practice as one table. Banded by <b>kind</b>; every cell is an atom ' +
      'with parameters, an engine file where it has one, and a usage count.</p>' +
      '<p class="lede"><b>TEXTURE sits beside SUBSTRATE and PROCESS, not above them.</b> ' +
      'Paper tooth is the surface consequence of Bone 140gsm — so the answer to ' +
      '&ldquo;does TEXTURE make more sense to house things like Paper, Print&rdquo; is ' +
      'no: it is their sibling.</p>' +
      '<div class="meta"><span class="tags">' +
        atoms.length + ' atoms <b>·</b> ' + kinds.length + ' kinds' +
      '</span></div>';

    var shelves = kinds.map(function (k) {
      var group = byKind[k];
      return '<section class="shelf" data-kind="' + esc(k) + '">' +
        '<div class="shelf-head">' +
          '<span class="lab">' + esc(k) + '</span>' +
          '<span class="n">' + group.length + '</span>' +
          (ATOM_KIND_NOTE[k] ? '<span class="nt">' + esc(ATOM_KIND_NOTE[k]) + '</span>' : '') +
        '</div>' +
        '<div class="atoms-grid">' + group.map(atomCellHTML).join('') + '</div>' +
      '</section>';
    }).join('');

    var ladder = atoms.filter(function (a) { return !producesOfAtom(a.id).length && a.kind !== 'engine'; });
    var footer = ladder.length
      ? '<hr class="r"><section class="ladder">' +
        '<div class="shelf-head"><span class="lab">The ladder, inverted</span>' +
        '<span class="n">' + ladder.length + ' atom' + (ladder.length === 1 ? '' : 's') + ' with no technique above ' +
        (ladder.length === 1 ? 'it' : 'them') + '</span></div>' +
        '<p class="lede sm">An atom that two or more pieces use with no technique above it is a candidate ' +
        'technique — the ladder climbs itself. Named on the atom page as its <b>produces-of</b>.</p>' +
        '<ul class="lad-list">' + ladder.map(function (a) {
          return '<li><a href="#/atom/' + esc(a.id) + '"><b>' + esc(a.title) + '</b>' +
                 '<span class="s">' + esc(a.description || a.note || '') + '</span></a></li>';
        }).join('') + '</ul></section>'
      : '';

    el('view').innerHTML = head + shelves + footer;
    observeSwatches(el('view'));
  }

  /* ck-e2 · the atom entry page. Live swatch at design width, params
     inspector (drag to redraw), used-by strip, produces-of, admitted-by,
     governed-by. Called from renderEntry when e.entity === 'atom'. */
  /* ck-e13 · fine-grained crossover block. Reads Shell.crossover (built by
     scripts/build-crossover.mjs) and renders a small section listing every
     entry that names this id in its spec. Distinct from the coarse
     instance_of/uses aggregations rendered elsewhere on the same page. */
  function crossoverBlockHTML(kind, id, opts) {
    var cx = S.crossover && S.crossover[kind === 'atom' ? 'atoms' : 'techniques'];
    if (!cx || !cx[id]) return '';
    var appears = kind === 'atom' ? (cx[id].used_by || []) : (cx[id].appears_in || []);
    if (!appears.length) return '';
    var seenExisting = opts && opts.excludeEntryIds ? new Set(opts.excludeEntryIds) : new Set();
    var rows = appears.filter(function (a) { return !seenExisting.has(a.entry_id); });
    if (!rows.length) return '';
    var head = kind === 'atom'
      ? 'Cited in spec (' + rows.length + ')'
      : 'Also appears in spec of (' + rows.length + ')';
    var subhead = kind === 'atom'
      ? 'entries whose spec.techniques[].atoms[] name this atom'
      : 'entries whose spec.techniques[] use this id';
    return '<section class="atom-block"><div class="blk-head"><span class="lab">' + esc(head) + '</span>' +
      '<span class="n">' + esc(subhead) + '</span></div>' +
      '<div class="chips" style="margin:8px 0 4px">' + rows.map(function (row) {
        var target = S.byId && S.byId[row.entry_id];
        var label = target && target.title ? target.title : row.entry_id;
        var suffix = kind === 'atom' && row.technique_id ? ' · ' + row.technique_id : '';
        return '<a class="pip" href="#/entry/' + esc(row.entry_id) + '">' + esc(label + suffix) + '</a>';
      }).join('') + '</div></section>';
  }

  function renderAtomPage(a) {
    view.kind = 'atom';
    S.current = a; S.currentExample = null; localExample = null;
    S.markCurrent(); position();
    var crumb = el('crumb');
    if (crumb) crumb.textContent = 'Atom · ' + a.title;

    var uses = usesOfAtom(a.id);
    var produces = producesOfAtom(a.id);
    var admits = ((S.manifest && S.manifest.styles) || []).filter(function (st) {
      return (st.texture || []).indexOf(a.id) >= 0;
    });

    var stChip = '<span class="st" data-st="' + esc(a.status || 'exploration') + '">' +
      esc(String(a.status || 'exploration').replace('-', ' ')) + '</span>';

    var params = a.params || [];
    var paramsHTML = params.length
      ? '<section class="atom-block"><div class="blk-head"><span class="lab">Parameters</span>' +
        '<span class="n">' + params.length + ' declared · drag to redraw</span></div>' +
        '<div class="atom-params">' + params.map(function (p) {
          var min = p.min != null ? p.min : 0, max = p.max != null ? p.max : 1;
          return '<div class="par">' +
            '<div class="lr"><label for="ap-' + esc(p.name) + '"><b>' + esc(p.name) + '</b>' +
              (p.note ? ' <span class="nt">' + esc(p.note) + '</span>' : '') + '</label>' +
              '<span class="val" id="ap-val-' + esc(p.name) + '">' + esc(String(p.value)) +
              '</span></div>' +
            '<input type="range" id="ap-' + esc(p.name) + '" data-name="' + esc(p.name) + '" ' +
              'min="' + min + '" max="' + max + '" step="' + (p.step || 0.01) +
              '" value="' + (p.value != null ? p.value : 0) + '">' +
            '<div class="mm"><i>' + esc(String(min)) + '</i><i>default ' +
              esc(String(p.value != null ? p.value : '—')) +
              '</i><i>' + esc(String(max)) + '</i></div>' +
          '</div>';
        }).join('') + '</div></section>'
      : '<section class="atom-block"><p class="empty">No parameters declared. This atom fires as-is; ' +
        'the value it carries is the fact of the engine, not a knob it exposes.</p></section>';

    /* used-by strip: the pieces that cite this atom, with the params THEY
       chose. Julia's red line: cells here are the exploration's own thumb, or
       an honest "no thumbnail on file". Never a re-render of the atom. */
    var usedByHTML = uses.length
      ? '<section class="atom-block"><div class="blk-head"><span class="lab">Used by</span>' +
        '<span class="n">' + uses.length + ' piece' + (uses.length === 1 ? '' : 's') +
        ' — each cell is the piece itself, at the params it chose</span></div>' +
        '<div class="used-strip">' + uses.map(function (u) {
          var e = u.entry;
          var thumb = e.thumb && (typeof e.thumb === 'string' ? e.thumb : e.thumb.file);
          var pathBase = e.path || ('content/' + e.id + '/');
          var thumbHTML = thumb
            ? '<img src="' + esc(pathBase + thumb) + '" alt="" loading="lazy" onerror="this.classList.add(\'nothumb\');this.removeAttribute(\'src\')">'
            : '<span class="nothumb">no thumbnail<br>on file</span>';
          var pv = u.params ? Object.keys(u.params).map(function (k) {
            return k + ': ' + u.params[k];
          }).join(' · ') : '';
          return '<a class="used-cell" href="#/' + esc(e.id) + '">' +
            '<span class="th">' + thumbHTML + '</span>' +
            '<span class="cap"><b>' + esc(e.index || e.title) + '</b>' +
              (pv ? '<span class="pv">' + esc(pv) + '</span>' : '') +
            '</span></a>';
        }).join('') + '</div></section>'
      : '<section class="atom-block"><div class="blk-head"><span class="lab">Used by</span>' +
        '<span class="n">nothing yet</span></div>' +
        '<p class="empty">Zero uses. Tyvek showing ×0 is the discipline — do not hide empty cells.</p></section>';

    var producesHTML = produces.length
      ? '<div class="atom-side-block"><span class="lab">Produced by</span>' + produces.map(function (t) {
          return '<a class="mini-card" href="#/technique/' + esc(t.id) + '"><b>' + esc(t.title) + '</b>' +
            (t.description ? '<span class="s">' + esc(t.description) + '</span>' : '') + '</a>';
        }).join('') + '</div>'
      : '<div class="atom-side-block"><span class="lab">Produced by</span>' +
        '<p class="empty sm">No technique above this atom. It repeats and nobody has written down ' +
        'why — a candidate (see the ladder on <a href="#/atoms">#/atoms</a>).</p></div>';

    var admitsHTML = admits.length
      ? '<div class="atom-side-block"><span class="lab">Admitted by</span><div class="chips">' +
        admits.map(function (st) {
          return '<a class="pip" href="#/style/' + esc(st.id) + '">' + esc(st.title) + '</a>';
        }).join('') + '</div></div>'
      : '<div class="atom-side-block"><span class="lab">Admitted by</span>' +
        '<p class="empty sm">no style declares it in its texture vocabulary.</p></div>';

    var govHTML = (a.governed_by || []).length
      ? '<div class="atom-side-block"><span class="lab">Governed by</span><div class="chips">' +
        a.governed_by.map(function (sid) {
          var sk = skillById(sid);
          return '<a class="pip" href="#/skill/' + esc(sid) + '">' + esc((sk && sk.title) || sid) + '</a>';
        }).join('') + '</div></div>'
      : '';

    /* the engine link — if this atom IS an engine, it points at its own file;
       if it uses an engine that is itself an atom, it points at that. */
    var engineChip = '';
    if (a.kind === 'engine') {
      var file = ({ 'mulberry32': 'rng.js', 'halftone-js': 'halftone.js',
        'paper-js': 'paper.js', 'field-js': 'field.js' })[a.id];
      if (file) engineChip = '<div class="atom-side-block"><span class="lab">Engine file</span>' +
        '<p class="src">content/_engines/' + esc(file) + '</p></div>';
    }

    el('view').innerHTML =
      '<p class="kicker">Atom · <a href="#/atoms" style="text-decoration:none;color:inherit">' +
        esc(a.kind) + '</a></p>' +
      '<h1>' + esc(a.title) + '</h1>' +
      '<div class="meta">' + stChip +
        (a.stub ? '<span class="st" data-st="stub">stub</span>' : '') +
        '<span class="tags">kind: ' + esc(a.kind) + '  <b>·</b>  used ×' + uses.length +
          (params.length ? '  <b>·</b>  ' + params.length + ' params' : '') +
        '</span></div>' +
      '<p class="lede">' + esc(a.description || a.note || '') + '</p>' +
      '<div class="atom-split">' +
        '<div class="atom-main">' +
          '<section class="atom-block"><div class="blk-head"><span class="lab">Swatch — the atom, at declared defaults</span>' +
            '<span class="n">painted live from swatches.js</span></div>' +
            '<div class="atom-swatch"><canvas data-atom="' + esc(a.id) + '" data-live="true"></canvas></div>' +
          '</section>' +
          paramsHTML +
          usedByHTML +
          crossoverBlockHTML('atom', a.id, { excludeEntryIds: uses.map(function (u) { return u.entry.id; }) }) +
          (a.note && a.note !== a.description
            ? '<section class="atom-block"><div class="blk-head"><span class="lab">Note</span></div>' +
              '<p class="atom-note">' + esc(a.note) + '</p></section>'
            : '') +
        '</div>' +
        '<aside class="atom-side">' +
          producesHTML + admitsHTML + engineChip + govHTML +
        '</aside>' +
      '</div>' +
      pagerHTML(a);

    /* paint the hero swatch immediately; wire params to redraw. */
    var hero = document.querySelector('.atom-swatch canvas[data-atom]');
    if (hero && S.paintSwatch) S.paintSwatch(hero);
    /* also paint any thumbnails / mini cards elsewhere via observer */
    observeSwatches(el('view'));

    var atomState = {};
    (a.params || []).forEach(function (p) { atomState[p.name] = p.value; });
    document.querySelectorAll('.atom-params input[type=range]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var v = parseFloat(inp.value);
        atomState[inp.dataset.name] = v;
        var out = document.getElementById('ap-val-' + inp.dataset.name);
        if (out) out.textContent = fmt(v, parseFloat(inp.step));
        if (hero && S.paintSwatch) {
          hero.removeAttribute('data-painted');
          S.paintSwatch(hero, atomState);
        }
      });
    });
    window.scrollTo(0, 0);
  }

  /* ck-e3 · the technique index. Grouped by seven-layer position; every row
     is prose + a contact strip of its instance thumbs; UNFILED count is at
     the TOP of the page (D1 · julia-proxy's condition on the "techniques as
     front door" decision). */
  function renderTechniquesIndex() {
    var techs = S.entries.filter(function (e) { return e.entity === 'technique'; });
    var byLayer = Object.create(null);
    var noLayer = [];
    techs.forEach(function (t) {
      var L = layerOf(t);
      if (L) (byLayer[L] = byLayer[L] || []).push(t);
      else noLayer.push(t);
    });
    var order = LAYERS.filter(function (L) { return byLayer[L]; });

    var unsorted = S.entries.filter(function (e) { return e.status === 'unsorted'; }).length;

    var head =
      '<p class="kicker">Index</p>' +
      '<h1>Techniques</h1>' +
      '<p class="lede">A technique is a <b>verb with a lesson</b>. Every row lists its instances — recognising ' +
      'the work by looking at it is the whole point.</p>' +
      '<p class="lede sm">' +
      '<b>File by atom, read by technique</b> — and file before you know either. ' +
      'Grouped by the seven-layer position each acts at (SOURCE, STRUCTURE, ' +
      'MATERIAL RESPONSE, IMAGE FORMATION, SCREEN-SPACE, TEMPORAL, GRAPHIC COMPOSITION).' +
      '</p>' +
      '<div class="meta"><span class="tags">' + techs.length + ' techniques <b>·</b> ' +
        S.entries.filter(function (e) { return !e.entity || e.entity === 'exploration'; }).length + ' instances <b>·</b> ' +
        S.entries.filter(function (e) { return e.entity === 'atom'; }).length + ' atoms' +
      '</span></div>';

    /* Unfiled block at TOP — REVIEW-ARCHITECT §0's non-optional condition on
       the "techniques as front door" recommendation. Prints 0 when nothing is
       unsorted, on purpose: an empty count you can see is a to-do list. */
    var unfiledBar =
      '<div class="unfiled-bar"><a href="#/unfiled">' +
      '<span class="lab">Unfiled</span> ' +
      '<b>' + unsorted + '</b> imports awaiting a ruling — a number to drive down' +
      '</a></div>';

    var body = order.map(function (L) {
      return techLayerBlock(L, byLayer[L]);
    }).join('') + (noLayer.length ? techLayerBlock('NO LAYER ON FILE', noLayer) : '');

    el('view').innerHTML = head + unfiledBar + body;
    observeSwatches(el('view'));
  }

  function techLayerBlock(name, list) {
    return '<section class="layer"><div class="layer-head">' +
      '<span class="lab">' + esc(name) + '</span>' +
      '<span class="n">' + list.length + '</span>' +
    '</div>' + list.map(techRow).join('') + '</section>';
  }

  function techRow(t) {
    var inst = instancesOfTechnique(t.id);
    var stChip = '<span class="st" data-st="' + esc(t.status || 'canonical') + '">' +
      esc(String(t.status || 'canonical').replace('-', ' ')) + '</span>' +
      (t.stub ? '<span class="st" data-st="stub">stub</span>' : '');

    /* the contact strip. Three cases, in this order of preference:
       1. This technique has external instances (explorations that carry
          instance_of[]). Show up to six of their thumbs.
       2. It has no external instances but has an internal `gallery[]` with
          thumbs (the 22 chapters — the gallery IS the instance list, so a
          chapter should not read as barren just because nobody has promoted
          its variants to top-level entries yet).
       3. Nothing — say so honestly. The `stub` chapters (unlinked etc.)
          without instances will land here.                                   */
    var stripHTML, countLbl;
    if (inst.length) {
      stripHTML = inst.slice(0, 6).map(function (e) {
        var thumb = e.thumb && (typeof e.thumb === 'string' ? e.thumb : e.thumb.file);
        var pathBase = e.path || ('content/' + e.id + '/');
        var img = thumb
          ? '<img src="' + esc(pathBase + thumb) + '" alt="" loading="lazy" onerror="this.classList.add(\'nothumb\');this.removeAttribute(\'src\')">'
          : '<span class="nothumb">no<br>thumb</span>';
        return '<a class="inst-thumb" href="#/' + esc(e.id) + '" title="' + esc(e.title) + '" aria-label="Open instance: ' + esc(e.title) + '">' +
          img + '</a>';
      }).join('') + (inst.length > 6 ? '<span class="more">+' + (inst.length - 6) + '</span>' : '');
      countLbl = inst.length + ' inst.';
    } else {
      /* fall back to a chapter's own gallery + main thumb — the built-in
         examples that ck-e3 does not promote to top-level explorations
         (judgment call — see CHECKPOINT-E3.md). */
      var galleryThumbs = (t.gallery || []).filter(function (g) { return g.thumb; });
      var mainThumb = t.thumb && (typeof t.thumb === 'string' ? t.thumb : t.thumb.file);
      var pathBase = t.path || ('content/' + t.id + '/');
      var chips = [];
      if (mainThumb) {
        chips.push('<span class="inst-thumb self" title="' + esc(t.title) + ' — this chapter’s own plate">' +
          '<img src="' + esc(pathBase + mainThumb) + '" alt="" loading="lazy" onerror="this.classList.add(\'nothumb\');this.removeAttribute(\'src\')">' +
          '</span>');
      }
      galleryThumbs.slice(0, 5).forEach(function (g) {
        chips.push('<span class="inst-thumb self" title="' + esc(g.label) + '">' +
          '<img src="' + esc(pathBase + g.thumb) + '" alt="" loading="lazy" onerror="this.classList.add(\'nothumb\');this.removeAttribute(\'src\')">' +
          '</span>');
      });
      if (chips.length) {
        stripHTML = chips.join('') +
          '<span class="more" title="inline examples on the chapter, not promoted to top-level explorations">built-in</span>';
        countLbl = chips.length + ' example' + (chips.length === 1 ? '' : 's');
      } else {
        stripHTML = '<span class="none">no instances on file</span>';
        countLbl = '0 inst.';
      }
    }

    return '<div class="tech-row">' +
      '<div class="tr-a"><a class="tech-link" href="#/technique/' + esc(t.id) + '"><b>' + esc(t.title) + '</b></a>' + stChip + '</div>' +
      '<div class="tr-b">' + esc(t.description || t.note || '') + '</div>' +
      '<div class="tr-c"><div class="inst-strip' + (inst.length ? '' : ' self') + '">' +
        stripHTML + '</div>' +
        '<span class="ct">' + countLbl + '</span></div>' +
      '</div>';
  }

  /* ck-e3 · technique entry page. Called from renderEntry when
     e.entity === 'technique'. THE FIVE TESTS block, instance table, atoms
     used across instances, admitting styles, governed_by, ruling if present. */
  function renderTechniquePage(t, exampleId, query) {
    S.unmountAdapter();
    view.kind = 'technique';
    S.current = t; localExample = null;
    paramState = {};

    /* A compact technique is still allowed to carry a working plate. Earlier
       versions routed every compact technique straight to this anatomy page
       and silently discarded `fragment` / `examples`, which made authored
       evidence (notably keyline-coverage-chain) look like an empty proposal. */
    var inst = instancesOfTechnique(t.id);
    var demoEntry = t;
    var borrowed = false;
    var examples = t.examples || [];
    var demo = examples.filter(function (x) { return x.id === exampleId; })[0] || examples[0] || null;
    if (!demo && t.fragment) {
      demo = { id: 'working-plate', title: 'Working plate', lane: 'fragment', fragment: t.fragment };
    }
    if (!demo) {
      var defaultLane = S.manifest.stage && S.manifest.stage.adapter;
      var runnable = inst.filter(function (e) {
        var lane = e.lane || defaultLane;
        return (e.examples || []).length || e.fragment || lane === 'fragment' || lane === 'audio';
      });
      var source = runnable.filter(function (e) { return e.status === 'canonical'; })[0] || runnable[0];
      if (source) {
        borrowed = true;
        demoEntry = source;
        examples = source.examples || [];
        demo = examples.filter(function (x) { return x.id === exampleId; })[0] || examples[0] || null;
        var sourceLane = source.lane || defaultLane;
        if (!demo && (source.fragment || sourceLane === 'fragment')) {
          demo = { id: 'worked-instance', title: source.title, lane: 'fragment', fragment: source.fragment || 'fragment.html' };
        } else if (!demo && sourceLane === 'audio') {
          demo = { id: 'worked-instance', title: source.title, lane: 'audio' };
        }
      }
    }
    S.currentExample = demo;
    S.markCurrent(); position();
    var crumb = el('crumb');
    if (crumb) crumb.textContent = 'Technique · ' + t.title;

    var L = layerOf(t) || 'no layer on file';

    /* atoms used across instances — the chip row Julia asked for */
    var atomHits = Object.create(null);
    inst.forEach(function (e) {
      (e.uses || []).forEach(function (u) {
        var id = typeof u === 'string' ? u : u && u.atom;
        if (id) atomHits[id] = (atomHits[id] || 0) + 1;
      });
    });
    var atomsChips = Object.keys(atomHits).map(function (aid) {
      var a = S.byId && S.byId[aid];
      return '<a class="pip" href="#/atom/' + esc(aid) + '">' +
        esc((a && a.title) || aid) + ' <span class="faint">' + atomHits[aid] + '</span></a>';
    });

    /* styles reached by the instances */
    var stHits = Object.create(null);
    inst.forEach(function (e) { if (e.style) stHits[e.style] = (stHits[e.style] || 0) + 1; });
    var stChips = Object.keys(stHits).map(function (sid) {
      var st = styleById(sid);
      return '<a class="pip" href="#/style/' + esc(sid) + '">' +
        esc((st && st.title) || sid) + ' <span class="faint">' + stHits[sid] + '</span></a>';
    });

    var stChip = '<span class="st" data-st="' + esc(t.status || 'canonical') + '">' +
      esc(String(t.status || 'canonical').replace('-', ' ')) + '</span>' +
      (t.stub ? '<span class="st" data-st="stub">stub</span>' : '');

    var aspect = (demoEntry.frame && demoEntry.frame.aspect) || (S.manifest.stage && S.manifest.stage.aspect) || '3/2';
    var demoLane = (demo && demo.lane) || demoEntry.lane || (S.manifest.stage && S.manifest.stage.adapter);
    var demoHTML = demo
      ? (borrowed ? '<p class="stage-note"><b>Worked instance · </b><a href="#/' + esc(demoEntry.id) + '">' + esc(demoEntry.title) + '</a></p>' : '') +
        '<div class="mat"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i>' +
          '<div class="stage" id="stage"' +
            (demoLane === 'fragment' ? ' data-fit="lens"' : demoLane === 'audio' ? ' data-fit="audio"' : '') +
          '></div></div>' +
        '<div class="draw" id="bar"></div>' +
        '<nav class="strip" id="strip" aria-label="Examples"></nav>'
      : '';

    /* Five tests: pull from t.tests if present, else derive from a
       CANONICAL instance's critique block. If neither, print an honest
       "proposed by tool — awaiting Julia" note. */
    var tests = t.tests;
    var proposedTests = false;
    if (!tests) {
      var canonInst = inst.filter(function (e) { return e.status === 'canonical' && e.critique; })[0];
      if (canonInst && canonInst.critique) {
        var c = canonInst.critique;
        tests = {
          shared_cause: c.reads_as,
          distinct_job: (c.operators || []).join(' · '),
          order: c.pass_order,
          removal_test: c.why_it_survives
        };
        proposedTests = true;
      }
    }
    var testsHTML = tests
      ? '<section class="atom-block"><div class="blk-head">' +
          '<span class="lab">' + (proposedTests ? 'Five tests · proposed from ' + esc(canonInst.title) + ', awaiting Julia' : 'The five tests') + '</span>' +
          '<span class="n">from composing-computational-material-systems</span>' +
        '</div>' +
        '<dl class="tests">' +
          ['shared_cause','distinct_job','order','removal_test','overuse'].map(function (k) {
            if (!tests[k]) return '';
            return '<dt>' + esc(k.replace(/_/g, ' ')) + '</dt><dd>' + esc(tests[k]) + '</dd>';
          }).join('') +
        '</dl></section>'
      : '<section class="atom-block"><div class="blk-head"><span class="lab">The five tests</span>' +
        '<span class="n">not on file · awaiting Julia</span></div>' +
        '<p class="empty">No tests declared on this technique yet. The tool proposes tests only when at ' +
        'least one canonical instance carries a critique block; this one has none.</p></section>';

    var instTable = inst.length
      ? '<section class="atom-block"><div class="blk-head"><span class="lab">Instances</span>' +
        '<span class="n">' + inst.length + '</span></div>' +
        '<div class="inst-table">' +
          '<div class="ir head"><span class="a">entry</span><span class="b">reads as</span>' +
            '<span class="c">lane · style · status</span></div>' +
          inst.map(instRow).join('') +
        '</div></section>'
      : '<section class="atom-block"><div class="blk-head"><span class="lab">Instances</span>' +
        '<span class="n">0</span></div>' +
        '<p class="empty">Nothing instances this technique yet.</p></section>';

    var atomsBlock = atomsChips.length
      ? '<section class="atom-block"><div class="blk-head"><span class="lab">Atoms across instances</span>' +
        '<span class="n">' + atomsChips.length + '</span></div>' +
        '<div class="chips">' + atomsChips.join('') + '</div></section>'
      : '';

    var stylesBlock = stChips.length
      ? '<section class="atom-block"><div class="blk-head"><span class="lab">Also appears in</span>' +
        '<span class="n">' + stChips.length + ' style' + (stChips.length === 1 ? '' : 's') + '</span></div>' +
        '<div class="chips">' + stChips.join('') + '</div></section>'
      : '';

    var govBlock = (t.governed_by || []).length
      ? '<section class="atom-block"><div class="blk-head"><span class="lab">Governed by</span></div>' +
        '<div class="chips">' + t.governed_by.map(function (sid) {
          var sk = skillById(sid);
          return '<a class="pip" href="#/skill/' + esc(sid) + '">' + esc((sk && sk.title) || sid) + '</a>';
        }).join('') + '</div></section>'
      : '';

    var producesBlock = (t.produces || []).length
      ? '<section class="atom-block"><div class="blk-head"><span class="lab">Produces</span>' +
        '<span class="n">the atom the lesson reifies into</span></div>' +
        '<div class="atoms-grid">' + t.produces.map(function (aid) {
          var a = S.byId && S.byId[aid];
          return a ? atomCellHTML(a) : '';
        }).join('') + '</div></section>'
      : '';

    el('view').innerHTML = '<article style="--stage-aspect:' + esc(aspect.replace('/', ' / ')) + '">' +
      '<p class="kicker">Technique · <span style="text-transform:uppercase">' + esc(L) + '</span></p>' +
      '<h1>' + esc(t.title) + '</h1>' +
      '<div class="meta">' + stChip + '<span class="tags">' + inst.length + ' inst. <b>·</b> layer: ' +
        esc(L) + (t.lane ? ' <b>·</b> lane: ' + esc(t.lane) : '') +
      '</span></div>' +
      '<p class="lede">' + esc(t.description || t.note || '') + '</p>' +
      demoHTML +
      testsHTML +
      producesBlock +
      instTable +
      crossoverBlockHTML('technique', t.id, { excludeEntryIds: inst.map(function (e) { return e.id; }) }) +
      atomsBlock +
      stylesBlock +
      govBlock +
      rulingHTML(t) +
      pagerHTML(t) +
      '</article>';

    if (demo) {
      renderStrip(demoEntry, demo);
      S.mountAdapter({
        stage: el('stage'), bar: el('bar'), entry: demoEntry, example: demo,
        query: query || {}, params: paramValues(demoEntry, demo)
      });
      fillPane(activeTab());
    }

    observeSwatches(el('view'));
    window.scrollTo(0, 0);
  }

  function instRow(e) {
    var thumb = e.thumb && (typeof e.thumb === 'string' ? e.thumb : e.thumb.file);
    var pathBase = e.path || ('content/' + e.id + '/');
    var img = thumb
      ? '<img src="' + esc(pathBase + thumb) + '" alt="" loading="lazy" onerror="this.classList.add(\'nothumb\');this.removeAttribute(\'src\')">'
      : '<span class="nothumb">no thumb</span>';
    var reads = (e.critique && e.critique.reads_as) || '';
    var st = styleById(e.style || '');
    return '<a class="ir" href="#/' + esc(e.id) + '">' +
      '<span class="th">' + img + '</span>' +
      '<span class="a"><b>' + esc(e.index || e.id) + '</b> ' + esc(e.title) + '</span>' +
      '<span class="b">' + esc(reads) + '</span>' +
      '<span class="c">' + esc(e.lane || '—') + ' · ' + esc((st && st.title) || e.style || '—') +
        ' · ' + esc(e.status) + '</span>' +
      '</a>';
  }

  /* ck-e4 · the styles index. Cards, not a list; each carries its palette
     swatch, type roles, texture-vocabulary chips, engines list, and member
     count. */
  function renderStylesIndex() {
    var sts = (S.manifest && S.manifest.styles) || [];
    var head =
      '<p class="kicker">Houses</p>' +
      '<h1>Styles</h1>' +
      '<p class="lede">Six named systems. A style is <b>bounded and prescriptive</b> — it names what you may ' +
      'use, so a violation is checkable rather than an opinion.</p>' +
      '<div class="meta"><span class="tags">' + sts.length + ' styles</span></div>';
    var body = sts.length
      ? '<div class="style-grid">' + sts.map(styleCard).join('') + '</div>'
      : '<p class="empty">No styles declared.</p>';
    el('view').innerHTML = head + body;
    observeSwatches(el('view'));
  }

  function styleCard(st) {
    var mem = S.entries.filter(function (e) { return e.style === st.id; });
    var voc = (st.texture || []).slice(0, 8);
    var types = st.type ? Object.keys(st.type).map(function (k) {
      return '<span><i>' + esc(k) + '</i>' + esc(st.type[k]) + '</span>';
    }).join('') : '';
    return '<a class="style-card" href="#/style/' + esc(st.id) + '">' +
      '<div class="sc-hd"><b>' + esc(st.title) + '</b>' +
        '<span class="ct">' + mem.length + ' entr' + (mem.length === 1 ? 'y' : 'ies') + '</span></div>' +
      (st.summary ? '<p class="sc-sum">' + esc(st.summary) + '</p>' : '') +
      '<div class="sc-pal">' + (st.palette || []).map(function (c) {
        return '<i style="background:' + esc(c) + '" title="' + esc(c) + '"></i>';
      }).join('') + '</div>' +
      (types ? '<div class="sc-type">' + types + '</div>' : '') +
      (voc.length ? '<div class="sc-vocab">' + voc.map(function (v) {
        return '<span class="pip">' + esc(v) + '</span>';
      }).join('') + (st.texture && st.texture.length > 8
        ? '<span class="pip more">+' + (st.texture.length - 8) + '</span>'
        : '') + '</div>' : '<p class="sc-none">no texture — declared, not missing</p>') +
      '<div class="sc-eng">' + ((st.engines || []).length
        ? (st.engines.length + ' engine' + (st.engines.length === 1 ? '' : 's'))
        : 'no engine — no lens allocates a canvas') + '</div>' +
    '</a>';
  }

  /* ============================================================================
     ck-e6 · SYMPTOMS PAGE — the anti-pattern index.

     Six anti-patterns from composing-computational-material-systems/SKILL.md
     plus two symptom entry-points from julia-proxy JOBS §6 ("blur + bloom
     + grain", "busy"). Reach a technique's `.overuse` clause and its
     known_failure entries from a symptom name without knowing the technique.
     Each row: name · one-sentence read · techniques that overuse into it ·
     the known_failure entries that instance it · "what to do instead".
     ============================================================================ */
  var SYMPTOMS = [
    { id: 'vibe-stack',
      name: 'The vibe stack',
      read: 'Blur + bloom + grain + chromatic aberration + particles at unrelated strengths. Redundant jobs, no shared cause.',
      atoms: ['fbm-noise', 'granulation', 'edge-bloom'],
      overused_by: [],
      instead: 'Find the one field that should drive them, or cut to the two that do distinct work.' },
    { id: 'css-filter-as-material',
      name: 'CSS filter as material',
      read: '`backdrop-filter: blur()` fakes frosted glass but has no thickness, no refraction, no absorption — a screen filter, not a body.',
      atoms: [],
      overused_by: [],
      instead: 'Fine for chrome; wrong for a hero material. Build the body when the material IS the body.' },
    { id: 'noise-as-texture',
      name: 'Noise as texture',
      read: 'Noise is a source of continuously varying structure to drive something, not a grain layer sprinkled on top for busyness.',
      atoms: ['fbm-noise', 'paper-tooth', 'granulation'],
      overused_by: [],
      instead: 'Use the noise to displace, threshold or modulate something else. If it is a texture, it is the CONSEQUENCE of a substrate — file it beside its cause.' },
    { id: 'effect-first-framing',
      name: 'Effect-first framing',
      read: '"Add a nice gradient background" with no read. The visual decision precedes the question of what the surface is for.',
      atoms: [],
      overused_by: [],
      instead: 'Ask what the surface is for first. A read decides which operators earn their place.' },
    { id: 'animate-the-peak-only',
      name: 'Animate the peak only',
      read: 'The onset is designed; the hold, the decay, and the rest are not. Motion that never stops or that stops without an authored end.',
      atoms: [],
      overused_by: [],
      instead: 'Stillness is part of the composition. The hold and the fade are as authored as the peak.' },
    { id: 'symmetry-as-interest',
      name: 'Symmetry / kaleidoscope as instant interest',
      read: 'Powerful remaps — symmetry, kaleidoscope, polar — that read as a filter rather than as folding structure that was already there.',
      atoms: [],
      overused_by: [],
      instead: 'Fold a pattern that ALREADY has structure. If nothing structured is being folded, the symmetry is the whole idea, and one-idea pieces get old fast.' },
    /* two entry-points named in julia-proxy JOBS §6 — the ones a reader
       arrives with in their mouth, not in the technique's name */
    { id: 'blur-bloom-grain',
      name: 'blur + bloom + grain',
      read: 'The three moves you reach for when the render is "not doing enough". Together they read as pinned atmosphere, uncoupled to anything the piece is about.',
      atoms: ['fbm-noise', 'granulation', 'edge-bloom'],
      overused_by: [],
      instead: 'Pick the ONE that carries the read. Ask what the other two are FOR; delete anything that answers "atmosphere".' },
    { id: 'busy',
      name: 'busy',
      read: 'Motion, colour, texture and mark all doing something, none carrying the read. Every operator on and each at half its authored strength.',
      atoms: [],
      overused_by: [],
      instead: 'Turn everything off. Turn back on the ONE thing that reads the piece; the others earn a place only when their removal changes what the piece means.' }
  ];

  function symptomRow(s) {
    /* techniques that carry an `overuse` note mentioning the symptom's
       atoms — a soft link, since the SKILL.md anti-patterns are named
       in prose. */
    var techs = S.entries.filter(function (e) {
      if (e.entity !== 'technique') return false;
      var t = ((e.tests && e.tests.overuse) || '').toLowerCase();
      return s.atoms.some(function (a) { return t.indexOf(a.split('-')[0]) >= 0; });
    });
    var kfs = S.entries.filter(function (e) { return e.status === 'known-failure'; });
    return '<article class="symptom-row" id="s-' + esc(s.id) + '">' +
      '<div class="sr-a">' +
        '<b>' + esc(s.name) + '</b>' +
        '<p>' + esc(s.read) + '</p>' +
      '</div>' +
      '<div class="sr-b">' +
        (s.atoms.length ? '<span class="lab">atoms in the family</span>' +
          '<div class="chips">' + s.atoms.map(function (aid) {
            var a = S.byId && S.byId[aid];
            return '<a class="pip" href="#/atom/' + esc(aid) + '">' + esc((a && a.title) || aid) + '</a>';
          }).join('') + '</div>' : '') +
        (techs.length ? '<span class="lab">techniques whose .overuse names this</span>' +
          '<div class="chips">' + techs.map(function (t) {
            return '<a class="pip" href="#/technique/' + esc(t.id) + '">' + esc(t.title) + '</a>';
          }).join('') + '</div>' : '') +
        (kfs.length ? '<span class="lab">known failures on file</span>' +
          '<div class="chips">' + kfs.map(function (e) {
            return '<a class="pip" href="#/' + esc(e.id) + '">' + esc(e.title) + '</a>';
          }).join('') + '</div>' : '') +
        '<p class="doinstead"><b>Instead:</b> ' + esc(s.instead) + '</p>' +
      '</div>' +
    '</article>';
  }

  function renderSymptoms() {
    var head =
      '<p class="kicker">Anti-patterns</p>' +
      '<h1>Symptoms</h1>' +
      '<p class="lede">Reach a technique\'s <code>.overuse</code> clause and its ' +
      '<b>known_failure</b> entries from a symptom name — without knowing the ' +
      'technique. The eight rows below are the vocabulary a reader arrives with in ' +
      'their mouth ("busy", "blur + bloom + grain") plus the six anti-patterns ' +
      'named in <code>composing-computational-material-systems/SKILL.md</code>.</p>' +
      '<p class="lede sm">A symptom is not a shame list. It is a route from the ' +
      'complaint to the removal test on a real piece.</p>' +
      '<div class="meta"><span class="tags">' + SYMPTOMS.length + ' symptoms <b>·</b> ' +
        S.entries.filter(function (e) { return e.status === 'known-failure'; }).length +
        ' known failures on file</span></div>';
    el('view').innerHTML = head + SYMPTOMS.map(symptomRow).join('');
  }

  /* ============================================================================
     ck-e6 · UNFILED PAGE — imports awaiting a ruling.

     Reads from `manifest.entries` filtered by `status: 'unsorted'`. Home
     page's UNFILED count already lands at the top of #/techniques from
     ck-e3. The big "batch classify" affordance simply deep-links each row
     to its own entry page — that is where the ruling is made.
     ============================================================================ */
  function unfiledCard(e) {
    var thumb = e.thumb && (typeof e.thumb === 'string' ? e.thumb : e.thumb.file);
    var pathBase = e.path || ('content/' + e.id + '/');
    var thumbHTML = thumb
      ? '<img src="' + esc(pathBase + thumb) + '" alt="" loading="lazy" onerror="this.classList.add(\'nothumb\');this.removeAttribute(\'src\')">'
      : '<span class="nothumb">no thumbnail<br>on file</span>';
    var pg = e.proposed_grade
      ? '<span class="prop-grade"><b>' + esc(e.proposed_grade) + '</b> · proposed by researcher — awaiting julia</span>'
      : '';
    var src = e.source && (e.source.title || e.source.note) || '';
    return '<a class="card" href="#/' + esc(e.id) + '" data-proposed>' +
      '<span class="prev" data-id="' + esc(e.id) + '">' +
        '<span class="queued">' + esc(e.index || e.id) + '</span>' +
        thumbHTML +
      '</span>' +
      '<span class="cap">' +
        '<span class="n">' + esc(e.index || e.id) + '</span>' +
        '<span class="t">' + esc(e.title) + '</span>' +
        '<span class="r">' + esc(src) + pg + '</span>' +
      '</span></a>';
  }

  function renderUnfiled() {
    var list = S.entries.filter(function (e) { return e.status === 'unsorted'; });
    var propTech = S.entries.filter(function (e) { return e.status === 'proposed'; });

    var head =
      '<p class="kicker">Waiting on a ruling</p>' +
      '<h1>Unfiled</h1>' +
      '<p class="lede">Imported from the corpus inventory. Each row carries a real ' +
      'id, title and source file:line. Where a researcher proposed a grade it ' +
      'imports as <b>PROPOSED — awaiting julia</b>, never as a ruling ' +
      '(DECISION-FRAMING D5).</p>' +
      '<div class="meta"><span class="tags">' + list.length + ' unsorted' +
        (propTech.length ? ' <b>·</b> ' + propTech.length + ' proposed by the tool' : '') +
      '</span></div>' +
      '<div class="unfiled-batch"><b>Batch classify.</b> Every card below is a ' +
      'deep link to its own entry page. Open a row, read the source, rule the ' +
      'status. The count at the top of <a href="#/techniques">#/techniques</a> ' +
      'is what you drive down.</div>';

    var body = list.length
      ? '<div class="sheet"><div class="grid">' + list.map(unfiledCard).join('') + '</div></div>'
      : '<p class="empty">Nothing unsorted. The ck-e7 import lands 74 rows here.</p>';

    /* tool-proposed technique candidates (ck-e6 detector's output) sit
       under their own heading */
    if (propTech.length) {
      body += '<hr class="r"><h2 style="margin-top:32px">Proposed by the tool</h2>' +
        '<p class="lede sm">The candidate-technique detector (scripts/index-tools.mjs) ' +
        'writes these. Each names ≥2 explorations that use the same atom with no ' +
        'technique above it. Rule by editing the stub in the manifest.</p>' +
        '<div class="sheet"><div class="grid">' + propTech.map(unfiledCard).join('') + '</div></div>';
    }

    el('view').innerHTML = head + body;
    S.observePreviews(el('view'));
  }

  /* ============================================================================
     ck-e8 · SKILLS INDEX + PER-SKILL PAGE

     `#/skills` — 18 cards on two shelves:
       - Competency RUNGS (rung ≥ 2): the two REAL rungs
         (composing-computational-material-systems + the proposed sound rung)
         at the top; four LATER RUNGS below, declared with `stub: true`, shown
         empty and named ("body-of-work variation", "type-as-material",
         "art-direct-to-supplied-canon", "production-and-handoff") per
         creative-competencies-suite.md §"Later rungs".
       - Format / craft skills (rung 1) — the twelve producers of the
         pieces the archive actually files. Every card carries N entries
         governed by S.governedBy(entry) (declared + rule-derived).

     `#/skill/<id>` — the single-skill page. Real rungs show contract summary
     (from /home/claude/corpus/skills/<id>/SKILL.md where present) plus the
     five tests; stub rungs render as STUB with a link to add via cowork.
     ============================================================================ */
  function skillCard(s) {
    var entries = S.entriesGovernedBy(s.id);
    var n = entries.length;
    var isStub = !!s.stub;
    var lab = isStub
      ? '<span class="s stub-lab">LATER RUNG · not yet built</span>'
      : (s.role ? '<span class="s">' + esc(s.role) + (s.rung ? ' · rung ' + s.rung : '') + '</span>' : '');
    var count = isStub
      ? '<span class="skill-count empty">0 entries · empty on purpose</span>'
      : '<span class="skill-count' + (n ? '' : ' empty') + '">' + n + ' entr' + (n === 1 ? 'y' : 'ies') + ' governed' + (n ? '' : ' · empty for now') + '</span>';
    var desc = s.note ? '<span class="skill-desc">' + esc(s.note) + '</span>' : '';
    return '<a class="skill-card' + (isStub ? ' stub' : '') + '" href="#/skill/' + esc(s.id) + '">' +
      '<span class="skill-hd"><b>' + esc(s.title) + '</b>' + lab + '</span>' +
      desc + count + '</a>';
  }

  function renderSkillsIndex() {
    var skills = (S.manifest.skills || []).slice();
    var rungs = skills.filter(function (s) { return (s.rung || 0) >= 2; });
    // rungs first by ascending rung, non-stub before stub inside a rung
    rungs.sort(function (a, b) {
      if ((a.rung || 0) !== (b.rung || 0)) return (a.rung || 0) - (b.rung || 0);
      return (a.stub ? 1 : 0) - (b.stub ? 1 : 0);
    });
    var craft = skills.filter(function (s) { return (s.rung || 0) < 2; });

    var head =
      '<p class="kicker">Skills tagged on the archive</p>' +
      '<h1>Skills</h1>' +
      '<p class="lede">The competency rungs at the top, the format / craft ' +
      'skills below. Every card is a live count of the entries filed against ' +
      'that skill via <code>governed_by[]</code> — declared on the entry, or ' +
      'inferred from the entry\'s shape (style, lane, kind, tags) by ' +
      '<code>Shell.governedBy()</code>. Only rungs get their own page.</p>' +
      '<div class="meta"><span class="tags">' + skills.length + ' skills <b>·</b> ' +
        rungs.filter(function (s) { return !s.stub; }).length + ' rungs built <b>·</b> ' +
        rungs.filter(function (s) { return s.stub; }).length + ' rungs empty (named) <b>·</b> ' +
        craft.length + ' format/craft' +
      '</span></div>';

    var body =
      '<section class="skill-shelf"><div class="shelf-head">' +
        '<span class="lab">Competency rungs</span>' +
        '<span class="n">' + rungs.length + '</span>' +
        '<span class="nt">A rung critiques or governs a whole class of work. ' +
        'Two shipping today; four LATER RUNGS declared empty per ' +
        'creative-competencies-suite.md §"Later rungs".</span>' +
      '</div>' +
        '<div class="skill-grid">' + rungs.map(skillCard).join('') + '</div>' +
      '</section>' +
      '<section class="skill-shelf"><div class="shelf-head">' +
        '<span class="lab">Format / craft</span>' +
        '<span class="n">' + craft.length + '</span>' +
        '<span class="nt">Rung-1 skills — the producers and governors of ' +
        'individual pieces. Each card is a live entry count.</span>' +
      '</div>' +
        '<div class="skill-grid">' + craft.map(skillCard).join('') + '</div>' +
      '</section>';

    return head + body;
  }

  /* The five tests, per rung — the shape composing-computational-material-systems
     names as its own contract. The sound rung translates them to audio. */
  var RUNG_TESTS = {
    'composing-computational-material-systems': {
      one: 'One primary read — the material condition or compositional proposition, stated in one sentence. If you cannot, the piece has no idea yet.',
      tests: [
        ['shared cause',      'One field or event drives the visible consequences. If each operator has an independent, hand-tuned parameter, it is a pile.'],
        ['distinct jobs',     'Each operator has its own job. Two doing the same job means one is decoration.'],
        ['order dependence',  'The pass order is load-bearing — reordering changes the result.'],
        ['single read',       'The viewer perceives one material condition, not a tour of techniques.'],
        ['removal test',      'Take any layer out and the read collapses. If it does not, that layer was decoration.']
      ],
      antipatterns: ['the vibe stack', 'CSS filter as material', 'noise as texture',
        'effect-first framing', 'animate-the-peak-only', 'symmetry-as-interest']
    },
    'composing-computational-sound-systems': {
      one: 'One primary listen — the aural condition (room, character, event) stated in one sentence, not a list of nodes.',
      tests: [
        ['shared cause',      'A single scalar or gate drives voice(s), space and bus together — not three tracks with three envelopes.'],
        ['distinct voices',   'Each voice has its own job. Two voices reaching for the same band on the same beat is one voice too many.'],
        ['signal path order', 'Compressor before or after limiter is not the same device. Reverb before or after distortion changes the room.'],
        ['single listen',     'The listener hears one place / one event, not a graph of nodes.'],
        ['the MUTE TEST',     'Mute the driver; the whole system should go quiet in the same beat. If the room keeps talking, the coupling was decoration.']
      ],
      antipatterns: ['reverb as EQ', 'compressor as glue with nothing to glue',
        'sidechain-for-effect', 'wet without dry', 'silent by default']
    }
  };

  function renderSkill(s, query) {
    S.unmountAdapter();
    S.unobservePreviews();
    view.kind = 'skill'; view.styleId = null; view.route = null;
    S.current = null; S.currentExample = null; localExample = null;
    S.markCurrent(); position();

    var crumb = el('crumb');
    if (crumb) crumb.textContent = 'Skill · ' + s.title;

    var entries = S.entriesGovernedBy(s.id);
    var isStub = !!s.stub;
    var isRung = (s.rung || 0) >= 2;
    var contract = RUNG_TESTS[s.id];

    // group instances by entity for a legible table
    var byEnt = { technique: [], atom: [], exploration: [], coupling: [] };
    entries.forEach(function (e) {
      var k = e.entity || 'exploration';
      if (byEnt[k]) byEnt[k].push(e); else byEnt.exploration.push(e);
    });

    var head =
      '<p class="kicker">Skill · ' + esc(s.role || 'skill') + (s.rung ? ' · rung ' + s.rung : '') + '</p>' +
      '<h1>' + esc(s.title) + '</h1>' +
      (s.note ? '<p class="lede">' + esc(s.note) + '</p>' : '') +
      '<div class="meta">' +
        (isStub ? '<span class="st" data-st="stub">STUB — not yet built</span>' : '') +
        '<span class="tags">' + entries.length + ' entr' + (entries.length === 1 ? 'y' : 'ies') + ' governed</span>' +
      '</div>';

    var body = '';

    if (isStub) {
      body += '<section class="skill-block stub-block">' +
        '<div class="blk-head"><span class="lab">STUB — not yet built</span></div>' +
        '<p class="empty">This rung is declared here so the shape of the ladder ' +
        'is visible even where a rung is not yet built. From ' +
        '<code>creative-competencies-suite.md §"Later rungs"</code>: ' +
        '<i>body-of-work / series variation; type-as-material + editorial ' +
        'motion; art-direct-to-a-supplied-canon; production/handoff. Each calls ' +
        'down into rung 1 for per-piece coherence.</i></p>' +
        '<p class="empty">To draft this rung, open a cowork session against ' +
        '<code>corpus/skills/</code> and file a new <code>SKILL.md</code>. ' +
        'Then declare <code>governed_by: [\'' + esc(s.id) + '\']</code> on the ' +
        'entries this rung critiques and the count on this page fills in.</p>' +
        '</section>';
    } else if (contract) {
      body += '<section class="skill-block">' +
        '<div class="blk-head"><span class="lab">The skill\'s own contract</span>' +
        '<span class="n">from corpus/skills/' + esc(s.id) + '/SKILL.md</span></div>' +
        '<p class="skill-one"><b>One ' + (s.id.indexOf('sound') >= 0 ? 'listen' : 'read') + '.</b> ' + esc(contract.one) + '</p>' +
        '<div class="blk-head"><span class="lab">Five tests</span></div>' +
        '<ol class="skill-tests">' +
          contract.tests.map(function (t) {
            return '<li><b>' + esc(t[0]) + '.</b> ' + esc(t[1]) + '</li>';
          }).join('') +
        '</ol>' +
        (contract.antipatterns ? '<div class="blk-head"><span class="lab">Anti-patterns it refuses</span></div>' +
          '<div class="chips">' + contract.antipatterns.map(function (a) {
            return '<span class="pip">' + esc(a) + '</span>';
          }).join('') + '</div>' : '') +
        '</section>';
    } else if (isRung) {
      body += '<section class="skill-block stub-block">' +
        '<div class="blk-head"><span class="lab">Contract summary</span></div>' +
        '<p class="empty">No SKILL.md contract on file for this rung yet — ' +
        'add one at <code>corpus/skills/' + esc(s.id) + '/SKILL.md</code>.</p>' +
        '</section>';
    }

    // instances table
    var ORDER = ['technique', 'atom', 'exploration', 'coupling'];
    var hasAny = ORDER.some(function (k) { return byEnt[k].length; });
    body += '<section class="skill-block">' +
      '<div class="blk-head"><span class="lab">Instances governed</span>' +
      '<span class="n">' + entries.length + ' filed against this skill</span></div>';
    if (hasAny) {
      body += '<div class="skill-instances">';
      ORDER.forEach(function (k) {
        var list = byEnt[k];
        if (!list.length) return;
        body += '<div class="skill-instance-group">' +
          '<div class="ig-hd"><span class="lab">' + esc(k) + 's</span>' +
            '<span class="n">' + list.length + '</span></div>' +
          '<ul class="ig-list">' +
            list.map(function (e) {
              var prefix = (k === 'technique') ? '#/technique/' :
                           (k === 'atom')      ? '#/atom/' :
                           (k === 'coupling')  ? '#/coupling/' : '#/';
              return '<li><a href="' + prefix + esc(e.id) + '">' +
                '<span class="ix">' + esc(e.index || e.id) + '</span>' +
                '<b>' + esc(e.title || e.id) + '</b>' +
                (e.status && e.status !== 'canonical'
                  ? '<span class="st" data-st="' + esc(e.status) + '">' + esc(String(e.status).replace('-', ' ')) + '</span>'
                  : '') +
              '</a></li>';
            }).join('') +
          '</ul></div>';
      });
      body += '</div>';
    } else {
      body += '<p class="empty">Nothing yet. This page is empty on purpose. Tag ' +
        'an entry with <code>governed_by: [\'' + esc(s.id) + '\']</code> and it ' +
        'lands here.</p>';
    }
    body += '</section>';

    el('view').innerHTML = head + body;
    window.scrollTo(0, 0);
  }

  /* ck-e0 · the encyclopedia's new routes, now with bespoke renderers. */
  function renderRoute(name, route, query) {
    S.unmountAdapter();
    S.unobservePreviews();
    if (swatchIO) { swatchIO.disconnect(); swatchIO = null; }
    view.kind = 'route'; view.styleId = null; view.route = name;
    S.current = null; S.currentExample = null; localExample = null;
    S.markCurrent(); position();

    var TITLES = {
      techniques:   'Techniques',
      atoms:        'Atoms',
      styles:       'Styles',
      explorations: 'Explorations',
      sound:        'Sound',
      symptoms:     'Symptoms',
      unfiled:      'Unfiled',
      skills:       'Skills',
      couplings:    'Couplings'
    };
    var TAGLINES = {
      explorations: 'Dated artefacts with provenance, status, faults and a technique stack.',
      sound:        'A lane of the same practice. Six pieces doing compound causality before anyone asked.',
      symptoms:     'Entries that overuse an atom. A visible gap, not a shame list.',
      unfiled:      'Imported from the inventory without a ruling. Counted.',
      skills:       'The fourteen skills that produce, critique or govern this work. Only competency rungs get pages.',
      couplings:    'One driver, several consequences, one listen.'
    };

    var crumb = el('crumb');
    if (crumb) crumb.textContent = TITLES[name] || name;

    /* Bespoke renderers for ck-e2/e3/e4/e6. Others fall through to the
       minimal filtered-sheet or route-list from ck-e0. */
    if (name === 'atoms')      return renderAtomsShelves(query);
    if (name === 'techniques') return renderTechniquesIndex();
    if (name === 'styles')     return renderStylesIndex();
    if (name === 'symptoms')   return renderSymptoms();
    if (name === 'unfiled')    return renderUnfiled();

    /* fallthrough — skills route-list, sheet-per-facet, empty-on-purpose */
    var body;
    if (route.kind === 'skills') {
      body = renderSkillsIndex();
    } else {
      var list = S.entries.filter(route.filter || function () { return true; });
      var counts = list.length + ' of ' + S.entries.length;
      body = list.length
        ? '<p class="meta"><span class="tags">' + counts + '</span></p>' +
          '<div class="sheet"><div class="grid">' + list.map(cardHTML).join('') + '</div></div>'
        : '<p class="empty">Nothing filed here yet. This page is empty on purpose — see BUILD-NOTES-ENCYC.md; later checkpoints file the entities.</p>';
    }

    el('view').innerHTML =
      '<p class="kicker">' + esc(S.manifest.title) + '</p>' +
      '<h1>' + esc(TITLES[name] || name) + '</h1>' +
      (TAGLINES[name] ? '<p class="lede">' + esc(TAGLINES[name]) + '</p>' : '') +
      body;

    S.observePreviews(el('view'));
  }

  function renderLoading(e) {
    el('view').innerHTML = '<p class="empty">Loading ' + esc(e.id) + '…</p>';
  }
  function renderMissing(id) {
    view.kind = 'missing';
    el('view').innerHTML = '<p class="empty">No entry <code>' + esc(id) +
      '</code> in this manifest. <a href="#/index">Back to the index</a>.</p>';
  }

  /* A list view is a function of the filter, so it re-renders when the filter
     changes — which is also what fills the sheet in as entry scripts land.
     The atom and technique pages also derive their content (used-by, instance
     list, atoms-across-instances) from every entry's `uses[]` / `instance_of[]`,
     so they refresh here too — until the whole roster is loaded, an atom
     page can read as "used ×0" for something that ships with nine uses. */
  function onFilter() {
    if (view.kind === 'sheet' && el('view')) renderSheet(view.styleId);
    if (view.kind === 'route' && el('view')) {
      var r = S.ENCYCLOPEDIA_ROUTES && S.ENCYCLOPEDIA_ROUTES[view.route];
      if (r) renderRoute(view.route, r, {});
    }
    if (view.kind === 'atom' && S.current && el('view'))      renderAtomPage(S.current);
    if (view.kind === 'technique' && S.current && el('view')) renderTechniquePage(S.current);
    if (S.current) position();
  }

  S.views = {
    buildChrome: buildChrome,
    renderEntry: renderEntry,
    renderSheet: renderSheet,
    renderStyle: renderStyle,
    renderRoute: renderRoute,
    renderSkill: renderSkill,
    renderLoading: renderLoading,
    renderMissing: renderMissing,
    selectTab: selectTab,
    fillPane: function () { fillPane(activeTab()); },
    onFilter: onFilter
  };
})();
