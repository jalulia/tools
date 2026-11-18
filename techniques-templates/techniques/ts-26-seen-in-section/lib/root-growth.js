/* root-growth · Root growth — TS-26 Seen in section · Techniques & Templates · ø co.
   Lifted from techniques/ts-26-seen-in-section/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Five generations is the most that still reads as separate roots at plate size; one generation is a bare stick, so the range starts at two. Under ~20 % depth the system is only the crown. */
export const id="root-growth", name="Root growth", code="TS-26", entry="ts-26-seen-in-section";
export const atoms=["branching","tropism","taper"];
export const spec={
  "id": "root-growth",
  "short": "ROOT",
  "name": "Root growth",
  "layer": 3,
  "pass": 5,
  "atoms": [
    "branching",
    "tropism",
    "taper"
  ],
  "params": {
    "depth_pct": {
      "value": 60,
      "range": [
        20,
        100
      ],
      "unit": "%",
      "label": "Root depth",
      "note": "How far the roots reach toward the gravel; at 100 % the tips touch it"
    },
    "generations": {
      "value": 4,
      "range": [
        2,
        5
      ],
      "step": 1,
      "label": "Root branching",
      "note": "Generations of roots, from the main root to the finest forks"
    },
    "habit": {
      "value": 3,
      "options": [
        {
          "v": 1,
          "label": "Taproot"
        },
        {
          "v": 2,
          "label": "Fibrous"
        },
        {
          "v": 3,
          "label": "Mixed"
        }
      ],
      "label": "Root habit",
      "note": "One deep main root, a fan of fine roots, or a main root with crown roots"
    },
    "crowns_u": [
      612,
      655,
      728,
      856,
      944
    ],
    "step_u": 2.2,
    "fork_rate": [
      0.15,
      0.12,
      0.1,
      0.08
    ],
    "child_width": 0.6,
    "steps_per_crown": 2600,
    "trop_main": 0.16,
    "trop_lateral": 0.009,
    "wander_main": 0.13,
    "wander_lateral": 0.17,
    "min_soil_u": 7,
    "seed": 4
  },
  "limits": "Five generations is the most that still reads as separate roots at plate size; one generation is a bare stick, so the range starts at two. Under ~20 % depth the system is only the crown.",
  "implementation": "Each root walks in 2.2 u steps, turning toward straight down and wandering; it forks at a per-generation rate into children 0.62 × its width. It stops on the envelope ground + depth × (gravel top − ground), never above the soil line, never in the gravel and never under water."
};
export const params={
  "depth_pct": 60,
  "generations": 4,
  "habit": 3,
  "crowns_u": [
    612,
    655,
    728,
    856,
    944
  ],
  "step_u": 2.2,
  "fork_rate": [
    0.15,
    0.12,
    0.1,
    0.08
  ],
  "child_width": 0.6,
  "steps_per_crown": 2600,
  "trop_main": 0.16,
  "trop_lateral": 0.009,
  "wander_main": 0.13,
  "wander_lateral": 0.17,
  "min_soil_u": 7,
  "seed": 4
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>({ grow:G=>{ const r=A.rng(P.seed); const reach=P.depth_pct/100, gens=P.generations|0, habit=P.habit|0; const roots=[]; let budget=0; const PI2=Math.PI/2;
        const grow=(x,y,ang,len,w0,gen,trop,wand)=>{ const pts=[[x,y]]; let L=0, touch=false; const kids=[]; const step=P.step_u;
          while(L<len&&budget>0){ ang+=(PI2-ang)*trop+(r()-0.5)*wand; ang=Math.max(0.12,Math.min(Math.PI-0.12,ang)); let nx=x+Math.cos(ang)*step, ny=y+Math.sin(ang)*step;
            if(nx<2||nx>998)break; const s=G.S(nx), t=G.T(nx); if(t-s<P.min_soil_u||s>G.yw-1)break;
            if(ny<s+2.5){ ny=s+2.5; ang=(ang+PI2)/2; }
            const e=s+reach*(t-s); if(ny>=e){ if(e>y)pts.push([nx,e]); touch=reach>0.995; break; } if(G.gravel(nx,ny))break;
            L+=step; budget--; pts.push([nx,ny]); x=nx; y=ny;
            if(gen<gens-1&&L>5&&r()<P.fork_rate[Math.min(gen,P.fork_rate.length-1)]*(gen===0?1.5-Math.min(1,(ny-G.S(nx))/Math.max(20,e-G.S(nx))):1)){ const side=r()<0.5?-1:1, rem=(e-ny)*0.8+8; kids.push([pts.length-1,ang+side*(0.55+0.4*r()),rem*(0.42+0.4*r())*Math.pow(0.74,gen),gen+1]); } }
          const n=pts.length; const ws=pts.map((p,k)=>w0*(0.2+0.8*Math.pow(1-k/Math.max(1,n-1),0.85))); const R={pts,ws,gen,touch}; roots.push(R);
          for(const k of kids){ const p=pts[k[0]]; if(p&&k[2]>3)grow(p[0],p[1],k[1],k[2],ws[k[0]]*P.child_width,k[3],P.trop_lateral,P.wander_lateral); } return R; };
        const sizes=[0.72,0.9,1.08,1.18,0.95];
        const crowns=habit===2?P.crowns_u.flatMap((x,i)=>i<P.crowns_u.length-1?[[x,sizes[i]],[(x+P.crowns_u[i+1])/2+(r()-0.5)*10,0.8]]:[[x,sizes[i]]]):P.crowns_u.map((x,i)=>[x,sizes[i]]);
        for(const [x0,sz] of crowns){ budget=P.steps_per_crown; const s=G.S(x0), t=G.T(x0); if(s>G.yw-2||t-s<P.min_soil_u*2)continue; const y0=s+1.2, dep=Math.max(4,s+reach*(t-s)-y0);
          if(habit===1){ grow(x0,y0,PI2+(r()-0.5)*0.12,dep*2.2,4.8*sz,0,P.trop_main,P.wander_main); }
          else if(habit===3){ grow(x0,y0,PI2+(r()-0.5)*0.12,dep*2.2,4.4*sz,0,P.trop_main,P.wander_main); const k=1+Math.floor(r()*2.4); for(let i=0;i<k;i++){ const side=(i+(x0|0))%2?1:-1; grow(x0+side*1.4,y0,PI2+side*(0.7+0.3*r()),dep*(0.45+0.25*r()),2.2*sz,0,0.03,0.16); } }
          else { const k=5+Math.floor(r()*3); for(let i=0;i<k;i++){ const a=PI2+(i/(k-1)-0.5)*1.7+(r()-0.5)*0.2; grow(x0+(r()-0.5)*3,y0,a,dep*(1.0+0.4*r()),1.6*sz,1,0.06,0.24); } } }
        return roots; } });
export default make;
