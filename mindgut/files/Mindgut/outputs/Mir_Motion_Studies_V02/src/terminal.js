/* 04 · Terminal · "The record, read aloud". Straight from the Terminal group on the board:
   one typeface, amber phosphor, no chrome. The same resume–connect–develop move, but shown as
   what Mir actually does: a query against the record, and the record answering line by line
   with its sources attached. No picture of a brain, no network. Just the readout.
   Each line carries a strand id and a date, because that is what makes it checkable.
   Concept animation; the command grammar is illustrative, not the product's. */
(function(root){
  const { C, SANS, MONO, clamp, seg, eo, ss, rng, txt, chrome, grain, robot } = root.MS;
  const W=960, H=540, T=14, FPS=12;
  const AMB = '#F2B544', AMB2 = '#9C7A34', AMB3 = '#5C4A28';
  // the script: [time, kind, text]. kinds: cmd (typed by the user), out (printed by the record), hi (highlighted), open (orange), blank
  const L = [
    [0.6,  'cmd',  'mir resume "the lamp"'],
    [1.6,  'out',  'reading 212 strands · lamp · 03 mar → 09 may'],
        [2.4,  'lbl',  'LAST DECIDED'],
    [2.6,  'hi',   '#0147  14 mar  "shade in paper, not cloth. it should glow, not diffuse."'],
    [3.4,  'out',  '        scope: the table lamp only · reason: the cloth sample read as hotel'],
        [4.3,  'lbl',  'DRAWN ON SINCE'],
    [4.5,  'out',  '#0152  18 mar  paper weights, three samples            → #0147'],
    [5.0,  'out',  '#0161  26 mar  "the 90gsm one, warm white"              → #0152'],
    [5.5,  'out',  '#0188  09 apr  switch frame to brass, keep the paper    → #0147'],
        [6.4,  'lbl',  'NOT YET LINKED'],
    [6.6,  'vi',   '#0174  02 apr  voice note: "the bulb runs hot, paper browned at 40 min"'],
    [7.4,  'out',  '        never tied to #0147 · changes the paper weight question'],
        [8.4,  'lbl',  'OPEN'],
    [8.6,  'op',   '#0213  now     re-test 90gsm at 40 min with the brass frame · your call'],
        [9.8,  'gap',  ''],
    [9.8,  'cmd',  'mir hold #0213'],
    [10.5, 'out',  'held. 213 strands.'],
  ];
  const X = 48, Y = 104, LH = 17.5;
  function render(ctx, tAbs){
    const t = ((tAbs % T) + T) % T, fr = Math.round(t*FPS);
    chrome(ctx, W, H, 'THE RECORD, READ ALOUD · A LAMP', 'CONCEPT ANIMATION · FICTIONAL PROJECT', 'EVERY LINE HAS A SOURCE');
    const out = 1 - ss(12.6, 13.6, t);
    // phosphor bloom behind the text column: Light group, a glow that means someone is here
    const g = ctx.createRadialGradient(300, 300, 20, 300, 300, 520); g.addColorStop(0, 'rgba(242,181,68,.06)'); g.addColorStop(1, 'rgba(242,181,68,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 70, W, H-110);
    let row = 0;
    L.forEach(([t0, kind, text], i) => {
      if (t < t0) return; const age = t - t0;
      const y = Y + row*LH; row++; if (kind === 'cmd' && i > 0) { /* breathing room before a new command */ }
      if (kind === 'gap'){ row += .4; return; }
      if (kind === 'lbl'){ txt(ctx, text, X, y + 4, { mono:1, size:9, color:AMB2, ls:1.4, a:out }); row += .35; return; }
      if (!text) return;
      const typing = kind === 'cmd' ? seg(age, 0, Math.min(.9, text.length*.045)) : seg(age, 0, .25);
      const n = kind === 'cmd' ? Math.floor(text.length * typing) : text.length;
      const col = kind === 'cmd' ? C.ink : kind === 'hi' ? AMB : kind === 'vi' ? C.violet : kind === 'op' ? C.orange : AMB2;
      const a = (kind === 'cmd' ? 1 : eo(typing)) * out;
      if (kind === 'cmd'){ txt(ctx, '>', X, y, { mono:1, size:13, color:AMB, a }); txt(ctx, text.slice(0, n), X + 18, y, { mono:1, size:13, color:col, a });
        // cursor while typing
        if (n < text.length){ ctx.font = `400 13px ${root.MS.MONO}`; const w = ctx.measureText(text.slice(0,n)).width; if (Math.floor(t*6) % 2 === 0){ ctx.fillStyle = AMB; ctx.globalAlpha = a; ctx.fillRect(X + 18 + w + 2, y - 11, 7, 14); ctx.globalAlpha = 1; } }
        return; }
      // bloom on highlighted lines
      if (kind === 'hi' || kind === 'vi' || kind === 'op'){ ctx.font = `400 13px ${root.MS.MONO}`; const w = ctx.measureText(text).width;
        ctx.fillStyle = col; ctx.globalAlpha = .08 * a; ctx.fillRect(X - 6, y - 13, w + 12, 18); ctx.globalAlpha = 1; }
      txt(ctx, text, X, y, { mono:1, size:13, color:col, a });
    });
    // live cursor at the prompt after the last line
    const lastT = L[L.length-1][0];
    if (t > lastT + .6 && out > 0){ const y = Math.min(Y + (row + .6)*LH, H - 62); txt(ctx, '>', X, y, { mono:1, size:13, color:AMB, a:out });
      if (Math.floor(t*2) % 2 === 0){ ctx.fillStyle = AMB; ctx.globalAlpha = out; ctx.fillRect(X + 18, y - 11, 7, 14); ctx.globalAlpha = 1; } }
    // strand counter, top right of the column: ticks up when the new strand is held
    const count = t > 10.5 ? 213 : 212;
    txt(ctx, `${count} STRANDS`, W - 48, 92, { mono:1, size:9.5, color:AMB2, align:'right', ls:1.2, a: out });
    // scanlines, very light
    ctx.fillStyle = '#000'; ctx.globalAlpha = .10; for (let y = 70; y < H - 40; y += 3) ctx.fillRect(48, y, W - 96, 1); ctx.globalAlpha = 1;
    grain(ctx, W, H, fr, .06);
  }
  root.Terminal = { W, H, T, FPS, render, assets: root.MS.A, setMaker: f => { root.MS.A.make = f; } };
})(typeof window !== 'undefined' ? window : globalThis);
