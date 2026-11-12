/* 04 · Glyphs. Material: the blue ASCII field and the pictures-made-of-letters on the boards (Characters group).
   Rhizome, second way: the record drawn in its own alphabet. A field of characters on cobalt, where each cell's
   glyph is chosen by how much has been said there ( . : - = + * # % @ ). The record is a landscape of letters.
   You can read it two ways: from a distance it is a terrain with ridges where the work piled up; up close it is text.
   When the question lands, a path of characters brightens from the newest ridge back through the terrain to the
   oldest, as if someone ran a finger along the page. A second path finds a single lone character. Where they meet,
   a new ridge starts to rise, and keeps rising after the paths fade. Fictional project. */
(function(root){
  const { C, GLYPHS, MONO, clamp, seg, eo, ei, ss, rng, noise2, bez, partial, txt, charField, bloom, mark } = root.MS;
  const W=960, H=540, T=16, FPS=12;
  const BLUE = '#1F3FD1', PALE = 'rgba(255,255,255,.92)';
  const CW = 11, CH = 15, COLS = Math.floor((W - 80)/CW), ROWS = Math.floor((H - 110)/CH), X0 = 40, Y0 = 50;
  const nz = noise2(21), nz2 = noise2(22);
  // ridges: dense places in the terrain (cell coords). DEC is old; LONE is a single char; NEW rises where the paths meet
  const RIDGES = [ { c:14, r:17, w:1.0, s:7 }, { c:30, r:9, w:.7, s:6 }, { c:46, r:19, w:.85, s:8 }, { c:60, r:8, w:.6, s:5 }, { c:70, r:21, w:.55, s:5 } ];
  const DEC = RIDGES[0], LONE = { c:74, r:3 }, NEWR = { c:52, r:12 }, START = RIDGES[4];
  const BT = { q:2.2, p1:3.2, p1e:5.8, p2:6.0, p2e:7.8, rise:8.2, risee:10.4, hold:12.0, out0:14.6, out1:15.6 };
  function pathCells(a, b, bend, n){ const pts = bez([a.c, a.r], [a.c + (b.c-a.c)*.3, a.r + bend], [a.c + (b.c-a.c)*.7, b.r - bend], [b.c, b.r], n); return pts; }
  const P1 = pathCells(START, DEC, -6, 60), P2 = pathCells(DEC, LONE, 9, 60);
  function render(ctx, tAbs){
    const t = ((tAbs % T) + T) % T;
    ctx.fillStyle = BLUE; ctx.fillRect(0,0,W,H);
    const out = 1 - ss(BT.out0, BT.out1, t);
    const p1 = eo(seg(t, BT.p1, BT.p1e)) * out, p2 = eo(seg(t, BT.p2, BT.p2e)) * out, rise = eo(seg(t, BT.rise, BT.risee));
    const grown = ss(BT.risee, BT.risee + .6, t);                                      // the new ridge persists after the fade
    const n1 = Math.floor(p1*60), n2 = Math.floor(p2*60);
    const density = (c, r) => {
      let v = .04 + .22*nz(c/9 + t*.015, r/6) + .08*nz2(c/3, r/2.2 + t*.03);          // low terrain, slowly breathing
      for (const g of RIDGES){ const d = Math.hypot((c - g.c)*.72, r - g.r); v += g.w * .95 * Math.exp(-(d*d)/(g.s*g.s)); }
      // the new ridge: rises, then stays (smaller) after the fold
      { const d = Math.hypot((c - NEWR.c)*.72, r - NEWR.r); v += (.9*rise*out + .55*grown) * Math.exp(-(d*d)/(5*5)); }
      // the lone character
      if (c === LONE.c && r === LONE.r) v += .95;
      return clamp(v);
    };
    charField(ctx, X0, Y0, COLS, ROWS, CW, CH, (c,r) => Math.min(density(c,r), .45), 'rgba(255,255,255,.5)', 12.5, 1);
    charField(ctx, X0, Y0, COLS, ROWS, CW, CH, (c,r) => { const d = density(c,r); return d > .45 ? d : 0; }, PALE, 12.5, 1);
    // the paths: brighten the glyphs along them by overprinting in white with bloom, like a finger running along the page
    const over = (pts, n, col) => { ctx.font = `500 12.5px ${MONO}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      for (let i=0;i<n;i++){ const c = Math.round(pts[i][0]), r = Math.round(pts[i][1]); const x = X0 + (c+.5)*CW, y = Y0 + (r+.5)*CH;
        const d = density(c, r), g = GLYPHS[Math.max(2, Math.min(9, Math.floor(d*9.99)))];
        bloom(ctx, x, y, 14, col, .35, 1); ctx.fillStyle = '#fff'; ctx.fillText(g === ' ' ? '·' : g, x, y); }
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; };
    if (n1 > 0) over(P1, n1, 'rgba(255,255,255,.9)');
    if (n2 > 0) over(P2, n2, 'rgba(240,68,42,.9)');
    // the finger: a bright head on whichever path is drawing
    const head = n1 < 60 && n1 > 0 ? P1[n1-1] : (n2 > 0 && n2 < 60 ? P2[n2-1] : null);
    if (head){ const x = X0 + (Math.round(head[0])+.5)*CW, y = Y0 + (Math.round(head[1])+.5)*CH; bloom(ctx, x, y, 26, 'rgba(255,255,255,1)', .9, 2); }
    // the new ridge glows while it rises
    if (rise > 0 && out > 0){ const x = X0 + (NEWR.c+.5)*CW, y = Y0 + (NEWR.r+.5)*CH; bloom(ctx, x, y, 70*rise, 'rgba(255,200,120,.9)', .55*rise*out, 4); }
    // words: typed as part of the field, in its own alphabet
    const cellTxt = (s, c, r, a, col) => { if (a <= 0) return; ctx.font = `500 12.5px ${MONO}`; ctx.fillStyle = BLUE; ctx.globalAlpha = a; ctx.fillRect(X0 + c*CW - 4, Y0 + r*CH, s.length*CW + 8, CH);
      ctx.globalAlpha = 1; txt(ctx, s, X0 + (c+.5)*CW - CW/2 + CW*0, Y0 + (r+.5)*CH + 4.5, { mono:1, size:12.5, wt:500, color: col || '#fff', a }); };
    cellTxt('> where did we land on the bottle?', 2, ROWS - 2, eo(seg(t, BT.q, BT.q + .4)) * out, '#fff');
    cellTxt('decided · march · square shoulder', DEC.c - 8, DEC.r + 6, ss(BT.p1e - .3, BT.p1e + .2, t) * out, '#fff');
    cellTxt('never linked · cap thread', LONE.c - 24, LONE.r + 2, ss(BT.p2e - .3, BT.p2e + .2, t) * out, '#F0442A');
    cellTxt('open · re-cut the shoulder', NEWR.c - 6, NEWR.r + 5, ss(BT.rise + .6, BT.rise + 1.1, t) * out, '#FFD28A');
    mark(ctx, W, H, '#fff');
  }
  root.Glyphs = { W, H, T, FPS, render, ground:[31,63,209], assets: root.MS.A, setMaker: f => { root.MS.A.make = f; } };
})(typeof window !== 'undefined' ? window : globalThis);
