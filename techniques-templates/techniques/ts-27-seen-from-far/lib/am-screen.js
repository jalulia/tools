/* am-screen · AM screen — TS-27 Seen from far · Techniques & Templates · ø co.
   Lifted from techniques/ts-27-seen-from-far/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A,V) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Prints the record as dots: cell size, gain, angle, shape and ink. Under 8 u the dots read as a tint; past 25 % gain the core prints solid. */
export const id="am-screen", name="AM screen", code="TS-27", entry="ts-27-seen-from-far";
export const atoms=["halftone","am-screen","dot-gain","ramp"];
export const spec={
  "id": "am-screen",
  "short": "SCRN",
  "name": "AM screen",
  "layer": 3,
  "pass": 3,
  "atoms": [
    "halftone",
    "am-screen",
    "dot-gain",
    "ramp"
  ],
  "params": {
    "pitch_u": {
      "value": 11.1,
      "range": [
        8,
        24
      ],
      "unit": "u",
      "scale": "log",
      "label": "Dot pitch",
      "note": "cell size at 100 % distance"
    },
    "gain": {
      "value": 0,
      "range": [
        -15,
        25
      ],
      "unit": "%",
      "label": "Dot gain",
      "note": "added to a 50 % dot; above 20 % the deep dots join"
    },
    "angle_deg": {
      "value": 0,
      "range": [
        0,
        45
      ],
      "unit": "°",
      "label": "Screen angle",
      "note": "turns the cell grid about the origin"
    },
    "shape": {
      "value": 1,
      "options": [
        {
          "v": 1,
          "label": "Round"
        },
        {
          "v": 2,
          "label": "Square"
        },
        {
          "v": 3,
          "label": "Line"
        }
      ],
      "label": "Dot shape",
      "note": "round dots, square dots, or lines whose width follows density"
    },
    "ink": {
      "value": 1,
      "options": [
        {
          "v": 1,
          "label": "Ramp"
        },
        {
          "v": 2,
          "label": "Deep"
        },
        {
          "v": 3,
          "label": "Ink"
        }
      ],
      "label": "Dot ink",
      "note": "Ramp takes the light, mid or deep ink by dot area; Deep prints every dot in the deep ink; Ink prints every dot in the darkest ink"
    },
    "full_dot": 0.92,
    "min_tone": 0.035,
    "ramp": "light 0 · mid 0.4 · deep 0.8"
  },
  "limits": "Prints the record as dots: cell size, gain, angle, shape and ink. Under 8 u the dots read as a tint; past 25 % gain the core prints solid.",
  "implementation": "Each cell takes one size and one color. Per pixel the four nearest cells add their coverage with a half-pixel edge (lines a quarter-pixel edge) and share the color by weight; a dot with two or more filled neighbors fills its cell as a tile in its own ink, so abutting squares and lines close without seams and dots stay round at any angle; a square or line that would leave a gap under 12 % of the cell fills it."
};
export const params={
  "pitch_u": 11.1,
  "gain": 0,
  "angle_deg": 0,
  "shape": 1,
  "ink": 1,
  "full_dot": 0.92,
  "min_tone": 0.035,
  "ramp": "light 0 · mid 0.4 · deep 0.8"
};
export const A={};
A.lut=stops=>{ const L=new Array(256); for(let i=0;i<256;i++){ const t=i/255; let c=A.hex(stops[stops.length-1][1]); for(let k=1;k<stops.length;k++){ if(t<=stops[k][0]){ const u=(t-stops[k-1][0])/((stops[k][0]-stops[k-1][0])||1e-6); c=A.mix(A.hex(stops[k-1][1]),A.hex(stops[k][1]),A.clamp(u,0,1)); break; } } L[i]=c; } return L; };
A.hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
A.mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,u,A,V)=>{ const g=P.gain/100, Af=Math.PI/4*P.full_dot*P.full_dot; const R=A.lut([[0,V.light],[0.4,V.mid],[0.8,V.deep],[1,V.deep]]), deep=A.hex(V.deep), inkc=A.hex(V.ink);
      const area=t=>{ if(t<P.min_tone)return 0; const a=A.clamp(t,0,1)*Af; return A.clamp(a+4*g*a*(1-a),0,1); };
      return { area, angle:P.angle_deg*Math.PI/180, shape:P.shape, color:t=>P.ink===2?deep:P.ink===3?inkc:R[(A.clamp(t,0,1)*255)|0],
        cover:pd=>P.shape===1?Math.PI*Math.pow(0.7072+0.75/pd,2):1,
        /* d ← paper·(1 − a) + ink·a, a = summed coverage of the four nearest cells; ink = each cell's record color, or, for the share pw of a cell still showing the
           painting, the painting's own pixel under the dot (crisp, darkened by dk to hold its tone on paper). C: { ar, pw, cr, cg, cb, ni, nj, oi, oj }; pix: painting RGBA or null */
        print:(d,W,H,cx,cy,pd,C,paper,pix,dk,G)=>{ const ca=Math.cos(P.angle_deg*Math.PI/180), sa=Math.sin(P.angle_deg*Math.PI/180), ni=C.ni, nj=C.nj, oi=C.oi, oj=C.oj, ar=C.ar, pw=C.pw, cr=C.cr, cg=C.cg, cb=C.cb, sh=P.shape;
          const at=(i,j)=>{ i+=oi; j+=oj; return i<0||j<0||i>=ni||j>=nj?-1:j*ni+i; };
          /* a square or a line that would leave a gap under 12 % of the cell (or under 1 px) fills its cell, so near-touching cells never show hairlines */
          const shut=Math.max(0.12*pd,1), close=h=>pd-2*h<shut?0.5*pd:h;
          /* squares: a square that would leave a gap under 12 % of its cell fills it; a dot with two or more filled neighbors fills its cell too, in its own ink (three passes),
             so a solid core prints as tiles with square paper holes where nothing grew, never as outlined boxes */
          let SQ=null; if(sh===2){ const n=ni*nj, S0=new Uint8Array(n); SQ=new Uint8Array(n); for(let c=0;c<n;c++)if(ar[c]>0&&close(0.5*pd*Math.sqrt(ar[c]>1?1:ar[c]))>=0.5*pd)S0[c]=1;
            for(let pass=0;pass<3;pass++){ for(let j=0;j<nj;j++)for(let i=0;i<ni;i++){ const c=j*ni+i; if(ar[c]<=0)continue; if(S0[c]){ SQ[c]=1; continue; } const k=(i>0?S0[c-1]:0)+(i<ni-1?S0[c+1]:0)+(j>0?S0[c-ni]:0)+(j<nj-1?S0[c+ni]:0); if(k>=2)SQ[c]=1; } S0.set(SQ); } }
          for(let Y=0;Y<H;Y++){ const dy=Y+0.5-cy; for(let X=0;X<W;X++){ const dx=X+0.5-cx; const a=(dx*ca+dy*sa)/pd, b=(-dx*sa+dy*ca)/pd; const i0=Math.round(a), j0=Math.round(b), fa=a-i0, fb=b-j0, si=fa<0?-1:1, sj=fb<0?-1:1;
            let cov=0, sr=0, sg=0, sb=0, sp=0;
            if(sh!==3){ for(let q=0;q<4;q++){ const ii=i0+(q&1?si:0), jj=j0+(q&2?sj:0); const c=at(ii,jj); if(c<0)continue; const A0=ar[c]; if(A0<=0)continue; let v;
                if(sh===1){ const ex=a-ii, ey=b-jj; v=pd*Math.sqrt(A0/Math.PI)-pd*Math.sqrt(ex*ex+ey*ey)+0.5; }
                else { const ex=a-ii, ey=b-jj; v=(SQ[c]?0.5*pd:0.5*pd*Math.sqrt(A0>1?1:A0))-pd*Math.max(ex<0?-ex:ex,ey<0?-ey:ey)+0.5; }
                if(v<=0)continue; if(v>1)v=1; cov+=v; const vp=v*pw[c], vr=v-vp; sp+=vp; sr+=vr*cr[c]; sg+=vr*cg[c]; sb+=vr*cb[c]; }
            }
            else { const il=Math.floor(a), tl=a-il; for(let q=0;q<2;q++){ const jj=j0+(q?sj:0); const c1=at(il,jj), c2=at(il+1,jj); if(c1<0&&c2<0)continue; const A1=c1>=0?Math.min(1,ar[c1]):0, A2=c2>=0?Math.min(1,ar[c2]):0, Am=A1+(A2-A1)*tl; if(Am<=0)continue;
                let v=2*(close(0.5*pd*Am)-pd*Math.abs(b-jj))+0.5; if(v<=0)continue; if(v>1)v=1; const w1=c1<0?0:c2<0?1:1-tl, w2=1-w1, e1=c1<0?c2:c1, e2=c2<0?c1:c2;
                cov+=v; const vp=v*(pw[e1]*w1+pw[e2]*w2), vr=v-vp; sp+=vp; sr+=vr*(cr[e1]*w1+cr[e2]*w2); sg+=vr*(cg[e1]*w1+cg[e2]*w2); sb+=vr*(cb[e1]*w1+cb[e2]*w2); } }
            const o=(Y*W+X)*4, r0=paper[0], g0=paper[1], b0=paper[2];
            if(cov>0){ if(sp>0&&pix){ const qr=pix[o], qg=pix[o+1], qb=pix[o+2]; sr+=sp*(qr+(G[qr]-qr)*dk); sg+=sp*(qg+(G[qg]-qg)*dk); sb+=sp*(qb+(G[qb]-qb)*dk); }
              const inv=1/cov, w=cov>1?1:cov; d[o]=r0+(sr*inv-r0)*w; d[o+1]=g0+(sg*inv-g0)*w; d[o+2]=b0+(sb*inv-b0)*w; } else { d[o]=r0; d[o+1]=g0; d[o+2]=b0; } d[o+3]=255; } } } }; };
export default make;
