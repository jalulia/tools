/* contour-flow · Contour flow (tone-warped phase) — TS-15 Banknote engraving · Techniques & Templates · ø co.
   Lifted from techniques/ts-15-banknote-engraving/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: flow · amp_pitches · pitch must stay under ~1.5 × radius or neighboring lines fold over each other at hard edges. */
export const id="contour-flow", name="Contour flow (tone-warped phase)", code="TS-15", entry="ts-15-banknote-engraving";
export const atoms=["phase-warp","blur","field"];
export const spec={
  "id": "contour-flow",
  "short": "FLOW",
  "name": "Contour flow (tone-warped phase)",
  "layer": 1,
  "pass": 2,
  "atoms": [
    "phase-warp",
    "blur",
    "field"
  ],
  "params": {
    "flow": {
      "value": 0.65,
      "range": [
        0,
        1
      ]
    },
    "amp_pitches": {
      "value": 6,
      "range": [
        0,
        12
      ],
      "note": "phase shift in pitches at flow = 1 for a black-to-white step"
    },
    "radius_u": {
      "value": 24,
      "range": [
        4,
        60
      ],
      "unit": "u"
    },
    "edge_gain": {
      "value": 9,
      "range": [
        2,
        30
      ],
      "note": "edge-energy channel used by guilloche"
    },
    "phase": "s += flow · amp_pitches · blur(L, radius)"
  },
  "limits": "flow · amp_pitches · pitch must stay under ~1.5 × radius or neighboring lines fold over each other at hard edges.",
  "implementation": "A quarter-resolution copy of the picture is blurred; its luminance is added to the line phase, so lines rise over light forms and sink into dark ones. The same pass stores blurred edge energy for the guilloche mask."
};
export const params={
  "flow": 0.65,
  "amp_pitches": 6,
  "radius_u": 24,
  "edge_gain": 9,
  "phase": "s += flow · amp_pitches · blur(L, radius)"
};
export const A={};
A.off=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
A.blur=(src,radiusPx)=>{ const c=A.off(src.width,src.height); const x=c.getContext('2d'); x.filter=`blur(${radiusPx}px)`; x.drawImage(src,0,0); x.filter='none'; return c; };
export const make=(P,u,A)=>({ amp:P.flow*P.amp_pitches, field:(src,W,H)=>{ const k=4, w=Math.ceil(W/k), h=Math.ceil(H/k); const s=A.off(w,h), sx=s.getContext('2d'); sx.drawImage(src,0,0,w,h); const id=sx.getImageData(0,0,w,h), d=id.data; const L=new Float32Array(w*h);
        for(let i=0;i<w*h;i++)L[i]=(0.2126*d[i*4]+0.7152*d[i*4+1]+0.0722*d[i*4+2])/255;
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const i=y*w+x; const gx=L[y*w+Math.min(w-1,x+1)]-L[y*w+Math.max(0,x-1)], gy=L[Math.min(h-1,y+1)*w+x]-L[Math.max(0,y-1)*w+x]; d[i*4]=L[i]*255; d[i*4+1]=Math.min(255,Math.hypot(gx,gy)*P.edge_gain*255); d[i*4+2]=0; d[i*4+3]=255; }
        sx.putImageData(id,0,0); const b=A.blur(s,Math.max(0.5,P.radius_u*u/k)); const f=A.off(W,H), fx=f.getContext('2d'); fx.imageSmoothingQuality='high'; fx.drawImage(b,0,0,W,H); return fx.getImageData(0,0,W,H).data; } });
export default make;
