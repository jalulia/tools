/* stipple-fill · Jittered dot layer — TS-16 Stipple bank and dot burst · Techniques & Templates · ø co.
   Lifted from techniques/ts-16-stipple-cloud-bank/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: radius above ~0.45 × pitch merges dots into a tint. jitter 0 shows the grid as rows. Below 3.5 u pitch the layer costs over 100 k dots per sheet. */
export const id="stipple-fill", name="Jittered dot layer", code="TS-16", entry="ts-16-stipple-cloud-bank";
export const atoms=["stipple","jittered-grid","near-tone"];
export const spec={
  "id": "stipple-fill",
  "short": "STIP",
  "name": "Jittered dot layer",
  "layer": 2,
  "pass": 3,
  "atoms": [
    "stipple",
    "jittered-grid",
    "near-tone"
  ],
  "params": {
    "pitch_u": {
      "value": 6.4,
      "range": [
        3.5,
        16
      ],
      "unit": "u"
    },
    "radius_u": {
      "value": 1.5,
      "range": [
        0.6,
        3.5
      ],
      "unit": "u"
    },
    "jitter": {
      "value": 0.42,
      "range": [
        0,
        0.5
      ],
      "note": "share of the pitch"
    },
    "seed": {
      "value": 161,
      "range": [
        1,
        9999
      ],
      "step": 1
    },
    "tone": "one dot color per fill, close to the fill; the sky carries no dot layer"
  },
  "limits": "radius above ~0.45 × pitch merges dots into a tint. jitter 0 shows the grid as rows. Below 3.5 u pitch the layer costs over 100 k dots per sheet.",
  "implementation": "One dot per grid cell, moved by up to 0.42 of the pitch; the fill under the dot center picks the dot color."
};
export const params={
  "pitch_u": 6.4,
  "radius_u": 1.5,
  "jitter": 0.42,
  "seed": 161,
  "tone": "one dot color per fill, close to the fill; the sky carries no dot layer"
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>({ r:P.radius_u*u, each:(W,H,put)=>{ const r=A.rng(P.seed); const p=P.pitch_u*u; for(let y=p*0.5;y<H;y+=p)for(let X=p*0.5;X<W;X+=p)put(X+(r()*2-1)*P.jitter*p, y+(r()*2-1)*P.jitter*p, r()); } });
export default make;
