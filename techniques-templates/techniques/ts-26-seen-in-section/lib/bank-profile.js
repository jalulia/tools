/* bank-profile · Ground line — TS-26 Seen in section · Techniques & Templates · ø co.
   Lifted from techniques/ts-26-seen-in-section/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Below ~22° the face runs under half the river and the toe leaves the plate’s left third; above ~72° the bank reads as a wall and the toe fillet folds. */
export const id="bank-profile", name="Ground line", code="TS-26", entry="ts-26-seen-in-section";
export const atoms=["profile","section","smooth-min"];
export const spec={
  "id": "bank-profile",
  "short": "BANK",
  "name": "Ground line",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "profile",
    "section",
    "smooth-min"
  ],
  "params": {
    "slope_deg": {
      "value": 48,
      "range": [
        22,
        72
      ],
      "unit": "°",
      "label": "Bank slope",
      "note": "Angle of the bank face from the riverbed up to the crest"
    },
    "crest_u": [
      480,
      286
    ],
    "bed_u": 402,
    "bed_rise": 0.00019,
    "upland_rise_u": 72,
    "toe_round_u": 18,
    "crest_round_u": 14,
    "profile": "S(x) = smin(riverbed, smax(face, upland)); face = crest_y + (crest_x − x)·tan(slope)"
  },
  "limits": "Below ~22° the face runs under half the river and the toe leaves the plate’s left third; above ~72° the bank reads as a wall and the toe fillet folds.",
  "implementation": "The riverbed, the bank face and the upland are three curves joined by a smooth minimum at the toe and a smooth maximum at the crest, so the section has one continuous ground line with rounded corners."
};
export const params={
  "slope_deg": 48,
  "crest_u": [
    480,
    286
  ],
  "bed_u": 402,
  "bed_rise": 0.00019,
  "upland_rise_u": 72,
  "toe_round_u": 18,
  "crest_round_u": 14,
  "profile": "S(x) = smin(riverbed, smax(face, upland)); face = crest_y + (crest_x − x)·tan(slope)"
};
export const A={};

export const make=(P,u,A)=>{ const tn=Math.tan(P.slope_deg*Math.PI/180), xc=P.crest_u[0], yc=P.crest_u[1], bed=P.bed_u, rise=P.upland_rise_u, kt=P.toe_round_u, kc=P.crest_round_u;
      const smin=(a,b,k)=>{ const h=Math.max(k-Math.abs(a-b),0)/k; return Math.min(a,b)-h*h*k*0.25; };
      const bedY=x=>{ const q=Math.min(x,520); return bed-P.bed_rise*q*q+1.4*Math.sin(x/37+0.7)+0.9*Math.sin(x/13.3+2.1); };
      const faceY=x=>yc+(xc-x)*tn;
      const upY=x=>{ if(x<=xc)return yc; const t=Math.min(1,(x-xc)/(1000-xc)); return yc-rise*t*t*(3-2*t); };
      const S=x=>smin(bedY(x),-smin(-faceY(x),-upY(x),kc),kt);
      let a=0,b=xc; for(let i=0;i<40;i++){ const m=(a+b)/2; if(faceY(m)>bedY(m))a=m; else b=m; }
      return { S, bedY, faceY, crest:[xc,yc], bed, toe:(a+b)/2, slope:P.slope_deg }; };
export default make;
