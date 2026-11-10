/* engraved-line · Swelling line screen — TS-15 Banknote engraving · Techniques & Templates · ø co.
   Lifted from techniques/ts-15-banknote-engraving/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Under ~2.5 device px of pitch the lines alias into tone. duty_max · weight at 1 closes the shadows to solid ink and the crosshatch has nothing to cross. */
export const id="engraved-line", name="Swelling line screen", code="TS-15", entry="ts-15-banknote-engraving";
export const atoms=["line-screen","width-modulation","dash"];
export const spec={
  "id": "engraved-line",
  "short": "LINE",
  "name": "Swelling line screen",
  "layer": 2,
  "pass": 3,
  "atoms": [
    "line-screen",
    "width-modulation",
    "dash"
  ],
  "params": {
    "pitch_u": {
      "value": 6,
      "range": [
        2,
        14
      ],
      "unit": "u",
      "note": "reference: 3.2 px on its own image; 6 u resolves at plate size"
    },
    "angle_deg": {
      "value": 0,
      "range": [
        -90,
        90
      ],
      "unit": "°"
    },
    "weight": {
      "value": 0.94,
      "range": [
        0.3,
        1.1
      ]
    },
    "duty_min": {
      "value": 0.06,
      "range": [
        0,
        0.3
      ]
    },
    "duty_max": {
      "value": 0.94,
      "range": [
        0.5,
        1
      ]
    },
    "gamma": {
      "value": 1.15,
      "range": [
        0.5,
        2.5
      ]
    },
    "paper_below": {
      "value": 0.04,
      "range": [
        0,
        0.3
      ],
      "note": "darkness under this prints nothing"
    },
    "dash_below": {
      "value": 0.22,
      "range": [
        0,
        0.6
      ]
    },
    "dash_len_pitches": {
      "value": 5,
      "range": [
        2,
        16
      ]
    },
    "width": "pitch · (duty_min + (duty_max·weight − duty_min) · darkness^gamma)"
  },
  "limits": "Under ~2.5 device px of pitch the lines alias into tone. duty_max · weight at 1 closes the shadows to solid ink and the crosshatch has nothing to cross.",
  "implementation": "Distance to the nearest line center is compared with half the tone-set width and antialiased over one device pixel. In the highlights each line is cut into dashes whose fill falls with darkness, with a hashed offset per line."
};
export const params={
  "pitch_u": 6,
  "angle_deg": 0,
  "weight": 0.94,
  "duty_min": 0.06,
  "duty_max": 0.94,
  "gamma": 1.15,
  "paper_below": 0.04,
  "dash_below": 0.22,
  "dash_len_pitches": 5,
  "width": "pitch · (duty_min + (duty_max·weight − duty_min) · darkness^gamma)"
};
export const A={};
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,u,A)=>{ const p=P.pitch_u*u, th=P.angle_deg*Math.PI/180, cs=Math.cos(th), sn=Math.sin(th); const lo=P.duty_min, hi=P.duty_max*P.weight, g=P.gamma, cut=P.paper_below, db=P.dash_below, dl=P.dash_len_pitches*p;
      return { p, cs, sn, cov:(s,t,dark)=>{ if(dark<=cut)return 0; const f=s-Math.floor(s); const d=Math.abs(f-0.5)*p; let c=0.5*p*(lo+(hi-lo)*Math.pow(dark,g))-d+0.5; if(c<=0)return 0; if(c>1)c=1; c*=A.sstep(cut,cut+0.05,dark);
        if(dark<db){ const hsh=Math.sin(Math.floor(s)*127.1)*43758.5453; let q=t*p/dl+hsh-Math.floor(hsh); q-=Math.floor(q); const fill=0.22+0.78*dark/db; c*=A.clamp((fill-q)*dl+0.5,0,1)*A.clamp(q*dl+0.5,0,1); }
        return c; } }; };
export default make;
