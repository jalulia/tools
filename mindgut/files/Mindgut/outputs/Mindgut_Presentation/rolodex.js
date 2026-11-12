/* Mir · Rolodex. Concept animation, fictional project. Not a product recording.
   Someone asks Mir to pick a project back up. Mir flips back through the cards, fast then slow,
   notices a fragment on the way (a violet flag stays out), and lands on the decision. The card
   shows what was decided, what it now connects to, and an open next move. Loops seamlessly.
   Rolodex.render(ctx, t) draws the 960x540 frame at t seconds. */
(function(root){
  const W=960, H=540, T=12, FPS=12;
  const C = { ink:'#15171E', ink2:'#454C5E', ink3:'#868D9D', rule:'#D3D8E0', faint:'#EDF0F4', blue:'#2445D6', orange:'#EB5F2C', violet:'#9C8FD6' };
  const SANS = '"Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif', MONO = '"JetBrains Mono", Menlo, monospace';
  const A = { robot:null, wm:null, make:(w,h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; } };
  const clamp = (x,a=0,b=1) => x<a?a:x>b?b:x, seg = (t,a,b) => clamp((t-a)/(b-a)), eo = x => 1-Math.pow(1-x,3);
  const ss = (a,b,x) => { const k = seg(x,a,b); return k*k*(3-2*k); };
  function txt(ctx, s, x, y, o={}){ ctx.font = `${o.wt||400} ${o.size||12}px ${o.mono ? MONO : SANS}`; ctx.fillStyle = o.color || C.ink;
    ctx.globalAlpha = (o.a ?? 1) * (ctx._a ?? 1); ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic';
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = (o.ls || 0) + 'px'; ctx.fillText(s, x, y);
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px'; ctx.globalAlpha = 1; ctx.textAlign = 'left'; }
  function wrap(ctx, s, w){ const o=[]; let c=''; s.split(' ').forEach(x => { const t = c ? c+' '+x : x; if (ctx.measureText(t).width > w && c){ o.push(c); c = x; } else c = t; }); if (c) o.push(c); return o; }
  function typed(ctx, s, x, y, w, chars, o){ ctx.font = `${o.wt||400} ${o.size}px ${SANS}`; let left = chars;
    wrap(ctx, s, w).forEach((l,i) => { const v = l.slice(0, Math.max(0,left)); left -= l.length + 1; if (v) txt(ctx, v, x, y + i*o.lh, o); }); }
  function rr(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
  function wordmark(ctx, x, y, h){ if (!A.wm) return; if (!A._wm){ const c = A.make(A.wm.width, A.wm.height), q = c.getContext('2d');
      q.drawImage(A.wm,0,0); q.globalCompositeOperation = 'source-in'; q.fillStyle = C.ink; q.fillRect(0,0,c.width,c.height); A._wm = c; }
    ctx.drawImage(A._wm, x, y, A._wm.width*h/A._wm.height, h); }

  /* the cards, newest first: Mir flips back in time */
  const CARDS = [
    ['09 MAY','Title?','three options, none loved','dana'], ['06 MAY','Act 2 cut','lost 40 seconds, kept the stairs','dana'],
    ['02 MAY','Colour pass','cooler blacks in the hallway','mir'], ['29 APR','Callback','Ada reads the last line again','dana'],
    ['24 APR','Permit','stairwell, Sundays only','dana'], ['18 APR','Score','strings, no drums','mir'],
    ['12 APR','Her voice','quieter in the close-ups','dana'], ['08 APR','Temp score','too much piano','mir'],
    ['02 APR','Stairwell scout','audio: rain on the skylight','dana'], ['27 MAR','Dawn light','shoot the exterior at 6:10','dana'],
    ['21 MAR','Act 3 beat','she doesn\u2019t look back','mir'], ['14 MAR','Ending','the door closes on her','dana'] ];
  const FLAG = 8, TARGET = 11;
  // flip times: quick at first, slowing into the landing
  const FL = []; (function(){ let t = 3.05; for (let i=0;i<TARGET;i++){ const d = .17 + .5*Math.pow(i/(TARGET-1), 2.2); FL.push([t, t + d*.9]); t += d; } })();
  const LAND = FL[TARGET-1][1];
  const BT = { q0:.7, q1:2.3, mir:2.6, mark0:LAND + .15, mark1:LAND + .65, f1:LAND + .55, f2:LAND + .95, f3:LAND + 1.35,
               r0:LAND + .6, r1:LAND + 2.0, out0:10.9, out1:11.7 };
  const Q = "hey mir, can we pick back up on the short film? where did we leave the ending?";
  const R = "We left it on the door closing, decided 14 March. On the way back I passed your stairwell scout from 2 April: there\u2019s rain on the audio. It could carry the last shot.";

  // card face geometry
  const CX = 480, CW = 316, CH = 168, CY = 236, HINGE = CY + CH;

  /* one card face, drawn in its own space (0..CW, 0..CH), with a slot at the bottom */
  function face(ctx, i, o={}){
    const c = CARDS[i], x0 = 0, y0 = 0;
    ctx.fillStyle = '#fff'; rr(ctx, x0, y0, CW, CH, 7); ctx.fill();
    ctx.strokeStyle = o.target ? C.blue : C.rule; ctx.lineWidth = o.target ? 1.4 : 1; ctx.stroke();
    ctx.fillStyle = C.faint; ctx.fillRect(18, 44, CW-36, 1);
    txt(ctx, c[0], 18, 30, { mono:1, size:10.5, color: o.target ? C.blue : C.ink3, ls:.8 });
    txt(ctx, c[3] === 'mir' ? 'MIR' : 'DANA', CW-18, 30, { mono:1, size:9.5, color:C.ink3, ls:.8, align:'right' });
    txt(ctx, c[1], 18, 78, { size:22, wt:600, color:C.ink });
    txt(ctx, c[2], 18, 102, { size:13.5, wt:400, color:C.ink2 });
    // slot
    ctx.fillStyle = '#F4F6F9'; rr(ctx, CW/2 - 30, CH - 14, 60, 7, 3.5); ctx.fill();
    for (let k=0;k<5;k++){ ctx.fillStyle = '#E6E9EF'; ctx.fillRect(18 + k*7, CH - 22, 3, 3); }
  }

  /* A card stands on the rail with its bottom edge on the hinge line. Flipping toward us, the top
     edge comes forward and down: the face foreshortens (scaleY = cos a) and then its back passes
     below the rail. Foreshortened faces also get a slight perspective widening at the near edge. */
  function standing(ctx, i, a, o={}){
    const k = Math.cos(a); if (k <= .02) return;
    const h = CH*k, near = 1 + .07*(1-k);                 // the top edge widens as it comes toward us
    ctx.save();
    ctx.translate(CX, HINGE);
    // perspective: draw face into scratch, then slice rows with growing width
    const sc = scratch(), sx = sc.getContext('2d'); sx.setTransform(1,0,0,1,0,0); sx.clearRect(0,0,sc.width,sc.height);
    sx.save(); sx.translate(2,2); face(sx, i, o); sx.restore();
    const rows = 28;
    for (let r=0;r<rows;r++){
      const v0 = r/rows, v1 = (r+1)/rows, w = CW*(1 + (near-1)*(1 - (v0+v1)/2));
      const y0 = -h + v0*h, y1 = -h + v1*h;
      ctx.drawImage(sc, 2, 2 + v0*CH, CW, CH/rows + .5, -w/2, y0, w, (y1-y0) + .6);
    }
    if (o.dim){ ctx.globalAlpha = o.dim; ctx.fillStyle = '#fff'; ctx.fillRect(-CW*near/2, -h, CW*near, h); ctx.globalAlpha = 1; }
    ctx.restore();
  }
  function fallen(ctx, a, flag){            // back of a card that has gone past the rail, lying toward us
    const k = -Math.cos(a); if (k <= .02) return;
    const h = 46*k, w = CW*(1.07 + .05*k);
    ctx.save(); ctx.translate(CX, HINGE);
    ctx.fillStyle = '#F7F8FA'; ctx.strokeStyle = C.rule; ctx.lineWidth = 1; rr(ctx, -w/2, 2, w, h, 5); ctx.fill(); ctx.stroke();
    if (flag){ ctx.fillStyle = C.violet; ctx.fillRect(w/2 - 52, 2 + h - 4, 34, 4); }
    ctx.restore();
  }
  let _sc = null; function scratch(){ if (!_sc) _sc = A.make(CW + 4, CH + 4); return _sc; }

  function flipAngle(i, t){                 // card i: 0 until its flip, then falls to PI
    if (i >= TARGET) return 0; const [a0, a1] = FL[i]; const p = seg(t, a0, a1); return Math.PI * (p*p*(3-2*p));
  }

  function render(ctx, tAbs){
    const t = ((tAbs % T) + T) % T;
    // reset: cards rise back up together at the end of the loop
    const reset = ss(BT.out0 + .1, BT.out1, t), out = 1 - ss(BT.out0, BT.out1 - .2, t);
    ctx.save(); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,W,H);
    wordmark(ctx, 50, 33, 17);
    txt(ctx, 'PICK BACK UP · A SHORT FILM', 910, 47, { mono:1, size:10.5, color:C.ink3, align:'right', ls:.6 });
    ctx.fillStyle = C.faint; ctx.fillRect(50, 64, 860, 1);

    /* the question */
    const qA = eo(seg(t, BT.q0 - .3, BT.q0)) * out;
    if (qA > 0){ ctx.font = `450 14px ${SANS}`;
      const ch = Math.max(1, Math.floor(Q.length * seg(t, BT.q0, BT.q1))), shown = Q.slice(0, ch), nl = Math.max(1, wrap(ctx, shown, 344).length);
      const qW = nl > 1 ? 372 : Math.max(60, ctx.measureText(shown).width + 28), qH = 18 + nl*19, qx = 910 - qW, qy = 84 + (1-qA)*6;
      ctx.globalAlpha = qA; ctx.fillStyle = C.ink; rr(ctx, qx, qy, qW, qH, 12); ctx.fill();
      ctx.beginPath(); ctx.moveTo(880, qy + qH); ctx.lineTo(892, qy + qH + 8); ctx.lineTo(894, qy + qH); ctx.fill(); ctx.globalAlpha = 1;
      typed(ctx, Q, qx + 14, qy + 23, 344, ch, { size:14, wt:450, color:'#fff', lh:19, a:qA }); }

    /* rail and index: where in time Mir is */
    const railA = 1;
    ctx.fillStyle = C.rule; ctx.fillRect(CX - 230, HINGE + 1, 460, 1);
    ctx.fillStyle = C.ink; ctx.fillRect(CX - 236, HINGE - 4, 4, 10); ctx.fillRect(CX + 232, HINGE - 4, 4, 10);
    let cur = 0; for (let i=0;i<TARGET;i++) if (flipAngle(i, t) > Math.PI/2) cur = i+1;
    if (reset > 0) cur = Math.round(cur * (1 - reset));
    const tick = (i) => CX - 210 + i*(420/(CARDS.length-1));
    for (let i=0;i<CARDS.length;i++){ const x = tick(i), on = i === cur;
      ctx.fillStyle = i === FLAG && t > FL[FLAG][1] && reset < .5 ? C.violet : on ? C.blue : '#C3C9D3';
      ctx.fillRect(x - .5, HINGE + 66, 1, on ? 9 : 5); }
    txt(ctx, CARDS[CARDS.length-1][0], tick(CARDS.length-1), HINGE + 92, { mono:1, size:9.5, color:C.ink3, align:'center', ls:.6 });
    txt(ctx, CARDS[0][0], tick(0), HINGE + 92, { mono:1, size:9.5, color:C.ink3, align:'center', ls:.6 });
    txt(ctx, '← FLIPPING BACK', CX, HINGE + 92, { mono:1, size:9.5, color: t > FL[0][0] && t < LAND ? C.ink2 : C.ink3, align:'center', ls:.6 });

    /* the stack: unflipped cards behind, the current card in front, fallen backs below */
    // fallen backs (older flips lower)
    for (let i=0;i<TARGET;i++){ const a = reset > 0 ? Math.PI*(1 - reset) : flipAngle(i, t); if (a > Math.PI/2) fallen(ctx, a, i === FLAG); }
    // cards still standing, back to front: show the edges of the next few
    for (let i=CARDS.length-1;i>=0;i--){
      const a = reset > 0 ? Math.PI * Math.max(0, (flipAngle(i, BT.out0) / Math.PI) - reset) : flipAngle(i, t);
      if (a >= Math.PI/2) continue;
      const depth = i - cur; if (depth > 3) continue;
      if (depth === 1){ standing(ctx, i, 0, {}); if (i === FLAG){ ctx.fillStyle = C.violet; ctx.fillRect(CX + CW/2 - 44, HINGE - CH - 6, 26, 8); } continue; }
      if (depth > 0){ // peeking edges behind the front card
        ctx.save(); ctx.translate(CX, HINGE); const w = CW - (depth-1)*14, hh = CH + (depth-1)*7;
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#DCE0E7'; ctx.lineWidth = 1; rr(ctx, -w/2, -hh, w, hh, 7); ctx.fill(); ctx.stroke();
        if (i === FLAG){ ctx.fillStyle = C.violet; ctx.fillRect(w/2 - 44, -hh - 6, 26, 8); }
        ctx.restore(); continue; }
      standing(ctx, i, a, { target: i === TARGET && t > BT.mark0 });
      if (i === FLAG && a < Math.PI/2){ const k = Math.cos(a); ctx.fillStyle = C.violet; ctx.fillRect(CX + CW/2 - 44, HINGE - CH*k - 6, 26, 8); }
    }

    /* landing: Mir marks the card; decision on the left, connection and next move on the right */
    const mk = eo(seg(t, BT.mark0, BT.mark1)) * out;
    if (mk > 0){
      // hand-pressure circle around the title, drawn once
      const cx = CX - CW/2 + 18 + 38, cy = HINGE - CH + 71, pts = [];
      for (let i=0;i<=56;i++){ const u = i/56, a = -2.3 + u*(6.283 + .5); pts.push([cx + Math.cos(a)*(58 + u*3), cy + Math.sin(a)*(19 + u*1.5) - u*2]); }
      const n = Math.max(2, Math.round(pts.length*mk)), L = [], R2 = [];
      for (let i=0;i<n;i++){ const u = i/(pts.length-1), p = Math.pow(Math.min(1,u/.08),.5)*Math.pow(Math.min(1,(1-u)/.25),.7), w = 1 + 1.6*p;
        const a = pts[Math.max(0,i-1)], b = pts[Math.min(pts.length-1,i+1)]; let dx = b[0]-a[0], dy = b[1]-a[1]; const l = Math.hypot(dx,dy)||1; dx/=l; dy/=l;
        L.push([pts[i][0]-dy*w/2, pts[i][1]+dx*w/2]); R2.push([pts[i][0]+dy*w/2, pts[i][1]-dx*w/2]); }
      ctx.fillStyle = C.blue; ctx.beginPath(); L.forEach((p,i) => i ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1])); R2.reverse().forEach(p => ctx.lineTo(p[0],p[1])); ctx.closePath(); ctx.fill();
    }
    const chip = (x, y, w, l1, l2, col, a, dashed) => { if (a <= 0) return;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1-a)*5);
      ctx.fillStyle = '#fff'; rr(ctx, x, y, w, 44, 6); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.2; if (dashed) ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore(); txt(ctx, l1, x + 12, y + 17 + (1-a)*5, { mono:1, size:9.5, color:col, ls:.6, a }); txt(ctx, l2, x + 12, y + 34 + (1-a)*5, { size:13, wt:450, color:C.ink, a }); };
    const a1 = eo(seg(t, BT.f1, BT.f1 + .4)) * out, a2 = eo(seg(t, BT.f2, BT.f2 + .4)) * out, a3 = eo(seg(t, BT.f3, BT.f3 + .4)) * out;
    // leaders
    ctx.lineWidth = 1;
    if (a1 > 0){ ctx.globalAlpha = a1; ctx.strokeStyle = C.blue; ctx.beginPath(); ctx.moveTo(286, 300); ctx.lineTo(CX - CW/2 - 6, 300); ctx.stroke(); ctx.globalAlpha = 1; }
    if (a2 > 0){ ctx.globalAlpha = a2; ctx.strokeStyle = C.violet; ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(CX + CW/2 + 6, 282); ctx.lineTo(668, 282); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tick(FLAG), HINGE + 62); ctx.bezierCurveTo(tick(FLAG), HINGE + 30, 700, HINGE + 10, 700, 304); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }
    if (a3 > 0){ ctx.globalAlpha = a3; ctx.strokeStyle = C.orange; ctx.beginPath(); ctx.moveTo(CX + CW/2 + 6, 352); ctx.lineTo(668, 352); ctx.stroke(); ctx.globalAlpha = 1; }
    chip(70, 278, 216, 'DECIDED · 14 MAR', 'end on the door closing', C.blue, a1);
    chip(668, 260, 242, 'CONNECTS · 02 APR', 'stairwell audio: rain', C.violet, a2, true);
    chip(668, 330, 242, 'OPEN · NEXT MOVE', 'cut the last shot to the rain', C.orange, a3);

    /* Mir: the real robot, a status while flipping, then the reply */
    const mA = eo(seg(t, BT.mir - .3, BT.mir)) * out;
    if (mA > 0 && A.robot){ ctx.globalAlpha = mA; ctx.drawImage(A.robot, 50, 86, 34, 34*A.robot.height/A.robot.width); ctx.globalAlpha = 1;
      txt(ctx, 'MIR', 92, 98, { mono:1, size:9.5, color:C.ink3, ls:.8, a:mA });
      if (t < BT.r0){ const c = CARDS[Math.min(cur, CARDS.length-1)];
        txt(ctx, t < FL[0][0] ? 'looking back through the project' : 'flipping back · ' + c[0].toLowerCase(), 120, 98, { mono:1, size:11, color:C.ink2, a:mA }); }
      else { const ch = Math.floor(R.length * seg(t, BT.r0, BT.r1)); typed(ctx, R, 120, 98, 372, ch, { size:15, wt:450, color:C.ink, lh:21, a:mA }); }
    }
    txt(ctx, 'CONCEPT ANIMATION · FICTIONAL PROJECT', 50, 516, { mono:1, size:9.5, color:C.ink3, ls:.5 });
    txt(ctx, 'RESUME · CONNECT · DEVELOP', 910, 516, { mono:1, size:9.5, color:C.ink3, align:'right', ls:.5 });
    ctx.restore();
  }
  root.Rolodex = { render, W, H, T, FPS, assets:A, setMaker:f => A.make = f };
})(typeof window !== 'undefined' ? window : globalThis);
