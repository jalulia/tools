/* capsule-rain · Capsule columns — TS-22 Capsule rain system · Techniques & Templates · ø co.
   Lifted from techniques/ts-22-capsule-rain/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Pitch under the largest width (10.5 u) makes columns overlap their neighbors; that is intended at 6.5 u and turns to a solid tint under ~4 u. gap under ~0.1 fuses a column into a bar. */
export const id="capsule-rain", name="Capsule columns", code="TS-22", entry="ts-22-capsule-rain";
export const atoms=["capsule","column","growth-axis"];
export const spec={
  "id": "capsule-rain",
  "short": "RAIN",
  "name": "Capsule columns",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "capsule",
    "column",
    "growth-axis"
  ],
  "params": {
    "pitch_u": {
      "value": 6.5,
      "range": [
        4,
        30
      ],
      "unit": "u"
    },
    "length_u": [
      2,
      78
    ],
    "width_u": [
      1.5,
      10.5
    ],
    "length_curve": {
      "value": 1.7,
      "range": [
        0.5,
        4
      ],
      "note": "exponent on t for length"
    },
    "gap": {
      "value": 0.28,
      "range": [
        0.05,
        2
      ],
      "note": "gap as a share of the pill length"
    },
    "fill": {
      "value": 0.94,
      "range": [
        0.05,
        1
      ],
      "note": "chance that a slot holds a pill"
    },
    "jitter_u": {
      "value": 1.2,
      "range": [
        0,
        6
      ],
      "unit": "u"
    },
    "fall": {
      "value": 0,
      "range": [
        0,
        1
      ],
      "note": "phase of the fall; Motion runs it"
    },
    "seed": {
      "value": 88,
      "range": [
        1,
        9999
      ],
      "step": 1
    }
  },
  "limits": "Pitch under the largest width (10.5 u) makes columns overlap their neighbors; that is intended at 6.5 u and turns to a solid tint under ~4 u. gap under ~0.1 fuses a column into a bar.",
  "implementation": "Each column is filled top to bottom with rounded bars whose length and width are set by the column’s position t on the growth axis; lengths vary ±50 %."
};
export const params={
  "pitch_u": 6.5,
  "length_u": [
    2,
    78
  ],
  "width_u": [
    1.5,
    10.5
  ],
  "length_curve": 1.7,
  "gap": 0.28,
  "fill": 0.94,
  "jitter_u": 1.2,
  "fall": 0,
  "seed": 88
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
A.lerp=(a,b,t)=>a+(b-a)*t;
export const make=(P,u,A)=>({ fill:(x,R,opt)=>{ const r=A.rng(P.seed+(opt.seed||0)); const p=P.pitch_u*u;
        const pill=(cx,y,w,len)=>{ const rad=Math.min(w,len)/2; x.beginPath(); x.moveTo(cx-w/2+rad,y); x.arcTo(cx+w/2,y,cx+w/2,y+len,rad); x.arcTo(cx+w/2,y+len,cx-w/2,y+len,rad); x.arcTo(cx-w/2,y+len,cx-w/2,y,rad); x.arcTo(cx-w/2,y,cx+w/2,y,rad); x.closePath(); x.fill(); };
        for(let cx=R.x+p*0.5;cx<R.x+R.w;cx+=p){ let t=(cx-R.x)/R.w; if(opt.dir<0)t=1-t; const tt=opt.tfix!==undefined?opt.tfix:t; const len0=A.lerp(P.length_u[0],P.length_u[1],Math.pow(tt,P.length_curve))*u, w=A.lerp(P.width_u[0],P.width_u[1],tt)*u;
          const top=opt.env?R.y+R.h*opt.env.top(t):R.y; const shift=((P.fall*(1+Math.floor(r()*3)))%1)*R.h; let y=-len0*r();
          while(y<R.h){ const len=Math.max(w,len0*(0.5+r())); const k=r(), j=(r()*2-1)*P.jitter_u*u, keep=r(), sc=r(), ti=r(), gap=r();
            if(keep<P.fill*(opt.density===undefined?1:opt.density)){ const m=((y+shift)%R.h+R.h)%R.h; for(let c=0;c<2;c++){ const yy=R.y+m-c*R.h; if(yy+len<R.y||yy>R.y+R.h)continue; if(opt.env&&yy<top&&!(sc<opt.env.scatter*Math.exp(-(top-yy)/R.h*14)))continue; x.fillStyle=opt.inks.pick(opt.tink!==undefined?ti:t,k); pill(cx+j,yy,w,len); } }
            y+=len*(1+P.gap*(0.4+gap*1.2)); } } } });
export default make;
