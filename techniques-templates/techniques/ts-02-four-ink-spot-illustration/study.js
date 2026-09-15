window.STUDY={
  id:'ts-02-four-ink-spot-illustration', code:'TS-02', fig:'1.2',
  title:'Four-ink spot illustration',
  kicker:'Technique · TS-02',
  lede:'Black keyline, three flat spot inks slipped 2 u, hatch and dot tints on cream.',
  body:[
    'A letterpress catalogue sheet. Eight objects, each a closed shape filled flat on one of three plates — red, yellow, blue — and outlined on a black plate. Green is yellow under blue; pink and sky are red and blue screened as a 5 u dot tint. Every color plate prints 1–2.5 u down-right of the black, so a paper sliver opens on one edge and color spills the line on the other.',
    'Shadow sides carry a 45° broken hatch on the black plate at 6 u pitch. The stock is cream with a low mottle and a 1 px grain; a 0.35 px blur stands in for the scan. Captions run under each object in mono.'
  ],
  source:'Reference 02 · textbook spot-illustration sheet, 1006 × 1390',
  spot:[223,97,82], ref:{w:1006,h:1390},
  variantLabel:'Inks',
  variants:[
    { id:'ref', label:'As reference', sw:['#DF6152','#EDDC4D','#6599C8','#F7EDE3'], spot:[223,97,82],
      paper:'#FAF1E7', key:'#1C1A18', mottle:0.03, grain:0.035,
      plates:{ A:{c:'#DF6152',dx:2,dy:2}, B:{c:'#EDDC4D',dx:1,dy:2.6}, C:{c:'#6599C8',dx:2.4,dy:1.4} },
      inks:{ red:{p:'A',t:1}, yellow:{p:'B',t:1}, blue:{p:'C',t:1}, green:[{p:'B',t:1},{p:'C',t:0.85}], pink:{p:'A',t:0.42}, sky:{p:'C',t:0.4}, straw:{p:'B',t:0.45} } },
    { id:'io', label:'Ember / blue', sw:['#F4551E','#2F5AE6','#101014','#FFFFFF'], spot:[244,85,30],
      paper:'#FFFFFF', key:'#101014', mottle:0.012, grain:0.022,
      plates:{ A:{c:'#F4551E',dx:2,dy:2}, C:{c:'#2F5AE6',dx:2.4,dy:1.4} },
      inks:{ red:{p:'A',t:1}, yellow:{p:'A',t:0.36}, blue:{p:'C',t:1}, green:{p:'C',t:0.62}, pink:{p:'A',t:0.2}, sky:{p:'C',t:0.3}, straw:{p:'A',t:0.2} } },
    { id:'two', label:'Blue / ink', sw:['#2F5AE6','#101014','#FFFFFF'], spot:[47,90,230],
      paper:'#FFFFFF', key:'#101014', mottle:0.012, grain:0.022,
      plates:{ C:{c:'#2F5AE6',dx:2.2,dy:1.8}, K:{c:'#101014',dx:1.2,dy:2.2} },
      inks:{ red:{p:'C',t:1}, yellow:{p:'C',t:0.3}, blue:{p:'K',t:0.42}, green:{p:'C',t:0.7}, pink:{p:'C',t:0.18}, sky:{p:'K',t:0.22}, straw:{p:'C',t:0.16} } }
  ],
  points:[
    {u:0.284,v:0.073,d:'KEY',label:'Keyline · black plate, 2.2 u, two passes for waver',t:'black-keyline',dir:[-1,-1]},
    {u:0.342,v:0.090,d:'SPOT',label:'Spot fill · red plate, flat, closed shape',t:'spot-fill',dir:[1,-1]},
    {u:0.643,v:0.145,d:'SLIP',label:'Misregister · yellow plate +1, +2.6 u; paper sliver on the top-left edge',t:'misregister',dir:[-1,-1]},
    {u:0.170,v:0.323,d:'TINT',label:'Dot tint · blue plate screened 40 %, pitch 5 u, on the fan guard',t:'dot-tint',dir:[-1,0]},
    {u:0.800,v:0.416,d:'HTCH',label:'Hatch · 45°, pitch 6 u, broken dashes, on the pot shadow side',t:'hatch-shade',dir:[1,0]},
    {u:0.700,v:0.303,d:'SLIP',label:'Overprint green · yellow plate under 85 % blue, both slipped',t:'misregister',dir:[1,-1]},
    {u:0.390,v:0.604,d:'HTCH',label:'Hatch on the toaster side face · black plate, no slip',t:'hatch-shade',dir:[1,0]},
    {u:0.252,v:0.716,d:'CAPT',label:'Caption · JetBrains Mono 700, 21 u caps, black plate',t:'caption-label',dir:[-1,1]},
    {u:0.090,v:0.900,d:'PAPR',label:'Aged stock · cream (247,237,227), mottle ±3 %, grain σ ≈ 5/255',t:'aged-stock',dir:[-1,1]},
    {u:0.704,v:0.806,d:'TINT',label:'Pink · red plate screened 42 % on the dryer intake',t:'dot-tint',dir:[-1,0]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1006,1390], grammar:'letterpress spot-illustration sheet: black keyline, three flat color plates slipped down-right, hatch and dot-tint shading, captions, cream stock' },
    units:'design units, 1000 = sheet width',
    palette:{ paper:'#F7EDE3', red:'#DF6152', yellow:'#EDDC4D', blue:'#6599C8', green_overprint:'yellow × blue 85 %', pink_tint:'red 42 %', keyline:'#1C1A18' },
    techniques:[
      { id:'spot-fill', short:'SPOT', name:'Flat spot fill', layer:1, pass:1, atoms:['flat-fill','plate','knockout'],
        params:{ plates:['red','yellow','blue'], blend:'multiply on paper', knockout:'each fill clears the same shape on every other plate unless overprinting', green:'yellow + blue 85 % overprint' },
        implementation:'Every closed shape is filled flat on one plate canvas and cleared from the others (destination-out), so plates only overlap where an overprint is intended.' },
      { id:'black-keyline', short:'KEY', name:'Black keyline', layer:3, pass:3, atoms:['outline','stroke','waver'],
        params:{ width_u:2.2, second_pass_u:1.4, jitter_u:0.6, join:'round', color:'#1C1A18' },
        implementation:'Each shape is stroked twice on the black plate: 2.2 u on the path, then 1.4 u on the path shifted by a seeded 0.6 u jitter, which thickens the line unevenly.' },
      { id:'hatch-shade', short:'HTCH', name:'Broken hatch shading', layer:3, pass:3, atoms:['hatch','dash','clip'],
        params:{ angle_deg:45, pitch_u:6, width_u:1.3, dash_u:[12,4], dash_offset:'seeded per line' },
        implementation:'The shadow side of a shape is clipped and crossed by 45° lines at a 6 u pitch with a 12/4 dash whose phase changes per line; drawn on the black plate so it never slips.' },
      { id:'misregister', short:'SLIP', name:'Plate misregister', layer:2, pass:2, atoms:['offset','register','trap'],
        params:{ red_u:[2,2], yellow_u:[1,2.6], blue_u:[2.4,1.4], black_u:[0,0] },
        implementation:'Each color plate is composited with its own down-right offset before the black plate lands in register, so fills open a paper sliver on the top-left of the line and spill past it bottom-right.' },
      { id:'dot-tint', short:'TINT', name:'Dot-tint screen', layer:1, pass:1, atoms:['halftone','screen','dot'],
        params:{ pitch_u:5, grid:'square, half-cell stagger per row', coverage:{pink:0.42,sky:0.40,straw:0.45,green_blue:0.85}, radius:'pitch·√(coverage/π)' },
        implementation:'A mid-tone is the plate ink drawn as a regular dot grid clipped to the shape; the dot radius is set from the requested coverage.' },
      { id:'aged-stock', short:'PAPR', name:'Aged cream stock', layer:0, pass:0, atoms:['paper','mottle','grain','scan-blur'],
        params:{ paper:'#F7EDE3', mottle:'perlin fbm 3 oct, cell 120 u, ±3 % multiply', grain:'mono, 1 device px, amp 0.035', blur_px:0.35 },
        implementation:'Cream flat, then a low-frequency perlin multiply, a 0.35 px blur for the scan, then mono grain over everything including the inks.' },
      { id:'caption-label', short:'CAPT', name:'Caption label', layer:3, pass:3, atoms:['lettering','mono','caps'],
        params:{ font:'JetBrains Mono 700', size_u:21, tracking_u:1.5, case:'upper', title_u:26, folio_u:24 },
        implementation:'One caption centred under each object on the black plate; a sheet title at the top and a folio at the foot.' }
    ],
    pass_order:['stock · cream flat','color plates · flat fills, tints, knockouts per shape','composite · yellow, red, blue plates multiplied at their offsets','black plate · keylines, hatch, captions in register','age · mottle multiply, 0.35 px blur, mono grain'],
    notes:['Measured on ref.png: keyline dark runs 1–3 px at 1006 px (2.2 u); tint dot pitch 4–5 px; fill slip ≈ 2 px down-right; paper (247,237,227) σ 4.5, 72 % of pixels.','Seed 202.']
  },
  render(canvas,w,h,dpr,V){
    const A=window.ART; const W=canvas.width,H=canvas.height; const U=W/1000; const su=U/dpr;
    const rnd=A.rng(202); const L=()=>A.layer(canvas,su,dpr);
    const plates={}; for(const k in V.plates){ plates[k]=Object.assign({x:L()},V.plates[k]); }
    const K=L(); K.strokeStyle=V.key; K.fillStyle=V.key;
    let ox=0,oy=0,sc=1, box=[0,0,1000,1382];
    const TAU=Math.PI*2;
    const path=(x,fn,jx,jy)=>{ x.beginPath(); x.save(); x.translate(ox+(jx||0),oy+(jy||0)); x.scale(sc,sc); fn(x); x.restore(); };
    const dots=(x,fn,col,t)=>{ path(x,fn); x.save(); x.clip(); x.fillStyle=col; x.beginPath(); const p=5, r=p*Math.sqrt(t/Math.PI); let row=0;
      for(let yy=box[1];yy<box[3];yy+=p,row++){ for(let xx=box[0]+(row&1?p/2:0);xx<box[2];xx+=p){ x.moveTo(xx+r,yy); x.arc(xx,yy,r,0,TAU); } } x.fill(); x.restore(); };
    const P={
      fill(ink,fn,over){ const specs=[].concat(V.inks[ink]); for(const k in plates){ const pl=plates[k], x=pl.x; const s=specs.find(q=>q.p===k);
        if(s){ if(s.t>=1){ x.fillStyle=pl.c; path(x,fn); x.fill(); } else dots(x,fn,pl.c,s.t); }
        else if(!over){ x.save(); x.globalCompositeOperation='destination-out'; path(x,fn); x.fill(); x.restore(); } } },
      knock(fn){ for(const k in plates){ const x=plates[k].x; x.save(); x.globalCompositeOperation='destination-out'; path(x,fn); x.fill(); x.restore(); } },
      key(fn,w){ w=w||2.2; K.lineWidth=w; path(K,fn); K.stroke(); K.lineWidth=w*0.64; path(K,fn,(rnd()-0.5)*1.2,(rnd()-0.5)*1.2); K.stroke(); },
      line(fn,w){ K.lineWidth=w||1.2; path(K,fn); K.stroke(); },
      solid(fn){ path(K,fn); K.fill(); },
      hatch(fn,ang,pitch,wd){ ang=(ang===undefined?45:ang)*Math.PI/180; pitch=pitch||6; K.save(); path(K,fn); K.clip(); K.lineWidth=wd||1.3; const cx=(box[0]+box[2])/2, cy=(box[1]+box[3])/2, D=Math.hypot(box[2]-box[0],box[3]-box[1])/2; const dx=Math.cos(ang),dy=Math.sin(ang), nx=-dy, ny=dx;
        for(let d=-D;d<D;d+=pitch){ K.beginPath(); K.setLineDash([12,4]); K.lineDashOffset=rnd()*16; const px=cx+nx*d, py=cy+ny*d; K.moveTo(px-dx*D,py-dy*D); K.lineTo(px+dx*D,py+dy*D); K.stroke(); } K.setLineDash([]); K.restore(); },
      text(str,x,y,size,weight){ K.save(); K.font=`${weight||700} ${size}px 'JetBrains Mono', monospace`; try{ K.letterSpacing=(size*0.07)+'px'; }catch(e){} K.textAlign='center'; K.textBaseline='middle'; K.fillText(str,x,y); K.restore(); }
    };
    const ell=(x,cx,cy,rx,ry,rot)=>{ x.ellipse(cx,cy,rx,ry,rot||0,0,TAU); };
    const rr=(x,X,Y,w,h,r)=>{ x.moveTo(X+r,Y); x.lineTo(X+w-r,Y); x.arcTo(X+w,Y,X+w,Y+r,r); x.lineTo(X+w,Y+h-r); x.arcTo(X+w,Y+h,X+w-r,Y+h,r); x.lineTo(X+r,Y+h); x.arcTo(X,Y+h,X,Y+h-r,r); x.lineTo(X,Y+r); x.arcTo(X,Y,X+r,Y,r); x.closePath(); };
    const poly=(x,pts)=>{ x.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++)x.lineTo(pts[i][0],pts[i][1]); x.closePath(); };
    const circ=(cx,cy,r)=>x=>{ x.moveTo(cx+r,cy); x.arc(cx,cy,r,0,TAU); };

    /* ---- objects (local coordinates, origin at object center) ---- */
    const lamp=()=>{
      const baseTop=x=>ell(x,0,96,72,16), baseSide=x=>{ x.moveTo(-72,96); x.lineTo(-72,106); x.ellipse(0,106,72,16,0,Math.PI,TAU,true); x.lineTo(72,96); x.ellipse(0,96,72,16,0,0,Math.PI); x.closePath(); };
      P.fill('blue',baseSide); P.hatch(baseSide,45,6); P.key(baseSide); P.fill('blue',baseTop); P.key(baseTop);
      const stem=x=>rr(x,-6,4,12,90,3); P.fill('yellow',stem); P.key(stem);
      const arm=x=>{ x.save(); x.translate(0,8); x.rotate(-0.95); rr(x,-5,-6,100,11,4); x.restore(); }; P.fill('yellow',arm); P.key(arm);
      const shade=x=>{ x.save(); x.translate(76,-62); x.rotate(0.55); x.moveTo(-22,-34); x.lineTo(22,-34); x.lineTo(70,36); x.ellipse(0,36,70,15,0,0,Math.PI); x.lineTo(-70,36); x.closePath(); x.restore(); };
      const shadeR=x=>{ x.save(); x.translate(76,-62); x.rotate(0.55); x.moveTo(6,-34); x.lineTo(22,-34); x.lineTo(70,36); x.ellipse(0,36,70,15,0,0,Math.PI/2); x.lineTo(0,36); x.closePath(); x.restore(); };
      const glow=x=>{ x.save(); x.translate(76,-62); x.rotate(0.55); ell(x,0,36,70,15); x.restore(); };
      P.fill('red',shade); P.hatch(shadeR,40,6); P.fill('yellow',glow); P.key(glow); P.key(shade);
      const top=x=>{ x.save(); x.translate(76,-62); x.rotate(0.55); ell(x,0,-34,22,6); x.restore(); }; P.fill('red',top); P.key(top);
      P.line(x=>{ x.moveTo(-40,96); x.lineTo(40,96); },1.2);
    };
    const kettle=()=>{
      const body=x=>{ x.moveTo(-98,92); x.lineTo(98,92); x.quadraticCurveTo(108,92,106,80); x.lineTo(84,-14); x.quadraticCurveTo(82,-24,70,-24); x.lineTo(-70,-24); x.quadraticCurveTo(-82,-24,-84,-14); x.lineTo(-106,80); x.quadraticCurveTo(-108,92,-98,92); x.closePath(); };
      const bodyR=x=>{ x.moveTo(40,92); x.lineTo(98,92); x.quadraticCurveTo(108,92,106,80); x.lineTo(84,-14); x.quadraticCurveTo(82,-24,70,-24); x.lineTo(60,-24); x.closePath(); };
      const spout=x=>poly(x,[[-92,20],[-160,-52],[-134,-62],[-80,-6]]);
      const handle=x=>{ x.arc(0,-40,104,Math.PI*1.12,Math.PI*1.88); x.arc(0,-40,86,Math.PI*1.88,Math.PI*1.12,true); x.closePath(); };
      const lugL=x=>rr(x,-106,-84,20,66,5), lugR=x=>rr(x,86,-84,20,66,5); P.fill('yellow',lugL); P.key(lugL); P.fill('yellow',lugR); P.hatch(lugR,45,6); P.key(lugR);
      const lid=x=>ell(x,0,-26,80,15), knob=x=>rr(x,-12,-48,24,14,5), band=x=>rr(x,-100,74,200,10,2);
      P.fill('yellow',spout); P.key(spout); P.fill('yellow',body); P.hatch(bodyR,45,6); P.fill('blue',band); P.key(band); P.key(body);
      P.fill('red',lid); P.key(lid); P.fill('red',knob); P.key(knob); P.fill('red',handle); P.hatch(x=>{ x.arc(0,-40,104,Math.PI*1.5,Math.PI*1.88); x.arc(0,-40,86,Math.PI*1.88,Math.PI*1.5,true); x.closePath(); },45,6); P.key(handle);
      P.line(x=>{ x.moveTo(-70,20); x.lineTo(70,20); },1.2);
    };
    const fan=()=>{
      const guard=circ(0,-16,102); P.fill('sky',guard);
      for(let k=0;k<3;k++){ const a=k*TAU/3+0.35; const bl=x=>{ x.save(); x.translate(0,-16); x.rotate(a); ell(x,52,0,50,24); x.restore(); }; P.fill('yellow',bl); P.key(bl); }
      const hub=circ(0,-16,15); P.fill('red',hub); P.key(hub);
      for(const r of [102,84,64,44]) P.line(circ(0,-16,r),r===102?2.2:1.4);
      P.line(x=>{ for(let k=0;k<16;k++){ const a=k*TAU/16; x.moveTo(15*Math.cos(a),-16+15*Math.sin(a)); x.lineTo(102*Math.cos(a),-16+102*Math.sin(a)); } },1.1);
      const neck=x=>rr(x,-9,80,18,30,4); P.fill('blue',neck); P.key(neck);
      const baseSide=x=>{ x.moveTo(-64,108); x.lineTo(-64,118); x.ellipse(0,118,64,15,0,Math.PI,TAU,true); x.lineTo(64,108); x.ellipse(0,108,64,15,0,0,Math.PI); x.closePath(); };
      P.fill('red',baseSide); P.hatch(baseSide,45,6); P.key(baseSide); const baseTop=x=>ell(x,0,108,64,15); P.fill('red',baseTop); P.key(baseTop);
    };
    const plant=()=>{
      const saucer=x=>ell(x,0,112,80,13); P.fill('blue',saucer); P.key(saucer);
      const pot=x=>poly(x,[[-62,22],[62,22],[50,108],[-50,108]]), potR=x=>poly(x,[[20,22],[62,22],[50,108],[20,108]]);
      P.fill('red',pot); P.hatch(potR,45,6); P.key(pot); const rim=x=>rr(x,-70,6,140,20,4); P.fill('red',rim); P.key(rim);
      const soil=x=>ell(x,0,12,58,8); P.fill('green',soil); P.key(soil);
      const leaves=[[-95,-60,-0.2],[-50,-100,0.1],[10,-115,0],[62,-92,-0.1],[98,-40,0.2],[-30,-40,0.3]];
      for(const [tx,ty,bend] of leaves){ const mx=tx*0.5+bend*80, my=ty*0.5-40; P.line(x=>{ x.moveTo(0,10); x.quadraticCurveTo(mx*0.6,my*0.6+20,tx*0.55,ty*0.55+5); },1.8);
        const leaf=x=>{ const sx=tx*0.5,sy=ty*0.5+5; const nx=-(ty-sy),ny=(tx-sx); const n=Math.hypot(nx,ny)||1; const wx=nx/n*22,wy=ny/n*22; x.moveTo(sx,sy); x.quadraticCurveTo((sx+tx)/2+wx,(sy+ty)/2+wy,tx,ty); x.quadraticCurveTo((sx+tx)/2-wx,(sy+ty)/2-wy,sx,sy); x.closePath(); };
        P.fill('green',leaf); P.key(leaf); P.line(x=>{ x.moveTo(tx*0.5,ty*0.5+5); x.lineTo(tx*0.9,ty*0.9); },1.1); }
    };
    const toaster=()=>{
      const s1=x=>rr(x,-72,-96,58,74,18), s2=x=>rr(x,6,-92,58,74,18); P.fill('yellow',s1); P.key(s1); P.fill('yellow',s2); P.key(s2);
      P.hatch(x=>rr(x,-72,-96,58,74,18),45,7,1.1);
      const top=x=>poly(x,[[-112,-14],[-76,-46],[126,-46],[90,-14]]); P.fill('sky',top); P.key(top);
      const side=x=>poly(x,[[90,-14],[126,-46],[126,44],[90,90]]); P.fill('blue',side); P.hatch(side,45,6); P.key(side);
      const front=x=>rr(x,-112,-14,202,104,16); P.fill('blue',front); P.key(front);
      P.line(x=>{ x.moveTo(-60,-34); x.lineTo(-10,-34); x.moveTo(10,-34); x.lineTo(60,-34); },4);
      const lever=x=>rr(x,100,10,16,12,3); P.fill('red',lever); P.key(lever); P.line(x=>{ x.moveTo(108,-6); x.lineTo(108,40); },1.4);
      const knob=circ(70,64,9); P.fill('red',knob); P.key(knob);
      P.line(x=>{ x.moveTo(-100,30); x.lineTo(50,30); },1.2);
      const f1=x=>rr(x,-100,90,22,8,2), f2=x=>rr(x,58,90,22,8,2); P.fill('blue',f1); P.key(f1); P.fill('blue',f2); P.key(f2);
    };
    const handset=()=>{
      const cups=x=>{ x.moveTo(-90,0); x.arc(-128,-4,42,0,TAU); x.moveTo(170,-4); x.arc(128,-4,42,0,TAU); };
      const bar=x=>{ x.moveTo(-124,-40); x.quadraticCurveTo(0,-104,124,-40); x.lineTo(112,-16); x.quadraticCurveTo(0,-70,-112,-16); x.closePath(); };
      const under=x=>{ x.moveTo(-124,-30); x.quadraticCurveTo(0,-80,124,-30); x.lineTo(112,-16); x.quadraticCurveTo(0,-70,-112,-16); x.closePath(); };
      P.fill('red',cups); P.fill('red',bar); P.hatch(under,45,6); P.key(cups); P.key(bar);
      const face=x=>ell(x,-128,-4,26,20,0.3), face2=x=>ell(x,128,-4,26,20,-0.3); P.fill('pink',face); P.key(face); P.fill('pink',face2); P.key(face2);
      P.solid(x=>{ for(let k=0;k<7;k++){ const a=k*TAU/7; x.moveTo(-128+12*Math.cos(a)+2.4,-4+9*Math.sin(a)); x.arc(-128+12*Math.cos(a),-4+9*Math.sin(a),2.4,0,TAU); } });
      const cord=[]; for(let i=0;i<13;i++){ const t=i/12; const cx=128+30*Math.sin(t*Math.PI)+t*20, cy=40+t*90; cord.push([cx,cy,0.4+0.8*Math.sin(t*6)]); }
      P.line(x=>{ x.moveTo(140,32); x.quadraticCurveTo(160,60,180,150); },1.6);
      for(const [cx,cy,rot] of cord){ const loop=x=>ell(x,cx,cy,11,5.5,rot); P.fill('blue',loop); P.key(loop,1.8); }
    };
    const clock=()=>{
      const bl=circ(-64,-74,27), br=circ(64,-74,27); P.fill('yellow',bl); P.fill('yellow',br); P.hatch(x=>{ x.moveTo(-64,-74); x.arc(-64,-74,27,0.3,1.9); x.closePath(); },45,5,1.2); P.hatch(x=>{ x.moveTo(64,-74); x.arc(64,-74,27,0.3,1.9); x.closePath(); },45,5,1.2); P.key(bl); P.key(br);
      P.line(x=>{ x.moveTo(-40,-90); x.lineTo(40,-90); },5); const ham=circ(0,-98,7); P.fill('red',ham); P.key(ham);
      P.line(x=>{ x.moveTo(-46,70); x.lineTo(-64,100); x.moveTo(46,70); x.lineTo(64,100); },6); const ft=circ(-66,102,6), ft2=circ(66,102,6); P.fill('red',ft); P.fill('red',ft2); P.key(ft); P.key(ft2);
      const body=circ(0,0,84); P.fill('red',body); P.hatch(x=>{ x.moveTo(0,0); x.arc(0,0,84,0.2,1.6); x.closePath(); },45,6); P.key(body);
      const face=circ(0,0,66); P.knock(face); P.key(face); P.fill('sky',x=>{ x.moveTo(-66,0); x.arc(0,0,66,Math.PI*0.05,Math.PI*0.95); x.closePath(); });
      P.line(x=>{ for(let k=0;k<12;k++){ const a=k*TAU/12; const r0=k%3?58:52; x.moveTo(r0*Math.cos(a),r0*Math.sin(a)); x.lineTo(63*Math.cos(a),63*Math.sin(a)); } },2);
      P.line(x=>{ x.moveTo(0,0); x.lineTo(-2,-44); x.moveTo(0,0); x.lineTo(34,18); },3.2); P.solid(circ(0,0,4));
      const btn=x=>rr(x,-8,-102,16,8,2); P.fill('red',btn); P.key(btn);
    };
    const dryer=()=>{
      const cordL=x=>{ x.moveTo(-62,126); x.quadraticCurveTo(-90,150,-150,132); }; P.line(cordL,2);
      const handle=x=>{ x.save(); x.translate(-18,36); x.rotate(0.32); rr(x,-17,0,34,96,10); x.restore(); };
      const handleL=x=>{ x.save(); x.translate(-18,36); x.rotate(0.32); rr(x,-17,0,14,96,6); x.restore(); };
      P.fill('red',handle); P.hatch(handleL,45,6); P.key(handle);
      const sw=x=>{ x.save(); x.translate(-18,36); x.rotate(0.32); rr(x,-8,30,14,22,3); x.restore(); }; P.fill('yellow',sw); P.key(sw);
      const noz=x=>poly(x,[[62,-40],[156,-30],[156,10],[62,20]]); P.fill('yellow',noz); P.hatch(x=>poly(x,[[62,-6],[156,0],[156,10],[62,20]]),45,5,1.1); P.key(noz);
      const nozEnd=x=>ell(x,156,-10,7,20); P.fill('straw',nozEnd); P.key(nozEnd);
      const body=x=>ell(x,0,-12,82,56); P.fill('blue',body); P.key(body);
      const intake=circ(-38,-12,32); P.fill('pink',intake); P.key(intake); P.line(circ(-38,-12,21),1.4); P.line(circ(-38,-12,10),1.4);
      P.hatch(x=>{ x.moveTo(0,-12); x.arc(0,-12,82,0.1,1.3); x.closePath(); },45,6);
    };

    /* ---- sheet layout ---- */
    const objs=[
      {f:lamp,cx:250,cy:245,dy:-30,cap:'READING LAMP'},{f:kettle,cx:740,cy:235,dy:16,cap:'STOVE KETTLE'},
      {f:fan,cx:262,cy:548,dy:-22,cap:'DESK FAN'},{f:plant,cx:748,cy:540,cap:'POT PLANT'},
      {f:toaster,cx:252,cy:862,cap:'TWO-SLICE TOASTER'},{f:handset,cx:742,cy:852,cap:'HANDSET'},
      {f:clock,cx:262,cy:1170,dy:-10,cap:'ALARM CLOCK'},{f:dryer,cx:748,cy:1162,cap:'HAND DRYER'}
    ];
    for(const o of objs){ ox=o.cx; oy=o.cy-34+(o.dy||0); sc=1.15; box=[o.cx-250,o.cy-200,o.cx+250,o.cy+150]; o.f(); ox=0; oy=0; sc=1; P.text(o.cap,o.cx,o.cy+128,21); }
    box=[0,0,1000,1382]; P.text('DESK AND KITCHEN GOODS',500,44,26); P.text('14',500,1350,24);

    /* ---- composite ---- */
    const x=canvas.getContext('2d'); x.setTransform(1,0,0,1,0,0); x.globalCompositeOperation='source-over'; x.fillStyle=V.paper; x.fillRect(0,0,W,H);
    x.globalCompositeOperation='multiply'; const order=['B','A','C','K'].filter(k=>plates[k]);
    for(const k of order){ const pl=plates[k]; x.drawImage(pl.x.canvas,Math.round(pl.dx*U),Math.round(pl.dy*U)); }
    x.drawImage(K.canvas,0,0);
    /* aged stock: low-frequency mottle */
    const n=A.perlin(202); const mw=60, mh=Math.round(60*H/W); const mc=A.off(mw,mh); const mx=mc.getContext('2d'); const md=mx.createImageData(mw,mh);
    for(let j=0;j<mh;j++)for(let i=0;i<mw;i++){ const v=n.fbm(i/7.2,j/7.2,3,0.55); const ex=Math.min(i,mw-1-i,j,mh-1-j)/12; const vig=A.clamp(1-ex,0,1)*0.25; const g=255*(1-V.mottle*(v+0.15+vig)); const q=(j*mw+i)*4; md.data[q]=g; md.data[q+1]=g*(1-V.mottle*0.2); md.data[q+2]=g*(1-V.mottle*0.5); md.data[q+3]=255; }
    mx.putImageData(md,0,0); x.imageSmoothingEnabled=true; x.imageSmoothingQuality='high'; x.drawImage(mc,0,0,mw,mh,0,0,W,H);
    x.globalCompositeOperation='source-over';
    const soft=A.blur(canvas,0.35*dpr); x.drawImage(soft,0,0);
    A.grain(x,{amp:V.grain,pitch:Math.max(1,Math.round(dpr)),seed:202,mono:true,corr:0.2});
  }
};
