window.STUDY={
  id:'ts-19-arc-bundle-field', code:'TS-19', fig:'1.19',
  title:'Arc bundles on a dashed globe',
  kicker:'Technique · TS-19',
  lede:'Fans of thin gradient arcs from one hub, over dashed meridians.',
  body:[
    'Fourteen bundles leave one hub. A bundle is 10 to 34 thin strokes that end side by side along a short line, each a little shorter than the last, so the strokes nest. Each stroke is a quadratic curve whose bend grows across the bundle. Color runs along every stroke from a faint root to full ink at the tip, and strokes add where they cross.',
    'Behind them, eleven dashed meridians of one sphere and one solid axis. Small square nodes carry a number in a 13.5 u sans. A blurred copy of the strokes is added back at 35 % as glow.'
  ],
  source:'Reference 19 · arc-bundle data picture on black, 702 × 405 crop',
  spot:[30,107,255], ref:{w:702,h:405},
  variantLabel:'Inks',
  variants:[
    { id:'ref',   label:'Blue',  sw:['#000000','#1E6BFF','#19C8FF','#B46CFF','#3DF0A0'], spot:[30,107,255], ground:'#000000', grid:'#8C8C90', text:'#FFFFFF', root:'#DCE8FF', inks:['#1E6BFF','#19C8FF','#B46CFF','#3DF0A0','#2A4BFF'] },
    { id:'io',    label:'Ø',     sw:['#101014','#F4551E','#2F5AE6','#FFFFFF'], spot:[244,85,30],  ground:'#101014', grid:'#77777F', text:'#FFFFFF', root:'#FFE9DF', inks:['#F4551E','#2F5AE6','#F4551E','#FF9A6E','#2F5AE6'] },
    { id:'paper', label:'Paper', sw:['#FFFFFF','#101014','#2F5AE6','#E0402D'], spot:[47,90,230],  ground:'#FFFFFF', grid:'#9A9AA2', text:'#101014', root:'#101014', inks:['#2F5AE6','#101014','#E0402D','#2F5AE6','#101014'], blend:'multiply' },
    { id:'heat',  label:'Heat',  sw:['#0B0508','#FF3D2E','#FFB000','#FF5FA8'], spot:[255,61,46],  ground:'#0B0508', grid:'#8A7F84', text:'#FFF4EC', root:'#FFF1D6', inks:['#FF3D2E','#FFB000','#FF5FA8','#FF7A1A','#FFD23F'] }
  ],
  points:[
    {u:0.47,v:0.50,d:'HUB',label:'Hub · every stroke starts here',t:'arc-bundle',dir:[1,1]},
    {u:0.22,v:0.30,d:'ARC',label:'Bundle · 10 to 34 strokes ending along a 78 u line',t:'arc-bundle',dir:[-1,-1]},
    {u:0.80,v:0.62,d:'ARC',label:'Nested arcs · bend grows from 0.04 to 0.36 across the bundle',t:'arc-bundle',dir:[1,1]},
    {u:0.36,v:0.80,d:'GRAD',label:'Stroke gradient · 20 % at the root, 66 % at the tip',t:'stroke-gradient',dir:[-1,1]},
    {u:0.60,v:0.22,d:'GRAD',label:'Crossings add · lighter blend',t:'stroke-gradient',dir:[1,-1]},
    {u:0.50,v:0.36,d:'GLOW',label:'Glow · strokes blurred 5 u, added at 35 %',t:'glow-pass',dir:[1,-1]},
    {u:0.12,v:0.62,d:'GRID',label:'Meridian · dashed 6 on 5 u, 1.1 u line',t:'meridian-grid',dir:[-1,1]},
    {u:0.50,v:0.06,d:'GRID',label:'Axis · the one solid meridian',t:'meridian-grid',dir:[1,-1]},
    {u:0.86,v:0.26,d:'NODE',label:'Node · 3.4 u square with a number',t:'node-label',dir:[1,-1]},
    {u:0.70,v:0.90,d:'NODE',label:'Label · 13.5 u sans, one decimal',t:'node-label',dir:[1,1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[702,405], grammar:'bundles of thin gradient arcs from a hub on black; dashed meridians of a sphere; small square nodes with numeric labels; soft glow' },
    units:'design units, 1000 = sheet width',
    palette:{ ground:'#000000', grid:'#8C8C90', text:'#FFFFFF', blue:'#1E6BFF', cyan:'#19C8FF', violet:'#B46CFF', green:'#3DF0A0' },
    techniques:[
      { id:'meridian-grid', short:'GRID', name:'Dashed meridians', layer:1, pass:1, atoms:['sphere','ellipse','dash'],
        params:{ center_u:[500,288], radius_u:{ value:560, range:[200,1200], unit:'u' }, count:{ value:11, range:[3,31], step:1 }, dash_u:[6,5], line_u:{ value:1.1, range:[0.4,3], unit:'u' }, tilt_deg:{ value:0, range:[-30,30], unit:'°' }, axis:'the middle meridian is solid' },
        limits:'Over ~31 meridians the dashes of neighbors align into bands. A radius under the half-height of the sheet shows the sphere outline and the picture reads as a ball, not a field.',
        implementation:'Each meridian is an ellipse with the sphere radius as its tall axis and radius·|sin λ| as its wide one, stroked with a 6 on 5 dash.' },
      { id:'arc-bundle', short:'ARC', name:'Nested arc bundle', layer:2, pass:2, atoms:['bezier','fan','bundle'],
        params:{ hub_u:[470,292], bundles:{ value:14, range:[1,24], step:1 }, strands:[10,34], reach_u:[230,520], fan_u:{ value:78, range:[10,400], unit:'u', note:'length of the line the strokes end along' }, stagger:{ value:0.3, range:[0,0.8], note:'share of the reach by which stroke ends step back across the bundle' }, bend:[0.04,0.36], line_u:{ value:1.5, range:[0.4,4], unit:'u' }, seed:{ value:404, range:[1,9999], step:1 }, curve:'quadratic; control point at mid-chord, pushed sideways by bend × chord length' },
        limits:'fan under ~10 u collapses a bundle to one thick line. Past ~24 bundles the sheet fills and single arcs stop reading.',
        implementation:'For each bundle a target point is picked around the hub; stroke ends are spaced along a line through it, and each stroke is a quadratic curve whose sideways bend steps up across the bundle.' },
      { id:'stroke-gradient', short:'GRAD', name:'Along-stroke gradient', layer:2, pass:2, atoms:['gradient','additive'],
        params:{ root_alpha:{ value:0.2, range:[0,1] }, tip_alpha:{ value:0.66, range:[0,1] }, ink_step:'ink index steps across the bundle, mixed with the next ink', blend:'lighter' },
        limits:'With both alphas at 1 on a dark ground, crossings near the hub clip to white.',
        implementation:'A linear gradient from the hub to the stroke end colors each stroke: faint at the root, full ink at the tip. Strokes are composited with the lighter blend.' },
      { id:'glow-pass', short:'GLOW', name:'Additive glow', layer:3, pass:3, atoms:['blur','additive'],
        params:{ sigma_u:{ value:5, range:[0,30], unit:'u' }, gain:{ value:0.35, range:[0,1.5] } },
        limits:'gain above ~1 washes the thin strokes into a haze.',
        implementation:'The stroke layer is blurred and added back over itself.' },
      { id:'node-label', short:'NODE', name:'Numbered nodes', layer:4, pass:4, atoms:['marker','data-label'],
        params:{ nodes:{ value:34, range:[0,90], step:1 }, square_u:{ value:3.4, range:[1.5,8], unit:'u' }, type_u:{ value:13.5, range:[9,26], unit:'u' }, offset_u:[5,-5], seed:{ value:52, range:[1,9999], step:1 }, format:'three digits, one decimal' },
        limits:'Over ~60 nodes the labels overlap. Type under 9 u is unreadable at 900 px.',
        implementation:'Square markers sit on bundle ends and on seeded free points; each carries a seeded number set up and to the right.' }
    ],
    pass_order:['ground · flat','grid · dashed meridians, one solid axis','arcs · bundles from the hub, gradient strokes, lighter blend','glow · blurred copy added','nodes · squares and numbers'],
    notes:['Measured on ref.png: stroke ≈ 0.9 px at 702 px (1.25 u); dash ≈ 4 px on, 3.5 px off; label cap height ≈ 7.5 px.','The numbers are generated and stand for nothing. The subject is new: hub, bundle directions and node positions differ from the reference.']
  },
  techniques:{
    'meridian-grid': (P,u,A)=>({ draw:(x,color)=>{ const cx=P.center_u[0]*u, cy=P.center_u[1]*u, R=P.radius_u*u; x.save(); x.translate(cx,cy); x.rotate(P.tilt_deg*Math.PI/180); x.strokeStyle=color; x.lineWidth=P.line_u*u; const n=P.count, mid=(n-1)/2;
        for(let i=0;i<n;i++){ const lam=(i-mid)/(mid+1)*Math.PI/2; const rx=Math.abs(Math.sin(lam))*R; x.setLineDash(i===Math.round(mid)?[]:[P.dash_u[0]*u,P.dash_u[1]*u]); x.beginPath(); if(rx<0.5){ x.moveTo(0,-R); x.lineTo(0,R); } else x.ellipse(0,0,rx,R,0,lam<0?Math.PI/2:-Math.PI/2,lam<0?Math.PI*1.5:Math.PI/2); x.stroke(); }
        x.setLineDash([]); x.restore(); } }),
    /* strands(): [{ x0,y0, cx,cy, x1,y1, t (0..1 across the bundle), b (bundle index) }] in device px */
    'arc-bundle': (P,u,A)=>({ line:P.line_u*u, strands:()=>{ const r=A.rng(P.seed); const hx=P.hub_u[0]*u, hy=P.hub_u[1]*u; const out=[];
        for(let b=0;b<P.bundles;b++){ const th=(b+r()*0.8)/P.bundles*6.2832; const reach=A.lerp(P.reach_u[0],P.reach_u[1],r())*u; const tx=hx+Math.cos(th)*reach*1.35, ty=hy+Math.sin(th)*reach*0.62;
          const n=Math.round(A.lerp(P.strands[0],P.strands[1],r())); const fa=th+1.5708+(r()-0.5)*1.2; const fan=P.fan_u*u*(0.5+r()); const sign=r()<0.5?-1:1; const b0=P.bend[0], b1=P.bend[1]*(0.5+0.5*r());
          for(let k=0;k<n;k++){ const t=n>1?k/(n-1):0; const back=1-P.stagger*t*(0.6+0.4*r()); const ex=hx+(tx+Math.cos(fa)*fan*(t-0.5)-hx)*back, ey=hy+(ty+Math.sin(fa)*fan*(t-0.5)-hy)*back; const dx=ex-hx, dy=ey-hy, L=Math.hypot(dx,dy); const bend=sign*A.lerp(b0,b1,t*t)*L;
            out.push({ x0:hx, y0:hy, cx:hx+dx*0.5-dy/L*bend, cy:hy+dy*0.5+dx/L*bend, x1:ex, y1:ey, t, b }); } }
        return out; } }),
    'stroke-gradient': (P,u,A,V)=>({ blend:V.blend||P.blend, style:(x,s)=>{ const inks=V.inks.map(A.hex); const f=s.b+s.t*1.6; const a=inks[Math.floor(f)%inks.length], b=inks[(Math.floor(f)+1)%inks.length]; const ink=A.mix(a,b,f-Math.floor(f));
        const g=x.createLinearGradient(s.x0,s.y0,s.x1,s.y1); g.addColorStop(0,A.rgb(A.mix(A.hex(V.root),ink,0.6),P.root_alpha)); g.addColorStop(0.3,A.rgb(ink,(P.root_alpha+P.tip_alpha)/2)); g.addColorStop(1,A.rgb(ink,P.tip_alpha)); return g; } }),
    'glow-pass': (P,u,A)=>({ apply:(x,layer,dpr,blend)=>{ if(P.gain<=0||P.sigma_u<=0)return; const g=A.blur(layer,P.sigma_u*u); x.save(); x.globalCompositeOperation=blend; x.globalAlpha=Math.min(1,P.gain); x.drawImage(g,0,0); if(P.gain>1){ x.globalAlpha=P.gain-1; x.drawImage(g,0,0); } x.restore(); } }),
    'node-label': (P,u,A)=>({ draw:(x,ends,W,H,color)=>{ const r=A.rng(P.seed); const s=P.square_u*u; x.fillStyle=color; x.font=`400 ${P.type_u*u}px Inter, sans-serif`; x.textBaseline='alphabetic';
        for(let i=0;i<P.nodes;i++){ let X,Y; if(i<ends.length&&r()<0.6){ X=ends[i][0]; Y=ends[i][1]; r(); } else { X=(0.04+0.92*r())*W; Y=(0.06+0.88*r())*H; }
          const v=(r()*900+10).toFixed(1).padStart(5,'0'); if(X<0||Y<0||X>W||Y>H)continue; x.fillRect(X-s/2,Y-s/2,s,s); x.fillText(v,X+P.offset_u[0]*u,Y+P.offset_u[1]*u); } } })
  },
  render(canvas,w,h,dpr,V,done,O){
    const A=window.ART; const W=canvas.width,H=canvas.height; const u=W/1000; const x=canvas.getContext('2d'); x.setTransform(1,0,0,1,0,0);
    const S=window.STUDY; const T=S.techniques, P=A.params(S.spec,O);
    const grid=T['meridian-grid'](P['meridian-grid'],u,A), arcs=T['arc-bundle'](P['arc-bundle'],u,A), grad=T['stroke-gradient'](P['stroke-gradient'],u,A,V), glow=T['glow-pass'](P['glow-pass'],u,A), nodes=T['node-label'](P['node-label'],u,A);
    x.fillStyle=V.ground; x.fillRect(0,0,W,H);
    grid.draw(x,V.grid);
    const layer=A.off(W,H), lx=layer.getContext('2d'); lx.lineCap='round'; lx.lineWidth=arcs.line; lx.globalCompositeOperation=grad.blend==='multiply'?'source-over':grad.blend;
    const st=arcs.strands(); const ends=[]; let last=-1;
    for(const s of st){ lx.strokeStyle=grad.style(lx,s); lx.beginPath(); lx.moveTo(s.x0,s.y0); lx.quadraticCurveTo(s.cx,s.cy,s.x1,s.y1); lx.stroke(); if(s.b!==last||s.t===1){ ends.push([s.x1,s.y1]); last=s.b; } }
    x.save(); x.globalCompositeOperation=grad.blend; x.drawImage(layer,0,0); x.restore();
    if(grad.blend!=='multiply')glow.apply(x,layer,dpr,grad.blend);   // on a light ground the blurred copy only grays the paper
    nodes.draw(x,ends,W,H,V.text);
    if(done)done();
  }
};
