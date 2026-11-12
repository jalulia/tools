/* grain-wash · Wash from the tone field — TS-16 Stipple bank and dot burst · Techniques & Templates · ø co.
   Lifted from techniques/ts-16-stipple-cloud-bank/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: At amount 1 the wash hides the dots on light banks. grain at 0 gives a smooth gradient, which reads as blur beside the dots. */
export const id="grain-wash", name="Wash from the tone field", code="TS-16", entry="ts-16-stipple-cloud-bank";
export const atoms=["stochastic-gradient","clip","grain"];
export const spec={
  "id": "grain-wash",
  "short": "WASH",
  "name": "Wash from the tone field",
  "layer": 1,
  "pass": 2,
  "atoms": [
    "stochastic-gradient",
    "clip",
    "grain"
  ],
  "params": {
    "amount": {
      "value": 0.5,
      "range": [
        0,
        1
      ]
    },
    "grain": {
      "value": 1,
      "range": [
        0,
        1
      ],
      "note": "1 = single on/off pixels; 0 = a smooth gradient"
    },
    "res_div": {
      "value": 4,
      "range": [
        2,
        8
      ],
      "step": 1,
      "note": "the tone field is sampled at 1/res_div size"
    },
    "seed": {
      "value": 13,
      "range": [
        1,
        9999
      ],
      "step": 1
    }
  },
  "limits": "At amount 1 the wash hides the dots on light banks. grain at 0 gives a smooth gradient, which reads as blur beside the dots.",
  "implementation": "The tone field is sampled at quarter size. Each pixel of the bank takes the wash color with a chance equal to tone × amount, so the gradient is made of single pixels."
};
export const params={
  "amount": 0.5,
  "grain": 1,
  "res_div": 4,
  "seed": 13
};
export const A={};
A.off=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
A.hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
export const make=(P,u,A)=>({ amount:P.amount, layer:(W,H,color,tone)=>{ const q=P.res_div; const w=Math.ceil(W/q)+2, h=Math.ceil(H/q)+2; const F=new Float32Array(w*h); for(let j=0;j<h;j++)for(let i=0;i<w;i++)F[j*w+i]=P.amount*tone(i*q,j*q);
        const c=A.off(W,H), x=c.getContext('2d'); const id=x.createImageData(W,H), d=id.data; const k=A.hex(color); let s=P.seed|0; const g=P.grain;
        for(let y=0;y<H;y++){ const fy=y/q, j=fy|0, ty=fy-j; for(let X=0;X<W;X++){ const fx=X/q, i=fx|0, tx=fx-i; const o=j*w+i; const a=(F[o]*(1-tx)+F[o+1]*tx)*(1-ty)+(F[o+w]*(1-tx)+F[o+w+1]*tx)*ty;
            s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; const n=((t^t>>>14)>>>0)/4294967296; const p=(y*W+X)*4; d[p]=k[0]; d[p+1]=k[1]; d[p+2]=k[2]; d[p+3]=255*((1-g)*a+g*(n<a?1:0)); } }
        x.putImageData(id,0,0); return { canvas:c, w:W, h:H }; } });
export default make;
