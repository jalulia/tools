window.STUDY={
  id:'ts-24-icon-on-its-grid', code:'TS-24', fig:'1.24',
  title:'Mir on its icon grid',
  kicker:'Technique · TS-24',
  lede:'The 1024 px icon tile, its keylines, and Mir down a five-size ladder.',
  body:[
    'The tile is 1024 px with a 22.4% corner. The keylines are a 16 × 64 px grid, the inscribed circle, the 80% safe circle and square, the diagonals and the center cross. Mir is the TS-23 construction at front view in one 28 px line, scaled so its inked width is 87% of the safe circle.',
    'The ladder redraws the icon at 180, 120, 80, 58 and 40 px. Optical compensation thickens the line as the icon shrinks, by (1 + c) at 40 px and less above, and drops fold rows that would close up. With pixel snapping on, each size is drawn at its true pixel count with whole-pixel lines, and a loupe shows the 40 px icon enlarged without smoothing.'
  ],
  source:'Reference 24 · Mir app icon construction sheet, Mindgut brand world, 1400 × 1400',
  spot:[18,107,61], ref:{w:1400,h:1400},
  variantLabel:'Inks',
  variants:[
    { id:'ref', label:'Mindgut', sw:['#FBFBF7','#151B17','#126B3D','#D0EC60','#0A4528'], spot:[18,107,61], sheet:'#FFFFFF', paper:'#FBFBF7', white:'#FFFFFF', ink:'#151B17', green:'#126B3D', deep:'#0A4528', lime:'#D0EC60' },
    { id:'io', label:'Ø', sw:['#FFFFFF','#101014','#2F5AE6','#F4551E'], spot:[244,85,30], sheet:'#FFFFFF', paper:'#FFFFFF', white:'#FFFFFF', ink:'#101014', green:'#2F5AE6', deep:'#2F5AE6', lime:'#F4551E' }
  ],
  points:[
    {u:0.10,v:0.16,d:'CRNR',label:'Corner · radius 22.4% of the tile, circular arc',t:'icon-tile',dir:[-1,-1]},
    {u:0.62,v:0.70,d:'TILE',label:'Tile · 1024 px, filled in the tile ink',t:'icon-tile',dir:[1,1]},
    {u:0.20,v:0.30,d:'SAFE',label:'Safe circle · 80% of the tile, dashed',t:'safe-area',dir:[-1,-1]},
    {u:0.58,v:0.17,d:'GRID',label:'Grid · 16 cells of 64 px',t:'safe-area',dir:[1,-1]},
    {u:0.70,v:0.43,d:'CROS',label:'Center cross · runs 25 u past the tile',t:'safe-area',dir:[1,0]},
    {u:0.37,v:0.66,d:'LINE',label:'Mir line · 28 px at 1024',t:'mir-lines',dir:[-1,1]},
    {u:0.20,v:0.43,d:'MIR',label:'Mir width · 87% of the safe circle',t:'mir-lines',dir:[-1,0]},
    {u:0.86,v:0.20,d:'L180',label:'Ladder 180 px · 5.7 px line',t:'size-ladder',dir:[1,-1]},
    {u:0.86,v:0.70,d:'L40',label:'Ladder 40 px · 2.0 px line, one fold row',t:'size-ladder',dir:[1,1]},
    {u:0.37,v:0.80,d:'DIM',label:'Dimension · 1024 px, mono 14 u',t:'dimension-notes',dir:[-1,1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1400,1400], grammar:'icon construction sheet: rounded tile, 16 × 64 px grid, keyline circle and square, safe circle, diagonals, center cross, dimension lines and mono notes; the character in one line weight centered on the tile' },
    units:'design units, 1000 = plate width; the plate is square. The sheet tile is 680 u for 1024 px.',
    palette:{ sheet:'#FFFFFF', paper:'#FBFBF7', ink:'#151B17', green:'#126B3D', deep:'#0A4528', lime:'#D0EC60' },
    techniques:[
      { id:'icon-tile', short:'TILE', name:'Tile and corner', layer:0, pass:0, atoms:['rounded-rect','superellipse','continuous-curvature'],
        params:{ tile:{ value:3, options:[{v:1,label:'Accent'},{v:2,label:'Deep'},{v:3,label:'Light'},{v:4,label:'Ink'}], label:'Tile', note:'Tile ink, by role. Mir follows: ink line on accent and light, paper line on deep and ink; the cans keep the accent except on light, where Mir is line only.' }, corner_pct:{ value:22.4, range:[10,32], unit:'%', label:'Corner radius', note:'Corner radius as a share of the tile side.' }, smoothing:{ value:0, range:[0,100], unit:'%', label:'Corner smoothing', note:'0% is a circular arc; 100% is the most continuous curvature the radius allows; the track is front-loaded (square root), and the sheet shows the circular arc as a faint dashed ghost.' } },
        limits:'A smoothed corner never runs past the middle of a side, so above a 25% radius the whole track maps onto the smaller range left (at 32%, up to 56%); the note on the sheet shows the smoothing drawn. The track follows a square root, so the first quarter already gives half the smoothing.',
        implementation:'Each corner is a circular arc of 90° × (1 − smoothing) between two cubic easings, the corner taking (1 + smoothing) × radius of each side (the Figma corner-smoothing construction).' },
      { id:'safe-area', short:'SAFE', name:'Safe area and keylines', layer:1, pass:1, atoms:['keyline','grid','safe-area','center-cross'],
        params:{ safe_pct:{ value:80, range:[64,92], unit:'%', label:'Safe area', note:'Diameter of the safe circle and side of the safe square, as a share of the tile.' }, construction:{ value:3, options:[{v:1,label:'Off'},{v:2,label:'Keylines'},{v:3,label:'Full grid'}], label:'Construction', note:'Off shows the tile alone. Keylines adds the circles, square, diagonals, center cross and notes. Full grid adds the 16 × 64 px grid.' }, cells:16, cell_px:64 },
        limits:'Below 64% Mir becomes a badge in an empty tile; above 92% the safe circle meets the corner arcs.',
        implementation:'All keylines are drawn twice, clipped inside and outside the tile, so they keep contrast on dark tiles. Grid and keylines sit under Mir; the center cross and notes sit over it.' },
      { id:'mir-lines', short:'MIR', name:'Mir in simple lines', layer:2, pass:2, atoms:['sphere','cylinder','decal','single-weight'],
        params:{ line_px:{ value:28, range:[16,40], unit:'px', label:'Line weight', note:'Mir’s line at 1024 px; folds take 0.55 of it, thinning to as little as half that when the rows cannot keep one stroke width apart.' }, size_pct:{ value:87, range:[70,100], unit:'%', label:'Mir size', note:'Mir’s inked width as a share of the safe circle diameter, never under 56% of the tile; Mir is centered on its inked box.' }, tilt_deg:8, look_deg:[18,30], band_lat_deg:12, fold_margin:0.06, fold_clear:1, splay_deg:26.5, can_r:0.46, antenna:0.57, rod_r:0.12, rows:3, seed:23 },
        limits:'Above 40 px the can faces and the glint start to close. Below 16 px the line reads as a hairline at 120 px and under. Mir’s inked width is held at 56% of the tile or more, so a small safe area and a small Mir never leave a badge in an empty tile.',
        implementation:'The TS-23 construction at turn 0°, tilt 8°: sphere, band at 12°, decal eyes and mouth, two cans splayed 26.5°, antenna tubes, scalloped folds. Its radius is solved so line plus geometry fills the target width.' },
      { id:'size-ladder', short:'LADR', name:'Size ladder', layer:3, pass:3, atoms:['optical-size','pixel-grid','hinting'],
        params:{ optical:{ value:80, range:[0,120], unit:'%', label:'Optical compensation', note:'How much thicker the line gets at 40 px than plain scaling gives (less at larger sizes); 0% scales the line with the icon.' }, snapping:{ value:1, options:[{v:1,label:'Off'},{v:2,label:'On'}], label:'Pixel snapping', note:'On draws each size at its true pixel count with whole-pixel lines, and a loupe under the ladder shows the 40 px icon at a whole-number enlargement.' }, sizes:[180,120,80,58,40], fold_min_px:7.5, cap:0.24, min_w:0.56 },
        limits:'The line is held under 0.24 of Mir’s radius at every size, so with a heavy line the compensation runs out early. Rungs keep their true relative sizes; the loupe is never under 2×.',
        implementation:'Each size keeps the same inked width share. line = weight × N / 1024 × (1 + c × (1024 / N − 1) / 24.6), held under 0.24 R; fold rows = ⌊dome height / max(2.8 × fold line, 7.5 px)⌋, held to 1–3.' },
      { id:'dimension-notes', short:'NOTE', name:'Dimension notes', layer:4, pass:4, atoms:['mono-caps','dimension-line','knockout'],
        params:{ size_u:14, caption_u:14, rule_u:1.1, tick_u:10 },
        limits:'Notes knock out the lines under them, so they never sit on a keyline.',
        implementation:'JetBrains Mono capitals at 14 u on the sheet; ladder captions in Inter at 14 u (no dotted zeros); dimension lines with 10 u end ticks; each note sits on a box in the color under it. Inside a colored tile, notes and keylines are set in ink or paper.' }
    ],
    pass_order:['sheet · white','tile · rounded path in the tile ink','keylines · grid, circles, square and diagonals, inside and outside the tile','Mir · fills, folds, band, decals, cans and antennae in one line','over · center cross, tile outline, dimension lines and notes','ladder · five sizes, vector or snapped pixels'],
    notes:['Measured on ref.png (1400 × 1400): tile 1100 px for 1024 (150 to 1250); corner profile matches a circular arc of radius 246 px (22.4%); safe circle 880 px; grid pitch 68.75 px = 64 icon px; Mir line 28 to 33 sheet px ≈ 28 icon px; Mir inked width 766 sheet px = 87% of the safe circle.','Ladder sizes 180, 120, 80, 58 and 40 px from the deck page.']
  },
  techniques:{
    'icon-tile': (P,u,A,V)=>{ const D=Math.PI/180;
      const R={ 1:{ tile:V.lime, line:V.ink, face:V.white, accent:V.lime, dark:false }, 2:{ tile:V.deep, line:V.paper, face:V.green, accent:V.lime, dark:true },
        3:{ tile:V.paper, line:V.ink, face:V.paper, accent:V.paper, dark:false }, 4:{ tile:V.ink, line:V.paper, face:V.ink, accent:V.lime, dark:true } }[P.tile]; R.shine=V.white;
      /* rounded square with smoothed corners at (x0, y0), side n */
      const smax=Math.min(1,Math.max(0,50/P.corner_pct-1)), sm=Math.sqrt(P.smoothing/100)*smax;
      const path=(x0,y0,n,s0)=>{ const r=P.corner_pct/100*n, s=s0===undefined?sm:s0, p=Math.min(n/2,(1+s)*r);
        const am=90*(1-s), al=Math.sin(am/2*D)*r*Math.SQRT2, ta=Math.tan((90-am)/4*D)*r, be=45*s*D, c=ta*Math.cos(be), d=c*Math.tan(be), b=(p-al-c-d)/3, a=2*b, f=v=>(+v).toFixed(3);
        const E=n-p, abc=a+b+c;
        return new Path2D(`M ${f(x0+E)} ${f(y0)} c ${f(a)} 0 ${f(a+b)} 0 ${f(abc)} ${f(d)} a ${f(r)} ${f(r)} 0 0 1 ${f(al)} ${f(al)} c ${f(d)} ${f(c)} ${f(d)} ${f(b+c)} ${f(d)} ${f(abc)} L ${f(x0+n)} ${f(y0+E)}`+
          ` c 0 ${f(a)} 0 ${f(a+b)} ${f(-d)} ${f(abc)} a ${f(r)} ${f(r)} 0 0 1 ${f(-al)} ${f(al)} c ${f(-c)} ${f(d)} ${f(-(b+c))} ${f(d)} ${f(-abc)} ${f(d)} L ${f(x0+p)} ${f(y0+n)}`+
          ` c ${f(-a)} 0 ${f(-(a+b))} 0 ${f(-abc)} ${f(-d)} a ${f(r)} ${f(r)} 0 0 1 ${f(-al)} ${f(-al)} c ${f(-d)} ${f(-c)} ${f(-d)} ${f(-(b+c))} ${f(-d)} ${f(-abc)} L ${f(x0)} ${f(y0+p)}`+
          ` c 0 ${f(-a)} 0 ${f(-(a+b))} ${f(d)} ${f(-abc)} a ${f(r)} ${f(r)} 0 0 1 ${f(al)} ${f(-al)} c ${f(c)} ${f(-d)} ${f(b+c)} ${f(-d)} ${f(abc)} ${f(-d)} Z`); };
      return { roles:R, path, pct:P.corner_pct, smooth:sm }; },
    'safe-area': (P,u,A)=>({ safe:P.safe_pct/100, mode:P.construction, cells:P.cells, cell:P.cell_px }),
    'mir-lines': (P,u,A)=>{ const D=Math.PI/180, ti=P.tilt_deg*D, ct=Math.cos(ti), st=Math.sin(ti), sB=Math.sin(P.band_lat_deg*D);
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
      return { geom, draw, line:P.line_px, size:P.size_pct/100, sinB:sB }; },
    'size-ladder': (P,u,A)=>({ sizes:P.sizes, snap:P.snapping===2, c:P.optical/100,
      /* the icon at N px: line, fold line, fold rows, radius and center, inside an N × N tile */
      fit:(mir,N,safe,snap)=>{ const g3=mir.geom(3), b=g3.box, gw=b[1]-b[0], Wt=Math.max(mir.size*safe,P.min_w)*N, m=1+P.optical/100*(1024/N-1)/(1024/40-1);
        let w=Math.min(mir.line*N/1024*m, P.cap*Wt/(gw+P.cap)); if(snap)w=Math.max(1,Math.round(w)); let wf=0.55*w; if(snap)wf=Math.max(1,Math.round(wf));
        const R=(Wt-w)/gw, cap=R*(1-mir.sinB), rows=Math.max(1,Math.min(3,Math.floor(cap/Math.max(2.8*wf,P.fold_min_px))));
        let cx=N/2-R*(b[0]+b[1])/2, cy=N/2+R*(b[2]+b[3])/2; if(snap){ const o=w%2?0.5:0; cx=Math.round(cx-o)+o; cy=Math.round(cy-o)+o; }
        return { w, wf, R, rows, cx, cy, g:rows===3?g3:mir.geom(rows) }; } }),
    'dimension-notes': (P,u,A)=>({ size:P.size_u*u, cap:P.caption_u*u, rule:Math.max(1,P.rule_u*u), tick:P.tick_u*u,
      text:(x,s,X,Y,col,align,sz,knock,fam)=>{ x.font=fam||`500 ${sz}px "JetBrains Mono", monospace`; x.textAlign=align||'left'; x.textBaseline='alphabetic'; if(knock){ const m=x.measureText(s).width, x0=align==='right'?X-m:(align==='center'?X-m/2:X); x.fillStyle=knock; x.fillRect(x0-sz*0.35,Y-sz*0.92,m+sz*0.7,sz*1.25); } x.fillStyle=col; x.fillText(s,X,Y); } })
  },
  layout(u,cap){ cap=cap||14*u; const step=[Math.max(19*u,cap*1.36),Math.max(17*u,cap*1.22),Math.max(24*u,cap*1.5)], T=680*u, k=Math.min(0.76*u,(T-5*(step[0]+step[1])-4*step[2])/478);
    return { x0:50*u, y0:135*u, T, vdim:765*u, hdim:857*u, hlab:887*u, col:885*u, ly0:135*u, k, step, loupe:{ x:818*u, y:850*u, b:135*u } }; },
  pct(v){ return (Math.round(v*10)/10).toString()+'%'; },
  render(canvas,w,h,dpr,V,done,O){ const S=window.STUDY, A=window.ART, T=S.techniques, P=A.params(S.spec,O); const W=canvas.width, H=canvas.height, u=W/1000, x=canvas.getContext('2d'); x.setTransform(1,0,0,1,0,0);
    const tile=T['icon-tile'](P['icon-tile'],u,A,V), sa=T['safe-area'](P['safe-area'],u,A), mir=T['mir-lines'](P['mir-lines'],u,A), lad=T['size-ladder'](P['size-ladder'],u,A), nt=T['dimension-notes'](P['dimension-notes'],u,A);
    const mf=9*dpr; nt.size=Math.max(nt.size,mf); nt.cap=Math.max(nt.cap,mf); const L=S.layout(u,nt.cap); L.hdim=Math.max(L.hdim,L.y0+L.T+27*u+nt.size*1.7); L.hlab=Math.max(L.hlab,L.hdim+nt.size*1.9); const C=tile.roles, tp=tile.path(L.x0,L.y0,L.T), cx=L.x0+L.T/2, cy=L.y0+L.T/2, s=L.T/1024, mode=sa.mode;
    x.fillStyle=V.sheet; x.fillRect(0,0,W,H); x.fillStyle=C.tile; x.fill(tp);
    const hair=Math.max(1,u), inC=C.dark?V.paper:V.ink, inG=C.tile===V.paper?V.green:inC;
    /* lines drawn twice: inside the tile in its contrast inks, outside on the sheet */
    const both=fn=>{ x.save(); x.clip(tp); fn(inC,inG); x.restore(); x.save(); const o=new Path2D(); o.rect(0,0,W,H); o.addPath(tp); x.clip(o,'evenodd'); fn(V.ink,V.green); x.restore(); };
    const ln=(a,b,c,d)=>{ x.beginPath(); x.moveTo(a,b); x.lineTo(c,d); x.stroke(); };
    if(mode>=2)both((ink,grn)=>{ x.lineCap='butt';
      if(mode===3){ x.strokeStyle=ink; x.globalAlpha=0.1; x.lineWidth=hair; for(let i=0;i<=sa.cells;i++){ const p=L.x0+L.T*i/sa.cells, q=L.y0+L.T*i/sa.cells; ln(p,L.y0,p,L.y0+L.T); ln(L.x0,q,L.x0+L.T,q); } }
      x.globalAlpha=0.22; x.strokeStyle=ink; x.lineWidth=hair; ln(L.x0,L.y0,L.x0+L.T,L.y0+L.T); ln(L.x0+L.T,L.y0,L.x0,L.y0+L.T);
      const q=L.T*(1-sa.safe)/2; x.globalAlpha=0.26; x.strokeRect(L.x0+q,L.y0+q,L.T-2*q,L.T-2*q);
      x.globalAlpha=0.32; x.setLineDash([9*u,7*u]); x.beginPath(); x.arc(cx,cy,L.T/2,0,2*Math.PI); x.stroke();
      x.globalAlpha=0.95; x.strokeStyle=grn; x.lineWidth=Math.max(1,1.3*u); x.setLineDash([7*u,6*u]); x.beginPath(); x.arc(cx,cy,L.T*sa.safe/2,0,2*Math.PI); x.stroke(); x.setLineDash([]); x.globalAlpha=1; });
    /* with smoothing on, a faint dashed ghost of the plain circular-arc corner, so the difference reads */
    if(mode>=2&&tile.smooth>0.004){ const gp=tile.path(L.x0,L.y0,L.T,0); x.save(); x.setLineDash([5*u,4*u]); x.lineWidth=Math.max(1,1.1*u); x.strokeStyle=C.dark?V.paper:V.ink; x.globalAlpha=0.45; x.stroke(gp); x.restore(); }
    /* Mir at 1024 px, shown at 620 u */
    const f=lad.fit(mir,1024,sa.safe,false); mir.draw(x,f.g,L.x0+f.cx*s,L.y0+f.cy*s,f.R*s,f.w*s,f.wf*s,C);
    x.lineWidth=Math.max(1,1.6*u); x.strokeStyle=V.green; x.stroke(tp);
    if(mode>=2){ both((ink,grn)=>{ x.strokeStyle=grn; x.globalAlpha=0.85; x.lineWidth=Math.max(1,1.1*u); const e=25*u; ln(cx,L.y0-e,cx,L.y0+L.T+e); ln(L.x0-e,cy,L.x0+L.T+e,cy); x.globalAlpha=1; });
      x.strokeStyle=V.ink; x.lineWidth=nt.rule; x.globalAlpha=0.8; ln(L.vdim,L.y0,L.vdim,L.y0+L.T); ln(L.vdim-nt.tick,L.y0,L.vdim+nt.tick,L.y0); ln(L.vdim-nt.tick,L.y0+L.T,L.vdim+nt.tick,L.y0+L.T);
      ln(L.x0,L.hdim,L.x0+L.T,L.hdim); ln(L.x0,L.hdim-nt.tick,L.x0,L.hdim+nt.tick); ln(L.x0+L.T,L.hdim-nt.tick,L.x0+L.T,L.hdim+nt.tick); x.globalAlpha=1;
      nt.text(x,'1024 px',cx,L.hlab,V.ink,'center',nt.size);
      const cl='CORNER R '+S.pct(tile.pct)+(tile.smooth>0.004?' · SMOOTHING '+Math.round(tile.smooth*100)+'%':''), gl='GRID 16 × 64 px'; x.font=`500 ${nt.size}px "JetBrains Mono", monospace`; const tight=x.measureText(cl).width+x.measureText(gl).width+nt.size*2>L.T;
      nt.text(x,cl,L.x0,L.y0-22*u,V.green,'left',nt.size);
      /* the grid note moves under the tile, right, when the two top notes would meet */
      if(mode===3){ if(tight)nt.text(x,gl,L.x0+L.T,L.y0+L.T+27*u+nt.size*0.3,V.ink,'right',nt.size,V.sheet); else nt.text(x,gl,L.x0+L.T,L.y0-22*u,V.ink,'right',nt.size); }
      /* the safe-area note sits in the margin band while it has room, otherwise just under the tile */
      const band=L.T*(1-sa.safe)/2, lab='SAFE AREA '+S.pct(sa.safe*100);
      if(band>=3.2*nt.size)nt.text(x,lab,cx-12*u,cy+L.T*sa.safe/2+band*0.5+nt.size*0.35,inG,'right',nt.size,C.tile); else nt.text(x,lab,L.x0,L.y0+L.T+27*u,V.green,'left',nt.size,V.sheet); }
    S.ladder(x,L,u,V,C,tile,sa,mir,lad,nt); if(done)done(); },
  /* the ladder: every rung at its true relative size; with snapping on, each is its true-pixel render, and a loupe shows 40 px enlarged */
  ladder(x,L,u,V,C,tile,sa,mir,lad,nt){ const S=window.STUDY; let y=L.ly0; const fmt=v=>{ const r=Math.round(v*10)/10; return Number.isInteger(r)?String(r):r.toFixed(1); }, inter=(w,sz)=>`${w} ${sz}px Inter, system-ui, sans-serif`;
    const px=N=>{ const f=lad.fit(mir,N,sa.safe,true), cv=S._cv(N); cv.width=N; cv.height=N; const g=cv.getContext('2d'); g.clearRect(0,0,N,N); g.fillStyle=C.tile; g.fill(tile.path(0,0,N)); mir.draw(g,f.g,f.cx,f.cy,f.R,f.w,f.wf,C);
      if(C.tile===V.paper){ g.lineWidth=1; g.strokeStyle=V.green; g.stroke(tile.path(0.5,0.5,N-1)); } return { cv, f }; };
    lad.sizes.forEach(N=>{ const D=N*L.k, tx=Math.round(L.col-D/2), ty=Math.round(y); let w;
      if(!lad.snap){ const f=lad.fit(mir,N,sa.safe,false), s=D/N; w=f.w; x.fillStyle=C.tile; x.fill(tile.path(tx,ty,D)); mir.draw(x,f.g,tx+f.cx*s,ty+f.cy*s,f.R*s,f.w*s,f.wf*s,C);
        if(C.tile===V.paper){ x.lineWidth=Math.max(1,u); x.strokeStyle=V.green; x.stroke(tile.path(tx,ty,D)); } }
      else { const r=px(N), m=Math.round(D)/N; w=r.f.w; x.save(); x.imageSmoothingEnabled=m<2; x.imageSmoothingQuality='high'; x.drawImage(r.cv,tx,ty,Math.round(D),Math.round(D)); x.restore(); }
      y+=D+L.step[0]; nt.text(x,String(N),L.col,y,V.ink,'center',nt.cap,null,inter(600,nt.cap)); y+=L.step[1]; x.globalAlpha=0.66; nt.text(x,fmt(w)+' px line',L.col,y,V.ink,'center',nt.cap,null,inter(400,nt.cap)); x.globalAlpha=1; y+=L.step[2]; });
    if(lad.snap){ const N=lad.sizes[lad.sizes.length-1], r=px(N), ly=Math.max(L.loupe.y,y-L.step[2]+nt.cap*2.2), lp={ x:L.loupe.x, y:ly, b:Math.max(N*2,Math.min(L.loupe.b,985*u-ly)) }, m=Math.max(2,Math.floor(lp.b/N)), D=N*m, tx=Math.round(lp.x+(lp.b-D)/2), ty=Math.round(lp.y+(lp.b-D)/2);
      x.save(); x.imageSmoothingEnabled=false; x.drawImage(r.cv,tx,ty,D,D); x.restore();
      if(m>=3){ x.save(); x.globalAlpha=0.14; x.strokeStyle=C.dark?V.paper:V.ink; x.lineWidth=1; x.beginPath(); for(let i=1;i<N;i++){ x.moveTo(tx+i*m+0.5,ty); x.lineTo(tx+i*m+0.5,ty+D); x.moveTo(tx,ty+i*m+0.5); x.lineTo(tx+D,ty+i*m+0.5); } x.stroke(); x.restore(); }
      x.strokeStyle=V.ink; x.globalAlpha=0.35; x.lineWidth=1; x.strokeRect(tx-0.5,ty-0.5,D+1,D+1); x.globalAlpha=1;
      nt.text(x,N+' px at ×'+m,L.col,lp.y-9*u,V.ink,'center',nt.cap,null,inter(600,nt.cap)); } },
  _cv(n){ const S=window.STUDY; S._cvs=S._cvs||{}; return S._cvs[n]||(S._cvs[n]=document.createElement('canvas')); },
  onPoints(P){ window.STUDY._pts=P; },
  relayPoints(O){ const S=window.STUDY, A=window.ART, T=S.techniques, pts=S._pts; if(!pts)return; const P=A.params(S.spec,O), u=1, L=S.layout(u), tl=P['icon-tile'], sa=P['safe-area'].safe_pct/100, mode=P['safe-area'].construction;
    const at=(d,X,Y)=>{ const q=pts.find(t=>t.d===d); if(q){ q.u=Math.min(0.98,Math.max(0.02,X/1000)); q.v=Math.min(0.98,Math.max(0.02,Y/1000)); } };
    const cx=L.x0+L.T/2, cy=L.y0+L.T/2, r=tl.corner_pct/100*L.T*(1+0.3*tl.smoothing);
    at('CRNR',L.x0+r*0.29,L.y0+r*0.29); at('TILE',L.x0+L.T*0.88,L.y0+L.T*0.88); at('SAFE',cx-L.T*sa/2*0.7071,cy-L.T*sa/2*0.7071);
    at('GRID',L.x0+L.T*(13.5/16),L.y0+L.T*(1.5/16)); at('CROS',L.x0+L.T+14,cy);
    const mir=T['mir-lines'](P['mir-lines'],u,A), lad=T['size-ladder'](P['size-ladder'],u,A), f=lad.fit(mir,1024,sa,false), s=L.T/1024, b=f.g.box;
    at('LINE',L.x0+f.cx*s-f.R*s*0.62,L.y0+f.cy*s+f.R*s*0.78); at('MIR',L.x0+(f.cx+f.R*b[0])*s,L.y0+f.cy*s+f.R*s*0.25);
    const snap=P['size-ladder'].snapping===2; let y=L.ly0; const ys={}; for(const N of P['size-ladder'].sizes){ const D=N*L.k; ys[N]=y+D/2; y+=D+L.step[0]+L.step[1]+L.step[2]; }
    at('L180',L.col+180*L.k/2*0.6,ys[180]); if(snap)at('L40',L.loupe.x+L.loupe.b/2,L.loupe.y+L.loupe.b/2); else at('L40',L.col,ys[40]); at('DIM',L.x0+L.T*0.25,L.hdim);
    if(mode<2){ at('DIM',L.x0+L.T*0.25,L.y0+L.T*0.97); at('CROS',cx,cy); } }
};
