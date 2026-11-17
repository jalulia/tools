// measures the inks of a layered plate (SVG keylines, shared screens and filters, canvas layers, HTML type) for lc_wire.py
// usage: node layer-inks.mjs PL-97,PL-98  → merges into layer-inks.json { code: { inks: [hex…], ground } }
import { serve } from '../../../scripts/census-lib.mjs';
import { chromium } from 'playwright';
import fs from 'node:fs';
const ROOT = new URL('../../../', import.meta.url).pathname.replace(/\/$/, '');
const OUT = new URL('./layer-inks.json', import.meta.url).pathname;
const { base, close } = await serve(ROOT);
const codes = process.argv[2].split(',');
const C = JSON.parse(fs.readFileSync(ROOT + '/techniques-templates/_build/plates.json')).plates.filter((p) => codes.includes(p.code));
const b = await chromium.launch(); const out = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT)) : {};
for (const p of C) {
  const l = Object.values(p.lift)[0];
  const pg = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  try {
    await pg.goto(base + l.rt.replace(/^\/tools/, ''), { waitUntil: 'load', timeout: 25000 }); await pg.waitForTimeout(2500);
    out[p.code] = await pg.evaluate((sel) => {
      const el = document.querySelector(sel); if (!el) return { err: 'not found' };
      const root = el.closest('.plate') || el.parentElement || el, W = {}, hex = (v) => { const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(v || ''); if (m) return m[4] != null && +m[4] < .05 ? null : '#' + [m[1], m[2], m[3]].map((x) => ('0' + (+x | 0).toString(16)).slice(-2)).join(''); return /^#[0-9a-f]{6}$/i.test(v || '') ? v.toLowerCase() : null; };
      const add = (h, w) => { if (h) W[h] = (W[h] || 0) + w; };
      const seen = {};
      const pull = (node) => { const s = new XMLSerializer().serializeToString(node); for (const m of s.matchAll(/url\(["']?[^"')#]*#([^"')]+)["']?\)|href="#([^"]+)"/g)) { const id = m[1] || m[2]; if (seen[id]) continue; seen[id] = 1; const d = document.getElementById(id); if (!d || root.contains(d)) continue; for (const e of [d, ...d.querySelectorAll('*')]) for (const a of ['fill', 'stroke', 'stop-color', 'flood-color']) add(hex(e.getAttribute(a)), 40); pull(d); } };
      root.querySelectorAll('svg *').forEach((n) => { if (!/^(path|rect|circle|ellipse|polygon|polyline|line|text|tspan|use)$/.test(n.tagName.toLowerCase()) || n.closest('defs,pattern,mask,clipPath,filter,marker,symbol')) return; const cs = getComputedStyle(n); let a = 1; try { const bb = n.getBBox(); a = Math.max(1, Math.sqrt(bb.width * bb.height)); } catch (e) {} add(hex(cs.fill), a); add(hex(cs.stroke), a * .5); add(hex(cs.stopColor), 20); });
      root.querySelectorAll('svg').forEach(pull);
      root.querySelectorAll('*').forEach((n) => { if ([...n.childNodes].some((c) => c.nodeType === 3 && c.nodeValue.trim())) add(hex(getComputedStyle(n).color), 30); });
      const bg = hex(getComputedStyle(root).backgroundColor);
      const inks = Object.entries(W).sort((a, b2) => b2[1] - a[1]).map((e) => e[0]).filter((h, i, A) => A.indexOf(h) === i).slice(0, 8);
      return { inks: bg && !inks.includes(bg) ? [bg].concat(inks.slice(0, 7)) : inks, ground: bg || '#ffffff' };
    }, l.sel);
  } catch (e) { out[p.code] = { err: String(e).slice(0, 120) }; }
  console.log(p.code, JSON.stringify(out[p.code]));
  await pg.close();
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
await b.close(); close();
