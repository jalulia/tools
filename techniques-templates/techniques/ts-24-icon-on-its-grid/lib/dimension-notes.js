/* dimension-notes · Dimension notes — TS-24 Mir on its icon grid · Techniques & Templates · ø co.
   Lifted from techniques/ts-24-icon-on-its-grid/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Notes knock out the lines under them, so they never sit on a keyline. */
export const id="dimension-notes", name="Dimension notes", code="TS-24", entry="ts-24-icon-on-its-grid";
export const atoms=["mono-caps","dimension-line","knockout"];
export const spec={
  "id": "dimension-notes",
  "short": "NOTE",
  "name": "Dimension notes",
  "layer": 4,
  "pass": 4,
  "atoms": [
    "mono-caps",
    "dimension-line",
    "knockout"
  ],
  "params": {
    "size_u": 14,
    "caption_u": 14,
    "rule_u": 1.1,
    "tick_u": 10
  },
  "limits": "Notes knock out the lines under them, so they never sit on a keyline.",
  "implementation": "JetBrains Mono capitals at 14 u on the sheet; ladder captions in Inter at 14 u (no dotted zeros); dimension lines with 10 u end ticks; each note sits on a box in the color under it. Inside a colored tile, notes and keylines are set in ink or paper."
};
export const params={
  "size_u": 14,
  "caption_u": 14,
  "rule_u": 1.1,
  "tick_u": 10
};
export const A={};

export const make=(P,u,A)=>({ size:P.size_u*u, cap:P.caption_u*u, rule:Math.max(1,P.rule_u*u), tick:P.tick_u*u,
      text:(x,s,X,Y,col,align,sz,knock,fam)=>{ x.font=fam||`500 ${sz}px "JetBrains Mono", monospace`; x.textAlign=align||'left'; x.textBaseline='alphabetic'; if(knock){ const m=x.measureText(s).width, x0=align==='right'?X-m:(align==='center'?X-m/2:X); x.fillStyle=knock; x.fillRect(x0-sz*0.35,Y-sz*0.92,m+sz*0.7,sz*1.25); } x.fillStyle=col; x.fillText(s,X,Y); } });
export default make;
