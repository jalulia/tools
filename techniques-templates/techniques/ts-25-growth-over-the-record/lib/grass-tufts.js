/* grass-tufts · Grass tufts — TS-25 Growth over the record · Techniques & Templates · ø co.
   Lifted from techniques/ts-25-growth-over-the-record/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Above about 24 u the front tufts cover the swell and read as reeds; at 2 u they sink into the grain and the grass reads as plain stipple. */
export const id="grass-tufts", name="Grass tufts", code="TS-25", entry="ts-25-growth-over-the-record";
export const atoms=["blade","tuft","perspective","tone-layer"];
export const spec={
  "id": "grass-tufts",
  "short": "TUFT",
  "name": "Grass tufts",
  "layer": 4,
  "pass": 4,
  "atoms": [
    "blade",
    "tuft",
    "perspective",
    "tone-layer"
  ],
  "params": {
    "blade_u": {
      "value": 12,
      "range": [
        4,
        24
      ],
      "unit": "u",
      "scale": "linear",
      "label": "Blade length",
      "note": "height of a tuft in the foreground; tufts higher up the hill are drawn smaller"
    },
    "count": 420,
    "dark_share": 0.6,
    "seed": 47
  },
  "limits": "Above about 24 u the front tufts cover the swell and read as reeds; at 2 u they sink into the grain and the grass reads as plain stipple.",
  "implementation": "420 tufts of three to seven curved, tapering blades, placed on grass only and denser toward the front; each blade is a dark or light tone in the shared tone layer and the grain screens it like the rest of the grass."
};
export const params={
  "blade_u": 12,
  "count": 420,
  "dark_share": 0.6,
  "seed": 47
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>{ const place=(main,ok,Hu)=>{ const r=A.rng(P.seed), out=[]; let guard=0;
        while(out.length<P.count&&guard++<P.count*8){ const x=r()*1000, t=main(x)[0], y=t+8+(Hu-t-4)*Math.sqrt(r()), n=3+Math.floor(r()*5), lean=(r()-0.5)*0.5, seed=Math.floor(r()*1e9);
          if(y>Hu+2||!ok(x,y))continue; out.push({ x, y, s:0.3+0.7*Math.pow(Math.min(1,Math.max(0,(y-160)/(Hu-160))),1.15), n, lean, seed }); }
        return out; };
      const draw=(c,list)=>{ const C=t=>`rgb(${Math.max(0,Math.min(255,Math.round(t*255)))},128,0)`;
        for(const f of list){ const r=A.rng(f.seed), bx=f.x*u, by=f.y*u, H=P.blade_u*u*f.s;
          for(let j=0;j<f.n;j++){ const a=f.lean+((j+0.5)/f.n-0.5)*1.2+(r()-0.5)*0.35, h=H*(0.55+0.6*r()), x0=bx+(r()-0.5)*0.3*H, tx=x0+Math.sin(a)*h, ty=by-Math.cos(a)*h*0.95, cx=x0+Math.sin(a*0.35)*h*0.55, cy=by-h*0.6, w=Math.max(0.7,0.06*h), dark=r()<P.dark_share;
            c.fillStyle=C(dark?0.1*r():0.8+0.2*r()); c.beginPath(); c.moveTo(x0-w,by); c.quadraticCurveTo(cx-w*0.6,cy,tx,ty); c.quadraticCurveTo(cx+w*0.6,cy,x0+w,by); c.closePath(); c.fill(); } } };
      return { place, draw }; };
export default make;
