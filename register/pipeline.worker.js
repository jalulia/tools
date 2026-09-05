/* Extracted VERBATIM from about-lab/archive/h-figures-01-one-object-at-a-time.html.
   Do not hand-edit: the whole point of the preview is that it is the same instrument.
   Regenerate with scripts/extract-pipeline.py if the build changes. */
/* FIG. 2 — worker pipeline (fix pass 2). One source (the photograph) → one field (ETF) → three key modes
   (mask medial axis for line-art sources, FDoG + non-max suppression for photographic edges, hand-set structure
   for plane objects — the structure itself is rasterised on the main thread), hatch streamlines on the same flow,
   a VECTOR spot plate (thresholded shape → open → components → contours → polygons), feature candidates.
   Runs in a Web Worker; pure typed-array JS, no DOM.  runPipeline(rgba,W,H,P,quick) → {…} */
'use strict';
const now=()=> (typeof performance!=='undefined'?performance.now():Date.now());
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const sstep=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };

/* ---------- separable gaussian / box ---------- */
function gauss(src,W,H,sig){ const r=Math.max(1,Math.ceil(sig*3)), k=new Float32Array(2*r+1); let s=0; for(let i=-r;i<=r;i++){ k[i+r]=Math.exp(-i*i/(2*sig*sig)); s+=k[i+r]; } for(let i=0;i<k.length;i++)k[i]/=s;
  const N=W*H, tmp=new Float32Array(N), out=new Float32Array(N);
  for(let y=0;y<H;y++){ const row=y*W; for(let x=0;x<W;x++){ let a=0; for(let i=-r;i<=r;i++){ let xx=x+i; xx=xx<0?0:xx>=W?W-1:xx; a+=src[row+xx]*k[i+r]; } tmp[row+x]=a; } }
  for(let x=0;x<W;x++)for(let y=0;y<H;y++){ let a=0; for(let i=-r;i<=r;i++){ let yy=y+i; yy=yy<0?0:yy>=H?H-1:yy; a+=tmp[yy*W+x]*k[i+r]; } out[y*W+x]=a; }
  return out; }
function boxR(a,W,H,R){ const N=W*H, b=new Float32Array(N), o=new Float32Array(N), n=2*R+1;
  for(let y=0;y<H;y++){ let sum=0; for(let x=-R;x<=R;x++)sum+=a[y*W+clamp(x,0,W-1)]; for(let x=0;x<W;x++){ b[y*W+x]=sum/n; sum+=a[y*W+clamp(x+R+1,0,W-1)]-a[y*W+clamp(x-R,0,W-1)]; } }
  for(let x=0;x<W;x++){ let sum=0; for(let y=-R;y<=R;y++)sum+=b[clamp(y,0,H-1)*W+x]; for(let y=0;y<H;y++){ o[y*W+x]=sum/n; sum+=b[clamp(y+R+1,0,H-1)*W+x]-b[clamp(y-R,0,H-1)*W+x]; } }
  return o; }
function bilin(a,W,H,x,y){ x=x<0?0:x>=W-1?W-1.001:x; y=y<0?0:y>=H-1?H-1.001:y; const xi=x|0,yi=y|0,fx=x-xi,fy=y-yi; const k=yi*W+xi; return a[k]*(1-fx)*(1-fy)+a[k+1]*fx*(1-fy)+a[k+W]*(1-fx)*fy+a[k+W+1]*fx*fy; }

/* ---------- geometry helpers (normalised shapes: polygon | {poly} | {ellipse:[u,v,ru,rv]}) ---------- */
function pip(poly,u,v){ let inside=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1]; if(((yi>v)!==(yj>v))&&(u<(xj-xi)*(v-yi)/(yj-yi)+xi))inside=!inside; } return inside; }
function inShape(sh,u,v){ if(sh.ellipse){ const e=sh.ellipse; const dx=(u-e[0])/e[2], dy=(v-e[1])/e[3]; return dx*dx+dy*dy<=1; } return pip(sh.poly||sh,u,v); }
function shapeMask(shapes,W,H){ const m=new Uint8Array(W*H); if(!shapes||!shapes.length)return m;
  for(const sh of shapes){ const pts=sh.ellipse?[[sh.ellipse[0]-sh.ellipse[2],sh.ellipse[1]-sh.ellipse[3]],[sh.ellipse[0]+sh.ellipse[2],sh.ellipse[1]+sh.ellipse[3]]]:(sh.poly||sh);
    let x0=1,x1=0,y0=1,y1=0; for(const p of pts){ x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]); }
    const X0=Math.max(0,Math.floor(x0*W)),X1=Math.min(W-1,Math.ceil(x1*W)),Y0=Math.max(0,Math.floor(y0*H)),Y1=Math.min(H-1,Math.ceil(y1*H));
    for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++){ if(inShape(sh,(x+0.5)/W,(y+0.5)/H))m[y*W+x]=1; } }
  return m; }
function dilate(m,W,H,r){ if(r<=0)return new Uint8Array(m); const o=new Uint8Array(m); const offs=[]; for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(i*i+j*j<=r*r)offs.push(i,j);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){ if(!m[y*W+x])continue; for(let n=0;n<offs.length;n+=2){ const xx=x+offs[n],yy=y+offs[n+1]; if(xx<0||yy<0||xx>=W||yy>=H)continue; o[yy*W+xx]=1; } } return o; }
function erode(m,W,H,r){ if(r<=0)return new Uint8Array(m); const inv=new Uint8Array(m.length); for(let k=0;k<m.length;k++)inv[k]=m[k]?0:1; const d=dilate(inv,W,H,r); for(let k=0;k<m.length;k++)inv[k]=d[k]?0:1; return inv; }
const mOpen=(m,W,H,r)=>dilate(erode(m,W,H,r),W,H,r), mClose=(m,W,H,r)=>erode(dilate(m,W,H,r),W,H,r);
function chamfer(mask,W,H,maxd){ // inside distance to the nearest mask==0 pixel, capped
  const N=W*H, d=new Float32Array(N); for(let k=0;k<N;k++)d[k]=mask[k]?maxd:0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const k=y*W+x; if(!d[k])continue; let v=d[k]; if(x>0)v=Math.min(v,d[k-1]+1); if(y>0){ v=Math.min(v,d[k-W]+1); if(x>0)v=Math.min(v,d[k-W-1]+1.414); if(x<W-1)v=Math.min(v,d[k-W+1]+1.414);} if(x===0||y===0)v=Math.min(v,1); d[k]=v; }
  for(let y=H-1;y>=0;y--)for(let x=W-1;x>=0;x--){ const k=y*W+x; if(!d[k])continue; let v=d[k]; if(x<W-1)v=Math.min(v,d[k+1]+1); if(y<H-1){ v=Math.min(v,d[k+W]+1); if(x<W-1)v=Math.min(v,d[k+W+1]+1.414); if(x>0)v=Math.min(v,d[k+W-1]+1.414);} if(x===W-1||y===H-1)v=Math.min(v,1); d[k]=v; }
  return d; }
function chamferOut(mask,W,H,maxd){ const inv=new Uint8Array(mask.length); for(let k=0;k<mask.length;k++)inv[k]=mask[k]?0:1; return chamfer(inv,W,H,maxd); }
function hueSat(rgba,N){ const hue=new Float32Array(N), sat=new Float32Array(N); for(let k=0;k<N;k++){ const r=rgba[k*4]/255,g=rgba[k*4+1]/255,b=rgba[k*4+2]/255; const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn; sat[k]=mx>0?d/mx:0; let h=0; if(d>1e-4){ if(mx===r)h=((g-b)/d)%6; else if(mx===g)h=(b-r)/d+2; else h=(r-g)/d+4; h*=60; if(h<0)h+=360; } hue[k]=h; } return {hue,sat}; }
function hueIn(h,a,b){ return a<=b?(h>=a&&h<=b):(h>=a||h<=b); }
/* connected components; drops those under minArea px; returns the cleaned mask */
function components(m,W,H,minArea){ const N=W*H; const lab=new Int32Array(N); const out=new Uint8Array(N); let next=0; const stack=new Int32Array(N); const areas=[];
  for(let s=0;s<N;s++){ if(!m[s]||lab[s])continue; next++; let sp=0; stack[sp++]=s; lab[s]=next; let area=0; const px=[];
    while(sp){ const k=stack[--sp]; area++; px.push(k); const x=k%W; let q; q=k-1; if(x>0&&m[q]&&!lab[q]){lab[q]=next;stack[sp++]=q;} q=k+1; if(x<W-1&&m[q]&&!lab[q]){lab[q]=next;stack[sp++]=q;} q=k-W; if(q>=0&&m[q]&&!lab[q]){lab[q]=next;stack[sp++]=q;} q=k+W; if(q<N&&m[q]&&!lab[q]){lab[q]=next;stack[sp++]=q;} }
    areas.push(area); if(area>=minArea)for(const k of px)out[k]=1; }
  return out; }
/* marching squares: closed contours of a binary mask (pixel centres at x+.5,y+.5), all loops incl. holes */
function contours(m,W,H){ const PW=W+2, PH=H+2; const v=(i,j)=>(i<1||j<1||i>W||j>H)?0:m[(j-1)*W+(i-1)];
  const segs=[]; const byEdge=new Map(); const eid=(i,j,horiz)=>(j*PW+i)*2+(horiz?0:1); // edge from corner (i,j) to (i+1,j) [horiz] or (i,j+1) [vert]
  const addSeg=(a,b)=>{ const s=segs.length/2; segs.push(a,b); (byEdge.get(a)||byEdge.set(a,[]).get(a)).push(s); (byEdge.get(b)||byEdge.set(b,[]).get(b)).push(s); };
  for(let j=0;j<PH-1;j++)for(let i=0;i<PW-1;i++){ const tl=v(i,j),tr=v(i+1,j),bl=v(i,j+1),br=v(i+1,j+1); const c=(tl<<3)|(tr<<2)|(br<<1)|bl; if(c===0||c===15)continue;
    const T=eid(i,j,1),R=eid(i+1,j,0),B=eid(i,j+1,1),L=eid(i,j,0);
    switch(c){ case 1: case 14: addSeg(L,B); break; case 2: case 13: addSeg(B,R); break; case 3: case 12: addSeg(L,R); break; case 4: case 11: addSeg(T,R); break;
      case 5: addSeg(T,R); addSeg(L,B); break; case 10: addSeg(L,T); addSeg(B,R); break; case 6: case 9: addSeg(T,B); break; case 7: case 8: addSeg(L,T); break; } }
  const used=new Uint8Array(segs.length/2); const loops=[]; const pt=(e)=>{ const horiz=(e&1)===0; const c=e>>1; const i=c%PW, j=(c/PW)|0; return horiz?[i+0.5-0.5,j-0.5]:[i-0.5,j+0.5-0.5]; }; // padded corner (i,j) sits at pixel (i-1,j-1) centre → coordinate i-0.5
  for(let s=0;s<used.length;s++){ if(used[s])continue; const loop=[]; let cur=s, e=segs[s*2]; loop.push(pt(e));
    for(let g=0;g<segs.length;g++){ used[cur]=1; const a=segs[cur*2], b=segs[cur*2+1]; const far=(a===e)?b:a; loop.push(pt(far)); e=far; const cand=byEdge.get(far); let nx=-1; for(const q of cand){ if(q!==cur&&!used[q]){nx=q;break;} } if(nx<0)break; cur=nx; }
    if(loop.length>=4)loops.push(loop); }
  return loops; }
/* rasterise normalised polylines (structure) into a mask, then dilate */
function lineMask(lines,W,H,r){ const m=new Uint8Array(W*H); if(!lines)return m; const plot=(x0,y0,x1,y1)=>{ const n=Math.ceil(Math.hypot(x1-x0,y1-y0))+1; for(let i=0;i<=n;i++){ const t=i/n; const x=Math.round(x0+(x1-x0)*t), y=Math.round(y0+(y1-y0)*t); if(x>=0&&y>=0&&x<W&&y<H)m[y*W+x]=1; } };
  for(const L of lines){ const pts=expandPrim(L,W,H); for(let i=1;i<pts.length;i++)plot(pts[i-1][0]*W,pts[i-1][1]*H,pts[i][0]*W,pts[i][1]*H); } return r>0?dilate(m,W,H,r):m; }
function expandPrim(L,W,H){ if(Array.isArray(L))return L; if(L.circle){ const [u,v,r]=L.circle; const out=[]; for(let i=0;i<=24;i++){ const a=i/24*Math.PI*2; out.push([u+Math.cos(a)*r,v+Math.sin(a)*r*W/H]); } return out; }
  if(L.ellipse){ const [u,v,ru,rv]=L.ellipse; const out=[]; for(let i=0;i<=28;i++){ const a=i/28*Math.PI*2; out.push([u+Math.cos(a)*ru,v+Math.sin(a)*rv]); } return out; } return L.pts||[]; }

/* ---------- the pipeline ---------- */
function runPipeline(rgba,W,H,P,quick){
  const tm={}, tAll=now(); let t0=now(); const N=W*H; P=P||{};
  /* 1 · luminance, stretched (2nd → 0, 98th → 1) */
  const L=new Float32Array(N); const mode=P.luma||'rec';
  for(let k=0;k<N;k++){ const r=rgba[k*4],g=rgba[k*4+1],b=rgba[k*4+2]; L[k]=(mode==='max'?Math.max(r,g,b):(0.299*r+0.587*g+0.114*b))/255; }
  const hist=new Uint32Array(1024); for(let k=0;k<N;k++)hist[(L[k]*1023)|0]++; let acc=0,lo=0,hi=1; for(let i=0;i<1024;i++){ acc+=hist[i]; if(acc>=N*0.02){lo=i/1023;break;} } acc=0; for(let i=1023;i>=0;i--){ acc+=hist[i]; if(acc>=N*0.02){hi=i/1023;break;} }
  let median=0; acc=0; for(let i=0;i<1024;i++){ acc+=hist[i]; if(acc>=N*0.5){median=i/1023;break;} }
  const rng=Math.max(0.05,hi-lo); for(let k=0;k<N;k++)L[k]=clamp((L[k]-lo)/rng,0,1);
  const L0=Float32Array.from(L); // pre-boost tone, for the spot thresholds
  const Labs=new Float32Array(N); for(let k=0;k<N;k++){ const r=rgba[k*4],g=rgba[k*4+1],b=rgba[k*4+2]; Labs[k]=(0.299*r+0.587*g+0.114*b)/255; }
  if(P.local){ const B=gauss(L,W,H,8); for(let k=0;k<N;k++)L[k]=clamp(L[k]+P.local*(L[k]-B[k]),0,1); }
  if(P.boost){ for(const bq of P.boost){ const m=shapeMask([bq.poly],W,H); let s1=0,s2=0,n=0; for(let k=0;k<N;k++)if(m[k]){s1+=L[k];s2+=L[k]*L[k];n++;} if(n<10)continue; const mean=s1/n, sd=Math.sqrt(Math.max(1e-6,s2/n-mean*mean)); const kk=bq.k||3; for(let k=0;k<N;k++)if(m[k])L[k]=clamp(0.5+(L[k]-mean)/(sd*kk),0,1); } }
  const hs=hueSat(rgba,N);
  tm.luma=now()-t0; t0=now();

  /* 2 · background mask — outside it the paper is bare */
  let mask=new Uint8Array(N).fill(1); const MK=P.mask||{type:'all'};
  if(MK.type==='chroma'){ const [h0,h1]=MK.hue; for(let k=0;k<N;k++){ const bg=hueIn(hs.hue[k],h0,h1)&&hs.sat[k]>MK.sat&&L[k]<(MK.lmax||0.97)&&L[k]>(MK.lmin||0); mask[k]=bg?0:1; } mask=erode(dilate(mask,W,H,1),W,H,2); mask=dilate(mask,W,H,2); }
  else if(MK.type==='lum'){ const B=gauss(L,W,H,1.2); for(let k=0;k<N;k++)mask[k]=B[k]>MK.lo?1:0; mask=dilate(mask,W,H,MK.dilate||2); }
  else if(MK.type==='ink'){ const dark=new Float32Array(N); for(let k=0;k<N;k++)dark[k]=(L[k]<MK.dark&&hs.sat[k]<=(MK.satMax||1))?1:0; const D=boxR(boxR(dark,W,H,6),W,H,6); for(let k=0;k<N;k++)mask[k]=D[k]>MK.density?1:0; mask=dilate(mask,W,H,3); }
  if(MK.keep&&MK.keep.length){ const km=shapeMask(MK.keep,W,H); for(let k=0;k<N;k++)mask[k]=mask[k]&km[k]; }
  if(MK.drop&&MK.drop.length){ const dm=shapeMask(MK.drop,W,H); for(let k=0;k<N;k++)if(dm[k])mask[k]=0; }
  if(MK.add&&MK.add.length){ const am=shapeMask(MK.add,W,H); for(let k=0;k<N;k++)if(am[k])mask[k]=1; }
  if(MK.erode)mask=erode(mask,W,H,MK.erode);
  if(P.edgeClear){ const [l,t,r,b]=P.edgeClear; for(let y=0;y<H;y++)for(let x=0;x<W;x++){ if(x<l||y<t||x>=W-r||y>=H-b)mask[y*W+x]=0; } }
  tm.mask=now()-t0; t0=now();

  /* 3 · gradient of G_1(L) → ETF (Kang 2007), separable, seeded where flat */
  const G=gauss(L,W,H,1.0); const gx=new Float32Array(N), gy=new Float32Array(N), mag=new Float32Array(N); let mmax=1e-6;
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){ const k=y*W+x; const a=(G[k+1]-G[k-1])*0.5, b=(G[k+W]-G[k-W])*0.5; gx[k]=a; gy[k]=b; const m=Math.sqrt(a*a+b*b); mag[k]=m; if(m>mmax)mmax=m; }
  for(let k=0;k<N;k++)mag[k]/=mmax;
  let tx=new Float32Array(N), ty=new Float32Array(N); const seed=P.seedDir==null?Math.PI/4:P.seedDir; const sc=Math.cos(seed), ss=Math.sin(seed);
  for(let k=0;k<N;k++){ const m=Math.sqrt(gx[k]*gx[k]+gy[k]*gy[k]); if(m<1e-4){tx[k]=sc;ty[k]=ss;} else {tx[k]=-gy[k]/m; ty[k]=gx[k]/m;} }
  const TANH=new Float32Array(4097); for(let i=0;i<=4096;i++)TANH[i]=0.5*(1+Math.tanh((i/4096)*2-1));
  const etfR=quick?4:(P.etfR||5), etfIt=quick?1:(P.etfIters||2);
  for(let it=0;it<etfIt;it++)for(let pass=0;pass<2;pass++){ const dx=pass?0:1, dy=pass?1:0; const nx=new Float32Array(N), ny=new Float32Array(N);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const k=y*W+x; let sx=0,sy=0; const cx=tx[k],cy=ty[k],gm=mag[k];
      for(let i=-etfR;i<=etfR;i++){ const xx=x+i*dx,yy=y+i*dy; if(xx<0||yy<0||xx>=W||yy>=H)continue; const q=yy*W+xx; const dot=cx*tx[q]+cy*ty[q]; const wm=TANH[((mag[q]-gm+1)*2048)|0]; const w=(dot>0?1:-1)*Math.abs(dot)*wm; sx+=tx[q]*w; sy+=ty[q]*w; }
      const m=Math.sqrt(sx*sx+sy*sy); if(m<1e-6){nx[k]=cx;ny[k]=cy;} else {nx[k]=sx/m;ny[k]=sy/m;} }
    tx=nx; ty=ny; }
  tm.etf=now()-t0; t0=now();

  /* structure lines (hand-set, drawn on the main thread): the pipeline's chains keep clear of them */
  const structNear=P.structure?lineMask(P.structure,W,H,P.structClear==null?4:P.structClear):null;
  const keyClip=P.keyClip?shapeMask(P.keyClip,W,H):null; const keyDrop=P.keyDrop?shapeMask(P.keyDrop,W,H):null;

  /* 4 · key mode (b): FDoG along the flow → signed response → NMS across the normal → one ridge per edge */
  const chains=[]; const ridge=new Uint8Array(N); const keyMode=P.key||'fdog';
  const D8pen=new Uint8Array(N); // the union of everything drawn as key (for the hatch Mach band)
  if(keyMode==='fdog'||keyMode==='both'){
    const sigC=P.sc||1.0, sigS=1.6*sigC, sigM=quick?2.5:(P.sm||3.0), rho=P.rho||0.99, tau=P.tau||0.5, iters=quick?1:(P.fdogIters||2);
    const TT=Math.ceil(sigS*3), S=Math.ceil(sigM*3); const kc=[],ks=[],km=[];
    for(let i=-TT;i<=TT;i++){ kc.push(Math.exp(-i*i/(2*sigC*sigC))/(Math.sqrt(2*Math.PI)*sigC)); ks.push(Math.exp(-i*i/(2*sigS*sigS))/(Math.sqrt(2*Math.PI)*sigS)); }
    for(let i=-S;i<=S;i++)km.push(Math.exp(-i*i/(2*sigM*sigM))/(Math.sqrt(2*Math.PI)*sigM));
    const I=Float32Array.from(L); let Hs=null; const band=new Uint8Array(N);
    for(let it=0;it<iters;it++){
      const F=new Float32Array(N);
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const k=y*W+x; if(!mask[k]){F[k]=0;continue;} const nx=-ty[k], ny=tx[k]; let a=0; for(let i=-TT;i<=TT;i++){ a+=bilin(I,W,H,x+nx*i,y+ny*i)*(kc[i+TT]-rho*ks[i+TT]); } F[k]=a; }
      Hs=new Float32Array(N);
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const k=y*W+x; if(!mask[k])continue; let a=F[k]*km[S];
        for(let dir=1;dir>=-1;dir-=2){ let px=x,py=y,vx0=tx[k]*dir,vy0=ty[k]*dir; for(let s=1;s<=S;s++){ const q=(py|0)*W+(px|0); let vx=tx[q],vy=ty[q]; if(vx*vx0+vy*vy0<0){vx=-vx;vy=-vy;} vx0=vx;vy0=vy; px+=vx; py+=vy; if(px<0||py<0||px>=W-1||py>=H-1)break; a+=bilin(F,W,H,px,py)*km[S+s]; } }
        Hs[k]=a; }
      for(let k=0;k<N;k++){ const h=Hs[k]; const ink=(h<0&&1+Math.tanh(h*40)<tau)?1:0; band[k]=ink; if(it<iters-1&&ink)I[k]=Math.min(I[k],0); }
    }
    for(let k=0;k<N;k++)if(!mask[k])band[k]=0;
    // non-maximum suppression across the flow normal: keep a band pixel only where |Hs| peaks within ±2 px along n
    const nms=new Uint8Array(N);
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){ const k=y*W+x; if(!band[k])continue; const nx=-ty[k], ny=tx[k]; const h=Hs[k];
      const a1=bilin(Hs,W,H,x+nx,y+ny), a2=bilin(Hs,W,H,x-nx,y-ny), b1=bilin(Hs,W,H,x+2*nx,y+2*ny), b2=bilin(Hs,W,H,x-2*nx,y-2*ny);
      if(h<=a1&&h<a2&&h<=b1&&h<b2)nms[k]=1; }
    // close 1px pinholes, thin to a clean centreline, chain
    const r2=new Uint8Array(nms); for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){ const k=y*W+x; if(!nms[k]){ if((nms[k-1]&&nms[k+1])||(nms[k-W]&&nms[k+W]))r2[k]=1; } }
    zhangSuen(r2,W,H,10);
    const dist=chamfer(band,W,H,8);
    const raw=chainRidge(r2,W,H); bridge(raw.chains,3.0); bridge(raw.chains,3.0);
    const minLen=P.minChain||12; const detailMin=P.detailMin||0, detailDropAboveV=P.detailDropAboveV==null?-1:P.detailDropAboveV;
    for(const c of raw.chains){ if(c.length<minLen)continue; let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for(const q of c){ if(q[0]<x0)x0=q[0]; if(q[0]>x1)x1=q[0]; if(q[1]<y0)y0=q[1]; if(q[1]>y1)y1=q[1]; } if(x1-x0<6&&y1-y0<6)continue;
      // clear of hand-set structure, inside the key clip
      let keep=[]; const parts=[]; for(const q of c){ const k=q[1]*W+q[0]; const bad=(structNear&&structNear[k])||(keyClip&&!keyClip[k])||(keyDrop&&keyDrop[k]); if(bad){ if(keep.length>=minLen)parts.push(keep); keep=[]; } else keep.push(q); } if(keep.length>=minLen)parts.push(keep);
      for(const cc of parts){ const s=dp(cc,P.dpEps||0.5); if(s.length<2)continue;
        let th=0; for(const p of cc)th+=2*dist[p[1]*W+p[0]]; th/=cc.length; const structure=th>=(P.structTh||2.6);
        let len=0; for(let i=1;i<s.length;i++)len+=Math.hypot(s[i][0]-s[i-1][0],s[i][1]-s[i-1][1]);
        if(!structure){ if(len<detailMin)continue; if(detailDropAboveV>=0&&cc[0][1]/H<detailDropAboveV&&cc[cc.length-1][1]/H<detailDropAboveV)continue; }
        const base=structure?0.9:0.6; const w=new Float32Array(s.length); for(let i=0;i<s.length;i++){ const t2=2*dist[s[i][1]*W+s[i][0]]; w[i]=base*(0.85+0.15*clamp(t2/4,0,1)); }
        const pts=new Float32Array(s.length*2); for(let i=0;i<s.length;i++){pts[i*2]=s[i][0];pts[i*2+1]=s[i][1];}
        chains.push({pts,w,len,dark:len*base,kind:structure?0:1,closed:0}); for(const p of cc)ridge[p[1]*W+p[0]]=1; } }
    tm.fdog=now()-t0; t0=now();
  }

  /* 4b · key mode (a): the medial axis of a dark (or bright) mask — one centreline per stroke, width = local
     thickness; parts thicker than tMax are masses and are traced as outlines instead of skeletons */
  let massLoops=[]; const darkRules=P.darkKey||[]; const knock=new Uint8Array(N);
  for(const R of darkRules){
    const reg=R.poly||R.ellipse||R.shapes?shapeMask(R.shapes||[R],W,H):null;
    let D=new Uint8Array(N); const src=R.abs?Labs:(R.raw?L0:L); for(let k=0;k<N;k++){ if(!mask[k]||(reg&&!reg[k]))continue; const l=src[k]; const ok=R.invert?(l>R.t):(l<R.t); if(!ok)continue; if(R.satMax!=null&&hs.sat[k]>R.satMax)continue; if(R.sat!=null&&!R.hue&&hs.sat[k]<R.sat)continue; if(R.not&&hueIn(hs.hue[k],R.not[0],R.not[1])&&hs.sat[k]>=(R.not[2]||0.3))continue; if(R.hue&&!(hueIn(hs.hue[k],R.hue[0],R.hue[1])&&hs.sat[k]>=(R.sat||0.3)))continue; D[k]=1; }
    if(R.dropRows){ for(let y=0;y<H;y++){ let n=0; for(let x=0;x<W;x++)n+=D[y*W+x]; if(n>R.dropRows*W)for(let x=0;x<W;x++)D[y*W+x]=0; } }
    if(R.close)D=mClose(D,W,H,R.close); if(R.open)D=mOpen(D,W,H,R.open);
    D=components(D,W,H,R.minArea||12);
    const tMax=R.tMax||7; const mr=Math.max(1,Math.round(tMax/2));
    const Mm=R.noMass?new Uint8Array(N):components(mOpen(D,W,H,mr),W,H,R.massMin||150); // the masses
    const Md=dilate(Mm,W,H,1);
    const sk=new Uint8Array(N); for(let k=0;k<N;k++)sk[k]=(D[k]&&!Md[k])?1:0;
    const dist=chamfer(D,W,H,tMax+2);
    zhangSuen(sk,W,H,40);
    const raw=chainRidge(sk,W,H);
    const minLen=R.minChain||10;
    for(let ci=0;ci<raw.chains.length;ci++){ const c=raw.chains[ci]; const j=raw.junc[ci]||0; if(c.length<3)continue;
      let len=0; for(let i=1;i<c.length;i++)len+=Math.hypot(c[i][0]-c[i-1][0],c[i][1]-c[i-1][1]);
      let th=0; for(const p of c)th+=2*dist[p[1]*W+p[0]]; th/=c.length;
      const free=(j&1?0:1)+(j&2?0:1); // free endpoints
      if(free===2&&len<minLen)continue; // isolated flick
      if(free===1&&len<Math.max(minLen*0.5,th*(R.spur==null?1.2:R.spur)))continue; // spur off a thicker stroke
      if(R.dropLong){ let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for(const q of c){ if(q[0]<x0)x0=q[0]; if(q[0]>x1)x1=q[0]; if(q[1]<y0)y0=q[1]; if(q[1]>y1)y1=q[1]; } if(x1-x0>R.dropLong[0]*W&&y1-y0<R.dropLong[1])continue; }
      let cc=c; if(structNear){ cc=c.filter(q=>!structNear[q[1]*W+q[0]]); if(cc.length<3)continue; }
      const s=dp(cc,R.dpEps||0.6); if(s.length<2)continue;
      const w=new Float32Array(s.length); for(let i=0;i<s.length;i++){ w[i]=clamp(2*dist[s[i][1]*W+s[i][0]],R.wMin||1.4,tMax); }
      const pts=new Float32Array(s.length*2); for(let i=0;i<s.length;i++){pts[i*2]=s[i][0];pts[i*2+1]=s[i][1];}
      chains.push({pts,w,len,dark:len*th,kind:2,closed:0}); for(const p of c)ridge[p[1]*W+p[0]]=1; }
    if(!R.noMass){ const loops=contours(Mm,W,H); for(const lp of loops){ const s=dpClosed(lp,0.7); if(s.length<4)continue; if(R.dropLong){ let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for(const q of s){ if(q[0]<x0)x0=q[0]; if(q[0]>x1)x1=q[0]; if(q[1]<y0)y0=q[1]; if(q[1]>y1)y1=q[1]; } if(x1-x0>R.dropLong[0]*W&&y1-y0<R.dropLong[1]*2)continue; } let len=0; for(let i=1;i<s.length;i++)len+=Math.hypot(s[i][0]-s[i-1][0],s[i][1]-s[i-1][1]); if(len<12)continue;
        const pts=new Float32Array(s.length*2); const w=new Float32Array(s.length).fill(0.9); for(let i=0;i<s.length;i++){pts[i*2]=s[i][0];pts[i*2+1]=s[i][1];}
        chains.push({pts,w,len,dark:len*0.9,kind:3,closed:1}); } for(let k=0;k<N;k++)if(Mm[k]){ ridge[k]=1; if(R.knockout)knock[k]=1; } }
    for(let k=0;k<N;k++)if(D[k])D8pen[k]=1;
  }
  chains.sort((a,b)=>b.dark-a.dark);
  tm.trace=now()-t0; t0=now();

  /* 5 · tone, edge density (form gate), coherence, hatch streamlines on the flow */
  let hatch={pts:new Float32Array(0),idx:new Int32Array(0),band:new Uint8Array(0)}; let spot=null;
  const T=gauss(L,W,H,4);
  const rf=new Float32Array(N); for(let k=0;k<N;k++)rf[k]=ridge[k]; const Dn=boxR(boxR(boxR(rf,W,H,20),W,H,20),W,H,20);
  const form=new Uint8Array(N); const fTh=P.formTh||0.006; for(let k=0;k<N;k++)form[k]=(mask[k]&&Dn[k]>fTh)?1:0;
  const pen=new Uint8Array(N); for(let k=0;k<N;k++)pen[k]=(ridge[k]|D8pen[k]|(structNear?structNear[k]:0))?1:0;
  const rd=chamferOut(pen,W,H,5); // distance to anything drawn in ink
  if(!quick||P.quickHatch){
    const jxx=new Float32Array(N),jyy=new Float32Array(N),jxy=new Float32Array(N); for(let k=0;k<N;k++){jxx[k]=gx[k]*gx[k];jyy[k]=gy[k]*gy[k];jxy[k]=gx[k]*gy[k];}
    const Jxx=gauss(jxx,W,H,3),Jyy=gauss(jyy,W,H,3),Jxy=gauss(jxy,W,H,3);
    const coh=new Float32Array(N); for(let k=0;k<N;k++){ const s=Jxx[k]+Jyy[k]; coh[k]=s>1e-9?((Jxx[k]-Jyy[k])**2+4*Jxy[k]*Jxy[k])/(s*s):0; }
    const plates=P.plate||[{angle:45}]; const reg=new Uint8Array(N); for(let i=1;i<plates.length;i++){ if(!plates[i].poly)continue; const m=shapeMask([plates[i].poly],W,H); for(let k=0;k<N;k++)if(m[k])reg[k]=i; }
    const hx=new Float32Array(N),hy=new Float32Array(N); const cosA=plates.map(p=>Math.cos(p.angle*Math.PI/180)), sinA=plates.map(p=>-Math.sin(p.angle*Math.PI/180));
    const cohLo=P.cohLo==null?0.25:P.cohLo, cohHi=P.cohHi==null?0.65:P.cohHi;
    for(let k=0;k<N;k++){ const a=reg[k]; const dx=cosA[a],dy=sinA[a]; let vx=tx[k],vy=ty[k]; if(vx*dx+vy*dy<0){vx=-vx;vy=-vy;} const s=plates[a].ruled?0:sstep(cohLo,cohHi,coh[k]); let ox=dx+(vx-dx)*s, oy=dy+(vy-dy)*s; const m=Math.hypot(ox,oy)||1; hx[k]=ox/m; hy[k]=oy/m; }
    let b1=P.bands; if(!b1){ const hh=new Uint32Array(512); let cnt=0; for(let k=0;k<N;k++){ if(!form[k]||!mask[k]||rd[k]<2.5)continue; hh[(T[k]*511)|0]++; cnt++; } const pc=P.bandPct||[0.55,0.30,0.12]; b1=[0,0,0]; let a=0,pi=0; const targets=pc.map(p=>p*cnt);
      for(let i=0;i<512&&pi<3;i++){ a+=hh[i]; while(pi<3&&a>=targets[2-pi]){ b1[2-pi]=i/511; pi++; } } if(!cnt)b1=[0.46,0.30,0.16]; tm.bands=b1.map(v=>+v.toFixed(3)); }
    const bandOf=new Uint8Array(N); for(let k=0;k<N;k++){ if(!form[k]||!mask[k]||rd[k]<2.5){bandOf[k]=0;continue;} const t=T[k]; bandOf[k]=t<b1[2]?3:t<b1[1]?2:t<b1[0]?1:0; }
    if(P.forceBand){ for(const fb of P.forceBand){ const m=fb.poly||fb.ellipse?shapeMask([fb],W,H):null; for(let k=0;k<N;k++){ if(!mask[k]||rd[k]<2.5)continue; if(m&&!m[k])continue; if(fb.hue&&!(hueIn(hs.hue[k],fb.hue[0],fb.hue[1])&&hs.sat[k]>=(fb.sat||0.3)))continue; if(fb.lmax!=null&&L[k]>fb.lmax)continue; bandOf[k]=fb.band; } } }
    if(P.noHatch&&P.noHatch.length){ const nh=shapeMask(P.noHatch,W,H); for(let k=0;k<N;k++)if(nh[k])bandOf[k]=0; }
    const dsep=P.dsep||[0,7,4.5,3.2]; const minHatch=P.minHatch||12;
    const A=streamlines(hx,hy,bandOf,rd,W,H,(b)=>dsep[b],(b)=>b>=1,ridge,0,minHatch,P.turn==null?0.866:P.turn);
    const cross=(P.cross==null?60:P.cross)*Math.PI/180; const cx2=new Float32Array(N),cy2=new Float32Array(N); const cs=Math.cos(cross),sn=Math.sin(cross); for(let k=0;k<N;k++){ cx2[k]=hx[k]*cs-hy[k]*sn; cy2[k]=hx[k]*sn+hy[k]*cs; }
    const B=P.cross===false?[]:streamlines(cx2,cy2,bandOf,rd,W,H,(b)=>dsep[3]*1.15,(b)=>b>=3,ridge,3,minHatch,P.turn==null?0.866:P.turn);
    hatch=packLines(A.concat(B));
    tm.hatch=now()-t0; t0=now();
  }
  /* 6 · spot plate — one printed colour as a SHAPE: threshold (region ∧ tone ∧ hue) → morphological open →
     drop small components → contours → polygons. No feather: a flat is hard-edged. */
  if(!quick||P.quickSpot){
    const SP=P.spot||{band:[0.30,0.62],gate:true}; const src=SP.sharp?(()=>{ const G2=gauss(L,W,H,1.0), G3=gauss(L,W,H,1.6); const s=new Float32Array(N); for(let k=0;k<N;k++)s[k]=clamp(G2[k]+1.5*(G2[k]-G3[k]),0,1); return s; })():L0;
    const sb=new Uint8Array(N); const rules=SP.shapes?SP.shapes.map(q=>({m:shapeMask([q],W,H),hue:q.hue||SP.hue,sat:q.sat||SP.sat,satMax:q.satMax!=null?q.satMax:SP.satMax,band:q.band||SP.band,not:q.not||SP.not})):[{m:null,hue:SP.hue,sat:SP.sat,satMax:SP.satMax,band:SP.band,not:SP.not}];
    for(const R of rules)for(let k=0;k<N;k++){ if(sb[k]||!mask[k])continue; if(R.m&&!R.m[k])continue; if(SP.gate&&!form[k])continue; const s=src[k]; if(R.band&&(s<R.band[0]||s>R.band[1]))continue; if(R.hue&&!(hueIn(hs.hue[k],R.hue[0],R.hue[1])&&hs.sat[k]>=(R.sat||0.3)))continue; if(R.satMax!=null&&hs.sat[k]>R.satMax)continue;
      if(R.not&&(hueIn(hs.hue[k],R.not[0],R.not[1])&&hs.sat[k]>=(R.not[2]||0.3)))continue; sb[k]=1; }
    let sbc=sb; if(SP.close)sbc=mClose(sbc,W,H,SP.close); sbc=mOpen(sbc,W,H,SP.open==null?3:SP.open); if(SP.close2)sbc=mClose(sbc,W,H,SP.close2);
    if(SP.knockout){ for(let k=0;k<N;k++)if(knock[k])sbc[k]=0; }
    sbc=components(sbc,W,H,Math.round((SP.minFrac==null?0.004:SP.minFrac)*N));
    const loops=contours(sbc,W,H); const polys=[]; for(const lp of loops){ const s=dpClosed(lp,SP.dpEps||0.6); if(s.length>=3)polys.push(s); }
    spot={polys,mask:sbc};
    if(SP.asKey){ for(const p of polys){ let len=0; for(let i=1;i<p.length;i++)len+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]); const pts=new Float32Array(p.length*2); const w=new Float32Array(p.length).fill(SP.asKey); for(let i=0;i<p.length;i++){pts[i*2]=p[i][0];pts[i*2+1]=p[i][1];} chains.push({pts,w,len,dark:len*0.6,kind:4,closed:1}); } chains.sort((a,b)=>b.dark-a.dark); }
    tm.spot=now()-t0; t0=now();
  }
  /* 7 · feature candidates (fallback trackers): edge-density maxima, one per 56px cell */
  const feats=[]; { const CS=56; const cands=[]; for(let y=CS/2;y<H-CS/2;y+=CS)for(let x=CS/2;x<W-CS/2;x+=CS){ let best=0,bx=x,by=y; for(let j=0;j<CS;j+=2)for(let i=0;i<CS;i+=2){ const xx=x-CS/2+i,yy=y-CS/2+j; if(xx<0||yy<0||xx>=W||yy>=H)continue; const k=yy*W+xx; if(ridge[k]&&Dn[k]>best){best=Dn[k];bx=xx;by=yy;} } if(best>0)cands.push({x:bx,y:by,e:best}); }
    cands.sort((a,b)=>b.e-a.e); feats.push(...cands.map(c=>({u:c.x/W,v:c.y/H,e:c.e}))); }
  tm.total=now()-tAll; tm.median=median;
  return {W,H,chains,hatch,spot,feats,timings:tm,ridge};
}

/* ---------- Zhang–Suen thinning ---------- */
function zhangSuen(m,W,H,maxIt){ for(let it=0;it<maxIt;it++){ let changed=false; for(let pass=0;pass<2;pass++){ const del=[];
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){ const k=y*W+x; if(!m[k])continue; const p2=m[k-W],p3=m[k-W+1],p4=m[k+1],p5=m[k+W+1],p6=m[k+W],p7=m[k+W-1],p8=m[k-1],p9=m[k-W-1];
    const B=p2+p3+p4+p5+p6+p7+p8+p9; if(B<2||B>6)continue; let A=0; const s=[p2,p3,p4,p5,p6,p7,p8,p9,p2]; for(let i=0;i<8;i++)if(s[i]===0&&s[i+1]===1)A++; if(A!==1)continue;
    if(pass===0){ if(p2*p4*p6!==0||p4*p6*p8!==0)continue; } else { if(p2*p4*p8!==0||p2*p6*p8!==0)continue; } del.push(k); }
  for(const k of del)m[k]=0; if(del.length)changed=true; } if(!changed)break; } }

/* ---------- chain following with junction splitting (crossing number) — also reports which ends sit on a junction ---------- */
function chainRidge(r,W,H){ const N=W*H; const cn=new Uint8Array(N); const D8=[1,W+1,W,W-1,-1,-W-1,-W,-W+1];
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){ const k=y*W+x; if(!r[k])continue; let A=0; for(let i=0;i<8;i++){ const a=r[k+D8[i]], b=r[k+D8[(i+1)&7]]; if(!a&&b)A++; } cn[k]=A; }
  const used=new Uint8Array(N); const chains=[], junc=[]; const ORD=[1,W,-1,-W,W+1,W-1,-W+1,-W-1];
  const step=(cur)=>{ for(const d of ORD){ const q=cur+d; if(q<0||q>=N)continue; if(r[q]&&!used[q])return q; } return -1; };
  const trace=(start)=>{ const ch=[[start%W,(start/W)|0]]; let cur=start; let endJ=0;
    for(let guard=0;guard<200000;guard++){ const q=step(cur); if(q<0)break; used[q]=1; cur=q; ch.push([cur%W,(cur/W)|0]); if(cn[cur]>=3){endJ=1;break;} }
    return {ch,endJ}; };
  for(let k=0;k<N;k++){ if(!r[k]||used[k]||cn[k]!==1)continue; used[k]=1; const t=trace(k); if(t.ch.length>=2){ chains.push(t.ch); junc.push(t.endJ?2:0); } }
  for(let k=0;k<N;k++){ if(!r[k]||cn[k]<3)continue; used[k]=1; for(;;){ const q=step(k); if(q<0)break; const ch=[[k%W,(k/W)|0]]; used[q]=1; ch.push([q%W,(q/W)|0]); let endJ=cn[q]>=3?1:0; if(!endJ){ const t=trace(q); for(let i=1;i<t.ch.length;i++)ch.push(t.ch[i]); endJ=t.endJ; } if(ch.length>=2){ chains.push(ch); junc.push(1|(endJ?2:0)); } } }
  for(let k=0;k<N;k++){ if(!r[k]||used[k])continue; used[k]=1; const t=trace(k); if(t.ch.length>=2){ chains.push(t.ch); junc.push(0); } }
  return {chains,junc}; }
/* bridge collinear endpoints across gaps ≤ g px */
function bridge(chains,g){ const ends=[]; chains.forEach((c,i)=>{ if(c.length<3)return; ends.push({i,e:0,p:c[0],d:dirOf(c[2],c[0])}); ends.push({i,e:1,p:c[c.length-1],d:dirOf(c[c.length-3],c[c.length-1])}); });
  const cell=4, map=new Map(); const key=(x,y)=>((x/cell)|0)+','+((y/cell)|0); ends.forEach(e=>{ const k=key(e.p[0],e.p[1]); (map.get(k)||map.set(k,[]).get(k)).push(e); });
  const dead=new Set(); const alive=e=>!dead.has(e.i);
  for(const e of ends){ if(!alive(e)||e.used)continue; let best=null,bd=1e9; const cx=(e.p[0]/cell)|0, cy=(e.p[1]/cell)|0;
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){ const arr=map.get((cx+i)+','+(cy+j)); if(!arr)continue; for(const o of arr){ if(o===e||o.i===e.i||!alive(o)||o.used)continue; const dx=o.p[0]-e.p[0],dy=o.p[1]-e.p[1]; const d=Math.hypot(dx,dy); if(d>g||d<0.5)continue; if(e.d[0]*dx+e.d[1]*dy<0.6*d)continue; if(o.d[0]*dx+o.d[1]*dy>-0.6*d)continue; if(d<bd){bd=d;best=o;} } }
    if(!best)continue; let a=chains[e.i], b=chains[best.i]; if(e.e===0)a=a.slice().reverse(); if(best.e===1)b=b.slice().reverse(); chains[e.i]=a.concat(b); chains[best.i]=[]; dead.add(best.i); for(const o of ends)if(o.i===best.i||o.i===e.i)o.used=true;
  } for(let i=chains.length-1;i>=0;i--)if(chains[i].length<2)chains.splice(i,1); }
function dpClosed(pts,eps){ if(pts.length<4)return pts; let mi=1,md=0; for(let i=1;i<pts.length;i++){ const d=Math.hypot(pts[i][0]-pts[0][0],pts[i][1]-pts[0][1]); if(d>md){md=d;mi=i;} } const a=dp(pts.slice(0,mi+1),eps), b=dp(pts.slice(mi),eps); return a.concat(b.slice(1)); }
function dirOf(a,b){ const dx=b[0]-a[0],dy=b[1]-a[1]; const m=Math.hypot(dx,dy)||1; return [dx/m,dy/m]; }
function dp(pts,eps){ if(pts.length<3)return pts; const out=[pts[0]]; const rec=(i0,i1)=>{ if(i1-i0<2)return; let dmax=0,idx=-1; const ax=pts[i0][0],ay=pts[i0][1],bx=pts[i1][0],by=pts[i1][1]; const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy); for(let i=i0+1;i<i1;i++){ const d=len<1e-6?Math.hypot(pts[i][0]-ax,pts[i][1]-ay):Math.abs((pts[i][0]-ax)*dy-(pts[i][1]-ay)*dx)/len; if(d>dmax){dmax=d;idx=i;} } if(dmax>eps){ rec(i0,idx); out.push(pts[idx]); rec(idx,i1); } }; rec(0,pts.length-1); out.push(pts[pts.length-1]); return out; }

/* ---------- Jobard–Lefer evenly-spaced streamlines on a direction field; continuous, min length, no flicks ---------- */
function streamlines(hx,hy,bandOf,rd,W,H,dsepOf,allow,ridge,tag,minLen,turnCos){ const lines=[]; const cell=8, gw=Math.ceil(W/cell), gh=Math.ceil(H/cell); const grid=new Array(gw*gh); for(let i=0;i<grid.length;i++)grid[i]=[];
  const ok=(x,y,d)=>{ const cx=(x/cell)|0, cy=(y/cell)|0; const d2=d*d; for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){ const gx=cx+i,gy=cy+j; if(gx<0||gy<0||gx>=gw||gy>=gh)continue; const arr=grid[gy*gw+gx]; for(let n=0;n<arr.length;n+=2){ const ddx=arr[n]-x,ddy=arr[n+1]-y; if(ddx*ddx+ddy*ddy<d2)return false; } } return true; };
  const inReg=(x,y)=>{ if(x<1||y<1||x>=W-1||y>=H-1)return 0; const b=bandOf[(y|0)*W+(x|0)]; return allow(b)?b:0; };
  const trace=(sx,sy)=>{ const fwd=[],bwd=[]; for(let dir=1;dir>=-1;dir-=2){ let x=sx,y=sy,px=0,py=0,first=true; const hist=[]; for(let n=0;n<900;n++){ const k=(y|0)*W+(x|0); let vx=hx[k],vy=hy[k]; if(!first&&vx*px+vy*py<0){vx=-vx;vy=-vy;} first=false; px=vx;py=vy; x+=vx*dir; y+=vy*dir; const b=inReg(x,y); if(!b)break; const d=dsepOf(b); if(!ok(x,y,d*0.5))break; hist.push(vx,vy); if(hist.length>=12){ const ax=hist[hist.length-12],ay=hist[hist.length-11]; if(ax*vx+ay*vy<turnCos)break; } (dir>0?fwd:bwd).push(x,y); } }
    const pts=[]; for(let i=bwd.length-2;i>=0;i-=2)pts.push(bwd[i],bwd[i+1]); pts.push(sx,sy); for(let i=0;i<fwd.length;i+=2)pts.push(fwd[i],fwd[i+1]); return pts; };
  const queue=[];
  for(let y=2;y<H-2;y+=3)for(let x=2;x<W-2;x+=3){ const k=y*W+x; if(!ridge[k])continue; const nx=-hy[k],ny=hx[k]; queue.push(x+nx*4,y+ny*4,x-nx*4,y-ny*4); }
  for(let y=3;y<H;y+=5)for(let x=3;x<W;x+=5){ if(inReg(x,y))queue.push(x,y); }
  let qi=0; const t0=now();
  while(qi<queue.length&&lines.length<7000&&(now()-t0)<2500){ const sx=queue[qi++], sy=queue[qi++]; const b=inReg(sx,sy); if(!b)continue; const d=dsepOf(b); if(!ok(sx,sy,d))continue; const pts=trace(sx,sy); if(pts.length<minLen*2)continue;
    lines.push({pts,tag:tag||b});
    for(let i=0;i<pts.length;i+=2){ const x=pts[i],y=pts[i+1]; grid[((y/cell)|0)*gw+((x/cell)|0)].push(x,y); if(i%6)continue; const k=(y|0)*W+(x|0); const nx=-hy[k],ny=hx[k]; const dd=dsepOf(inReg(x,y)||b); queue.push(x+nx*dd,y+ny*dd,x-nx*dd,y-ny*dd); } }
  return lines; }
function packLines(lines){ let n=0; const simp=lines.map(l=>{ const p=[]; for(let i=0;i<l.pts.length;i+=2)p.push([l.pts[i],l.pts[i+1]]); const s=dp(p,0.35); n+=s.length; return {s,tag:l.tag}; });
  const pts=new Float32Array(n*2), idx=new Int32Array(simp.length+1), band=new Uint8Array(simp.length); let o=0; simp.forEach((l,i)=>{ idx[i]=o; band[i]=l.tag; for(const p of l.s){ pts[o*2]=p[0]; pts[o*2+1]=p[1]; o++; } }); idx[simp.length]=o; return {pts,idx,band}; }

/* ---------- message: pack chains (pts / widths / index / kind / closed), hatch, spot polygons, features ---------- */
function pack(R){ let n=0; for(const c of R.chains)n+=c.pts.length/2; const cp=new Float32Array(n*2), cw=new Float32Array(n), ci=new Int32Array(R.chains.length+1), ck=new Uint8Array(R.chains.length); let o=0;
  R.chains.forEach((c,i)=>{ ci[i]=o; cp.set(c.pts,o*2); cw.set(c.w,o); ck[i]=c.kind|(c.closed?8:0); o+=c.pts.length/2; }); ci[R.chains.length]=o;
  let sp=null,si=null; if(R.spot){ let m=0; for(const p of R.spot.polys)m+=p.length; sp=new Float32Array(m*2); si=new Int32Array(R.spot.polys.length+1); let q=0; R.spot.polys.forEach((p,i)=>{ si[i]=q; for(const v of p){ sp[q*2]=v[0]; sp[q*2+1]=v[1]; q++; } }); si[R.spot.polys.length]=q; }
  return {W:R.W,H:R.H,cp,cw,ci,ck,hp:R.hatch.pts,hi:R.hatch.idx,hb:R.hatch.band,sp,si,feats:R.feats,timings:R.timings}; }
if(typeof onmessage!=='undefined'||typeof self!=='undefined'&&typeof importScripts==='function'){
  self.onmessage=(e)=>{ const {id,rgba,W,H,P,quick}=e.data; try{ const R=runPipeline(rgba,W,H,P,quick); const msg=Object.assign({id,ok:true},pack(R));
    const tr=[msg.cp.buffer,msg.cw.buffer,msg.ci.buffer,msg.ck.buffer,msg.hp.buffer,msg.hi.buffer,msg.hb.buffer]; if(msg.sp){tr.push(msg.sp.buffer,msg.si.buffer);} postMessage(msg,tr); }
    catch(err){ postMessage({id,ok:false,err:String(err&&err.stack||err)}); } }; }
