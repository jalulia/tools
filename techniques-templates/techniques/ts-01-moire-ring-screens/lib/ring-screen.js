/* ring-screen · Concentric ring grating — TS-01 Moiré from two ring screens · Techniques & Templates · ø co.
   Lifted from techniques/ts-01-moire-ring-screens/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Pitches within ~4 u of each other push the beat fringe past the sheet; equal pitches collapse the moiré to one ring set. Below ~30 u the rings alias into the screen. */
export const id="ring-screen", name="Concentric ring grating", code="TS-01", entry="ts-01-moire-ring-screens";
export const atoms=["grating","radial"];
export const spec={
  "id": "ring-screen",
  "short": "SCRN",
  "name": "Concentric ring grating",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "grating",
    "radial"
  ],
  "params": {
    "A": {
      "center_u": [
        440,
        640
      ],
      "pitch_u": {
        "value": 68,
        "range": [
          24,
          160
        ],
        "unit": "u"
      }
    },
    "B": {
      "center_u": [
        1420,
        -260
      ],
      "pitch_u": {
        "value": 60,
        "range": [
          24,
          160
        ],
        "unit": "u"
      }
    },
    "profile": "0.5 + 0.5·cos(2π·d/pitch)",
    "floor": {
      "value": 0.42,
      "range": [
        0,
        0.9
      ],
      "note": "base blue coverage"
    }
  },
  "limits": "Pitches within ~4 u of each other push the beat fringe past the sheet; equal pitches collapse the moiré to one ring set. Below ~30 u the rings alias into the screen.",
  "implementation": "g(p) = 0.5+0.5·cos(2π·|p−c|/pitch) for each grating; the floor keeps a base blue coverage so the field never drops to paper."
};
export const params={
  "A": {
    "center_u": [
      440,
      640
    ],
    "pitch_u": 68
  },
  "B": {
    "center_u": [
      1420,
      -260
    ],
    "pitch_u": 60
  },
  "profile": "0.5 + 0.5·cos(2π·d/pitch)",
  "floor": 0.42
};
export const A={};

export const make=(P,u)=>{ const g=(c,pitch)=>({ cx:c[0]*u, cy:c[1]*u, pitch:pitch*u }); return { A:g(P.A.center_u,P.A.pitch_u), B:g(P.B.center_u,P.B.pitch_u), floor:P.floor, g:(d,pitch)=>0.5+0.5*Math.cos(6.2832*d/pitch) }; };
export default make;
