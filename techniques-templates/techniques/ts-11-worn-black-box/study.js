window.STUDY={
  id:'ts-11-worn-black-box', code:'TS-11', fig:'1.11',
  title:'Worn black box',
  kicker:'Technique · TS-11',
  lede:'Two board panels, abraded at every edge, with stickers and a barcode.',
  body:[
    'A black-board box, front and back. Each panel is a flat fill with a low mottle and sparse one-pixel speckle. Wear is a per-pixel threshold: the chance of a lighter pixel falls off exponentially with distance from the silhouette, a fold and a corner, gated by a patch field so some runs of edge are heavy and others clean.',
    'On the board sit the printed layers — a cream flap and label, a torn orange price sticker, a round foil sticker, a white barcode block, rows of small mono metadata. One grain pass ties them together.'
  ],
  source:'Reference 11 · worn black cardboard box mock-up, front and back, 1200 × 800',
  spot:[240,138,28], ref:{w:1200,h:800},
  variantLabel:'Color',
  variants:[
    { id:'ref',   label:'As reference', sw:['#111111','#D9D0B8','#F08A1C'], spot:[240,138,28], ground:'#000000', board:'#151819', scuff:'#FFFFFF', ink:'#FFFFFF', flap:'#D9D0B8', flapInk:'#1A1712', flapScuff:'#6E6654', sticker:'#F08A1C', stickerInk:'#1A1712', label:'#F2F0EA', labelInk:'#141414', holo:true },
    { id:'io',    label:'Ø ink',        sw:['#101014','#FFFFFF','#F4551E'], spot:[244,85,30], ground:'#000000', board:'#101014', scuff:'#FFFFFF', ink:'#FFFFFF', flap:'#FFFFFF', flapInk:'#101014', flapScuff:'#8A8A90', sticker:'#F4551E', stickerInk:'#101014', label:'#FFFFFF', labelInk:'#101014', holo:true },
    { id:'paper', label:'Paper',        sw:['#F6F5F2','#101014','#2F5AE6'], spot:[47,90,230], ground:'#B9B6AE', board:'#F6F5F2', scuff:'#101014', ink:'#101014', flap:'#101014', flapInk:'#F6F5F2', flapScuff:'#F6F5F2', sticker:'#2F5AE6', stickerInk:'#FFFFFF', label:'#101014', labelInk:'#F6F5F2', holo:false, wear:0.4 }
  ],
  points:[
    {u:0.40,v:0.42,d:'BORD',label:'Board · flat fill, mottle ±3 %, speckle 0.06 % of pixels',t:'board-panel',dir:[1,-1]},
    {u:0.222,v:0.60,d:'SCUF',label:'Edge scuff · density 1.1·exp(−d/2.5 u) at the silhouette, clumped by a 2 u noise',t:'edge-scuff',dir:[-1,0]},
    {u:0.494,v:0.868,d:'SCUF',label:'Corner wear · extra 0.6·exp(−d/16 u) from each corner',t:'edge-scuff',dir:[1,1]},
    {u:0.278,v:0.50,d:'SCUF',label:'Fold scuff · the spine crease wears like an edge, radius 1.6 u',t:'edge-scuff',dir:[-1,1]},
    {u:0.62,v:0.31,d:'CRSE',label:'Crease line · 0.9 u stroke at 11 % over a 1.5 px blur',t:'crease-line',dir:[1,-1]},
    {u:0.334,v:0.683,d:'STCK',label:'Price sticker · 55 × 37 u, torn edge, −6°, shadow 2 u',t:'sticker-layer',dir:[-1,1]},
    {u:0.533,v:0.75,d:'STCK',label:'Foil sticker · r 18 u, 36 hue wedges + highlight',t:'sticker-layer',dir:[-1,1]},
    {u:0.62,v:0.80,d:'BARC',label:'Barcode block · 88 × 39 u white box, 46 bars, mono digits',t:'barcode-block',dir:[1,1]},
    {u:0.63,v:0.74,d:'META',label:'Metadata rows · JetBrains Mono 3.6 u, two rows',t:'edge-metadata',dir:[1,-1]},
    {u:0.535,v:0.53,d:'META',label:'Spine text · rotated −90°, Archivo 700, 8 u caps',t:'edge-metadata',dir:[-1,0]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1200,800], grammar:'two board panels on black: flat near-black board, white abrasion at every edge, fold and corner, sparse speckle, cream top flap with label, orange torn price sticker, holographic round sticker, white barcode block, small mono metadata, white sans headline' },
    units:'design units, 1000 = sheet width (1 u = 1.2 ref px)',
    palette:{ ground:'#000000', board:'#151819', scuff:'#FFFFFF', flap:'#D9D0B8', sticker:'#F08A1C', label:'#F2F0EA', ink:'#FFFFFF' },
    techniques:[
      { id:'board-panel', short:'BORD', name:'Board panel', layer:0, pass:0, atoms:['flat','mottle','speckle','silhouette'],
        params:{ front:{ spine_u:[222,278], face_u:[278,494], body_v:[180,579], flap_v:[125,180], tuck:{x:[287,486],y:[84,125],r:20}, tab:{x:[234,278],y:[136,180]} }, back:{ spine_u:[507,563], face_u:[563,778], body_v:[180,581], flap:{x:[508,768],y:[125,180]}, tab:{x:[729,778],y:[136,180]}, tuck:{x:[517,713],y:[87,125],r:20} }, board:'#151819', mottle:'fbm 3 oct, cell 70 u, ±3 %', shade:'+3 % toward scuff color from v 280 to 580', speckle:'0.0006 per pixel, t 0.3–0.6' },
        implementation:'Each panel is a union of rectangles (spine, face, flap, tab, rounded tuck) tested per pixel; the fill is the board color mixed 3 % toward the scuff color by a perlin mottle and a vertical shade, plus sparse one-pixel dots.' },
      { id:'edge-scuff', short:'SCUF', name:'Edge scuff', layer:1, pass:1, atoms:['distance-field','threshold','noise'],
        params:{ edge:'1.1·exp(−d/2.5 u) + 0.1·exp(−d/10 u)', haze:'continuous tint 0.14·exp(−d/3 u) + 0.12·exp(−dc/14 u) + 0.06·exp(−df/2.5 u) under the dots', corner:'0.6·exp(−dc/16 u)', fold:'0.5·exp(−df/1.6 u) + 0.08·exp(−df/8 u)', gate:'0.15 + 0.85·smoothstep(0.3, 0.8, 0.5+0.5·fbm(p/18 u))', clump:'2.2·smoothstep(0.3, 0.72, 0.5+0.5·fbm(x/2.4 u, y/1.6 u))', dust:'0.006·exp(−d/10 u), speckle 0.0003', value:'t = 0.2 + 0.75·r^1.6 toward scuff color', seed:1101 },
        implementation:'A chamfer distance transform gives d to the silhouette; dc is the distance to the nearest convex corner or fold junction and df to the spine crease or flap fold. A pixel turns lighter where a uniform random is below the summed density times the patch gate, so the wear reads as clustered abrasion rather than a line.' },
      { id:'crease-line', short:'CRSE', name:'Crease line', layer:1, pass:2, atoms:['stroke','blur'],
        params:{ count_per_panel:3, width_u:0.9, alpha:0.11, blur_px:1.5, path:'quadratic, 2 control points, length 120–220 u' },
        implementation:'Faint diagonal strokes in the scuff color on a separate layer, blurred 1.5 px, then composited so the edges are soft.' },
      { id:'sticker-layer', short:'STCK', name:'Sticker layer', layer:2, pass:3, atoms:['polygon','shadow','arc-gradient'],
        params:{ price:{ size_u:[55,37], rotate_deg:-6, corner_u:3, tear:'jittered polygon, 2 u amplitude on the bottom and right edges', shadow:'rgba(0,0,0,0.5) offset 2 u blur 3 u' }, foil:{ r_u:18, wedges:36, highlight:'radial white 0.55 at 35 % offset', ring:'dashed 0.8 u' }, label:{ size_u:[54,62], rotate_deg:3, band:'sticker color 12 u' }, flap_label:{ size_u:[86,34], color:'#E8E6DE 0.9' } },
        implementation:'Each sticker is a filled path drawn over the worn board with its own drop shadow; the foil is 36 hue wedges on arcs under a radial highlight.' },
      { id:'barcode-block', short:'BARC', name:'Barcode block', layer:2, pass:3, atoms:['bars','box','mono'],
        params:{ box_u:[88,39], bars:46, bar_w_u:'0.7–2.4 random (seed 1103)', gap_u:'0.6–1.6', digits:'JetBrains Mono 3.2 u under the bars', mini:{ bars:24, box_u:[31,16] } },
        implementation:'A white box, then random-width dark bars from a seeded sequence; the digit row is mono type below the bars.' },
      { id:'edge-metadata', short:'META', name:'Edge metadata', layer:2, pass:3, atoms:['type','rotate','mono'],
        params:{ headline:'Archivo 700, 32 u, 4 lines, pitch 37 u, at (340, 322)', flap_line:'Archivo 700, 6 u caps, centred', back_title:'Archivo 700, 10 u', body:'Inter 400, 4.6 u, 15 lines, width 92 u', meta_rows:'JetBrains Mono 3.6 u, two rows with boxed keys', spine:'Archivo 700, 8 u, rotated −90° on both spines', marks:'4-point star, globe, QR block, star box' },
        implementation:'All lettering is live type in the three inlined fonts with invented plain words; spine text is drawn on a rotated context.' }
    ],
    pass_order:['ground · flat fill','board · region test, mottle, shade, speckle per pixel','scuff · distance transform, corner and fold distances, threshold per pixel','crease · blurred strokes','print · flap label, headline, spine type, body text, meta rows','stickers · price, foil, label, with shadows','barcode · box, bars, digits, icon row','grain · mono, amp 0.05'],
    notes:['Measured on ref.png: board (21,24,25); scuff pixels mean lum 119; edge scuff density 0.3–0.6 in the first 2 px, 0 by 8 px; bottom corners 20–25 % light pixels in a 20 px square; interior speckle 0.06 % of pixels; orange sticker (243,153,63), 65 × 45 px; foil sticker r ≈ 23 px; barcode box 105 × 46 px; headline cap 28 px, pitch 44 px.','Seeds 1101 (scuff), 1102 (mottle), 1103 (bars), 1104 (crease).']
  },
  render(canvas,w,h,dpr,V){
    const A=window.ART; const W=canvas.width,H=canvas.height; const u=W/1000; const x=canvas.getContext('2d');
    const ground=A.hex(V.ground), board=A.hex(V.board), scuff=A.hex(V.scuff), flap=A.hex(V.flap), flapScuff=A.hex(V.flapScuff);
    /* ---- geometry (design units) ---- */
    const PL={ x0:222, sp:278, x1:494, y0:180, y1:579, flap:{x0:278,x1:494,y0:125,y1:180}, tab:{x0:234,x1:278,y0:136,y1:180}, tuck:{x0:287,x1:486,y0:84,y1:125,r:20} };
    const PR={ x0:507, sp:563, x1:778, y0:180, y1:581, flap:{x0:508,x1:768,y0:125,y1:180}, tab:{x0:729,x1:778,y0:136,y1:180}, tuck:{x0:517,x1:713,y0:87,y1:125,r:20} };
    const inR=(X,Y,r)=>X>=r.x0&&X<r.x1&&Y>=r.y0&&Y<r.y1;
    const inTuck=(X,Y,t)=>{ if(!inR(X,Y,t))return false; const r=t.r; if(Y<t.y0+r){ if(X<t.x0+r) return Math.hypot(X-(t.x0+r),Y-(t.y0+r))<=r; if(X>t.x1-r) return Math.hypot(X-(t.x1-r),Y-(t.y0+r))<=r; } return true; };
    const region=(X,Y)=>{ // 0 none · 1 board L · 2 board R · 3 flap R
      if(X<PL.x0||X>=PR.x1||Y<84||Y>=PR.y1)return 0;
      if(X<PL.x1+6){ if(X>=PL.x0&&X<PL.x1&&Y>=PL.y0&&Y<PL.y1)return 1; if(inR(X,Y,PL.flap)||inR(X,Y,PL.tab)||inTuck(X,Y,PL.tuck))return 1; return 0; }
      if(X>=PR.x0){ if(X<PR.x1&&Y>=PR.y0&&Y<PR.y1)return 2; if(inR(X,Y,PR.flap)||inR(X,Y,PR.tab)||inTuck(X,Y,PR.tuck))return 3; }
      return 0; };
    const corners=[ [222,180,1],[222,579,1],[494,579,1],[494,125,1],[278,125,0.9],[234,136,0.8],[278,136,0.6],[287,125,0.8],[486,125,0.8],[234,180,0.5],
                    [507,581,1],[778,581,1],[778,136,1],[768,125,0.9],[508,125,1],[729,136,0.6],[517,125,0.8],[713,125,0.8],[507,180,0.6] ];
    /* ---- noise fields on a coarse grid (4 device px) ---- */
    const G=4, gw=Math.ceil(W/G)+1, gh=Math.ceil(H/G)+1; const Pn=A.perlin(1101), Pm=A.perlin(1102);
    const gate=new Float32Array(gw*gh), mot=new Float32Array(gw*gh); const G2=2, g2w=Math.ceil(W/G2)+1, g2h=Math.ceil(H/G2)+1; const fine=new Float32Array(g2w*g2h); const Pf=A.perlin(1109);
    for(let j=0;j<g2h;j++)for(let i=0;i<g2w;i++){ const xu=i*G2/u, yu=j*G2/u; fine[j*g2w+i]=2.2*A.sstep(0.3,0.72,0.5+0.5*Pf.fbm(xu/2.4,yu/1.6,2)); }
    for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){ const xu=i*G/u, yu=j*G/u; gate[j*gw+i]=0.15+0.85*A.sstep(0.3,0.8,0.5+0.5*Pn.fbm(xu/18,yu/18,3)); mot[j*gw+i]=Pm.fbm(xu/70,yu/70,3)+0.35*Pm.fbm(xu/9+40,yu/9,2); }
    /* ---- region map + chamfer distance to the silhouette ---- */
    const reg=new Uint8Array(W*H); const D=new Float32Array(W*H); const INF=1e9;
    for(let y=0;y<H;y++)for(let X=0;X<W;X++){ const k=y*W+X; const r=region(X/u,y/u); reg[k]=r; D[k]=r?INF:0; }
    for(let y=0;y<H;y++)for(let X=0;X<W;X++){ const k=y*W+X; if(!D[k])continue; let v=D[k]; if(X>0)v=Math.min(v,D[k-1]+1); if(y>0){ v=Math.min(v,D[k-W]+1); if(X>0)v=Math.min(v,D[k-W-1]+1.4142); if(X<W-1)v=Math.min(v,D[k-W+1]+1.4142); } D[k]=v; }
    for(let y=H-1;y>=0;y--)for(let X=W-1;X>=0;X--){ const k=y*W+X; if(!D[k])continue; let v=D[k]; if(X<W-1)v=Math.min(v,D[k+1]+1); if(y<H-1){ v=Math.min(v,D[k+W]+1); if(X<W-1)v=Math.min(v,D[k+W+1]+1.4142); if(X>0)v=Math.min(v,D[k+W-1]+1.4142); } D[k]=v; }
    /* pixels on the silhouette (d<1) count as distance 0.5 so the rim itself wears */
    /* ---- per-pixel board + scuff ---- */
    const id=x.createImageData(W,H); const d=id.data; const rnd=A.rng(1101);
    for(let y=0;y<H;y++){ const yu=y/u; const gj=(y/G)|0; for(let X=0;X<W;X++){ const k=y*W+X, i=k*4; const r=reg[k]; let c=ground;
      if(r){ const xu=X/u; const gi=(X/G)|0; const gk=gj*gw+gi; const gt=gate[gk], m=mot[gk], cl=fine[((y/G2)|0)*g2w+((X/G2)|0)];
        const base=r===3?flap:board, sc=r===3?flapScuff:scuff; const P=r===1?PL:PR;
        // mottle + vertical shade + a lighter spine
        // distances
        const du=Math.max(0,D[k]-0.5)/u;
        let dc=1e9; for(let q=0;q<corners.length;q++){ const cq=corners[q]; const dd=Math.hypot(xu-cq[0],yu-cq[1])/cq[2]; if(dd<dc)dc=dd; }
        let df=1e9; if(yu>=P.y0) df=Math.abs(xu-P.sp); if(xu>=P.flap.x0&&xu<P.x1) df=Math.min(df,Math.abs(yu-P.y0)); if(r===1&&xu<P.sp&&xu>=PL.tab.x0) df=Math.min(df,Math.abs(yu-P.y0));
        // mottle + vertical shade + a lighter spine + a soft haze under the wear
        const haze=(0.14*Math.exp(-du/3)+0.12*Math.exp(-dc/14)+0.06*Math.exp(-df/2.5))*gt*(V.wear||1)*(r===3?0.5:1);
        let tint=0.012*m+0.03*A.sstep(280,580,yu)+(xu<P.sp&&r!==3?0.012:0)+haze; c=A.mix(base,sc,A.clamp(tint,-0.02,0.3));
        let dens=((1.1*Math.exp(-du/2.5)+0.1*Math.exp(-du/10))*gt + 0.6*Math.exp(-dc/16)*(0.3+0.7*gt) + (0.5*Math.exp(-df/1.6)+0.08*Math.exp(-df/8))*gt)*cl*(V.wear||1);
        if(r===3) dens*=0.55;
        const rr=rnd();
        if(rr<dens){ const t=0.2+0.75*Math.pow(rnd(),1.6); c=A.mix(c,sc,r===3?t*0.8:t); }
        else if(rr<dens+0.006*Math.exp(-du/10)*gt*cl+0.0003){ const t=0.25+0.35*rnd(); c=A.mix(c,sc,t); }
      }
      d[i]=c[0]; d[i+1]=c[1]; d[i+2]=c[2]; d[i+3]=255; } }
    x.putImageData(id,0,0);
    /* ---- crease lines (blurred layer) ---- */
    { const L=A.off(W,H); const lx=L.getContext('2d'); lx.setTransform(u,0,0,u,0,0); lx.lineCap='round'; const cr=A.rng(1104);
      const creases=[ [352,236,405,300,438,392],[420,548,438,470,466,398],[300,330,296,300,306,236],[606,238,660,330,712,410],[690,560,720,470,752,382],[600,470,640,455,700,447] ];
      for(const c of creases){ lx.beginPath(); lx.moveTo(c[0]+cr()*6,c[1]+cr()*6); lx.quadraticCurveTo(c[2],c[3],c[4]+cr()*6,c[5]+cr()*6); lx.strokeStyle=A.rgb(scuff,0.11); lx.lineWidth=0.9; lx.stroke(); lx.strokeStyle=A.rgb(scuff,0.08); lx.lineWidth=2.4; lx.stroke(); }
      const B=A.blur(L,1.5*dpr); x.setTransform(1,0,0,1,0,0); x.drawImage(B,0,0); }
    /* ---- print layer (design units) ---- */
    x.setTransform(u,0,0,u,0,0); x.lineCap='round'; x.lineJoin='round';
    const ink=V.ink, flapInk=V.flapInk, stk=V.sticker, stkInk=V.stickerInk, lab=V.label, labInk=V.labelInk;
    const F=(wt,s,fam)=>`${wt} ${s}px ${fam||'Archivo'}`;
    const star=(cx,cy,r,col)=>{ x.beginPath(); for(let k=0;k<8;k++){ const a=k*Math.PI/4-Math.PI/2; const rr=k%2?r*0.22:r; x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr); } x.closePath(); x.fillStyle=col; x.fill(); };
    const globe=(cx,cy,r,col,lw)=>{ x.strokeStyle=col; x.lineWidth=lw; x.beginPath(); x.ellipse(cx,cy,r*1.35,r,0,0,6.2832); x.stroke(); for(const f of [0.25,0.55,0.85]){ x.beginPath(); x.ellipse(cx,cy,r*1.35*f,r,0,0,6.2832); x.stroke(); } x.beginPath(); x.moveTo(cx-r*1.35,cy); x.lineTo(cx+r*1.35,cy); x.moveTo(cx,cy-r); x.lineTo(cx,cy+r); x.stroke(); };
    const bars=(bx,by,bw,bh,n,col,seed)=>{ const br=A.rng(seed); let px=bx; const widths=[]; let tot=0; for(let k=0;k<n;k++){ const bw1=0.7+br()*1.7, g=0.6+br(); widths.push([bw1,g]); tot+=bw1+g; } const s=bw/tot; x.fillStyle=col; for(const [bw1,g] of widths){ x.fillRect(px,by,bw1*s,bh); px+=(bw1+g)*s; } };
    // front flap line + tab star + spine badge
    x.fillStyle=ink; x.textAlign='center'; x.textBaseline='middle'; x.font=F(700,7.5); x.fillText('FIELD TAPE 02',386,152);
    star(256,158,7,ink); star(753,158,7,flapInk);
    x.textAlign='left'; x.textBaseline='alphabetic';
    x.strokeStyle=ink; x.lineWidth=1; x.strokeRect(232,184,34,15); x.font=F(900,11); x.fillText('FT',236,196); x.fillStyle=ink; x.fillRect(251,186,13,11); x.fillStyle=A.rgb(board); x.font=F(900,9); x.fillText('C',253,195);
    x.fillStyle=ink; x.font=F(400,3,'"JetBrains Mono"'); x.fillText('type ii · 60 min',232,203);
    // spine text (both panels), rotated −90°
    for(const [sx,sy,str] of [[250,370,'FIELD TAPE 02 · SIDE A'],[535,380,'FIELD TAPE 02 · NOTES']]){ x.save(); x.translate(sx,sy); x.rotate(-Math.PI/2); x.textAlign='center'; x.textBaseline='middle'; x.fillStyle=ink; x.font=F(700,8); x.fillText(str,0,0); x.restore(); }
    // headline, 4 lines
    x.fillStyle=ink; x.font=F(700,32); for(let k=0;k<4;k++) x.fillText(['HOLD','THIS','SIDE','UP'][k],340,322+k*37);
    // back title + body text
    x.font=F(700,10); x.fillText('SHOW THE BACK FIRST',580,237);
    x.font=F(400,4.6,'Inter'); x.fillStyle=ink;
    { const words='This box was handled a lot before the label went on. The board is black on both sides and the wear at the edges is what the light picks up first. Keep the tape in the sleeve when it is not in the deck. Store flat and away from heat. Print run of one hundred and twenty. The price on the front is the shop price and not ours. Return the box with the tape if you send it back and write the reference number on the slip.'.split(' '); let line='', yy=372; for(const wd of words){ const t=line?line+' '+wd:wd; if(x.measureText(t).width>92){ x.fillText(line,580,yy); yy+=5.8; line=wd; } else line=t; } x.fillText(line,580,yy); }
    // meta rows (mono)
    x.font=F(400,3.6,'"JetBrains Mono"'); x.fillStyle=ink; x.fillText('CAT 0031187402',580,493); x.fillStyle=ink; x.fillRect(612,489,9,4.6); x.fillStyle=A.rgb(board); x.font=F(700,3.4,'"JetBrains Mono"'); x.fillText('REF',613,492.8); x.fillStyle=ink; x.font=F(400,3.6,'"JetBrains Mono"'); x.fillText('664120/2',623,493);
    x.strokeStyle=ink; x.lineWidth=0.4; x.strokeRect(580,496,9,4.6); x.font=F(700,3.4,'"JetBrains Mono"'); x.fillText('LOT',581.2,499.8); x.font=F(400,3.6,'"JetBrains Mono"'); x.fillText('220401118  |  2021-03',591,500);
    x.font=F(400,3.2,'"JetBrains Mono"'); x.fillText('packed by hand · north yard',695,504); x.fillText('side b · 22 min',695,509);
    // cream flap print: globe + stars, label sticker
    star(590,106,4.5,flapInk); star(640,106,4.5,flapInk); globe(615,106,6.5,flapInk,0.8);
    x.save(); x.translate(562,155); x.rotate(-0.01); x.shadowColor='rgba(0,0,0,0.35)'; x.shadowBlur=2*u; x.shadowOffsetY=0.8*u; x.fillStyle=A.rgb(A.mix(A.hex(V.label),A.hex(V.flap),0.35),0.92); A.rrect(x,-43,-17,86,34,1.5); x.fill(); x.restore();
    x.fillStyle=flapInk; x.font=F(900,10); x.fillText('north tape',524,151); bars(524,155,30,10,22,flapInk,1105); x.font=F(400,3.4,'"JetBrains Mono"'); x.fillText('S. HARROW / EDIT / FT',558,158); x.fillText('LISBON · PORTUGAL',558,163); x.fillText('2 / c. 2021',685,158);
    /* ---- stickers ---- */
    // price sticker (torn)
    { const pr=A.rng(1106); x.save(); x.translate(334,456); x.rotate(-6*Math.PI/180); const w2=27.5,h2=18.5; x.beginPath(); x.moveTo(-w2+3,-h2); x.lineTo(w2-3,-h2); x.arcTo(w2,-h2,w2,-h2+3,3);
      for(let t=-h2+3;t<h2-4;t+=2.2){ x.lineTo(w2+(pr()-0.5)*2.2,t); } x.lineTo(w2-2+pr()*2,h2-2);
      for(let t=w2-4;t>-w2+3;t-=2.4){ x.lineTo(t,h2+(pr()-0.5)*2.4); } x.lineTo(-w2,h2-1); x.lineTo(-w2,-h2+3); x.arcTo(-w2,-h2,-w2+3,-h2,3); x.closePath();
      x.shadowColor='rgba(0,0,0,0.5)'; x.shadowBlur=3*u; x.shadowOffsetX=1.2*u; x.shadowOffsetY=2*u; x.fillStyle=stk; x.fill(); x.shadowColor='transparent';
      x.fillStyle=stkInk; x.textAlign='center'; x.font=F(800,7.5); x.fillText('LANE & CO',0,-8); x.font=F(700,13); x.fillText('$3.99',-1,7); x.font=F(400,2.6,'"JetBrains Mono"'); x.fillText('SHOP PRICE · NO RETURN',0,13); x.textAlign='left'; x.restore(); }
    // white price label (back), with a sticker-color band
    { x.save(); x.translate(538,548); x.rotate(3*Math.PI/180); x.shadowColor='rgba(0,0,0,0.45)'; x.shadowBlur=2.5*u; x.shadowOffsetY=1.5*u; x.fillStyle=lab; A.rrect(x,-27,-31,54,62,1.5); x.fill(); x.shadowColor='transparent';
      x.fillStyle=stk; x.fillRect(-27,6,54,12); x.fillStyle=labInk; x.font=F(700,4.5); x.textAlign='center'; x.fillText('TAKE PRICE',0,14.6); x.font=F(400,10,'"JetBrains Mono"'); x.fillText('1.20',0,29); x.font=F(700,10); x.fillStyle=labInk; x.fillText('S',18,-10); x.textAlign='left'; x.restore(); }
    // foil sticker
    { const cx=533,cy=501,r=18; x.save(); x.shadowColor='rgba(0,0,0,0.45)'; x.shadowBlur=2*u; x.shadowOffsetY=1*u; x.beginPath(); x.arc(cx,cy,r,0,6.2832); x.fillStyle=V.holo?'#5A3E9E':stk; x.fill(); x.restore();
      if(V.holo){ for(let k=0;k<36;k++){ const a0=k*Math.PI/18, a1=a0+Math.PI/18+0.02; x.beginPath(); x.moveTo(cx,cy); x.arc(cx,cy,r,a0,a1); x.closePath(); x.fillStyle=`hsl(${(k*10+250)%360} 70% ${48+12*Math.sin(k*0.9)}%)`; x.fill(); }
        const hg=x.createRadialGradient(cx-6,cy-7,0,cx,cy,r*1.15); hg.addColorStop(0,'rgba(255,255,255,0.55)'); hg.addColorStop(0.5,'rgba(255,255,255,0.08)'); hg.addColorStop(1,'rgba(0,0,40,0.35)'); x.beginPath(); x.arc(cx,cy,r,0,6.2832); x.fillStyle=hg; x.fill(); }
      x.setLineDash([1.2,1]); x.lineWidth=0.8; x.strokeStyle=V.holo?'rgba(20,10,40,0.7)':A.rgb(A.hex(stkInk),0.7); x.beginPath(); x.arc(cx,cy,r-2.5,0,6.2832); x.stroke(); x.setLineDash([]);
      x.fillStyle=V.holo?'rgba(20,10,40,0.85)':stkInk; x.textAlign='center'; x.font=F(900,5); x.fillText('SEAL',cx,cy+1.8); x.font=F(400,2.4,'"JetBrains Mono"'); x.fillText('CHECKED',cx,cy+6); x.textAlign='left'; }
    /* ---- barcode block + icon row ---- */
    { x.save(); x.shadowColor='rgba(0,0,0,0.4)'; x.shadowBlur=1.5*u; x.shadowOffsetY=0.8*u; x.fillStyle=lab; A.rrect(x,579,518,88,39,1); x.fill(); x.restore();
      bars(586,523,74,25,46,labInk,1103); x.fillStyle=lab; x.fillRect(600,545,46,7); x.fillStyle=labInk; x.font=F(400,3.2,'"JetBrains Mono"'); x.textAlign='center'; x.fillText('4 072118 664120',623,551); x.textAlign='left';
      // QR-ish block
      const qr=A.rng(1107); x.fillStyle=ink; for(let j=0;j<9;j++)for(let i=0;i<9;i++){ const fin=(i<3&&j<3)||(i>5&&j<3)||(i<3&&j>5); if(fin?((i%3!==1||j%3!==1)&&!(i%3===0&&j%3===0)?true:false):qr()<0.45) x.fillRect(672+i*1.9,540+j*1.9,1.7,1.7); }
      x.font=F(400,2.4,'"JetBrains Mono"'); x.fillText('rec 22 · 2021',693,542); bars(693,544,31,12,24,ink,1108);
      x.strokeStyle=ink; x.lineWidth=0.8; A.rrect(x,730,541,20,16,1.5); x.stroke(); star(740,549,5,ink); x.fillStyle=ink; x.fillRect(746,542,3.5,14); x.fillStyle=A.rgb(board); x.font=F(700,2,'"JetBrains Mono"'); x.save(); x.translate(748.5,555); x.rotate(-Math.PI/2); x.fillText('FT·02',0,0.7); x.restore();
      globe(766,549,6.5,ink,0.8); }
    /* ---- grain ---- */
    x.setTransform(1,0,0,1,0,0); A.grain(x,{amp:0.05,mono:true,seed:11});
  }
};
