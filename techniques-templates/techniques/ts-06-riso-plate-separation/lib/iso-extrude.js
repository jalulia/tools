/* iso-extrude · Isometric extrusion by outline drop — TS-06 Riso three-plate separation · Techniques & Templates · ø co.
   Lifted from techniques/ts-06-riso-plate-separation/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: The drop is a column scan, so a depth past the gap to the object below it paints over that object’s top face. Shapes thinner than 4 px have no interior for the ±2 px probe and get no side faces. */
export const id="iso-extrude", name="Isometric extrusion by outline drop", code="TS-06", entry="ts-06-riso-plate-separation";
export const atoms=["isometric","extrude","painter-order"];
export const spec={
  "id": "iso-extrude",
  "short": "EXTR",
  "name": "Isometric extrusion by outline drop",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "isometric",
    "extrude",
    "painter-order"
  ],
  "params": {
    "axes": "x → (cos30, sin30), y → (−cos30, sin30), z → (0, −1)",
    "letters": {
      "font": "Archivo 900",
      "size_u": {
        "value": 235,
        "range": [
          140,
          300
        ],
        "unit": "u"
      },
      "depth_u": {
        "value": 85,
        "range": [
          10,
          180
        ],
        "unit": "u"
      }
    },
    "slabs": {
      "depth_u": [
        40,
        30,
        24
      ]
    },
    "bars": {
      "depth_u": {
        "value": 52,
        "range": [
          10,
          140
        ],
        "unit": "u"
      }
    },
    "probe_px": "(±2,+1)"
  },
  "limits": "The drop is a column scan, so a depth past the gap to the object below it paints over that object’s top face. Shapes thinner than 4 px have no interior for the ±2 px probe and get no side faces.",
  "implementation": "Each object is a top-face mask drawn in the plane transform; a column scan drops every boundary pixel whose +x or +y probe is empty by the depth, labeling right or left face, top always winning; later objects overwrite earlier ones."
};
export const params={
  "axes": "x → (cos30, sin30), y → (−cos30, sin30), z → (0, −1)",
  "letters": {
    "font": "Archivo 900",
    "size_u": 235,
    "depth_u": 85
  },
  "slabs": {
    "depth_u": [
      40,
      30,
      24
    ]
  },
  "bars": {
    "depth_u": 52
  },
  "probe_px": "(±2,+1)"
};
export const A={};
A.off=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
export const make=(P,u,A)=>{ const c30=Math.sqrt(3)/2, s30=0.5;
      return { plane:(x,ox,oy,z)=>x.setTransform(c30*u,s30*u,-c30*u,s30*u,ox*u,(oy-z)*u),
        labels:(W,H,objects)=>{ const lab=new Uint8Array(W*H); let objId=0;
          for(const [draw,depth,lift] of objects){ objId++; const m=A.off(W,H); const x=m.getContext('2d'); x.fillStyle='#fff'; draw(x,lift); const T=x.getImageData(0,0,W,H).data; const D=Math.round(depth*u); const id=objId*4;
            const inT=(X,Y)=>X>=0&&X<W&&Y>=0&&Y<H&&T[(Y*W+X)*4+3]>127;
            for(let X=0;X<W;X++){ let last=0,lastY=-1e9; for(let Y=0;Y<H;Y++){ const i=Y*W+X; if(T[i*4+3]>127){ lab[i]=id+1; const nR=inT(X+2,Y+1), nL=inT(X-2,Y+1), nD=inT(X,Y+1); if(!nR){ last=2; lastY=Y; } else if(!nL){ last=3; lastY=Y; } else if(!nD){ last=2; lastY=Y; } } else if(last&&Y-lastY<=D){ lab[i]=id+last; } } } }
          return lab; } }; };
export default make;
