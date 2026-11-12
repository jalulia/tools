/* fine-stipple · One-pixel stipple — TS-22 Capsule system · Techniques & Templates · ø co.
   Lifted from techniques/ts-22-capsule-rain/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: edge above ~1.5 u dissolves the smallest capsules. density under ~0.5 reads as a tint, not as ink. */
export const id="fine-stipple", name="One-pixel stipple", code="TS-22", entry="ts-22-capsule-rain";
export const atoms=["stochastic-screen","grain","coverage"];
export const spec={
  "id": "fine-stipple",
  "short": "STIP",
  "name": "One-pixel stipple",
  "layer": 3,
  "pass": 3,
  "atoms": [
    "stochastic-screen",
    "grain",
    "coverage"
  ],
  "params": {
    "density": {
      "value": 0.97,
      "range": [
        0.3,
        1
      ],
      "note": "share of pixels on at full coverage"
    },
    "fade": {
      "value": 0.42,
      "range": [
        0,
        1
      ],
      "note": "coverage lost from the head of a capsule to its tail"
    },
    "edge_u": {
      "value": 0.4,
      "range": [
        0,
        3
      ],
      "unit": "u",
      "note": "blur of the coverage before the threshold; it dissolves the capsule edge"
    },
    "all": {
      "value": 0,
      "range": [
        0,
        1
      ],
      "step": 1,
      "note": "1 = stipple every field in every variant"
    },
    "seed": {
      "value": 17,
      "range": [
        1,
        9999
      ],
      "step": 1
    }
  },
  "limits": "edge above ~1.5 u dissolves the smallest capsules. density under ~0.5 reads as a tint, not as ink.",
  "implementation": "Capsules are drawn into a coverage layer per ink. Each pixel of the layer is then set fully on or off: on when a random number is under coverage × density."
};
export const params={
  "density": 0.97,
  "fade": 0.42,
  "edge_u": 0.4,
  "all": 0,
  "seed": 17
};
export const A={};
A.hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
export const make=(P,u,A)=>({ fade:P.fade, edge:P.edge_u*u, all:P.all>0.5, apply:(layer,color,salt)=>{ const x=layer.getContext('2d'); const id=x.getImageData(0,0,layer.width,layer.height), d=id.data; const k=A.hex(color); let s=(P.seed+salt)|0;
        for(let o=0;o<d.length;o+=4){ const a=d[o+3]; if(a===0)continue; s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; if(((t^t>>>14)>>>0)/4294967296<a/255*P.density){ d[o]=k[0]; d[o+1]=k[1]; d[o+2]=k[2]; d[o+3]=255; } else d[o+3]=0; }
        x.putImageData(id,0,0); } });
export default make;
