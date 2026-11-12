/* tracked-label · Tracked mono label — TS-22 Capsule rain system · Techniques & Templates · ø co.
   Lifted from techniques/ts-22-capsule-rain/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Tracking above ~0.4 em breaks words into letters at this size. */
export const id="tracked-label", name="Tracked mono label", code="TS-22", entry="ts-22-capsule-rain";
export const atoms=["mono-caps","tracking","rule"];
export const spec={
  "id": "tracked-label",
  "short": "LABL",
  "name": "Tracked mono label",
  "layer": 4,
  "pass": 4,
  "atoms": [
    "mono-caps",
    "tracking",
    "rule"
  ],
  "params": {
    "size_u": {
      "value": 12.5,
      "range": [
        8,
        24
      ],
      "unit": "u"
    },
    "tracking_em": {
      "value": 0.22,
      "range": [
        0,
        0.6
      ],
      "unit": "em"
    },
    "leading": {
      "value": 1.65,
      "range": [
        1.1,
        2.4
      ]
    },
    "rule_u": [
      22,
      1.2
    ],
    "rule_gap_u": {
      "value": 16,
      "range": [
        4,
        40
      ],
      "unit": "u"
    }
  },
  "limits": "Tracking above ~0.4 em breaks words into letters at this size.",
  "implementation": "Capitals in JetBrains Mono, set letter by letter with 0.22 em added; a short rule sits one gap below the last line."
};
export const params={
  "size_u": 12.5,
  "tracking_em": 0.22,
  "leading": 1.65,
  "rule_u": [
    22,
    1.2
  ],
  "rule_gap_u": 16
};
export const A={};

export const make=(P,u,A)=>({ draw:(x,lines,X,Y,color,rule)=>{ const sz=P.size_u*u; x.font=`500 ${sz}px "JetBrains Mono", monospace`; x.textBaseline='alphabetic'; x.fillStyle=color; let y=Y;
        for(const ln of lines){ let cx=X; for(const ch of ln){ x.fillText(ch,cx,y); cx+=x.measureText(ch).width+P.tracking_em*sz; } y+=sz*P.leading; }
        if(rule!==false){ x.fillRect(X,y-sz*P.leading+P.rule_gap_u*u,P.rule_u[0]*u,P.rule_u[1]*u); } } });
export default make;
