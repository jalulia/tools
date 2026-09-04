/* ============================================================================
   garden-toolbox.js — the review toolbox (top-right, minimisable).

   A small fixed panel for going through the archive: what is NEW (Gardener-
   written `status: proposed` entries Julia has not clicked yet), and four
   actions on any entry —
     seen     · the "new" mark goes away, nothing else happens
     archive  · parked; out of the new list, kept in garden.json for the record
     review   · "send to Claude for review / questions"  → bench[] request
     refine   · "send to Claude for refinement"          → bench[] request

   State lives in ONE place the Gardener already reads: garden/garden.json on
   `main` (doc 07 — beds / plants / weeds / bench / compost). This file adds a
   `review` block ({ seen, archived }) and writes bench[] items of the shape
     { id, kind: 'review' | 'refine', entry, title, note, created, from: 'toolbox', status: 'open' }

   Transport: the GitHub contents API with a fine-grained token that lives ONLY
   in this browser's localStorage (Contents: read + write on jalulia/tools).
   Without a token the panel still works — actions queue locally and commit
   the moment a token is pasted. Every action is an op in a pending log; a
   sync re-reads the remote file, replays the ops on top, and PUTs — so two
   browsers, or the Gardener's own writes, never clobber each other.

   No framework, no build. Loaded by encyclopedia/index.html after the shell.
   ============================================================================ */
(function () {
  'use strict';

  var REPO = 'jalulia/tools', BRANCH = 'main', PATH = 'garden/garden.json';
  var API = 'https://api.github.com/repos/' + REPO + '/contents/' + PATH;
  var RAW = 'https://raw.githubusercontent.com/' + REPO + '/' + BRANCH + '/' + PATH;
  var LS = { token: 'gt.token', min: 'gt.min', ops: 'gt.ops', cache: 'gt.cache', open: 'gt.open' };

  var S = window.Shell;
  if (!S) return;

  /* ---------- storage helpers (every access guarded: private mode, etc.) --- */
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  /* ---------- state --------------------------------------------------------- */
  var remote = null;          // last known garden.json from GitHub
  var sha = null;             // its blob sha (needed for PUT)
  var ops = lsGet(LS.ops, []);// pending ops not yet committed
  var view = null;            // remote + ops, what the UI renders
  var busy = false, timer = null, lastMsg = '', lastErr = '';
  var openSections = lsGet(LS.open, { now: true, fresh: true, sent: true, archived: false });
  var noteFor = null;         // { id, kind } while a note box is open

  function emptyGarden() {
    return { beds: [], plants: [], weeds: [], bench: [], compost: [], review: { seen: {}, archived: {} } };
  }
  function normalise(g) {
    g = g && typeof g === 'object' ? g : {};
    ['beds', 'plants', 'weeds', 'bench', 'compost'].forEach(function (k) { if (!Array.isArray(g[k])) g[k] = []; });
    if (!g.review || typeof g.review !== 'object') g.review = {};
    if (!g.review.seen || typeof g.review.seen !== 'object') g.review.seen = {};
    if (!g.review.archived || typeof g.review.archived !== 'object') g.review.archived = {};
    return g;
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function now() { return new Date().toISOString(); }
  function uid() { return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---------- ops: the only way state changes ------------------------------ */
  function apply(g, op) {
    var r = g.review;
    switch (op.t) {
      case 'seen':      r.seen[op.id] = op.at; break;
      case 'unseen':    delete r.seen[op.id]; break;
      case 'archive':   r.archived[op.id] = op.at; r.seen[op.id] = r.seen[op.id] || op.at; break;
      case 'unarchive': delete r.archived[op.id]; break;
      case 'bench':
        if (!g.bench.some(function (b) { return b.id === op.item.id; })) g.bench.push(op.item);
        r.seen[op.item.entry] = r.seen[op.item.entry] || op.at;
        break;
      case 'withdraw':  g.bench = g.bench.filter(function (b) { return b.id !== op.id; }); break;
    }
    return g;
  }
  function rebuild() {
    view = normalise(clone(remote || lsGet(LS.cache, null) || emptyGarden()));
    ops.forEach(function (op) { apply(view, op); });
  }
  function push(op) {
    op.at = op.at || now();
    ops.push(op); lsSet(LS.ops, ops);
    rebuild(); render(); badge();
    scheduleSync();
  }

  /* ---------- entries ------------------------------------------------------- */
  function entries() { return S.entries || []; }
  function byId(id) { return S.byId ? S.byId[id] : null; }
  function isNew(e) {
    return e && e.status === 'proposed' && !view.review.seen[e.id] && !view.review.archived[e.id];
  }
  function fresh() { return entries().filter(isNew); }
  function archived() { return Object.keys(view.review.archived).map(byId).filter(Boolean); }
  function openBench() { return view.bench.filter(function (b) { return b.from === 'toolbox' && b.status !== 'done'; }); }

  /* ---------- GitHub -------------------------------------------------------- */
  function token() { return lsGet(LS.token, ''); }
  function b64enc(s) { return btoa(unescape(encodeURIComponent(s))); }
  function b64dec(s) { return decodeURIComponent(escape(atob(s.replace(/\n/g, '')))); }

  function fetchRemote() {
    var t = token();
    if (t) {
      return fetch(API + '?ref=' + BRANCH, { headers: { Authorization: 'Bearer ' + t, Accept: 'application/vnd.github+json' }, cache: 'no-store' })
        .then(function (r) {
          if (r.status === 404) { sha = null; return emptyGarden(); }
          if (!r.ok) throw new Error('GitHub read ' + r.status);
          return r.json().then(function (j) { sha = j.sha; return JSON.parse(b64dec(j.content)); });
        });
    }
    return fetch(RAW + '?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (r.status === 404) return emptyGarden(); if (!r.ok) throw new Error('read ' + r.status); return r.json(); });
  }

  function commit(g, message) {
    var t = token(); if (!t) return Promise.reject(new Error('no token'));
    var body = { message: message, content: b64enc(JSON.stringify(g, null, 2) + '\n'), branch: BRANCH };
    if (sha) body.sha = sha;
    return fetch(API, { method: 'PUT', headers: { Authorization: 'Bearer ' + t, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) {
        if (r.status === 409 || r.status === 422) throw Object.assign(new Error('conflict'), { conflict: true });
        if (!r.ok) throw new Error('GitHub write ' + r.status);
        return r.json();
      });
  }

  function summarise(list) {
    var c = {}; list.forEach(function (o) { c[o.t] = (c[o.t] || 0) + 1; });
    return Object.keys(c).map(function (k) { return c[k] + ' ' + k; }).join(', ');
  }

  function scheduleSync() { clearTimeout(timer); timer = setTimeout(sync, 1800); }

  function sync(retry) {
    if (busy) { scheduleSync(); return; }
    busy = true; lastErr = ''; render();
    var batch = ops.slice();
    fetchRemote().then(function (g) {
      remote = normalise(g); lsSet(LS.cache, remote); rebuild();
      if (!batch.length || !token()) { busy = false; render(); badge(); return; }
      var next = normalise(clone(remote)); batch.forEach(function (op) { apply(next, op); });
      var msg = 'garden: toolbox — ' + summarise(batch);
      return commit(next, msg).then(function (res) {
        sha = res.content && res.content.sha; remote = next; lsSet(LS.cache, remote);
        ops = ops.slice(batch.length); lsSet(LS.ops, ops);
        lastMsg = 'committed ' + (res.commit && res.commit.sha ? res.commit.sha.slice(0, 7) : '');
        busy = false; rebuild(); render(); badge();
      });
    }).catch(function (err) {
      busy = false;
      if (err.conflict && !retry) { sha = null; return sync(true); }
      lastErr = err.message === 'no token' ? '' : err.message;
      render();
    });
  }

  /* ---------- UI ------------------------------------------------------------ */
  var css = '' +
  '#gt{position:fixed;top:calc(var(--mast-h,52px) + 12px);right:12px;z-index:150;width:312px;max-height:calc(100vh - var(--mast-h,52px) - 24px);' +
  ' display:flex;flex-direction:column;background:var(--paper,#fff);color:var(--ink,#0b0b0c);border:1px solid var(--rule-2,#d0d0d4);' +
  ' box-shadow:0 8px 30px rgba(0,0,0,.14);font:400 12.5px/1.45 var(--f-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif)}' +
  '#gt *{box-sizing:border-box}' +
  '#gt[data-min="1"]{width:auto;max-height:none}' +
  '#gt[data-min="1"] .gt-body,#gt[data-min="1"] .gt-foot,#gt[data-min="1"] .gt-tok{display:none}' +
  '#gt .gt-head{display:flex;align-items:center;gap:8px;padding:8px 8px 8px 12px;border-bottom:1px solid var(--rule,#e3e3e5);cursor:default}' +
  '#gt[data-min="1"] .gt-head{border-bottom:0}' +
  '#gt .gt-title{font:600 11px/1.2 var(--f-mach,ui-monospace,monospace);letter-spacing:.08em;text-transform:uppercase;flex:1;white-space:nowrap}' +
  '#gt .gt-title b{display:inline-block;min-width:18px;padding:1px 6px;margin-left:6px;border-radius:9px;background:var(--ink,#0b0b0c);color:var(--paper,#fff);font-weight:600;text-align:center}' +
  '#gt .gt-title b[data-n="0"]{background:var(--rule-2,#d0d0d4);color:var(--ink-2,#55555a)}' +
  '#gt .gt-dot{width:8px;height:8px;border-radius:50%;background:var(--ink-4,#b6b6bb);flex:none}' +
  '#gt .gt-dot[data-s="ok"]{background:#2e9e5b}#gt .gt-dot[data-s="busy"]{background:#d9a400;animation:gtp 1s infinite}#gt .gt-dot[data-s="err"]{background:#c8321e}#gt .gt-dot[data-s="pending"]{background:#d9a400}' +
  '@keyframes gtp{50%{opacity:.35}}' +
  '#gt .gt-ib{border:0;background:none;padding:4px 6px;cursor:pointer;color:var(--ink-2,#55555a);font:inherit;line-height:1}' +
  '#gt .gt-ib:hover{color:var(--ink,#0b0b0c)}' +
  '#gt .gt-body{overflow:auto;padding:4px 0 8px}' +
  '#gt details{border-bottom:1px solid var(--rule-3,#f0f0f1)}' +
  '#gt summary{list-style:none;cursor:pointer;padding:8px 12px;font:600 11px/1.2 var(--f-mach,ui-monospace,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2,#55555a);display:flex;justify-content:space-between}' +
  '#gt summary::-webkit-details-marker{display:none}' +
  '#gt summary::after{content:"+";color:var(--ink-3,#74747a)}#gt details[open] summary::after{content:"–"}' +
  '#gt .gt-item{padding:6px 12px 8px}' +
  '#gt .gt-item+.gt-item{border-top:1px solid var(--rule-3,#f0f0f1)}' +
  '#gt .gt-t{display:block;color:var(--ink,#0b0b0c);text-decoration:none;font-weight:600}' +
  '#gt .gt-t:hover{text-decoration:underline}' +
  '#gt .gt-m{color:var(--ink-3,#74747a);font:500 10.5px/1.4 var(--f-mach,ui-monospace,monospace);letter-spacing:.04em}' +
  '#gt .gt-acts{display:flex;gap:4px;margin-top:6px;flex-wrap:wrap}' +
  '#gt .gt-acts button{font:600 10.5px/1 var(--f-mach,ui-monospace,monospace);letter-spacing:.04em;padding:5px 8px;border:1px solid var(--rule-2,#d0d0d4);background:var(--paper,#fff);color:var(--ink,#0b0b0c);cursor:pointer;border-radius:2px}' +
  '#gt .gt-acts button:hover{background:var(--bench,#f1f1f1)}' +
  '#gt .gt-acts button[data-a="review"],#gt .gt-acts button[data-a="refine"]{border-color:var(--ink,#0b0b0c)}' +
  '#gt .gt-note{margin-top:6px}' +
  '#gt .gt-note textarea{width:100%;min-height:62px;font:inherit;padding:6px 8px;border:1px solid var(--rule-2,#d0d0d4);resize:vertical;background:var(--bench,#f1f1f1);color:var(--ink,#0b0b0c)}' +
  '#gt .gt-note .gt-acts{margin-top:4px}' +
  '#gt .gt-empty{padding:6px 12px 10px;color:var(--ink-3,#74747a)}' +
  '#gt .gt-foot{padding:8px 12px;border-top:1px solid var(--rule,#e3e3e5);color:var(--ink-3,#74747a);font:500 10.5px/1.4 var(--f-mach,ui-monospace,monospace);letter-spacing:.03em;display:flex;justify-content:space-between;gap:8px}' +
  '#gt .gt-foot .gt-err{color:#c8321e}' +
  '#gt .gt-foot button{border:0;background:none;padding:0;font:inherit;color:var(--ink-2,#55555a);text-decoration:underline;cursor:pointer}' +
  '#gt .gt-tok{padding:8px 12px 10px;border-top:1px solid var(--rule,#e3e3e5)}' +
  '#gt .gt-tok input{width:100%;font:inherit;padding:6px 8px;border:1px solid var(--rule-2,#d0d0d4);margin:6px 0}' +
  '#gt .gt-tok p{margin:0;color:var(--ink-3,#74747a);font-size:11.5px}' +
  /* new-marks on the rail and the contact sheet */
  '.gt-new{position:relative}' +
  '.ent.gt-new::after,.prev.gt-new::after{content:"new";position:absolute;font:600 9px/1 var(--f-mach,ui-monospace,monospace);letter-spacing:.08em;text-transform:uppercase;padding:3px 5px;background:var(--ink,#0b0b0c);color:var(--paper,#fff);border-radius:2px;pointer-events:none}' +
  '.ent.gt-new::after{right:26px;top:50%;transform:translateY(-50%)}' +
  '.prev.gt-new::after{left:6px;top:6px;z-index:2}' +
  '@media (max-width:820px){#gt{width:calc(100vw - 24px)}}';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function href(e) { return '#/' + e.id; }
  function meta(e) { return [e.entity, e.section, e.status].filter(Boolean).join(' · '); }

  var root, minimised = !!lsGet(LS.min, false), showTok = false;

  function mount() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    root = document.createElement('aside'); root.id = 'gt'; root.setAttribute('aria-label', 'Review toolbox');
    document.body.appendChild(root);
    root.addEventListener('click', onClick);
    root.addEventListener('toggle', function (ev) {
      var d = ev.target; if (d && d.dataset && d.dataset.sec) { openSections[d.dataset.sec] = d.open; lsSet(LS.open, openSections); }
    }, true);
    render(); badge();
  }

  function actsHTML(id) {
    return '<div class="gt-acts">' +
      '<button type="button" data-a="seen" data-id="' + esc(id) + '" title="I have seen this — drop the new mark">seen</button>' +
      '<button type="button" data-a="archive" data-id="' + esc(id) + '" title="Park it, out of the way">archive</button>' +
      '<button type="button" data-a="review" data-id="' + esc(id) + '" title="Send to Claude for review / questions">review →</button>' +
      '<button type="button" data-a="refine" data-id="' + esc(id) + '" title="Send to Claude for refinement">refine →</button>' +
      '</div>';
  }
  function noteHTML(id, kind) {
    return '<div class="gt-note"><textarea placeholder="' + (kind === 'review' ? 'Questions, doubts, what to check…' : 'What to change, push, tighten…') +
      '" data-note="' + esc(id) + '"></textarea><div class="gt-acts">' +
      '<button type="button" data-a="send" data-id="' + esc(id) + '" data-kind="' + kind + '">send to Claude · ' + kind + '</button>' +
      '<button type="button" data-a="cancel">cancel</button></div></div>';
  }
  function itemHTML(e, opts) {
    var open = noteFor && noteFor.id === e.id;
    return '<div class="gt-item">' +
      '<a class="gt-t" href="' + esc(href(e)) + '">' + esc(e.title || e.id) + '</a>' +
      '<span class="gt-m">' + esc(meta(e)) + (opts && opts.extra ? ' · ' + esc(opts.extra) : '') + '</span>' +
      (opts && opts.acts === false ? '' : actsHTML(e.id)) +
      (open ? noteHTML(e.id, noteFor.kind) : '') +
      '</div>';
  }
  function benchHTML(b) {
    var e = byId(b.entry);
    return '<div class="gt-item">' +
      '<a class="gt-t" href="#/' + esc(b.entry) + '">' + esc((e && e.title) || b.title || b.entry) + '</a>' +
      '<span class="gt-m">' + esc(b.kind) + ' · ' + esc((b.created || '').slice(0, 10)) + (b.status && b.status !== 'open' ? ' · ' + esc(b.status) : '') + '</span>' +
      (b.note ? '<div style="margin-top:4px;color:var(--ink-2)">' + esc(b.note) + '</div>' : '') +
      '<div class="gt-acts"><button type="button" data-a="withdraw" data-id="' + esc(b.id) + '">withdraw</button></div></div>';
  }
  function sec(key, label, count, inner) {
    return '<details data-sec="' + key + '"' + (openSections[key] ? ' open' : '') + '><summary><span>' + label + ' <span class="gt-m">' + count + '</span></span></summary>' +
      (inner || '<div class="gt-empty">nothing here</div>') + '</details>';
  }

  function render() {
    if (!root || !view) return;
    var nu = fresh(), ar = archived(), bench = openBench(), cur = S.current;
    var s = busy ? 'busy' : lastErr ? 'err' : ops.length ? 'pending' : (remote ? 'ok' : '');
    root.setAttribute('data-min', minimised ? '1' : '0');
    root.innerHTML =
      '<div class="gt-head">' +
        '<span class="gt-dot" data-s="' + s + '" title="' + esc(busy ? 'syncing' : lastErr || (ops.length ? ops.length + ' pending' : lastMsg || 'in sync')) + '"></span>' +
        '<span class="gt-title">Review <b data-n="' + nu.length + '">' + nu.length + '</b></span>' +
        '<button type="button" class="gt-ib" data-a="sync" title="sync now">↻</button>' +
        '<button type="button" class="gt-ib" data-a="tok" title="GitHub token">⚙</button>' +
        '<button type="button" class="gt-ib" data-a="min" title="' + (minimised ? 'expand' : 'minimise') + '">' + (minimised ? '▢' : '—') + '</button>' +
      '</div>' +
      '<div class="gt-body">' +
        (cur ? sec('now', 'Now viewing', '', itemHTML(cur, { extra: isNew(cur) ? 'new' : (view.review.archived[cur.id] ? 'archived' : '') })) : '') +
        sec('fresh', 'New', nu.length, nu.length ? nu.map(function (e) { return itemHTML(e); }).join('') : '') +
        sec('sent', 'Sent to Claude', bench.length, bench.length ? bench.map(benchHTML).join('') : '') +
        sec('archived', 'Archived', ar.length, ar.length ? ar.map(function (e) {
          return '<div class="gt-item"><a class="gt-t" href="' + esc(href(e)) + '">' + esc(e.title || e.id) + '</a><span class="gt-m">' + esc(meta(e)) + '</span>' +
            '<div class="gt-acts"><button type="button" data-a="unarchive" data-id="' + esc(e.id) + '">restore</button></div></div>';
        }).join('') : '') +
      '</div>' +
      (showTok || !token() ? '<div class="gt-tok"><p>' + (token() ? 'Token set. Paste a new one to replace it, or ' : 'No GitHub token — actions queue here until one is set. Fine-grained token, <b>Contents: read &amp; write</b> on jalulia/tools. Stays in this browser only.') +
        (token() ? '<button type="button" data-a="untok" style="border:0;background:none;padding:0;font:inherit;text-decoration:underline;cursor:pointer">forget it</button>.' : '') + '</p>' +
        '<input type="password" placeholder="github_pat_…" data-tok autocomplete="off"><div class="gt-acts"><button type="button" data-a="savetok">save token</button>' + (token() ? '<button type="button" data-a="tok">close</button>' : '') + '</div></div>' : '') +
      '<div class="gt-foot"><span>' + (ops.length ? ops.length + ' pending' : esc(lastMsg || 'garden/garden.json · main')) + '</span>' +
        (lastErr ? '<span class="gt-err">' + esc(lastErr) + '</span>' : '') + '</div>';
    if (noteFor) { var ta = root.querySelector('textarea[data-note="' + cssq(noteFor.id) + '"]'); if (ta) { ta.value = noteFor.text || ''; ta.focus(); } }
  }
  function cssq(s) { return String(s).replace(/["\\]/g, '\\$&'); }

  function onClick(ev) {
    var b = ev.target.closest('button'); if (!b) return;
    var a = b.dataset.a, id = b.dataset.id;
    if (a === 'min') { minimised = !minimised; lsSet(LS.min, minimised); render(); return; }
    if (a === 'sync') { sync(); return; }
    if (a === 'tok') { showTok = !showTok; render(); return; }
    if (a === 'savetok') { var inp = root.querySelector('input[data-tok]'); var v = inp && inp.value.trim(); if (v) { lsSet(LS.token, v); showTok = false; sha = null; sync(); } return; }
    if (a === 'untok') { lsDel(LS.token); showTok = false; render(); return; }
    if (a === 'seen') { push({ t: 'seen', id: id }); return; }
    if (a === 'archive') { push({ t: 'archive', id: id }); return; }
    if (a === 'unarchive') { push({ t: 'unarchive', id: id }); return; }
    if (a === 'withdraw') { push({ t: 'withdraw', id: id }); return; }
    if (a === 'review' || a === 'refine') { noteFor = { id: id, kind: a, text: '' }; render(); return; }
    if (a === 'cancel') { noteFor = null; render(); return; }
    if (a === 'send') {
      var ta = root.querySelector('textarea[data-note="' + cssq(id) + '"]'); var e = byId(id);
      var item = { id: uid(), kind: b.dataset.kind, entry: id, title: e ? (e.title || id) : id, note: (ta && ta.value.trim()) || '', created: now(), from: 'toolbox', status: 'open' };
      noteFor = null; push({ t: 'bench', item: item }); return;
    }
  }

  /* ---------- new-marks on rail + sheet -------------------------------------- */
  var badgeTimer = null;
  function badge() {
    clearTimeout(badgeTimer);
    badgeTimer = setTimeout(function () {
      if (!view) return;
      var ids = {}; fresh().forEach(function (e) { ids[e.id] = 1; });
      document.querySelectorAll('.ent[data-id],.prev[data-id]').forEach(function (el) {
        el.classList.toggle('gt-new', !!ids[el.dataset.id]);
      });
    }, 40);
  }

  /* ---------- boot ----------------------------------------------------------- */
  function start() {
    rebuild();
    mount();
    document.addEventListener('input', function (ev) { if (noteFor && ev.target.matches('#gt textarea[data-note]')) noteFor.text = ev.target.value; });
    window.addEventListener('hashchange', function () { noteFor = null; setTimeout(function () { render(); badge(); }, 0); });
    new MutationObserver(function () { badge(); }).observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { render(); badge(); }, 300);
    var lastN = -1;
    setInterval(function () {
      if (!view || noteFor) return;
      var n = fresh().length + '/' + (S.current ? S.current.id : '');
      if (n !== lastN) { lastN = n; render(); badge(); }
    }, 800);
    sync();
  }
  if (S.booted) start();
  else {
    var tries = 0, w = setInterval(function () { if (S.booted || ++tries > 200) { clearInterval(w); if (S.booted) start(); } }, 50);
  }
})();
