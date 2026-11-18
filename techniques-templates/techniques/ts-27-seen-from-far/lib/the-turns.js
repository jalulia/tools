/* the-turns · The turns — TS-27 Seen from far · Techniques & Templates · ø co.
   Lifted from techniques/ts-27-seen-from-far/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A,G) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Draws the walk through the field: how many turns and how heavy the line. Over 28 turns the plantings merge into a band. */
export const id="the-turns", name="The turns", code="TS-27", entry="ts-27-seen-from-far";
export const atoms=["polyline","node","halo"];
export const spec={
  "id": "the-turns",
  "short": "TURN",
  "name": "The turns",
  "layer": 4,
  "pass": 4,
  "atoms": [
    "polyline",
    "node",
    "halo"
  ],
  "params": {
    "turns": {
      "value": 22,
      "range": [
        8,
        28
      ],
      "step": 1,
      "label": "Turns",
      "note": "nodes on the ring; the walk visits them in order and closes the loop"
    },
    "line_u": {
      "value": 1.9,
      "range": [
        1,
        4.5
      ],
      "unit": "u",
      "scale": "log",
      "label": "Line weight",
      "note": "core of the line; the halo is 4.2 times wider, up to 10 u"
    },
    "halo": 4.2,
    "halo_max_u": 10,
    "core_alpha": 0.85,
    "halo_alpha": 0.13,
    "chords": 0.3,
    "start_deg": -150,
    "seed": 22
  },
  "limits": "Draws the walk through the field: how many turns and how heavy the line. Over 28 turns the plantings merge into a band.",
  "implementation": "Nodes sit at 0.54–0.95 of the reach (within 440 u of the center on each axis), one per turn with ±31 % angle jitter; the path joins them in order and 30 % of turns also cut across two or three nodes. The core and the halo are one path each, so crossings do not double the ink."
};
export const params={
  "turns": 22,
  "line_u": 1.9,
  "halo": 4.2,
  "halo_max_u": 10,
  "core_alpha": 0.85,
  "halo_alpha": 0.13,
  "chords": 0.3,
  "start_deg": -150,
  "seed": 22
};
export const A={};
A.rng=seed=>{ let s=seed|0; return ()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,u,A,G)=>{ const r=A.rng(P.seed), N=Math.max(3,Math.round(P.turns)), R=G.reach_u, nodes=[], th0=P.start_deg*Math.PI/180;
      for(let k=0;k<N;k++){ const j=r()-0.5, q=r(), c=r(); const th=th0+6.2832*(k+0.62*j)/N; const rad=R*A.clamp(0.74+(k%2?0.07:-0.06)+0.42*(q-0.5),0.54,0.95); nodes.push({ x:A.clamp(Math.cos(th)*rad*(G.sx||1),-440,440), y:A.clamp(Math.sin(th)*rad*(G.sy||1),-440,440), th, rad, day:1+G.walk_days*k/N, chord:c<P.chords, skip:c<P.chords*0.45?3:2 }); }
      const vday=k=>k>=N?1+G.walk_days:nodes[k].day, segs=[];
      for(let k=0;k<N;k++){ const a=vday(k), b=vday(k+1); segs.push({ a:k, b:(k+1)%N, f:A.clamp((G.days-a)/(b-a),0,1) });
        if(nodes[k].chord){ const sk=nodes[k].skip, b2=k+sk>=N?1+G.walk_days:vday(k+sk); segs.push({ a:k, b:(k+sk)%N, f:G.days>=b2?1:0 }); } }
      const path=(c,cx,cy,s)=>{ c.beginPath(); for(const g of segs){ if(g.f<=0)continue; const p=nodes[g.a], q=nodes[g.b]; c.moveTo(cx+p.x*s,cy+p.y*s); c.lineTo(cx+(p.x+(q.x-p.x)*g.f)*s,cy+(p.y+(q.y-p.y)*g.f)*s); } };
      return { nodes, segs, path,
        /* key: { alpha, color } draws a paper keyline 1.8 u wider than the core between the halo and the core, so the line reads on a solid core */
        draw:(c,cx,cy,s,alpha,color,key)=>{ if(alpha<=0)return; c.save(); c.lineCap='round'; c.lineJoin='round'; c.strokeStyle=color; path(c,cx,cy,s);
          c.globalAlpha=alpha*P.halo_alpha; c.lineWidth=Math.min(P.line_u*P.halo,P.halo_max_u)*s; c.stroke();
          if(key&&key.alpha>0){ c.strokeStyle=key.color; c.globalAlpha=alpha*key.alpha; c.lineWidth=(P.line_u+1.8)*s; c.stroke(); c.strokeStyle=color; }
          c.globalAlpha=alpha*P.core_alpha; c.lineWidth=P.line_u*s; c.stroke(); c.restore(); },
        /* distance from a point to the drawn path */
        dist:(x,y)=>{ let m=1e9; for(const g of segs){ if(g.f<=0)continue; const p=nodes[g.a], q=nodes[g.b]; const ex=(q.x-p.x)*g.f, ey=(q.y-p.y)*g.f; const L=ex*ex+ey*ey||1; let t=((x-p.x)*ex+(y-p.y)*ey)/L; t=t<0?0:t>1?1:t; const dx=x-p.x-ex*t, dy=y-p.y-ey*t; const d=dx*dx+dy*dy; if(d<m)m=d; } return Math.sqrt(m); } }; };
export default make;
