window.STUDY={
  id:'ts-12-perforated-stamp', code:'TS-12', fig:'1.12',
  title:'Perforated stamp with halftone title',
  kicker:'Technique · TS-12',
  lede:'A red stamp bitten round the edge, a rotated title filled with dots.',
  body:[
    'One red stamp on black. A rectangle with semicircular bites at fixed pitch along every edge, corner to corner; the red carries tooth and a faint mottle. A display title runs up the left edge, quarter-turned, and overhangs the top so the perforation cuts it.',
    'The title is not a flat fill: a dark texture is screened as a 45° dot grid, dot size following the texture, shown only inside the letters. A white script credit sits right of center. A soft shadow lifts the stamp off the ground.'
  ],
  source:'Reference 12 · red perforated stamp poster, 736 × 920',
  spot:[232,36,27], ref:{w:736,h:920},
  variantLabel:'Color',
  variants:[
    { id:'ref',   label:'As reference', sw:['#E8241B','#2A2418','#FFFFFF'], spot:[232,36,27], ground:'#000000', stamp:'#E8241B', htDark:'#1C1812', htMid:'#4A3E22', htLight:'#A08A4A', credit:'#FFFFFF' },
    { id:'io',    label:'Ember',        sw:['#F4551E','#101014','#FFFFFF'], spot:[244,85,30], ground:'#101014', stamp:'#F4551E', htDark:'#101014', htMid:'#2A2A32', htLight:'#5A5A66', credit:'#FFFFFF' },
    { id:'blue',  label:'Blue',         sw:['#2F5AE6','#101014','#FFFFFF'], spot:[47,90,230], ground:'#101014', stamp:'#2F5AE6', htDark:'#101014', htMid:'#2A2A32', htLight:'#5A5A66', credit:'#FFFFFF' }
  ],
  points:[
    {u:0.50,v:0.10,d:'PERF',label:'Perforation · semicircular bites, pitch 62 u, radius 19 u',t:'perforation',dir:[1,-1]},
    {u:0.84,v:0.50,d:'PERF',label:'Right edge · 16 bites down, one on each corner',t:'perforation',dir:[1,0]},
    {u:0.16,v:0.10,d:'PERF',label:'Corner bite · the title is cut by the same clip',t:'perforation',dir:[-1,-1]},
    {u:0.30,v:0.30,d:'HALF',label:'Halftone fill · 45° dot screen, pitch 7 u, dot size from a fbm texture',t:'halftone-fill',dir:[1,-1]},
    {u:0.30,v:0.62,d:'HALF',label:'Dot floor · smallest dots keep the letter dark, never open',t:'halftone-fill',dir:[1,1]},
    {u:0.32,v:0.85,d:'ROTD',label:'Rotated display · Archivo 900, −90°, cap height ≈ 215 u',t:'rotated-display',dir:[1,1]},
    {u:0.22,v:0.15,d:'ROTD',label:'Overhang · the word starts above the stamp top and is clipped',t:'rotated-display',dir:[-1,1]},
    {u:0.62,v:0.46,d:'SCRP',label:'Credit · two lines, white, skew −12°, 30 u',t:'script-credit',dir:[1,-1]},
    {u:0.66,v:0.72,d:'TOOTH',label:'Paper tooth · mono grain amp 0.05 on 1 px cells',t:'paper-tooth',dir:[1,1]},
    {u:0.50,v:0.84,d:'TOOTH',label:'Mottle · low-frequency fbm, ±4 % on the red',t:'paper-tooth',dir:[-1,1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[736,920], grammar:'one red stamp on black; scalloped perforation all round; rotated serif display title filled with a coarse halftone texture, overhanging the top; white script credit right of center; paper tooth on the red' },
    units:'design units, 1000 = sheet width',
    palette:{ ground:'#000000', stamp:'#E8241B', halftone_dark:'#1C1812', halftone_light:'#A08A4A', credit:'#FFFFFF' },
    techniques:[
      { id:'perforation', short:'PERF', name:'Scalloped perforation', layer:1, pass:1, atoms:['clip','bite','pitch'],
        params:{ stamp_u:[158,125,683,993], pitch_u:62, bite_radius_u:19, bites:'12 across × 17 down, one centred on each corner', ref_px:{pitch:45.6,radius:14} },
        implementation:'The stamp is painted as a rectangle on its own layer, then a circle at every pitch step along all four edges is punched out with destination-out; the punched layer is the clip for everything on the stamp.' },
      { id:'halftone-fill', short:'HALF', name:'Halftone texture fill', layer:3, pass:3, atoms:['screen','dot','fbm'],
        params:{ screen_angle_deg:45, pitch_u:7, texture:'perlin fbm, 4 octaves, scale 70 u', dot_radius:'0.5·pitch·(0.22 + 0.9·t), t = clamp(0.5 + 3·fbm)', color:'lut dark→mid→light by lightness', ref_px:{pitch:'≈4.5'} },
        implementation:'Inside the letter mask a dark base is laid first; then a 45° dot lattice is walked and each dot is drawn with radius and color taken from the texture value at its center, so light patches of the texture become large tan dots.' },
      { id:'rotated-display', short:'ROTD', name:'Rotated display title', layer:3, pass:3, atoms:['type','rotate','overhang'],
        params:{ font:'Archivo 900, wdth 62.5 (extra-condensed; substitute for the reference condensed serif)', angle_deg:-90, cap_height_u:'≈ 215 (size fitted so the run is 1003 u)', baseline_x_u:400, start_y_u:1088, overhang:'run ends 40 u above the stamp top' },
        implementation:'The title is drawn once into a mask canvas rotated −90° about its start point; the halftone is composited through it with destination-in, then the result is drawn on the stamp layer under the perforation clip.' },
      { id:'script-credit', short:'SCRP', name:'Script credit', layer:4, pass:4, atoms:['type','skew'],
        params:{ font:'Inter 500 (no script face inlined), skew −12°', size_u:30, lines:2, centre_u:[620,560], line_gap_u:34, color:'#FFFFFF' },
        implementation:'Two invented lines centred on a point right of the middle, skewed −12° to stand in for the italic script; drawn after the grain so the white stays clean.' },
      { id:'paper-tooth', short:'TOOTH', name:'Paper tooth and mottle', layer:2, pass:2, atoms:['grain','mottle'],
        params:{ grain:'mono, amp 0.05, pitch 1 device px, seed 12', mottle:'fbm 3 octaves, scale 260 u, ±0.04 multiply', ref_px:{red_std:'≈9/255 in R'} },
        implementation:'Before the perforation punch the stamp layer is multiplied by a low-frequency fbm and then by ART.grain, so both tooth and mottle follow the stamp and stop at the bites.' }
    ],
    pass_order:['ground · flat black','shadow · blurred stamp rectangle, offset 6 u, alpha 0.55','stamp · red rectangle + mottle + grain on a layer','title · Archivo 900 mask, halftone through the mask, drawn on the stamp layer','perforation · destination-out circles at pitch along every edge','credit · white Inter 500 skewed −12°'],
    notes:['Measured on ref.png: stamp 116–619 × 92–823 px; bite pitch 45.6 px (62 u), bite width 28 px so radius 14 px (19 u), 11 bites across and 16 down between corner bites; red (235,43,43) mean in flat areas, R std 9; halftone dot pitch ≈ 4.5 px, dark texture (81,61,47) mean with tan speckle.','The reference title is a bold serif and the credit a script; neither is inlined, so the title is Archivo 900 at wdth 62.5 (the reference serif is condensed) and the credit is Inter 500 with a −12° skew. Words are invented.','Seed 12.']
  },
  render(canvas,w,h,dpr,V){
    const A=window.ART; const W=canvas.width,H=canvas.height; const u=W/1000; const x=canvas.getContext('2d');
    const S=[158*u,125*u,683*u,993*u]; const pitch=62*u, br=19*u;
    const nx=Math.round(S[2]/pitch), ny=Math.round(S[3]/pitch); const px=S[2]/nx, py=S[3]/ny;
    // ground
    x.setTransform(1,0,0,1,0,0); x.fillStyle=V.ground; x.fillRect(0,0,W,H);
    // stamp layer
    const L=A.off(W,H); const lx=L.getContext('2d');
    lx.fillStyle=V.stamp; lx.fillRect(S[0],S[1],S[2],S[3]);
    // mottle (low-frequency fbm multiply, ±4 %)
    { const P=A.perlin(1201); const id=lx.getImageData(S[0]|0,S[1]|0,Math.ceil(S[2]),Math.ceil(S[3])); const d=id.data; const cw=id.width,ch=id.height; const sc=1/(260*u); const step=3;
      const rows=Math.ceil(ch/step)+1, cols=Math.ceil(cw/step)+1; const M=new Float32Array(rows*cols);
      for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)M[j*cols+i]=1+0.04*P.fbm(i*step*sc,j*step*sc,3,0.55)*2;
      for(let yy=0;yy<ch;yy++){ const j=(yy/step)|0; for(let xx=0;xx<cw;xx++){ const i=(yy*cw+xx)*4; const m=M[j*cols+((xx/step)|0)]; d[i]*=m; d[i+1]*=m; d[i+2]*=m; } }
      lx.putImageData(id,S[0]|0,S[1]|0); }
    A.grain(lx,{amp:0.05,pitch:Math.max(1,Math.round(dpr)),seed:12,mono:true});
    // title mask: Archivo 900 rotated -90°
    const baseX=400*u, startY=(S[1]+S[3]-30*u); const word='River Towns'; const runLen=S[3]-30*u+40*u;
    const Mk=A.off(W,H); const mx=Mk.getContext('2d');
    const fs=A.fitText(mx,word,s=>`900 extra-condensed ${s}px Archivo`,runLen,400*u); const cap=fs*0.72;
    mx.font=`900 extra-condensed ${fs}px Archivo`; mx.fillStyle='#fff'; mx.textBaseline='alphabetic'; const tw=mx.measureText(word).width;
    mx.save(); mx.translate(baseX,startY); mx.rotate(-Math.PI/2); mx.fillText(word,0,0); mx.restore();
    const bb={x0:baseX-cap*1.05,x1:baseX+cap*0.35,y0:startY-tw,y1:startY};
    // halftone layer through the mask
    const Ht=A.off(W,H); const hx=Ht.getContext('2d');
    hx.fillStyle=V.htDark; hx.fillRect(bb.x0,Math.max(0,bb.y0),bb.x1-bb.x0,bb.y1-Math.max(0,bb.y0));
    { const P=A.perlin(77); const lut=A.lut([[0,V.htDark],[0.5,V.htMid],[1,V.htLight]]); const p=7*u; const c=Math.SQRT1_2; const sc=1/(70*u);
      const cx=(bb.x0+bb.x1)/2, cy=(bb.y0+bb.y1)/2; const R=Math.hypot(bb.x1-bb.x0,bb.y1-bb.y0)/2; const n=Math.ceil(R/p)+1;
      for(let i=-n;i<=n;i++)for(let j=-n;j<=n;j++){ const X=cx+(i-j)*p*c, Y=cy+(i+j)*p*c; if(X<bb.x0-p||X>bb.x1+p||Y<bb.y0-p||Y>bb.y1+p)continue;
        let t=A.clamp(0.5+3.0*P.fbm(X*sc,Y*sc,4,0.55),0,1); const r=0.5*p*(0.22+0.9*t); const k=lut[(t*255)|0];
        hx.fillStyle=A.rgb(k); hx.beginPath(); hx.arc(X,Y,r,0,6.2832); hx.fill(); } }
    hx.globalCompositeOperation='destination-in'; hx.drawImage(Mk,0,0); hx.globalCompositeOperation='source-over';
    // title on the stamp, clipped to the stamp rectangle (bites punched next)
    lx.save(); lx.beginPath(); lx.rect(S[0],S[1],S[2],S[3]); lx.clip(); lx.drawImage(Ht,0,0); lx.restore();
    // perforation: punch bites along all four edges
    lx.globalCompositeOperation='destination-out'; lx.fillStyle='#000'; lx.beginPath();
    for(let i=0;i<=nx;i++){ const X=S[0]+i*px; lx.moveTo(X+br,S[1]); lx.arc(X,S[1],br,0,6.2832); lx.moveTo(X+br,S[1]+S[3]); lx.arc(X,S[1]+S[3],br,0,6.2832); }
    for(let j=1;j<ny;j++){ const Y=S[1]+j*py; lx.moveTo(S[0]+br,Y); lx.arc(S[0],Y,br,0,6.2832); lx.moveTo(S[0]+S[2]+br,Y); lx.arc(S[0]+S[2],Y,br,0,6.2832); }
    lx.fill(); lx.globalCompositeOperation='source-over';
    // shadow under the stamp, then the stamp
    const sh=A.off(W,H); const sx=sh.getContext('2d'); sx.fillStyle='rgba(0,0,0,0.55)'; sx.drawImage(L,6*u,8*u); sx.globalCompositeOperation='source-in'; sx.fillRect(0,0,W,H);
    x.drawImage(A.blur(sh,10*u),0,0);
    x.drawImage(L,0,0);
    // script credit: Inter 500, skew -12°
    const cs=30*u; const cx=620*u, cy=560*u;
    x.save(); x.translate(cx,cy); x.transform(1,0,Math.tan(-12*Math.PI/180),1,0,0); x.font=`500 ${cs}px Inter`; x.fillStyle=V.credit; x.textAlign='center'; x.textBaseline='middle';
    x.fillText('Hollis Rane &',0,-17*u); x.fillText('Perry Adair',0,17*u); x.restore();
  }
};
