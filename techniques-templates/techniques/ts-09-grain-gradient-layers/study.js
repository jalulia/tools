window.STUDY={
  id:'ts-09-grain-gradient-layers', code:'TS-09', fig:'1.9',
  title:'Grain gradient layers',
  kicker:'Technique · TS-09',
  lede:'Three gradient panels, one soft mask, one ripple band, one grain.',
  body:[
    'Three portrait panels. The first is a vertical two-stop gradient with a black shape blurred in from the left; the same shape blurred far wider tints the field crimson as it nears the black. The second is a blue field of stacked dark arcs at one pitch, darkest inside a window and cut off below it — each peak slides left down the stack, and the arcs taper to points where the window ends. The third runs black through red to pink on a 66° diagonal.',
    'Everything draws flat, then one additive grain crosses all three panels at once — heavier in the darks, lighter in the lights. Captions sit in the corners.'
  ],
  source:'Reference 09 · three grained gradient panels, 1200 × 800',
  spot:[242,106,27], ref:{w:1200,h:800},
  variantLabel:'Color',
  variants:[
    { id:'ref', label:'As reference', sw:['#F26A1B','#E4243B','#1F8FE0','#101014'], spot:[242,106,27],
      p1:['#FA8F17','#F5701F'], halo:'#D71E3D', mask:'#080808',
      p2:['#23B5F2','#137AD7'], dark:'#090B43', light:'#78BCEC',
      p3:[[0.15,'#080909'],[0.34,'#7D1315'],[0.45,'#D72532'],[0.56,'#F05277'],[0.67,'#F39FB6'],[1,'#DEC2D1']],
      cap:['rgba(255,215,220,0.55)','rgba(255,255,255,0.72)','rgba(235,190,190,0.6)'] },
    { id:'io',  label:'Ø', sw:['#F4551E','#2F5AE6','#FFFFFF','#101014'], spot:[244,85,30],
      p1:['#F4551E','#E8420F'], halo:'#B8260A', mask:'#101014',
      p2:['#2F5AE6','#2446B8'], dark:'#101014', light:'#FFFFFF',
      p3:[[0.15,'#101014'],[0.34,'#1E2E7A'],[0.45,'#2F5AE6'],[0.56,'#5A80F0'],[0.67,'#B8C8FA'],[1,'#FFFFFF']],
      cap:['rgba(255,255,255,0.6)','rgba(255,255,255,0.75)','rgba(255,255,255,0.6)'] },
    { id:'mono', label:'Mono', sw:['#101014','#B4B2AC','#FFFFFF'], spot:[16,16,20],
      p1:['#B4B2AC','#9C9A94'], halo:'#5A5A60', mask:'#101014',
      p2:['#C4C2BC','#A4A29C'], dark:'#101014', light:'#FFFFFF',
      p3:[[0.15,'#101014'],[0.34,'#4A4A4E'],[0.45,'#8E8C86'],[0.56,'#B4B2AC'],[0.67,'#D6D4CE'],[1,'#FFFFFF']],
      cap:['rgba(255,255,255,0.55)','rgba(16,16,20,0.7)','rgba(255,255,255,0.7)'] }
  ],
  points:[
    {u:0.11,v:0.60,d:'MASK',label:'Soft mask · black shape, edge blurred σ 33 u',t:'soft-mask',dir:[1,1]},
    {u:0.245,v:0.55,d:'MASK',label:'Mask edge · 10 → 90 % over 83 u',t:'soft-mask',dir:[1,0]},
    {u:0.30,v:0.40,d:'MASK',label:'Halo · the same mask blurred σ 110 u tints the field crimson',t:'soft-mask',dir:[1,-1]},
    {u:0.31,v:0.05,d:'GRAD',label:'Gradient A · two stops, vertical, orange to red-orange',t:'two-stop-gradient',dir:[-1,-1]},
    {u:0.42,v:0.12,d:'RIPL',label:'Upper arcs · pitch 32 u, contrast rising toward the band',t:'ripple-band',dir:[1,-1]},
    {u:0.50,v:0.40,d:'RIPL',label:'Band · same pitch, dark duty 63 %, light stripes between, blur 3.3 u',t:'ripple-band',dir:[-1,1]},
    {u:0.60,v:0.55,d:'RIPL',label:'Tips · arcs taper where the window cuts off, 2 u left per u down',t:'ripple-band',dir:[1,1]},
    {u:0.86,v:0.42,d:'GRAD',label:'Gradient C · black → red → pink along 66°',t:'two-stop-gradient',dir:[-1,0]},
    {u:0.90,v:0.86,d:'GRAN',label:'Film grain · additive, σ 12/255 in black, 6/255 in pink',t:'film-grain',dir:[-1,1]},
    {u:0.94,v:0.19,d:'CAPT',label:'Caption · Inter 400, 22 u, right-aligned, 14 u from the edge',t:'caption-label',dir:[-1,-1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1200,800], grammar:'three portrait gradient panels: soft black mask over an orange field, a rippled band over blue, a diagonal black-red-pink; one film grain over all; corner captions' },
    units:'design units, 1000 = sheet width (1200 px); panel = 333 × 667 u',
    palette:{ orange:'#FA8F17', red_orange:'#F5701F', crimson:'#D71E3D', black:'#080808', blue_light:'#23B5F2', blue:'#137AD7', navy:'#090B43', stripe_light:'#78BCEC', red:'#D72532', hot_pink:'#F05277', pink:'#F39FB6', pale:'#DEC2D1' },
    techniques:[
      { id:'two-stop-gradient', short:'GRAD', name:'Two-stop linear gradient', layer:0, pass:0, atoms:['gradient','field'],
        params:{ A:{axis:'vertical',stops:[[0,'#FA8F17'],[1,'#F5701F']]}, B:{axis:'vertical',stops:[[0,'#23B5F2'],[0.6,'#137AD7']]}, C:{axis_deg:66, length_u:743, stops:[[0.15,'#080909'],[0.34,'#7D1315'],[0.45,'#D72532'],[0.56,'#F05277'],[0.67,'#F39FB6'],[1,'#DEC2D1']]} },
        implementation:'Each panel starts as a canvas linear gradient; C runs from the panel top-left along 66° from horizontal, with knee stops so black holds to 0.15 and pink holds from 0.67.' },
      { id:'soft-mask', short:'MASK', name:'Blurred shape mask', layer:1, pass:1, atoms:['mask','blur','shape'],
        params:{ shape:'closed spline through 13 measured contour points, off-panel to the left and below', edge_sigma_u:33, halo_sigma_u:110, halo_colour:'#D71E3D', halo_strength:'four source-over passes of the wide blur: 1 − (1 − h)⁴', mask_colour:'#080808' },
        implementation:'The shape is drawn twice on padded offscreens: once in crimson and blurred wide (σ 110 u), drawn four times to tint the field; once in black and blurred σ 33 u, drawn over. The wide blur is the halo that reddens the gradient near the black.' },
      { id:'ripple-band', short:'RIPL', name:'Concentric ripple band', layer:1, pass:2, atoms:['grating','radial','envelope','blur'],
        params:{ arc:'y = q + (x − cx(q))² / 2R, R 750 u, cx(q) = 217 − 0.8·max(0, q − 233) u (panel-local)', pitch_u:32, phase_zero_u:262, dark_profile:'sstep(t0, t0+0.3, 0.5+0.5·cos 2π(q−q0)/pitch), t0 = 0.72 − 0.5·e', envelope:'e = 0.15 + 0.85·sstep(0, 250, q)^1.2 above q 250; 1 for q 250–433; falls to 0.1 over 433–467', right_cut:'e fades where x > 333 − 2·max(0, q − 296), over 150 u', light_stripes:'(0.7·e in the band, 0.15 above)·(1−s)^2.5 toward #78BCEC', blur_u:3.3, dark:'#090B43', light:'#78BCEC' },
        implementation:'Per pixel: solve q, the peak height of the arc through the pixel (three fixed-point steps, since the peak x depends on q); darkness = envelope(q) × a thresholded cosine of q whose threshold rises as the envelope falls, so the stripes thin to points where the window cuts off on the right; light stripes sit at the opposite phase. The layer is blurred 3.3 u.' },
      { id:'film-grain', short:'GRAN', name:'Additive film grain', layer:2, pass:3, atoms:['grain','noise','additive'],
        params:{ additive:'uniform ±21·(1 − 0.6·L)/255 per pixel, mono, lag-1 correlation 0.25', multiplicative:'ART.grain mono:false amp 0.05 (color speckle)', pitch_px:1, seed:909, measured_std:{black:15.8,blue:10.5,orange:6.0,pink:6.5,'R·G correlation':0.98} },
        implementation:'One pass over the whole canvas after every panel is drawn: a mono additive noise scaled down with luminance (it reads in the black, thins in the pink), plus a small per-channel multiplicative term for the color speckle.' },
      { id:'caption-label', short:'CAPT', name:'Corner caption', layer:3, pass:4, atoms:['lettering','sans','caption'],
        params:{ font:'Inter 400', size_u:22, inset_u:14, positions:['panel 1 bottom-left, baseline 523 u','panel 2 bottom-right, baseline 610 u','panel 3 top-right, baseline 172 u'], color:'white or pale tint at 0.55–0.72 alpha' },
        implementation:'Three short captions in Inter at 22 u, set flat under the grain so the grain sits on the type too.' }
    ],
    pass_order:['gradients · three panels, canvas linear gradients','soft mask · halo blur ×4, then the black blur, clipped to panel 1','ripple band · per-pixel arcs on panel 2, blurred 3.3 u','captions · Inter 22 u in the corners','grain · additive mono + per-channel multiplicative, whole sheet'],
    notes:['Measured on ref.png: mask edge 10–90 % over 100 px (83 u) → σ ≈ 40 px; halo reaches orange at ≈ 300 px from the edge; ripple pitch 38 px throughout; arcs peak at panel-local x ≈ 250 above the band, sliding to x ≈ 150 at y 400 and x ≈ 40 at y 450; sag ≈ 37 px over 240 px (R ≈ 800 px); dark band y 300–460 at x 600, tips end at x 710, 660, 560 for the three lowest arcs; panel 3 axis 66° from horizontal; grain std 15.8 in black, 10.5 in blue, 6 in orange and pink, R·G correlation 0.98 (near mono, additive).','Captions: cap height 19 px → 26 px font (22 u). Words are invented. Seed 909.']
  },
  render(canvas,w,h,dpr,V){
    const A=window.ART; const W=canvas.width,H=canvas.height; const u=W/1000; const x=canvas.getContext('2d'); x.setTransform(1,0,0,1,0,0);
    const pw=W/3, k=pw/400; const px0=[0,Math.round(pw),Math.round(2*pw),W];
    // ---- pass 0 · gradients
    let g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,V.p1[0]); g.addColorStop(1,V.p1[1]); x.fillStyle=g; x.fillRect(0,0,px0[1],H);
    g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,V.p2[0]); g.addColorStop(0.6,V.p2[1]); g.addColorStop(1,V.p2[1]); x.fillStyle=g; x.fillRect(px0[1],0,px0[2]-px0[1],H);
    const ax=Math.cos(66*Math.PI/180), ay=Math.sin(66*Math.PI/180), L3=892*k;
    g=x.createLinearGradient(px0[2],0,px0[2]+ax*L3,ay*L3); for(const s of V.p3)g.addColorStop(s[0],s[1]); x.fillStyle=g; x.fillRect(px0[2],0,W-px0[2],H);
    // ---- pass 1 · soft mask (panel 1)
    const PTS=[[-300,185],[-60,185],[0,185],[131,200],[194,240],[233,280],[260,320],[277,360],[285,400],[289,440],[288,480],[284,560],[281,640],[276,720],[274,760],[272,820],[272,1100],[-300,1100]];
    const shape=(c,col)=>{ c.fillStyle=col; c.beginPath(); c.moveTo(PTS[0][0],PTS[0][1]); const n=PTS.length; for(let i=0;i<n-1;i++){ const p0=PTS[Math.max(i-1,0)],p1=PTS[i],p2=PTS[i+1],p3=PTS[Math.min(i+2,n-1)]; c.bezierCurveTo(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,p2[0],p2[1]); } c.closePath(); c.fill(); };
    const sHalo=110*u, sEdge=33*u; const pad=Math.ceil(3*sHalo);
    const mk=(col)=>{ const c=A.off(pw+2*pad,H+2*pad); const cx=c.getContext('2d'); cx.setTransform(k,0,0,k,pad,pad); shape(cx,col); return c; };
    const halo=A.blur(mk(V.halo),sHalo), edge=A.blur(mk(V.mask),sEdge);
    x.save(); x.beginPath(); x.rect(0,0,px0[1],H); x.clip(); for(let i=0;i<4;i++)x.drawImage(halo,-pad,-pad); x.drawImage(edge,-pad,-pad); x.restore();
    // ---- pass 2 · ripple band (panel 2)
    { const x0=px0[1], PW=px0[2]-px0[1]; const id=x.createImageData(PW,H); const d=id.data;
      const base0=A.hex(V.p2[0]), base1=A.hex(V.p2[1]), dark=A.hex(V.dark), light=A.hex(V.light);
      // arcs: y = q + (x − cx(q))² / 2r  → q is the arc's peak height (ref px, panel-local); the peak slides left below q = 280
      const RAD=900, pitch=38, cxOf=q=>Math.max(-60,260-0.8*Math.max(0,q-280));
      for(let y=0;y<H;y++){ const ly=y/k; const tv=Math.min(1,ly/800/0.6); const bR=base0[0]+(base1[0]-base0[0])*tv, bG=base0[1]+(base1[1]-base0[1])*tv, bB=base0[2]+(base1[2]-base0[2])*tv;
        for(let X=0;X<PW;X++){ const lx=X/k; let q=ly; for(let it=0;it<3;it++){ const cx=cxOf(q); q=ly-(lx-cx)*(lx-cx)/(2*RAD); }
          const s=0.5+0.5*Math.cos(6.2831853*(q-314)/pitch);
          let e; if(q<300) e=0.15+0.85*Math.pow(A.sstep(0,300,q),1.2); else if(q<520) e=1; else e=1-0.9*A.sstep(520,560,q);
          const cut=400-2.0*Math.max(0,q-355); e*=1-A.sstep(cut-150,cut+30,lx);
          const t0=0.72-0.5*e; const dk=e*A.sstep(t0,t0+0.3,s);
          const lt=(0.7*A.sstep(200,320,q)*e+0.15*(1-A.sstep(200,320,q)))*Math.pow(1-s,2.5);
          let R=bR+(dark[0]-bR)*dk, G=bG+(dark[1]-bG)*dk, B=bB+(dark[2]-bB)*dk; R+=(light[0]-R)*lt; G+=(light[1]-G)*lt; B+=(light[2]-B)*lt;
          const i=(y*PW+X)*4; d[i]=R; d[i+1]=G; d[i+2]=B; d[i+3]=255; } }
      const lay=A.off(W,H); lay.getContext('2d').putImageData(id,x0,0); const soft=A.blur(lay,3.3*u);
      x.save(); x.beginPath(); x.rect(x0,0,PW,H); x.clip(); x.drawImage(soft,0,0); x.restore(); }
    // ---- pass 3 · captions
    x.font=`400 ${22*u}px Inter, sans-serif`; x.textBaseline='alphabetic';
    x.textAlign='left'; x.fillStyle=V.cap[0]; x.fillText('Three panel set',16*k,628*k);
    x.textAlign='right'; x.fillStyle=V.cap[1]; x.fillText('Plate two of three',px0[2]-16*k,732*k);
    x.fillStyle=V.cap[2]; x.fillText('Forty layered sheets',W-16*k,207*k);
    // ---- pass 4 · film grain (whole sheet)
    A.grain(x,{amp:0.05,pitch:1,seed:909,mono:false});
    { const id=x.getImageData(0,0,W,H); const d=id.data; const seed=909;
      const hash=(X,Y)=>{ let n=(X*374761393+Y*668265263+seed*2246822519)|0; n=(n^(n>>>13))*1274126177|0; n=n^(n>>>16); return ((n>>>0)/4294967296)*2-1; };
      const N=new Float32Array(W*H); for(let y=0;y<H;y++)for(let X=0;X<W;X++){ N[y*W+X]=0.78*hash(X,y)+0.22*0.5*(hash(X-1,y)+hash(X,y-1)); }
      for(let y=0;y<H;y++)for(let X=0;X<W;X++){ const i=(y*W+X)*4; const Lm=(d[i]*0.2126+d[i+1]*0.7152+d[i+2]*0.0722)/255; const a=21*(1-0.6*Lm)*N[y*W+X]; d[i]=A.clamp(d[i]+a,0,255); d[i+1]=A.clamp(d[i+1]+a,0,255); d[i+2]=A.clamp(d[i+2]+a,0,255); }
      x.putImageData(id,0,0); }
  }
};
