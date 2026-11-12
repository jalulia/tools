/* capsule-icons · Capsule icons — TS-22 Capsule system · Techniques & Templates · ø co.
   Lifted from techniques/ts-22-capsule-rain/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: stroke above ~10 u closes the gaps in the sun and the helix. */
export const id="capsule-icons", name="Capsule icons", code="TS-22", entry="ts-22-capsule-rain";
export const atoms=["icon","round-cap","stroke"];
export const spec={
  "id": "capsule-icons",
  "short": "ICON",
  "name": "Capsule icons",
  "layer": 4,
  "pass": 4,
  "atoms": [
    "icon",
    "round-cap",
    "stroke"
  ],
  "params": {
    "scale": {
      "value": 0.62,
      "range": [
        0.3,
        0.9
      ],
      "note": "icon size as a share of its cell"
    },
    "stroke_u": {
      "value": 7,
      "range": [
        2,
        12
      ],
      "unit": "u"
    },
    "set": "arrow · plus · menu · signal · pause · check · sun · helix"
  },
  "limits": "stroke above ~10 u closes the gaps in the sun and the helix.",
  "implementation": "Each icon is two to eight straight round-cap strokes on a 2 × 2 unit square; the last stroke takes an ink."
};
export const params={
  "scale": 0.62,
  "stroke_u": 7,
  "set": "arrow · plus · menu · signal · pause · check · sun · helix"
};
export const A={};

export const make=(P,u,A)=>({ draw:(x,R,V)=>{ const cols=4, cell=R.w/cols, s=cell*0.5*P.scale; x.save(); x.lineCap='round'; x.lineWidth=P.stroke_u*u;
        const I=[ [[-0.6,0.6,0.6,-0.6],[0.6,-0.6,-0.15,-0.6],[0.6,-0.6,0.6,0.15]], [[-0.7,0,0.7,0],[0,-0.7,0,0.7]], [[-0.7,-0.5,0.7,-0.5],[-0.7,0,0.7,0],[-0.7,0.5,0.25,0.5]], [[-0.6,0.7,-0.6,0.35],[-0.2,0.7,-0.2,0],[0.2,0.7,0.2,-0.35],[0.6,0.7,0.6,-0.7]],
          [[-0.35,-0.6,-0.35,0.6],[0.35,-0.6,0.35,0.6]], [[-0.7,0.05,-0.2,0.55],[-0.2,0.55,0.7,-0.5]], 'sun', [[-0.7,-0.7,-0.7,0.7],[-0.35,-0.3,-0.35,0.3],[0.35,-0.3,0.35,0.3],[0.7,-0.7,0.7,0.7],[0,-0.02,0,0.02]] ];
        I.forEach((ic,k)=>{ const cx=R.x+cell*(k%cols+0.5), cy=R.y+cell*(Math.floor(k/cols)+0.5); let segs=ic; if(ic==='sun'){ segs=[]; for(let j=0;j<8;j++){ const a=j*Math.PI/4-Math.PI/2; segs.push([Math.cos(a)*0.42,Math.sin(a)*0.42,Math.cos(a)*0.8,Math.sin(a)*0.8]); } }
          segs.forEach((g,j)=>{ const acc=V.inks[k%V.inks.length]; x.strokeStyle=j===segs.length-1&&acc!==V.sheet?acc:V.ink; x.beginPath(); x.moveTo(cx+g[0]*s,cy+g[1]*s); x.lineTo(cx+g[2]*s,cy+g[3]*s); x.stroke(); }); });
        x.restore(); } });
export default make;
