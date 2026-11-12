/* 03 · Cobalt. Material: cobalt as a material on Julia's board (the ripple poster, the blue folders) and the white-on-cobalt
   halftone. The folder GIF, re-illustrated. Four folders are still here, but drawn as what they are in this world:
   four pools of cobalt on pale paper, printed as a halftone of white rings, each ring a thing said. Pools grow when a slip
   falls in (the ink spreads; rings multiply). A plant does not grow. Instead, when the fourth slip lands, a ripple runs
   back across the paper from pool four to pool one and pool one answers with a ring of its own: week one, still live.
   The slip is a real paper slip, lettered, falling with a tumble. Hand-feel comes from the ink bleed, not from wobbly lines. */
(function(root){
  const { C, seg, eo, ei, eio, ss, rng, noise2, bez, partial, stroke, txt, rings, bloom, grain, mark, clamp } = root.MS;
  const W=960, H=540, T=14, FPS=12;
  const PAPER = '#F4F1EA', BLUE = '#1F3FD1', DEEP = '#1430A8';
  const P = [ { x:170, y:330, r0:46, label:'brief', date:'03 mar' }, { x:380, y:300, r0:58, label:'call notes', date:'11 mar' }, { x:600, y:340, r0:70, label:'shelf audit', date:'26 mar' }, { x:810, y:290, r0:40, label:'sampler', date:'09 apr' } ];
  const ARR = [1.2, 3.6, 6.0, 8.4], GROW = 1.4, RIP0 = 9.6, RIP1 = 11.2, OUT0 = 12.8, OUT1 = 13.7;
  const nz = noise2(3);
  const LAM = 7;
  function pool(ctx, p, k, t){
    const dry = ss(OUT0, OUT1, t); const g = eo(seg(t, ARR[k], ARR[k] + GROW)) * (1 - dry), r = p.r0 + 34*g, wob = (a) => 1 + .07*nz(Math.cos(a)*2 + k*5, Math.sin(a)*2 + t*.15);
    // ink: a cobalt blot with a soft, slightly irregular edge
    ctx.save(); ctx.beginPath(); for (let i=0;i<=64;i++){ const a = i/64*Math.PI*2, rr_ = r*wob(a); const x = p.x + Math.cos(a)*rr_, y = p.y + Math.sin(a)*rr_*.86; i ? ctx.lineTo(x,y) : ctx.moveTo(x,y); } ctx.closePath();
    const grd = ctx.createRadialGradient(p.x, p.y, r*.2, p.x, p.y, r); grd.addColorStop(0, BLUE); grd.addColorStop(.85, BLUE); grd.addColorStop(1, DEEP);
    ctx.fillStyle = grd; ctx.fill(); ctx.clip();
    // halftone of white rings: count = how much has been said; weight heavier toward the centre (the oldest)
    const n = Math.floor((p.r0/LAM) + (34*g)/LAM);
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, .86);
    rings(ctx, 0, 0, LAM, n*LAM, LAM, '#fff', rr_ => { const kk = 1 - rr_/(n*LAM); return .4 + 1.6*kk*kk; }, .9);
    ctx.restore(); ctx.restore();
    // newest ring flashes as it arrives
    const fl = ss(ARR[k] + GROW - .3, ARR[k] + GROW, t) * (1 - ss(ARR[k] + GROW + .2, ARR[k] + GROW + 1.0, t));
    if (fl > 0){ ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, .86); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.globalAlpha = fl; ctx.beginPath(); ctx.arc(0, 0, n*LAM, 0, 7); ctx.stroke(); ctx.restore(); }
    return r;
  }
  function slip(ctx, p, k, t){
    const s = seg(t, ARR[k] - 1.0, ARR[k]); if (s <= 0 || s >= 1) return;
    const x0 = p.x + (k%2 ? 90 : -90), y0 = 40, pts = bez([x0, y0], [x0 + (k%2 ? -40 : 40), 140], [p.x + (k%2 ? 30 : -30), p.y - 120], [p.x, p.y - 10], 40);
    const q = pts[Math.floor(ei(s)*40)], rot = (k%2 ? -1 : 1) * (.5 - .9*s) + Math.sin(s*9)*.15*(1-s);
    ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(rot);
    ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(20,48,168,.25)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4; ctx.fillRect(-34, -11, 68, 22); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = BLUE; ctx.lineWidth = 1; ctx.strokeRect(-34.5, -11.5, 69, 23);
    txt(ctx, p.date, 0, 4, { mono:1, size:9, color:BLUE, align:'center', ls:.6 }); ctx.restore();
    // the dip: ink splashes a little as it lands
    const sp = seg(t, ARR[k], ARR[k] + .35); if (sp > 0 && sp < 1){ ctx.strokeStyle = BLUE; ctx.lineWidth = 1.2; ctx.globalAlpha = 1 - sp; ctx.beginPath(); ctx.arc(p.x, p.y - 4, 10 + 36*sp, Math.PI*1.1, Math.PI*1.9); ctx.stroke(); ctx.globalAlpha = 1; }
  }
  function render(ctx, tAbs){
    const t = ((tAbs % T) + T) % T, fr = Math.round(t*FPS);
    ctx.fillStyle = PAPER; ctx.fillRect(0,0,W,H);
    // faint paper tooth
    grain(ctx, W, H, fr, .06);
    const out = 1 - ss(OUT0, OUT1, t);
    // the ripple back: a white-on-blue arc that leaves pool four and travels to pool one across the paper as a blue line
    const rp = eo(seg(t, RIP0, RIP1));
    const rad = P.map((p,k) => pool(ctx, p, k, t));
    if (rp > 0 && rp < 1.2){ const a = P[3], b = P[0]; const pts = bez([a.x - rad[3], a.y - 30], [a.x - 200, 120], [b.x + 220, 110], [b.x + rad[0]*.9, b.y - 20], 60);
      ctx.strokeStyle = BLUE; ctx.lineWidth = 1.6; ctx.setLineDash([2, 6]); ctx.globalAlpha = out; stroke(ctx, partial(pts, rp)); ctx.setLineDash([]); ctx.globalAlpha = 1; }
    // pool one answers: one more white ring, and the label relights
    const ans = ss(RIP1 - .1, RIP1 + .4, t) * out;
    if (ans > 0){ const p = P[0], n = Math.floor(p.r0/LAM + 34/LAM) + 1; ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, .86); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.6; ctx.globalAlpha = ans; ctx.beginPath(); ctx.arc(0, 0, Math.min(n*LAM, rad[0] - 3), 0, 7); ctx.stroke(); ctx.restore();
      txt(ctx, 'week one · still live', p.x, p.y + rad[0]*.86 + 36, { mono:1, size:10, color:BLUE, align:'center', a:ans, ls:.8 }); }
    P.forEach((p, k) => { const lit = t >= ARR[k] && t < ARR[k] + 2.4 && out > .5; txt(ctx, p.label, p.x, p.y + rad[k]*.86 + 20, { size:13, wt: lit ? 500 : 300, color:BLUE, align:'center' }); slip(ctx, p, k, t); });
    const line = clamp((1 - ss(RIP0 - .3, RIP0 + .2, t)) + ss(OUT0, OUT1, t)); if (line > 0) txt(ctx, 'Four places you worked. One record underneath.', 60, 86, { size:16, wt:300, color:BLUE, a:line });
    const l2 = ss(RIP1 + .4, RIP1 + .9, t) * (1 - ss(OUT0 - .3, OUT0 + .3, t)); if (l2 > 0) txt(ctx, 'Nothing you said is filed away.', 60, 86, { size:16, wt:300, color:BLUE, a:l2 });
    mark(ctx, W, H, BLUE);
  }
  root.Cobalt = { W, H, T, FPS, render, ground:[244,241,234], assets: root.MS.A, setMaker: f => { root.MS.A.make = f; } };
})(typeof window !== 'undefined' ? window : globalThis);
