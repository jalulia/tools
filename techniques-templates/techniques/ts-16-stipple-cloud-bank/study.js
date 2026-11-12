window.STUDY={
  id:'ts-16-stipple-cloud-bank', code:'TS-16', fig:'1.16',
  title:'Stipple bank and dot burst',
  kicker:'Technique · TS-16',
  lede:'One dot lattice. Tone fields shade the banks and draw the burst.',
  body:[
    'Every dot sits on one jittered lattice, pitch 5 u, and is drawn on whole pixels so its edge is hard. A tone field keeps or drops each dot. On the sky the field is a burst: a soft core and 26 tapered rays. On a dark bank it is dense at the scalloped rim and fades inward. On a light bank it is empty at the rim and builds inward in wisps, from a noise field stretched 3.2 to 1 along the bank.',
    'The same tone field is printed under the dots as single pixels of a second color, clipped to its bank, so each flat shape carries a gradient with no blur. Motion sways the burst and shimmers the dots. Live puts the burst under the pointer. A weave and a 3 % grain cover the sheet.'
  ],
  source:'Reference 16 · stippled cloud print with a dotted sunburst, 736 × 1308',
  spot:[98,152,193], ref:{w:1000,h:1200},
  variantLabel:'Color',
  variants:[
    { id:'ref',  label:'Sky',  sw:['#6298C1','#FAF9EF','#05070B','#FCEFDE'], spot:[98,152,193], sky:'#6298C1', ray:'#F4F5EE', banks:{ warm:{ fill:'#FCEFDE', dot:'#C6957C', wash:'#E7BFA6' }, dark:{ fill:'#05070B', dot:'#7AA7CC', wash:'#22384E' }, pale:{ fill:'#FAF9EF', dot:'#A9A89E', wash:'#C9C8BC' } } },
    { id:'io',   label:'Ø',    sw:['#2F5AE6','#FFFFFF','#101014','#F4551E'], spot:[47,90,230],  sky:'#2F5AE6', ray:'#FFFFFF', banks:{ warm:{ fill:'#F4551E', dot:'#FFC2A6', wash:'#C9370A' }, dark:{ fill:'#101014', dot:'#7C9BFF', wash:'#26315F' }, pale:{ fill:'#FFFFFF', dot:'#9AA0B8', wash:'#C9CEDF' } } },
    { id:'dusk', label:'Dusk', sw:['#3B2F63','#F2EFF4','#15121C','#E86F8E'], spot:[232,111,142], sky:'#3B2F63', ray:'#FBE9C8', banks:{ warm:{ fill:'#E86F8E', dot:'#FFD0DB', wash:'#B8446A' }, dark:{ fill:'#15121C', dot:'#8C7BD0', wash:'#33295A' }, pale:{ fill:'#F2EFF4', dot:'#A9A0BC', wash:'#CBC3D6' } } },
    { id:'leaf', label:'Leaf', sw:['#2E7D5B','#F4F6EE','#0F1A14','#E6D26A'], spot:[46,125,91],  sky:'#2E7D5B', ray:'#F7F9EC', banks:{ warm:{ fill:'#E6D26A', dot:'#9C8A2A', wash:'#C9B23F' }, dark:{ fill:'#0F1A14', dot:'#6FBF98', wash:'#1F4A36' }, pale:{ fill:'#F4F6EE', dot:'#9FAE9A', wash:'#C4D0BE' } } }
  ],
  points:[
    {u:0.30,v:0.30,d:'RAYS',label:'Ray · tone falls from the root to the tip, 560 u long',t:'dot-burst',dir:[-1,-1]},
    {u:0.48,v:0.53,d:'RAYS',label:'Core · full density inside 137 u',t:'dot-burst',dir:[1,-1]},
    {u:0.80,v:0.50,d:'BANK',label:'Scallop · lobes of 68 to 140 u along a spine',t:'scallop-bank',dir:[1,-1]},
    {u:0.58,v:0.585,d:'BANK',label:'Small lobe · carried on the rim of a large one',t:'scallop-bank',dir:[1,-1]},
    {u:0.40,v:0.79,d:'STIP',label:'Lattice · one dot per cell, pitch 5 u, radius 1.2 u, on whole pixels',t:'stipple-fill',dir:[-1,1]},
    {u:0.88,v:0.62,d:'SHAD',label:'Rim placement · dense at the edge, fades over 0.9 R',t:'shade-field',dir:[1,1]},
    {u:0.64,v:0.76,d:'SHAD',label:'Wisp · stretched noise thins the dots',t:'shade-field',dir:[1,1]},
    {u:0.10,v:0.62,d:'WASH',label:'Wash · the same tone field as single pixels of a second color, 50 %',t:'grain-wash',dir:[-1,-1]},
    {u:0.22,v:0.95,d:'WASH',label:'Wash on a dark bank · a lighter rim',t:'grain-wash',dir:[-1,1]},
    {u:0.08,v:0.06,d:'TOOTH',label:'Weave 3 u and 3 % grain, one pixel',t:'paper-tooth',dir:[-1,-1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[736,1308], grammar:'flat color areas with scalloped edges, shaded only by the density of small dots in a near tone; a sunburst made of the same dots; canvas weave' },
    units:'design units, 1000 = sheet width; the plate is 1000 × 1200',
    palette:{ sky:'#6298C1', pale:'#FAF9EF', dark:'#05070B', warm:'#FCEFDE', ray:'#F4F5EE' },
    techniques:[
      { id:'scallop-bank', short:'BANK', name:'Scalloped flat bank', layer:1, pass:1, atoms:['flat-fill','circle-union','hard-edge'],
        params:{ banks:[ {fill:'warm',shade:'body',from:[-120,500],to:[360,1010],R:96,seed:11}, {fill:'dark',shade:'rim',from:[1120,380],to:[590,1010],R:104,seed:23}, {fill:'pale',shade:'body',from:[-130,790],to:[1130,930],R:132,seed:37}, {fill:'dark',shade:'rim',from:[-130,1130],to:[1130,1040],R:100,seed:51} ],
          R_scale:{ value:1, range:[0.5,1.8], note:'multiplies every lobe radius' }, R_var:{ value:0.35, range:[0,0.6], note:'lobe radius varies ± this share' }, spacing:{ value:1.25, range:[0.8,1.9], note:'lobe centers sit this many radii apart' }, child:{ value:0.55, range:[0,1], note:'chance that a lobe carries a smaller lobe on its rim' } },
        limits:'spacing above ~1.9 opens gaps between lobes and the edge reads as beads. R_var above ~0.6 makes single lobes swallow their neighbors.',
        implementation:'A bank is a row of circles along a spine plus the area under the spine. The depth of a point is its distance inside the nearest lobe; the shading reads that depth.' },
      { id:'stipple-fill', short:'STIP', name:'Jittered dot lattice', layer:2, pass:3, atoms:['stipple','jittered-grid','near-tone'],
        params:{ pitch_u:{ value:5, range:[3,16], unit:'u' }, radius_u:{ value:1.2, range:[0.5,4], unit:'u' }, jitter:{ value:0.42, range:[0,0.5], note:'share of the pitch' }, swell:{ value:0.6, range:[0,1.5], note:'a dot grows with tone, up to radius × (1 + swell)' }, seed:{ value:161, range:[1,9999], step:1 }, rows:'alternate rows are offset by half the pitch' },
        limits:'radius above ~0.45 × pitch merges dots into a tint. jitter 0 shows the lattice as rows. Below 3 u pitch the sheet carries over 150 k dots.',
        implementation:'One dot per lattice cell, moved by up to 0.42 of the pitch, with one random threshold. A dot is drawn when its threshold is under the tone at its position.' },
      { id:'shade-field', short:'SHAD', name:'Tone by depth and wisp', layer:2, pass:2, atoms:['noise-field','density','edge-distance'],
        params:{ rim_depth:{ value:0.9, range:[0.2,3], note:'rim falloff, in lobe radii' }, rim_floor:{ value:0.5, range:[0,1], note:'tone left deep inside a rim bank' }, body_from:{ value:0.12, range:[0,1], note:'depth where a body bank starts to take tone, in lobe radii' }, body_to:{ value:1.1, range:[0.3,3] },
          wisp_u:{ value:150, range:[40,600], unit:'u' }, stretch:{ value:3.2, range:[1,8], note:'wisp length over width' }, contrast:{ value:0.2, range:[0.05,0.6] }, wisp_mix:{ value:0.85, range:[0,1] }, gain:{ value:1, range:[0,1.5] }, seed:{ value:9, range:[1,9999], step:1 } },
        limits:'wisp_mix at 0 leaves only the depth ramp and the banks read as flat steps. stretch above ~6 turns wisps into stripes.',
        implementation:'Rim banks: tone = floor + (1 − floor)·exp(−depth / rim depth). Body banks: tone = smoothstep(depth) × wisp, where wisp is three-octave noise sampled in coordinates turned to the bank and stretched along it.' },
      { id:'grain-wash', short:'WASH', name:'Wash from the tone field', layer:1, pass:2, atoms:['stochastic-gradient','clip','grain'],
        params:{ amount:{ value:0.5, range:[0,1] }, grain:{ value:1, range:[0,1], note:'1 = single on/off pixels; 0 = a smooth gradient' }, res_div:{ value:4, range:[2,8], step:1, note:'the tone field is sampled at 1/res_div size' }, seed:{ value:13, range:[1,9999], step:1 } },
        limits:'At amount 1 the wash hides the dots on light banks. grain at 0 gives a smooth gradient, which reads as blur beside the dots.',
        implementation:'The tone field is sampled at quarter size. Each pixel of the bank takes the wash color with a chance equal to tone × amount, so the gradient is made of single pixels.' },
      { id:'dot-burst', short:'RAYS', name:'Burst tone field', layer:2, pass:3, atoms:['radial','taper','falloff'],
        params:{ center:{ x:{ value:480, range:[0,1000], unit:'u' }, y:{ value:760, range:[0,1200], unit:'u' } }, rays:{ value:26, range:[6,60], step:1 }, fan_deg:[-200,20], jitter:{ value:0.7, range:[0,1] }, length_u:{ value:560, range:[200,900], unit:'u' }, length_var:{ value:0.3, range:[0,0.6] },
          root_width_u:{ value:46, range:[6,140], unit:'u' }, taper:{ value:0.8, range:[0.2,3] }, core_radius_u:{ value:250, range:[0,500], unit:'u' }, ray_floor:{ value:0.35, range:[0,1], note:'tone kept near the tip before the fade' }, turn_deg:{ value:0, range:[-180,180], unit:'°' }, gain:{ value:1, range:[0,1.5] }, seed:{ value:77, range:[1,9999], step:1 } },
        limits:'Over ~60 rays, or a root width above ~140 u, the rays merge into a disc. core_radius at 0 leaves the rays unjoined.',
        implementation:'Tone is the larger of a soft core disc and the nearest ray. A ray is a gaussian across its axis whose width tapers to the tip.' },
      { id:'paper-tooth', short:'TOOTH', name:'Weave and grain', layer:3, pass:4, atoms:['grain','stock','weave'],
        params:{ amp:{ value:0.03, range:[0,0.12] }, weave:{ value:0.025, range:[0,0.12] }, weave_u:{ value:3, range:[2,12], unit:'u' }, seed:{ value:5, range:[1,9999], step:1 } },
        limits:'Above ~0.08 either one competes with the dots.',
        implementation:'Each pixel is multiplied by 1 + grain + weave, where weave is the product of two sine waves at the weave pitch.' }
    ],
    pass_order:['sky · flat fill','banks · scalloped fills, back to front','wash · tone field as soft color, clipped per bank','dots · one lattice; kept where the threshold is under the tone','tooth · weave and grain'],
    notes:['Measured on ref.png: sky (98,152,193); light bank (250,249,239) with dots (169,168,158); dark bank (5,7,11) with dots (122,167,204); dot spacing ≈ 6 px and dot width ≈ 2.5 px at 736 px.','The plate is 5 : 6, wider than the 9 : 16 reference, and the banks and burst are placed differently.']
  },
  techniques:{
    /* banks: [{ fill, shade, Rb, dir, depth(x,y), path(ctx,W,H) }] in device px. depth > 0 is inside. */
    'scallop-bank': (P,u,A)=>({ banks:P.banks.map(b=>{ const r=A.rng(b.seed); const fx=b.from[0]*u, fy=b.from[1]*u, tx=b.to[0]*u, ty=b.to[1]*u; const len=Math.hypot(tx-fx,ty-fy); const dx=(tx-fx)/len, dy=(ty-fy)/len; let nx=dy, ny=-dx; if(ny>0){ nx=-nx; ny=-ny; }
        const Rb=b.R*P.R_scale*u; const lobes=[]; let s=0;
        while(s<=len){ const R=Rb*(1+(r()*2-1)*P.R_var); const cx=fx+dx*s, cy=fy+dy*s; lobes.push([cx,cy,R]);
          if(r()<P.child){ const a=(r()*2-1)*0.9, ca=Math.cos(a), sa=Math.sin(a); const kx=nx*ca-ny*sa, ky=nx*sa+ny*ca; lobes.push([cx+kx*R*0.78,cy+ky*R*0.78,R*(0.38+0.25*r())]); }
          s+=R*P.spacing; }
        const x0=Math.min(fx,tx), x1=Math.max(fx,tx);
        const depth=(x,y)=>{ let d=-1e9; for(let i=0;i<lobes.length;i++){ const l=lobes[i]; const ex=x-l[0], ey=y-l[1]; const q=l[2]-Math.sqrt(ex*ex+ey*ey); if(q>d)d=q; } if(x>=x0&&x<=x1){ const below=-((x-fx)*nx+(y-fy)*ny); if(below>0){ const q=below+Rb*0.375; if(q>d)d=q; } } return d; };
        const path=(c,W,H)=>{ const B=Math.max(fy,ty,H)+Rb; const pts=[[fx,fy],[tx,ty],[tx,B],[fx,B]]; let a=0; for(let i=0;i<4;i++){ const p=pts[i], q=pts[(i+1)%4]; a+=p[0]*q[1]-q[0]*p[1]; } if(a<0)pts.reverse();
          c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<4;i++)c.lineTo(pts[i][0],pts[i][1]); c.closePath(); for(const l of lobes){ c.moveTo(l[0]+l[2],l[1]); c.arc(l[0],l[1],l[2],0,6.2832); } };
        return { fill:b.fill, shade:b.shade, Rb, dir:[dx,dy], depth, path }; }) }),
    /* each(W,H,put): put(x, y, threshold) once per lattice cell. */
    'stipple-fill': (P,u,A)=>({ r:P.radius_u*u, swell:P.swell, each:(W,H,put)=>{ const r=A.rng(P.seed); const p=P.pitch_u*u; let j=0; for(let y=p*0.5;y<H;y+=p*0.866,j++)for(let X=p*0.5+(j&1)*p*0.5;X<W;X+=p)put(X+(r()*2-1)*P.jitter*p,y+(r()*2-1)*P.jitter*p,r()); } }),
    /* tone(bank, depth, x, y) → 0..1 */
    'shade-field': (P,u,A)=>{ const n=A.perlin(P.seed); const sy=P.wisp_u*u, sx=sy*P.stretch;
      return { tone:(b,depth,x,y)=>{ const a=x*b.dir[0]+y*b.dir[1], c=-x*b.dir[1]+y*b.dir[0]; const w=A.sstep(-P.contrast,P.contrast,n.fbm(a/sx+3.1,c/sy+7.7,3)); const m=1-P.wisp_mix+P.wisp_mix*w; let t;
          if(b.shade==='rim'){ const e=depth<0?1:Math.exp(-depth/(P.rim_depth*b.Rb)); t=(P.rim_floor+(1-P.rim_floor)*e)*(0.55+0.45*m); } else t=A.sstep(P.body_from*b.Rb,P.body_to*b.Rb,depth)*m;
          t*=P.gain; return t<0?0:(t>1?1:t); } }; },
    /* layer(W,H,color,tone(x,y)) → { canvas, w, h }: draw it at 0,0 with size w × h. */
    'grain-wash': (P,u,A)=>({ amount:P.amount, layer:(W,H,color,tone)=>{ const q=P.res_div; const w=Math.ceil(W/q)+2, h=Math.ceil(H/q)+2; const F=new Float32Array(w*h); for(let j=0;j<h;j++)for(let i=0;i<w;i++)F[j*w+i]=P.amount*tone(i*q,j*q);
        const c=A.off(W,H), x=c.getContext('2d'); const id=x.createImageData(W,H), d=id.data; const k=A.hex(color); let s=P.seed|0; const g=P.grain;
        for(let y=0;y<H;y++){ const fy=y/q, j=fy|0, ty=fy-j; for(let X=0;X<W;X++){ const fx=X/q, i=fx|0, tx=fx-i; const o=j*w+i; const a=(F[o]*(1-tx)+F[o+1]*tx)*(1-ty)+(F[o+w]*(1-tx)+F[o+w+1]*tx)*ty;
            s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; const n=((t^t>>>14)>>>0)/4294967296; const p=(y*W+X)*4; d[p]=k[0]; d[p+1]=k[1]; d[p+2]=k[2]; d[p+3]=255*((1-g)*a+g*(n<a?1:0)); } }
        x.putImageData(id,0,0); return { canvas:c, w:W, h:H }; } }),
    /* density(x, y, turn, grow) → 0..1 */
    'dot-burst': (P,u,A)=>{ const r=A.rng(P.seed); const N=P.rays, a0=P.fan_deg[0]*Math.PI/180, a1=P.fan_deg[1]*Math.PI/180, mid=(a0+a1)/2; const rays=[]; for(let k=0;k<N;k++)rays.push({ a:a0+(a1-a0)*(k+0.5+(r()-0.5)*P.jitter)/N, L:P.length_u*u*(1+(r()*2-1)*P.length_var), w:P.root_width_u*u*(0.7+0.6*r()) });
      const cx=P.center.x*u, cy=P.center.y*u, Rc=P.core_radius_u*u, turn0=P.turn_deg*Math.PI/180;
      return { density:(x,y,turn,grow)=>{ const dx=x-cx, dy=y-cy; const d=Math.sqrt(dx*dx+dy*dy); let D=Rc>0?A.sstep(Rc*1.15,Rc*0.55,d):0; let th=Math.atan2(dy,dx)-turn0-(turn||0); th-=6.2832*Math.round((th-mid)/6.2832);
          const i0=Math.round((th-a0)/(a1-a0)*N-0.5); for(let k=i0-1;k<=i0+1;k++){ if(k<0||k>=N)continue; const ry=rays[k]; const da=th-ry.a; const t=d*Math.cos(da)/(ry.L*(grow||1)); if(t<=0||t>=1)continue; const off=d*Math.sin(da); const w=ry.w*0.5*Math.pow(1-t,P.taper)+0.6*u; const v=Math.exp(-(off*off)/(w*w))*A.sstep(1,0.78,t)*(P.ray_floor+(1-P.ray_floor)*(1-t)); if(v>D)D=v; }
          D*=P.gain; return D>1?1:D; } }; },
    'paper-tooth': (P,u,A)=>({ apply:ctx=>{ if(P.amp<=0&&P.weave<=0)return; const c=ctx.canvas, W=c.width, H=c.height; const id=ctx.getImageData(0,0,W,H), d=id.data; const p=Math.max(2,P.weave_u*u); const sx=new Float32Array(W), sy=new Float32Array(H); for(let i=0;i<W;i++)sx[i]=Math.sin(6.2832*i/p); for(let j=0;j<H;j++)sy[j]=Math.sin(6.2832*j/p);
        let s=P.seed|0; for(let j=0;j<H;j++){ const wy=sy[j]*P.weave; for(let i=0;i<W;i++){ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; const m=1+P.amp*(((t^t>>>14)>>>0)/2147483648-1)+sx[i]*wy; const o=(j*W+i)*4; d[o]*=m; d[o+1]*=m; d[o+2]*=m; } }
        ctx.putImageData(id,0,0); } })
  },
  /* scene: everything that does not move — fills, wash, and each lattice dot with its region and tone */
  scene(W,H,V,O){ const A=window.ART, S=window.STUDY, T=S.techniques, P=A.params(S.spec,O), u=W/1000;
    const bank=T['scallop-bank'](P['scallop-bank'],u,A), lat=T['stipple-fill'](P['stipple-fill'],u,A), shade=T['shade-field'](P['shade-field'],u,A), wash=T['grain-wash'](P['grain-wash'],u,A), burst=T['dot-burst'](P['dot-burst'],u,A), tooth=T['paper-tooth'](P['paper-tooth'],u,A);
    const base=A.off(W,H), x=base.getContext('2d'); x.fillStyle=V.sky; x.fillRect(0,0,W,H); const B=bank.banks;
    for(const b of B){ const c=V.banks[b.fill]; b.path(x,W,H); x.fillStyle=c.fill; x.fill(); if(wash.amount>0){ const L=wash.layer(W,H,c.wash,(px,py)=>shade.tone(b,b.depth(px,py),px,py)); x.save(); b.path(x,W,H); x.clip(); x.imageSmoothingEnabled=false; x.drawImage(L.canvas,0,0); x.restore(); } }
    const dots=[]; lat.each(W,H,(X,Y,k)=>{ let reg=-1, tone=0; for(let i=B.length-1;i>=0;i--){ const d=B[i].depth(X,Y); if(d>0){ reg=i; tone=shade.tone(B[i],d,X,Y); break; } } dots.push(X,Y,k,reg,tone); });
    return { B, lat, burst, tooth, base, dots }; },
  paintDots(x,sc,V,turn,grow,shim,t){ const d=sc.dots, r=sc.lat.r, sw=sc.lat.swell, n=sc.B.length+1; const G=[]; for(let i=0;i<n*3;i++)G.push([]);
    for(let i=0;i<d.length;i+=5){ const reg=d[i+3]; let k=d[i+2]; if(shim)k+=shim*Math.sin(t*1.9+k*61.7); const D=reg<0?sc.burst.density(d[i],d[i+1],turn,grow):d[i+4]; if(k<D)G[(reg+1)*3+(D>0.8?2:(D>0.45?1:0))].push(d[i],d[i+1]); }
    /* under 2.4 px radius a dot is a whole-pixel square of the same area, so its edge is hard */
    const put=(arr,color,rr)=>{ if(!arr.length)return; x.fillStyle=color; x.beginPath(); if(rr<2.4){ const s=Math.max(1,Math.round(rr*1.77)); for(let j=0;j<arr.length;j+=2)x.rect(Math.round(arr[j]-s/2),Math.round(arr[j+1]-s/2),s,s); } else for(let j=0;j<arr.length;j+=2){ x.moveTo(arr[j]+rr,arr[j+1]); x.arc(arr[j],arr[j+1],rr,0,6.2832); } x.fill(); };
    for(let g=0;g<n;g++){ const color=g===0?V.ray:V.banks[sc.B[g-1].fill].dot; for(let z=0;z<3;z++)put(G[g*3+z],color,r*(1+sw*z*0.5)); } },
  render(canvas,w,h,dpr,V,done,O){ const S=window.STUDY; const W=canvas.width, H=canvas.height; const x=canvas.getContext('2d'); x.setTransform(1,0,0,1,0,0); const sc=S.scene(W,H,V,O); x.drawImage(sc.base,0,0); S.paintDots(x,sc,V,0,1,0,0); sc.tooth.apply(x); if(done)done(); },
  /* motion: the burst sways ±8° and its rays breathe; the dot thresholds shimmer. Fills and wash are painted once. */
  motion(canvas,w,h,dpr,V,t,ctx){ const S=window.STUDY; const W=canvas.width, H=canvas.height; const key=W+'x'+H+V.id; if(!S._sc||S._sc.key!==key){ S._sc=S.scene(W,H,V); S._sc.key=key; }
    ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(S._sc.base,0,0); S.paintDots(ctx,S._sc,V,0.14*Math.sin(t*0.3),1+0.07*Math.sin(t*0.9),0.08,t); ctx.restore(); },
  /* live: the pointer carries the burst */
  pointer(px,py){ return { 'dot-burst':{ 'center.x':px*1000, 'center.y':py*1200 } }; },
  liveScale:1,
  live(V){ const S=window.STUDY, A=window.ART; const fn=f=>{ const s=f.toString(); return /^(function\b|\(|[\w$]+\s*=>)/.test(s)?s:'function '+s; };
    const art=Object.keys(A).map(k=>'A.'+k+'='+fn(A[k])+';').join('\n'); const tech='{'+Object.keys(S.techniques).map(k=>JSON.stringify(k)+':'+fn(S.techniques[k])).join(',')+'}';
    const extra=Object.keys(S).filter(k=>typeof S[k]==='function'&&k!=='live'&&k!=='motion').map(k=>k+':'+fn(S[k])).join(',');
    return `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="../../_shared/fonts.css"><style>html,body{margin:0;height:100%;overflow:hidden}canvas{width:100%;height:100%;display:block;cursor:crosshair;touch-action:none}</style><canvas id="c"></canvas><script>
const A={};${art}
window.ART=A; window.STUDY={spec:${JSON.stringify(S.spec)},techniques:${tech},${extra}};
const S=window.STUDY,V=${JSON.stringify(V)},c=document.getElementById('c'),d=${S.liveScale||0.6};let px=0.5,py=0.5,q=0;
const draw=()=>{q=0;c.width=Math.max(2,Math.round(innerWidth*d));c.height=Math.max(2,Math.round(innerHeight*d));S.render(c,innerWidth,innerHeight,d,V,null,S.pointer(px,py));};
addEventListener('pointermove',e=>{px=e.clientX/innerWidth;py=e.clientY/innerHeight;if(!q)q=requestAnimationFrame(draw);});addEventListener('resize',draw);(document.fonts?document.fonts.ready:Promise.resolve()).then(draw);
<\/script>`; }
};
