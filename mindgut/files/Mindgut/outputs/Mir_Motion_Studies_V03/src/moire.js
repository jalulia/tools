/* 02 · Moiré. Material: the red-on-blue halftone rings and the cobalt ripple poster on Julia's board.
   Rhizome, first way: the record as interference. Every thing you said is a point source sending rings outward
   across a cobalt ground, printed as halftone: a line gets heavier near its source and thins with distance.
   Where rings cross, they make moiré: that is where ideas touched. Over time new sources arrive and the pattern
   gets richer. The question is a new source dropped at the lower right; its rings run outward and, where they
   meet the rings of the old decision, the interference flares in red. That is "resume": not a search, a resonance.
   A second flare at a lone source nobody's rings had reached: "connect". A small new source is born between: "develop".
   Fictional project. The physics is decoration, not a claim. */
(function(root){
  const { C, seg, eo, ei, ss, rng, clamp, txt, rings, bloom, mark } = root.MS;
  const W=960, H=540, T=16, FPS=12;
  const BLUE = '#1F3FD1', PALE = '#DCE3FF', RED = '#F0442A';
  // sources: [x, y, born(s), strength]. The decision is old and strong. The lone one is weak and far.
  const SRC = [ [260,250,-40,1.0], [560,220,-26,.7], [430,380,-16,.5], [790,150,-12,.5], [830,430,-9,.3] ];
  const DEC = 0, LONE = 4;
  const Q = [700, 470, 2.4, .9];                         // the question source
  const NEW = [520, 330, 9.6, .55];                      // the open move
  const BT = { q:2.4, res0:4.2, res1:6.4, con0:6.8, con1:8.6, dev:9.6, hold:11.4, out0:14.4, out1:15.6 };
  const LAM = 16;                                        // ring spacing
  function render(ctx, tAbs){
    const t = ((tAbs % T) + T) % T;
    ctx.fillStyle = BLUE; ctx.fillRect(0,0,W,H);
    const out = 1 - ss(BT.out0, BT.out1, t);
    const all = SRC.concat([Q, NEW]);
    const qR = Math.min(900, (t - Q[2]) * 150);
    // rings: each source's wavefront has travelled (t - born)*speed; draw rings inside that radius, weight falling with r
    ctx.lineCap = 'round';
    all.forEach((s, i) => { const [x,y,b,st] = s; const age = t - b; if (age <= 0) return;
      const isQ = i === SRC.length, isNew = i === SRC.length + 1, isDec = i === DEC, isLone = i === LONE;
      const R = isQ ? qR : Math.min(300 + 160*st, Math.max(0, age) * 95), fade = isQ || isNew ? out : 1;
      const col = PALE;
      rings(ctx, x, y, LAM*.7, R, LAM, col, r => { const k = 1 - r/R; const w = (0.25 + 3.2*k*k*k) * (.6 + .4*st); return w * fade; }, .85);
    });
    // interference flares: where the question's wavefront reaches the decision, red blooms along the crossing
    const dQD = Math.hypot(Q[0]-SRC[DEC][0], Q[1]-SRC[DEC][1]), reach = (t - Q[2]) * 150;
    const res = eo(seg(reach, dQD - 40, dQD + 60)) * out, con = eo(seg(t, BT.con0, BT.con1)) * out, dev = eo(seg(t, BT.dev, BT.dev + .8)) * out;
    if (res > 0){ const [x,y] = SRC[DEC]; bloom(ctx, x, y, 170*res, 'rgba(240,68,42,.7)', .8*res, 8);
      rings(ctx, x, y, LAM*.7, 170*res, LAM, RED, r => { const k = 1 - r/(170*res); return (0.3 + 3*k*k*k) * res; }, .95); }
    if (con > 0){ const [x,y] = SRC[LONE]; bloom(ctx, x, y, 110*con, 'rgba(240,68,42,.7)', .8*con, 6);
      rings(ctx, x, y, LAM*.7, 110*con, LAM, RED, r => { const k = 1 - r/(110*con); return (0.3 + 2.6*k*k*k) * con; }, .95);
      // the connecting arc: a red ring segment from DEC to LONE drawn as a single large arc centred between them
      const [ax,ay] = SRC[DEC], [bx,by] = SRC[LONE], mx = (ax+bx)/2, my = (ay+by)/2 - 150, rr_ = Math.hypot(ax-mx, ay-my);
      const a0 = Math.atan2(ay-my, ax-mx), a1 = Math.atan2(by-my, bx-mx);
      ctx.strokeStyle = RED; ctx.lineWidth = 2; ctx.globalAlpha = .9*con; ctx.setLineDash([3,9]); ctx.beginPath(); ctx.arc(mx, my, rr_, a0, a0 + (a1-a0)*con); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }
    if (dev > 0){ const [x,y] = NEW; bloom(ctx, x, y, 60*dev, 'rgba(255,255,255,.9)', .9*dev, 2); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 3.5*dev, 0, 7); ctx.fill(); }
    // source dots
    all.forEach((s, i) => { const [x,y,b,st] = s; if (t - b <= 0) return; const isQ = i === SRC.length, isNew = i === SRC.length + 1;
      ctx.fillStyle = isQ ? RED : '#fff'; ctx.globalAlpha = (isQ || isNew) ? out : 1; ctx.beginPath(); ctx.arc(x, y, 2.2 + 1.6*st, 0, 7); ctx.fill(); ctx.globalAlpha = 1; });
    // words: few, white, set like the poster
    const qA = eo(seg(t, BT.q, BT.q + .5)) * out; if (qA > 0) txt(ctx, 'the lamp again. where were we?', Q[0] + 60, Q[1] + 40, { size:15, wt:300, color:'#fff', align:'right', a:qA });
    const w1 = ss(BT.res0 + 1.2, BT.res0 + 1.7, t) * out; if (w1 > 0) txt(ctx, 'decided · paper, not cloth', SRC[DEC][0], SRC[DEC][1] - 190, { mono:1, size:10.5, color:'#fff', align:'center', a:w1, ls:1 });
    const w2 = ss(BT.con1 - .3, BT.con1 + .2, t) * out; if (w2 > 0) txt(ctx, 'never linked · the bulb runs hot', SRC[LONE][0] + 20, SRC[LONE][1] - 128, { mono:1, size:10.5, color:'#fff', align:'right', a:w2, ls:1 });
    const w3 = ss(BT.dev + .4, BT.dev + .9, t) * out; if (w3 > 0) txt(ctx, 'open · re-test the paper', NEW[0], NEW[1] - 24, { mono:1, size:10.5, color:'#fff', align:'center', a:w3, ls:1 });
    mark(ctx, W, H, '#fff');
  }
  root.Moire = { W, H, T, FPS, render, ground:[31,63,209], assets: root.MS.A, setMaker: f => { root.MS.A.make = f; } };
})(typeof window !== 'undefined' ? window : globalThis);
