/* 01 · Folders, restyled. Same four stations, same strands arriving; the plant is gone.
   What grows out of each folder is the record itself: strands stacked as thin bars of light,
   taller where a folder has been returned to more. A folder is a wire outline on the dark
   ground (Diagrams + Terminal groups), its label a mono readout. When the fourth strand lands,
   one strand in the first folder lights again: the thing you said in week one is still live.
   Concept animation, fictional project. Not a claim about memory. */
(function(root){
  const { C, SANS, MONO, seg, eo, ei, eio, ss, rng, bez, partial, stroke, rr, txt, chrome, grain, robot } = root.MS;
  const W=960, H=540, T=12, FPS=12;
  const FY = 420;                                         // folder baseline
  const F = [ { cx:168, w:176, label:'BRIEF',       strands:5,  date:'03 MAR' },
              { cx:376, w:176, label:'CALL NOTES',  strands:9,  date:'11 MAR' },
              { cx:584, w:176, label:'SHELF AUDIT', strands:14, date:'26 MAR' },
              { cx:792, w:176, label:'SAMPLER',     strands:7,  date:'09 APR' } ];
  // when each folder's strand arrives (slip falls), and how long its stack takes to rise
  const ARR = [0.9, 3.2, 5.5, 7.8], RISE = 1.1, HOLD0 = 10.4;
  const slipPts = (k) => { const f = F[k], x0 = f.cx + (k%2 ? -70 : 70), y0 = 60, x1 = f.cx, y1 = FY - 86;
    return bez([x0,y0],[x0 + (k%2?30:-30), 160],[x1 + (k%2?-18:18), 300],[x1,y1], 40); };
  function folder(ctx, f, a, lit){
    const x = f.cx - f.w/2, y = FY - 86, h = 86, tab = 40;
    ctx.lineWidth = 1; ctx.strokeStyle = lit ? C.ink2 : C.line2;
    // back panel with tab
    ctx.beginPath(); ctx.moveTo(x, y + 10); ctx.lineTo(x, y + h); ctx.lineTo(x + f.w, y + h); ctx.lineTo(x + f.w, y + 10);
    ctx.lineTo(x + tab + 8, y + 10); ctx.lineTo(x + tab, y); ctx.lineTo(x, y); ctx.closePath(); ctx.stroke();
    // front panel: filled dark so the stack reads as emerging from inside
    ctx.fillStyle = C.bg; ctx.fillRect(x+1, y + 26, f.w - 2, h - 26);
    ctx.strokeStyle = lit ? C.ink2 : C.line2; ctx.strokeRect(x + .5, y + 26.5, f.w - 1, h - 27);
    // label readout
    txt(ctx, f.label, f.cx, y + 62, { mono:1, size:10, color: lit ? C.ink : C.ink3, align:'center', ls:1.4 });
    txt(ctx, f.date, f.cx, y + 76, { mono:1, size:8.5, color:C.ink3, align:'center', ls:.8, a:.8 });
  }
  function render(ctx, tAbs){
    const t = ((tAbs % T) + T) % T, fr = Math.round(t*FPS);
    chrome(ctx, W, H, 'FOUR FOLDERS · ONE RECORD', 'CONCEPT ANIMATION · FICTIONAL PROJECT', 'A STRAND IS A THING YOU SAID');
    // ground line + subtle floor ticks
    ctx.fillStyle = C.line; ctx.fillRect(48, FY, W-96, 1);
    for (let x = 48; x <= W-48; x += 8){ ctx.fillStyle = C.line; ctx.fillRect(x, FY+6, 1, 2); }
    const PITCH = 9, BH = 4;                                // 9px per strand, 4px bar
    F.forEach((f, k) => {
      const arrived = t >= ARR[k], rise = eo(seg(t, ARR[k], ARR[k] + RISE));
      const prevN = k === 0 ? 0 : Math.max(0, f.strands - 4);  // folders start partly full except the first
      const n = prevN + Math.round((f.strands - prevN) * rise);
      const lit = arrived && t < ARR[k] + 2.2;
      // the stack: thin bars of light rising from inside the folder, newest on top
      const x0 = f.cx - 60, bw = 120, yTop = FY - 86 + 26;
      for (let i=0;i<n;i++){
        const yy = yTop - 8 - i*PITCH, isNew = i >= prevN, age = isNew ? seg(t, ARR[k] + RISE*(i-prevN)/Math.max(1,f.strands-prevN), ARR[k] + RISE*(i-prevN)/Math.max(1,f.strands-prevN) + .3) : 1;
        const glow = isNew ? (1 - age) : 0;
        // week-one strand relights when the fourth strand lands: continuity
        const relit = (k === 0 && i === 1) ? ss(ARR[3] + .5, ARR[3] + 1.1, t) * (1 - ss(HOLD0 + .6, HOLD0 + 1.3, t)) : 0;
        const col = relit > 0 ? C.orange : C.blueL;
        ctx.fillStyle = col; ctx.globalAlpha = .28 + .5*glow + .6*relit;
        const inset = (rng(k*100 + i)() * 10) | 0;
        ctx.fillRect(x0 + inset, yy, bw - 2*inset, BH);
        if (glow > 0 || relit > 0){ ctx.globalAlpha = (.35*glow + .5*relit); ctx.fillRect(x0 + inset - 4, yy - 1, bw - 2*inset + 8, BH + 2); }
        ctx.globalAlpha = 1;
      }
      folder(ctx, f, 1, lit);
      // count readout above the stack
      if (n > 0){ const yy = yTop - 8 - n*PITCH - 10; txt(ctx, `${String(n).padStart(2,'0')} STRANDS`, f.cx, yy, { mono:1, size:9, color: lit ? C.ink2 : C.ink3, align:'center', ls:1 }); }
      // the slip: a small light rectangle falling along a curve into the folder
      const sp = seg(t, ARR[k] - .9, ARR[k]);
      if (sp > 0 && sp < 1){ const pts = slipPts(k), p = pts[Math.floor(ei(sp) * (pts.length-1))];
        ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate((k%2?-1:1)*(.35 - .5*sp));
        ctx.fillStyle = C.ink; ctx.globalAlpha = .9; ctx.fillRect(-30, -9, 60, 18); ctx.globalAlpha = 1;
        ctx.fillStyle = C.bg; ctx.fillRect(-23, -3, 42, 1); ctx.fillRect(-23, 1, 28, 1); ctx.restore();
        // trail
        ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.globalAlpha = .25; stroke(ctx, partial(pts, ei(sp))); ctx.globalAlpha = 1; }
    });
    // the relight connection: a thin line from the fourth folder back to the first, orange, then gone
    const link = ss(ARR[3] + .5, ARR[3] + 1.2, t) * (1 - ss(HOLD0 + .6, HOLD0 + 1.3, t));
    if (link > 0){ const y1 = FY - 86 + 26 - 8 - 1*PITCH + 2, y4 = FY - 86 + 26 - 8 - (F[3].strands-1)*PITCH + 2;
      const pts = bez([F[3].cx - 60, y4],[F[3].cx - 200, 170],[F[0].cx + 200, 170],[F[0].cx + 60, y1], 60);
      ctx.save(); ctx.setLineDash([3,4]); ctx.strokeStyle = C.orange; ctx.lineWidth = 1; ctx.globalAlpha = .9; stroke(ctx, partial(pts, link)); ctx.restore();
      txt(ctx, 'WEEK ONE · STILL LIVE', (F[0].cx + F[3].cx)/2, 176, { mono:1, size:9.5, color:C.orange, align:'center', ls:1.2, a: ss(ARR[3] + 1.0, ARR[3] + 1.4, t) * (1 - ss(HOLD0 + .6, HOLD0 + 1.3, t)) }); }
    // headline line, quiet
    const hA = 1 - ss(T - .6, T - .1, t) * 0;
    txt(ctx, 'Nothing you said is filed away. It stays in play.', 48, 110, { size:15, wt:400, color:C.ink2, a: hA });
    grain(ctx, W, H, fr, .05);
  }
  root.Folders = { W, H, T, FPS, render, assets: root.MS.A, setMaker: f => { root.MS.A.make = f; } };
})(typeof window !== 'undefined' ? window : globalThis);
