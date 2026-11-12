/* capsule-helix · Capsule helix — TS-22 Capsule system · Techniques & Templates · ø co.
   Lifted from techniques/ts-22-capsule-rain/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Over ~90 rungs the capsules touch and the helix reads as a ribbon. Under one turn there is no crossing and it reads as a lens. */
export const id="capsule-helix", name="Capsule helix", code="TS-22", entry="ts-22-capsule-rain";
export const atoms=["helix","sine","depth-cue"];
export const spec={
  "id": "capsule-helix",
  "short": "HELX",
  "name": "Capsule helix",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "helix",
    "sine",
    "depth-cue"
  ],
  "params": {
    "rungs": {
      "value": 46,
      "range": [
        8,
        90
      ],
      "step": 1
    },
    "turns": {
      "value": 2.5,
      "range": [
        0.5,
        6
      ]
    },
    "amplitude": {
      "value": 0.92,
      "range": [
        0.2,
        1
      ],
      "note": "share of the band height"
    },
    "width_u": {
      "value": 6,
      "range": [
        2,
        14
      ],
      "unit": "u"
    },
    "node_u": {
      "value": 5,
      "range": [
        0,
        12
      ],
      "unit": "u",
      "note": "diameter of the strand dots at mid depth"
    },
    "phase": {
      "value": 0,
      "range": [
        0,
        1
      ],
      "note": "turns the helix; Motion runs it"
    },
    "strand_ink": 3
  },
  "limits": "Over ~90 rungs the capsules touch and the helix reads as a ribbon. Under one turn there is no crossing and it reads as a lens.",
  "implementation": "Each rung is a vertical capsule whose length is 2 × amplitude × |sin φ|. Two dots sit at its ends; the near strand’s dot is 45 % larger and the far one 45 % smaller."
};
export const params={
  "rungs": 46,
  "turns": 2.5,
  "amplitude": 0.92,
  "width_u": 6,
  "node_u": 5,
  "phase": 0,
  "strand_ink": 3
};
export const A={};

export const make=(P,u,A)=>({ rungs:(R,inks)=>{ const out=[]; const n=P.rungs, amp=R.h*0.5*P.amplitude, cy=R.y+R.h/2, d=P.node_u*u; for(let k=0;k<n;k++){ const t=(k+0.5)/n; const X=R.x+R.w*t; const ph=6.2832*(P.turns*t+P.phase); const s=Math.sin(ph), z=Math.cos(ph);
          out.push({ i:inks.pick(t,0.5), x:X, y:cy, w:P.width_u*u*(0.7+0.3*Math.abs(z)), len:Math.max(P.width_u*u,Math.abs(s)*amp*2), a:0 });
          if(d>0){ out.push({ i:P.strand_ink, x:X, y:cy+s*amp, w:d*(1+0.45*z), len:d*(1+0.45*z), a:0 }); out.push({ i:P.strand_ink, x:X, y:cy-s*amp, w:d*(1-0.45*z), len:d*(1-0.45*z), a:0 }); } }
        return out; } });
export default make;
