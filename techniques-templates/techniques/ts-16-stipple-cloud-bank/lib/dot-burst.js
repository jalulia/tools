/* dot-burst · Burst tone field — TS-16 Stipple bank and dot burst · Techniques & Templates · ø co.
   Lifted from techniques/ts-16-stipple-cloud-bank/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Over ~60 rays, or a root width above ~140 u, the rays merge into a disc. core_radius at 0 leaves the rays unjoined. */
export const id="dot-burst", name="Burst tone field", code="TS-16", entry="ts-16-stipple-cloud-bank";
export const atoms=["radial","taper","falloff"];
export const spec={
  "id": "dot-burst",
  "short": "RAYS",
  "name": "Burst tone field",
  "layer": 2,
  "pass": 3,
  "atoms": [
    "radial",
    "taper",
    "falloff"
  ],
  "params": {
    "center": {
      "x": {
        "value": 480,
        "range": [
          0,
          1000
        ],
        "unit": "u"
      },
      "y": {
        "value": 760,
        "range": [
          0,
          1200
        ],
        "unit": "u"
      }
    },
    "rays": {
      "value": 26,
      "range": [
        6,
        60
      ],
      "step": 1
    },
    "fan_deg": [
      -200,
      20
    ],
    "jitter": {
      "value": 0.7,
      "range": [
        0,
        1
      ]
    },
    "length_u": {
      "value": 560,
      "range": [
        200,
        900
      ],
      "unit": "u"
    },
    "length_var": {
      "value": 0.3,
      "range": [
        0,
        0.6
      ]
    },
    "root_width_u": {
      "value": 46,
      "range": [
        6,
        140
      ],
      "unit": "u"
    },
    "taper": {
      "value": 0.8,
      "range": [
        0.2,
        3
      ]
    },
    "core_radius_u": {
      "value": 250,
      "range": [
        0,
        500
      ],
      "unit": "u"
    },
    "ray_floor": {
      "value": 0.35,
      "range": [
        0,
        1
      ],
      "note": "tone kept near the tip before the fade"
    },
    "turn_deg": {
      "value": 0,
      "range": [
        -180,
        180
      ],
      "unit": "°"
    },
    "gain": {
      "value": 1,
      "range": [
        0,
        1.5
      ]
    },
    "seed": {
      "value": 77,
      "range": [
        1,
        9999
      ],
      "step": 1
    }
  },
  "limits": "Over ~60 rays, or a root width above ~140 u, the rays merge into a disc. core_radius at 0 leaves the rays unjoined.",
  "implementation": "Tone is the larger of a soft core disc and the nearest ray. A ray is a gaussian across its axis whose width tapers to the tip."
};
export const params={
  "center": {
    "x": 480,
    "y": 760
  },
  "rays": 26,
  "fan_deg": [
    -200,
    20
  ],
  "jitter": 0.7,
  "length_u": 560,
  "length_var": 0.3,
  "root_width_u": 46,
  "taper": 0.8,
  "core_radius_u": 250,
  "ray_floor": 0.35,
  "turn_deg": 0,
  "gain": 1,
  "seed": 77
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,u,A)=>{ const r=A.rng(P.seed); const N=P.rays, a0=P.fan_deg[0]*Math.PI/180, a1=P.fan_deg[1]*Math.PI/180, mid=(a0+a1)/2; const rays=[]; for(let k=0;k<N;k++)rays.push({ a:a0+(a1-a0)*(k+0.5+(r()-0.5)*P.jitter)/N, L:P.length_u*u*(1+(r()*2-1)*P.length_var), w:P.root_width_u*u*(0.7+0.6*r()) });
      const cx=P.center.x*u, cy=P.center.y*u, Rc=P.core_radius_u*u, turn0=P.turn_deg*Math.PI/180;
      return { density:(x,y,turn,grow)=>{ const dx=x-cx, dy=y-cy; const d=Math.sqrt(dx*dx+dy*dy); let D=Rc>0?A.sstep(Rc*1.15,Rc*0.55,d):0; let th=Math.atan2(dy,dx)-turn0-(turn||0); th-=6.2832*Math.round((th-mid)/6.2832);
          const i0=Math.round((th-a0)/(a1-a0)*N-0.5); for(let k=i0-1;k<=i0+1;k++){ if(k<0||k>=N)continue; const ry=rays[k]; const da=th-ry.a; const t=d*Math.cos(da)/(ry.L*(grow||1)); if(t<=0||t>=1)continue; const off=d*Math.sin(da); const w=ry.w*0.5*Math.pow(1-t,P.taper)+0.6*u; const v=Math.exp(-(off*off)/(w*w))*A.sstep(1,0.78,t)*(P.ray_floor+(1-P.ray_floor)*(1-t)); if(v>D)D=v; }
          D*=P.gain; return D>1?1:D; } }; };
export default make;
