/* stroke-gradient · Along-stroke gradient — TS-19 Arc bundles on a dashed globe · Techniques & Templates · ø co.
   Lifted from techniques/ts-19-arc-bundle-field/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A,V) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: With both alphas at 1 on a dark ground, crossings near the hub clip to white. */
export const id="stroke-gradient", name="Along-stroke gradient", code="TS-19", entry="ts-19-arc-bundle-field";
export const atoms=["gradient","additive"];
export const spec={
  "id": "stroke-gradient",
  "short": "GRAD",
  "name": "Along-stroke gradient",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "gradient",
    "additive"
  ],
  "params": {
    "root_alpha": {
      "value": 0.2,
      "range": [
        0,
        1
      ]
    },
    "tip_alpha": {
      "value": 0.66,
      "range": [
        0,
        1
      ]
    },
    "ink_step": "ink index steps across the bundle, mixed with the next ink",
    "blend": "lighter"
  },
  "limits": "With both alphas at 1 on a dark ground, crossings near the hub clip to white.",
  "implementation": "A linear gradient from the hub to the stroke end colors each stroke: faint at the root, full ink at the tip. Strokes are composited with the lighter blend."
};
export const params={
  "root_alpha": 0.2,
  "tip_alpha": 0.66,
  "ink_step": "ink index steps across the bundle, mixed with the next ink",
  "blend": "lighter"
};
export const A={};
A.hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
A.mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
A.rgb=(v,a)=>`rgba(${v[0]|0},${v[1]|0},${v[2]|0},${a===undefined?1:a})`;
export const make=(P,u,A,V)=>({ blend:V.blend||P.blend, style:(x,s)=>{ const inks=V.inks.map(A.hex); const f=s.b+s.t*1.6; const a=inks[Math.floor(f)%inks.length], b=inks[(Math.floor(f)+1)%inks.length]; const ink=A.mix(a,b,f-Math.floor(f));
        const g=x.createLinearGradient(s.x0,s.y0,s.x1,s.y1); g.addColorStop(0,A.rgb(A.mix(A.hex(V.root),ink,0.6),P.root_alpha)); g.addColorStop(0.3,A.rgb(ink,(P.root_alpha+P.tip_alpha)/2)); g.addColorStop(1,A.rgb(ink,P.tip_alpha)); return g; } });
export default make;
