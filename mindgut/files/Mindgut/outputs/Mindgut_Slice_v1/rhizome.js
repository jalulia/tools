/* Mir · Rhizome. Concept animation, fictional project. Not a product recording.
   Context as a rhizome, not a sequence: every exchange becomes a node the moment it reaches NOW,
   and reaches back to earlier nodes, not just the last one. Contexts that keep being drawn on grow.
   Once per loop someone asks Mir to pick a project back up: Mir resumes (the path back lights),
   connects (two distant nodes join), and leaves an open next move. The field is periodic in
   world-x and scrolls exactly one period per loop, so the loop is seamless.
   Rhizome.render(ctx, t) draws the 960x540 frame at t seconds. Same file for browser and Node. */
(function(root){
  const W=960, H=540, T=12, FPS=12, P=660, NOW=704, FY0=262, FY1=432, AXY=466, WK=66;
  const C = { ink:'#15171E', ink2:'#454C5E', ink3:'#868D9D', rule:'#D3D8E0', dot:'#E4E8EE',
              blue:'#2445D6', orange:'#EB5F2C', violet:'#9C8FD6' };
  const SANS = '"Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif', MONO = '"JetBrains Mono", Menlo, monospace';
  const A = { robot:null, wm:null, make:(w,h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; } };
  const clamp = (x,a=0,b=1) => x<a?a:x>b?b:x, seg = (t,a,b) => clamp((t-a)/(b-a)), eo = x => 1-Math.pow(1-x,3);
  const ss = (a,b,x) => { const k = seg(x,a,b); return k*k*(3-2*k); };
  function rng(seed){ let s = (seed*2654435761)>>>0; return () => { s = (s + 0x6D2B79F5)>>>0; let t = s;
    t = Math.imul(t ^ t>>>15, t|1); t ^= t + Math.imul(t ^ t>>>7, t|61); return ((t ^ t>>>14)>>>0)/4294967296; }; }
  function bez(p0,p1,p2,p3,n){ const o=[]; for(let i=0;i<=n;i++){ const t=i/n, m=1-t;
    o.push([m*m*m*p0[0]+3*m*m*t*p1[0]+3*m*t*t*p2[0]+t*t*t*p3[0], m*m*m*p0[1]+3*m*m*t*p1[1]+3*m*t*t*p2[1]+t*t*t*p3[1]]); } return o; }
  function partial(pts, p){
    if (p >= 1) return pts; if (p <= 0) return [];
    const L=[0]; for (let i=1;i<pts.length;i++) L.push(L[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]));
    const tg = L[L.length-1]*p, o=[pts[0]];
    for (let i=1;i<pts.length;i++){ if (L[i] <= tg) o.push(pts[i]); else { const f=(tg-L[i-1])/((L[i]-L[i-1])||1); o.push([pts[i-1][0]+(pts[i][0]-pts[i-1][0])*f, pts[i-1][1]+(pts[i][1]-pts[i-1][1])*f]); break; } }
    return o;
  }
  function stroke(ctx, pts){ if (pts.length < 2) return; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); }

  /* ---- time: the field drifts, and almost stops while Mir works ---- */
  const N = 2400, TAB = new Float64Array(N+1);
  (function(){ let s = 0; const sp = t => 1 - .9*ss(2.5,3.3,t)*(1-ss(10.7,11.5,t));
    for (let i=1;i<=N;i++){ s += sp((i-.5)/N*T)*T/N; TAB[i] = s; } for (let i=0;i<=N;i++) TAB[i] *= P/s; })();
  function scroll(t){ const per = Math.floor(t/T), u = (t-per*T)/T*N, i = Math.min(N-1, Math.floor(u)), f = u-i; return per*P + TAB[i] + (TAB[i+1]-TAB[i])*f; }
  function tAt(v){ const per = Math.floor(v/P), r = v-per*P; let lo = 0, hi = N;
    while (hi-lo > 1){ const m = (lo+hi)>>1; if (TAB[m] <= r) lo = m; else hi = m; }
    return per*T + (lo + (r-TAB[lo])/((TAB[hi]-TAB[lo])||1))/N*T; }

  const BT = { card:3.0, type0:3.15, type1:4.55, path:[4.75,5.35,5.95,6.55], reply0:6.7, reply1:7.7,
               conn0:7.9, conn1:8.9, dev0:9.1, dev1:9.8, out0:10.9, out1:11.6 };
  const TM = 6.8, SM = scroll(TM);

  /* ---- the graph: one period of nodes in world-x, repeated. Edges reach back across lanes ---- */
  const LANES = { ending:290, cast:322, score:356, location:390, edit:418 };
  const AMB = { ending:['cold open','act 3 beat','last line?'], cast:['casting: Ada','callback','her voice'],
    score:['temp score','strings, no drums','silence?'], location:['the stairwell','dawn light','permit'], edit:['assembly','act 2 cut','title?'] };
  const G = (function(){
    const r = rng(2026), base = [];
    const S = { target: (SM - 580), n2: (SM - 402), n3: (SM - 236), B: (SM - 148), D: scroll(BT.dev0) };
    const mod = x => ((x % P) + P) % P;
    const special = [
      { key:'target', wx:mod(S.target), lane:'ending', who:'user', label:'THE DOOR · ENDING' },
      { key:'n2', wx:mod(S.n2), lane:'edit', who:'mir', label:'' },
      { key:'n3', wx:mod(S.n3), lane:'score', who:'user', label:'' },
      { key:'B', wx:mod(S.B), lane:'location', who:'user', label:'' },
      { key:'D', wx:mod(S.D), lane:'ending', who:'mir', label:'NEXT · END ON THE RAIN', open:true } ];
    const keys = Object.keys(LANES);
    for (let x = 8; x < P; x += 30 + r()*26){
      if (special.some(s => Math.abs(s.wx - x) < 18 || Math.abs(s.wx - x) > P-18)) continue;
      const lane = keys[Math.floor(r()*keys.length)];
      base.push({ wx:x, lane, who: r() < .5 ? 'user' : 'mir', label:'', amb: AMB[lane][Math.floor(r()*3)] });
    }
    special.forEach(s => base.push(s));
    base.sort((a,b) => a.wx - b.wx);
    base.forEach((n,i) => { n.i = i; n.y = LANES[n.lane] + (n.key ? 0 : (rng(i*7+3)()-.5)*20); });
    const idx = k => base.find(n => n.key === k).i;
    // references: relative (index, period offset) so every copy has the same structure
    const back = (i, lo, hi) => { const o = []; base.forEach((m,j) => { let d = base[i].wx - m.wx; let off = 0; if (d <= 0){ d += P; off = -1; } if (d > lo && d < hi) o.push({ j, off, d }); }); return o; };
    base.forEach((n,i) => {
      n.refs = [];
      if (n.key === 'D'){ n.refs = [{ j:idx('target'), off: base[idx('target')].wx < n.wx ? 0 : -1 }, { j:idx('B'), off: base[idx('B')].wx < n.wx ? 0 : -1 }]; return; }
      if (n.key === 'n2'){ n.refs = [{ j:idx('target'), off: base[idx('target')].wx < n.wx ? 0 : -1 }]; }
      if (n.key === 'n3'){ n.refs = [{ j:idx('n2'), off: base[idx('n2')].wx < n.wx ? 0 : -1 }]; }
      const rr = rng(i*31+5), cand = back(i, 14, 520).filter(c => !base[c.j].open);
      const want = n.key ? 1 : (rr() < .5 ? 1 : 2);
      for (let k=0;k<want && cand.length;k++){
        const same = cand.filter(c => base[c.j].lane === n.lane), pool = (same.length && rr() < .55) ? same : cand;
        const far = rr() < .3, pick = far ? pool.reduce((a,b) => a.d > b.d ? a : b) : pool[Math.floor(rr()*pool.length)];
        if (!n.refs.some(q => q.j === pick.j && q.off === pick.off) && !(n.key === 'target' && base[pick.j].key)) n.refs.push({ j:pick.j, off:pick.off });
        cand.splice(cand.indexOf(pick), 1);
      }
    });
    return { base, S, idx };
  })();
  // every node copy currently on screen, with absolute world X
  function visible(s){
    const out = [], k0 = Math.floor((s - NOW - 60)/P), k1 = Math.floor(s/P) + 1;
    for (let k=k0;k<=k1;k++) G.base.forEach(n => { const X = n.wx + k*P, x = X - s + NOW; if (x > -60 && X <= s + .01) out.push({ n, X, k, x }); });
    return out;
  }
  const born = (X, t) => tAt(X);                               // absolute time a node reaches NOW

  // who draws on whom: referrers per base node, to grow nodes as they keep being used
  const REFBY = G.base.map(() => []);
  G.base.forEach((n,i) => n.refs.forEach(q => REFBY[q.j].push({ i, off:q.off })));
  const keyed = k => G.base[G.idx(k)];

  function txt(ctx, s, x, y, o={}){ ctx.font = `${o.wt||400} ${o.size||12}px ${o.mono ? MONO : SANS}`; ctx.fillStyle = o.color || C.ink;
    ctx.globalAlpha = o.a ?? 1; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic';
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = (o.ls || 0) + 'px'; ctx.fillText(s, x, y);
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px'; ctx.globalAlpha = 1; ctx.textAlign = 'left'; }
  function wrap(ctx, s, w){ const o=[]; let c=''; s.split(' ').forEach(x => { const t = c ? c+' '+x : x; if (ctx.measureText(t).width > w && c){ o.push(c); c = x; } else c = t; }); if (c) o.push(c); return o; }
  function typed(ctx, s, x, y, w, chars, o){ ctx.font = `${o.wt||400} ${o.size}px ${SANS}`; let left = chars;
    wrap(ctx, s, w).forEach((l,i) => { const v = l.slice(0, Math.max(0,left)); left -= l.length + 1; if (v) txt(ctx, v, x, y + i*o.lh, o); }); }
  function rr(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
  function edgePts(x1,y1,x2,y2,seed){ const dx = x2-x1, up = (Math.sin(seed*12.9898)*43758.5 % 1 + 1) % 1 < .5 ? -1 : 1;
    let h = Math.min(54, 10 + dx*.12)*up; const lo = FY0 - 4 - Math.min(y1,y2), hi = FY1 + 4 - Math.max(y1,y2); h = Math.max(lo*1.33, Math.min(hi*1.33, h));
    return bez([x1,y1],[x1+dx*.32, y1+h],[x2-dx*.32, y2+h],[x2,y2], 26); }
  function wordmark(ctx, x, y, h){ if (!A.wm) return; if (!A._wm){ const c = A.make(A.wm.width, A.wm.height), q = c.getContext('2d');
      q.drawImage(A.wm,0,0); q.globalCompositeOperation = 'source-in'; q.fillStyle = C.ink; q.fillRect(0,0,c.width,c.height); A._wm = c; }
    ctx.drawImage(A._wm, x, y, A._wm.width*h/A._wm.height, h); }

  const Q = "hey mir, can we pick back up on the short film? where did we leave the ending?";
  const R = "We left it on the door closing, 14 March. Your stairwell scout audio from 2 April has rain on it. Ending on the rain would answer the cold open.";
  const NEXT = "Open · try the rain under the act 3 cut";


  /* absolute time handling: tAbs may exceed T; scroll()/tAt() are period-aware, so ages are exact across the loop seam */
  function render(ctx, tAbs){
    const tL = ((tAbs % T) + T) % T, base = tAbs - tL, t = tL;
    const S = scroll(t), sx = X => X - S + NOW;
    ctx.save(); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,W,H);

    /* header */
    wordmark(ctx, 50, 33, 17);
    txt(ctx, 'CONTEXT OVER TIME · A SHORT FILM', 910, 47, { mono:1, size:10.5, color:C.ink3, align:'right', ls:.6 });
    ctx.fillStyle = '#EDF0F4'; ctx.fillRect(50, 64, 860, 1);

    /* ground: dot grid that moves with the record, quieter past NOW */
    const off = ((S % 22) + 22) % 22;
    for (let x = 50 + 22 - off; x < 910; x += 22) for (let y = FY0; y <= FY1; y += 22){ ctx.fillStyle = x > NOW ? '#F2F4F7' : C.dot; ctx.fillRect(x-.7, y-.7, 1.4, 1.4); }
    /* time axis: one tick a week */
    ctx.fillStyle = C.rule; ctx.fillRect(50, AXY, 860, 1);
    for (let X = Math.ceil((S - NOW + 50)/WK)*WK; sx(X) < 910; X += WK){ const x = sx(X);
      if (x >= 50){ ctx.fillStyle = x > NOW ? '#E4E8ED' : '#B3BAC6'; ctx.fillRect(x-.5, AXY-3, 1, 7); }
      for (let d=1; d<7; d++){ const xd = x + d*WK/7; if (xd > 50 && xd < 910){ ctx.fillStyle = '#E1E5EB'; ctx.fillRect(xd-.5, AXY, 1, 2.5); } } }
    txt(ctx, '← EARLIER', 50, AXY+22, { mono:1, size:9.5, color:C.ink3, ls:.6 });
    txt(ctx, 'ONE TICK = ONE WEEK', 910, AXY+22, { mono:1, size:9.5, color:C.ink3, align:'right', ls:.6 });
    ctx.fillStyle = '#C9CFDA'; ctx.fillRect(NOW-.5, FY0-14, 1, AXY-FY0+14);
    txt(ctx, 'NOW', NOW, FY0-20, { mono:1, size:9.5, color:C.ink2, align:'center', ls:.8 });

    const vis = visible(S);
    const pos = (j, k) => { const n = G.base[j], X = n.wx + k*P; return { x:sx(X), y:n.y, X }; };
    const findKey = key => vis.filter(v => v.n.key === key).sort((a,b) => b.X - a.X)[0];

    /* Mir's resume path and the connection, in loop-local beats */
    const tgt = findKey('target'), n2 = findKey('n2'), n3 = findKey('n3'), Bn = findKey('B'), Dn = findKey('D');
    const path = [tgt, n2, n3].filter(Boolean), pathOn = 1 - ss(10.9, 11.6, t);

    /* edges */
    ctx.save(); ctx.beginPath(); ctx.rect(50, FY0-60, 860, FY1-FY0+80); ctx.clip();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    vis.forEach(v => {
      const a = t - tAt(v.X), grow = eo(seg(a, 0, .55)), settle = seg(a, .8, 5);
      v.n.refs.forEach((q, qi) => {
        const r = pos(q.j, v.k + q.off); if (r.X >= v.X) return;
        let pts = edgePts(r.x, r.y, v.x, v.n.y, v.n.i*7 + qi).reverse();
        pts = partial(pts, grow);
        if (v.n.key === 'D'){ const o = ss(1.9, 2.7, a); ctx.strokeStyle = o < .5 ? C.orange : C.ink; ctx.lineWidth = 1.5 - .5*o; ctx.globalAlpha = 1 - .62*o; }
        else { ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.globalAlpha = .34 - .2*settle; }
        stroke(ctx, pts);
        ctx.globalAlpha = 1;
      });
    });

    /* resume path: from NOW back through the work to the decision, then the connection */
    const hops = [];
    if (n3) hops.push([{ x:NOW, y:300 }, { x:n3.x, y:n3.n.y }]);
    if (n3 && n2) hops.push([{ x:n3.x, y:n3.n.y }, { x:n2.x, y:n2.n.y }]);
    if (n2 && tgt) hops.push([{ x:n2.x, y:n2.n.y }, { x:tgt.x, y:tgt.n.y }]);
    let head = null;
    hops.forEach((h, k) => { const p = eo(seg(t, BT.path[k], BT.path[k+1] - .08)) * pathOn; if (p <= 0) return;
      const pts = edgePts(h[1].x, h[1].y, h[0].x, h[0].y, 40 + k).reverse(), part = partial(pts, p);
      ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.globalAlpha = 1; stroke(ctx, part);
      if (p < 1) head = part[part.length-1]; });
    if (head){ ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(head[0], head[1], 3.2, 0, 7); ctx.fill(); }
    // the connection: the decision and a fragment nobody had linked
    const cOn = eo(seg(t, BT.conn0, BT.conn1)) * pathOn;
    if (tgt && Bn && cOn > 0){
      const x1 = tgt.x, y1 = tgt.n.y, x2 = Bn.x, y2 = Bn.n.y, mx = (x1+x2)/2, top = Math.min(y1,y2) - 46;
      const pts = bez([x1,y1],[x1+(x2-x1)*.25, top],[x2-(x2-x1)*.25, top],[x2,y2], 48);
      ctx.save(); ctx.setLineDash([4,4]); ctx.strokeStyle = C.violet; ctx.lineWidth = 1.6; stroke(ctx, partial(pts, cOn)); ctx.restore();
    }

    /* nodes */
    vis.forEach(v => {
      const n = v.n, a = t - tAt(v.X); if (v.x < 44 || v.x > NOW + 2) return;
      let used = 0; REFBY[n.i].forEach(q => { const X = G.base[q.i].wx + (v.k - q.off)*P; if (X <= S) used++; });
      const pop = a < .35 ? 1 + .35*Math.sin(seg(a,0,.35)*Math.PI) : 1, rad = (2.3 + 1.05*Math.sqrt(used)) * pop * eo(seg(a,0,.18));
      if (rad <= .2) return;
      if (a < .9){ ctx.strokeStyle = n.who === 'mir' ? C.blue : C.ink; ctx.globalAlpha = .35*(1 - seg(a,0,.9)); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(v.x, n.y, rad + 16*eo(seg(a,0,.9)), 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
      const open = n.key === 'D' ? 1 : 0;
      if (open > 0){ ctx.fillStyle = '#fff'; ctx.strokeStyle = C.orange; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(v.x, n.y, rad + 1.5, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(v.x, n.y, Math.max(1.3, rad*.42), 0, 7); ctx.fill(); }
      else if (n.who === 'mir'){ ctx.fillStyle = '#fff'; ctx.strokeStyle = C.blue; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(v.x, n.y, rad, 0, 7); ctx.fill(); ctx.stroke(); }
      else { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(v.x, n.y, rad, 0, 7); ctx.fill(); }
    });
    const fadeL = ctx.createLinearGradient(50,0,120,0); fadeL.addColorStop(0,'rgba(255,255,255,1)'); fadeL.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = fadeL; ctx.fillRect(50, FY0-60, 70, FY1-FY0+80);
    ctx.restore();
    // halos where Mir lands
    const halo = (v, t0, col) => { if (!v) return 0; const h = eo(seg(t, t0, t0 + .4)) * pathOn; if (h <= 0) return 0;
      ctx.strokeStyle = col; ctx.lineWidth = 1.3; ctx.globalAlpha = h; ctx.beginPath(); ctx.arc(v.x, v.n.y, 9 + 2*(1-h), 0, 7); ctx.stroke(); ctx.globalAlpha = 1; return h; };
    const hT = halo(tgt, BT.path[3] - .1, C.blue), hB = halo(Bn, BT.conn1 - .15, C.violet);
    const tag = (v, l1, l2, a, col, dy = -22, left = false) => { if (!v || a <= 0) return;
      ctx.font = `500 10px ${MONO}`; const w = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width) + 14;
      const x = left ? v.x - w - 16 : Math.min(Math.max(v.x - w/2, 52), 908 - w), y = left ? v.n.y - 15 : v.n.y + dy - 26;
      ctx.globalAlpha = a; ctx.fillStyle = '#fff'; rr(ctx, x, y, w, 30, 4); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.stroke();
      txt(ctx, l1, x + 7, y + 12.5, { mono:1, size:9.5, color:col, ls:.4, a }); txt(ctx, l2, x + 7, y + 24.5, { mono:1, size:9.5, color:C.ink2, ls:.3, a }); ctx.globalAlpha = 1; };
    tag(tgt, 'DECIDED · 14 MAR', 'ending: the door closes', hT, C.blue);
    tag(Bn, 'NOT YET LINKED · 2 APR', 'stairwell audio: rain', hB, C.violet, 50);
    const dA = eo(seg(t, BT.dev0 + .3, BT.dev1 + .2)) * (1 - ss(BT.out0, BT.out1, t));
    tag(Dn, 'OPEN · NEXT MOVE', 'end on the rain?', dA, C.orange, 0, true);

    /* the conversation: asked at NOW, answered by Mir with what it found */
    const out = 1 - ss(BT.out0, BT.out1, t);
    const qA = eo(seg(t, BT.card, BT.card + .35)) * out;
    if (qA > 0){
      ctx.font = `450 14px ${SANS}`; const ch0 = Math.max(1, Math.floor(Q.length * seg(t, BT.type0, BT.type1))), shown = Q.slice(0, ch0);
      const full = wrap(ctx, Q, 344), nl = Math.max(1, wrap(ctx, shown, 344).length), w1 = nl > 1 ? 372 : Math.max(60, ctx.measureText(shown).width + 28);
      const qW = w1, qH = 18 + nl*19, qx = 910 - qW, qy = 84 + (1-qA)*6, lines = full;
      ctx.globalAlpha = qA; ctx.fillStyle = C.ink; rr(ctx, qx, qy, qW, qH, 12); ctx.fill();
      ctx.beginPath(); ctx.moveTo(910 - 30, qy + qH); ctx.lineTo(910 - 18, qy + qH + 8); ctx.lineTo(910 - 16, qy + qH); ctx.fill();
      const ch = Math.floor(Q.length * seg(t, BT.type0, BT.type1));
      typed(ctx, Q, qx + 14, qy + 23, 344, ch, { size:14, wt:450, color:'#fff', lh:19, a:qA });
      if (ch < Q.length && Math.floor(t*4) % 2 === 0){ ctx.globalAlpha = qA; ctx.fillStyle = '#fff'; }
      ctx.globalAlpha = 1;
    }
    const rA = eo(seg(t, BT.reply0 - .25, BT.reply0 + .1)) * out;
    if (rA > 0){
      const rx = 120, ry = 92, rW = 400;
      if (A.robot){ ctx.globalAlpha = rA; const s = 34; ctx.drawImage(A.robot, 50 + (1-rA)*3, ry - 6, s, s*A.robot.height/A.robot.width); ctx.globalAlpha = 1; }
      txt(ctx, 'MIR', 92, ry + 6, { mono:1, size:9.5, color:C.ink3, ls:.8, a:rA });
      const ch = Math.floor(R.length * seg(t, BT.reply0, BT.reply1));
      typed(ctx, R, rx, ry + 6, rW, ch, { size:15, wt:450, color:C.ink, lh:21, a:rA });
      const nA = eo(seg(t, BT.dev0 + .2, BT.dev1)) * out;
      if (nA > 0){ ctx.font = `500 10px ${MONO}`; const w = ctx.measureText(NEXT.toUpperCase()).width + 30;
        ctx.globalAlpha = nA; ctx.strokeStyle = C.orange; ctx.lineWidth = 1.2; rr(ctx, rx, ry + 82, w, 24, 12); ctx.stroke();
        ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(rx + 12, ry + 94, 3, 0, 7); ctx.fill();
        txt(ctx, NEXT.toUpperCase(), rx + 22, ry + 97.5, { mono:1, size:10, color:C.orange, ls:.5, a:nA }); ctx.globalAlpha = 1; }
    }
    /* idle line when nothing is being asked */
    const idle = (1 - eo(seg(t, BT.card - .4, BT.card))) + ss(BT.out1 - .1, BT.out1 + .3, t);
    if (idle > 0){ const a = clamp(idle);
      txt(ctx, 'Every exchange becomes a node. New ones reach back to earlier ones,', 50, 110, { size:15, wt:450, color:C.ink2, a });
      txt(ctx, 'and the contexts you keep returning to grow.', 50, 131, { size:15, wt:450, color:C.ink2, a }); }

    /* legend + footer */
    const lgA = 1; ctx.save();
    const lg = [['you', 'ink'], ['mir', 'ring'], ['open', 'open']]; let lx = 300;
    lg.forEach(([l, k]) => { const y = AXY + 22;
      if (k === 'ink'){ ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(lx + 4, y - 4, 3.6, 0, 7); ctx.fill(); }
      if (k === 'ring'){ ctx.strokeStyle = C.blue; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(lx + 4, y - 4, 3.6, 0, 7); ctx.stroke(); }
      if (k === 'open'){ ctx.strokeStyle = C.orange; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(lx + 4, y - 4, 3.6, 0, 7); ctx.stroke(); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(lx + 4, y - 4, 1.4, 0, 7); ctx.fill(); }
      txt(ctx, l.toUpperCase(), lx + 13, y, { mono:1, size:9.5, color:C.ink3, ls:.6, a:lgA }); lx += 62; });
    txt(ctx, 'SIZE = HOW OFTEN IT IS DRAWN ON', 502, AXY + 22, { mono:1, size:9.5, color:C.ink3, ls:.6 });
    ctx.restore();
    txt(ctx, 'CONCEPT ANIMATION · FICTIONAL PROJECT', 50, 516, { mono:1, size:9.5, color:C.ink3, ls:.5 });
    txt(ctx, 'RESUME · CONNECT · DEVELOP', 910, 516, { mono:1, size:9.5, color:C.ink3, align:'right', ls:.5 });
    ctx.restore();
  }

  root.Rhizome = { render, W, H, T, FPS, assets:A, setMaker:f => A.make = f };
})(typeof window !== 'undefined' ? window : globalThis);
