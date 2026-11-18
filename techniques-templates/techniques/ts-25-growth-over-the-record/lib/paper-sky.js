/* paper-sky · Paper sky — TS-25 Growth over the record · Techniques & Templates · ø co.
   Lifted from techniques/ts-25-growth-over-the-record/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A,V) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Above about 3 % the sky grain reads as dirt next to the hazed hills. */
export const id="paper-sky", name="Paper sky", code="TS-25", entry="ts-25-growth-over-the-record";
export const atoms=["ground","grain","stock"];
export const spec={
  "id": "paper-sky",
  "short": "SKY",
  "name": "Paper sky",
  "layer": 0,
  "pass": 0,
  "atoms": [
    "ground",
    "grain",
    "stock"
  ],
  "params": {
    "grain_amp": 0.012,
    "seed": 251
  },
  "limits": "Above about 3 % the sky grain reads as dirt next to the hazed hills.",
  "implementation": "Paper multiplied by 1 + 0.012 × a signed hash per device pixel, so the sky is never a flat fill."
};
export const params={
  "grain_amp": 0.012,
  "seed": 251
};
export const A={};
A.hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
export const make=(P,u,A,V)=>{ const k=A.hex(V.sky); return { k, amp:P.grain_amp, seed:P.seed }; };
export default make;
