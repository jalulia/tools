/* TS-16 original seeded primitives, quantized dot stamps and paper tooth. */
window.SkyTech={"scallop-bank":(P,u,A)=>({ banks:P.banks.map(b=>{ const r=A.rng(b.seed); const fx=b.from[0]*u, fy=b.from[1]*u, tx=b.to[0]*u, ty=b.to[1]*u; const len=Math.hypot(tx-fx,ty-fy); const dx=(tx-fx)/len, dy=(ty-fy)/len; let nx=dy, ny=-dx; if(ny>0){ nx=-nx; ny=-ny; }
        const Rb=b.R*P.R_scale*u; const lobes=[]; let s=0;
        while(s<=len){ const R=Rb*(1+(r()*2-1)*P.R_var); const cx=fx+dx*s, cy=fy+dy*s; lobes.push([cx,cy,R]);
          if(r()<P.child){ const a=(r()*2-1)*0.9, ca=Math.cos(a), sa=Math.sin(a); const kx=nx*ca-ny*sa, ky=nx*sa+ny*ca; lobes.push([cx+kx*R*0.78,cy+ky*R*0.78,R*(0.38+0.25*r())]); }
          s+=R*P.spacing; }
        const x0=Math.min(fx,tx), x1=Math.max(fx,tx);
        const depth=(x,y)=>{ let d=-1e9; for(let i=0;i<lobes.length;i++){ const l=lobes[i]; const ex=x-l[0], ey=y-l[1]; const q=l[2]-Math.sqrt(ex*ex+ey*ey); if(q>d)d=q; } if(x>=x0&&x<=x1){ const below=-((x-fx)*nx+(y-fy)*ny); if(below>0){ const q=below+Rb*0.375; if(q>d)d=q; } } return d; };
        const path=(c,W,H)=>{ const B=Math.max(fy,ty,H)+Rb; const pts=[[fx,fy],[tx,ty],[tx,B],[fx,B]]; let a=0; for(let i=0;i<4;i++){ const p=pts[i], q=pts[(i+1)%4]; a+=p[0]*q[1]-q[0]*p[1]; } if(a<0)pts.reverse();
          c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<4;i++)c.lineTo(pts[i][0],pts[i][1]); c.closePath(); for(const l of lobes){ c.moveTo(l[0]+l[2],l[1]); c.arc(l[0],l[1],l[2],0,6.2832); } };
        return { fill:b.fill, shade:b.shade, Rb, dir:[dx,dy], depth, path }; }) }),
"stipple-fill":(P,u,A)=>({ r:P.radius_u*u, swell:P.swell, each:(W,H,put)=>{ const r=A.rng(P.seed); const p=P.pitch_u*u; let j=0; for(let y=p*0.5;y<H;y+=p*0.866,j++)for(let X=p*0.5+(j&1)*p*0.5;X<W;X+=p)put(X+(r()*2-1)*P.jitter*p,y+(r()*2-1)*P.jitter*p,r()); } }),
"shade-field":(P,u,A)=>{ const n=A.perlin(P.seed); const sy=P.wisp_u*u, sx=sy*P.stretch;
      return { tone:(b,depth,x,y)=>{ const a=x*b.dir[0]+y*b.dir[1], c=-x*b.dir[1]+y*b.dir[0]; const w=A.sstep(-P.contrast,P.contrast,n.fbm(a/sx+3.1,c/sy+7.7,3)); const m=1-P.wisp_mix+P.wisp_mix*w; let t;
          if(b.shade==='rim'){ const e=depth<0?1:Math.exp(-depth/(P.rim_depth*b.Rb)); t=(P.rim_floor+(1-P.rim_floor)*e)*(0.55+0.45*m); } else t=A.sstep(P.body_from*b.Rb,P.body_to*b.Rb,depth)*m;
          t*=P.gain; return t<0?0:(t>1?1:t); } }; },
"grain-wash":(P,u,A)=>({ amount:P.amount, layer:(W,H,color,tone)=>{ const q=P.res_div; const w=Math.ceil(W/q)+2, h=Math.ceil(H/q)+2; const F=new Float32Array(w*h); for(let j=0;j<h;j++)for(let i=0;i<w;i++)F[j*w+i]=P.amount*tone(i*q,j*q);
        const c=A.off(W,H), x=c.getContext('2d'); const id=x.createImageData(W,H), d=id.data; const k=A.hex(color); let s=P.seed|0; const g=P.grain;
        for(let y=0;y<H;y++){ const fy=y/q, j=fy|0, ty=fy-j; for(let X=0;X<W;X++){ const fx=X/q, i=fx|0, tx=fx-i; const o=j*w+i; const a=(F[o]*(1-tx)+F[o+1]*tx)*(1-ty)+(F[o+w]*(1-tx)+F[o+w+1]*tx)*ty;
            s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; const n=((t^t>>>14)>>>0)/4294967296; const p=(y*W+X)*4; d[p]=k[0]; d[p+1]=k[1]; d[p+2]=k[2]; d[p+3]=255*((1-g)*a+g*(n<a?1:0)); } }
        x.putImageData(id,0,0); return { canvas:c, w:W, h:H }; } }),
"paper-tooth":(P,u,A)=>({ apply:ctx=>{ if(P.amp<=0&&P.weave<=0)return; const c=ctx.canvas, W=c.width, H=c.height; const id=ctx.getImageData(0,0,W,H), d=id.data; const p=Math.max(2,P.weave_u*u); const sx=new Float32Array(W), sy=new Float32Array(H); for(let i=0;i<W;i++)sx[i]=Math.sin(6.2832*i/p); for(let j=0;j<H;j++)sy[j]=Math.sin(6.2832*j/p);
        let s=P.seed|0; for(let j=0;j<H;j++){ const wy=sy[j]*P.weave; for(let i=0;i<W;i++){ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; const m=1+P.amp*(((t^t>>>14)>>>0)/2147483648-1)+sx[i]*wy; const o=(j*W+i)*4; d[o]*=m; d[o+1]*=m; d[o+2]*=m; } }
        ctx.putImageData(id,0,0); } })};
window.SkyStipple=function(x,sc,V,turn,grow,shim,t){ const d=sc.dots, r=sc.lat.r, sw=sc.lat.swell, n=sc.B.length+1; const G=[]; for(let i=0;i<n*3;i++)G.push([]);
    for(let i=0;i<d.length;i+=5){ const reg=d[i+3]; let k=d[i+2]; if(shim)k+=shim*Math.sin(t*1.9+k*61.7); const D=reg<0?sc.burst.density(d[i],d[i+1],turn,grow):d[i+4]; if(k<D)G[(reg+1)*3+(D>0.8?2:(D>0.45?1:0))].push(d[i],d[i+1]); }
    /* under 2.4 px radius a dot is a pixel-quantized disc of the same area (rows of whole pixels), so its edge is hard
       and it still reads round at 2x; under ~0.9 px it is one pixel */
    const stamp=rr=>{ const R=Math.ceil(rr), out=[]; for(let dy=-R;dy<=R;dy++){ let m=-1; for(let dx=0;dx<=R;dx++)if(dx*dx+dy*dy<=rr*rr+0.3)m=dx; if(m>=0)out.push(dy,m); } return out.length?out:[0,0]; };
    const put=(arr,color,rr)=>{ if(!arr.length)return; x.fillStyle=color; x.beginPath(); if(rr<2.4){ const st=rr<0.9?[0,0]:stamp(rr); for(let j=0;j<arr.length;j+=2){ const cx=Math.round(arr[j]), cy=Math.round(arr[j+1]); for(let q=0;q<st.length;q+=2)x.rect(cx-st[q+1],cy+st[q],2*st[q+1]+1,1); } } else for(let j=0;j<arr.length;j+=2){ x.moveTo(arr[j]+rr,arr[j+1]); x.arc(arr[j],arr[j+1],rr,0,6.2832); } x.fill(); };
    for(let g=0;g<n;g++){ const color=g===0?V.ray:V.banks[sc.B[g-1].fill].dot; for(let z=0;z<3;z++)put(G[g*3+z],color,r*(1+sw*z*0.5)); } };
