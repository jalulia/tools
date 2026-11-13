/* ===== page: one instrument per plate ===== */
(function () {
  const $ = (t, a, kids) => { const e = document.createElement(t); if (a) for (const k in a) { if (k === "text") e.textContent = a[k]; else if (k === "cls") e.className = a[k]; else e.setAttribute(k, a[k]); } (kids || []).forEach(c => e.appendChild(c)); return e; };
  const defaults = pl => { const P = {}; (pl.params || []).forEach(p => P[p.key] = p.def); (pl.texts || []).forEach(p => P[p.key] = p.def); (pl.selects || []).forEach(p => P[p.key] = p.def); return P; };
  const fmt = (v, p) => { const dec = p.step >= 1 ? 0 : p.step >= .1 ? 1 : p.step >= .01 ? 2 : 3; return (+v).toFixed(dec) + (p.unit ? " " + p.unit : ""); };
  const pct = v => (v * 100).toFixed(1) + "%";
  const ST = {};
  function paint(pl, quick) {
    const st = ST[pl.id], cw = st.frame.clientWidth || Math.min(620, (window.innerWidth || 800) - 48), dpr = Math.min(2, window.devicePixelRatio || 1);
    let sc = Math.min(cw * dpr / pl.ref.w, 1600 / pl.ref.w, 1.6); if (quick) sc *= .5;
    try { pl.render(st.cv, st.P, st.pal, sc); st.msg.textContent = ""; } catch (e) { st.msg.textContent = "Render failed: " + e.message; }
  }
  function schedule(pl, quick) { const st = ST[pl.id]; st.want = quick ? (st.want === "full" ? "full" : "quick") : "full"; if (st.raf) return; st.raf = requestAnimationFrame(() => { st.raf = 0; const w = st.want; st.want = null; paint(pl, w === "quick"); }); }
  function specOf(pl) { const st = ST[pl.id]; return { plate: pl.no + " " + pl.title, source: pl.source, summary: pl.line, canvas_px: [pl.ref.w, pl.ref.h], pass_order: pl.passes, measured: pl.measured, palette: { id: st.pal.id, name: st.pal.name, values: st.pal.c || st.pal.ramp || { k: st.pal.k, kb: st.pal.kb, pw: st.pal.pw, floor: st.pal.floor } }, palettes_available: pl.palettes.map(p => p.id), text: Object.fromEntries((pl.texts || []).map(t => [t.key, st.P[t.key]])), select: Object.fromEntries((pl.selects || []).map(t => [t.key, st.P[t.key]])), params: Object.fromEntries(pl.params.map(p => [p.key, { value: st.P[p.key], default: p.def, range: [p.min, p.max], step: p.step, unit: p.unit || null, group: p.group, does: p.why }])), benchmark: st.bench ? { mean: +st.bench.mean.toFixed(4), lowest: +st.bench.min.toFixed(4), metrics: st.bench.rows.map(r => ({ patch: r.patch, metric: r.metric, score: +r.v.toFixed(4) })) } : null, benchmark_setup: { palette: pl.bench.palette, overrides: pl.bench.params, note: pl.bench.note || null, patches: pl.bench.items.map(i => ({ name: i.name, reference_rect: i.ref, render_rect: i.out, metrics: i.m })) }, limits: pl.limits }; }
  function refreshSpec(pl) { const st = ST[pl.id]; if (st.pre) st.pre.textContent = JSON.stringify(specOf(pl), null, 1); }
  function runBench(pl) {
    const st = ST[pl.id], c = mk(4, 4), P = Object.assign(defaults(pl), pl.bench.params || {}), pal = pl.palettes.find(p => p.id === pl.bench.palette);
    pl.render(c, P, pal, 1); const img = c.getContext("2d").getImageData(0, 0, c.width, c.height), s = MX.score(img, pl.bench, REFSTATS[pl.id]); st.bench = s;
    st.score.textContent = "match " + pct(s.mean) + " · lowest " + pct(s.min); st.score.className = "score " + (s.mean >= .97 ? "ok" : "low");
    const tb = st.tbody; tb.textContent = ""; s.rows.forEach(r => { const tr = $("tr", r.v < .97 ? { cls: "low" } : null, [$("td", { text: r.patch }), $("td", { text: r.metric }), $("td", { cls: "n" })]); const bar = $("span", { cls: "bar" }); bar.style.width = Math.max(2, Math.round(r.v * 60)) + "px"; tr.lastChild.appendChild(bar); tr.lastChild.appendChild(document.createTextNode(pct(r.v))); tb.appendChild(tr); });
    st.bsum.textContent = `${s.rows.length} metrics over ${pl.bench.items.length} patches. Mean ${pct(s.mean)}, lowest ${pct(s.min)}, ${s.rows.filter(r => r.v >= .97).length} at or above 97%.`; refreshSpec(pl);
  }
  function build(pl) {
    const st = ST[pl.id] = { P: defaults(pl), pal: pl.palettes.find(p => p.id === pl.bench.palette) || pl.palettes[0], inputs: {} };
    const cv = st.cv = $("canvas", { role: "img", "aria-label": pl.title + ", generated plate" }); cv.getContext("2d", { willReadFrequently: true });
    const frame = st.frame = $("div", { cls: "frame" }, [cv]); frame.style.maxWidth = Math.round(pl.ref.w * Math.min(1, 760 / pl.ref.h)) + "px"; cv.style.aspectRatio = pl.ref.w + " / " + pl.ref.h;
    st.score = $("span", { cls: "score", text: "match: not run yet" }); st.msg = $("div", { cls: "msg", role: "status" });
    const ctl = $("div", { cls: "ctl" });
    /* palettes */
    const sw = $("div", { cls: "sw" }); pl.palettes.forEach(p => { const b = $("button", { type: "button", "aria-pressed": p === st.pal ? "true" : "false" }, [$("i", null, p.sw.map(c => { const x = $("b"); x.style.background = c; return x; })), $("span", { text: p.name })]); if (p.note) b.appendChild($("small", { text: p.note })); b.addEventListener("click", () => { st.pal = p; sw.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false")); schedule(pl); refreshSpec(pl); }); sw.appendChild(b); });
    ctl.appendChild($("div", { cls: "grp" }, [$("div", { cls: "gl", text: "Color" }), sw]));
    /* text + selects */
    if ((pl.texts || []).length || (pl.selects || []).length) { const g = $("div", { cls: "grp" }, [$("div", { cls: "gl", text: "Content" })]);
      (pl.texts || []).forEach(t => { const id = pl.id + "-" + t.key, i = $("input", { type: "text", id, value: t.def, autocomplete: "off", spellcheck: "false" }); i.addEventListener("input", () => { st.P[t.key] = i.value; schedule(pl); refreshSpec(pl); }); st.inputs[t.key] = { el: i, set: v => { i.value = v; } }; g.appendChild($("div", { cls: "row" }, [$("label", { for: id, text: t.label }), $("span"), i])); });
      (pl.selects || []).forEach(t => { const id = pl.id + "-" + t.key, s = $("select", { id }, t.options.map(o => $("option", { value: o[0], text: o[1] }))); s.value = t.def; s.addEventListener("change", () => { st.P[t.key] = s.value; schedule(pl); refreshSpec(pl); }); st.inputs[t.key] = { el: s, set: v => { s.value = v; } }; g.appendChild($("div", { cls: "row" }, [$("label", { for: id, text: t.label }), $("span"), s])); });
      ctl.appendChild(g); }
    /* presets */
    if ((pl.presets || []).length) { const ch = $("div", { cls: "chips" }); pl.presets.forEach(ps => { const b = $("button", { type: "button", text: ps.name }); b.addEventListener("click", () => { apply(Object.assign(numDefaults(), ps.set)); }); ch.appendChild(b); }); ctl.appendChild($("div", { cls: "grp" }, [$("div", { cls: "gl", text: "Presets" }), ch])); }
    const numDefaults = () => Object.fromEntries(pl.params.map(p => [p.key, p.def]));
    function apply(vals) { for (const k in vals) { st.P[k] = vals[k]; if (st.inputs[k]) st.inputs[k].set(vals[k]); } schedule(pl); refreshSpec(pl); }
    /* sliders by group */
    const groups = []; pl.params.forEach(p => { if (!groups.includes(p.group)) groups.push(p.group); });
    groups.forEach(gn => { const g = $("div", { cls: "grp" }, [$("div", { cls: "gl", text: gn })]); pl.params.filter(p => p.group === gn).forEach(p => { const id = pl.id + "-" + p.key, o = $("output", { for: id, text: fmt(p.def, p) }), i = $("input", { type: "range", id, min: p.min, max: p.max, step: p.step, value: p.def, title: p.why });
      i.addEventListener("input", () => { st.P[p.key] = +i.value; o.textContent = fmt(i.value, p); schedule(pl, true); }); i.addEventListener("change", () => { schedule(pl); refreshSpec(pl); });
      st.inputs[p.key] = { el: i, set: v => { i.value = v; o.textContent = fmt(v, p); } }; g.appendChild($("div", { cls: "row" }, [$("label", { for: id, text: p.label, title: p.why }), o, i])); }); ctl.appendChild(g); });
    /* actions */
    const acts = $("div", { cls: "acts" }), mkb = (t, f) => { const b = $("button", { type: "button", text: t }); b.addEventListener("click", f); acts.appendChild(b); return b; };
    mkb("New seed", () => { const sp = pl.params.find(p => p.key === "seed"); apply({ seed: 1 + Math.floor(Math.random() * (sp.max - 1)) }); });
    mkb("Reset", () => { const d = defaults(pl); apply(d); });
    mkb("Copy spec", () => { const txt = JSON.stringify(specOf(pl), null, 1); const done = ok => { st.msg.textContent = ok ? "Spec copied." : "Copy was blocked. The spec is selected below; copy it from there."; if (!ok) { st.specD.open = true; const r = document.createRange(); r.selectNodeContents(st.pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } }; try { navigator.clipboard.writeText(txt).then(() => done(true), () => done(false)); } catch (e) { done(false); } });
    mkb("Run benchmark", () => { st.msg.textContent = "Measuring…"; setTimeout(() => { try { runBench(pl); st.msg.textContent = "Benchmark done."; st.benchD.open = true; } catch (e) { st.msg.textContent = "Benchmark failed: " + e.message; } }, 30); });
    ctl.appendChild(acts); ctl.appendChild(st.msg);
    /* benchmark + spec */
    st.tbody = $("tbody"); st.bsum = $("p", { cls: "note", text: "Not run yet." });
    st.benchD = $("details", null, [$("summary", { text: "Benchmark against the reference" }), $("div", { cls: "dbody" }, [st.bsum, $("p", { cls: "note", text: "Scored at default parameters in the measured palette. Each row measures the same statistic on a patch of the reference and a patch of the render: tone histogram overlap, mean, contrast, radial power spectrum, autocorrelation, ink color (OKLab distance) and ink coverage." + (pl.bench.note ? " " + pl.bench.note : "") }), $("div", { cls: "tw" }, [$("table", null, [$("thead", null, [$("tr", null, [$("th", { text: "Patch" }), $("th", { text: "Metric" }), $("th", { text: "Match" })])]), st.tbody])]), $("ul", { cls: "lim" }, (pl.limits || []).map(l => $("li", { text: l })))])]);
    st.pre = $("pre", { tabindex: "0" }); st.specD = $("details", null, [$("summary", { text: "Technique spec (JSON, follows the sliders)" }), $("div", { cls: "dbody" }, [st.pre])]);
    const sec = $("section", { cls: "plate", id: "plate-" + pl.no }, [$("div", { cls: "phead" }, [$("span", { cls: "pno", text: "PLATE " + pl.no }), $("h2", { text: pl.title }), $("p", { cls: "pline", text: pl.line }), st.score]), $("div", { cls: "work" }, [$("div", { cls: "stage" }, [frame]), ctl]), st.benchD, st.specD]);
    return sec;
  }
  function start() {
    const host = document.getElementById("plates"), nav = document.getElementById("idx");
    PLATES.forEach(pl => { host.appendChild(build(pl)); nav.appendChild($("a", { href: "#plate-" + pl.no, text: pl.no + " " + pl.title })); refreshSpec(pl); });
    const seen = new Set(), go = pl => { if (seen.has(pl.id)) return; seen.add(pl.id); paint(pl); setTimeout(() => { try { runBench(pl); } catch (e) { ST[pl.id].msg.textContent = "Benchmark failed: " + e.message; } }, 60); };
    if ("IntersectionObserver" in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { go(PLATES.find(p => "plate-" + p.no === e.target.id)); io.unobserve(e.target); } }), { rootMargin: "600px" }); document.querySelectorAll("section.plate").forEach(s => io.observe(s)); go(PLATES[0]); } else PLATES.forEach(go);
    let lw = window.innerWidth, t = 0; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => { if (Math.abs(window.innerWidth - lw) > 70) { lw = window.innerWidth; PLATES.forEach(pl => { if (seen.has(pl.id)) schedule(pl); }); } }, 300); });
    window.__plates = { PLATES, ST, paint, runBench };
  }
  const fonts = ['40px "Archivo Black"', '40px "Anton"', '600 20px "Archivo"', '700 20px "Archivo"'];
  const boot = () => Promise.all(fonts.map(f => document.fonts.load(f).catch(() => 0))).then(start, start);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
