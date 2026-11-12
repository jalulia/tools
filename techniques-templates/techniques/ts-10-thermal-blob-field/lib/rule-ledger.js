/* rule-ledger · Rules, caption and label — TS-10 Thermal blob field · Techniques & Templates · ø co.
   Lifted from techniques/ts-10-thermal-blob-field/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A,V) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Rules under 1 device px are drawn at 1 px. A caption past ~22 u collides with the second rule’s label on a narrow sheet. */
export const id="rule-ledger", name="Rules, caption and label", code="TS-10", entry="ts-10-thermal-blob-field";
export const atoms=["hairline","caption","label"];
export const spec={
  "id": "rule-ledger",
  "short": "RULE",
  "name": "Rules, caption and label",
  "layer": 4,
  "pass": 4,
  "atoms": [
    "hairline",
    "caption",
    "label"
  ],
  "params": {
    "rules": {
      "y_v": [
        0.475,
        0.925
      ],
      "inset_u": {
        "value": 12,
        "range": [
          0,
          80
        ],
        "unit": "u"
      },
      "weight_u": {
        "value": 1,
        "range": [
          0.5,
          5
        ],
        "unit": "u"
      },
      "color": "#1A1618"
    },
    "caption": {
      "font": "JetBrains Mono",
      "size_u": {
        "value": 14,
        "range": [
          8,
          26
        ],
        "unit": "u"
      },
      "align": "right, under rule 1",
      "x_u": 988
    },
    "label": {
      "font": "Inter 13 u / Inter 600 18 u",
      "lines": 2,
      "x_u": 12,
      "under": "rule 2"
    }
  },
  "limits": "Rules under 1 device px are drawn at 1 px. A caption past ~22 u collides with the second rule’s label on a narrow sheet.",
  "implementation": "Two 1 u ink rules across the sheet; the caption is set right-aligned 12 u under the first rule, the two-line studio label under the second."
};
export const params={
  "rules": {
    "y_v": [
      0.475,
      0.925
    ],
    "inset_u": 12,
    "weight_u": 1,
    "color": "#1A1618"
  },
  "caption": {
    "font": "JetBrains Mono",
    "size_u": 14,
    "align": "right, under rule 1",
    "x_u": 988
  },
  "label": {
    "font": "Inter 13 u / Inter 600 18 u",
    "lines": 2,
    "x_u": 12,
    "under": "rule 2"
  }
};
export const A={};

export const make=(P,u,A,V)=>({ draw:(x,W,H)=>{
      const ink=V.ink; x.setTransform(1,0,0,1,0,0); x.fillStyle=ink; const ins=P.rules.inset_u*u, lw=Math.max(1,Math.round(P.rules.weight_u*u));
      const y1=Math.round(P.rules.y_v[0]*H), y2=Math.round(P.rules.y_v[1]*H); x.fillRect(ins,y1,W-2*ins,lw); x.fillRect(ins,y2,W-2*ins,lw);
      x.textBaseline='alphabetic'; x.textAlign='right'; x.font=`400 ${P.caption.size_u*u}px "JetBrains Mono", monospace`; x.fillText('MOLT — Soft Field Backgrounds · Set 02',W-ins,y1+lw+26*u);
      x.textAlign='left'; x.font=`400 ${13*u}px Inter, sans-serif`; x.fillText('studio',ins,y2+lw+20*u); x.font=`600 ${18*u}px Inter, sans-serif`; x.fillText('OKTAVE FORM',ins,y2+lw+42*u); } });
export default make;
