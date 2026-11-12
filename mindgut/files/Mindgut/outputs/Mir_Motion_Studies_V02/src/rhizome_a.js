/* 02 · Rhizome A · "Accretion". The record as a growing field, seen from above, no time axis.
   Every exchange is a node placed near what it drew on, so the field grows like a colony:
   dense where you keep returning, sparse where a thread was left. Lines are faint until used.
   One question arrives; Mir finds the decision by walking the links, not by searching a list:
   the path lights hop by hop, a second link joins something unlinked, and a new open node is set.
   The loop is a full cycle: the field is already old when it starts; it ends richer than it began
   and the final frame crossfades into the first. Light group: glow means someone is here. */
(function(root){
  const { C, SANS, MONO, clamp, seg, eo, ei, eio, ss, rng, bez, partial, stroke, rr, txt, typed, wrap, chrome, grain, robot } = root.MS;
  const W=960, H=540, T=14, FPS=12;
  const CX = 520, CY = 300, R0 = 36;                        // centre of the field; first node here
  const NODES = (function(){
    const r = rng(77), out = [];
    // seeds grow outward: each new node picks 1–2 parents from earlier nodes, placed near the nearest parent
    const N = 96;
    for (let i=0;i<N;i++){
      let x, y, parents = [];
      if (i === 0){ x = CX; y = CY; }
      else {
        const far = r() < .18;
        const p = far ? Math.floor(r()*i) : Math.max(0, i - 1 - Math.floor(r()*Math.min(i, 9)));
        parents.push(p);
        if (r() < .45){ let q = Math.floor(r()*i); if (q !== p) parents.push(q); }
        const P = out[p], ang = r()*Math.PI*2, d = 40 + r()*62;
        x = P.x + Math.cos(ang)*d; y = P.y + Math.sin(ang)*d*.78;
        // keep inside the stage
        x = clamp(x, 140, 880); y = clamp(y, 150, 460);
        // push away from close neighbours
        for (let k=0;k<3;k++) out.forEach(o => { const dx = x-o.x, dy = y-o.y, dd = Math.hypot(dx,dy); if (dd < 26){ x += dx/dd*(26-dd); y += dy/dd*(26-dd)*.78; } });
        x = clamp(x, 140, 880); y = clamp(y, 150, 460);
      }
      out.push({ i, x, y, parents, who: r() < .5 ? 'you' : 'mir', t: i / N });  // t = birth fraction of the whole record
    }
    // use counts: how often later nodes drew on this one
    out.forEach(n => n.used = 0); out.forEach(n => n.parents.forEach(p => out[p].used++));
    return out;
  })();
  // story nodes: the decision is old and well-used; the fragment is mid-age and never drawn on.
  const DEC = NODES.slice(6, 28).reduce((a,b) => b.used > a.used ? b : a);
  const FRAG = NODES.slice(40, 86).filter(n => n.used === 0 && Math.hypot(n.x-DEC.x, n.y-DEC.y) > 150)[0] || NODES[60];
  // the walk goes through neighbours (near links only), so Mir is seen moving through the record, not jumping
  const near = (a,b) => Math.hypot(NODES[a].x-NODES[b].x, NODES[a].y-NODES[b].y) < 110;
  function pathTo(from, to){ const prev = {}; const q = [from]; prev[from] = -1;
    while (q.length){ const u = q.shift(); if (u === to) break;
      const nb = [...NODES[u].parents, ...NODES.filter(m => m.parents.includes(u)).map(m => m.i)].filter(v => near(u,v));
      nb.forEach(p => { if (!(p in prev)){ prev[p] = u; q.push(p); } }); }
    if (!(to in prev)) return null; const o = []; let u = to; while (u !== -1){ o.push(u); u = prev[u]; } return o.reverse(); }
  const LAST = NODES.length - 1;
  // start from the most recent real node whose walk to DEC is 4–7 hops
  let START = LAST - 1, WALK = null;
  for (let k = LAST - 1; k > LAST - 20; k--){ const w = pathTo(k, DEC.i); if (w && w.length >= 5 && w.length <= 8){ START = k; WALK = w; break; } }
  if (!WALK) WALK = pathTo(START, DEC.i) || [START, DEC.i];
  // the new node sits just beyond the start, on the frontier, and links to DEC and FRAG
  { const S0 = NODES[START], ax = S0.x - CX, ay = S0.y - CY, L = Math.hypot(ax, ay) || 1;
    NODES[LAST].x = clamp(S0.x + ax/L*48, 140, 880); NODES[LAST].y = clamp(S0.y + ay/L*40, 150, 460); NODES[LAST].parents = [DEC.i, FRAG.i]; }
  // the loop: the record is at 70% at t=0, grows to 100% by t=4 (new nodes arriving), question at 4.2, walk 5.2–7.6, connect 7.8–8.8, new node 9.2, hold, fade 12.8–14
  const BT = { grow0:0, grow1:4.0, q:4.2, type0:4.35, type1:5.3, walk0:5.5, walk1:7.6, conn0:7.9, conn1:8.8, dev:9.2, reply0:9.4, reply1:10.8, out0:12.6, out1:13.6 };
  const Q = "hey mir, where did we land on the bottle shape? I want to pick it back up.";
  const R = "Decided 14 March: the shoulder stays square. Your 2 April note on the cap thread was never linked to it, and it changes the shoulder radius. Open: re-cut the shoulder with the thread in.";
  function render(ctx, tAbs){
    const t = ((tAbs % T) + T) % T, fr = Math.round(t*FPS);
    chrome(ctx, W, H, 'CONTEXT AS A FIELD · A BOTTLE', 'CONCEPT ANIMATION · FICTIONAL PROJECT', 'RESUME · CONNECT · DEVELOP');
    const out = 1 - ss(BT.out0, BT.out1, t);
    const live = .7 + .3*eo(seg(t, BT.grow0, BT.grow1));            // fraction of the record present
    const vis = n => n.t <= live || n.i === LAST && t >= BT.dev;
    const walkP = eo(seg(t, BT.walk0, BT.walk1)) * out, connP = eo(seg(t, BT.conn0, BT.conn1)) * out, devA = eo(seg(t, BT.dev, BT.dev + .4)) * out;
    const onWalk = new Set(), walkEdges = [];
    { const hops = WALK.length - 1, k = walkP * hops; for (let i=0;i<hops;i++){ const p = clamp(k - i); if (p > 0) walkEdges.push([WALK[i], WALK[i+1], p]); if (p >= 1) onWalk.add(WALK[i+1]); } if (walkP > 0) onWalk.add(WALK[0]); }
    const walkCol = C.blueL;
    // clip to stage
    ctx.save(); ctx.beginPath(); ctx.rect(48, 80, W-96, H-140); ctx.clip();
    // links: faint, brighter by use
    ctx.lineCap = 'round';
    NODES.forEach(n => { if (!vis(n) || n.i === LAST) return; n.parents.forEach(p => { const P = NODES[p]; if (!vis(P)) return;
      const birth = seg(live, n.t, n.t + .035), a = .10 + .05*Math.min(3, P.used);
      ctx.strokeStyle = C.ink; ctx.globalAlpha = a * (n.t > .7 ? birth : 1); ctx.lineWidth = .8;
      const pts = bez([P.x,P.y],[P.x + (n.x-P.x)*.3, P.y + (n.y-P.y)*.3 - 10],[P.x + (n.x-P.x)*.7, P.y + (n.y-P.y)*.7 + 10],[n.x,n.y], 14);
      stroke(ctx, n.t > .7 ? partial(pts, birth) : pts); }); });
    ctx.globalAlpha = 1;
    // the walk: blue, hop by hop, backwards along parents
    walkEdges.forEach(([a,b,p]) => { const A = NODES[a], B = NODES[b];
      const pts = bez([A.x,A.y],[A.x + (B.x-A.x)*.3, A.y + (B.y-A.y)*.3 - 10],[A.x + (B.x-A.x)*.7, A.y + (B.y-A.y)*.7 + 10],[B.x,B.y], 20);
      ctx.strokeStyle = C.blueL; ctx.lineWidth = 1.8; ctx.globalAlpha = 1; stroke(ctx, partial(pts, p));
      if (p < 1){ const pp = partial(pts, p), h = pp[pp.length-1]; ctx.fillStyle = C.blueL; ctx.beginPath(); ctx.arc(h[0], h[1], 3, 0, 7); ctx.fill(); } });
    // the connection: violet dashed, from DEC to FRAG
    if (connP > 0){ const pts = bez([DEC.x,DEC.y],[DEC.x + (FRAG.x-DEC.x)*.2, Math.min(DEC.y,FRAG.y) - 70],[DEC.x + (FRAG.x-DEC.x)*.8, Math.min(DEC.y,FRAG.y) - 70],[FRAG.x,FRAG.y], 40);
      ctx.save(); ctx.setLineDash([3,4]); ctx.strokeStyle = C.violet; ctx.lineWidth = 1.4; stroke(ctx, partial(pts, connP)); ctx.restore(); }
    // the new node's links: orange, to DEC and FRAG
    if (devA > 0){ [DEC, FRAG].forEach(P => { const N = NODES[LAST]; ctx.strokeStyle = C.orange; ctx.lineWidth = 1.2; ctx.globalAlpha = devA;
      stroke(ctx, partial(bez([P.x,P.y],[P.x + (N.x-P.x)*.4, P.y - 20],[P.x + (N.x-P.x)*.6, N.y + 20],[N.x,N.y], 20), devA)); ctx.globalAlpha = 1; }); }
    // nodes: radius by use; glow on the walk
    NODES.forEach(n => { if (!vis(n)) return;
      const birth = n.t > .7 ? eo(seg(live, n.t, n.t + .03)) : 1, pop = n.t > .7 ? 1 + .5*Math.sin(seg(live, n.t, n.t + .06)*Math.PI) : 1;
      let r = (1.6 + 1.1*Math.sqrt(n.used)) * birth * pop;
      const isDec = n === DEC, isFrag = n === FRAG, isNew = n.i === LAST;
      if (isNew){ if (devA <= 0) return; r = 4.5*devA; }
      const lit = onWalk.has(n.i) || (isFrag && connP > .95) || isNew;
      if (lit){ const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r + 14); const col = isNew ? C.orange : isFrag ? C.violet : C.blueL;
        g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.globalAlpha = .55; ctx.beginPath(); ctx.arc(n.x, n.y, r + 14, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
      if (isNew){ ctx.fillStyle = C.bg; ctx.strokeStyle = C.orange; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(n.x, n.y, r*.4, 0, 7); ctx.fill(); return; }
      if (n.who === 'mir'){ ctx.fillStyle = C.bg; ctx.strokeStyle = lit ? C.blueL : C.ink3; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 7); ctx.fill(); ctx.stroke(); }
      else { ctx.fillStyle = lit ? C.ink : C.ink2; ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 7); ctx.fill(); }
      if (isDec && walkP >= 1){ ctx.strokeStyle = C.blueL; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(n.x, n.y, r + 7, 0, 7); ctx.stroke(); }
    });
    ctx.restore();
    // tags
    const tag = (n, l1, l2, a, col, dx, dy) => { if (a <= 0) return; ctx.font = `400 10px ${MONO}`; const w = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width) + 16;
      const x = clamp(n.x + dx, 52, W - 52 - w), y = n.y + dy; ctx.globalAlpha = 1; ctx.fillStyle = C.bg; rr(ctx, x, y, w, 32, 2); ctx.fill(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.stroke();
      txt(ctx, l1, x + 8, y + 13, { mono:1, size:9.5, color:col, ls:.6, a }); txt(ctx, l2, x + 8, y + 25.5, { mono:1, size:9.5, color:C.ink2, ls:.3, a }); ctx.globalAlpha = 1; };
    tag(NODES[START], 'LAST TOUCHED · 09 MAY', 'label proof', ss(BT.walk0 - .2, BT.walk0 + .2, t) * (1 - ss(BT.walk1, BT.walk1 + .4, t)) * out, C.ink3, 14, -46);
    tag(DEC, 'DECIDED · 14 MAR', 'shoulder: square', ss(BT.walk1 - .3, BT.walk1 + .2, t) * out, C.blueL, -150, -46);
    tag(FRAG, 'NOT YET LINKED · 2 APR', 'cap thread note', ss(BT.conn1 - .2, BT.conn1 + .3, t) * out, C.violet, 16, 12);
    tag(NODES[LAST], 'OPEN · NEXT MOVE', 're-cut the shoulder', ss(BT.dev + .3, BT.dev + .7, t) * out, C.orange, 18, -16);
    // conversation: question right, reply left
    const qA = eo(seg(t, BT.q, BT.q + .35)) * out;
    if (qA > 0){ ctx.font = `400 14px ${SANS}`; const lines = wrap(ctx, Q, 330), qW = 358, qH = 18 + lines.length*19, qx = W - 48 - qW, qy = 86;
      ctx.globalAlpha = qA; ctx.fillStyle = C.ink; rr(ctx, qx, qy, qW, qH, 10); ctx.fill(); ctx.globalAlpha = 1;
      typed(ctx, Q, qx + 14, qy + 23, 330, Math.floor(Q.length * seg(t, BT.type0, BT.type1)), { size:14, wt:400, color:C.bg, lh:19, a:qA }); }
    const rA = eo(seg(t, BT.reply0 - .2, BT.reply0 + .1)) * out;
    if (rA > 0){ robot(ctx, 48, 86, 30, C.ink, rA); txt(ctx, 'MIR', 86, 98, { mono:1, size:9.5, color:C.ink3, ls:1, a:rA });
      typed(ctx, R, 110, 98, 400, Math.floor(R.length * seg(t, BT.reply0, BT.reply1)), { size:13.5, wt:400, color:C.ink, lh:19, a:rA }); }
    const idle = clamp((1 - eo(seg(t, BT.q - .4, BT.q))) + ss(BT.out1 - .2, BT.out1 + .3, t));
    if (idle > 0) txt(ctx, 'Each thing you say lands next to what it came from. The record grows where you keep returning.', 48, 104, { size:14, wt:400, color:C.ink2, a:idle });
    grain(ctx, W, H, fr, .05);
  }
  root.RhizomeA = { W, H, T, FPS, render, assets: root.MS.A, setMaker: f => { root.MS.A.make = f; } };
})(typeof window !== 'undefined' ? window : globalThis);
