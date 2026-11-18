/* origin-dot · Origin — TS-27 Seen from far · Techniques & Templates · ø co.
   Lifted from techniques/ts-27-seen-from-far/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A,V) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Marks zero with the origin dot in its ring, drawn last at every distance. */
export const id="origin-dot", name="Origin", code="TS-27", entry="ts-27-seen-from-far";
export const atoms=["marker","dot"];
export const spec={
  "id": "origin-dot",
  "short": "ZERO",
  "name": "Origin",
  "layer": 5,
  "pass": 5,
  "atoms": [
    "marker",
    "dot"
  ],
  "params": {
    "mark": {
      "value": 2,
      "options": [
        {
          "v": 1,
          "label": "Off"
        },
        {
          "v": 2,
          "label": "On"
        }
      ],
      "label": "Origin",
      "note": "the origin dot in its ring at zero"
    },
    "dot_u": 12.5,
    "ring_u": 18.5
  },
  "limits": "Marks zero with the origin dot in its ring, drawn last at every distance.",
  "implementation": "One orange disc in a lime ring at zero; up close it casts a short shadow on the grass."
};
export const params={
  "mark": 2,
  "dot_u": 12.5,
  "ring_u": 18.5
};
export const A={};
A.rgb=(v,a)=>`rgba(${v[0]|0},${v[1]|0},${v[2]|0},${a===undefined?1:a})`;
A.hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
export const make=(P,u,A,V)=>({ draw:(c,cx,cy,s,shadow)=>{ if(P.mark===1)return; c.save(); const rd=P.dot_u/2*s, rr=P.ring_u/2*s;
      if(shadow>0){ c.fillStyle=A.rgb(A.hex(V.tree),0.28*shadow); c.beginPath(); c.arc(cx+1.6*s,cy+2.2*s,rr*1.08,0,6.2832); c.fill(); }
      c.fillStyle=V.ring; c.beginPath(); c.arc(cx,cy,rr,0,6.2832); c.fill();
      c.fillStyle=V.origin; c.beginPath(); c.arc(cx,cy,rd,0,6.2832); c.fill(); c.restore(); } });
export default make;
