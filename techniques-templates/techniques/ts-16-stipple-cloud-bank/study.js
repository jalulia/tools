window.STUDY={
  id:'ts-16-stipple-cloud-bank', code:'TS-16', fig:'1.16',
  title:'Stipple bank and dot burst',
  kicker:'Technique · TS-16',
  lede:'Flat scalloped banks, each carried by one layer of dots.',
  body:[
    'Four flat fills with scalloped edges: a row of circles along a spine, joined to the area under it. Every bank carries one layer of small dots on a jittered 6.4 u grid, in a tone close to the fill. A slow noise field thins the dots, which is the only shading.',
    'The burst behind the banks is dots only. Each ray is a stream that narrows toward its tip; a dense core joins the rays at the center. A 3.5 % mono grain covers the sheet.'
  ],
  source:'Reference 16 · stippled cloud print with a dotted sunburst, 736 × 1308',
  spot:[94,155,203], ref:{w:736,h:1308},
  variantLabel:'Color',
  variants:[
    { id:'ref',  label:'Sky',   sw:['#5E9BCB','#EDE9DA','#0E1418','#F3D2BD'], spot:[94,155,203], sky:'#5E9BCB', ray:'#F4F6F2', fills:{ warm:'#F3D2BD', dark:'#0E1418', pale:'#EDE9DA' }, specks:{ sky:'#74AAD4', warm:'#E9A277', dark:'#86B6DC', pale:'#B4B6A2' } },
    { id:'io',   label:'Ø',     sw:['#2F5AE6','#FFFFFF','#101014','#F4551E'], spot:[47,90,230],  sky:'#2F5AE6', ray:'#FFFFFF', fills:{ warm:'#F4551E', dark:'#101014', pale:'#FFFFFF' }, specks:{ sky:'#5B7EF0', warm:'#FF9A6E', dark:'#7C9BFF', pale:'#B9BBC6' } },
    { id:'dusk', label:'Dusk',  sw:['#3B2F63','#F2EFF4','#15121C','#E86F8E'], spot:[232,111,142], sky:'#3B2F63', ray:'#FBE9C8', fills:{ warm:'#E86F8E', dark:'#15121C', pale:'#F2EFF4' }, specks:{ sky:'#5A4C8C', warm:'#F7A6BA', dark:'#8C7BD0', pale:'#B5AEC2' } },
    { id:'leaf', label:'Leaf',  sw:['#2E7D5B','#F4F6EE','#0F1A14','#E6D26A'], spot:[46,125,91],  sky:'#2E7D5B', ray:'#F7F9EC', fills:{ warm:'#E6D26A', dark:'#0F1A14', pale:'#F4F6EE' }, specks:{ sky:'#4E9C79', warm:'#C2A93A', dark:'#6FBF98', pale:'#AEB7A4' } }
  ],
  points:[
    {u:0.30,v:0.33,d:'RAYS',label:'Ray · a dot stream 560 u long, 64 u wide at the root',t:'dot-burst',dir:[-1,-1]},
    {u:0.50,v:0.45,d:'RAYS',label:'Core · 7000 dots, σ 185 u, joins the rays',t:'dot-burst',dir:[1,-1]},
    {u:0.62,v:0.54,d:'BANK',label:'Scallop · circles of 62–118 u along a spine',t:'scallop-bank',dir:[1,-1]},
    {u:0.20,v:0.62,d:'BANK',label:'Bank edge · hard, no blur',t:'scallop-bank',dir:[-1,-1]},
    {u:0.72,v:0.70,d:'STIP',label:'Dots on the pale fill · gray-green, r 1.5 u',t:'stipple-fill',dir:[1,0]},
    {u:0.16,v:0.80,d:'STIP',label:'Dots on the dark fill · light blue, same grid',t:'stipple-fill',dir:[-1,1]},
    {u:0.90,v:0.47,d:'STIP',label:'Dots on the warm fill · orange, same grid',t:'stipple-fill',dir:[1,-1]},
    {u:0.46,v:0.78,d:'SHAD',label:'Thinned dots · noise field drops density to 45 %',t:'shade-field',dir:[1,1]},
    {u:0.88,v:0.90,d:'SHAD',label:'Full density · the field is near 1 here',t:'shade-field',dir:[1,1]},
    {u:0.08,v:0.08,d:'TOOTH',label:'Sheet grain · 3.5 % mono, 1 px',t:'paper-tooth',dir:[-1,-1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[736,1308], grammar:'flat color areas with scalloped edges; one layer of small dots per area in a near tone; a sunburst made only of dots; fine sheet grain' },
    units:'design units, 1000 = sheet width',
    palette:{ sky:'#5E9BCB', pale:'#EDE9DA', dark:'#0E1418', warm:'#F3D2BD', ray:'#F4F6F2' },
    techniques:[
      { id:'scallop-bank', short:'BANK', name:'Scalloped flat bank', layer:1, pass:1, atoms:['flat-fill','circle-union','hard-edge'],
        params:{ banks:[ {fill:'warm',from:[1090,520],to:[430,1300],R:104,seed:11}, {fill:'dark',from:[1100,760],to:[330,1560],R:96,seed:23}, {fill:'pale',from:[-90,1010],to:[1120,1640],R:128,seed:37}, {fill:'dark',from:[-100,1330],to:[640,1880],R:92,seed:51} ],
          R_scale:{ value:1, range:[0.5,1.8], note:'multiplies every lobe radius' }, R_var:{ value:0.3, range:[0,0.6], note:'lobe radius varies ± this share' }, spacing:{ value:1.25, range:[0.8,1.9], note:'lobe centers sit this many radii apart' } },
        limits:'spacing above ~1.9 opens gaps between lobes and the edge reads as beads. R_var above ~0.6 makes single lobes swallow their neighbors.',
        implementation:'Each bank is a row of circles along a spine from one point to another, filled together with the polygon under the spine; later banks cover earlier ones.' },
      { id:'stipple-fill', short:'STIP', name:'Jittered dot layer', layer:2, pass:3, atoms:['stipple','jittered-grid','near-tone'],
        params:{ pitch_u:{ value:6.4, range:[3.5,16], unit:'u' }, radius_u:{ value:1.5, range:[0.6,3.5], unit:'u' }, jitter:{ value:0.42, range:[0,0.5], note:'share of the pitch' }, seed:{ value:161, range:[1,9999], step:1 }, tone:'one dot color per fill, close to the fill; the sky carries no dot layer' },
        limits:'radius above ~0.45 × pitch merges dots into a tint. jitter 0 shows the grid as rows. Below 3.5 u pitch the layer costs over 100 k dots per sheet.',
        implementation:'One dot per grid cell, moved by up to 0.42 of the pitch; the fill under the dot center picks the dot color.' },
      { id:'shade-field', short:'SHAD', name:'Density shading', layer:2, pass:3, atoms:['noise-field','density'],
        params:{ scale_u:{ value:260, range:[80,900], unit:'u' }, floor:{ value:0.45, range:[0,1], note:'lowest share of dots kept' }, seed:{ value:9, range:[1,9999], step:1 }, density:'floor + (1 − floor) · smoothstep(−0.25, 0.3, fbm)' },
        limits:'floor at 1 removes the shading. scale under ~80 u reads as blotches, not form.',
        implementation:'A two-octave noise field gives each dot a keep probability between the floor and 1.' },
      { id:'dot-burst', short:'RAYS', name:'Dot sunburst', layer:1, pass:2, atoms:['radial','dot-stream','falloff'],
        params:{ center_u:[470,800], rays:{ value:30, range:[6,60], step:1 }, fan_deg:[-172,-8], length_u:{ value:560, range:[200,900], unit:'u' }, length_var:{ value:0.3, range:[0,0.6] }, root_width_u:{ value:64, range:[6,140], unit:'u' }, dots_per_ray:{ value:520, range:[60,1200], step:1 }, core_dots:{ value:7000, range:[0,16000], step:1 }, core_sigma_u:{ value:185, range:[40,300], unit:'u' }, dot_u:{ value:1.5, range:[0.6,3], unit:'u' }, gap_u:{ value:5.2, range:[0,10], unit:'u', note:'no two dots closer than this' }, seed:{ value:77, range:[1,9999], step:1 } },
        limits:'Over ~60 rays the streams merge into a disc; root_width above ~140 u does the same. core_dots at 0 leaves the rays unjoined. gap at 0 lets dots pile up and the burst reads as spray, not stipple.',
        implementation:'Dots are placed along each ray with a spread that narrows to the tip and a count that thins with distance; a gaussian core sits on the center. A dot is dropped when another already sits within the gap. Dots land only on the sky.' },
      { id:'paper-tooth', short:'TOOTH', name:'Sheet grain', layer:3, pass:4, atoms:['grain','stock'],
        params:{ amp:{ value:0.035, range:[0,0.12] }, pitch_px:{ value:1, range:[1,4], step:1, unit:'px' }, seed:{ value:5, range:[1,9999], step:1 } },
        limits:'Above ~0.08 the grain competes with the dots.',
        implementation:'A mono multiply grain over the finished sheet.' }
    ],
    pass_order:['sky · flat fill','banks · scalloped fills, back to front','burst · dot streams and core on the sky','dots · one layer per fill, thinned by the shade field','grain · 3.5 % mono'],
    notes:['Measured on ref.png: dot pitch ≈ 4.7 px at 736 px (6.4 u); dot radius ≈ 1.1 px; sky (94,155,203); pale (237,233,218); dark (14,20,24).','The subject is new: the banks and the burst are placed differently from the reference.']
  },
  techniques:{
    /* paths(H): [{fill, draw(ctx)}] in device px. */
    'scallop-bank': (P,u,A)=>({ banks:P.banks.map(b=>{ const r=A.rng(b.seed); const fx=b.from[0]*u, fy=b.from[1]*u, tx=b.to[0]*u, ty=b.to[1]*u; const len=Math.hypot(tx-fx,ty-fy); const lobes=[]; let s=0;
        while(s<=len){ const R=b.R*P.R_scale*u*(1+(r()*2-1)*P.R_var); lobes.push([fx+(tx-fx)*s/len, fy+(ty-fy)*s/len, R]); s+=R*P.spacing; }
        return { fill:b.fill, draw:(x,W,H)=>{ x.beginPath(); x.moveTo(fx,fy); x.lineTo(tx,ty); x.lineTo(tx,H+4*u); x.lineTo(fx<0?-4*u:(fx>W?W+4*u:fx),H+4*u); if(fx>W||fx<0)x.lineTo(fx,H+4*u); x.closePath(); x.fill(); for(const l of lobes){ x.beginPath(); x.arc(l[0],l[1],l[2],0,6.2832); x.fill(); } } }; }) }),
    /* cells(W,H): calls put(x,y) once per grid cell, jittered. */
    'stipple-fill': (P,u,A)=>({ r:P.radius_u*u, each:(W,H,put)=>{ const r=A.rng(P.seed); const p=P.pitch_u*u; for(let y=p*0.5;y<H;y+=p)for(let X=p*0.5;X<W;X+=p)put(X+(r()*2-1)*P.jitter*p, y+(r()*2-1)*P.jitter*p, r()); } }),
    'shade-field': (P,u,A)=>{ const n=A.perlin(P.seed); const s=P.scale_u*u; return { keep:(x,y)=>P.floor+(1-P.floor)*A.sstep(-0.25,0.3,n.fbm(x/s,y/s,2)) }; },
    'dot-burst': (P,u,A)=>({ r:P.dot_u*u, each:put0=>{ const r=A.rng(P.seed); const cell=Math.max(1e-6,P.gap_u*u), seen=new Set(); const put=(X,Y)=>{ if(P.gap_u>0){ const k=Math.floor(X/cell)*100003+Math.floor(Y/cell); if(seen.has(k))return; seen.add(k); } put0(X,Y); }; const cx=P.center_u[0]*u, cy=P.center_u[1]*u; const a0=P.fan_deg[0]*Math.PI/180, a1=P.fan_deg[1]*Math.PI/180;
        const g=()=>{ let s=0; for(let i=0;i<4;i++)s+=r(); return (s-2)*0.866; };
        for(let k=0;k<P.rays;k++){ const th=a0+(a1-a0)*(k+0.5+(r()-0.5)*0.7)/P.rays; const L=P.length_u*u*(1+(r()*2-1)*P.length_var); const dx=Math.cos(th), dy=Math.sin(th);
          for(let i=0;i<P.dots_per_ray;i++){ const t=0.12+0.88*Math.pow(r(),1.15); const w=P.root_width_u*u*Math.pow(1-t,0.8)*0.5+0.8*u; const o=g()*w; put(cx+dx*t*L-dy*o, cy+dy*t*L+dx*o); } }
        for(let i=0;i<P.core_dots;i++){ const s=P.core_sigma_u*u; put(cx+g()*s, cy+g()*s); } } }),
    'paper-tooth': (P,u,A)=>({ apply:ctx=>A.grain(ctx,{amp:P.amp,pitch:P.pitch_px,seed:P.seed,mono:true}) })
  },
  render(canvas,w,h,dpr,V,done,O){
    const A=window.ART; const W=canvas.width,H=canvas.height; const u=W/1000; const x=canvas.getContext('2d'); x.setTransform(1,0,0,1,0,0);
    const S=window.STUDY; const T=S.techniques, P=A.params(S.spec,O);
    const bank=T['scallop-bank'](P['scallop-bank'],u,A), stip=T['stipple-fill'](P['stipple-fill'],u,A), shade=T['shade-field'](P['shade-field'],u,A), burst=T['dot-burst'](P['dot-burst'],u,A), tooth=T['paper-tooth'](P['paper-tooth'],u,A);
    // 1 · sky and banks; an id buffer at the same size records which fill is on top
    const idc=A.off(W,H), ix=idc.getContext('2d'); ix.fillStyle='#000000'; ix.fillRect(0,0,W,H);
    x.fillStyle=V.sky; x.fillRect(0,0,W,H);
    const ids={ warm:1, dark:2, pale:3 };
    bank.banks.forEach(b=>{ x.fillStyle=V.fills[b.fill]; b.draw(x,W,H); ix.fillStyle='rgb('+(ids[b.fill]*60)+',0,0)'; b.draw(ix,W,H); });
    const idd=ix.getImageData(0,0,W,H).data; const at=(X,Y)=>{ const px=X|0, py=Y|0; if(px<0||py<0||px>=W||py>=H)return -1; return Math.round(idd[(py*W+px)*4]/60); };
    // 2 · burst, on the sky only
    x.fillStyle=V.ray; x.beginPath(); burst.each((X,Y)=>{ if(at(X,Y)===0){ x.moveTo(X+burst.r,Y); x.arc(X,Y,burst.r,0,6.2832); } }); x.fill();
    // 3 · one dot layer per fill
    const names=['sky','warm','dark','pale']; const paths=names.map(()=>[]);
    stip.each(W,H,(X,Y,k)=>{ const id=at(X,Y); if(id<1)return; if(k<shade.keep(X,Y))paths[id].push(X,Y); });
    names.forEach((n,i)=>{ x.fillStyle=V.specks[n]; x.beginPath(); const p=paths[i]; for(let j=0;j<p.length;j+=2){ x.moveTo(p[j]+stip.r,p[j+1]); x.arc(p[j],p[j+1],stip.r,0,6.2832); } x.fill(); });
    // 4 · grain
    tooth.apply(x);
    if(done)done();
  }
};
