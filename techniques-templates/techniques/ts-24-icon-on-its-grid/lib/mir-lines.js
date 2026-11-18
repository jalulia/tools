/* mir-lines · Mir in simple lines — TS-24 Mir on its icon grid · Techniques & Templates · ø co.
   Lifted from techniques/ts-24-icon-on-its-grid/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Above 40 px the can faces and the glint start to close. Below 16 px the line reads as a hairline at 120 px and under. Mir’s inked width is held at 56% of the tile or more, so a small safe area and a small Mir never leave a badge in an empty tile. */
export const id="mir-lines", name="Mir in simple lines", code="TS-24", entry="ts-24-icon-on-its-grid";
export const atoms=["sphere","cylinder","decal","single-weight"];
export const spec={
  "id": "mir-lines",
  "short": "MIR",
  "name": "Mir in simple lines",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "sphere",
    "cylinder",
    "decal",
    "single-weight"
  ],
  "params": {
    "line_px": {
      "value": 28,
      "range": [
        16,
        40
      ],
      "unit": "px",
      "label": "Line weight",
      "note": "Mir’s line at 1024 px; folds take 0.55 of it, thinning to as little as half that when the rows cannot keep one stroke width apart."
    },
    "size_pct": {
      "value": 87,
      "range": [
        70,
        100
      ],
      "unit": "%",
      "label": "Mir size",
      "note": "Mir’s inked width as a share of the safe circle diameter, never under 56% of the tile; Mir is centered on its inked box."
    },
    "tilt_deg": 8,
    "look_deg": [
      18,
      30
    ],
    "band_lat_deg": 12,
    "fold_margin": 0.06,
    "fold_clear": 1,
    "splay_deg": 26.5,
    "can_r": 0.46,
    "antenna": 0.57,
    "rod_r": 0.12,
    "rows": 3,
    "seed": 23
  },
  "limits": "Above 40 px the can faces and the glint start to close. Below 16 px the line reads as a hairline at 120 px and under. Mir’s inked width is held at 56% of the tile or more, so a small safe area and a small Mir never leave a badge in an empty tile.",
  "implementation": "The TS-23 construction at turn 0°, tilt 8°: sphere, band at 12°, decal eyes and mouth, two cans splayed 26.5°, antenna tubes, scalloped folds. Its radius is solved so line plus geometry fills the target width."
};
export const params={
  "line_px": 28,
  "size_pct": 87,
  "tilt_deg": 8,
  "look_deg": [
    18,
    30
  ],
  "band_lat_deg": 12,
  "fold_margin": 0.06,
  "fold_clear": 1,
  "splay_deg": 26.5,
  "can_r": 0.46,
  "antenna": 0.57,
  "rod_r": 0.12,
  "rows": 3,
  "seed": 23
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>{ const D=Math.PI/180, ti=P.tilt_deg*D, ct=Math.cos(ti), st=Math.sin(ti), sB=Math.sin(P.band_lat_deg*D);
      const W=p=>[p[0], p[1]*ct+p[2]*st, -p[1]*st+p[2]*ct], at=(l,f)=>[Math.cos(f)*Math.sin(l), Math.sin(f), Math.cos(f)*Math.cos(l)];
      const nrm=p=>{ const l=Math.hypot(p[0],p[1],p[2]); return [p[0]/l,p[1]/l,p[2]/l]; }, add=(p,q,s)=>[p[0]+q[0]*s, p[1]+q[1]*s, p[2]+q[2]*s];
      const vis=pts=>{ const out=[]; let cur=null; for(let i=0;i<pts.length;i++){ const p=pts[i]; if(p[2]>0){ if(!cur){ cur=[]; if(i>0){ const q=pts[i-1], t=-q[2]/(p[2]-q[2]); cur.push([q[0]+(p[0]-q[0])*t, q[1]+(p[1]-q[1])*t]); } } cur.push(p); } else if(cur){ const q=pts[i-1], t=-q[2]/(p[2]-q[2]); cur.push([q[0]+(p[0]-q[0])*t, q[1]+(p[1]-q[1])*t]); out.push(cur); cur=null; } } if(cur)out.push(cur); return out; };
      const hull=pts=>{ const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]), cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]), lo=[], up=[];
        for(const q of p){ while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop(); lo.push(q); }
        for(let i=p.length-1;i>=0;i--){ const q=p[i]; while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop(); up.push(q); } lo.pop(); up.pop(); return lo.concat(up); };
      const rim=(c,e1,e2,r,n)=>{ const o=[]; for(let i=0;i<n;i++){ const t=2*Math.PI*i/n; o.push(W([c[0]+(e1[0]*Math.cos(t)+e2[0]*Math.sin(t))*r, c[1]+(e1[1]*Math.cos(t)+e2[1]*Math.sin(t))*r, c[2]+(e1[2]*Math.cos(t)+e2[2]*Math.sin(t))*r])); } return o; };
      /* the construction at R = 1 in view space (x right, y up); folds depend on the row count */
      const geom=rows=>{ const g={ rows };
        const band=[]; for(let i=0;i<=240;i++){ const l=-Math.PI+2*Math.PI*i/240; band.push(W(at(l,P.band_lat_deg*D))); } g.band=vis(band);
        /* folds as in TS-23: long wavy strokes, a hook at one end, rows between the band and 80° */
        g.folds=[]; const b0=P.band_lat_deg*D+P.fold_margin, top=80*D, sp=(top-b0)/rows, amp=Math.min(0.075,0.25*sp), hr=Math.min(0.055,0.35*sp); g.sp=sp;
        for(let i=0;i<rows;i++){ const r=A.rng(P.seed+i*7919), phi=b0+sp*(i+0.5), cp=Math.cos(phi); let lam=-Math.PI+r()*0.9;
          while(lam<Math.PI-0.1){ const dl=Math.min(0.8*(0.7+0.6*r())/cp, Math.PI-lam), al=dl*cp, k=Math.max(1,Math.round(al/0.28)), m=Math.max(18,k*16), sl=(r()-0.5)*0.4*sp, ph0=r()*6.28, hk=r()<0.5, pts=[];
            for(let j=0;j<=m;j++){ const t=j/m, f=k*t-Math.floor(k*t), hump=j===m?0:Math.sqrt(Math.sin(Math.PI*f)); pts.push([lam+dl*t, phi+sl*Math.sin(Math.PI*(t-0.5)+0.6*Math.sin(ph0))+amp*hump]); }
            const e=hk?pts[pts.length-1]:pts[0], dir=hk?1:-1, curl=[]; for(let j=1;j<=9;j++){ const th=j/9*1.95; curl.push([e[0]+dir*hr*Math.sin(th)/cp, e[1]-hr*(1-Math.cos(th))]); }
            for(const v of vis((hk?pts.concat(curl):curl.reverse().concat(pts)).map(q=>W(at(q[0],q[1])))))if(v.length>1)g.folds.push(v); lam+=dl+0.18*(0.7+0.6*r())/cp; } }
        const decal=c=>{ const eu=nrm([c[2],0,-c[0]]), ev=[c[1]*eu[2]-c[2]*eu[1], c[2]*eu[0]-c[0]*eu[2], c[0]*eu[1]-c[1]*eu[0]]; return (s,t)=>W(nrm([c[0]+s*eu[0]+t*ev[0], c[1]+s*eu[1]+t*ev[1], c[2]+s*eu[2]+t*ev[2]])); };
        const ax=P.look_deg[0]*D, up=P.look_deg[1]*D; let qx=1.4*Math.sin(ax)*Math.cos(up), qy=1.4*Math.sin(up); const ql=Math.hypot(qx,qy); if(ql>1e-6){ const k=1/Math.pow(1+Math.pow(ql/0.85,6),1/6); qx*=k; qy*=k; }
        g.eyes=[-1,1].map(s=>{ const f=decal(at(s*20*D+0.1*ax,-13.6*D+0.06*up)), loop=[], hl=[]; for(let i=0;i<72;i++){ const t=2*Math.PI*i/72; loop.push(f(0.25*Math.cos(t),0.28*Math.sin(t))); hl.push(f(qx*0.25+0.12*Math.cos(t), qy*0.28+0.12*Math.sin(t))); } return { loop, hl }; });
        const fm=decal(at(0,-35*D)); g.mouth=[]; for(let i=0;i<=28;i++){ const t=Math.PI*i/28; g.mouth.push(fm(0.11*Math.cos(t),-0.13*Math.sin(t))); }
        /* cans as in TS-23: pucks with rounded edges (0.2 r outer, 0.12 r inner), outline = hull of 14 rims */
        const sg=P.splay_deg*D, r=P.can_r, h2=0.72*r, ro=0.2*r, ri=0.12*r;
        g.cans=[-1,1].map(s=>{ const a=[s*Math.cos(sg),0,Math.sin(sg)], e1=[-a[2],0,a[0]], e2=[0,1,0], Ci=add([0,-0.21,0],a,1), Co=add(Ci,a,h2), M=add(Ci,a,h2*0.5), all=[];
          for(let k=0;k<=6;k++){ const t=k/6*Math.PI/2; all.push(...rim(add(Ci,a,ri-ri*Math.sin(t)),e1,e2,r-ri+ri*Math.cos(t),144), ...rim(add(Ci,a,h2-ro+ro*Math.sin(t)),e1,e2,r-ro+ro*Math.cos(t),144)); }
          const gx=0.55*e1[2], th=Math.atan2(1,gx), G0=add(Ci,a,h2-ro*0.75), gl=[]; for(let i=0;i<=16;i++){ const t=th-0.62+1.24*i/16, n=[Math.cos(t)*e1[0],Math.sin(t),Math.cos(t)*e1[2]]; if(W(n)[2]>0.08)gl.push(W(add(G0,n,r-ro*0.04))); }
          return { hull:hull(all), cap:rim(Co,e1,e2,r-ro,144), B:W(add(M,e2,r*0.4)), T:W(add(M,e2,r+P.antenna)), gloss:gl }; });
        let x0=-1,x1=1,y0=-1,y1=1; for(const c of g.cans){ for(const p of c.hull){ x0=Math.min(x0,p[0]); x1=Math.max(x1,p[0]); y0=Math.min(y0,p[1]); y1=Math.max(y1,p[1]); } y1=Math.max(y1,c.T[1]+P.rod_r); x0=Math.min(x0,c.T[0]-P.rod_r); x1=Math.max(x1,c.T[0]+P.rod_r); }
        g.box=[x0,x1,y0,y1]; return g; };
      /* draw at center (cx, cy) device px, radius R px, line w px, fold line wf px, inks C */
      const draw=(x,g,cx,cy,R,w,wf,C)=>{ const pj=p=>[cx+p[0]*R, cy-p[1]*R];
        const path=(pts,closed)=>{ x.beginPath(); const p0=pj(pts[0]); x.moveTo(p0[0],p0[1]); for(let i=1;i<pts.length;i++){ const p=pj(pts[i]); x.lineTo(p[0],p[1]); } if(closed)x.closePath(); };
        const st=(pts,wd,col,closed)=>{ if(pts.length<2)return; path(pts,closed); x.lineWidth=wd; x.strokeStyle=col; x.lineCap='round'; x.lineJoin='round'; x.stroke(); };
        const fi=(pts,col)=>{ path(pts,true); x.fillStyle=col; x.fill(); };
        x.beginPath(); x.arc(cx,cy,R,0,2*Math.PI); x.fillStyle=C.face; x.fill();
        /* folds keep one stroke width clear of the outline, the band and each other; longest first; pieces under 2.5 widths dropped after the cut.
           When fewer strokes than rows fit, the fold stroke thins (to half at most) and the pick repeats, so a heavy line never leaves a bald dome. */
        const wf0=Math.min(wf,0.32*g.sp*R), scr=g.folds.map(f=>f.map(pj)), len=f=>{ let l=0; for(let k=1;k<f.length;k++)l+=Math.hypot(f[k][0]-f[k-1][0],f[k][1]-f[k-1][1]); return l; }; scr.sort((a,b)=>len(b)-len(a));
        const pick=wf=>{ const gap=wf*(0.5+P.fold_clear), lim=R-w/2-gap, cs=Math.max(2,w), grid=new Map(), key=(i,j)=>i*100003+j, out=[], minL=Math.max(2.5*wf,0.13*R);
          const put=(p,r)=>{ const k=key(Math.floor(p[0]/cs),Math.floor(p[1]/cs)); let c=grid.get(k); if(!c)grid.set(k,c=[]); c.push([p[0],p[1],r]); }, reach=Math.ceil((w/2+gap)/cs);
          const free=p=>{ const gx=Math.floor(p[0]/cs), gy=Math.floor(p[1]/cs); for(let i=-reach;i<=reach;i++)for(let j=-reach;j<=reach;j++){ const c=grid.get(key(gx+i,gy+j)); if(c)for(const q of c)if(Math.hypot(p[0]-q[0],p[1]-q[1])<q[2]+gap)return false; } return true; };
          for(const b of g.band)for(const p of b)put(pj(p),w/2);
          for(const f of scr){ const runs=[]; let cur=[]; for(const p of f){ if(Math.hypot(p[0]-cx,p[1]-cy)<lim&&free(p))cur.push(p); else if(cur.length){ runs.push(cur); cur=[]; } } if(cur.length)runs.push(cur);
            for(const r of runs){ if(len(r)<minL)continue; out.push(r); for(const p of r)put(p,wf/2); } }
          return out; };
        let fw=wf0, kept=pick(fw); for(const k of [0.8,0.65,0.5]){ if(kept.length>=g.rows)break; const t=pick(wf0*k); if(t.length>kept.length){ kept=t; fw=wf0*k; } }
        const sst=(pts,wd)=>{ if(pts.length<2)return; x.beginPath(); x.moveTo(pts[0][0],pts[0][1]); for(const p of pts)x.lineTo(p[0],p[1]); x.lineWidth=wd; x.strokeStyle=C.line; x.lineCap='round'; x.lineJoin='round'; x.stroke(); };
        for(const r of kept)sst(r,fw);
        for(const b of g.band)st(b,w,C.line,false);
        for(const e of g.eyes){ const h=new Path2D(); h.rect(-1e5,-1e5,2e5,2e5); const p0=pj(e.hl[0]); h.moveTo(p0[0],p0[1]); for(const q of e.hl){ const p=pj(q); h.lineTo(p[0],p[1]); } h.closePath(); x.save(); x.clip(h,'evenodd'); fi(e.loop,C.line); x.restore(); }
        fi(g.mouth,C.line); st(g.mouth,w*0.22,C.line,true);
        x.beginPath(); x.arc(cx,cy,R,0,2*Math.PI); x.lineWidth=w; x.strokeStyle=C.line; x.stroke();
        for(const c of g.cans){ const ro=P.rod_r*R; st([c.B,c.T],2*ro+w,C.line,false); if(2*ro-w>0.5)st([c.B,c.T],2*ro-w,C.face,false);
          fi(c.hull,C.accent); fi(c.cap,C.face);
          /* gloss: always the light ink, clipped to the side band between hull and face, under the outlines */
          if(c.gloss.length>2&&C.accent!==C.face){ const band=new Path2D(); const h0=pj(c.hull[0]); band.moveTo(h0[0],h0[1]); for(const q of c.hull){ const p=pj(q); band.lineTo(p[0],p[1]); } band.closePath(); const k0=pj(c.cap[0]); band.moveTo(k0[0],k0[1]); for(const q of c.cap){ const p=pj(q); band.lineTo(p[0],p[1]); } band.closePath();
            x.save(); x.clip(band,'evenodd'); st(c.gloss,w*0.45,C.shine,false); x.restore(); }
          st(c.hull,w,C.line,true); st(c.cap,w,C.line,true); } };
      return { geom, draw, line:P.line_px, size:P.size_pct/100, sinB:sB }; };
export default make;
