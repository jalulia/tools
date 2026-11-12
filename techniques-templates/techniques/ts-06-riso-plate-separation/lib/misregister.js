/* misregister · Per-plate register error — TS-06 Riso three-plate separation · Techniques & Templates · ø co.
   Lifted from techniques/ts-06-riso-plate-separation/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Past ~8 u a plate leaves its keyline and reads as a second drawing. With all three offsets equal there is no fringe and the print reads as flat digital color. */
export const id="misregister", name="Per-plate register error", code="TS-06", entry="ts-06-riso-plate-separation";
export const atoms=["translate","offset"];
export const spec={
  "id": "misregister",
  "short": "MREG",
  "name": "Per-plate register error",
  "layer": 2,
  "pass": 3,
  "atoms": [
    "translate",
    "offset"
  ],
  "params": {
    "yellow": {
      "dx_u": {
        "value": -3,
        "range": [
          -14,
          14
        ],
        "unit": "u"
      },
      "dy_u": {
        "value": 2,
        "range": [
          -14,
          14
        ],
        "unit": "u"
      }
    },
    "blue": {
      "dx_u": {
        "value": 1,
        "range": [
          -14,
          14
        ],
        "unit": "u"
      },
      "dy_u": {
        "value": -2,
        "range": [
          -14,
          14
        ],
        "unit": "u"
      }
    },
    "pink": {
      "dx_u": {
        "value": 4,
        "range": [
          -14,
          14
        ],
        "unit": "u"
      },
      "dy_u": {
        "value": 3,
        "range": [
          -14,
          14
        ],
        "unit": "u"
      }
    },
    "measured_px": "pink +3,+2 · yellow −2,+1 relative to blue"
  },
  "limits": "Past ~8 u a plate leaves its keyline and reads as a second drawing. With all three offsets equal there is no fringe and the print reads as flat digital color.",
  "implementation": "Each plate canvas is drawn translated by its own vector; the keyline sits on all three plates, so the offsets show as coloured fringes on every edge and the overprint of all three is the near-black line."
};
export const params={
  "yellow": {
    "dx_u": -3,
    "dy_u": 2
  },
  "blue": {
    "dx_u": 1,
    "dy_u": -2
  },
  "pink": {
    "dx_u": 4,
    "dy_u": 3
  },
  "measured_px": "pink +3,+2 · yellow −2,+1 relative to blue"
};
export const A={};

export const make=(P,u)=>({ offsets:[[P.yellow.dx_u*u,P.yellow.dy_u*u],[P.blue.dx_u*u,P.blue.dy_u*u],[P.pink.dx_u*u,P.pink.dy_u*u]] });
export default make;
