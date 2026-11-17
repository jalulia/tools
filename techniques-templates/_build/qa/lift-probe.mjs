// probes each candidate plate's source figure: what it draws with (lines, marks, alpha, type), which colors, whether it moves
import { serve } from '../../../scripts/census-lib.mjs';
import { chromium } from 'playwright';
import fs from 'node:fs';
const ROOT = new URL('../../../', import.meta.url).pathname.replace(/\/$/, '');
const { base, close } = await serve(ROOT);
const HEADJS = fs.readFileSync(new URL('./lc-head.js', import.meta.url), 'utf8');
const codes = process.argv[2].split(',');
const C = JSON.parse(fs.readFileSync(ROOT + '/techniques-templates/_build/plates.json')).plates.filter((p) => codes.includes(p.code));
const b = await chromium.launch(); const out = {};
for (const p of C) {
  const l = Object.values(p.lift)[0];
  const pg = await b.newPage({ viewport: { width: 1440, height: 1000 } }); if (process.env.REAL) await pg.addInitScript('window.__REAL=1'); await pg.addInitScript(HEADJS);
  try {
    await pg.goto(base + l.rt.replace(/^\/tools/, '') + (l.sid ? '#' + l.sid : ''), { waitUntil: 'load', timeout: 25000 }); if (process.env.REAL) await pg.waitForTimeout(3000);
    const r = await pg.evaluate(async (sel) => {
      const W = window, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      let el = null; for (let k = 0; k < 60 && !el; k++) { el = document.querySelector(sel); if (!el) await sleep(100); }
      if (!el) return { err: 'not found' };
      el.scrollIntoView({ block: 'center' }); await sleep(200);
      
      for (let i = 0; i < 62; i++) { W.__step(1 / 30); if (i % 20 === 0) await sleep(0); }
      const isSvg = el.tagName.toLowerCase() === 'svg';
      const snap = () => isSvg ? new XMLSerializer().serializeToString(el).length + ':' + el.innerHTML.slice(0, 2000) : el.toDataURL();
      const a = snap(); const own = W.__UC.get(el) || { lw: 0, mark: 0, al: 0, font: 0, img: 0, col: {} }, off = W.__UO; const U = { own: JSON.parse(JSON.stringify(own)), off: JSON.parse(JSON.stringify(off)) };
      for (let i = 0; i < 30; i++) W.__step(1 / 30);
      const moved = snap() !== a;
      let blank = false; if (!isSvg) { const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d'); x.drawImage(el, 0, 0, 64, 64); const d = x.getImageData(0, 0, 64, 64).data; let mn = 255, mx = 0; for (let i = 0; i < d.length; i += 4) { const v = d[i] + d[i + 1] + d[i + 2] + d[i + 3]; mn = Math.min(mn, v); mx = Math.max(mx, v); } blank = mx - mn < 8; }
      let svg = null; if (isSvg) { const cols = {}; let stroke = 0, text = 0; [el, ...el.querySelectorAll('*')].forEach((n) => { const cs = getComputedStyle(n); ['fill', 'stroke'].forEach((k) => { const v = cs.getPropertyValue(k); const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(v); if (m && !(k === 'stroke' && cs.strokeWidth === '0px')) { const hx = '#' + [m[1], m[2], m[3]].map((x) => ('0' + (+x | 0).toString(16)).slice(-2)).join(''); cols[hx] = (cols[hx] || 0) + 1; } }); if (cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0 && n.tagName !== 'svg' && n.tagName !== 'g') stroke++; if (n.tagName === 'text' || n.tagName === 'tspan') text++; }); svg = { cols, stroke, text }; }
      // the page ground behind the figure
      let g = null; for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const bc = getComputedStyle(n).backgroundColor; const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(bc); if (m && (m[4] == null || +m[4] > .5)) { g = '#' + [m[1], m[2], m[3]].map((x) => ('0' + (+x | 0).toString(16)).slice(-2)).join(''); break; } }
      const rc = el.getBoundingClientRect();
      return { tag: el.tagName.toLowerCase(), U, moved, blank, svg, ground: g, w: Math.round(rc.width), h: Math.round(rc.height) };
    }, l.sel);
    out[p.code] = r;
  } catch (e) { out[p.code] = { err: e.message.slice(0, 100) }; }
  await pg.close();
}
await b.close(); close();
{ const f = new URL('./lift-probe.json', import.meta.url), prev = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)) : {}; fs.writeFileSync(f, JSON.stringify(Object.assign(prev, out), null, 1)); }
for (const [k, r] of Object.entries(out)) console.log(k, r.err || `${r.tag} own lw${r.U.own.lw} mark${r.U.own.mark} al${r.U.own.al} font${r.U.own.font} img${r.U.own.img} cols${Object.keys(r.U.own.col).length} | off lw${r.U.off.lw} mark${r.U.off.mark} al${r.U.off.al} font${r.U.off.font} cols${Object.keys(r.U.off.col).length} moved${r.moved} blank${r.blank} ${r.svg ? 'svg stroke' + r.svg.stroke + ' text' + r.svg.text + ' cols' + Object.keys(r.svg.cols).length : ''} ground ${r.ground} ${r.w}x${r.h}`);
