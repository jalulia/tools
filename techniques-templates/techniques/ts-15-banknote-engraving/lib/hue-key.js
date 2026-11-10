/* hue-key · Kept hue as a second ink — TS-15 Banknote engraving · Techniques & Templates · ø co.
   Lifted from techniques/ts-15-banknote-engraving/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A,V) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: tolerance + feather above ~90° keys most warm pictures whole; min_sat under ~8 % keys neutral grays by their noise hue. */
export const id="hue-key", name="Kept hue as a second ink", code="TS-15", entry="ts-15-banknote-engraving";
export const atoms=["hue-key","spot-ink","mask"];
export const spec={
  "id": "hue-key",
  "short": "HKEY",
  "name": "Kept hue as a second ink",
  "layer": 3,
  "pass": 6,
  "atoms": [
    "hue-key",
    "spot-ink",
    "mask"
  ],
  "params": {
    "hue_deg": {
      "value": 22,
      "range": [
        0,
        360
      ],
      "unit": "°"
    },
    "tolerance_deg": {
      "value": 30,
      "range": [
        2,
        90
      ],
      "unit": "°"
    },
    "feather_deg": {
      "value": 18,
      "range": [
        0,
        60
      ],
      "unit": "°"
    },
    "min_sat": {
      "value": 18,
      "range": [
        0,
        80
      ],
      "unit": "%"
    },
    "strength": {
      "value": 0.8,
      "range": [
        0,
        1
      ]
    },
    "keep_shadows": {
      "value": 0.65,
      "range": [
        0,
        1
      ]
    },
    "ink_sat": {
      "value": 0.62,
      "range": [
        0.2,
        1
      ]
    },
    "ink_light": {
      "value": 0.4,
      "range": [
        0.2,
        0.6
      ]
    },
    "mode": "variant.accent — \"hue\": ink takes each pixel’s own hue · \"#hex\": one custom ink · \"off\": monochrome"
  },
  "limits": "tolerance + feather above ~90° keys most warm pictures whole; min_sat under ~8 % keys neutral grays by their noise hue.",
  "implementation": "Mask = 1 inside tolerance of the chosen hue, feathered to 0, gated by saturation, scaled by strength and pulled back toward the main ink in the shadows by keep_shadows. It changes ink color only — line width is unchanged."
};
export const params={
  "hue_deg": 22,
  "tolerance_deg": 30,
  "feather_deg": 18,
  "min_sat": 18,
  "strength": 0.8,
  "keep_shadows": 0.65,
  "ink_sat": 0.62,
  "ink_light": 0.4,
  "mode": "variant.accent — \"hue\": ink takes each pixel’s own hue · \"#hex\": one custom ink · \"off\": monochrome"
};
export const A={};
A.hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,u,A,V)=>{ const main=A.hex(V.ink), on=V.accent&&V.accent!=='off', custom=on&&V.accent[0]==='#'?A.hex(V.accent):null; const out=[0,0,0];
      const hsl=(h,s,l)=>{ const c=(1-Math.abs(2*l-1))*s, hp=h/60, x=c*(1-Math.abs(hp%2-1)), m=l-c/2; const q=hp<1?[c,x,0]:hp<2?[x,c,0]:hp<3?[0,c,x]:hp<4?[0,x,c]:hp<5?[x,0,c]:[c,0,x]; return [(q[0]+m)*255,(q[1]+m)*255,(q[2]+m)*255]; };
      let Hq=0; const mask=(r,g,b)=>{ const mx=Math.max(r,g,b), mn=Math.min(r,g,b), c=mx-mn; if(!mx||c/mx*100<P.min_sat)return 0; let h=mx===r?((g-b)/c)%6:mx===g?(b-r)/c+2:(r-g)/c+4; h*=60; if(h<0)h+=360; let dh=Math.abs(h-P.hue_deg); if(dh>180)dh=360-dh; Hq=h; return (1-A.sstep(P.tolerance_deg,P.tolerance_deg+P.feather_deg+0.001,dh))*A.sstep(P.min_sat,P.min_sat+14,c/mx*100); };
      return { main, mask, ink:(r,g,b,dark)=>{ if(!on)return main; const m=mask(r,g,b)*P.strength*(1-P.keep_shadows*A.sstep(0.6,0.98,dark)); if(m<=0)return main; const acc=custom||hsl(Hq,P.ink_sat,P.ink_light); out[0]=main[0]+(acc[0]-main[0])*m; out[1]=main[1]+(acc[1]-main[1])*m; out[2]=main[2]+(acc[2]-main[2])*m; return out; } }; };
export default make;
