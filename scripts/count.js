// Page views and parameter interactions. Inlined at the end of every deployed page by build-site.mjs.
// Cookieless: nothing is written to the browser. pv is a random id for this page load only, so a view and its
// interactions can be joined; it cannot link pages or visits. See docs/ANALYTICS.md.
(function () { try {
  if (location.hostname !== 'jalulia.github.io' || window.top !== window || navigator.webdriver) return;
  try { if (localStorage.getItem('tools.token')) return; } catch (e) {}
  var B = 'https://ycolvxmvcmxfnuicgfay.supabase.co/rest/v1/', K = 'sb_publishable_J_oytCmrNIGz9kmbgY5zMA_a0Rjt17L';
  var pv = Math.random().toString(36).slice(2, 10), last = '', n = 0, lastK = '', lastT = 0;
  function post(t, o) {
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
