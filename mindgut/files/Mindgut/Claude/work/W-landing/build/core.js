(() => {
'use strict';
/* Measured constants */
const TURN = 42, WMIN = 4, WMAX = 7, RENEW = 21, BASE_STRANDS = 1183, E0 = [.282, .394, .324], CHN = ['147', '258', '369'], EFFORT = ['Low', 'Med', 'High', 'Extra', 'Max'];
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)], TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v, esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mul = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const h2 = (a, b) => { let h = Math.imul(a, 374761393) + Math.imul(b, 668265263) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };

/* ── the codec: a–z → 1..26, digits 1–9, digital root, residue mod 3 → channel. The record keeps these counts, never the words. ── */
const valOf = ch => { const q = ch.toLowerCase().charCodeAt(0); return q >= 97 && q <= 122 ? q - 96 : q >= 49 && q <= 57 ? q - 48 : 0; };
const rootOf = v => v ? 1 + (v - 1) % 9 : 0, chanOf = v => v % 3 === 1 ? 0 : v % 3 === 2 ? 1 : 2;
function scan(t) { const roots = [...t].map(valOf).filter(Boolean).map(rootOf), c = [0, 0, 0]; roots.forEach(r => c[chanOf(r)]++); const n = roots.length || 1; return { n: roots.length, roots, f: c.map(v => v / n), text: t }; }
const dist = (a, b) => Math.hypot(a.f[0] - b.f[0], a.f[1] - b.f[1], a.f[2] - b.f[2]);
/* simulated earlier record: 126 strands of counts only (no text ever existed for them) */
const R = mul(1231), REC = [];
for (let k = 0; k < 126; k++) { const ses = Math.floor(k / 14), p = E0.map((v, j) => Math.max(.06, v + (h2(ses, j) - .5) * .12 + (R() - .5) * .1)), s = p[0] + p[1] + p[2], n = 14 + (R() * R() * 70 | 0), roots = [], c = [0, 0, 0];
  for (let j = 0; j < n; j++) { const u = R() * s, q = u < p[0] ? 0 : u < p[0] + p[1] ? 1 : 2; c[q]++; roots.push([1, 4, 7][R() * 3 | 0] + q); } REC.push({ n, roots, f: c.map(v => v / n), text: null }); }
const SEED = [['Then Saturday it is.', 'Saturday. I will hold the morning.'], ['Send it when it reads right.', 'It reads long. Cutting the second paragraph.'], ['Add the meeting point.', 'Added: the north gate, ten o\'clock.'],
  ['Where did we land on the listening night?', 'We kept it free. The venue closes at eight, so the walk moved to Saturday.'], ['Good. Draft the note to the group, and attach the map.', 'Drafted, 74 words, map attached. It is in Output.']];
const REPLY = ['Held. It is in the record now.', 'Then we begin where it still holds.', 'Noted. I will carry it forward.'];
const S = { W: [], sel: 0, effort: 2, recall: false, light: 'here', sent: 13, fresh: false, exhale: false, heat: .7, tens: 7 };
const push = (a, b) => { const A = scan(a), B = scan(b); REC.push(A, B); S.W.push({ a, b, A, B, ia: REC.length - 2 }); };
SEED.forEach(([a, b]) => push(a, b)); S.W = S.W.slice(-4); S.sel = S.W.length - 1;
const subs = [], notify = why => subs.forEach(f => f(why));
const M = { TURN, WMAX, RENEW, EFFORT, CHN, S, REC, scan, dist, esc, clamp, $, $$, h2, TAU, rootOf, chanOf, valOf,
  on: f => subs.push(f), N: () => BASE_STRANDS + REC.length, no: i => BASE_STRANDS + i + 1,
  cur: () => S.W[clamp(S.sel, 0, Math.max(0, S.W.length - 1))], clash: x => dist(x.A, x.B),
  recall() { if (!S.W.length) return []; const top = S.W[S.W.length - 1].ia, t = REC[top], lim = S.W[0].ia, a = []; for (let k = 1; k < lim; k++) a.push([dist(REC[k], t), k]); a.sort((p, q) => p[0] - q[0]); return [{ k: 0, kind: 'origin' }, ...a.slice(0, 3).map(q => ({ k: q[1], kind: 'near' })), ...a.slice(-3).map(q => ({ k: q[1], kind: 'far' }))]; },
  say(text) { const t = (text || '').trim(); if (!scan(t).n) return false; if (S.exhale) { S.W.splice(0, 3); S.exhale = false; }
    push(t, REPLY[S.sent % 3]); S.sent++; S.sel = S.W.length - 1; S.light = 'working'; S.fresh = true; S.heat = clamp(.35 + M.clash(M.cur()) * 2.2, .1, 1); notify('say');
    setTimeout(() => { S.light = 'here'; S.fresh = false; notify('light'); }, 900);
    if (S.W.length >= WMAX) { S.exhale = true; setTimeout(() => { if (S.exhale) { S.W.splice(0, 3); S.exhale = false; S.sel = S.W.length - 1; notify('exhale'); } }, 2600); } return true; },
  set(k, v) { if (k === 'window') { const want = clamp(+v, 1, WMAX); while (S.W.length > want) S.W.shift(); let i = 0; while (S.W.length < want && i < 9) { const s = SEED[(S.W.length + i++) % SEED.length]; const A = scan(s[0]), B = scan(s[1]); REC.push(A, B); S.W.unshift({ a: s[0], b: s[1], A, B, ia: REC.length - 2 }); } S.W.forEach((x, j) => { x.ia = REC.length - 2 * (S.W.length - j); REC[x.ia] = x.A; REC[x.ia + 1] = x.B; }); S.exhale = false; S.sel = S.W.length - 1; } else if (k === 'empty') { S.W = []; S.sel = 0; S.exhale = false; } else S[k] = v; notify(k); } };
window.MG = M;
/* delegated actions: any [data-act] sets shared state; any form[data-say] sends a line */
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act, v = b.dataset.v; if (a === 'sel') M.set('sel', +v); else if (a === 'effort') M.set('effort', +v); else if (a === 'recall') M.set('recall', v === undefined ? !S.recall : v === '1'); else if (a === 'light') M.set('light', v); else if (a === 'window') M.set('window', v); else if (a === 'empty') M.set('empty'); else if (a === 'refill') M.set('window', 4); });
document.addEventListener('submit', e => { const f = e.target.closest('form[data-say]'); if (!f) return; e.preventDefault(); const i = $('input', f); if (M.say(i.value)) i.value = ''; else i.focus(); });

/* ═════ 1 · Opening: the record as counted digits (after board I, pin 001). The wordmark is the supplied artwork used as a density mask; it is never retyped. ═════ */
(function hero() { const cv = $('#hero-cv'), x = cv.getContext('2d'), CW = 13, CH = 19; let cols = 0, rows = 0, mask = null, dpr = 1, stream = [], pulse = -1e9, px = -999, py = -999, hc = -1, vis = true;
  const build = () => { stream = []; REC.forEach(s => s.roots.forEach(r => stream.push(r))); };
  const fit = () => { const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); cols = Math.ceil(r.width / CW); rows = Math.ceil(r.height / CH);
    const m = document.createElement('canvas'); m.width = cols; m.height = rows; const g = m.getContext('2d'), im = $('#wm-src'); if (im.naturalWidth) { const w = cols * .86, h = w * im.naturalHeight / im.naturalWidth * (CW / CH); g.drawImage(im, (cols - w) / 2, (rows - h) * .4, w, h); }
    const d = g.getImageData(0, 0, cols, rows).data; mask = new Uint8Array(cols * rows); for (let i = 0; i < mask.length; i++) mask[i] = d[i * 4 + 3] > 90 ? 1 : 0; };
  const draw = now => { requestAnimationFrame(draw); if (!vis || !mask) return; const t = now / 1000, w = cv.width / dpr, h = cv.height / dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = '#1f4fd1'; x.fillRect(0, 0, w, h); x.textAlign = 'center'; x.textBaseline = 'middle';
    const L = stream.length, off = L - cols * rows, pr = (now - pulse) * .55; hc = -1; if (px > 0) { const i = Math.floor(px / CW), j = Math.floor(py / CH); if (i >= 0 && j >= 0 && i < cols && j < rows) hc = M.chanOf(stream[((off + j * cols + i) % L + L) % L]); }
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const d = stream[((off + j * cols + i) % L + L) % L], c = M.chanOf(d), cx = i * CW + CW / 2, cy = j * CH + CH / 2, inm = mask[j * cols + i];
      const band = ((Math.floor((i * .5 + Math.abs(j - rows * .5) * 1.6 + Math.sin(j * .31) * 2.5 - t * 1.4) / 5) % 3) + 3) % 3, ring = Math.abs(Math.hypot(cx - w * .5, cy - h) - pr) < 26;
      let a = inm ? 1 : c === band ? .5 : .13; if (hc >= 0 && !inm) a = c === hc ? .95 : .08; x.font = (inm ? '700 ' : '400 ') + '13px "JetBrains Mono", monospace'; x.fillStyle = ring ? '#c8f04a' : inm ? '#fff' : `rgba(255,255,255,${a})`; x.fillText(d, cx, cy); } };
  cv.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; }); cv.addEventListener('pointerleave', () => { px = -999; });
  new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(cv); addEventListener('resize', fit); M.on(why => { if (why === 'say') { build(); pulse = performance.now(); } });
  build(); const im = $('#wm-src'); (im.complete ? Promise.resolve() : new Promise(r => im.onload = r)).then(() => (document.fonts ? document.fonts.ready : Promise.resolve())).then(() => { fit(); requestAnimationFrame(draw); }); })();

/* ═════ 3 · The workings: an exploded isometric drawing of one exchange passing through Mindgut (after board I · The workings). ═════ */
(function workings() { const el = $('#wk-svg'), cap = $('#wk-cap'), tabs = $('#wk-tabs'); let step = 0;
  const s = 34, cx = 430, cy = 96, P = (X, Y, Z) => [cx + (X - Y) * .866 * s, cy + (X + Y) * .5 * s - Z * s], pt = (X, Y, Z) => P(X, Y, Z).map(v => v.toFixed(1)).join(','), Zs = [17.4, 11.6, 5.8, 0], PW = 8, PD = 4.2;
  const plate = (z, k) => `<polygon class="pl${step === k ? ' on' : ''}" points="${pt(0, 0, z)} ${pt(PW, 0, z)} ${pt(PW, PD, z)} ${pt(0, PD, z)}"/>`;
  const box = (X, Y, w, d, z, hh, cl) => `<g class="${cl}"><polygon points="${pt(X, Y + d, z)} ${pt(X + w, Y + d, z)} ${pt(X + w, Y + d, z + hh)} ${pt(X, Y + d, z + hh)}" class="f1"/><polygon points="${pt(X + w, Y, z)} ${pt(X + w, Y + d, z)} ${pt(X + w, Y + d, z + hh)} ${pt(X + w, Y, z + hh)}" class="f2"/><polygon points="${pt(X, Y, z + hh)} ${pt(X + w, Y, z + hh)} ${pt(X + w, Y + d, z + hh)} ${pt(X, Y + d, z + hh)}" class="f0"/></g>`;
  const lab = (k, z, a, b) => { const [lx, ly] = P(PW, 0, z); return `<g class="lb${step === k ? ' on' : ''}"><path d="M${lx + 6} ${ly}H${lx + 150}"/><circle cx="${lx + 6}" cy="${ly}" r="2.2"/><text x="${lx + 158}" y="${ly - 4}" class="n">0${k + 1}</text><text x="${lx + 184}" y="${ly - 4}" class="a">${a}</text><text x="${lx + 184}" y="${ly + 13}" class="b">${b}</text></g>`; };
  const TXT = [['Say', 'The window', 'The last four to seven exchanges stay as words. This is all the model is working with, and it is the only place your words are kept.'], ['Count', 'The scanner', 'Each letter becomes a number, each number a single digit, each digit one of three channels. What leaves the window is these counts.'],
    ['Keep', 'The Helix', 'Counts are kept as strands, yours and Mir\'s in turn, 42 to a full turn. The record grows by two strands an exchange and is never redrawn.'], ['Reach back', 'Recall', 'From the newest strand, a reach back into the record: the first strand, the three most like it, the three least. The rule drawn here is a stand-in for the page.']];
  function draw() { const W = S.W, c = M.cur(), f = c ? c.A.f : E0, N = M.N(), rec = M.recall(); let o = '';
    for (let k = 0; k < 3; k++) { const a = P(PW / 2, PD / 2, Zs[k]), b = P(PW / 2, PD / 2, Zs[k + 1]); o += `<path class="ax" d="M${a[0]} ${a[1] + 10}V${b[1] - 4}"/>`; }
    o += plate(Zs[3], 3); rec.forEach((r, i) => { const X = .8 + i * 1.07, [qx, qy] = P(X, PD / 2, Zs[3]); o += `<circle class="rc ${r.kind}" cx="${qx}" cy="${qy}" r="${r.kind === 'origin' ? 6 : 4.2}"/>`; });
    o += plate(Zs[2], 2); let ring = ''; for (let i = 0; i < TURN; i++) { const a = TAU * i / TURN, r0 = i % 7 ? 1.56 : 1.4, A = P(PW / 2 + Math.cos(a) * r0, PD / 2 + Math.sin(a) * r0, Zs[2]), B = P(PW / 2 + Math.cos(a) * 1.8, PD / 2 + Math.sin(a) * 1.8, Zs[2]); ring += `M${A[0].toFixed(1)} ${A[1].toFixed(1)}L${B[0].toFixed(1)} ${B[1].toFixed(1)}`; }
    const ma = TAU * (N % TURN) / TURN, mp = P(PW / 2 + Math.cos(ma) * 1.8, PD / 2 + Math.sin(ma) * 1.8, Zs[2]); o += `<path class="tk" d="${ring}"/><circle class="now" cx="${mp[0]}" cy="${mp[1]}" r="4.5"/>`;
    o += plate(Zs[1], 1); f.forEach((v, i) => { o += box(1.2 + i * 2.1, 1.3, 1.4, 1.6, Zs[1], .25 + v * 3.2, 'bin c' + i); const [tx, ty] = P(1.9 + i * 2.1, 2.1, Zs[1] + .25 + v * 3.2); o += `<text class="bv" x="${tx}" y="${ty - 7}">${v.toFixed(2)}</text>`; });
    o += plate(Zs[0], 0); for (let i = 0; i < WMAX; i++) o += box(.45 + i * 1.03, .9, .8, 2.4, Zs[0], i < W.length ? .5 : .06, 'slot' + (i < W.length ? ' in' : '') + (i === S.sel && W.length ? ' sel' : ''));
    o += lab(0, Zs[0], 'WINDOW', `${W.length} of ${WMAX} exchanges, as words`) + lab(1, Zs[1], 'SCANNER', `${CHN.map((n, i) => n + ' ' + f[i].toFixed(2)).join('  ')}`) + lab(2, Zs[2], 'HELIX', `strand ${N} · ${N % TURN || TURN} of ${TURN} in turn ${Math.ceil(N / TURN)}`) + lab(3, Zs[3], 'RECALL', '1 origin · 3 near · 3 far (stand-in)');
    const d0 = P(-.6, PD, Zs[0]), d1 = P(-.6, PD, Zs[3]); o += `<g class="dim"><path d="M${d0[0]} ${d0[1]}V${d1[1]}M${d0[0] - 5} ${d0[1]}h10M${d0[0] - 5} ${d1[1]}h10"/><text x="${d0[0] - 10}" y="${(d0[1] + d1[1]) / 2}" transform="rotate(-90 ${d0[0] - 10} ${(d0[1] + d1[1]) / 2})">one exchange, top to bottom</text></g>`;
    el.innerHTML = o; el.dataset.step = step; cap.innerHTML = `<span class="mono">0${step + 1} / ${TXT[step][1]}</span><p>${TXT[step][2]}</p>`; $$('button', tabs).forEach((b, i) => b.setAttribute('aria-pressed', i === step)); }
  tabs.innerHTML = TXT.map((t, i) => `<button type="button" data-k="${i}"><b>0${i + 1}</b>${t[0]}</button>`).join(''); tabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { step = +b.dataset.k; draw(); } }); M.on(draw); draw(); })();

/* ═════ 4 · States: one tile, many fills (after board III · One silhouette, many fills, and II · labeled light kept inside a frame). ═════ */
(function states() { const el = $('#st-grid'), read = $('#st-read');
  const tile = (act, v, on, name, body, cls = '') => `<button type="button" class="tile ${cls}${on ? ' on' : ''}" data-act="${act}" data-v="${v}" aria-pressed="${on}"><span class="fill">${body}</span><span class="nm">${name}</span></button>`;
  function draw() { const n = S.W.length, L = { here: 'Here', working: 'Working', failed: 'Didn\'t make it in' };
    el.innerHTML = `<div class="grp"><span class="mono">Light</span><div class="row">${Object.keys(L).map(k => tile('light', k, S.light === k, L[k], `<i class="glow ${k}"></i>`, 'lite')).join('')}</div></div>
      <div class="grp"><span class="mono">Window</span><div class="row">${[4, 5, 6, 7].map(k => tile('window', k, n === k, k + ' exchanges', [...Array(7)].map((_, i) => `<i class="bar${i < k ? ' in' : ''}"></i>`).join(''), 'wn')).join('')}${tile('empty', 0, n === 0, 'Empty', '<i class="none"></i>', 'wn')}</div></div>
      <div class="grp"><span class="mono">Effort</span><div class="row">${EFFORT.map((e, i) => tile('effort', i, S.effort === i, e, `<i class="trk"></i><i class="knob" style="bottom:${12 + i * 17}%"></i>`, 'ef')).join('')}</div></div>
      <div class="grp"><span class="mono">Recall</span><div class="row">${tile('recall', 0, !S.recall, 'Resting', '<i class="rdot"></i>', 'rc')}${tile('recall', 1, S.recall, 'Reaching back', '<i class="rdot"></i><i class="rl a"></i><i class="rl b"></i><i class="rl c"></i>', 'rc out')}</div></div>`;
    $$('.rc', el).forEach((b, i) => { b.classList.toggle('on', (i === 1) === S.recall); });
    read.innerHTML = [['Light', L[S.light]], ['Window', n ? `${n} of ${WMAX}` : 'empty'], ['Effort', EFFORT[S.effort]], ['Breath', `${S.sent % RENEW || RENEW} of ${RENEW}`], ['Recall', S.recall ? 'reaching back' : 'resting']].map(([a, b]) => `<span><em>${a}</em><b>${esc(b)}</b></span>`).join(''); }
  M.on(draw); draw(); })();
})();
