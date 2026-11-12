/* 03 · Rhizome B · "Strata". The record as layers through time, seen in section, like a core sample.
   Each row is a week; each cell is a thing said (you: filled, Mir: ring). Roots drop from a cell to
   the earlier cells it drew on, so the picture is a root system read downward: NOW on top, the
   first week at the bottom. Nothing scrolls. A question arrives at the top; Mir's answer is a
   taproot drawn down through the layers to the decision, a lateral root across to an unlinked
   cell, and a new cell set at the surface. Diagrams + Readouts groups: a section drawing, dense and legible. */
(function(root){
  const { C, SANS, MONO, clamp, seg, eo, ei, eio, ss, rng, bez, partial, stroke, rr, txt, typed, wrap, chrome, grain, robot } = root.MS;
  const W=960, H=540, T=14, FPS=12;
  const X0 = 48, X1 = 600, Y0 = 118, Y1 = 470, ROWS = 12, COLS = 20;   // field: left two-thirds; conversation on the right
  const RH = (Y1 - Y0)/ROWS, CW = (X1 - X0)/COLS;
  const r = rng(31);
  // cells: row 0 = NOW (top), row 11 = week one (bottom). Each row has a handful of cells at random columns.
  const CELLS = [];
  for (let row = ROWS-1; row >= 0; row--){ const n = row === 0 ? 0 : 3 + Math.floor(r()*5); const cols = new Set();
    while (cols.size < n) cols.add(Math.floor(r()*COLS));
    [...cols].sort((a,b)=>a-b).forEach(col => CELLS.push({ i:CELLS.length, row, col, who: r() < .5 ? 'you' : 'mir', roots:[] })); }
  // roots: each cell draws on 1–2 earlier (deeper) cells, usually near in column, sometimes far
  CELLS.forEach(c => { const deeper = CELLS.filter(d => d.row > c.row); if (!deeper.length) return;
    const want = r() < .55 ? 1 : 2;
    for (let k=0;k<want;k++){ const pool = r() < .7 ? deeper.filter(d => Math.abs(d.col - c.col) <= 3 && d.row - c.row <= 4) : deeper;
      const p = (pool.length ? pool : deeper)[Math.floor(r()*(pool.length ? pool : deeper).length)]; if (!c.roots.includes(p.i)) c.roots.push(p.i); } });
  CELLS.forEach(c => c.used = 0); CELLS.forEach(c => c.roots.forEach(p => CELLS[p].used++));
  const cx = c => X0 + (c.col + .5)*CW, cy = c => Y0 + (c.row + .5)*RH;
  // story: decision deep and well-used (rows 8–10); fragment mid (rows 4–6), unused, far in column; new cell row 0
  const DEC = CELLS.filter(c => c.row >= 8 && c.row <= 10).reduce((a,b) => b.used > a.used ? b : a);
  const FRAG = CELLS.filter(c => c.row >= 4 && c.row <= 6 && c.used === 0 && Math.abs(c.col - DEC.col) >= 6)[0] || CELLS.filter(c => c.row === 5)[0];
  // taproot: chain of cells from a row-1 cell down to DEC via roots (BFS over roots)
  function pathTo(from, to){ const prev = {}; const q = [from]; prev[from] = -1;
    while (q.length){ const u = q.shift(); if (u === to) break; CELLS[u].roots.forEach(p => { if (!(p in prev)){ prev[p] = u; q.push(p); } }); }
    if (!(to in prev)) return null; const o = []; let u = to; while (u !== -1){ o.push(u); u = prev[u]; } return o.reverse(); }
  let WALK = null, START = null;
  for (const c of CELLS.filter(c => c.row === 1)){ const w = pathTo(c.i, DEC.i); if (w && w.length >= 4 && (!WALK || w.length > WALK.length)){ WALK = w; START = c; } }
  if (!WALK){ START = CELLS.filter(c => c.row === 1)[0]; WALK = [START.i, DEC.i]; }
  const NEW = { row:0, col: clamp(START.col + 1, 0, COLS-1), who:'mir' };
  const BT = { q:1.0, type0:1.15, type1:2.1, walk0:2.4, walk1:5.2, conn0:5.5, conn1:6.5, dev:6.9, reply0:7.1, reply1:8.6, out0:12.6, out1:13.6 };
  const Q = "hey mir, pick back up on the tasting menu? what did we settle on for the third course?";
  const R = "Settled 14 March: third course is the smoked beet, no dairy. Week 5 you noted the supplier changed, and it was never tied to the course. Open: re-taste with the new beets before print.";
  function rootPts(a, b, k){ const ax = cx(a), ay = cy(a), bx = cx(b), by = cy(b), dx = bx - ax, w = (k % 2 ? 1 : -1) * Math.min(18, Math.abs(dx)*.3 + 6);
    return bez([ax,ay],[ax + w, ay + (by-ay)*.35],[bx - w, ay + (by-ay)*.65],[bx,by], 22); }
  function render(ctx, tAbs){
    const t = ((tAbs % T) + T) % T, fr = Math.round(t*FPS);
    chrome(ctx, W, H, 'CONTEXT IN SECTION · A TASTING MENU', 'CONCEPT ANIMATION · FICTIONAL PROJECT', 'RESUME · CONNECT · DEVELOP');
    const out = 1 - ss(BT.out0, BT.out1, t);
    // strata: hairline row rules and week labels
    for (let row = 0; row <= ROWS; row++){ const y = Y0 + row*RH; ctx.fillStyle = row === 0 ? C.line2 : C.line; ctx.fillRect(X0, y, X1 - X0, 1);
      if (row < ROWS) txt(ctx, row === 0 ? 'NOW' : `W${String(ROWS - row).padStart(2,'0')}`, X1 + 10, y + RH/2 + 3.5, { mono:1, size:8.5, color: row === 0 ? C.ink2 : C.ink3, ls:.8 }); }
    txt(ctx, '↓ EARLIER', X0, Y1 + 18, { mono:1, size:9, color:C.ink3, ls:1 });
    txt(ctx, 'A ROOT = WHAT IT DREW ON', X1, Y1 + 18, { mono:1, size:9, color:C.ink3, ls:1, align:'right' });
    // walk progress
    const walkP = eo(seg(t, BT.walk0, BT.walk1)) * out, connP = eo(seg(t, BT.conn0, BT.conn1)) * out, devA = eo(seg(t, BT.dev, BT.dev + .5)) * out;
    const hops = WALK.length - 1, lit = new Set(); const walkEdges = [];
    for (let i=0;i<hops;i++){ const p = clamp(walkP*hops - i); if (p > 0) walkEdges.push([WALK[i], WALK[i+1], p]); if (p >= 1) lit.add(WALK[i+1]); } if (walkP > 0) lit.add(WALK[0]);
    // roots
    ctx.lineCap = 'round';
    CELLS.forEach(c => c.roots.forEach((p, k) => { const d = CELLS[p]; ctx.strokeStyle = C.ink; ctx.globalAlpha = .13 + .04*Math.min(3, d.used); ctx.lineWidth = .9; stroke(ctx, rootPts(c, d, c.i + k)); }));
    ctx.globalAlpha = 1;
    // taproot
    walkEdges.forEach(([a,b,p], k) => { const pts = rootPts(CELLS[a], CELLS[b], k); ctx.strokeStyle = C.blueL; ctx.lineWidth = 2; stroke(ctx, partial(pts, p));
      if (p < 1){ const pp = partial(pts, p), h = pp[pp.length-1]; ctx.fillStyle = C.blueL; ctx.beginPath(); ctx.arc(h[0], h[1], 3, 0, 7); ctx.fill(); } });
    // lateral root: DEC -> FRAG, violet dashed, running along the stratum then up
    if (connP > 0){ const ax = cx(DEC), ay = cy(DEC), bx = cx(FRAG), by = cy(FRAG);
      const pts = bez([ax,ay],[ax + (bx-ax)*.5, ay],[bx, ay - (ay-by)*.3],[bx,by], 40);
      ctx.save(); ctx.setLineDash([3,4]); ctx.strokeStyle = C.violet; ctx.lineWidth = 1.4; stroke(ctx, partial(pts, connP)); ctx.restore(); }
    // new cell's roots: orange, to DEC and FRAG
    const nx = X0 + (NEW.col + .5)*CW, ny = Y0 + RH/2;
    if (devA > 0){ [DEC, FRAG].forEach((d, k) => { const pts = bez([nx,ny],[nx + (k?-14:14), ny + (cy(d)-ny)*.3],[cx(d) + (k?14:-14), ny + (cy(d)-ny)*.7],[cx(d),cy(d)], 30);
      ctx.strokeStyle = C.orange; ctx.lineWidth = 1.3; ctx.globalAlpha = devA; stroke(ctx, partial(pts, devA)); ctx.globalAlpha = 1; }); }
    // cells
    CELLS.forEach(c => { const x = cx(c), y = cy(c), isLit = lit.has(c.i), isFrag = c === FRAG && connP > .95, isDec = c === DEC;
      const rad = 2.4 + .9*Math.sqrt(c.used);
      if (isLit || isFrag){ const col = isFrag ? C.violet : C.blueL, g = ctx.createRadialGradient(x,y,0,x,y,rad+12); g.addColorStop(0,col); g.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(x,y,rad+12,0,7); ctx.fill(); ctx.globalAlpha = 1; }
      if (c.who === 'mir'){ ctx.fillStyle = C.bg; ctx.strokeStyle = isLit ? C.blueL : isFrag ? C.violet : C.ink3; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(x,y,rad,0,7); ctx.fill(); ctx.stroke(); }
      else { ctx.fillStyle = isLit ? C.ink : isFrag ? C.violet : C.ink2; ctx.beginPath(); ctx.arc(x,y,rad,0,7); ctx.fill(); }
      if (isDec && walkP >= 1){ ctx.strokeStyle = C.blueL; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x,y,rad+6,0,7); ctx.stroke(); } });
    if (devA > 0){ ctx.fillStyle = C.bg; ctx.strokeStyle = C.orange; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(nx, ny, 4.5*devA, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(nx, ny, 1.8*devA, 0, 7); ctx.fill(); }
    // tags (opaque)
    const tag = (x, y, l1, l2, a, col, dx, dy) => { if (a <= 0) return; ctx.font = `400 10px ${MONO}`; const w = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width) + 16;
      const tx = clamp(x + dx, X0, X1 - w), ty = y + dy; ctx.fillStyle = C.bg; rr(ctx, tx, ty, w, 32, 2); ctx.fill(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.stroke();
      txt(ctx, l1, tx + 8, ty + 13, { mono:1, size:9.5, color:col, ls:.6, a }); txt(ctx, l2, tx + 8, ty + 25.5, { mono:1, size:9.5, color:C.ink2, ls:.3, a }); ctx.globalAlpha = 1; };
    tag(cx(DEC), cy(DEC), 'DECIDED · 14 MAR', 'third course: smoked beet', ss(BT.walk1 - .3, BT.walk1 + .2, t) * out, C.blueL, 14, -40);
    tag(cx(FRAG), cy(FRAG), 'NOT YET LINKED · W05', 'supplier changed', ss(BT.conn1 - .2, BT.conn1 + .3, t) * out, C.violet, 14, 8);
    tag(nx, ny, 'OPEN · NEXT MOVE', 're-taste before print', ss(BT.dev + .3, BT.dev + .7, t) * out, C.orange, 40, -6);
    // conversation column on the right
    const RX = 640, RW = W - 48 - RX;
    const qA = eo(seg(t, BT.q, BT.q + .35)) * out;
    if (qA > 0){ ctx.font = `400 13.5px ${SANS}`; const lines = wrap(ctx, Q, RW - 28), qH = 18 + lines.length*18;
      ctx.globalAlpha = qA; ctx.fillStyle = C.ink; rr(ctx, RX, Y0, RW, qH, 10); ctx.fill(); ctx.globalAlpha = 1;
      typed(ctx, Q, RX + 14, Y0 + 22, RW - 28, Math.floor(Q.length * seg(t, BT.type0, BT.type1)), { size:13.5, wt:400, color:C.bg, lh:18, a:qA }); }
    const rA = eo(seg(t, BT.reply0 - .2, BT.reply0 + .1)) * out;
    if (rA > 0){ const ry = Y0 + 96; robot(ctx, RX, ry - 4, 26, C.ink, rA); txt(ctx, 'MIR', RX + 34, ry + 12, { mono:1, size:9.5, color:C.ink3, ls:1, a:rA });
      typed(ctx, R, RX, ry + 44, RW, Math.floor(R.length * seg(t, BT.reply0, BT.reply1)), { size:13.5, wt:400, color:C.ink, lh:19, a:rA }); }
    const idle = clamp((1 - eo(seg(t, BT.q - .4, BT.q))) + ss(BT.out1 - .2, BT.out1 + .3, t));
    if (idle > 0){ ctx.font = `400 13.5px ${SANS}`; wrap(ctx, 'Read it like a core sample: this week on top, the first week at the bottom. Every root is a thing that drew on an earlier thing.', RW).forEach((l,i) => txt(ctx, l, RX, Y0 + 14 + i*19, { size:13.5, wt:400, color:C.ink2, a:idle })); }
    grain(ctx, W, H, fr, .05);
  }
  root.RhizomeB = { W, H, T, FPS, render, assets: root.MS.A, setMaker: f => { root.MS.A.make = f; } };
})(typeof window !== 'undefined' ? window : globalThis);
