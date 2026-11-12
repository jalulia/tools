/* rim-stop · Dark rim stop — TS-10 Thermal blob field · Techniques & Templates · ø co.
   Lifted from techniques/ts-10-thermal-blob-field/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: from must stay below to, and both inside 0.41–0.53 (the stops on either side). A band wider than ~0.07 reads as a dark fill, not an outline. */
export const id="rim-stop", name="Dark rim stop", code="TS-10", entry="ts-10-thermal-blob-field";
export const atoms=["lut-stop","edge-band"];
export const spec={
  "id": "rim-stop",
  "short": "RIM",
  "name": "Dark rim stop",
  "layer": 2,
  "pass": 2,
  "atoms": [
    "lut-stop",
    "edge-band"
  ],
  "params": {
    "from": {
      "value": 0.44,
      "range": [
        0.415,
        0.5
      ],
      "note": "field value where the dark stop starts"
    },
    "to": {
      "value": 0.48,
      "range": [
        0.44,
        0.53
      ],
      "note": "field value where it ends"
    },
    "stops_at": [
      5,
      6
    ],
    "color": "#160F14",
    "band_px_ref": "≈ 20 at 1200 px",
    "halo": "blue 0.335–0.41 outside the stop"
  },
  "limits": "from must stay below to, and both inside 0.41–0.53 (the stops on either side). A band wider than ~0.07 reads as a dark fill, not an outline.",
  "implementation": "The darkest stop sits just under the mid-point of the blurred edge, where the profile is steepest, so it occupies few pixels and reads as a drawn outline; the blue halo is the ramp segment just outside it."
};
export const params={
  "from": 0.44,
  "to": 0.48,
  "stops_at": [
    5,
    6
  ],
  "color": "#160F14",
  "band_px_ref": "≈ 20 at 1200 px",
  "halo": "blue 0.335–0.41 outside the stop"
};
export const A={};

export const make=(P)=>({ stops:stops=>stops.map((st,i)=>i===P.stops_at[0]?[P.from,st[1]]:(i===P.stops_at[1]?[P.to,st[1]]:st)) });
export default make;
