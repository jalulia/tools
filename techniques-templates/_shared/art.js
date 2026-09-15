/* Techniques & Templates · art helpers · ø co.
   Shared by every study.js. Everything is deterministic (seeded) and resolution-independent.
   Design units: studies draw in a 1000-wide space (U) and scale to the canvas. */
window.ART=(function(){
"use strict";
const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
A.hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
A.rgb=(v,a)=>`rgba(${v[0]|0},${v[1]|0},${v[2]|0},${a===undefined?1:a})`;
A.mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
A.lerp=(a,b,t)=>a+(b-a)*t;
/* 256-entry LUT from [[pos,'#hex'],…] */
A.lut=stops=>{ const L=new Array(256); for(let i=0;i<256;i++){ const t=i/255; let c=A.hex(stops[stops.length-1][1]); for(let k=1;k<stops.length;k++){ if(t<=stops[k][0]){ const u=(t-stops[k-1][0])/((stops[k][0]-stops[k-1][0])||1e-6); c=A.mix(A.hex(stops[k-1][1]),A.hex(stops[k][1]),A.clamp(u,0,1)); break; } } L[i]=c; } return L; };
/* Perlin 2-D, seeded */
A.perlin=seed=>{ const r=A.rng(seed); const perm=new Uint8Array(512); const p=[]; for(let i=0;i<256;i++)p[i]=i; for(let i=255;i>0;i--){ const j=(r()*(i+1))|0; const t=p[i]; p[i]=p[j]; p[j]=t; } for(let i=0;i<512;i++)perm[i]=p[i&255];
  const G=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]; const fade=t=>t*t*t*(t*(t*6-15)+10);
  const n=(x,y)=>{ const X=Math.floor(x),Y=Math.floor(y); const xf=x-X,yf=y-Y; const xi=X&255,yi=Y&255; const g00=G[perm[perm[xi]+yi]&7],g10=G[perm[perm[xi+1]+yi]&7],g01=G[perm[perm[xi]+yi+1]&7],g11=G[perm[perm[xi+1]+yi+1]&7]; const n00=g00[0]*xf+g00[1]*yf,n10=g10[0]*(xf-1)+g10[1]*yf,n01=g01[0]*xf+g01[1]*(yf-1),n11=g11[0]*(xf-1)+g11[1]*(yf-1); const u=fade(xf),v=fade(yf); const a=n00+(n10-n00)*u; return a+((n01+(n11-n01)*u)-a)*v; };
  n.fbm=(x,y,o,g)=>{ let s=0,a=1,t=0; g=g||0.5; for(let i=0;i<(o||3);i++){ s+=a*n(x,y); t+=a; a*=g; const nx=x*2.03+17.1,ny=y*2.03+9.7; x=nx; y=ny; } return s/t; };
  return n; };
/* offscreen canvas at device pixels, drawing in design units (scale S) */
A.off=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
A.layer=(canvas,S,dpr)=>{ const c=A.off(canvas.width,canvas.height); const x=c.getContext('2d'); x.setTransform(dpr*S,0,0,dpr*S,0,0); x.lineCap='round'; x.lineJoin='round'; return x; };
/* grain pass: multiplies RGB by 1 + amp·n, n a hashed signed noise on `pitch` device-pixel cells, optional lag-1 correlation.
   mono=true keeps R=G=B noise (print grain); mono=false gives per-channel colour grain (film / dither). */
A.grain=(ctx,opts)=>{ opts=opts||{}; const c=ctx.canvas; const w=c.width,h=c.height; const id=ctx.getImageData(0,0,w,h); const d=id.data; const amp=opts.amp||0.05, pitch=opts.pitch||1, seed=(opts.seed||7)|0, mono=opts.mono!==false, corr=opts.corr||0; const rows=Math.ceil(h/pitch), cols=Math.ceil(w/pitch);
  const hash=(x,y,k)=>{ let n=(x*374761393+y*668265263+k*1274126177+seed*2246822519)|0; n=(n^(n>>>13))*1274126177|0; n=n^(n>>>16); return ((n>>>0)/4294967296)*2-1; };
  const N=new Float32Array(rows*cols*(mono?1:3)); const ch=mono?1:3;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)for(let k=0;k<ch;k++){ let v=hash(x,y,k); if(corr){ v=(1-corr)*v+corr*0.5*(hash(x-1,y,k)+hash(x,y-1,k)); } N[(y*cols+x)*ch+k]=v; }
  for(let y=0;y<h;y++){ const ry=(y/pitch)|0; for(let x=0;x<w;x++){ const i=(y*w+x)*4; const b=(ry*cols+((x/pitch)|0))*ch; if(mono){ const m=1+amp*N[b]; d[i]=d[i]*m; d[i+1]=d[i+1]*m; d[i+2]=d[i+2]*m; } else { d[i]=d[i]*(1+amp*N[b]); d[i+1]=d[i+1]*(1+amp*N[b+1]); d[i+2]=d[i+2]*(1+amp*N[b+2]); } } }
  ctx.putImageData(id,0,0); };
/* gradient-map pass: reads luminance (0..1) of ctx and replaces every pixel with LUT[lum]. */
A.gradientMap=(ctx,L)=>{ const c=ctx.canvas; const id=ctx.getImageData(0,0,c.width,c.height); const d=id.data; for(let i=0;i<d.length;i+=4){ const l=(d[i]*0.2126+d[i+1]*0.7152+d[i+2]*0.0722); const k=L[A.clamp(l,0,255)|0]; d[i]=k[0]; d[i+1]=k[1]; d[i+2]=k[2]; d[i+3]=255; } ctx.putImageData(id,0,0); };
/* gaussian blur on a whole canvas via the 2-D filter (device px radius); returns a new canvas */
A.blur=(src,radiusPx)=>{ const c=A.off(src.width,src.height); const x=c.getContext('2d'); x.filter=`blur(${radiusPx}px)`; x.drawImage(src,0,0); x.filter='none'; return c; };
/* rounded rect path in design units */
A.rrect=(x,X,y,w,h,r)=>{ x.beginPath(); x.moveTo(X+r,y); x.lineTo(X+w-r,y); x.arcTo(X+w,y,X+w,y+r,r); x.lineTo(X+w,y+h-r); x.arcTo(X+w,y+h,X+w-r,y+h,r); x.lineTo(X+r,y+h); x.arcTo(X,y+h,X,y+h-r,r); x.lineTo(X,y+r); x.arcTo(X,y,X+r,y,r); x.closePath(); };
/* fit text to a width: returns the font size */
A.fitText=(x,str,font,maxW,startSize)=>{ let s=startSize; for(let i=0;i<40;i++){ x.font=font(s); if(x.measureText(str).width<=maxW)break; s*=0.94; } return s; };
return A;
})();
