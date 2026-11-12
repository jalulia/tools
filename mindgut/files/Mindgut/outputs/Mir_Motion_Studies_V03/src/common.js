/* common.js · materials for the five motion studies (V02, 2026-10-20), taken from the images ON the boards:
   stipple (the murmuration whale, the dotted cheese), moiré and halftone rings (red on blue, white on cobalt),
   cobalt as a material, bloom behind type (Der Augenblick), pictures made of characters (the blue ASCII field),
   phosphor terminals (amber, Bell Atlantic blue). Each piece gets its own ground. No page chrome. */
(function(root){
  const C = { cobalt:'#1F3FD1', cobaltDeep:'#1430A8', paper:'#F6F3EC', ink:'#15171E', orange:'#EB5F2C', amber:'#F2B544',
              violet:'#B2A6DE', lilac:'#CDC4EE', phosphor:'#FFB347', black:'#07070A', white:'#FFFFFF' };
  const SANS = '"Archivo", "Helvetica Neue", Arial, sans-serif', MONO = '"JetBrains Mono", Menlo, monospace';
  const clamp = (x,a=0,b=1) => x<a?a:x>b?b:x, seg = (t,a,b) => clamp((t-a)/(b-a));
  const eo = x => 1-Math.pow(1-x,3), ei = x => x*x*x, eio = x => x<.5 ? 4*x*x*x : 1-Math.pow(-2*x+2,3)/2;
  const ss = (a,b,x) => { const k = seg(x,a,b); return k*k*(3-2*k); };
  function rng(seed){ let s = (seed*2654435761)>>>0; return () => { s = (s + 0x6D2B79F5)>>>0; let t = s;
    t = Math.imul(t ^ t>>>15, t|1); t ^= t + Math.imul(t ^ t>>>7, t|61); return ((t ^ t>>>14)>>>0)/4294967296; }; }
  function noise2(seed){ const r = rng(seed), g = []; for (let i=0;i<64*64;i++) g.push(r());
    const at = (x,y) => g[((y&63)*64 + (x&63))];
    return (x,y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x-xi, fy = y-yi, ux = fx*fx*(3-2*fx), uy = fy*fy*(3-2*fy);
      return (at(xi,yi)*(1-ux) + at(xi+1,yi)*ux)*(1-uy) + (at(xi,yi+1)*(1-ux) + at(xi+1,yi+1)*ux)*uy; }; }
  function bez(p0,p1,p2,p3,n){ const o=[]; for(let i=0;i<=n;i++){ const t=i/n, m=1-t;
    o.push([m*m*m*p0[0]+3*m*m*t*p1[0]+3*m*t*t*p2[0]+t*t*t*p3[0], m*m*m*p0[1]+3*m*m*t*p1[1]+3*m*t*t*p2[1]+t*t*t*p3[1]]); } return o; }
  function partial(pts, p){ if (p >= 1) return pts; if (p <= 0) return [];
    const L=[0]; for (let i=1;i<pts.length;i++) L.push(L[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]));
    const tg = L[L.length-1]*p, o=[pts[0]];
    for (let i=1;i<pts.length;i++){ if (L[i] <= tg) o.push(pts[i]); else { const f=(tg-L[i-1])/((L[i]-L[i-1])||1); o.push([pts[i-1][0]+(pts[i][0]-pts[i-1][0])*f, pts[i-1][1]+(pts[i][1]-pts[i-1][1])*f]); break; } }
    return o; }
  function stroke(ctx, pts){ if (pts.length < 2) return; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); }
  function rr(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
  function txt(ctx, s, x, y, o={}){ ctx.font = `${o.wt||400} ${o.size||12}px ${o.mono ? MONO : SANS}`; ctx.fillStyle = o.color || C.ink;
    ctx.globalAlpha = o.a ?? 1; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic';
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = (o.ls || 0) + 'px'; ctx.fillText(s, x, y);
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px'; ctx.globalAlpha = 1; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; }
  function wrap(ctx, s, w){ const o=[]; let c=''; s.split(' ').forEach(x => { const t = c ? c+' '+x : x; if (ctx.measureText(t).width > w && c){ o.push(c); c = x; } else c = t; }); if (c) o.push(c); return o; }
  function typed(ctx, s, x, y, w, chars, o){ ctx.font = `${o.wt||400} ${o.size}px ${o.mono ? MONO : SANS}`; let left = chars;
    wrap(ctx, s, w).forEach((l,i) => { const v = l.slice(0, Math.max(0,left)); left -= l.length + 1; if (v) txt(ctx, v, x, y + i*o.lh, o); }); }
  const A = { robot:null, wm:null, make:(w,h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; } };
  function tinted(img, color, key){ if (!img) return null; if (A[key]) return A[key]; const c = A.make(img.width, img.height), q = c.getContext('2d');
    q.drawImage(img,0,0); q.globalCompositeOperation = 'source-in'; q.fillStyle = color; q.fillRect(0,0,c.width,c.height); return A[key] = c; }
  function wordmark(ctx, x, y, h, color){ const im = tinted(A.wm, color, '_wm'+color); if (!im) return; ctx.drawImage(im, x, y, im.width*h/im.height, h); }
  function robot(ctx, x, y, s, color, a=1){ const im = tinted(A.robot, color, '_rb'+color); if (!im) return; ctx.globalAlpha = a; ctx.drawImage(im, x, y, s, s*im.height/im.width); ctx.globalAlpha = 1; }

  /* ---- MATERIALS ---- */
  // stipple: fill a region with dots whose density follows a field. The murmuration whale. pts are precomputed once per seed,
  // each with a threshold; a dot shows when field(x,y) > threshold. Animate the field, not the dots, and the cloud breathes.
  function stippleSet(seed, x0, y0, x1, y1, n){ const r = rng(seed), o = []; for (let i=0;i<n;i++) o.push({ x: x0 + r()*(x1-x0), y: y0 + r()*(y1-y0), th: r(), s: .7 + r()*.9 }); return o; }
  function stipple(ctx, set, field, color, rad=1.3, a=1){ ctx.fillStyle = color; ctx.globalAlpha = a;
    for (const p of set){ const v = field(p.x, p.y); if (v <= p.th) continue; const k = clamp((v - p.th)*3); ctx.beginPath(); ctx.arc(p.x, p.y, rad*p.s*(.6 + .4*k), 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
  // halftone rings: concentric rings whose line weight follows a field. White on cobalt, red on blue.
  function rings(ctx, cx, cy, r0, r1, step, color, weightAt, a=1){ ctx.strokeStyle = color; ctx.globalAlpha = a;
    for (let r = r0; r <= r1; r += step){ const w = weightAt(r); if (w <= 0) continue; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); } ctx.globalAlpha = 1; }
  // bloom: a soft radial glow. The light that means someone is here.
  function bloom(ctx, x, y, r, color, a=1, inner=0){ const g = ctx.createRadialGradient(x, y, inner, x, y, r); g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore(); }
  // character field: a picture made of letters. cell grid; glyph chosen by density; the blue ASCII field.
  const GLYPHS = ' .:-=+*#%@';
  function charField(ctx, x0, y0, cols, rows, cw, ch, density, color, size, a=1){ ctx.font = `400 ${size}px ${MONO}`; ctx.fillStyle = color; ctx.globalAlpha = a; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    for (let r=0;r<rows;r++) for (let c=0;c<cols;c++){ const d = density(c, r); if (d <= .02) continue; const g = GLYPHS[Math.min(9, Math.floor(d*9.99))]; if (g !== ' ') ctx.fillText(g, x0 + (c+.5)*cw, y0 + (r+.5)*ch); }
    ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; }
  // paper grain: subtle, for white grounds. Boils every 4 frames.
  function grain(ctx, W, H, frame, amt=.05){ if (!A._g){ A._g = []; for (let k=0;k<4;k++){ const c = A.make(256,256), q = c.getContext('2d'), id = q.createImageData(256,256), r = rng(900+k);
      for (let i=0;i<id.data.length;i+=4){ const v = 128 + (r()-.5)*255; id.data[i]=id.data[i+1]=id.data[i+2]=v; id.data[i+3]=255; } q.putImageData(id,0,0); A._g.push(c); } }
    const g = A._g[Math.floor(frame/4) % 4]; ctx.save(); ctx.globalAlpha = amt; ctx.globalCompositeOperation = 'overlay'; for (let y=0;y<H;y+=256) for (let x=0;x<W;x+=256) ctx.drawImage(g, x, y); ctx.restore(); }
  function mark(ctx, W, H, color){ wordmark(ctx, 40, H - 40, 13, color); }
  root.MS = { C, SANS, MONO, GLYPHS, clamp, seg, eo, ei, eio, ss, rng, noise2, bez, partial, stroke, rr, txt, wrap, typed, A, tinted, wordmark, robot, stippleSet, stipple, rings, bloom, charField, grain, mark };
})(typeof window !== 'undefined' ? window : globalThis);
