/* gradient-map · Gradient map — TS-10 Thermal blob field · Techniques & Templates · ø co.
   Lifted from techniques/ts-10-thermal-blob-field/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: The ramp is read at 256 levels; contrast above ~2 leaves fewer than 6 levels across the rim and it stair-steps. A shift past ±0.15 moves the paper stop into the blobs or the core out of range. */
export const id="gradient-map", name="Gradient map", code="TS-10", entry="ts-10-thermal-blob-field";
export const atoms=["lut","gradient-map"];
export const spec={
  "id": "gradient-map",
  "short": "RAMP",
  "name": "Gradient map",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "lut",
    "gradient-map"
  ],
  "params": {
    "lut": "256 entries",
    "stops_ref": "0.28 paper · 0.37 blue · 0.41 (53,80,126) · 0.44–0.48 navy · 0.53 plum · 0.64 red · 0.70 orange · 0.82 (245,140,30) · 1.0 yellow",
    "measured_edge_px": "paper→blue 12 · blue→navy 12 · navy 20 · plum→red 25 · red→orange 15 (at 1200 px)",
    "shift": {
      "value": 0,
      "range": [
        -0.2,
        0.2
      ],
      "note": "slides the field under the ramp"
    },
    "contrast": {
      "value": 1,
      "range": [
        0.5,
        2.5
      ],
      "note": "scales the field around 0.5 before the ramp"
    }
  },
  "limits": "The ramp is read at 256 levels; contrast above ~2 leaves fewer than 6 levels across the rim and it stair-steps. A shift past ±0.15 moves the paper stop into the blobs or the core out of range.",
  "implementation": "Every pixel of the field is replaced by LUT[field]; the ramp is the only place color enters, so all four colourways share one field."
};
export const params={
  "lut": "256 entries",
  "stops_ref": "0.28 paper · 0.37 blue · 0.41 (53,80,126) · 0.44–0.48 navy · 0.53 plum · 0.64 red · 0.70 orange · 0.82 (245,140,30) · 1.0 yellow",
  "measured_edge_px": "paper→blue 12 · blue→navy 12 · navy 20 · plum→red 25 · red→orange 15 (at 1200 px)",
  "shift": 0,
  "contrast": 1
};
export const A={};
A.lut=stops=>{ const L=new Array(256); for(let i=0;i<256;i++){ const t=i/255; let c=A.hex(stops[stops.length-1][1]); for(let k=1;k<stops.length;k++){ if(t<=stops[k][0]){ const u=(t-stops[k-1][0])/((stops[k][0]-stops[k-1][0])||1e-6); c=A.mix(A.hex(stops[k-1][1]),A.hex(stops[k][1]),A.clamp(u,0,1)); break; } } L[i]=c; } return L; };
A.hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
A.mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
A.gradientMap=(ctx,L)=>{ const c=ctx.canvas; const id=ctx.getImageData(0,0,c.width,c.height); const d=id.data; for(let i=0;i<d.length;i+=4){ const l=(d[i]*0.2126+d[i+1]*0.7152+d[i+2]*0.0722); const k=L[A.clamp(l,0,255)|0]; d[i]=k[0]; d[i+1]=k[1]; d[i+2]=k[2]; d[i+3]=255; } ctx.putImageData(id,0,0); };
export const make=(P,u,A)=>({ lut:stops=>{ const L=A.lut(stops); if(P.shift===0&&P.contrast===1)return L;
        const M=new Array(256); for(let i=0;i<256;i++){ const t=(i/255-0.5)*P.contrast+0.5+P.shift; M[i]=L[A.clamp(Math.round(t*255),0,255)]; } return M; },
      apply:(x,L)=>A.gradientMap(x,L) });
export default make;
