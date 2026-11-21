// Page views and parameter interactions. Inlined at the end of every deployed page by build-site.mjs.
// Cookieless: only an explicit owner-exclusion preference is stored. pv is a random id for this page load, so its view and
// interactions can be joined; it cannot link pages or visits. See docs/ANALYTICS.md.
(function () { try {
  if (location.hostname !== 'jalulia.github.io' || window.top !== window || navigator.webdriver) return;
  // Owner preference only; no visitor identifier is stored.
  var exclusionKey = 'tools.analytics.exclude', suppressThisLoad = false;
  function excluded() {
    if (suppressThisLoad) return true;
    try { return localStorage.getItem(exclusionKey) === '1' || !!localStorage.getItem('tools.token'); }
    catch (e) { return false; }
  }
  function preference() {
    var match = /^#analytics=(exclude|include|status)$/.exec(location.hash);
    if (!match) return false;
    // Setup/checking the preference must never create analytics.
    suppressThisLoad = true;
    var saved = true;
    try {
      if (match[1] === 'exclude') localStorage.setItem(exclusionKey, '1');
      if (match[1] === 'include') localStorage.removeItem(exclusionKey);
    } catch (e) { saved = false; }
    var owner = false, optedOut = false;
    try { owner = !!localStorage.getItem('tools.token'); optedOut = localStorage.getItem(exclusionKey) === '1'; }
    catch (e) { saved = false; }
    var old = document.getElementById('tools-analytics-preference');
    if (old) old.remove();
    var box = document.createElement('aside');
    box.id = 'tools-analytics-preference';
    box.setAttribute('role', 'status');
    box.style.cssText = 'position:fixed;z-index:2147483647;left:16px;right:16px;bottom:16px;max-width:540px;padding:20px;background:#fff;color:#111;border:2px solid #111;box-shadow:0 4px 24px #0002;font:16px/1.5 system-ui,sans-serif';
    var title = document.createElement('strong');
    title.textContent = !saved ? 'This visit is excluded; saving the preference failed.' :
      owner || optedOut ? 'This browser is excluded from analytics.' : 'This browser will count on your next page load.';
    var note = document.createElement('p');
    note.textContent = !saved ? 'Browser storage is unavailable. Exclusion cannot be confirmed for future visits.' :
      owner ? 'Your saved CMS token excludes this browser. Other laptops and browser profiles need their own exclusion.' :
      optedOut ? 'Saved for this browser profile. Repeat on your other laptop. Clearing site data removes the preference.' :
      'This settings visit is excluded. Earlier activity cannot be identified as yours retroactively.';
    var links = document.createElement('p');
    [['Exclude this browser', '#analytics=exclude'], ['Check status', '#analytics=status'], ['Allow counting', '#analytics=include']].forEach(function (item) {
      var a = document.createElement('a'); a.href = item[1]; a.textContent = item[0];
      a.style.cssText = 'display:inline-block;margin:0 16px 8px 0;color:#111;text-decoration:underline';
      links.appendChild(a);
    });
    var done = document.createElement('button');
    done.type = 'button'; done.textContent = 'Done';
    done.style.cssText = 'font:inherit;padding:6px 16px;border:1px solid #111;background:#111;color:white;cursor:pointer';
    done.addEventListener('click', function () { box.remove(); history.replaceState(null, '', location.pathname + location.search); });
    box.appendChild(title); box.appendChild(note); box.appendChild(links); box.appendChild(done);
    document.body.appendChild(box);
    return true;
  }
  preference();
  addEventListener('hashchange', preference);
  var B = 'https://ycolvxmvcmxfnuicgfay.supabase.co/rest/v1/', K = 'sb_publishable_J_oytCmrNIGz9kmbgY5zMA_a0Rjt17L';
  var pv = Math.random().toString(36).slice(2, 10), last = '', n = 0, lastK = '', lastT = 0;
  function post(t, o) {
    if (excluded()) return;
    try { fetch(B + t, { method: 'POST', keepalive: true, headers: { apikey: K, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(o) }).catch(function () {}); } catch (e) {}
  }
  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

  // views: on load and on each library route (#/...)
  function view() {
    var p = location.pathname.slice(0, 300), h = location.hash, r = /^#\//.test(h) ? h.split(/[?&]/)[0].slice(0, 200) : '';
    if (p + r === last) return; last = p + r;
    var f = ''; try { var u = new URL(document.referrer); if (u.host !== location.host) f = u.host.slice(0, 120); } catch (e) {}
    var w = innerWidth, d = w < 640 ? 'phone' : w < 1024 ? 'tablet' : 'desktop';
    post('tools_views', { pv: pv, path: p, route: r || null, ref: f || null, device: d });
  }
  view(); addEventListener('hashchange', view);

  // interactions: a control's name, and its value for sliders, numbers, colors, choices, toggles and menus.
  // Text a visitor types is never sent.
  function nameOf(t) {
    if (t.classList && t.classList.contains('rst')) return clean(t.getAttribute('aria-label') || t.title || 'Reset');
    var row = t.closest('.prm'); if (row) { var a = row.querySelector('.nm'); if (a) return clean(a.textContent); }
    var ink = t.closest('.ink'); if (ink) { var b = ink.querySelector('.nm'); if (b) return 'Ink · ' + clean(b.textContent); }
    if (t.labels && t.labels[0]) return clean(t.labels[0].textContent);
    return clean(t.getAttribute('aria-label') || t.title || (t.tagName === 'BUTTON' ? t.textContent : '') || t.name || t.id).replace(/ · \d+$/, '');
  }
  function areaOf(t) {
    if (t.getAttribute('role') === 'tab') return 'tab';
    var s = t.closest('.tabp[data-tab]'); if (s) return s.getAttribute('data-tab');
    var m = t.closest('#mView, #mMotion, #mNote'); if (m) return m.id.slice(1).toLowerCase();
    return t.closest('#panel') ? 'panel' : 'page';
  }
  function dial(t, v) {
    if (n >= 150) return;
    var c = nameOf(t).slice(0, 80); if (!c) return;
    var k = c + '|' + v, now = Date.now(); if (k === lastK && now - lastT < 1500) return; lastK = k; lastT = now; n++;
    post('tools_dials', { pv: pv, path: location.pathname.slice(0, 300), area: areaOf(t).slice(0, 24), control: c, value: v == null ? null : String(v).slice(0, 40) });
  }
  function valueOf(t) {
    var ty = (t.type || '').toLowerCase();
    if (ty === 'range' || ty === 'number' || ty === 'color' || t.classList.contains('num') || t.classList.contains('hex')) return t.value;
    if (ty === 'checkbox' || ty === 'radio') return t.checked ? 'on' : 'off';
    if (t.tagName === 'SELECT') return t.options[t.selectedIndex] ? clean(t.options[t.selectedIndex].text) : null;
    return null;
  }
  function field(t) {
    if (!t || !t.matches || !t.matches('input,select,textarea')) return false;
    return !/password|email|hidden|file|search/.test((t.type || '').toLowerCase());
  }
  document.addEventListener('change', function (e) { if (e.isTrusted && field(e.target)) dial(e.target, valueOf(e.target)); }, true);
  // the panel steps sliders and number fields from the keyboard itself (no change event), so read them after the keys stop
  var kt = null, kel = null;
  function flush() { clearTimeout(kt); if (kel) { var t = kel; kel = null; dial(t, valueOf(t)); } }
  document.addEventListener('keyup', function (e) {
    var t = e.target; if (!e.isTrusted || !field(t) || !/^(Arrow|Page|Home|End|Enter)/.test(e.key)) return;
    if (kel && kel !== t) flush();
    kel = t; clearTimeout(kt); kt = setTimeout(flush, 700);
  }, true);
  addEventListener('pagehide', flush);
  document.addEventListener('click', function (e) {
    if (!e.isTrusted || !e.target.closest) return;
    var b = e.target.closest('#panel button, #panel [role="radio"], #panel [role="tab"]'); if (!b) return;
    var row = b.closest('.prm'), v = null;
    if (row && b.getAttribute('role') === 'radio') v = clean(b.textContent);
    dial(b, v);
  }, true);
} catch (e) {} })();
