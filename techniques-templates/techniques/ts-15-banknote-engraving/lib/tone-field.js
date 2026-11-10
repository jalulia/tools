/* tone-field · Tone field (the picture) — TS-15 Banknote engraving · Techniques & Templates · ø co.
   Lifted from techniques/ts-15-banknote-engraving/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Any RGB picture works in its place. Pictures with no smooth area above upper_v show no guilloche; pictures with no pixel inside the hue range print as one ink. */
export const id="tone-field", name="Tone field (the picture)", code="TS-15", entry="ts-15-banknote-engraving";
export const atoms=["source","procedural","field"];
export const spec={
  "id": "tone-field",
  "short": "SRC",
  "name": "Tone field (the picture)",
  "layer": 0,
  "pass": 0,
  "atoms": [
    "source",
    "procedural",
    "field"
  ],
  "params": {
    "subject": "headland with a signal tower and sheds, sea, far ridge — generated, lit from the left",
    "res": {
      "value": 0.5,
      "range": [
        0.25,
        1
      ],
      "note": "source resolution as a fraction of the sheet"
    },
    "horizon_v": {
      "value": 0.62,
      "range": [
        0.45,
        0.8
      ]
    },
    "soften_px": {
      "value": 0.7,
      "range": [
        0,
        3
      ],
      "unit": "px"
    },
    "seed": {
      "value": 1507,
      "range": [
        1,
        9999
      ],
      "step": 1
    }
  },
  "limits": "Any RGB picture works in its place. Pictures with no smooth area above upper_v show no guilloche; pictures with no pixel inside the hue range print as one ink.",
  "implementation": "Sky, ridge, headland and sea are evaluated per pixel from seeded Perlin noise; tower, sheds and boat are drawn as flat lit/shadow faces on top. The function returns a canvas; every later technique only reads it."
};
export const params={
  "subject": "headland with a signal tower and sheds, sea, far ridge — generated, lit from the left",
  "res": 0.5,
  "horizon_v": 0.62,
  "soften_px": 0.7,
  "seed": 1507
};
export const A={};
A.off=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
A.perlin=seed=>{ const r=A.rng(seed); const perm=new Uint8Array(512); const p=[]; for(let i=0;i<256;i++)p[i]=i; for(let i=255;i>0;i--){ const j=(r()*(i+1))|0; const t=p[i]; p[i]=p[j]; p[j]=t; } for(let i=0;i<512;i++)perm[i]=p[i&255];
  const G=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]; const fade=t=>t*t*t*(t*(t*6-15)+10);
  const n=(x,y)=>{ const X=Math.floor(x),Y=Math.floor(y); const xf=x-X,yf=y-Y; const xi=X&255,yi=Y&255; const g00=G[perm[perm[xi]+yi]&7],g10=G[perm[perm[xi+1]+yi]&7],g01=G[perm[perm[xi]+yi+1]&7],g11=G[perm[perm[xi+1]+yi+1]&7]; const n00=g00[0]*xf+g00[1]*yf,n10=g10[0]*(xf-1)+g10[1]*yf,n01=g01[0]*xf+g01[1]*(yf-1),n11=g11[0]*(xf-1)+g11[1]*(yf-1); const u=fade(xf),v=fade(yf); const a=n00+(n10-n00)*u; return a+((n01+(n11-n01)*u)-a)*v; };
  n.fbm=(x,y,o,g)=>{ let s=0,a=1,t=0; g=g||0.5; for(let i=0;i<(o||3);i++){ s+=a*n(x,y); t+=a; a*=g; const nx=x*2.03+17.1,ny=y*2.03+9.7; x=nx; y=ny; } return s/t; };
  return n; };
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
A.mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
A.blur=(src,radiusPx)=>{ const c=A.off(src.width,src.height); const x=c.getContext('2d'); x.filter=`blur(${radiusPx}px)`; x.drawImage(src,0,0); x.filter='none'; return c; };
export const make=(P,u,A)=>({ draw:(W,H)=>{
      const w=Math.max(2,Math.round(W*P.res)), h=Math.max(2,Math.round(H*P.res)); const c=A.off(w,h), x=c.getContext('2d'); const q=1000/w, Hh=h*q, hor=P.horizon_v*Hh;
      const n=A.perlin(P.seed), n2=A.perlin(P.seed+7), r=A.rng(P.seed+3);
      const head=new Float32Array(w), shore=new Float32Array(w), ridge=new Float32Array(w), fg=new Float32Array(w);
      for(let i=0;i<w;i++){ const X=i*q; const rise=A.sstep(110,650,X), fall=1-0.40*A.sstep(650,1000,X);
        head[i]=hor-(hor-0.285*Hh)*Math.pow(rise,0.78)*fall+34*n.fbm(X/150,3.1,3)*rise;
        shore[i]=hor+26+70*A.sstep(110,1000,X)+10*n.fbm(X/60,5.5,2);
        ridge[i]=hor-64-74*(0.5+0.5*n2.fbm(X/250,1.7,3));
        const k=1-A.sstep(0,470,X); fg[i]=Hh-(210+60*n.fbm(X/80,8.3,3))*k*k; }
      const id=x.createImageData(w,h), d=id.data; const mix=A.mix, cl=A.clamp, ss=A.sstep;
      for(let j=0;j<h;j++){ const Y=j*q; for(let i=0;i<w;i++){ const X=i*q; let c3;
        if(Y>fg[i]){ const sh=0.5+3.2*(n.fbm((X+5)/55,Y/55,4)-n.fbm((X-5)/55,Y/55,4)); c3=mix([14,24,34],[104,116,124],cl(0.06+0.5*sh*ss(0,26,Y-fg[i]+8),0,1)); }
        else if(X>110&&Y>=head[i]&&Y<shore[i]){ const sk=X+0.22*(Y-head[i]); const R=(a,b)=>n.fbm(a/88,b/330,3)+0.35*n2.fbm(a/31,b/120,2); const f=R(sk,Y), dx=R(sk+6,Y)-R(sk-6,Y); const dep=(Y-head[i])/(shore[i]-head[i]);
          const lit=0.55-3.6*dx-0.16*dep-0.30*ss(0.02,0.34,n2.fbm(X/300+2,Y/240,2))+0.05*Math.sin(Y/7+f*12);
          c3=mix([58,76,98],[218,152,104],cl((lit-0.05)/0.9,0,1)); }
        else if(Y>=(X>110?shore[i]:hor)){ const dp=(Y-hor)/(Hh-hor), rip=n.fbm(X/130,Y/5.5,3), gl=Math.exp(-Math.pow((X-270)/170,2));
          const l=0.52-0.30*dp+0.30*rip*(1-0.4*dp)+0.42*gl*ss(-0.12,0.32,rip)*(1-0.5*dp); c3=mix([26,52,76],[214,226,230],cl(l,0,1)); }
        else if(Y>=ridge[i]){ const hz=(Y-ridge[i])/(hor-ridge[i]+1); c3=mix([122,144,164],[172,186,198],cl(0.25+0.6*hz+0.35*n2.fbm(X/70,Y/40,3),0,1)); }
        else { const t=Y/hor; const b=mix([162,186,208],[190,200,206],Math.pow(t,1.25)); const cb=ss(0.02,0.5,n2.fbm(X/240,Y/80+4,4)+0.12)*ss(0.50,0.74,t)*(1-ss(0.93,1,t)); c3=mix(b,[222,226,226],0.62*cb); }
        const o=(j*w+i)*4; d[o]=c3[0]; d[o+1]=c3[1]; d[o+2]=c3[2]; d[o+3]=255; } }
      x.putImageData(id,0,0); x.setTransform(1/q,0,0,1/q,0,0);
      const poly=(pts,fill)=>{ x.beginPath(); pts.forEach((p,k)=>k?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])); x.closePath(); x.fillStyle=fill; x.fill(); };
      const top=X=>head[Math.max(0,Math.min(w-1,Math.round(X/q)))];
      const shed=(X,Y,wd,hh,sd,rh)=>{ poly([[X,Y],[X+wd,Y],[X+wd,Y-hh],[X,Y-hh]],'#EFE7D6'); poly([[X+wd,Y],[X+wd+sd,Y-sd*0.45],[X+wd+sd,Y-hh-sd*0.45],[X+wd,Y-hh]],'#4C5F72');
        poly([[X-3,Y-hh],[X+wd+3,Y-hh],[X+wd+sd*0.5+2,Y-hh-rh],[X+sd*0.5-1,Y-hh-rh]],'#CB6A3A'); poly([[X+wd+3,Y-hh],[X+wd+sd+3,Y-hh-sd*0.45],[X+wd+sd*0.5+2,Y-hh-rh]],'#84401F');
        const nw=Math.max(1,Math.round(wd/15)); for(let k=0;k<nw;k++){ const wx=X+wd*(k+0.5)/nw-2.2; poly([[wx,Y-hh*0.72],[wx+4.4,Y-hh*0.72],[wx+4.4,Y-hh*0.34],[wx,Y-hh*0.34]],'#2A3A4A'); } };
      const list=[]; for(let k=0;k<11;k++){ const X=700+r()*250, dp=0.10+r()*0.42; list.push([X,top(X)+dp*(hor+60-top(X)),30+r()*26,18+r()*14]); }
      for(let k=0;k<6;k++){ const X=250+k*58+r()*16; list.push([X,top(X)+9+r()*10,32+r()*24,20+r()*12]); }
      list.sort((a,b)=>a[1]-b[1]); for(const s of list)shed(s[0],s[1],s[2],s[3],s[2]*0.34,s[3]*0.52);
      /* signal tower on the summit */
      { const X=640, Y=top(X)+10, Ht=178, b=22, t=15; const g=x.createLinearGradient(X-b,0,X+b,0); g.addColorStop(0,'#F3EDE0'); g.addColorStop(0.42,'#D9D3C6'); g.addColorStop(1,'#5A6C7E'); poly([[X-b,Y],[X+b,Y],[X+t,Y-Ht],[X-t,Y-Ht]],g);
        const band=(a,c)=>{ const hw=v=>b+(t-b)*v; const g2=x.createLinearGradient(X-b,0,X+b,0); g2.addColorStop(0,'#D2632F'); g2.addColorStop(0.5,'#B8532A'); g2.addColorStop(1,'#5E2A14'); poly([[X-hw(a),Y-Ht*a],[X+hw(a),Y-Ht*a],[X+hw(c),Y-Ht*c],[X-hw(c),Y-Ht*c]],g2); };
        band(0.26,0.42); band(0.62,0.78); poly([[X-5,Y],[X+5,Y],[X+5,Y-17],[X-5,Y-17]],'#22303C');
        poly([[X-24,Y-Ht],[X+24,Y-Ht],[X+24,Y-Ht-6],[X-24,Y-Ht-6]],'#1E2C38'); poly([[X-11,Y-Ht-6],[X+11,Y-Ht-6],[X+11,Y-Ht-30],[X-11,Y-Ht-30]],'#E4ECEE');
        for(const m of [-11,-4,3,9.5])poly([[X+m,Y-Ht-6],[X+m+1.6,Y-Ht-6],[X+m+1.6,Y-Ht-30],[X+m,Y-Ht-30]],'#22303C');
        poly([[X-14,Y-Ht-30],[X+14,Y-Ht-30],[X+5,Y-Ht-46],[X-5,Y-Ht-46]],'#B8532A'); poly([[X-0.9,Y-Ht-46],[X+0.9,Y-Ht-46],[X+0.9,Y-Ht-66],[X-0.9,Y-Ht-66]],'#1E2C38'); }
      /* boat */
      { const X=300, Y=hor+118; poly([[X-46,Y-9],[X+50,Y-11],[X+38,Y+6],[X-34,Y+6]],'#16222E'); poly([[X-45,Y-9],[X+50,Y-11],[X+49,Y-7],[X-44,Y-5]],'#C2592C'); poly([[X-12,Y-10],[X+16,Y-10.5],[X+16,Y-25],[X-12,Y-25]],'#ECE6D8'); poly([[X+16,Y-10.5],[X+24,Y-13],[X+24,Y-26],[X+16,Y-25]],'#506274'); poly([[X-1,Y-25],[X+0.6,Y-25],[X+0.6,Y-58],[X-1,Y-58]],'#16222E'); }
      x.setTransform(1,0,0,1,0,0); return P.soften_px>0?A.blur(c,P.soften_px):c; } });
export default make;
