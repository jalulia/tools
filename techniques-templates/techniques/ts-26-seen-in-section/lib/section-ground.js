/* section-ground · Rendering and sky — TS-26 Seen in section · Techniques & Templates · ø co.
   Lifted from techniques/ts-26-seen-in-section/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A,V) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: At night the hills, the water and the garden darken toward night blue while the cut face stays lit, so the section still reads. The gouache grain is fixed at 3 % mono; above ~4 % it shows as dirt on the flat sky. The line section has no grain. */
export const id="section-ground", name="Rendering and sky", code="TS-26", entry="ts-26-seen-in-section";
export const atoms=["ground","rendering","grain"];
export const spec={
  "id": "section-ground",
  "short": "SKY",
  "name": "Rendering and sky",
  "layer": 0,
  "pass": 0,
  "atoms": [
    "ground",
    "rendering",
    "grain"
  ],
  "params": {
    "rendering": {
      "value": 1,
      "options": [
        {
          "v": 1,
          "label": "Gouache"
        },
        {
          "v": 2,
          "label": "Line section"
        }
      ],
      "label": "Rendering",
      "note": "Painted section, or a technical section with hatching and hairlines"
    },
    "sky": {
      "value": 1,
      "options": [
        {
          "v": 1,
          "label": "Day"
        },
        {
          "v": 2,
          "label": "Night"
        }
      ],
      "label": "Sky",
      "note": "Day leaves the sky blank Paper as in the deck; Night turns it to Ink"
    },
    "grain_amp": 0.03,
    "grain_seed": 26
  },
  "limits": "At night the hills, the water and the garden darken toward night blue while the cut face stays lit, so the section still reads. The gouache grain is fixed at 3 % mono; above ~4 % it shows as dirt on the flat sky. The line section has no grain.",
  "implementation": "The ground is one flat color behind everything. Gouache paints each region per pixel and adds a 3 % one-pixel grain; at night it mixes the hills (66 %), the water (42 %), the trees (45 %) and the grass (52 %) toward night blue. The line section draws contacts, hatching and symbols as hairlines on the same geometry, light on the night sky."
};
export const params={
  "rendering": 1,
  "sky": 1,
  "grain_amp": 0.03,
  "grain_seed": 26
};
export const A={};
A.mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
A.hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
A.rgb=(v,a)=>`rgba(${v[0]|0},${v[1]|0},${v[2]|0},${a===undefined?1:a})`;
export const make=(P,u,A,V)=>{ const dark=P.sky===2; const gnd=dark?V.ink:V.paper; const line=dark?V.paper:V.line; const lw=A.mix(A.hex(V.lineWater),A.hex(dark?V.paper:V.lineWater),dark?0.55:0);
      return { line:P.rendering===2, dark, ground:gnd, ink:line, inkWater:A.rgb(lw),
        /* one-pixel mono grain from a running xorshift: every pixel its own value, nothing tiles */
        finish:ctx=>{ if(P.rendering===2||!(P.grain_amp>0))return; const c=ctx.canvas, id=ctx.getImageData(0,0,c.width,c.height), d=id.data; let s=(P.grain_seed*2654435761)|0||1; const amp=P.grain_amp*2;
          for(let i=0;i<d.length;i+=4){ if(d[i+3]===0)continue; s^=s<<13; s^=s>>>17; s^=s<<5; const m=1+amp*((s>>>0)/4294967296-0.5); d[i]*=m; d[i+1]*=m; d[i+2]*=m; } ctx.putImageData(id,0,0); } }; };
export default make;
