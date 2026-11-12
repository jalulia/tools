/* 05 · My pick · "Away". The move that every live Mindgut study shares: leave, then come back.
   A single horizontal trace, like a strip chart, runs left to right in real time. While you are
   here it is a conversation: short marks in pairs, you and Mir. Then you leave. The trace keeps
   running, flat, for a long stretch (days, the axis says), and in that stretch the record does not
   sleep: small ticks arrive from elsewhere (a note, a file, a decision by someone else), each
   logged. Then you come back, and instead of replaying the gap, Mir answers it in one line:
   what happened, what changed, what is still open. Readouts group: measurement shown plainly.
   The point is the silence. Most of the loop is the part where nothing is said, and the record holds. */
(function(root){
  const { C, SANS, MONO, clamp, seg, eo, ei, ss, rng, bez, partial, stroke, rr, txt, typed, wrap, chrome, grain, robot } = root.MS;
  const W=960, H=540, T=16, FPS=12;
  const X0 = 48, X1 = W - 48, BY = 330, AMP = 34;              // baseline of the trace
  const PX = (X1 - X0) / T;                                     // pixels per second: one loop sweeps the width once
  // events on the loop: [t, kind, label]. kinds: you, mir, ext (while away)
  const EV = [
    [0.5,'you','"the lamp again?"'], [1.4,'mir','14 mar · paper, not cloth'], [2.4,'you','"and the bulb?"'], [3.3,'mir','2 apr · runs hot'], [4.3,'you','"park it, back thursday"'], [4.9,'mir','held'],
    [6.4,'ext','file · brass frame drawing'], [8.0,'ext','note · 90gsm out of stock'], [9.7,'ext','decision · launch → june'], [11.2,'ext','file · burn test, photo'],
    [12.6,'you','"back. what did I miss?"'],
  ];
  const AWAY0 = 5.1, AWAY1 = 12.5;
  const R = "Four things while you were away. Brass frame drawing is in. 90gsm is out of stock, which reopens the paper weight. Launch moved to June: a month more. Burn test photo is in, and it browned. Open: the paper, now with two reasons.";
  function render(ctx, tAbs){
    const t = ((tAbs % T) + T) % T, fr = Math.round(t*FPS);
    chrome(ctx, W, H, 'LEAVE, THEN COME BACK · A LAMP', 'CONCEPT ANIMATION · FICTIONAL PROJECT', 'THE RECORD DOES NOT SLEEP');
    const sx = tt => X0 + tt*PX;
    // time axis with day ticks; the away stretch is labelled in days, the conversation in minutes (the axis is not linear in time: it says so)
    ctx.fillStyle = C.line; ctx.fillRect(X0, BY + 60, X1 - X0, 1);
    for (let k=0;k<=T;k++){ ctx.fillStyle = C.line2; ctx.fillRect(sx(k), BY + 57, 1, 7); }
    txt(ctx, 'MIN', sx(0), BY + 80, { mono:1, size:8.5, color:C.ink3, ls:1 });
    txt(ctx, 'AWAY · 9 DAYS', sx((AWAY0 + AWAY1)/2), BY + 80, { mono:1, size:8.5, color:C.ink3, ls:1, align:'center' });
    txt(ctx, 'MIN', sx(T) - 2, BY + 80, { mono:1, size:8.5, color:C.ink3, ls:1, align:'right' });
    txt(ctx, 'THE AXIS CHANGES SCALE WHILE YOU ARE AWAY', X1, H - 54, { mono:1, size:8.5, color:C.ink3, ls:1, align:'right', a:.8 });
    // away band
    const awayA = ss(AWAY0, AWAY0 + .4, t) * (1 - ss(AWAY1 - .2, AWAY1 + .3, t));
    ctx.fillStyle = C.ink; ctx.globalAlpha = .035; ctx.fillRect(sx(AWAY0), BY - 90, sx(Math.min(t, AWAY1)) - sx(AWAY0), 150); ctx.globalAlpha = 1;
    // the trace: a flat line that deflects at each event, drawn up to now
    const pts = []; const N = Math.floor(t*FPS*3);
    for (let i=0;i<=N;i++){ const tt = i/(FPS*3); let y = BY;
      EV.forEach(([te, kind]) => { const d = tt - te; if (d >= 0 && d < .5){ const k = d/.5, env = Math.sin(k*Math.PI) * Math.exp(-k*3);
        y -= env * (kind === 'you' ? AMP : kind === 'mir' ? AMP*.7 : AMP*.42) * (kind === 'ext' ? -1 : 1); } });
      pts.push([sx(tt), y]); }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // glow under the trace
    ctx.strokeStyle = C.green; ctx.lineWidth = 6; ctx.globalAlpha = .10; stroke(ctx, pts);
    ctx.lineWidth = 1.5; ctx.globalAlpha = 1; stroke(ctx, pts);
    // the head
    if (pts.length){ const h = pts[pts.length-1]; ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(h[0], h[1], 2.6, 0, 7); ctx.fill(); }
    // event ticks and labels
    EV.forEach(([te, kind, label], i) => { if (t < te) return; const a = eo(seg(t, te, te + .3)), x = sx(te);
      const up = kind === 'you', lvl = up ? Math.floor(i/2) % 3 : (kind === 'mir' ? (Math.floor(i/2) % 2) : (i % 2)), ly = up ? BY - AMP - 18 - lvl*15 : BY + AMP*.5 + 24 + lvl*15;
      ctx.fillStyle = kind === 'you' ? C.ink : kind === 'mir' ? C.blueL : C.ink3; ctx.globalAlpha = a; ctx.fillRect(x - .5, up ? ly + 4 : BY + 4, 1, up ? BY - ly - 4 - AMP*.6 : ly - BY - 14); ctx.globalAlpha = 1;
      txt(ctx, label, x + (x > W - 200 ? -4 : 4), ly, { mono:1, size:9, color: kind === 'you' ? C.ink : kind === 'mir' ? C.blueL : C.ink3, ls:.3, a, align: x > W - 200 ? 'right' : 'left' }); });
    // who is here: a small presence lamp top-left of the stage
    const here = 1 - awayA; const lampX = 48, lampY = 100;
    ctx.fillStyle = here > .5 ? C.green : C.line2; ctx.beginPath(); ctx.arc(lampX + 5, lampY - 4, 4, 0, 7); ctx.fill();
    if (here > .5){ const g = ctx.createRadialGradient(lampX + 5, lampY - 4, 0, lampX + 5, lampY - 4, 14); g.addColorStop(0, 'rgba(61,220,151,.5)'); g.addColorStop(1, 'rgba(61,220,151,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lampX + 5, lampY - 4, 14, 0, 7); ctx.fill(); }
    txt(ctx, here > .5 ? 'YOU ARE HERE' : 'YOU ARE AWAY · RECORD RUNNING', lampX + 18, lampY, { mono:1, size:9.5, color: here > .5 ? C.ink2 : C.ink3, ls:1.2 });
    // the count while away
    const seen = EV.filter(([te, k]) => k === 'ext' && t >= te).length;
    if (awayA > 0 && seen > 0) txt(ctx, `${seen} LOGGED`, lampX + 18, lampY + 16, { mono:1, size:9.5, color:C.ink3, ls:1.2, a:awayA });
    // the return: Mir's answer, typed, top right
    const rA = eo(seg(t, 13.1, 13.4)) * (1 - ss(T - .5, T - .05, t));
    if (rA > 0){ const RX = 400, RW = W - 48 - RX; robot(ctx, RX, 88, 26, C.ink, rA); txt(ctx, 'MIR', RX + 34, 104, { mono:1, size:9.5, color:C.ink3, ls:1, a:rA });
      typed(ctx, R, RX, 136, RW, Math.floor(R.length * seg(t, 13.2, 15.3)), { size:13.5, wt:400, color:C.ink, lh:19, a:rA }); }
    // the strip resets: a short fade to ground before the next sweep
    const reset = ss(T - .5, T - .05, t); if (reset > 0){ ctx.fillStyle = C.bg; ctx.globalAlpha = reset; ctx.fillRect(0, 70, W, H - 110); ctx.globalAlpha = 1; }
    grain(ctx, W, H, fr, .05);
  }
  root.Pulse = { W, H, T, FPS, render, assets: root.MS.A, setMaker: f => { root.MS.A.make = f; } };
})(typeof window !== 'undefined' ? window : globalThis);
