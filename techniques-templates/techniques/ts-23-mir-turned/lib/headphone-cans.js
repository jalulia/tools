/* headphone-cans · Cans and antennae — TS-23 Mir, turned · Techniques & Templates · ø co.
   Lifted from techniques/ts-23-mir-turned/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Above 165 u the cans meet under the chin at full turn. Below 70 u the antennae hide behind the dome. */
export const id="headphone-cans", name="Cans and antennae", code="TS-23", entry="ts-23-mir-turned";
export const atoms=["cylinder","bevel","convex-hull","tube"];
export const spec={
  "id": "headphone-cans",
  "short": "CANS",
  "name": "Cans and antennae",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "cylinder",
    "bevel",
    "convex-hull",
    "tube"
  ],
  "params": {
    "can_u": {
      "value": 138,
      "range": [
        100,
        165
      ],
      "unit": "u",
      "label": "Can size",
      "note": "Radius of each can. Depth is 0.72 of it; the outer edge is rounded at 0.2 of it, the inner edge at 0.12."
    },
    "antenna_u": {
      "value": 170,
      "range": [
        70,
        200
      ],
      "unit": "u",
      "label": "Antenna length",
      "note": "How far each antenna stands above the top of its can."
    },
    "splay_deg": 26.5,
    "mount": 1,
    "tuck": 0.12,
    "swap": 0.1,
    "clear": 1.3,
    "drop": -0.21,
    "depth": 0.72,
    "round_out": 0.2,
    "round_in": 0.12,
    "rim_n": 144,
    "rod_r": 0.12,
    "ant_at": 0.5
  },
  "limits": "Above 165 u the cans meet under the chin at full turn. Below 70 u the antennae hide behind the dome.",
  "implementation": "A can is a puck: a cylinder with rounded edges, its inner face tangent to the sphere. Its outline is the convex hull of 14 rims sampled at 144 points, so ellipse arcs join by true tangent lines. A front can always stands out past the head’s silhouette by at least 1.3 line widths (it slides along the ear axis when the turn would bring the two outlines together), so the head line meets it in clean T-junctions. A can whose axis has turned to within 0.1 of edge-on is drawn behind the head (any overlap at that moment is thinner than the line) and slides up to 0.12 R into it, so it tucks behind the head instead of standing beside it as a slab."
};
export const params={
  "can_u": 138,
  "antenna_u": 170,
  "splay_deg": 26.5,
  "mount": 1,
  "tuck": 0.12,
  "swap": 0.1,
  "clear": 1.3,
  "drop": -0.21,
  "depth": 0.72,
  "round_out": 0.2,
  "round_in": 0.12,
  "rim_n": 144,
  "rod_r": 0.12,
  "ant_at": 0.5
};
export const A={};

export const make=(P,u,A)=>({ clear:P.clear, build:(hd,off)=>{ const D=Math.PI/180, sg=P.splay_deg*D, r=P.can_u/hd.Ru, L=P.antenna_u/hd.Ru, h2=P.depth*r, ro=P.round_out*r, ri=P.round_in*r, W=hd.toW;
        const add=(p,q,s)=>[p[0]+q[0]*s, p[1]+q[1]*s, p[2]+q[2]*s];
        return [-1,1].map(s=>{ const a=[s*Math.cos(sg),0,Math.sin(sg)], e1=[-a[2],0,a[0]], e2=[0,1,0], aw=W(a);
          /* a can turned away slides into the head, so its inner rim hides behind the sphere instead of leaving a sliver */
          const m=P.mount-P.tuck*Math.min(1,Math.max(0,(P.swap-aw[2])/0.22));
          const Ci=add([s*((off&&off[s])||0),P.drop,0],a,m), Co=add(Ci,a,h2), M=add(Ci,a,h2*P.ant_at), B=add(M,e2,r*0.4), T=add(M,e2,r+L), rims=[];
          for(let k=0;k<=6;k++){ const t=k/6*Math.PI/2; rims.push([ri-ri*Math.sin(t), r-ri+ri*Math.cos(t)]); }
          for(let k=0;k<=6;k++){ const t=k/6*Math.PI/2; rims.push([h2-ro+ro*Math.sin(t), r-ro+ro*Math.cos(t)]); }
          /* gloss: an arc on the outer rounding, centered on the direction up-and-forward */
          const gx=0.55*e1[2], th=Math.atan2(1,gx), G0=add(Ci,a,h2-ro*0.75), gl=[];
          for(let i=0;i<=16;i++){ const t=th-0.62+1.24*i/16, n=[Math.cos(t)*e1[0], Math.sin(t), Math.cos(t)*e1[2]]; gl.push({ p:W(add(G0,n,r-ro*0.04)), n:W(n) }); }
          return { side:s, a:aw, e1:W(e1), e2:W(e2), Ci:W(Ci), Co:W(Co), r, rf:r-ro, rin:r-ri, s0:ri, s1:h2-ro, h2, rims:rims.map(q=>({ c:W(add(Ci,a,q[0])), r:q[1] })), n:P.rim_n, B:W(B), T:W(T), ra:P.rod_r, gloss:gl, az:aw[2], front:aw[2]>=P.swap, z:W(M)[2] }; }); } });
export default make;
