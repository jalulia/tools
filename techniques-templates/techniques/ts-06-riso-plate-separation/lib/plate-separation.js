/* plate-separation · Three-plate coverage split — TS-06 Riso three-plate separation · Techniques & Templates · ø co.
   Lifted from techniques/ts-06-riso-plate-separation/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Keylines past ~8 u close the counters of the letters. The wash is one radial falloff from the lower-left corner; past radius 1.3 it covers the whole sheet and reads as a yellow stock. */
export const id="plate-separation", name="Three-plate coverage split", code="TS-06", entry="ts-06-riso-plate-separation";
export const atoms=["separation","multiply","coverage"];
export const spec={
  "id": "plate-separation",
  "short": "PLTE",
  "name": "Three-plate coverage split",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "separation",
    "multiply",
    "coverage"
  ],
  "params": {
    "yellow": "top faces + corner wash + marker strokes",
    "blue": "right faces + keylines",
    "pink": "left faces + keylines + marble",
    "keyline": "on all three plates",
    "keyline_u": {
      "value": 3.6,
      "range": [
        1,
        12
      ],
      "unit": "u"
    },
    "wash": {
      "gain": {
        "value": 0.92,
        "range": [
          0,
          1
        ],
        "note": "yellow corner wash at its center"
      },
      "radius_w": {
        "value": 0.9,
        "range": [
          0.2,
          1.6
        ],
        "note": "fraction of the sheet width"
      }
    },
    "composite": "multiply",
    "max_coverage": 1
  },
  "limits": "Keylines past ~8 u close the counters of the letters. The wash is one radial falloff from the lower-left corner; past radius 1.3 it covers the whole sheet and reads as a yellow stock.",
  "implementation": "Face labels become three coverage rasters; each raster is coloured mix(white, ink, coverage) on its own canvas and multiplied onto the stock in plate order."
};
export const params={
  "yellow": "top faces + corner wash + marker strokes",
  "blue": "right faces + keylines",
  "pink": "left faces + keylines + marble",
  "keyline": "on all three plates",
  "keyline_u": 3.6,
  "wash": {
    "gain": 0.92,
    "radius_w": 0.9
  },
  "composite": "multiply",
  "max_coverage": 1
};
export const A={};
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,u,A)=>({
      /* keyline mask: label changes, dilated to keyline_u */
      keyline:(lab,W,H)=>{ const N=W*H; const r=Math.max(1,Math.round(P.keyline_u/2*u)); const E=new Uint8Array(N);
        for(let Y=0;Y<H-1;Y++)for(let X=0;X<W-1;X++){ const i=Y*W+X; const a=lab[i]; if(a!==lab[i+1]||a!==lab[i+W]){ if(a||lab[i+1]||lab[i+W]) E[i]=1; } }
        const K=new Uint8Array(N); const tmp=new Uint8Array(N);
        for(let Y=0;Y<H;Y++){ let run=0; for(let X=0;X<W+r;X++){ if(X<W&&E[Y*W+X])run=2*r+1; if(run>0&&X-r>=0&&X-r<W)tmp[Y*W+X-r]=1; if(run>0)run--; } }
        for(let X=0;X<W;X++){ let run=0; for(let Y=0;Y<H+r;Y++){ if(Y<H&&tmp[Y*W+X])run=2*r+1; if(run>0&&Y-r>=0&&Y-r<H)K[(Y-r)*W+X]=1; if(run>0)run--; } }
        return K; },
      /* three coverage rasters [yellow, blue, pink] from the labels; marble(X,Y) cuts the pink top faces, SA is the yellow stroke alpha */
      coverage:(lab,K,SA,marble,W,H)=>{ const N=W*H; const cov=[new Float32Array(N),new Float32Array(N),new Float32Array(N)];
        const wx0=-0.05*W, wy0=1.05*H, wr=P.wash.radius_w*W;
        for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){ const i=Y*W+X; const t=lab[i]&3; const k=K[i];
          let y=0,b=0,p=0;
          if(t===1){ y=1; p=marble(X,Y); }
          else if(t===2){ b=1; } else if(t===3){ p=1; }
          if(k){ y=1; b=1; p=1; }
          if(!t){ const d=Math.hypot(X-wx0,Y-wy0); { const wv=A.sstep(1.0,0.12,d/wr); const ww=P.wash.gain*wv*wv; if(ww>0.03)y=Math.max(y,ww); } }
          y=Math.max(y,SA[i*4+3]/255);
          cov[0][i]=y; cov[1][i]=b; cov[2][i]=p; }
        return cov; },
      /* one pixel of a plate: mix(white, ink, coverage) */
      tint:(d,j,ink,cv)=>{ d[j]=255-(255-ink[0])*cv; d[j+1]=255-(255-ink[1])*cv; d[j+2]=255-(255-ink[2])*cv; d[j+3]=255; } });
export default make;
