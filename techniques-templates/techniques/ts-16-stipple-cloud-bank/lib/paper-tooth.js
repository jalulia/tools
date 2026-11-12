/* paper-tooth · Weave and grain — TS-16 Stipple bank and dot burst · Techniques & Templates · ø co.
   Lifted from techniques/ts-16-stipple-cloud-bank/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Above ~0.08 either one competes with the dots. */
export const id="paper-tooth", name="Weave and grain", code="TS-16", entry="ts-16-stipple-cloud-bank";
export const atoms=["grain","stock","weave"];
export const spec={
  "id": "paper-tooth",
  "short": "TOOTH",
  "name": "Weave and grain",
  "layer": 3,
  "pass": 4,
  "atoms": [
    "grain",
    "stock",
    "weave"
  ],
  "params": {
    "amp": {
      "value": 0.03,
      "range": [
        0,
        0.12
      ]
    },
    "weave": {
      "value": 0.025,
      "range": [
        0,
        0.12
      ]
    },
    "weave_u": {
      "value": 3,
      "range": [
        2,
        12
      ],
      "unit": "u"
    },
    "seed": {
      "value": 5,
      "range": [
        1,
        9999
      ],
      "step": 1
    }
  },
  "limits": "Above ~0.08 either one competes with the dots.",
  "implementation": "Each pixel is multiplied by 1 + grain + weave, where weave is the product of two sine waves at the weave pitch."
};
export const params={
  "amp": 0.03,
  "weave": 0.025,
  "weave_u": 3,
  "seed": 5
};
export const A={};

export const make=(P,u,A)=>({ apply:ctx=>{ if(P.amp<=0&&P.weave<=0)return; const c=ctx.canvas, W=c.width, H=c.height; const id=ctx.getImageData(0,0,W,H), d=id.data; const p=Math.max(2,P.weave_u*u); const sx=new Float32Array(W), sy=new Float32Array(H); for(let i=0;i<W;i++)sx[i]=Math.sin(6.2832*i/p); for(let j=0;j<H;j++)sy[j]=Math.sin(6.2832*j/p);
        let s=P.seed|0; for(let j=0;j<H;j++){ const wy=sy[j]*P.weave; for(let i=0;i<W;i++){ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; const m=1+P.amp*(((t^t>>>14)>>>0)/2147483648-1)+sx[i]*wy; const o=(j*W+i)*4; d[o]*=m; d[o+1]*=m; d[o+2]*=m; } }
        ctx.putImageData(id,0,0); } });
export default make;
