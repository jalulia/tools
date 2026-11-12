/* 05 · Phosphor · my pick. Material: the amber terminals and the bloom-behind-type on Chris's board (Light + Terminal),
   and the "leave, then come back" move that every live Mindgut study shares.
   A single word sits on a near-black screen in warm phosphor, glowing: the thing you were working on. You type a line;
   the screen answers in one line; you leave (the cursor stops; the glow dims to an ember, but never goes out).
   For a long stretch nothing is typed. Four small things arrive at the edge of the screen and are taken in: each one a
   brief flare in the ember and a tick in the margin. Then you come back: the glow rises, and the screen says what you
   missed in four lines, each with a time. The point is the ember. It is a light that means someone is here, kept lit while you are not. */
(function(root){
  const { C, MONO, SANS, clamp, seg, eo, ei, ss, rng, txt, typed, wrap, bloom, grain, mark } = root.MS;
  const W=960, H=540, T=18, FPS=12;
  const BG = '#0A0806', AMB = '#FFB347', AMB2 = '#C27E2A', EMBER = '#5A3A14';
  const BT = { you:1.0, youE:2.6, ans:3.0, ansE:4.4, leave:5.4, away:[7.2, 9.0, 10.8, 12.4], back:13.6, backE:14.6, reply:14.9, replyE:16.8, out0:17.4, out1:17.95 };
  const YOU = '> the lamp. where were we', ANS = 'paper, not cloth · decided 14 mar · the bulb question is still open';
  const AWAY = [ ['09:14', 'brass frame drawing arrived'], ['tue', '90gsm out of stock · reopens the paper'], ['thu', 'launch moved to june'], ['fri', 'burn test photo · it browned'] ];
  const BACK = '> back. what did I miss', REPLY = ['4 things, 9 days.', 'the paper question has two reasons now: stock, and heat.', 'you have a month more than you did.', 'open: re-test the paper. your call.'];
  function render(ctx, tAbs){
    const t = ((tAbs % T) + T) % T, fr = Math.round(t*FPS);
    ctx.fillStyle = BG; ctx.fillRect(0,0,W,H);
    const out = 1 - ss(BT.out0, BT.out1, t);
    // presence: 1 while here, falls to ember after leave, rises on return
    const here = (1 - ss(BT.leave, BT.leave + 1.6, t)) + ss(BT.back, BT.back + .8, t);
    const glow = .18 + .82*clamp(here);
    // the word: THE LAMP, large, phosphor, with bloom behind it (Der Augenblick)
    const cx = 480, cy = 232;
    bloom(ctx, cx, cy, 300, 'rgba(255,179,71,.55)', .55*glow, 20);
    bloom(ctx, cx, cy, 120, 'rgba(255,220,160,.7)', .5*glow, 4);
    txt(ctx, 'THE LAMP', cx, cy + 22, { mono:1, size:64, wt:500, color: AMB, align:'center', a: .35 + .65*glow, ls:6 });
    // flares while away: each incoming thing lifts the ember for a moment
    BT.away.forEach((ta, i) => { const f = seg(t, ta, ta + .25) * (1 - seg(t, ta + .25, ta + 1.4)); if (f > 0) bloom(ctx, cx, cy, 200 + 60*f, 'rgba(255,179,71,.5)', .4*f, 8); });
    // lines above the word: you, then the answer
    const yA = eo(seg(t, BT.you - .2, BT.you)) * (1 - ss(BT.leave + .4, BT.leave + 1.4, t));
    if (yA > 0){ const n = Math.floor(YOU.length * seg(t, BT.you, BT.youE)); txt(ctx, YOU.slice(0, n), 120, 118, { mono:1, size:14, color:'#fff', a:yA });
      if (n < YOU.length && Math.floor(t*6)%2 === 0){ ctx.font = `400 14px ${MONO}`; const w = ctx.measureText(YOU.slice(0,n)).width; ctx.fillStyle = '#fff'; ctx.globalAlpha = yA; ctx.fillRect(120 + w + 3, 106, 8, 15); ctx.globalAlpha = 1; } }
    const aA = eo(seg(t, BT.ans - .2, BT.ans)) * (1 - ss(BT.leave + .4, BT.leave + 1.4, t));
    if (aA > 0){ const n = Math.floor(ANS.length * seg(t, BT.ans, BT.ansE)); txt(ctx, ANS.slice(0, n), 120, 144, { mono:1, size:13, color:AMB, a:aA }); }
    // the leaving: the cursor stops and goes out
    // margin ticks while away: a short line and a time, lower left, dim amber; they stay until the return
    BT.away.forEach((ta, i) => { const a = eo(seg(t, ta, ta + .4)) * (1 - ss(BT.reply, BT.reply + .5, t)) * out; if (a <= 0) return;
      const y = 352 + i*22; ctx.fillStyle = AMB2; ctx.globalAlpha = a; ctx.fillRect(120, y - 5, 14, 1); ctx.globalAlpha = 1;
      txt(ctx, AWAY[i][0], 144, y, { mono:1, size:11, color:AMB2, a, ls:.5 }); txt(ctx, AWAY[i][1], 200, y, { mono:1, size:11, color:AMB2, a: a*.85 }); });
    const awayLbl = ss(BT.leave + 1.2, BT.leave + 1.8, t) * (1 - ss(BT.back - .2, BT.back + .3, t));
    if (awayLbl > 0) txt(ctx, 'you left · the lamp stays lit', 120, 330, { mono:1, size:11, color:AMB2, a:awayLbl, ls:1 });
    // the return
    const bA = eo(seg(t, BT.back - .2, BT.back)) * out;
    if (bA > 0){ const n = Math.floor(BACK.length * seg(t, BT.back, BT.backE)); txt(ctx, BACK.slice(0, n), 120, 118, { mono:1, size:14, color:'#fff', a:bA });
      if (n < BACK.length && Math.floor(t*6)%2 === 0){ ctx.font = `400 14px ${MONO}`; const w = ctx.measureText(BACK.slice(0,n)).width; ctx.fillStyle = '#fff'; ctx.globalAlpha = bA; ctx.fillRect(120 + w + 3, 106, 8, 15); ctx.globalAlpha = 1; } }
    const rA = eo(seg(t, BT.reply - .1, BT.reply + .2)) * out;
    if (rA > 0){ const per = (BT.replyE - BT.reply) / REPLY.length; REPLY.forEach((l, i) => { const k = seg(t, BT.reply + i*per, BT.reply + (i+1)*per); const n = Math.floor(l.length*k); if (n > 0) txt(ctx, l.slice(0, n), 120, 352 + i*22, { mono:1, size:13, color: i === 3 ? '#fff' : AMB, a:rA }); }); }
    // scanlines, faint; the screen is a screen
    ctx.fillStyle = '#000'; ctx.globalAlpha = .14; for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1); ctx.globalAlpha = 1;
    // vignette
    const vg = ctx.createRadialGradient(cx, 270, 200, cx, 270, 640); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = vg; ctx.fillRect(0,0,W,H);
    mark(ctx, W, H, AMB2);
    grain(ctx, W, H, fr, .05);
  }
  root.Phosphor = { W, H, T, FPS, render, ground:[10,8,6], assets: root.MS.A, setMaker: f => { root.MS.A.make = f; } };
})(typeof window !== 'undefined' ? window : globalThis);
