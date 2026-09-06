/* ST-07 · MASSIVE · drawn geometry — imported from technique-studies/st-07-massive-drawn-geometry.html at ck-e12.
   Reference-study plate; every technique block is provable from a point on the
   plate (coverage rule). Renders in canvas2d, 1736×1280 design pixels.
   compare{} on — reference is public-domain / Julia\'s own instrument (PROCESS §5.4). */
Shell.registerEntry({
  entity: 'exploration',
  id: 'st-07-massive-drawn-geometry',
  index: 'ST-07',
  order: 3070,
  title: 'MASSIVE · drawn geometry',
  section: 'studies',
  style: 'technique-study',
  status: 'canonical',
  lane: 'canvas2d',
  governed_by: ['composing-computational-material-systems'],
  tags: ['Reference study'],

  source: {
    kind: 'reference-study',
    title: 'Reference 06 · Mode Mode FIG 02 plate (MASSIVE, P-02)',
    note: 'Imported at ck-e12 from technique-studies/. compare{} on — reference is public-domain / Julia\'s own instrument (PROCESS §5.4).'
  },

  frame: { designWidth: 1736, aspect: '1736/1280', previewHeight: 1280 },
  thumb: 'thumb.png',

  body: [
'ST-06 is a read: the photograph goes through luminance, a tangent flow and a flow-based DoG, and every line is a filtered edge — the hatch is a streamline set, the blue is a thresholded region, the lettering a medial axis. Nothing is placed; the polygons only tell the instrument where to look.',
    'This sheet keeps the same view, name and weights but draws them: the silhouette, bezel and marquee are the original’s normalised polygons stroked as tapered ribbons, seams are broken FDoG-style chains, the side face is toned with Jobard–Lefer streamlines whose spacing follows a tone map, and the screen is one blue plate off register with pixel-torn sides.'
  ],

  method: 'Traced polygons · two-weight ribbon key · tone-driven streamlines · off-register torn plate',

  compare: {
    /* Reference is public-domain (or Julia's own instrument). The public
       build strips this to null per PROCESS §5.4; the local build keeps it
       so the fidelity readout has something to cite. */
    reference: 'reference-inline',
    readout:   { palette: true, tone: true, edge: true, grain: true, chroma: true }
  },
  plate: {
    fig: '3.7', series: 'STUDIES', sheet: 7, of: 8,
    designWidth: 1736, designHeight: 1280,
    render: function (canvas, w, h, dpr) {
    const S=w/1000, U=1000, V=h/S;
    let seed=7707; const rnd=()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
    const rr=(a,b)=>a+(b-a)*rnd();
    const INK='#15140F', BLUE='#1E6FE0';
    const clamp=(v,a,b)=>v<a?a:v>b?b:v, sstep=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
    const mk=(dx,dy)=>{ const c=document.createElement('canvas'); c.width=canvas.width; c.height=canvas.height; const x=c.getContext('2d'); x.setTransform(dpr*S,0,0,dpr*S,dpr*S*dx,dpr*S*dy); x.lineCap='round'; x.lineJoin='round'; return x; };
    const KEY=mk(0,0); KEY.strokeStyle=KEY.fillStyle=INK;
    const PLT=mk(0.86,0.58);
    const TXT=mk(0,0);
    // ---------- source rect: the photograph's placement on the plate ----------
    const X0=264.17, Y0=68.26, SW=511.4, SH=691.2;
    const P=(u,v)=>[X0+SW*u, Y0+SH*v];
    const PP=a=>a.map(q=>P(q[0],q[1]));
    // ---------- helpers ----------
    const mkNoise=()=>{ const p=[rnd()*7,rnd()*7,rnd()*7]; return t=>(Math.sin(t+p[0])+0.5*Math.sin(t*2.13+p[1])+0.25*Math.sin(t*4.7+p[2]))/1.75; };
    const seg=(a,b,step)=>{ const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step)); const o=[]; for(let i=0;i<=n;i++)o.push([a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n]); return o; };
    const dense=(Pt,closed,step)=>{ const o=[]; const n=Pt.length; for(let i=0;i<(closed?n:n-1);i++){ const s=seg(Pt[i],Pt[(i+1)%n],step); if(i)s.shift(); o.push(...s); } if(closed)o.pop(); return o; };
    const normals=(Pt,closed)=>{ const n=Pt.length,N=[]; for(let i=0;i<n;i++){ const a=Pt[closed?(i-1+n)%n:Math.max(0,i-1)], b=Pt[closed?(i+1)%n:Math.min(n-1,i+1)]; const dx=b[0]-a[0],dy=b[1]-a[1]; const l=Math.hypot(dx,dy)||1; N.push([dy/l,-dx/l]); } return N; };
    const waver=(Pt,amp,freq,closed)=>{ const N=normals(Pt,closed); const nz=mkNoise(); const out=[]; let s=0; for(let i=0;i<Pt.length;i++){ if(i>0)s+=Math.hypot(Pt[i][0]-Pt[i-1][0],Pt[i][1]-Pt[i-1][1]); const o=amp*nz(s*freq); out.push([Pt[i][0]+N[i][0]*o,Pt[i][1]+N[i][1]*o]); } return out; };
    const path=(x,Pt,closed)=>{ x.beginPath(); x.moveTo(Pt[0][0],Pt[0][1]); for(let i=1;i<Pt.length;i++)x.lineTo(Pt[i][0],Pt[i][1]); if(closed)x.closePath(); };
    // tapered ribbon (the original's FigRaster.ribbon): half-width 0.25→1 over taper u at free ends
    const ribbon=(x,Pt,wd,taper,closed)=>{ const n=Pt.length; if(n<2)return; const cum=new Float64Array(n); let L=0; for(let i=1;i<n;i++){ L+=Math.hypot(Pt[i][0]-Pt[i-1][0],Pt[i][1]-Pt[i-1][1]); cum[i]=L; }
      const N=normals(Pt,closed); const Lp=[],Rp=[];
      for(let i=0;i<n;i++){ const e=closed?1e9:Math.min(cum[i],L-cum[i]); const tp=taper>0?(0.25+0.75*sstep(0,taper,e)):1; const hw=0.5*wd*tp; Lp.push([Pt[i][0]+N[i][0]*hw,Pt[i][1]+N[i][1]*hw]); Rp.push([Pt[i][0]-N[i][0]*hw,Pt[i][1]-N[i][1]*hw]); }
      x.beginPath(); x.moveTo(Lp[0][0],Lp[0][1]); for(let i=1;i<n;i++)x.lineTo(Lp[i][0],Lp[i][1]); if(closed)x.lineTo(Lp[0][0],Lp[0][1]); if(closed)x.moveTo(Rp[n-1][0],Rp[n-1][1]); else x.lineTo(Rp[n-1][0],Rp[n-1][1]); for(let i=n-2;i>=0;i--)x.lineTo(Rp[i][0],Rp[i][1]); if(closed)x.lineTo(Rp[n-1][0],Rp[n-1][1]); x.closePath(); x.fill(closed?'evenodd':'nonzero'); };
    // structure: one confident wavered ribbon
    const structure=(Pt,closed,wd,taper)=>{ let D=dense(Pt,closed,4); D=waver(D,0.08,0.03,closed); ribbon(KEY,D,wd,taper===undefined?8:taper,closed); };
    // chain: a straight edge as 2–5 short FDoG-like pieces with gaps and slightly different angles
    const chain=(a,b,wd,opt)=>{ opt=opt||{}; const L=Math.hypot(b[0]-a[0],b[1]-a[1]); const ux=(b[0]-a[0])/L, uy=(b[1]-a[1])/L; const nx=-uy, ny=ux;
      const np=opt.pieces||(L<20?1:2+(rnd()*4|0)); const cuts=[0]; for(let i=1;i<np;i++)cuts.push(rr(0.25,0.75)/np+ (i-1)/np + 0.125/np); cuts.sort((p,q)=>p-q); cuts.push(1);
      // normalise cuts to a monotone sequence
      for(let i=1;i<cuts.length;i++)if(cuts[i]<cuts[i-1]+0.05)cuts[i]=cuts[i-1]+0.05; cuts[cuts.length-1]=1;
      for(let i=0;i<np;i++){ const g0=i?rr(0.4,1.2):0, g1=i<np-1?rr(0.4,1.2):0; let s0=cuts[i]*L+g0, s1=cuts[i+1]*L-g1; if(s1-s0<2)continue;
        const rot=(rnd()*2-1)*(opt.rot===undefined?0.007:opt.rot), off=(rnd()*2-1)*(opt.off===undefined?0.3:opt.off); const cx=a[0]+ux*(s0+s1)/2+nx*off, cy=a[1]+uy*(s0+s1)/2+ny*off; const hl=(s1-s0)/2; const c=Math.cos(rot),s=Math.sin(rot); const vx=ux*c-uy*s, vy=ux*s+uy*c;
        let D=seg([cx-vx*hl,cy-vy*hl],[cx+vx*hl,cy+vy*hl],3); D=waver(D,opt.amp===undefined?0.25:opt.amp,0.06,false); ribbon(KEY,D,wd*rr(0.9,1.1),opt.taper===undefined?3:opt.taper,false); } };
    const chainPoly=(Pt,wd,opt)=>{ for(let i=0;i<Pt.length-1;i++)chain(Pt[i],Pt[i+1],wd,opt); };
    const inPoly=(Pt,x,y)=>{ let c=false; for(let i=0,j=Pt.length-1;i<Pt.length;j=i++){ const xi=Pt[i][0],yi=Pt[i][1],xj=Pt[j][0],yj=Pt[j][1]; if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c; } return c; };
    const edgeDist=(Pt,x,y)=>{ let m=1e9; for(let i=0,j=Pt.length-1;i<Pt.length;j=i++){ const ax=Pt[j][0],ay=Pt[j][1],bx=Pt[i][0],by=Pt[i][1]; const dx=bx-ax,dy=by-ay; const t=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy),0,1); const d=Math.hypot(x-(ax+dx*t),y-(ay+dy*t)); if(d<m)m=d; } return m; };
    // ---------- geometry (normalised to the photograph) ----------
    const MSIL=PP([[0.345,0.075],[0.780,0.075],[0.836,0.090],[0.840,0.905],[0.655,0.920],[0.175,0.875],[0.115,0.432],[0.228,0.400]]);
    const CORNER=PP([[0.780,0.075],[0.663,0.400],[0.585,0.455],[0.655,0.920]]);
    const MQ=PP([[0.338,0.092],[0.764,0.092],[0.744,0.148],[0.320,0.148]]);
    const MS=PP([[0.315,0.180],[0.745,0.180],[0.672,0.393],[0.235,0.393]]);
    const FACE=PP([[0.780,0.075],[0.840,0.090],[0.845,0.905],[0.655,0.920],[0.585,0.455],[0.663,0.400]]);
    const DROP=PP([[0.782,0.767],[0.89,0.767],[0.89,0.893],[0.782,0.893]]);
    // ================= pass 2: streamline hatch on the side face =================
    { const xs=FACE.map(p=>p[0]), ys=FACE.map(p=>p[1]); const bx0=Math.min(...xs), bx1=Math.max(...xs), by0=Math.min(...ys), by1=Math.max(...ys);
      // front edge (left boundary of the face) for the tone map: distance to CORNER polyline vs. back edge
      const BACK=[FACE[1],FACE[2]]; const FRONT=[FACE[5],FACE[4],FACE[3]];
      const fyOf=y=>clamp((y-by0)/(by1-by0),0,1);
      const fxOf=(x,y)=>{ const df=edgeDist(FRONT.concat([FRONT[0]]),x,y), db=edgeDist(BACK.concat([BACK[0]]),x,y); return df/(df+db+1e-6); };
      const dsepAt=(x,y)=>{ const fy=fyOf(y), fx=fxOf(x,y); let d=9.6; d+=1.2*(1-fy)*(1-fy); d-=1.2*sstep(0.72,1,fy); d+=0.8*Math.max(0,1-fx/0.3); return d; };
      const dirAt=(x,y)=>{ const fy=fyOf(y); const th=Math.PI/3+ (0.5*Math.PI/180)*Math.sin(fy*Math.PI*1.3+0.4); return [Math.cos(th),-Math.sin(th)]; };
      // region test with a per-line clearance
      const inside=(x,y,cl)=>{ if(!inPoly(FACE,x,y))return false; if(inPoly(DROP,x,y))return false; if(edgeDist(DROP,x,y)<2.5&&x>DROP[0][0]-2.5)return false; const d=edgeDist(FACE,x,y); return d>=cl.min && distFront(x,y)>=cl.front && distBottom(x,y)>=cl.bottom && distTop(x,y)>=cl.top; };
      const distFront=(x,y)=>edgeDist(FRONT.concat([FRONT[0]]),x,y);
      const distBottom=(x,y)=>edgeDist([FACE[2],FACE[3],FACE[2]],x,y); const distTop=(x,y)=>edgeDist([FACE[0],FACE[1],FACE[0]],x,y);
      const cell=4, gw=Math.ceil((bx1-bx0)/cell)+2, gh=Math.ceil((by1-by0)/cell)+2; const grid=new Array(gw*gh); for(let i=0;i<grid.length;i++)grid[i]=[];
      const gi=(x,y)=>[((x-bx0)/cell)|0,((y-by0)/cell)|0];
      const ok=(x,y,d)=>{ const [cx,cy]=gi(x,y); const d2=d*d; for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){ const gx=cx+i,gy=cy+j; if(gx<0||gy<0||gx>=gw||gy>=gh)continue; const arr=grid[gy*gw+gx]; for(let n=0;n<arr.length;n+=2){ const ddx=arr[n]-x,ddy=arr[n+1]-y; if(ddx*ddx+ddy*ddy<d2)return false; } } return true; };
      const trace=(sx,sy,cl)=>{ const fwd=[],bwd=[]; for(let dir=1;dir>=-1;dir-=2){ let x=sx,y=sy; for(let n=0;n<400;n++){ const v=dirAt(x,y); x+=v[0]*dir*1.5; y+=v[1]*dir*1.5; if(!inside(x,y,cl))break; const d=dsepAt(x,y); if(!ok(x,y,d*0.5))break; (dir>0?fwd:bwd).push(x,y); } }
        const pts=[]; for(let i=bwd.length-2;i>=0;i-=2)pts.push([bwd[i],bwd[i+1]]); pts.push([sx,sy]); for(let i=0;i<fwd.length;i+=2)pts.push([fwd[i],fwd[i+1]]); return pts; };
      const lines=[]; const queue=[];
      // seeds: a coarse lattice from the middle of the face outward
      const cx0=(bx0+bx1)/2, cy0=(by0+by1)/2; const lat=[]; for(let y=by0+3;y<by1;y+=6)for(let x=bx0+3;x<bx1;x+=6)lat.push([x,y]); lat.sort((a,b)=>(Math.abs(a[1]-cy0)+Math.abs(a[0]-cx0)*0.3)-(Math.abs(b[1]-cy0)+Math.abs(b[0]-cx0)*0.3)); for(const p of lat)queue.push(p[0],p[1]);
      let qi=0; const base={min:7,front:6,bottom:8,top:12};
      while(qi<queue.length&&lines.length<900){ const sx=queue[qi++], sy=queue[qi++]; const fy=fyOf(sy); if(!inside(sx,sy,{min:9,front:9+12*Math.pow(1-fy,1.5),bottom:12,top:20}))continue; const d=dsepAt(sx,sy); if(!ok(sx,sy,d*0.92))continue;
        const cl={min:7+rr(0,2), front:4+12*Math.pow(1-fy,1.5)+rr(0,6), bottom:8+rr(0,5), top:12+rr(0,10)}; const pts=trace(sx,sy,cl); let len=0; for(let i=1;i<pts.length;i++)len+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]); if(len<22)continue;
        lines.push(pts);
        for(let i=0;i<pts.length;i++){ const [x,y]=pts[i]; const [gx,gy]=gi(x,y); if(gx>=0&&gy>=0&&gx<gw&&gy<gh)grid[gy*gw+gx].push(x,y); if(i%4)continue; const v=dirAt(x,y); const nx=-v[1],ny=v[0]; const dd=dsepAt(x,y); queue.push(x+nx*dd,y+ny*dd,x-nx*dd,y-ny*dd); } }
      // stroke: width by tone, round caps, slight waver; some split, some doubled
      KEY.save(); KEY.lineCap='round';
      const strokeLine=(pts,wd)=>{ const D=waver(pts,0.1,0.05,false); KEY.lineWidth=wd; path(KEY,D,false); KEY.stroke(); };
      for(const pts of lines){ const fy=fyOf(pts[(pts.length/2)|0][1]); const wd=(0.82+0.18*fy)*rr(0.93,1.07); const r=rnd();
        if(r<0.08&&pts.length>14){ const k=(pts.length*rr(0.3,0.7))|0; strokeLine(pts.slice(0,k-1),wd); strokeLine(pts.slice(k+1),wd); }
        else strokeLine(pts,wd);
        if(rnd()<0.05&&pts.length>10){ const k0=(pts.length*rr(0.1,0.5))|0, k1=Math.min(pts.length-1,k0+(pts.length*rr(0.2,0.35))|0); const sub=pts.slice(k0,k1).map(p=>[p[0]+0.75,p[1]+1.1]); if(sub.length>2)strokeLine(sub,wd*0.8); } }
      KEY.restore();
      // base tick: sawtooth chain where the flow meets the ground, plus three stubs
      { const a=[1085/1.736,1195/1.736], b=[1150/1.736,1172/1.736]; const L=Math.hypot(b[0]-a[0],b[1]-a[1]); const ux=(b[0]-a[0])/L,uy=(b[1]-a[1])/L; const nx=-uy,ny=ux; const zz=[]; const per=3.0; const n=Math.floor(L/per);
        for(let i=0;i<=n;i++){ const t=i*per; const up=(i&1)?1.7:0; const flat=i<3?0:1; zz.push([a[0]+ux*t+nx*up*flat, a[1]+uy*t+ny*up*flat]); }
        KEY.lineWidth=0.6; KEY.lineJoin='miter'; path(KEY,waver(zz,0.05,0.05,false),false); KEY.stroke(); KEY.lineJoin='round';
        const v=dirAt(a[0],a[1]); for(let i=0;i<3;i++){ const t=6+i*3.2; const s=[a[0]+ux*t+nx*3.2, a[1]+uy*t+ny*3.2]; const l=rr(4,7); KEY.lineWidth=0.6; KEY.beginPath(); KEY.moveTo(s[0],s[1]); KEY.lineTo(s[0]+v[0]*l,s[1]+v[1]*l); KEY.stroke(); } }
    }
    // ================= pass 3: structure ribbons =================
    structure(MSIL,true,0.9);
    structure(CORNER,false,0.9);
    structure(MQ,true,1.0);
    structure(MS,true,1.1);
    // ================= pass 4: chains, seams, bezel chains, controls =================
    // seams (thin grey chains)
    chain(P(0.228,0.400),P(0.663,0.405),0.34,{pieces:2,amp:0.12,rot:0.003});
    chain(P(0.115,0.432),P(0.585,0.455),0.36,{pieces:2,amp:0.12,rot:0.003});
    chain(P(0.118,0.487),P(0.588,0.512),0.34,{pieces:2,amp:0.12,rot:0.003});
    chain(P(0.148,0.665),P(0.615,0.710),0.34,{pieces:2,amp:0.12,rot:0.003});
    // marquee rule (broken grey chain) and the dark chain 3 px above the marquee bottom
    chain(P(0.316,0.155),P(0.751,0.155),0.4,{pieces:4,amp:0.25});
    chain(P(0.345,0.1455),P(0.735,0.1455),0.6,{pieces:3,amp:0.2});
    // bezel chain parallel to the corner edge, 4 px inside (left)
    // a short chain along the top of the right back edge (the bevel)
    chain(P(0.834,0.10),P(0.836,0.30),0.5,{pieces:2,amp:0.25});
    // controls: open rings + grey stems
    { const R=0.013*SW; const ring=(u,v)=>{ const c=P(u,v); const a0=rr(-0.45,-0.2), a1=a0+Math.PI*2-0.7; const q=[]; const n=36; for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; q.push([c[0]+Math.cos(a)*R,c[1]+Math.sin(a)*R]); } ribbon(KEY,waver(q,0.12,0.3,false),0.95,2.5,false); };
      ring(0.205,0.404); ring(0.290,0.410); ring(0.552,0.424);
      for(const [u,v] of [[0.205,0.404],[0.290,0.410],[0.427,0.417],[0.552,0.424]]){ const a=P(u,v+0.014), b=P(u,v+0.027); chain(a,b,0.34,{pieces:1,amp:0.1,rot:0.02}); } }
    // ================= pass 5: marquee lettering (mass outline) =================
    { const G={
        M:[[[1,9],[1.6,1],[5,6.2],[8.4,1],[9,9]]],
        A:[[[1,9],[5,1],[9,9]],[[2.8,6.3],[7.2,6.3]]],
        S:[[[8.6,2.3],[6.2,1],[3,1.2],[1.6,3],[3,4.8],[6.6,5.3],[8.4,7],[6.6,9],[3,8.8],[1.4,7.4]]],
        I:[[[5,1],[5,9]]],
        V:[[[1,1],[5,9],[9,1]]],
        E:[[[8.6,1],[2,1],[2,9],[8.6,9]],[[2,5],[7.2,5]]] };
      const word='MASSIVE', adv=[34,27,24,22,13,27,22], skw=[23,16,13,12,0.01,17,12];
      const body=8.6, ow=1.3; const capH=32, skH=capH-body-2*ow-1.4; const base=P(0.384,0.148)[1]-0.6-body/2-ow; let x=P(0.384,0)[0]+body/2+ow;
      const strokes=[];
      for(let k=0;k<word.length;k++){ const ch=word[k]; const gu=skH/8; const sx=skw[k]/8; for(const sk of G[ch]){ const pts=sk.map(p=>{ const yy=base-(9-p[1])*gu; const xx=x+(p[0]-1)*sx+(base-yy)*0.2; return [xx,yy]; }); let D=dense(pts,false,2.5); D=waver(D,0.7,0.12,false); D=waver(D,0.3,0.45,false); strokes.push(D); } x+=adv[k]; }
      TXT.lineCap='round'; TXT.lineJoin='round'; TXT.strokeStyle=INK;
      for(const D of strokes){ TXT.lineWidth=body+2*ow; path(TXT,D,false); TXT.stroke(); }
      TXT.save(); TXT.globalCompositeOperation='destination-out'; for(const D of strokes){ TXT.lineWidth=body; path(TXT,D,false); TXT.stroke(); } TXT.restore();
      KEY.save(); KEY.setTransform(1,0,0,1,0,0); KEY.drawImage(TXT.canvas,0,0); KEY.restore();
    }
    // ================= pass 1 (drawn last, composited under): the blue plate =================
    { // torn polygon around the screen glass
      const [tl,tr,br,bl]=MS; const q=0.58; const qz=v=>Math.round(v/q)*q;
      const nzL=mkNoise(), nzR=mkNoise(), nzT=mkNoise();
      const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
      const nL=Math.ceil(Math.hypot(bl[0]-tl[0],bl[1]-tl[1])/q), nR=Math.ceil(Math.hypot(br[0]-tr[0],br[1]-tr[1])/q);
      const left=[]; for(let i=0;i<=nL;i++){ const t=i/nL; const p=lerp(tl,bl,t); const inset=8.5*Math.pow(1-t,0.9)-5*sstep(0.8,1,t) + 1.2*nzL(p[1]*0.08) + (rnd()<0.55?qz(rr(-0.9,0.9)):0); left.push([p[0]+qz(inset),p[1]]); }
      const right=[]; for(let i=0;i<=nR;i++){ const t=i/nR; const p=lerp(tr,br,t); const off=-1.2-2.2*t+0.4*nzR(p[1]*0.09)+(rnd()<0.2?qz(rr(-0.58,0.58)):0); right.push([p[0]+qz(off),p[1]]); }
      const top=[]; { const n=Math.ceil((tr[0]-tl[0])/q); for(let i=0;i<=n;i++){ const t=i/n; const p=lerp(left[0],right[0],t); const gap=1.0*sstep(0.35,0,t)+0.3*nzT(p[0]*0.1); top.push([p[0],p[1]+qz(gap)+0.9]); } }
      const foot=[[P(0.219,0.393)[0]+0.4,bl[1]+0.5],[P(0.226,0.393)[0],bl[1]-1.2],[P(0.231,0.393)[0],bl[1]-3.5]];
      const plate=[...top,...right.slice(1),[br[0]+1.4,br[1]+0.5],...foot,...left.slice().reverse().slice(0,-1)];
      // tie the left edge's bottom to the foot: replace the lowest left points that sit above the foot
      PLT.fillStyle=BLUE; PLT.strokeStyle=BLUE; PLT.lineWidth=1.15; PLT.lineJoin='round';
      path(PLT,plate,true); PLT.fill(); PLT.stroke();
      PLT.save(); path(PLT,plate,true); PLT.clip();
      // ---- screen ink lattice ----
      PLT.strokeStyle=PLT.fillStyle='#000'; PLT.lineCap='round'; PLT.lineJoin='round';
      const pitch=9.8, cols=18, rows=9; const gx0=P(0.335,0)[0], gy0=P(0,0.235)[1]; const SW3=3.0;
      const node=[]; for(let j=0;j<=rows;j++){ node.push([]); for(let i=0;i<=cols;i++)node[j].push([gx0+i*pitch+rr(-1.1,1.1),gy0+j*pitch+rr(-1.1,1.1)]); }
      const st=(a,b,wd)=>{ PLT.lineWidth=wd||SW3; PLT.beginPath(); PLT.moveTo(a[0],a[1]); PLT.lineTo(b[0],b[1]); PLT.stroke(); };
      const dot=(p,r)=>{ PLT.beginPath(); PLT.arc(p[0],p[1],r,0,7); PLT.fill(); };
      const dens=i=>i<10?1:i<14?0.6:0.35;
      // top row: a dotted rule with a few breaks
      for(let i=1;i<cols;i++){ if(rnd()<0.85*dens(i)+0.1){ st(node[0][i],node[0][i+1]); } if(rnd()<0.8)dot(node[0][i],2.2); }
      // random-walk paths on the lattice, stroked as one round-joined polyline each
      const DIRS=[[1,0],[-1,0],[0,1],[0,-1]]; const used=new Set();
      const walk=(i,j)=>{ const pts=[[i,j]]; let d=DIRS[rnd()*4|0]; const L=1+(rnd()*4|0); for(let n=0;n<L;n++){ if(rnd()<0.55)d=DIRS[rnd()*4|0]; let ni=i+d[0],nj=j+d[1]; if(ni<0||ni>cols||nj<1||nj>rows){ d=[-d[0],-d[1]]; ni=i+d[0]; nj=j+d[1]; if(ni<0||ni>cols||nj<1||nj>rows)break; } const k=Math.min(i+j*100,ni+nj*100)+':'+Math.max(i+j*100,ni+nj*100); if(used.has(k))break; used.add(k); i=ni; j=nj; pts.push([i,j]); if(rnd()>dens(i)+0.25)break; } return pts; };
      const NP=150; for(let k=0;k<NP;k++){ const i=(rnd()<0.75?rnd()*10:10+rnd()*9)|0, j=1+(rnd()*rows|0); const w=walk(i,j); if(w.length<2)continue;
        PLT.lineWidth=SW3*rr(0.9,1.1); PLT.beginPath(); { const ps=w.map(q=>node[q[1]][q[0]]); PLT.moveTo(ps[0][0],ps[0][1]); for(let n=1;n<ps.length-1;n++){ const a=[ps[n][0]+(ps[n-1][0]-ps[n][0])*0.3,ps[n][1]+(ps[n-1][1]-ps[n][1])*0.3], b=[ps[n][0]+(ps[n+1][0]-ps[n][0])*0.3,ps[n][1]+(ps[n+1][1]-ps[n][1])*0.3]; PLT.lineTo(a[0],a[1]); PLT.quadraticCurveTo(ps[n][0],ps[n][1],b[0],b[1]); } const e=ps[ps.length-1]; PLT.lineTo(e[0],e[1]); } PLT.stroke();
        for(const q of w){ if(rnd()<0.7)dot(node[q[1]][q[0]],rnd()<0.5?2.4:1.9); }
        if(rnd()<0.6){ const q=w[w.length-1]; const p=node[q[1]][q[0]]; const dd=DIRS[rnd()*4|0]; const e=[p[0]+dd[0]*5,p[1]+dd[1]*5]; st(p,e); dot(e,2.3); } }
      // four open-square glyphs (the "5"-like loops)
      for(let k=0;k<4;k++){ const i=[3,7,11,15][k], j=[2,5,3,6][k]; const a=node[j][i],b=node[j][i+1],c=node[j+1][i+1],d=node[j+1][i]; PLT.lineWidth=SW3; PLT.beginPath(); PLT.moveTo(b[0],b[1]); PLT.lineTo(a[0],a[1]); PLT.lineTo(d[0],d[1]); PLT.lineTo(c[0],c[1]); PLT.lineTo(c[0]+3,c[1]-4); PLT.stroke(); dot(b,2.4); }
      for(let k=0;k<6;k++)dot([gx0+rr(0,cols*pitch),gy0+rr(0,rows*pitch)],rr(1.5,2.3));
      PLT.restore();
      // ---- knock-outs: stepped masses on a 2-px cell grid → smoothed loops ----
      const CELL=1.15;
      const mass=(cx,cy,test,ext)=>{ const n=Math.ceil(ext/CELL)*2+2; const g=[]; for(let j=0;j<n;j++){ g.push(new Uint8Array(n)); for(let i=0;i<n;i++){ const x=cx+(i-n/2+0.5)*CELL, y=cy+(j-n/2+0.5)*CELL; g[j][i]=test(x-cx,y-cy)?1:0; } }
        // boundary edges of the cell union, chained into a loop
        const edges=new Map(); const key=(x,y)=>x.toFixed(2)+','+y.toFixed(2); const X=i=>cx+(i-n/2)*CELL, Y=j=>cy+(j-n/2)*CELL;
        for(let j=0;j<n;j++)for(let i=0;i<n;i++){ if(!g[j][i])continue; const up=j>0&&g[j-1][i], dn=j<n-1&&g[j+1][i], lf=i>0&&g[j][i-1], rt=i<n-1&&g[j][i+1];
          if(!up)edges.set(key(X(i),Y(j)),[X(i+1),Y(j)]); if(!rt)edges.set(key(X(i+1),Y(j)),[X(i+1),Y(j+1)]); if(!dn)edges.set(key(X(i+1),Y(j+1)),[X(i),Y(j+1)]); if(!lf)edges.set(key(X(i),Y(j+1)),[X(i),Y(j)]); }
        let start=null; for(const [k,v] of edges){ start=k; break; } if(!start)return []; const loop=[]; let cur=start; let guard=0; while(guard++<5000){ const nx=edges.get(cur); if(!nx)break; loop.push(nx); const k=key(nx[0],nx[1]); if(k===start)break; cur=k; }
        // Catmull-Rom smooth of the staircase
        const m=loop.length; const out=[]; for(let i=0;i<m;i++){ const a=loop[(i-1+m)%m],b=loop[i],c=loop[(i+1)%m],d=loop[(i+2)%m]; for(let k=0;k<3;k++){ const t=k/3,t2=t*t,t3=t2*t; out.push([0.5*((2*b[0])+(-a[0]+c[0])*t+(2*a[0]-5*b[0]+4*c[0]-d[0])*t2+(-a[0]+3*b[0]-3*c[0]+d[0])*t3),0.5*((2*b[1])+(-a[1]+c[1])*t+(2*a[1]-5*b[1]+4*c[1]-d[1])*t2+(-a[1]+3*b[1]-3*c[1]+d[1])*t3)]); } } return out; };
      const disc=(x,y,r)=>x*x+y*y<r*r; const rect=(x,y,x0,y0,x1,y1)=>x>=x0&&x<=x1&&y>=y0&&y<=y1;
      const rot=(x,y,a)=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];
      const c1=P(0.404,0.241), c2=P(0.353,0.295), c3=P(0.504,0.300), c4=P(0.676,0.301);
      const masses=[
        mass(c1[0],c1[1],(x,y)=>(disc(x,y+3,9.5)&&y<3.5)||rect(x,y,-4,2,4,8)||rect(x,y,-11,-2,11,2.5),14),
        mass(c2[0],c2[1],(x,y)=>{ if(!disc(x/12,y/17,1))return false; if(x>4)return false; if(rect(x,y,-1,-13,5,-7))return false; if(rect(x,y,1,-2,5,4))return false; if(rect(x,y,-3,9,5,13))return false; return true; },20),
        mass(c3[0],c3[1],(x,y)=>{ const [px,py]=rot(x,y,-0.45); if(rect(px,py,-8,-23,8,23)||rect(px,py,-23,-8,23,8))return true; if(disc(px-15,py-15,7)||disc(px+14,py+13,6))return true; if(rect(px,py,-20,10,-12,18)&&!rect(px,py,-17,13,-15,15))return true; return false; },28),
        mass(c4[0],c4[1],(x,y)=>disc(x/15,y/21,1)&&!(rect(x,y,-16,-5,-10,1))&&!(x<-7&&y>10)&&!(rect(x,y,-15,-19,-7,-11)),24)
      ];
      PLT.save(); PLT.globalCompositeOperation='destination-out'; for(const m of masses){ if(m.length){ path(PLT,m,true); PLT.fill(); } } PLT.restore();
      // outlines on the key canvas (not offset), clipped to the glass polygon
      KEY.save(); path(KEY,MS,true); KEY.clip(); KEY.lineWidth=1.15; KEY.lineJoin='round'; for(const m of masses){ if(m.length){ path(KEY,waver(m,0.12,0.4,true),true); KEY.stroke(); } } KEY.restore();
    }
    // ================= composite =================
    const ctx=canvas.getContext('2d'); ctx.setTransform(dpr*S,0,0,dpr*S,0,0); ctx.fillStyle='#FFFFFF'; ctx.fillRect(0,0,U,V);
    ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(PLT.canvas,0,0); ctx.globalCompositeOperation='multiply'; ctx.drawImage(KEY.canvas,0,0); ctx.globalCompositeOperation='source-over';
    ctx.setTransform(dpr*S,0,0,dpr*S,0,0);
    }
  },

  points: [
{u:0.694,v:0.655,d:'KEY', label:'Structure key · silhouette ribbon 0.9 u, tapered free ends', t:'keyline-structure', dir:[1,0]},
    {u:0.520,v:0.238,d:'KEY', label:'Detail key · marquee rule as 3–5 broken chains, 0.35 u grey', t:'keyline-chains', dir:[-1,-1]},
    {u:0.652,v:0.520,d:'TONE',label:'Hatch · 60° streamlines, dsep 9.6 u by tone, staggered ends', t:'hatch-streamlines', dir:[1,-1]},
    {u:0.641,v:0.926,d:'MARK',label:'Base tick · sawtooth chain where the flow meets the ground', t:'ground-tick', dir:[1,1]},
    {u:0.417,v:0.335,d:'COL', label:'Spot plate · #1E6FE0 flat, +1.5 +1.0 px off register, torn edge', t:'spot-plate', dir:[-1,0]},
    {u:0.521,v:0.379,d:'FILL',label:'Knock-out · stepped white mass, 1.15 u outline, blue fringe', t:'knockout', dir:[1,1]},
    {u:0.462,v:0.360,d:'MARK',label:'Screen ink · 3 u round-cap lattice walks with node dots', t:'screen-ink', dir:[-1,-1]},
    {u:0.501,v:0.207,d:'TYPE',label:'Marquee · MASSIVE as a 1.3 u mass outline, no fill, 12° lean', t:'marquee-outline', dir:[1,-1]},
    {u:0.412,v:0.478,d:'FORM',label:'Controls · open 6.6 u rings at 0.95 u, grey stem below each', t:'controls', dir:[-1,1]},
    {u:0.860,v:0.600,d:'GRND',label:'Ground · pure #FFFFFF, no tooth, no tone on the lit faces', t:'ground', dir:[1,-1]}
  ],

  spec: {
id:'st-07',
    reference:{ file:'ref-06.png', px:[1736,1280], what:'Mode Mode FIG 02 plate, MASSIVE (P-02), captured at 2×', source_rect_in_frame:{x:458.6,y:118.5,w:887.8,h:1200, note:'the photograph’s placement; every polygon below is normalised to it'} },
    units:'design units, 1000 = plate width (1 u = 1.736 ref px); plate 1000 × 737.3 u; source rect x 264.2 y 68.3 w 511.4 h 691.2 u',
    palette:{ ground:'#FFFFFF', ink:'#15140F', blue:'#1E6FE0', blue_measured:[30,111,224], ink_measured:[20,20,20] },
    ground:{ colour:'#FFFFFF', tooth:'none' },
    geometry:{
      silhouette:[[0.345,0.075],[0.780,0.075],[0.836,0.090],[0.840,0.905],[0.655,0.920],[0.175,0.875],[0.115,0.432],[0.228,0.400]],
      corner_edge:[[0.780,0.075],[0.663,0.400],[0.585,0.455],[0.655,0.920]],
      marquee:[[0.338,0.092],[0.764,0.092],[0.744,0.148],[0.320,0.148]], marquee_rule:[[0.316,0.155],[0.751,0.155]],
      screen:[[0.315,0.180],[0.745,0.180],[0.672,0.393],[0.235,0.393]],
      seams:[[[0.228,0.400],[0.663,0.405]],[[0.115,0.432],[0.585,0.455]],[[0.118,0.487],[0.588,0.512]],[[0.148,0.665],[0.615,0.710]]],
      rings:[[0.205,0.404],[0.290,0.410],[0.552,0.424]], stems:[0.205,0.290,0.427,0.552], ring_r:0.013,
      side_face:[[0.780,0.075],[0.840,0.090],[0.845,0.905],[0.655,0.920],[0.585,0.455],[0.663,0.400]], hatch_drop:[[0.79,0.76],[0.89,0.76],[0.89,0.90],[0.79,0.90]]
    },
    techniques:[
      { id:'keyline-structure', short:'KEY', name:'Structure key (ribbons)', layer:3, pass:3,
        params:{ colour:'#15140F', width_u:{silhouette:0.9,screen:1.1,marquee:1.0,corner:0.9}, width_ref_px:{silhouette:1.56,screen:2.0}, taper_u:8, taper_profile:'0.25 → 1 smoothstep', waver_amp_u:0.15, waver_freq:0.04, sample_u:4, closed:'no taper' },
        implementation:'Each normalised polyline is mapped into the source rect, densified every 4 u, displaced along its normal by three-octave sine noise (amp 0.15 u), and filled as a ribbon whose half-width tapers 0.25 → 1 over 8 u at free ends, so lines meet with hairline gaps instead of joints.' },
      { id:'keyline-chains', short:'KEY', name:'Detail key · broken chains', layer:3, pass:4,
        params:{ width_u:{detail:0.62,seam:0.34}, width_ref_px:{detail:1.1,seam:0.4}, pieces:'2–5 per edge (1 under 20 u)', gap_u:[0.8,2.4], piece_rotation_deg:0.4, piece_offset_u:0.3, taper_u:3, waver_amp_u:0.25 },
        implementation:'An edge is cut into 2–5 pieces separated by 0.8–2.4 u gaps; each piece is rotated ±0.4° about its centre, shifted ±0.3 u across, wavered and drawn as a 3 u-tapered ribbon, so the line reads as a set of FDoG chains, not a rule.' },
      { id:'hatch-streamlines', short:'TONE', name:'Tone-driven streamline hatch', layer:2, pass:2,
        params:{ angle_deg:60, direction:'rising to the right', curvature_deg:0.5, dsep_u:{base:9.6, top:10.8, ground:8.4, front_edge:'+0.8'}, dsep_ref_px:16.7, width_u:[0.82,1.0], width_ref_px:[1.42,1.74], min_len_u:22, clearance_u:{back:'7 + 0–2',front:'4 + 12·(1−fy)^1.5 + 0–6',bottom:'8 + 0–5',top:'12 + 0–10'}, seed_core:'seeds only where clearance ≥ 9 / 9 + 12·(1−fy)^1.5 / 12 / 20 u', step_u:1.5, seed_lattice_u:6, hash_cell_u:4, split_pct:8, double_pct:5, drop_rect:'u > 0.782, v 0.767–0.893' },
        implementation:'A tone map over the side face (lighter at the top and along the front edge, darker toward the ground) sets dsep; Jobard–Lefer placement seeds only the core of the face and traces streamlines through a 60° field with ±0.5° curvature, each stopping at its own random clearance from the polygon (largest toward the front edge and the top) or at half dsep from an existing line; lines under 22 u are dropped, 8 % are split with a gap, 5 % get a short doubled companion, and each is stroked 0.82–1.0 u (thicker toward the ground) with round caps.' },
      { id:'ground-tick', short:'MARK', name:'Base tick', layer:2, pass:2,
        params:{ from_ref_px:[1085,1195], to_ref_px:[1150,1172], period_u:3.0, amp_u:1.7, width_u:0.6, stubs:3 },
        implementation:'One sawtooth polyline along the base of the side face, 3 u period and 1.7 u amplitude, drawn as a 0.6 u chain with three 60° stubs above its left end.' },
      { id:'spot-plate', short:'COL', name:'Off-register torn plate', layer:1, pass:1,
        params:{ colour:'#1E6FE0', register_offset_u:[0.86,0.58], register_offset_ref_px:[1.5,1.0], trap_u:1.15, vertex_spacing_u:0.58, quantise_u:0.58, left_inset_u:'8.5·(1−t)^0.9 − 5·smoothstep(0.8,1,t)', foot_u:0.219, right_edge_u:'−1.2 − 2.2·t (the blue stops on the corner edge, the glass key runs on white)', top_gap_u:1.0, coarse:{amp_u:[1.2,0.4],freq:0.08}, jitter_u:[0.9,0.58] },
        implementation:'The screen polygon is re-sampled every 0.58 u; the left edge is inset by a tone-shaped wedge (wide at the top, spilling into a foot at the bottom), both sides get a low-frequency wobble plus one-pixel jitter quantised to the pixel grid, the shape is filled flat blue with a 1.15 u spread trap on a canvas translated (0.86, 0.58) u, and composited under the key.' },
      { id:'knockout', short:'FILL', name:'Stepped white masses', layer:1, pass:1,
        params:{ cell_u:1.15, cell_ref_px:2, count:4, shapes:['mushroom','left D with notched flat','rotated cross','right half-moon'], centres_uv:[[0.404,0.241],[0.353,0.295],[0.504,0.300],[0.676,0.301]], outline_u:1.15, smoothing:'Catmull-Rom of the cell boundary', hole:'destination-out on the offset plate' },
        implementation:'Each mass is rasterised on a 2-px cell grid, its cell boundary is chained into a loop and Catmull-Rom smoothed; the loop is punched out of the (offset) plate and stroked 1.15 u on the key canvas, so a blue sliver shows inside the outline on the top-left and white outside on the bottom-right.' },
      { id:'screen-ink', short:'MARK', name:'Screen ink lattice', layer:1, pass:1,
        params:{ pitch_u:9.8, pitch_ref_px:17, cols:18, rows:9, node_jitter_u:1.1, stroke_u:3.0, stroke_ref_px:5.2, cap:'round', corner:'quadratic, 30 % rounding', walks:150, walk_len:[1,4], p_turn:0.55, density:{left:1,mid:0.6,right:0.35}, node_dot_r_u:[1.9,2.4], p_dot:0.7, p_stub:0.6, stub_u:5, glyphs:4, top_row:'dotted rule', loose_dots:6 },
        implementation:'150 short random walks on a 9.8 u lattice (jittered 1.1 u) inside the glass, biased to the left ten columns, each stroked as one 3 u round-capped path with rounded corners, dots on 70 % of its nodes and a 5 u stub at the end; the top row is a dotted rule and four open-square glyphs are added; all on the plate canvas, so the holes punch them.' },
      { id:'marquee-outline', short:'TYPE', name:'MASSIVE mass outline', layer:3, pass:5,
        params:{ word:'MASSIVE', cap_height_u:32, cap_height_ref_px:55, width_u:169, advances_u:[34,27,24,22,13,27,22], skeleton_widths_u:[23,16,13,12,0,17,12], skeleton_height_u:19.6, lean:'x += 0.2·(base−y)', body_u:8.6, outline_u:1.3, outline_ref_px:2.3, waver_u:[0.7,0.3], baseline:'v 0.148 (marquee bottom rule)' },
        implementation:'Skeleton strokes per glyph in a 10-unit grid are sheared 12°, wavered, stroked black at body + 2 × outline on a text canvas, then the body is erased with destination-out; the remaining ring is the mass outline the medial-axis pass draws for lettering.' },
      { id:'controls', short:'FORM', name:'Panel controls', layer:3, pass:4,
        params:{ rings:3, ring_r_u:6.6, ring_width_u:0.95, gap:'40° at east', stems:4, stem_len_u:9, stem_width_u:0.34 },
        implementation:'Open rings drawn as wavered ribbons with a 40° gap on the east, each with a thin grey stem 9 u long below.' },
      { id:'ground', short:'GRND', name:'White ground', layer:0, pass:0,
        params:{ colour:'#FFFFFF', tooth:'none' },
        implementation:'Flat white; the lit faces carry no tone.' }
    ],
    pass_order:['white ground','side-face streamlines + base tick','structure ribbons: silhouette, corner edge, marquee, screen','chains: seams, marquee rule, bezel chains, rings, stems','marquee lettering (text canvas → key)','plate: torn polygon, lattice, holes, on the offset canvas','composite: plate source-over, key multiply'],
    notes:[ 'The 3/4 view is not modelled: the original’s hand-set polygons (normalised to the photograph) are mapped through the reference’s source rect, so the silhouette, bezel and marquee land where they are on the plate.', 'Measured on ref-06.png: silhouette 1.56 px integrated ink, screen key 2 px, seams 0.4 px, hatch 1.37 px at 16.9 px pitch (60°), rings 1.65 px, letter outline 2.5 px, blue offset 1.5–3 px past the bottom key.', 'Seed 7707.' ]
  }
});
