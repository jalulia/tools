/* grid-stock · Isometric grid stock — TS-06 Riso three-plate separation · Techniques & Templates · ø co.
   Lifted from techniques/ts-06-riso-plate-separation/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A,V) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Above alpha ~0.35 the grid competes with the keyline. Under a 14 u pitch the three line families merge into a gray tint. */
export const id="grid-stock", name="Isometric grid stock", code="TS-06", entry="ts-06-riso-plate-separation";
export const atoms=["stock","grid","isometric"];
export const spec={
  "id": "grid-stock",
  "short": "STCK",
  "name": "Isometric grid stock",
  "layer": 0,
  "pass": 0,
  "atoms": [
    "stock",
    "grid",
    "isometric"
  ],
  "params": {
    "stock": "#EEEEEC",
    "vertical_pitch_u": {
      "value": 31.5,
      "range": [
        12,
        90
      ],
      "unit": "u"
    },
    "diagonals": "±30° through the same lattice, 18.2 u apart along a vertical",
    "alpha": {
      "value": 0.16,
      "range": [
        0,
        0.6
      ]
    },
    "width_u": {
      "value": 1,
      "range": [
        0.3,
        3
      ],
      "unit": "u"
    }
  },
  "limits": "Above alpha ~0.35 the grid competes with the keyline. Under a 14 u pitch the three line families merge into a gray tint.",
  "implementation": "Flat gray fill, then verticals and both diagonal families stroked in the grid ink at 16 % before any plate lands."
};
export const params={
  "stock": "#EEEEEC",
  "vertical_pitch_u": 31.5,
  "diagonals": "±30° through the same lattice, 18.2 u apart along a vertical",
  "alpha": 0.16,
  "width_u": 1
};
export const A={};
A.off=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
A.rgb=(v,a)=>`rgba(${v[0]|0},${v[1]|0},${v[2]|0},${a===undefined?1:a})`;
A.hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
export const make=(P,u,A,V)=>({ paint:(W,H)=>{ const c=A.off(W,H); const x=c.getContext('2d'); x.fillStyle=V.stock; x.fillRect(0,0,W,H);
      x.setTransform(u,0,0,u,0,0); x.strokeStyle=A.rgb(A.hex(V.grid),P.alpha); x.lineWidth=P.width_u; const p=P.vertical_pitch_u, Hu=H/u, t30=Math.tan(Math.PI/6);
      x.beginPath(); for(let X=-1000;X<2000;X+=p){ x.moveTo(X,0); x.lineTo(X,Hu); x.moveTo(X,0); x.lineTo(X+Hu/t30,Hu); x.moveTo(X,0); x.lineTo(X-Hu/t30,Hu); } x.stroke();
      return c; } });
export default make;
