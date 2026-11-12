/* common.js · shared ground for the five V02 motion studies (2026-10-20).
   Style: Mindgut-Boards_V01 page chrome — #111010 ground, Archivo + JetBrains Mono, hairline rules, one accent.
   Everything renders deterministically from (ctx, t). Same file for Node (canvas) and browser. */
(function(root){
  const C = { bg:'#111010', ink:'#F3EFE8', ink2:'#B9B3AA', ink3:'#7A746C', line:'#2A2724', line2:'#3A3632',
              blue:'#2445D6', blueL:'#6F86F2', orange:'#EB5F2C', amber:'#F2B544', violet:'#9C8FD6', green:'#3DDC97', phosphor:'#B7F56A' };
  const SANS = '"Archivo", "Helvetica Neue", Arial, sans-serif', MONO = '"JetBrains Mono", Menlo, monospace';
  const clamp = (x,a=0,b=1) => x<a?a:x>b?b:x, seg = (t,a,b) => clamp((t-a)/(b-a));
  const eo = x => 1-Math.pow(1-x,3), ei = x => x*x*x, eio = x => x<.5 ? 4*x*x*x : 1-Math.pow(-2*x+2,3)/2;
  const ss = (a,b,x) => { const k = seg(x,a,b); return k*k*(3-2*k); };
  function rng(seed){ let s = (seed*2654435761)>>>0; return () => { s = (s + 0x6D2B79F5)>>>0; let t = s;
    t = Math.imul(t ^ t>>>15, t|1); t ^= t + Math.imul(t ^ t>>>7, t|61); return ((t ^ t>>>14)>>>0)/4294967296; }; }
  function noise1(seed){ const r = rng(seed), v = Array.from({length:256}, r);
    return x => { const i = Math.floor(x), f = x - i, a = v[((i%256)+256)%256], b = v[(((i+1)%256)+256)%256]; const u = f*f*(3-2*f); return a + (b-a)*u; }; }
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
  function wordmark(ctx, x, y, h, color){ const im = tinted(A.wm, color || C.ink, '_wm'+(color||'')); if (!im) return; ctx.drawImage(im, x, y, im.width*h/im.height, h); }
  function robot(ctx, x, y, s, color, a=1){ const im = tinted(A.robot, color || C.ink, '_rb'+(color||'')); if (!im) return; ctx.globalAlpha = a; ctx.drawImage(im, x, y, s, s*im.height/im.width); ctx.globalAlpha = 1; }
  function chrome(ctx, W, H, eyebrow, footL, footR){
    ctx.fillStyle = C.bg; ctx.fillRect(0,0,W,H);
    wordmark(ctx, 48, 34, 16, C.ink);
    txt(ctx, eyebrow, W-48, 48, { mono:1, size:10, color:C.ink3, align:'right', ls:1.2 });
    ctx.fillStyle = C.line; ctx.fillRect(48, 66, W-96, 1);
    txt(ctx, footL, 48, H-30, { mono:1, size:9.5, color:C.ink3, ls:1 });
    txt(ctx, footR, W-48, H-30, { mono:1, size:9.5, color:C.ink3, align:'right', ls:1 });
  }
  function grain(ctx, W, H, frame, amt=.035){
    if (!A._g){ A._g = []; for (let k=0;k<4;k++){ const c = A.make(256,256), q = c.getContext('2d'), id = q.createImageData(256,256), r = rng(900+k);
      for (let i=0;i<id.data.length;i+=4){ const v = 128 + (r()-.5)*255; id.data[i]=id.data[i+1]=id.data[i+2]=v; id.data[i+3]=255; } q.putImageData(id,0,0); A._g.push(c); } }
    const g = A._g[Math.floor(frame/4) % 4]; ctx.save(); ctx.globalAlpha = amt; ctx.globalCompositeOperation = 'overlay';
    for (let y=0;y<H;y+=256) for (let x=0;x<W;x+=256) ctx.drawImage(g, x, y); ctx.restore();
  }
  root.MS = { C, SANS, MONO, clamp, seg, eo, ei, eio, ss, rng, noise1, bez, partial, stroke, rr, txt, wrap, typed, A, tinted, wordmark, robot, chrome, grain };
})(typeof window !== 'undefined' ? window : globalThis);
