/* lift.js · Techniques & Templates · ø co.
   Runs inside a plate's live layer. Each .cell holds one figure lifted from its source page: the page loads in a
   same-origin iframe at the width it was measured at (1440), is brought to the figure (slide, tab, scroll), and the
   iframe is scaled and moved so only the figure shows. The figure keeps its own code: animation, hover, drag, clicks.
   data-l on a cell: { rt: source URL, sel: CSS path to the element, slide, sid, tab, crop: [x0,y0,x1,y1] of the element,
   w, h: the element's size at 1440 }. The filed still sits under the iframe until the figure is placed. */
(function () {
  'use strict';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const shown = (w, el) => { const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.right < 0 || r.left > w.innerWidth) return false;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const s = w.getComputedStyle(n); if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity < 0.05) return false; } return true; };
  document.querySelectorAll('.cell').forEach(setup);

  function setup(cell) {
    const f = cell.querySelector('iframe'); const L = JSON.parse(cell.dataset.l || '{}');
    /* a window cut to the figure's own rect: nothing around the figure on its page shows */
    const win = document.createElement('div'); win.className = 'win'; cell.insertBefore(win, f); win.appendChild(f);
    let w = null, d = null, el = null, placed = false;
    f.addEventListener('load', async () => {
      try { w = f.contentWindow; d = f.contentDocument; } catch (e) { return fail('cross-origin'); }
      if (!d || !d.body) return fail('no document');
      const st = d.createElement('style');
      st.textContent = 'html,body{scrollbar-width:none!important;overscroll-behavior:none}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}';
      (d.head || d.documentElement).appendChild(st);
      await sleep(400);
      // a figure behind a tab: open the tab first
      if (L.tab) { const b = [...d.querySelectorAll('button,a,[role=tab]')].find((e) => e.textContent.trim().replace(/^\d+/, '').startsWith(L.tab) && e.textContent.trim().length < 60); if (b) { b.click(); await sleep(1200); } }
      for (let k = 0; k < 80 && !el; k++) { el = d.querySelector(L.sel); if (!el) await sleep(100); }
      if (!el) return fail('figure not found');
      // a figure on a slide: bring the slide forward
      if (L.slide >= 0 && !shown(w, el)) {
        if (L.sid) { try { w.location.hash = '#' + L.sid; } catch (e) {} await sleep(500); }
        for (let k = 0; k < 40 && !shown(w, el); k++) { const ev = { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, which: 39, bubbles: true }; d.dispatchEvent(new w.KeyboardEvent('keydown', ev)); /* bubbles to window: one step per press */ await sleep(260); }
      }
      // page chrome that floats over everything (fixed or sticky) is hidden, unless it is the figure or holds it
      for (const n of d.body.querySelectorAll('*')) { const p = w.getComputedStyle(n).position; if ((p === 'fixed' || p === 'sticky') && !n.contains(el) && !el.contains(n)) n.style.setProperty('visibility', 'hidden', 'important'); }
      // the figure's links do not navigate the plate away; the wheel scrolls the page, not the source
      d.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a[href]'); if (a && !el.contains(a)) e.preventDefault(); else if (a && a.getAttribute('href') && !a.getAttribute('href').startsWith('#')) e.preventDefault(); }, true);
      w.addEventListener('wheel', (e) => { e.preventDefault(); try { window.parent.scrollBy(0, e.deltaY); } catch (_) {} }, { passive: false });
      place(); setTimeout(place, 500); setTimeout(() => { place(); cell.classList.add('on'); }, 900);
      try { new w.ResizeObserver(() => place()).observe(el); } catch (e) {}
      setInterval(place, 1500);
    });
    function place() {
      if (!el) return; let r = el.getBoundingClientRect(); const vh = w.innerHeight;
      const c = L.crop || [0, 0, 1, 1];
      const top = r.top + r.height * c[1], bot = r.top + r.height * c[3];
      if (top < 0 || bot > vh) { w.scrollTo(0, w.scrollY + top - Math.max(0, (vh - (bot - top)) / 2)); r = el.getBoundingClientRect(); }
      const x0 = r.left + r.width * c[0], y0 = r.top + r.height * c[1], rw = r.width * (c[2] - c[0]), rh = r.height * (c[3] - c[1]);
      if (rw < 2 || rh < 2) return;
      const cw = cell.clientWidth, ch = cell.clientHeight, s = Math.min(cw / rw, ch / rh), ww = rw * s, wh = rh * s;
      Object.assign(win.style, { left: (cw - ww) / 2 + 'px', top: (ch - wh) / 2 + 'px', width: ww + 'px', height: wh + 'px' });
      f.style.transform = `translate(${-x0 * s}px,${-y0 * s}px) scale(${s})`;
      placed = true;
    }
    function fail(why) { cell.classList.add('still'); cell.title = 'Still: ' + why; f.remove(); }
    addEventListener('resize', () => place());
    setTimeout(() => { if (!placed) fail('source did not load in time'); }, 20000);
  }
})();
