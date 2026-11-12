/* capsule-ui · Controls from one pill — TS-22 Capsule system · Techniques & Templates · ø co.
   Lifted from techniques/ts-22-capsule-rain/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Under 24 u height the 11.5 u label touches the pill edge. */
export const id="capsule-ui", name="Controls from one pill", code="TS-22", entry="ts-22-capsule-rain";
export const atoms=["pill","control","state"];
export const spec={
  "id": "capsule-ui",
  "short": "CTRL",
  "name": "Controls from one pill",
  "layer": 4,
  "pass": 4,
  "atoms": [
    "pill",
    "control",
    "state"
  ],
  "params": {
    "height_u": {
      "value": 38,
      "range": [
        24,
        60
      ],
      "unit": "u"
    },
    "line_u": {
      "value": 1.2,
      "range": [
        0.4,
        4
      ],
      "unit": "u"
    },
    "type_u": {
      "value": 11.5,
      "range": [
        8,
        18
      ],
      "unit": "u"
    },
    "toggle": {
      "value": 1,
      "range": [
        0,
        1
      ],
      "step": 1
    },
    "slider": {
      "value": 0.62,
      "range": [
        0,
        1
      ]
    },
    "page": {
      "value": 1,
      "range": [
        0,
        4
      ],
      "step": 1
    }
  },
  "limits": "Under 24 u height the 11.5 u label touches the pill edge.",
  "implementation": "Button, toggle, three chips, slider, pager and a nine-bar meter are all one rounded bar at different sizes, filled or outlined. The meter reads the slider value."
};
export const params={
  "height_u": 38,
  "line_u": 1.2,
  "type_u": 11.5,
  "toggle": 1,
  "slider": 0.62,
  "page": 1
};
export const A={};

export const make=(P,u,A)=>({ draw:(x,R,V)=>{ const rr=(X,Y,w,h,fill,stroke)=>{ const r=Math.min(w,h)/2; x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); if(fill){ x.fillStyle=fill; x.fill(); } if(stroke){ x.strokeStyle=stroke; x.lineWidth=P.line_u*u; x.stroke(); } };
        const sz=P.type_u*u, tr=0.16*sz; const text=(s,cx,cy,color)=>{ x.font=`500 ${sz}px "JetBrains Mono", monospace`; x.textBaseline='middle'; x.fillStyle=color; let w=-tr; for(const ch of s)w+=x.measureText(ch).width+tr; let X=cx-w/2; for(const ch of s){ x.fillText(ch,X,cy+sz*0.05); X+=x.measureText(ch).width+tr; } };
        const h=P.height_u*u, X=R.x, Y=R.y, on=P.toggle>0.5;
        rr(X,Y,150*u,h,V.ink); text('START',X+75*u,Y+h/2,V.sheet);
        const tx=X+172*u, tw=h*1.9; rr(tx,Y,tw,h,on?V.inks[4]:null,on?null:V.ink); x.fillStyle=on?V.sheet:V.ink; x.beginPath(); x.arc(on?tx+tw-h/2:tx+h/2,Y+h/2,h/2-4*u,0,6.2832); x.fill();
        let cxp=tx+tw+22*u; ['ONE','TWO','ALL'].forEach((s,i)=>{ const w=62*u; rr(cxp,Y,w,h,i===0?V.ink:null,i===0?null:V.ink); text(s,cxp+w/2,Y+h/2,i===0?V.sheet:V.ink); cxp+=w+8*u; });
        const sy=Y+h+36*u, sw=300*u, th=6*u; rr(X,sy-th/2,sw,th,null,V.ink); rr(X,sy-th/2,Math.max(th,sw*P.slider),th,V.inks[0]); rr(X+sw*P.slider-7*u,sy-13*u,14*u,26*u,V.ink);
        let cx2=X+336*u; for(let i=0;i<5;i++){ const act=i===Math.round(P.page); const w=act?26*u:8*u; rr(cx2,sy-4*u,w,8*u,act?V.inks[1]:V.ink); cx2+=w+8*u; }
        const mx=X+432*u; for(let i=0;i<9;i++){ const hh=(8+30*Math.abs(Math.sin(i*0.9+P.slider*6)))*u; rr(mx+i*9*u,sy+13*u-hh,5.5*u,hh,V.inks[i%V.inks.length]===V.sheet?V.ink:V.inks[i%V.inks.length]); } } });
export default make;
