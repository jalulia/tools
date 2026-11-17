/* C4 · Wrapped ribbon type — ref Promoter Loops
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  governed_by: ["components-craft"],
  "id": "c4-ribbon-type",
  "index": "C4",
  "order": 190,
  "title": "Wrapped ribbon type",
  "section": "motion-kinetic",
  "style": "display-specimen",
  "status": "canonical",
  "tags": [
    "Ribbon",
    "Weave",
    "Condensed caps"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Promoter Loops"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/1012",
    "previewHeight": 1012
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1.1,
      40
    ]
  },
  "text": "<p>Five strands of woven printed cotton tape at ±30° on a light desk stage, cream ink on black, photographed under one lamp.</p> <p>The weave is real: it alternates over and under at every crossing, and the strand on top casts a soft shadow onto the strand below. Every shadow offset is the world light rotated into the strand's own frame, so five rotated ribbons still share one sun — the earlier build gave each strand its own, and that is exactly what made it read as clip-art.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "light desk stage, radial falloff (not a flat fill)"
    },
    {
      "k": "Process",
      "v": "woven printed cotton tape, cream ink on black, photographed under ONE light from top-left · type-as-layout: PROMOTER · LOOPS runs along each band, the bands ARE the grid"
    },
    {
      "k": "Hardware",
      "v": "stitched selvedge (two rows of cream stitches), lengthwise fibre grain, over/under with the over strand casting a soft shadow onto the under strand"
    },
    {
      "k": "Skeleton",
      "v": "five ±30° strands on a 16cqw pitch, weave alternates per crossing."
    }
  ],
  "critique": {
    "reads_as": "Woven printed tape on a desk, photographed under one lamp.",
    "coupling": "The world light is rotated into each strand’s local frame, so five rotated ribbons still share one sun; the weave decides which strand casts and which receives.",
    "pass_order": "stage falloff → strands → weave order → printed type on the tape → stitching and fibre → inter-strand shadows last.",
    "operators": [
      "weave order",
      "rotated light",
      "selvedge stitch",
      "fibre grain"
    ],
    "why_it_survives": "Give each strand its own straight-down shadow and the picture acquires five suns — the exact fault this build fixed.",
    "faults": [
      "shadows were \"0 12px\" straight down inside ROTATED frames (each strand had its own sun)",
      "flat ground",
      "noise was isotropic (not fibre)",
      "stitches soft. Now every offset is the world light (dx 3, dy 6) rotated into the strand's local frame"
    ]
  }
});
