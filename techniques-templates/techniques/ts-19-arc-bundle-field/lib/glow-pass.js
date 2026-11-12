/* glow-pass · Additive glow — TS-19 Arc bundles on a dashed globe · Techniques & Templates · ø co.
   Lifted from techniques/ts-19-arc-bundle-field/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: gain above ~1 washes the thin strokes into a haze. */
export const id="glow-pass", name="Additive glow", code="TS-19", entry="ts-19-arc-bundle-field";
export const atoms=["blur","additive"];
export const spec={
  "id": "glow-pass",
  "short": "GLOW",
  "name": "Additive glow",
  "layer": 3,
  "pass": 3,
  "atoms": [
    "blur",
    "additive"
  ],
  "params": {
    "sigma_u": {
      "value": 5,
      "range": [
        0,
        30
      ],
      "unit": "u"
    },
    "gain": {
      "value": 0.35,
      "range": [
        0,
        1.5
      ]
    }
  },
  "limits": "gain above ~1 washes the thin strokes into a haze.",
  "implementation": "The stroke layer is blurred and added back over itself."
};
export const params={
  "sigma_u": 5,
  "gain": 0.35
};
export const A={};
A.blur=(src,radiusPx)=>{ const c=A.off(src.width,src.height); const x=c.getContext('2d'); x.filter=`blur(${radiusPx}px)`; x.drawImage(src,0,0); x.filter='none'; return c; };
A.off=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
export const make=(P,u,A)=>({ apply:(x,layer,dpr,blend)=>{ if(P.gain<=0||P.sigma_u<=0)return; const g=A.blur(layer,P.sigma_u*u); x.save(); x.globalCompositeOperation=blend; x.globalAlpha=Math.min(1,P.gain); x.drawImage(g,0,0); if(P.gain>1){ x.globalAlpha=P.gain-1; x.drawImage(g,0,0); } x.restore(); } });
export default make;
