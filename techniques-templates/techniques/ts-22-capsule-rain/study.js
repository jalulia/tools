window.STUDY={
  id:'ts-22-capsule-rain', code:'TS-22', fig:'1.22',
  title:'Capsule rain system',
  kicker:'Technique · TS-22',
  lede:'Columns of pills that grow along one axis, five inks in bands.',
  body:[
    'One generator fills every panel. Pills stand in columns on a 6.5 u pitch. Along the growth axis a pill goes from a 2 u dot to a 78 u capsule and from 1.5 to 10.5 u wide, so late columns overlap. Ink follows the same axis in five overlapping bands, and inks multiply where pills overlap.',
    'A wedge limits where pills land, a hairline frame or a shape clips them, and the same field at low density gives the sparse panels. Labels are tracked mono capitals over a 22 u rule. Motion lets the pills fall. Live slides the ink bands and bends the wedge.'
  ],
  source:'Reference 22 · identity board built from colored capsule columns, 1080 × 1350',
  spot:[230,0,126], ref:{w:1080,h:1350},
  variantLabel:'Inks',
  variants:[
    { id:'ref',   label:'Five ink', sw:['#E6007E','#E8202A','#F6D21C','#141414','#1273DE'], spot:[230,0,126], sheet:'#ECECEA', ink:'#141414', rule:'#141414', inks:['#E6007E','#E8202A','#F6D21C','#141414','#1273DE'], blend:'multiply', block:'#141414', blockText:'#ECECEA' },
    { id:'io',    label:'Ø',        sw:['#F4551E','#2F5AE6','#101014','#FFFFFF'], spot:[244,85,30], sheet:'#FFFFFF', ink:'#101014', rule:'#101014', inks:['#F4551E','#F4551E','#101014','#2F5AE6','#2F5AE6'], blend:'multiply', block:'#101014', blockText:'#FFFFFF' },
    { id:'night', label:'Night',    sw:['#0E0E12','#FF4FA3','#FFD23F','#4DA3FF'], spot:[255,79,163], sheet:'#0E0E12', ink:'#F2F2F0', rule:'#F2F2F0', inks:['#FF4FA3','#FF5A3C','#FFD23F','#F2F2F0','#4DA3FF'], blend:'screen', block:'#F2F2F0', blockText:'#0E0E12' },
    { id:'mono',  label:'One ink',  sw:['#141414','#8A8A88','#ECECEA'], spot:[20,20,20], sheet:'#ECECEA', ink:'#141414', rule:'#141414', inks:['#B9B9B6','#8A8A88','#5C5C5A','#141414','#3A3A39'], blend:'multiply', block:'#141414', blockText:'#ECECEA' }
  ],
  points:[
    {u:0.14,v:0.235,d:'RAIN',label:'Start of the axis · pills are 2 u dots',t:'capsule-rain',dir:[-1,1]},
    {u:0.84,v:0.16,d:'RAIN',label:'End of the axis · capsules up to 78 u long, 10.5 u wide',t:'capsule-rain',dir:[1,-1]},
    {u:0.45,v:0.20,d:'WEDG',label:'Wedge · the filled height grows as t^0.9',t:'wedge-envelope',dir:[-1,-1]},
    {u:0.30,v:0.225,d:'INK',label:'Ink band · magenta, then red',t:'ink-bands',dir:[1,1]},
    {u:0.70,v:0.20,d:'INK',label:'Overprint · black over yellow and blue, multiplied',t:'ink-bands',dir:[1,1]},
    {u:0.23,v:0.45,d:'MASK',label:'Shape clip · the same field inside a ring',t:'shape-mask',dir:[-1,-1]},
    {u:0.495,v:0.47,d:'RAIN',label:'Sparse panel · 22 % of the pills, full size',t:'capsule-rain',dir:[1,0]},
    {u:0.93,v:0.70,d:'FRAME',label:'Hairline frame · 1.2 u',t:'hairline-frame',dir:[1,-1]},
    {u:0.615,v:0.465,d:'LABL',label:'Label · mono capitals, 0.22 em tracking, 22 u rule',t:'tracked-label',dir:[1,1]},
    {u:0.06,v:0.96,d:'TOOTH',label:'Sheet grain · 2 % mono',t:'sheet-grain',dir:[-1,1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1080,1350], grammar:'one field of rounded capsules in columns, growing along an axis with five inks in sequence; used full, sparse, clipped to shapes and inside hairline frames; tracked mono labels; gray sheet' },
    units:'design units, 1000 = sheet width',
    palette:{ sheet:'#ECECEA', ink:'#141414', magenta:'#E6007E', red:'#E8202A', yellow:'#F6D21C', blue:'#1273DE' },
    techniques:[
      { id:'capsule-rain', short:'RAIN', name:'Capsule columns', layer:2, pass:2, atoms:['capsule','column','growth-axis'],
        params:{ pitch_u:{ value:6.5, range:[4,30], unit:'u' }, length_u:[2,78], width_u:[1.5,10.5], length_curve:{ value:1.7, range:[0.5,4], note:'exponent on t for length' }, gap:{ value:0.28, range:[0.05,2], note:'gap as a share of the pill length' }, fill:{ value:0.94, range:[0.05,1], note:'chance that a slot holds a pill' }, jitter_u:{ value:1.2, range:[0,6], unit:'u' }, fall:{ value:0, range:[0,1], note:'phase of the fall; Motion runs it' }, seed:{ value:88, range:[1,9999], step:1 } },
        limits:'Pitch under the largest width (10.5 u) makes columns overlap their neighbors; that is intended at 6.5 u and turns to a solid tint under ~4 u. gap under ~0.1 fuses a column into a bar.',
        implementation:'Each column is filled top to bottom with rounded bars whose length and width are set by the column’s position t on the growth axis; lengths vary ±50 %.' },
      { id:'wedge-envelope', short:'WEDG', name:'Wedge envelope', layer:2, pass:2, atoms:['envelope','ramp'],
        params:{ anchor:'bottom', power:{ value:0.9, range:[0.3,3] }, floor:{ value:0.04, range:[0,1], note:'filled share of the height at t = 0' }, scatter:{ value:0.2, range:[0,0.6], note:'chance of a pill above the wedge, falling with distance' } },
        limits:'floor at 1 fills the frame and the wedge is gone. scatter above ~0.4 hides the wedge edge.',
        implementation:'The filled height is floor + (1 − floor)·t^power from the anchor side; a few pills are allowed past the edge.' },
      { id:'ink-bands', short:'INK', name:'Ink bands on the axis', layer:2, pass:2, atoms:['palette-field','overprint','multiply'],
        params:{ centers:[0.16,0.36,0.54,0.72,0.9], offset:{ value:0, range:[-1,1], note:'slides the bands along the axis' }, width:{ value:0.17, range:[0.03,0.5], note:'gaussian width of each band in t' }, blend:'multiply' },
        limits:'width above ~0.35 mixes all five inks everywhere. Under ~0.05 the inks meet in hard stripes.',
        implementation:'Each pill draws its ink from five gaussian bands along t and is composited with multiply, so overlaps print darker.' },
      { id:'shape-mask', short:'MASK', name:'Shape clip', layer:2, pass:2, atoms:['clip','mask'],
        params:{ ring:{ center_u:[232,562], outer_u:{ value:132, range:[40,300], unit:'u' }, inner_u:{ value:70, range:[0,280], unit:'u' }, gap_deg:[-34,34] }, shapes:'frame rectangle · ring with a gap' },
        limits:'An inner radius within ~20 u of the outer leaves a band thinner than one long capsule and the field no longer reads.',
        implementation:'The capsule field is drawn through a clip path: a rectangle for framed panels, a ring with an opening for the mark.' },
      { id:'hairline-frame', short:'FRAME', name:'Hairline frame', layer:3, pass:3, atoms:['rule','frame'],
        params:{ line_u:{ value:1.2, range:[0.4,4], unit:'u' }, corner:'square' },
        limits:'Above ~3 u the frame competes with the capsules.',
        implementation:'A square-cornered rectangle stroked once over the clipped field.' },
      { id:'tracked-label', short:'LABL', name:'Tracked mono label', layer:4, pass:4, atoms:['mono-caps','tracking','rule'],
        params:{ size_u:{ value:12.5, range:[8,24], unit:'u' }, tracking_em:{ value:0.22, range:[0,0.6], unit:'em' }, leading:{ value:1.65, range:[1.1,2.4] }, rule_u:[22,1.2], rule_gap_u:{ value:16, range:[4,40], unit:'u' } },
        limits:'Tracking above ~0.4 em breaks words into letters at this size.',
        implementation:'Capitals in JetBrains Mono, set letter by letter with 0.22 em added; a short rule sits one gap below the last line.' },
      { id:'sheet-grain', short:'TOOTH', name:'Sheet grain', layer:5, pass:5, atoms:['grain','stock'],
        params:{ amp:{ value:0.02, range:[0,0.1] }, seed:{ value:3, range:[1,9999], step:1 } },
        limits:'Above ~0.06 the grain shows inside the flat inks.',
        implementation:'A mono multiply grain over the finished sheet.' }
    ],
    pass_order:['sheet · flat gray','fields · capsule columns per panel, clipped, multiplied','frames · hairlines, block, circle pair','labels · tracked mono capitals and rules','grain · 2 % mono'],
    notes:['Measured on ref.png: column pitch ≈ 7 px at 1080 px (6.5 u); longest capsule ≈ 84 px; frame rule ≈ 1.3 px; label cap height ≈ 9 px.','Words are invented and plain. The subject is new: panel sizes, the ring and the order of panels differ from the reference.']
  },
  techniques:{
    'wedge-envelope': (P,u,A)=>({ top:t=>1-(P.floor+(1-P.floor)*Math.pow(t,P.power)), scatter:P.scatter }),
    'ink-bands': (P,u,A,V)=>({ blend:V.blend||P.blend, pick:(t0,k)=>{ const t=((t0+P.offset)%1+1)%1; let s=0; const w=P.centers.map(c=>{ const d=(t-c)/P.width; const v=Math.exp(-d*d); s+=v; return v; }); let a=k*s; for(let i=0;i<w.length;i++){ a-=w[i]; if(a<=0)return V.inks[i]; } return V.inks[w.length-1]; } }),
    /* fill(x, rect, opt): draws the field into rect {x,y,w,h} (device px). opt: { dir: 1 | -1, env, inks, density, tfix } */
    /* fill(ctx, rect, opt): draws the field into rect { x, y, w, h } (device px). opt: { dir, env, inks, density, tfix, tink, seed }. A column repeats every rect height, so the fall loops. */
    'capsule-rain': (P,u,A)=>({ fill:(x,R,opt)=>{ const r=A.rng(P.seed+(opt.seed||0)); const p=P.pitch_u*u;
        const pill=(cx,y,w,len)=>{ const rad=Math.min(w,len)/2; x.beginPath(); x.moveTo(cx-w/2+rad,y); x.arcTo(cx+w/2,y,cx+w/2,y+len,rad); x.arcTo(cx+w/2,y+len,cx-w/2,y+len,rad); x.arcTo(cx-w/2,y+len,cx-w/2,y,rad); x.arcTo(cx-w/2,y,cx+w/2,y,rad); x.closePath(); x.fill(); };
        for(let cx=R.x+p*0.5;cx<R.x+R.w;cx+=p){ let t=(cx-R.x)/R.w; if(opt.dir<0)t=1-t; const tt=opt.tfix!==undefined?opt.tfix:t; const len0=A.lerp(P.length_u[0],P.length_u[1],Math.pow(tt,P.length_curve))*u, w=A.lerp(P.width_u[0],P.width_u[1],tt)*u;
          const top=opt.env?R.y+R.h*opt.env.top(t):R.y; const shift=((P.fall*(1+Math.floor(r()*3)))%1)*R.h; let y=-len0*r();
          while(y<R.h){ const len=Math.max(w,len0*(0.5+r())); const k=r(), j=(r()*2-1)*P.jitter_u*u, keep=r(), sc=r(), ti=r(), gap=r();
            if(keep<P.fill*(opt.density===undefined?1:opt.density)){ const m=((y+shift)%R.h+R.h)%R.h; for(let c=0;c<2;c++){ const yy=R.y+m-c*R.h; if(yy+len<R.y||yy>R.y+R.h)continue; if(opt.env&&yy<top&&!(sc<opt.env.scatter*Math.exp(-(top-yy)/R.h*14)))continue; x.fillStyle=opt.inks.pick(opt.tink!==undefined?ti:t,k); pill(cx+j,yy,w,len); } }
            y+=len*(1+P.gap*(0.4+gap*1.2)); } } } }),
    'shape-mask': (P,u,A)=>({ rect:(x,R)=>{ x.beginPath(); x.rect(R.x,R.y,R.w,R.h); }, ring:x=>{ const c=P.ring, cx=c.center_u[0]*u, cy=c.center_u[1]*u, a0=c.gap_deg[0]*Math.PI/180, a1=c.gap_deg[1]*Math.PI/180; x.beginPath(); x.arc(cx,cy,c.outer_u*u,a1,a0+6.2832,false); x.arc(cx,cy,c.inner_u*u,a0+6.2832,a1,true); x.closePath(); return { x:cx-c.outer_u*u, y:cy-c.outer_u*u, w:2*c.outer_u*u, h:2*c.outer_u*u }; } }),
    'hairline-frame': (P,u,A)=>({ draw:(x,R,color)=>{ x.strokeStyle=color; x.lineWidth=P.line_u*u; x.strokeRect(R.x,R.y,R.w,R.h); }, line:P.line_u*u }),
    'tracked-label': (P,u,A)=>({ draw:(x,lines,X,Y,color,rule)=>{ const sz=P.size_u*u; x.font=`500 ${sz}px "JetBrains Mono", monospace`; x.textBaseline='alphabetic'; x.fillStyle=color; let y=Y;
        for(const ln of lines){ let cx=X; for(const ch of ln){ x.fillText(ch,cx,y); cx+=x.measureText(ch).width+P.tracking_em*sz; } y+=sz*P.leading; }
        if(rule!==false){ x.fillRect(X,y-sz*P.leading+P.rule_gap_u*u,P.rule_u[0]*u,P.rule_u[1]*u); } } }),
    'sheet-grain': (P,u,A)=>({ apply:ctx=>{ if(P.amp>0)A.grain(ctx,{amp:P.amp,pitch:1,seed:P.seed,mono:true}); } })
  },
  render(canvas,w,h,dpr,V,done,O){
    const A=window.ART; const W=canvas.width,H=canvas.height; const u=W/1000; const x=canvas.getContext('2d'); x.setTransform(1,0,0,1,0,0);
    const S=window.STUDY; const T=S.techniques, P=A.params(S.spec,O);
    const env=T['wedge-envelope'](P['wedge-envelope'],u,A), inks=T['ink-bands'](P['ink-bands'],u,A,V), rain=T['capsule-rain'](P['capsule-rain'],u,A), mask=T['shape-mask'](P['shape-mask'],u,A), frame=T['hairline-frame'](P['hairline-frame'],u,A), label=T['tracked-label'](P['tracked-label'],u,A), grain=T['sheet-grain'](P['sheet-grain'],u,A);
    const R=(a,b,c,d)=>({x:a*u,y:b*u,w:c*u,h:d*u});
    x.fillStyle=V.sheet; x.fillRect(0,0,W,H);
    const panels=[ { r:R(70,130,860,170), dir:1, env, seed:0, frame:true }, { r:R(440,400,112,330), dir:1, seed:7, density:0.22, tfix:0.82, tink:1, frame:true },
      { r:R(150,800,780,160), dir:-1, env, seed:19, frame:true }, { r:R(852,1030,78,170), dir:1, seed:31, density:0.5, tfix:0.95, tink:1, frame:true } ];
    const field=(clip,p)=>{ x.save(); clip(); x.clip(); x.globalCompositeOperation=inks.blend; rain.fill(x,p.r,{dir:p.dir,env:p.env,inks,density:p.density,tfix:p.tfix,tink:p.tink,seed:p.seed}); x.restore(); };
    panels.forEach(p=>field(()=>mask.rect(x,p.r),p));
    // the ring: the same field through a ring-shaped clip
    x.save(); const rb=mask.ring(x); x.clip(); x.globalCompositeOperation=inks.blend; rain.fill(x,rb,{dir:1,inks,seed:43,tfix:0.6,tink:1,density:1}); x.restore();
    // frames, block, circle pair
    panels.forEach(p=>{ if(p.frame)frame.draw(x,p.r,V.rule); });
    x.fillStyle=V.block; x.fillRect(600*u,1030*u,200*u,170*u);
    x.fillStyle=V.ink; x.beginPath(); x.arc(118*u,1095*u,44*u,0,6.2832); x.fill(); x.strokeStyle=V.rule; x.lineWidth=frame.line; x.beginPath(); x.arc(176*u,1095*u,44*u,0,6.2832); x.stroke();
    x.save(); x.beginPath(); x.arc(118*u,1095*u,44*u,0,6.2832); x.clip(); x.fillStyle=V.sheet; x.beginPath(); x.arc(176*u,1095*u,44*u-frame.line,0,6.2832); x.fill(); x.restore();
    x.beginPath(); x.moveTo(700*u,470*u); x.lineTo(930*u,470*u); x.moveTo(880*u,420*u); x.lineTo(930*u,470*u); x.lineTo(880*u,520*u); x.strokeStyle=V.rule; x.lineWidth=frame.line*1.3; x.stroke();
    // labels
    label.draw(x,['FIELD','NOTES','ROW 01'],70*u,52*u,V.ink);
    label.draw(x,['ONE','FIELD'],96*u,172*u,V.ink);
    label.draw(x,['SAME','RULE','NEW','SIZE'],590*u,560*u,V.ink);
    label.draw(x,['RING','CUT'],100*u,740*u,V.ink);
    label.draw(x,['RIGHT','TO','LEFT'],70*u,850*u,V.ink);
    label.draw(x,['TWO','CIRCLES'],250*u,1080*u,V.ink);
    label.draw(x,['SOLID','BLOCK'],628*u,1104*u,V.blockText);
    label.draw(x,['PLATE 22','FIVE INKS'],700*u,300*u+90*u,V.ink,false);
    grain.apply(x);
    if(done)done();
  },
  /* motion: every column falls and wraps; one loop is 9 s. The grain pass is skipped. */
  motion(canvas,w,h,dpr,V,t,ctx){ ctx.save(); window.STUDY.render(canvas,w,h,dpr,V,null,{ 'capsule-rain':{ fall:(t/9)%1 }, 'sheet-grain':{ amp:0 } }); ctx.restore(); },
  /* live: pointer x slides the ink bands; pointer y bends the wedge */
  pointer(px,py){ return { 'ink-bands':{ offset:px-0.5 }, 'wedge-envelope':{ power:0.3+2.6*py } }; },
  liveScale:1.5,
  live(V){ const S=window.STUDY, A=window.ART; const fn=f=>{ const s=f.toString(); return /^(function\b|\(|[\w$]+\s*=>)/.test(s)?s:'function '+s; };
    const art=Object.keys(A).map(k=>'A.'+k+'='+fn(A[k])+';').join('\n'); const tech='{'+Object.keys(S.techniques).map(k=>JSON.stringify(k)+':'+fn(S.techniques[k])).join(',')+'}';
    const extra=Object.keys(S).filter(k=>typeof S[k]==='function'&&k!=='live'&&k!=='motion').map(k=>k+':'+fn(S[k])).join(',');
    return `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="../../_shared/fonts.css"><style>html,body{margin:0;height:100%;overflow:hidden}canvas{width:100%;height:100%;display:block;cursor:crosshair;touch-action:none}</style><canvas id="c"></canvas><script>
const A={};${art}
window.ART=A; window.STUDY={spec:${JSON.stringify(S.spec)},techniques:${tech},${extra}};
const S=window.STUDY,V=${JSON.stringify(V)},c=document.getElementById('c'),d=${S.liveScale||0.6};let px=0.5,py=0.23,q=0;
const draw=()=>{q=0;c.width=Math.max(2,Math.round(innerWidth*d));c.height=Math.max(2,Math.round(innerHeight*d));S.render(c,innerWidth,innerHeight,d,V,null,S.pointer(px,py));};
addEventListener('pointermove',e=>{px=e.clientX/innerWidth;py=e.clientY/innerHeight;if(!q)q=requestAnimationFrame(draw);});addEventListener('resize',draw);(document.fonts?document.fonts.ready:Promise.resolve()).then(draw);
<\/script>`; }
};
