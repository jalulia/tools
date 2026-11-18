/* face-decals · Eyes, look and mouth — TS-23 Mir, turned · Techniques & Templates · ø co.
   Lifted from techniques/ts-23-mir-turned/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: The glint offset is held to 0.85 of the eye radius and drawn only inside the eye. Both eyes shift together, as little as possible from where the look puts them, so that each stays at least one line width clear of the head’s outline and of a front can; if no shift fits, the eyes shrink by up to 28%. */
export const id="face-decals", name="Eyes, look and mouth", code="TS-23", entry="ts-23-mir-turned";
export const atoms=["decal","gaze","glint"];
export const spec={
  "id": "face-decals",
  "short": "FACE",
  "name": "Eyes, look and mouth",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "decal",
    "gaze",
    "glint"
  ],
  "params": {
    "look_across_deg": {
      "value": 20,
      "range": [
        -40,
        40
      ],
      "step": 1,
      "unit": "°",
      "label": "Look across",
      "note": "Gaze left (−) or right (+) of where the head points. Moves the glint and shifts the eyes on the sphere."
    },
    "look_up_deg": {
      "value": 30,
      "range": [
        -20,
        45
      ],
      "step": 1,
      "unit": "°",
      "label": "Look up",
      "note": "Gaze up (+) or down (−). The glint bites the top of the eye when Mir looks up."
    },
    "eye_lon_deg": 20,
    "eye_lat_deg": -13.6,
    "eye_r": [
      0.25,
      0.28
    ],
    "glint_r": 0.12,
    "glint_k": 1.4,
    "glint_max": 0.85,
    "shift": 0.08,
    "limb": 0.33,
    "clear": 1,
    "mouth_lat_deg": -35,
    "mouth": [
      0.11,
      0.13
    ]
  },
  "limits": "The glint offset is held to 0.85 of the eye radius and drawn only inside the eye. Both eyes shift together, as little as possible from where the look puts them, so that each stays at least one line width clear of the head’s outline and of a front can; if no shift fits, the eyes shrink by up to 28%.",
  "implementation": "Eyes and mouth are shapes in the tangent plane at a point of the sphere, pushed back onto it. The glint offset is 1.4 × (sin across · cos up, sin up) of the eye radius, eased to at most 0.85."
};
export const params={
  "look_across_deg": 20,
  "look_up_deg": 30,
  "eye_lon_deg": 20,
  "eye_lat_deg": -13.6,
  "eye_r": [
    0.25,
    0.28
  ],
  "glint_r": 0.12,
  "glint_k": 1.4,
  "glint_max": 0.85,
  "shift": 0.08,
  "limb": 0.33,
  "clear": 1,
  "mouth_lat_deg": -35,
  "mouth": [
    0.11,
    0.13
  ]
};
export const A={};

export const make=(P,u,A)=>({ build:(hd,opt)=>{ const D=Math.PI/180, ax=P.look_across_deg*D, up=P.look_up_deg*D;
        const nrm=p=>{ const l=Math.hypot(p[0],p[1],p[2]); return [p[0]/l,p[1]/l,p[2]/l]; };
        const decal=c=>{ const eu=nrm([c[2],0,-c[0]]), ev=[c[1]*eu[2]-c[2]*eu[1], c[2]*eu[0]-c[0]*eu[2], c[0]*eu[1]-c[1]*eu[0]]; return (s,t)=>nrm([c[0]+s*eu[0]+t*ev[0], c[1]+s*eu[1]+t*ev[1], c[2]+s*eu[2]+t*ev[2]]); };
        let qx=P.glint_k*Math.sin(ax)*Math.cos(up), qy=P.glint_k*Math.sin(up); const ql=Math.hypot(qx,qy); if(ql>1e-6){ const k=1/Math.pow(1+Math.pow(ql/P.glint_max,6),1/6); qx*=k; qy*=k; }
        const ks=(opt&&opt.k)||1, ex=P.eye_r[0]*ks, ey=P.eye_r[1]*ks, hr=P.glint_r*ks, N=72;
        const eye=(lam,phi)=>{ const c=hd.at(lam,phi), f=decal(c), loop=[], hl=[]; let mz=1;
          for(let i=0;i<N;i++){ const t=2*Math.PI*i/N, p=f(ex*Math.cos(t), ey*Math.sin(t)); loop.push(p); mz=Math.min(mz,hd.toW(p)[2]); hl.push(f(qx*ex+hr*Math.cos(t), qy*ey+hr*Math.sin(t))); }
          return { c, loop, hl, g:f(qx*ex, qy*ey), mz }; };
        /* both eyes shift together (the look, then whatever keeps the far eye off the limb), so the gap between them never closes */
        const phi=P.eye_lat_deg*D+P.shift*0.6*up, el=P.eye_lon_deg*D, pair=sh=>[eye(-el+sh,phi),eye(el+sh,phi)], ok=e=>Math.min(e[0].mz,e[1].mz)>=P.limb;
        let sh=P.shift*ax, eyes=pair(opt&&opt.sh!==undefined?opt.sh:sh); if(!(opt&&opt.sh!==undefined)&&!ok(eyes)){ const c=-Math.atan2(hd.rot[1],hd.rot[0]); let lo=sh, hi=c; if(ok(pair(hi))){ for(let k=0;k<14;k++){ const mid=(lo+hi)/2; if(ok(pair(mid)))hi=mid; else lo=mid; } } eyes=pair(hi); }
        const cm=hd.at(0,P.mouth_lat_deg*D), fm=decal(cm), mouth=[];
        for(let i=0;i<=28;i++){ const t=Math.PI*i/28; mouth.push(fm(P.mouth[0]*Math.cos(t), -P.mouth[1]*Math.sin(t))); }
        return { eyes, mouth, mc:cm, sh }; } });
export default make;
