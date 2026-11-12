/* Planters · the opening illustration. Drawn as ink, in code.
   Four folders, four plants. Each folder receives a strand (a paper slip), the plant
   answers in a few drawn poses with a small overshoot, then holds still.
   Expressive illustration only. Not a claim that strand count causes growth.
   Analog logic: pressure-varied ribbons, contours in separate strokes that don't
   quite meet, each colour plate misregistered by one fixed offset (like a real
   two-drum print), pigment broken where the form turns to the light, motion on
   twos (12 fps) with drawing-to-drawing boil only while moving. Still when held. */
window.Planters = (function(){
  const LW = 1200, LH = 640;                          // logical size
  const C = { ink:'#15171E', blue:'#2445D6', green:'#3B9A63', orange:'#EB5F2C', violet:'#B2A6DE', paper:'#F7F8FB' };
  const PLATE = { blue:[3,-2], green:[-2,2], orange:[2,3], violet:[-2,-2] }; // one offset per plate, everywhere

  /* ---------- seeded randomness ---------- */
  function rng(seed){ let s = (seed*2654435761)>>>0; return () => { s = (s + 0x6D2B79F5)>>>0; let t = s;
    t = Math.imul(t ^ t>>>15, t|1); t ^= t + Math.imul(t ^ t>>>7, t|61); return ((t ^ t>>>14)>>>0)/4294967296; }; }
  function noise1(seed){ const r = rng(seed), v = Array.from({length:128}, r);
    return x => { const i = Math.floor(x), f = x - i, a = v[((i%128)+128)%128], b = v[(((i+1)%128)+128)%128];
      const u = f*f*(3-2*f); return a + (b-a)*u; }; }

  /* ---------- geometry ---------- */
  function bez(p0,p1,p2,p3,n){ const o=[]; for(let i=0;i<=n;i++){ const t=i/n, m=1-t;
    o.push([m*m*m*p0[0]+3*m*m*t*p1[0]+3*m*t*t*p2[0]+t*t*t*p3[0], m*m*m*p0[1]+3*m*m*t*p1[1]+3*m*t*t*p2[1]+t*t*t*p3[1]]); } return o; }
  function seg(a,b,n){ const o=[]; for(let i=0;i<=n;i++){ const t=i/n; o.push([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]); } return o; }
  function jit(pts, amt, seed){ const nx = noise1(seed), ny = noise1(seed+99);
    return pts.map((p,i) => [p[0] + (nx(i*.18)-.5)*amt, p[1] + (ny(i*.18)-.5)*amt]); }

  /* ---------- the ink ribbon: one pen stroke with pressure ---------- */
  function ink(ctx, pts, o){
    const n = pts.length; if (n < 2) return;
    const w = o.w || 3, tin = o.tin ?? .12, tout = o.tout ?? .22, rough = o.rough ?? .5, seed = o.seed || 1;
    const nz = noise1(seed*13+7), ez = noise1(seed*31+3);
    const L = [0]; for (let i=1;i<n;i++) L.push(L[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]));
    const tot = L[n-1] || 1, left = [], right = [];
    for (let i=0;i<n;i++){
      const t = L[i]/tot;
      const a = Math.min(1, t/tin), b = Math.min(1, (1-t)/tout);
      let p = Math.pow(a,.55) * Math.pow(b,.8);
      p *= .72 + .56*nz(L[i]/(o.scale||38));                 // the hand presses and eases
      const ww = Math.max(o.min ?? .45, w*p);
      const i0 = Math.max(0,i-1), i1 = Math.min(n-1,i+1);
      let dx = pts[i1][0]-pts[i0][0], dy = pts[i1][1]-pts[i0][1]; const len = Math.hypot(dx,dy)||1; dx/=len; dy/=len;
      const nx = -dy, ny = dx, j = (ez(L[i]/2.2)-.5)*rough;   // ragged edge where the nib drags
      left.push([pts[i][0]+nx*(ww/2+j), pts[i][1]+ny*(ww/2+j)]);
      right.push([pts[i][0]-nx*(ww/2-j*.6), pts[i][1]-ny*(ww/2-j*.6)]);
    }
    ctx.fillStyle = o.color || C.ink;
    ctx.beginPath(); ctx.moveTo(left[0][0], left[0][1]);
    for (let i=1;i<n;i++) ctx.lineTo(left[i][0], left[i][1]);
    for (let i=n-1;i>=0;i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath(); ctx.fill();
    if (o.pool){ const p0 = pts[0]; ctx.beginPath(); ctx.arc(p0[0], p0[1], w*.5*o.pool, 0, 7); ctx.fill(); } // pen lands, ink pools
  }
  function polyPath(ctx, pts){ ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }

  /* ---------- a drawing: three colour plates + one ink key, composed like a print ---------- */
  const LIGHT = [-.62, -.78];                            // one light, upper left, for every form
  let SPR = 2;
  const scratch = {};
  function cv(w,h){ const c = (typeof document !== 'undefined') ? document.createElement('canvas') : new (Planters._Canvas)(w,h); c.width = w; c.height = h; return c; }
  function getScratch(name,w,h){ let c = scratch[name]; if (!c || c.width < w || c.height < h){ c = scratch[name] = cv(Math.max(w, c?c.width:0), Math.max(h, c?c.height:0)); } const x = c.getContext('2d'); x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,c.width,c.height); return [c,x]; }

  function drawing(box, seed, fn){
    const W = Math.ceil(box.w*SPR), H = Math.ceil(box.h*SPR);
    const plates = {}, setT = x => { x.setTransform(SPR,0,0,SPR,-box.x*SPR,-box.y*SPR); };
    for (const k of ['blue','green','orange','violet']){ const [c,x] = getScratch(k,W,H); setT(x); plates[k] = [c,x]; }
    const [pc, px] = getScratch('paper',W,H); setT(px);
    const [ic, ix] = getScratch('ink',W,H); setT(ix);
    const r = rng(seed);
    const api = {
      r,
      fill(plate, pts, o={}){                          // pigment, then where it breaks
        const x = plates[plate][1]; x.globalCompositeOperation = 'source-over';
        x.fillStyle = C[plate]; polyPath(x, pts); x.fill();
        if (o.amt === 0) return;
        let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; pts.forEach(p=>{x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);});
        const cx=(x0+x1)/2, cy=(y0+y1)/2, R=Math.max(x1-x0,y1-y0)/2 || 1;
        const lx = (o.light||LIGHT)[0], ly = (o.light||LIGHT)[1];
        x.save(); polyPath(x, pts); x.clip(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000';
        const count = Math.round((x1-x0)*(y1-y0)*(o.density||.5)), amt = o.amt ?? .55, base = o.base ?? .025;
        for (let i=0;i<count;i++){
          const px = x0 + r()*(x1-x0), py = y0 + r()*(y1-y0);
          const d = ((px-cx)*lx + (py-cy)*ly)/R;          // >0 faces the light
          const s = Math.max(0, Math.min(1, (d - (o.from ?? .05))/.8));
          const p = (base + amt*s*s)*.68;                // moderately sparser
          if (r() < p){ const rr = .16 + r()*(.22 + s*.38); x.beginPath(); x.ellipse(px, py, rr*1.4, rr*.8, (o.grain||0) + (r()-.5)*.6, 0, 7); x.fill(); }   // fine tooth, not chips
        }
        if (o.drag){                                     // dry-brush drag along the form, where light hits
          x.lineCap = 'round';
          for (let i=0;i<o.drag;i++){
            const yy = y0 + (y1-y0)*(.06 + .5*r()), xx = x0 + (x1-x0)*(.04 + .45*r()), len = (x1-x0)*(.12 + .35*r());
            x.lineWidth = .3 + r()*.55; x.globalAlpha = .35 + r()*.35; x.beginPath();
            for (let t=0;t<=1;t+=.1){ x.lineTo(xx + len*t, yy + Math.sin(t*3+i)*0.6); } x.stroke();
          }
          x.globalAlpha = 1;
        }
        x.restore();
      },
      paper(pts){ px.fillStyle = C.paper; polyPath(px, pts); px.fill(); },   // opaque paper: sits over the colour plates, under the ink
      knock(plate, pts){ const x = plates[plate][1]; x.save(); x.globalCompositeOperation='destination-out'; x.fillStyle='#000'; polyPath(x,pts); x.fill(); x.restore(); },
      ink(pts, o={}){ ink(ix, pts, Object.assign({ seed: Math.floor(r()*1e6) }, o)); },
      text(str, x0, y0, o={}){ ix.save(); ix.translate(x0,y0); ix.rotate(o.rot||0); ix.fillStyle = o.color||C.ink;
        ix.font = o.font || '500 13px "Bricolage Grotesque", sans-serif'; ix.textAlign = o.align||'center'; ix.textBaseline = 'middle';
        ix.fillText(str, 0, 0); ix.restore(); }
    };
    fn(api);
    const out = cv(W,H), ox = out.getContext('2d');
    ox.globalCompositeOperation = 'multiply';
    for (const k of ['blue','green','orange','violet']) ox.drawImage(plates[k][0], 0,0,W,H, PLATE[k][0]*SPR*.5, PLATE[k][1]*SPR*.5, W,H);
    ox.globalCompositeOperation = 'source-over';
    ox.drawImage(pc, 0,0,W,H, 0,0,W,H);
    ox.drawImage(ic, 0,0,W,H, 0,0,W,H);
    return { c: out, box };
  }

  /* ---------- the folder: back panel with tab, front panel, a handwritten label ---------- */
  const F = [ // unequal on purpose
    { cx:196,  w:176, h:106, tab:.16, tabW:56, tilt:-.012, label:'brief' },
    { cx:474,  w:160, h:114, tab:.08, tabW:50, tilt: .010, label:'call notes' },
    { cx:748,  w:182, h:102, tab:.22, tabW:60, tilt:-.006, label:'shelf audit' },
    { cx:1022, w:168, h:110, tab:.12, tabW:54, tilt: .014, label:'sampler' }
  ];
  const GROUND = 528;
  function rot(p, c, a){ const s=Math.sin(a), co=Math.cos(a), x=p[0]-c[0], y=p[1]-c[1]; return [c[0]+x*co-y*s, c[1]+x*s+y*co]; }

  function folderBack(f, seed){
    const x0 = f.cx - f.w/2, x1 = f.cx + f.w/2, yb = GROUND, yt = GROUND - f.h - 16, tx = x0 + f.w*f.tab;
    const box = { x:x0-14, y:yt-26, w:f.w+28, h:f.h+44 };
    return drawing(box, seed, a => {
      const T = p => rot(p, [f.cx, yb], f.tilt);
      const shape = [[x0,yb],[x0,yt+6],[x0+2,yt],[tx,yt],[tx+10,yt-13],[tx+f.tabW,yt-14],[tx+f.tabW+9,yt],[x1-3,yt+1],[x1,yt+7],[x1,yb]].map(T);
      a.fill('blue', jit(shape.flatMap((p,i,s)=>seg(p, s[(i+1)%s.length], 6)), 1.6, seed), { amt:.35, density:.45, from:.3 });
      // ink in separate strokes; joins overshoot or fall short
      a.ink(jit(seg(T([x0,yb+2]), T([x0,yt+8]),20),1.2,seed+1), { w:3.1, pool:.8 });
      a.ink(jit(bez(T([x0-1,yt+9]),T([x0,yt+1]),T([x0+3,yt]),T([tx+2,yt+.5]),16),1,seed+2), { w:2.6 });
      a.ink(jit(bez(T([tx-1,yt+1]),T([tx+5,yt-5]),T([tx+8,yt-12]),T([tx+14,yt-13]),10),.8,seed+3), { w:2.4 });
      a.ink(jit(seg(T([tx+12,yt-14]), T([tx+f.tabW+2,yt-15]),12),.9,seed+4), { w:2.8 });
      a.ink(jit(bez(T([tx+f.tabW,yt-15]),T([tx+f.tabW+6,yt-12]),T([tx+f.tabW+8,yt-4]),T([tx+f.tabW+11,yt+1]),8),.8,seed+5), { w:2.2 });
      a.ink(jit(seg(T([tx+f.tabW+6,yt+.5]), T([x1+3,yt+2]),22),1.1,seed+6), { w:2.9 });
      a.ink(jit(seg(T([x1-.5,yt+4]), T([x1+.5,yb-1]),20),1.2,seed+7), { w:3.3 });
      // the dark mouth between panels: hand hatching, not a gradient
      for (let i=0;i<Math.round(f.w/7);i++){
        const hx = x0 + 6 + i*7 + (a.r()-.5)*2;
        a.ink([T([hx, yt+5+a.r()*3]), T([hx+5, yt+15+a.r()*4])], { w:1.15, tin:.3, tout:.3, rough:.2 });
      }
    });
  }

  function folderFront(f, seed, squash=0){
    const sx = 1 + squash*.035, sy = 1 - squash*.06;
    const w = f.w*sx, h = f.h*sy, x0 = f.cx - w/2, x1 = f.cx + w/2, yb = GROUND, yt = GROUND - h;
    const box = { x:x0-16, y:yt-14, w:w+32, h:h+36 };
    return drawing(box, seed, a => {
      const T = p => rot(p, [f.cx, yb], f.tilt);
      const skew = 4;
      const shape = [[x0,yb],[x0+skew*.3,yt+5],[x0+skew+3,yt],[x1-3,yt-1],[x1,yt+4],[x1,yb]].map(T);
      a.fill('blue', jit(shape.flatMap((p,i,s)=>seg(p, s[(i+1)%s.length], 8)), 1.8, seed), { amt:.6, density:.55, from:.0, drag: 7 });
      // label slip, knocked out of the blue, slightly crooked
      const lw = Math.min(104, f.label.length*8.4+28), lh = 26, lx = f.cx - lw/2 + (a.r()-.5)*6, ly = yt + h*.38;
      const lr = (a.r()-.5)*.05 + f.tilt*2;
      const lab = [[lx,ly],[lx+lw,ly+1],[lx+lw-1,ly+lh],[lx+1,ly+lh-1]].map(p=>rot(T(p),[f.cx,ly+lh/2],lr));
      a.paper(jit(lab.flatMap((p,i,s)=>seg(p, s[(i+1)%s.length], 5)), .9, seed+20));
      a.ink(jit(seg(lab[0],lab[1],10),.6,seed+21), { w:1.6 });
      a.ink(jit(seg(lab[1],lab[2],5),.5,seed+22), { w:1.4 });
      a.ink(jit(seg([lab[2][0]+1,lab[2][1]],lab[3],10),.6,seed+23), { w:1.8 });
      a.ink(jit(seg(lab[3],[lab[0][0],lab[0][1]+2],5),.5,seed+24), { w:1.3 });
      const lc = T([f.cx + (lab[0][0]+lab[2][0])/2 - f.cx, ly+lh/2+1]);
      a.text(f.label, lc[0], lc[1], { rot: lr + f.tilt, font:'500 14px "Bricolage Grotesque", sans-serif' });
      // contour
      a.ink(jit(seg(T([x0-1,yb+3]), T([x0+skew*.3,yt+7]),18),1.3,seed+1), { w:3.4, pool:.9 });
      a.ink(jit(bez(T([x0+skew*.3-1,yt+9]),T([x0+skew,yt+1]),T([x0+skew+6,yt]),T([x1-2,yt-1.5]),26),1.2,seed+2), { w:3.0, tout:.08 });
      a.ink(jit(bez(T([x1-6,yt-2]),T([x1-1,yt]),T([x1+1,yt+4]),T([x1+.5,yb]),20),1.3,seed+3), { w:3.6 });
      a.ink(jit(seg(T([x0+4,yb+1]), T([x1+4,yb+1.5]),26),1.4,seed+4), { w:2.6, tin:.05 });
    });
  }

  /* ---------- leaves, stems, blooms ---------- */
  function leaf(a, base, ang, len, wid, seed, mature=1){
    const ca = Math.cos(ang), sa = Math.sin(ang), P = (u,v) => [base[0] + ca*u - sa*v, base[1] + sa*u + ca*v];
    const tipBend = (a.r()-.5)*.25*len, belly = .38 + a.r()*.16;
    const up = bez(P(0,0), P(len*belly, -wid*1.15), P(len*.86, -wid*.55+tipBend*.2), P(len, tipBend*.3), 14);
    const dn = bez(P(len, tipBend*.3), P(len*.8, wid*.75+tipBend*.2), P(len*(belly-.05), wid*1.05), P(0,0), 14);
    const shape = jit(up.concat(dn), .7, seed);
    a.fill('green', shape, { amt:.5, density:.9, from:-.1, grain:ang });
    a.ink(jit(up,.5,seed+1), { w:2.3*mature+.4, tin:.06, tout:.35, scale:18 });
    a.ink(jit(dn.slice(2),.5,seed+2), { w:1.9*mature+.3, tin:.3, tout:.1, scale:18 });          // never quite closes at the stem
    if (len > 22) a.ink(jit(bez(P(len*.12,0), P(len*.4,-wid*.08), P(len*.6,-wid*.04), P(len*.74, tipBend*.15), 8),.3,seed+3), { w:1.0, tin:.2, tout:.5, rough:.2 });
  }
  function bloom(a, c, r, seed, open=1){
    const n = 5, rot0 = a.r()*6.28, pet = [];
    for (let i=0;i<n;i++){
      const an = rot0 + i*6.283/n + (a.r()-.5)*.35, rr = r*(.82 + a.r()*.32)*open;
      const P = (u,v) => [c[0] + Math.cos(an)*u - Math.sin(an)*v, c[1] + Math.sin(an)*u + Math.cos(an)*v];
      pet.push(bez(P(r*.12,-rr*.32), P(rr*.7,-rr*.78), P(rr*1.15,-rr*.2), P(rr*1.05,rr*.14),10).concat(bez(P(rr*1.05,rr*.14), P(rr*.95,rr*.6), P(rr*.4,rr*.62), P(r*.12,rr*.3),10)));
    }
    pet.forEach((p,i) => { a.fill('violet', jit(p,.6,seed+i), { amt:.4, density:1.1, from:0 }); });
    pet.forEach((p,i) => { a.ink(jit(p.slice(1,17),.5,seed+10+i), { w:1.9, tin:.1, tout:.3, scale:14 }); });
    const cc = []; for (let i=0;i<=14;i++){ const t = i/14*6.6; cc.push([c[0]+Math.cos(t)*r*.26*open, c[1]+Math.sin(t)*r*.24*open]); }
    a.fill('orange', jit(cc.slice(0,14),.3,seed+31), { amt:.25, density:1.2, from:.1 });
    a.ink(jit(cc,.4,seed+30), { w:2.2, tin:.05, tout:.05 });
    for (let i=0;i<4;i++) a.ink([[c[0]+(a.r()-.5)*r*.25, c[1]+(a.r()-.5)*r*.2],[c[0]+(a.r()-.5)*r*.25+.6, c[1]+(a.r()-.5)*r*.2+.6]], { w:1.8, tin:.4, tout:.4, rough:0 });
  }
  function stemPts(base, H, lean, curl, seed){
    const top = [base[0] + lean*H, base[1] - H];
    return jit(bez(base, [base[0] + curl*H*.25, base[1] - H*.35], [top[0] - curl*H*.2 - lean*H*.3, top[1] + H*.35], top, 30), H*.012, seed);
  }
  function at(pts, t){ const i = Math.min(pts.length-1, Math.max(0, Math.round(t*(pts.length-1)))); const j = Math.min(pts.length-1, i+1), k = Math.max(0,i-1);
    return { p: pts[i], ang: Math.atan2(pts[j][1]-pts[k][1], pts[j][0]-pts[k][0]) }; }

  // Plant targets per folder: unequal, a different plant each time, not one plant cloned.
  const PL = [
    { H: 46,  leaves:[[.95, 0, 20, 9],[.95, 1, 18, 8]], sides:[], blooms:[], lean:-.03, curl:.05 },
    { H: 118, leaves:[[.28,0,28,11],[.48,1,31,12],[.68,0,27,11],[.9,1,21,9],[1,0,16,7]], sides:[], blooms:[], lean:.06, curl:-.1 },
    { H: 196, leaves:[[.18,1,34,13],[.3,0,36,13],[.52,1,33,12],[.7,0,30,12],[.86,1,26,10],[1,0,20,8]],
      sides:[{ t:.42, dir:-1, L:.42, leaves:[[.55,0,26,10],[1,1,22,9]] },{ t:.62, dir:1, L:.38, leaves:[[.6,1,25,10],[1,0,19,8]] }], blooms:[], lean:-.02, curl:.12 },
    { H: 228, leaves:[[.16,0,34,13],[.3,1,35,13],[.46,0,32,12],[.62,1,30,11],[.8,0,26,10]],
      sides:[{ t:.5, dir:-1, L:.36, leaves:[[.5,1,24,10]], bloom:15 },{ t:.7, dir:1, L:.3, leaves:[[.5,0,22,9]], bloom:12 }], blooms:[[1, 21]], lean:.03, curl:-.08 }
  ];

  function plant(f, k, g, lean, seed){
    const spec = PL[k], base = [f.cx + (k%2? 4:-6), GROUND - f.h + 4];
    const H = spec.H * g, ext = Math.max(60, H*.7);
    const box = { x: base[0]-ext-40, y: base[1]-H-60, w: ext*2+80, h: H+80 };
    return drawing(box, seed, a => {
      if (g <= .01) return;
      const S = stemPts(base, H, spec.lean + lean, spec.curl, seed);
      const grown = t => Math.max(0, Math.min(1, (g*1.05 - t*.55)/.5));     // lower leaves mature first
      a.ink(S, { w: 2.2 + H/90, tin:.02, tout:.5, scale:50, pool:.6 });
      spec.sides.forEach((sd, si) => {
        const m = grown(sd.t); if (m <= .05) return;
        const o = at(S, sd.t), L = spec.H*sd.L*g*m, ang = o.ang + sd.dir*(.9 - lean*2);
        const end = [o.p[0] + Math.cos(ang)*L, o.p[1] + Math.sin(ang)*L];
        const mid = [o.p[0] + Math.cos(ang+sd.dir*.35)*L*.55, o.p[1] + Math.sin(ang+sd.dir*.35)*L*.55 - L*.15];
        const SP = jit(bez(o.p, mid, mid, end, 14), .6, seed+50+si);
        a.ink(SP, { w: 2.2, tin:.02, tout:.5 });
        sd.leaves.forEach((lf, li) => { const q = at(SP, lf[0]); leaf(a, q.p, q.ang + (lf[1]? .85:-.85) + lean, lf[2]*m*g, lf[3]*m*g, seed+60+si*10+li, m); });
        if (sd.bloom && g > .7) bloom(a, end, sd.bloom*Math.min(1,(g-.7)/.3), seed+80+si, Math.min(1,(g-.7)/.3));
      });
      spec.leaves.forEach((lf, li) => {
        const m = grown(lf[0]); if (m <= .05) return;
        const q = at(S, Math.min(.985, lf[0]));
        const side = lf[1] ? 1 : -1, ang = q.ang + side*(1.0 - .25*lf[0]) + lean*1.5;
        leaf(a, q.p, ang, lf[2]*m*Math.min(1.15,g), lf[3]*m*Math.min(1.15,g), seed+100+li, m);
      });
      spec.blooms.forEach((b, bi) => { if (g > .75){ const q = at(S, 1); bloom(a, q.p, b[1]*Math.min(1.1,(g-.75)/.25), seed+200+bi, Math.min(1.1,(g-.75)/.25)); } });
    });
  }

  /* ---------- the strand: a slip of paper with three handwritten lines and a date ---------- */
  function slip(seed, date){
    const box = { x:-40, y:-26, w:80, h:52 };
    return drawing(box, seed, a => {
      const s = jit([[-30,-18],[30,-19],[31,18],[-29,19]].flatMap((p,i,arr)=>seg(p, arr[(i+1)%4], 6)), .8, seed);
      a.paper(jit([[-24,-18.6],[30,-19],[31,18],[-24,18.8]].flatMap((p,i,arr)=>seg(p, arr[(i+1)%4], 6)), .6, seed+9));   // the blue edge strip stays visible
      a.ink(jit(seg([-31,-18],[31,-19.5],12),.6,seed+1), { w:1.8 });
      a.ink(jit(seg([30.5,-20],[31.5,18],8),.5,seed+2), { w:1.6 });
      a.ink(jit(seg([32,18.5],[-30,19],12),.6,seed+3), { w:2.0 });
      a.ink(jit(seg([-29.5,20],[-30,-16],8),.5,seed+4), { w:1.5 });
      for (let i=0;i<3;i++){ const y = -9 + i*7, L = [44,38,26][i]; const pts = []; for (let x=0;x<=L;x+=2) pts.push([-23+x, y + Math.sin(x*.7+i*2)*1.1 + (a.r()-.5)*.6]); a.ink(pts, { w:1.0, tin:.1, tout:.1, rough:.1 }); }
      a.text(date, 15, 12.5, { font:'500 7.5px "JetBrains Mono", monospace', align:'center' });
      a.fill('blue', [[-31,-19],[-24,-19],[-24,19],[-31,19]], { amt:.3 });
    });
  }

  /* ---------- the ground: one inked shelf, hand hatching under each folder ---------- */
  function ground(seed){
    const box = { x:0, y:GROUND-20, w:LW, h:70 };
    return drawing(box, seed, a => {
      a.ink(jit(seg([70,GROUND+2],[640,GROUND+3],60),1.2,seed), { w:2.6, tin:.02, tout:.05, pool:.6 });
      a.ink(jit(seg([620,GROUND+3.5],[1140,GROUND+2],60),1.2,seed+1), { w:2.8, tin:.05, tout:.02 });
      F.forEach((f,k) => { for (let i=0;i<Math.round(f.w/6.5);i++){ const hx = f.cx - f.w/2 + 6 + i*6.5 + (a.r()-.5)*1.5;
        a.ink([[hx, GROUND+8 + a.r()*2],[hx+9, GROUND+16 + a.r()*3]], { w:1.1, tin:.3, tout:.3, rough:.25 }); } });
    });
  }

  /* ---------- the sequence ----------
     Each folder has its own clock. Poses are discrete drawings held for whole frames (on twos,
     12 fps). While a plant is moving, alternate two drawings of the same pose (boil). At rest, one. */
  const FPS = 12;
  // [start time s, slip fall s, poses: [g, lean, frames]...]   timing is unequal on purpose
  const SEQ = [
    { t:.35, fall:.42, date:'23 FEB', pre:0,   poses:[[.35,.0,1],[.8,-.02,2],[1.12,.05,2],[.96,-.02,2],[1,0,0]] },
    { t:1.25,fall:.55, date:'02 MAR', pre:.42, poses:[[.62,.03,2],[.9,-.04,2],[1.07,.07,3],[.98,-.02,2],[1,0,0]] },
    { t:2.05,fall:.7,  date:'11 MAR', pre:.5,  poses:[[.6,.0,2],[.74,-.03,3],[.9,.02,3],[1.05,.06,3],[.99,-.02,3],[1,0,0]] },
    { t:3.5, fall:.5,  date:'15 APR', pre:.58, poses:[[.66,.02,2],[.8,-.04,2],[.92,.03,3],[1.06,.05,4],[.98,-.02,3],[1,0,0]] }
  ];
  const DURATION = 7.2;
  let cache = null;
  function build(){
    const c = { back:[], front:[], squash:[], slips:[], plants:[], ground: ground(5) };
    F.forEach((f,k) => {
      c.back.push(folderBack(f, 100+k*17));
      c.front.push(folderFront(f, 300+k*17, 0));
      c.squash.push(folderFront(f, 300+k*17+5, 1));
      c.slips.push(slip(500+k*11, SEQ[k].date));
      const seq = SEQ[k], P = [];
      P.push([ plant(f, k, seq.pre, 0, 700+k*31) ]);                       // before
      seq.poses.forEach(([g,lean,fr], i) => {
        const last = i === seq.poses.length-1;
        const v0 = plant(f, k, g, lean, 700+k*31 + (last?0:i*7+1));
        P.push(last ? [v0] : [v0, plant(f, k, g*1.004, lean*1.1, 700+k*31 + i*7+3)]);
      });
      c.plants.push(P);
    });
    return c;
  }

  function stateAt(k, t){
    const s = SEQ[k], land = s.t + s.fall;
    const out = { slip:null, squash:false, pose:0, variant:0 };
    if (t >= s.t && t < land + .25){
      const u = Math.min(1, (t - s.t)/s.fall);
      const fr = Math.floor(u*s.fall*FPS)/(s.fall*FPS);                   // stepped, on twos
      const e = fr*fr;                                                     // falls, accelerating
      const f = F[k];
      const y0 = GROUND - f.h - 210, y1 = GROUND - f.h + 26;
      const sway = Math.sin(fr*5.2 + k)*14*(1-fr);
      out.slip = { x: f.cx + sway + (k%2? -6:8), y: y0 + (y1-y0)*e, r: (k%2? -1:1)*(.5 - fr*.42) + Math.sin(fr*6)*.12*(1-fr) };
      if (t >= land) out.slip.y = y1 + Math.min(1,(t-land)/.25)*20;       // slides in, under the front panel
    }
    if (t >= land && t < land + 2/FPS) out.squash = true;
    if (t >= land){
      let f = Math.floor((t - land)*FPS/2)*2, acc = 0, i = 0;               // frames counted on twos
      for (; i < s.poses.length-1; i++){ acc += s.poses[i][2]*2; if (f < acc) break; }
      out.pose = i+1;
      out.variant = (i < s.poses.length-1) ? (Math.floor((t-land)*FPS/2) % 2) : 0;
    }
    return out;
  }

  function blit(ctx, d, dx=0, dy=0){ ctx.drawImage(d.c, d.box.x+dx, d.box.y+dy, d.box.w, d.box.h); }

  function render(ctx, t){
    ctx.save(); ctx.clearRect(0,0,LW,LH);
    blit(ctx, cache.ground);
    F.forEach((f,k) => {
      const st = stateAt(k, t);
      blit(ctx, cache.back[k]);
      const P = cache.plants[k][st.pose]; blit(ctx, P[Math.min(st.variant, P.length-1)]);
      if (st.slip){
        ctx.save(); ctx.translate(st.slip.x, st.slip.y); ctx.rotate(st.slip.r);
        const d = cache.slips[k]; ctx.drawImage(d.c, d.box.x, d.box.y, d.box.w, d.box.h); ctx.restore();
      }
      blit(ctx, st.squash ? cache.squash[k] : cache.front[k]);
    });
    ctx.restore();
  }

  /* ---------- public: mount into a canvas, with play / pause / replay / reduced motion ---------- */
  function mount(canvas, opts={}){
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    SPR = Math.max(SPR, dpr*1.25);
    canvas.width = LW*dpr; canvas.height = LH*dpr;
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
    let t = (reduce || opts.hold) ? DURATION : 0, playing = false, last = 0, raf = 0, lastFrame = -1;
    const onState = opts.onState || (()=>{});
    function frame(now){
      if (!playing) return;
      const dt = Math.min(.1, (now - last)/1000); last = now; t += dt;
      const fi = Math.floor(t*FPS);
      if (fi !== lastFrame){ lastFrame = fi; render(ctx, Math.floor(t*FPS)/FPS); }
      if (t >= DURATION){ t = DURATION; playing = false; render(ctx, t); onState('done'); return; }
      raf = requestAnimationFrame(frame);
    }
    const api = {
      play(){ cancelAnimationFrame(raf); if (t >= DURATION) t = 0; playing = true; last = performance.now(); onState('playing'); raf = requestAnimationFrame(frame); },
      pause(){ playing = false; cancelAnimationFrame(raf); raf = 0; onState('paused'); },
      toggle(){ playing ? api.pause() : api.play(); },
      replay(){ cancelAnimationFrame(raf); playing = false; t = 0; lastFrame = -1; api.play(); },
      get playing(){ return playing; }, get reduce(){ return reduce; }
    };
    const go = () => { cache = cache || build(); render(ctx, t); if (!reduce && opts.autoplay !== false) api.play(); else onState('done'); };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 30));
    return api;
  }

  return { mount, render, build: () => (cache = build()), stateAt, LW, LH, DURATION, setSPR: v => SPR = v, _cache: () => cache };
})();
