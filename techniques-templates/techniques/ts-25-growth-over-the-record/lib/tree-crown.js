/* tree-crown · Tree of leaf clusters — TS-25 Growth over the record · Techniques & Templates · ø co.
   Lifted from techniques/ts-25-growth-over-the-record/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Above 270 u the crown would have to sink past its fork to stay inside the plate; under 80 u the leaf clusters merge into one lump. */
export const id="tree-crown", name="Tree of leaf clusters", code="TS-25", entry="ts-25-growth-over-the-record";
export const atoms=["leaf-cluster","lobe","soft-edge","tone-layer"];
export const spec={
  "id": "tree-crown",
  "short": "CRWN",
  "name": "Tree of leaf clusters",
  "layer": 5,
  "pass": 5,
  "atoms": [
    "leaf-cluster",
    "lobe",
    "soft-edge",
    "tone-layer"
  ],
  "params": {
    "tree": {
      "value": 2,
      "options": [
        {
          "v": 1,
          "label": "None"
        },
        {
          "v": 2,
          "label": "One tree"
        },
        {
          "v": 3,
          "label": "Grove"
        }
      ],
      "label": "Tree",
      "note": "what stands on the crest"
    },
    "crown_u": {
      "value": 239,
      "range": [
        80,
        270
      ],
      "step": 1,
      "unit": "u",
      "when": {
        "path": "tree",
        "is": [
          2,
          3
        ]
      },
      "label": "Crown size",
      "note": "width of the main crown (measured 239 u); past that it sinks down its trunk to stay inside the plate; the grove scales with it"
    },
    "base_x_u": 479.4,
    "base_depth": 0.2,
    "root_patch": [
      0.6,
      0.32,
      200
    ],
    "lobes": [
      [
        0,
        1.46,
        0.33
      ],
      [
        -0.34,
        1.38,
        0.31
      ],
      [
        0.36,
        1.36,
        0.31
      ],
      [
        -0.62,
        1.14,
        0.33
      ],
      [
        0.64,
        1.1,
        0.33
      ],
      [
        -0.18,
        1.2,
        0.37
      ],
      [
        0.22,
        1.22,
        0.35
      ],
      [
        -0.79,
        0.87,
        0.27
      ],
      [
        0.8,
        0.85,
        0.27
      ],
      [
        -0.42,
        0.95,
        0.33
      ],
      [
        0.44,
        0.93,
        0.33
      ],
      [
        0.02,
        1,
        0.33
      ],
      [
        -0.6,
        0.7,
        0.24
      ],
      [
        0.62,
        0.68,
        0.24
      ],
      [
        -0.31,
        0.74,
        0.23
      ],
      [
        0.34,
        0.73,
        0.23
      ]
    ],
    "fork": [
      [
        -0.4,
        1,
        0.085
      ],
      [
        0.36,
        1.08,
        0.08
      ],
      [
        0.04,
        1.34,
        0.055
      ]
    ],
    "twigs": [
      [
        0,
        -0.78,
        0.9
      ],
      [
        1,
        0.78,
        0.88
      ],
      [
        0,
        -0.62,
        1.22
      ],
      [
        1,
        0.6,
        1.2
      ]
    ],
    "grove": [
      [
        0,
        1
      ],
      [
        -0.95,
        0.62
      ],
      [
        0.9,
        0.7
      ],
      [
        -1.7,
        0.46
      ],
      [
        1.65,
        0.52
      ]
    ],
    "seed": 9
  },
  "limits": "Above 270 u the crown would have to sink past its fork to stay inside the plate; under 80 u the leaf clusters merge into one lump.",
  "implementation": "A trunk 0.12 R wide forks at 0.46 R into three limbs. Sixteen lobes, drawn top and outside first, are each filled with about 70 five-leaflet clusters shaded as a small sphere lit from the sun side, scaled by the whole crown’s shading; clusters on the crown’s rim go down at partial coverage so the grain gives a soft edge."
};
export const params={
  "tree": 2,
  "crown_u": 239,
  "base_x_u": 479.4,
  "base_depth": 0.2,
  "root_patch": [
    0.6,
    0.32,
    200
  ],
  "lobes": [
    [
      0,
      1.46,
      0.33
    ],
    [
      -0.34,
      1.38,
      0.31
    ],
    [
      0.36,
      1.36,
      0.31
    ],
    [
      -0.62,
      1.14,
      0.33
    ],
    [
      0.64,
      1.1,
      0.33
    ],
    [
      -0.18,
      1.2,
      0.37
    ],
    [
      0.22,
      1.22,
      0.35
    ],
    [
      -0.79,
      0.87,
      0.27
    ],
    [
      0.8,
      0.85,
      0.27
    ],
    [
      -0.42,
      0.95,
      0.33
    ],
    [
      0.44,
      0.93,
      0.33
    ],
    [
      0.02,
      1,
      0.33
    ],
    [
      -0.6,
      0.7,
      0.24
    ],
    [
      0.62,
      0.68,
      0.24
    ],
    [
      -0.31,
      0.74,
      0.23
    ],
    [
      0.34,
      0.73,
      0.23
    ]
  ],
  "fork": [
    [
      -0.4,
      1,
      0.085
    ],
    [
      0.36,
      1.08,
      0.08
    ],
    [
      0.04,
      1.34,
      0.055
    ]
  ],
  "twigs": [
    [
      0,
      -0.78,
      0.9
    ],
    [
      1,
      0.78,
      0.88
    ],
    [
      0,
      -0.62,
      1.22
    ],
    [
      1,
      0.6,
      1.2
    ]
  ],
  "grove": [
    [
      0,
      1
    ],
    [
      -0.95,
      0.62
    ],
    [
      0.9,
      0.7
    ],
    [
      -1.7,
      0.46
    ],
    [
      1.65,
      0.52
    ]
  ],
  "seed": 9
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
export const make=(P,u,A)=>{ const on=P.tree>1, grove=P.tree>2, R0=P.crown_u/2;
      const trees=main=>{ if(!on)return []; const list=(grove?P.grove:[P.grove[0]]).map(g=>{ const R=R0*g[1], x=P.base_x_u+g[0]*R0; return { x, y:main(x)[0]+P.base_depth*R, R, k:g[1] }; }); return list.sort((a,b)=>a.R-b.R); };
      const draw=(c,list,Lx,Ly)=>{ const C=(t,g,a)=>`rgba(${Math.max(0,Math.min(255,Math.round(t*255)))},${g},0,${a===undefined?1:a})`, lz=0.55, ln=Math.hypot(Lx,Ly,lz), L3=[Lx/ln,Ly/ln,lz/ln];
        const limb=(x0,y0,x1,y1,x2,y2,w0,w1,tone)=>{ const N=14, Lf=[], Rt=[]; for(let i=0;i<=N;i++){ const t=i/N, a=(1-t)*(1-t), m=2*(1-t)*t, z=t*t, px=a*x0+m*x1+z*x2, py=a*y0+m*y1+z*y2, dx=2*(1-t)*(x1-x0)+2*t*(x2-x1), dy=2*(1-t)*(y1-y0)+2*t*(y2-y1), dl=Math.hypot(dx,dy)||1, w=(w0+(w1-w0)*t)/2; Lf.push([px-dy/dl*w,py+dx/dl*w]); Rt.push([px+dy/dl*w,py-dx/dl*w]); }
          c.fillStyle=C(tone,255); c.beginPath(); c.moveTo(Lf[0][0],Lf[0][1]); for(const p of Lf)c.lineTo(p[0],p[1]); for(let i=Rt.length-1;i>=0;i--)c.lineTo(Rt[i][0],Rt[i][1]); c.closePath(); c.fill(); return t=>{ const a=(1-t)*(1-t), m=2*(1-t)*t, z=t*t; return [a*x0+m*x1+z*x2, a*y0+m*y1+z*y2]; }; };
        const ros=(q,ox,oy,k)=>{ c.beginPath(); for(let j=0;j<5;j++){ const a=q.rot+j*1.2566, ex=q.x+ox+Math.cos(a)*q.s*0.52, ey=q.y+oy+Math.sin(a)*q.s*0.52, rx=q.s*0.46*k, ry=q.s*0.25*k; c.moveTo(ex+Math.cos(a)*rx,ey+Math.sin(a)*rx); c.ellipse(ex,ey,rx,ry,a,0,6.2832); } const rr=q.s*0.3*k; c.moveTo(q.x+ox+rr,q.y+oy); c.arc(q.x+ox,q.y+oy,rr,0,6.2832); c.fill(); };
        for(const T of list){ const r=A.rng(P.seed+Math.round(T.x*7)), R=T.R*u, bx=T.x*u, by=T.y*u, fy=by-0.46*R, sk=Math.min(0.3*T.R,Math.max(0,6-(T.y-1.8*T.R)))*u;
          /* each tree's own lobe layout: the measured one for the main tree, a seeded variant (mirrored, stretched, lobes dropped and added) for the grove */
          const vr=A.rng(P.seed*31+Math.round(T.x*13)), main=T.k===1, mir=!main&&vr()<0.5?-1:1, ax=main?1:0.85+0.3*vr(), ay=main?1:0.85+0.3*vr();
          const lay=P.lobes.filter(()=>main||vr()>0.18).map(q=>[q[0]*mir*ax+(main?0:(vr()-0.5)*0.24),1.05+(q[1]-1.05)*ay+(main?0:(vr()-0.5)*0.2),q[2]*(main?1:0.85+0.3*vr())]);
          if(!main){ const add=2+Math.floor(vr()*3); for(let i=0;i<add;i++)lay.push([(vr()*2-1)*0.75,0.8+vr()*0.6,0.22+vr()*0.12]); }
          const fk=P.fork.map(f=>[f[0]*mir+(main?0:(vr()-0.5)*0.16),f[1]*(main?1:0.92+0.16*vr()),f[2]]);
          /* trunk to the fork, flared at the ground, lit side toward the sun */
          const g=c.createLinearGradient(bx-0.06*R,0,bx+0.06*R,0); g.addColorStop(0,C(Lx<0?0.78:0.14,255)); g.addColorStop(1,C(Lx<0?0.14:0.78,255));
          c.fillStyle=g; c.beginPath(); c.moveTo(bx-0.13*R,by+0.03*R); c.quadraticCurveTo(bx-0.062*R,by-0.01*R,bx-0.064*R,by-0.16*R); c.lineTo(bx-0.056*R,fy); c.lineTo(bx+0.056*R,fy); c.lineTo(bx+0.064*R,by-0.16*R); c.quadraticCurveTo(bx+0.062*R,by-0.01*R,bx+0.135*R,by+0.035*R); c.closePath(); c.fill();
          /* the fork: three limbs that curve up into the crown, two twigs off each side limb */
          const lp=fk.map(f=>{ const ey=by-f[1]*R+sk; return limb(bx+f[0]*0.06*R,fy+0.03*R,bx+f[0]*0.42*R,fy+(ey-fy)*0.38,bx+f[0]*R,ey,f[2]*R,f[2]*0.3*R,0.3); });
          for(const tw of P.twigs){ const p=lp[tw[0]](0.5), ex=bx+tw[1]*mir*R, ey=by-tw[2]*R+sk; limb(p[0],p[1],(p[0]+ex)/2,(p[1]+ey)/2-0.04*R,ex,ey,0.03*R,0.01*R,0.34); }
          /* lobes: top and outside first, so lower and central lobes overlap the shaded undersides above them */
          const lobes=lay.map(q=>({ x:q[0]+(r()-0.5)*0.06, up:q[1]+(r()-0.5)*0.06, rl:q[2]*(0.92+0.16*r()) })).sort((a,b)=>(b.up+0.5*Math.abs(b.x))-(a.up+0.5*Math.abs(a.x)));
          const sz=5.5*Math.sqrt(T.R/119.5)*u;
          for(const q of lobes){ const lx=bx+q.x*R, ly=by-q.up*R+sk, rl=q.rl*R; let gx=q.x/1.05, gy=-(q.up-1.05)/0.78; const gl=Math.hypot(gx,gy); if(gl>0.97){ gx*=0.97/gl; gy*=0.97/gl; }
            const gz=Math.sqrt(1-gx*gx-gy*gy), gs=Math.max(0,gx*L3[0]+gy*L3[1]+gz*L3[2]), ao=0.72+0.28*Math.min(1,Math.max(0,(q.up-0.5)/1.0));
            c.fillStyle=C(0.14+0.16*gs*ao,0); c.beginPath(); c.arc(lx,ly,rl*0.62,0,6.2832); c.fill();
            const n=Math.round(1.7*(rl/sz)*(rl/sz)), cl=[];
            for(let i=0;i<n;i++){ const rho=Math.sqrt(r())*0.98, a=r()*6.2832, nx=Math.cos(a)*rho, ny=Math.sin(a)*rho, nz=Math.sqrt(Math.max(0,1-rho*rho)), sh=Math.max(0,nx*L3[0]+ny*L3[1]+nz*L3[2]);
              const t=0.13+0.64*sh*ao+0.24*gs+(r()-0.5)*0.16, px=lx+nx*rl, py=ly+ny*rl, ex=(px-bx)/R/1.05, eu=(by+sk-py)/R, cy=(eu-1.05)/(eu>1.05?0.8:0.62), rc=Math.hypot(ex,cy);
              cl.push({ x:px, y:py, t, rot:r()*6.2832, s:sz*(0.8+0.5*r())*(1-0.25*rho*rho*rho*rho), a:rc>0.9?0.42:rc>0.8?0.7:1 }); }
            cl.sort((a,b)=>a.t-b.t);
            for(const k of cl){ c.fillStyle=C(k.t-0.28,0,k.a); ros(k,-L3[0]*0.25*k.s,-L3[1]*0.25*k.s,1.1); c.fillStyle=C(k.t,0,k.a); ros(k,0,0,1); } } } };
      const patches=list=>list.map(t=>({ x:t.x, y:t.y-0.04*t.R, rx:P.root_patch[0]*t.R, ry:P.root_patch[1]*t.R, k:P.root_patch[2] }));
      return { on, trees, draw, patches }; };
export default make;
