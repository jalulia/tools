window.STUDY={
  id:'ts-23-mir-turned', code:'TS-23', fig:'1.23',
  title:'Mir, turned',
  kicker:'Technique · TS-23',
  lede:'Mir as a construction: a sphere, a dome and two cans, turned and lit.',
  body:[
    'The head is a sphere of radius R = 300 u. The dome is the cap above a band at 12° latitude; the eyes and mouth are decals wrapped onto the sphere; each can is a 0.46 R cylinder with a beveled face, splayed 26.5° toward the viewer; each antenna is a 0.12 R tube. One rotation projects every part, so the line keeps one weight at every turn.',
    'Fills are computed per pixel from the surface normal under one light from the upper left. Flat reads only the part. Grain and Mono print the shade as single-pixel dots, Engraved cuts it into lines along parallel planes through each part, and Pencil lays graphite strokes over it and leaves the construction circles in.'
  ],
  motionHint:'Play lets Mir glance around: the head turns up to 30° each way and tilts, and the eyes lead the head by a beat.',
  source:'Reference 23 · Mir, front view in flat color, Mindgut brand world, 1233 × 945',
  spot:[10,69,40], ref:{w:1233,h:945},
  variantLabel:'Inks',
  variants:[
    { id:'ref', label:'Mindgut', sw:['#0A4528','#D0EC60','#FFFFFF','#126B3D','#151B17'], spot:[10,69,40], white:'#FFFFFF', paper:'#FBFBF7', ink:'#151B17', deep:'#0A4528', green:'#126B3D', lime:'#D0EC60', graphite:'#3B3F3C' },
    { id:'io', label:'Ø', sw:['#101014','#F4551E','#2F5AE6','#FFFFFF'], spot:[244,85,30], white:'#FFFFFF', paper:'#FFFFFF', ink:'#101014', deep:'#101014', green:'#2F5AE6', lime:'#F4551E', graphite:'#3A3A40' }
  ],
  points:[
    {u:0.30,v:0.86,d:'OUTL',label:'Head outline · one 30 u line around the sphere',t:'brush-line',dir:[-1,1]},
    {u:0.50,v:0.33,d:'BAND',label:'Band · latitude 12°, arched by the 8° tilt',t:'head-sphere',dir:[1,-1]},
    {u:0.46,v:0.15,d:'FOLD',label:'Folds · 3 scalloped rows on the dome',t:'brain-folds',dir:[-1,-1]},
    {u:0.38,v:0.58,d:'EYE',label:'Eye · decal 0.25 × 0.28 R at longitude 20°',t:'face-decals',dir:[-1,0]},
    {u:0.66,v:0.47,d:'GLNT',label:'Glint · moves with the look, held inside the eye',t:'face-decals',dir:[1,-1]},
    {u:0.50,v:0.80,d:'MOUTH',label:'Mouth · D-shaped decal at latitude −35°',t:'face-decals',dir:[1,1]},
    {u:0.88,v:0.62,d:'CAN',label:'Can face · 0.82 of the can radius, splayed 26.5°',t:'headphone-cans',dir:[1,0]},
    {u:0.88,v:0.10,d:'ANT',label:'Antenna · 0.12 R tube, 170 u above the can',t:'headphone-cans',dir:[1,-1]},
    {u:0.62,v:0.80,d:'SHAD',label:'Shade · from the normal, light from the upper left',t:'finish',dir:[1,1]},
    {u:0.05,v:0.95,d:'GND',label:'Ground · light; the line is deep on it',t:'ground-inks',dir:[-1,1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1233,945], grammar:'one character as a construction: sphere head with a band, dome of brain folds, two splayed cylinder cans with antenna tubes, decal eyes and mouth; one heavy line; flat inks' },
    units:'design units, 1000 = plate width; the plate is 1000 × 766',
    palette:{ white:'#FFFFFF', paper:'#FBFBF7', ink:'#151B17', deep:'#0A4528', green:'#126B3D', lime:'#D0EC60' },
    techniques:[
      { id:'ground-inks', short:'GND', name:'Ground and inks', layer:0, pass:0, atoms:['ground','palette','brand-rule'],
        params:{ ground:{ value:1, options:[{v:1,label:'Light'},{v:2,label:'Accent'},{v:3,label:'Deep'}], label:'Ground', note:'The sheet, by role. The line follows it: deep on light, ink on accent, paper on deep.' } },
        limits:'The accent is never a line color. On the deep ground the face takes the second green so the head still reads as a volume.',
        implementation:'One switch picks five roles from the palette: sheet, line, face, accent and the one-ink color for Mono, Engraved and Pencil.' },
      { id:'head-sphere', short:'HEAD', name:'Head sphere, turned', layer:1, pass:1, atoms:['sphere','rotation','orthographic','latitude-band'],
        params:{ turn_deg:{ value:0, range:[-35,35], step:1, unit:'°', label:'Turn', note:'Yaw of the whole head. From about ±20° the far can tucks behind the head; past ±26° its face turns away.' }, tilt_deg:{ value:8, range:[-10,20], step:1, unit:'°', label:'Tilt', note:'Chin up (+) or down (−). The band arches up as the chin lifts.' }, radius_u:300, center_u:[500,420], band_lat_deg:12, light:[-0.45,0.62,0.64] },
        limits:'Turn is held to ±35°: past that the near can covers the near eye. Tilt below −10° hides the band behind the brow line.',
        implementation:'Every part is built in head space and taken to the view by one rotation, tilt about x then turn about y, and an orthographic projection. The band is the latitude circle at 12°; only its front half is drawn.' },
      { id:'headphone-cans', short:'CANS', name:'Cans and antennae', layer:1, pass:1, atoms:['cylinder','bevel','convex-hull','tube'],
        params:{ can_u:{ value:138, range:[100,165], unit:'u', label:'Can size', note:'Radius of each can. Depth is 0.72 of it; the outer edge is rounded at 0.2 of it, the inner edge at 0.12.' }, antenna_u:{ value:170, range:[70,200], unit:'u', label:'Antenna length', note:'How far each antenna stands above the top of its can.' }, splay_deg:26.5, mount:1.0, tuck:0.12, swap:0.1, clear:1.3, drop:-0.21, depth:0.72, round_out:0.2, round_in:0.12, rim_n:144, rod_r:0.12, ant_at:0.5 },
        limits:'Above 165 u the cans meet under the chin at full turn. Below 70 u the antennae hide behind the dome.',
        implementation:'A can is a puck: a cylinder with rounded edges, its inner face tangent to the sphere. Its outline is the convex hull of 14 rims sampled at 144 points, so ellipse arcs join by true tangent lines. A front can always stands out past the head’s silhouette by at least 1.3 line widths (it slides along the ear axis when the turn would bring the two outlines together), so the head line meets it in clean T-junctions. A can whose axis has turned to within 0.1 of edge-on is drawn behind the head (any overlap at that moment is thinner than the line) and slides up to 0.12 R into it, so it tucks behind the head instead of standing beside it as a slab.' },
      { id:'brain-folds', short:'FOLD', name:'Dome and brain folds', layer:2, pass:2, atoms:['scallop','latitude-rows','sphere-curve'],
        params:{ rows:{ value:3, range:[2,4], step:1, label:'Fold rows', note:'Rows of folds between the band and 80° latitude; each row is cut into long wavy strokes with a hook at one end.' }, seed:23, top_lat_deg:80, margin:0.06, amp:0.075, bump:0.28, arc:0.8, gap:0.18, drift:0.4, hook:0.055, clear:1, min_len:2.5 },
        limits:'Four rows is the most that stay apart at the heaviest line; one row reads as a hat brim, not a brain. Every fold keeps one stroke width clear of the outline, the band, the front cans and antennas, and every other fold; pieces shorter than 2.5 widths after that cut are dropped. With a heavy line the fold stroke thins, to half at most, until at least as many strokes as rows fit.',
        implementation:'Each fold is a curve on the sphere: latitude rises in √sin humps 0.075 R high every 0.28 R of arc and drifts by up to 0.4 of a row; one end curls down and back through 112° on a 0.055 R radius. Only the part facing the viewer and clear of the outline is drawn.' },
      { id:'face-decals', short:'FACE', name:'Eyes, look and mouth', layer:2, pass:2, atoms:['decal','gaze','glint'],
        params:{ look_across_deg:{ value:20, range:[-40,40], step:1, unit:'°', label:'Look across', note:'Gaze left (−) or right (+) of where the head points. Moves the glint and shifts the eyes on the sphere.' }, look_up_deg:{ value:30, range:[-20,45], step:1, unit:'°', label:'Look up', note:'Gaze up (+) or down (−). The glint bites the top of the eye when Mir looks up.' }, eye_lon_deg:20, eye_lat_deg:-13.6, eye_r:[0.25,0.28], glint_r:0.12, glint_k:1.4, glint_max:0.85, shift:0.08, limb:0.33, clear:1, mouth_lat_deg:-35, mouth:[0.11,0.13] },
        limits:'The glint offset is held to 0.85 of the eye radius and drawn only inside the eye. Both eyes shift together, as little as possible from where the look puts them, so that each stays at least one line width clear of the head’s outline and of a front can; if no shift fits, the eyes shrink by up to 28%.',
        implementation:'Eyes and mouth are shapes in the tangent plane at a point of the sphere, pushed back onto it. The glint offset is 1.4 × (sin across · cos up, sin up) of the eye radius, eased to at most 0.85.' },
      { id:'brush-line', short:'LINE', name:'Brush line', layer:3, pass:3, atoms:['stroke','round-cap','single-weight'],
        params:{ weight_u:{ value:30, range:[14,44], unit:'u', label:'Line weight', note:'One weight for every outline, rim and band. Folds take 0.6 of it (never more than a third of the row spacing); the can gloss 0.45, always in the light ink.' }, fold_share:0.6, gloss_share:0.45 },
        limits:'Above 44 u the eye glint closes and the folds merge. Below 14 u the line no longer holds the flat fills.',
        implementation:'Round-capped, round-joined strokes of one width over the fills; eyes and mouth are filled in the line color.' },
      { id:'finish', short:'FIN', name:'Finish', layer:4, pass:4, atoms:['stochastic-screen','engraving','graphite','per-pixel'],
        params:{ finish:{ value:1, options:[{v:1,label:'Flat'},{v:2,label:'Grain'},{v:3,label:'Mono'},{v:4,label:'Engraved'},{v:5,label:'Pencil'}], label:'Finish', note:'Flat color · Color + grain · Mono stamp · Engraved · Pencil. Each renders the same construction.' }, grain:{ value:90, range:[50,100], unit:'%', label:'Grain amount', note:'Grain and Mono only: share of the shade printed as single-pixel dots; the rest is smooth tone.', when:{ path:'finish', is:[2,3] } }, hatch_angle_deg:{ value:35, range:[-75,75], step:1, unit:'°', label:'Hatch angle', note:'Engraved only: tilt of the cutting planes on the head. The cans keep rings around their axis.', when:{ path:'finish', is:[4] } }, hatch_u:{ value:6, range:[5,9], unit:'u', label:'Hatch spacing', note:'Engraved only: distance between cutting planes.', when:{ path:'finish', is:[4] } }, pressure:{ value:60, range:[25,100], unit:'%', label:'Pencil pressure', note:'Pencil only: graphite darkness and stroke width.', when:{ path:'finish', is:[5] } } },
        limits:'Hatch lines are box-filtered per pixel and fade to their mean tone below 3 px; spacing runs 5–9 u so a 1× screen does not beat, and the cross set ramps in over the darkest half of the tone. Grain amount starts at 0.5 so Mono stays a one-ink stamp. Each finish-only control is quiet outside its finish.',
        implementation:'Per pixel: tone = 1 − n·L, eased in past mid-shade. Grain keeps the part colors and screens only the shade, in the darkest ink; Mono screens one ink; Engraved inks a line where the plane phase falls within the tone; Pencil draws broken diagonal strokes thinned by paper tooth. On the deep ground the one ink is paper and prints the light, from 70% on the lit side down to none in the shade, so the paper line still reads.' }
    ],
    pass_order:['ground · the sheet in the ground ink','form · sphere, cans and antennae rotated by Turn and Tilt; back can, head, front can','fill · per pixel from the surface normal: part, shade, finish','line · outline, band, folds and rims in one weight; eyes and mouth filled','finish · Pencil adds the construction circles last'],
    notes:['Measured on ref.png (1233 × 945): head radius 443 px at (617, 470); line 44 px = 0.10 R; band centerline 150 px above center, 25 px lower at its ends → latitude 12° with an 8° tilt; eyes 213 × 240 px, 149 px off-axis, 47 px below center → longitude 20°, latitude −13.6°; can face ellipse ratio 0.42 → splay 26.5°; antenna tube 150 px wide.','Inks: outline (8, 68, 24) ≈ Deep #0A4528; lime (216, 232, 22) → Lime #D0EC60; the cream face is replaced by white.','Folds are seeded (23). Every value is drawn per render; nothing is a bitmap.']
  },
  techniques:{
    'ground-inks': (P,u,A,V)=>{ const g=P.ground===2?'lime':(P.ground===3?'forest':'white');
      const R={ white:{ stock:V.white, line:V.deep, face:V.white, accent:V.lime, mono:V.ink, engr:V.deep, pencil:V.graphite },
        lime:{ stock:V.lime, line:V.ink, face:V.white, accent:V.lime, mono:V.ink, engr:V.ink, pencil:V.graphite },
        forest:{ stock:V.deep, line:V.paper, face:V.green, accent:V.lime, mono:V.paper, engr:V.paper, pencil:V.paper } };
      return { ground:g, roles:R[g] }; },
    'head-sphere': (P,u,A)=>{ const D=Math.PI/180, ya=P.turn_deg*D, ti=P.tilt_deg*D, cy=Math.cos(ya), sy=Math.sin(ya), ct=Math.cos(ti), st=Math.sin(ti);
      const toW=p=>{ const y=p[1]*ct+p[2]*st, z=-p[1]*st+p[2]*ct; return [p[0]*cy+z*sy, y, -p[0]*sy+z*cy]; };
      const fromW=p=>{ const x=p[0]*cy-p[2]*sy, z=p[0]*sy+p[2]*cy; return [x, p[1]*ct-z*st, p[1]*st+z*ct]; };
      const R=P.radius_u*u, X0=P.center_u[0]*u, Y0=P.center_u[1]*u, L=P.light, l=Math.hypot(L[0],L[1],L[2]), b=P.band_lat_deg*D;
      return { R, Ru:P.radius_u, X0, Y0, toW, fromW, sinB:Math.sin(b), light:[L[0]/l,L[1]/l,L[2]/l], rot:[cy,sy,ct,st],
        at:(lam,phi)=>[Math.cos(phi)*Math.sin(lam), Math.sin(phi), Math.cos(phi)*Math.cos(lam)],
        proj:p=>[X0+p[0]*R, Y0-p[1]*R],
        lat:(phi,n)=>{ const o=[]; for(let i=0;i<=n;i++){ const t=-Math.PI+2*Math.PI*i/n; o.push(toW([Math.cos(phi)*Math.sin(t), Math.sin(phi), Math.cos(phi)*Math.cos(t)])); } return o; },
        band:n=>{ const o=[]; for(let i=0;i<=n;i++){ const t=-Math.PI+2*Math.PI*i/n; o.push(toW([Math.cos(b)*Math.sin(t), Math.sin(b), Math.cos(b)*Math.cos(t)])); } return o; } }; },
    'headphone-cans': (P,u,A)=>({ clear:P.clear, build:(hd,off)=>{ const D=Math.PI/180, sg=P.splay_deg*D, r=P.can_u/hd.Ru, L=P.antenna_u/hd.Ru, h2=P.depth*r, ro=P.round_out*r, ri=P.round_in*r, W=hd.toW;
        const add=(p,q,s)=>[p[0]+q[0]*s, p[1]+q[1]*s, p[2]+q[2]*s];
        return [-1,1].map(s=>{ const a=[s*Math.cos(sg),0,Math.sin(sg)], e1=[-a[2],0,a[0]], e2=[0,1,0], aw=W(a);
          /* a can turned away slides into the head, so its inner rim hides behind the sphere instead of leaving a sliver */
          const m=P.mount-P.tuck*Math.min(1,Math.max(0,(P.swap-aw[2])/0.22));
          const Ci=add([s*((off&&off[s])||0),P.drop,0],a,m), Co=add(Ci,a,h2), M=add(Ci,a,h2*P.ant_at), B=add(M,e2,r*0.4), T=add(M,e2,r+L), rims=[];
          for(let k=0;k<=6;k++){ const t=k/6*Math.PI/2; rims.push([ri-ri*Math.sin(t), r-ri+ri*Math.cos(t)]); }
          for(let k=0;k<=6;k++){ const t=k/6*Math.PI/2; rims.push([h2-ro+ro*Math.sin(t), r-ro+ro*Math.cos(t)]); }
          /* gloss: an arc on the outer rounding, centered on the direction up-and-forward */
          const gx=0.55*e1[2], th=Math.atan2(1,gx), G0=add(Ci,a,h2-ro*0.75), gl=[];
          for(let i=0;i<=16;i++){ const t=th-0.62+1.24*i/16, n=[Math.cos(t)*e1[0], Math.sin(t), Math.cos(t)*e1[2]]; gl.push({ p:W(add(G0,n,r-ro*0.04)), n:W(n) }); }
          return { side:s, a:aw, e1:W(e1), e2:W(e2), Ci:W(Ci), Co:W(Co), r, rf:r-ro, rin:r-ri, s0:ri, s1:h2-ro, h2, rims:rims.map(q=>({ c:W(add(Ci,a,q[0])), r:q[1] })), n:P.rim_n, B:W(B), T:W(T), ra:P.rod_r, gloss:gl, az:aw[2], front:aw[2]>=P.swap, z:W(M)[2] }; }); } }),
    'brain-folds': (P,u,A)=>({ build:hd=>{ const b0=Math.asin(hd.sinB)+P.margin, top=P.top_lat_deg*Math.PI/180, n=P.rows, sp=(top-b0)/n, amp=Math.min(P.amp,0.25*sp), hr=Math.min(P.hook,0.35*sp), out=[];
        for(let i=0;i<n;i++){ const r=A.rng(P.seed+i*7919), phi=b0+sp*(i+0.5), cp=Math.cos(phi); let lam=-Math.PI+r()*0.9;
          while(lam<Math.PI-0.1){ const dl=Math.min(P.arc*(0.7+0.6*r())/cp, Math.PI-lam), al=dl*cp, k=Math.max(1,Math.round(al/P.bump)), m=Math.max(18,k*16), sl=(r()-0.5)*P.drift*sp, ph0=r()*6.28, hk=r()<0.5, pts=[];
            for(let j=0;j<=m;j++){ const t=j/m, f=k*t-Math.floor(k*t), hump=j===m?0:Math.sqrt(Math.sin(Math.PI*f)); pts.push([lam+dl*t, phi+sl*Math.sin(Math.PI*(t-0.5)+0.6*Math.sin(ph0))+amp*hump]); }
            /* one end curls down and back */
            const e=hk?pts[pts.length-1]:pts[0], dir=hk?1:-1, curl=[]; for(let j=1;j<=9;j++){ const th=j/9*1.95; curl.push([e[0]+dir*hr*Math.sin(th)/cp, e[1]-hr*(1-Math.cos(th))]); }
            out.push((hk?pts.concat(curl):curl.reverse().concat(pts)).map(q=>hd.at(q[0],q[1]))); lam+=dl+P.gap*(0.7+0.6*r())/cp; } }
        return out; } }),
    'face-decals': (P,u,A)=>({ build:(hd,opt)=>{ const D=Math.PI/180, ax=P.look_across_deg*D, up=P.look_up_deg*D;
        const nrm=p=>{ const l=Math.hypot(p[0],p[1],p[2]); return [p[0]/l,p[1]/l,p[2]/l]; };
        const decal=c=>{ const eu=nrm([c[2],0,-c[0]]), ev=[c[1]*eu[2]-c[2]*eu[1], c[2]*eu[0]-c[0]*eu[2], c[0]*eu[1]-c[1]*eu[0]]; return (s,t)=>nrm([c[0]+s*eu[0]+t*ev[0], c[1]+s*eu[1]+t*ev[1], c[2]+s*eu[2]+t*ev[2]]); };
        let qx=P.glint_k*Math.sin(ax)*Math.cos(up), qy=P.glint_k*Math.sin(up); const ql=Math.hypot(qx,qy); if(ql>1e-6){ const k=1/Math.pow(1+Math.pow(ql/P.glint_max,6),1/6); qx*=k; qy*=k; }
        const ks=(opt&&opt.k)||1, ex=P.eye_r[0]*ks, ey=P.eye_r[1]*ks, hr=P.glint_r*ks, N=72;
        const eye=(lam,phi)=>{ const c=hd.at(lam,phi), f=decal(c), loop=[], hl=[]; let mz=1;
          for(let i=0;i<N;i++){ const t=2*Math.PI*i/N, p=f(ex*Math.cos(t), ey*Math.sin(t)); loop.push(p); mz=Math.min(mz,hd.toW(p)[2]); hl.push(f(qx*ex+hr*Math.cos(t), qy*ey+hr*Math.sin(t))); }
          return { c, loop, hl, g:f(qx*ex, qy*ey), mz }; };
        /* both eyes shift together (the look, then whatever keeps the far eye off the limb), so the gap between them never closes */
        const phi=P.eye_lat_deg*D+P.shift*0.6*up, el=P.eye_lon_deg*D, pair=sh=>[eye(-el+sh,phi),eye(el+sh,phi)], ok=e=>Math.min(e[0].mz,e[1].mz)>=P.limb;
        let sh=P.shift*ax, eyes=pair(opt&&opt.sh!==undefined?opt.sh:sh); if(!(opt&&opt.sh!==undefined)&&!ok(eyes)){ const c=-Math.atan2(hd.rot[1],hd.rot[0]); let lo=sh, hi=c; if(ok(pair(hi))){ for(let k=0;k<14;k++){ const mid=(lo+hi)/2; if(ok(pair(mid)))hi=mid; else lo=mid; } } eyes=pair(hi); }
        const cm=hd.at(0,P.mouth_lat_deg*D), fm=decal(cm), mouth=[];
        for(let i=0;i<=28;i++){ const t=Math.PI*i/28; mouth.push(fm(P.mouth[0]*Math.cos(t), -P.mouth[1]*Math.sin(t))); }
        return { eyes, mouth, mc:cm, sh }; } }),
    'brush-line': (P,u,A)=>({ w:P.weight_u*u, fold:P.fold_share, gloss:P.gloss_share,
      path:(x,pts,closed)=>{ x.beginPath(); x.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++)x.lineTo(pts[i][0],pts[i][1]); if(closed)x.closePath(); },
      stroke:(x,pts,w,col,closed)=>{ if(pts.length<2)return; x.beginPath(); x.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++)x.lineTo(pts[i][0],pts[i][1]); if(closed)x.closePath(); x.lineWidth=w; x.strokeStyle=col; x.lineCap='round'; x.lineJoin='round'; x.stroke(); } }),
    'finish': (P,u,A)=>{ const D=Math.PI/180, mode=P.finish, gr=P.grain/100, pr=P.pressure/100, ha=P.hatch_angle_deg*D;
      const hash=(x,y,k)=>{ let n=(x*374761393+y*668265263+k*1274126177)|0; n=Math.imul(n^(n>>>13),1274126177); n^=n>>>16; return (n>>>0)/4294967296; };
      const cl=v=>v<0?0:v>1?1:v, ss=(a,b,x)=>{ const t=cl((x-a)/(b-a)); return t*t*(3-2*t); };
      /* materials 1 face · 2 dome · 3 can side · 4 can face · 5 cushion · 6 antenna.
         Grain: [shade-dot gain, lo, hi] over the part color; the others: [base, gain, lo, hi] for the ink coverage over the shade ramp. */
      const GR=[0,[0.26,0.55,1],[0.34,0.45,1],[0.42,0.35,1],[0.22,0.55,1],[0.4,0.2,1],[0.3,0.5,1]];
      const TAB={ 3:[0,[0,0.34,0.6,1],[0.04,0.45,0.4,1],[0.3,0.45,0.1,0.8],[0,0.4,0.6,1],[0.5,0.3,0,0.6],[0,0.4,0.5,1]],
        4:[0,[0,0.78,0.45,1],[0.18,0.6,0.2,1],[0.2,0.6,0.1,0.9],[0.03,0.6,0.45,1],[0.4,0.4,0,0.8],[0.05,0.7,0.35,1]],
        5:[0,[0,0.85,0.42,1],[0.1,0.7,0.3,1],[0.18,0.7,0.1,0.9],[0.02,0.6,0.5,1],[0.3,0.5,0,0.8],[0,0.6,0.45,1]] };
      /* box-filtered periodic line: the share of a pixel footprint (fw periods wide) that lies on a line of width f, faded to f once a period is under ~3 px */
      const hatch=(ph,fw,f)=>{ if(f<=0.002)return 0; const d=Math.abs(ph-Math.floor(ph)-0.5), hw=f*0.5, a=Math.max(fw,1e-4); let c=Math.max(0,Math.min(hw,d+a/2)-Math.max(-hw,d-a/2))/a; if(d+a/2>1-hw)c+=Math.max(0,Math.min(1+hw,d+a/2)-Math.max(1-hw,d-a/2))/a; c=cl(c); const k=cl((fw-0.33)/0.25); return c+(f-c)*k; };
      const sp=P.hatch_u*u, pp=Math.max(2.2,3.1*u), pl=24*u, sb=Math.sin(55*D), cb=Math.cos(55*D);
      return { mode, sp, dir:[-Math.sin(ha),Math.cos(ha),0], dir2:[Math.cos(ha),Math.sin(ha),0], hash,
        /* one pixel: material, tone (0 lit … 1 dark), pixel coords, two hatch phases and their change per pixel, inks → rgb in o.
           K.inv: the one ink is lighter than the sheet, so it prints the light (white-line) */
        px:(m,tone,ix,iy,h1,f1,h2,f2,K,o)=>{
          const acc=m===2||m===3||m===5;
          if(mode===1){ const c=acc?K.accent:K.face; o[0]=c[0]; o[1]=c[1]; o[2]=c[2]; return; }
          if(mode===2){ const g=GR[m], B=acc?K.accent:K.face, Dk=K.shade, cD=g[0]*ss(g[1],g[2],tone), on=hash(ix,iy,13)<cD, t=1+0.04*(hash(ix,iy,29)-0.5);
            for(let k=0;k<3;k++){ const s=B[k]+(Dk[k]-B[k])*cD, b=on?Dk[k]:B[k]; o[k]=(s+(b-s)*gr)*t; } return; }
          const tb=TAB[mode][m]; let f=cl(tb[0]+tb[1]*ss(tb[2],tb[3],tone)); if(K.inv)f=0.7*(1-ss(0.05,0.95,tone))*(acc?0.75:1);
          if(mode===3){ const on=hash(ix,iy,7)<f, t=1+0.035*(hash(ix,iy,29)-0.5); for(let k=0;k<3;k++){ const s=K.stock[k]+(K.ink[k]-K.stock[k])*f, b=on?K.ink[k]:K.stock[k]; o[k]=(s+(b-s)*gr)*t; } return; }
          if(mode===4){ const a=hatch(h1,f1,Math.min(0.6,f*1.25)), f2b=0.4*ss(0.5,1.1,f), b=f2b>0.002?hatch(h2,f2,f2b):0, c=1-(1-a)*(1-b);
            for(let k=0;k<3;k++)o[k]=K.stock[k]+(K.ink[k]-K.stock[k])*c; return; }
          let g=0;
          if(f>0.01){ const pq=(ix*sb+iy*cb)/pp, row=Math.floor(pq), fr=pq-row, al=ix*cb-iy*sb;
            const vt=(al+hash(row,0,3)*900)/pl, vi=Math.floor(vt), vf=vt-vi, vs=vf*vf*(3-2*vf), vn=hash(row,vi,5)+(hash(row,vi+1,5)-hash(row,vi,5))*vs, keep=vn+0.16*(hash(ix,iy,19)-0.5)<f*1.5, w=0.16+0.22*f, prof=keep?cl(1-Math.abs(fr-0.5)/w):0; g=cl(prof*0.9+f*0.2)*(0.42+0.58*hash(ix,iy,11))*(0.5+0.5*pr); }
          for(let k=0;k<3;k++)o[k]=K.stock[k]+(K.ink[k]-K.stock[k])*g; } }; }
  },
  /* ---------- geometry: every part in device px for one set of params ---------- */
  scene(P,u){ const A=window.ART, S=window.STUDY, T=S.techniques; const hd=T['head-sphere'](P['head-sphere'],u,A), pj=hd.proj;
    const cut=(p,q,mz)=>{ const t=(mz-q[2])/(p[2]-q[2]); return pj([q[0]+(p[0]-q[0])*t, q[1]+(p[1]-q[1])*t]); };
    const vis=(pts,mz)=>{ const out=[]; let cur=null; for(let i=0;i<pts.length;i++){ const p=pts[i], v=p[2]>mz; if(v){ if(!cur){ cur=[]; if(i>0)cur.push(cut(p,pts[i-1],mz)); } cur.push(pj(p)); } else if(cur){ cur.push(cut(p,pts[i-1],mz)); out.push(cur); cur=null; } } if(cur)out.push(cur); return out; };
    const band=vis(hd.band(240),0);
    const folds=[]; for(const f of T['brain-folds'](P['brain-folds'],u,A).build(hd))for(const r of vis(f.map(hd.toW),0))if(r.length>1)folds.push(r);
    const fd=T['face-decals'](P['face-decals'],u,A); let fz=fd.build(hd);
    const rim=(c,e1,e2,r,n)=>{ const o=[]; for(let i=0;i<n;i++){ const t=2*Math.PI*i/n, a=Math.cos(t)*r, b=Math.sin(t)*r; o.push([c[0]+e1[0]*a+e2[0]*b, c[1]+e1[1]*a+e2[1]*b, c[2]+e1[2]*a+e2[2]*b]); } return o; };
    const hull=pts=>{ const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]), cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]), lo=[], up=[];
      for(const q of p){ while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop(); lo.push(q); }
      for(let i=p.length-1;i>=0;i--){ const q=p[i]; while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop(); up.push(q); } lo.pop(); up.pop(); return lo.concat(up); };
    const ct=T['headphone-cans'](P['headphone-cans'],u,A), need=ct.clear*P['brush-line'].weight_u/P['head-sphere'].radius_u, off={}, ca=Math.max(0.3,Math.abs(hd.rot[0]));
    const rimsOut=c=>{ let mx=-1e9; for(const q of c.rims)for(const p of rim(q.c,c.e1,c.e2,q.r,48))mx=Math.max(mx,Math.hypot(p[0],p[1])-1); return mx; };
    for(let it=0;it<2;it++){ const cs=ct.build(hd,off); for(const c of cs){ if(!c.front||c.az<0.3)continue; const pr=rimsOut(c); if(pr<need)off[c.side]=(off[c.side]||0)+(need-pr)/ca; } }
    const cans=ct.build(hd,off).map(c=>{ const out=c.az>=0, cap=out?rim(c.Co,c.e1,c.e2,c.rf,c.n):rim(c.Ci,c.e1,c.e2,c.rin,c.n);
      const all=[]; for(const q of c.rims)for(const p of rim(q.c,c.e1,c.e2,q.r,c.n))all.push(pj(p));
      const gl=[]; let cur=null; for(const g of c.gloss){ if(g.n[2]>0.08){ (cur||(cur=[])).push(pj(g.p)); } else if(cur){ gl.push(cur); cur=null; } } if(cur)gl.push(cur);
      return Object.assign(c,{ out, hull:hull(all), cap:cap.map(pj), capC:pj(out?c.Co:c.Ci), Bs:pj(c.B), Ts:pj(c.T), glossS:gl.filter(g=>g.length>2) }); });
    /* eyes: the group shift nearest the look that keeps each eye one line clear of the head outline and of every front can */
    const wR=P['brush-line'].weight_u/P['head-sphere'].radius_u, cl=wR*(0.5+P['face-decals'].clear), rLim=1-cl, uH=cans.filter(c=>c.front).map(c=>c.hull.filter((p,i)=>i%6===0).map(p=>[(p[0]-hd.X0)/hd.R,(hd.Y0-p[1])/hd.R]));
    const segD=(p,a,b)=>{ const vx=b[0]-a[0], vy=b[1]-a[1], t=Math.max(0,Math.min(1,((p[0]-a[0])*vx+(p[1]-a[1])*vy)/(vx*vx+vy*vy||1))); return Math.hypot(p[0]-a[0]-t*vx,p[1]-a[1]-t*vy); };
    const margin=ev=>{ let m=1e9; for(const e of ev.eyes)for(let i=0;i<e.loop.length;i+=2){ const w=hd.toW(e.loop[i]); if(w[2]<=0)return -1; m=Math.min(m,rLim-Math.hypot(w[0],w[1])); for(const h of uH){ if(S.inside(h,w[0],w[1]))return -1; let d=1e9; for(let j=0;j<h.length;j++)d=Math.min(d,segD(w,h[j],h[(j+1)%h.length])); m=Math.min(m,d-cl); } } return m; };
    if(margin(fz)<0){ const s0=fz.sh, ds=[]; for(let i=1;i<=40;i++){ ds.push(i*0.025,-i*0.025); } let best=null, bm=-1e9;
      outer: for(const k of [1,0.96,0.92,0.88,0.84,0.8,0.76,0.72]){ for(const d of [0,...ds]){ const ev=fd.build(hd,{ sh:s0+d, k }), m=margin(ev); if(m>=0){ fz=ev; best=null; break outer; } if(m>bm){ bm=m; best=ev; } } }
      if(best)fz=best; }
    const eyes=fz.eyes.map(e=>({ on:hd.toW(e.c)[2]>0.1, c:pj(hd.toW(e.c)), g:pj(hd.toW(e.g)), loop:e.loop.map(p=>pj(hd.toW(p))), hl:e.hl.map(p=>pj(hd.toW(p))) }));
    const mouth=fz.mouth.map(p=>pj(hd.toW(p))), mc=pj(hd.toW(fz.mc));
    const back=cans.filter(c=>!c.front).sort((a,b)=>a.z-b.z), front=cans.filter(c=>c.front).sort((a,b)=>a.z-b.z);
    const order=back.map(c=>({kind:'can',c})).concat([{kind:'head'}],front.map(c=>({kind:'can',c})));
    return { hd, band, folds, eyes, mouth, mc, cans, order, vis, rim }; },
  /* ---------- per-pixel helpers ---------- */
  /* fill small pockets that the mask encloses (not touching the box edge) with the ink color, two pixels past their edge */
  crumbs(x,box,mk,maxA,col){ const bw=box.w, bh=box.h, n=bw*bh, lab=new Int32Array(n), st=[]; let id=0, any=false; const pk=[];
    for(let i0=0;i0<n;i0++){ if(lab[i0]||mk[i0*4+3]>24)continue; id++; let area=0, edge=false; const px=[]; st.push(i0); lab[i0]=id;
      while(st.length){ const i=st.pop(), xx=i%bw, yy=(i/bw)|0; area++; px.push(i); if(xx===0||yy===0||xx===bw-1||yy===bh-1)edge=true;
        for(const j of [xx>0?i-1:-1, xx<bw-1?i+1:-1, yy>0?i-bw:-1, yy<bh-1?i+bw:-1])if(j>=0&&!lab[j]&&mk[j*4+3]<=24){ lab[j]=id; st.push(j); } }
      if(!edge&&area<maxA){ pk.push(px); any=true; } }
    if(!any)return; const id2=x.getImageData(box.x,box.y,bw,bh), d=id2.data; for(const px of pk)for(const i of px){ const xx=i%bw, yy=(i/bw)|0; for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){ const X2=xx+dx, Y2=yy+dy; if(X2<0||Y2<0||X2>=bw||Y2>=bh)continue; const j=(Y2*bw+X2)*4; d[j]=col[0]; d[j+1]=col[1]; d[j+2]=col[2]; d[j+3]=255; } } x.putImageData(id2,box.x,box.y); },
  /* point inside a convex polygon */
  inside(h,x,y){ let sg=0; for(let i=0;i<h.length;i++){ const a=h[i], b=h[(i+1)%h.length], c=(b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]); if(c!==0){ if(sg&&Math.sign(c)!==sg)return false; sg=Math.sign(c); } } return true; },
  _cv(n){ const S=window.STUDY; S._cvs=S._cvs||[]; if(!S._cvs[n])S._cvs[n]=document.createElement('canvas'); return S._cvs[n]; },
  _fit(c,w,h){ if(c.width<w||c.height<h){ c.width=Math.max(c.width,w); c.height=Math.max(c.height,h); } },
  box(pts,pad,W,H){ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(const p of pts){ if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0]; if(p[1]<y0)y0=p[1]; if(p[1]>y1)y1=p[1]; } x0=Math.max(0,Math.floor(x0-pad)); y0=Math.max(0,Math.floor(y0-pad)); x1=Math.min(W,Math.ceil(x1+pad)); y1=Math.min(H,Math.ceil(y1+pad)); return { x:x0, y:y0, w:Math.max(1,x1-x0), h:Math.max(1,y1-y0) }; },
  mask(box,q,fn){ const S=window.STUDY, bw=Math.max(1,Math.ceil(box.w*q)), bh=Math.max(1,Math.ceil(box.h*q)), c=S._cv(1); S._fit(c,bw,bh); const m=c.getContext('2d',{willReadFrequently:true});
    m.setTransform(1,0,0,1,0,0); m.clearRect(0,0,bw,bh); m.setTransform(q,0,0,q,-box.x*q,-box.y*q); fn(m); m.setTransform(1,0,0,1,0,0); return m.getImageData(0,0,bw,bh).data; },
  raster(x,box,q,fn){ const S=window.STUDY, bw=Math.max(1,Math.ceil(box.w*q)), bh=Math.max(1,Math.ceil(box.h*q)), c=S._cv(2); S._fit(c,bw,bh); const g=c.getContext('2d'), id=g.createImageData(bw,bh), d=id.data, o=[0,0,0];
    for(let j=0;j<bh;j++){ const Y=box.y+(j+0.5)/q; for(let i=0;i<bw;i++){ const k=(j*bw+i)*4, a=fn(box.x+(i+0.5)/q,Y,o,k); if(a<=0)continue; d[k]=o[0]; d[k+1]=o[1]; d[k+2]=o[2]; d[k+3]=a>=1?255:a*255; } }
    g.putImageData(id,0,0); x.save(); x.setTransform(1,0,0,1,0,0); x.imageSmoothingEnabled=false; x.drawImage(c,0,0,bw,bh,box.x,box.y,bw/q,bh/q); x.restore(); },
  /* ---------- the picture ---------- */
  draw(canvas,V,O,q){ const A=window.ART, S=window.STUDY, T=S.techniques, P=A.params(S.spec,O); const W=canvas.width, H=canvas.height, u=W/1000, x=canvas.getContext('2d'); x.setTransform(1,0,0,1,0,0);
    const R0=T['ground-inks'](P['ground-inks'],u,A,V).roles, ln=T['brush-line'](P['brush-line'],u,A), fin=T['finish'](P['finish'],u,A), md=fin.mode, sc=S.scene(P,u), hd=sc.hd, R=hd.R, w=ln.w;
    const one=md<=2?R0.line:(md===3?R0.mono:(md===4?R0.engr:R0.pencil));
    const lum=h=>{ const c=A.hex(h); return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; }, dk=lum(R0.accent)<lum(R0.face);
    const K={ stock:A.hex(R0.stock), face:A.hex(R0.face), accent:A.hex(R0.accent), line:A.hex(R0.line), ink:A.hex(one), inv:md>2&&lum(one)>lum(R0.stock),
      shade:A.hex(lum(R0.line)<lum(R0.stock)?R0.line:R0.stock) };
    x.fillStyle=R0.stock; x.fillRect(0,0,W,H);
    /* lines, eyes and mouth are always the one ink (paper on the deep ground, as in Flat and Grain); the glint is cut in the face, or in the ground when the ink is light */
    const ink=one, feat=one, glint=K.inv?R0.stock:(md<=2?R0.face:R0.stock);
    const L=hd.light, [cy,sy,ct,st]=hd.rot, dW=hd.toW(fin.dir), d2W=hd.toW(fin.dir2), sp=fin.sp/R;
    /* strokes go to the plate, or to a graphite layer that gets paper tooth (Pencil) */
    const pen=md===5, pc=pen?S._cv(3):null; if(pen){ if(pc.width!==W||pc.height!==H){ pc.width=W; pc.height=H; } }
    const sx=pen?pc.getContext('2d',{willReadFrequently:true}):x, pw=pen?w*(0.1+0.12*P['finish'].pressure/100):0;
    const stroke=(pts,wd,col,closed,seed)=>{ if(!pen){ ln.stroke(sx,pts,wd,col,closed); return; } const r=A.rng(seed||1); for(let k=0;k<2;k++){ const dx=(r()-0.5)*pw*1.4, dy=(r()-0.5)*pw*1.4; sx.globalAlpha=k?0.5:0.92; ln.stroke(sx,pts.map(p=>[p[0]+dx,p[1]+dy]),pw*(k?0.75:1)*(wd/w)**0.5,ink,closed); } sx.globalAlpha=1; };
    const fillP=(pts,col,erase)=>{ ln.path(sx,pts,true); if(erase&&pen){ sx.save(); sx.globalCompositeOperation='destination-out'; sx.fillStyle='#000'; sx.fill(); sx.restore(); return; } sx.globalAlpha=pen?0.9:1; sx.fillStyle=col; sx.fill(); sx.globalAlpha=1; };
    const flushPen=box=>{ if(!pen)return; const id=sx.getImageData(box.x,box.y,box.w,box.h), d=id.data; for(let j=0;j<box.h;j++)for(let i=0;i<box.w;i++){ const k=(j*box.w+i)*4; if(d[k+3])d[k+3]*=0.45+0.55*fin.hash(box.x+i,box.y+j,17); } sx.putImageData(id,box.x,box.y); x.drawImage(pc,box.x,box.y,box.w,box.h,box.x,box.y,box.w,box.h); sx.clearRect(box.x,box.y,box.w,box.h); };
    /* engraved hatch: phase along d and its change per pixel, from the surface normal n */
    const hp=(px,py,pz,n,d,o,i)=>{ const nz=Math.max(n[2],0.06); o[i]=(px*d[0]+py*d[1]+pz*d[2])/sp; const gx=(d[0]-d[2]*n[0]/nz)/fin.sp, gy=(-d[1]+d[2]*n[1]/nz)/fin.sp; o[i+1]=Math.hypot(gx,gy)/q; };
    const hh=[0,0,0,0], nn=[0,0,0];
    const head=()=>{ const box={ x:Math.max(0,Math.floor(hd.X0-R-3)), y:Math.max(0,Math.floor(hd.Y0-R-3)), w:Math.ceil(2*R+6), h:Math.ceil(2*R+6) };
      S.raster(x,box,q,(X,Y,o)=>{ const px=(X-hd.X0)/R, py=(hd.Y0-Y)/R, rr=px*px+py*py; if(rr>=1.02)return 0; const rho=Math.sqrt(rr), cov=Math.min(1,Math.max(0,(1-rho)*R*q+0.5)); if(cov<=0)return 0;
        const z=Math.sqrt(Math.max(1e-6,1-rr)), zz=px*sy+z*cy, hy=py*ct-zz*st, m=hy>hd.sinB?2:1, tone=Math.min(1,Math.max(0,1-(px*L[0]+py*L[1]+z*L[2])));
        if(md===4){ nn[0]=px; nn[1]=py; nn[2]=z; hp(px,py,z,nn,dW,hh,0); hp(px,py,z,nn,d2W,hh,2); }
        fin.px(m,tone,Math.floor(X),Math.floor(Y),hh[0],hh[1],hh[2],hh[3],K,o); return cov; });
      /* folds: each kept stroke clears the outline, the band, the front cans and antennas and every stroke kept before it by one stroke width; longest first,
         pieces shorter than 2.5 widths dropped after the cut. When fewer strokes than rows fit, the fold stroke is thinned (to half at most) and the pick repeats. */
      const fs=P['brain-folds'], sp0=(fs.top_lat_deg-P['head-sphere'].band_lat_deg)*Math.PI/180/fs.rows, wf0=Math.min(w*ln.fold,0.32*sp0*R), fr=sc.cans.filter(c=>c.front);
      const segD=(p,a,b)=>{ const vx=b[0]-a[0], vy=b[1]-a[1], t=Math.max(0,Math.min(1,((p[0]-a[0])*vx+(p[1]-a[1])*vy)/(vx*vx+vy*vy||1))); return Math.hypot(p[0]-a[0]-t*vx,p[1]-a[1]-t*vy); };
      const len=f=>{ let l=0; for(let k=1;k<f.length;k++)l+=Math.hypot(f[k][0]-f[k-1][0],f[k][1]-f[k-1][1]); return l; }, order=sc.folds.slice().sort((a,b)=>len(b)-len(a));
      const pick=wf=>{ const gap=wf*(0.5+fs.clear), lim=R-w/2-gap, cs=Math.max(4,w), grid=new Map(), key=(i,j)=>i*100003+j, out=[];
        const put=(p,r)=>{ const k=key(Math.floor(p[0]/cs),Math.floor(p[1]/cs)); let c=grid.get(k); if(!c)grid.set(k,c=[]); c.push([p[0],p[1],r]); }, reach=Math.ceil((w/2+gap)/cs);
        const free=p=>{ const gx=Math.floor(p[0]/cs), gy=Math.floor(p[1]/cs); for(let i=-reach;i<=reach;i++)for(let j=-reach;j<=reach;j++){ const c=grid.get(key(gx+i,gy+j)); if(c)for(const q of c)if(Math.hypot(p[0]-q[0],p[1]-q[1])<q[2]+gap)return false; } return true; };
        for(const b of sc.band)for(const p of b)put(p,w/2); for(const c of fr)for(let j=0;j<c.hull.length;j+=3)put(c.hull[j],w/2);
        const ok=p=>Math.hypot(p[0]-hd.X0,p[1]-hd.Y0)<lim&&free(p)&&fr.every(c=>!S.inside(c.hull,p[0],p[1])&&segD(p,c.Bs,c.Ts)>=c.ra*R+w/2+gap), minL=Math.max(fs.min_len*wf,0.13*R);
        for(const f of order){ const runs=[]; let cur=[]; for(const p of f){ if(ok(p))cur.push(p); else if(cur.length){ runs.push(cur); cur=[]; } } if(cur.length)runs.push(cur);
          for(const r of runs){ if(len(r)<minL)continue; out.push(r); for(const p of r)put(p,wf/2); } }
        return out; };
      let wf=wf0, kept=pick(wf); for(const k of [0.8,0.65,0.5]){ if(kept.length>=fs.rows)break; const t=pick(wf0*k); if(t.length>kept.length){ kept=t; wf=wf0*k; } }
      kept.forEach((r,i)=>stroke(r,wf,ink,false,31+i));
      sc.band.forEach((b,i)=>stroke(b,w,ink,false,7+i));
      /* eyes: the glint is cut out of the dark disc, then filled with the light ink inside the eye only */
      for(const e of sc.eyes){ if(!e.on)continue; const hole=new Path2D(); hole.rect(0,0,W,H); hole.moveTo(e.hl[0][0],e.hl[0][1]); for(const p of e.hl)hole.lineTo(p[0],p[1]); hole.closePath(); sx.save(); sx.clip(hole,'evenodd'); fillP(e.loop,feat); sx.restore();
        if(!pen||K.inv){ x.save(); ln.path(x,e.loop,true); x.clip(); ln.path(x,e.hl,true); x.fillStyle=glint; x.fill(); x.restore(); } }
      fillP(sc.mouth,feat); if(!pen)ln.stroke(sx,sc.mouth,w*0.22,feat,true);
      const circ=[]; for(let i=0;i<=180;i++){ const t=2*Math.PI*i/180; circ.push([hd.X0+Math.cos(t)*R, hd.Y0+Math.sin(t)*R]); } stroke(circ,w,ink,true,3);
      flushPen({ x:Math.max(0,Math.floor(hd.X0-R-w)), y:Math.max(0,Math.floor(hd.Y0-R-w)), w:Math.min(W,Math.ceil(2*R+2*w)), h:Math.min(H,Math.ceil(2*R+2*w)) }); };
    const can=c=>{ const Rr=c.ra*R, inner=2*Rr-w, dmin=(p,set)=>{ let d=1e9; for(let j=0;j<set.length;j+=2)d=Math.min(d,Math.hypot(p[0]-set[j][0],p[1]-set[j][1])); return d; };
      /* the side band between outline and face must stay readable: the can's line is held to 1/2.2 of the band's widest part */
      let band=0; for(let j=0;j<c.hull.length;j+=6)band=Math.max(band,dmin(c.hull[j],c.cap)); const wc=c.front?Math.max(w*0.55,Math.min(w,band/2.2)):w;
      /* antenna: a dark capsule, then its inside */
      const rbox=S.box([c.Bs,c.Ts],Rr+w,W,H);
      if(!pen){ ln.stroke(x,[c.Bs,c.Ts],2*Rr+w,ink,false); } else { const ax=c.Ts[0]-c.Bs[0], ay=c.Ts[1]-c.Bs[1], al=Math.hypot(ax,ay)||1, ux=ax/al, uy=ay/al, tube=[[c.Bs[0]-uy*Rr,c.Bs[1]+ux*Rr]]; for(let k=0;k<=14;k++){ const t=k/14*Math.PI, cc=Math.cos(t), ss=Math.sin(t); tube.push([c.Ts[0]-uy*Rr*cc+ux*Rr*ss, c.Ts[1]+ux*Rr*cc+uy*Rr*ss]); } tube.push([c.Bs[0]+uy*Rr,c.Bs[1]-ux*Rr]); stroke(tube,w,ink,false,51+c.side); }
      if(inner>1){ const mk=S.mask(rbox,q,m=>{ m.lineCap='round'; m.lineWidth=pen?2*Rr:inner; m.strokeStyle='#fff'; m.beginPath(); m.moveTo(c.Bs[0],c.Bs[1]); m.lineTo(c.Ts[0],c.Ts[1]); m.stroke(); });
        const ax=c.Ts[0]-c.Bs[0], ay=c.Ts[1]-c.Bs[1], al=Math.hypot(ax,ay)||1, ux=ax/al, uy=ay/al;
        S.raster(x,rbox,q,(X,Y,o,k)=>{ const a=mk[k+3]/255; if(a<=0)return 0; const dx=X-c.Bs[0], dy=Y-c.Bs[1], s=Math.min(1,Math.max(-1,(dx*-uy+dy*ux)/Rr)), nz=Math.sqrt(Math.max(0,1-s*s)), n=[-uy*s, -ux*s, nz];
          const tone=Math.min(1,Math.max(0,1-(n[0]*L[0]+n[1]*L[1]+n[2]*L[2]))); if(md===4){ const px=(X-hd.X0)/R, py=(hd.Y0-Y)/R, pz=c.T[2]+n[2]*c.ra; hp(px,py,pz,n,dW,hh,0); hh[2]=0; hh[3]=1; }
          fin.px(6,tone,Math.floor(X),Math.floor(Y),hh[0],hh[1],0,1,K,o); return a; }); }
      if(pen)flushPen(rbox);
      /* the can: hull and the visible face */
      const cbox=S.box(c.hull,w,W,H);
      const mk=S.mask(cbox,q,m=>{ m.fillStyle='#f00'; ln.path(m,c.hull,true); m.fill(); m.fillStyle='#0f0'; ln.path(m,c.cap,true); m.fill(); });
      const a=c.a, Ci=c.Ci, r=c.r, a2=1-a[2]*a[2], cn=c.out?a:[-a[0],-a[1],-a[2]], dC=c.out?(c.Co[0]*a[0]+c.Co[1]*a[1]+c.Co[2]*a[2]):(Ci[0]*a[0]+Ci[1]*a[1]+Ci[2]*a[2]);
      const al2=Math.hypot(a[0],a[1])||1, e1=[a[1]/al2,-a[0]/al2,0], q0=[0,0,0];
      S.raster(x,cbox,q,(X,Y,o,k)=>{ const al=Math.max(mk[k],mk[k+1])/255; if(al<=0)return 0; const px=(X-hd.X0)/R, py=(hd.Y0-Y)/R; let m, n, pz;
        if(mk[k+1]>127){ m=c.out?4:5; n=cn; pz=Math.abs(a[2])>1e-3?(dC-px*a[0]-py*a[1])/a[2]:0; }
        else { m=3; q0[0]=px-Ci[0]; q0[1]=py-Ci[1]; q0[2]=-Ci[2]; const s0=q0[0]*a[0]+q0[1]*a[1]+q0[2]*a[2], B=2*(q0[2]-s0*a[2]), C=q0[0]*q0[0]+q0[1]*q0[1]+q0[2]*q0[2]-s0*s0-r*r, dsc=B*B-4*a2*C;
          n=cn; pz=c.Co[2]; if(a2>1e-4&&dsc>=0){ const t=(-B+Math.sqrt(dsc))/(2*a2), s=s0+t*a[2], rx=(q0[0]-s*a[0])/r, ry=(q0[1]-s*a[1])/r, rz=(q0[2]+t-s*a[2])/r;
          /* past either end of the straight body the normal turns smoothly toward the axis, as it does over the rounded edges */
          const k=s>c.s1?Math.min(1,(s-c.s1)/(c.h2-c.s1)):(s<c.s0?-Math.min(1,(c.s0-s)/c.s0):0), kk=Math.abs(k), sg=k<0?-1:1, nx=rx*(1-kk)+sg*a[0]*kk, ny=ry*(1-kk)+sg*a[1]*kk, nz=rz*(1-kk)+sg*a[2]*kk, nl=Math.hypot(nx,ny,nz)||1; n=[nx/nl,ny/nl,nz/nl]; pz=t; } }
        const tone=Math.min(1,Math.max(0,1-(n[0]*L[0]+n[1]*L[1]+n[2]*L[2])));
        if(md===4){ if(m===3){ hp(px,py,pz,n,a,hh,0); hp(px,py,pz,n,e1,hh,2); } else { hp(px,py,pz,n,dW,hh,0); hp(px,py,pz,n,d2W,hh,2); } }
        fin.px(m,tone,Math.floor(X),Math.floor(Y),hh[0],hh[1],hh[2],hh[3],K,o); return al; });
      /* gloss: always the light ink, clipped to the side band between hull and face, under the outlines */
      if(!pen&&c.glossS.length){ const band=new Path2D(); band.moveTo(c.hull[0][0],c.hull[0][1]); for(const p of c.hull)band.lineTo(p[0],p[1]); band.closePath(); band.moveTo(c.cap[0][0],c.cap[0][1]); for(const p of c.cap)band.lineTo(p[0],p[1]); band.closePath();
        /* the gloss floats: its ends stop half a line short of the outline and the face rim */
        /* the gloss runs down the middle of the side band, on its upper half where the band is widest, ends trimmed by half a line */
        const near=(p,set)=>{ let d=1e9, b=set[0]; for(const q of set){ const e=Math.hypot(p[0]-q[0],p[1]-q[1]); if(e<d){ d=e; b=q; } } return b; }, gw=wc*ln.gloss, need=wc/2+gw/2+wc*0.15, hu=c.hull, n=hu.length;
        const mid=hu.map(h=>{ const k=near(h,c.cap); return { m:[(h[0]+k[0])/2,(h[1]+k[1])/2], hw:Math.hypot(h[0]-k[0],h[1]-k[1])/2 }; }), okm=mid.map(q=>q.hw>=need&&q.m[1]<c.capC[1]);
        let best=[]; if(okm.some(v=>!v)){ const s0=okm.indexOf(false); let cur=[]; for(let k=1;k<=n;k++){ const i=(s0+k)%n; if(okm[i])cur.push(i); else { if(cur.length>best.length)best=cur; cur=[]; } } if(cur.length>best.length)best=cur; }
        let pts=best.map(i=>mid[i].m); if(pts.length>2)pts=pts.map((p,i)=>i===0||i===pts.length-1?p:[(pts[i-1][0]+2*p[0]+pts[i+1][0])/4,(pts[i-1][1]+2*p[1]+pts[i+1][1])/4]);
        const plen=q=>{ let l=0; for(let j=1;j<q.length;j++)l+=Math.hypot(q[j][0]-q[j-1][0],q[j][1]-q[j-1][1]); return l; }, trim=(q,d)=>{ let l=0, i=0; while(i<q.length-1&&l<d){ l+=Math.hypot(q[i+1][0]-q[i][0],q[i+1][1]-q[i][1]); i++; } return q.slice(i); };
        const Lmax=0.55*c.r*R; while(pts.length>2&&plen(pts)>Lmax){ const a0=best.length?mid[best[0]].hw:0, a1=best.length?mid[best[best.length-1]].hw:0; if(a0<=a1){ pts.shift(); best.shift(); } else { pts.pop(); best.pop(); } }
        best=trim(trim(pts,wc*0.5).reverse(),wc*0.5); const gl=plen(best);
        if(gl>=1.5*gw){ x.save(); x.clip(band,'evenodd'); ln.stroke(x,best,gw,V.white,false); x.restore(); } }
      stroke(c.hull,wc,ink,true,61+c.side);
      stroke(c.cap,wc,ink,true,71+c.side);
      /* crumbs: a speck of fill closed in by the head line, the antenna and the can top is filled with ink */
      if(c.front&&!pen){ const bx=S.box([c.Bs,[c.Bs[0]+(c.Ts[0]-c.Bs[0])*0.6,c.Bs[1]+(c.Ts[1]-c.Bs[1])*0.6]],Rr+3*w,W,H), mk=S.mask(bx,1,m=>{ m.strokeStyle='#fff'; m.fillStyle='#fff'; m.lineCap='round'; m.lineJoin='round';
          m.lineWidth=w; m.beginPath(); m.arc(hd.X0,hd.Y0,R,0,2*Math.PI); m.stroke(); m.lineWidth=2*Rr+w; m.beginPath(); m.moveTo(c.Bs[0],c.Bs[1]); m.lineTo(c.Ts[0],c.Ts[1]); m.stroke(); ln.path(m,c.hull,true); m.fill(); m.lineWidth=wc; m.stroke(); });
        S.crumbs(x,bx,mk,2*w*w,A.hex(ink)); }
      if(pen)flushPen(S.box(c.hull,w*0.6,W,H)); };
    for(const it of sc.order){ if(it.kind==='head')head(); else can(it.c); }
    if(pen){ /* construction: equator, meridian, the band all round, the eye line, can axes, the hidden rims */
      sx.lineCap='round'; const cw=Math.max(1,1.1*u), all=pts=>pts.map(hd.proj), faint=(pts,al)=>{ sx.globalAlpha=al; ln.stroke(sx,pts,cw,ink,false); };
      const D=Math.PI/180, mer=[]; for(let i=0;i<=200;i++){ const t=-Math.PI+2*Math.PI*i/200; mer.push(hd.toW([0,Math.sin(t),Math.cos(t)])); }
      for(const c of [hd.lat(0,200),mer,hd.band(200)]){ faint(all(c),0.16); for(const r of sc.vis(c,0))faint(r,0.3); }
      for(const r of sc.vis(hd.lat(P['face-decals'].eye_lat_deg*D,200),0))faint(r,0.26);
      for(const c of sc.cans){ const p0=hd.proj([c.Ci[0]-c.a[0]*0.25,c.Ci[1]-c.a[1]*0.25]), p1=hd.proj([c.Co[0]+c.a[0]*0.4,c.Co[1]+c.a[1]*0.4]); faint([p0,p1],0.3); faint(all(sc.rim(c.Ci,c.e1,c.e2,c.r,96).concat([sc.rim(c.Ci,c.e1,c.e2,c.r,96)[0]])),0.22); }
      const oc=[]; for(let i=0;i<=200;i++){ const t=2*Math.PI*i/200; oc.push([hd.X0+Math.cos(t)*R*1.012, hd.Y0+Math.sin(t)*R*1.012]); } faint(oc,0.28);
      sx.globalAlpha=1; const fb=S.box(sc.cans.reduce((a,c)=>a.concat(c.hull,[c.Ts]),[[hd.X0-R*1.05,hd.Y0-R*1.05],[hd.X0+R*1.05,hd.Y0+R*1.05]]),w+R*0.2,W,H); flushPen(fb); } },
  render(canvas,w,h,dpr,V,done,O){ window.STUDY.draw(canvas,V,O,1); if(done)done(); },
  /* motion: the head turns and tilts on two slow cycles; the eyes run the same path 0.9 s ahead. Fills at half resolution. */
  motion(canvas,w,h,dpr,V,t,ctx,UO){ const S=window.STUDY, A=window.ART, B=A.params(S.spec,UO), hb=B['head-sphere'], fb=B['face-decals'], cl=(v,a,b)=>Math.max(a,Math.min(b,v));
    const yaw=s=>22*Math.sin(2*Math.PI*s/13)+8*Math.sin(2*Math.PI*s/5.9+1.1), lead=0.9;
    const O={}; for(const k of Object.keys(UO||{}))O[k]=Object.assign({},UO[k]);
    O['head-sphere']=Object.assign({},O['head-sphere'],{ turn_deg:cl(hb.turn_deg+yaw(t),-35,35), tilt_deg:cl(hb.tilt_deg+5*Math.sin(2*Math.PI*t/9.5),-10,20) });
    O['face-decals']=Object.assign({},O['face-decals'],{ look_across_deg:cl(fb.look_across_deg+1.6*(yaw(t+lead)-yaw(t)),-40,40), look_up_deg:cl(fb.look_up_deg+12*Math.sin(2*Math.PI*(t+lead)/7.3),-20,45) });
    S.draw(canvas,V,O,0.5); },
  /* callouts follow the parts they name */
  onPoints(P){ window.STUDY._pts=P; },
  relayPoints(O){ const S=window.STUDY, A=window.ART, pts=S._pts; if(!pts)return; const P=A.params(S.spec,O), sc=S.scene(P,1), hd=sc.hd, Hu=1000*S.ref.h/S.ref.w;
    const at=(d,p)=>{ const q=pts.find(t=>t.d===d); if(q&&p){ q.u=Math.min(0.98,Math.max(0.02,p[0]/1000)); q.v=Math.min(0.98,Math.max(0.02,p[1]/Hu)); } };
    at('OUTL',[hd.X0-Math.cos(1.0)*hd.R, hd.Y0+Math.sin(1.0)*hd.R]);
    const bm=sc.band.reduce((a,b)=>b.length>a.length?b:a,[]); if(bm.length)at('BAND',bm[Math.floor(bm.length/2)]);
    let bf=null, by=1e9; for(const f of sc.folds){ const p=f[Math.floor(f.length/2)]; if(f.length>8&&Math.abs(p[0]-hd.X0)<hd.R*0.5&&p[1]<by){ by=p[1]; bf=p; } } if(bf)at('FOLD',bf);
    const e0=sc.eyes[0], e1=sc.eyes[1]; at('EYE',[e0.c[0],e0.c[1]+(e0.c[1]-e0.g[1])*0.5]); at('GLNT',e1.g); at('MOUTH',sc.mc);
    const nc=sc.cans.slice().sort((a,b)=>b.az-a.az)[0]; at('CAN',nc.capC); at('ANT',nc.Ts);
    at('SHAD',hd.proj([0.52,-0.62])); }
};
