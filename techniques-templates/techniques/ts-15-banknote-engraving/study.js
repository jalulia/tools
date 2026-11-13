window.STUDY={
  id:'ts-15-banknote-engraving', code:'TS-15', fig:'1.15',
  title:'Banknote engraving',
  kicker:'Technique · TS-15',
  lede:'A picture reprinted as one-ink intaglio: swelling lines, crosshatch, guilloche and one kept hue.',
  body:['Tone is line width, not gray: a 6 u screen whose lines swell from 6 % to 88 % of the pitch, break into dashes in the highlights and bend around forms. Past 58 % darkness a second set crosses at 62°, and smooth areas in the upper 40 % switch to a braided guilloche. Pixels within 30° of one chosen hue print in an ink of their own.'], liveLabel:'Use your image', liveHint:'Use your image runs the same functions on a picture you drop in.',
  source:'Reference 15 · Figma community file “$Dollar Bill texture shader” — the Banknote Engraving effect (Line Relief Studio), read from its Shader and Instruction pages at 214 %',
  spot:[19,71,87], ref:{w:900,h:1240},
  variantLabel:'Inks',
  variants:[
    { id:'ref',  label:'Teal + kept hue', sw:['#134757','#B8532A','#F4F5F3'], spot:[19,71,87],  paper:'#F4F5F3', ink:'#134757', accent:'hue' },
    { id:'io',   label:'Blue / ember',    sw:['#2F5AE6','#F4551E','#FFFFFF'], spot:[47,90,230], paper:'#FFFFFF', ink:'#2F5AE6', accent:'#F4551E' },
    { id:'note', label:'Note green',      sw:['#1F5A3A','#B8532A','#F3F5F2'], spot:[31,90,58],  paper:'#F3F5F2', ink:'#1F5A3A', accent:'hue' },
    { id:'mono', label:'Ink, no key',     sw:['#101014','#FFFFFF'],           spot:[16,16,20],  paper:'#FFFFFF', ink:'#101014', accent:'off' }
  ],
  points:[
    {u:0.20,v:0.12,d:'GUIL',label:'Guilloche · two mirrored sine-line families, period 103 u, max slope 1.55',t:'guilloche',dir:[-1,-1]},
    {u:0.82,v:0.33,d:'GUIL',label:'Guilloche edge · fades out by v 0.40 and where the edge map rises',t:'guilloche',dir:[1,-1]},
    {u:0.36,v:0.80,d:'LINE',label:'Swelling line · pitch 6 u, width 6 → 88 % of pitch with darkness',t:'engraved-line',dir:[-1,1]},
    {u:0.12,v:0.47,d:'LINE',label:'Broken line · dashes below 22 % darkness, paper below 4 %',t:'engraved-line',dir:[-1,0]},
    {u:0.50,v:0.47,d:'FLOW',label:'Contour flow · line phase + 3.9 pitches × blurred tone',t:'contour-flow',dir:[-1,-1]},
    {u:0.88,v:0.60,d:'XHAT',label:'Crosshatch · second set at 62°, starts at 58 % darkness',t:'shadow-crosshatch',dir:[1,1]},
    {u:0.64,v:0.20,d:'HKEY',label:'Kept hue · rust band within 30° of 22° prints in its own hue',t:'hue-key',dir:[1,-1]},
    {u:0.44,v:0.38,d:'TONE',label:'Tone curve · exposure +0.1 stop, contrast 1.25 about mid-gray',t:'tone-curve',dir:[-1,-1]},
    {u:0.70,v:0.86,d:'SRC',label:'Tone field · the picture as data: noise sea, lit from the left',t:'tone-field',dir:[1,1]},
    {u:0.50,v:0.96,d:'GRAIN',label:'Paper grain · ±3 % on 0.6 u cells, after the ink',t:'paper-grain',dir:[1,1]}
  ],
  spec:{
    reference:{ file:null, px:null, url:'https://www.figma.com/design/NYBMQibG1CYhkzkf0mYfO6/-Dollar-Bill-texture-shader',
      grammar:'image effect: a photograph reprinted as one-ink intaglio — tone as line width, crosshatch in the shadows, lines that bend with the form, a looping guilloche in smooth upper areas, one hue range kept as a second ink, paper grain',
      read_from:'canvas at 214 % (Instruction page, “Rome · terracotta accent”) and the settings panel on the Shader page; shader source not read (view-only file)',
      figma_panel:{ main_ink:'#134757', paper:'#F5EEDD', preserve_selected_hue:true, selected_hue:52, hue_tolerance:30, hue_feather:18, minimum_saturation:18, accent_strength:80, keep_shadows:65, accent_color:'Original hue · printed ink', custom_accent:'#B24F1F', engraving_spacing:3.2, line_weight:94, engraving_angle:0, contour_flow:65, shadow_crosshatch:65, guilloche_strength:69, guilloche_placement:'Upper smooth regions', upper_region:40, guilloche_scale:103, guilloche_curvature:155, exposure:0.1, contrast:1.25 } },
    units:'design units, 1000 = sheet width',
    palette:{ paper:'#F4F5F3', ink:'#134757', kept_hue_ink:'hsl(source hue, 62 %, 40 %)', reference_paper_not_used:'#F5EEDD' },
    techniques:[
      { id:'tone-field', short:'SRC', name:'Tone field (the picture)', layer:0, pass:0, atoms:['source','procedural','field'],
        params:{ subject:'headland with a signal tower and sheds, sea, far ridge — generated, lit from the left', res:{ value:0.5, range:[0.25,1], note:'source resolution as a fraction of the sheet' }, horizon_v:{ value:0.62, range:[0.45,0.8] }, soften_px:{ value:0.7, range:[0,3], unit:'px' }, seed:{ value:1507, range:[1,9999], step:1 } },
        limits:'Any RGB picture works in its place. Pictures with no smooth area above upper_v show no guilloche; pictures with no pixel inside the hue range print as one ink.',
        implementation:'Sky, ridge, headland and sea are evaluated per pixel from seeded Perlin noise; tower, sheds and boat are drawn as flat lit/shadow faces on top. The function returns a canvas; every later technique only reads it.' },
      { id:'tone-curve', short:'TONE', name:'Exposure and contrast', layer:1, pass:1, atoms:['tone-curve','luminance'],
        params:{ luminance:'0.2126 R + 0.7152 G + 0.0722 B', exposure:{ value:0.1, range:[-1.5,1.5], unit:'stops' }, contrast:{ value:1.25, range:[0.5,2.5] }, map:'clamp((L · 2^exposure − 0.5) · contrast + 0.5)' },
        limits:'Contrast above ~2 clips most of the sheet to paper or solid line; the swelling line then reads as a two-level threshold.',
        implementation:'Luminance is exposed and stretched about mid-gray before it sets any line width, so paper and solid shadow are reached inside the picture, not only at its extremes.' },
      { id:'contour-flow', short:'FLOW', name:'Contour flow (tone-warped phase)', layer:1, pass:2, atoms:['phase-warp','blur','field'],
        params:{ flow:{ value:0.65, range:[0,1] }, amp_pitches:{ value:6, range:[0,12], note:'phase shift in pitches at flow = 1 for a black-to-white step' }, radius_u:{ value:24, range:[4,60], unit:'u' }, edge_gain:{ value:9, range:[2,30], note:'edge-energy channel used by guilloche' }, phase:'s += flow · amp_pitches · blur(L, radius)' },
        limits:'flow · amp_pitches · pitch must stay under ~1.5 × radius or neighboring lines fold over each other at hard edges.',
        implementation:'A quarter-resolution copy of the picture is blurred; its luminance is added to the line phase, so lines rise over light forms and sink into dark ones. The same pass stores blurred edge energy for the guilloche mask.' },
      { id:'engraved-line', short:'LINE', name:'Swelling line screen', layer:2, pass:3, atoms:['line-screen','width-modulation','dash'],
        params:{ pitch_u:{ value:6, range:[2,14], unit:'u', note:'reference: 3.2 px on its own image; 6 u resolves at plate size' }, angle_deg:{ value:0, range:[-90,90], unit:'°' }, weight:{ value:0.94, range:[0.3,1.1] }, duty_min:{ value:0.06, range:[0,0.3] }, duty_max:{ value:0.94, range:[0.5,1] }, gamma:{ value:1.15, range:[0.5,2.5] }, paper_below:{ value:0.04, range:[0,0.3], note:'darkness under this prints nothing' }, dash_below:{ value:0.22, range:[0,0.6] }, dash_len_pitches:{ value:5, range:[2,16] }, width:'pitch · (duty_min + (duty_max·weight − duty_min) · darkness^gamma)' },
        limits:'Under ~2.5 device px of pitch the lines alias into tone. duty_max · weight at 1 closes the shadows to solid ink and the crosshatch has nothing to cross.',
        implementation:'Distance to the nearest line center is compared with half the tone-set width and antialiased over one device pixel. In the highlights each line is cut into dashes whose fill falls with darkness, with a hashed offset per line.' },
      { id:'shadow-crosshatch', short:'XHAT', name:'Shadow crosshatch', layer:2, pass:4, atoms:['hatch','line-screen','threshold'],
        params:{ strength:{ value:0.65, range:[0,1] }, angle_deg:{ value:62, range:[20,90], unit:'°', note:'relative to the main lines' }, pitch_u:{ value:6, range:[2,14], unit:'u' }, start:{ value:0.58, range:[0.2,0.9] }, full:{ value:0.92, range:[0.5,1] }, duty_max:{ value:0.62, range:[0.2,0.9] } },
        limits:'start under ~0.35 puts hatch into the midtones and the picture reads as a net, not an engraving.',
        implementation:'A second, unwarped line set whose width ramps from 0 at start to duty_max · strength at full darkness; the two sets are combined as 1 − (1−a)(1−b).' },
      { id:'guilloche', short:'GUIL', name:'Guilloche in upper smooth regions', layer:2, pass:5, atoms:['guilloche','sine-line','mask'],
        params:{ strength:{ value:0.69, range:[0,1] }, upper_v:{ value:0.40, range:[0,1] }, feather_v:{ value:0.07, range:[0.01,0.3] }, scale_u:{ value:103, range:[30,400], unit:'u' }, curvature:{ value:1.55, range:[0.2,4], note:'max slope of the wave; amplitude = curvature · scale / 2π' }, pitch_u:{ value:10, range:[2.5,20], unit:'u' }, duty:{ value:0.17, range:[0.08,0.6] }, tone:{ value:0.7, range:[0,1.5], note:'how much darkness thickens the guilloche line' }, drift:{ value:0.9, range:[0,3], note:'phase wander of family A down the sheet' }, smooth_lo:{ value:0.10, range:[0,0.5] }, smooth_hi:{ value:0.30, range:[0.1,1] }, shear:{ value:0.37, range:[0,1], note:'family B phase advance per unit y, in units of 2π/S — tilts the braid so it does not stripe' }, lines:'A: y + a·sin(2πx/S + drift·sin(2πy/2.3S)) = k·pitch;  B: y − a·sin(2πx/S + shear·2πy/S + 1.1) = k·pitch' },
        limits:'curvature above ~3 makes the wave steeper than the antialiasing estimate holds; pitch near the main pitch makes the hand-over at upper_v invisible.',
        implementation:'Two families of stacked sine lines, mirrored, give the braided cells. Vertical distance is divided by √(1 + slope²) so line width stays even on the steep parts. The mask is (above upper_v) × (edge energy low); the straight lines fade by the same mask.' },
      { id:'hue-key', short:'HKEY', name:'Kept hue as a second ink', layer:3, pass:6, atoms:['hue-key','spot-ink','mask'],
        params:{ hue_deg:{ value:22, range:[0,360], unit:'°' }, tolerance_deg:{ value:30, range:[2,90], unit:'°' }, feather_deg:{ value:18, range:[0,60], unit:'°' }, min_sat:{ value:18, range:[0,80], unit:'%' }, strength:{ value:0.8, range:[0,1] }, keep_shadows:{ value:0.65, range:[0,1] }, ink_sat:{ value:0.62, range:[0.2,1] }, ink_light:{ value:0.40, range:[0.2,0.6] }, mode:'variant.accent — "hue": ink takes each pixel’s own hue · "#hex": one custom ink · "off": monochrome' },
        limits:'tolerance + feather above ~90° keys most warm pictures whole; min_sat under ~8 % keys neutral grays by their noise hue.',
        implementation:'Mask = 1 inside tolerance of the chosen hue, feathered to 0, gated by saturation, scaled by strength and pulled back toward the main ink in the shadows by keep_shadows. It changes ink color only — line width is unchanged.' },
      { id:'paper-grain', short:'GRAIN', name:'Paper grain', layer:4, pass:7, atoms:['grain','stock'],
        params:{ amp:{ value:0.03, range:[0,0.12] }, cell_u:{ value:0.6, range:[0.25,4], unit:'u', note:'grain cell; one device pixel at the default' }, corr:{ value:0.35, range:[0,0.8] }, seed:{ value:15, range:[1,9999], step:1 } },
        limits:'Above ~0.06 the grain reads before the line; this pass is the last thing to add and the first to remove.',
        implementation:'One multiplicative monochrome noise pass over paper and ink together, on cells of 1.4 u with lag-1 correlation.' }
    ],
    pass_order:['picture · tone field drawn or supplied, upsampled to the sheet','curve · luminance → exposure → contrast','field · blurred luminance + edge energy at ¼ resolution','lines · phase = y/pitch + flow field; width from darkness; dashes in the highlights','hatch · second set at 62° above 58 % darkness','guilloche · two sine families where upper and smooth; straight lines fade there','ink · kept-hue ink or main ink, composited on paper by line coverage','grain · ±3 % multiplicative'],
    notes:['Parameter names and values under reference.figma_panel are copied from the effect’s settings panel as shown in the file. How the effect maps them internally is not known; the functions here are a rebuild from the rendered result, not a port of its shader.','Figma’s Selected hue 52 is on its own scale (the file’s quick start gives orange ≈ 25°, green ≈ 105°, red ≈ 0°); this spec uses degrees.','Reference paper is #F5EEDD; the rebuild prints on neutral #F4F5F3 in every variant.','No reference image is bundled (third-party file); compare is off for this plate.','Seeds 1507 (picture), 15 (grain).']
  },
  /* v2 · one pure function per spec technique. P = that technique's params as plain values, u = device px per design
     unit, A = helpers, V = variant colors. engrave() composes them in pass order; live() runs the same functions on a
     dropped image. */
  techniques:{
    'tone-field':(P,u,A)=>({ draw:(W,H)=>{
      const w=Math.max(2,Math.round(W*P.res)), h=Math.max(2,Math.round(H*P.res)); const c=A.off(w,h), x=c.getContext('2d'); const q=1000/w, Hh=h*q, hor=P.horizon_v*Hh;
      const n=A.perlin(P.seed), n2=A.perlin(P.seed+7), r=A.rng(P.seed+3);
      const head=new Float32Array(w), shore=new Float32Array(w), ridge=new Float32Array(w), fg=new Float32Array(w);
      for(let i=0;i<w;i++){ const X=i*q; const rise=A.sstep(110,650,X), fall=1-0.40*A.sstep(650,1000,X);
        head[i]=hor-(hor-0.285*Hh)*Math.pow(rise,0.78)*fall+34*n.fbm(X/150,3.1,3)*rise;
        shore[i]=hor+26+70*A.sstep(110,1000,X)+10*n.fbm(X/60,5.5,2);
        ridge[i]=hor-64-74*(0.5+0.5*n2.fbm(X/250,1.7,3));
        const k=1-A.sstep(0,470,X); fg[i]=Hh-(210+60*n.fbm(X/80,8.3,3))*k*k; }
      const id=x.createImageData(w,h), d=id.data; const mix=A.mix, cl=A.clamp, ss=A.sstep;
      for(let j=0;j<h;j++){ const Y=j*q; for(let i=0;i<w;i++){ const X=i*q; let c3;
        if(Y>fg[i]){ const sh=0.5+3.2*(n.fbm((X+5)/55,Y/55,4)-n.fbm((X-5)/55,Y/55,4)); c3=mix([14,24,34],[104,116,124],cl(0.06+0.5*sh*ss(0,26,Y-fg[i]+8),0,1)); }
        else if(X>110&&Y>=head[i]&&Y<shore[i]){ const sk=X+0.22*(Y-head[i]); const R=(a,b)=>n.fbm(a/88,b/330,3)+0.35*n2.fbm(a/31,b/120,2); const f=R(sk,Y), dx=R(sk+6,Y)-R(sk-6,Y); const dep=(Y-head[i])/(shore[i]-head[i]);
          const lit=0.55-3.6*dx-0.16*dep-0.30*ss(0.02,0.34,n2.fbm(X/300+2,Y/240,2))+0.05*Math.sin(Y/7+f*12);
          c3=mix([58,76,98],[218,152,104],cl((lit-0.05)/0.9,0,1)); }
        else if(Y>=(X>110?shore[i]:hor)){ const dp=(Y-hor)/(Hh-hor), rip=n.fbm(X/130,Y/5.5,3), gl=Math.exp(-Math.pow((X-270)/170,2));
          const l=0.52-0.30*dp+0.30*rip*(1-0.4*dp)+0.42*gl*ss(-0.12,0.32,rip)*(1-0.5*dp); c3=mix([26,52,76],[214,226,230],cl(l,0,1)); }
        else if(Y>=ridge[i]){ const hz=(Y-ridge[i])/(hor-ridge[i]+1); c3=mix([122,144,164],[172,186,198],cl(0.25+0.6*hz+0.35*n2.fbm(X/70,Y/40,3),0,1)); }
        else { const t=Y/hor; const b=mix([162,186,208],[190,200,206],Math.pow(t,1.25)); const cb=ss(0.02,0.5,n2.fbm(X/240,Y/80+4,4)+0.12)*ss(0.50,0.74,t)*(1-ss(0.93,1,t)); c3=mix(b,[222,226,226],0.62*cb); }
        const o=(j*w+i)*4; d[o]=c3[0]; d[o+1]=c3[1]; d[o+2]=c3[2]; d[o+3]=255; } }
      x.putImageData(id,0,0); x.setTransform(1/q,0,0,1/q,0,0);
      const poly=(pts,fill)=>{ x.beginPath(); pts.forEach((p,k)=>k?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])); x.closePath(); x.fillStyle=fill; x.fill(); };
      const top=X=>head[Math.max(0,Math.min(w-1,Math.round(X/q)))];
      const shed=(X,Y,wd,hh,sd,rh)=>{ poly([[X,Y],[X+wd,Y],[X+wd,Y-hh],[X,Y-hh]],'#EFE7D6'); poly([[X+wd,Y],[X+wd+sd,Y-sd*0.45],[X+wd+sd,Y-hh-sd*0.45],[X+wd,Y-hh]],'#4C5F72');
        poly([[X-3,Y-hh],[X+wd+3,Y-hh],[X+wd+sd*0.5+2,Y-hh-rh],[X+sd*0.5-1,Y-hh-rh]],'#CB6A3A'); poly([[X+wd+3,Y-hh],[X+wd+sd+3,Y-hh-sd*0.45],[X+wd+sd*0.5+2,Y-hh-rh]],'#84401F');
        const nw=Math.max(1,Math.round(wd/15)); for(let k=0;k<nw;k++){ const wx=X+wd*(k+0.5)/nw-2.2; poly([[wx,Y-hh*0.72],[wx+4.4,Y-hh*0.72],[wx+4.4,Y-hh*0.34],[wx,Y-hh*0.34]],'#2A3A4A'); } };
      const list=[]; for(let k=0;k<11;k++){ const X=700+r()*250, dp=0.10+r()*0.42; list.push([X,top(X)+dp*(hor+60-top(X)),30+r()*26,18+r()*14]); }
      for(let k=0;k<6;k++){ const X=250+k*58+r()*16; list.push([X,top(X)+9+r()*10,32+r()*24,20+r()*12]); }
      list.sort((a,b)=>a[1]-b[1]); for(const s of list)shed(s[0],s[1],s[2],s[3],s[2]*0.34,s[3]*0.52);
      /* signal tower on the summit */
      { const X=640, Y=top(X)+10, Ht=178, b=22, t=15; const g=x.createLinearGradient(X-b,0,X+b,0); g.addColorStop(0,'#F3EDE0'); g.addColorStop(0.42,'#D9D3C6'); g.addColorStop(1,'#5A6C7E'); poly([[X-b,Y],[X+b,Y],[X+t,Y-Ht],[X-t,Y-Ht]],g);
        const band=(a,c)=>{ const hw=v=>b+(t-b)*v; const g2=x.createLinearGradient(X-b,0,X+b,0); g2.addColorStop(0,'#D2632F'); g2.addColorStop(0.5,'#B8532A'); g2.addColorStop(1,'#5E2A14'); poly([[X-hw(a),Y-Ht*a],[X+hw(a),Y-Ht*a],[X+hw(c),Y-Ht*c],[X-hw(c),Y-Ht*c]],g2); };
        band(0.26,0.42); band(0.62,0.78); poly([[X-5,Y],[X+5,Y],[X+5,Y-17],[X-5,Y-17]],'#22303C');
        poly([[X-24,Y-Ht],[X+24,Y-Ht],[X+24,Y-Ht-6],[X-24,Y-Ht-6]],'#1E2C38'); poly([[X-11,Y-Ht-6],[X+11,Y-Ht-6],[X+11,Y-Ht-30],[X-11,Y-Ht-30]],'#E4ECEE');
        for(const m of [-11,-4,3,9.5])poly([[X+m,Y-Ht-6],[X+m+1.6,Y-Ht-6],[X+m+1.6,Y-Ht-30],[X+m,Y-Ht-30]],'#22303C');
        poly([[X-14,Y-Ht-30],[X+14,Y-Ht-30],[X+5,Y-Ht-46],[X-5,Y-Ht-46]],'#B8532A'); poly([[X-0.9,Y-Ht-46],[X+0.9,Y-Ht-46],[X+0.9,Y-Ht-66],[X-0.9,Y-Ht-66]],'#1E2C38'); }
      /* boat */
      { const X=300, Y=hor+118; poly([[X-46,Y-9],[X+50,Y-11],[X+38,Y+6],[X-34,Y+6]],'#16222E'); poly([[X-45,Y-9],[X+50,Y-11],[X+49,Y-7],[X-44,Y-5]],'#C2592C'); poly([[X-12,Y-10],[X+16,Y-10.5],[X+16,Y-25],[X-12,Y-25]],'#ECE6D8'); poly([[X+16,Y-10.5],[X+24,Y-13],[X+24,Y-26],[X+16,Y-25]],'#506274'); poly([[X-1,Y-25],[X+0.6,Y-25],[X+0.6,Y-58],[X-1,Y-58]],'#16222E'); }
      x.setTransform(1,0,0,1,0,0); return P.soften_px>0?A.blur(c,P.soften_px):c; } }),
    'tone-curve':P=>{ const ev=Math.pow(2,P.exposure), k=P.contrast; return { map:l=>{ const v=(l*ev-0.5)*k+0.5; return v<0?0:v>1?1:v; } }; },
    'contour-flow':(P,u,A)=>({ amp:P.flow*P.amp_pitches, field:(src,W,H)=>{ const k=4, w=Math.ceil(W/k), h=Math.ceil(H/k); const s=A.off(w,h), sx=s.getContext('2d'); sx.drawImage(src,0,0,w,h); const id=sx.getImageData(0,0,w,h), d=id.data; const L=new Float32Array(w*h);
        for(let i=0;i<w*h;i++)L[i]=(0.2126*d[i*4]+0.7152*d[i*4+1]+0.0722*d[i*4+2])/255;
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const i=y*w+x; const gx=L[y*w+Math.min(w-1,x+1)]-L[y*w+Math.max(0,x-1)], gy=L[Math.min(h-1,y+1)*w+x]-L[Math.max(0,y-1)*w+x]; d[i*4]=L[i]*255; d[i*4+1]=Math.min(255,Math.hypot(gx,gy)*P.edge_gain*255); d[i*4+2]=0; d[i*4+3]=255; }
        sx.putImageData(id,0,0); const b=A.blur(s,Math.max(0.5,P.radius_u*u/k)); const f=A.off(W,H), fx=f.getContext('2d'); fx.imageSmoothingQuality='high'; fx.drawImage(b,0,0,W,H); return fx.getImageData(0,0,W,H).data; } }),
    'engraved-line':(P,u,A)=>{ const p=P.pitch_u*u, th=P.angle_deg*Math.PI/180, cs=Math.cos(th), sn=Math.sin(th); const lo=P.duty_min, hi=P.duty_max*P.weight, g=P.gamma, cut=P.paper_below, db=P.dash_below, dl=P.dash_len_pitches*p;
      return { p, cs, sn, cov:(s,t,dark)=>{ if(dark<=cut)return 0; const f=s-Math.floor(s); const d=Math.abs(f-0.5)*p; let c=0.5*p*(lo+(hi-lo)*Math.pow(dark,g))-d+0.5; if(c<=0)return 0; if(c>1)c=1; c*=A.sstep(cut,cut+0.05,dark);
        if(dark<db){ const hsh=Math.sin(Math.floor(s)*127.1)*43758.5453; let q=t*p/dl+hsh-Math.floor(hsh); q-=Math.floor(q); const fill=0.22+0.78*dark/db; c*=A.clamp((fill-q)*dl+0.5,0,1)*A.clamp(q*dl+0.5,0,1); }
        return c; } }; },
    'shadow-crosshatch':(P,u,A)=>{ const p=P.pitch_u*u, w=0.5*p*P.duty_max*P.strength; return { start:P.start, angle:P.angle_deg, p, cov:(s,dark)=>{ const k=A.sstep(P.start,P.full,dark); if(k<=0)return 0; const f=s-Math.floor(s); const c=w*k-Math.abs(f-0.5)*p+0.5; return c<=0?0:c>1?1:c; } }; },
    'guilloche':(P,u,A)=>{ const S=P.scale_u*u, k=6.2832/S, a=P.curvature/k, p=P.pitch_u*u, hw=0.5*p*P.duty*(0.45+0.8*P.strength);
      return { mask:(v,edge)=>P.strength<=0?0:(1-A.sstep(P.upper_v-P.feather_v,P.upper_v+P.feather_v,v))*(1-A.sstep(P.smooth_lo,P.smooth_hi,edge)),
        cov:(x,y,dark)=>{ const w=hw*(0.55+P.tone*dark); const ph=k*x+P.drift*Math.sin(k*y/2.3); const pb=k*x+P.shear*k*y+1.1; const sA=(y+a*Math.sin(ph))/p, sB=(y-a*Math.sin(pb))/p; const mA=a*k*Math.cos(ph), mB=a*k*Math.cos(pb);
          const dA=Math.abs(sA-Math.floor(sA)-0.5)*p/Math.sqrt(1+mA*mA), dB=Math.abs(sB-Math.floor(sB)-0.5)*p/Math.sqrt(1+mB*mB); const cA=A.clamp(w-dA+0.5,0,1), cB=A.clamp(w-dB+0.5,0,1); return 1-(1-cA)*(1-cB); } }; },
    'hue-key':(P,u,A,V)=>{ const main=A.hex(V.ink), on=V.accent&&V.accent!=='off', custom=on&&V.accent[0]==='#'?A.hex(V.accent):null; const out=[0,0,0];
      const hsl=(h,s,l)=>{ const c=(1-Math.abs(2*l-1))*s, hp=h/60, x=c*(1-Math.abs(hp%2-1)), m=l-c/2; const q=hp<1?[c,x,0]:hp<2?[x,c,0]:hp<3?[0,c,x]:hp<4?[0,x,c]:hp<5?[x,0,c]:[c,0,x]; return [(q[0]+m)*255,(q[1]+m)*255,(q[2]+m)*255]; };
      let Hq=0; const mask=(r,g,b)=>{ const mx=Math.max(r,g,b), mn=Math.min(r,g,b), c=mx-mn; if(!mx||c/mx*100<P.min_sat)return 0; let h=mx===r?((g-b)/c)%6:mx===g?(b-r)/c+2:(r-g)/c+4; h*=60; if(h<0)h+=360; let dh=Math.abs(h-P.hue_deg); if(dh>180)dh=360-dh; Hq=h; return (1-A.sstep(P.tolerance_deg,P.tolerance_deg+P.feather_deg+0.001,dh))*A.sstep(P.min_sat,P.min_sat+14,c/mx*100); };
      return { main, mask, ink:(r,g,b,dark)=>{ if(!on)return main; const m=mask(r,g,b)*P.strength*(1-P.keep_shadows*A.sstep(0.6,0.98,dark)); if(m<=0)return main; const acc=custom||hsl(Hq,P.ink_sat,P.ink_light); out[0]=main[0]+(acc[0]-main[0])*m; out[1]=main[1]+(acc[1]-main[1])*m; out[2]=main[2]+(acc[2]-main[2])*m; return out; } }; },
    'paper-grain':(P,u,A)=>({ apply:ctx=>{ if(P.amp>0)A.grain(ctx,{amp:P.amp,pitch:Math.max(1,Math.round(P.cell_u*u)),seed:P.seed,corr:P.corr}); } })
  },
  /* compose: src is any canvas/image (omit it to draw the tone field). Writes the print into `canvas`. */
  engrave:function(A,T,P,V,canvas,src){
    const W=canvas.width,H=canvas.height,u=W/1000; const x=canvas.getContext('2d');
    const pic=src||T['tone-field'](P['tone-field'],u,A).draw(W,H);
    const full=A.off(W,H), fx=full.getContext('2d'); fx.imageSmoothingQuality='high'; fx.drawImage(pic,0,0,W,H); const sd=fx.getImageData(0,0,W,H).data;
    const curve=T['tone-curve'](P['tone-curve']), flow=T['contour-flow'](P['contour-flow'],u,A), line=T['engraved-line'](P['engraved-line'],u,A), hatch=T['shadow-crosshatch'](P['shadow-crosshatch'],u,A), guil=T['guilloche'](P['guilloche'],u,A), key=T['hue-key'](P['hue-key'],u,A,V), grain=T['paper-grain'](P['paper-grain'],u,A);
    const fd=flow.field(full,W,H); const paper=A.hex(V.paper); const id=x.createImageData(W,H), d=id.data;
    const p=line.p, cs=line.cs, sn=line.sn, amp=flow.amp; const ha=(P['engraved-line'].angle_deg+hatch.angle)*Math.PI/180, hc=Math.cos(ha), hs=Math.sin(ha), hp=hatch.p, hstart=hatch.start;
    for(let y=0;y<H;y++){ const v=y/H; for(let X=0;X<W;X++){ const i=(y*W+X)*4; const r=sd[i],g=sd[i+1],b=sd[i+2];
      const dark=1-curve.map((0.2126*r+0.7152*g+0.0722*b)/255); const gm=guil.mask(v,fd[i+1]/255);
      let c=gm<1?line.cov((y*cs-X*sn)/p+amp*fd[i]/255,(X*cs+y*sn)/p,dark)*(1-gm):0;
      if(dark>hstart){ const c2=hatch.cov((y*hc-X*hs)/hp,dark); c=1-(1-c)*(1-c2); }
      if(gm>0){ const c3=guil.cov(X,y,dark)*gm; c=1-(1-c)*(1-c3); }
      if(c<=0){ d[i]=paper[0]; d[i+1]=paper[1]; d[i+2]=paper[2]; } else { const k=key.ink(r,g,b,dark); d[i]=paper[0]+(k[0]-paper[0])*c; d[i+1]=paper[1]+(k[1]-paper[1])*c; d[i+2]=paper[2]+(k[2]-paper[2])*c; }
      d[i+3]=255; } }
    x.setTransform(1,0,0,1,0,0); x.putImageData(id,0,0); grain.apply(x);
  },
  render(canvas,w,h,dpr,V,done,O){ const A=window.ART, S=window.STUDY; S.engrave(A,S.techniques,A.params(S.spec,O),V,canvas,null); if(done)done(); },
  /* Live: the same technique functions, serialized, on a dropped image. Self-contained; no network. */
  live(V){ const S=window.STUDY, A=window.ART;
    const helpers=Object.keys(A).map(k=>'A.'+k+'='+A[k].toString()+';').join('\n');
    const techs='{'+Object.keys(S.techniques).map(k=>JSON.stringify(k)+':'+S.techniques[k].toString()).join(',\n')+'}';
    const ctl=[['engraved-line','pitch_u','Engraving spacing'],['engraved-line','weight','Line weight'],['engraved-line','angle_deg','Engraving angle'],['contour-flow','flow','Contour flow'],['shadow-crosshatch','strength','Shadow crosshatch'],['guilloche','strength','Guilloche strength'],['guilloche','upper_v','Upper region'],['guilloche','scale_u','Guilloche scale'],['guilloche','curvature','Guilloche curvature'],['tone-curve','exposure','Exposure'],['tone-curve','contrast','Contrast'],['hue-key','hue_deg','Selected hue'],['hue-key','tolerance_deg','Hue tolerance'],['hue-key','strength','Accent strength'],['hue-key','keep_shadows','Keep shadows'],['paper-grain','amp','Paper grain']];
    return `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{margin:0;height:100%;background:#fff;color:#101014;font:11px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace}
#wrap{position:absolute;inset:0;display:flex}#stage{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;background:#ECEDEB;position:relative}
canvas{max-width:100%;max-height:100%;display:block}#stage.over{outline:2px solid #2F5AE6;outline-offset:-2px}
#hint{position:absolute;left:8px;top:8px;background:#101014;color:#fff;padding:5px 8px;letter-spacing:.04em;text-transform:uppercase;font-size:10px}
#rail{position:absolute;top:0;right:0;bottom:0;width:204px;overflow:auto;border-left:1px solid #101014;padding:10px 10px 14px;background:#fff;display:none}#wrap.open #rail{display:block}
#bar{position:absolute;left:8px;bottom:8px;display:flex;gap:5px}#bar button,#bar label{font:inherit;border:1px solid #101014;background:#fff;color:#101014;padding:4px 7px;cursor:pointer;text-transform:uppercase;letter-spacing:.04em;font-size:10px}#bar button:hover,#bar label:hover{background:#101014;color:#fff}
#rail h1{font-size:10px;letter-spacing:.08em;text-transform:uppercase;margin:0 0 8px;font-weight:600}
.r{display:grid;grid-template-columns:1fr 38px;gap:2px 6px;margin:0 0 7px}.r label{grid-column:1/3;color:#55565A}.r input[type=range]{width:100%;margin:0;accent-color:#101014}.r output{text-align:right}
.b{display:flex;gap:6px;margin:0 0 10px;flex-wrap:wrap}.b button,.b label{font:inherit;border:1px solid #101014;background:#fff;color:#101014;padding:4px 7px;cursor:pointer;text-transform:uppercase;letter-spacing:.04em;font-size:10px}.b button:hover,.b label:hover{background:#101014;color:#fff}
.c{display:flex;gap:8px;align-items:center;margin:0 0 9px}.c input{width:26px;height:20px;padding:0;border:1px solid #101014;background:none}.c select{font:inherit;border:1px solid #101014;background:#fff;flex:1;min-width:0}
</style></head><body><div id="wrap"><div id="stage"><canvas id="cv"></canvas><div id="hint">Drop an image</div><div id="bar"><label>Open<input id="file" type="file" accept="image/*" hidden></label><button id="save">Save PNG</button><button id="ctl">Controls</button></div></div>
<div id="rail"><h1>Banknote engraving</h1><div class="b"><button id="reset">Reset</button><button id="shut">Close</button></div>
<div class="c"><input id="ink" type="color" title="Main ink"><input id="paper" type="color" title="Paper"><input id="acc" type="color" title="Custom accent"><select id="mode"><option value="hue">Kept hue · own ink</option><option value="custom">Kept hue · custom ink</option><option value="off">One ink</option></select></div><div id="rows"></div></div></div>
<script>
const A={};
${helpers}
const T=${techs};
const engrave=${S.engrave.toString()};
const SPEC=${JSON.stringify({techniques:S.spec.techniques})}, V0=${JSON.stringify({paper:V.paper,ink:V.ink,accent:V.accent})}, CTL=${JSON.stringify(ctl)};
const $=i=>document.getElementById(i), cv=$('cv'), stage=$('stage'); let img=null, O={}, V=Object.assign({},V0), raf=0;
const leaf=(t,p)=>SPEC.techniques.find(q=>q.id===t).params[p];
const ui=()=>{ $('ink').value=V.ink; $('paper').value=V.paper; const cust=V.accent&&V.accent[0]==='#'; $('acc').value=cust?V.accent:'#B8532A'; $('mode').value=cust?'custom':V.accent;
  $('rows').innerHTML=CTL.map(([t,p,n],k)=>{ const L=leaf(t,p), v=(O[t]&&p in O[t])?O[t][p]:L.value, st=L.step||(L.range[1]-L.range[0])/200; return '<div class="r"><label>'+n+'</label><input type="range" data-k="'+k+'" min="'+L.range[0]+'" max="'+L.range[1]+'" step="'+st+'" value="'+v+'"><output>'+(+v).toFixed(Math.abs(v)<10?2:0)+'</output></div>'; }).join(''); };
const draw=()=>{ raf=0; const dpr=Math.min(2,window.devicePixelRatio||1), bw=stage.clientWidth, bh=stage.clientHeight; const ar=img?img.naturalWidth/img.naturalHeight:900/1240; let w=bw, h=w/ar; if(h>bh){ h=bh; w=h*ar; }
  cv.width=Math.max(2,Math.round(w*dpr)); cv.height=Math.max(2,Math.round(h*dpr)); cv.style.width=w+'px'; cv.style.height=h+'px'; let src=null; if(img){ src=A.off(cv.width,cv.height); const sx=src.getContext('2d'); sx.imageSmoothingQuality='high'; sx.drawImage(img,0,0,cv.width,cv.height); }
  engrave(A,T,A.params(SPEC,O),V,cv,src); };
const kick=()=>{ if(!raf)raf=requestAnimationFrame(draw); };
const load=f=>{ if(!f||!/^image\\//.test(f.type))return; const u=URL.createObjectURL(f), i=new Image(); i.onload=()=>{ img=i; $('hint').style.display='none'; kick(); }; i.src=u; };
$('rows').addEventListener('input',e=>{ const k=e.target.dataset.k; if(k==null)return; const [t,p]=CTL[k], v=+e.target.value; (O[t]=O[t]||{})[p]=v; e.target.nextElementSibling.textContent=v.toFixed(Math.abs(v)<10?2:0); kick(); });
$('ink').oninput=e=>{ V.ink=e.target.value; kick(); }; $('paper').oninput=e=>{ V.paper=e.target.value; kick(); };
const acc=()=>{ const m=$('mode').value; V.accent=m==='custom'?$('acc').value:m; kick(); }; $('acc').oninput=()=>{ $('mode').value='custom'; acc(); }; $('mode').onchange=acc;
$('ctl').onclick=$('shut').onclick=()=>$('wrap').classList.toggle('open'); $('file').onchange=e=>load(e.target.files[0]); $('reset').onclick=()=>{ O={}; V=Object.assign({},V0); img=null; $('hint').style.display=''; ui(); kick(); };
$('save').onclick=()=>{ const a=document.createElement('a'); a.download='banknote-engraving.png'; a.href=cv.toDataURL('image/png'); a.click(); };
['dragenter','dragover'].forEach(n=>addEventListener(n,e=>{ e.preventDefault(); stage.classList.add('over'); })); ['dragleave','drop'].forEach(n=>addEventListener(n,e=>{ e.preventDefault(); stage.classList.remove('over'); }));
addEventListener('drop',e=>load(e.dataTransfer.files[0])); addEventListener('resize',kick); ui(); kick();
<\/script></body></html>`; }
};
