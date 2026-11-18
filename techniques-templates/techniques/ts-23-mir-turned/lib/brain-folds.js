/* brain-folds · Dome and brain folds — TS-23 Mir, turned · Techniques & Templates · ø co.
   Lifted from techniques/ts-23-mir-turned/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Four rows is the most that stay apart at the heaviest line; one row reads as a hat brim, not a brain. Every fold keeps one stroke width clear of the outline, the band, the front cans and antennas, and every other fold; pieces shorter than 2.5 widths after that cut are dropped. With a heavy line the fold stroke thins, to 0.42 at most, until at least as many strokes as rows fit; pieces shorter than 0.16 R are dropped. */
export const id="brain-folds", name="Dome and brain folds", code="TS-23", entry="ts-23-mir-turned";
export const atoms=["scallop","latitude-rows","sphere-curve"];
export const spec={
  "id": "brain-folds",
  "short": "FOLD",
  "name": "Dome and brain folds",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "scallop",
    "latitude-rows",
    "sphere-curve"
  ],
  "params": {
    "rows": {
      "value": 3,
      "range": [
        2,
        4
      ],
      "step": 1,
      "label": "Fold rows",
      "note": "Rows of folds between the band and 80° latitude; each row is cut into long wavy strokes with a hook at one end."
    },
    "seed": 23,
    "top_lat_deg": 80,
    "margin": 0.06,
    "amp": 0.075,
    "bump": 0.28,
    "arc": 0.8,
    "gap": 0.18,
    "drift": 0.4,
    "hook": 0.055,
    "clear": 1,
    "min_len": 2.5
  },
  "limits": "Four rows is the most that stay apart at the heaviest line; one row reads as a hat brim, not a brain. Every fold keeps one stroke width clear of the outline, the band, the front cans and antennas, and every other fold; pieces shorter than 2.5 widths after that cut are dropped. With a heavy line the fold stroke thins, to 0.42 at most, until at least as many strokes as rows fit; pieces shorter than 0.16 R are dropped.",
  "implementation": "Each fold is a curve on the sphere: latitude rises in √sin humps 0.075 R high every 0.28 R of arc and drifts by up to 0.4 of a row; one end curls down and back through 112° on a 0.055 R radius. Only the part facing the viewer and clear of the outline is drawn."
};
export const params={
  "rows": 3,
  "seed": 23,
  "top_lat_deg": 80,
  "margin": 0.06,
  "amp": 0.075,
  "bump": 0.28,
  "arc": 0.8,
  "gap": 0.18,
  "drift": 0.4,
  "hook": 0.055,
  "clear": 1,
  "min_len": 2.5
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>({ build:hd=>{ const b0=Math.asin(hd.sinB)+P.margin, top=P.top_lat_deg*Math.PI/180, n=P.rows, sp=(top-b0)/n, amp=Math.min(P.amp,0.25*sp), hr=Math.min(P.hook,0.35*sp), out=[];
        for(let i=0;i<n;i++){ const r=A.rng(P.seed+i*7919), phi=b0+sp*(i+0.5), cp=Math.cos(phi); let lam=-Math.PI+r()*0.9;
          while(lam<Math.PI-0.1){ const dl=Math.min(P.arc*(0.7+0.6*r())/cp, Math.PI-lam), al=dl*cp, k=Math.max(1,Math.round(al/P.bump)), m=Math.max(18,k*16), sl=(r()-0.5)*P.drift*sp, ph0=r()*6.28, hk=r()<0.5, pts=[];
            for(let j=0;j<=m;j++){ const t=j/m, f=k*t-Math.floor(k*t), hump=j===m?0:Math.sqrt(Math.sin(Math.PI*f)); pts.push([lam+dl*t, phi+sl*Math.sin(Math.PI*(t-0.5)+0.6*Math.sin(ph0))+amp*hump]); }
            /* one end curls down and back */
            const e=hk?pts[pts.length-1]:pts[0], dir=hk?1:-1, curl=[]; for(let j=1;j<=9;j++){ const th=j/9*1.95; curl.push([e[0]+dir*hr*Math.sin(th)/cp, e[1]-hr*(1-Math.cos(th))]); }
            out.push((hk?pts.concat(curl):curl.reverse().concat(pts)).map(q=>hd.at(q[0],q[1]))); lam+=dl+P.gap*(0.7+0.6*r())/cp; } }
        return out; } });
export default make;
