window.STUDY={
  id:'ts-22-capsule-rain', code:'TS-22', fig:'1.22',
  title:'Capsule system',
  kicker:'Technique · TS-22',
  lede:'One capsule, used as field, helix, dial, control and icon.',
  body:[
    'One primitive, a capsule, drawn by one function. Columns of capsules grow along an axis from 2 u dots to 78 u pills, lean 12° and take five inks in bands. The same capsule stands as the 46 rungs of a helix, the 54 spokes of a dial, the strokes of eight icons and the parts of five controls.',
    'Each variant is an alternate treatment. Flat: vector capsules that multiply where they overlap. Stipple: every pixel is on or off by coverage, a capsule fades along its length, and a field loses coverage over the last 5 u before its clip edge. The color variants are a complement pair, a primary triad and a split complement. Motion lets the columns fall and turns the helix and the dial. Live slides the inks and the slider.'
  ],
  source:'Reference 22 · identity board built from colored capsule columns, 1080 × 1350',
  spot:[230,0,126], ref:{w:1080,h:1350},
  variantLabel:'Alternate',
  variants:[
    { id:'ref',   label:'Flat',       sw:['#E6007E','#E8202A','#F6D21C','#141414','#1273DE'], spot:[230,0,126], sheet:'#ECECEA', ink:'#141414', rule:'#141414', inks:['#E6007E','#E8202A','#F6D21C','#141414','#1273DE'], blend:'multiply', stipple:false, block:'#141414', blockText:'#ECECEA' },
    { id:'grain', label:'Stipple',    sw:['#E6007E','#F6D21C','#141414','#1273DE','#ECECEA'], spot:[18,115,222], sheet:'#ECECEA', ink:'#141414', rule:'#141414', inks:['#E6007E','#E8202A','#F6D21C','#141414','#1273DE'], blend:'multiply', stipple:true, block:'#141414', blockText:'#ECECEA' },
    { id:'comp',  label:'Complement', sw:['#0A1230','#FF7A00','#FFB627','#2D7BFF','#00C8FF'], spot:[255,122,0], sheet:'#0A1230', ink:'#FFFFFF', rule:'#FFFFFF', inks:['#FF7A00','#FFB627','#FFFFFF','#2D7BFF','#00C8FF'], blend:'screen', stipple:true, block:'#FFFFFF', blockText:'#0A1230' },
    { id:'triad', label:'Triad',      sw:['#FFFFFF','#E4002B','#FFCF00','#0038FF','#111111'], spot:[228,0,43], sheet:'#FFFFFF', ink:'#111111', rule:'#111111', inks:['#E4002B','#FFCF00','#0038FF','#111111','#E4002B'], blend:'multiply', stipple:false, block:'#111111', blockText:'#FFFFFF' },
    { id:'split', label:'Split',      sw:['#2A0E4F','#FFE600','#B6FF3C','#FF8A00','#FFFFFF'], spot:[255,230,0], sheet:'#2A0E4F', ink:'#FFFFFF', rule:'#FFFFFF', inks:['#FFE600','#B6FF3C','#FF8A00','#FFFFFF','#FFE600'], blend:'source-over', stipple:true, block:'#FFE600', blockText:'#2A0E4F' },
    { id:'io',    label:'Ø',          sw:['#FFFFFF','#F4551E','#2F5AE6','#101014'], spot:[244,85,30], sheet:'#FFFFFF', ink:'#101014', rule:'#101014', inks:['#F4551E','#F4551E','#2F5AE6','#101014','#2F5AE6'], blend:'multiply', stipple:true, block:'#101014', blockText:'#FFFFFF' }
  ],
  points:[
    {u:0.86,v:0.19,d:'RAIN',label:'Capsules to 78 u long, 10.5 u wide, leaning 12°',t:'capsule-rain',dir:[1,-1]},
    {u:0.45,v:0.20,d:'WEDG',label:'Wedge · filled height grows as t^0.9',t:'wedge-envelope',dir:[-1,-1]},
    {u:0.30,v:0.235,d:'INK',label:'Ink bands · five gaussians on the axis',t:'ink-bands',dir:[1,1]},
    {u:0.215,v:0.404,d:'DIAL',label:'Dial · 54 radial capsules, three lobes',t:'capsule-dial',dir:[-1,1]},
    {u:0.675,v:0.356,d:'HELX',label:'Helix · rung length is 2 × amplitude × |sin|',t:'capsule-helix',dir:[1,-1]},
    {u:0.93,v:0.296,d:'FRAME',label:'Hairline frame · 1.2 u',t:'hairline-frame',dir:[1,-1]},
    {u:0.50,v:0.488,d:'CTRL',label:'Controls · button, toggle, chips, slider, pager, meter',t:'capsule-ui',dir:[-1,1]},
    {u:0.19,v:0.71,d:'MASK',label:'Shape clip · the field inside a ring',t:'shape-mask',dir:[-1,1]},
    {u:0.445,v:0.70,d:'STIP',label:'Stipple · one pixel on or off by coverage',t:'fine-stipple',dir:[-1,-1]},
    {u:0.52,v:0.76,d:'MASK',label:'Masked edge · coverage ramps over the last 5 u',t:'shape-mask',dir:[1,1]},
    {u:0.77,v:0.69,d:'ICON',label:'Icons · round-cap strokes, one accent each',t:'capsule-icons',dir:[1,1]},
    {u:0.092,v:0.05,d:'LABL',label:'Label · mono capitals, 0.22 em tracking, 22 u rule',t:'tracked-label',dir:[-1,-1]},
    {u:0.96,v:0.975,d:'TOOTH',label:'Sheet grain · 2 % mono',t:'sheet-grain',dir:[1,1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[1080,1350], grammar:'one field of rounded capsules in columns, growing along an axis with five inks in sequence; used full, sparse, clipped to shapes and inside hairline frames; tracked mono labels; gray sheet' },
    units:'design units, 1000 = sheet width; the plate is 1000 × 1250',
    palette:{ sheet:'#ECECEA', ink:'#141414', magenta:'#E6007E', red:'#E8202A', yellow:'#F6D21C', blue:'#1273DE' },
    techniques:[
      { id:'capsule-rain', short:'RAIN', name:'Capsule columns', layer:2, pass:2, atoms:['capsule','column','growth-axis'],
        params:{ pitch_u:{ value:6.5, range:[4,30], unit:'u' }, length_u:[2,78], width_u:[1.5,10.5], length_curve:{ value:1.7, range:[0.5,4], note:'exponent on t for length' }, gap:{ value:0.28, range:[0.05,2], note:'gap as a share of the capsule length' }, fill:{ value:0.94, range:[0.05,1], note:'chance that a slot holds a capsule' }, jitter_u:{ value:1.2, range:[0,6], unit:'u' }, lean_deg:{ value:12, range:[-30,30], unit:'°' }, fall:{ value:0, range:[0,1], note:'phase of the fall; Motion runs it' }, seed:{ value:88, range:[1,9999], step:1 } },
        limits:'Pitch under ~4 u turns the late columns into a solid tint. gap under ~0.1 fuses a column into a bar. A lean past ±30° crosses three columns and the axis stops reading.',
        implementation:'Each column is filled top to bottom with capsules whose length and width follow the column’s position t on the growth axis; lengths vary ±50 %. A column repeats every panel height, so the fall loops.' },
      { id:'wedge-envelope', short:'WEDG', name:'Wedge envelope', layer:2, pass:2, atoms:['envelope','ramp'],
        params:{ anchor:'bottom', power:{ value:0.9, range:[0.3,3] }, floor:{ value:0.04, range:[0,1], note:'filled share of the height at t = 0' }, scatter:{ value:0.2, range:[0,0.6], note:'chance of a capsule above the wedge, falling with distance' } },
        limits:'floor at 1 fills the panel and the wedge is gone. scatter above ~0.4 hides the wedge edge.',
        implementation:'The filled height is floor + (1 − floor)·t^power from the bottom; a few capsules are allowed past the edge.' },
      { id:'ink-bands', short:'INK', name:'Ink bands on the axis', layer:2, pass:2, atoms:['palette-field','overprint','multiply'],
        params:{ centers:[0.16,0.36,0.54,0.72,0.9], offset:{ value:0, range:[-1,1], note:'slides the bands along the axis' }, width:{ value:0.17, range:[0.03,0.5], note:'gaussian width of each band in t' }, blend:'multiply' },
        limits:'width above ~0.35 mixes all five inks everywhere. Under ~0.05 the inks meet in hard stripes.',
        implementation:'A capsule draws its ink from five gaussian bands along t. Each ink has its own layer; the layers are composited with the variant’s blend.' },
      { id:'shape-mask', short:'MASK', name:'Shape clip with a masked edge', layer:2, pass:2, atoms:['clip','mask','feather'],
        params:{ feather_u:{ value:5, range:[0,24], unit:'u', note:'width over which coverage ramps down before a clip edge; stippled fields only' }, shapes:'rectangle · arch · ring with a gap' },
        limits:'A feather above ~20 u erodes a third of a narrow panel. On flat fields the ramp would show as a gray band, so it is off there.',
        implementation:'A field is drawn through a clip path. Three erasing strokes along the path then lower coverage toward the edge; the stipple turns that ramp into single pixels.' },
      { id:'fine-stipple', short:'STIP', name:'One-pixel stipple', layer:3, pass:3, atoms:['stochastic-screen','grain','coverage'],
        params:{ density:{ value:0.97, range:[0.3,1], note:'share of pixels on at full coverage' }, fade:{ value:0.42, range:[0,1], note:'coverage lost from the head of a capsule to its tail' }, edge_u:{ value:0.4, range:[0,3], unit:'u', note:'blur of the coverage before the threshold; it dissolves the capsule edge' }, all:{ value:0, range:[0,1], step:1, note:'1 = stipple every field in every variant' }, seed:{ value:17, range:[1,9999], step:1 } },
        limits:'edge above ~1.5 u dissolves the smallest capsules. density under ~0.5 reads as a tint, not as ink.',
        implementation:'Capsules are drawn into a coverage layer per ink. Each pixel of the layer is then set fully on or off: on when a random number is under coverage × density.' },
      { id:'capsule-helix', short:'HELX', name:'Capsule helix', layer:2, pass:2, atoms:['helix','sine','depth-cue'],
        params:{ rungs:{ value:46, range:[8,90], step:1 }, turns:{ value:2.5, range:[0.5,6] }, amplitude:{ value:0.92, range:[0.2,1], note:'share of the band height' }, width_u:{ value:6, range:[2,14], unit:'u' }, node_u:{ value:5, range:[0,12], unit:'u', note:'diameter of the strand dots at mid depth' }, phase:{ value:0, range:[0,1], note:'turns the helix; Motion runs it' }, strand_ink:3 },
        limits:'Over ~90 rungs the capsules touch and the helix reads as a ribbon. Under one turn there is no crossing and it reads as a lens.',
        implementation:'Each rung is a vertical capsule whose length is 2 × amplitude × |sin φ|. Two dots sit at its ends; the near strand’s dot is 45 % larger and the far one 45 % smaller.' },
      { id:'capsule-dial', short:'DIAL', name:'Capsule dial', layer:2, pass:2, atoms:['radial','rosette'],
        params:{ spokes:{ value:54, range:[8,120], step:1 }, inner_u:{ value:44, range:[10,120], unit:'u' }, length_u:[14,96], width_u:[3,9], lobes:{ value:3, range:[0,8], step:1 }, turn:{ value:0, range:[0,1], note:'turns the dial; Motion runs it' }, seed:{ value:6, range:[1,9999], step:1 } },
        limits:'Over ~120 spokes the inner ends overlap into a ring. lobes at 0 gives a plain sun.',
        implementation:'Capsules point outward from a circle. Length and width follow a sine with three lobes around the dial; ink follows the angle through the five bands.' },
      { id:'capsule-ui', short:'CTRL', name:'Controls from one pill', layer:4, pass:4, atoms:['pill','control','state'],
        params:{ height_u:{ value:38, range:[24,60], unit:'u' }, line_u:{ value:1.2, range:[0.4,4], unit:'u' }, type_u:{ value:11.5, range:[8,18], unit:'u' }, toggle:{ value:1, range:[0,1], step:1 }, slider:{ value:0.62, range:[0,1] }, page:{ value:1, range:[0,4], step:1 } },
        limits:'Under 24 u height the 11.5 u label touches the pill edge.',
        implementation:'Button, toggle, three chips, slider, pager and a nine-bar meter are all one rounded bar at different sizes, filled or outlined. The meter reads the slider value.' },
      { id:'capsule-icons', short:'ICON', name:'Capsule icons', layer:4, pass:4, atoms:['icon','round-cap','stroke'],
        params:{ scale:{ value:0.62, range:[0.3,0.9], note:'icon size as a share of its cell' }, stroke_u:{ value:7, range:[2,12], unit:'u' }, set:'arrow · plus · menu · signal · pause · check · sun · helix' },
        limits:'stroke above ~10 u closes the gaps in the sun and the helix.',
        implementation:'Each icon is two to eight straight round-cap strokes on a 2 × 2 unit square; the last stroke takes an ink.' },
      { id:'hairline-frame', short:'FRAME', name:'Hairline frame', layer:4, pass:4, atoms:['rule','frame'],
        params:{ line_u:{ value:1.2, range:[0.4,4], unit:'u' }, corner:'square, or the clip shape' },
        limits:'Above ~3 u the frame competes with the capsules.',
        implementation:'The clip path of a panel is stroked once over the field.' },
      { id:'tracked-label', short:'LABL', name:'Tracked mono label', layer:4, pass:4, atoms:['mono-caps','tracking','rule'],
        params:{ size_u:{ value:12.5, range:[8,24], unit:'u' }, tracking_em:{ value:0.22, range:[0,0.6], unit:'em' }, leading:{ value:1.65, range:[1.1,2.4] }, rule_u:[22,1.2], rule_gap_u:{ value:16, range:[4,40], unit:'u' } },
        limits:'Tracking above ~0.4 em breaks words into letters at this size.',
        implementation:'Capitals in JetBrains Mono, set letter by letter with 0.22 em added; a short rule sits one gap below the last line.' },
      { id:'sheet-grain', short:'TOOTH', name:'Sheet grain', layer:5, pass:5, atoms:['grain','stock'],
        params:{ amp:{ value:0.02, range:[0,0.1] }, seed:{ value:3, range:[1,9999], step:1 } },
        limits:'Above ~0.06 the grain shows inside the flat inks.',
        implementation:'A mono multiply grain over the finished sheet.' }
    ],
    pass_order:['sheet · flat','fields · capsules per ink layer, clipped; stippled fields eroded at the clip edge','stipple · coverage to on/off pixels','blend · ink layers onto the sheet','chrome · frames, block, controls, icons, labels','grain · 2 % mono'],
    notes:['Measured on ref.png: column pitch ≈ 7 px at 1080 px (6.5 u); longest capsule ≈ 84 px; frame rule ≈ 1.3 px; label cap height ≈ 9 px.','Words are invented and plain. The helix, dial, controls and icons are not in the reference; they are built from its capsule.']
  },
  techniques:{
    'wedge-envelope': (P,u,A)=>({ top:t=>1-(P.floor+(1-P.floor)*Math.pow(t,P.power)), scatter:P.scatter }),
    /* pick(t, k) → ink index for axis position t and a random k */
    'ink-bands': (P,u,A,V)=>({ blend:V.blend||P.blend, pick:(t0,k)=>{ const t=((t0+P.offset)%1+1)%1; let s=0; const w=P.centers.map(c=>{ const d=(t-c)/P.width; const v=Math.exp(-d*d); s+=v; return v; }); let a=k*s; for(let i=0;i<w.length;i++){ a-=w[i]; if(a<=0)return i; } return w.length-1; } }),
    /* columns(rect, opt) → capsules [{ i ink, x, y center, w, len, a angle }]. opt: { dir, env, inks, density, tfix, tink, seed } */
    'capsule-rain': (P,u,A)=>({ lean:P.lean_deg*Math.PI/180, columns:(R,opt)=>{ const r=A.rng(P.seed+(opt.seed||0)); const p=P.pitch_u*u, out=[];
        for(let cx=R.x+p*0.5;cx<R.x+R.w;cx+=p){ let t=(cx-R.x)/R.w; if(opt.dir<0)t=1-t; const tt=opt.tfix!==undefined?opt.tfix:t; const len0=A.lerp(P.length_u[0],P.length_u[1],Math.pow(tt,P.length_curve))*u, w=A.lerp(P.width_u[0],P.width_u[1],tt)*u;
          const top=opt.env?R.y+R.h*opt.env.top(t):R.y; const shift=((P.fall*(1+Math.floor(r()*3)))%1)*R.h; let y=-len0*r();
          while(y<R.h){ const len=Math.max(w,len0*(0.5+r())); const k=r(), j=(r()*2-1)*P.jitter_u*u, keep=r(), sc=r(), ti=r(), gap=r();
            if(keep<P.fill*(opt.density===undefined?1:opt.density)){ const m=((y+shift)%R.h+R.h)%R.h; for(let c=0;c<2;c++){ const yy=R.y+m-c*R.h; if(yy+len<R.y||yy>R.y+R.h)continue; if(opt.env&&yy<top&&!(sc<opt.env.scatter*Math.exp(-(top-yy)/R.h*14)))continue; out.push({ i:opt.inks.pick(opt.tink!==undefined?ti:t,k), x:cx+j, y:yy+len/2, w, len, a:0 }); } }
            y+=len*(1+P.gap*(0.4+gap*1.2)); } }
        return out; } }),
    'shape-mask': (P,u,A)=>({ rect:(c,R)=>{ c.beginPath(); c.rect(R.x,R.y,R.w,R.h); }, arch:(c,R)=>{ const r=R.w/2; c.beginPath(); c.moveTo(R.x,R.y+R.h); c.lineTo(R.x,R.y+r); c.arc(R.x+r,R.y+r,r,Math.PI,0); c.lineTo(R.x+R.w,R.y+R.h); c.closePath(); },
      ring:(c,cx,cy,ro,ri,g0,g1)=>{ c.beginPath(); c.arc(cx,cy,ro,g1,g0+6.2832,false); c.arc(cx,cy,ri,g0+6.2832,g1,true); c.closePath(); },
      erode:(c,path)=>{ const f=P.feather_u*u; if(f<=0)return; c.save(); c.globalCompositeOperation='destination-out'; c.lineJoin='round'; c.strokeStyle='#000'; c.globalAlpha=0.34; for(let k=3;k>=1;k--){ c.lineWidth=2*f*k/3; path(c); c.stroke(); } c.restore(); } }),
    /* apply(layer, color, salt): every pixel of the coverage layer becomes fully on in the color, or off */
    'fine-stipple': (P,u,A)=>({ fade:P.fade, edge:P.edge_u*u, all:P.all>0.5, apply:(layer,color,salt)=>{ const x=layer.getContext('2d'); const id=x.getImageData(0,0,layer.width,layer.height), d=id.data; const k=A.hex(color); let s=(P.seed+salt)|0;
        for(let o=0;o<d.length;o+=4){ const a=d[o+3]; if(a===0)continue; s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; if(((t^t>>>14)>>>0)/4294967296<a/255*P.density){ d[o]=k[0]; d[o+1]=k[1]; d[o+2]=k[2]; d[o+3]=255; } else d[o+3]=0; }
        x.putImageData(id,0,0); } }),
    'capsule-helix': (P,u,A)=>({ rungs:(R,inks)=>{ const out=[]; const n=P.rungs, amp=R.h*0.5*P.amplitude, cy=R.y+R.h/2, d=P.node_u*u; for(let k=0;k<n;k++){ const t=(k+0.5)/n; const X=R.x+R.w*t; const ph=6.2832*(P.turns*t+P.phase); const s=Math.sin(ph), z=Math.cos(ph);
          out.push({ i:inks.pick(t,0.5), x:X, y:cy, w:P.width_u*u*(0.7+0.3*Math.abs(z)), len:Math.max(P.width_u*u,Math.abs(s)*amp*2), a:0 });
          if(d>0){ out.push({ i:P.strand_ink, x:X, y:cy+s*amp, w:d*(1+0.45*z), len:d*(1+0.45*z), a:0 }); out.push({ i:P.strand_ink, x:X, y:cy-s*amp, w:d*(1-0.45*z), len:d*(1-0.45*z), a:0 }); } }
        return out; } }),
    'capsule-dial': (P,u,A)=>({ spokes:(cx,cy,inks)=>{ const out=[]; const n=P.spokes, r0=P.inner_u*u, r=A.rng(P.seed); for(let k=0;k<n;k++){ const t=k/n; const a=6.2832*(t+P.turn); const e=0.5+0.5*Math.sin(6.2832*t*P.lobes+1.2); const len=A.lerp(P.length_u[0],P.length_u[1],e)*u*(0.85+0.3*r()), w=A.lerp(P.width_u[0],P.width_u[1],e)*u, rc=r0+len/2;
          out.push({ i:inks.pick(t,r()), x:cx+Math.cos(a)*rc, y:cy+Math.sin(a)*rc, w, len, a:a-Math.PI/2 }); } return out; } }),
    'capsule-ui': (P,u,A)=>({ draw:(x,R,V)=>{ const rr=(X,Y,w,h,fill,stroke)=>{ const r=Math.min(w,h)/2; x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); if(fill){ x.fillStyle=fill; x.fill(); } if(stroke){ x.strokeStyle=stroke; x.lineWidth=P.line_u*u; x.stroke(); } };
        const sz=P.type_u*u, tr=0.16*sz; const text=(s,cx,cy,color)=>{ x.font=`500 ${sz}px "JetBrains Mono", monospace`; x.textBaseline='middle'; x.fillStyle=color; let w=-tr; for(const ch of s)w+=x.measureText(ch).width+tr; let X=cx-w/2; for(const ch of s){ x.fillText(ch,X,cy+sz*0.05); X+=x.measureText(ch).width+tr; } };
        const h=P.height_u*u, X=R.x, Y=R.y, on=P.toggle>0.5;
        rr(X,Y,150*u,h,V.ink); text('START',X+75*u,Y+h/2,V.sheet);
        const tx=X+172*u, tw=h*1.9; rr(tx,Y,tw,h,on?V.inks[4]:null,on?null:V.ink); x.fillStyle=on?V.sheet:V.ink; x.beginPath(); x.arc(on?tx+tw-h/2:tx+h/2,Y+h/2,h/2-4*u,0,6.2832); x.fill();
        let cxp=tx+tw+22*u; ['ONE','TWO','ALL'].forEach((s,i)=>{ const w=62*u; rr(cxp,Y,w,h,i===0?V.ink:null,i===0?null:V.ink); text(s,cxp+w/2,Y+h/2,i===0?V.sheet:V.ink); cxp+=w+8*u; });
        const sy=Y+h+36*u, sw=300*u, th=6*u; rr(X,sy-th/2,sw,th,null,V.ink); rr(X,sy-th/2,Math.max(th,sw*P.slider),th,V.inks[0]); rr(X+sw*P.slider-7*u,sy-13*u,14*u,26*u,V.ink);
        let cx2=X+336*u; for(let i=0;i<5;i++){ const act=i===Math.round(P.page); const w=act?26*u:8*u; rr(cx2,sy-4*u,w,8*u,act?V.inks[1]:V.ink); cx2+=w+8*u; }
        const mx=X+432*u; for(let i=0;i<9;i++){ const hh=(8+30*Math.abs(Math.sin(i*0.9+P.slider*6)))*u; rr(mx+i*9*u,sy+13*u-hh,5.5*u,hh,V.inks[i%V.inks.length]===V.sheet?V.ink:V.inks[i%V.inks.length]); } } }),
    'capsule-icons': (P,u,A)=>({ draw:(x,R,V)=>{ const cols=4, cell=R.w/cols, s=cell*0.5*P.scale; x.save(); x.lineCap='round'; x.lineWidth=P.stroke_u*u;
        const I=[ [[-0.6,0.6,0.6,-0.6],[0.6,-0.6,-0.15,-0.6],[0.6,-0.6,0.6,0.15]], [[-0.7,0,0.7,0],[0,-0.7,0,0.7]], [[-0.7,-0.5,0.7,-0.5],[-0.7,0,0.7,0],[-0.7,0.5,0.25,0.5]], [[-0.6,0.7,-0.6,0.35],[-0.2,0.7,-0.2,0],[0.2,0.7,0.2,-0.35],[0.6,0.7,0.6,-0.7]],
          [[-0.35,-0.6,-0.35,0.6],[0.35,-0.6,0.35,0.6]], [[-0.7,0.05,-0.2,0.55],[-0.2,0.55,0.7,-0.5]], 'sun', [[-0.7,-0.7,-0.7,0.7],[-0.35,-0.3,-0.35,0.3],[0.35,-0.3,0.35,0.3],[0.7,-0.7,0.7,0.7],[0,-0.02,0,0.02]] ];
        I.forEach((ic,k)=>{ const cx=R.x+cell*(k%cols+0.5), cy=R.y+cell*(Math.floor(k/cols)+0.5); let segs=ic; if(ic==='sun'){ segs=[]; for(let j=0;j<8;j++){ const a=j*Math.PI/4-Math.PI/2; segs.push([Math.cos(a)*0.42,Math.sin(a)*0.42,Math.cos(a)*0.8,Math.sin(a)*0.8]); } }
          segs.forEach((g,j)=>{ const acc=V.inks[k%V.inks.length]; x.strokeStyle=j===segs.length-1&&acc!==V.sheet?acc:V.ink; x.beginPath(); x.moveTo(cx+g[0]*s,cy+g[1]*s); x.lineTo(cx+g[2]*s,cy+g[3]*s); x.stroke(); }); });
        x.restore(); } }),
    'hairline-frame': (P,u,A)=>({ line:P.line_u*u, path:(x,path,color)=>{ path(x); x.strokeStyle=color; x.lineWidth=P.line_u*u; x.stroke(); } }),
    'tracked-label': (P,u,A)=>({ draw:(x,lines,X,Y,color,rule)=>{ const sz=P.size_u*u; x.font=`500 ${sz}px "JetBrains Mono", monospace`; x.textBaseline='alphabetic'; x.fillStyle=color; let y=Y;
        for(const ln of lines){ let cx=X; for(const ch of ln){ x.fillText(ch,cx,y); cx+=x.measureText(ch).width+P.tracking_em*sz; } y+=sz*P.leading; }
        if(rule!==false)x.fillRect(X,y-sz*P.leading+P.rule_gap_u*u,P.rule_u[0]*u,P.rule_u[1]*u); } }),
    'sheet-grain': (P,u,A)=>({ apply:ctx=>{ if(P.amp>0)A.grain(ctx,{amp:P.amp,pitch:1,seed:P.seed,mono:true}); } })
  },
  /* one capsule: center x, y; width w; length len along its own axis; angle a */
  pills(c,list,color,fade){ const k=window.ART.hex(color), solid='rgb('+k[0]+','+k[1]+','+k[2]+')'; for(const p of list){ const hw=p.w/2, hl=Math.max(p.len/2,hw); c.save(); c.translate(p.x,p.y); if(p.a)c.rotate(p.a);
      if(fade>0&&hl>hw*1.5){ const g=c.createLinearGradient(0,-hl,0,hl); g.addColorStop(0,solid); g.addColorStop(1,'rgba('+k[0]+','+k[1]+','+k[2]+','+(1-fade)+')'); c.fillStyle=g; } else c.fillStyle=solid;
      c.beginPath(); c.moveTo(-hw,-hl+hw); c.arc(0,-hl+hw,hw,Math.PI,0); c.lineTo(hw,hl-hw); c.arc(0,hl-hw,hw,0,Math.PI); c.closePath(); c.fill(); c.restore(); } },
  layout(u){ const R=(a,b,w,h)=>({ x:a*u, y:b*u, w:w*u, h:h*u }); return { hero:R(70,120,860,190), low:R(70,1070,640,120), ringBox:R(72,767,236,236), ring:[190*u,885*u,118*u,62*u,-0.6,0.6], arch:R(370,770,150,230), band:R(420,370,510,150), helix:R(442,388,466,114), dial:[215*u,505*u], ui:R(420,590,510,110), icons:R(610,780,320,160), block:R(760,1070,170,120) }; },
  /* fields: the sheet and every capsule field. W × H may be a reduced size (Motion). */
  fields(c,W,H,V,O){ const A=window.ART, S=window.STUDY, T=S.techniques, P=A.params(S.spec,O), u=W/1000; const x=c.getContext('2d'); x.setTransform(1,0,0,1,0,0);
    const env=T['wedge-envelope'](P['wedge-envelope'],u,A), inks=T['ink-bands'](P['ink-bands'],u,A,V), rain=T['capsule-rain'](P['capsule-rain'],u,A), mask=T['shape-mask'](P['shape-mask'],u,A), stip=T['fine-stipple'](P['fine-stipple'],u,A), helix=T['capsule-helix'](P['capsule-helix'],u,A), dial=T['capsule-dial'](P['capsule-dial'],u,A);
    const L=S.layout(u), n=V.inks.length, all=V.stipple||stip.all; x.globalCompositeOperation='source-over'; x.fillStyle=V.sheet; x.fillRect(0,0,W,H);
    const whole=k=>{ k.beginPath(); k.rect(0,0,W,H); };
    const panels=[
      { pills:rain.columns(L.hero,{ dir:1, env, inks, seed:0 }), path:k=>mask.rect(k,L.hero), lean:1, st:all, soft:1 },
      { pills:rain.columns(L.low,{ dir:-1, env, inks, seed:19 }), path:k=>mask.rect(k,L.low), lean:1, st:all, soft:1 },
      { pills:rain.columns(L.ringBox,{ dir:1, inks, seed:43, tfix:0.6, tink:1 }), path:k=>mask.ring(k,L.ring[0],L.ring[1],L.ring[2],L.ring[3],L.ring[4],L.ring[5]), lean:1, st:all, soft:1 },
      { pills:rain.columns(L.arch,{ dir:1, inks, seed:7, density:0.3, tfix:0.92, tink:1 }), path:k=>mask.arch(k,L.arch), lean:0, st:true, soft:1 },
      { pills:helix.rungs(L.helix,inks), path:k=>mask.rect(k,L.band), lean:0, st:all, soft:0 },
      { pills:dial.spokes(L.dial[0],L.dial[1],inks), path:whole, lean:0, st:all, soft:0 } ];
    const flat=[], grain=[]; const get=(set,i)=>set[i]||(set[i]=A.off(W,H));
    for(const p of panels){ const by=V.inks.map(()=>[]); for(const q of p.pills){ if(p.lean)q.a=rain.lean; by[q.i].push(q); }
      for(let i=0;i<n;i++){ if(!by[i].length)continue; const lx=get(p.st?grain:flat,i).getContext('2d'); lx.save(); p.path(lx); lx.clip(); S.pills(lx,by[i],V.inks[i],p.st?stip.fade:0); lx.restore(); if(p.st&&p.soft)mask.erode(lx,p.path); } }
    x.globalCompositeOperation=inks.blend;
    for(let i=0;i<n;i++){ if(flat[i])x.drawImage(flat[i],0,0); if(grain[i]){ const g=stip.edge>0?A.blur(grain[i],stip.edge):grain[i]; stip.apply(g,V.inks[i],i*7919); x.drawImage(g,0,0); } }
    x.globalCompositeOperation='source-over'; },
  /* chrome: frames, block, controls, icons and labels, always at full size */
  chrome(x,W,H,V,O){ const A=window.ART, S=window.STUDY, T=S.techniques, P=A.params(S.spec,O), u=W/1000;
    const frame=T['hairline-frame'](P['hairline-frame'],u,A), label=T['tracked-label'](P['tracked-label'],u,A), ui=T['capsule-ui'](P['capsule-ui'],u,A), icons=T['capsule-icons'](P['capsule-icons'],u,A), mask=T['shape-mask'](P['shape-mask'],u,A); const L=S.layout(u);
    frame.path(x,k=>mask.rect(k,L.band),V.rule); frame.path(x,k=>mask.arch(k,L.arch),V.rule);
    x.fillStyle=V.block; x.fillRect(L.block.x,L.block.y,L.block.w,L.block.h);
    ui.draw(x,L.ui,V); icons.draw(x,L.icons,V);
    label.draw(x,['CAPSULE','SYSTEM','PLATE 22'],70*u,52*u,V.ink);
    label.draw(x,['ONE','FIELD'],92*u,158*u,V.ink);
    label.draw(x,['DIAL','54 SPOKES'],70*u,700*u,V.ink);
    label.draw(x,['HELIX','46 RUNGS'],420*u,548*u,V.ink,false);
    label.draw(x,['RING','CUT'],70*u,1030*u,V.ink,false);
    label.draw(x,['ARCH','SPARSE'],540*u,790*u,V.ink,false);
    label.draw(x,['ICONS','EIGHT'],610*u,976*u,V.ink);
    label.draw(x,['RIGHT','TO','LEFT'],560*u,1094*u,V.ink,false);
    label.draw(x,['SOLID','BLOCK'],784*u,1122*u,V.blockText); },
  render(canvas,w,h,dpr,V,done,O){ const A=window.ART, S=window.STUDY; const W=canvas.width, H=canvas.height; S.fields(canvas,W,H,V,O); const x=canvas.getContext('2d'); S.chrome(x,W,H,V,O); S.techniques['sheet-grain'](A.params(S.spec,O)['sheet-grain'],W/1000,A).apply(x); if(done)done(); },
  /* motion: columns fall (9 s loop), the helix turns (6 s), the dial turns (40 s). Fields are printed at half size and shown without smoothing; chrome stays at full size. */
  motion(canvas,w,h,dpr,V,t,ctx){ const S=window.STUDY; const W=canvas.width, H=canvas.height, fw=Math.round(W/2), fh=Math.round(H/2); if(!S._f||S._f.width!==fw||S._f.height!==fh){ S._f=document.createElement('canvas'); S._f.width=fw; S._f.height=fh; }
    const O={ 'capsule-rain':{ fall:(t/9)%1 }, 'capsule-helix':{ phase:(t/6)%1 }, 'capsule-dial':{ turn:(t/40)%1 } }; S.fields(S._f,fw,fh,V,O);
    ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled=false; ctx.drawImage(S._f,0,0,W,H); S.chrome(ctx,W,H,V,O); ctx.restore(); },
  /* live: pointer x slides the inks and the slider; pointer y sets the helix turns */
  pointer(px,py){ return { 'ink-bands':{ offset:px-0.5 }, 'capsule-ui':{ slider:px }, 'capsule-helix':{ turns:0.8+4*py } }; },
  liveScale:1.5,
  live(V){ const S=window.STUDY, A=window.ART; const fn=f=>{ const s=f.toString(); return /^(function\b|\(|[\w$]+\s*=>)/.test(s)?s:'function '+s; };
    const art=Object.keys(A).map(k=>'A.'+k+'='+fn(A[k])+';').join('\n'); const tech='{'+Object.keys(S.techniques).map(k=>JSON.stringify(k)+':'+fn(S.techniques[k])).join(',')+'}';
    const extra=Object.keys(S).filter(k=>typeof S[k]==='function'&&k!=='live'&&k!=='motion').map(k=>k+':'+fn(S[k])).join(',');
    return `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="../../_shared/fonts.css"><style>html,body{margin:0;height:100%;overflow:hidden}canvas{width:100%;height:100%;display:block;cursor:crosshair;touch-action:none}</style><canvas id="c"></canvas><script>
const A={};${art}
window.ART=A; window.STUDY={spec:${JSON.stringify(S.spec)},techniques:${tech},${extra}};
const S=window.STUDY,V=${JSON.stringify(V)},c=document.getElementById('c'),d=${S.liveScale||0.6};let px=0.62,py=0.42,q=0;
const draw=()=>{q=0;c.width=Math.max(2,Math.round(innerWidth*d));c.height=Math.max(2,Math.round(innerHeight*d));S.render(c,innerWidth,innerHeight,d,V,null,S.pointer(px,py));};
addEventListener('pointermove',e=>{px=e.clientX/innerWidth;py=e.clientY/innerHeight;if(!q)q=requestAnimationFrame(draw);});addEventListener('resize',draw);(document.fonts?document.fonts.ready:Promise.resolve()).then(draw);
<\/script>`; }
};
