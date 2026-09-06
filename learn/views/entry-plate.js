/* ============================================================================
   learn/views/entry-plate.js — the plate view (ck-e10).
   Ported from encyclopedia/content/birefringent-ray-bench/plate-proof.html;
   ruled on by Julia in the E10 review (see claude/15-encyclopedia-refactor-plan.md
   §2 "Rulings on record").

   Registers Shell.views.renderPlate. shell/views wires this into the entry
   router: an entry that carries `spec` and `plate` renders as a plate; every
   other entry keeps the legacy renderer through E10 and gets the flip at E11.

   Adapted for the shell's chrome:
     - Fonts are the shell's Source Serif 4 + Commit Mono (not Geist).
     - No hue in the chrome. Locked chip / selected point = ink inversion.
       Coverage-fail = the FAULTS hatch + the word FAILED. Julia's ruling.
     - SVG highlight is a weight + opacity change, not a red flash — the
       cited elements stay ink and the rest fades to 28 %.
   ============================================================================ */
(function () {
  'use strict';

  var S = window.Shell;
  var esc = S.esc;

  /* ---------- helpers ------------------------------------------------------ */
  function el(id) { return document.getElementById(id); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /* Render one plate. Called by learn/views.js renderEntry when the entry
     ships a spec block. */
  function renderPlate(e /*, exampleId, query */) {
    S.unobservePreviews && S.unobservePreviews();
    S.current = e;
    S.currentExample = null;

    /* Coverage — same rule the manifest verifier enforces. Painted as a chip
       in the plate nav; ink for OK, hatch for FAIL. */
    var techniques = (e.spec && e.spec.techniques) || [];
    var points     = e.points || [];
    var cov        = computeCoverage(techniques, points);

    /* Pager — the shell knows the current entry's index in S.entries; the
       plate's own prev/next reads that list directly. */
    var idx = S.entries.indexOf(e);
    var prev = idx > 0 ? S.entries[idx - 1] : null;
    var next = idx >= 0 && idx < S.entries.length - 1 ? S.entries[idx + 1] : null;

    /* Method line — auto-composed from technique names unless the entry
       hand-authors one. Not displayed on the plate directly (the chips
       carry it) but recorded on the spec object for the panel. */
    var method = e.method || techniques.map(function (t) { return t.name; }).join(' · ');
    if (e.spec) e.spec.method = method;

    /* Prose — E10 reads `body[]` when present, else falls back to `text` in a
       single paragraph so un-migrated entries still render. E14 retrofit
       promises every entry has body[]. */
    var bodyHTML;
    if (Array.isArray(e.body) && e.body.length) {
      bodyHTML = e.body.map(function (p) {
        return /^\s*</.test(p) ? p : '<p>' + esc(p) + '</p>';
      }).join('');
    } else if (e.text) {
      var t = String(e.text).trim();
      bodyHTML = t.charAt(0) === '<' ? t : '<p>' + esc(t) + '</p>';
    } else {
      bodyHTML = '';
    }

    /* Source line — from the existing entry.source block. */
    var srcLine = '';
    if (e.source) {
      var s = e.source;
      var parts = [];
      if (s.kind) parts.push(String(s.kind).replace('-', ' '));
      if (s.title) parts.push(s.title);
      if (s.author) parts.push(s.author);
      if (s.date) parts.push(s.date);
      srcLine = esc(parts.join(' · ') || 'no source on file');
      if (s.note) srcLine += '<br><span style="color:var(--ink-4);font-size:10.5px">' + esc(s.note) + '</span>';
    }

    /* Technique chips */
    var chipsHTML = techniques.map(function (t) {
      return '<button type="button" data-tid="' + esc(t.id) + '" aria-pressed="false" ' +
             'title="' + esc(t.name) + '">' + esc(t.id) + '</button>';
    }).join('');

    /* Crossover */
    var cross = e.crossover || {};
    var alsoUses = (cross.also_uses || []).filter(function (x) { return x.in && x.in.length; });
    var sharesAtom = (cross.shares_atom || []).filter(function (x) { return x.count > 0; });
    var alsoUsesHTML = alsoUses.map(function (x) {
      return '<em>' + esc(x.id) + '</em> <span>(' + x.in.length + ')</span>';
    }).join(' · ');
    var sharesAtomHTML = sharesAtom.map(function (x) {
      return '<em>' + esc(x.atom) + '</em> <span>(' + x.count + ')</span>';
    }).join(' · ');
    var crossoverHTML = (!alsoUsesHTML && !sharesAtomHTML) ? '' :
      '<div class="plate-crossover"><b>Crossover</b>' +
        (alsoUsesHTML   ? '<div class="row">Also uses ' + alsoUsesHTML + '</div>' : '') +
        (sharesAtomHTML ? '<div class="row">Shares atom ' + sharesAtomHTML + '</div>' : '') +
      '</div>';

    /* Related — reads related[] first, then augments from crossover.also_uses.
       At E13 the derived indices in content/_index/ will feed this too. */
    var relatedHTML = buildRelatedHTML(e);

    /* Coverage badge HTML */
    var covHTML = renderCoverage(cov, techniques.length);

    /* Breadcrumb — Explorations / <section> / <code · title> */
    var sectionTitle = S.sectionOf(e.section).title;
    var indexLabel   = e.index || S.pad(e.order);
    var crumbHTML =
      '<a href="#/explorations">Explorations</a>' +
      '<span class="sep">/</span>' +
      '<a href="#/section/' + esc(e.section) + '">' + esc(sectionTitle) + '</a>' +
      '<span class="sep">/</span>' +
      '<b>' + esc(indexLabel) + ' · ' + esc(e.title) + '</b>';

    /* Pager HTML */
    var pagerHTML =
      (prev ? '<a href="#/entry/' + esc(prev.id) + '" title="' + esc(prev.title) + '">← ' + esc(prev.index || S.pad(prev.order)) + '</a>'
            : '<span>← —</span>') +
      '<a href="#/index" title="Contact sheet">Index</a>' +
      (next ? '<a href="#/entry/' + esc(next.id) + '" title="' + esc(next.title) + '">' + esc(next.index || S.pad(next.order)) + ' →</a>'
            : '<span>— →</span>');

    /* Picture — two paths:
         plate.svg    → inline SVG (E10 pattern; birefringent-ray-bench)
         plate.render → canvas2d, sized to plate.designWidth × designHeight,
                        overlaid with an SVG at the same viewBox for points.
       The point interaction code below reads the plate-svg viewBox and
       positions markers into it; that stays SVG regardless of the picture. */
    var svgBody = (e.plate && e.plate.svg) || '';
    var hasCanvas = e.plate && typeof e.plate.render === 'function';
    var viewBox;
    if (hasCanvas) {
      var dw = (e.plate.designWidth) || 1000;
      var dh = (e.plate.designHeight) || 1000;
      viewBox = '0 0 ' + dw + ' ' + dh;
    } else {
      viewBox = (e.plate && e.plate.viewBox) || '0 0 1000 1000';
    }
    var pictureHTML =
      (hasCanvas ? '<canvas id="plate-canvas" aria-label="' + esc(e.title) + '"></canvas>' : '') +
      '<svg id="plate-svg" viewBox="' + esc(viewBox) + '" role="img" ' +
      'aria-label="' + esc(e.title) + '">' + svgBody +
      '<g id="plate-points"></g><g id="plate-readhead"></g></svg>';

    /* Compare block — fidelity readout inside the notes column when
       entry.compare.readout is present. The public build strips
       compare.reference for entries whose reference is third-party. */
    var compareHTML = '';
    if (e.compare && e.compare.readout) {
      var axes = ['palette', 'tone', 'edge', 'grain', 'chroma'];
      var rows = axes.filter(function (a) { return e.compare.readout[a]; });
      var refNote = e.compare.reference
        ? '<div class="plate-compare-ref">reference · ' + esc(String(e.compare.reference).split('/').pop()) + '</div>'
        : '<div class="plate-compare-ref">reference · not shipped (public build)</div>';
      compareHTML =
        '<div class="plate-compare">' +
          '<h2>Fidelity</h2>' +
          '<div class="plate-compare-rows">' +
            rows.map(function (a) {
              return '<div class="row"><span class="ax">' + esc(a) + '</span><span class="ok">on file</span></div>';
            }).join('') +
          '</div>' +
          refNote +
        '</div>';
    }

    /* Log rows */
    var rowsHTML = points.map(function (p, i) {
      return '<div class="r blank" data-idx="' + i + '" tabindex="0" role="option" aria-selected="false">' +
        '<span>' + pad2(i + 1) + '</span>' +
        '<span>' + (typeof p.u === 'number' ? p.u.toFixed(3) : '') + '</span>' +
        '<span>' + (typeof p.v === 'number' ? p.v.toFixed(3) : '') + '</span>' +
        '<span>' + esc(p.d || '') + '</span>' +
        '<span title="' + esc(p.label || '') + '">' + esc(p.label || '') + '</span>' +
      '</div>';
    }).join('');

    /* Assemble */
    var view = el('view');
    view.innerHTML =
      '<div class="plate-view">' +
        '<div class="plate-nav">' +
          '<span class="crumb">' + crumbHTML + '</span>' +
          covHTML +
          '<span class="plate-pager">' + pagerHTML + '</span>' +
        '</div>' +
        '<section class="plate-notes">' +
          (bodyHTML ? '<div class="plate-body">' + bodyHTML + '</div>' : '') +
          '<div class="plate-meta">' +
            (srcLine ? '<div><h2>Source</h2><div class="plate-source">' + srcLine + '</div></div>' : '') +
            (chipsHTML ? '<div><h2>Techniques read</h2>' +
                         '<div class="plate-tags" id="plate-tags">' + chipsHTML + '</div>' +
                         crossoverHTML + '</div>' : '') +
            compareHTML +
          '</div>' +
        '</section>' +
        '<section class="plate-figure">' +
          '<div class="plate-cvwrap"' +
            (hasCanvas
              ? ' data-canvas="true" style="--plate-aspect:' +
                ((e.plate.designWidth || 1000) + ' / ' + (e.plate.designHeight || 1000)) + '"'
              : '') +
          '>' + pictureHTML + '</div>' +
          '<div class="plate-log" id="plate-log" data-scan="on">' +
            '<div class="log-ctl">' +
              '<button type="button" id="plate-read" aria-pressed="true" title="scan on/off (r)"><span class="dot"></span>Read</button>' +
              '<button type="button" id="plate-replay" title="re-run the sweep (space)">↻ Replay</button>' +
              '<button type="button" id="plate-specbtn" aria-pressed="false" title="open spec (s)">Spec ⇥</button>' +
            '</div>' +
            '<div class="log-body">' +
              '<div class="lh"><span>Track log</span><span id="plate-ctr">0 / ' + points.length + '</span></div>' +
              '<div class="rows" id="plate-rows" role="listbox" aria-label="Track log">' + rowsHTML + '</div>' +
              '<div class="read-tail"><b>Read</b><span id="plate-readtxt">Hover a point on the plate or a chip on the left.</span></div>' +
            '</div>' +
          '</div>' +
          relatedHTML +
        '</section>' +
      '</div>' +
      /* Spec panel is a sibling of .plate-view so its position: fixed sits
         above everything, and Escape closes it without unmounting the plate. */
      '<aside class="plate-spec" id="plate-spec" aria-hidden="true">' +
        '<div class="sh">' +
          '<span>Technique spec · <b id="plate-specid"></b> · JSON</span>' +
          '<span>' +
            '<button type="button" id="plate-speccopy">Copy</button>' +
            '<button type="button" id="plate-specclose">Close ×</button>' +
          '</span>' +
        '</div>' +
        '<pre id="plate-specpre"></pre>' +
      '</aside>';

    /* Also mirror the crumb into the shell masthead so the .mast row does
       not disagree with the plate nav. The masthead is the fixed identity
       row; the plate nav is the specimen's identity row; they should match. */
    var crumb = el('crumb');
    if (crumb) crumb.textContent = sectionTitle + ' · ' + e.title;
    var pos = el('pos');
    if (pos) pos.textContent = (idx + 1) + ' / ' + S.entries.length;

    /* Mount the canvas render, if any. Do this before wirePlate so the
       picture is on-screen while interactions wire up. */
    if (hasCanvas) mountCanvas(e);

    wirePlate(e, techniques, points);
    S.markCurrent && S.markCurrent();
    window.scrollTo(0, 0);
  }

  /* Canvas mounter — sizes the <canvas> to designWidth × designHeight × dpr
     and calls plate.render(canvas, w, h, dpr). The render function is
     canvas2d convention: sets its own transform, draws into the 2d context.
     Called once at mount; re-render on window resize is out of scope for E12
     (the design fits at 1440+ widths and the layout has fixed padding). */
  function mountCanvas(e) {
    var canvas = document.getElementById('plate-canvas');
    if (!canvas) return;
    var w = e.plate.designWidth || 1000;
    var h = e.plate.designHeight || 1000;
    var dpr = window.devicePixelRatio || 1;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = '100%';
    canvas.style.height = '100%';
    /* Defer to next frame so the layout has settled — some ST renders
       measure the canvas's computed size. */
    requestAnimationFrame(function () {
      try {
        e.plate.render(canvas, w, h, dpr);
      } catch (err) {
        /* Render errors shouldn't take down the whole page; the coverage
           badge + notes still tell the reader what the plate claims. */
        if (window.console) console.error('plate.render failed for ' + e.id + ':', err);
      }
    });
  }

  /* ---------- coverage ---------------------------------------------------- */
  function computeCoverage(techniques, points) {
    if (!points.length) return { state: 'na' };
    var techIds  = {};
    var pointIds = {};
    techniques.forEach(function (t) { techIds[t.id] = true; });
    points.forEach(function (p) { if (p.t) pointIds[p.t] = true; });
    var uncovered = Object.keys(techIds).filter(function (id) { return !pointIds[id]; });
    var orphan    = Object.keys(pointIds).filter(function (id) { return !techIds[id]; });
    if (uncovered.length === 0 && orphan.length === 0) return { state: 'ok' };
    return { state: 'fail', uncovered: uncovered, orphan: orphan };
  }

  function renderCoverage(cov, n) {
    if (cov.state === 'na') {
      return '<span class="plate-cov" data-state="na">Coverage · N/A</span>';
    }
    if (cov.state === 'ok') {
      return '<span class="plate-cov" data-state="ok">Coverage · ' + n + '/' + n + ' techniques pointed</span>';
    }
    var bits = [];
    if (cov.uncovered.length) bits.push('uncovered ' + cov.uncovered.join(', '));
    if (cov.orphan.length)    bits.push('orphan-point ' + cov.orphan.join(', '));
    return '<span class="plate-cov" data-state="fail">Failed · ' + esc(bits.join(' · ')) + '</span>';
  }

  /* ---------- related ----------------------------------------------------- */
  function buildRelatedHTML(e) {
    var seen = {};
    seen[e.id] = true; // never link an entry to itself
    var rows = [];
    var titleFor = function (id) {
      var target = (S.entries || []).filter(function (x) { return x.id === id; })[0];
      return target ? (target.title || id) : id;
    };
    /* 1. Authored related[] wins first. */
    (e.related || []).forEach(function (r) {
      var eid = r.entry;
      if (!eid || seen[eid]) return;
      seen[eid] = true;
      rows.push({
        entry: eid, title: r.title || titleFor(eid),
        via: r.relation || 'related', kind: 'rel'
      });
    });
    /* 2. Inline entry.crossover.also_uses (authoring shortcut before ck-e13
       existed — birefringent-ray-bench uses this pattern). */
    var cross = e.crossover || {};
    (cross.also_uses || []).forEach(function (x) {
      (x.in || []).forEach(function (eid) {
        if (!eid || seen[eid]) return;
        seen[eid] = true;
        rows.push({
          entry: eid, title: titleFor(eid),
          via: 'shares ' + x.id, kind: 'tech'
        });
      });
    });
    /* 3. ck-e13 · Shell.crossover.techniques — for every technique in this
       entry's spec, list any other entry that also names it. This is the
       derived crossover Julia asked for in plan §6c. */
    if (S.crossover && S.crossover.techniques && e.spec && e.spec.techniques) {
      e.spec.techniques.forEach(function (t) {
        var idx = S.crossover.techniques[t.id];
        if (!idx || !idx.appears_in) return;
        idx.appears_in.forEach(function (a) {
          if (!a.entry_id || seen[a.entry_id]) return;
          seen[a.entry_id] = true;
          rows.push({
            entry: a.entry_id, title: titleFor(a.entry_id),
            via: 'shares ' + t.id, kind: 'tech'
          });
        });
      });
    }
    if (!rows.length) return '';
    var limit = 5;
    var shown = rows.slice(0, limit);
    var html = shown.map(function (r) {
      return '<a href="#/entry/' + esc(r.entry) + '" title="' + esc(r.title + ' — ' + r.via) + '">' +
               '<span class="name">' + esc(r.title) + '</span>' +
               '<span class="via ' + esc(r.kind) + '">' + esc(r.via) + '</span>' +
             '</a>';
    }).join('');
    return '<div class="plate-related">' +
             '<div class="th"><b>Related</b><span class="count">' + rows.length + '</span></div>' +
             '<div class="rel">' + html + '</div>' +
           '</div>';
  }

  /* ---------- wiring ------------------------------------------------------ */
  function wirePlate(e, techniques, points) {
    var svg      = el('plate-svg');
    var pointsG  = el('plate-points');
    var readheadG= el('plate-readhead');
    var rowsEl   = el('plate-rows');
    var tagsEl   = el('plate-tags');
    var ctrEl    = el('plate-ctr');
    var readTxt  = el('plate-readtxt');
    var logEl    = el('plate-log');
    var specEl   = el('plate-spec');
    var specPre  = el('plate-specpre');
    var specId   = el('plate-specid');
    var readBtn  = el('plate-read');
    var replayBtn= el('plate-replay');
    var specBtn  = el('plate-specbtn');
    if (!svg) return;

    var vb = svg.viewBox.baseVal;
    var uvToSvg = function (u, v) { return [vb.x + u * vb.width, vb.y + v * vb.height]; };

    /* Point markers */
    points.forEach(function (p, i) {
      var xy = uvToSvg(p.u, p.v);
      var lx = xy[0] + ((p.dir && p.dir[0]) || 1) * 34;
      var ly = xy[1] + ((p.dir && p.dir[1]) || -1) * 22;
      var dxSign = (p.dir && p.dir[0] >= 0) ? 1 : -1;
      var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'pt pt-blank');
      g.setAttribute('data-idx', i);
      g.style.cursor = 'pointer';
      g.innerHTML =
        '<line class="pt-lead" x1="' + xy[0] + '" y1="' + xy[1] + '" x2="' + lx + '" y2="' + ly + '"/>' +
        '<rect class="pt-box" x="' + (lx - 8) + '" y="' + (ly - 8) + '" width="16" height="16"/>' +
        '<rect class="pt-dot" x="' + (lx - 1.6) + '" y="' + (ly - 1.6) + '" width="3.2" height="3.2"/>' +
        '<text class="pt-lbl" x="' + (lx + dxSign * 12) + '" y="' + (ly + 3.2) + '" text-anchor="' + (dxSign > 0 ? 'start' : 'end') + '">' + pad2(i + 1) + '</text>';
      pointsG.appendChild(g);
      g.addEventListener('click', function () { selectPoint(i); });
      g.addEventListener('mouseenter', function () { hoverPoint(i); });
    });
    var pointEls = Array.prototype.slice.call(pointsG.querySelectorAll('.pt'));
    var rowEls   = Array.prototype.slice.call(rowsEl.querySelectorAll('.r'));

    rowEls.forEach(function (row, i) {
      row.addEventListener('click', function () { selectPoint(i); });
      row.addEventListener('mouseenter', function () { hoverPoint(i); });
    });

    /* ---------- SVG highlight ---------- */
    function highlightSvg(tid) {
      var cls = svg.getAttribute('class') || '';
      cls = cls.split(/\s+/).filter(function (c) { return c && c.indexOf('hi-') !== 0; }).join(' ');
      if (tid) cls = (cls + ' hi-' + tid).trim();
      if (cls) svg.setAttribute('class', cls); else svg.removeAttribute('class');
    }

    /* ---------- Spec panel ---------- */
    function paintSpec(hlId) {
      if (!e.spec) { specPre.textContent = ''; specId.textContent = e.id; return; }
      var json = JSON.stringify(e.spec, null, 2);
      var lines = json.split('\n');
      var out = '';
      var inHl = false;
      var hlDepth = 0;
      var needle = hlId ? ('"id": "' + hlId + '"') : null;
      for (var i = 0; i < lines.length; i++) {
        var raw = lines[i];
        var ln = esc(raw);
        ln = ln.replace(/&quot;([^&]+?)&quot;(:)/g, '<span class="k">&quot;$1&quot;</span>$2');
        ln = ln.replace(/: (&quot;.*?&quot;)/g, ': <span class="s">$1</span>');
        ln = ln.replace(/: (-?\d+(?:\.\d+)?)/g, ': <span class="n">$1</span>');
        if (needle) {
          if (!inHl && raw.indexOf(needle) !== -1) {
            inHl = true;
            var m = raw.match(/^ */);
            hlDepth = m ? m[0].length : 0;
          }
          if (inHl) {
            out += '<span class="hl">' + ln + '</span>\n';
            var m2 = raw.match(/^ */);
            var indent = m2 ? m2[0].length : 0;
            if (raw.replace(/^\s+/, '').charAt(0) === '}' && indent === hlDepth) inHl = false;
          } else {
            out += ln + '\n';
          }
        } else {
          out += ln + '\n';
        }
      }
      specPre.innerHTML = out;
      specId.textContent = hlId || e.id;
      if (hlId) {
        var first = specPre.querySelector('.hl');
        if (first) first.scrollIntoView({ block: 'center' });
      }
    }
    paintSpec();

    function toggleSpec(open) {
      var willOpen = (open === undefined) ? (specEl.getAttribute('aria-hidden') !== 'false') : open;
      specEl.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
      specBtn.setAttribute('aria-pressed', String(willOpen));
    }
    specBtn.addEventListener('click', function () { toggleSpec(); });
    el('plate-specclose').addEventListener('click', function () { toggleSpec(false); });
    el('plate-speccopy').addEventListener('click', function () {
      var text = JSON.stringify(e.spec || {}, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      }
      var b = el('plate-speccopy');
      var t = b.textContent; b.textContent = 'Copied ✓';
      setTimeout(function () { b.textContent = t; }, 1200);
    });

    /* ---------- Chip interactions ---------- */
    var lockedTid = null;
    if (tagsEl) {
      tagsEl.addEventListener('mouseover', function (ev) {
        var s = ev.target.closest ? ev.target.closest('button[data-tid]') : null;
        if (!s || lockedTid) return;
        highlightSvg(s.getAttribute('data-tid'));
      });
      tagsEl.addEventListener('mouseleave', function () {
        if (lockedTid) return;
        highlightSvg(null);
      });
      tagsEl.addEventListener('click', function (ev) {
        var s = ev.target.closest ? ev.target.closest('button[data-tid]') : null;
        if (!s) return;
        var tid = s.getAttribute('data-tid');
        if (lockedTid === tid) {
          lockedTid = null;
          tagsEl.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
          highlightSvg(null);
          paintSpec();
          toggleSpec(false);
        } else {
          lockedTid = tid;
          tagsEl.querySelectorAll('button').forEach(function (x) {
            x.setAttribute('aria-pressed', String(x === s));
          });
          highlightSvg(tid);
          paintSpec(tid);
          toggleSpec(true);
        }
      });
    }

    /* ---------- Point selection / hover ---------- */
    function hoverPoint(i) {
      rowEls.forEach(function (r, j) { r.setAttribute('aria-selected', String(j === i)); });
      var p = points[i];
      readTxt.textContent = pad2(i + 1) + ' · ' + (p.d || '') + ' — ' + (p.label || '');
    }
    function selectPoint(i) {
      var p = points[i];
      rowEls.forEach(function (r, j) { r.setAttribute('aria-selected', String(j === i)); });
      pointEls.forEach(function (g, j) { g.classList.toggle('pt-on', j === i); });
      readTxt.textContent = pad2(i + 1) + ' · ' + (p.d || '') + ' — ' + (p.label || '');
      if (p.t) {
        highlightSvg(p.t);
        paintSpec(p.t);
        if (tagsEl) {
          lockedTid = p.t;
          tagsEl.querySelectorAll('button').forEach(function (x) {
            x.setAttribute('aria-pressed', String(x.getAttribute('data-tid') === p.t));
          });
        }
      }
    }

    /* ---------- Read toggle + sweep ---------- */
    var readOn = true;
    var sweptTo = -1;
    var sweepStart = 0;
    var sweepRAF = 0;
    var SWEEP_MS = 3800;
    function drawSweep(t) {
      if (!sweepStart) sweepStart = t;
      var dt = t - sweepStart;
      var prog = Math.min(dt / SWEEP_MS, 1);
      var y = vb.y + prog * vb.height;
      readheadG.innerHTML = '<line class="rh" x1="' + vb.x + '" y1="' + y + '" x2="' + (vb.x + vb.width) + '" y2="' + y + '"/>';
      var n = 0;
      for (var i = 0; i < points.length; i++) {
        if (vb.y + points[i].v * vb.height <= y) n++;
      }
      var newSwept = n - 1;
      if (newSwept > sweptTo) {
        sweptTo = newSwept;
        ctrEl.textContent = (sweptTo + 1) + ' / ' + points.length;
        rowEls.forEach(function (r, j) { r.classList.toggle('blank', j > sweptTo); });
        pointEls.forEach(function (g, j) { g.classList.toggle('pt-blank', j > sweptTo); });
      }
      if (prog < 1) sweepRAF = requestAnimationFrame(drawSweep);
      else readheadG.innerHTML = '';
    }
    function reread() {
      cancelAnimationFrame(sweepRAF);
      sweepStart = 0; sweptTo = -1;
      ctrEl.textContent = '0 / ' + points.length;
      rowEls.forEach(function (r) { r.classList.add('blank'); r.setAttribute('aria-selected', 'false'); });
      pointEls.forEach(function (g) { g.classList.add('pt-blank'); g.classList.remove('pt-on'); });
      readheadG.innerHTML = '';
      if (readOn && points.length) sweepRAF = requestAnimationFrame(drawSweep);
    }
    function setRead(on) {
      readOn = !!on;
      readBtn.setAttribute('aria-pressed', String(readOn));
      logEl.setAttribute('data-scan', readOn ? 'on' : 'off');
      pointsG.style.display = readOn ? '' : 'none';
      replayBtn.style.opacity = readOn ? '1' : '.35';
      replayBtn.style.pointerEvents = readOn ? 'auto' : 'none';
      if (readOn) reread();
      else { readheadG.innerHTML = ''; cancelAnimationFrame(sweepRAF); }
    }
    readBtn.addEventListener('click', function () { setRead(!readOn); });
    replayBtn.addEventListener('click', function () { if (readOn) reread(); });
    reread();

    /* ---------- Keys ---------- */
    var keyHandler = function (ev) {
      if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return;
      if (ev.key === 's' || ev.key === 'S') { ev.preventDefault(); toggleSpec(); }
      else if (ev.key === 'r' || ev.key === 'R') { ev.preventDefault(); setRead(!readOn); }
      else if (ev.key === ' ') { ev.preventDefault(); if (readOn) reread(); }
      else if (ev.key === 'Escape') {
        toggleSpec(false); highlightSvg(null); paintSpec(); lockedTid = null;
        if (tagsEl) tagsEl.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      }
    };
    /* Detach any previous handler so navigating between plates doesn't
       accumulate listeners. */
    if (S.__plateKeyHandler) document.removeEventListener('keydown', S.__plateKeyHandler);
    S.__plateKeyHandler = keyHandler;
    document.addEventListener('keydown', keyHandler);
  }

  /* Register with the shell. views.js reads Shell.views.renderPlate when the
     entry ships a spec. */
  S.views = S.views || {};
  S.views.renderPlate = renderPlate;
})();
