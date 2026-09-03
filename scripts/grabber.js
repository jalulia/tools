/* tools grabber — press `g`, click a section (Shift = its parent), it queues
   {sourceUrl, selector, title, html, styles, rect}. "export" downloads
   cue-<stamp>.json into Downloads, where the daily task picks it up.
   Self-contained, forced-light, no deps. Injected on every tool page. */
(function () {
  if (window.__toolsGrab) return; window.__toolsGrab = 1;
  var LS = 'tools-cue';
  var load = function () { try { return JSON.parse(localStorage.getItem(LS) || '[]'); } catch (e) { return []; } };
  var save = function (a) { try { localStorage.setItem(LS, JSON.stringify(a)); } catch (e) {} };

  var box = document.createElement('div');
  box.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483600;border:2px solid #2b44ff;background:rgba(43,68,255,.08);display:none;transition:none';
  var tag = document.createElement('div');
  tag.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483601;font:600 10px/1 ui-monospace,Menlo,monospace;background:#2b44ff;color:#fff;padding:3px 6px;display:none;white-space:nowrap';
  var hud = document.createElement('div');
  hud.id = 'tools-grab-hud';
  hud.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483600;display:flex;align-items:stretch;'
    + "font:500 12px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;"
    + 'background:#fff;color:#111;border:1px solid #d7d7d7;box-shadow:0 2px 10px rgba(0,0,0,.10);border-radius:2px;overflow:hidden';

  if (document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
  function mount() {
    if (!document.body || document.getElementById('tools-grab-hud')) return;
    document.body.appendChild(box); document.body.appendChild(tag); document.body.appendChild(hud); render();
  }

  var mode = false, hover = null;
  function btn(label, fn) {
    var b = document.createElement(fn ? 'button' : 'span');
    b.textContent = label;
    b.style.cssText = 'all:unset;padding:8px 11px;border-right:1px solid #ececec;color:#111;cursor:' + (fn ? 'pointer' : 'default');
    if (fn) b.onclick = fn;
    return b;
  }
  function render() {
    var n = load().length; hud.innerHTML = '';
    var t = btn(mode ? '● grabbing' : 'grab', function () { setMode(!mode); });
    t.style.background = mode ? '#2b44ff' : '#fff'; t.style.color = mode ? '#fff' : '#111';
    hud.appendChild(t);
    var c = btn('cue ' + n, null); c.style.color = '#8a8a8a'; hud.appendChild(c);
    hud.appendChild(btn('export', doExport));
    if (n) hud.appendChild(btn('clear', function () { if (confirm('Clear ' + n + ' queued grabs?')) { save([]); render(); } }));
  }
  function setMode(on) {
    mode = on; document.documentElement.style.cursor = on ? 'crosshair' : '';
    if (!on) { box.style.display = 'none'; tag.style.display = 'none'; hover = null; }
    render();
  }
  function inUI(el) { return el && el.closest && (el.closest('#tools-grab-hud') || el.closest('#tools-nav')); }

  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) setMode(!mode);
    else if (e.key === 'Escape' && mode) setMode(false);
  });
  document.addEventListener('mousemove', function (e) {
    if (!mode) return;
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || inUI(el)) { box.style.display = 'none'; tag.style.display = 'none'; hover = null; return; }
    if (e.shiftKey && el.parentElement) el = el.parentElement;
    hover = el;
    var r = el.getBoundingClientRect();
    box.style.display = 'block'; box.style.left = r.left + 'px'; box.style.top = r.top + 'px'; box.style.width = r.width + 'px'; box.style.height = r.height + 'px';
    tag.style.display = 'block';
    tag.textContent = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '  ' + Math.round(r.width) + '×' + Math.round(r.height) + (e.shiftKey ? '  (parent)' : '');
    tag.style.left = r.left + 'px'; tag.style.top = Math.max(0, r.top - 18) + 'px';
  }, true);
  document.addEventListener('click', function (e) {
    if (!mode) return;
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (inUI(el)) return;                       // let HUD buttons work
    e.preventDefault(); e.stopPropagation();
    capture((e.shiftKey && el.parentElement) ? el.parentElement : el);
  }, true);

  function selFor(el) {
    if (el.id) return '#' + el.id;
    var path = [], n = el, guard = 0;
    while (n && n.nodeType === 1 && guard++ < 5) {
      if (n.id) { path.unshift('#' + n.id); break; }
      var s = n.tagName.toLowerCase();
      if (n.className && typeof n.className === 'string') { var c = n.className.trim().split(/\s+/)[0]; if (c) s += '.' + c; }
      var p = n.parentElement;
      if (p) { var sib = [].filter.call(p.children, function (x) { return x.tagName === n.tagName; }); if (sib.length > 1) s += ':nth-of-type(' + (sib.indexOf(n) + 1) + ')'; }
      path.unshift(s); n = p;
    }
    return path.join(' > ');
  }
  function styles() {
    var faces = [].map.call(document.querySelectorAll('link[rel=stylesheet],link[href*=fonts]'), function (l) { return l.outerHTML; }).join('\n');
    var css = [].map.call(document.querySelectorAll('style'), function (s) { return s.textContent; }).join('\n');
    return faces + '\n<style>\n' + css + '\n</style>';
  }
  function capture(el) {
    var r = el.getBoundingClientRect();
    var item = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ts: new Date().toISOString(),
      sourceUrl: location.href.split('#')[0] + (el.id ? '#' + el.id : ''),
      host: location.host, path: location.pathname,
      selector: selFor(el),
      title: (el.getAttribute('aria-label') || el.id || (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 70)),
      note: '',
      rect: { w: Math.round(r.width), h: Math.round(r.height) },
      html: el.outerHTML.slice(0, 300000),
      styles: styles().slice(0, 300000)
    };
    var a = load(); a.push(item); save(a); render();
    box.style.borderColor = '#00b050'; box.style.background = 'rgba(0,176,80,.18)';
    setTimeout(function () { box.style.borderColor = '#2b44ff'; box.style.background = 'rgba(43,68,255,.08)'; }, 220);
  }
  function doExport() {
    var items = load();
    if (!items.length) { alert('Cue is empty — press g, click sections, then export.'); return; }
    var d = new Date(), pad = function (x) { return ('' + x).padStart(2, '0'); };
    var stamp = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes());
    var payload = { generated: d.toISOString(), origin: 'tools-grabber', source_host: location.host, count: items.length, items: items };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var u = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = u; a.download = 'cue-' + stamp + '.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(u);
  }
})();
