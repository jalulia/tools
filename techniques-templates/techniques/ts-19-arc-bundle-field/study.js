window.STUDY={
  id:'ts-19-arc-bundle-field', code:'TS-19', fig:'1.19',
  title:'Arc bundles on a dashed globe',
  kicker:'Technique · TS-19',
  lede:'Bundles of thin arcs leave one hub as a trunk and fan apart at the far end.',
  body:['Twelve bundles leave one hub, and every strand in a bundle shares its first direction. The far ends spread over 0.2 to 0.6 rad and turn by up to 1.1 rad, so each bundle opens from one trunk into separate arcs. Color runs along each strand through three inks and adds where strands cross, over eleven dashed meridians and numbered square nodes.'], motionHint:'Play sways the bundles and runs a pulse down each strand.', liveLabel:'Follow pointer', liveHint:'Follow pointer moves the hub to your cursor.',
  source:'Reference 19 · arc-bundle data picture on black, 702 × 405 crop',
  spot:[30,107,255], ref:{w:702,h:405},
  variantLabel:'Inks',
  variants:[
    { id:'ref',   label:'Blue',  sw:['#000000','#1E6BFF','#19C8FF','#B46CFF','#3DF0A0'], spot:[30,107,255], ground:'#000000', grid:'#8C8C90', text:'#FFFFFF', root:'#DCE8FF', inks:['#19C8FF','#1E6BFF','#B46CFF','#2A4BFF','#3DF0A0'] },
    { id:'io',    label:'Ø',     sw:['#101014','#F4551E','#2F5AE6','#FFFFFF'], spot:[244,85,30],  ground:'#101014', grid:'#77777F', text:'#FFFFFF', root:'#FFE9DF', inks:['#FF9A6E','#F4551E','#2F5AE6','#F4551E','#2F5AE6'] },
    { id:'paper', label:'Paper', sw:['#FFFFFF','#101014','#2F5AE6','#E0402D'], spot:[47,90,230],  ground:'#FFFFFF', grid:'#9A9AA2', text:'#101014', root:'#101014', inks:['#2F5AE6','#101014','#E0402D','#2F5AE6','#101014'], blend:'multiply' },
    { id:'heat',  label:'Heat',  sw:['#0B0508','#FF3D2E','#FFB000','#FF5FA8'], spot:[255,61,46],  ground:'#0B0508', grid:'#8A7F84', text:'#FFF4EC', root:'#FFF1D6', inks:['#FFD23F','#FFB000','#FF3D2E','#FF5FA8','#FF7A1A'] }
  ],
  points:[
    {u:0.47,v:0.50,d:'ARC',label:'Hub · every strand starts here',t:'arc-bundle',dir:[1,1]},
    {u:0.36,v:0.40,d:'ARC',label:'Trunk · strands share one first direction',t:'arc-bundle',dir:[-1,-1]},
    {u:0.84,v:0.30,d:'ARC',label:'Fan · ends spread over 0.2 to 0.6 rad',t:'arc-bundle',dir:[1,-1]},
    {u:0.22,v:0.74,d:'GRAD',label:'Stroke gradient · three inks from root to tip',t:'stroke-gradient',dir:[-1,1]},
    {u:0.56,v:0.56,d:'GRAD',label:'Crossings add · lighter blend',t:'stroke-gradient',dir:[1,1]},
    {u:0.44,v:0.36,d:'GLOW',label:'Glow · strands blurred 5 u, added at 35 %',t:'glow-pass',dir:[1,-1]},
    {u:0.10,v:0.50,d:'GRID',label:'Meridian · dashed 6 on 5 u, 1.1 u line',t:'meridian-grid',dir:[-1,1]},
    {u:0.50,v:0.06,d:'GRID',label:'Axis · the one solid meridian',t:'meridian-grid',dir:[1,-1]},
    {u:0.90,v:0.62,d:'NODE',label:'Node · 3.4 u square with a number',t:'node-label',dir:[1,1]},
    {u:0.70,v:0.92,d:'NODE',label:'Label · 13.5 u sans, one decimal',t:'node-label',dir:[1,1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[702,405], grammar:'bundles of thin gradient arcs from a hub on black; dashed meridians of a sphere; small square nodes with numeric labels; soft glow' },
    units:'design units, 1000 = sheet width; the plate is 1000 × 577',
    palette:{ ground:'#000000', grid:'#8C8C90', text:'#FFFFFF', blue:'#1E6BFF', cyan:'#19C8FF', violet:'#B46CFF', green:'#3DF0A0' },
    techniques:[
      { id:'meridian-grid', short:'GRID', name:'Dashed meridians', layer:1, pass:1, atoms:['sphere','ellipse','dash'],
        params:{ center_u:[500,288], radius_u:{ value:560, range:[200,1200], unit:'u' }, count:{ value:11, range:[3,31], step:1 }, dash_u:[6,5], line_u:{ value:1.1, range:[0.4,3], unit:'u' }, tilt_deg:{ value:0, range:[-30,30], unit:'°' }, axis:'the middle meridian is solid' },
        limits:'Over ~31 meridians the dashes of neighbors align into bands. A radius under half the sheet height shows the sphere outline.',
        implementation:'Each meridian is an ellipse with the sphere radius as its tall axis and radius·|sin λ| as its wide one, stroked with a 6 on 5 dash.' },
      { id:'arc-bundle', short:'ARC', name:'Trunk-and-fan arc bundle', layer:2, pass:2, atoms:['bezier','fan','bundle'],
        params:{ hub:{ x:{ value:470, range:[0,1000], unit:'u' }, y:{ value:292, range:[0,577], unit:'u' } }, bundles:{ value:12, range:[1,24], step:1 }, strands:[8,30], reach_u:[420,900], trunk:{ value:0.5, range:[0.2,0.9], note:'control point distance, as a share of the reach' }, spread:[0.2,0.6], curl:[0.3,1.1],
          squash:{ value:0.72, range:[0.3,1.2], note:'vertical scale of the whole fan' }, line_u:{ value:1.8, range:[0.4,4], unit:'u' }, line_var:{ value:0.5, range:[0,1] }, sway:{ value:0, range:[0,1], note:'swings every bundle through one cycle; Motion runs it' }, pulse_u:{ value:46, range:[8,200], unit:'u', note:'length of the moving pulse' }, pulse_s:{ value:3.2, range:[0.5,12], unit:'s', note:'time for a pulse to run a strand' }, seed:{ value:404, range:[1,9999], step:1 } },
        limits:'trunk under ~0.25 lets strands separate at the hub and the bundle reads as a plain fan. Past ~24 bundles the sheet fills and single arcs stop reading.',
        implementation:'Each strand is a quadratic curve from the hub. Its control point lies on the bundle’s ray at trunk × reach; its end is turned from that ray by the curl plus its share of the spread.' },
      { id:'stroke-gradient', short:'GRAD', name:'Along-stroke gradient', layer:2, pass:2, atoms:['gradient','additive'],
        params:{ root_alpha:{ value:0.34, range:[0,1] }, tip_alpha:{ value:0.8, range:[0,1] }, stops:'root tint at 0, second ink at 0.4, third ink at 1', blend:'lighter' },
        limits:'With both alphas at 1 on a dark ground the whole trunk clips to white.',
        implementation:'A linear gradient from the hub to the strand end colors each strand through three inks; strands are composited with the lighter blend.' },
      { id:'glow-pass', short:'GLOW', name:'Additive glow', layer:3, pass:3, atoms:['blur','additive'],
        params:{ sigma_u:{ value:5, range:[0,30], unit:'u' }, gain:{ value:0.35, range:[0,1.5] } },
        limits:'gain above ~1 washes the thin strands into a haze. On a light ground the pass is skipped: it would only gray the paper.',
        implementation:'The strand layer is blurred and added back over itself.' },
      { id:'node-label', short:'NODE', name:'Numbered nodes', layer:4, pass:4, atoms:['marker','data-label'],
        params:{ nodes:{ value:34, range:[0,90], step:1 }, square_u:{ value:3.4, range:[1.5,8], unit:'u' }, type_u:{ value:13.5, range:[9,26], unit:'u' }, offset_u:[5,-5], seed:{ value:52, range:[1,9999], step:1 }, format:'three digits, one decimal' },
        limits:'Over ~60 nodes the labels overlap. Type under 9 u is unreadable at 900 px.',
        implementation:'Square markers sit on bundle ends and on seeded free points; each carries a seeded number set up and to the right.' }
    ],
    pass_order:['ground · flat','grid · dashed meridians, one solid axis','arcs · trunk-and-fan bundles, gradient strokes, lighter blend','glow · blurred copy added','nodes · squares and numbers'],
    notes:['Measured on ref.png: stroke ≈ 1.3 px at 702 px (1.8 u); dash ≈ 4 px on, 3.5 px off; label cap height ≈ 7 px.','The numbers are generated and stand for nothing. The hub, bundle directions and node positions differ from the reference.']
  },
  techniques:{
    'meridian-grid': (P,u,A)=>({ draw:(x,color)=>{ const cx=P.center_u[0]*u, cy=P.center_u[1]*u, R=P.radius_u*u; x.save(); x.translate(cx,cy); x.rotate(P.tilt_deg*Math.PI/180); x.strokeStyle=color; x.lineWidth=P.line_u*u; const n=P.count, mid=(n-1)/2;
        for(let i=0;i<n;i++){ const lam=(i-mid)/(mid+1)*Math.PI/2; const rx=Math.abs(Math.sin(lam))*R; x.setLineDash(i===Math.round(mid)?[]:[P.dash_u[0]*u,P.dash_u[1]*u]); x.beginPath(); if(rx<0.5){ x.moveTo(0,-R); x.lineTo(0,R); } else x.ellipse(0,0,rx,R,0,lam<0?Math.PI/2:-Math.PI/2,lam<0?Math.PI*1.5:Math.PI/2); x.stroke(); }
        x.setLineDash([]); x.restore(); } }),
    /* strands(): [{ x0,y0, cx,cy, x1,y1, t (0..1 across the bundle), b (bundle), lw (width factor), len }] in device px */
    'arc-bundle': (P,u,A)=>({ line:P.line_u*u, pulse:P.pulse_u*u, pulse_s:P.pulse_s, strands:()=>{ const r=A.rng(P.seed); const hx=P.hub.x*u, hy=P.hub.y*u, out=[];
        for(let b=0;b<P.bundles;b++){ const phi=(b+0.2+0.6*r())/P.bundles*6.2832; const reach=A.lerp(P.reach_u[0],P.reach_u[1],r())*u; const n=Math.round(A.lerp(P.strands[0],P.strands[1],r())); const sg=r()<0.5?-1:1;
          const curl=sg*A.lerp(P.curl[0],P.curl[1],r())+0.22*(Math.sin(6.2832*P.sway+b*1.3)-Math.sin(b*1.3)); const spread=A.lerp(P.spread[0],P.spread[1],r()); const trunk=P.trunk*(0.85+0.3*r());
          const cx=hx+Math.cos(phi)*reach*trunk, cy=hy+Math.sin(phi)*reach*trunk*P.squash;
          for(let k=0;k<n;k++){ const t=n>1?k/(n-1):0; const a=phi+curl*(0.55+0.45*t)+sg*spread*(t-0.5); const L=reach*(0.82+0.3*r()); const lw=1-P.line_var*r(); const j=(r()-0.5)*5*u;
            out.push({ x0:hx, y0:hy, cx:cx+j, cy:cy-j, x1:hx+Math.cos(a)*L, y1:hy+Math.sin(a)*L*P.squash, t, b, lw, len:L }); } }
        return out; } }),
    'stroke-gradient': (P,u,A,V)=>{ const inks=V.inks.map(A.hex), root=A.hex(V.root), n=inks.length; return { blend:V.blend||P.blend, style:(x,s)=>{ const i=(s.b+Math.floor(s.t*2.999))%n; const g=x.createLinearGradient(s.x0,s.y0,s.x1,s.y1);
        g.addColorStop(0,A.rgb(A.mix(root,inks[i],0.55),P.root_alpha)); g.addColorStop(0.4,A.rgb(inks[(i+1)%n],(P.root_alpha+P.tip_alpha)/2)); g.addColorStop(1,A.rgb(inks[(i+2)%n],P.tip_alpha)); return g; } }; },
    'glow-pass': (P,u,A)=>({ apply:(x,layer,blend)=>{ if(P.gain<=0||P.sigma_u<=0)return; const g=A.blur(layer,P.sigma_u*u); x.save(); x.globalCompositeOperation=blend; x.globalAlpha=Math.min(1,P.gain); x.drawImage(g,0,0); if(P.gain>1){ x.globalAlpha=P.gain-1; x.drawImage(g,0,0); } x.restore(); } }),
    'node-label': (P,u,A)=>({ draw:(x,ends,W,H,color)=>{ const r=A.rng(P.seed); const s=P.square_u*u; x.fillStyle=color; x.font=`400 ${P.type_u*u}px Inter, sans-serif`; x.textBaseline='alphabetic';
        for(let i=0;i<P.nodes;i++){ let X,Y; const a=r(), b=r(), c=r(); if(i<ends.length&&a<0.7){ X=ends[i][0]; Y=ends[i][1]; } else { X=(0.04+0.92*b)*W; Y=(0.06+0.88*c)*H; }
          const v=(r()*900+10).toFixed(1).padStart(5,'0'); if(X<0||Y<0||X>W||Y>H)continue; x.fillRect(Math.round(X-s/2),Math.round(Y-s/2),Math.round(s),Math.round(s)); x.fillText(v,X+P.offset_u[0]*u,Y+P.offset_u[1]*u); } } })
  },
  /* shared by render and motion; t is seconds, or null for the still */
  draw(x,W,H,V,O,t){ const A=window.ART, S=window.STUDY, T=S.techniques, P=A.params(S.spec,O), u=W/1000;
    const grid=T['meridian-grid'](P['meridian-grid'],u,A), arcs=T['arc-bundle'](P['arc-bundle'],u,A), grad=T['stroke-gradient'](P['stroke-gradient'],u,A,V), glow=T['glow-pass'](P['glow-pass'],u,A), nodes=T['node-label'](P['node-label'],u,A);
    x.fillStyle=V.ground; x.fillRect(0,0,W,H); grid.draw(x,V.grid);
    const add=grad.blend!=='multiply'; const layer=A.off(W,H), lx=layer.getContext('2d'); lx.lineCap='round'; lx.globalCompositeOperation=add?grad.blend:'source-over';
    const st=arcs.strands(), ends=[]; const path=s=>{ lx.beginPath(); lx.moveTo(s.x0,s.y0); lx.quadraticCurveTo(s.cx,s.cy,s.x1,s.y1); lx.stroke(); };
    for(const s of st){ lx.lineWidth=arcs.line*s.lw; lx.strokeStyle=grad.style(lx,s); path(s); if(s.t===0||s.t===1)ends.push([s.x1,s.y1]); }
    if(t!==null&&t!==undefined){ lx.strokeStyle=A.rgb(A.hex(V.root),add?0.9:0.55); for(const s of st){ lx.lineWidth=arcs.line*s.lw*1.5; lx.setLineDash([arcs.pulse,9000*u]); lx.lineDashOffset=-(((t/arcs.pulse_s+s.b*0.37+s.t*0.21)%1)*s.len*1.3); path(s); } lx.setLineDash([]); }
    x.save(); x.globalCompositeOperation=grad.blend; x.drawImage(layer,0,0); x.restore(); if(add)glow.apply(x,layer,grad.blend);
    nodes.draw(x,ends,W,H,V.text); },
  render(canvas,w,h,dpr,V,done,O){ const x=canvas.getContext('2d'); x.setTransform(1,0,0,1,0,0); window.STUDY.draw(x,canvas.width,canvas.height,V,O,null); if(done)done(); },
  /* motion: every bundle sways once in 12 s and a pulse runs each strand in 3.2 s */
  motion(canvas,w,h,dpr,V,t,ctx,UO){ const MO=(a,b)=>{ const o={}; for(const k of new Set([...Object.keys(a||{}),...Object.keys(b||{})]))o[k]=Object.assign({},(a||{})[k],(b||{})[k]); return o; }; ctx.save(); ctx.setTransform(1,0,0,1,0,0); window.STUDY.draw(ctx,canvas.width,canvas.height,V,MO(UO,{ 'arc-bundle':{ sway:(t/12)%1 } }),t); ctx.restore(); },
  /* live: the pointer carries the hub */
  pointer(px,py){ return { 'arc-bundle':{ 'hub.x':px*1000, 'hub.y':py*577 } }; },
  liveScale:1.5,
  live(V,UO){ const S=window.STUDY, A=window.ART; const fn=f=>{ const s=f.toString(); return /^(function\b|\(|[\w$]+\s*=>)/.test(s)?s:'function '+s; };
    const art=Object.keys(A).map(k=>'A.'+k+'='+fn(A[k])+';').join('\n'); const tech='{'+Object.keys(S.techniques).map(k=>JSON.stringify(k)+':'+fn(S.techniques[k])).join(',')+'}';
    const extra=Object.keys(S).filter(k=>typeof S[k]==='function'&&k!=='live'&&k!=='motion').map(k=>k+':'+fn(S[k])).join(',');
    return `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="../../_shared/fonts.css"><style>html,body{margin:0;height:100%;overflow:hidden}canvas{width:100%;height:100%;display:block;cursor:crosshair;touch-action:none}</style><canvas id="c"></canvas><script>
const A={};${art}
window.ART=A; window.STUDY={spec:${JSON.stringify(S.spec)},techniques:${tech},${extra}};
const UO=${JSON.stringify(UO||{})}; const MO=(a,b)=>{ const o={}; for(const k of new Set([...Object.keys(a||{}),...Object.keys(b||{})]))o[k]=Object.assign({},(a||{})[k],(b||{})[k]); return o; };
const S=window.STUDY,V=${JSON.stringify(V)},c=document.getElementById('c'),d=${S.liveScale||0.6};let px=0.47,py=0.5,q=0;
const draw=()=>{q=0;c.width=Math.max(2,Math.round(innerWidth*d));c.height=Math.max(2,Math.round(innerHeight*d));S.render(c,innerWidth,innerHeight,d,V,null,MO(UO,S.pointer(px,py)));};
addEventListener('pointermove',e=>{px=e.clientX/innerWidth;py=e.clientY/innerHeight;if(!q)q=requestAnimationFrame(draw);});addEventListener('resize',draw);(document.fonts?document.fonts.ready:Promise.resolve()).then(draw);
<\/script>`; }
};
