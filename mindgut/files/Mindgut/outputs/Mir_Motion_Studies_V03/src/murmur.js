/* 01 · Murmur. Material: the stipple whale on Julia's board (a murmuration drawn as dots on white).
   The record is a murmuration. Every thing you said is a bird; the flock is denser where you kept returning.
   On white paper, ink dots only, no chrome. The flock drifts and breathes. A question comes in (small, bottom left,
   in your voice). The flock answers by re-forming: a thread of birds peels off and streams back to one old dense knot
   (the decision), a second thread reaches out to a lone bird nobody flew with (the note), and the two threads braid into
   a new small knot at the front (the open move). Then the flock folds it all back in and drifts on, one bird larger.
   The drawing is the whole message; four short words appear and go. Fictional project. */
(function(root){
  const { C, SANS, MONO, clamp, seg, eo, ei, eio, ss, rng, noise2, bez, partial, stroke, txt, stippleSet, stipple, grain, mark } = root.MS;
  const W=960, H=540, T=16, FPS=12;
  const N = 30000, SET = stippleSet(11, 40, 40, 920, 500, N);
  const nz = noise2(5), nz2 = noise2(9);
  // the flock's body: a soft elongated form that drifts. Knots: dense places inside it. Loner: one bird outside.
  const BODY = t => ({ cx: 480 + Math.sin(t/T*2*Math.PI)*14, cy: 250 + Math.cos(t/T*2*Math.PI)*8, rx: 350, ry: 88, tilt: -.08 + Math.sin(t/T*2*Math.PI)*.04 });
  const KNOTS = [ { x:-120, y:20, r:50, w:.55 }, { x:40, y:30, r:60, w:.45 }, { x:200, y:34, r:56, w:.5 }, { x:290, y:0, r:30, w:.35 } ];   // in body space
  const DEC = KNOTS[0], LONER = { x: 820, y: 452 };            // the decision knot; the loner in page space
  const FRONT = { x: 360, y: -60 };                              // where the new knot forms (body space)
  const BT = { q:2.0, t1:3.0, t1e:5.4, t2:5.6, t2e:7.6, braid:7.8, braide:9.4, hold:9.4, fold:11.6, folde:13.4, out:14.6 };
  function field(t){
    const B = BODY(t), cs = Math.cos(B.tilt), sn = Math.sin(B.tilt);
    const r1 = eo(seg(t, BT.t1, BT.t1e)), r2 = eo(seg(t, BT.t2, BT.t2e)), br = eo(seg(t, BT.braid, BT.braide)), fold = ss(BT.fold, BT.folde, t);
    const grown = ss(BT.folde - .5, BT.folde + .5, t);
    return (px, py) => {
      // page -> body space
      const dx = px - B.cx, dy = py - B.cy, bx = dx*cs + dy*sn, by = -dx*sn + dy*cs;
      // base body: superellipse falloff with noise edge
      // a whale, drawn as a signed distance in body space (bx along the length, by across). Head right, tail left.
      const u = bx / B.rx;                                                     // -1 tail … +1 head
      // body half-height along the length: blunt head, deep chest, tapering peduncle
      let hh = B.ry * (u > .55 ? Math.sqrt(clamp(1 - ((u-.55)/.45)**2)) * .95 + .05 : u > -.45 ? 1 - .12*((u-.3)/.75)**2 : clamp((u + 1.05)/.6) * .55 + .05);
      // belly sags, back is flatter: shift the centreline down toward the belly as u goes to the head
      const cl = 10 + 12*u;
      let d = Math.abs(by - cl) / Math.max(6, hh);                             // 0 at centreline, 1 at skin
      // the fluke: two lobes at the tail end
      const fu = (bx + B.rx*1.02) / 70, fv = by / 48;                           // fluke-local coords
      const fl = fu > -.1 && fu < 1.1 ? Math.max(0, 1 - Math.abs(fv*fv*1.4 - fu*.9) * 1.6 - Math.abs(fu - .5)*.4) : 0;
      // the dorsal: a small bump
      const du = (u - .05) / .18, dv = (by - cl + hh*.9) / 14, dor = Math.max(0, 1 - du*du - dv*dv);
      const inside = Math.max(clamp(1.08 - d*d), fl * 1.1, dor * .9);
      const edge = nz(px/60 + t*.04, py/60) * .32 + nz2(px/22, py/22 + t*.07) * .22;
      // density: full inside, a little lighter along the back (light hits the back), heavier under the belly
      let v = clamp(inside*1.15 - edge*.55) * (.82 + .18*clamp((by - cl)/hh + .5));
      // a mottled skin: slow noise so the stipple has waves in it
      v *= .8 + .2*nz(px/34 + 3, py/34 + t*.03);
      // knots: dense
      for (const k of KNOTS){ const d = Math.hypot(bx - k.x, by - k.y); v += k.w * .55 * Math.exp(-(d*d)/(k.r*k.r)); }
      // thread 1: from the front of the body back to DEC, a thin streamer; grows along its length
      if (r1 > 0){ const p0 = [FRONT.x, FRONT.y], p3 = [DEC.x, DEC.y]; const pts = bez(p0, [p0[0]-80, p0[1]-70], [p3[0]+120, p3[1]-110], p3, 40);
        const n = Math.max(1, Math.floor(r1*40)); let m = 1e9; for (let i=0;i<=n;i++){ const d = Math.hypot(bx - pts[i][0], by - pts[i][1]); if (d < m) m = d; }
        v += .95 * Math.exp(-(m*m)/(8*8)) * (1 - fold); }
      // thread 2: from DEC out to the loner (page space -> body space for the loner)
      if (r2 > 0){ const lx = (LONER.x - B.cx)*cs + (LONER.y - B.cy)*sn, ly = -(LONER.x - B.cx)*sn + (LONER.y - B.cy)*cs;
        const pts = bez([DEC.x, DEC.y], [DEC.x + 200, DEC.y + 160], [lx - 160, ly + 40], [lx, ly], 40);
        const n = Math.max(1, Math.floor(r2*40)); let m = 1e9; for (let i=0;i<=n;i++){ const d = Math.hypot(bx - pts[i][0], by - pts[i][1]); if (d < m) m = d; }
        v += .9 * Math.exp(-(m*m)/(8*8)) * (1 - fold); }
      // the new knot at the front: braids in, stays after the fold (the record grew)
      if (br > 0){ const d = Math.hypot(bx - FRONT.x, by - FRONT.y); v += (.5*br*(1 - fold) + .42*grown) * Math.exp(-(d*d)/(34*34)); }
      // the loner itself
      { const d = Math.hypot(px - LONER.x, py - LONER.y); v += .8 * Math.exp(-(d*d)/(7*7)) * (1 - .6*fold); }
      // after the fold, DEC and the loner are a little denser: they were used
      v += grown * .25 * Math.exp(-(Math.hypot(bx - DEC.x, by - DEC.y)**2)/(50*50));
      return v;
    };
  }
  function render(ctx, tAbs){
    const t = ((tAbs % T) + T) % T, fr = Math.round(t*FPS);
    ctx.fillStyle = C.white; ctx.fillRect(0,0,W,H);
    const f = field(t);
    stipple(ctx, SET, f, C.ink, 1.05, .96);
    // the question, in your voice: small, lower left, hand-set
    const qA = eo(seg(t, BT.q, BT.q + .4)) * (1 - ss(BT.fold, BT.fold + .6, t));
    if (qA > 0) txt(ctx, 'where did we land on the ending?', 60, 486, { size:15, wt:300, color:C.ink, a:qA });
    // Mir's four words, placed where the drawing is doing the thing
    const B = BODY(t), cs = Math.cos(B.tilt), sn = Math.sin(B.tilt), toPage = (bx, by) => [B.cx + bx*cs - by*sn, B.cy + bx*sn + by*cs];
    const w1 = ss(BT.t1e - .3, BT.t1e + .2, t) * (1 - ss(BT.fold, BT.fold + .5, t)); if (w1 > 0){ const p = toPage(DEC.x, DEC.y + DEC.r + 30); txt(ctx, 'decided · march', p[0], p[1], { mono:1, size:10, color:C.ink, align:'center', a:w1, ls:.5 }); }
    const w2 = ss(BT.t2e - .3, BT.t2e + .2, t) * (1 - ss(BT.fold, BT.fold + .5, t)); if (w2 > 0) txt(ctx, 'never linked · april', LONER.x, LONER.y + 24, { mono:1, size:10, color:C.ink, align:'center', a:w2, ls:.5 });
    const w3 = ss(BT.braide - .3, BT.braide + .2, t) * (1 - ss(BT.fold, BT.fold + .5, t)); if (w3 > 0){ const p = toPage(FRONT.x, FRONT.y - 46); txt(ctx, 'open · end on the rain?', p[0], p[1], { mono:1, size:10, color:C.orange, align:'center', a:w3, ls:.5 }); }
    const w4 = ss(BT.folde, BT.folde + .5, t) * (1 - ss(T - .8, T - .2, t)); if (w4 > 0) txt(ctx, 'one bird larger.', 900, 486, { size:15, wt:300, color:C.ink, align:'right', a:w4 });
    mark(ctx, W, H, C.ink);
    grain(ctx, W, H, fr, .04);
  }
  root.Murmur = { W, H, T, FPS, render, ground:[255,255,255], assets: root.MS.A, setMaker: f => { root.MS.A.make = f; } };
})(typeof window !== 'undefined' ? window : globalThis);
