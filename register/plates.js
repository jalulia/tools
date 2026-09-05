/* Extracted VERBATIM from about-lab/archive/h-figures-01-one-object-at-a-time.html.
   Do not hand-edit: the whole point of the preview is that it is the same instrument.
   Regenerate with scripts/extract-pipeline.py if the build changes. */
/* FIG. 2 — rasterisation of the worker's vector data into three offscreen plates at device resolution.
   key: hand-set structure (hairline 0.9, tapered) + pipeline chains (FDoG family 0.9/0.6; medial-axis strokes at
   their measured thickness; mass outlines 0.9; tube contours 0.6), every polyline Catmull-Rom smoothed so
   nothing facets at DPR 2. hatch: 0.6 px continuous strokes. spot: hard-edged polygons in the full spot colour,
   evenodd (holes are real), plus a 1 px spread trap.  window.FigRaster.plates(...) is a generator (yields for chunking). */
(function(){
"use strict";
const INK='#15140F';
const clamp=(v,a,b)=>v<a?a:v>b?b:v, smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
/* Catmull-Rom through a polyline (flat [x,y,...]) with per-vertex widths; returns {p,w} densified */
function crSmooth(px,pw,closed){ const n=px.length/2; if(n<3){ return {p:px,w:pw}; } const P=[],Wd=[];
  const get=(i)=>{ if(closed){ i=((i%n)+n)%n; } else i=clamp(i,0,n-1); return [px[i*2],px[i*2+1],pw?pw[i]:0]; };
  const segs=closed?n:n-1;
  for(let i=0;i<segs;i++){ const a=get(i-1),b=get(i),c=get(i+1),d=get(i+2); const len=Math.hypot(c[0]-b[0],c[1]-b[1]); const k=len<1.5?1:Math.min(6,Math.ceil(len/1.5));
    for(let j=0;j<k;j++){ const t=j/k,t2=t*t,t3=t2*t; const x=0.5*((2*b[0])+(-a[0]+c[0])*t+(2*a[0]-5*b[0]+4*c[0]-d[0])*t2+(-a[0]+3*b[0]-3*c[0]+d[0])*t3); const y=0.5*((2*b[1])+(-a[1]+c[1])*t+(2*a[1]-5*b[1]+4*c[1]-d[1])*t2+(-a[1]+3*b[1]-3*c[1]+d[1])*t3); P.push(x,y); Wd.push(b[2]+(c[2]-b[2])*t); } }
  if(!closed){ const e=get(n-1); P.push(e[0],e[1]); Wd.push(e[2]); }
  return {p:P,w:Wd}; }
/* tapered ribbon (widths in CSS px, points in source px, ctx transform = DPR*s) */
function ribbon(ctx,P,Wd,wscale,taperLen,closed,roundCaps){ const n=P.length/2; if(n<2)return; const cum=new Float32Array(n); let L=0; for(let i=1;i<n;i++){ L+=Math.hypot(P[i*2]-P[i*2-2],P[i*2+1]-P[i*2-1]); cum[i]=L; }
  const lx=new Float32Array(n),ly=new Float32Array(n),rx=new Float32Array(n),ry=new Float32Array(n);
  for(let i=0;i<n;i++){ const i0=closed?((i-1+n)%n):Math.max(0,i-1), i1=closed?((i+1)%n):Math.min(n-1,i+1); let tx=P[i1*2]-P[i0*2], ty=P[i1*2+1]-P[i0*2+1]; const m=Math.hypot(tx,ty)||1; tx/=m; ty/=m;
    const e=closed?1e9:Math.min(cum[i],L-cum[i]); const tp=taperLen>0?(0.25+0.75*smooth(0,taperLen,e)):1; const hw=0.5*Wd[i]*tp*wscale; const nx=-ty*hw, ny=tx*hw; const X=P[i*2],Y=P[i*2+1]; lx[i]=X+nx;ly[i]=Y+ny;rx[i]=X-nx;ry[i]=Y-ny; }
  ctx.beginPath(); ctx.moveTo(lx[0],ly[0]); for(let i=1;i<n;i++)ctx.lineTo(lx[i],ly[i]); for(let i=n-1;i>=0;i--)ctx.lineTo(rx[i],ry[i]); ctx.closePath(); ctx.fill();
  if(roundCaps&&!closed){ for(const i of [0,n-1]){ const r=0.5*Wd[i]*wscale; if(r>0.7){ ctx.beginPath(); ctx.arc(P[i*2],P[i*2+1],r,0,6.2832); ctx.fill(); } } } }
function expandPrim(L,W,H){ if(Array.isArray(L))return L; if(L.circle){ const [u,v,r]=L.circle; const out=[]; for(let i=0;i<=32;i++){ const a=i/32*Math.PI*2; out.push([u+Math.cos(a)*r,v+Math.sin(a)*r*W/H]); } return out; }
  if(L.ellipse){ const [u,v,ru,rv]=L.ellipse; const out=[]; for(let i=0;i<=36;i++){ const a=i/36*Math.PI*2; out.push([u+Math.cos(a)*ru,v+Math.sin(a)*rv]); } return out; } return L.pts||[]; }
/* d: worker message; P: preset; core: [r,g,b]|null; lay: {w,h}; DPR */
function* plates(d,P,core,lay,DPR){ const s=lay.w/d.W; const cw=Math.max(1,Math.round(lay.w*DPR)), ch=Math.max(1,Math.round(lay.h*DPR)); const wscale=1/s;
  const mk=()=>{ const c=document.createElement('canvas'); c.width=cw; c.height=ch; const x=c.getContext('2d'); x.setTransform(DPR*s,0,0,DPR*s,0,0); return [c,x]; };
  const [keyC,kx]=mk(); kx.fillStyle=INK; let count=0;
  // hand-set structure first: the silhouette is one confident line
  if(P.structure){ for(const L of P.structure){ const pts=expandPrim(L,d.W,d.H); if(pts.length<2)continue; const isClosed=pts.length>3&&Math.hypot(pts[0][0]-pts[pts.length-1][0],pts[0][1]-pts[pts.length-1][1])<1e-6; const px=[],pw=[]; const n=isClosed?pts.length-1:pts.length; for(let i=0;i<n;i++){ px.push(pts[i][0]*d.W,pts[i][1]*d.H); pw.push(0.9); }
      const curved=!!(L.circle||L.ellipse||L.curve); const sm=curved?crSmooth(px,pw,isClosed):{p:isClosed?px.concat([px[0],px[1]]):px,w:isClosed?pw.concat([pw[0]]):pw}; ribbon(kx,sm.p,sm.w,wscale,isClosed?0:7,false,false); } }
  // pipeline chains
  for(let c=0;c<d.ci.length-1;c++){ const a=d.ci[c],b=d.ci[c+1]; const n=b-a; if(n<2)continue; const kind=d.ck[c]&7, isClosed=!!(d.ck[c]&8);
    const px=Array.from(d.cp.subarray(a*2,b*2)); let pw=Array.from(d.cw.subarray(a,b)); if(kind===2)pw=pw.map(v=>Math.max(0.6*wscale,v)); // medial strokes: width in source px
    const sm=crSmooth(px,pw,isClosed); if(isClosed){ sm.p.push(sm.p[0],sm.p[1]); sm.w.push(sm.w[0]); }
    ribbon(kx,sm.p,sm.w,kind===2?1:wscale,isClosed?0:(kind===2?3:6),false,kind===2);
    if((++count&63)===0)yield; }
  // hatch: continuous 0.6 px strokes, round caps, no flicks
  const [hatC,hx]=mk(); hx.strokeStyle=INK; hx.lineWidth=0.6*wscale; hx.lineCap='round'; hx.lineJoin='round'; count=0; hx.beginPath();
  for(let l=0;l<d.hi.length-1;l++){ const a=d.hi[l],b=d.hi[l+1]; const n=b-a; if(n<2)continue; const sm=crSmooth(Array.from(d.hp.subarray(a*2,b*2)),null,false).p; hx.moveTo(sm[0],sm[1]); for(let i=1;i<sm.length/2;i++)hx.lineTo(sm[i*2],sm[i*2+1]);
    if((++count&255)===0){ hx.stroke(); hx.beginPath(); yield; } }
  hx.stroke();
  // spot: hard-edged polygons, full spot colour, evenodd, 1 px spread trap
  let spotC=null; if(d.sp&&d.si&&d.si.length>1){ spotC=document.createElement('canvas'); spotC.width=cw; spotC.height=ch; const sx=spotC.getContext('2d'); sx.setTransform(DPR*s,0,0,DPR*s,0,0); const col=core?`rgb(${core.join(',')})`:'rgba(21,20,15,0.5)'; sx.fillStyle=col; sx.strokeStyle=col; sx.lineWidth=1.0*wscale; sx.lineJoin='round';
    sx.beginPath(); for(let i=0;i<d.si.length-1;i++){ const a=d.si[i],b=d.si[i+1]; if(b-a<3)continue; const sm=crSmooth(Array.from(d.sp.subarray(a*2,b*2)),null,true).p; sx.moveTo(sm[0],sm[1]); for(let j=1;j<sm.length/2;j++)sx.lineTo(sm[j*2],sm[j*2+1]); sx.closePath(); }
    sx.fill('evenodd'); sx.stroke(); yield; }
  return {key:keyC,hatch:hatC,spot:spotC}; }
window.FigRaster={plates,crSmooth,ribbon,expandPrim};
})();
